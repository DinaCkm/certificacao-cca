import React, { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { ComiteModal } from "@/components/ComiteModal";
import { DocumentoModal } from "@/components/DocumentoModal";
import { ArrowRight, BookOpen, FileText, Shield, Users, Award, RotateCcw } from "lucide-react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useInstitucional } from "@/contexts/InstitucionalContext";

type ModalType = "comite" | "regulamento" | "edital" | "conduta" | null;

export function Home() {
  const { config } = useSiteConfig();
  const { institucional } = useInstitucional();
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        style={{ background: "linear-gradient(135deg, #0f1f4e 0%, #1e3a6e 40%, #1a4fa0 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #4a90e2 0%, transparent 70%)" }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #f5a623 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Award className="w-4 h-4 text-yellow-400" />
            {config.hero.badge}
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            {config.hero.titulo}{" "}
            <span className="text-yellow-400">{config.hero.tituloDestaque}</span>
          </h1>

          <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-12 leading-relaxed">
            {config.hero.subtitulo}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/certificacoes">
              <a className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl text-base">
                {config.hero.ctaPrimario}
                <ArrowRight className="w-5 h-5" />
              </a>
            </Link>
            <Link href="/como-funciona">
              <a className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-all text-base">
                {config.hero.ctaSecundario}
              </a>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-20 pt-12 border-t border-white/10">
            {[
              { valor: config.hero.stat1Valor, label: config.hero.stat1Label },
              { valor: config.hero.stat2Valor, label: config.hero.stat2Label },
              { valor: config.hero.stat3Valor, label: config.hero.stat3Label },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black text-yellow-400 mb-1">{stat.valor}</p>
                <p className="text-blue-300 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sobre o Programa ── */}
      <section id="sobre" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Sobre as Certificações ANEFAC
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {config.institucional.subtitulo}
            </p>
          </div>

          {/* Institutional cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {config.institucional.cards.map((card, i) => {
              const icons = [Award, Users, BookOpen];
              const colors = ["bg-blue-100 text-blue-700", "bg-yellow-100 text-yellow-700", "bg-green-100 text-green-700"];
              const Icon = icons[i] ?? Award;
              const isComite = i === 1;
              return (
                <div
                  key={i}
                  onClick={isComite ? () => setModal("comite") : undefined}
                  className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-shadow ${isComite ? "cursor-pointer hover:shadow-md hover:border-blue-200" : "hover:shadow-md"}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${colors[i] ?? "bg-gray-100 text-gray-600"}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{card.titulo}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{card.texto}</p>
                  {isComite && (
                    <p className="text-blue-600 text-xs font-semibold mt-3">Conheça o comitê →</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Document buttons */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Documentos do Programa</h3>
            <p className="text-sm text-gray-500 mb-6">Acesse os documentos oficiais do Programa de Certificação Profissional ANEFAC.</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setModal("regulamento")}
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 hover:border-blue-300 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                Regulamento
              </button>
              <button
                onClick={() => setModal("edital")}
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 hover:border-blue-300 transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                Edital de Candidatura
              </button>
              <button
                onClick={() => setModal("conduta")}
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 hover:border-blue-300 transition-colors"
              >
                <Shield className="w-4 h-4 text-blue-600" />
                Código de Conduta
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <Link href="/certificacoes">
              <a className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-white transition-all text-base shadow-md hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>
                Ver certificações disponíveis
                <ArrowRight className="w-5 h-5" />
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Aviso ── */}
      {config.aviso.visivel && (
        <div className="bg-amber-50 border-t border-amber-100 py-4">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs text-amber-700 text-center leading-relaxed">{config.aviso.texto}</p>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="py-10 border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>A</div>
            <span className="font-bold text-gray-900">ANEFAC</span>
            <span className="text-gray-400 text-sm">Certificações</span>
          </div>
          <p className="text-xs text-gray-400 text-center max-w-sm">{config.rodape.descricaoOrganizacao}</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/certificacoes"><a className="hover:text-gray-900 transition-colors">Certificações</a></Link>
            <Link href="/como-funciona"><a className="hover:text-gray-900 transition-colors">Como funciona</a></Link>
            <Link href="/simulacao"><a className="hover:text-gray-900 transition-colors">Simulação</a></Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-4 text-center">
          <p className="text-xs text-gray-400">{config.rodape.copyright}</p>
        </div>
      </footer>

      {/* ── Modals ── */}
      {modal === "comite" && <ComiteModal onClose={() => setModal(null)} />}
      {modal === "regulamento" && (
        <DocumentoModal
          titulo={institucional.regulamento.titulo}
          conteudo={institucional.regulamento.conteudo}
          urlExterna={institucional.regulamento.urlExterna}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "edital" && (
        <DocumentoModal
          titulo={institucional.edital.titulo}
          conteudo={institucional.edital.conteudo}
          urlExterna={institucional.edital.urlExterna}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "conduta" && (
        <DocumentoModal
          titulo={institucional.codigoConduta.titulo}
          conteudo={institucional.codigoConduta.conteudo}
          urlExterna={institucional.codigoConduta.urlExterna}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
