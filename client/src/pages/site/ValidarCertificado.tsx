import React, { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { CheckCircle, XCircle, ShieldCheck, Search, Loader2, Award } from "lucide-react";

interface CertificadoPublico {
  codigo: string;
  candidato_nome: string;
  certificacao_nome: string;
  emitido_em: string;
  validade_ate: string | null;
  status: "ativo" | "revogado";
  revogado_em: string | null;
}

export function ValidarCertificado() {
  const [, params] = useRoute("/validar-certificado/:codigo");
  const [codigoInput, setCodigoInput] = useState(params?.codigo || "");
  const [certificado, setCertificado] = useState<CertificadoPublico | null>(null);
  const [carregando, setCarregando] = useState(!!params?.codigo);
  const [buscou, setBuscou] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (params?.codigo) buscar(params.codigo);
  }, [params?.codigo]);

  async function buscar(codigo: string) {
    if (!codigo.trim()) return;
    setCarregando(true);
    setErro("");
    setBuscou(true);
    try {
      const res = await api.validarCertificado(codigo.trim().toUpperCase());
      setCertificado(res.certificado);
    } catch (err: any) {
      setCertificado(null);
      setErro(err.message || "Certificado não encontrado");
    } finally {
      setCarregando(false);
    }
  }

  const expirado = certificado?.validade_ate && new Date(certificado.validade_ate) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-16 max-w-xl mx-auto px-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Validação de Certificado ANEFAC</h1>
          <p className="text-sm text-muted-foreground">Confirme a autenticidade de um certificado emitido pela ANEFAC.</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); buscar(codigoInput); }} className="flex gap-2">
              <Input
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value)}
                placeholder="Ex: ANEFAC-7K3F9A"
                className="font-mono"
              />
              <Button type="submit" className="bg-blue-900 hover:bg-blue-800 shrink-0" disabled={carregando}>
                {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {buscou && !carregando && !certificado && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="font-bold text-red-800 mb-2">Certificado não encontrado</h2>
              <p className="text-sm text-red-700">{erro || "Confira se o código foi digitado corretamente."}</p>
            </CardContent>
          </Card>
        )}

        {certificado && (
          <Card className={certificado.status === "ativo" && !expirado ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                {certificado.status === "ativo" && !expirado ? (
                  <>
                    <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-green-800">Certificado válido e autêntico</h2>
                  </>
                ) : certificado.status === "revogado" ? (
                  <>
                    <XCircle className="w-14 h-14 text-red-500 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-red-800">Este certificado foi revogado</h2>
                  </>
                ) : (
                  <>
                    <XCircle className="w-14 h-14 text-amber-500 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-amber-800">Certificado expirado</h2>
                  </>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Certificação</p>
                    <p className="font-semibold text-foreground">{certificado.certificacao_nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Titular</p>
                    <p className="font-semibold text-foreground">{certificado.candidato_nome}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-muted-foreground">Emitido em</p>
                    <p className="text-sm font-medium">{new Date(certificado.emitido_em).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Validade</p>
                    <p className="text-sm font-medium">{certificado.validade_ate ? new Date(certificado.validade_ate).toLocaleDateString("pt-BR") : "Indeterminada"}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-muted-foreground">Código</p>
                  <p className="text-sm font-mono font-semibold">{certificado.codigo}</p>
                </div>
                {certificado.status === "revogado" && certificado.revogado_em && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-muted-foreground">Revogado em</p>
                    <p className="text-sm font-medium text-red-700">{new Date(certificado.revogado_em).toLocaleDateString("pt-BR")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-8">
          <Link href="/"><a className="text-sm text-blue-700 hover:underline">← Voltar ao site da ANEFAC</a></Link>
        </div>
      </div>
    </div>
  );
}
