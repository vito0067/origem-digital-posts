// Tira "fotos" de um Reel em alguns segundos, para conferir sem assistir ao vídeo.
// Uso: node ferramentas/fotos.mjs fila/<id>/post.json <pasta-de-saida> <seg1> <seg2> ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "./renderizar.mjs";

const [, , caminho, saida, ...segs] = process.argv;
const post = JSON.parse(readFileSync(caminho, "utf8"));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browserExecutable = process.platform === "win32" ? EDGE : null;
const serveUrl = await bundle({ entryPoint: join(RAIZ, "src", "index.ts") });
const inputProps = { post };
const composition = await selectComposition({ serveUrl, id: "Reel", inputProps, browserExecutable });
for (const s of segs) {
  await renderStill({ serveUrl, composition, inputProps, frame: Math.round(Number(s) * 30), output: join(saida, `foto-${s}.jpg`), imageFormat: "jpeg", jpegQuality: 70, scale: 0.4, browserExecutable });
}
console.log("ok");
