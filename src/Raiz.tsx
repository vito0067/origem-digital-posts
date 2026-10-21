import { Composition } from "remotion";
import { FPS, q } from "./comum/tempo";
import { Reel } from "./post/Reel";
import { Slide, duracaoSlide } from "./post/Slide";
import { EXEMPLO } from "./post/exemplo";
import { linhaDoTempo } from "./post/tempos";
import type { Post } from "./post/tipos";

// Modelos dos posts automáticos. O renderizador (ferramentas/renderizar.mjs) passa o post.json como `post`.
export const Raiz = () => (
  <>
    <Composition id="Reel" component={Reel} width={1080} height={1920} fps={FPS} durationInFrames={300}
      defaultProps={{ post: EXEMPLO }}
      calculateMetadata={({ props }) => ({ durationInFrames: q(linhaDoTempo((props.post as Post).cenas).total) })} />
    <Composition id="Slide" component={Slide} width={1080} height={1350} fps={FPS} durationInFrames={150}
      defaultProps={{ post: EXEMPLO, indice: 0 }}
      calculateMetadata={({ props }) => ({ durationInFrames: q(duracaoSlide(props.post as Post, props.indice as number)) + 1 })} />
  </>
);
