import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function Level2LattesValidation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [validationResult, setValidationResult] = useState<"approved" | "rejected" | null>(null);

  // Validation Form Data
  const [experience, setExperience] = useState<string>("");
  const [formation, setFormation] = useState<string>("");
  const [leadershipYears, setLeadershipYears] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Lattes Form Data
  const [lattesData, setLattesData] = useState({
    fullName: "",
    email: "",
    cpf: "",
    phone: "",
    birthDate: "",
    currentPosition: "",
    institution: "",
    course: "",
    graduationYear: "",
    mbaInstitution: "",
    mbaCourse: "",
    mbaYear: "",
    company1: "",
    position1: "",
    startDate1: "",
    endDate1: "",
    company2: "",
    position2: "",
    startDate2: "",
    endDate2: "",
    company3: "",
    position3: "",
    startDate3: "",
    endDate3: "",
  });

  const handleValidation = () => {
    // Validate requirements
    if (!experience || !formation || !leadershipYears || !termsAccepted) {
      // toast.error("Por favor, preencha todos os campos e aceite os termos");
      return;
    }

    const leadershipYearsNum = parseInt(leadershipYears);
    const experienceYearsNum = parseInt(experience.split("-")[1] || experience.replace("+", ""));

    // Check if meets requirements
    const hasGraduate = formation === "pos-graduacao" || formation === "mba";
    const hasExperience = experienceYearsNum >= 5;
    const hasLeadership = leadershipYearsNum >= 3;

    if (hasGraduate && hasExperience && hasLeadership) {
      setValidationResult("approved");
      toast.success("✓ Você atende aos requisitos! Prossiga para o próximo passo.");
    } else {
      setValidationResult("rejected");
      // toast.error("✗ Você não atende aos requisitos mínimos para o Nível 2");
    }
  };

  const handleLattesInputChange = (field: string, value: string) => {
    setLattesData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateLattes = () => {
    if (!lattesData.fullName || !lattesData.email || !lattesData.cpf || !lattesData.phone) {
      // toast.error("Por favor, preencha todos os dados pessoais obrigatórios");
      return false;
    }
    if (!lattesData.institution || !lattesData.course || !lattesData.graduationYear) {
      // toast.error("Por favor, preencha os dados de formação superior");
      return false;
    }
    if (!lattesData.mbaInstitution || !lattesData.mbaCourse || !lattesData.mbaYear) {
      // toast.error("Por favor, preencha os dados de MBA/Pós-Graduação");
      return false;
    }
    if (!lattesData.company1 || !lattesData.position1 || !lattesData.startDate1 || !lattesData.endDate1) {
      // toast.error("Por favor, preencha os dados de pelo menos uma experiência profissional");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateLattes()) {
      // Save data to sessionStorage
      sessionStorage.setItem("level2LattesData", JSON.stringify(lattesData));
      // Redirect to terms page
      window.location.href = "/level2-terms-warning";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800 font-semibold mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Validação de Elegibilidade + Currículo</h1>
          <p className="text-gray-600">Confirme seus requisitos e preencha seu currículo profissional</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          {[1, 2].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full ${
                step <= currentStep ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Validation */}
        {currentStep === 1 && (
          <Card className="p-8 border-2 border-gray-300 mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Etapa 1: Validação de Requisitos</h2>

            <div className="space-y-6">
              {/* Experience Question */}
              <div>
                <Label className="text-gray-700 font-semibold mb-3 block">
                  Qual é seu tempo de experiência profissional? *
                </Label>
                <RadioGroup value={experience} onValueChange={setExperience}>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="2-5" id="exp-2-5" />
                    <Label htmlFor="exp-2-5" className="text-gray-700 cursor-pointer">
                      2-5 anos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="5-10" id="exp-5-10" />
                    <Label htmlFor="exp-5-10" className="text-gray-700 cursor-pointer">
                      5-10 anos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="10+" id="exp-10-plus" />
                    <Label htmlFor="exp-10-plus" className="text-gray-700 cursor-pointer">
                      10+ anos
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Formation Question */}
              <div>
                <Label className="text-gray-700 font-semibold mb-3 block">
                  Qual é sua formação acadêmica? *
                </Label>
                <RadioGroup value={formation} onValueChange={setFormation}>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="graduacao" id="form-graduacao" />
                    <Label htmlFor="form-graduacao" className="text-gray-700 cursor-pointer">
                      Graduação
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="pos-graduacao" id="form-pos-graduacao" />
                    <Label htmlFor="form-pos-graduacao" className="text-gray-700 cursor-pointer">
                      Pós-Graduação / Especialização
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mba" id="form-mba" />
                    <Label htmlFor="form-mba" className="text-gray-700 cursor-pointer">
                      MBA
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Leadership Years */}
              <div>
                <Label className="text-gray-700 font-semibold">
                  Quantos anos você tem em posição de liderança? *
                </Label>
                <Input
                  type="number"
                  placeholder="Ex: 5"
                  value={leadershipYears}
                  onChange={(e) => setLeadershipYears(e.target.value)}
                  className="mt-2"
                  min="0"
                  max="50"
                />
              </div>

              {/* Requirements Info */}
              <Card className="p-4 bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-900 font-semibold mb-2">📋 Requisitos Mínimos:</p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>✓ Mínimo 5 anos de experiência profissional</li>
                  <li>✓ Pós-Graduação ou MBA</li>
                  <li>✓ Mínimo 3 anos em posição de liderança</li>
                </ul>
              </Card>

              {/* Terms Acceptance */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-gray-700 cursor-pointer">
                  <span className="font-bold">Declaro que as informações fornecidas são verdadeiras.</span> Entendo que informações falsas podem resultar em desqualificação.
                </Label>
              </div>

              {/* Validation Result */}
              {validationResult === "approved" && (
                <Card className="p-4 bg-green-50 border-2 border-green-500 flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-green-900">✓ Você atende aos requisitos!</p>
                    <p className="text-sm text-green-800 mt-1">Prossiga para preencher seu currículo profissional.</p>
                  </div>
                </Card>
              )}

              {validationResult === "rejected" && (
                <Card className="p-4 bg-red-50 border-2 border-red-500 flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-900">✗ Você não atende aos requisitos</p>
                    <p className="text-sm text-red-800 mt-1">Verifique se possui os requisitos mínimos e tente novamente.</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="flex-1 font-bold py-3"
              >
                ← Voltar
              </Button>
              <Button
                onClick={handleValidation}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg"
              >
                Validar Requisitos
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Lattes Form */}
        {currentStep === 2 && (
          <Card className="p-8 border-2 border-gray-300 mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Etapa 2: Preencher Currículo</h2>

            <div className="space-y-6">
              {/* Personal Data */}
              <div className="border-b pb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">👤 Dados Pessoais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-gray-700 font-semibold">Nome Completo *</Label>
                    <Input
                      placeholder="Digite seu nome completo"
                      value={lattesData.fullName}
                      onChange={(e) => handleLattesInputChange("fullName", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-semibold">Email *</Label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={lattesData.email}
                      onChange={(e) => handleLattesInputChange("email", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-semibold">CPF *</Label>
                    <Input
                      placeholder="000.000.000-00"
                      value={lattesData.cpf}
                      onChange={(e) => handleLattesInputChange("cpf", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-semibold">Telefone *</Label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={lattesData.phone}
                      onChange={(e) => handleLattesInputChange("phone", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-semibold">Data de Nascimento</Label>
                    <Input
                      type="date"
                      value={lattesData.birthDate}
                      onChange={(e) => handleLattesInputChange("birthDate", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-semibold">Posição Atual</Label>
                    <Input
                      placeholder="Ex: Diretor, Gerente"
                      value={lattesData.currentPosition}
                      onChange={(e) => handleLattesInputChange("currentPosition", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="border-b pb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">🎓 Formação Superior</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Instituição (Ex: USP, UFRJ)"
                    value={lattesData.institution}
                    onChange={(e) => handleLattesInputChange("institution", e.target.value)}
                  />
                  <Input
                    placeholder="Curso (Ex: Administração, Engenharia)"
                    value={lattesData.course}
                    onChange={(e) => handleLattesInputChange("course", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Ano de Conclusão"
                    value={lattesData.graduationYear}
                    onChange={(e) => handleLattesInputChange("graduationYear", e.target.value)}
                  />
                </div>
              </div>

              {/* MBA */}
              <div className="border-b pb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">📚 MBA / Pós-Graduação</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Instituição"
                    value={lattesData.mbaInstitution}
                    onChange={(e) => handleLattesInputChange("mbaInstitution", e.target.value)}
                  />
                  <Input
                    placeholder="Programa (Ex: MBA em Gestão, Mestrado em TI)"
                    value={lattesData.mbaCourse}
                    onChange={(e) => handleLattesInputChange("mbaCourse", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Ano de Conclusão"
                    value={lattesData.mbaYear}
                    onChange={(e) => handleLattesInputChange("mbaYear", e.target.value)}
                  />
                </div>
              </div>

              {/* Professional Experience */}
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-4">💼 Experiência Profissional</h3>
                <div className="space-y-6">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="border-l-4 border-blue-600 pl-4 pb-4">
                      <p className="font-semibold text-gray-900 mb-3">Empresa {num}</p>
                      <div className="space-y-3">
                        <Input
                          placeholder="Nome da Empresa"
                          value={lattesData[`company${num}` as keyof typeof lattesData]}
                          onChange={(e) => handleLattesInputChange(`company${num}`, e.target.value)}
                        />
                        <Input
                          placeholder="Cargo/Posição"
                          value={lattesData[`position${num}` as keyof typeof lattesData]}
                          onChange={(e) => handleLattesInputChange(`position${num}`, e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="date"
                            value={lattesData[`startDate${num}` as keyof typeof lattesData]}
                            onChange={(e) => handleLattesInputChange(`startDate${num}`, e.target.value)}
                          />
                          <Input
                            type="date"
                            value={lattesData[`endDate${num}` as keyof typeof lattesData]}
                            onChange={(e) => handleLattesInputChange(`endDate${num}`, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="flex-1 font-bold py-3"
              >
                ← Anterior
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg"
              >
                ✓ Enviar Currículo
              </Button>
            </div>
          </Card>
        )}

        {/* Show Step 2 Button */}
        {currentStep === 1 && validationResult === "approved" && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={() => setCurrentStep(2)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
            >
              Próximo: Preencher Currículo →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
