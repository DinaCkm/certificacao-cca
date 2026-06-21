import React, { useState } from "react";
import { useLocation } from "wouter";
import { useCertification } from "@/contexts/CertificationContext";
import { BoasVindasModal } from "@/pages/novo-fluxo/BoasVindasModal";
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

  const handleQueroMeCertificar = (cert: any) => {
    setCertSelecionada(cert);
    // Se já tem dados do mini-cadastro na sessão, vai direto
    const preData = sessionStorage.getItem("anefac_pre_dados");
    if (preData) {
      selecionarCertificacao(cert);
      navigate("/novo-fluxo/cadastro");
      return;
    }
    setBoasVindasAberto(true);
  };

  const handleBoasVindasSuccess = (dados: any) => {
    sessionStorage.setItem("anefac_pre_dados", JSON.stringify(dados));
    setBoasVindasAberto(false);
    if (certSelecionada) {
      selecionarCertificacao(certSelecionada);
      navigate("/novo-fluxo/cadastro");
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
                          <p className="text-blue-200 text-sm leading-relaxed">{cert.descricaBreve || cert.descricao}</p>

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
                              <button onClick={() => handleQueroMeCertificar(cert)}
                                className="flex items-center justify-center gap-2 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all hover:scale-105 hover:shadow-xl"
                                style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
                                <Award className="w-4 h-4" />
                                Quero me certificar
                              </button>
                              <button onClick={() => navigate("/cursos")}
                                className="flex items-center justify-center gap-2 font-bold px-5 py-3 rounded-xl text-sm transition-all hover:scale-105"
                                style={{ background: "linear-gradient(135deg, #1B7A6B, #0f4d43)", color: "white" }}>
                                <BookOpen className="w-4 h-4" />
                                Quero me preparar
                              </button>
                              <button onClick={() => setExpandida(expandida === idx ? null : idx)}
                                className="flex items-center justify-center gap-2 border border-white/20 text-blue-200 hover:text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">
                                <FileText className="w-4 h-4" />
                                {expandida === idx ? "Ver menos" : "Saiba mais"}
                                {expandida === idx ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                              {cert.editalUrl && (
                                <a href={cert.editalUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 border border-white/10 text-white/50 hover:text-white/80 px-5 py-2.5 rounded-xl text-xs transition-colors">
                                  <ExternalLink className="w-3 h-3" /> Edital
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

            {/* CTA final */}
            <div className="mt-12 text-center pb-16">
              <p className="text-blue-300 text-sm mb-4">Já tem cadastro? Continue seu processo de onde parou.</p>
              <button onClick={() => navigate("/novo-fluxo")}
                className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white px-6 py-3 rounded-xl text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar à página inicial
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mini-cadastro */}
      {boasVindasAberto && (
        <BoasVindasModal
          open={boasVindasAberto}
          onClose={() => setBoasVindasAberto(false)}
          onSuccess={handleBoasVindasSuccess}
        />
      )}
    </div>
  );
}
