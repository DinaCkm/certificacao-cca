import React, { useState } from "react";
import { useLocation } from "wouter";
import { useCertification, Certification, ComoFuncionaEtapa, ComoFuncionaContent } from "@/contexts/CertificationContext";
import {
  Award, Edit, Eye, Plus, CheckCircle, Clock, XCircle,
  ChevronLeft, Save, X, Trash2, Settings, AlertCircle, BookOpen, ChevronDown, ChevronUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/api";

const STATUS_CONFIG: Record<Certification["status"], {
  label: string; icon: React.ElementType; className: string; dot: string;
}> = {
  ativa:     { label: "Ativa",     icon: CheckCircle, className: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  em_breve:  { label: "Em breve",  icon: Clock,       className: "bg-amber-100 text-amber-800",    dot: "bg-amber-500" },
  inativa:   { label: "Inativa",   icon: XCircle,     className: "bg-gray-100 text-gray-600",      dot: "bg-gray-400" },
  encerrada: { label: "Encerrada", icon: XCircle,     className: "bg-red-100 text-red-800",        dot: "bg-red-500" },
};

const COR_OPTIONS = [
  { value: "blue",   label: "Azul",     cls: "bg-blue-500" },
  { value: "gold",   label: "Dourado",  cls: "bg-amber-500" },
  { value: "green",  label: "Verde",    cls: "bg-emerald-500" },
  { value: "purple", label: "Roxo",     cls: "bg-purple-500" },
  { value: "orange", label: "Laranja",  cls: "bg-orange-500" },
  { value: "teal",   label: "Teal",     cls: "bg-teal-500" },
  { value: "red",    label: "Vermelho", cls: "bg-red-500" },
];

const MAX_CERTS = 10;

const EMPTY_COMO_FUNCIONA: ComoFuncionaContent = {
  titulo: "",
  subtitulo: "",
  etapas: [],
  investimento: "",
  inclusoes: "",
  observacoes: "",
};

// ─── Editor de Etapas do Como Funciona ─────────────────────────────────────────

function EtapaEditor({
  etapas,
  onChange,
}: {
  etapas: ComoFuncionaEtapa[];
  onChange: (etapas: ComoFuncionaEtapa[]) => void;
}) {
  const [expandida, setExpandida] = useState<number | null>(null);

  function addEtapa() {
    const nova: ComoFuncionaEtapa = {
      numero: String(etapas.length + 1).padStart(2, "0"),
      titulo: `Etapa ${etapas.length + 1}`,
      descricao: "",
      nota: "",
    };
    onChange([...etapas, nova]);
    setExpandida(etapas.length);
  }

  function removeEtapa(i: number) {
    onChange(etapas.filter((_, j) => j !== i));
    setExpandida(null);
  }

  function updateEtapa(i: number, field: keyof ComoFuncionaEtapa, value: string) {
    const updated = etapas.map((e, j) => j === i ? { ...e, [field]: value } : e);
    onChange(updated);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Etapas do processo</Label>
        <button
          type="button"
          onClick={addEtapa}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar etapa
        </button>
      </div>

      {etapas.length === 0 && (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-sm text-gray-400">Nenhuma etapa cadastrada. Clique em "Adicionar etapa" para começar.</p>
        </div>
      )}

      <div className="space-y-2">
        {etapas.map((etapa, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandida(expandida === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="flex items-center gap-3">
                <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                  {etapa.numero}
                </span>
                <span className="truncate">{etapa.titulo || "Sem título"}</span>
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeEtapa(i); }}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {expandida === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {expandida === i && (
              <div className="px-4 pb-4 pt-3 border-t border-gray-100 space-y-3 bg-gray-50/50">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 mb-1 block">Número</Label>
                    <Input
                      value={etapa.numero}
                      onChange={(e) => updateEtapa(i, "numero", e.target.value)}
                      placeholder="01"
                      className="rounded-lg text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs font-semibold text-gray-600 mb-1 block">Título da etapa *</Label>
                    <Input
                      value={etapa.titulo}
                      onChange={(e) => updateEtapa(i, "titulo", e.target.value)}
                      placeholder="Ex: Análise Documental"
                      className="rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-600 mb-1 block">Descrição *</Label>
                  <textarea
                    value={etapa.descricao}
                    onChange={(e) => updateEtapa(i, "descricao", e.target.value)}
                    rows={3}
                    placeholder="Descreva o que acontece nesta etapa..."
                    className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Nota de destaque <span className="text-gray-400 font-normal">(opcional — aparece como caixa azul)</span>
                  </Label>
                  <Input
                    value={etapa.nota || ""}
                    onChange={(e) => updateEtapa(i, "nota", e.target.value)}
                    placeholder="Ex: Caminho A: entrevista direta. Caminho B: prova + entrevista."
                    className="rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modal de edição da certificação ───────────────────────────────────────────

type EditorTab = "dados" | "como-funciona";

function CertEditor({
  cert,
  onSave,
  onCancel,
}: {
  cert: Partial<Certification>;
  onSave: (c: Partial<Certification>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Certification>>(cert);
  const [abaAtiva, setAbaAtiva] = useState<EditorTab>("dados");

  function set(field: keyof Certification, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setListField(field: "competencias" | "preRequisitos" | "documentosExigidos", value: string) {
    const itens = value.split("\n").filter(Boolean);
    set(field, field === "documentosExigidos" ? itens.slice(0, 10) : itens);
  }

  function setCF(field: keyof ComoFuncionaContent, value: unknown) {
    setForm((prev) => ({
      ...prev,
      comoFunciona: {
        ...(prev.comoFunciona || EMPTY_COMO_FUNCIONA),
        [field]: value,
      },
    }));
  }

  const cf = form.comoFunciona || EMPTY_COMO_FUNCIONA;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-black text-gray-900">
                {cert.id ? `Editar Certificação ${cert.numero}` : "Nova Certificação"}
              </h2>
              <p className="text-xs text-gray-400">{cert.nome || "Preencha os dados da certificação"}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 shrink-0 bg-white">
          <button
            onClick={() => setAbaAtiva("dados")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors",
              abaAtiva === "dados"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <Settings className="w-4 h-4" />
            Dados da Certificação
          </button>
          <button
            onClick={() => setAbaAtiva("como-funciona")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors",
              abaAtiva === "como-funciona"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <BookOpen className="w-4 h-4" />
            Como Funciona
            {(!cf.etapas || cf.etapas.length === 0) && (
              <span className="ml-1 w-2 h-2 rounded-full bg-amber-400 inline-block" title="Não configurado" />
            )}
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* ── ABA: DADOS DA CERTIFICAÇÃO ── */}
          {abaAtiva === "dados" && (
            <div className="space-y-6">
              {/* Identificação */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Identificação</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Número *</Label>
                    <Input
                      type="number" min={1} max={10}
                      value={form.numero || ""}
                      onChange={(e) => set("numero", parseInt(e.target.value))}
                      placeholder="Ex: 1"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Status *</Label>
                    <select
                      value={form.status || "inativa"}
                      onChange={(e) => set("status", e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Nome da certificação *</Label>
                    <Input
                      value={form.nome || ""}
                      onChange={(e) => set("nome", e.target.value)}
                      placeholder="Ex: Certificação Controller Financeiro"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Subtítulo</Label>
                    <Input
                      value={form.subtitulo || ""}
                      onChange={(e) => set("subtitulo", e.target.value)}
                      placeholder="Ex: Nível Avançado"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Cor */}
              <div>
                <Label className="text-xs font-semibold text-gray-700 mb-3 block">Cor de destaque</Label>
                <div className="flex flex-wrap gap-2">
                  {COR_OPTIONS.map(({ value, label, cls }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set("cor", value)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all",
                        form.cor === value
                          ? "border-blue-500 bg-blue-50 text-blue-800"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      <span className={cn("w-3.5 h-3.5 rounded-full", cls)} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Conteúdo</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Descrição *</Label>
                    <textarea
                      value={form.descricao || ""}
                      onChange={(e) => set("descricao", e.target.value)}
                      rows={3}
                      placeholder="Descreva o objetivo e o escopo desta certificação..."
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Público-alvo *</Label>
                    <textarea
                      value={form.publicoAlvo || ""}
                      onChange={(e) => set("publicoAlvo", e.target.value)}
                      rows={2}
                      placeholder="Descreva o perfil profissional do candidato ideal..."
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Listas */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Requisitos e competências</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Competências avaliadas <span className="text-gray-400 font-normal">(uma por linha)</span>
                    </Label>
                    <textarea
                      value={(form.competencias || []).join("\n")}
                      onChange={(e) => setListField("competencias", e.target.value)}
                      rows={3}
                      placeholder={"Gestão financeira\nControle orçamentário\nAnálise de dados"}
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Pré-requisitos <span className="text-gray-400 font-normal">(um por linha)</span>
                    </Label>
                    <textarea
                      value={(form.preRequisitos || []).join("\n")}
                      onChange={(e) => setListField("preRequisitos", e.target.value)}
                      rows={3}
                      placeholder={"Graduação em área correlata\n5 anos de experiência\nCargo de liderança"}
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block flex items-center justify-between">
                      <span>Documentos exigidos <span className="text-gray-400 font-normal">(um por linha, máx. 10)</span></span>
                      <span className={cn(
                        "text-xs font-normal",
                        (form.documentosExigidos || []).length >= 10 ? "text-red-500 font-semibold" : "text-gray-400"
                      )}>
                        {(form.documentosExigidos || []).length}/10
                      </span>
                    </Label>
                    <textarea
                      value={(form.documentosExigidos || []).join("\n")}
                      onChange={(e) => setListField("documentosExigidos", e.target.value)}
                      rows={3}
                      placeholder={"Diploma de graduação\nCurrículo atualizado\nComprovante de experiência"}
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                    {(form.documentosExigidos || []).length >= 10 && (
                      <p className="text-xs text-red-500 mt-1">Limite máximo de 10 documentos atingido — linhas extras são ignoradas.</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Essa lista é o que o candidato realmente vê e precisa enviar na tela de Upload de Documentos.</p>
                  </div>
                </div>
              </div>

              {/* Imagem e Edital */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Imagem e Edital</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">URL da imagem de capa</Label>
                    <Input
                      value={form.imagemUrl || ""}
                      onChange={(e) => set("imagemUrl", e.target.value)}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="rounded-xl"
                    />
                    {form.imagemUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 h-32">
                        <img src={form.imagemUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Cole a URL de uma imagem para exibir no card da certificação.</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">URL do Edital (PDF)</Label>
                    <Input
                      value={form.editalUrl || ""}
                      onChange={(e) => set("editalUrl", e.target.value)}
                      placeholder="https://exemplo.com/edital.pdf"
                      className="rounded-xl"
                    />
                    <p className="text-xs text-gray-400 mt-1">Link do PDF do edital que será exibido na página da certificação.</p>
                  </div>
                </div>
              </div>

              {/* Taxas e caminho */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Taxas e avaliação</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Taxa de Análise (R$)</Label>
                    <Input
                      type="number" min={0}
                      value={form.taxaAnalise || ""}
                      onChange={(e) => set("taxaAnalise", parseFloat(e.target.value))}
                      placeholder="Ex: 350.00"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Taxa de Emissão (R$)</Label>
                    <Input
                      type="number" min={0}
                      value={form.taxaEmissao || ""}
                      onChange={(e) => set("taxaEmissao", parseFloat(e.target.value))}
                      placeholder="Ex: 250.00"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Caminho padrão de avaliação</Label>
                    <div className="flex gap-3">
                      {(["A", "B"] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => set("caminhoDefault", c)}
                          className={cn(
                            "flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all",
                            form.caminhoDefault === c
                              ? c === "A"
                                ? "border-blue-500 bg-blue-50 text-blue-800"
                                : "border-purple-500 bg-purple-50 text-purple-800"
                              : "border-gray-200 text-gray-500 hover:border-gray-300"
                          )}
                        >
                          Caminho {c}
                          <span className="block text-xs font-normal mt-0.5">
                            {c === "A" ? "Entrevista direta" : "Prova + Entrevista"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ABA: COMO FUNCIONA ── */}
          {abaAtiva === "como-funciona" && (
            <div className="space-y-6">
              {/* Aviso se vazio */}
              {(!cf.etapas || cf.etapas.length === 0) && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Conteúdo não configurado</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Preencha as etapas abaixo para que a página "Como funciona" desta certificação seja exibida corretamente no site.
                    </p>
                  </div>
                </div>
              )}

              {/* Cabeçalho da página */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Cabeçalho da página</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Título da página</Label>
                    <Input
                      value={cf.titulo || ""}
                      onChange={(e) => setCF("titulo", e.target.value)}
                      placeholder={`Como funciona — ${form.nome || "Certificação"}`}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Subtítulo / Introdução</Label>
                    <textarea
                      value={cf.subtitulo || ""}
                      onChange={(e) => setCF("subtitulo", e.target.value)}
                      rows={2}
                      placeholder="Breve descrição do processo de certificação..."
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Etapas */}
              <div>
                <EtapaEditor
                  etapas={cf.etapas || []}
                  onChange={(etapas) => setCF("etapas", etapas)}
                />
              </div>

              {/* Informações complementares */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Informações complementares</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Investimento
                      <span className="text-gray-400 font-normal ml-1">(exibido na sidebar)</span>
                    </Label>
                    <Input
                      value={cf.investimento || ""}
                      onChange={(e) => setCF("investimento", e.target.value)}
                      placeholder="Ex: Taxa de análise: R$ 350,00 | Taxa de emissão: R$ 250,00"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      O que está incluído
                      <span className="text-gray-400 font-normal ml-1">(separe itens com · )</span>
                    </Label>
                    <textarea
                      value={cf.inclusoes || ""}
                      onChange={(e) => setCF("inclusoes", e.target.value)}
                      rows={3}
                      placeholder="Aulas de desenvolvimento · Webinares ao vivo · Mentoria · Projetos práticos"
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Use o caractere · (ponto médio) para separar os itens da lista.</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Observações importantes
                      <span className="text-gray-400 font-normal ml-1">(caixa de destaque azul)</span>
                    </Label>
                    <textarea
                      value={cf.observacoes || ""}
                      onChange={(e) => setCF("observacoes", e.target.value)}
                      rows={2}
                      placeholder="Ex: O processo completo leva em média 30 a 60 dias..."
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-white border-t border-gray-100 px-6 py-4 flex gap-3 rounded-b-3xl shrink-0">
          <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl">
            Cancelar
          </Button>
          <Button
            onClick={() => onSave(form)}
            className="flex-1 rounded-xl bg-blue-700 hover:bg-blue-800 font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar certificação
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ───────────────────────────────────────────────────────────

export function AdminCertificacoes() {
  const [, navigate] = useLocation();
  const { certifications, salvarCertificacoes } = useCertification();
  const [editing, setEditing] = useState<Partial<Certification> | null>(null);
  const [preview, setPreview] = useState<Certification | null>(null);

  function handleNew() {
    const nextNum = certifications.length + 1;
    setEditing({
      id: `cert-${Date.now()}`,
      numero: nextNum,
      nome: `Certificação ${nextNum}`,
      subtitulo: "",
      descricao: "",
      publicoAlvo: "",
      competencias: [],
      preRequisitos: [],
      documentosExigidos: [],
      cursos: [],
      taxaAnalise: 0,
      taxaEmissao: 0,
      status: "inativa",
      cor: "blue",
      caminhoDefault: "A",
      comoFunciona: { ...EMPTY_COMO_FUNCIONA },
    });
  }

  function handleEdit(cert: Certification) {
    setEditing({ ...cert });
  }

  function handleSave(form: Partial<Certification>) {
    const updated = certifications.some((c) => c.id === form.id)
      ? certifications.map((c) => (c.id === form.id ? { ...c, ...form } as Certification : c))
      : [...certifications, form as Certification];
    salvarCertificacoes(updated);

    // A certificação inteira precisa existir de verdade no banco (não só como
    // conteúdo local) — senão um candidato nunca conseguiria concluir o
    // processo com uma certificação criada agora há pouco pelo admin.
    if (form.id && form.nome) {
      (adminApi as any).sincronizarCertificacao(form.id, {
        nome: form.nome,
        numero: form.numero,
        taxaAnalise: form.taxaAnalise,
        taxaEmissao: form.taxaEmissao,
        caminhoDefault: form.caminhoDefault ?? null,
        documentosExigidos: (form.documentosExigidos || []).slice(0, 10),
      }).catch((err: any) => {
        console.warn("Não foi possível sincronizar a certificação com o banco:", err?.message);
        alert(
          "Atenção: a certificação foi salva localmente, mas houve um erro ao sincronizar com o banco de dados.\n\n" +
          "Isso significa que o candidato pode não conseguir concluir o processo com ela ainda.\n\n" +
          "Detalhe técnico: " + (err?.message || "erro desconhecido")
        );
      });
    }

    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja remover esta certificação?")) return;
    salvarCertificacoes(certifications.filter((c) => c.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl">Gerenciar Certificações</h1>
              <p className="text-blue-200 text-xs mt-0.5">Configure até {MAX_CERTS} certificações no sistema</p>
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
            {certifications.length < MAX_CERTS && (
              <Button
                onClick={handleNew}
                className="bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-md"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Nova certificação
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {Object.entries(STATUS_CONFIG).map(([key, { label, icon: Icon, className, dot }]) => (
            <Card key={key} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", className)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
                    {label}
                  </span>
                </div>
                <p className="text-3xl font-black text-gray-900">
                  {certifications.filter((c) => c.status === key).length}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">certificações</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Capacity indicator */}
        <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-gray-900">Capacidade do sistema</p>
              <p className="text-xs text-gray-400 mt-0.5">{certifications.length} de {MAX_CERTS} certificações cadastradas</p>
            </div>
            <span className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-full",
              certifications.length >= MAX_CERTS ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
            )}>
              {MAX_CERTS - certifications.length} vagas disponíveis
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                certifications.length >= MAX_CERTS ? "bg-red-500" : "bg-blue-600"
              )}
              style={{ width: `${(certifications.length / MAX_CERTS) * 100}%` }}
            />
          </div>
        </div>

        {/* Certifications grid */}
        {certifications.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-gray-300" />
            </div>
            <p className="font-bold text-gray-400 text-lg">Nenhuma certificação cadastrada</p>
            <p className="text-sm text-gray-300 mt-1 mb-6">Crie a primeira certificação do sistema.</p>
            <Button onClick={handleNew} className="bg-blue-700 hover:bg-blue-800 font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira certificação
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certifications.map((cert) => {
              const statusCfg = STATUS_CONFIG[cert.status];
              const StatusIcon = statusCfg.icon;
              const temComoFunciona = cert.comoFunciona?.etapas && cert.comoFunciona.etapas.length > 0;
              return (
                <Card key={cert.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                  {/* Color bar */}
                  <div className={cn(
                    "h-1.5",
                    cert.cor === "blue" ? "bg-blue-600" :
                    cert.cor === "gold" ? "bg-amber-500" :
                    cert.cor === "green" ? "bg-emerald-600" :
                    cert.cor === "purple" ? "bg-purple-600" :
                    cert.cor === "orange" ? "bg-orange-500" :
                    cert.cor === "teal" ? "bg-teal-600" :
                    "bg-red-600"
                  )} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md",
                          cert.cor === "blue" ? "bg-gradient-to-br from-blue-600 to-blue-800" :
                          cert.cor === "gold" ? "bg-gradient-to-br from-amber-500 to-amber-700" :
                          cert.cor === "green" ? "bg-gradient-to-br from-emerald-600 to-emerald-800" :
                          cert.cor === "purple" ? "bg-gradient-to-br from-purple-600 to-purple-800" :
                          cert.cor === "orange" ? "bg-gradient-to-br from-orange-500 to-orange-700" :
                          cert.cor === "teal" ? "bg-gradient-to-br from-teal-600 to-teal-800" :
                          "bg-gradient-to-br from-red-600 to-red-800"
                        )}>
                          {cert.numero}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm leading-tight">{cert.nome}</p>
                          {cert.subtitulo && (
                            <p className="text-xs text-gray-400 mt-0.5">{cert.subtitulo}</p>
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0",
                        statusCfg.className
                      )}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                      {cert.descricao || "Sem descrição"}
                    </p>

                    {/* Como funciona badge */}
                    <div className={cn(
                      "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg mb-4 w-fit",
                      temComoFunciona
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    )}>
                      <BookOpen className="w-3.5 h-3.5" />
                      {temComoFunciona
                        ? `Como funciona: ${cert.comoFunciona!.etapas.length} etapas`
                        : "Como funciona: não configurado"}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-xs text-gray-400">Taxa Análise</p>
                        <p className="text-sm font-bold text-gray-900">
                          {cert.taxaAnalise ? `R$ ${cert.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-xs text-gray-400">Taxa Emissão</p>
                        <p className="text-sm font-bold text-emerald-700">
                          {cert.taxaEmissao ? `R$ ${cert.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-semibold",
                        cert.caminhoDefault === "B" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      )}>
                        Caminho {cert.caminhoDefault || "A"}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPreview(cert)}
                          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(cert)}
                          className="p-2 rounded-xl hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-600"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cert.id)}
                          className="p-2 rounded-xl hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Add new card */}
            {certifications.length < MAX_CERTS && (
              <button
                onClick={handleNew}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-400 group-hover:text-blue-700 transition-colors">
                    Nova certificação
                  </p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {MAX_CERTS - certifications.length} vagas restantes
                  </p>
                </div>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Editor modal */}
      {editing && (
        <CertEditor
          cert={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className={cn(
              "p-6 rounded-t-3xl",
              preview.cor === "blue" ? "bg-gradient-to-br from-blue-600 to-blue-900" :
              preview.cor === "gold" ? "bg-gradient-to-br from-amber-500 to-amber-800" :
              preview.cor === "green" ? "bg-gradient-to-br from-emerald-600 to-emerald-900" :
              preview.cor === "purple" ? "bg-gradient-to-br from-purple-600 to-purple-900" :
              "bg-gradient-to-br from-blue-600 to-blue-900"
            )}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Certificação {preview.numero}</p>
                  <h2 className="text-2xl font-black text-white">{preview.nome}</h2>
                  {preview.subtitulo && <p className="text-white/70 text-sm mt-1">{preview.subtitulo}</p>}
                </div>
                <button onClick={() => setPreview(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição</p>
                <p className="text-sm text-gray-700 leading-relaxed">{preview.descricao || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Público-alvo</p>
                <p className="text-sm text-gray-700">{preview.publicoAlvo || "—"}</p>
              </div>
              {preview.competencias && preview.competencias.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Competências</p>
                  <div className="flex flex-wrap gap-2">
                    {preview.competencias.map((c, i) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Como funciona preview */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Como funciona</p>
                {preview.comoFunciona?.etapas && preview.comoFunciona.etapas.length > 0 ? (
                  <div className="space-y-1.5">
                    {preview.comoFunciona.etapas.map((e, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold shrink-0">{e.numero}</span>
                        {e.titulo}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">Não configurado — acesse "Editar" para preencher.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Taxa Análise</p>
                  <p className="font-black text-gray-900">{preview.taxaAnalise ? `R$ ${preview.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Taxa Emissão</p>
                  <p className="font-black text-emerald-700">{preview.taxaEmissao ? `R$ ${preview.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</p>
                </div>
              </div>
              <Button onClick={() => { setPreview(null); handleEdit(preview); }} className="w-full rounded-xl bg-blue-700 hover:bg-blue-800 font-bold">
                <Edit className="w-4 h-4 mr-2" />
                Editar esta certificação
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
