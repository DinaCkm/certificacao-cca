import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { api } from "@/lib/api";
import {
  Award, ArrowRight, CheckCircle, XCircle, RotateCcw, BookOpen, Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Fase = "carregando" | "inicio" | "quiz" | "resultado" | "indisponivel";

interface Questao {
  id: number;
  numero: number;
  enunciado: string;
  opcoes: string[];
}

interface Resposta {
  questao_id: number;
  resposta: number;
  correta: boolean;
}

export function SimulacaoMural() {
  const { getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const certAtual = getCertificacaoAtual();

  const [fase, setFase] = useState<Fase>("carregando");
  const [simulacaoInfo, setSimulacaoInfo] = useState<{ titulo: string; quantidade_questoes: number } | null>(null);
  const [retomando, setRetomando] = useState(false);

  const [tentativaId, setTentativaId] = useState<number | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respondendoAgora, setRespondendoAgora] = useState<{ correta: boolean; resposta_correta: number; explicacao: string | null } | null>(null);
  const [resultadoFinal, setResultadoFinal] = useState<{ acertos: number; total: number } | null>(null);

  useEffect(() => {
    if (certAtual) verificar();
  }, [certAtual?.id]);

  async function verificar() {
    if (!certAtual) return;
    setFase("carregando");
    try {
      const { simulacoes } = await api.simulacao.ativas();
      const config = simulacoes.find((s) => s.cert_slug === certAtual.id);
      if (!config) {
        setFase("indisponivel");
        return;
      }
      setSimulacaoInfo({ titulo: config.titulo, quantidade_questoes: config.quantidade_questoes });

      const { tentativa_id } = await api.simulacao.minhaEmAndamento(certAtual.id);
      if (tentativa_id) {
        setRetomando(true);
        await carregarEstado(tentativa_id);
      } else {
        setFase("inicio");
      }
    } catch {
      setFase("indisponivel");
    }
  }

  async function carregarEstado(id: number) {
    const estado = await api.simulacao.estado(id);
    setTentativaId(id);
    setQuestoes(estado.questoes);
    setRespostas(estado.respostas);
    setQuestaoAtual(Math.min(estado.respostas.length, estado.questoes.length - 1));
    setFase("quiz");
  }

  async function handleIniciar() {
    if (!certAtual) return;
    try {
      const { tentativa_id } = await api.simulacao.iniciar(certAtual.id);
      setRetomando(false);
      await carregarEstado(tentativa_id);
    } catch {
      setFase("indisponivel");
    }
  }

  const questao = questoes[questaoAtual];
  const respostaAtual = respostas.find((r) => r.questao_id === questao?.id);
  const respondida = !!respostaAtual || !!respondendoAgora;

  async function handleResponder(opcaoIdx: number) {
    if (respondida || !tentativaId || !questao) return;
    const result = await api.simulacao.responder(tentativaId, questao.id, opcaoIdx);
    setRespondendoAgora(result);
    setRespostas((prev) => [...prev.filter((r) => r.questao_id !== questao.id), { questao_id: questao.id, resposta: opcaoIdx, correta: result.correta }]);
  }

  async function handleProxima() {
    setRespondendoAgora(null);
    if (questaoAtual < questoes.length - 1) {
      setQuestaoAtual((q) => q + 1);
    } else if (tentativaId) {
      const result = await api.simulacao.finalizar(tentativaId);
      setResultadoFinal({ acertos: result.acertos, total: result.total_questoes });
      setFase("resultado");
    }
  }

  function handleReiniciar() {
    setFase("inicio");
    setTentativaId(null);
    setQuestoes([]);
    setRespostas([]);
    setQuestaoAtual(0);
    setResultadoFinal(null);
  }

  if (!certAtual) return null;

  const percentual = resultadoFinal ? Math.round((resultadoFinal.acertos / resultadoFinal.total) * 100) : 0;
  const nivel = percentual >= 80
    ? { label: "Avançado", cor: "text-green-700", bg: "bg-green-100" }
    : percentual >= 60
    ? { label: "Intermediário", cor: "text-blue-700", bg: "bg-blue-100" }
    : { label: "Iniciante", cor: "text-amber-700", bg: "bg-amber-100" };

  return (
    <FluxoLayout currentStep={0} title="Simulado" subtitle={`Pratique para a ${certAtual.nome} — sempre com questões reais do banco.`}>
      <div className="max-w-2xl mx-auto">
        {fase === "carregando" && (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Carregando...</p>
          </div>
        )}

        {fase === "indisponivel" && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="font-bold text-amber-800 mb-2">Simulado indisponível</h2>
              <p className="text-sm text-amber-700 mb-6">Ainda não há um simulado configurado para {certAtual.nome}.</p>
              <Button variant="outline" onClick={() => navigate("/novo-fluxo")}>Voltar ao painel</Button>
            </CardContent>
          </Card>
        )}

        {fase === "inicio" && simulacaoInfo && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-700" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">{simulacaoInfo.titulo}</h2>
              <p className="text-sm text-muted-foreground mb-6">{simulacaoInfo.quantidade_questoes} questões do banco real, com explicação após cada resposta.</p>
              <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg" onClick={handleIniciar}>
                Iniciar simulado <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {fase === "quiz" && questao && (
          <div>
            {retomando && (
              <div className="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
                <RotateCcw className="w-3.5 h-3.5" /> Retomando de onde você parou.
              </div>
            )}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Questão {questaoAtual + 1} de {questoes.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${((questaoAtual + 1) / questoes.length) * 100}%` }} />
              </div>
            </div>

            <Card>
              <CardContent className="p-8">
                <p className="text-lg font-bold text-foreground mb-6 leading-relaxed">{questao.enunciado}</p>
                <div className="space-y-3">
                  {questao.opcoes.map((opcao, oi) => {
                    const selecionada = respostaAtual?.resposta === oi;
                    const revelarComoCorreta = respondendoAgora && oi === respondendoAgora.resposta_correta;
                    let estilo = "border-border text-foreground hover:border-blue-300";
                    if (respondida) {
                      if (revelarComoCorreta || (respostaAtual?.correta && selecionada)) estilo = "border-green-400 bg-green-50 text-green-800";
                      else if (selecionada) estilo = "border-red-400 bg-red-50 text-red-800";
                      else estilo = "border-gray-100 text-gray-400";
                    }
                    return (
                      <button key={oi} onClick={() => handleResponder(oi)} disabled={respondida}
                        className={cn("w-full text-left px-5 py-4 rounded-xl border-2 text-sm transition-all flex items-center gap-3", estilo)}>
                        <span className="w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-bold shrink-0">
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="flex-1">{opcao}</span>
                        {respondida && (revelarComoCorreta || (selecionada && respostaAtual?.correta)) && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
                        {respondida && selecionada && !respostaAtual?.correta && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {respondendoAgora && (
                  <div className={cn("mt-5 p-4 rounded-xl border text-sm",
                    respondendoAgora.correta ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800")}>
                    <p className="font-semibold mb-1">{respondendoAgora.correta ? "✓ Correto!" : "✗ Incorreto"}</p>
                    {respondendoAgora.explicacao && <p>{respondendoAgora.explicacao}</p>}
                  </div>
                )}

                {respondida && (
                  <Button className="w-full mt-5 bg-blue-900 hover:bg-blue-800" onClick={handleProxima}>
                    {questaoAtual < questoes.length - 1 ? "Próxima questão" : "Ver resultado"} <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {fase === "resultado" && resultadoFinal && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-2xl font-black text-foreground">{resultadoFinal.acertos}/{resultadoFinal.total}</p>
                    <p className="text-xs text-muted-foreground mt-1">Acertos</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className={`text-2xl font-black ${percentual >= 60 ? "text-green-600" : "text-amber-600"}`}>{percentual}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Aproveitamento</p>
                  </div>
                  <div className={`${nivel.bg} rounded-xl p-4`}>
                    <p className={`text-base font-black ${nivel.cor}`}>{nivel.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">Seu nível</p>
                  </div>
                </div>

                {/* CTA de cursos — sempre sugerido ao final do simulado */}
                <a href="/cursos" className="flex items-center gap-3 bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-4 hover:bg-purple-100 transition-colors text-left">
                  <BookOpen className="w-8 h-8 text-purple-700 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-purple-900">Reforce com nossos cursos</p>
                    <p className="text-xs text-purple-700">Conteúdos alinhados com a {certAtual.nome}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-700 shrink-0" />
                </a>

                <div className="flex flex-col gap-3">
                  <Button variant="outline" onClick={handleReiniciar}>
                    <RotateCcw className="w-4 h-4 mr-1.5" /> Fazer novamente
                  </Button>
                  <Button className="bg-blue-900 hover:bg-blue-800" onClick={() => navigate("/novo-fluxo")}>
                    Voltar ao painel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </FluxoLayout>
  );
}
