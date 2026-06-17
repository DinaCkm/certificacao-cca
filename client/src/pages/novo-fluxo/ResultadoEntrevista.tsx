import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { CheckCircle, XCircle, Award, Mail } from "lucide-react";

export function ResultadoEntrevista() {
  const { processo, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const certAtual = getCertificacaoAtual();
  const aprovado = processo.aprovadoEntrevista;

  useEffect(() => {
    if (!processo.certificacaoId) navigate("/novo-fluxo");
  }, [processo.certificacaoId, navigate]);

  if (!certAtual) return null;

  return (
    <FluxoLayout currentStep={5} title="Resultado da Entrevista">
      <div className="max-w-2xl mx-auto">
        <Card className={`border-2 mb-6 ${aprovado ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
          <CardContent className="p-8 text-center">
            {aprovado ? (
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
            )}
            <h2 className={`text-2xl font-bold mb-3 ${aprovado ? "text-green-800" : "text-red-800"}`}>
              {aprovado ? "Habilitado para Certificação!" : "Não Habilitado"}
            </h2>
            <p className={`text-sm leading-relaxed mb-6 ${aprovado ? "text-green-700" : "text-red-700"}`}>
              {aprovado
                ? `Parabéns, ${processo.candidatoNome || "candidato"}! Você foi aprovado na entrevista técnica e está habilitado para receber a ${certAtual.nome}. O próximo passo é o pagamento da Taxa de Emissão do Certificado.`
                : `Infelizmente, você não foi habilitado na entrevista técnica para a ${certAtual.nome}. A decisão da entrevista é final e não há possibilidade de recurso ou nova tentativa.`}
            </p>

            {aprovado && (
              <div className="bg-white rounded-xl border border-green-200 p-5 mb-6 text-left">
                <p className="text-sm font-semibold text-foreground mb-3">Próximo passo:</p>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Pagamento da Taxa de Emissão</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Valor: <strong>R$ {certAtual.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Após o pagamento, seu certificado será emitido e enviado por e-mail em até 5 dias úteis.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!aprovado && (
              <div className="bg-white rounded-xl border border-red-200 p-5 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Feedback disponível</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Você receberá um e-mail com o feedback detalhado do avaliador em até 5 dias úteis. Isso pode ajudá-lo a se preparar para uma futura tentativa.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {aprovado ? (
              <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg" onClick={() => navigate("/novo-fluxo/pagamento-emissao")}>
                <Award className="w-4 h-4 mr-2" />
                Pagar Taxa de Emissão →
              </Button>
            ) : (
              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => navigate("/novo-fluxo/processo-encerrado")}>
                  Ver detalhes do encerramento
                </Button>
                <Button variant="ghost" className="w-full text-sm" onClick={() => navigate("/novo-fluxo")}>
                  Iniciar novo processo de certificação
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FluxoLayout>
  );
}
