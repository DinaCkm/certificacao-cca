import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Step {
  id: number;
  title: string;
  path: string;
  icon: string;
}

const steps: Step[] = [
  { id: 1, title: "Perfil Profissional", path: "/step-2", icon: "👤" },
  { id: 2, title: "Compra", path: "/step-3", icon: "💳" },
  { id: 3, title: "Prova/Preparatório", path: "/step-4", icon: "📝" },
  { id: 4, title: "Resultado", path: "/step-5", icon: "📊" },
  { id: 5, title: "Upload Documental", path: "/step-6", icon: "📄" },
  { id: 6, title: "Entrevista Técnica", path: "/step-7", icon: "🎤" },
  { id: 7, title: "Decisão Final", path: "/step-8", icon: "✅" },
  { id: 8, title: "Certificado", path: "/step-9", icon: "🏆" },
];

export function NavigationSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-40 pt-20 ${isOpen ? "w-56 md:w-64" : "w-16 md:w-20"} overflow-y-auto shadow-lg`}
      >
        <div className="p-4 space-y-2">
          <h3 className={`font-bold text-xs mb-3 leading-tight ${isOpen ? "block" : "hidden"}`}>
            JORNADA DE<br />CERTIFICAÇÃO
          </h3>

          {steps.map((step) => (
            <Link key={step.id} href={step.path}>
              <a
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive(step.path)
                    ? "bg-blue-600 shadow-lg scale-105"
                    : "hover:bg-blue-700"
                }`}
              >
                <span className="text-lg flex-shrink-0">{step.icon}</span>
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-100">Etapa {step.id}</p>
                    <p className="text-xs font-semibold truncate">{step.title}</p>
                  </div>
                )}
              </a>
            </Link>
          ))}
        </div>

        {/* Botão de Voltar para Home */}
        <div className="p-3 border-t border-blue-700 mt-2">
          <Link href="/">
            <a>
              <Button
                variant="outline"
                className={`w-full text-blue-900 border-blue-300 hover:bg-blue-100 ${
                  isOpen ? "block" : "hidden"
                }`}
              >
                🏠 Voltar para Home
              </Button>
            </a>
          </Link>
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-0 top-24 z-50 bg-blue-900 text-white p-2 rounded-r-lg hover:bg-blue-800 transition-all"
        title={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? (
          <ChevronLeft size={20} />
        ) : (
          <ChevronRight size={20} />
        )}
      </button>

      {/* Spacer para o conteúdo principal */}
      <div className={`transition-all duration-300 ${isOpen ? "ml-56 md:ml-64" : "ml-16 md:ml-20"}`} />
    </>
  );
}
