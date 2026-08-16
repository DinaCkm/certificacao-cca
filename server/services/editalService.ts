import { db } from "../db/connection.js";

// ── Público: busca o edital vigente de uma certificação ──────────────────────
export async function buscarEdital(certSlug: string) {
  const [rows] = await db.execute(
    `SELECT ce.* FROM certificacao_edital ce
     JOIN certification_types ct ON ct.id = ce.certification_type_id
     WHERE ct.slug = ?`,
    [certSlug]
  ) as any;
  return rows[0] || null;
}

// ── Admin: cria/atualiza o edital de uma certificação (versiona automaticamente
// quando o conteúdo muda — processos já em andamento guardam a versão que
// valia quando o candidato começou, então uma mudança não afeta quem já
// está no meio do processo) ───────────────────────────────────────────────────
export async function salvarEdital(certSlug: string, dados: {
  titulo: string;
  conteudo?: string;
  urlExterna?: string;
  dataAbertura?: string | null;
  dataEncerramento?: string | null;
}) {
  const [certs] = await db.execute(`SELECT id FROM certification_types WHERE slug = ?`, [certSlug]) as any;
  if (!certs.length) throw new Error("Certificação não encontrada");
  const certId = certs[0].id;

  const [existentes] = await db.execute(`SELECT * FROM certificacao_edital WHERE certification_type_id = ?`, [certId]) as any;

  let novaVersao = 1;
  if (existentes.length) {
    const conteudoMudou = existentes[0].conteudo !== (dados.conteudo || null) || existentes[0].url_externa !== (dados.urlExterna || null);
    novaVersao = conteudoMudou ? existentes[0].versao + 1 : existentes[0].versao;
  }

  await db.execute(
    `INSERT INTO certificacao_edital (certification_type_id, titulo, conteudo, url_externa, data_abertura, data_encerramento, versao)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       titulo = VALUES(titulo), conteudo = VALUES(conteudo), url_externa = VALUES(url_externa),
       data_abertura = VALUES(data_abertura), data_encerramento = VALUES(data_encerramento), versao = VALUES(versao)`,
    [certId, dados.titulo, dados.conteudo || null, dados.urlExterna || null, dados.dataAbertura || null, dados.dataEncerramento || null, novaVersao]
  );

  return { versao: novaVersao };
}

// ── Busca a versão atual do edital (usado ao criar um processo novo) ─────────
export async function versaoAtualEdital(certificationTypeId: number): Promise<number | null> {
  const [rows] = await db.execute(`SELECT versao FROM certificacao_edital WHERE certification_type_id = ?`, [certificationTypeId]) as any;
  return rows.length ? rows[0].versao : null;
}

// ── Admin: lista editais de todas as certificações ────────────────────────────
export async function listarEditaisAdmin() {
  const [rows] = await db.execute(
    `SELECT ct.slug as cert_slug, ct.nome as cert_nome, ce.titulo, ce.versao, ce.atualizado_em,
            (ce.conteudo IS NOT NULL OR ce.url_externa IS NOT NULL) as configurado
     FROM certification_types ct
     LEFT JOIN certificacao_edital ce ON ce.certification_type_id = ct.id
     WHERE ct.status != 'inativa'
     ORDER BY ct.numero`
  ) as any;
  return rows;
}
