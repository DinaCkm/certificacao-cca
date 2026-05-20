import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">ANEFAC CCA</h1>
          <p className="text-xl text-gray-600">Protótipo - Sistema de Certificação</p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { step: 1, title: "Escolha da Jornada", desc: "Selecione o tipo de certificação" },
            { step: 2, title: "Cadastro Minucioso", desc: "Preencha seus dados profissionais" },
            { step: 3, title: "Compra", desc: "Finalize o pagamento" },
            { step: 4, title: "Prova/Preparatório", desc: "Realize a avaliação" },
            { step: 5, title: "Resultado", desc: "Veja seu desempenho" },
            { step: 6, title: "Upload Documental", desc: "Envie seus documentos" },
            { step: 7, title: "Entrevista Técnica", desc: "Validação com a comissão" },
            { step: 8, title: "Decisão Final", desc: "Resultado da comissão" },
            { step: 9, title: "Certificado", desc: "Receba seu diploma" },
          ].map((item) => (
            <Link key={item.step} href={`/step-${item.step}`}>
              <a>
                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-blue-900/20 hover:border-blue-900">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-blue-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              </a>
            </Link>
          ))}
        </div>

        {/* Test Links */}
        <div className="mb-8 p-4 bg-amber-50 border-2 border-amber-300 rounded">
          <p className="text-sm text-amber-900 font-semibold mb-3">Links de Teste Rápido:</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/courses-platform?recovery=true">
              <a className="text-blue-600 hover:underline text-sm">Cursos de Recuperação</a>
            </Link>
            <Link href="/retake-exam-checkout">
              <a className="text-blue-600 hover:underline text-sm">Checkout Re-Prova</a>
            </Link>
            <Link href="/recovery-checkout">
              <a className="text-blue-600 hover:underline text-sm">Checkout Recuperação</a>
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">Sobre o Protótipo</h3>
          <p className="text-gray-700">
            Este é um protótipo navegável que demonstra o fluxo completo do sistema de certificação CCA. 
            Clique em qualquer etapa acima para explorar a jornada do usuário.
          </p>
        </Card>
      </div>
    </div>
  );
}
