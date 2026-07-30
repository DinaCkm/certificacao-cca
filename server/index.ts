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
import { cursosPublicoRouter } from "./routes/cursosPublico.js";
import { certificacoesPublicoRouter } from "./routes/certificacoesPublico.js";
import fs from "fs";
// multer loaded dynamically

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

  // ── Upload de documentos ─────────────────────────────────────────────────────
  // Configura storage no Railway Volume (/data) ou /tmp como fallback
  const uploadDir = process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "documentos")
    : path.join(process.cwd(), "uploads", "documentos");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // @ts-ignore
  const multerLib = (await import("multer")).default;
  const storage = multerLib.diskStorage({
    destination: (_req: any, _file: any, cb: any) => cb(null, uploadDir),
    filename: (req: any, file: any, cb: any) => {
      const ext = path.extname(file.originalname);
      const nome = `${Date.now()}_${req.user?.userId || "anonimo"}_${file.fieldname}${ext}`;
      cb(null, nome);
    },
  });

  const upload = multerLib({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req: any, file: any, cb: any) => {
      const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) cb(null, true);
      else cb(new Error("Formato inválido. Use PDF, JPG ou PNG."));
    },
  });

  // POST /api/upload/documento — salva arquivo no volume
  app.post("/api/upload/documento",
    (req: any, res, next) => {
      // Verifica token JWT
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ error: "Não autenticado" });
      next();
    },
    upload.single("arquivo"),
    async (req: any, res) => {
      try {
        if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

        const { tipo_documento, processo_id } = req.body;
        const { db } = await import("./db/connection.js");

        // Extrai user_id do token
        const jwt = await import("jsonwebtoken");
        const token = req.headers.authorization?.replace("Bearer ", "");
        const decoded: any = jwt.default.verify(token, process.env.JWT_SECRET || "anefac2026XyZsecret!");
        const userId = decoded.userId;

        // Salva referência no banco
        const [result] = await db.execute(
          `INSERT INTO documentos_candidato
            (processo_id, user_id, tipo_documento, nome_arquivo, caminho_arquivo, tamanho_bytes, mime_type, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'enviado')`,
          [
            processo_id || null,
            userId,
            tipo_documento || "documento",
            req.file.originalname,
            req.file.filename,
            req.file.size,
            req.file.mimetype,
          ]
        ) as any;

        return res.json({
          id: result.insertId,
          nome: req.file.originalname,
          tamanho: req.file.size,
          caminho: req.file.filename,
        });
      } catch (err: any) {
        console.error("Erro upload:", err);
        return res.status(500).json({ error: err.message || "Erro ao fazer upload" });
      }
    }
  );

  // GET /api/upload/documentos — lista documentos já enviados pelo candidato logado
  app.get("/api/upload/documentos", async (req: any, res) => {
    try {
      const jwt = await import("jsonwebtoken");
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Não autenticado" });
      const decoded: any = jwt.default.verify(token, process.env.JWT_SECRET || "anefac2026XyZsecret!");
      const userId = decoded.userId;

      const processoId = req.query.processo_id || null;
      const { db } = await import("./db/connection.js");

      let rows: any[];
      if (processoId) {
        [rows] = await db.execute(
          `SELECT id, tipo_documento, nome_arquivo, caminho_arquivo, tamanho_bytes, mime_type, status, criado_em
           FROM documentos_candidato
           WHERE user_id = ? AND processo_id = ?
           ORDER BY criado_em DESC`,
          [userId, processoId]
        ) as any;
      } else {
        [rows] = await db.execute(
          `SELECT id, tipo_documento, nome_arquivo, caminho_arquivo, tamanho_bytes, mime_type, status, criado_em
           FROM documentos_candidato
           WHERE user_id = ?
           ORDER BY criado_em DESC`,
          [userId]
        ) as any;
      }

      return res.json({ documentos: rows });
    } catch (err: any) {
      return res.status(401).json({ error: "Não autorizado" });
    }
  });

  // GET /api/upload/documentos/candidato/:userId — lista documentos de um candidato (admin)
  app.get("/api/upload/documentos/candidato/:userId", async (req: any, res) => {
    try {
      const jwt = await import("jsonwebtoken");
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Não autenticado" });
      jwt.default.verify(token, process.env.JWT_SECRET || "anefac2026XyZsecret!");

      const { db } = await import("./db/connection.js");
      const [rows] = await db.execute(
        `SELECT id, tipo_documento, nome_arquivo, caminho_arquivo, tamanho_bytes, mime_type, status, criado_em
         FROM documentos_candidato
         WHERE user_id = ?
         ORDER BY criado_em DESC`,
        [parseInt(req.params.userId)]
      ) as any;

      return res.json({ documentos: rows });
    } catch (err: any) {
      return res.status(401).json({ error: "Não autorizado" });
    }
  });

  // GET /api/upload/documento/:filename — serve o arquivo
  app.get("/api/upload/documento/:filename", async (req: any, res) => {
    try {
      const jwt = await import("jsonwebtoken");
      const token = req.headers.authorization?.replace("Bearer ", "") ||
                    req.query.token as string;
      jwt.default.verify(token, process.env.JWT_SECRET || "anefac2026XyZsecret!");

      const filepath = path.join(uploadDir, req.params.filename);
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: "Arquivo não encontrado" });
      }
      return res.sendFile(filepath);
    } catch {
      return res.status(401).json({ error: "Não autorizado" });
    }
  });

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
  app.use("/api/cursos", cursosPublicoRouter);
  app.use("/api/certificacoes", certificacoesPublicoRouter);

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
