import React, { useState } from "react";
import { useLocation } from "wouter";
import { useCertification } from "@/contexts/CertificationContext";
import { BoasVindasModal } from "@/pages/novo-fluxo/BoasVindasModal";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, LogIn, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  Award, BookOpen, FileText, DollarSign, Clock,
  Users, ChevronDown, ChevronUp, ArrowLeft,
  ExternalLink, CheckCircle, ChevronRight
} from "lucide-react";

export function NovoFluxoCertificacoes() {
  const { certifications, selecionarCertificacao } = useCertification();
  const [, navigate] = useLocation();
  const ativas = (certifications || []).filter(c => c.status === "ativa" || c.status === "em_breve");
  const [expandida, setExpandida] = useState<number | null>(null);
  const [boasVindasAberto, setBoasVindasAberto] = useState(false);
  const [certSelecionada, setCertSelecionada] = useState<any>(null);
  const [loginAberto, setLoginAberto] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [loginCarregando, setLoginCarregando] = useState(false);
  const [loginErro, setLoginErro] = useState("");

  // Verificação de CPF logo ao clicar em "Quero me certificar" — antes de
  // mostrar qualquer ficha. Se o CPF já tiver conta, pede só a senha e leva
  // direto pra onde o candidato parou; só manda pra ficha completa se o CPF
  // for realmente novo.
  const [verificarAberto, setVerificarAberto] = useState(false);
  const [vCpf, setVCpf] = useState("");
  const [vExiste, setVExiste] = useState<boolean | null>(null);
  const [vEmail, setVEmail] = useState("");
  const [vSenha, setVSenha] = useState("");
  const [vErro, setVErro] = useState("");
  const [vCarregando, setVCarregando] = useState(false);

  const STATUS_ROTA: Record<string, string> = {
    cadastro: "/novo-fluxo/cadastro", pagamento1: "/novo-fluxo/pagamento-analise",
    upload: "/novo-fluxo/upload-documentos", validacao: "/novo-fluxo/aguardando-validacao",
    agendamento: "/novo-fluxo/aguardando-validacao", prova: "/novo-fluxo/aguardando-validacao",
    entrevista: "/novo-fluxo/aguardando-validacao", pagamento2: "/novo-fluxo/pagamento-emissao",
    emissao: "/novo-fluxo/emissao-certificado", concluido: "/novo-fluxo/emissao-certificado",
  };

  const handleVerificarCpf = async () => {
    setVErro("");
    const cpfLimpo = vCpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) { setVErro("Digite um CPF válido."); return; }
    setVCarregando(true);
    try {
      const { existe, email } = await api.auth.verificarCpf(cpfLimpo);
      if (existe) {
        setVExiste(true);
        setVEmail(email || "");
      } else {
        // CPF novo — segue o fluxo normal (mini-cadastro/LGPD/ficha completa),
        // já levando o CPF digitado pra não precisar redigitar depois.
        sessionStorage.setItem("anefac_cpf_prefill", cpfLimpo);
        setVerificarAberto(false);
        iniciarFluxoNovoCadastro();
      }
    } catch (err: any) {
      setVErro(err.message || "Erro ao verificar CPF.");
    } finally {
      setVCarregando(false);
    }
  };

  const handleEntrarEContinuar = async () => {
    setVErro("");
    if (!vSenha) { setVErro("Digite sua senha."); return; }
    setVCarregando(true);
    try {
      await login(vEmail, vSenha);
      const status = await selecionarCertificacao(certSelecionada);
      setVerificarAberto(false);
      toast({ title: "Bem-vindo de volta!", description: "Vamos te levar direto para onde você parou." });
      navigate(STATUS_ROTA[status] || "/novo-fluxo/cadastro");
    } catch (err: any) {
      setVErro(err.message || "E-mail ou senha incorretos.");
    } finally {
      setVCarregando(false);
    }
  };

  // Fluxo original para quem ainda não tem conta (CPF novo)
  const iniciarFluxoNovoCadastro = () => {
    selecionarCertificacao(certSelecionada);
    const preData = sessionStorage.getItem("anefac_pre_dados");
    if (preData) {
      const lgpdAceito = sessionStorage.getItem("anefac_lgpd_aceito");
      navigate(lgpdAceito ? "/novo-fluxo/cadastro" : "/novo-fluxo/lgpd");
      return;
    }
    setBoasVindasAberto(true);
  };

  const handleLogin = async () => {
    setLoginErro("");
    if (!loginEmail || !loginSenha) { setLoginErro("Preencha e-mail e senha."); return; }
    setLoginCarregando(true);
    try {
      await login(loginEmail, loginSenha);
      const { processo } = await (api.processo as any).retomar();
      toast({ title: "Bem-vindo de volta!" });
      setLoginAberto(false);
      if (processo) navigate("/novo-fluxo/" + (processo.statusGeral === "agendamento" ? "agendamento-entrevista" : processo.statusGeral === "validacao" ? "aguardando-validacao" : processo.statusGeral));
      else navigate("/novo-fluxo/certificacoes");
    } catch (err: any) { setLoginErro(err.message || "E-mail ou senha incorretos."); }
    finally { setLoginCarregando(false); }
  };

  const handleQueroMeCertificar = (cert: any) => {
    setCertSelecionada(cert);
    setVCpf(""); setVExiste(null); setVEmail(""); setVSenha(""); setVErro("");
    setVerificarAberto(true);
  };

  const handleBoasVindasSuccess = (dados: any) => {
    sessionStorage.setItem("anefac_pre_dados", JSON.stringify(dados));
    setBoasVindasAberto(false);
    if (certSelecionada) {
      selecionarCertificacao(certSelecionada);
      navigate("/novo-fluxo/lgpd");
    } else {
      // Sem certificação selecionada — vai para a página de certificações
      navigate("/novo-fluxo/certificacoes");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 45%, #1565c0 75%, #1976d2 100%)" }}>

      {/* Grid decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4fc3f7" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">

        {/* Header */}
        <div className="px-6 py-8">
          <div className="max-w-5xl mx-auto">

            {/* Voltar */}
            <button onClick={() => navigate("/novo-fluxo")}
              className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm mb-8">
              <ArrowLeft className="w-4 h-4" />
              Voltar à página inicial
            </button>

            {/* Logo + título */}
            <div className="text-center mb-12">
              <img src="/logo-anefac.png" alt="ANEFAC" className="h-14 mx-auto mb-5 drop-shadow-xl"
                onError={e => { (e.target as any).style.display = "none"; }} />
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Certificações <span style={{ color: "#4fc3f7" }}>ANEFAC</span>
              </h1>
              <p className="text-blue-200 text-lg max-w-2xl mx-auto leading-relaxed">
                Certificações reconhecidas pelo mercado para profissionais que buscam validar suas competências com rigor técnico e credibilidade institucional.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                {["56+ anos de credibilidade", "Processo 100% online", "Certificado reconhecido"].map(item => (
                  <div key={item} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-white/80 text-xs font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cards de certificações */}
            {ativas.length === 0 ? (
              <div className="text-center py-20">
                <Award className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">Nenhuma certificação disponível no momento.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {ativas.map((cert, idx) => (
                  <div key={cert.id} className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                    style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>

                    {/* Barra colorida no topo */}
                    <div className="h-1 w-full" style={{ background: cert.cor || "linear-gradient(to right, #6B3FA0, #1a4a9e, #0099cc)" }} />

                    <div className="p-8">
                      <div className="flex items-start gap-6 flex-wrap md:flex-nowrap">

                        {/* Badge número */}
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-lg"
                          style={{ background: cert.cor || "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
                          {cert.numero}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl font-black text-white mb-1">{cert.nome}</h2>
                          <p className="font-medium text-sm mb-3" style={{ color: "#4fc3f7" }}>{cert.subtitulo}</p>
                          <p className="text-blue-200 text-sm leading-relaxed">{cert.descricaoBreve || cert.descricao}</p>

                          {/* Taxas */}
                          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2 text-sm text-blue-200">
                              <DollarSign className="w-4 h-4 text-green-400" />
                              <span>Taxa de análise: <strong className="text-white">R$ {cert.taxaAnalise?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-blue-200">
                              <DollarSign className="w-4 h-4 text-blue-400" />
                              <span>Taxa de emissão: <strong className="text-white">R$ {cert.taxaEmissao?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Botões */}
                        <div className="flex flex-col gap-2 shrink-0 w-full md:w-56">
                          {cert.status === "em_breve" ? (
                            <span className="text-center text-sm font-bold px-5 py-3 rounded-xl bg-white/10 text-white/50 cursor-not-allowed">
                              Em breve
                            </span>
                          ) : (
                            <>
                              {/* Mais detalhes */}
                              <button onClick={() => setExpandida(expandida === idx ? null : idx)}
                                className="flex items-center justify-center gap-2 border border-white/10 text-white/40 hover:text-white/70 px-5 py-2 rounded-xl text-xs transition-colors">
                                {expandida === idx ? <><ChevronUp className="w-3 h-3" /> Ver menos</> : <><ChevronDown className="w-3 h-3" /> Mais detalhes</>}
                              </button>

                              {/* Como funciona */}
                              <button onClick={() => navigate(`/como-funciona/${cert.id}`)}
                                className="flex items-center justify-center gap-2 border border-white/20 text-blue-200 hover:text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">
                                <FileText className="w-4 h-4" />
                                Como funciona
                              </button>

                              <button onClick={() => navigate("/cursos")}
                                className="flex items-center justify-center gap-2 font-bold px-5 py-3 rounded-xl text-sm transition-all hover:scale-105"
                                style={{ background: "linear-gradient(135deg, #1B7A6B, #0f4d43)", color: "white" }}>
                                <BookOpen className="w-4 h-4" />
                                Quero me preparar
                              </button>

                              <button onClick={() => handleQueroMeCertificar(cert)}
                                className="flex items-center justify-center gap-2 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all hover:scale-105 hover:shadow-xl"
                                style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
                                <Award className="w-4 h-4" />
                                Quero me certificar
                              </button>

                              {/* Edital — só se tiver URL */}
                              {cert.editalUrl && (
                                <a href={cert.editalUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 border border-white/10 text-white/40 hover:text-white/70 px-5 py-2 rounded-xl text-xs transition-colors">
                                  <ExternalLink className="w-3 h-3" /> Edital / Comunicado
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expandido — detalhes */}
                      {expandida === idx && (
                        <div className="mt-6 pt-6 border-t border-white/10 grid md:grid-cols-2 gap-6">
                          {cert.preRequisitos?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#4fc3f7" }}>Pré-requisitos</p>
                              <ul className="space-y-2">
                                {cert.preRequisitos.map((req: string) => (
                                  <li key={req} className="flex items-start gap-2 text-sm text-blue-200">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />{req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {cert.documentosExigidos?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#4fc3f7" }}>Documentos exigidos</p>
                              <ul className="space-y-2">
                                {cert.documentosExigidos.map((doc: string) => (
                                  <li key={doc} className="flex items-start gap-2 text-sm text-blue-200">
                                    <FileText className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />{doc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cards secundários */}
            <div className="mt-10 grid md:grid-cols-2 gap-4 pb-16">

              {/* Já tenho cadastro */}
              <button onClick={() => setLoginAberto(true)}
                className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20"
                style={{ background: "linear-gradient(135deg, #8B2020 0%, #5c1414 100%)" }}>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <LogIn className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-white text-base mb-1">Já tenho cadastro</h3>
                    <p className="text-red-200 text-xs">Continue seu processo de onde parou</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Cursos preparatórios */}
              <button onClick={() => navigate("/cursos")}
                className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20"
                style={{ background: "linear-gradient(135deg, #1B7A6B 0%, #0f4d43 100%)" }}>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-white text-base mb-1">Cursos preparatórios</h3>
                    <p className="text-emerald-200 text-xs">Prepare-se com os cursos ANEFAC antes de se certificar</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* Modal de verificação de CPF — aparece assim que clica em "Quero me certificar" */}
      {verificarAberto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-1 w-full" style={{ background: "linear-gradient(to right, #050a28, #1a4a9e, #0099cc)" }} />
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Vamos começar</h2>
                  <p className="text-sm text-gray-500">
                    {vExiste ? "Você já tem uma conta com esse CPF" : "Digite seu CPF para continuar"}
                  </p>
                </div>
                <button onClick={() => setVerificarAberto(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {vErro && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">{vErro}</p>
                </div>
              )}

              {!vExiste ? (
                <div className="space-y-4">
                  <div>
                    <Label>CPF</Label>
                    <Input
                      value={vCpf}
                      onChange={(e) => setVCpf(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleVerificarCpf()}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                  <button onClick={handleVerificarCpf} disabled={vCarregando}
                    className="w-full text-white font-bold py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: "linear-gradient(to right, #050a28, #1a4a9e)" }}>
                    {vCarregando ? "Verificando..." : "Continuar"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Entre com sua senha para continuar — se você já tinha um processo em andamento, vamos te levar direto para onde parou.
                  </p>
                  <div>
                    <Label>Senha de {vEmail}</Label>
                    <Input
                      type="password"
                      value={vSenha}
                      onChange={(e) => setVSenha(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEntrarEContinuar()}
                      placeholder="••••••••"
                      autoFocus
                    />
                  </div>
                  <button onClick={handleEntrarEContinuar} disabled={vCarregando}
                    className="w-full text-white font-bold py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: "linear-gradient(to right, #050a28, #1a4a9e)" }}>
                    {vCarregando ? "Entrando..." : "Entrar e continuar"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de login */}
      {loginAberto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-1 w-full" style={{ background: "linear-gradient(to right, #050a28, #1a4a9e, #0099cc)" }} />
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Área do Candidato</h2>
                  <p className="text-sm text-gray-500">Entre para continuar seu processo</p>
                </div>
                <button onClick={() => setLoginAberto(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {loginErro && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">{loginErro}</p>
                </div>
              )}
              <div className="space-y-4">
                <div><Label>E-mail</Label><Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="seu@email.com" onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
                <div><Label>Senha</Label><Input type="password" value={loginSenha} onChange={e => setLoginSenha(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
                <button onClick={handleLogin} disabled={loginCarregando}
                  className="w-full text-white font-bold py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(to right, #050a28, #1a4a9e)" }}>
                  {loginCarregando ? "Entrando..." : "Entrar"}
                </button>
              </div>
              <p className="text-xs text-center text-gray-400 mt-4">
                Ainda não tem cadastro?{" "}
                <button onClick={() => { setLoginAberto(false); setBoasVindasAberto(true); }} className="text-blue-700 underline">
                  Inicie sua certificação
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mini-cadastro */}
      {boasVindasAberto && (
        <BoasVindasModal
          open={boasVindasAberto}
          onClose={() => setBoasVindasAberto(false)}
          onSuccess={handleBoasVindasSuccess}
          cpfVerificado={vCpf.replace(/\D/g, "")}
        />
      )}
    </div>
  );
}
