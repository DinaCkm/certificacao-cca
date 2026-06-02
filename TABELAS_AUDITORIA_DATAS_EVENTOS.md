# Tabelas de Auditoria Detalhada com Datas e Eventos
## Plataforma de Certificação CCA

---

## 📋 Índice
1. [Timeline de Eventos do Usuário](#1-tabela-user-event-timeline)
2. [Acesso ao Sistema](#2-tabela-system-access-log)
3. [Atividades de Estudo](#3-tabela-course-activity-log)
4. [Eventos de Prova](#4-tabela-exam-event-log)
5. [Eventos de Entrevista](#5-tabela-interview-event-log)
6. [Certificados Detalhados](#6-tabela-certificate-details)
7. [Registro de Aprovações](#7-tabela-approval-audit-log)
8. [Timeline Consolidada](#8-tabela-consolidated-timeline)

---

## 1. Tabela: user_event_timeline

**Descrição**: Timeline completa de todos os eventos do usuário

```sql
CREATE TABLE user_event_timeline (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  
  -- Tipo de evento
  event_type ENUM(
    'account_created',        -- Conta criada
    'purchase_completed',     -- Compra realizada
    'payment_received',       -- Pagamento recebido
    'course_access',          -- Acesso a curso
    'course_started',         -- Curso iniciado
    'course_module_started',  -- Módulo iniciado
    'course_module_completed',-- Módulo concluído
    'course_completed',       -- Curso concluído
    'exam_scheduled',         -- Prova agendada
    'exam_started',           -- Prova iniciada
    'exam_completed',         -- Prova concluída
    'exam_passed',            -- Prova aprovada
    'exam_failed',            -- Prova reprovada
    'document_uploaded',      -- Documento enviado
    'document_reviewed',      -- Documento revisado
    'document_approved',      -- Documento aprovado
    'document_rejected',      -- Documento rejeitado
    'interview_scheduled',    -- Entrevista agendada
    'interview_started',      -- Entrevista iniciada
    'interview_completed',    -- Entrevista concluída
    'interview_approved',     -- Entrevista aprovada
    'interview_rejected',     -- Entrevista rejeitada
    'certificate_issued',     -- Certificado emitido
    'certificate_downloaded', -- Certificado baixado
    'status_changed',         -- Status alterado
    'other'                   -- Outro
  ) NOT NULL,
  
  -- Descrição
  event_description TEXT,
  
  -- Datas
  event_date DATETIME NOT NULL,
  event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Dados relacionados
  related_phase_id INT,
  related_course_id INT,
  related_exam_id INT,
  related_interview_id INT,
  related_certificate_id INT,
  
  -- Detalhes adicionais
  event_data JSON,  -- Dados adicionais em JSON
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (related_phase_id) REFERENCES certification_phases(id),
  FOREIGN KEY (related_course_id) REFERENCES courses(id),
  FOREIGN KEY (related_exam_id) REFERENCES exams(id),
  FOREIGN KEY (related_interview_id) REFERENCES interviews(id),
  FOREIGN KEY (related_certificate_id) REFERENCES certificates(id),
  INDEX idx_user (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_event_date (event_date),
  INDEX idx_purchase (purchase_id)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `event_type`: Tipo de evento
- `event_description`: Descrição legível do evento
- `event_date`: Data/hora do evento
- `event_timestamp`: Timestamp automático
- `related_*_id`: Referências a entidades relacionadas
- `event_data`: Dados adicionais em JSON
- `ip_address`: IP do usuário
- `user_agent`: User agent do navegador

---

## 2. Tabela: system_access_log

**Descrição**: Registra todos os acessos ao sistema

```sql
CREATE TABLE system_access_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,  -- NULL para acessos não autenticados
  
  -- Acesso
  access_type ENUM('login', 'logout', 'page_view', 'api_call', 'file_download', 'file_upload') DEFAULT 'page_view',
  
  -- Informações de acesso
  page_url VARCHAR(500),
  page_title VARCHAR(255),
  referrer_url VARCHAR(500),
  
  -- Localização
  ip_address VARCHAR(45) NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  
  -- Dispositivo
  user_agent VARCHAR(500),
  device_type ENUM('desktop', 'tablet', 'mobile') DEFAULT 'desktop',
  browser_name VARCHAR(100),
  browser_version VARCHAR(50),
  os_name VARCHAR(100),
  
  -- Duração
  session_duration_seconds INT,
  
  -- Status
  access_status ENUM('success', 'failed', 'unauthorized', 'error') DEFAULT 'success',
  error_message TEXT,
  
  access_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_access_type (access_type),
  INDEX idx_access_date (access_date),
  INDEX idx_ip_address (ip_address)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário (NULL se não autenticado)
- `access_type`: Tipo de acesso
- `page_url`: URL acessada
- `page_title`: Título da página
- `ip_address`: IP do usuário
- `country`, `city`: Localização geográfica
- `user_agent`: Informações do navegador
- `device_type`: Tipo de dispositivo
- `browser_name`, `browser_version`: Navegador
- `os_name`: Sistema operacional
- `session_duration_seconds`: Duração da sessão
- `access_status`: Status do acesso
- `access_date`: Data/hora do acesso

---

## 3. Tabela: course_activity_log

**Descrição**: Registra atividades detalhadas em cada curso

```sql
CREATE TABLE course_activity_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  course_id INT NOT NULL,
  course_enrollment_id INT NOT NULL,
  
  -- Módulo/Aula
  module_number INT,
  module_name VARCHAR(255),
  lesson_number INT,
  lesson_name VARCHAR(255),
  
  -- Atividade
  activity_type ENUM(
    'course_accessed',       -- Acesso ao curso
    'module_accessed',       -- Acesso ao módulo
    'lesson_started',        -- Aula iniciada
    'lesson_viewed',         -- Aula visualizada
    'lesson_completed',      -- Aula concluída
    'material_downloaded',   -- Material baixado
    'quiz_started',          -- Quiz iniciado
    'quiz_completed',        -- Quiz concluído
    'exercise_attempted',    -- Exercício tentado
    'exercise_completed',    -- Exercício concluído
    'video_watched',         -- Vídeo assistido
    'note_added',            -- Nota adicionada
    'bookmark_added'         -- Marcador adicionado
  ) NOT NULL,
  
  -- Duração
  duration_seconds INT,
  time_spent_minutes INT,
  
  -- Progresso
  progress_percentage INT,
  
  -- Resultado (se aplicável)
  quiz_score DECIMAL(5, 2),
  exercise_score DECIMAL(5, 2),
  
  -- Datas
  activity_start_time DATETIME,
  activity_end_time DATETIME,
  activity_date DATETIME NOT NULL,
  
  -- Detalhes
  activity_details JSON,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (course_enrollment_id) REFERENCES course_enrollments(id),
  INDEX idx_user (user_id),
  INDEX idx_course (course_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_activity_date (activity_date)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `course_id`: Referência ao curso
- `course_enrollment_id`: Referência à inscrição
- `module_number`, `module_name`: Informações do módulo
- `lesson_number`, `lesson_name`: Informações da aula
- `activity_type`: Tipo de atividade
- `duration_seconds`: Duração em segundos
- `time_spent_minutes`: Tempo gasto em minutos
- `progress_percentage`: Percentual de progresso
- `quiz_score`, `exercise_score`: Notas
- `activity_start_time`, `activity_end_time`: Horários
- `activity_date`: Data da atividade
- `activity_details`: Dados adicionais em JSON

---

## 4. Tabela: exam_event_log

**Descrição**: Registra eventos detalhados da prova

```sql
CREATE TABLE exam_event_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  exam_id INT NOT NULL,
  exam_result_id INT,
  
  -- Evento
  event_type ENUM(
    'exam_scheduled',        -- Prova agendada
    'exam_rescheduled',      -- Prova reagendada
    'exam_started',          -- Prova iniciada
    'exam_paused',           -- Prova pausada
    'exam_resumed',          -- Prova retomada
    'question_answered',     -- Questão respondida
    'answer_reviewed',       -- Resposta revisada
    'exam_submitted',        -- Prova submetida
    'exam_completed',        -- Prova concluída
    'result_released',       -- Resultado liberado
    'score_recorded',        -- Pontuação registrada
    'passed',                -- Aprovado
    'failed',                -- Reprovado
    'exam_cancelled'         -- Prova cancelada
  ) NOT NULL,
  
  -- Datas
  scheduled_date DATE,
  scheduled_time TIME,
  start_time DATETIME,
  end_time DATETIME,
  duration_minutes INT,
  
  -- Questão (se aplicável)
  question_number INT,
  question_id INT,
  
  -- Resposta (se aplicável)
  user_answer VARCHAR(1),
  is_correct BOOLEAN,
  
  -- Resultado
  current_score DECIMAL(5, 2),
  final_score DECIMAL(5, 2),
  passing_score DECIMAL(5, 2),
  
  -- Detalhes
  event_description TEXT,
  event_data JSON,
  
  event_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (exam_result_id) REFERENCES exam_results(id),
  FOREIGN KEY (question_id) REFERENCES exam_questions(id),
  INDEX idx_user (user_id),
  INDEX idx_exam (exam_id),
  INDEX idx_event_type (event_type),
  INDEX idx_event_date (event_date)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `exam_id`: Referência à prova
- `exam_result_id`: Referência ao resultado
- `event_type`: Tipo de evento
- `scheduled_date`, `scheduled_time`: Data/hora agendada
- `start_time`, `end_time`: Horários de início/fim
- `duration_minutes`: Duração em minutos
- `question_number`, `question_id`: Informações da questão
- `user_answer`, `is_correct`: Resposta do usuário
- `current_score`, `final_score`: Pontuações
- `passing_score`: Pontuação mínima
- `event_date`: Data do evento

---

## 5. Tabela: interview_event_log

**Descrição**: Registra eventos detalhados da entrevista

```sql
CREATE TABLE interview_event_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  interview_schedule_id INT NOT NULL,
  interview_id INT,
  
  -- Evento
  event_type ENUM(
    'interview_scheduled',       -- Entrevista agendada
    'interview_rescheduled',     -- Entrevista reagendada
    'interview_reminder_sent',   -- Lembrete enviado
    'interview_started',         -- Entrevista iniciada
    'camera_enabled',            -- Câmera ativada
    'camera_disabled',           -- Câmera desativada
    'microphone_enabled',        -- Microfone ativado
    'microphone_disabled',       -- Microfone desativado
    'recording_started',         -- Gravação iniciada
    'recording_stopped',         -- Gravação parada
    'interview_paused',          -- Entrevista pausada
    'interview_resumed',         -- Entrevista retomada
    'interview_completed',       -- Entrevista concluída
    'score_recorded',            -- Pontuação registrada
    'recommendation_made',       -- Recomendação feita
    'result_released',           -- Resultado liberado
    'interview_cancelled'        -- Entrevista cancelada
  ) NOT NULL,
  
  -- Agendamento
  scheduled_date DATE,
  scheduled_time TIME,
  
  -- Realização
  start_time DATETIME,
  end_time DATETIME,
  duration_minutes INT,
  
  -- Entrevistador
  interviewer_id INT,
  interviewer_name VARCHAR(255),
  
  -- Resultado
  candidate_score DECIMAL(5, 2),
  recommendation ENUM('approved', 'rejected', 'pending_review'),
  
  -- Gravação
  recording_url VARCHAR(500),
  recording_duration_seconds INT,
  recording_file_size_mb DECIMAL(10, 2),
  
  -- Detalhes
  event_description TEXT,
  event_data JSON,
  
  event_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (interview_schedule_id) REFERENCES interview_schedules(id),
  FOREIGN KEY (interview_id) REFERENCES interviews(id),
  FOREIGN KEY (interviewer_id) REFERENCES interviewers(id),
  INDEX idx_user (user_id),
  INDEX idx_interview_schedule (interview_schedule_id),
  INDEX idx_event_type (event_type),
  INDEX idx_event_date (event_date)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `interview_schedule_id`: Referência ao agendamento
- `interview_id`: Referência à entrevista
- `event_type`: Tipo de evento
- `scheduled_date`, `scheduled_time`: Data/hora agendada
- `start_time`, `end_time`: Horários de início/fim
- `duration_minutes`: Duração em minutos
- `interviewer_id`, `interviewer_name`: Informações do entrevistador
- `candidate_score`: Pontuação do candidato
- `recommendation`: Recomendação
- `recording_url`, `recording_duration_seconds`, `recording_file_size_mb`: Informações da gravação
- `event_date`: Data do evento

---

## 6. Tabela: certificate_details

**Descrição**: Detalhes completos dos certificados

```sql
CREATE TABLE certificate_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  certificate_id INT NOT NULL,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  
  -- Identificação do Certificado
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  certificate_code VARCHAR(100) UNIQUE NOT NULL,
  certificate_hash VARCHAR(255),  -- Hash para verificação
  
  -- Informações de Emissão
  issue_date DATE NOT NULL,
  issue_time TIME,
  issue_datetime DATETIME NOT NULL,
  
  -- Informações de Validade
  expiration_date DATE,
  is_valid BOOLEAN DEFAULT TRUE,
  validity_period_years INT,
  
  -- Certificação
  certification_type_id INT NOT NULL,
  certification_level_id INT NOT NULL,
  certification_type_name VARCHAR(255),
  certification_level_name VARCHAR(255),
  
  -- Scores
  exam_score DECIMAL(5, 2),
  interview_score DECIMAL(5, 2),
  overall_score DECIMAL(5, 2),
  
  -- Documentos
  certificate_url VARCHAR(500),
  certificate_pdf_url VARCHAR(500),
  certificate_image_url VARCHAR(500),
  digital_signature VARCHAR(500),
  qr_code_url VARCHAR(500),
  
  -- Verificação
  verification_code VARCHAR(100),
  verification_url VARCHAR(500),
  
  -- Emissão
  issued_by_user_id INT,  -- Quem emitiu
  issued_by_name VARCHAR(255),
  
  -- Status
  status ENUM('draft', 'issued', 'active', 'expired', 'revoked', 'suspended') DEFAULT 'issued',
  revocation_date DATE,
  revocation_reason TEXT,
  
  -- Histórico
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  issued_at DATETIME,
  
  FOREIGN KEY (certificate_id) REFERENCES certificates(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (certification_type_id) REFERENCES certification_types(id),
  FOREIGN KEY (certification_level_id) REFERENCES certification_levels(id),
  FOREIGN KEY (issued_by_user_id) REFERENCES users(id),
  INDEX idx_certificate_number (certificate_number),
  INDEX idx_certificate_code (certificate_code),
  INDEX idx_user (user_id),
  INDEX idx_issue_date (issue_date),
  INDEX idx_expiration_date (expiration_date),
  INDEX idx_status (status),
  INDEX idx_verification_code (verification_code)
);
```

**Campos:**
- `id`: Identificador único
- `certificate_id`: Referência ao certificado
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `certificate_number`: Número único do certificado
- `certificate_code`: Código único do certificado
- `certificate_hash`: Hash para verificação
- `issue_date`, `issue_time`, `issue_datetime`: Data/hora de emissão
- `expiration_date`: Data de expiração
- `is_valid`: Válido?
- `validity_period_years`: Período de validade
- `certification_type_id`, `certification_level_id`: Tipo e nível
- `exam_score`, `interview_score`, `overall_score`: Pontuações
- `certificate_url`, `certificate_pdf_url`, `certificate_image_url`: URLs
- `digital_signature`: Assinatura digital
- `qr_code_url`: URL do QR code
- `verification_code`: Código de verificação
- `verification_url`: URL para verificação
- `issued_by_user_id`, `issued_by_name`: Quem emitiu
- `status`: Status do certificado
- `revocation_date`, `revocation_reason`: Informações de revogação

---

## 7. Tabela: approval_audit_log

**Descrição**: Auditoria completa de todas as aprovações

```sql
CREATE TABLE approval_audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  
  -- Aprovação
  approval_type ENUM(
    'curriculum_approved',
    'documents_approved',
    'exam_approved',
    'interview_approved',
    'certificate_approved',
    'overall_approved'
  ) NOT NULL,
  
  -- Datas
  approval_request_date DATETIME,
  approval_date DATETIME NOT NULL,
  approval_time TIME,
  
  -- Revisor
  approved_by_user_id INT NOT NULL,
  approved_by_name VARCHAR(255),
  approved_by_role VARCHAR(100),
  
  -- Detalhes
  approval_reason TEXT,
  approval_notes TEXT,
  approval_criteria_met JSON,
  
  -- Revisões anteriores
  revision_count INT DEFAULT 0,
  previous_rejection_count INT DEFAULT 0,
  
  -- Status
  approval_status ENUM('approved', 'conditionally_approved', 'pending_review', 'rejected') DEFAULT 'approved',
  
  -- Documentos
  approval_document_url VARCHAR(500),
  approval_signature_url VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_approval_type (approval_type),
  INDEX idx_approval_date (approval_date),
  INDEX idx_approved_by (approved_by_user_id)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `approval_type`: Tipo de aprovação
- `approval_request_date`: Data do pedido
- `approval_date`, `approval_time`: Data/hora da aprovação
- `approved_by_user_id`, `approved_by_name`, `approved_by_role`: Informações do aprovador
- `approval_reason`: Motivo da aprovação
- `approval_notes`: Notas
- `approval_criteria_met`: Critérios atendidos em JSON
- `revision_count`: Número de revisões
- `previous_rejection_count`: Rejeições anteriores
- `approval_status`: Status da aprovação
- `approval_document_url`, `approval_signature_url`: Documentos

---

## 8. Tabela: consolidated_timeline

**Descrição**: Timeline consolidada com marcos principais

```sql
CREATE TABLE consolidated_timeline (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  
  -- Datas principais
  account_creation_date DATETIME,
  purchase_date DATETIME,
  payment_received_date DATETIME,
  
  -- Cursos (se aplicável)
  first_course_access_date DATETIME,
  first_course_start_date DATETIME,
  last_course_activity_date DATETIME,
  all_courses_completed_date DATETIME,
  
  -- Prova
  exam_scheduled_date DATETIME,
  exam_start_date DATETIME,
  exam_completion_date DATETIME,
  exam_result_date DATETIME,
  
  -- Documentação
  first_document_upload_date DATETIME,
  last_document_upload_date DATETIME,
  documents_approval_date DATETIME,
  
  -- Entrevista
  interview_scheduled_date DATETIME,
  interview_start_date DATETIME,
  interview_completion_date DATETIME,
  interview_result_date DATETIME,
  
  -- Aprovação Final
  final_approval_date DATETIME,
  
  -- Certificado
  certificate_issue_date DATETIME,
  certificate_download_date DATETIME,
  
  -- Duração Total
  total_days_to_completion INT,
  total_days_from_purchase INT,
  
  -- Status
  current_status VARCHAR(100),
  completion_percentage INT,
  
  -- Notas
  timeline_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  UNIQUE KEY unique_timeline (user_id, purchase_id),
  INDEX idx_user (user_id),
  INDEX idx_purchase (purchase_id),
  INDEX idx_completion_date (final_approval_date)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `account_creation_date`: Data de criação da conta
- `purchase_date`: Data da compra
- `payment_received_date`: Data do pagamento
- `first_course_access_date`: Primeiro acesso a curso
- `first_course_start_date`: Início do primeiro curso
- `last_course_activity_date`: Última atividade em curso
- `all_courses_completed_date`: Conclusão de todos os cursos
- `exam_scheduled_date`: Data do agendamento da prova
- `exam_start_date`: Início da prova
- `exam_completion_date`: Conclusão da prova
- `exam_result_date`: Data do resultado
- `first_document_upload_date`: Primeiro upload
- `last_document_upload_date`: Último upload
- `documents_approval_date`: Aprovação dos documentos
- `interview_scheduled_date`: Agendamento da entrevista
- `interview_start_date`: Início da entrevista
- `interview_completion_date`: Conclusão da entrevista
- `interview_result_date`: Data do resultado
- `final_approval_date`: Aprovação final
- `certificate_issue_date`: Emissão do certificado
- `certificate_download_date`: Download do certificado
- `total_days_to_completion`: Dias para completar
- `total_days_from_purchase`: Dias desde a compra

---

## 📊 Consultas Úteis

### Timeline Completa de um Usuário
```sql
SELECT 
  uet.event_type,
  uet.event_description,
  uet.event_date,
  uet.related_phase_id,
  uet.related_course_id,
  uet.related_exam_id,
  uet.related_interview_id
FROM user_event_timeline uet
WHERE uet.user_id = ? AND uet.purchase_id = ?
ORDER BY uet.event_date ASC;
```

### Datas Principais de um Candidato
```sql
SELECT 
  ct.account_creation_date,
  ct.purchase_date,
  ct.payment_received_date,
  ct.first_course_access_date,
  ct.exam_scheduled_date,
  ct.exam_start_date,
  ct.interview_scheduled_date,
  ct.certificate_issue_date,
  ct.total_days_to_completion
FROM consolidated_timeline ct
WHERE ct.user_id = ? AND ct.purchase_id = ?;
```

### Atividades de Estudo por Curso
```sql
SELECT 
  c.title,
  COUNT(cal.id) as total_activities,
  SUM(cal.time_spent_minutes) as total_minutes_spent,
  MAX(cal.activity_date) as last_activity,
  SUM(CASE WHEN cal.activity_type = 'lesson_completed' THEN 1 ELSE 0 END) as lessons_completed
FROM course_activity_log cal
JOIN courses c ON cal.course_id = c.id
WHERE cal.user_id = ? AND cal.purchase_id = ?
GROUP BY c.id, c.title
ORDER BY c.course_order;
```

### Eventos da Prova
```sql
SELECT 
  eel.event_type,
  eel.event_date,
  eel.current_score,
  eel.final_score,
  eel.question_number,
  eel.is_correct
FROM exam_event_log eel
WHERE eel.user_id = ? AND eel.exam_id = ?
ORDER BY eel.event_date ASC;
```

### Eventos da Entrevista
```sql
SELECT 
  iel.event_type,
  iel.event_date,
  iel.start_time,
  iel.end_time,
  iel.interviewer_name,
  iel.candidate_score,
  iel.recommendation
FROM interview_event_log iel
WHERE iel.user_id = ? AND iel.interview_schedule_id = ?
ORDER BY iel.event_date ASC;
```

### Certificados Emitidos
```sql
SELECT 
  cd.certificate_number,
  cd.certificate_code,
  cd.issue_date,
  cd.expiration_date,
  cd.status,
  cd.overall_score,
  cd.verification_code
FROM certificate_details cd
WHERE cd.user_id = ?
ORDER BY cd.issue_date DESC;
```

### Aprovações Registradas
```sql
SELECT 
  aal.approval_type,
  aal.approval_date,
  aal.approved_by_name,
  aal.approval_status,
  aal.approval_reason
FROM approval_audit_log aal
WHERE aal.user_id = ? AND aal.purchase_id = ?
ORDER BY aal.approval_date DESC;
```

---

## 📈 Relatórios Possíveis

1. **Relatório de Progresso**: Mostra timeline completa com todas as datas
2. **Relatório de Atividades**: Detalhes de acesso, estudo, prova e entrevista
3. **Relatório de Certificado**: Número, código, data de emissão, validade
4. **Relatório de Aprovações**: Todas as aprovações com datas e responsáveis
5. **Relatório de Auditoria**: Todas as ações com timestamps
6. **Relatório Executivo**: Resumo com marcos principais

---

**Versão**: 1.0  
**Data**: 02 de Junho de 2026  
**Status**: Completo e Pronto para Implementação
