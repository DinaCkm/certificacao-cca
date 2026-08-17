import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Award, Download, Link2, BookOpen, CheckCircle, Mail, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

interface Certificado {
  codigo: string;
  candidato_nome: string;
  certificacao_nome: string;
  emitido_em: string;
  validade_ate: string | null;
}

export function EmissaoCertificado() {
  const { processo, getCertificacaoAtual, resetarProcesso } = useCertification();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  const [certificado, setCertificado] = useState<Certificado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [baixando, setBaixando] = useState(false);

  useEffect(() => {
    if (!processo.certificacaoId) navigate("/novo-fluxo");
  }, [processo.certificacaoId, navigate]);

  useEffect(() => {
    const processoId = localStorage.getItem("anefac_processo_id");
    if (!processoId) { setErro("Processo não identificado."); setCarregando(false); return; }

    api.processo.certificado(parseInt(processoId))
      .then((res) => setCertificado(res.certificado))
      .catch((err: any) => setErro(err.message || "Certificado ainda não disponível"))
      .finally(() => setCarregando(false));
  }, []);

  async function handleBaixarPdf() {
    const processoId = localStorage.getItem("anefac_processo_id");
    const token = localStorage.getItem("anefac_token");
    if (!processoId) return;
    setBaixando(true);
    try {
      const res = await fetch(`/api/processo/${processoId}/certificado/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao baixar certificado");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificado-${certificado?.codigo || "anefac"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Erro ao baixar o certificado", variant: "destructive" });
    } finally {
      setBaixando(false);
    }
  }

  function handleCopiarLink() {
    if (!certificado) return;
    const link = `${window.location.origin}/validar-certificado/${certificado.codigo}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link de validação copiado!", description: "Qualquer pessoa pode conferir a autenticidade neste link." });
  }

  if (!certAtual) return null;

  return (
    <FluxoLayout currentStep={7} title="Certificado">
      <div className="max-w-3xl mx-auto">
        {carregando ? (
          <div className="flex flex-col items-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Carregando seu certificado...</p>
          </div>
        ) : erro ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="font-bold text-amber-800 mb-2">Certificado ainda não disponível</h2>
              <p className="text-sm text-amber-700 mb-6">{erro}</p>
              <Button variant="outline" onClick={() => navigate("/novo-fluxo")}>Voltar ao painel</Button>
            </CardContent>
          </Card>
        ) : certificado ? (
          <>
            {/* Success Banner */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-14 h-14 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Parabéns, {certificado.candidato_nome}!
              </h2>
              <p className="text-muted-foreground">
                Seu certificado foi emitido com sucesso.
              </p>
            </div>

            {/* Certificate Preview */}
            <Card className="border-2 border-yellow-300 bg-gradient-to-br from-blue-900 to-blue-800 text-white mb-6 overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-blue-900 font-bold text-lg">A</span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg leading-none">ANEFAC</p>
                      <p className="text-xs text-blue-300 leading-none">Certificação Profissional</p>
                    </div>
                  </div>
                  <p className="text-blue-300 text-sm mb-2">Certifica que</p>
                  <p className="text-2xl font-bold mb-2">{certificado.candidato_nome}</p>
                  <p className="text-blue-300 text-sm mb-4">concluiu com êxito o processo de certificação e está habilitado(a) como</p>
                  <p className="text-xl font-bold text-yellow-300 mb-6">{certificado.certificacao_nome}</p>
                  <div className="flex justify-center gap-8 text-xs text-blue-300">
                    <div>
                      <p className="font-semibold text-white">Emitido em</p>
                      <p>{new Date(certificado.emitido_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Validade</p>
                      <p>{certificado.validade_ate ? new Date(certificado.validade_ate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "Indeterminada"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Código</p>
                      <p className="font-mono">{certificado.codigo}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions — reais, nada simulado */}
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              <Button variant="outline" className="flex items-center gap-2" onClick={handleBaixarPdf} disabled={baixando}>
                {baixando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Baixar PDF
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={handleCopiarLink}>
                <Link2 className="w-4 h-4" />
                Copiar link de validação pública
              </Button>
            </div>

            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <ShieldCheck className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-800">
                O PDF do seu certificado tem um QR Code — qualquer pessoa pode escanear e confirmar a autenticidade
                a qualquer momento, mesmo sem conta na plataforma.
              </p>
            </div>

            {/* What's next */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">O que fazer agora?</h3>
                <div className="space-y-3">
                  {[
                    { icon: CheckCircle, text: "Adicione a certificação ao seu perfil do LinkedIn", color: "text-blue-600" },
                    { icon: Award, text: "Inclua a certificação no seu currículo e portfólio profissional", color: "text-yellow-600" },
                    { icon: BookOpen, text: "Mantenha-se atualizado com os cursos de desenvolvimento contínuo da ANEFAC", color: "text-purple-600" },
                    ...(certificado.validade_ate ? [{ icon: Mail, text: `Fique atento ao prazo de renovação (${new Date(certificado.validade_ate).toLocaleDateString("pt-BR")}) para manter sua certificação ativa`, color: "text-green-600" }] : []),
                  ].map(({ icon: Icon, text, color }, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                      <p className="text-sm text-foreground">{text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Courses */}
            {certAtual.cursos && certAtual.cursos.length > 0 && (
              <Card className="bg-purple-50 border-purple-200 mb-6">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-purple-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-purple-900 mb-1">Cursos de atualização recomendados</p>
                      <p className="text-xs text-purple-700 mb-3">
                        Para manter sua certificação ativa e se desenvolver continuamente:
                      </p>
                      <div className="space-y-1">
                        {certAtual.cursos.map((curso) => (
                          <p key={curso} className="text-xs text-purple-800 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                            {curso}
                          </p>
                        ))}
                      </div>
                      <Button size="sm" className="mt-3 bg-purple-700 hover:bg-purple-800 text-xs" onClick={() => navigate("/cursos")}>
                        Ver cursos disponíveis
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <Button
                variant="ghost"
                className="text-sm text-muted-foreground"
                onClick={() => {
                  resetarProcesso();
                  navigate("/novo-fluxo");
                }}
              >
                Voltar ao painel
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </FluxoLayout>
  );
}
