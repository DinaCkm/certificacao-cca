import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Search, UserX, UserCheck, Trash2, Eye,
  ChevronRight, AlertTriangle, CheckCircle, X
} from "lucide-react";

// Etapas do processo em ordem sequencial para mostrar progresso
const ETAPAS_PROCESSO = [
  { key: "cadastro",         label: "Cadastro",              emoji: "📝", cor: "bg-blue-100 text-blue-700" },
  { key: "pagamento1",       label: "Pagou taxa de análise", emoji: "💳", cor: "bg-orange-100 text-orange-700" },
  { key: "upload",           label: "Enviou documentos",     emoji: "📁", cor: "bg-purple-100 text-purple-700" },
  { key: "validacao",        label: "Em validação documental",emoji: "🔍", cor: "bg-yellow-100 text-yellow-700" },
  { key: "aguardando_prova", label: "Aguardando prova",      emoji: "📋", cor: "bg-indigo-100 text-indigo-700" },
  { key: "prova1_andamento", label: "Fazendo prova",         emoji: "✍️", cor: "bg-blue-100 text-blue-700" },
  { key: "prova1_aprovada",  label: "Aprovado na prova",     emoji: "✅", cor: "bg-green-100 text-green-700" },
  { key: "prova1_reprovada", label: "Reprovado - 2ª chance", emoji: "⚠️", cor: "bg-amber-100 text-amber-700" },
  { key: "prova2_aprovada",  label: "Aprovado na 2ª prova",  emoji: "✅", cor: "bg-green-100 text-green-700" },
  { key: "prova2_reprovada", label: "Reprovado definitivo",  emoji: "❌", cor: "bg-red-100 text-red-700" },
  { key: "agendamento",      label: "Agendando entrevista",  emoji: "📅", cor: "bg-teal-100 text-teal-700" },
  { key: "entrevista",       label: "Em entrevista",         emoji: "🎤", cor: "bg-indigo-100 text-indigo-700" },
  { key: "pagamento2",       label: "Pagou taxa de emissão", emoji: "💳", cor: "bg-orange-100 text-orange-700" },
  { key: "emissao",          label: "Certificado sendo emitido", emoji: "🏆", cor: "bg-green-100 text-green-700" },
  { key: "concluido",        label: "Certificado emitido",   emoji: "🎓", cor: "bg-green-200 text-green-800 font-semibold" },
  { key: "encerrado",        label: "Processo encerrado",    emoji: "🚫", cor: "bg-red-200 text-red-800" },
  { key: "selecao",          label: "Iniciando",             emoji: "👋", cor: "bg-gray-100 text-gray-600" },
];

const STATUS_LABEL: Record<string, { label: string; cor: string; emoji: string }> = 
  Object.fromEntries(ETAPAS_PROCESSO.map(e => [e.key, { label: e.label, cor: e.cor, emoji: e.emoji }]));

function formatCPF(cpf: string) {
  if (!cpf) return "—";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function getToken() { return localStorage.getItem("anefac_token"); }

async function apiAdmin(method: string, path: string, body?: any) {
  const res = await fetch(`/api/admin${path}`, {
    method,
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro");
  return data;
}

export function AdminCandidatos() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [confirmacao, setConfirmacao] = useState<{ tipo: "inativar"|"reativar"|"excluir"; candidato: any } | null>(null);
  const [detalhes, setDetalhes] = useState<any | null>(null);

  useEffect(() => { carregarCandidatos(); }, []);

  async function carregarCandidatos() {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.append("busca", busca);
      if (filtroStatus) params.append("status", filtroStatus);
      const data = await apiAdmin("GET", `/candidatos?${params}`);
      setCandidatos(data.candidatos || []);
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  async function handleInativar(c: any) {
    try {
      await apiAdmin("PUT", `/candidatos/${c.id}/inativar`);
      toast({ title: `${c.full_name} inativado` });
      setConfirmacao(null);
      carregarCandidatos();
    } catch (err: any) { toast({ title: err.message, variant: "destructive" }); }
  }

  async function handleReativar(c: any) {
    try {
      await apiAdmin("PUT", `/candidatos/${c.id}/reativar`);
      toast({ title: `${c.full_name} reativado` });
      setConfirmacao(null);
      carregarCandidatos();
    } catch (err: any) { toast({ title: err.message, variant: "destructive" }); }
  }

  async function handleExcluir(c: any) {
    try {
      await apiAdmin("DELETE", `/candidatos/${c.id}`);
      toast({ title: `${c.full_name} excluído permanentemente` });
      setConfirmacao(null);
      carregarCandidatos();
    } catch (err: any) { toast({ title: err.message, variant: "destructive" }); }
  }

  const ativos = candidatos.filter(c => c.is_active).length;
  const inativos = candidatos.filter(c => !c.is_active).length;

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 45%, #1565c0 75%, #1976d2 100%)" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4fc3f7" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Gestão de Candidatos</h1>
              <p className="text-sm text-blue-300">{ativos} ativos · {inativos} inativos · {candidatos.length} total</p>
            </div>
          </div>
        </div>

        {/* Busca e filtros */}
        <Card className="mb-5 border-white/10" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && carregarCandidatos()}
                  placeholder="Buscar por nome, e-mail ou CPF..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-900 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-sm text-gray-900 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Todos os status</option>
                {Object.entries(STATUS_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <Button onClick={carregarCandidatos} style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
                <Search className="w-4 h-4 mr-1" /> Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        {carregando ? (
          <div className="text-center py-12 text-blue-300">Carregando candidatos...</div>
        ) : candidatos.length === 0 ? (
          <Card className="border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">Nenhum candidato encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/60 uppercase tracking-wide">Candidato</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/60 uppercase tracking-wide hidden md:table-cell">CPF</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/60 uppercase tracking-wide hidden lg:table-cell">Certificação</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/60 uppercase tracking-wide">Status no processo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/60 uppercase tracking-wide hidden lg:table-cell">Cadastro</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {candidatos.map((c, idx) => {
                    const statusInfo = STATUS_LABEL[c.status_geral] || { label: "Sem processo", cor: "bg-gray-100 text-gray-500", emoji: "👤" };
                    return (
                      <tr key={c.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${!c.is_active ? "opacity-50" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ background: !c.is_active ? "#6b7280" : "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
                              {c.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{c.full_name}</p>
                              <p className="text-xs text-blue-300">{c.email}</p>
                              {!c.is_active && <span className="text-xs text-red-400 font-medium">Inativo</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-200 hidden md:table-cell">{formatCPF(c.cpf)}</td>
                        <td className="px-4 py-3 text-xs text-blue-200 hidden lg:table-cell">{c.certificacao_nome || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.cor}`}>
                            <span>{statusInfo.emoji}</span>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-blue-300 hidden lg:table-cell">
                          {new Date(c.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => navigate(`/novo-fluxo/admin/candidatos/${c.id}`)}
                              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Ver detalhes">
                              <Eye className="w-4 h-4" />
                            </button>
                            {c.is_active ? (
                              <button onClick={() => setConfirmacao({ tipo: "inativar", candidato: c })}
                                className="p-1.5 rounded-lg text-white/40 hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="Inativar">
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : (
                              <button onClick={() => setConfirmacao({ tipo: "reativar", candidato: c })}
                                className="p-1.5 rounded-lg text-white/40 hover:text-green-400 hover:bg-green-500/10 transition-colors" title="Reativar">
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => setConfirmacao({ tipo: "excluir", candidato: c })}
                              className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Excluir permanentemente">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <div className="mt-8 pb-4">
          <a href="/novo-fluxo/admin" className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white px-5 py-2.5 rounded-xl text-sm transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
            ← Voltar ao menu admin
          </a>
        </div>
      </div>

      {/* Modal de confirmação */}
      {confirmacao && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-5">
                {confirmacao.tipo === "excluir" ? (
                  <AlertTriangle className="w-14 h-14 text-red-500 mx-auto mb-3" />
                ) : confirmacao.tipo === "inativar" ? (
                  <UserX className="w-14 h-14 text-amber-500 mx-auto mb-3" />
                ) : (
                  <UserCheck className="w-14 h-14 text-green-500 mx-auto mb-3" />
                )}
                <h2 className="text-lg font-bold text-gray-900">
                  {confirmacao.tipo === "excluir" ? "Excluir permanentemente?" :
                   confirmacao.tipo === "inativar" ? "Inativar candidato?" : "Reativar candidato?"}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>{confirmacao.candidato.full_name}</strong>
                  {confirmacao.tipo === "excluir"
                    ? " — Todos os dados serão removidos permanentemente do banco. Esta ação não pode ser desfeita."
                    : confirmacao.tipo === "inativar"
                    ? " — O candidato perderá acesso à plataforma mas os dados serão mantidos."
                    : " — O candidato recuperará o acesso à plataforma."}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmacao(null)}>Cancelar</Button>
                <Button
                  className={`flex-1 ${confirmacao.tipo === "excluir" ? "bg-red-600 hover:bg-red-700" : confirmacao.tipo === "inativar" ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}`}
                  onClick={() => {
                    if (confirmacao.tipo === "excluir") handleExcluir(confirmacao.candidato);
                    else if (confirmacao.tipo === "inativar") handleInativar(confirmacao.candidato);
                    else handleReativar(confirmacao.candidato);
                  }}>
                  {confirmacao.tipo === "excluir" ? "Excluir" : confirmacao.tipo === "inativar" ? "Inativar" : "Reativar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
