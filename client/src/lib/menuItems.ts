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
}

export const MENU_ITEMS: MenuItemDef[] = [
  { key: "validacao", label: "Validar documentos", href: "/novo-fluxo/admin/validacao" },
  { key: "resultado_entrevista", label: "Resultado de Entrevistas", href: "/novo-fluxo/admin/resultado-entrevista" },
  { key: "entrevistas", label: "Entrevistas (agenda)", href: "/novo-fluxo/admin/entrevistas" },
  { key: "fale_conosco", label: "Fale Conosco", href: "/novo-fluxo/admin/fale-conosco" },
  { key: "candidatos", label: "Todos os Candidatos", href: "/novo-fluxo/admin/candidatos" },
  { key: "perfis", label: "Perfis e Permissões", href: "/novo-fluxo/admin/perfis" },
  { key: "prova", label: "Parametrizar Prova", href: "/novo-fluxo/admin/prova-config" },
  { key: "usuarios", label: "Gestão de Usuários", href: "/novo-fluxo/admin/usuarios" },
  { key: "carrossel", label: "Carrossel de Imagens", href: "/novo-fluxo/admin/carrossel" },
  { key: "certificacoes", label: "Certificações ativas", href: "/novo-fluxo/admin/certificacoes" },
  { key: "site", label: "Configurar site", href: "/novo-fluxo/admin/site" },
  { key: "institucional", label: "Documentos & Comitê", href: "/novo-fluxo/admin/institucional" },
  { key: "cursos", label: "Cursos e Pacotes", href: "/novo-fluxo/admin/cursos" },
  { key: "relatorio_cursos", label: "Relatório de Cursos (acessos/compras)", href: "/novo-fluxo/admin/relatorio-cursos" },
];

export const MENU_ITEM_LABELS: Record<string, string> = Object.fromEntries(
  MENU_ITEMS.map(i => [i.key, i.label])
);
