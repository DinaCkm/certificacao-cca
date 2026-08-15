// Autoteste do PR feat/process-events-and-actionable-emails — roda uma vez
// no boot (gated por RUN_SELFTEST_EVENTOS=true), exercita as rotas HTTP
// reais via self-fetch, cria e apaga todos os dados de teste que gerar.

import { db } from "./db/connection.js";
import { generateToken } from "./services/authService.js";
import bcrypt from "bcryptjs";

interface ResultadoTeste { nome: string; passou: boolean; detalhe?: string }

export async function runEventosEmailsSelfTest(port: number | string) {
  if (process.env.RUN_SELFTEST_EVENTOS !== "true") return;

  const base = `http://localhost:${port}`;
  const resultados: ResultadoTeste[] = [];
  const limpar = {
    users: [] as number[], certs: [] as number[], processos: [] as number[],
    validacaoDocs: [] as number[], avaliadores: [] as number[], magicLinks: [] as number[],
    auditLogs: [] as number[],
  };

  function registrar(nome: string, passou: boolean, detalhe?: string) {
    resultados.push({ nome, passou, detalhe });
    console.log(`${passou ? "✅ PASSOU" : "❌ FALHOU"} — ${nome}${detalhe ? ` (${detalhe})` : ""}`);
  }

  try {
    console.log("\n🧪 ═══ AUTOTESTE — EVENTOS, E-MAILS E MAGIC LINK (temporário) ═══");

    // Limpeza defensiva: se uma execução anterior falhou no meio da limpeza
    // (ex: erro de FK), remove qualquer resíduo antes de criar dados novos.
    try {
      const [orfaos] = await db.execute(`SELECT id FROM users WHERE email LIKE 'selftest.%@teste.local'`) as any;
      for (const u of orfaos) {
        await db.execute(`DELETE FROM audit_log WHERE user_id = ?`, [u.id]);
        await db.execute(`DELETE FROM magic_link_tokens WHERE user_id = ?`, [u.id]);
      }
      const [processosOrfaos] = await db.execute(
        `SELECT id FROM candidato_processos WHERE candidato_email LIKE 'selftest.%@teste.local'`
      ) as any;
      for (const p of processosOrfaos) {
        await db.execute(`DELETE FROM validacao_documental WHERE processo_id = ?`, [p.id]);
        await db.execute(`DELETE FROM validacao_avaliadores WHERE processo_id = ?`, [p.id]);
        await db.execute(`DELETE FROM audit_log WHERE processo_id = ?`, [p.id]);
        await db.execute(`DELETE FROM candidato_processos WHERE id = ?`, [p.id]);
      }
      await db.execute(`DELETE FROM certification_types WHERE slug LIKE 'selftest-%'`);
      for (const u of orfaos) await db.execute(`DELETE FROM users WHERE id = ?`, [u.id]);
      if (orfaos.length) console.log(`🧹 Limpeza defensiva: ${orfaos.length} usuário(s) órfão(s) de execuções anteriores removidos`);
    } catch (preCleanErr) {
      console.warn("⚠️ Limpeza defensiva falhou (não impede o teste de rodar):", preCleanErr);
    }

    const [rolesRows] = await db.execute(`SELECT code, id FROM roles WHERE code IN ('candidato','avaliador')`) as any;
    const roleCandidatoId = rolesRows.find((r: any) => r.code === "candidato").id;
    const roleAvaliadorId = rolesRows.find((r: any) => r.code === "avaliador").id;
    const sufixo = Date.now();
    const cpfSufixo = String(sufixo).slice(-6);
    const hash = await bcrypt.hash("selftest", 4);

    // ── TESTE A: magic link — ciclo de vida completo ──────────────────────
    const [uMagic] = await db.execute(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.magic.${sufixo}@teste.local`, hash, "Selftest Magic", `M${cpfSufixo}`, roleAvaliadorId]
    ) as any;
    limpar.users.push(uMagic.insertId);

    const { gerarMagicLink } = await import("./services/magicLinkService.js");
    const linkGerado = await gerarMagicLink(uMagic.insertId, "/novo-fluxo/admin/validacao?processoId=999");
    const tokenExtraido = linkGerado.split("/").pop()!;

    const primeiraTentativa = await fetch(`${base}/api/auth/magic/${tokenExtraido}`);
    const primeiraData: any = await primeiraTentativa.json();
    registrar(
      "Magic link: primeira consulta autentica e retorna destino correto",
      primeiraTentativa.status === 200 && primeiraData.destino === "/novo-fluxo/admin/validacao?processoId=999" && !!primeiraData.jwt,
      `status ${primeiraTentativa.status}, destino=${primeiraData.destino}`
    );

    const segundaTentativa = await fetch(`${base}/api/auth/magic/${tokenExtraido}`);
    registrar(
      "Magic link: reutilizar o mesmo token é bloqueado (uso único)",
      segundaTentativa.status === 401,
      `status ${segundaTentativa.status}`
    );

    const jwtGerado = primeiraData.jwt;
    const testeJwt = await fetch(`${base}/api/admin/eixos/qualquer-slug-inexistente`, { headers: { Authorization: `Bearer ${jwtGerado}` } });
    registrar(
      "Magic link: o JWT retornado autentica normalmente em outras rotas",
      testeJwt.status === 200,
      `status ${testeJwt.status}`
    );

    // ── Setup comum: certificação + processo de teste ─────────────────────
    const [uCandidato] = await db.execute(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.cand.${sufixo}@teste.local`, hash, "Selftest Candidato", `C${cpfSufixo}`, roleCandidatoId]
    ) as any;
    limpar.users.push(uCandidato.insertId);
    const tokenCandidato = generateToken({ userId: uCandidato.insertId, email: `selftest.cand.${sufixo}@teste.local`, role: "candidato", roleId: roleCandidatoId });

    const [certR] = await db.execute(
      `INSERT INTO certification_types (slug, nome, numero, taxa_analise, taxa_emissao, documentos_exigidos, status)
       VALUES (?, ?, 999998, 150.00, 300.00, '[]', 'ativa')`,
      [`selftest-eventos-${sufixo}`, "Selftest Eventos"]
    ) as any;
    limpar.certs.push(certR.insertId);

    const [procR] = await db.execute(
      `INSERT INTO candidato_processos (user_id, certification_type_id, status_geral, candidato_nome, candidato_email)
       VALUES (?, ?, 'validacao', ?, ?)`,
      [uCandidato.insertId, certR.insertId, "Selftest Candidato", `selftest.cand.${sufixo}@teste.local`]
    ) as any;
    const processoId = procR.insertId;
    limpar.processos.push(processoId);

    // ── TESTE B: confirmação de pagamento ──────────────────────────────────
    const [countAuditAntes] = await db.execute(`SELECT COUNT(*) as total FROM audit_log WHERE processo_id = ?`, [processoId]) as any;

    const pagamentoRes = await fetch(`${base}/api/processo/${processoId}/pagamento-confirmado`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenCandidato}` },
      body: JSON.stringify({ numero: 1 }),
    });
    registrar("Pagamento: endpoint responde 200", pagamentoRes.status === 200, `status ${pagamentoRes.status}`);

    const [procAposPagamento] = await db.execute(`SELECT pagamento1_realizado FROM candidato_processos WHERE id = ?`, [processoId]) as any;
    registrar(
      "Pagamento: pagamento1_realizado foi marcado no banco",
      !!procAposPagamento[0]?.pagamento1_realizado,
      `valor: ${procAposPagamento[0]?.pagamento1_realizado}`
    );

    const [countAuditDepoisPagamento] = await db.execute(`SELECT COUNT(*) as total FROM audit_log WHERE processo_id = ?`, [processoId]) as any;
    registrar(
      "Pagamento: audit_log recebeu nova entrada",
      countAuditDepoisPagamento[0].total > countAuditAntes[0].total,
      `antes=${countAuditAntes[0].total}, depois=${countAuditDepoisPagamento[0].total}`
    );

    // ── TESTE C: fechar validação — Caminho B (o bug que nunca disparava) ──
    const [uAvaliador2] = await db.execute(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.aval2.${sufixo}@teste.local`, hash, "Selftest Avaliador 2", `A${cpfSufixo}`, roleAvaliadorId]
    ) as any;
    limpar.users.push(uAvaliador2.insertId);
    const tokenAvaliador2 = generateToken({ userId: uAvaliador2.insertId, email: `selftest.aval2.${sufixo}@teste.local`, role: "avaliador", roleId: roleAvaliadorId });

    const [avalR] = await db.execute(
      `INSERT INTO validacao_avaliadores (processo_id, user_id, numero_avaliador) VALUES (?, ?, 2)`,
      [processoId, uAvaliador2.insertId]
    ) as any;
    limpar.avaliadores.push(avalR.insertId);

    const [docR] = await db.execute(
      `INSERT INTO validacao_documental (processo_id, documento_idx, documento_nome, avaliador1_id, avaliador1_aprovado, avaliador2_id, avaliador2_aprovado, status)
       VALUES (?, 0, 'Documento Selftest', ?, 1, ?, 1, 'aprovado')`,
      [processoId, uAvaliador2.insertId, uAvaliador2.insertId]
    ) as any;
    limpar.validacaoDocs.push(docR.insertId);

    const fecharRes = await fetch(`${base}/api/admin/validacao-dupla/${processoId}/fechar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenAvaliador2}` },
      body: JSON.stringify({ caminho: "B" }),
    });
    const fecharData: any = await fecharRes.json();
    registrar(
      "Fechar validação (Caminho B): responde 200 com novo_status=prova",
      fecharRes.status === 200 && fecharData.novo_status === "prova",
      `status ${fecharRes.status}, corpo: ${JSON.stringify(fecharData)}`
    );

    const [procAposFechar] = await db.execute(`SELECT status_geral, caminho_avaliacao FROM candidato_processos WHERE id = ?`, [processoId]) as any;
    registrar(
      "Fechar validação: status_geral e caminho_avaliacao atualizados no banco",
      procAposFechar[0]?.status_geral === "prova" && procAposFechar[0]?.caminho_avaliacao === "B",
      `status_geral=${procAposFechar[0]?.status_geral}, caminho=${procAposFechar[0]?.caminho_avaliacao}`
    );

    const [auditFechar] = await db.execute(
      `SELECT * FROM audit_log WHERE processo_id = ? AND acao = 'validacao_documental_fechada'`,
      [processoId]
    ) as any;
    registrar(
      "Fechar validação: audit_log registrou a decisão (antes NÃO registrava nada)",
      auditFechar.length > 0,
      `${auditFechar.length} registro(s) encontrado(s)`
    );

    // ── Resumo ────────────────────────────────────────────────────────────
    console.log("🧪 RELATÓRIO COMPLETO (ordem garantida):\n" + resultados.map((r, i) => `${i + 1}. ${r.passou ? "PASSOU" : "FALHOU"} — ${r.nome}${r.detalhe ? ` :: ${r.detalhe}` : ""}`).join("\n"));
    const totalPassou = resultados.filter((r) => r.passou).length;
    console.log(`\n🧪 RESULTADO FINAL: ${totalPassou}/${resultados.length} testes passaram`);
    console.log(totalPassou === resultados.length ? "✅✅✅ TODOS OS TESTES PASSARAM ✅✅✅" : "❌❌❌ ALGUM TESTE FALHOU ❌❌❌");
    console.log("═══════════════════════════════════════════════════════\n");
  } catch (err) {
    console.error("❌ Erro inesperado durante o autoteste:", err);
  } finally {
    try {
      for (const id of limpar.validacaoDocs) await db.execute(`DELETE FROM validacao_documental WHERE id = ?`, [id]);
      for (const id of limpar.avaliadores) await db.execute(`DELETE FROM validacao_avaliadores WHERE id = ?`, [id]);
      for (const id of limpar.processos) {
        await db.execute(`DELETE FROM audit_log WHERE processo_id = ?`, [id]);
        await db.execute(`DELETE FROM candidato_processos WHERE id = ?`, [id]);
      }
      for (const id of limpar.certs) await db.execute(`DELETE FROM certification_types WHERE id = ?`, [id]);
      for (const id of limpar.users) {
        await db.execute(`DELETE FROM audit_log WHERE user_id = ?`, [id]); // rede de segurança — cobre qualquer linha não pega pelo processo_id
        await db.execute(`DELETE FROM magic_link_tokens WHERE user_id = ?`, [id]);
        await db.execute(`DELETE FROM users WHERE id = ?`, [id]);
      }
      console.log("🧹 Dados de teste do autoteste removidos com sucesso");
    } catch (cleanupErr) {
      console.error("⚠️ Erro ao limpar dados do autoteste — verificar manualmente:", cleanupErr);
    }
  }
}
