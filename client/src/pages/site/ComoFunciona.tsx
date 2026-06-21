import React from "react";
import { Link } from "wouter";
import {
  ArrowRight, UserPlus, CreditCard, Upload, Shield,
  BookOpen, Video, Award, CheckCircle, ArrowLeft, ChevronRight
} from "lucide-react";

const ETAPAS = [
  { numero: "01", icone: UserPlus,   titulo: "Cadastro",                       descricao: "Preencha seus dados pessoais e profissionais. Escolha a certificação desejada e inicie o processo.", cor: "#6B3FA0", destaque: false },
  { numero: "02", icone: CreditCard, titulo: "Pagamento 1 — Taxa de Análise",  descricao: "Realize o pagamento da taxa de análise documental. Este pagamento cobre toda a fase de avaliação: análise dos documentos, prova (se aplicável) e entrevista técnica.", cor: "#b8860b", destaque: true, nota: "Inclui: análise + prova/entrevista" },
  { numero: "03", icone: Upload,     titulo: "Upload de Documentos",            descricao: "Envie os documentos comprobatórios exigidos para a certificação escolhida. Todos os arquivos devem estar legíveis e no formato correto.", cor: "#1a4a9e" },
  { numero: "04", icone: Shield,     titulo: "Validação Documental",            descricao: "Sua documentação será avaliada pela banca examinadora. A decisão de liberação será publicada no mural do aluno e enviada por e-mail com os próximos passos.", cor: "#1B7A6B" },
  { numero: "05", icone: BookOpen,   titulo: "Avaliação (Prova ou Entrevista)", descricao: "Dependendo da decisão da banca, você pode seguir diretamente para a entrevista técnica (Caminho A) ou realizar uma prova de competência antes da entrevista (Caminho B).", cor: "#8B2020", destaque: true, nota: "Caminho A: direto para entrevista | Caminho B: prova → entrevista" },
  { numero: "06", icone: CreditCard, titulo: "Pagamento 2 — Taxa de Emissão",  descricao: "Somente após aprovação final na entrevista, você realiza o pagamento da taxa de emissão do certificado.", cor: "#0a6e4f" },
  { numero: "07", icone: Award,      titulo: "Emissão do Certificado",          descricao: "Seu certificado digital é emitido e enviado por e-mail em até 5 dias úteis após a confirmação do pagamento.", cor: "#b8860b" },
];

export function ComoFunciona() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 45%, #1565c0 75%, #1976d2 100%)" }}>

      {/* Grid decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4fc3f7" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 px-6 py-10">
        <div className="max-w-3xl mx-auto">

          {/* Voltar */}
          <Link href="/novo-fluxo/certificacoes">
            <a className="inline-flex items-center gap-2 text-blue-300 hover:text-white text-sm mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar para certificações
            </a>
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <img src="/logo-anefac.png" alt="ANEFAC" className="h-12 mx-auto mb-5 drop-shadow-xl"
              onError={e => { (e.target as any).style.display = "none"; }} />
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Como <span style={{ color: "#4fc3f7" }}>funciona</span>
            </h1>
            <p className="text-blue-200 text-lg max-w-xl mx-auto">
              Entenda cada etapa do processo de certificação ANEFAC, do cadastro à emissão do seu certificado.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative space-y-4 mb-12">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 hidden md:block" style={{ background: "linear-gradient(to bottom, #6B3FA0, #4fc3f7)" }} />
            {ETAPAS.map((etapa, idx) => {
              const Icon = etapa.icone;
              return (
                <div key={idx} className="relative flex gap-5">
                  <div className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                    style={{ background: etapa.cor }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 rounded-2xl p-5 border border-white/10"
                    style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold tracking-widest" style={{ color: "#4fc3f7" }}>ETAPA {etapa.numero}</span>
                      {etapa.destaque && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,200,0,0.2)", color: "#ffd700" }}>
                          Atenção
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white mb-1">{etapa.titulo}</h3>
                    <p className="text-blue-200 text-sm leading-relaxed">{etapa.descricao}</p>
                    {etapa.nota && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 border border-white/10"
                        style={{ background: "rgba(79,195,247,0.1)" }}>
                        <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#4fc3f7" }} />
                        <span className="text-xs font-medium" style={{ color: "#4fc3f7" }}>{etapa.nota}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Caminhos A e B */}
          <div className="rounded-2xl overflow-hidden border border-white/10 mb-12"
            style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)" }}>
            <div className="px-6 py-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Entendendo os Caminhos A e B</h2>
              <p className="text-blue-300 text-sm mt-1">A banca avaliadora define o caminho após analisar seus documentos.</p>
            </div>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#1B7A6B" }}>
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-widest block" style={{ color: "#4fc3f7" }}>CAMINHO A</span>
                    <h3 className="font-bold text-white">Direto para entrevista</h3>
                  </div>
                </div>
                <p className="text-sm text-blue-200 leading-relaxed">A banca avalia que seu perfil e documentação são suficientes para ir diretamente à entrevista técnica, sem necessidade de prova escrita.</p>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#8B2020" }}>
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-widest block" style={{ color: "#ffd700" }}>CAMINHO B</span>
                    <h3 className="font-bold text-white">Prova + entrevista</h3>
                  </div>
                </div>
                <p className="text-sm text-blue-200 leading-relaxed">A banca solicita que você realize uma prova de competência antes da entrevista. Você tem direito a 2 tentativas. Após aprovação na prova, segue para a entrevista.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pb-16">
            <p className="text-blue-300 mb-6 text-sm">Pronto para começar?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/novo-fluxo/certificacoes">
                <a className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 hover:shadow-xl"
                  style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
                  Ver certificações disponíveis <ArrowRight className="w-5 h-5" />
                </a>
              </Link>
              <Link href="/simulacao">
                <a className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white font-medium px-8 py-4 rounded-xl transition-colors">
                  Fazer simulação gratuita
                </a>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
