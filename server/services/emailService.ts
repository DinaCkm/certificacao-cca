// Serviço de e-mail usando Resend
// Documentação: https://resend.com/docs

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "ANEFAC <noreply@anefac.com.br>";
const APP_URL = process.env.APP_URL || "https://certificacao-cca-staging.up.railway.app";

async function sendEmail(to: string | string[], subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn("⚠️  RESEND_API_KEY não configurada — e-mail não enviado:", subject);
    return null;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Erro ao enviar e-mail:", err);
    throw new Error(`Falha no envio de e-mail: ${err}`);
  }

  return res.json();
}

// ── Templates ─────────────────────────────────────────────────────────────────

function baseTemplate(conteudo: string) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f6f8; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: #1e3a5f; padding: 28px 32px; }
        .header h1 { color: white; margin: 0; font-size: 20px; font-weight: 700; }
        .header p { color: #93b3d4; margin: 4px 0 0; font-size: 13px; }
        .body { padding: 32px; }
        .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
        .alert-box { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .alert-box p { color: #92400e; margin: 0; font-size: 14px; }
        .stat-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .stat-number { font-size: 36px; font-weight: 800; color: #1e40af; }
        .stat-label { font-size: 13px; color: #3b82f6; margin-top: 4px; }
        .btn { display: inline-block; background: #1e3a5f; color: white !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 8px 0; }
        .footer { background: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb; }
        .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ANEFAC</h1>
          <p>Plataforma de Certificação Profissional</p>
        </div>
        <div class="body">${conteudo}</div>
        <div class="footer">
          <p>Este é um e-mail automático da Plataforma ANEFAC. Não responda a este e-mail.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ── E-mails específicos ────────────────────────────────────────────────────────

/**
 * Alerta de slots esgotados — enviado para Gestor N1 e Entrevistadores
 */
export async function enviarAlertaSlotsEsgotados(destinatarios: string[], candidatosAguardando: number) {
  const subject = `⚠️ URGENTE: Sem horários disponíveis para entrevistas — ${candidatosAguardando} candidato(s) aguardando`;

  const html = baseTemplate(`
    <p>Olá,</p>

    <div class="alert-box">
      <p><strong>⚠️ Atenção:</strong> Não há horários disponíveis para entrevistas na Plataforma ANEFAC.</p>
    </div>

    <div class="stat-box">
      <div class="stat-number">${candidatosAguardando}</div>
      <div class="stat-label">candidato(s) aguardando agendamento de entrevista</div>
    </div>

    <p>É necessário cadastrar novos slots de disponibilidade para que os candidatos possam agendar suas entrevistas.</p>

    <p>Acesse o painel agora para cadastrar horários disponíveis:</p>

    <a href="${APP_URL}/novo-fluxo/admin/slots" class="btn">
      Cadastrar Horários Disponíveis →
    </a>

    <p style="margin-top: 24px; font-size: 13px; color: #6b7280;">
      Lembre-se: os slots devem ter no mínimo <strong>7 dias de antecedência</strong> a partir de hoje.
    </p>
  `);

  return sendEmail(destinatarios, subject, html);
}

/**
 * Confirmação de entrevista agendada — enviado ao candidato
 */
export async function enviarConfirmacaoEntrevista(
  candidatoEmail: string,
  candidatoNome: string,
  dataHora: string,
  duracaoMinutos: number,
  certNome: string
) {
  const d = new Date(dataHora);
  const dataFormatada = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const horaFormatada = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const subject = `Entrevista agendada — ${certNome}`;

  const html = baseTemplate(`
    <p>Olá, <strong>${candidatoNome}</strong>!</p>

    <p>Sua entrevista técnica para a <strong>${certNome}</strong> foi confirmada com sucesso.</p>

    <div class="stat-box" style="text-align: left;">
      <p style="margin: 0 0 8px; font-size: 13px; color: #3b82f6; font-weight: 600;">DETALHES DA ENTREVISTA</p>
      <p style="margin: 0 0 6px; font-size: 15px;">📅 <strong>${dataFormatada}</strong></p>
      <p style="margin: 0 0 6px; font-size: 15px;">🕐 <strong>${horaFormatada}</strong> (horário de Brasília)</p>
      <p style="margin: 0 0 6px; font-size: 15px;">⏱ Duração: <strong>${duracaoMinutos} minutos</strong></p>
      <p style="margin: 0; font-size: 15px;">🎥 <strong>Videoconferência</strong> — link será enviado com antecedência</p>
    </div>

    <div class="alert-box">
      <p><strong>Importante:</strong> O agendamento é definitivo. Caso precise cancelar, entre em contato com a ANEFAC com pelo menos 48 horas de antecedência.</p>
    </div>

    <a href="${APP_URL}/novo-fluxo/sala-entrevista" class="btn">
      Acessar Plataforma →
    </a>
  `);

  return sendEmail(candidatoEmail, subject, html);
}

/**
 * Aviso ao entrevistador sobre nova entrevista agendada
 */
export async function enviarAvisoEntrevistador(
  entrevistadorEmail: string,
  entrevistadorNome: string,
  candidatoNome: string,
  dataHora: string,
  certNome: string
) {
  const d = new Date(dataHora);
  const dataFormatada = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const horaFormatada = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const subject = `Nova entrevista agendada — ${candidatoNome} — ${dataFormatada}`;

  const html = baseTemplate(`
    <p>Olá, <strong>${entrevistadorNome}</strong>!</p>

    <p>Um candidato agendou uma entrevista no seu horário disponível.</p>

    <div class="stat-box" style="text-align: left;">
      <p style="margin: 0 0 8px; font-size: 13px; color: #3b82f6; font-weight: 600;">DETALHES</p>
      <p style="margin: 0 0 6px; font-size: 15px;">👤 Candidato: <strong>${candidatoNome}</strong></p>
      <p style="margin: 0 0 6px; font-size: 15px;">🎓 Certificação: <strong>${certNome}</strong></p>
      <p style="margin: 0 0 6px; font-size: 15px;">📅 <strong>${dataFormatada}</strong></p>
      <p style="margin: 0; font-size: 15px;">🕐 <strong>${horaFormatada}</strong> (horário de Brasília)</p>
    </div>

    <p>Acesse o painel para ver os detalhes completos do candidato e se preparar para a entrevista.</p>

    <a href="${APP_URL}/novo-fluxo/admin" class="btn">
      Acessar Painel →
    </a>
  `);

  return sendEmail(entrevistadorEmail, subject, html);
}

/**
 * Lembrete diário de slots esgotados — versão mais compacta
 */
export async function enviarLembreteDiarioSlots(destinatarios: string[], candidatosAguardando: number) {
  const subject = `📅 Lembrete diário: ${candidatosAguardando} candidato(s) aguardando horário de entrevista`;

  const html = baseTemplate(`
    <p>Olá,</p>
    <p>Este é um lembrete automático: ainda não há horários disponíveis para entrevistas na plataforma ANEFAC.</p>

    <div class="stat-box">
      <div class="stat-number">${candidatosAguardando}</div>
      <div class="stat-label">candidato(s) aguardando agendamento</div>
    </div>

    <p>Por favor, cadastre novos slots de disponibilidade o quanto antes.</p>

    <a href="${APP_URL}/novo-fluxo/admin/slots" class="btn">
      Cadastrar Horários →
    </a>
  `);

  return sendEmail(destinatarios, subject, html);
}
