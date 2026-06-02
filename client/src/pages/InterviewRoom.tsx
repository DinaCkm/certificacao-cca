import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
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

  // Carregar dados da entrevista agendada
  useEffect(() => {
    const data = sessionStorage.getItem("interviewData");
    if (data) {
      setInterviewData(JSON.parse(data));
    }
  }, []);

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

                  <Button
                    onClick={finishInterview}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    Finalizar Entrevista
                  </Button>
                </>
              )}
            </div>

            {/* Instructions */}
            <Card className="p-4 bg-yellow-50 border-2 border-yellow-300">
              <h4 className="font-bold text-yellow-900 mb-2 text-sm">⚠️ Instruções</h4>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>✓ Mantenha a câmera ligada</li>
                <li>✓ Fale claramente no microfone</li>
                <li>✓ Responda todas as perguntas</li>
                <li>✓ Clique em "Finalizar" quando terminar</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
