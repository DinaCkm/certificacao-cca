import fs from "fs";
import path from "path";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { db } from "../db/connection.js";

const APP_URL = process.env.APP_URL || "https://certificacao-cca-staging.up.railway.app";

function diretorioCertificados() {
  const base = process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "certificados")
    : path.join(process.cwd(), "uploads", "certificados");
  if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
  return base;
}

// ── Código único do certificado (ex: ANEFAC-7K3F9A1B) ─────────────────────────
// 12 caracteres hex (48 bits de entropia) — imprevisível o bastante pra não
// dar pra "adivinhar" códigos de outros certificados por tentativa e erro.
async function gerarCodigoUnico(): Promise<string> {
  for (let tentativa = 0; tentativa < 10; tentativa++) {
    const sufixo = crypto.randomBytes(6).toString("hex").toUpperCase();
    const codigo = `ANEFAC-${sufixo}`;
    const [existe] = await db.execute(`SELECT id FROM certificados WHERE codigo = ?`, [codigo]) as any;
    if (!existe.length) return codigo;
  }
  throw new Error("Não foi possível gerar um código único para o certificado");
}

// ── Emite o certificado (idempotente — se já existe pro processo, retorna o
// mesmo) usando lock de linha dentro de uma transação, pra garantir que duas
// chamadas simultâneas (ex: candidato confirma pagamento e o webhook de
// confirmação dispara ao mesmo tempo) NUNCA gerem 2 certificados ativos pro
// mesmo processo — a segunda chamada sempre espera a primeira terminar e
// encontra o certificado já criado. ────────────────────────────────────────
export async function emitirCertificado(processoId: number) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Trava a linha do processo até o fim da transação — qualquer outra
    // chamada concorrente pra este mesmo processo fica bloqueada aqui até
    // esta terminar (commit ou rollback), nunca rodando em paralelo.
    const [processos] = await conn.query(
      `SELECT cp.*, u.full_name as candidato_nome, u.email as candidato_email,
              ct.id as cert_type_id, ct.nome as cert_nome, ct.slug as cert_slug, ct.validade_anos
       FROM candidato_processos cp
       JOIN users u ON u.id = cp.user_id
       JOIN certification_types ct ON ct.id = cp.certification_type_id
       WHERE cp.id = ? FOR UPDATE`,
      [processoId]
    ) as any;
    if (!processos.length) throw new Error("Processo não encontrado");
    const processo = processos[0];

    // Idempotência real: com a linha travada, essa checagem é segura contra
    // corrida — não existe janela onde duas transações passem por aqui ao
    // mesmo tempo pro mesmo processo.
    const [existente] = await conn.query(
      `SELECT * FROM certificados WHERE processo_id = ? AND status = 'ativo'`,
      [processoId]
    ) as any;
    if (existente.length) {
      await conn.commit();
      return existente[0];
    }

    // Critério seguro de emissão: taxa de emissão confirmada E entrevista
    // aprovada. Sem isso, um pagamento confirmado sozinho (ex: erro no
    // fluxo, ou reenvio de webhook) não emite certificado de um candidato
    // que na verdade foi reprovado na entrevista.
    if (!processo.pagamento2_realizado) {
      throw new Error("A taxa de emissão ainda não foi confirmada para este processo");
    }
    if (!processo.aprovado_entrevista) {
      throw new Error("A entrevista ainda não foi aprovada para este processo");
    }

    // Membros do comitê responsáveis por esta certificação — assinam o certificado
    const [assinantes] = await conn.query(
      `SELECT cm.nome, cm.cargo, cm.assinatura_url, cc.papel
       FROM certificacao_comite cc
       JOIN comite_membros cm ON cm.id = cc.comite_membro_id
       WHERE cc.certification_type_id = ? AND cm.ativo = 1
       ORDER BY cm.ordem`,
      [processo.cert_type_id]
    ) as any;

    const codigo = await gerarCodigoUnicoNaTransacao(conn);
    const emitidoEm = new Date();
    const validadeAte = processo.validade_anos
      ? new Date(emitidoEm.getFullYear() + processo.validade_anos, emitidoEm.getMonth(), emitidoEm.getDate())
      : null;

    const urlValidacao = `${APP_URL}/validar-certificado/${codigo}`;
    const qrCodeDataUrl = await QRCode.toDataURL(urlValidacao, { margin: 1, width: 240 });

    const caminhoPdf = await gerarPdfCertificado({
      codigo,
      candidatoNome: processo.candidato_nome,
      certificacaoNome: processo.cert_nome,
      emitidoEm,
      validadeAte,
      assinantes,
      qrCodeDataUrl,
      urlValidacao,
    });

    // Fotografia dos dados usados nesta emissão: assinantes, versão do
    // edital e validade calculada ficam gravados como estavam NESTE
    // momento. Se o comitê ou o edital mudar depois, este certificado já
    // emitido não é afetado retroativamente.
    //
    // Se por qualquer motivo (concorrência, ou uma constraint legada na
    // tabela) o INSERT colidir com um certificado que já existe pra este
    // processo, trata como sucesso idempotente em vez de erro — busca e
    // devolve o que já existe, em vez de quebrar a requisição.
    try {
      await conn.query(
        `INSERT INTO certificados
          (codigo, processo_id, user_id, certification_type_id, candidato_nome, certificacao_nome,
           emitido_em, validade_ate, edital_versao, status, caminho_pdf, assinantes_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo', ?, ?)`,
        [codigo, processoId, processo.user_id, processo.cert_type_id, processo.candidato_nome, processo.cert_nome,
         emitidoEm, validadeAte, processo.edital_versao ?? null, caminhoPdf,
         JSON.stringify(assinantes.map((a: any) => ({ nome: a.nome, cargo: a.cargo, papel: a.papel })))]
      );
    } catch (insertErr: any) {
      if (insertErr?.code === "ER_DUP_ENTRY") {
        await conn.rollback();
        const [jaExiste] = await db.query(
          `SELECT * FROM certificados WHERE processo_id = ? ORDER BY id DESC LIMIT 1`,
          [processoId]
        ) as any;
        if (jaExiste.length) return jaExiste[0];
      }
      throw insertErr;
    }

    await conn.query(`UPDATE candidato_processos SET status_geral = 'concluido', updated_at = NOW() WHERE id = ?`, [processoId]);

    await conn.commit();

    const [criado] = await db.query(`SELECT * FROM certificados WHERE codigo = ?`, [codigo]) as any;
    const certificado = criado[0];

    // E-mail de notificação — só aqui, fora da transação (não segura o lock
    // esperando o envio) e só no caminho de criação real (nunca no retorno
    // idempotente acima, pra não reenviar e-mail à toa).
    try {
      const { enviarCertificadoEmitido } = await import("./emailService.js");
      await enviarCertificadoEmitido(processo.candidato_email, processo.candidato_nome, processo.cert_nome);
    } catch (emailErr) {
      console.warn("E-mail de certificado emitido falhou (não crítico):", emailErr);
    }

    return certificado;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Mesma lógica de gerarCodigoUnico, mas consultando dentro da conexão da
// transação (pra ver o estado mais atual, já com o lock em vigor)
async function gerarCodigoUnicoNaTransacao(conn: any): Promise<string> {
  for (let tentativa = 0; tentativa < 10; tentativa++) {
    const sufixo = crypto.randomBytes(6).toString("hex").toUpperCase();
    const codigo = `ANEFAC-${sufixo}`;
    const [existe] = await conn.query(`SELECT id FROM certificados WHERE codigo = ?`, [codigo]) as any;
    if (!existe.length) return codigo;
  }
  throw new Error("Não foi possível gerar um código único para o certificado");
}

// ── Gera o PDF do certificado (layout A4 paisagem, QR Code, assinaturas) ─────
async function gerarPdfCertificado(dados: {
  codigo: string;
  candidatoNome: string;
  certificacaoNome: string;
  emitidoEm: Date;
  validadeAte: Date | null;
  assinantes: { nome: string; cargo: string | null; assinatura_url: string | null }[];
  qrCodeDataUrl: string;
  urlValidacao: string;
}): Promise<string> {
  const destino = path.join(diretorioCertificados(), `${dados.codigo}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
    const stream = fs.createWriteStream(destino);
    doc.pipe(stream);

    const largura = doc.page.width;
    const altura = doc.page.height;

    // Moldura
    doc.rect(0, 0, largura, altura).fill("#0a1f5e");
    doc.rect(24, 24, largura - 48, altura - 48).lineWidth(2).stroke("#f2c94c");
    doc.rect(32, 32, largura - 64, altura - 64).fill("#ffffff");

    // Cabeçalho
    doc.fillColor("#0a1f5e").fontSize(12).font("Helvetica-Bold")
      .text("ANEFAC", 0, 60, { align: "center" });
    doc.fontSize(9).font("Helvetica").fillColor("#666")
      .text("Associação Nacional dos Executivos de Finanças, Administração e Contabilidade", 0, 78, { align: "center" });

    doc.fontSize(26).font("Helvetica-Bold").fillColor("#0a1f5e")
      .text("CERTIFICADO", 0, 115, { align: "center" });

    doc.fontSize(11).font("Helvetica").fillColor("#333")
      .text("Certificamos que", 0, 165, { align: "center" });

    doc.fontSize(24).font("Helvetica-Bold").fillColor("#0a1f5e")
      .text(dados.candidatoNome, 80, 190, { align: "center", width: largura - 160 });

    doc.fontSize(11).font("Helvetica").fillColor("#333")
      .text("concluiu com êxito o processo de certificação profissional e está habilitado(a) como", 80, 235, { align: "center", width: largura - 160 });

    doc.fontSize(18).font("Helvetica-Bold").fillColor("#b8860b")
      .text(dados.certificacaoNome, 80, 260, { align: "center", width: largura - 160 });

    // Datas
    const dataEmissaoFmt = dados.emitidoEm.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const validadeFmt = dados.validadeAte
      ? dados.validadeAte.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
      : "Indeterminada";

    doc.fontSize(9).fillColor("#555").font("Helvetica")
      .text(`Emitido em ${dataEmissaoFmt}  •  Validade: ${validadeFmt}  •  Código: ${dados.codigo}`, 0, 310, { align: "center" });

    // QR Code + link de validação
    const qrBuffer = Buffer.from(dados.qrCodeDataUrl.split(",")[1], "base64");
    doc.image(qrBuffer, largura - 150, altura - 140, { width: 80 });
    doc.fontSize(7).fillColor("#888").text("Valide este certificado em", largura - 160, altura - 55, { width: 100, align: "center" });
    doc.fontSize(6).fillColor("#0a1f5e").text(dados.urlValidacao.replace("https://", ""), largura - 170, altura - 45, { width: 120, align: "center" });

    // Assinaturas
    const totalAssinantes = dados.assinantes.length || 0;
    if (totalAssinantes > 0) {
      const larguraBloco = 180;
      const espacamento = 40;
      const larguraTotal = totalAssinantes * larguraBloco + (totalAssinantes - 1) * espacamento;
      let x = (largura - larguraTotal) / 2;
      const yAssinatura = altura - 160;

      for (const assinante of dados.assinantes) {
        if (assinante.assinatura_url && fs.existsSync(assinante.assinatura_url)) {
          try {
            doc.image(assinante.assinatura_url, x + (larguraBloco - 100) / 2, yAssinatura, { width: 100, height: 40, fit: [100, 40] });
          } catch { /* segue sem a imagem se ela não carregar */ }
        }
        doc.moveTo(x, yAssinatura + 45).lineTo(x + larguraBloco, yAssinatura + 45).lineWidth(0.5).stroke("#999");
        doc.fontSize(9).font("Helvetica-Bold").fillColor("#333")
          .text(assinante.nome, x, yAssinatura + 50, { width: larguraBloco, align: "center" });
        if (assinante.cargo) {
          doc.fontSize(7).font("Helvetica").fillColor("#666")
            .text(assinante.cargo, x, yAssinatura + 63, { width: larguraBloco, align: "center" });
        }
        x += larguraBloco + espacamento;
      }
    }

    doc.end();
    stream.on("finish", () => resolve(destino));
    stream.on("error", reject);
  });
}

// ── Consulta pública (validação por código, via QR Code ou link) ─────────────
export async function buscarCertificadoPublico(codigo: string) {
  const [rows] = await db.execute(
    `SELECT codigo, candidato_nome, certificacao_nome, emitido_em, validade_ate, status,
            revogado_em, motivo_revogacao
     FROM certificados WHERE codigo = ?`,
    [codigo]
  ) as any;
  return rows[0] || null;
}

// ── Admin: lista certificados emitidos ────────────────────────────────────────
export async function listarCertificadosAdmin(filtro?: {
  certSlug?: string; status?: string; candidatoNome?: string; dataInicio?: string; dataFim?: string;
}) {
  let sql = `SELECT c.*, ct.slug as cert_slug FROM certificados c
             JOIN certification_types ct ON ct.id = c.certification_type_id WHERE 1=1`;
  const params: any[] = [];
  if (filtro?.certSlug) { sql += ` AND ct.slug = ?`; params.push(filtro.certSlug); }
  if (filtro?.status) { sql += ` AND c.status = ?`; params.push(filtro.status); }
  if (filtro?.candidatoNome) { sql += ` AND c.candidato_nome LIKE ?`; params.push(`%${filtro.candidatoNome}%`); }
  if (filtro?.dataInicio) { sql += ` AND c.emitido_em >= ?`; params.push(filtro.dataInicio); }
  if (filtro?.dataFim) { sql += ` AND c.emitido_em <= ?`; params.push(`${filtro.dataFim} 23:59:59`); }
  sql += ` ORDER BY c.emitido_em DESC`;
  const [rows] = await db.execute(sql, params) as any;
  return rows;
}

// ── Admin: revoga um certificado (administrador ou gestor_n1/n2) ─────────────
export async function revogarCertificado(certificadoId: number, motivo: string, revogadoPorUserId: number) {
  await db.execute(
    `UPDATE certificados SET status = 'revogado', revogado_em = NOW(), revogado_por = ?, motivo_revogacao = ? WHERE id = ?`,
    [revogadoPorUserId, motivo, certificadoId]
  );
}

// ── Admin: reemite (revoga o certificado atual preservando o histórico e
// emite um novo, com novo código e novo PDF, pro mesmo processo) ─────────────
export async function reemitirCertificado(certificadoId: number, revogadoPorUserId: number, motivo: string) {
  const [rows] = await db.execute(`SELECT * FROM certificados WHERE id = ?`, [certificadoId]) as any;
  if (!rows.length) throw new Error("Certificado não encontrado");
  const original = rows[0];

  await db.execute(
    `UPDATE certificados SET status = 'revogado', revogado_em = NOW(), revogado_por = ?, motivo_revogacao = ? WHERE id = ?`,
    [revogadoPorUserId, `Reemitido: ${motivo}`, certificadoId]
  );

  return emitirCertificado(original.processo_id);
}
