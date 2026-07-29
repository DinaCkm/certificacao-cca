import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function PoliticaCookies() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar
        </Button>

        <h1 className="text-2xl font-bold text-foreground mb-2">Política de Cookies</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: julho de 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold mb-2">O que são cookies</h2>
            <p>
              Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site. Eles
              permitem que o site reconheça seu dispositivo e lembre informações sobre sua visita, como preferências
              e ações realizadas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Como usamos cookies</h2>
            <p>Utilizamos cookies nas seguintes categorias:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Estritamente necessários</strong> — essenciais para o funcionamento da plataforma (autenticação, segurança, navegação). Não podem ser desativados.</li>
              <li><strong>Desempenho</strong> — nos ajudam a entender como o site é utilizado, medindo acessos e páginas mais visitadas, para melhorarmos a experiência.</li>
              <li><strong>Direcionamento</strong> — usados para tornar as mensagens exibidas mais relevantes para você e seus interesses.</li>
              <li><strong>Funcionalidade</strong> — permitem que o site lembre escolhas feitas por você, como idioma ou preferências de exibição.</li>
              <li><strong>Não classificados</strong> — cookies que ainda estamos classificando, junto com os fornecedores de cookies individuais.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Como gerenciar suas preferências</h2>
            <p>
              Você pode escolher quais categorias de cookies aceitar através do banner exibido ao acessar o site.
              Também é possível gerenciar cookies diretamente nas configurações do seu navegador, mas isso pode
              afetar o funcionamento de algumas partes da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Seus dados e a LGPD</h2>
            <p>
              O tratamento de dados pessoais na Plataforma ANEFAC segue a Lei Geral de Proteção de Dados (Lei nº
              13.709/2018). Para mais informações sobre como tratamos seus dados pessoais durante o processo de
              certificação, consulte nossa Política de Privacidade, apresentada no momento do cadastro.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
