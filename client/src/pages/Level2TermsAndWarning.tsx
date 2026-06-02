import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Level2TermsAndWarning() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleContinue = () => {
    if (!termsAccepted || !warningAccepted) {
      alert("Por favor, aceite todos os termos e avisos antes de continuar");
      return;
    }
    window.location.href = "/level2-checkout";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              ← Voltar
            </Button>
            <BackToHomeButton />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Termos e Avisos Importantes</h1>
          <p className="text-gray-600">Leia atentamente antes de prosseguir com o pagamento</p>
        </div>

        {/* Main Warning */}
        <Card className="p-8 border-4 border-red-600 bg-red-50 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-red-900 mb-4">⚠️ AVISO IMPORTANTE - NÃO REEMBOLSÁVEL</h2>
              <div className="space-y-4 text-red-900">
                <p className="font-bold text-lg">
                  O valor pago (R$ 1.999) NÃO será devolvido em nenhuma hipótese, mesmo que:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-1">•</span>
                    <span>Você não atenda aos requisitos após análise da documentação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-1">•</span>
                    <span>Você não seja aprovado na entrevista técnica</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-1">•</span>
                    <span>Você não compareça à entrevista agendada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-1">•</span>
                    <span>Informações fornecidas forem consideradas falsas ou enganosas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-1">•</span>
                    <span>Você desista do processo em qualquer etapa</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Process Information */}
        <Card className="p-6 border-2 border-blue-300 bg-blue-50 mb-8">
          <h3 className="font-bold text-lg text-blue-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Informações sobre o Processo
          </h3>
          <div className="space-y-3 text-blue-900">
            <p>
              <strong>Análise de Documentação:</strong> Nossa comissão analisará seus documentos, experiência profissional e qualificações. Este processo pode levar de 5 a 7 dias úteis.
            </p>
            <p>
              <strong>Entrevista Técnica:</strong> Se aprovado na análise documental, você será convocado para uma entrevista técnica com especialistas da área. Você terá apenas UMA oportunidade para realizar esta entrevista.
            </p>
            <p>
              <strong>Decisão Final:</strong> Após a entrevista, você receberá a decisão final em até 2-3 dias úteis.
            </p>
            <p>
              <strong>Certificado:</strong> Se aprovado, seu certificado será emitido e enviado por email.
            </p>
          </div>
        </Card>

        {/* Important Notes */}
        <Card className="p-6 border-2 border-yellow-300 bg-yellow-50 mb-8">
          <h3 className="font-bold text-lg text-yellow-900 mb-4">📋 Informações Importantes</h3>
          <ul className="space-y-3 text-yellow-900">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">✓</span>
              <span>Você terá apenas <strong>UMA oportunidade</strong> para fazer a entrevista técnica</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">✓</span>
              <span>A entrevista não pode ser pausada ou interrompida</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">✓</span>
              <span>Todas as informações fornecidas devem ser verdadeiras e verificáveis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">✓</span>
              <span>Documentos falsificados resultarão em desqualificação imediata</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">✓</span>
              <span>Você pode tentar novamente após 6 meses se não for aprovado</span>
            </li>
          </ul>
        </Card>

        {/* Terms of Service */}
        <Card className="p-6 border-2 border-gray-300 mb-8">
          <h3 className="font-bold text-lg text-gray-900 mb-4">📄 Termos de Serviço</h3>
          <div className="bg-gray-50 p-4 rounded max-h-48 overflow-y-auto text-sm text-gray-700 space-y-3 mb-4">
            <p>
              1. Ao prosseguir com o pagamento, você confirma que todas as informações fornecidas são verdadeiras e precisas.
            </p>
            <p>
              2. Você autoriza a ANEFAC a verificar suas qualificações, experiência profissional e documentos fornecidos.
            </p>
            <p>
              3. Você compreende que o processo de certificação é rigoroso e que a aprovação não é garantida.
            </p>
            <p>
              4. Você aceita que o pagamento é não-reembolsável em qualquer circunstância.
            </p>
            <p>
              5. Você concorda em participar de todas as etapas do processo conforme agendado.
            </p>
            <p>
              6. Você autoriza o uso de suas informações para fins de análise e certificação.
            </p>
            <p>
              7. Você compreende que informações falsas podem resultar em ações legais.
            </p>
          </div>
        </Card>

        {/* Acceptance Checkboxes */}
        <div className="space-y-4 mb-8">
          <Card className="p-4 border-2 border-orange-300 bg-orange-50">
            <div className="flex items-start gap-3">
              <Checkbox
                id="warning"
                checked={warningAccepted}
                onCheckedChange={(checked) => setWarningAccepted(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="warning" className="text-gray-700 cursor-pointer">
                <span className="font-bold">Entendo e aceito o aviso de não-reembolso.</span> Confirmo que li e compreendi que o valor pago não será devolvido em nenhuma hipótese, independentemente do resultado da análise ou entrevista.
              </Label>
            </div>
          </Card>

          <Card className="p-4 border-2 border-blue-300 bg-blue-50">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-gray-700 cursor-pointer">
                <span className="font-bold">Aceito os Termos de Serviço.</span> Confirmo que li, compreendi e aceito todos os termos e condições acima. Autorizo a ANEFAC a processar minha candidatura conforme descrito.
              </Label>
            </div>
          </Card>
        </div>

        {/* Payment Info */}
        <Card className="p-6 border-2 border-green-600 bg-green-50 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-green-900">Valor do Investimento</h3>
              <p className="text-sm text-green-800 mt-1">Análise Documental + Entrevista Técnica</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-600">R$ 1.999</p>
              <p className="text-sm text-green-800 mt-1">Não-reembolsável</p>
            </div>
          </div>
        </Card>

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
            onClick={handleContinue}
            disabled={!termsAccepted || !warningAccepted}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 font-bold text-lg"
          >
            Próximo: Pagamento →
          </Button>
        </div>
      </div>
    </div>
  );
}
