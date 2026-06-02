import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function ExamResults() {
  const [selectedResult, setSelectedResult] = useState<"approved" | "rejected" | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);

  // Dados simulados de performance
  const approvedPerformance = {
    score: 78,
    totalQuestions: 60,
    correctAnswers: 47,
    timeUsed: "95 minutos",
    status: "APROVADO",
    statusColor: "green",
  };

  const rejectedPerformance = {
    score: 42,
    totalQuestions: 60,
    correctAnswers: 25,
    timeUsed: "120 minutos",
    status: "REPROVADO",
    statusColor: "red",
  };

  // Dados de performance por grupos de conhecimento
  const knowledgeGroupsApproved = [
    { name: "Conformidade Regulatória", acertos: 15, total: 18, percentual: 83 },
    { name: "Análise Financeira", acertos: 12, total: 15, percentual: 80 },
    { name: "Gestão de Risco", acertos: 10, total: 12, percentual: 83 },
    { name: "Contabilidade Avançada", acertos: 10, total: 15, percentual: 67 },
  ];

  const knowledgeGroupsRejected = [
    { name: "Conformidade Regulatória", acertos: 8, total: 18, percentual: 44 },
    { name: "Análise Financeira", acertos: 6, total: 15, percentual: 40 },
    { name: "Gestão de Risco", acertos: 5, total: 12, percentual: 42 },
    { name: "Contabilidade Avançada", acertos: 6, total: 15, percentual: 40 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Resultado da Prova</h1>
          <p className="text-gray-600">Escolha uma das opções abaixo para visualizar seu desempenho</p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Card 1: APROVADO */}
          <Card
            className={`p-8 border-2 transition-all cursor-pointer ${
              selectedResult === "approved"
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-green-400"
            }`}
            onClick={() => setSelectedResult("approved")}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">Fase 1: Aprovado</h2>
              <p className="text-gray-600 mb-6">Você foi aprovado na prova de certificação</p>

              {selectedResult === "approved" && (
                <div className="space-y-6">
                  {/* Performance Details */}
                  <div className="bg-white rounded-lg p-6 border border-green-200">
                    <h3 className="font-bold text-green-900 mb-4">📈 Sua Performance</h3>
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Pontuação Final:</span>
                        <span className="font-bold text-green-600 text-lg">{approvedPerformance.score}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Questões Corretas:</span>
                        <span className="font-bold text-green-600">{approvedPerformance.correctAnswers}/{approvedPerformance.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Tempo Utilizado:</span>
                        <span className="font-bold text-gray-700">{approvedPerformance.timeUsed}</span>
                      </div>
                      <div className="pt-3 border-t border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-bold">Status:</span>
                          <span className="bg-green-600 text-white px-4 py-1 rounded-full font-bold">
                            {approvedPerformance.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance por Grupos de Conhecimento - Heatmap */}
                  <div className="bg-white rounded-lg p-6 border border-green-200">
                    <h3 className="font-bold text-green-900 mb-4">🔥 Performance por Grupos de Conhecimento</h3>
                    <div className="space-y-3">
                      {knowledgeGroupsApproved.map((group, idx) => {
                        const getHeatmapColor = (percentual: number) => {
                          if (percentual >= 80) return "bg-green-600 text-white";
                          if (percentual >= 70) return "bg-green-500 text-white";
                          if (percentual >= 60) return "bg-yellow-500 text-white";
                          if (percentual >= 50) return "bg-orange-500 text-white";
                          return "bg-red-600 text-white";
                        };

                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-700 truncate">{group.name}</p>
                              <p className="text-xs text-gray-600">{group.acertos}/{group.total} questões</p>
                            </div>
                            <div className={`px-4 py-2 rounded-lg font-bold text-center min-w-16 ${getHeatmapColor(group.percentual)}`}>
                              {group.percentual}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Legenda:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-600 rounded"></div><span>Excelente (80%+)</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div><span>Bom (70-79%)</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500 rounded"></div><span>Regular (60-69%)</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded"></div><span>Fraco (50-59%)</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => window.location.href = "/documental-analysis-checkout"}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
                  >
                    Prosseguir para Análise Documental →
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Card 2: REPROVADO */}
          <Card
            className={`p-8 border-2 transition-all ${
              selectedResult === "rejected"
                ? "border-red-500 bg-red-50"
                : "border-gray-300 opacity-60 cursor-not-allowed"
            }`}
            onClick={() => selectedResult !== "rejected" && setSelectedResult("rejected")}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">Fase 2: Reprovado</h2>
              <p className="text-gray-600 mb-6">Você não atingiu a pontuação mínima</p>

              {selectedResult === "rejected" && (
                <div className="space-y-6">
                  {/* Performance Details */}
                  <div className="bg-white rounded-lg p-6 border border-red-200">
                    <h3 className="font-bold text-red-900 mb-4">📈 Sua Performance</h3>
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Pontuação Final:</span>
                        <span className="font-bold text-red-600 text-lg">{rejectedPerformance.score}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Questões Corretas:</span>
                        <span className="font-bold text-red-600">{rejectedPerformance.correctAnswers}/{rejectedPerformance.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Tempo Utilizado:</span>
                        <span className="font-bold text-gray-700">{rejectedPerformance.timeUsed}</span>
                      </div>
                      <div className="pt-3 border-t border-red-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-bold">Status:</span>
                          <span className="bg-red-600 text-white px-4 py-1 rounded-full font-bold">
                            {rejectedPerformance.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance por Grupos de Conhecimento - Heatmap */}
                  <div className="bg-white rounded-lg p-6 border border-red-200">
                    <h3 className="font-bold text-red-900 mb-4">🔥 Performance por Grupos de Conhecimento</h3>
                    <div className="space-y-3">
                      {knowledgeGroupsRejected.map((group, idx) => {
                        const getHeatmapColor = (percentual: number) => {
                          if (percentual >= 80) return "bg-green-600 text-white";
                          if (percentual >= 70) return "bg-green-500 text-white";
                          if (percentual >= 60) return "bg-yellow-500 text-white";
                          if (percentual >= 50) return "bg-orange-500 text-white";
                          return "bg-red-600 text-white";
                        };

                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-700 truncate">{group.name}</p>
                              <p className="text-xs text-gray-600">{group.acertos}/{group.total} questões</p>
                            </div>
                            <div className={`px-4 py-2 rounded-lg font-bold text-center min-w-16 ${getHeatmapColor(group.percentual)}`}>
                              {group.percentual}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Legenda:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-600 rounded"></div><span>Excelente (80%+)</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div><span>Bom (70-79%)</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500 rounded"></div><span>Regular (60-69%)</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded"></div><span>Fraco (50-59%)</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Recovery Dialog */}
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                    <p className="text-yellow-900 font-bold mb-4">🎓 Deseja participar das aulas de reforço?</p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => window.location.href = "/courses-learning?recovery=true"}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                      >
                        Sim, Quero Estudar
                      </Button>
                      <Button
                        onClick={() => window.location.href = "/select-certification-type"}
                        variant="outline"
                        className="flex-1 font-bold"
                      >
                        Não, Voltar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Info Message */}
        {!selectedResult && (
          <div className="text-center p-6 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <p className="text-blue-900 font-bold">
              👆 Clique em um dos cards acima para visualizar seu resultado
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
