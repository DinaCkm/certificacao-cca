import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCertification, Certification } from "@/contexts/CertificationContext";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  FileText,
  BookOpen,
  ChevronRight,
  Info,
  AlertCircle,
  Star,
  Users,
  Award,
} from "lucide-react";

const STATUS_CONFIG = {
  ativa: { label: "Disponível", variant: "default" as const, className: "bg-green-100 text-green-800 border-green-200" },
  em_breve: { label: "Em breve", variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  inativa: { label: "Inativa", variant: "outline" as const, className: "bg-gray-100 text-gray-600 border-gray-200" },
  encerrada: { label: "Encerrada", variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-200" },
};

const COR_CONFIG: Record<string, { border: string; bg: string; icon: string; accent: string }> = {
  blue: {
    border: "border-blue-200 hover:border-blue-500",
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-700",
    accent: "text-blue-900",
  },
  gold: {
    border: "border-yellow-200 hover:border-yellow-500",
    bg: "bg-yellow-50",
    icon: "bg-yellow-100 text-yellow-700",
    accent: "text-yellow-900",
  },
  green: {
    border: "border-green-200 hover:border-green-500",
    bg: "bg-green-50",
    icon: "bg-green-100 text-green-700",
    accent: "text-green-900",
  },
  purple: {
    border: "border-purple-200 hover:border-purple-500",
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-700",
    accent: "text-purple-900",
  },
  orange: {
    border: "border-orange-200 hover:border-orange-500",
    bg: "bg-orange-50",
    icon: "bg-orange-100 text-orange-700",
    accent: "text-orange-900",
  },
};

function CertificationDetailModal({
  cert,
  open,
  onClose,
  onSelect,
}: {
  cert: Certification | null;
  open: boolean;
  onClose: () => void;
  onSelect: (cert: Certification) => void;
}) {
  if (!cert) return null;
  const cor = COR_CONFIG[cert.cor] || COR_CONFIG.blue;
  const statusCfg = STATUS_CONFIG[cert.status];
  const isSelectable = cert.status === "ativa";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0", cor.icon)}>
              {cert.numero}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-blue-900">{cert.nome}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{cert.subtitulo}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", statusCfg.className)}>
                  {statusCfg.label}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {cert.nivel}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <p className="text-sm text-foreground leading-relaxed">{cert.descricao}</p>

          <div className={cn("rounded-lg p-4", cor.bg)}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Público-alvo</span>
            </div>
            <p className="text-sm text-muted-foreground">{cert.publicoAlvo}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Competências avaliadas</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cert.competencias.map((c) => (
                <div key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  {c}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Pré-requisitos</span>
            </div>
            <ul className="space-y-1.5">
              {cert.preRequisitos.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Documentos exigidos</span>
            </div>
            <ul className="space-y-1.5">
              {cert.documentosExigidos.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="border rounded-lg p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Taxa de Análise Documental</p>
              <p className="text-xl font-bold text-foreground">
                R$ {cert.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Pago no início do processo</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Taxa de Emissão do Certificado</p>
              <p className="text-xl font-bold text-green-700">
                R$ {cert.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Pago somente após aprovação</p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-800">
              <strong>Processo de avaliação: </strong>
              {cert.exigeProva
                ? "Análise documental → Prova de competência → Entrevista técnica"
                : "Análise documental → Entrevista técnica (direto, sem prova)"}
            </div>
          </div>

          {cert.cursos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Cursos preparatórios disponíveis</span>
              </div>
              <div className="space-y-2">
                {cert.cursos.map((curso) => (
                  <div key={curso} className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 rounded-lg px-3 py-2">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    {curso}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Os cursos de atualização têm finalidade preparatória e de desenvolvimento. A compra ou conclusão de cursos não garante aprovação, habilitação ou emissão da certificação.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Fechar
            </Button>
            {isSelectable && (
              <Button
                className="flex-1 bg-blue-900 hover:bg-blue-800"
                onClick={() => {
                  onSelect(cert);
                  onClose();
                }}
              >
                Selecionar esta certificação →
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CertificationCard({
  cert,
  selected,
  onSelect,
  onDetails,
}: {
  cert: Certification;
  selected: boolean;
  onSelect: () => void;
  onDetails: () => void;
}) {
  const cor = COR_CONFIG[cert.cor] || COR_CONFIG.blue;
  const statusCfg = STATUS_CONFIG[cert.status];
  const isSelectable = cert.status === "ativa";

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 bg-white transition-all duration-200 flex flex-col overflow-hidden",
        isSelectable ? cn(cor.border, "cursor-pointer") : "border-gray-200 cursor-default opacity-75",
        selected && isSelectable && "ring-2 ring-blue-900 ring-offset-2 border-blue-900 shadow-lg"
      )}
      onClick={() => isSelectable && onSelect()}
    >
      {/* Selected indicator */}
      {selected && isSelectable && (
        <div className="absolute top-3 left-3 z-10">
          <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center shadow-sm">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Status badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", statusCfg.className)}>
          {statusCfg.label}
        </span>
      </div>

      {/* Card Header */}
      <div className={cn("p-5 pb-4", cor.bg)}>
        <div className="flex items-start gap-3 mt-1">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0", cor.icon)}>
            {cert.numero}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base leading-tight">{cert.nome}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{cert.subtitulo}</p>
            <p className="text-xs font-medium text-blue-700 mt-1">{cert.nivel}</p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{cert.descricao}</p>

        {/* Public */}
        <div className="text-xs bg-gray-50 rounded-lg px-3 py-2">
          <span className="font-semibold text-foreground">Público: </span>
          <span className="text-muted-foreground">{cert.publicoAlvo}</span>
        </div>

        {/* Competencies preview */}
        <div>
          <p className="text-xs font-semibold text-foreground mb-2">Competências:</p>
          <div className="flex flex-wrap gap-1.5">
            {cert.competencias.slice(0, 3).map((c) => (
              <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {c}
              </span>
            ))}
            {cert.competencias.length > 3 && (
              <span className="text-xs bg-gray-100 text-muted-foreground px-2 py-0.5 rounded-full">
                +{cert.competencias.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Process type */}
        <div className="flex gap-2 flex-wrap">
          {cert.exigeProva ? (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg">
              <FileText className="w-3 h-3" /> Inclui prova
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-lg">
              <CheckCircle className="w-3 h-3" /> Direto para entrevista
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1 rounded-lg">
            <Award className="w-3 h-3" /> Entrevista técnica
          </span>
        </div>

        {/* Pricing */}
        <div className="border-t pt-4 grid grid-cols-2 gap-3 mt-auto">
          <div>
            <p className="text-xs text-muted-foreground">Taxa de Análise</p>
            <p className="text-sm font-bold text-foreground">
              R$ {cert.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Taxa de Emissão</p>
            <p className="text-sm font-bold text-green-700">
              R$ {cert.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onDetails();
            }}
          >
            <Info className="w-3.5 h-3.5 mr-1" />
            Ver detalhes
          </Button>
          {isSelectable && (
            <Button
              size="sm"
              className="flex-1 text-xs bg-blue-900 hover:bg-blue-800"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              Selecionar
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
          {cert.status === "em_breve" && (
            <Button size="sm" variant="outline" className="flex-1 text-xs" disabled>
              <Clock className="w-3.5 h-3.5 mr-1" />
              Em breve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SelecionarCertificacao() {
  const { certifications, selecionarCertificacao } = useCertification();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailCert, setDetailCert] = useState<Certification | null>(null);
  const [, navigate] = useLocation();

  const selectedCert = certifications.find((c) => c.id === selectedId);
  const visibleCerts = certifications.filter((c) => c.status !== "inativa" && c.status !== "encerrada");

  const handleSelect = (cert: Certification) => {
    if (cert.status !== "ativa") return;
    setSelectedId(cert.id);
  };

  const handleContinuar = () => {
    if (!selectedCert) return;
    selecionarCertificacao(selectedCert);
    navigate("/novo-fluxo/cadastro");
  };

  const handleSelectFromModal = (cert: Certification) => {
    setSelectedId(cert.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">A</span>
            </div>
            <div>
              <span className="font-bold text-blue-900 text-lg leading-none block">ANEFAC</span>
              <span className="text-xs text-muted-foreground leading-none">Certificação Profissional</span>
            </div>
          </div>
          <Link href="/novo-fluxo/admin">
            <a className="text-xs text-muted-foreground hover:text-blue-700 transition-colors">
              Área Administrativa
            </a>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Page Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">
            Escolha sua certificação
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Selecione abaixo a certificação que deseja iniciar. Cada certificação possui critérios próprios de análise, documentos necessários, etapas de avaliação e requisitos para habilitação.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-900 text-white rounded-xl p-5 mb-8 flex gap-4 items-start">
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-300" />
          <div>
            <p className="font-semibold text-sm mb-1">Como funciona o processo?</p>
            <p className="text-xs text-blue-200 leading-relaxed">
              Escolha a certificação → Cadastro → Upload de documentos → <strong className="text-white">Pagamento da Taxa de Análise</strong> → Validação documental → Prova e/ou Entrevista → <strong className="text-white">Pagamento da Taxa de Emissão</strong> → Recebimento do certificado.
            </p>
          </div>
        </div>

        {/* Certifications Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-5 mb-10">
          {visibleCerts.map((cert) => (
            <CertificationCard
              key={cert.id}
              cert={cert}
              selected={selectedId === cert.id}
              onSelect={() => handleSelect(cert)}
              onDetails={() => setDetailCert(cert)}
            />
          ))}
        </div>

        {/* Courses Banner */}
        <div className="bg-white border border-border rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-purple-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">Cursos de atualização disponíveis</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Antes de iniciar sua certificação, você pode acessar cursos preparatórios para se preparar melhor.
              </p>
              <p className="text-xs text-muted-foreground italic mb-3">
                Os cursos de atualização têm finalidade preparatória e de desenvolvimento. A compra ou conclusão de cursos não garante aprovação, habilitação ou emissão da certificação.
              </p>
              <Button variant="outline" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Conhecer cursos de atualização
              </Button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Atenção:</strong> Não é possível iniciar o processo de cadastro sem antes selecionar uma certificação. A certificação escolhida definirá os documentos exigidos, as etapas de avaliação, os valores das taxas e os cursos recomendados para toda a jornada.
          </p>
        </div>
      </main>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-border shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {selectedCert ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedCert.numero}</span>
              <div>
                <p className="font-bold text-foreground text-sm">{selectedCert.nome}</p>
                <p className="text-xs text-muted-foreground">
                  Taxa de Análise:{" "}
                  <strong>R$ {selectedCert.taxaAnalise.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  {" · "}
                  Taxa de Emissão:{" "}
                  <strong>R$ {selectedCert.taxaEmissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              ← Selecione uma certificação para continuar
            </p>
          )}

          <Button
            size="lg"
            className="bg-blue-900 hover:bg-blue-800 min-w-[220px]"
            onClick={handleContinuar}
            disabled={!selectedCert}
          >
            Continuar com o Cadastro
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      <CertificationDetailModal
        cert={detailCert}
        open={!!detailCert}
        onClose={() => setDetailCert(null)}
        onSelect={handleSelectFromModal}
      />
    </div>
  );
}
