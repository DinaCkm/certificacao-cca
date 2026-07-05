import { useState, useEffect } from "react";
import { Link } from "wouter";
import { adminApi } from "@/lib/api";
import {
  ArrowLeft, ExternalLink, CheckCircle2, XCircle, HelpCircle,
  Filter, Users, MousePointerClick, ShoppingCart,
} from "lucide-react";

interface Clique {
  id: number;
  curso_id: number | null;
  curso_titulo: string;
  tipo_destino: "interno" | "externo";
  link_destino: string | null;
  comprou: number | null;
  data_compra: string | null;
  criado_em: string;
  sessao_id: string | null;
  candidato_id: number | null;
  candidato_nome: string | null;
  candidato_email: string | null;
}

interface Resumo {
  total_acessos: number;
  total_externo: number;
  total_interno: number;
  total_comprou: number;
  total_nao_comprou: number;
}

function StatusCompra({ clique }: { clique: Clique }) {
  if (clique.tipo_destino === "externo") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full w-fit">
        <ExternalLink className="w-3.5 h-3.5" /> Redirecionado (externo)
      </span>
    );
  }
  if (clique.comprou === 1) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-fit">
        <CheckCircle2 className="w-3.5 h-3.5" /> Comprou
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full w-fit">
      <XCircle className="w-3.5 h-3.5" /> Não comprou
    </span>
  );
}

export function AdminRelatorioCursos() {
  const [cliques, setCliques] = useState<Clique[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "interno" | "externo">("todos");
  const [filtroCompra, setFiltroCompra] = useState<"todos" | "sim" | "nao">("todos");

  async function carregar() {
    setCarregando(true);
    try {
      const data = await (adminApi as any).relatorioCursosCliques({
        tipo_destino: filtroTipo === "todos" ? undefined : filtroTipo,
        comprou: filtroCompra === "todos" ? undefined : filtroCompra,
      });
      setCliques(data.cliques || []);
      setResumo(data.resumo || null);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, [filtroTipo, filtroCompra]);

  const formatarData = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/novo-fluxo/admin">
          <a className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Painel Admin
          </a>
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="font-bold text-gray-900 text-lg">Relatório de Cursos — Acessos e Compras</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Cards de resumo */}
        {resumo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase mb-2">
                <MousePointerClick className="w-4 h-4" /> Total de acessos
              </div>
              <p className="text-2xl font-bold text-gray-900">{resumo.total_acessos}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 text-purple-500 text-xs font-semibold uppercase mb-2">
                <ExternalLink className="w-4 h-4" /> Redirecionados (externo)
              </div>
              <p className="text-2xl font-bold text-gray-900">{resumo.total_externo}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 text-green-600 text-xs font-semibold uppercase mb-2">
                <ShoppingCart className="w-4 h-4" /> Compraram (interno)
              </div>
              <p className="text-2xl font-bold text-gray-900">{resumo.total_comprou}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase mb-2">
                <XCircle className="w-4 h-4" /> Não compraram (interno)
              </div>
              <p className="text-2xl font-bold text-gray-900">{resumo.total_nao_comprou}</p>
            </div>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Para cursos em <strong>plataforma externa</strong> (Hotmart, Kiwify etc.) só é possível confirmar que o aluno foi redirecionado — não temos como saber se a compra de fato aconteceu lá. Para cursos <strong>internos</strong>, o status "comprou" reflete o pagamento concluído no nosso próprio checkout.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as any)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700"
          >
            <option value="todos">Todos os destinos</option>
            <option value="interno">Curso interno</option>
            <option value="externo">Plataforma externa</option>
          </select>
          <select
            value={filtroCompra}
            onChange={(e) => setFiltroCompra(e.target.value as any)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700"
          >
            <option value="todos">Comprou ou não (todos)</option>
            <option value="sim">Comprou</option>
            <option value="nao">Não comprou</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Quem acessou</th>
                <th className="text-left px-4 py-3 font-semibold">Curso clicado</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {carregando && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">Carregando...</td></tr>
              )}
              {!carregando && cliques.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">Nenhum acesso registrado ainda.</td></tr>
              )}
              {cliques.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {c.candidato_id ? (
                      <div>
                        <p className="font-medium text-gray-900">{c.candidato_nome}</p>
                        <p className="text-xs text-gray-400">{c.candidato_email}</p>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Users className="w-3.5 h-3.5" /> Visitante anônimo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.curso_titulo}</td>
                  <td className="px-4 py-3"><StatusCompra clique={c} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatarData(c.criado_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
