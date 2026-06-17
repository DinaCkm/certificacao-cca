import React from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Award, Users, BookOpen, Star } from "lucide-react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

export function Home() {
  const { config } = useSiteConfig();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        style={{ background: "linear-gradient(135deg, #0f1f4e 0%, #1e3a6e 40%, #1a4fa0 100%)" }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #4a90e2 0%, transparent 70%)" }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #f5a623 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white/90 text-sm font-medium">{config.hero.badge}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            {config.hero.titulo}{" "}
            <span className="text-yellow-400">{config.hero.tituloDestaque}</span>
          </h1>

          <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-12 leading-relaxed">
            {config.hero.subtitulo}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#sobre"
              onClick={(e) => { e.preventDefault(); document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl text-base cursor-pointer">
              Conheça as Certificações ANEFAC
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link href="/como-funciona">
              <a className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-all text-base">
                Como funciona
              </a>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-20 pt-12 border-t border-white/10">
            {[
              { valor: "4+", label: config.hero.stat1Label },
              { valor: "100%", label: config.hero.stat2Label },
              { valor: "2x", label: config.hero.stat3Label },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black text-yellow-400 mb-1">{stat.valor}</p>
                <p className="text-blue-300 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Section */}
      <section id="sobre" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Sobre as Certificações ANEFAC
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {config.hero.subtitulo}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                color: "bg-blue-100 text-blue-700",
                titulo: "Reconhecimento nacional",
                texto: "Certificações reconhecidas pelo mercado financeiro e de controladoria em todo o Brasil.",
              },
              {
                icon: Users,
                color: "bg-yellow-100 text-yellow-700",
                titulo: "Avaliação por especialistas",
                texto: "Banca composta por profissionais experientes que avaliam competências técnicas e comportamentais.",
              },
              {
                icon: BookOpen,
                color: "bg-green-100 text-green-700",
                titulo: "Processo estruturado",
                texto: "Fluxo claro e transparente: cadastro, análise documental, avaliação e emissão do certificado.",
              },
            ].map(({ icon: Icon, color, titulo, texto }, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{titulo}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{texto}</p>
              </div>
            ))}
          </div>

          {/* CTA after cards */}
          <div className="text-center mt-12">
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

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-6">
            Pronto para dar o próximo passo?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Explore as certificações disponíveis, entenda o processo e faça uma simulação dos seus conhecimentos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/certificacoes">
              <a className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-white transition-all text-base"
                style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>
                Ver certificações
                <ArrowRight className="w-5 h-5" />
              </a>
            </Link>
            <Link href="/simulacao">
              <a className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-xl hover:border-blue-300 hover:text-blue-700 transition-all text-base">
                Fazer simulação gratuita
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>A</div>
            <span className="font-bold text-gray-900">ANEFAC</span>
            <span className="text-gray-400 text-sm">Certificações</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/certificacoes"><a className="hover:text-gray-900 transition-colors">Certificações</a></Link>
            <Link href="/como-funciona"><a className="hover:text-gray-900 transition-colors">Como funciona</a></Link>
            <Link href="/simulacao"><a className="hover:text-gray-900 transition-colors">Simulação</a></Link>
            <Link href="/novo-fluxo/admin"><a className="hover:text-gray-900 transition-colors">Área admin</a></Link>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} ANEFAC. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
