import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function ExamSecurityCheck() {
  const [cameraOk, setCameraOk] = useState(false);
  const [microphoneOk, setMicrophoneOk] = useState(false);
  const [lightingOk, setLightingOk] = useState(false);
  const [agreeRules, setAgreeRules] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  const handleCheckAll = () => {
    const newState = !allChecked;
    setCameraOk(newState);
    setMicrophoneOk(newState);
    setLightingOk(newState);
    setAgreeRules(newState);
    setAllChecked(newState);
  };

  const isReadyToStart = cameraOk && microphoneOk && lightingOk && agreeRules;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Área de Segurança da Prova</h1>
          <p className="text-gray-600">Verifique os requisitos antes de iniciar a avaliação</p>
        </div>

        {/* Instruções Gerais */}
        <Card className="p-6 mb-6 bg-blue-50 border-2 border-blue-300">
          <h2 className="font-bold text-lg text-blue-900 mb-4">📋 Instruções Importantes</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="text-blue-900 font-bold">⏱️</span>
              <span>
                <strong>Tempo de Prova:</strong> 120 minutos. O cronômetro iniciará automaticamente.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-900 font-bold">📹</span>
              <span>
                <strong>Monitoramento:</strong> Sua câmera e áudio estarão ativos durante toda a prova.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-900 font-bold">🚫</span>
              <span>
                <strong>Restrições:</strong> Não é permitido sair da sala, usar celular ou consultar materiais não autorizados.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-900 font-bold">👁️</span>
              <span>
                <strong>Posicionamento:</strong> Mantenha seu rosto visível e centralizado na câmera o tempo todo.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-900 font-bold">🔊</span>
              <span>
                <strong>Ambiente:</strong> Escolha um local silencioso e bem iluminado.
              </span>
            </li>
          </ul>
        </Card>

        {/* Verificação de Requisitos Técnicos */}
        <Card className="p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">🔧 Verificação de Requisitos Técnicos</h2>

          <div className="space-y-4 mb-6">
            {/* Câmera */}
            <div className="p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100">
                    📹
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Teste de Câmera</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Certifique-se de que sua câmera está funcionando corretamente. Você deve estar visível e bem posicionado.
                  </p>
                  <Button
                    variant="outline"
                    className="mb-3"
                    onClick={() => alert("Câmera testada com sucesso! ✓")}
                  >
                    Testar Câmera
                  </Button>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="camera"
                      checked={cameraOk}
                      onCheckedChange={(checked) => setCameraOk(checked as boolean)}
                    />
                    <label htmlFor="camera" className="text-sm font-medium cursor-pointer">
                      Câmera funcionando corretamente
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Microfone */}
            <div className="p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100">
                    🎤
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Teste de Microfone</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Verifique se seu microfone está captando áudio corretamente.
                  </p>
                  <Button
                    variant="outline"
                    className="mb-3"
                    onClick={() => alert("Microfone testado com sucesso! ✓")}
                  >
                    Testar Microfone
                  </Button>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="microphone"
                      checked={microphoneOk}
                      onCheckedChange={(checked) => setMicrophoneOk(checked as boolean)}
                    />
                    <label htmlFor="microphone" className="text-sm font-medium cursor-pointer">
                      Microfone funcionando corretamente
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Iluminação */}
            <div className="p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100">
                    💡
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Iluminação e Posicionamento</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Verifique se o ambiente está bem iluminado e se você está centralizado na câmera.
                  </p>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="lighting"
                      checked={lightingOk}
                      onCheckedChange={(checked) => setLightingOk(checked as boolean)}
                    />
                    <label htmlFor="lighting" className="text-sm font-medium cursor-pointer">
                      Iluminação e posicionamento adequados
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acesso à Prova */}
          <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg mb-6">
            <h3 className="font-bold mb-2">🔗 Link de Acesso à Prova</h3>
            <p className="text-sm text-gray-600 mb-3">
              Após confirmar todos os requisitos, clique no botão abaixo para acessar a plataforma de prova:
            </p>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
              disabled={!isReadyToStart}
              onClick={() => alert("Abrindo plataforma de prova... 🎯")}
            >
              🚀 Acessar Plataforma de Prova
            </Button>
          </div>
        </Card>

        {/* Termos e Condições */}
        <Card className="p-6 mb-6 bg-red-50 border-2 border-red-300">
          <h2 className="font-bold text-lg text-red-900 mb-4">⚠️ Termos de Segurança</h2>
          <div className="space-y-3 text-sm mb-4">
            <p>
              <strong>Não é permitido:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Sair da sala ou deixar a câmera sem visualização</li>
              <li>Usar celular, tablet ou outros dispositivos</li>
              <li>Consultar livros, anotações ou materiais não autorizados</li>
              <li>Comunicar-se com outras pessoas durante a prova</li>
              <li>Fazer capturas de tela ou gravar a prova</li>
              <li>Usar extensões de navegador ou software de terceiros</li>
            </ul>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded border-2 border-red-200">
            <Checkbox
              id="agree"
              checked={agreeRules}
              onCheckedChange={(checked) => setAgreeRules(checked as boolean)}
            />
            <label htmlFor="agree" className="text-sm font-medium cursor-pointer">
              Confirmo que li e concordo com os termos de segurança. Entendo que qualquer violação pode resultar na desqualificação.
            </label>
          </div>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-4">
          <Link href="/step-4">
            <a>
              <Button variant="outline" className="w-full">
                ← Voltar
              </Button>
            </a>
          </Link>
          <Button
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold"
            disabled={!isReadyToStart}
            onClick={() => alert("Iniciando prova... ⏱️")}
          >
            ✓ Iniciar Prova
          </Button>
        </div>
      </div>
    </div>
  );
}
