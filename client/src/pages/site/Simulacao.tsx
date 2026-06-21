import React, { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, CheckCircle, XCircle, Award, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const QUESTOES = [
  {
    id: 1,
    area: "Controladoria",
    enunciado: "O EBITDA é um indicador que representa:",
    opcoes: [
      "Lucro líquido após impostos",
      "Receita bruta total da empresa",
      "Lucro antes de juros, impostos, depreciação e amortização",
      "Fluxo de caixa livre disponível para acionistas",
    ],
    correta: 2,
    explicacao: "EBITDA (Earnings Before Interest, Taxes, Depreciation and Amortization) mede a geração de caixa operacional antes de deduções financeiras e contábeis.",
  },
  {
    id: 2,
    area: "Contabilidade",
    enunciado: "O princípio contábil da Competência determina que:",
    opcoes: [
      "As receitas e despesas são reconhecidas quando do recebimento ou pagamento",
      "As receitas e despesas são reconhecidas no período em que ocorreram, independentemente do fluxo financeiro",
      "Apenas receitas efetivamente recebidas devem ser contabilizadas",
      "Despesas só devem ser reconhecidas após aprovação da diretoria",
    ],
    correta: 1,
    explicacao: "O regime de competência registra receitas e despesas no período em que ocorrem os fatos geradores, independentemente do recebimento ou pagamento.",
  },
  {
    id: 3,
    area: "Análise Financeira",
    enunciado: "O índice de Liquidez Corrente é calculado como:",
    opcoes: [
      "Ativo Total / Passivo Total",
      "Ativo Circulante / Passivo Circulante",
      "Ativo Não Circulante / Passivo Não Circulante",
      "Patrimônio Líquido / Ativo Total",
    ],
    correta: 1,
    explicacao: "A Liquidez Corrente mede a capacidade da empresa de pagar suas obrigações de curto prazo com seus ativos de curto prazo.",
  },
  {
    id: 4,
    area: "Gestão",
    enunciado: "O Balanced Scorecard (BSC) é uma ferramenta que:",
    opcoes: [
      "Controla apenas os indicadores financeiros da empresa",
      "Traduz a estratégia em objetivos e indicadores em quatro perspectivas",
      "Substitui o planejamento estratégico da empresa",
      "É utilizado exclusivamente para gestão de pessoas",
    ],
    correta: 1,
    explicacao: "O BSC equilibra indicadores financeiros e não-financeiros nas perspectivas: financeira, clientes, processos internos e aprendizado/crescimento.",
  },
  {
    id: 5,
    area: "Custos",
    enunciado: "No custeio por absorção:",
    opcoes: [
      "Apenas os custos variáveis são alocados ao produto",
      "Todos os custos de produção (fixos e variáveis) são alocados ao produto",
      "Os custos fixos são tratados como despesas do período",
      "Somente os custos diretos são considerados no custo do produto",
    ],
    correta: 1,
    explicacao: "O custeio por absorção aloca todos os custos de produção ao produto, sendo o método aceito pela legislação fiscal brasileira.",
  },
];

type Fase = "cadastro" | "quiz" | "resultado";

export function Simulacao() {
  const [fase, setFase] = useState<Fase>("cadastro");
  const [form, setForm] = useState({ nome: "", email: "" });
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [mostrarExplicacao, setMostrarExplicacao] = useState(false);

  const questao = QUESTOES[questaoAtual];
  const respondida = respostas[questao?.id] !== undefined;
  const acertou = respondida && respostas[questao?.id] === questao?.correta;

  const acertos = QUESTOES.filter((q) => respostas[q.id] === q.correta).length;
  const percentual = Math.round((acertos / QUESTOES.length) * 100);

  const handleIniciar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim()) return;
    setFase("quiz");
  };

  const handleResponder = (opcaoIdx: number) => {
    if (respondida) return;
    setRespostas((prev) => ({ ...prev, [questao.id]: opcaoIdx }));
    setMostrarExplicacao(true);
  };

  const handleProxima = () => {
    setMostrarExplicacao(false);
    if (questaoAtual < QUESTOES.length - 1) {
      setQuestaoAtual((q) => q + 1);
    } else {
      setFase("resultado");
    }
  };

  const handleReiniciar = () => {
    setFase("cadastro");
    setForm({ nome: "", email: "" });
    setRespostas({});
    setQuestaoAtual(0);
    setMostrarExplicacao(false);
  };

  const getNivel = () => {
    if (percentual >= 80) return { label: "Avançado", cor: "text-green-700", bg: "bg-green-100", cert: "Você demonstra conhecimento sólido. Considere as certificações de nível mais avançado." };
    if (percentual >= 60) return { label: "Intermediário", cor: "text-blue-700", bg: "bg-blue-100", cert: "Você tem uma boa base. Com preparação, está pronto para iniciar o processo de certificação." };
    return { label: "Iniciante", cor: "text-amber-700", bg: "bg-amber-100", cert: "Recomendamos reforçar seus conhecimentos antes de iniciar o processo de certificação." };
  };

  const nivel = getNivel();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="pt-16" style={{ background: "linear-gradient(135deg, #0f1f4e 0%, #1e3a6e 100%)" }}>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Simulação de Conhecimentos
          </h1>
          <p className="text-blue-200 text-lg">
            Teste seus conhecimentos gratuitamente e descubra qual certificação é ideal para você.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* FASE 1: Cadastro */}
        {fase === "cadastro" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Comece sua simulação</h2>
              <p className="text-gray-500 text-sm">
                {QUESTOES.length} questões · Gratuito · Resultado imediato
              </p>
            </div>
            <form onSubmit={handleIniciar} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Seu nome completo</label>
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: Maria Silva"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Seu e-mail profissional</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Ex: maria@empresa.com.br"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-400">
                Seus dados são usados apenas para personalizar o resultado. Não enviamos spam.
              </p>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl transition-all text-base"
                style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}
              >
                Iniciar simulação
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* FASE 2: Quiz */}
        {fase === "quiz" && (
          <div>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Questão {questaoAtual + 1} de {QUESTOES.length}</span>
                <span className="font-medium text-gray-700">{questao.area}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${((questaoAtual + 1) / QUESTOES.length) * 100}%`,
                    background: "linear-gradient(90deg, #1e3a6e 0%, #2d5be3 100%)"
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                <p className="text-lg font-bold text-gray-900 mb-6 leading-relaxed">
                  {questao.enunciado}
                </p>
                <div className="space-y-3">
                  {questao.opcoes.map((opcao, oi) => {
                    const selecionada = respostas[questao.id] === oi;
                    const correta = oi === questao.correta;
                    let estilo = "border-gray-200 text-gray-700 hover:border-blue-300";
                    if (respondida) {
                      if (correta) estilo = "border-green-400 bg-green-50 text-green-800";
                      else if (selecionada && !correta) estilo = "border-red-400 bg-red-50 text-red-800";
                      else estilo = "border-gray-100 text-gray-400";
                    }
                    return (
                      <button
                        key={oi}
                        onClick={() => handleResponder(oi)}
                        disabled={respondida}
                        className={cn(
                          "w-full text-left px-5 py-4 rounded-xl border-2 text-sm transition-all flex items-center gap-3",
                          estilo,
                          !respondida && "hover:bg-gray-50"
                        )}
                      >
                        <span className="w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-bold shrink-0"
                          style={selecionada || (respondida && correta) ? { borderColor: "currentColor" } : {}}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="flex-1">{opcao}</span>
                        {respondida && correta && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
                        {respondida && selecionada && !correta && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {mostrarExplicacao && (
                  <div className={cn(
                    "mt-5 p-4 rounded-xl border text-sm",
                    acertou ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"
                  )}>
                    <p className="font-semibold mb-1">{acertou ? "✓ Correto!" : "✗ Incorreto"}</p>
                    <p>{questao.explicacao}</p>
                  </div>
                )}

                {respondida && (
                  <button
                    onClick={handleProxima}
                    className="w-full mt-5 flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl transition-all"
                    style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}
                  >
                    {questaoAtual < QUESTOES.length - 1 ? "Próxima questão" : "Ver resultado"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FASE 3: Resultado */}
        {fase === "resultado" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 text-center border-b border-gray-100">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Olá, {form.nome.split(" ")[0]}!
                </h2>
                <p className="text-gray-500 text-sm">Aqui está o resultado da sua simulação</p>
              </div>

              <div className="p-8">
                {/* Score */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center bg-gray-50 rounded-xl p-4">
                    <p className="text-3xl font-black text-gray-900">{acertos}/{QUESTOES.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Acertos</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-xl p-4">
                    <p className={`text-3xl font-black ${percentual >= 60 ? "text-green-600" : "text-amber-600"}`}>{percentual}%</p>
                    <p className="text-xs text-gray-500 mt-1">Aproveitamento</p>
                  </div>
                  <div className={`text-center ${nivel.bg} rounded-xl p-4`}>
                    <p className={`text-lg font-black ${nivel.cor}`}>{nivel.label}</p>
                    <p className="text-xs text-gray-500 mt-1">Seu nível</p>
                  </div>
                </div>

                <div className={`${nivel.bg} rounded-xl p-4 mb-6`}>
                  <p className={`text-sm font-semibold ${nivel.cor} mb-1`}>Análise do seu perfil</p>
                  <p className={`text-sm ${nivel.cor}`}>{nivel.cert}</p>
                </div>

                {/* Questão a questão */}
                <div className="space-y-2 mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Resumo por questão:</p>
                  {QUESTOES.map((q) => {
                    const acertouQ = respostas[q.id] === q.correta;
                    return (
                      <div key={q.id} className="flex items-center gap-3 text-sm">
                        {acertouQ
                          ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                          : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        <span className="text-gray-600 flex-1 truncate">{q.enunciado}</span>
                        <span className={`text-xs font-medium shrink-0 ${acertouQ ? "text-green-600" : "text-red-500"}`}>
                          {q.area}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3">
                  <Link href="/novo-fluxo/certificacoes">
                    <a className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl transition-all text-base"
                      style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>
                      Ver certificações disponíveis
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </Link>
                  <button
                    onClick={handleReiniciar}
                    className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Refazer simulação
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>A</div>
            <span className="font-bold text-gray-900">ANEFAC</span>
            <span className="text-gray-400 text-sm">Certificações</span>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} ANEFAC. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
