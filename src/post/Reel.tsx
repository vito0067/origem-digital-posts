// Reel (1080x1920): as cenas do post em sequência + cartão final, com a trilha gerada em código.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { COR } from "../comum/marca";
import { q } from "../comum/tempo";
import { Grao } from "../comum/pecas";
import { FundoGelo, SEGURO } from "../comum/vertical";
import type { Post } from "./tipos";
import { linhaDoTempo, SAIDA } from "./tempos";
import { Area, CenaQualquer, Final, Marca } from "./cenas";

// Conteúdo entre o topo e a base livres do Reels (o app cobre o resto).
const TOPO = SEGURO.topo + 120, BASE = 1920 - SEGURO.base, ALTURA = 1920 - TOPO - BASE;

export const Reel: React.FC<{ post: Post }> = ({ post }) => {
  const lt = linhaDoTempo(post.cenas);
  return (
    <AbsoluteFill style={{ background: COR.gelo }}>
      <FundoGelo />
      {post.audio && <Audio src={staticFile(post.audio)} />}
      <Marca topo={SEGURO.topo + 10} />
      {post.cenas.map((c, i) => (
        <Sequence key={i} from={q(lt.itens[i].ini)} durationInFrames={q(lt.itens[i].dur)}>
          <Area topo={TOPO} base={BASE}>
            <CenaQualquer c={c} dur={lt.itens[i].dur} sai={lt.itens[i].dur - SAIDA} altura={ALTURA} />
          </Area>
        </Sequence>
      ))}
      <Sequence from={q(lt.final)}>
        <Area topo={TOPO} base={BASE}><Final /></Area>
      </Sequence>
      <Grao opacidade={0.035} />
    </AbsoluteFill>
  );
};
