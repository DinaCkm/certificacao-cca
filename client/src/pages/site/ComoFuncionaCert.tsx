import React from "react";
import { Link, useParams } from "wouter";
// Navbar removida — layout imersivo ANEFAC
import { useCertification } from "@/contexts/CertificationContext";
import { ArrowLeft, CheckCircle, DollarSign, Info, BookOpen, AlertCircle } from "lucide-react";

export function ComoFuncionaCert() {
  const params = useParams<{ id: string }>();
  const { certifications } = useCertification();

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

  const cf = cert.comoFunciona;

  if (!cf || cf.etapas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16" style={{ background: "linear-gradient(135deg, #0f1f4e 0%, #1e3a6e 100%)" }}>
          <div className="max-w-5xl mx-auto px-6 py-16">
            <Link href="/novo-fluxo/certificacoes">
              <a className="inline-flex items-center gap-2 text-blue-300 hover:text-white text-sm mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Voltar para certificações
              </a>
            </Link>
            <h1 className="text-3xl font-black text-white mb-2">Como funciona</h1>
            <p className="text-blue-300">{cert.nome}</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 inline-block">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="text-amber-800 font-semibold">Conteúdo ainda não configurado</p>
            <p className="text-amber-600 text-sm mt-1">O administrador ainda não preencheu as informações de "Como funciona" para esta certificação.</p>
          </div>
        </div>
      </div>
    );
  }

  // Cor de acento baseada na cor da certificação
  const accentMap: Record<string, { bg: string; text: string; light: string; badge: string }> = {
    blue:   { bg: "#1e3a6e", text: "#1e3a6e", light: "#eff6ff", badge: "#dbeafe" },
    gold:   { bg: "#b45309", text: "#b45309", light: "#fffbeb", badge: "#fef3c7" },
    green:  { bg: "#15803d", text: "#15803d", light: "#f0fdf4", badge: "#dcfce7" },
    purple: { bg: "#7e22ce", text: "#7e22ce", light: "#faf5ff", badge: "#f3e8ff" },
    orange: { bg: "#c2410c", text: "#c2410c", light: "#fff7ed", badge: "#ffedd5" },
    teal:   { bg: "#0f766e", text: "#0f766e", light: "#f0fdfa", badge: "#ccfbf1" },
    red:    { bg: "#b91c1c", text: "#b91c1c", light: "#fef2f2", badge: "#fee2e2" },
  };
  const accent = accentMap[cert.cor] || accentMap.blue;

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
          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shrink-0"
              style={{ background: accent.bg }}
            >
              {cert.numero}
            </div>
            <div>
              <p className="text-blue-300 text-sm font-medium mb-1">{cert.subtitulo}</p>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                {cf.titulo || `Como funciona — ${cert.nome}`}
              </h1>
              {cf.subtitulo && (
                <p className="text-blue-200 text-base max-w-2xl leading-relaxed">{cf.subtitulo}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-14 relative z-10">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Etapas — coluna principal */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3">
              <BookOpen className="w-5 h-5" style={{ color: accent.text }} />
              Etapas do processo
            </h2>

            <div className="relative">
              {/* Linha vertical conectora */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 opacity-30" style={{ background: "#4fc3f7" }} aria-hidden="true" />

              <div className="space-y-6">
                {cf.etapas.map((etapa, i) => (
                  <div key={i} className="relative flex gap-5">
                    {/* Número */}
                    <div
                      className="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm"
                      style={{ background: accent.bg }}
                    >
                      {etapa.numero}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 rounded-2xl border border-white/10 shadow-sm p-5 mb-1" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }}>
                      <h3 className="font-bold text-white mb-2">{etapa.titulo}</h3>
                      <p className="text-blue-200 text-sm leading-relaxed">{etapa.descricao}</p>
                      {etapa.nota && (
                        <div className="mt-3 space-y-2">
                          {etapa.nota.split('\n\n').map((bloco, bi) => (
                            <div
                              key={bi}
                              className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
                              style={{ background: accent.light, color: accent.text }}
                            >
                              <Info className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{bloco}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Investimento */}
            {cf.investimento && (
              <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(79,195,247,0.2)" }}>
                    <DollarSign className="w-5 h-5" style={{ color: "#4fc3f7" }} />
                  </div>
                  <h3 className="font-bold text-white">Investimento</h3>
                </div>
                <p className="text-blue-200 text-sm leading-relaxed font-medium">{cf.investimento}</p>
              </div>
            )}

            {/* O que está incluído */}
            {cf.inclusoes && (
              <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(79,195,247,0.2)" }}>
                    <CheckCircle className="w-5 h-5" style={{ color: "#4fc3f7" }} />
                  </div>
                  <h3 className="font-bold text-white">O que está incluído</h3>
                </div>
                <div className="space-y-1.5">
                  {cf.inclusoes.split("·").map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-blue-200">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: accent.text }} />
                      {item.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observações */}
            {cf.observacoes && (
              <div className="rounded-2xl border p-5" style={{ background: accent.light, borderColor: accent.badge }}>
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accent.text }} />
                  <p className="text-sm leading-relaxed" style={{ color: accent.text }}>{cf.observacoes}</p>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="rounded-2xl border border-white/20 p-6 space-y-3" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
              {/* Botão preparação */}
              <Link href="/cursos">
                <a className="w-full flex items-center gap-3 bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold py-3.5 px-4 rounded-xl transition-all text-sm">
                  <BookOpen className="w-5 h-5 shrink-0" />
                  <span>Quero me preparar antes de fazer a certificação</span>
                </a>
              </Link>

              {/* Botão inscrição — vai para /novo-fluxo/certificacoes onde abre o mini-cadastro */}
              <Link href={"/novo-fluxo/certificacoes"}>
                <a
                  className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl transition-all text-sm hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${accent.bg} 0%, #2d5be3 100%)` }}
                >
                  Estou pronto, quero me certificar
                </a>
              </Link>

              {/* Voltar */}
              <Link href="/novo-fluxo/certificacoes">
                <a className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  Ver todas as certificações
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 border-t border-white/10 mt-4 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>A</div>
            <span className="font-bold text-white">ANEFAC</span>
            <span className="text-blue-300 text-sm">Certificações</span>
          </div>
          <p className="text-xs text-blue-400">© {new Date().getFullYear()} ANEFAC. Todos os direitos reservados.</p>
        </div>
      </footer>
      </div>
    </div>
  );
}
