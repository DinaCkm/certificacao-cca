import { db } from "../db/connection.js";

// ── Verifica se candidato pode iniciar prova ──────────────────────────────────

export async function verificarDisponibilidadeProva(userId: number) {
  // Busca processo ativo
  const [processos] = await db.execute(
    `SELECT p.*, ct.slug as cert_slug
     FROM candidato_processos p
     JOIN certification_types ct ON ct.id = p.certification_type_id
     WHERE p.user_id = ? AND p.status_geral NOT IN ('concluido','encerrado')
     ORDER BY p.iniciado_em DESC LIMIT 1`,
    [userId]
  ) as any;

  if (!processos.length) {
    return { pode: false, motivo: "Nenhum processo ativo encontrado" };
  }

  const processo = processos[0];

  // Só Caminho B pode fazer prova
  if (processo.caminho_avaliacao !== "B") {
    return { pode: false, motivo: "Prova não aplicável para Caminho A" };
  }

  // Status deve permitir prova
  const statusPermitidos = ["prova", "prova1_liberada", "prova2_liberada"];
  if (!statusPermitidos.includes(processo.status_geral)) {
    return { pode: false, motivo: `Status atual (${processo.status_geral}) não permite iniciar prova` };
  }

  // Verifica tentativas já realizadas — BLOQUEIO NO SERVIDOR
  const [tentativas] = await db.execute(
    `SELECT COUNT(*) as total FROM tentativas_prova WHERE processo_id = ?`,
    [processo.id]
  ) as any;

  if (tentativas[0].total >= 2) {
    return { pode: false, motivo: "Número máximo de tentativas atingido" };
  }

  // Verifica se há tentativa em andamento
  const [andamento] = await db.execute(
    `SELECT id FROM tentativas_prova WHERE processo_id = ? AND status = 'em_andamento'`,
    [processo.id]
  ) as any;

  if (andamento.length > 0) {
    return { pode: true, tentativa_em_andamento: andamento[0].id, processo };
  }

  return { pode: true, tentativas_usadas: tentativas[0].total, processo };
}

// ── Inicia uma tentativa de prova ─────────────────────────────────────────────

export async function iniciarTentativa(userId: number) {
  const disponibilidade = await verificarDisponibilidadeProva(userId);

  if (!disponibilidade.pode) {
    throw new Error(disponibilidade.motivo);
  }

  // Se já tem tentativa em andamento, retorna ela
  if (disponibilidade.tentativa_em_andamento) {
    const [t] = await db.execute(
      "SELECT * FROM tentativas_prova WHERE id = ?",
      [disponibilidade.tentativa_em_andamento]
    ) as any;
    return { tentativa_id: t[0].id, numero_tentativa: t[0].numero_tentativa, nova: false };
  }

  const processo = disponibilidade.processo;
  const numeroTentativa = (disponibilidade.tentativas_usadas || 0) + 1;

  // Busca a prova da certificação
  const [provas] = await db.execute(
    `SELECT p.id FROM provas p
     JOIN certification_types ct ON ct.id = p.certification_type_id
     WHERE ct.slug = ? AND p.is_active = TRUE LIMIT 1`,
    [processo.cert_slug]
  ) as any;

  if (!provas.length) {
    throw new Error("Nenhuma prova configurada para esta certificação");
  }

  const provaId = provas[0].id;

  // Busca config da prova
  const [configs] = await db.execute(
    "SELECT * FROM prova_config WHERE cert_slug = ?",
    [processo.cert_slug]
  ) as any;

  const config = configs[0] || { duracao_minutos: 30 };

  // Calcula expiração
  const expiraEm = new Date();
  expiraEm.setMinutes(expiraEm.getMinutes() + config.duracao_minutos);

  // Cria a tentativa — UNIQUE KEY (processo_id, numero_tentativa) garante no banco
  const [result] = await db.execute(
    `INSERT INTO tentativas_prova
      (processo_id, user_id, prova_id, numero_tentativa, iniciada_em, status)
     VALUES (?, ?, ?, ?, NOW(), 'em_andamento')`,
    [processo.id, userId, provaId, numeroTentativa]
  ) as any;

  // Atualiza status do processo
  const novoStatus = numeroTentativa === 1 ? "prova1_andamento" : "prova2_andamento";
  await db.execute(
    "UPDATE candidato_processos SET status_geral = ?, updated_at = NOW() WHERE id = ?",
    [novoStatus, processo.id]
  );

  // Audit log
  await db.execute(
    `INSERT INTO audit_log (user_id, processo_id, acao, entidade, entidade_id, descricao, resultado)
     VALUES (?, ?, 'tentativa_iniciada', 'tentativas_prova', ?, ?, 'sucesso')`,
    [userId, processo.id, result.insertId, `Tentativa ${numeroTentativa} iniciada`]
  );

  return {
    tentativa_id: result.insertId,
    numero_tentativa: numeroTentativa,
    expira_em: expiraEm,
    nova: true
  };
}

// ── Busca questões SEM gabarito ───────────────────────────────────────────────

export async function buscarQuestoesSemGabarito(tentativaId: number, userId: number) {
  // Verifica que a tentativa pertence ao usuário
  const [tentativas] = await db.execute(
    `SELECT t.*, p.total_questoes
     FROM tentativas_prova t
     LEFT JOIN prova_config p ON p.cert_slug = (
       SELECT ct.slug FROM candidato_processos cp
       JOIN certification_types ct ON ct.id = cp.certification_type_id
       WHERE cp.id = t.processo_id
     )
     WHERE t.id = ? AND t.user_id = ? AND t.status = 'em_andamento'`,
    [tentativaId, userId]
  ) as any;

  if (!tentativas.length) {
    throw new Error("Tentativa não encontrada ou não está em andamento");
  }

  const tentativa = tentativas[0];
  const totalQuestoes = tentativa.total_questoes || 5;

  // Busca questões — SEM resposta_correta
  const [questoes] = await db.execute(
    `SELECT id, numero, enunciado, opcao_a, opcao_b, opcao_c, opcao_d
     FROM prova_questoes
     WHERE prova_id = ?
     ORDER BY RAND()
     LIMIT ?`,
    [tentativa.prova_id, totalQuestoes]
  ) as any;

  return {
    tentativa_id: tentativaId,
    numero_tentativa: tentativa.numero_tentativa,
    questoes: questoes.map((q: any) => ({
      id: q.id,
      numero: q.numero,
      enunciado: q.enunciado,
      opcoes: [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(Boolean),
    })),
  };
}

// ── Submete a prova e calcula resultado NO SERVIDOR ───────────────────────────

export async function submeterProva(
  tentativaId: number,
  userId: number,
  respostas: { questao_id: number; resposta: number }[]
) {
  // Verifica que tentativa pertence ao usuário e está em andamento
  const [tentativas] = await db.execute(
    `SELECT t.*, cp.id as processo_id, cp.certification_type_id, ct.slug as cert_slug
     FROM tentativas_prova t
     JOIN candidato_processos cp ON cp.id = t.processo_id
     JOIN certification_types ct ON ct.id = cp.certification_type_id
     WHERE t.id = ? AND t.user_id = ? AND t.status = 'em_andamento'`,
    [tentativaId, userId]
  ) as any;

  if (!tentativas.length) {
    throw new Error("Tentativa não encontrada, já encerrada ou não pertence ao usuário");
  }

  const tentativa = tentativas[0];

  // Busca gabarito completo (só no servidor)
  const [questoes] = await db.execute(
    `SELECT id, resposta_correta FROM prova_questoes WHERE prova_id = ?`,
    [tentativa.prova_id]
  ) as any;

  const gabarito: Record<number, number> = {};
  questoes.forEach((q: any) => { gabarito[q.id] = q.resposta_correta; });

  // Busca config para nota mínima
  const [configs] = await db.execute(
    "SELECT nota_minima FROM prova_config WHERE cert_slug = ?",
    [tentativa.cert_slug]
  ) as any;

  const notaMinima = configs[0]?.nota_minima || 60;

  // Calcula resultado NO SERVIDOR
  let acertos = 0;
  const totalQuestoes = questoes.length;

  const respostasParaSalvar = respostas.map(r => {
    const correto = gabarito[r.questao_id] === r.resposta;
    if (correto) acertos++;
    return { ...r, correto };
  });

  const percentual = totalQuestoes > 0 ? (acertos / totalQuestoes) * 100 : 0;
  const aprovado = percentual >= notaMinima;

  // Salva respostas em JSON
  const respostasJson = JSON.stringify(respostasParaSalvar);

  // Atualiza tentativa
  await db.execute(
    `UPDATE tentativas_prova SET
      status = 'finalizada',
      finalizada_em = NOW(),
      acertos = ?,
      total_questoes = ?,
      percentual = ?,
      aprovado = ?,
      respostas_json = ?
     WHERE id = ?`,
    [acertos, totalQuestoes, percentual, aprovado ? 1 : 0, respostasJson, tentativaId]
  );

  // Incrementa contador de tentativas no processo
  await db.execute(
    `UPDATE candidato_processos SET
      tentativas_prova = tentativas_prova + 1,
      updated_at = NOW()
     WHERE id = ?`,
    [tentativa.processo_id]
  );

  // Define próximo status
  let proximoStatus: string;
  let proximaEtapa: string;

  if (aprovado) {
    proximoStatus = tentativa.numero_tentativa === 1 ? "prova1_aprovada" : "prova2_aprovada";
    proximaEtapa = "agendamento";
  } else {
    if (tentativa.numero_tentativa === 1) {
      proximoStatus = "prova1_reprovada";
      proximaEtapa = "segunda_tentativa";
    } else {
      proximoStatus = "prova2_reprovada";
      proximaEtapa = "encerrado";
    }
  }

  // Atualiza status do processo
  const statusFinal = proximaEtapa === "encerrado" ? "encerrado" : proximoStatus;
  await db.execute(
    `UPDATE candidato_processos SET
      status_geral = ?,
      ${proximaEtapa === "encerrado" ? "encerrado_em = NOW()," : ""}
      updated_at = NOW()
     WHERE id = ?`,
    [statusFinal, tentativa.processo_id]
  );

  // Audit log
  const acao = aprovado
    ? `prova_aprovada_tentativa_${tentativa.numero_tentativa}`
    : tentativa.numero_tentativa === 2
      ? "prova_reprovada_processo_encerrado"
      : "prova_reprovada_primeira_tentativa";

  await db.execute(
    `INSERT INTO audit_log (user_id, processo_id, acao, entidade, entidade_id, dados_depois, descricao, resultado)
     VALUES (?, ?, ?, 'tentativas_prova', ?, ?, ?, 'sucesso')`,
    [
      userId,
      tentativa.processo_id,
      acao,
      tentativaId,
      JSON.stringify({ acertos, total: totalQuestoes, percentual, aprovado }),
      `${aprovado ? "Aprovado" : "Reprovado"} com ${percentual.toFixed(1)}% na tentativa ${tentativa.numero_tentativa}`
    ]
  );

  return {
    tentativa_id: tentativaId,
    numero_tentativa: tentativa.numero_tentativa,
    acertos,
    total_questoes: totalQuestoes,
    percentual,
    aprovado,
    nota_minima: notaMinima,
    proxima_etapa: proximaEtapa,
    proximo_status: proximoStatus,
  };
}

// ── Histórico de tentativas ───────────────────────────────────────────────────

export async function buscarHistoricoTentativas(userId: number) {
  const [rows] = await db.execute(
    `SELECT t.id, t.numero_tentativa, t.status, t.iniciada_em, t.finalizada_em,
            t.acertos, t.total_questoes, t.percentual, t.aprovado
     FROM tentativas_prova t
     JOIN candidato_processos cp ON cp.id = t.processo_id
     WHERE cp.user_id = ?
     ORDER BY t.iniciada_em DESC`,
    [userId]
  ) as any;

  return rows;
}
