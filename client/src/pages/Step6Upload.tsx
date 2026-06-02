import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useSearch } from "wouter";
import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { BackToHomeButton } from "@/components/BackToHomeButton";

interface DocumentUpload {
  id: string;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  uploaded: boolean;
}

export function Step6Upload() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const level = params.get('level');
  const certType = params.get('type') || 'normal';
  const isLevel2 = level === '2';
  const isDirect = certType === 'direct';
  const previousStep = isLevel2 ? '/step-3?level=2' : '/step-5';

  const [documents, setDocuments] = useState<DocumentUpload[]>([
    {
      id: "curriculum",
      title: "Currículo Atualizado",
      description: "Currículo profissional em PDF ou DOC (máx. 5MB)",
      icon: "📄",
      required: true,
      uploaded: false,
    },
    {
      id: "diploma",
      title: "Diploma de Graduação",
      description: "Cópia do diploma ou certificado de conclusão (JPG, PNG ou PDF)",
      icon: "🎓",
      required: true,
      uploaded: false,
    },
    {
      id: "experience",
      title: "Comprovante de Experiência",
      description: "Carta de recomendação ou comprovante de experiência profissional",
      icon: "💼",
      required: true,
      uploaded: false,
    },
    {
      id: "certificates",
      title: "Certificados Profissionais",
      description: "Certificados de cursos, treinamentos ou certificações relevantes",
      icon: "📜",
      required: false,
      uploaded: false,
    },
  ]);

  const handleUpload = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, uploaded: true } : doc
      )
    );
  };

  const allRequiredUploaded = documents
    .filter((d) => d.required)
    .every((d) => d.uploaded);

  const uploadedCount = documents.filter((d) => d.uploaded).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              ← Voltar
            </Button>
            <BackToHomeButton />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
              6
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Upload Documental</h1>
              <p className="text-gray-600">Etapa 6 de 9</p>
            </div>
          </div>
        </div>

        {/* Resumo de Documentação */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">📋 Resumo da Documentação</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold">Candidato</p>
              <p className="text-lg font-bold text-gray-900">João Silva Santos</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold">CPF</p>
              <p className="text-lg font-bold text-gray-900">123.456.789-00</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold">Email</p>
              <p className="text-lg font-bold text-gray-900">joao.silva@email.com</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold">Telefone</p>
              <p className="text-lg font-bold text-gray-900">(11) 98765-4321</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold">Formação</p>
              <p className="text-lg font-bold text-gray-900">Bacharel em Contabilidade</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold">Experiência</p>
              <p className="text-lg font-bold text-gray-900">8 anos em Controladoria</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-200 md:col-span-2">
              <p className="text-sm text-gray-600 font-semibold">Status da Prova</p>
              <p className="text-lg font-bold text-green-600">✅ Aprovado (85%)</p>
            </div>
          </div>
        </Card>

        {/* Documentos a Enviar */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📸 Documentos a Enviar</h2>
          <p className="text-gray-600 mb-6">
            Faça upload dos documentos abaixo. Os campos marcados com <span className="text-red-600 font-bold">*</span> são obrigatórios.
          </p>

          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-900 transition bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{doc.icon}</span>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">
                          {doc.title}
                          {doc.required && <span className="text-red-600 ml-2">*</span>}
                        </h4>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {doc.uploaded ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                        <span className="text-xs font-semibold text-green-600">Enviado</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpload(doc.id)}
                        className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition font-semibold flex items-center gap-2 whitespace-nowrap"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Status de Envio */}
        <Card className={`p-8 mb-8 border-2 ${allRequiredUploaded ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300"}`}>
          <h2 className={`text-2xl font-bold mb-4 ${allRequiredUploaded ? "text-green-900" : "text-amber-900"}`}>
            📊 Status de Envio
          </h2>

          <div className="space-y-3 mb-6">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{doc.icon}</span>
                  <span className="text-gray-700 font-medium">{doc.title}</span>
                </div>
                <span className={`font-bold text-sm ${doc.uploaded ? "text-green-600" : "text-gray-400"}`}>
                  {doc.uploaded ? "✅ Completo" : "⏳ Pendente"}
                </span>
              </div>
            ))}
          </div>

          <div className={`p-4 rounded-lg border-l-4 ${allRequiredUploaded ? "bg-green-100 border-green-600" : "bg-amber-100 border-amber-600"}`}>
            <div className="flex items-start gap-3">
              {allRequiredUploaded ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className={`font-bold ${allRequiredUploaded ? "text-green-900" : "text-amber-900"}`}>
                      ✅ Todos os documentos obrigatórios foram enviados!
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      Você pode prosseguir para a próxima etapa (Entrevista Técnica).
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900">
                      ⚠️ Documentos pendentes
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      Envie todos os documentos obrigatórios para prosseguir. Você enviou {uploadedCount} de {documents.length} documentos.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Link href={previousStep}>
            <a>
              <Button variant="outline" className="px-8">
                ← Anterior
              </Button>
            </a>
          </Link>
          <Link href={allRequiredUploaded ? "/interview-scheduling" : "#"}>
            <a>
              <Button
                className={`px-8 ${allRequiredUploaded ? "bg-blue-900 hover:bg-blue-800" : "bg-gray-400 cursor-not-allowed"}`}
                disabled={!allRequiredUploaded}
              >
                Próximo → 
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
