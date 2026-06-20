import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Plus, Edit2, Power, PowerOff, X, Check,
  Shield, Eye, EyeOff, Search
} from "lucide-react";
import { api } from "@/lib/api";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Usuario {
  id: number;
  email: string;
  full_name: string;
  role: string;
  role_nome: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

interface Role {
  id: number;
  code: string;
  nome: string;
  descricao: string;
}

// ── Mapa de cores por perfil ──────────────────────────────────────────────────

const ROLE_CORES: Record<string, string> = {
  administrador:  "bg-red-100 text-red-800 border-red-200",
  gestor_n1:      "bg-purple-100 text-purple-800 border-purple-200",
  gestor_n2:      "bg-indigo-100 text-indigo-800 border-indigo-200",
  avaliador:      "bg-blue-100 text-blue-800 border-blue-200",
  entrevistador:  "bg-teal-100 text-teal-800 border-teal-200",
};

// ── Permissões por perfil (exibição) ─────────────────────────────────────────

const ROLE_PERMISSOES: Record<string, string[]> = {
  administrador: [
    "Acesso total ao sistema",
    "Cria e edita todos os usuários",
    "Define perfis e permissões",
    "Acesso a logs de auditoria",
  ],
  gestor_n1: [
    "Cria avaliadores e entrevistadores",
    "Cria cursos e certificações",
    "Inclui avisos na plataforma",
    "Visualiza todos os dashboards",
  ],
  gestor_n2: [
    "Cria cursos e certificações",
    "Inclui avisos na plataforma",
    "Visualiza dashboards básicos",
  ],
  avaliador: [
    "Valida documentos dos candidatos",
    "Define Caminho A (entrevista direta)",
    "Define Caminho B (prova antes da entrevista)",
    "Registra parecer documental",
  ],
  entrevistador: [
    "Conduz entrevistas técnicas",
    "Registra resultado final da entrevista",
    "Acessa gravações de entrevistas",
  ],
};

// ── Componente principal ──────────────────────────────────────────────────────

export function AdminUsuarios() {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Modal de criação/edição
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    senha: "",
    role_code: "",
  });

  // Modal de permissões
  const [permissaoAberta, setPermissaoAberta] = useState<Usuario | null>(null);

  // ── Carrega dados ────────────────────────────────────────────────────────────

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [{ usuarios }, { roles }] = await Promise.all([
        api.admin.listarUsuarios(),
        api.admin.listarRoles(),
      ]);
      setUsuarios(usuarios);
      setRoles(roles);
    } catch (err: any) {
      toast({ title: "Erro ao carregar usuários", variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  // ── Criar / Editar ───────────────────────────────────────────────────────────

  function abrirCriar() {
    setEditando(null);
    setForm({ full_name: "", email: "", senha: "", role_code: "" });
    setModalAberto(true);
  }

  function abrirEditar(u: Usuario) {
    setEditando(u);
    setForm({ full_name: u.full_name, email: u.email, senha: "", role_code: u.role });
    setModalAberto(true);
  }

  async function salvar() {
    if (!form.full_name || !form.role_code) {
      toast({ title: "Preencha nome e perfil", variant: "destructive" });
      return;
    }
    if (!editando && (!form.email || !form.senha)) {
      toast({ title: "E-mail e senha são obrigatórios para novo usuário", variant: "destructive" });
      return;
    }
    if (!editando && form.senha.length < 8) {
      toast({ title: "Senha deve ter no mínimo 8 caracteres", variant: "destructive" });
      return;
    }

    setSalvando(true);
    try {
      if (editando) {
        await api.admin.editarUsuario(editando.id, {
          full_name: form.full_name,
          role_code: form.role_code,
          ...(form.senha ? { senha: form.senha } : {}),
        });
        toast({ title: "Usuário atualizado com sucesso!" });
      } else {
        await api.admin.criarUsuario({
          email: form.email,
          senha: form.senha,
          full_name: form.full_name,
          role_code: form.role_code,
        });
        toast({ title: "Usuário criado com sucesso!" });
      }
      setModalAberto(false);
      carregarDados();
    } catch (err: any) {
      toast({ title: err.message || "Erro ao salvar usuário", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  }

  // ── Ativar / Desativar ───────────────────────────────────────────────────────

  async function toggleAtivo(u: Usuario) {
    try {
      await api.admin.editarUsuario(u.id, { is_active: !u.is_active });
      toast({ title: u.is_active ? "Usuário desativado" : "Usuário reativado" });
      carregarDados();
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  }

  // ── Filtro ───────────────────────────────────────────────────────────────────

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.full_name.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase()) ||
      u.role_nome.toLowerCase().includes(busca.toLowerCase())
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gestão de Usuários</h1>
              <p className="text-sm text-gray-500">{usuarios.length} usuário(s) no sistema</p>
            </div>
          </div>
          <Button className="bg-blue-900 hover:bg-blue-800" onClick={abrirCriar}>
            <Plus className="w-4 h-4 mr-2" /> Novo Usuário
          </Button>
        </div>

        {/* Busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9 bg-white"
            placeholder="Buscar por nome, e-mail ou perfil..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* Cards de perfis */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {roles.map((r) => {
            const count = usuarios.filter((u) => u.role === r.code).length;
            return (
              <Card key={r.code} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setPermissaoAberta({ role: r.code, role_nome: r.nome } as any)}>
                <CardContent className="p-4 text-center">
                  <Shield className="w-5 h-5 mx-auto mb-2 text-blue-700" />
                  <p className="text-xs font-semibold text-gray-900 leading-tight">{r.nome}</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{count}</p>
                  <p className="text-xs text-gray-400">usuário(s)</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabela de usuários */}
        <Card>
          <CardContent className="p-0">
            {carregando ? (
              <div className="p-12 text-center text-gray-400">Carregando...</div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="p-12 text-center text-gray-400">Nenhum usuário encontrado.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase">
                    <th className="text-left p-4">Nome</th>
                    <th className="text-left p-4">E-mail</th>
                    <th className="text-left p-4">Perfil</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Último acesso</th>
                    <th className="text-right p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u) => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{u.full_name}</td>
                      <td className="p-4 text-gray-600">{u.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_CORES[u.role] || "bg-gray-100 text-gray-700"}`}>
                          {u.role_nome}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.is_active ? "text-green-700" : "text-red-500"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-green-500" : "bg-red-400"}`} />
                          {u.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString("pt-BR") : "Nunca"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPermissaoAberta(u)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-700"
                            title="Ver permissões"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => abrirEditar(u)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-700"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleAtivo(u)}
                            className={`p-1.5 rounded hover:bg-gray-100 ${u.is_active ? "text-green-600 hover:text-red-500" : "text-red-400 hover:text-green-600"}`}
                            title={u.is_active ? "Desativar" : "Reativar"}
                          >
                            {u.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Modal criar/editar ────────────────────────────────────────────────── */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  {editando ? "Editar Usuário" : "Novo Usuário"}
                </h2>
                <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Nome completo *</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Nome do usuário" />
                </div>

                {!editando && (
                  <div>
                    <Label>E-mail *</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@anefac.com.br" />
                  </div>
                )}

                <div>
                  <Label>{editando ? "Nova senha (deixe em branco para não alterar)" : "Senha *"}</Label>
                  <div className="relative">
                    <Input
                      type={mostrarSenha ? "text" : "password"}
                      value={form.senha}
                      onChange={(e) => setForm({ ...form, senha: e.target.value })}
                      placeholder="Mínimo 8 caracteres"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label>Perfil de acesso *</Label>
                  <select
                    value={form.role_code}
                    onChange={(e) => setForm({ ...form, role_code: e.target.value })}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1"
                  >
                    <option value="">Selecione um perfil...</option>
                    {roles.map((r) => (
                      <option key={r.code} value={r.code}>{r.nome}</option>
                    ))}
                  </select>

                  {/* Permissões do perfil selecionado */}
                  {form.role_code && ROLE_PERMISSOES[form.role_code] && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-800 mb-2">Este perfil pode:</p>
                      <ul className="space-y-1">
                        {ROLE_PERMISSOES[form.role_code].map((p) => (
                          <li key={p} className="flex items-start gap-2 text-xs text-blue-700">
                            <Check className="w-3 h-3 mt-0.5 shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setModalAberto(false)} disabled={salvando}>
                  Cancelar
                </Button>
                <Button className="flex-1 bg-blue-900 hover:bg-blue-800" onClick={salvar} disabled={salvando}>
                  {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Criar usuário"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Modal de permissões ───────────────────────────────────────────────── */}
      {permissaoAberta && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">Permissões do Perfil</h2>
                <button onClick={() => setPermissaoAberta(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mb-4 ${ROLE_CORES[permissaoAberta.role] || "bg-gray-100 text-gray-700"}`}>
                {permissaoAberta.role_nome}
              </span>
              <ul className="space-y-2">
                {(ROLE_PERMISSOES[permissaoAberta.role] || ["Permissões não definidas"]).map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full mt-5" onClick={() => setPermissaoAberta(null)}>
                Fechar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
