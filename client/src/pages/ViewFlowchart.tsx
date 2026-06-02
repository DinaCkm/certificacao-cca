import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BackToHomeButton } from "@/components/BackToHomeButton";

export function ViewFlowchart() {
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
            Jornada de Certificação
          </h1>
          <p className="text-gray-600">
            Visualize o fluxo completo do processo de certificação ANEFAC CCA
          </p>
        </div>

        {/* Flowchart Image */}
        <div className="mb-8 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/fluxograma-certificacao-cca-BJNtryQnGGbzJxxjrdzVdX.webp"
            alt="Fluxograma completo do processo de certificação ANEFAC CCA"
            className="w-full h-auto"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-center gap-4">
          <Link href="/select-certification-type">
            <Button variant="outline" className="px-8">
              ← Voltar
            </Button>
          </Link>
          <Link href="/select-level?type=cca">
            <Button className="bg-blue-900 hover:bg-blue-800 px-8">
              Próximo: Escolher Nível →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
