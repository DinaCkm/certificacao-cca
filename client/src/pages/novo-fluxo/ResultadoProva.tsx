import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { CheckCircle, XCircle, AlertTriangle, Award, Loader2 } from "lucide-react";

interface Resultado {
  tentativa_id: number;
  numero_tentativa: number;
  acertos: number;
  total: number;
  percentual: number;
  aprovado: boolean;
  proximo_status: string;
  nota_minima: number;
}

export function ResultadoProva() {
  const { processo, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const certAtual = getCertificacaoAtual();
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!processo.certificacaoId) { navigate("/novo-fluxo"); return; }

    // Tenta ler do localStorage (salvo pelo Prova.tsx após submissão)
    const salvo = localStorage.getItem("anefac_resultado_prova");
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        setResultado(parsed);
        setCarregando(false);
        return;
      } catch {}
    }

    // Fallback: busca da API
    const token = localStorage.getItem("anefac_token");
    fetch("/api/prova/historico", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      const tentativas = data.tentativas || [];
      if (tentativas.length > 0) {
        const ultima = tentativas[tentativas.length - 1];
        setResultado({
          tentativa_id: ultima.id,
          numero_tentativa: ultima.numero_tentativa,
          acertos: ultima.acertos || 0,
          total: ultima.total_questoes || 5,
          percentual: parseFloat(ultima.percentual) || 0,
          aprovado: !!ultima.aprovado,
          proximo_status: ultima.aprovado ? "agendamento" : ultima.numero_tentativa >= 2 ? "encerrado" : "prova2_liberada",
          nota_minima: 60,
        });
      }
    }).catch(() => {}).finally(() => setCarregando(false));
  }, [processo.certificacaoId]);

  if (!certAtual) return null;

  if (carregando) {
    return (
      <FluxoLayout currentStep={5} title="Resultado da Prova">
        <div className="text-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-blue-700 mx-auto mb-3" />
          <p className="text-muted-foreground">Carregando resultado...</p>
        </div>
      </FluxoLayout>
    );
  }

  if (!resultado) {
    return (
      <FluxoLayout currentStep={5} title="Resultado da Prova">
        <div className="max-w-md mx-auto text-center py-16">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/novo-fluxo/prova")}>
            Voltar para a prova
          </Button>
        </div>
      </FluxoLayout>
    );
  }

  const { acertos, total, percentual, aprovado, numero_tentativa, nota_minima, proximo_status } = resultado;
  const podeRetentar = !aprovado && numero_tentativa < 2;
  const processoEncerrado = !aprovado && numero_tentativa >= 2;

  // Caso 1 — Aprovado
  const bgCard = aprovado ? "border-green-300 bg-green-50" : processoEncerrado ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50";
  const corTexto = aprovado ? "text-green-800" : processoEncerrado ? "text-red-800" : "text-amber-800";
  const corSub = aprovado ? "text-green-700" : processoEncerrado ? "text-red-700" : "text-amber-700";

  const titulo = aprovado
    ? "Aprovado!"
    : processoEncerrado
    ? "Processo Encerrado"
    : "Não Aprovado na 1ª Tentativa";

  const mensagem = aprovado
    ? `Parabéns! Você foi aprovado na ${numero_tentativa === 1 ? "primeira" : "segunda"} tentativa com ${percentual.toFixed(0)}%. O próximo passo é agendar sua entrevista técnica.`
    : processoEncerrado
    ? "Você utilizou as 2 tentativas disponíveis e não atingiu a nota mínima exigida. Conforme regra do processo, sua certificação foi encerrada nesta etapa."
    : "Você não atingiu a nota mínima nesta tentativa. Você ainda tem 1 nova tentativa disponível sem custo adicional.";

  return (
    <FluxoLayout currentStep={5} title="Resultado da Prova">
      <div className="max-w-2xl mx-auto">
        <Card className={`border-2 mb-6 ${bgCard}`}>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              {aprovado ? (
                <CheckCircle className="w-16 h-16 text-green-600" />
              ) : processoEncerrado ? (
                <XCircle className="w-16 h-16 text-red-600" />
              ) : (
                <AlertTriangle className="w-16 h-16 text-amber-600" />
              )}
            </div>

            <h2 className={`text-2xl font-bold mb-2 ${corTexto}`}>{titulo}</h2>
            <p className={`text-sm mb-6 max-w-md mx-auto leading-relaxed ${corSub}`}>{mensagem}</p>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <p className="text-3xl font-bold text-foreground">{acertos}/{total}</p>
                <p className="text-xs text-muted-foreground mt-1">Corretas</p>
              </div>
              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <p className={`text-3xl font-bold ${aprovado ? "text-green-600" : "text-red-600"}`}>
                  {percentual.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Aproveitamento</p>
              </div>
              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <p className="text-3xl font-bold text-blue-700">{nota_minima}%</p>
                <p className="text-xs text-muted-foreground mt-1">Mínimo exigido</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-6">
              Tentativa {numero_tentativa} de 2 · {aprovado ? "✓ Aprovado" : "✗ Reprovado"}
            </p>

            {/* Ações */}
            {aprovado && (
              <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg"
                onClick={() => { localStorage.removeItem("anefac_resultado_prova"); navigate("/novo-fluxo/agendamento-entrevista"); }}>
                <Award className="w-4 h-4 mr-2" />
                Agendar Entrevista Técnica →
              </Button>
            )}

            {podeRetentar && (
              <div className="space-y-3">
                <Button className="w-full bg-amber-600 hover:bg-amber-700" size="lg"
                  onClick={() => { localStorage.removeItem("anefac_resultado_prova"); navigate("/novo-fluxo/prova"); }}>
                  Realizar 2ª tentativa (gratuita) →
                </Button>
                <p className="text-xs text-amber-700">⚠️ Esta será sua última tentativa disponível. Não há terceira chance.</p>
              </div>
            )}

            {processoEncerrado && (
              <Button variant="outline" className="w-full"
                onClick={() => { localStorage.removeItem("anefac_resultado_prova"); navigate("/novo-fluxo/processo-encerrado"); }}>
                Ver detalhes do encerramento
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </FluxoLayout>
  );
}
