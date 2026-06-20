import { enviarConfirmacaoEntrevista, enviarAvisoEntrevistador } from "../services/emailService.js";
import { verificarSlotsEAlertarSeNecessario } from "../services/schedulerService.js";
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
