import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function DirectCertificationInterviewScheduling() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Gerar datas disponíveis (próximos 30 dias)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      // Apenas dias úteis (segunda a sexta)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  // Horários disponíveis
  const availableTimes = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
  ];

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Por favor, selecione uma data e horário");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Entrevista agendada com sucesso!");
      // Redirecionar para sala de entrevista
      window.location.href = `/direct-interview-room?date=${selectedDate}&time=${selectedTime}`;
    }, 1500);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-4xl font-bold text-blue-900 mb-2">📅 Agendar Entrevista Técnica</h1>
          <p className="text-gray-600">Escolha uma data e horário para sua entrevista</p>
        </div>

        {/* Information Card */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-300 mb-8">
          <h3 className="font-bold text-blue-900 mb-3">ℹ️ Informações Importantes</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ A entrevista terá duração de aproximadamente 30-45 minutos</li>
            <li>✓ Será realizada por videoconferência com gravação</li>
            <li>✓ Você receberá um link de acesso 24 horas antes</li>
            <li>✓ Certifique-se de ter câmera, microfone e conexão de internet estável</li>
            <li>✓ Escolha um local tranquilo e bem iluminado</li>
          </ul>
        </Card>

        {/* Scheduling Form */}
        <Card className="p-8 border-2 border-blue-300 mb-8">
          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <Label className="font-bold text-blue-900 mb-3 block">📅 Selecione uma Data</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                {getAvailableDates().map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      selectedDate === date
                        ? "border-blue-600 bg-blue-100 text-blue-900"
                        : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                    }`}
                  >
                    <div className="font-bold">{new Date(date + "T00:00:00").getDate()}</div>
                    <div className="text-xs">
                      {new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
                        month: "short",
                      })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <Label className="font-bold text-blue-900 mb-3 block">🕐 Selecione um Horário</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border-2 transition-all font-medium ${
                        selectedTime === time
                          ? "border-blue-600 bg-blue-100 text-blue-900"
                          : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {selectedDate && selectedTime && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <h4 className="font-bold text-green-900 mb-2">✓ Resumo do Agendamento</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <p>
                    <strong>Data:</strong> {formatDate(selectedDate)}
                  </p>
                  <p>
                    <strong>Horário:</strong> {selectedTime}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Requirements */}
        <Card className="p-6 bg-yellow-50 border-2 border-yellow-300 mb-8">
          <h3 className="font-bold text-yellow-900 mb-3">⚠️ Requisitos Técnicos</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Câmera funcionando e visível</li>
            <li>✓ Microfone funcionando</li>
            <li>✓ Conexão de internet estável (mínimo 5 Mbps)</li>
            <li>✓ Navegador atualizado (Chrome, Firefox, Safari ou Edge)</li>
            <li>✓ Ambiente bem iluminado</li>
            <li>✓ Documento de identificação em mãos</li>
          </ul>
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
