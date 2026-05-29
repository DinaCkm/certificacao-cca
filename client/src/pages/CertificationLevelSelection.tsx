import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";

export function CertificationLevelSelection() {
  const [selected, setSelected] = useState<string | null>(null);
  const search = useSearch();
  const params = new URLSearchParams(search);
  const certType = params.get("type") || "cca";

  const handleSelect = (level: string) => {
    setSelected(level);
    localStorage.setItem("certificationLevel", level);
  };

  const getNextLink = () => {
    if (selected === "level1") {
      return `/step-1?type=${certType}&level=1`;
    } else if (selected === "level2") {
      // Nível 2 vai direto para pagamento (Step 3)
      return `/step-3?type=${certType}&level=2`;
    }
    return "";
  };

  const levels = [
    {
      id: "level1",
      title: "Nível 1",
      subtitle: "Profissional em Desenvolvimento",
      requirements: [
        "Tempo de Experiência: 2-5 anos",
        "Formação: Graduação em Administração, Contabilidade ou áreas relacionadas",
      ],
      description: "Inclui: Cursos de preparação, Prova de conhecimento, Entrevista técnica",
      icon: "📚",
      price: "R$ 1.299",
      highlight: false,
    },
    {
      id: "level2",
      title: "Nível 2",
      subtitle: "Profissional Experiente",
      requirements: [
        "Tempo de Experiência: 5+ anos",
        "Formação: Pós-graduação ou MBA em área relacionada",
      ],
      description: "Inclui: Pagamento direto, Entrevista técnica com comissão, Certificação",
      icon: "🏆",
      price: "R$ 1.999",
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-3">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/certification-type">
            <a className="text-blue-900 hover:underline mb-3 inline-block text-sm">← Voltar</a>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-900 mb-2">Definição de Nível da Certificação</h1>
            <p className="text-sm text-gray-600">
              Escolha o nível que melhor se adequa ao seu perfil profissional
            </p>
          </div>
        </div>

        {/* Level Selection */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {levels.map((level) => (
            <Card
              key={level.id}
              className={`p-5 cursor-pointer transition-all border-2 ${
                selected === level.id
                  ? "border-blue-900 bg-blue-50 shadow-lg"
                  : "border-gray-200 hover:border-blue-900"
              } ${level.highlight ? "ring-2 ring-blue-900" : ""}`}
              onClick={() => handleSelect(level.id)}
            >
              {level.highlight && (
                <div className="bg-blue-900 text-white px-2 py-1 rounded text-xs font-bold mb-2 inline-block">
                  Recomendado
                </div>
              )}
              <div className="text-3xl mb-2">{level.icon}</div>
              <h3 className="font-bold text-lg text-blue-900 mb-1">{level.title}</h3>
              <p className="text-xs text-gray-600 mb-3">{level.subtitle}</p>

              {/* Requirements */}
              <div className="mb-3 pb-3 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Requisitos:</p>
                <ul className="space-y-1">
                  {level.requirements.map((req, i) => (
                    <li key={i} className="text-xs text-gray-600">• {req}</li>
                  ))}
                </ul>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-700 mb-3">{level.description}</p>

              {/* Price */}
              <p className="text-lg font-bold text-blue-900 mb-2">{level.price}</p>

              {selected === level.id && (
                <div className="pt-2 border-t border-blue-900">
                  <span className="text-xs font-bold text-blue-900">✓ Selecionado</span>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-center">
          {selected && (
            <Link href={getNextLink()}>
              <a>
                <Button className="bg-blue-900 hover:bg-blue-800">
                  {selected === "level2" ? "Ir para Pagamento →" : "Próximo: Escolher Jornada →"}
                </Button>
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
