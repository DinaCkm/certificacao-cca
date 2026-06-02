import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Search, Filter, Play } from "lucide-react";

const COURSES = [
  {
    id: 1,
    title: "Controladoria Estratégica",
    category: "Controladoria",
    level: "Intermediário",
    duration: "40h",
    price: "R$ 299",
    image: "🎓",
    description: "Aprenda os fundamentos da controladoria estratégica e sua aplicação prática",
    instructor: "Prof. Carlos Silva",
    rating: 4.8,
    students: 1200,
  },
  {
    id: 2,
    title: "Orçamento Empresarial",
    category: "Finanças",
    level: "Básico",
    duration: "30h",
    price: "R$ 199",
    image: "📊",
    description: "Domine as técnicas de orçamento empresarial e planejamento financeiro",
    instructor: "Prof. Ana Costa",
    rating: 4.9,
    students: 1500,
  },
  {
    id: 3,
    title: "Indicadores de Performance",
    category: "Análise",
    level: "Intermediário",
    duration: "25h",
    price: "R$ 249",
    image: "📈",
    description: "Desenvolva habilidades em análise de indicadores e métricas de desempenho",
    instructor: "Prof. Roberto Dias",
    rating: 4.7,
    students: 890,
  },
  {
    id: 4,
    title: "Gestão de Riscos",
    category: "Gestão",
    level: "Avançado",
    duration: "35h",
    price: "R$ 349",
    image: "⚠️",
    description: "Estratégias avançadas de identificação e mitigação de riscos corporativos",
    instructor: "Prof. Mariana Santos",
    rating: 4.6,
    students: 650,
  },
  {
    id: 5,
    title: "Governança Corporativa",
    category: "Compliance",
    level: "Avançado",
    duration: "45h",
    price: "R$ 399",
    image: "🏢",
    description: "Estruturas e práticas de governança corporativa conforme padrões internacionais",
    instructor: "Prof. Felipe Oliveira",
    rating: 4.8,
    students: 920,
  },
  {
    id: 6,
    title: "Contabilidade Gerencial",
    category: "Contabilidade",
    level: "Intermediário",
    duration: "38h",
    price: "R$ 279",
    image: "📋",
    description: "Contabilidade aplicada à gestão empresarial e tomada de decisão",
    instructor: "Prof. Juliana Martins",
    rating: 4.9,
    students: 1100,
  },
  {
    id: 7,
    title: "Análise de Demonstrações Financeiras",
    category: "Análise",
    level: "Intermediário",
    duration: "32h",
    price: "R$ 289",
    image: "💰",
    description: "Técnicas avançadas de análise e interpretação de demonstrações financeiras",
    instructor: "Prof. Lucas Ferreira",
    rating: 4.7,
    students: 1050,
  },
  {
    id: 8,
    title: "Planejamento Tributário",
    category: "Impostos",
    level: "Avançado",
    duration: "40h",
    price: "R$ 359",
    image: "🔍",
    description: "Estratégias legais de otimização tributária para empresas",
    instructor: "Prof. Beatriz Alves",
    rating: 4.8,
    students: 780,
  },
  {
    id: 9,
    title: "Auditoria Interna",
    category: "Auditoria",
    level: "Avançado",
    duration: "42h",
    price: "R$ 379",
    image: "✅",
    description: "Processos e metodologias de auditoria interna e controle",
    instructor: "Prof. Gustavo Rocha",
    rating: 4.6,
    students: 620,
  },
  {
    id: 10,
    title: "Gestão de Caixa",
    category: "Finanças",
    level: "Básico",
    duration: "28h",
    price: "R$ 189",
    image: "💳",
    description: "Técnicas de gestão de fluxo de caixa e tesouraria",
    instructor: "Prof. Renata Silva",
    rating: 4.9,
    students: 1300,
  },
  {
    id: 11,
    title: "Controladoria em Startups",
    category: "Controladoria",
    level: "Intermediário",
    duration: "24h",
    price: "R$ 219",
    image: "🚀",
    description: "Aplicação de controladoria em ambientes de startups e empresas em crescimento",
    instructor: "Prof. Thiago Costa",
    rating: 4.7,
    students: 540,
  },
  {
    id: 12,
    title: "Transformação Digital na Controladoria",
    category: "Tecnologia",
    level: "Intermediário",
    duration: "30h",
    price: "R$ 299",
    image: "💻",
    description: "Ferramentas digitais e automação de processos contábeis e de controle",
    instructor: "Prof. Isabela Gomes",
    rating: 4.8,
    students: 890,
  },
];

export function CoursesPlatform() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [isRecovery, setIsRecovery] = useState(false);

  const recoveryGaps = ["Controladoria e Gestão", "Gestão de Riscos", "Planejamento e Orçamento"];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsRecovery(params.get("recovery") === "true");
    }
  }, []);

  const categories = ["Controladoria", "Finanças", "Análise", "Gestão", "Compliance", "Contabilidade", "Auditoria", "Impostos", "Tecnologia"];
  const levels = ["Básico", "Intermediário", "Avançado"];

  const filteredCourses = COURSES.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const selectedCourseData = COURSES.find((c) => c.id === selectedCourse);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {isRecovery && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-300 font-bold">⚠️ Cursos de Recuperação</p>
              <p className="text-red-200 text-sm">Você foi reprovado. Recomendamos estudar os cursos abaixo para reforçar seus conhecimentos nos gaps identificados.</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.history.back()}
                className="text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                ← Voltar
              </button>
              <h1 className="text-2xl font-bold">{isRecovery ? "📚 Cursos de Recuperação" : "🎓 Plataforma de Cursos ANEFAC"}</h1>
            </div>
            <Button 
              onClick={() => {
                if (isRecovery) {
                  window.location.href = "/exam-security-check";
                } else {
                  window.location.href = "/exam-security-check";
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRecovery ? "Fazer Prova Novamente" : "AGENDAR A PROVA"} →
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Recovery Info */}
        {isRecovery && (
          <div className="mb-8 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
            <p className="text-yellow-300 font-bold mb-2">🎯 Suas Áreas de Melhoria:</p>
            <div className="flex flex-wrap gap-2">
              {recoveryGaps.map((gap) => (
                <span key={gap} className="bg-yellow-700 text-yellow-100 px-3 py-1 rounded-full text-sm">
                  {gap}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filtros
          </h3>

          {/* Category Filter */}
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">Categoria</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !selectedCategory
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Nível</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLevel(null)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !selectedLevel
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                Todos
              </button>
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedLevel === level
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div>
          <h3 className="text-xl font-bold mb-6">
            {filteredCourses.length} Curso{filteredCourses.length !== 1 ? "s" : ""} Encontrado{filteredCourses.length !== 1 ? "s" : ""}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all cursor-pointer group overflow-hidden"
                onClick={() => setSelectedCourse(course.id)}
              >
                {/* Course Thumbnail */}
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 h-40 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform overflow-hidden">
                  {course.image}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {course.title}
                    </h4>
                  </div>

                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{course.description}</p>

                  <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
                    <span>{course.category}</span>
                    <span className="bg-slate-700 px-2 py-1 rounded">{course.level}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-yellow-400">⭐ {course.rating}</span>
                    <span className="text-xs text-gray-400">{course.students} alunos</span>
                  </div>

                  <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="text-gray-400">⏱️ {course.duration}</span>
                    <span className="font-bold text-blue-400">{course.price}</span>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">👨‍🏫 {course.instructor}</p>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                    {isRecovery ? "💳 Comprar Agora" : "▶️ Assistir Agora"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && selectedCourseData && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCourse(null)}
        >
          <Card
            className="bg-slate-800 border-slate-700 max-w-2xl w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedCourseData.title}</h2>
                  <p className="text-gray-400">{selectedCourseData.description}</p>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-700 rounded">
                  <p className="text-xs text-gray-400">Instrutor</p>
                  <p className="font-bold text-white">{selectedCourseData.instructor}</p>
                </div>
                <div className="p-3 bg-slate-700 rounded">
                  <p className="text-xs text-gray-400">Duração</p>
                  <p className="font-bold text-white">{selectedCourseData.duration}</p>
                </div>
                <div className="p-3 bg-slate-700 rounded">
                  <p className="text-xs text-gray-400">Nível</p>
                  <p className="font-bold text-white">{selectedCourseData.level}</p>
                </div>
                <div className="p-3 bg-slate-700 rounded">
                  <p className="text-xs text-gray-400">Alunos</p>
                  <p className="font-bold text-white">{selectedCourseData.students}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-white">O que você aprenderá:</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {isRecovery ? (
                    <>
                      <li>✓ Reforço nas áreas de baixo desempenho</li>
                      <li>✓ Exercícios focados nos seus gaps</li>
                      <li>✓ Simulados de preparação</li>
                      <li>✓ Suporte para nova tentativa de prova</li>
                    </>
                  ) : (
                    <>
                      <li>✓ Conceitos fundamentais e aplicações práticas</li>
                      <li>✓ Estudos de caso reais do mercado</li>
                      <li>✓ Exercícios práticos e simulações</li>
                      <li>✓ Certificado de conclusão</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="flex gap-3 mt-6">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-6">
                  {isRecovery ? "💳 Comprar Agora" : "▶️ Assistir Curso"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedCourse(null)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
