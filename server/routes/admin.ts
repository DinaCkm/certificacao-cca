import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { db } from "../db/connection.js";

export const adminRouter = Router();

// Todas as rotas exigem autenticação
adminRouter.use(requireAuth);

// ── GET /api/admin/usuarios ───────────────────────────────────────────────────
// Lista todos os usuários do sistema (exceto candidatos)

adminRouter.get(
  "/usuarios",
  requireRole("administrador"),
  async (req: Request, res: Response) => {
    try {
      const [rows] = await db.execute(
        `SELECT u.id, u.email, u.full_name, u.is_active, u.created_at, u.last_login_at,
                r.code as role, r.nome as role_nome
         FROM users u
         JOIN roles r ON r.id = u.role_id
         WHERE r.code != 'candidato'
         ORDER BY r.id, u.full_name`
      ) as any;
      return res.json({ usuarios: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao listar usuários" });
    }
  }
);

// ── POST /api/admin/usuarios ──────────────────────────────────────────────────
// Cria novo usuário do sistema (apenas Administrador)

adminRouter.post(
  "/usuarios",
  requireRole("administrador"),
  async (req: Request, res: Response) => {
    const { email, senha, full_name, cpf, role_code } = req.body;

    if (!email || !senha || !full_name || !role_code) {
      return res.status(400).json({ error: "email, senha, full_name e role_code são obrigatórios" });
    }

    // Não permite criar candidatos por aqui
    if (role_code === "candidato") {
      return res.status(400).json({ error: "Use o fluxo de cadastro para criar candidatos" });
    }

    try {
      // Busca o role
      const [roles] = await db.execute(
        "SELECT id FROM roles WHERE code = ?", [role_code]
      ) as any;

      if (roles.length === 0) {
        return res.status(400).json({ error: "Perfil inválido" });
      }

      const role_id = roles[0].id;

      // Verifica duplicidade de email
      const [existing] = await db.execute(
        "SELECT id FROM users WHERE email = ?", [email]
      ) as any;

      if (existing.length > 0) {
        return res.status(409).json({ error: "E-mail já cadastrado" });
      }

      const password_hash = await bcrypt.hash(senha, 12);
      const cpf_final = cpf ? cpf.replace(/\D/g, "") : "00000000000";

      const [result] = await db.execute(
        `INSERT INTO users (email, password_hash, full_name, cpf, role_id, email_verified)
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [email, password_hash, full_name, cpf_final, role_id]
      ) as any;

      // Audit log
      await db.execute(
        `INSERT INTO audit_log (user_id, acao, entidade, entidade_id, descricao, resultado)
         VALUES (?, 'usuario_criado', 'users', ?, ?, 'sucesso')`,
        [req.user!.userId, result.insertId, `Usuário ${email} criado com perfil ${role_code}`]
      );

      return res.status(201).json({ id: result.insertId, message: "Usuário criado com sucesso" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao criar usuário" });
    }
  }
);

// ── PUT /api/admin/usuarios/:id ───────────────────────────────────────────────
// Edita usuário (nome, role, status)

adminRouter.put(
  "/usuarios/:id",
  requireRole("administrador"),
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const { full_name, role_code, is_active, senha } = req.body;

    try {
      // Não permite editar a si mesmo
      if (userId === req.user!.userId) {
        return res.status(400).json({ error: "Você não pode editar sua própria conta por aqui" });
      }

      let role_id: number | undefined;
      if (role_code) {
        const [roles] = await db.execute(
          "SELECT id FROM roles WHERE code = ?", [role_code]
        ) as any;
        if (roles.length === 0) return res.status(400).json({ error: "Perfil inválido" });
        role_id = roles[0].id;
      }

      const updates: string[] = [];
      const params: any[] = [];

      if (full_name) { updates.push("full_name = ?"); params.push(full_name); }
      if (role_id) { updates.push("role_id = ?"); params.push(role_id); }
      if (typeof is_active === "boolean") { updates.push("is_active = ?"); params.push(is_active); }
      if (senha) {
        const hash = await bcrypt.hash(senha, 12);
        updates.push("password_hash = ?");
        params.push(hash);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "Nenhum campo para atualizar" });
      }

      params.push(userId);
      await db.execute(
        `UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`,
        params
      );

      await db.execute(
        `INSERT INTO audit_log (user_id, acao, entidade, entidade_id, descricao, resultado)
         VALUES (?, 'usuario_editado', 'users', ?, ?, 'sucesso')`,
        [req.user!.userId, userId, `Usuário id=${userId} editado`]
      );

      return res.json({ message: "Usuário atualizado com sucesso" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao editar usuário" });
    }
  }
);

// ── GET /api/admin/roles ──────────────────────────────────────────────────────
// Lista todos os perfis disponíveis

adminRouter.get(
  "/roles",
  requireRole("administrador"),
  async (_req: Request, res: Response) => {
    try {
      const [rows] = await db.execute(
        "SELECT id, code, nome, descricao FROM roles WHERE code != 'candidato' ORDER BY id"
      ) as any;
      return res.json({ roles: rows });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao listar perfis" });
    }
  }
);

// ── Slots de entrevista ───────────────────────────────────────────────────────

// GET /api/admin/slots — lista slots (admin/entrevistador)
adminRouter.get(
  "/slots",
  requireRole("administrador", "entrevistador", "gestor_n1"),
  async (req: Request, res: Response) => {
    try {
      const [rows] = await db.execute(
        `SELECT s.id, s.data_hora, s.duracao_minutos, s.ocupado, s.criado_em,
                u.full_name as entrevistador_nome, u.email as entrevistador_email
         FROM slots_entrevista s
         JOIN users u ON u.id = s.entrevistador_id
         WHERE s.data_hora >= NOW()
         ORDER BY s.data_hora ASC`
      ) as any;
      return res.json({ slots: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao listar slots" });
    }
  }
);

// POST /api/admin/slots — cria slot (admin/entrevistador)
adminRouter.post(
  "/slots",
  requireRole("administrador", "entrevistador", "gestor_n1"),
  async (req: Request, res: Response) => {
    const { data_hora, duracao_minutos } = req.body;

    if (!data_hora) {
      return res.status(400).json({ error: "data_hora é obrigatória" });
    }

    try {
      // Verifica se é no mínimo 7 dias a partir de hoje
      const dataSlot = new Date(data_hora);
      const minData = new Date();
      minData.setDate(minData.getDate() + 7);

      if (dataSlot < minData) {
        return res.status(400).json({ error: "Slots devem ter no mínimo 7 dias de antecedência" });
      }

      // Entrevistador só pode criar slots para si mesmo
      // Admin pode criar para qualquer entrevistador
      const entrevistador_id = req.user!.userId;

      const [result] = await db.execute(
        `INSERT INTO slots_entrevista (entrevistador_id, data_hora, duracao_minutos)
         VALUES (?, ?, ?)`,
        [entrevistador_id, data_hora, duracao_minutos || 60]
      ) as any;

      return res.status(201).json({ id: result.insertId, message: "Slot criado com sucesso" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao criar slot" });
    }
  }
);

// DELETE /api/admin/slots/:id — remove slot (apenas se não ocupado)
adminRouter.delete(
  "/slots/:id",
  requireRole("administrador", "entrevistador", "gestor_n1"),
  async (req: Request, res: Response) => {
    const slotId = parseInt(req.params.id);
    try {
      const [rows] = await db.execute(
        "SELECT id, ocupado FROM slots_entrevista WHERE id = ?", [slotId]
      ) as any;

      if (rows.length === 0) return res.status(404).json({ error: "Slot não encontrado" });
      if (rows[0].ocupado) return res.status(400).json({ error: "Slot já agendado — não pode ser removido" });

      await db.execute("DELETE FROM slots_entrevista WHERE id = ?", [slotId]);
      return res.json({ message: "Slot removido com sucesso" });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao remover slot" });
    }
  }
);

// ── Carrossel de imagens ──────────────────────────────────────────────────────

// GET /api/admin/carrossel — público (para exibir na entrada)
adminRouter.get("/carrossel/publico", async (_req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, titulo, subtitulo, url_imagem, ordem FROM carrossel_imagens WHERE ativo = TRUE ORDER BY ordem ASC LIMIT 5"
    ) as any;
    return res.json({ imagens: rows });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar carrossel" });
  }
});

// GET /api/admin/carrossel — lista todas (admin/gestor_n1)
adminRouter.get("/carrossel",
  requireRole("administrador", "gestor_n1"),
  async (_req, res) => {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM carrossel_imagens ORDER BY ordem ASC"
      ) as any;
      return res.json({ imagens: rows });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao buscar carrossel" });
    }
  }
);

// POST /api/admin/carrossel — adiciona imagem
adminRouter.post("/carrossel",
  requireRole("administrador", "gestor_n1"),
  async (req, res) => {
    const { titulo, subtitulo, url_imagem, ordem } = req.body;
    if (!url_imagem) return res.status(400).json({ error: "URL da imagem é obrigatória" });

    try {
      // Verifica limite de 5 imagens ativas
      const [count] = await db.execute(
        "SELECT COUNT(*) as total FROM carrossel_imagens WHERE ativo = TRUE"
      ) as any;
      if (count[0].total >= 5) {
        return res.status(400).json({ error: "Limite de 5 imagens atingido. Desative uma imagem antes de adicionar." });
      }

      const [result] = await db.execute(
        "INSERT INTO carrossel_imagens (titulo, subtitulo, url_imagem, ordem, criado_por) VALUES (?, ?, ?, ?, ?)",
        [titulo || null, subtitulo || null, url_imagem, ordem || count[0].total, req.user!.userId]
      ) as any;

      return res.status(201).json({ id: result.insertId, message: "Imagem adicionada" });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao adicionar imagem" });
    }
  }
);

// PUT /api/admin/carrossel/:id — edita imagem
adminRouter.put("/carrossel/:id",
  requireRole("administrador", "gestor_n1"),
  async (req, res) => {
    const { titulo, subtitulo, url_imagem, ordem, ativo } = req.body;
    const id = parseInt(req.params.id);
    try {
      await db.execute(
        "UPDATE carrossel_imagens SET titulo=?, subtitulo=?, url_imagem=?, ordem=?, ativo=? WHERE id=?",
        [titulo, subtitulo, url_imagem, ordem, ativo ? 1 : 0, id]
      );
      return res.json({ message: "Imagem atualizada" });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao atualizar imagem" });
    }
  }
);

// DELETE /api/admin/carrossel/:id
adminRouter.delete("/carrossel/:id",
  requireRole("administrador", "gestor_n1"),
  async (req, res) => {
    try {
      await db.execute("DELETE FROM carrossel_imagens WHERE id=?", [parseInt(req.params.id)]);
      return res.json({ message: "Imagem removida" });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao remover imagem" });
    }
  }
);
