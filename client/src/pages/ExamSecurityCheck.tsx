import { useState } from "react";
import { Link, useSearch } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function ExamSecurityCheck() {
  const [examStarted, setExamStarted] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [agreedToWarning, setAgreedToWarning] = useState(false);
  const search = useSearch();
  const params = new URLSearchParams(search);
  const certType = params.get("type") || "normal";
  const isDirect = certType === "direct";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Modal de Aviso - Única Oportunidade */}
        {showWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white max-w-md w-full">
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="text-5xl mb-4">⚠️</div>
                  <h2 className="text-2xl font-bold text-red-900 mb-2">Aviso Importante</h2>
                </div>
                
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6 space-y-3">
                  <div className="flex gap-3">
                    <span className="text-red-900 font-bold text-lg">⚡</span>
                    <div>
                      <p className="font-bold text-red-900">Uma Única Oportunidade</p>
                      <p className="text-sm text-red-800">Você terá apenas UMA chance para fazer esta prova.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="text-red-900 font-bold text-lg">🚫</span>
                    <div>
                      <p className="font-bold text-red-900">Sem Pausa ou Retorno</p>
                      <p className="text-sm text-red-800">Ao clicar em INICIAR, você não poderá parar, sair ou retornar depois.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="text-red-900 font-bold text-lg">💳</span>
                    <div>
                      <p className="font-bold text-red-900">Nova Compra para Tentar Novamente</p>
                      <p className="text-sm text-red-800">Para fazer uma nova avaliação, você precisará voltar à área inicial da plataforma e fazer uma nova compra.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToWarning}
                      onChange={(e) => setAgreedToWarning(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Entendo que tenho apenas uma oportunidade e que não poderei parar ou retornar depois. Estou pronto(a) para iniciar.
                    </span>
                  </label>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.history.back()}
                  >
                    ← Voltar
                  </Button>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!agreedToWarning}
                    onClick={() => setShowWarning(false)}
                  >
                    Prosseguir →
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
        {!examStarted ? (
          <>
            {/* Header */}
            <div className="mb-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  ← Voltar
                </Button>
                <BackToHomeButton />
              </div>
            </div>
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
                  <span><strong>Tempo de Prova:</strong> 120 minutos. O cronômetro iniciará automaticamente.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-900 font-bold">📹</span>
                  <span><strong>Monitoramento:</strong> Sua câmera e áudio estarão ativos durante toda a prova.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-900 font-bold">🚫</span>
                  <span><strong>Restrições:</strong> Não é permitido sair da sala, usar celular ou consultar materiais não autorizados.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-900 font-bold">👁️</span>
                  <span><strong>Posicionamento:</strong> Mantenha seu rosto visível e centralizado na câmera o tempo todo.</span>
                </li>
              </ul>
            </Card>

            {/* Verificação Rápida */}
            <Card className="p-6 mb-6">
              <h2 className="font-bold text-lg mb-4">🔧 Verificação de Requisitos</h2>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 border rounded bg-green-50">
                  <Checkbox id="camera" defaultChecked />
                  <label htmlFor="camera" className="text-sm font-medium cursor-pointer">✓ Câmera funcionando</label>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded bg-green-50">
                  <Checkbox id="mic" defaultChecked />
                  <label htmlFor="mic" className="text-sm font-medium cursor-pointer">✓ Microfone funcionando</label>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded bg-green-50">
                  <Checkbox id="lighting" defaultChecked />
                  <label htmlFor="lighting" className="text-sm font-medium cursor-pointer">✓ Iluminação adequada</label>
                </div>
              </div>

              <div className="p-4 bg-red-50 border-2 border-red-300 rounded mb-6">
                <div className="flex items-start gap-3">
                  <Checkbox id="agree" defaultChecked />
                  <label htmlFor="agree" className="text-sm font-medium cursor-pointer">
                    Confirmo que li e concordo com os termos de segurança.
                  </label>
                </div>
              </div>
            </Card>

            {/* Botões */}
            <div className="flex gap-4">
              <Link href="/step-4">
                <a>
                  <Button variant="outline" className="w-full">← Voltar</Button>
                </a>
              </Link>
              <Button
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold"
                onClick={() => setExamStarted(true)}
              >
                ▶️ Iniciar Prova
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Prova em Andamento */}
            <div className="mb-8 text-center">
              <div className="text-5xl mb-4">📝</div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">Prova em Andamento</h1>
            </div>

            {/* Simulação */}
            <Card className="p-6 mb-6 bg-blue-50 border-2 border-blue-300">
              <div className="space-y-6">
                {/* Cronômetro */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">⏱️ Tempo Restante</p>
                  <div className="text-5xl font-bold text-blue-900">120:00</div>
                </div>

                {/* Progresso */}
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-bold">Progresso</p>
                    <p className="text-sm text-gray-600">Questão 15 de 60</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{width: '25%'}}></div>
                  </div>
                </div>

                {/* Questão */}
                <div className="border-t pt-6">
                  <h3 className="font-bold mb-4">Questão 15: Controladoria e Gestão</h3>
                  <p className="text-gray-700 mb-4">Qual é o principal objetivo da controladoria?</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50">
                      <input type="radio" name="answer" id="opt1" />
                      <label htmlFor="opt1" className="flex-1 cursor-pointer">Auditoria externa</label>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50">
                      <input type="radio" name="answer" id="opt2" defaultChecked />
                      <label htmlFor="opt2" className="flex-1 cursor-pointer">Garantir integridade das informações e apoiar gestão</label>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50">
                      <input type="radio" name="answer" id="opt3" />
                      <label htmlFor="opt3" className="flex-1 cursor-pointer">Emitir certificados</label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setExamStarted(false)}
              >
                ← Cancelar
              </Button>
              <Button 
                onClick={() => {
                  if (isDirect) {
                    window.location.href = "/exam-results?type=direct";
                  } else {
                    window.location.href = "/exam-results";
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                ✓ Finalizar Prova
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
