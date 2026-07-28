import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  verificarDisponibilidadeProva,
  iniciarTentativa,
  buscarQuestoesSemGabarito,
  submeterProva,
  buscarHistoricoTentativas,
} from "../services/provaService.js";
import {
  listarSalasDisponiveis,
  agendarProva,
  entrarNaSalaProva,
  registrarViolacao,
} from "../services/provaAgendamentoService.js";

export const provaRouter = Router();

// Todas as rotas exigem autenticação
provaRouter.use(requireAuth);

// ── GET /api/prova/salas-disponiveis ──────────────────────────────────────────
// Lista salas com vaga para o candidato agendar sua prova

provaRouter.get("/salas-disponiveis", async (req: Request, res: Response) => {
  try {
    const result = await listarSalasDisponiveis(req.user!.userId);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ── POST /api/prova/agendar ────────────────────────────────────────────────────
// Candidato agenda uma sala de prova

provaRouter.post("/agendar", async (req: Request, res: Response) => {
  const { sala_id } = req.body;
  if (!sala_id) return res.status(400).json({ error: "sala_id é obrigatório" });

  try {
    const result = await agendarProva(req.user!.userId, parseInt(sala_id));

    try {
      const { enviarConfirmacaoAgendamentoProva } = await import("../services/emailService.js");
      const { db } = await import("../db/connection.js");
      const [u] = await db.execute(`SELECT full_name, email FROM users WHERE id = ?`, [req.user!.userId]) as any;
      await enviarConfirmacaoAgendamentoProva(
        u[0].email, u[0].full_name, String(result.data_hora), result.duracao_minutos, result.cert_nome
      );
    } catch (emailErr) {
      console.warn("Confirmação de agendamento de prova falhou (não crítico):", emailErr);
    }

    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ── POST /api/prova/sala/:salaId/entrar ───────────────────────────────────────
// Candidato entra na sala de vídeo no horário da prova

provaRouter.post("/sala/:salaId/entrar", async (req: Request, res: Response) => {
  try {
    const { db } = await import("../db/connection.js");
    const [u] = await db.execute(`SELECT full_name FROM users WHERE id = ?`, [req.user!.userId]) as any;
    const result = await entrarNaSalaProva(req.user!.userId, parseInt(req.params.salaId), u[0].full_name);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ── POST /api/prova/violacao ───────────────────────────────────────────────────
// Registra troca de aba / saída de fullscreen durante a prova

provaRouter.post("/violacao", async (req: Request, res: Response) => {
  const { tentativa_id, tipo } = req.body;
  if (!tentativa_id || !["troca_aba", "saida_fullscreen"].includes(tipo)) {
    return res.status(400).json({ error: "tentativa_id e tipo (troca_aba|saida_fullscreen) são obrigatórios" });
  }
  try {
    const result = await registrarViolacao(parseInt(tentativa_id), req.user!.userId, tipo);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ── GET /api/prova/disponivel ─────────────────────────────────────────────────
// Verifica se candidato pode fazer prova

provaRouter.get("/disponivel", async (req: Request, res: Response) => {
  try {
    const result = await verificarDisponibilidadeProva(req.user!.userId);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao verificar disponibilidade" });
  }
});

// ── POST /api/prova/iniciar ───────────────────────────────────────────────────
// Inicia uma tentativa de prova

provaRouter.post("/iniciar", async (req: Request, res: Response) => {
  try {
    const result = await iniciarTentativa(req.user!.userId);
    return res.status(201).json(result);
  } catch (err: any) {
    const status = err.message.includes("máximo") ? 403 : 400;
    return res.status(status).json({ error: err.message });
  }
});

// ── GET /api/prova/questoes/:tentativaId ──────────────────────────────────────
// Retorna questões SEM gabarito — gabarito nunca vai ao frontend

provaRouter.get("/questoes/:tentativaId", async (req: Request, res: Response) => {
  try {
    const result = await buscarQuestoesSemGabarito(
      parseInt(req.params.tentativaId),
      req.user!.userId
    );
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ── POST /api/prova/submeter ──────────────────────────────────────────────────
// Recebe respostas e calcula resultado NO SERVIDOR

provaRouter.post("/submeter", async (req: Request, res: Response) => {
  const { tentativa_id, respostas } = req.body;

  if (!tentativa_id || !respostas || !Array.isArray(respostas)) {
    return res.status(400).json({ error: "tentativa_id e respostas são obrigatórios" });
  }

  try {
    const result = await submeterProva(
      parseInt(tentativa_id),
      req.user!.userId,
      respostas
    );
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ── GET /api/prova/historico ──────────────────────────────────────────────────
// Histórico de tentativas do candidato logado

provaRouter.get("/historico", async (req: Request, res: Response) => {
  try {
    const tentativas = await buscarHistoricoTentativas(req.user!.userId);
    return res.json({ tentativas });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

// ── GET /api/prova/resultado/:tentativaId ─────────────────────────────────────
// Resultado de tentativa específica

provaRouter.get("/resultado/:tentativaId", async (req: Request, res: Response) => {
  try {
    const { db } = await import("../db/connection.js");
    const [rows] = await db.execute(
      `SELECT t.id, t.numero_tentativa, t.status, t.acertos, t.total_questoes,
              t.percentual, t.aprovado, t.iniciada_em, t.finalizada_em,
              pc.nota_minima
       FROM tentativas_prova t
       JOIN candidato_processos cp ON cp.id = t.processo_id
       JOIN certification_types ct ON ct.id = cp.certification_type_id
       LEFT JOIN prova_config pc ON pc.cert_slug = ct.slug
       WHERE t.id = ? AND t.user_id = ?`,
      [parseInt(req.params.tentativaId), req.user!.userId]
    ) as any;

    if (!rows.length) {
      return res.status(404).json({ error: "Tentativa não encontrada" });
    }

    const t = rows[0];
    return res.json({
      tentativa_id: t.id,
      numero_tentativa: t.numero_tentativa,
      status: t.status,
      acertos: t.acertos,
      total_questoes: t.total_questoes,
      percentual: parseFloat(t.percentual),
      aprovado: !!t.aprovado,
      nota_minima: t.nota_minima || 60,
      iniciada_em: t.iniciada_em,
      finalizada_em: t.finalizada_em,
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar resultado" });
  }
});
