import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import {
  CheckCircle, XCircle, FileText, User, Award, ArrowRight,
  AlertCircle, Eye, X, Check, ChevronRight, Send, Edit3,
  ClipboardList, ThumbsUp, ThumbsDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean | null; // null = não avaliado, true = sim, false = não
}

interface DocAnalise {
  nome: string;
  url: string;
  checklist: ChecklistItem[];
  parecer: string;
  aprovado: boolean | null; // null = pendente
}

// Checklist padrão por tipo de documento
function getChecklistForDoc(nome: string): ChecklistItem[] {
  const n = nome.toLowerCase();
  if (n.includes("diploma") || n.includes("graduação") || n.includes("pos-graduação") || n.includes("pós")) {
    return [
      { id: "legivel", label: "Documento legível e sem rasuras", checked: null },
      { id: "autenticado", label: "Documento autenticado ou cópia reconhecida", checked: null },
      { id: "graduacao", label: "Comprova graduação ou pós-graduação em área compatível", checked: null },
      { id: "instituicao", label: "Emitido por instituição reconhecida pelo MEC", checked: null },
    ];
  }
  if (n.includes("declaração") || n.includes("experiência") || n.includes("empresa")) {
    return [
      { id: "legivel", label: "Documento legível e sem rasuras", checked: null },
      { id: "timbrado", label: "Emitido em papel timbrado da empresa", checked: null },
      { id: "assinado", label: "Assinado por responsável com cargo identificado", checked: null },
      { id: "periodo", label: "Informa período e cargo exercido", checked: null },
      { id: "anos", label: "Comprova o tempo mínimo de experiência exigido", checked: null },
    ];
  }
  if (n.includes("código de conduta") || n.includes("codigo de conduta")) {
    return [
      { id: "legivel", label: "Documento legível e sem rasuras", checked: null },
      { id: "assinado", label: "Assinado pelo candidato com data", checked: null },
      { id: "versao", label: "Versão atual do Código de Conduta ANEFAC", checked: null },
      { id: "completo", label: "Todas as páginas presentes e completas", checked: null },
    ];
  }
  if (n.includes("carta") || n.includes("recomendação")) {
    return [
      { id: "legivel", label: "Documento legível e sem rasuras", checked: null },
      { id: "identificado", label: "Recomendante identificado com nome, cargo e empresa", checked: null },
      { id: "assinado", label: "Assinado pelo recomendante", checked: null },
      { id: "conteudo", label: "Conteúdo relevante à certificação pretendida", checked: null },
    ];
  }
  // Genérico
  return [
    { id: "legivel", label: "Documento legível e sem rasuras", checked: null },
    { id: "completo", label: "Documento completo (todas as páginas)", checked: null },
    { id: "valido", label: "Documento válido e dentro do prazo", checked: null },
    { id: "pertinente", label: "Pertinente ao requisito solicitado", checked: null },
  ];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AdminValidacaoDocumental() {
  const { processo, definirCaminho, atualizarStatus, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  const candidatoDados = JSON.parse(localStorage.getItem("anefac_candidato_dados") || "{}");
  const docFiles: Record<string, string> = JSON.parse(localStorage.getItem("anefac_documentos_enviados") || "{}");

  // Inicializa análise de cada documento
  const [analises, setAnalises] = useState<DocAnalise[]>(() =>
    (certAtual?.documentosExigidos || []).map((doc) => ({
      nome: doc,
      url: docFiles[doc] || "",
      checklist: getChecklistForDoc(doc),
      parecer: "",
      aprovado: null,
    }))
  );

  // Modal de análise do documento
  const [docAberto, setDocAberto] = useState<number | null>(null);

  // Tela de relatório final
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false);
  const [caminhoFinal, setCaminhoFinal] = useState<"A" | "B" | "reprovado" | null>(null);
  const [parecerGeral, setParecerGeral] = useState("");
  const [enviando, setEnviando] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const todosAprovados = analises.every((a) => a.aprovado === true);
  const algumReprovado = analises.some((a) => a.aprovado === false);
  const todosAnalisados = analises.every((a) => a.aprovado !== null);

  function toggleChecklist(docIdx: number, itemId: string, valor: boolean) {
    setAnalises((prev) =>
      prev.map((a, i) =>
        i === docIdx
          ? { ...a, checklist: a.checklist.map((c) => (c.id === itemId ? { ...c, checked: valor } : c)) }
          : a
      )
    );
  }

  function setParecer(docIdx: number, texto: string) {
    setAnalises((prev) => prev.map((a, i) => (i === docIdx ? { ...a, parecer: texto } : a)));
  }

  function aprovarDoc(docIdx: number, aprovado: boolean) {
    setAnalises((prev) => prev.map((a, i) => (i === docIdx ? { ...a, aprovado } : a)));
    setDocAberto(null);
    toast({
      title: aprovado ? "Documento aprovado ✓" : "Documento reprovado ✗",
      variant: aprovado ? "default" : "destructive",
    });
  }

  async function handleEnviarCandidato() {
    if (!caminhoFinal) {
      toast({ title: "Selecione o encaminhamento antes de enviar", variant: "destructive" });
      return;
    }
    setEnviando(true);
    await new Promise((r) => setTimeout(r, 1500));
    setEnviando(false);

    if (caminhoFinal === "reprovado") {
      atualizarStatus("encerrado");
      toast({ title: "Candidato notificado — processo encerrado", variant: "destructive" });
      navigate("/novo-fluxo/processo-encerrado");
    } else if (caminhoFinal === "A") {
      definirCaminho("A");
      atualizarStatus("entrevista");
      toast({ title: "Candidato notificado — habilitado para entrevista (Caminho A)" });
      navigate("/novo-fluxo/agendamento-entrevista");
    } else {
      definirCaminho("B");
      atualizarStatus("prova");
      toast({ title: "Candidato notificado — habilitado para avaliação teórica (Caminho B)" });
      navigate("/novo-fluxo/prova");
    }
  }

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!certAtual) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="font-bold text-foreground mb-2">Nenhum processo ativo</h2>
            <p className="text-sm text-muted-foreground mb-4">Não há candidato com processo em andamento no momento.</p>
            <Button variant="outline" onClick={() => navigate("/novo-fluxo")}>Voltar ao início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Relatório Final ────────────────────────────────────────────────────────

  if (mostrarRelatorio) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-900 text-white px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-900 font-bold text-sm">A</span>
              </div>
              <div>
                <span className="font-bold">ANEFAC</span>
                <span className="text-blue-300 text-xs ml-2">Painel Administrativo</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:text-blue-200" onClick={() => setMostrarRelatorio(false)}>
              ← Voltar à análise
            </Button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6 flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-blue-700" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Relatório de Análise Documental</h1>
              <p className="text-sm text-muted-foreground">Revise o relatório antes de enviar ao candidato.</p>
            </div>
          </div>

          {/* Candidato */}
          <Card className="mb-4">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Candidato</p>
              <p className="font-bold text-foreground">{candidatoDados.nome || processo.candidatoNome}</p>
              <p className="text-sm text-muted-foreground">{candidatoDados.email || processo.candidatoEmail}</p>
              <p className="text-sm text-muted-foreground mt-1">Certificação: <strong>{certAtual.nome}</strong></p>
            </CardContent>
          </Card>

          {/* Análise por documento */}
          <div className="space-y-3 mb-5">
            {analises.map((a, i) => (
              <Card key={i} className={cn("border-2", a.aprovado ? "border-green-300" : "border-red-300")}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {a.aprovado ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-semibold text-sm text-foreground">{a.nome}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", a.aprovado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {a.aprovado ? "Aprovado" : "Reprovado"}
                      </span>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setDocAberto(i); setMostrarRelatorio(false); }}>
                        <Edit3 className="w-3 h-3 mr-1" /> Editar
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 mb-2">
                    {a.checklist.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        {c.checked === true ? (
                          <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                        ) : c.checked === false ? (
                          <XCircle className="w-3 h-3 text-red-500 shrink-0" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-gray-300 shrink-0" />
                        )}
                        <span>{c.label}</span>
                      </div>
                    ))}
                  </div>
                  {a.parecer && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-muted-foreground border">
                      <strong>Parecer:</strong> {a.parecer}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Parecer geral */}
          <Card className="mb-5">
            <CardContent className="p-5">
              <label className="text-sm font-semibold text-foreground block mb-2">Parecer geral do avaliador</label>
              <textarea
                value={parecerGeral}
                onChange={(e) => setParecerGeral(e.target.value)}
                className="w-full border border-border rounded-lg p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Observações gerais sobre a análise documental..."
              />
            </CardContent>
          </Card>

          {/* Encaminhamento */}
          <Card className="mb-6">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Decisão e próximo passo</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setCaminhoFinal("A")}
                  className={cn("w-full text-left p-4 rounded-xl border-2 transition-all", caminhoFinal === "A" ? "border-green-500 bg-green-50" : "border-border hover:border-green-300")}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center", caminhoFinal === "A" ? "border-green-500 bg-green-500" : "border-gray-300")}>
                      {caminhoFinal === "A" && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Habilitado para Entrevista (Caminho A)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Candidato aprovado na análise documental. Será convidado para entrevista com o Comitê ANEFAC.</p>
                      <span className="inline-block mt-1.5 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">⚡ Processo mais rápido</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setCaminhoFinal("B")}
                  className={cn("w-full text-left p-4 rounded-xl border-2 transition-all", caminhoFinal === "B" ? "border-blue-500 bg-blue-50" : "border-border hover:border-blue-300")}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center", caminhoFinal === "B" ? "border-blue-500 bg-blue-500" : "border-gray-300")}>
                      {caminhoFinal === "B" && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Habilitado para Avaliação Teórica (Caminho B)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Candidato será direcionado para o exame de proficiência antes da entrevista.</p>
                      <span className="inline-block mt-1.5 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">📝 Inclui avaliação teórica</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setCaminhoFinal("reprovado")}
                  className={cn("w-full text-left p-4 rounded-xl border-2 transition-all", caminhoFinal === "reprovado" ? "border-red-500 bg-red-50" : "border-border hover:border-red-300")}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center", caminhoFinal === "reprovado" ? "border-red-500 bg-red-500" : "border-gray-300")}>
                      {caminhoFinal === "reprovado" && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Documentação insuficiente — Processo encerrado</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Os documentos não atendem aos requisitos mínimos. O candidato será notificado.</p>
                      <span className="inline-block mt-1.5 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">✗ Encerra o processo</span>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setMostrarRelatorio(false)}>
              <Edit3 className="w-4 h-4 mr-2" /> Editar análise
            </Button>
            <Button
              className={cn("flex-1", caminhoFinal === "reprovado" ? "bg-red-600 hover:bg-red-700" : caminhoFinal === "A" ? "bg-green-700 hover:bg-green-800" : "bg-blue-900 hover:bg-blue-800")}
              onClick={handleEnviarCandidato}
              disabled={!caminhoFinal || enviando}
            >
              {enviando ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar decisão ao candidato
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // ── Tela principal de análise ──────────────────────────────────────────────

  const docAtual = docAberto !== null ? analises[docAberto] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de análise do documento */}
      {docAberto !== null && docAtual && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-blue-900 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-200" />
                <span className="font-semibold text-white text-sm">{docAtual.nome}</span>
                <span className="text-xs text-blue-300 ml-2">Documento {docAberto + 1} de {analises.length}</span>
              </div>
              <button onClick={() => setDocAberto(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-800 transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 min-h-0">
              {/* Visualizador do documento */}
              <div className="lg:w-1/2 bg-gray-100 min-h-[400px] flex items-center justify-center rounded-bl-2xl">
                {docAtual.url ? (
                  docAtual.url.startsWith("data:image") ? (
                    <img src={docAtual.url} alt={docAtual.nome} className="w-full h-full object-contain p-4 max-h-[70vh]" />
                  ) : (
                    <iframe src={docAtual.url} title={docAtual.nome} className="w-full min-h-[500px]" style={{ border: "none" }} />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
                    <FileText className="w-16 h-16 mb-3 opacity-20" />
                    <p className="text-sm font-medium">Arquivo não disponível para visualização</p>
                    <p className="text-xs mt-1 opacity-60 text-center">Nesta versão demo, os arquivos são simulados. Em produção, o arquivo enviado pelo candidato será exibido aqui.</p>
                  </div>
                )}
              </div>

              {/* Painel de análise */}
              <div className="lg:w-1/2 p-6 overflow-y-auto max-h-[80vh] space-y-5">
                {/* Checklist */}
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-blue-700" />
                    Checklist de validação
                  </h3>
                  <div className="space-y-2">
                    {docAtual.checklist.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                        <span className="text-xs text-foreground flex-1 pr-3">{item.label}</span>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => toggleChecklist(docAberto, item.id, true)}
                            className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-all border text-xs font-bold",
                              item.checked === true ? "bg-green-500 border-green-500 text-white" : "border-gray-300 text-gray-400 hover:border-green-400 hover:text-green-600"
                            )}
                            title="Sim / Atende"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleChecklist(docAberto, item.id, false)}
                            className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-all border text-xs font-bold",
                              item.checked === false ? "bg-red-500 border-red-500 text-white" : "border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-600"
                            )}
                            title="Não / Não atende"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parecer */}
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Parecer do avaliador sobre este documento
                  </label>
                  <textarea
                    value={docAtual.parecer}
                    onChange={(e) => setParecer(docAberto, e.target.value)}
                    className="w-full border border-border rounded-lg p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descreva sua análise sobre este documento..."
                  />
                </div>

                {/* Decisão do documento */}
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm font-semibold text-foreground">Decisão sobre este documento:</p>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => aprovarDoc(docAberto, true)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Documento Aprovado
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => aprovarDoc(docAberto, false)}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Documento Reprovado
                    </Button>
                  </div>
                </div>

                {/* Navegação entre documentos */}
                {analises.length > 1 && (
                  <div className="flex gap-2 pt-2">
                    {docAberto > 0 && (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setDocAberto(docAberto - 1)}>
                        ← Documento anterior
                      </Button>
                    )}
                    {docAberto < analises.length - 1 && (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setDocAberto(docAberto + 1)}>
                        Próximo documento →
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <header className="bg-blue-900 text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-900 font-bold text-sm">A</span>
            </div>
            <div>
              <span className="font-bold">ANEFAC</span>
              <span className="text-blue-300 text-xs ml-2">Painel Administrativo</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:text-blue-200" onClick={() => navigate("/novo-fluxo/admin")}>
            ← Voltar ao painel
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Validação Documental</h1>
          <p className="text-muted-foreground text-sm">Analise cada documento individualmente e defina o encaminhamento do candidato.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Candidate Info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{candidatoDados.nome || processo.candidatoNome || "Candidato"}</p>
                    <p className="text-xs text-muted-foreground">{candidatoDados.email || processo.candidatoEmail}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground border-t pt-3">
                  <p><strong>Empresa:</strong> {candidatoDados.empresa || "—"}</p>
                  <p><strong>Cargo:</strong> {candidatoDados.cargo || "—"}</p>
                  <p><strong>Experiência:</strong> {candidatoDados.anosExperiencia || "—"} anos</p>
                  <p><strong>Formação:</strong> {candidatoDados.formacao || "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-blue-700" />
                  <span className="text-sm font-semibold text-foreground">Certificação</span>
                </div>
                <p className="font-bold text-foreground text-sm">{certAtual.nome}</p>
                <p className="text-xs text-muted-foreground">{"Nível " + certAtual.numero}</p>
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
                  <p>Taxa de análise paga: <strong className="text-green-700">R$ {certAtual.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></p>
                  <p>Caminho padrão: <strong>{certAtual.caminhoDefault === "B" ? "Caminho B (com prova)" : certAtual.caminhoDefault === "A" ? "Caminho A (direto)" : "Avaliador decide"}</strong></p>
                </div>
              </CardContent>
            </Card>

            {/* Progresso */}
            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-foreground mb-3">Progresso da análise</p>
                <div className="space-y-2">
                  {analises.map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {a.aprovado === true ? (
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      ) : a.aprovado === false ? (
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                      )}
                      <span className="text-xs text-foreground truncate flex-1">{a.nome}</span>
                      <span className={cn("text-xs font-medium shrink-0", a.aprovado === true ? "text-green-600" : a.aprovado === false ? "text-red-600" : "text-gray-400")}>
                        {a.aprovado === true ? "Aprovado" : a.aprovado === false ? "Reprovado" : "Pendente"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  Documentos enviados
                  <span className="ml-auto text-xs text-muted-foreground">
                    {analises.filter((a) => a.aprovado !== null).length}/{analises.length} analisados
                  </span>
                </h3>
                <div className="space-y-3">
                  {analises.map((a, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                        a.aprovado === true ? "bg-green-50 border-green-200" :
                        a.aprovado === false ? "bg-red-50 border-red-200" :
                        "bg-gray-50 border-gray-200"
                      )}
                    >
                      {a.aprovado === true ? (
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      ) : a.aprovado === false ? (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{a.nome}</p>
                        {a.parecer && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">"{a.parecer}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn("text-xs font-medium",
                          a.aprovado === true ? "text-green-600" :
                          a.aprovado === false ? "text-red-600" :
                          "text-gray-400"
                        )}>
                          {a.aprovado === true ? "Aprovado" : a.aprovado === false ? "Reprovado" : "Pendente"}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs px-3 border-blue-200 text-blue-700 hover:bg-blue-50"
                          onClick={() => setDocAberto(i)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Analisar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA para relatório */}
            <Card className={cn("border-2", todosAnalisados ? (algumReprovado ? "border-red-300" : "border-green-300") : "border-gray-200")}>
              <CardContent className="p-5">
                {!todosAnalisados ? (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm">Analise todos os documentos para gerar o relatório e enviar a decisão ao candidato.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {algumReprovado ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      <p className="text-sm font-semibold text-foreground">
                        {algumReprovado
                          ? "Um ou mais documentos foram reprovados"
                          : "Todos os documentos foram aprovados!"}
                      </p>
                    </div>
                    <Button
                      className="w-full bg-blue-900 hover:bg-blue-800"
                      onClick={() => setMostrarRelatorio(true)}
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Gerar relatório e definir encaminhamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
