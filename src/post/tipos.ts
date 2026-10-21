// O formato de um post (fila/<id>/post.json). A rotina "Social media" escreve este arquivo;
// o renderizador transforma em vídeo (reel) ou fotos (carrossel/imagem).

export type Mensagem = { de: "cliente" | "aurora"; texto: string };

export type Cena =
  /** Frase grande. Escreva *assim* a palavra de destaque (serifa itálica). */
  | { tipo: "frase"; texto: string; etiqueta?: string; apoio?: string }
  /** Conversa de WhatsApp. Sempre sai com a etiqueta "CONVERSA DE EXEMPLO". */
  | { tipo: "conversa"; nome?: string; mensagens: Mensagem[] }
  /** Número que rola até o valor, com uma frase embaixo. */
  | { tipo: "numero"; valor: number; prefixo?: string; sufixo?: string; texto: string; etiqueta?: string }
  /** Lista de 2 a 5 itens. */
  | { tipo: "lista"; titulo: string; itens: string[]; etiqueta?: string }
  /** Imagem (URL do Higgsfield ou arquivo em public/), com frase. */
  | { tipo: "imagem"; imagem: string; texto?: string; etiqueta?: string };

export type Post = {
  id: string;
  /** Data e hora com fuso, ex.: 2026-10-28T19:30:00-03:00 */
  publicar_em: string;
  formato: "reel" | "carrossel" | "imagem";
  legenda: string;
  cenas: Cena[];
  musica?: { clima?: "calmo" | "animado" };
  /** Preenchido pelo renderizador: a trilha gerada para este reel. */
  audio?: string;
};
