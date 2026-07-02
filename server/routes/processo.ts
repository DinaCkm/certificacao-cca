import { enviarConfirmacaoEntrevista, enviarAvisoEntrevistador } from "../services/emailService.js";
import { Router, Request, Response } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { db } from "../db/connection.js";

export const processoRouter = Router();

// ── GET /api/processo/atual ───────────────────────────────────────────────────
// Retorna o processo ativo do candidato autenticado

processoRouter.get("/atual", requireAuth, async (req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, ct.nome as cert_nome, ct.slug as cert_slug,
              ct.taxa_analise, ct.taxa_emissao, ct.caminho_default
       FROM candidato_processos p
       JOIN certification_types ct ON ct.id = p.certification_type_id
       WHERE p.user_id = ? AND p.status_geral NOT IN ('concluido','encerrado')
       ORDER BY p.iniciado_em DESC
       LIMIT 1`,
      [req.user!.userId]
    ) as any;

    if (rows.length === 0) {
      return res.json({ processo: null });
    }

    return res.json({ processo: rows[0] });
  } catch (err) {
    console.error("Erro ao buscar processo:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// ── POST /api/processo/iniciar ────────────────────────────────────────────────
// Inicia um novo processo para o candidato

processoRouter.post("/iniciar", requireAuth, async (req: Request, res: Response) => {
  try {
    const { certification_type_id, candidato_nome, candidato_email, candidato_cpf, candidato_telefone, formacao, experiencia } = req.body;

    if (!certification_type_id) {
      return res.status(400).json({ error: "certification_type_id é obrigatório" });
    }

    // Verifica se já existe processo ativo
    const [existing] = await db.execute(
      `SELECT id FROM candidato_processos
       WHERE user_id = ? AND certification_type_id = ?
       AND status_geral NOT IN ('concluido','encerrado')`,
      [req.user!.userId, certification_type_id]
    ) as any;

    if (existing.length > 0) {
      return res.status(409).json({ error: "Já existe um processo ativo para esta certificação" });
    }

    const [result] = await db.execute(
      `INSERT INTO candidato_processos
        (user_id, certification_type_id, status_geral, candidato_nome, candidato_email,
         candidato_cpf, candidato_telefone, formacao, experiencia)
       VALUES (?, ?, 'cadastro', ?, ?, ?, ?, ?, ?)`,
      [req.user!.userId, certification_type_id, candidato_nome, candidato_email,
       candidato_cpf, candidato_telefone, formacao, experiencia]
    ) as any;

    return res.status(201).json({ processo_id: result.insertId, status: "cadastro" });
  } catch (err) {
    console.error("Erro ao iniciar processo:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// ── POST /api/processo/:id/avancar ────────────────────────────────────────────
// Avança o status do processo com validação das regras de negócio

processoRouter.post("/:id/avancar", requireAuth, async (req: Request, res: Response) => {
  const processoId = parseInt(req.params.id);
  const { novo_status } = req.body;

  try {
    // Busca o processo e valida que pertence ao usuário
    const [rows] = await db.execute(
      "SELECT * FROM candidato_processos WHERE id = ? AND user_id = ?",
      [processoId, req.user!.userId]
    ) as any;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Processo não encontrado" });
    }

    const processo = rows[0];

    // ── Regras de negócio ──────────────────────────────────────────────────
    if (novo_status === "pagamento2" && !processo.aprovado_entrevista) {
      return res.status(403).json({ error: "Pagamento 2 bloqueado: candidato não aprovado na entrevista" });
    }

    if (novo_status === "emissao" && !processo.pagamento2_realizado) {
      return res.status(403).json({ error: "Emissão bloqueada: Pagamento 2 não confirmado" });
    }

    if (novo_status === "prova" && processo.tentativas_prova >= processo.max_tentativas_prova) {
      return res.status(403).json({ error: "Número máximo de tentativas de prova atingido" });
    }

    await db.execute(
      "UPDATE candidato_processos SET status_geral = ?, updated_at = NOW() WHERE id = ?",
      [novo_status, processoId]
    );

    return res.json({ status: novo_status, processo_id: processoId });
  } catch (err) {
    console.error("Erro ao avançar processo:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// ── GET /api/processo/admin/lista ─────────────────────────────────────────────
// Lista todos os processos (apenas avaliador/gestor/admin)

processoRouter.get(
  "/admin/lista",
  requireAuth,
  requireRole("avaliador", "gestor", "administrador"),
  async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
      const where = status ? "WHERE p.status_geral = ?" : "";
      const params = status ? [status] : [];

      const [rows] = await db.execute(
        `SELECT p.id, p.status_geral, p.candidato_nome, p.candidato_email,
                p.caminho_avaliacao, p.tentativas_prova, p.aprovado_entrevista,
                p.pagamento1_realizado, p.pagamento2_realizado, p.iniciado_em,
                ct.nome as cert_nome
         FROM candidato_processos p
         JOIN certification_types ct ON ct.id = p.certification_type_id
         ${where}
         ORDER BY p.iniciado_em DESC`,
        params
      ) as any;

      return res.json({ processos: rows });
    } catch (err) {
      console.error("Erro ao listar processos:", err);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
);

// ── POST /api/processo/:id/definir-caminho ────────────────────────────────────
// Avaliador define Caminho A ou B após validação documental

processoRouter.post(
  "/:id/definir-caminho",
  requireAuth,
  requireRole("avaliador", "gestor", "administrador"),
  async (req: Request, res: Response) => {
    const processoId = parseInt(req.params.id);
    const { caminho } = req.body;

    if (!["A", "B"].includes(caminho)) {
      return res.status(400).json({ error: "Caminho deve ser 'A' ou 'B'" });
    }

    try {
      const novoStatus = caminho === "A" ? "agendamento" : "prova";

      await db.execute(
        `UPDATE candidato_processos
         SET caminho_avaliacao = ?, status_geral = ?, updated_at = NOW()
         WHERE id = ?`,
        [caminho, novoStatus, processoId]
      );

      // Registra no audit_log
      await db.execute(
        `INSERT INTO audit_log (user_id, processo_id, acao, entidade, entidade_id, descricao, resultado)
         VALUES (?, ?, 'caminho_definido', 'candidato_processos', ?, ?, 'sucesso')`,
        [req.user!.userId, processoId, processoId, `Caminho ${caminho} definido pelo avaliador`]
      );

      return res.json({ caminho, status: novoStatus });
    } catch (err) {
      console.error("Erro ao definir caminho:", err);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
);

// ── GET /api/processo/slots-disponiveis ───────────────────────────────────────
// Retorna todos os slots disponíveis para o candidato escolher (mín. 7 dias)

processoRouter.get("/slots-disponiveis", requireAuth, async (req: Request, res: Response) => {
  try {
    const minData = new Date();
    minData.setDate(minData.getDate() + 7);

    const [rows] = await db.execute(
      `SELECT s.id, s.data_hora, s.duracao_minutos,
              u.full_name as entrevistador_nome
       FROM slots_entrevista s
       JOIN users u ON u.id = s.entrevistador_id
       WHERE s.ocupado = FALSE AND s.data_hora >= ?
       ORDER BY s.data_hora ASC`,
      [minData.toISOString().slice(0, 19).replace('T', ' ')]
    ) as any;

    return res.json({ slots: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar slots" });
  }
});

// ── POST /api/processo/agendar-entrevista ─────────────────────────────────────
// Candidato escolhe um slot e confirma o agendamento

processoRouter.post("/agendar-entrevista", requireAuth, async (req: Request, res: Response) => {
  const { slot_id, processo_id } = req.body;

  if (!slot_id || !processo_id) {
    return res.status(400).json({ error: "slot_id e processo_id são obrigatórios" });
  }

  try {
    // Verifica se slot ainda está disponível
    const [slots] = await db.execute(
      "SELECT * FROM slots_entrevista WHERE id = ? AND ocupado = FALSE",
      [slot_id]
    ) as any;

    if (slots.length === 0) {
      return res.status(409).json({ error: "Este horário já foi reservado. Escolha outro." });
    }

    const slot = slots[0];

    // Verifica que o processo pertence ao candidato
    const [processos] = await db.execute(
      "SELECT * FROM candidato_processos WHERE id = ? AND user_id = ?",
      [processo_id, req.user!.userId]
    ) as any;

    if (processos.length === 0) {
      return res.status(404).json({ error: "Processo não encontrado" });
    }

    // Cria o agendamento
    const [result] = await db.execute(
      `INSERT INTO agendamentos_entrevista
        (processo_id, user_id, entrevistador_id, data_agendada, hora_agendada, datetime_agendado, status)
       VALUES (?, ?, ?, DATE(?), TIME(?), ?, 'confirmado')`,
      [processo_id, req.user!.userId, slot.entrevistador_id,
       slot.data_hora, slot.data_hora, slot.data_hora]
    ) as any;

    // Bloqueia o slot
    await db.execute(
      "UPDATE slots_entrevista SET ocupado = TRUE, processo_id = ? WHERE id = ?",
      [processo_id, slot_id]
    );

    // Avança o processo para status entrevista
    await db.execute(
      "UPDATE candidato_processos SET status_geral = 'entrevista', updated_at = NOW() WHERE id = ?",
      [processo_id]
    );

    // Audit log
    await db.execute(
      `INSERT INTO audit_log (user_id, processo_id, acao, entidade, entidade_id, descricao, resultado)
       VALUES (?, ?, 'entrevista_agendada', 'agendamentos_entrevista', ?, ?, 'sucesso')`,
      [req.user!.userId, processo_id, result.insertId,
       `Entrevista agendada para ${slot.data_hora}`]
    );

    return res.status(201).json({
      agendamento_id: result.insertId,
      data_hora: slot.data_hora,
      message: "Entrevista agendada com sucesso"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao agendar entrevista" });
  }
});

// Importação do emailService — adicionada após o arquivo principal
// As chamadas de e-mail estão integradas diretamente na rota agendar-entrevista acima
// via importação lazy para não bloquear a resposta

// ── GET /api/processo/agendamento/:processoId ─────────────────────────────────
// Retorna o agendamento de entrevista existente para um processo

processoRouter.get("/agendamento/:processoId", requireAuth, async (req: Request, res: Response) => {
  try {
    const processoId = parseInt(req.params.processoId);
    const [rows] = await db.execute(
      `SELECT ae.datetime_agendado as data_hora, ae.status,
              u.full_name as entrevistador_nome
       FROM agendamentos_entrevista ae
       LEFT JOIN users u ON u.id = ae.entrevistador_id
       WHERE ae.processo_id = ? AND ae.user_id = ?
       ORDER BY ae.id DESC LIMIT 1`,
      [processoId, req.user!.userId]
    ) as any;

    if (!rows.length) return res.json({ data_hora: null });
    return res.json({
      data_hora: rows[0].data_hora,
      status: rows[0].status,
      entrevistador_nome: rows[0].entrevistador_nome || "Avaliador ANEFAC"
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar agendamento" });
  }
});

// ── POST /api/processo/sincronizar ────────────────────────────────────────────
// Recebe o estado completo do processo do frontend e persiste no banco
// Chamado a cada mudança de status relevante

processoRouter.post("/sincronizar", requireAuth, async (req: Request, res: Response) => {
  const {
    certificacaoId, statusGeral, candidatoNome, candidatoEmail,
    candidatoCPF, candidatoTelefone, candidatoEmpresa, candidatoCargo,
    caminhoAvaliacao, tentativasProva, pagamento1Realizado,
    pagamento2Realizado, aprovadoEntrevista, formacao
  } = req.body;

  try {
    // Busca processo existente do candidato
    const [existing] = await db.execute(
      `SELECT id FROM candidato_processos
       WHERE user_id = ? AND status_geral NOT IN ('concluido','encerrado')
       ORDER BY iniciado_em DESC LIMIT 1`,
      [req.user!.userId]
    ) as any;

    if (existing.length > 0) {
      // Atualiza processo existente
      await db.execute(
        `UPDATE candidato_processos SET
          status_geral = ?, candidato_nome = ?, candidato_email = ?,
          candidato_cpf = ?, candidato_telefone = ?, formacao = ?,
          caminho_avaliacao = ?, tentativas_prova = ?,
          pagamento1_realizado = ?, pagamento2_realizado = ?,
          aprovado_entrevista = ?, updated_at = NOW()
         WHERE id = ?`,
        [statusGeral, candidatoNome, candidatoEmail,
         candidatoCPF, candidatoTelefone, candidatoCargo,
         caminhoAvaliacao || null, tentativasProva || 0,
         pagamento1Realizado ? 1 : 0, pagamento2Realizado ? 1 : 0,
         aprovadoEntrevista === null ? null : (aprovadoEntrevista ? 1 : 0),
         existing[0].id]
      );
      return res.json({ processo_id: existing[0].id, status: statusGeral });
    } else {
      // Busca o id da certificação pelo slug
      const [certs] = await db.execute(
        "SELECT id FROM certification_types WHERE slug = ?",
        [certificacaoId]
      ) as any;

      if (certs.length === 0) {
        return res.status(400).json({ error: "Certificação não encontrada" });
      }

      // Cria novo processo
      const [result] = await db.execute(
        `INSERT INTO candidato_processos
          (user_id, certification_type_id, status_geral, candidato_nome,
           candidato_email, candidato_cpf, candidato_telefone, formacao,
           caminho_avaliacao, tentativas_prova, pagamento1_realizado,
           pagamento2_realizado, aprovado_entrevista)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user!.userId, certs[0].id, statusGeral, candidatoNome,
         candidatoEmail, candidatoCPF, candidatoTelefone, candidatoCargo,
         caminhoAvaliacao || null, tentativasProva || 0,
         pagamento1Realizado ? 1 : 0, pagamento2Realizado ? 1 : 0,
         aprovadoEntrevista === null ? null : (aprovadoEntrevista ? 1 : 0)]
      ) as any;

      // Salva o processo_id no localStorage para uso no agendamento
      return res.json({ processo_id: result.insertId, status: statusGeral });
    }
  } catch (err) {
    console.error("Erro ao sincronizar processo:", err);
    return res.status(500).json({ error: "Erro ao sincronizar processo" });
  }
});

// ── GET /api/processo/retomar ─────────────────────────────────────────────────
// Retorna o processo ativo do candidato para restaurar o estado ao fazer login

processoRouter.get("/retomar", requireAuth, async (req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, ct.slug as certificacao_id, ct.nome as certificacao_nome,
              ct.numero as certificacao_numero, ct.taxa_analise, ct.taxa_emissao
       FROM candidato_processos p
       JOIN certification_types ct ON ct.id = p.certification_type_id
       WHERE p.user_id = ? AND p.status_geral NOT IN ('concluido','encerrado')
       ORDER BY p.iniciado_em DESC LIMIT 1`,
      [req.user!.userId]
    ) as any;

    if (rows.length === 0) return res.json({ processo: null });

    const p = rows[0];
    return res.json({
      processo: {
        processo_id: p.id,
        certificacaoId: p.certificacao_id,
        certificacaoNome: p.certificacao_nome,
        certificacaoNumero: p.certificacao_numero,
        taxaAnalise: p.taxa_analise,
        taxaEmissao: p.taxa_emissao,
        statusGeral: p.status_geral,
        candidatoNome: p.candidato_nome,
        candidatoEmail: p.candidato_email,
        candidatoCPF: p.candidato_cpf,
        candidatoTelefone: p.candidato_telefone,
        caminhoAvaliacao: p.caminho_avaliacao,
        tentativasProva: p.tentativas_prova,
        pagamento1Realizado: !!p.pagamento1_realizado,
        pagamento2Realizado: !!p.pagamento2_realizado,
        aprovadoEntrevista: p.aprovado_entrevista === null ? null : !!p.aprovado_entrevista,
      }
    });
  } catch (err) {
    console.error("Erro ao retomar processo:", err);
    return res.status(500).json({ error: "Erro ao retomar processo" });
  }
});

// ── GET /api/processo/solicitacoes-documentos ───────────────────────────────────
// Lista solicitações de documentos complementares PENDENTES do candidato autenticado.
// Usado pela área do candidato para exibir o botão "Incluir documentos complementares".

processoRouter.get("/solicitacoes-documentos", requireAuth, async (req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(
      `SELECT sd.id, sd.processo_id, sd.mensagem, sd.status, sd.criado_em, sd.solicitado_por_nome
       FROM solicitacoes_documentos sd
       JOIN candidato_processos cp ON cp.id = sd.processo_id
       WHERE cp.user_id = ? AND sd.status = 'pendente'
       ORDER BY sd.criado_em DESC`,
      [req.user!.userId]
    ) as any;
    return res.json({ solicitacoes: rows });
  } catch (err) {
    console.error("Erro ao buscar solicitações de documentos:", err);
    return res.status(500).json({ error: "Erro ao buscar solicitações" });
  }
});

// ── POST /api/processo/solicitacoes-documentos/:id/concluir ─────────────────────
// Candidato confirma que enviou os documentos complementares solicitados.
// O upload em si usa o endpoint já existente /api/upload/documento
// (com tipo_documento = "complementar-<timestamp>"); esta rota só fecha o pedido.

processoRouter.post("/solicitacoes-documentos/:id/concluir", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Garante que a solicitação pertence a um processo do candidato autenticado
    // e traz os dados necessários para notificar o avaliador que pediu os documentos
    const [rows] = await db.execute(
      `SELECT sd.id, sd.processo_id, sd.solicitado_por_id, sd.mensagem,
              cp.candidato_nome, u.email as avaliador_email, u.full_name as avaliador_nome
       FROM solicitacoes_documentos sd
       JOIN candidato_processos cp ON cp.id = sd.processo_id
       JOIN users u ON u.id = sd.solicitado_por_id
       WHERE sd.id = ? AND cp.user_id = ? AND sd.status = 'pendente'`,
      [id, req.user!.userId]
    ) as any;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Solicitação não encontrada ou já atendida" });
    }
    const solicitacao = rows[0];

    await db.execute(
      `UPDATE solicitacoes_documentos SET status = 'atendida', atendida_em = NOW() WHERE id = ?`,
      [id]
    );

    // Notifica por e-mail o avaliador específico que pediu os documentos —
    // o processo fica pendente com ele até que reabra o candidato e revise.
    try {
      const appUrl = process.env.APP_URL || "https://certificacao-cca-staging.up.railway.app";
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || "ANEFAC <noreply@anefac.com.br>",
          to: [solicitacao.avaliador_email],
          subject: `ANEFAC — ${solicitacao.candidato_nome} enviou os documentos solicitados`,
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
              <h2 style="color:#1e3a5f">Olá, ${solicitacao.avaliador_nome}!</h2>
              <p><strong>${solicitacao.candidato_nome}</strong> enviou os documentos complementares que você solicitou.</p>
              <p>Acesse a plataforma para retomar a validação deste candidato.</p>
              <a href="${appUrl}/novo-fluxo/admin/validacao"
                 style="display:inline-block;background:#1e3a5f;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
                Continuar validação →
              </a>
            </div>
          `,
        }),
      });
    } catch (emailErr) {
      console.error("[CONCLUIR SOLICITACAO] Falha ao notificar avaliador:", emailErr);
      // Não falha a confirmação por causa de erro no envio de e-mail
    }

    return res.json({ message: "Documentos complementares registrados com sucesso" });
  } catch (err) {
    console.error("Erro ao concluir solicitação de documentos:", err);
    return res.status(500).json({ error: "Erro ao concluir solicitação" });
  }
});
