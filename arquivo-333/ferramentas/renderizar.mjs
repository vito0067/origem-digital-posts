// Renderiza um episódio já preparado (public/ep/<id>.json + .wav) em saida/<id>.mp4.
// Uso: node ferramentas/renderizar.mjs o-sinal-ep01 [fotos]   ("fotos" tira só alguns quadros para conferir)
import { empacotar, CHROMIUM } from "./empacotar.mjs";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const [, , id, modo] = process.argv;
const linha = JSON.parse(readFileSync(join(RAIZ, "public", "ep", `${id}.json`), "utf8"));
const serveUrl = await empacotar();
const inputProps = { linha };
const composition = await selectComposition({ serveUrl, id: linha.composicao ?? "Episodio", inputProps, chromiumOptions: CHROMIUM });
mkdirSync(join(RAIZ, "saida"), { recursive: true });
if (modo === "fotos") {
  const momentos = linha.cenas.map((c) => (c.inicio + c.fim) / 2);
  for (const [k, s] of momentos.entries()) {
    await renderStill({ serveUrl, composition, inputProps, frame: Math.round(s * 30), output: join(RAIZ, "saida", `${id}-foto-${k}.jpg`), imageFormat: "jpeg", jpegQuality: 70, scale: 0.4, chromiumOptions: CHROMIUM });
  }
  console.log("fotos ok");
} else {
  await renderMedia({ serveUrl, composition, inputProps, codec: "h264", crf: 18, audioBitrate: "192k", chromiumOptions: CHROMIUM, concurrency: Number(process.env.CONC ?? 4), outputLocation: join(RAIZ, "saida", `${id}.mp4`),
    onProgress: ({ progress }) => { if (Math.round(progress * 100) % 10 === 0) process.stdout.write(`\r${Math.round(progress * 100)}%`); } });
  console.log("\nvídeo ok:", join(RAIZ, "saida", `${id}.mp4`));
}
