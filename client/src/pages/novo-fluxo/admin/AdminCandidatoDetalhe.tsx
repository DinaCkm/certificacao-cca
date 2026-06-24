import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  User, Mail, Phone, Building, Briefcase, GraduationCap,
  Calendar, Award, FileText, CreditCard, CheckCircle,
  XCircle, Clock, AlertTriangle, UserX, UserCheck, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";

function getToken() { return localStorage.getItem("anefac_token"); }

const STATUS_LABEL: Record<string, { label: string; cor: string; emoji: string }> = {
  cadastro:         { label: "Cadastro",              cor: "bg-blue-100 text-blue-700",    emoji: "📝" },
  pagamento1:       { label: "Pagou taxa de análise", cor: "bg-orange-100 text-orange-700", emoji: "💳" },
  upload:           { label: "Enviou documentos",     cor: "bg-purple-100 text-purple-700", emoji: "📁" },
  validacao:        { label: "Em validação",          cor: "bg-yellow-100 text-yellow-700", emoji: "🔍" },
  aguardando_prova: { label: "Aguardando prova",      cor: "bg-indigo-100 text-indigo-700", emoji: "📋" },
  prova1_andamento: { label: "Fazendo prova",         cor: "bg-blue-100 text-blue-700",    emoji: "✍️" },
  prova1_aprovada:  { label: "Aprovado na prova",     cor: "bg-green-100 text-green-700",  emoji: "✅" },
  prova1_reprovada: { label: "Reprovado - 2ª chance", cor: "bg-amber-100 text-amber-700",  emoji: "⚠️" },
  prova2_aprovada:  { label: "Aprovado na 2ª prova",  cor: "bg-green-100 text-green-700",  emoji: "✅" },
  prova2_reprovada: { label: "Reprovado definitivo",  cor: "bg-red-100 text-red-700",      emoji: "❌" },
  agendamento:      { label: "Agendando entrevista",  cor: "bg-teal-100 text-teal-700",    emoji: "📅" },
  entrevista:       { label: "Em entrevista",         cor: "bg-indigo-100 text-indigo-700", emoji: "🎤" },
  pagamento2:       { label: "Pagou taxa de emissão", cor: "bg-orange-100 text-orange-700", emoji: "💳" },
  emissao:          { label: "Certificado sendo emitido", cor: "bg-green-100 text-green-700", emoji: "🏆" },
  concluido:        { label: "Certificado emitido",   cor: "bg-green-200 text-green-800",  emoji: "🎓" },
  encerrado:        { label: "Processo encerrado",    cor: "bg-red-200 text-red-800",      emoji: "🚫" },
};

const ETAPAS = [
  { key: "cadastro",         label: "Cadastro completo" },
  { key: "pagamento1",       label: "Pagamento da taxa de análise" },
  { key: "upload",           label: "Envio de documentos" },
  { key: "validacao",        label: "Validação documental" },
  { key: "aguardando_prova", label: "Aguardando prova" },
  { key: "prova1_aprovada",  label: "Prova de competência" },
  { key: "agendamento",      label: "Agendamento de entrevista" },
  { key: "entrevista",       label: "Entrevista técnica" },
  { key: "pagamento2",       label: "Pagamento da taxa de emissão" },
  { key: "concluido",        label: "Certificado emitido" },
];

export function AdminCandidatoDetalhe() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/novo-fluxo/admin/candidatos/:id");
  const { toast } = useToast();
  const [candidato, setCandidato] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [confirmacao, setConfirmacao] = useState<"inativar"|"reativar"|"excluir"|null>(null);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/admin/candidatos/${params.id}`, {
      headers: { "Authorization": `Bearer ${getToken()}` }
    }).then(r => r.json()).then(data => {
      setCandidato(data.candidato);
    }).catch(() => {
      toast({ title: "Erro ao carregar candidato", variant: "destructive" });
    }).finally(() => setCarregando(false));
  }, [params?.id]);

  async function handleAcao(tipo: string) {
    const method = tipo === "excluir" ? "DELETE" : "PUT";
    const path = tipo === "excluir"
      ? `/api/admin/candidatos/${params?.id}`
      : `/api/admin/candidatos/${params?.id}/${tipo}`;
    try {
      const res = await fetch(path, {
        method,
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      const data = await res.json();
      toast({ title: data.message });
      if (tipo === "excluir") navigate("/novo-fluxo/admin/candidatos");
      else setCandidato((prev: any) => ({ ...prev, is_active: tipo === "reativar" }));
      setConfirmacao(null);
    } catch {
      toast({ title: "Erro ao executar ação", variant: "destructive" });
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 50%, #1565c0 100%)" }}>
        <p className="text-blue-300">Carregando...</p>
      </div>
    );
  }

  if (!candidato) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 50%, #1565c0 100%)" }}>
        <Card className="p-8 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="font-semibold">Candidato não encontrado</p>
          <Button className="mt-4" onClick={() => navigate("/novo-fluxo/admin/candidatos")}>Voltar</Button>
        </Card>
      </div>
    );
  }

  const statusInfo = STATUS_LABEL[candidato.status_geral] || { label: "Sem processo", cor: "bg-gray-100 text-gray-600", emoji: "👤" };
  const etapaAtualIdx = ETAPAS.findIndex(e => e.key === candidato.status_geral);

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 45%, #1565c0 75%, #1976d2 100%)" }}>

      {/* Grid */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4fc3f7" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
              style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
              {candidato.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{candidato.full_name}</h1>
              <p className="text-blue-300 text-sm">{candidato.email}</p>
              {!candidato.is_active && (
                <span className="text-xs bg-red-500/20 text-red-300 border border-red-400/30 px-2 py-0.5 rounded-full mt-1 inline-block">
                  Inativo
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {candidato.is_active ? (
              <button onClick={() => setConfirmacao("inativar")}
                className="flex items-center gap-1.5 text-xs border border-white/20 text-amber-300 hover:bg-amber-500/10 px-3 py-2 rounded-xl transition-colors">
                <UserX className="w-3.5 h-3.5" /> Inativar
              </button>
            ) : (
              <button onClick={() => setConfirmacao("reativar")}
                className="flex items-center gap-1.5 text-xs border border-white/20 text-green-300 hover:bg-green-500/10 px-3 py-2 rounded-xl transition-colors">
                <UserCheck className="w-3.5 h-3.5" /> Reativar
              </button>
            )}
            <button onClick={() => setConfirmacao("excluir")}
              className="flex items-center gap-1.5 text-xs border border-white/20 text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">

          {/* Dados pessoais */}
          <Card className="border-white/10" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-4 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Dados Pessoais
              </p>
              <div className="space-y-3">
                {[
                  { label: "Nome completo", value: candidato.full_name, icon: User },
                  { label: "CPF", value: candidato.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"), icon: FileText },
                  { label: "E-mail", value: candidato.email, icon: Mail },
                  { label: "Telefone", value: candidato.phone || "—", icon: Phone },
                  { label: "Data de nascimento", value: candidato.birth_date ? new Date(candidato.birth_date).toLocaleDateString("pt-BR") : "—", icon: Calendar },
                  { label: "Cadastrado em", value: new Date(candidato.created_at).toLocaleString("pt-BR"), icon: Calendar },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-white/40">{label}</p>
                      <p className="text-sm text-white font-medium">{value || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dados profissionais */}
          <Card className="border-white/10" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Dados Profissionais
              </p>
              <div className="space-y-3">
                {[
                  { label: "Empresa", value: candidato.company, icon: Building },
                  { label: "Cargo", value: candidato.job_title, icon: Briefcase },
                  { label: "Formação", value: candidato.education, icon: GraduationCap },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-white/40">{label}</p>
                      <p className="text-sm text-white font-medium">{value || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status do processo */}
          <Card className="border-white/10 md:col-span-2" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wide flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" /> Processo de Certificação
                </p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.cor}`}>
                  {statusInfo.emoji} {statusInfo.label}
                </span>
              </div>

              {candidato.certificacao_nome && (
                <p className="text-white font-semibold mb-4">{candidato.certificacao_nome}</p>
              )}

              {/* Timeline de progresso */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
                {ETAPAS.map((etapa, idx) => {
                  const concluida = idx < etapaAtualIdx;
                  const atual = idx === etapaAtualIdx;
                  return (
                    <div key={etapa.key} className={`flex flex-col items-center p-2.5 rounded-xl text-center transition-all ${
                      atual ? "bg-blue-500/20 border border-blue-400/30" :
                      concluida ? "bg-green-500/10 border border-green-400/20" :
                      "bg-white/5 border border-white/5"
                    }`}>
                      <span className="text-lg mb-1">
                        {concluida ? "✅" : atual ? "▶️" : "⏳"}
                      </span>
                      <p className={`text-xs leading-tight ${atual ? "text-blue-200 font-semibold" : concluida ? "text-green-300" : "text-white/30"}`}>
                        {etapa.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Informações adicionais do processo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <CreditCard className="w-4 h-4 text-blue-300 mx-auto mb-1" />
                  <p className="text-xs text-white/50">Pagamento 1</p>
                  <p className={`text-sm font-bold ${candidato.pagamento1_realizado ? "text-green-400" : "text-white/30"}`}>
                    {candidato.pagamento1_realizado ? "✓ Pago" : "Pendente"}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <FileText className="w-4 h-4 text-blue-300 mx-auto mb-1" />
                  <p className="text-xs text-white/50">Tentativas prova</p>
                  <p className="text-sm font-bold text-white">{candidato.tentativas_prova || 0} / 2</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <CheckCircle className="w-4 h-4 text-blue-300 mx-auto mb-1" />
                  <p className="text-xs text-white/50">Entrevista</p>
                  <p className={`text-sm font-bold ${
                    candidato.aprovado_entrevista === true ? "text-green-400" :
                    candidato.aprovado_entrevista === false ? "text-red-400" : "text-white/30"
                  }`}>
                    {candidato.aprovado_entrevista === true ? "✓ Aprovado" :
                     candidato.aprovado_entrevista === false ? "✗ Reprovado" : "Pendente"}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <CreditCard className="w-4 h-4 text-blue-300 mx-auto mb-1" />
                  <p className="text-xs text-white/50">Pagamento 2</p>
                  <p className={`text-sm font-bold ${candidato.pagamento2_realizado ? "text-green-400" : "text-white/30"}`}>
                    {candidato.pagamento2_realizado ? "✓ Pago" : "Pendente"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão voltar */}
        <div className="mt-8 pb-4">
          <button onClick={() => navigate("/novo-fluxo/admin/candidatos")}
            className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white px-5 py-2.5 rounded-xl text-sm transition-colors"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            ← Voltar à lista de candidatos
          </button>
        </div>
      </div>

      {/* Modal de confirmação */}
      {confirmacao && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardContent className="p-8 text-center">
              {confirmacao === "excluir" ? <AlertTriangle className="w-14 h-14 text-red-500 mx-auto mb-3" /> :
               confirmacao === "inativar" ? <UserX className="w-14 h-14 text-amber-500 mx-auto mb-3" /> :
               <UserCheck className="w-14 h-14 text-green-500 mx-auto mb-3" />}
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                {confirmacao === "excluir" ? "Excluir permanentemente?" :
                 confirmacao === "inativar" ? "Inativar candidato?" : "Reativar candidato?"}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                <strong>{candidato.full_name}</strong>
                {confirmacao === "excluir" ? " — Todos os dados serão removidos permanentemente." :
                 confirmacao === "inativar" ? " — O candidato perderá acesso à plataforma." :
                 " — O candidato recuperará o acesso."}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmacao(null)}>Cancelar</Button>
                <Button className={`flex-1 ${
                  confirmacao === "excluir" ? "bg-red-600 hover:bg-red-700" :
                  confirmacao === "inativar" ? "bg-amber-600 hover:bg-amber-700" :
                  "bg-green-600 hover:bg-green-700"}`}
                  onClick={() => handleAcao(confirmacao)}>
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
