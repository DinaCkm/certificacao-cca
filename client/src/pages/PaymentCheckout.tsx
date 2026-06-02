import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useSearch } from "wouter";
import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";

export function PaymentCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const search = useSearch();
  const params = new URLSearchParams(search);
  const packageName = params.get("package") || "Pacote";
  const packagePrice = parseFloat(params.get("price") || "799");
  const level = params.get("level") || "1";

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simular processamento de pagamento
    setTimeout(() => {
      setIsProcessing(false);
      // Redirecionar para o próximo step
      if (level === "2") {
        window.location.href = "/step-6?level=2";
      } else {
        window.location.href = "/step-5?level=1";
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/step-4">
            <a className="text-blue-900 hover:underline mb-4 inline-block">← Voltar</a>
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">💳 Finalizar Compra</h1>
            <p className="text-lg text-gray-600">
              Complete o pagamento para acessar seu pacote de certificação
            </p>
          </div>
        </div>

        {/* Package Summary */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-300 mb-8">
          <div className="flex items-start gap-4">
            <Check className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">✓ Pacote Selecionado</h3>
              <p className="text-blue-800">
                Você selecionou o pacote <strong>{packageName}</strong>
              </p>
            </div>
          </div>
        </Card>

        {/* Pricing Card */}
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Resumo do Pagamento</h2>

          <div className="space-y-4 mb-8">
            {/* Package Name */}
            <div className="flex justify-between items-center pb-4 border-b border-blue-200">
              <span className="text-gray-700">Pacote</span>
              <span className="text-lg font-semibold text-gray-700">{packageName}</span>
            </div>

            {/* Final Price */}
            <div className="flex justify-between items-center pt-4">
              <span className="text-xl font-bold text-blue-900">Total a Pagar</span>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">R$ {packagePrice.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <h3 className="font-bold text-blue-900 mb-4">Formas de Pagamento</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border-2 border-blue-300 rounded bg-white cursor-pointer hover:bg-blue-50">
                <div className="w-5 h-5 rounded-full border-2 border-blue-900 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-900"></div>
                </div>
                <span className="font-semibold text-gray-800">💳 Cartão de Crédito</span>
              </div>
              <div className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded bg-white cursor-pointer hover:bg-gray-50">
                <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
                <span className="text-gray-800">📱 PIX</span>
              </div>
              <div className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded bg-white cursor-pointer hover:bg-gray-50">
                <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
                <span className="text-gray-800">📋 Boleto Bancário</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Processando Pagamento...
              </>
            ) : (
              `Confirmar Pagamento - R$ ${packagePrice.toFixed(2)}`
            )}
          </Button>
        </Card>

        {/* Info Box */}
        <Card className="p-6 bg-blue-50 border-blue-300">
          <h3 className="font-bold text-blue-900 mb-3">ℹ️ Informações Importantes:</h3>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>✓ Pagamento seguro com criptografia SSL</li>
            <li>✓ Acesso imediato após confirmação do pagamento</li>
            <li>✓ Suporte ao cliente disponível 24/7</li>
            <li>✓ Garantia de satisfação ou devolução em 7 dias</li>
            <li>✓ Você receberá um comprovante por email</li>
          </ul>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link href="/step-4">
            <a>
              <Button variant="outline" className="px-8">
                ← Voltar
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
