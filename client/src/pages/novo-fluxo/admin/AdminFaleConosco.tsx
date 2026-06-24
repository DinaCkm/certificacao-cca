import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle, Clock, Mail, User, MapPin, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Mensagem {
  id: number;
  nome: string;
  email: string;
  mensagem: string;
  lida: boolean;
  respondida: boolean;
  pagina_origem: string;
  criado_em: string;
  lida_em: string | null;
}

export function AdminFaleConosco() {
  const { toast } = useToast();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | "nao_lidas" | "lidas">("todas");
  const [expandida, setExpandida] = useState<number | null>(null);

  useEffect(() => { carregarMensagens(); }, []);

  async function carregarMensagens() {
    setCarregando(true);
    try {
      const res = await fetch("/api/admin/fale-conosco", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("anefac_token")}` }
      });
      const data = await res.json();
      setMensagens(data.mensagens || []);
    } catch {
      toast({ title: "Erro ao carregar mensagens", variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  async function marcarLida(id: number) {
    try {
      await fetch(`/api/admin/fale-conosco/${id}/lida`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${localStorage.getItem("anefac_token")}` }
      });
      setMensagens(prev => prev.map(m => m.id === id ? { ...m, lida: true } : m));
      toast({ title: "Marcada como lida" });
    } catch {
      toast({ title: "Erro ao marcar", variant: "destructive" });
    }
  }

  const filtradas = mensagens.filter(m => {
    if (filtro === "nao_lidas") return !m.lida;
    if (filtro === "lidas") return m.lida;
    return true;
  });

  const naoLidas = mensagens.filter(m => !m.lida).length;

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 45%, #1565c0 75%, #1976d2 100%)" }}>

      {/* Grid decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4fc3f7" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Fale Conosco</h1>
              <p className="text-sm text-blue-300">
                {naoLidas > 0 ? `${naoLidas} mensagem(ns) não lida(s)` : "Todas as mensagens lidas"}
              </p>
            </div>
          </div>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={carregarMensagens}>
            Atualizar
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-5">
          {[
            { key: "todas", label: `Todas (${mensagens.length})` },
            { key: "nao_lidas", label: `Não lidas (${naoLidas})` },
            { key: "lidas", label: `Lidas (${mensagens.length - naoLidas})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFiltro(key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                filtro === key
                  ? "text-white border-transparent"
                  : "border-white/20 text-blue-200 hover:border-blue-300"
              }`}
              style={filtro === key ? { background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" } : {}}>
              {label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {carregando ? (
          <div className="text-center py-12 text-blue-300">Carregando mensagens...</div>
        ) : filtradas.length === 0 ? (
          <Card className="border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
            <CardContent className="p-12 text-center">
              <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">Nenhuma mensagem encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtradas.map(msg => (
              <Card key={msg.id}
                className={`border transition-all cursor-pointer ${!msg.lida ? "border-blue-400/40" : "border-white/10"}`}
                style={{ background: !msg.lida ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.05)" }}
                onClick={() => {
                  setExpandida(expandida === msg.id ? null : msg.id);
                  if (!msg.lida) marcarLida(msg.id);
                }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${!msg.lida ? "bg-blue-500" : "bg-white/10"}`}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white text-sm">{msg.nome}</p>
                          {!msg.lida && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">Nova</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-blue-300">
                            <Mail className="w-3 h-3" />{msg.email}
                          </span>
                          {msg.pagina_origem && (
                            <span className="flex items-center gap-1 text-xs text-blue-400">
                              <MapPin className="w-3 h-3" />{msg.pagina_origem}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-blue-400">
                            <Clock className="w-3 h-3" />
                            {new Date(msg.criado_em).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-sm text-blue-200 mt-2 leading-relaxed">
                          {expandida === msg.id ? msg.mensagem : msg.mensagem.substring(0, 120) + (msg.mensagem.length > 120 ? "..." : "")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {msg.lida ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <button onClick={e => { e.stopPropagation(); marcarLida(msg.id); }}
                          className="flex items-center gap-1 text-xs border border-white/20 text-white/60 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
                          <Eye className="w-3 h-3" /> Marcar lida
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Botão voltar */}
        <div className="mt-8 pb-4">
          <a href="/novo-fluxo/admin"
            className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white px-5 py-2.5 rounded-xl text-sm transition-colors"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            ← Voltar ao menu admin
          </a>
        </div>
      </div>
    </div>
  );
}
