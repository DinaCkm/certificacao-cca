import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useState } from "react";
import { Check } from "lucide-react";

export function RecoveryCheckout() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const packages = [
    {
      id: "courses",
      name: "Pacote de Cursos",
      price: 299,
      originalPrice: 399,
      duration: "3 meses de acesso",
      description: "Acesso completo aos cursos focados nos seus gaps",
      features: [
        "12 cursos especializados",
        "Acesso por 3 meses",
        "Simulados práticos",
        "Certificado de conclusão",
        "Suporte via email",
        "Acesso à comunidade",
      ],
      cta: "Comprar Cursos",
      color: "bg-blue-50 border-blue-300",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      id: "tutoring",
      name: "Aulas ON-LINE com Instrutor",
      price: 499,
      originalPrice: 699,
      duration: "10 sessões personalizadas",
      description: "Mentoria 1:1 com especialista nas suas áreas fracas",
      features: [
        "10 sessões de 1 hora",
        "Instrutor especializado",
        "Plano personalizado",
        "Material didático incluído",
        "Suporte ilimitado",
        "Garantia de satisfação",
      ],
      cta: "Contratar Aulas",
      color: "bg-amber-50 border-amber-300",
      buttonColor: "bg-amber-600 hover:bg-amber-700",
    },
    {
      id: "bundle",
      name: "Pacote Completo (RECOMENDADO)",
      price: 699,
      originalPrice: 1099,
      duration: "Cursos + 5 sessões",
      description: "Combinação ideal: cursos + mentoria personalizada",
      features: [
        "12 cursos especializados",
        "5 sessões com instrutor",
        "Plano de estudo customizado",
        "Simulados práticos",
        "Suporte prioritário",
        "Garantia de aprovação*",
      ],
      cta: "Comprar Pacote Completo",
      color: "bg-green-50 border-green-300 border-2",
      buttonColor: "bg-green-600 hover:bg-green-700",
      badge: "Melhor Valor",
    },
  ];

  const handlePurchase = async (packageId: string) => {
    setSelectedPackage(packageId);
    setIsProcessing(true);

    // Simular processamento de pagamento
    setTimeout(() => {
      setIsProcessing(false);
      // Redirecionar para plataforma de cursos com recovery=true
      window.location.href = "/courses-platform?recovery=true";
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/step-5">
            <a className="text-blue-900 hover:underline mb-4 inline-block">← Voltar para Resultado</a>
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">🎯 Plano de Recuperação</h1>
            <p className="text-lg text-gray-600">
              Você foi reprovado. Escolha uma opção abaixo para se preparar melhor e fazer nova tentativa.
            </p>
          </div>

          {/* Alert Box */}
          <Card className="p-4 bg-red-50 border-2 border-red-300 mb-8">
            <p className="text-red-900 font-bold mb-2">⚠️ Sua Pontuação: 62% (Mínimo: 70%)</p>
            <p className="text-red-800 text-sm">
              Você precisa melhorar em: <strong>Controladoria e Gestão</strong>, <strong>Planejamento e Orçamento</strong>, e <strong>Gestão de Riscos</strong>
            </p>
          </Card>
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`p-6 cursor-pointer transition-all ${pkg.color} ${
                selectedPackage === pkg.id ? "ring-2 ring-blue-900" : ""
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {/* Badge */}
              {pkg.badge && (
                <div className="mb-4">
                  <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {pkg.badge}
                  </span>
                </div>
              )}

              {/* Package Name */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-900">R$ {pkg.price}</span>
                  <span className="text-sm text-gray-500 line-through">R$ {pkg.originalPrice}</span>
                </div>
                <p className="text-xs text-green-700 font-bold mt-1">
                  Economize R$ {pkg.originalPrice - pkg.price}
                </p>
              </div>

              {/* Duration */}
              <p className="text-sm font-semibold text-gray-700 mb-6">⏱️ {pkg.duration}</p>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {pkg.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                className={`w-full text-white font-bold py-3 ${pkg.buttonColor}`}
                onClick={() => handlePurchase(pkg.id)}
                disabled={isProcessing && selectedPackage === pkg.id}
              >
                {isProcessing && selectedPackage === pkg.id ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Processando...
                  </>
                ) : (
                  pkg.cta
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <Card className="p-6 bg-blue-50 border-blue-300">
          <h3 className="font-bold text-blue-900 mb-3">ℹ️ Como Funciona:</h3>
          <ol className="space-y-2 text-sm text-blue-900">
            <li>
              <strong>1. Escolha um pacote</strong> - Selecione a opção que melhor se adequa ao seu perfil
            </li>
            <li>
              <strong>2. Efetue o pagamento</strong> - Cartão de crédito, PIX ou boleto
            </li>
            <li>
              <strong>3. Acesse os cursos</strong> - Imediatamente após a confirmação do pagamento
            </li>
            <li>
              <strong>4. Estude e pratique</strong> - Use os recursos para melhorar nos seus gaps
            </li>
            <li>
              <strong>5. Faça nova prova</strong> - Quando se sentir preparado, agende uma nova tentativa
            </li>
          </ol>
          <p className="text-xs text-blue-800 mt-4">
            * Garantia de aprovação: Se não passar na segunda tentativa, receba reembolso de 50% do valor investido.
          </p>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link href="/step-5">
            <a>
              <Button variant="outline" className="px-8">
                ← Voltar
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
