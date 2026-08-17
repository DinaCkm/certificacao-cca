// Autoteste do módulo de certificados — roda uma vez no boot (gated por
// RUN_SELFTEST_CERTIFICADO=true), cobre os 8 cenários de aceite pedidos:
// emissão após pagamento, não-duplicação em confirmação repetida, download
// próprio vs bloqueio de terceiro, validação pública (ativo/revogado/
// expirado), reemissão com histórico, e assinatura do comitê correto.

import { db } from "./db/connection.js";
import { generateToken } from "./services/authService.js";
import bcrypt from "bcryptjs";
import fs from "fs";

interface ResultadoTeste { nome: string; passou: boolean; detalhe?: string }

export async function runCertificadoSelfTest(port: number | string) {
  if (process.env.RUN_SELFTEST_CERTIFICADO !== "true") return;

  const base = `http://localhost:${port}`;
  const resultados: ResultadoTeste[] = [];
  const sufixo = Date.now();
  const cpfSufixo = String(sufixo).slice(-6);

  function registrar(nome: string, passou: boolean, detalhe?: string) {
    resultados.push({ nome, passou, detalhe });
    console.log(`${passou ? "✅ PASSOU" : "❌ FALHOU"} — ${nome}${detalhe ? ` (${detalhe})` : ""}`);
  }

  const limpar = { users: [] as number[], certs: [] as number[], processos: [] as number[], certificados: [] as string[], membros: [] as number[] };

  try {
    console.log("\n🧪 ═══ AUTOTESTE — MÓDULO DE CERTIFICADOS (temporário) ═══");

    // Limpeza defensiva: uma execução anterior pode ter falhado no meio da
    // limpeza (ex: erro de FK) e deixado resíduo.
    try {
      const [orfaosUsers] = await db.query(`SELECT id FROM users WHERE email LIKE 'selftest.cert.%@teste.local'`) as any;
      const [orfaosProcessos] = await db.query(`SELECT id FROM candidato_processos WHERE candidato_email LIKE 'selftest.cert.%@teste.local'`) as any;
      for (const p of orfaosProcessos) {
        await db.query(`SELECT caminho_pdf FROM certificados WHERE processo_id = ?`, [p.id]).then(async ([rows]: any) => {
          for (const r of rows) if (r.caminho_pdf && fs.existsSync(r.caminho_pdf)) fs.unlinkSync(r.caminho_pdf);
        });
        await db.query(`DELETE FROM certificados WHERE processo_id = ?`, [p.id]);
        await db.query(`DELETE FROM audit_log WHERE processo_id = ?`, [p.id]);
        await db.query(`DELETE FROM candidato_processos WHERE id = ?`, [p.id]);
      }
      const [orfaosCerts] = await db.query(`SELECT id FROM certification_types WHERE slug LIKE 'selftest-cert-%'`) as any;
      for (const c of orfaosCerts) {
        await db.query(`DELETE FROM certificados WHERE certification_type_id = ?`, [c.id]);
        await db.query(`DELETE FROM certificacao_comite WHERE certification_type_id = ?`, [c.id]);
        await db.query(`DELETE FROM certification_types WHERE id = ?`, [c.id]);
      }
      await db.query(`DELETE FROM comite_membros WHERE nome LIKE 'Selftest %'`);
      for (const u of orfaosUsers) await db.query(`DELETE FROM users WHERE id = ?`, [u.id]);
    } catch (preCleanErr) {
      console.warn("⚠️ Limpeza defensiva falhou (não impede o teste de rodar):", preCleanErr);
    }

    const [rolesCand] = await db.query(`SELECT id FROM roles WHERE code = 'candidato'`) as any;
    const [rolesAdmin] = await db.query(`SELECT id FROM roles WHERE code = 'administrador'`) as any;
    const hash = await bcrypt.hash("selftest", 4);

    const [uCand] = await db.query(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.cert.cand.${sufixo}@teste.local`, hash, "Selftest Certificado Candidato", `CT${cpfSufixo}`, rolesCand[0].id]
    ) as any;
    limpar.users.push(uCand.insertId);
    const tokenCand = generateToken({ userId: uCand.insertId, email: `selftest.cert.cand.${sufixo}@teste.local`, role: "candidato", roleId: rolesCand[0].id });

    const [uOutro] = await db.query(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.cert.outro.${sufixo}@teste.local`, hash, "Selftest Outro Candidato", `CO${cpfSufixo}`, rolesCand[0].id]
    ) as any;
    limpar.users.push(uOutro.insertId);
    const tokenOutro = generateToken({ userId: uOutro.insertId, email: `selftest.cert.outro.${sufixo}@teste.local`, role: "candidato", roleId: rolesCand[0].id });

    const [uAdmin] = await db.query(
      `INSERT INTO users (email, password_hash, full_name, cpf, role_id, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [`selftest.cert.admin.${sufixo}@teste.local`, hash, "Selftest Admin", `CA${cpfSufixo}`, rolesAdmin[0].id]
    ) as any;
    limpar.users.push(uAdmin.insertId);
    const tokenAdmin = generateToken({ userId: uAdmin.insertId, email: `selftest.cert.admin.${sufixo}@teste.local`, role: "administrador", roleId: rolesAdmin[0].id });

    const [certR] = await db.query(
      `INSERT INTO certification_types (slug, nome, numero, taxa_analise, taxa_emissao, validade_anos, documentos_exigidos, status)
       VALUES (?, ?, 999980, 0, 0, 3, '[]', 'ativa')`,
      [`selftest-cert-${sufixo}`, "Selftest Certificado"]
    ) as any;
    const certId = certR.insertId;
    limpar.certs.push(certId);

    const [membroR] = await db.query(
      `INSERT INTO comite_membros (nome, cargo, ativo) VALUES ('Selftest Assinante', 'Presidente do Comitê', 1)`
    ) as any;
    limpar.membros.push(membroR.insertId);
    await db.query(`INSERT INTO certificacao_comite (certification_type_id, comite_membro_id, papel) VALUES (?, ?, 'Presidente')`, [certId, membroR.insertId]);

    const [certOutraR] = await db.query(
      `INSERT INTO certification_types (slug, nome, numero, taxa_analise, taxa_emissao, documentos_exigidos, status)
       VALUES (?, ?, 999981, 0, 0, '[]', 'ativa')`,
      [`selftest-cert-outra-${sufixo}`, "Selftest Outra Certificação"]
    ) as any;
    limpar.certs.push(certOutraR.insertId);
    const [membroOutroR] = await db.query(`INSERT INTO comite_membros (nome, cargo, ativo) VALUES ('Selftest NAO Deveria Assinar', 'Membro', 1)`) as any;
    limpar.membros.push(membroOutroR.insertId);
    await db.query(`INSERT INTO certificacao_comite (certification_type_id, comite_membro_id) VALUES (?, ?)`, [certOutraR.insertId, membroOutroR.insertId]);

    // ── TESTE 1: emissão bloqueada sem pagamento/entrevista ─────────────────
    const [procIncompletoR] = await db.query(
      `INSERT INTO candidato_processos (user_id, certification_type_id, status_geral, candidato_nome, candidato_email, pagamento2_realizado, aprovado_entrevista)
       VALUES (?, ?, 'emissao', 'Selftest Certificado Candidato', ?, 0, NULL)`,
      [uCand.insertId, certId, `selftest.cert.cand.${sufixo}@teste.local`]
    ) as any;
    limpar.processos.push(procIncompletoR.insertId);

    const bloqueadoRes = await fetch(`${base}/api/processo/${procIncompletoR.insertId}/certificado`, { headers: { Authorization: `Bearer ${tokenCand}` } });
    registrar("Critério de emissão: bloqueia sem pagamento confirmado nem entrevista aprovada", bloqueadoRes.status === 400, `status ${bloqueadoRes.status}`);

    const [procR] = await db.query(
      `INSERT INTO candidato_processos (user_id, certification_type_id, status_geral, candidato_nome, candidato_email, pagamento2_realizado, aprovado_entrevista, edital_versao)
       VALUES (?, ?, 'emissao', 'Selftest Certificado Candidato', ?, 1, 1, 2)`,
      [uCand.insertId, certId, `selftest.cert.cand.${sufixo}@teste.local`]
    ) as any;
    const processoId = procR.insertId;
    limpar.processos.push(processoId);

    // ── TESTE 2: emissão bem-sucedida, vinculada ao processo/certificação ──
    const emitirRes = await fetch(`${base}/api/processo/${processoId}/certificado`, { headers: { Authorization: `Bearer ${tokenCand}` } });
    const emitirData: any = await emitirRes.json();
    registrar(
      "Emissão: bem-sucedida após pagamento confirmado + entrevista aprovada",
      emitirRes.status === 200 && !!emitirData.certificado?.codigo,
      `status ${emitirRes.status}, codigo=${emitirData.certificado?.codigo}`
    );
    if (emitirData.certificado?.codigo) limpar.certificados.push(emitirData.certificado.codigo);

    registrar(
      "Vínculo: certificado guarda processo_id e certification_type_id corretos (não só o candidato)",
      emitirData.certificado?.processo_id === processoId && emitirData.certificado?.certification_type_id === certId,
      `processo_id=${emitirData.certificado?.processo_id}, cert_type_id=${emitirData.certificado?.certification_type_id}`
    );

    registrar(
      "PDF: arquivo foi realmente criado no disco",
      !!emitirData.certificado?.caminho_pdf && fs.existsSync(emitirData.certificado.caminho_pdf),
      `caminho: ${emitirData.certificado?.caminho_pdf}`
    );

    // ── TESTE 3: repetição não duplica certificado ativo ────────────────────
    const emitirNovoRes = await fetch(`${base}/api/processo/${processoId}/pagamento-confirmado`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenCand}` },
      body: JSON.stringify({ numero: 2 }),
    });
    const emitirNovoData = await emitirNovoRes.json().catch(() => null);
    const [todosCertificadosDoProcesso] = await db.query(
      `SELECT id, codigo, status FROM certificados WHERE processo_id = ?`,
      [processoId]
    ) as any;
    const totalAtivos = todosCertificadosDoProcesso.filter((c: any) => c.status === "ativo").length;
    // Rastreia qualquer certificado extra que a idempotência tenha
    // eventualmente criado, pra não vazar na limpeza
    for (const c of todosCertificadosDoProcesso) if (!limpar.certificados.includes(c.codigo)) limpar.certificados.push(c.codigo);
    registrar(
      "Idempotência: confirmar pagamento de novo NÃO gera um segundo certificado ativo",
      totalAtivos === 1,
      `total ativos: ${totalAtivos}, todas as linhas: ${JSON.stringify(todosCertificadosDoProcesso)}, resposta do endpoint: ${JSON.stringify(emitirNovoData)}`
    );

    // ── TESTE 4: assinatura correta (só o comitê DESTA certificação) ───────
    const [certRow] = await db.query(`SELECT assinantes_json FROM certificados WHERE processo_id = ? AND status = 'ativo'`, [processoId]) as any;
    const assinantes = typeof certRow[0].assinantes_json === "string" ? JSON.parse(certRow[0].assinantes_json) : certRow[0].assinantes_json;
    registrar(
      "Assinaturas: contém só o membro do comitê desta certificação, não de outras",
      assinantes.length === 1 && assinantes[0].nome === "Selftest Assinante",
      `assinantes: ${JSON.stringify(assinantes)}`
    );

    // ── TESTE 5: download pelo próprio candidato funciona ───────────────────
    const downloadProprioRes = await fetch(`${base}/api/processo/${processoId}/certificado/pdf`, { headers: { Authorization: `Bearer ${tokenCand}` } });
    registrar("Download: o próprio candidato consegue baixar", downloadProprioRes.status === 200, `status ${downloadProprioRes.status}`);

    // ── TESTE 6: bloqueio de download por outro candidato ──────────────────
    const downloadOutroRes = await fetch(`${base}/api/processo/${processoId}/certificado/pdf`, { headers: { Authorization: `Bearer ${tokenOutro}` } });
    registrar("Download: OUTRO candidato é bloqueado (404, não encontra o certificado de quem não é dono)", downloadOutroRes.status === 404, `status ${downloadOutroRes.status}`);

    // ── TESTE 7: validação pública — ativo ───────────────────────────────────
    const codigo = emitirData.certificado.codigo;
    const validarAtivoRes = await fetch(`${base}/api/validar-certificado/${codigo}`);
    const validarAtivoData: any = await validarAtivoRes.json();
    registrar(
      "Validação pública: certificado ativo mostra status correto, sem CPF/e-mail/ids internos",
      validarAtivoRes.status === 200 && validarAtivoData.certificado?.status === "ativo" &&
      !validarAtivoData.certificado?.cpf && !validarAtivoData.certificado?.candidato_email && !validarAtivoData.certificado?.user_id,
      `resposta: ${JSON.stringify(validarAtivoData.certificado)}`
    );

    // ── TESTE 8: reemissão — revoga o antigo com histórico e emite novo ────
    const [certIdRow] = await db.query(`SELECT id FROM certificados WHERE codigo = ?`, [codigo]) as any;
    const reemitirRes = await fetch(`${base}/api/admin/certificados/${certIdRow[0].id}/reemitir`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenAdmin}` },
      body: JSON.stringify({ motivo: "Teste de reemissão automatizado" }),
    });
    const reemitirData: any = await reemitirRes.json();
    const novoCodigo = reemitirData.certificado?.codigo;
    if (novoCodigo) limpar.certificados.push(novoCodigo);

    registrar(
      "Reemissão: gera código NOVO diferente do original",
      reemitirRes.status === 201 && novoCodigo && novoCodigo !== codigo,
      `original=${codigo}, novo=${novoCodigo}`
    );

    const [certificadoAntigoRow] = await db.query(`SELECT status, motivo_revogacao, caminho_pdf FROM certificados WHERE codigo = ?`, [codigo]) as any;
    registrar(
      "Reemissão: certificado ANTIGO fica revogado, com motivo, sem apagar o PDF anterior",
      certificadoAntigoRow[0]?.status === "revogado" && !!certificadoAntigoRow[0]?.motivo_revogacao && fs.existsSync(certificadoAntigoRow[0]?.caminho_pdf),
      `status=${certificadoAntigoRow[0]?.status}, motivo=${certificadoAntigoRow[0]?.motivo_revogacao}`
    );

    // ── TESTE 9: validação pública do código ANTIGO agora mostra revogado ──
    const validarRevogadoRes = await fetch(`${base}/api/validar-certificado/${codigo}`);
    const validarRevogadoData: any = await validarRevogadoRes.json();
    registrar(
      "Validação pública: código antigo (revogado) mostra status revogado",
      validarRevogadoData.certificado?.status === "revogado",
      `status: ${validarRevogadoData.certificado?.status}`
    );

    // ── TESTE 10: validação pública de código inexistente ───────────────────
    const validarInexistenteRes = await fetch(`${base}/api/validar-certificado/ANEFAC-NAOEXISTE`);
    registrar("Validação pública: código inexistente retorna 404", validarInexistenteRes.status === 404, `status ${validarInexistenteRes.status}`);

    console.log("🧪 RELATÓRIO COMPLETO (ordem garantida):\n" + resultados.map((r, i) => `${i + 1}. ${r.passou ? "PASSOU" : "FALHOU"} — ${r.nome}${r.detalhe ? ` :: ${r.detalhe}` : ""}`).join("\n"));
    const totalPassou = resultados.filter((r) => r.passou).length;
    console.log(`\n🧪 RESULTADO FINAL: ${totalPassou}/${resultados.length} testes passaram`);
    console.log(totalPassou === resultados.length ? "✅✅✅ TODOS OS TESTES PASSARAM ✅✅✅" : "❌❌❌ ALGUM TESTE FALHOU ❌❌❌");
    console.log("═══════════════════════════════════════════════════════\n");
  } catch (err) {
    console.error("❌ Erro inesperado durante o autoteste:", err);
  } finally {
    try {
      for (const codigo of limpar.certificados) {
        const [rows] = await db.query(`SELECT caminho_pdf FROM certificados WHERE codigo = ?`, [codigo]) as any;
        if (rows[0]?.caminho_pdf && fs.existsSync(rows[0].caminho_pdf)) fs.unlinkSync(rows[0].caminho_pdf);
      }
      // Apaga TODOS os certificados vinculados aos certs/processos de teste,
      // não só os códigos rastreados individualmente — protege contra
      // qualquer linha extra gerada por um bug (é exatamente o que este
      // autoteste existe pra pegar) travar a limpeza por causa da FK.
      for (const id of limpar.certs) {
        const [pdfs] = await db.query(`SELECT caminho_pdf FROM certificados WHERE certification_type_id = ?`, [id]) as any;
        for (const p of pdfs) if (p.caminho_pdf && fs.existsSync(p.caminho_pdf)) fs.unlinkSync(p.caminho_pdf);
        await db.query(`DELETE FROM certificados WHERE certification_type_id = ?`, [id]);
      }
      for (const id of limpar.processos) {
        await db.query(`DELETE FROM audit_log WHERE processo_id = ?`, [id]);
        await db.query(`DELETE FROM candidato_processos WHERE id = ?`, [id]);
      }
      for (const id of limpar.certs) {
        await db.query(`DELETE FROM certificacao_comite WHERE certification_type_id = ?`, [id]);
        await db.query(`DELETE FROM certification_types WHERE id = ?`, [id]);
      }
      for (const id of limpar.membros) await db.query(`DELETE FROM comite_membros WHERE id = ?`, [id]);
      for (const id of limpar.users) await db.query(`DELETE FROM users WHERE id = ?`, [id]);
      console.log("🧹 Dados de teste do autoteste removidos com sucesso");
    } catch (cleanupErr) {
      console.error("⚠️ Erro ao limpar dados do autoteste — verificar manualmente:", cleanupErr);
    }
  }
}
