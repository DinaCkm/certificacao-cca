import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Certificações", href: "/certificacoes" },
  { label: "Como funciona", href: "/como-funciona" },
  { label: "Simulação", href: "/simulacao" },
];

export function Navbar() {
  const [location] = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuAberto(false); }, [location]);

  const isHome = location === "/" || location === "/novo-fluxo";

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
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-base"
              style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #2d5be3 100%)" }}>
              A
            </div>
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
          <Link href="/novo-fluxo/admin">
            <a className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
              scrolled || !isHome
                ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                : "border-white/30 text-white hover:bg-white/10"
            )}>
              Área admin
            </a>
          </Link>
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
            <Link href="/novo-fluxo/admin">
              <a className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 mt-2">
                Área admin
              </a>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
