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
import { cortarNarracao } from "./narracao.mjs";
import { lerAudio } from "./mixagem.mjs";
import { validar } from "./validar.mjs";
import { paginaPost, paginaIndice } from "./paginas.mjs";
import { linhaDoTempo, SAIDA } from "../src/post/tempos.ts";

export const RAIZ = fileURLToPath(new URL("..", import.meta.url));
export const BASE_URL = (process.env.BASE_URL ?? "https://vito0067.github.io/origem-digital-posts").replace(/\/$/, "");
const FPS = 30;
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browserExecutable = process.env.REMOTION_BROWSER ?? (process.platform === "win32" && existsSync(EDGE) ? EDGE : null);

/** Mude quando os modelos mudarem de cara: os posts ainda não publicados são renderizados de novo. */
export const VERSAO_MODELOS = "3";
export const hashPost = (texto) => createHash("sha256").update(`${VERSAO_MODELOS}:${texto}`).digest("hex").slice(0, 16);

/** Baixa um arquivo externo (Higgsfield) para public/<tmp>/ e devolve o caminho relativo a public/. */
async function baixar(url, tmp, nome) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`não consegui baixar ${nome} (${r.status})`);
  const tipo = r.headers.get("content-type") ?? "";
  const ext = (url.match(/\.(png|jpe?g|webp|mp4|mp3|wav)(\?|$)/i)?.[1] ?? (tipo.includes("png") ? "png" : tipo.includes("mp4") ? "mp4" : tipo.includes("mpeg") ? "mp3" : tipo.includes("wav") ? "wav" : "jpg")).toLowerCase();
  writeFileSync(join(RAIZ, "public", tmp, `${nome}.${ext}`), Buffer.from(await r.arrayBuffer()));
  return `${tmp}/${nome}.${ext}`;
}

/** Baixa as imagens, os fundos e a narração externos e troca os endereços no post. */
async function baixarExternos(post, tmp) {
  for (const [i, c] of post.cenas.entries()) {
    if (c.tipo === "imagem" && /^https?:/.test(c.imagem)) c.imagem = await baixar(c.imagem, tmp, `img-${i + 1}`);
    if (c.fundo && /^https?:/.test(c.fundo)) c.fundo = await baixar(c.fundo, tmp, `fundo-${i + 1}`);
  }
  if (post.narracao?.audio && /^https?:/.test(post.narracao.audio)) post.narracao.audio = await baixar(post.narracao.audio, tmp, "narracao");
}

/** Corta a narração (uma gravação só) nas pausas e anota quanto dura a fala de cada cena. */
function prepararNarracao(post) {
  if (post.formato !== "reel" || !post.narracao?.audio) return null;
  const slots = [...post.cenas.map((c, i) => (c.fala ? i : null)).filter((i) => i !== null), ...(post.falaFinal ? [-1] : [])];
  const faixa = lerAudio(join(RAIZ, "public", post.narracao.audio));
  const pecas = cortarNarracao(faixa, slots.map((i) => (i === -1 ? post.falaFinal : post.cenas[i].fala)));
  pecas.forEach((p, k) => { const d = +(p.ate - p.de).toFixed(2); if (slots[k] === -1) post.vozFinalDur = d; else post.cenas[slots[k]].vozDur = d; });
  return { faixa, pecas, slots };
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
    await baixarExternos(post, tmp);
    const narracao = prepararNarracao(post);
    if (post.formato === "reel") { gerarTrilha(post, join(RAIZ, "public", tmp, "trilha.wav"), narracao); post.audio = `${tmp}/trilha.wav`; }
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
      const lt = linhaDoTempo(post.cenas, post.vozFinalDur);
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
