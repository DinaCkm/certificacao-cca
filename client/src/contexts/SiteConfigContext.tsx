import React, { createContext, useContext, useState, useEffect } from "react";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface HeroConfig {
  badge: string;
  titulo: string;
  tituloDestaque: string;
  subtitulo: string;
  ctaPrimario: string;
  ctaSecundario: string;
  stat1Label: string;
  stat2Label: string;
  stat3Label: string;
}

export interface EditalConfig {
  titulo: string;
  subtitulo: string;
  periodoInscricoes: string;
  modalidade: string;
  descricao: string;
  linkPDF: string;
  infoCards: Array<{ titulo: string; descricao: string }>;
}

export interface FAQItem {
  id: string;
  pergunta: string;
  resposta: string;
}

export interface FAQConfig {
  titulo: string;
  items: FAQItem[];
}

export interface CTAFinalConfig {
  titulo: string;
  subtitulo: string;
  botaoLabel: string;
}

export interface RodapeConfig {
  descricaoOrganizacao: string;
  copyright: string;
}

export interface AvisoConfig {
  texto: string;
  visivel: boolean;
}

export interface ComoFuncionaConfig {
  titulo: string;
  subtitulo: string;
  etapas: Array<{ label: string; descricao: string }>;
}

export interface SiteConfig {
  hero: HeroConfig;
  edital: EditalConfig;
  faq: FAQConfig;
  ctaFinal: CTAFinalConfig;
  rodape: RodapeConfig;
  aviso: AvisoConfig;
  comoFunciona: ComoFuncionaConfig;
}

// ─── Valores padrão ────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: SiteConfig = {
  hero: {
    badge: "Programa oficial de certificação profissional",
    titulo: "Certifique sua",
    tituloDestaque: "excelência",
    subtitulo: "Certificações reconhecidas pelo mercado para profissionais que buscam validar suas competências com rigor técnico e credibilidade institucional.",
    ctaPrimario: "Ver certificações disponíveis",
    ctaSecundario: "Acessar edital",
    stat1Label: "certificações disponíveis",
    stat2Label: "processo online",
    stat3Label: "pagamentos separados",
  },
  edital: {
    titulo: "Edital do Processo de Certificação",
    subtitulo: "Leia atentamente antes de iniciar sua inscrição",
    periodoInscricoes: "A definir",
    modalidade: "100% online",
    descricao: "O edital completo com todas as regras, critérios de avaliação, documentos exigidos, prazos e demais informações do processo de certificação será disponibilizado pelo administrador nesta seção. Consulte regularmente para acompanhar atualizações.",
    linkPDF: "",
    infoCards: [
      { titulo: "Dois pagamentos separados", descricao: "Taxa de análise documental (início) e taxa de emissão (após aprovação)" },
      { titulo: "Duas tentativas na prova", descricao: "Candidatos no Caminho B têm direito a uma segunda tentativa sem custo adicional" },
      { titulo: "Banca avaliadora especializada", descricao: "Profissionais experientes avaliam cada candidato individualmente" },
      { titulo: "Certificado digital", descricao: "Emitido eletronicamente e enviado por e-mail após conclusão do processo" },
    ],
  },
  faq: {
    titulo: "Perguntas frequentes",
    items: [
      {
        id: "faq-1",
        pergunta: "Como funciona o processo de certificação?",
        resposta: "O processo é composto por etapas sequenciais: cadastro, envio de documentos, pagamento da taxa de análise documental, validação pela banca avaliadora, avaliação (prova ou entrevista direta, conforme decisão do avaliador), e emissão do certificado após aprovação e pagamento da taxa de emissão.",
      },
      {
        id: "faq-2",
        pergunta: "Quais são os dois pagamentos exigidos?",
        resposta: "O primeiro pagamento é a Taxa de Análise Documental, paga antes da validação dos documentos. O segundo é a Taxa de Emissão do Certificado, cobrada somente após a habilitação final na entrevista. Não há cobrança adicional para a segunda tentativa de prova, caso necessário.",
      },
      {
        id: "faq-3",
        pergunta: "O que acontece se eu reprovar na prova?",
        resposta: "O candidato tem direito a uma segunda tentativa sem custo adicional. Se reprovar na segunda tentativa, o processo é encerrado e o candidato poderá tentar novamente após o período determinado no edital.",
      },
      {
        id: "faq-4",
        pergunta: "O que é o Caminho A e o Caminho B?",
        resposta: "Após a validação documental, o avaliador decide a trilha mais adequada para o candidato. No Caminho A, o candidato vai diretamente para a entrevista. No Caminho B, o candidato precisa comprovar competência por meio de uma prova antes da entrevista.",
      },
      {
        id: "faq-5",
        pergunta: "O certificado é emitido de forma digital?",
        resposta: "Sim. O certificado é gerado digitalmente no sistema e enviado por e-mail ao candidato após a conclusão de todas as etapas e o pagamento da taxa de emissão.",
      },
      {
        id: "faq-6",
        pergunta: "Posso me inscrever em mais de uma certificação?",
        resposta: "Sim, é possível se inscrever em mais de uma certificação, desde que os processos sejam iniciados separadamente e os requisitos de cada uma sejam atendidos.",
      },
    ],
  },
  ctaFinal: {
    titulo: "Pronto para certificar sua excelência?",
    subtitulo: "Escolha sua certificação, envie seus documentos e comprove suas competências. O processo é 100% online e conduzido por uma banca especializada.",
    botaoLabel: "Ver certificações disponíveis",
  },
  rodape: {
    descricaoOrganizacao: "Associação Nacional dos Executivos de Finanças, Administração e Contabilidade.",
    copyright: "ANEFAC — Todos os direitos reservados.",
  },
  aviso: {
    visivel: true,
    texto: "Os cursos de atualização têm finalidade preparatória e de desenvolvimento. A compra ou conclusão de cursos não garante aprovação, habilitação ou emissão da certificação.",
  },
  comoFunciona: {
    titulo: "Como funciona",
    subtitulo: "Sete etapas simples e totalmente online para obter sua certificação profissional.",
    etapas: [
      { label: "Cadastro", descricao: "Preencha seus dados pessoais e profissionais" },
      { label: "Documentos", descricao: "Envie os documentos exigidos pela certificação" },
      { label: "Pagamento 1", descricao: "Taxa de análise documental" },
      { label: "Validação", descricao: "Banca avaliadora analisa seu perfil" },
      { label: "Avaliação", descricao: "Prova ou entrevista (conforme caminho)" },
      { label: "Pagamento 2", descricao: "Taxa de emissão (após aprovação)" },
      { label: "Certificado", descricao: "Emissão digital do seu certificado" },
    ],
  },
};

const STORAGE_KEY = "anefac_site_config_v1";

function loadConfig(): SiteConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_CONFIG;
    const parsed = JSON.parse(saved);
    // Deep merge to ensure new fields added in future updates are included
    return {
      hero: { ...DEFAULT_CONFIG.hero, ...parsed.hero },
      edital: { ...DEFAULT_CONFIG.edital, ...parsed.edital },
      faq: { ...DEFAULT_CONFIG.faq, ...parsed.faq },
      ctaFinal: { ...DEFAULT_CONFIG.ctaFinal, ...parsed.ctaFinal },
      rodape: { ...DEFAULT_CONFIG.rodape, ...parsed.rodape },
      aviso: { ...DEFAULT_CONFIG.aviso, ...parsed.aviso },
      comoFunciona: { ...DEFAULT_CONFIG.comoFunciona, ...parsed.comoFunciona },
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────

interface SiteConfigContextType {
  config: SiteConfig;
  salvarConfig: (config: SiteConfig) => void;
  resetarConfig: () => void;
}

const SiteConfigContext = createContext<SiteConfigContextType | null>(null);

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(loadConfig);

  const salvarConfig = (newConfig: SiteConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const resetarConfig = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <SiteConfigContext.Provider value={{ config, salvarConfig, resetarConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error("useSiteConfig deve ser usado dentro de SiteConfigProvider");
  return ctx;
}

export { DEFAULT_CONFIG };
