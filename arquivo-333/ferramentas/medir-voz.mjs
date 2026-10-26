// Mede as vozes de teste: tom médio (quanto mais baixo, mais grave), variação de tom (voz viva x monótona),
// duração e quanto do tempo é pausa. Uso: node ferramentas/medir-voz.mjs testes/vozes/*.mp3
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { join, basename } from "node:path";
import { tmpdir } from "node:os";
import { ffmpeg } from "./mixagem.mjs";

const TX = 16000;
function ler(caminho) {
  const wav = join(mkdtempSync(join(tmpdir(), "voz-")), "a.wav");
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", caminho, "-ac", "1", "-ar", String(TX), "-c:a", "pcm_s16le", wav]);
  const b = readFileSync(wav);
  let p = 12; while (b.toString("ascii", p, p + 4) !== "data") p += 8 + b.readUInt32LE(p + 4);
  const n = b.readUInt32LE(p + 4) / 2, d = p + 8, x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = b.readInt16LE(d + i * 2) / 32768;
  return x;
}

function medir(x) {
  const jan = Math.round(0.04 * TX), passo = Math.round(0.01 * TX);
  const minL = Math.round(TX / 300), maxL = Math.round(TX / 60);
  let pico = 0; for (const v of x) pico = Math.max(pico, Math.abs(v));
  const tons = []; let falando = 0, total = 0;
  for (let i = 0; i + jan + maxL < x.length; i += passo) {
    let e = 0; for (let j = 0; j < jan; j++) e += x[i + j] * x[i + j];
    const db = 10 * Math.log10(e / jan / (pico * pico) + 1e-12);
    total++;
    if (db < -32) continue;
    falando++;
    let melhor = 0, lag = 0;
    for (let L = minL; L <= maxL; L++) {
      let s = 0, a = 0, c = 0;
      for (let j = 0; j < jan; j++) { s += x[i + j] * x[i + j + L]; a += x[i + j] * x[i + j]; c += x[i + j + L] * x[i + j + L]; }
      const r = s / Math.sqrt(a * c + 1e-12);
      if (r > melhor) { melhor = r; lag = L; }
    }
    if (melhor > 0.6) tons.push(TX / lag);
  }
  tons.sort((a, b) => a - b);
  const med = tons[Math.floor(tons.length / 2)];
  const semitons = tons.map((f) => 12 * Math.log2(f / med));
  const media = semitons.reduce((a, b) => a + b, 0) / semitons.length;
  const desvio = Math.sqrt(semitons.reduce((a, b) => a + (b - media) ** 2, 0) / semitons.length);
  return { tomHz: Math.round(med), variacaoSemitons: +desvio.toFixed(2), duracao: +(x.length / TX).toFixed(2), pausa: Math.round(100 * (1 - falando / total)) + "%" };
}

for (const arq of process.argv.slice(2)) console.log(basename(arq).padEnd(16), JSON.stringify(medir(ler(arq))));
