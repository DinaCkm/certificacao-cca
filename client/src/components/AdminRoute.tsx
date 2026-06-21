import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

const ROLES_PERMITIDOS = ["avaliador", "gestor", "administrador"];

interface AdminRouteProps {
  component: React.ComponentType;
}

export function AdminRoute({ component: Component }: AdminRouteProps) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  // Aguarda verificação do token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Não autenticado → redireciona para login admin
  if (!user) {
    navigate("/novo-fluxo/admin/login");
    return null;
  }

  // Candidato logado tentando acessar admin → redireciona para login admin
  // (não desloga o candidato, apenas bloqueia o acesso)
  if (!ROLES_PERMITIDOS.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-sm text-gray-500 mb-6">
            Esta conta não tem permissão de acesso administrativo.
            Use uma conta de avaliador, gestor ou administrador.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/novo-fluxo/admin/login")}
              className="text-sm bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
            >
              Login administrativo
            </button>
            <button
              onClick={() => navigate("/novo-fluxo")}
              className="text-sm text-blue-700 underline"
            >
              Voltar para a plataforma
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Autorizado — renderiza o componente
  return <Component />;
}
