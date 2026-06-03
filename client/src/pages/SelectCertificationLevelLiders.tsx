import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function SelectCertificationLevelLiders() {
  const levels = [
    {
      id: "liders",
      title: "Líderes",
      description: "Para profissionais em 1ª Liderança",
      requirements: "Ensino superior em andamento ou completo | Experiência profissional de 3 anos | Liderança de até 5 pessoas | Aprovação em análise técnica",
      includes: ["Programa de Desenvolvimento Online", "Prova de Certificação", "Entrevista Técnica", "Certificado Digital"],
      path: "Programa → Prova → Entrevista → Certificado",
    },
    {
      id: "liders-executivos",
      title: "Líderes Executivos",
      description: "Líderes com mais de 2 anos em gestão de pessoas",
      requirements: "Ensino superior completo | Experiência profissional de 5+ anos | Liderança acima de 5 pessoas | Certificação Nível 1 ou equivalência | Aprovação em análise técnica",
      includes: ["Análise técnica e/ou exame de proficiência", "Entrevista Técnica", "Certificado Digital", "Educação continuada"],
      path: "Análise Técnica → Entrevista → Certificado",
    },
  ];

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
            Certificação de Líderes
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
              <Link href={`/select-purchase-type?cert=liders&level=${level.id}`} className="mt-auto">
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
