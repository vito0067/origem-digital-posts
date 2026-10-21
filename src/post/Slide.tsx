// Uma foto do carrossel (1080x1350). A foto é o último quadro da cena, já com tudo no lugar.
// `indice` = número da cena; o último índice (= número de cenas) é o cartão final.
import React from "react";
import { AbsoluteFill } from "remotion";
import { COR, MONO } from "../comum/marca";
import { Grao } from "../comum/pecas";
import { FundoGelo } from "../comum/vertical";
import type { Post } from "./tipos";
import { Area, CenaQualquer, Final, Marca } from "./cenas";
import { FINAL, duracaoCena } from "./tempos";

const TOPO = 150, BASE = 120, ALTURA = 1350 - TOPO - BASE;

export const totalSlides = (post: Post) => (post.formato === "imagem" ? 1 : post.cenas.length + 1);
export const duracaoSlide = (post: Post, indice: number) => (indice < post.cenas.length ? duracaoCena(post.cenas[indice]) : FINAL);

export const Slide: React.FC<{ post: Post; indice: number }> = ({ post, indice }) => {
  const c = post.cenas[indice];
  const total = totalSlides(post);
  return (
    <AbsoluteFill style={{ background: COR.gelo }}>
      <FundoGelo foco="50% 20%" />
      <Marca topo={58} />
      <Area topo={TOPO} base={BASE}>
        {c ? <CenaQualquer c={c} dur={duracaoSlide(post, indice)} altura={ALTURA} /> : <Final />}
      </Area>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 54, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: COR.cinza }}>
        <span>{post.formato === "imagem" ? "DIAGNÓSTICO GRATUITO · (11) 93929-9209" : `${indice + 1} / ${total}`}</span>
        {post.formato !== "imagem" && indice === 0 && <span style={{ color: COR.azul }}>ARRASTE →</span>}
      </div>
      <Grao opacidade={0.03} />
    </AbsoluteFill>
  );
};
