import React, { createContext, useContext, useState } from "react";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface HeroConfig {
  badge: string;
  titulo: string;
  tituloDestaque: string;
  subtitulo: string;
  ctaPrimario: string;
  ctaSecundario: string;
  stat1Valor: string;
  stat1Label: string;
  stat2Valor: string;
  stat2Label: string;
  stat3Valor: string;
  stat3Label: string;
}

export interface InstitucionalCard {
  titulo: string;
  texto: string;
}

export interface InstitucionalConfig {
  titulo: string;
  subtitulo: string;
  cards: InstitucionalCard[];
}

export interface ComoFuncionaEtapa {
  numero: string;
  titulo: string;
  descricao: string;
  nota?: string;
}

export interface ComoFuncionaConfig {
  titulo: string;
  subtitulo: string;
  etapas: ComoFuncionaEtapa[];
  caminhoATitulo: string;
  caminhoADescricao: string;
  caminhoBTitulo: string;
  caminhoBDescricao: string;
}

export interface SimulacaoQuestao {
  id: number;
  area: string;
  enunciado: string;
  opcoes: string[];
  correta: number;
  explicacao: string;
}

export interface SimulacaoConfig {
  titulo: string;
  subtitulo: string;
  questoes: SimulacaoQuestao[];
  nivelAvancadoMin: number;
  nivelIntermediarioMin: number;
  nivelAvancadoTexto: string;
  nivelIntermediarioTexto: string;
  nivelInicianteTexto: string;
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

export interface RodapeConfig {
  descricaoOrganizacao: string;
  copyright: string;
}

export interface AvisoConfig {
  texto: string;
  visivel: boolean;
}

export interface SiteConfig {
  hero: HeroConfig;
  institucional: InstitucionalConfig;
  comoFunciona: ComoFuncionaConfig;
  simulacao: SimulacaoConfig;
  faq: FAQConfig;
  rodape: RodapeConfig;
  aviso: AvisoConfig;
}

// ─── Valores padrão ────────────────────────────────────────────────────────────

export const DEFAULT_CONFIG: SiteConfig = {
  hero: {
    badge: "Programa de Certificação Profissional ANEFAC",
    titulo: "Certifique sua",
    tituloDestaque: "Excelência Profissional!",
    subtitulo: "Certificações reconhecidas pelo mercado para profissionais que primam pela educação continuada, buscando validar suas competências com rigor técnico e credibilidade institucional.",
    ctaPrimario: "Conheça as Certificações ANEFAC",
    ctaSecundario: "Como funciona",
    stat1Valor: "100%",
    stat1Label: "processo online",
    stat2Valor: "56+",
    stat2Label: "anos de credibilidade",
    stat3Valor: "8",
    stat3Label: "áreas do conhecimento",
  },
  institucional: {
    titulo: "Aprimoramento e Excelência Profissional",
    subtitulo: "A Certificação Profissional da ANEFAC reconhece e dota o profissional de excelência, propiciando transparência, credibilidade e valorização no mercado de trabalho.",
    cards: [
      {
        titulo: "Validação de Mercado",
        texto: "Fornece ao executivo a validação do mercado, potencializando o desenvolvimento de sua carreira profissional e excelência em governança.",
      },
      {
        titulo: "Educação Continuada",
        texto: "Para profissionais que primam pela constante atualização e capacitação com novas tecnologias e conhecimentos necessários à prática.",
      },
      {
        titulo: "Contribuição às Empresas",
        texto: "Possibilita às organizações a identificação do perfil mais adequado às suas necessidades em termos de conhecimento, experiências e habilidades.",
      },
    ],
  },
  comoFunciona: {
    titulo: "Cronograma e Candidatura",
    subtitulo: "Entenda o passo a passo para a sua candidatura e obtenção da Certificação Controller ANEFAC.",
    etapas: [
      { numero: "01", titulo: "Inscrição Contínua", descricao: "As inscrições se dão de modo contínuo e devem ser realizadas única e exclusivamente via plataforma digital. Escolha a modalidade (CCA ou CCA Plus) e inicie." },
      { numero: "02", titulo: "Taxa de Inscrição e Análise", descricao: "O valor do investimento inicial inclui a taxa de inscrição e contempla as despesas do processo seletivo (análise e exame/entrevista). Não há restituição em caso de reprovação.", nota: "Inclui: análise + exame/entrevista" },
      { numero: "03", titulo: "Comprovação Documental", descricao: "Envio de diploma, comprovação de experiência na área de controladoria/gestão e assinatura do Código de Conduta ANEFAC." },
      { numero: "04", titulo: "Análise pelo Comitê", descricao: "A documentação será analisada pelo Comitê de Certificação, formado pelo superintendente, diretor executivo e membros do Conselho de Administração." },
      { numero: "05", titulo: "Exame de Proficiência e Entrevista", descricao: "Dependendo da modalidade, o candidato realizará o exame de proficiência (temas como Contabilidade, Economia, Finanças, Tributário, etc) e a entrevista com o Comitê de Certificação ANEFAC Controller.", nota: "CCA: Exame + Entrevista | CCA Plus: Carta de Recomendação + Entrevista" },
      { numero: "06", titulo: "Taxa de Emissão e Associação", descricao: "No caso de aprovação, o profissional efetua o pagamento do valor devido para obtenção da certificação. Este valor total já contemplará a primeira anuidade de associação à ANEFAC." },
      { numero: "07", titulo: "Recertificação (a cada 3 anos)", descricao: "A recertificação ocorrerá a cada 3 anos, mediante comprovação de 60 pontos em atividades de Educação Continuada e pagamento equivalente a 30% do valor vigente." },
    ],
    caminhoATitulo: "Modalidade CCA Plus",
    caminhoADescricao: "Para profissionais já consolidados (5+ anos) em empresas de grande porte. Exige Carta de Recomendação de 2 executivos e entrevista direta com o Comitê.",
    caminhoBTitulo: "Modalidade CCA",
    caminhoBDescricao: "Para profissionais com experiência em gestão (2+ anos). Exige a realização de exame de proficiência em plataforma digital e posterior entrevista com o Comitê.",
  },
  simulacao: {
    titulo: "Simulação de Conhecimentos",
    subtitulo: "Teste seus conhecimentos gratuitamente e descubra qual certificação é ideal para você.",
    nivelAvancadoMin: 80,
    nivelIntermediarioMin: 60,
    nivelAvancadoTexto: "Você demonstra conhecimento sólido. Considere as certificações de nível mais avançado.",
    nivelIntermediarioTexto: "Você tem uma boa base. Com preparação, está pronto para iniciar o processo de certificação.",
    nivelInicianteTexto: "Recomendamos reforçar seus conhecimentos antes de iniciar o processo de certificação.",
    questoes: [
      {
        id: 1,
        area: "Controladoria",
        enunciado: "O EBITDA é um indicador que representa:",
        opcoes: [
          "Lucro líquido após impostos",
          "Receita bruta total da empresa",
          "Lucro antes de juros, impostos, depreciação e amortização",
          "Fluxo de caixa livre disponível para acionistas",
        ],
        correta: 2,
        explicacao: "EBITDA (Earnings Before Interest, Taxes, Depreciation and Amortization) mede a geração de caixa operacional antes de deduções financeiras e contábeis.",
      },
      {
        id: 2,
        area: "Contabilidade",
        enunciado: "O princípio contábil da Competência determina que:",
        opcoes: [
          "As receitas e despesas são reconhecidas quando do recebimento ou pagamento",
          "As receitas e despesas são reconhecidas no período em que ocorreram, independentemente do fluxo financeiro",
          "Apenas receitas efetivamente recebidas devem ser contabilizadas",
          "Despesas só devem ser reconhecidas após aprovação da diretoria",
        ],
        correta: 1,
        explicacao: "O regime de competência registra receitas e despesas no período em que ocorrem os fatos geradores, independentemente do recebimento ou pagamento.",
      },
      {
        id: 3,
        area: "Análise Financeira",
        enunciado: "O índice de Liquidez Corrente é calculado como:",
        opcoes: [
          "Ativo Total / Passivo Total",
          "Ativo Circulante / Passivo Circulante",
          "Ativo Não Circulante / Passivo Não Circulante",
          "Patrimônio Líquido / Ativo Total",
        ],
        correta: 1,
        explicacao: "A Liquidez Corrente mede a capacidade da empresa de pagar suas obrigações de curto prazo com seus ativos de curto prazo.",
      },
      {
        id: 4,
        area: "Gestão",
        enunciado: "O Balanced Scorecard (BSC) é uma ferramenta que:",
        opcoes: [
          "Controla apenas os indicadores financeiros da empresa",
          "Traduz a estratégia em objetivos e indicadores em quatro perspectivas",
          "Substitui o planejamento estratégico da empresa",
          "É utilizado exclusivamente para gestão de pessoas",
        ],
        correta: 1,
        explicacao: "O BSC equilibra indicadores financeiros e não-financeiros nas perspectivas: financeira, clientes, processos internos e aprendizado/crescimento.",
      },
      {
        id: 5,
        area: "Custos",
        enunciado: "No custeio por absorção:",
        opcoes: [
          "Apenas os custos variáveis são alocados ao produto",
          "Todos os custos de produção (fixos e variáveis) são alocados ao produto",
          "Os custos fixos são tratados como despesas do período",
          "Somente os custos diretos são considerados no custo do produto",
        ],
        correta: 1,
        explicacao: "O custeio por absorção aloca todos os custos de produção ao produto, sendo o método aceito pela legislação fiscal brasileira.",
      },
    ],
  },
  faq: {
    titulo: "Dúvidas Frequentes",
    items: [
      { id: "faq-1", pergunta: "Qual a diferença entre a modalidade CCA e CCA Plus?", resposta: "A CCA é para profissionais com experiência em gestão (2+ anos) e exige a realização de um exame de proficiência. A CCA Plus é para profissionais já consolidados na função de Controller (5+ anos) em empresas de grande porte, não exige exame, mas requer 2 Cartas de Recomendação de executivos de alto escalão." },
      { id: "faq-2", pergunta: "O que contempla o valor do investimento?", resposta: "O valor do investimento inclui a taxa de inscrição e contempla as despesas do processo seletivo. No caso de aprovação, o valor pago para a emissão da certificação já contemplará a primeira anuidade de associação à ANEFAC." },
      { id: "faq-3", pergunta: "Como é o exame de proficiência para a modalidade CCA?", resposta: "O exame é realizado por meio de plataforma digital. Consiste em questões de múltipla escolha e dissertativas sobre temas como Contabilidade, Economia e Finanças, Administração, Tributário, Governança Corporativa, Tecnologia e Capital Humano." },
      { id: "faq-4", pergunta: "Existe reembolso caso eu não seja aprovado?", resposta: "Não. Conforme o regulamento, não haverá restituição da taxa de inscrição caso o candidato não seja aprovado no Programa de Certificação." },
      { id: "faq-5", pergunta: "Como funciona a recertificação?", resposta: "A recertificação ocorrerá a cada 3 anos. É necessário comprovar o cumprimento de 60 pontos em atividades de Educação Continuada e efetuar o pagamento equivalente a 30% do valor da certificação vigente na data." },
      { id: "faq-6", pergunta: "A ANEFAC disponibiliza material de estudo para o exame?", resposta: "Não há indicação de bibliografia básica obrigatória, porém a ANEFAC entrega uma Orientação de Estudos aos candidatos inscritos." },
    ],
  },
  rodape: {
    descricaoOrganizacao: "Associação Nacional dos Executivos de Finanças, Administração e Contabilidade. Mais de 56 anos de credibilidade e aprimoramento profissional.",
    copyright: "ANEFAC — Todos os direitos reservados.",
  },
  aviso: {
    visivel: true,
    texto: "Ao se candidatar, o profissional afirma que leu e está de acordo com o Código de Conduta da ANEFAC e o Regulamento do Programa de Certificação Profissional.",
  },
};

const STORAGE_KEY = "anefac_site_config_v2";

function loadConfig(): SiteConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_CONFIG;
    const parsed = JSON.parse(saved);
    return {
      hero: { ...DEFAULT_CONFIG.hero, ...parsed.hero },
      institucional: { ...DEFAULT_CONFIG.institucional, ...parsed.institucional },
      comoFunciona: { ...DEFAULT_CONFIG.comoFunciona, ...parsed.comoFunciona },
      simulacao: { ...DEFAULT_CONFIG.simulacao, ...parsed.simulacao },
      faq: { ...DEFAULT_CONFIG.faq, ...parsed.faq },
      rodape: { ...DEFAULT_CONFIG.rodape, ...parsed.rodape },
      aviso: { ...DEFAULT_CONFIG.aviso, ...parsed.aviso },
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
