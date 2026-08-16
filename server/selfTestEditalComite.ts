// Autoteste do PR #8 (edital versionado por certificacao + comite vinculavel
// a login) — roda uma vez no boot (gated por RUN_SELFTEST_EDITAL=true),
// exercita as rotas HTTP reais e confirma: comitê (CRUD + vínculo de login +
// atribuição por certificação) e edital (versionamento + edital_versao no
// processo). Nunca foi executado antes do merge do PR #8 — só pnpm check/build.

import { db } from "./db/connection.js";
import { generateToken } from "./services/authService.js";
import bcrypt from "bcryptjs";

interface ResultadoTeste { nome: string; passou: boolean; detalhe?: string }

export async function runEditalComiteSelfTest(port: number | string) {
  if (process.env.RUN_SELFTEST_EDITAL !== "true") return;

  const base = `http://localhost:${port}`;
  const resultados: ResultadoTeste[] = [];
  const sufixo = Date.now();
  const cpfSufixo = String(sufixo).slice(-6);

  function registrar(nome: string, passou: boolean, detalhe?: string) {
    resultados.push({ nome, passou, detalhe });
    console.log(`${passou ? "✅ PASSOU" : "❌ FALHOU"} — ${nome}${detalhe ? ` (${detalhe})` : ""}`);
  }

  let uAdminId: number | null = null;
  let uCandId: number | null = null;
  let certId: number | null = null;
  let membroId: number | null = null;
  let processoId: number | null = null;

  try {
    console.log("\n🧪 ═══ AUTOTESTE — EDITAL & COMITÊ (PR #8, temporário) ═══");

    // Limpeza defensiva
    const [orfaos] = await db.execute(`SELECT id FROM users WHERE email LIKE 'selftest.editalcomite.%@teste.local'`) as any;
    for (const u of orfaos) {
      await db.execute(`UPDATE comite_membros SET user_id = NULL WHERE user_id = ?`, [u.id]);
      await db.execute(`DELETE FROM users WHERE id = ?`, [u.id]);
    }
    const [certsOrfaos] = await db.execute(`SELECT id FROM certification_types WHERE slug LIKE 'selftest-editalcomite-%'`) as any;
    for (const c of certsOrfaos) {
      await db.execute(`DELETE FROM certificacao_comite WHERE certification_type_id = ?`, [c.id]);
      await db.execute(`DELETE FROM certificacao_edital WHERE certification_type_id = ?`, [c.id]);
      await db.execute(`DELETE FROM candidato_processos WHERE certification_type_id = ?`, [c.id]);
      await db.execute(`DELETE FROM certification_types WHERE id = ?`, [c.id]);
    }
    await db.execute(`DELETE FROM comite_membros WHERE nome LIKE 'Selftest Membro%'`);

    const [rolesAdmin] = await db.execute(`SELECT id FROM roles WHERE code = 'administrador'`) as any;
    const [rolesCand] = await db.execute(`SELECT id FROM roles WHERE code = 'candidato'`) as any;
    const hash = await bcrypt.hash("selftest", 4);

    const [uAdmin] = await db.execute(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.editalcomite.admin.${sufixo}@teste.local`, hash, "Selftest Admin EditalComite", `EC${cpfSufixo}`, rolesAdmin[0].id]
    ) as any;
    uAdminId = uAdmin.insertId;
    const tokenAdmin = generateToken({ userId: uAdminId!, email: `selftest.editalcomite.admin.${sufixo}@teste.local`, role: "administrador", roleId: rolesAdmin[0].id });

    const [uCand] = await db.execute(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.editalcomite.cand.${sufixo}@teste.local`, hash, "Selftest Membro Comite", `EM${cpfSufixo}`, rolesCand[0].id]
    ) as any;
    uCandId = uCand.insertId;

    const [certR] = await db.execute(
      `INSERT INTO certification_types (slug, nome, numero, taxa_analise, taxa_emissao, documentos_exigidos, status)
       VALUES (?, ?, 999996, 0, 0, '[]', 'ativa')`,
      [`selftest-editalcomite-${sufixo}`, "Selftest Edital Comite"]
    ) as any;
    certId = certR.insertId;
    const certSlug = `selftest-editalcomite-${sufixo}`;

    // ── TESTE 1: criar membro do comitê com conta vinculada ────────────────
    const criarMembroRes = await fetch(`${base}/api/admin/comite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenAdmin}` },
      body: JSON.stringify({ nome: "Selftest Membro Comite", cargo: "Testador", userId: uCandId }),
    });
    const criarMembroData: any = await criarMembroRes.json();
    membroId = criarMembroData.id;
    registrar("Comitê: cria membro com conta vinculada", criarMembroRes.status === 201 && !!membroId, `status ${criarMembroRes.status}`);

    const listarMembrosRes = await fetch(`${base}/api/admin/comite`, { headers: { Authorization: `Bearer ${tokenAdmin}` } });
    const listarMembrosData: any = await listarMembrosRes.json();
    const membroEncontrado = listarMembrosData.membros?.find((m: any) => m.id === membroId);
    registrar(
      "Comitê: membro aparece na listagem com e-mail da conta vinculada",
      membroEncontrado?.user_email === `selftest.editalcomite.cand.${sufixo}@teste.local`,
      `encontrado: ${JSON.stringify(membroEncontrado)}`
    );

    // ── TESTE 2: atribuir membro à certificação ─────────────────────────────
    const atribuirRes = await fetch(`${base}/api/admin/comite/certificacao/${certSlug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenAdmin}` },
      body: JSON.stringify({ comiteMembroId: membroId, papel: "Presidente" }),
    });
    registrar("Comitê: atribui membro a uma certificação específica", atribuirRes.status === 201, `status ${atribuirRes.status}`);

    const listarAtribuidosRes = await fetch(`${base}/api/admin/comite/certificacao/${certSlug}`, { headers: { Authorization: `Bearer ${tokenAdmin}` } });
    const listarAtribuidosData: any = await listarAtribuidosRes.json();
    registrar(
      "Comitê: certificação lista o membro atribuído com o papel certo",
      listarAtribuidosData.membros?.[0]?.papel === "Presidente",
      `membros: ${JSON.stringify(listarAtribuidosData.membros)}`
    );

    // ── TESTE 3: edital — cria, versiona ao mudar, mantém versão se igual ──
    const salvarEditalRes = await fetch(`${base}/api/admin/editais/${certSlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenAdmin}` },
      body: JSON.stringify({ titulo: "Edital Selftest", conteudo: "Versão 1 do conteúdo" }),
    });
    const salvarEditalData: any = await salvarEditalRes.json();
    registrar("Edital: cria com versão inicial 1", salvarEditalRes.status === 200 && salvarEditalData.versao === 1, `versao=${salvarEditalData.versao}`);

    const salvarEditalV2Res = await fetch(`${base}/api/admin/editais/${certSlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenAdmin}` },
      body: JSON.stringify({ titulo: "Edital Selftest", conteudo: "Versão 2 do conteúdo — mudou de verdade" }),
    });
    const salvarEditalV2Data: any = await salvarEditalV2Res.json();
    registrar("Edital: incrementa versão quando o conteúdo muda", salvarEditalV2Data.versao === 2, `versao=${salvarEditalV2Data.versao}`);

    const salvarEditalMesmoRes = await fetch(`${base}/api/admin/editais/${certSlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenAdmin}` },
      body: JSON.stringify({ titulo: "Edital Selftest (novo título)", conteudo: "Versão 2 do conteúdo — mudou de verdade" }),
    });
    const salvarEditalMesmoData: any = await salvarEditalMesmoRes.json();
    registrar(
      "Edital: NÃO incrementa versão se só o título muda (conteúdo igual)",
      salvarEditalMesmoData.versao === 2,
      `versao=${salvarEditalMesmoData.versao}`
    );

    // Público consegue ler o edital
    const editalPublicoRes = await fetch(`${base}/api/certificacoes/${certSlug}/edital`);
    const editalPublicoData: any = await editalPublicoRes.json();
    registrar(
      "Edital: endpoint público retorna o conteúdo sem autenticação",
      editalPublicoRes.status === 200 && editalPublicoData.edital?.versao === 2,
      `status ${editalPublicoRes.status}, versao=${editalPublicoData.edital?.versao}`
    );

    // ── TESTE 4: candidato_processos registra a versão do edital ao criar ──
    const tokenCand = generateToken({ userId: uCandId!, email: `selftest.editalcomite.cand.${sufixo}@teste.local`, role: "candidato", roleId: rolesCand[0].id });
    const sincronizarRes = await fetch(`${base}/api/processo/sincronizar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenCand}` },
      body: JSON.stringify({
        certificacaoId: certSlug, statusGeral: "cadastro", candidatoNome: "Selftest Membro Comite",
        candidatoEmail: `selftest.editalcomite.cand.${sufixo}@teste.local`, candidatoCPF: `EM${cpfSufixo}`,
      }),
    });
    const sincronizarData: any = await sincronizarRes.json();
    processoId = sincronizarData.processo_id;

    if (processoId) {
      const [procRows] = await db.execute(`SELECT edital_versao FROM candidato_processos WHERE id = ?`, [processoId]) as any;
      registrar(
        "Processo novo: registra a versão do edital vigente no momento da criação (v2)",
        procRows[0]?.edital_versao === 2,
        `edital_versao=${procRows[0]?.edital_versao}`
      );
    } else {
      registrar("Processo novo: registra a versão do edital vigente no momento da criação (v2)", false, `resposta: ${JSON.stringify(sincronizarData)}`);
    }

    console.log("🧪 RELATÓRIO COMPLETO (ordem garantida):\n" + resultados.map((r, i) => `${i + 1}. ${r.passou ? "PASSOU" : "FALHOU"} — ${r.nome}${r.detalhe ? ` :: ${r.detalhe}` : ""}`).join("\n"));
    const totalPassou = resultados.filter((r) => r.passou).length;
    console.log(`\n🧪 RESULTADO FINAL: ${totalPassou}/${resultados.length} testes passaram`);
    console.log(totalPassou === resultados.length ? "✅✅✅ TODOS OS TESTES PASSARAM ✅✅✅" : "❌❌❌ ALGUM TESTE FALHOU ❌❌❌");
    console.log("═══════════════════════════════════════════════════════\n");
  } catch (err) {
    console.error("❌ Erro inesperado durante o autoteste:", err);
  } finally {
    try {
      if (processoId) await db.execute(`DELETE FROM candidato_processos WHERE id = ?`, [processoId]);
      if (certId) {
        await db.execute(`DELETE FROM certificacao_comite WHERE certification_type_id = ?`, [certId]);
        await db.execute(`DELETE FROM certificacao_edital WHERE certification_type_id = ?`, [certId]);
        await db.execute(`DELETE FROM certification_types WHERE id = ?`, [certId]);
      }
      if (membroId) await db.execute(`DELETE FROM comite_membros WHERE id = ?`, [membroId]);
      if (uAdminId) await db.execute(`DELETE FROM users WHERE id = ?`, [uAdminId]);
      if (uCandId) await db.execute(`DELETE FROM users WHERE id = ?`, [uCandId]);
      console.log("🧹 Dados de teste do autoteste removidos com sucesso");
    } catch (cleanupErr) {
      console.error("⚠️ Erro ao limpar dados do autoteste — verificar manualmente:", cleanupErr);
    }
  }
}
