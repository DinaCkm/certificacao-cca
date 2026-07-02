import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { MENU_ITEMS } from "@/lib/menuItems";
import {
  Users, FileText, Award, DollarSign, CheckCircle, Clock,
  XCircle, BarChart3, Settings, ChevronRight, AlertCircle, Globe, BookOpen
} from "lucide-react";

const STATUS_LABEL_DASH: Record<string, { label: string; cor: string }> = {
  cadastro:         { label: "Cadastro",              cor: "bg-blue-100 text-blue-800" },
  pagamento1:       { label: "Pagou taxa análise",    cor: "bg-orange-100 text-orange-800" },
  upload:           { label: "Documentos enviados",   cor: "bg-gray-100 text-gray-700" },
  validacao:        { label: "Aguardando validação",  cor: "bg-yellow-100 text-yellow-800" },
  aguardando_prova: { label: "Aguard. prova",         cor: "bg-indigo-100 text-indigo-800" },
  prova1_andamento: { label: "Fazendo prova",         cor: "bg-blue-100 text-blue-800" },
  prova1_aprovada:  { label: "Prova aprovada",        cor: "bg-green-100 text-green-800" },
  prova1_reprovada: { label: "2ª tentativa",          cor: "bg-amber-100 text-amber-800" },
  prova2_aprovada:  { label: "Prova aprovada",        cor: "bg-green-100 text-green-800" },
  prova2_reprovada: { label: "Encerrado",             cor: "bg-red-100 text-red-800" },
  agendamento:      { label: "Agend. entrevista",     cor: "bg-teal-100 text-teal-800" },
  entrevista:       { label: "Em entrevista",         cor: "bg-blue-100 text-blue-800" },
  pagamento2:       { label: "Pagou taxa emissão",    cor: "bg-orange-100 text-orange-800" },
  emissao:          { label: "Emitindo cert.",        cor: "bg-green-100 text-green-800" },
  concluido:        { label: "Certificado emitido",   cor: "bg-green-200 text-green-900" },
  encerrado:        { label: "Processo encerrado",    cor: "bg-red-100 text-red-800" },
};

export function AdminDashboard() {
  const { processo, getCertificacaoAtual } = useCertification();
  const { podeVerMenuItem } = useAuth();
  const [, navigate] = useLocation();
  const certAtual = getCertificacaoAtual();
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [metricas, setMetricas] = useState({ total: 0, validacao: 0, concluidos: 0 });

  useEffect(() => {
    const token = localStorage.getItem("anefac_token");
    fetch("/api/admin/candidatos?", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      const lista = data.candidatos || [];
      setCandidatos(lista.slice(0, 5));
      setMetricas({
        total: lista.length,
        validacao: lista.filter((c: any) => c.status_geral === "validacao").length,
        concluidos: lista.filter((c: any) => c.status_geral === "concluido").length,
      });
    }).catch(() => {});
  }, []);

  const METRICAS = [
    { label: "Total de candidatos", value: String(metricas.total), icon: Users, color: "bg-blue-100 text-blue-700", delta: "cadastrados na plataforma" },
    { label: "Em validação documental", value: String(metricas.validacao), icon: FileText, color: "bg-yellow-100 text-yellow-700", delta: "aguardando decisão" },
    { label: "Certificados emitidos", value: String(metricas.concluidos), icon: Award, color: "bg-green-100 text-green-700", delta: "processo concluído" },
    { label: "Fale Conosco", value: "—", icon: DollarSign, color: "bg-purple-100 text-purple-700", delta: "ver mensagens recebidas" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-blue-900 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-900 font-bold">A</span>
            </div>
            <div>
              <span className="font-bold text-lg">ANEFAC</span>
              <span className="text-blue-300 text-xs ml-2">Painel Administrativo</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/novo-fluxo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200 text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
              title="Abre em nova aba sem usar sua sessão de administrador"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver portal do candidato
            </a>
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
              AD
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Visão geral do sistema de certificações ANEFAC</p>
        </div>

        {/* Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {METRICAS.map(({ label, value, icon: Icon, color, delta }) => (
            <Card key={label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
                <p className="text-xs text-muted-foreground mt-1 opacity-70">{delta}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Candidates */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-foreground">Candidatos recentes</h3>
                  <Button variant="ghost" size="sm" className="text-xs text-blue-700">
                    Ver todos <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {candidatos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum candidato ainda</p>
                  ) : candidatos.map((c) => {
                    const si = STATUS_LABEL_DASH[c.status_geral] || { label: "Sem processo", cor: "bg-gray-100 text-gray-700" };
                    return (
                      <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-blue-700 font-bold text-sm">{c.full_name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{c.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.certificacao_nome || "Sem certificação"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${si.cor}`}>
                            {si.label}
                          </span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(c.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Active Process Alert */}
            {processo.certificacaoId && processo.statusGeral === "validacao" && (
              <Card className="mt-4 border-yellow-300 bg-yellow-50">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-800 text-sm mb-1">
                        Processo aguardando validação documental
                      </p>
                      <p className="text-xs text-yellow-700 mb-3">
                        Candidato: <strong>{processo.candidatoNome || "Demo"}</strong> — {certAtual?.nome}
                      </p>
                      <Link href="/novo-fluxo/admin/validacao">
                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-xs">
                          <FileText className="w-3.5 h-3.5 mr-1.5" />
                          Ir para validação documental
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-4 text-sm">Ações rápidas</h3>
                <div className="space-y-2">
                  {[
                    { key: "validacao", label: "Validar documentos", href: "/novo-fluxo/admin/validacao", icon: FileText, color: "text-yellow-600" },
                    { key: "resultado_entrevista", label: "Resultado de Entrevistas", href: "/novo-fluxo/admin/resultado-entrevista", icon: Award, color: "text-green-600" },
                    { key: "fale_conosco", label: "Fale Conosco", href: "/novo-fluxo/admin/fale-conosco", icon: FileText, color: "text-green-600" },
                    { key: "candidatos", label: "Todos os Candidatos", href: "/novo-fluxo/admin/candidatos", icon: FileText, color: "text-cyan-600" },
                    { key: "perfis", label: "Perfis e Permissões", href: "/novo-fluxo/admin/perfis", icon: Settings, color: "text-violet-600" },
                    { key: "prova", label: "Parametrizar Prova", href: "/novo-fluxo/admin/prova-config", icon: FileText, color: "text-purple-600" },
                    { key: "usuarios", label: "Gestão de Usuários", href: "/novo-fluxo/admin/usuarios", icon: Settings, color: "text-blue-600" },
                    { key: "carrossel", label: "Carrossel de Imagens", href: "/novo-fluxo/admin/carrossel", icon: Globe, color: "text-pink-600" },
                    { key: "certificacoes", label: "Certificações ativas", href: "/novo-fluxo/admin/certificacoes", icon: Award, color: "text-blue-600" },
                    { key: "site", label: "Configurar site", href: "/novo-fluxo/admin/site", icon: Globe, color: "text-indigo-600" },
                    { key: "institucional", label: "Documentos & Comitê", href: "/novo-fluxo/admin/institucional", icon: BookOpen, color: "text-teal-600" },
                    { key: "cursos", label: "Cursos e Pacotes", href: "/novo-fluxo/admin/cursos", icon: BookOpen, color: "text-amber-600" },
                  ].filter(item => podeVerMenuItem(item.key)).map(({ label, href, icon: Icon, color }) => (
                    <Link key={label} href={href}>
                      <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                        <Icon className={`w-4 h-4 ${color} shrink-0`} />
                        <span className="text-sm text-foreground group-hover:text-blue-700 transition-colors">{label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                      </a>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-4 text-sm">Funil de certificações</h3>
                <div className="space-y-3">
                  {[
                    { label: "Cadastro", value: 47, color: "bg-blue-500" },
                    { label: "Documentos enviados", value: 38, color: "bg-blue-400" },
                    { label: "Em validação", value: 12, color: "bg-yellow-500" },
                    { label: "Em prova/entrevista", value: 8, color: "bg-purple-500" },
                    { label: "Certificados emitidos", value: 23, color: "bg-green-500" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{label}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${(value / 47) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
