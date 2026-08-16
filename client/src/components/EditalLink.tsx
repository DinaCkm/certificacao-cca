import React, { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { api } from "@/lib/api";

// O edital de cada certificação vem do banco agora (versionado, por
// certificação) — não mais do campo cert.editalUrl, que só existia no
// localStorage de quem editou e nunca era visto pelo candidato de verdade.

interface EditalData {
  titulo: string;
  url_externa: string | null;
  conteudo: string | null;
}

export function useEdital(certSlug: string) {
  const [edital, setEdital] = useState<EditalData | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    api.certificacoes.buscarEdital(certSlug)
      .then((res) => { if (ativo) setEdital(res.edital); })
      .catch(() => { if (ativo) setEdital(null); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [certSlug]);

  return { edital, carregando };
}

export function EditalLink({ certSlug, className }: { certSlug: string; className?: string }) {
  const { edital } = useEdital(certSlug);
  if (!edital || (!edital.url_externa && !edital.conteudo)) return null;

  return (
    <a
      href={edital.url_externa || "#"}
      target={edital.url_externa ? "_blank" : undefined}
      rel="noopener noreferrer"
      onClick={(e) => {
        if (!edital.url_externa && edital.conteudo) {
          e.preventDefault();
          // Sem URL externa mas com texto próprio — abre numa nova aba com o conteúdo
          const w = window.open("", "_blank");
          if (w) {
            w.document.write(`<pre style="font-family:sans-serif;white-space:pre-wrap;max-width:700px;margin:40px auto;line-height:1.6">${edital.titulo}\n\n${edital.conteudo}</pre>`);
          }
        }
      }}
      className={className}
    >
      <ExternalLink className="w-3 h-3" /> {edital.titulo || "Edital / Comunicado"}
    </a>
  );
}
