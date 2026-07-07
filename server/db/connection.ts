import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não definida nas variáveis de ambiente");
}

export const db = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "-03:00",
});

export async function testConnection() {
  try {
    const conn = await db.getConnection();
    await conn.ping();
    conn.release();
    console.log("✅ MySQL conectado com sucesso");
    await runMigrations();
    await runValidacaoMigrations();
    await runSolicitacaoDocumentosMigrations();
    await runCursosMigrations();
    await runDocumentosExigidosMigration();
    await runPerfilCandidatoMigration();
  } catch (err) {
    console.error("❌ Erro ao conectar ao MySQL:", err);
    process.exit(1);
  }
}

async function runMigrations() {
  try {
    // Verifica se a tabela tem as colunas corretas
    const [cols] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'documentos_candidato'
    `) as any;
    const existentes: string[] = cols.map((c: any) => c.COLUMN_NAME.toLowerCase());

    const precisaRecriar = !existentes.includes("nome_arquivo") ||
                           !existentes.includes("tipo_documento") ||
                           !existentes.includes("caminho_arquivo");

    if (precisaRecriar && existentes.length > 0) {
      console.log("⚠️ Tabela documentos_candidato com estrutura incorreta — recriando...");
      await db.execute("DROP TABLE documentos_candidato");
    }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS documentos_candidato (
        id INT AUTO_INCREMENT PRIMARY KEY,
        processo_id INT NULL,
        user_id INT NOT NULL,
        tipo_documento VARCHAR(50) NOT NULL DEFAULT 'documento',
        nome_arquivo VARCHAR(255) NOT NULL DEFAULT '',
        caminho_arquivo VARCHAR(255) NOT NULL DEFAULT '',
        tamanho_bytes INT NOT NULL DEFAULT 0,
        mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
        status ENUM('enviado','aprovado','reprovado') NOT NULL DEFAULT 'enviado',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_processo_id (processo_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log("✅ Tabela documentos_candidato OK");

    // Garante que roles básicos existem
    const rolesBasicos = [
      ["administrador", "Administrador", "Acesso total ao sistema"],
      ["gestor_n1", "Gestor Nível 1", "Gestão de candidatos e validações"],
      ["gestor_n2", "Gestor Nível 2", "Validação e entrevistas"],
      ["avaliador", "Avaliador", "Valida documentos dos candidatos"],
      ["entrevistador", "Entrevistador", "Realiza entrevistas técnicas"],
      ["candidato", "Candidato", "Candidato à certificação"],
    ];
    for (const [code, nome, descricao] of rolesBasicos) {
      await db.execute(
        `INSERT IGNORE INTO roles (code, nome, descricao) VALUES (?, ?, ?)`,
        [code, nome, descricao]
      );
    }
    console.log("✅ Roles básicos verificados");

    // ── Permissões de menu por perfil ────────────────────────────────────────
    // Controla quais itens do menu (Ações Rápidas + navbar admin) cada perfil
    // enxerga. NULL = ainda não configurado; nesse caso o backend aplica um
    // padrão sensato na primeira leitura (ver GET /admin/roles/menu-permissoes).
    // Usa checagem via INFORMATION_SCHEMA em vez de "ADD COLUMN IF NOT EXISTS"
    // porque essa sintaxe só existe a partir do MySQL 8.0.29 — em versões
    // anteriores ela gera erro de sintaxe, que ficava mascarado pelo try/catch
    // e deixava a coluna ausente, quebrando o login (SELECT com coluna inexistente).
    try {
      const [colsRoles] = await db.execute(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'roles'
      `) as any;
      const colunasRoles: string[] = colsRoles.map((c: any) => c.COLUMN_NAME.toLowerCase());
      if (!colunasRoles.includes("menu_permissoes")) {
        await db.execute(`ALTER TABLE roles ADD COLUMN menu_permissoes JSON NULL`);
        console.log("✅ Coluna roles.menu_permissoes criada");
      }
    } catch (alterErr) {
      console.error("❌ Erro ao criar coluna roles.menu_permissoes:", (alterErr as any)?.message);
    }

    const defaultsPorRole: Record<string, string[]> = {
      administrador: ["validacao", "resultado_entrevista", "entrevistas", "fale_conosco", "candidatos", "perfis", "prova", "usuarios", "carrossel", "certificacoes", "site", "institucional", "cursos"],
      gestor_n1: ["validacao", "resultado_entrevista", "entrevistas", "fale_conosco", "candidatos", "perfis", "prova", "usuarios", "carrossel", "certificacoes", "site", "institucional", "cursos"],
      gestor_n2: ["validacao", "resultado_entrevista", "entrevistas", "fale_conosco", "candidatos", "certificacoes"],
      avaliador: ["validacao"],
      entrevistador: ["entrevistas", "resultado_entrevista"],
      candidato: [],
    };
    for (const [code, itens] of Object.entries(defaultsPorRole)) {
      await db.execute(
        `UPDATE roles SET menu_permissoes = ? WHERE code = ? AND menu_permissoes IS NULL`,
        [JSON.stringify(itens), code]
      );
    }
    console.log("✅ Permissões de menu padrão verificadas");

    // Garante que status_geral aceita todos os valores necessários
    try {
      // Modifica o ENUM para incluir todos os valores
      await db.execute(`
        ALTER TABLE candidato_processos
        MODIFY COLUMN status_geral ENUM(
          'selecao','cadastro','pagamento1','upload','validacao',
          'agendamento','entrevista','prova','pagamento2','emissao',
          'concluido','encerrado'
        ) NOT NULL DEFAULT 'selecao'
      `);
      console.log("✅ ENUM status_geral atualizado");
    } catch (enumErr) {
      // Ignora erro se o ENUM já está correto
      console.warn("⚠️ ALTER TABLE ENUM (pode já estar correto):", (enumErr as any)?.message);
    }
  } catch (err) {
    console.error("⚠️ Erro na migração:", err);
  }
}

export async function runValidacaoMigrations() {
  try {
    // Tabela principal de avaliações duplas
    await db.execute(`
      CREATE TABLE IF NOT EXISTS validacao_documental (
        id INT AUTO_INCREMENT PRIMARY KEY,
        processo_id INT NOT NULL,
        documento_idx INT NOT NULL COMMENT 'índice do documento (0,1,2...)',
        documento_nome VARCHAR(255) NOT NULL,

        -- Avaliador 1
        avaliador1_id INT NULL,
        avaliador1_nome VARCHAR(255) NULL,
        avaliador1_aprovado TINYINT(1) NULL COMMENT '1=aprovado, 0=reprovado',
        avaliador1_parecer TEXT NULL,
        avaliador1_at TIMESTAMP NULL,

        -- Avaliador 2
        avaliador2_id INT NULL,
        avaliador2_nome VARCHAR(255) NULL,
        avaliador2_aprovado TINYINT(1) NULL COMMENT '1=aprovado, 0=reprovado',
        avaliador2_parecer TEXT NULL,
        avaliador2_at TIMESTAMP NULL,

        -- Checklist (JSON com itens e respostas de cada avaliador)
        checklist_av1 JSON NULL,
        checklist_av2 JSON NULL,

        -- Resultado
        status ENUM('pendente','av1_concluido','av2_concluido','aprovado','reprovado','desempate') 
               NOT NULL DEFAULT 'pendente',
        decisao_admin_id INT NULL,
        decisao_admin_at TIMESTAMP NULL,

        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        UNIQUE KEY uk_processo_doc (processo_id, documento_idx),
        INDEX idx_processo_id (processo_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Tabela de avaliadores atribuídos a um processo
    await db.execute(`
      CREATE TABLE IF NOT EXISTS validacao_avaliadores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        processo_id INT NOT NULL,
        user_id INT NOT NULL,
        numero_avaliador TINYINT NOT NULL COMMENT '1 ou 2',
        atribuido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_processo_user (processo_id, user_id),
        UNIQUE KEY uk_processo_numero (processo_id, numero_avaliador)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log("✅ Tabelas de validação dupla verificadas/criadas");
  } catch (err) {
    console.warn("⚠️ Erro nas migrações de validação dupla:", err);
  }
}

// ─── Solicitação de documentos complementares ───────────────────────────────────
// Permite ao avaliador pedir, dentro do sistema, que o candidato envie documentos
// adicionais antes de fechar o parecer — sem depender de anexo por e-mail.
export async function runSolicitacaoDocumentosMigrations() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS solicitacoes_documentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        processo_id INT NOT NULL,
        solicitado_por_id INT NOT NULL,
        solicitado_por_nome VARCHAR(255) NOT NULL,
        mensagem TEXT NOT NULL,
        status ENUM('pendente','atendida','revisada') NOT NULL DEFAULT 'pendente',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atendida_em TIMESTAMP NULL,
        revisada_em TIMESTAMP NULL,
        INDEX idx_processo_id (processo_id),
        INDEX idx_status (status),
        INDEX idx_solicitado_por (solicitado_por_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Tabela solicitacoes_documentos verificada/criada");

    // Garante que instalações antigas (antes da coluna 'revisada') sejam atualizadas
    try {
      await db.execute(`
        ALTER TABLE solicitacoes_documentos
        MODIFY COLUMN status ENUM('pendente','atendida','revisada') NOT NULL DEFAULT 'pendente'
      `);

      const [colsSolic] = await db.execute(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'solicitacoes_documentos'
      `) as any;
      const colunasSolic: string[] = colsSolic.map((c: any) => c.COLUMN_NAME.toLowerCase());
      if (!colunasSolic.includes("revisada_em")) {
        await db.execute(`ALTER TABLE solicitacoes_documentos ADD COLUMN revisada_em TIMESTAMP NULL`);
        console.log("✅ Coluna solicitacoes_documentos.revisada_em criada");
      }
      // Vincula a solicitação a um documento específico (índice na lista de
      // documentos exigidos) — antes era só uma mensagem solta pro processo
      // inteiro, então o sistema não sabia QUAL documento travar enquanto
      // aguardava o candidato reenviar.
      if (!colunasSolic.includes("documento_idx")) {
        await db.execute(`ALTER TABLE solicitacoes_documentos ADD COLUMN documento_idx INT NULL`);
        console.log("✅ Coluna solicitacoes_documentos.documento_idx criada");
      }
    } catch (alterErr) {
      console.warn("⚠️ ALTER TABLE solicitacoes_documentos (pode já estar correto):", (alterErr as any)?.message);
    }
  } catch (err) {
    console.warn("⚠️ Erro na migração de solicitacoes_documentos:", err);
  }
}

// ─── Perfil profissional do candidato (empresa, cargo, formação etc.) ──────────
// Antes esses dados só existiam no localStorage do navegador que preencheu o
// Cadastro (anefac_candidato_dados) — nunca chegavam ao banco. Por isso, ao
// logar em outro navegador (ou pra iniciar uma nova certificação), o
// candidato via os campos em branco e tinha que redigitar tudo de novo,
// mesmo tendo acabado de informar isso na certificação anterior.
export async function runPerfilCandidatoMigration() {
  try {
    const [cols] = await db.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`
    ) as any;
    const nomes: string[] = cols.map((c: any) => c.COLUMN_NAME.toLowerCase());

    const novasColunas: [string, string][] = [
      ["company", "VARCHAR(255) NULL"],
      ["job_title", "VARCHAR(255) NULL"],
      ["education", "VARCHAR(255) NULL"],
      ["experience_years", "VARCHAR(20) NULL"],
      ["linkedin_url", "VARCHAR(255) NULL"],
    ];

    for (const [coluna, definicao] of novasColunas) {
      if (!nomes.includes(coluna)) {
        await db.execute(`ALTER TABLE users ADD COLUMN ${coluna} ${definicao}`);
        console.log(`✅ Coluna users.${coluna} criada`);
      }
    }
  } catch (err) {
    console.warn("⚠️ Erro na migração de perfil do candidato:", err);
  }
}
// Antes esses dados viviam só no localStorage do navegador (cada admin via uma
// versão diferente, e o link de compra nunca chegava no navegador do aluno).
// Agora tudo fica no banco, e cada clique em "Comprar" é registrado — seja o
// curso interno (nossa página de pagamento) ou externo (Hotmart/Kiwify/Eduzz) —
// para alimentar o relatório de acesso/compra no admin.
export async function runCursosMigrations() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cursos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT NULL,
        descricao_breve VARCHAR(500) NULL,
        categoria ENUM('controller','lideranca','financas','outros') NOT NULL DEFAULT 'outros',
        nivel ENUM('iniciante','intermediario','avancado') NOT NULL DEFAULT 'iniciante',
        duracao VARCHAR(50) NULL,
        instrutor VARCHAR(255) NULL,
        imagem_url VARCHAR(500) NULL,
        tipo ENUM('interno','externo') NOT NULL DEFAULT 'externo',
        link_compra VARCHAR(500) NULL COMMENT 'obrigatório quando tipo=externo',
        preco DECIMAL(10,2) NOT NULL DEFAULT 0,
        certificacao_relacionada VARCHAR(50) NULL,
        destaque TINYINT(1) NOT NULL DEFAULT 0,
        ativo TINYINT(1) NOT NULL DEFAULT 1,
        ordem INT NOT NULL DEFAULT 0,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ativo (ativo),
        INDEX idx_categoria (categoria)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS pacotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT NULL,
        preco DECIMAL(10,2) NOT NULL DEFAULT 0,
        tipo ENUM('interno','externo') NOT NULL DEFAULT 'externo',
        link_compra VARCHAR(500) NULL,
        curso_ids JSON NULL COMMENT 'array de IDs de cursos incluídos',
        ativo TINYINT(1) NOT NULL DEFAULT 1,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Registro de cada clique em "Comprar" — candidato logado OU visitante anônimo
    // (identificado por sessao_id gerado no navegador). Para curso externo nunca
    // sabemos se a compra de fato aconteceu (fica registrado só o redirecionamento).
    // Para curso interno, comprou é atualizado quando o pagamento simulado é concluído.
    await db.execute(`
      CREATE TABLE IF NOT EXISTS curso_cliques (
        id INT AUTO_INCREMENT PRIMARY KEY,
        curso_id INT NULL,
        curso_titulo VARCHAR(255) NOT NULL COMMENT 'snapshot do título no momento do clique',
        tipo_destino ENUM('interno','externo') NOT NULL,
        link_destino VARCHAR(500) NULL,
        candidato_id INT NULL COMMENT 'preenchido se o clique veio de um usuário logado',
        sessao_id VARCHAR(64) NULL COMMENT 'identifica visitante anônimo (sem login)',
        comprou TINYINT(1) NULL COMMENT 'NULL = indefinido/externo, 0 = não comprou, 1 = comprou (só curso interno)',
        data_compra TIMESTAMP NULL,
        ip VARCHAR(64) NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_curso_id (curso_id),
        INDEX idx_candidato_id (candidato_id),
        INDEX idx_tipo_destino (tipo_destino),
        INDEX idx_criado_em (criado_em)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log("✅ Tabelas de cursos, pacotes e cliques verificadas/criadas");
  } catch (err) {
    console.warn("⚠️ Erro na migração de cursos/pacotes/cliques:", err);
  }
}

// ─── Documentos exigidos por certificação ──────────────────────────────────────
// Antes esse campo vivia só no localStorage da tela de admin "Editar Certificação"
// (conteúdo de marketing/CMS client-side), então nunca chegava no navegador do
// candidato. Agora fica em certification_types, ligado por slug, e serve de
// fonte da verdade para a tela real de Upload de Documentos. Limite: 10 itens.
export async function runDocumentosExigidosMigration() {
  try {
    const [cols] = await db.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'certification_types'`
    ) as any;
    const nomes: string[] = cols.map((c: any) => c.COLUMN_NAME.toLowerCase());
    if (!nomes.includes("documentos_exigidos")) {
      await db.execute(`ALTER TABLE certification_types ADD COLUMN documentos_exigidos JSON NULL`);
      console.log("✅ Coluna certification_types.documentos_exigidos criada");
    }
    // status permite "excluir" uma certificação sem apagar a linha do banco —
    // candidatos com processo já vinculado (FK certification_type_id) não
    // podem ficar órfãos. "Excluir" no admin só marca como inativa, o que já
    // bloqueia novas seleções (ver SelecionarCertificacao.tsx).
    if (!nomes.includes("status")) {
      await db.execute(
        `ALTER TABLE certification_types ADD COLUMN status
         ENUM('ativa','em_breve','inativa','encerrada') NOT NULL DEFAULT 'ativa'`
      );
      console.log("✅ Coluna certification_types.status criada");
    }
  } catch (err) {
    console.warn("⚠️ Erro na migração de documentos_exigidos/status (certification_types pode não existir ainda):", err);
  }
}
