# Arquitetura Multi-Certificação
## Plataforma de Certificações Profissionais

---

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura de Dados](#estrutura-de-dados)
3. [Configuração de Certificações](#configuração-de-certificações)
4. [Fluxos Parametrizados](#fluxos-parametrizados)
5. [Exemplos de Certificações](#exemplos-de-certificações)
6. [Implementação Frontend](#implementação-frontend)
7. [Implementação Backend](#implementação-backend)
8. [Escalabilidade](#escalabilidade)

---

## Visão Geral

### Objetivo
Criar uma plataforma que suporte múltiplas certificações profissionais, cada uma com:
- Seus próprios níveis
- Seus próprios requisitos
- Seus próprios fluxos de aprovação
- Seus próprios processos de avaliação

### Princípios
1. **Reutilização**: Componentes genéricos reutilizáveis
2. **Configuração**: Fluxos definidos por configuração, não por código
3. **Escalabilidade**: Fácil adicionar novas certificações
4. **Independência**: Cada certificação é independente
5. **Auditoria**: Rastreamento completo de todas as ações

---

## Estrutura de Dados

### Tabelas Principais (Já Existem)

```
certification_types (CCA, XXX, Liderança, etc.)
├── certification_levels (Nível 1, Nível 2, etc.)
│   ├── purchase_types (Opções de compra)
│   ├── exams (Provas específicas)
│   ├── certification_phases (Fases do processo)
│   └── courses (Cursos preparatórios)
│
└── users (Candidatos)
    └── purchases (Compras)
        ├── course_enrollments (Inscrições em cursos)
        ├── exam_results (Resultados de provas)
        ├── interview_schedules (Agendamentos)
        ├── interviews (Entrevistas)
        └── certificates (Certificados)
```

### Nova Tabela: certification_configuration

**Descrição**: Configuração completa de cada certificação

```sql
CREATE TABLE certification_configuration (
  id INT PRIMARY KEY AUTO_INCREMENT,
  certification_type_id INT NOT NULL UNIQUE,
  
  -- Informações Básicas
  display_name VARCHAR(255) NOT NULL,
  short_description TEXT,
  long_description TEXT,
  icon_url VARCHAR(500),
  banner_url VARCHAR(500),
  
  -- Configuração de Níveis
  has_levels BOOLEAN DEFAULT TRUE,
  number_of_levels INT DEFAULT 2,
  
  -- Configuração de Requisitos
  min_experience_years INT DEFAULT 0,
  max_experience_years INT,
  required_education VARCHAR(255),
  
  -- Configuração de Cursos
  has_preparatory_courses BOOLEAN DEFAULT TRUE,
  number_of_courses INT DEFAULT 6,
  total_course_hours INT DEFAULT 70,
  courses_are_mandatory BOOLEAN DEFAULT TRUE,
  
  -- Configuração de Prova
  has_exam BOOLEAN DEFAULT TRUE,
  exam_duration_minutes INT DEFAULT 120,
  exam_total_questions INT DEFAULT 60,
  exam_passing_score DECIMAL(5, 2) DEFAULT 60.00,
  exam_attempts_allowed INT DEFAULT 2,
  
  -- Configuração de Entrevista
  has_interview BOOLEAN DEFAULT TRUE,
  interview_duration_minutes INT DEFAULT 30,
  interview_attempts_allowed INT DEFAULT 1,
  
  -- Configuração de Documentação
  requires_curriculum BOOLEAN DEFAULT TRUE,
  requires_documents BOOLEAN DEFAULT TRUE,
  document_types_required JSON,  -- Array de tipos de documento
  
  -- Configuração de Análise
  has_documental_analysis BOOLEAN DEFAULT TRUE,
  analysis_waiting_days INT DEFAULT 15,
  
  -- Configuração de Aprovação
  requires_exam_approval BOOLEAN DEFAULT TRUE,
  requires_interview_approval BOOLEAN DEFAULT TRUE,
  requires_document_approval BOOLEAN DEFAULT TRUE,
  
  -- Configuração de Certificado
  certificate_validity_years INT DEFAULT 3,
  certificate_renewal_allowed BOOLEAN DEFAULT TRUE,
  
  -- Configuração de Preço
  base_price DECIMAL(10, 2),
  price_with_courses DECIMAL(10, 2),
  price_direct_certification DECIMAL(10, 2),
  price_courses_only DECIMAL(10, 2),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  launch_date DATE,
  
  -- Metadata
  custom_fields JSON,  -- Campos customizados por certificação
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (certification_type_id) REFERENCES certification_types(id),
  INDEX idx_is_active (is_active)
);
```

### Nova Tabela: certification_flow_template

**Descrição**: Template de fluxo para cada certificação e nível

```sql
CREATE TABLE certification_flow_template (
  id INT PRIMARY KEY AUTO_INCREMENT,
  certification_type_id INT NOT NULL,
  certification_level_id INT NOT NULL,
  purchase_type_id INT NOT NULL,
  
  -- Identificação
  flow_code VARCHAR(100) UNIQUE NOT NULL,
  flow_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Fases do Fluxo
  phases JSON NOT NULL,  -- Array de fases em ordem
  
  -- Exemplo de phases JSON:
  -- [
  --   {
  --     "phase_code": "PAYMENT",
  --     "phase_name": "Pagamento",
  --     "phase_order": 1,
  --     "is_mandatory": true,
  --     "requires_approval": false,
  --     "waiting_days": 0
  --   },
  --   {
  --     "phase_code": "COURSES",
  --     "phase_name": "Cursos",
  --     "phase_order": 2,
  --     "is_mandatory": true,
  --     "requires_approval": false,
  --     "waiting_days": 0
  --   },
  --   ...
  -- ]
  
  -- Configuração
  is_active BOOLEAN DEFAULT TRUE,
  version INT DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (certification_type_id) REFERENCES certification_types(id),
  FOREIGN KEY (certification_level_id) REFERENCES certification_levels(id),
  FOREIGN KEY (purchase_type_id) REFERENCES purchase_types(id),
  UNIQUE KEY unique_flow (certification_type_id, certification_level_id, purchase_type_id),
  INDEX idx_certification (certification_type_id)
);
```

---

## Configuração de Certificações

### Exemplo 1: CCA (Conformidade Ambiental)

```json
{
  "certification_type": "CCA",
  "display_name": "Certificação de Consultor de Conformidade Ambiental",
  "levels": 2,
  "has_preparatory_courses": true,
  "number_of_courses": 6,
  "has_exam": true,
  "exam_duration_minutes": 120,
  "exam_total_questions": 60,
  "has_interview": true,
  "interview_duration_minutes": 30,
  "certificate_validity_years": 3,
  "price_with_courses": 1500.00,
  "price_direct_certification": 800.00,
  "price_courses_only": 500.00
}
```

### Exemplo 2: CPF (Certificação em Planejamento Financeiro)

```json
{
  "certification_type": "CPF",
  "display_name": "Certificação em Planejamento Financeiro",
  "levels": 3,
  "has_preparatory_courses": true,
  "number_of_courses": 8,
  "has_exam": true,
  "exam_duration_minutes": 150,
  "exam_total_questions": 100,
  "has_interview": true,
  "interview_duration_minutes": 45,
  "certificate_validity_years": 2,
  "price_with_courses": 2000.00,
  "price_direct_certification": 1200.00,
  "price_courses_only": 700.00
}
```

### Exemplo 3: CGA (Certificação em Gestão Ambiental)

```json
{
  "certification_type": "CGA",
  "display_name": "Certificação em Gestão Ambiental",
  "levels": 1,
  "has_preparatory_courses": false,
  "has_exam": true,
  "exam_duration_minutes": 90,
  "exam_total_questions": 50,
  "has_interview": false,
  "certificate_validity_years": 5,
  "price_with_courses": 0.00,
  "price_direct_certification": 600.00,
  "price_courses_only": 0.00
}
```

---

## Fluxos Parametrizados

### Fluxo 1: CCA Nível 1 com Cursos

```json
{
  "flow_code": "CCA_L1_WITH_COURSES",
  "flow_name": "CCA Nível 1 - Com Cursos",
  "phases": [
    {
      "phase_code": "PAYMENT",
      "phase_name": "Pagamento",
      "phase_order": 1,
      "is_mandatory": true,
      "requires_approval": false,
      "waiting_days": 0
    },
    {
      "phase_code": "COURSES",
      "phase_name": "Cursos Preparatórios",
      "phase_order": 2,
      "is_mandatory": true,
      "requires_approval": false,
      "waiting_days": 0,
      "number_of_courses": 6
    },
    {
      "phase_code": "EXAM",
      "phase_name": "Prova de Certificação",
      "phase_order": 3,
      "is_mandatory": true,
      "requires_approval": true,
      "waiting_days": 0,
      "exam_id": 1
    },
    {
      "phase_code": "DOCUMENT_UPLOAD",
      "phase_name": "Upload de Documentos",
      "phase_order": 4,
      "is_mandatory": true,
      "requires_approval": false,
      "waiting_days": 0
    },
    {
      "phase_code": "INTERVIEW_SCHEDULE",
      "phase_name": "Agendamento de Entrevista",
      "phase_order": 5,
      "is_mandatory": true,
      "requires_approval": false,
      "waiting_days": 0
    },
    {
      "phase_code": "INTERVIEW",
      "phase_name": "Entrevista Técnica",
      "phase_order": 6,
      "is_mandatory": true,
      "requires_approval": true,
      "waiting_days": 0
    },
    {
      "phase_code": "CERTIFICATE",
      "phase_name": "Certificado",
      "phase_order": 7,
      "is_mandatory": true,
      "requires_approval": false,
      "waiting_days": 0
    }
  ]
}
```

### Fluxo 2: CCA Nível 1 Direto

```json
{
  "flow_code": "CCA_L1_DIRECT",
  "flow_name": "CCA Nível 1 - Certificação Direta",
  "phases": [
    {
      "phase_code": "PAYMENT",
      "phase_name": "Pagamento",
      "phase_order": 1,
      "is_mandatory": true
    },
    {
      "phase_code": "CURRICULUM_FORM",
      "phase_name": "Preenchimento de Ficha",
      "phase_order": 2,
      "is_mandatory": true
    },
    {
      "phase_code": "DOCUMENT_UPLOAD",
      "phase_name": "Upload de Documentos",
      "phase_order": 3,
      "is_mandatory": true
    },
    {
      "phase_code": "WAITING",
      "phase_name": "Análise Documental",
      "phase_order": 4,
      "is_mandatory": true,
      "waiting_days": 15
    },
    {
      "phase_code": "INTERVIEW_SCHEDULE",
      "phase_name": "Agendamento de Entrevista",
      "phase_order": 5,
      "is_mandatory": true
    },
    {
      "phase_code": "INTERVIEW",
      "phase_name": "Entrevista Técnica",
      "phase_order": 6,
      "is_mandatory": true,
      "requires_approval": true
    },
    {
      "phase_code": "CERTIFICATE",
      "phase_name": "Certificado",
      "phase_order": 7,
      "is_mandatory": true
    }
  ]
}
```

### Fluxo 3: CGA (Sem Cursos, Sem Entrevista)

```json
{
  "flow_code": "CGA_DIRECT",
  "flow_name": "CGA - Certificação Direta",
  "phases": [
    {
      "phase_code": "PAYMENT",
      "phase_name": "Pagamento",
      "phase_order": 1,
      "is_mandatory": true
    },
    {
      "phase_code": "EXAM",
      "phase_name": "Prova de Certificação",
      "phase_order": 2,
      "is_mandatory": true,
      "requires_approval": true,
      "exam_id": 3
    },
    {
      "phase_code": "CERTIFICATE",
      "phase_name": "Certificado",
      "phase_order": 3,
      "is_mandatory": true
    }
  ]
}
```

---

## Exemplos de Certificações

### Certificação 1: CCA (Conformidade Ambiental)

| Aspecto | Detalhes |
|---------|----------|
| **Níveis** | 2 (Nível 1 e Nível 2) |
| **Cursos** | 6 cursos de 70 horas |
| **Prova** | 120 minutos, 60 questões, 60% para passar |
| **Entrevista** | 30 minutos |
| **Certificado** | Válido por 3 anos |
| **Fluxos** | Com cursos, Direto, Apenas cursos |

### Certificação 2: CPF (Planejamento Financeiro)

| Aspecto | Detalhes |
|---------|----------|
| **Níveis** | 3 (Junior, Senior, Expert) |
| **Cursos** | 8 cursos de 80 horas |
| **Prova** | 150 minutos, 100 questões, 70% para passar |
| **Entrevista** | 45 minutos |
| **Certificado** | Válido por 2 anos |
| **Fluxos** | Com cursos, Direto |

### Certificação 3: CGA (Gestão Ambiental)

| Aspecto | Detalhes |
|---------|----------|
| **Níveis** | 1 (Único) |
| **Cursos** | Nenhum |
| **Prova** | 90 minutos, 50 questões, 65% para passar |
| **Entrevista** | Nenhuma |
| **Certificado** | Válido por 5 anos |
| **Fluxos** | Direto apenas |

### Certificação 4: CLA (Liderança Avançada)

| Aspecto | Detalhes |
|---------|----------|
| **Níveis** | 2 (Básico, Avançado) |
| **Cursos** | 4 cursos de 40 horas |
| **Prova** | 60 minutos, 40 questões, 75% para passar |
| **Entrevista** | 60 minutos (mais longa) |
| **Certificado** | Válido por 4 anos |
| **Fluxos** | Com cursos, Direto |

---

## Implementação Frontend

### Componentes Genéricos

```typescript
// Componente genérico de seleção de certificação
<CertificationSelector 
  onSelect={(certification) => navigate(`/levels/${certification.id}`)}
/>

// Componente genérico de seleção de nível
<LevelSelector 
  certificationId={certId}
  onSelect={(level) => navigate(`/purchase-type/${certId}/${level.id}`)}
/>

// Componente genérico de seleção de tipo de compra
<PurchaseTypeSelector 
  certificationId={certId}
  levelId={levelId}
  onSelect={(purchaseType) => navigate(`/payment/${purchaseType.id}`)}
/>

// Componente genérico de progresso
<ProgressTracker 
  flowTemplate={flowTemplate}
  currentPhase={currentPhase}
  userProgress={userProgress}
/>
```

### Páginas Dinâmicas

```typescript
// Página genérica de fase
<PhaseRenderer 
  phase={currentPhase}
  flowTemplate={flowTemplate}
  userData={userData}
  onPhaseComplete={handlePhaseComplete}
/>

// Renderizador de fase que adapta-se ao tipo
const PhaseRenderer = ({ phase, flowTemplate, userData, onPhaseComplete }) => {
  switch(phase.phase_code) {
    case 'PAYMENT':
      return <PaymentPhase {...props} />;
    case 'COURSES':
      return <CoursesPhase {...props} />;
    case 'EXAM':
      return <ExamPhase {...props} />;
    case 'INTERVIEW':
      return <InterviewPhase {...props} />;
    case 'CERTIFICATE':
      return <CertificatePhase {...props} />;
    default:
      return <GenericPhase {...props} />;
  }
};
```

---

## Implementação Backend

### API Endpoints Genéricos

```
GET    /api/certifications                    # Lista todas as certificações
GET    /api/certifications/:id                # Detalhes de uma certificação
GET    /api/certifications/:id/levels         # Níveis de uma certificação
GET    /api/certifications/:id/levels/:lid/purchase-types  # Tipos de compra
GET    /api/certifications/:id/flow/:flowId   # Template de fluxo

POST   /api/purchases                         # Criar compra
GET    /api/purchases/:id                     # Detalhes da compra
GET    /api/purchases/:id/progress            # Progresso da compra

POST   /api/purchases/:id/phases/:phaseId/complete  # Completar fase
GET    /api/purchases/:id/phases/:phaseId/status    # Status da fase

POST   /api/courses/:id/enroll                # Inscrever em curso
POST   /api/exams/:id/start                   # Iniciar prova
POST   /api/exams/:id/submit                  # Submeter prova
POST   /api/interviews/:id/schedule           # Agendar entrevista
POST   /api/interviews/:id/start              # Iniciar entrevista
POST   /api/interviews/:id/complete           # Completar entrevista

GET    /api/certificates/:id                  # Detalhes do certificado
GET    /api/certificates/:id/verify           # Verificar certificado
```

### Lógica de Negócio

```typescript
// Serviço genérico de fluxo
class CertificationFlowService {
  
  async getFlowTemplate(certId, levelId, purchaseTypeId) {
    // Busca template do fluxo
    return await db.query(`
      SELECT * FROM certification_flow_template
      WHERE certification_type_id = ? 
        AND certification_level_id = ?
        AND purchase_type_id = ?
    `, [certId, levelId, purchaseTypeId]);
  }
  
  async getNextPhase(purchaseId) {
    // Retorna próxima fase do fluxo
    const purchase = await this.getPurchase(purchaseId);
    const flowTemplate = await this.getFlowTemplate(
      purchase.certification_type_id,
      purchase.certification_level_id,
      purchase.purchase_type_id
    );
    
    const currentPhaseIndex = flowTemplate.phases.findIndex(
      p => p.phase_code === purchase.current_phase_code
    );
    
    return flowTemplate.phases[currentPhaseIndex + 1];
  }
  
  async completePhase(purchaseId, phaseCode) {
    // Marca fase como completa
    // Valida se pode prosseguir
    // Move para próxima fase
    
    const phase = await this.getPhase(phaseCode);
    
    if (phase.requires_approval) {
      // Marca como pendente de aprovação
      await this.markForApproval(purchaseId, phaseCode);
    } else {
      // Move para próxima fase
      const nextPhase = await this.getNextPhase(purchaseId);
      await this.moveToPhase(purchaseId, nextPhase.phase_code);
    }
  }
}
```

---

## Escalabilidade

### Como Adicionar Uma Nova Certificação

#### Passo 1: Criar Tipo de Certificação

```sql
INSERT INTO certification_types (name, description) VALUES
('CPF', 'Certificação em Planejamento Financeiro');
```

#### Passo 2: Criar Configuração

```sql
INSERT INTO certification_configuration (
  certification_type_id,
  display_name,
  number_of_levels,
  number_of_courses,
  exam_duration_minutes,
  certificate_validity_years,
  base_price
) VALUES (
  4,  -- CPF
  'Certificação em Planejamento Financeiro',
  3,
  8,
  150,
  2,
  2000.00
);
```

#### Passo 3: Criar Níveis

```sql
INSERT INTO certification_levels (level_number, name, required_education) VALUES
(1, 'Nível Junior', 'Graduação'),
(2, 'Nível Senior', 'Pós-graduação'),
(3, 'Nível Expert', 'Experiência 10+');
```

#### Passo 4: Criar Tipos de Compra

```sql
INSERT INTO purchase_types (code, name, price, certification_level_id) VALUES
('CPF_L1_WITH_COURSE', 'CPF Nível 1 - Com Cursos', 2000.00, 4),
('CPF_L1_DIRECT', 'CPF Nível 1 - Direto', 1200.00, 4),
('CPF_L1_COURSE_ONLY', 'CPF Nível 1 - Apenas Cursos', 700.00, 4);
```

#### Passo 5: Criar Cursos

```sql
INSERT INTO courses (code, title, duration_hours, course_order) VALUES
('CPF_CURSO_001', 'Fundamentos de Planejamento', 10, 1),
('CPF_CURSO_002', 'Investimentos', 10, 2),
...
```

#### Passo 6: Criar Prova

```sql
INSERT INTO exams (code, title, certification_level_id, total_questions, duration_minutes, passing_score) VALUES
('CPF_EXAM_L1', 'Prova CPF Nível 1', 4, 100, 150, 70.00);
```

#### Passo 7: Criar Template de Fluxo

```sql
INSERT INTO certification_flow_template (
  certification_type_id,
  certification_level_id,
  purchase_type_id,
  flow_code,
  flow_name,
  phases
) VALUES (
  4,
  4,
  7,
  'CPF_L1_WITH_COURSES',
  'CPF Nível 1 - Com Cursos',
  '[
    {"phase_code": "PAYMENT", "phase_order": 1, ...},
    {"phase_code": "COURSES", "phase_order": 2, ...},
    ...
  ]'
);
```

---

## 📊 Matriz de Certificações

| Certificação | Níveis | Cursos | Prova | Entrevista | Validade | Preço |
|--------------|--------|--------|-------|-----------|----------|-------|
| **CCA** | 2 | Sim (6) | Sim | Sim | 3 anos | R$ 1.500 |
| **CPF** | 3 | Sim (8) | Sim | Sim | 2 anos | R$ 2.000 |
| **CGA** | 1 | Não | Sim | Não | 5 anos | R$ 600 |
| **CLA** | 2 | Sim (4) | Sim | Sim | 4 anos | R$ 1.200 |

---

## 🔄 Fluxo de Dados Multi-Certificação

```
Usuário
  ↓
Seleciona Certificação (CCA, CPF, CGA, CLA)
  ↓
Seleciona Nível (1, 2, 3, etc.)
  ↓
Seleciona Tipo de Compra (Com Cursos, Direto, Apenas Cursos)
  ↓
Carrega Template de Fluxo (Específico para essa combinação)
  ↓
Executa Fases do Fluxo (Parametrizadas)
  ↓
Gera Certificado (Com número e código únicos)
```

---

## 💡 Benefícios da Arquitetura Multi-Certificação

1. **Escalabilidade**: Adicionar nova certificação em minutos
2. **Flexibilidade**: Cada certificação pode ter processo único
3. **Reutilização**: Componentes genéricos para todas as certificações
4. **Manutenibilidade**: Mudanças em uma certificação não afetam outras
5. **Auditoria**: Rastreamento completo por certificação
6. **Relatórios**: Análises por certificação, nível, tipo de compra

---

**Versão**: 1.0  
**Data**: 02 de Junho de 2026  
**Status**: Pronto para Implementação
