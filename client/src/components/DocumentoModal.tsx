import React from "react";
import { X, ExternalLink } from "lucide-react";

interface Props {
  titulo: string;
  conteudo: string;
  urlExterna?: string;
  onClose: () => void;
}

function renderMarkdown(text: string) {
  // Very simple markdown-like rendering
  return text
    .split("\n")
    .map((line, i) => {
      // Horizontal rule
      if (line.trim() === "---") return <hr key={i} className="my-4 border-gray-200" />;

      // Heading-like bold lines (standalone **text**)
      const boldLine = line.match(/^\*\*(.*)\*\*$/);
      if (boldLine) return <p key={i} className="font-bold text-gray-900 mt-4 mb-1">{boldLine[1]}</p>;

      // Blockquote
      if (line.startsWith("> ")) return (
        <blockquote key={i} className="border-l-4 border-blue-300 pl-4 text-gray-600 italic my-2">
          {renderInline(line.slice(2))}
        </blockquote>
      );

      // List item
      if (line.match(/^[-*] /)) return (
        <li key={i} className="ml-4 text-gray-700 text-sm leading-relaxed list-disc">
          {renderInline(line.slice(2))}
        </li>
      );

      // Empty line
      if (!line.trim()) return <div key={i} className="h-2" />;

      // Normal paragraph
      return <p key={i} className="text-gray-700 text-sm leading-relaxed">{renderInline(line)}</p>;
    });
}

function renderInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*(.+)\*\*$/);
    if (bold) return <strong key={i}>{bold[1]}</strong>;
    const italic = part.match(/^\*(.+)\*$/);
    if (italic) return <em key={i}>{italic[1]}</em>;
    const link = part.match(/^\[(.+)\]\((.+)\)$/);
    if (link) return <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{link[1]}</a>;
    return part;
  });
}

export function DocumentoModal({ titulo, conteudo, urlExterna, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-black text-gray-900 pr-4">{titulo}</h2>
          <div className="flex items-center gap-2 shrink-0">
            {urlExterna && (
              <a
                href={urlExterna}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir PDF
              </a>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-1">
          {renderMarkdown(conteudo)}
        </div>
      </div>
    </div>
  );
}
