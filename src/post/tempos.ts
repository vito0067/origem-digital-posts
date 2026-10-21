// O relógio dos posts: tudo anda na grade da música (120 BPM = uma batida a cada 0,5 s).
// Cada cena dura um número inteiro de segundos, então todo corte cai numa batida forte.
// Usado pelo vídeo (Reel.tsx) e pela trilha (ferramentas/trilha.mjs), por isso não importa nada
// em tempo de execução (o Node lê este arquivo direto).
import type { Cena, Mensagem } from "./tipos.ts";

export const BPM = 120;
export const BATIDA = 60 / BPM;
/** Duração do cartão final (logo, diagnóstico gratuito, WhatsApp). */
export const FINAL = 5;
/** A saída de cada cena (o "movimento de câmera" para a próxima). */
export const SAIDA = 0.3;

const palavras = (t = "") => t.replace(/\*/g, "").split(/\s+/).filter(Boolean).length;
const preso = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/** Arredonda para cima até o próximo segundo cheio (duas batidas). */
const cheio = (s: number) => Math.ceil(s - 1e-6);
/** Arredonda um instante para a meia batida mais próxima. */
export const naBatida = (s: number) => Math.round(s / (BATIDA / 2)) * (BATIDA / 2);

/** Quando cada mensagem de uma conversa aparece (segundos desde o início da cena), sempre na batida. */
export const tempoMensagens = (msgs: Mensagem[]) => {
  let t = 1.0;
  return msgs.map((m) => {
    const digita = m.de === "aurora" ? 1.0 : 0;
    const aparece = naBatida(t + digita);
    t = aparece + 1.0 + naBatida(Math.min(2.5, m.texto.length * 0.03));
    return { aparece, digitaDe: m.de === "aurora" ? aparece - digita : null };
  });
};

/** Quando cada palavra da cena "palavras" entra (uma a cada 2 batidas, começando na 2ª). */
export const tempoPalavras = (n: number) => Array.from({ length: n }, (_, k) => 0.5 + k * 1.0);
/** Quando cada item de lista/comparar entra. */
export const tempoItens = (n: number, inicio = 1.0) => Array.from({ length: n }, (_, k) => inicio + k * 1.0);
/** Quanto tempo leva para escrever um texto (cena "digitando"). */
export const tempoDigitar = (texto: string) => Math.min(4, 0.3 + texto.length * 0.045);

/** A fala de cada cena começa um pouco depois do corte. */
export const VOZ_ATRASO = 0.35;
/** A cena dura o necessário para o desenho E para a fala (com um respiro), sempre em segundos cheios. */
export const duracaoCena = (c: Cena): number => {
  const visual = duracaoVisual(c);
  return c.vozDur ? Math.max(visual, cheio(VOZ_ATRASO + c.vozDur + 0.45)) : visual;
};
const duracaoVisual = (c: Cena): number => {
  switch (c.tipo) {
    case "frase": return preso(cheio(1.4 + palavras(c.texto) * 0.28 + palavras(c.apoio) * 0.2), 3, 6);
    case "palavras": return preso(c.palavras.length + 1, 3, 7);
    case "digitando": return preso(cheio(0.8 + tempoDigitar(c.texto) + 1.4), 3, 7);
    case "numero": return 4;
    case "lista": return preso(cheio(1.0 + c.itens.length * 1.0 + (c.riscar ? 1.2 : 0.9)), 3, 8);
    case "comparar": return preso(cheio(1.0 + Math.max(c.esquerda.itens.length, c.direita.itens.length) * 2 + 0.5), 4, 10);
    case "imagem": return preso(cheio(2.8 + palavras(c.texto) * 0.25), 3, 6);
    case "conversa": {
      const ts = tempoMensagens(c.mensagens);
      const m = c.mensagens[c.mensagens.length - 1];
      return preso(cheio(ts[ts.length - 1].aparece + 1.3 + Math.min(2.2, m.texto.length * 0.028)), 4, 14);
    }
  }
};

/** Início e duração de cada cena, e a duração total (com o cartão final). */
export const linhaDoTempo = (cenas: Cena[], vozFinalDur?: number) => {
  let t = 0;
  const itens = cenas.map((c) => { const dur = duracaoCena(c); const r = { ini: t, dur }; t += dur; return r; });
  const final = vozFinalDur ? Math.max(FINAL, cheio(VOZ_ATRASO + vozFinalDur + 2.2)) : FINAL;
  return { itens, final: t, total: t + final };
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
  const t = n <= 24 ? 132 : n <= 44 ? 108 : n <= 70 ? 90 : n <= 110 ? 74 : 62;
  return Math.round(t * base);
};
/** Quantas letras cabem por linha num tamanho (Instrument Sans ~0,5 em por letra, largura útil 920 px). */
export const letrasPorLinha = (tamanho: number) => Math.max(8, Math.floor(920 / (tamanho * 0.52)));
