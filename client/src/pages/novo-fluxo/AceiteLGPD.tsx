import React, { useState } from "react";
import { useLocation } from "wouter";
import { Shield, CheckCircle, ChevronRight, FileText, Lock, Eye } from "lucide-react";

export function AceiteLGPD() {
  const [, navigate] = useLocation();
  const [aceitou, setAceitou] = useState(false);
  const [expandido, setExpandido] = useState<string | null>(null);

  const handleProsseguir = () => {
    if (!aceitou) return;
    // Salva o aceite pendente — será registrado no banco após o cadastro
    sessionStorage.setItem("anefac_lgpd_aceito", "true");
    navigate("/novo-fluxo/cadastro");
  };

  const secoes = [
    {
      id: "dados",
      titulo: "Quais dados coletamos",
      icone: <FileText className="w-4 h-4" />,
      conteudo: `Coletamos os seguintes dados pessoais: nome completo, CPF, data de nascimento, e-mail, telefone, empresa, cargo, formação acadêmica e tempo de experiência profissional. Esses dados são necessários exclusivamente para o processo de certificação ANEFAC.`
    },
    {
      id: "uso",
      titulo: "Como usamos seus dados",
      icone: <Eye className="w-4 h-4" />,
      conteudo: `Seus dados são utilizados para: (1) identificação e autenticação na plataforma; (2) avaliação documental pela banca examinadora; (3) agendamento e realização de entrevistas técnicas; (4) emissão do certificado profissional; (5) comunicações relacionadas ao processo de certificação.`
    },
    {
      id: "protecao",
      titulo: "Como protegemos seus dados",
      icone: <Lock className="w-4 h-4" />,
      conteudo: `Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo: criptografia de senhas, comunicação segura via HTTPS, acesso restrito por autenticação e controle de roles. Seus dados não são vendidos, compartilhados ou cedidos a terceiros sem sua autorização.`
    },
    {
      id: "direitos",
      titulo: "Seus direitos (Lei 13.709/2018 — LGPD)",
      icone: <Shield className="w-4 h-4" />,
      conteudo: `Você tem direito a: (1) confirmar a existência de tratamento dos seus dados; (2) acessar seus dados; (3) corrigir dados incompletos ou desatualizados; (4) solicitar anonimização, bloqueio ou eliminação de dados desnecessários; (5) revogar seu consentimento a qualquer momento; (6) solicitar exclusão definitiva dos seus dados.

Para exercer seus direitos, entre em contato pelo Fale Conosco.`
    },
    {
      id: "retencao",
      titulo: "Por quanto tempo guardamos seus dados",
      icone: <FileText className="w-4 h-4" />,
      conteudo: `Seus dados são mantidos pelo período necessário para o processo de certificação e, após a conclusão, pelo prazo legal exigido para fins de comprovação e auditoria. Você pode solicitar a exclusão dos seus dados a qualquer momento, respeitadas as obrigações legais.`
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 45%, #1565c0 75%, #1976d2 100%)" }}>

      {/* Grid decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4fc3f7" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex-1 px-4 py-10">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
              style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">
              Política de Privacidade
            </h1>
            <p className="text-blue-200 text-sm max-w-md mx-auto leading-relaxed">
              Antes de prosseguir com seu cadastro, leia como a ANEFAC trata seus dados pessoais em conformidade com a <strong className="text-white">Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)</strong>.
            </p>
          </div>

          {/* Seções da política */}
          <div className="space-y-3 mb-6">
            {secoes.map(s => (
              <div key={s.id}
                className="rounded-2xl border border-white/10 overflow-hidden cursor-pointer"
                style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }}
                onClick={() => setExpandido(expandido === s.id ? null : s.id)}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-300">
                      {s.icone}
                    </div>
                    <p className="font-medium text-white text-sm">{s.titulo}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${expandido === s.id ? "rotate-90" : ""}`} />
                </div>
                {expandido === s.id && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="ml-11 border-t border-white/10 pt-3">
                      <p className="text-sm text-blue-200 leading-relaxed whitespace-pre-line">{s.conteudo}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Checkbox de aceite */}
          <div className="rounded-2xl border border-white/20 p-5 mb-6"
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={aceitou}
                  onChange={e => setAceitou(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  aceitou
                    ? "border-transparent"
                    : "border-white/30 group-hover:border-white/60"
                }`}
                  style={aceitou ? { background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" } : {}}>
                  {aceitou && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
              </div>
              <p className="text-sm text-blue-100 leading-relaxed">
                Li e concordo com a <strong className="text-white">Política de Privacidade da ANEFAC</strong> e autorizo o tratamento dos meus dados pessoais para fins de certificação profissional, conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
              </p>
            </label>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/novo-fluxo")}
              className="flex-1 border border-white/20 text-white/70 hover:text-white py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              ← Voltar
            </button>
            <button
              onClick={handleProsseguir}
              disabled={!aceitou}
              className="flex-2 flex items-center justify-center gap-2 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
              style={{ background: aceitou ? "linear-gradient(135deg, #6B3FA0, #1a4a9e)" : "rgba(255,255,255,0.1)", flex: 2 }}>
              <CheckCircle className="w-4 h-4" />
              Aceitar e prosseguir para o cadastro →
            </button>
          </div>

          <p className="text-center text-xs text-white/30 mt-4">
            ANEFAC — Associação Nacional dos Executivos de Finanças, Administração e Contabilidade
          </p>
        </div>
      </div>
    </div>
  );
}
