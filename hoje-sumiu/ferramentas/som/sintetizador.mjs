// Pequeno estúdio de som em código: instrumentos, efeitos e mixagem.
// Tudo é calculado amostra por amostra — não usa nenhum som gravado de terceiros.
import { writeFileSync } from "node:fs";

export const TAXA = 44100;

// ---------- utilidades ----------
let semente = 12345;
export const aleatorio = () => { semente = (semente * 1664525 + 1013904223) >>> 0; return semente / 4294967296 * 2 - 1; };
export const nota = (n) => 440 * Math.pow(2, (n - 69) / 12); // número MIDI -> Hz
const N = (seg) => Math.max(1, Math.round(seg * TAXA));

// Faixa estéreo
export class Faixa {
  constructor(seg) { this.L = new Float32Array(N(seg)); this.R = new Float32Array(N(seg)); this.seg = seg; }
  // soma um som mono (Float32Array) em `em` segundos, com volume e posição (-1 esquerda .. 1 direita)
  soma(som, em, vol = 1, pan = 0) {
    const i0 = Math.round(em * TAXA), gl = vol * Math.cos((pan + 1) * Math.PI / 4), gr = vol * Math.sin((pan + 1) * Math.PI / 4);
    for (let k = 0; k < som.length; k++) { const i = i0 + k; if (i < 0) continue; if (i >= this.L.length) break; this.L[i] += som[k] * gl; this.R[i] += som[k] * gr; }
  }
  somaEstereo(f, em, vol = 1) {
    const i0 = Math.round(em * TAXA);
    for (let k = 0; k < f.L.length; k++) { const i = i0 + k; if (i < 0) continue; if (i >= this.L.length) break; this.L[i] += f.L[k] * vol; this.R[i] += f.R[k] * vol; }
  }
  // multiplica por uma curva de volume (função do tempo em segundos)
  volume(fn) { for (let i = 0; i < this.L.length; i++) { const g = fn(i / TAXA); this.L[i] *= g; this.R[i] *= g; } return this; }
}

// ---------- osciladores ----------
const polyblep = (t, dt) => { if (t < dt) { t /= dt; return t + t - t * t - 1; } if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; } return 0; };
export function oscilador(tipo, freq, seg, { fase = Math.random(), freqFn = null } = {}) {
  const out = new Float32Array(N(seg)); let p = fase;
  for (let i = 0; i < out.length; i++) {
    const f = freqFn ? freqFn(i / TAXA) : freq, dt = f / TAXA;
    let v;
    if (tipo === "seno") v = Math.sin(2 * Math.PI * p);
    else if (tipo === "serra") v = 2 * p - 1 - polyblep(p, dt);
    else if (tipo === "quadrada") { v = p < 0.5 ? 1 : -1; v += polyblep(p, dt); v -= polyblep((p + 0.5) % 1, dt); }
    else if (tipo === "triangulo") v = 1 - 4 * Math.abs(p - 0.5);
    else v = aleatorio();
    out[i] = v; p += dt; if (p >= 1) p -= 1;
  }
  return out;
}
export const ruido = (seg) => { const o = new Float32Array(N(seg)); for (let i = 0; i < o.length; i++) o[i] = aleatorio(); return o; };

// ---------- envelopes ----------
export function adsr(som, a, d, s, r, segNota = null) {
  const total = som.length / TAXA, sus = segNota ?? total - r;
  for (let i = 0; i < som.length; i++) {
    const t = i / TAXA; let g;
    if (t < a) g = t / a; else if (t < a + d) g = 1 - (1 - s) * ((t - a) / d); else if (t < sus) g = s;
    else g = s * Math.max(0, 1 - (t - sus) / r);
    som[i] *= g;
  }
  return som;
}
export function decai(som, tau, ataque = 0.002) { for (let i = 0; i < som.length; i++) { const t = i / TAXA; som[i] *= (t < ataque ? t / ataque : 1) * Math.exp(-(t - ataque > 0 ? t - ataque : 0) / tau); } return som; }

// ---------- filtros (SVF "TPT": estável mesmo com o corte mudando) ----------
export function filtro(som, tipo, corte, q = 0.7) {
  let ic1 = 0, ic2 = 0; const out = new Float32Array(som.length);
  for (let i = 0; i < som.length; i++) {
    const fc = Math.min(TAXA * 0.45, Math.max(20, typeof corte === "function" ? corte(i / TAXA) : corte));
    const g = Math.tan(Math.PI * fc / TAXA), k = 1 / q, a1 = 1 / (1 + g * (g + k)), a2 = g * a1, a3 = g * a2;
    const v3 = som[i] - ic2, v1 = a1 * ic1 + a2 * v3, v2 = ic2 + a2 * ic1 + a3 * v3;
    ic1 = 2 * v1 - ic1; ic2 = 2 * v2 - ic2;
    out[i] = tipo === "passa-baixa" ? v2 : tipo === "passa-alta" ? som[i] - k * v1 - v2 : v1; // banda = v1
  }
  return out;
}

// ---------- efeitos ----------
// Reverb tipo "Freeverb" (estéreo)
export function reverb(f, { sala = 0.84, amortece = 0.3, mistura = 0.3 } = {}) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], aps = [556, 441, 341, 225];
  const proc = (entrada, desloc) => {
    const out = new Float32Array(entrada.length);
    for (const c of combs) {
      const buf = new Float32Array(c + desloc); let idx = 0, filt = 0;
      for (let i = 0; i < entrada.length; i++) {
        const y = buf[idx]; filt = y * (1 - amortece) + filt * amortece; buf[idx] = entrada[i] * 0.015 + filt * sala; out[i] += y; idx = (idx + 1) % buf.length;
      }
    }
    for (const a of aps) {
      const buf = new Float32Array(a + desloc); let idx = 0;
      for (let i = 0; i < out.length; i++) { const b = buf[idx]; const y = -out[i] + b; buf[idx] = out[i] + b * 0.5; out[i] = y; idx = (idx + 1) % buf.length; }
    }
    return out;
  };
  const wl = proc(f.L, 0), wr = proc(f.R, 23);
  for (let i = 0; i < f.L.length; i++) { f.L[i] = f.L[i] * (1 - mistura) + wl[i] * mistura * 3; f.R[i] = f.R[i] * (1 - mistura) + wr[i] * mistura * 3; }
  return f;
}
// Eco estéreo (pingue-pongue)
export function eco(f, tempo, realim = 0.35, mistura = 0.25) {
  const d = N(tempo), bl = new Float32Array(d), br = new Float32Array(d); let idx = 0;
  for (let i = 0; i < f.L.length; i++) {
    const yl = bl[idx], yr = br[idx];
    bl[idx] = f.R[i] + yr * realim; br[idx] = f.L[i] + yl * realim;
    f.L[i] += yl * mistura; f.R[i] += yr * mistura; idx = (idx + 1) % d;
  }
  return f;
}
const mono = (som) => { const f = new Faixa(som.length / TAXA); f.soma(som, 0); return f; };

// ---------- instrumentos ----------
export const bumbo = (forca = 1) => {
  const seg = 0.45; const s = oscilador("seno", 0, seg, { fase: 0, freqFn: (t) => 45 + 110 * Math.exp(-t * 32) });
  decai(s, 0.16, 0.001);
  const clique = filtro(decai(ruido(0.02), 0.004), "passa-alta", 2000);
  for (let i = 0; i < clique.length; i++) s[i] += clique[i] * 0.35;
  for (let i = 0; i < s.length; i++) s[i] = Math.tanh(s[i] * 1.6 * forca) * 0.9;
  return s;
};
export const palma = () => {
  const s = new Float32Array(N(0.35)), r = filtro(ruido(0.35), "banda", 1300, 1.2);
  for (let i = 0; i < s.length; i++) { const t = i / TAXA; let e = 0; for (const o of [0, 0.011, 0.022]) if (t >= o) e = Math.max(e, Math.exp(-(t - o) / (o === 0.022 ? 0.09 : 0.006))); s[i] = r[i] * e * 1.4; }
  return s;
};
export const chimbal = (aberto = false) => decai(filtro(ruido(aberto ? 0.35 : 0.08), "passa-alta", 7500), aberto ? 0.12 : 0.025, 0.001);
export function baixo(n, seg) {
  const f = nota(n), s = oscilador("serra", f, seg), sub = oscilador("seno", f, seg, { fase: 0 });
  const filt = filtro(s, "passa-baixa", (t) => 180 + 900 * Math.exp(-t * 9), 0.9);
  for (let i = 0; i < filt.length; i++) filt[i] = filt[i] * 0.45 + sub[i] * 0.7;
  return adsr(filt, 0.005, 0.12, 0.75, 0.06, seg - 0.06);
}
// Pad: várias serras levemente desafinadas, filtradas e com ataque lento
export function pad(notas, seg, { brilho = 1400, ataque = 0.6 } = {}) {
  const s = new Float32Array(N(seg));
  for (const n of notas) for (const det of [-0.12, -0.04, 0.05, 0.13]) {
    const o = oscilador("serra", nota(n) * Math.pow(2, det / 12), seg);
    for (let i = 0; i < s.length; i++) s[i] += o[i] / (notas.length * 4);
  }
  return adsr(filtro(s, "passa-baixa", (t) => brilho * (0.7 + 0.3 * Math.sin(t * 0.7)), 0.8), ataque, 0.4, 0.85, Math.min(1.2, seg * 0.4));
}
// Pluck tipo violão/harpa (Karplus-Strong)
export function pluck(n, seg = 1.2, brilho = 0.5) {
  const f = nota(n), p = Math.max(2, Math.round(TAXA / f)), buf = new Float32Array(p), out = new Float32Array(N(seg));
  for (let i = 0; i < p; i++) buf[i] = aleatorio();
  let idx = 0, ant = 0;
  for (let i = 0; i < out.length; i++) { const v = buf[idx]; const nv = (v * brilho + ant * (1 - brilho)) * 0.996; ant = v; buf[idx] = nv; out[i] = v; idx = (idx + 1) % p; }
  return decai(filtro(out, "passa-baixa", 5000), seg * 0.5, 0.001);
}
// Sino suave (FM)
export function sino(n, seg = 1.5, vol = 1) {
  const f = nota(n), out = new Float32Array(N(seg));
  for (let i = 0; i < out.length; i++) { const t = i / TAXA; out[i] = vol * Math.sin(2 * Math.PI * f * t + 1.8 * Math.exp(-t * 3) * Math.sin(2 * Math.PI * f * 3.5 * t)) * Math.exp(-t * 2.6) * Math.min(1, t / 0.003); }
  return out;
}

// ---------- efeitos sonoros ----------
export const SFX = {
  tique: () => decai(filtro(oscilador("quadrada", 3200, 0.04), "banda", 3000, 3), 0.006, 0.0005),
  toc: () => decai(oscilador("seno", 0, 0.08, { fase: 0, freqFn: (t) => 900 * Math.exp(-t * 40) + 300 }), 0.02, 0.0005),
  notificacao: () => { const s = sino(84, 0.6, 0.6), b = sino(91, 0.8, 0.55); const o = new Float32Array(N(0.95)); for (let i = 0; i < s.length; i++) o[i] += s[i]; const d = N(0.12); for (let i = 0; i < b.length && i + d < o.length; i++) o[i + d] += b[i]; return o; },
  notificacao2: () => { const o = new Float32Array(N(0.7)); [[88, 0], [93, 0.07]].forEach(([n, em]) => { const s = sino(n, 0.6, 0.45); const d = N(em); for (let i = 0; i < s.length && i + d < o.length; i++) o[i + d] += s[i]; }); return o; },
  pop: () => decai(oscilador("seno", 0, 0.15, { fase: 0, freqFn: (t) => 380 + 1100 * Math.exp(-t * 45) }), 0.035, 0.001),
  clique: () => { const s = decai(filtro(ruido(0.03), "banda", 4200, 2), 0.004, 0.0003); const t = decai(oscilador("seno", 1800, 0.03), 0.006, 0.0003); for (let i = 0; i < s.length; i++) s[i] = s[i] * 0.8 + t[i] * 0.4; return s; },
  tecla: () => decai(filtro(ruido(0.025), "banda", 2600 + aleatorio() * 800, 1.5), 0.005, 0.0003),
  whoosh: (seg = 0.8, sobe = true) => { const s = filtro(ruido(seg), "banda", (t) => { const x = t / seg; return sobe ? 300 + 5000 * x * x : 5300 - 5000 * x; }, 0.9); for (let i = 0; i < s.length; i++) { const x = i / s.length; s[i] *= Math.pow(Math.sin(Math.PI * x), 1.5) * 1.3; } return s; },
  subida: (seg = 1.6) => { const r = filtro(ruido(seg), "passa-alta", (t) => 200 + 6000 * Math.pow(t / seg, 2)); const o = oscilador("serra", 0, seg, { freqFn: (t) => 110 * Math.pow(2, 2.5 * t / seg) }); const f = filtro(o, "passa-baixa", 2500); for (let i = 0; i < r.length; i++) { const x = i / r.length; r[i] = (r[i] * 0.6 + f[i] * 0.25) * x * x; } return r; },
  impacto: () => { const s = oscilador("seno", 0, 1.6, { fase: 0, freqFn: (t) => 30 + 70 * Math.exp(-t * 8) }); decai(s, 0.45, 0.001); const r = filtro(decai(ruido(1.6), 0.12, 0.001), "passa-baixa", 1800); for (let i = 0; i < s.length; i++) s[i] = Math.tanh((s[i] * 1.2 + r[i] * 0.5) * 1.4); return s; },
  brilho: () => { const o = new Float32Array(N(2.2)); [84, 88, 91, 96, 100].forEach((n, k) => { const s = sino(n, 1.6, 0.22); const d = N(k * 0.055); for (let i = 0; i < s.length && i + d < o.length; i++) o[i + d] += s[i]; }); return o; },
  sucesso: () => { const o = new Float32Array(N(1.0)); [[79, 0], [84, 0.09], [88, 0.18]].forEach(([n, em]) => { const s = sino(n, 0.8, 0.4); const d = N(em); for (let i = 0; i < s.length && i + d < o.length; i++) o[i + d] += s[i]; }); return o; },
  carimbo: () => { const s = decai(oscilador("seno", 0, 0.4, { fase: 0, freqFn: (t) => 70 + 120 * Math.exp(-t * 30) }), 0.09, 0.001); const r = decai(filtro(ruido(0.4), "passa-baixa", 2200), 0.03, 0.0005); for (let i = 0; i < s.length; i++) s[i] = Math.tanh(s[i] * 1.5 + r[i] * 0.7); return s; },
  rebobinar: (seg = 1.1) => { const o = oscilador("serra", 0, seg, { freqFn: (t) => 220 * Math.pow(2, 3 * Math.sin(t * 18) * 0.08 + 1.5 * t / seg) }); const f = filtro(o, "passa-baixa", (t) => 600 + 4000 * t / seg); const w = SFX.whoosh(seg, true); for (let i = 0; i < f.length; i++) f[i] = f[i] * 0.25 * Math.sin(Math.PI * i / f.length) + (w[i] ?? 0) * 0.6; return f; },
  glitch: () => { const s = new Float32Array(N(0.25)); let v = 0; for (let i = 0; i < s.length; i++) { if (i % 180 === 0) v = aleatorio(); s[i] = v * (Math.floor(i / 900) % 2 ? 0.6 : 0.2); } return decai(filtro(s, "passa-alta", 400), 0.09, 0.001); },
  enviar: () => { const w = SFX.whoosh(0.35, true), p = SFX.pop(); const o = new Float32Array(N(0.5)); for (let i = 0; i < w.length; i++) o[i] += w[i] * 0.7; const d = N(0.28); for (let i = 0; i < p.length && i + d < o.length; i++) o[i + d] += p[i]; return o; },
  vibrar: (seg = 0.5) => { const s = oscilador("quadrada", 0, seg, { freqFn: () => 150 }); const f = filtro(s, "passa-baixa", 400); for (let i = 0; i < f.length; i++) { const t = i / TAXA; f[i] *= (Math.floor(t / 0.12) % 2 === 0 ? 1 : 0.15) * 0.5; } return f; },
  chuva: (seg) => { const r = filtro(filtro(ruido(seg), "passa-alta", 900), "passa-baixa", 6000); for (let i = 0; i < r.length; i++) if (aleatorio() > 0.9993) r[i] += aleatorio() * 3; return r; },
};

// ---------- mixagem final ----------
// Curva de "abaixar a música quando a voz fala" (ducking), com subida/descida suaves.
export function curvaDucking(trechosVoz, { fundo = 0.32, ataque = 0.12, solta = 0.35 } = {}) {
  return (t) => {
    let g = 1;
    for (const [a, b] of trechosVoz) {
      let x = 1;
      if (t >= a - ataque && t < a) x = 1 - (1 - fundo) * ((t - (a - ataque)) / ataque);
      else if (t >= a && t <= b) x = fundo;
      else if (t > b && t < b + solta) x = fundo + (1 - fundo) * ((t - b) / solta);
      g = Math.min(g, x);
    }
    return g;
  };
}
export function salvarWav(caminho, f, picoDb = -1.5) {
  // limitador suave e normalização
  let pico = 0; for (let i = 0; i < f.L.length; i++) { f.L[i] = Math.tanh(f.L[i] * 0.9); f.R[i] = Math.tanh(f.R[i] * 0.9); pico = Math.max(pico, Math.abs(f.L[i]), Math.abs(f.R[i])); }
  const alvo = Math.pow(10, picoDb / 20), g = pico > 0 ? alvo / pico : 1;
  const b = Buffer.alloc(44 + f.L.length * 4);
  b.write("RIFF", 0); b.writeUInt32LE(36 + f.L.length * 4, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(TAXA, 24); b.writeUInt32LE(TAXA * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(f.L.length * 4, 40);
  for (let i = 0; i < f.L.length; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, f.L[i] * g)) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, f.R[i] * g)) * 32767), 46 + i * 4); }
  writeFileSync(caminho, b);
}
export { mono };
