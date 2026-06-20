import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/connection.js";

const JWT_SECRET = process.env.JWT_SECRET || "anefac_secret_dev_troque_em_producao";
const JWT_EXPIRES = "7d";

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  roleId: number;
}

// ── Registro ─────────────────────────────────────────────────────────────────

export async function registerUser(data: {
  email: string;
  password: string;
  full_name: string;
  cpf: string;
  phone?: string;
}) {
  // Verifica duplicidade
  const [existing] = await db.execute(
    "SELECT id FROM users WHERE email = ? OR cpf = ?",
    [data.email, data.cpf]
  ) as any;

  if (existing.length > 0) {
    throw new Error("E-mail ou CPF já cadastrado");
  }

  const password_hash = await bcrypt.hash(data.password, 12);

  const [result] = await db.execute(
    `INSERT INTO users (email, password_hash, full_name, cpf, phone, role_id)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [data.email, password_hash, data.full_name, data.cpf, data.phone || null]
  ) as any;

  const userId = result.insertId;
  const token = generateToken({ userId, email: data.email, role: "candidato", roleId: 1 });

  return { userId, token };
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string) {
  const [rows] = await db.execute(
    `SELECT u.id, u.email, u.password_hash, u.full_name, u.is_active,
            r.code as role, r.id as role_id
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = ?`,
    [email]
  ) as any;

  if (rows.length === 0) {
    throw new Error("E-mail ou senha incorretos");
  }

  const user = rows[0];

  if (!user.is_active) {
    throw new Error("Conta desativada. Entre em contato com o suporte.");
  }

  const senhaCorreta = await bcrypt.compare(password, user.password_hash);
  if (!senhaCorreta) {
    throw new Error("E-mail ou senha incorretos");
  }

  // Atualiza último login
  await db.execute("UPDATE users SET last_login_at = NOW() WHERE id = ?", [user.id]);

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    roleId: user.role_id,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
  };
}

// ── JWT ───────────────────────────────────────────────────────────────────────

export function generateToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
