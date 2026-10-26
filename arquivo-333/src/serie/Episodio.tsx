// Um episódio vertical (1080x1920): cenas em sequência, legenda palavra por palavra, selo da série e película.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { FPS, q } from "./tempo";
import { CENAS, ANTON, MONO } from "./cenas";
import { COR, Pelicula } from "./pecas";

export type Palavra = { w: string; em: number };
export type Bloco = { palavras: Palavra[]; de: number; ate: number };
export type CenaT = { visual: string; indice: number; inicio: number; fim: number; vozEm: number; vozDur: number; legenda: string; blocos: Bloco[] };
export type Linha = { id: string; serie: string; episodio: number; titulo: string; duracao: number; audio: string; cenas: CenaT[] };

const SEM_LEGENDA = new Set(["mensagem", "final"]);

/** Legenda grande no meio da tela: blocos de até 3 palavras; a palavra falada agora fica amarela. */
const Legenda: React.FC<{ linha: Linha }> = ({ linha }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  // marca as palavras entre *asteriscos* (podem atravessar blocos)
  const destaques = useMemo(() => linha.cenas.map((c) => {
    let dentro = false;
    return c.blocos.map((b) => b.palavras.map((p) => {
      const abre = p.w.startsWith("*"), fecha = /\*[.,!?]?$/.test(p.w);
      if (abre) dentro = true;
      const d = dentro;
      if (fecha) dentro = false;
      return d;
    }));
  }), [linha]);
  for (const c of linha.cenas) {
    if (SEM_LEGENDA.has(c.visual)) continue;
    const k = c.blocos.findIndex((b) => t >= b.de && t < b.ate);
    if (k < 0) continue;
    const b = c.blocos[k];
    const pop = spring({ frame: f - q(b.de), fps: FPS, config: { damping: 13, stiffness: 220, mass: 0.6 } });
    return (
      <div style={{ position: "absolute", left: 70, right: 70, top: 1130, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 26px", transform: `scale(${0.82 + 0.18 * pop})`, opacity: Math.min(1, pop * 1.5) }}>
        {b.palavras.map((p, i) => {
          const falando = t >= p.em && (i === b.palavras.length - 1 || t < b.palavras[i + 1].em);
          const destaque = destaques[c.indice][k][i];
          const cor = destaque ? COR.vermelho : falando ? COR.amarelo : COR.texto;
          return (
            <span key={i} style={{ fontFamily: ANTON, fontSize: 112, lineHeight: 1.08, color: cor, textTransform: "uppercase", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 8px 0 rgba(0,0,0,0.55)" }}>
              {p.w.replace(/\*/g, "")}
            </span>
          );
        })}
      </div>
    );
  }
  return null;
};

/** Selo no alto: série e episódio, com o ponto vermelho de "gravando". */
const Selo: React.FC<{ linha: Linha }> = ({ linha }) => {
  const f = useCurrentFrame();
  const fim = linha.cenas[linha.cenas.length - 1].inicio;
  if (f / FPS > fim) return null;
  return (
    <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 28px", borderRadius: 40, background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ width: 18, height: 18, borderRadius: 9, background: COR.vermelho, opacity: Math.floor(f / 15) % 2 ? 1 : 0.35 }} />
        <span style={{ fontFamily: MONO, fontSize: 30, color: "#E6ECF8", letterSpacing: 4, fontWeight: 700 }}>{linha.serie.toUpperCase()} · EP. {linha.episodio}</span>
      </div>
    </div>
  );
};

export const Episodio: React.FC<{ linha: Linha }> = ({ linha }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {linha.cenas.map((c) => {
      const Cena = CENAS[c.visual];
      const dur = c.fim - c.inicio;
      return (
        <Sequence key={c.indice} from={q(c.inicio)} durationInFrames={Math.max(1, q(c.fim) - q(c.inicio))}>
          <CenaLocal Cena={Cena} dur={dur} episodio={linha.episodio} />
        </Sequence>
      );
    })}
    <Legenda linha={linha} />
    <Selo linha={linha} />
    <Pelicula />
    <Audio src={staticFile(linha.audio)} />
  </AbsoluteFill>
);

const CenaLocal: React.FC<{ Cena: React.FC<any>; dur: number; episodio: number }> = ({ Cena, dur, episodio }) => {
  const f = useCurrentFrame();
  return <Cena s={f / FPS} dur={dur} episodio={episodio} />;
};
