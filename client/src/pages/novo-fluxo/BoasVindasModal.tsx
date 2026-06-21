import React, { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { AlertCircle, Eye, EyeOff, Sparkles } from "lucide-react";

interface BoasVindasModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (dados: { nome: string; email: string; cpf: string; senha: string }) => void;
}

function formatCPF(v: string) {
  return v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})/, "$1-$2").slice(0, 14);
}

export function BoasVindasModal({ open, onClose, onSuccess }: BoasVindasModalProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [erro, setErro] = useState("");

  const handleCPF = (v: string) => { setCpf(formatCPF(v)); setErro(""); };

  const handleContinuar = async () => {
    setErro("");
    if (!nome.trim()) { setErro("Por favor, informe seu nome."); return; }
    if (!email || !email.includes("@")) { setErro("Por favor, informe um e-mail válido."); return; }
    if (cpf.replace(/\D/g, "").length !== 11) { setErro("Por favor, informe um CPF válido."); return; }
    if (!senha || senha.length < 8) { setErro("A senha deve ter no mínimo 8 caracteres."); return; }
    if (senha !== confirmarSenha) { setErro("As senhas não conferem."); return; }

    setVerificando(true);
    try {
      // Verifica se o CPF/email já existe no banco
      const cpfLimpo = cpf.replace(/\D/g, "");
      const res = await fetch("/api/auth/verificar-cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, cpf: cpfLimpo }),
      });
      const data = await res.json();

      if (data.existe) {
        // Já tem cadastro — redireciona para login
        toast({
          title: "Você já tem cadastro!",
          description: "Encontramos seu cadastro. Entre com sua senha para continuar seu processo.",
        });
        onClose();
        navigate("/novo-fluxo");
        return;
      }

      // Novo candidato — passa os dados para pré-preencher o cadastro
      onSuccess({ nome, email, cpf, senha });
    } catch {
      // Se a rota não existir ainda, apenas passa os dados
      onSuccess({ nome, email, cpf, senha });
    } finally {
      setVerificando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-8 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Seja bem-vindo!</h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Para que possamos apresentar as melhores opções de certificação para o seu perfil, 
            precisamos de algumas informações rápidas.
          </p>
          <p className="text-blue-300 text-xs mt-2">
            Não se preocupe — é apenas para identificá-lo e você poderá prosseguir para conhecer mais detalhes.
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {erro && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{erro}</p>
            </div>
          )}

          <div>
            <Label>Nome completo</Label>
            <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Como você se chama?" />
          </div>

          <div>
            <Label>E-mail</Label>
            <Input type="email" value={email} onChange={e => { setEmail(e.target.value); setErro(""); }} placeholder="seu@email.com" />
          </div>

          <div>
            <Label>CPF</Label>
            <Input value={cpf} onChange={e => handleCPF(e.target.value)} placeholder="000.000.000-00" />
            <p className="text-xs text-gray-400 mt-1">Usado para identificar se você já tem cadastro conosco.</p>
          </div>

          <div>
            <Label>Crie sua senha de acesso</Label>
            <div className="relative">
              <Input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={e => { setSenha(e.target.value); setErro(""); }}
                placeholder="Mínimo 8 caracteres"
                className="pr-10"
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label>Confirmar senha</Label>
            <div className="relative">
              <Input
                type={mostrarSenha ? "text" : "password"}
                value={confirmarSenha}
                onChange={e => { setConfirmarSenha(e.target.value); setErro(""); }}
                placeholder="Repita a senha"
                className="pr-10"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Você usará esta senha para acompanhar seu processo.</p>
          </div>

          <Button className="w-full bg-blue-900 hover:bg-blue-800 mt-2" onClick={handleContinuar} disabled={verificando}>
            {verificando ? "Verificando..." : "Conhecer as certificações →"}
          </Button>

          <p className="text-xs text-center text-gray-400">
            Já tem cadastro?{" "}
            <button onClick={() => { onClose(); navigate("/novo-fluxo"); }} className="text-blue-700 underline">
              Acesse aqui
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
