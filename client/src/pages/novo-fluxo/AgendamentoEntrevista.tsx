import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { Calendar, Clock, Video, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const HORARIOS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

function getDatasDisponiveis() {
  const datas: { data: string; label: string; diaSemana: string }[] = [];
  const hoje = new Date();
  let count = 0;
  let i = 1;
  while (count < 5) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    const diaSemana = d.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      datas.push({
        data: d.toISOString().split("T")[0],
        label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        diaSemana: d.toLocaleDateString("pt-BR", { weekday: "short" }),
      });
      count++;
    }
    i++;
  }
  return datas;
}

export function AgendamentoEntrevista() {
  const { processo, atualizarStatus, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const datas = getDatasDisponiveis();

  useEffect(() => {
    if (!processo.certificacaoId) navigate("/novo-fluxo");
  }, [processo.certificacaoId, navigate]);

  const handleConfirmar = () => {
    if (!dataSelecionada || !horarioSelecionado) {
      toast({ title: "Selecione data e horário", variant: "destructive" });
      return;
    }
    localStorage.setItem("anefac_entrevista_agendada", JSON.stringify({ data: dataSelecionada, horario: horarioSelecionado }));
    atualizarStatus("entrevista");
    setConfirmado(true);
  };

  if (!certAtual) return null;

  if (confirmado) {
    const dataFormatada = new Date(dataSelecionada + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    return (
      <FluxoLayout currentStep={6} title="Entrevista Agendada!">
        <div className="max-w-xl mx-auto">
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-green-800 mb-2">Entrevista confirmada!</h2>
              <p className="text-sm text-green-700 mb-6">Você receberá um e-mail de confirmação com o link de acesso.</p>
              <div className="bg-white rounded-xl border border-green-200 p-5 mb-6 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-foreground capitalize">{dataFormatada}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-foreground">{horarioSelecionado} (horário de Brasília)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-foreground">Videoconferência — link enviado por e-mail</span>
                </div>
              </div>
              <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={() => navigate("/novo-fluxo/sala-entrevista")}>
                Acessar sala de entrevista →
              </Button>
            </CardContent>
          </Card>
        </div>
      </FluxoLayout>
    );
  }

  return (
    <FluxoLayout
      currentStep={6}
      title="Agendamento de Entrevista"
      subtitle="Escolha a data e o horário para sua entrevista técnica. A entrevista será realizada por videoconferência."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Info */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">Sobre a entrevista técnica</p>
            <p>A entrevista tem duração de aproximadamente 45 a 60 minutos. Será conduzida por um avaliador especialista em {certAtual.nome}. A decisão da entrevista é final — não há possibilidade de recurso ou nova tentativa.</p>
          </div>
        </div>

        {/* Date Selection */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-700" />
              Selecione a data
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {datas.map((d) => (
                <button
                  key={d.data}
                  onClick={() => setDataSelecionada(d.data)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl border-2 transition-all text-xs",
                    dataSelecionada === d.data
                      ? "border-blue-900 bg-blue-50 text-blue-900"
                      : "border-border hover:border-blue-300 text-foreground"
                  )}
                >
                  <span className="text-muted-foreground capitalize">{d.diaSemana}</span>
                  <span className="font-bold text-base mt-1">{d.label.split(" ")[0]}</span>
                  <span className="capitalize">{d.label.split(" ")[1]}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Selection */}
        {dataSelecionada && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-700" />
                Selecione o horário
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {HORARIOS.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorarioSelecionado(h)}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all text-sm font-medium",
                      horarioSelecionado === h
                        ? "border-blue-900 bg-blue-50 text-blue-900"
                        : "border-border hover:border-blue-300 text-foreground"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {dataSelecionada && horarioSelecionado && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-blue-900 mb-2">Resumo do agendamento:</p>
              <div className="space-y-1 text-sm text-blue-800">
                <p>📅 {new Date(dataSelecionada + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p>
                <p>🕐 {horarioSelecionado} (horário de Brasília)</p>
                <p>🎥 Videoconferência</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          className="w-full bg-blue-900 hover:bg-blue-800"
          size="lg"
          onClick={handleConfirmar}
          disabled={!dataSelecionada || !horarioSelecionado}
        >
          Confirmar Agendamento →
        </Button>
      </div>
    </FluxoLayout>
  );
}
