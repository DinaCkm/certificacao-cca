import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useCertification } from "@/contexts/CertificationContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { BoasVindasModal } from "@/pages/novo-fluxo/BoasVindasModal";
import {
  Award, LogIn, ChevronRight, BookOpen, CheckCircle,
  Clock, FileText, CreditCard, Users, X, AlertCircle,
  ChevronLeft, ChevronRight as ChevronRightIcon
} from "lucide-react";

// ── Status labels ─────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, { label: string; cor: string; icone: React.ReactNode }> = {
  cadastro:    { label: "Cadastro em andamento",     cor: "text-blue-700 bg-blue-50 border-blue-200",      icone: <Users className="w-4 h-4" /> },
  pagamento1:  { label: "Aguardando Pagamento 1",    cor: "text-orange-700 bg-orange-50 border-orange-200", icone: <CreditCard className="w-4 h-4" /> },
  upload:      { label: "Upload de documentos",      cor: "text-purple-700 bg-purple-50 border-purple-200", icone: <FileText className="w-4 h-4" /> },
  validacao:   { label: "Aguardando validação",      cor: "text-yellow-700 bg-yellow-50 border-yellow-200", icone: <Clock className="w-4 h-4" /> },
  prova:       { label: "Prova de competência",      cor: "text-blue-700 bg-blue-50 border-blue-200",      icone: <FileText className="w-4 h-4" /> },
  agendamento: { label: "Agendar entrevista",        cor: "text-teal-700 bg-teal-50 border-teal-200",      icone: <Clock className="w-4 h-4" /> },
  entrevista:  { label: "Entrevista agendada",       cor: "text-indigo-700 bg-indigo-50 border-indigo-200", icone: <Users className="w-4 h-4" /> },
  pagamento2:  { label: "Aguardando Pagamento 2",    cor: "text-orange-700 bg-orange-50 border-orange-200", icone: <CreditCard className="w-4 h-4" /> },
  emissao:     { label: "Certificado sendo emitido", cor: "text-green-700 bg-green-50 border-green-200",    icone: <Award className="w-4 h-4" /> },
  concluido:   { label: "Certificado emitido!",      cor: "text-green-700 bg-green-50 border-green-200",    icone: <CheckCircle className="w-4 h-4" /> },
  encerrado:   { label: "Processo encerrado",        cor: "text-red-700 bg-red-50 border-red-200",          icone: <X className="w-4 h-4" /> },
};

const STATUS_ROTA: Record<string, string> = {
  cadastro: "/novo-fluxo/cadastro", pagamento1: "/novo-fluxo/pagamento-analise",
  upload: "/novo-fluxo/upload-documentos", validacao: "/novo-fluxo/aguardando-validacao",
  prova: "/novo-fluxo/prova", agendamento: "/novo-fluxo/agendamento-entrevista",
  entrevista: "/novo-fluxo/sala-entrevista", pagamento2: "/novo-fluxo/pagamento-emissao",
  emissao: "/novo-fluxo/emissao-certificado", concluido: "/novo-fluxo/emissao-certificado",
};

// ── Carrossel ─────────────────────────────────────────────────────────────────
interface CarrosselImagem { id: number; titulo: string; subtitulo: string; url_imagem: string; }

function Carrossel({ imagens }: { imagens: CarrosselImagem[] }) {
  const [atual, setAtual] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (imagens.length <= 1) return;
    timerRef.current = setInterval(() => setAtual(p => (p + 1) % imagens.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [imagens.length]);

  const ir = (idx: number) => {
    clearInterval(timerRef.current);
    setAtual(idx);
  };

  if (imagens.length === 0) {
    // Placeholder quando não há imagens
    return (
      <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="text-center text-white/60">
          <Award className="w-16 h-16 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Profissionais de sucesso ANEFAC</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-xl">
      {imagens.map((img, idx) => (
        <div key={img.id}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === atual ? "opacity-100" : "opacity-0"}`}>
          <img src={img.url_imagem} alt={img.titulo || ""} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {(img.titulo || img.subtitulo) && (
            <div className="absolute bottom-4 left-4 right-4 text-white">
              {img.titulo && <p className="font-bold text-lg leading-tight drop-shadow">{img.titulo}</p>}
              {img.subtitulo && <p className="text-sm text-white/80 mt-0.5 drop-shadow">{img.subtitulo}</p>}
            </div>
          )}
        </div>
      ))}

      {/* Controles */}
      {imagens.length > 1 && (
        <>
          <button onClick={() => ir((atual - 1 + imagens.length) % imagens.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => ir((atual + 1) % imagens.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors">
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 right-4 flex gap-1.5">
            {imagens.map((_, idx) => (
              <button key={idx} onClick={() => ir(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === atual ? "bg-white scale-125" : "bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Recuperar senha ───────────────────────────────────────────────────────────
function RecuperarSenhaModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleEnviar = async () => {
    if (!email.includes("@")) { toast({ title: "Informe um e-mail válido", variant: "destructive" }); return; }
    setCarregando(true);
    try {
      await fetch("/api/auth/recuperar-senha", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      setEnviado(true);
    } catch { toast({ title: "Erro ao enviar. Tente novamente.", variant: "destructive" }); }
    finally { setCarregando(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          {enviado ? (
            <div className="text-center">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold mb-2">E-mail enviado!</h2>
              <p className="text-sm text-gray-500 mb-6">Se este e-mail estiver cadastrado, você receberá as instruções em breve.</p>
              <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={onClose}>Voltar ao login</Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">Recuperar senha</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-gray-500 mb-5">Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha.</p>
              <div className="space-y-4">
                <div>
                  <Label>E-mail</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" onKeyDown={e => e.key === "Enter" && handleEnviar()} />
                </div>
                <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={handleEnviar} disabled={carregando}>
                  {carregando ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
                <Button variant="outline" className="w-full" onClick={onClose}>Voltar</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Login Modal ───────────────────────────────────────────────────────────────
function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (p: any) => void }) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState(""); const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false); const [erro, setErro] = useState("");
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);

  const handleLogin = async () => {
    setErro("");
    if (!email || !senha) { setErro("Preencha e-mail e senha."); return; }
    setCarregando(true);
    try {
      await login(email, senha);
      const { processo } = await (api.processo as any).retomar();
      toast({ title: processo ? `Bem-vindo de volta!` : "Login realizado!" });
      onSuccess(processo);
    } catch (err: any) { setErro(err.message || "E-mail ou senha incorretos."); }
    finally { setCarregando(false); }
  };

  if (recuperandoSenha) return <RecuperarSenhaModal onClose={() => setRecuperandoSenha(false)} />;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-lg font-bold">Área do Candidato</h2><p className="text-sm text-gray-500">Entre para continuar seu processo</p></div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          {erro && <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4"><AlertCircle className="w-4 h-4 text-red-500 shrink-0" /><p className="text-sm text-red-700">{erro}</p></div>}
          <div className="space-y-4">
            <div><Label>E-mail</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
            <div><Label>Senha</Label><Input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
            <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={handleLogin} disabled={carregando}>
              {carregando ? "Entrando..." : <><LogIn className="w-4 h-4 mr-2" />Entrar</>}
            </Button>
          </div>
          <button onClick={() => setRecuperandoSenha(true)} className="w-full text-xs text-center text-blue-600 hover:underline mt-3 block">Esqueci minha senha</button>
          <p className="text-xs text-center text-gray-400 mt-2">Ainda não tem cadastro? <button onClick={onClose} className="text-blue-700 underline">Inicie sua certificação</button></p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Painel do candidato ───────────────────────────────────────────────────────
function PainelCandidato({ processo, onNovaCertificacao }: { processo: any; onNovaCertificacao: () => void }) {
  const [, navigate] = useLocation();
  const { logout } = useAuth();
  const statusInfo = STATUS_LABEL[processo.statusGeral] || STATUS_LABEL["cadastro"];
  const rota = STATUS_ROTA[processo.statusGeral];
  const etapas = ["cadastro","pagamento1","upload","validacao","entrevista","pagamento2","concluido"];
  const etapasLabel = ["Cadastro","Pagamento 1","Documentos","Validação","Entrevista","Pagamento 2","Certificado"];
  const atualIdx = etapas.indexOf(processo.statusGeral);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4"><Award className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, {processo.candidatoNome?.split(" ")[0]}!</h1>
          <p className="text-gray-500 mt-1">Bem-vindo à sua área de candidato</p>
        </div>
        <Card className="mb-4 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Seu processo ativo</p>
            <p className="font-bold text-gray-900 text-lg mb-1">{processo.certificacaoNome}</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border mt-2 mb-5 ${statusInfo.cor}`}>
              {statusInfo.icone}{statusInfo.label}
            </div>
            <div className="space-y-2 mb-6">
              {etapas.map((_, idx) => {
                const concluida = idx < atualIdx; const ativa = idx === atualIdx;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${concluida ? "bg-green-500 text-white" : ativa ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-500"}`}>
                      {concluida ? "✓" : idx + 1}
                    </div>
                    <span className={`text-sm ${ativa ? "font-semibold text-blue-900" : concluida ? "text-gray-400 line-through" : "text-gray-400"}`}>{etapasLabel[idx]}</span>
                    {ativa && <span className="text-xs text-blue-600 font-medium">← você está aqui</span>}
                  </div>
                );
              })}
            </div>
            {rota ? (
              <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg" onClick={() => navigate(rota)}>
                Continuar processo <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button className="w-full" variant="outline" onClick={onNovaCertificacao}>Iniciar nova certificação</Button>
            )}
          </CardContent>
        </Card>
        <button onClick={() => { logout(); onNovaCertificacao(); }} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">Sair da conta</button>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function AreaCandidato() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [modalAberto, setModalAberto] = useState(false);
  const [boasVindasAberto, setBoasVindasAberto] = useState(false);
  const [processoAtivo, setProcessoAtivo] = useState<any>(null);
  const [imagens, setImagens] = useState<CarrosselImagem[]>([]);

  // Carrega imagens do carrossel
  useEffect(() => {
    fetch("/api/admin/carrossel/publico")
      .then(r => r.json())
      .then(d => setImagens(d.imagens || []))
      .catch(() => {});
  }, []);

  // Se autenticado, tenta retomar processo
  useEffect(() => {
    if (isAuthenticated) {
      (api.processo as any).retomar().then((res: any) => {
        if (res?.processo) setProcessoAtivo(res.processo);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  if (isAuthenticated && processoAtivo) {
    return <PainelCandidato processo={processoAtivo} onNovaCertificacao={() => navigate("/novo-fluxo/selecionar")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl">
            <span className="text-blue-900 font-black text-3xl">A</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">ANEFAC</h1>
          <p className="text-blue-300 text-sm mt-1">Plataforma de Certificação Profissional</p>
        </div>

        {/* Carrossel */}
        <div className="mb-6">
          <Carrossel imagens={imagens} />
        </div>

        {/* Cards de ação */}
        <div className="space-y-3 mb-4">

          {/* Quero conhecer as certificações */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
            onClick={() => setBoasVindasAberto(true)}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                  <Award className="w-6 h-6 text-blue-700" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Quero conhecer as Certificações ANEFAC</p>
                  <p className="text-sm text-gray-500 mt-0.5">Iniciar meu processo de certificação profissional</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-700 transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* Já tenho cadastro */}
          <Card className="border-2 border-blue-400 shadow-xl cursor-pointer group bg-blue-900 hover:bg-blue-800 transition-colors"
            onClick={() => setModalAberto(true)}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center shrink-0">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">Já tenho cadastro</p>
                  <p className="text-sm text-blue-300 mt-0.5">Continuar meu processo de certificação</p>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          {/* Cursos ANEFAC */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
            onClick={() => navigate("/cursos")}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">Prepare-se com os Cursos ANEFAC</p>
                  <p className="text-sm text-emerald-100 mt-0.5">Acesse nossa plataforma de desenvolvimento profissional</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-blue-400 text-xs">
          Acesso administrativo?{" "}
          <a href="/novo-fluxo/admin/login" className="text-blue-300 underline">Entrar como avaliador / gestor</a>
        </p>
      </div>

      {boasVindasAberto && (
        <BoasVindasModal open={boasVindasAberto} onClose={() => setBoasVindasAberto(false)}
          onSuccess={(dados) => {
            sessionStorage.setItem("anefac_pre_dados", JSON.stringify(dados));
            setBoasVindasAberto(false);
            navigate("/novo-fluxo/selecionar");
          }} />
      )}

      {modalAberto && (
        <LoginModal onClose={() => setModalAberto(false)}
          onSuccess={(processo) => { setModalAberto(false); if (processo) setProcessoAtivo(processo); else navigate("/novo-fluxo/selecionar"); }} />
      )}
    </div>
  );
}
