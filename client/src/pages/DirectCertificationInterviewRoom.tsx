import { useState, useRef, useEffect } from "react";
import { useSearch } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function DirectCertificationInterviewRoom() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const search = useSearch();
  const params = new URLSearchParams(search);
  const scheduledDate = params.get("date") || "";
  const scheduledTime = params.get("time") || "";

  // Timer para gravação
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Iniciar câmera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      toast.success("Câmera iniciada com sucesso!");
    } catch (error) {
      toast.error("Erro ao acessar câmera. Verifique as permissões.");
      console.error("Erro ao acessar câmera:", error);
    }
  };

  // Iniciar gravação
  const startRecording = async () => {
    if (!streamRef.current) {
      toast.error("Câmera não está ativa");
      return;
    }

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp8,opus",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      // Simular upload da gravação
      saveRecording(blob);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    toast.success("Gravação iniciada!");
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Gravação finalizada!");
    }
  };

  // Salvar gravação
  const saveRecording = (blob: Blob) => {
    // Simular salvamento da gravação
    const recordingId = `recording_${Date.now()}`;
    const recordingData = {
      id: recordingId,
      date: new Date().toISOString(),
      duration: recordingTime,
      size: blob.size,
      status: "processing",
    };

    // Armazenar referência da gravação no localStorage (em produção seria no backend)
    const recordings = JSON.parse(localStorage.getItem("interview_recordings") || "[]");
    recordings.push(recordingData);
    localStorage.setItem("interview_recordings", JSON.stringify(recordings));

    // Simular upload para servidor
    console.log("Gravação salva:", recordingData);
    toast.success("Gravação armazenada com sucesso!");
  };

  // Finalizar entrevista
  const finishInterview = () => {
    if (isRecording) {
      stopRecording();
    }

    // Parar câmera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setInterviewFinished(true);
    toast.success("Entrevista finalizada!");

    // Redirecionar após 3 segundos
    setTimeout(() => {
      window.location.href = "/direct-certification-result";
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (interviewFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center bg-green-50 border-2 border-green-300">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-900 mb-2">Entrevista Concluída!</h1>
          <p className="text-green-800 mb-4">Sua entrevista foi gravada e armazenada com sucesso.</p>
          <p className="text-sm text-gray-600">Redirecionando para próxima etapa...</p>
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
              disabled={interviewStarted}
            >
              ← Voltar
            </Button>
            <BackToHomeButton />
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">🎥 Sala de Entrevista</h1>
          <p className="text-gray-600">Sua entrevista será gravada e armazenada</p>
        </div>

        {/* Interview Information */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-300 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">📅 Data Agendada</p>
              <p className="font-bold text-blue-900">{scheduledDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">🕐 Horário Agendado</p>
              <p className="font-bold text-blue-900">{scheduledTime}</p>
            </div>
          </div>
        </Card>

        {/* Video Preview */}
        <Card className="p-6 border-2 border-blue-300 mb-8">
          <div className="space-y-4">
            <h3 className="font-bold text-blue-900">📹 Visualização da Câmera</h3>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  REC
                </div>
              )}
            </div>

            {/* Recording Timer */}
            {isRecording && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">⏱️ Tempo de Gravação</p>
                <p className="text-3xl font-bold text-red-600">{formatTime(recordingTime)}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Interview Instructions */}
        {!interviewStarted && (
          <Card className="p-6 bg-yellow-50 border-2 border-yellow-300 mb-8">
            <h3 className="font-bold text-yellow-900 mb-3">⚠️ Antes de Iniciar</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Verifique se sua câmera e microfone estão funcionando</li>
              <li>✓ Certifique-se de ter iluminação adequada</li>
              <li>✓ Feche aplicativos desnecessários</li>
              <li>✓ Tenha seu documento de identificação em mãos</li>
              <li>✓ Mantenha-se em local tranquilo e seguro</li>
            </ul>
          </Card>
        )}

        {/* Control Buttons */}
        <Card className="p-6 border-2 border-blue-300 mb-8">
          <div className="space-y-4">
            {!interviewStarted ? (
              <>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg"
                  onClick={() => {
                    startCamera();
                    setInterviewStarted(true);
                  }}
                >
                  🎥 Iniciar Entrevista
                </Button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    className={`${
                      isRecording
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white font-bold py-3`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? "⏹️ Parar Gravação" : "🔴 Iniciar Gravação"}
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
                    onClick={finishInterview}
                  >
                    ✓ Finalizar Entrevista
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Recording Information */}
        <Card className="p-6 bg-gray-50 border-2 border-gray-300">
          <h3 className="font-bold text-gray-900 mb-3">ℹ️ Informações sobre Gravação</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ A entrevista será gravada em vídeo e áudio</li>
            <li>✓ A gravação será armazenada de forma segura em nossos servidores</li>
            <li>✓ Você poderá acessar a gravação após a conclusão da entrevista</li>
            <li>✓ A gravação será mantida por 2 anos para fins de certificação</li>
            <li>✓ Sua privacidade é protegida conforme LGPD</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
