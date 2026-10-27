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
const todos = arquivos.filter((f) => {
  const nome = f.replace(/\.json$/, "");
  const txt = readFileSync(join(PASTA_EP, f), "utf8");
  const ep = JSON.parse(txt);
  if (ep.rascunho || ep.publicar?.publicado) return false; // rascunho ou já publicado: não renderiza
  if (forcar.includes(nome)) return true;
  const reg = join(PASTA_RENDER, `${nome}.json`);
  return !existsSync(reg) || JSON.parse(readFileSync(reg, "utf8")).hash !== hash(txt);
});
// um por rodada (o de data mais próxima): sem placa de vídeo cada um leva bastante tempo, e a Action roda de novo
// a cada 2 horas até zerar a fila
const dataDe = (f) => JSON.parse(readFileSync(join(PASTA_EP, f), "utf8")).publicar?.data ?? "9999";
const pendentes = todos.sort((x, y) => dataDe(x).localeCompare(dataDe(y))).slice(0, process.env.TODOS ? 99 : 1); // no PC (rápido): TODOS=1
console.log("na fila:", todos.join(", ") || "nenhum", "| agora:", pendentes.join(", ") || "nenhum");

// ---- release pelo REST do GitHub (funciona na Action e no PC; no PC: GH_TOKEN vindo do "git credential fill")
const API = `https://api.github.com/repos/${REPO}`;
const cab = () => ({ Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: "application/vnd.github+json" });
async function subirRelease(tag, titulo, anexos) {
  if (!process.env.GH_TOKEN) throw new Error("falta GH_TOKEN para subir o release");
  let r = await fetch(`${API}/releases/tags/${tag}`, { headers: cab() });
  let rel = r.ok ? await r.json() : null;
  if (!rel) {
    r = await fetch(`${API}/releases`, { method: "POST", headers: cab(), body: JSON.stringify({ tag_name: tag, name: titulo, target_commitish: "main", body: "Renderizado pelo Arquivo 3:33. A cópia leve (-upload.mp4) é a que vai para as redes." }) });
    if (!r.ok) throw new Error(`criar release: HTTP ${r.status} ${await r.text()}`);
    rel = await r.json();
  }
  for (const arq of anexos) {
    const nome = basename(arq), velho = (rel.assets ?? []).find((a) => a.name === nome);
    if (velho) await fetch(`${API}/releases/assets/${velho.id}`, { method: "DELETE", headers: cab() });
    const tipo = nome.endsWith(".mp4") ? "video/mp4" : nome.endsWith(".mp3") ? "audio/mpeg" : "image/jpeg";
    const up = await fetch(`https://uploads.github.com/repos/${REPO}/releases/${rel.id}/assets?name=${encodeURIComponent(nome)}`, { method: "POST", headers: { ...cab(), "Content-Type": tipo }, body: readFileSync(arq) });
    if (!up.ok) throw new Error(`subir ${nome}: HTTP ${up.status} ${await up.text()}`);
  }
}

/** Folha com 16 quadros do vídeo (na nuvem, filtro tile do ffmpeg; no Windows, que não tem esse filtro, monta pelo PowerShell). */
function folhaDeRevisao(mp4, duracao, saida) {
  if (process.platform !== "win32") return rodar(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", mp4, "-vf", "fps=1/2,scale=216:384,tile=8x4", "-frames:v", "1", "-q:v", "4", saida]);
  const tmp = join(SAIDA, "_folha"); mkdirSync(tmp, { recursive: true });
  const quadros = Array.from({ length: 16 }, (_, k) => +(0.4 + (k * (duracao - 0.8)) / 15).toFixed(2));
  quadros.forEach((t, k) => rodar(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(t), "-i", mp4, "-frames:v", "1", "-vf", "scale=270:480", "-q:v", "4", join(tmp, `${String(k).padStart(2, "0")}.jpg`)]));
  const ps = `Add-Type -AssemblyName System.Drawing; $l = Get-ChildItem '${tmp}' -Filter *.jpg | Sort-Object Name; $b = New-Object System.Drawing.Bitmap 2160, 960; $g = [System.Drawing.Graphics]::FromImage($b); $i = 0; foreach ($f in $l) { $im = [System.Drawing.Image]::FromFile($f.FullName); $g.DrawImage($im, ($i % 8) * 270, [math]::Floor($i / 8) * 480, 270, 480); $im.Dispose(); $i++ }; $b.Save('${saida}', [System.Drawing.Imaging.ImageFormat]::Jpeg); $g.Dispose(); $b.Dispose()`;
  execFileSync("powershell", ["-NoProfile", "-Command", ps], { stdio: "inherit" });
}

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
    // taxa de vídeo pela duração, para a cópia leve ficar abaixo de ~9,5 MB (o Chrome só sobe até 10 MB)
    const durSeg = JSON.parse(readFileSync(join(RAIZ, "public", "ep", `${id}.json`), "utf8")).duracao;
    const kbps = Math.max(700, Math.min(1450, Math.floor((9.3 * 8192) / durSeg - 150)));
    rodar(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", mp4, "-c:v", "libx264", "-preset", "slow", "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 1.5)}k`, "-bufsize", `${kbps * 3}k`,
      "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", leve]);
    const linha = JSON.parse(readFileSync(join(RAIZ, "public", "ep", `${id}.json`), "utf8"));
    const capaEm = ep.publicar?.capaEm ?? linha.duracao * 0.5;
    rodar(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(capaEm), "-i", mp4, "-frames:v", "1", "-q:v", "3", join(SAIDA, `${id}-capa.jpg`)]);
    folhaDeRevisao(mp4, linha.duracao, join(SAIDA, `${id}-revisao.jpg`));
    // 6. release no GitHub (substitui os arquivos se já existir)
    const tag = `arquivo-${id}`, anexos = [leve, join(SAIDA, `${id}-capa.jpg`), join(SAIDA, `${id}-revisao.jpg`), narr];
    await subirRelease(tag, `Arquivo 3:33 · ${ep.serie} · Ep. ${ep.episodio}`, anexos);
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
