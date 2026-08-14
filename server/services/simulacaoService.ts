import crypto from "crypto";
import { db } from "../db/connection.js";

// ── Verificação de posse da tentativa ─────────────────────────────────────────
// Tentativa do mural (user_id preenchido): só o dono, autenticado, pode
// consultar/responder/finalizar. Tentativa pública (user_id nulo, lead
// anônimo): exige o access_token opaco gerado na criação — o ID sequencial
// sozinho NUNCA autoriza nada, para não permitir que alguém veja ou altere
// a tentativa de outra pessoa só adivinhando/incrementando o número.
function verificarPosse(tentativa: any, userId?: number, accessToken?: string) {
  if (tentativa.user_id) {
    if (!userId || tentativa.user_id !== userId) {
      throw new Error("Você não tem permissão para acessar esta simulação");
    }
  } else {
    if (!accessToken || tentativa.access_token !== accessToken) {
      throw new Error("Token de acesso inválido para esta simulação");
    }
  }
}

// ── Admin: CRUD da configuração de simulação por certificação ────────────────

export async function listarSimulacoesAdmin() {
  const [rows] = await db.execute(
    `SELECT sc.*, ct.nome as cert_nome, ct.slug as cert_slug,
            (SELECT COUNT(*) FROM prova_questoes pq JOIN provas p ON p.id = pq.prova_id WHERE p.certification_type_id = sc.certification_type_id AND pq.eh_simulacao = 1) as questoes_no_banco
     FROM simulacoes_config sc
     JOIN certification_types ct ON ct.id = sc.certification_type_id
     ORDER BY ct.nome`
  ) as any;
  return rows;
}

export async function salvarSimulacaoAdmin(dados: {
  cert_slug: string;
  titulo: string;
  quantidade_questoes: number;
  ativa: boolean;
}) {
  const [certs] = await db.execute(`SELECT id FROM certification_types WHERE slug = ?`, [dados.cert_slug]) as any;
  if (!certs.length) throw new Error("Certificação não encontrada");
  const certId = certs[0].id;

  const [existentes] = await db.execute(`SELECT id FROM simulacoes_config WHERE certification_type_id = ?`, [certId]) as any;

  if (existentes.length) {
    await db.execute(
      `UPDATE simulacoes_config SET titulo = ?, quantidade_questoes = ?, ativa = ? WHERE certification_type_id = ?`,
      [dados.titulo, dados.quantidade_questoes, dados.ativa ? 1 : 0, certId]
    );
    return { id: existentes[0].id };
  }

  const [result] = await db.execute(
    `INSERT INTO simulacoes_config (certification_type_id, titulo, quantidade_questoes, ativa) VALUES (?, ?, ?, ?)`,
    [certId, dados.titulo, dados.quantidade_questoes, dados.ativa ? 1 : 0]
  ) as any;
  return { id: result.insertId };
}

export async function excluirSimulacaoAdmin(id: number) {
  await db.execute(`DELETE FROM simulacoes_config WHERE id = ?`, [id]);
}

// ── Simulações ativas (para o seletor de certificação na tela pública) ───────

export async function listarSimulacoesAtivas() {
  const [rows] = await db.execute(
    `SELECT sc.id, sc.titulo, sc.quantidade_questoes, ct.slug as cert_slug, ct.nome as cert_nome
     FROM simulacoes_config sc
     JOIN certification_types ct ON ct.id = sc.certification_type_id
     WHERE sc.ativa = 1
     ORDER BY ct.nome`
  ) as any;
  return rows;
}

// ── Inicia uma tentativa (pública ou do mural) ────────────────────────────────

export async function iniciarSimulacao(dados: {
  certSlug: string;
  origem: "publica" | "mural";
  userId?: number;
  leadNome?: string;
  leadEmail?: string;
}) {
  const [configs] = await db.execute(
    `SELECT sc.* FROM simulacoes_config sc
     JOIN certification_types ct ON ct.id = sc.certification_type_id
     WHERE ct.slug = ? AND sc.ativa = 1`,
    [dados.certSlug]
  ) as any;
  if (!configs.length) throw new Error("Nenhuma simulação ativa para esta certificação");
  const config = configs[0];

  // Se for do mural, retoma tentativa em andamento se já existir
  if (dados.origem === "mural" && dados.userId) {
    const [emAndamento] = await db.execute(
      `SELECT id FROM simulacoes_tentativas WHERE simulacao_id = ? AND user_id = ? AND status = 'em_andamento'`,
      [config.id, dados.userId]
    ) as any;
    if (emAndamento.length) {
      return { tentativa_id: emAndamento[0].id, retomada: true, access_token: null };
    }
  }

  // Sorteia SOMENTE do banco de questões marcado para simulação — nunca das
  // questões que podem cair na prova oficial (eh_simulacao = 1 é um banco
  // deliberadamente separado, curado pelo admin).
  // LIMIT interpolado diretamente (sanitizado com Number()) — ver nota
  // equivalente em provaService.ts.
  const limiteSeguro = Number(config.quantidade_questoes) || 5;
  const [questoes] = await db.execute(
    `SELECT pq.id FROM prova_questoes pq
     JOIN provas p ON p.id = pq.prova_id
     WHERE p.certification_type_id = ? AND pq.eh_simulacao = 1
     ORDER BY RAND() LIMIT ${limiteSeguro}`,
    [config.certification_type_id]
  ) as any;

  if (!questoes.length) {
    throw new Error("Nenhuma questão de simulação cadastrada para esta certificação ainda");
  }

  const questoesIds = questoes.map((q: any) => q.id);
  const accessToken = dados.origem === "publica" ? crypto.randomBytes(24).toString("hex") : null;

  const [result] = await db.execute(
    `INSERT INTO simulacoes_tentativas
      (simulacao_id, user_id, lead_nome, lead_email, questoes_json, total_questoes, origem, access_token)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [config.id, dados.userId || null, dados.leadNome || null, dados.leadEmail || null,
     JSON.stringify(questoesIds), questoesIds.length, dados.origem, accessToken]
  ) as any;

  return { tentativa_id: result.insertId, retomada: false, access_token: accessToken };
}

// ── Busca o estado atual de uma tentativa (questões + respostas já dadas) ────

export async function buscarTentativa(tentativaId: number, userId?: number, accessToken?: string) {
  const [rows] = await db.execute(`SELECT * FROM simulacoes_tentativas WHERE id = ?`, [tentativaId]) as any;
  if (!rows.length) throw new Error("Simulação não encontrada");
  const tentativa = rows[0];
  verificarPosse(tentativa, userId, accessToken);

  const questoesIds: number[] = Array.isArray(tentativa.questoes_json) ? tentativa.questoes_json : JSON.parse(tentativa.questoes_json);
  const [questoes] = await db.execute(
    `SELECT id, numero, enunciado, opcao_a, opcao_b, opcao_c, opcao_d FROM prova_questoes WHERE id IN (?)`,
    [questoesIds]
  ) as any;

  // Mantém a ordem sorteada original
  const questoesOrdenadas = questoesIds.map((id) => questoes.find((q: any) => q.id === id)).filter(Boolean);

  const respostas = tentativa.respostas_json
    ? (Array.isArray(tentativa.respostas_json) ? tentativa.respostas_json : JSON.parse(tentativa.respostas_json))
    : [];

  return {
    tentativa_id: tentativa.id,
    status: tentativa.status,
    total_questoes: tentativa.total_questoes,
    acertos: tentativa.acertos,
    questoes: questoesOrdenadas.map((q: any) => ({
      id: q.id, numero: q.numero, enunciado: q.enunciado,
      opcoes: [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(Boolean),
    })),
    respostas,
  };
}

// ── Responde uma questão (revela na hora se acertou + explicação) ────────────

export async function responderSimulacao(tentativaId: number, questaoId: number, resposta: number, userId?: number, accessToken?: string) {
  const [rows] = await db.execute(`SELECT * FROM simulacoes_tentativas WHERE id = ?`, [tentativaId]) as any;
  if (!rows.length) throw new Error("Simulação não encontrada");
  const tentativa = rows[0];
  verificarPosse(tentativa, userId, accessToken);
  if (tentativa.status !== "em_andamento") throw new Error("Esta simulação já foi finalizada");

  // Confirma que a questão realmente pertence a esta tentativa (evita que
  // alguém injete um questao_id fora do sorteio original pra tentar ler
  // gabarito de outra questão via a resposta desta rota)
  const questoesIds: number[] = Array.isArray(tentativa.questoes_json) ? tentativa.questoes_json : JSON.parse(tentativa.questoes_json);
  if (!questoesIds.includes(questaoId)) {
    throw new Error("Esta questão não faz parte desta simulação");
  }

  const [questoes] = await db.execute(
    `SELECT resposta_correta, explicacao FROM prova_questoes WHERE id = ?`, [questaoId]
  ) as any;
  if (!questoes.length) throw new Error("Questão não encontrada");
  const correta = questoes[0].resposta_correta === resposta;

  const respostasAtuais = tentativa.respostas_json
    ? (Array.isArray(tentativa.respostas_json) ? tentativa.respostas_json : JSON.parse(tentativa.respostas_json))
    : [];
  const semDuplicata = respostasAtuais.filter((r: any) => r.questao_id !== questaoId);
  semDuplicata.push({ questao_id: questaoId, resposta, correta });

  await db.execute(
    `UPDATE simulacoes_tentativas SET respostas_json = ? WHERE id = ?`,
    [JSON.stringify(semDuplicata), tentativaId]
  );

  return { correta, resposta_correta: questoes[0].resposta_correta, explicacao: questoes[0].explicacao };
}

// ── Finaliza e calcula o resultado ────────────────────────────────────────────

export async function finalizarSimulacao(tentativaId: number, userId?: number, accessToken?: string) {
  const [rows] = await db.execute(`SELECT * FROM simulacoes_tentativas WHERE id = ?`, [tentativaId]) as any;
  if (!rows.length) throw new Error("Simulação não encontrada");
  const tentativa = rows[0];
  verificarPosse(tentativa, userId, accessToken);

  const respostas = tentativa.respostas_json
    ? (Array.isArray(tentativa.respostas_json) ? tentativa.respostas_json : JSON.parse(tentativa.respostas_json))
    : [];
  const acertos = respostas.filter((r: any) => r.correta).length;

  await db.execute(
    `UPDATE simulacoes_tentativas SET status = 'finalizada', acertos = ?, finalizada_em = NOW() WHERE id = ?`,
    [acertos, tentativaId]
  );

  return { acertos, total_questoes: tentativa.total_questoes };
}

// ── Desempenho por eixo de conhecimento (Fase 4) ──────────────────────────────
export async function calcularDesempenhoPorEixoSimulacao(tentativaId: number, userId?: number, accessToken?: string) {
  const [tentativas] = await db.execute(
    `SELECT * FROM simulacoes_tentativas WHERE id = ? AND status = 'finalizada'`,
    [tentativaId]
  ) as any;
  if (!tentativas.length) throw new Error("Simulação não encontrada ou ainda não finalizada");
  verificarPosse(tentativas[0], userId, accessToken);

  const respostas: { questao_id: number; correta: boolean }[] = Array.isArray(tentativas[0].respostas_json)
    ? tentativas[0].respostas_json
    : JSON.parse(tentativas[0].respostas_json || "[]");

  if (!respostas.length) return { eixos: [] };

  const questaoIds = respostas.map((r) => r.questao_id);
  const [questoes] = await db.execute(
    `SELECT pq.id, pq.eixo_conhecimento_id, e.nome as eixo_nome
     FROM prova_questoes pq
     LEFT JOIN eixos_conhecimento e ON e.id = pq.eixo_conhecimento_id
     WHERE pq.id IN (?)`,
    [questaoIds]
  ) as any;

  const eixoPorQuestao: Record<number, { id: number | null; nome: string }> = {};
  questoes.forEach((q: any) => {
    eixoPorQuestao[q.id] = { id: q.eixo_conhecimento_id, nome: q.eixo_nome || "Sem eixo definido" };
  });

  const agregados: Record<string, { eixo_id: number | null; nome: string; acertos: number; total: number }> = {};
  respostas.forEach((r) => {
    const eixo = eixoPorQuestao[r.questao_id] || { id: null, nome: "Sem eixo definido" };
    const chave = String(eixo.id ?? "sem_eixo");
    if (!agregados[chave]) agregados[chave] = { eixo_id: eixo.id, nome: eixo.nome, acertos: 0, total: 0 };
    agregados[chave].total++;
    if (r.correta) agregados[chave].acertos++;
  });

  const eixos = Object.values(agregados)
    .map((e) => ({ ...e, percentual: e.total > 0 ? Math.round((e.acertos / e.total) * 100) : 0 }))
    .sort((a, b) => a.percentual - b.percentual);

  return { eixos };
}

// ── Retoma a simulação em andamento do candidato logado (para o mural) ───────

export async function buscarMinhaSimulacaoEmAndamento(userId: number, certSlug: string) {
  const [rows] = await db.execute(
    `SELECT st.id FROM simulacoes_tentativas st
     JOIN simulacoes_config sc ON sc.id = st.simulacao_id
     JOIN certification_types ct ON ct.id = sc.certification_type_id
     WHERE st.user_id = ? AND ct.slug = ? AND st.status = 'em_andamento'
     ORDER BY st.iniciada_em DESC LIMIT 1`,
    [userId, certSlug]
  ) as any;
  return rows.length ? rows[0].id : null;
}
