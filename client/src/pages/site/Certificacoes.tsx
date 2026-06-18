import React, { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useCertification } from "@/contexts/CertificationContext";
import { useInstitucional } from "@/contexts/InstitucionalContext";
import { DocumentoModal } from "@/components/DocumentoModal";
import { ArrowRight, FileText, Clock, DollarSign, Users, ChevronDown, ChevronUp, Info } from "lucide-react";

export function Certificacoes() {
  const { certifications } = useCertification();
  const { institucional } = useInstitucional();
  const ativas = (certifications || []).filter((c) => c.status === "ativa" || c.status === "em_breve");
  const [expandida, setExpandida] = useState<number | null>(null);
  const [modalEdital, setModalEdital] = useState(false);

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
                      <div className="flex flex-col gap-2 shrink-0">
                        {cert.status === "em_breve" ? (
                          <span className="inline-flex items-center gap-2 text-gray-500 bg-gray-100 font-bold px-5 py-2.5 rounded-xl text-sm cursor-not-allowed">
                            Em breve
                          </span>
                        ) : (
                          <Link href={`/certificacoes/${cert.id}`}>
                            <a className="inline-flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg"
                              style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>
                              Inscrever-se
                              <ArrowRight className="w-4 h-4" />
                            </a>
                          </Link>
                        )}
                        <Link href={cert.id.startsWith('ecodobem-') ? '/como-funciona-lideranca' : '/como-funciona'}>
                          <a className="inline-flex items-center gap-2 border border-blue-200 text-blue-700 font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors">
                            <Info className="w-4 h-4" />
                            Como funciona
                          </a>
                        </Link>
                        <button
                          onClick={() => setModalEdital(true)}
                          className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                          Leia o Edital
                        </button>
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

      {/* Modals */}
      {modalEdital && (
        <DocumentoModal
          titulo={institucional.edital.titulo}
          conteudo={institucional.edital.conteudo}
          urlExterna={institucional.edital.urlExterna}
          onClose={() => setModalEdital(false)}
        />
      )}

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
    </div>
  );
}
