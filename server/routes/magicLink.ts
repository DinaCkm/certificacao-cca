import { Router, Request, Response } from "express";
import { validarEConsumirMagicLink } from "../services/magicLinkService.js";

export const magicLinkRouter = Router();

// GET /api/auth/magic/:token — público (o token É a autenticação)
magicLinkRouter.get("/:token", async (req: Request, res: Response) => {
  try {
    const resultado = await validarEConsumirMagicLink(req.params.token);
    return res.json(resultado);
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
});
