import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export type CertificationStatus = "ativa" | "em_breve" | "inativa" | "encerrada";
export type CaminhoAvaliacao = "A" | "B" | null;
export type TipoCompra = "cert_cursos" | "cert_direta" | "apenas_cursos" | null;

/**
 * Estrutura do conteúdo "Como funciona" de cada certificação.
 * Totalmente gerenciado pelo administrador via painel.
 */
export interface ComoFuncionaEtapa {
  numero: string;   // ex: "01", "02"
  titulo: string;
  descricao: string;
  nota?: string;    // caixa de destaque opcional abaixo da descrição
}

export interface ComoFuncionaContent {
  titulo: string;
  subtitulo: string;
  etapas: ComoFuncionaEtapa[];
  // Campos extras livres (investimento, inclusoes, observacoes etc.)
  investimento?: string;
  inclusoes?: string;
  observacoes?: string;
}

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
  /** Conteúdo da página "Como funciona" — editável pelo admin */
  comoFunciona?: ComoFuncionaContent;
  // Conteúdo do edital
  edital?: {
    dataAbertura?: string;
    dataEncerramento?: string;
    linkPDF?: string;
    observacoes?: string;
  };
}

// ─── Dados iniciais (placeholder — admin substitui pelo painel) ─────────────────

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
    comoFunciona: {
      titulo: "Como funciona a Certificação CCA",
      subtitulo: "Conheça as etapas do processo de certificação Controller ANEFAC e saiba o que esperar em cada fase.",
      etapas: [
        {
          numero: "01",
          titulo: "Inscrição e Cadastro",
          descricao: "O candidato realiza a inscrição online, preenche seus dados pessoais e profissionais e seleciona a certificação CCA.",
        },
        {
          numero: "02",
          titulo: "Envio de Documentos",
          descricao: "Upload dos documentos exigidos: diploma de graduação, declaração de experiência e assinatura do Código de Conduta ANEFAC.",
        },
        {
          numero: "03",
          titulo: "Pagamento da Taxa de Análise e Avaliação",
          descricao: "Pagamento da taxa de análise e avaliação documental (R$ 350,00), que cobre todo o processo de avaliação até a entrevista.",
        },
        {
          numero: "04",
          titulo: "Resultado da Análise Documental",
          descricao: "O Comitê de Certificação ANEFAC analisa os documentos enviados em até 10 dias úteis e notifica o candidato sobre o resultado com uma das duas opções abaixo:",
          nota: "Opção 01 — CCA Plus: O candidato que comprova os requisitos de 5 anos de experiência em empresa de grande porte e apresenta as 2 cartas de recomendação é convocado diretamente para entrevista com o Comitê de Certificação ANEFAC.\n\nOpção 02 — CCA: O candidato que ainda não atende aos requisitos da modalidade Plus é direcionado para o exame de proficiência em conhecimento técnico (aplicado pela ANEFAC e FUCAPE), antes de seguir para a entrevista.",
        },
        {
          numero: "05",
          titulo: "Entrevista com o Comitê",
          descricao: "Entrevista técnica e comportamental conduzida por membros do Comitê de Certificação ANEFAC para validação das competências.",
        },
        {
          numero: "06",
          titulo: "Taxa de Emissão do Certificado",
          descricao: "Após aprovação na entrevista, o candidato realiza o pagamento da taxa de emissão do certificado (R$ 250,00) e recebe o certificado CCA.",
        },
      ],
      investimento: "Taxa de análise e avaliação: R$ 350,00 | Taxa de emissão do certificado: R$ 250,00 (paga somente após aprovação)",
      observacoes: "O processo completo leva em média 30 a 60 dias, dependendo da disponibilidade para entrevista e da análise documental.",
    },
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
    comoFunciona: {
      titulo: "Como funciona a Certificação CCA Plus",
      subtitulo: "O processo CCA Plus é voltado a Controllers consolidados e exige comprovação de trajetória de alto nível.",
      etapas: [
        {
          numero: "01",
          titulo: "Inscrição e Cadastro",
          descricao: "O candidato realiza a inscrição online, preenche seus dados profissionais e seleciona a certificação CCA Plus.",
        },
        {
          numero: "02",
          titulo: "Envio de Documentos",
          descricao: "Upload dos documentos exigidos: diploma, declaração de 5 anos de experiência, 2 cartas de recomendação de executivos e Código de Conduta ANEFAC assinado.",
        },
        {
          numero: "03",
          titulo: "Pagamento da Taxa de Análise e Avaliação",
          descricao: "Pagamento da taxa de análise e avaliação documental (R$ 450,00), que cobre todo o processo de avaliação.",
        },
        {
          numero: "04",
          titulo: "Análise Documental",
          descricao: "O Comitê de Certificação ANEFAC analisa os documentos enviados em até 10 dias úteis. Por se tratar do nível Plus, o processo segue diretamente para entrevista (Caminho A).",
          nota: "Caminho A: candidatos aprovados na análise documental são convocados diretamente para entrevista.",
        },
        {
          numero: "05",
          titulo: "Entrevista com o Comitê",
          descricao: "Entrevista aprofundada com membros seniores do Comitê de Certificação ANEFAC, com foco em trajetória, decisões estratégicas e governança.",
        },
        {
          numero: "06",
          titulo: "Taxa de Emissão do Certificado",
          descricao: "Após aprovação, o candidato realiza o pagamento da taxa de emissão do certificado (R$ 350,00) e recebe o certificado CCA Plus.",
        },
      ],
      investimento: "Taxa de análise e avaliação: R$ 450,00 | Taxa de emissão do certificado: R$ 350,00 (paga somente após aprovação)",
      observacoes: "O processo completo leva em média 30 a 60 dias. Candidatos CCA Plus seguem o Caminho A (entrevista direta, sem prova).",
    },
  },

  // ── Certificações de Liderança EcodoBem ──────────────────────────────────────
  {
    id: "ecodobem-lideranca-n1",
    numero: 3,
    nome: "Certificação de Liderança EcodoBem – Nível 1",
    subtitulo: "Fundamentos da Liderança",
    descricao:
      "Certificação voltada à validação das competências fundamentais para profissionais que estão iniciando sua jornada de liderança ou se preparando para assumir responsabilidades de condução de pessoas, atividades ou pequenos projetos. Este nível reconhece a importância das bases tradicionais da boa liderança: disciplina, escuta, atenção, responsabilidade pessoal e capacidade de compreender a si mesmo antes de liderar os outros.",
    descricaoBreve: "Competências básicas para liderar a si mesmo e preparar-se para liderar pessoas. Formação obrigatória de 6 meses + prova final.",
    publicoAlvo: "Profissionais em desenvolvimento, potenciais líderes, sucessores, analistas, especialistas, jovens talentos e colaboradores indicados para futuras posições de liderança.",
    competencias: [
      "Atenção",
      "Autopercepção",
      "Disciplina",
      "Empatia",
      "Escuta Ativa",
      "Gestão de Tempo",
      "Memória",
      "Raciocínio Lógico e Espacial"
    ],
    preRequisitos: [
      "Realizar entrevista diagnóstica inicial (análise de perfil, experiência profissional e maturidade comportamental)",
      "Ter o nível de ingresso definido pela equipe responsável com base na entrevista",
      "Concluir obrigatoriamente a formação de 6 meses correspondente ao nível indicado",
      "Realizar as atividades e avaliações previstas durante a jornada",
      "Desenvolver os projetos práticos e atingir a pontuação mínima na prova final de certificação"
    ],
    documentosExigidos: [
      "Documentos pessoais (RG/CPF)",
      "Comprovante de vínculo profissional ou histórico de experiência"
    ],
    cursos: [
      "Aulas de desenvolvimento correspondentes ao Nível 1",
      "Webinares ao vivo",
      "Avaliações por conteúdo",
      "Mentoria de desenvolvimento",
      "Projetos práticos",
      "Acompanhamento da evolução",
      "Preparação para a prova final de certificação"
    ],
    taxaAnalise: 0,
    taxaEmissao: 250,
    caminhoDefault: null,
    status: "ativa",
    cor: "blue",
    comoFunciona: {
      titulo: "Como funciona a Certificação de Liderança EcodoBem – Nível 1",
      subtitulo: "Conheça a jornada formativa do Nível 1 — Fundamentos da Liderança — e entenda cada etapa do processo.",
      etapas: [
        {
          numero: "01",
          titulo: "Inscrição e Entrevista Diagnóstica",
          descricao: "O candidato realiza a inscrição e passa por uma entrevista diagnóstica inicial para análise de perfil, experiência profissional e maturidade comportamental. A equipe define o nível de ingresso adequado.",
        },
        {
          numero: "02",
          titulo: "Início da Formação (6 meses)",
          descricao: "O participante inicia a jornada formativa obrigatória de 6 meses correspondente ao Nível 1. A formação inclui aulas de desenvolvimento, webinares ao vivo, avaliações por conteúdo, mentoria e projetos práticos.",
          nota: "A formação de 6 meses é obrigatória para todos os participantes, independentemente do nível indicado na entrevista.",
        },
        {
          numero: "03",
          titulo: "Atividades e Avaliações",
          descricao: "Durante a jornada, o participante realiza atividades práticas, avaliações por conteúdo e projetos aplicados ao seu contexto profissional, com acompanhamento contínuo da evolução.",
        },
        {
          numero: "04",
          titulo: "Mentoria de Desenvolvimento",
          descricao: "Sessões de mentoria individual ou em grupo para apoiar o desenvolvimento das competências do Nível 1 e preparar o participante para a prova final.",
        },
        {
          numero: "05",
          titulo: "Prova Final de Certificação",
          descricao: "Após a conclusão da jornada formativa, o participante realiza a prova final de certificação. A prova somente pode ser realizada após a conclusão dos 6 meses de formação.",
        },
        {
          numero: "06",
          titulo: "Emissão do Certificado",
          descricao: "Atingida a pontuação mínima na prova final, o participante recebe o Certificado de Liderança EcodoBem – Nível 1.",
        },
      ],
      investimento: "6 parcelas de R$ 250,00 (Total: R$ 1.500,00)",
      inclusoes: "Aulas de desenvolvimento · Webinares ao vivo · Avaliações por conteúdo · Mentoria de desenvolvimento · Projetos práticos · Acompanhamento da evolução · Preparação para a prova final",
      observacoes: "A entrevista inicial define o nível de ingresso, mas não dispensa o participante da formação. A prova final somente pode ser realizada após a conclusão da jornada formativa.",
    },
  },
  {
    id: "ecodobem-lideranca-n2",
    numero: 4,
    nome: "Certificação de Liderança EcodoBem – Nível 2",
    subtitulo: "Liderança Essencial",
    descricao:
      "Certificação destinada a profissionais que já demonstram maior prontidão para lidar com desafios de liderança, organização de rotinas, comunicação com equipes, adaptação a mudanças e entrega de resultados com equilíbrio emocional. Este nível reconhece o líder que começa a sair da execução individual para assumir uma atuação mais orientada à influência, à organização coletiva e ao acompanhamento de pessoas.",
    descricaoBreve: "Competências essenciais para condução de pessoas, rotinas e entregas. Formação obrigatória de 6 meses + prova final.",
    publicoAlvo: "Líderes iniciantes, supervisores, coordenadores em desenvolvimento, sucessores, profissionais que conduzem projetos ou responsáveis por pequenas equipes.",
    competencias: [
      "Adaptabilidade",
      "Leitura de Cenário",
      "Planejamento e Organização",
      "Comunicação Assertiva",
      "Inteligência Emocional",
      "Resiliência",
      "Proatividade"
    ],
    preRequisitos: [
      "Realizar entrevista diagnóstica inicial (análise de experiência, repertório profissional e capacidade de condução de pessoas)",
      "Ter o nível de ingresso definido pela equipe responsável com base na entrevista",
      "Concluir obrigatoriamente a formação de 6 meses correspondente ao nível indicado",
      "Realizar as atividades e avaliações previstas durante a jornada",
      "Desenvolver os projetos práticos e atingir a pontuação mínima na prova final de certificação"
    ],
    documentosExigidos: [
      "Documentos pessoais (RG/CPF)",
      "Comprovante de vínculo profissional ou histórico de experiência em liderança"
    ],
    cursos: [
      "Aulas de desenvolvimento correspondentes ao Nível 2",
      "Webinares ao vivo",
      "Avaliações por conteúdo",
      "Mentoria de desenvolvimento",
      "Projetos práticos",
      "Acompanhamento da evolução",
      "Preparação para a prova final de certificação"
    ],
    taxaAnalise: 0,
    taxaEmissao: 250,
    caminhoDefault: null,
    status: "ativa",
    cor: "green",
    comoFunciona: {
      titulo: "Como funciona a Certificação de Liderança EcodoBem – Nível 2",
      subtitulo: "Conheça a jornada formativa do Nível 2 — Liderança Essencial — e entenda cada etapa do processo.",
      etapas: [
        {
          numero: "01",
          titulo: "Inscrição e Entrevista Diagnóstica",
          descricao: "O candidato realiza a inscrição e passa por uma entrevista diagnóstica para análise de experiência, repertório profissional e capacidade de condução de pessoas. A equipe define o nível de ingresso.",
        },
        {
          numero: "02",
          titulo: "Início da Formação (6 meses)",
          descricao: "O participante inicia a jornada formativa obrigatória de 6 meses do Nível 2, com foco em liderança essencial: comunicação, organização coletiva, adaptabilidade e entrega de resultados.",
          nota: "A formação de 6 meses é obrigatória para todos os participantes, independentemente do nível indicado na entrevista.",
        },
        {
          numero: "03",
          titulo: "Atividades e Avaliações",
          descricao: "Atividades práticas, avaliações por conteúdo e projetos aplicados ao contexto profissional do participante, com acompanhamento contínuo da evolução.",
        },
        {
          numero: "04",
          titulo: "Mentoria de Desenvolvimento",
          descricao: "Sessões de mentoria para apoiar o desenvolvimento das competências do Nível 2 e preparar o participante para a prova final.",
        },
        {
          numero: "05",
          titulo: "Prova Final de Certificação",
          descricao: "Após a conclusão da jornada formativa, o participante realiza a prova final. A prova somente pode ser realizada após os 6 meses de formação.",
        },
        {
          numero: "06",
          titulo: "Emissão do Certificado",
          descricao: "Atingida a pontuação mínima, o participante recebe o Certificado de Liderança EcodoBem – Nível 2.",
        },
      ],
      investimento: "6 parcelas de R$ 250,00 (Total: R$ 1.500,00)",
      inclusoes: "Aulas de desenvolvimento · Webinares ao vivo · Avaliações por conteúdo · Mentoria de desenvolvimento · Projetos práticos · Acompanhamento da evolução · Preparação para a prova final",
      observacoes: "A entrevista inicial define o nível de ingresso, mas não dispensa o participante da formação.",
    },
  },
  {
    id: "ecodobem-lideranca-n3",
    numero: 5,
    nome: "Certificação de Liderança EcodoBem – Nível 3",
    subtitulo: "Liderança Master",
    descricao:
      "Certificação voltada a líderes que já exercem papel efetivo de gestão e precisam demonstrar maturidade na condução de pessoas, resolução de conflitos, influência, negociação, tomada de decisão e entrega de resultados. Este nível reconhece a liderança que já atua com maior responsabilidade sobre equipes, metas, processos e relações organizacionais.",
    descricaoBreve: "Gestão de pessoas, resultados e relações organizacionais para líderes experientes. Formação obrigatória de 6 meses + prova final.",
    publicoAlvo: "Gestores, coordenadores, supervisores experientes, gerentes, líderes de equipe e profissionais que respondem por metas, pessoas, indicadores ou projetos estratégicos.",
    competencias: [
      "Accountability",
      "Foco em Resultados",
      "Gestão de Conflitos",
      "Gestão de Equipes",
      "Gestão de Pessoas",
      "Influência",
      "Negociação",
      "Presença Executiva",
      "Protagonismo",
      "Relacionamentos Conectivos",
      "Responsabilidade Social",
      "Tomada de Decisão",
      "Visão Estratégica"
    ],
    preRequisitos: [
      "Realizar entrevista diagnóstica inicial (análise de trajetória, experiência em liderança e repertório comportamental)",
      "Ter o nível de ingresso definido pela equipe responsável com base na entrevista",
      "Concluir obrigatoriamente a formação de 6 meses correspondente ao nível indicado",
      "Realizar as atividades e avaliações previstas durante a jornada",
      "Desenvolver os projetos práticos e atingir a pontuação mínima na prova final de certificação"
    ],
    documentosExigidos: [
      "Documentos pessoais (RG/CPF)",
      "Comprovante de experiência formal ou informal em gestão de pessoas"
    ],
    cursos: [
      "Aulas de desenvolvimento correspondentes ao Nível 3",
      "Webinares ao vivo",
      "Avaliações por conteúdo",
      "Mentoria de desenvolvimento",
      "Projetos práticos",
      "Acompanhamento da evolução",
      "Preparação para a prova final de certificação"
    ],
    taxaAnalise: 0,
    taxaEmissao: 250,
    caminhoDefault: null,
    status: "ativa",
    cor: "orange",
    comoFunciona: {
      titulo: "Como funciona a Certificação de Liderança EcodoBem – Nível 3",
      subtitulo: "Conheça a jornada formativa do Nível 3 — Liderança Master — e entenda cada etapa do processo.",
      etapas: [
        {
          numero: "01",
          titulo: "Inscrição e Entrevista Diagnóstica",
          descricao: "O candidato realiza a inscrição e passa por entrevista diagnóstica com análise de trajetória, experiência em liderança e repertório comportamental. A equipe define o nível de ingresso.",
        },
        {
          numero: "02",
          titulo: "Início da Formação (6 meses)",
          descricao: "O participante inicia a jornada formativa obrigatória de 6 meses do Nível 3, com foco em gestão de pessoas, resolução de conflitos, influência, negociação e entrega de resultados.",
          nota: "A formação de 6 meses é obrigatória para todos os participantes.",
        },
        {
          numero: "03",
          titulo: "Atividades e Avaliações",
          descricao: "Atividades práticas, avaliações por conteúdo e projetos aplicados à gestão de equipes e resultados, com acompanhamento contínuo.",
        },
        {
          numero: "04",
          titulo: "Mentoria de Desenvolvimento",
          descricao: "Sessões de mentoria para apoiar o desenvolvimento das competências do Nível 3 e preparar o participante para a prova final.",
        },
        {
          numero: "05",
          titulo: "Prova Final de Certificação",
          descricao: "Após a conclusão da jornada formativa, o participante realiza a prova final. A prova somente pode ser realizada após os 6 meses de formação.",
        },
        {
          numero: "06",
          titulo: "Emissão do Certificado",
          descricao: "Atingida a pontuação mínima, o participante recebe o Certificado de Liderança EcodoBem – Nível 3.",
        },
      ],
      investimento: "6 parcelas de R$ 250,00 (Total: R$ 1.500,00)",
      inclusoes: "Aulas de desenvolvimento · Webinares ao vivo · Avaliações por conteúdo · Mentoria de desenvolvimento · Projetos práticos · Acompanhamento da evolução · Preparação para a prova final",
      observacoes: "A entrevista inicial define o nível de ingresso, mas não dispensa o participante da formação.",
    },
  },
  {
    id: "ecodobem-lideranca-n4",
    numero: 6,
    nome: "Certificação de Liderança EcodoBem – Nível 4",
    subtitulo: "Liderança Estratégica do Futuro",
    descricao:
      "Certificação avançada destinada a líderes que atuam ou se preparam para atuar em posições de maior complexidade, com responsabilidade sobre decisões estratégicas, leitura de cenários, transformação organizacional, gestão de mudanças e construção de futuro. Este nível reconhece líderes capazes de unir experiência, visão sistêmica, responsabilidade institucional e capacidade de preparar pessoas e organizações para novos desafios.",
    descricaoBreve: "Competências do futuro para transformação, sustentabilidade e alta liderança. Formação obrigatória de 6 meses + prova final.",
    publicoAlvo: "Gerentes, executivos, líderes estratégicos, sucessores de alta responsabilidade e profissionais em preparação para posições de direção ou transformação organizacional.",
    competencias: [
      "Mindset Visionário",
      "Arquitetura de Mudanças",
      "Radar de Cenários",
      "Mentalidade Sistêmica",
      "Estratégia de Longo Alcance",
      "Adaptabilidade Dinâmica",
      "Decisões Ágeis",
      "Gestão da Comunicação",
      "Inteligência Emocional Tática"
    ],
    preRequisitos: [
      "Realizar entrevista diagnóstica inicial (análise de experiência em liderança, visão estratégica e atuação em cenários complexos)",
      "Ter o nível de ingresso definido pela equipe responsável com base na entrevista",
      "Concluir obrigatoriamente a formação de 6 meses correspondente ao nível indicado",
      "Realizar as atividades e avaliações previstas durante a jornada",
      "Desenvolver os projetos práticos e atingir a pontuação mínima na prova final de certificação"
    ],
    documentosExigidos: [
      "Documentos pessoais (RG/CPF)",
      "Histórico profissional demonstrando atuação estratégica ou em posições de alta responsabilidade"
    ],
    cursos: [
      "Aulas de desenvolvimento correspondentes ao Nível 4",
      "Webinares ao vivo",
      "Avaliações por conteúdo",
      "Mentoria de desenvolvimento",
      "Projetos práticos",
      "Acompanhamento da evolução",
      "Preparação para a prova final de certificação"
    ],
    taxaAnalise: 0,
    taxaEmissao: 250,
    caminhoDefault: null,
    status: "ativa",
    cor: "purple",
    comoFunciona: {
      titulo: "Como funciona a Certificação de Liderança EcodoBem – Nível 4",
      subtitulo: "Conheça a jornada formativa do Nível 4 — Liderança Estratégica do Futuro — e entenda cada etapa do processo.",
      etapas: [
        {
          numero: "01",
          titulo: "Inscrição e Entrevista Diagnóstica",
          descricao: "O candidato realiza a inscrição e passa por entrevista diagnóstica com análise de experiência em liderança estratégica, visão sistêmica e atuação em cenários complexos.",
        },
        {
          numero: "02",
          titulo: "Início da Formação (6 meses)",
          descricao: "O participante inicia a jornada formativa obrigatória de 6 meses do Nível 4, com foco em transformação organizacional, decisões estratégicas, gestão de mudanças e construção de futuro.",
          nota: "A formação de 6 meses é obrigatória para todos os participantes.",
        },
        {
          numero: "03",
          titulo: "Atividades e Avaliações",
          descricao: "Atividades práticas, avaliações por conteúdo e projetos de alto impacto estratégico, com acompanhamento contínuo.",
        },
        {
          numero: "04",
          titulo: "Mentoria de Desenvolvimento",
          descricao: "Sessões de mentoria para apoiar o desenvolvimento das competências do Nível 4 e preparar o participante para a prova final.",
        },
        {
          numero: "05",
          titulo: "Prova Final de Certificação",
          descricao: "Após a conclusão da jornada formativa, o participante realiza a prova final. A prova somente pode ser realizada após os 6 meses de formação.",
        },
        {
          numero: "06",
          titulo: "Emissão do Certificado",
          descricao: "Atingida a pontuação mínima, o participante recebe o Certificado de Liderança EcodoBem – Nível 4.",
        },
      ],
      investimento: "6 parcelas de R$ 250,00 (Total: R$ 1.500,00)",
      inclusoes: "Aulas de desenvolvimento · Webinares ao vivo · Avaliações por conteúdo · Mentoria de desenvolvimento · Projetos práticos · Acompanhamento da evolução · Preparação para a prova final",
      observacoes: "A entrevista inicial define o nível de ingresso, mas não dispensa o participante da formação.",
    },
  },
];

const STORAGE_KEY_CERTS = "anefac_certifications_v8";

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

  // Persiste no localStorage (cache local) e sincroniza com o banco
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROCESSO, JSON.stringify(processo));

    // Sincroniza com o banco se o candidato está autenticado e tem certificação selecionada
    const token = localStorage.getItem("anefac_token");
    if (token && processo.certificacaoId && processo.statusGeral !== "selecao") {
      api.processo.sincronizar(processo).then((res: any) => {
        if (res?.processo_id) {
          localStorage.setItem("anefac_processo_id", String(res.processo_id));
        }
      }).catch((err: any) => {
        console.warn("Sync processo:", err.message);
      });
    }
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
