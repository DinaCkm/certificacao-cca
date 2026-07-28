import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { Calendar, Clock, Video, CheckCircle, Info, AlertCircle, RefreshCw, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface SalaDisponivel {
  id: number;
  data_hora: string;
  duracao_minutos: number;
  vagas_disponiveis: number;
  capacidade_maxima: number;
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

export function AgendamentoProva() {
  const { processo, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  const [salas, setSalas] = useState<SalaDisponivel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregar, setErroCarregar] = useState<string>("");
  const [salaSelecionada, setSalaSelecionada] = useState<SalaDisponivel | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [agendamento, setAgendamento] = useState<{ data_hora: string; duracao_minutos: number } | null>(null);

  useEffect(() => {
    if (!processo.certificacaoId) navigate("/novo-fluxo");
    else carregarSalas();
  }, [processo.certificacaoId]);

  async function carregarSalas() {
    setCarregando(true);
    setErroCarregar("");
    try {
      const { salas } = await api.provaAgendamento.salasDisponiveis();
      setSalas(salas);
    } catch (err: any) {
      setErroCarregar(err.message || "Erro ao carregar horários disponíveis");
      setSalas([]);
    } finally {
      setCarregando(false);
    }
  }

  async function handleConfirmar() {
    if (!salaSelecionada) {
      toast({ title: "Selecione um horário", variant: "destructive" });
      return;
    }
    setConfirmando(true);
    try {
      const result = await api.provaAgendamento.agendar(salaSelecionada.id);
      setAgendamento({ data_hora: result.data_hora, duracao_minutos: result.duracao_minutos });
      setConfirmado(true);
    } catch (err: any) {
      toast({ title: err.message || "Erro ao agendar", variant: "destructive" });
      carregarSalas();
      setSalaSelecionada(null);
    } finally {
      setConfirmando(false);
    }
  }

  if (!certAtual) return null;

  if (confirmado && agendamento) {
    const fmt = formatDataHora(agendamento.data_hora);
    return (
      <FluxoLayout currentStep={5} title="Prova Agendada!">
        <div className="max-w-xl mx-auto">
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-green-800 mb-2">Prova agendada!</h2>
              <p className="text-sm text-green-700 mb-6">Você receberá um e-mail de confirmação. A sala libera 15 minutos antes do horário.</p>
              <div className="bg-white rounded-xl border border-green-200 p-5 mb-6 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium capitalize">{fmt.completo}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">{fmt.hora} (horário de Brasília) · {agendamento.duracao_minutos} min</span>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Câmera e microfone obrigatórios — gravação automática</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-left mb-5">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">
                  Fique na tela da prova o tempo todo. Sair da aba ou do modo tela cheia mais de 3 vezes anula a tentativa automaticamente.
                </p>
              </div>
              <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={() => navigate("/novo-fluxo/sala-prova")}>
                Ver minha sala de prova →
              </Button>
            </CardContent>
          </Card>
        </div>
      </FluxoLayout>
    );
  }

  return (
    <FluxoLayout currentStep={5} title="Agendamento da Prova" subtitle="Escolha a data e o horário para sua prova de competência. A prova é feita dentro da plataforma, com sala de vídeo ao vivo e fiscalização.">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">Sobre a prova</p>
            <p>
              A prova acontece em uma sala de vídeo ao vivo, com outros candidatos e um fiscal, e é gravada automaticamente
              (câmera e microfone). Garanta uma conexão estável e permaneça na tela da prova o tempo todo.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700" /> Horários disponíveis
              </h3>
              <button onClick={carregarSalas} className="text-xs text-blue-700 flex items-center gap-1 hover:underline">
                <RefreshCw className="w-3 h-3" /> Atualizar
              </button>
            </div>

            {carregando ? (
              <div className="py-10 text-center text-gray-400">
                <div className="w-6 h-6 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Buscando horários disponíveis...</p>
              </div>
            ) : erroCarregar ? (
              <div className="py-10 text-center">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">{erroCarregar}</p>
              </div>
            ) : salas.length === 0 ? (
              <div className="py-10 text-center">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">Nenhum horário disponível no momento</p>
                <p className="text-xs text-gray-400 mt-1">Nossa equipe está cadastrando novos horários. Aguarde contato por e-mail.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {salas.map((sala) => {
                  const fmt = formatDataHora(sala.data_hora);
                  const selecionada = salaSelecionada?.id === sala.id;
                  return (
                    <button key={sala.id} onClick={() => setSalaSelecionada(sala)}
                      className={cn("w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                        selecionada ? "border-blue-900 bg-blue-50" : "border-border hover:border-blue-300")}>
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold",
                          selecionada ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-700")}>
                          {new Date(sala.data_hora).getDate()}
                        </div>
                        <div>
                          <p className={cn("text-sm font-semibold capitalize", selecionada ? "text-blue-900" : "text-foreground")}>
                            {fmt.diaSemana}, {fmt.dia}
                          </p>
                          <p className={cn("text-xs flex items-center gap-3 flex-wrap", selecionada ? "text-blue-700" : "text-muted-foreground")}>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmt.hora} · {sala.duracao_minutos} min</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{sala.vagas_disponiveis} vaga(s)</span>
                          </p>
                        </div>
                      </div>
                      {selecionada && <CheckCircle className="w-5 h-5 text-blue-900 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {salaSelecionada && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-blue-900 mb-2">Resumo:</p>
              <div className="space-y-1 text-sm text-blue-800">
                <p>📅 {formatDataHora(salaSelecionada.data_hora).completo}</p>
                <p>🕐 {formatDataHora(salaSelecionada.data_hora).hora} (horário de Brasília)</p>
                <p className="flex items-center gap-1">⏱ {salaSelecionada.duracao_minutos} minutos · <ShieldCheck className="w-3.5 h-3.5" /> Sala com fiscal e gravação</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg"
          onClick={handleConfirmar} disabled={!salaSelecionada || confirmando || salas.length === 0}>
          {confirmando ? "Confirmando..." : "Confirmar Agendamento →"}
        </Button>
      </div>
    </FluxoLayout>
  );
}
