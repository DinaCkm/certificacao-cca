import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle2, User } from "lucide-react";
import { toast } from "sonner";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function InterviewScheduling() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedInterviewer, setSelectedInterviewer] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Gerar datas disponíveis (próximos 30 dias)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Pular fins de semana
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  const availableDates = generateAvailableDates();
  
  // Horários disponíveis
  const availableTimes = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
  ];

  // Lista de entrevistadores
  const interviewers = [
    { id: "1", name: "Dr. Carlos Silva", title: "Especialista em Conformidade" },
    { id: "2", name: "Dra. Marina Santos", title: "Auditora Sênior" },
    { id: "3", name: "Prof. Roberto Costa", title: "Consultor de Governança" },
    { id: "4", name: "Dra. Fernanda Oliveira", title: "Especialista em Controladoria" },
    { id: "5", name: "Dr. Lucas Pereira", title: "Auditor Certificado" },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInterviewerName = (id: string) => {
    return interviewers.find(i => i.id === id)?.name || "";
  };

  const getInterviewerTitle = (id: string) => {
    return interviewers.find(i => i.id === id)?.title || "";
  };

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime || !selectedInterviewer) {
      toast.error("Por favor, selecione uma data, horário e entrevistador");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Entrevista agendada com sucesso!");
      // Armazenar dados da entrevista
      sessionStorage.setItem(
        "interviewData",
        JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          interviewer: getInterviewerName(selectedInterviewer),
          interviewerTitle: getInterviewerTitle(selectedInterviewer),
          scheduledAt: new Date().toISOString(),
        })
      );
      window.location.href = "/interview-room";
    }, 1500);
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
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Agendamento de Entrevista</h1>
          <p className="text-gray-600">Selecione uma data, horário e entrevistador disponíveis</p>
        </div>

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-300 mb-8">
          <div className="flex gap-4">
            <div className="text-4xl">📅</div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Informações Importantes</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>✓ A entrevista tem duração aproximada de 30 minutos</li>
                <li>✓ Certifique-se de ter câmera e microfone funcionando</li>
                <li>✓ Use roupas profissionais</li>
                <li>✓ Escolha um local bem iluminado e sem ruídos</li>
                <li>✓ Tenha seu documento de identificação em mãos</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-2 border-gray-300">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Selecione uma Data
              </h2>

              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {availableDates.map((date) => {
                  const dateStr = date.toISOString().split("T")[0];
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSelectedTime(null);
                      }}
                      className={`p-3 rounded-lg border-2 transition text-left ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-300 text-gray-900 hover:border-blue-600"
                      }`}
                    >
                      <div className="font-bold text-sm">{formatDate(date)}</div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Time Selection */}
          <div>
            <Card className="p-6 border-2 border-gray-300">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Horário
              </h2>

              {selectedDate ? (
                <div className="space-y-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`w-full p-3 rounded-lg border-2 transition font-semibold text-sm ${
                        selectedTime === time
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-white border-gray-300 text-gray-900 hover:border-green-600"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Selecione uma data primeiro</p>
                </div>
              )}
            </Card>
          </div>

          {/* Interviewer Selection */}
          <div>
            <Card className="p-6 border-2 border-gray-300">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6" />
                Entrevistador
              </h2>

              <div className="space-y-2">
                {interviewers.map((interviewer) => (
                  <button
                    key={interviewer.id}
                    onClick={() => setSelectedInterviewer(interviewer.id)}
                    className={`w-full p-3 rounded-lg border-2 transition text-left ${
                      selectedInterviewer === interviewer.id
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-white border-gray-300 text-gray-900 hover:border-purple-600"
                    }`}
                  >
                    <div className={`font-bold text-sm ${selectedInterviewer === interviewer.id ? "text-white" : "text-gray-900"}`}>
                      {interviewer.name}
                    </div>
                    <div className={`text-xs ${selectedInterviewer === interviewer.id ? "text-purple-100" : "text-gray-600"}`}>
                      {interviewer.title}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Summary */}
        {selectedDate && selectedTime && selectedInterviewer && (
          <Card className="mb-8 p-6 bg-green-50 border-2 border-green-300">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-4">✓ Resumo do Agendamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="text-xs text-gray-600 font-semibold">Data</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatDate(new Date(selectedDate))}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="text-xs text-gray-600 font-semibold">Horário</p>
                    <p className="text-sm font-bold text-gray-900">{selectedTime}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="text-xs text-gray-600 font-semibold">Entrevistador</p>
                    <p className="text-sm font-bold text-gray-900">
                      {getInterviewerName(selectedInterviewer)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

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
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSchedule}
            disabled={!selectedDate || !selectedTime || !selectedInterviewer || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Agendando...
              </>
            ) : (
              "✓ Confirmar Agendamento"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
