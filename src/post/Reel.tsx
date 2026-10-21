// Reel (1080x1920): um mundo só, com o fundo contínuo, e uma "câmera" que anda de cena em cena
// (sobe, vai para o lado ou mergulha). Todo corte cai numa batida da trilha (120 BPM).
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame } from "remotion";
import { entre, q } from "../comum/tempo";
import { SEGURO } from "../comum/vertical";
import type { Post } from "./tipos";
import { ComTema } from "./tema";
import { Fundo, Marca, Mundo } from "./pecas";
import { linhaDoTempo, SAIDA } from "./tempos";
import { Area, CenaQualquer, Final } from "./cenas";

// Conteúdo entre o topo e a base livres do Reels (o app cobre o resto).
const TOPO = SEGURO.topo + 120, BASE = 1920 - SEGURO.base, ALTURA = 1920 - TOPO - BASE;
const ENTRA = 0.42;
const chega = Easing.bezier(0.16, 1, 0.3, 1);
const parte = Easing.bezier(0.7, 0, 0.84, 0);

type Dir = { x: number; y: number; zoom?: boolean };
/** A ordem dos movimentos de câmera: sobe, direita, mergulha, esquerda... */
const MOVIMENTOS: Dir[] = [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: 0, zoom: true }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0, }, { x: 0, y: 0, zoom: true }];
const mov = (i: number) => MOVIMENTOS[i % MOVIMENTOS.length];

/** Entrada e saída de uma cena no sentido do movimento da câmera (com desfoque de movimento). */
const Camera: React.FC<{ dur: number; entra: Dir; sai: Dir | null; children: React.ReactNode }> = ({ dur, entra, sai, children }) => {
  const f = useCurrentFrame();
  const e = entre(f, 0, ENTRA, 0, 1, chega);
  const s = sai ? entre(f, dur - SAIDA, dur, 0, 1, parte) : 0;
  const D = 760;
  let x = 0, y = 0, escala = 1;
  if (entra.zoom) escala *= 1.3 - 0.3 * e; else { x += entra.x * D * (1 - e); y += entra.y * D * (1 - e); }
  if (sai?.zoom) escala *= 1 - 0.35 * s; else if (sai) { x -= sai.x * D * s; y -= sai.y * D * s; }
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${escala})`, filter: `blur(${(1 - e) * 16 + s * 16}px)`, opacity: Math.min(1, e * 1.8) * (1 - s * 0.85) }}>
      {children}
    </AbsoluteFill>
  );
};

/** Posição da câmera no mundo: cada corte anda 1000 px no sentido do movimento (o fundo vem junto, mais devagar). */
const posicaoCamera = (f: number, cortes: number[]) => {
  let x = 0, y = 0;
  cortes.forEach((t, i) => {
    const d = mov(i + 1);
    const p = entre(f, t - SAIDA, t + ENTRA, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
    x += d.x * 1000 * p; y += d.y * 1000 * p;
  });
  return { x, y };
};

export const Reel: React.FC<{ post: Post }> = ({ post }) => {
  const f = useCurrentFrame();
  const lt = linhaDoTempo(post.cenas, post.vozFinalDur);
  const cortes = [...lt.itens.slice(1).map((i) => i.ini), lt.final];
  const cam = posicaoCamera(f, cortes);
  return (
    <ComTema nome={post.tema}>
      <AbsoluteFill>
        <Mundo x={cam.x} y={cam.y} largura={1080} altura={1920} />
        {post.audio && <Audio src={staticFile(post.audio)} />}
        {post.cenas.map((c, i) => (
          <Sequence key={i} from={q(lt.itens[i].ini)} durationInFrames={q(lt.itens[i].dur)}>
            <Camera dur={lt.itens[i].dur} entra={i === 0 ? { x: 0, y: 0, zoom: true } : mov(i)} sai={mov(i + 1)}>
              {c.fundo && <Fundo src={c.fundo} dur={lt.itens[i].dur} foco={c.foco} />}
              <Area topo={TOPO} base={BASE}><CenaQualquer c={c} dur={lt.itens[i].dur} altura={ALTURA} /></Area>
            </Camera>
          </Sequence>
        ))}
        <Sequence from={q(lt.final)}>
          <Camera dur={99} entra={mov(post.cenas.length)} sai={null}>
            <Area topo={TOPO} base={BASE}><Final /></Area>
          </Camera>
        </Sequence>
        <Marca topo={SEGURO.topo + 10} />
      </AbsoluteFill>
    </ComTema>
  );
};
