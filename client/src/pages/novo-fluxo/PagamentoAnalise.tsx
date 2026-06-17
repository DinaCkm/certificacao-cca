import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCertification } from "@/contexts/CertificationContext";
import { CreditCard, QrCode, FileText, CheckCircle, Lock, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type MetodoPagamento = "cartao" | "pix" | "boleto";

export function PagamentoAnalise() {
  const { processo, registrarPagamento1, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  const [metodo, setMetodo] = useState<MetodoPagamento>("cartao");
  const [processando, setProcessando] = useState(false);
  const [form, setForm] = useState({
    numeroCartao: "",
    nomeCartao: "",
    validade: "",
    cvv: "",
  });

  useEffect(() => {
    if (!processo.certificacaoId) navigate("/novo-fluxo");
  }, [processo.certificacaoId, navigate]);

  const formatCartao = (v: string) =>
    v.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").slice(0, 19);

  const formatValidade = (v: string) =>
    v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);

  const handlePagar = async () => {
    if (metodo === "cartao") {
      if (!form.numeroCartao || !form.nomeCartao || !form.validade || !form.cvv) {
        toast({ title: "Preencha todos os dados do cartão", variant: "destructive" });
        return;
      }
    }
    setProcessando(true);
    await new Promise((r) => setTimeout(r, 2000));
    setProcessando(false);
    registrarPagamento1();
    toast({ title: "Pagamento confirmado!", description: "Sua taxa de análise foi processada com sucesso." });
    navigate("/novo-fluxo/aguardando-validacao");
  };

  if (!certAtual) return null;

  const METODOS = [
    { id: "cartao" as const, label: "Cartão de Crédito", icon: CreditCard },
    { id: "pix" as const, label: "PIX", icon: QrCode },
    { id: "boleto" as const, label: "Boleto", icon: FileText },
  ];

  return (
    <FluxoLayout
      currentStep={4}
      title="Pagamento — Taxa de Análise Documental"
      subtitle="Este é o primeiro pagamento do processo. Ele cobre a análise dos seus documentos, a prova (se aplicável) e a entrevista técnica."
      backHref="/novo-fluxo/upload-documentos"
      backLabel="← Voltar para upload"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Method Selection */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-foreground mb-4">Forma de pagamento</h2>
              <div className="grid grid-cols-3 gap-3">
                {METODOS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setMetodo(id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium",
                      metodo === id
                        ? "border-blue-900 bg-blue-50 text-blue-900"
                        : "border-border text-muted-foreground hover:border-blue-300"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Card Form */}
          {metodo === "cartao" && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard className="w-4 h-4 text-blue-700" />
                  <h2 className="font-semibold text-foreground">Dados do cartão</h2>
                  <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    Pagamento seguro
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Número do cartão</Label>
                    <Input
                      value={form.numeroCartao}
                      onChange={(e) => setForm((p) => ({ ...p, numeroCartao: formatCartao(e.target.value) }))}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                    />
                  </div>
                  <div>
                    <Label>Nome no cartão</Label>
                    <Input
                      value={form.nomeCartao}
                      onChange={(e) => setForm((p) => ({ ...p, nomeCartao: e.target.value.toUpperCase() }))}
                      placeholder="NOME COMO NO CARTÃO"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Validade</Label>
                      <Input
                        value={form.validade}
                        onChange={(e) => setForm((p) => ({ ...p, validade: formatValidade(e.target.value) }))}
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Input
                        value={form.cvv}
                        onChange={(e) => setForm((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        placeholder="000"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PIX */}
          {metodo === "pix" && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-40 h-40 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">Escaneie o QR Code com seu banco</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Ou copie o código PIX abaixo:
                </p>
                <div className="bg-gray-50 border rounded-lg p-3 text-xs font-mono text-muted-foreground break-all mb-4">
                  00020126580014br.gov.bcb.pix0136anefac-certificacao@anefac.com.br5204000053039865802BR5913ANEFAC62070503***6304ABCD
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  navigator.clipboard?.writeText("00020126580014br.gov.bcb.pix");
                  toast({ title: "Código PIX copiado!" });
                }}>
                  Copiar código PIX
                </Button>
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 text-left">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-800">
                    Após o pagamento PIX, a confirmação pode levar até 5 minutos. Você receberá um e-mail de confirmação.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Boleto */}
          {metodo === "boleto" && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Boleto Bancário</p>
                    <p className="text-xs text-muted-foreground">Vencimento em 3 dias úteis</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800">
                    O processo só avançará após a confirmação do pagamento do boleto, que pode levar até 3 dias úteis.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card className="border-blue-200">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-4 text-sm">Resumo do pagamento</h3>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <span className="text-2xl">{certAtual.numero}</span>
                <div>
                  <p className="font-bold text-foreground text-sm">{certAtual.nome}</p>
                  <p className="text-xs text-muted-foreground">Taxa de Análise Documental</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de análise</span>
                  <span className="font-medium">R$ {certAtual.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Inclui: análise documental{certAtual.caminhoDefault === "B" ? ", prova" : ""}, entrevista</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-3">
                <span>Total</span>
                <span className="text-blue-900">R$ {certAtual.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
                <div className="text-xs text-green-800">
                  <p className="font-semibold mb-1">Sobre o segundo pagamento</p>
                  <p>A Taxa de Emissão do Certificado (R$ {certAtual.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}) será cobrada <strong>somente após sua aprovação final</strong>.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>Pagamento protegido por criptografia SSL</span>
          </div>

          <Button
            className="w-full bg-blue-900 hover:bg-blue-800"
            size="lg"
            onClick={handlePagar}
            disabled={processando}
          >
            {processando ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Pagar R$ {certAtual.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </>
            )}
          </Button>
        </div>
      </div>
    </FluxoLayout>
  );
}
