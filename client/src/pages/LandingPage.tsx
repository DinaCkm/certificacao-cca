import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useCertification, Certification } from "@/contexts/CertificationContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  ChevronRight,
  FileText,
  Award,
  Users,
  Clock,
  Download,
  ArrowRight,
  Star,
  Shield,
  Zap,
  BookOpen,
  Menu,
  X,
} from "lucide-react";

// ─── Color map ────────────────────────────────────────────────────────────────

const COR_MAP: Record<string, {
  gradient: string; light: string; border: string;
  badge: string; btn: string; num: string; text: string; ring: string;
}> = {
  blue:   { gradient: "from-blue-600 to-blue-800",   light: "bg-blue-50",   border: "border-blue-200",  badge: "bg-blue-100 text-blue-800",    btn: "bg-blue-700 hover:bg-blue-800",    num: "from-blue-600 to-blue-900",   text: "text-blue-700",   ring: "ring-blue-200" },
  gold:   { gradient: "from-amber-500 to-amber-700",  light: "bg-amber-50",  border: "border-amber-200", badge: "bg-amber-100 text-amber-800",   btn: "bg-amber-600 hover:bg-amber-700",  num: "from-amber-500 to-amber-800", text: "text-amber-700",  ring: "ring-amber-200" },
  green:  { gradient: "from-emerald-600 to-emerald-800", light: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-800", btn: "bg-emerald-700 hover:bg-emerald-800", num: "from-emerald-600 to-emerald-900", text: "text-emerald-700", ring: "ring-emerald-200" },
  purple: { gradient: "from-purple-600 to-purple-800", light: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-800", btn: "bg-purple-700 hover:bg-purple-800", num: "from-purple-600 to-purple-900", text: "text-purple-700", ring: "ring-purple-200" },
  orange: { gradient: "from-orange-500 to-orange-700", light: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-800", btn: "bg-orange-600 hover:bg-orange-700", num: "from-orange-500 to-orange-800", text: "text-orange-700", ring: "ring-orange-200" },
  teal:   { gradient: "from-teal-600 to-teal-800",   light: "bg-teal-50",   border: "border-teal-200",  badge: "bg-teal-100 text-teal-800",    btn: "bg-teal-700 hover:bg-teal-800",    num: "from-teal-600 to-teal-900",   text: "text-teal-700",   ring: "ring-teal-200" },
  red:    { gradient: "from-red-600 to-red-800",     light: "bg-red-50",    border: "border-red-200",   badge: "bg-red-100 text-red-800",      btn: "bg-red-700 hover:bg-red-800",      num: "from-red-600 to-red-900",     text: "text-red-700",    ring: "ring-red-200" },
};

function getCor(cor: string) {
  return COR_MAP[cor] || COR_MAP.blue;
}

function formatCurrency(value: number) {
  if (!value) return "A definir";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-md">
            <span className="text-white font-black text-sm tracking-tight">A</span>
          </div>
          <div>
            <span className={`font-black text-lg tracking-tight transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>
              ANEFAC
            </span>
            <span className={`hidden sm:inline text-xs ml-1.5 transition-colors ${scrolled ? "text-gray-400" : "text-blue-200"}`}>
              Certificações
            </span>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: "Certificações", id: "certificacoes" },
            { label: "Edital", id: "edital" },
            { label: "Como funciona", id: "como-funciona" },
            { label: "FAQ", id: "faq" },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => onScrollTo(id)}
              className={`text-sm font-medium transition-colors hover:opacity-80 ${
                scrolled ? "text-gray-600 hover:text-blue-700" : "text-blue-100 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setLocation("/novo-fluxo/admin")}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
              scrolled
                ? "border-gray-200 text-gray-500 hover:bg-gray-50"
                : "border-white/20 text-white/70 hover:bg-white/10"
            }`}
          >
            Área admin
          </button>
        </div>

        {/* Mobile menu */}
        <button
          className={`md:hidden p-2 rounded-lg ${scrolled ? "text-gray-600" : "text-white"}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-lg">
          <div className="px-6 py-4 space-y-3">
            {[
              { label: "Certificações", id: "certificacoes" },
              { label: "Edital", id: "edital" },
              { label: "Como funciona", id: "como-funciona" },
              { label: "FAQ", id: "faq" },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => { onScrollTo(id); setMenuOpen(false); }}
                className="block w-full text-left text-sm font-medium text-gray-700 hover:text-blue-700 py-1"
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => setLocation("/novo-fluxo/admin")}
              className="block w-full text-left text-xs text-gray-400 hover:text-gray-600 py-1"
            >
              Área administrativa
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ certsCount, onScrollTo }: { certsCount: number; onScrollTo: (id: string) => void }) {
  return (
    <section
      className="relative min-h-screen flex items-center anefac-hero-bg anefac-hero-bg-pattern overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2044 30%, #1a3a6b 65%, #1e4fa0 100%)' }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-32 pt-40">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-blue-100 text-xs font-semibold px-4 py-2 rounded-full mb-8 animate-fade-in-up">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            Programa oficial de certificação profissional
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 animate-fade-in-up-delay-1">
            Certifique sua<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
              excelência
            </span>
            <br />profissional
          </h1>

          <p className="text-lg sm:text-xl text-blue-100/90 max-w-xl leading-relaxed mb-10 animate-fade-in-up-delay-2">
            Certificações reconhecidas pelo mercado para profissionais que buscam
            validar suas competências com rigor técnico e credibilidade institucional.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up-delay-3">
            <button
              onClick={() => onScrollTo("certificacoes")}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl shadow-black/20 text-sm"
            >
              Ver certificações disponíveis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onScrollTo("edital")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/25 text-white font-semibold rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm text-sm"
            >
              <FileText className="w-4 h-4" />
              Acessar edital
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-white/15">
            {[
              { value: `${certsCount}`, label: "certificações disponíveis" },
              { value: "100%", label: "processo online" },
              { value: "2", label: "pagamentos separados" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-blue-200 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
        <div className="w-0.5 h-8 bg-white/20 rounded-full" />
      </div>
    </section>
  );
}

// ─── Como Funciona ────────────────────────────────────────────────────────────

function ComoFunciona() {
  const steps = [
    { num: "01", icon: Users, label: "Cadastro", desc: "Preencha seus dados pessoais e profissionais" },
    { num: "02", icon: FileText, label: "Documentos", desc: "Envie os documentos exigidos pela certificação" },
    { num: "03", icon: Zap, label: "Pagamento 1", desc: "Taxa de análise documental" },
    { num: "04", icon: Shield, label: "Validação", desc: "Banca avaliadora analisa seu perfil" },
    { num: "05", icon: BookOpen, label: "Avaliação", desc: "Prova ou entrevista (conforme caminho)" },
    { num: "06", icon: Zap, label: "Pagamento 2", desc: "Taxa de emissão (após aprovação)" },
    { num: "07", icon: Award, label: "Certificado", desc: "Emissão digital do seu certificado" },
  ];

  return (
    <section id="como-funciona" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full mb-4 tracking-wider uppercase">
            Processo
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Como funciona</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Sete etapas simples e totalmente online para obter sua certificação profissional.
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-10 left-[7%] right-[7%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl ${
                    i === 0 ? "step-active" :
                    i === 6 ? "bg-gradient-to-br from-emerald-500 to-emerald-700" :
                    "bg-white border-2 border-blue-100"
                  }`}>
                    {i === 0 || i === 6 ? (
                      <Icon className="w-8 h-8 text-white" />
                    ) : (
                      <Icon className="w-7 h-7 text-blue-600" />
                    )}
                    <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
                      i === 0 ? "bg-yellow-400 text-yellow-900" :
                      i === 6 ? "bg-emerald-400 text-emerald-900" :
                      "bg-blue-600 text-white"
                    }`}>
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 mb-1">{step.label}</p>
                  <p className="text-xs text-gray-500 leading-snug">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Caminho A/B note */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="flex-1 bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-black">A</span>
              </div>
              <span className="font-bold text-gray-900 text-sm">Caminho A</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Validação documental aprovada → <strong>entrevista direta</strong> com a banca avaliadora.
            </p>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-black">B</span>
              </div>
              <span className="font-bold text-gray-900 text-sm">Caminho B</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Validação documental → <strong>prova de competência</strong> → entrevista com a banca.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Seção de Certificação ────────────────────────────────────────────────────

function CertificacaoSection({ cert, index }: { cert: Certification; index: number }) {
  const [, setLocation] = useLocation();
  const { selecionarCertificacao } = useCertification();
  const [modalOpen, setModalOpen] = useState(false);
  const cor = getCor(cert.cor);
  const isEven = index % 2 === 0;

  function handleInscrever() {
    selecionarCertificacao(cert, "cert_direta");
    setLocation("/novo-fluxo/cadastro");
  }

  return (
    <>
      <section
        id={`certificacao-${cert.numero}`}
        className={`py-24 ${isEven ? "bg-white" : "bg-gray-50/70"}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid lg:grid-cols-2 gap-16 items-center ${!isEven ? "lg:[&>*:first-child]:order-2" : ""}`}>

            {/* Visual side */}
            <div className="flex flex-col items-center lg:items-start gap-6">
              {/* Large number card */}
              <div className={`relative w-full max-w-sm rounded-3xl bg-gradient-to-br ${cor.gradient} p-8 shadow-2xl overflow-hidden`}>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "radial-gradient(circle at 70% 30%, white 1px, transparent 1px)",
                    backgroundSize: "24px 24px"
                  }}
                />
                <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
                <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-white/5" />

                <div className="relative">
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">
                    Certificação
                  </p>
                  <div className="text-8xl font-black text-white/20 leading-none mb-4">
                    {cert.numero}
                  </div>
                  <h3 className="text-2xl font-black text-white leading-tight mb-2">
                    {cert.nome}
                  </h3>
                  {cert.subtitulo && (
                    <p className="text-white/70 text-sm">{cert.subtitulo}</p>
                  )}

                  {/* Status */}
                  {cert.status === "ativa" && (
                    <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-white text-xs font-semibold">Inscrições abertas</span>
                    </div>
                  )}
                  {cert.status === "em_breve" && (
                    <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Clock className="w-3 h-3 text-yellow-300" />
                      <span className="text-white text-xs font-semibold">Em breve</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Competências */}
              {cert.competencias.length > 0 && (
                <div className="w-full max-w-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Competências avaliadas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cert.competencias.map((c, i) => (
                      <span key={i} className={`text-xs font-medium px-3 py-1.5 rounded-full ${cor.badge}`}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content side */}
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${cor.text}`}>
                Certificação {cert.numero}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight">
                {cert.nome}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8 text-base">
                {cert.descricao}
              </p>

              {/* Público-alvo */}
              <div className={`rounded-2xl p-5 ${cor.light} ${cor.border} border mb-6`}>
                <div className="flex items-center gap-2 mb-2">
                  <Users className={`w-4 h-4 ${cor.text}`} />
                  <p className="text-sm font-bold text-gray-800">Público-alvo</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{cert.publicoAlvo}</p>
              </div>

              {/* Taxas */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm">
                  <p className="text-xs text-gray-400 mb-1">Taxa de Análise</p>
                  <p className="text-xl font-black text-gray-900">{formatCurrency(cert.taxaAnalise)}</p>
                  <p className="text-xs text-gray-400 mt-1">Etapa 1</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm">
                  <p className="text-xs text-gray-400 mb-1">Taxa de Emissão</p>
                  <p className="text-xl font-black text-emerald-700">{formatCurrency(cert.taxaEmissao)}</p>
                  <p className="text-xs text-gray-400 mt-1">Após aprovação</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {cert.status === "ativa" && (
                  <button
                    onClick={handleInscrever}
                    className={`group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg ${cor.btn} btn-primary-premium`}
                  >
                    Iniciar inscrição
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Ver detalhes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de detalhes */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className={`rounded-2xl bg-gradient-to-br ${cor.gradient} p-6 mb-4 -mx-6 -mt-6`}>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">
                Certificação {cert.numero}
              </p>
              <DialogTitle className="text-2xl font-black text-white">{cert.nome}</DialogTitle>
              {cert.subtitulo && (
                <p className="text-white/70 text-sm mt-1">{cert.subtitulo}</p>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 px-1">
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-sm">Sobre a certificação</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{cert.descricao}</p>
            </div>

            <Separator />

            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-sm">Público-alvo</h4>
              <p className="text-gray-600 text-sm">{cert.publicoAlvo}</p>
            </div>

            {cert.preRequisitos.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-sm">Pré-requisitos</h4>
                <ul className="space-y-2">
                  {cert.preRequisitos.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cert.documentosExigidos.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-sm">Documentos exigidos</h4>
                <ul className="space-y-2">
                  {cert.documentosExigidos.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cert.competencias.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-sm">Competências avaliadas</h4>
                <div className="flex flex-wrap gap-2">
                  {cert.competencias.map((c, i) => (
                    <span key={i} className={`text-xs font-medium px-3 py-1.5 rounded-full ${cor.badge}`}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border p-4 bg-gray-50">
                <p className="text-xs text-gray-400 mb-1">Taxa de Análise</p>
                <p className="font-black text-gray-900 text-lg">{formatCurrency(cert.taxaAnalise)}</p>
              </div>
              <div className="rounded-xl border p-4 bg-gray-50">
                <p className="text-xs text-gray-400 mb-1">Taxa de Emissão</p>
                <p className="font-black text-emerald-700 text-lg">{formatCurrency(cert.taxaEmissao)}</p>
              </div>
            </div>

            {cert.status === "ativa" && (
              <button
                onClick={() => { setModalOpen(false); handleInscrever(); }}
                className={`w-full py-4 rounded-xl font-bold text-sm text-white transition-all ${cor.btn} btn-primary-premium`}
              >
                Iniciar inscrição nesta certificação →
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Edital ───────────────────────────────────────────────────────────────────

function Edital({ certsAtivas }: { certsAtivas: Certification[] }) {
  return (
    <section id="edital" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-3xl overflow-hidden border border-blue-100 shadow-xl">
          {/* Header */}
          <div className="anefac-hero-bg p-8 sm:p-10" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2044 30%, #1a3a6b 65%, #1e4fa0 100%)' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Edital do Processo de Certificação</h2>
                <p className="text-blue-200 text-sm mt-1">Leia atentamente antes de iniciar sua inscrição</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 border-b border-gray-100">
            {[
              { label: "Período de inscrições", value: "A definir" },
              { label: "Certificações disponíveis", value: `${certsAtivas.length}` },
              { label: "Modalidade", value: "100% online" },
            ].map((item, i) => (
              <div key={i} className="p-5 text-center">
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                <p className="font-black text-gray-900 text-lg">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="p-8 sm:p-10 bg-white">
            <div className="prose prose-sm max-w-none text-gray-600 mb-8">
              <p className="leading-relaxed">
                O edital completo com todas as regras, critérios de avaliação, documentos exigidos,
                prazos e demais informações do processo de certificação será disponibilizado pelo
                administrador nesta seção. Consulte regularmente para acompanhar atualizações.
              </p>
            </div>

            {/* Key info grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: Shield, title: "Dois pagamentos separados", desc: "Taxa de análise documental (início) e taxa de emissão (após aprovação)" },
                { icon: BookOpen, title: "Duas tentativas na prova", desc: "Candidatos no Caminho B têm direito a uma segunda tentativa sem custo adicional" },
                { icon: Users, title: "Banca avaliadora especializada", desc: "Profissionais experientes avaliam cada candidato individualmente" },
                { icon: Award, title: "Certificado digital", desc: "Emitido eletronicamente e enviado por e-mail após conclusão do processo" },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-3 bg-blue-700 text-white text-sm font-bold rounded-xl hover:bg-blue-800 transition-all shadow-md shadow-blue-200">
                <Download className="w-4 h-4" />
                Baixar edital em PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Como funciona o processo de certificação?",
    a: "O processo é composto por etapas sequenciais: cadastro, envio de documentos, pagamento da taxa de análise documental, validação pela banca avaliadora, avaliação (prova ou entrevista direta, conforme decisão do avaliador), e emissão do certificado após aprovação e pagamento da taxa de emissão.",
  },
  {
    q: "Quais são os dois pagamentos exigidos?",
    a: "O primeiro pagamento é a Taxa de Análise Documental, paga antes da validação dos documentos. O segundo é a Taxa de Emissão do Certificado, cobrada somente após a habilitação final na entrevista. Não há cobrança adicional para a segunda tentativa de prova, caso necessário.",
  },
  {
    q: "O que acontece se eu reprovar na prova?",
    a: "O candidato tem direito a uma segunda tentativa sem custo adicional. Se reprovar na segunda tentativa, o processo é encerrado e o candidato poderá tentar novamente após o período determinado no edital.",
  },
  {
    q: "O que é o Caminho A e o Caminho B?",
    a: "Após a validação documental, o avaliador decide a trilha mais adequada para o candidato. No Caminho A, o candidato vai diretamente para a entrevista. No Caminho B, o candidato precisa comprovar competência por meio de uma prova antes da entrevista.",
  },
  {
    q: "O certificado é emitido de forma digital?",
    a: "Sim. O certificado é gerado digitalmente no sistema e enviado por e-mail ao candidato após a conclusão de todas as etapas e o pagamento da taxa de emissão.",
  },
  {
    q: "Posso me inscrever em mais de uma certificação?",
    a: "Sim, é possível se inscrever em mais de uma certificação, desde que os processos sejam iniciados separadamente e os requisitos de cada uma sejam atendidos.",
  },
];

// ─── Landing Page Principal ───────────────────────────────────────────────────

export default function LandingPage() {
  const { certifications } = useCertification();
  const [, setLocation] = useLocation();

  const certsAtivas = certifications.filter(
    (c) => c.status !== "inativa" && c.status !== "encerrada"
  );

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const offset = 72;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar onScrollTo={scrollTo} />
      <Hero certsCount={certsAtivas.length} onScrollTo={scrollTo} />
      <ComoFunciona />

      {/* Certificações */}
      <div id="certificacoes">
        {/* Section header */}
        <div className="py-16 bg-white text-center border-b border-gray-100">
          <span className="inline-block text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full mb-4 tracking-wider uppercase">
            Certificações
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Certificações disponíveis
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed mb-6">
            Cada certificação é numerada e configurada pela equipe ANEFAC.
            Selecione a que melhor corresponde ao seu perfil profissional.
          </p>

          {/* Quick nav pills */}
          {certsAtivas.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2">
              {certsAtivas.map((cert) => {
                const cor = getCor(cert.cor);
                return (
                  <button
                    key={cert.id}
                    onClick={() => scrollTo(`certificacao-${cert.numero}`)}
                    className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all hover:scale-105 ${cor.badge} border-transparent`}
                  >
                    Certificação {cert.numero}
                    {cert.nome !== `Certificação ${cert.numero}` ? ` — ${cert.nome}` : ""}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {certsAtivas.length === 0 ? (
          <div className="py-32 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-gray-300" />
            </div>
            <p className="font-bold text-gray-400 text-lg">Nenhuma certificação disponível</p>
            <p className="text-sm text-gray-300 mt-1">Aguarde a abertura do próximo processo.</p>
          </div>
        ) : (
          certsAtivas.map((cert, i) => (
            <CertificacaoSection key={cert.id} cert={cert} index={i} />
          ))
        )}
      </div>

      <Edital certsAtivas={certsAtivas} />

      {/* Aviso cursos */}
      <div className="py-8 bg-amber-50 border-y border-amber-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Aviso importante</p>
          <p className="text-amber-700 text-sm leading-relaxed">
            Os cursos de atualização têm finalidade preparatória e de desenvolvimento.
            A compra ou conclusão de cursos <strong>não garante</strong> aprovação, habilitação ou emissão da certificação.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full mb-4 tracking-wider uppercase">
              FAQ
            </span>
            <h2 className="text-3xl font-black text-gray-900">Perguntas frequentes</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-gray-200 rounded-2xl px-5 bg-white shadow-sm"
              >
                <AccordionTrigger className="text-sm font-bold text-gray-900 hover:no-underline py-5 text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600 leading-relaxed pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Final */}
      <section
        className="py-24 anefac-hero-bg anefac-hero-bg-pattern relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2044 30%, #1a3a6b 65%, #1e4fa0 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-indigo-400/10 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <Award className="w-8 h-8 text-yellow-300" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Pronto para certificar sua excelência?
          </h2>
          <p className="text-blue-200 mb-10 text-sm leading-relaxed max-w-xl mx-auto">
            Escolha sua certificação, envie seus documentos e comprove suas competências.
            O processo é 100% online e conduzido por uma banca especializada.
          </p>
          <button
            onClick={() => scrollTo("certificacoes")}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 font-black rounded-xl hover:bg-blue-50 transition-all shadow-xl text-sm"
          >
            Ver certificações disponíveis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <span className="text-white font-black text-xs">A</span>
                </div>
                <span className="font-black text-gray-200 text-lg">ANEFAC</span>
              </div>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                Associação Nacional dos Executivos de Finanças, Administração e Contabilidade.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Navegação</p>
                <div className="space-y-2">
                  {[
                    { label: "Certificações", id: "certificacoes" },
                    { label: "Edital", id: "edital" },
                    { label: "Como funciona", id: "como-funciona" },
                    { label: "FAQ", id: "faq" },
                  ].map(({ label, id }) => (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      className="block text-sm text-gray-500 hover:text-gray-200 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Sistema</p>
                <div className="space-y-2">
                  <button
                    onClick={() => setLocation("/novo-fluxo/admin")}
                    className="block text-sm text-gray-500 hover:text-gray-200 transition-colors"
                  >
                    Área administrativa
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} ANEFAC — Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
