import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { CheckCircle, FileText, Calendar, Award, ArrowRight } from "lucide-react";

export function DocumentosAprovados() {
  const { processo, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const certAtual = getCertificacaoAtual();

  useEffect(() => {
    if (!processo.certificacaoId) navigate("/novo-fluxo");
  }, [processo.certificacaoId]);

  if (!certAtual) return null;

  const caminho = processo.caminhoAvaliacao;

  return (
    <FluxoLayout
      currentStep={4}
      title="Documentos Aprovados!"
      subtitle="Sua documentação foi analisada e aprovada pela banca ANEFAC."
    >
      <div className="max-w-xl mx-auto space-y-6">

        {/* Status de aprovação */}
        <Card className="border-green-300 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-800 mb-2">
              Parabéns, {processo.candidatoNome?.split(" ")[0]}!
            </h2>
            <p className="text-sm text-green-700">
              Sua documentação foi validada com sucesso. Não há pendências.
            </p>
          </CardContent>
        </Card>

        {/* Documentos validados */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              Documentos analisados
            </h3>
            <div className="space-y-2">
              {certAtual.documentosExigidos.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-sm text-green-800">{doc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Próximo passo */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              {caminho === "A" ? (
                <Calendar className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
              ) : (
                <Award className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="font-semibold text-blue-900 text-sm mb-1">
                  {caminho === "A"
                    ? "Próximo passo: Agendar sua entrevista"
                    : "Próximo passo: Avaliação teórica"}
                </p>
                <p className="text-xs text-blue-700">
                  {caminho === "A"
                    ? "Escolha uma data e horário disponíveis para sua entrevista técnica com o Comitê ANEFAC."
                    : "Você será direcionado para a prova de competência antes da entrevista."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full bg-blue-900 hover:bg-blue-800"
          size="lg"
          onClick={() => navigate(caminho === "A" ? "/novo-fluxo/agendamento-entrevista" : "/novo-fluxo/prova")}
        >
          {caminho === "A" ? (
            <><Calendar className="w-4 h-4 mr-2" /> Escolher data da entrevista</>
          ) : (
            <><ArrowRight className="w-4 h-4 mr-2" /> Ir para a avaliação teórica</>
          )}
        </Button>
      </div>
    </FluxoLayout>
  );
}
