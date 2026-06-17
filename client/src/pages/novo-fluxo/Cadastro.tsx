import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCertification } from "@/contexts/CertificationContext";
import { AlertCircle, User, Mail, Phone, Building, GraduationCap, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  empresa: string;
  cargo: string;
  formacao: string;
  anosExperiencia: string;
  linkedin: string;
}

function formatCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .slice(0, 14);
}

function formatPhone(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

export function Cadastro() {
  const { processo, atualizarStatus, atualizarCandidato, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  const [form, setForm] = useState<FormData>({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    dataNascimento: "",
    empresa: "",
    cargo: "",
    formacao: "",
    anosExperiencia: "",
    linkedin: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Redirect if no certification selected
  useEffect(() => {
    if (!processo.certificacaoId) {
      navigate("/novo-fluxo");
    }
  }, [processo.certificacaoId, navigate]);

  const handleChange = (field: keyof FormData, value: string) => {
    let formatted = value;
    if (field === "cpf") formatted = formatCPF(value);
    if (field === "telefone") formatted = formatPhone(value);
    setForm((prev) => ({ ...prev, [field]: formatted }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!form.cpf || form.cpf.length < 14) newErrors.cpf = "CPF inválido";
    if (!form.email || !form.email.includes("@")) newErrors.email = "E-mail inválido";
    if (!form.telefone || form.telefone.length < 14) newErrors.telefone = "Telefone inválido";
    if (!form.empresa.trim()) newErrors.empresa = "Empresa é obrigatória";
    if (!form.cargo.trim()) newErrors.cargo = "Cargo é obrigatório";
    if (!form.formacao.trim()) newErrors.formacao = "Formação é obrigatória";
    if (!form.anosExperiencia) newErrors.anosExperiencia = "Informe os anos de experiência";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    localStorage.setItem("anefac_candidato_dados", JSON.stringify(form));
    atualizarCandidato({ candidatoNome: form.nome, candidatoEmail: form.email, candidatoCPF: form.cpf, candidatoTelefone: form.telefone, candidatoEmpresa: form.empresa, candidatoCargo: form.cargo });
    atualizarStatus("upload");
    navigate("/novo-fluxo/upload-documentos");
  };

  if (!certAtual) return null;

  return (
    <FluxoLayout
      currentStep={2}
      title="Cadastro do Candidato"
      subtitle={`Preencha seus dados para iniciar o processo da ${certAtual.nome}.`}
      backHref="/novo-fluxo"
      backLabel="← Voltar para seleção de certificação"
    >
      {/* Certification reminder */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-black text-lg">{certAtual.numero}</div>
        <div>
          <p className="text-sm font-bold text-blue-900">{certAtual.nome}</p>
          <p className="text-xs text-blue-600">{certAtual.subtitulo}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Data */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <User className="w-4 h-4 text-blue-700" />
                <h2 className="font-semibold text-foreground">Dados Pessoais</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="nome">Nome completo *</Label>
                  <Input
                    id="nome"
                    value={form.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    placeholder="Seu nome completo"
                    className={errors.nome ? "border-red-400" : ""}
                  />
                  {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={form.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                    className={errors.cpf ? "border-red-400" : ""}
                  />
                  {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
                </div>
                <div>
                  <Label htmlFor="dataNascimento">Data de nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={form.dataNascimento}
                    onChange={(e) => handleChange("dataNascimento", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="seu@email.com"
                    className={errors.email ? "border-red-400" : ""}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={form.telefone}
                    onChange={(e) => handleChange("telefone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={errors.telefone ? "border-red-400" : ""}
                  />
                  {errors.telefone && <p className="text-xs text-red-500 mt-1">{errors.telefone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Data */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Briefcase className="w-4 h-4 text-blue-700" />
                <h2 className="font-semibold text-foreground">Dados Profissionais</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="empresa">Empresa atual *</Label>
                  <Input
                    id="empresa"
                    value={form.empresa}
                    onChange={(e) => handleChange("empresa", e.target.value)}
                    placeholder="Nome da empresa"
                    className={errors.empresa ? "border-red-400" : ""}
                  />
                  {errors.empresa && <p className="text-xs text-red-500 mt-1">{errors.empresa}</p>}
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo atual *</Label>
                  <Input
                    id="cargo"
                    value={form.cargo}
                    onChange={(e) => handleChange("cargo", e.target.value)}
                    placeholder="Ex: Controller, CFO..."
                    className={errors.cargo ? "border-red-400" : ""}
                  />
                  {errors.cargo && <p className="text-xs text-red-500 mt-1">{errors.cargo}</p>}
                </div>
                <div>
                  <Label htmlFor="anosExperiencia">Anos de experiência na área *</Label>
                  <Input
                    id="anosExperiencia"
                    type="number"
                    min="0"
                    max="50"
                    value={form.anosExperiencia}
                    onChange={(e) => handleChange("anosExperiencia", e.target.value)}
                    placeholder="Ex: 5"
                    className={errors.anosExperiencia ? "border-red-400" : ""}
                  />
                  {errors.anosExperiencia && <p className="text-xs text-red-500 mt-1">{errors.anosExperiencia}</p>}
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn (opcional)</Label>
                  <Input
                    id="linkedin"
                    value={form.linkedin}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/seuperfil"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Data */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <h2 className="font-semibold text-foreground">Formação Acadêmica</h2>
              </div>
              <div>
                <Label htmlFor="formacao">Graduação / Pós-graduação *</Label>
                <Input
                  id="formacao"
                  value={form.formacao}
                  onChange={(e) => handleChange("formacao", e.target.value)}
                  placeholder="Ex: Ciências Contábeis — Universidade XYZ (2015)"
                  className={errors.formacao ? "border-red-400" : ""}
                />
                {errors.formacao && <p className="text-xs text-red-500 mt-1">{errors.formacao}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-blue-900 mb-3 text-sm">Pré-requisitos da certificação</h3>
              <ul className="space-y-2">
                {certAtual.preRequisitos.map((req) => (
                  <li key={req} className="flex items-start gap-2 text-xs text-blue-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Próxima etapa</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Após o cadastro, você deverá enviar os documentos exigidos para análise:
              </p>
              <ul className="space-y-1.5">
                {certAtual.documentosExigidos.slice(0, 3).map((doc) => (
                  <li key={doc} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                    {doc}
                  </li>
                ))}
                {certAtual.documentosExigidos.length > 3 && (
                  <li className="text-xs text-muted-foreground pl-3">
                    +{certAtual.documentosExigidos.length - 3} documentos adicionais
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              Seus dados serão utilizados exclusivamente para o processo de certificação ANEFAC.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={() => navigate("/novo-fluxo")}>
          Voltar
        </Button>
        <Button className="bg-blue-900 hover:bg-blue-800 min-w-[200px]" onClick={handleSubmit}>
          Salvar e continuar →
        </Button>
      </div>
    </FluxoLayout>
  );
}
