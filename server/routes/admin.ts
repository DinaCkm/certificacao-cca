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

// POST /api/fale-conosco — público, qualquer pessoa pode enviar
adminRouter.post("/fale-conosco/enviar", async (req, res) => {
  const { nome, email, mensagem, pagina_origem } = req.body;
  if (!nome || !email || !mensagem) {
    return res.status(400).json({ error: "Nome, e-mail e mensagem são obrigatórios" });
  }
  try {
    const userId = (req as any).user?.userId || null;
    await db.execute(
      `INSERT INTO fale_conosco (nome, email, mensagem, user_id, pagina_origem)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, email, mensagem, userId, pagina_origem || null]
    );
    return res.json({ message: "Mensagem enviada com sucesso!" });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

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
    try {
      await db.execute(
        "UPDATE users SET is_active = FALSE WHERE id = ? AND role_id = 1",
        [parseInt(req.params.id)]
      );
      await db.execute(
        `INSERT INTO audit_log (user_id, acao, entidade, entidade_id, descricao, resultado)
         VALUES (?, 'candidato_inativado', 'users', ?, 'Candidato inativado por LGPD', 'sucesso')`,
        [req.user!.userId, parseInt(req.params.id)]
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
    try {
      await db.execute(
        "UPDATE users SET is_active = TRUE WHERE id = ? AND role_id = 1",
        [parseInt(req.params.id)]
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
