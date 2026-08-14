import { Router, Request, Response } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { verificarAssinatura, assinarCodigoConduta, listarAssinaturasAdmin } from "../services/codigoCondutaService.js";

export const codigoCondutaRouter = Router();
codigoCondutaRouter.use(requireAuth);

// GET /api/codigo-conduta/status?versao=1 — já assinei esta versão?
codigoCondutaRouter.get("/status", async (req: Request, res: Response) => {
  const versao = parseInt(req.query.versao as string) || 1;
  try {
    const assinatura = await verificarAssinatura(req.user!.userId, versao);
    return res.json({ assinado: !!assinatura, assinatura });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao verificar assinatura" });
  }
});

// POST /api/codigo-conduta/assinar
codigoCondutaRouter.post("/assinar", async (req: Request, res: Response) => {
  const { nome_digitado, versao, processo_id, tipo_documento } = req.body;
  if (!nome_digitado || !nome_digitado.trim()) {
    return res.status(400).json({ error: "Digite seu nome completo para confirmar a assinatura" });
  }
  if (!versao) return res.status(400).json({ error: "versao é obrigatória" });

  try {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || null;
    const resultado = await assinarCodigoConduta({
      userId: req.user!.userId,
      nomeDigitado: nome_digitado.trim(),
      versao: parseInt(versao),
      ip,
      processoId: processo_id || null,
      tipoDocumento: tipo_documento || null,
    });
    return res.status(201).json(resultado);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao registrar assinatura" });
  }
});

// GET /api/admin/codigo-conduta/assinaturas — admin consulta quem assinou
export const codigoCondutaAdminRouter = Router();
codigoCondutaAdminRouter.use(requireAuth);
codigoCondutaAdminRouter.get("/assinaturas",
  requireRole("administrador", "gestor_n1", "gestor_n2"),
  async (_req: Request, res: Response) => {
    try {
      const assinaturas = await listarAssinaturasAdmin();
      return res.json({ assinaturas });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao listar assinaturas" });
    }
  }
);
