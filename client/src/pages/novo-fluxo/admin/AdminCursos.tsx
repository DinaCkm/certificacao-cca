import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Curso,
  Pacote,
  CategoriaCurso,
  NivelCurso,
  TipoCurso,
} from "@/contexts/CourseContext";
import { adminApi } from "@/lib/api";
import {
  BookOpen, Package, Plus, Pencil, Trash2, ExternalLink,
  Star, Eye, EyeOff, ArrowLeft, Save, X, ChevronDown, ChevronUp,
  DollarSign, Clock, BarChart2, Link as LinkIcon, Image, Tag,
} from "lucide-react";

// ── Mapeamento API (admin vê todos, inclusive inativos) ────────────────────────

function cursoDaApiAdmin(c: any): Curso {
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

function cursoParaApiAdmin(c: Partial<Curso>) {
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
  };
}

function pacoteDaApiAdmin(p: any): Pacote {
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

function pacoteParaApiAdmin(p: Partial<Pacote>) {
  return {
    nome: p.nome,
    descricao: p.descricao,
    preco: p.preco,
    tipo: p.tipo,
    link_compra: p.linkCompra,
    curso_ids: p.cursoIds,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const categoriaOpts: { valor: CategoriaCurso; label: string }[] = [
  { valor: "controller", label: "Controladoria" },
  { valor: "lideranca", label: "Liderança" },
  { valor: "financas", label: "Finanças" },
  { valor: "outros", label: "Outros" },
];

const nivelOpts: { valor: NivelCurso; label: string }[] = [
  { valor: "iniciante", label: "Iniciante" },
  { valor: "intermediario", label: "Intermediário" },
  { valor: "avancado", label: "Avançado" },
];

const certOpts = [
  { valor: "", label: "Nenhuma" },
  { valor: "cca", label: "CCA" },
  { valor: "cca-plus", label: "CCA Plus" },
  { valor: "ecodobem-lideranca-n1", label: "EcodoBem N1" },
  { valor: "ecodobem-lideranca-n2", label: "EcodoBem N2" },
  { valor: "ecodobem-lideranca-n3", label: "EcodoBem N3" },
  { valor: "ecodobem-lideranca-n4", label: "EcodoBem N4" },
];

const categoriaCor: Record<CategoriaCurso, string> = {
  controller: "#1e3a6e",
  lideranca: "#16a34a",
  financas: "#7c3aed",
  outros: "#64748b",
};

// ── Formulário de Curso ───────────────────────────────────────────────────────

type CursoForm = Omit<Curso, "id" | "ordem">;

const cursoVazio: CursoForm = {
  titulo: "",
  descricao: "",
  descricaoBreve: "",
  categoria: "controller",
  nivel: "iniciante",
  duracao: "",
  instrutor: "ANEFAC",
  imagemUrl: "",
  tipo: "externo",
  linkCompra: "",
  preco: 0,
  certificacaoRelacionada: "",
  destaque: false,
  ativo: true,
};

function CursoEditor({
  inicial,
  onSalvar,
  onCancelar,
}: {
  inicial: CursoForm;
  onSalvar: (dados: CursoForm) => void;
  onCancelar: () => void;
}) {
  const [form, setForm] = useState<CursoForm>(inicial);
  const set = (campo: keyof CursoForm, valor: unknown) =>
    setForm((p) => ({ ...p, [campo]: valor }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Título */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Título do curso *</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.titulo}
            onChange={(e) => set("titulo", e.target.value)}
            placeholder="Ex: Fundamentos da Controladoria"
          />
        </div>

        {/* Descrição breve */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição breve (card) *</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.descricaoBreve}
            onChange={(e) => set("descricaoBreve", e.target.value)}
            placeholder="Resumo curto exibido no card"
          />
        </div>

        {/* Descrição completa */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição completa</label>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Descrição detalhada do conteúdo do curso"
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Categoria *</label>
          <select
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.categoria}
            onChange={(e) => set("categoria", e.target.value as CategoriaCurso)}
          >
            {categoriaOpts.map((o) => (
              <option key={o.valor} value={o.valor}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Nível */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Nível *</label>
          <select
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.nivel}
            onChange={(e) => set("nivel", e.target.value as NivelCurso)}
          >
            {nivelOpts.map((o) => (
              <option key={o.valor} value={o.valor}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Duração */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Duração</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.duracao}
            onChange={(e) => set("duracao", e.target.value)}
            placeholder="Ex: 8h, 12h 30min"
          />
        </div>

        {/* Instrutor */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Instrutor / Parceiro</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.instrutor}
            onChange={(e) => set("instrutor", e.target.value)}
            placeholder="ANEFAC, EcodoBem, etc."
          />
        </div>

        {/* Preço */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Preço (R$) *</label>
          <input
            type="number"
            min={0}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.preco}
            onChange={(e) => set("preco", Number(e.target.value))}
            placeholder="0 para gratuito"
          />
        </div>

        {/* Certificação relacionada */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Certificação relacionada</label>
          <select
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.certificacaoRelacionada || ""}
            onChange={(e) => set("certificacaoRelacionada", e.target.value)}
          >
            {certOpts.map((o) => (
              <option key={o.valor} value={o.valor}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Tipo do curso: interno x externo */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Onde o aluno compra este curso? *</label>
          <div className="flex gap-3">
            <label className={`flex-1 flex items-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-colors ${form.tipo === "interno" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
              <input
                type="radio"
                checked={form.tipo === "interno"}
                onChange={() => set("tipo", "interno" as TipoCurso)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Curso interno (nossa página de pagamento)</span>
            </label>
            <label className={`flex-1 flex items-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-colors ${form.tipo === "externo" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
              <input
                type="radio"
                checked={form.tipo === "externo"}
                onChange={() => set("tipo", "externo" as TipoCurso)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Plataforma externa (Hotmart, Kiwify...)</span>
            </label>
          </div>
        </div>

        {/* Link de compra — só para curso externo */}
        {form.tipo === "externo" && (
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Link de compra (URL da plataforma externa) *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.linkCompra}
              onChange={(e) => set("linkCompra", e.target.value)}
              placeholder="https://hotmart.com/produto/..."
            />
            <p className="text-xs text-gray-400 mt-1">Cole aqui o link da Hotmart, Kiwify, Eduzz ou outra plataforma. O candidato será redirecionado para lá ao clicar em "Comprar" — esse redirecionamento fica registrado no relatório de cliques.</p>
          </div>
        )}
        {form.tipo === "interno" && (
          <div className="md:col-span-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-800">Ao clicar em "Comprar", o candidato será levado para a nossa página de pagamento interna. A compra fica registrada no relatório de cliques com o status de "comprou" ou "não comprou".</p>
          </div>
        )}

        {/* URL da imagem */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">URL da imagem de capa</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.imagemUrl}
            onChange={(e) => set("imagemUrl", e.target.value)}
            placeholder="https://... (deixe vazio para usar placeholder)"
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.destaque}
              onChange={(e) => set("destaque", e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="text-sm font-medium text-gray-700">Destaque</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => set("ativo", e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">Ativo (visível no site)</span>
          </label>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={() => onSalvar(form)}
          disabled={!form.titulo || (form.tipo === "externo" && !form.linkCompra)}
          className="flex items-center gap-2 bg-[#1e3a6e] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#162d55] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          <Save className="w-4 h-4" /> Salvar curso
        </button>
        <button
          onClick={onCancelar}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          <X className="w-4 h-4" /> Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Formulário de Pacote ──────────────────────────────────────────────────────

type PacoteForm = Omit<Pacote, "id">;

const pacoteVazio: PacoteForm = {
  nome: "",
  descricao: "",
  preco: 0,
  tipo: "externo",
  linkCompra: "",
  cursoIds: [],
};

function PacoteEditor({
  inicial,
  cursos,
  onSalvar,
  onCancelar,
}: {
  inicial: PacoteForm;
  cursos: Curso[];
  onSalvar: (dados: PacoteForm) => void;
  onCancelar: () => void;
}) {
  const [form, setForm] = useState<PacoteForm>(inicial);
  const set = (campo: keyof PacoteForm, valor: unknown) =>
    setForm((p) => ({ ...p, [campo]: valor }));

  const toggleCurso = (id: string) => {
    setForm((p) => ({
      ...p,
      cursoIds: p.cursoIds.includes(id)
        ? p.cursoIds.filter((x) => x !== id)
        : [...p.cursoIds, id],
    }));
  };

  const cursosAtivos = cursos.filter((c) => c.ativo);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Nome */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Nome do pacote *</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.nome}
            onChange={(e) => set("nome", e.target.value)}
            placeholder="Ex: Pacote CCA Completo"
          />
        </div>

        {/* Descrição */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição</label>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Descreva o que está incluído no pacote"
          />
        </div>

        {/* Preço */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Preço do pacote (R$) *</label>
          <input
            type="number"
            min={0}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.preco}
            onChange={(e) => set("preco", Number(e.target.value))}
          />
        </div>

        {/* Tipo do pacote: interno x externo */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Onde compra este pacote? *</label>
          <div className="flex gap-2">
            <label className={`flex-1 flex items-center gap-1.5 cursor-pointer p-2 rounded-lg border-2 text-xs font-medium transition-colors ${form.tipo === "interno" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}>
              <input type="radio" checked={form.tipo === "interno"} onChange={() => set("tipo", "interno" as TipoCurso)} className="w-3.5 h-3.5 accent-blue-600" />
              Interno
            </label>
            <label className={`flex-1 flex items-center gap-1.5 cursor-pointer p-2 rounded-lg border-2 text-xs font-medium transition-colors ${form.tipo === "externo" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}>
              <input type="radio" checked={form.tipo === "externo"} onChange={() => set("tipo", "externo" as TipoCurso)} className="w-3.5 h-3.5 accent-blue-600" />
              Externo
            </label>
          </div>
        </div>

        {/* Link de compra — só para pacote externo */}
        {form.tipo === "externo" && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Link de compra do pacote *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.linkCompra}
              onChange={(e) => set("linkCompra", e.target.value)}
              placeholder="https://hotmart.com/produto/..."
            />
          </div>
        )}

        {/* Cursos incluídos */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Cursos incluídos no pacote</label>
          <div className="grid sm:grid-cols-2 gap-2">
            {cursosAtivos.map((c) => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.cursoIds.includes(String(c.id))}
                  onChange={() => toggleCurso(String(c.id))}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700 line-clamp-1">{c.titulo}</span>
                <span className="ml-auto text-xs text-gray-400 shrink-0">
                  R$ {c.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </label>
            ))}
          </div>
          {form.cursoIds.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Preço individual somado: R$ {cursosAtivos
                .filter((c) => form.cursoIds.includes(String(c.id)))
                .reduce((s, c) => s + c.preco, 0)
                .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              {" "}— Economia: R$ {Math.max(0, cursosAtivos
                .filter((c) => form.cursoIds.includes(String(c.id)))
                .reduce((s, c) => s + c.preco, 0) - form.preco)
                .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={() => onSalvar(form)}
          disabled={!form.nome || (form.tipo === "externo" && !form.linkCompra)}
          className="flex items-center gap-2 bg-[#1e3a6e] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#162d55] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          <Save className="w-4 h-4" /> Salvar pacote
        </button>
        <button
          onClick={onCancelar}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          <X className="w-4 h-4" /> Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

type Aba = "cursos" | "pacotes";

export function AdminCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = async () => {
    try {
      const [{ cursos: c }, { pacotes: p }] = await Promise.all([
        adminApi.listarCursos() as Promise<{ cursos: any[] }>,
        adminApi.listarPacotes() as Promise<{ pacotes: any[] }>,
      ]);
      setCursos(c.map(cursoDaApiAdmin));
      setPacotes(p.map(pacoteDaApiAdmin));
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { recarregar(); }, []);

  const adicionarCurso = async (dados: CursoForm) => { await adminApi.criarCurso(cursoParaApiAdmin(dados)); await recarregar(); };
  const atualizarCurso = async (id: string | number, dados: Partial<Curso>) => {
    const atual = cursos.find((c) => c.id === id);
    await adminApi.editarCurso(Number(id), cursoParaApiAdmin({ ...atual, ...dados }));
    await recarregar();
  };
  const removerCurso = async (id: string | number) => { await adminApi.removerCurso(Number(id)); await recarregar(); };
  const adicionarPacote = async (dados: PacoteForm) => { await adminApi.criarPacote(pacoteParaApiAdmin(dados)); await recarregar(); };
  const atualizarPacote = async (id: string | number, dados: PacoteForm) => { await adminApi.editarPacote(Number(id), pacoteParaApiAdmin(dados)); await recarregar(); };
  const removerPacote = async (id: string | number) => { await adminApi.removerPacote(Number(id)); await recarregar(); };

  const [aba, setAba] = useState<Aba>("cursos");
  const [editandoCursoId, setEditandoCursoId] = useState<string | number | "novo" | null>(null);
  const [editandoPacoteId, setEditandoPacoteId] = useState<string | number | "novo" | null>(null);
  const [confirmarExcluir, setConfirmarExcluir] = useState<{ tipo: "curso" | "pacote"; id: string | number } | null>(null);

  // ── Cursos ────────────────────────────────────────────────────────────────

  const salvarCurso = (dados: CursoForm) => {
    if (editandoCursoId === "novo") {
      adicionarCurso(dados);
    } else if (editandoCursoId) {
      atualizarCurso(editandoCursoId, dados);
    }
    setEditandoCursoId(null);
  };

  const excluirCurso = (id: string | number) => {
    excluirCursoAsync(id);
  };
  const excluirCursoAsync = async (id: string | number) => {
    await removerCurso(id);
    setConfirmarExcluir(null);
  };

  // ── Pacotes ───────────────────────────────────────────────────────────────

  const salvarPacote = (dados: PacoteForm) => {
    if (editandoPacoteId === "novo") {
      adicionarPacote(dados);
    } else if (editandoPacoteId) {
      atualizarPacote(editandoPacoteId, dados);
    }
    setEditandoPacoteId(null);
  };

  const excluirPacote = (id: string | number) => {
    excluirPacoteAsync(id);
  };
  const excluirPacoteAsync = async (id: string | number) => {
    await removerPacote(id);
    setConfirmarExcluir(null);
  };

  if (carregando) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">Carregando cursos...</div>;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/novo-fluxo/admin">
          <a className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Painel Admin
          </a>
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="font-bold text-gray-900 text-lg">Gerenciar Cursos e Pacotes</h1>
        <Link href="/cursos" target="_blank">
          <a className="ml-auto flex items-center gap-1.5 text-xs text-blue-700 hover:underline font-medium">
            <Eye className="w-3.5 h-3.5" /> Ver página pública
          </a>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Abas */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
          {([
            { valor: "cursos" as Aba, label: "Cursos", icon: BookOpen, count: cursos.length },
            { valor: "pacotes" as Aba, label: "Pacotes", icon: Package, count: pacotes.length },
          ] as const).map(({ valor, label, icon: Icon, count }) => (
            <button
              key={valor}
              onClick={() => setAba(valor)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                aba === valor ? "bg-white text-[#1e3a6e] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${aba === valor ? "bg-[#1e3a6e]/10 text-[#1e3a6e]" : "bg-gray-200 text-gray-500"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── ABA CURSOS ─────────────────────────────────────────────────────── */}
        {aba === "cursos" && (
          <div className="space-y-4">
            {/* Botão novo */}
            {editandoCursoId !== "novo" && (
              <button
                onClick={() => setEditandoCursoId("novo")}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Plus className="w-4 h-4" /> Adicionar novo curso
              </button>
            )}

            {/* Formulário novo curso */}
            {editandoCursoId === "novo" && (
              <CursoEditor
                inicial={cursoVazio}
                onSalvar={salvarCurso}
                onCancelar={() => setEditandoCursoId(null)}
              />
            )}

            {/* Lista de cursos */}
            {cursos.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum curso cadastrado</p>
                <p className="text-sm mt-1">Clique em "Adicionar novo curso" para começar</p>
              </div>
            ) : (
              cursos.map((curso) => (
                <div key={curso.id}>
                  {editandoCursoId === curso.id ? (
                    <CursoEditor
                      inicial={curso}
                      onSalvar={salvarCurso}
                      onCancelar={() => setEditandoCursoId(null)}
                    />
                  ) : (
                    <div className={`bg-white rounded-2xl border shadow-sm p-5 flex gap-4 items-start ${!curso.ativo ? "opacity-60" : ""}`}>
                      {/* Cor categoria */}
                      <div
                        className="w-1.5 self-stretch rounded-full shrink-0"
                        style={{ background: categoriaCor[curso.categoria] }}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-gray-900 text-sm">{curso.titulo}</h3>
                          {curso.destaque && (
                            <span className="flex items-center gap-0.5 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3" /> Destaque
                            </span>
                          )}
                          {!curso.ativo && (
                            <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">Inativo</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{curso.descricaoBreve}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {curso.categoria}</span>
                          <span className="flex items-center gap-1"><BarChart2 className="w-3 h-3" /> {curso.nivel}</span>
                          {curso.duracao && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {curso.duracao}</span>}
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />
                            {curso.preco === 0 ? "Gratuito" : `R$ ${curso.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                          </span>
                          {curso.linkCompra && curso.linkCompra !== "#" && (
                            <a href={curso.linkCompra} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                              <LinkIcon className="w-3 h-3" /> Link de compra
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => atualizarCurso(curso.id, { ativo: !curso.ativo })}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title={curso.ativo ? "Desativar" : "Ativar"}
                        >
                          {curso.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditandoCursoId(curso.id)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-700 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmarExcluir({ tipo: "curso", id: curso.id })}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── ABA PACOTES ────────────────────────────────────────────────────── */}
        {aba === "pacotes" && (
          <div className="space-y-4">
            {editandoPacoteId !== "novo" && (
              <button
                onClick={() => setEditandoPacoteId("novo")}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Plus className="w-4 h-4" /> Adicionar novo pacote
              </button>
            )}

            {editandoPacoteId === "novo" && (
              <PacoteEditor
                inicial={pacoteVazio}
                cursos={cursos}
                onSalvar={salvarPacote}
                onCancelar={() => setEditandoPacoteId(null)}
              />
            )}

            {pacotes.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum pacote cadastrado</p>
              </div>
            ) : (
              pacotes.map((pacote) => {
                const cursosIncluidos = cursos.filter((c) => pacote.cursoIds.includes(String(c.id)));
                return (
                  <div key={pacote.id}>
                    {editandoPacoteId === pacote.id ? (
                      <PacoteEditor
                        inicial={pacote}
                        cursos={cursos}
                        onSalvar={salvarPacote}
                        onCancelar={() => setEditandoPacoteId(null)}
                      />
                    ) : (
                      <div className="bg-white rounded-2xl border shadow-sm p-5 flex gap-4 items-start">
                        <div className="w-1.5 self-stretch rounded-full shrink-0 bg-amber-400" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-amber-500" />
                            <h3 className="font-bold text-gray-900 text-sm">{pacote.nome}</h3>
                          </div>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-1">{pacote.descricao}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              R$ {pacote.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                            <span>{cursosIncluidos.length} curso(s) incluído(s)</span>
                            {pacote.linkCompra && pacote.linkCompra !== "#" && (
                              <a href={pacote.linkCompra} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                <LinkIcon className="w-3 h-3" /> Link de compra
                              </a>
                            )}
                          </div>
                          {cursosIncluidos.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {cursosIncluidos.map((c) => (
                                <span key={c.id} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{c.titulo}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setEditandoPacoteId(pacote.id)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-700 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmarExcluir({ tipo: "pacote", id: pacote.id })}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {confirmarExcluir && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 mb-2">Confirmar exclusão</h3>
            <p className="text-gray-500 text-sm mb-5">
              Tem certeza que deseja excluir este {confirmarExcluir.tipo === "curso" ? "curso" : "pacote"}? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  confirmarExcluir.tipo === "curso"
                    ? excluirCurso(confirmarExcluir.id)
                    : excluirPacote(confirmarExcluir.id)
                }
                className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm"
              >
                Excluir
              </button>
              <button
                onClick={() => setConfirmarExcluir(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
