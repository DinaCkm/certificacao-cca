import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function DocumentalAnalysisCheckout() {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      // toast.error("Por favor, preencha todos os dados do cartão");
      return;
    }

    setIsProcessing(true);
    
    // Simular processamento de pagamento
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Pagamento realizado com sucesso!");
      
      // Redirecionar para upload de documentos
      window.location.href = "/step-6";
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800 font-semibold mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Análise Documental + Entrevista</h1>
          <p className="text-gray-600">Finalize sua compra para prosseguir com o processo de certificação</p>
        </div>

        {/* Order Summary */}
        <Card className="p-6 mb-8 border-2 border-blue-200 bg-blue-50">
          <h2 className="text-xl font-bold text-blue-900 mb-4">📋 Resumo da Compra</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Análise Documental</span>
              <span className="font-bold text-gray-900">R$ 1.000,00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Entrevista Técnica</span>
              <span className="font-bold text-gray-900">R$ 500,00</span>
            </div>
            <div className="border-t border-blue-300 pt-3 flex justify-between items-center">
              <span className="font-bold text-blue-900">Total</span>
              <span className="text-2xl font-bold text-green-600">R$ 1.500,00</span>
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">✓ O que está incluído:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Análise completa de documentação</li>
              <li>✓ Entrevista técnica com especialista</li>
              <li>✓ Relatório de avaliação detalhado</li>
              <li>✓ Suporte durante o processo</li>
            </ul>
          </div>
        </Card>

        {/* Payment Form */}
        <Card className="p-6 border-2 border-gray-300">
          <h2 className="text-xl font-bold text-blue-900 mb-6">💳 Dados do Cartão de Crédito</h2>

          <div className="space-y-4">
            {/* Card Holder */}
            <div>
              <Label className="text-gray-700 font-semibold">Nome do Titular</Label>
              <Input
                placeholder="Nome completo"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Card Number */}
            <div>
              <Label className="text-gray-700 font-semibold">Número do Cartão</Label>
              <Input
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                className="mt-2"
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 font-semibold">Validade</Label>
                <Input
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-gray-700 font-semibold">CVV</Label>
                <Input
                  placeholder="000"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-yellow-900 font-semibold text-sm">
              ⚠️ Importante: Após a compra, você terá 15 dias após enviar todos os documentos para agendar a entrevista técnica.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="flex-1 font-bold"
            >
              ← Cancelar
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
            >
              {isProcessing ? "Processando..." : "✓ Confirmar Pagamento"}
            </Button>
          </div>
        </Card>

        {/* Security Badge */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          🔒 Sua transação é segura e criptografada
        </div>
      </div>
    </div>
  );
}
