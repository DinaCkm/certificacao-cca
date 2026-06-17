import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { FluxoLayout } from "@/components/FluxoLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertification } from "@/contexts/CertificationContext";
import { Award, Download, Mail, Share2, BookOpen, CheckCircle } from "lucide-react";

export function EmissaoCertificado() {
  const { processo, getCertificacaoAtual, resetarProcesso } = useCertification();
  const [, navigate] = useLocation();
  const certAtual = getCertificacaoAtual();
  const dataEmissao = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  useEffect(() => {
    if (!processo.certificacaoId) navigate("/novo-fluxo");
  }, [processo.certificacaoId, navigate]);

  if (!certAtual) return null;

  return (
    <FluxoLayout currentStep={7} title="Certificado Emitido!">
      <div className="max-w-3xl mx-auto">
        {/* Success Banner */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-14 h-14 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Parabéns, {processo.candidatoNome || "candidato"}!
          </h2>
          <p className="text-muted-foreground">
            Seu certificado foi emitido com sucesso e enviado para{" "}
            <strong>{processo.candidatoEmail || "seu e-mail"}</strong>.
          </p>
        </div>

        {/* Certificate Preview */}
        <Card className="border-2 border-yellow-300 bg-gradient-to-br from-blue-900 to-blue-800 text-white mb-6 overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-blue-900 font-bold text-lg">A</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg leading-none">ANEFAC</p>
                  <p className="text-xs text-blue-300 leading-none">Certificação Profissional</p>
                </div>
              </div>
              <p className="text-blue-300 text-sm mb-2">Certifica que</p>
              <p className="text-2xl font-bold mb-2">{processo.candidatoNome || "Nome do Candidato"}</p>
              <p className="text-blue-300 text-sm mb-4">concluiu com êxito o processo de certificação e está habilitado(a) como</p>
              <p className="text-xl font-bold text-yellow-300 mb-1">{certAtual.nome}</p>
              <p className="text-sm text-blue-300 mb-6">{certAtual.subtitulo}</p>
              <div className="flex justify-center gap-8 text-xs text-blue-300">
                <div>
                  <p className="font-semibold text-white">Emitido em</p>
                  <p>{dataEmissao}</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Validade</p>
                  <p>3 anos</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Registro</p>
                  <p>ANEFAC-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Reenviar por e-mail
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
        </div>

        {/* What's next */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">O que fazer agora?</h3>
            <div className="space-y-3">
              {[
                { icon: CheckCircle, text: "Adicione a certificação ao seu perfil do LinkedIn", color: "text-blue-600" },
                { icon: Award, text: "Inclua a certificação no seu currículo e portfólio profissional", color: "text-yellow-600" },
                { icon: BookOpen, text: "Mantenha-se atualizado com os cursos de desenvolvimento contínuo da ANEFAC", color: "text-purple-600" },
                { icon: Mail, text: "Fique atento ao prazo de renovação (3 anos) para manter sua certificação ativa", color: "text-green-600" },
              ].map(({ icon: Icon, text, color }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                  <p className="text-sm text-foreground">{text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card className="bg-purple-50 border-purple-200 mb-6">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-purple-700 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-purple-900 mb-1">Cursos de atualização recomendados</p>
                <p className="text-xs text-purple-700 mb-3">
                  Para manter sua certificação ativa e se desenvolver continuamente:
                </p>
                <div className="space-y-1">
                  {certAtual.cursos.map((curso) => (
                    <p key={curso} className="text-xs text-purple-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                      {curso}
                    </p>
                  ))}
                </div>
                <Button size="sm" className="mt-3 bg-purple-700 hover:bg-purple-800 text-xs">
                  Ver cursos disponíveis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            variant="ghost"
            className="text-sm text-muted-foreground"
            onClick={() => {
              resetarProcesso();
              navigate("/novo-fluxo");
            }}
          >
            Iniciar novo processo de certificação
          </Button>
        </div>
      </div>
    </FluxoLayout>
  );
}
