import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";

export function RetakeExamCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simular processamento de pagamento
    setTimeout(() => {
      setIsProcessing(false);
      // Redirecionar para a prova
      window.location.href = "/step-4";
    }, 2000);
  };

  const originalPrice = 199;
  const discountPercent = 10;
  const discountAmount = Math.round((originalPrice * discountPercent) / 100);
  const finalPrice = originalPrice - discountAmount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/courses-platform?recovery=true">
            <a className="text-blue-900 hover:underline mb-4 inline-block">← Voltar para Cursos</a>
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">🎯 Segunda Tentativa</h1>
            <p className="text-lg text-gray-600">
              Você completou os cursos de recuperação! Agora é hora de fazer a prova novamente.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        <Card className="p-6 bg-green-50 border-2 border-green-300 mb-8">
          <div className="flex items-start gap-4">
            <Check className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-green-900 mb-2">✓ Cursos Completados com Sucesso!</h3>
              <p className="text-green-800">
                Você concluiu todos os cursos de recuperação. Parabéns pelo empenho! Agora você está pronto para fazer a segunda tentativa da prova.
              </p>
            </div>
          </div>
        </Card>

        {/* Discount Alert */}
        <Card className="p-6 bg-amber-50 border-2 border-amber-300 mb-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">🎉 Desconto Especial para Re-Prova!</h3>
              <p className="text-amber-800">
                Como você investiu nos cursos de recuperação, oferecemos um <strong>desconto de 10%</strong> na sua segunda tentativa.
              </p>
            </div>
          </div>
        </Card>

        {/* Pricing Card */}
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Resumo do Pagamento</h2>

          <div className="space-y-4 mb-8">
            {/* Original Price */}
            <div className="flex justify-between items-center pb-4 border-b border-blue-200">
              <span className="text-gray-700">Valor da Prova (Normal)</span>
              <span className="text-lg text-gray-700">R$ {originalPrice.toFixed(2)}</span>
            </div>

            {/* Discount */}
            <div className="flex justify-between items-center pb-4 border-b border-green-200 bg-green-50 p-4 rounded">
              <span className="font-semibold text-green-800">Desconto (10%)</span>
              <span className="font-bold text-green-700">-R$ {discountAmount.toFixed(2)}</span>
            </div>

            {/* Final Price */}
            <div className="flex justify-between items-center pt-4">
              <span className="text-xl font-bold text-blue-900">Total a Pagar</span>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-900">R$ {finalPrice.toFixed(2)}</p>
                <p className="text-sm text-green-700 font-semibold">Você economiza R$ {discountAmount.toFixed(2)}!</p>
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
              `Confirmar Pagamento - R$ ${finalPrice.toFixed(2)}`
            )}
          </Button>
        </Card>

        {/* Info Box */}
        <Card className="p-6 bg-blue-50 border-blue-300">
          <h3 className="font-bold text-blue-900 mb-3">ℹ️ Informações Importantes:</h3>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>✓ Você terá <strong>2 horas</strong> para completar a prova</li>
            <li>✓ A prova contém <strong>50 questões</strong> de múltipla escolha</li>
            <li>✓ Nota mínima para aprovação: <strong>70%</strong></li>
            <li>✓ Resultado disponível <strong>em até 48 horas</strong></li>
            <li>✓ Se aprovado, próximo passo: <strong>Upload Documental</strong></li>
            <li>✓ Caso não passe novamente, você terá acesso a <strong>50% de desconto</strong> em uma terceira tentativa</li>
          </ul>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link href="/courses-platform?recovery=true">
            <a>
              <Button variant="outline" className="px-8">
                ← Voltar para Cursos
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
