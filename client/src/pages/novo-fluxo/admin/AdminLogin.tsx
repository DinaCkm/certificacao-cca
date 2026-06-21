import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, AlertCircle } from "lucide-react";

export function AdminLogin() {
  const { login, logout, user } = useAuth();
  const [, navigate] = useLocation();
  const isCandidate = user && !["administrador","gestor_n1","gestor_n2","avaliador","entrevistador"].includes(user.role);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    setErro("");
    if (!email || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    setCarregando(true);
    try {
      await login(email, senha);
      // Verifica se tem permissão de admin
      const meRes = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("anefac_token")}` }
      });
      const meData = await meRes.json();
      const roleAdmin = ["administrador","gestor_n1","gestor_n2","avaliador","entrevistador"];
      if (!roleAdmin.includes(meData.user?.role)) {
        setErro("Esta conta não tem acesso ao painel administrativo.");
        // Não desloga o candidato — apenas impede acesso
        return;
      }
      navigate("/novo-fluxo/admin");
    } catch (err: any) {
      setErro(err.message || "E-mail ou senha incorretos.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Área Restrita</h1>
            <p className="text-sm text-gray-500 mt-1">Plataforma ANEFAC — Acesso Administrativo</p>
          </div>

          {/* Aviso se candidato logado */}
          {isCandidate && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-800 font-medium mb-1">
                Você está logado como candidato ({user?.email})
              </p>
              <button
                onClick={() => { logout(); setEmail(""); setSenha(""); setErro(""); }}
                className="text-xs text-amber-700 underline"
              >
                Sair desta conta para fazer login administrativo
              </button>
            </div>
          )}

        {/* Erro */}
          {erro && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{erro}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <Button
              className="w-full bg-blue-900 hover:bg-blue-800 mt-2"
              onClick={handleLogin}
              disabled={carregando}
            >
              {carregando ? "Entrando..." : "Entrar"}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-400 mt-6">
            Acesso restrito a avaliadores, gestores e administradores ANEFAC.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
