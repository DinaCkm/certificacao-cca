import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, ChevronLeft, Menu, X, Shield } from "lucide-react";

export function NavbarGlobal() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const location = window.location.pathname;

  const isAdmin = user && ["administrador", "gestor_n1", "gestor_n2", "avaliador", "entrevistador"].includes((user as any).role);
  const isAdminArea = location.startsWith("/novo-fluxo/admin");
  const isNovoFluxo = location.startsWith("/novo-fluxo") && !isAdminArea;

  const handleSair = () => {
    logout();
    navigate("/novo-fluxo");
  };

  const handleVoltar = () => {
    window.history.back();
  };

  // Não exibe navbar nas páginas de login
  if (location === "/novo-fluxo/admin/login") return null;
  // Não exibe na página de entrada (tem sua própria navbar)
  if (location === "/novo-fluxo") return null;

  return (
    <nav className="sticky top-0 z-40 w-full border-b"
      style={{
        background: isAdminArea ? "#0a1f5e" : "rgba(5,10,40,0.95)",
        borderColor: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)"
      }}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

        {/* Esquerda: Voltar + Logo */}
        <div className="flex items-center gap-2">
          {location !== "/novo-fluxo" && (
            <button onClick={handleVoltar}
              className="flex items-center gap-1 text-white/60 hover:text-white text-xs px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          )}
          <a href="/novo-fluxo" className="flex items-center gap-2">
            <img src="/logo-anefac.png" alt="ANEFAC" className="h-7 drop-shadow"
              onError={e => { (e.target as any).style.display = "none"; }} />
            <span className="text-white font-bold text-sm hidden md:block">ANEFAC</span>
            {isAdminArea && (
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full hidden sm:inline">
                Admin
              </span>
            )}
          </a>
        </div>

        {/* Centro: Links de navegação (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {isAdminArea ? (
            <>
              <a href="/novo-fluxo/admin" className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${location === "/novo-fluxo/admin" ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}>Dashboard</a>
              <a href="/novo-fluxo/admin/validacao" className="text-xs px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">Validação</a>
              <a href="/novo-fluxo/admin/prova-config" className="text-xs px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">Prova</a>
              <a href="/novo-fluxo/admin/usuarios" className="text-xs px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">Usuários</a>
              <a href="/novo-fluxo/admin/candidatos" className="text-xs px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">Candidatos</a>
              <a href="/novo-fluxo/admin/fale-conosco" className="text-xs px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">Fale Conosco</a>
            </>
          ) : (
            <>
              <a href="/novo-fluxo/certificacoes" className="text-xs px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">Certificações</a>
              <a href="/como-funciona" className="text-xs px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">Como funciona</a>
              <a href="/cursos" className="text-xs px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">Cursos</a>
            </>
          )}
        </div>

        {/* Direita: Usuário + Sair */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user && (
            <div className="hidden sm:flex items-center gap-2">
              {isAdmin && !isAdminArea && (
                <a href="/novo-fluxo/admin"
                  className="flex items-center gap-1.5 text-xs border border-white/20 text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <Shield className="w-3.5 h-3.5" />
                  Área Admin
                </a>
              )}
              <span className="text-xs text-white/50 max-w-32 truncate hidden lg:block">
                {(user as any).email || (user as any).nome}
              </span>
              <button onClick={handleSair}
                className="flex items-center gap-1.5 text-xs border border-white/20 text-white/70 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>
          )}

          {!isAuthenticated && !isAdminArea && (
            <a href="/novo-fluxo"
              className="text-xs border border-white/20 text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors hidden sm:block">
              Área do candidato
            </a>
          )}

          {/* Menu mobile */}
          <button onClick={() => setMenuAberto(!menuAberto)}
            className="md:hidden text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            {menuAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile dropdown */}
      {menuAberto && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1" style={{ background: "rgba(5,10,40,0.98)" }}>
          {isAdminArea ? (
            <>
              <a href="/novo-fluxo/admin" className="block text-sm text-white/70 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10">Dashboard</a>
              <a href="/novo-fluxo/admin/validacao" className="block text-sm text-white/70 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10">Validação Documental</a>
              <a href="/novo-fluxo/admin/prova-config" className="block text-sm text-white/70 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10">Parametrizar Prova</a>
              <a href="/novo-fluxo/admin/usuarios" className="block text-sm text-white/70 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10">Gestão de Usuários</a>
              <a href="/novo-fluxo/admin/candidatos" className="block text-sm text-white/70 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10">Candidatos</a>
              <a href="/novo-fluxo/admin/fale-conosco" className="block text-sm text-white/70 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10">Fale Conosco</a>
            </>
          ) : (
            <>
              <a href="/novo-fluxo/certificacoes" className="block text-sm text-white/70 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10">Certificações</a>
              <a href="/como-funciona" className="block text-sm text-white/70 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10">Como funciona</a>
              <a href="/cursos" className="block text-sm text-white/70 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10">Cursos</a>
            </>
          )}
          {isAuthenticated && (
            <button onClick={handleSair} className="w-full text-left text-sm text-red-300 py-2 px-3 rounded-lg hover:bg-red-500/10 flex items-center gap-2 mt-2 border-t border-white/10 pt-3">
              <LogOut className="w-4 h-4" /> Sair da conta
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
