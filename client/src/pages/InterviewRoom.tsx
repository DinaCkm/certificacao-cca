import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Mic, MicOff, VideoOff, PhoneOff, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function InterviewRoom() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [interviewData, setInterviewData] = useState<any>(null);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [isInterviewDay, setIsInterviewDay] = useState(false);

  // Carregar dados da entrevista agendada e verificar data
  useEffect(() => {
    const data = sessionStorage.getItem("interviewData");
    if (data) {
      const parsedData = JSON.parse(data);
      setInterviewData(parsedData);
      
      // Verificar se é o dia da entrevista
      const scheduledDate = new Date(parsedData.date).toDateString();
      const today = new Date().toDateString();
      
      if (scheduledDate === today) {
        // É o dia da entrevista
        setIsInterviewDay(true);
      } else {
        // Ainda não é o dia da entrevista
        setShowWaitingModal(true);
      }
    }
  }, []);

  const handleCloseWaitingModal = () => {
    setShowWaitingModal(false);
    window.location.href = "/";
  };

  // Timer de gravação
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsVideoOn(true);
      setIsAudioOn(true);
      toast.success("Câmera e microfone ativados");

      // Iniciar gravação automaticamente
      startRecording(mediaStream);
    } catch (error) {
      toast.error("Erro ao acessar câmera/microfone. Verifique as permissões.");
      console.error("Error accessing media devices:", error);
    }
  };

  const startRecording = (mediaStream: MediaStream) => {
    try {
      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        // Armazenar gravação em sessionStorage (em produção, fazer upload para servidor)
        const reader = new FileReader();
        reader.onloadend = () => {
          sessionStorage.setItem("recordedVideo", reader.result as string);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Gravação iniciada");
    } catch (error) {
      toast.error("Erro ao iniciar gravação");
      console.error("Error starting recording:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsVideoOn(false);
      setIsAudioOn(false);
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioOn(!isAudioOn);
      toast.success(isAudioOn ? "Microfone desativado" : "Microfone ativado");
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
      toast.success(isVideoOn ? "Câmera desativada" : "Câmera ativada");
    }
  };

  const finishInterview = () => {
    stopCamera();
    toast.success("Entrevista finalizada! Obrigado por participar.");
    setTimeout(() => {
      window.location.href = "/interview-result";
    }, 2000);
  };

  // Se não é o dia da entrevista, mostrar modal de espera com sala ao fundo
  if (showWaitingModal && interviewData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 p-4 flex items-center justify-center relative overflow-hidden">
        {/* Sala de Entrevista ao Fundo (Desabilitada) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="max-w-5xl mx-auto h-full px-4">
            <div className="mt-8">
              <div className="h-96 bg-black rounded-lg border-4 border-blue-400 flex items-center justify-center">
                <Video className="w-32 h-32 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Espera */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-8 border-4 border-yellow-400 bg-white">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-gray-900">Aguarde!</h2>
              </div>
              <button
                onClick={handleCloseWaitingModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-lg text-gray-800 font-semibold">
                Te esperamos nesta página
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Data do seu agendamento:</strong>
                </p>
                <p className="text-lg font-bold text-blue-900">
                  {new Date(interviewData.date).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Horário:</strong>
                </p>
                <p className="text-lg font-bold text-green-900">
                  {interviewData.time}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Entrevistador:</strong>
                </p>
                <p className="text-lg font-bold text-purple-900">
                  {interviewData.interviewer}
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                <p className="text-center text-gray-800 font-semibold">
                  ⏰ Chegue no horário
                </p>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-xl font-bold text-gray-900">Até Breve! 👋</p>
            </div>

            <Button
              onClick={handleCloseWaitingModal}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
            >
              Retornar ao Menu Inicial
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Se não é o dia da entrevista e ainda não carregou os dados
  if (!isInterviewDay && !showWaitingModal) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se é o dia da entrevista, mostrar sala normalmente
  if (isInterviewDay && !showWaitingModal) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 p-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex gap-2 mb-4">
              <BackToHomeButton />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Sala de Entrevista</h1>
            <p className="text-blue-100">Sua entrevista está sendo gravada</p>
          </div>

          {/* Interview Info */}
          {interviewData && (
            <Card className="p-4 bg-blue-50 border-2 border-blue-300 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-semibold">Data Agendada</p>
                  <p className="text-blue-900 font-bold">
                    {new Date(interviewData.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Horário</p>
                  <p className="text-blue-900 font-bold">{interviewData.time}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Entrevistador</p>
                  <p className="text-blue-900 font-bold">{interviewData.interviewer}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Tempo de Gravação</p>
                  <p className="text-blue-900 font-bold">{formatTime(recordingTime)}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Video Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Video Feed */}
            <div className="lg:col-span-2">
              <Card className="p-0 bg-black border-4 border-blue-400 overflow-hidden">
                {isVideoOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }} // Mirror effect
                  />
                ) : (
                  <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">Câmera desativada</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Status Card */}
              <Card className="p-6 bg-white border-2 border-gray-300">
                <h3 className="font-bold text-blue-900 mb-4">Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Câmera</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isVideoOn ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {isVideoOn ? "✓ Ativa" : "✗ Inativa"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Microfone</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isAudioOn ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {isAudioOn ? "✓ Ativo" : "✗ Inativo"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Gravação</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isRecording ? "bg-red-100 text-red-800 animate-pulse" : "bg-gray-100 text-gray-800"
                    }`}>
                      {isRecording ? "● Gravando" : "Parada"}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Control Buttons */}
              <div className="space-y-2">
                {!isVideoOn ? (
                  <Button
                    onClick={startCamera}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Iniciar Câmera
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={toggleVideo}
                      className={`w-full font-bold py-2 ${
                        isVideoOn
                          ? "bg-orange-600 hover:bg-orange-700 text-white"
                          : "bg-gray-600 hover:bg-gray-700 text-white"
                      }`}
                    >
                      {isVideoOn ? (
                        <>
                          <VideoOff className="w-4 h-4 mr-2" />
                          Desativar Câmera
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4 mr-2" />
                          Ativar Câmera
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={toggleAudio}
                      className={`w-full font-bold py-2 ${
                        isAudioOn
                          ? "bg-orange-600 hover:bg-orange-700 text-white"
                          : "bg-gray-600 hover:bg-gray-700 text-white"
                      }`}
                    >
                      {isAudioOn ? (
                        <>
                          <MicOff className="w-4 h-4 mr-2" />
                          Desativar Microfone
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Ativar Microfone
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>

              {/* Instructions */}
              <Card className="p-4 bg-yellow-50 border-2 border-yellow-200">
                <h4 className="font-bold text-yellow-900 mb-2">⚠️ Instruções</h4>
                <ul className="text-xs text-yellow-800 space-y-1">
                  <li>✓ Mantenha a câmera ligada</li>
                  <li>✓ Fale claramente no microfone</li>
                  <li>✓ Não se afaste da câmera</li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Finish Button */}
          <div className="flex gap-4">
            <Button
              onClick={finishInterview}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg"
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              Finalizar Entrevista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 p-4 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-lg">Carregando sala de entrevista...</p>
      </div>
    </div>
  );
}
