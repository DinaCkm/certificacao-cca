import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function DirectRecordingPlayback() {
  const [recording, setRecording] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const search = useSearch();
  const params = new URLSearchParams(search);
  const recordingId = params.get("id") || "";

  useEffect(() => {
    // Simular carregamento da gravação
    const recordings = JSON.parse(
      localStorage.getItem("interview_recordings") || "[]"
    );
    const found = recordings.find((r: any) => r.id === recordingId);
    
    setTimeout(() => {
      if (found) {
        setRecording(found);
      }
      setIsLoading(false);
    }, 1000);
  }, [recordingId]);

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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="font-bold text-gray-900">Carregando gravação...</p>
        </Card>
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <p className="font-bold text-gray-900 mb-4">Gravação não encontrada</p>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => window.history.back()}
          >
            ← Voltar
          </Button>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold text-blue-900 mb-2">🎥 Reprodução de Gravação</h1>
          <p className="text-gray-600">Assista sua entrevista gravada</p>
        </div>

        {/* Recording Information */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-300 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">📅 Data</p>
              <p className="font-bold text-blue-900">{formatDate(recording.date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">⏱️ Duração</p>
              <p className="font-bold text-blue-900">{formatDuration(recording.duration)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">💾 Tamanho</p>
              <p className="font-bold text-blue-900">
                {(recording.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">📊 Status</p>
              <p className="font-bold text-green-600">{recording.status}</p>
            </div>
          </div>
        </Card>

        {/* Video Player */}
        <Card className="p-6 border-2 border-blue-300 mb-8">
          <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-lg font-bold mb-2">Gravação Armazenada</p>
              <p className="text-sm text-gray-400">
                Reprodutor de vídeo simulado
              </p>
              <p className="text-xs text-gray-500 mt-4">
                Em produção, aqui seria exibido o vídeo da entrevista
              </p>
            </div>
          </div>
        </Card>

        {/* Recording Details */}
        <Card className="p-6 bg-gray-50 border-2 border-gray-300 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">📋 Detalhes da Gravação</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">ID da Gravação</span>
              <span className="font-mono text-sm text-gray-600">{recording.id}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">Data de Criação</span>
              <span className="text-gray-600">{formatDate(recording.date)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">Duração Total</span>
              <span className="text-gray-600">{formatDuration(recording.duration)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">Tamanho do Arquivo</span>
              <span className="text-gray-600">
                {(recording.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Status de Processamento</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {recording.status}
              </span>
            </div>
          </div>
        </Card>

        {/* Storage Information */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-300 mb-8">
          <h3 className="font-bold text-blue-900 mb-3">☁️ Armazenamento Seguro</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Gravação armazenada em servidor seguro com criptografia</li>
            <li>✓ Backup automático realizado diariamente</li>
            <li>✓ Acesso restrito apenas a pessoal autorizado</li>
            <li>✓ Conformidade com LGPD e regulamentações de privacidade</li>
            <li>✓ Retenção de dados por 2 anos conforme política</li>
          </ul>
        </Card>

        {/* Download Option */}
        <Card className="p-6 bg-yellow-50 border-2 border-yellow-300 mb-8">
          <h3 className="font-bold text-yellow-900 mb-3">⬇️ Download</h3>
          <p className="text-sm text-gray-700 mb-4">
            Você pode fazer download de sua gravação para fins de arquivo pessoal.
          </p>
          <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2">
            ⬇️ Fazer Download da Gravação
          </Button>
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
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
            onClick={() => window.location.href = "/direct-certification-result"}
          >
            ✓ Voltar ao Resultado
          </Button>
        </div>
      </div>
    </div>
  );
}
