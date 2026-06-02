import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FormData {
  fullName: string;
  email: string;
  certificationArea: string;
  undergraduateEducation: {
    institution: string;
    course: string;
    duration: string;
    conclusionYear: string;
  };
  mbaEducation: {
    institution: string;
    course: string;
    duration: string;
    conclusionYear: string;
  };
  workExperiences: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    superiorName: string;
    teamSize: string;
    responsibilities: string;
  }>;
}

export function Level2EligibilityResult() {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [yearsAsLeader, setYearsAsLeader] = useState(0);

  useEffect(() => {
    const data = sessionStorage.getItem("level2FormData");
    if (data) {
      const parsedData = JSON.parse(data);
      setFormData(parsedData);

      // Calcular anos de liderança
      let totalYears = 0;
      parsedData.workExperiences.forEach((exp: any) => {
        if (exp.startDate && exp.endDate) {
          const start = new Date(exp.startDate);
          const end = new Date(exp.endDate);
          const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
          totalYears += years;
        }
      });

      setYearsAsLeader(Math.floor(totalYears));

      // Verificar elegibilidade
      const hasUndergraduate = parsedData.undergraduateEducation.institution !== "";
      const hasMBA = parsedData.mbaEducation.institution !== "";
      const eligible = hasUndergraduate && hasMBA && totalYears >= 5;

      setIsEligible(eligible);
    }
  }, []);

  if (!formData) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Resultado da Elegibilidade</h1>
          <p className="text-gray-600">Nível 2 - Análise Documental</p>
        </div>

        {/* Result Card */}
        <Card className={`p-8 mb-8 border-4 ${isEligible ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
          <div className="text-center mb-6">
            {isEligible ? (
              <>
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-3xl font-bold text-green-900 mb-2">Parabéns! Você é Elegível</h2>
                <p className="text-green-800 text-lg">Você atende a todos os requisitos para prosseguir com o Nível 2</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-3xl font-bold text-red-900 mb-2">Não Elegível</h2>
                <p className="text-red-800 text-lg">Você não atende aos requisitos mínimos para o Nível 2</p>
              </>
            )}
          </div>

          {/* Eligibility Details */}
          <div className="space-y-4 mt-8 pt-8 border-t-2 border-gray-300">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <span className="font-semibold text-gray-700">Formação Superior:</span>
              <span className={`font-bold ${formData.undergraduateEducation.institution ? "text-green-600" : "text-red-600"}`}>
                {formData.undergraduateEducation.institution ? "✓ Atende" : "✗ Não atende"}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <span className="font-semibold text-gray-700">MBA/Pós-Graduação:</span>
              <span className={`font-bold ${formData.mbaEducation.institution ? "text-green-600" : "text-red-600"}`}>
                {formData.mbaEducation.institution ? "✓ Atende" : "✗ Não atende"}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <span className="font-semibold text-gray-700">Anos de Liderança:</span>
              <span className={`font-bold ${yearsAsLeader >= 5 ? "text-green-600" : "text-red-600"}`}>
                {yearsAsLeader} anos {yearsAsLeader >= 5 ? "✓ Atende" : "✗ Não atende (mínimo 5)"}
              </span>
            </div>
          </div>
        </Card>

        {/* Candidate Info */}
        <Card className="p-8 mb-8 border-2 border-gray-300">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Informações do Candidato</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Nome</p>
              <p className="font-bold text-gray-900">{formData.fullName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-bold text-gray-900">{formData.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Área de Certificação</p>
              <p className="font-bold text-gray-900">{formData.certificationArea}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Anos de Experiência</p>
              <p className="font-bold text-gray-900">{yearsAsLeader} anos</p>
            </div>
          </div>
        </Card>

        {/* Education Summary */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border-2 border-gray-300">
            <h3 className="font-bold text-blue-900 mb-4">🎓 Formação Superior</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Instituição:</span> <span className="font-semibold">{formData.undergraduateEducation.institution}</span></p>
              <p><span className="text-gray-600">Curso:</span> <span className="font-semibold">{formData.undergraduateEducation.course}</span></p>
              <p><span className="text-gray-600">Duração:</span> <span className="font-semibold">{formData.undergraduateEducation.duration}</span></p>
              <p><span className="text-gray-600">Conclusão:</span> <span className="font-semibold">{formData.undergraduateEducation.conclusionYear}</span></p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-gray-300">
            <h3 className="font-bold text-blue-900 mb-4">📚 MBA/Pós-Graduação</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Instituição:</span> <span className="font-semibold">{formData.mbaEducation.institution}</span></p>
              <p><span className="text-gray-600">Curso:</span> <span className="font-semibold">{formData.mbaEducation.course}</span></p>
              <p><span className="text-gray-600">Duração:</span> <span className="font-semibold">{formData.mbaEducation.duration}</span></p>
              <p><span className="text-gray-600">Conclusão:</span> <span className="font-semibold">{formData.mbaEducation.conclusionYear}</span></p>
            </div>
          </Card>
        </div>

        {/* Work Experience Summary */}
        <Card className="p-8 mb-8 border-2 border-gray-300">
          <h3 className="font-bold text-blue-900 mb-6 text-xl">💼 Experiência Profissional</h3>
          <div className="space-y-6">
            {formData.workExperiences.map((exp, idx) => (
              <div key={idx} className="border-l-4 border-blue-600 pl-4">
                <p className="font-bold text-gray-900">{exp.position} - {exp.company}</p>
                <p className="text-sm text-gray-600">{exp.startDate} até {exp.endDate}</p>
                <p className="text-sm text-gray-600">Líder de {exp.teamSize} pessoas | Superior: {exp.superiorName}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => window.location.href = "/select-certification-type"}
            variant="outline"
            className="flex-1 font-bold py-3"
          >
            ← Voltar
          </Button>
          {isEligible && (
            <Button
              onClick={() => window.location.href = "/level2-terms-warning"}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
            >
              Prosseguir para Pagamento →
            </Button>
          )}
        </div>

        {!isEligible && (
          <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-yellow-900 font-semibold mb-2">⚠️ Não Elegível</p>
            <p className="text-yellow-800 text-sm">
              Você não atende aos requisitos mínimos para o Nível 2. Para ser elegível, você precisa ter:
            </p>
            <ul className="text-yellow-800 text-sm mt-3 space-y-1">
              <li>✓ Formação Superior (Graduação)</li>
              <li>✓ MBA ou Pós-Graduação Lato Sensu</li>
              <li>✓ Mínimo de 5 anos de experiência como líder</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
