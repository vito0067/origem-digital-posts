// Ajudantes de tempo: tudo nos vídeos é marcado em SEGUNDOS e convertido para quadros aqui.
import { Easing, interpolate, spring } from "remotion";

export const FPS = 30;
export const q = (seg: number) => Math.round(seg * FPS);
export const suave = Easing.bezier(0.22, 1, 0.36, 1);
export const entraSai = Easing.bezier(0.65, 0, 0.35, 1);

/** Vai de `de` a `para` entre os segundos a e b (preso nas pontas). */
export const entre = (f: number, a: number, b: number, de = 0, para = 1, easing = suave) =>
  interpolate(f, [q(a), q(b)], [de, para], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** Mola que começa no segundo `seg`. */
export const mola = (f: number, seg: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  spring({ frame: f - q(seg), fps: FPS, config: { damping: 15, stiffness: 120, mass: 0.8, ...cfg } });

/** Gerador de números "aleatórios" que sempre dá a mesma sequência (o vídeo sai igual toda vez). */
export const sorteio = (semente: number) => () => {
  semente = (semente * 1664525 + 1013904223) % 4294967296;
  return semente / 4294967296;
};

// ---------- narração ----------
export type Peca = { de: number; ate: number; em: number };
/** Converte um instante da gravação original para o instante no vídeo (a gravação é cortada nas pausas). */
export const paraVideo = (pecas: Peca[], t: number) => {
  const p = pecas.find((x) => t >= x.de - 0.001 && t <= x.ate + 0.001) ?? pecas[pecas.length - 1];
  return t + p.em;
};

/** Sílabas aproximadas de uma palavra em português (grupos de vogais) — usadas para cronometrar a legenda. */
const ESPECIAIS: Record<string, number> = { "23h47.": 10, "24": 5, "10": 1, "15": 2, "R$": 2 };
export const silabas = (palavra: string) => {
  if (ESPECIAIS[palavra] !== undefined) return ESPECIAIS[palavra];
  const limpa = palavra.toLowerCase().replace(/[^a-záàâãéêíóôõúüç]/g, "");
  const grupos = limpa.match(/[aeiouáàâãéêíóôõúü]+/g);
  return Math.max(1, grupos ? grupos.length : 1);
};
