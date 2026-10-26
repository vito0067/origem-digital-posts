// Peças visuais reaproveitadas pelos episódios: grão de filme, vinheta, prédios, silhueta e celular.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { sorteio } from "./tempo";

export const COR = {
  noite: "#04060D", azulNoite: "#0A1124", predio: "#070B17", predioClaro: "#0E1528",
  janela: "#FFB347", janelaQuente: "#FFC56B", tela: "#7FE7FF", vermelho: "#FF3B3B", amarelo: "#FFD23F", texto: "#F5F7FA",
};

/** Grão de filme animado + vinheta. Fica por cima de tudo. */
export const Pelicula: React.FC<{ forca?: number }> = ({ forca = 1 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.11 * forca, mixBlendMode: "overlay" }}>
        <filter id="grao"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 12} stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#grao)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Chuva fina em diagonal. */
export const Chuva: React.FC<{ n?: number; opacidade?: number }> = ({ n = 70, opacidade = 0.35 }) => {
  const f = useCurrentFrame();
  const r = sorteio(77);
  const gotas = Array.from({ length: n }, () => ({ x: r() * 1300 - 100, y0: r() * 1920, v: 38 + r() * 30, l: 40 + r() * 60, o: 0.3 + r() * 0.7 }));
  return (
    <AbsoluteFill style={{ opacity: opacidade, pointerEvents: "none" }}>
      {gotas.map((g, i) => {
        const y = (g.y0 + f * g.v) % 2100 - 100;
        return <div key={i} style={{ position: "absolute", left: g.x - y * 0.18, top: y, width: 2, height: g.l, background: "linear-gradient(transparent, rgba(180,210,255,0.9))", opacity: g.o, transform: "rotate(10deg)" }} />;
      })}
    </AbsoluteFill>
  );
};

export type Janela = { x: number; y: number; w: number; h: number; acende: number; pessoa: boolean; tom: number };

/** Gera as janelas de uma fachada (colunas x linhas) com horários de acender sorteados. */
export const fachada = (semente: number, cols: number, linhas: number, w: number, h: number, gap: number, acendeDe: number, acendeAte: number, chancePessoa = 0.18): Janela[] => {
  const r = sorteio(semente);
  const out: Janela[] = [];
  for (let l = 0; l < linhas; l++) for (let c = 0; c < cols; c++) {
    out.push({ x: c * (w + gap), y: l * (h + gap), w, h, acende: acendeDe + r() * (acendeAte - acendeDe), pessoa: r() < chancePessoa, tom: r() });
  }
  return out;
};

/** Desenha janelas; acesas depois do segundo `acende` (s = segundos locais). */
export const Janelas: React.FC<{ janelas: Janela[]; s: number; sempreApagadas?: boolean }> = ({ janelas, s, sempreApagadas }) => (
  <>
    {janelas.map((j, i) => {
      const acesa = !sempreApagadas && s >= j.acende;
      const brilho = acesa ? Math.min(1, (s - j.acende) / 0.12) : 0;
      const cor = j.tom > 0.75 ? "#9FD8FF" : j.tom > 0.4 ? COR.janela : COR.janelaQuente;
      return (
        <div key={i} style={{ position: "absolute", left: j.x, top: j.y, width: j.w, height: j.h, background: acesa ? cor : "#0B1020", opacity: acesa ? 0.25 + 0.75 * brilho : 1, boxShadow: acesa ? `0 0 ${18 * brilho}px ${cor}` : "none" }}>
          {acesa && j.pessoa && (
            <svg viewBox="0 0 40 60" width={j.w} height={j.h} style={{ position: "absolute", left: 0, top: 0 }}>
              <ellipse cx="20" cy="26" rx="7" ry="8.5" fill="#0A0A0F" />
              <path d="M5 60 Q6 40 20 37 Q34 40 35 60 Z" fill="#0A0A0F" />
            </svg>
          )}
        </div>
      );
    })}
  </>
);

/** Silhueta de uma mulher sentada, de perfil, segurando o celular (com a luz da tela no rosto). */
export const Silhueta: React.FC<{ luz: number; escala?: number }> = ({ luz, escala = 1 }) => (
  <svg viewBox="0 0 600 800" width={600 * escala} height={800 * escala}>
    <defs>
      <radialGradient id="luzTela" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={COR.tela} stopOpacity={0.55 * luz} />
        <stop offset="1" stopColor={COR.tela} stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="390" cy="330" r="220" fill="url(#luzTela)" />
    {/* cabelo e cabeça */}
    <path d="M250 150 Q250 70 330 62 Q410 60 420 140 Q428 190 405 230 L398 250 Q380 270 352 268 L340 300 L300 300 Q300 250 280 240 Q246 222 250 150 Z" fill="#020309" />
    <path d="M262 140 Q250 230 222 300 Q262 300 286 262 Z" fill="#020309" />
    {/* tronco e braço */}
    <path d="M200 800 Q190 520 250 380 Q290 300 340 300 Q400 310 410 380 Q420 450 400 520 L470 470 Q500 455 505 480 Q508 500 480 520 L390 600 Q360 620 350 600 L340 800 Z" fill="#020309" />
    {/* contorno iluminado pela tela */}
    <path d="M420 140 Q428 190 405 230 L398 250 Q380 270 352 268" fill="none" stroke={COR.tela} strokeOpacity={0.55 * luz} strokeWidth="4" />
    {/* celular */}
    <rect x="455" y="420" width="46" height="84" rx="9" fill={COR.tela} opacity={0.35 + 0.65 * luz} transform="rotate(-24 478 462)" />
  </svg>
);

/** Celular grande, centralizado, com a tela como conteúdo. */
export const Celular: React.FC<{ w?: number; h?: number; children?: React.ReactNode; brilho?: number; style?: React.CSSProperties }> = ({ w = 760, h = 1500, children, brilho = 1, style }) => (
  <div style={{ position: "relative", width: w, height: h, borderRadius: 96, background: "#0B0D14", padding: 22, boxShadow: `0 0 ${140 * brilho}px rgba(127,231,255,${0.28 * brilho}), inset 0 0 0 3px #1F2533`, ...style }}>
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 76, overflow: "hidden", background: "linear-gradient(170deg, #0D1B33 0%, #050912 70%)" }}>
      <div style={{ position: "absolute", top: 26, left: "50%", width: 180, height: 46, marginLeft: -90, borderRadius: 30, background: "#000", zIndex: 5 }} />
      {children}
    </div>
  </div>
);
