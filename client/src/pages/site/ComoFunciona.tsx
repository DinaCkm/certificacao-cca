import React from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, UserPlus, CreditCard, Upload, Shield, BookOpen, Video, Award, CheckCircle } from "lucide-react";

const ETAPAS = [
  {
    numero: "01",
    icone: UserPlus,
    titulo: "Cadastro",
    descricao: "Preencha seus dados pessoais e profissionais. Escolha a certificação desejada e inicie o processo.",
    cor: "bg-blue-100 text-blue-700",
    destaque: false,
  },
  {
    numero: "02",
    icone: CreditCard,
    titulo: "Pagamento 1 — Taxa de Análise",
    descricao: "Realize o pagamento da taxa de análise documental. Este pagamento cobre toda a fase de avaliação: análise dos documentos, prova (se aplicável) e entrevista técnica.",
    cor: "bg-yellow-100 text-yellow-700",
    destaque: true,
    nota: "Inclui: análise + prova/entrevista",
  },
  {
    numero: "03",
    icone: Upload,
    titulo: "Upload de Documentos",
    descricao: "Envie os documentos comprobatórios exigidos para a certificação escolhida. Todos os arquivos devem estar legíveis e no formato correto.",
    cor: "bg-purple-100 text-purple-700",
    destaque: false,
  },
  {
    numero: "04",
    icone: Shield,
    titulo: "Validação Documental",
    descricao: "Sua documentação será avaliada pela banca examinadora. A decisão de liberação para a Certificação Controller ou Controller Plus será publicada no mural do aluno. Você também receberá um e-mail informando a decisão da banca e os próximos passos.",
    cor: "bg-indigo-100 text-indigo-700",
    destaque: false,
  },
  {
    numero: "05",
    icone: BookOpen,
    titulo: "Avaliação (Prova ou Entrevista)",
    descricao: "Dependendo da decisão da banca, você pode seguir diretamente para a entrevista técnica (Caminho A) ou realizar uma prova de competência antes da entrevista (Caminho B).",
    cor: "bg-orange-100 text-orange-700",
    destaque: true,
    nota: "Caminho A: direto para entrevista | Caminho B: prova → entrevista",
  },
  {
    numero: "06",
    icone: CreditCard,
    titulo: "Pagamento 2 — Taxa de Emissão",
    descricao: "Somente após aprovação final na entrevista, você realiza o pagamento da taxa de emissão do certificado.",
    cor: "bg-green-100 text-green-700",
    destaque: false,
  },
  {
    numero: "07",
    icone: Award,
    titulo: "Emissão do Certificado",
    descricao: "Seu certificado digital é emitido e enviado por e-mail em até 5 dias úteis após a confirmação do pagamento.",
    cor: "bg-yellow-100 text-yellow-700",
    destaque: false,
  },
];

export function ComoFunciona() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="pt-16" style={{ background: "linear-gradient(135deg, #0f1f4e 0%, #1e3a6e 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Como funciona
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Entenda cada etapa do processo de certificação ANEFAC, do cadastro à emissão do seu certificado.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />

          <div className="space-y-8">
            {ETAPAS.map((etapa, idx) => {
              const Icon = etapa.icone;
              return (
                <div key={idx} className="relative flex gap-6">
                  {/* Step circle */}
                  <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${etapa.cor} shadow-sm`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <div className={`flex-1 bg-white rounded-2xl p-6 shadow-sm border ${etapa.destaque ? "border-blue-200" : "border-gray-100"}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-gray-400 tracking-widest">ETAPA {etapa.numero}</span>
                      {etapa.destaque && (
                        <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                          Ponto de atenção
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{etapa.titulo}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{etapa.descricao}</p>
                    {etapa.nota && (
                      <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-xs text-blue-800 font-medium">{etapa.nota}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Caminhos A e B */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Entendendo os Caminhos A e B</h2>
            <p className="text-gray-500 text-sm mt-1">A banca avaliadora define o caminho após analisar seus documentos.</p>
          </div>
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Video className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <span className="text-xs font-bold text-green-600 tracking-widest block">CAMINHO A</span>
                  <h3 className="font-bold text-gray-900">Direto para entrevista</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                A banca avalia que seu perfil e documentação são suficientes para ir diretamente à entrevista técnica, sem necessidade de prova escrita.
              </p>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <span className="text-xs font-bold text-orange-600 tracking-widest block">CAMINHO B</span>
                  <h3 className="font-bold text-gray-900">Prova + entrevista</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                A banca solicita que você realize uma prova de competência antes da entrevista. Você tem direito a 2 tentativas. Após aprovação na prova, segue para a entrevista.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-6">Pronto para começar?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/certificacoes">
              <a className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl transition-all text-base"
                style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>
                Ver certificações disponíveis
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
    </div>
  );
}
