import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export function SelectCertificationLevel() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const certType = params.get("type") || "cca";
  const [selected, setSelected] = useState<string | null>(null);

  const levels = [
    {
      id: "level1",
      title: "Nível 1",
      description: "Para profissionais em desenvolvimento",
      requirements: "Tempo de Experiência: 2-5 anos | Formação: Graduação",
      includes: ["Acesso ao Curso Online", "Prova de Certificação", "Entrevista Técnica", "Certificado"],
      path: "Curso → Prova → Entrevista → Certificado",
    },
    {
      id: "level2",
      title: "Nível 2",
      description: "Para profissionais experientes",
      requirements: "Tempo de Experiência: 5+ anos | Formação: Pós-graduação/MBA",
      includes: ["Sem Curso", "Sem Prova", "Entrevista Técnica", "Certificado"],
      path: "Pagamento → Entrevista → Certificado",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/select-certification-type">
            <Button variant="outline" className="mb-4">
              ← Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Escolha o Nível de Certificação
          </h1>
          <p className="text-gray-600">
            Selecione o nível que melhor se adequa ao seu perfil profissional
          </p>
        </div>

        {/* Flowchart */}
        <div className="mb-8 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/fluxograma-certificacao-cca-BJNtryQnGGbzJxxjrdzVdX.webp"
            alt="Fluxograma completo do processo de certificação ANEFAC CCA"
            className="w-full h-auto"
          />
        </div>

        {/* Level Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {levels.map((level) => (
            <Card
              key={level.id}
              className={`p-6 cursor-pointer transition-all border-2 ${
                selected === level.id
                  ? "border-blue-900 bg-blue-50"
                  : "border-gray-200 hover:border-blue-900"
              }`}
              onClick={() => setSelected(level.id)}
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

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs font-semibold text-blue-900">
                  Caminho: {level.path}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center gap-4">
          {selected === "level1" ? (
            <Link href={`/step-2?type=${certType}&level=1`}>
              <Button className="bg-blue-900 hover:bg-blue-800 px-8">
                Continuar para Cadastro →
              </Button>
            </Link>
          ) : selected === "level2" ? (
            <Link href={`/step-3?type=${certType}&level=2`}>
              <Button className="bg-blue-900 hover:bg-blue-800 px-8">
                Continuar para Pagamento →
              </Button>
            </Link>
          ) : (
            <Button disabled className="px-8">
              Selecione um nível
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
