import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  ImageIcon, Plus, Trash2, Eye, EyeOff, GripVertical,
  X, Check, AlertCircle, Upload, ExternalLink
} from "lucide-react";

interface Imagem {
  id: number;
  titulo: string;
  subtitulo: string;
  url_imagem: string;
  ordem: number;
  ativo: boolean;
}

export function AdminCarrossel() {
  const { toast } = useToast();
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Imagem | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    subtitulo: "",
    url_imagem: "",
    ordem: 0,
    ativo: true,
  });

  useEffect(() => { carregarImagens(); }, []);

  async function carregarImagens() {
    setCarregando(true);
    try {
      const { imagens } = await (api.admin as any).listarCarrossel();
      setImagens(imagens);
    } catch {
      toast({ title: "Erro ao carregar imagens", variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }

  function abrirNova() {
    setEditando(null);
    setForm({ titulo: "", subtitulo: "", url_imagem: "", ordem: imagens.length, ativo: true });
    setModalAberto(true);
  }

  function abrirEditar(img: Imagem) {
    setEditando(img);
    setForm({ titulo: img.titulo || "", subtitulo: img.subtitulo || "", url_imagem: img.url_imagem, ordem: img.ordem, ativo: img.ativo });
    setModalAberto(true);
  }

  async function salvar() {
    if (!form.url_imagem) {
      toast({ title: "URL da imagem é obrigatória", variant: "destructive" });
      return;
    }
    setSalvando(true);
    try {
      if (editando) {
        await (api.admin as any).editarCarrossel(editando.id, form);
        toast({ title: "Imagem atualizada!" });
      } else {
        await (api.admin as any).criarCarrossel(form);
        toast({ title: "Imagem adicionada ao carrossel!" });
      }
      setModalAberto(false);
      carregarImagens();
    } catch (err: any) {
      toast({ title: err.message || "Erro ao salvar", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  }

  async function toggleAtivo(img: Imagem) {
    try {
      await (api.admin as any).editarCarrossel(img.id, { ...img, ativo: !img.ativo });
      toast({ title: img.ativo ? "Imagem desativada" : "Imagem ativada" });
      carregarImagens();
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  }

  async function remover(id: number) {
    if (!confirm("Remover esta imagem do carrossel?")) return;
    try {
      await (api.admin as any).removerCarrossel(id);
      toast({ title: "Imagem removida" });
      carregarImagens();
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  }

  const ativas = imagens.filter(i => i.ativo).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Carrossel de Imagens</h1>
              <p className="text-sm text-gray-500">{ativas} de 5 imagens ativas</p>
            </div>
          </div>
          <Button
            className="bg-blue-900 hover:bg-blue-800"
            onClick={abrirNova}
            disabled={ativas >= 5}
          >
            <Plus className="w-4 h-4 mr-2" />
            {ativas >= 5 ? "Limite atingido" : "Adicionar imagem"}
          </Button>
        </div>

        {/* Aviso de limite */}
        {ativas >= 5 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">Limite de 5 imagens atingido. Desative ou remova uma para adicionar outra.</p>
          </div>
        )}

        {/* Dica de uso */}
        <Card className="mb-6 border-blue-100 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800 font-medium mb-1">📸 Como adicionar imagens</p>
            <p className="text-xs text-blue-700">
              Hospede a imagem em qualquer serviço (Google Drive, Dropbox, Cloudinary, ImgBB) e cole a URL direta aqui.
              Recomendamos imagens em formato <strong>16:9</strong> (ex: 1920×1080px) para melhor aparência no carrossel.
            </p>
          </CardContent>
        </Card>

        {/* Lista de imagens */}
        {carregando ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : imagens.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="font-medium text-gray-600">Nenhuma imagem cadastrada</p>
              <p className="text-sm text-gray-400 mt-1">Adicione até 5 imagens para o carrossel da página de entrada.</p>
              <Button className="mt-5 bg-blue-900 hover:bg-blue-800" onClick={abrirNova}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar primeira imagem
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {imagens.map((img, idx) => (
              <Card key={img.id} className={`overflow-hidden ${!img.ativo ? "opacity-60" : ""}`}>
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    {/* Preview */}
                    <div className="w-40 h-28 shrink-0 bg-gray-100 relative overflow-hidden">
                      <img
                        src={img.url_imagem}
                        alt={img.titulo || `Imagem ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/160x112/e2e8f0/94a3b8?text=Imagem";
                        }}
                      />
                      <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                        #{img.ordem + 1}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{img.titulo || "Sem título"}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${img.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {img.ativo ? "Ativa" : "Inativa"}
                          </span>
                        </div>
                        {img.subtitulo && <p className="text-sm text-gray-500">{img.subtitulo}</p>}
                        <a href={img.url_imagem} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                          <ExternalLink className="w-3 h-3" />
                          {img.url_imagem.slice(0, 60)}...
                        </a>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => abrirEditar(img)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleAtivo(img)}>
                          {img.ativo ? <><EyeOff className="w-3 h-3 mr-1" /> Desativar</> : <><Eye className="w-3 h-3 mr-1" /> Ativar</>}
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => remover(img.id)}>
                          <Trash2 className="w-3 h-3 mr-1" /> Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">{editando ? "Editar imagem" : "Adicionar imagem"}</h2>
                <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>URL da imagem *</Label>
                  <Input
                    value={form.url_imagem}
                    onChange={e => setForm({ ...form, url_imagem: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  {form.url_imagem && (
                    <div className="mt-2 rounded-lg overflow-hidden h-32 bg-gray-100">
                      <img src={form.url_imagem} alt="Preview" className="w-full h-full object-cover"
                        onError={e => (e.target as HTMLImageElement).src = "https://placehold.co/400x128/e2e8f0/94a3b8?text=URL+inválida"} />
                    </div>
                  )}
                </div>

                <div>
                  <Label>Título (opcional)</Label>
                  <Input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
                    placeholder="Ex: Profissional certificado ANEFAC" />
                </div>

                <div>
                  <Label>Subtítulo (opcional)</Label>
                  <Input value={form.subtitulo} onChange={e => setForm({ ...form, subtitulo: e.target.value })}
                    placeholder="Ex: Conquiste sua certificação e avance na carreira" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ordem de exibição</Label>
                    <Input type="number" min="0" max="4" value={form.ordem}
                      onChange={e => setForm({ ...form, ordem: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.ativo}
                        onChange={e => setForm({ ...form, ativo: e.target.checked })}
                        className="w-4 h-4 rounded" />
                      <span className="text-sm font-medium text-gray-700">Imagem ativa</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setModalAberto(false)} disabled={salvando}>
                  Cancelar
                </Button>
                <Button className="flex-1 bg-blue-900 hover:bg-blue-800" onClick={salvar} disabled={salvando}>
                  {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Adicionar ao carrossel"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
