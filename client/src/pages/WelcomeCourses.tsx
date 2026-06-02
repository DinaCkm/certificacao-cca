import { useSearchParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, BookOpen, Clock, Trophy } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Fundamentos de Controladoria',
    description: 'Conceitos essenciais de controladoria e gestão financeira.',
    duration: '12h',
    category: 'Controladoria',
  },
  {
    id: 2,
    title: 'Análise de Demonstrações Financeiras',
    description: 'Técnicas avançadas de análise de balanços e relatórios.',
    duration: '15h',
    category: 'Análise',
  },
  {
    id: 3,
    title: 'Gestão de Riscos Financeiros',
    description: 'Identificação e mitigação de riscos em operações financeiras.',
    duration: '10h',
    category: 'Finanças',
  },
  {
    id: 4,
    title: 'Compliance e Conformidade',
    description: 'Normas e procedimentos de conformidade regulatória.',
    duration: '8h',
    category: 'Compliance',
  },
  {
    id: 5,
    title: 'Contabilidade Avançada',
    description: 'Técnicas avançadas de contabilidade e consolidação.',
    duration: '14h',
    category: 'Contabilidade',
  },
  {
    id: 6,
    title: 'Auditoria Interna',
    description: 'Processos e metodologias de auditoria interna.',
    duration: '11h',
    category: 'Auditoria',
  },
];

export function WelcomeCourses() {
  const [searchParams] = useSearchParams();
  const packageName = searchParams.get('package') || 'Preparatório';
  const studentName = searchParams.get('name') || 'Aluno';

  const handleStartCourses = () => {
    // Redirecionar para a plataforma de cursos
    window.location.href = `/courses-learning?package=${packageName}&name=${studentName}`;
  };

  const handleScheduleExam = () => {
    // Redirecionar para Step-5 (Resultado da Prova)
    window.location.href = '/step-5';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Trophy className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            Parabéns por fazer parte do grupo ANEFAC!
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Bem-vindo, <span className="font-semibold">{studentName}</span>
          </p>
          <p className="text-lg text-gray-600">
            Você adquiriu o pacote <span className="font-semibold text-blue-600">{packageName}</span>
          </p>
        </div>

        {/* Informações do Pacote */}
        <Card className="bg-white p-8 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Cursos Disponíveis</p>
                <p className="text-2xl font-bold text-blue-900">6</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Horas Totais</p>
                <p className="text-2xl font-bold text-blue-900">70h</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Acesso Imediato</p>
                <p className="text-2xl font-bold text-green-600">Liberado</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <p className="text-blue-900">
              ✓ Acesso a todos os 6 cursos do preparatório<br />
              ✓ Materiais de estudo completos e atualizados<br />
              ✓ Simulados e exercícios práticos<br />
              ✓ Suporte ao aluno 24/7<br />
              ✓ Certificado de conclusão
            </p>
          </div>
        </Card>

        {/* Cursos Disponíveis */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Seus Cursos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="bg-white p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-blue-900 text-lg flex-1">{course.title}</h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                    {course.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <Button
            onClick={handleStartCourses}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold w-full"
          >
            Começar Agora
          </Button>
          <p className="text-gray-600 text-sm text-center">
            Clique para acessar a plataforma de aprendizado
          </p>

          <div className="border-t pt-6">
            <p className="text-gray-700 text-sm mb-4 text-center">
              Já concluiu os cursos e está pronto para a prova?
            </p>
            <Button
              onClick={handleScheduleExam}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold w-full"
            >
              AGENDAR A PROVA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
