// Lista canônica dos itens de menu da área administrativa.
// Usada em três lugares: Ações Rápidas (AdminDashboard), navbar admin
// (NavbarGlobal) e a tela de configuração de permissões (AdminUsuarios).
//
// A chave (`key`) é o que fica salvo em `roles.menu_permissoes` no banco —
// nunca renomeie uma chave existente sem migrar os dados salvos.
//
// "dashboard" não entra nesta lista: é a home da área admin e fica sempre
// visível para qualquer perfil com acesso à área administrativa.

export interface MenuItemDef {
  key: string;
  label: string;
  href: string;
  icon?: string; // nome do ícone lucide-react, resolvido pelos componentes que renderizam o menu
}

export interface MenuGroupDef {
  label: string;
  items: MenuItemDef[];
}

// ─── Fonte única de verdade: grupos ──────────────────────────────────────────
// NavbarGlobal, AdminDashboard (Ações rápidas) e o editor de permissões em
// AdminUsuarios leem TODOS a partir daqui — nenhum deles mantém sua própria
// lista de itens. Adicionar uma tela nova ao admin = adicionar uma linha aqui.
export const MENU_GROUPS: MenuGroupDef[] = [
  {
    label: "Candidatos",
    items: [
      { key: "candidatos", label: "Todos os Candidatos", href: "/novo-fluxo/admin/candidatos", icon: "Users" },
      { key: "validacao", label: "Validar Documentos", href: "/novo-fluxo/admin/validacao", icon: "FileCheck" },
      { key: "fale_conosco", label: "Fale Conosco", href: "/novo-fluxo/admin/fale-conosco", icon: "MessageCircle" },
    ],
  },
  {
    label: "Entrevistas",
    items: [
      { key: "entrevistas", label: "Agenda de Entrevistas", href: "/novo-fluxo/admin/entrevistas", icon: "CalendarClock" },
      { key: "resultado_entrevista", label: "Resultado de Entrevistas", href: "/novo-fluxo/admin/resultado-entrevista", icon: "Award" },
    ],
  },
  {
    label: "Provas",
    items: [
      { key: "prova", label: "Parametrizar Prova", href: "/novo-fluxo/admin/prova-config", icon: "FileText" },
      { key: "eixos_conhecimento", label: "Eixos de Conhecimento", href: "/novo-fluxo/admin/eixos-conhecimento", icon: "Target" },
      { key: "avaliadores_certificacao", label: "Avaliadores por Certificação", href: "/novo-fluxo/admin/avaliadores-certificacao", icon: "ShieldCheck" },
      { key: "simulacoes", label: "Simulações", href: "/novo-fluxo/admin/simulacoes", icon: "GraduationCap" },
      { key: "provas_agendadas", label: "Agenda de Provas", href: "/novo-fluxo/admin/provas-agendadas", icon: "CalendarDays" },
      { key: "prova_relatorio", label: "Relatório da Prova", href: "/novo-fluxo/admin/prova-relatorio", icon: "BarChart3" },
    ],
  },
  {
    label: "Plataforma",
    items: [
      { key: "usuarios", label: "Gestão de Usuários", href: "/novo-fluxo/admin/usuarios", icon: "Settings" },
      { key: "perfis", label: "Perfis e Permissões", href: "/novo-fluxo/admin/perfis", icon: "ShieldCheck" },
      { key: "certificacoes", label: "Certificações Ativas", href: "/novo-fluxo/admin/certificacoes", icon: "Award" },
      { key: "carrossel", label: "Carrossel de Imagens", href: "/novo-fluxo/admin/carrossel", icon: "Image" },
      { key: "site", label: "Configurar Site", href: "/novo-fluxo/admin/site", icon: "Globe" },
      { key: "institucional", label: "Documentos & Comitê", href: "/novo-fluxo/admin/institucional", icon: "BookOpen" },
      { key: "comite_edital", label: "Comitê & Edital", href: "/novo-fluxo/admin/comite", icon: "ShieldCheck" },
    ],
  },
  {
    label: "Certificados",
    items: [
      { key: "certificados", label: "Certificados Emitidos", href: "/novo-fluxo/admin/certificados", icon: "Award" },
    ],
  },
  {
    label: "Cursos",
    items: [
      { key: "cursos", label: "Cursos e Pacotes", href: "/novo-fluxo/admin/cursos", icon: "BookOpen" },
      { key: "relatorio_cursos", label: "Relatório de Cursos", href: "/novo-fluxo/admin/relatorio-cursos", icon: "BarChart3" },
    ],
  },
];

// Lista plana derivada dos grupos — mantém compatibilidade com quem já
// consome MENU_ITEMS (ex: checkboxes do editor de permissões). Nunca editar
// esta lista diretamente: editar MENU_GROUPS acima.
export const MENU_ITEMS: MenuItemDef[] = MENU_GROUPS.flatMap(g => g.items);

export const MENU_ITEM_LABELS: Record<string, string> = Object.fromEntries(
  MENU_ITEMS.map(i => [i.key, i.label])
);
