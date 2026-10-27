// Prepara um episódio no formato novo (cenas 3D em terceira pessoa, narrador masculino):
// corta a narração nas falas, monta a linha do tempo, cronometra a legenda e compõe o som
// (drone grave + chuva + efeitos marcados em cada cena no campo "sons").
// Uso: node ferramentas/preparar-caso.mjs episodios/ep01.json
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { lerAudio, montarVoz, mixFinal } from "./mixagem.mjs";
import { cortarNarracao } from "./narracao.mjs";
import { TAXA, Faixa, SFX, pad, oscilador, decai, ruido, filtro, reverb, sino } from "./sintetizador.mjs";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const PUBLICO = join(RAIZ, "public");
const ep = JSON.parse(readFileSync(process.argv[2], "utf8"));

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
const duracao = t + 0.15;

// ---------- 3. legenda palavra por palavra (blocos de até 3 palavras) ----------
const ESPECIAIS = { "3h33": 6, "3:33": 6, "12º": 4, "2": 2, "3": 1, "36": 4, "40": 3, "56": 5 };
const peso = (w) => {
  const limpa = w.replace(/\*/g, "").replace(/[.,!?]/g, "");
  if (ESPECIAIS[limpa] !== undefined) return ESPECIAIS[limpa];
  const g = limpa.toLowerCase().match(/[aeiouáàâãéêíóôõúü]+/g);
  return Math.max(1, g ? g.length : 1) + (/[.!?]\*?$/.test(w) ? 2.2 : /[,;:]\*?$/.test(w) ? 1 : 0);
};
for (const c of cenas) {
  const palavras = c.legenda.split(/\s+/).filter(Boolean);
  const pesos = palavras.map(peso), total = pesos.reduce((a, b) => a + b, 0);
  let acum = 0;
  const tempos = palavras.map((w, k) => { const em = c.vozEm + (acum / total) * c.vozDur; acum += pesos[k]; return { w, em }; });
  const blocos = []; let atual = [];
  tempos.forEach((x, k) => {
    atual.push(x);
    const fimFrase = /[.!?,]$/.test(x.w.replace(/\*/g, ""));
    if (atual.length >= 3 || fimFrase || k === tempos.length - 1) { blocos.push(atual); atual = []; }
  });
  c.blocos = blocos.map((b, k) => ({ palavras: b, de: b[0].em, ate: k < blocos.length - 1 ? blocos[k + 1][0].em : c.vozEm + c.vozDur + Math.min(0.5, c.fim - (c.vozEm + c.vozDur)) }));
}

// ---------- 4. som ----------
const N = (s) => Math.round(s * TAXA);
const mistura = (partes, seg) => { const o = new Float32Array(N(seg)); for (const [s, em, v = 1] of partes) { const d = N(em); for (let i = 0; i < s.length && i + d < o.length; i++) o[i + d] += s[i] * v; } return o; };
// efeitos próprios deste perfil (graves e secos, nada "fofinho")
const EF = {
  ...SFX,
  coracao: () => mistura([[decai(oscilador("seno", 0, 0.3, { fase: 0, freqFn: (x) => 50 + 38 * Math.exp(-x * 30) }), 0.09, 0.002), 0], [decai(oscilador("seno", 0, 0.3, { fase: 0, freqFn: (x) => 46 + 32 * Math.exp(-x * 30) }), 0.08, 0.002), 0.22, 0.7]], 0.6),
  trovao: () => { const r = filtro(ruido(3.2), "passa-baixa", (x) => 900 * Math.exp(-x * 1.4) + 90, 0.7); for (let i = 0; i < r.length; i++) { const x = i / TAXA; r[i] *= Math.min(1, x / 0.03) * Math.exp(-x * 1.1) * (0.7 + 0.3 * Math.sin(x * 23)); } return r; },
  obturador: () => { const c = () => decai(filtro(ruido(0.05), "banda", 3200, 1.4), 0.008, 0.0003); return mistura([[c(), 0], [c(), 0.09, 0.8]], 0.2); },
  subida: (seg = 2) => { const r = filtro(ruido(seg), "banda", (x) => 200 + 3500 * Math.pow(x / seg, 2), 1.2); const o = oscilador("seno", 0, seg, { freqFn: (x) => 60 * Math.pow(2, 2 * x / seg) }); for (let i = 0; i < r.length; i++) { const x = i / r.length; r[i] = (r[i] * 0.5 + o[i] * 0.4) * x * x; } return r; },
  grave: () => { const s = oscilador("seno", 0, 2.4, { fase: 0, freqFn: (x) => 34 + 40 * Math.exp(-x * 6) }); decai(s, 0.8, 0.002); for (let i = 0; i < s.length; i++) s[i] = Math.tanh(s[i] * 1.8); return s; },
  sino: () => sino(81, 2.5, 0.5),
  // trava magnética das portas fechando: estalo metálico + baque grave
  tranca: () => mistura([[SFX.carimbo(), 0, 0.9], [decai(filtro(ruido(0.12), "banda", 5200, 3), 0.02, 0.0005), 0.01, 0.8], [EF_grave(), 0.02, 0.7]], 1.2),
  // começo de áudio de WhatsApp
  audio: () => SFX.clique(),
};
function EF_grave() { const g = oscilador("seno", 0, 1, { fase: 0, freqFn: (x) => 48 + 60 * Math.exp(-x * 25) }); return decai(g, 0.25, 0.001); }
const quando = (c, ref) => {
  if (typeof ref === "number") return c.inicio + ref;
  const m = /^(voz|fimvoz|fim)([+-][\d.]+)?$/.exec(ref);
  const base = m[1] === "voz" ? c.vozEm : m[1] === "fimvoz" ? c.vozEm + c.vozDur : c.fim;
  return base + (m[2] ? parseFloat(m[2]) : 0);
};

const voz = montarVoz(gravacao, cenas.map((c) => ({ de: c.pedaco.de, ate: c.pedaco.ate, em: c.vozEm - c.pedaco.de })), duracao);
for (const c of cenas.filter((c) => c.vozTelefone)) {
  const a = Math.max(0, N(c.vozEm - 0.05)), b = Math.min(voz.L.length, N(c.vozEm + c.vozDur + 0.1));
  for (const canal of [voz.L, voz.R]) {
    const trecho = filtro(filtro(canal.slice(a, b), "passa-alta", 380, 0.8), "passa-baixa", 3100, 0.8);
    for (let i = 0; i < trecho.length; i++) canal[a + i] = Math.tanh(trecho[i] * 2.2) * 0.62;
  }
}
const fala = cenas.map((c) => [c.vozEm, c.vozEm + c.vozDur]);

// clima: sub em mi grave + cluster dissonante que respira + chuva dos dois lados
const clima = new Faixa(duracao + 2);
const sub = oscilador("seno", 41.2, duracao + 1);
for (let i = 0; i < sub.length; i++) sub[i] *= 0.4 * (0.75 + 0.25 * Math.sin(i / TAXA * 0.5));
clima.soma(sub, 0, 0.55);
const clusters = [[40, 41, 47], [40, 46, 47], [39, 40, 46]];
for (let k = 0; k * 7 < duracao + 1; k++) clima.soma(pad(clusters[k % clusters.length], 9, { brilho: 380, ataque: 3 }), k * 7, 0.5);
clima.soma(SFX.chuva(duracao + 1), 0, 0.06, -0.3); clima.soma(SFX.chuva(duracao + 1), 0, 0.06, 0.3);
reverb(clima, { sala: 0.92, amortece: 0.45, mistura: 0.4 });
// o clima some no cartão final e volta só com o sino
const ultima = cenas[cenas.length - 1];
clima.volume((x) => (x < ultima.inicio - 0.3 ? 1 : Math.max(0.15, 1 - (x - (ultima.inicio - 0.3)) / 0.4)));

const efeitos = new Faixa(duracao + 3);
for (const c of cenas) for (const [nome, ref = 0, vol = 0.8, pan = 0] of c.sons ?? []) {
  const som = EF[nome];
  if (!som) throw new Error(`efeito desconhecido: ${nome}`);
  efeitos.soma(som(), quando(c, ref), vol, pan);
}
// batimento que acelera nas duas cenas antes do final
const alvo = cenas.slice(-3, -1);
if (alvo.length === 2) {
  let x = alvo[0].inicio + 0.2, passo = 0.95;
  while (x < alvo[1].fim - 0.3) { efeitos.soma(EF.coracao(), x, 0.7); x += passo; passo = Math.max(0.55, passo * 0.94); }
}

const pastaSaida = join(PUBLICO, "ep");
mkdirSync(pastaSaida, { recursive: true });
mixFinal({ duracao, voz, musica: clima, efeitos, fala, saida: join(pastaSaida, `${ep.id}.wav`), musicaDb: -10, ganhoEfeitos: 0.8 });

// ---------- 5. linha do tempo para o vídeo ----------
const linha = { id: ep.id, serie: ep.serie, episodio: ep.episodio, titulo: ep.titulo, duracao, audio: `ep/${ep.id}.wav`, composicao: "Caso",
  cenas: cenas.map(({ pedaco, sons, ...c }) => c) };
writeFileSync(join(pastaSaida, `${ep.id}.json`), JSON.stringify(linha, null, 1));
console.log("duração", duracao.toFixed(2), "s");
cenas.forEach((c) => console.log(c.indice, c.inicio.toFixed(2), "→", c.fim.toFixed(2), (c.fim - c.inicio).toFixed(2) + "s", c.visual.tipo, c.visual.arquivo ?? ""));
