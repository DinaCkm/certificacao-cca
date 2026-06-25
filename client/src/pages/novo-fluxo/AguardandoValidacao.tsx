import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Clock, CheckCircle, Mail, FileText, Phone, HelpCircle,
  BookOpen, Home, Calendar, Video, AlertCircle, RefreshCw,
  Award, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Slot {
  id: number;
  data_hora: string;
  duracao_minutos: number;
  entrevistador_nome: string;
}

function formatDataHora(dataHora: string) {
  const d = new Date(dataHora);
  return {
    diaSemana: d.toLocaleDateString("pt-BR", { weekday: "long" }),
    dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }),
    hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    completo: d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
  };
}

export function AguardandoValidacao() {
  const { processo, getCertificacaoAtual, atualizarStatus, atualizarCandidato } = useCertification();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [carregandoSlots, setCarregandoSlots] = useState(false);
  const [slotSelecionado, setSlotSelecionado] = useState<Slot | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [agendado, setAgendado] = useState<{ data_hora: string } | null>(null);
  const [statusReal, setStatusReal] = useState(processo.statusGeral);
  const [caminhoReal, setCaminhoReal] = useState(processo.caminhoAvaliacao);

  // Sempre busca status atualizado do banco ao carregar a página
  useEffect(() => {
    if (!processo.certificacaoId) { navigate("/novo-fluxo"); return; }
    const token = localStorage.getItem("anefac_token");
    if (!token) return;
    (api.processo as any).retomar().then((res: any) => {
      if (!res?.processo) return;
      const s = res.processo.statusGeral;
      const c = res.processo.caminhoAvaliacao;
      setStatusReal(s);
      setCaminhoReal(c);
      if (s === "agendamento") carregarSlots();
      // Se já tem entrevista agendada, busca os dados do agendamento existente
      if (s === "entrevista") {
        const processoId = localStorage.getItem("anefac_processo_id");
        const token = localStorage.getItem("anefac_token");
        if (processoId && token) {
          fetch(\`/api/processo/agendamento/\${processoId}\`, {
            headers: { Authorization: \`Bearer \${token}\` }
          }).then(r => r.json()).then(data => {
            if (data?.data_hora) setAgendado({ data_hora: data.data_hora });
          }).catch(() => {});
        }
      }
    }).catch(() => {});
  }, [processo.certificacaoId]);

  async function carregarSlots() {
    setCarregandoSlots(true);
    try {
      const { slots } = await api.processo.slotsDisponiveis();
      setSlots(slots);
    } catch {
      toast({ title: "Erro ao carregar horários", variant: "destructive" });
    } finally {
      setCarregandoSlots(false);
    }
  }

  async function handleAgendar() {
    if (!slotSelecionado) {
      toast({ title: "Selecione um horário", variant: "destructive" });
      return;
    }
    const processoId = localStorage.getItem("anefac_processo_id");
    if (!processoId) {
      toast({ title: "Erro: faça login novamente", variant: "destructive" });
      return;
    }
    setConfirmando(true);
    try {
      const result = await api.processo.agendarEntrevista(slotSelecionado.id, parseInt(processoId));
      setAgendado({ data_hora: result.data_hora });
      setStatusReal("entrevista");
    } catch (err: any) {
      toast({ title: err.message || "Erro ao agendar", variant: "destructive" });
      carregarSlots();
      setSlotSelecionado(null);
    } finally {
      setConfirmando(false);
    }
  }

  if (!certAtual) return null;

  // ── Etapas dinâmicas baseadas no status real ─────────────────────────────
  const ETAPAS = [
    { key: "cadastro",   label: "Cadastro realizado" },
    { key: "pagamento1", label: "Pagamento da taxa de análise" },
    { key: "upload",     label: "Documentos enviados" },
    { key: "validacao",  label: "Validação documental" },
    { key: caminhoReal === "B" ? "prova" : "agendamento", label: caminhoReal === "B" ? "Prova de competência" : "Agendamento de entrevista" },
    { key: "entrevista", label: "Entrevista técnica" },
    { key: "pagamento2", label: "Pagamento da taxa de emissão" },
    { key: "concluido",  label: "Emissão do certificado" },
  ];

  const ordemStatus = ["cadastro","pagamento1","upload","validacao","agendamento","prova","entrevista","pagamento2","concluido"];
  const idxAtual = ordemStatus.indexOf(statusReal);

  // ── Título e subtítulo dinâmicos ─────────────────────────────────────────
  const tituloMap: Record<string, string> = {
    validacao:   "Aguardando Validação Documental",
    agendamento: "Documentos Aprovados — Agende sua Entrevista",
    prova:       "Documentos Aprovados — Realize sua Avaliação",
    entrevista:  "Entrevista Agendada",
  };
  const subtituloMap: Record<string, string> = {
    validacao:   "Seu processo foi recebido. Nossa banca analisará seus documentos em breve.",
    agendamento: "Parabéns! Seus documentos foram validados. Escolha uma data para sua entrevista.",
    prova:       "Parabéns! Seus documentos foram validados. Realize agora a avaliação teórica.",
    entrevista:  "Sua entrevista está confirmada. Acesse a sala no dia e horário agendados.",
  };

  return (
    <FluxoLayout
      currentStep={4}
      title={tituloMap[statusReal] || "Acompanhamento do Processo"}
      subtitle={subtituloMap[statusReal] || "Acompanhe as etapas do seu processo de certificação."}
    >
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Coluna principal ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Bloco de status atual */}
          {statusReal === "validacao" && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-7 h-7 text-blue-700 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-bold text-blue-900 text-lg mb-1">Processo em análise</h2>
                  <p className="text-sm text-blue-700">Prazo estimado: <strong>5 a 10 dias úteis</strong></p>
                  <p className="text-xs text-blue-600 mt-1">Você receberá um e-mail assim que a análise for concluída.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {(statusReal === "agendamento" || statusReal === "prova") && (
            <Card className="border-green-300 bg-green-50">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h2 className="font-bold text-green-800 text-lg mb-1">Documentos aprovados!</h2>
                  <p className="text-sm text-green-700">Sua documentação foi analisada e aprovada pela banca ANEFAC. Não há pendências.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {statusReal === "entrevista" && (
            <Card className="border-indigo-200 bg-indigo-50">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <Video className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-bold text-indigo-900 text-lg mb-1">Entrevista confirmada!</h2>
                  <p className="text-sm text-indigo-700">Acesse a sala de entrevista no dia e horário agendados.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Agendamento de entrevista ─────────────────────────────── */}
          {statusReal === "agendamento" && !agendado && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-700" />
                    Escolha a data e horário da entrevista
                  </h3>
                  <button onClick={carregarSlots} className="text-xs text-blue-700 flex items-center gap-1 hover:underline">
                    <RefreshCw className="w-3 h-3" /> Atualizar
                  </button>
                </div>

                {carregandoSlots ? (
                  <div className="py-10 text-center text-gray-400">
                    <div className="w-6 h-6 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm">Buscando horários disponíveis...</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="py-8 text-center">
                    <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700">Nenhum horário disponível no momento</p>
                    <p className="text-xs text-gray-400 mt-1">Nossa equipe está cadastrando novos horários. Aguarde contato por e-mail.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {slots.map((slot) => {
                      const fmt = formatDataHora(slot.data_hora);
                      const sel = slotSelecionado?.id === slot.id;
                      return (
                        <button key={slot.id} onClick={() => setSlotSelecionado(slot)}
                          className={cn("w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                            sel ? "border-blue-900 bg-blue-50" : "border-border hover:border-blue-300")}>
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold",
                              sel ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-700")}>
                              {new Date(slot.data_hora).getDate()}
                            </div>
                            <div>
                              <p className={cn("text-sm font-semibold capitalize", sel ? "text-blue-900" : "text-foreground")}>
                                {fmt.diaSemana}, {fmt.dia}
                              </p>
                              <p className={cn("text-xs flex items-center gap-1", sel ? "text-blue-700" : "text-muted-foreground")}>
                                <Clock className="w-3 h-3" />{fmt.hora} · {slot.duracao_minutos} min · {slot.entrevistador_nome}
                              </p>
                            </div>
                          </div>
                          {sel && <CheckCircle className="w-5 h-5 text-blue-900 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {slotSelecionado && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Horário selecionado:</p>
                    <p className="text-sm text-blue-800">📅 {formatDataHora(slotSelecionado.data_hora).completo}</p>
                    <p className="text-sm text-blue-800">🕐 {formatDataHora(slotSelecionado.data_hora).hora} (horário de Brasília)</p>
                    <p className="text-sm text-blue-800">⏱ {slotSelecionado.duracao_minutos} min · 🎥 Videoconferência</p>
                  </div>
                )}

                <Button className="w-full bg-blue-900 hover:bg-blue-800 mt-4" size="lg"
                  onClick={handleAgendar} disabled={!slotSelecionado || confirmando || slots.length === 0}>
                  {confirmando ? "Confirmando..." : "Confirmar Agendamento →"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Confirmação de agendamento ────────────────────────────── */}
          {statusReal === "agendamento" && agendado && (
            <Card className="border-green-300 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-green-800 text-lg mb-2">Entrevista agendada com sucesso!</h3>
                <div className="bg-white rounded-xl border border-green-200 p-4 mb-4 text-left space-y-2">
                  <p className="text-sm">📅 {formatDataHora(agendado.data_hora).completo}</p>
                  <p className="text-sm">🕐 {formatDataHora(agendado.data_hora).hora} (horário de Brasília)</p>
                  <p className="text-sm">🎥 Videoconferência — link enviado por e-mail</p>
                </div>
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-left mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800">O agendamento é definitivo. Para cancelar, entre em contato com a ANEFAC.</p>
                </div>
                <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={() => navigate("/novo-fluxo/sala-entrevista")}>
                  <Video className="w-4 h-4 mr-2" /> Acessar sala de entrevista →
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Prova de competência ──────────────────────────────────── */}
          {statusReal === "prova" && (
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <Award className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm mb-1">Avaliação teórica obrigatória</p>
                    <p className="text-xs text-blue-700">Você deve realizar a prova de competência antes de prosseguir para a entrevista técnica.</p>
                  </div>
                </div>
                <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg" onClick={() => navigate("/novo-fluxo/prova")}>
                  <ArrowRight className="w-4 h-4 mr-2" /> Iniciar avaliação teórica →
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Entrevista confirmada ─────────────────────────────────── */}
          {statusReal === "entrevista" && (
            <Card className="border-indigo-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
                  <Video className="w-5 h-5 text-indigo-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-indigo-900 text-sm mb-1">Sua entrevista está agendada</p>
                    <p className="text-xs text-indigo-700">Acesse a sala de entrevista no horário combinado. O link foi enviado por e-mail.</p>
                  </div>
                </div>
                <Button className="w-full bg-indigo-900 hover:bg-indigo-800" size="lg" onClick={() => navigate("/novo-fluxo/sala-entrevista")}>
                  <Video className="w-4 h-4 mr-2" /> Acessar sala de entrevista →
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Timeline de etapas ───────────────────────────────────── */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-5">Acompanhamento do processo</h3>
              <div className="space-y-4">
                {ETAPAS.map((etapa, idx) => {
                  const etapaIdx = ordemStatus.indexOf(etapa.key);
                  const done = etapaIdx < idxAtual;
                  const current = etapaIdx === idxAtual;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                          done ? "bg-green-500" : current ? "bg-blue-600" : "bg-gray-200")}>
                          {done ? <CheckCircle className="w-4 h-4 text-white" /> :
                           current ? <Clock className="w-4 h-4 text-white" /> :
                           <span className="text-xs text-gray-500 font-bold">{idx + 1}</span>}
                        </div>
                        {idx < ETAPAS.length - 1 && (
                          <div className={cn("w-0.5 h-6 mt-1", done ? "bg-green-300" : "bg-gray-200")} />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p className={cn("text-sm font-medium",
                          done ? "text-green-700" : current ? "text-blue-700 font-semibold" : "text-muted-foreground")}>
                          {etapa.label}
                        </p>
                        {current && <p className="text-xs text-blue-600 mt-0.5">← você está aqui</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Sua certificação</h3>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl font-bold text-blue-900">{certAtual.numero}</span>
                <div>
                  <p className="font-bold text-foreground text-sm">{certAtual.nome}</p>
                  <p className="text-xs text-muted-foreground">Nível {certAtual.numero}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
                <p>Taxa de análise paga: <strong className="text-green-700">R$ {certAtual.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></p>
                <p>Taxa de emissão: <strong>R$ {certAtual.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" /> Dúvidas?
              </h3>
              <div className="space-y-2">
                <a href="mailto:certificacao@anefac.com.br" className="flex items-center gap-2 text-xs text-blue-700 hover:underline">
                  <Mail className="w-3.5 h-3.5" /> certificacao@anefac.com.br
                </a>
                <a href="tel:+551100000000" className="flex items-center gap-2 text-xs text-blue-700 hover:underline">
                  <Phone className="w-3.5 h-3.5" /> (11) 0000-0000
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="space-y-2">
                {statusReal === "validacao" && (
                  <Button variant="outline" size="sm" className="w-full text-xs"
                    onClick={() => navigate("/novo-fluxo/upload-documentos")}>
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> Reenviar documentos
                  </Button>
                )}
                <a href="/cursos" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full text-xs border border-border rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                  <BookOpen className="w-3.5 h-3.5" /> Cursos ANEFAC
                </a>
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground"
                  onClick={() => navigate("/novo-fluxo")}>
                  <Home className="w-3.5 h-3.5 mr-1.5" /> Voltar ao início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FluxoLayout>
  );
}
