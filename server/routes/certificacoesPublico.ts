import { Router, Request, Response } from "express";
import { db } from "../db/connection.js";

// Rota pública — usada pela tela real de Upload de Documentos e pela vitrine
// de certificações, para sempre mostrar a lista definida pelo admin no banco
// (não mais um valor padrão hardcoded que nunca mudava para o candidato).
export const certificacoesPublicoRouter = Router();

// GET /api/certificacoes/publico — lista COMPLETA das certificações que existem
// de verdade no banco (nome, número, taxas, caminho, documentos, status). Usada
// para que uma certificação criada pelo admin passe a existir também no
// navegador de qualquer candidato, não só no de quem a criou.
certificacoesPublicoRouter.get("/publico", async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(
      `SELECT slug, nome, numero, taxa_analise, taxa_emissao, caminho_default,
              documentos_exigidos, status
       FROM certification_types`
    ) as any;

    const certificacoes = rows.map((r: any) => ({
      id: r.slug,
      nome: r.nome,
      numero: r.numero,
      taxaAnalise: Number(r.taxa_analise) || 0,
      taxaEmissao: Number(r.taxa_emissao) || 0,
      caminhoDefault: r.caminho_default || null,
      status: r.status || "ativa",
      documentosExigidos: r.documentos_exigidos
        ? (typeof r.documentos_exigidos === "string" ? JSON.parse(r.documentos_exigidos) : r.documentos_exigidos)
        : [],
    }));

    return res.json({ certificacoes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar certificações" });
  }
});

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
