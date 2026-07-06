import bcrypt from "bcryptjs";
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

// ── POST /api/auth/verificar-cpf ──────────────────────────────────────────────
// Usada logo quando o candidato clica em "Quero me certificar" — verifica ANTES
// de mostrar a ficha completa se esse CPF já tem conta. Se tiver, o frontend
// mostra um campo de senha ali mesmo e leva direto pra onde o candidato parou,
// em vez de fazer preencher tudo de novo pra só então descobrir que já existe.

authRouter.post("/verificar-cpf", async (req: Request, res: Response) => {
  try {
    const { cpf } = req.body;
    if (!cpf) return res.status(400).json({ error: "CPF é obrigatório" });

    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      return res.status(400).json({ error: "CPF inválido" });
    }

    const [rows] = await db.execute(
      "SELECT email FROM users WHERE cpf = ? AND role_id = 1",
      [cpfLimpo]
    ) as any;

    if (rows.length === 0) {
      return res.json({ existe: false });
    }
    return res.json({ existe: true, email: rows[0].email });
  } catch (err) {
    console.error("Erro ao verificar CPF:", err);
    return res.status(500).json({ error: "Erro ao verificar CPF" });
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
              u.company, u.job_title, u.education, u.experience_years, u.linkedin_url,
              r.code as role, r.nome as role_nome, r.menu_permissoes
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ? AND u.is_active = TRUE`,
      [req.user!.userId]
    ) as any;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const row = rows[0];
    const menu_permissoes = row.menu_permissoes
      ? (typeof row.menu_permissoes === "string" ? JSON.parse(row.menu_permissoes) : row.menu_permissoes)
      : [];
    delete row.menu_permissoes;

    return res.json({ user: { ...row, menu_permissoes } });
  } catch (err) {
    console.error("Erro no /me:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// ── PUT /api/auth/meu-perfil ───────────────────────────────────────────────────
// Atualiza os dados profissionais do candidato (empresa, cargo, formação,
// anos de experiência, LinkedIn). Antes esses campos só existiam no
// localStorage de quem preencheu o Cadastro — por isso nunca vinham
// pré-preenchidos ao logar em outro navegador ou iniciar outra certificação.
// Como são dados do CANDIDATO (não da certificação), ficam no próprio usuário
// e valem pra qualquer certificação que ele inicie depois.

authRouter.put("/meu-perfil", requireAuth, async (req: Request, res: Response) => {
  try {
    const { full_name, phone, company, job_title, education, experience_years, linkedin_url } = req.body;
    await db.execute(
      `UPDATE users SET
        full_name = COALESCE(?, full_name),
        phone = COALESCE(?, phone),
        company = ?, job_title = ?, education = ?,
        experience_years = ?, linkedin_url = ?
       WHERE id = ?`,
      [full_name || null, phone || null, company || null, job_title || null,
       education || null, experience_years || null, linkedin_url || null,
       req.user!.userId]
    );
    return res.json({ message: "Perfil atualizado" });
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    return res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
});

// ── POST /api/auth/verificar-cadastro ────────────────────────────────────────
// Verifica se CPF ou e-mail já existem no banco (para o mini-cadastro)

authRouter.post("/verificar-cadastro", async (req: Request, res: Response) => {
  const { email, cpf } = req.body;
  try {
    const [rows] = await db.execute(
      "SELECT id FROM users WHERE email = ? OR cpf = ?",
      [email, cpf]
    ) as any;
    return res.json({ existe: rows.length > 0 });
  } catch (err) {
    return res.status(500).json({ existe: false });
  }
});

// ── POST /api/auth/recuperar-senha ────────────────────────────────────────────
// Envia e-mail de recuperação de senha

authRouter.post("/recuperar-senha", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "E-mail obrigatório" });

  try {
    const [rows] = await db.execute(
      "SELECT id, full_name FROM users WHERE email = ? AND is_active = TRUE",
      [email]
    ) as any;

    // Sempre retorna sucesso para não revelar se o e-mail existe
    if (rows.length === 0) {
      return res.json({ message: "Se este e-mail estiver cadastrado, você receberá as instruções." });
    }

    const user = rows[0];
    // Gera token temporário (válido por 1 hora)
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expira = new Date(Date.now() + 60 * 60 * 1000);

    await db.execute(
      "UPDATE users SET reset_token = ?, reset_token_expira = ? WHERE id = ?",
      [token, expira, user.id]
    );

    // Envia e-mail (via Resend)
    const appUrl = process.env.APP_URL || "https://certificacao-cca-staging.up.railway.app";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || "ANEFAC <noreply@anefac.com.br>",
        to: [email],
        subject: "Recuperação de senha — ANEFAC",
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
            <h2 style="color:#1e3a5f">Recuperação de senha</h2>
            <p>Olá, <strong>${user.full_name}</strong>!</p>
            <p>Recebemos uma solicitação para redefinir sua senha na Plataforma ANEFAC.</p>
            <p>Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.</p>
            <a href="${appUrl}/novo-fluxo/redefinir-senha?token=${token}" 
               style="display:inline-block;background:#1e3a5f;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
              Redefinir minha senha →
            </a>
            <p style="color:#6b7280;font-size:12px;margin-top:24px">
              Se você não solicitou a redefinição, ignore este e-mail. Sua senha permanece a mesma.
            </p>
          </div>
        `,
      }),
    });

    return res.json({ message: "Se este e-mail estiver cadastrado, você receberá as instruções." });
  } catch (err) {
    console.error("Erro recuperar senha:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// ── POST /api/auth/redefinir-senha ────────────────────────────────────────────

authRouter.post("/redefinir-senha", async (req: Request, res: Response) => {
  const { token, nova_senha } = req.body;
  if (!token || !nova_senha) return res.status(400).json({ error: "Token e nova senha são obrigatórios" });
  if (nova_senha.length < 8) return res.status(400).json({ error: "Senha deve ter no mínimo 8 caracteres" });

  try {
    const [rows] = await db.execute(
      "SELECT id FROM users WHERE reset_token = ? AND reset_token_expira > NOW()",
      [token]
    ) as any;

    if (rows.length === 0) return res.status(400).json({ error: "Link inválido ou expirado" });

    const hash = await bcrypt.hash(nova_senha, 12);
    await db.execute(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expira = NULL WHERE id = ?",
      [hash, rows[0].id]
    );

    return res.json({ message: "Senha redefinida com sucesso" });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno" });
  }
});
