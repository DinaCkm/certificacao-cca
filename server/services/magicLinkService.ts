import crypto from "crypto";
import { db } from "../db/connection.js";
import { generateToken } from "./authService.js";

const APP_URL = process.env.APP_URL || "https://certificacao-cca-staging.up.railway.app";
const VALIDADE_MINUTOS = 60 * 24; // 24h — e-mails de ação costumam ser abertos depois do horário comercial

// ── Gera um magic link para um usuário, apontando pra uma tela específica ────
// Usado nos e-mails "acionáveis": autentica sozinho e já abre o item certo.
export async function gerarMagicLink(userId: number, destino: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiraEm = new Date(Date.now() + VALIDADE_MINUTOS * 60 * 1000);

  await db.execute(
    `INSERT INTO magic_link_tokens (user_id, token, destino, expira_em) VALUES (?, ?, ?, ?)`,
    [userId, token, destino, expiraEm]
  );

  return `${APP_URL}/auth/magic/${token}`;
}

// ── Valida e consome um magic link, retornando um JWT normal de sessão ───────
export async function validarEConsumirMagicLink(token: string) {
  const [rows] = await db.execute(
    `SELECT mlt.*, u.email, u.full_name, r.code as role, r.id as role_id
     FROM magic_link_tokens mlt
     JOIN users u ON u.id = mlt.user_id
     JOIN roles r ON r.id = u.role_id
     WHERE mlt.token = ?`,
    [token]
  ) as any;

  if (!rows.length) throw new Error("Link inválido ou já utilizado");
  const registro = rows[0];

  if (registro.usado) throw new Error("Este link já foi utilizado. Faça login normalmente.");
  if (new Date(registro.expira_em) < new Date()) throw new Error("Este link expirou. Faça login normalmente.");

  await db.execute(`UPDATE magic_link_tokens SET usado = 1 WHERE id = ?`, [registro.id]);

  const jwt = generateToken({
    userId: registro.user_id,
    email: registro.email,
    role: registro.role,
    roleId: registro.role_id,
  });

  return { jwt, destino: registro.destino, nome: registro.full_name };
}
