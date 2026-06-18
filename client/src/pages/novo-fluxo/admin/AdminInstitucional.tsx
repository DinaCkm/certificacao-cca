import React, { useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, Save, Plus, Trash2, User, FileText, BookOpen, Shield,
  ChevronDown, ChevronUp, ExternalLink, RotateCcw
} from "lucide-react";
import {
  useInstitucional,
  MembroComite,
  DEFAULT_INSTITUCIONAL,
} from "@/contexts/InstitucionalContext";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DocumentoEditor({
  titulo,
  icon: Icon,
  conteudo,
  urlExterna,
  onChange,
}: {
  titulo: string;
  icon: React.ElementType;
  conteudo: string;
  urlExterna?: string;
  onChange: (conteudo: string, urlExterna?: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-700" />
          </div>
          <span className="font-bold text-gray-900">{titulo}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Link externo (PDF ou URL — opcional)
            </label>
            <input
              type="url"
              value={urlExterna ?? ""}
              onChange={(e) => onChange(conteudo, e.target.value || undefined)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Se preenchido, o botão abrirá este link em vez do modal de texto.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Conteúdo do documento (texto completo)
            </label>
            <textarea
              value={conteudo}
              onChange={(e) => onChange(e.target.value, urlExterna)}
              rows={20}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Cole ou edite o texto completo do documento aqui..."
            />
            <p className="text-xs text-gray-400 mt-1">Suporta formatação básica com **negrito** e *itálico*.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminInstitucional() {
  const { institucional, salvarInstitucional, resetarInstitucional } = useInstitucional();
  const [comite, setComite] = useState<MembroComite[]>(institucional.comite);
  const [regulamento, setRegulamento] = useState(institucional.regulamento);
  const [edital, setEdital] = useState(institucional.edital);
  const [codigoConduta, setCodigoConduta] = useState(institucional.codigoConduta);
  const [saved, setSaved] = useState(false);
  const [expandedMembro, setExpandedMembro] = useState<string | null>(null);

  function handleSave() {
    salvarInstitucional({ comite, regulamento, edital, codigoConduta });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    if (!confirm("Tem certeza? Isso restaurará todos os textos e membros para os valores padrão.")) return;
    resetarInstitucional();
    setComite(DEFAULT_INSTITUCIONAL.comite);
    setRegulamento(DEFAULT_INSTITUCIONAL.regulamento);
    setEdital(DEFAULT_INSTITUCIONAL.edital);
    setCodigoConduta(DEFAULT_INSTITUCIONAL.codigoConduta);
  }

  function addMembro() {
    const novo: MembroComite = {
      id: uid(),
      nome: "",
      cargo: "",
      miniCurriculo: "",
      fotoUrl: "",
      linkedin: "",
    };
    setComite([...comite, novo]);
    setExpandedMembro(novo.id);
  }

  function updateMembro(id: string, field: keyof MembroComite, value: string) {
    setComite(comite.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  function removeMembro(id: string) {
    if (!confirm("Remover este membro do comitê?")) return;
    setComite(comite.filter((m) => m.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/novo-fluxo/admin">
              <a className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </a>
            </Link>
            <div>
              <h1 className="text-lg font-black text-gray-900">Documentos & Comitê</h1>
              <p className="text-xs text-gray-400">Gerencie os documentos institucionais e os membros do comitê</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar padrão
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 text-sm font-bold text-white px-5 py-2 rounded-xl transition-all"
              style={{ background: saved ? "#16a34a" : "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}
            >
              <Save className="w-4 h-4" />
              {saved ? "Salvo!" : "Salvar tudo"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* ── Comitê de Certificação ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">Comitê de Certificação</h2>
              <p className="text-sm text-gray-500 mt-0.5">Membros exibidos na seção pública "Avaliação por especialistas"</p>
            </div>
            <button
              onClick={addMembro}
              className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl"
              style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}
            >
              <Plus className="w-4 h-4" />
              Adicionar membro
            </button>
          </div>

          <div className="space-y-3">
            {comite.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedMembro(expandedMembro === m.id ? null : m.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center shrink-0">
                    {m.fotoUrl ? (
                      <img src={m.fotoUrl} alt={m.nome} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{m.nome || "Novo membro"}</p>
                    <p className="text-xs text-gray-500 truncate">{m.cargo || "Cargo não definido"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {expandedMembro === m.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedMembro === m.id && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nome completo *</label>
                        <input
                          type="text"
                          value={m.nome}
                          onChange={(e) => updateMembro(m.id, "nome", e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Bolí Rosales"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Cargo / Função *</label>
                        <input
                          type="text"
                          value={m.cargo}
                          onChange={(e) => updateMembro(m.id, "cargo", e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: COO – Superintendente ANEFAC"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">URL da foto</label>
                        <input
                          type="url"
                          value={m.fotoUrl}
                          onChange={(e) => updateMembro(m.id, "fotoUrl", e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">LinkedIn</label>
                        <input
                          type="url"
                          value={m.linkedin}
                          onChange={(e) => updateMembro(m.id, "linkedin", e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mini currículo</label>
                        <textarea
                          value={m.miniCurriculo}
                          onChange={(e) => updateMembro(m.id, "miniCurriculo", e.target.value)}
                          rows={3}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Breve descrição do perfil e experiência do membro..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => removeMembro(m.id)}
                        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover membro
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Documentos Institucionais ── */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-black text-gray-900">Documentos Institucionais</h2>
            <p className="text-sm text-gray-500 mt-0.5">Textos exibidos nos modais da página pública ao clicar nos botões de documentos</p>
          </div>

          <div className="space-y-3">
            <DocumentoEditor
              titulo="Regulamento Geral"
              icon={BookOpen}
              conteudo={regulamento.conteudo}
              urlExterna={regulamento.urlExterna}
              onChange={(conteudo, urlExterna) => setRegulamento({ ...regulamento, conteudo, urlExterna })}
            />
            <DocumentoEditor
              titulo="Edital de Candidatura"
              icon={FileText}
              conteudo={edital.conteudo}
              urlExterna={edital.urlExterna}
              onChange={(conteudo, urlExterna) => setEdital({ ...edital, conteudo, urlExterna })}
            />
            <DocumentoEditor
              titulo="Código de Conduta"
              icon={Shield}
              conteudo={codigoConduta.conteudo}
              urlExterna={codigoConduta.urlExterna}
              onChange={(conteudo, urlExterna) => setCodigoConduta({ ...codigoConduta, conteudo, urlExterna })}
            />
          </div>
        </section>

        {/* Save button bottom */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 text-sm font-bold text-white px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
            style={{ background: saved ? "#16a34a" : "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}
          >
            <Save className="w-4 h-4" />
            {saved ? "Salvo com sucesso!" : "Salvar todas as alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
