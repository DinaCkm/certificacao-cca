// Autoteste de segurança das rotas de simulação — roda UMA VEZ no boot do
// servidor (gated por RUN_SELFTEST_SIMULACAO=true), exercita as rotas HTTP
// reais via self-fetch para localhost (mesmo caminho que um cliente real
// percorre, incluindo middlewares), cria e depois APAGA todos os dados de
// teste que gerar. Existe só para validar o PR
// fix/simulation-authorization-and-question-pool antes do merge ser
// considerado testado em staging — remover depois de confirmado.

import { db } from "./db/connection.js";
import { generateToken } from "./services/authService.js";
import bcrypt from "bcryptjs";

interface ResultadoTeste { nome: string; passou: boolean; detalhe?: string }

export async function runSimulacaoSecuritySelfTest(port: number | string) {
  if (process.env.RUN_SELFTEST_SIMULACAO !== "true") return;

  const base = `http://localhost:${port}`;
  const resultados: ResultadoTeste[] = [];
  const idsParaLimpar = {
    users: [] as number[],
    certificationTypes: [] as number[],
    provas: [] as number[],
    questoes: [] as number[],
    simulacoesConfig: [] as number[],
    tentativas: [] as number[],
  };

  function registrar(nome: string, passou: boolean, detalhe?: string) {
    resultados.push({ nome, passou, detalhe });
    console.log(`${passou ? "✅ PASSOU" : "❌ FALHOU"} — ${nome}${detalhe ? ` (${detalhe})` : ""}`);
  }

  try {
    console.log("\n🧪 ═══ AUTOTESTE DE SEGURANÇA — SIMULAÇÃO (temporário) ═══");

    // ── Setup: 2 usuários candidatos de teste ────────────────────────────────
    const [roles] = await db.execute(`SELECT id FROM roles WHERE code = 'candidato'`) as any;
    const roleId = roles[0].id;
    const hash = await bcrypt.hash("selftest-" + Date.now(), 4);
    const sufixo = Date.now();

    const [uA] = await db.execute(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.a.${sufixo}@teste.local`, hash, "Selftest Candidato A", `SELFA${sufixo}`, roleId]
    ) as any;
    const userAId = uA.insertId;
    idsParaLimpar.users.push(userAId);

    const [uB] = await db.execute(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.b.${sufixo}@teste.local`, hash, "Selftest Candidato B", `SELFB${sufixo}`, roleId]
    ) as any;
    const userBId = uB.insertId;
    idsParaLimpar.users.push(userBId);

    const tokenA = generateToken({ userId: userAId, email: `selftest.a.${sufixo}@teste.local`, role: "candidato", roleId });
    const tokenB = generateToken({ userId: userBId, email: `selftest.b.${sufixo}@teste.local`, role: "candidato", roleId });

    // ── Setup: certificação + prova + 1 questão de simulação + 1 oficial ────
    const slugTemp = `selftest-${sufixo}`;
    const [certR] = await db.execute(
      `INSERT INTO certification_types (slug, nome, numero, taxa_analise, taxa_emissao, documentos_exigidos, status)
       VALUES (?, ?, 999999, 0, 0, '[]', 'ativa')`,
      [slugTemp, "Selftest Temporária"]
    ) as any;
    const certId = certR.insertId;
    idsParaLimpar.certificationTypes.push(certId);

    const [provaR] = await db.execute(
      `INSERT INTO provas (certification_type_id, titulo) VALUES (?, ?)`,
      [certId, "Prova Selftest"]
    ) as any;
    const provaId = provaR.insertId;
    idsParaLimpar.provas.push(provaId);

    const [qSimR] = await db.execute(
      `INSERT INTO prova_questoes (prova_id, numero, enunciado, opcao_a, opcao_b, resposta_correta, eh_simulacao)
       VALUES (?, 1, 'Questão de simulação (selftest)', 'A', 'B', 0, 1)`,
      [provaId]
    ) as any;
    idsParaLimpar.questoes.push(qSimR.insertId);

    const [qOficialR] = await db.execute(
      `INSERT INTO prova_questoes (prova_id, numero, enunciado, opcao_a, opcao_b, resposta_correta, eh_simulacao)
       VALUES (?, 2, 'Questão oficial (selftest)', 'A', 'B', 0, 0)`,
      [provaId]
    ) as any;
    idsParaLimpar.questoes.push(qOficialR.insertId);

    const [simConfigR] = await db.execute(
      `INSERT INTO simulacoes_config (certification_type_id, titulo, quantidade_questoes, ativa) VALUES (?, 'Selftest', 1, 1)`,
      [certId]
    ) as any;
    idsParaLimpar.simulacoesConfig.push(simConfigR.insertId);

    // ── TESTE 1: mural — B não pode acessar tentativa de A ──────────────────
    const iniciarMuralRes = await fetch(`${base}/api/simulacao/iniciar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ cert_slug: slugTemp }),
    });
    const iniciarMuralData: any = await iniciarMuralRes.json();
    const tentativaMuralId = iniciarMuralData.tentativa_id;
    if (tentativaMuralId) idsParaLimpar.tentativas.push(tentativaMuralId);

    registrar("Mural: candidato A inicia simulação com sucesso", iniciarMuralRes.status === 201, `status ${iniciarMuralRes.status}`);

    const acessoComoB = await fetch(`${base}/api/simulacao/${tentativaMuralId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    registrar(
      "Mural: candidato B NÃO consegue acessar tentativa de A (deve ser 403)",
      acessoComoB.status === 403,
      `status ${acessoComoB.status}`
    );

    const acessoSemAuth = await fetch(`${base}/api/simulacao/${tentativaMuralId}`);
    registrar(
      "Mural: acesso sem autenticação NÃO consegue acessar tentativa de A (deve ser 403)",
      acessoSemAuth.status === 403,
      `status ${acessoSemAuth.status}`
    );

    const acessoComoA = await fetch(`${base}/api/simulacao/${tentativaMuralId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    registrar("Mural: o próprio dono (A) consegue acessar normalmente", acessoComoA.status === 200, `status ${acessoComoA.status}`);

    // ── TESTE 2: pública — token de acesso obrigatório ──────────────────────
    const iniciarPublicaRes = await fetch(`${base}/api/simulacao/iniciar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cert_slug: slugTemp, nome: "Lead Selftest", email: `lead.selftest.${sufixo}@teste.local` }),
    });
    const iniciarPublicaData: any = await iniciarPublicaRes.json();
    const tentativaPublicaId = iniciarPublicaData.tentativa_id;
    const accessToken = iniciarPublicaData.access_token;
    if (tentativaPublicaId) idsParaLimpar.tentativas.push(tentativaPublicaId);

    registrar(
      "Pública: inicia com sucesso e recebe access_token",
      iniciarPublicaRes.status === 201 && !!accessToken,
      `status ${iniciarPublicaRes.status}, token presente: ${!!accessToken}`
    );

    const acessoSemToken = await fetch(`${base}/api/simulacao/${tentativaPublicaId}`);
    registrar(
      "Pública: acesso SEM token é bloqueado (deve ser 403)",
      acessoSemToken.status === 403,
      `status ${acessoSemToken.status}`
    );

    const acessoTokenErrado = await fetch(`${base}/api/simulacao/${tentativaPublicaId}?token=token-invalido-de-propósito`);
    registrar(
      "Pública: acesso com token ERRADO é bloqueado (deve ser 403)",
      acessoTokenErrado.status === 403,
      `status ${acessoTokenErrado.status}`
    );

    const acessoTokenCerto = await fetch(`${base}/api/simulacao/${tentativaPublicaId}?token=${encodeURIComponent(accessToken)}`);
    registrar(
      "Pública: acesso com o token CORRETO funciona normalmente",
      acessoTokenCerto.status === 200,
      `status ${acessoTokenCerto.status}`
    );

    // ── TESTE 3: separação do banco de questões ──────────────────────────────
    const estadoPublica: any = await acessoTokenCerto.json();
    const questaoSorteadaId = estadoPublica.questoes?.[0]?.id;
    registrar(
      "Separação de banco: simulado sorteou a questão marcada eh_simulacao=1 (nunca a oficial)",
      questaoSorteadaId === qSimR.insertId,
      `sorteada=${questaoSorteadaId}, esperada=${qSimR.insertId}, oficial=${qOficialR.insertId}`
    );

    const [questoesProvaOficial] = await db.execute(
      `SELECT id FROM prova_questoes WHERE prova_id = ? AND eh_simulacao = 0`,
      [provaId]
    ) as any;
    const oficialExclusivaCorreta = questoesProvaOficial.length === 1 && questoesProvaOficial[0].id === qOficialR.insertId;
    registrar(
      "Separação de banco: sorteio da prova oficial exclui a questão marcada eh_simulacao=1",
      oficialExclusivaCorreta,
      `questões elegíveis pra prova oficial: ${JSON.stringify(questoesProvaOficial.map((q: any) => q.id))}`
    );

    // ── Resumo ────────────────────────────────────────────────────────────────
    const totalPassou = resultados.filter((r) => r.passou).length;
    console.log(`\n🧪 RESULTADO FINAL: ${totalPassou}/${resultados.length} testes passaram`);
    if (totalPassou === resultados.length) {
      console.log("✅✅✅ TODOS OS TESTES DE SEGURANÇA PASSARAM ✅✅✅");
    } else {
      console.log("❌❌❌ ALGUM TESTE FALHOU — REVISAR ANTES DE CONSIDERAR SEGURO ❌❌❌");
    }
    console.log("═══════════════════════════════════════════════════════\n");
  } catch (err) {
    console.error("❌ Erro inesperado durante o autoteste:", err);
  } finally {
    // ── Limpeza — remove TODOS os dados de teste criados ─────────────────────
    try {
      for (const id of idsParaLimpar.tentativas) await db.execute(`DELETE FROM simulacoes_tentativas WHERE id = ?`, [id]);
      for (const id of idsParaLimpar.simulacoesConfig) await db.execute(`DELETE FROM simulacoes_config WHERE id = ?`, [id]);
      for (const id of idsParaLimpar.questoes) await db.execute(`DELETE FROM prova_questoes WHERE id = ?`, [id]);
      for (const id of idsParaLimpar.provas) await db.execute(`DELETE FROM provas WHERE id = ?`, [id]);
      for (const id of idsParaLimpar.certificationTypes) await db.execute(`DELETE FROM certification_types WHERE id = ?`, [id]);
      for (const id of idsParaLimpar.users) await db.execute(`DELETE FROM users WHERE id = ?`, [id]);
      console.log("🧹 Dados de teste do autoteste removidos com sucesso");
    } catch (cleanupErr) {
      console.error("⚠️ Erro ao limpar dados do autoteste — verificar manualmente:", cleanupErr);
    }
  }
}
