import fs from "fs";
import path from "path";
import axios from "axios";
import { db } from "../db/connection.js";
import { listarGravacoesDaily, obterLinkDownloadGravacao, excluirGravacaoDaily } from "./dailyService.js";

function diretorioGravacoes() {
  const base = process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "gravacoes_prova")
    : path.join(process.cwd(), "uploads", "gravacoes_prova");
  if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
  return base;
}

// ── Consulta o Daily.co e garante que cada gravação da sala está no banco ─────
export async function sincronizarGravacoesSala(salaId: number) {
  const [salas] = await db.execute(`SELECT * FROM salas_prova WHERE id = ?`, [salaId]) as any;
  if (!salas.length) throw new Error("Sala não encontrada");
  const sala = salas[0];
  if (!sala.daily_room_name) return [];

  const gravacoesDaily = await listarGravacoesDaily(sala.daily_room_name);

  for (const g of gravacoesDaily) {
    const [existentes] = await db.execute(
      `SELECT id FROM gravacoes_prova WHERE daily_recording_id = ?`,
      [g.id]
    ) as any;
    if (existentes.length === 0) {
      await db.execute(
        `INSERT INTO gravacoes_prova (sala_id, daily_recording_id, status)
         VALUES (?, ?, ?)`,
        [salaId, g.id, g.status === "finished" ? "disponivel" : "processando"]
      );
    } else if (g.status === "finished") {
      await db.execute(
        `UPDATE gravacoes_prova SET status = 'disponivel' WHERE daily_recording_id = ? AND status = 'processando'`,
        [g.id]
      );
    }
  }

  const [rows] = await db.execute(`SELECT * FROM gravacoes_prova WHERE sala_id = ? ORDER BY criado_em ASC`, [salaId]) as any;
  return rows;
}

// ── Baixa a gravação do Daily para o Railway Volume, se ainda não baixada ─────
export async function baixarGravacao(gravacaoId: number) {
  const [rows] = await db.execute(`SELECT * FROM gravacoes_prova WHERE id = ?`, [gravacaoId]) as any;
  if (!rows.length) throw new Error("Gravação não encontrada");
  const gravacao = rows[0];

  if (gravacao.caminho_arquivo && fs.existsSync(gravacao.caminho_arquivo)) {
    return gravacao.caminho_arquivo as string;
  }

  if (gravacao.status !== "disponivel" && gravacao.status !== "baixada") {
    throw new Error("Gravação ainda não está pronta no Daily.co");
  }

  const downloadLink = await obterLinkDownloadGravacao(gravacao.daily_recording_id);
  const destino = path.join(diretorioGravacoes(), `sala${gravacao.sala_id}_${gravacao.daily_recording_id}.mp4`);

  const resposta = await axios.get(downloadLink, { responseType: "stream" });
  await new Promise<void>((resolve, reject) => {
    const writer = fs.createWriteStream(destino);
    resposta.data.pipe(writer);
    writer.on("finish", () => resolve());
    writer.on("error", reject);
  });

  const tamanho = fs.statSync(destino).size;

  await db.execute(
    `UPDATE gravacoes_prova SET caminho_arquivo = ?, tamanho_bytes = ?, status = 'baixada', baixada_em = NOW() WHERE id = ?`,
    [destino, tamanho, gravacaoId]
  );

  return destino;
}

// ── Marca como arquivada e libera espaço no servidor (após backup local/HD) ──
export async function arquivarGravacao(gravacaoId: number) {
  const [rows] = await db.execute(`SELECT * FROM gravacoes_prova WHERE id = ?`, [gravacaoId]) as any;
  if (!rows.length) throw new Error("Gravação não encontrada");
  const gravacao = rows[0];

  if (gravacao.status !== "baixada") {
    throw new Error("Só é possível arquivar uma gravação já baixada — confirme o download antes");
  }

  if (gravacao.caminho_arquivo && fs.existsSync(gravacao.caminho_arquivo)) {
    fs.unlinkSync(gravacao.caminho_arquivo);
  }
  if (gravacao.daily_recording_id) {
    await excluirGravacaoDaily(gravacao.daily_recording_id);
  }

  await db.execute(
    `UPDATE gravacoes_prova SET status = 'arquivada', caminho_arquivo = NULL WHERE id = ?`,
    [gravacaoId]
  );
}
