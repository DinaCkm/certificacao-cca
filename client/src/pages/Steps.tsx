import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useState } from "react";

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

const NavButtons = ({ step }: { step: number }) => (
  <div className="flex gap-4 mt-8">
    {step > 1 && (
      <Link href={`/step-${step - 1}`}>
        <a>
          <Button variant="outline">← Anterior</Button>
        </a>
      </Link>
    )}
    {step < 9 && (
      <Link href={`/step-${step + 1}`}>
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

// Step 1 - Escolha da Jornada
export function Step1() {
  const [selected, setSelected] = useState<string | null>(null);

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
          },
          {
            id: "prep",
            title: "Preparatório",
            price: "R$ 799",
            desc: "Com cursos e módulos",
            features: ["Cursos completos", "Simulados", "Mentoria"],
          },
          {
            id: "complete",
            title: "Pacote Completo",
            price: "R$ 1.299",
            desc: "Solução completa",
            features: ["Tudo incluído", "Suporte total", "Desenvolvimento contínuo"],
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
            onClick={() => setSelected(option.id)}
          >
            {option.highlight && (
              <div className="bg-blue-900 text-white px-3 py-1 rounded text-xs font-bold mb-3 inline-block">
                Mais Popular
              </div>
            )}
            <h3 className="font-bold text-lg text-blue-900 mb-2">{option.title}</h3>
            <p className="text-2xl font-bold text-blue-900 mb-2">{option.price}</p>
            <p className="text-sm text-gray-600 mb-4">{option.desc}</p>
            <ul className="space-y-2">
              {option.features.map((f, i) => (
                <li key={i} className="text-sm text-gray-700">✓ {f}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <NavButtons step={1} />
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
      <NavButtons step={2} />
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
            <span className="font-bold">Pacote Completo</span>
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

      <NavButtons step={3} />
    </StepLayout>
  );
}

// Step 4 - Prova/Preparatório
export function Step4() {
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
        <ul className="space-y-2">
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
      </Card>

      <NavButtons step={4} />
    </StepLayout>
  );
}

// Step 5 - Resultado
export function Step5() {
  return (
    <StepLayout step={5} title="Resultado da Prova">
      <Card className="p-6 mb-8 bg-green-50 border-2 border-green-300">
        <div className="text-center">
          <p className="text-sm text-green-700 font-bold">RESULTADO GERAL</p>
          <p className="text-5xl font-bold text-green-700 my-2">78%</p>
          <p className="text-lg font-bold text-green-800">✓ APROVADO</p>
        </div>
      </Card>

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
                <div
                  className="bg-blue-900 h-2 rounded"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <NavButtons step={5} />
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
            <div key={i} className="p-4 border-2 border-dashed border-gray-300 rounded text-center cursor-pointer hover:border-blue-900">
              📄 {doc}
              <p className="text-xs text-gray-600 mt-1">Clique para fazer upload</p>
            </div>
          ))}
        </div>
      </Card>

      <NavButtons step={6} />
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
            <li key={i} className="p-2 bg-gray-50 rounded">💬 {item}</li>
          ))}
        </ul>
      </Card>

      <NavButtons step={7} />
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
          O candidato demonstrou domínio técnico adequado nas áreas avaliadas, apresentou documentação completa e validada, e obteve desempenho satisfatório na entrevista técnica. A comissão recomenda a emissão do certificado CCA.
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

      <NavButtons step={8} />
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
          <Button variant="outline" className="w-full">✓ Validar Certificado Online</Button>
        </div>
      </Card>

      <NavButtons step={9} />
    </StepLayout>
  );
}
