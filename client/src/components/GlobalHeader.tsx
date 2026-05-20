import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GlobalHeader() {
  return (
    <header className="bg-blue-900 text-white py-4 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/">
          <a className="font-bold text-xl hover:text-blue-100">ANEFAC CCA</a>
        </Link>

        <div className="flex gap-3">
          {/* Tutoriais */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-white border-white hover:bg-blue-800">
                📚 Tutoriais
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tutoriais - Centro de Ajuda</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">Como Funciona a Certificação?</h4>
                  <p className="text-sm text-gray-600">
                    Assista nossos vídeos tutoriais explicando cada etapa do processo de certificação CCA.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Preparação para a Prova</h4>
                  <p className="text-sm text-gray-600">
                    Dicas e orientações para se preparar melhor para a avaliação.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Requisitos Técnicos</h4>
                  <p className="text-sm text-gray-600">
                    Verifique os requisitos de câmera, microfone e conexão de internet.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Fale Conosco */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-white border-white hover:bg-blue-800">
                💬 Fale Conosco
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Entre em Contato</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">📧 Email</h4>
                  <p className="text-sm">contato@anefac.com.br</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">📞 Telefone</h4>
                  <p className="text-sm">(11) 3000-0000</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">💬 Chat ao Vivo</h4>
                  <p className="text-sm">Disponível de seg-sex, 9h às 18h</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* LGPD */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-white border-white hover:bg-blue-800">
                🔒 LGPD
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-96 overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Política de Privacidade e LGPD</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p>
                  A ANEFAC está comprometida em proteger seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD).
                </p>
                <div>
                  <h4 className="font-bold mb-2">Dados Coletados</h4>
                  <p>Coletamos dados pessoais, profissionais e de desempenho necessários para o processo de certificação.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Uso dos Dados</h4>
                  <p>Seus dados são utilizados exclusivamente para fins de certificação, avaliação e comunicação.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Segurança</h4>
                  <p>Implementamos medidas de segurança para proteger seus dados contra acesso não autorizado.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Seus Direitos</h4>
                  <p>Você tem direito de acessar, corrigir ou deletar seus dados. Entre em contato conosco.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
