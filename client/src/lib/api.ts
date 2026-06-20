// Hook centralizado para chamadas à API
// Todas as telas usam este hook em vez de fetch direto

const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("anefac_token");
}

export function setToken(token: string) {
  localStorage.setItem("anefac_token", token);
}

export function clearToken() {
  localStorage.removeItem("anefac_token");
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Erro na requisição");
  }

  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    register: (body: {
      email: string;
      password: string;
      full_name: string;
      cpf: string;
      phone?: string;
    }) => request<{ token: string; userId: number }>("POST", "/auth/register", body),

    login: (email: string, password: string) =>
      request<{ token: string; user: { id: number; email: string; full_name: string; role: string } }>(
        "POST",
        "/auth/login",
        { email, password }
      ),

    me: () =>
      request<{ user: { id: number; email: string; full_name: string; role: string } }>(
        "GET",
        "/auth/me"
      ),
  },

  processo: {
    atual: () =>
      request<{ processo: any | null }>("GET", "/processo/atual"),

    iniciar: (body: {
      certification_type_id: number;
      candidato_nome: string;
      candidato_email: string;
      candidato_cpf: string;
      candidato_telefone?: string;
      formacao?: string;
      experiencia?: string;
    }) => request<{ processo_id: number; status: string }>("POST", "/processo/iniciar", body),

    avancar: (processoId: number, novo_status: string) =>
      request<{ status: string }>("POST", `/processo/${processoId}/avancar`, { novo_status }),

    adminLista: (status?: string) =>
      request<{ processos: any[] }>("GET", `/processo/admin/lista${status ? `?status=${status}` : ""}`),

    definirCaminho: (processoId: number, caminho: "A" | "B") =>
      request<{ caminho: string; status: string }>(
        "POST",
        `/processo/${processoId}/definir-caminho`,
        { caminho }
      ),
  },

  health: () => request<{ status: string }>("GET", "/health"),
};
