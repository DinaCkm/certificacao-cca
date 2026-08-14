import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCertification } from "@/contexts/CertificationContext";
import { api } from "@/lib/api";
import { Target, Plus, X, Trash2, Loader2, RefreshCw } from "lucide-react";

interface Eixo {
  id: number;
  nome: string;
  descricao: string | null;
  ordem: number;
  ativo: number | boolean;
}

export function AdminEixosConhecimento() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { certifications } = useCertification();
  const certsAtivas = (certifications || []).filter((c) => c.status === "ativa");

  const [certSelecionada, setCertSelecionada] = useState(certsAtivas[0]?.id || "");
  const [eixos, setEixos] = useState<Eixo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ nome: "", descricao: "" });

  useEffect(() => { if (certSelecionada) carregar(); }, [certSelecionada]);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await (api.admin as any).listarEixos(certSelecionada);
      setEixos(res.eixos || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar eixos", description: err.message, variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal() {
    setForm({ nome: "", descricao: "" });
    setModalAberto(true);
  }

  async function salvar() {
    if (!form.nome.trim()) {
      toast({ title: "Digite o nome do eixo", variant: "destructive" });
      return;
    }
    setSalvando(true);
    try {
      await (api.admin as any).criarEixo({ cert_slug: certSelecionada, nome: form.nome, descricao: form.descricao, ordem: eixos.length });
      toast({ title: "✅ Eixo criado" });
      setModalAberto(false);
      carregar();
    } catch (err: any) {
      toast({ title: "Erro ao criar eixo", description: err.message, variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    if (!confirm("Remover este eixo de conhecimento?")) return;
    try {
      await (api.admin as any).removerEixo(id);
      toast({ title: "Eixo removido" });
      carregar();
    } catch (err: any) {
      toast({ title: "Não foi possível remover", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Eixos de Conhecimento</h1>
          <p className="text-muted-foreground text-sm">
            Defina as competências avaliadas em cada certificação. Toda questão nova do banco precisa pertencer a um eixo — é assim que o relatório de desempenho por competência funciona.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-5">
            <Label>Certificação</Label>
            <select
              value={certSelecionada}
              onChange={(e) => setCertSelecionada(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1"
            >
              {certsAtivas.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Eixos cadastrados</h2>
          <Button size="sm" className="bg-blue-900 hover:bg-blue-800" onClick={abrirModal}>
            <Plus className="w-4 h-4 mr-1.5" /> Novo eixo
          </Button>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando...
          </div>
        ) : eixos.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum eixo cadastrado para esta certificação ainda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {eixos.map((e) => (
              <Card key={e.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{e.nome}</p>
                    {e.descricao && <p className="text-xs text-muted-foreground mt-0.5">{e.descricao}</p>}
                  </div>
                  <button onClick={() => excluir(e.id)} className="text-red-500 hover:text-red-700 shrink-0"><Trash2 className="w-4 h-4" /></button>
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
                <h2 className="font-bold text-lg">Novo eixo de conhecimento</h2>
                <button onClick={() => setModalAberto(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Nome *</Label>
                  <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="mt-1" placeholder="Ex: Controladoria, Contabilidade, Análise Financeira" />
                </div>
                <div>
                  <Label>Descrição (opcional)</Label>
                  <textarea
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    rows={2}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm mt-1 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setModalAberto(false)}>Cancelar</Button>
                <Button className="flex-1 bg-blue-900 hover:bg-blue-800" onClick={salvar} disabled={salvando}>
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar eixo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
