// Ferramentas de mixagem: ler a narração, compor seções de música e montar o mix final.
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { TAXA, Faixa, bumbo, palma, chimbal, baixo, pad, pluck, sino, filtro, reverb, eco, curvaDucking, salvarWav } from "./sintetizador.mjs";

const ffmpeg = fileURLToPath(new URL("../node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe", import.meta.url));

/** Lê um mp3/wav como faixa estéreo 44,1 kHz. */
export function lerAudio(caminho) {
  const wav = join(mkdtempSync(join(tmpdir(), "aud-")), "a.wav");
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", caminho, "-ac", "2", "-ar", String(TAXA), "-c:a", "pcm_s16le", wav]);
  const b = readFileSync(wav);
  let p = 12; while (b.toString("ascii", p, p + 4) !== "data") p += 8 + b.readUInt32LE(p + 4);
  const n = b.readUInt32LE(p + 4) / 4, d = p + 8, f = new Faixa(n / TAXA);
  for (let i = 0; i < n; i++) { f.L[i] = b.readInt16LE(d + i * 4) / 32768; f.R[i] = b.readInt16LE(d + i * 4 + 2) / 32768; }
  return f;
}

/** Coloca as peças da narração (cortadas nas pausas) nos tempos do vídeo, com micro-fades nas emendas. */
export function montarVoz(gravacao, pecas, duracao) {
  const v = new Faixa(duracao), fade = Math.round(0.012 * TAXA);
  let pico = 0; for (let i = 0; i < gravacao.L.length; i++) pico = Math.max(pico, Math.abs(gravacao.L[i]), Math.abs(gravacao.R[i]));
  const g = 0.85 / (pico || 1);
  for (const p of pecas) {
    const a = Math.round(p.de * TAXA), b = Math.min(gravacao.L.length, Math.round(p.ate * TAXA)), destino = Math.round((p.de + p.em) * TAXA);
    for (let k = a; k < b; k++) {
      const i = destino + (k - a); if (i < 0 || i >= v.L.length) continue;
      const env = Math.min(1, (k - a) / fade, (b - k) / fade);
      v.L[i] += gravacao.L[k] * g * env; v.R[i] += gravacao.R[k] * g * env;
    }
  }
  return v;
}

const rms = (f, filtroT = () => true) => { let s = 0, n = 0; for (let i = 0; i < f.L.length; i += 4) { if (!filtroT(i / TAXA)) continue; s += f.L[i] * f.L[i] + f.R[i] * f.R[i]; n += 2; } return Math.sqrt(s / Math.max(1, n)); };

/**
 * Uma seção de música: acordes por compasso, bateria, baixo, pad e arpejo.
 * s = { ini, fim, bpm, acordes:[{notas:[...], baixo}], bumbo:'quatro'|'meio'|'nada', palma, chimbal:'oito'|'dezesseis'|'nada',
 *       baixo:'oito'|'pulso'|'longo'|'nada', pad:{vol, brilho}, arpejo:{vol, brilho}|null, corte:(t)=>Hz | null, bateriaDesde: segundos }
 */
export function secao(s) {
  const dur = s.fim - s.ini, batida = 60 / s.bpm, compasso = batida * 4;
  const bat = new Faixa(dur + 2), mus = new Faixa(dur + 3), bumbos = [];
  const desde = s.bateriaDesde ?? 0;
  for (let c = 0; c * compasso < dur; c++) {
    const t0 = c * compasso, ac = s.acordes[c % s.acordes.length];
    // pad
    if (s.pad) mus.soma(pad(ac.notas, Math.min(compasso + 0.5, dur - t0 + 1.2), { brilho: s.pad.brilho ?? 1500, ataque: s.pad.ataque ?? 0.25 }), t0, s.pad.vol ?? 0.5);
    for (let b = 0; b < 4; b++) {
      const tb = t0 + b * batida; if (tb >= dur) break;
      const comBateria = tb >= desde;
      if (comBateria && (s.bumbo === "quatro" || (s.bumbo === "meio" && b % 2 === 0))) { bat.soma(bumbo(s.forcaBumbo ?? 1), tb, 0.9); bumbos.push(tb); }
      if (comBateria && s.palma && b % 2 === 1) bat.soma(palma(), tb, 0.42, 0.05);
      if (comBateria && s.chimbal === "oito") { bat.soma(chimbal(b === 3), tb + batida / 2, b === 3 ? 0.18 : 0.22, 0.25); }
      if (comBateria && s.chimbal === "dezesseis") for (let k = 0; k < 4; k++) bat.soma(chimbal(k === 2 && b === 3), tb + (k * batida) / 4, k === 2 ? 0.24 : 0.1, 0.25 - k * 0.05);
      // baixo
      if (s.baixo === "oito") for (let k = 0; k < 2; k++) mus.soma(baixo(ac.baixo + (k === 1 && b % 2 ? 12 : 0), batida / 2 * 0.92), tb + (k * batida) / 2, 0.55);
      if (s.baixo === "pulso") mus.soma(baixo(ac.baixo, batida * 0.9), tb, 0.55);
      if (s.baixo === "longo" && b === 0) mus.soma(baixo(ac.baixo, compasso * 0.95), tb, 0.5);
      // arpejo em semicolcheias com as notas do acorde, uma oitava acima
      if (s.arpejo) {
        const ns = [...ac.notas].sort((a, b) => a - b).map((n) => n + 12);
        const ordem = [0, 1, 2, 3, 2, 1, 3, 1];
        for (let k = 0; k < 4; k++) { const idx = ordem[(b * 4 + k) % ordem.length] % ns.length; mus.soma(pluck(ns[idx], 0.55, s.arpejo.brilho ?? 0.5), tb + (k * batida) / 4, s.arpejo.vol ?? 0.2, ((b * 4 + k) % 2 ? 0.35 : -0.35)); }
      }
    }
  }
  // "respiração" do pad e do baixo a cada bumbo (sidechain), filtro opcional e espaço
  if (bumbos.length) mus.volume((t) => { let g = 1; for (const k of bumbos) { if (t >= k && t < k + 0.35) g = Math.min(g, 1 - 0.5 * Math.exp(-(t - k) / 0.09)); } return g; });
  if (s.corte) { const L = filtro(mus.L, "passa-baixa", s.corte, 0.8), R = filtro(mus.R, "passa-baixa", s.corte, 0.8); mus.L.set(L); mus.R.set(R); }
  reverb(mus, { sala: 0.82, amortece: 0.35, mistura: 0.22 });
  if (s.arpejo) eco(mus, batida * 0.75, 0.3, 0.18);
  // dentro da seção: entrada e saída suaves
  const fadeIn = s.fadeIn ?? 0.05, fadeOut = s.fadeOut ?? 0.4;
  const saida = new Faixa(dur + 3);
  saida.somaEstereo(mus, 0); saida.somaEstereo(bat, 0);
  saida.volume((t) => Math.min(1, t / fadeIn) * (t > dur ? Math.max(0, 1 - (t - dur) / fadeOut) : 1));
  return saida;
}

/** Acorde final que fica soando. */
export function acordeFinal(notas, baixoN, seg = 4) {
  const f = new Faixa(seg + 1);
  f.soma(pad(notas, seg, { brilho: 2200, ataque: 0.02 }), 0, 0.6);
  f.soma(baixo(baixoN, seg * 0.8), 0, 0.5);
  notas.forEach((n, i) => f.soma(sino(n + 12, seg * 0.7, 0.3), i * 0.04, 0.5, i % 2 ? 0.3 : -0.3));
  f.soma(bumbo(1), 0, 0.9);
  f.soma(chimbal(true), 0, 0.25);
  reverb(f, { sala: 0.88, mistura: 0.3 });
  f.volume((t) => Math.max(0, 1 - t / seg));
  return f;
}

/**
 * Monta o mix final: voz + música (abaixada sob a voz) + efeitos.
 * A música é calibrada para ficar ~8 dB abaixo da voz e ~18 dB abaixo quando a voz fala.
 */
export function mixFinal({ duracao, voz, musica, efeitos, fala, saida, musicaDb = -6, ganhoEfeitos = 0.7 }) {
  const rv = rms(voz, (t) => fala.some(([a, b]) => t >= a && t <= b));
  const rm = rms(musica) || 1;
  const gm = (rv * Math.pow(10, musicaDb / 20)) / rm;
  const duck = curvaDucking(fala, { fundo: 0.33, ataque: 0.1, solta: 0.4 });
  const fim = (t) => (t > duracao - 0.05 ? Math.max(0, 1 - (t - (duracao - 0.05)) / 0.05) : 1);
  const m = new Faixa(duracao);
  for (let i = 0; i < m.L.length; i++) {
    const t = i / TAXA, g = gm * duck(t);
    m.L[i] = (voz.L[i] ?? 0) + (musica.L[i] ?? 0) * g + (efeitos.L[i] ?? 0) * ganhoEfeitos;
    m.R[i] = (voz.R[i] ?? 0) + (musica.R[i] ?? 0) * g + (efeitos.R[i] ?? 0) * ganhoEfeitos;
    m.L[i] *= fim(t); m.R[i] *= fim(t);
  }
  salvarWav(saida, m, -1);
  return { rmsVoz: rv, ganhoMusica: gm };
}
