// TEMPLATE 3: "Papel Recortado". Dioramas de papel (imagens Higgsfield), movimento de stop-motion a 12 quadros por segundo e legendas em tiras de papel.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/PatrickHand";
import { blocoEm, cenaEm, COMENTARIOS, limpa, forte, lim, LISTA, sai, volta, useSemVermelho, type Linha } from "./comum";
const F = loadFont("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const IMGS = ["img/p0.png", "img/p0.png", "img/p0.png", "img/p1.png", "img/p2.png", "img/p3.png", "img/p3.png", "img/p1.png"];
const Quadro: React.FC<{ arq: string; p: number; gira: number; passo: number; zoom: [number, number]; px: number; py: number; escala?: boolean }> = ({ arq, p, gira, passo, zoom, px, py }) => {
  const sem = useSemVermelho(arq);
  const z = zoom[0] + (zoom[1] - zoom[0]) * p, jx = Math.sin(passo * 12.9) * 3, jy = Math.cos(passo * 7.3) * 3, r = Math.sin(passo * 5.1) * 0.25;
  const st: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };
  return <AbsoluteFill style={{ transform: `translate(${jx + px}px, ${jy + py}px) scale(${z}) rotate(${r}deg)`, transformOrigin: "50% 45%" }}>
    <Img src={staticFile(arq)} style={st} />
    {sem && <img src={sem} style={{ ...st, clipPath: `circle(${gira * 130}% at 50% 45%)` }} />}
  </AbsoluteFill>;
};
const Tira: React.FC<{ children: React.ReactNode; cor: string; r: number; e?: number }> = ({ children, cor, r, e = 1 }) => (
  <span style={{ display: "inline-block", background: cor, color: "#2a2520", padding: "2px 22px", margin: "6px 10px", transform: `rotate(${r}deg) scale(${e})`, boxShadow: "6px 8px 0 rgba(40,30,20,.35)", backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,.025) 0 2px, transparent 2px 7px)" }}>{children}</span>
);
export const T3: React.FC<{ linha: Linha }> = ({ linha }) => {
  const f = useCurrentFrame(), t = f / 30, c = cenaEm(linha, t); if (!c) return null;
  const s = t - c.inicio, d = c.fim - c.inicio, passo = Math.floor(f / 2.5), sp = Math.floor(s * 12) / 12, p = sai(sp / d);
  // o vermelho some: cena 1 em onda; da 2 em diante já sumiu; na feira, some enquanto a fala acontece
  const gira = c.i === 0 ? 0 : c.i === 1 ? lim((s - 0.6) / 2.6) : c.i === 4 ? lim((s - 0.4) / 1.2) : 1;
  const entra = 1 - sai(s / 0.25);
  const b = blocoEm(c, t, 3);
  const zoom: [number, number] = c.i === 0 ? [1.2, 1.32] : c.i === 2 ? [1.45, 1.58] : c.i === 3 ? [1.05, 1.22] : c.i === 7 ? [1.3, 1.15] : c.i === 5 || c.i === 6 ? [1.42, 1.52] : [1.03, 1.14];
  return (
    <AbsoluteFill style={{ background: "#f2e6cf", fontFamily: F, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${(c.i ? entra : 0) * 1100}px)` }}>
        <Quadro key={IMGS[c.i]} arq={IMGS[c.i]} p={p} gira={gira} passo={passo} zoom={zoom} px={0} py={c.i === 2 ? 240 : c.i === 0 ? 150 : 0} />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", fontSize: 56 }}><Tira cor="#fffdf3" r={-1.5}>HOJE SUMIU · dia 12</Tira></div>
      {c.i === 0 && <div style={{ position: "absolute", top: 270, width: "100%", textAlign: "center", fontSize: 150, lineHeight: 1.05 }}><Tira cor="#fffdf3" r={2} e={volta(s / 0.33)}>a cor <span style={{ color: "#e01e26" }}>vermelha</span></Tira></div>}
      {c.i === 3 && <div style={{ position: "absolute", top: 270, width: "100%", textAlign: "center", fontSize: 76 }}><Tira cor="#ffe27a" r={-2}>{Math.round(48312 * sai(sp / 2.2)).toLocaleString("pt-BR")} carros parados</Tira></div>}
      {c.i === 6 && <div style={{ position: "absolute", left: 130, right: 130, top: 300, background: "#fffdf3", padding: "26px 40px", transform: "rotate(-1.5deg)", boxShadow: "10px 14px 0 rgba(40,30,20,.35)", fontSize: 54, lineHeight: 1.12, color: "#2a2520" }}>{LISTA.map((x, i) => <div key={i} style={{ opacity: lim((s - i * 0.13) * 8), textDecoration: "line-through", textDecorationColor: "#8a8a8a" }}>{i + 1}. {x}</div>)}</div>}
      {c.i === 7 && <div style={{ position: "absolute", top: 400, left: 80, right: 80, display: "flex", flexDirection: "column", alignItems: "center", fontSize: 76 }}>{COMENTARIOS.map((x, i) => <Tira key={x} cor={["#ffe27a", "#bfe9ff", "#ffd0dd"][i]} r={[-2, 1.5, -1][i]} e={volta((s - 0.4 - i * 0.4) / 0.3)}>“{x}”</Tira>)}<div style={{ fontSize: 34, marginTop: 8 }}><Tira cor="#fffdf3" r={0}>comentários de exemplo</Tira></div></div>}
      {b && <div style={{ position: "absolute", left: 40, right: 40, top: 1330, textAlign: "center", fontSize: 96, lineHeight: 1.02 }}>{b.palavras.map((x, i) => <Tira key={i + x.w} cor={forte(x.w) ? "#ffe27a" : "#fffdf3"} r={[(-1.4), 1.2, -0.8][i % 3]} e={t >= x.em ? 1 : 0.92}><span style={{ opacity: t >= x.em ? 1 : 0.45 }}>{limpa(x.w)}</span></Tira>)}</div>}
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};
