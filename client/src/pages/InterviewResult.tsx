import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Eye } from "lucide-react";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function InterviewResult() {
  const [interviewData, setInterviewData] = useState<any>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("interviewData");
    const video = sessionStorage.getItem("recordedVideo");
    
    if (data) {
      setInterviewData(JSON.parse(data));
    }
    if (video) {
      setRecordedVideo(video);
    }
  }, []);

  const downloadRecording = () => {
    if (recordedVideo) {
      const link = document.createElement("a");
      link.href = recordedVideo;
      link.download = `entrevista-${new Date().toISOString()}.webm`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            <BackToHomeButton />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-24 h-24 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-green-900 mb-2">Entrevista Finalizada!</h1>
          <p className="text-gray-600 text-lg">Obrigado por participar. Sua entrevista foi gravada com sucesso.</p>
        </div>

        {/* Interview Summary */}
        {interviewData && (
          <Card className="p-8 mb-8 border-2 border-green-300 bg-green-50">
            <h2 className="text-2xl font-bold text-green-900 mb-6">📋 Resumo da Entrevista</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 font-semibold">Data</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(interviewData.date).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 font-semibold">Horário</p>
                <p className="text-lg font-bold text-gray-900">{interviewData.time}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 font-semibold">Status</p>
                <p className="text-lg font-bold text-green-600">✓ Concluída</p>
              </div>
            </div>
          </Card>
        )}

        {/* Recording Section */}
        {recordedVideo && (
          <Card className="p-8 mb-8 border-2 border-blue-300 bg-blue-50">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">🎥 Sua Gravação</h2>
            
            <div className="bg-white p-6 rounded-lg border-2 border-blue-200 mb-6">
              <video
                src={recordedVideo}
                controls
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: "400px" }}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={downloadRecording}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Gravação
              </Button>
              
              <Button
                variant="outline"
                className="flex-1 py-3"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = recordedVideo;
                  link.target = "_blank";
                  link.click();
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Assistir em Tela Cheia
              </Button>
            </div>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="p-8 border-2 border-gray-300 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Próximas Etapas</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Análise da Entrevista</h3>
                <p className="text-gray-600 text-sm">
                  Sua entrevista será analisada pela banca avaliadora. Este processo leva entre 5 a 10 dias úteis.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Resultado Final</h3>
                <p className="text-gray-600 text-sm">
                  Você receberá um email com o resultado final da sua certificação.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Certificado Digital</h3>
                <p className="text-gray-600 text-sm">
                  Se aprovado, seu certificado digital estará disponível para download em sua conta.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1 py-3"
            onClick={() => window.location.href = "/"}
          >
            ← Retornar ao Menu Inicial
          </Button>
          
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
            onClick={() => window.location.href = "/"}
          >
            Acompanhar Certificação →
          </Button>
        </div>
      </div>
    </div>
  );
}
