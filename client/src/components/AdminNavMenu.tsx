import React, { useState, useRef, useEffect } from "react";
import {
  Users, FileCheck, MessageCircle, CalendarClock, Award, FileText, Target,
  GraduationCap, CalendarDays, Settings, ShieldCheck, Image, Globe, BookOpen,
  BarChart3, ChevronDown, LucideIcon,
} from "lucide-react";
import { MENU_GROUPS } from "@/lib/menuItems";

// Mapa de nome (string, guardado em menuItems.ts) -> componente do ícone.
// Mantém menuItems.ts livre de JSX, reutilizável em qualquer lugar.
const ICONS: Record<string, LucideIcon> = {
  Users, FileCheck, MessageCircle, CalendarClock, Award, FileText, Target,
  GraduationCap, CalendarDays, Settings, ShieldCheck, Image, Globe, BookOpen, BarChart3,
};

// Menu administrativo agrupado — fonte única (MENU_GROUPS). Usado na navbar
// (desktop, como dropdowns) e reaproveitado em telas que precisam listar a
// navegação (ex: Ações Rápidas do Dashboard).

export function AdminNavDropdowns({ podeVerMenuItem, currentPath }: { podeVerMenuItem: (key: string) => boolean; currentPath: string }) {
  const [aberto, setAberto] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(null);
    }
    document.addEventListener("mousedown", onClickFora);
    return () => document.removeEventListener("mousedown", onClickFora);
  }, []);

  return (
    <div ref={ref} className="flex items-center gap-1">
      {MENU_GROUPS.map((grupo) => {
        const itensVisiveis = grupo.items.filter((i) => podeVerMenuItem(i.key));
        if (itensVisiveis.length === 0) return null;
        const grupoAtivo = itensVisiveis.some((i) => currentPath === i.href);

        return (
          <div key={grupo.label} className="relative">
            <button
              onClick={() => setAberto(aberto === grupo.label ? null : grupo.label)}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                grupoAtivo || aberto === grupo.label ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {grupo.label}
              <ChevronDown className={`w-3 h-3 transition-transform ${aberto === grupo.label ? "rotate-180" : ""}`} />
            </button>

            {aberto === grupo.label && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                {itensVisiveis.map((item) => {
                  const Icon = item.icon ? ICONS[item.icon] : null;
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      onClick={() => setAberto(null)}
                      className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                        currentPath === item.href ? "bg-blue-50 text-blue-900 font-semibold" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {Icon && <Icon className="w-4 h-4 shrink-0 text-gray-400" />}
                      {item.label}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Versão para o menu mobile (lista tudo já expandido, sem dropdown)
export function AdminNavMobile({ podeVerMenuItem }: { podeVerMenuItem: (key: string) => boolean }) {
  return (
    <>
      {MENU_GROUPS.map((grupo) => {
        const itensVisiveis = grupo.items.filter((i) => podeVerMenuItem(i.key));
        if (itensVisiveis.length === 0) return null;
        return (
          <div key={grupo.label} className="mb-2">
            <p className="text-[10px] uppercase tracking-wide text-white/40 px-3 pt-2 pb-1">{grupo.label}</p>
            {itensVisiveis.map((item) => (
              <a key={item.key} href={item.href} className="block text-sm text-white/70 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10">
                {item.label}
              </a>
            ))}
          </div>
        );
      })}
    </>
  );
}
