import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { ComiteModal } from "@/components/ComiteModal";
import { DocumentoModal } from "@/components/DocumentoModal";
import {
  ArrowRight, BookOpen, FileText, Shield, Users, Award,
  CheckCircle, Star, TrendingUp, Globe, ChevronDown
} from "lucide-react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useInstitucional } from "@/contexts/InstitucionalContext";
import { useCertification } from "@/contexts/CertificationContext";

type ModalType = "comite" | "regulamento" | "edital" | "conduta" | null;

// ── Animated counter hook ──────────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── Intersection observer hook ─────────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function Home() {
  const { config } = useSiteConfig();
  const { institucional } = useInstitucional();
  const { certifications } = useCertification();
  const [modal, setModal] = useState<ModalType>(null);
  const [scrollY, setScrollY] = useState(0);
  const statsRef = useInView(0.3);

  // Parallax
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Group certifications by category
  const certsCCA = certifications.filter(c => c.status === "ativa" && c.id.startsWith("cca"));
  const certsLideranca = certifications.filter(c => c.status === "ativa" && c.id.startsWith("ecodobem"));

  const corMap: Record<string, string> = {
    blue: "#2563eb", gold: "#d97706", green: "#16a34a",
    purple: "#7c3aed", orange: "#ea580c", red: "#dc2626", teal: "#0d9488"
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — full-screen with parallax background and CCA symbol
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image with parallax */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
            transform: `translateY(${scrollY * 0.4}px)`,
            willChange: "transform",
          }}
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,20,60,0.92) 0%, rgba(15,40,100,0.85) 50%, rgba(10,20,60,0.92) 100%)" }} />

        {/* Decorative animated circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-10 w-72 h-72 rounded-full border border-white/5 animate-spin" style={{ animationDuration: "30s" }} />
          <div className="absolute top-1/3 right-16 w-48 h-48 rounded-full border border-white/5 animate-spin" style={{ animationDuration: "20s", animationDirection: "reverse" }} />
          <div className="absolute bottom-1/4 left-10 w-56 h-56 rounded-full border border-yellow-400/10 animate-spin" style={{ animationDuration: "25s" }} />
          {/* Glowing blobs */}
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)", filter: "blur(40px)" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: text */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-sm font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {config.hero.badge}
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.05]">
                {config.hero.titulo}{" "}
                <span className="text-yellow-400 relative">
                  {config.hero.tituloDestaque}
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-yellow-400/40 rounded-full" />
                </span>
              </h1>

              <p className="text-lg md:text-xl text-blue-200 mb-10 leading-relaxed max-w-xl">
                {config.hero.subtitulo}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/certificacoes">
                  <a className="group inline-flex items-center gap-2 bg-yellow-400 text-blue-900 font-black px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 text-base hover:scale-105">
                    {config.hero.ctaPrimario}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Link>
                <Link href="/como-funciona">
                  <a className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm text-base">
                    {config.hero.ctaSecundario}
                  </a>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 mt-10 justify-center lg:justify-start">
                {["56+ anos de credibilidade", "Processo 100% online", "Certificado reconhecido"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 bg-white/10 text-blue-200 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: CCA Symbol */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)", transform: "scale(1.3)" }} />
                {/* Rotating ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-yellow-400/20 animate-spin" style={{ animationDuration: "20s", transform: "scale(1.15)" }} />
                {/* CCA Logo */}
                <img
                  src="/logo-cca.png"
                  alt="CCA Certificação ANEFAC"
                  className="relative w-72 h-72 md:w-80 md:h-80 object-contain drop-shadow-2xl"
                  style={{ filter: "drop-shadow(0 0 40px rgba(59,130,246,0.4))" }}
                />
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-blue-900 text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-bounce" style={{ animationDuration: "3s" }}>
                  OFICIAL
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white text-blue-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  ANEFAC
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { valor: config.hero.stat1Valor, label: config.hero.stat1Label, icon: TrendingUp },
              { valor: config.hero.stat2Valor, label: config.hero.stat2Label, icon: Award },
              { valor: config.hero.stat3Valor, label: config.hero.stat3Label, icon: Globe },
              { valor: "6+", label: "Certificações disponíveis", icon: Star },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <stat.icon className="w-5 h-5 text-yellow-400 mx-auto mb-2 opacity-70" />
                <p className="text-3xl font-black text-yellow-400 mb-1">{stat.valor}</p>
                <p className="text-blue-300 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-12">
            <div className="animate-bounce text-white/40">
              <ChevronDown className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CERTIFICAÇÕES — two category blocks
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-50 text-blue-700 text-sm font-bold px-4 py-1.5 rounded-full mb-4">Nossas Certificações</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Programas de Certificação</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Escolha o programa que melhor se adapta ao seu momento profissional e objetivos de carreira.</p>
          </div>

          {/* CCA Block */}
          {certsCCA.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Certificação Controller ANEFAC</h3>
                  <p className="text-sm text-gray-500">Programa oficial de certificação em controladoria</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {certsCCA.map((cert) => (
                  <Link key={cert.id} href="/certificacoes">
                    <a className="group block bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-100 transition-all hover:-translate-y-1 cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md" style={{ background: corMap[cert.cor] || "#2563eb" }}>
                          {cert.numero}
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">{cert.subtitulo}</span>
                      </div>
                      <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{cert.nome}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">{cert.descricaoBreve}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{cert.competencias.length} competências avaliadas</span>
                        <span className="inline-flex items-center gap-1 text-blue-600 text-sm font-bold group-hover:gap-2 transition-all">
                          Ver detalhes <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* EcodoBem Block */}
          {certsLideranca.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Certificação de Liderança EcodoBem</h3>
                  <p className="text-sm text-gray-500">4 níveis progressivos de desenvolvimento em liderança</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {certsLideranca.map((cert) => (
                  <Link key={cert.id} href="/certificacoes">
                    <a className="group block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer overflow-hidden relative">
                      {/* Color accent bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: corMap[cert.cor] || "#16a34a" }} />
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md mb-3" style={{ background: corMap[cert.cor] || "#16a34a" }}>
                        N{cert.numero - 2}
                      </div>
                      <h4 className="text-sm font-black text-gray-900 mb-1 group-hover:text-green-700 transition-colors leading-tight">{cert.subtitulo}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3">{cert.descricaoBreve}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: corMap[cert.cor] || "#16a34a" }}>
                        Saiba mais <ArrowRight className="w-3 h-3" />
                      </span>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/certificacoes">
              <a className="inline-flex items-center gap-2 bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-105 text-base">
                Ver todas as certificações
                <ArrowRight className="w-5 h-5" />
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SOBRE O PROGRAMA — with CCA symbol and institutional cards
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="sobre" className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f1f4e 0%, #1e3a6e 50%, #0f1f4e 100%)" }}>
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <div>
              <span className="inline-block bg-yellow-400/10 text-yellow-300 text-sm font-bold px-4 py-1.5 rounded-full mb-6 border border-yellow-400/20">Sobre as Certificações ANEFAC</span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Reconhecimento que transforma carreiras
              </h2>
              <p className="text-blue-200 text-lg leading-relaxed mb-8">
                {config.institucional.subtitulo}
              </p>
              <div className="flex flex-wrap gap-3">
                {["Validação de mercado", "Banca especializada", "Processo estruturado", "Certificado digital"].map(item => (
                  <span key={item} className="inline-flex items-center gap-1.5 bg-white/10 text-blue-200 text-sm px-3 py-1.5 rounded-full border border-white/10">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            {/* CCA symbol */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)", transform: "scale(1.4)" }} />
                <img src="/logo-cca.png" alt="CCA" className="relative w-56 h-56 object-contain opacity-90" style={{ filter: "drop-shadow(0 0 30px rgba(245,158,11,0.3))" }} />
              </div>
            </div>
          </div>

          {/* Institutional cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {config.institucional.cards.map((card, i) => {
              const icons = [Award, Users, BookOpen];
              const Icon = icons[i] ?? Award;
              const isComite = i === 1;
              return (
                <div
                  key={i}
                  onClick={isComite ? () => setModal("comite") : undefined}
                  className={`bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all ${isComite ? "cursor-pointer hover:bg-white/20 hover:border-yellow-400/30" : "hover:bg-white/15"}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-yellow-400/20 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{card.titulo}</h3>
                  <p className="text-blue-300 text-sm leading-relaxed">{card.texto}</p>
                  {isComite && (
                    <p className="text-yellow-400 text-xs font-semibold mt-3">Conheça o comitê →</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS — animated counters
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50" ref={statsRef.ref}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { valor: 56, sufixo: "+", label: "Anos de credibilidade", icon: Star },
              { valor: 6, sufixo: "", label: "Certificações disponíveis", icon: Award },
              { valor: 100, sufixo: "%", label: "Processo online", icon: Globe },
              { valor: 10, sufixo: "+", label: "Dias úteis para análise", icon: TrendingUp },
            ].map((item, i) => {
              const count = useCounter(item.valor, 2000, statsRef.inView);
              return (
                <div key={i} className="text-center group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                    <item.icon className="w-6 h-6 text-blue-700" />
                  </div>
                  <p className="text-4xl font-black text-blue-700 mb-1">
                    {statsRef.inView ? count : 0}{item.sufixo}
                  </p>
                  <p className="text-gray-500 text-sm">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          DOCUMENTS — prominent section
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-50 text-blue-700 text-sm font-bold px-4 py-1.5 rounded-full mb-4">Transparência e Credibilidade</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Documentos do Programa</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Acesse os documentos oficiais do Programa de Certificação Profissional ANEFAC — Regulamento, Edital e Código de Conduta.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { key: "regulamento" as ModalType, icon: BookOpen, title: "Regulamento", desc: "Regras, critérios e estrutura completa do programa de certificação.", color: "blue" },
              { key: "edital" as ModalType, icon: FileText, title: "Edital de Candidatura", desc: "Requisitos, prazos, taxas e processo de inscrição detalhado.", color: "indigo" },
              { key: "conduta" as ModalType, icon: Shield, title: "Código de Conduta", desc: "Princípios éticos e compromissos dos profissionais certificados.", color: "purple" },
            ].map((doc) => (
              <button
                key={doc.key}
                onClick={() => setModal(doc.key)}
                className="group text-left bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-${doc.color}-50 flex items-center justify-center mb-5 group-hover:bg-${doc.color}-100 transition-colors`}>
                  <doc.icon className={`w-7 h-7 text-${doc.color}-600`} />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{doc.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{doc.desc}</p>
                <span className={`inline-flex items-center gap-1.5 text-${doc.color}-600 text-sm font-bold group-hover:gap-2.5 transition-all`}>
                  Acessar documento <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PROCESS STEPS — visual timeline
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-bold px-4 py-1.5 rounded-full mb-4">Passo a Passo</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Como funciona o processo</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Um processo claro, transparente e 100% online para você conquistar sua certificação.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: "01", title: "Inscrição", desc: "Escolha sua certificação e realize o cadastro online com seus dados e documentos." },
              { n: "02", title: "Análise Documental", desc: "Nossa banca analisa seus documentos e valida sua elegibilidade ao programa." },
              { n: "03", title: "Avaliação", desc: "Realize a prova de proficiência e/ou entrevista com especialistas da área." },
              { n: "04", title: "Certificação", desc: "Aprovado, você recebe seu certificado e badge digital reconhecido pelo mercado." },
            ].map((step, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-blue-200 z-0" style={{ width: "calc(100% - 2rem)", left: "calc(50% + 1.5rem)" }} />
                )}
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                    {step.n}
                  </div>
                  <h3 className="font-black text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/como-funciona">
              <a className="inline-flex items-center gap-2 text-blue-700 font-bold hover:text-blue-900 transition-colors">
                Ver processo completo <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          AVISO
      ══════════════════════════════════════════════════════════════════════ */}
      {config.aviso.visivel && (
        <div className="bg-amber-50 border-t border-amber-100 py-4">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs text-amber-700 text-center leading-relaxed">{config.aviso.texto}</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo-anefac.png" alt="ANEFAC" className="h-10 w-auto object-contain" />
                <div>
                  <p className="font-black text-white text-lg">ANEFAC</p>
                  <p className="text-gray-400 text-xs">Certificações Profissionais</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">{config.rodape.descricaoOrganizacao}</p>
            </div>
            {/* Links */}
            <div>
              <p className="font-bold text-white mb-4 text-sm">Programa</p>
              <div className="flex flex-col gap-2">
                <Link href="/certificacoes"><a className="text-gray-400 text-sm hover:text-white transition-colors">Certificações</a></Link>
                <Link href="/como-funciona"><a className="text-gray-400 text-sm hover:text-white transition-colors">Como funciona</a></Link>
                <Link href="/simulacao"><a className="text-gray-400 text-sm hover:text-white transition-colors">Simulação</a></Link>
              </div>
            </div>
            {/* Docs */}
            <div>
              <p className="font-bold text-white mb-4 text-sm">Documentos</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => setModal("regulamento")} className="text-gray-400 text-sm hover:text-white transition-colors text-left">Regulamento</button>
                <button onClick={() => setModal("edital")} className="text-gray-400 text-sm hover:text-white transition-colors text-left">Edital de Candidatura</button>
                <button onClick={() => setModal("conduta")} className="text-gray-400 text-sm hover:text-white transition-colors text-left">Código de Conduta</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">{config.rodape.copyright}</p>
            <img src="/logo-cca.png" alt="CCA" className="h-10 w-10 object-contain opacity-40" />
          </div>
        </div>
      </footer>

      {/* ── Modals ── */}
      {modal === "comite" && <ComiteModal onClose={() => setModal(null)} />}
      {modal === "regulamento" && (
        <DocumentoModal titulo={institucional.regulamento.titulo} conteudo={institucional.regulamento.conteudo} urlExterna={institucional.regulamento.urlExterna} onClose={() => setModal(null)} />
      )}
      {modal === "edital" && (
        <DocumentoModal titulo={institucional.edital.titulo} conteudo={institucional.edital.conteudo} urlExterna={institucional.edital.urlExterna} onClose={() => setModal(null)} />
      )}
      {modal === "conduta" && (
        <DocumentoModal titulo={institucional.codigoConduta.titulo} conteudo={institucional.codigoConduta.conteudo} urlExterna={institucional.codigoConduta.urlExterna} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
