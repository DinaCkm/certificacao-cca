import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Link, useSearch, useRouter } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { CoursesPlatform as CoursesPlatformComponent } from "./CoursesPlatform";
import { RecoveryCheckout as RecoveryCheckoutComponent } from "./RecoveryCheckout";
import { RetakeExamCheckout as RetakeExamCheckoutComponent } from "./RetakeExamCheckout";
import { Step6Upload as Step6UploadComponent } from "./Step6Upload";
import { useUserData } from "@/contexts/UserDataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Context para gerenciar o fluxo do usuário
const useUserFlow = () => {
  const [userFlow, setUserFlow] = useState({
    journeyType: null as string | null,
    proofResult: null as string | null,
    gapAreas: [] as string[],
  });

  return { userFlow, setUserFlow };
};

const StepLayout = ({ step, title, children }: { step: number; title: string; children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-3">
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/">
          <a className="text-blue-900 hover:underline mb-2 inline-block text-sm">← Voltar</a>
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {step}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">{title}</h1>
            <p className="text-xs text-gray-600">Etapa {step} de 9</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  </div>
);

const NavButtons = ({ step, nextLink, onNext }: { step: number; nextLink?: string; onNext?: () => void }) => (
  <div className="flex gap-3 mt-6">
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
          <Button className="bg-blue-900 hover:bg-blue-800" onClick={onNext}>Próximo →</Button>
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

// Step 1 - Informativo apenas (sem venda de pacotes)
export function Step1() {
  return (
    <StepLayout step={1} title="Bem-vindo à Certificação">
      <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Sua Jornada de Certificação</h2>
        <p className="text-sm text-gray-700 mb-4">
          Você está iniciando o processo de certificação profissional. As próximas etapas incluem:
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ <strong>Cadastro Básico:</strong> Informações pessoais e profissionais</li>
          <li>✓ <strong>Pagamento:</strong> Escolha do pacote de certificação</li>
          <li>✓ <strong>Prova/Preparatório:</strong> Avaliação de conhecimento</li>
          <li>✓ <strong>Resultado:</strong> Visualização do desempenho</li>
          <li>✓ <strong>Documentação:</strong> Envio de documentos e cadastro completo</li>
          <li>✓ <strong>Entrevista Técnica:</strong> Validação com a comissão</li>
          <li>✓ <strong>Decisão Final:</strong> Resultado da certificação</li>
          <li>✓ <strong>Certificado:</strong> Recebimento do diploma</li>
        </ul>
      </Card>

      <NavButtons step={1} nextLink="/step-2" />
    </StepLayout>
  );
}

// Step 2 - Cadastro Básico
export function Step2() {
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (formData.name && formData.cpf && formData.email && formData.phone) {
      localStorage.setItem("userBasicData", JSON.stringify(formData));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-3">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/select-level">
            <a className="text-blue-900 hover:underline mb-2 inline-block text-sm">← Voltar</a>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Cadastro Básico</h1>
              <p className="text-xs text-gray-600">Etapa 1 de 8</p>
            </div>
          </div>
        </div>
      <Card className="p-6 mb-6">
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Nome Completo *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cpf" className="text-sm font-medium">CPF *</Label>
              <Input
                id="cpf"
                name="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">Telefone *</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>
        </form>
      </Card>

      <div className="flex gap-3 mt-6">
        <Link href="/select-level">
          <a>
            <Button variant="outline">← Anterior</Button>
          </a>
        </Link>
        <Link href="/step-3">
          <a>
            <Button className="bg-blue-900 hover:bg-blue-800" onClick={handleNext}>
              Próximo →
            </Button>
          </a>
        </Link>
      </div>
      </div>
    </div>
  );
}

// Step 3 - Compra/Pagamento
export function Step3() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const search = useSearch();
  const params = new URLSearchParams(search);
  const level = params.get('level');

  if (level === '2') {
    // Nível 2: Pula Steps 4-5 (Prova/Preparatório e Resultado) e vai direto para Step-6 (Upload Documental)
    return (
      <StepLayout step={3} title="Pagamento - Análise Documental">
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Pacote de Análise e Entrevista</h2>
          <div className="border-2 border-blue-900 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-blue-900">Análise Documental + Entrevista</h3>
                <p className="text-sm text-gray-600 mt-1">Para profissionais experientes</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">R$ 1.999</p>
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded mb-4">
              <p className="text-sm font-medium text-gray-800">Inclui:</p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>✓ Análise completa de documentação</li>
                <li>✓ Entrevista técnica com comissão</li>
                <li>✓ Certificado profissional</li>
              </ul>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Pagar R$ 1.999 e Agendar Entrevista
            </Button>
          </div>
        </Card>
        <NavButtons step={3} nextLink="/step-6" />
      </StepLayout>
    );
  }

  // Nível 1: 3 pacotes de certificação
  const packages = [
    {
      id: "direct",
      title: "Certificação Direta",
      price: "R$ 499",
      features: ["Acesso à prova", "Resultado imediato", "Entrevista técnica"],
      nextStep: "/step-5", // Pula Step-4 (Cursos) e vai direto para Step-5 (Resultado)
    },
    {
      id: "prep",
      title: "Preparatório",
      price: "R$ 799",
      features: ["Cursos completos", "Simulados", "Mentoria"],
      popular: true,
      nextStep: "/step-4", // Vai para Step-4 (Cursos)
    },
    {
      id: "complete",
      title: "Pacote Completo",
      price: "R$ 1.299",
      features: ["Tudo incluído", "Suporte total", "Aulas ON-LINE"],
      nextStep: "/step-5", // Vai direto para Step-5 (Resultado)
    },
  ];

  const router = useRouter();
  const selectedPkg = packages.find(p => p.id === selectedPackage);

  const handleConfirm = () => {
    if (selectedPkg) {
      window.location.href = selectedPkg.nextStep;
    }
  };

  return (
    <>
      <StepLayout step={3} title="Escolha o Pacote de Certificacao">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={`p-4 cursor-pointer border-2 transition-all ${pkg.popular ? 'border-blue-900 bg-blue-50' : 'border-gray-200 hover:border-blue-900'}`}>
              {pkg.popular && <p className="text-xs font-bold text-blue-900 mb-2">MAIS POPULAR</p>}
              <h3 className="font-bold text-blue-900 mb-2">{pkg.title}</h3>
              <p className="text-2xl font-bold text-green-600 mb-3">{pkg.price}</p>
              <ul className="text-xs space-y-1 mb-4">
                {pkg.features.map((f, i) => (
                  <li key={i} className="text-gray-700">✓ {f}</li>
                ))}
              </ul>
              <Button 
                className="w-full bg-blue-900 hover:bg-blue-800 text-white text-xs"
                onClick={() => setSelectedPackage(pkg.id)}
              >
                Selecionar
              </Button>
            </Card>
          ))}
        </div>
        <NavButtons step={3} nextLink={undefined} />
      </StepLayout>

      {/* Modal de Confirmacao */}
      <Dialog open={!!selectedPackage} onOpenChange={(open) => !open && setSelectedPackage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pacote Selecionado</DialogTitle>
          </DialogHeader>
          {selectedPkg && (
            <div className="py-4">
              <h3 className="text-lg font-bold text-blue-900 mb-2">{selectedPkg.title}</h3>
              <p className="text-2xl font-bold text-green-600 mb-4">{selectedPkg.price}</p>
              <p className="text-sm text-gray-600 mb-4">Você está prestes a selecionar este pacote. Deseja continuar?</p>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setSelectedPackage(null)}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Step 4 - Plataforma de Cursos (Preparatório)
export function Step4() {
  const courses = [
    {
      id: 1,
      title: "Fundamentos de Controladoria",
      category: "Controladoria",
      duration: "12h",
      level: "Básico",
      description: "Conceitos essenciais de controladoria e gestão financeira.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/curso-controladoria-PuwWN4hU9HYqcW3Ee3nM4M.webp",
    },
    {
      id: 2,
      title: "Análise de Demonstrações Financeiras",
      category: "Análise",
      duration: "15h",
      level: "Intermediário",
      description: "Técnicas avançadas de análise de balanços e relatórios.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/curso-analise-financeira-fAy3suMnoBsu7aCBwJm6QF.webp",
    },
    {
      id: 3,
      title: "Gestão de Riscos Financeiros",
      category: "Finanças",
      duration: "10h",
      level: "Intermediário",
      description: "Identificação e mitigação de riscos em operações financeiras.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/curso-gestao-riscos-c6BKq5ETyAMJeJJNEUdX33.webp",
    },
    {
      id: 4,
      title: "Compliance e Conformidade",
      category: "Compliance",
      duration: "8h",
      level: "Básico",
      description: "Normas e procedimentos de conformidade regulatória.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/curso-compliance-ffpYTrpTHkVGq4xTsSpLYS.webp",
    },
    {
      id: 5,
      title: "Contabilidade Avançada",
      category: "Contabilidade",
      duration: "14h",
      level: "Avançado",
      description: "Técnicas avançadas de contabilidade e consolidação.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/curso-contabilidade-Wuan2CFFsmnGDzhPLtNYjM.webp",
    },
    {
      id: 6,
      title: "Auditoria Interna",
      category: "Auditoria",
      duration: "11h",
      level: "Intermediário",
      description: "Processos e metodologias de auditoria interna.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/curso-auditoria-9qBJx7v5RKh3P2nzvpCeP2.webp",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-3">
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link href="/step-3">
          <a className="text-blue-900 hover:underline text-sm">← Voltar</a>
        </Link>
        <Link href="/step-3">
          <a>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-bold">COMPRAR AGORA</Button>
          </a>
        </Link>
      </div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">PREPARE-SE PARA A CERTIFICAÇÃO</h1>
        <p className="text-lg text-gray-700 mb-2">Veja abaixo os cursos que você terá acesso no seu preparatório</p>
        <p className="text-lg font-semibold text-blue-900">COM O PACOTE PREPARATÓRIO</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all bg-blue-900">
            <div className="h-40 overflow-hidden">
              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-white text-lg mb-3">{course.title}</h3>
              <p className="text-sm text-gray-200 mb-4">{course.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-yellow-500 text-blue-900 px-3 py-1 rounded-full font-semibold">{course.category}</span>
                <span className="text-xs bg-green-400 text-blue-900 px-3 py-1 rounded-full font-semibold">{course.level}</span>
              </div>
              <p className="text-sm text-gray-300 font-semibold">⏱️ {course.duration}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border-2 border-blue-900 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Pacote Preparatório</h2>
        <p className="text-gray-700 mb-6">Acesso a todos os 6 cursos + simulados + mentoria personalizada</p>
        <p className="text-4xl font-bold text-green-600 mb-6">R$ 799</p>
        <Link href="/step-3">
          <a>
            <Button className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 rounded-lg font-bold">
              COMPRAR AGORA
            </Button>
          </a>
        </Link>
      </div>

    </div>
    </div>
  );
}

// Step 5 - Resultado
export function Step5() {
  const data = [
    { name: "Conhecimento", value: 85 },
    { name: "Prática", value: 78 },
    { name: "Ética", value: 92 },
    { name: "Legislação", value: 88 },
  ];

  return (
    <StepLayout step={5} title="Resultado da Prova">
      <Card className="p-6 mb-6">
        <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-6">
          <p className="text-green-800 font-semibold">✓ Parabéns! Você foi aprovado!</p>
          <p className="text-sm text-green-700">Pontuação: 86/100</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#0f766e" />
            <ReferenceLine y={70} stroke="#f59e0b" label="Mínimo" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <NavButtons step={5} nextLink="/step-6" />
    </StepLayout>
  );
}

// Step 6 - Upload Documental
export function Step6() {
  return (
    <StepLayout step={6} title="Upload Documental">
      <Step6UploadComponent />
      <NavButtons step={6} nextLink="/step-7" />
    </StepLayout>
  );
}

// Step 7 - Entrevista Técnica
export function Step7() {
  return (
    <StepLayout step={7} title="Entrevista Técnica">
      <Card className="p-6 mb-6">
        <p className="text-gray-700 mb-4">Agende sua entrevista técnica com a comissão.</p>
        <Button className="bg-blue-900 hover:bg-blue-800">Agendar Entrevista</Button>
      </Card>
      <NavButtons step={7} nextLink="/step-8" />
    </StepLayout>
  );
}

// Step 8 - Decisão Final
export function Step8() {
  return (
    <StepLayout step={8} title="Decisão Final">
      <Card className="p-6 mb-6 bg-green-50 border-green-200">
        <p className="text-green-800 font-semibold mb-2">✓ Certificado Aprovado!</p>
        <p className="text-sm text-gray-700">Sua certificação foi aprovada pela comissão. Prossiga para receber seu certificado.</p>
      </Card>
      <NavButtons step={8} nextLink="/step-9" />
    </StepLayout>
  );
}

// Step 9 - Certificado
export function Step9() {
  return (
    <StepLayout step={9} title="Certificado">
      <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-900">
        <div className="text-center">
          <p className="text-3xl mb-4">🏆</p>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Parabéns!</h2>
          <p className="text-gray-700 mb-4">Você é agora um profissional certificado pela ANEFAC.</p>
          <p className="text-sm text-gray-600 mb-6">Seu certificado foi enviado para seu email.</p>
          <Button className="bg-green-600 hover:bg-green-700">Baixar Certificado</Button>
        </div>
      </Card>
      <NavButtons step={9} />
    </StepLayout>
  );
}
