# Tabelas Adicionais de Rastreamento
## Plataforma de Certificação CCA

---

## 📋 Índice
1. [Fases do Processo](#1-tabela-certification-phases)
2. [Progresso do Usuário por Fase](#2-tabela-user-phase-progress)
3. [Aprovações por Fase](#3-tabela-phase-approvals)
4. [Não Aprovados](#4-tabela-phase-rejections)
5. [Usuários Inativos/Abandono](#5-tabela-inactive-users)
6. [Histórico de Status](#6-tabela-status-history)
7. [Relatórios de Conclusão](#7-tabela-completion-reports)

---

## 1. Tabela: certification_phases

**Descrição**: Define todas as fases do processo de certificação

```sql
CREATE TABLE certification_phases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phase_code VARCHAR(50) UNIQUE NOT NULL,
  phase_name VARCHAR(255) NOT NULL,
  description TEXT,
  phase_order INT NOT NULL,
  certification_level_id INT NOT NULL,
  purchase_type_id INT,
  
  -- Tipo de fase
  phase_type ENUM(
    'selection',           -- Seleção de tipo/nível
    'payment',            -- Pagamento
    'course',             -- Cursos
    'document_upload',    -- Upload de documentos
    'exam',               -- Prova
    'waiting',            -- Aguardar análise
    'interview_schedule', -- Agendamento de entrevista
    'interview',          -- Entrevista
    'result',             -- Resultado
    'certificate'         -- Certificado
  ) NOT NULL,
  
  -- Configuração
  is_mandatory BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT FALSE,
  can_be_skipped BOOLEAN DEFAULT FALSE,
  max_attempts INT DEFAULT 1,
  waiting_days INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (certification_level_id) REFERENCES certification_levels(id),
  FOREIGN KEY (purchase_type_id) REFERENCES purchase_types(id),
  INDEX idx_code (phase_code),
  INDEX idx_level (certification_level_id),
  INDEX idx_phase_order (phase_order)
);
```

**Dados Iniciais - Nível 1 com Cursos:**
```sql
INSERT INTO certification_phases (phase_code, phase_name, description, phase_order, certification_level_id, phase_type, is_mandatory, requires_approval) VALUES
('LEVEL1_COURSE_SELECTION', 'Seleção de Compra', 'Escolha do tipo de compra', 1, 1, 'selection', TRUE, FALSE),
('LEVEL1_COURSE_PAYMENT', 'Pagamento', 'Pagamento do pacote', 2, 1, 'payment', TRUE, FALSE),
('LEVEL1_COURSE_COURSES', 'Cursos Preparatórios', 'Realização dos 6 cursos', 3, 1, 'course', TRUE, FALSE),
('LEVEL1_COURSE_EXAM', 'Prova de Certificação', 'Realização da prova', 4, 1, 'exam', TRUE, TRUE),
('LEVEL1_COURSE_DOCUMENT', 'Upload de Documentos', 'Envio de documentação', 5, 1, 'document_upload', TRUE, FALSE),
('LEVEL1_COURSE_INTERVIEW_SCHEDULE', 'Agendamento de Entrevista', 'Agendamento da entrevista', 6, 1, 'interview_schedule', TRUE, FALSE),
('LEVEL1_COURSE_INTERVIEW', 'Entrevista Técnica', 'Realização da entrevista', 7, 1, 'interview', TRUE, TRUE),
('LEVEL1_COURSE_RESULT', 'Resultado Final', 'Resultado da entrevista', 8, 1, 'result', TRUE, FALSE),
('LEVEL1_COURSE_CERTIFICATE', 'Certificado', 'Emissão do certificado', 9, 1, 'certificate', TRUE, FALSE);

-- Nível 1 - Certificação Direta
INSERT INTO certification_phases (phase_code, phase_name, description, phase_order, certification_level_id, phase_type, is_mandatory, requires_approval) VALUES
('LEVEL1_DIRECT_SELECTION', 'Seleção de Compra', 'Escolha certificação direta', 1, 1, 'selection', TRUE, FALSE),
('LEVEL1_DIRECT_PAYMENT', 'Pagamento', 'Pagamento da certificação direta', 2, 1, 'payment', TRUE, FALSE),
('LEVEL1_DIRECT_FORM', 'Preenchimento de Ficha', 'Preenchimento de dados profissionais', 3, 1, 'document_upload', TRUE, FALSE),
('LEVEL1_DIRECT_DOCUMENT', 'Upload de Documentos', 'Envio de documentação', 4, 1, 'document_upload', TRUE, FALSE),
('LEVEL1_DIRECT_WAITING', 'Análise Documental', 'Aguardar 15 dias de análise', 5, 1, 'waiting', TRUE, FALSE),
('LEVEL1_DIRECT_INTERVIEW_SCHEDULE', 'Agendamento de Entrevista', 'Agendamento da entrevista', 6, 1, 'interview_schedule', TRUE, FALSE),
('LEVEL1_DIRECT_INTERVIEW', 'Entrevista Técnica', 'Realização da entrevista', 7, 1, 'interview', TRUE, TRUE),
('LEVEL1_DIRECT_RESULT', 'Resultado Final', 'Resultado da entrevista', 8, 1, 'result', TRUE, FALSE),
('LEVEL1_DIRECT_CERTIFICATE', 'Certificado', 'Emissão do certificado', 9, 1, 'certificate', TRUE, FALSE);

-- Nível 1 - Apenas Cursos
INSERT INTO certification_phases (phase_code, phase_name, description, phase_order, certification_level_id, phase_type, is_mandatory, requires_approval) VALUES
('LEVEL1_COURSE_ONLY_SELECTION', 'Seleção de Compra', 'Escolha apenas cursos', 1, 1, 'selection', TRUE, FALSE),
('LEVEL1_COURSE_ONLY_PAYMENT', 'Pagamento', 'Pagamento dos cursos', 2, 1, 'payment', TRUE, FALSE),
('LEVEL1_COURSE_ONLY_COURSES', 'Cursos Preparatórios', 'Realização dos 6 cursos', 3, 1, 'course', TRUE, FALSE);

-- Nível 2
INSERT INTO certification_phases (phase_code, phase_name, description, phase_order, certification_level_id, phase_type, is_mandatory, requires_approval) VALUES
('LEVEL2_SELECTION', 'Seleção de Nível', 'Escolha nível 2', 1, 2, 'selection', TRUE, FALSE),
('LEVEL2_PAYMENT', 'Pagamento', 'Pagamento da certificação nível 2', 2, 2, 'payment', TRUE, FALSE),
('LEVEL2_CURRICULUM', 'Validação de Currículo', 'Preenchimento e validação de currículo', 3, 2, 'document_upload', TRUE, TRUE),
('LEVEL2_DOCUMENT', 'Upload de Documentos', 'Envio de documentação comprobatória', 4, 2, 'document_upload', TRUE, FALSE),
('LEVEL2_INTERVIEW_SCHEDULE', 'Agendamento de Entrevista', 'Agendamento da entrevista', 5, 2, 'interview_schedule', TRUE, FALSE),
('LEVEL2_INTERVIEW', 'Entrevista Técnica', 'Realização da entrevista', 6, 2, 'interview', TRUE, TRUE),
('LEVEL2_RESULT', 'Resultado Final', 'Resultado da entrevista', 7, 2, 'result', TRUE, FALSE),
('LEVEL2_CERTIFICATE', 'Certificado', 'Emissão do certificado', 8, 2, 'certificate', TRUE, FALSE);
```

---

## 2. Tabela: user_phase_progress

**Descrição**: Rastreia o progresso de cada usuário em cada fase

```sql
CREATE TABLE user_phase_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  phase_id INT NOT NULL,
  
  -- Status da fase
  status ENUM(
    'not_started',      -- Não iniciado
    'in_progress',      -- Em progresso
    'completed',        -- Concluído
    'failed',          -- Falhou
    'abandoned',       -- Abandonado
    'waiting',         -- Aguardando
    'pending_approval' -- Pendente de aprovação
  ) DEFAULT 'not_started',
  
  -- Datas
  started_at DATETIME,
  completed_at DATETIME,
  abandoned_at DATETIME,
  
  -- Tentativas
  attempt_number INT DEFAULT 1,
  max_attempts INT DEFAULT 1,
  
  -- Notas
  notes TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (phase_id) REFERENCES certification_phases(id),
  UNIQUE KEY unique_progress (user_id, purchase_id, phase_id),
  INDEX idx_user (user_id),
  INDEX idx_purchase (purchase_id),
  INDEX idx_status (status),
  INDEX idx_completed_at (completed_at)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `phase_id`: Referência à fase
- `status`: Status atual da fase
- `started_at`: Quando iniciou
- `completed_at`: Quando completou
- `abandoned_at`: Quando abandonou
- `attempt_number`: Número da tentativa
- `max_attempts`: Máximo de tentativas permitidas
- `notes`: Notas do usuário
- `admin_notes`: Notas do administrador

---

## 3. Tabela: phase_approvals

**Descrição**: Registra aprovações em fases que requerem aprovação

```sql
CREATE TABLE phase_approvals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  phase_id INT NOT NULL,
  
  -- Aprovação
  status ENUM('pending', 'approved', 'rejected', 'pending_revision') DEFAULT 'pending',
  approved_by INT,  -- ID do administrador que aprovou
  approval_date DATETIME,
  
  -- Detalhes
  approval_reason TEXT,
  rejection_reason TEXT,
  reviewer_notes TEXT,
  
  -- Revisão
  revision_requested BOOLEAN DEFAULT FALSE,
  revision_deadline DATETIME,
  revision_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (phase_id) REFERENCES certification_phases(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_approval_date (approval_date)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `phase_id`: Referência à fase
- `status`: Status da aprovação
- `approved_by`: ID do revisor
- `approval_date`: Data da aprovação
- `approval_reason`: Motivo da aprovação
- `rejection_reason`: Motivo da rejeição
- `reviewer_notes`: Notas do revisor
- `revision_requested`: Revisão solicitada?
- `revision_deadline`: Prazo para revisão
- `revision_count`: Número de revisões

---

## 4. Tabela: phase_rejections

**Descrição**: Registra rejeições e motivos em fases

```sql
CREATE TABLE phase_rejections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  phase_id INT NOT NULL,
  
  -- Rejeição
  rejection_type ENUM(
    'exam_failed',           -- Prova reprovada
    'interview_failed',      -- Entrevista reprovada
    'document_invalid',      -- Documentos inválidos
    'curriculum_rejected',   -- Currículo rejeitado
    'other'                  -- Outro motivo
  ) NOT NULL,
  
  rejection_reason TEXT NOT NULL,
  rejection_details TEXT,
  
  -- Reviewer
  rejected_by INT,  -- ID do administrador
  rejection_date DATETIME NOT NULL,
  
  -- Possibilidade de retentativa
  can_retry BOOLEAN DEFAULT FALSE,
  retry_deadline DATETIME,
  retry_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (phase_id) REFERENCES certification_phases(id),
  FOREIGN KEY (rejected_by) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_rejection_type (rejection_type),
  INDEX idx_rejection_date (rejection_date)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `phase_id`: Referência à fase
- `rejection_type`: Tipo de rejeição
- `rejection_reason`: Motivo principal
- `rejection_details`: Detalhes adicionais
- `rejected_by`: ID do revisor
- `rejection_date`: Data da rejeição
- `can_retry`: Pode tentar novamente?
- `retry_deadline`: Prazo para nova tentativa
- `retry_count`: Número de tentativas

---

## 5. Tabela: inactive_users

**Descrição**: Rastreia usuários inativos e abandonos

```sql
CREATE TABLE inactive_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  
  -- Informações de inatividade
  last_activity_date DATETIME,
  inactivity_days INT,
  
  -- Fase em que parou
  last_phase_id INT,
  last_phase_status VARCHAR(50),
  
  -- Motivo do abandono
  abandonment_reason ENUM(
    'user_initiated',       -- Usuário cancelou
    'inactivity_timeout',   -- Inatividade
    'payment_failed',       -- Pagamento falhou
    'document_rejected',    -- Documentos rejeitados
    'exam_failed',         -- Prova reprovada
    'interview_failed',    -- Entrevista reprovada
    'unknown'              -- Desconhecido
  ) DEFAULT 'unknown',
  
  abandonment_date DATETIME,
  abandonment_notes TEXT,
  
  -- Possibilidade de reativação
  can_reactivate BOOLEAN DEFAULT TRUE,
  reactivation_deadline DATETIME,
  reactivation_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (last_phase_id) REFERENCES certification_phases(id),
  INDEX idx_user (user_id),
  INDEX idx_abandonment_reason (abandonment_reason),
  INDEX idx_abandonment_date (abandonment_date),
  INDEX idx_last_activity (last_activity_date)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `last_activity_date`: Última atividade registrada
- `inactivity_days`: Dias de inatividade
- `last_phase_id`: Última fase acessada
- `last_phase_status`: Status da última fase
- `abandonment_reason`: Motivo do abandono
- `abandonment_date`: Data do abandono
- `abandonment_notes`: Notas sobre o abandono
- `can_reactivate`: Pode ser reativado?
- `reactivation_deadline`: Prazo para reativação
- `reactivation_count`: Número de reativações

---

## 6. Tabela: status_history

**Descrição**: Histórico completo de mudanças de status

```sql
CREATE TABLE status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  phase_id INT,
  
  -- Status anterior e novo
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  
  -- Motivo da mudança
  status_change_reason VARCHAR(255),
  changed_by INT,  -- ID do usuário/admin que fez a mudança
  
  -- Detalhes
  details JSON,  -- Dados adicionais em JSON
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (phase_id) REFERENCES certification_phases(id),
  FOREIGN KEY (changed_by) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_purchase (purchase_id),
  INDEX idx_new_status (new_status),
  INDEX idx_created_at (created_at)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `phase_id`: Referência à fase (pode ser NULL)
- `previous_status`: Status anterior
- `new_status`: Novo status
- `status_change_reason`: Motivo da mudança
- `changed_by`: Quem fez a mudança
- `details`: Dados adicionais em JSON
- `created_at`: Data/hora da mudança

---

## 7. Tabela: completion_reports

**Descrição**: Relatórios de conclusão por usuário

```sql
CREATE TABLE completion_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  
  -- Informações gerais
  certification_type_id INT NOT NULL,
  certification_level_id INT NOT NULL,
  
  -- Datas
  start_date DATE,
  completion_date DATE,
  total_days_to_complete INT,
  
  -- Fases completadas
  total_phases INT,
  completed_phases INT,
  failed_phases INT,
  abandoned_phases INT,
  
  -- Resultados
  final_status ENUM('completed', 'failed', 'abandoned', 'in_progress') DEFAULT 'in_progress',
  completion_percentage INT,
  
  -- Scores
  exam_score DECIMAL(5, 2),
  interview_score DECIMAL(5, 2),
  overall_score DECIMAL(5, 2),
  
  -- Certificado
  certificate_id INT,
  certificate_number VARCHAR(50),
  certificate_issue_date DATE,
  
  -- Notas
  summary_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (certification_type_id) REFERENCES certification_types(id),
  FOREIGN KEY (certification_level_id) REFERENCES certification_levels(id),
  FOREIGN KEY (certificate_id) REFERENCES certificates(id),
  INDEX idx_user (user_id),
  INDEX idx_final_status (final_status),
  INDEX idx_completion_date (completion_date)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `certification_type_id`: Tipo de certificação
- `certification_level_id`: Nível de certificação
- `start_date`: Data de início
- `completion_date`: Data de conclusão
- `total_days_to_complete`: Dias para completar
- `total_phases`: Total de fases
- `completed_phases`: Fases completadas
- `failed_phases`: Fases falhadas
- `abandoned_phases`: Fases abandonadas
- `final_status`: Status final
- `completion_percentage`: Percentual de conclusão
- `exam_score`: Nota da prova
- `interview_score`: Nota da entrevista
- `overall_score`: Nota geral
- `certificate_id`: ID do certificado
- `certificate_number`: Número do certificado
- `certificate_issue_date`: Data de emissão
- `summary_notes`: Resumo de notas

---

## 📊 Relacionamentos com Tabelas Existentes

```
certification_phases
├── user_phase_progress (1:N)
├── phase_approvals (1:N)
├── phase_rejections (1:N)
├── inactive_users (1:N)
└── status_history (1:N)

users
├── user_phase_progress (1:N)
├── phase_approvals (1:N) - como approved_by
├── phase_rejections (1:N) - como rejected_by
├── inactive_users (1:N)
├── status_history (1:N) - como changed_by
└── completion_reports (1:N)

purchases
├── user_phase_progress (1:N)
├── phase_approvals (1:N)
├── phase_rejections (1:N)
├── inactive_users (1:N)
├── status_history (1:N)
└── completion_reports (1:N)
```

---

## 🔍 Consultas Úteis

### Usuários em Progresso
```sql
SELECT u.id, u.full_name, p.order_number, cp.phase_name, upp.status
FROM users u
JOIN purchases p ON u.id = p.user_id
JOIN user_phase_progress upp ON p.id = upp.purchase_id
JOIN certification_phases cp ON upp.phase_id = cp.id
WHERE upp.status = 'in_progress'
ORDER BY upp.updated_at DESC;
```

### Usuários Que Abandonaram
```sql
SELECT u.id, u.full_name, iu.last_phase_id, iu.abandonment_reason, iu.abandonment_date
FROM users u
JOIN inactive_users iu ON u.id = iu.user_id
WHERE iu.abandonment_date IS NOT NULL
ORDER BY iu.abandonment_date DESC;
```

### Taxa de Conclusão por Fase
```sql
SELECT 
  cp.phase_name,
  COUNT(upp.id) as total_users,
  SUM(CASE WHEN upp.status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN upp.status = 'failed' THEN 1 ELSE 0 END) as failed,
  SUM(CASE WHEN upp.status = 'abandoned' THEN 1 ELSE 0 END) as abandoned,
  ROUND(SUM(CASE WHEN upp.status = 'completed' THEN 1 ELSE 0 END) * 100 / COUNT(upp.id), 2) as completion_rate
FROM user_phase_progress upp
JOIN certification_phases cp ON upp.phase_id = cp.id
GROUP BY cp.id, cp.phase_name
ORDER BY cp.phase_order;
```

### Aprovações Pendentes
```sql
SELECT u.full_name, cp.phase_name, pa.status, pa.created_at
FROM phase_approvals pa
JOIN users u ON pa.user_id = u.id
JOIN certification_phases cp ON pa.phase_id = cp.id
WHERE pa.status = 'pending'
ORDER BY pa.created_at ASC;
```

### Rejeições por Motivo
```sql
SELECT 
  rejection_type,
  COUNT(*) as total_rejections,
  COUNT(DISTINCT user_id) as affected_users
FROM phase_rejections
GROUP BY rejection_type
ORDER BY total_rejections DESC;
```

---

## 📈 Métricas Importantes

### Indicadores de Desempenho
1. **Taxa de Conclusão**: Usuários que completaram / Total de inscritos
2. **Taxa de Abandono**: Usuários que abandonaram / Total de inscritos
3. **Taxa de Rejeição por Fase**: Rejeições por fase / Total que tentaram
4. **Tempo Médio de Conclusão**: Média de dias para completar
5. **Taxa de Reativação**: Usuários reativados / Total de inativos

### Alertas
- Usuários inativos por mais de 30 dias
- Aprovações pendentes por mais de 7 dias
- Taxa de rejeição acima de 30% em qualquer fase
- Tempo de conclusão acima de 180 dias

---

**Versão**: 1.0  
**Data**: 02 de Junho de 2026  
**Status**: Completo e Pronto para Implementação
