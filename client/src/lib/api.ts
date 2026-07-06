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

// Identifica visitantes anônimos (sem login) para o rastreamento de cliques
// em cursos. Gerado uma vez por navegador e reaproveitado nas próximas visitas.
const SESSAO_KEY = "anefac_sessao_id";
export function getSessaoId(): string {
  let id = localStorage.getItem(SESSAO_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSAO_KEY, id);
  }
  return id;
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

    retomar: (certificacaoId?: string) =>
      request<{ processo: any | null }>(
        "GET",
        `/processo/retomar${certificacaoId ? `?certificacaoId=${encodeURIComponent(certificacaoId)}` : ""}`
      ),

    meus: () =>
      request<{ processos: any[] }>("GET", "/processo/meus"),

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

export const adminApi: Record<string, (...args: any[]) => Promise<any>> = {
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

// ── Cursos (público) ────────────────────────────────────────────────────────────

export const cursosApi = {
  publico: () =>
    request<{ cursos: any[]; pacotes: any[] }>("GET", "/cursos/publico"),

  registrarClique: (body: {
    curso_id?: number;
    curso_titulo: string;
    tipo_destino: "interno" | "externo";
    link_destino?: string;
    sessao_id?: string;
  }) => request<{ id: number }>("POST", "/cursos/clique", body),

  confirmarCompra: (cliqueId: number) =>
    request<{ ok: boolean }>("POST", `/cursos/clique/${cliqueId}/confirmar-compra`),
};

// ── Cursos e Pacotes (admin) ─────────────────────────────────────────────────────

Object.assign(adminApi, {
  listarCursos: () => request<{ cursos: any[] }>("GET", "/admin/cursos"),
  criarCurso: (body: any) => request<{ id: number }>("POST", "/admin/cursos", body),
  editarCurso: (id: number, body: any) => request<{ message: string }>("PUT", `/admin/cursos/${id}`, body),
  removerCurso: (id: number) => request<{ message: string }>("DELETE", `/admin/cursos/${id}`),

  listarPacotes: () => request<{ pacotes: any[] }>("GET", "/admin/pacotes"),
  criarPacote: (body: any) => request<{ id: number }>("POST", "/admin/pacotes", body),
  editarPacote: (id: number, body: any) => request<{ message: string }>("PUT", `/admin/pacotes/${id}`, body),
  removerPacote: (id: number) => request<{ message: string }>("DELETE", `/admin/pacotes/${id}`),

  relatorioCursosCliques: (filtros?: {
    tipo_destino?: "interno" | "externo";
    comprou?: "sim" | "nao";
    curso_id?: number;
    data_inicio?: string;
    data_fim?: string;
  }) => {
    const params = new URLSearchParams();
    if (filtros) {
      Object.entries(filtros).forEach(([k, v]) => {
        if (v !== undefined && v !== "") params.set(k, String(v));
      });
    }
    const qs = params.toString();
    return request<{ cliques: any[]; resumo: any }>("GET", `/admin/relatorios/cursos-cliques${qs ? `?${qs}` : ""}`);
  },
});

// ── Documentos exigidos por certificação (público + admin) ──────────────────────

export const certificacoesApi = {
  publico: () =>
    request<{ certificacoes: any[] }>("GET", "/certificacoes/publico"),

  documentosExigidos: () =>
    request<{ documentosExigidos: Record<string, string[]> }>("GET", "/certificacoes/documentos-exigidos"),
};

Object.assign(adminApi, {
  sincronizarCertificacao: (slug: string, body: {
    nome: string;
    numero?: number;
    taxaAnalise?: number;
    taxaEmissao?: number;
    caminhoDefault?: string | null;
    documentosExigidos: string[];
    status?: string;
  }) => request<{ message: string; criado: boolean; numero?: number }>(
    "PUT",
    `/admin/certificacoes/${slug}/sincronizar`,
    body
  ),

  definirStatusCertificacao: (slug: string, status: string) =>
    request<{ message: string }>("PUT", `/admin/certificacoes/${slug}/status`, { status }),
});
