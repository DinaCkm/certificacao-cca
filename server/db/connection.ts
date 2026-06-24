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
    await db.execute(`
      CREATE TABLE IF NOT EXISTS documentos_candidato (
        id INT AUTO_INCREMENT PRIMARY KEY,
        processo_id INT NULL,
        user_id INT NOT NULL,
        tipo_documento VARCHAR(50) NOT NULL,
        nome_arquivo VARCHAR(255) NOT NULL,
        caminho_arquivo VARCHAR(255) NOT NULL,
        tamanho_bytes INT NOT NULL DEFAULT 0,
        mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
        status ENUM('enviado', 'aprovado', 'reprovado') NOT NULL DEFAULT 'enviado',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_processo_id (processo_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Tabela documentos_candidato verificada/criada");
  } catch (err) {
    console.error("⚠️ Erro na migração:", err);
  }
}
