// Prepara um episódio do Hoje Sumiu: acelera a voz, corta nas falas, cronometra as palavras, marca os momentos
// da história e mixa voz + música composta em código + efeitos de papel em public/<id>.wav.
// Uso: node ferramentas/preparar-dia.mjs episodios/dia01.json
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { lerAudio, montarVoz, mixFinal } from "../../arquivo-333/ferramentas/mixagem.mjs";
import { cortarNarracao, trechosDeFala } from "../../arquivo-333/ferramentas/narracao.mjs";
import { compor } from "./trilhas.mjs";
import { TAXA, Faixa, SFX, pad, pluck, bumbo, chimbal, reverb, sino, filtro, ruido, decai, oscilador, nota } from "../../arquivo-333/ferramentas/sintetizador.mjs";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const ep = JSON.parse(readFileSync(join(RAIZ, process.argv[2]), "utf8"));
const falas = ep.falas;
const VELOCIDADE = ep.velocidade ?? 1.05; // o Dia 1 acelerou a voz em 5%; do Dia 2 em diante a fala é natural, sem aceleração
const bruta = lerAudio(join(RAIZ, "public", `${ep.id}.mp3`));
const acelera = (s) => { const n = Math.floor(s.length / VELOCIDADE), o = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i * VELOCIDADE, a = Math.floor(x), f = x - a; o[i] = s[a] * (1 - f) + (s[a + 1] ?? 0) * f; } return o; };
const grav = { L: acelera(bruta.L), R: acelera(bruta.R) };
// `cortes` no episódio: corte conferido à mão, em segundos da gravação, quando as pausas automáticas erram a fala
const ped = ep.cortes ? ep.cortes.map(([de, ate]) => ({ de, ate })) : cortarNarracao(grav, falas.map((f) => f.fala));

// ---------- linha do tempo ----------
let t = 0;
const cenas = falas.map((f, i) => {
  const antes = i === 0 ? 0.04 : 0.1, dur = ped[i].ate - ped[i].de, segura = f.segura ?? (i === falas.length - 1 ? 1.6 : 0.12);
  const inicio = t, vozEm = t + antes, fim = vozEm + dur + segura; t = fim;
  return { ...f, i, inicio, vozEm, vozDur: dur, fim, p: ped[i] };
});
const duracao = t + 0.1;
const peso = (w) => { const l = w.replace(/[*~.,!?:]/g, ""); const g = l.toLowerCase().match(/[aeiouáàâãéêíóôõúü]+/g); return Math.max(1, g ? g.length : 1) + (/[.!?]\W*$/.test(w) ? 2 : /[,:]\W*$/.test(w) ? 1 : 0) + (/\d/.test(l) ? 2 : 0); };
// Sincronia da legenda (regra do Vito, 05/11/2026: a legenda tem que acompanhar a voz): as palavras são
// distribuídas só pelo tempo em que há voz de verdade, pulando as pausas. Se o número de trechos de voz
// da fala bate com o número de frases (separadas por . , : ! ?), cada frase entra exatamente no seu trecho.
const fimFrase = (w) => /[.,:!?]\W*$/.test(w.replace(/[*~]/g, ""));
const silabas = (w) => { const g = w.replace(/[*~.,!?:]/g, "").toLowerCase().match(/[aeiouáàâãéêíóôõúü]+/g); return Math.max(1, g ? g.length : 1) + (/\d/.test(w) ? 2 : 0); };
const trechosDaFala = (c) => {
  const nf = c.legenda.split(/\s+/).filter(fimFrase).length;
  let ult = null;
  for (const pm of [0.12, 0.16, 0.2, 0.25, 0.3, 0.1]) {
    const s = trechosDeFala(grav, { pausaMin: pm }).map((x) => ({ de: Math.max(x.de, c.p.de), ate: Math.min(x.ate, c.p.ate) })).filter((x) => x.ate - x.de > 0.05);
    ult = s; if (s.length === nf) return { seg: s, casa: true };
  }
  return { seg: ult, casa: false };
};
for (const c of cenas) {
  const ps = c.legenda.split(/\s+/), { seg, casa } = trechosDaFala(c);
  const real = (x) => c.vozEm + (x - c.p.de) - 0.03; // tempo da gravação -> tempo do vídeo
  c.palavras = [];
  if (casa) {
    let k = 0;
    for (const x of seg) {
      let fim = k; while (fim < ps.length - 1 && !fimFrase(ps[fim])) fim++;
      const grupo = ps.slice(k, fim + 1), tot = grupo.reduce((a, w) => a + silabas(w), 0); let ac = 0;
      for (const w of grupo) { c.palavras.push({ w, em: real(x.de + (ac / tot) * (x.ate - x.de)) }); ac += silabas(w); }
      k = fim + 1;
    }
  } else {
    const voz = seg.reduce((a, x) => a + (x.ate - x.de), 0), tot = ps.reduce((a, w) => a + silabas(w), 0); let ac = 0;
    const noTempo = (f) => { let r = f * voz; for (const x of seg) { const d = x.ate - x.de; if (r <= d) return x.de + r; r -= d; } return seg.at(-1).ate; };
    c.palavras = ps.map((w) => { const em = real(noTempo(ac / tot)); ac += silabas(w); return { w, em }; });
  }
  console.log(c.i, casa ? "frases=trechos" : "proporcional", seg.length, "trechos");
}
/** Momento em que uma palavra é dita na fala i (n = qual ocorrência). */
const tp = (i, palavra, n = 0) => { const ach = cenas[i].palavras.filter((p) => p.w.replace(/[*~.,!?:]/g, "").toLowerCase() === palavra.toLowerCase()); if (!ach[n]) throw new Error(`palavra não achada: ${i} ${palavra}`); return ach[n].em; };

// ---------- momentos da história (o vídeo e o som usam os mesmos) ----------
// dia com `cena` no arquivo de dados usa o roteiro padrão; os Dias 1 e 2 têm o seu próprio
const roteiroDia = await import(ep.cena ? "./dias/padrao.mjs" : `./dias/dia${String(ep.dia).padStart(2, "0")}.mjs`);
const marcas = { dia: ep.dia, ...roteiroDia.marcas({ cenas, tp, ep }) };
// "@3:porta+0.2" = palavra "porta" da fala 3, mais 0,2 s. Também: @3:inicio, @3:voz, @3:fim e @onda (marca da série).
const quando = (txt) => {
  const r = txt.slice(1).match(/^(?:(\d+):)?([\p{L}\w]+)([+-][\d.]+)?$/u); if (!r) throw new Error("tempo inválido: " + txt);
  const extra = Number(r[3] ?? 0); if (!r[1]) { if (marcas[r[2]] === undefined) throw new Error("marca não existe: " + txt); return marcas[r[2]] + extra; }
  const i = Number(r[1]), c = cenas[i]; if (!c) throw new Error("fala não existe: " + txt);
  return ({ inicio: c.inicio, voz: c.vozEm, fim: c.fim }[r[2]] ?? tp(i, r[2])) + extra;
};
const resolve = (x) => (typeof x === "string" && x[0] === "@" ? quando(x) : Array.isArray(x) ? x.map(resolve) : x && typeof x === "object" ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, k === "conta" ? v : resolve(v)])) : x);
if (ep.cena) ep.cena = resolve(ep.cena);

// ---------- voz ----------
const voz = montarVoz(grav, cenas.map((c) => ({ de: c.p.de, ate: c.p.ate, em: c.vozEm - c.p.de })), duracao + 1);

// ---------- música: pizzicato curioso em 108 BPM, com partes que acompanham a história ----------
const m = new Faixa(duracao + 3), bpm = 108, b = 60 / bpm, cp = 4 * b;
const ACORDES = [[60, 64, 67], [65, 69, 72], [57, 60, 64], [67, 71, 74]], BAIXOS = [36, 41, 45, 43];
const TRISTE = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 55, 59]], BAIXOS_T = [45, 41, 38, 40];
const MELODIA = [[0, 12], [1, 16], [1.5, 19], [2.5, 16], [3, 12], [4, 14], [5, 17], [5.5, 21], [6.5, 17], [7, 14]];
const pizz = (n, seg = 0.45) => decai(filtro(pluck(n, seg, 0.75), "passa-alta", 140), seg * 0.4, 0.001);
if (ep.cena?.trilha) compor(m, { ...ep.cena.trilha, duracao, marcas });
else for (let c = 0; c * cp < duracao + 1; c++) {
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
// motor v2 (`cena.motor: "v2"`): a trilha silencia sozinha antes de cada impacto de `cena.impactos` e volta depois
if (ep.cena?.motor === "v2" && ep.cena.impactos?.length) { const { volumeTrilha } = await import("./motor/index.mjs"); const v = volumeTrilha(ep.cena.impactos, 1); m.volume(v); }
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
roteiroDia.efeitos({ fx, marcas, cenas, rnd, SFX, sino, virada, dobra, buzina, apito, nhac, lapis, ep });

mixFinal({ duracao, voz, musica: m, efeitos: fx, fala: cenas.map((c) => [c.vozEm, c.vozEm + c.vozDur]), saida: join(RAIZ, "public", `${ep.id}.wav`), musicaDb: -12, ganhoEfeitos: 0.75 });
// `cena.lufs` (ex.: -14): normaliza a mixagem final para esse volume (padrão das redes), com limite de pico em -1,5 dB
if (ep.cena?.lufs) {
  const FF = join(RAIZ, "..", "node_modules", "@remotion", "compositor-win32-x64-msvc", "ffmpeg.exe"), wav = join(RAIZ, "public", `${ep.id}.wav`), tmp = join(RAIZ, "public", `${ep.id}.norm.wav`);
  execFileSync(FF, ["-y", "-loglevel", "error", "-i", wav, "-af", `loudnorm=I=${ep.cena.lufs}:TP=-1.5:LRA=11`, "-ar", "44100", "-c:a", "pcm_s16le", tmp]);
  renameSync(tmp, wav);
}
writeFileSync(join(RAIZ, "public", `${ep.id}.json`), JSON.stringify({ id: ep.id, dia: ep.dia, coisa: ep.coisa, duracao, marcas, cena: ep.cena, cenas: cenas.map(({ p, ...c }) => c) }, null, 1));
console.log("duração", duracao.toFixed(2));
const sil = (x) => (x.toLowerCase().match(/[aeiouáàâãéêíóôõúü]+/g) ?? []).length;
cenas.forEach((c) => console.log(c.i, c.inicio.toFixed(2), "→", c.fim.toFixed(2), (sil(c.fala) / c.vozDur).toFixed(1) + " síl/s", c.fala.slice(0, 34)));
