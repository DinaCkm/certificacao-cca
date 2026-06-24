import { db } from "../db/connection.js";

// ── Scheduler: verifica fale-conosco e envia e-mail ao gestor1 ──────────────

async function enviarResumoFaleConosco() {
  try {
    // Busca mensagens não lidas
    const [rows] = await db.execute(
      `SELECT id, nome, email, mensagem, pagina_origem, criado_em
       FROM fale_conosco WHERE lida = FALSE ORDER BY criado_em DESC`
    ) as any;

    if (rows.length === 0) return; // Sem mensagens — não envia e-mail

    // Busca e-mail do gestor1
    const [gestores] = await db.execute(
      `SELECT email, full_name FROM users WHERE role_id = 4 AND is_active = TRUE LIMIT 1`
    ) as any;

    if (!gestores.length) return;

    const gestor = gestores[0];
    const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    const linhasMensagens = rows.map((m: any, i: number) => `
      <tr style="background:${i % 2 === 0 ? '#f8fafc' : 'white'}">
        <td style="padding:10px;border-bottom:1px solid #e2e8f0">${m.nome}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0">${m.email}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0">${m.mensagem.substring(0, 100)}${m.mensagem.length > 100 ? '...' : ''}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#6b7280">${new Date(m.criado_em).toLocaleString("pt-BR")}</td>
      </tr>
    `).join("");

    const appUrl = process.env.APP_URL || "https://certificacao-cca-staging.up.railway.app";

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || "ANEFAC <noreply@ckmtalents.net>",
        to: [gestor.email],
        subject: `[ANEFAC] ${rows.length} mensagem(ns) no Fale Conosco — ${agora}`,
        html: `
          <div style="font-family:sans-serif;max-width:700px;margin:0 auto;padding:20px">
            <div style="background:#0a1f5e;padding:20px;border-radius:12px 12px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:20px">ANEFAC — Fale Conosco</h1>
              <p style="color:#93c5fd;margin:5px 0 0;font-size:14px">Relatório de mensagens não lidas</p>
            </div>
            <div style="background:white;padding:20px;border:1px solid #e2e8f0;border-top:none">
              <p style="color:#374151">Olá, <strong>${gestor.full_name}</strong>!</p>
              <p style="color:#6b7280;font-size:14px">
                Há <strong>${rows.length} mensagem(ns)</strong> não lida(s) no Fale Conosco da plataforma ANEFAC.
              </p>
              <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
                <thead>
                  <tr style="background:#f1f5f9">
                    <th style="padding:10px;text-align:left;border-bottom:2px solid #e2e8f0">Nome</th>
                    <th style="padding:10px;text-align:left;border-bottom:2px solid #e2e8f0">E-mail</th>
                    <th style="padding:10px;text-align:left;border-bottom:2px solid #e2e8f0">Mensagem</th>
                    <th style="padding:10px;text-align:left;border-bottom:2px solid #e2e8f0">Data</th>
                  </tr>
                </thead>
                <tbody>${linhasMensagens}</tbody>
              </table>
              <div style="text-align:center;margin-top:24px">
                <a href="${appUrl}/novo-fluxo/admin/fale-conosco"
                   style="background:#0a1f5e;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">
                  Ver todas as mensagens →
                </a>
              </div>
            </div>
            <div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px">
              ANEFAC — Plataforma de Certificação Profissional
            </div>
          </div>
        `,
      }),
    });

    console.log(`[Scheduler] E-mail enviado ao gestor1 com ${rows.length} mensagem(ns) não lida(s)`);
  } catch (err) {
    console.error("[Scheduler] Erro ao enviar e-mail fale conosco:", err);
  }
}

// ── Verifica horários: 08h, 12h e 18h (horário de Brasília) ─────────────────

export function iniciarScheduler() {
  console.log("[Scheduler] Iniciado — verificação às 08h, 12h e 18h (Brasília)");

  setInterval(async () => {
    const agora = new Date();
    const horaBrasilia = new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const hora = horaBrasilia.getHours();
    const minuto = horaBrasilia.getMinutes();

    // Executa exatamente às 08:00, 12:00 e 18:00
    if ((hora === 8 || hora === 12 || hora === 18) && minuto === 0) {
      console.log(`[Scheduler] Verificando fale conosco às ${hora}h00...`);
      await enviarResumoFaleConosco();
    }
  }, 60 * 1000); // Verifica a cada minuto
}
