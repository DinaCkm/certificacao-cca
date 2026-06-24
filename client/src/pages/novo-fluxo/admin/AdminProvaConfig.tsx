import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useCertification } from "@/contexts/CertificationContext";
import {
  FileText, Settings, Plus, Trash2, X, Check,
  Clock, Target, BookOpen, AlertCircle, Eye, ChevronDown, ChevronUp
} from "lucide-react";

interface ProvaConfig {
  cert_slug: string;
  cert_nome: string;
  total_questoes: number;
  duracao_minutos: number;
  nota_minima: number;
  max_tentativas: number;
  prazo_dias: number;
  mensagem_boas_vindas: string;
  instrucoes_extras: string;
}

interface Questao {
  id: number;
  numero: number;
  enunciado: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  opcao_d: string;
  resposta_correta: number;
}

const OPCOES_LABEL = ["A", "B", "C", "D"];

export function AdminProvaConfig() {
  const { toast } = useToast();
  const { certifications } = useCertification();
  const certs = (certifications || []).filter(c => c.status === "ativa");

  const [certSelecionada, setCertSelecionada] = useState<string>(certs[0]?.id || "");
  const [config, setConfig] = useState<Partial<ProvaConfig>>({
    total_questoes: 5,
    duracao_minutos: 30,
    nota_minima: 60,
    max_tentativas: 2,
    prazo_dias: 3,
    mensagem_boas_vindas: "",
    instrucoes_extras: "",
  });
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [previewAberto, setPreviewAberto] = useState(false);

  // Modal nova questão
  const [modalQuestao, setModalQuestao] = useState(false);
  const [novaQuestao, setNovaQuestao] = useState({
    enunciado: "", opcao_a: "", opcao_b: "", opcao_c: "", opcao_d: "", resposta_correta: 0
  });
  const [salvandoQuestao, setSalvandoQuestao] = useState(false);

  useEffect(() => {
    if (certSelecionada) carregarConfig();
  }, [certSelecionada]);

  async function carregarConfig() {
    setCarregando(true);
    try {
      const [configRes, questoesRes] = await Promise.all([
        fetch(`/api/admin/prova-config/${certSelecionada}`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("anefac_token")}` }
        }).then(r => r.json()),
        fetch(`/api/admin/questoes/${certSelecionada}`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("anefac_token")}` }
        }).then(r => r.json()),
      ]);

      if (configRes.config) {
        setConfig(configRes.config);
      } else {
        setConfig({ total_questoes: 5, duracao_minutos: 30, nota_minima: 60, max_tentativas: 2, prazo_dias: 3, mensagem_boas_vindas: "", instrucoes_extras: "" });
      }
      setQuestoes(questoesRes.questoes || []);
    } catch {
      toast({ title: "Erro ao carregar configuração", variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  async function salvarConfig() {
    setSalvando(true);
    try {
      await (api.admin as any).salvarProvaConfig({ ...config, cert_slug: certSelecionada });
      toast({ title: "Configuração salva com sucesso!" });
    } catch (err: any) {
      toast({ title: err.message || "Erro ao salvar", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  }

  async function adicionarQuestao() {
    if (!novaQuestao.enunciado || !novaQuestao.opcao_a || !novaQuestao.opcao_b) {
      toast({ title: "Preencha enunciado e pelo menos as opções A e B", variant: "destructive" });
      return;
    }
    setSalvandoQuestao(true);
    try {
      await (api.admin as any).adicionarQuestao({ ...novaQuestao, cert_slug: certSelecionada });
      toast({ title: "Questão adicionada!" });
      setModalQuestao(false);
      setNovaQuestao({ enunciado: "", opcao_a: "", opcao_b: "", opcao_c: "", opcao_d: "", resposta_correta: 0 });
      carregarConfig();
    } catch (err: any) {
      toast({ title: err.message || "Erro ao adicionar questão", variant: "destructive" });
    } finally {
      setSalvandoQuestao(false);
    }
  }

  async function removerQuestao(id: number) {
    if (!confirm("Remover esta questão?")) return;
    try {
      await (api.admin as any).removerQuestao(id);
      toast({ title: "Questão removida" });
      carregarConfig();
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  }

  const certAtual = certs.find(c => c.id === certSelecionada);
  const prazoExpira = new Date();
  prazoExpira.setDate(prazoExpira.getDate() + (config.prazo_dias || 3));

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 45%, #1565c0 75%, #1976d2 100%)" }}>

      {/* Grid decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4fc3f7" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Parametrização da Prova</h1>
              <p className="text-sm text-blue-300">Configure a prova por tipo de certificação</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setPreviewAberto(!previewAberto)}>
              <Eye className="w-4 h-4 mr-2" /> Preview do candidato
            </Button>
            <Button onClick={salvarConfig} disabled={salvando} style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
              {salvando ? "Salvando..." : <><Check className="w-4 h-4 mr-2" /> Salvar configuração</>}
            </Button>
          </div>
        </div>

        {/* Seletor de certificação */}
        <Card className="mb-6 border-white/10" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
          <CardContent className="p-5">
            <Label className="mb-2 block">Certificação</Label>
            <div className="flex gap-2 flex-wrap">
              {certs.map(c => (
                <button key={c.id} onClick={() => setCertSelecionada(c.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    certSelecionada === c.id
                      ? "text-white border-transparent"
                      : "border-white/20 text-blue-200 hover:border-blue-300"
                  }`}
                  style={certSelecionada === c.id ? { background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" } : { background: "rgba(255,255,255,0.05)" }}>
                  {c.nome}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {carregando ? (
          <div className="text-center py-12 text-blue-300">Carregando configuração...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">

            {/* Parâmetros básicos */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Settings className="w-4 h-4 text-blue-700" />
                  <h2 className="font-semibold text-white">Parâmetros da Prova</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nº de questões</Label>
                      <Input type="number" min="1" max="50" value={config.total_questoes || 5}
                        onChange={e => setConfig({ ...config, total_questoes: parseInt(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Duração (minutos)</Label>
                      <Input type="number" min="5" max="180" value={config.duracao_minutos || 30}
                        onChange={e => setConfig({ ...config, duracao_minutos: parseInt(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Nota mínima (%)</Label>
                      <Input type="number" min="1" max="100" value={config.nota_minima || 60}
                        onChange={e => setConfig({ ...config, nota_minima: parseInt(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Prazo para realizar (dias)</Label>
                      <Input type="number" min="1" max="30" value={config.prazo_dias || 3}
                        onChange={e => setConfig({ ...config, prazo_dias: parseInt(e.target.value) })} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-amber-900/30 border border-amber-400/30 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-300">
                      Número de tentativas fixo em <strong>2</strong> conforme regra ANEFAC. Não pode ser alterado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mensagens */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BookOpen className="w-4 h-4 text-blue-700" />
                  <h2 className="font-semibold text-white">Mensagens ao Candidato</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Mensagem de boas-vindas</Label>
                    <textarea
                      value={config.mensagem_boas_vindas || ""}
                      onChange={e => setConfig({ ...config, mensagem_boas_vindas: e.target.value })}
                      placeholder="Ex: Bem-vindo à prova de competência CCA. Esta prova avalia seus conhecimentos em Controladoria..."
                      rows={3}
                      className="w-full rounded-md px-3 py-2 text-sm mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder:text-white/40" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}
                    />
                  </div>
                  <div>
                    <Label>Instruções adicionais</Label>
                    <textarea
                      value={config.instrucoes_extras || ""}
                      onChange={e => setConfig({ ...config, instrucoes_extras: e.target.value })}
                      placeholder="Ex: Certifique-se de estar em local silencioso. Não é permitido consultar materiais durante a prova..."
                      rows={4}
                      className="w-full rounded-md px-3 py-2 text-sm mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder:text-white/40" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}
                    />
                    <p className="text-xs text-blue-400 mt-1">Cada linha será exibida como um item de instrução.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banco de questões */}
            <Card className="md:col-span-2 border-white/10" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-700" />
                    <h2 className="font-semibold text-white">Banco de Questões</h2>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {questoes.length} questão(ões) cadastrada(s)
                    </span>
                    {questoes.length < (config.total_questoes || 5) && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        ⚠ Faltam {(config.total_questoes || 5) - questoes.length} questão(ões)
                      </span>
                    )}
                  </div>
                  <Button size="sm" onClick={() => setModalQuestao(true)} style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
                    <Plus className="w-4 h-4 mr-1" /> Adicionar questão
                  </Button>
                </div>

                {questoes.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-white/20 rounded-xl">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-white text-sm font-medium">Nenhuma questão cadastrada</p>
                    <p className="text-blue-300 text-xs mt-1">Adicione questões para compor o banco da prova</p>
                    <Button size="sm" className="mt-4" style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }} onClick={() => setModalQuestao(true)}>
                      <Plus className="w-4 h-4 mr-1" /> Adicionar primeira questão
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questoes.map((q, idx) => (
                      <div key={q.id} className="border border-white/10 rounded-xl p-4 hover:border-white/30 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <p className="text-sm font-medium text-white">{q.enunciado}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 ml-8">
                              {[q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(Boolean).map((op, i) => (
                                <div key={i}
                                  className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${
                                    i === q.resposta_correta
                                      ? "bg-green-50 text-green-700 border border-green-200 font-medium"
                                      : "text-blue-200"
                                  }`}
                                  style={i !== q.resposta_correta ? { background: "rgba(255,255,255,0.05)" } : {}}>
                                  <span className="font-bold">{OPCOES_LABEL[i]}.</span> {op}
                                  {i === q.resposta_correta && <Check className="w-3 h-3 ml-auto shrink-0" />}
                                </div>
                              ))}
                            </div>
                          </div>
                          <button onClick={() => removerQuestao(q.id)}
                            className="text-white/40 hover:text-red-400 transition-colors shrink-0 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preview do candidato */}
        {previewAberto && (
          <Card className="mt-6 border-white/20" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-700" />
                  Preview — O que o candidato vai ver
                </h2>
                <button onClick={() => setPreviewAberto(false)} className="text-white/50 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Simulação da tela do candidato */}
              <div className="rounded-xl p-6 border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="max-w-md mx-auto text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-blue-700" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Prova de Competência</h3>
                  <p className="text-sm text-blue-300 mb-1">{certAtual?.nome}</p>
                  {config.mensagem_boas_vindas && (
                    <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-left">
                      {config.mensagem_boas_vindas}
                    </p>
                  )}

                  <div className="flex justify-center gap-4 mb-5">
                    <div className="text-center">
                      <p className="text-2xl font-black text-blue-900">{config.total_questoes || 5}</p>
                      <p className="text-xs text-blue-300">questões</p>
                    </div>
                    <div className="w-px bg-white/20" />
                    <div className="text-center">
                      <p className="text-2xl font-black text-blue-900">{config.duracao_minutos || 30}</p>
                      <p className="text-xs text-blue-300">minutos</p>
                    </div>
                    <div className="w-px bg-white/20" />
                    <div className="text-center">
                      <p className="text-2xl font-black text-blue-900">{config.nota_minima || 60}%</p>
                      <p className="text-xs text-blue-300">mínimo</p>
                    </div>
                  </div>

                  <div className="text-left space-y-2 mb-5">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Instruções</p>
                    {[
                      `${config.total_questoes || 5} questões de múltipla escolha`,
                      `Tempo total: ${config.duracao_minutos || 30} minutos`,
                      `Nota mínima para aprovação: ${config.nota_minima || 60}%`,
                      "Você tem direito a 1 nova tentativa em caso de reprovação",
                      "Após 2 reprovações, o processo é encerrado",
                      `Prazo para realizar: ${config.prazo_dias || 3} dias corridos`,
                      ...(config.instrucoes_extras || "").split("\n").filter(Boolean),
                    ].map((inst, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        {inst}
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left mb-4">
                    <p className="text-xs text-amber-800 font-medium">
                      ⏰ Prazo expira em: {prazoExpira.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                    </p>
                  </div>

                  <div className="bg-blue-900 text-white rounded-xl py-3 text-sm font-bold opacity-60 cursor-not-allowed">
                    Iniciar Prova (preview)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      </div>

      {/* Modal nova questão */}
      {modalQuestao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl shadow-2xl my-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Nova Questão</h2>
                <button onClick={() => setModalQuestao(false)} className="text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Enunciado da questão *</Label>
                  <textarea
                    value={novaQuestao.enunciado}
                    onChange={e => setNovaQuestao({ ...novaQuestao, enunciado: e.target.value })}
                    placeholder="Digite o enunciado da questão..."
                    rows={3}
                    className="w-full rounded-md px-3 py-2 text-sm mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder:text-white/40" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}
                  />
                </div>

                <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">Alternativas (marque a correta)</p>

                {["opcao_a", "opcao_b", "opcao_c", "opcao_d"].map((campo, i) => (
                  <div key={campo} className="flex items-center gap-3">
                    <button
                      onClick={() => setNovaQuestao({ ...novaQuestao, resposta_correta: i })}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                        novaQuestao.resposta_correta === i
                          ? "bg-green-600 border-green-600 text-white"
                          : "border-white/30 text-white/40 hover:border-green-400"
                      }`}>
                      {OPCOES_LABEL[i]}
                    </button>
                    <Input
                      value={(novaQuestao as any)[campo]}
                      onChange={e => setNovaQuestao({ ...novaQuestao, [campo]: e.target.value })}
                      placeholder={`Opção ${OPCOES_LABEL[i]}${i < 2 ? " *" : " (opcional)"}`}
                    />
                  </div>
                ))}

                <p className="text-xs text-blue-400">Clique na letra para marcar a resposta correta</p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setModalQuestao(false)}>Cancelar</Button>
                <Button className="flex-1 bg-blue-900 hover:bg-blue-800" onClick={adicionarQuestao} disabled={salvandoQuestao}>
                  {salvandoQuestao ? "Salvando..." : "Adicionar questão"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
