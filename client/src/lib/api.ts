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

    verificarCpf: (cpf: string) =>
      request<{ existe: boolean; email?: string }>("POST", "/auth/verificar-cpf", { cpf }),

    atualizarPerfil: (body: {
      full_name?: string;
      phone?: string;
      company?: string;
      job_title?: string;
      education?: string;
      experience_years?: string;
      linkedin_url?: string;
    }) => request<{ message: string }>("PUT", "/auth/meu-perfil", body),

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
    editarQuestao: (id: number, body: any) => request<{ message: string }>("PUT", `/admin/questoes/${id}`, body),
    removerQuestao: (id: number) => request<{ message: string }>("DELETE", `/admin/questoes/${id}`),

    // Simulações (configuração por certificação)
    listarSimulacoes: () => request<{ simulacoes: any[] }>("GET", "/admin/simulacoes"),
    salvarSimulacao: (body: { cert_slug: string; titulo: string; quantidade_questoes: number; ativa: boolean }) =>
      request<{ id: number }>("POST", "/admin/simulacoes", body),
    removerSimulacao: (id: number) => request<{ message: string }>("DELETE", `/admin/simulacoes/${id}`),

    // Documentos complementares — avaliador solicita ao candidato dentro do sistema
    solicitarDocumentos: (processoId: number, mensagem: string, documentoIdx?: number) =>
      request<{ id: number; message: string }>("POST", `/admin/validacao/${processoId}/solicitar-documentos`, { mensagem, documento_idx: documentoIdx }),
    listarSolicitacoesDocumentos: (processoId: number) =>
      request<{ solicitacoes: any[] }>("GET", `/admin/validacao/${processoId}/solicitacoes-documentos`),

    // Permissões de menu por perfil
    listarMenuPermissoes: () =>
      request<{ roles: { id: number; code: string; nome: string; itens: string[] }[] }>("GET", "/admin/roles/menu-permissoes"),
    salvarMenuPermissoes: (roleCode: string, itens: string[]) =>
      request<{ message: string }>("PUT", `/admin/roles/${roleCode}/menu-permissoes`, { itens }),
  },

  provaAgendamento: {
    salasDisponiveis: () =>
      request<{ processo_id: number; cert_nome: string; salas: any[] }>("GET", "/prova/salas-disponiveis"),

    meuAgendamento: () =>
      request<{ agendamento: any | null }>("GET", "/prova/meu-agendamento"),

    agendar: (salaId: number) =>
      request<{ sala_id: number; data_hora: string; duracao_minutos: number; cert_nome: string }>(
        "POST", "/prova/agendar", { sala_id: salaId }
      ),

    entrarNaSala: (salaId: number) =>
      request<{ tentativa_id: number; daily_room_url: string; daily_token: string }>(
        "POST", `/prova/sala/${salaId}/entrar`
      ),

    registrarViolacao: (tentativaId: number, tipo: "troca_aba" | "saida_fullscreen") =>
      request<{ violacoes_count: number; limite: number; anulada: boolean }>(
        "POST", "/prova/violacao", { tentativa_id: tentativaId, tipo }
      ),
  },

  simulacao: {
    ativas: () =>
      request<{ simulacoes: { id: number; titulo: string; quantidade_questoes: number; cert_slug: string; cert_nome: string }[] }>(
        "GET", "/simulacao/ativas"
      ),

    iniciar: (certSlug: string, nome?: string, email?: string) =>
      request<{ tentativa_id: number; retomada: boolean }>(
        "POST", "/simulacao/iniciar", { cert_slug: certSlug, nome, email }
      ),

    minhaEmAndamento: (certSlug: string) =>
      request<{ tentativa_id: number | null }>("GET", `/simulacao/minha-em-andamento/${certSlug}`),

    estado: (tentativaId: number) =>
      request<{
        tentativa_id: number; status: string; total_questoes: number; acertos: number | null;
        questoes: { id: number; numero: number; enunciado: string; opcoes: string[] }[];
        respostas: { questao_id: number; resposta: number; correta: boolean }[];
      }>("GET", `/simulacao/${tentativaId}`),

    responder: (tentativaId: number, questaoId: number, resposta: number) =>
      request<{ correta: boolean; resposta_correta: number; explicacao: string | null }>(
        "POST", `/simulacao/${tentativaId}/responder`, { questao_id: questaoId, resposta }
      ),

    finalizar: (tentativaId: number) =>
      request<{ acertos: number; total_questoes: number }>("POST", `/simulacao/${tentativaId}/finalizar`),
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

// ── Salas de Prova — agenda, fiscal e gravações (admin) ──────────────────────

Object.assign(adminApi, {
  listarFiscaisDisponiveis: () =>
    request<{ fiscais: { id: number; full_name: string; role: string; role_nome: string }[] }>(
      "GET", "/admin/fiscais-disponiveis"
    ),

  listarSalasProva: () =>
    request<{ salas: any[] }>("GET", "/admin/salas-prova"),

  criarSalaProva: (body: {
    cert_slug: string;
    data_hora: string;
    duracao_minutos?: number;
    capacidade_maxima?: number;
    fiscal_id?: number | null;
  }) => request<{ id: number }>("POST", "/admin/salas-prova", body),

  cancelarSalaProva: (id: number) =>
    request<{ message: string }>("DELETE", `/admin/salas-prova/${id}`),

  listarCandidatosDaSala: (salaId: number) =>
    request<{ candidatos: any[] }>("GET", `/admin/salas-prova/${salaId}/candidatos`),

  entrarComoFiscal: (salaId: number) =>
    request<{ daily_room_url: string; daily_token: string }>("POST", `/admin/salas-prova/${salaId}/entrar-fiscal`),

  anularTentativaAdmin: (salaId: number, tentativaId: number, motivo?: string) =>
    request<{ message: string }>("POST", `/admin/salas-prova/${salaId}/anular/${tentativaId}`, { motivo }),

  listarGravacoesSala: (salaId: number) =>
    request<{ gravacoes: any[] }>("GET", `/admin/salas-prova/${salaId}/gravacoes`),

  arquivarGravacao: (id: number) =>
    request<{ message: string }>("POST", `/admin/gravacoes/${id}/arquivar`),
});
