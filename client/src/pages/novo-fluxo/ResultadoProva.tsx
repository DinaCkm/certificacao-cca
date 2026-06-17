import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { CheckCircle, XCircle, AlertTriangle, Award } from "lucide-react";

export function ResultadoProva() {
  const { processo, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const certAtual = getCertificacaoAtual();

  const resultado = JSON.parse(localStorage.getItem("anefac_resultado_prova") || "{}");
  const { acertos = 0, total = 5, percentual = 0, aprovado = false, tentativa = 1 } = resultado;

  useEffect(() => {
    if (!processo.certificacaoId) navigate("/novo-fluxo");
  }, [processo.certificacaoId, navigate]);

  const podeRetentar = !aprovado && tentativa < 2;
  const processoEncerrado = !aprovado && tentativa >= 2;

  return (
    <FluxoLayout currentStep={6} title="Resultado da Prova">
      <div className="max-w-2xl mx-auto">
        <Card className={`border-2 mb-6 ${aprovado ? "border-green-300 bg-green-50" : processoEncerrado ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"}`}>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              {aprovado ? (
                <CheckCircle className="w-16 h-16 text-green-600" />
              ) : processoEncerrado ? (
                <XCircle className="w-16 h-16 text-red-600" />
              ) : (
                <AlertTriangle className="w-16 h-16 text-amber-600" />
              )}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${aprovado ? "text-green-800" : processoEncerrado ? "text-red-800" : "text-amber-800"}`}>
              {aprovado ? "Aprovado!" : processoEncerrado ? "Processo Encerrado" : "Não Aprovado"}
            </h2>
            <p className={`text-sm mb-6 ${aprovado ? "text-green-700" : processoEncerrado ? "text-red-700" : "text-amber-700"}`}>
              {aprovado
                ? "Parabéns! Você foi aprovado na prova de competência. O próximo passo é a entrevista técnica."
                : processoEncerrado
                ? "Você utilizou as 2 tentativas disponíveis e não atingiu a nota mínima. O processo foi encerrado."
                : "Você não atingiu a nota mínima nesta tentativa. Você ainda tem 1 nova tentativa disponível."}
            </p>

            {/* Score */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border">
                <p className="text-3xl font-bold text-foreground">{acertos}/{total}</p>
                <p className="text-xs text-muted-foreground mt-1">Questões corretas</p>
              </div>
              <div className="bg-white rounded-xl p-4 border">
                <p className={`text-3xl font-bold ${aprovado ? "text-green-600" : "text-red-600"}`}>
                  {percentual.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Aproveitamento</p>
              </div>
              <div className="bg-white rounded-xl p-4 border">
                <p className="text-3xl font-bold text-blue-700">60%</p>
                <p className="text-xs text-muted-foreground mt-1">Mínimo exigido</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-6">
              Tentativa {tentativa} de 2 · {aprovado ? "Aprovado" : "Reprovado"}
            </p>

            {aprovado && (
              <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg" onClick={() => navigate("/novo-fluxo/agendamento-entrevista")}>
                <Award className="w-4 h-4 mr-2" />
                Agendar Entrevista Técnica →
              </Button>
            )}
            {podeRetentar && (
              <div className="space-y-3">
                <Button className="w-full bg-amber-600 hover:bg-amber-700" size="lg" onClick={() => navigate("/novo-fluxo/prova")}>
                  Fazer nova tentativa (última chance)
                </Button>
                <p className="text-xs text-amber-700">Esta será sua última tentativa disponível.</p>
              </div>
            )}
            {processoEncerrado && (
              <Button variant="outline" className="w-full" onClick={() => navigate("/novo-fluxo/processo-encerrado")}>
                Ver detalhes do encerramento
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </FluxoLayout>
  );
}
