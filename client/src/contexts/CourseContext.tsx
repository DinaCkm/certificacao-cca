import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { cursosApi, adminApi } from "@/lib/api";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type NivelCurso = "iniciante" | "intermediario" | "avancado";
export type CategoriaCurso = "controller" | "lideranca" | "financas" | "outros";
export type TipoCurso = "interno" | "externo";

export interface Pacote {
  id: string | number;
  nome: string;
  descricao: string;
  preco: number;
  tipo: TipoCurso;
  linkCompra: string;
  cursoIds: string[]; // IDs dos cursos incluídos
}

export interface Curso {
  id: string | number;
  titulo: string;
  descricao: string;
  descricaoBreve: string;
  categoria: CategoriaCurso;
  nivel: NivelCurso;
  duracao: string;          // ex: "8h", "12h 30min"
  instrutor: string;
  imagemUrl: string;
  tipo: TipoCurso;           // interno = nossa página de pagamento · externo = Hotmart/Kiwify/Eduzz
  linkCompra: string;        // usado só quando tipo === "externo"
  preco: number;
  certificacaoRelacionada?: string; // ID da certificação (ex: "cca", "cca-plus")
  destaque: boolean;
  ativo: boolean;
  ordem: number;
}

// ── Mapeamento API (snake_case) <-> Frontend (camelCase) ──────────────────────

function cursoDaApi(c: any): Curso {
  return {
    id: c.id,
    titulo: c.titulo,
    descricao: c.descricao || "",
    descricaoBreve: c.descricao_breve || "",
    categoria: c.categoria,
    nivel: c.nivel,
    duracao: c.duracao || "",
    instrutor: c.instrutor || "",
    imagemUrl: c.imagem_url || "",
    tipo: c.tipo || "externo",
    linkCompra: c.link_compra || "",
    preco: Number(c.preco) || 0,
    certificacaoRelacionada: c.certificacao_relacionada || "",
    destaque: !!c.destaque,
    ativo: !!c.ativo,
    ordem: c.ordem ?? 0,
  };
}

function cursoParaApi(c: Partial<Curso>) {
  return {
    titulo: c.titulo,
    descricao: c.descricao,
    descricao_breve: c.descricaoBreve,
    categoria: c.categoria,
    nivel: c.nivel,
    duracao: c.duracao,
    instrutor: c.instrutor,
    imagem_url: c.imagemUrl,
    tipo: c.tipo,
    link_compra: c.linkCompra,
    preco: c.preco,
    certificacao_relacionada: c.certificacaoRelacionada,
    destaque: c.destaque,
    ativo: c.ativo,
    ordem: c.ordem,
  };
}

function pacoteDaApi(p: any): Pacote {
  return {
    id: p.id,
    nome: p.nome,
    descricao: p.descricao || "",
    preco: Number(p.preco) || 0,
    tipo: p.tipo || "externo",
    linkCompra: p.link_compra || "",
    cursoIds: p.curso_ids || [],
  };
}

function pacoteParaApi(p: Partial<Pacote>) {
  return {
    nome: p.nome,
    descricao: p.descricao,
    preco: p.preco,
    tipo: p.tipo,
    link_compra: p.linkCompra,
    curso_ids: p.cursoIds,
    ativo: true,
  };
}

// ── Context ───────────────────────────────────────────────────────────────────

interface CourseContextType {
  cursos: Curso[];
  pacotes: Pacote[];
  carregando: boolean;
  recarregar: () => Promise<void>;
  // Cursos
  adicionarCurso: (curso: Omit<Curso, "id" | "ordem">) => Promise<void>;
  atualizarCurso: (id: string | number, dados: Partial<Curso>) => Promise<void>;
  removerCurso: (id: string | number) => Promise<void>;
  // Pacotes
  adicionarPacote: (pacote: Omit<Pacote, "id">) => Promise<void>;
  atualizarPacote: (id: string | number, dados: Partial<Pacote>) => Promise<void>;
  removerPacote: (id: string | number) => Promise<void>;
  // Utilitários
  cursosAtivos: Curso[];
  cursosPorCategoria: (cat: CategoriaCurso) => Curso[];
  cursosRelacionados: (certId: string) => Curso[];
}

const CourseContext = createContext<CourseContextType | null>(null);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Carrega da API pública (funciona para qualquer visitante, logado ou não).
  // Telas de admin que precisam ver cursos inativos usam adminApi.listarCursos()
  // separadamente (ver AdminCursos.tsx).
  const carregarPublico = useCallback(async () => {
    try {
      const { cursos: c, pacotes: p } = await cursosApi.publico();
      setCursos(c.map(cursoDaApi));
      setPacotes(p.map(pacoteDaApi));
    } catch {
      // Mantém listas vazias em caso de falha — não derruba a página
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPublico();
  }, [carregarPublico]);

  const adicionarCurso = async (dados: Omit<Curso, "id" | "ordem">) => {
    await adminApi.criarCurso(cursoParaApi(dados));
    await carregarPublico();
  };

  const atualizarCurso = async (id: string | number, dados: Partial<Curso>) => {
    const atual = cursos.find((c) => c.id === id);
    await adminApi.editarCurso(Number(id), cursoParaApi({ ...atual, ...dados }));
    await carregarPublico();
  };

  const removerCurso = async (id: string | number) => {
    await adminApi.removerCurso(Number(id));
    await carregarPublico();
  };

  const adicionarPacote = async (dados: Omit<Pacote, "id">) => {
    await adminApi.criarPacote(pacoteParaApi(dados));
    await carregarPublico();
  };

  const atualizarPacote = async (id: string | number, dados: Partial<Pacote>) => {
    const atual = pacotes.find((p) => p.id === id);
    await adminApi.editarPacote(Number(id), pacoteParaApi({ ...atual, ...dados }));
    await carregarPublico();
  };

  const removerPacote = async (id: string | number) => {
    await adminApi.removerPacote(Number(id));
    await carregarPublico();
  };

  // A API pública já retorna só os ativos, ordenados — cursosAtivos existe
  // por compatibilidade com quem já usava esse nome.
  const cursosAtivos = cursos;
  const cursosPorCategoria = (cat: CategoriaCurso) => cursosAtivos.filter((c) => c.categoria === cat);
  const cursosRelacionados = (certId: string) => cursosAtivos.filter((c) => c.certificacaoRelacionada === certId);

  return (
    <CourseContext.Provider
      value={{
        cursos,
        pacotes,
        carregando,
        recarregar: carregarPublico,
        adicionarCurso,
        atualizarCurso,
        removerCurso,
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
