import React from "react";
import { useLocation } from "wouter";
import { useCertification } from "@/contexts/CertificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, ChevronRight, ArrowLeft, LogOut } from "lucide-react";

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
  { num: 1, label: "Cadastro",    short: "Cadastro" },
  { num: 2, label: "Pagamento 1", short: "Pgto 1" },
  { num: 3, label: "Upload",      short: "Upload" },
  { num: 4, label: "Validação",   short: "Valid." },
  { num: 5, label: "Avaliação",   short: "Aval." },
  { num: 6, label: "Pagamento 2", short: "Pgto 2" },
  { num: 7, label: "Certificado", short: "Cert." },
];

const MAX_WIDTH_MAP = {
  sm:  "max-w-2xl",
  md:  "max-w-3xl",
  lg:  "max-w-5xl",
  xl:  "max-w-6xl",
  "2xl": "max-w-7xl",
};

export function FluxoLayout({
  children,
  currentStep,
  title,
  subtitle,
  backHref,
  backLabel,
  maxWidth = "xl",
}: FluxoLayoutProps) {
  const [, navigate] = useLocation();
  const { processo, getCertificacaoAtual } = useCertification();
  const { user, logout } = useAuth();
  const certAtual = getCertificacaoAtual();
  const progress = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 flex-shrink-0 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-md group-hover:shadow-blue-200 transition-shadow">
              <span className="text-white font-black text-xs">A</span>
            </div>
            <span className="font-black text-gray-900 text-base hidden sm:block">ANEFAC</span>
          </button>

          <div className="w-px h-6 bg-gray-200 hidden sm:block" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0 flex-1">
            <button
              onClick={() => navigate("/")}
              className="hover:text-blue-700 transition-colors font-medium hidden sm:block"
            >
              Certificações
            </button>
            <ChevronRight className="w-3 h-3 hidden sm:block flex-shrink-0" />
            {certAtual && (
              <>
                <span className="text-gray-400 hidden sm:block truncate">Certificação {certAtual.numero}</span>
                <ChevronRight className="w-3 h-3 hidden sm:block flex-shrink-0" />
              </>
            )}
            <span className="text-gray-700 font-semibold truncate">{title}</span>
          </div>

          {/* Cert badge */}
          {certAtual && (
            <div className="flex-shrink-0 hidden md:flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-lg bg-blue-700 flex items-center justify-center">
                <span className="text-white font-black text-xs">{certAtual.numero}</span>
              </div>
              <span className="text-xs font-semibold text-blue-800 max-w-[140px] truncate">
                {certAtual.nome}
              </span>
            </div>
          )}

          {/* Candidato logado — sempre visível, evita confusão sobre qual conta está ativa */}
          {user && (
            <div className="flex-shrink-0 flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-[11px]">
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden lg:block leading-tight">
                <p className="text-xs font-semibold text-gray-800 max-w-[140px] truncate">
                  {user.full_name || user.email}
                </p>
                <p className="text-[10px] text-gray-400 max-w-[140px] truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                title="Sair da conta"
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full progress-fill rounded-r-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* ── Step Indicator ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between relative">
            {/* Background connector */}
            <div className="absolute left-4 right-4 top-4 h-0.5 bg-gray-100 hidden sm:block" />
            {/* Active connector */}
            <div
              className="absolute left-4 top-4 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 hidden sm:block transition-all duration-700"
              style={{ width: `calc(${Math.min(progress, 100)}% - 2rem)` }}
            />

            {STEPS.map((step) => {
              const isDone   = step.num < currentStep;
              const isActive = step.num === currentStep;
              return (
                <div key={step.num} className="flex flex-col items-center gap-1.5 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isDone
                      ? "step-done shadow-md"
                      : isActive
                      ? "step-active shadow-lg animate-pulse-glow"
                      : "bg-white border-2 border-gray-200"
                  }`}>
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className={`text-xs font-black ${isActive ? "text-white" : "text-gray-400"}`}>
                        {step.num}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block transition-colors ${
                    isDone ? "text-emerald-600" : isActive ? "text-blue-700" : "text-gray-400"
                  }`}>
                    {step.short}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Page Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 py-8 sm:py-10">
        <div className={`${MAX_WIDTH_MAP[maxWidth]} mx-auto px-4 sm:px-6`}>
          {/* Page header */}
          <div className="mb-8">
            {backHref && (
              <button
                onClick={() => navigate(backHref)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-700 transition-colors mb-4 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                {backLabel || "Voltar"}
              </button>
            )}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl step-active flex items-center justify-center shadow-md">
                <span className="text-white font-black text-sm">{currentStep}</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{title}</h1>
                {subtitle && (
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">{subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {children}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <span>ANEFAC — Processo de Certificação</span>
          <span>Etapa {currentStep} de {STEPS.length}</span>
        </div>
      </footer>
    </div>
  );
}
