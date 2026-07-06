import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCertification } from "@/contexts/CertificationContext";
import { AlertCircle, User, Mail, Phone, Building, GraduationCap, Briefcase, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, setToken } from "@/lib/api";

interface FormData {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  telefone: string;
  dataNascimento: string;
  empresa: string;
  cargo: string;
  formacao: string;
  anosExperiencia: string;
  linkedin: string;
  confirmarSenha: string;
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

  const preData = (() => { try { return JSON.parse(sessionStorage.getItem("anefac_pre_dados") || "null"); } catch { return null; } })();
  const cpfPreVerificado = sessionStorage.getItem("anefac_cpf_prefill") || "";

  const [form, setForm] = useState<FormData>({
    nome: preData?.nome || "",
    cpf: preData?.cpf || cpfPreVerificado || "",
    email: preData?.email || "",
    senha: preData?.senha || "",
    telefone: "",
    dataNascimento: "",
    empresa: "",
    cargo: "",
    formacao: "",
    anosExperiencia: "",
    linkedin: "",
    confirmarSenha: "",
  });

  // Se o candidato já está logado (ex: voltou pra iniciar outra certificação,
  // ou acabou de entrar pelo card de "já tenho conta"), traz os dados que ele
  // já informou antes — nome, CPF, e-mail, telefone e também os profissionais
  // (empresa, cargo, formação etc.), que agora ficam salvos no perfil dele,
  // não mais perdidos no localStorage de outro navegador.
  useEffect(() => {
    if (!localStorage.getItem("anefac_token")) return;
    api.auth.me().then(({ user }: any) => {
      setForm((prev) => ({
        ...prev,
        nome: user.full_name || prev.nome,
        cpf: user.cpf || prev.cpf,
        email: user.email || prev.email,
        telefone: user.phone || prev.telefone,
        empresa: user.company || prev.empresa,
        cargo: user.job_title || prev.cargo,
        formacao: user.education || prev.formacao,
        anosExperiencia: user.experience_years || prev.anosExperiencia,
        linkedin: user.linkedin_url || prev.linkedin,
      }));
    }).catch(() => {});
  }, []);

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Quando o e-mail/CPF já tem conta, oferece login ali mesmo em vez de
  // deixar a pessoa travada — ela pode ter se cadastrado antes e não ter
  // concluído o processo.
  const [jaCadastrado, setJaCadastrado] = useState(false);
  const [motivoDuplicado, setMotivoDuplicado] = useState("");
  const [senhaLogin, setSenhaLogin] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [entrandoLogin, setEntrandoLogin] = useState(false);

  useEffect(() => {
    if (!processo.certificacaoId) navigate("/novo-fluxo");
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
    if (!form.senha || form.senha.length < 8) newErrors.senha = "Senha deve ter no mínimo 8 caracteres";
    if (!form.confirmarSenha) newErrors.confirmarSenha = "Confirme sua senha";
    else if (form.senha !== form.confirmarSenha) newErrors.confirmarSenha = "As senhas não coincidem";
    if (!form.confirmarSenha) newErrors.confirmarSenha = "Confirme sua senha";
    else if (form.senha !== form.confirmarSenha) newErrors.confirmarSenha = "As senhas não conferem";
    if (!form.telefone || form.telefone.length < 14) newErrors.telefone = "Telefone inválido";
    if (!form.empresa.trim()) newErrors.empresa = "Empresa é obrigatória";
    if (!form.cargo.trim()) newErrors.cargo = "Cargo é obrigatório";
    if (!form.formacao.trim()) newErrors.formacao = "Formação é obrigatória";
    if (!form.anosExperiencia) newErrors.anosExperiencia = "Informe os anos de experiência";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Continuação comum após ter um token válido (seja de registro novo ou
  // de login em uma conta já existente).
  const continuarComToken = async (token: string, userId: number | null) => {
    setToken(token);

    sessionStorage.removeItem("anefac_pre_dados");

    if (sessionStorage.getItem("anefac_lgpd_aceito")) {
      fetch("/api/admin/lgpd/aceite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("anefac_token")}`,
        },
      }).catch(() => {});
      sessionStorage.removeItem("anefac_lgpd_aceito");
    }

    atualizarCandidato({
      candidatoNome: form.nome,
      candidatoEmail: form.email,
      candidatoCPF: form.cpf,
      candidatoTelefone: form.telefone,
      candidatoEmpresa: form.empresa,
      candidatoCargo: form.cargo,
    });
    atualizarStatus("pagamento1");

    // Dados profissionais são do CANDIDATO, não da certificação — salvos no
    // perfil dele no banco, valem pra qualquer certificação que ele inicie
    // depois (evita ter que redigitar tudo de novo).
    api.auth.atualizarPerfil({
      full_name: form.nome,
      phone: form.telefone,
      company: form.empresa,
      job_title: form.cargo,
      education: form.formacao,
      experience_years: form.anosExperiencia,
      linkedin_url: form.linkedin,
    }).catch(() => {});

    sessionStorage.removeItem("anefac_cpf_prefill");
    localStorage.setItem("anefac_candidato_dados", JSON.stringify({ ...form, userId }));

    toast({
      title: "Cadastro realizado com sucesso!",
      description: "Seus dados foram salvos. Prossiga para o pagamento.",
    });

    navigate("/novo-fluxo/pagamento-analise");
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setEnviando(true);
    try {
      const { token, userId } = await api.auth.register({
        email: form.email,
        password: form.senha,
        full_name: form.nome,
        cpf: form.cpf.replace(/\D/g, ""),
        phone: form.telefone,
      });
      await continuarComToken(token, userId);
    } catch (err: any) {
      const msg = err.message || "Erro ao realizar cadastro";
      if (msg.includes("cadastrado") || msg.includes("já existe")) {
        // Não deixa a pessoa travada — ela pode ter começado antes e não
        // concluído. Oferece login ali mesmo, com o e-mail já preenchido.
        // A mensagem já vem específica do backend (e-mail x CPF x ambos).
        setJaCadastrado(true);
        setMotivoDuplicado(msg);
        toast({
          title: msg,
          description: "Se essa conta é sua, entre com sua senha logo abaixo para continuar.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Erro no cadastro", description: msg, variant: "destructive" });
      }
    } finally {
      setEnviando(false);
    }
  };

  // Login inline quando o e-mail/CPF já tem conta. Como agora um candidato
  // pode ter várias certificações em andamento ao mesmo tempo, só verificamos
  // se já existe processo PARA ESTA certificação específica — não mexe em
  // nenhuma outra que ele já tenha iniciado.
  const handleLoginInline = async () => {
    setErroLogin("");
    if (!senhaLogin) { setErroLogin("Digite sua senha."); return; }
    setEntrandoLogin(true);
    try {
      const { token } = await api.auth.login(form.email, senhaLogin);
      setToken(token);

      const { processo } = await api.processo.retomar(certAtual?.id);

      if (processo) {
        const STATUS_ROTA: Record<string, string> = {
          cadastro: "/novo-fluxo/cadastro", pagamento1: "/novo-fluxo/pagamento-analise",
          upload: "/novo-fluxo/upload-documentos", validacao: "/novo-fluxo/aguardando-validacao",
          agendamento: "/novo-fluxo/aguardando-validacao", prova: "/novo-fluxo/aguardando-validacao",
          entrevista: "/novo-fluxo/aguardando-validacao", pagamento2: "/novo-fluxo/pagamento-emissao",
          emissao: "/novo-fluxo/emissao-certificado", concluido: "/novo-fluxo/emissao-certificado",
        };
        toast({
          title: `Você já tem um processo em andamento para ${processo.certificacaoNome}`,
          description: "Vamos te levar direto para onde você parou.",
        });
        navigate(STATUS_ROTA[processo.statusGeral] || "/novo-fluxo");
        return;
      }

      // Sem processo ativo para ESTA certificação — inicia um novo,
      // independente de outras certificações que essa conta já tenha
      await continuarComToken(token, null);
    } catch (err: any) {
      setErroLogin(err.message || "E-mail ou senha incorretos.");
    } finally {
      setEntrandoLogin(false);
    }
  };

  if (!certAtual) return null;

  return (
    <FluxoLayout
      currentStep={1}
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
                  <Input id="nome" value={form.nome} onChange={(e) => handleChange("nome", e.target.value)} placeholder="Seu nome completo" className={errors.nome ? "border-red-400" : ""} />
                  {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input id="cpf" value={form.cpf} onChange={(e) => handleChange("cpf", e.target.value)} placeholder="000.000.000-00" className={errors.cpf ? "border-red-400" : ""} />
                  {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
                </div>
                <div>
                  <Label htmlFor="dataNascimento">Data de nascimento</Label>
                  <Input id="dataNascimento" type="date" value={form.dataNascimento} onChange={(e) => handleChange("dataNascimento", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="seu@email.com" className={errors.email ? "border-red-400" : ""} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input id="telefone" value={form.telefone} onChange={(e) => handleChange("telefone", e.target.value)} placeholder="(11) 99999-9999" className={errors.telefone ? "border-red-400" : ""} />
                  {errors.telefone && <p className="text-xs text-red-500 mt-1">{errors.telefone}</p>}
                </div>
                <div>
                  <Label htmlFor="senha">Senha de acesso *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="senha" type={mostrarSenha ? "text" : "password"} value={form.senha} onChange={(e) => handleChange("senha", e.target.value)} placeholder="Mínimo 8 caracteres" className={`pl-9 pr-10 ${errors.senha ? "border-red-400" : ""}`} />
                    <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.senha && <p className="text-xs text-red-500 mt-1">{errors.senha}</p>}
                </div>
                <div>
                  <Label htmlFor="confirmarSenha">Confirmar senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="confirmarSenha" type={mostrarConfirmar ? "text" : "password"} value={form.confirmarSenha} onChange={(e) => handleChange("confirmarSenha", e.target.value)} placeholder="Repita a senha" className={`pl-9 pr-10 ${errors.confirmarSenha ? "border-red-400" : ""}`} />
                    <button type="button" onClick={() => setMostrarConfirmar(!mostrarConfirmar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {mostrarConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmarSenha && <p className="text-xs text-red-500 mt-1">{errors.confirmarSenha}</p>}
                  <p className="text-xs text-muted-foreground mt-1">Você usará esta senha para acompanhar seu processo.</p>
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
                  <Input id="empresa" value={form.empresa} onChange={(e) => handleChange("empresa", e.target.value)} placeholder="Nome da empresa" className={errors.empresa ? "border-red-400" : ""} />
                  {errors.empresa && <p className="text-xs text-red-500 mt-1">{errors.empresa}</p>}
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo atual *</Label>
                  <Input id="cargo" value={form.cargo} onChange={(e) => handleChange("cargo", e.target.value)} placeholder="Ex: Controller, CFO..." className={errors.cargo ? "border-red-400" : ""} />
                  {errors.cargo && <p className="text-xs text-red-500 mt-1">{errors.cargo}</p>}
                </div>
                <div>
                  <Label htmlFor="anosExperiencia">Anos de experiência na área *</Label>
                  <Input id="anosExperiencia" type="number" min="0" max="50" value={form.anosExperiencia} onChange={(e) => handleChange("anosExperiencia", e.target.value)} placeholder="Ex: 5" className={errors.anosExperiencia ? "border-red-400" : ""} />
                  {errors.anosExperiencia && <p className="text-xs text-red-500 mt-1">{errors.anosExperiencia}</p>}
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn (opcional)</Label>
                  <Input id="linkedin" value={form.linkedin} onChange={(e) => handleChange("linkedin", e.target.value)} placeholder="linkedin.com/in/seuperfil" />
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
                <Input id="formacao" value={form.formacao} onChange={(e) => handleChange("formacao", e.target.value)} placeholder="Ex: Ciências Contábeis — Universidade XYZ (2015)" className={errors.formacao ? "border-red-400" : ""} />
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
              <p className="text-xs text-muted-foreground mb-3">Após o cadastro, você realizará o pagamento da taxa de análise documental:</p>
              <ul className="space-y-1.5">
                {certAtual.documentosExigidos.slice(0, 3).map((doc) => (
                  <li key={doc} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                    {doc}
                  </li>
                ))}
                {certAtual.documentosExigidos.length > 3 && (
                  <li className="text-xs text-muted-foreground pl-3">+{certAtual.documentosExigidos.length - 3} documentos adicionais</li>
                )}
              </ul>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">Seus dados serão utilizados exclusivamente para o processo de certificação ANEFAC e armazenados com segurança.</p>
          </div>

          {jaCadastrado && (
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-blue-700" />
                  <h3 className="font-semibold text-blue-900 text-sm">{motivoDuplicado || "Você já tem uma conta com esse e-mail ou CPF"}</h3>
                </div>
                <p className="text-xs text-blue-700 mb-4">
                  Entre com sua senha para continuar — se você já tinha um processo em andamento, vamos te levar direto para onde parou.
                </p>
                <div className="flex gap-3 items-end flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs">Senha de {form.email}</Label>
                    <Input
                      type="password"
                      value={senhaLogin}
                      onChange={(e) => setSenhaLogin(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLoginInline()}
                      placeholder="••••••••"
                    />
                  </div>
                  <Button onClick={handleLoginInline} disabled={entrandoLogin} className="bg-blue-900 hover:bg-blue-800">
                    {entrandoLogin ? "Entrando..." : "Entrar e continuar"}
                  </Button>
                </div>
                {erroLogin && <p className="text-xs text-red-600 mt-2">{erroLogin}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={() => navigate("/novo-fluxo")} disabled={enviando}>
          Voltar
        </Button>
        <Button className="bg-blue-900 hover:bg-blue-800 min-w-[200px]" onClick={handleSubmit} disabled={enviando}>
          {enviando ? "Salvando..." : "Salvar e continuar →"}
        </Button>
      </div>
    </FluxoLayout>
  );
}
