// Autoteste da correção "validação documental por processo" — roda uma vez
// no boot (gated por RUN_SELFTEST_VALIDACAO=true). Simula exatamente o
// cenário reportado: candidato com 3 certificações, confirma que documentos
// não se misturam entre processos e que avaliador sem designação é bloqueado.

import { db } from "./db/connection.js";
import { generateToken } from "./services/authService.js";
import bcrypt from "bcryptjs";

interface ResultadoTeste { nome: string; passou: boolean; detalhe?: string }

export async function runValidacaoPorProcessoSelfTest(port: number | string) {
  if (process.env.RUN_SELFTEST_VALIDACAO !== "true") return;

  const base = `http://localhost:${port}`;
  const resultados: ResultadoTeste[] = [];
  const sufixo = Date.now();
  const cpfSufixo = String(sufixo).slice(-6);

  function registrar(nome: string, passou: boolean, detalhe?: string) {
    resultados.push({ nome, passou, detalhe });
    console.log(`${passou ? "✅ PASSOU" : "❌ FALHOU"} — ${nome}${detalhe ? ` (${detalhe})` : ""}`);
  }

  const limpar = { users: [] as number[], certs: [] as number[], processos: [] as number[], docs: [] as number[] };

  try {
    console.log("\n🧪 ═══ AUTOTESTE — VALIDAÇÃO DOCUMENTAL POR PROCESSO (temporário) ═══");

    const [rolesCand] = await db.execute(`SELECT id FROM roles WHERE code = 'candidato'`) as any;
    const [rolesAval] = await db.execute(`SELECT id FROM roles WHERE code = 'avaliador'`) as any;
    const [rolesAdmin] = await db.execute(`SELECT id FROM roles WHERE code = 'administrador'`) as any;
    const hash = await bcrypt.hash("selftest", 4);

    // ── Setup: candidato "Teste201-like" com 3 certificações diferentes ────
    const [uCand] = await db.execute(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.validacao.cand.${sufixo}@teste.local`, hash, "Selftest Multi Certificacao", `V${cpfSufixo}`, rolesCand[0].id]
    ) as any;
    limpar.users.push(uCand.insertId);

    const [uAdmin] = await db.execute(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.validacao.admin.${sufixo}@teste.local`, hash, "Selftest Admin", `VA${cpfSufixo}`, rolesAdmin[0].id]
    ) as any;
    limpar.users.push(uAdmin.insertId);
    const tokenAdmin = generateToken({ userId: uAdmin.insertId, email: `selftest.validacao.admin.${sufixo}@teste.local`, role: "administrador", roleId: rolesAdmin[0].id });

    const [uAval] = await db.execute(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.validacao.aval.${sufixo}@teste.local`, hash, "Selftest Avaliador", `VB${cpfSufixo}`, rolesAval[0].id]
    ) as any;
    limpar.users.push(uAval.insertId);
    const tokenAval = generateToken({ userId: uAval.insertId, email: `selftest.validacao.aval.${sufixo}@teste.local`, role: "avaliador", roleId: rolesAval[0].id });

    const processoIds: number[] = [];
    for (let i = 1; i <= 3; i++) {
      const [certR] = await db.execute(
        `INSERT INTO certification_types (slug, nome, numero, taxa_analise, taxa_emissao, documentos_exigidos, status)
         VALUES (?, ?, ?, 0, 0, '["Diploma"]', 'ativa')`,
        [`selftest-validacao-${sufixo}-${i}`, `Selftest Certificação ${i}`, 999990 + i]
      ) as any;
      limpar.certs.push(certR.insertId);

      const [procR] = await db.execute(
        `INSERT INTO candidato_processos (user_id, certification_type_id, status_geral, candidato_nome, candidato_email)
         VALUES (?, ?, 'validacao', 'Selftest Multi Certificacao', ?)`,
        [uCand.insertId, certR.insertId, `selftest.validacao.cand.${sufixo}@teste.local`]
      ) as any;
      limpar.processos.push(procR.insertId);
      processoIds.push(procR.insertId);

      // Documento enviado especificamente para ESTE processo
      const [docR] = await db.execute(
        `INSERT INTO documentos_candidato (processo_id, user_id, tipo_documento, nome_arquivo, caminho_arquivo, status)
         VALUES (?, ?, 'doc-0', ?, ?, 'enviado')`,
        [procR.insertId, uCand.insertId, `diploma-certificacao-${i}.pdf`, `fake-${i}.pdf`]
      ) as any;
      limpar.docs.push(docR.insertId);
    }

    // ── TESTE 1: listagem admin não mistura documentos entre processos ─────
    const listaRes = await fetch(`${base}/api/admin/validacao/pendentes`, { headers: { Authorization: `Bearer ${tokenAdmin}` } });
    const listaData: any = await listaRes.json();
    const candidatosDoTeste = (listaData.candidatos || []).filter((c: any) => processoIds.includes(c.processo_id));

    registrar("Listagem: aparecem 3 processos distintos para o mesmo candidato", candidatosDoTeste.length === 3, `encontrados: ${candidatosDoTeste.length}`);

    let misturouDocumentos = false;
    for (const c of candidatosDoTeste) {
      const nomesEsperados = c.documentos.map((d: any) => d.nome_arquivo);
      const pertenceAOutro = nomesEsperados.some((n: string) => !n.includes(`certificacao-${processoIds.indexOf(c.processo_id) + 1}.pdf`) && n.startsWith("diploma-certificacao-"));
      if (pertenceAOutro) misturouDocumentos = true;
    }
    registrar("Listagem: cada processo mostra SÓ o próprio documento (sem mistura entre certificações)", !misturouDocumentos);

    // ── TESTE 2: avaliador SEM designação é bloqueado em qualquer processo ─
    const semDesignacaoRes = await fetch(`${base}/api/admin/validacao-dupla/${processoIds[0]}`, { headers: { Authorization: `Bearer ${tokenAval}` } });
    registrar("Designação: avaliador sem designação nenhuma é bloqueado (403)", semDesignacaoRes.status === 403, `status ${semDesignacaoRes.status}`);

    // ── TESTE 3: designa avaliador só pra 1 das 3 certificações ─────────────
    const [cert1] = await db.execute(`SELECT slug FROM certification_types WHERE id = ?`, [limpar.certs[0]]) as any;
    const designarRes = await fetch(`${base}/api/admin/avaliadores-certificacao/${cert1[0].slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenAdmin}` },
      body: JSON.stringify({ userId: uAval.insertId }),
    });
    registrar("Designação: admin designa avaliador para 1 certificação específica", designarRes.status === 201, `status ${designarRes.status}`);

    const acessoCertDesignadaRes = await fetch(`${base}/api/admin/validacao-dupla/${processoIds[0]}`, { headers: { Authorization: `Bearer ${tokenAval}` } });
    registrar("Designação: avaliador acessa a certificação designada normalmente", acessoCertDesignadaRes.status === 200, `status ${acessoCertDesignadaRes.status}`);

    const acessoCertNaoDesignadaRes = await fetch(`${base}/api/admin/validacao-dupla/${processoIds[1]}`, { headers: { Authorization: `Bearer ${tokenAval}` } });
    registrar("Designação: MESMO avaliador continua bloqueado nas outras 2 certificações", acessoCertNaoDesignadaRes.status === 403, `status ${acessoCertNaoDesignadaRes.status}`);

    // ── TESTE 4: listagem do avaliador designado só mostra sua certificação ─
    const listaAvalRes = await fetch(`${base}/api/admin/validacao/pendentes`, { headers: { Authorization: `Bearer ${tokenAval}` } });
    const listaAvalData: any = await listaAvalRes.json();
    const candidatosVisiveisAval = (listaAvalData.candidatos || []).filter((c: any) => processoIds.includes(c.processo_id));
    registrar(
      "Listagem: avaliador designado só vê o processo da certificação dele (não os outros 2)",
      candidatosVisiveisAval.length === 1 && candidatosVisiveisAval[0].processo_id === processoIds[0],
      `visíveis: ${JSON.stringify(candidatosVisiveisAval.map((c: any) => c.processo_id))}`
    );

    console.log("🧪 RELATÓRIO COMPLETO (ordem garantida):\n" + resultados.map((r, i) => `${i + 1}. ${r.passou ? "PASSOU" : "FALHOU"} — ${r.nome}${r.detalhe ? ` :: ${r.detalhe}` : ""}`).join("\n"));
    const totalPassou = resultados.filter((r) => r.passou).length;
    console.log(`\n🧪 RESULTADO FINAL: ${totalPassou}/${resultados.length} testes passaram`);
    console.log(totalPassou === resultados.length ? "✅✅✅ TODOS OS TESTES PASSARAM ✅✅✅" : "❌❌❌ ALGUM TESTE FALHOU ❌❌❌");
    console.log("═══════════════════════════════════════════════════════\n");
  } catch (err) {
    console.error("❌ Erro inesperado durante o autoteste:", err);
  } finally {
    try {
      for (const id of limpar.docs) await db.execute(`DELETE FROM documentos_candidato WHERE id = ?`, [id]);
      for (const id of limpar.processos) {
        await db.execute(`DELETE FROM validacao_documental WHERE processo_id = ?`, [id]);
        await db.execute(`DELETE FROM validacao_avaliadores WHERE processo_id = ?`, [id]);
        await db.execute(`DELETE FROM candidato_processos WHERE id = ?`, [id]);
      }
      for (const id of limpar.certs) {
        await db.execute(`DELETE FROM avaliadores_certificacao WHERE certification_type_id = ?`, [id]);
        await db.execute(`DELETE FROM certification_types WHERE id = ?`, [id]);
      }
      for (const id of limpar.users) await db.execute(`DELETE FROM users WHERE id = ?`, [id]);
      console.log("🧹 Dados de teste do autoteste removidos com sucesso");
    } catch (cleanupErr) {
      console.error("⚠️ Erro ao limpar dados do autoteste — verificar manualmente:", cleanupErr);
    }
  }
}
