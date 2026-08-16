import { db } from "../db/connection.js";

// ── Verifica se um avaliador está designado para uma certificação específica ──
// Administrador/gestor não passam por essa checagem (acesso geral, verificado
// separadamente via requireRole nas rotas).
export async function avaliadorDesignado(userId: number, certificationTypeId: number): Promise<boolean> {
  const [rows] = await db.execute(
    `SELECT id FROM avaliadores_certificacao WHERE user_id = ? AND certification_type_id = ?`,
    [userId, certificationTypeId]
  ) as any;
  return rows.length > 0;
}

// ── Lista os IDs de certification_type_id que um avaliador pode acessar ──────
export async function certificacoesDoAvaliador(userId: number): Promise<number[]> {
  const [rows] = await db.execute(
    `SELECT certification_type_id FROM avaliadores_certificacao WHERE user_id = ?`,
    [userId]
  ) as any;
  return rows.map((r: any) => r.certification_type_id);
}

// ── Admin: lista avaliadores designados para uma certificação ────────────────
export async function listarAvaliadoresDaCertificacao(certSlug: string) {
  const [rows] = await db.execute(
    `SELECT ac.id as designacao_id, u.id as user_id, u.full_name, u.email
     FROM avaliadores_certificacao ac
     JOIN users u ON u.id = ac.user_id
     JOIN certification_types ct ON ct.id = ac.certification_type_id
     WHERE ct.slug = ?
     ORDER BY u.full_name`,
    [certSlug]
  ) as any;
  return rows;
}

// ── Admin: lista todos os avaliadores (pra escolher quem designar) ───────────
export async function listarTodosAvaliadores() {
  const [rows] = await db.execute(
    `SELECT u.id, u.full_name, u.email FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE r.code = 'avaliador' AND u.is_active = 1
     ORDER BY u.full_name`
  ) as any;
  return rows;
}

// ── Admin: designa/remove avaliador de uma certificação ───────────────────────
export async function designarAvaliador(certSlug: string, userId: number) {
  const [certs] = await db.execute(`SELECT id FROM certification_types WHERE slug = ?`, [certSlug]) as any;
  if (!certs.length) throw new Error("Certificação não encontrada");
  await db.execute(
    `INSERT IGNORE INTO avaliadores_certificacao (certification_type_id, user_id) VALUES (?, ?)`,
    [certs[0].id, userId]
  );
}

export async function removerDesignacaoAvaliador(certSlug: string, userId: number) {
  const [certs] = await db.execute(`SELECT id FROM certification_types WHERE slug = ?`, [certSlug]) as any;
  if (!certs.length) throw new Error("Certificação não encontrada");
  await db.execute(
    `DELETE FROM avaliadores_certificacao WHERE certification_type_id = ? AND user_id = ?`,
    [certs[0].id, userId]
  );
}
