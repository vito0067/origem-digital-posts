// Narração: uma gravação só (a voz não muda de tom entre as frases), cortada nas pausas.
// A gravação traz as falas das cenas em ordem, separadas por pausas longas; aqui a gente acha
// essas pausas e devolve um pedaço por fala.
import { TAXA } from "./sintetizador.mjs";

/** Trechos com voz (em segundos), juntando os separados por pausas menores que `pausaMin`. */
export function trechosDeFala(faixa, { limiarDb = -38, pausaMin = 0.16 } = {}) {
  const janela = Math.round(TAXA / 100); // 10 ms
  let pico = 0;
  for (let i = 0; i < faixa.L.length; i++) pico = Math.max(pico, Math.abs(faixa.L[i]), Math.abs(faixa.R[i]));
  const g = 1 / (pico || 1);
  const fala = [];
  for (let i = 0; i + janela <= faixa.L.length; i += janela) {
    let s = 0;
    for (let j = i; j < i + janela; j++) { const v = (faixa.L[j] + faixa.R[j]) * 0.5 * g; s += v * v; }
    fala.push(10 * Math.log10(s / janela + 1e-12) > limiarDb);
  }
  const trechos = [];
  let ini = null, ultimo = null;
  fala.forEach((f, k) => {
    if (f) { if (ini === null) ini = k; ultimo = k; }
    else if (ini !== null && k - ultimo > pausaMin * 100) { trechos.push([ini, ultimo]); ini = null; }
  });
  if (ini !== null) trechos.push([ini, ultimo]);
  return trechos.filter(([a, b]) => b - a > 6).map(([a, b]) => ({ de: a / 100, ate: (b + 1) / 100 }));
}

/** "Peso" falado de um texto: sílabas (grupos de vogais) + respiros nas pontuações. */
export const pesoFala = (texto) => {
  const t = texto.toLowerCase();
  const silabas = (t.match(/[aeiouáàâãéêíóôõúü]+/g) ?? []).length;
  return silabas + 2.2 * (t.match(/[.?!]/g) ?? []).length + 1 * (t.match(/[,;:]/g) ?? []).length;
};

/**
 * Divide a gravação em um pedaço por fala. Estima onde cada fala termina pela proporção de sílabas
 * e corta na pausa real mais próxima dessa estimativa (as pausas longas pesam a favor).
 * Devolve [{de, ate}] em segundos.
 */
export function cortarNarracao(faixa, textos) {
  const n = textos.length;
  const t = trechosDeFala(faixa);
  if (t.length < n) throw new Error(`a narração tem ${t.length} trechos de fala, mas o post tem ${n} falas`);
  const pesos = textos.map(pesoFala), total = pesos.reduce((a, b) => a + b, 0);
  const ini = t[0].de, fim = t[t.length - 1].ate;
  const pausas = t.slice(1).map((x, k) => ({ k: k + 1, meio: (x.de + t[k].ate) / 2, tam: x.de - t[k].ate }));
  const escolhidas = [];
  let acum = 0, minimo = 0;
  for (let j = 0; j < n - 1; j++) {
    acum += pesos[j];
    const esperado = ini + (acum / total) * (fim - ini);
    const restantes = n - 2 - j; // cortes que ainda faltam depois deste
    const candidatas = pausas.filter((p) => p.k > minimo && p.k <= t.length - 1 - restantes);
    const melhor = candidatas.reduce((m, p) => { const custo = Math.abs(p.meio - esperado) - 0.8 * p.tam; return !m || custo < m.custo ? { ...p, custo } : m; }, null);
    escolhidas.push(melhor.k); minimo = melhor.k;
  }
  const cortes = [0, ...escolhidas, t.length];
  return cortes.slice(0, -1).map((c, k) => ({ de: Math.max(0, t[c].de - 0.04), ate: t[cortes[k + 1] - 1].ate + 0.08 }));
}
