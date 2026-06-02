import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function Level2Checkout() {
  const [paymentStep, setPaymentStep] = useState<"review" | "payment" | "confirmation">("review");
  const [cardData, setCardData] = useState({
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
  });

  const handlePaymentClick = () => {
    setPaymentStep("payment");
  };

  const handleProcessPayment = () => {
    // Validate card data
    if (!cardData.cardName || !cardData.cardNumber || !cardData.cardExpiry || !cardData.cardCVC) {
      // toast.error("Por favor, preencha todos os dados do cartão");
      return;
    }

    if (cardData.cardNumber.length < 13) {
      // toast.error("Número do cartão inválido");
      return;
    }

    // Simulate payment processing
    toast.loading("Processando pagamento...");
    setTimeout(() => {
      toast.success("Pagamento realizado com sucesso!");
      setPaymentStep("confirmation");
      
      // Redirect to interview scheduling after 3 seconds
      setTimeout(() => {
        window.location.href = "/step-7?type=cca&level=2";
      }, 3000);
    }, 2000);
  };

  const handleCardNumberChange = (value: string) => {
    // Remove non-digits
    const cleaned = value.replace(/\D/g, "");
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardData({ ...cardData, cardNumber: formatted });
  };

  const handleExpiryChange = (value: string) => {
    // Remove non-digits
    const cleaned = value.replace(/\D/g, "");
    // Add slash after 2 digits
    const formatted = cleaned.length >= 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` : cleaned;
    setCardData({ ...cardData, cardExpiry: formatted });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800 font-semibold mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Pagamento - Nível 2</h1>
          <p className="text-gray-600">Complete o pagamento para prosseguir com sua certificação</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex gap-2">
          {["review", "payment", "confirmation"].map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  paymentStep === step
                    ? "bg-blue-600 text-white"
                    : ["review", "payment"].includes(step) && paymentStep === "confirmation"
                      ? "bg-green-600 text-white"
                      : "bg-gray-300 text-gray-700"
                }`}
              >
                {idx + 1}
              </div>
              {idx < 2 && <div className="w-8 h-1 bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* Review Step */}
        {paymentStep === "review" && (
          <div className="space-y-6 mb-8">
            {/* Order Summary */}
            <Card className="p-8 border-2 border-gray-300">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">Resumo do Pedido</h2>

              <div className="space-y-4 mb-6 pb-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Análise Documental + Entrevista Técnica</p>
                    <p className="text-sm text-gray-600 mt-1">Nível 2 - Profissional Experiente</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">R$ 1.999</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold">R$ 1.999</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Taxas</span>
                  <span className="font-semibold">R$ 0</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-green-600">R$ 1.999</span>
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-blue-50 p-4 rounded mb-6">
                <p className="font-bold text-blue-900 mb-3">Incluso neste pacote:</p>
                <ul className="space-y-2 text-sm text-blue-900">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Análise completa de documentação
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Entrevista técnica com comissão especializada
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Emissão de certificado (se aprovado)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Suporte durante todo o processo
                  </li>
                </ul>
              </div>

              {/* Important Warning */}
              <div className="bg-red-50 border-2 border-red-300 p-4 rounded mb-6">
                <p className="text-sm font-bold text-red-900 mb-2">⚠️ Lembrete Importante</p>
                <p className="text-sm text-red-800">
                  Este pagamento é <strong>NÃO-REEMBOLSÁVEL</strong> em qualquer hipótese. Você terá apenas UMA oportunidade para fazer a entrevista técnica.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="flex-1 py-3 font-bold text-lg"
                >
                  ← Voltar
                </Button>
                <Button
                  onClick={handlePaymentClick}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 font-bold text-lg"
                >
                  Prosseguir com Pagamento →
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Payment Step */}
        {paymentStep === "payment" && (
          <Card className="p-8 border-2 border-gray-300 mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Dados do Cartão de Crédito
            </h2>

            <div className="space-y-6">
              {/* Card Preview */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg mb-6">
                <p className="text-sm opacity-75 mb-8">Número do Cartão</p>
                <p className="text-2xl tracking-widest font-mono mb-8">{cardData.cardNumber || "•••• •••• •••• ••••"}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-75 mb-1">Titular</p>
                    <p className="font-semibold">{cardData.cardName || "NOME DO TITULAR"}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-75 mb-1">Válido até</p>
                    <p className="font-semibold">{cardData.cardExpiry || "MM/AA"}</p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <Label className="text-gray-700 font-semibold">Nome do Titular *</Label>
                <Input
                  placeholder="JOÃO SILVA SANTOS"
                  value={cardData.cardName}
                  onChange={(e) => setCardData({ ...cardData, cardName: e.target.value.toUpperCase() })}
                  className="mt-2 text-lg"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">Número do Cartão *</Label>
                <Input
                  placeholder="0000 0000 0000 0000"
                  value={cardData.cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  className="mt-2 text-lg tracking-widest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-semibold">Validade *</Label>
                  <Input
                    placeholder="MM/AA"
                    value={cardData.cardExpiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    className="mt-2 text-lg"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">CVV *</Label>
                  <Input
                    placeholder="000"
                    value={cardData.cardCVC}
                    onChange={(e) => setCardData({ ...cardData, cardCVC: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                    className="mt-2 text-lg"
                    type="password"
                  />
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-green-900">Pagamento Seguro</p>
                  <p className="text-sm text-green-800 mt-1">Seus dados são criptografados e processados com segurança.</p>
                </div>
              </div>

              {/* Order Summary */}
              <Card className="p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total a Pagar:</span>
                  <span className="text-2xl font-bold text-green-600">R$ 1.999</span>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setPaymentStep("review")}
                  variant="outline"
                  className="flex-1 py-3 font-bold text-lg"
                >
                  ← Voltar
                </Button>
                <Button
                  onClick={handleProcessPayment}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 font-bold text-lg"
                >
                  ✓ Confirmar Pagamento
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Confirmation Step */}
        {paymentStep === "confirmation" && (
          <Card className="p-12 border-4 border-green-600 bg-green-50 text-center mb-8">
            <div className="mb-6 flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-green-900 mb-3">✓ Pagamento Realizado com Sucesso!</h2>
            <p className="text-lg text-green-800 mb-6">
              Seu pagamento foi processado. Você será redirecionado para agendar sua entrevista técnica.
            </p>
            <div className="bg-white p-4 rounded mb-6 text-left">
              <p className="text-sm text-gray-600 mb-2">Próximos passos:</p>
              <ol className="space-y-2 text-sm text-gray-700">
                <li>1. Agendamento da entrevista técnica</li>
                <li>2. Realização da entrevista com especialistas</li>
                <li>3. Análise e decisão final</li>
                <li>4. Emissão do certificado (se aprovado)</li>
              </ol>
            </div>
            <p className="text-xs text-gray-600">Redirecionando em 3 segundos...</p>
          </Card>
        )}
      </div>
    </div>
  );
}
