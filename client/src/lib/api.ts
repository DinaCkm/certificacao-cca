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

    slotsDisponiveis: () =>
      request<{ slots: any[] }>("GET", "/processo/slots-disponiveis"),

    agendarEntrevista: (slot_id: number, processo_id: number) =>
      request<{ agendamento_id: number; data_hora: string }>("POST", "/processo/agendar-entrevista", { slot_id, processo_id }),

    // Fase 3 — sincronização do processo com o banco
    sincronizar: (processo: any) =>
      request<{ processo_id: number; status: string }>("POST", "/processo/sincronizar", processo),

    retomar: () =>
      request<{ processo: any | null }>("GET", "/processo/retomar"),

    // Documentos complementares solicitados pelo avaliador — fluxo do candidato
    solicitacoesDocumentos: () =>
      request<{ solicitacoes: any[] }>("GET", "/processo/solicitacoes-documentos"),

    concluirSolicitacaoDocumentos: (id: number) =>
      request<{ message: string }>("POST", `/processo/solicitacoes-documentos/${id}/concluir`),
  },

  health: () => request<{ status: string }>("GET", "/health"),

  admin: {
    listarUsuarios: () => request<{ usuarios: any[] }>("GET", "/admin/usuarios"),
    criarUsuario: (body: any) => request<{ id: number; message: string }>("POST", "/admin/usuarios", body),
    editarUsuario: (id: number, body: any) => request<{ message: string }>("PUT", `/admin/usuarios/${id}`, body),
    listarRoles: () => request<{ roles: any[] }>("GET", "/admin/roles"),
    listarSlots: () => request<{ slots: any[] }>("GET", "/admin/slots"),
    criarSlot: (body: { data_hora: string; duracao_minutos?: number }) => request<{ id: number }>("POST", "/admin/slots", body),
    removerSlot: (id: number) => request<{ message: string }>("DELETE", `/admin/slots/${id}`),

    // Carrossel — métodos admin
    listarCarrossel: () => request<{ imagens: any[] }>("GET", "/admin/carrossel"),
    criarCarrossel: (body: any) => request<{ id: number }>("POST", "/admin/carrossel", body),
    editarCarrossel: (id: number, body: any) => request<{ message: string }>("PUT", `/admin/carrossel/${id}`, body),
    removerCarrossel: (id: number) => request<{ message: string }>("DELETE", `/admin/carrossel/${id}`),

    // Prova config
    salvarProvaConfig: (body: any) => request<{ message: string }>("POST", "/admin/prova-config", body),
    adicionarQuestao: (body: any) => request<{ id: number }>("POST", "/admin/questoes", body),
    removerQuestao: (id: number) => request<{ message: string }>("DELETE", `/admin/questoes/${id}`),

    // Documentos complementares — avaliador solicita ao candidato dentro do sistema
    solicitarDocumentos: (processoId: number, mensagem: string) =>
      request<{ id: number; message: string }>("POST", `/admin/validacao/${processoId}/solicitar-documentos`, { mensagem }),
    listarSolicitacoesDocumentos: (processoId: number) =>
      request<{ solicitacoes: any[] }>("GET", `/admin/validacao/${processoId}/solicitacoes-documentos`),

    // Permissões de menu por perfil
    listarMenuPermissoes: () =>
      request<{ roles: { id: number; code: string; nome: string; itens: string[] }[] }>("GET", "/admin/roles/menu-permissoes"),
    salvarMenuPermissoes: (roleCode: string, itens: string[]) =>
      request<{ message: string }>("PUT", `/admin/roles/${roleCode}/menu-permissoes`, { itens }),
  },
};

// ── Admin ─────────────────────────────────────────────────────────────────────
// Adicionado ao objeto api existente via extensão do módulo

export const adminApi = {
  listarUsuarios: () =>
    request<{ usuarios: any[] }>("GET", "/admin/usuarios"),

  criarUsuario: (body: { email: string; senha: string; full_name: string; cpf: string; role_code: string }) =>
    request<{ id: number; message: string }>("POST", "/admin/usuarios", body),

  editarUsuario: (id: number, body: { full_name?: string; role_code?: string; is_active?: boolean; senha?: string }) =>
    request<{ message: string }>("PUT", `/admin/usuarios/${id}`, body),

  listarRoles: () =>
    request<{ roles: any[] }>("GET", "/admin/roles"),
};

// Slots — adicionados ao objeto adminApi (duplicado legado, mantido por compatibilidade)
Object.assign(adminApi, {
  listarSlots: () => request<{ slots: any[] }>("GET", "/admin/slots"),
  criarSlot: (body: { data_hora: string; duracao_minutos?: number }) =>
    request<{ id: number }>("POST", "/admin/slots", body),
  removerSlot: (id: number) =>
    request<{ message: string }>("DELETE", `/admin/slots/${id}`),
});
