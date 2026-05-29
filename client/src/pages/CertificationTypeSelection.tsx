import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function CertificationTypeSelection() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (type: string) => {
    setSelected(type);
    localStorage.setItem("certificationType", type);
  };

  const certifications = [
    {
      id: "cca",
      title: "Certificação CCA",
      subtitle: "Certificado de Competência em Controladoria",
      description: "Valide suas competências em controladoria e gestão financeira",
      icon: "📊",
      color: "border-blue-900",
    },
    {
      id: "xxx",
      title: "Certificação XXX",
      subtitle: "Certificado de Competência em XXX",
      description: "Valide suas competências em XXX",
      icon: "🎯",
      color: "border-purple-900",
    },
    {
      id: "leadership",
      title: "Certificação de Liderança",
      subtitle: "Certificado de Liderança Executiva",
      description: "Valide suas competências em liderança e gestão de equipes",
      icon: "👥",
      color: "border-green-900",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-3">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">🏢 ANEFAC</h1>
          <p className="text-lg text-gray-600 mb-1">Bem-vindo à Plataforma de Certificação</p>
          <p className="text-sm text-gray-500">Escolha o tipo de certificação que deseja realizar</p>
        </div>

        {/* Certification Selection */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {certifications.map((cert) => (
            <Card
              key={cert.id}
              className={`p-5 cursor-pointer transition-all border-2 ${
                selected === cert.id
                  ? `${cert.color} bg-blue-50 shadow-lg`
                  : "border-gray-200 hover:border-blue-900"
              }`}
              onClick={() => handleSelect(cert.id)}
            >
              <div className="text-3xl mb-3">{cert.icon}</div>
              <h3 className="font-bold text-sm text-blue-900 mb-1">{cert.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{cert.subtitle}</p>
              <p className="text-xs text-gray-700">{cert.description}</p>
              {selected === cert.id && (
                <div className="mt-3 pt-3 border-t border-blue-900">
                  <span className="text-xs font-bold text-blue-900">✓ Selecionado</span>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-center">
          {selected && (
            <Link href={`/requirements-validation?type=${selected}`}>
              <a>
                <Button className="bg-blue-900 hover:bg-blue-800">
                  Próximo: Validar Requisitos →
                </Button>
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
