# Fluxo Completo da Arquitetura - Plataforma de Certificação CCA

## 📋 Índice
1. [Processo Principal](#processo-principal)
2. [Fluxo Nível 1 - Certificação com Cursos](#fluxo-nível-1---certificação-com-cursos)
3. [Fluxo Nível 1 - Certificação Direta](#fluxo-nível-1---certificação-direta)
4. [Fluxo Nível 1 - Apenas Cursos](#fluxo-nível-1---apenas-cursos)
5. [Fluxo Nível 2 - Certificação Profissional](#fluxo-nível-2---certificação-profissional)
6. [Processo Unificado de Entrevista](#processo-unificado-de-entrevista)
7. [Mapa de Rotas](#mapa-de-rotas)

---

## Processo Principal

### **PROCESSO 1: Entrada no Sistema**
```
INÍCIO
  ↓
[1.1] Página Inicial (SelectCertificationType)
      - Exibe 3 tipos de certificação
      - Usuário seleciona tipo
  ↓
[1.2] Seleção de Nível (SelectCertificationLevel)
      - Exibe Nível 1 e Nível 2
      - Usuário seleciona nível
  ↓
DECISÃO: Qual nível foi selecionado?
  ├─→ NÍVEL 1 → [FLUXO NÍVEL 1]
  └─→ NÍVEL 2 → [FLUXO NÍVEL 2]
```

---

## Fluxo Nível 1 - Certificação com Cursos

### **PROCESSO 2: Seleção de Tipo de Compra (Nível 1)**
```
[2.1] Página de Seleção de Compra (SelectPurchaseType)
      - Opção 1: Certificação + Pacote de Aprendizado (R$ 1.500)
      - Opção 2: Certificação Direta (R$ 800)
      - Opção 3: Apenas Pacote de Aprendizado (R$ 500)
  ↓
DECISÃO: Qual opção foi selecionada?
  ├─→ OPÇÃO 1 → [PROCESSO 3: Certificação com Cursos]
  ├─→ OPÇÃO 2 → [PROCESSO 5: Certificação Direta]
  └─→ OPÇÃO 3 → [PROCESSO 7: Apenas Cursos]
```

### **PROCESSO 3: Certificação com Cursos (Nível 1)**
```
[3.1] Página de Boas-vindas aos Cursos (WelcomeCourses)
      - Exibe resumo do pacote
      - 6 cursos disponíveis (70h)
      - Acesso imediato liberado
  ↓
[3.2] Plataforma de Cursos (CoursesPlatform)
      - Usuário acessa e estuda os cursos
      - Simulados e exercícios práticos
      - Suporte 24/7
  ↓
[3.3] Verificação de Segurança da Prova (ExamSecurityCheck)
      - Usuário ativa câmera e microfone
      - Verifica requisitos técnicos
      - Inicia prova automaticamente
  ↓
[3.4] Prova de Certificação (ExamSecurityCheck)
      - 60 questões
      - 120 minutos
      - Gravação automática
  ↓
DECISÃO: Resultado da Prova?
  ├─→ APROVADO → [3.5]
  └─→ REPROVADO → [3.6]

[3.5] Resultado Aprovado (ExamResults)
      - Exibe nota e aprovação
      - Mensagem de sucesso
  ↓
[3.7] Upload de Documentação (Step6Upload)
      - Usuário faz upload de documentos
      - Comprovantes de experiência
      - Certificados adicionais
  ↓
[3.8] Processo Unificado de Entrevista → [PROCESSO 8]

[3.6] Resultado Reprovado (ExamResults)
      - Exibe nota e reprovação
      - Opção de reagendar prova
      - FIM DO FLUXO
```

---

## Fluxo Nível 1 - Certificação Direta

### **PROCESSO 5: Certificação Direta (Nível 1)**
```
[5.1] Verificação de Preparação (CertificationDirectPreparationCheck)
      - Pergunta: "Você fez os cursos preparatórios ANEFAC?"
  ↓
DECISÃO: Resposta do usuário?
  ├─→ SIM → [5.2]
  └─→ NÃO → [5.3]

[5.2] Confirmação (Usuário respondeu SIM)
      - Vai direto para pagamento
  ↓
[5.4] Pagamento (PaymentCheckout)
      - Valor: R$ 800
      - Tipo: CertificacaoDireta
  ↓
[5.5] Preenchimento de Ficha (DirectCertificationForm)
      - Dados pessoais pré-preenchidos
      - Formação acadêmica
      - Experiência profissional
      - Informações adicionais
  ↓
[5.6] Upload de Documentação (Step6Upload)
      - Usuário faz upload de documentos
      - Comprovantes de experiência
  ↓
[5.7] Aguardar 15 dias (DirectCertificationWaitingInfo)
      - Análise documental em andamento
      - Usuário aguarda
  ↓
[5.8] Agendamento de Entrevista (DirectCertificationInterviewScheduling)
      - Usuário seleciona data e horário
      - Escolhe entrevistador
  ↓
[5.9] Sala de Entrevista (DirectCertificationInterviewRoom)
      - Modal de espera se não for o dia agendado
      - Gravação de vídeo/áudio
      - Entrevista técnica
  ↓
[5.10] Resultado da Entrevista (DirectCertificationResult)
       - Resumo da entrevista
       - Próximas etapas
  ↓
[5.11] Certificado (Step9)
       - Certificado digital disponível
       - FIM DO FLUXO

[5.3] Confirmação (Usuário respondeu NÃO)
      - Pergunta: "Tem certeza que deseja ir direto para a certificação?"
  ↓
DECISÃO: Confirmação?
  ├─→ SIM → [5.4] (Vai para pagamento)
  └─→ NÃO → Volta ao Menu Inicial
```

---

## Fluxo Nível 1 - Apenas Cursos

### **PROCESSO 7: Apenas Pacote de Aprendizado (Nível 1)**
```
[7.1] Plataforma de Cursos (CoursesPlatform)
      - Usuário acessa os 6 cursos (70h)
      - Materiais de estudo
      - Simulados e exercícios
      - Suporte 24/7
  ↓
[7.2] Estudo Autônomo
      - Usuário estuda por conta própria
      - Sem obrigação de fazer prova
      - Sem certificação
  ↓
FIM DO FLUXO (Sem certificação)
```

---

## Fluxo Nível 2 - Certificação Profissional

### **PROCESSO 6: Certificação Nível 2**
```
[6.1] Informações Nível 2 (Level2Information)
      - Exibe requisitos
      - Experiência mínima: 5+ anos
      - Formação: Pós-graduação/MBA
  ↓
[6.2] Validação de Currículo Lattes (Level2LattesValidation)
      - Dados pessoais pré-preenchidos
      - Formação acadêmica
      - Experiência profissional
      - Liderança e gestão
  ↓
[6.3] Termos e Avisos (Level2TermsAndWarning)
      - Usuário lê e aceita termos
      - Checkbox de confirmação
  ↓
[6.4] Pagamento (Level2Checkout)
      - Valor: R$ 1.200
      - Tipo: Nível 2
  ↓
[6.5] Upload de Documentação (Step6Upload)
      - Comprovantes de experiência
      - Certificados acadêmicos
      - Documentos de liderança
  ↓
[6.6] Processo Unificado de Entrevista → [PROCESSO 8]
```

---

## Processo Unificado de Entrevista

### **PROCESSO 8: Agendamento e Realização de Entrevista**
```
[8.1] Agendamento de Entrevista (InterviewScheduling)
      - Calendário com datas disponíveis (próximos 30 dias)
      - Seleção de horário
      - Seleção de entrevistador (5 opções)
      - Resumo: Data, Horário, Entrevistador
  ↓
[8.2] Acesso à Sala de Entrevista (InterviewRoom)
      - VERIFICAÇÃO: É o dia agendado?
      ├─→ NÃO → Modal de espera
      │         - Mostra data, horário, entrevistador
      │         - Botão "Retornar ao Menu Inicial"
      │         - Sala visível ao fundo (20% opacidade)
      │         - Usuário não pode interagir
      │
      └─→ SIM → Sala totalmente acessível
                - Câmera e microfone
                - Gravação automática
                - Controles de áudio/vídeo
                - Botão "Finalizar Entrevista"
  ↓
[8.3] Gravação de Entrevista
      - Vídeo + Áudio gravados
      - Armazenados em sessionStorage
      - (Em produção: Upload para servidor)
  ↓
[8.4] Resultado da Entrevista (InterviewResult)
      - Aluno vê: Data, Horário, Entrevistador, Status
      - Aluno NÃO vê: Gravação, Download
      - Mensagem: "Entrevista será analisada"
  ↓
[8.5] Certificado (Step9)
      - Certificado digital disponível
      - FIM DO FLUXO
```

---

## Mapa de Rotas

### **Rotas Principais**
| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | SelectCertificationType | Página inicial - Escolha tipo de certificação |
| `/select-level` | SelectCertificationLevel | Escolha nível (1 ou 2) |
| `/select-purchase-type` | SelectPurchaseType | Escolha tipo de compra (Nível 1 apenas) |
| `/view-flowchart` | ViewFlowchart | Visualizar fluxograma |

### **Rotas Nível 1 - Certificação com Cursos**
| Rota | Página | Descrição |
|------|--------|-----------|
| `/welcome-courses` | WelcomeCourses | Boas-vindas aos cursos |
| `/courses-learning` | CoursesPlatform | Plataforma de cursos |
| `/exam-security-check` | ExamSecurityCheck | Verificação de segurança + Prova |
| `/exam-results` | ExamResults | Resultado da prova |
| `/step-6` | Step6Upload | Upload de documentação |

### **Rotas Nível 1 - Certificação Direta**
| Rota | Página | Descrição |
|------|--------|-----------|
| `/certification-direct-preparation-check` | CertificationDirectPreparationCheck | Verificação de preparação |
| `/payment` | PaymentCheckout | Pagamento |
| `/direct-certification-form` | DirectCertificationForm | Preenchimento de ficha |
| `/step-6` | Step6Upload | Upload de documentação |
| `/direct-certification-waiting` | DirectCertificationWaitingInfo | Aguardar 15 dias |
| `/direct-interview-scheduling` | DirectCertificationInterviewScheduling | Agendamento de entrevista |
| `/direct-interview-room` | DirectCertificationInterviewRoom | Sala de entrevista |
| `/direct-certification-result` | DirectCertificationResult | Resultado da entrevista |

### **Rotas Nível 2**
| Rota | Página | Descrição |
|------|--------|-----------|
| `/level2-information` | Level2Information | Informações Nível 2 |
| `/level2-lattes-validation` | Level2LattesValidation | Validação de currículo |
| `/level2-terms-warning` | Level2TermsAndWarning | Termos e avisos |
| `/level2-checkout` | Level2Checkout | Pagamento |
| `/step-6` | Step6Upload | Upload de documentação |

### **Rotas Unificadas (Todos os fluxos)**
| Rota | Página | Descrição |
|------|--------|-----------|
| `/interview-scheduling` | InterviewScheduling | Agendamento de entrevista |
| `/interview-room` | InterviewRoom | Sala de entrevista |
| `/interview-result` | InterviewResult | Resultado da entrevista |
| `/step-9` | Step9 | Certificado final |

### **Rotas Auxiliares**
| Rota | Página | Descrição |
|------|--------|-----------|
| `/home` | Home | Página de boas-vindas |
| `/lattes-curriculum-form` | LattesCurriculumForm | Formulário de currículo |
| `/requirements-validation` | RequirementsValidation | Validação de requisitos |
| `/documental-analysis-checkout` | DocumentalAnalysisCheckout | Pagamento análise documental |
| `/404` | NotFound | Página não encontrada |

---

## Resumo de Decisões e Fluxos

### **Pontos de Decisão Críticos**

#### **Decisão 1: Tipo de Certificação**
- CCA
- XXX
- Liderança

#### **Decisão 2: Nível de Certificação**
- **Nível 1**: Para profissionais em desenvolvimento (2-5 anos)
- **Nível 2**: Para profissionais experientes (5+ anos)

#### **Decisão 3: Tipo de Compra (Nível 1 apenas)**
- **Opção 1**: Certificação + Cursos (R$ 1.500)
- **Opção 2**: Certificação Direta (R$ 800)
- **Opção 3**: Apenas Cursos (R$ 500)

#### **Decisão 4: Preparação para Certificação Direta**
- **Sim**: Vai direto para pagamento
- **Não**: Pergunta confirmação
  - **Sim**: Vai para pagamento
  - **Não**: Volta ao menu inicial

#### **Decisão 5: Resultado da Prova**
- **Aprovado**: Vai para upload de documentação
- **Reprovado**: Fim do fluxo

#### **Decisão 6: Dia da Entrevista**
- **Não é o dia**: Modal de espera (sala visível ao fundo)
- **É o dia**: Sala totalmente acessível

---

## Componentes Reutilizáveis

### **BackToHomeButton**
- Presente em todas as páginas
- Retorna ao menu inicial
- Localizado no topo de cada página

### **ProgressBar**
- Mostra progresso do fluxo
- Integrada em páginas principais
- Atualiza conforme usuário avança

### **InterviewRoom (Unificado)**
- Usado por todos os fluxos
- Câmera + Microfone + Gravação
- Modal de espera se não for o dia

---

## Dados Pré-preenchidos (Para Testes)

### **DirectCertificationForm**
- Nome: João Silva Santos
- CPF: 123.456.789-00
- Email: joao.silva@email.com
- Telefone: (11) 98765-4321
- Data Nascimento: 15/03/1985
- Cargo: Consultor de Conformidade
- Formação: Bacharel em Contabilidade (2007)
- MBA: MBA em Gestão Empresarial (2012)
- Experiência: 8 anos em Controladoria

### **Level2LattesValidation**
- Dados pessoais completos
- Formação superior e MBA pré-preenchidas
- 3 experiências profissionais
- Validação de experiência: 10+ anos
- Liderança: 5 anos
- Checkbox de termos: Marcado

---

## Fluxo de Pagamento

### **Valores**
- Nível 1 + Cursos: R$ 1.500
- Nível 1 + Certificação Direta: R$ 800
- Nível 1 + Apenas Cursos: R$ 500
- Nível 2: R$ 1.200

### **Processo de Pagamento**
1. Usuário clica em "Próximo: Pagamento"
2. Vai para `/payment` com parâmetro `package`
3. Exibe resumo e valor
4. Usuário confirma pagamento
5. Redireciona para próxima etapa conforme tipo de compra

---

## Fluxo de Entrevista Unificado

### **Características**
- Mesma página para todos os fluxos
- Calendário com 30 dias de disponibilidade
- 5 entrevistadores disponíveis
- Gravação automática de vídeo + áudio
- Modal de espera se não for o dia agendado
- Aluno não vê gravação (apenas entrevistador)

### **Entrevistadores Disponíveis**
1. Dr. Carlos Silva - Especialista em Conformidade
2. Dra. Marina Santos - Auditora Sênior
3. Prof. Roberto Costa - Consultor de Governança
4. Dra. Fernanda Oliveira - Especialista em Controladoria
5. Dr. Lucas Pereira - Auditor Certificado

---

## Fim do Documento

**Versão**: 1.0  
**Data**: 02 de Junho de 2026  
**Status**: Completo e Testado
