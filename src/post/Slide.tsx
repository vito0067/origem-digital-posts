// Uma foto do carrossel (1080x1350). O fundo é um panorama contínuo: ao arrastar, a luz continua
// de uma foto para a outra. `indice` = número da cena; o último índice é o cartão final.
import React from "react";
import { AbsoluteFill } from "remotion";
import { DEGRADE, MONO } from "../comum/marca";
import type { Post } from "./tipos";
import { ComTema, useTema } from "./tema";
import { Marca, Mundo } from "./pecas";
import { Area, CenaQualquer, Final } from "./cenas";
import { FINAL, duracaoCena } from "./tempos";

const TOPO = 150, BASE = 130, ALTURA = 1350 - TOPO - BASE;

export const totalSlides = (post: Post) => (post.formato === "imagem" ? 1 : post.cenas.length + 1);
export const duracaoSlide = (post: Post, indice: number) => (indice < post.cenas.length ? duracaoCena(post.cenas[indice]) : FINAL);

const Rodape: React.FC<{ post: Post; indice: number }> = ({ post, indice }) => {
  const t = useTema();
  const total = totalSlides(post);
  if (post.formato === "imagem") {
    return <div style={{ position: "absolute", left: 70, right: 70, bottom: 54, fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: t.suave }}>DIAGNÓSTICO GRATUITO · (11) 93929-9209</div>;
  }
  return (
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 50, display: "flex", alignItems: "center", gap: 26 }}>
      <span style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: t.suave }}>{String(indice + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}</span>
      <div style={{ flex: 1, display: "flex", gap: 8 }}>
        {Array.from({ length: total }, (_, k) => <div key={k} style={{ flex: 1, height: 6, borderRadius: 3, background: k <= indice ? DEGRADE : t.apagado, opacity: k <= indice ? 1 : 0.3 }} />)}
      </div>
      {indice === 0 && <span style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: t.etiqueta }}>ARRASTE →</span>}
    </div>
  );
};

export const Slide: React.FC<{ post: Post; indice: number }> = ({ post, indice }) => {
  const c = post.cenas[indice];
  return (
    <ComTema nome={post.tema}>
      <AbsoluteFill>
        <Mundo x={indice * 1080} y={0} largura={1080} altura={1350} />
        <Marca topo={58} />
        <Area topo={TOPO} base={BASE}>
          {c ? <CenaQualquer c={c} dur={duracaoSlide(post, indice)} altura={ALTURA} foto /> : <Final foto />}
        </Area>
        <Rodape post={post} indice={indice} />
      </AbsoluteFill>
    </ComTema>
  );
};
