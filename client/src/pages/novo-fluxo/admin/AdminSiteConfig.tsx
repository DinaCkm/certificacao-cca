import React, { useState } from "react";
import { Link } from "wouter";
import { useSiteConfig, DEFAULT_CONFIG, SiteConfig } from "@/contexts/SiteConfigContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Home, Award, HelpCircle, BookOpen, FlaskConical, LayoutDashboard,
  Save, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp, ArrowLeft, CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

type Aba = "hero" | "institucional" | "como-funciona" | "simulacao" | "faq" | "rodape";

const ABAS: { id: Aba; label: string; icon: React.ElementType }[] = [
  { id: "hero", label: "Página inicial", icon: Home },
  { id: "institucional", label: "Institucional", icon: Award },
  { id: "como-funciona", label: "Como funciona", icon: BookOpen },
  { id: "simulacao", label: "Simulação", icon: FlaskConical },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "rodape", label: "Rodapé", icon: LayoutDashboard },
];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function TInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="rounded-xl"
    />
  );
}

function TArea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
    />
  );
}

export function AdminSiteConfig() {
  const { config, salvarConfig, resetarConfig } = useSiteConfig();
  const [draft, setDraft] = useState<SiteConfig>(JSON.parse(JSON.stringify(config)));
  const [abaAtiva, setAbaAtiva] = useState<Aba>("hero");
  const [questaoExp, setQuestaoExp] = useState<number | null>(null);
  const [etapaExp, setEtapaExp] = useState<number | null>(null);
  const [salvo, setSalvo] = useState(false);

  const update = (path: string, value: unknown) => {
    setDraft((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj: Record<string, unknown> = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]] as Record<string, unknown>;
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSalvar = () => {
    salvarConfig(draft);
    setSalvo(true);
    toast.success("Configurações salvas com sucesso!");
    setTimeout(() => setSalvo(false), 3000);
  };

  const handleResetar = () => {
    if (!confirm("Restaurar todos os valores padrão? Esta ação não pode ser desfeita.")) return;
    resetarConfig();
    setDraft(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
    toast.info("Configurações restauradas para o padrão.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/novo-fluxo/admin">
              <a className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Admin
              </a>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-bold text-gray-900">Configurar Site</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleResetar} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <RotateCcw className="w-4 h-4" />
              Restaurar padrão
            </button>
            <button
              onClick={handleSalvar}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg text-white transition-all"
              style={{ background: salvo ? "#16a34a" : "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}
            >
              {salvo ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {salvo ? "Salvo!" : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar */}
        <div className="w-52 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
            {ABAS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAbaAtiva(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                  abaAtiva === id ? "bg-blue-50 text-blue-800 border-l-4 border-l-blue-700" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">

          {/* ── HERO ── */}
          {abaAtiva === "hero" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-bold text-gray-900 text-lg">Seção Hero — topo da página inicial</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Badge (texto da pílula)" hint="Aparece com estrela acima do título">
                    <TInput value={draft.hero.badge} onChange={(v) => update("hero.badge", v)} />
                  </Field>
                  <Field label="Título (parte normal)">
                    <TInput value={draft.hero.titulo} onChange={(v) => update("hero.titulo", v)} placeholder="Ex: Certifique sua" />
                  </Field>
                  <Field label="Destaque do título (em amarelo)">
                    <TInput value={draft.hero.tituloDestaque} onChange={(v) => update("hero.tituloDestaque", v)} placeholder="Ex: excelência profissional" />
                  </Field>
                  <Field label="Subtítulo">
                    <TArea value={draft.hero.subtitulo} onChange={(v) => update("hero.subtitulo", v)} rows={2} />
                  </Field>
                  <Field label="Botão principal">
                    <TInput value={draft.hero.ctaPrimario} onChange={(v) => update("hero.ctaPrimario", v)} />
                  </Field>
                  <Field label="Botão secundário">
                    <TInput value={draft.hero.ctaSecundario} onChange={(v) => update("hero.ctaSecundario", v)} />
                  </Field>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Estatísticas (3 números)</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-4 bg-gray-50 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Estatística {n}</p>
                      <Field label="Valor">
                        <TInput value={(draft.hero as unknown as Record<string, string>)[`stat${n}Valor`] || ""} onChange={(v) => update(`hero.stat${n}Valor`, v)} placeholder="Ex: 4+" />
                      </Field>
                      <Field label="Legenda">
                        <TInput value={(draft.hero as unknown as Record<string, string>)[`stat${n}Label`] || ""} onChange={(v) => update(`hero.stat${n}Label`, v)} placeholder="Ex: certificações" />
                      </Field>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── INSTITUCIONAL ── */}
          {abaAtiva === "institucional" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900 text-lg">Seção Institucional</h2>
              <Field label="Título da seção">
                <TInput value={draft.institucional?.titulo || ""} onChange={(v) => update("institucional.titulo", v)} />
              </Field>
              <Field label="Subtítulo">
                <TArea value={draft.institucional?.subtitulo || ""} onChange={(v) => update("institucional.subtitulo", v)} />
              </Field>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Cards de destaque</p>
                <div className="space-y-4">
                  {(draft.institucional?.cards || []).map((card, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Card {i + 1}</p>
                      <Field label="Título">
                        <TInput value={card.titulo} onChange={(v) => {
                          const cards = [...(draft.institucional?.cards || [])];
                          cards[i] = { ...cards[i], titulo: v };
                          update("institucional.cards", cards);
                        }} />
                      </Field>
                      <Field label="Texto">
                        <TArea value={card.texto} onChange={(v) => {
                          const cards = [...(draft.institucional?.cards || [])];
                          cards[i] = { ...cards[i], texto: v };
                          update("institucional.cards", cards);
                        }} rows={2} />
                      </Field>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── COMO FUNCIONA ── */}
          {abaAtiva === "como-funciona" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-bold text-gray-900 text-lg">Cabeçalho da página</h2>
                <Field label="Título">
                  <TInput value={draft.comoFunciona.titulo} onChange={(v) => update("comoFunciona.titulo", v)} />
                </Field>
                <Field label="Subtítulo">
                  <TArea value={draft.comoFunciona.subtitulo} onChange={(v) => update("comoFunciona.subtitulo", v)} />
                </Field>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-900">Etapas do processo</h2>
                  <Button variant="outline" size="sm" onClick={() => {
                    const etapas = [...(draft.comoFunciona.etapas as unknown as Array<Record<string, string>>)];
                    etapas.push({ numero: String(etapas.length + 1).padStart(2, "0"), titulo: "Nova etapa", descricao: "Descrição da etapa." });
                    update("comoFunciona.etapas", etapas);
                  }} className="rounded-xl text-xs h-8">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar etapa
                  </Button>
                </div>
                <div className="space-y-3">
                  {(draft.comoFunciona.etapas as unknown as Array<Record<string, string>>).map((etapa, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => setEtapaExp(etapaExp === i ? null : i)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <span className="flex items-center gap-3">
                          <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-xs font-bold">{etapa.numero}</span>
                          {etapa.titulo || etapa.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); const arr = (draft.comoFunciona.etapas as unknown as Array<Record<string, string>>).filter((_, j) => j !== i); update("comoFunciona.etapas", arr); }}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {etapaExp === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>
                      {etapaExp === i && (
                        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Field label="Número (ex: 01)">
                              <TInput value={etapa.numero} onChange={(v) => { const arr = [...(draft.comoFunciona.etapas as unknown as Array<Record<string, string>>)]; arr[i] = { ...arr[i], numero: v }; update("comoFunciona.etapas", arr); }} />
                            </Field>
                            <Field label="Título">
                              <TInput value={etapa.titulo || etapa.label || ""} onChange={(v) => { const arr = [...(draft.comoFunciona.etapas as unknown as Array<Record<string, string>>)]; arr[i] = { ...arr[i], titulo: v, label: v }; update("comoFunciona.etapas", arr); }} />
                            </Field>
                          </div>
                          <Field label="Descrição">
                            <TArea value={etapa.descricao} onChange={(v) => { const arr = [...(draft.comoFunciona.etapas as unknown as Array<Record<string, string>>)]; arr[i] = { ...arr[i], descricao: v }; update("comoFunciona.etapas", arr); }} />
                          </Field>
                          <Field label="Nota de destaque (opcional)" hint="Aparece como caixa azul abaixo da descrição">
                            <TInput value={etapa.nota || ""} onChange={(v) => { const arr = [...(draft.comoFunciona.etapas as unknown as Array<Record<string, string>>)]; arr[i] = { ...arr[i], nota: v }; update("comoFunciona.etapas", arr); }} placeholder="Ex: Inclui: análise + prova/entrevista" />
                          </Field>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-bold text-gray-900">Caminhos A e B</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-3 p-4 bg-green-50 rounded-xl">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Caminho A</p>
                    <Field label="Título">
                      <TInput value={(draft.comoFunciona as unknown as Record<string, string>).caminhoATitulo || ""} onChange={(v) => update("comoFunciona.caminhoATitulo", v)} />
                    </Field>
                    <Field label="Descrição">
                      <TArea value={(draft.comoFunciona as unknown as Record<string, string>).caminhoADescricao || ""} onChange={(v) => update("comoFunciona.caminhoADescricao", v)} />
                    </Field>
                  </div>
                  <div className="space-y-3 p-4 bg-orange-50 rounded-xl">
                    <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Caminho B</p>
                    <Field label="Título">
                      <TInput value={(draft.comoFunciona as unknown as Record<string, string>).caminhoBTitulo || ""} onChange={(v) => update("comoFunciona.caminhoBTitulo", v)} />
                    </Field>
                    <Field label="Descrição">
                      <TArea value={(draft.comoFunciona as unknown as Record<string, string>).caminhoBDescricao || ""} onChange={(v) => update("comoFunciona.caminhoBDescricao", v)} />
                    </Field>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SIMULAÇÃO ── */}
          {abaAtiva === "simulacao" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-bold text-gray-900 text-lg">Configurações gerais</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Título da página">
                    <TInput value={draft.simulacao?.titulo || ""} onChange={(v) => update("simulacao.titulo", v)} />
                  </Field>
                  <Field label="Subtítulo">
                    <TInput value={draft.simulacao?.subtitulo || ""} onChange={(v) => update("simulacao.subtitulo", v)} />
                  </Field>
                  <Field label="% mínimo para Avançado" hint="Ex: 80 = 80%">
                    <input type="number" min={0} max={100} value={draft.simulacao?.nivelAvancadoMin ?? 80}
                      onChange={(e) => update("simulacao.nivelAvancadoMin", Number(e.target.value))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </Field>
                  <Field label="% mínimo para Intermediário">
                    <input type="number" min={0} max={100} value={draft.simulacao?.nivelIntermediarioMin ?? 60}
                      onChange={(e) => update("simulacao.nivelIntermediarioMin", Number(e.target.value))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </Field>
                  <Field label="Texto para nível Avançado">
                    <TArea value={draft.simulacao?.nivelAvancadoTexto || ""} onChange={(v) => update("simulacao.nivelAvancadoTexto", v)} rows={2} />
                  </Field>
                  <Field label="Texto para nível Intermediário">
                    <TArea value={draft.simulacao?.nivelIntermediarioTexto || ""} onChange={(v) => update("simulacao.nivelIntermediarioTexto", v)} rows={2} />
                  </Field>
                  <Field label="Texto para nível Iniciante">
                    <TArea value={draft.simulacao?.nivelInicianteTexto || ""} onChange={(v) => update("simulacao.nivelInicianteTexto", v)} rows={2} />
                  </Field>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-900">Questões ({draft.simulacao?.questoes?.length || 0})</h2>
                  <Button variant="outline" size="sm" onClick={() => {
                    const qs = [...(draft.simulacao?.questoes || [])];
                    qs.push({ id: Date.now(), area: "Nova área", enunciado: "Enunciado da questão", opcoes: ["Opção A", "Opção B", "Opção C", "Opção D"], correta: 0, explicacao: "Explicação." });
                    update("simulacao.questoes", qs);
                  }} className="rounded-xl text-xs h-8">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar questão
                  </Button>
                </div>
                <div className="space-y-3">
                  {(draft.simulacao?.questoes || []).map((q, qi) => (
                    <div key={q.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => setQuestaoExp(questaoExp === qi ? null : qi)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <span className="flex items-center gap-3 text-left">
                          <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">{qi + 1}</span>
                          <span className="truncate max-w-xs">{q.enunciado}</span>
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{q.area}</span>
                          <button onClick={(e) => { e.stopPropagation(); update("simulacao.questoes", (draft.simulacao?.questoes || []).filter((_, j) => j !== qi)); }}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {questaoExp === qi ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>
                      {questaoExp === qi && (
                        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Field label="Área temática">
                              <TInput value={q.area} onChange={(v) => { const qs = [...(draft.simulacao?.questoes || [])]; qs[qi] = { ...qs[qi], area: v }; update("simulacao.questoes", qs); }} />
                            </Field>
                            <Field label="Resposta correta">
                              <select value={q.correta} onChange={(e) => { const qs = [...(draft.simulacao?.questoes || [])]; qs[qi] = { ...qs[qi], correta: Number(e.target.value) }; update("simulacao.questoes", qs); }}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {q.opcoes.map((_, oi) => <option key={oi} value={oi}>Opção {String.fromCharCode(65 + oi)}</option>)}
                              </select>
                            </Field>
                          </div>
                          <Field label="Enunciado">
                            <TArea value={q.enunciado} onChange={(v) => { const qs = [...(draft.simulacao?.questoes || [])]; qs[qi] = { ...qs[qi], enunciado: v }; update("simulacao.questoes", qs); }} />
                          </Field>
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Opções de resposta</p>
                            <div className="space-y-2">
                              {q.opcoes.map((op, oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${oi === q.correta ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                    {String.fromCharCode(65 + oi)}
                                  </span>
                                  <TInput value={op} onChange={(v) => { const qs = [...(draft.simulacao?.questoes || [])]; const opcoes = [...qs[qi].opcoes]; opcoes[oi] = v; qs[qi] = { ...qs[qi], opcoes }; update("simulacao.questoes", qs); }} />
                                  {oi === q.correta && <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />}
                                </div>
                              ))}
                            </div>
                          </div>
                          <Field label="Explicação da resposta correta">
                            <TArea value={q.explicacao} onChange={(v) => { const qs = [...(draft.simulacao?.questoes || [])]; qs[qi] = { ...qs[qi], explicacao: v }; update("simulacao.questoes", qs); }} />
                          </Field>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── FAQ ── */}
          {abaAtiva === "faq" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-lg">Perguntas Frequentes</h2>
                <Button variant="outline" size="sm" onClick={() => {
                  update("faq.items", [...draft.faq.items, { id: `faq-${Date.now()}`, pergunta: "Nova pergunta", resposta: "Resposta aqui." }]);
                }} className="rounded-xl text-xs h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                </Button>
              </div>
              <Field label="Título da seção">
                <TInput value={draft.faq.titulo} onChange={(v) => update("faq.titulo", v)} />
              </Field>
              <div className="space-y-3">
                {draft.faq.items.map((item, i) => (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">Pergunta {i + 1}</span>
                      <button onClick={() => update("faq.items", draft.faq.items.filter((_, j) => j !== i))}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Field label="Pergunta">
                      <TInput value={item.pergunta} onChange={(v) => { const items = [...draft.faq.items]; items[i] = { ...items[i], pergunta: v }; update("faq.items", items); }} />
                    </Field>
                    <Field label="Resposta">
                      <TArea value={item.resposta} onChange={(v) => { const items = [...draft.faq.items]; items[i] = { ...items[i], resposta: v }; update("faq.items", items); }} rows={3} />
                    </Field>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RODAPÉ ── */}
          {abaAtiva === "rodape" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-bold text-gray-900 text-lg">Rodapé</h2>
                <Field label="Descrição da organização">
                  <TArea value={draft.rodape.descricaoOrganizacao} onChange={(v) => update("rodape.descricaoOrganizacao", v)} />
                </Field>
                <Field label="Texto de copyright">
                  <TInput value={draft.rodape.copyright} onChange={(v) => update("rodape.copyright", v)} />
                </Field>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Aviso / Banner informativo</h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm text-gray-600">Visível no site</span>
                    <input type="checkbox" checked={draft.aviso.visivel} onChange={(e) => update("aviso.visivel", e.target.checked)} className="w-4 h-4 accent-blue-700" />
                  </label>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">Este aviso aparece em destaque no site informando que cursos não garantem aprovação.</p>
                </div>
                <Field label="Texto do aviso">
                  <TArea value={draft.aviso.texto} onChange={(v) => update("aviso.texto", v)} rows={3} />
                </Field>
              </div>
            </div>
          )}

          {/* Save at bottom */}
          <div className="flex justify-end pt-2 pb-8">
            <button onClick={handleSalvar}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all"
              style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>
              <Save className="w-4 h-4" />
              Salvar alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
