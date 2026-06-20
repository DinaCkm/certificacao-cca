import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { testConnection } from "./db/connection.js";
import { authRouter } from "./routes/auth.js";
import { processoRouter } from "./routes/processo.js";
import { adminRouter } from "./routes/admin.js";

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
  app.use("/api/admin", adminRouter);

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

  server.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}/`);
    console.log(`📡 API disponível em http://localhost:${port}/api/`);
  });
}

startServer().catch(console.error);
