// Renderização na nuvem (GitHub Actions) do Arquivo 3:33.
// Para cada episodios/epNN.json que mudou desde a última renderização: baixa a narração, gera as fotos 3D que faltam,
// prepara o som e a linha do tempo, renderiza, faz a cópia leve (< 10 MB), a capa e uma folha de revisão,
// sobe tudo num "release" do GitHub (arquivo-<id>) e anota o resultado em publicacao/render/.
// Uso: node arquivo-333/ferramentas/nuvem.mjs            (todos os que mudaram)
//      FORCAR=ep02 node arquivo-333/ferramentas/nuvem.mjs  (renderiza esse de novo)
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, statSync, appendFileSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { ffmpeg } from "./mixagem.mjs";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const PASTA_EP = join(RAIZ, "episodios"), PASTA_RENDER = join(RAIZ, "publicacao", "render"), SAIDA = join(RAIZ, "saida");
const REPO = process.env.GITHUB_REPOSITORY ?? "vito0067/origem-digital-posts";
mkdirSync(PASTA_RENDER, { recursive: true }); mkdirSync(SAIDA, { recursive: true });

const rodar = (cmd, args, extra = {}) => execFileSync(cmd, args, { cwd: RAIZ, stdio: "inherit", ...extra });
const hash = (txt) => createHash("sha1").update(txt).digest("hex").slice(0, 12);
const forcar = (process.env.FORCAR ?? "").split(/[ ,]+/).filter(Boolean).map((x) => x.replace(/\.json$/, ""));

const arquivos = readdirSync(PASTA_EP).filter((f) => /^ep\d+\.json$/.test(f)).sort();
const pendentes = arquivos.filter((f) => {
  const nome = f.replace(/\.json$/, "");
  const txt = readFileSync(join(PASTA_EP, f), "utf8");
  const ep = JSON.parse(txt);
  if (ep.rascunho) return false;
  if (forcar.includes(nome)) return true;
  const reg = join(PASTA_RENDER, `${nome}.json`);
  return !existsSync(reg) || JSON.parse(readFileSync(reg, "utf8")).hash !== hash(txt);
});
console.log("para renderizar:", pendentes.join(", ") || "nenhum");

const feitos = [], erros = [];
for (const f of pendentes) {
  const nome = f.replace(/\.json$/, ""), caminho = join(PASTA_EP, f);
  const txt = readFileSync(caminho, "utf8"), ep = JSON.parse(txt), id = ep.id;
  const t0 = Date.now();
  try {
    // 1. narração
    const narr = join(RAIZ, "public", ep.narracao);
    if (!existsSync(narr)) {
      if (!ep.narracaoUrl) throw new Error(`falta a narração (${ep.narracao}) e não tem narracaoUrl`);
      mkdirSync(join(narr, ".."), { recursive: true });
      const r = await fetch(ep.narracaoUrl);
      if (!r.ok) throw new Error(`não consegui baixar a narração: HTTP ${r.status}`);
      writeFileSync(narr, Buffer.from(await r.arrayBuffer()));
    }
    // 2. fotos 3D paradas (cenas/3d/<plano>.png) que ainda não existem
    const fotos = ep.cenas.filter((c) => c.visual.arquivo?.startsWith("cenas/3d/") && !existsSync(join(RAIZ, "public", c.visual.arquivo)))
      .map((c) => `${basename(c.visual.arquivo, ".png")}:${c.visual.fotoSeg ?? 1.5}`);
    if (fotos.length) rodar("node", ["ferramentas/planos.mjs", "--grande", ...fotos]);
    // 3. som + linha do tempo, 4. vídeo
    rodar("node", ["ferramentas/preparar-caso.mjs", caminho]);
    rodar("node", ["ferramentas/renderizar.mjs", id]);
    const mp4 = join(SAIDA, `${id}.mp4`), leve = join(SAIDA, `${id}-upload.mp4`);
    // 5. cópia leve (o Chrome e o n8n sobem essa), capa e folha de revisão
    rodar(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", mp4, "-c:v", "libx264", "-preset", "slow", "-b:v", "1450k", "-maxrate", "2200k", "-bufsize", "4000k",
      "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", leve]);
    const linha = JSON.parse(readFileSync(join(RAIZ, "public", "ep", `${id}.json`), "utf8"));
    const capaEm = ep.publicar?.capaEm ?? linha.duracao * 0.5;
    rodar(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(capaEm), "-i", mp4, "-frames:v", "1", "-q:v", "3", join(SAIDA, `${id}-capa.jpg`)]);
    rodar(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", mp4, "-vf", "fps=1/2,scale=216:384,tile=8x4", "-frames:v", "1", "-q:v", "4", join(SAIDA, `${id}-revisao.jpg`)]);
    // 6. release no GitHub (substitui os arquivos se já existir)
    const tag = `arquivo-${id}`, anexos = [leve, join(SAIDA, `${id}-capa.jpg`), join(SAIDA, `${id}-revisao.jpg`), narr];
    let existe = true; try { execFileSync("gh", ["release", "view", tag, "--repo", REPO], { stdio: "ignore" }); } catch { existe = false; }
    if (existe) rodar("gh", ["release", "upload", tag, ...anexos, "--clobber", "--repo", REPO]);
    else rodar("gh", ["release", "create", tag, ...anexos, "--repo", REPO, "--title", `Arquivo 3:33 · ${ep.serie} · Ep. ${ep.episodio}`, "--notes", "Renderizado pela nuvem. A cópia leve (-upload.mp4) é a que vai para as redes."]);
    // 7. registro
    const base = `https://github.com/${REPO}/releases/download/${tag}`;
    const reg = { id, arquivo: f, hash: hash(txt), episodio: ep.episodio, serie: ep.serie, duracao: +linha.duracao.toFixed(2), publicar: ep.publicar ?? null,
      video: `${base}/${id}-upload.mp4`, capa: `${base}/${id}-capa.jpg`, revisao: `${base}/${id}-revisao.jpg`,
      tamanhoMB: +(statSync(leve).size / 1048576).toFixed(1), renderizadoEm: new Date().toISOString(), minutos: +((Date.now() - t0) / 60000).toFixed(1) };
    writeFileSync(join(PASTA_RENDER, `${nome}.json`), JSON.stringify(reg, null, 2) + "\n");
    copyFileSync(join(SAIDA, `${id}-revisao.jpg`), join(PASTA_RENDER, `${nome}-revisao.jpg`));
    feitos.push(nome);
    console.log(`✔ ${nome} em ${reg.minutos} min (${reg.duracao} s, ${reg.tamanhoMB} MB)`);
  } catch (e) {
    erros.push(`${nome}: ${e.message}`);
    writeFileSync(join(PASTA_RENDER, `${nome}-erro.txt`), `${new Date().toISOString()}\n${e.stack ?? e.message}\n`);
    console.error(`✖ ${nome}:`, e.message);
  }
}

// agenda: tudo que já está renderizado, em ordem de data (o n8n lê este arquivo para publicar no Instagram)
const agenda = readdirSync(PASTA_RENDER).filter((f) => /^ep\d+\.json$/.test(f)).map((f) => JSON.parse(readFileSync(join(PASTA_RENDER, f), "utf8")))
  .filter((r) => r.publicar?.data).sort((a, b) => a.publicar.data.localeCompare(b.publicar.data));
writeFileSync(join(PASTA_RENDER, "agenda.json"), JSON.stringify(agenda.map((r) => ({ data: r.publicar.data, hora: r.publicar.hora ?? "20:00", id: r.id, episodio: r.episodio,
  serie: r.serie, legenda: r.publicar.legenda, video: r.video, capa: r.capa })), null, 2) + "\n");

if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `feitos=${feitos.join(",")}\nerros=${erros.length}\n`);
if (erros.length) { console.error("erros:\n" + erros.join("\n")); process.exitCode = 1; }
