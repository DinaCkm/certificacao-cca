import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-3">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-1">ANEFAC</h1>
          <p className="text-sm text-gray-600">Protótipo - Sistema de Certificação Multi-Certificações</p>
        </div>

        {/* Certifications Overview */}
        <div className="mb-8 grid md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
            <h3 className="font-bold text-blue-900 mb-2">🎓 CAC</h3>
            <p className="text-xs text-gray-700 mb-2">
              <strong>Certificação Controller ANEFAC</strong>
            </p>
            <p className="text-xs text-gray-600 mb-3">
              Voltada para profissionais de controladoria que buscam comprovar educação continuada e capacitação em 8 áreas: contabilidade, economia, finanças, tributos, administração, governança, tecnologia e capital humano.
            </p>
            <p className="text-xs font-semibold text-blue-900">Requisitos:</p>
            <ul className="text-xs text-gray-700 list-disc list-inside">
              <li>CAC: 2+ anos de experiência em controladoria</li>
              <li>CAC Plus: Executivos com consolidação em grandes empresas</li>
            </ul>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
            <h3 className="font-bold text-green-900 mb-2">📊 CCA</h3>
            <p className="text-xs text-gray-700 mb-2">
              <strong>Certificação Controller ANEFAC</strong>
            </p>
            <p className="text-xs text-gray-600 mb-3">
              Direcionada a profissionais experientes em gestão que buscam validação de mercado e consolidação na função de Controller.
            </p>
            <p className="text-xs font-semibold text-green-900">Requisitos:</p>
            <ul className="text-xs text-gray-700 list-disc list-inside">
              <li>CCA: Graduação em Administração, Contabilidade ou Economia + experiência</li>
              <li>CCA Plus: Consolidação de mercado e senioridade executiva</li>
            </ul>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300">
            <h3 className="font-bold text-purple-900 mb-2">👥 Líderes</h3>
            <p className="text-xs text-gray-700 mb-2">
              <strong>Certificação em Desenvolvimento de Liderança</strong>
            </p>
            <p className="text-xs text-gray-600 mb-3">
              Programa de desenvolvimento para profissionais que buscam validar e aprimorar suas competências em liderança e gestão de pessoas.
            </p>
            <p className="text-xs font-semibold text-purple-900">Requisitos:</p>
            <ul className="text-xs text-gray-700 list-disc list-inside">
              <li>Líderes: Profissionais em desenvolvimento de liderança</li>
              <li>Líderes Executivos: Executivos com experiência consolidada</li>
            </ul>
          </Card>
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
              <a>
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
              </a>
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mb-6 text-center">
          <Link href="/select-certification-type">
            <a>
              <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-2 text-sm">
                Iniciar Certificação →
              </Button>
            </a>
          </Link>
        </div>

        {/* Test Links */}
        <div className="mb-6 p-3 bg-amber-50 border-2 border-amber-300 rounded">
          <p className="text-xs text-amber-900 font-semibold mb-2">Links de Teste Rápido:</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/select-certification-type">
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
            Este é um protótipo navegável que demonstra o fluxo completo do sistema de certificação ANEFAC com suporte a múltiplas certificações. 
            Clique em "Iniciar Certificação" acima ou em qualquer etapa para explorar a jornada do usuário.
          </p>
        </Card>
      </div>
    </div>
  );
}
