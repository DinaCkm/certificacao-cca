import { Router, Request, Response } from "express";
import { db } from "../db/connection.js";

// Rota pública — usada pela tela real de Upload de Documentos e pela vitrine
// de certificações, para sempre mostrar a lista definida pelo admin no banco
// (não mais um valor padrão hardcoded que nunca mudava para o candidato).
export const certificacoesPublicoRouter = Router();

certificacoesPublicoRouter.get("/documentos-exigidos", async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(
      `SELECT slug, documentos_exigidos FROM certification_types`
    ) as any;

    const mapa: Record<string, string[]> = {};
    for (const r of rows) {
      if (r.documentos_exigidos) {
        mapa[r.slug] = typeof r.documentos_exigidos === "string"
          ? JSON.parse(r.documentos_exigidos)
          : r.documentos_exigidos;
      }
    }
    return res.json({ documentosExigidos: mapa });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar documentos exigidos" });
  }
});
