import React, { createContext, useContext, useState, useEffect } from "react";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export type CertificationStatus = "ativa" | "em_breve" | "inativa" | "encerrada";
export type CaminhoAvaliacao = "A" | "B" | null;
export type TipoCompra = "cert_cursos" | "cert_direta" | "apenas_cursos" | null;

/**
 * Modelo genérico de certificação.
 * Os nomes são definidos pelo administrador — não há nomes fixos no código.
 * O campo `numero` (1 a 10) é o identificador visual exibido ao candidato.
 */
export interface Certification {
  id: string;                    // slug gerado pelo admin (ex: "certificacao-1")
  numero: number;                // 1 a 10 — exibido como "Certificação 1", "Certificação 2" etc.
  nome: string;                  // nome completo definido pelo admin
  subtitulo: string;             // subtítulo ou área (ex: "Controladoria")
  descricao: string;             // descrição completa para o site
  descricaoBreve: string;        // resumo curto para cards e listagens
  publicoAlvo: string;
  competencias: string[];
  preRequisitos: string[];
  documentosExigidos: string[];
  cursos: string[];
  taxaAnalise: number;           // Pagamento 1
  taxaEmissao: number;           // Pagamento 2
  /**
   * Caminho padrão após validação documental:
   * "A" = apto para entrevista direta (sem prova)
   * "B" = precisa comprovar competência por prova antes da entrevista
   * null = avaliador decide caso a caso
   */
  caminhoDefault: CaminhoAvaliacao;
  status: CertificationStatus;
  cor: "blue" | "gold" | "green" | "purple" | "orange" | "red" | "teal";
  imagemUrl?: string;            // URL da imagem de capa da certificação
  editalUrl?: string;            // URL do PDF do edital
  // Conteúdo do edital
  edital?: {
    dataAbertura?: string;
    dataEncerramento?: string;
    linkPDF?: string;
    observacoes?: string;
  };
}

// ─── Dados iniciais (placeholder — admin substitui pelo painel) ─────────────────
// 3 certificações de exemplo, numeradas. O admin pode adicionar até 10.

export const CERTIFICATIONS_DEFAULT: Certification[] = [
  {
    id: "cca",
    numero: 1,
    nome: "Certificação Controller ANEFAC (CCA)",
    subtitulo: "Controladoria",
    descricao:
      "A Certificação Controller ANEFAC CCA visa certificar profissionais que já possuem experiência em gestão, e que busquem se consolidar na função de Controller.",
    descricaoBreve: "Para profissionais que já possuem experiência em gestão e buscam se consolidar na função de Controller.",
    publicoAlvo: "Profissionais com graduação que possuem pelo menos 2 anos de experiência em gestão e desejam se consolidar como Controller.",
    competencias: [
      "Contabilidade",
      "Economia e Finanças",
      "Administração",
      "Tributário",
      "Governança Corporativa",
      "Tecnologia",
      "Capital Humano"
    ],
    preRequisitos: [
      "Graduação em IES reconhecida pelo MEC (preferencialmente Administração, Contabilidade ou Economia)",
      "Ou diploma em cursos stricto/lato sensu na área administrativo-financeira",
      "Experiência em gestão por pelo menos 2 anos"
    ],
    documentosExigidos: [
      "Diploma de graduação ou pós-graduação",
      "Declaração da empresa atual comprovando experiência",
      "Código de Conduta ANEFAC assinado"
    ],
    cursos: [],
    taxaAnalise: 350,
    taxaEmissao: 250,
    caminhoDefault: "B",
    status: "ativa",
    cor: "blue",
  },
  {
    id: "cca-plus",
    numero: 2,
    nome: "Certificação Controller ANEFAC Plus",
    subtitulo: "Controladoria Avançada",
    descricao:
      "A Certificação Controller ANEFAC CCA-plus visa certificar profissionais que já atuam, consolidados, na função de Controller em empresas de grande porte.",
    descricaoBreve: "Para profissionais atuantes e consolidados como Controller por, pelo menos, cinco anos em empresa de grande porte.",
    publicoAlvo: "Profissionais consolidados na função de Controller com no mínimo 5 anos de experiência em empresas de grande porte.",
    competencias: [
      "Gestão Estratégica",
      "Governança Corporativa Avançada",
      "Liderança",
      "Tomada de Decisão"
    ],
    preRequisitos: [
      "Graduação em IES reconhecida pelo MEC",
      "Experiência na área de controladoria por pelo menos 5 anos em empresa de grande porte",
      "Carta de Recomendação assinada por 2 executivos de alto escalão"
    ],
    documentosExigidos: [
      "Diploma de graduação ou pós-graduação",
      "Declaração comprovando 5 anos de experiência em empresa de grande porte",
      "2 Cartas de Recomendação de executivos",
      "Código de Conduta ANEFAC assinado"
    ],
    cursos: [],
    taxaAnalise: 450,
    taxaEmissao: 350,
    caminhoDefault: "A",
    status: "ativa",
    cor: "gold",
  }
];

const STORAGE_KEY_CERTS = "anefac_certifications_v5";

function loadCertifications(): Certification[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CERTS);
    return saved ? JSON.parse(saved) : CERTIFICATIONS_DEFAULT;
  } catch {
    return CERTIFICATIONS_DEFAULT;
  }
}

// ─── Estado do processo do candidato ───────────────────────────────────────────

export interface CandidatoProcesso {
  certificacaoId: string | null;
  certificacaoNome: string | null;
  certificacaoNumero: number | null;
  taxaAnalise: number;
  taxaEmissao: number;
  tipoCompra: TipoCompra;

  // Dados pessoais
  candidatoNome: string | null;
  candidatoEmail: string | null;
  candidatoCPF: string | null;
  candidatoTelefone: string | null;
  candidatoEmpresa: string | null;
  candidatoCargo: string | null;

  // Controle do fluxo
  statusGeral:
    | "selecao"
    | "cadastro"
    | "upload"
    | "pagamento1"
    | "validacao"
    | "prova"
    | "entrevista"
    | "pagamento2"
    | "emissao"
    | "concluido"
    | "encerrado";

  caminhoAvaliacao: CaminhoAvaliacao;
  tentativasProva: number;
  pagamento1Realizado: boolean;
  pagamento2Realizado: boolean;
  aprovadoEntrevista: boolean | null;
  dataSelecionada: string | null;
  dataInicioProcesso: string | null;
}

const PROCESSO_INICIAL: CandidatoProcesso = {
  certificacaoId: null,
  certificacaoNome: null,
  certificacaoNumero: null,
  taxaAnalise: 0,
  taxaEmissao: 0,
  tipoCompra: null,
  candidatoNome: null,
  candidatoEmail: null,
  candidatoCPF: null,
  candidatoTelefone: null,
  candidatoEmpresa: null,
  candidatoCargo: null,
  statusGeral: "selecao",
  caminhoAvaliacao: null,
  tentativasProva: 0,
  pagamento1Realizado: false,
  pagamento2Realizado: false,
  aprovadoEntrevista: null,
  dataSelecionada: null,
  dataInicioProcesso: null,
};

const STORAGE_KEY_PROCESSO = "anefac_processo_v3";

// ─── Context ───────────────────────────────────────────────────────────────────

interface CertificationContextType {
  certifications: Certification[];
  processo: CandidatoProcesso;
  getCertificacaoAtual: () => Certification | null;
  // Candidato
  selecionarCertificacao: (cert: Certification, tipo?: TipoCompra) => void;
  atualizarStatus: (status: CandidatoProcesso["statusGeral"]) => void;
  definirCaminho: (caminho: CaminhoAvaliacao) => void;
  registrarPagamento1: () => void;
  registrarPagamento2: () => void;
  registrarTentativaProva: () => void;
  definirResultadoEntrevista: (aprovado: boolean) => void;
  atualizarCandidato: (dados: Partial<CandidatoProcesso>) => void;
  resetarProcesso: () => void;
  // Admin
  salvarCertificacoes: (certs: Certification[]) => void;
}

const CertificationContext = createContext<CertificationContextType | null>(null);

export function CertificationProvider({ children }: { children: React.ReactNode }) {
  const [certifications, setCertifications] = useState<Certification[]>(loadCertifications);

  const [processo, setProcesso] = useState<CandidatoProcesso>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROCESSO);
      return saved ? JSON.parse(saved) : PROCESSO_INICIAL;
    } catch {
      return PROCESSO_INICIAL;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROCESSO, JSON.stringify(processo));
  }, [processo]);

  const getCertificacaoAtual = (): Certification | null =>
    certifications.find((c) => c.id === processo.certificacaoId) || null;

  const selecionarCertificacao = (cert: Certification, tipo: TipoCompra = "cert_direta") => {
    setProcesso({
      ...PROCESSO_INICIAL,
      certificacaoId: cert.id,
      certificacaoNome: cert.nome,
      certificacaoNumero: cert.numero,
      taxaAnalise: cert.taxaAnalise,
      taxaEmissao: cert.taxaEmissao,
      tipoCompra: tipo,
      statusGeral: "cadastro",
      dataInicioProcesso: new Date().toISOString(),
    });
  };

  const atualizarStatus = (status: CandidatoProcesso["statusGeral"]) =>
    setProcesso((prev) => ({ ...prev, statusGeral: status }));

  const definirCaminho = (caminho: CaminhoAvaliacao) =>
    setProcesso((prev) => ({ ...prev, caminhoAvaliacao: caminho }));

  const registrarPagamento1 = () =>
    setProcesso((prev) => ({ ...prev, pagamento1Realizado: true, statusGeral: "validacao" }));

  const registrarPagamento2 = () =>
    setProcesso((prev) => ({ ...prev, pagamento2Realizado: true, statusGeral: "emissao" }));

  const registrarTentativaProva = () =>
    setProcesso((prev) => ({ ...prev, tentativasProva: prev.tentativasProva + 1 }));

  const definirResultadoEntrevista = (aprovado: boolean) =>
    setProcesso((prev) => ({
      ...prev,
      aprovadoEntrevista: aprovado,
      statusGeral: aprovado ? "pagamento2" : "encerrado",
    }));

  const atualizarCandidato = (dados: Partial<CandidatoProcesso>) =>
    setProcesso((prev) => ({ ...prev, ...dados }));

  const resetarProcesso = () => {
    localStorage.removeItem(STORAGE_KEY_PROCESSO);
    setProcesso(PROCESSO_INICIAL);
  };

  const salvarCertificacoes = (certs: Certification[]) => {
    const sorted = [...certs].sort((a, b) => a.numero - b.numero);
    setCertifications(sorted);
    localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(sorted));
  };

  return (
    <CertificationContext.Provider
      value={{
        certifications,
        processo,
        getCertificacaoAtual,
        selecionarCertificacao,
        atualizarStatus,
        definirCaminho,
        registrarPagamento1,
        registrarPagamento2,
        registrarTentativaProva,
        definirResultadoEntrevista,
        atualizarCandidato,
        resetarProcesso,
        salvarCertificacoes,
      }}
    >
      {children}
    </CertificationContext.Provider>
  );
}

export function useCertification() {
  const ctx = useContext(CertificationContext);
  if (!ctx) throw new Error("useCertification deve ser usado dentro de CertificationProvider");
  return ctx;
}
