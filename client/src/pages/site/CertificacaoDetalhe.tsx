import React, { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useCertification } from "@/contexts/CertificationContext";
import { ArrowRight, FileText, DollarSign, Clock, Users, CheckCircle, ExternalLink, ArrowLeft, BookOpen, Award, X, User, Mail, Heart } from "lucide-react";

type LeadDestino = "cursos" | "certificar" | null;

export function CertificacaoDetalhe() {
  const params = useParams<{ id: string }>();
  const { certifications, selecionarCertificacao } = useCertification();
  const [, navigate] = useLocation();

  const [leadDestino, setLeadDestino] = useState<LeadDestino>(null);
  const [leadNome, setLeadNome] = useState("");
  const [leadEmail, setLeadEmail] = useState("");

  const cert = (certifications || []).find((c) => c.id === params.id);

  if (!cert) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 text-center px-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Certificação não encontrada</h1>
          <Link href="/novo-fluxo/certificacoes">
            <a className="text-blue-700 font-medium hover:underline">← Voltar para certificações</a>
          </Link>
        </div>
      </div>
    );
  }

  const handleInscrever = () => {
    selecionarCertificacao(cert);
    navigate("/novo-fluxo/cadastro");
  };

  // Salva lead (se preenchido) e navega para o destino
  const prosseguir = (identificado: boolean) => {
    if (identificado && leadNome.trim() && leadEmail.trim()) {
      // Salva no localStorage para uso futuro
      const leads = JSON.parse(localStorage.getItem("anefac_leads") || "[]");
      leads.push({
        nome: leadNome.trim(),
        email: leadEmail.trim(),
        certId: cert.id,
        certNome: cert.nome,
        destino: leadDestino,
        data: new Date().toISOString(),
      });
      localStorage.setItem("anefac_leads", JSON.stringify(leads));
    }

    setLeadDestino(null);
    setLeadNome("");
    setLeadEmail("");

    if (leadDestino === "cursos") {
      navigate("/cursos");
    } else if (leadDestino === "certificar") {
      handleInscrever();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="pt-16" style={{ background: "linear-gradient(135deg, #0f1f4e 0%, #1e3a6e 100%)" }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <Link href="/novo-fluxo/certificacoes">
            <a className="inline-flex items-center gap-2 text-blue-300 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar para certificações
            </a>
          </Link>
          <div className="flex items-start gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-3xl shrink-0"
              style={{ background: cert.cor || "rgba(255,255,255,0.2)" }}
            >
              {cert.numero}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{cert.nome}</h1>
              <p className="text-blue-300 text-lg font-medium mb-3">{cert.subtitulo}</p>
              <p className="text-blue-200 text-sm max-w-2xl leading-relaxed">{cert.descricao}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Público-alvo */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-700" />
                </div>
                <h2 className="font-bold text-gray-900">Público-alvo</h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{cert.publicoAlvo}</p>
            </div>

            {/* Competências */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-700" />
                </div>
                <h2 className="font-bold text-gray-900">Competências avaliadas</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {cert.competencias.map((comp, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    {comp}
                  </div>
                ))}
              </div>
            </div>

            {/* Documentos exigidos */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-700" />
                </div>
                <h2 className="font-bold text-gray-900">Documentos exigidos</h2>
              </div>
              <div className="space-y-2">
                {cert.documentosExigidos.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    {doc}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Taxas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Investimento</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-gray-600">Taxa de análise e avaliação</span>
                  </div>
                  <span className="font-bold text-gray-900 text-sm">
                    R$ {cert.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Taxa de emissão do certificado</span>
                  </div>
                  <span className="font-bold text-gray-900 text-sm">
                    R$ {cert.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mt-3">
                <p className="text-xs text-gray-500 leading-relaxed">
                  A taxa de análise e avaliação é paga antes do upload de documentos. A taxa de emissão do certificado é paga somente após aprovação final.
                </p>
              </div>
            </div>

            {/* Prazo */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-gray-900">Prazo estimado</h3>
              </div>
              <p className="text-sm text-gray-600">
                O processo completo leva em média <strong>30 a 60 dias</strong>, dependendo da disponibilidade para entrevista e da análise documental.
              </p>
            </div>

            {/* CTAs */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-6 space-y-3">
              <h3 className="font-bold text-gray-900 mb-1">O que você deseja fazer?</h3>

              {/* Botão 1 — Preparação */}
              <button
                onClick={() => setLeadDestino("cursos")}
                className="w-full flex items-center gap-3 bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold py-3.5 px-4 rounded-xl transition-all text-sm"
              >
                <BookOpen className="w-5 h-5 shrink-0" />
                <span>Quero me preparar para a Certificação</span>
              </button>

              {/* Botão 2 — Inscrição */}
              <button
                onClick={() => setLeadDestino("certificar")}
                className="w-full flex items-center gap-3 text-white font-bold py-3.5 px-4 rounded-xl transition-all text-sm"
                style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}
              >
                <Award className="w-5 h-5 shrink-0" />
                <span>Estou pronto, quero me certificar</span>
              </button>

              {/* Botão 3 — Edital/Comunicado (somente se cadastrado) */}
              {cert.editalUrl && (
                <a
                  href={cert.editalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 border border-blue-200 text-blue-700 font-medium py-3.5 px-4 rounded-xl hover:bg-blue-50 transition-colors text-sm"
                >
                  <FileText className="w-5 h-5 shrink-0" />
                  <span>Edital / Comunicado</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-100 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>A</div>
            <span className="font-bold text-gray-900">ANEFAC</span>
            <span className="text-gray-400 text-sm">Certificações</span>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} ANEFAC. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Popup de captura de lead */}
      {leadDestino && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,31,78,0.75)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">

            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-lg">Antes de continuar...</h2>
                  <p className="text-gray-400 text-xs">Só um segundo!</p>
                </div>
              </div>
              <button
                onClick={() => setLeadDestino(null)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Mensagem amigável */}
            <div className="px-6 pb-5">
              <p className="text-gray-600 text-sm leading-relaxed">
                Adoraríamos saber quem você é! Assim podemos te enviar informações relevantes e, caso precise de ajuda no caminho, nossa equipe poderá entrar em contato. 😊
              </p>
            </div>

            {/* Formulário */}
            <div className="px-6 space-y-3">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={leadNome}
                  onChange={(e) => setLeadNome(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                />
              </div>
            </div>

            {/* Botões */}
            <div className="p-6 space-y-2.5">
              <button
                onClick={() => prosseguir(true)}
                disabled={!leadNome.trim() || !leadEmail.trim()}
                className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => prosseguir(false)}
                className="w-full text-gray-400 hover:text-gray-600 text-xs py-2 transition-colors"
              >
                Prefiro não me identificar agora, continuar mesmo assim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
