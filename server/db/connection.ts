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
