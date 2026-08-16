// Fonte única dos perfis considerados "administrativos" — ou seja, que devem
// ver a área /novo-fluxo/admin em vez do mural do candidato.
//
// Antes esta lista estava duplicada em 4+ lugares (Navbar.tsx, NavbarGlobal.tsx,
// AreaCandidato.tsx, AdminRoute.tsx), e cada cópia podia ficar desatualizada
// independentemente das outras — foi exatamente o que aconteceu com o perfil
// "fiscal", que ficava autorizado em algumas telas e ignorado em outras.
//
// Qualquer novo perfil administrativo (ex: um futuro "financeiro") deve ser
// adicionado AQUI, uma vez só.
export const ADMIN_ROLES = [
  "administrador",
  "gestor_n1",
  "gestor_n2",
  "avaliador",
  "entrevistador",
  "fiscal",
] as const;

export type AdminRole = typeof ADMIN_ROLES[number];

export function isAdminRole(role?: string | null): boolean {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}
