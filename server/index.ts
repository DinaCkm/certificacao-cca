import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { testConnection } from "./db/connection.js";
import { iniciarScheduler } from "./services/schedulerService.js";
import { authRouter } from "./routes/auth.js";
import { processoRouter } from "./routes/processo.js";
import { adminRouter } from "./routes/admin.js";
import { provaRouter } from "./routes/prova.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Testa conexão com o banco antes de subir
  await testConnection();

  const app = express();
  const server = createServer(app);

  // ── Middlewares ─────────────────────────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // CORS para desenvolvimento
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  });

  // ── API Routes ──────────────────────────────────────────────────────────────
  app.use("/api/auth", authRouter);
  app.use("/api/processo", processoRouter);

  // Rota pública do carrossel — sem autenticação
  app.get("/api/admin/carrossel/publico", async (_req, res) => {
    try {
      const { db } = await import("./db/connection.js");
      const [rows] = await db.execute(
        "SELECT id, titulo, subtitulo, url_imagem, ordem FROM carrossel_imagens WHERE ativo = TRUE ORDER BY ordem ASC LIMIT 5"
      ) as any;
      return res.json({ imagens: rows });
    } catch (err) {
      return res.json({ imagens: [] });
    }
  });

  // Fale conosco — rota pública (sem autenticação obrigatória)
  app.post("/api/fale-conosco/enviar", async (req, res) => {
    const { nome, email, mensagem, pagina_origem } = req.body;
    if (!nome || !email || !mensagem) {
      return res.status(400).json({ error: "Nome, e-mail e mensagem são obrigatórios" });
    }
    try {
      const { db } = await import("./db/connection.js");
      await db.execute(
        "INSERT INTO fale_conosco (nome, email, mensagem, pagina_origem) VALUES (?, ?, ?, ?)",
        [nome, email, mensagem, pagina_origem || null]
      );
      return res.json({ message: "Mensagem enviada com sucesso!" });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao enviar mensagem" });
    }
  });

  app.use("/api/admin", adminRouter);
  app.use("/api/prova", provaRouter);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ── Frontend estático ───────────────────────────────────────────────────────
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // SPA fallback — serve index.html para todas as rotas não-API
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "Rota não encontrada" });
    }
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // ── Start ───────────────────────────────────────────────────────────────────
  const port = process.env.PORT || 3000;

  // Inicia verificador diário de slots
  iniciarScheduler();

  server.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}/`);
    console.log(`📡 API disponível em http://localhost:${port}/api/`);
  });
}

startServer().catch(console.error);
