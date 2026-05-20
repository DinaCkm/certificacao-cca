import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Award, Zap, Users } from 'lucide-react';
import { Link } from 'wouter';
import Navigation from '@/components/Navigation';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 bg-primary/10 rounded-full">
                  <span className="text-sm font-semibold text-primary">
                    Certificação Profissional ANEFAC
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                  Certifique sua expertise em Controladoria
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">
                  A certificação CCA da ANEFAC é reconhecida no mercado como o padrão de excelência em controladoria. Inicie sua jornada de certificação profissional hoje.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/step-1">
                  <a>
                    <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                      Começar Agora
                    </Button>
                  </a>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Saiba Mais
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                <div>
                  <p className="text-2xl font-bold text-primary">5000+</p>
                  <p className="text-sm text-muted-foreground">Certificados Emitidos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">95%</p>
                  <p className="text-sm text-muted-foreground">Taxa de Aprovação</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground">Anos de Tradição</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-96 md:h-full min-h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663427002956/X4DQXhUgAnY9KtzPPBNLwM/hero-certification-G3u2HhT2ho6rtNV3FWiiWt.webp"
                alt="Professional certification"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-anefac-secondary/5 rounded-full -ml-48 -mb-48 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Por que escolher a certificação CCA?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Desenvolvida para profissionais que buscam validar e expandir suas competências em controladoria.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Award className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-bold text-lg text-primary mb-2">Reconhecimento</h3>
              <p className="text-sm text-muted-foreground">
                Certificado reconhecido pelo mercado e validado pela comunidade ANEFAC.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-bold text-lg text-primary mb-2">Prova Segura</h3>
              <p className="text-sm text-muted-foreground">
                Avaliação rigorosa com monitoramento contínuo e integridade garantida.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-bold text-lg text-primary mb-2">Comunidade</h3>
              <p className="text-sm text-muted-foreground">
                Acesso a rede de profissionais certificados e oportunidades de networking.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CheckCircle2 className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-bold text-lg text-primary mb-2">Desenvolvimento</h3>
              <p className="text-sm text-muted-foreground">
                Trilhas personalizadas de aprendizagem para aprimorar suas competências.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 md:py-32 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Sua Jornada de Certificação
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              9 etapas cuidadosamente estruturadas para garantir uma experiência completa e profissional.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { number: 1, title: 'Escolha', desc: 'Selecione sua jornada ideal' },
              { number: 2, title: 'Cadastro', desc: 'Preencha seus dados profissionais' },
              { number: 3, title: 'Compra', desc: 'Finalize o pagamento' },
              { number: 4, title: 'Prova', desc: 'Realize a avaliação' },
              { number: 5, title: 'Resultado', desc: 'Veja seu desempenho' },
              { number: 6, title: 'Documentos', desc: 'Envie evidências' },
              { number: 7, title: 'Entrevista', desc: 'Validação técnica' },
              { number: 8, title: 'Decisão', desc: 'Resultado final' },
              { number: 9, title: 'Certificado', desc: 'Receba seu diploma' },
            ].map((step) => (
              <Card key={step.number} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-bold text-lg text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-anefac-secondary rounded-2xl p-12 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Junte-se a milhares de profissionais que já conquistaram sua certificação CCA.
            </p>
            <Link href="/step-1">
              <a>
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-secondary font-bold"
                >
                  Iniciar Certificação
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">ANEFAC</h4>
              <p className="text-sm opacity-80">
                Associação Nacional de Executivos de Finanças, Administração e Contabilidade.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Certificação</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100">Sobre CCA</a></li>
                <li><a href="#" className="hover:opacity-100">Critérios</a></li>
                <li><a href="#" className="hover:opacity-100">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100">Contato</a></li>
                <li><a href="#" className="hover:opacity-100">Ajuda</a></li>
                <li><a href="#" className="hover:opacity-100">Termos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Redes Sociais</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100">LinkedIn</a></li>
                <li><a href="#" className="hover:opacity-100">Instagram</a></li>
                <li><a href="#" className="hover:opacity-100">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm opacity-80">
            <p>&copy; 2024 ANEFAC. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
