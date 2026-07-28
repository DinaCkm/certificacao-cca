import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  Clock, AlertCircle, CheckCircle, XCircle, Loader2, Shield,
  Video, Camera, Mic, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";

interface Questao {
  id: number;
  numero: number;
  enunciado: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c?: string;
  opcao_d?: string;
}

interface Agendamento {
  agendamento_id: number;
  sala_id: number;
  data_hora: string;
  duracao_minutos: number;
  sala_status: string;
  cert_nome: string;
}

const LIMITE_VIOLACOES = 3;

function getToken() { return localStorage.getItem("anefac_token"); }

async function apiProva(method: string, path: string, body?: any) {
  const res = await fetch(`/api/prova${path}`, {
    method,
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro na API");
  return data;
}

function formatDataHora(dataHora: string) {
  const d = new Date(dataHora);
  return {
    completo: d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
    hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function SalaProva() {
  const { getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  const [fase, setFase] = useState<
    "carregando" | "sem_agendamento" | "aguardando" | "pronto_entrar" |
    "entrando" | "em_prova" | "submetendo" | "anulada" | "erro"
  >("carregando");
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [motivoErro, setMotivoErro] = useState("");
  const [contagem, setContagem] = useState("");

  // Prova
  const [tentativaId, setTentativaId] = useState<number | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [tempoRestante, setTempoRestante] = useState(0);
  const [violacoesCount, setViolacoesCount] = useState(0);
  const [avisoViolacao, setAvisoViolacao] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const emProvaRef = useRef(false);

  // Daily
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);

  useEffect(() => {
    carregarAgendamento();
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      callRef.current?.destroy();
    };
  }, []);

  // Countdown até a sala abrir (15 min antes)
  useEffect(() => {
    if (fase !== "aguardando" || !agendamento) return;
    const t = setInterval(() => {
      const abreEm = new Date(agendamento.data_hora).getTime() - 15 * 60 * 1000;
      const diff = abreEm - Date.now();
      if (diff <= 0) {
        setFase("pronto_entrar");
        clearInterval(t);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setContagem(`${h > 0 ? h + "h " : ""}${String(m).padStart(2, "0")}min ${String(s).padStart(2, "0")}s`);
    }, 1000);
    return () => clearInterval(t);
  }, [fase, agendamento]);

  // Cronômetro da prova
  useEffect(() => {
    if (fase !== "em_prova") return;
    timerRef.current = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmeter(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [fase]);

  // Detecção de violações — só ativa durante a prova
  useEffect(() => {
    emProvaRef.current = fase === "em_prova";
  }, [fase]);

  useEffect(() => {
    function onVisibility() {
      if (document.hidden && emProvaRef.current) reportarViolacao("troca_aba");
    }
    function onFullscreenChange() {
      if (!document.fullscreenElement && emProvaRef.current) reportarViolacao("saida_fullscreen");
    }
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  async function carregarAgendamento() {
    setFase("carregando");
    try {
      const { agendamento } = await api.provaAgendamento.meuAgendamento();
      if (!agendamento) {
        setFase("sem_agendamento");
        return;
      }
      setAgendamento(agendamento);
      const abreEm = new Date(agendamento.data_hora).getTime() - 15 * 60 * 1000;
      setFase(Date.now() >= abreEm ? "pronto_entrar" : "aguardando");
    } catch (err: any) {
      setMotivoErro(err.message || "Erro ao verificar agendamento");
      setFase("erro");
    }
  }

  async function handleEntrarNaSala() {
    if (!agendamento) return;
    setFase("entrando");
    try {
      // Pede câmera/microfone e tela cheia num único gesto do usuário
      await document.documentElement.requestFullscreen().catch(() => {
        toast({ title: "Não foi possível ativar tela cheia — tente novamente", variant: "destructive" });
      });

      const result = await api.provaAgendamento.entrarNaSala(agendamento.sala_id);
      setTentativaId(result.tentativa_id);

      // Cria e conecta a chamada de vídeo (UI pronta do Daily, câmera+mic+gravação já configurados no backend)
      if (videoContainerRef.current) {
        const call = DailyIframe.createFrame(videoContainerRef.current, {
          iframeStyle: { width: "100%", height: "100%", border: "0" },
          showLeaveButton: false,
          showFullscreenButton: false,
        });
        callRef.current = call;
        await call.join({ url: result.daily_room_url, token: result.daily_token });
      }

      // Busca questões e config
      const config = await fetch(`/api/admin/prova-config/${certAtual?.id}`).then((r) => r.json()).catch(() => null);
      const questoesData = await apiProva("GET", `/questoes/${result.tentativa_id}`);
      setQuestoes(questoesData.questoes);
      setTempoRestante((config?.config?.duracao_minutos || agendamento.duracao_minutos || 60) * 60);

      setFase("em_prova");
    } catch (err: any) {
      toast({ title: err.message || "Erro ao entrar na sala", variant: "destructive" });
      setFase("pronto_entrar");
    }
  }

  async function reportarViolacao(tipo: "troca_aba" | "saida_fullscreen") {
    if (!tentativaId) return;
    try {
      const result = await api.provaAgendamento.registrarViolacao(tentativaId, tipo);
      setViolacoesCount(result.violacoes_count);
      if (result.anulada) {
        setFase("anulada");
        callRef.current?.destroy();
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      } else {
        setAvisoViolacao(
          tipo === "troca_aba"
            ? "Você saiu da tela da prova."
            : "Você saiu do modo tela cheia."
        );
      }
    } catch {
      // Falha ao registrar não deve travar a prova — só não conta a violação
    }
  }

  async function handleSubmeter(porTempo = false) {
    if (!tentativaId) return;
    if (!porTempo && Object.keys(respostas).length < questoes.length) {
      toast({ title: `Responda todas as ${questoes.length} questões antes de finalizar`, variant: "destructive" });
      return;
    }
    setFase("submetendo");
    emProvaRef.current = false;
    try {
      const respostasArray = questoes.map((q) => ({ questao_id: q.id, resposta: respostas[q.id] ?? -1 }));
      const resultado = await apiProva("POST", "/submeter", { tentativa_id: tentativaId, respostas: respostasArray });

      localStorage.setItem("anefac_resultado_prova", JSON.stringify({
        tentativa_id: tentativaId,
        numero_tentativa: resultado.numero_tentativa,
        acertos: resultado.acertos,
        total: resultado.total_questoes,
        percentual: resultado.percentual,
        aprovado: resultado.aprovado,
        proximo_status: resultado.proximo_status,
        nota_minima: resultado.nota_minima,
      }));

      callRef.current?.destroy();
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
      navigate("/novo-fluxo/resultado-prova");
    } catch (err: any) {
      toast({ title: err.message || "Erro ao submeter prova", variant: "destructive" });
      setFase("em_prova");
      emProvaRef.current = true;
    }
  }

  const formatarTempo = (seg: number) => {
    const m = Math.floor(seg / 60).toString().padStart(2, "0");
    const s = (seg % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const opcoes = (q: Questao) => [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(Boolean) as string[];
  const progresso = questoes.length > 0 ? (Object.keys(respostas).length / questoes.length) * 100 : 0;

  // ── Carregando ─────────────────────────────────────────────────────────────
  if (fase === "carregando") {
    return (
      <FluxoLayout currentStep={5} title="Sala de Prova">
        <div className="max-w-md mx-auto text-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-blue-700 mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando seu agendamento...</p>
        </div>
      </FluxoLayout>
    );
  }

  // ── Sem agendamento ──────────────────────────────────────────────────────────
  if (fase === "sem_agendamento") {
    return (
      <FluxoLayout currentStep={5} title="Sala de Prova">
        <div className="max-w-md mx-auto">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-14 h-14 text-amber-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-amber-800 mb-2">Nenhuma prova agendada</h2>
              <p className="text-sm text-amber-700 mb-6">Você ainda não agendou sua prova de competência.</p>
              <Button className="bg-blue-900 hover:bg-blue-800" onClick={() => navigate("/novo-fluxo/agendar-prova")}>
                Agendar minha prova →
              </Button>
            </CardContent>
          </Card>
        </div>
      </FluxoLayout>
    );
  }

  // ── Erro ─────────────────────────────────────────────────────────────────────
  if (fase === "erro") {
    return (
      <FluxoLayout currentStep={5} title="Sala de Prova">
        <div className="max-w-md mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-800 mb-2">Não foi possível acessar a sala</h2>
              <p className="text-sm text-red-700 mb-6">{motivoErro}</p>
              <Button variant="outline" onClick={() => navigate("/novo-fluxo/aguardando-validacao")}>Voltar ao painel</Button>
            </CardContent>
          </Card>
        </div>
      </FluxoLayout>
    );
  }

  // ── Anulada ──────────────────────────────────────────────────────────────────
  if (fase === "anulada") {
    return (
      <FluxoLayout currentStep={5} title="Sala de Prova">
        <div className="max-w-md mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-800 mb-2">Prova anulada</h2>
              <p className="text-sm text-red-700 mb-6">
                Sua tentativa foi anulada automaticamente após {LIMITE_VIOLACOES} saídas da tela da prova.
              </p>
              <Button variant="outline" onClick={() => navigate("/novo-fluxo/aguardando-validacao")}>Voltar ao painel</Button>
            </CardContent>
          </Card>
        </div>
      </FluxoLayout>
    );
  }

  // ── Aguardando abertura da sala ───────────────────────────────────────────────
  if (fase === "aguardando" && agendamento) {
    const fmt = formatDataHora(agendamento.data_hora);
    return (
      <FluxoLayout currentStep={5} title="Sala de Prova">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-14 h-14 text-blue-700 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-1">A sala ainda não abriu</h2>
              <p className="text-sm text-muted-foreground mb-1 capitalize">{fmt.completo}</p>
              <p className="text-sm text-muted-foreground mb-6">às {fmt.hora} — abre 15 minutos antes</p>
              <div className="font-mono text-2xl font-bold text-blue-900 bg-blue-50 rounded-xl py-3 mb-2">{contagem}</div>
              <p className="text-xs text-muted-foreground">Esta página atualiza sozinha quando a sala abrir.</p>
            </CardContent>
          </Card>
        </div>
      </FluxoLayout>
    );
  }

  // ── Pronto para entrar ─────────────────────────────────────────────────────────
  if (fase === "pronto_entrar" || fase === "entrando") {
    return (
      <FluxoLayout currentStep={5} title="Sala de Prova">
        <div className="max-w-md mx-auto">
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-8 text-center">
              <Video className="w-14 h-14 text-green-600 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-green-800 mb-2">Sala aberta — pode entrar</h2>
              <p className="text-sm text-green-700 mb-6">{agendamento?.cert_nome}</p>

              <div className="bg-white rounded-xl border border-green-200 p-4 mb-5 text-left space-y-2 text-xs text-gray-700">
                <p className="flex items-center gap-2"><Camera className="w-3.5 h-3.5 text-green-600" /> Câmera e microfone ficarão ligados e gravando</p>
                <p className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-green-600" /> A prova entra em modo tela cheia</p>
                <p className="flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Sair da tela mais de {LIMITE_VIOLACOES}x anula a tentativa</p>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" onClick={handleEntrarNaSala} disabled={fase === "entrando"}>
                {fase === "entrando" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar na sala e iniciar prova →"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </FluxoLayout>
    );
  }

  // ── Submetendo ───────────────────────────────────────────────────────────────
  if (fase === "submetendo") {
    return (
      <FluxoLayout currentStep={5} title="Sala de Prova">
        <div className="max-w-md mx-auto text-center py-16">
          <Loader2 className="w-12 h-12 animate-spin text-blue-700 mx-auto mb-4" />
          <p className="text-muted-foreground">Calculando resultado...</p>
        </div>
      </FluxoLayout>
    );
  }

  // ── Em prova ─────────────────────────────────────────────────────────────────
  const alertaTempo = tempoRestante < 300;

  return (
    <FluxoLayout currentStep={5} title="Prova de Competência" maxWidth="lg">
      {avisoViolacao && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="max-w-sm border-red-300">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="font-bold text-red-700 mb-1">Atenção!</h3>
              <p className="text-sm text-gray-700 mb-4">{avisoViolacao}</p>
              <p className="text-xs text-gray-500 mb-4">
                Violação {violacoesCount} de {LIMITE_VIOLACOES}. Ao atingir {LIMITE_VIOLACOES}, a prova é anulada automaticamente.
              </p>
              <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={() => setAvisoViolacao(null)}>Entendi, continuar</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sala de vídeo — pequena, sempre visível */}
      <div ref={videoContainerRef} className="fixed bottom-4 right-4 w-64 h-40 rounded-xl overflow-hidden shadow-2xl border-2 border-white z-30 bg-black" />

      <div className="sticky top-0 z-20 bg-background border-b border-border py-3 -mx-4 px-4 mb-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{Object.keys(respostas).length}/{questoes.length} respondidas</span>
            {violacoesCount > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                {violacoesCount}/{LIMITE_VIOLACOES} violações
              </span>
            )}
          </div>
          <div className={cn("flex items-center gap-2 font-mono font-bold text-lg px-4 py-1.5 rounded-xl",
            alertaTempo ? "bg-red-100 text-red-700 animate-pulse" : "bg-blue-50 text-blue-900")}>
            <Clock className="w-4 h-4" />
            {formatarTempo(tempoRestante)}
          </div>
        </div>
        <div className="max-w-2xl mx-auto mt-2">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300 rounded-full" style={{ width: `${progresso}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-5 pb-24">
        {alertaTempo && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-sm text-red-700 font-medium">Menos de 5 minutos restantes! A prova será enviada automaticamente quando o tempo acabar.</p>
          </div>
        )}

        {questoes.map((q, idx) => (
          <Card key={q.id} className={cn("border-2 transition-all", respostas[q.id] !== undefined ? "border-blue-200 bg-blue-50/30" : "border-border")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                <p className="font-medium text-foreground leading-relaxed">{q.enunciado}</p>
              </div>
              <div className="space-y-2 ml-9">
                {opcoes(q).map((op, oi) => (
                  <button key={oi} onClick={() => setRespostas((prev) => ({ ...prev, [q.id]: oi }))}
                    className={cn("w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all",
                      respostas[q.id] === oi
                        ? "border-blue-600 bg-blue-600 text-white font-medium"
                        : "border-border hover:border-blue-300 hover:bg-blue-50")}>
                    <span className="font-bold mr-2">{["A", "B", "C", "D"][oi]}.</span>{op}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-4 px-4">
        <div className="max-w-2xl mx-auto">
          <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg"
            onClick={() => handleSubmeter(false)}
            disabled={Object.keys(respostas).length < questoes.length}>
            {Object.keys(respostas).length < questoes.length
              ? `Responda mais ${questoes.length - Object.keys(respostas).length} questão(ões)`
              : "Finalizar e Enviar Prova →"}
          </Button>
        </div>
      </div>
    </FluxoLayout>
  );
}
