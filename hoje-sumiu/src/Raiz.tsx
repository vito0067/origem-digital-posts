import React from "react";
import { Composition } from "remotion";
import { T1 } from "./T1";
import { T2 } from "./T2";
import { T3 } from "./T3";
import { T4 } from "./T4";
import type { Linha } from "./comum";
const vazio: Linha = { duracao: 5, cenas: [] };
const meta = ({ props }: any) => ({ durationInFrames: Math.round(props.linha.duracao * 30) });
export const Raiz = () => (<>
  {([["T1", T1], ["T2", T2], ["T3", T3], ["T4", T4]] as const).map(([id, C]) => <Composition key={id} id={id} component={C as any} width={1080} height={1920} fps={30} durationInFrames={150} defaultProps={{ linha: vazio }} calculateMetadata={meta} />)}
</>);
