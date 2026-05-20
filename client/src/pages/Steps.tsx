import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { CoursesPlatform as CoursesPlatformComponent } from "./CoursesPlatform";
import { RecoveryCheckout as RecoveryCheckoutComponent } from "./RecoveryCheckout";
import { RetakeExamCheckout as RetakeExamCheckoutComponent } from "./RetakeExamCheckout";

// Context para gerenciar o fluxo do usuário
const useUserFlow = () => {
  const [userFlow, setUserFlow] = useState({
    journeyType: null as string | null, // "direct", "prep", "complete"
    proofResult: null as string | null, // "approved", "failed"
    gapAreas: [] as string[], // áreas onde o usuário teve baixo desempenho
  });

  return { userFlow, setUserFlow };
};

const StepLayout = ({ step, title, children }: { step: number; title: string; children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/">
          <a className="text-blue-900 hover:underline mb-4 inline-block">← Voltar</a>
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold">
            {step}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-900">{title}</h1>
            <p className="text-gray-600">Etapa {step} de 9</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  </div>
);

const NavButtons = ({ step, nextLink }: { step: number; nextLink?: string }) => (
  <div className="flex gap-4 mt-8">
    {step > 1 && (
      <Link href={`/step-${step - 1}`}>
        <a>
          <Button variant="outline">← Anterior</Button>
        </a>
      </Link>
    )}
    {nextLink && (
      <Link href={nextLink}>
        <a>
          <Button className="bg-blue-900 hover:bg-blue-800">Próximo →</Button>
        </a>
      </Link>
    )}
    {step === 9 && (
      <Link href="/">
        <a>
          <Button className="bg-green-600 hover:bg-green-700">Voltar ao Início</Button>
        </a>
      </Link>
    )}
  </div>
);

// Step 1 - Escolha da Jornada (Bifurcação Principal)
export function Step1() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (type: string) => {
    setSelected(type);
    // Aqui você salvaria a escolha no contexto/localStorage
    localStorage.setItem("journeyType", type);
  };

  const getNextStep = () => {
    if (selected === "direct") return "/step-4"; // Vai direto para prova
    if (selected === "prep" || selected === "complete") return "/courses"; // Vai para plataforma de cursos
    return "/step-2"; // Padrão
  };

  return (
    <StepLayout step={1} title="Escolha da Jornada">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          {
            id: "direct",
            title: "Certificação Direta",
            price: "R$ 499",
            desc: "Para profissionais experientes",
            features: ["Acesso à prova", "Resultado imediato", "Entrevista técnica"],
            path: "Prova → Resultado → Upload → Entrevista → Certificado",
          },
          {
            id: "prep",
            title: "Preparatório",
            price: "R$ 799",
            desc: "Com cursos e módulos",
            features: ["Cursos completos", "Simulados", "Mentoria"],
            path: "Cursos → Prova → Resultado → Upload → Entrevista → Certificado",
          },
          {
            id: "complete",
            title: "Pacote Completo",
            price: "R$ 1.299",
            desc: "Solução completa",
            features: ["Tudo incluído", "Suporte total", "Aulas ON-LINE"],
            path: "Cursos + Aulas → Prova → Resultado → Upload → Entrevista → Certificado",
            highlight: true,
          },
        ].map((option) => (
          <Card
            key={option.id}
            className={`p-6 cursor-pointer transition-all border-2 ${
              selected === option.id
                ? "border-blue-900 bg-blue-50"
                : "border-gray-200 hover:border-blue-900"
            } ${option.highlight ? "ring-2 ring-blue-900" : ""}`}
            onClick={() => handleSelect(option.id)}
          >
            {option.highlight && (
              <div className="bg-blue-900 text-white px-3 py-1 rounded text-xs font-bold mb-3 inline-block">
                Mais Popular
              </div>
            )}
            <h3 className="font-bold text-lg text-blue-900 mb-2">{option.title}</h3>
            <p className="text-2xl font-bold text-blue-900 mb-2">{option.price}</p>
            <p className="text-sm text-gray-600 mb-4">{option.desc}</p>
            <ul className="space-y-2 mb-4">
              {option.features.map((f, i) => (
                <li key={i} className="text-sm text-gray-700">✓ {f}</li>
              ))}
            </ul>
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-600 font-semibold">Seu caminho:</p>
              <p className="text-xs text-blue-900">{option.path}</p>
            </div>
          </Card>
        ))}
      </div>
      <NavButtons step={1} nextLink={selected ? getNextStep() : undefined} />
    </StepLayout>
  );
}

// Step 2 - Cadastro Minucioso
export function Step2() {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    experiencia: "",
    formacao: "",
  });

  return (
    <StepLayout step={2} title="Cadastro Minucioso">
      <Card className="p-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
            <input
              type="text"
              placeholder="Seu nome"
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">CPF</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Anos de Experiência</label>
            <input
              type="number"
              placeholder="5"
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.experiencia}
              onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Formação Acadêmica</label>
            <textarea
              placeholder="Descreva sua formação"
              className="w-full p-2 border border-gray-300 rounded h-24"
              value={formData.formacao}
              onChange={(e) => setFormData({ ...formData, formacao: e.target.value })}
            />
          </div>
        </div>
      </Card>
      <NavButtons step={2} nextLink="/step-3" />
    </StepLayout>
  );
}

// Step 3 - Compra
export function Step3() {
  return (
    <StepLayout step={3} title="Compra">
      <Card className="p-6 mb-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="font-bold">Pacote Selecionado</span>
            <span className="font-bold">R$ 1.299,00</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b">
            <span>Desconto (10%)</span>
            <span className="text-green-600">-R$ 129,90</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold bg-blue-50 p-4 rounded">
            <span>Total</span>
            <span className="text-blue-900">R$ 1.169,10</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Método de Pagamento</h3>
        <div className="space-y-3">
          <div className="p-4 border-2 border-blue-900 rounded cursor-pointer bg-blue-50">
            💳 Cartão de Crédito - Parcelado em até 12x
          </div>
          <div className="p-4 border border-gray-300 rounded cursor-pointer hover:border-blue-900">
            📱 PIX - Transferência instantânea
          </div>
        </div>
      </Card>

      <NavButtons step={3} nextLink="/step-4" />
    </StepLayout>
  );
}

// Plataforma de Cursos (Bifurcação) - Redireciona para CoursesPlatform
export function CoursesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-4xl mx-auto text-center py-20">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">Redirecionando...</h1>
        <p className="text-gray-600 mb-8">Você será redirecionado para a plataforma de cursos em breve.</p>
        <Link href="/courses-platform">
          <a>
            <Button className="bg-blue-900 hover:bg-blue-800 text-lg py-6 px-8">
              Clique aqui se não for redirecionado automaticamente
            </Button>
          </a>
        </Link>
      </div>
    </div>
  );
}

// Step 4 - Prova (Com bifurcação de resultado)
export function Step4() {
  const [proofTaken, setProofTaken] = useState(false);

  return (
    <StepLayout step={4} title="Prova de Certificação">
      <Card className="p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Informações da Prova</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Número de Questões</p>
            <p className="text-2xl font-bold text-blue-900">60</p>
          </div>
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Tempo Total</p>
            <p className="text-2xl font-bold text-blue-900">120 minutos</p>
          </div>
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Nota Mínima</p>
            <p className="text-2xl font-bold text-blue-900">70%</p>
          </div>
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Áreas Avaliadas</p>
            <p className="text-2xl font-bold text-blue-900">5</p>
          </div>
        </div>

        <h4 className="font-bold mb-3">Áreas de Conhecimento:</h4>
        <ul className="space-y-2 mb-6">
          {[
            "Controladoria e Gestão",
            "Planejamento e Orçamento",
            "Indicadores e Performance",
            "Gestão de Riscos",
            "Governança e Compliance",
          ].map((area, i) => (
            <li key={i} className="p-2 bg-gray-50 rounded">✓ {area}</li>
          ))}
        </ul>

        {!proofTaken && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
            onClick={() => setProofTaken(true)}
          >
            🚀 Iniciar Prova
          </Button>
        )}
      </Card>

      {proofTaken && (
        <Card className="p-6 mb-8 bg-green-50 border-2 border-green-300">
          <p className="text-sm text-green-700 font-bold">RESULTADO SIMULADO</p>
          <p className="text-5xl font-bold text-green-700 my-2">78%</p>
          <p className="text-lg font-bold text-green-800">✓ APROVADO</p>
          <p className="text-sm text-green-700 mt-4">Você será redirecionado para a próxima etapa...</p>
        </Card>
      )}

      {proofTaken && <NavButtons step={4} nextLink="/step-5" />}
    </StepLayout>
  );
}

// Step 5 - Resultado com bifurcação (Aprovado vs Reprovado)
export function Step5() {
  const [resultType, setResultType] = useState<"approved" | "failed" | null>(null);

  return (
    <StepLayout step={5} title="Resultado da Prova">
      {!resultType && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card
            className="p-6 cursor-pointer border-2 border-green-300 hover:bg-green-50"
            onClick={() => setResultType("approved")}
          >
            <p className="text-4xl mb-2">✓</p>
            <h3 className="font-bold text-lg text-green-700 mb-2">Resultado: APROVADO</h3>
            <p className="text-sm text-gray-600">Score: 78% (Acima de 70%)</p>
            <p className="text-sm text-gray-600 mt-2">Próximo: Upload Documental</p>
          </Card>

          <Card
            className="p-6 cursor-pointer border-2 border-red-300 hover:bg-red-50"
            onClick={() => setResultType("failed")}
          >
            <p className="text-4xl mb-2">✗</p>
            <h3 className="font-bold text-lg text-red-700 mb-2">Resultado: REPROVADO</h3>
            <p className="text-sm text-gray-600">Score: 62% (Abaixo de 70%)</p>
            <p className="text-sm text-gray-600 mt-2">Próximo: Cursos de Recuperação</p>
          </Card>
        </div>
      )}

      {resultType === "approved" && (
        <Card className="p-6 mb-8 bg-green-50 border-2 border-green-300">
          <div className="text-center">
            <p className="text-sm text-green-700 font-bold">RESULTADO GERAL</p>
            <p className="text-5xl font-bold text-green-700 my-2">78%</p>
            <p className="text-lg font-bold text-green-800">✓ APROVADO</p>
          </div>
        </Card>
      )}

      {resultType === "approved" && (
        <Card className="p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">Desempenho por Área</h3>
          <div className="space-y-4">
            {[
              { area: "Controladoria e Gestão", score: 85 },
              { area: "Planejamento e Orçamento", score: 72 },
              { area: "Indicadores e Performance", score: 80 },
              { area: "Gestão de Riscos", score: 68 },
              { area: "Governança e Compliance", score: 82 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{item.area}</span>
                  <span className="font-bold text-blue-900">{item.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-2">
                  <div className="bg-blue-900 h-2 rounded" style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {resultType === "failed" && (
        <Card className="p-6 mb-8 bg-red-50 border-2 border-red-300">
          <h3 className="font-bold text-lg text-red-900 mb-4">Desempenho por Área</h3>
          <div className="space-y-4">
            {[
              { area: "Controladoria e Gestão", score: 55, gap: true },
              { area: "Planejamento e Orçamento", score: 62, gap: true },
              { area: "Indicadores e Performance", score: 70 },
              { area: "Gestão de Riscos", score: 45, gap: true },
              { area: "Governança e Compliance", score: 75 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">
                    {item.area} {item.gap && "⚠️"}
                  </span>
                  <span className="font-bold text-red-900">{item.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-2">
                  <div
                    className={item.gap ? "bg-red-600 h-2 rounded" : "bg-green-600 h-2 rounded"}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
            <p className="font-bold text-yellow-900 mb-2">📚 Cursos Recomendados para seus Gaps:</p>
            <ul className="space-y-2">
              <li className="text-sm text-yellow-800">✓ Controladoria e Gestão (Gap: 15%)</li>
              <li className="text-sm text-yellow-800">✓ Planejamento e Orçamento (Gap: 8%)</li>
              <li className="text-sm text-yellow-800">✓ Gestão de Riscos (Gap: 25%)</li>
            </ul>
          </div>
        </Card>
      )}

      {resultType === "failed" && (
        <div className="space-y-4 mb-8">
          <Link href="/recovery-checkout">
            <a>
              <Button className="w-full bg-blue-900 hover:bg-blue-800 text-lg py-6">
                📚 Ver Opções de Recuperação
              </Button>
            </a>
          </Link>
        </div>
      )}

      {resultType === "approved" && <NavButtons step={5} nextLink="/step-6" />}
    </StepLayout>
  );
}

// Step 6 - Upload Documental
export function Step6() {
  return (
    <StepLayout step={6} title="Upload Documental">
      <Card className="p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Documentos Requeridos</h3>
        <div className="space-y-3">
          {[
            "Currículo Atualizado",
            "Diploma de Graduação",
            "Comprovante de Experiência",
            "Certificados Profissionais",
          ].map((doc, i) => (
            <div
              key={i}
              className="p-4 border-2 border-dashed border-gray-300 rounded text-center cursor-pointer hover:border-blue-900"
            >
              📄 {doc}
              <p className="text-xs text-gray-600 mt-1">Clique para fazer upload</p>
            </div>
          ))}
        </div>
      </Card>

      <NavButtons step={6} nextLink="/step-7" />
    </StepLayout>
  );
}

// Step 7 - Entrevista Técnica
export function Step7() {
  return (
    <StepLayout step={7} title="Entrevista Técnica">
      <Card className="p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Agendamento</h3>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Data Sugerida</p>
            <p className="font-bold">25 de Junho de 2024</p>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Horário</p>
            <p className="font-bold">14:00 - 15:00 (Brasília)</p>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Entrevistador</p>
            <p className="font-bold">Comissão de Certificação ANEFAC</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Roteiro da Entrevista</h3>
        <ul className="space-y-2">
          {[
            "Confirmação de experiência profissional",
            "Validação de conhecimento técnico",
            "Análise de lacunas identificadas",
            "Discussão de casos práticos",
            "Parecer final",
          ].map((item, i) => (
            <li key={i} className="p-2 bg-gray-50 rounded">
              💬 {item}
            </li>
          ))}
        </ul>
      </Card>

      <NavButtons step={7} nextLink="/step-8" />
    </StepLayout>
  );
}

// Step 8 - Decisão Final
export function Step8() {
  return (
    <StepLayout step={8} title="Decisão Final">
      <Card className="p-6 mb-8 bg-green-50 border-2 border-green-300">
        <div className="flex items-center gap-4">
          <div className="text-4xl">✓</div>
          <div>
            <p className="text-sm text-green-700 font-bold">ELEGÍVEL PARA CERTIFICAÇÃO</p>
            <p className="text-2xl font-bold text-green-800">Aprovado</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Parecer da Comissão</h3>
        <p className="text-gray-700 mb-4">
          O candidato demonstrou domínio técnico adequado nas áreas avaliadas, apresentou documentação
          completa e validada, e obteve desempenho satisfatório na entrevista técnica. A comissão
          recomenda a emissão do certificado CCA.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Data da Decisão</p>
            <p className="font-bold">26 de Junho de 2024</p>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Número do Processo</p>
            <p className="font-bold">CCA-2024-001234</p>
          </div>
        </div>
      </Card>

      <NavButtons step={8} nextLink="/step-9" />
    </StepLayout>
  );
}

// Step 9 - Certificado
export function Step9() {
  return (
    <StepLayout step={9} title="Certificado Emitido">
      <Card className="p-8 mb-8 bg-gradient-to-br from-blue-900 to-blue-800 text-white text-center">
        <p className="text-4xl mb-4">🏆</p>
        <h2 className="text-3xl font-bold mb-2">Certificado CCA</h2>
        <p className="text-lg opacity-90">Certificação Profissional em Controladoria</p>
      </Card>

      <Card className="p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Informações do Certificado</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Número do Certificado</p>
            <p className="font-bold">CCA-2024-001234</p>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Data de Emissão</p>
            <p className="font-bold">26 de Junho de 2024</p>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Validade</p>
            <p className="font-bold">3 anos</p>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-bold text-green-600">Ativo</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full bg-blue-900 hover:bg-blue-800">📥 Baixar Certificado em PDF</Button>
          <Button variant="outline" className="w-full">
            ✓ Validar Certificado Online
          </Button>
        </div>
      </Card>

      <NavButtons step={9} />
    </StepLayout>
  );
}

// Página de Cursos de Recuperação (para quem reprovou)
export const CoursesPlatform = CoursesPlatformComponent;
export const RecoveryCheckout = RecoveryCheckoutComponent;
export const RetakeExamCheckout = RetakeExamCheckoutComponent;

export function CoursesRecoveryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <a className="text-blue-900 hover:underline mb-4 inline-block">← Voltar</a>
          </Link>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Cursos de Recuperação</h1>
          <p className="text-gray-600">Cursos focados nos seus gaps identificados na prova</p>
        </div>

        <Card className="p-6 mb-8 bg-red-50 border-2 border-red-200">
          <h3 className="font-bold text-lg text-red-900 mb-2">Áreas com Baixo Desempenho</h3>
          <p className="text-red-800">
            Recomendamos que você estude os cursos abaixo antes de fazer a prova novamente.
          </p>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            {
              title: "Controladoria e Gestão - Recuperação",
              duration: "40h",
              price: "R$ 299",
              gap: "15%",
            },
            {
              title: "Gestão de Riscos - Recuperação",
              duration: "35h",
              price: "R$ 349",
              gap: "25%",
            },
            {
              title: "Planejamento e Orçamento - Recuperação",
              duration: "30h",
              price: "R$ 249",
              gap: "8%",
            },
            {
              title: "Mentoria Personalizada",
              duration: "10 sessões",
              price: "R$ 499",
              gap: "Completo",
            },
          ].map((course, i) => (
            <Card key={i} className="p-6 border-2 border-gray-200 hover:border-blue-900">
              <h3 className="font-bold text-lg text-blue-900 mb-2">{course.title}</h3>
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>⏱️ {course.duration}</span>
                <span className="text-red-600 font-bold">Gap: {course.gap}</span>
              </div>
              <p className="text-xl font-bold text-blue-900 mb-4">{course.price}</p>
              <Button className="w-full bg-blue-900 hover:bg-blue-800">Inscrever-se</Button>
            </Card>
          ))}
        </div>

        <Card className="p-6 mb-8 bg-amber-50 border-2 border-amber-300">
          <h3 className="font-bold text-lg text-amber-900 mb-2">👨‍🏫 Aulas ON-LINE com Instrutor</h3>
          <p className="text-amber-800 mb-4">
            Contrate aulas personalizadas com nossos instrutores especializados para aprofundar seu
            conhecimento nas áreas com gaps.
          </p>
          <Button className="bg-amber-600 hover:bg-amber-700">Contratar Aulas ON-LINE</Button>
        </Card>

        <div className="flex gap-4">
          <Link href="/step-4">
            <a>
              <Button className="bg-green-600 hover:bg-green-700">Fazer Prova Novamente</Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
