import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCertification } from "@/contexts/CertificationContext";
import { api } from "@/lib/api";
import {
  Award, Plus, X, Trash2, Loader2, RefreshCw, ToggleLeft, ToggleRight, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulacaoConfig {
  id: number;
  cert_slug: string;
  cert_nome: string;
  titulo: string;
  quantidade_questoes: number;
  ativa: number | boolean;
  questoes_no_banco: number;
}

export function AdminSimulacoes() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { certifications } = useCertification();
  const certsAtivas = (certifications || []).filter((c) => c.status === "ativa");

  const [simulacoes, setSimulacoes] = useState<SimulacaoConfig[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({ cert_slug: "", titulo: "", quantidade_questoes: 5, ativa: true });

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await (api.admin as any).listarSimulacoes();
      setSimulacoes(res.simulacoes || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar simulações", description: err.message, variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal(existente?: SimulacaoConfig) {
    if (existente) {
      setForm({ cert_slug: existente.cert_slug, titulo: existente.titulo, quantidade_questoes: existente.quantidade_questoes, ativa: !!existente.ativa });
    } else {
      const certDisponivel = certsAtivas.find((c) => !simulacoes.some((s) => s.cert_slug === c.id));
      setForm({ cert_slug: certDisponivel?.id || "", titulo: certDisponivel ? `Simulado — ${certDisponivel.nome}` : "", quantidade_questoes: 5, ativa: true });
    }
    setModalAberto(true);
  }

  async function salvar() {
    if (!form.cert_slug || !form.titulo || !form.quantidade_questoes) {
      toast({ title: "Preencha certificação, título e quantidade de questões", variant: "destructive" });
      return;
    }
    setSalvando(true);
    try {
      await (api.admin as any).salvarSimulacao(form);
      toast({ title: "✅ Simulação salva" });
      setModalAberto(false);
      carregar();
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtiva(s: SimulacaoConfig) {
    try {
      await (api.admin as any).salvarSimulacao({ cert_slug: s.cert_slug, titulo: s.titulo, quantidade_questoes: s.quantidade_questoes, ativa: !s.ativa });
      carregar();
    } catch (err: any) {
      toast({ title: "Erro ao atualizar", description: err.message, variant: "destructive" });
    }
  }

  async function excluir(id: number) {
    if (!confirm("Remover esta configuração de simulação?")) return;
    try {
      await (api.admin as any).removerSimulacao(id);
      toast({ title: "Simulação removida" });
      carregar();
    } catch (err: any) {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Simulações</h1>
            <p className="text-muted-foreground text-sm">
              Configure o simulado de cada certificação. As questões vêm sempre do banco real (Parametrizar Prova) — nunca um banco separado.
            </p>
          </div>
          <Button className="bg-blue-900 hover:bg-blue-800" onClick={() => abrirModal()}>
            <Plus className="w-4 h-4 mr-1.5" /> Nova simulação
          </Button>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando...
          </div>
        ) : simulacoes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="font-bold text-foreground mb-2">Nenhuma simulação configurada</h2>
              <p className="text-sm text-muted-foreground">Crie a primeira para liberar o simulado público e o do mural do candidato.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {simulacoes.map((s) => (
              <Card key={s.id} className={cn("border-2", s.ativa ? "border-green-200" : "border-gray-200 opacity-70")}>
                <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-900 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{s.titulo}</p>
                      <p className="text-xs text-muted-foreground">{s.cert_nome}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{s.quantidade_questoes} questões por simulado</span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {s.questoes_no_banco} marcadas p/ simulação
                        </span>
                      </div>
                      {s.questoes_no_banco < s.quantidade_questoes && (
                        <p className="text-xs text-amber-600 font-medium mt-1">
                          ⚠ Poucas questões marcadas "só simulação" em Parametrizar Prova — o simulado nunca usa questões do banco oficial
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => alternarAtiva(s)} className="flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: s.ativa ? "#16a34a" : "#9ca3af" }}>
                      {s.ativa ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      {s.ativa ? "Ativa" : "Inativa"}
                    </button>
                    <Button size="sm" variant="outline" onClick={() => abrirModal(s)}>Editar</Button>
                    <button onClick={() => excluir(s.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Configurar simulação</h2>
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

                <div>
                  <Label>Título do simulado *</Label>
                  <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="mt-1" placeholder="Ex: Simulado — Certificação Controller ANEFAC" />
                </div>

                <div>
                  <Label>Quantidade de questões *</Label>
                  <Input
                    type="number" min={1} value={form.quantidade_questoes}
                    onChange={(e) => setForm({ ...form, quantidade_questoes: parseInt(e.target.value) || 5 })}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Sorteadas aleatoriamente do banco de questões da certificação a cada simulado.</p>
                </div>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.ativa} onChange={(e) => setForm({ ...form, ativa: e.target.checked })} className="accent-blue-900" />
                  Simulação ativa (visível para candidatos e no site público)
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setModalAberto(false)}>Cancelar</Button>
                <Button className="flex-1 bg-blue-900 hover:bg-blue-800" onClick={salvar} disabled={salvando}>
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
