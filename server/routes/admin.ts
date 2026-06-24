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

// GET /api/admin/carrossel/publico — SEM autenticação (exibido na página de entrada)
// Esta rota é registrada ANTES do middleware requireAuth no server/index.ts
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

// ── Parametrização da Prova ───────────────────────────────────────────────────

// GET /api/admin/prova-config/:certSlug — busca config da prova
adminRouter.get("/prova-config/:certSlug", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT pc.*, ct.nome as cert_nome
       FROM prova_config pc
       JOIN certification_types ct ON ct.slug = pc.cert_slug
       WHERE pc.cert_slug = ?`,
      [req.params.certSlug]
    ) as any;
    return res.json({ config: rows[0] || null });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar configuração" });
  }
});

// GET /api/admin/prova-config — lista todas
adminRouter.get("/prova-config",
  requireRole("administrador", "gestor_n1", "avaliador"),
  async (_req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT pc.*, ct.nome as cert_nome
         FROM prova_config pc
         JOIN certification_types ct ON ct.slug = pc.cert_slug
         ORDER BY ct.numero`
      ) as any;
      return res.json({ configs: rows });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao listar configurações" });
    }
  }
);

// POST /api/admin/prova-config — cria ou atualiza config
adminRouter.post("/prova-config",
  requireRole("administrador", "gestor_n1"),
  async (req, res) => {
    const {
      cert_slug, total_questoes, duracao_minutos, nota_minima,
      max_tentativas, prazo_dias, mensagem_boas_vindas, instrucoes_extras
    } = req.body;

    if (!cert_slug) return res.status(400).json({ error: "cert_slug é obrigatório" });

    try {
      await db.execute(
        `INSERT INTO prova_config
          (cert_slug, total_questoes, duracao_minutos, nota_minima, max_tentativas,
           prazo_dias, mensagem_boas_vindas, instrucoes_extras, atualizado_por)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          total_questoes = VALUES(total_questoes),
          duracao_minutos = VALUES(duracao_minutos),
          nota_minima = VALUES(nota_minima),
          max_tentativas = VALUES(max_tentativas),
          prazo_dias = VALUES(prazo_dias),
          mensagem_boas_vindas = VALUES(mensagem_boas_vindas),
          instrucoes_extras = VALUES(instrucoes_extras),
          atualizado_por = VALUES(atualizado_por),
          atualizado_em = NOW()`,
        [cert_slug, total_questoes || 5, duracao_minutos || 30, nota_minima || 60,
         2, prazo_dias || 3, mensagem_boas_vindas || null, instrucoes_extras || null,
         req.user!.userId]
      );
      return res.json({ message: "Configuração salva com sucesso" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao salvar configuração" });
    }
  }
);

// GET /api/admin/questoes/:certSlug — lista questões
adminRouter.get("/questoes/:certSlug",
  requireRole("administrador", "gestor_n1", "avaliador"),
  async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT pq.* FROM prova_questoes pq
         JOIN provas p ON p.id = pq.prova_id
         JOIN certification_types ct ON ct.id = p.certification_type_id
         WHERE ct.slug = ?
         ORDER BY pq.numero`,
        [req.params.certSlug]
      ) as any;
      return res.json({ questoes: rows });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao listar questões" });
    }
  }
);

// POST /api/admin/questoes — adiciona questão
adminRouter.post("/questoes",
  requireRole("administrador", "gestor_n1"),
  async (req, res) => {
    const { cert_slug, enunciado, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta } = req.body;
    if (!cert_slug || !enunciado || !opcao_a || !opcao_b || resposta_correta === undefined) {
      return res.status(400).json({ error: "Campos obrigatórios: cert_slug, enunciado, opcao_a, opcao_b, resposta_correta" });
    }
    try {
      // Busca ou cria a prova para esta certificação
      const [certs] = await db.execute("SELECT id FROM certification_types WHERE slug = ?", [cert_slug]) as any;
      if (!certs.length) return res.status(404).json({ error: "Certificação não encontrada" });

      let [provas] = await db.execute(
        "SELECT id FROM provas WHERE certification_type_id = ?", [certs[0].id]
      ) as any;

      let prova_id: number;
      if (!provas.length) {
        const [r] = await db.execute(
          "INSERT INTO provas (certification_type_id, titulo) VALUES (?, ?)",
          [certs[0].id, `Prova ${cert_slug.toUpperCase()}`]
        ) as any;
        prova_id = r.insertId;
      } else {
        prova_id = provas[0].id;
      }

      // Numero sequencial
      const [count] = await db.execute(
        "SELECT COUNT(*) as total FROM prova_questoes WHERE prova_id = ?", [prova_id]
      ) as any;

      const [result] = await db.execute(
        `INSERT INTO prova_questoes (prova_id, numero, enunciado, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [prova_id, count[0].total + 1, enunciado, opcao_a, opcao_b, opcao_c || null, opcao_d || null, resposta_correta]
      ) as any;

      return res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao adicionar questão" });
    }
  }
);

// DELETE /api/admin/questoes/:id
adminRouter.delete("/questoes/:id",
  requireRole("administrador", "gestor_n1"),
  async (req, res) => {
    try {
      await db.execute("DELETE FROM prova_questoes WHERE id = ?", [parseInt(req.params.id)]);
      return res.json({ message: "Questão removida" });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao remover questão" });
    }
  }
);

// ── Fale Conosco ──────────────────────────────────────────────────────────────

// GET /api/admin/fale-conosco — lista mensagens (admin/gestor)
adminRouter.get("/fale-conosco",
  requireRole("administrador", "gestor_n1", "gestor_n2"),
  async (_req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM fale_conosco ORDER BY criado_em DESC LIMIT 100`
      ) as any;
      return res.json({ mensagens: rows });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao buscar mensagens" });
    }
  }
);

// PUT /api/admin/fale-conosco/:id/lida — marca como lida
adminRouter.put("/fale-conosco/:id/lida",
  requireRole("administrador", "gestor_n1", "gestor_n2"),
  async (req, res) => {
    try {
      await db.execute(
        "UPDATE fale_conosco SET lida = TRUE, lida_em = NOW() WHERE id = ?",
        [parseInt(req.params.id)]
      );
      return res.json({ message: "Marcada como lida" });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao atualizar" });
    }
  }
);

// ── Gestão de Candidatos ──────────────────────────────────────────────────────

// GET /api/admin/candidatos — lista todos os candidatos com processo
adminRouter.get("/candidatos",
  requireRole("administrador", "gestor_n1", "gestor_n2"),
  async (req, res) => {
    try {
      const { busca, status } = req.query as any;
      let sql = `
        SELECT
          u.id, u.full_name, u.email, u.cpf, u.is_active,
          u.created_at,
          cp.id as processo_id, cp.status_geral, cp.caminho_avaliacao,
          cp.pagamento1_realizado, cp.pagamento2_realizado,
          cp.tentativas_prova, cp.aprovado_entrevista,
          ct.nome as certificacao_nome, ct.numero as cert_numero,
          (SELECT COUNT(*) FROM tentativas_prova tp WHERE tp.user_id = u.id AND tp.aprovado = 1) as provas_aprovadas,
          (SELECT COUNT(*) FROM tentativas_prova tp WHERE tp.user_id = u.id) as total_tentativas
        FROM users u
        LEFT JOIN candidato_processos cp ON cp.user_id = u.id
        LEFT JOIN certification_types ct ON ct.id = cp.certification_type_id
        WHERE u.role_id = 1
      `;
      const params: any[] = [];

      if (busca) {
        sql += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.cpf LIKE ?)`;
        params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
      }
      if (status) {
        sql += ` AND cp.status_geral = ?`;
        params.push(status);
      }

      sql += ` ORDER BY u.created_at DESC LIMIT 200`;

      const [rows] = await db.execute(sql, params) as any;
      return res.json({ candidatos: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar candidatos" });
    }
  }
);

// GET /api/admin/candidatos/:id — detalhe do candidato
adminRouter.get("/candidatos/:id",
  requireRole("administrador", "gestor_n1", "gestor_n2"),
  async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT u.*, cp.status_geral, cp.caminho_avaliacao, cp.tentativas_prova,
                cp.pagamento1_realizado, cp.pagamento2_realizado,
                ct.nome as certificacao_nome, la.aceito_em as lgpd_aceito_em
         FROM users u
         LEFT JOIN candidato_processos cp ON cp.user_id = u.id
         LEFT JOIN certification_types ct ON ct.id = cp.certification_type_id
         LEFT JOIN lgpd_aceites la ON la.user_id = u.id
         WHERE u.id = ? AND u.role_id = 1`,
        [parseInt(req.params.id)]
      ) as any;
      if (!rows.length) return res.status(404).json({ error: "Candidato não encontrado" });
      return res.json({ candidato: rows[0] });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao buscar candidato" });
    }
  }
);

// PUT /api/admin/candidatos/:id/inativar — inativa candidato
adminRouter.put("/candidatos/:id/inativar",
  requireRole("administrador", "gestor_n1"),
  async (req, res) => {
    const { motivo } = req.body;
    const candidatoId = parseInt(req.params.id);
    try {
      const [candidato] = await db.execute(
        "SELECT full_name, email FROM users WHERE id = ? AND role_id = 1", [candidatoId]
      ) as any;
      if (!candidato.length) return res.status(404).json({ error: "Candidato não encontrado" });

      await db.execute(
        "UPDATE users SET is_active = FALSE WHERE id = ? AND role_id = 1", [candidatoId]
      );
      const descricao = `Candidato ${candidato[0].full_name} (${candidato[0].email}) inativado. Motivo: ${motivo || "Não informado"}. IP: ${req.ip}`;
      await db.execute(
        `INSERT INTO audit_log (user_id, acao, entidade, entidade_id, descricao, resultado)
         VALUES (?, 'candidato_inativado', 'users', ?, ?, 'sucesso')`,
        [req.user!.userId, candidatoId, descricao]
      );
      return res.json({ message: "Candidato inativado" });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao inativar" });
    }
  }
);

// PUT /api/admin/candidatos/:id/reativar
adminRouter.put("/candidatos/:id/reativar",
  requireRole("administrador", "gestor_n1"),
  async (req, res) => {
    const { motivo } = req.body;
    const candidatoId = parseInt(req.params.id);
    try {
      const [candidato] = await db.execute(
        "SELECT full_name, email FROM users WHERE id = ? AND role_id = 1", [candidatoId]
      ) as any;
      await db.execute(
        "UPDATE users SET is_active = TRUE WHERE id = ? AND role_id = 1", [candidatoId]
      );
      const descricao = `Candidato ${candidato[0]?.full_name} (${candidato[0]?.email}) reativado. Motivo: ${motivo || "Não informado"}. IP: ${req.ip}`;
      await db.execute(
        `INSERT INTO audit_log (user_id, acao, entidade, entidade_id, descricao, resultado)
         VALUES (?, 'candidato_reativado', 'users', ?, ?, 'sucesso')`,
        [req.user!.userId, candidatoId, descricao]
      );
      return res.json({ message: "Candidato reativado" });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao reativar" });
    }
  }
);

// DELETE /api/admin/candidatos/:id — exclusão permanente (LGPD)
adminRouter.delete("/candidatos/:id",
  requireRole("administrador"),
  async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      // Verifica se é candidato
      const [rows] = await db.execute(
        "SELECT id, full_name FROM users WHERE id = ? AND role_id = 1",
        [id]
      ) as any;
      if (!rows.length) return res.status(404).json({ error: "Candidato não encontrado" });

      const { motivo } = req.body;

      // Registra audit log ANTES de excluir (pois os dados serão removidos)
      const descricao = `EXCLUSÃO PERMANENTE: ${rows[0].full_name} (ID: ${id}). Motivo: ${motivo || "Não informado"}. IP: ${req.ip}. Esta ação é irreversível.`;
      await db.execute(
        `INSERT INTO audit_log (user_id, acao, entidade, entidade_id, descricao, resultado)
         VALUES (?, 'candidato_excluido_permanentemente', 'users', ?, ?, 'sucesso')`,
        [req.user!.userId, id, descricao]
      );

      // Exclui dados relacionados em ordem
      await db.execute("DELETE FROM lgpd_aceites WHERE user_id = ?", [id]);
      await db.execute("DELETE FROM fale_conosco WHERE user_id = ?", [id]);
      await db.execute("DELETE FROM tentativas_prova WHERE user_id = ?", [id]);
      await db.execute("DELETE FROM candidato_processos WHERE user_id = ?", [id]);
      await db.execute("DELETE FROM users WHERE id = ?", [id]);

      return res.json({ message: `Candidato ${rows[0].full_name} excluído permanentemente` });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao excluir candidato" });
    }
  }
);

// POST /api/admin/lgpd/aceite — registra aceite LGPD
adminRouter.post("/lgpd/aceite", async (req: any, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Não autenticado" });
    await db.execute(
      "INSERT INTO lgpd_aceites (user_id, ip_address, versao_politica) VALUES (?, ?, '1.0')",
      [userId, req.ip]
    );
    return res.json({ message: "Aceite registrado" });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao registrar aceite" });
  }
});

// ── Resultado da Entrevista ───────────────────────────────────────────────────

// POST /api/admin/entrevista/:processoId/resultado
adminRouter.post("/entrevista/:processoId/resultado",
  requireRole("administrador", "gestor_n1", "entrevistador"),
  async (req, res) => {
    const processoId = parseInt(req.params.processoId);
    const { decisao, observacoes } = req.body; // decisao: "habilitado" | "nao_habilitado"

    if (!decisao || !["habilitado", "nao_habilitado"].includes(decisao)) {
      return res.status(400).json({ error: "Decisão inválida. Use 'habilitado' ou 'nao_habilitado'" });
    }

    try {
      // Busca processo e dados do candidato
      const [processos] = await db.execute(
        `SELECT cp.*, u.full_name, u.email, ct.nome as cert_nome
         FROM candidato_processos cp
         JOIN users u ON u.id = cp.user_id
         JOIN certification_types ct ON ct.id = cp.certification_type_id
         WHERE cp.id = ?`,
        [processoId]
      ) as any;

      if (!processos.length) {
        return res.status(404).json({ error: "Processo não encontrado" });
      }

      const processo = processos[0];
      const habilitado = decisao === "habilitado";

      // Atualiza status do processo
      const novoStatus = habilitado ? "pagamento2" : "encerrado";
      await db.execute(
        `UPDATE candidato_processos
         SET aprovado_entrevista = ?, status_geral = ?, updated_at = NOW()
         WHERE id = ?`,
        [habilitado ? 1 : 0, novoStatus, processoId]
      );

      // Audit log
      await db.execute(
        `INSERT INTO audit_log (user_id, processo_id, acao, entidade, entidade_id, descricao, resultado)
         VALUES (?, ?, ?, 'candidato_processos', ?, ?, 'sucesso')`,
        [
          req.user!.userId,
          processoId,
          habilitado ? "entrevista_habilitado" : "entrevista_nao_habilitado",
          processoId,
          `${processo.full_name} ${habilitado ? "HABILITADO" : "NÃO HABILITADO"} na entrevista. ${observacoes ? "Obs: " + observacoes : ""}`
        ]
      );

      // Envia email ao candidato
      const appUrl = process.env.APP_URL || "https://certificacao-cca-staging.up.railway.app";

      if (habilitado) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.FROM_EMAIL || "ANEFAC <noreply@ckmtalents.net>",
            to: [processo.email],
            subject: `🎓 Parabéns! Você foi habilitado na certificação ${processo.cert_nome}`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
                <div style="background:linear-gradient(135deg,#0a1f5e,#1565c0);padding:32px;border-radius:16px 16px 0 0;text-align:center">
                  <img src="${appUrl}/logo-anefac.png" alt="ANEFAC" style="height:50px;margin-bottom:16px" />
                  <h1 style="color:white;margin:0;font-size:24px">Parabéns, ${processo.full_name.split(" ")[0]}!</h1>
                  <p style="color:#93c5fd;margin:8px 0 0;font-size:16px">Você foi habilitado na sua entrevista!</p>
                </div>
                <div style="background:white;padding:32px;border:1px solid #e2e8f0;border-top:none">
                  <p style="color:#374151;font-size:16px">
                    É com grande satisfação que informamos que você foi <strong>aprovado e habilitado</strong> na entrevista técnica do processo de certificação <strong>${processo.cert_nome}</strong>.
                  </p>
                  <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px;margin:24px 0;text-align:center">
                    <p style="color:#15803d;font-size:18px;font-weight:bold;margin:0">✅ Resultado: HABILITADO</p>
                  </div>
                  <p style="color:#374151;">
                    O próximo passo é realizar o <strong>pagamento da taxa de emissão do certificado</strong>. 
                    Acesse sua área de candidato clicando no botão abaixo:
                  </p>
                  <div style="text-align:center;margin:28px 0">
                    <a href="${appUrl}/novo-fluxo"
                       style="background:linear-gradient(135deg,#0a1f5e,#1565c0);color:white;padding:16px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block">
                      Acessar minha área e pagar →
                    </a>
                  </div>
                  <p style="color:#6b7280;font-size:14px;">
                    Após a confirmação do pagamento, seu certificado será emitido em até 5 dias úteis.
                  </p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
                  <p style="color:#9ca3af;font-size:12px;text-align:center">
                    Em caso de dúvidas, acesse o <a href="${appUrl}/novo-fluxo" style="color:#1565c0">Fale Conosco</a> na plataforma.
                    <br/>ANEFAC — Associação Nacional dos Executivos de Finanças, Administração e Contabilidade
                  </p>
                </div>
              </div>
            `,
          }),
        });
      } else {
        // Email de não habilitado
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.FROM_EMAIL || "ANEFAC <noreply@ckmtalents.net>",
            to: [processo.email],
            subject: `Resultado da entrevista — ${processo.cert_nome}`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
                <div style="background:linear-gradient(135deg,#0a1f5e,#1565c0);padding:32px;border-radius:16px 16px 0 0;text-align:center">
                  <h1 style="color:white;margin:0;font-size:22px">Resultado da Entrevista</h1>
                  <p style="color:#93c5fd;margin:8px 0 0">${processo.cert_nome}</p>
                </div>
                <div style="background:white;padding:32px;border:1px solid #e2e8f0;border-top:none">
                  <p style="color:#374151">Olá, <strong>${processo.full_name.split(" ")[0]}</strong>!</p>
                  <p style="color:#374151;">
                    Agradecemos sua participação no processo de certificação ANEFAC. Após análise da banca examinadora, informamos que o resultado da sua entrevista técnica foi:
                  </p>
                  <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;padding:20px;margin:24px 0;text-align:center">
                    <p style="color:#dc2626;font-size:18px;font-weight:bold;margin:0">Resultado: Não habilitado nesta etapa</p>
                  </div>
                  <p style="color:#374151;">
                    Você poderá verificar novos processos de certificação em edições futuras. Para dúvidas, use o Fale Conosco.
                  </p>
                  <div style="text-align:center;margin:24px 0">
                    <a href="${appUrl}/novo-fluxo"
                       style="background:#6b7280;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;display:inline-block">
                      Acessar a plataforma
                    </a>
                  </div>
                  <p style="color:#9ca3af;font-size:12px;text-align:center">
                    ANEFAC — Associação Nacional dos Executivos de Finanças, Administração e Contabilidade
                  </p>
                </div>
              </div>
            `,
          }),
        });
      }

      return res.json({
        message: habilitado
          ? "Candidato habilitado! E-mail de pagamento enviado automaticamente."
          : "Resultado registrado. E-mail de não habilitação enviado ao candidato.",
        novo_status: novoStatus,
        email_enviado: true,
      });
    } catch (err) {
      console.error("Erro resultado entrevista:", err);
      return res.status(500).json({ error: "Erro ao registrar resultado" });
    }
  }
);

// GET /api/admin/entrevista/pendentes — candidatos aguardando resultado
adminRouter.get("/entrevista/pendentes",
  requireRole("administrador", "gestor_n1", "entrevistador"),
  async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT cp.id as processo_id, cp.status_geral, cp.caminho_avaliacao,
                u.full_name, u.email, ct.nome as cert_nome,
                ae.data_hora as entrevista_data
         FROM candidato_processos cp
         JOIN users u ON u.id = cp.user_id
         JOIN certification_types ct ON ct.id = cp.certification_type_id
         LEFT JOIN agendamentos_entrevista ae ON ae.processo_id = cp.id
         WHERE cp.status_geral IN ('entrevista', 'agendamento')
         ORDER BY ae.data_hora ASC`,
      ) as any;
      return res.json({ pendentes: rows });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao buscar pendentes" });
    }
  }
);

// GET /api/admin/validacao/pendentes — candidatos aguardando validação documental com seus docs
adminRouter.get("/validacao/pendentes",
  requireRole("administrador", "gestor_n1", "gestor_n2", "avaliador"),
  async (_req, res) => {
    try {
      const [candidatos] = await db.execute(
        `SELECT cp.id as processo_id, cp.user_id, cp.status_geral,
                u.full_name, u.email,
                ct.nome as cert_nome, ct.slug as cert_slug
         FROM candidato_processos cp
         JOIN users u ON u.id = cp.user_id
         JOIN certification_types ct ON ct.id = cp.certification_type_id
         WHERE cp.status_geral = 'validacao'
         ORDER BY cp.updated_at ASC`
      ) as any;

      // Para cada candidato, busca os documentos enviados
      const resultado = await Promise.all(
        candidatos.map(async (c: any) => {
          const [docs] = await db.execute(
            `SELECT id, tipo_documento, nome_arquivo, caminho_arquivo, tamanho_bytes, status, criado_em
             FROM documentos_candidato
             WHERE user_id = ?
             ORDER BY criado_em DESC`,
            [c.user_id]
          ) as any;
          return { ...c, documentos: docs };
        })
      );

      return res.json({ candidatos: resultado });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar candidatos em validação" });
    }
  }
);

// POST /api/admin/validacao/:processoId/decisao — registra decisão documental
adminRouter.post("/validacao/:processoId/decisao",
  requireRole("administrador", "gestor_n1", "gestor_n2", "avaliador"),
  async (req, res) => {
    const processoId = parseInt(req.params.processoId);
    const { caminho, parecer_geral } = req.body; // caminho: "A" | "B" | "reprovado"

    if (!caminho || !["A", "B", "reprovado"].includes(caminho)) {
      return res.status(400).json({ error: "Caminho inválido. Use A, B ou reprovado" });
    }

    try {
      const [processos] = await db.execute(
        `SELECT cp.*, u.full_name, u.email, ct.nome as cert_nome
         FROM candidato_processos cp
         JOIN users u ON u.id = cp.user_id
         JOIN certification_types ct ON ct.id = cp.certification_type_id
         WHERE cp.id = ?`,
        [processoId]
      ) as any;

      if (!processos.length) return res.status(404).json({ error: "Processo não encontrado" });

      const processo = processos[0];
      let novoStatus: string;
      let novoCaminho: string | null = null;

      if (caminho === "reprovado") {
        novoStatus = "encerrado";
      } else if (caminho === "A") {
        novoStatus = "entrevista";
        novoCaminho = "A";
      } else {
        novoStatus = "prova";
        novoCaminho = "B";
      }

      await db.execute(
        `UPDATE candidato_processos
         SET status_geral = ?, caminho_avaliacao = ?, updated_at = NOW()
         WHERE id = ?`,
        [novoStatus, novoCaminho, processoId]
      );

      await db.execute(
        `INSERT INTO audit_log (user_id, processo_id, acao, entidade, entidade_id, descricao, resultado)
         VALUES (?, ?, 'validacao_documental', 'candidato_processos', ?, ?, 'sucesso')`,
        [
          (req as any).user!.userId,
          processoId,
          processoId,
          `Candidato ${processo.full_name} — Caminho ${caminho}. ${parecer_geral || ""}`
        ]
      );

      return res.json({ message: "Decisão registrada", novo_status: novoStatus, caminho });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao registrar decisão" });
    }
  }
);
