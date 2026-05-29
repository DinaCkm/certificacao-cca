import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-3">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-1">ANEFAC CCA</h1>
          <p className="text-sm text-gray-600">Protótipo - Sistema de Certificação</p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {[
            { step: 1, title: "Escolha da Jornada", desc: "Selecione o tipo de certificação" },
            { step: 2, title: "Perfil Profissional", desc: "Preencha seus dados profissionais" },
            { step: 3, title: "Compra", desc: "Finalize o pagamento" },
            { step: 4, title: "Prova/Preparatório", desc: "Realize a avaliação" },
            { step: 5, title: "Resultado", desc: "Veja seu desempenho" },
            { step: 6, title: "Upload Documental", desc: "Envie seus documentos" },
            { step: 7, title: "Entrevista Técnica", desc: "Validação com a comissão" },
            { step: 8, title: "Decisão Final", desc: "Resultado da comissão" },
            { step: 9, title: "Certificado", desc: "Receba seu diploma" },
          ].map((item) => (
            <Link key={item.step} href={`/step-${item.step}`}>
              <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-2 border-blue-900/20 hover:border-blue-900">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-blue-900">{item.title}</h3>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mb-6 text-center">
          <Link href="/certification-type">
            <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-2 text-sm">
              Iniciar Certificação →
            </Button>
          </Link>
        </div>

        {/* Test Links */}
        <div className="mb-6 p-3 bg-amber-50 border-2 border-amber-300 rounded">
          <p className="text-xs text-amber-900 font-semibold mb-2">Links de Teste Rápido:</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/certification-type">
              <a className="text-blue-600 hover:underline text-sm">Iniciar do Zero</a>
            </Link>
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
        <Card className="p-4 bg-blue-50 border-2 border-blue-200">
          <h3 className="font-bold text-sm text-blue-900 mb-1">Sobre o Protótipo</h3>
          <p className="text-sm text-gray-700">
            Este é um protótipo navegável que demonstra o fluxo completo do sistema de certificação ANEFAC. 
            Clique em "Iniciar Certificação" acima ou em qualquer etapa para explorar a jornada do usuário.
          </p>
        </Card>
      </div>
    </div>
  );
}
