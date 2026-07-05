import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useCourses } from "@/contexts/CourseContext";
import { cursosApi } from "@/lib/api";
import { CreditCard, QrCode, FileText, Lock, CheckCircle, ArrowLeft } from "lucide-react";

type MetodoPagamento = "cartao" | "pix" | "boleto";

// Checkout interno para cursos/pacotes marcados como "interno" no admin.
// Simulado por enquanto (mesmo padrão do pagamento da taxa de análise) —
// mas já registra a compra no relatório de cliques ao concluir.
export function ComprarCurso() {
  const [, params] = useRoute("/cursos/comprar/:id");
  const [, navigate] = useLocation();
  const { cursos, pacotes } = useCourses();

  const search = new URLSearchParams(window.location.search);
  const cliqueId = search.get("clique");
  const ehPacote = search.get("pacote") === "1";

  const item = ehPacote
    ? pacotes.find((p) => String(p.id) === params?.id)
    : cursos.find((c) => String(c.id) === params?.id);

  const [metodo, setMetodo] = useState<MetodoPagamento>("cartao");
  const [processando, setProcessando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [form, setForm] = useState({ numeroCartao: "", nomeCartao: "", validade: "", cvv: "" });

  useEffect(() => {
    // Se o item não existir (link direto/id errado), volta para a listagem
    if (cursos.length + pacotes.length > 0 && !item) {
      navigate("/cursos");
    }
  }, [item, cursos.length, pacotes.length]);

  if (!item) return null;

  const titulo = ehPacote ? (item as any).nome : (item as any).titulo;
  const preco = item.preco;

  const formatCartao = (v: string) => v.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").slice(0, 19);
  const formatValidade = (v: string) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);

  const handlePagar = async () => {
    if (metodo === "cartao" && (!form.numeroCartao || !form.nomeCartao || !form.validade || !form.cvv)) {
      return;
    }
    setProcessando(true);
    await new Promise((r) => setTimeout(r, 2000));
    setProcessando(false);
    setConcluido(true);

    if (cliqueId) {
      try { await cursosApi.confirmarCompra(Number(cliqueId)); } catch { /* não bloqueia a UX */ }
    }
  };

  if (concluido) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 pt-32 pb-16 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Compra confirmada!</h1>
          <p className="text-gray-500 mb-8">Você já pode acessar "{titulo}". Enviamos os detalhes de acesso para o seu e-mail.</p>
          <Link href="/cursos">
            <a className="inline-flex items-center gap-2 bg-[#1e3a6e] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#162d55] transition-colors">
              Voltar para Cursos
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <Link href="/cursos">
          <a className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-6 w-fit">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </a>
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h1 className="text-lg font-bold text-gray-900 mb-1">Pagamento — {titulo}</h1>
            <p className="text-sm text-gray-500 mb-6">Preencha os dados para concluir sua compra.</p>

            <label className="block text-xs font-semibold text-gray-600 mb-2">Forma de pagamento</label>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {([
                { id: "cartao" as const, label: "Cartão de Crédito", icon: CreditCard },
                { id: "pix" as const, label: "PIX", icon: QrCode },
                { id: "boleto" as const, label: "Boleto", icon: FileText },
              ]).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMetodo(id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                    metodo === id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5 text-gray-700" />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </button>
              ))}
            </div>

            {metodo === "cartao" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Número do cartão</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.numeroCartao}
                    onChange={(e) => setForm((p) => ({ ...p, numeroCartao: formatCartao(e.target.value) }))}
                    placeholder="0000 0000 0000 0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nome no cartão</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.nomeCartao}
                    onChange={(e) => setForm((p) => ({ ...p, nomeCartao: e.target.value.toUpperCase() }))}
                    placeholder="NOME COMO NO CARTÃO"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Validade</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.validade}
                      onChange={(e) => setForm((p) => ({ ...p, validade: formatValidade(e.target.value) }))}
                      placeholder="MM/AA"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">CVV</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.cvv}
                      onChange={(e) => setForm((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                      placeholder="000"
                    />
                  </div>
                </div>
              </div>
            )}
            {metodo === "pix" && (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">O QR Code do PIX será exibido após confirmar — pagamento simulado nesta versão.</p>
            )}
            {metodo === "boleto" && (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">O boleto será gerado após confirmar — pagamento simulado nesta versão.</p>
            )}

            <button
              onClick={handlePagar}
              disabled={processando}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-[#1e3a6e] text-white font-semibold py-3.5 rounded-xl hover:bg-[#162d55] transition-colors disabled:opacity-60"
            >
              {processando ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pagar R$ {preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-fit">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Resumo</h2>
            <p className="text-sm text-gray-700 font-medium mb-1">{titulo}</p>
            <p className="text-xs text-gray-400 mb-4">{ehPacote ? "Pacote de cursos" : "Curso individual"}</p>
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-lg font-bold text-gray-900">R$ {preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
