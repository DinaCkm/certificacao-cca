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
      // Primeiro corrige qualquer valor inválido existente
      await db.execute(`
        UPDATE candidato_processos
        SET status_geral = 'validacao'
        WHERE status_geral NOT IN (
          'selecao','cadastro','pagamento1','upload','validacao',
          'agendamento','entrevista','prova','pagamento2','emissao',
          'concluido','encerrado'
        )
      `);

      // Depois modifica o ENUM
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
      console.warn("⚠️ Não foi possível atualizar ENUM status_geral:", enumErr);
    }
  } catch (err) {
    console.error("⚠️ Erro na migração:", err);
  }
}
