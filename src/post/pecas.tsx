// Peças visuais dos posts: o "mundo" (fundo contínuo por onde a câmera anda), o cartão de vidro,
// o texto cinético, a etiqueta e a assinatura. Tudo segue o tema (gelo ou noite).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MONO, SANS, SERIFA } from "../comum/marca";
import { entre, mola, q, sorteio } from "../comum/tempo";
import { Grao, Simbolo } from "../comum/pecas";
import { Etiqueta } from "../comum/tipo";
import { preenchido, useTema } from "./tema";

const TILE = 1100;

/**
 * Fundo contínuo: manchas de luz espalhadas num "mundo" maior que a tela, uma grade de pontos e grão.
 * `x`/`y` = posição da câmera em px. A luz anda a meia velocidade e os pontos a 80% (dá profundidade).
 */
export const Mundo: React.FC<{ x?: number; y?: number; largura: number; altura: number }> = ({ x = 0, y = 0, largura, altura }) => {
  const t = useTema();
  const lx = x * 0.5, ly = y * 0.5;
  const manchas: React.ReactNode[] = [];
  const i0 = Math.floor((lx - 1200) / TILE), i1 = Math.floor((lx + largura + 1200) / TILE);
  const j0 = Math.floor((ly - 1200) / TILE), j1 = Math.floor((ly + altura + 1200) / TILE);
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const r = sorteio(Math.abs(i * 7919 + j * 104729 + 17))();
    const r2 = sorteio(Math.abs(i * 31 + j * 997 + 5))();
    const raio = 650 + r * 450;
    const cx = i * TILE + r2 * TILE - lx, cy = j * TILE + r * TILE - ly;
    manchas.push(<div key={`${i}:${j}`} style={{ position: "absolute", left: cx - raio, top: cy - raio, width: raio * 2, height: raio * 2, borderRadius: "50%",
      background: `radial-gradient(circle, ${t.luzes[Math.abs(i + 2 * j) % 3]} 0%, rgba(0,0,0,0) 68%)` }} />);
  }
  return (
    <AbsoluteFill style={{ background: t.fundo, overflow: "hidden" }}>
      {manchas}
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, ${t.pontos} 1.7px, transparent 2.2px)`, backgroundSize: "46px 46px",
        backgroundPosition: `${-(x * 0.8) % 46}px ${-(y * 0.8) % 46}px`,
        maskImage: "radial-gradient(ellipse 75% 60% at 50% 45%, #000 20%, transparent 85%)", WebkitMaskImage: "radial-gradient(ellipse 75% 60% at 50% 45%, #000 20%, transparent 85%)",
      }} />
      {t.nome === "noite" && <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 50% 45%, rgba(0,0,0,0) 50%, rgba(3,2,15,.55) 100%)" }} />}
      <Grao opacidade={t.nome === "noite" ? 0.06 : 0.035} />
    </AbsoluteFill>
  );
};

/** Cartão de vidro fosco (borda clara, brilho em cima, sombra longa). */
export const Vidro: React.FC<{ raio?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ raio = 36, style, children }) => {
  const t = useTema();
  return (
    <div style={{ position: "relative", borderRadius: raio, background: t.vidro, border: `1.5px solid ${t.vidroBorda}`, boxShadow: t.vidroSombra, backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", ...style }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: raio, background: t.vidroBrilho, pointerEvents: "none" }} />
      {children}
    </div>
  );
};

/**
 * Texto cinético: cada palavra sobe de trás de uma máscara. *Destaque* = serifa itálica com degradê
 * (pode ter várias palavras). "\n" quebra a linha.
 */
export const Texto: React.FC<{ texto: string; inicio: number; tamanho: number; passo?: number; peso?: number; alinhar?: "left" | "center"; entrelinha?: number; cor?: string }> = ({ texto, inicio, tamanho, passo = 0.08, peso = 650, alinhar = "center", entrelinha = 1.04, cor }) => {
  const f = useCurrentFrame();
  const t = useTema();
  let n = 0, dentro = false;
  return (
    <div style={{ textAlign: alinhar }}>
      {texto.split("\n").map((linha, li) => (
        <div key={li} style={{ lineHeight: entrelinha, whiteSpace: "nowrap" }}>
          {linha.split(" ").map((bruta, wi, arr) => {
            const abre = bruta.startsWith("*");
            const fecha = /\*[.,!?:;]?$/.test(bruta) && (bruta.length > 1 || !abre);
            const acento = dentro || abre;
            dentro = acento && !fecha;
            const palavra = bruta.replace(/\*/g, "");
            const i = n++;
            const em = inicio + i * passo;
            const m = mola(f, em, { stiffness: 150, damping: 18, mass: 0.85 });
            const visivel = f >= q(em);
            return (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: tamanho * 0.16, marginBottom: -tamanho * 0.16, paddingRight: acento ? tamanho * 0.08 : 0, paddingLeft: acento ? tamanho * 0.02 : 0 }}>
                <span style={{
                  display: "inline-block", transformOrigin: "left bottom",
                  transform: visivel ? `translateY(${(1 - m) * 110}%) rotate(${(1 - m) * 6}deg)` : "translateY(115%)",
                  fontFamily: acento ? SERIFA : SANS, fontStyle: acento ? "italic" : "normal", fontWeight: acento ? 400 : peso,
                  fontSize: acento ? tamanho * 1.14 : tamanho, letterSpacing: acento ? "-0.015em" : "-0.04em",
                  ...(acento ? preenchido(t) : { color: cor ?? t.texto }),
                  filter: acento && t.nome === "noite" ? "drop-shadow(0 0 26px rgba(129,140,248,.55))" : undefined,
                }}>{palavra}</span>
                {wi < arr.length - 1 ? <span style={{ display: "inline-block", width: tamanho * 0.25 }} /> : null}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Frase menor de apoio (sobe e aparece). */
export const Apoio: React.FC<{ texto: string; inicio: number; tamanho?: number; style?: React.CSSProperties }> = ({ texto, inicio, tamanho = 42, style }) => {
  const f = useCurrentFrame();
  const t = useTema();
  const m = mola(f, inicio, { damping: 20 });
  return (
    <div style={{ fontFamily: SANS, fontSize: tamanho, lineHeight: 1.35, color: t.suave, textAlign: "center", maxWidth: 880, opacity: f < q(inicio) ? 0 : m, transform: `translateY(${(1 - m) * 24}px)`, ...style }}>
      {texto}
    </div>
  );
};

export const Rotulo: React.FC<{ texto?: string; inicio?: number; style?: React.CSSProperties }> = ({ texto, inicio = 0.05, style }) => {
  const t = useTema();
  return texto ? <Etiqueta texto={texto.toUpperCase()} inicio={inicio} centro tamanho={26} cor={t.etiqueta} style={{ marginBottom: 44, ...style }} /> : null;
};

/** Assinatura pequena no topo (símbolo + nome). */
export const Marca: React.FC<{ topo: number }> = ({ topo }) => {
  const t = useTema();
  return (
    <div style={{ position: "absolute", top: topo, left: 70, display: "flex", alignItems: "center", gap: 16 }}>
      <Simbolo largura={64} id="marca" claro={t.claro} />
      <span style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: t.texto, opacity: 0.85 }}>ORIGEM DIGITAL</span>
    </div>
  );
};

/** Faixa de luz que atravessa o elemento uma vez. */
export const Reflexo: React.FC<{ inicio: number; dur?: number; raio?: number }> = ({ inicio, dur = 0.8, raio = 36 }) => {
  const f = useCurrentFrame();
  const x = entre(f, inicio, inicio + dur, -30, 130);
  if (f < q(inicio) || f > q(inicio + dur)) return null;
  return <div style={{ position: "absolute", inset: 0, borderRadius: raio, pointerEvents: "none", background: `linear-gradient(105deg, rgba(255,255,255,0) ${x - 16}%, rgba(255,255,255,.55) ${x}%, rgba(255,255,255,0) ${x + 16}%)`, mixBlendMode: "soft-light" }} />;
};
