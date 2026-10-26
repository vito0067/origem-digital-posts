// Gera a foto do perfil (saida/avatar.png).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const serveUrl = await bundle({ entryPoint: join(RAIZ, "src", "index.ts"), publicDir: join(RAIZ, "public") });
const composition = await selectComposition({ serveUrl, id: "Avatar", inputProps: {} });
await renderStill({ serveUrl, composition, inputProps: {}, output: join(RAIZ, "saida", "avatar.png"), imageFormat: "png" });
console.log("ok");
