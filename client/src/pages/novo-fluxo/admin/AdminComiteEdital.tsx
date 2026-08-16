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
  Users, Plus, X, Trash2, Loader2, FileText, ShieldCheck, UserCheck, Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MembroComite {
  id: number;
  nome: string;
  cargo: string | null;
  mini_curriculo: string | null;
  linkedin: string | null;
  user_id: number | null;
  user_email: string | null;
  user_nome_conta: string | null;
  ativo: number | boolean;
}

export function AdminComiteEdital() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { certifications } = useCertification();
  const certsAtivas = (certifications || []).filter((c) => c.status === "ativa");

  const [aba, setAba] = useState<"membros" | "atribuicao" | "edital">("membros");

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
          <Button variant="ghost" size="sm" className="text-white hover:text-blue-200" onClick={() => navigate("/novo-fluxo/admin")}>
            ← Voltar ao painel
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Comitê &amp; Edital</h1>
          <p className="text-muted-foreground text-sm">
            Membros do comitê com conta de login (pra assinatura no certificado), quem é responsável por cada
            certificação, e o edital específico de cada uma.
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-border">
          {[
            { key: "membros", label: "Membros do Comitê", icon: Users },
            { key: "atribuicao", label: "Atribuir por Certificação", icon: UserCheck },
            { key: "edital", label: "Edital por Certificação", icon: FileText },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setAba(t.key as any)}
              className={cn("flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                aba === t.key ? "border-blue-900 text-blue-900" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {aba === "membros" && <AbaMembros toast={toast} />}
        {aba === "atribuicao" && <AbaAtribuicao certsAtivas={certsAtivas} toast={toast} />}
        {aba === "edital" && <AbaEdital certsAtivas={certsAtivas} toast={toast} />}
      </main>
    </div>
  );
}

// ─── Aba: Membros do Comitê ────────────────────────────────────────────────────

function AbaMembros({ toast }: { toast: any }) {
  const [membros, setMembros] = useState<MembroComite[]>([]);
  const [usuarios, setUsuarios] = useState<{ id: number; full_name: string; role_nome: string }[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<MembroComite | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ nome: "", cargo: "", miniCurriculo: "", linkedin: "", userId: "" });

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    try {
      const [resMembros, resUsuarios] = await Promise.all([
        (api.admin as any).listarComite(),
        (api.admin as any).listarFiscaisDisponiveis(),
      ]);
      setMembros(resMembros.membros || []);
      setUsuarios(resUsuarios.fiscais || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar comitê", description: err.message, variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal(membro?: MembroComite) {
    if (membro) {
      setEditando(membro);
      setForm({
        nome: membro.nome, cargo: membro.cargo || "", miniCurriculo: membro.mini_curriculo || "",
        linkedin: membro.linkedin || "", userId: membro.user_id ? String(membro.user_id) : "",
      });
    } else {
      setEditando(null);
      setForm({ nome: "", cargo: "", miniCurriculo: "", linkedin: "", userId: "" });
    }
    setModalAberto(true);
  }

  async function salvar() {
    if (!form.nome.trim()) {
      toast({ title: "Digite o nome do membro", variant: "destructive" });
      return;
    }
    setSalvando(true);
    try {
      const payload = {
        nome: form.nome, cargo: form.cargo, miniCurriculo: form.miniCurriculo,
        linkedin: form.linkedin, userId: form.userId ? parseInt(form.userId) : null,
      };
      if (editando) {
        await (api.admin as any).editarMembroComite(editando.id, payload);
      } else {
        await (api.admin as any).criarMembroComite(payload);
      }
      toast({ title: "✅ Membro salvo" });
      setModalAberto(false);
      carregar();
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    if (!confirm("Remover este membro do comitê? Ele também será desvinculado de todas as certificações.")) return;
    try {
      await (api.admin as any).removerMembroComite(id);
      toast({ title: "Membro removido" });
      carregar();
    } catch (err: any) {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button className="bg-blue-900 hover:bg-blue-800" onClick={() => abrirModal()}>
          <Plus className="w-4 h-4 mr-1.5" /> Novo membro
        </Button>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando...</div>
      ) : membros.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">Nenhum membro cadastrado ainda.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {membros.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground text-sm">{m.nome} {m.cargo && <span className="text-muted-foreground font-normal">— {m.cargo}</span>}</p>
                  {m.user_id ? (
                    <p className="text-xs text-green-700 flex items-center gap-1 mt-0.5"><Link2 className="w-3 h-3" /> Conta vinculada: {m.user_nome_conta} ({m.user_email})</p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-0.5">Sem conta de login vinculada — não poderá assinar certificados digitalmente</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => abrirModal(m)}>Editar</Button>
                  <button onClick={() => excluir(m.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">{editando ? "Editar membro" : "Novo membro do comitê"}</h2>
                <button onClick={() => setModalAberto(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Nome *</Label>
                  <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Cargo</Label>
                  <Input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} className="mt-1" placeholder="Ex: Presidente do Comitê" />
                </div>
                <div>
                  <Label>Conta de login vinculada</Label>
                  <select
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1"
                  >
                    <option value="">Nenhuma (sem login)</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name} — {u.role_nome}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Necessário pra assinatura digital no certificado (fase seguinte).</p>
                </div>
                <div>
                  <Label>Mini-currículo</Label>
                  <textarea
                    value={form.miniCurriculo}
                    onChange={(e) => setForm({ ...form, miniCurriculo: e.target.value })}
                    rows={3}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm mt-1 resize-none"
                  />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="mt-1" />
                </div>
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

// ─── Aba: Atribuição por Certificação ──────────────────────────────────────────

function AbaAtribuicao({ certsAtivas, toast }: { certsAtivas: any[]; toast: any }) {
  const [certSelecionada, setCertSelecionada] = useState(certsAtivas[0]?.id || "");
  const [atribuidos, setAtribuidos] = useState<MembroComite[]>([]);
  const [todosMembros, setTodosMembros] = useState<MembroComite[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [membroSelecionado, setMembroSelecionado] = useState("");
  const [papel, setPapel] = useState("");

  useEffect(() => { if (certSelecionada) carregar(); }, [certSelecionada]);

  async function carregar() {
    setCarregando(true);
    try {
      const [resAtribuidos, resTodos] = await Promise.all([
        (api.admin as any).listarComiteDaCertificacao(certSelecionada),
        (api.admin as any).listarComite(),
      ]);
      setAtribuidos(resAtribuidos.membros || []);
      setTodosMembros(resTodos.membros || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar", description: err.message, variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  async function atribuir() {
    if (!membroSelecionado) return;
    try {
      await (api.admin as any).atribuirMembroACertificacao(certSelecionada, parseInt(membroSelecionado), papel);
      toast({ title: "Membro atribuído" });
      setMembroSelecionado(""); setPapel("");
      carregar();
    } catch (err: any) {
      toast({ title: "Erro ao atribuir", description: err.message, variant: "destructive" });
    }
  }

  async function remover(membroId: number) {
    try {
      await (api.admin as any).removerMembroDaCertificacao(certSelecionada, membroId);
      toast({ title: "Membro removido da certificação" });
      carregar();
    } catch (err: any) {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    }
  }

  const disponiveis = todosMembros.filter((m) => !atribuidos.some((a) => a.id === m.id));

  return (
    <div>
      <Card className="mb-4">
        <CardContent className="p-5">
          <Label>Certificação</Label>
          <select value={certSelecionada} onChange={(e) => setCertSelecionada(e.target.value)}
            className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1">
            {certsAtivas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Atribuir novo membro</p>
          <div className="flex gap-2 flex-wrap">
            <select value={membroSelecionado} onChange={(e) => setMembroSelecionado(e.target.value)}
              className="flex-1 min-w-[180px] border border-input rounded-md px-3 py-2 text-sm bg-background">
              <option value="">Selecione um membro...</option>
              {disponiveis.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
            <Input placeholder="Papel (opcional, ex: Presidente)" value={papel} onChange={(e) => setPapel(e.target.value)} className="flex-1 min-w-[180px]" />
            <Button className="bg-blue-900 hover:bg-blue-800" onClick={atribuir} disabled={!membroSelecionado}>Atribuir</Button>
          </div>
        </CardContent>
      </Card>

      {carregando ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando...</div>
      ) : atribuidos.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Nenhum membro atribuído a esta certificação ainda.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {atribuidos.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">{m.nome}</span>
                  {m.cargo && <span className="text-xs text-muted-foreground">— {m.cargo}</span>}
                  {!m.user_id && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">sem login</span>}
                </div>
                <button onClick={() => remover(m.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Aba: Edital por Certificação ──────────────────────────────────────────────

function AbaEdital({ certsAtivas, toast }: { certsAtivas: any[]; toast: any }) {
  const [certSelecionada, setCertSelecionada] = useState(certsAtivas[0]?.id || "");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [versaoAtual, setVersaoAtual] = useState<number | null>(null);
  const [form, setForm] = useState({ titulo: "Edital", conteudo: "", urlExterna: "", dataAbertura: "", dataEncerramento: "" });

  useEffect(() => { if (certSelecionada) carregar(); }, [certSelecionada]);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await (api.admin as any).buscarEdital(certSelecionada);
      if (res.edital) {
        setForm({
          titulo: res.edital.titulo || "Edital",
          conteudo: res.edital.conteudo || "",
          urlExterna: res.edital.url_externa || "",
          dataAbertura: res.edital.data_abertura ? res.edital.data_abertura.slice(0, 10) : "",
          dataEncerramento: res.edital.data_encerramento ? res.edital.data_encerramento.slice(0, 10) : "",
        });
        setVersaoAtual(res.edital.versao);
      } else {
        setForm({ titulo: "Edital", conteudo: "", urlExterna: "", dataAbertura: "", dataEncerramento: "" });
        setVersaoAtual(null);
      }
    } catch (err: any) {
      toast({ title: "Erro ao carregar edital", description: err.message, variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  async function salvar() {
    if (!form.titulo.trim()) {
      toast({ title: "Digite o título do edital", variant: "destructive" });
      return;
    }
    setSalvando(true);
    try {
      const res = await (api.admin as any).salvarEdital(certSelecionada, {
        titulo: form.titulo, conteudo: form.conteudo, urlExterna: form.urlExterna,
        dataAbertura: form.dataAbertura || null, dataEncerramento: form.dataEncerramento || null,
      });
      toast({ title: `✅ Edital salvo (versão ${res.versao})` });
      setVersaoAtual(res.versao);
    } catch (err: any) {
      toast({ title: "Erro ao salvar edital", description: err.message, variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <Card className="mb-4">
        <CardContent className="p-5">
          <Label>Certificação</Label>
          <select value={certSelecionada} onChange={(e) => setCertSelecionada(e.target.value)}
            className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1">
            {certsAtivas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </CardContent>
      </Card>

      {carregando ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando...</div>
      ) : (
        <Card>
          <CardContent className="p-5 space-y-4">
            {versaoAtual && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800">
                Versão atual: <strong>v{versaoAtual}</strong>. Candidatos que já iniciaram o processo mantêm a versão que viram — mudar o conteúdo aqui cria uma nova versão automaticamente, sem afetar quem já está em andamento.
              </div>
            )}
            <div>
              <Label>Título *</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data de abertura</Label>
                <Input type="date" value={form.dataAbertura} onChange={(e) => setForm({ ...form, dataAbertura: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Data de encerramento</Label>
                <Input type="date" value={form.dataEncerramento} onChange={(e) => setForm({ ...form, dataEncerramento: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>URL externa (PDF, opcional)</Label>
              <Input value={form.urlExterna} onChange={(e) => setForm({ ...form, urlExterna: e.target.value })} className="mt-1" placeholder="https://..." />
            </div>
            <div>
              <Label>Conteúdo (texto completo do edital)</Label>
              <textarea
                value={form.conteudo}
                onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                rows={10}
                className="w-full border border-input rounded-md px-3 py-2 text-sm mt-1 font-mono"
              />
            </div>
            <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={salvar} disabled={salvando}>
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar edital"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
