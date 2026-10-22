// O formato de um post (fila/<id>/post.json). A rotina "Social media" escreve este arquivo;
// o renderizador transforma em vídeo (reel) ou fotos (carrossel/imagem).

export type Mensagem = { de: "cliente" | "aurora"; texto: string };
export type Coluna = { titulo: string; itens: string[] };

/** O que toda cena pode ter além do conteúdo. */
export type Extras = {
  /** Fundo de foto ou vídeo ("biblioteca/arquivo.jpg|.mp4" ou URL), atrás do conteúdo. */
  fundo?: string;
  /** Que parte da foto mostrar quando ela é cortada: "cima" (rosto de pessoa), "centro" ou "baixo". Padrão: um pouco acima do centro. */
  foco?: "cima" | "centro" | "baixo";
  /** Até 3 objetos 3D da biblioteca (public/biblioteca/objetos/*.png) flutuando nas bordas da cena. */
  artefatos?: string[];
  /** O que a narração diz nesta cena (a gravação é uma só, cortada nas pausas). */
  fala?: string;
  /** Preenchido pelo renderizador: quanto dura a fala desta cena. */
  vozDur?: number;
};

export type Cena = Extras & (
  /** Frase grande. Escreva *assim* a palavra de destaque (serifa itálica com degradê). */
  | { tipo: "frase"; texto: string; etiqueta?: string; apoio?: string }
  /** Uma palavra por batida, bem grande (ex.: "Responde." "Explica." "Encaminha."). */
  | { tipo: "palavras"; palavras: string[]; titulo?: string }
  /** Texto que se escreve sozinho, letra por letra, com cursor. */
  | { tipo: "digitando"; texto: string; etiqueta?: string }
  /** Conversa de WhatsApp dentro de um celular em 3D. Sempre sai com "CONVERSA DE EXEMPLO". */
  | { tipo: "conversa"; nome?: string; mensagens: Mensagem[] }
  /** Número que rola dentro de um anel que se desenha. `de` = total do anel (ex.: 24 de 24 h). */
  | { tipo: "numero"; valor: number; de?: number; prefixo?: string; sufixo?: string; texto: string; etiqueta?: string }
  /** Lista de 2 a 5 itens. `riscar: true` = cada item aparece e é riscado (o que deixa de acontecer). */
  | { tipo: "lista"; titulo: string; itens: string[]; etiqueta?: string; riscar?: boolean }
  /** Antes e depois, lado a lado (ex.: "Sem atendimento" x "Com a Aurora"). */
  | { tipo: "comparar"; esquerda: Coluna; direita: Coluna; etiqueta?: string }
  /** Um objeto 3D da biblioteca entra voando e flutua no centro, com a frase embaixo. */
  | { tipo: "objeto"; objeto: string; texto: string; etiqueta?: string; apoio?: string }
  /** Notebook com um site; 1 a 3 painéis (frases curtas) saem voando da tela em 3D. */
  | { tipo: "site"; texto: string; paineis?: string[]; etiqueta?: string }
  /** Imagem (URL do Higgsfield ou arquivo em public/), com frase. */
  | { tipo: "imagem"; imagem: string; texto?: string; etiqueta?: string });

export type Post = {
  id: string;
  /** Data e hora com fuso, ex.: 2026-10-28T19:30:00-03:00 */
  publicar_em: string;
  formato: "reel" | "carrossel" | "imagem";
  /** "gelo" (claro) ou "noite" (escuro). Padrão: gelo. */
  tema?: "gelo" | "noite";
  legenda: string;
  cenas: Cena[];
  musica?: { clima?: "calmo" | "animado" };
  /** Narração: uma gravação só com as falas das cenas (e a final), separadas por pausas longas. */
  narracao?: { audio: string };
  /** O que a narração diz no cartão final. */
  falaFinal?: string;
  /** Preenchido pelo renderizador. */
  vozFinalDur?: number;
  /** Preenchido pelo renderizador: a trilha gerada para este reel. */
  audio?: string;
};
