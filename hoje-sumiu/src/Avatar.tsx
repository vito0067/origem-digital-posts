// Foto de perfil do Hoje Sumiu: o nome em papel, com o vermelho virando cinza.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/LilitaOne";
const F = loadFont("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const NAVY = "#16233f";
const nuvem = (y: number, cor: string, fase: number) => { let d = `M -20 1100 L -20 ${y}`; for (let i = 0; i < 7; i++) { const x = -20 + i * 180; d += ` Q ${x + 90} ${y - 90 - ((i + fase) % 3) * 26} ${x + 180} ${y}`; } d += " L 1100 1100 Z"; return <path d={d} fill={cor} stroke="#fffdf6" strokeWidth={10} style={{ filter: "drop-shadow(0 -8px 0 rgba(22,35,63,.14))" }} />; };
const letras: [string, string, number][] = [["S", "#e5202b", 0], ["U", "#e5202b", 0], ["M", "#c8595f", 22], ["I", "#a2a5ab", 0], ["U", "#a2a5ab", 0]];
export const Avatar: React.FC = () => (
  <AbsoluteFill style={{ background: "#79d0f2", overflow: "hidden" }}>
    <svg width={1080} height={1080} style={{ position: "absolute", inset: 0 }}>
      {nuvem(830, "#a6e3f7", 1)}{nuvem(915, "#d9f3fb", 0)}{nuvem(985, "#8ed16a", 2)}
    </svg>
    <div style={{ position: "absolute", top: 205, width: "100%", textAlign: "center", fontFamily: F, fontSize: 250, lineHeight: 1, color: NAVY, WebkitTextStroke: "34px #fff", paintOrder: "stroke fill", filter: "drop-shadow(0 12px 0 rgba(22,35,63,.4))", transform: "rotate(-3deg)" }}>HOJE</div>
    <div style={{ position: "absolute", top: 450, width: "100%", display: "flex", justifyContent: "center", fontFamily: F, fontSize: 320, lineHeight: 1, transform: "rotate(2deg)" }}>
      {letras.map(([l, c, y], i) => <span key={i} style={{ display: "inline-block", color: c, WebkitTextStroke: "36px #fff", paintOrder: "stroke fill", filter: "drop-shadow(0 14px 0 rgba(22,35,63,.4))", transform: `perspective(700px) rotateY(${y}deg)`, margin: "0 2px" }}>{l}</span>)}
    </div>
  </AbsoluteFill>
);
