import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { CheckCircle, XCircle, FileText, User, Award, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function AdminValidacaoDocumental() {
  const { processo, definirCaminho, atualizarStatus, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  const [caminhoEscolhido, setCaminhoEscolhido] = useState<"A" | "B" | "reprovado" | null>(null);
  const [parecer, setParecer] = useState("");
  const [confirmando, setConfirmando] = useState(false);

  const candidatoDados = JSON.parse(localStorage.getItem("anefac_candidato_dados") || "{}");

  const handleConfirmar = async () => {
    if (!caminhoEscolhido) {
      toast({ title: "Selecione um encaminhamento", variant: "destructive" });
      return;
    }
    setConfirmando(true);
    await new Promise((r) => setTimeout(r, 1000));
    setConfirmando(false);

    if (caminhoEscolhido === "reprovado") {
      atualizarStatus("encerrado");
      toast({ title: "Candidato reprovado na análise documental", variant: "destructive" });
      navigate("/novo-fluxo/processo-encerrado");
    } else if (caminhoEscolhido === "A") {
      definirCaminho("A");
      atualizarStatus("entrevista");
      toast({ title: "Candidato encaminhado para entrevista (Caminho A)" });
      navigate("/novo-fluxo/agendamento-entrevista");
    } else {
      definirCaminho("B");
      atualizarStatus("prova");
      toast({ title: "Candidato encaminhado para prova (Caminho B)" });
      navigate("/novo-fluxo/prova");
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
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
          <p className="text-muted-foreground text-sm">Analise os documentos e defina o encaminhamento do candidato.</p>
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
                <p className="text-xs text-muted-foreground">{certAtual.nivel}</p>
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
                  <p>Taxa de análise paga: <strong className="text-green-700">R$ {certAtual.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></p>
                  <p>Exige prova: <strong>{certAtual.exigeProva ? "Sim (Caminho B padrão)" : "Não (Caminho A padrão)"}</strong></p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents Review */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  Documentos enviados
                </h3>
                <div className="space-y-2">
                  {certAtual.documentosExigidos.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm text-foreground flex-1">{doc}</span>
                      <span className="text-xs text-green-600 font-medium">Recebido</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Decision */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Decisão do avaliador</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Após análise dos documentos, defina o encaminhamento do candidato:
                </p>

                <div className="space-y-3 mb-5">
                  {/* Path A */}
                  <button
                    onClick={() => setCaminhoEscolhido("A")}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all",
                      caminhoEscolhido === "A"
                        ? "border-green-500 bg-green-50"
                        : "border-border hover:border-green-300"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5", caminhoEscolhido === "A" ? "border-green-500 bg-green-500" : "border-gray-300")}>
                        {caminhoEscolhido === "A" && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">Caminho A — Direto para entrevista</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          O candidato demonstra experiência e competência suficientes. Encaminhar diretamente para a entrevista técnica, sem necessidade de prova.
                        </p>
                        <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          ⚡ Processo mais rápido
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Path B */}
                  <button
                    onClick={() => setCaminhoEscolhido("B")}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all",
                      caminhoEscolhido === "B"
                        ? "border-blue-500 bg-blue-50"
                        : "border-border hover:border-blue-300"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5", caminhoEscolhido === "B" ? "border-blue-500 bg-blue-500" : "border-gray-300")}>
                        {caminhoEscolhido === "B" && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">Caminho B — Prova de competência</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          O candidato precisa comprovar competência técnica antes da entrevista. Encaminhar para a prova de competência (2 tentativas disponíveis).
                        </p>
                        <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          📝 Inclui prova
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Rejected */}
                  <button
                    onClick={() => setCaminhoEscolhido("reprovado")}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all",
                      caminhoEscolhido === "reprovado"
                        ? "border-red-500 bg-red-50"
                        : "border-border hover:border-red-300"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5", caminhoEscolhido === "reprovado" ? "border-red-500 bg-red-500" : "border-gray-300")}>
                        {caminhoEscolhido === "reprovado" && <XCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">Reprovar — Documentação insuficiente</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Os documentos não atendem aos requisitos mínimos. O processo será encerrado.
                        </p>
                        <span className="inline-block mt-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          ✗ Encerra o processo
                        </span>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Parecer */}
                <div className="mb-5">
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Parecer do avaliador (opcional)
                  </label>
                  <textarea
                    value={parecer}
                    onChange={(e) => setParecer(e.target.value)}
                    className="w-full border border-border rounded-lg p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Observações sobre a análise documental..."
                  />
                </div>

                <Button
                  className={cn(
                    "w-full",
                    caminhoEscolhido === "reprovado"
                      ? "bg-red-600 hover:bg-red-700"
                      : caminhoEscolhido === "A"
                      ? "bg-green-700 hover:bg-green-800"
                      : "bg-blue-900 hover:bg-blue-800"
                  )}
                  size="lg"
                  onClick={handleConfirmar}
                  disabled={!caminhoEscolhido || confirmando}
                >
                  {confirmando ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Confirmando...
                    </span>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      {caminhoEscolhido === "A"
                        ? "Encaminhar para Entrevista (Caminho A)"
                        : caminhoEscolhido === "B"
                        ? "Encaminhar para Prova (Caminho B)"
                        : caminhoEscolhido === "reprovado"
                        ? "Reprovar e Encerrar Processo"
                        : "Selecione um encaminhamento"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
