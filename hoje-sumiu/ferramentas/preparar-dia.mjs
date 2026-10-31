// Prepara um episódio do Hoje Sumiu: acelera a voz, corta nas falas, cronometra as palavras, marca os momentos
// da história e mixa voz + música composta em código + efeitos de papel em public/<id>.wav.
// Uso: node ferramentas/preparar-dia.mjs episodios/dia01.json
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { lerAudio, montarVoz, mixFinal } from "../../arquivo-333/ferramentas/mixagem.mjs";
import { cortarNarracao } from "../../arquivo-333/ferramentas/narracao.mjs";
import { TAXA, Faixa, SFX, pad, pluck, bumbo, chimbal, reverb, sino, filtro, ruido, decai, oscilador, nota } from "../../arquivo-333/ferramentas/sintetizador.mjs";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const ep = JSON.parse(readFileSync(join(RAIZ, process.argv[2]), "utf8"));
const falas = ep.falas;
const VELOCIDADE = 1.05; // voz um pouco mais rápida e menos grave: mais viva, sem efeito de robô
const bruta = lerAudio(join(RAIZ, "public", `${ep.id}.mp3`));
const acelera = (s) => { const n = Math.floor(s.length / VELOCIDADE), o = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i * VELOCIDADE, a = Math.floor(x), f = x - a; o[i] = s[a] * (1 - f) + (s[a + 1] ?? 0) * f; } return o; };
const grav = { L: acelera(bruta.L), R: acelera(bruta.R) };
const ped = cortarNarracao(grav, falas.map((f) => f.fala));

// ---------- linha do tempo ----------
let t = 0;
const cenas = falas.map((f, i) => {
  const antes = i === 0 ? 0.04 : 0.1, dur = ped[i].ate - ped[i].de, segura = f.segura ?? (i === falas.length - 1 ? 1.6 : 0.12);
  const inicio = t, vozEm = t + antes, fim = vozEm + dur + segura; t = fim;
  return { ...f, i, inicio, vozEm, vozDur: dur, fim, p: ped[i] };
});
const duracao = t + 0.1;
const peso = (w) => { const l = w.replace(/[*~.,!?:]/g, ""); const g = l.toLowerCase().match(/[aeiouáàâãéêíóôõúü]+/g); return Math.max(1, g ? g.length : 1) + (/[.!?]\W*$/.test(w) ? 2 : /[,:]\W*$/.test(w) ? 1 : 0) + (/\d/.test(l) ? 2 : 0); };
for (const c of cenas) {
  const ps = c.legenda.split(/\s+/), pe = ps.map(peso), tot = pe.reduce((a, b) => a + b, 0); let ac = 0;
  c.palavras = ps.map((w, k) => { const em = c.vozEm + (ac / tot) * c.vozDur; ac += pe[k]; return { w, em }; });
}
/** Momento em que uma palavra é dita na fala i (n = qual ocorrência). */
const tp = (i, palavra, n = 0) => { const ach = cenas[i].palavras.filter((p) => p.w.replace(/[*~.,!?:]/g, "").toLowerCase() === palavra.toLowerCase()); if (!ach[n]) throw new Error(`palavra não achada: ${i} ${palavra}`); return ach[n].em; };

// ---------- momentos da história (o vídeo e o som usam os mesmos) ----------
const marcas = {
  onda: tp(0, "vermelha") + 0.55,          // o vermelho começa a virar do avesso
  entao: tp(3, "Então"),
  sobrou: tp(3, "Sobrou"),
  placaSobe: tp(4, "placa", 0) - 0.5,      // a placa de pare sobe vermelha...
  placaVira: tp(4, "Agora"),               // ...e vira cinza
  trava: cenas[5].vozEm,                   // o trânsito para
  caminhao: cenas[6].vozEm,
  mercado: cenas[7].inicio - 0.35,
  moranguinhos: tp(7, "morango") + 0.2,
  maduro: tp(7, "maduro"),
  mordida: tp(7, "mordida"),
  azedo: tp(7, "mordida") + 0.42,
  campo: cenas[8].inicio - 0.35,
  apito: tp(8, "juiz"),
  cartao: tp(8, "cartão"),
  cartaoVira: tp(8, "Só", 0),
  papel: tp(8, "papel"),
  ombros: tp(8, "olha"),
  silencio: cenas[9].vozEm,
  reclama: tp(9, "reclama"),
  nilo: cenas[10].inicio - 0.3,
  anotou: tp(10, "anotou"),
  amanha: cenas[11].vozEm,
  interrogacao: tp(11, "sumir"),
  comenta: cenas[12].vozEm,
  curtido: tp(12, "curtido"),
  fim: cenas[12].fim,
};

// ---------- voz ----------
const voz = montarVoz(grav, cenas.map((c) => ({ de: c.p.de, ate: c.p.ate, em: c.vozEm - c.p.de })), duracao + 1);

// ---------- música: pizzicato curioso em 108 BPM, com partes que acompanham a história ----------
const m = new Faixa(duracao + 3), bpm = 108, b = 60 / bpm, cp = 4 * b;
const ACORDES = [[60, 64, 67], [65, 69, 72], [57, 60, 64], [67, 71, 74]], BAIXOS = [36, 41, 45, 43];
const TRISTE = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 55, 59]], BAIXOS_T = [45, 41, 38, 40];
const MELODIA = [[0, 12], [1, 16], [1.5, 19], [2.5, 16], [3, 12], [4, 14], [5, 17], [5.5, 21], [6.5, 17], [7, 14]];
const pizz = (n, seg = 0.45) => decai(filtro(pluck(n, seg, 0.75), "passa-alta", 140), seg * 0.4, 0.001);
for (let c = 0; c * cp < duracao + 1; c++) {
  const ini = c * cp, triste = ini >= marcas.silencio - 0.1 && ini < marcas.amanha - 0.1, final = ini >= marcas.amanha - 0.1;
  const a = (triste ? TRISTE : ACORDES)[c % 4], bx = (triste ? BAIXOS_T : BAIXOS)[c % 4];
  if (triste) { // quase nada: o clima fica estranho
    m.soma(pad(a, cp + 0.4, { brilho: 900, ataque: 0.5 }), ini, 0.3);
    [0, 3].forEach((k) => m.soma(sino(a[k % 3] + 24, 1.4, 0.5), ini + k * b, 0.35, k ? 0.3 : -0.3));
    continue;
  }
  m.soma(pizz(bx + 12, 0.6), ini, 0.85); m.soma(pizz(bx + 12, 0.5), ini + 2 * b, 0.7);
  [1, 1.5, 3, 3.5].forEach((k, n) => m.soma(pizz(a[n % 3] + 12, 0.35), ini + k * b, 0.5, n % 2 ? 0.35 : -0.35));
  m.soma(pad(a, cp + 0.3, { brilho: 1300, ataque: 0.25 }), ini, 0.12);
  if (c % 2 === 0) for (const [k, s] of MELODIA) if (k < 8 && (c >= 2 || final)) m.soma(sino(ACORDES[0][0] + s + 12, 0.8, 0.5), ini + k * b, final ? 0.42 : 0.3, 0.15);
  for (let k = 0; k < 4; k++) { if (k % 2 === 0) m.soma(bumbo(0.55), ini + k * b, 0.5); m.soma(chimbal(), ini + (k + 0.5) * b, 0.16); if (final && k % 2 === 1) m.soma(chimbal(true), ini + k * b, 0.1); }
}
reverb(m, { sala: 0.5, amortece: 0.5, mistura: 0.16 });
// a música acaba junto com o vídeo, num acorde
m.volume((x) => (x > duracao - 0.5 ? Math.max(0, (duracao + 0.1 - x) / 0.6) : 1));

// ---------- efeitos de papel ----------
const fx = new Faixa(duracao + 3);
let semente = 11; const rnd = () => { semente = (semente * 1664525 + 1013904223) % 4294967296; return semente / 4294967296; };
const virada = () => decai(filtro(ruido(0.11), "banda", (x) => 1800 + 5200 * (x / 0.11), 1.2), 0.035, 0.002);
const dobra = () => { const r = decai(filtro(ruido(0.16), "banda", (x) => 900 + 3000 * (1 - x / 0.16), 0.9), 0.05, 0.004), o = new Float32Array(r.length); const s = SFX.pop(); for (let i = 0; i < r.length; i++) o[i] = r[i] + (s[i] ?? 0) * 0.45; return o; };
const buzina = (f = 420, seg = 0.28) => { const o = oscilador("quadrada", f, seg), o2 = oscilador("quadrada", f * 1.26, seg); for (let i = 0; i < o.length; i++) o[i] = (o[i] + o2[i]) * 0.5; return decai(filtro(o, "passa-baixa", 1800), seg * 0.8, 0.005); };
const apito = () => { const seg = 0.75, o = oscilador("seno", 0, seg, { freqFn: (x) => 2850 + 170 * Math.sign(Math.sin(x * 2 * Math.PI * 30)) }); for (let i = 0; i < o.length; i++) { const x = i / TAXA; o[i] *= Math.min(1, x / 0.02) * Math.min(1, (seg - x) / 0.05) * 0.5; } return o; };
const nhac = () => decai(filtro(ruido(0.22), "banda", 2400, 0.8), 0.07, 0.002);
const lapis = (seg) => { const r = filtro(ruido(seg), "banda", 3800, 1.1); for (let i = 0; i < r.length; i++) { const x = i / TAXA; r[i] *= 0.35 + 0.65 * Math.abs(Math.sin(x * 21)); } return r; };
// a virada de todos os vermelhos: dezenas de folhas em onda
for (let k = 0; k < 46; k++) fx.soma(virada(), marcas.onda + Math.pow(k / 46, 0.8) * 2.6 + rnd() * 0.05, 0.3 + rnd() * 0.25, rnd() * 1.4 - 0.7);
fx.soma(SFX.impacto(), marcas.onda - 0.02, 0.35); fx.soma(SFX.glitch(), marcas.onda - 0.04, 0.12);
// abertura: o livro se levanta
for (let k = 0; k < 12; k++) fx.soma(dobra(), 0.02 + k * 0.1 + rnd() * 0.03, 0.22 + rnd() * 0.2, rnd() - 0.5);
fx.soma(sino(84, 1.1), 0.02, 0.35);
// voos da câmera entre os lugares
cenas.forEach((c, i) => { if (i >= 2 && i !== 3 && i !== 10) fx.soma(SFX.whoosh(0.7, true), c.inicio - 0.55, 0.26, i % 2 ? 0.25 : -0.25); });
fx.soma(SFX.whoosh(1.6, true), cenas[1].inicio - 0.1, 0.25);
// semáforo: a luz apaga
fx.soma(SFX.clique(), cenas[3].vozEm + 0.75, 0.9); fx.soma(virada(), cenas[3].vozEm + 0.8, 0.5);
// placa
fx.soma(dobra(), marcas.placaSobe + 0.25, 0.75); fx.soma(virada(), marcas.placaVira, 0.8); fx.soma(SFX.carimbo(), marcas.placaVira + 0.08, 0.3);
// trânsito travado
fx.soma(SFX.carimbo(), marcas.trava + 0.05, 0.4);
[0.15, 0.55, 0.95, 1.3, 1.8, 2.15, 2.7].forEach((d, k) => fx.soma(buzina(360 + (k % 3) * 70, 0.22 + (k % 2) * 0.1), marcas.trava + d, 0.24 + (k % 3) * 0.05, k % 2 ? 0.5 : -0.5));
[0.2, 1.1, 1.8].forEach((d) => fx.soma(buzina(330, 0.45), marcas.caminhao + d, 0.14, 0.2));
// mercado
for (let k = 0; k < 5; k++) fx.soma(dobra(), marcas.mercado + 0.1 + k * 0.1, 0.4, 0.2);
for (let k = 0; k < 8; k++) fx.soma(virada(), marcas.moranguinhos + k * 0.07, 0.35, 0.2);
fx.soma(nhac(), marcas.mordida + 0.05, 0.85); fx.soma(SFX.pop(), marcas.azedo + 0.05, 0.5);
// futebol
for (let k = 0; k < 6; k++) fx.soma(dobra(), marcas.campo + 0.1 + k * 0.09, 0.4, -0.2);
fx.soma(apito(), marcas.apito - 0.1, 0.42); fx.soma(virada(), marcas.cartaoVira, 0.75);
// Seu Nilo
for (let k = 0; k < 4; k++) fx.soma(dobra(), marcas.nilo + 0.08 + k * 0.1, 0.35);
fx.soma(lapis(1.5), marcas.anotou + 0.1, 0.4);
// final
fx.soma(SFX.subida(1.2), marcas.interrogacao - 0.8, 0.22); fx.soma(dobra(), marcas.interrogacao + 0.1, 0.9); fx.soma(SFX.carimbo(), marcas.comenta + 0.05, 0.4);
[0.6, 1.05, 1.5].forEach((d) => fx.soma(SFX.pop(), marcas.comenta + d, 0.55));
fx.soma(SFX.sucesso(), marcas.fim - 1.5, 0.3);

mixFinal({ duracao, voz, musica: m, efeitos: fx, fala: cenas.map((c) => [c.vozEm, c.vozEm + c.vozDur]), saida: join(RAIZ, "public", `${ep.id}.wav`), musicaDb: -12, ganhoEfeitos: 0.75 });
writeFileSync(join(RAIZ, "public", `${ep.id}.json`), JSON.stringify({ id: ep.id, dia: ep.dia, coisa: ep.coisa, duracao, marcas, cenas: cenas.map(({ p, ...c }) => c) }, null, 1));
console.log("duração", duracao.toFixed(2));
const sil = (x) => (x.toLowerCase().match(/[aeiouáàâãéêíóôõúü]+/g) ?? []).length;
cenas.forEach((c) => console.log(c.i, c.inicio.toFixed(2), "→", c.fim.toFixed(2), (sil(c.fala) / c.vozDur).toFixed(1) + " síl/s", c.fala.slice(0, 34)));
