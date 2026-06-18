import { createContext, useContext, useState, ReactNode } from "react";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type NivelCurso = "iniciante" | "intermediario" | "avancado";
export type CategoriaCurso = "controller" | "lideranca" | "financas" | "outros";

export interface Pacote {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  linkCompra: string;
  cursoIds: string[]; // IDs dos cursos incluídos
}

export interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  descricaoBreve: string;
  categoria: CategoriaCurso;
  nivel: NivelCurso;
  duracao: string;          // ex: "8h", "12h 30min"
  instrutor: string;
  imagemUrl: string;
  linkCompra: string;
  preco: number;
  certificacaoRelacionada?: string; // ID da certificação (ex: "cca", "cca-plus")
  destaque: boolean;
  ativo: boolean;
  ordem: number;
}

// ── Dados default ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "anefac_cursos_v1";
const STORAGE_KEY_PACOTES = "anefac_pacotes_v1";

const cursosDefault: Curso[] = [
  {
    id: "controller-fundamentos",
    titulo: "Fundamentos da Controladoria",
    descricao: "Domine os conceitos essenciais da controladoria moderna: planejamento, orçamento, análise de resultados e reporting para a alta gestão.",
    descricaoBreve: "Base sólida em controladoria para quem quer se preparar para a certificação CCA.",
    categoria: "controller",
    nivel: "iniciante",
    duracao: "12h",
    instrutor: "ANEFAC",
    imagemUrl: "",
    linkCompra: "#",
    preco: 490,
    certificacaoRelacionada: "cca",
    destaque: true,
    ativo: true,
    ordem: 1,
  },
  {
    id: "controller-avancado",
    titulo: "Controller Avançado — Gestão Estratégica",
    descricao: "Aprofunde-se em governança corporativa, gestão de riscos, tomada de decisão estratégica e liderança financeira para Controllers consolidados.",
    descricaoBreve: "Preparação completa para a certificação CCA Plus.",
    categoria: "controller",
    nivel: "avancado",
    duracao: "16h",
    instrutor: "ANEFAC",
    imagemUrl: "",
    linkCompra: "#",
    preco: 790,
    certificacaoRelacionada: "cca-plus",
    destaque: true,
    ativo: true,
    ordem: 2,
  },
  {
    id: "analise-financeira",
    titulo: "Análise Financeira e Indicadores",
    descricao: "Aprenda a construir e interpretar indicadores financeiros, DRE, fluxo de caixa e relatórios gerenciais com foco em tomada de decisão.",
    descricaoBreve: "Indicadores e análise financeira para gestores e Controllers.",
    categoria: "financas",
    nivel: "intermediario",
    duracao: "10h",
    instrutor: "ANEFAC",
    imagemUrl: "",
    linkCompra: "#",
    preco: 390,
    certificacaoRelacionada: "cca",
    destaque: false,
    ativo: true,
    ordem: 3,
  },
  {
    id: "lideranca-fundamentos",
    titulo: "Fundamentos da Liderança",
    descricao: "Desenvolva as bases da liderança: autoconhecimento, escuta ativa, disciplina, empatia e gestão de tempo para liderar a si mesmo e sua equipe.",
    descricaoBreve: "Preparação para a Certificação EcodoBem Nível 1.",
    categoria: "lideranca",
    nivel: "iniciante",
    duracao: "8h",
    instrutor: "EcodoBem",
    imagemUrl: "",
    linkCompra: "#",
    preco: 350,
    certificacaoRelacionada: "ecodobem-lideranca-n1",
    destaque: true,
    ativo: true,
    ordem: 4,
  },
  {
    id: "lideranca-essencial",
    titulo: "Liderança Essencial — Gestão de Pessoas",
    descricao: "Aprenda a conduzir equipes, gerenciar rotinas, comunicar com clareza e entregar resultados com equilíbrio emocional e foco em pessoas.",
    descricaoBreve: "Preparação para a Certificação EcodoBem Nível 2.",
    categoria: "lideranca",
    nivel: "intermediario",
    duracao: "10h",
    instrutor: "EcodoBem",
    imagemUrl: "",
    linkCompra: "#",
    preco: 390,
    certificacaoRelacionada: "ecodobem-lideranca-n2",
    destaque: false,
    ativo: true,
    ordem: 5,
  },
  {
    id: "lideranca-master",
    titulo: "Liderança Master — Alta Performance",
    descricao: "Gestão de pessoas, resultados e relações organizacionais para líderes experientes que buscam ampliar seu impacto e influência.",
    descricaoBreve: "Preparação para a Certificação EcodoBem Nível 3.",
    categoria: "lideranca",
    nivel: "avancado",
    duracao: "12h",
    instrutor: "EcodoBem",
    imagemUrl: "",
    linkCompra: "#",
    preco: 490,
    certificacaoRelacionada: "ecodobem-lideranca-n3",
    destaque: false,
    ativo: true,
    ordem: 6,
  },
];

const pacotesDefault: Pacote[] = [
  {
    id: "pacote-cca-completo",
    nome: "Pacote CCA Completo",
    descricao: "Tudo que você precisa para se preparar e conquistar a Certificação Controller ANEFAC (CCA): fundamentos, análise financeira e simulados.",
    preco: 790,
    linkCompra: "#",
    cursoIds: ["controller-fundamentos", "analise-financeira"],
  },
  {
    id: "pacote-lideranca-n1-n2",
    nome: "Pacote Liderança N1 + N2",
    descricao: "Jornada completa dos dois primeiros níveis EcodoBem: Fundamentos da Liderança e Liderança Essencial com desconto especial.",
    preco: 650,
    linkCompra: "#",
    cursoIds: ["lideranca-fundamentos", "lideranca-essencial"],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function carregarCursos(): Curso[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Curso[];
  } catch {}
  return cursosDefault;
}

function carregarPacotes(): Pacote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PACOTES);
    if (raw) return JSON.parse(raw) as Pacote[];
  } catch {}
  return pacotesDefault;
}

// ── Context ───────────────────────────────────────────────────────────────────

interface CourseContextType {
  cursos: Curso[];
  pacotes: Pacote[];
  // Cursos
  adicionarCurso: (curso: Omit<Curso, "id" | "ordem">) => void;
  atualizarCurso: (id: string, dados: Partial<Curso>) => void;
  removerCurso: (id: string) => void;
  reordenarCursos: (ids: string[]) => void;
  // Pacotes
  adicionarPacote: (pacote: Omit<Pacote, "id">) => void;
  atualizarPacote: (id: string, dados: Partial<Pacote>) => void;
  removerPacote: (id: string) => void;
  // Utilitários
  cursosAtivos: Curso[];
  cursosPorCategoria: (cat: CategoriaCurso) => Curso[];
  cursosRelacionados: (certId: string) => Curso[];
}

const CourseContext = createContext<CourseContextType | null>(null);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [cursos, setCursos] = useState<Curso[]>(carregarCursos);
  const [pacotes, setPacotes] = useState<Pacote[]>(carregarPacotes);

  const salvarCursos = (lista: Curso[]) => {
    setCursos(lista);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  };

  const salvarPacotes = (lista: Pacote[]) => {
    setPacotes(lista);
    localStorage.setItem(STORAGE_KEY_PACOTES, JSON.stringify(lista));
  };

  const adicionarCurso = (dados: Omit<Curso, "id" | "ordem">) => {
    const novo: Curso = {
      ...dados,
      id: `curso-${Date.now()}`,
      ordem: cursos.length + 1,
    };
    salvarCursos([...cursos, novo]);
  };

  const atualizarCurso = (id: string, dados: Partial<Curso>) => {
    salvarCursos(cursos.map((c) => (c.id === id ? { ...c, ...dados } : c)));
  };

  const removerCurso = (id: string) => {
    salvarCursos(cursos.filter((c) => c.id !== id));
  };

  const reordenarCursos = (ids: string[]) => {
    const reordenados = ids
      .map((id, idx) => {
        const c = cursos.find((x) => x.id === id);
        return c ? { ...c, ordem: idx + 1 } : null;
      })
      .filter(Boolean) as Curso[];
    salvarCursos(reordenados);
  };

  const adicionarPacote = (dados: Omit<Pacote, "id">) => {
    const novo: Pacote = { ...dados, id: `pacote-${Date.now()}` };
    salvarPacotes([...pacotes, novo]);
  };

  const atualizarPacote = (id: string, dados: Partial<Pacote>) => {
    salvarPacotes(pacotes.map((p) => (p.id === id ? { ...p, ...dados } : p)));
  };

  const removerPacote = (id: string) => {
    salvarPacotes(pacotes.filter((p) => p.id !== id));
  };

  const cursosAtivos = cursos.filter((c) => c.ativo).sort((a, b) => a.ordem - b.ordem);
  const cursosPorCategoria = (cat: CategoriaCurso) => cursosAtivos.filter((c) => c.categoria === cat);
  const cursosRelacionados = (certId: string) => cursosAtivos.filter((c) => c.certificacaoRelacionada === certId);

  return (
    <CourseContext.Provider
      value={{
        cursos,
        pacotes,
        adicionarCurso,
        atualizarCurso,
        removerCurso,
        reordenarCursos,
        adicionarPacote,
        atualizarPacote,
        removerPacote,
        cursosAtivos,
        cursosPorCategoria,
        cursosRelacionados,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourses must be used within CourseProvider");
  return ctx;
}
