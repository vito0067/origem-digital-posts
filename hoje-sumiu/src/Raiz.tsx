import React from "react";
import { Composition, Still } from "remotion";
import { T1 } from "./T1";
import { T2 } from "./T2";
import { T3 } from "./T3";
import { T4 } from "./T4";
import { Dia } from "./Dia";
import { Avatar } from "./Avatar";
import type { Linha } from "./comum";
const vazio: Linha = { duracao: 5, cenas: [] };
const meta = ({ props }: any) => ({ durationInFrames: Math.round(props.linha.duracao * 30) });
export const Raiz = () => (<>
  <Still id="Avatar" component={Avatar} width={1080} height={1080} />
  <Composition id="Dia" component={Dia as any} width={1080} height={1920} fps={30} durationInFrames={150} defaultProps={{ linha: { id: "", dia: 1, coisa: "", duracao: 5, marcas: {}, cenas: [] } as any }} calculateMetadata={meta} />
  {([["T1", T1], ["T2", T2], ["T3", T3], ["T4", T4]] as const).map(([id, C]) => <Composition key={id} id={id} component={C as any} width={1080} height={1920} fps={30} durationInFrames={150} defaultProps={{ linha: vazio }} calculateMetadata={meta} />)}
</>);
