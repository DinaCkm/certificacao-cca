import React, { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setToken } from "@/lib/api";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

// Tela de trânsito para os links de "ação" nos e-mails: valida o token de
// uso único, autentica automaticamente (sem precisar digitar senha) e
// redireciona pra tela certa, com o item em destaque — a decisão em si
// continua sendo tomada na tela normal, com o contexto completo à vista.

export function MagicLinkAuth() {
  const [, params] = useRoute("/auth/magic/:token");
  const [, navigate] = useLocation();
  const [estado, setEstado] = useState<"validando" | "erro">("validando");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!params?.token) return;
    fetch(`/api/auth/magic/${params.token}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Link inválido");
        setToken(data.jwt);
        window.location.href = data.destino || "/novo-fluxo/admin";
      })
      .catch((err: any) => {
        setEstado("erro");
        setErro(err.message || "Não foi possível validar o link");
      });
  }, [params?.token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8 text-center">
          {estado === "validando" ? (
            <>
              <Loader2 className="w-10 h-10 text-blue-700 animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Autenticando...</p>
            </>
          ) : (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="font-bold text-foreground mb-2">Link inválido</h2>
              <p className="text-sm text-muted-foreground mb-6">{erro}</p>
              <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={() => navigate("/novo-fluxo/admin/login")}>
                Fazer login normalmente
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
