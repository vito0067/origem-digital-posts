// Quanto tempo cada cena fica na tela. Usado pelo vídeo (Reel.tsx) e pela trilha (ferramentas/trilha.mjs),
// por isso este arquivo não importa nada em tempo de execução (o Node lê ele direto).
import type { Cena, Mensagem } from "./tipos.ts";

const palavras = (t = "") => t.replace(/\*/g, "").split(/\s+/).filter(Boolean).length;
const preso = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Duração do cartão final (logo, diagnóstico gratuito, WhatsApp). */
export const FINAL = 4.2;
/** Folga para a cena sair (desfoque) antes da próxima entrar. */
export const SAIDA = 0.35;

/** Quando cada mensagem de uma conversa aparece (segundos desde o início da cena). */
export const tempoMensagens = (msgs: Mensagem[]) => {
  let t = 0.7;
  return msgs.map((m) => {
    const digita = m.de === "aurora" ? 0.9 : 0;
    const aparece = t + digita;
    t = aparece + 0.9 + Math.min(2.6, m.texto.length * 0.034);
    return { aparece, digitaDe: m.de === "aurora" ? aparece - digita : null };
  });
};

export const duracaoCena = (c: Cena): number => {
  switch (c.tipo) {
    case "frase": return preso(1.7 + palavras(c.texto) * 0.3 + palavras(c.apoio) * 0.2, 2.8, 6);
    case "numero": return preso(3 + palavras(c.texto) * 0.2, 3.4, 5.5);
    case "lista": return preso(1.6 + c.itens.length * 1.15 + palavras(c.titulo) * 0.15, 3.5, 8);
    case "imagem": return preso(2.8 + palavras(c.texto) * 0.25, 3.2, 6);
    case "conversa": {
      const ts = tempoMensagens(c.mensagens);
      const m = c.mensagens[c.mensagens.length - 1];
      return preso(ts[ts.length - 1].aparece + 1.4 + Math.min(2.2, m.texto.length * 0.03), 4, 13);
    }
  }
};

/** Início e duração de cada cena, e a duração total (com o cartão final). */
export const linhaDoTempo = (cenas: Cena[]) => {
  let t = 0;
  const itens = cenas.map((c) => { const dur = duracaoCena(c); const r = { ini: t, dur }; t += dur; return r; });
  return { itens, final: t, total: t + FINAL };
};

/** Divide um texto em linhas de até `max` letras (sem contar os asteriscos), respeitando "\n". */
export const quebrar = (texto: string, max: number) =>
  texto.split("\n").map((linha) => {
    const out: string[] = [];
    let atual = "";
    for (const p of linha.split(/\s+/).filter(Boolean)) {
      const tam = (s: string) => s.replace(/\*/g, "").length;
      if (atual && tam(atual) + 1 + tam(p) > max) { out.push(atual); atual = p; } else atual = atual ? `${atual} ${p}` : p;
    }
    if (atual) out.push(atual);
    return out.join("\n");
  }).join("\n");

/** Tamanho da letra pelo comprimento do texto (para caber em ~940 px de largura). */
export const tamanhoFrase = (texto: string, base = 1) => {
  const n = texto.replace(/\*/g, "").length;
  const t = n <= 28 ? 118 : n <= 50 ? 98 : n <= 80 ? 82 : n <= 120 ? 70 : 60;
  return Math.round(t * base);
};
/** Quantas letras cabem por linha num tamanho (Instrument Sans ~0,5 em por letra, largura útil 920 px). */
export const letrasPorLinha = (tamanho: number) => Math.max(8, Math.floor(920 / (tamanho * 0.52)));
