import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GlobalFooter() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold mb-4">ANEFAC CCA</h4>
            <p className="text-sm text-gray-400">
              Certificação profissional de excelência desde 1968.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/">
                  <a className="text-gray-400 hover:text-white">Home</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Certificações
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Dialog>
                  <DialogTrigger asChild>
                    <a href="#" className="text-gray-400 hover:text-white">
                      📚 Tutoriais
                    </a>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tutoriais - Centro de Ajuda</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold mb-2">Como Funciona a Certificação?</h4>
                        <p className="text-sm text-gray-600">
                          Assista nossos vídeos tutoriais explicando cada etapa.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
              <li>
                <Dialog>
                  <DialogTrigger asChild>
                    <a href="#" className="text-gray-400 hover:text-white">
                      💬 Fale Conosco
                    </a>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Entre em Contato</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm">contato@anefac.com.br</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Dialog>
                  <DialogTrigger asChild>
                    <a href="#" className="text-gray-400 hover:text-white">
                      🔒 LGPD
                    </a>
                  </DialogTrigger>
                  <DialogContent className="max-h-96 overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Política de Privacidade e LGPD</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm">
                      <p>
                        A ANEFAC está comprometida em proteger seus dados pessoais.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Termos de Uso
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 ANEFAC. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
