import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { BoasVindasModal } from "@/pages/novo-fluxo/BoasVindasModal";
import {
  Award, LogIn, ChevronRight, BookOpen, CheckCircle,
  Clock, FileText, CreditCard, Users, X, AlertCircle,
  ChevronLeft, Plus
} from "lucide-react";

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
  agendamento: "/novo-fluxo/aguardando-validacao", prova: "/novo-fluxo/aguardando-validacao",
  entrevista: "/novo-fluxo/aguardando-validacao", pagamento2: "/novo-fluxo/pagamento-emissao",
  emissao: "/novo-fluxo/emissao-certificado", concluido: "/novo-fluxo/emissao-certificado",
};

interface CarrosselImagem { id: number; titulo: string; subtitulo: string; url_imagem: string; }

function Carrossel({ imagens }: { imagens: CarrosselImagem[] }) {
  const [atual, setAtual] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (imagens.length <= 1) return;
    timerRef.current = setInterval(() => setAtual(p => (p + 1) % imagens.length), 15000);
    return () => clearInterval(timerRef.current);
  }, [imagens.length]);

  const ir = (idx: number) => {
    clearInterval(timerRef.current);
    setAtual(idx);
    if (imagens.length > 1) {
      timerRef.current = setInterval(() => setAtual(p => (p + 1) % imagens.length), 15000);
    }
  };

  if (imagens.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="text-center text-white/30">
          <Award className="w-24 h-24 mx-auto mb-4 opacity-20" />
          <p className="text-sm opacity-40">Profissionais de sucesso ANEFAC</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {imagens.map((img, idx) => (
        <div key={img.id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === atual ? "opacity-100" : "opacity-0"}`}>
          <img src={img.url_imagem} alt={img.titulo || ""} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(5,10,40,0.85) 0%, rgba(5,10,40,0.4) 50%, rgba(5,10,40,0.1) 100%)" }} />
          {(img.titulo || img.subtitulo) && (
            <div className="absolute bottom-8 left-8 right-1/2 text-white">
              {img.titulo && <p className="font-bold text-2xl leading-tight drop-shadow-lg">{img.titulo}</p>}
              {img.subtitulo && <p className="text-sm text-white/80 mt-1 drop-shadow">{img.subtitulo}</p>}
            </div>
          )}
        </div>
      ))}
      {imagens.length > 1 && (
        <>
          <button onClick={() => ir((atual - 1 + imagens.length) % imagens.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all border border-white/20">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => ir((atual + 1) % imagens.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all border border-white/20">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {imagens.map((_, idx) => (
              <button key={idx} onClick={() => ir(idx)}
                className={`transition-all rounded-full ${idx === atual ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RecuperarSenhaModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState(""); const [enviado, setEnviado] = useState(false); const [carregando, setCarregando] = useState(false);
  const handleEnviar = async () => {
    if (!email.includes("@")) { toast({ title: "Informe um e-mail válido", variant: "destructive" }); return; }
    setCarregando(true);
    try { await fetch("/api/auth/recuperar-senha", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); setEnviado(true); }
    catch { toast({ title: "Erro ao enviar. Tente novamente.", variant: "destructive" }); }
    finally { setCarregando(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          {enviado ? (
            <div className="text-center">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold mb-2">E-mail enviado!</h2>
              <p className="text-sm text-gray-500 mb-6">Se este e-mail estiver cadastrado, você receberá as instruções em breve.</p>
              <Button className="w-full" style={{ background: "#0a1f5e" }} onClick={onClose}>Voltar ao login</Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">Recuperar senha</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-gray-500 mb-5">Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha.</p>
              <div className="space-y-4">
                <div><Label>E-mail</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" onKeyDown={e => e.key === "Enter" && handleEnviar()} /></div>
                <Button className="w-full" style={{ background: "#0a1f5e" }} onClick={handleEnviar} disabled={carregando}>{carregando ? "Enviando..." : "Enviar link de recuperação"}</Button>
                <Button variant="outline" className="w-full" onClick={onClose}>Voltar</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (p: any) => void }) {
  const { login } = useAuth(); const { toast } = useToast();
  const [email, setEmail] = useState(""); const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false); const [erro, setErro] = useState("");
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);
  const handleLogin = async () => {
    setErro(""); if (!email || !senha) { setErro("Preencha e-mail e senha."); return; }
    setCarregando(true);
    try {
      await login(email, senha);

      // Verifica o role do usuário logado
      const meRes = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("anefac_token")}` }
      });
      const meData = await meRes.json();
      const rolesAdmin = ["administrador", "gestor_n1", "gestor_n2", "avaliador", "entrevistador"];

      if (rolesAdmin.includes(meData.user?.role)) {
        // É admin — redireciona para área administrativa
        setErro("");
        window.location.href = "/novo-fluxo/admin";
        return;
      }

      // É candidato — segue normalmente (pode ter várias certificações ativas)
      const { processos } = await (api.processo as any).meus();
      onSuccess(processos || []);
    } catch (err: any) { setErro(err.message || "E-mail ou senha incorretos."); }
    finally { setCarregando(false); }
  };
  if (recuperandoSenha) return <RecuperarSenhaModal onClose={() => setRecuperandoSenha(false)} />;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
        <div className="h-2 w-full" style={{ background: "linear-gradient(to right, #0a1f5e, #1a4a9e, #0099cc)" }} />
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Área do Candidato</h2>
              <p className="text-sm text-gray-500">Entre para continuar seu processo</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          {erro && <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4"><AlertCircle className="w-4 h-4 text-red-500 shrink-0" /><p className="text-sm text-red-700">{erro}</p></div>}
          <div className="space-y-4">
            <div><Label>E-mail</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
            <div><Label>Senha</Label><Input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
            <Button className="w-full" style={{ background: "linear-gradient(to right, #0a1f5e, #1a4a9e)" }} onClick={handleLogin} disabled={carregando}>
              {carregando ? "Entrando..." : <><LogIn className="w-4 h-4 mr-2" />Entrar</>}
            </Button>
          </div>
          <button onClick={() => setRecuperandoSenha(true)} className="w-full text-xs text-center mt-3 block" style={{ color: "#1a4a9e" }}>Esqueci minha senha</button>
          <p className="text-xs text-center text-gray-400 mt-2">Ainda não tem cadastro? <button onClick={onClose} className="underline" style={{ color: "#1a4a9e" }}>Inicie sua certificação</button></p>
          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">É avaliador, gestor ou administrador?</p>
            <a href="/novo-fluxo/admin/login" className="text-xs font-medium underline" style={{ color: "#6B3FA0" }}>
              Acesse a área administrativa →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CertificacaoAtivaCard({ processo }: { processo: any }) {
  const [, navigate] = useLocation();
  const statusInfo = STATUS_LABEL[processo.statusGeral] || STATUS_LABEL["cadastro"];
  const rota = STATUS_ROTA[processo.statusGeral];
  const etapas = ["cadastro","pagamento1","upload","validacao","entrevista","pagamento2","concluido"];
  const etapasLabel = ["Cadastro","Pagamento 1","Documentos","Validação","Entrevista","Pagamento 2","Certificado"];
  const atualIdx = etapas.indexOf(processo.statusGeral);
  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      <div className="h-1 w-full" style={{ background: "linear-gradient(to right, #0a1f5e, #1a4a9e, #0099cc)" }} />
      <CardContent className="p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Certificação</p>
        <p className="font-bold text-gray-900 text-lg leading-tight">{processo.certificacaoNome}</p>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border mt-2 mb-5 ${statusInfo.cor}`}>
          {statusInfo.icone}{statusInfo.label}
        </div>
        <div className="space-y-2 mb-6">
          {etapas.map((_, idx) => {
            const concluida = idx < atualIdx; const ativa = idx === atualIdx;
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${concluida ? "text-white" : ativa ? "text-white" : "bg-gray-200 text-gray-500"}`}
                  style={concluida ? { background: "#1a4a9e" } : ativa ? { background: "linear-gradient(135deg, #0a1f5e, #1a4a9e)" } : {}}>
                  {concluida ? "✓" : idx + 1}
                </div>
                <span className={`text-sm ${ativa ? "font-semibold" : concluida ? "text-gray-400 line-through" : "text-gray-400"}`}
                  style={ativa ? { color: "#0a1f5e" } : {}}>{etapasLabel[idx]}</span>
                {ativa && <span className="text-xs font-medium" style={{ color: "#1a4a9e" }}>← você está aqui</span>}
              </div>
            );
          })}
        </div>
        {rota && (
          <Button className="w-full text-white" size="lg" style={{ background: "linear-gradient(to right, #0a1f5e, #1a4a9e)" }} onClick={() => navigate(rota)}>
            Continuar processo <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function PainelCandidato({ processos, onNovaCertificacao }: { processos: any[]; onNovaCertificacao: () => void }) {
  const { logout, user } = useAuth();
  // Prioriza o nome do processo mais recente; se vier vazio (ex: registro
  // antigo/corrompido), cai pro nome do perfil autenticado — nunca mostra
  // "Olá, !" em branco, o que já causou confusão sobre qual conta estava ativa.
  const nomeCompleto = processos[0]?.candidatoNome || user?.full_name || user?.email || "";
  const primeiroNome = nomeCompleto.split(" ")[0];
  return (
    <div className="min-h-screen p-4 py-10" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 40%, #1a4a9e 100%)" }}>
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <img src="/logo-anefac.png" alt="ANEFAC" className="h-14 mx-auto mb-4 drop-shadow-lg" onError={e => { (e.target as any).style.display='none'; }} />
          <h1 className="text-2xl font-bold text-white">Olá{primeiroNome ? `, ${primeiroNome}` : ""}!</h1>
          <p className="text-blue-300 mt-1 text-sm">
            {processos.length > 1
              ? `Você tem ${processos.length} certificações em andamento`
              : "Bem-vindo à sua área de candidato"}
          </p>
          {user?.email && (
            <p className="text-blue-400/70 text-xs mt-2">Logado como <span className="font-medium text-blue-300">{user.email}</span></p>
          )}
        </div>

        <div className={`grid gap-5 mb-6 ${processos.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : "max-w-lg mx-auto"}`}>
          {processos.map((p) => <CertificacaoAtivaCard key={p.processo_id} processo={p} />)}
        </div>

        <div className="max-w-lg mx-auto space-y-2">
          <Button className="w-full" variant="outline" onClick={onNovaCertificacao}>
            <Plus className="w-4 h-4 mr-1.5" /> Iniciar outra certificação
          </Button>
          <button onClick={() => { logout(); onNovaCertificacao(); }} className="w-full text-sm text-blue-300 hover:text-white py-2 transition-colors">Sair da conta</button>
        </div>
      </div>
    </div>
  );
}

export function AreaCandidato() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [modalAberto, setModalAberto] = useState(false);
  const [boasVindasAberto, setBoasVindasAberto] = useState(false);
  const [processosAtivos, setProcessosAtivos] = useState<any[] | null>(null);
  const [imagens, setImagens] = useState<CarrosselImagem[]>([]);

  useEffect(() => {
    fetch("/api/admin/carrossel/publico").then(r => r.json()).then(d => setImagens(d.imagens || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      (api.processo as any).meus().then((res: any) => { setProcessosAtivos(res?.processos || []); }).catch(() => {});
    }
  }, [isAuthenticated]);

  // Admin/gestor/avaliador logado não deve ver painel de candidato
  const rolesAdmin = ["administrador", "gestor_n1", "gestor_n2", "avaliador", "entrevistador"];
  const { user } = useAuth();
  const isAdminUser = user && rolesAdmin.includes((user as any).role);

  if (isAuthenticated && processosAtivos && processosAtivos.length > 0 && !isAdminUser) {
    return <PainelCandidato processos={processosAtivos} onNovaCertificacao={() => navigate("/novo-fluxo/selecionar")} />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 45%, #1565c0 75%, #1976d2 100%)" }}>

      {/* Navbar topo */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/10" style={{ background: "rgba(5,10,40,0.8)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <img src="/logo-anefac.png" alt="ANEFAC" className="h-8 drop-shadow"
            onError={e => { (e.target as any).style.display = "none"; }} />
          <span className="text-white font-bold text-sm hidden sm:block">ANEFAC</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          <a href="/como-funciona" className="text-white/60 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            Como funciona
          </a>
          <a href="/cursos" className="text-white/60 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            Cursos
          </a>
          <a href="/simulacao" className="text-white/60 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10 transition-colors hidden sm:block">
            Simulação
          </a>
          <a href="/novo-fluxo/admin/login"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition-all border border-white/20 text-white hover:bg-white/10"
            title="Área administrativa">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden sm:inline">Admin</span>
          </a>
        </div>
      </nav>

      {/* Rede de partículas decorativa */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4fc3f7" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* BANNER — carrossel full width */}
        <div className="relative w-full" style={{ height: "420px" }}>
          <Carrossel imagens={imagens} />

          {/* Overlay gradiente bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, #0a1f5e)" }} />

          {/* Logo sobreposto ao banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-10 sm:pt-14 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-5 text-center border border-white/20 shadow-2xl">
              <img src="/logo-anefac.png" alt="ANEFAC" className="h-16 mx-auto mb-2 drop-shadow-xl"
                onError={e => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  el.parentElement!.insertAdjacentHTML("afterbegin", '<span style="font-size:2.5rem;font-weight:900;color:white;letter-spacing:0.15em">ANEFAC</span>');
                }} />
              <p className="text-white/80 text-sm font-medium tracking-widest uppercase">Plataforma de Certificação Profissional</p>
            </div>
          </div>
        </div>

        {/* 3 CARDS HORIZONTAIS */}
        <div className="relative flex-1 px-4 py-8">
          <div className="max-w-5xl mx-auto">

            <p className="text-center text-white/60 text-sm mb-6 tracking-wide uppercase font-medium">
              Como você deseja prosseguir?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Card 1 — Quero me certificar */}
              <button onClick={() => navigate("/novo-fluxo/certificacoes")}
                className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20"
                style={{ background: "linear-gradient(135deg, #6B3FA0 0%, #4a2575 100%)" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(135deg, #7d50b8 0%, #5a2e8a 100%)" }} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2 leading-tight">Quero conhecer as Certificações ANEFAC</h3>
                  <p className="text-purple-200 text-sm">Inicie seu processo de certificação profissional</p>
                  <div className="mt-4 flex items-center text-white/70 text-xs font-medium">
                    Começar agora <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Card 2 — Já tenho cadastro */}
              <button onClick={() => setModalAberto(true)}
                className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20"
                style={{ background: "linear-gradient(135deg, #8B2020 0%, #5c1414 100%)" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(135deg, #a02828 0%, #6e1818 100%)" }} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                    <LogIn className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2 leading-tight">Já tenho cadastro</h3>
                  <p className="text-red-200 text-sm">Continue seu processo de certificação de onde parou</p>
                  <div className="mt-4 flex items-center text-white/70 text-xs font-medium">
                    Fazer login <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Card 3 — Cursos ANEFAC */}
              <button onClick={() => navigate("/cursos")}
                className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20"
                style={{ background: "linear-gradient(135deg, #1B7A6B 0%, #0f4d43 100%)" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(135deg, #219080 0%, #125c51 100%)" }} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2 leading-tight">Prepare-se com os Cursos ANEFAC</h3>
                  <p className="text-emerald-200 text-sm">Acesse nossa plataforma de desenvolvimento profissional</p>
                  <div className="mt-4 flex items-center text-white/70 text-xs font-medium">
                    Ver cursos <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

            </div>

            {/* Link admin */}
            <p className="text-center text-white/30 text-xs mt-8 hover:text-white/50 transition-colors">
              <a href="/novo-fluxo/admin/login" className="underline underline-offset-2">
                Acesso administrativo — avaliadores e gestores
              </a>
            </p>

          </div>
        </div>
      </div>

      {boasVindasAberto && (
        <BoasVindasModal open={boasVindasAberto} onClose={() => setBoasVindasAberto(false)}
          onSuccess={(dados) => {
            sessionStorage.setItem("anefac_pre_dados", JSON.stringify(dados));
            setBoasVindasAberto(false);
            navigate("/novo-fluxo/lgpd");
          }} />
      )}

      {modalAberto && (
        <LoginModal onClose={() => setModalAberto(false)}
          onSuccess={(processos) => {
            setModalAberto(false);
            if (processos && processos.length > 0) setProcessosAtivos(processos);
            else navigate("/novo-fluxo/selecionar");
          }} />
      )}
    </div>
  );
}
