import { db } from "../db/connection.js";

// ── Admin: CRUD de membros do comitê ──────────────────────────────────────────

export async function listarMembrosComite() {
  const [rows] = await db.execute(
    `SELECT cm.*, u.email as user_email, u.full_name as user_nome_conta
     FROM comite_membros cm
     LEFT JOIN users u ON u.id = cm.user_id
     ORDER BY cm.ordem, cm.nome`
  ) as any;
  return rows;
}

export async function criarMembroComite(dados: {
  nome: string; cargo?: string; miniCurriculo?: string; fotoUrl?: string; linkedin?: string; userId?: number | null;
}) {
  const [result] = await db.execute(
    `INSERT INTO comite_membros (user_id, nome, cargo, mini_curriculo, foto_url, linkedin) VALUES (?, ?, ?, ?, ?, ?)`,
    [dados.userId || null, dados.nome, dados.cargo || null, dados.miniCurriculo || null, dados.fotoUrl || null, dados.linkedin || null]
  ) as any;
  return { id: result.insertId };
}

export async function editarMembroComite(id: number, dados: {
  nome?: string; cargo?: string; miniCurriculo?: string; fotoUrl?: string; linkedin?: string; userId?: number | null; ativo?: boolean;
}) {
  await db.execute(
    `UPDATE comite_membros SET
       nome = COALESCE(?, nome), cargo = ?, mini_curriculo = ?, foto_url = ?, linkedin = ?,
       user_id = ?, ativo = COALESCE(?, ativo)
     WHERE id = ?`,
    [dados.nome ?? null, dados.cargo || null, dados.miniCurriculo || null, dados.fotoUrl || null, dados.linkedin || null,
     dados.userId === undefined ? null : dados.userId, dados.ativo === undefined ? null : (dados.ativo ? 1 : 0), id]
  );
}

export async function removerMembroComite(id: number) {
  await db.execute(`DELETE FROM certificacao_comite WHERE comite_membro_id = ?`, [id]);
  await db.execute(`DELETE FROM comite_membros WHERE id = ?`, [id]);
}

// ── Admin: atribuição de membros a uma certificação específica ───────────────

export async function listarComiteDaCertificacao(certSlug: string) {
  const [rows] = await db.execute(
    `SELECT cc.id as atribuicao_id, cc.papel, cm.*
     FROM certificacao_comite cc
     JOIN comite_membros cm ON cm.id = cc.comite_membro_id
     JOIN certification_types ct ON ct.id = cc.certification_type_id
     WHERE ct.slug = ?
     ORDER BY cm.ordem, cm.nome`,
    [certSlug]
  ) as any;
  return rows;
}

export async function atribuirMembroACertificacao(certSlug: string, comiteMembroId: number, papel?: string) {
  const [certs] = await db.execute(`SELECT id FROM certification_types WHERE slug = ?`, [certSlug]) as any;
  if (!certs.length) throw new Error("Certificação não encontrada");

  await db.execute(
    `INSERT IGNORE INTO certificacao_comite (certification_type_id, comite_membro_id, papel) VALUES (?, ?, ?)`,
    [certs[0].id, comiteMembroId, papel || null]
  );
}

export async function removerMembroDaCertificacao(certSlug: string, comiteMembroId: number) {
  const [certs] = await db.execute(`SELECT id FROM certification_types WHERE slug = ?`, [certSlug]) as any;
  if (!certs.length) throw new Error("Certificação não encontrada");

  await db.execute(
    `DELETE FROM certificacao_comite WHERE certification_type_id = ? AND comite_membro_id = ?`,
    [certs[0].id, comiteMembroId]
  );
}
