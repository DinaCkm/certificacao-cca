import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { BookOpen, Award, ShoppingCart } from "lucide-react";

export function SelectPurchaseType() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const certType = params.get("type") || "cca";
  const level = params.get("level") || "level1";
  const [selected, setSelected] = useState<string | null>(null);

  const purchaseOptions = [
    {
      id: "certification-with-course",
      title: "Certificação + Pacote de Aprendizado",
      description: "Acesso completo aos cursos preparatórios + Prova + Entrevista + Certificado",
      icon: <ShoppingCart className="w-12 h-12 text-blue-600" />,
      price: "R$ 1.500,00",
      includes: [
        "✓ 6 cursos preparatórios (70h)",
        "✓ Materiais de estudo completos",
        "✓ Simulados e exercícios práticos",
        "✓ Suporte 24/7",
        "✓ Prova de certificação",
        "✓ Entrevista técnica",
        "✓ Certificado digital"
      ],
      path: "/welcome-courses",
      badge: "Mais Popular"
    },
    {
      id: "direct-certification",
      title: "Certificação Direta",
      description: "Sem cursos preparatórios - Vai direto para a prova e entrevista",
      icon: <Award className="w-12 h-12 text-green-600" />,
      price: "R$ 800,00",
      includes: [
        "✓ Prova de certificação",
        "✓ Entrevista técnica",
        "✓ Certificado digital",
        "⚠ Sem cursos preparatórios"
      ],
      path: "/certification-direct-preparation-check",
      badge: "Mais Rápido"
    },
    {
      id: "course-only",
      title: "Apenas Pacote de Aprendizado",
      description: "Acesso aos cursos preparatórios sem certificação (para estudar por conta própria)",
      icon: <BookOpen className="w-12 h-12 text-purple-600" />,
      price: "R$ 500,00",
      includes: [
        "✓ 6 cursos preparatórios (70h)",
        "✓ Materiais de estudo completos",
        "✓ Simulados e exercícios práticos",
        "✓ Suporte 24/7",
        "✗ Sem prova de certificação",
        "✗ Sem entrevista",
        "✗ Sem certificado"
      ],
      path: "/courses-learning",
      badge: "Apenas Estudo"
    }
  ];

  const selectedOption = purchaseOptions.find(opt => opt.id === selected);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
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
            Escolha seu Tipo de Compra
          </h1>
          <p className="text-gray-600">
            Selecione a opção que melhor se adequa aos seus objetivos
          </p>
        </div>

        {/* Purchase Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {purchaseOptions.map((option) => (
            <Card
              key={option.id}
              className={`p-6 cursor-pointer transition-all border-2 relative ${
                selected === option.id
                  ? "border-blue-900 bg-blue-50 shadow-lg"
                  : "border-gray-200 hover:border-blue-900"
              }`}
              onClick={() => setSelected(option.id)}
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                {option.badge}
              </div>

              {/* Icon */}
              <div className="mb-4 flex justify-center">
                {option.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-blue-900 mb-2 text-center">
                {option.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 text-center">
                {option.description}
              </p>

              {/* Price */}
              <div className="bg-blue-100 border border-blue-300 rounded p-3 mb-4 text-center">
                <p className="text-2xl font-bold text-blue-900">
                  {option.price}
                </p>
              </div>

              {/* Includes */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Inclui:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {option.includes.map((item, idx) => (
                    <li key={idx} className={item.startsWith("⚠") || item.startsWith("✗") ? "text-orange-600" : ""}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Selection Indicator */}
              {selected === option.id && (
                <div className="text-center text-blue-900 font-bold">
                  ✓ Selecionado
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link href={`/select-level?type=${certType}`}>
            <Button variant="outline" className="px-8">
              ← Voltar
            </Button>
          </Link>
          {selectedOption ? (
            <Link href={`${selectedOption.path}?type=${certType}&level=${level}`}>
              <Button className="bg-blue-900 hover:bg-blue-800 px-8">
                Próximo: {selectedOption.title} →
              </Button>
            </Link>
          ) : (
            <Button disabled className="px-8">
              Selecione uma opção
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
