// Corta a voz nas falas, monta a linha do tempo com as palavras e mixa voz + música leve + efeitos em public/mix.wav.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { lerAudio, montarVoz, mixFinal } from "../../arquivo-333/ferramentas/mixagem.mjs";
import { cortarNarracao } from "../../arquivo-333/ferramentas/narracao.mjs";
import { Faixa, SFX, pad, pluck, bumbo, chimbal, reverb, sino } from "../../arquivo-333/ferramentas/sintetizador.mjs";
const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const { falas } = JSON.parse(readFileSync(join(RAIZ, "roteiro.json"), "utf8"));
const grav = lerAudio(join(RAIZ, "public", "voz.mp3"));
const ped = cortarNarracao(grav, falas.map((f) => f.fala));
let t = 0;
const cenas = falas.map((f, i) => { const antes = i === 0 ? 0.05 : 0.08, dur = ped[i].ate - ped[i].de, segura = i === falas.length - 1 ? 1.0 : 0.22; const inicio = t, vozEm = t + antes, fim = vozEm + dur + segura; t = fim; return { ...f, i, inicio, vozEm, vozDur: dur, fim, p: ped[i] }; });
const duracao = t + 0.1;
const peso = (w) => { const l = w.replace(/[*.,!?]/g, ""); const g = l.toLowerCase().match(/[aeiouáàâãéêíóôõúü]+/g); return Math.max(1, g ? g.length : 1) + (/[.!?]\*?$/.test(w) ? 2 : /[,:]\*?$/.test(w) ? 1 : 0) + (/\d/.test(l) ? 2 : 0); };
for (const c of cenas) { const ps = c.legenda.split(/\s+/); const pe = ps.map(peso), tot = pe.reduce((a, b) => a + b, 0); let ac = 0; c.palavras = ps.map((w, k) => { const em = c.vozEm + (ac / tot) * c.vozDur; ac += pe[k]; return { w, em }; }); }
const voz = montarVoz(grav, cenas.map((c) => ({ de: c.p.de, ate: c.p.ate, em: c.vozEm - c.p.de })), duracao + 1);
// música curiosa e clara: 100 BPM em dó maior, pluck + pad + batida leve
const musica = new Faixa(duracao + 2), bpm = 100, b = 60 / bpm;
const acordes = [[60, 64, 67], [57, 60, 64], [65, 69, 72], [67, 71, 74]];
for (let c = 0; c * 4 * b < duracao + 1; c++) {
  const a = acordes[c % 4], ini = c * 4 * b;
  musica.soma(pad(a, 4 * b + 0.5, { brilho: 1500, ataque: 0.3 }), ini, 0.28);
  [0, 2, 3, 5, 6, 7].forEach((k, n) => musica.soma(pluck(a[n % 3] + 12, 0.8, 0.5), ini + k * b / 2, 0.42, n % 2 ? 0.25 : -0.25));
  for (let k = 0; k < 4; k++) { if (k % 2 === 0) musica.soma(bumbo(0.6), ini + k * b, 0.5); musica.soma(chimbal(), ini + (k + 0.5) * b, 0.18); }
}
reverb(musica, { sala: 0.5, amortece: 0.5, mistura: 0.18 });
const ef = new Faixa(duracao + 2);
cenas.forEach((c, i) => { if (i) ef.soma(SFX.whoosh(0.35, true), c.inicio - 0.1, 0.35); });
ef.soma(sino(84, 1.2), 0.02, 0.5); ef.soma(SFX.brilho(), cenas[1].vozEm + 1.6, 0.4); ef.soma(SFX.impacto(), cenas[3].inicio + 0.1, 0.5); ef.soma(SFX.pop(), cenas[4].vozEm + 0.3, 0.6); ef.soma(SFX.carimbo(), cenas[6].vozEm + 0.1, 0.6); ef.soma(SFX.sucesso(), cenas[7].vozEm + 0.2, 0.4);
mixFinal({ duracao, voz, musica, efeitos: ef, fala: cenas.map((c) => [c.vozEm, c.vozEm + c.vozDur]), saida: join(RAIZ, "public", "mix.wav"), musicaDb: -13, ganhoEfeitos: 0.8 });
writeFileSync(join(RAIZ, "public", "linha.json"), JSON.stringify({ duracao, cenas: cenas.map(({ p, ...c }) => c) }, null, 1));
console.log("duração", duracao.toFixed(2)); cenas.forEach((c) => console.log(c.i, c.inicio.toFixed(2), c.fim.toFixed(2), c.fala.slice(0, 30)));
