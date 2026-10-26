// Tira uma foto de cada plano 3D pedido, para conferir o visual sem renderizar o episódio.
// Uso: node ferramentas/planos.mjs cidade_aerea:1.5 quarto_rosto:2 ...   (plano:segundo)
// Com --grande, salva em 1080x1920 (para usar no vídeo, como a "foto recebida").
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { empacotar, RAIZ, CHROMIUM } from "./empacotar.mjs";

const args = process.argv.slice(2), grande = args.includes("--grande");
const pedidos = args.filter((a) => !a.startsWith("--"));
const serveUrl = await empacotar();
const pasta = grande ? join(RAIZ, "public", "cenas", "3d") : join(RAIZ, "testes", "planos");
mkdirSync(pasta, { recursive: true });
for (const p of pedidos) {
  const [plano, seg = "1.5", dur = "3"] = p.split(":");
  const inputProps = { plano, s: parseFloat(seg), dur: parseFloat(dur) };
  const composition = await selectComposition({ serveUrl, id: "Plano3D", inputProps, chromiumOptions: CHROMIUM });
  const saida = join(pasta, grande ? `${plano}.png` : `${plano}-${seg}.jpg`);
  await renderStill({ serveUrl, composition, inputProps, frame: 0, output: saida, ...(grande ? { imageFormat: "png" } : { imageFormat: "jpeg", jpegQuality: 80 }), scale: grande ? 1 : 0.4, chromiumOptions: CHROMIUM });
  console.log("ok", saida);
}
