import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setToken, clearToken } from "@/lib/api";

interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
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
