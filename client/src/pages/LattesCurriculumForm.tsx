import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

interface EducationRecord {
  id: string;
  level: string; // Graduação, Mestrado, Doutorado, Pós-Doutorado
  institution: string;
  course: string;
  startYear: string;
  endYear: string;
  status: string; // Concluído, Em andamento
}

interface ProfessionalExperience {
  id: string;
  institution: string;
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  currentPosition: boolean;
}

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  role: string;
  funding: string;
}

interface Publication {
  id: string;
  type: string; // Artigo em Revista, Livro, Capítulo de Livro, Anais de Conferência
  title: string;
  authors: string;
  venue: string;
  year: string;
  doi: string;
}

interface Orientation {
  id: string;
  type: string; // Mestrado, Doutorado, Pós-Doutorado, Iniciação Científica
  studentName: string;
  title: string;
  status: string; // Concluído, Em andamento
  year: string;
}

export function LattesCurriculumForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    education: true,
    professional: true,
    research: false,
    publications: false,
    orientations: false,
  });

  const [formData, setFormData] = useState({
    // Personal Data
    fullName: "",
    email: "",
    cpf: "",
    phone: "",
    birthDate: "",
    nationality: "Brasileira",
    currentPosition: "",
    researchInterests: "",

    // Education
    education: [
      { id: "edu1", level: "Graduação", institution: "", course: "", startYear: "", endYear: "", status: "Concluído" },
      { id: "edu2", level: "Mestrado", institution: "", course: "", startYear: "", endYear: "", status: "Concluído" },
    ] as EducationRecord[],

    // Professional Experience
    professionalExperience: [] as ProfessionalExperience[],

    // Research Projects
    researchProjects: [] as ResearchProject[],

    // Publications
    publications: [] as Publication[],

    // Orientations
    orientations: [] as Orientation[],

    // Additional Info
    languages: "",
    awards: "",
    termsAccepted: false,
  });

  const educationLevels = ["Graduação", "Mestrado", "Doutorado", "Pós-Doutorado"];
  const publicationTypes = ["Artigo em Revista", "Livro", "Capítulo de Livro", "Anais de Conferência", "Preprint"];
  const orientationTypes = ["Mestrado", "Doutorado", "Pós-Doutorado", "Iniciação Científica", "Especialização"];
  const statusOptions = ["Concluído", "Em andamento"];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = {
        ...newEducation[index],
        [field]: value,
      };
      return {
        ...prev,
        education: newEducation,
      };
    });
  };

  const addProfessionalExperience = () => {
    setFormData(prev => ({
      ...prev,
      professionalExperience: [...prev.professionalExperience, {
        id: `prof${Date.now()}`,
        institution: "",
        position: "",
        department: "",
        startDate: "",
        endDate: "",
        currentPosition: false,
      }],
    }));
  };

  const removeProfessionalExperience = (id: string) => {
    setFormData(prev => ({
      ...prev,
      professionalExperience: prev.professionalExperience.filter(p => p.id !== id),
    }));
  };

  const handleProfessionalChange = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      professionalExperience: prev.professionalExperience.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  const addResearchProject = () => {
    setFormData(prev => ({
      ...prev,
      researchProjects: [...prev.researchProjects, {
        id: `proj${Date.now()}`,
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        role: "",
        funding: "",
      }],
    }));
  };

  const removeResearchProject = (id: string) => {
    setFormData(prev => ({
      ...prev,
      researchProjects: prev.researchProjects.filter(p => p.id !== id),
    }));
  };

  const handleResearchProjectChange = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      researchProjects: prev.researchProjects.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  const addPublication = () => {
    setFormData(prev => ({
      ...prev,
      publications: [...prev.publications, {
        id: `pub${Date.now()}`,
        type: "Artigo em Revista",
        title: "",
        authors: "",
        venue: "",
        year: new Date().getFullYear().toString(),
        doi: "",
      }],
    }));
  };

  const removePublication = (id: string) => {
    setFormData(prev => ({
      ...prev,
      publications: prev.publications.filter(p => p.id !== id),
    }));
  };

  const handlePublicationChange = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      publications: prev.publications.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  const addOrientation = () => {
    setFormData(prev => ({
      ...prev,
      orientations: [...prev.orientations, {
        id: `orient${Date.now()}`,
        type: "Mestrado",
        studentName: "",
        title: "",
        status: "Em andamento",
        year: new Date().getFullYear().toString(),
      }],
    }));
  };

  const removeOrientation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      orientations: prev.orientations.filter(o => o.id !== id),
    }));
  };

  const handleOrientationChange = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      orientations: prev.orientations.map(o =>
        o.id === id ? { ...o, [field]: value } : o
      ),
    }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.cpf || !formData.phone) {
        toast.error("Por favor, preencha todos os dados pessoais obrigatórios");
        return false;
      }
      return true;
    }
    if (step === 2) {
      for (let edu of formData.education) {
        if (!edu.institution || !edu.course || !edu.startYear || !edu.endYear) {
          toast.error("Por favor, preencha todos os dados de formação acadêmica");
          return false;
        }
      }
      return true;
    }
    if (step === 3) {
      if (!formData.termsAccepted) {
        toast.error("Por favor, aceite os termos e confirme as informações");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    sessionStorage.setItem("lattesCurriculumData", JSON.stringify(formData));
    window.location.href = "/level2-eligibility-result";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800 font-semibold mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Currículo Lattes</h1>
          <p className="text-gray-600">Preencha seu currículo acadêmico e profissional completo</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3].map((step) => (
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
          <Card className="p-8 border-2 border-gray-300 mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">👤 Dados Pessoais</h2>

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

              <div className="grid grid-cols-2 gap-4">
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
                  <Label className="text-gray-700 font-semibold">Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-semibold">Nacionalidade</Label>
                  <Input
                    placeholder="Brasileira"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Posição Atual</Label>
                  <Input
                    placeholder="Ex: Professor Titular, Pesquisador"
                    value={formData.currentPosition}
                    onChange={(e) => handleInputChange("currentPosition", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">Interesses de Pesquisa</Label>
                <Textarea
                  placeholder="Descreva suas áreas de interesse em pesquisa..."
                  value={formData.researchInterests}
                  onChange={(e) => handleInputChange("researchInterests", e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">Idiomas</Label>
                <Textarea
                  placeholder="Ex: Português (Nativo), Inglês (Fluente), Espanhol (Intermediário)"
                  value={formData.languages}
                  onChange={(e) => handleInputChange("languages", e.target.value)}
                  className="mt-2"
                  rows={2}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Academic and Professional Information */}
        {currentStep === 2 && (
          <div className="space-y-6 mb-8">
            {/* Education */}
            <Card className="p-8 border-2 border-gray-300">
              <button
                onClick={() => toggleSection("education")}
                className="w-full flex items-center justify-between mb-6 hover:bg-gray-50 p-2 rounded"
              >
                <h2 className="text-2xl font-bold text-blue-900">🎓 Formação Acadêmica</h2>
                {expandedSections.education ? <ChevronUp /> : <ChevronDown />}
              </button>

              {expandedSections.education && (
                <div className="space-y-6">
                  {formData.education.map((edu, index) => (
                    <div key={edu.id} className="border-l-4 border-blue-600 pl-4 pb-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="text-gray-700 font-semibold">Nível *</Label>
                          <Select value={edu.level} onValueChange={(value) => handleEducationChange(index, "level", value)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {educationLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-700 font-semibold">Status</Label>
                          <Select value={edu.status} onValueChange={(value) => handleEducationChange(index, "status", value)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-700 font-semibold">Instituição *</Label>
                        <Input
                          placeholder="Ex: Universidade de São Paulo"
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div className="mt-4">
                        <Label className="text-gray-700 font-semibold">Curso/Programa *</Label>
                        <Input
                          placeholder="Ex: Doutorado em Engenharia de Software"
                          value={edu.course}
                          onChange={(e) => handleEducationChange(index, "course", e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label className="text-gray-700 font-semibold">Ano de Início *</Label>
                          <Input
                            type="number"
                            placeholder="2020"
                            value={edu.startYear}
                            onChange={(e) => handleEducationChange(index, "startYear", e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-semibold">Ano de Conclusão *</Label>
                          <Input
                            type="number"
                            placeholder="2024"
                            value={edu.endYear}
                            onChange={(e) => handleEducationChange(index, "endYear", e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Professional Experience */}
            <Card className="p-8 border-2 border-gray-300">
              <button
                onClick={() => toggleSection("professional")}
                className="w-full flex items-center justify-between mb-6 hover:bg-gray-50 p-2 rounded"
              >
                <h2 className="text-2xl font-bold text-blue-900">💼 Atuação Profissional</h2>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addProfessionalExperience();
                    }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Adicionar
                  </Button>
                  {expandedSections.professional ? <ChevronUp /> : <ChevronDown />}
                </div>
              </button>

              {expandedSections.professional && (
                <div className="space-y-6">
                  {formData.professionalExperience.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">Nenhuma experiência profissional adicionada</p>
                  ) : (
                    formData.professionalExperience.map((prof) => (
                      <div key={prof.id} className="border-l-4 border-green-600 pl-4 pb-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-900">{prof.position || "Nova Experiência"}</h3>
                          <button
                            onClick={() => removeProfessionalExperience(prof.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <Input
                            placeholder="Instituição/Empresa"
                            value={prof.institution}
                            onChange={(e) => handleProfessionalChange(prof.id, "institution", e.target.value)}
                          />
                          <Input
                            placeholder="Cargo/Posição"
                            value={prof.position}
                            onChange={(e) => handleProfessionalChange(prof.id, "position", e.target.value)}
                          />
                          <Input
                            placeholder="Departamento/Área"
                            value={prof.department}
                            onChange={(e) => handleProfessionalChange(prof.id, "department", e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              type="date"
                              value={prof.startDate}
                              onChange={(e) => handleProfessionalChange(prof.id, "startDate", e.target.value)}
                            />
                            <Input
                              type="date"
                              value={prof.endDate}
                              onChange={(e) => handleProfessionalChange(prof.id, "endDate", e.target.value)}
                              disabled={prof.currentPosition}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`current-${prof.id}`}
                              checked={prof.currentPosition}
                              onCheckedChange={(checked) => handleProfessionalChange(prof.id, "currentPosition", checked)}
                            />
                            <Label htmlFor={`current-${prof.id}`} className="cursor-pointer">
                              Posição atual
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>

            {/* Research Projects */}
            <Card className="p-8 border-2 border-gray-300">
              <button
                onClick={() => toggleSection("research")}
                className="w-full flex items-center justify-between mb-6 hover:bg-gray-50 p-2 rounded"
              >
                <h2 className="text-2xl font-bold text-blue-900">🔬 Projetos de Pesquisa</h2>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addResearchProject();
                    }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Adicionar
                  </Button>
                  {expandedSections.research ? <ChevronUp /> : <ChevronDown />}
                </div>
              </button>

              {expandedSections.research && (
                <div className="space-y-6">
                  {formData.researchProjects.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">Nenhum projeto de pesquisa adicionado</p>
                  ) : (
                    formData.researchProjects.map((proj) => (
                      <div key={proj.id} className="border-l-4 border-purple-600 pl-4 pb-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-900">{proj.title || "Novo Projeto"}</h3>
                          <button
                            onClick={() => removeResearchProject(proj.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <Input
                            placeholder="Título do Projeto"
                            value={proj.title}
                            onChange={(e) => handleResearchProjectChange(proj.id, "title", e.target.value)}
                          />
                          <Textarea
                            placeholder="Descrição do projeto"
                            value={proj.description}
                            onChange={(e) => handleResearchProjectChange(proj.id, "description", e.target.value)}
                            rows={2}
                          />
                          <Input
                            placeholder="Seu papel no projeto"
                            value={proj.role}
                            onChange={(e) => handleResearchProjectChange(proj.id, "role", e.target.value)}
                          />
                          <Input
                            placeholder="Financiamento/Agência"
                            value={proj.funding}
                            onChange={(e) => handleResearchProjectChange(proj.id, "funding", e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              type="date"
                              value={proj.startDate}
                              onChange={(e) => handleResearchProjectChange(proj.id, "startDate", e.target.value)}
                            />
                            <Input
                              type="date"
                              value={proj.endDate}
                              onChange={(e) => handleResearchProjectChange(proj.id, "endDate", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>

            {/* Publications */}
            <Card className="p-8 border-2 border-gray-300">
              <button
                onClick={() => toggleSection("publications")}
                className="w-full flex items-center justify-between mb-6 hover:bg-gray-50 p-2 rounded"
              >
                <h2 className="text-2xl font-bold text-blue-900">📚 Publicações</h2>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addPublication();
                    }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Adicionar
                  </Button>
                  {expandedSections.publications ? <ChevronUp /> : <ChevronDown />}
                </div>
              </button>

              {expandedSections.publications && (
                <div className="space-y-6">
                  {formData.publications.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">Nenhuma publicação adicionada</p>
                  ) : (
                    formData.publications.map((pub) => (
                      <div key={pub.id} className="border-l-4 border-orange-600 pl-4 pb-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-900 text-sm">{pub.title || "Nova Publicação"}</h3>
                          <button
                            onClick={() => removePublication(pub.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <Select value={pub.type} onValueChange={(value) => handlePublicationChange(pub.id, "type", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {publicationTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Título"
                            value={pub.title}
                            onChange={(e) => handlePublicationChange(pub.id, "title", e.target.value)}
                          />
                          <Input
                            placeholder="Autores"
                            value={pub.authors}
                            onChange={(e) => handlePublicationChange(pub.id, "authors", e.target.value)}
                          />
                          <Input
                            placeholder="Revista/Conferência"
                            value={pub.venue}
                            onChange={(e) => handlePublicationChange(pub.id, "venue", e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              type="number"
                              placeholder="Ano"
                              value={pub.year}
                              onChange={(e) => handlePublicationChange(pub.id, "year", e.target.value)}
                            />
                            <Input
                              placeholder="DOI"
                              value={pub.doi}
                              onChange={(e) => handlePublicationChange(pub.id, "doi", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>

            {/* Orientations */}
            <Card className="p-8 border-2 border-gray-300">
              <button
                onClick={() => toggleSection("orientations")}
                className="w-full flex items-center justify-between mb-6 hover:bg-gray-50 p-2 rounded"
              >
                <h2 className="text-2xl font-bold text-blue-900">👨‍🎓 Orientações</h2>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addOrientation();
                    }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Adicionar
                  </Button>
                  {expandedSections.orientations ? <ChevronUp /> : <ChevronDown />}
                </div>
              </button>

              {expandedSections.orientations && (
                <div className="space-y-6">
                  {formData.orientations.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">Nenhuma orientação adicionada</p>
                  ) : (
                    formData.orientations.map((orient) => (
                      <div key={orient.id} className="border-l-4 border-pink-600 pl-4 pb-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-900">{orient.studentName || "Nova Orientação"}</h3>
                          <button
                            onClick={() => removeOrientation(orient.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <Select value={orient.type} onValueChange={(value) => handleOrientationChange(orient.id, "type", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {orientationTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Nome do Orientando"
                            value={orient.studentName}
                            onChange={(e) => handleOrientationChange(orient.id, "studentName", e.target.value)}
                          />
                          <Input
                            placeholder="Título da Dissertação/Tese"
                            value={orient.title}
                            onChange={(e) => handleOrientationChange(orient.id, "title", e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Select value={orient.status} onValueChange={(value) => handleOrientationChange(orient.id, "status", value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="Ano"
                              value={orient.year}
                              onChange={(e) => handleOrientationChange(orient.id, "year", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <Card className="p-8 border-2 border-yellow-300 bg-yellow-50 mb-8">
            <h2 className="text-2xl font-bold text-yellow-900 mb-6">⚠️ Confirmação e Termos</h2>

            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-yellow-300">
                <p className="text-gray-700 mb-4">
                  Você está prestes a enviar seu Currículo Lattes completo. Por favor, verifique se todas as informações estão corretas e atualizadas.
                </p>
                <p className="text-gray-700 font-semibold mb-4">
                  Seus dados serão analisados e você receberá um resultado sobre sua elegibilidade para o Nível 2.
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white border-2 border-yellow-300 rounded-lg">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange("termsAccepted", checked)}
                />
                <Label htmlFor="terms" className="text-gray-700 cursor-pointer">
                  <span className="font-bold">Declaro que todas as informações fornecidas são verdadeiras, precisas e atualizadas.</span> Entendo que informações falsas podem resultar em desqualificação.
                </Label>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
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
            {currentStep === 3 ? "✓ Enviar Currículo" : "Próximo →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
