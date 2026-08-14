import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, CheckCircle, XCircle, Award, RotateCcw, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { DesempenhoPorEixo } from "@/components/DesempenhoPorEixo";

type Fase = "carregando" | "cadastro" | "quiz" | "resultado";

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

const STORAGE_KEY = "anefac_simulacao_publica_tentativa";

export function Simulacao() {
  const [fase, setFase] = useState<Fase>("carregando");
  const [simulacoesAtivas, setSimulacoesAtivas] = useState<{ id: number; titulo: string; cert_slug: string; cert_nome: string; quantidade_questoes: number }[]>([]);
  const [certSelecionada, setCertSelecionada] = useState("");
  const [form, setForm] = useState({ nome: "", email: "" });
  const [erro, setErro] = useState("");

  const [tentativaId, setTentativaId] = useState<number | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respondendoAgora, setRespondendoAgora] = useState<{ correta: boolean; resposta_correta: number; explicacao: string | null } | null>(null);
  const [resultadoFinal, setResultadoFinal] = useState<{ acertos: number; total: number } | null>(null);
  const [eixos, setEixos] = useState<{ eixo_id: number | null; nome: string; acertos: number; total: number; percentual: number }[]>([]);

  useEffect(() => {
    inicializar();
  }, []);

  async function inicializar() {
    try {
      const { simulacoes } = await api.simulacao.ativas();
      setSimulacoesAtivas(simulacoes);
      if (simulacoes.length === 1) setCertSelecionada(simulacoes[0].cert_slug);

      // Retoma uma simulação em andamento salva neste navegador
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        const id = parseInt(salvo);
        try {
          const estado = await api.simulacao.estado(id);
          if (estado.status === "em_andamento") {
            carregarEstado(id, estado);
            return;
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      setFase("cadastro");
    } catch {
      setFase("cadastro");
    }
  }

  function carregarEstado(id: number, estado: Awaited<ReturnType<typeof api.simulacao.estado>>) {
    setTentativaId(id);
    setQuestoes(estado.questoes);
    setRespostas(estado.respostas);
    setQuestaoAtual(Math.min(estado.respostas.length, estado.questoes.length - 1));
    setFase("quiz");
  }

  const handleIniciar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || !certSelecionada) return;
    setErro("");
    try {
      const { tentativa_id } = await api.simulacao.iniciar(certSelecionada, form.nome, form.email);
      const estado = await api.simulacao.estado(tentativa_id);
      localStorage.setItem(STORAGE_KEY, String(tentativa_id));
      carregarEstado(tentativa_id, estado);
    } catch (err: any) {
      setErro(err.message || "Erro ao iniciar simulação");
    }
  };

  const questao = questoes[questaoAtual];
  const respostaAtual = respostas.find((r) => r.questao_id === questao?.id);
  const respondida = !!respostaAtual || !!respondendoAgora;

  const handleResponder = async (opcaoIdx: number) => {
    if (respondida || !tentativaId || !questao) return;
    try {
      const result = await api.simulacao.responder(tentativaId, questao.id, opcaoIdx);
      setRespondendoAgora(result);
      setRespostas((prev) => [...prev.filter((r) => r.questao_id !== questao.id), { questao_id: questao.id, resposta: opcaoIdx, correta: result.correta }]);
    } catch (err: any) {
      setErro(err.message || "Erro ao responder");
    }
  };

  const handleProxima = async () => {
    setRespondendoAgora(null);
    if (questaoAtual < questoes.length - 1) {
      setQuestaoAtual((q) => q + 1);
    } else if (tentativaId) {
      const result = await api.simulacao.finalizar(tentativaId);
      setResultadoFinal({ acertos: result.acertos, total: result.total_questoes });
      api.simulacao.desempenhoPorEixo(tentativaId).then((r) => setEixos(r.eixos)).catch(() => setEixos([]));
      localStorage.removeItem(STORAGE_KEY);
      setFase("resultado");
    }
  };

  const handleReiniciar = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFase("cadastro");
    setForm({ nome: "", email: "" });
    setTentativaId(null);
    setQuestoes([]);
    setRespostas([]);
    setQuestaoAtual(0);
    setResultadoFinal(null);
  };

  const percentual = resultadoFinal ? Math.round((resultadoFinal.acertos / resultadoFinal.total) * 100) : 0;

  const getNivel = () => {
    if (percentual >= 80) return { label: "Avançado", cor: "text-green-700", bg: "bg-green-100", cert: "Você demonstra conhecimento sólido. Considere as certificações de nível mais avançado." };
    if (percentual >= 60) return { label: "Intermediário", cor: "text-blue-700", bg: "bg-blue-100", cert: "Você tem uma boa base. Com preparação, está pronto para iniciar o processo de certificação." };
    return { label: "Iniciante", cor: "text-amber-700", bg: "bg-amber-100", cert: "Recomendamos reforçar seus conhecimentos e conhecer nossos cursos antes de iniciar o processo de certificação." };
  };
  const nivel = getNivel();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16" style={{ background: "linear-gradient(135deg, #0f1f4e 0%, #1e3a6e 100%)" }}>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Simulação de Conhecimentos</h1>
          <p className="text-blue-200 text-lg">Teste seus conhecimentos gratuitamente e descubra qual certificação é ideal para você.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {fase === "carregando" && (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Carregando simulação...</p>
          </div>
        )}

        {fase === "cadastro" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Comece sua simulação</h2>
              <p className="text-gray-500 text-sm">Gratuito · Resultado imediato</p>
            </div>
            <form onSubmit={handleIniciar} className="p-8 space-y-5">
              {simulacoesAtivas.length === 0 ? (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  Nenhuma simulação disponível no momento. Volte em breve!
                </p>
              ) : (
                <>
                  {simulacoesAtivas.length > 1 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Certificação</label>
                      <select
                        required
                        value={certSelecionada}
                        onChange={(e) => setCertSelecionada(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione...</option>
                        {simulacoesAtivas.map((s) => (
                          <option key={s.cert_slug} value={s.cert_slug}>{s.cert_nome} ({s.quantidade_questoes} questões)</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Seu nome completo</label>
                    <input type="text" required value={form.nome}
                      onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                      placeholder="Ex: Maria Silva"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Seu e-mail profissional</label>
                    <input type="email" required value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="Ex: maria@empresa.com.br"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  {erro && <p className="text-xs text-red-600">{erro}</p>}
                  <p className="text-xs text-gray-400">Seus dados são usados apenas para personalizar o resultado. Não enviamos spam.</p>
                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl transition-all text-base"
                    style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>
                    Iniciar simulação <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </form>
          </div>
        )}

        {fase === "quiz" && questao && (
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Questão {questaoAtual + 1} de {questoes.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((questaoAtual + 1) / questoes.length) * 100}%`, background: "linear-gradient(90deg, #1e3a6e 0%, #2d5be3 100%)" }} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                <p className="text-lg font-bold text-gray-900 mb-6 leading-relaxed">{questao.enunciado}</p>
                <div className="space-y-3">
                  {questao.opcoes.map((opcao, oi) => {
                    const selecionada = respostaAtual?.resposta === oi;
                    const revelarComoCorreta = respondendoAgora && oi === respondendoAgora.resposta_correta;
                    let estilo = "border-gray-200 text-gray-700 hover:border-blue-300";
                    if (respondida) {
                      if (revelarComoCorreta || (respostaAtual?.correta && selecionada)) estilo = "border-green-400 bg-green-50 text-green-800";
                      else if (selecionada) estilo = "border-red-400 bg-red-50 text-red-800";
                      else estilo = "border-gray-100 text-gray-400";
                    }
                    return (
                      <button key={oi} onClick={() => handleResponder(oi)} disabled={respondida}
                        className={cn("w-full text-left px-5 py-4 rounded-xl border-2 text-sm transition-all flex items-center gap-3", estilo, !respondida && "hover:bg-gray-50")}>
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
                  <button onClick={handleProxima}
                    className="w-full mt-5 flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl transition-all"
                    style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>
                    {questaoAtual < questoes.length - 1 ? "Próxima questão" : "Ver resultado"} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {fase === "resultado" && resultadoFinal && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 text-center border-b border-gray-100">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Olá, {form.nome.split(" ")[0] || "tudo bem"}!</h2>
                <p className="text-gray-500 text-sm">Aqui está o resultado da sua simulação</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center bg-gray-50 rounded-xl p-4">
                    <p className="text-3xl font-black text-gray-900">{resultadoFinal.acertos}/{resultadoFinal.total}</p>
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

                <DesempenhoPorEixo eixos={eixos} mostrarCtaCursos={false} />

                <Link href="/cursos">
                  <a className="flex items-center gap-3 bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-3 hover:bg-purple-100 transition-colors">
                    <BookOpen className="w-8 h-8 text-purple-700 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-purple-900">Prepare-se com nossos cursos</p>
                      <p className="text-xs text-purple-700">Conteúdos pensados para reforçar exatamente o que você precisa</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-700 shrink-0" />
                  </a>
                </Link>

                <div className="flex flex-col gap-3">
                  <Link href="/novo-fluxo/certificacoes">
                    <a className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl transition-all text-base"
                      style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>
                      Ver certificações disponíveis <ArrowRight className="w-5 h-5" />
                    </a>
                  </Link>
                  <button onClick={handleReiniciar}
                    className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                    <RotateCcw className="w-4 h-4" /> Refazer simulação
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
