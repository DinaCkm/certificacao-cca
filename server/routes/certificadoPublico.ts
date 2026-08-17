import { Router, Request, Response } from "express";
import { buscarCertificadoPublico } from "../services/certificadoService.js";

export const certificadoPublicoRouter = Router();

// GET /api/validar-certificado/:codigo — público, sem autenticação (é o que o QR Code abre)
certificadoPublicoRouter.get("/:codigo", async (req: Request, res: Response) => {
  try {
    const certificado = await buscarCertificadoPublico(req.params.codigo.toUpperCase());
    if (!certificado) return res.status(404).json({ error: "Certificado não encontrado. Confira o código informado." });
    return res.json({ certificado });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao consultar certificado" });
  }
});
