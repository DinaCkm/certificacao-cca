import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function DirectCertificationResult() {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [isApproved, setIsApproved] = useState(true); // Simular aprovação

  useEffect(() => {
    // Carregar gravações do localStorage
    const savedRecordings = JSON.parse(
      localStorage.getItem("interview_recordings") || "[]"
    );
    setRecordings(savedRecordings);
  }, []);

  const handleViewRecording = (recordingId: string) => {
    window.location.href = `/direct-recording-playback?id=${recordingId}`;
  };

  const handleContinue = () => {
    if (isApproved) {
      window.location.href = "/step-9"; // Página de certificado
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
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
          <h1 className="text-4xl font-bold text-blue-900 mb-2">📊 Resultado da Entrevista</h1>
          <p className="text-gray-600">Sua entrevista foi processada com sucesso</p>
        </div>

        {/* Result Status */}
        {isApproved ? (
          <Card className="p-8 bg-green-50 border-2 border-green-300 mb-8">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-900 mb-2">Aprovado!</h2>
              <p className="text-green-800 mb-4">
                Parabéns! Você foi aprovado na entrevista técnica.
              </p>
              <p className="text-sm text-gray-600">
                Você será redirecionado para a página de certificado em breve.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-8 bg-red-50 border-2 border-red-300 mb-8">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-3xl font-bold text-red-900 mb-2">Não Aprovado</h2>
              <p className="text-red-800 mb-4">
                Infelizmente, você não foi aprovado nesta entrevista.
              </p>
              <p className="text-sm text-gray-600">
                Você pode tentar novamente fazendo uma nova compra.
              </p>
            </div>
          </Card>
        )}

        {/* Interview Recording */}
        <Card className="p-8 border-2 border-blue-300 mb-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6">🎥 Gravação da Entrevista</h3>

          {recordings.length > 0 ? (
            <div className="space-y-4">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="p-4 border-2 border-gray-300 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      Entrevista - {formatDate(recording.date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Duração: {formatDuration(recording.duration)} | Tamanho:{" "}
                      {(recording.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Status: <span className="font-semibold">{recording.status}</span>
                    </p>
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleViewRecording(recording.id)}
                  >
                    👁️ Assistir
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
              <p>Nenhuma gravação encontrada</p>
            </div>
          )}
        </Card>

        {/* Recording Information */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-300 mb-8">
          <h3 className="font-bold text-blue-900 mb-3">ℹ️ Informações sobre Gravação</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Sua gravação está armazenada de forma segura</li>
            <li>✓ Você pode assistir a qualquer momento</li>
            <li>✓ A gravação será mantida por 2 anos</li>
            <li>✓ Será usada apenas para fins de certificação</li>
            <li>✓ Sua privacidade é protegida conforme LGPD</li>
          </ul>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 bg-yellow-50 border-2 border-yellow-300 mb-8">
          <h3 className="font-bold text-yellow-900 mb-3">📋 Próximas Etapas</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li>1. Sua entrevista será revisada por nossos especialistas</li>
            <li>2. Você receberá a decisão final em até 2-3 dias úteis</li>
            <li>3. Se aprovado, seu certificado será emitido automaticamente</li>
            <li>4. Você receberá um email com seu certificado digital</li>
          </ol>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.history.back()}
          >
            ← Voltar
          </Button>
          {isApproved && (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
              onClick={handleContinue}
            >
              ✓ Ir para Certificado
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
