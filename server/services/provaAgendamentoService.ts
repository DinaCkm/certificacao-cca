import { db } from "../db/connection.js";
import { criarSalaDaily, gerarTokenReuniao, excluirSalaDaily } from "./dailyService.js";

const LIMITE_VIOLACOES = 3;

// ── Busca o processo ativo do candidato que já pode agendar/fazer prova ──────
async function buscarProcessoElegivel(userId: number) {
  const [processos] = await db.execute(
    `SELECT p.*, ct.slug as cert_slug, ct.nome as cert_nome
     FROM candidato_processos p
     JOIN certification_types ct ON ct.id = p.certification_type_id
     WHERE p.user_id = ? AND p.status_geral NOT IN ('concluido','encerrado')
     ORDER BY p.iniciado_em DESC LIMIT 1`,
    [userId]
  ) as any;

  if (!processos.length) {
    throw new Error("Nenhum processo ativo encontrado");
  }
  const processo = processos[0];
  if (processo.caminho_avaliacao !== "B") {
    throw new Error("Agendamento de prova não aplicável para Caminho A");
  }
  const statusPermitidos = ["prova", "prova1_liberada", "prova2_liberada", "prova1_reprovada"];
  if (!statusPermitidos.includes(processo.status_geral)) {
    throw new Error(`Status atual (${processo.status_geral}) não permite agendar prova`);
  }
  return processo;
}

// ── Busca o agendamento de prova atual do candidato (para a sala) ────────────
export async function buscarMeuAgendamento(userId: number) {
  const [rows] = await db.execute(
    `SELECT a.id as agendamento_id, a.sala_id, a.status as agendamento_status,
            s.data_hora, s.duracao_minutos, s.status as sala_status,
            ct.nome as cert_nome
     FROM agendamentos_prova a
     JOIN salas_prova s ON s.id = a.sala_id
     JOIN certification_types ct ON ct.id = s.certification_type_id
     WHERE a.user_id = ? AND a.status IN ('agendado','presente') AND s.status != 'cancelada'
     ORDER BY s.data_hora ASC LIMIT 1`,
    [userId]
  ) as any;

  if (!rows.length) return null;
  return rows[0];
}

// ── Lista salas com vaga para a certificação do candidato ────────────────────
export async function listarSalasDisponiveis(userId: number) {
  const processo = await buscarProcessoElegivel(userId);

  const [salas] = await db.execute(
    `SELECT s.id, s.data_hora, s.duracao_minutos, s.capacidade_maxima, s.status,
            (SELECT COUNT(*) FROM agendamentos_prova a
             WHERE a.sala_id = s.id AND a.status IN ('agendado','presente')) as ocupadas
     FROM salas_prova s
     WHERE s.certification_type_id = ?
       AND s.data_hora > NOW()
       AND s.status = 'agendada'
     ORDER BY s.data_hora ASC`,
    [processo.certification_type_id]
  ) as any;

  return {
    processo_id: processo.id,
    cert_nome: processo.cert_nome,
    salas: salas
      .filter((s: any) => s.ocupadas < s.capacidade_maxima)
      .map((s: any) => ({
        id: s.id,
        data_hora: s.data_hora,
        duracao_minutos: s.duracao_minutos,
        vagas_disponiveis: s.capacidade_maxima - s.ocupadas,
        capacidade_maxima: s.capacidade_maxima,
      })),
  };
}

// ── Candidato agenda uma sala ─────────────────────────────────────────────────
export async function agendarProva(userId: number, salaId: number) {
  const processo = await buscarProcessoElegivel(userId);

  // Já tem agendamento ativo para este processo?
  const [existentes] = await db.execute(
    `SELECT id FROM agendamentos_prova WHERE processo_id = ? AND status = 'agendado'`,
    [processo.id]
  ) as any;
  if (existentes.length > 0) {
    throw new Error("Você já possui um agendamento de prova ativo");
  }

  const [salas] = await db.execute(
    `SELECT s.*, (SELECT COUNT(*) FROM agendamentos_prova a
                  WHERE a.sala_id = s.id AND a.status IN ('agendado','presente')) as ocupadas
     FROM salas_prova s WHERE s.id = ? FOR UPDATE`,
    [salaId]
  ) as any;

  if (!salas.length) throw new Error("Sala não encontrada");
  const sala = salas[0];

  if (sala.status !== "agendada") throw new Error("Sala não está mais disponível");
  if (sala.ocupadas >= sala.capacidade_maxima) throw new Error("Sala sem vagas disponíveis");
  if (sala.certification_type_id !== processo.certification_type_id) {
    throw new Error("Sala não pertence à certificação deste processo");
  }

  await db.execute(
    `INSERT INTO agendamentos_prova (sala_id, processo_id, user_id, status)
     VALUES (?, ?, ?, 'agendado')`,
    [salaId, processo.id, userId]
  );

  // Cria a sala no Daily.co no primeiro agendamento (lazy)
  if (!sala.daily_room_name) {
    const { daily_room_name, daily_room_url } = await criarSalaDaily(
      sala.id,
      sala.capacidade_maxima,
      new Date(sala.data_hora),
      sala.duracao_minutos
    );
    await db.execute(
      `UPDATE salas_prova SET daily_room_name = ?, daily_room_url = ? WHERE id = ?`,
      [daily_room_name, daily_room_url, sala.id]
    );
  }

  await db.execute(
    `INSERT INTO audit_log (user_id, processo_id, acao, entidade, entidade_id, descricao, resultado)
     VALUES (?, ?, 'prova_agendada', 'salas_prova', ?, ?, 'sucesso')`,
    [userId, processo.id, salaId, `Prova agendada para ${sala.data_hora}`]
  );

  return { sala_id: salaId, data_hora: sala.data_hora, duracao_minutos: sala.duracao_minutos, cert_nome: processo.cert_nome };
}

// ── Candidato entra na sala no horário da prova ───────────────────────────────
export async function entrarNaSalaProva(userId: number, salaId: number, userName: string) {
  const [agendamentos] = await db.execute(
    `SELECT a.*, s.data_hora, s.duracao_minutos, s.daily_room_name, s.daily_room_url, s.status as sala_status,
            s.capacidade_maxima
     FROM agendamentos_prova a
     JOIN salas_prova s ON s.id = a.sala_id
     WHERE a.sala_id = ? AND a.user_id = ?`,
    [salaId, userId]
  ) as any;

  if (!agendamentos.length) throw new Error("Você não possui agendamento nesta sala");
  const ag = agendamentos[0];

  if (ag.sala_status === "cancelada") throw new Error("Esta sala foi cancelada");
  if (!ag.daily_room_name) throw new Error("Sala de vídeo ainda não foi criada");

  const inicio = new Date(ag.data_hora).getTime();
  const agora = Date.now();
  if (agora < inicio - 15 * 60 * 1000) {
    throw new Error("Ainda não é possível entrar — a sala libera 15 minutos antes do horário");
  }

  // Cria/recupera a tentativa de prova vinculada à sala
  const { iniciarTentativa } = await import("./provaService.js");
  const tentativa = await iniciarTentativa(userId);
  await db.execute(`UPDATE tentativas_prova SET sala_id = ? WHERE id = ?`, [salaId, tentativa.tentativa_id]);

  await db.execute(`UPDATE agendamentos_prova SET status = 'presente' WHERE id = ?`, [ag.id]);

  if (ag.sala_status === "agendada") {
    await db.execute(`UPDATE salas_prova SET status = 'em_andamento' WHERE id = ?`, [salaId]);
  }

  const expUnix = Math.floor(inicio / 1000) + (ag.duracao_minutos + 30) * 60;
  const token = await gerarTokenReuniao(ag.daily_room_name, userName, false, expUnix);

  await db.execute(
    `INSERT INTO audit_log (user_id, acao, entidade, entidade_id, descricao, resultado)
     VALUES (?, 'prova_sala_acesso', 'salas_prova', ?, ?, 'sucesso')`,
    [userId, salaId, `Candidato ${userName} entrou na sala de prova`]
  );

  return {
    tentativa_id: tentativa.tentativa_id,
    daily_room_url: ag.daily_room_url,
    daily_token: token,
  };
}

// ── Fiscal/admin entra na sala para monitorar ao vivo ─────────────────────────
export async function entrarComoFiscal(salaId: number, userName: string) {
  const [salas] = await db.execute(`SELECT * FROM salas_prova WHERE id = ?`, [salaId]) as any;
  if (!salas.length) throw new Error("Sala não encontrada");
  const sala = salas[0];
  if (!sala.daily_room_name) throw new Error("Sala de vídeo ainda não foi criada (nenhum candidato agendado)");

  const expUnix = Math.floor(new Date(sala.data_hora).getTime() / 1000) + (sala.duracao_minutos + 30) * 60;
  const token = await gerarTokenReuniao(sala.daily_room_name, userName, true, expUnix);

  return { daily_room_url: sala.daily_room_url, daily_token: token };
}

// ── Registra violação (troca de aba / saída de fullscreen) ───────────────────
export async function registrarViolacao(tentativaId: number, userId: number, tipo: "troca_aba" | "saida_fullscreen") {
  const [tentativas] = await db.execute(
    `SELECT * FROM tentativas_prova WHERE id = ? AND user_id = ? AND status = 'em_andamento'`,
    [tentativaId, userId]
  ) as any;
  if (!tentativas.length) throw new Error("Tentativa não encontrada ou não está em andamento");

  await db.execute(`INSERT INTO violacoes_prova (tentativa_id, tipo) VALUES (?, ?)`, [tentativaId, tipo]);
  await db.execute(`UPDATE tentativas_prova SET violacoes_count = violacoes_count + 1 WHERE id = ?`, [tentativaId]);

  const [rows] = await db.execute(`SELECT violacoes_count FROM tentativas_prova WHERE id = ?`, [tentativaId]) as any;
  const violacoesCount = rows[0].violacoes_count;

  let anulada = false;
  if (violacoesCount >= LIMITE_VIOLACOES) {
    await anularTentativa(tentativaId, `${LIMITE_VIOLACOES} violações de saída da tela da prova`);
    anulada = true;
  }

  return { violacoes_count: violacoesCount, limite: LIMITE_VIOLACOES, anulada };
}

// ── Anula uma tentativa (automático por violações, ou manual pelo admin) ──────
export async function anularTentativa(tentativaId: number, motivo: string) {
  await db.execute(
    `UPDATE tentativas_prova
     SET status = 'anulada', anulada = 1, anulada_motivo = ?, anulada_em = NOW(), finalizada_em = NOW()
     WHERE id = ?`,
    [motivo, tentativaId]
  );

  await db.execute(
    `INSERT INTO audit_log (acao, entidade, entidade_id, descricao, resultado)
     VALUES ('prova_anulada', 'tentativas_prova', ?, ?, 'sucesso')`,
    [tentativaId, `Tentativa anulada: ${motivo}`]
  );
}

// ── Agenda administrativa (admin/gestor/fiscal) ───────────────────────────────
export async function listarAgendaAdmin() {
  const [salas] = await db.execute(
    `SELECT s.id, s.data_hora, s.duracao_minutos, s.capacidade_maxima, s.status,
            s.daily_room_name, ct.nome as cert_nome, u.full_name as fiscal_nome,
            (SELECT COUNT(*) FROM agendamentos_prova a WHERE a.sala_id = s.id AND a.status IN ('agendado','presente')) as ocupadas
     FROM salas_prova s
     JOIN certification_types ct ON ct.id = s.certification_type_id
     LEFT JOIN users u ON u.id = s.fiscal_id
     ORDER BY s.data_hora DESC`
  ) as any;

  return salas;
}

export async function listarCandidatosDaSala(salaId: number) {
  const [rows] = await db.execute(
    `SELECT a.id, a.status, u.full_name, u.email,
            t.id as tentativa_id, t.violacoes_count, t.anulada, t.status as tentativa_status
     FROM agendamentos_prova a
     JOIN users u ON u.id = a.user_id
     LEFT JOIN tentativas_prova t ON t.sala_id = a.sala_id AND t.user_id = a.user_id
     WHERE a.sala_id = ?`,
    [salaId]
  ) as any;
  return rows;
}

export async function criarSalaProva(dados: {
  certification_type_id: number;
  data_hora: string;
  duracao_minutos: number;
  capacidade_maxima: number;
  fiscal_id: number | null;
}) {
  // Passamos um objeto Date (não a string ISO crua) para que o driver mysql2
  // serialize corretamente respeitando o timezone "-03:00" já configurado na conexão.
  const [result] = await db.execute(
    `INSERT INTO salas_prova (certification_type_id, data_hora, duracao_minutos, capacidade_maxima, fiscal_id)
     VALUES (?, ?, ?, ?, ?)`,
    [dados.certification_type_id, new Date(dados.data_hora), dados.duracao_minutos, dados.capacidade_maxima, dados.fiscal_id]
  ) as any;
  return { id: result.insertId };
}

export async function cancelarSalaProva(salaId: number) {
  const [salas] = await db.execute(`SELECT * FROM salas_prova WHERE id = ?`, [salaId]) as any;
  if (!salas.length) throw new Error("Sala não encontrada");
  const sala = salas[0];

  const [ocupados] = await db.execute(
    `SELECT COUNT(*) as total FROM agendamentos_prova WHERE sala_id = ? AND status IN ('agendado','presente')`,
    [salaId]
  ) as any;
  if (ocupados[0].total > 0) {
    throw new Error("Sala possui candidatos agendados — cancele os agendamentos antes");
  }

  if (sala.daily_room_name) {
    await excluirSalaDaily(sala.daily_room_name);
  }
  await db.execute(`UPDATE salas_prova SET status = 'cancelada' WHERE id = ?`, [salaId]);
}
