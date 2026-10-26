// Prepara um episódio: corta a narração nas falas, monta a linha do tempo (com as pausas de suspense),
// cronometra a legenda palavra por palavra e compõe o áudio final (voz + clima + efeitos).
// Uso: node ferramentas/preparar.mjs episodios/ep01.json
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { lerAudio, montarVoz, mixFinal } from "./mixagem.mjs";
import { cortarNarracao } from "./narracao.mjs";
import { Faixa, SFX, pad, baixo, bumbo, filtro, reverb, oscilador, decai, ruido } from "./sintetizador.mjs";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const PUBLICO = join(RAIZ, "public");
const caminho = process.argv[2];
const ep = JSON.parse(readFileSync(caminho, "utf8"));

// ---------- 1. narração cortada nas falas ----------
const gravacao = lerAudio(join(PUBLICO, ep.narracao));
const pedacos = cortarNarracao(gravacao, ep.cenas.map((c) => c.fala));

// ---------- 2. linha do tempo ----------
let t = 0;
const cenas = ep.cenas.map((c, i) => {
  const antes = c.antes ?? 0.12, segura = c.segura ?? 0.3;
  const p = pedacos[i], dur = p.ate - p.de;
  const inicio = t, vozEm = t + antes, fim = vozEm + dur + segura;
  t = fim;
  return { ...c, indice: i, inicio, vozEm, vozDur: dur, fim, pedaco: p };
});
const duracao = t + 0.2;

// ---------- 3. legenda palavra por palavra ----------
const ESPECIAIS = { "3h33": 6, "3:33": 6, "12º": 4, "2": 2 };
const peso = (w) => {
  const limpa = w.replace(/\*/g, "");
  if (ESPECIAIS[limpa.replace(/[.,!?]/g, "")] !== undefined) return ESPECIAIS[limpa.replace(/[.,!?]/g, "")];
  const g = limpa.toLowerCase().match(/[aeiouáàâãéêíóôõúü]+/g);
  return Math.max(1, g ? g.length : 1) + (/[.!?]$/.test(limpa) ? 2.2 : /[,;:]$/.test(limpa) ? 1 : 0);
};
for (const c of cenas) {
  const palavras = c.legenda.split(/\s+/).filter(Boolean);
  const pesos = palavras.map(peso), total = pesos.reduce((a, b) => a + b, 0);
  let acum = 0;
  const tempos = palavras.map((w, k) => { const em = c.vozEm + (acum / total) * c.vozDur; acum += pesos[k]; return { w, em }; });
  // blocos de até 3 palavras, quebrando depois de pontuação
  const blocos = []; let atual = [];
  tempos.forEach((x, k) => {
    atual.push(x);
    const fimFrase = /[.!?,]$/.test(x.w.replace(/\*/g, ""));
    if (atual.length >= 3 || fimFrase || k === tempos.length - 1) { blocos.push(atual); atual = []; }
  });
  c.blocos = blocos.map((b, k) => ({ palavras: b, de: b[0].em, ate: k < blocos.length - 1 ? blocos[k + 1][0].em : c.vozEm + c.vozDur + Math.min(0.6, c.fim - (c.vozEm + c.vozDur)) }));
}

// ---------- 4. áudio ----------
const voz = montarVoz(gravacao, cenas.map((c) => ({ de: c.pedaco.de, ate: c.pedaco.ate, em: c.vozEm - c.pedaco.de })), duracao);
const fala = cenas.map((c) => [c.vozEm, c.vozEm + c.vozDur]);

// clima: drone grave em lá menor, chuva fina e um pulso de coração no fim
const musica = new Faixa(duracao + 2);
const acordes = [[45, 48, 52], [41, 45, 48], [43, 47, 50], [40, 44, 47]];
for (let k = 0; k * 6 < duracao + 1; k++) musica.soma(pad(acordes[k % acordes.length], 7.5, { brilho: 520, ataque: 2.2 }), k * 6, 0.55);
const sub = oscilador("seno", 55, duracao + 1); for (let i = 0; i < sub.length; i++) sub[i] *= 0.35 * (0.8 + 0.2 * Math.sin(i / 44100 * 0.7));
musica.soma(sub, 0, 0.5);
const chuva = SFX.chuva(duracao + 1); musica.soma(chuva, 0, 0.05, -0.2); musica.soma(SFX.chuva(duracao + 1), 0, 0.05, 0.2);
reverb(musica, { sala: 0.9, amortece: 0.4, mistura: 0.35 });

const efeitos = new Faixa(duracao + 2);
const em = (i, d = 0) => cenas[i].inicio + d;
const coracao = () => { const o = new Float32Array(Math.round(0.6 * 44100)); const a = decai(oscilador("seno", 0, 0.25, { fase: 0, freqFn: (x) => 48 + 40 * Math.exp(-x * 30) }), 0.09, 0.002); const b = decai(oscilador("seno", 0, 0.25, { fase: 0, freqFn: (x) => 45 + 35 * Math.exp(-x * 30) }), 0.08, 0.002); for (let i = 0; i < a.length; i++) o[i] += a[i]; const d = Math.round(0.22 * 44100); for (let i = 0; i < b.length && i + d < o.length; i++) o[i + d] += b[i] * 0.7; return o; };
for (const [quando, som, vol, pan] of [
  [0.0, SFX.vibrar(0.9), 0.9, 0],
  [em(0, 0.05), SFX.tique(), 0.5, 0.2], [em(0, 1.05), SFX.tique(), 0.45, 0.2], [em(0, 2.05), SFX.tique(), 0.4, 0.2],
  [em(0, 2.6), SFX.whoosh(0.7, true), 0.45, 0],
  ...[0, 0.12, 0.25, 0.4, 0.55, 0.7].map((d, k) => [em(0, 2.9 + d), SFX.vibrar(0.35), 0.18, k % 2 ? 0.6 : -0.6]),
  [em(2, 0.0), SFX.notificacao2(), 0.55, 0],
  [em(3, 0.0), SFX.impacto(), 1.0, 0], [em(3, 0.0), SFX.glitch(), 0.7, 0], [em(3, 0.9), SFX.glitch(), 0.5, 0],
  [em(4, 0.1), SFX.whoosh(0.9, false), 0.35, 0],
  [em(5, 0.05), SFX.vibrar(0.9), 1.0, 0],
  [em(6, 0.1), SFX.notificacao2(), 0.5, 0],
  [em(7, 0.0), SFX.carimbo(), 0.55, 0], [em(7, 0.0), SFX.glitch(), 0.4, 0],
  ...[0, 0.85, 1.7, 2.55, 3.4].map((d) => [em(7, 0.6 + d), coracao(), 0.65, 0]),
  ...[0, 0.75, 1.5].map((d) => [em(8, 0.2 + d), coracao(), 0.8, 0]),
  [cenas[8].vozEm + cenas[8].vozDur + 0.15, SFX.impacto(), 1.0, 0],
  [em(9, 0.0), SFX.glitch(), 0.6, 0], [em(9, 0.05), SFX.whoosh(0.6, true), 0.3, 0],
]) efeitos.soma(som, quando, vol, pan);

const pastaSaida = join(PUBLICO, "ep");
mkdirSync(pastaSaida, { recursive: true });
const wav = join(pastaSaida, `${ep.id}.wav`);
mixFinal({ duracao, voz, musica, efeitos, fala, saida: wav, musicaDb: -9, ganhoEfeitos: 0.75 });

// ---------- 5. linha do tempo para o vídeo ----------
const linha = { id: ep.id, serie: ep.serie, episodio: ep.episodio, titulo: ep.titulo, duracao, audio: `ep/${ep.id}.wav`,
  cenas: cenas.map(({ pedaco, ...c }) => c) };
writeFileSync(join(pastaSaida, `${ep.id}.json`), JSON.stringify(linha, null, 1));
console.log("duração", duracao.toFixed(2), "s");
cenas.forEach((c) => console.log(c.indice, c.inicio.toFixed(2), "→", c.fim.toFixed(2), c.visual));
