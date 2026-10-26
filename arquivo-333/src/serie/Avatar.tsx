// Foto do perfil: "ARQUIVO" datilografado e o "3:33" vermelho, no preto (identidade nova, 26/10/2026).
import React from "react";
import { AbsoluteFill } from "remotion";
import { ANTON } from "./cenas";
import { ELITE } from "../caso/Caso";

export const Avatar: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #1A0306 0%, #000 62%)", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ fontFamily: ELITE, fontSize: 82, color: "#E9E2D0", letterSpacing: 14, marginBottom: 0 }}>ARQUIVO</div>
    <div style={{ fontFamily: ANTON, fontSize: 380, lineHeight: 1, color: "#FF2E2E", textShadow: "0 0 50px rgba(255,46,46,0.9), 0 0 140px rgba(255,46,46,0.5)" }}>3:33</div>
    {Array.from({ length: 36 }, (_, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * 30, height: 2, background: "rgba(255,255,255,0.035)" }} />)}
  </AbsoluteFill>
);
