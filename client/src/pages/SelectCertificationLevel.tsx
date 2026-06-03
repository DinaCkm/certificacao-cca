import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function SelectCertificationLevel() {
  // Ler query string diretamente do window.location
  const certType = useMemo(() => {
    if (typeof window === "undefined") return "cca";
    const params = new URLSearchParams(window.location.search);
    const cert = params.get("cert");
    console.log("Query params:", { cert, search: window.location.search });
    return cert || "cca";
  }, []);

  // Definir níveis específicos para cada certificação
  const levels = useMemo(() => {
    switch (certType) {
      case "cac":
        return [
          {
            id: "cac",
            title: "CAC",
            description: "Para profissionais com experiência em controladoria",
            requirements: "Tempo de Experiência: 2+ anos | Formação: Graduação",
            includes: ["Acesso ao Curso Online", "Prova de Certificação", "Entrevista Técnica", "Certificado"],
            path: "Curso → Prova → Entrevista → Certificado",
          },
          {
            id: "cac-plus",
            title: "CAC Plus",
            description: "Para executivos consolidados em grandes empresas",
            requirements: "Tempo de Experiência: 5+ anos | Formação: Consolidação em grandes empresas",
            includes: ["Sem Curso", "Sem Prova", "Entrevista Técnica", "Certificado"],
            path: "Pagamento → Entrevista → Certificado",
          },
        ];
      case "cca":
        return [
          {
            id: "cca",
            title: "CCA",
            description: "Para profissionais com graduação e experiência validada",
            requirements: "Formação: Graduação em Administração, Contabilidade ou Economia | Validação de experiência profissional",
            includes: ["Acesso ao Curso Online", "Prova de Certificação", "Entrevista Técnica", "Certificado"],
            path: "Curso → Prova → Entrevista → Certificado",
          },
          {
            id: "cca-plus",
            title: "CCA Plus",
            description: "Para profissionais com consolidação de mercado",
            requirements: "Consolidação de mercado | Maior senioridade executiva | Experiência comprovada",
            includes: ["Sem Curso", "Sem Prova", "Entrevista Técnica", "Certificado"],
            path: "Pagamento → Entrevista → Certificado",
          },
        ];
      case "liders":
        return [
          {
            id: "liders",
            title: "Líderes",
            description: "Para profissionais em 1ª Liderança",
            requirements: "Tempo de Experiência: 2-5 anos | Formação: Graduação",
            includes: ["Acesso ao Programa Online", "Prova de Certificação", "Entrevista Técnica", "Certificado"],
            path: "Programa → Prova → Entrevista → Certificado",
          },
          {
            id: "liders-executivos",
            title: "Líderes Executivos",
            description: "Líderes com mais de 2 anos em gestão de pessoas",
            requirements: "Tempo de Experiência: 5+ anos | Experiência consolidada em liderança",
            includes: ["Sem Programa", "Sem Prova", "Entrevista Técnica", "Certificado"],
            path: "Pagamento → Entrevista → Certificado",
          },
        ];
      default:
        return [];
    }
  }, [certType]);

  const getCertificationTitle = () => {
    switch (certType) {
      case "cac":
        return "Certificação Controller ANEFAC (CAC)";
      case "cca":
        return "Certificação Controller ANEFAC (CCA)";
      case "liders":
        return "Certificação de Líderes";
      default:
        return "Escolha o Nível de Certificação";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
            >
              ← Voltar
            </Button>
            <BackToHomeButton />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            {getCertificationTitle()}
          </h1>
          <p className="text-gray-600">
            Selecione o nível que melhor se adequa ao seu perfil profissional
          </p>
        </div>

        {/* Level Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {levels.map((level) => (
            <Card
              key={level.id}
              className="p-6 transition-all border-2 border-gray-200 hover:border-blue-900 flex flex-col"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-blue-900">
                  {level.title}
                </h3>
              </div>

              <p className="text-sm text-gray-600 mb-4">{level.description}</p>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <p className="text-xs font-semibold text-yellow-900 mb-1">
                  Requisitos:
                </p>
                <p className="text-xs text-yellow-800">{level.requirements}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Inclui:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {level.includes.map((item, idx) => (
                    <li key={idx}>✓ {item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                <p className="text-xs font-semibold text-blue-900">
                  Caminho: {level.path}
                </p>
              </div>

              {/* Botão de navegação específico para cada nível */}
              <Link href={`/select-purchase-type?cert=${certType}&level=${level.id}`} className="mt-auto">
                <Button className="bg-blue-900 hover:bg-blue-800 w-full">
                  Escolher {level.title} →
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Link href="/select-certification-type">
            <Button variant="outline" className="px-8">
              ← Voltar para Certificações
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
