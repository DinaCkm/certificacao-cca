import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCertification } from "@/contexts/CertificationContext";
import { api } from "@/lib/api";
import {
  FileText, RefreshCw, CheckCircle, XCircle, AlertTriangle, TrendingDown, TrendingUp,
  Loader2, Users, Target, Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  aprovado: { label: "Aprovado", className: "bg-green-100 text-green-700" },
  reprovado: { label: "Reprovado", className: "bg-red-100 text-red-700" },
  anulada: { label: "Anulada", className: "bg-amber-100 text-amber-700" },
};

export function AdminRelatorioProva() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { certifications } = useCertification();
  const certsAtivas = (certifications || []).filter((c) => c.status === "ativa");

  const [certSelecionada, setCertSelecionada] = useState("");
  const [dados, setDados] = useState<Awaited<ReturnType<typeof api.admin.relatorioProva>> | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregar(); }, [certSelecionada]);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await api.admin.relatorioProva(certSelecionada || undefined);
      setDados(res);
    } catch (err: any) {
      toast({ title: "Erro ao carregar relatório", description: err.message, variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  function statusDaTentativa(t: any): "aprovado" | "reprovado" | "anulada" {
    if (t.status === "anulada") return "anulada";
    return t.aprovado ? "aprovado" : "reprovado";
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
            <h1 className="text-2xl font-bold text-foreground mb-1">Relatório da Prova Oficial</h1>
            <p className="text-muted-foreground text-sm">Resultados, aprovação e desempenho por eixo — só a prova oficial, nunca o simulado.</p>
          </div>
          <select
            value={certSelecionada}
            onChange={(e) => setCertSelecionada(e.target.value)}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="">Todas as certificações</option>
            {certsAtivas.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando...
          </div>
        ) : !dados || dados.resumo.total_tentativas === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="font-bold text-foreground mb-2">Nenhuma prova finalizada ainda</h2>
              <p className="text-sm text-muted-foreground">Os resultados aparecem aqui assim que candidatos concluírem a prova oficial.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <Card><CardContent className="p-4 text-center">
                <Users className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                <p className="text-2xl font-black text-foreground">{dados.resumo.total_tentativas}</p>
                <p className="text-xs text-muted-foreground">Tentativas</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <CheckCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-black text-green-700">{dados.resumo.total_aprovados}</p>
                <p className="text-xs text-muted-foreground">Aprovados</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <XCircle className="w-4 h-4 text-red-600 mx-auto mb-1" />
                <p className="text-2xl font-black text-red-700">{dados.resumo.total_reprovados}</p>
                <p className="text-xs text-muted-foreground">Reprovados</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <AlertTriangle className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <p className="text-2xl font-black text-amber-700">{dados.resumo.total_anuladas}</p>
                <p className="text-xs text-muted-foreground">Anuladas</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <Percent className="w-4 h-4 text-indigo-700 mx-auto mb-1" />
                <p className="text-2xl font-black text-indigo-700">{dados.resumo.taxa_aprovacao}%</p>
                <p className="text-xs text-muted-foreground">Taxa de aprovação</p>
              </CardContent></Card>
            </div>

            {/* Desempenho por eixo agregado */}
            {dados.eixos.length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-blue-700" />
                    <h2 className="font-bold text-foreground text-sm">Desempenho médio por eixo (todos os candidatos)</h2>
                  </div>
                  <div className="space-y-3">
                    {dados.eixos.map((e) => (
                      <div key={e.eixo_id ?? e.nome}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-foreground flex items-center gap-1.5">
                            {e.percentual >= 60 ? <TrendingUp className="w-3 h-3 text-green-600" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                            {e.nome}
                          </span>
                          <span className={cn("font-bold", e.percentual >= 60 ? "text-green-700" : "text-red-600")}>
                            {e.acertos}/{e.total} · {e.percentual}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className={cn("h-1.5 rounded-full", e.percentual >= 60 ? "bg-green-500" : "bg-red-400")} style={{ width: `${e.percentual}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de tentativas */}
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground text-xs uppercase border-b border-border">
                      <th className="py-3 px-4">Candidato</th>
                      <th className="py-3 px-4">Certificação</th>
                      <th className="py-3 px-4">Tentativa</th>
                      <th className="py-3 px-4">Acertos</th>
                      <th className="py-3 px-4">%</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.tentativas.map((t) => {
                      const status = statusDaTentativa(t);
                      const st = STATUS_LABEL[status];
                      return (
                        <tr key={t.id} className="border-b border-border/50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-foreground">{t.candidato_nome}</p>
                            <p className="text-xs text-muted-foreground">{t.candidato_email}</p>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{t.cert_nome}</td>
                          <td className="py-3 px-4 text-muted-foreground">{t.numero_tentativa}ª</td>
                          <td className="py-3 px-4 text-muted-foreground">{t.acertos}/{t.total_questoes}</td>
                          <td className="py-3 px-4 font-semibold">{t.percentual != null ? `${parseFloat(t.percentual).toFixed(0)}%` : "—"}</td>
                          <td className="py-3 px-4">
                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", st.className)}>{st.label}</span>
                            {status === "anulada" && t.anulada_motivo && (
                              <p className="text-xs text-muted-foreground mt-1">{t.anulada_motivo}</p>
                            )}
                            {t.violacoes_count > 0 && status !== "anulada" && (
                              <p className="text-xs text-amber-600 mt-1">{t.violacoes_count} violação(ões)</p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {t.finalizada_em ? new Date(t.finalizada_em).toLocaleDateString("pt-BR") : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
