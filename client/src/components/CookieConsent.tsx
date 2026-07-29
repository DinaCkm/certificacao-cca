import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie, ChevronDown, ChevronUp } from "lucide-react";

const STORAGE_KEY = "anefac_cookie_consent";

interface Preferencias {
  necessarios: true;
  desempenho: boolean;
  direcionamento: boolean;
  funcionalidade: boolean;
  nao_classificados: boolean;
}

function salvarConsentimento(prefs: Preferencias) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, decidido_em: new Date().toISOString() }));
}

export function CookieConsent() {
  const [visivel, setVisivel] = useState(false);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [prefs, setPrefs] = useState<Preferencias>({
    necessarios: true,
    desempenho: false,
    direcionamento: false,
    funcionalidade: false,
    nao_classificados: false,
  });

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (!salvo) setVisivel(true);
  }, []);

  function aceitarTodos() {
    const todos: Preferencias = { necessarios: true, desempenho: true, direcionamento: true, funcionalidade: true, nao_classificados: true };
    salvarConsentimento(todos);
    setVisivel(false);
  }

  function recusarTodos() {
    const nenhum: Preferencias = { necessarios: true, desempenho: false, direcionamento: false, funcionalidade: false, nao_classificados: false };
    salvarConsentimento(nenhum);
    setVisivel(false);
  }

  function salvarPreferencias() {
    salvarConsentimento(prefs);
    setVisivel(false);
  }

  if (!visivel) return null;

  const categorias: { key: keyof Omit<Preferencias, "necessarios">; label: string; descricao: string }[] = [
    { key: "desempenho", label: "Desempenho", descricao: "Nos ajudam a entender como o site é utilizado, medindo acessos e páginas mais visitadas." },
    { key: "direcionamento", label: "Direcionamento", descricao: "Usados para tornar as mensagens exibidas mais relevantes para você." },
    { key: "funcionalidade", label: "Funcionalidade", descricao: "Permitem que o site lembre escolhas feitas por você (como idioma ou região)." },
    { key: "nao_classificados", label: "Não classificados", descricao: "Cookies que ainda estamos classificando, junto com os fornecedores de cookies individuais." },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-blue-50 border-t-2 border-blue-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Cookie className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-blue-950 text-sm mb-1">Este website usa cookies</h3>
              <p className="text-xs text-blue-900/80 leading-relaxed">
                Este website usa cookies para melhorar a experiência do usuário. Ao utilizar o nosso website, você estará
                de acordo com todos os cookies de acordo com nossa Política de Cookies.{" "}
                <a href="/politica-cookies" className="underline font-medium hover:text-blue-700">Ler mais</a>
              </p>
            </div>
          </div>
          <button onClick={recusarTodos} className="text-blue-700/60 hover:text-blue-900 shrink-0" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 mt-3 flex-wrap">
          <button
            onClick={() => setDetalhesAbertos(!detalhesAbertos)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-800 hover:text-blue-950"
          >
            {detalhesAbertos ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Mostrar detalhes
          </button>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white border-blue-300" onClick={recusarTodos}>Recusar todos</Button>
            <Button className="bg-blue-950 hover:bg-blue-900" onClick={aceitarTodos}>Aceitar todos</Button>
          </div>
        </div>

        {detalhesAbertos && (
          <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" checked disabled className="mt-0.5 accent-blue-900" />
              <span>
                <span className="font-semibold text-blue-950">Estritamente necessários</span>
                <p className="text-blue-900/70">Essenciais para o funcionamento do site — não podem ser desativados.</p>
              </span>
            </label>

            {categorias.map((c) => (
              <label key={c.key} className="flex items-start gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs[c.key]}
                  onChange={(e) => setPrefs({ ...prefs, [c.key]: e.target.checked })}
                  className="mt-0.5 accent-blue-900"
                />
                <span>
                  <span className="font-semibold text-blue-950">{c.label}</span>
                  <p className="text-blue-900/70">{c.descricao}</p>
                </span>
              </label>
            ))}

            <div className="flex justify-end pt-1">
              <Button size="sm" className="bg-blue-900 hover:bg-blue-800" onClick={salvarPreferencias}>
                Salvar preferências
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
