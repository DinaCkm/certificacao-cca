import React from "react";
import { Link, useParams, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useCertification } from "@/contexts/CertificationContext";
import { ArrowRight, FileText, DollarSign, Clock, Users, CheckCircle, ExternalLink, ArrowLeft } from "lucide-react";

export function CertificacaoDetalhe() {
  const params = useParams<{ id: string }>();
  const { certificacoes, iniciarProcesso } = useCertification();
  const [, navigate] = useLocation();

  const cert = certificacoes.find((c) => c.id === params.id);

  if (!cert) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 text-center px-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Certificação não encontrada</h1>
          <Link href="/certificacoes">
            <a className="text-blue-700 font-medium hover:underline">← Voltar para certificações</a>
          </Link>
        </div>
      </div>
    );
  }

  const handleInscrever = () => {
    iniciarProcesso(cert.id);
    navigate("/novo-fluxo/cadastro");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="pt-16" style={{ background: "linear-gradient(135deg, #0f1f4e 0%, #1e3a6e 100%)" }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <Link href="/certificacoes">
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

            {/* Edital */}
            {cert.editalUrl && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-blue-900 mb-1">Edital da Certificação {cert.numero}</h2>
                    <p className="text-blue-700 text-sm mb-4">
                      Leia o edital completo antes de se inscrever. Ele contém todas as regras, critérios de avaliação e informações sobre o processo.
                    </p>
                    <a
                      href={cert.editalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-800 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Abrir edital (PDF)
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {!cert.editalUrl && (
              <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-500 text-sm">O edital desta certificação ainda não foi publicado. Acompanhe as atualizações.</p>
                </div>
              </div>
            )}
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
                    <span className="text-sm text-gray-600">Taxa de análise</span>
                  </div>
                  <span className="font-bold text-gray-900 text-sm">
                    R$ {cert.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Taxa de emissão</span>
                  </div>
                  <span className="font-bold text-gray-900 text-sm">
                    R$ {cert.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mt-3">
                <p className="text-xs text-gray-500 leading-relaxed">
                  A taxa de análise é paga antes do upload de documentos e cobre todo o processo de avaliação. A taxa de emissão é paga somente após aprovação final.
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

            {/* CTA */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-2">Pronto para se inscrever?</h3>
              <p className="text-gray-500 text-sm mb-5">
                Inicie o processo agora. Você precisará de cerca de 10 minutos para preencher o cadastro.
              </p>
              <button
                onClick={handleInscrever}
                className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl transition-all text-base"
                style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}
              >
                Iniciar inscrição
                <ArrowRight className="w-5 h-5" />
              </button>
              {cert.editalUrl && (
                <a
                  href={cert.editalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-3 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Ler o edital antes
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
    </div>
  );
}
