# Mapa Completo de Banco de Dados MySQL
## Plataforma de Certificação CCA

---

## 📋 Índice de Tabelas
1. [Usuários](#1-tabela-users)
2. [Tipos de Certificação](#2-tabela-certification-types)
3. [Níveis de Certificação](#3-tabela-certification-levels)
4. [Tipos de Compra](#4-tabela-purchase-types)
5. [Compras/Pedidos](#5-tabela-purchases)
6. [Cursos](#6-tabela-courses)
7. [Inscrições em Cursos](#7-tabela-course-enrollments)
8. [Provas](#8-tabela-exams)
9. [Questões de Prova](#9-tabela-exam-questions)
10. [Respostas de Prova](#10-tabela-exam-answers)
11. [Resultados de Prova](#11-tabela-exam-results)
12. [Entrevistadores](#12-tabela-interviewers)
13. [Agendamentos de Entrevista](#13-tabela-interview-schedules)
14. [Entrevistas](#14-tabela-interviews)
15. [Gravações de Entrevista](#15-tabela-interview-recordings)
16. [Documentos Enviados](#16-tabela-uploaded-documents)
17. [Currículos](#17-tabela-curricula)
18. [Certificados](#18-tabela-certificates)
19. [Pagamentos](#19-tabela-payments)
20. [Logs de Atividade](#20-tabela-activity-logs)

---

## 1. Tabela: users

**Descrição**: Armazena informações dos usuários da plataforma

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  current_position VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  INDEX idx_email (email),
  INDEX idx_cpf (cpf),
  INDEX idx_created_at (created_at)
);
```

**Campos:**
- `id`: Identificador único
- `email`: Email único do usuário
- `password_hash`: Senha criptografada
- `full_name`: Nome completo
- `cpf`: CPF único
- `phone`: Telefone
- `birth_date`: Data de nascimento
- `current_position`: Cargo atual
- `created_at`: Data de criação
- `updated_at`: Data de última atualização
- `is_active`: Ativo/Inativo

---

## 2. Tabela: certification_types

**Descrição**: Tipos de certificação disponíveis (CCA, XXX, Liderança)

```sql
CREATE TABLE certification_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name)
);
```

**Campos:**
- `id`: Identificador único
- `name`: Nome da certificação (CCA, XXX, Liderança)
- `description`: Descrição detalhada
- `icon_url`: URL do ícone
- `is_active`: Ativo/Inativo
- `created_at`: Data de criação

**Dados Iniciais:**
```sql
INSERT INTO certification_types (name, description) VALUES
('CCA', 'Certificação de Consultor de Conformidade Ambiental'),
('XXX', 'Certificação Especializada em Gestão'),
('Liderança', 'Certificação em Desenvolvimento de Liderança');
```

---

## 3. Tabela: certification_levels

**Descrição**: Níveis de certificação (Nível 1, Nível 2)

```sql
CREATE TABLE certification_levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  level_number INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  min_experience_years INT,
  max_experience_years INT,
  required_education VARCHAR(255),
  includes_courses BOOLEAN,
  includes_exam BOOLEAN,
  includes_interview BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_level_number (level_number)
);
```

**Campos:**
- `id`: Identificador único
- `level_number`: Número do nível (1, 2)
- `name`: Nome do nível
- `description`: Descrição
- `min_experience_years`: Experiência mínima
- `max_experience_years`: Experiência máxima
- `required_education`: Formação obrigatória
- `includes_courses`: Inclui cursos?
- `includes_exam`: Inclui prova?
- `includes_interview`: Inclui entrevista?
- `created_at`: Data de criação

**Dados Iniciais:**
```sql
INSERT INTO certification_levels (level_number, name, description, min_experience_years, required_education, includes_courses, includes_exam, includes_interview) VALUES
(1, 'Nível 1', 'Para profissionais em desenvolvimento', 2, 'Graduação', TRUE, TRUE, TRUE),
(2, 'Nível 2', 'Para profissionais experientes', 5, 'Pós-graduação/MBA', FALSE, FALSE, TRUE);
```

---

## 4. Tabela: purchase_types

**Descrição**: Tipos de compra disponíveis

```sql
CREATE TABLE purchase_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  certification_level_id INT NOT NULL,
  includes_courses BOOLEAN,
  includes_exam BOOLEAN,
  includes_interview BOOLEAN,
  course_hours INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (certification_level_id) REFERENCES certification_levels(id),
  INDEX idx_code (code),
  INDEX idx_level (certification_level_id)
);
```

**Campos:**
- `id`: Identificador único
- `code`: Código único (ex: CERT_WITH_COURSE)
- `name`: Nome da opção de compra
- `description`: Descrição
- `price`: Preço em reais
- `certification_level_id`: Referência ao nível de certificação
- `includes_courses`: Inclui cursos?
- `includes_exam`: Inclui prova?
- `includes_interview`: Inclui entrevista?
- `course_hours`: Total de horas de curso
- `created_at`: Data de criação

**Dados Iniciais:**
```sql
INSERT INTO purchase_types (code, name, description, price, certification_level_id, includes_courses, includes_exam, includes_interview, course_hours) VALUES
('CERT_WITH_COURSE', 'Certificação + Pacote de Aprendizado', 'Acesso aos cursos + Prova + Entrevista + Certificado', 1500.00, 1, TRUE, TRUE, TRUE, 70),
('CERT_DIRECT', 'Certificação Direta', 'Sem cursos - Vai direto para prova e entrevista', 800.00, 1, FALSE, TRUE, TRUE, 0),
('COURSE_ONLY', 'Apenas Pacote de Aprendizado', 'Acesso aos cursos sem certificação', 500.00, 1, TRUE, FALSE, FALSE, 70),
('LEVEL2', 'Certificação Nível 2', 'Certificação profissional com entrevista', 1200.00, 2, FALSE, FALSE, TRUE, 0);
```

---

## 5. Tabela: purchases

**Descrição**: Registra todas as compras/pedidos dos usuários

```sql
CREATE TABLE purchases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  certification_type_id INT NOT NULL,
  certification_level_id INT NOT NULL,
  purchase_type_id INT NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completion_date DATETIME,
  notes TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (certification_type_id) REFERENCES certification_types(id),
  FOREIGN KEY (certification_level_id) REFERENCES certification_levels(id),
  FOREIGN KEY (purchase_type_id) REFERENCES purchase_types(id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_order_number (order_number),
  INDEX idx_purchase_date (purchase_date)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `certification_type_id`: Tipo de certificação
- `certification_level_id`: Nível de certificação
- `purchase_type_id`: Tipo de compra
- `order_number`: Número do pedido único
- `status`: Status (pending, completed, cancelled, refunded)
- `total_amount`: Valor total
- `purchase_date`: Data da compra
- `completion_date`: Data de conclusão
- `notes`: Observações

---

## 6. Tabela: courses

**Descrição**: Cursos disponíveis na plataforma

```sql
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_name VARCHAR(255),
  duration_hours INT,
  course_order INT,
  content_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_code (code),
  INDEX idx_course_order (course_order)
);
```

**Campos:**
- `id`: Identificador único
- `code`: Código único do curso
- `title`: Título do curso
- `description`: Descrição
- `instructor_name`: Nome do instrutor
- `duration_hours`: Duração em horas
- `course_order`: Ordem de apresentação
- `content_url`: URL do conteúdo
- `is_active`: Ativo/Inativo
- `created_at`: Data de criação

**Dados Iniciais:**
```sql
INSERT INTO courses (code, title, description, duration_hours, course_order) VALUES
('CURSO_001', 'Fundamentos de Conformidade', 'Introdução aos conceitos básicos', 12, 1),
('CURSO_002', 'Legislação Ambiental', 'Leis e regulamentações aplicáveis', 14, 2),
('CURSO_003', 'Gestão de Riscos', 'Identificação e mitigação de riscos', 12, 3),
('CURSO_004', 'Auditoria Interna', 'Processos de auditoria', 10, 4),
('CURSO_005', 'Relatórios e Documentação', 'Preparação de relatórios', 11, 5),
('CURSO_006', 'Estudos de Caso', 'Análise de casos práticos', 11, 6);
```

---

## 7. Tabela: course_enrollments

**Descrição**: Registra inscrição dos usuários nos cursos

```sql
CREATE TABLE course_enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  purchase_id INT NOT NULL,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completion_date DATETIME,
  progress_percentage INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  UNIQUE KEY unique_enrollment (user_id, course_id, purchase_id),
  INDEX idx_user (user_id),
  INDEX idx_course (course_id),
  INDEX idx_is_completed (is_completed)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `course_id`: Referência ao curso
- `purchase_id`: Referência à compra
- `enrollment_date`: Data de inscrição
- `completion_date`: Data de conclusão
- `progress_percentage`: Percentual de progresso (0-100)
- `is_completed`: Curso concluído?

---

## 8. Tabela: exams

**Descrição**: Provas de certificação

```sql
CREATE TABLE exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  certification_level_id INT NOT NULL,
  total_questions INT DEFAULT 60,
  duration_minutes INT DEFAULT 120,
  passing_score DECIMAL(5, 2) DEFAULT 60.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (certification_level_id) REFERENCES certification_levels(id),
  INDEX idx_code (code),
  INDEX idx_level (certification_level_id)
);
```

**Campos:**
- `id`: Identificador único
- `code`: Código único da prova
- `title`: Título da prova
- `description`: Descrição
- `certification_level_id`: Nível de certificação
- `total_questions`: Total de questões
- `duration_minutes`: Duração em minutos
- `passing_score`: Nota mínima para passar
- `is_active`: Ativo/Inativo
- `created_at`: Data de criação

---

## 9. Tabela: exam_questions

**Descrição**: Questões das provas

```sql
CREATE TABLE exam_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('multiple_choice', 'true_false', 'short_answer') DEFAULT 'multiple_choice',
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  option_e TEXT,
  correct_answer VARCHAR(1),
  difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  INDEX idx_exam (exam_id),
  INDEX idx_question_number (question_number)
);
```

**Campos:**
- `id`: Identificador único
- `exam_id`: Referência à prova
- `question_number`: Número da questão
- `question_text`: Texto da questão
- `question_type`: Tipo de questão
- `option_a` a `option_e`: Opções de resposta
- `correct_answer`: Resposta correta (A, B, C, D, E)
- `difficulty_level`: Nível de dificuldade
- `created_at`: Data de criação

---

## 10. Tabela: exam_answers

**Descrição**: Respostas dos usuários nas provas

```sql
CREATE TABLE exam_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_result_id INT NOT NULL,
  question_id INT NOT NULL,
  user_answer VARCHAR(1),
  is_correct BOOLEAN,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (exam_result_id) REFERENCES exam_results(id),
  FOREIGN KEY (question_id) REFERENCES exam_questions(id),
  INDEX idx_exam_result (exam_result_id),
  INDEX idx_question (question_id)
);
```

**Campos:**
- `id`: Identificador único
- `exam_result_id`: Referência ao resultado da prova
- `question_id`: Referência à questão
- `user_answer`: Resposta do usuário
- `is_correct`: Resposta correta?
- `answered_at`: Data/hora da resposta

---

## 11. Tabela: exam_results

**Descrição**: Resultados das provas dos usuários

```sql
CREATE TABLE exam_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  exam_id INT NOT NULL,
  purchase_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  total_questions INT,
  correct_answers INT,
  score DECIMAL(5, 2),
  status ENUM('in_progress', 'completed', 'failed', 'passed') DEFAULT 'in_progress',
  passed BOOLEAN,
  recording_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  INDEX idx_user (user_id),
  INDEX idx_exam (exam_id),
  INDEX idx_status (status),
  INDEX idx_passed (passed),
  INDEX idx_created_at (created_at)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `exam_id`: Referência à prova
- `purchase_id`: Referência à compra
- `start_time`: Hora de início
- `end_time`: Hora de término
- `total_questions`: Total de questões
- `correct_answers`: Respostas corretas
- `score`: Pontuação final
- `status`: Status (in_progress, completed, failed, passed)
- `passed`: Passou?
- `recording_url`: URL da gravação
- `created_at`: Data de criação

---

## 12. Tabela: interviewers

**Descrição**: Entrevistadores da plataforma

```sql
CREATE TABLE interviewers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  specialization VARCHAR(255),
  bio TEXT,
  photo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  availability_status ENUM('available', 'busy', 'on_leave') DEFAULT 'available',
  max_interviews_per_day INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_is_active (is_active),
  INDEX idx_availability (availability_status)
);
```

**Campos:**
- `id`: Identificador único
- `full_name`: Nome completo
- `email`: Email único
- `phone`: Telefone
- `specialization`: Especialização
- `bio`: Biografia/Descrição
- `photo_url`: URL da foto
- `is_active`: Ativo/Inativo
- `availability_status`: Status de disponibilidade
- `max_interviews_per_day`: Máximo de entrevistas por dia
- `created_at`: Data de criação
- `updated_at`: Data de última atualização

**Dados Iniciais:**
```sql
INSERT INTO interviewers (full_name, email, specialization, bio) VALUES
('Dr. Carlos Silva', 'carlos.silva@anefac.com', 'Especialista em Conformidade', 'Especialista em conformidade ambiental com 15 anos de experiência'),
('Dra. Marina Santos', 'marina.santos@anefac.com', 'Auditora Sênior', 'Auditora sênior certificada com foco em gestão de riscos'),
('Prof. Roberto Costa', 'roberto.costa@anefac.com', 'Consultor de Governança', 'Professor e consultor especializado em governança corporativa'),
('Dra. Fernanda Oliveira', 'fernanda.oliveira@anefac.com', 'Especialista em Controladoria', 'Especialista em controladoria e gestão financeira'),
('Dr. Lucas Pereira', 'lucas.pereira@anefac.com', 'Auditor Certificado', 'Auditor certificado com experiência em auditoria interna');
```

---

## 13. Tabela: interview_schedules

**Descrição**: Agendamentos de entrevista

```sql
CREATE TABLE interview_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  interviewer_id INT NOT NULL,
  purchase_id INT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  scheduled_datetime DATETIME NOT NULL,
  duration_minutes INT DEFAULT 30,
  status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (interviewer_id) REFERENCES interviewers(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  INDEX idx_user (user_id),
  INDEX idx_interviewer (interviewer_id),
  INDEX idx_scheduled_date (scheduled_date),
  INDEX idx_status (status),
  UNIQUE KEY unique_schedule (interviewer_id, scheduled_datetime)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `interviewer_id`: Referência ao entrevistador
- `purchase_id`: Referência à compra
- `scheduled_date`: Data agendada
- `scheduled_time`: Hora agendada
- `scheduled_datetime`: Data e hora combinadas
- `duration_minutes`: Duração em minutos
- `status`: Status (scheduled, confirmed, completed, cancelled, rescheduled)
- `notes`: Observações
- `created_at`: Data de criação
- `updated_at`: Data de última atualização

---

## 14. Tabela: interviews

**Descrição**: Registros das entrevistas realizadas

```sql
CREATE TABLE interviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  interview_schedule_id INT NOT NULL,
  user_id INT NOT NULL,
  interviewer_id INT NOT NULL,
  purchase_id INT NOT NULL,
  start_time DATETIME,
  end_time DATETIME,
  duration_minutes INT,
  status ENUM('not_started', 'in_progress', 'completed', 'cancelled') DEFAULT 'not_started',
  interviewer_notes TEXT,
  candidate_score DECIMAL(5, 2),
  recommendation ENUM('approved', 'rejected', 'pending_review') DEFAULT 'pending_review',
  recording_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (interview_schedule_id) REFERENCES interview_schedules(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (interviewer_id) REFERENCES interviewers(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  INDEX idx_user (user_id),
  INDEX idx_interviewer (interviewer_id),
  INDEX idx_status (status),
  INDEX idx_recommendation (recommendation),
  INDEX idx_created_at (created_at)
);
```

**Campos:**
- `id`: Identificador único
- `interview_schedule_id`: Referência ao agendamento
- `user_id`: Referência ao usuário
- `interviewer_id`: Referência ao entrevistador
- `purchase_id`: Referência à compra
- `start_time`: Hora de início
- `end_time`: Hora de término
- `duration_minutes`: Duração em minutos
- `status`: Status (not_started, in_progress, completed, cancelled)
- `interviewer_notes`: Notas do entrevistador
- `candidate_score`: Pontuação do candidato
- `recommendation`: Recomendação (approved, rejected, pending_review)
- `recording_url`: URL da gravação
- `created_at`: Data de criação
- `updated_at`: Data de última atualização

---

## 15. Tabela: interview_recordings

**Descrição**: Armazena informações sobre gravações de entrevista

```sql
CREATE TABLE interview_recordings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  interview_id INT NOT NULL,
  user_id INT NOT NULL,
  recording_url VARCHAR(500) NOT NULL,
  file_size_mb DECIMAL(10, 2),
  duration_seconds INT,
  video_format VARCHAR(50),
  audio_format VARCHAR(50),
  storage_location VARCHAR(255),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (interview_id) REFERENCES interviews(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_interview (interview_id),
  INDEX idx_user (user_id),
  INDEX idx_created_at (created_at)
);
```

**Campos:**
- `id`: Identificador único
- `interview_id`: Referência à entrevista
- `user_id`: Referência ao usuário
- `recording_url`: URL da gravação
- `file_size_mb`: Tamanho do arquivo em MB
- `duration_seconds`: Duração em segundos
- `video_format`: Formato de vídeo
- `audio_format`: Formato de áudio
- `storage_location`: Local de armazenamento
- `is_available`: Disponível?
- `created_at`: Data de criação

---

## 16. Tabela: uploaded_documents

**Descrição**: Documentos enviados pelos usuários

```sql
CREATE TABLE uploaded_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  document_type ENUM('experience_certificate', 'academic_certificate', 'curriculum', 'other') DEFAULT 'other',
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size_mb DECIMAL(10, 2),
  mime_type VARCHAR(100),
  description TEXT,
  status ENUM('pending_review', 'approved', 'rejected', 'requested_reupload') DEFAULT 'pending_review',
  reviewer_notes TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  INDEX idx_user (user_id),
  INDEX idx_purchase (purchase_id),
  INDEX idx_status (status),
  INDEX idx_uploaded_at (uploaded_at)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `document_type`: Tipo de documento
- `file_name`: Nome do arquivo
- `file_url`: URL do arquivo
- `file_size_mb`: Tamanho em MB
- `mime_type`: Tipo MIME
- `description`: Descrição
- `status`: Status (pending_review, approved, rejected, requested_reupload)
- `reviewer_notes`: Notas do revisor
- `uploaded_at`: Data de upload
- `reviewed_at`: Data de revisão

---

## 17. Tabela: curricula

**Descrição**: Informações de currículo dos usuários

```sql
CREATE TABLE curricula (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  
  -- Dados Pessoais
  full_name VARCHAR(255),
  cpf VARCHAR(14),
  email VARCHAR(255),
  phone VARCHAR(20),
  birth_date DATE,
  
  -- Formação Acadêmica
  highest_education VARCHAR(255),
  graduation_institution VARCHAR(255),
  graduation_course VARCHAR(255),
  graduation_year INT,
  
  -- MBA/Pós-graduação
  has_mba BOOLEAN DEFAULT FALSE,
  mba_institution VARCHAR(255),
  mba_course VARCHAR(255),
  mba_year INT,
  
  -- Experiência Profissional
  total_experience_years INT,
  current_position VARCHAR(255),
  current_company VARCHAR(255),
  
  -- Liderança
  leadership_experience_years INT,
  leadership_description TEXT,
  
  -- Informações Adicionais
  main_achievements TEXT,
  additional_certifications TEXT,
  
  status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  INDEX idx_user (user_id),
  INDEX idx_status (status)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- Campos de dados pessoais, formação, experiência, liderança
- `status`: Status (draft, submitted, approved, rejected)
- `created_at`: Data de criação
- `updated_at`: Data de última atualização

---

## 18. Tabela: certificates

**Descrição**: Certificados emitidos aos usuários

```sql
CREATE TABLE certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  purchase_id INT NOT NULL,
  interview_id INT,
  certification_type_id INT NOT NULL,
  certification_level_id INT NOT NULL,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  expiration_date DATE,
  status ENUM('issued', 'active', 'expired', 'revoked') DEFAULT 'issued',
  certificate_url VARCHAR(500),
  digital_signature VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (interview_id) REFERENCES interviews(id),
  FOREIGN KEY (certification_type_id) REFERENCES certification_types(id),
  FOREIGN KEY (certification_level_id) REFERENCES certification_levels(id),
  INDEX idx_user (user_id),
  INDEX idx_certificate_number (certificate_number),
  INDEX idx_status (status),
  INDEX idx_issue_date (issue_date)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário
- `purchase_id`: Referência à compra
- `interview_id`: Referência à entrevista
- `certification_type_id`: Tipo de certificação
- `certification_level_id`: Nível de certificação
- `certificate_number`: Número único do certificado
- `issue_date`: Data de emissão
- `expiration_date`: Data de expiração
- `status`: Status (issued, active, expired, revoked)
- `certificate_url`: URL do certificado
- `digital_signature`: Assinatura digital
- `created_at`: Data de criação

---

## 19. Tabela: payments

**Descrição**: Registros de pagamentos

```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  purchase_id INT NOT NULL,
  user_id INT NOT NULL,
  payment_method ENUM('credit_card', 'debit_card', 'bank_transfer', 'pix', 'other') DEFAULT 'credit_card',
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  transaction_id VARCHAR(255),
  gateway_response TEXT,
  paid_at DATETIME,
  refunded_at DATETIME,
  refund_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_purchase (purchase_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_created_at (created_at)
);
```

**Campos:**
- `id`: Identificador único
- `purchase_id`: Referência à compra
- `user_id`: Referência ao usuário
- `payment_method`: Método de pagamento
- `amount`: Valor
- `currency`: Moeda
- `status`: Status (pending, processing, completed, failed, refunded)
- `transaction_id`: ID da transação
- `gateway_response`: Resposta do gateway
- `paid_at`: Data de pagamento
- `refunded_at`: Data de reembolso
- `refund_reason`: Motivo do reembolso
- `created_at`: Data de criação
- `updated_at`: Data de última atualização

---

## 20. Tabela: activity_logs

**Descrição**: Log de atividades do sistema

```sql
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  status ENUM('success', 'failure') DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário (pode ser NULL para ações do sistema)
- `action`: Ação realizada
- `entity_type`: Tipo de entidade afetada
- `entity_id`: ID da entidade
- `description`: Descrição da ação
- `ip_address`: Endereço IP
- `user_agent`: User Agent do navegador
- `status`: Status (success, failure)
- `error_message`: Mensagem de erro
- `created_at`: Data de criação

---

## 📊 Diagrama de Relacionamentos

```
users
├── purchases (1:N)
│   ├── payments (1:N)
│   ├── course_enrollments (1:N)
│   │   └── courses (N:1)
│   ├── exam_results (1:N)
│   │   ├── exams (N:1)
│   │   ├── exam_answers (1:N)
│   │   │   └── exam_questions (N:1)
│   │   └── exam_questions (N:1)
│   ├── interview_schedules (1:N)
│   │   ├── interviewers (N:1)
│   │   └── interviews (1:1)
│   │       ├── interviewers (N:1)
│   │       ├── interview_recordings (1:N)
│   │       └── interviews (N:1)
│   ├── uploaded_documents (1:N)
│   └── curricula (1:1)
├── interview_schedules (1:N)
├── interviews (1:N)
├── interview_recordings (1:N)
├── uploaded_documents (1:N)
├── activity_logs (1:N)
└── certificates (1:N)

certification_types
└── purchases (1:N)

certification_levels
├── purchase_types (1:N)
├── exams (1:N)
└── purchases (1:N)

purchase_types
└── purchases (1:N)

courses
└── course_enrollments (1:N)

exams
├── exam_questions (1:N)
└── exam_results (1:N)

interviewers
├── interview_schedules (1:N)
└── interviews (1:N)
```

---

## 🔐 Índices Recomendados

### Performance
- `users`: email, cpf, created_at
- `purchases`: user_id, status, order_number, purchase_date
- `exam_results`: user_id, exam_id, status, passed, created_at
- `interviews`: user_id, interviewer_id, status, recommendation, created_at
- `interview_schedules`: user_id, interviewer_id, scheduled_date, status
- `uploaded_documents`: user_id, purchase_id, status, uploaded_at
- `payments`: purchase_id, user_id, status, transaction_id, created_at

### Integridade
- Chaves estrangeiras em todas as tabelas relacionadas
- Constraints UNIQUE em campos únicos
- Constraints NOT NULL em campos obrigatórios

---

## 📝 Notas Importantes

1. **Segurança de Dados**: Todos os dados sensíveis (CPF, senhas) devem ser criptografados
2. **Backup**: Implementar backup automático diário
3. **Auditoria**: Usar `activity_logs` para rastrear todas as ações
4. **Retenção**: Definir política de retenção de dados (ex: 7 anos para certificados)
5. **Performance**: Revisar índices conforme o volume de dados crescer
6. **Escalabilidade**: Considerar particionamento de tabelas grandes (ex: activity_logs, exam_answers)

---

**Versão**: 1.0  
**Data**: 02 de Junho de 2026  
**Status**: Completo e Pronto para Implementação
