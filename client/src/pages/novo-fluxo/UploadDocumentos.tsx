import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { useInstitucional } from "@/contexts/InstitucionalContext";
import { Upload, CheckCircle, X, FileText, AlertCircle, Info, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DocumentoUpload {
  id: string;
  nome: string;
  descricao: string;
  obrigatorio: boolean;
  arquivo: File | null;
  status: "pendente" | "enviado" | "erro";
}

export function UploadDocumentos() {
  const { processo, atualizarStatus, getCertificacaoAtual } = useCertification();
  const { institucional } = useInstitucional();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const certAtual = getCertificacaoAtual();

  const [documentos, setDocumentos] = useState<DocumentoUpload[]>([]);

  useEffect(() => {
    if (!processo.certificacaoId) {
      navigate("/novo-fluxo");
      return;
    }
    if (!certAtual) return;

    // Inicializa lista com status pendente
    const listaBase = certAtual.documentosExigidos.map((doc, idx) => ({
      id: `doc-${idx}`,
      nome: doc,
      descricao: "Envie o arquivo em formato PDF, JPG ou PNG (máx. 10MB)",
      obrigatorio: true,
      arquivo: null,
      status: "pendente" as const,
    }));
    setDocumentos(listaBase);

    // Busca uploads já enviados no servidor
    const token = localStorage.getItem("anefac_token");
    const processoId = localStorage.getItem("anefac_processo_id");
    if (!token) return;

    fetch(`/api/upload/documentos${processoId ? `?processo_id=${processoId}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.documentos?.length) return;
        // Para cada tipo de documento já enviado, marca como "enviado"
        // e guarda o id do upload
        const idsMap: Record<string, number> = {};
        const enviados: Record<string, string> = {}; // docId -> nome_arquivo

        data.documentos.forEach((up: any) => {
          // tipo_documento é o id do doc (ex: "doc-0")
          idsMap[up.tipo_documento] = up.id;
          enviados[up.tipo_documento] = up.nome_arquivo;
        });

        setUploadIds(idsMap);
        setDocumentos((prev) =>
          prev.map((d) =>
            enviados[d.id]
              ? { ...d, status: "enviado" as const }
              : d
          )
        );
      })
      .catch(() => {/* silently ignore */});
  }, [certAtual, processo.certificacaoId, navigate]);

  const handleFileChange = async (docId: string, file: File | null) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "O arquivo deve ter no máximo 10MB.", variant: "destructive" });
      return;
    }

    // Atualiza UI imediatamente
    setDocumentos((prev) =>
      prev.map((d) => d.id === docId ? { ...d, arquivo: file, status: "enviado" } : d)
    );

    // Envia para o servidor
    setEnviando(docId);
    try {
      const formData = new FormData();
      formData.append("arquivo", file);
      formData.append("tipo_documento", docId);
      const processoId = localStorage.getItem("anefac_processo_id"); if (processoId) formData.append("processo_id", processoId);

      const token = localStorage.getItem("anefac_token");
      const res = await fetch("/api/upload/documento", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUploadIds(prev => ({ ...prev, [docId]: data.id }));
      toast({ title: `✅ ${file.name} enviado com sucesso` });
    } catch (err: any) {
      toast({ title: "Erro ao enviar arquivo", description: err.message, variant: "destructive" });
      // Reverte status
      setDocumentos((prev) =>
        prev.map((d) => d.id === docId ? { ...d, arquivo: null, status: "pendente" } : d)
      );
    } finally {
      setEnviando(null);
    }
  };

  const handleRemove = (docId: string) => {
    setDocumentos((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, arquivo: null, status: "pendente" } : d
      )
    );
  };

  const [uploadIds, setUploadIds] = useState<Record<string, number>>({});
  const [enviando, setEnviando] = useState<string | null>(null);
  const obrigatoriosPendentes = documentos.filter((d) => d.obrigatorio && d.status === "pendente");
  const totalEnviados = documentos.filter((d) => d.status === "enviado").length;
  const progresso = documentos.length > 0 ? Math.round((totalEnviados / documentos.length) * 100) : 0;

  const handleContinuar = () => {
    if (obrigatoriosPendentes.length > 0) {
      toast({
        title: "Documentos obrigatórios pendentes",
        description: `Envie todos os ${obrigatoriosPendentes.length} documento(s) obrigatório(s) para continuar.`,
        variant: "destructive",
      });
      return;
    }
    atualizarStatus("validacao");
    navigate("/novo-fluxo/aguardando-validacao");
  };

  if (!certAtual) return null;

  return (
    <FluxoLayout
      currentStep={3}
      title="Upload de Documentos"
      subtitle={`Envie os documentos exigidos para a ${certAtual.nome}. Todos os arquivos obrigatórios devem ser enviados antes de prosseguir.`}
      backHref="/novo-fluxo/pagamento-analise"
      backLabel="← Voltar para pagamento"
    >
      {/* Progress */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-blue-900">Progresso do envio</span>
            <span className="text-sm font-bold text-blue-900">{totalEnviados}/{documentos.length} documentos</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div
              className="bg-blue-700 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <p className="text-xs text-blue-700 mt-2">
            {obrigatoriosPendentes.length === 0
              ? "✓ Todos os documentos obrigatórios foram enviados!"
              : `${obrigatoriosPendentes.length} documento(s) obrigatório(s) pendente(s)`}
          </p>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-800 space-y-1">
          <p><strong>Formatos aceitos:</strong> PDF, JPG, PNG, JPEG</p>
          <p><strong>Tamanho máximo:</strong> 10MB por arquivo</p>
          <p><strong>Qualidade:</strong> Os documentos devem estar legíveis e sem cortes</p>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4 mb-8">
        {documentos.map((doc) => (
          <Card
            key={doc.id}
            className={cn(
              "border-2 transition-all",
              doc.status === "enviado" ? "border-green-300 bg-green-50/50" : "border-border"
            )}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    doc.status === "enviado" ? "bg-green-100" : "bg-gray-100"
                  )}
                >
                  {doc.status === "enviado" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-foreground text-sm">{doc.nome}</h3>
                    {doc.obrigatorio && (
                      <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full">
                        Obrigatório
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{doc.descricao}</p>

                  {/* Botão de download para o Código de Conduta */}
                  {doc.nome.toLowerCase().includes("código de conduta") || doc.nome.toLowerCase().includes("codigo de conduta") ? (
                    <a
                      href={institucional?.codigoConduta?.urlExterna || "/documentos/codigo-conduta-anefac.pdf"}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-700 font-semibold bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-lg"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar Código de Conduta ANEFAC para assinar
                    </a>
                  ) : null}

                  {doc.arquivo && (
                    <div className="flex items-center gap-2 mt-2 bg-white border border-green-200 rounded-lg px-3 py-1.5">
                      <FileText className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span className="text-xs text-green-700 font-medium truncate">{doc.arquivo.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">
                        {(doc.arquivo.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {doc.status === "enviado" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                      onClick={() => handleRemove(doc.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                        disabled={enviando === doc.id}
                      />
                      <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                        <span>
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          Enviar
                        </span>
                      </Button>
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warning */}
      {obrigatoriosPendentes.length > 0 && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700">
            <strong>Atenção:</strong>             Você ainda precisa enviar {obrigatoriosPendentes.length} documento(s) obrigatório(s) para prosseguir para a validação.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between gap-3 pt-6 border-t border-border">
        <Button variant="outline" onClick={() => navigate("/novo-fluxo/pagamento-analise")}>
          ← Voltar
        </Button>
        <Button
          className="bg-blue-900 hover:bg-blue-800 min-w-[220px]"
          onClick={handleContinuar}
          disabled={obrigatoriosPendentes.length > 0}
        >
          Enviar Documentos →
        </Button>
      </div>
    </FluxoLayout>
  );
}
