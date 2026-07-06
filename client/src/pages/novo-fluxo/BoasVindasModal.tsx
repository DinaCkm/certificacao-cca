import React, { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleCPF = (v: string) => { setCpf(formatCPF(v)); setErro(""); };

  const handleContinuar = async () => {
    setErro("");
    if (!nome.trim()) { setErro("Por favor, informe seu nome."); return; }
    if (!email || !email.includes("@")) { setErro("Por favor, informe um e-mail válido."); return; }
    if (cpf.replace(/\D/g, "").length !== 11) { setErro("Por favor, informe um CPF válido."); return; }
    if (!senha || senha.length < 8) { setErro("A senha deve ter no mínimo 8 caracteres."); return; }
    if (senha !== confirmarSenha) { setErro("As senhas não conferem."); return; }

    // O CPF já foi verificado ANTES de chegar aqui (tela de "Vamos começar",
    // antes de abrir este mini-cadastro) — checar de novo aqui, olhando
    // e-mail OU CPF, causava falso positivo quando o e-mail já tinha sido
    // usado em outro cadastro (mesmo com CPF novo), jogando o candidato pra
    // uma tela de login tentando a senha ERRADA (a que ele acabou de criar,
    // não a da conta antiga) e mostrando "e-mail ou senha incorretos" sem
    // explicação. Se o e-mail realmente colidir com outra conta, isso é
    // detectado de forma clara mais à frente, no envio final da ficha.
    onSuccess({ nome, email, cpf, senha });
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

          <Button className="w-full bg-blue-900 hover:bg-blue-800 mt-2" onClick={handleContinuar}>
            Quero me certificar →
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
