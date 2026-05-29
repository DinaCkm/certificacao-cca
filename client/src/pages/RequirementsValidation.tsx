import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useSearch } from "wouter";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

export function RequirementsValidation() {
  const [experience, setExperience] = useState<string>("");
  const [formation, setFormation] = useState<string>("");
  const [recommendedLevel, setRecommendedLevel] = useState<string | null>(null);
  const search = useSearch();
  const params = new URLSearchParams(search);
  const certType = params.get("type") || "cca";

  const handleValidate = () => {
    // Lógica de recomendação baseada em experiência e formação
    let level = "level1";

    if (
      (parseInt(experience) >= 5 || experience === "5+") &&
      (formation === "mba" || formation === "pos-graduacao")
    ) {
      level = "level2";
    }

    setRecommendedLevel(level);
    localStorage.setItem("userExperience", experience);
    localStorage.setItem("userFormation", formation);
    localStorage.setItem("recommendedLevel", level);
  };

  const handleContinue = () => {
    if (recommendedLevel) {
      window.location.href = `/certification-level?type=${certType}&recommended=${recommendedLevel}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-3">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/certification-type">
            <a className="text-blue-900 hover:underline mb-3 inline-block text-sm">← Voltar</a>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-900 mb-2">Validação de Requisitos</h1>
            <p className="text-sm text-gray-600">
              Responda algumas perguntas para encontrar o nível ideal para você
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6 border-2 border-blue-900/20 mb-6">
          {/* Experience Question */}
          <div className="mb-8">
            <Label className="text-sm font-bold text-blue-900 mb-3 block">
              Qual é seu tempo de experiência profissional?
            </Label>
            <RadioGroup value={experience} onValueChange={setExperience}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="0-2" id="exp-0-2" />
                <Label htmlFor="exp-0-2" className="text-sm cursor-pointer">
                  0-2 anos
                </Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="2-5" id="exp-2-5" />
                <Label htmlFor="exp-2-5" className="text-sm cursor-pointer">
                  2-5 anos
                </Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="5-10" id="exp-5-10" />
                <Label htmlFor="exp-5-10" className="text-sm cursor-pointer">
                  5-10 anos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5+" id="exp-5-plus" />
                <Label htmlFor="exp-5-plus" className="text-sm cursor-pointer">
                  10+ anos
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Formation Question */}
          <div className="mb-8">
            <Label className="text-sm font-bold text-blue-900 mb-3 block">
              Qual é sua formação acadêmica?
            </Label>
            <RadioGroup value={formation} onValueChange={setFormation}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="ensino-medio" id="form-ensino-medio" />
                <Label htmlFor="form-ensino-medio" className="text-sm cursor-pointer">
                  Ensino Médio
                </Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="graduacao" id="form-graduacao" />
                <Label htmlFor="form-graduacao" className="text-sm cursor-pointer">
                  Graduação (Administração, Contabilidade, etc.)
                </Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="pos-graduacao" id="form-pos-graduacao" />
                <Label htmlFor="form-pos-graduacao" className="text-sm cursor-pointer">
                  Pós-Graduação / Especialização
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mba" id="form-mba" />
                <Label htmlFor="form-mba" className="text-sm cursor-pointer">
                  MBA
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Validation Button */}
          <Button
            onClick={handleValidate}
            disabled={!experience || !formation}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white"
          >
            Validar Requisitos
          </Button>
        </Card>

        {/* Recommendation */}
        {recommendedLevel && (
          <Card className="p-6 border-2 border-green-500 bg-green-50 mb-6">
            <h3 className="font-bold text-lg text-green-900 mb-2">✓ Validação Completa!</h3>
            <p className="text-sm text-green-800 mb-4">
              {recommendedLevel === "level2"
                ? "Com base em suas qualificações, você é elegível para o Nível 2 (Profissional Experiente). Você também pode escolher o Nível 1 se preferir."
                : "Com base em suas qualificações, recomendamos o Nível 1 (Profissional em Desenvolvimento). Este nível inclui cursos de preparação e prova."}
            </p>
            <Button
              onClick={handleContinue}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Próximo: Escolher Nível →
            </Button>
          </Card>
        )}

        {/* Info Box */}
        <Card className="p-4 bg-blue-50 border-2 border-blue-200">
          <h4 className="font-bold text-sm text-blue-900 mb-2">ℹ️ Sobre os Níveis</h4>
          <div className="text-xs text-gray-700 space-y-2">
            <p>
              <strong>Nível 1:</strong> Para profissionais em desenvolvimento com 2-5 anos de experiência e graduação. Inclui cursos, simulados e prova.
            </p>
            <p>
              <strong>Nível 2:</strong> Para profissionais experientes com 5+ anos e pós-graduação/MBA. Acesso direto à entrevista técnica.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
