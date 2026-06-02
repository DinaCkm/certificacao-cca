import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function DirectCertificationWaitingInfo() {
  const [daysRemaining, setDaysRemaining] = useState(15);
  const [hoursRemaining, setHoursRemaining] = useState(0);

  useEffect(() => {
    // Simular contagem regressiva
    const interval = setInterval(() => {
      setHoursRemaining(prev => {
        if (prev === 0) {
          setDaysRemaining(d => Math.max(0, d - 1));
          return 23;
        }
        return prev - 1;
      });
    }, 3600000); // Atualiza a cada hora

    return () => clearInterval(interval);
  }, []);

  const handleContinue = () => {
    window.location.href = "/direct-interview-scheduling";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-4xl font-bold text-blue-900 mb-2">📋 Análise em Andamento</h1>
          <p className="text-gray-600">Seus documentos foram recebidos com sucesso</p>
        </div>

        {/* Success Message */}
        <Card className="p-8 bg-green-50 border-2 border-green-300 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Upload Realizado com Sucesso!</h2>
            <p className="text-green-800">Seus documentos foram enviados para análise</p>
          </div>
        </Card>

        {/* Waiting Information */}
        <Card className="p-8 border-2 border-blue-300 mb-8">
          <div className="space-y-6">
            {/* Timeline */}
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">📅 Próximas Etapas</h3>
              <div className="space-y-4">
                {/* Etapa 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">✓</div>
                    <div className="w-1 h-12 bg-gray-300 mt-2"></div>
                  </div>
                  <div className="pb-4">
                    <h4 className="font-bold text-green-900">Upload de Documentos</h4>
                    <p className="text-sm text-gray-600">Concluído em {new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {/* Etapa 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold">⏳</div>
                    <div className="w-1 h-12 bg-gray-300 mt-2"></div>
                  </div>
                  <div className="pb-4">
                    <h4 className="font-bold text-yellow-700">Análise de Documentos</h4>
                    <p className="text-sm text-gray-600">Em andamento - Prazo: 15 dias úteis</p>
                  </div>
                </div>

                {/* Etapa 3 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold">3</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700">Agendamento de Entrevista</h4>
                    <p className="text-sm text-gray-600">Disponível após análise</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">⏱️ Tempo Estimado Restante</p>
              <div className="text-4xl font-bold text-blue-900">
                {daysRemaining}d {hoursRemaining}h
              </div>
              <p className="text-xs text-gray-600 mt-2">Contagem aproximada - prazo máximo de 15 dias úteis</p>
            </div>

            {/* Information Box */}
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
              <h4 className="font-bold text-blue-900 mb-3">ℹ️ O que Acontece Agora?</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Seus documentos serão analisados por nossos especialistas</li>
                <li>✓ Você receberá um email com atualizações sobre o processo</li>
                <li>✓ Após a análise, você poderá agendar sua entrevista técnica</li>
                <li>✓ A entrevista será gravada para fins de certificação</li>
              </ul>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
              <h4 className="font-bold text-yellow-900 mb-3">⚠️ Informações Importantes</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Verifique seu email regularmente para atualizações</li>
                <li>• Certifique-se de que seu email está correto em seu perfil</li>
                <li>• Você será notificado quando puder agendar a entrevista</li>
                <li>• A entrevista deve ser realizada em ambiente adequado com câmera e áudio funcionando</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6 bg-gray-50 border-2 border-gray-300 mb-8">
          <h3 className="font-bold text-gray-900 mb-3">📞 Suporte</h3>
          <p className="text-sm text-gray-700 mb-2">Dúvidas sobre o processo?</p>
          <p className="text-sm text-gray-700">Entre em contato conosco: <strong>suporte@anefac.com.br</strong></p>
        </Card>

        {/* Action Button */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.history.back()}
          >
            ← Voltar
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg"
            onClick={handleContinue}
          >
            Agendar Entrevista →
          </Button>
        </div>
      </div>
    </div>
  );
}
