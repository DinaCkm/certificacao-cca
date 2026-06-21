import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useCourses, CategoriaCurso, Curso, Pacote } from "@/contexts/CourseContext";
import {
  BookOpen, Clock, BarChart2, Star, Package, ExternalLink,
  ChevronRight, ArrowLeft, Search, Filter
} from "lucide-react";

const categoriaLabel: Record<CategoriaCurso, string> = {
  controller: "Controladoria",
  lideranca: "Liderança",
  financas: "Finanças",
  outros: "Outros",
};

const nivelLabel: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

const nivelCor: Record<string, string> = {
  iniciante: "bg-green-100 text-green-700",
  intermediario: "bg-amber-100 text-amber-700",
  avancado: "bg-red-100 text-red-700",
};

const categoriaCor: Record<CategoriaCurso, string> = {
  controller: "#1e3a6e",
  lideranca: "#16a34a",
  financas: "#7c3aed",
  outros: "#64748b",
};

function CursoCard({ curso }: { curso: Curso }) {
  const temImagem = curso.imagemUrl && curso.imagemUrl.trim() !== "";
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
      {/* Imagem / placeholder */}
      <div
        className="h-40 flex items-center justify-center relative overflow-hidden"
        style={{ background: temImagem ? undefined : `linear-gradient(135deg, ${categoriaCor[curso.categoria]}22 0%, ${categoriaCor[curso.categoria]}44 100%)` }}
      >
        {temImagem ? (
          <img src={curso.imagemUrl} alt={curso.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <BookOpen className="w-12 h-12 opacity-30" style={{ color: categoriaCor[curso.categoria] }} />
        )}
        {curso.destaque && (
          <span className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" /> Destaque
          </span>
        )}
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full ${nivelCor[curso.nivel]}`}>
          {nivelLabel[curso.nivel]}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: categoriaCor[curso.categoria] }}>
          {categoriaLabel[curso.categoria]}
        </span>
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2">{curso.titulo}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">{curso.descricaoBreve}</p>

        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {curso.duracao}</span>
          <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" /> {nivelLabel[curso.nivel]}</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-gray-900">
            {curso.preco === 0 ? "Gratuito" : `R$ ${curso.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          </span>
          <a
            href={curso.linkCompra}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2 rounded-xl transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${categoriaCor[curso.categoria]} 0%, #2d5be3 100%)` }}
          >
            Comprar <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function PacoteCard({ pacote, cursos }: { pacote: Pacote; cursos: Curso[] }) {
  const cursosIncluidos = cursos.filter((c) => pacote.cursoIds.includes(c.id));
  const precoTotal = cursosIncluidos.reduce((s, c) => s + c.preco, 0);
  const economia = precoTotal - pacote.preco;

  return (
    <div className="bg-gradient-to-br from-[#0f1f4e] to-[#1e3a6e] rounded-2xl p-6 text-white shadow-lg flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Pacote</span>
        </div>
        {economia > 0 && (
          <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
            Economize R$ {economia.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        )}
      </div>

      <h3 className="font-bold text-xl mb-2">{pacote.nome}</h3>
      <p className="text-white/70 text-sm mb-4 flex-1">{pacote.descricao}</p>

      {cursosIncluidos.length > 0 && (
        <div className="mb-4 space-y-1.5">
          <p className="text-xs text-white/50 uppercase tracking-wide font-semibold mb-2">Inclui:</p>
          {cursosIncluidos.map((c) => (
            <div key={c.id} className="flex items-center gap-2 text-sm text-white/80">
              <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {c.titulo}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
        <div>
          {economia > 0 && (
            <span className="text-white/40 line-through text-sm block">
              R$ {precoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          )}
          <span className="text-2xl font-bold text-amber-400">
            R$ {pacote.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <a
          href={pacote.linkCompra}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-bold bg-amber-400 text-amber-900 px-4 py-2.5 rounded-xl hover:bg-amber-300 transition-colors"
        >
          Comprar pacote <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

export function Cursos() {
  const { cursosAtivos, pacotes, cursos } = useCourses();
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaCurso | "todos">("todos");

  const categorias: Array<{ valor: CategoriaCurso | "todos"; label: string }> = [
    { valor: "todos", label: "Todos" },
    { valor: "controller", label: "Controladoria" },
    { valor: "lideranca", label: "Liderança" },
    { valor: "financas", label: "Finanças" },
    { valor: "outros", label: "Outros" },
  ];

  const cursosFiltrados = cursosAtivos.filter((c) => {
    const matchBusca =
      busca === "" ||
      c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      c.descricaoBreve.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoriaFiltro === "todos" || c.categoria === categoriaFiltro;
    return matchBusca && matchCategoria;
  });

  const cursosDestaque = cursosAtivos.filter((c) => c.destaque);

  // Agrupa por categoria para exibição em fileiras (Netflix)
  const categoriasCom = (["controller", "lideranca", "financas", "outros"] as CategoriaCurso[]).filter(
    (cat) => cursosFiltrados.some((c) => c.categoria === cat)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="pt-16" style={{ background: "linear-gradient(135deg, #0f1f4e 0%, #1e3a6e 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 py-14 text-center">
          <span className="inline-block bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Preparação para Certificação
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Cursos ANEFAC
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            Prepare-se com os melhores cursos antes de fazer sua certificação. Aprenda no seu ritmo e chegue pronto para ser certificado.
          </p>

          {/* Busca */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Filtros de categoria */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {categorias.map((cat) => (
            <button
              key={cat.valor}
              onClick={() => setCategoriaFiltro(cat.valor)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                categoriaFiltro === cat.valor
                  ? "bg-[#1e3a6e] text-white shadow"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#1e3a6e] hover:text-[#1e3a6e]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Pacotes — sempre visíveis quando não há busca */}
        {busca === "" && categoriaFiltro === "todos" && pacotes.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <Package className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900">Pacotes com desconto</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pacotes.map((p) => (
                <PacoteCard key={p.id} pacote={p} cursos={cursos} />
              ))}
            </div>
          </section>
        )}

        {/* Destaques */}
        {busca === "" && categoriaFiltro === "todos" && cursosDestaque.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900">Em destaque</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cursosDestaque.map((c) => (
                <CursoCard key={c.id} curso={c} />
              ))}
            </div>
          </section>
        )}

        {/* Por categoria (fileiras Netflix) */}
        {categoriasCom.length > 0 ? (
          categoriasCom.map((cat) => {
            const lista = cursosFiltrados.filter((c) => c.categoria === cat);
            if (lista.length === 0) return null;
            return (
              <section key={cat} className="mb-12">
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: categoriaCor[cat] }}
                  />
                  <h2 className="text-xl font-bold text-gray-900">{categoriaLabel[cat]}</h2>
                  <span className="text-sm text-gray-400">({lista.length} curso{lista.length !== 1 ? "s" : ""})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {lista.map((c) => (
                    <CursoCard key={c.id} curso={c} />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <div className="text-center py-20 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhum curso encontrado</p>
            <p className="text-sm mt-1">Tente outro termo de busca ou categoria</p>
          </div>
        )}

        {/* Voltar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link href="/novo-fluxo/certificacoes">
            <a className="inline-flex items-center gap-2 text-[#1e3a6e] font-medium hover:underline text-sm">
              <ArrowLeft className="w-4 h-4" /> Voltar para certificações
            </a>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100 bg-white mt-4">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} ANEFAC — Todos os direitos reservados
        </div>
      </footer>
    </div>
  );
}
