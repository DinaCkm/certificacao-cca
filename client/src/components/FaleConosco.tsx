import React, { useState } from "react";
import { MessageCircle, X, Send, CheckCircle, Loader2 } from "lucide-react";

export function FaleConosco() {
  const [aberto, setAberto] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });

  const handleEnviar = async () => {
    setErro("");
    if (!form.nome.trim() || !form.email.trim() || !form.mensagem.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (!form.email.includes("@")) {
      setErro("Informe um e-mail válido.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/fale-conosco/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, pagina_origem: window.location.pathname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEnviado(true);
      setTimeout(() => {
        setEnviado(false);
        setAberto(false);
        setForm({ nome: "", email: "", mensagem: "" });
      }, 3000);
    } catch (err: any) {
      setErro(err.message || "Erro ao enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(!aberto)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 text-white font-medium px-4 py-3 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}
        title="Fale Conosco"
      >
        {aberto ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        <span className="text-sm hidden sm:inline">{aberto ? "Fechar" : "Fale Conosco"}</span>
      </button>

      {/* Painel */}
      {aberto && (
        <div className="fixed bottom-20 right-6 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid #e2e8f0" }}>

          {/* Header */}
          <div className="px-5 py-4 text-white" style={{ background: "linear-gradient(135deg, #0a1f5e, #1a4a9e)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm">Fale Conosco</p>
                <p className="text-blue-200 text-xs">Equipe ANEFAC responde em breve</p>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-5">
            {enviado ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">Mensagem enviada!</p>
                <p className="text-sm text-gray-500 mt-1">Entraremos em contato pelo e-mail informado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {erro && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-red-700">{erro}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Nome *</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    placeholder="Seu nome completo"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">E-mail *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Mensagem *</label>
                  <textarea
                    value={form.mensagem}
                    onChange={e => setForm({ ...form, mensagem: e.target.value })}
                    placeholder="Como podemos ajudar?"
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900"
                  />
                </div>

                <button
                  onClick={handleEnviar}
                  disabled={enviando}
                  className="w-full flex items-center justify-center gap-2 text-white font-medium py-2.5 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}
                >
                  {enviando ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Enviar mensagem</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
