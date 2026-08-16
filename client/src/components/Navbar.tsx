import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Star, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/lib/roles";

const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Certificações", href: "/novo-fluxo/certificacoes" },
  { label: "Simulação", href: "/simulacao" },
];

export function Navbar() {
  const [location, navigate] = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { config } = useSiteConfig();
  const { user, isAuthenticated, logout } = useAuth();

  // Fonte única: candidato nunca vê "Área admin", perfil administrativo
  // (incluindo fiscal) sempre vê "Área administrativa" em vez do mural.
  const isAdmin = isAdminRole(user?.role);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuAberto(false); }, [location]);

  const isHome = location === "/" || location === "/novo-fluxo";

  function handleSair() {
    logout();
    navigate("/");
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || !isHome
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2.5 group">
            <img
              src="/logo-anefac.png"
              alt="ANEFAC"
              className="h-10 w-auto object-contain"
            />
            <div>
              <span className={cn("font-bold text-lg leading-none block transition-colors",
                scrolled || !isHome ? "text-gray-900" : "text-white")}>
                ANEFAC
              </span>
              <span className={cn("text-xs leading-none transition-colors",
                scrolled || !isHome ? "text-gray-500" : "text-blue-200")}>
                Certificações
              </span>
            </div>
          </a>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href}>
              <a className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                location === href
                  ? "bg-blue-900 text-white"
                  : scrolled || !isHome
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white/90 hover:bg-white/10"
              )}>
                {label}
              </a>
            </Link>
          ))}
          <div className="w-px h-5 bg-gray-300 mx-2" />

          {isAuthenticated && !isAdmin && (
            // Candidato autenticado — só "Mural do Candidato", nunca "Área admin"
            <Link href="/novo-fluxo">
              <a className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-yellow-400 text-blue-900 hover:bg-yellow-300 transition-all shadow-sm">
                <Star className="w-3.5 h-3.5 fill-current" />
                Mural do Candidato
              </a>
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            // Perfil administrativo (inclui fiscal) — "Área administrativa"
            <Link href="/novo-fluxo/admin">
              <a className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-blue-900 text-white hover:bg-blue-800 transition-all shadow-sm">
                <Shield className="w-3.5 h-3.5" />
                Área administrativa
              </a>
            </Link>
          )}

          {!isAuthenticated && (
            // Visitante — link discreto pra área do candidato, nunca "Área admin"
            <Link href="/novo-fluxo">
              <a className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                scrolled || !isHome
                  ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                  : "border-white/30 text-white hover:bg-white/10"
              )}>
                Área do candidato
              </a>
            </Link>
          )}

          {isAuthenticated && (
            <button onClick={handleSair}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ml-1",
                scrolled || !isHome
                  ? "text-gray-500 hover:text-red-600 hover:bg-red-50"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}>
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={cn("md:hidden p-2 rounded-lg transition-colors",
            scrolled || !isHome ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10")}
          onClick={() => setMenuAberto(!menuAberto)}
        >
          {menuAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuAberto && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href}>
                <a className={cn(
                  "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  location === href ? "bg-blue-900 text-white" : "text-gray-700 hover:bg-gray-50"
                )}>
                  {label}
                </a>
              </Link>
            ))}

            {isAuthenticated && !isAdmin && (
              <Link href="/novo-fluxo">
                <a className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-bold bg-yellow-400 text-blue-900 hover:bg-yellow-300 mt-2">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Mural do Candidato
                </a>
              </Link>
            )}

            {isAuthenticated && isAdmin && (
              <Link href="/novo-fluxo/admin">
                <a className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-bold bg-blue-900 text-white hover:bg-blue-800 mt-2">
                  <Shield className="w-3.5 h-3.5" />
                  Área administrativa
                </a>
              </Link>
            )}

            {!isAuthenticated && (
              <Link href="/novo-fluxo">
                <a className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 mt-2">
                  Área do candidato
                </a>
              </Link>
            )}

            {isAuthenticated && (
              <button onClick={handleSair}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 mt-2 border-t border-gray-100 pt-3">
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
