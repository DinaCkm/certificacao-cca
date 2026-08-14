import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingDown, TrendingUp, BookOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EixoDesempenho {
  eixo_id: number | null;
  nome: string;
  acertos: number;
  total: number;
  percentual: number;
}

export function DesempenhoPorEixo({ eixos, mostrarCtaCursos = true }: { eixos: EixoDesempenho[]; mostrarCtaCursos?: boolean }) {
  if (!eixos || eixos.length <= 1) return null; // não vale a pena mostrar quebra pra 1 único eixo

  const eixosFracos = eixos.filter((e) => e.percentual < 60);

  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-blue-700" />
          <h3 className="font-bold text-foreground text-sm">Desempenho por eixo de conhecimento</h3>
        </div>

        <div className="space-y-3">
          {eixos.map((e) => (
            <div key={e.eixo_id ?? e.nome}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  {e.percentual >= 60 ? <TrendingUp className="w-3 h-3 text-green-600" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                  {e.nome}
                </span>
                <span className={cn("font-bold", e.percentual >= 60 ? "text-green-700" : "text-red-600")}>
                  {e.acertos}/{e.total} · {e.percentual}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={cn("h-1.5 rounded-full transition-all", e.percentual >= 60 ? "bg-green-500" : "bg-red-400")}
                  style={{ width: `${e.percentual}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {mostrarCtaCursos && eixosFracos.length > 0 && (
          <a href="/cursos" className="flex items-center gap-3 bg-purple-50 border-2 border-purple-200 rounded-xl p-3 mt-5 hover:bg-purple-100 transition-colors">
            <BookOpen className="w-6 h-6 text-purple-700 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-purple-900">
                Reforce {eixosFracos.length === 1 ? `"${eixosFracos[0].nome}"` : `${eixosFracos.length} eixos com desempenho mais baixo`}
              </p>
              <p className="text-xs text-purple-700">Confira nossos cursos recomendados</p>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-700 shrink-0" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
