// Tira quadros soltos de um episódio já preparado, para conferir sem renderizar tudo.
// Uso: node ferramentas/quadros.mjs o-sinal-ep01 3.5 9.5 14   (segundos)
import { empacotar, CHROMIUM } from "./empacotar.mjs";
import { renderStill, selectComposition } from "@remotion/renderer";
import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const [, , id, ...tempos] = process.argv;
const linha = JSON.parse(readFileSync(join(RAIZ, "public", "ep", `${id}.json`), "utf8"));
const serveUrl = await empacotar();
const inputProps = { linha };
const composition = await selectComposition({ serveUrl, id: linha.composicao ?? "Episodio", inputProps, chromiumOptions: CHROMIUM });
const pasta = join(RAIZ, "testes", "quadros");
mkdirSync(pasta, { recursive: true });
for (const t of tempos) {
  await renderStill({ serveUrl, composition, inputProps, frame: Math.round(parseFloat(t) * 30), output: join(pasta, `${id}-${t}.jpg`), imageFormat: "jpeg", jpegQuality: 75, scale: 0.4, chromiumOptions: CHROMIUM });
}
console.log("quadros em", pasta);
