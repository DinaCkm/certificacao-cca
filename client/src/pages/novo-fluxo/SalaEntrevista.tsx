import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Video, Mic, MicOff, VideoOff, Phone, CheckCircle, Clock, User, Calendar, Award } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDataHora(dataHora: string) {
  const d = new Date(dataHora);
  return {
    completo: d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
    hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function Countdown({ dataHora }: { dataHora: string }) {
  const [diff, setDiff] = useState(new Date(dataHora).getTime() - Date.now());

  useEffect(() => {
    const t = setInterval(() => setDiff(new Date(dataHora).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [dataHora]);

  if (diff <= 0) return (
    <div className="bg-green-100 rounded-xl p-4 text-center">
      <p className="text-lg font-bold text-green-800">🟢 A sala está aberta agora!</p>
    </div>
  );

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seg = Math.floor((diff % (1000 * 60)) / 1000);

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center">
      <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-3">
        Tempo restante para a entrevista
      </p>
      <div className="flex items-center justify-center gap-3">
        {dias > 0 && (
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-900 font-mono">{String(dias).padStart(2,"0")}</p>
            <p className="text-xs text-indigo-600 mt-1">dias</p>
          </div>
        )}
        <div className="text-center">
          <p className="text-3xl font-bold text-indigo-900 font-mono">{String(horas).padStart(2,"0")}</p>
          <p className="text-xs text-indigo-600 mt-1">horas</p>
        </div>
        <p className="text-2xl font-bold text-indigo-400 mb-3">:</p>
        <div className="text-center">
          <p className="text-3xl font-bold text-indigo-900 font-mono">{String(min).padStart(2,"0")}</p>
          <p className="text-xs text-indigo-600 mt-1">min</p>
        </div>
        <p className="text-2xl font-bold text-indigo-400 mb-3">:</p>
        <div className="text-center">
          <p className="text-3xl font-bold text-indigo-900 font-mono">{String(seg).padStart(2,"0")}</p>
          <p className="text-xs text-indigo-600 mt-1">seg</p>
        </div>
      </div>
      <p className="text-xs text-indigo-500 mt-3">A sala abrirá automaticamente no horário agendado</p>
    </div>
  );
}

export function SalaEntrevista() {
  const { processo, definirResultadoEntrevista, getCertificacaoAtual } = useCertification();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const certAtual = getCertificacaoAtual();

  const [agendamento, setAgendamento] = useState<{
    data_hora: string;
    entrevistador_nome: string;
    candidato_nome: string;
  } | null>(null);

  const [fase, setFase] = useState<"aguardando" | "em_andamento" | "encerrada">("aguardando");
  const [micAtivo, setMicAtivo] = useState(true);
  const [camAtiva, setCamAtiva] = useState(true);
  const [tempo, setTempo] = useState(0);

  useEffect(() => {
    if (!processo.certificacaoId) { navigate("/novo-fluxo"); return; }

    // Busca dados do agendamento
    const token = localStorage.getItem("anefac_token");
    const processoId = localStorage.getItem("anefac_processo_id");
    if (!token || !processoId) return;

    fetch(`/api/processo/agendamento/${processoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      if (data?.data_hora) {
        setAgendamento({
          data_hora: data.data_hora,
          entrevistador_nome: data.entrevistador_nome || "Avaliador ANEFAC",
          candidato_nome: processo.candidatoNome || (user as any)?.full_name || "Candidato",
        });
      }
    }).catch(() => {});
  }, [processo.certificacaoId]);

  useEffect(() => {
    if (fase === "em_andamento") {
      const t = setInterval(() => setTempo(p => p + 1), 1000);
      return () => clearInterval(t);
    }
  }, [fase]);

  const formatTempo = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const handleEncerrar = () => setFase("encerrada");
  const handleResultado = (aprovado: boolean) => {
    definirResultadoEntrevista(aprovado);
    navigate("/novo-fluxo/resultado-entrevista");
  };

  if (!certAtual) return null;

  const fmt = agendamento ? formatDataHora(agendamento.data_hora) : null;

  return (
    <FluxoLayout currentStep={5} title="Sala de Entrevista" subtitle="Entrevista técnica por videoconferência">

      {/* ── Informações da entrevista (sempre visível) ─────────────────── */}
      {agendamento && fmt && (
        <Card className="mb-6 border-indigo-200">
          <CardContent className="p-5">
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Candidato</p>
                  <p className="font-semibold">{agendamento.candidato_nome}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Avaliador</p>
                  <p className="font-semibold">{agendamento.entrevistador_nome}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Data e horário</p>
                  <p className="font-semibold capitalize">{fmt.completo}</p>
                  <p className="text-xs text-muted-foreground">{fmt.hora} (horário de Brasília)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Fase: aguardando ─────────────────────────────────────────────── */}
      {fase === "aguardando" && (
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Contador regressivo */}
          {agendamento && <Countdown dataHora={agendamento.data_hora} />}

          {/* Verificação de equipamentos */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Verificação de equipamentos
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Video, label: "Câmera", ok: true },
                  { icon: Mic, label: "Microfone", ok: true },
                  { icon: CheckCircle, label: "Conexão com a internet", ok: true },
                ].map(({ icon: Icon, label, ok }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", ok ? "bg-green-100" : "bg-red-100")}>
                      <Icon className={cn("w-4 h-4", ok ? "text-green-600" : "text-red-600")} />
                    </div>
                    <span className="text-sm">{label}</span>
                    <span className={cn("ml-auto text-xs font-medium", ok ? "text-green-600" : "text-red-600")}>
                      {ok ? "✓ OK" : "Problema"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-indigo-900 hover:bg-indigo-800" size="lg"
            onClick={() => setFase("em_andamento")}>
            <Video className="w-4 h-4 mr-2" /> Entrar na sala de entrevista
          </Button>
        </div>
      )}

      {/* ── Fase: em andamento ───────────────────────────────────────────── */}
      {fase === "em_andamento" && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-900 rounded-2xl overflow-hidden mb-4 aspect-video relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">{agendamento?.entrevistador_nome || "Avaliador ANEFAC"}</p>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-xl border-2 border-gray-600 flex items-center justify-center">
              {camAtiva ? <User className="w-8 h-8 text-gray-400" /> : <VideoOff className="w-8 h-8 text-gray-500" />}
            </div>
            <div className="absolute top-4 left-4 bg-black/60 text-white text-sm font-mono px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {formatTempo(tempo)}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <button onClick={() => setMicAtivo(!micAtivo)}
              className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all",
                micAtivo ? "bg-gray-200 hover:bg-gray-300" : "bg-red-500 hover:bg-red-600")}>
              {micAtivo ? <Mic className="w-5 h-5 text-gray-700" /> : <MicOff className="w-5 h-5 text-white" />}
            </button>
            <button onClick={() => setCamAtiva(!camAtiva)}
              className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all",
                camAtiva ? "bg-gray-200 hover:bg-gray-300" : "bg-red-500 hover:bg-red-600")}>
              {camAtiva ? <Video className="w-5 h-5 text-gray-700" /> : <VideoOff className="w-5 h-5 text-white" />}
            </button>
            <button onClick={handleEncerrar}
              className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center">
              <Phone className="w-5 h-5 text-white rotate-[135deg]" />
            </button>
          </div>
        </div>
      )}

      {/* ── Fase: encerrada ──────────────────────────────────────────────── */}
      {fase === "encerrada" && (
        <div className="max-w-xl mx-auto">
          <Card className="border-blue-200">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Entrevista encerrada</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Obrigado pela participação. O avaliador registrará o resultado em até 2 dias úteis.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleResultado(true)}>
                  ✓ Aprovado (demo)
                </Button>
                <Button variant="destructive" onClick={() => handleResultado(false)}>
                  ✗ Reprovado (demo)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </FluxoLayout>
  );
}
