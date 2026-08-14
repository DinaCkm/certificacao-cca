import crypto from "crypto";
import { db } from "../db/connection.js";

// ── Verifica se o candidato já assinou a versão atual do código de conduta ───
export async function verificarAssinatura(userId: number, versaoAtual: number) {
  const [rows] = await db.execute(
    `SELECT codigo_assinatura, assinado_em, versao FROM codigo_conduta_assinaturas
     WHERE user_id = ? AND versao = ?`,
    [userId, String(versaoAtual)]
  ) as any;
  return rows.length ? rows[0] : null;
}

// ── Registra a assinatura eletrônica ──────────────────────────────────────────
export async function assinarCodigoConduta(dados: {
  userId: number;
  nomeDigitado: string;
  versao: number;
  ip: string | null;
  processoId?: number | null;
  tipoDocumento?: string | null;
}) {
  // Já assinou esta versão? Retorna o registro existente em vez de duplicar.
  const existente = await verificarAssinatura(dados.userId, dados.versao);
  if (existente) return existente;

  const codigoAssinatura = crypto.randomBytes(8).toString("hex").toUpperCase();

  await db.execute(
    `INSERT INTO codigo_conduta_assinaturas (user_id, nome_digitado, codigo_assinatura, versao, ip_address)
     VALUES (?, ?, ?, ?, ?)`,
    [dados.userId, dados.nomeDigitado, codigoAssinatura, String(dados.versao), dados.ip]
  );

  // Reaproveita o registro em documentos_candidato para o item "Código de
  // Conduta" do checklist (tipo_documento = mesmo id "doc-N" usado pelos
  // outros documentos) — assim a contagem de progresso/validação que já
  // existe continua funcionando sem precisar de nenhum arquivo real.
  if (dados.processoId && dados.tipoDocumento) {
    try {
      await db.execute(
        `INSERT INTO documentos_candidato (processo_id, user_id, tipo_documento, nome_arquivo, caminho_arquivo, tamanho_bytes, mime_type, status)
         VALUES (?, ?, ?, ?, ?, 0, 'application/x-assinatura-eletronica', 'aprovado')`,
        [dados.processoId, dados.userId, dados.tipoDocumento, `Assinatura eletrônica — código ${codigoAssinatura}`, `assinatura:${codigoAssinatura}`]
      );
    } catch (err) {
      console.warn("Aviso: não foi possível registrar o item de checklist do código de conduta:", err);
    }
  }

  return { codigo_assinatura: codigoAssinatura, assinado_em: new Date(), versao: String(dados.versao) };
}

// ── Admin: lista todas as assinaturas (quem aceitou, quando, qual versão) ────
export async function listarAssinaturasAdmin() {
  const [rows] = await db.execute(
    `SELECT a.id, a.nome_digitado, a.codigo_assinatura, a.versao, a.assinado_em, a.ip_address,
            u.full_name, u.email
     FROM codigo_conduta_assinaturas a
     JOIN users u ON u.id = a.user_id
     ORDER BY a.assinado_em DESC`
  ) as any;
  return rows;
}
