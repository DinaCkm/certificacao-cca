import { Router, Request, Response } from "express";
import { buscarEdital } from "../services/editalService.js";

export const editalPublicoRouter = Router();

// GET /api/certificacoes/:slug/edital — público
editalPublicoRouter.get("/:slug/edital", async (req: Request, res: Response) => {
  try {
    const edital = await buscarEdital(req.params.slug);
    return res.json({ edital });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar edital" });
  }
});
