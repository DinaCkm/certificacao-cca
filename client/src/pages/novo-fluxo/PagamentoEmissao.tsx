import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCertification } from "@/contexts/CertificationContext";
import { Award, CreditCard, Lock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type MetodoPagamento = "cartao" | "pix";

export function PagamentoEmissao() {
  const { processo, registrarPagamento2, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  const [metodo, setMetodo] = useState<MetodoPagamento>("cartao");
  const [processando, setProcessando] = useState(false);
  const [form, setForm] = useState({ numeroCartao: "", nomeCartao: "", validade: "", cvv: "" });

  useEffect(() => {
    if (!processo.certificacaoId || processo.aprovadoEntrevista !== true) navigate("/novo-fluxo");
  }, [processo, navigate]);

  const formatCartao = (v: string) => v.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").slice(0, 19);
  const formatValidade = (v: string) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);

  const handlePagar = async () => {
    if (metodo === "cartao" && (!form.numeroCartao || !form.nomeCartao || !form.validade || !form.cvv)) {
      toast({ title: "Preencha todos os dados do cartão", variant: "destructive" });
      return;
    }
    setProcessando(true);
    await new Promise((r) => setTimeout(r, 2000));
    setProcessando(false);
    registrarPagamento2();
    toast({ title: "Pagamento confirmado!", description: "Seu certificado está sendo emitido." });
    navigate("/novo-fluxo/emissao-certificado");
  };

  if (!certAtual) return null;

  return (
    <FluxoLayout
      currentStep={7}
      title="Pagamento — Taxa de Emissão do Certificado"
      subtitle="Este é o pagamento final. Após a confirmação, seu certificado será emitido e enviado por e-mail."
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Congratulations Banner */}
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
                <div>
                  <p className="font-bold text-green-800">Parabéns, {processo.candidatoNome || "candidato"}!</p>
                  <p className="text-sm text-green-700">Você foi aprovado em todas as etapas. Realize o pagamento para receber seu certificado.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Method Selection */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-foreground mb-4">Forma de pagamento</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "cartao" as const, label: "Cartão de Crédito", icon: CreditCard },
                  { id: "pix" as const, label: "PIX", icon: () => <span className="text-lg">⚡</span> },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setMetodo(id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium",
                      metodo === id ? "border-blue-900 bg-blue-50 text-blue-900" : "border-border text-muted-foreground hover:border-blue-300"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {metodo === "cartao" && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard className="w-4 h-4 text-blue-700" />
                  <h2 className="font-semibold text-foreground">Dados do cartão</h2>
                  <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" /> Pagamento seguro
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Número do cartão</Label>
                    <Input value={form.numeroCartao} onChange={(e) => setForm((p) => ({ ...p, numeroCartao: formatCartao(e.target.value) }))} placeholder="0000 0000 0000 0000" maxLength={19} />
                  </div>
                  <div>
                    <Label>Nome no cartão</Label>
                    <Input value={form.nomeCartao} onChange={(e) => setForm((p) => ({ ...p, nomeCartao: e.target.value.toUpperCase() }))} placeholder="NOME COMO NO CARTÃO" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Validade</Label>
                      <Input value={form.validade} onChange={(e) => setForm((p) => ({ ...p, validade: formatValidade(e.target.value) }))} placeholder="MM/AA" maxLength={5} />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Input value={form.cvv} onChange={(e) => setForm((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} placeholder="000" maxLength={4} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {metodo === "pix" && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-36 h-36 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-6xl">⚡</span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-2">Escaneie o QR Code com seu banco</p>
                <div className="bg-gray-50 border rounded-lg p-3 text-xs font-mono text-muted-foreground break-all mb-4">
                  00020126580014br.gov.bcb.pix0136anefac-emissao@anefac.com.br5204000053039865802BR5913ANEFAC62070503***6304EFGH
                </div>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Código PIX copiado!" })}>
                  Copiar código PIX
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card className="border-green-200">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-4 text-sm">Resumo do pagamento</h3>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <span className="text-2xl">{certAtual.numero}</span>
                <div>
                  <p className="font-bold text-foreground text-sm">{certAtual.nome}</p>
                  <p className="text-xs text-muted-foreground">Taxa de Emissão do Certificado</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de emissão</span>
                  <span className="font-medium">R$ {certAtual.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Taxa de análise (paga anteriormente)</span>
                  <span className="line-through">R$ {certAtual.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-3">
                <span>Total agora</span>
                <span className="text-green-700">R$ {certAtual.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">Após o pagamento</p>
                  <p>Seu certificado será emitido e enviado para <strong>{processo.candidatoEmail || "seu e-mail"}</strong> em até 5 dias úteis.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-green-700 hover:bg-green-800" size="lg" onClick={handlePagar} disabled={processando}>
            {processando ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Pagar R$ {certAtual.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </>
            )}
          </Button>
        </div>
      </div>
    </FluxoLayout>
  );
}
