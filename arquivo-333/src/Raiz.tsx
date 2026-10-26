import { Composition, Still } from "remotion";
import { FPS, q } from "./serie/tempo";
import { Episodio, type Linha } from "./serie/Episodio";
import { Caso, type LinhaCaso } from "./caso/Caso";
import { Avatar } from "./serie/Avatar";
import { Plano3D } from "./motor3d/Mundo3D";

// Episódios do perfil "Arquivo 3:33". O renderizador passa a linha do tempo pronta como `linha`.
// "Caso" é o formato atual (cenas 3D em terceira pessoa); "Episodio" ficou só para o primeiro teste (v1).
const vazio: LinhaCaso = { id: "vazio", serie: "O Sinal", episodio: 1, titulo: "", duracao: 5, audio: "", cenas: [] };
export const Raiz = () => (
  <>
    <Composition id="Caso" component={Caso} width={1080} height={1920} fps={FPS} durationInFrames={300}
      defaultProps={{ linha: vazio }}
      calculateMetadata={({ props }) => ({ durationInFrames: q((props.linha as LinhaCaso).duracao) })} />
    <Composition id="Episodio" component={Episodio} width={1080} height={1920} fps={FPS} durationInFrames={300}
      defaultProps={{ linha: { duracao: 5, cenas: [] } as unknown as Linha }}
      calculateMetadata={({ props }) => ({ durationInFrames: q((props.linha as Linha).duracao) })} />
    <Still id="Avatar" component={Avatar} width={1080} height={1080} />
    <Still id="Plano3D" component={Plano3D} width={1080} height={1920} defaultProps={{ plano: "cidade_aerea", s: 1.5, dur: 3 }} />
  </>
);
