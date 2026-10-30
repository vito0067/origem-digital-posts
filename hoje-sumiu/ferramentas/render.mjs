// Uso: node ferramentas/render.mjs T1,T2 [fotos 1.2 6 9 ...]
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const RAIZ = fileURLToPath(new URL("..", import.meta.url)), ARQ = join(RAIZ, "..", "arquivo-333");
const CHROMIUM = { gl: process.env.GL ?? "angle" };
const [, , ids, modo, ...tempos] = process.argv;
const serveUrl = await bundle({ entryPoint: join(RAIZ, "src", "index.ts"), publicDir: join(RAIZ, "public"), webpackOverride: (c) => ({ ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), three$: join(ARQ, "vendor", "three", "build", "three.module.js"), "three/examples/jsm": join(ARQ, "vendor", "three", "examples", "jsm") } } }) });
const linha = JSON.parse(readFileSync(join(RAIZ, "public", "linha.json"), "utf8"));
mkdirSync(join(RAIZ, "saida"), { recursive: true });
for (const id of ids.split(",")) {
  const composition = await selectComposition({ serveUrl, id, inputProps: { linha }, chromiumOptions: CHROMIUM });
  if (modo === "fotos") { for (const s of tempos) await renderStill({ serveUrl, composition, inputProps: { linha }, frame: Math.round(parseFloat(s) * 30), output: join(RAIZ, "saida", `${id}-${s}.jpg`), imageFormat: "jpeg", jpegQuality: 80, scale: 0.4, chromiumOptions: CHROMIUM }); console.log("fotos", id); }
  else { await renderMedia({ serveUrl, composition, inputProps: { linha }, codec: "h264", crf: 20, audioBitrate: "192k", chromiumOptions: CHROMIUM, concurrency: Number(process.env.CONC ?? 3), outputLocation: join(RAIZ, "saida", `hoje-sumiu-${id}.mp4`) }); console.log("video", id); }
}
