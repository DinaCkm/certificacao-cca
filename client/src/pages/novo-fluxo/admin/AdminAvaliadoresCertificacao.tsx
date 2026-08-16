import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCertification } from "@/contexts/CertificationContext";
import { api } from "@/lib/api";
import { UserCheck, Trash2, Loader2, ShieldAlert } from "lucide-react";

interface Avaliador { id: number; full_name: string; email: string; }

export function AdminAvaliadoresCertificacao() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { certifications } = useCertification();
  const certsAtivas = (certifications || []).filter((c) => c.status === "ativa");

  const [certSelecionada, setCertSelecionada] = useState(certsAtivas[0]?.id || "");
  const [todosAvaliadores, setTodosAvaliadores] = useState<Avaliador[]>([]);
  const [designados, setDesignados] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [avaliadorEscolhido, setAvaliadorEscolhido] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { carregarTodos(); }, []);
  useEffect(() => { if (certSelecionada) carregarDesignados(); }, [certSelecionada]);

  async function carregarTodos() {
    try {
      const res = await (api.admin as any).listarTodosAvaliadoresCertificacao();
      setTodosAvaliadores(res.avaliadores || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar avaliadores", description: err.message, variant: "destructive" });
    }
  }

  async function carregarDesignados() {
    setCarregando(true);
    try {
      const res = await (api.admin as any).listarAvaliadoresDaCertificacao(certSelecionada);
      setDesignados(res.avaliadores || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar designações", description: err.message, variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  async function designar() {
    if (!avaliadorEscolhido) return;
    setSalvando(true);
    try {
      await (api.admin as any).designarAvaliadorCertificacao(certSelecionada, parseInt(avaliadorEscolhido));
      toast({ title: "Avaliador designado" });
      setAvaliadorEscolhido("");
      carregarDesignados();
    } catch (err: any) {
      toast({ title: "Erro ao designar", description: err.message, variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  }

  async function remover(userId: number) {
    if (!confirm("Remover a designação deste avaliador para esta certificação?")) return;
    try {
      await (api.admin as any).removerDesignacaoAvaliador(certSelecionada, userId);
      toast({ title: "Designação removida" });
      carregarDesignados();
    } catch (err: any) {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    }
  }

  const disponiveis = todosAvaliadores.filter((a) => !designados.some((d) => d.user_id === a.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-900 font-bold text-sm">A</span>
            </div>
            <span className="font-bold">ANEFAC</span>
            <span className="text-blue-300 text-xs ml-2">Avaliadores por Certificação</span>
          </div>
          <Button variant="ghost" size="sm" className="text-white" onClick={() => navigate("/novo-fluxo/admin")}>
            ← Voltar ao painel
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Avaliadores por Certificação</h1>
          <p className="text-muted-foreground text-sm">
            Um avaliador só consegue analisar documentos das certificações às quais estiver designado aqui —
            evita que alguém analise (e decida) um processo de uma certificação que não é a sua.
          </p>
        </div>

        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <ShieldAlert className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800">
            Avaliadores já cadastrados antes desta tela existir foram migrados automaticamente com acesso a todas as
            certificações ativas (pra não perderem acesso do dia pra noite). Ajuste aqui conforme necessário.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-5">
            <label className="text-sm font-semibold text-foreground mb-2 block">Certificação</label>
            <select
              value={certSelecionada}
              onChange={(e) => setCertSelecionada(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
            >
              {certsAtivas.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-5">
            <label className="text-sm font-semibold text-foreground mb-2 block">Designar novo avaliador</label>
            <div className="flex gap-2">
              <select
                value={avaliadorEscolhido}
                onChange={(e) => setAvaliadorEscolhido(e.target.value)}
                className="flex-1 border border-input rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="">Selecione um avaliador...</option>
                {disponiveis.map((a) => (
                  <option key={a.id} value={a.id}>{a.full_name} — {a.email}</option>
                ))}
              </select>
              <Button className="bg-blue-900 hover:bg-blue-800" onClick={designar} disabled={!avaliadorEscolhido || salvando}>
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Designar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-sm font-semibold text-foreground mb-3">Avaliadores designados</h2>
        {carregando ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando...
          </div>
        ) : designados.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhum avaliador designado ainda para esta certificação.
          </CardContent></Card>
        ) : (
          <div className="space-y-2">
            {designados.map((d) => (
              <Card key={d.designacao_id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-green-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">{d.full_name}</p>
                      <p className="text-xs text-muted-foreground">{d.email}</p>
                    </div>
                  </div>
                  <button onClick={() => remover(d.user_id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
