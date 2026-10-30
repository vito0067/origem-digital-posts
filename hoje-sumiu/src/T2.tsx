// TEMPLATE 2: "Motion Graphics". Desenho vetorial plano em cores chapadas, formas geométricas e tipografia que anima junto da fala.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { blocoEm, cenaEm, COMENTARIOS, limpa, forte, lim, LISTA, sai, suave, volta, type Linha } from "./comum";
const F = loadFont("normal", { weights: ["800"], subsets: ["latin"] }).fontFamily;
const FUNDOS = ["#ffd23f", "#1b2a49", "#2ec4b6", "#3a86ff", "#fff3d6", "#ff9f1c", "#1b2a49", "#8338ec"];
const INK = "#1b2a49", VERM = "#ef233c", CINZA = "#9aa1ab";
const Semaforo: React.FC<{ x: number; y: number; esc: number; cinza: number }> = ({ x, y, esc, cinza }) => (
  <g transform={`translate(${x} ${y}) scale(${esc})`}>
    <rect x={-22} y={120} width={44} height={420} fill={INK} /><rect x={-95} y={-250} width={190} height={420} rx={46} fill={INK} />
    <circle cy={-145} r={62} fill={cinza > 0.5 ? "#4a5468" : VERM} />{cinza <= 0.5 && <circle cy={-145} r={92} fill={VERM} opacity={0.25} />}
    <circle cy={-20} r={62} fill="#7a6a2f" /><circle cy={105} r={62} fill="#2f6b49" />
  </g>
);
const Carro: React.FC<{ x: number; y: number; cor: string; r?: number }> = ({ x, y, cor, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-90} y={-34} width={180} height={62} rx={22} fill={cor} /><path d="M -50 -34 Q -40 -80 0 -80 L 30 -80 Q 55 -80 62 -34 Z" fill="#cfefff" />
    <circle cx={-52} cy={30} r={22} fill={INK} /><circle cx={52} cy={30} r={22} fill={INK} />
  </g>
);
const Morango: React.FC<{ x: number; y: number; c: string; e: number }> = ({ x, y, c, e }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}><path d="M 0 150 C -120 60 -110 -60 0 -60 C 110 -60 120 60 0 150 Z" fill={c} /><path d="M -70 -60 L -20 -90 L 0 -70 L 20 -90 L 70 -60 L 20 -40 L 0 -55 L -20 -40 Z" fill="#2fa84f" />{[[-40, 0], [30, -10], [-10, 40], [45, 45], [-50, 55], [5, 95]].map(([a, b], i) => <ellipse key={i} cx={a} cy={b} rx={7} ry={11} fill="#ffe08a" />)}</g>
);
const Nilo: React.FC<{ x: number; y: number; e: number; t: number }> = ({ x, y, e, t }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 2.4) * 6}) scale(${e})`}>
    <path d="M -130 420 L -110 140 Q 0 90 110 140 L 130 420 Z" fill="#c9a772" /><rect x={-14} y={150} width={28} height={270} fill="#a98a55" />
    <circle r={140} fill="#f0c6a0" /><path d="M -135 -30 Q -120 -140 0 -145 Q 120 -140 135 -30 Q 80 -95 0 -95 Q -80 -95 -135 -30 Z" fill="#eef0f2" />
    <circle cx={-52} cy={-5} r={36} fill="#fff" stroke={INK} strokeWidth={10} /><circle cx={52} cy={-5} r={36} fill="#fff" stroke={INK} strokeWidth={10} /><line x1={-16} y1={-5} x2={16} y2={-5} stroke={INK} strokeWidth={10} />
    <circle cx={-46} cy={-3} r={12} fill={INK} /><circle cx={58} cy={-3} r={12} fill={INK} />
    <path d="M -70 62 Q -35 28 0 58 Q 35 28 70 62 Q 35 88 0 70 Q -35 88 -70 62 Z" fill="#eef0f2" />
  </g>
);
const Cidade: React.FC<{ cinza: (x: number) => number; fundo?: string }> = ({ cinza }) => {
  const P = [[40, 620, 190, "#ff6b6b"], [240, 460, 170, "#8ecae6"], [420, 700, 200, "#ef233c"], [630, 520, 180, "#ffd23f"], [820, 640, 220, "#ef233c"]] as const;
  return <g>{P.map(([x, y, w, c], i) => <g key={i}><rect x={x} y={y} width={w} height={1400 - y} fill={c === "#ef233c" || c === "#ff6b6b" ? (cinza(x) > 0.5 ? "#7d838e" : c) : c} />{Array.from({ length: 16 }, (_, k) => <rect key={k} x={x + 22 + (k % 3) * (w - 44) / 3} y={y + 30 + Math.floor(k / 3) * 110} width={(w - 88) / 3} height={70} rx={6} fill="#fff" opacity={0.72} />)}</g>)}</g>;
};
export const T2: React.FC<{ linha: Linha }> = ({ linha }) => {
  const f = useCurrentFrame(), t = f / 30, c = cenaEm(linha, t); if (!c) return null;
  const s = t - c.inicio, d = c.fim - c.inicio, b = blocoEm(c, t, 3);
  const onda = sai(s / 0.32); // círculo que abre a cena nova
  const fundo = FUNDOS[c.i], antes = FUNDOS[Math.max(0, c.i - 1)];
  return (
    <AbsoluteFill style={{ background: antes, fontFamily: F }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={960} r={c.i === 0 ? 1400 : 1400 * onda} fill={fundo} />
        {c.i === 0 && <g><circle cx={540} cy={780} r={380 + Math.sin(t * 3) * 14} fill="#fff4b8" /><Semaforo x={540} y={840} esc={volta(s / 0.4) * 1.5} cinza={0} /></g>}
        {c.i === 1 && (() => { const w = sai((s - 0.3) / 2.6) * 1400; return <g><clipPath id="r"><circle cx={540} cy={1000} r={w} /></clipPath><Cidade cinza={() => 0} /><g clipPath="url(#r)"><Cidade cinza={() => 1} /></g><circle cx={540} cy={1000} r={w} fill="none" stroke="#fff" strokeWidth={14} opacity={0.8} /></g>; })()}
        {c.i === 2 && <g><rect y={1250} width={1080} height={700} fill={INK} /><rect y={1500} width={1080} height={18} fill="#fff" /><Semaforo x={300} y={760} esc={1.25} cinza={1} /><Carro x={-200 + (s * 420) % 1500} y={1420} cor="#ffd23f" /><Carro x={1300 - (s * 520) % 1600} y={1600} cor="#fff" r={0} /></g>}
        {c.i === 3 && <g>{Array.from({ length: 36 }, (_, i) => { const q = volta((s - i * 0.05) / 0.3); const col = i % 6, lin = Math.floor(i / 6); return <g key={i} transform={`translate(${100 + col * 176} ${520 + lin * 150}) rotate(${Math.sin(i * 2.3) * 22}) scale(${q * 0.82})`}><Carro x={0} y={0} cor={["#ffd23f", "#fff", "#2ec4b6", "#7d838e", "#ff9f1c", "#c8ccd4"][i % 6]} /></g>; })}</g>}
        {c.i === 4 && (() => { const q = suave((s - 0.3) / 0.8); const cor = q > 0.5 ? CINZA : VERM; return <g><circle cx={540} cy={760} r={400} fill={q > 0.5 ? "#e7e7e7" : "#ffd9d9"} /><Morango x={420} y={720} c={cor} e={volta(s / 0.35) * 1.5} /><g transform={`translate(800 ${830 + Math.sin(t * 3) * 10}) rotate(10)`}><rect x={-70} y={-160} width={140} height={320} rx={36} fill={cor} /><path d="M -32 -160 L 0 -250 L 32 -160 Z" fill="#fff" /><text textAnchor="middle" y={22} fontSize={150} fontWeight={800} fill="#fff">?</text></g></g>; })()}
        {c.i === 5 && <g><Nilo x={540} y={760} e={volta(s / 0.35) * 1.5} t={t} /></g>}
        {c.i === 6 && <g><rect x={120} y={260} width={840} height={1000} rx={26} fill="#fffbe8" transform="rotate(-2 540 760)" />{LISTA.map((x, i) => { const q = lim((s - i * 0.12) / 0.12); return <g key={i} opacity={q} transform="rotate(-2 540 760)"><text x={170} y={345 + i * 78} fontSize={44} fontWeight={800} fill={INK}>{i + 1}. {x}</text><line x1={165} y1={332 + i * 78} x2={165 + 700 * lim((s - i * 0.12 - 0.1) / 0.14)} y2={332 + i * 78} stroke={VERM === "" ? INK : CINZA} strokeWidth={7} /></g>; })}</g>}
      </svg>
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", color: c.i === 4 || c.i === 0 ? INK : "#fff", fontSize: 40, letterSpacing: 4 }}>HOJE SUMIU · DIA 12</div>
      {c.i === 0 && <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", fontSize: 92, lineHeight: 1.02, color: INK }}>a cor <span style={{ color: VERM }}>vermelha</span></div>}
      {c.i === 3 && <div style={{ position: "absolute", top: 240, width: "100%", textAlign: "center", color: "#fff" }}><div style={{ fontSize: 96 }}>{Math.round(48312 * sai(s / 2.2)).toLocaleString("pt-BR")}</div><div style={{ fontSize: 36 }}>carros parados</div></div>}
      {c.i === 7 && <div style={{ position: "absolute", top: 430, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 30 }}>{COMENTARIOS.map((x, i) => { const q = volta((s - 0.4 - i * 0.4) / 0.3); return <div key={x} style={{ background: "#fff", color: INK, borderRadius: 26, padding: "26px 36px", fontSize: 62, transform: `scale(${q})`, opacity: lim(q) }}>{x} <span style={{ float: "right" }}>♥</span></div>; })}<div style={{ color: "#fff", textAlign: "center", fontSize: 30 }}>comentários de exemplo</div></div>}
      {b && <div style={{ position: "absolute", left: 60, right: 60, top: 1420, textAlign: "center", fontSize: 104, lineHeight: 1.02, letterSpacing: -2 }}>{b.palavras.map((x, i) => { const q = sai((t - x.em) / 0.12); return <span key={i} style={{ display: "inline-block", marginRight: 26, opacity: q, transform: `translateY(${(1 - q) * 40}px)`, color: forte(x.w) ? (c.i === 4 || c.i === 0 ? VERM : "#ffd23f") : (c.i === 4 || c.i === 0 ? INK : "#fff") }}>{limpa(x.w)}</span>; })}</div>}
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};
