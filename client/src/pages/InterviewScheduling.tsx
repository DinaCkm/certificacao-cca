import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function InterviewScheduling() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Por favor, selecione uma data e horário");
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
          <p className="text-gray-600">Selecione uma data e horário disponíveis para sua entrevista</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-2 border-gray-300">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Selecione uma Data
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableDates.map((date) => {
                  const dateStr = date.toISOString().split("T")[0];
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSelectedTime(null); // Reset time when date changes
                      }}
                      className={`p-4 rounded-lg border-2 transition text-left ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-300 text-gray-900 hover:border-blue-600"
                      }`}
                    >
                      <div className="font-bold">{formatDate(date)}</div>
                      <div className="text-sm opacity-75">
                        {date.toLocaleDateString("pt-BR", { weekday: "short" })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Time Selection */}
          <div>
            <Card className="p-6 border-2 border-gray-300 sticky top-4">
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
                      className={`w-full p-3 rounded-lg border-2 transition font-semibold ${
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
        </div>

        {/* Summary */}
        {selectedDate && selectedTime && (
          <Card className="mt-8 p-6 bg-green-50 border-2 border-green-300">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-2">✓ Resumo do Agendamento</h3>
                <div className="space-y-1 text-sm text-green-800 mb-4">
                  <p>
                    <strong>Data:</strong> {formatDate(new Date(selectedDate))}
                  </p>
                  <p>
                    <strong>Horário:</strong> {selectedTime}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
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
            disabled={!selectedDate || !selectedTime || isProcessing}
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
