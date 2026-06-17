import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { Video, Mic, MicOff, VideoOff, Phone, CheckCircle, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function SalaEntrevista() {
  const { processo, definirResultadoEntrevista, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const certAtual = getCertificacaoAtual();

  const [fase, setFase] = useState<"aguardando" | "em_andamento" | "encerrada">("aguardando");
  const [micAtivo, setMicAtivo] = useState(true);
  const [camAtiva, setCamAtiva] = useState(true);
  const [tempo, setTempo] = useState(0);

  useEffect(() => {
    if (!processo.certificacaoId) navigate("/novo-fluxo");
  }, [processo.certificacaoId, navigate]);

  useEffect(() => {
    if (fase === "em_andamento") {
      const t = setInterval(() => setTempo((p) => p + 1), 1000);
      return () => clearInterval(t);
    }
  }, [fase]);

  const formatTempo = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleEncerrar = () => {
    setFase("encerrada");
  };

  const handleResultado = (aprovado: boolean) => {
    definirResultadoEntrevista(aprovado);
    navigate("/novo-fluxo/resultado-entrevista");
  };

  if (!certAtual) return null;

  return (
    <FluxoLayout currentStep={5} title="Sala de Entrevista" subtitle="Entrevista técnica por videoconferência">
      {fase === "aguardando" && (
        <div className="max-w-2xl mx-auto">
          <Card className="border-blue-200 bg-blue-50 mb-6">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-blue-600 mx-auto mb-3 animate-pulse" />
              <h2 className="text-lg font-bold text-blue-900 mb-2">Aguardando o avaliador...</h2>
              <p className="text-sm text-blue-700">O avaliador entrará na sala em instantes. Verifique sua câmera e microfone.</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Verificação de equipamentos</h3>
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
                    <span className="text-sm text-foreground">{label}</span>
                    <span className={cn("ml-auto text-xs font-medium", ok ? "text-green-600" : "text-red-600")}>
                      {ok ? "OK" : "Problema detectado"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg" onClick={() => setFase("em_andamento")}>
            <Video className="w-4 h-4 mr-2" />
            Entrar na sala de entrevista
          </Button>
        </div>
      )}

      {fase === "em_andamento" && (
        <div className="max-w-3xl mx-auto">
          {/* Video Area */}
          <div className="bg-gray-900 rounded-2xl overflow-hidden mb-4 aspect-video relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">Dr. Carlos Mendes — Avaliador ANEFAC</p>
              </div>
            </div>
            {/* Self view */}
            <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-xl border-2 border-gray-600 flex items-center justify-center">
              {camAtiva ? (
                <User className="w-8 h-8 text-gray-400" />
              ) : (
                <VideoOff className="w-8 h-8 text-gray-500" />
              )}
            </div>
            {/* Timer */}
            <div className="absolute top-4 left-4 bg-black/60 text-white text-sm font-mono px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {formatTempo(tempo)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => setMicAtivo(!micAtivo)}
              className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all", micAtivo ? "bg-gray-200 hover:bg-gray-300" : "bg-red-500 hover:bg-red-600")}
            >
              {micAtivo ? <Mic className="w-5 h-5 text-gray-700" /> : <MicOff className="w-5 h-5 text-white" />}
            </button>
            <button
              onClick={() => setCamAtiva(!camAtiva)}
              className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all", camAtiva ? "bg-gray-200 hover:bg-gray-300" : "bg-red-500 hover:bg-red-600")}
            >
              {camAtiva ? <Video className="w-5 h-5 text-gray-700" /> : <VideoOff className="w-5 h-5 text-white" />}
            </button>
            <button
              onClick={handleEncerrar}
              className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all"
            >
              <Phone className="w-5 h-5 text-white rotate-[135deg]" />
            </button>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-xs text-blue-800 text-center">
                <strong>Lembrete:</strong> A entrevista é a etapa decisória final. Seja claro e objetivo nas suas respostas.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {fase === "encerrada" && (
        <div className="max-w-xl mx-auto">
          <Card className="border-blue-200">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Entrevista encerrada</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Obrigado pela participação. O avaliador irá registrar o resultado. Você será notificado por e-mail em até 2 dias úteis.
              </p>
              <p className="text-xs text-muted-foreground mb-6 italic">
                (Simulação: escolha o resultado para continuar o fluxo de demonstração)
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
