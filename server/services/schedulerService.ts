// Serviço de verificação periódica de slots
// Roda uma vez por dia e dispara alertas quando necessário

import { db } from "../db/connection.js";
import { enviarAlertaSlotsEsgotados, enviarLembreteDiarioSlots } from "./emailService.js";

/**
 * Verifica se há slots disponíveis e dispara alertas se necessário.
 * Chamado: (1) imediatamente após um slot ser ocupado, (2) diariamente via cron.
 */
export async function verificarSlotsEAlertarSeNecessario() {
  try {
    // Conta slots disponíveis (não ocupados, com data futura válida + 7 dias)
    const minData = new Date();
    minData.setDate(minData.getDate() + 7);

    const [slotsRows] = await db.execute(
      `SELECT COUNT(*) as total FROM slots_entrevista
       WHERE ocupado = FALSE AND data_hora >= ?`,
      [minData.toISOString().slice(0, 19).replace("T", " ")]
    ) as any;

    const totalSlotsDisponiveis = slotsRows[0].total;

    // Conta candidatos aguardando agendamento
    const [candidatosRows] = await db.execute(
      `SELECT COUNT(*) as total FROM candidato_processos
       WHERE status_geral = 'agendamento'`
    ) as any;

    const candidatosAguardando = candidatosRows[0].total;

    // Se não há slots E há candidatos aguardando → dispara alerta
    if (totalSlotsDisponiveis === 0 && candidatosAguardando > 0) {
      await dispararAlerta(candidatosAguardando);
    }

    // Se há apenas 1 slot restante → alerta preventivo
    if (totalSlotsDisponiveis === 1 && candidatosAguardando > 0) {
      await dispararAlerta(candidatosAguardando, true);
    }

    return { totalSlotsDisponiveis, candidatosAguardando };
  } catch (err) {
    console.error("Erro ao verificar slots:", err);
  }
}

async function dispararAlerta(candidatosAguardando: number, preventivo = false) {
  try {
    // Busca e-mails de todos os Gestores N1 e Entrevistadores ativos
    const [destinatariosRows] = await db.execute(
      `SELECT u.email, u.full_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE r.code IN ('gestor_n1', 'entrevistador', 'administrador')
       AND u.is_active = TRUE`
    ) as any;

    if (destinatariosRows.length === 0) {
      console.warn("⚠️  Nenhum destinatário encontrado para alerta de slots");
      return;
    }

    const emails = destinatariosRows.map((r: any) => r.email);

    if (preventivo) {
      console.log(`📧 Alerta preventivo: apenas 1 slot disponível. Enviando para ${emails.length} destinatário(s)`);
    } else {
      console.log(`📧 Alerta: sem slots disponíveis. ${candidatosAguardando} candidato(s) aguardando. Enviando para ${emails.length} destinatário(s)`);
    }

    await enviarAlertaSlotsEsgotados(emails, candidatosAguardando);

    // Registra no audit_log
    await db.execute(
      `INSERT INTO audit_log (acao, entidade, descricao, resultado)
       VALUES ('alerta_slots_esgotados', 'slots_entrevista', ?, 'sucesso')`,
      [`Alerta enviado para ${emails.length} destinatário(s). ${candidatosAguardando} candidato(s) aguardando.`]
    );
  } catch (err) {
    console.error("Erro ao disparar alerta de slots:", err);
  }
}

/**
 * Inicia o verificador diário (roda todo dia às 08h)
 */
export function iniciarVerificadorDiario() {
  console.log("⏰ Verificador diário de slots iniciado");

  // Calcula quanto tempo falta para as 08h00 de amanhã
  function proximasOitoHoras() {
    const agora = new Date();
    const proxima = new Date();
    proxima.setHours(8, 0, 0, 0);
    if (agora >= proxima) {
      proxima.setDate(proxima.getDate() + 1);
    }
    return proxima.getTime() - agora.getTime();
  }

  // Agenda primeira execução
  setTimeout(async () => {
    await verificarSlotsEAlertarSeNecessario();
    console.log("✅ Verificação diária de slots executada");

    // Depois repete a cada 24 horas
    setInterval(async () => {
      await verificarSlotsEAlertarSeNecessario();
      console.log("✅ Verificação diária de slots executada");
    }, 24 * 60 * 60 * 1000);
  }, proximasOitoHoras());
}
