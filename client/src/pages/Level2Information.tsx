import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Users, Award, FileText, Video } from "lucide-react";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function Level2Information() {
  const handleNext = () => {
    window.location.href = "/level2-lattes-validation";
  };

  const benefits = [
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: "Sem Prova Escrita",
      description: "Avance diretamente para análise de documentação e entrevista técnica",
    },
    {
      icon: <Clock className="w-6 h-6 text-green-600" />,
      title: "Processo Rápido",
      description: "Certificação em até 30 dias após aprovação",
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      title: "Entrevista com Comissão",
      description: "Avaliação por especialistas da área",
    },
    {
      icon: <Award className="w-6 h-6 text-orange-600" />,
      title: "Certificado Premium",
      description: "Reconhecimento profissional de alto nível",
    },
  ];

  const requirements = [
    {
      title: "Formação Acadêmica",
      items: [
        "✓ Graduação em área relacionada",
        "✓ MBA ou Pós-Graduação",
        "✓ Certificados profissionais relevantes",
      ],
    },
    {
      title: "Experiência Profissional",
      items: [
        "✓ Mínimo 5 anos de experiência",
        "✓ Pelo menos 3 anos em posição de liderança",
        "✓ Experiência comprovada na área de certificação",
      ],
    },
    {
      title: "Documentação",
      items: [
        "✓ Currículo atualizado",
        "✓ Diplomas e certificados",
        "✓ Comprovantes de experiência profissional",
      ],
    },
  ];

  const process = [
    {
      step: 1,
      title: "Preenchimento de Currículo",
      description: "Complete seu currículo Lattes com todas as informações profissionais",
      time: "15-20 min",
    },
    {
      step: 2,
      title: "Validação de Requisitos",
      description: "Sistema valida automaticamente se você atende aos requisitos",
      time: "Imediato",
    },
    {
      step: 3,
      title: "Análise de Documentação",
      description: "Nossa comissão analisa seus documentos e experiência",
      time: "5-7 dias",
    },
    {
      step: 4,
      title: "Entrevista Técnica",
      description: "Entrevista com especialistas da área (presencial ou online)",
      time: "1 hora",
    },
    {
      step: 5,
      title: "Decisão Final",
      description: "Resultado da avaliação e emissão do certificado",
      time: "2-3 dias",
    },
  ];

  const pricing = [
    {
      title: "Análise Documental + Entrevista",
      price: "R$ 1.999",
      description: "Inclui análise completa de documentação e entrevista técnica com comissão",
      features: [
        "Análise de currículo e experiência",
        "Entrevista técnica com especialistas",
        "Emissão de certificado",
        "Suporte durante o processo",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              ← Voltar
            </Button>
            <BackToHomeButton />
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Nível 2 - Profissional Experiente</h1>
          <p className="text-xl text-gray-600">
            Certificação para profissionais com experiência comprovada e formação avançada
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Por que escolher Nível 2?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="p-6 border-2 border-gray-200 hover:border-blue-600 transition">
                <div className="mb-3">{benefit.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Requisitos Necessários</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {requirements.map((req, idx) => (
              <Card key={idx} className="p-6 border-2 border-yellow-200 bg-yellow-50">
                <h3 className="font-bold text-yellow-900 mb-4">{req.title}</h3>
                <ul className="space-y-2">
                  {req.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-yellow-800">
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Como Funciona o Processo</h2>
          <div className="space-y-4">
            {process.map((proc, idx) => (
              <Card key={idx} className="p-6 border-l-4 border-blue-600">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                      {proc.step}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-900 mb-1">{proc.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{proc.description}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Tempo estimado: {proc.time}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Investimento</h2>
          <Card className="p-8 border-2 border-green-600 bg-green-50">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-green-900">{pricing[0].title}</h3>
                <p className="text-sm text-green-800 mt-1">{pricing[0].description}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-green-600">{pricing[0].price}</p>
              </div>
            </div>
            <div className="bg-white rounded p-4">
              <p className="font-semibold text-gray-900 mb-3">Inclui:</p>
              <ul className="space-y-2">
                {pricing[0].features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* Important Note */}
        <div className="mb-12">
          <Card className="p-6 border-2 border-red-300 bg-red-50">
            <h3 className="font-bold text-red-900 mb-3">⚠️ Informação Importante</h3>
            <p className="text-sm text-red-800 mb-2">
              Você terá apenas <strong>UMA oportunidade</strong> para fazer a entrevista técnica.
            </p>
            <p className="text-sm text-red-800">
              Caso não seja aprovado, será necessário fazer uma nova compra para tentar novamente após 6 meses.
            </p>
          </Card>
        </div>

        {/* Action Button */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="px-8 py-3 text-lg"
          >
            ← Voltar
          </Button>
          <Button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
          >
            Próximo: Preencher Currículo →
          </Button>
        </div>
      </div>
    </div>
  );
}
