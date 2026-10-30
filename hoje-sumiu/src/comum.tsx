import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
export type Palavra = { w: string; em: number };
export type Cena = { i: number; fala: string; legenda: string; inicio: number; vozEm: number; vozDur: number; fim: number; palavras: Palavra[] };
export type Linha = { duracao: number; cenas: Cena[] };
export const lim = (x: number) => Math.max(0, Math.min(1, x));
export const suave = (x: number) => { const t = lim(x); return t * t * (3 - 2 * t); };
export const sai = (x: number) => 1 - Math.pow(1 - lim(x), 3);
export const volta = (x: number) => { const t = lim(x), c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export const cenaEm = (l: Linha, t: number) => l.cenas.find((c) => t >= c.inicio && t < c.fim) ?? l.cenas[l.cenas.length - 1];
/** Blocos de até `n` palavras da cena; devolve o bloco em que o tempo está. */
export function blocoEm(c: Cena | undefined, t: number, n = 3) {
  if (!c) return null;
  const bl: Palavra[][] = []; let a: Palavra[] = [];
  c.palavras.forEach((p, k) => { a.push(p); if (a.length >= n || /[.!?,:]\*?$/.test(p.w) || k === c.palavras.length - 1) { bl.push(a); a = []; } });
  let achou = bl[0], idx = 0;
  bl.forEach((b, k) => { if (t >= b[0].em) { achou = b; idx = k; } });
  return { palavras: achou, idx, desde: achou[0].em };
}
export const limpa = (w: string) => w.replace(/\*/g, "");
export const forte = (w: string) => w.includes("*");
/** Imagem sem o vermelho (feita no navegador, uma vez por arquivo). */
const CACHE: Record<string, string> = {};
export function useSemVermelho(arq: string) {
  const [u, setU] = useState<string | null>(CACHE[arq] ?? null);
  const [h] = useState(() => (CACHE[arq] ? null : delayRender("sem vermelho " + arq)));
  useEffect(() => {
    if (CACHE[arq]) return;
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => {
      const cv = document.createElement("canvas"); cv.width = 864; cv.height = 1536; const g = cv.getContext("2d")!; g.drawImage(img, 0, 0, 864, 1536);
      const d = g.getImageData(0, 0, 864, 1536), p = d.data;
      for (let i = 0; i < p.length; i += 4) { const r = p[i], gg = p[i + 1], b = p[i + 2], m = Math.max(gg, b), q = lim((r - m * 1.25) / 45); if (q > 0 && r > 70) { const y = 0.3 * r + 0.59 * gg + 0.11 * b; p[i] = r + (y - r) * q; p[i + 1] = gg + (y - gg) * q; p[i + 2] = b + (y - b) * q; } }
      g.putImageData(d, 0, 0); CACHE[arq] = cv.toDataURL("image/jpeg", 0.92); setU(CACHE[arq]); if (h !== null) continueRender(h);
    };
    img.onerror = () => { if (h !== null) continueRender(h); };
    img.src = staticFile(arq);
  }, [arq]);
  return CACHE[arq] ?? u;
}
/** Comentários de exemplo que aparecem no fim (demonstração). */
export const COMENTARIOS = ["a segunda-feira", "o boleto", "o wi-fi"];
export const LISTA = ["o número 7", "os domingos", "o cheiro de chuva", "as chaves", "o verbo “esperar”", "os pombos", "a letra Q", "o barulho do mar", "as segundas intenções", "o Natal", "o dia 31", "a cor vermelha"];
