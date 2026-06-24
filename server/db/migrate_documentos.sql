-- Cria tabela de documentos_candidato se não existir
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
