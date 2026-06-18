import React, { createContext, useContext, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MembroComite {
  id: string;
  nome: string;
  cargo: string;
  miniCurriculo: string;
  fotoUrl: string;
  linkedin: string;
}

export interface DocumentoInstitucional {
  titulo: string;
  conteudo: string; // texto completo (markdown/plain)
  urlExterna?: string; // link externo opcional (PDF, etc.)
}

export interface InstitucionalConfig {
  comite: MembroComite[];
  regulamento: DocumentoInstitucional;
  edital: DocumentoInstitucional;
  codigoConduta: DocumentoInstitucional;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_COMITE: MembroComite[] = [
  {
    id: "boli-rosales",
    nome: "Bolí Rosales",
    cargo: "COO – Superintendente ANEFAC",
    miniCurriculo: "Superintendente da ANEFAC e membro do Comitê de Certificação Controller ANEFAC. Responsável pelas operações e pela condução do processo de certificação.",
    fotoUrl: "",
    linkedin: "https://www.linkedin.com/in/bol%C3%AD-rosales-86a03b20/",
  },
  {
    id: "marta-pelucio",
    nome: "Marta Pelucio",
    cargo: "Presidente Nacional – ANEFAC",
    miniCurriculo: "Presidente Nacional da ANEFAC e coordenadora do Comitê Técnico de Certificação. Referência em governança corporativa e desenvolvimento profissional.",
    fotoUrl: "",
    linkedin: "https://www.linkedin.com/in/marta-pelucio-5786a87/",
  },
  {
    id: "emerson-dias",
    nome: "Emerson Dias",
    cargo: "Head de Diversidade & Inclusão – ANEFAC",
    miniCurriculo: "Head de Diversidade e Inclusão da ANEFAC. Atua na promoção de um ambiente profissional mais equitativo e representativo.",
    fotoUrl: "",
    linkedin: "https://www.linkedin.com/in/emersonwdias/",
  },
  {
    id: "talles-brugni",
    nome: "Talles Brugni",
    cargo: "Associate Professor – Fucape Business School",
    miniCurriculo: "Professor associado da Fucape Business School, com pesquisas nas áreas de contabilidade, finanças e governança corporativa.",
    fotoUrl: "",
    linkedin: "https://www.linkedin.com/in/tbrugni/",
  },
  {
    id: "roberto-duarte",
    nome: "Roberto Nunes Duarte",
    cargo: "Diretor de Controladoria – ANEFAC",
    miniCurriculo: "Diretor de Controladoria da ANEFAC. Especialista em gestão financeira e controladoria com ampla experiência em empresas de grande porte.",
    fotoUrl: "",
    linkedin: "https://www.linkedin.com/in/robertoduarte2003/",
  },
  {
    id: "valcemiro-nossa",
    nome: "Valcemiro Nossa",
    cargo: "CEO – Fucape Business School",
    miniCurriculo: "CEO da Fucape Business School. Doutor em Contabilidade, com vasta experiência acadêmica e executiva nas áreas de finanças e contabilidade.",
    fotoUrl: "",
    linkedin: "https://www.linkedin.com/in/valcemiro-nossa-1b97b519/",
  },
];

const DEFAULT_REGULAMENTO: DocumentoInstitucional = {
  titulo: "Regulamento Geral do Programa de Certificação Profissional ANEFAC",
  conteudo: `**TÍTULO I — DAS DISPOSIÇÕES PRELIMINARES**

**ART. 1º** Este Regulamento estabelece a finalidade e a organização conceitual e operacional do Programa de Certificação Profissional da Associação Nacional dos Executivos de Finanças, Administração e Contabilidade (ANEFAC).

**ART. 2º** Este Regulamento integra o sistema de regulamentações ANEFAC.

**ART. 3º** O Programa de Certificação Profissional da ANEFAC é uma evolução natural de suas ações, e encontra-se em linha com sua Missão, Visão e Valores, notadamente no que tange ao Aprimoramento Profissional, e apoiado em suas 8 (oito) áreas do conhecimento: Administração, Capital Humano, Governança Corporativa, Tecnologia, Finanças, Economia, Contabilidade e Tributos.

---

**TÍTULO II — DO PROGRAMA DE CERTIFICAÇÃO PROFISSIONAL ANEFAC: NATUREZA E FINALIDADE**

**ART. 4º** O Programa de Certificação Profissional da ANEFAC estabelece um conjunto de atributos que reconhece e visa dotar o profissional com certa homogeneidade de excelência, de forma a propiciar transparência, credibilidade e sua valorização no mercado de trabalho.

**ART. 5º** O Programa de Certificação Profissional da ANEFAC visa certificar profissionais que primam pela educação continuada e que buscam se aperfeiçoar por meio do estudo e da dedicação, de forma a alcançar o nível mais avançado de capacitação através de certificações.

**ART. 6º** O Programa de Certificação Profissional da ANEFAC tem por finalidade contribuir para a formação continuada e valorização do profissional e para as empresas.

**Parágrafo Único:** A valorização do profissional se dá por meio da excelência profissional, via constante atualização e capacitação com novas tecnologias e conhecimentos necessários à prática profissional. A contribuição às empresas se dá por meio da disposição de profissionais qualificados, possibilitando a identificação do perfil mais adequado às suas necessidades, em termos de conhecimento, experiências e habilidades.

---

**TÍTULO III — DA ORGANIZAÇÃO CONCEITUAL**

**ART. 7º** A Certificação Profissional da ANEFAC inicia-se por meio da Certificação Profissional do tipo Certificação Controller ANEFAC (CCA) nas categorias:
- I – Certificação Controller ANEFAC
- II – Certificação Controller ANEFAC Plus

**ART. 8º** A Certificação Controller ANEFAC (CCA) visa certificar profissionais da área de controladoria que primam pela educação continuada e que buscam se aperfeiçoar por meio do estudo e da dedicação, de forma a alcançar o nível mais avançado de capacitação através de certificações.

**§ 1º** Entende-se a Controladoria como a área ou função da organização que tem como finalidade identificar, mensurar, avaliar e comunicar as informações necessárias para o planejamento, execução e controle das ações das áreas operacionais e estratégicas, com o objetivo de criar valor para a instituição.

**§ 2º** A ANEFAC poderá criar outros tipos de certificações profissionais dentro do Programa de Certificação Profissional da ANEFAC.

---

**Seção I — Da Modalidade CCA**

**ART. 9º** A Certificação Controller ANEFAC CCA visa certificar profissionais que já possuem experiência em gestão, e que busquem se consolidar na função de Controller.

**ART. 10º** O Profissional que almeja a certificação na Modalidade CCA deverá:
- I – Possuir graduação em IES reconhecida pelo MEC, preferencialmente em Administração, Contabilidade ou Economia;
- II – Possuir diploma ou certificados em cursos stricto/lato sensu na área administrativo-financeira, no caso de não possuir graduação nas áreas mencionadas;
- III – Possuir experiência em gestão por, pelo menos, 2 (dois) anos;
- IV – Prestar exame de proficiência em conhecimento técnico e específico realizado pela ANEFAC;
- V – Realizar entrevista;
- VI – Manter-se associado da ANEFAC;
- VII – Assinar Código de Conduta ANEFAC.

---

**Seção III — Da Modalidade CCA PLUS**

**ART. 11º** A Certificação Controller ANEFAC CCA-plus visa certificar profissionais que já atuam, consolidados, na função de Controller.

**ART. 12º** O Profissional que almeja a certificação na Modalidade CCA PLUS deverá:
- I – Possuir graduação em IES reconhecida pelo MEC;
- II – Possuir diploma ou certificados em cursos stricto/lato sensu na área administrativo-financeira;
- III – Possuir experiência na área de controladoria por, pelo menos, 5 (cinco) anos em empresa de grande porte;
- IV – Apresentar Carta de Recomendação assinada por 2 (dois) executivos de alto escalão;
- V – Realizar entrevista;
- VI – Manter-se associado da ANEFAC;
- VII – Assinar Código de Conduta ANEFAC.

---

**TÍTULO IV — DA RECERTIFICAÇÃO**

**ART. 13º** A recertificação ocorrerá a cada 3 (três) anos, por meio da comprovação do cumprimento de 60 (sessenta) pontos em atividades de Educação Continuada.

**ART. 14º** As atividades que serão pontuadas constarão em regulamento próprio da ANEFAC.

---

**TÍTULO V — DA OPERACIONALIZAÇÃO: CANDIDATURA**

**ART. 15º** A candidatura será realizada mediante atendimento ao Edital divulgado no sítio eletrônico da ANEFAC, em processo contínuo.

**ART. 16º** O valor do investimento inclui a taxa de inscrição, contemplando as despesas do processo seletivo, atualizado anualmente.

**§ 1º** O candidato terá gratuidade no primeiro ano de associação.

**§ 2º** Não haverá restituição da taxa de inscrição, caso o candidato não seja aprovado no Programa de Certificação.

---

**TÍTULO VI — DA APROVAÇÃO DO CANDIDATO**

**ART. 17º** A análise da documentação para aprovação de candidatos será realizada por comitê próprio, formado pelo superintendente da ANEFAC, pelo(a) diretor(a) executivo(a) da certificação e por, pelo menos, dois membros do Conselho de Administração da ANEFAC.

---

**TÍTULO VII — DA OBTENÇÃO DA CERTIFICAÇÃO**

**ART. 18º** Uma vez aprovado, o profissional deverá efetuar o pagamento do valor devido, conforme Edital e diferenciado em função da categoria obtida.

---

São Paulo, 29 de setembro de 2021.

*Marta Cristina Pelucio Grecco — Presidente Nacional – ANEFAC*
*Antonio Carlos Machado — Presidente – Conselho de Administração*`,
};

const DEFAULT_EDITAL: DocumentoInstitucional = {
  titulo: "Edital de Candidatura para Certificação Controller ANEFAC",
  conteudo: `**Processo contínuo**

**1.** Este Edital aplica-se ao processo de avaliação das candidaturas à Certificação ANEFAC Controller, nas categorias I – Certificação Controller ANEFAC, e II – Certificação Controller ANEFAC Plus.

**2.** A Certificação Controller ANEFAC está em linha com o Programa de Certificação Profissional da ANEFAC, cujo regulamento pode ser acessado em [anefac.org/cac-certificado](https://www.anefac.org/cac-certificado).

---

**3. Requisitos para a candidatura, de acordo com a categoria:**

**3.1 Certificação Controller ANEFAC (CCA):** indicado para os profissionais que já possuem experiência em gestão, e que busquem se consolidar na função de Controller, e deverão comprovar:

- Possuir graduação em IES reconhecida pelo MEC, preferencialmente em Administração, Contabilidade ou Economia;
- Possuir diploma ou certificados em cursos stricto/lato sensu na área administrativo-financeira, no caso de não possuir graduação nas áreas mencionadas;
- Possuir experiência em gestão por, pelo menos, 2 (dois) anos, comprovada por declaração da empresa atual;
- Prestar exame de proficiência em conhecimento técnico e específico, aplicado pela ANEFAC e FUCAPE;
- Realizar entrevista;
- Manter-se associado da ANEFAC;
- Assinar Código de Conduta ANEFAC.

**3.2 Certificação Controller ANEFAC Plus (CCA Plus):** indicado para os profissionais que já atuam, consolidados, na função de Controller, e deverão comprovar:

- Possuir graduação em IES reconhecida pelo MEC;
- Possuir diploma ou certificados em cursos stricto/lato sensu na área administrativo-financeira;
- Possuir experiência na área de controladoria por, pelo menos, 5 (cinco) anos em empresa de grande porte;
- Apresentar Carta de Recomendação assinada por 2 (dois) executivos de alto escalão;
- Realizar entrevista;
- Manter-se associado da ANEFAC;
- Assinar Código de Conduta ANEFAC.

---

**4.** As inscrições se dão de modo contínuo e devem ser realizadas, única e exclusivamente, via Internet.

**5.** Cronograma: processo contínuo — passo a passo para a sua candidatura conforme etapas descritas na seção "Como funciona".

**6.** Quando da recertificação, o profissional deverá efetuar o pagamento equivalente a 30% do valor da certificação vigente na data, além de cumprir o previsto nos arts. 13 e 14 do Regulamento Geral.

**7.** O exame de proficiência será realizado por meio de plataforma digital. Consiste em questões de múltipla escolha e dissertativas sobre os temas: Contabilidade, Economia e Finanças, Administração, Tributário, Governança Corporativa, Tecnologia e Capital Humano.

> Observação: não há indicação de bibliografia básica obrigatória, porém a ANEFAC entregará uma Orientação de Estudos aos candidatos inscritos.

**8.** A entrevista com os membros do Comitê de Certificação ANEFAC Controller poderá se dar por meio presencial ou remoto, em data pré-acordada.

**9.** No caso de aprovação, o valor do investimento total já contemplará a primeira anuidade de associação à ANEFAC.

**10.** Os valores relativos à taxa de inscrição e à certificação serão atualizados anualmente.

**11.** No caso de dúvidas, entrar em contato através do e-mail: cac@anefac.org.br

**12.** Os casos não previstos neste Edital serão resolvidos pelo Comitê de Certificação ANEFAC Controller.

---

*Bolí Rosales — Superintendente*
*Marta Pelucio — Presidente Nacional*`,
};

const DEFAULT_CODIGO_CONDUTA: DocumentoInstitucional = {
  titulo: "Código de Conduta ANEFAC",
  conteudo: `**Mensagem do Presidente do Conselho de Administração**

A ANEFAC – Associação Nacional dos Executivos de Finanças, Administração e Contabilidade – ao longo de seus mais de 56 anos, construiu uma trajetória de evolução, marcada pela contínua busca de aprimoramento e de desenvolvimento profissional dos nossos associados e executivos, nas áreas em que atuamos.

Nessa trajetória sempre priorizamos, em todas as nossas relações, princípios éticos, de integridade e de transparência, como nossos principais valores que norteiam desde sempre a nossa atuação. Com base nesses valores, este Código de Conduta tem como objetivo reforçar e direcionar todas as ações de nossos executivos e de nossos associados e, também, se aplica a todos os nossos parceiros de negócios e nossos fornecedores.

É fundamental que todos os nossos associados, executivos, parceiros de negócios e fornecedores conheçam, compreendam e pratiquem estas diretrizes.

*Cordialmente,*
*Gennaro Oddone — Presidente do Conselho de Administração 2023/2025*
*São Paulo, 01 de julho de 2023*

---

**Sobre o Código de Conduta**

Este Código de Conduta se aplica a todas as partes que se relacionam com a ANEFAC incluindo nossos associados, colaboradores, executivos assim como o Conselho de Administração, envolvidos direta ou indiretamente em organizações de administração pública e da iniciativa privada. Aplica-se, ainda, a todos os parceiros de negócios e fornecedores, prestadores de serviços e demais pessoas que se relacionam com a Associação.

Este Código visa consolidar e formalizar o compromisso da ANEFAC com as melhores práticas de governança corporativa, estabelecendo as diretrizes de condutas éticas esperadas pelas partes interessadas, em especial nas ações que envolvam o combate a ilícitos decorrentes de fraudes, lavagem de dinheiro e combate à corrupção.

O Código tem vigência indeterminada e será revisado e/ou revalidado sempre que necessário.

---

**Princípios Básicos**

**1. Transparência e prestação de contas**
Consideramos imprescindível que a sociedade tenha acesso às informações econômicas e às demonstrações financeiras das empresas. Disponibilizaremos, anualmente, as demonstrações financeiras da ANEFAC. Incentivamos fortemente o setor privado e entidades não governamentais na divulgação de informações financeiras com transparência, conforme as melhores práticas contábeis nacionais e internacionais.

**2. Equidade**
A ANEFAC preza pelo tratamento justo e isonômico de todas as partes interessadas. Não discriminamos ninguém independente de raça, cor, religião, gênero, nacionalidade, deficiência física, idade ou qualquer outra característica.

**3. Responsabilidade Social Empresarial**
A ANEFAC atua com responsabilidade social que prima pela perenidade, pela sustentabilidade e pela visão de longo prazo das organizações.

**4. Conflito de interesses**
Os conselheiros e executivos têm dever de lealdade com todas as partes interessadas da ANEFAC. Tão logo identificado o conflito de interesses, a pessoa envolvida deve manifestar seu conflito e abster-se das discussões e deliberações.

---

**Nossos Relacionamentos**

**1. Com a sociedade e o meio ambiente**
A ANEFAC busca uma convivência harmoniosa com as comunidades onde suas regionais atuam, com respeito às pessoas, seus costumes e tradições, seus valores e o meio ambiente.

**2. Com os colaboradores, associados e corpo diretivo**
A ANEFAC orienta e espera que seus colaboradores, associados e corpo executivo cumpram sempre todas as leis aplicáveis, regulamentos e políticas internas.

**3. Com os parceiros e fornecedores**
Nosso compromisso de criar um ambiente de confiança, comunicação aberta, honesta e respeito se estende no relacionamento com nossos parceiros, incluindo fornecedores, distribuidores, agentes e clientes.

**4. Com governo e agentes públicos**
A ANEFAC repudia toda e qualquer forma de corrupção, favorecimento, extorsão e propina, em todos os níveis.

**5. Com a imprensa e mídias sociais**
A ANEFAC encoraja seus associados a utilizarem as mídias sociais como forma de divulgação, atualização e interação social, observando sempre as diretrizes deste Código.

---

**Comitê de Ética & Governança e Canal Confidencial**

O Comitê de Ética e Governança é responsável por avaliar e apurar os relatos de suspeitas de conduta irregular e/ou violações desse Código.

Violações podem ser informadas por:
- E-mail: canaldedenuncia@anefac.org.br
- Correspondência: Rua 7 de Abril, 125, Centro – São Paulo, CEP: 01043-000

---

*Este Código é aprovado pelo Conselho de Administração da ANEFAC.*`,
};

export const DEFAULT_INSTITUCIONAL: InstitucionalConfig = {
  comite: DEFAULT_COMITE,
  regulamento: DEFAULT_REGULAMENTO,
  edital: DEFAULT_EDITAL,
  codigoConduta: DEFAULT_CODIGO_CONDUTA,
};

const STORAGE_KEY = "anefac_institucional_v1";

function loadInstitucional(): InstitucionalConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_INSTITUCIONAL;
    const parsed = JSON.parse(saved);
    return {
      comite: parsed.comite ?? DEFAULT_INSTITUCIONAL.comite,
      regulamento: { ...DEFAULT_INSTITUCIONAL.regulamento, ...parsed.regulamento },
      edital: { ...DEFAULT_INSTITUCIONAL.edital, ...parsed.edital },
      codigoConduta: { ...DEFAULT_INSTITUCIONAL.codigoConduta, ...parsed.codigoConduta },
    };
  } catch {
    return DEFAULT_INSTITUCIONAL;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface InstitucionalContextType {
  institucional: InstitucionalConfig;
  salvarInstitucional: (data: InstitucionalConfig) => void;
  resetarInstitucional: () => void;
}

const InstitucionalContext = createContext<InstitucionalContextType | null>(null);

export function InstitucionalProvider({ children }: { children: React.ReactNode }) {
  const [institucional, setInstitucional] = useState<InstitucionalConfig>(loadInstitucional);

  const salvarInstitucional = (data: InstitucionalConfig) => {
    setInstitucional(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const resetarInstitucional = () => {
    localStorage.removeItem(STORAGE_KEY);
    setInstitucional(DEFAULT_INSTITUCIONAL);
  };

  return (
    <InstitucionalContext.Provider value={{ institucional, salvarInstitucional, resetarInstitucional }}>
      {children}
    </InstitucionalContext.Provider>
  );
}

export function useInstitucional() {
  const ctx = useContext(InstitucionalContext);
  if (!ctx) throw new Error("useInstitucional must be used within InstitucionalProvider");
  return ctx;
}
