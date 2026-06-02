import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { ProgressBar } from "@/components/ProgressBar";

export function DirectCertificationForm() {
  const [formData, setFormData] = useState({
    fullName: "João Silva Santos",
    cpf: "123.456.789-00",
    email: "joao.silva@email.com",
    phone: "(11) 98765-4321",
    birthDate: "1985-05-15",
    currentPosition: "Consultor de Conformidade",
    institution: "Universidade Federal de São Paulo",
    graduationCourse: "Bacharel em Contabilidade",
    graduationYear: "2008",
    mbaInstitution: "INSPER",
    mbaCourse: "MBA em Gestão Financeira",
    mbaYear: "2015",
    company1: "Empresa A",
    position1: "Contador Sênior",
    startDate1: "2015-01-01",
    endDate1: "2019-12-31",
    company2: "Empresa B",
    position2: "Gerente de Controladoria",
    startDate2: "2020-01-01",
    endDate2: "2023-12-31",
    company3: "Empresa C",
    position3: "Consultor de Conformidade",
    startDate3: "2024-01-01",
    endDate3: "",
    achievements: "Implementação de sistema de controle interno, Gestão de equipes de até 10 pessoas, Certificado em IFRS",
    certifications: "Certificação em IFRS, Certificação em SOX, Certificação em Governança Corporativa",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Validar campos obrigatórios com mensagens específicas
    if (!formData.fullName) {
      toast.error("Campo obrigatório: Nome Completo");
      return;
    }
    if (!formData.cpf) {
      toast.error("Campo obrigatório: CPF");
      return;
    }
    if (!formData.email) {
      toast.error("Campo obrigatório: Email");
      return;
    }
    if (!formData.phone) {
      toast.error("Campo obrigatório: Telefone");
      return;
    }
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email inválido. Por favor, verifique o formato");
      return;
    }
    // Validar CPF (formato básico)
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
    if (!cpfRegex.test(formData.cpf)) {
      toast.error("CPF inválido. Use o formato: 123.456.789-00");
      return;
    }

    setIsProcessing(true);
    // Simular salvamento de dados
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Ficha preenchida com sucesso!");
      // Redirecionar para upload de documentos
      window.location.href = "/step-6?type=direct";
    }, 1500);
  };

  const progressSteps = [
    { id: 1, label: "Prova", completed: true, current: false },
    { id: 2, label: "Pagamento", completed: true, current: false },
    { id: 3, label: "Ficha", completed: false, current: true },
    { id: 4, label: "Upload", completed: false, current: false },
    { id: 5, label: "Entrevista", completed: false, current: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Bar */}
        <ProgressBar steps={progressSteps} title="Fluxo de Certificação Direta" />

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
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Preenchimento de Ficha</h1>
          <p className="text-gray-600">Complete sua ficha profissional antes de prosseguir com a análise documental</p>
        </div>

        {/* Form Card */}
        <Card className="p-8 mb-8 border-2 border-blue-300">
          {/* Dados Pessoais */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">📋 Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">Nome Completo *</Label>
                <Input
                  placeholder="João Silva Santos"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="border-2 border-gray-300"
                />
              </div>
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">CPF *</Label>
                <Input
                  placeholder="123.456.789-00"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                  className="border-2 border-gray-300"
                />
              </div>
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">Email *</Label>
                <Input
                  type="email"
                  placeholder="joao@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="border-2 border-gray-300"
                />
              </div>
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">Telefone *</Label>
                <Input
                  placeholder="(11) 98765-4321"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="border-2 border-gray-300"
                />
              </div>
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">Data de Nascimento</Label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  className="border-2 border-gray-300"
                />
              </div>
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">Cargo Atual</Label>
                <Input
                  placeholder="Consultor de Conformidade"
                  value={formData.currentPosition}
                  onChange={(e) => handleInputChange("currentPosition", e.target.value)}
                  className="border-2 border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Formação Acadêmica */}
          <div className="mb-8 border-t pt-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">🎓 Formação Acadêmica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">Instituição (Graduação)</Label>
                <Input
                  placeholder="Universidade Federal de São Paulo"
                  value={formData.institution}
                  onChange={(e) => handleInputChange("institution", e.target.value)}
                  className="border-2 border-gray-300"
                />
              </div>
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">Curso (Graduação)</Label>
                <Input
                  placeholder="Bacharel em Contabilidade"
                  value={formData.graduationCourse}
                  onChange={(e) => handleInputChange("graduationCourse", e.target.value)}
                  className="border-2 border-gray-300"
                />
              </div>
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">Ano de Conclusão (Graduação)</Label>
                <Input
                  type="number"
                  placeholder="2008"
                  value={formData.graduationYear}
                  onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                  className="border-2 border-gray-300"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <h3 className="font-bold text-blue-900 mb-4">MBA / Pós-Graduação (Opcional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Instituição</Label>
                  <Input
                    placeholder="INSPER"
                    value={formData.mbaInstitution}
                    onChange={(e) => handleInputChange("mbaInstitution", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Curso</Label>
                  <Input
                    placeholder="MBA em Gestão Financeira"
                    value={formData.mbaCourse}
                    onChange={(e) => handleInputChange("mbaCourse", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Ano de Conclusão</Label>
                  <Input
                    type="number"
                    placeholder="2015"
                    value={formData.mbaYear}
                    onChange={(e) => handleInputChange("mbaYear", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Experiência Profissional */}
          <div className="mb-8 border-t pt-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">💼 Experiência Profissional</h2>

            {/* Experiência 1 */}
            <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-4">Experiência 1</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Empresa</Label>
                  <Input
                    placeholder="Empresa A"
                    value={formData.company1}
                    onChange={(e) => handleInputChange("company1", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Cargo</Label>
                  <Input
                    placeholder="Contador Sênior"
                    value={formData.position1}
                    onChange={(e) => handleInputChange("position1", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Data de Início</Label>
                  <Input
                    type="date"
                    value={formData.startDate1}
                    onChange={(e) => handleInputChange("startDate1", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Data de Término</Label>
                  <Input
                    type="date"
                    value={formData.endDate1}
                    onChange={(e) => handleInputChange("endDate1", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Experiência 2 */}
            <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-4">Experiência 2</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Empresa</Label>
                  <Input
                    placeholder="Empresa B"
                    value={formData.company2}
                    onChange={(e) => handleInputChange("company2", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Cargo</Label>
                  <Input
                    placeholder="Gerente de Controladoria"
                    value={formData.position2}
                    onChange={(e) => handleInputChange("position2", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Data de Início</Label>
                  <Input
                    type="date"
                    value={formData.startDate2}
                    onChange={(e) => handleInputChange("startDate2", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Data de Término</Label>
                  <Input
                    type="date"
                    value={formData.endDate2}
                    onChange={(e) => handleInputChange("endDate2", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Experiência 3 */}
            <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-4">Experiência 3</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Empresa</Label>
                  <Input
                    placeholder="Empresa C"
                    value={formData.company3}
                    onChange={(e) => handleInputChange("company3", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Cargo</Label>
                  <Input
                    placeholder="Assistente Contábil"
                    value={formData.position3}
                    onChange={(e) => handleInputChange("position3", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Data de Início</Label>
                  <Input
                    type="date"
                    value={formData.startDate3}
                    onChange={(e) => handleInputChange("startDate3", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
                <div>
                  <Label className="font-bold text-blue-900 mb-2 block">Data de Término</Label>
                  <Input
                    type="date"
                    value={formData.endDate3}
                    onChange={(e) => handleInputChange("endDate3", e.target.value)}
                    className="border-2 border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="mb-8 border-t pt-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">⭐ Informações Adicionais</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">Principais Realizações e Projetos</Label>
                <Textarea
                  placeholder="Descreva seus principais projetos e realizações profissionais..."
                  value={formData.achievements}
                  onChange={(e) => handleInputChange("achievements", e.target.value)}
                  className="border-2 border-gray-300 min-h-[120px]"
                />
              </div>
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">Certificações e Cursos Adicionais</Label>
                <Textarea
                  placeholder="Liste outras certificações e cursos relevantes..."
                  value={formData.certifications}
                  onChange={(e) => handleInputChange("certifications", e.target.value)}
                  className="border-2 border-gray-300 min-h-[120px]"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 border-t pt-8">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.history.back()}
            >
              ← Voltar
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Salvando...
                </>
              ) : (
                "✓ Prosseguir para Upload de Documentos"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
