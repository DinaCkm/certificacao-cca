import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function DirectCertificationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    cpf: "",
    email: "",
    phone: "",
    birthDate: "",
    currentPosition: "",
    institution: "",
    graduationCourse: "",
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
    achievements: "",
    certifications: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Validar campos obrigatórios
    if (!formData.fullName || !formData.cpf || !formData.email || !formData.phone) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-5xl mx-auto">
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

        {/* Form */}
        <Card className="p-8 border-2 border-blue-300 mb-8">
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
                <Label className="font-bold text-blue-900 mb-2 block">Ano de Conclusão</Label>
                <Input
                  placeholder="2015"
                  value={formData.graduationYear}
                  onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                  className="border-2 border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">Instituição (MBA/Pós-Graduação)</Label>
                <Input
                  placeholder="FGV"
                  value={formData.mbaInstitution}
                  onChange={(e) => handleInputChange("mbaInstitution", e.target.value)}
                  className="border-2 border-gray-300"
                />
              </div>
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">Curso (MBA/Pós-Graduação)</Label>
                <Input
                  placeholder="MBA em Controladoria"
                  value={formData.mbaCourse}
                  onChange={(e) => handleInputChange("mbaCourse", e.target.value)}
                  className="border-2 border-gray-300"
                />
              </div>
              <div>
                <Label className="font-bold text-blue-900 mb-2 block">Ano de Conclusão</Label>
                <Input
                  placeholder="2020"
                  value={formData.mbaYear}
                  onChange={(e) => handleInputChange("mbaYear", e.target.value)}
                  className="border-2 border-gray-300"
                />
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
                    placeholder="Gerente de Controladoria"
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
                    placeholder="Analista de Conformidade"
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
