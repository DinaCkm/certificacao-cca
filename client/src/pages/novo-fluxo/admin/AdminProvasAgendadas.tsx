import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCertification } from "@/contexts/CertificationContext";
import { adminApi } from "@/lib/api";
import {
  Calendar, Clock, Users, Video, Plus, X, Trash2,
  Loader2, ShieldCheck, RefreshCw, ChevronDown, ChevronUp,
  Film, Download, Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SalaProva {
  id: number;
  data_hora: string;
  duracao_minutos: number;
  capacidade_maxima: number;
  status: "agendada" | "em_andamento" | "concluida" | "cancelada";
  cert_nome: string;
  fiscal_nome: string | null;
  ocupadas: number;
  daily_room_name: string | null;
}

interface Fiscal {
  id: number;
  full_name: string;
  role_nome: string;
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  agendada: { label: "Agendada", className: "bg-indigo-100 text-indigo-700" },
  em_andamento: { label: "Em andamento", className: "bg-green-100 text-green-700 animate-pulse" },
  concluida: { label: "Concluída", className: "bg-gray-100 text-gray-600" },
  cancelada: { label: "Cancelada", className: "bg-red-100 text-red-600" },
};

const GRAVACAO_STATUS_LABEL: Record<string, { label: string; className: string }> = {
  processando: { label: "Processando", className: "bg-amber-100 text-amber-700" },
  disponivel: { label: "Disponível", className: "bg-blue-100 text-blue-700" },
  baixada: { label: "Baixada", className: "bg-green-100 text-green-700" },
  arquivada: { label: "Arquivada", className: "bg-gray-100 text-gray-500" },
};

function formatDataHora(dataHora: string) {
  const d = new Date(dataHora);
  return {
    completo: d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
    hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    dia: d.getDate(),
    mesAno: d.toLocaleDateString("pt-BR", { month: "2-digit", year: "2-digit" }),
  };
}

export function AdminProvasAgendadas() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { certifications } = useCertification();
  const certsAtivas = (certifications || []).filter((c) => c.status === "ativa");

  const [salas, setSalas] = useState<SalaProva[]>([]);
  const [fiscais, setFiscais] = useState<Fiscal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [candidatosPorSala, setCandidatosPorSala] = useState<Record<number, any[]>>({});
  const [expandidoGravacoes, setExpandidoGravacoes] = useState<number | null>(null);
  const [gravacoesPorSala, setGravacoesPorSala] = useState<Record<number, any[]>>({});
  const [sincronizandoGravacoes, setSincronizandoGravacoes] = useState(false);

  const [form, setForm] = useState({
    cert_slug: "",
    data: "",
    hora: "",
    duracao_minutos: 60,
    capacidade_maxima: 5,
    fiscal_id: "",
  });

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    try {
      const [salasRes, fiscaisRes] = await Promise.all([
        adminApi.listarSalasProva(),
        adminApi.listarFiscaisDisponiveis(),
      ]);
      setSalas(salasRes.salas || []);
      setFiscais(fiscaisRes.fiscais || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar agenda de provas", description: err.message, variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal() {
    setForm({
      cert_slug: certsAtivas[0]?.id || "",
      data: "",
      hora: "",
      duracao_minutos: 60,
      capacidade_maxima: 5,
      fiscal_id: "",
    });
    setModalAberto(true);
  }

  async function salvarSala() {
    if (!form.cert_slug || !form.data || !form.hora) {
      toast({ title: "Preencha certificação, data e horário", variant: "destructive" });
      return;
    }
    setSalvando(true);
    try {
      const dataHoraIso = new Date(`${form.data}T${form.hora}:00`).toISOString();
      await adminApi.criarSalaProva({
        cert_slug: form.cert_slug,
        data_hora: dataHoraIso,
        duracao_minutos: form.duracao_minutos,
        capacidade_maxima: form.capacidade_maxima,
        fiscal_id: form.fiscal_id ? parseInt(form.fiscal_id) : null,
      });
      toast({ title: "✅ Sala de prova criada" });
      setModalAberto(false);
      carregar();
    } catch (err: any) {
      toast({ title: "Erro ao criar sala", description: err.message, variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  }

  async function cancelarSala(id: number) {
    if (!confirm("Cancelar esta sala de prova?")) return;
    try {
      await adminApi.cancelarSalaProva(id);
      toast({ title: "Sala cancelada" });
      carregar();
    } catch (err: any) {
      toast({ title: "Erro ao cancelar sala", description: err.message, variant: "destructive" });
    }
  }

  async function toggleExpandir(salaId: number) {
    if (expandido === salaId) {
      setExpandido(null);
      return;
    }
    setExpandido(salaId);
    if (!candidatosPorSala[salaId]) {
      try {
        const res = await adminApi.listarCandidatosDaSala(salaId);
        setCandidatosPorSala((prev) => ({ ...prev, [salaId]: res.candidatos || [] }));
      } catch {
        setCandidatosPorSala((prev) => ({ ...prev, [salaId]: [] }));
      }
    }
  }

  async function entrarComoFiscal(salaId: number) {
    try {
      const res = await adminApi.entrarComoFiscal(salaId);
      window.open(res.daily_room_url + `?t=${encodeURIComponent(res.daily_token)}`, "_blank");
    } catch (err: any) {
      toast({ title: "Erro ao entrar na sala", description: err.message, variant: "destructive" });
    }
  }

  async function toggleGravacoes(salaId: number) {
    if (expandidoGravacoes === salaId) {
      setExpandidoGravacoes(null);
      return;
    }
    setExpandidoGravacoes(salaId);
    setSincronizandoGravacoes(true);
    try {
      const res = await adminApi.listarGravacoesSala(salaId);
      setGravacoesPorSala((prev) => ({ ...prev, [salaId]: res.gravacoes || [] }));
    } catch (err: any) {
      toast({ title: "Erro ao buscar gravações", description: err.message, variant: "destructive" });
      setGravacoesPorSala((prev) => ({ ...prev, [salaId]: [] }));
    } finally {
      setSincronizandoGravacoes(false);
    }
  }

  function baixarGravacao(id: number) {
    const token = localStorage.getItem("anefac_token");
    window.open(`/api/admin/gravacoes/${id}/download?token=${encodeURIComponent(token || "")}`, "_blank");
  }

  async function arquivarGravacao(id: number, salaId: number) {
    if (!confirm("Confirma que já baixou e guardou esta gravação? O arquivo será removido do servidor e do Daily.co.")) return;
    try {
      await adminApi.arquivarGravacao(id);
      toast({ title: "Gravação arquivada — removida do servidor" });
      const res = await adminApi.listarGravacoesSala(salaId);
      setGravacoesPorSala((prev) => ({ ...prev, [salaId]: res.gravacoes || [] }));
    } catch (err: any) {
      toast({ title: "Erro ao arquivar gravação", description: err.message, variant: "destructive" });
    }
  }

  const proximas = salas.filter((s) => s.status === "agendada" || s.status === "em_andamento");
  const passadas = salas.filter((s) => s.status === "concluida" || s.status === "cancelada");

  function renderSalaCard(s: SalaProva) {
    return (
      <SalaCard
        key={s.id}
        sala={s}
        expandido={expandido === s.id}
        candidatos={candidatosPorSala[s.id]}
        onToggle={() => toggleExpandir(s.id)}
        onCancelar={() => cancelarSala(s.id)}
        onEntrarFiscal={() => entrarComoFiscal(s.id)}
        expandidoGravacoes={expandidoGravacoes === s.id}
        gravacoes={gravacoesPorSala[s.id]}
        sincronizandoGravacoes={sincronizandoGravacoes && expandidoGravacoes === s.id}
        onToggleGravacoes={() => toggleGravacoes(s.id)}
        onBaixarGravacao={baixarGravacao}
        onArquivarGravacao={(gid: number) => arquivarGravacao(gid, s.id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-900 font-bold text-sm">A</span>
            </div>
            <div>
              <span className="font-bold">ANEFAC</span>
              <span className="text-blue-300 text-xs ml-2">Painel Administrativo</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={carregar} className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-white">
              <RefreshCw className="w-3.5 h-3.5" /> Atualizar
            </button>
            <Button variant="ghost" size="sm" className="text-white hover:text-blue-200" onClick={() => navigate("/novo-fluxo/admin")}>
              ← Voltar ao painel
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Agenda de Provas</h1>
            <p className="text-muted-foreground text-sm">
              Crie horários de prova (salas de até 5 candidatos + 1 fiscal) para os candidatos agendarem.
            </p>
          </div>
          <Button className="bg-blue-900 hover:bg-blue-800" onClick={abrirModal}>
            <Plus className="w-4 h-4 mr-1.5" /> Nova sala de prova
          </Button>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando agenda...
          </div>
        ) : salas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="font-bold text-foreground mb-2">Nenhuma sala de prova cadastrada</h2>
              <p className="text-sm text-muted-foreground">Crie a primeira sala para que os candidatos possam agendar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {proximas.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-3">
                  Próximas ({proximas.length})
                </h2>
                <div className="space-y-3">
                  {proximas.map(renderSalaCard)}
                </div>
              </div>
            )}

            {passadas.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Encerradas ({passadas.length})
                </h2>
                <div className="space-y-3">
                  {passadas.map(renderSalaCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Nova Sala */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Nova sala de prova</h2>
                <button onClick={() => setModalAberto(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Certificação *</Label>
                  <select
                    value={form.cert_slug}
                    onChange={(e) => setForm({ ...form, cert_slug: e.target.value })}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1"
                  >
                    <option value="">Selecione...</option>
                    {certsAtivas.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Data *</Label>
                    <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Horário *</Label>
                    <Input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} className="mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Duração (minutos)</Label>
                    <Input
                      type="number" min={10} value={form.duracao_minutos}
                      onChange={(e) => setForm({ ...form, duracao_minutos: parseInt(e.target.value) || 60 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Capacidade (máx. 5)</Label>
                    <Input
                      type="number" min={1} max={5} value={form.capacidade_maxima}
                      onChange={(e) => setForm({ ...form, capacidade_maxima: Math.min(5, parseInt(e.target.value) || 5) })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Fiscal responsável</Label>
                  <select
                    value={form.fiscal_id}
                    onChange={(e) => setForm({ ...form, fiscal_id: e.target.value })}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1"
                  >
                    <option value="">Definir depois</option>
                    {fiscais.map((f) => (
                      <option key={f.id} value={f.id}>{f.full_name} — {f.role_nome}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Qualquer perfil pode ser escalado como fiscal desta sala.</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setModalAberto(false)}>Cancelar</Button>
                <Button className="flex-1 bg-blue-900 hover:bg-blue-800" onClick={salvarSala} disabled={salvando}>
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar sala"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function SalaCard({
  sala, expandido, candidatos, onToggle, onCancelar, onEntrarFiscal,
  expandidoGravacoes, gravacoes, sincronizandoGravacoes, onToggleGravacoes, onBaixarGravacao, onArquivarGravacao,
}: {
  sala: SalaProva;
  expandido: boolean;
  candidatos?: any[];
  onToggle: () => void;
  onCancelar: () => void;
  onEntrarFiscal: () => void;
  expandidoGravacoes: boolean;
  gravacoes?: any[];
  sincronizandoGravacoes: boolean;
  onToggleGravacoes: () => void;
  onBaixarGravacao: (id: number) => void;
  onArquivarGravacao: (id: number) => void;
}) {
  const fmt = formatDataHora(sala.data_hora);
  const st = STATUS_LABEL[sala.status];
  const podeCancelar = sala.status === "agendada" && sala.ocupadas === 0;

  return (
    <Card className={cn("border-2", sala.status === "em_andamento" ? "border-green-300 bg-green-50" : "border-indigo-100")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={cn("w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 text-white",
              sala.status === "em_andamento" ? "bg-green-600" : "bg-indigo-900")}>
              <span className="text-xl font-bold leading-none">{fmt.dia}</span>
              <span className="text-xs opacity-80">{fmt.mesAno}</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-bold text-foreground">{sala.cert_nome}</h3>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", st.className)}>{st.label}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1 capitalize"><Calendar className="w-3 h-3" /> {fmt.completo}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fmt.hora} · {sala.duracao_minutos}min</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {sala.ocupadas}/{sala.capacidade_maxima} candidatos</span>
                {sala.fiscal_nome && (
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Fiscal: {sala.fiscal_nome}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {sala.daily_room_name && (sala.status === "agendada" || sala.status === "em_andamento") && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onEntrarFiscal}>
                <Video className="w-3.5 h-3.5 mr-1.5" /> Entrar como fiscal
              </Button>
            )}
            <div className="flex items-center gap-3">
              <button onClick={onToggle} className="text-xs text-indigo-700 flex items-center gap-1 hover:underline">
                Ver candidatos {expandido ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {sala.daily_room_name && (
                <button onClick={onToggleGravacoes} className="text-xs text-indigo-700 flex items-center gap-1 hover:underline">
                  <Film className="w-3 h-3" /> Gravações {expandidoGravacoes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
              {podeCancelar && (
                <button onClick={onCancelar} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          </div>
        </div>

        {expandido && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {!candidatos ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Carregando...</div>
            ) : candidatos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum candidato agendado ainda.</p>
            ) : (
              <div className="space-y-2">
                {candidatos.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <span className="font-medium">{c.full_name}</span>
                      <span className="text-muted-foreground ml-2">{c.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.violacoes_count > 0 && (
                        <span className="text-orange-600 font-semibold">{c.violacoes_count} violação(ões)</span>
                      )}
                      {c.anulada ? (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Anulada</span>
                      ) : (
                        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{c.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {expandidoGravacoes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {sincronizandoGravacoes ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" /> Sincronizando com o Daily.co...
              </div>
            ) : !gravacoes || gravacoes.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma gravação encontrada para esta sala ainda.</p>
            ) : (
              <div className="space-y-2">
                {gravacoes.map((g: any) => (
                  <div key={g.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Film className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-muted-foreground">Gravação #{g.id}</span>
                      <span className={cn("px-2 py-0.5 rounded-full font-semibold", GRAVACAO_STATUS_LABEL[g.status]?.className)}>
                        {GRAVACAO_STATUS_LABEL[g.status]?.label || g.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(g.status === "disponivel" || g.status === "baixada") && (
                        <button onClick={() => onBaixarGravacao(g.id)}
                          className="flex items-center gap-1 text-blue-700 hover:underline font-medium">
                          <Download className="w-3 h-3" /> Baixar
                        </button>
                      )}
                      {g.status === "baixada" && (
                        <button onClick={() => onArquivarGravacao(g.id)}
                          className="flex items-center gap-1 text-red-600 hover:underline font-medium">
                          <Archive className="w-3 h-3" /> Arquivar
                        </button>
                      )}
                      {g.status === "processando" && (
                        <span className="text-gray-400">Ainda processando no Daily.co...</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
