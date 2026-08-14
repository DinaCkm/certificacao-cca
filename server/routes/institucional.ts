import { Router, Request, Response } from "express";
import { db } from "../db/connection.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const institucionalRouter = Router();

// GET /api/institucional — público, qualquer visitante/candidato lê o conteúdo real
institucionalRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(`SELECT dados, codigo_conduta_versao FROM institucional_config WHERE id = 1`) as any;
    if (!rows.length) {
      return res.json({ institucional: null, codigoCondutaVersao: null });
    }
    const dados = typeof rows[0].dados === "string" ? JSON.parse(rows[0].dados) : rows[0].dados;
    return res.json({ institucional: dados, codigoCondutaVersao: rows[0].codigo_conduta_versao });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao carregar conteúdo institucional" });
  }
});

// PUT /api/admin/institucional — admin/gestor_n1 atualiza o conteúdo real (banco, não localStorage)
export const institucionalAdminRouter = Router();
institucionalAdminRouter.use(requireAuth);

institucionalAdminRouter.put("/", requireRole("administrador", "gestor_n1"), async (req: Request, res: Response) => {
  const novoConteudo = req.body;
  if (!novoConteudo || typeof novoConteudo !== "object") {
    return res.status(400).json({ error: "Corpo da requisição inválido" });
  }

  try {
    const [rows] = await db.execute(`SELECT dados, codigo_conduta_versao FROM institucional_config WHERE id = 1`) as any;

    let novaVersao = 1;
    if (rows.length) {
      const atual = typeof rows[0].dados === "string" ? JSON.parse(rows[0].dados) : rows[0].dados;
      const conteudoMudou = atual?.codigoConduta?.conteudo !== novoConteudo?.codigoConduta?.conteudo;
      novaVersao = conteudoMudou ? rows[0].codigo_conduta_versao + 1 : rows[0].codigo_conduta_versao;
    }

    await db.execute(
      `INSERT INTO institucional_config (id, dados, codigo_conduta_versao)
       VALUES (1, ?, ?)
       ON DUPLICATE KEY UPDATE dados = VALUES(dados), codigo_conduta_versao = VALUES(codigo_conduta_versao)`,
      [JSON.stringify(novoConteudo), novaVersao]
    );

    return res.json({ message: "Conteúdo institucional atualizado", codigoCondutaVersao: novaVersao });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao salvar conteúdo institucional" });
  }
});
