import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function CertificationDirectPreparationCheck() {
  const [step, setStep] = useState(1);

  const handleYesPreparation = () => {
    // Usuário fez os cursos preparatórios - vai direto para pagamento
    window.location.href = "/payment-checkout?package=CertificacaoDireta";
  };

  const handleNoPreparation = () => {
    // Usuário não fez os cursos - vai para pergunta de confirmação
    setStep(2);
  };

  const handleConfirmDirectCertification = () => {
    // Usuário confirma que quer ir direto - vai para pagamento
    window.location.href = "/payment-checkout?package=CertificacaoDireta";
  };

  const handleCancelDirectCertification = () => {
    // Usuário cancela - volta para menu inicial
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <BackToHomeButton />
          </div>
          <h1 className="text-4xl font-bold text-blue-900">Certificação Direta</h1>
          <p className="text-gray-600 mt-2">Verificação de Preparação</p>
        </div>

        {/* Step 1: Pergunta sobre cursos preparatórios */}
        {step === 1 && (
          <Card className="p-8 mb-6 bg-white border-2 border-blue-900">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-4">
                  Você realizou os cursos preparatórios ANEFAC?
                </h2>
                <p className="text-gray-700 mb-6">
                  Os cursos preparatórios ANEFAC ajudam a garantir melhor desempenho na certificação. 
                  Você completou os cursos preparatórios oferecidos pela ANEFAC?
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleYesPreparation}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                >
                  ✓ Sim, realizei os cursos preparatórios
                </Button>
                <Button
                  onClick={handleNoPreparation}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold"
                >
                  ✗ Não, não realizei os cursos
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-900">
                <p className="text-sm text-blue-900">
                  <strong>Dica:</strong> Se você não realizou os cursos preparatórios, ainda pode fazer a certificação, 
                  mas recomendamos que você considere fazer os cursos primeiro para aumentar suas chances de sucesso.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Confirmação de certificação direta */}
        {step === 2 && (
          <Card className="p-8 mb-6 bg-white border-2 border-orange-600">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-orange-600 mb-4">
                  ⚠️ Confirmação Importante
                </h2>
                <p className="text-gray-700 mb-6">
                  Você está prestes a fazer a certificação sem ter realizado os cursos preparatórios ANEFAC. 
                  Tem certeza de que deseja prosseguir diretamente para a certificação?
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-600 mb-6">
                <p className="text-sm text-orange-900">
                  <strong>Atenção:</strong> Fazer a certificação sem preparação adequada pode resultar em 
                  reprovação. Você terá apenas uma oportunidade para fazer a prova.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleConfirmDirectCertification}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                >
                  ✓ Sim, tenho certeza. Prosseguir para a certificação
                </Button>
                <Button
                  onClick={handleCancelDirectCertification}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-6 text-lg font-semibold"
                >
                  ✗ Não, voltar ao menu inicial
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-900">
                <p className="text-sm text-blue-900">
                  <strong>Sugestão:</strong> Considere fazer os cursos preparatórios ANEFAC para melhorar 
                  suas chances de sucesso na certificação.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
