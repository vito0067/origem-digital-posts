// Transforma posts (fila/<id>/post.json) em vídeo ou fotos, prontos para o Instagram, em docs/<id>/.
// Uso: node ferramentas/renderizar.mjs fila/<id>/post.json [outro post.json ...]
// O que sai em docs/<id>/: reel.mp4 + capa.jpg (reel) ou slide-1.jpg, slide-2.jpg... (carrossel/imagem),
// post.json (com os endereços públicos) e index.html (a prévia que o Vito abre no celular).
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gerarTrilha } from "./trilha.mjs";
import { validar } from "./validar.mjs";
import { paginaPost, paginaIndice } from "./paginas.mjs";
import { linhaDoTempo, SAIDA } from "../src/post/tempos.ts";

export const RAIZ = fileURLToPath(new URL("..", import.meta.url));
export const BASE_URL = (process.env.BASE_URL ?? "https://vito0067.github.io/origem-digital-posts").replace(/\/$/, "");
const FPS = 30;
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browserExecutable = process.env.REMOTION_BROWSER ?? (process.platform === "win32" && existsSync(EDGE) ? EDGE : null);

export const hashPost = (texto) => createHash("sha256").update(texto).digest("hex").slice(0, 16);

/** Baixa as imagens externas (Higgsfield) para public/_tmp/<id>/ e troca o endereço no post. */
async function baixarImagens(post, tmp) {
  for (const [i, c] of post.cenas.entries()) {
    if (c.tipo !== "imagem" || !/^https?:/.test(c.imagem)) continue;
    const r = await fetch(c.imagem);
    if (!r.ok) throw new Error(`não consegui baixar a imagem da cena ${i + 1} (${r.status})`);
    const ext = (r.headers.get("content-type") ?? "").includes("png") ? "png" : "jpg";
    writeFileSync(join(RAIZ, "public", tmp, `img-${i + 1}.${ext}`), Buffer.from(await r.arrayBuffer()));
    c.imagem = `${tmp}/img-${i + 1}.${ext}`;
  }
}

export async function renderizar(caminhos) {
  // 1. ler, conferir e preparar (imagens e trilha) todos os posts antes de montar o pacote
  const posts = [];
  for (const caminho of caminhos) {
    const bruto = readFileSync(caminho, "utf8");
    const post = JSON.parse(bruto);
    const problemas = validar(post, basename(dirname(caminho)));
    if (problemas.length) throw new Error(`${caminho}:\n  - ${problemas.join("\n  - ")}`);
    const tmp = `_tmp/${post.id}`;
    rmSync(join(RAIZ, "public", tmp), { recursive: true, force: true });
    mkdirSync(join(RAIZ, "public", tmp), { recursive: true });
    await baixarImagens(post, tmp);
    if (post.formato === "reel") { gerarTrilha(post, join(RAIZ, "public", tmp, "trilha.wav")); post.audio = `${tmp}/trilha.wav`; }
    posts.push({ post, hash: hashPost(bruto), original: JSON.parse(bruto) });
  }
  if (!posts.length) return [];

  // 2. montar o pacote uma vez e renderizar
  const serveUrl = await bundle({ entryPoint: join(RAIZ, "src", "index.ts") });
  const feitos = [];
  for (const { post, hash, original } of posts) {
    const pasta = join(RAIZ, "docs", post.id);
    rmSync(pasta, { recursive: true, force: true });
    mkdirSync(pasta, { recursive: true });
    const url = (arq) => `${BASE_URL}/${post.id}/${arq}`;
    let midias = [], capa = null;
    if (post.formato === "reel") {
      const inputProps = { post };
      const composition = await selectComposition({ serveUrl, id: "Reel", inputProps, browserExecutable });
      await renderMedia({ serveUrl, composition, inputProps, codec: "h264", crf: 20, pixelFormat: "yuv420p", colorSpace: "bt709", audioCodec: "aac", outputLocation: join(pasta, "reel.mp4"), browserExecutable });
      const lt = linhaDoTempo(post.cenas);
      await renderStill({ serveUrl, composition, inputProps, frame: Math.round((lt.itens[0].dur - SAIDA) * FPS) - 2, output: join(pasta, "capa.jpg"), imageFormat: "jpeg", jpegQuality: 90, browserExecutable });
      midias = [url("reel.mp4")]; capa = url("capa.jpg");
    } else {
      const total = post.formato === "imagem" ? 1 : post.cenas.length + 1;
      for (let indice = 0; indice < total; indice++) {
        const inputProps = { post, indice };
        const composition = await selectComposition({ serveUrl, id: "Slide", inputProps, browserExecutable });
        await renderStill({ serveUrl, composition, inputProps, frame: composition.durationInFrames - 1, output: join(pasta, `slide-${indice + 1}.jpg`), imageFormat: "jpeg", jpegQuality: 92, browserExecutable });
        midias.push(url(`slide-${indice + 1}.jpg`));
      }
      capa = midias[0];
    }
    const publico = { ...original, midias, capa, previa: url(""), hash, renderizado_em: new Date().toISOString() };
    writeFileSync(join(pasta, "post.json"), JSON.stringify(publico, null, 2));
    writeFileSync(join(pasta, "index.html"), paginaPost(publico));
    rmSync(join(RAIZ, "public", "_tmp", post.id), { recursive: true, force: true });
    feitos.push(post.id);
    console.log("pronto:", post.id);
  }
  atualizarIndice();
  return feitos;
}

/** Página inicial com todos os posts renderizados (mais novos em cima). */
export function atualizarIndice() {
  const docs = join(RAIZ, "docs");
  mkdirSync(docs, { recursive: true });
  const lista = readdirSync(docs, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(join(docs, d.name, "post.json")))
    .map((d) => JSON.parse(readFileSync(join(docs, d.name, "post.json"), "utf8"))).sort((a, b) => b.publicar_em.localeCompare(a.publicar_em));
  writeFileSync(join(docs, "index.html"), paginaIndice(lista));
  writeFileSync(join(docs, ".nojekyll"), "");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  if (!args.length) { console.error("Uso: node ferramentas/renderizar.mjs fila/<id>/post.json"); process.exit(1); }
  renderizar(args).catch((e) => { console.error(e.message ?? e); process.exit(1); });
}
