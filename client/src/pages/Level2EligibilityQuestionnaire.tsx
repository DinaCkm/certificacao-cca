import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EducationRecord {
  institution: string;
  course: string;
  duration: string;
  conclusionYear: string;
}

interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  superiorName: string;
  teamSize: string;
  responsibilities: string;
}

export function Level2EligibilityQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    cpf: "",
    phone: "",
    certificationArea: "",
    undergraduateEducation: {
      institution: "",
      course: "",
      duration: "",
      conclusionYear: "",
    } as EducationRecord,
    mbaEducation: {
      institution: "",
      course: "",
      duration: "",
      conclusionYear: "",
    } as EducationRecord,
    workExperiences: [
      { company: "", position: "", startDate: "", endDate: "", superiorName: "", teamSize: "", responsibilities: "" },
      { company: "", position: "", startDate: "", endDate: "", superiorName: "", teamSize: "", responsibilities: "" },
      { company: "", position: "", startDate: "", endDate: "", superiorName: "", teamSize: "", responsibilities: "" },
    ] as WorkExperience[],
    termsAccepted: false,
  });

  const certificationAreas = [
    "Conformidade Regulatória",
    "Análise Financeira",
    "Gestão de Risco",
    "Contabilidade Avançada",
    "Auditoria Interna",
    "Compliance e Conformidade",
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEducationChange = (type: "undergraduateEducation" | "mbaEducation", field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleWorkExperienceChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newExperiences = [...prev.workExperiences];
      newExperiences[index] = {
        ...newExperiences[index],
        [field]: value,
      };
      return {
        ...prev,
        workExperiences: newExperiences,
      };
    });
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.cpf || !formData.phone) {
          toast.error("Por favor, preencha todos os dados pessoais");
          return false;
        }
        if (!formData.certificationArea) {
          toast.error("Por favor, selecione uma área de certificação");
          return false;
        }
        return true;
      case 2:
        const ug = formData.undergraduateEducation;
        if (!ug.institution || !ug.course || !ug.duration || !ug.conclusionYear) {
          toast.error("Por favor, preencha todos os dados da Formação Superior");
          return false;
        }
        const mba = formData.mbaEducation;
        if (!mba.institution || !mba.course || !mba.duration || !mba.conclusionYear) {
          toast.error("Por favor, preencha todos os dados do MBA/Pós-Graduação");
          return false;
        }
        return true;
      case 3:
        for (let i = 0; i < 3; i++) {
          const exp = formData.workExperiences[i];
          if (!exp.company || !exp.position || !exp.startDate || !exp.endDate || !exp.superiorName || !exp.teamSize || !exp.responsibilities) {
            toast.error(`Por favor, preencha todos os dados da experiência ${i + 1}`);
            return false;
          }
        }
        return true;
      case 4:
        if (!formData.termsAccepted) {
          toast.error("Por favor, aceite os termos e confirme as informações");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    sessionStorage.setItem("level2FormData", JSON.stringify(formData));
    window.location.href = "/level2-eligibility-result";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800 font-semibold mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Nível 2 - Análise Documental</h1>
          <p className="text-gray-600">Etapa {currentStep} de 4: {
            currentStep === 1 ? "Dados Pessoais" :
            currentStep === 2 ? "Formação Acadêmica" :
            currentStep === 3 ? "Experiência Profissional" :
            "Confirmação"
          }</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full ${
                step <= currentStep ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Personal Data */}
        {currentStep === 1 && (
          <Card className="p-8 border-2 border-gray-300">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Dados Pessoais</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 font-semibold">Nome Completo *</Label>
                <Input
                  placeholder="Digite seu nome completo"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-semibold">Email *</Label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">CPF *</Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">Telefone *</Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">Área de Certificação *</Label>
                <Select value={formData.certificationArea} onValueChange={(value) => handleInputChange("certificationArea", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificationAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Education */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Undergraduate */}
            <Card className="p-8 border-2 border-gray-300">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">🎓 Formação Superior</h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-semibold">Instituição/Faculdade *</Label>
                  <Input
                    placeholder="Ex: Universidade de São Paulo"
                    value={formData.undergraduateEducation.institution}
                    onChange={(e) => handleEducationChange("undergraduateEducation", "institution", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold">Curso *</Label>
                  <Input
                    placeholder="Ex: Administração de Empresas"
                    value={formData.undergraduateEducation.course}
                    onChange={(e) => handleEducationChange("undergraduateEducation", "course", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-semibold">Duração *</Label>
                    <Input
                      placeholder="Ex: 4 anos"
                      value={formData.undergraduateEducation.duration}
                      onChange={(e) => handleEducationChange("undergraduateEducation", "duration", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-semibold">Ano de Conclusão *</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 2015"
                      value={formData.undergraduateEducation.conclusionYear}
                      onChange={(e) => handleEducationChange("undergraduateEducation", "conclusionYear", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* MBA */}
            <Card className="p-8 border-2 border-gray-300">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">📚 MBA / Pós-Graduação</h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-semibold">Instituição/Faculdade *</Label>
                  <Input
                    placeholder="Ex: Fundação Getúlio Vargas"
                    value={formData.mbaEducation.institution}
                    onChange={(e) => handleEducationChange("mbaEducation", "institution", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold">Curso *</Label>
                  <Input
                    placeholder="Ex: MBA em Gestão Financeira"
                    value={formData.mbaEducation.course}
                    onChange={(e) => handleEducationChange("mbaEducation", "course", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-semibold">Duração *</Label>
                    <Input
                      placeholder="Ex: 2 anos"
                      value={formData.mbaEducation.duration}
                      onChange={(e) => handleEducationChange("mbaEducation", "duration", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-semibold">Ano de Conclusão *</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 2018"
                      value={formData.mbaEducation.conclusionYear}
                      onChange={(e) => handleEducationChange("mbaEducation", "conclusionYear", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Work Experience */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {formData.workExperiences.map((exp, index) => (
              <Card key={index} className="p-8 border-2 border-gray-300">
                <h2 className="text-2xl font-bold text-blue-900 mb-6">💼 Experiência Profissional {index + 1}</h2>

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700 font-semibold">Nome da Empresa *</Label>
                    <Input
                      placeholder="Ex: Banco XYZ"
                      value={exp.company}
                      onChange={(e) => handleWorkExperienceChange(index, "company", e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 font-semibold">Cargo/Função *</Label>
                    <Input
                      placeholder="Ex: Gerente de Operações"
                      value={exp.position}
                      onChange={(e) => handleWorkExperienceChange(index, "position", e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700 font-semibold">Data de Início *</Label>
                      <Input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => handleWorkExperienceChange(index, "startDate", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-semibold">Data de Término *</Label>
                      <Input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => handleWorkExperienceChange(index, "endDate", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-700 font-semibold">Nome do Superior Hierárquico *</Label>
                    <Input
                      placeholder="Ex: João Silva"
                      value={exp.superiorName}
                      onChange={(e) => handleWorkExperienceChange(index, "superiorName", e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 font-semibold">Número de Pessoas Lideradas *</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 15"
                      value={exp.teamSize}
                      onChange={(e) => handleWorkExperienceChange(index, "teamSize", e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 font-semibold">Descrição das Responsabilidades *</Label>
                    <Textarea
                      placeholder="Descreva suas principais responsabilidades e realizações..."
                      value={exp.responsibilities}
                      onChange={(e) => handleWorkExperienceChange(index, "responsibilities", e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <Card className="p-8 border-2 border-yellow-300 bg-yellow-50">
            <h2 className="text-2xl font-bold text-yellow-900 mb-6">⚠️ Confirmação e Termos</h2>

            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-yellow-300">
                <p className="text-gray-700 mb-4">
                  Você está prestes a enviar seu formulário de elegibilidade. Por favor, verifique se todas as informações estão corretas.
                </p>
                <p className="text-gray-700 font-semibold mb-4">
                  Seus dados serão analisados e você receberá um resultado sobre sua elegibilidade para prosseguir com o Nível 2.
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white border-2 border-yellow-300 rounded-lg">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange("termsAccepted", checked)}
                />
                <Label htmlFor="terms" className="text-gray-700 cursor-pointer">
                  <span className="font-bold">Declaro que todas as informações fornecidas são verdadeiras e precisas.</span> Entendo que informações falsas ou enganosas podem resultar em desqualificação imediata do processo de certificação.
                </Label>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : window.history.back()}
            variant="outline"
            className="flex-1 font-bold py-3"
          >
            {currentStep === 1 ? "← Voltar" : "← Anterior"}
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg"
          >
            {currentStep === 4 ? "✓ Enviar Formulário" : "Próximo →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
