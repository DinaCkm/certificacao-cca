import React, { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { Clock, CheckCircle, Mail, FileText, Phone, HelpCircle, BookOpen, Home, LogOut } from "lucide-react";

export function AguardandoValidacao() {
  const { processo, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const certAtual = getCertificacaoAtual();

  useEffect(() => {
    if (!processo.certificacaoId) navigate("/novo-fluxo");
  }, [processo.certificacaoId, navigate]);

  if (!certAtual) return null;

  const ETAPAS = [
    { label: "Cadastro realizado", done: true },
    { label: "Pagamento da taxa de análise", done: true },
    { label: "Documentos enviados", done: true },
    { label: "Validação documental pela banca", done: false, current: true },
    { label: processo.caminhoAvaliacao === "B" ? "Prova de competência" : "Entrevista técnica", done: false },
    { label: "Entrevista técnica", done: false },
    { label: "Pagamento da taxa de emissão", done: false },
    { label: "Emissão do certificado", done: false },
  ];

  return (
    <FluxoLayout
      currentStep={4}
      title="Aguardando Validação Documental"
      subtitle="Seu processo foi recebido com sucesso. Nossa banca de avaliadores irá analisar seus documentos em breve."
    >
      {/* Status Card */}
      <Card className="border-blue-200 bg-blue-50 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7 text-blue-700 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-blue-900 text-lg mb-1">Processo em análise</h2>
              <p className="text-sm text-blue-700">
                Prazo estimado: <strong>5 a 10 dias úteis</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Você receberá um e-mail assim que a análise for concluída.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-5">Acompanhamento do processo</h3>
              <div className="space-y-4">
                {ETAPAS.map((etapa, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          etapa.done
                            ? "bg-green-500"
                            : etapa.current
                            ? "bg-blue-600 animate-pulse"
                            : "bg-gray-200"
                        }`}
                      >
                        {etapa.done ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : etapa.current ? (
                          <Clock className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs text-gray-500 font-bold">{idx + 1}</span>
                        )}
                      </div>
                      {idx < ETAPAS.length - 1 && (
                        <div className={`w-0.5 h-6 mt-1 ${etapa.done ? "bg-green-300" : "bg-gray-200"}`} />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <p
                        className={`text-sm font-medium ${
                          etapa.done
                            ? "text-green-700"
                            : etapa.current
                            ? "text-blue-700"
                            : "text-muted-foreground"
                        }`}
                      >
                        {etapa.label}
                      </p>
                      {etapa.current && (
                        <p className="text-xs text-blue-600 mt-0.5">Em andamento...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What happens next */}
          <Card className="mt-5">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">O que acontece após a validação?</h3>
              <div className="space-y-3">
                {certAtual.caminhoDefault === "B" ? (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-lg">📝</span>
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Caminho B — Prova de competência</p>
                        <p className="text-xs text-blue-700 mt-0.5">
                          Se aprovado na análise documental, você será convocado para a prova de competência, seguida de entrevista técnica.
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">ou, dependendo da avaliação da banca:</p>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <span className="text-lg">⚡</span>
                      <div>
                        <p className="text-sm font-semibold text-green-900">Caminho A — Direto para entrevista</p>
                        <p className="text-xs text-green-700 mt-0.5">
                          A banca pode decidir encaminhar você diretamente para a entrevista técnica, sem necessidade de prova.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="text-lg">⚡</span>
                    <div>
                      <p className="text-sm font-semibold text-green-900">Caminho A — Direto para entrevista</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        Para a {certAtual.nome}, candidatos aprovados na análise documental seguem diretamente para a entrevista técnica.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Sua certificação</h3>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{certAtual.numero}</span>
                <div>
                  <p className="font-bold text-foreground text-sm">{certAtual.nome}</p>
                  <p className="text-xs text-muted-foreground">{"Nível " + certAtual.numero}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
                <p>Taxa de análise paga: <strong className="text-green-700">R$ {certAtual.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></p>
                <p>Taxa de emissão (após aprovação): <strong>R$ {certAtual.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Dúvidas?
              </h3>
              <div className="space-y-2">
                <a href="mailto:certificacao@anefac.com.br" className="flex items-center gap-2 text-xs text-blue-700 hover:underline">
                  <Mail className="w-3.5 h-3.5" />
                  certificacao@anefac.com.br
                </a>
                <a href="tel:+551100000000" className="flex items-center gap-2 text-xs text-blue-700 hover:underline">
                  <Phone className="w-3.5 h-3.5" />
                  (11) 0000-0000
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Admin shortcut for demo */}
          <Card className="border-dashed border-gray-300">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-3 font-medium">Simulação (área administrativa):</p>
              <Link href="/novo-fluxo/admin/validacao">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Ir para painel de validação
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Ações finais */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          variant="outline"
          className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => navigate("/novo-fluxo/upload-documentos")}
        >
          <FileText className="w-4 h-4 mr-2" />
          Reenviar ou completar documentos
        </Button>
        <a
          href="/cursos"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-blue-900 text-white font-semibold px-5 py-3 rounded-xl hover:bg-blue-800 transition-colors text-sm"
        >
          <BookOpen className="w-4 h-4" />
          Prepare-se com os Cursos ANEFAC
        </a>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate("/novo-fluxo")}
        >
          <Home className="w-4 h-4 mr-2" />
          Voltar ao Menu Principal
        </Button>
      </div>
    </FluxoLayout>
  );
}
