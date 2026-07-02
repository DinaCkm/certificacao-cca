import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setToken, clearToken } from "@/lib/api";

interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  menu_permissoes?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAvaliador: boolean;
  podeVerMenuItem: (key: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(
    () => localStorage.getItem("anefac_token")
  );
  const [loading, setLoading] = useState(true);

  // Carrega usuário ao iniciar se tiver token salvo
  useEffect(() => {
    const savedToken = localStorage.getItem("anefac_token");
    if (savedToken) {
      api.auth
        .me()
        .then((res) => setUser(res.user))
        .catch(() => {
          clearToken();
          setTokenState(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  // Se o perfil ainda não terminou de carregar (menu_permissoes indefinido),
  // libera a exibição por padrão para não "piscar" um menu vazio — assim que
  // o /auth/me responder, a lista real passa a filtrar de verdade. As rotas
  // continuam protegidas no backend independentemente disso.
  const podeVerMenuItem = (key: string) => {
    if (!user) return false;
    if (!user.menu_permissoes) return true;
    return user.menu_permissoes.includes(key);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "administrador",
        isAvaliador: user?.role === "avaliador" || user?.role === "administrador",
        podeVerMenuItem,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
