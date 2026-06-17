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
    badge: "Programa oficial de certificação profissional",
    titulo: "Certifique sua",
    tituloDestaque: "excelência profissional",
    subtitulo: "Certificações reconhecidas pelo mercado para profissionais que buscam validar suas competências com rigor técnico e credibilidade institucional.",
    ctaPrimario: "Ver certificações disponíveis",
    ctaSecundario: "Como funciona",
    stat1Valor: "4+",
    stat1Label: "certificações disponíveis",
    stat2Valor: "100%",
    stat2Label: "processo online",
    stat3Valor: "2x",
    stat3Label: "pagamentos separados",
  },
  institucional: {
    titulo: "Sobre as Certificações ANEFAC",
    subtitulo: "Certificações reconhecidas pelo mercado financeiro e de controladoria em todo o Brasil, conduzidas por uma banca especializada.",
    cards: [
      {
        titulo: "Reconhecimento nacional",
        texto: "Certificações reconhecidas pelo mercado financeiro e de controladoria em todo o Brasil.",
      },
      {
        titulo: "Avaliação por especialistas",
        texto: "Banca composta por profissionais experientes que avaliam competências técnicas e comportamentais.",
      },
      {
        titulo: "Processo estruturado",
        texto: "Fluxo claro e transparente: cadastro, análise documental, avaliação e emissão do certificado.",
      },
    ],
  },
  comoFunciona: {
    titulo: "Como funciona",
    subtitulo: "Entenda cada etapa do processo de certificação ANEFAC, do cadastro à emissão do seu certificado.",
    etapas: [
      { numero: "01", titulo: "Cadastro", descricao: "Preencha seus dados pessoais e profissionais. Escolha a certificação desejada e inicie o processo." },
      { numero: "02", titulo: "Pagamento 1 — Taxa de Análise", descricao: "Realize o pagamento da taxa de análise documental. Este pagamento cobre toda a fase de avaliação: análise dos documentos, prova (se aplicável) e entrevista técnica.", nota: "Inclui: análise + prova/entrevista" },
      { numero: "03", titulo: "Upload de Documentos", descricao: "Envie os documentos comprobatórios exigidos para a certificação escolhida. Todos os arquivos devem estar legíveis e no formato correto." },
      { numero: "04", titulo: "Validação Documental", descricao: "Sua documentação será avaliada pela banca examinadora. A decisão de liberação para a Certificação Controller ou Controller Plus será publicada no mural do aluno. Você também receberá um e-mail informando a decisão da banca e os próximos passos." },
      { numero: "05", titulo: "Avaliação (Prova ou Entrevista)", descricao: "Dependendo da decisão da banca, você pode seguir diretamente para a entrevista técnica (Caminho A) ou realizar uma prova de competência antes da entrevista (Caminho B).", nota: "Caminho A: direto para entrevista | Caminho B: prova → entrevista" },
      { numero: "06", titulo: "Pagamento 2 — Taxa de Emissão", descricao: "Somente após aprovação final na entrevista, você realiza o pagamento da taxa de emissão do certificado." },
      { numero: "07", titulo: "Emissão do Certificado", descricao: "Seu certificado digital é emitido e enviado por e-mail em até 5 dias úteis após a confirmação do pagamento." },
    ],
    caminhoATitulo: "Caminho A — Direto para entrevista",
    caminhoADescricao: "A banca avalia que seu perfil e documentação são suficientes para ir diretamente à entrevista técnica, sem necessidade de prova escrita.",
    caminhoBTitulo: "Caminho B — Prova + entrevista",
    caminhoBDescricao: "A banca solicita que você realize uma prova de competência antes da entrevista. Você tem direito a 2 tentativas. Após aprovação na prova, segue para a entrevista.",
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
    titulo: "Perguntas frequentes",
    items: [
      { id: "faq-1", pergunta: "Como funciona o processo de certificação?", resposta: "O processo é composto por etapas sequenciais: cadastro, pagamento da taxa de análise, envio de documentos, validação pela banca avaliadora, avaliação (prova ou entrevista direta), e emissão do certificado após aprovação e pagamento da taxa de emissão." },
      { id: "faq-2", pergunta: "Quais são os dois pagamentos exigidos?", resposta: "O primeiro pagamento é a Taxa de Análise Documental, paga antes do upload dos documentos. O segundo é a Taxa de Emissão do Certificado, cobrada somente após a aprovação final na entrevista." },
      { id: "faq-3", pergunta: "O que acontece se eu reprovar na prova?", resposta: "O candidato tem direito a uma segunda tentativa sem custo adicional. Se reprovar na segunda tentativa, o processo é encerrado e o candidato poderá tentar novamente após o período determinado no edital." },
      { id: "faq-4", pergunta: "O que é o Caminho A e o Caminho B?", resposta: "Após a validação documental, o avaliador decide a trilha mais adequada. No Caminho A, o candidato vai diretamente para a entrevista. No Caminho B, o candidato realiza uma prova antes da entrevista." },
      { id: "faq-5", pergunta: "O certificado é emitido de forma digital?", resposta: "Sim. O certificado é gerado digitalmente e enviado por e-mail ao candidato após a conclusão de todas as etapas e o pagamento da taxa de emissão." },
      { id: "faq-6", pergunta: "Posso me inscrever em mais de uma certificação?", resposta: "Sim, é possível se inscrever em mais de uma certificação, desde que os processos sejam iniciados separadamente e os requisitos de cada uma sejam atendidos." },
    ],
  },
  rodape: {
    descricaoOrganizacao: "Associação Nacional dos Executivos de Finanças, Administração e Contabilidade.",
    copyright: "ANEFAC — Todos os direitos reservados.",
  },
  aviso: {
    visivel: true,
    texto: "Os cursos de atualização têm finalidade preparatória e de desenvolvimento. A compra ou conclusão de cursos não garante aprovação, habilitação ou emissão da certificação.",
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
