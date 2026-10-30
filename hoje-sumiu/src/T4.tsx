// TEMPLATE 4: "Quadrinhos". Painéis de HQ (imagens Higgsfield) que batem na tela, retículas, onomatopeias e legenda em caixa amarela.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Bangers";
import { blocoEm, cenaEm, COMENTARIOS, limpa, forte, lim, LISTA, sai, volta, useSemVermelho, type Linha } from "./comum";
const F = loadFont("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const IMGS = ["img/c0.png", "img/c0.png", "img/c0.png", "img/c1.png", "img/c2.png", "img/c3.png", "img/c3.png", "img/c1.png"];
const SONS: Record<number, string> = { 1: "PUF!", 2: "CADÊ?!", 3: "BIIIIP!", 4: "NHAC?", 6: "RISCA!" };
const Painel: React.FC<{ arq: string; gira: number; z: number; py: number; x: number; y: number; w: number; h: number; r: number; e: number }> = ({ arq, gira, z, py, x, y, w, h, r, e }) => {
  const sem = useSemVermelho(arq);
  const st: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${(w - 1080) / 2}px, ${(h - 1920) / 2 + py}px) scale(${z})` };
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", border: "12px solid #111", background: "#fff", transform: `rotate(${r}deg) scale(${e})`, boxShadow: "14px 16px 0 #111" }}>
    <Img src={staticFile(arq)} style={st} />
    {sem && <img src={sem} style={{ ...st, clipPath: `circle(${gira * 130}% at 50% 45%)` }} />}
    <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(0,0,0,.09) 2px, transparent 2.6px)", backgroundSize: "11px 11px" }} />
  </div>;
};
const Som: React.FC<{ txt: string; s: number; x: number; y: number }> = ({ txt, s, x, y }) => {
  const q = volta((s - 0.25) / 0.2); if (s < 0.25) return null;
  return <div style={{ position: "absolute", left: x, top: y, fontSize: 150, color: "#ffe600", WebkitTextStroke: "10px #111", paintOrder: "stroke", transform: `rotate(-9deg) scale(${q})`, textShadow: "8px 8px 0 #e01e26" }}>{txt}</div>;
};
export const T4: React.FC<{ linha: Linha }> = ({ linha }) => {
  const f = useCurrentFrame(), t = f / 30, c = cenaEm(linha, t); if (!c) return null;
  const s = t - c.inicio, d = c.fim - c.inicio, p = sai(s / d), bate = volta(s / 0.22), treme = s < 0.2 ? Math.sin(s * 90) * 12 : 0;
  const gira = c.i === 0 ? 0 : c.i === 1 ? lim((s - 0.6) / 2.4) : c.i === 4 ? lim((s - 0.4) / 1) : 1;
  const b = blocoEm(c, t, 3);
  const zoom = c.i === 0 || c.i === 2 ? 1.3 + 0.08 * p : 1.02 + 0.1 * p;
  return (
    <AbsoluteFill style={{ background: c.i % 2 ? "#ffcf33" : "#32b6ff", fontFamily: F, overflow: "hidden", transform: `translateX(${treme}px)` }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.38) 5px, transparent 6px)", backgroundSize: "26px 26px" }} />
      <div style={{ position: "absolute", top: 120, left: 40, background: "#111", color: "#ffe600", fontSize: 58, padding: "4px 26px", transform: "rotate(-2deg)", letterSpacing: 3 }}>HOJE SUMIU · DIA 12</div>
      <Painel key={IMGS[c.i]} arq={IMGS[c.i]} gira={gira} z={zoom} py={c.i === 0 || c.i === 2 ? 200 : 0} x={50} y={235} w={980} h={1160} r={c.i % 2 ? 1 : -1} e={bate} />
      {c.i === 0 && <div style={{ position: "absolute", top: 280, width: "100%", textAlign: "center", fontSize: 170, lineHeight: 0.95, color: "#fff", WebkitTextStroke: "12px #111", paintOrder: "stroke", transform: `rotate(-3deg) scale(${volta((s - 0.1) / 0.25)})` }}>A COR<br /><span style={{ color: "#e01e26" }}>VERMELHA</span></div>}
      {SONS[c.i] && <Som txt={SONS[c.i]} s={s} x={c.i % 2 ? 480 : 90} y={c.i === 6 ? 980 : 300} />}
      {c.i === 3 && <div style={{ position: "absolute", left: 70, top: 1010, background: "#fff", border: "8px solid #111", fontSize: 76, padding: "2px 24px", transform: "rotate(2deg)" }}>{Math.round(48312 * sai(s / 2.2)).toLocaleString("pt-BR")} CARROS PARADOS</div>}
      {c.i === 6 && <div style={{ position: "absolute", left: 130, right: 130, top: 310, background: "#fffbe0", border: "8px solid #111", padding: "18px 34px", fontSize: 58, lineHeight: 1.1, color: "#111", transform: "rotate(-1.5deg)" }}>{LISTA.map((x, i) => <div key={i} style={{ opacity: lim((s - i * 0.12) * 8), textDecoration: "line-through" }}>{i + 1}. {x}</div>)}</div>}
      {c.i === 7 && <div style={{ position: "absolute", top: 380, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 30 }}>{COMENTARIOS.map((x, i) => { const q = volta((s - 0.4 - i * 0.4) / 0.25); return <div key={x} style={{ background: "#fff", border: "8px solid #111", borderRadius: 60, padding: "16px 44px", fontSize: 88, transform: `scale(${q}) rotate(${[-2, 2, -1][i]}deg)`, opacity: lim(q) }}>{x.toUpperCase()}!</div>; })}<div style={{ alignSelf: "center", background: "#111", color: "#fff", fontSize: 36, padding: "2px 18px" }}>COMENTÁRIOS DE EXEMPLO</div></div>}
      {b && <div style={{ position: "absolute", left: 50, right: 50, top: 1440, background: "#ffe600", border: "8px solid #111", boxShadow: "10px 10px 0 #111", padding: "14px 26px", textAlign: "center", fontSize: 96, lineHeight: 1.04, color: "#111", letterSpacing: 2, transform: "rotate(-0.6deg)" }}>{b.palavras.map((x, i) => <span key={i} style={{ marginRight: 20, opacity: t >= x.em ? 1 : 0.28, color: forte(x.w) ? "#d3121b" : "#111" }}>{limpa(x.w).toUpperCase()}</span>)}</div>}
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};
