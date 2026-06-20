import { Router, Request, Response } from "express";
import { registerUser, loginUser } from "../services/authService.js";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/connection.js";

export const authRouter = Router();

// ── POST /api/auth/register ───────────────────────────────────────────────────

authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, cpf, phone } = req.body;

    // Validações básicas
    if (!email || !password || !full_name || !cpf) {
      return res.status(400).json({ error: "Campos obrigatórios: email, password, full_name, cpf" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Senha deve ter no mínimo 8 caracteres" });
    }

    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      return res.status(400).json({ error: "CPF inválido" });
    }

    const { userId, token } = await registerUser({ email, password, full_name, cpf: cpfLimpo, phone });

    return res.status(201).json({
      message: "Cadastro realizado com sucesso",
      token,
      userId,
    });
  } catch (err: any) {
    if (err.message.includes("já cadastrado")) {
      return res.status(409).json({ error: err.message });
    }
    console.error("Erro no registro:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    }

    const result = await loginUser(email, password);

    return res.json({
      message: "Login realizado com sucesso",
      ...result,
    });
  } catch (err: any) {
    if (err.message.includes("incorretos") || err.message.includes("desativada")) {
      return res.status(401).json({ error: err.message });
    }
    console.error("Erro no login:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

authRouter.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.email, u.full_name, u.cpf, u.phone, u.created_at,
              r.code as role, r.nome as role_nome
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ? AND u.is_active = TRUE`,
      [req.user!.userId]
    ) as any;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("Erro no /me:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});
