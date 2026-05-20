import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface NavigationProps {
  currentStep?: number;
  userName?: string;
  onLogout?: () => void;
}

export default function Navigation({ currentStep, userName, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const steps = [
    { number: 1, label: 'Escolha da Jornada', path: '/step-1' },
    { number: 2, label: 'Cadastro', path: '/step-2' },
    { number: 3, label: 'Compra', path: '/step-3' },
    { number: 4, label: 'Prova', path: '/step-4' },
    { number: 5, label: 'Resultado', path: '/step-5' },
    { number: 6, label: 'Documentos', path: '/step-6' },
    { number: 7, label: 'Entrevista', path: '/step-7' },
    { number: 8, label: 'Decisão', path: '/step-8' },
    { number: 9, label: 'Certificado', path: '/step-9' },
  ];

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-lg text-primary hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-anefac-secondary rounded-lg flex items-center justify-center text-white font-bold">
                A
              </div>
              <span>ANEFAC CCA</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/">
              <a className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Início
              </a>
            </Link>
            <Link href="/about">
              <a className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Sobre
              </a>
            </Link>
            <Link href="/faq">
              <a className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                FAQ
              </a>
            </Link>
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {userName ? (
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">Candidato</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex gap-2">
                <Button variant="outline" size="sm">
                  Entrar
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Começar
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link href="/">
                <a className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Início
                </a>
              </Link>
              <Link href="/about">
                <a className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Sobre
                </a>
              </Link>
              <Link href="/faq">
                <a className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Progress Stepper - Only show when in a step */}
      {currentStep && currentStep > 0 && (
        <div className="bg-secondary border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center gap-2 flex-shrink-0">
                  <Link href={step.path}>
                    <a
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${
                        currentStep === step.number
                          ? 'bg-primary text-white shadow-lg'
                          : currentStep > step.number
                          ? 'bg-primary/20 text-primary'
                          : 'bg-border text-muted-foreground'
                      }`}
                    >
                      {step.number}
                    </a>
                  </Link>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-1 transition-colors ${
                        currentStep > step.number ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Etapa {currentStep} de 9: {steps[currentStep - 1]?.label}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
