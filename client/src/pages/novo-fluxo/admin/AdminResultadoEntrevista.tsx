import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle, XCircle, Users, Mail, Award,
  Clock, AlertCircle, Loader2, FileText
} from "lucide-react";

function getToken() { return localStorage.getItem("anefac_token"); }

export function AdminResultadoEntrevista() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [pendentes, setPendentes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<number | null>(null);
  const [confirmacao, setConfirmacao] = useState<{
    processo: any;
    decisao: "habilitado" | "nao_habilitado";
  } | null>(null);

  useEffect(() => { carregarPendentes(); }, []);

  async function carregarPendentes() {
    setCarregando(true);
    try {
      const res = await fetch("/api/admin/entrevista/pendentes", {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setPendentes(data.pendentes || []);
    } catch {
      toast({ title: "Erro ao carregar entrevistas", variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  async function registrarResultado(processoId: number, decisao: "habilitado" | "nao_habilitado") {
    setProcessando(processoId);
    try {
      const res = await fetch(`/api/admin/entrevista/${processoId}/resultado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ decisao })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({
        title: decisao === "habilitado"
          ? "✅ Candidato habilitado! E-mail enviado automaticamente."
          : "Resultado registrado. E-mail enviado ao candidato.",
      });
      setConfirmacao(null);
      carregarPendentes();
    } catch (err: any) {
      toast({ title: err.message || "Erro ao registrar resultado", variant: "destructive" });
    } finally {
      setProcessando(null);
    }
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 45%, #1565c0 75%, #1976d2 100%)" }}>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4fc3f7" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1B7A6B, #0f4d43)" }}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Resultado de Entrevistas</h1>
              <p className="text-sm text-blue-300">
                {pendentes.length} candidato(s) aguardando resultado
              </p>
            </div>
          </div>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={carregarPendentes}>
            Atualizar
          </Button>
        </div>

        {/* Aviso de fluxo */}
        <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 mb-6">
          <AlertCircle className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Como funciona</p>
            <p className="text-sm text-blue-200 mt-1">
              Ao marcar <strong className="text-green-300">Habilitado</strong>, o sistema automaticamente:
              (1) atualiza o status do candidato para "Aguardando Pagamento 2",
              (2) envia um e-mail ao candidato com o link para realizar o pagamento do certificado.
              <br/>
              Ao marcar <strong className="text-red-300">Não Habilitado</strong>, o processo é encerrado e o candidato é notificado por e-mail.
            </p>
          </div>
        </div>

        {/* Lista */}
        {carregando ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-300 mx-auto mb-3" />
            <p className="text-blue-300">Carregando entrevistas...</p>
          </div>
        ) : pendentes.length === 0 ? (
          <Card className="border-white/10" style={{ background: "rgba(255,255,255,0.07)" }}>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white font-semibold">Nenhuma entrevista pendente</p>
              <p className="text-blue-300 text-sm mt-1">Todos os candidatos já têm resultado registrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendentes.map(p => (
              <Card key={p.processo_id} className="border-white/10" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">

                    {/* Info do candidato */}
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
                        {p.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{p.full_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-blue-300" />
                          <p className="text-sm text-blue-300">{p.email}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Award className="w-3.5 h-3.5 text-blue-300" />
                          <p className="text-xs text-blue-200">{p.cert_nome}</p>
                        </div>
                        {p.entrevista_data && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-blue-300" />
                            <p className="text-xs text-blue-200">
                              Entrevista: {new Date(p.entrevista_data).toLocaleString("pt-BR")}
                            </p>
                          </div>
                        )}
                        <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                          {p.status_geral === "entrevista" ? "🎤 Em entrevista" : "📅 Agendado"}
                        </span>
                      </div>
                    </div>

                    {/* Botões de decisão */}
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => setConfirmacao({ processo: p, decisao: "habilitado" })}
                        disabled={processando === p.processo_id}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #1B7A6B, #0f4d43)" }}>
                        <CheckCircle className="w-4 h-4" />
                        Habilitado ✓
                      </button>
                      <button
                        onClick={() => setConfirmacao({ processo: p, decisao: "nao_habilitado" })}
                        disabled={processando === p.processo_id}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #8B2020, #5c1414)" }}>
                        <XCircle className="w-4 h-4" />
                        Não Habilitado ✗
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 pb-4">
          <a href="/novo-fluxo/admin"
            className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white px-5 py-2.5 rounded-xl text-sm transition-colors"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            ← Voltar ao menu admin
          </a>
        </div>
      </div>

      {/* Modal de confirmação */}
      {confirmacao && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
            <div className="h-1.5 w-full" style={{
              background: confirmacao.decisao === "habilitado"
                ? "linear-gradient(to right, #1B7A6B, #4ade80)"
                : "linear-gradient(to right, #8B2020, #ef4444)"
            }} />
            <CardContent className="p-8 text-center">
              {confirmacao.decisao === "habilitado"
                ? <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                : <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              }

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {confirmacao.decisao === "habilitado" ? "Confirmar Habilitação?" : "Confirmar Não Habilitação?"}
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                <strong>{confirmacao.processo.full_name}</strong>
                {confirmacao.decisao === "habilitado"
                  ? " será marcado como HABILITADO e receberá automaticamente um e-mail com o link para pagamento do certificado."
                  : " será marcado como NÃO HABILITADO e o processo será encerrado. O candidato será notificado por e-mail."}
              </p>

              <div className={`rounded-xl p-3 mb-5 text-sm font-medium ${
                confirmacao.decisao === "habilitado"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {confirmacao.decisao === "habilitado"
                  ? "📧 E-mail de habilitação + link de pagamento será enviado automaticamente"
                  : "📧 E-mail de encerramento do processo será enviado automaticamente"}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmacao(null)}>
                  Cancelar
                </Button>
                <Button
                  className={`flex-1 text-white ${confirmacao.decisao === "habilitado" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                  onClick={() => registrarResultado(confirmacao.processo.processo_id, confirmacao.decisao)}
                  disabled={processando === confirmacao.processo.processo_id}>
                  {processando === confirmacao.processo.processo_id
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processando...</>
                    : confirmacao.decisao === "habilitado" ? "✓ Confirmar Habilitação" : "✗ Confirmar Não Habilitação"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
