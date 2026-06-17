import React from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import {
  Users, FileText, Award, DollarSign, CheckCircle, Clock,
  XCircle, BarChart3, Settings, ChevronRight, AlertCircle, Globe
} from "lucide-react";

const MOCK_CANDIDATOS = [
  { nome: "Ana Paula Ferreira", cert: "Certificação Controller", status: "Aguardando validação", data: "12/06/2026" },
  { nome: "Roberto Mendes", cert: "Certificação Controller Plus", status: "Em entrevista", data: "11/06/2026" },
  { nome: "Carla Souza", cert: "Certificação CCA", status: "Prova agendada", data: "10/06/2026" },
  { nome: "Marcos Lima", cert: "Certificação Controller", status: "Certificado emitido", data: "09/06/2026" },
  { nome: "Fernanda Costa", cert: "Certificação Controller Plus", status: "Documentos enviados", data: "08/06/2026" },
];

const STATUS_COLORS: Record<string, string> = {
  "Aguardando validação": "bg-yellow-100 text-yellow-800",
  "Em entrevista": "bg-blue-100 text-blue-800",
  "Prova agendada": "bg-purple-100 text-purple-800",
  "Certificado emitido": "bg-green-100 text-green-800",
  "Documentos enviados": "bg-gray-100 text-gray-700",
};

export function AdminDashboard() {
  const { processo, getCertificacaoAtual } = useCertification();
  const [, navigate] = useLocation();
  const certAtual = getCertificacaoAtual();

  const METRICAS = [
    { label: "Total de candidatos", value: "47", icon: Users, color: "bg-blue-100 text-blue-700", delta: "+5 esta semana" },
    { label: "Em análise documental", value: "12", icon: FileText, color: "bg-yellow-100 text-yellow-700", delta: "3 aguardando decisão" },
    { label: "Certificados emitidos", value: "23", icon: Award, color: "bg-green-100 text-green-700", delta: "+3 este mês" },
    { label: "Receita do mês", value: "R$ 48.500", icon: DollarSign, color: "bg-purple-100 text-purple-700", delta: "Taxa de análise + emissão" },
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
            <Button variant="ghost" size="sm" className="text-white hover:text-blue-200 text-xs" onClick={() => navigate("/novo-fluxo")}>
              Ver portal do candidato
            </Button>
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
                  {MOCK_CANDIDATOS.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-700 font-bold text-sm">{c.nome[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{c.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.cert}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-700"}`}>
                          {c.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.data}</p>
                      </div>
                    </div>
                  ))}
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
                    { label: "Validar documentos", href: "/novo-fluxo/admin/validacao", icon: FileText, color: "text-yellow-600" },
                    { label: "Certificações ativas", href: "/novo-fluxo/admin/certificacoes", icon: Award, color: "text-blue-600" },
                    { label: "Relatório financeiro", href: "#", icon: BarChart3, color: "text-green-600" },
                    { label: "Configurar site", href: "/novo-fluxo/admin/site", icon: Globe, color: "text-indigo-600" },
                    { label: "Configurações", href: "#", icon: Settings, color: "text-gray-600" },
                  ].map(({ label, href, icon: Icon, color }) => (
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
