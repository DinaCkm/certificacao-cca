import React from "react";
import { Link } from "wouter";
import { useCertification } from "@/contexts/CertificationContext";
import { cn } from "@/lib/utils";

interface FluxoLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const STEPS = [
  { id: 1, label: "Certificação" },
  { id: 2, label: "Cadastro" },
  { id: 3, label: "Documentos" },
  { id: 4, label: "Pagamento" },
  { id: 5, label: "Validação" },
  { id: 6, label: "Avaliação" },
  { id: 7, label: "Certificado" },
];

const MAX_WIDTHS = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  "2xl": "max-w-6xl",
};

export function FluxoLayout({
  children,
  currentStep,
  title,
  subtitle,
  backHref,
  backLabel = "Voltar",
  maxWidth = "xl",
}: FluxoLayoutProps) {
  const { processo } = useCertification();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/">
            <a className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-blue-900 text-base leading-none block">ANEFAC</span>
                <span className="text-xs text-muted-foreground leading-none">Certificação Profissional</span>
              </div>
            </a>
          </Link>

          {processo.certificacaoNome && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-blue-500 font-medium hidden sm:inline">Certificação:</span>
              <span className="font-bold text-blue-900">{processo.certificacaoNome}</span>
            </div>
          )}
        </div>

        {/* Step Progress */}
        <div className="bg-white border-t border-border/50">
          <div className="max-w-5xl mx-auto px-4 py-2.5">
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
              {STEPS.map((step, idx) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isUpcoming = step.id > currentStep;

                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0",
                        isCompleted && "bg-green-100 text-green-700",
                        isCurrent && "bg-blue-900 text-white shadow-sm",
                        isUpcoming && "bg-gray-100 text-gray-400"
                      )}
                    >
                      <span
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          isCompleted && "bg-green-500 text-white",
                          isCurrent && "bg-white text-blue-900",
                          isUpcoming && "bg-gray-300 text-gray-500"
                        )}
                      >
                        {isCompleted ? "✓" : step.id}
                      </span>
                      <span className="hidden sm:inline">{step.label}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "h-px flex-1 min-w-[6px]",
                          step.id < currentStep ? "bg-green-400" : "bg-gray-200"
                        )}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("mx-auto px-4 py-8", MAX_WIDTHS[maxWidth])}>
        {/* Back Button */}
        {backHref && (
          <div className="mb-5">
            <Link href={backHref}>
              <a className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {backLabel}
              </a>
            </Link>
          </div>
        )}

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-1.5">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm sm:text-base">{subtitle}</p>}
        </div>

        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-white">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} ANEFAC — Associação Nacional dos Executivos de Finanças, Administração e Contabilidade
          </p>
          <div className="flex gap-4">
            {["Política de Privacidade", "Termos de Uso", "Suporte"].map((item) => (
              <a key={item} href="#" className="text-xs text-muted-foreground hover:text-blue-700 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
