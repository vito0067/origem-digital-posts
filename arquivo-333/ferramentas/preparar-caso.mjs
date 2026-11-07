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
// "narracaoCorteEm" (segundos): apaga o que vem depois, para a gravação principal não trazer uma fala que foi regravada à parte
if (ep.narracaoCorteEm) { const n0 = Math.round(ep.narracaoCorteEm * TAXA); for (let i = n0; i < gravacao.L.length; i++) { gravacao.L[i] = 0; gravacao.R[i] = 0; } }
// cena "avulsa" (divulgação do guia no meio do episódio): a voz vem de um arquivo à parte, não da narração principal
const avulsas = new Map();
ep.cenas.forEach((c, i) => {
  if (!c.avulsa) return;
  const g = lerAudio(join(PUBLICO, c.avulsa.arquivo));
  const textos = c.avulsa.textos ?? [c.fala];
  avulsas.set(i, { g, ...cortarNarracao(g, textos)[c.avulsa.indice ?? 0] });
});
const principais = ep.cenas.map((c, i) => i).filter((i) => !avulsas.has(i) || ep.cenas[i].falaNaGravacao);
const cortes = cortarNarracao(gravacao, principais.map((i) => ep.cenas[i].falaNaGravacao ?? ep.cenas[i].fala));
const pedacos = ep.cenas.map((c, i) => avulsas.get(i) ?? cortes[principais.indexOf(i)]);

// a pergunta do final, gravada à parte (cena com "vozAntes": o narrador fala a pergunta antes da fala da cena)
const perguntas = new Map();
ep.cenas.forEach((c, i) => {
  if (!c.vozAntes) return;
  const g = lerAudio(join(PUBLICO, c.vozAntes.arquivo));
  const textos = c.vozAntes.textos ?? [c.vozAntes.texto];
  perguntas.set(i, { g, ...cortarNarracao(g, textos)[c.vozAntes.indice ?? 0] });
});

// ---------- 2. linha do tempo ----------
let t = 0;
const cenas = ep.cenas.map((c, i) => {
  const antes = c.antes ?? 0.12, segura = c.segura ?? 0.3;
  const p = pedacos[i], dur = p.ate - p.de;
  const q = perguntas.get(i), dq = q ? q.ate - q.de + (c.vozAntes.pausa ?? 0.3) : 0;
  const inicio = t, vozEm = t + antes + dq, fim = vozEm + dur + segura;
  t = fim;
  return { ...c, indice: i, inicio, vozEm, vozDur: dur, fim, pedaco: p, perguntaEm: q ? inicio + antes : undefined };
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
    if (atual.length >= (ep.legendaModo === "painel" ? 2 : 3) || fimFrase || k === tempos.length - 1) { blocos.push(atual); atual = []; }
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
  // freio do metrô: chiado agudo que desce + ronco que morre
  freio: () => { const seg = 1.8, q = filtro(ruido(seg), "banda", (x) => 3400 - 1600 * (x / seg), 6); const o = oscilador("seno", 0, seg, { freqFn: (x) => 2100 - 700 * (x / seg) }); for (let i = 0; i < q.length; i++) { const x = i / q.length; q[i] = (q[i] * 0.7 + o[i] * 0.12) * Math.sin(Math.PI * Math.min(1, x * 1.3)) ; } return q; },
  // a plataforma inteira dá um passo: vários pés batendo quase juntos + arrasto
  passo: () => { const partes = []; for (let k = 0; k < 9; k++) partes.push([decai(oscilador("seno", 0, 0.5, { fase: 0, freqFn: (x) => 55 + 70 * Math.exp(-x * 30) }), 0.12, 0.001), 0.012 * k + (k % 3) * 0.01, 0.55], [decai(filtro(ruido(0.2), "banda", 900 + k * 90, 1.2), 0.05, 0.001), 0.012 * k, 0.4]);
    partes.push([decai(filtro(ruido(0.6), "passa-baixa", 1400), 0.25, 0.002), 0.03, 0.5]); return mistura(partes, 1.2); },
  // porta pneumática: sopro de ar + trilho
  portaMetro: () => { const ar = filtro(ruido(1.0), "passa-alta", 2500, 0.7); for (let i = 0; i < ar.length; i++) { const x = i / ar.length; ar[i] *= Math.min(1, x * 12) * Math.exp(-x * 3); } return mistura([[ar, 0, 0.8], [decai(filtro(ruido(0.5), "banda", 600, 1), 0.2, 0.001), 0.15, 0.6], [SFX.carimbo(), 0.62, 0.5]], 1.3); },
  // respiração curta e trêmula (inspira, solta)
  respira: () => { const seg = 1.6, r = filtro(ruido(seg), "banda", 1300, 0.9); for (let i = 0; i < r.length; i++) { const x = i / TAXA; const ins = x < 0.7 ? Math.sin(Math.PI * x / 0.7) : 0, sai = x > 0.8 ? Math.sin(Math.PI * Math.min(1, (x - 0.8) / 0.8)) * 0.8 : 0; r[i] *= (ins + sai) * (0.85 + 0.15 * Math.sin(x * 40)); } return r; },
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

const voz = montarVoz(gravacao, cenas.filter((c) => !c.avulsa).map((c) => ({ de: c.pedaco.de, ate: c.pedaco.ate, em: c.vozEm - c.pedaco.de })), duracao);
for (const [i, a] of avulsas) {
  const c = cenas[i], v2 = montarVoz(a.g, [{ de: a.de, ate: a.ate, em: c.vozEm - a.de }], duracao);
  for (let k = 0; k < voz.L.length; k++) { voz.L[k] += v2.L[k]; voz.R[k] += v2.R[k]; }
}
for (const [i, q] of perguntas) {
  const c = cenas[i], v2 = montarVoz(q.g, [{ de: q.de, ate: q.ate, em: c.perguntaEm - q.de }], duracao);
  for (let k = 0; k < voz.L.length; k++) { voz.L[k] += v2.L[k]; voz.R[k] += v2.R[k]; }
}
for (const c of cenas.filter((c) => c.vozTelefone)) {
  const a = Math.max(0, N(c.vozEm - 0.05)), b = Math.min(voz.L.length, N(c.vozEm + c.vozDur + 0.1));
  for (const canal of [voz.L, voz.R]) {
    const trecho = filtro(filtro(canal.slice(a, b), "passa-alta", 380, 0.8), "passa-baixa", 3100, 0.8);
    for (let i = 0; i < trecho.length; i++) canal[a + i] = Math.tanh(trecho[i] * 2.2) * 0.62;
  }
}
const fala = cenas.map((c) => [c.vozEm, c.vozEm + c.vozDur]);
for (const [i, q] of perguntas) fala.push([cenas[i].perguntaEm, cenas[i].perguntaEm + q.ate - q.de]);

// clima: sub em mi grave + cluster dissonante que respira + chuva dos dois lados
const clima = new Faixa(duracao + 2);
const sub = oscilador("seno", 41.2, duracao + 1);
for (let i = 0; i < sub.length; i++) sub[i] *= 0.4 * (0.75 + 0.25 * Math.sin(i / TAXA * 0.5));
clima.soma(sub, 0, 0.55);
const clusters = [[40, 41, 47], [40, 46, 47], [39, 40, 46]];
for (let k = 0; k * 7 < duracao + 1; k++) clima.soma(pad(clusters[k % clusters.length], 9, { brilho: 380, ataque: 3 }), k * 7, 0.5);
if (ep.ambiente === "metro") {
  // vagão em movimento: ronco grave que oscila e, quando o trem para (cena "paradaNaCena"), o ronco cai e entra o chiado do ar
  const parada = ep.paradaNaCena !== undefined ? cenas[ep.paradaNaCena].inicio : 1e9;
  const ronco = filtro(ruido(duracao + 1), "passa-baixa", 180, 0.7), N2 = ronco.length;
  for (let i = 0; i < N2; i++) { const x = i / TAXA; ronco[i] *= (0.88 + 0.12 * Math.sin(x * 2.1)) * (x < parada ? 1 : Math.max(0.15, 1 - (x - parada) / 0.9)); }
  clima.soma(ronco, 0, 0.34);
  clima.soma(filtro(ruido(duracao + 1), "banda", 420, 0.9).map((v, i) => v * (i / TAXA < parada ? 0.5 : 0.08)), 0, 0.05, 0.2);
  if (parada < duracao) clima.soma(decai(filtro(ruido(2.4), "passa-alta", 3200, 0.7), 0.7, 0.05), parada - 0.1, 0.22);
} else {
  clima.soma(SFX.chuva(duracao + 1), 0, 0.06, -0.3); clima.soma(SFX.chuva(duracao + 1), 0, 0.06, 0.3);
}
reverb(clima, { sala: 0.92, amortece: 0.45, mistura: 0.4 });
// o clima some no cartão final e volta só com o sino
const ultima = cenas[cenas.length - 1];
clima.volume((x) => (x < ultima.inicio - 0.3 ? 1 : Math.max(0.15, 1 - (x - (ultima.inicio - 0.3)) / 0.4)));
// "silencio" na cena: o clima quase some (o susto seguinte vem do nada)
const silencios = cenas.filter((c) => c.silencio).map((c) => [c.inicio, c.fim]);
if (silencios.length) clima.volume((x) => { let v = 1; for (const [a, b] of silencios) { const d = Math.min(x - a, b - x); if (d > 0) v = Math.min(v, Math.max(0.12, 1 - d / 0.35)); } return v; });

const efeitos = new Faixa(duracao + 3);
for (const c of cenas) for (const [nome, ref = 0, vol = 0.8, pan = 0] of c.sons ?? []) {
  const som = EF[nome];
  if (!som) throw new Error(`efeito desconhecido: ${nome}`);
  efeitos.soma(som(), quando(c, ref), vol, pan);
}
if (ep.ambiente === "metro") {
  // batida dupla das rodas nos trilhos, só enquanto o trem anda
  const paradaT = ep.paradaNaCena !== undefined ? cenas[ep.paradaNaCena].inicio : 1e9;
  const tac = () => decai(filtro(ruido(0.07), "banda", 2400, 1.3), 0.013, 0.0004);
  for (let x = 0.2; x < Math.min(duracao, paradaT); x += 0.56) { efeitos.soma(tac(), x, 0.2); efeitos.soma(tac(), x + 0.11, 0.14); efeitos.soma(decai(oscilador("seno", 62, 0.2, { fase: 0 }), 0.08, 0.002), x, 0.12); }
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
const linha = { id: ep.id, serie: ep.serie, episodio: ep.episodio, titulo: ep.titulo, legendaModo: ep.legendaModo, etiqueta: ep.etiqueta, duracao, audio: `ep/${ep.id}.wav`, composicao: "Caso",
  cenas: cenas.map(({ pedaco, sons, ...c }) => c) };
writeFileSync(join(pastaSaida, `${ep.id}.json`), JSON.stringify(linha, null, 1));
console.log("duração", duracao.toFixed(2), "s");
cenas.forEach((c) => console.log(c.indice, c.inicio.toFixed(2), "→", c.fim.toFixed(2), (c.fim - c.inicio).toFixed(2) + "s", c.visual.tipo, c.visual.arquivo ?? ""));
