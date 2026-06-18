import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useCertification } from "@/contexts/CertificationContext";
import { ArrowRight, FileText, Clock, DollarSign, Users, ChevronDown, ChevronUp, BookOpen, Award, X, User, Mail, Heart, ExternalLink } from "lucide-react";

type LeadDestino = "cursos" | "certificar" | null;

interface LeadState {
  certId: string;
  destino: LeadDestino;
}

export function Certificacoes() {
  const { certifications, selecionarCertificacao } = useCertification();
  const [, navigate] = useLocation();
  const ativas = (certifications || []).filter((c) => c.status === "ativa" || c.status === "em_breve");
  const [expandida, setExpandida] = useState<number | null>(null);

  // Lead capture popup — verifica se já foi identificado nesta sessão
  const jaIdentificado = () => !!sessionStorage.getItem("anefac_lead_nome");

  const [leadState, setLeadState] = useState<LeadState | null>(null);
  const [leadNome, setLeadNome] = useState("");
  const [leadEmail, setLeadEmail] = useState("");

  const navegar = (certId: string, destino: LeadDestino) => {
    const cert = (certifications || []).find((c) => c.id === certId);
    if (destino === "cursos") {
      navigate("/cursos");
    } else if (destino === "certificar" && cert) {
      selecionarCertificacao(cert);
      navigate("/novo-fluxo/cadastro");
    }
  };

  const abrirPopup = (certId: string, destino: LeadDestino) => {
    if (jaIdentificado()) {
      // Já identificado — navega direto sem popup
      navegar(certId, destino);
      return;
    }
    setLeadState({ certId, destino });
    setLeadNome("");
    setLeadEmail("");
  };

  const prosseguir = (identificado: boolean) => {
    if (!leadState) return;
    const cert = (certifications || []).find((c) => c.id === leadState.certId);

    if (identificado && leadNome.trim() && leadEmail.trim()) {
      // Salva na sessão para não pedir novamente
      sessionStorage.setItem("anefac_lead_nome", leadNome.trim());
      sessionStorage.setItem("anefac_lead_email", leadEmail.trim());
      // Salva no histórico de leads
      const leads = JSON.parse(localStorage.getItem("anefac_leads") || "[]");
      leads.push({
        nome: leadNome.trim(),
        email: leadEmail.trim(),
        certId: leadState.certId,
        certNome: cert?.nome || "",
        destino: leadState.destino,
        data: new Date().toISOString(),
      });
      localStorage.setItem("anefac_leads", JSON.stringify(leads));
    }

    const destino = leadState.destino;
    const certId = leadState.certId;
    setLeadState(null);
    navegar(certId, destino);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="pt-16" style={{ background: "linear-gradient(135deg, #0f1f4e 0%, #1e3a6e 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Certificações Disponíveis
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Escolha a certificação que melhor se alinha ao seu perfil profissional e inicie seu processo de certificação.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {ativas.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">Nenhuma certificação disponível no momento.</p>
            <p className="text-gray-400 text-sm mt-2">Volte em breve para conferir as novidades.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {ativas.map((cert, idx) => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Imagem de capa */}
                {cert.imagemUrl && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={cert.imagemUrl}
                      alt={cert.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Card Header */}
                <div className="flex items-start gap-6 p-8">
                  {/* Number Badge */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shrink-0"
                    style={{ background: cert.cor || "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}
                  >
                    {cert.numero}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h2 className="text-xl font-black text-gray-900 mb-1">{cert.nome}</h2>
                        <p className="text-blue-700 font-medium text-sm mb-3">{cert.subtitulo}</p>
                        <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">{cert.descricao}</p>
                      </div>

                      {/* Botões */}
                      <div className="flex flex-col gap-2 shrink-0 min-w-[220px]">
                        {cert.status === "em_breve" ? (
                          <span className="inline-flex items-center gap-2 text-gray-500 bg-gray-100 font-bold px-5 py-2.5 rounded-xl text-sm cursor-not-allowed justify-center">
                            Em breve
                          </span>
                        ) : (
                          <>
                            {/* Botão 1 — Preparação */}
                            <button
                              onClick={() => abrirPopup(cert.id, "cursos")}
                              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
                            >
                              <BookOpen className="w-4 h-4 shrink-0" />
                              <span>Quero me preparar</span>
                            </button>

                            {/* Botão 2 — Certificar */}
                            <button
                              onClick={() => abrirPopup(cert.id, "certificar")}
                              className="inline-flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg"
                              style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}
                            >
                              <Award className="w-4 h-4 shrink-0" />
                              <span>Quero me certificar</span>
                            </button>

                            {/* Botão 3 — Como funciona */}
                            <Link href={`/como-funciona/${cert.id}`}>
                              <a className="inline-flex items-center gap-2 border border-blue-200 text-blue-700 font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors">
                                <FileText className="w-4 h-4 shrink-0" />
                                <span>Como funciona</span>
                              </a>
                            </Link>

                            {/* Botão 4 — Edital (somente se cadastrado) */}
                            {cert.editalUrl && (
                              <a
                                href={cert.editalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                              >
                                <FileText className="w-4 h-4 shrink-0 text-blue-500" />
                                <span>Edital / Comunicado</span>
                                <ExternalLink className="w-3 h-3 ml-auto" />
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span>Taxa de análise: <strong className="text-gray-900">R$ {cert.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span>Taxa de emissão: <strong className="text-gray-900">R$ {cert.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Prazo de análise: <strong className="text-gray-900">5 a 10 dias úteis</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>Público: <strong className="text-gray-900">{cert.publicoAlvo}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable: Competências */}
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => setExpandida(expandida === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-8 py-4 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <span>Ver competências avaliadas ({cert.competencias.length})</span>
                    {expandida === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {expandida === idx && (
                    <div className="px-8 pb-6">
                      <div className="grid sm:grid-cols-2 gap-2">
                        {cert.competencias.map((comp, ci) => (
                          <div key={ci} className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            {comp}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-100 bg-white">
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
      {leadState && (
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
                onClick={() => setLeadState(null)}
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
