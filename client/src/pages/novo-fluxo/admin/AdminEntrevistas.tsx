import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, User, Calendar, Clock, Award, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Entrevista {
  agendamento_id: number;
  processo_id: number;
  candidato_nome: string;
  candidato_email: string;
  cert_nome: string;
  data_hora: string;
  status: string;
  entrevistador_nome: string;
}

function formatDataHora(dataHora: string) {
  const d = new Date(dataHora);
  return {
    completo: d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
    hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    data: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
  };
}

function CountdownBadge({ dataHora }: { dataHora: string }) {
  const [texto, setTexto] = useState("");
  const [aberta, setAberta] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(dataHora).getTime() - Date.now();
      if (diff <= 0) { setAberta(true); setTexto("Sala aberta agora!"); return; }
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seg = Math.floor((diff % (1000 * 60)) / 1000);
      setTexto(
        (dias > 0 ? `${dias}d ` : "") +
        `${String(horas).padStart(2,"0")}h ${String(min).padStart(2,"0")}min ${String(seg).padStart(2,"0")}s`
      );
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [dataHora]);

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-full",
      aberta ? "bg-green-100 text-green-700 animate-pulse" : "bg-indigo-100 text-indigo-700"
    )}>
      <Clock className="w-3 h-3" />
      {texto}
    </span>
  );
}

export function AdminEntrevistas() {
  const [, navigate] = useLocation();
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    const token = localStorage.getItem("anefac_token");
    try {
      const res = await fetch("/api/admin/entrevistas/agendadas", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEntrevistas(data.entrevistas || []);
    } catch {
      setEntrevistas([]);
    } finally {
      setCarregando(false);
    }
  }

  const proximas = entrevistas.filter(e => new Date(e.data_hora) > new Date());
  const abertas = entrevistas.filter(e => new Date(e.data_hora) <= new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-900 font-bold text-sm">A</span>
            </div>
            <div>
              <span className="font-bold">ANEFAC</span>
              <span className="text-blue-300 text-xs ml-2">Painel Administrativo</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={carregar} className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-white">
              <RefreshCw className="w-3.5 h-3.5" /> Atualizar
            </button>
            <Button variant="ghost" size="sm" className="text-white hover:text-blue-200"
              onClick={() => navigate("/novo-fluxo/admin")}>
              ← Voltar ao painel
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Entrevistas Agendadas</h1>
          <p className="text-muted-foreground text-sm">Gerencie as entrevistas técnicas dos candidatos.</p>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando entrevistas...
          </div>
        ) : entrevistas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="font-bold text-foreground mb-2">Nenhuma entrevista agendada</h2>
              <p className="text-sm text-muted-foreground">As entrevistas aparecerão aqui quando os candidatos agendarem.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">

            {/* Salas abertas agora */}
            {abertas.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Sala aberta agora ({abertas.length})
                </h2>
                <div className="space-y-3">
                  {abertas.map(e => <EntrevistaCard key={e.agendamento_id} e={e} aberta />)}
                </div>
              </div>
            )}

            {/* Próximas entrevistas */}
            {proximas.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Próximas entrevistas ({proximas.length})
                </h2>
                <div className="space-y-3">
                  {proximas.map(e => <EntrevistaCard key={e.agendamento_id} e={e} aberta={false} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function EntrevistaCard({ e, aberta }: { e: Entrevista; aberta: boolean }) {
  const [, navigate] = useLocation();
  const fmt = formatDataHora(e.data_hora);

  return (
    <Card className={cn("border-2", aberta ? "border-green-300 bg-green-50" : "border-indigo-100")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4 flex-1 min-w-0">

            {/* Data */}
            <div className={cn("w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 text-white",
              aberta ? "bg-green-600" : "bg-indigo-900")}>
              <span className="text-xl font-bold leading-none">{new Date(e.data_hora).getDate()}</span>
              <span className="text-xs opacity-80">{fmt.data.split("/")[1]}/{new Date(e.data_hora).getFullYear().toString().slice(2)}</span>
            </div>

            {/* Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-bold text-foreground">{e.candidato_nome}</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{e.cert_nome}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{e.candidato_email}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1 capitalize">
                  <Calendar className="w-3 h-3" /> {fmt.completo}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {fmt.hora}
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" /> {e.entrevistador_nome}
                </span>
              </div>
            </div>
          </div>

          {/* Countdown + botão */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <CountdownBadge dataHora={e.data_hora} />
            <Button
              size="sm"
              className={cn(aberta ? "bg-green-600 hover:bg-green-700" : "bg-indigo-900 hover:bg-indigo-800")}
              onClick={() => navigate("/novo-fluxo/sala-entrevista")}
            >
              <Video className="w-3.5 h-3.5 mr-1.5" />
              {aberta ? "Entrar na sala" : "Acessar sala"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
