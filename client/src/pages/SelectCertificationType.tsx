import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function SelectCertificationType() {
  const [selected, setSelected] = useState<string | null>(null);

  const certifications = [
    {
      id: "cca",
      title: "Certificação CCA",
      description: "Certificação de Consultor de Conformidade Ambiental",
      icon: "🌿",
    },
    {
      id: "xxx",
      title: "Certificação XXX",
      description: "Certificação Especializada em Gestão",
      icon: "📊",
    },
    {
      id: "leadership",
      title: "Certificação de Liderança",
      description: "Certificação em Desenvolvimento de Liderança",
      icon: "👥",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
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
              <p className="text-sm text-gray-600">{cert.description}</p>
            </Card>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center gap-4">
          {selected ? (
            <Link href={`/home?type=${selected}`}>
              <Button className="bg-blue-900 hover:bg-blue-800 px-8">
                Próximo: Ver Etapas →
              </Button>
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
