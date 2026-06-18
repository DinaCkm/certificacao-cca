import React from "react";
import { X, Linkedin, User } from "lucide-react";
import { useInstitucional } from "@/contexts/InstitucionalContext";

interface Props {
  onClose: () => void;
}

export function ComiteModal({ onClose }: Props) {
  const { institucional } = useInstitucional();
  const membros = institucional.comite;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-xl font-black text-gray-900">Comitê de Certificação ANEFAC</h2>
            <p className="text-sm text-gray-500 mt-1">
              A análise da documentação e aprovação dos candidatos é realizada por comitê próprio, formado pelo superintendente da ANEFAC, pelo diretor executivo da certificação e por membros do Conselho de Administração.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0 ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Members */}
        <div className="p-6 grid sm:grid-cols-2 gap-4">
          {membros.map((m) => (
            <div
              key={m.id}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-blue-100 flex items-center justify-center">
                {m.fotoUrl ? (
                  <img src={m.fotoUrl} alt={m.nome} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-blue-700 text-lg">{m.nome.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{m.nome}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{m.cargo}</p>
                {m.miniCurriculo && (
                  <p className="text-xs text-gray-600 mt-1.5 leading-snug">{m.miniCurriculo}</p>
                )}
                {m.linkedin && (
                  <a
                    href={m.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2 transition-colors"
                  >
                    <Linkedin className="w-3 h-3" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <p className="text-xs text-gray-400 text-center">
            A entrevista com os membros do Comitê poderá se dar por meio presencial ou remoto, em data pré-acordada.
          </p>
        </div>
      </div>
    </div>
  );
}
