import React, { useState } from "react";
import {
  Shield, Users, Eye, Edit, Trash2, CheckCircle, XCircle,
  Award, FileText, MessageCircle, Settings, BookOpen, Image,
  UserCheck, ChevronDown, ChevronUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ROLES = [
  {
    id: "administrador",
    label: "Administrador",
    cor: "from-purple-600 to-purple-800",
    corBadge: "bg-purple-100 text-purple-800",
    icone: <Shield className="w-6 h-6 text-white" />,
    descricao: "Acesso total ao sistema. Gerencia todos os usuários, candidatos, provas e configurações da plataforma.",
    permissoes: [
      { categoria: "Candidatos", itens: [
        { label: "Ver todos os candidatos", pode: true },
        { label: "Buscar e filtrar candidatos", pode: true },
        { label: "Ver detalhes do candidato", pode: true },
        { label: "Inativar candidato (LGPD)", pode: true },
        { label: "Excluir candidato permanentemente", pode: true },
      ]},
      { categoria: "Provas", itens: [
        { label: "Configurar parâmetros da prova", pode: true },
        { label: "Criar e editar questões", pode: true },
        { label: "Ver preview da prova", pode: true },
        { label: "Ver histórico de tentativas", pode: true },
      ]},
      { categoria: "Documentos", itens: [
        { label: "Validar documentos", pode: true },
        { label: "Definir Caminho A ou B", pode: true },
        { label: "Rejeitar documentos", pode: true },
      ]},
      { categoria: "Plataforma", itens: [
        { label: "Gerenciar usuários do sistema", pode: true },
        { label: "Configurar carrossel de imagens", pode: true },
        { label: "Configurar site", pode: true },
        { label: "Ver mensagens Fale Conosco", pode: true },
        { label: "Acessar auditoria e logs", pode: true },
      ]},
    ]
  },
  {
    id: "gestor_n1",
    label: "Gestor Nível 1",
    cor: "from-blue-600 to-blue-800",
    corBadge: "bg-blue-100 text-blue-800",
    icone: <UserCheck className="w-6 h-6 text-white" />,
    descricao: "Gestão operacional do processo de certificação. Pode validar documentos, gerenciar candidatos e configurar provas, mas não exclui usuários permanentemente.",
    permissoes: [
      { categoria: "Candidatos", itens: [
        { label: "Ver todos os candidatos", pode: true },
        { label: "Buscar e filtrar candidatos", pode: true },
        { label: "Ver detalhes do candidato", pode: true },
        { label: "Inativar candidato (LGPD)", pode: true },
        { label: "Excluir candidato permanentemente", pode: false },
      ]},
      { categoria: "Provas", itens: [
        { label: "Configurar parâmetros da prova", pode: true },
        { label: "Criar e editar questões", pode: true },
        { label: "Ver preview da prova", pode: true },
        { label: "Ver histórico de tentativas", pode: true },
      ]},
      { categoria: "Documentos", itens: [
        { label: "Validar documentos", pode: true },
        { label: "Definir Caminho A ou B", pode: true },
        { label: "Rejeitar documentos", pode: true },
      ]},
      { categoria: "Plataforma", itens: [
        { label: "Gerenciar usuários do sistema", pode: false },
        { label: "Configurar carrossel de imagens", pode: true },
        { label: "Configurar site", pode: false },
        { label: "Ver mensagens Fale Conosco", pode: true },
        { label: "Acessar auditoria e logs", pode: false },
      ]},
    ]
  },
  {
    id: "gestor_n2",
    label: "Gestor Nível 2",
    cor: "from-indigo-600 to-indigo-800",
    corBadge: "bg-indigo-100 text-indigo-800",
    icone: <Users className="w-6 h-6 text-white" />,
    descricao: "Visão gerencial. Acompanha o andamento dos processos e mensagens, mas não altera configurações nem exclui dados.",
    permissoes: [
      { categoria: "Candidatos", itens: [
        { label: "Ver todos os candidatos", pode: true },
        { label: "Buscar e filtrar candidatos", pode: true },
        { label: "Ver detalhes do candidato", pode: true },
        { label: "Inativar candidato (LGPD)", pode: false },
        { label: "Excluir candidato permanentemente", pode: false },
      ]},
      { categoria: "Provas", itens: [
        { label: "Configurar parâmetros da prova", pode: false },
        { label: "Criar e editar questões", pode: false },
        { label: "Ver preview da prova", pode: true },
        { label: "Ver histórico de tentativas", pode: true },
      ]},
      { categoria: "Documentos", itens: [
        { label: "Validar documentos", pode: false },
        { label: "Definir Caminho A ou B", pode: false },
        { label: "Rejeitar documentos", pode: false },
      ]},
      { categoria: "Plataforma", itens: [
        { label: "Gerenciar usuários do sistema", pode: false },
        { label: "Configurar carrossel de imagens", pode: false },
        { label: "Configurar site", pode: false },
        { label: "Ver mensagens Fale Conosco", pode: true },
        { label: "Acessar auditoria e logs", pode: false },
      ]},
    ]
  },
  {
    id: "avaliador",
    label: "Avaliador",
    cor: "from-teal-600 to-teal-800",
    corBadge: "bg-teal-100 text-teal-800",
    icone: <Eye className="w-6 h-6 text-white" />,
    descricao: "Responsável pela validação documental e definição do caminho de avaliação (A ou B) de cada candidato.",
    permissoes: [
      { categoria: "Candidatos", itens: [
        { label: "Ver todos os candidatos", pode: true },
        { label: "Buscar e filtrar candidatos", pode: true },
        { label: "Ver detalhes do candidato", pode: true },
        { label: "Inativar candidato (LGPD)", pode: false },
        { label: "Excluir candidato permanentemente", pode: false },
      ]},
      { categoria: "Provas", itens: [
        { label: "Configurar parâmetros da prova", pode: false },
        { label: "Criar e editar questões", pode: false },
        { label: "Ver preview da prova", pode: true },
        { label: "Ver histórico de tentativas", pode: true },
      ]},
      { categoria: "Documentos", itens: [
        { label: "Validar documentos", pode: true },
        { label: "Definir Caminho A ou B", pode: true },
        { label: "Rejeitar documentos", pode: true },
      ]},
      { categoria: "Plataforma", itens: [
        { label: "Gerenciar usuários do sistema", pode: false },
        { label: "Configurar carrossel de imagens", pode: false },
        { label: "Configurar site", pode: false },
        { label: "Ver mensagens Fale Conosco", pode: false },
        { label: "Acessar auditoria e logs", pode: false },
      ]},
    ]
  },
  {
    id: "entrevistador",
    label: "Entrevistador",
    cor: "from-green-600 to-green-800",
    corBadge: "bg-green-100 text-green-800",
    icone: <Award className="w-6 h-6 text-white" />,
    descricao: "Conduz as entrevistas técnicas dos candidatos. Registra o resultado (Habilitado ou Não Habilitado), que aciona automaticamente o envio de e-mail ao candidato e atualiza o status do processo.",
    permissoes: [
      { categoria: "Candidatos", itens: [
        { label: "Ver candidatos designados", pode: true },
        { label: "Ver detalhes do candidato", pode: true },
        { label: "Inativar ou excluir candidato", pode: false },
      ]},
      { categoria: "Entrevistas", itens: [
        { label: "Ver candidatos aguardando resultado", pode: true },
        { label: "Registrar Habilitado ou Não Habilitado", pode: true },
        { label: "Acionar envio automático de e-mail ao candidato", pode: true },
        { label: "Acessar sala de entrevista", pode: true },
      ]},
      { categoria: "Plataforma", itens: [
        { label: "Configurar provas ou questões", pode: false },
        { label: "Validar documentos", pode: false },
        { label: "Configurar site ou carrossel", pode: false },
        { label: "Ver mensagens Fale Conosco", pode: false },
      ]},
    ]
  },
  {
    id: "candidato",
    label: "Candidato",
    cor: "from-gray-500 to-gray-700",
    corBadge: "bg-gray-100 text-gray-700",
    icone: <FileText className="w-6 h-6 text-white" />,
    descricao: "Usuário que realiza o processo de certificação ANEFAC. Acessa apenas a sua própria área de candidato.",
    permissoes: [
      { categoria: "Área do candidato", itens: [
        { label: "Fazer cadastro", pode: true },
        { label: "Realizar pagamento da taxa de análise", pode: true },
        { label: "Enviar documentos", pode: true },
        { label: "Acompanhar status do processo", pode: true },
        { label: "Realizar prova de competência", pode: true },
        { label: "Agendar entrevista", pode: true },
        { label: "Realizar pagamento da taxa de emissão", pode: true },
        { label: "Receber certificado", pode: true },
      ]},
      { categoria: "Restrições", itens: [
        { label: "Acessar painel administrativo", pode: false },
        { label: "Ver dados de outros candidatos", pode: false },
        { label: "Configurar provas ou plataforma", pode: false },
      ]},
    ]
  },
];

export function AdminPerfis() {
  const [expandido, setExpandido] = useState<string | null>("administrador");

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(180deg, #050a28 0%, #0a1f5e 45%, #1565c0 75%, #1976d2 100%)" }}>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4fc3f7" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6B3FA0, #1a4a9e)" }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Perfis e Permissões</h1>
            <p className="text-sm text-blue-300">O que cada tipo de usuário pode fazer na plataforma</p>
          </div>
        </div>

        {/* Cards de perfis */}
        <div className="space-y-4 mb-8">
          {ROLES.map(role => (
            <Card key={role.id} className="border-white/10 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>

              {/* Header do card */}
              <button className="w-full text-left" onClick={() => setExpandido(expandido === role.id ? null : role.id)}>
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${role.cor} shadow-lg`}>
                      {role.icone}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{role.label}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role.corBadge}`}>
                          {role.id}
                        </span>
                      </div>
                      <p className="text-sm text-blue-200 mt-0.5 max-w-xl">{role.descricao}</p>
                    </div>
                  </div>
                  <div className="text-white/40 shrink-0 ml-4">
                    {expandido === role.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </button>

              {/* Permissões expandidas */}
              {expandido === role.id && (
                <div className="border-t border-white/10 px-5 pb-5 pt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {role.permissoes.map(cat => (
                      <div key={cat.categoria}>
                        <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">{cat.categoria}</p>
                        <div className="space-y-1.5">
                          {cat.itens.map(item => (
                            <div key={item.label} className="flex items-center gap-2">
                              {item.pode
                                ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                                : <XCircle className="w-4 h-4 text-red-400/60 shrink-0" />}
                              <span className={`text-sm ${item.pode ? "text-blue-100" : "text-white/30 line-through"}`}>
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-4 pb-4">
          <a href="/novo-fluxo/admin"
            className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white px-5 py-2.5 rounded-xl text-sm transition-colors"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            ← Voltar ao menu admin
          </a>
        </div>
      </div>
    </div>
  );
}
