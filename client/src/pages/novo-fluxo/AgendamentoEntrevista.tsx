import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { Calendar, Clock, Video, CheckCircle, Info, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Slot {
  id: number;
  data_hora: string;
  duracao_minutos: number;
  entrevistador_nome: string;
}

function formatDataHora(dataHora: string) {
  const d = new Date(dataHora);
  return {
    diaSemana: d.toLocaleDateString("pt-BR", { weekday: "long" }),
    dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }),
    hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    completo: d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
  };
}

export function AgendamentoEntrevista() {
  const { processo, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [slotSelecionado, setSlotSelecionado] = useState<Slot | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [agendamento, setAgendamento] = useState<{ data_hora: string } | null>(null);

  useEffect(() => {
    if (!processo.certificacaoId) navigate("/novo-fluxo");
    else carregarSlots();
  }, [processo.certificacaoId]);

  async function carregarSlots() {
    setCarregando(true);
    try {
      const { slots } = await api.processo.slotsDisponiveis();
      setSlots(slots);
    } catch (err: any) {
      toast({ title: "Erro ao carregar horários disponíveis", variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  async function handleConfirmar() {
    if (!slotSelecionado) {
      toast({ title: "Selecione um horário", variant: "destructive" });
      return;
    }
    const processoId = localStorage.getItem("anefac_processo_id");
    if (!processoId) {
      toast({ title: "Erro: processo não identificado. Faça login novamente.", variant: "destructive" });
      return;
    }
    setConfirmando(true);
    try {
      const result = await api.processo.agendarEntrevista(slotSelecionado.id, parseInt(processoId));
      setAgendamento({ data_hora: result.data_hora });
      setConfirmado(true);
    } catch (err: any) {
      toast({ title: err.message || "Erro ao agendar", variant: "destructive" });
      carregarSlots();
      setSlotSelecionado(null);
    } finally {
      setConfirmando(false);
    }
  }

  if (!certAtual) return null;

  if (confirmado && agendamento) {
    const fmt = formatDataHora(agendamento.data_hora);
    return (
      <FluxoLayout currentStep={5} title="Entrevista Agendada!">
        <div className="max-w-xl mx-auto">
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-green-800 mb-2">Entrevista confirmada!</h2>
              <p className="text-sm text-green-700 mb-6">Você receberá um e-mail de confirmação com o link de acesso.</p>
              <div className="bg-white rounded-xl border border-green-200 p-5 mb-6 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium capitalize">{fmt.completo}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">{fmt.hora} (horário de Brasília)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Videoconferência — link enviado por e-mail</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-left mb-5">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">O agendamento é definitivo. Caso precise cancelar, entre em contato com a ANEFAC.</p>
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
    <FluxoLayout currentStep={5} title="Agendamento de Entrevista" subtitle="Escolha a data e o horário para sua entrevista técnica. A entrevista será realizada por videoconferência.">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">Sobre a entrevista técnica</p>
            <p>Duração de 45 a 60 minutos, conduzida por especialista em {certAtual.nome}. A decisão é final e o agendamento é definitivo após confirmação.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700" /> Horários disponíveis
              </h3>
              <button onClick={carregarSlots} className="text-xs text-blue-700 flex items-center gap-1 hover:underline">
                <RefreshCw className="w-3 h-3" /> Atualizar
              </button>
            </div>

            {carregando ? (
              <div className="py-10 text-center text-gray-400">
                <div className="w-6 h-6 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Buscando horários disponíveis...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="py-10 text-center">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">Nenhum horário disponível no momento</p>
                <p className="text-xs text-gray-400 mt-1">Nossa equipe está cadastrando novos horários. Aguarde contato por e-mail.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {slots.map((slot) => {
                  const fmt = formatDataHora(slot.data_hora);
                  const selecionado = slotSelecionado?.id === slot.id;
                  return (
                    <button key={slot.id} onClick={() => setSlotSelecionado(slot)}
                      className={cn("w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                        selecionado ? "border-blue-900 bg-blue-50" : "border-border hover:border-blue-300")}>
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold",
                          selecionado ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-700")}>
                          {new Date(slot.data_hora).getDate()}
                        </div>
                        <div>
                          <p className={cn("text-sm font-semibold capitalize", selecionado ? "text-blue-900" : "text-foreground")}>
                            {fmt.diaSemana}, {fmt.dia}
                          </p>
                          <p className={cn("text-xs flex items-center gap-1", selecionado ? "text-blue-700" : "text-muted-foreground")}>
                            <Clock className="w-3 h-3" />{fmt.hora} · {slot.duracao_minutos} min
                          </p>
                        </div>
                      </div>
                      {selecionado && <CheckCircle className="w-5 h-5 text-blue-900 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {slotSelecionado && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-blue-900 mb-2">Resumo:</p>
              <div className="space-y-1 text-sm text-blue-800">
                <p>📅 {formatDataHora(slotSelecionado.data_hora).completo}</p>
                <p>🕐 {formatDataHora(slotSelecionado.data_hora).hora} (horário de Brasília)</p>
                <p>⏱ {slotSelecionado.duracao_minutos} minutos · 🎥 Videoconferência</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg"
          onClick={handleConfirmar} disabled={!slotSelecionado || confirmando || slots.length === 0}>
          {confirmando ? "Confirmando..." : "Confirmar Agendamento →"}
        </Button>
      </div>
    </FluxoLayout>
  );
}
