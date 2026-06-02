import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

export function MiniCadastro() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (formData.name && formData.email && formData.phone) {
      localStorage.setItem("userMiniData", JSON.stringify(formData));
      localStorage.setItem("certificationLevel", ""); // Reset level selection
    }
  };

  const isFormValid = formData.name && formData.email && formData.phone;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-3">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/select-level">
            <a className="text-blue-900 hover:underline mb-4 inline-block text-sm">← Voltar</a>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Mini Cadastro</h1>
            <p className="text-gray-600">
              Preencha seus dados básicos para continuar com a certificação
            </p>
          </div>
        </div>

        <Card className="p-8 mb-6 border-2 border-blue-100">
          <form className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Nome Completo *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={handleChange}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                Telefone *
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={handleChange}
                className="mt-2"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-4">
                * Campos obrigatórios. Esses dados serão usados para sua certificação.
              </p>
            </div>
          </form>
        </Card>

        <div className="flex gap-3 justify-center">
          <Link href="/select-level">
            <a>
              <Button variant="outline">← Anterior</Button>
            </a>
          </Link>
          <Link href={isFormValid ? "/select-level" : "#"}>
            <a onClick={(e) => {
              if (!isFormValid) {
                e.preventDefault();
              } else {
                handleNext();
              }
            }}>
              <Button 
                className="bg-blue-900 hover:bg-blue-800" 
                disabled={!isFormValid}
              >
                Próximo: Escolher Nível →
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
