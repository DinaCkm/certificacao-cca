import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle, XCircle, FileText, User, Eye, X, Check,
  Send, Loader2, AlertTriangle, ShieldAlert, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ChecklistItem { id: string; label: string; checked: boolean | null; }
interface DocAvaliacao {
  documento_idx: number;
  documento_nome: string;
  aprovado: boolean | null;
  parecer: string;
  checklist: ChecklistItem[];
}
interface Candidato {
  processo_id: number;
  user_id: number;
  full_name: string;
  email: string;
  cert_nome: string;
  documentos: any[];
}

function getChecklist(nome: string): ChecklistItem[] {
  const n = nome.toLowerCase();
  if (n.includes("diploma") || n.includes("graduação") || n.includes("pós")) return [
    { id: "legivel", label: "Documento legível e sem rasuras", checked: null },
    { id: "autenticado", label: "Autenticado ou cópia reconhecida", checked: null },
    { id: "graduacao", label: "Comprova graduação em área compatível", checked: null },
    { id: "mec", label: "Emitido por instituição reconhecida pelo MEC", checked: null },
  ];
  if (n.includes("declaração") || n.includes("experiência") || n.includes("empresa")) return [
    { id: "legivel", label: "Documento legível e sem rasuras", checked: null },
    { id: "timbrado", label: "Em papel timbrado da empresa", checked: null },
    { id: "assinado", label: "Assinado por responsável com cargo", checked: null },
    { id: "periodo", label: "Informa período e cargo exercido", checked: null },
    { id: "anos", label: "Comprova tempo mínimo de experiência", checked: null },
  ];
  return [
    { id: "legivel", label: "Documento legível e sem rasuras", checked: null },
    { id: "completo", label: "Documento completo", checked: null },
    { id: "valido", label: "Documento válido", checked: null },
    { id: "pertinente", label: "Pertinente ao requisito", checked: null },
  ];
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export function AdminValidacaoDocumental() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const token = localStorage.getItem("anefac_token");

  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [candidato, setCandidato] = useState<Candidato | null>(null);

  // Estado da validação dupla
  const [meuNumero, setMeuNumero] = useState<1 | 2 | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [docAberto, setDocAberto] = useState<number | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<DocAvaliacao[]>([]);
  const [caminho, setCaminho] = useState<"A" | "B" | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [discordancias, setDiscordancias] = useState<any[]>([]);
  const [modoDesempate, setModoDesempate] = useState(false);

  useEffect(() => { carregarCandidatos(); }, []);

  async function carregarCandidatos() {
    setCarregando(true);
    try {
      const res = await fetch("/api/admin/validacao/pendentes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCandidatos(data.candidatos || []);
    } finally { setCarregando(false); }
  }

  async function selecionarCandidato(c: Candidato) {
    setCandidato(c);
    setDocAberto(null);
    setDiscordancias([]);
    setModoDesempate(false);

    // Busca estado da validação dupla
    const res = await fetch(`/api/admin/validacao-dupla/${c.processo_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setMeuNumero(data.meu_numero);
    setIsAdmin(data.is_admin);
    setDiscordancias(data.discordancias || []);

    // Inicializa avaliações com dados existentes ou zerados
    const nomesDoc = [
      "Diploma de graduação ou pós-graduação",
      "Declaração da empresa atual comprovando experiência",
      "Código de Conduta ANEFAC assinado",
    ];

    const lista: DocAvaliacao[] = nomesDoc.map((nome, idx) => {
      const docExistente = data.documentos?.find((d: any) => d.documento_idx === idx);
      const minhaAv = docExistente?.minha_avaliacao;
      return {
        documento_idx: idx,
        documento_nome: nome,
        aprovado: minhaAv?.aprovado ?? null,
        parecer: minhaAv?.parecer || "",
        checklist: minhaAv?.checklist || getChecklist(nome),
      };
    });
    setAvaliacoes(lista);

    // Se há desempate, entra em modo desempate
    if (data.discordancias?.length > 0 && data.is_admin) setModoDesempate(true);
  }

  const docAtual = docAberto !== null ? avaliacoes[docAberto] : null;

  function toggleChecklist(docIdx: number, itemId: string, valor: boolean) {
    setAvaliacoes(prev => prev.map((a, i) =>
      i === docIdx ? { ...a, checklist: a.checklist.map(c => c.id === itemId ? { ...c, checked: valor } : c) } : a
    ));
  }

  async function registrarDecisaoDoc(docIdx: number, aprovado: boolean) {
    const doc = avaliacoes[docIdx];
    try {
      const res = await fetch(`/api/admin/validacao-dupla/${candidato!.processo_id}/avaliar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          documento_idx: doc.documento_idx,
          documento_nome: doc.documento_nome,
          aprovado,
          parecer: doc.parecer,
          checklist: doc.checklist,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Atualiza local
      setAvaliacoes(prev => prev.map((a, i) => i === docIdx ? { ...a, aprovado } : a));
      if (!meuNumero) setMeuNumero(data.meu_numero);
      setDocAberto(null);
      toast({ title: aprovado ? "✓ Documento aprovado" : "✗ Documento reprovado",
              variant: aprovado ? "default" : "destructive" });
    } catch (err: any) {
      toast({ title: "Erro ao registrar", description: err.message, variant: "destructive" });
    }
  }

  const [mostrarEncaminhamento, setMostrarEncaminhamento] = useState(false);

  async function verificarEFechar() {
    // Primeiro verifica concordância antes de mostrar encaminhamento
    if (!mostrarEncaminhamento && !modoDesempate) {
      setMostrarEncaminhamento(true); return;
    }
    fecharAvaliacao();
  }

  async function fecharAvaliacao() {
    if (!caminho && !modoDesempate) {
      toast({ title: "Selecione o encaminhamento", variant: "destructive" }); return;
    }
    setEnviando(true);
    try {
      const body: any = { caminho };
      if (modoDesempate) {
        body.desempate_docs = avaliacoes.map(a => ({
          documento_idx: a.documento_idx, aprovado: a.aprovado
        }));
      }
      const res = await fetch(`/api/admin/validacao-dupla/${candidato!.processo_id}/fechar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.status === "desempate") {
          setDiscordancias(data.discordancias || []);
          toast({ title: "⚠️ Discordâncias detectadas", description: "O administrador será notificado.", variant: "destructive" });
        } else throw new Error(data.error);
        return;
      }
      toast({ title: "✅ Avaliação fechada com sucesso!" });
      setCandidatos(prev => prev.filter(c => c.processo_id !== candidato!.processo_id));
      setCandidato(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally { setEnviando(false); }
  }

  const todosAvaliados = avaliacoes.every(a => a.aprovado !== null);
  const podeFechar = meuNumero === 2 || isAdmin;

  // ── Tela: lista de candidatos ─────────────────────────────────────────────
  if (!candidato) return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-900 font-bold text-sm">A</span>
            </div>
            <span className="font-bold">ANEFAC</span>
            <span className="text-blue-300 text-xs ml-2">Validação Documental</span>
          </div>
          <Button variant="ghost" size="sm" className="text-white" onClick={() => navigate("/novo-fluxo/admin")}>
            ← Voltar
          </Button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Validação Documental</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sistema de dupla avaliação — cada avaliador registra sua análise de forma independente.
        </p>

        {carregando ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando...</div>
        ) : candidatos.length === 0 ? (
          <Card><CardContent className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="font-bold">Nenhum candidato aguardando validação</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {candidatos.map(c => (
              <Card key={c.processo_id} className="hover:shadow-md cursor-pointer" onClick={() => selecionarCandidato(c)}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{c.full_name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                    <p className="text-xs text-blue-700 mt-0.5">{c.cert_nome}</p>
                  </div>
                  <Button size="sm" className="bg-blue-900 hover:bg-blue-800 shrink-0">
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> Analisar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );

  // ── Tela: análise dos documentos ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Modal do documento */}
      {docAberto !== null && docAtual && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4">

            <div className="flex items-center justify-between px-6 py-4 border-b bg-blue-900 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-200" />
                <span className="font-semibold text-white text-sm">{docAtual.documento_nome}</span>
                {meuNumero && (
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold ml-2",
                    meuNumero === 1 ? "bg-blue-500 text-white" : "bg-purple-500 text-white")}>
                    Avaliador {meuNumero}
                  </span>
                )}
              </div>
              <button onClick={() => setDocAberto(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-800">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Arquivo */}
              <div className="lg:w-1/2 bg-gray-100 min-h-[400px] flex items-center justify-center rounded-bl-2xl">
                {(() => {
                  // Busca o documento pelo tipo_documento (doc-0, doc-1, doc-2)
                  const tipoKey = `doc-${docAberto}`;
                  const docEnviado = candidato.documentos.find((d: any) =>
                    d.tipo_documento === tipoKey
                  );
                  const caminho = docEnviado?.caminho_arquivo || docEnviado?.nome_arquivo;
                  if (!caminho) return (
                    <div className="text-center text-muted-foreground p-8">
                      <FileText className="w-16 h-16 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">Nenhum arquivo enviado</p>
                      <p className="text-xs mt-1 opacity-60">O candidato ainda não enviou este documento.</p>
                    </div>
                  );
                  const url = `/api/upload/documento/${caminho}?token=${token}`;
                  const isPdf = caminho.toLowerCase().endsWith(".pdf");
                  return isPdf ? (
                    <iframe src={url} title={docAtual.documento_nome}
                      className="w-full min-h-[500px] rounded-bl-2xl" style={{ border: "none" }} />
                  ) : (
                    <img src={url} alt={docAtual.documento_nome}
                      className="w-full h-full object-contain p-4 max-h-[70vh]"
                      onError={e => { (e.target as HTMLImageElement).src = ""; }}
                    />
                  );
                })()}
              </div>

              {/* Avaliação */}
              <div className="lg:w-1/2 p-6 space-y-5 overflow-y-auto max-h-[80vh]">
                {/* Aviso de avaliação cega */}
                {meuNumero === 2 && (
                  <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <Lock className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-purple-700">
                      <strong>Avaliação independente:</strong> você não tem acesso à avaliação do Avaliador 1.
                    </p>
                  </div>
                )}

                {/* Checklist */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Checklist de validação</h3>
                  <div className="space-y-2">
                    {docAtual.checklist.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                        <span className="text-xs text-foreground flex-1 pr-3">{item.label}</span>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => toggleChecklist(docAberto, item.id, true)}
                            className={cn("w-7 h-7 rounded-lg flex items-center justify-center border transition-all",
                              item.checked === true ? "bg-green-500 border-green-500 text-white" : "border-gray-300 text-gray-400 hover:border-green-400")}>
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toggleChecklist(docAberto, item.id, false)}
                            className={cn("w-7 h-7 rounded-lg flex items-center justify-center border transition-all",
                              item.checked === false ? "bg-red-500 border-red-500 text-white" : "border-gray-300 text-gray-400 hover:border-red-400")}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parecer */}
                <div>
                  <label className="text-sm font-semibold block mb-2">Meu parecer</label>
                  <textarea
                    value={docAtual.parecer}
                    onChange={e => setAvaliacoes(prev => prev.map((a, i) => i === docAberto ? { ...a, parecer: e.target.value } : a))}
                    className="w-full border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3} placeholder="Descreva sua análise..." />
                </div>

                {/* Decisão */}
                <div className="flex gap-3 pt-2 border-t">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => registrarDecisaoDoc(docAberto, true)}>
                    <Check className="w-4 h-4 mr-2" /> Aprovar
                  </Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => registrarDecisaoDoc(docAberto, false)}>
                    <X className="w-4 h-4 mr-2" /> Reprovar
                  </Button>
                </div>

                {/* Navegação */}
                <div className="flex gap-2">
                  {docAberto > 0 && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setDocAberto(docAberto - 1)}>
                      ← Anterior
                    </Button>
                  )}
                  {docAberto < avaliacoes.length - 1 && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setDocAberto(docAberto + 1)}>
                      Próximo →
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-blue-900 text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-900 font-bold text-sm">A</span>
            </div>
            <span className="font-bold">ANEFAC</span>
            <span className="text-blue-300 text-xs ml-2">Validação Documental</span>
          </div>
          <Button variant="ghost" size="sm" className="text-white" onClick={() => setCandidato(null)}>
            ← Lista
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header candidato */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{candidato.full_name}</h1>
            <p className="text-sm text-muted-foreground">{candidato.email} · {candidato.cert_nome}</p>
          </div>
          {meuNumero && (
            <span className={cn("ml-auto px-4 py-2 rounded-full text-sm font-bold",
              meuNumero === 1 ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800")}>
              Você é o Avaliador {meuNumero}
            </span>
          )}
          {!meuNumero && !isAdmin && (
            <span className="ml-auto px-4 py-2 rounded-full text-sm font-bold bg-gray-100 text-gray-600">
              Clique em Analisar para se atribuir
            </span>
          )}
        </div>

        {/* Aviso de desempate */}
        {discordancias.length > 0 && (
          <Card className="border-2 border-amber-400 bg-amber-50 mb-6">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-amber-800 mb-1">⚠️ Discordâncias detectadas — Aguardando decisão do Administrador</p>
                  <p className="text-sm text-amber-700 mb-2">Os avaliadores discordaram nos seguintes documentos:</p>
                  <ul className="text-sm text-amber-800 list-disc list-inside">
                    {discordancias.map((d: any, i: number) => (
                      <li key={i}>{typeof d === "string" ? d : d.documento_nome}</li>
                    ))}
                  </ul>
                  {isAdmin && (
                    <p className="text-sm font-semibold text-amber-800 mt-2">
                      Como administrador, você pode revisar e tomar a decisão final abaixo.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aviso avaliador 1 aguardando */}
        {meuNumero === 1 && !modoDesempate && (
          <Card className="border-blue-200 bg-blue-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-700">
                  Você é o <strong>Avaliador 1</strong>. Após concluir, o Avaliador 2 fará sua avaliação independente e fechará o processo.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid de documentos */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {avaliacoes.map((av, idx) => {
            const jaAvaliou = av.aprovado !== null && meuNumero !== null;
            return (
              <Card key={idx} className={cn("border-2 transition-all",
                av.aprovado === true ? "border-green-300 bg-green-50" :
                av.aprovado === false ? "border-red-300 bg-red-50" : "border-gray-200 hover:shadow-md cursor-pointer")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {av.aprovado === true ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0" /> :
                     av.aprovado === false ? <XCircle className="w-4 h-4 text-red-600 shrink-0" /> :
                     <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />}
                    <span className="text-xs font-medium text-foreground">{av.documento_nome}</span>
                  </div>

                  {jaAvaliou ? (
                    // Já avaliou — mostra resultado sem botão de editar
                    <div className={cn("rounded-lg p-2.5 mt-2 text-center",
                      av.aprovado === true ? "bg-green-100" : "bg-red-100")}>
                      <p className={cn("text-xs font-bold",
                        av.aprovado === true ? "text-green-700" : "text-red-700")}>
                        {av.aprovado === true ? "✓ Aprovado" : "✗ Reprovado"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Validado por <strong>Avaliador {meuNumero}</strong>
                      </p>
                    </div>
                  ) : (
                    // Ainda não avaliou — mostra botão
                    <Button size="sm" variant="outline" className="w-full text-xs mt-2"
                      onClick={() => setDocAberto(idx)}>
                      <Eye className="w-3.5 h-3.5 mr-1.5" /> Analisar documento
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Avaliador 2: resultado da comparação */}
        {meuNumero === 2 && todosAvaliados && discordancias.length === 0 && !mostrarEncaminhamento && (
          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <p className="font-bold text-green-800 text-lg mb-2">✅ As avaliações coincidem!</p>
              <p className="text-sm text-green-700 mb-4">
                Os dois avaliadores chegaram à mesma conclusão em todos os documentos.
                Agora você pode definir o próximo passo do candidato.
              </p>
              <Button className="w-full bg-green-700 hover:bg-green-800" size="lg"
                onClick={() => setMostrarEncaminhamento(true)}>
                Definir próximo passo do candidato →
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Fechar avaliação — só Avaliador 2 ou Admin */}
        {(podeFechar) && todosAvaliados && discordancias.length === 0 && mostrarEncaminhamento && (
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">
                  {modoDesempate ? "Decisão do Administrador — Desempate" : "Qual é o próximo passo do candidato?"}
                </h3>
              </div>
              <div className="space-y-3 mb-5">
                {(["A", "B"] as const).map(op => (
                  <button key={op} onClick={() => setCaminho(op)}
                    className={cn("w-full text-left p-4 rounded-xl border-2 transition-all",
                      caminho === op
                        ? op === "A" ? "border-green-500 bg-green-50" : "border-blue-500 bg-blue-50"
                        : "border-border hover:border-gray-400")}>
                    <div className="flex items-start gap-3">
                      <div className={cn("w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center",
                        caminho === op ? (op === "A" ? "border-green-500 bg-green-500" : "border-blue-500 bg-blue-500") : "border-gray-300")}>
                        {caminho === op && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {op === "A" ? "Caminho A — Habilitado para Entrevista" : "Caminho B — Habilitado para Avaliação Teórica"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {op === "A" ? "Candidato aprovado — será convidado para entrevista com o Comitê ANEFAC." : "Candidato realizará exame de proficiência antes da entrevista."}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg"
                onClick={fecharAvaliacao} disabled={!caminho || enviando}>
                {enviando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {modoDesempate ? "Confirmar decisão do administrador" : "Confirmar e notificar candidato"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Avaliador 2: discordância detectada */}
        {meuNumero === 2 && todosAvaliados && discordancias.length > 0 && (
          <Card className="border-2 border-amber-400 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-amber-800 text-lg mb-1">⚠️ As avaliações não coincidem</p>
                  <p className="text-sm text-amber-700">
                    Os avaliadores discordaram nos seguintes documentos:
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-amber-200 p-4 mb-4 space-y-2">
                {discordancias.map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-amber-800">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    {typeof d === "string" ? d : d.documento_nome}
                  </div>
                ))}
              </div>
              <div className="bg-amber-100 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  🔒 A solicitação de validação será enviada ao Administrador
                </p>
                <p className="text-xs text-amber-700">
                  Somente o administrador poderá revisar as avaliações e tomar a decisão final.
                </p>
              </div>
              <Button className="w-full bg-amber-600 hover:bg-amber-700 mt-4" size="lg"
                onClick={fecharAvaliacao} disabled={enviando}>
                {enviando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Enviar ao Administrador para decisão
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Aviso Avaliador 1 — não pode fechar */}
        {meuNumero === 1 && todosAvaliados && !modoDesempate && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7 text-blue-600" />
              </div>
              <p className="font-bold text-blue-900 mb-1">Sua avaliação foi registrada com sucesso!</p>
              <p className="text-sm text-blue-700 mb-3">
                Agora o <strong>Avaliador 2</strong> irá analisar os documentos de forma independente,
                sem acesso à sua avaliação. Quando ele concluir, o sistema comparará automaticamente
                as avaliações e encerrará o processo.
              </p>
              <div className="bg-white rounded-xl border border-blue-200 p-3 text-xs text-blue-600">
                ⏳ Aguardando Avaliador 2 concluir a análise...
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
