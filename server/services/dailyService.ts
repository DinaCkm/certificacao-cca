// Serviço de integração com Daily.co — salas de vídeo ao vivo para a prova
// fiscalizada (fiscal + até N candidatos), com gravação automática em nuvem.
// Documentação: https://docs.daily.co/reference/rest-api

import axios from "axios";

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_DOMAIN = process.env.DAILY_DOMAIN; // ex: ecodobem.daily.co
const DAILY_API_BASE = "https://api.daily.co/v1";

function client() {
  if (!DAILY_API_KEY) {
    throw new Error("DAILY_API_KEY não configurada nas variáveis de ambiente");
  }
  return axios.create({
    baseURL: DAILY_API_BASE,
    headers: {
      Authorization: `Bearer ${DAILY_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
}

// ── Cria a sala de vídeo para uma sala_prova ──────────────────────────────────
// A sala fica válida (exp) até o fim do horário agendado + 30 min de tolerância,
// o que naturalmente bloqueia acesso fora da janela da prova.
export async function criarSalaDaily(
  salaProvaId: number,
  capacidadeMaxima: number,
  dataHoraInicio: Date,
  duracaoMinutos: number
) {
  const nome = `prova-${salaProvaId}-${Date.now()}`;
  const nbf = Math.floor(dataHoraInicio.getTime() / 1000) - 15 * 60; // libera 15min antes
  const exp = Math.floor(dataHoraInicio.getTime() / 1000) + (duracaoMinutos + 30) * 60;

  const { data } = await client().post("/rooms", {
    name: nome,
    privacy: "private",
    properties: {
      max_participants: capacidadeMaxima + 1, // + fiscal
      enable_recording: "cloud",
      eject_at_room_exp: true,
      enable_prejoin_ui: true,
      enable_knocking: false,
      nbf,
      exp,
    },
  });

  return { daily_room_name: data.name as string, daily_room_url: data.url as string };
}

// ── Gera token de acesso individual (candidato ou fiscal) ─────────────────────
export async function gerarTokenReuniao(
  roomName: string,
  userName: string,
  isOwner: boolean,
  expUnix: number
) {
  const { data } = await client().post("/meeting-tokens", {
    properties: {
      room_name: roomName,
      user_name: userName,
      is_owner: isOwner,
      exp: expUnix,
      enable_recording_ui: isOwner ? "cloud" : undefined,
      start_cloud_recording: isOwner,
    },
  });
  return data.token as string;
}

// ── Exclui a sala no Daily (usado ao cancelar sala_prova) ─────────────────────
export async function excluirSalaDaily(roomName: string) {
  try {
    await client().delete(`/rooms/${roomName}`);
  } catch (err: any) {
    console.warn(`⚠️ Erro ao excluir sala Daily ${roomName}:`, err?.response?.data || err.message);
  }
}

// ── Lista gravações de uma sala específica ────────────────────────────────────
export async function listarGravacoesDaily(roomName: string) {
  const { data } = await client().get("/recordings", { params: { room_name: roomName, limit: 20 } });
  return (data.data || []) as Array<{
    id: string;
    room_name: string;
    status: string;
    duration: number;
    start_ts: number;
  }>;
}

// ── Gera link de download temporário (~1h) de uma gravação ───────────────────
export async function obterLinkDownloadGravacao(recordingId: string) {
  const { data } = await client().get(`/recordings/${recordingId}/access-link`);
  return data.download_link as string;
}

// ── Exclui a gravação no Daily (após já ter sido baixada/arquivada) ───────────
export async function excluirGravacaoDaily(recordingId: string) {
  try {
    await client().delete(`/recordings/${recordingId}`);
  } catch (err: any) {
    console.warn(`⚠️ Erro ao excluir gravação Daily ${recordingId}:`, err?.response?.data || err.message);
  }
}

export function dailyConfigurado() {
  return !!DAILY_API_KEY;
}

export function dailyDomain() {
  return DAILY_DOMAIN;
}
