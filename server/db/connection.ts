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
    await runProvaAgendamentoMigrations();
    await runSimulacoesMigrations();
    await runInstitucionalConfigMigration();
    await runEixosConhecimentoMigration();
    await runRelatorioProvaMenuMigration();
    await runAvaliadoresCertificacaoMigration();
    await runEditalComiteMigration();
    await runCertificadosMigration();
    await runAssinaturaCondutaMigration();
    await runMagicLinkMigration();
  } catch (err) {
    console.error("❌ Erro ao conectar ao MySQL:", err);
    process.exit(1);
  }
}

async function runMigrations() {
  try {
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

    // Se a tabela já existia de uma versão anterior sem alguma dessas colunas,
    // ADICIONA a coluna que falta — NUNCA apaga a tabela. Apagar destruiria
    // o vínculo de todos os documentos já enviados pelos candidatos.
    const [cols] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'documentos_candidato'
    `) as any;
    const existentes: string[] = cols.map((c: any) => c.COLUMN_NAME.toLowerCase());

    const colunasEsperadas: Record<string, string> = {
      tipo_documento: "VARCHAR(50) NOT NULL DEFAULT 'documento'",
      nome_arquivo: "VARCHAR(255) NOT NULL DEFAULT ''",
      caminho_arquivo: "VARCHAR(255) NOT NULL DEFAULT ''",
      tamanho_bytes: "INT NOT NULL DEFAULT 0",
      mime_type: "VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream'",
      status: "ENUM('enviado','aprovado','reprovado') NOT NULL DEFAULT 'enviado'",
    };
    for (const [coluna, definicao] of Object.entries(colunasEsperadas)) {
      if (!existentes.includes(coluna)) {
        await db.execute(`ALTER TABLE documentos_candidato ADD COLUMN ${coluna} ${definicao}`);
        console.log(`✅ Coluna documentos_candidato.${coluna} criada (tabela preservada)`);
      }
    }

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

    // Garante que status_geral aceita todos os valores necessários — só
    // roda o ALTER se o ENUM atual realmente não tiver todos os valores
    // (antes rodava incondicionalmente em TODO boot, mascarado por
    // try/catch; ALTER TABLE MODIFY em ENUM pode reconstruir a tabela
    // dependendo da versão do MySQL, então rodar sem necessidade é um
    // risco desnecessário).
    try {
      const valoresNecessarios = [
        "selecao", "cadastro", "pagamento1", "upload", "validacao",
        "agendamento", "entrevista", "prova", "pagamento2", "emissao",
        "concluido", "encerrado",
      ];
      const [colInfo] = await db.execute(`
        SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'candidato_processos' AND COLUMN_NAME = 'status_geral'
      `) as any;

      const tipoAtual: string = colInfo[0]?.COLUMN_TYPE || "";
      const regexValor = /'([^']+)'/g;
      const valoresAtuais: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = regexValor.exec(tipoAtual)) !== null) valoresAtuais.push(m[1]);
      const faltando = valoresNecessarios.filter((v) => !valoresAtuais.includes(v));

      if (faltando.length > 0) {
        await db.execute(`
          ALTER TABLE candidato_processos
          MODIFY COLUMN status_geral ENUM(
            'selecao','cadastro','pagamento1','upload','validacao',
            'agendamento','entrevista','prova','pagamento2','emissao',
            'concluido','encerrado'
          ) NOT NULL DEFAULT 'selecao'
        `);
        console.log(`✅ ENUM status_geral atualizado (adicionados: ${faltando.join(", ")})`);
      }
    } catch (enumErr) {
      console.warn("⚠️ Erro ao verificar/atualizar ENUM status_geral:", (enumErr as any)?.message);
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

// ─── Prova autônoma com sala de vídeo ao vivo (Daily.co) ──────────────────────
// Antes a prova era feita sem fiscalização; agora o candidato agenda um
// horário em uma "sala" (com até N candidatos + 1 fiscal), a sala vira uma
// sala de vídeo Daily.co com gravação automática, e violações (troca de aba/
// saída de fullscreen) são registradas e anulam a tentativa na 3ª ocorrência.
export async function runProvaAgendamentoMigrations() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS salas_prova (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certification_type_id INT NOT NULL,
        data_hora DATETIME NOT NULL,
        duracao_minutos INT NOT NULL DEFAULT 60,
        capacidade_maxima INT NOT NULL DEFAULT 5,
        fiscal_id INT NULL,
        daily_room_name VARCHAR(255) NULL,
        daily_room_url VARCHAR(500) NULL,
        status ENUM('agendada','em_andamento','concluida','cancelada') NOT NULL DEFAULT 'agendada',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_data_hora (data_hora),
        INDEX idx_status (status),
        INDEX idx_cert (certification_type_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS agendamentos_prova (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sala_id INT NOT NULL,
        processo_id INT NOT NULL,
        user_id INT NOT NULL,
        status ENUM('agendado','presente','ausente','cancelado') NOT NULL DEFAULT 'agendado',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_sala_user (sala_id, user_id),
        INDEX idx_processo (processo_id),
        INDEX idx_user (user_id),
        INDEX idx_sala (sala_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS violacoes_prova (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tentativa_id INT NOT NULL,
        tipo ENUM('troca_aba','saida_fullscreen') NOT NULL,
        ocorrido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tentativa (tentativa_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS gravacoes_prova (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sala_id INT NOT NULL,
        tentativa_id INT NULL,
        daily_recording_id VARCHAR(255) NULL,
        caminho_arquivo VARCHAR(500) NULL,
        tamanho_bytes BIGINT NULL,
        status ENUM('processando','disponivel','baixada','arquivada') NOT NULL DEFAULT 'processando',
        baixada_em TIMESTAMP NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_daily_recording (daily_recording_id),
        INDEX idx_sala (sala_id),
        INDEX idx_tentativa (tentativa_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log("✅ Tabelas de agendamento/sala/gravação de prova verificadas/criadas");

    // Colunas novas em tentativas_prova (idempotente via INFORMATION_SCHEMA)
    const [cols] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tentativas_prova'
    `) as any;
    const existentes: string[] = cols.map((c: any) => c.COLUMN_NAME.toLowerCase());

    if (!existentes.includes("sala_id")) {
      await db.execute(`ALTER TABLE tentativas_prova ADD COLUMN sala_id INT NULL`);
      console.log("✅ Coluna tentativas_prova.sala_id criada");
    }
    if (!existentes.includes("violacoes_count")) {
      await db.execute(`ALTER TABLE tentativas_prova ADD COLUMN violacoes_count INT NOT NULL DEFAULT 0`);
      console.log("✅ Coluna tentativas_prova.violacoes_count criada");
    }
    if (!existentes.includes("anulada")) {
      await db.execute(`ALTER TABLE tentativas_prova ADD COLUMN anulada TINYINT(1) NOT NULL DEFAULT 0`);
      console.log("✅ Coluna tentativas_prova.anulada criada");
    }
    if (!existentes.includes("anulada_motivo")) {
      await db.execute(`ALTER TABLE tentativas_prova ADD COLUMN anulada_motivo VARCHAR(255) NULL`);
      console.log("✅ Coluna tentativas_prova.anulada_motivo criada");
    }
    if (!existentes.includes("anulada_em")) {
      await db.execute(`ALTER TABLE tentativas_prova ADD COLUMN anulada_em TIMESTAMP NULL`);
      console.log("✅ Coluna tentativas_prova.anulada_em criada");
    }

    // status precisa aceitar 'anulada' além dos valores já usados
    try {
      await db.execute(`
        ALTER TABLE tentativas_prova
        MODIFY COLUMN status ENUM('em_andamento','finalizada','anulada') NOT NULL DEFAULT 'em_andamento'
      `);
    } catch (enumErr) {
      console.warn("⚠️ ALTER ENUM tentativas_prova.status (pode já estar correto):", (enumErr as any)?.message);
    }

    // Role "fiscal" — acompanha a prova ao vivo (fiscal de sala)
    await db.execute(
      `INSERT IGNORE INTO roles (code, nome, descricao) VALUES ('fiscal', 'Fiscal de Prova', 'Acompanha a prova ao vivo e monitora violações')`
    );

    // Item de menu "provas_agendadas" para quem já vê "prova" no menu
    const [rolesComMenu] = await db.execute(
      `SELECT code, menu_permissoes FROM roles WHERE code IN ('administrador','gestor_n1','gestor_n2','fiscal')`
    ) as any;
    for (const r of rolesComMenu) {
      let itens: string[] = [];
      if (Array.isArray(r.menu_permissoes)) {
        itens = r.menu_permissoes;
      } else if (typeof r.menu_permissoes === "string" && r.menu_permissoes) {
        try { itens = JSON.parse(r.menu_permissoes); } catch { itens = []; }
      }
      if (!itens.includes("provas_agendadas")) {
        itens.push("provas_agendadas");
        await db.execute(`UPDATE roles SET menu_permissoes = ? WHERE code = ?`, [JSON.stringify(itens), r.code]);
      }
    }

    // ── Reparo pontual: a versão anterior deste bloco fazia JSON.parse() em cima
    // de um valor que o mysql2 já retorna como array (coluna JSON), o que lançava
    // exceção e zerava a lista para ["provas_agendadas"], apagando as permissões
    // reais de administrador/gestor_n1/gestor_n2. Restauramos os defaults aqui.
    const defaultsParaReparo: Record<string, string[]> = {
      administrador: ["validacao", "resultado_entrevista", "entrevistas", "fale_conosco", "candidatos", "perfis", "prova", "usuarios", "carrossel", "certificacoes", "site", "institucional", "cursos", "provas_agendadas"],
      gestor_n1: ["validacao", "resultado_entrevista", "entrevistas", "fale_conosco", "candidatos", "perfis", "prova", "usuarios", "carrossel", "certificacoes", "site", "institucional", "cursos", "provas_agendadas"],
      gestor_n2: ["validacao", "resultado_entrevista", "entrevistas", "fale_conosco", "candidatos", "certificacoes", "provas_agendadas"],
    };
    for (const [code, itensCorretos] of Object.entries(defaultsParaReparo)) {
      const [rows] = await db.execute(`SELECT menu_permissoes FROM roles WHERE code = ?`, [code]) as any;
      if (!rows.length) continue;
      const atual = Array.isArray(rows[0].menu_permissoes) ? rows[0].menu_permissoes : [];
      if (atual.length <= 1) {
        await db.execute(`UPDATE roles SET menu_permissoes = ? WHERE code = ?`, [JSON.stringify(itensCorretos), code]);
        console.log(`✅ Permissões de menu de "${code}" restauradas (estavam zeradas pelo bug anterior)`);
      }
    }

    console.log("✅ Migração de agendamento de prova concluída");
  } catch (err) {
    console.warn("⚠️ Erro na migração de agendamento de prova:", err);
  }
}

// ─── Simulações (pública e do mural) ──────────────────────────────────────────
// Sempre usam o banco de questões real (prova_questoes) da certificação —
// nunca um banco de questões separado. O admin só configura quantas questões
// entram no simulado e se ele está ativo.
export async function runSimulacoesMigrations() {
  try {
    // Coluna opcional de explicação, mostrada ao candidato após responder no simulado
    const [colsQuestoes] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prova_questoes'
    `) as any;
    const colunasQuestoes: string[] = colsQuestoes.map((c: any) => c.COLUMN_NAME.toLowerCase());
    if (!colunasQuestoes.includes("explicacao")) {
      await db.execute(`ALTER TABLE prova_questoes ADD COLUMN explicacao TEXT NULL`);
      console.log("✅ Coluna prova_questoes.explicacao criada");
    }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS simulacoes_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certification_type_id INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        quantidade_questoes INT NOT NULL DEFAULT 5,
        ativa TINYINT(1) NOT NULL DEFAULT 1,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_cert (certification_type_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS simulacoes_tentativas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        simulacao_id INT NOT NULL,
        user_id INT NULL,
        lead_nome VARCHAR(255) NULL,
        lead_email VARCHAR(255) NULL,
        questoes_json JSON NOT NULL,
        respostas_json JSON NULL,
        acertos INT NULL,
        total_questoes INT NOT NULL,
        status ENUM('em_andamento','finalizada') NOT NULL DEFAULT 'em_andamento',
        origem ENUM('publica','mural') NOT NULL,
        iniciada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finalizada_em TIMESTAMP NULL,
        INDEX idx_user (user_id),
        INDEX idx_simulacao (simulacao_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log("✅ Tabelas de simulação (config/tentativas) verificadas/criadas");

    // Correção de segurança: tentativas públicas (sem user_id) precisavam de
    // um token opaco para autorização — o ID sequencial sozinho permitia que
    // qualquer pessoa consultasse/respondesse/finalizasse a tentativa de outra
    // só adivinhando ou incrementando o número.
    const [colsTentativas] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'simulacoes_tentativas'
    `) as any;
    const existentesTentativas: string[] = colsTentativas.map((c: any) => c.COLUMN_NAME.toLowerCase());
    if (!existentesTentativas.includes("access_token")) {
      await db.execute(`ALTER TABLE simulacoes_tentativas ADD COLUMN access_token VARCHAR(64) NULL`);
      console.log("✅ Coluna simulacoes_tentativas.access_token criada");
    }

    // Correção de integridade: separa o banco de questões da prova oficial do
    // banco usado no simulado. Sem isso, o simulado sorteava e revelava
    // gabarito/explicação das MESMAS questões que podem cair na prova real.
    const [colsQuestoesFlag] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prova_questoes'
    `) as any;
    const existentesQuestoesFlag: string[] = colsQuestoesFlag.map((c: any) => c.COLUMN_NAME.toLowerCase());
    if (!existentesQuestoesFlag.includes("eh_simulacao")) {
      await db.execute(`ALTER TABLE prova_questoes ADD COLUMN eh_simulacao TINYINT(1) NOT NULL DEFAULT 0`);
      console.log("✅ Coluna prova_questoes.eh_simulacao criada (separa banco de simulação do banco oficial)");
    }

    // Item de menu "simulacoes" para quem já gerencia a prova
    const [rolesComMenuSim] = await db.execute(
      `SELECT code, menu_permissoes FROM roles WHERE code IN ('administrador','gestor_n1','gestor_n2')`
    ) as any;
    for (const r of rolesComMenuSim) {
      const itens: string[] = Array.isArray(r.menu_permissoes) ? r.menu_permissoes : [];
      if (!itens.includes("simulacoes")) {
        itens.push("simulacoes");
        await db.execute(`UPDATE roles SET menu_permissoes = ? WHERE code = ?`, [JSON.stringify(itens), r.code]);
      }
    }
  } catch (err) {
    console.warn("⚠️ Erro na migração de simulações:", err);
  }
}

// ─── Conteúdo institucional (comitê, regulamento, edital, código de conduta) ──
// Antes vivia só no localStorage do navegador de quem editava — o candidato
// nunca via a versão real publicada pelo admin. Agora fica no banco, com
// versionamento do código de conduta (necessário pra assinatura eletrônica
// saber a qual versão o candidato está aceitando).
export async function runInstitucionalConfigMigration() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS institucional_config (
        id INT PRIMARY KEY DEFAULT 1,
        dados JSON NOT NULL,
        codigo_conduta_versao INT NOT NULL DEFAULT 1,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT chk_singleton CHECK (id = 1)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Tabela institucional_config verificada/criada");
  } catch (err) {
    console.warn("⚠️ Erro na migração institucional_config:", err);
  }
}

// ─── Eixos de conhecimento (competências avaliadas na prova/simulação) ───────
export async function runEixosConhecimentoMigration() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS eixos_conhecimento (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certification_type_id INT NOT NULL,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT NULL,
        ordem INT NOT NULL DEFAULT 0,
        ativo TINYINT(1) NOT NULL DEFAULT 1,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cert (certification_type_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Tabela eixos_conhecimento verificada/criada");

    const [cols] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prova_questoes'
    `) as any;
    const existentes: string[] = cols.map((c: any) => c.COLUMN_NAME.toLowerCase());
    if (!existentes.includes("eixo_conhecimento_id")) {
      await db.execute(`ALTER TABLE prova_questoes ADD COLUMN eixo_conhecimento_id INT NULL`);
      console.log("✅ Coluna prova_questoes.eixo_conhecimento_id criada");
    }

    // Item de menu "eixos_conhecimento" para quem já gerencia a prova
    const [rolesComMenuEixos] = await db.execute(
      `SELECT code, menu_permissoes FROM roles WHERE code IN ('administrador','gestor_n1','gestor_n2')`
    ) as any;
    for (const r of rolesComMenuEixos) {
      const itens: string[] = Array.isArray(r.menu_permissoes) ? r.menu_permissoes : [];
      if (!itens.includes("eixos_conhecimento")) {
        itens.push("eixos_conhecimento");
        await db.execute(`UPDATE roles SET menu_permissoes = ? WHERE code = ?`, [JSON.stringify(itens), r.code]);
      }
    }
  } catch (err) {
    console.warn("⚠️ Erro na migração de eixos de conhecimento:", err);
  }
}

// ─── Edital por certificação + comitê vinculável a contas de login ───────────
// O edital vivia só como um campo solto no objeto Certification, persistido
// só no localStorage de quem editou (nunca chegava ao banco de verdade) —
// mesmo problema já corrigido antes para o conteúdo institucional genérico.
// Aqui cada certificação ganha seu próprio edital versionado no banco.
//
// O comitê (banca) também sai do JSON genérico e vira registros reais,
// já pensados pra reaproveitar na emissão do certificado (próxima fase):
// cada membro pode ter uma conta de login vinculada (pra assinar de
// verdade), e cada certificação tem seus próprios membros responsáveis.
export async function runEditalComiteMigration() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS certificacao_edital (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certification_type_id INT NOT NULL UNIQUE,
        titulo VARCHAR(255) NOT NULL DEFAULT 'Edital',
        conteudo LONGTEXT NULL,
        url_externa VARCHAR(500) NULL,
        data_abertura DATE NULL,
        data_encerramento DATE NULL,
        versao INT NOT NULL DEFAULT 1,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cert (certification_type_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Tabela certificacao_edital verificada/criada");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS comite_membros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        nome VARCHAR(255) NOT NULL,
        cargo VARCHAR(255) NULL,
        mini_curriculo TEXT NULL,
        foto_url VARCHAR(500) NULL,
        linkedin VARCHAR(500) NULL,
        ordem INT NOT NULL DEFAULT 0,
        ativo TINYINT(1) NOT NULL DEFAULT 1,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Tabela comite_membros verificada/criada");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS certificacao_comite (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certification_type_id INT NOT NULL,
        comite_membro_id INT NOT NULL,
        papel VARCHAR(255) NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_cert_membro (certification_type_id, comite_membro_id),
        INDEX idx_cert (certification_type_id),
        INDEX idx_membro (comite_membro_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Tabela certificacao_comite verificada/criada");

    // candidato_processos registra QUAL VERSÃO do edital valia no momento
    // em que o candidato iniciou — se o edital mudar depois, o processo já
    // em andamento continua referenciando a versão que ele realmente aceitou.
    const [colsProc] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'candidato_processos'
    `) as any;
    const existentesProc: string[] = colsProc.map((c: any) => c.COLUMN_NAME.toLowerCase());
    if (!existentesProc.includes("edital_versao")) {
      await db.execute(`ALTER TABLE candidato_processos ADD COLUMN edital_versao INT NULL`);
      console.log("✅ Coluna candidato_processos.edital_versao criada");
    }

    // Migração única: se já existirem membros do comitê no JSON genérico
    // (institucional_config) e a tabela nova ainda estiver vazia, importa
    // pra não perder o que já foi cadastrado.
    const [jaTemMembros] = await db.execute(`SELECT COUNT(*) as total FROM comite_membros`) as any;
    if (jaTemMembros[0].total === 0) {
      const [instRows] = await db.execute(`SELECT dados FROM institucional_config WHERE id = 1`) as any;
      if (instRows.length) {
        const dados = typeof instRows[0].dados === "string" ? JSON.parse(instRows[0].dados) : instRows[0].dados;
        const comiteAntigo = Array.isArray(dados?.comite) ? dados.comite : [];
        for (let i = 0; i < comiteAntigo.length; i++) {
          const m = comiteAntigo[i];
          await db.execute(
            `INSERT INTO comite_membros (nome, cargo, mini_curriculo, foto_url, linkedin, ordem) VALUES (?, ?, ?, ?, ?, ?)`,
            [m.nome || "Sem nome", m.cargo || null, m.miniCurriculo || null, m.fotoUrl || null, m.linkedin || null, i]
          );
        }
        if (comiteAntigo.length) console.log(`✅ ${comiteAntigo.length} membro(s) do comitê migrado(s) do conteúdo institucional genérico`);
      }
    }

    // Item de menu "comite_edital"
    const [rolesComMenuComite] = await db.execute(
      `SELECT code, menu_permissoes FROM roles WHERE code IN ('administrador','gestor_n1','gestor_n2')`
    ) as any;
    for (const r of rolesComMenuComite) {
      const itens: string[] = Array.isArray(r.menu_permissoes) ? r.menu_permissoes : [];
      if (!itens.includes("comite_edital")) {
        itens.push("comite_edital");
        await db.execute(`UPDATE roles SET menu_permissoes = ? WHERE code = ?`, [JSON.stringify(itens), r.code]);
      }
    }
  } catch (err) {
    console.warn("⚠️ Erro na migração de edital/comitê:", err);
  }
}

// ─── Emissão real de certificado (PDF, QR Code, validação pública) ───────────
export async function runCertificadosMigration() {
  // NOTA IMPORTANTE: esta migração usa .query() em vez de .execute() em
  // TODA consulta. Motivo: em staging, consultas via .execute() (prepared
  // statement) rodando logo após um ALTER TABLE no mesmo boot retornavam
  // "Unknown column" para colunas que o próprio log da migração, linhas
  // acima, confirmava terem acabado de ser criadas — e pior, até colunas
  // que nunca foram tocadas por ALTER (estavam na CREATE TABLE original)
  // apresentaram o mesmo sintoma em deploys seguintes. .query() não usa
  // prepared statement do lado do servidor MySQL, evitando esse problema
  // por completo. Mesma classe de bug já vista antes com LIMIT ? e IN (?).
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS certificados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(24) NOT NULL UNIQUE,
        processo_id INT NOT NULL,
        user_id INT NOT NULL,
        certification_type_id INT NOT NULL,
        candidato_nome VARCHAR(255) NOT NULL,
        certificacao_nome VARCHAR(255) NOT NULL,
        emitido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        validade_ate DATE NULL,
        edital_versao INT NULL,
        status ENUM('ativo','revogado') NOT NULL DEFAULT 'ativo',
        revogado_em TIMESTAMP NULL,
        revogado_por INT NULL,
        motivo_revogacao TEXT NULL,
        caminho_pdf VARCHAR(500) NULL,
        assinantes_json JSON NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_processo (processo_id),
        INDEX idx_codigo (codigo),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Tabela certificados verificada/criada");
  } catch (err) {
    console.warn("⚠️ Erro ao criar tabela certificados:", (err as any)?.message);
  }

  // A coluna "status" já existia na tabela legada, mas com ENUM/default
  // diferentes (ex: 'emitido' em vez de 'ativo') — isso é MAIS perigoso que
  // uma coluna faltando, porque o INSERT não falha, só grava o valor
  // errado silenciosamente (foi exatamente o bug pego pelo autoteste: os
  // certificados eram criados com status='emitido', e toda consulta
  // filtrando por status='ativo' simplesmente não os encontrava). Por isso
  // esta, diferente das outras, é forçada via MODIFY sempre, não só
  // quando "falta".
  try {
    const [colStatus] = await db.query(`
      SELECT COLUMN_TYPE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'certificados' AND COLUMN_NAME = 'status'
    `) as any;
    const definicaoAtual = colStatus[0]?.COLUMN_TYPE || "";
    const defaultAtual = colStatus[0]?.COLUMN_DEFAULT || "";
    if (definicaoAtual !== "enum('ativo','revogado')" || defaultAtual !== "ativo") {
      await db.query(`
        ALTER TABLE certificados
        MODIFY COLUMN status ENUM('ativo','revogado') NOT NULL DEFAULT 'ativo'
      `);
      console.log(`✅ ENUM certificados.status normalizado para ('ativo','revogado') — era "${definicaoAtual}" default "${defaultAtual}"`);
    }
  } catch (err) {
    console.warn("⚠️ Erro ao normalizar ENUM certificados.status:", (err as any)?.message);
  }

  // Verifica TODAS as colunas da tabela individualmente — não só as que
  // foram adicionadas depois via ALTER, mas também as que já estavam na
  // CREATE TABLE original. Isso protege contra qualquer divergência entre
  // o que o código espera e o que a tabela realmente tem, seja qual for a
  // causa (schema antigo, cache, execução parcial anterior etc.).
  const colunasCertificados: [string, string][] = [
    ["codigo", "VARCHAR(24) NOT NULL"],
    ["processo_id", "INT NOT NULL"],
    ["user_id", "INT NOT NULL"],
    ["certification_type_id", "INT NOT NULL"],
    ["candidato_nome", "VARCHAR(255) NULL"],
    ["certificacao_nome", "VARCHAR(255) NULL"],
    ["emitido_em", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"],
    ["validade_ate", "DATE NULL"],
    ["edital_versao", "INT NULL"],
    ["status", "ENUM('ativo','revogado') NOT NULL DEFAULT 'ativo'"],
    ["revogado_em", "TIMESTAMP NULL"],
    ["revogado_por", "INT NULL"],
    ["motivo_revogacao", "TEXT NULL"],
    ["caminho_pdf", "VARCHAR(500) NULL"],
    ["assinantes_json", "JSON NULL"],
    ["criado_em", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"],
  ];
  for (const [coluna, tipo] of colunasCertificados) {
    try {
      const [cols] = await db.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'certificados'
      `) as any;
      const existentes: string[] = cols.map((c: any) => c.COLUMN_NAME.toLowerCase());
      if (!existentes.includes(coluna)) {
        await db.query(`ALTER TABLE certificados ADD COLUMN ${coluna} ${tipo}`);
        console.log(`✅ Coluna certificados.${coluna} criada`);
      }
    } catch (err) {
      console.warn(`⚠️ Erro ao verificar/criar certificados.${coluna}:`, (err as any)?.message);
    }
  }

  // Varredura final: a tabela pode ter colunas que este código nem conhece
  // (ex: de uma tentativa anterior com um desenho diferente) marcadas como
  // NOT NULL sem valor padrão — isso quebra qualquer INSERT que não as
  // preencha explicitamente. Em vez de corrigir uma de cada vez conforme
  // cada erro aparece, torna TODA coluna fora da lista esperada opcional
  // de uma vez, sem apagar nada (ALTER MODIFY só relaxa a restrição).
  try {
    const nomesEsperados = new Set([...colunasCertificados.map(([c]) => c), "id"]);
    const [todasColunas] = await db.query(`
      SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'certificados'
    `) as any;
    for (const col of todasColunas) {
      const nome = col.COLUMN_NAME;
      if (nomesEsperados.has(nome)) continue;
      if (col.IS_NULLABLE === "NO" && col.COLUMN_DEFAULT === null && !col.EXTRA?.includes("auto_increment")) {
        try {
          await db.query(`ALTER TABLE certificados MODIFY COLUMN \`${nome}\` ${col.COLUMN_TYPE} NULL`);
          console.log(`✅ Coluna certificados.${nome} (não usada pelo código) tornada opcional`);
        } catch (err) {
          console.warn(`⚠️ Erro ao tornar certificados.${nome} opcional:`, (err as any)?.message);
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ Erro na varredura de colunas extras de certificados:", (err as any)?.message);
  }

  // Remove uma constraint UNIQUE legada em processo_id (de uma tabela
  // pré-existente com desenho diferente) — o design atual PRECISA permitir
  // múltiplas linhas por processo ao longo do tempo (histórico de
  // reemissões: uma revogada + uma ativa), a exclusividade de "só um ativo
  // por vez" é garantida na aplicação, não por constraint de banco.
  try {
    // Primeiro remove qualquer FK que dependa desse índice (senão o DROP
    // INDEX falha com "needed in a foreign key constraint")
    const [fks] = await db.query(`
      SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'certificados'
        AND COLUMN_NAME = 'processo_id' AND REFERENCED_TABLE_NAME IS NOT NULL
    `) as any;
    for (const fk of fks) {
      try {
        await db.query(`ALTER TABLE certificados DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
        console.log(`✅ FK legada certificados.${fk.CONSTRAINT_NAME} removida`);
      } catch (err) {
        console.warn(`⚠️ Erro ao remover FK legada ${fk.CONSTRAINT_NAME}:`, (err as any)?.message);
      }
    }

    const [indices] = await db.query(`
      SELECT DISTINCT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'certificados'
        AND INDEX_NAME != 'PRIMARY' AND NON_UNIQUE = 0
        AND COLUMN_NAME = 'processo_id'
    `) as any;
    for (const idx of indices) {
      try {
        await db.query(`ALTER TABLE certificados DROP INDEX \`${idx.INDEX_NAME}\``);
        console.log(`✅ Constraint UNIQUE legada certificados.${idx.INDEX_NAME} removida (incompatível com histórico de reemissão)`);
      } catch (err) {
        console.warn(`⚠️ Erro ao remover índice legado ${idx.INDEX_NAME}:`, (err as any)?.message);
      }
    }
  } catch (err) {
    console.warn("⚠️ Erro ao verificar índices legados de certificados:", (err as any)?.message);
  }

  // Validade configurável por certificação (antes era texto fixo "3 anos"
  // direto na tela, sem nenhuma configuração real por trás)
  try {
    const [colsCert] = await db.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'certification_types'
    `) as any;
    const existentesCert: string[] = colsCert.map((c: any) => c.COLUMN_NAME.toLowerCase());
    if (!existentesCert.includes("validade_anos")) {
      await db.query(`ALTER TABLE certification_types ADD COLUMN validade_anos INT NULL`);
      console.log("✅ Coluna certification_types.validade_anos criada");
    }
  } catch (err) {
    console.warn("⚠️ Erro ao verificar/criar certification_types.validade_anos:", (err as any)?.message);
  }

  // Assinatura (imagem) de cada membro do comitê, pra embutir no PDF
  try {
    const [colsComite] = await db.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comite_membros'
    `) as any;
    const existentesComite: string[] = colsComite.map((c: any) => c.COLUMN_NAME.toLowerCase());
    if (!existentesComite.includes("assinatura_url")) {
      await db.query(`ALTER TABLE comite_membros ADD COLUMN assinatura_url VARCHAR(500) NULL`);
      console.log("✅ Coluna comite_membros.assinatura_url criada");
    }
  } catch (err) {
    console.warn("⚠️ Erro ao verificar/criar comite_membros.assinatura_url:", (err as any)?.message);
  }

  // Item de menu "certificados" (emissão/consulta administrativa)
  try {
    const [rolesComMenu] = await db.query(
      `SELECT code, menu_permissoes FROM roles WHERE code IN ('administrador','gestor_n1','gestor_n2')`
    ) as any;
    for (const r of rolesComMenu) {
      const itens: string[] = Array.isArray(r.menu_permissoes) ? r.menu_permissoes : [];
      if (!itens.includes("certificados")) {
        itens.push("certificados");
        await db.query(`UPDATE roles SET menu_permissoes = ? WHERE code = ?`, [JSON.stringify(itens), r.code]);
      }
    }
  } catch (err) {
    console.warn("⚠️ Erro na migração de certificados:", err);
  }
}

// ─── Item de menu do relatório administrativo da prova oficial ───────────────
export async function runRelatorioProvaMenuMigration() {
  try {
    const [rolesComMenu] = await db.execute(
      `SELECT code, menu_permissoes FROM roles WHERE code IN ('administrador','gestor_n1','gestor_n2','avaliador')`
    ) as any;
    for (const r of rolesComMenu) {
      const itens: string[] = Array.isArray(r.menu_permissoes) ? r.menu_permissoes : [];
      if (!itens.includes("prova_relatorio")) {
        itens.push("prova_relatorio");
        await db.execute(`UPDATE roles SET menu_permissoes = ? WHERE code = ?`, [JSON.stringify(itens), r.code]);
      }
    }
    console.log("✅ Item de menu prova_relatorio verificado");
  } catch (err) {
    console.warn("⚠️ Erro na migração do menu do relatório da prova:", err);
  }
}

// ─── Designação de avaliador por certificação ─────────────────────────────────
// Antes um avaliador tinha acesso genérico a QUALQUER certificação. Isso
// permitia (e ainda mais grave: não impedia) um avaliador sem contexto
// analisar documentos de uma certificação que não é a dele. Agora cada
// avaliador só acessa as certificações às quais foi explicitamente designado
// — administrador e gestor continuam vendo tudo.
export async function runAvaliadoresCertificacaoMigration() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS avaliadores_certificacao (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certification_type_id INT NOT NULL,
        user_id INT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_cert_avaliador (certification_type_id, user_id),
        INDEX idx_cert (certification_type_id),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Tabela avaliadores_certificacao verificada/criada");

    // Migração única: sem isso, avaliadores já cadastrados ficariam
    // subitamente sem acesso a NENHUMA certificação assim que a restrição
    // entrar em vigor. Designa automaticamente todo avaliador existente pra
    // todas as certificações ativas — é o comportamento que eles já tinham
    // até agora (acesso geral). Dali em diante, o admin ajusta manualmente.
    const [jaTemDesignacao] = await db.execute(`SELECT COUNT(*) as total FROM avaliadores_certificacao`) as any;
    if (jaTemDesignacao[0].total === 0) {
      const [avaliadores] = await db.execute(
        `SELECT u.id FROM users u JOIN roles r ON r.id = u.role_id WHERE r.code = 'avaliador' AND u.is_active = 1`
      ) as any;
      const [certsAtivas] = await db.execute(`SELECT id FROM certification_types WHERE status = 'ativa'`) as any;
      let designacoesCriadas = 0;
      for (const av of avaliadores) {
        for (const cert of certsAtivas) {
          await db.execute(
            `INSERT IGNORE INTO avaliadores_certificacao (certification_type_id, user_id) VALUES (?, ?)`,
            [cert.id, av.id]
          );
          designacoesCriadas++;
        }
      }
      if (designacoesCriadas) console.log(`✅ ${designacoesCriadas} designação(ões) de avaliador migradas (acesso geral preservado)`);
    }

    // Item de menu "avaliadores_certificacao" (gestão de designações)
    const [rolesComMenu] = await db.execute(
      `SELECT code, menu_permissoes FROM roles WHERE code IN ('administrador','gestor_n1')`
    ) as any;
    for (const r of rolesComMenu) {
      const itens: string[] = Array.isArray(r.menu_permissoes) ? r.menu_permissoes : [];
      if (!itens.includes("avaliadores_certificacao")) {
        itens.push("avaliadores_certificacao");
        await db.execute(`UPDATE roles SET menu_permissoes = ? WHERE code = ?`, [JSON.stringify(itens), r.code]);
      }
    }
  } catch (err) {
    console.warn("⚠️ Erro na migração de designação de avaliadores:", err);
  }
}

// ─── Magic links (autenticação de um clique a partir de e-mails) ─────────────
// Usado pelos e-mails "acionáveis": em vez de aprovar/reprovar direto pelo
// e-mail (o que pularia a revisão humana), o link autentica a pessoa
// automaticamente e já abre a tela certa com o item em destaque — a decisão
// em si continua sendo tomada na tela, com o documento/contexto à vista.
export async function runMagicLinkMigration() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS magic_link_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(64) NOT NULL UNIQUE,
        destino VARCHAR(500) NOT NULL,
        usado TINYINT(1) NOT NULL DEFAULT 0,
        expira_em TIMESTAMP NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Tabela magic_link_tokens verificada/criada");
  } catch (err) {
    console.warn("⚠️ Erro na migração de magic_link_tokens:", err);
  }
}

export async function runAssinaturaCondutaMigration() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS codigo_conduta_assinaturas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nome_digitado VARCHAR(255) NOT NULL,
        codigo_assinatura VARCHAR(64) NOT NULL,
        versao VARCHAR(20) NOT NULL DEFAULT '1.0',
        ip_address VARCHAR(64) NULL,
        assinado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_user_versao (user_id, versao),
        UNIQUE KEY uniq_codigo (codigo_assinatura)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Tabela codigo_conduta_assinaturas verificada/criada");
  } catch (err) {
    console.warn("⚠️ Erro na migração de assinatura do código de conduta:", err);
  }
}
