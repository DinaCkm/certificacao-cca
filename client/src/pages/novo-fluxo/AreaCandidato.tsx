import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { BoasVindasModal } from "@/pages/novo-fluxo/BoasVindasModal";
import { useCertification } from "@/contexts/CertificationContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  LogIn, X, AlertCircle, CheckCircle, Clock,
  FileText, Award, CreditCard, Users, ChevronRight
} from "lucide-react";

// ── Mapa de status para exibição ──────────────────────────────────────────────

const STATUS_LABEL: Record<string, { label: string; cor: string; icone: React.ReactNode }> = {
  cadastro:   { label: "Cadastro em andamento",      cor: "text-blue-700 bg-blue-50 border-blue-200",    icone: <Users className="w-4 h-4" /> },
  pagamento1: { label: "Aguardando Pagamento 1",     cor: "text-orange-700 bg-orange-50 border-orange-200", icone: <CreditCard className="w-4 h-4" /> },
  upload:     { label: "Upload de documentos",       cor: "text-purple-700 bg-purple-50 border-purple-200", icone: <FileText className="w-4 h-4" /> },
  validacao:  { label: "Aguardando validação",       cor: "text-yellow-700 bg-yellow-50 border-yellow-200", icone: <Clock className="w-4 h-4" /> },
  prova:      { label: "Prova de competência",       cor: "text-blue-700 bg-blue-50 border-blue-200",    icone: <FileText className="w-4 h-4" /> },
  agendamento:{ label: "Agendar entrevista",         cor: "text-teal-700 bg-teal-50 border-teal-200",    icone: <Clock className="w-4 h-4" /> },
  entrevista: { label: "Entrevista agendada",        cor: "text-indigo-700 bg-indigo-50 border-indigo-200", icone: <Users className="w-4 h-4" /> },
  pagamento2: { label: "Aguardando Pagamento 2",     cor: "text-orange-700 bg-orange-50 border-orange-200", icone: <CreditCard className="w-4 h-4" /> },
  emissao:    { label: "Certificado sendo emitido",  cor: "text-green-700 bg-green-50 border-green-200",  icone: <Award className="w-4 h-4" /> },
  concluido:  { label: "Certificado emitido!",       cor: "text-green-700 bg-green-50 border-green-200",  icone: <CheckCircle className="w-4 h-4" /> },
  encerrado:  { label: "Processo encerrado",         cor: "text-red-700 bg-red-50 border-red-200",       icone: <X className="w-4 h-4" /> },
};

const STATUS_ROTA: Record<string, string> = {
  cadastro:    "/novo-fluxo/cadastro",
  pagamento1:  "/novo-fluxo/pagamento-analise",
  upload:      "/novo-fluxo/upload-documentos",
  validacao:   "/novo-fluxo/aguardando-validacao",
  prova:       "/novo-fluxo/prova",
  agendamento: "/novo-fluxo/agendamento-entrevista",
  entrevista:  "/novo-fluxo/sala-entrevista",
  pagamento2:  "/novo-fluxo/pagamento-emissao",
  emissao:     "/novo-fluxo/emissao-certificado",
  concluido:   "/novo-fluxo/emissao-certificado",
};

// ── Modal de Login do Candidato ───────────────────────────────────────────────

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (processo: any) => void;
}

function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);

  const handleLogin = async () => {
    setErro("");
    if (!email || !senha) { setErro("Preencha e-mail e senha."); return; }

    setCarregando(true);
    try {
      await login(email, senha);

      // Busca processo ativo do candidato
      const { processo } = await (api.processo as any).retomar();

      if (processo) {
        toast({ title: `Bem-vindo de volta, ${processo.candidatoNome?.split(" ")[0]}!` });
        onSuccess(processo);
      } else {
        toast({ title: "Login realizado!", description: "Você não tem processo ativo. Inicie uma nova certificação." });
        onSuccess(null);
      }
    } catch (err: any) {
      setErro(err.message || "E-mail ou senha incorretos.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Área do Candidato</h2>
              <p className="text-sm text-gray-500 mt-0.5">Entre para continuar seu processo</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {erro && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{erro}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" value={senha} onChange={e => setSenha(e.target.value)}
                placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={handleLogin} disabled={carregando}>
              {carregando ? "Entrando..." : <><LogIn className="w-4 h-4 mr-2" /> Entrar</>}
            </Button>
          </div>

          <button onClick={() => setRecuperandoSenha(true)} className="w-full text-xs text-center text-blue-600 hover:underline mt-2">
            Esqueci minha senha
          </button>
          <p className="text-xs text-center text-gray-400 mt-2">
            Ainda não tem cadastro?{" "}
            <button onClick={onClose} className="text-blue-700 underline">
              Inicie sua certificação
            </button>
          </p>
          {recuperandoSenha && <RecuperarSenhaModal onClose={() => setRecuperandoSenha(false)} />}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Painel do candidato após login ────────────────────────────────────────────

interface PainelCandidatoProps {
  processo: any;
  onNovaCertificacao: () => void;
}

function PainelCandidato({ processo, onNovaCertificacao }: PainelCandidatoProps) {
  const [, navigate] = useLocation();
  const { logout } = useAuth();
  const statusInfo = STATUS_LABEL[processo.statusGeral] || STATUS_LABEL["cadastro"];
  const rota = STATUS_ROTA[processo.statusGeral];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {processo.candidatoNome?.split(" ")[0]}!
          </h1>
          <p className="text-gray-500 mt-1">Bem-vindo à sua área de candidato</p>
        </div>

        {/* Processo ativo */}
        <Card className="mb-4 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Seu processo ativo
            </p>
            <p className="font-bold text-gray-900 text-lg mb-1">{processo.certificacaoNome}</p>

            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border mt-2 mb-5 ${statusInfo.cor}`}>
              {statusInfo.icone}
              {statusInfo.label}
            </div>

            {/* Progresso visual */}
            <div className="space-y-2 mb-6">
              {[
                { key: "cadastro",   label: "Cadastro" },
                { key: "pagamento1", label: "Pagamento 1" },
                { key: "upload",     label: "Documentos" },
                { key: "validacao",  label: "Validação" },
                { key: "entrevista", label: "Entrevista" },
                { key: "pagamento2", label: "Pagamento 2" },
                { key: "concluido",  label: "Certificado" },
              ].map((etapa, idx) => {
                const etapas = ["cadastro","pagamento1","upload","validacao","entrevista","pagamento2","concluido"];
                const atual = etapas.indexOf(processo.statusGeral);
                const etapaIdx = etapas.indexOf(etapa.key);
                const concluida = etapaIdx < atual;
                const ativa = etapaIdx === atual;

                return (
                  <div key={etapa.key} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
                      ${concluida ? "bg-green-500 text-white" : ativa ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-500"}`}>
                      {concluida ? "✓" : idx + 1}
                    </div>
                    <span className={`text-sm ${ativa ? "font-semibold text-blue-900" : concluida ? "text-gray-500 line-through" : "text-gray-400"}`}>
                      {etapa.label}
                    </span>
                    {ativa && <span className="text-xs text-blue-600 font-medium">← você está aqui</span>}
                  </div>
                );
              })}
            </div>

            {rota ? (
              <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg"
                onClick={() => navigate(rota)}>
                Continuar processo <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button className="w-full" variant="outline" onClick={onNovaCertificacao}>
                Iniciar nova certificação
              </Button>
            )}
          </CardContent>
        </Card>

        <button onClick={() => { logout(); onNovaCertificacao(); }}
          className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">
          Sair da conta
        </button>
      </div>
    </div>
  );
}

// ── Componente principal exportado ────────────────────────────────────────────

export function AreaCandidato() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { atualizarCandidato, selecionarCertificacao, getCertificacaoAtual } = useCertification();
  const [modalAberto, setModalAberto] = useState(false);
  const [boasVindasAberto, setBoasVindasAberto] = useState(false);
  const [processoAtivo, setProcessoAtivo] = useState<any>(null);

  // Se já autenticado, tenta retomar o processo
  useEffect(() => {
    if (isAuthenticated) {
      (api.processo as any).retomar().then((res: any) => {
        if (res?.processo) setProcessoAtivo(res.processo);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  function handleLoginSuccess(processo: any) {
    setModalAberto(false);
    if (processo) {
      setProcessoAtivo(processo);
    } else {
      navigate("/novo-fluxo/selecionar");
    }
  }

  // Se tem processo ativo → mostra painel
  if (isAuthenticated && processoAtivo) {
    return <PainelCandidato processo={processoAtivo} onNovaCertificacao={() => navigate("/novo-fluxo/selecionar")} />;
  }

  // Página de entrada
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        {/* Logo */}
        <div className="mb-10">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl">
            <span className="text-blue-900 font-black text-3xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ANEFAC</h1>
          <p className="text-blue-300">Plataforma de Certificação Profissional</p>
        </div>

        {/* Dois caminhos */}
        <div className="space-y-4">
          {/* Candidato novo */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
            onClick={() => setBoasVindasAberto(true)}>
            <CardContent className="p-6 text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-blue-700" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-base">Quero me certificar</p>
                  <p className="text-sm text-gray-500 mt-0.5">Iniciar novo processo de certificação ANEFAC</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Candidato existente */}
          <Card className="border-2 border-blue-400 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer bg-blue-900"
            onClick={() => setModalAberto(true)}>
            <CardContent className="p-6 text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center shrink-0">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-base">Já tenho cadastro</p>
                  <p className="text-sm text-blue-300 mt-0.5">Continuar meu processo de certificação</p>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-blue-400 text-xs mt-8">
          Acesso administrativo?{" "}
          <a href="/novo-fluxo/admin/login" className="text-blue-300 underline">
            Entrar como avaliador / gestor
          </a>
        </p>
      </div>

      {/* Modal de boas-vindas */}
      {boasVindasAberto && (
        <BoasVindasModal
          open={boasVindasAberto}
          onClose={() => setBoasVindasAberto(false)}
          onSuccess={(dados) => {
            sessionStorage.setItem("anefac_pre_dados", JSON.stringify(dados));
            setBoasVindasAberto(false);
            navigate("/novo-fluxo/selecionar");
          }}
        />
      )}

      {/* Modal de login */}
      {modalAberto && (
        <LoginModal onClose={() => setModalAberto(false)} onSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

// Componente de recuperação de senha — usado dentro do LoginModal
export function RecuperarSenhaModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleEnviar = async () => {
    if (!email || !email.includes("@")) {
      toast({ title: "Informe um e-mail válido", variant: "destructive" });
      return;
    }
    setCarregando(true);
    try {
      await fetch("/api/auth/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setEnviado(true);
    } catch {
      toast({ title: "Erro ao enviar. Tente novamente.", variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  };

  if (enviado) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">E-mail enviado!</h2>
            <p className="text-sm text-gray-500 mb-6">Se este e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha em breve.</p>
            <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={onClose}>Voltar ao login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recuperar senha</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-gray-500 mb-5">Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha.</p>
          <div className="space-y-4">
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" onKeyDown={e => e.key === "Enter" && handleEnviar()} />
            </div>
            <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={handleEnviar} disabled={carregando}>
              {carregando ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>Voltar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
