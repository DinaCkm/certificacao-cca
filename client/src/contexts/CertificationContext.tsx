import React, { createContext, useContext, useState, useEffect } from "react";

export type CertificationStatus = "ativa" | "em_breve" | "inativa" | "encerrada";
export type CaminhoAvaliacao = "A" | "B" | null;

export interface Certification {
  id: string;
  nome: string;
  subtitulo: string;
  descricao: string;
  publicoAlvo: string;
  competencias: string[];
  preRequisitos: string[];
  nivel: string;
  taxaAnalise: number;
  taxaEmissao: number;
  exigeProva: boolean;
  entrevistadireta: boolean;
  status: CertificationStatus;
  icone: string;
  cor: "blue" | "gold" | "green" | "purple" | "orange";
  cursos: string[];
  documentosExigidos: string[];
}

export interface CandidatoProcesso {
  certificacaoId: string | null;
  certificacaoNome: string | null;
  taxaAnalise: number;
  taxaEmissao: number;
  exigeProva: boolean;
  dataSelecionada: string | null;
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
  candidatoNome: string | null;
  candidatoEmail: string | null;
}

interface CertificationContextType {
  certifications: Certification[];
  processo: CandidatoProcesso;
  getCertificacaoAtual: () => Certification | null;
  selecionarCertificacao: (cert: Certification) => void;
  atualizarStatus: (status: CandidatoProcesso["statusGeral"]) => void;
  definirCaminho: (caminho: CaminhoAvaliacao) => void;
  registrarPagamento1: () => void;
  registrarPagamento2: () => void;
  registrarTentativaProva: () => void;
  definirResultadoEntrevista: (aprovado: boolean) => void;
  atualizarCandidato: (nome: string, email: string) => void;
  resetarProcesso: () => void;
}

export const CERTIFICATIONS_DATA: Certification[] = [
  {
    id: "controller",
    nome: "Certificação Controller",
    subtitulo: "Certificação Controller ANEFAC",
    descricao:
      "Voltada para profissionais de controladoria que buscam comprovar educação continuada e alto nível de capacitação em 8 áreas do conhecimento financeiro e de gestão.",
    publicoAlvo: "Profissionais de Controladoria com 2+ anos de experiência",
    competencias: [
      "Contabilidade e Demonstrações Financeiras",
      "Economia e Cenário Macroeconômico",
      "Finanças Corporativas",
      "Tributos e Legislação Fiscal",
      "Administração e Gestão",
      "Governança Corporativa",
      "Tecnologia da Informação",
      "Capital Humano e Liderança",
    ],
    preRequisitos: [
      "Graduação em Ciências Contábeis, Administração ou Economia",
      "Mínimo de 2 anos de experiência em controladoria",
      "Comprovação de atuação em empresa de médio ou grande porte",
    ],
    nivel: "Nível 1",
    taxaAnalise: 1200,
    taxaEmissao: 500,
    exigeProva: true,
    entrevistadireta: false,
    status: "ativa",
    icone: "📊",
    cor: "blue",
    cursos: [
      "Fundamentos de Controladoria",
      "Análise de Demonstrações Financeiras",
      "Gestão Tributária Aplicada",
    ],
    documentosExigidos: [
      "Diploma de graduação (frente e verso)",
      "Comprovante de experiência profissional (declaração ou carteira de trabalho)",
      "Currículo atualizado",
      "Documento de identidade com foto",
      "CPF",
    ],
  },
  {
    id: "controller-plus",
    nome: "Certificação Controller Plus",
    subtitulo: "Certificação Controller ANEFAC — Nível Executivo",
    descricao:
      "Destinada a executivos de controladoria com consolidação em grandes empresas, que buscam o mais alto nível de reconhecimento profissional na área.",
    publicoAlvo: "Executivos de Controladoria em grandes empresas (faturamento acima de R$ 50 mi)",
    competencias: [
      "Estratégia Financeira e Planejamento",
      "Consolidação de Demonstrações Financeiras",
      "Gestão de Riscos Corporativos",
      "Governança e Compliance",
      "Liderança de Equipes Financeiras",
      "Fusões, Aquisições e Reestruturações",
    ],
    preRequisitos: [
      "Graduação em área de negócios",
      "Mínimo de 8 anos de experiência executiva em controladoria",
      "Atuação em empresa com faturamento acima de R$ 50 milhões",
      "Comprovação de liderança de equipe",
    ],
    nivel: "Nível Executivo",
    taxaAnalise: 1800,
    taxaEmissao: 700,
    exigeProva: false,
    entrevistadireta: true,
    status: "ativa",
    icone: "🏆",
    cor: "gold",
    cursos: [
      "Estratégia Financeira Avançada",
      "Governança Corporativa para Executivos",
      "Gestão de Riscos Corporativos",
    ],
    documentosExigidos: [
      "Diploma de graduação (frente e verso)",
      "Comprovante de cargo executivo (declaração da empresa)",
      "Currículo detalhado com realizações",
      "Documento de identidade com foto",
      "CPF",
      "Carta de recomendação (opcional, mas valorizada)",
    ],
  },
  {
    id: "cca",
    nome: "Certificação CCA",
    subtitulo: "Certificação de Competência em Administração",
    descricao:
      "Direcionada a profissionais experientes em gestão que buscam validação de mercado e consolidação na função de Controller.",
    publicoAlvo: "Profissionais de Gestão e Administração com experiência em controladoria",
    competencias: [
      "Gestão Financeira e Orçamentária",
      "Análise de Custos e Rentabilidade",
      "Planejamento Estratégico",
      "Indicadores de Desempenho (KPIs)",
      "Controladoria Gerencial",
    ],
    preRequisitos: [
      "Graduação em Administração, Contabilidade ou Economia",
      "Experiência comprovada em gestão financeira",
    ],
    nivel: "Nível 1",
    taxaAnalise: 1000,
    taxaEmissao: 450,
    exigeProva: true,
    entrevistadireta: false,
    status: "ativa",
    icone: "📈",
    cor: "green",
    cursos: [
      "Gestão Financeira para Controllers",
      "Análise de Custos Aplicada",
      "KPIs e Indicadores de Gestão",
    ],
    documentosExigidos: [
      "Diploma de graduação",
      "Comprovante de experiência em gestão",
      "Currículo atualizado",
      "Documento de identidade com foto",
      "CPF",
    ],
  },
  {
    id: "lideres",
    nome: "Certificação de Líderes",
    subtitulo: "Desenvolvimento e Validação de Liderança",
    descricao:
      "Programa de desenvolvimento para profissionais que buscam validar e aprimorar suas competências em liderança e gestão de pessoas.",
    publicoAlvo: "Profissionais em posições de liderança ou em transição para cargos de gestão",
    competencias: [
      "Liderança Situacional",
      "Gestão de Equipes de Alta Performance",
      "Comunicação Executiva",
      "Tomada de Decisão Estratégica",
      "Desenvolvimento de Pessoas",
    ],
    preRequisitos: [
      "Experiência mínima de 3 anos em posição de liderança",
      "Graduação em qualquer área",
    ],
    nivel: "Nível 1",
    taxaAnalise: 900,
    taxaEmissao: 400,
    exigeProva: true,
    entrevistadireta: false,
    status: "em_breve",
    icone: "👥",
    cor: "purple",
    cursos: [
      "Liderança e Gestão de Pessoas",
      "Comunicação para Líderes",
      "Tomada de Decisão em Ambientes Complexos",
    ],
    documentosExigidos: [
      "Diploma de graduação",
      "Comprovante de cargo de liderança",
      "Currículo atualizado",
      "Documento de identidade com foto",
      "CPF",
    ],
  },
];

const PROCESSO_INICIAL: CandidatoProcesso = {
  certificacaoId: null,
  certificacaoNome: null,
  taxaAnalise: 0,
  taxaEmissao: 0,
  exigeProva: false,
  dataSelecionada: null,
  statusGeral: "selecao",
  caminhoAvaliacao: null,
  tentativasProva: 0,
  pagamento1Realizado: false,
  pagamento2Realizado: false,
  aprovadoEntrevista: null,
  candidatoNome: null,
  candidatoEmail: null,
};

const CertificationContext = createContext<CertificationContextType | null>(null);

export function CertificationProvider({ children }: { children: React.ReactNode }) {
  const [processo, setProcesso] = useState<CandidatoProcesso>(() => {
    try {
      const saved = localStorage.getItem("anefac_processo_v2");
      return saved ? JSON.parse(saved) : PROCESSO_INICIAL;
    } catch {
      return PROCESSO_INICIAL;
    }
  });

  useEffect(() => {
    localStorage.setItem("anefac_processo_v2", JSON.stringify(processo));
  }, [processo]);

  const getCertificacaoAtual = (): Certification | null => {
    if (!processo.certificacaoId) return null;
    return CERTIFICATIONS_DATA.find((c) => c.id === processo.certificacaoId) || null;
  };

  const selecionarCertificacao = (cert: Certification) => {
    setProcesso({
      ...PROCESSO_INICIAL,
      certificacaoId: cert.id,
      certificacaoNome: cert.nome,
      taxaAnalise: cert.taxaAnalise,
      taxaEmissao: cert.taxaEmissao,
      exigeProva: cert.exigeProva,
      dataSelecionada: new Date().toISOString(),
      statusGeral: "cadastro",
    });
  };

  const atualizarStatus = (status: CandidatoProcesso["statusGeral"]) => {
    setProcesso((prev) => ({ ...prev, statusGeral: status }));
  };

  const definirCaminho = (caminho: CaminhoAvaliacao) => {
    setProcesso((prev) => ({ ...prev, caminhoAvaliacao: caminho }));
  };

  const registrarPagamento1 = () => {
    setProcesso((prev) => ({ ...prev, pagamento1Realizado: true, statusGeral: "validacao" }));
  };

  const registrarPagamento2 = () => {
    setProcesso((prev) => ({ ...prev, pagamento2Realizado: true, statusGeral: "emissao" }));
  };

  const registrarTentativaProva = () => {
    setProcesso((prev) => ({ ...prev, tentativasProva: prev.tentativasProva + 1 }));
  };

  const definirResultadoEntrevista = (aprovado: boolean) => {
    setProcesso((prev) => ({
      ...prev,
      aprovadoEntrevista: aprovado,
      statusGeral: aprovado ? "pagamento2" : "encerrado",
    }));
  };

  const atualizarCandidato = (nome: string, email: string) => {
    setProcesso((prev) => ({ ...prev, candidatoNome: nome, candidatoEmail: email }));
  };

  const resetarProcesso = () => {
    setProcesso(PROCESSO_INICIAL);
    localStorage.removeItem("anefac_processo_v2");
  };

  return (
    <CertificationContext.Provider
      value={{
        certifications: CERTIFICATIONS_DATA,
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
