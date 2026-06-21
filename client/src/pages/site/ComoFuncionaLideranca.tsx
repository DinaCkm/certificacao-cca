import { Link } from "wouter";

import { ArrowLeft, ArrowRight, Search, Users, BookOpen, ClipboardCheck, Award, CheckCircle, DollarSign } from "lucide-react";

const ETAPAS = [
  {
    numero: "01",
    icone: Search,
    titulo: "Entrevista Diagnóstica Inicial",
    descricao:
      "O participante realiza uma entrevista individual para análise de sua trajetória profissional, experiência em liderança, maturidade comportamental e aderência às competências da Certificação de Liderança EcodoBem.",
    cor: "bg-blue-100 text-blue-700",
    destaque: false,
  },
  {
    numero: "02",
    icone: Users,
    titulo: "Definição do Nível de Ingresso",
    descricao:
      "Com base na entrevista diagnóstica, a equipe responsável define o nível mais adequado para o participante iniciar sua jornada. O nível de ingresso é indicado pela avaliação diagnóstica e não elimina a obrigatoriedade da formação.",
    cor: "bg-purple-100 text-purple-700",
    destaque: true,
    nota: "A entrevista define o nível, mas não dispensa a formação obrigatória",
  },
  {
    numero: "03",
    icone: BookOpen,
    titulo: "Formação Obrigatória de 6 Meses",
    descricao:
      "Após a definição do nível, o participante realiza a formação obrigatória correspondente ao nível indicado. A formação tem duração de 6 meses e contempla aulas, webinares, avaliações por conteúdo, mentoria, projetos práticos e acompanhamento da evolução.",
    cor: "bg-indigo-100 text-indigo-700",
    destaque: true,
    nota: "Inclui: aulas · webinares ao vivo · mentoria · projetos práticos · acompanhamento",
  },
  {
    numero: "04",
    icone: ClipboardCheck,
    titulo: "Prova Final de Certificação",
    descricao:
      "Somente após concluir a formação obrigatória de 6 meses, o participante realiza a prova final referente ao nível cursado.",
    cor: "bg-orange-100 text-orange-700",
    destaque: false,
  },
  {
    numero: "05",
    icone: Award,
    titulo: "Certificação e Badge Digital",
    descricao:
      "O participante será certificado se concluir a formação, realizar as atividades obrigatórias, participar das avaliações previstas e atingir a pontuação mínima necessária na prova final. Após a aprovação, receberá o certificado e o badge digital correspondente ao nível conquistado.",
    cor: "bg-green-100 text-green-700",
    destaque: false,
  },
];

const NIVEIS = [
  {
    nivel: "N1",
    titulo: "Fundamentos da Liderança",
    cor: "bg-blue-500",
    publico: "Profissionais em desenvolvimento, potenciais líderes, jovens talentos e colaboradores indicados para futuras posições de liderança.",
    competencias: ["Atenção", "Autopercepção", "Disciplina", "Empatia", "Escuta Ativa", "Gestão de Tempo", "Memória", "Raciocínio Lógico e Espacial"],
  },
  {
    nivel: "N2",
    titulo: "Liderança Essencial",
    cor: "bg-green-500",
    publico: "Líderes iniciantes, supervisores, coordenadores em desenvolvimento, sucessores e responsáveis por pequenas equipes.",
    competencias: ["Adaptabilidade", "Leitura de Cenário", "Planejamento e Organização", "Comunicação Assertiva", "Inteligência Emocional", "Resiliência", "Proatividade"],
  },
  {
    nivel: "N3",
    titulo: "Liderança Master",
    cor: "bg-orange-500",
    publico: "Gestores, coordenadores experientes, gerentes, líderes de equipe e profissionais que respondem por metas, pessoas e projetos estratégicos.",
    competencias: ["Accountability", "Foco em Resultados", "Gestão de Conflitos", "Gestão de Equipes", "Influência", "Negociação", "Presença Executiva", "Tomada de Decisão", "Visão Estratégica"],
  },
  {
    nivel: "N4",
    titulo: "Liderança Estratégica do Futuro",
    cor: "bg-purple-500",
    publico: "Gerentes, executivos, líderes estratégicos, sucessores de alta responsabilidade e profissionais em preparação para posições de direção.",
    competencias: ["Mindset Visionário", "Arquitetura de Mudanças", "Radar de Cenários", "Mentalidade Sistêmica", "Estratégia de Longo Alcance", "Adaptabilidade Dinâmica", "Decisões Ágeis"],
  },
];

export function ComoFuncionaLideranca() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 45%, #1565c0 75%, #1976d2 100%)" }}>

      {/* Grid decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid2" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4fc3f7" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid2)" />
        </svg>
      </div>
      

      {/* Header */}
      <div className="pt-8" style={{ background: "linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 /10 text-green-200 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Award className="w-4 h-4" />
            Certificação de Liderança EcodoBem
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Como funciona
          </h1>
          <p className="text-green-200 text-lg max-w-2xl mx-auto">
            Entenda o fluxo completo da Certificação de Liderança EcodoBem — da entrevista diagnóstica à emissão do seu certificado e badge digital.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Regra geral */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Regra Geral — Formação Obrigatória</h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                A formação de 6 meses é obrigatória para todos os participantes, em todos os níveis da certificação. A entrevista diagnóstica inicial não substitui a formação — ela tem como finalidade identificar o nível mais adequado de ingresso. Somente após a conclusão da formação e das avaliações previstas, o participante estará apto a realizar a prova final de certificação.
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <h2 className="text-2xl font-black text-white mb-8">Fluxo obrigatório para todos os níveis</h2>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />
          <div className="space-y-8">
            {ETAPAS.map((etapa, idx) => {
              const Icon = etapa.icone;
              return (
                <div key={idx} className="relative flex gap-6">
                  <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${etapa.cor} shadow-sm`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className={`flex-1 bg-white rounded-2xl p-6 shadow-sm border ${etapa.destaque ? "border-green-200" : "border-white/10"}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-blue-400 tracking-widest">ETAPA {etapa.numero}</span>
                      {etapa.destaque && (
                        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                          Ponto de atenção
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{etapa.titulo}</h3>
                    <p className="text-blue-200 text-sm leading-relaxed">{etapa.descricao}</p>
                    {etapa.nota && (
                      <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="text-xs text-green-800 font-medium">{etapa.nota}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Investimento */}
        <div className="mt-16  rounded-2xl border border-white/10" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }} className=" overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Investimento da Formação</h2>
              <p className="text-blue-300 text-sm">Válido para todos os níveis da Certificação de Liderança EcodoBem</p>
            </div>
          </div>
          <div className="p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="text-center">
                <p className="text-4xl font-black text-green-700">6x</p>
                <p className="text-lg font-bold text-white">R$ 250,00</p>
                <p className="text-sm text-blue-300">parcelas mensais</p>
              </div>
              <div className="hidden sm:block w-px h-16 bg-gray-200" />
              <div className="text-center">
                <p className="text-4xl font-black text-white">R$ 1.500</p>
                <p className="text-sm text-blue-300">total da formação</p>
              </div>
              <div className="hidden sm:block w-px h-16 bg-gray-200" />
              <div className="text-center">
                <p className="text-4xl font-black text-white">R$ 250</p>
                <p className="text-sm text-blue-300">taxa de emissão do certificado</p>
              </div>
            </div>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                "Aulas de desenvolvimento correspondentes ao nível indicado",
                "Webinares ao vivo",
                "Avaliações por conteúdo",
                "Mentoria de desenvolvimento",
                "Projetos práticos",
                "Acompanhamento da evolução",
                "Preparação para a prova final de certificação",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-blue-200">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Níveis */}
        <div className="mt-16">
          <h2 className="text-2xl font-black text-white mb-2">Os 4 Níveis da Certificação</h2>
          <p className="text-blue-300 text-sm mb-8">O nível de ingresso é definido pela entrevista diagnóstica com base no seu perfil profissional.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {NIVEIS.map((n, i) => (
              <div key={i} className="rounded-2xl border border-white/10" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }} className=" overflow-hidden">
                <div className={`${n.cor} px-5 py-3 flex items-center gap-3`}>
                  <span className="text-white font-black text-lg">{n.nivel}</span>
                  <span className="text-white font-semibold text-sm">{n.titulo}</span>
                </div>
                <div className="p-5">
                  <p className="text-xs text-blue-300 mb-3 leading-relaxed">{n.publico}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {n.competencias.map((c, j) => (
                      <span key={j} className="text-xs bg-gray-100 text-blue-200 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botões de navegação */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/novo-fluxo/certificacoes">
            <a className="inline-flex items-center gap-2 border-2 border-white/10 text-blue-200 font-semibold px-8 py-4 rounded-xl hover:border-green-400 hover:text-green-700 transition-all text-base">
              <ArrowLeft className="w-5 h-5" />
              Voltar para Certificações
            </a>
          </Link>
          <Link href="/novo-fluxo/certificacoes">
            <a className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl transition-all text-base"
              style={{ background: "linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 100%)" }}>
              Inscrever-se agora
              <ArrowRight className="w-5 h-5" />
            </a>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/anefac-logo.png" alt="ANEFAC" className="h-8 w-auto" />
            <span className="font-bold text-white">ANEFAC</span>
            <span className="text-blue-400 text-sm">Certificações</span>
          </div>
          <p className="text-xs text-blue-400">© {new Date().getFullYear()} ANEFAC. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
