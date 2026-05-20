import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { CoursesPlatform as CoursesPlatformComponent } from "./CoursesPlatform";
import { RecoveryCheckout as RecoveryCheckoutComponent } from "./RecoveryCheckout";
import { RetakeExamCheckout as RetakeExamCheckoutComponent } from "./RetakeExamCheckout";
import { Step6Upload as Step6UploadComponent } from "./Step6Upload";

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
  const [activeTab, setActiveTab] = useState("dados");
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    // Formação Acadêmica
    graduacoes: [{id: 1, curso: "", instituicao: "", ano: ""}],
    posGraduacoes: [{id: 1, curso: "", instituicao: "", ano: ""}],
    mbas: [{id: 1, curso: "", instituicao: "", ano: ""}],
    // Cursos Extracurriculares
    cursos: [{id: 1, nome: "", instituicao: "", ano: "", cargaHoraria: ""}],
    // Experiência Profissional
    experiencias: [{id: 1, empresa: "", cargo: "", periodo: "", descricao: ""}],
    // Projetos
    projetos: [{id: 1, nome: "", descricao: "", tecnologias: "", resultado: ""}],
    // Áreas de Destaque
    competencias: "",
    idiomas: "",
    certificacoes: "",
    // Autoavaliação
    autoavaliacao: "5",
    // Declarações
    motivacao: "",
    objetivos: "",
  });

  const addField = (section: string) => {
    const sections: any = {
      graduacoes: { id: Date.now(), curso: "", instituicao: "", ano: "" },
      posGraduacoes: { id: Date.now(), curso: "", instituicao: "", ano: "" },
      mbas: { id: Date.now(), curso: "", instituicao: "", ano: "" },
      cursos: { id: Date.now(), nome: "", instituicao: "", ano: "", cargaHoraria: "" },
      experiencias: { id: Date.now(), empresa: "", cargo: "", periodo: "", descricao: "" },
      projetos: { id: Date.now(), nome: "", descricao: "", tecnologias: "", resultado: "" },
    };
    setFormData((prev: any) => ({
      ...prev,
      [section]: [...prev[section], sections[section]],
    }));
  };

  const updateField = (section: string, index: number, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: prev[section].map((item: any, i: number) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeField = (section: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: prev[section].filter((_: any, i: number) => i !== index),
    }));
  };

  const renderSection = (title: string, content: React.ReactNode) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-900">{title}</h3>
      {content}
    </div>
  );

  return (
    <StepLayout step={2} title="Perfil Profissional">
      <div className="mb-6 flex gap-2 flex-wrap">
        {[
          { id: "dados", label: "👤 Dados Pessoais" },
          { id: "formacao", label: "🎓 Formação" },
          { id: "cursos", label: "📚 Cursos Extra" },
          { id: "experiencia", label: "💼 Experiência" },
          { id: "projetos", label: "🚀 Projetos" },
          { id: "destaque", label: "⭐ Destaque" },
          { id: "declaracoes", label: "📝 Declarações" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded font-semibold transition ${
              activeTab === tab.id
                ? "bg-blue-900 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="p-8 mb-8">
        {/* Dados Pessoais */}
        {activeTab === "dados" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo *</label>
                <input type="text" placeholder="Seu nome" className="w-full p-3 border border-gray-300 rounded" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">CPF *</label>
                <input type="text" placeholder="000.000.000-00" className="w-full p-3 border border-gray-300 rounded" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                <input type="email" placeholder="seu@email.com" className="w-full p-3 border border-gray-300 rounded" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Telefone</label>
                <input type="tel" placeholder="(11) 98765-4321" className="w-full p-3 border border-gray-300 rounded" value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {/* Formação Acadêmica */}
        {activeTab === "formacao" && (
          <div className="space-y-6">
            {renderSection("🎓 Graduação", (
              <div className="space-y-4">
                {formData.graduacoes.map((grad, idx) => (
                  <div key={grad.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input type="text" placeholder="Curso" className="p-2 border border-gray-300 rounded" value={grad.curso} onChange={(e) => updateField("graduacoes", idx, "curso", e.target.value)} />
                      <input type="text" placeholder="Instituição" className="p-2 border border-gray-300 rounded" value={grad.instituicao} onChange={(e) => updateField("graduacoes", idx, "instituicao", e.target.value)} />
                      <input type="text" placeholder="Ano" className="p-2 border border-gray-300 rounded" value={grad.ano} onChange={(e) => updateField("graduacoes", idx, "ano", e.target.value)} />
                    </div>
                    {formData.graduacoes.length > 1 && <button onClick={() => removeField("graduacoes", idx)} className="text-red-600 text-sm font-bold">Remover</button>}
                  </div>
                ))}
                <button onClick={() => addField("graduacoes")} className="px-4 py-2 bg-blue-100 text-blue-900 rounded font-semibold">+ Adicionar Graduação</button>
              </div>
            ))}

            {renderSection("📖 Pós-Graduação", (
              <div className="space-y-4">
                {formData.posGraduacoes.map((pos, idx) => (
                  <div key={pos.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input type="text" placeholder="Curso" className="p-2 border border-gray-300 rounded" value={pos.curso} onChange={(e) => updateField("posGraduacoes", idx, "curso", e.target.value)} />
                      <input type="text" placeholder="Instituição" className="p-2 border border-gray-300 rounded" value={pos.instituicao} onChange={(e) => updateField("posGraduacoes", idx, "instituicao", e.target.value)} />
                      <input type="text" placeholder="Ano" className="p-2 border border-gray-300 rounded" value={pos.ano} onChange={(e) => updateField("posGraduacoes", idx, "ano", e.target.value)} />
                    </div>
                    {formData.posGraduacoes.length > 1 && <button onClick={() => removeField("posGraduacoes", idx)} className="text-red-600 text-sm font-bold">Remover</button>}
                  </div>
                ))}
                <button onClick={() => addField("posGraduacoes")} className="px-4 py-2 bg-blue-100 text-blue-900 rounded font-semibold">+ Adicionar Pós-Graduação</button>
              </div>
            ))}

            {renderSection("💼 MBA", (
              <div className="space-y-4">
                {formData.mbas.map((mba, idx) => (
                  <div key={mba.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input type="text" placeholder="Curso" className="p-2 border border-gray-300 rounded" value={mba.curso} onChange={(e) => updateField("mbas", idx, "curso", e.target.value)} />
                      <input type="text" placeholder="Instituição" className="p-2 border border-gray-300 rounded" value={mba.instituicao} onChange={(e) => updateField("mbas", idx, "instituicao", e.target.value)} />
                      <input type="text" placeholder="Ano" className="p-2 border border-gray-300 rounded" value={mba.ano} onChange={(e) => updateField("mbas", idx, "ano", e.target.value)} />
                    </div>
                    {formData.mbas.length > 1 && <button onClick={() => removeField("mbas", idx)} className="text-red-600 text-sm font-bold">Remover</button>}
                  </div>
                ))}
                <button onClick={() => addField("mbas")} className="px-4 py-2 bg-blue-100 text-blue-900 rounded font-semibold">+ Adicionar MBA</button>
              </div>
            ))}
          </div>
        )}

        {/* Cursos Extracurriculares */}
        {activeTab === "cursos" && (
          <div className="space-y-4">
            {formData.cursos.map((curso, idx) => (
              <div key={curso.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Nome do Curso" className="p-2 border border-gray-300 rounded" value={curso.nome} onChange={(e) => updateField("cursos", idx, "nome", e.target.value)} />
                  <input type="text" placeholder="Instituição" className="p-2 border border-gray-300 rounded" value={curso.instituicao} onChange={(e) => updateField("cursos", idx, "instituicao", e.target.value)} />
                  <input type="text" placeholder="Ano" className="p-2 border border-gray-300 rounded" value={curso.ano} onChange={(e) => updateField("cursos", idx, "ano", e.target.value)} />
                  <input type="text" placeholder="Carga Horária" className="p-2 border border-gray-300 rounded" value={curso.cargaHoraria} onChange={(e) => updateField("cursos", idx, "cargaHoraria", e.target.value)} />
                </div>
                {formData.cursos.length > 1 && <button onClick={() => removeField("cursos", idx)} className="text-red-600 text-sm font-bold">Remover</button>}
              </div>
            ))}
            <button onClick={() => addField("cursos")} className="px-4 py-2 bg-blue-100 text-blue-900 rounded font-semibold">+ Adicionar Curso</button>
          </div>
        )}

        {/* Experiência Profissional */}
        {activeTab === "experiencia" && (
          <div className="space-y-4">
            {formData.experiencias.map((exp, idx) => (
              <div key={exp.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Empresa" className="p-2 border border-gray-300 rounded" value={exp.empresa} onChange={(e) => updateField("experiencias", idx, "empresa", e.target.value)} />
                  <input type="text" placeholder="Cargo" className="p-2 border border-gray-300 rounded" value={exp.cargo} onChange={(e) => updateField("experiencias", idx, "cargo", e.target.value)} />
                </div>
                <input type="text" placeholder="Período (ex: 2020-2023)" className="w-full p-2 border border-gray-300 rounded" value={exp.periodo} onChange={(e) => updateField("experiencias", idx, "periodo", e.target.value)} />
                <textarea placeholder="Descrição das atividades" className="w-full p-2 border border-gray-300 rounded h-20" value={exp.descricao} onChange={(e) => updateField("experiencias", idx, "descricao", e.target.value)} />
                {formData.experiencias.length > 1 && <button onClick={() => removeField("experiencias", idx)} className="text-red-600 text-sm font-bold">Remover</button>}
              </div>
            ))}
            <button onClick={() => addField("experiencias")} className="px-4 py-2 bg-blue-100 text-blue-900 rounded font-semibold">+ Adicionar Experiência</button>
          </div>
        )}

        {/* Projetos */}
        {activeTab === "projetos" && (
          <div className="space-y-4">
            {formData.projetos.map((proj, idx) => (
              <div key={proj.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <input type="text" placeholder="Nome do Projeto" className="w-full p-2 border border-gray-300 rounded" value={proj.nome} onChange={(e) => updateField("projetos", idx, "nome", e.target.value)} />
                <textarea placeholder="Descrição" className="w-full p-2 border border-gray-300 rounded h-16" value={proj.descricao} onChange={(e) => updateField("projetos", idx, "descricao", e.target.value)} />
                <input type="text" placeholder="Tecnologias utilizadas" className="w-full p-2 border border-gray-300 rounded" value={proj.tecnologias} onChange={(e) => updateField("projetos", idx, "tecnologias", e.target.value)} />
                <textarea placeholder="Resultados alcançados" className="w-full p-2 border border-gray-300 rounded h-16" value={proj.resultado} onChange={(e) => updateField("projetos", idx, "resultado", e.target.value)} />
                {formData.projetos.length > 1 && <button onClick={() => removeField("projetos", idx)} className="text-red-600 text-sm font-bold">Remover</button>}
              </div>
            ))}
            <button onClick={() => addField("projetos")} className="px-4 py-2 bg-blue-100 text-blue-900 rounded font-semibold">+ Adicionar Projeto</button>
          </div>
        )}

        {/* Áreas de Destaque */}
        {activeTab === "destaque" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Competências Principais</label>
              <textarea placeholder="Ex: Gestão de Projetos, Liderança, Análise Financeira" className="w-full p-3 border border-gray-300 rounded h-20" value={formData.competencias} onChange={(e) => setFormData({...formData, competencias: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Idiomas</label>
              <textarea placeholder="Ex: Português (Nativo), Inglês (Fluente), Espanhol (Intermediário)" className="w-full p-3 border border-gray-300 rounded h-16" value={formData.idiomas} onChange={(e) => setFormData({...formData, idiomas: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Certificações Profissionais</label>
              <textarea placeholder="Ex: PMP, ITIL, Six Sigma" className="w-full p-3 border border-gray-300 rounded h-16" value={formData.certificacoes} onChange={(e) => setFormData({...formData, certificacoes: e.target.value})} />
            </div>
          </div>
        )}

        {/* Declarações */}
        {activeTab === "declaracoes" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Autoavaliação de Conhecimento (1-10)</label>
              <input type="range" min="1" max="10" className="w-full" value={formData.autoavaliacao} onChange={(e) => setFormData({...formData, autoavaliacao: e.target.value})} />
              <p className="text-center text-lg font-bold text-blue-900 mt-2">{formData.autoavaliacao}/10</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Motivação para Certificação</label>
              <textarea placeholder="Por que você deseja obter essa certificação?" className="w-full p-3 border border-gray-300 rounded h-24" value={formData.motivacao} onChange={(e) => setFormData({...formData, motivacao: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Objetivos Profissionais</label>
              <textarea placeholder="Quais são seus objetivos profissionais?" className="w-full p-3 border border-gray-300 rounded h-24" value={formData.objetivos} onChange={(e) => setFormData({...formData, objetivos: e.target.value})} />
            </div>
          </div>
        )}
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
            href="/exam-security-check"
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
            <p className="text-5xl mb-4">🎉</p>
            <p className="text-3xl font-bold text-green-800 mb-2">Parabéns! Excelente Desempenho!</p>
            <p className="text-sm text-green-700 font-bold mb-4">RESULTADO GERAL</p>
            <p className="text-5xl font-bold text-green-700 my-2">78%</p>
            <p className="text-lg font-bold text-green-800">✓ APROVADO</p>
            <p className="text-sm text-green-700 mt-4">Você demonstrou domínio técnico adequado nas áreas avaliadas</p>
          </div>
        </Card>
      )}

      {resultType === "approved" && (
        <Card className="p-6 mb-8 bg-blue-50 border-2 border-blue-300">
          <h3 className="font-bold text-lg text-blue-900 mb-4">📊 Pontos de Melhoria Identificados</h3>
          <p className="text-sm text-gray-700 mb-4">Mesmo com excelente desempenho, identificamos áreas para aperfeiçoamento:</p>
          <div className="space-y-3 mb-6">
            <div className="p-3 bg-white rounded border border-blue-200">
              <p className="font-semibold text-gray-900">Planejamento e Orçamento</p>
              <p className="text-sm text-gray-600">Seu desempenho: 72% | Recomendado: 85%+</p>
            </div>
            <div className="p-3 bg-white rounded border border-blue-200">
              <p className="font-semibold text-gray-900">Gestão de Riscos</p>
              <p className="text-sm text-gray-600">Seu desempenho: 68% | Recomendado: 85%+</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-3 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800">
              📥 Download Relatório de Performance
            </button>
            <Link href="/courses-platform?improvement=true">
              <a className="flex-1 px-4 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 text-center">
                🚀 Aperfeiçoe-se Conosco
              </a>
            </Link>
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
  const [documents, setDocuments] = React.useState<{id: string; title: string; description: string; icon: string; required: boolean; uploaded: boolean}[]>([
    {
      id: "curriculum",
      title: "Currículo Atualizado",
      description: "Currículo profissional em PDF ou DOC (máx. 5MB)",
      icon: "📄",
      required: true,
      uploaded: false,
    },
    {
      id: "diploma",
      title: "Diploma de Graduação",
      description: "Cópia do diploma ou certificado de conclusão (JPG, PNG ou PDF)",
      icon: "🎓",
      required: true,
      uploaded: false,
    },
    {
      id: "experience",
      title: "Comprovante de Experiência",
      description: "Carta de recomendação ou comprovante de experiência profissional",
      icon: "💼",
      required: true,
      uploaded: false,
    },
    {
      id: "certificates",
      title: "Certificados Profissionais",
      description: "Certificados de cursos, treinamentos ou certificações relevantes",
      icon: "📜",
      required: false,
      uploaded: false,
    },
  ]);

  const handleUpload = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, uploaded: true } : doc
      )
    );
  };

  const allRequiredUploaded = documents.filter((d) => d.required).every((d) => d.uploaded);
  const uploadedCount = documents.filter((d) => d.uploaded).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/step-5">
            <a className="text-blue-900 hover:underline mb-4 inline-block">← Voltar</a>
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-xl">6</div>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Upload Documental</h1>
              <p className="text-gray-600">Etapa 6 de 9</p>
            </div>
          </div>
        </div>

        <Card className="p-8 mb-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">📋 Resumo da Documentação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold">Candidato</p>
              <p className="text-lg font-bold text-gray-900">João Silva Santos</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold">CPF</p>
              <p className="text-lg font-bold text-gray-900">123.456.789-00</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold">Email</p>
              <p className="text-lg font-bold text-gray-900">joao.silva@email.com</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold">Telefone</p>
              <p className="text-lg font-bold text-gray-900">(11) 98765-4321</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold">Formação</p>
              <p className="text-lg font-bold text-gray-900">Bacharel em Contabilidade</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold">Experiência</p>
              <p className="text-lg font-bold text-gray-900">8 anos em Controladoria</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200 md:col-span-2">
              <p className="text-sm text-gray-600 font-semibold">Status da Prova</p>
              <p className="text-lg font-bold text-green-600">✅ Aprovado (85%)</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📸 Documentos a Enviar</h2>
          <p className="text-gray-600 mb-6">Faça upload dos documentos abaixo. Os campos marcados com <span className="text-red-600 font-bold">*</span> são obrigatórios.</p>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-900 transition bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{doc.icon}</span>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">
                          {doc.title}
                          {doc.required && <span className="text-red-600 ml-2">*</span>}
                        </h4>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {doc.uploaded ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">✅</span>
                        <span className="text-xs font-semibold text-green-600">Enviado</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpload(doc.id)}
                        className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition font-semibold"
                      >
                        📤 Upload
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className={`p-8 mb-8 border-2 ${allRequiredUploaded ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300"}`}>
          <h2 className={`text-2xl font-bold mb-4 ${allRequiredUploaded ? "text-green-900" : "text-amber-900"}`}>📊 Status de Envio</h2>
          <div className="space-y-3 mb-6">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{doc.icon}</span>
                  <span className="text-gray-700 font-medium">{doc.title}</span>
                </div>
                <span className={`font-bold text-sm ${doc.uploaded ? "text-green-600" : "text-gray-400"}`}>
                  {doc.uploaded ? "✅ Completo" : "⏳ Pendente"}
                </span>
              </div>
            ))}
          </div>
          <div className={`p-4 rounded-lg border-l-4 ${allRequiredUploaded ? "bg-green-100 border-green-600" : "bg-amber-100 border-amber-600"}`}>
            <p className={`font-bold ${allRequiredUploaded ? "text-green-900" : "text-amber-900"}`}>
              {allRequiredUploaded ? "✅ Todos os documentos obrigatórios foram enviados!" : "⚠️ Documentos pendentes"}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              {allRequiredUploaded ? "Você pode prosseguir para a próxima etapa." : `Envie todos os documentos obrigatórios. Você enviou ${uploadedCount} de ${documents.length} documentos.`}
            </p>
          </div>
        </Card>

        <div className="flex justify-between gap-4">
          <Link href="/step-5"><a><Button variant="outline" className="px-8">← Anterior</Button></a></Link>
          <Link href={allRequiredUploaded ? "/step-7" : "#"}><a><Button className={`px-8 ${allRequiredUploaded ? "bg-blue-900 hover:bg-blue-800" : "bg-gray-400 cursor-not-allowed"}`} disabled={!allRequiredUploaded}>Próximo →</Button></a></Link>
        </div>
      </div>
    </div>
  );
}

// Step 7 - Agendamento de Entrevista Técnica
export function Step7() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const availableDates = [
    { date: "2024-07-15", day: "Segunda", available: true },
    { date: "2024-07-16", day: "Terça", available: true },
    { date: "2024-07-17", day: "Quarta", available: false },
    { date: "2024-07-18", day: "Quinta", available: true },
    { date: "2024-07-19", day: "Sexta", available: true },
    { date: "2024-07-22", day: "Segunda", available: true },
  ];

  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"
  ];

  return (
    <StepLayout step={7} title="Agendamento da Entrevista Técnica">
      <Card className="p-6 mb-8 bg-blue-50 border-2 border-blue-300">
        <h3 className="font-bold text-lg text-blue-900 mb-2">📅 Próxima Etapa: Entrevista Técnica</h3>
        <p className="text-sm text-gray-700">Selecione uma data e horário convenientes para sua entrevista com a comissão técnica. A entrevista durará aproximadamente 45 minutos.</p>
      </Card>

      <Card className="p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Datas Disponíveis</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableDates.map((item) => (
            <button
              key={item.date}
              onClick={() => item.available && setSelectedDate(item.date)}
              disabled={!item.available}
              className={`p-4 rounded border-2 transition ${
                selectedDate === item.date
                  ? "border-blue-900 bg-blue-100"
                  : item.available
                  ? "border-gray-300 hover:border-blue-900"
                  : "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
              }`}
            >
              <p className="font-bold text-sm">{item.day}</p>
              <p className="text-xs text-gray-600">{item.date}</p>
              {!item.available && <p className="text-xs text-red-600 mt-1">Indisponível</p>}
            </button>
          ))}
        </div>
      </Card>

      {selectedDate && (
        <Card className="p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">Horários Disponíveis para {selectedDate}</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-3 rounded border-2 transition font-semibold ${
                  selectedTime === time
                    ? "border-blue-900 bg-blue-900 text-white"
                    : "border-gray-300 hover:border-blue-900"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </Card>
      )}

      {selectedDate && selectedTime && (
        <Card className="p-6 mb-8 bg-green-50 border-2 border-green-300">
          <h3 className="font-bold text-lg text-green-900 mb-4">✓ Agendamento Confirmado</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Data:</span>
              <span className="font-bold text-gray-900">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Horário:</span>
              <span className="font-bold text-gray-900">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Duração:</span>
              <span className="font-bold text-gray-900">45 minutos</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Modalidade:</span>
              <span className="font-bold text-gray-900">Videoconferência</span>
            </div>
          </div>
          <p className="text-sm text-green-700 mt-4">Um link de acesso será enviado por email 24 horas antes da entrevista.</p>
        </Card>
      )}

      <NavButtons step={7} nextLink={selectedDate && selectedTime ? "/step-8" : undefined} />
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
