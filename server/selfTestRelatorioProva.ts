// Autoteste do PR feat/exam-board-decision-and-process-report — roda uma vez
// no boot (gated por RUN_SELFTEST_RELATORIO=true), monta uma tentativa de
// prova finalizada realista e confirma que o relatório administrativo agrega
// tudo corretamente. Limpa os dados de teste no finally.

import { db } from "./db/connection.js";
import { generateToken } from "./services/authService.js";
import bcrypt from "bcryptjs";

interface ResultadoTeste { nome: string; passou: boolean; detalhe?: string }

export async function runRelatorioProvaSelfTest(port: number | string) {
  if (process.env.RUN_SELFTEST_RELATORIO !== "true") return;

  const base = `http://localhost:${port}`;
  const resultados: ResultadoTeste[] = [];

  function registrar(nome: string, passou: boolean, detalhe?: string) {
    resultados.push({ nome, passou, detalhe });
    console.log(`${passou ? "✅ PASSOU" : "❌ FALHOU"} — ${nome}${detalhe ? ` (${detalhe})` : ""}`);
  }

  const sufixo = Date.now();
  const cpfSufixo = String(sufixo).slice(-6);

  try {
    console.log("\n🧪 ═══ AUTOTESTE — RELATÓRIO DA PROVA OFICIAL (temporário) ═══");

    // Limpeza defensiva de resíduos de execuções anteriores
    const [orfaos] = await db.execute(`SELECT id FROM users WHERE email LIKE 'selftest.relatorio.%@teste.local'`) as any;
    for (const u of orfaos) await db.execute(`DELETE FROM users WHERE id = ?`, [u.id]);
    const [certsOrfaos] = await db.execute(`SELECT id FROM certification_types WHERE slug LIKE 'selftest-relatorio-%'`) as any;
    for (const c of certsOrfaos) {
      const [provasOrfas] = await db.execute(`SELECT id FROM provas WHERE certification_type_id = ?`, [c.id]) as any;
      for (const p of provasOrfas) {
        await db.execute(`DELETE FROM tentativas_prova WHERE prova_id = ?`, [p.id]);
        await db.execute(`DELETE FROM prova_questoes WHERE prova_id = ?`, [p.id]);
        await db.execute(`DELETE FROM provas WHERE id = ?`, [p.id]);
      }
      await db.execute(`DELETE FROM eixos_conhecimento WHERE certification_type_id = ?`, [c.id]);
      await db.execute(`DELETE FROM candidato_processos WHERE certification_type_id = ?`, [c.id]);
      await db.execute(`DELETE FROM certification_types WHERE id = ?`, [c.id]);
    }

    const [rolesRows] = await db.execute(`SELECT id FROM roles WHERE code = 'administrador'`) as any;
    const roleAdminId = rolesRows[0].id;
    const [rolesCandRows] = await db.execute(`SELECT id FROM roles WHERE code = 'candidato'`) as any;
    const roleCandidatoId = rolesCandRows[0].id;
    const hash = await bcrypt.hash("selftest", 4);

    const [uAdmin] = await db.execute(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.relatorio.admin.${sufixo}@teste.local`, hash, "Selftest Admin", `RA${cpfSufixo}`, roleAdminId]
    ) as any;
    const tokenAdmin = generateToken({ userId: uAdmin.insertId, email: `selftest.relatorio.admin.${sufixo}@teste.local`, role: "administrador", roleId: roleAdminId });

    const [uCand] = await db.execute(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.relatorio.cand.${sufixo}@teste.local`, hash, "Selftest Candidato Relatorio", `RC${cpfSufixo}`, roleCandidatoId]
    ) as any;

    const [certR] = await db.execute(
      `INSERT INTO certification_types (slug, nome, numero, taxa_analise, taxa_emissao, documentos_exigidos, status)
       VALUES (?, ?, 999997, 0, 0, '[]', 'ativa')`,
      [`selftest-relatorio-${sufixo}`, "Selftest Relatório"]
    ) as any;
    const certId = certR.insertId;

    const [eixoR] = await db.execute(
      `INSERT INTO eixos_conhecimento (certification_type_id, nome) VALUES (?, 'Eixo Selftest')`,
      [certId]
    ) as any;

    const [provaR] = await db.execute(`INSERT INTO provas (certification_type_id, titulo) VALUES (?, 'Prova Selftest Relatorio')`, [certId]) as any;
    const provaId = provaR.insertId;

    const [q1] = await db.execute(
      `INSERT INTO prova_questoes (prova_id, numero, enunciado, opcao_a, opcao_b, resposta_correta, eh_simulacao, eixo_conhecimento_id)
       VALUES (?, 1, 'Questão 1', 'A', 'B', 0, 0, ?)`,
      [provaId, eixoR.insertId]
    ) as any;
    const [q2] = await db.execute(
      `INSERT INTO prova_questoes (prova_id, numero, enunciado, opcao_a, opcao_b, resposta_correta, eh_simulacao, eixo_conhecimento_id)
       VALUES (?, 2, 'Questão 2', 'A', 'B', 0, 0, ?)`,
      [provaId, eixoR.insertId]
    ) as any;

    const [procR] = await db.execute(
      `INSERT INTO candidato_processos (user_id, certification_type_id, status_geral, candidato_nome, candidato_email)
       VALUES (?, ?, 'concluido', 'Selftest Candidato Relatorio', ?)`,
      [uCand.insertId, certId, `selftest.relatorio.cand.${sufixo}@teste.local`]
    ) as any;
    const processoId = procR.insertId;

    // Tentativa finalizada: 1 acerto, 1 erro — 50%
    const respostas = JSON.stringify([
      { questao_id: q1.insertId, resposta: 0, correto: true },
      { questao_id: q2.insertId, resposta: 1, correto: false },
    ]);
    await db.execute(
      `INSERT INTO tentativas_prova (processo_id, user_id, prova_id, numero_tentativa, status, acertos, total_questoes, percentual, aprovado, respostas_json, iniciada_em, finalizada_em)
       VALUES (?, ?, ?, 1, 'finalizada', 1, 2, 50.00, 0, ?, NOW(), NOW())`,
      [processoId, uCand.insertId, provaId, respostas]
    );

    // ── Chama o relatório via HTTP real ────────────────────────────────────
    const relRes = await fetch(`${base}/api/admin/prova-relatorio?cert_slug=selftest-relatorio-${sufixo}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const relData: any = await relRes.json();

    registrar("Relatório: responde 200", relRes.status === 200, `status ${relRes.status}`);
    registrar(
      "Relatório: resumo conta 1 tentativa, 0 aprovados, 1 reprovado",
      relData.resumo?.total_tentativas === 1 && relData.resumo?.total_aprovados === 0 && relData.resumo?.total_reprovados === 1,
      `resumo: ${JSON.stringify(relData.resumo)}`
    );
    registrar(
      "Relatório: taxa de aprovação calculada corretamente (0%)",
      relData.resumo?.taxa_aprovacao === 0,
      `taxa=${relData.resumo?.taxa_aprovacao}`
    );
    const tentativaNoRelatorio = relData.tentativas?.find((t: any) => t.id);
    registrar(
      "Relatório: tentativa aparece na lista com nome do candidato correto",
      tentativaNoRelatorio?.candidato_nome === "Selftest Candidato Relatorio",
      `encontrado: ${tentativaNoRelatorio?.candidato_nome}`
    );
    registrar(
      "Relatório: desempenho por eixo reflete 1 acerto de 2 (50%)",
      relData.eixos?.length === 1 && relData.eixos[0].acertos === 1 && relData.eixos[0].total === 2 && relData.eixos[0].percentual === 50,
      `eixos: ${JSON.stringify(relData.eixos)}`
    );

    console.log("🧪 RELATÓRIO COMPLETO (ordem garantida):\n" + resultados.map((r, i) => `${i + 1}. ${r.passou ? "PASSOU" : "FALHOU"} — ${r.nome}${r.detalhe ? ` :: ${r.detalhe}` : ""}`).join("\n"));
    const totalPassou = resultados.filter((r) => r.passou).length;
    console.log(`\n🧪 RESULTADO FINAL: ${totalPassou}/${resultados.length} testes passaram`);
    console.log(totalPassou === resultados.length ? "✅✅✅ TODOS OS TESTES PASSARAM ✅✅✅" : "❌❌❌ ALGUM TESTE FALHOU ❌❌❌");
    console.log("═══════════════════════════════════════════════════════\n");

    // ── Limpeza ─────────────────────────────────────────────────────────────
    await db.execute(`DELETE FROM tentativas_prova WHERE prova_id = ?`, [provaId]);
    await db.execute(`DELETE FROM prova_questoes WHERE prova_id = ?`, [provaId]);
    await db.execute(`DELETE FROM candidato_processos WHERE id = ?`, [processoId]);
    await db.execute(`DELETE FROM provas WHERE id = ?`, [provaId]);
    await db.execute(`DELETE FROM eixos_conhecimento WHERE id = ?`, [eixoR.insertId]);
    await db.execute(`DELETE FROM certification_types WHERE id = ?`, [certId]);
    await db.execute(`DELETE FROM users WHERE id IN (?, ?)`, [uAdmin.insertId, uCand.insertId]);
    console.log("🧹 Dados de teste do autoteste removidos com sucesso");
  } catch (err) {
    console.error("❌ Erro inesperado durante o autoteste:", err);
  }
}
