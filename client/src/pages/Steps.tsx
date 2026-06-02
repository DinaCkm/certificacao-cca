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
        <button
          onClick={() => window.history.back()}
          className="text-blue-900 hover:underline mb-2 inline-block text-sm cursor-pointer"
        >
          ← Voltar
        </button>
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
      <Button 
        variant="outline"
        onClick={() => window.history.back()}
      >
        ← Anterior
      </Button>
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
      <div className="max-w-2xl">
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Sobre a Certificação CCA</h2>
          <p className="text-gray-700 mb-4">
            A Certificação de Crédito e Análise (CCA) é uma certificação profissional reconhecida que valida suas competências em análise de crédito e conformidade.
          </p>
          <p className="text-gray-700">
            Este processo de certificação inclui cursos preparatórios, prova de conhecimento, análise documental e entrevista técnica.
          </p>
        </Card>
        <NavButtons step={1} nextLink="/step-2" />
      </div>
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
  const search = useSearch();
  const params = new URLSearchParams(search);
  const level = params.get("level");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (formData.name && formData.cpf && formData.email && formData.phone) {
      // Salvar dados em localStorage
      localStorage.setItem("userProfileData", JSON.stringify(formData));
      if (level === "2") {
        window.location.href = "/step-3?level=2";
      } else {
        window.location.href = "/step-3?level=1";
      }
    }
  };

  return (
    <StepLayout step={2} title="Perfil Profissional">
      <div className="max-w-2xl">
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Digite seu nome completo"
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </Card>
        <div className="flex gap-3 mt-6">
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
          >
            ← Anterior
          </Button>
          <Button 
            className="bg-blue-900 hover:bg-blue-800"
            onClick={handleNext}
          >
            Próximo →
          </Button>
        </div>
      </div>
    </StepLayout>
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
      nextStep: "/payment?package=Certificação Direta&price=499&level=1", // Vai para pagamento
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
      nextStep: "/payment?package=Pacote Completo&price=1299&level=1", // Vai para pagamento
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
      </StepLayout>
  );
}

// Step 4 - Visualização de Cursos (Preparatório)
export function Step4() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const packageName = params.get("package") || "Preparatório";

  const courses = [
    {
      id: 1,
      title: "Fundamentos de Controladoria",
      description: "Conceitos essenciais de controladoria e gestão financeira.",
      category: "Controladoria",
      level: "Intermediário",
      duration: "12h",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/course-controladoria-BJNtryQnGGbzJxxjrdzVdX.webp",
    },
    {
      id: 2,
      title: "Análise de Demonstrações Financeiras",
      description: "Técnicas avançadas de análise de balanços e relatórios.",
      category: "Análise",
      level: "Avançado",
      duration: "15h",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/course-analise-financeira-BJNtryQnGGbzJxxjrdzVdX.webp",
    },
    {
      id: 3,
      title: "Gestão de Riscos Financeiros",
      description: "Identificação e mitigação de riscos em operações financeiras.",
      category: "Finanças",
      level: "Avançado",
      duration: "10h",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/course-gestao-riscos-BJNtryQnGGbzJxxjrdzVdX.webp",
    },
    {
      id: 4,
      title: "Compliance e Conformidade",
      description: "Normas e procedimentos de conformidade regulatória.",
      category: "Compliance",
      level: "Intermediário",
      duration: "8h",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/course-compliance-BJNtryQnGGbzJxxjrdzVdX.webp",
    },
    {
      id: 5,
      title: "Contabilidade Avançada",
      description: "Técnicas avançadas de contabilidade e consolidação.",
      category: "Contabilidade",
      level: "Avançado",
      duration: "14h",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/course-contabilidade-BJNtryQnGGbzJxxjrdzVdX.webp",
    },
    {
      id: 6,
      title: "Auditoria Interna",
      description: "Processos e metodologias de auditoria interna.",
      category: "Auditoria",
      level: "Intermediário",
      duration: "11h",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/course-auditoria-BJNtryQnGGbzJxxjrdzVdX.webp",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-blue-900 hover:underline mb-4 inline-block text-sm cursor-pointer"
          >
            ← Voltar
          </button>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">PREPARE-SE PARA A CERTIFICAÇÃO</h1>
              <p className="text-gray-600">
                Veja abaixo os cursos que você terá acesso no seu preparatório COM O PACOTE PREPARATÓRIO
              </p>
            </div>
            <Link href="/payment?package=Preparatório&price=799&level=1">
              <a>
                <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
                  COMPRAR AGORA
                </Button>
              </a>
            </Link>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {courses.map((course) => (
            <Card key={course.id} className="bg-blue-900 text-white overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                    {course.category}
                  </span>
                  <span className="bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded">
                    {course.level}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                <p className="text-sm text-gray-200 mb-3">{course.description}</p>
                <div className="text-xs text-gray-300">⏱ {course.duration}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Package Info */}
        <Card className="bg-blue-50 p-6 mb-8">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Seu Pacote: {packageName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Cursos Disponíveis</p>
              <p className="text-2xl font-bold text-blue-900">6</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Horas Totais</p>
              <p className="text-2xl font-bold text-blue-900">70h</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Preço</p>
              <p className="text-2xl font-bold text-green-600">R$ 799</p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link href="/payment?package=Preparatório&price=799&level=1">
            <a>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
                COMPRAR AGORA
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Step 5 - Resultado da Prova
export function Step5() {
  const [proofResult, setProofResult] = useState<"approved" | "failed" | null>(null);
  const search = useSearch();
  const params = new URLSearchParams(search);
  const level = params.get("level");

  useEffect(() => {
    // Simular resultado da prova
    const randomResult = Math.random() > 0.5 ? "approved" : "failed";
    setProofResult(randomResult);
  }, []);

  const performanceData = [
    { name: "Controladoria", score: 85 },
    { name: "Análise", score: 78 },
    { name: "Finanças", score: 92 },
    { name: "Compliance", score: 88 },
    { name: "Contabilidade", score: 81 },
  ];

  if (proofResult === "approved") {
    return (
      <StepLayout step={5} title="Resultado da Prova">
        <div className="max-w-2xl">
          <Card className="p-6 mb-6 bg-green-50 border-green-200">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">PARABÉNS! VOCÊ FOI APROVADO!</h2>
              <p className="text-gray-700">Sua nota foi 85/100</p>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-4">Desempenho por Área</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#1e3a5f" />
                <ReferenceLine y={70} stroke="#ff9800" label="Mínimo" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <NavButtons step={5} nextLink="/step-6" />
        </div>
      </StepLayout>
    );
  }

  if (proofResult === "failed") {
    return (
      <StepLayout step={5} title="Resultado da Prova">
        <div className="max-w-2xl">
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✗</div>
              <h2 className="text-2xl font-bold text-red-700 mb-2">NÃO FOI DESTA VEZ</h2>
              <p className="text-gray-700">Sua nota foi 62/100 (mínimo: 70)</p>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-4">Análise de Desempenho</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#ff6b6b" />
                <ReferenceLine y={70} stroke="#ff9800" label="Mínimo" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 mb-6 bg-yellow-50">
            <h3 className="font-bold text-yellow-900 mb-3">Áreas com Baixo Desempenho:</h3>
            <ul className="space-y-2 text-sm text-yellow-900">
              <li>• Análise de Demonstrações Financeiras (78/100)</li>
              <li>• Contabilidade Avançada (81/100)</li>
            </ul>
            <p className="text-sm text-yellow-800 mt-4">
              Recomendamos revisar estes tópicos antes de tentar novamente.
            </p>
          </Card>

          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
            >
              ← Anterior
            </Button>
            <Link href="/recovery-checkout">
              <a>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Comprar Nova Tentativa →
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </StepLayout>
    );
  }

  return (
    <StepLayout step={5} title="Resultado da Prova">
      <div className="max-w-2xl">
        <Card className="p-6">
          <p className="text-gray-600">Carregando resultado...</p>
        </Card>
      </div>
    </StepLayout>
  );
}

// Step 6 - Upload Documental
export function Step6() {
  return <Step6UploadComponent />;
}

// Step 7 - Entrevista Técnica
export function Step7() {
  return (
    <StepLayout step={7} title="Entrevista Técnica">
      <div className="max-w-2xl">
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Próxima Etapa: Entrevista Técnica</h2>
          <p className="text-gray-700 mb-4">
            Você será contatado em breve para agendar sua entrevista técnica com a comissão de certificação.
          </p>
          <p className="text-gray-700">
            A entrevista durará aproximadamente 30 minutos e abordará tópicos relacionados à sua experiência profissional.
          </p>
        </Card>
        <NavButtons step={7} nextLink="/step-8" />
      </div>
    </StepLayout>
  );
}

// Step 8 - Decisão Final
export function Step8() {
  return (
    <StepLayout step={8} title="Decisão Final">
      <div className="max-w-2xl">
        <Card className="p-6 mb-6 bg-green-50">
          <div className="text-center">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">APROVADO!</h2>
            <p className="text-gray-700">Parabéns! Você foi aprovado na certificação.</p>
          </div>
        </Card>
        <NavButtons step={8} nextLink="/step-9" />
      </div>
    </StepLayout>
  );
}

// Step 9 - Certificado
export function Step9() {
  return (
    <StepLayout step={9} title="Certificado">
      <div className="max-w-2xl">
        <Card className="p-8 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-900">
          <div className="text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-3xl font-bold text-blue-900 mb-2">CERTIFICADO DE CONCLUSÃO</h2>
            <p className="text-lg text-gray-700 mb-6">Certificação de Crédito e Análise (CCA)</p>
            <div className="border-t-2 border-blue-900 pt-4">
              <p className="text-gray-600">Certificado emitido em: {new Date().toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        </Card>
        <div className="flex gap-3 mt-6">
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
          >
            ← Anterior
          </Button>
          <Link href="/">
            <a>
              <Button className="bg-green-600 hover:bg-green-700">
                Voltar ao Início
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </StepLayout>
  );
}
