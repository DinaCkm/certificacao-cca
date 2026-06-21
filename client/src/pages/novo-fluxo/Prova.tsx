import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { Clock, AlertCircle, CheckCircle, XCircle, Loader2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Questao {
  id: number;
  numero: number;
  enunciado: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c?: string;
  opcao_d?: string;
}

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

export function Prova() {
  const { processo, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  // Estados da prova
  const [fase, setFase] = useState<"verificando"|"instrucoes"|"em_andamento"|"submetendo"|"erro">("verificando");
  const [tentativaId, setTentativaId] = useState<number | null>(null);
  const [numeroTentativa, setNumeroTentativa] = useState<number>(1);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [tempoRestante, setTempoRestante] = useState(30 * 60);
  const [expiraEm, setExpiraEm] = useState<Date | null>(null);
  const [provaConfig, setProvaConfig] = useState<any>(null);
  const [motivoBloqueio, setMotivoBloqueio] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Verifica disponibilidade ao carregar
  useEffect(() => {
    if (!processo.certificacaoId) { navigate("/novo-fluxo"); return; }
    verificarDisponibilidade();
    carregarConfig();
  }, [processo.certificacaoId]);

  // Cronômetro
  useEffect(() => {
    if (fase !== "em_andamento") return;
    timerRef.current = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmeter(true);
          return 0;
        }
        // Sincroniza com expiração real do servidor
        if (expiraEm) {
          const restante = Math.max(0, Math.floor((expiraEm.getTime() - Date.now()) / 1000));
          return restante;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [fase, expiraEm]);

  async function verificarDisponibilidade() {
    try {
      const data = await apiProva("GET", "/disponivel");
      if (!data.pode) {
        setMotivoBloqueio(data.motivo);
        setFase("erro");
        return;
      }
      // Se tem tentativa em andamento, retoma
      if (data.tentativa_em_andamento) {
        await retomar(data.tentativa_em_andamento);
      } else {
        setNumeroTentativa((data.tentativas_usadas || 0) + 1);
        setFase("instrucoes");
      }
    } catch (err: any) {
      setMotivoBloqueio(err.message);
      setFase("erro");
    }
  }

  async function carregarConfig() {
    try {
      const certId = processo.certificacaoId;
      const res = await fetch(`/api/admin/prova-config/${certId}`);
      const data = await res.json();
      if (data.config) {
        setProvaConfig(data.config);
        setTempoRestante((data.config.duracao_minutos || 30) * 60);
      }
    } catch {}
  }

  async function retomar(tentId: number) {
    setTentativaId(tentId);
    const data = await apiProva("GET", `/questoes/${tentId}`);
    setQuestoes(data.questoes);
    setNumeroTentativa(data.numero_tentativa || 1);
    if (data.expira_em) setExpiraEm(new Date(data.expira_em));
    setFase("em_andamento");
  }

  async function handleIniciar() {
    try {
      setFase("verificando");
      const data = await apiProva("POST", "/iniciar");
      setTentativaId(data.tentativa_id);
      setNumeroTentativa(data.numero_tentativa);
      if (data.expira_em) {
        setExpiraEm(new Date(data.expira_em));
        setTempoRestante(Math.floor((new Date(data.expira_em).getTime() - Date.now()) / 1000));
      }
      // Busca questões SEM gabarito
      const questoesData = await apiProva("GET", `/questoes/${data.tentativa_id}`);
      setQuestoes(questoesData.questoes);
      setFase("em_andamento");
    } catch (err: any) {
      toast({ title: err.message || "Erro ao iniciar prova", variant: "destructive" });
      setFase("instrucoes");
    }
  }

  async function handleSubmeter(porTempo = false) {
    if (!tentativaId) return;
    if (!porTempo && Object.keys(respostas).length < questoes.length) {
      toast({ title: `Responda todas as ${questoes.length} questões antes de finalizar`, variant: "destructive" });
      return;
    }
    setFase("submetendo");
    try {
      const respostasArray = questoes.map(q => ({
        questao_id: q.id,
        resposta: respostas[q.id] ?? -1,
      }));
      const resultado = await apiProva("POST", "/submeter", {
        tentativa_id: tentativaId,
        respostas: respostasArray,
      });
      // Salva resultado no localStorage para ResultadoProva.tsx ler
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
      navigate("/novo-fluxo/resultado-prova");
    } catch (err: any) {
      toast({ title: err.message || "Erro ao submeter prova", variant: "destructive" });
      setFase("em_andamento");
    }
  }

  const formatarTempo = (seg: number) => {
    const m = Math.floor(seg / 60).toString().padStart(2, "0");
    const s = (seg % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const opcoes = (q: Questao) => [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(Boolean) as string[];
  const progresso = questoes.length > 0 ? (Object.keys(respostas).length / questoes.length) * 100 : 0;

  if (!certAtual) return null;

  // ── Verificando ──────────────────────────────────────────────────────────────
  if (fase === "verificando") {
    return (
      <FluxoLayout currentStep={5} title="Prova de Competência">
        <div className="max-w-md mx-auto text-center py-16">
          <Loader2 className="w-12 h-12 animate-spin text-blue-700 mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando disponibilidade da prova...</p>
        </div>
      </FluxoLayout>
    );
  }

  // ── Bloqueada ────────────────────────────────────────────────────────────────
  if (fase === "erro") {
    return (
      <FluxoLayout currentStep={5} title="Prova de Competência">
        <div className="max-w-md mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-800 mb-2">Prova não disponível</h2>
              <p className="text-sm text-red-700 mb-6">{motivoBloqueio}</p>
              <Button variant="outline" onClick={() => navigate("/novo-fluxo/aguardando-validacao")}>
                Voltar ao painel
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
      <FluxoLayout currentStep={5} title="Prova de Competência">
        <div className="max-w-md mx-auto text-center py-16">
          <Loader2 className="w-12 h-12 animate-spin text-blue-700 mx-auto mb-4" />
          <p className="text-muted-foreground">Calculando resultado...</p>
          <p className="text-xs text-muted-foreground mt-2">O resultado é calculado com segurança no servidor.</p>
        </div>
      </FluxoLayout>
    );
  }

  // ── Instruções ───────────────────────────────────────────────────────────────
  if (fase === "instrucoes") {
    const totalQuestoes = provaConfig?.total_questoes || questoes.length || 5;
    const duracao = provaConfig?.duracao_minutos || 30;
    const notaMinima = provaConfig?.nota_minima || 60;
    const prazo = provaConfig?.prazo_dias || 3;
    const instrucoes = [
      `${totalQuestoes} questões de múltipla escolha`,
      `Tempo total: ${duracao} minutos`,
      `Nota mínima para aprovação: ${notaMinima}%`,
      `Esta é sua ${numeroTentativa === 1 ? "primeira" : "segunda e última"} tentativa`,
      numeroTentativa === 1 ? "Em caso de reprovação, você terá 1 nova tentativa gratuita" : "Após esta tentativa, não há mais oportunidades",
      "Após 2 reprovações, o processo é encerrado",
      `Prazo para realizar: ${prazo} dias corridos`,
      "O resultado é calculado com segurança no servidor",
      ...(provaConfig?.instrucoes_extras || "").split("\n").filter(Boolean),
    ];

    return (
      <FluxoLayout currentStep={5} title="Prova de Competência" subtitle={`${certAtual.nome} — Leia as instruções antes de iniciar`}>
        <div className="max-w-xl mx-auto">
          {numeroTentativa === 2 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Última tentativa</p>
                <p className="text-xs text-amber-700">Você já utilizou 1 tentativa. Esta é sua última chance.</p>
              </div>
            </div>
          )}

          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Shield className="w-8 h-8 text-blue-700" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">Instruções da Prova</h2>
              <p className="text-sm text-muted-foreground mb-6">Leia com atenção antes de iniciar</p>

              {provaConfig?.mensagem_boas_vindas && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 text-sm text-blue-800 text-left">
                  {provaConfig.mensagem_boas_vindas}
                </div>
              )}

              {/* Stats */}
              <div className="flex justify-center gap-6 mb-6 py-4 border-y border-border">
                <div className="text-center">
                  <p className="text-2xl font-black text-blue-900">{totalQuestoes}</p>
                  <p className="text-xs text-muted-foreground">questões</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-blue-900">{duracao}</p>
                  <p className="text-xs text-muted-foreground">minutos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-blue-900">{notaMinima}%</p>
                  <p className="text-xs text-muted-foreground">mínimo</p>
                </div>
              </div>

              <ul className="space-y-3 text-left mb-8">
                {instrucoes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg" onClick={handleIniciar}>
                {numeroTentativa === 2 ? "Iniciar última tentativa →" : "Iniciar Prova →"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </FluxoLayout>
    );
  }

  // ── Em andamento ─────────────────────────────────────────────────────────────
  const alertaTempo = tempoRestante < 300; // menos de 5 min

  return (
    <FluxoLayout currentStep={5} title="Prova de Competência">
      {/* Header fixo */}
      <div className="sticky top-0 z-20 bg-background border-b border-border py-3 -mx-4 px-4 mb-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Tentativa {numeroTentativa} de 2</span>
            <span className="text-sm font-medium">{Object.keys(respostas).length}/{questoes.length} respondidas</span>
          </div>
          <div className={cn("flex items-center gap-2 font-mono font-bold text-lg px-4 py-1.5 rounded-xl",
            alertaTempo ? "bg-red-100 text-red-700 animate-pulse" : "bg-blue-50 text-blue-900")}>
            <Clock className="w-4 h-4" />
            {formatarTempo(tempoRestante)}
          </div>
        </div>
        {/* Barra de progresso */}
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
                  <button key={oi} onClick={() => setRespostas(prev => ({ ...prev, [q.id]: oi }))}
                    className={cn("w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all",
                      respostas[q.id] === oi
                        ? "border-blue-600 bg-blue-600 text-white font-medium"
                        : "border-border hover:border-blue-300 hover:bg-blue-50")}>
                    <span className="font-bold mr-2">{["A","B","C","D"][oi]}.</span>{op}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer fixo */}
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
