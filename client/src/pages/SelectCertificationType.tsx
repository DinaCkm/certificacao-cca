import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function SelectCertificationType() {
  const [selected, setSelected] = useState<string | null>(null);

  const certifications = [
    {
      id: "cac",
      title: "CAC - Certificação Controller ANEFAC",
      description: "Voltada para profissionais de controladoria que buscam comprovar sua educação continuada e alto nível de capacitação.",
      requirements: "CAC: 2+ anos de experiência em controladoria | CAC Plus: Executivos com consolidação em grandes empresas",
      areas: "Avalia 8 áreas: contabilidade, economia, finanças, tributos, administração, governança, tecnologia e capital humano",
      icon: "📊",
    },
    {
      id: "cca",
      title: "CCA - Certificação Controller ANEFAC",
      description: "Direcionada a profissionais experientes em gestão que buscam validação de mercado e consolidação na função de Controller.",
      requirements: "CCA: Graduação + validação de experiência | CCA Plus: Profissionais com consolidação de mercado",
      areas: "Foco em gestão e validação de experiência profissional",
      icon: "📈",
    },
    {
      id: "liders",
      title: "Certificação de Líderes",
      description: "Programa de desenvolvimento para profissionais que buscam validar e aprimorar suas competências em liderança e gestão de pessoas.",
      requirements: "Líderes: Profissionais em desenvolvimento | Líderes Executivos: Executivos com experiência consolidada",
      areas: "Desenvolvimento de liderança e gestão de pessoas",
      icon: "👥",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <BackToHomeButton />
        </div>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Bem-vindo à Certificação ANEFAC
          </h1>
          <p className="text-gray-600">
            Escolha o tipo de certificação que deseja realizar
          </p>
        </div>

        {/* Certification Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {certifications.map((cert) => (
            <Card
              key={cert.id}
              className={`p-6 cursor-pointer transition-all border-2 ${
                selected === cert.id
                  ? "border-blue-900 bg-blue-50"
                  : "border-gray-200 hover:border-blue-900"
              }`}
              onClick={() => setSelected(cert.id)}
            >
              <div className="text-4xl mb-4">{cert.icon}</div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                {cert.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-blue-900 mb-1">Requisitos:</p>
                <p className="text-xs text-gray-600 mb-2">{cert.requirements}</p>
                <p className="text-xs font-semibold text-blue-900 mb-1">Áreas:</p>
                <p className="text-xs text-gray-600">{cert.areas}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center gap-4">
          {selected ? (
            <Link href={`/select-level?cert=${selected}`} className="inline-block">
              <span className="inline-block bg-blue-900 hover:bg-blue-800 text-white px-8 py-2 rounded font-medium cursor-pointer">
                Próximo: Escolher Nível →
              </span>
            </Link>
          ) : (
            <Button disabled className="px-8">
              Selecione uma certificação
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
