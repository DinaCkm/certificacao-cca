import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const QUESTOES = [
  {
    id: 1,
    enunciado: "Qual das alternativas abaixo representa corretamente o conceito de Controladoria?",
    opcoes: [
      "Área responsável exclusivamente pelo pagamento de fornecedores",
      "Função que integra planejamento, controle e informação para apoiar a gestão",
      "Departamento que cuida apenas da contabilidade fiscal",
      "Setor responsável pela folha de pagamento",
    ],
    correta: 1,
  },
  {
    id: 2,
    enunciado: "O EBITDA é um indicador que representa:",
    opcoes: [
      "Lucro líquido após impostos",
      "Receita bruta total da empresa",
      "Lucro antes de juros, impostos, depreciação e amortização",
      "Fluxo de caixa livre disponível para acionistas",
    ],
    correta: 2,
  },
  {
    id: 3,
    enunciado: "Em gestão de custos, o custeio por absorção:",
    opcoes: [
      "Considera apenas os custos variáveis no custo do produto",
      "Aloca todos os custos de produção (fixos e variáveis) ao produto",
      "É proibido pela legislação fiscal brasileira",
      "Considera somente os custos diretos",
    ],
    correta: 1,
  },
  {
    id: 4,
    enunciado: "O princípio contábil da Competência determina que:",
    opcoes: [
      "As receitas e despesas devem ser reconhecidas quando do recebimento ou pagamento",
      "As receitas e despesas devem ser reconhecidas no período em que ocorreram, independentemente do fluxo financeiro",
      "Apenas receitas efetivamente recebidas devem ser contabilizadas",
      "Despesas só devem ser reconhecidas após aprovação da diretoria",
    ],
    correta: 1,
  },
  {
    id: 5,
    enunciado: "O índice de Liquidez Corrente é calculado como:",
    opcoes: [
      "Ativo Total / Passivo Total",
      "Ativo Circulante / Passivo Circulante",
      "Ativo Não Circulante / Passivo Não Circulante",
      "Patrimônio Líquido / Ativo Total",
    ],
    correta: 1,
  },
];

export function Prova() {
  const { processo, registrarTentativaProva, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  const [iniciada, setIniciada] = useState(false);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [tempoRestante, setTempoRestante] = useState(30 * 60); // 30 min
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!processo.certificacaoId) navigate("/novo-fluxo");
  }, [processo.certificacaoId, navigate]);

  useEffect(() => {
    if (iniciada && tempoRestante > 0) {
      timerRef.current = setInterval(() => {
        setTempoRestante((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            handleEntregar(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [iniciada]);

  const formatTempo = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleEntregar = (timeout = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const acertos = QUESTOES.filter((q) => respostas[q.id] === q.correta).length;
    const percentual = (acertos / QUESTOES.length) * 100;
    const aprovado = percentual >= 60;
    registrarTentativaProva();
    localStorage.setItem("anefac_resultado_prova", JSON.stringify({ acertos, total: QUESTOES.length, percentual, aprovado, tentativa: processo.tentativasProva + 1 }));
    if (timeout) toast({ title: "Tempo esgotado!", description: "Sua prova foi entregue automaticamente.", variant: "destructive" });
    navigate("/novo-fluxo/resultado-prova");
  };

  if (!certAtual) return null;

  if (!iniciada) {
    return (
      <FluxoLayout currentStep={6} title="Prova de Competência" subtitle={`Prova da ${certAtual.nome} — Leia as instruções antes de iniciar.`}>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Instruções da Prova</h2>
              <p className="text-muted-foreground text-sm">Leia com atenção antes de iniciar</p>
            </div>
            <div className="space-y-3 mb-8">
              {[
                `${QUESTOES.length} questões de múltipla escolha`,
                "Tempo total: 30 minutos",
                "Nota mínima para aprovação: 60%",
                "Você tem direito a 1 nova tentativa em caso de reprovação",
                "Após 2 reprovações, o processo é encerrado",
                "Não é permitido consultar materiais durante a prova",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
            {processo.tentativasProva > 0 && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">
                  <strong>Atenção:</strong> Esta é sua {processo.tentativasProva + 1}ª tentativa. Em caso de nova reprovação, o processo será encerrado.
                </p>
              </div>
            )}
            <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg" onClick={() => setIniciada(true)}>
              Iniciar Prova
            </Button>
          </CardContent>
        </Card>
      </FluxoLayout>
    );
  }

  return (
    <FluxoLayout currentStep={6} title="Prova de Competência">
      {/* Timer */}
      <div className={cn(
        "sticky top-[120px] z-40 flex items-center justify-between bg-white border rounded-xl px-5 py-3 shadow-sm mb-6",
        tempoRestante < 300 ? "border-red-300 bg-red-50" : "border-border"
      )}>
        <span className="text-sm font-medium text-foreground">
          {Object.keys(respostas).length}/{QUESTOES.length} respondidas
        </span>
        <div className={cn("flex items-center gap-2 font-bold text-lg", tempoRestante < 300 ? "text-red-600" : "text-blue-900")}>
          <Clock className="w-5 h-5" />
          {formatTempo(tempoRestante)}
        </div>
        <Button size="sm" className="bg-blue-900 hover:bg-blue-800 text-xs" onClick={() => handleEntregar()}>
          Entregar prova
        </Button>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-8">
        {QUESTOES.map((q, idx) => (
          <Card key={q.id} className={cn("border-2", respostas[q.id] !== undefined ? "border-blue-200" : "border-border")}>
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-foreground mb-4">
                <span className="text-blue-700 mr-2">{idx + 1}.</span>
                {q.enunciado}
              </p>
              <div className="space-y-2">
                {q.opcoes.map((opcao, oi) => (
                  <button
                    key={oi}
                    onClick={() => setRespostas((prev) => ({ ...prev, [q.id]: oi }))}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-all",
                      respostas[q.id] === oi
                        ? "border-blue-900 bg-blue-50 text-blue-900 font-medium"
                        : "border-border hover:border-blue-300 text-foreground"
                    )}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + oi)})</span>
                    {opcao}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button className="bg-blue-900 hover:bg-blue-800 min-w-[180px]" size="lg" onClick={() => handleEntregar()}>
          Entregar Prova
        </Button>
      </div>
    </FluxoLayout>
  );
}
