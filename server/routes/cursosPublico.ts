import { Router, Request, Response } from "express";
import { optionalAuth } from "../middleware/auth.js";
import { db } from "../db/connection.js";

// Rotas públicas de cursos — sem exigir login (candidato logado OU visitante
// anônimo podem listar cursos e ter seu clique em "Comprar" registrado).
export const cursosPublicoRouter = Router();

// ── GET /api/cursos/publico ────────────────────────────────────────────────────
// Lista cursos e pacotes ativos, para a página pública /cursos

cursosPublicoRouter.get("/publico", async (_req: Request, res: Response) => {
  try {
    const [cursos] = await db.execute(
      `SELECT id, titulo, descricao, descricao_breve, categoria, nivel, duracao,
              instrutor, imagem_url, tipo, link_compra, preco,
              certificacao_relacionada, destaque, ordem
       FROM cursos WHERE ativo = TRUE ORDER BY ordem ASC, id ASC`
    ) as any;

    const [pacotes] = await db.execute(
      `SELECT id, nome, descricao, preco, tipo, link_compra, curso_ids
       FROM pacotes WHERE ativo = TRUE ORDER BY id ASC`
    ) as any;

    return res.json({
      cursos,
      pacotes: pacotes.map((p: any) => ({
        ...p,
        curso_ids: typeof p.curso_ids === "string" ? JSON.parse(p.curso_ids) : (p.curso_ids || []),
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar cursos" });
  }
});

// ── POST /api/cursos/clique ────────────────────────────────────────────────────
// Registra o clique em "Comprar" — curso interno ou externo, logado ou anônimo.
// Retorna o id do registro para, no caso de curso interno, ser usado depois na
// confirmação de pagamento.

cursosPublicoRouter.post("/clique", optionalAuth, async (req: Request, res: Response) => {
  const { curso_id, curso_titulo, tipo_destino, link_destino, sessao_id } = req.body;

  if (!curso_titulo || !tipo_destino) {
    return res.status(400).json({ error: "curso_titulo e tipo_destino são obrigatórios" });
  }
  if (!["interno", "externo"].includes(tipo_destino)) {
    return res.status(400).json({ error: "tipo_destino inválido" });
  }

  try {
    const candidatoId = req.user?.userId || null;
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || null;

    const [result] = await db.execute(
      `INSERT INTO curso_cliques
        (curso_id, curso_titulo, tipo_destino, link_destino, candidato_id, sessao_id, comprou, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        curso_id || null,
        curso_titulo,
        tipo_destino,
        link_destino || null,
        candidatoId,
        candidatoId ? null : (sessao_id || null),
        tipo_destino === "interno" ? 0 : null,
        ip,
      ]
    ) as any;

    return res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao registrar clique" });
  }
});

// ── POST /api/cursos/clique/:id/confirmar-compra ───────────────────────────────
// Usada ao final do checkout interno (simulado) para marcar a compra como concluída

cursosPublicoRouter.post("/clique/:id/confirmar-compra", optionalAuth, async (req: Request, res: Response) => {
  try {
    await db.execute(
      `UPDATE curso_cliques SET comprou = 1, data_compra = NOW() WHERE id = ? AND tipo_destino = 'interno'`,
      [parseInt(req.params.id)]
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao confirmar compra" });
  }
});
