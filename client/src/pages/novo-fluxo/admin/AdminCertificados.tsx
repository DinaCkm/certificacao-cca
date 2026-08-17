import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCertification } from "@/contexts/CertificationContext";
import { api } from "@/lib/api";
import { Award, Download, RotateCcw, Ban, Loader2, Search, X, ShieldCheck, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";

interface Certificado {
  id: number;
  codigo: string;
  candidato_nome: string;
  certificacao_nome: string;
  cert_slug: string;
  emitido_em: string;
  validade_ate: string | null;
  status: "ativo" | "revogado";
  revogado_em: string | null;
  motivo_revogacao: string | null;
}

export function AdminCertificados() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { certifications } = useCertification();
  const certsAtivas = (certifications || []).filter((c) => c.status === "ativa");

  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Filtros
  const [filtroCert, setFiltroCert] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCandidato, setFiltroCandidato] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  // Modal de confirmação (revogar/reemitir)
  const [modalAcao, setModalAcao] = useState<{ tipo: "revogar" | "reemitir"; certificado: Certificado } | null>(null);
  const [motivo, setMotivo] = useState("");
  const [processando, setProcessando] = useState(false);

  useEffect(() => { carregar(); }, [filtroCert, filtroStatus]);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await api.admin.listarCertificados({
        certSlug: filtroCert || undefined,
        status: filtroStatus || undefined,
        candidatoNome: filtroCandidato || undefined,
        dataInicio: filtroDataInicio || undefined,
        dataFim: filtroDataFim || undefined,
      });
      setCertificados(res.certificados || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar certificados", description: err.message, variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal(tipo: "revogar" | "reemitir", certificado: Certificado) {
    setModalAcao({ tipo, certificado });
    setMotivo("");
  }

  async function confirmarAcao() {
    if (!modalAcao || !motivo.trim()) {
      toast({ title: "Informe o motivo", variant: "destructive" });
      return;
    }
    setProcessando(true);
    try {
      if (modalAcao.tipo === "revogar") {
        await api.admin.revogarCertificado(modalAcao.certificado.id, motivo);
        toast({ title: "Certificado revogado" });
      } else {
        await api.admin.reemitirCertificado(modalAcao.certificado.id, motivo);
        toast({ title: "Certificado reemitido com novo código" });
      }
      setModalAcao(null);
      carregar();
    } catch (err: any) {
      toast({ title: "Erro ao processar", description: err.message, variant: "destructive" });
    } finally {
      setProcessando(false);
    }
  }

  async function baixarPdf(cert: Certificado) {
    const token = localStorage.getItem("anefac_token");
    try {
      const res = await fetch(`/api/admin/certificados/${cert.id}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Erro ao baixar");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `certificado-${cert.codigo}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Erro ao baixar PDF", variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-900 font-bold text-sm">A</span>
            </div>
            <span className="font-bold">ANEFAC</span>
            <span className="text-blue-300 text-xs ml-2">Certificados Emitidos</span>
          </div>
          <Button variant="ghost" size="sm" className="text-white" onClick={() => navigate("/novo-fluxo/admin")}>
            ← Voltar ao painel
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Certificados Emitidos</h1>
        <p className="text-muted-foreground text-sm mb-6">Consulte, revogue ou reemita certificados. Toda reemissão preserva o histórico do certificado anterior.</p>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-5 grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Certificação</label>
              <select value={filtroCert} onChange={(e) => setFiltroCert(e.target.value)} className="w-full border border-input rounded-md px-2 py-2 text-sm bg-background">
                <option value="">Todas</option>
                {certsAtivas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Status</label>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="w-full border border-input rounded-md px-2 py-2 text-sm bg-background">
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="revogado">Revogado</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Candidato</label>
              <Input value={filtroCandidato} onChange={(e) => setFiltroCandidato(e.target.value)} placeholder="Nome..." className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">De</label>
              <Input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} className="text-sm" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Até</label>
                <Input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} className="text-sm" />
              </div>
              <Button size="sm" className="bg-blue-900 hover:bg-blue-800 h-9" onClick={carregar}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {carregando ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando...
          </div>
        ) : certificados.length === 0 ? (
          <Card><CardContent className="p-12 text-center">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Nenhum certificado encontrado com esses filtros.</p>
          </CardContent></Card>
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground text-xs uppercase border-b border-border">
                    <th className="py-3 px-4">Candidato</th>
                    <th className="py-3 px-4">Certificação</th>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Emitido em</th>
                    <th className="py-3 px-4">Validade</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {certificados.map((c) => (
                    <tr key={c.id} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">{c.candidato_nome}</td>
                      <td className="py-3 px-4 text-muted-foreground">{c.certificacao_nome}</td>
                      <td className="py-3 px-4 font-mono text-xs">{c.codigo}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{new Date(c.emitido_em).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{c.validade_ate ? new Date(c.validade_ate).toLocaleDateString("pt-BR") : "Indeterminada"}</td>
                      <td className="py-3 px-4">
                        {c.status === "ativo" ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit"><ShieldCheck className="w-3 h-3" /> Ativo</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full w-fit"><ShieldX className="w-3 h-3" /> Revogado</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => baixarPdf(c)} title="Baixar PDF" className="text-blue-700 hover:text-blue-900"><Download className="w-4 h-4" /></button>
                          {c.status === "ativo" && (
                            <>
                              <button onClick={() => abrirModal("reemitir", c)} title="Reemitir" className="text-amber-600 hover:text-amber-800"><RotateCcw className="w-4 h-4" /></button>
                              <button onClick={() => abrirModal("revogar", c)} title="Revogar" className="text-red-600 hover:text-red-800"><Ban className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Modal de confirmação — nunca revoga/reemite sem motivo explícito */}
      {modalAcao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-foreground">
                  {modalAcao.tipo === "revogar" ? "Revogar certificado" : "Reemitir certificado"}
                </h2>
                <button onClick={() => setModalAcao(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                {modalAcao.certificado.candidato_nome} — {modalAcao.certificado.certificacao_nome}
              </p>
              <p className="text-xs font-mono text-muted-foreground mb-4">{modalAcao.certificado.codigo}</p>

              {modalAcao.tipo === "reemitir" && (
                <div className={cn("text-xs rounded-lg p-3 mb-4", "bg-amber-50 border border-amber-200 text-amber-800")}>
                  O certificado atual será revogado (preservando o histórico) e um novo será emitido com código e PDF diferentes.
                </div>
              )}

              <label className="text-xs font-semibold text-foreground mb-1 block">Motivo (obrigatório)</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                placeholder={modalAcao.tipo === "revogar" ? "Ex: solicitação do candidato, erro de dados, fraude detectada..." : "Ex: nome do candidato estava incorreto, precisa corrigir e reemitir..."}
                className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none"
              />

              <div className="flex gap-3 mt-5">
                <Button variant="outline" className="flex-1" onClick={() => setModalAcao(null)}>Cancelar</Button>
                <Button
                  className={cn("flex-1", modalAcao.tipo === "revogar" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700")}
                  onClick={confirmarAcao}
                  disabled={processando || !motivo.trim()}
                >
                  {processando ? <Loader2 className="w-4 h-4 animate-spin" /> : modalAcao.tipo === "revogar" ? "Confirmar revogação" : "Confirmar reemissão"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
