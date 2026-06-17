import React from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { XCircle, Mail, BookOpen, RefreshCw } from "lucide-react";

export function ProcessoEncerrado() {
  const { processo, resetarProcesso, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const certAtual = getCertificacaoAtual();

  const motivo = processo.aprovadoEntrevista === false
    ? "reprovação na entrevista técnica"
    : processo.tentativasProva >= 2
    ? "esgotamento das tentativas na prova de competência"
    : "encerramento do processo";

  return (
    <FluxoLayout currentStep={6} title="Processo Encerrado">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-red-300 bg-red-50 mb-6">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Processo encerrado</h2>
            <p className="text-sm text-red-700 mb-2">
              Seu processo de certificação para <strong>{certAtual?.nome || "a certificação selecionada"}</strong> foi encerrado por {motivo}.
            </p>
            <p className="text-xs text-red-600">
              A decisão é final e não há possibilidade de recurso neste processo.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-5">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Próximos passos sugeridos</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Aguarde o feedback por e-mail</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Você receberá um e-mail com o feedback detalhado do avaliador em até 5 dias úteis.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <BookOpen className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Cursos de preparação</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Aproveite para se aprofundar nos cursos de atualização da ANEFAC antes de uma nova tentativa.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 text-xs">
                    Ver cursos disponíveis
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <RefreshCw className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Nova tentativa</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Após um período mínimo de 6 meses, você poderá iniciar um novo processo de certificação.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              resetarProcesso();
              navigate("/novo-fluxo");
            }}
          >
            Voltar ao início
          </Button>
          <Button className="flex-1 bg-blue-900 hover:bg-blue-800">
            <BookOpen className="w-4 h-4 mr-2" />
            Ver cursos
          </Button>
        </div>
      </div>
    </FluxoLayout>
  );
}
