import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CERTIFICATIONS_DATA, Certification } from "@/contexts/CertificationContext";
import { Award, Edit, Eye, Plus, CheckCircle, Clock, XCircle, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  ativa: { label: "Ativa", icon: CheckCircle, className: "bg-green-100 text-green-800" },
  em_breve: { label: "Em breve", icon: Clock, className: "bg-yellow-100 text-yellow-800" },
  inativa: { label: "Inativa", icon: XCircle, className: "bg-gray-100 text-gray-600" },
  encerrada: { label: "Encerrada", icon: XCircle, className: "bg-red-100 text-red-800" },
};

export function AdminCertificacoes() {
  const [, navigate] = useLocation();
  const [certs] = useState<Certification[]>(CERTIFICATIONS_DATA);

  return (
    <div className="min-h-screen bg-gray-50">
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
          <Button variant="ghost" size="sm" className="text-white hover:text-blue-200 text-xs" onClick={() => navigate("/novo-fluxo/admin")}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar ao dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Gerenciar Certificações</h1>
            <p className="text-muted-foreground text-sm">Configure as certificações disponíveis no sistema</p>
          </div>
          <Button className="bg-blue-900 hover:bg-blue-800">
            <Plus className="w-4 h-4 mr-2" />
            Nova certificação
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Object.entries(STATUS_CONFIG).map(([key, { label, icon: Icon, className }]) => (
            <Card key={key}>
              <CardContent className="p-4">
                <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mb-2", className)}>
                  <Icon className="w-3 h-3" />
                  {label}
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {certs.filter((c) => c.status === key).length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certifications Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Certificação</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Nível</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Taxa Análise</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Taxa Emissão</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Prova</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map((cert) => {
                    const statusCfg = STATUS_CONFIG[cert.status];
                    const StatusIcon = statusCfg.icon;
                    return (
                      <tr key={cert.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{cert.icone}</span>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{cert.nome}</p>
                              <p className="text-xs text-muted-foreground">{cert.subtitulo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs text-muted-foreground">{cert.nivel}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", statusCfg.className)}>
                            <StatusIcon className="w-3 h-3" />
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-foreground">
                            R$ {cert.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-green-700">
                            R$ {cert.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", cert.exigeProva ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700")}>
                            {cert.exigeProva ? "Sim" : "Não"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
