import { Router, Request, Response } from "express";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import {
  listarSimulacoesAtivas,
  iniciarSimulacao,
  buscarTentativa,
  responderSimulacao,
  finalizarSimulacao,
  buscarMinhaSimulacaoEmAndamento,
} from "../services/simulacaoService.js";

export const simulacaoRouter = Router();

// GET /api/simulacao/ativas — lista certificações com simulação ativa
simulacaoRouter.get("/ativas", async (_req: Request, res: Response) => {
  try {
    const simulacoes = await listarSimulacoesAtivas();
    return res.json({ simulacoes });
  } catch (err: any) {
    return res.status(500).json({ error: "Erro ao listar simulações" });
  }
});

// POST /api/simulacao/iniciar — inicia (ou retoma, se do mural) uma simulação
// optionalAuth: se vier logado, é do mural (retoma progresso); senão, pública (exige lead)
simulacaoRouter.post("/iniciar", optionalAuth, async (req: Request, res: Response) => {
  const { cert_slug, nome, email } = req.body;
  if (!cert_slug) return res.status(400).json({ error: "cert_slug é obrigatório" });

  const origem = req.user ? "mural" : "publica";
  if (origem === "publica" && (!nome || !email)) {
    return res.status(400).json({ error: "nome e email são obrigatórios para a simulação pública" });
  }

  try {
    const result = await iniciarSimulacao({
      certSlug: cert_slug,
      origem,
      userId: req.user?.userId,
      leadNome: nome,
      leadEmail: email,
    });
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/simulacao/minha-em-andamento/:certSlug — mural: existe simulação pra retomar?
simulacaoRouter.get("/minha-em-andamento/:certSlug", requireAuth, async (req: Request, res: Response) => {
  try {
    const tentativaId = await buscarMinhaSimulacaoEmAndamento(req.user!.userId, req.params.certSlug);
    return res.json({ tentativa_id: tentativaId });
  } catch (err: any) {
    return res.status(500).json({ error: "Erro ao buscar simulação em andamento" });
  }
});

// GET /api/simulacao/:tentativaId — estado atual (questões + respostas já dadas)
simulacaoRouter.get("/:tentativaId", async (req: Request, res: Response) => {
  try {
    const estado = await buscarTentativa(parseInt(req.params.tentativaId));
    return res.json(estado);
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});

// POST /api/simulacao/:tentativaId/responder — responde uma questão (revela na hora)
simulacaoRouter.post("/:tentativaId/responder", async (req: Request, res: Response) => {
  const { questao_id, resposta } = req.body;
  if (questao_id === undefined || resposta === undefined) {
    return res.status(400).json({ error: "questao_id e resposta são obrigatórios" });
  }
  try {
    const result = await responderSimulacao(parseInt(req.params.tentativaId), questao_id, resposta);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/simulacao/:tentativaId/finalizar — calcula o resultado final
simulacaoRouter.post("/:tentativaId/finalizar", async (req: Request, res: Response) => {
  try {
    const result = await finalizarSimulacao(parseInt(req.params.tentativaId));
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});
