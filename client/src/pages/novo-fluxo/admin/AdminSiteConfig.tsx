import React, { useState } from "react";
import { useLocation } from "wouter";
import { useSiteConfig, SiteConfig, FAQItem, DEFAULT_CONFIG } from "@/contexts/SiteConfigContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft, Save, RotateCcw, Globe, Star, FileText,
  HelpCircle, Megaphone, AlertCircle, Layers, Plus, Trash2,
  CheckCircle, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Tipos de aba ──────────────────────────────────────────────────────────────

type Tab = "hero" | "comoFunciona" | "edital" | "faq" | "ctaFinal" | "rodape" | "aviso";

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "hero",          label: "Hero",          icon: Star,        desc: "Título, subtítulo e CTAs da seção principal" },
  { id: "comoFunciona",  label: "Como funciona", icon: Layers,      desc: "Título e etapas do processo" },
  { id: "edital",        label: "Edital",        icon: FileText,    desc: "Textos, período e link do PDF do edital" },
  { id: "faq",           label: "FAQ",           icon: HelpCircle,  desc: "Perguntas e respostas frequentes" },
  { id: "ctaFinal",      label: "CTA Final",     icon: Megaphone,   desc: "Seção de chamada para ação no rodapé" },
  { id: "rodape",        label: "Rodapé",        icon: Globe,       desc: "Descrição da organização e copyright" },
  { id: "aviso",         label: "Aviso",         icon: AlertCircle, desc: "Banner de aviso sobre cursos" },
];

// ─── Componentes auxiliares ────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">{label}</Label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="rounded-xl"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
    />
  );
}

// ─── Seções de edição ──────────────────────────────────────────────────────────

function HeroEditor({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
  const h = config.hero;
  const set = (field: keyof typeof h, value: string) =>
    onChange({ ...config, hero: { ...h, [field]: value } });

  return (
    <div className="space-y-5">
      <Field label="Badge (texto da pílula acima do título)" hint="Texto pequeno exibido com estrela antes do título principal">
        <TextInput value={h.badge} onChange={(v) => set("badge", v)} placeholder="Ex: Programa oficial de certificação profissional" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Título (linha 1)">
          <TextInput value={h.titulo} onChange={(v) => set("titulo", v)} placeholder="Ex: Certifique sua" />
        </Field>
        <Field label="Palavra em destaque (amarela)" hint="Exibida em amarelo/dourado">
          <TextInput value={h.tituloDestaque} onChange={(v) => set("tituloDestaque", v)} placeholder="Ex: excelência" />
        </Field>
      </div>
      <Field label="Subtítulo / Descrição">
        <TextArea value={h.subtitulo} onChange={(v) => set("subtitulo", v)} placeholder="Texto descritivo abaixo do título..." rows={2} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Botão primário (branco)">
          <TextInput value={h.ctaPrimario} onChange={(v) => set("ctaPrimario", v)} placeholder="Ex: Ver certificações disponíveis" />
        </Field>
        <Field label="Botão secundário (transparente)">
          <TextInput value={h.ctaSecundario} onChange={(v) => set("ctaSecundario", v)} placeholder="Ex: Acessar edital" />
        </Field>
      </div>
      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Estatísticas (abaixo dos botões)</p>
        <div className="grid grid-cols-3 gap-3">
          {(["stat1Label", "stat2Label", "stat3Label"] as const).map((key, i) => (
            <Field key={key} label={`Estatística ${i + 1}`}>
              <TextInput value={h[key]} onChange={(v) => set(key, v)} placeholder={`Ex: certificações disponíveis`} />
            </Field>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Os valores numéricos são calculados automaticamente pelo sistema.</p>
      </div>
    </div>
  );
}

function ComoFuncionaEditor({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
  const cf = config.comoFunciona;
  const set = (field: keyof typeof cf, value: unknown) =>
    onChange({ ...config, comoFunciona: { ...cf, [field]: value } });

  function updateEtapa(index: number, field: "label" | "descricao", value: string) {
    const etapas = [...cf.etapas];
    etapas[index] = { ...etapas[index], [field]: value };
    set("etapas", etapas);
  }

  return (
    <div className="space-y-5">
      <Field label="Título da seção">
        <TextInput value={cf.titulo} onChange={(v) => set("titulo", v)} placeholder="Ex: Como funciona" />
      </Field>
      <Field label="Subtítulo">
        <TextArea value={cf.subtitulo} onChange={(v) => set("subtitulo", v)} rows={2} />
      </Field>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Etapas do processo (7 etapas fixas)</p>
        <div className="space-y-3">
          {cf.etapas.map((etapa, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs font-black">{i + 1}</span>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Nome</Label>
                  <TextInput value={etapa.label} onChange={(v) => updateEtapa(i, "label", v)} />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Descrição</Label>
                  <TextInput value={etapa.descricao} onChange={(v) => updateEtapa(i, "descricao", v)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditalEditor({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
  const e = config.edital;
  const set = (field: keyof typeof e, value: unknown) =>
    onChange({ ...config, edital: { ...e, [field]: value } });

  function updateInfoCard(index: number, field: "titulo" | "descricao", value: string) {
    const cards = [...e.infoCards];
    cards[index] = { ...cards[index], [field]: value };
    set("infoCards", cards);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Título do bloco do edital">
          <TextInput value={e.titulo} onChange={(v) => set("titulo", v)} />
        </Field>
        <Field label="Subtítulo">
          <TextInput value={e.subtitulo} onChange={(v) => set("subtitulo", v)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Período de inscrições">
          <TextInput value={e.periodoInscricoes} onChange={(v) => set("periodoInscricoes", v)} placeholder="Ex: 01/08 a 30/09/2025" />
        </Field>
        <Field label="Modalidade">
          <TextInput value={e.modalidade} onChange={(v) => set("modalidade", v)} placeholder="Ex: 100% online" />
        </Field>
      </div>
      <Field label="Texto descritivo do edital">
        <TextArea value={e.descricao} onChange={(v) => set("descricao", v)} rows={4} />
      </Field>
      <Field label="Link do PDF do edital" hint="URL completa do arquivo PDF para download">
        <TextInput value={e.linkPDF} onChange={(v) => set("linkPDF", v)} placeholder="https://..." />
      </Field>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Cards informativos (4 cards)</p>
        <div className="space-y-3">
          {e.infoCards.map((card, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3">
              <Field label={`Card ${i + 1} — Título`}>
                <TextInput value={card.titulo} onChange={(v) => updateInfoCard(i, "titulo", v)} />
              </Field>
              <Field label="Descrição">
                <TextInput value={card.descricao} onChange={(v) => updateInfoCard(i, "descricao", v)} />
              </Field>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FAQEditor({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
  const faq = config.faq;

  function setTitulo(v: string) {
    onChange({ ...config, faq: { ...faq, titulo: v } });
  }

  function updateItem(index: number, field: keyof FAQItem, value: string) {
    const items = [...faq.items];
    items[index] = { ...items[index], [field]: value };
    onChange({ ...config, faq: { ...faq, items } });
  }

  function addItem() {
    const newItem: FAQItem = {
      id: `faq-${Date.now()}`,
      pergunta: "",
      resposta: "",
    };
    onChange({ ...config, faq: { ...faq, items: [...faq.items, newItem] } });
  }

  function removeItem(index: number) {
    const items = faq.items.filter((_, i) => i !== index);
    onChange({ ...config, faq: { ...faq, items } });
  }

  return (
    <div className="space-y-5">
      <Field label="Título da seção FAQ">
        <TextInput value={faq.titulo} onChange={setTitulo} placeholder="Ex: Perguntas frequentes" />
      </Field>
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Perguntas e respostas ({faq.items.length})
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="rounded-xl text-xs h-8"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Adicionar pergunta
          </Button>
        </div>
        <div className="space-y-4">
          {faq.items.map((item, i) => (
            <div key={item.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                  Pergunta {i + 1}
                </span>
                <button
                  onClick={() => removeItem(i)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                <Field label="Pergunta">
                  <TextInput
                    value={item.pergunta}
                    onChange={(v) => updateItem(i, "pergunta", v)}
                    placeholder="Digite a pergunta..."
                  />
                </Field>
                <Field label="Resposta">
                  <TextArea
                    value={item.resposta}
                    onChange={(v) => updateItem(i, "resposta", v)}
                    placeholder="Digite a resposta completa..."
                    rows={3}
                  />
                </Field>
              </div>
            </div>
          ))}
          {faq.items.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma pergunta cadastrada</p>
              <Button variant="outline" size="sm" onClick={addItem} className="mt-3 rounded-xl">
                Adicionar primeira pergunta
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CTAFinalEditor({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
  const cta = config.ctaFinal;
  const set = (field: keyof typeof cta, value: string) =>
    onChange({ ...config, ctaFinal: { ...cta, [field]: value } });

  return (
    <div className="space-y-5">
      <Field label="Título">
        <TextInput value={cta.titulo} onChange={(v) => set("titulo", v)} placeholder="Ex: Pronto para certificar sua excelência?" />
      </Field>
      <Field label="Subtítulo / Descrição">
        <TextArea value={cta.subtitulo} onChange={(v) => set("subtitulo", v)} rows={3} />
      </Field>
      <Field label="Texto do botão">
        <TextInput value={cta.botaoLabel} onChange={(v) => set("botaoLabel", v)} placeholder="Ex: Ver certificações disponíveis" />
      </Field>
    </div>
  );
}

function RodapeEditor({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
  const r = config.rodape;
  const set = (field: keyof typeof r, value: string) =>
    onChange({ ...config, rodape: { ...r, [field]: value } });

  return (
    <div className="space-y-5">
      <Field label="Descrição da organização" hint="Texto exibido abaixo do logo no rodapé">
        <TextArea value={r.descricaoOrganizacao} onChange={(v) => set("descricaoOrganizacao", v)} rows={2} />
      </Field>
      <Field label="Texto de copyright" hint="Exibido na linha inferior do rodapé">
        <TextInput value={r.copyright} onChange={(v) => set("copyright", v)} placeholder="Ex: ANEFAC — Todos os direitos reservados." />
      </Field>
    </div>
  );
}

function AvisoEditor({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
  const a = config.aviso;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200">
        <div>
          <p className="text-sm font-bold text-amber-900">Banner de aviso</p>
          <p className="text-xs text-amber-700 mt-0.5">
            {a.visivel ? "Visível na landing page" : "Oculto na landing page"}
          </p>
        </div>
        <button
          onClick={() => onChange({ ...config, aviso: { ...a, visivel: !a.visivel } })}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
            a.visivel
              ? "bg-amber-600 text-white hover:bg-amber-700"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          )}
        >
          {a.visivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {a.visivel ? "Visível" : "Oculto"}
        </button>
      </div>
      <Field label="Texto do aviso">
        <TextArea
          value={a.texto}
          onChange={(v) => onChange({ ...config, aviso: { ...a, texto: v } })}
          rows={3}
          placeholder="Texto do banner de aviso..."
        />
      </Field>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export function AdminSiteConfig() {
  const [, navigate] = useLocation();
  const { config, salvarConfig, resetarConfig } = useSiteConfig();
  const [draft, setDraft] = useState<SiteConfig>({ ...config });
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    salvarConfig(draft);
    setSaved(true);
    toast.success("Configurações salvas com sucesso!");
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    if (!confirm("Tem certeza que deseja restaurar todas as configurações para o padrão?")) return;
    resetarConfig();
    setDraft({ ...DEFAULT_CONFIG });
    toast.info("Configurações restauradas para o padrão.");
  }

  const activeTabConfig = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl">Configurar Site</h1>
              <p className="text-blue-200 text-xs mt-0.5">Edite todos os textos e conteúdos da landing page</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 text-xs"
              onClick={() => navigate("/novo-fluxo/admin")}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:bg-white/10 text-xs"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Restaurar padrão
            </Button>
            <Button
              onClick={handleSave}
              className={cn(
                "font-bold text-xs shadow-md transition-all",
                saved
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-white text-blue-900 hover:bg-blue-50"
              )}
            >
              {saved ? (
                <><CheckCircle className="w-4 h-4 mr-1.5" />Salvo!</>
              ) : (
                <><Save className="w-4 h-4 mr-1.5" />Salvar alterações</>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de abas */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Seções</p>
              </div>
              <nav className="p-2">
                {TABS.map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all mb-1",
                      activeTab === id
                        ? "bg-blue-700 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 flex-shrink-0", activeTab === id ? "text-white" : "text-gray-400")} />
                    <div>
                      <p className={cn("text-sm font-semibold", activeTab === id ? "text-white" : "text-gray-900")}>
                        {label}
                      </p>
                      <p className={cn("text-xs leading-tight mt-0.5 hidden lg:block", activeTab === id ? "text-blue-200" : "text-gray-400")}>
                        {desc}
                      </p>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Preview link */}
            <button
              onClick={() => navigate("/")}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all"
            >
              <Eye className="w-4 h-4" />
              Ver site ao vivo
            </button>
          </div>

          {/* Editor principal */}
          <div className="flex-1">
            <Card className="border-0 shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                  <activeTabConfig.icon className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900">{activeTabConfig.label}</h2>
                  <p className="text-xs text-gray-400">{activeTabConfig.desc}</p>
                </div>
              </div>
              <CardContent className="p-6">
                {activeTab === "hero" && (
                  <HeroEditor config={draft} onChange={setDraft} />
                )}
                {activeTab === "comoFunciona" && (
                  <ComoFuncionaEditor config={draft} onChange={setDraft} />
                )}
                {activeTab === "edital" && (
                  <EditalEditor config={draft} onChange={setDraft} />
                )}
                {activeTab === "faq" && (
                  <FAQEditor config={draft} onChange={setDraft} />
                )}
                {activeTab === "ctaFinal" && (
                  <CTAFinalEditor config={draft} onChange={setDraft} />
                )}
                {activeTab === "rodape" && (
                  <RodapeEditor config={draft} onChange={setDraft} />
                )}
                {activeTab === "aviso" && (
                  <AvisoEditor config={draft} onChange={setDraft} />
                )}
              </CardContent>
            </Card>

            {/* Save bar */}
            <div className="mt-4 flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
              <p className="text-xs text-gray-400">
                As alterações são aplicadas imediatamente após salvar.
              </p>
              <Button
                onClick={handleSave}
                className={cn(
                  "font-bold text-sm transition-all",
                  saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-700 hover:bg-blue-800"
                )}
              >
                {saved ? (
                  <><CheckCircle className="w-4 h-4 mr-2" />Salvo!</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />Salvar alterações</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
