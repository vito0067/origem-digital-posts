// Empacota o projeto do Remotion com o three.js da pasta vendor (sem mexer no node_modules da fábrica de posts)
// e diz ao navegador para usar a placa de vídeo (WebGL) ao renderizar.
import { bundle } from "@remotion/bundler";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const RAIZ = fileURLToPath(new URL("..", import.meta.url));
export const CHROMIUM = { gl: process.env.GL ?? "angle" };

export const empacotar = () => bundle({
  entryPoint: join(RAIZ, "src", "index.ts"),
  publicDir: join(RAIZ, "public"),
  webpackOverride: (c) => ({
    ...c,
    resolve: {
      ...c.resolve,
      alias: {
        ...(c.resolve?.alias ?? {}),
        three$: join(RAIZ, "vendor", "three", "build", "three.module.js"),
        "three/examples/jsm": join(RAIZ, "vendor", "three", "examples", "jsm"),
      },
    },
  }),
});
