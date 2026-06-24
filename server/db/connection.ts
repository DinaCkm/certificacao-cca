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
  } catch (err) {
    console.error("❌ Erro ao conectar ao MySQL:", err);
    process.exit(1);
  }
}

async function runMigrations() {
  try {
    // Cria tabela se não existir
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
        status ENUM('enviado', 'aprovado', 'reprovado') NOT NULL DEFAULT 'enviado',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Busca colunas existentes
    const [cols] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'documentos_candidato'
    `) as any;
    const existentes = cols.map((c: any) => c.COLUMN_NAME.toLowerCase());

    // Adiciona colunas faltantes
    const colunasFaltantes: [string, string][] = [
      ["tipo_documento", "ADD COLUMN tipo_documento VARCHAR(50) NOT NULL DEFAULT 'documento' AFTER user_id"],
      ["nome_arquivo",   "ADD COLUMN nome_arquivo VARCHAR(255) NOT NULL DEFAULT '' AFTER tipo_documento"],
      ["caminho_arquivo","ADD COLUMN caminho_arquivo VARCHAR(255) NOT NULL DEFAULT '' AFTER nome_arquivo"],
      ["tamanho_bytes",  "ADD COLUMN tamanho_bytes INT NOT NULL DEFAULT 0 AFTER caminho_arquivo"],
      ["mime_type",      "ADD COLUMN mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream' AFTER tamanho_bytes"],
      ["status",         "ADD COLUMN status ENUM('enviado','aprovado','reprovado') NOT NULL DEFAULT 'enviado' AFTER mime_type"],
      ["criado_em",      "ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER status"],
    ];

    for (const [col, alterSql] of colunasFaltantes) {
      if (!existentes.includes(col)) {
        await db.execute(`ALTER TABLE documentos_candidato ${alterSql}`);
        console.log(`✅ Coluna '${col}' adicionada`);
      }
    }

    console.log("✅ Tabela documentos_candidato verificada/migrada");
  } catch (err) {
    console.error("⚠️ Erro na migração:", err);
  }
}
