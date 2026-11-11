// Uma etapa da fábrica de episódios para o Arquivo 3:33 (posts-automaticos\fabrica). Termina com 0 se passou e != 0 se falhou.
// Uso: node ferramentas/etapa.mjs <etapa> <episodio>
//   etapa: roteiro | voz | ritmo | render | som | medir | quadros | kit
//   episodio: nome do JSON em episodios/ sem ".json" (ex.: pe03) ou o id (ex.: proxima-estacao-ep03)
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { spawnSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { CAM_V2 } from "../motor/camv2.mjs";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const [, , etapa, nome] = process.argv;
if (!etapa || !nome) { console.error("Uso: node ferramentas/etapa.mjs <etapa> <episodio>"); process.exit(1); }
const falha = (msg, cod = 2) => { console.error("FALHOU:", msg); process.exit(cod); };

// acha o JSON do episódio
let arqEp = join(RAIZ, "episodios", `${nome}.json`);
if (!existsSync(arqEp)) {
  const achado = readdirSync(join(RAIZ, "episodios")).filter((f) => f.endsWith(".json")).find((f) => { try { return JSON.parse(readFileSync(join(RAIZ, "episodios", f), "utf8")).id === nome; } catch { return false; } });
  if (!achado) falha(`não achei episodios/${nome}.json nem um episódio com id "${nome}"`, 1);
  arqEp = join(RAIZ, "episodios", achado);
}
const ep = JSON.parse(readFileSync(arqEp, "utf8")), id = ep.id;
const rodar = (cmd, args) => { const r = spawnSync(cmd, args, { cwd: RAIZ, stdio: "inherit", shell: false }); if (r.status !== 0) process.exit(r.status || 1); };
// render e quadros: o navegador do render às vezes demora mais de 25 s para abrir nesta máquina (ex.: com outro perfil renderizando);
// tenta de novo até 3 vezes, com 20 s de folga, antes de dar a etapa como falha
const rodar3 = (cmd, args) => { for (let k = 1; k <= 3; k++) { const r = spawnSync(cmd, args, { cwd: RAIZ, stdio: "inherit", shell: false }); if (r.status === 0) return; if (k < 3) { console.log(`tentativa ${k} falhou; nova tentativa em 20 s`); spawnSync(process.execPath, ["-e", "setTimeout(()=>{},20000)"]); } else process.exit(r.status || 1); } };
const PY = (() => { const p = join(process.env.LOCALAPPDATA ?? "", "Programs", "Python", "Python312", "python.exe"); return existsSync(p) ? p : "python"; })();
const FF = (() => { try { return execFileSync(PY, ["-c", "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"], { encoding: "utf8" }).trim(); } catch { return "ffmpeg"; } })();
const final = join(RAIZ, "saida", `${id}-14lufs.mp4`);

if (etapa === "roteiro") {
  const erros = [], avisos = [], cenas = ep.cenas ?? [];
  if (!cenas.length) erros.push("sem cenas");
  const ultima = cenas[cenas.length - 1] ?? {};
  if (!(ultima.extras ?? []).some((e) => e.tipo === "aposta" && /Comente 1/.test(e.texto))) erros.push("a última cena não tem o cartão de voto (aposta com \"Comente 1 ... ou 2 ...\")");
  if (!/coment/i.test(ultima.fala ?? "")) erros.push("a pergunta do voto não é falada na última cena");
  const div = cenas.filter((c) => c.visual?.tipo === "divulgacao");
  if (!div.some((c) => /GUIA/.test(JSON.stringify(c)))) erros.push("falta a divulgação curta \"Comente GUIA\" no meio");
  const leg = ep.publicar?.legenda ?? "";
  if (!/GUIA/.test(leg)) erros.push("a legenda não tem \"Comente GUIA\"");
  if (!/intelig[eê]ncia artificial/i.test(leg)) erros.push("a legenda não avisa que é feita com inteligência artificial");
  const palavras = cenas.reduce((n, c) => n + (c.fala ?? "").split(/\s+/).filter(Boolean).length, 0), est = palavras / 2.2;
  if (est < 44 || est > 60) avisos.push(`duração estimada ${est.toFixed(0)} s pelas ${palavras} palavras (meta 48 a 58 s)`);
  for (const c of cenas) for (const p of c.visual?.planos ?? []) if (!p.startsWith("v2/")) avisos.push(`plano antigo sem o motor: ${p}`); else if (!CAM_V2[p]) erros.push(`plano ${p} não existe em motor/camv2.mjs`);
  const g = cenas[0]?.visual; if (g?.tipo === "3d" && (g.planos?.length ?? 0) < 2) erros.push("o gancho precisa de 2+ planos (1º corte em até 2 s)");
  for (const a of avisos) console.log("aviso:", a);
  if (erros.length) falha("\n - " + erros.join("\n - "));
  console.log(`roteiro ok (${cenas.length} cenas, ~${est.toFixed(0)} s)`);
} else if (etapa === "voz") {
  // gerar voz custa créditos e pede o ok do orçamento: aqui só confere se os arquivos existem
  const faltam = [ep.narracao, ...ep.cenas.map((c) => c.avulsa?.arquivo)].filter(Boolean).filter((f) => !existsSync(join(RAIZ, "public", f)));
  if (faltam.length) falha("falta a narração: " + [...new Set(faltam)].join(", ") + ". Gere pela conversa (Higgsfield, Gideon, até 5 créditos) e rode de novo.");
  console.log("voz ok");
} else if (etapa === "ritmo") {
  rodar(process.execPath, ["ferramentas/preparar-caso.mjs", arqEp]);   // linha do tempo + som
  rodar(process.execPath, ["ferramentas/conferir-ritmo-v2.mjs", id]);
} else if (etapa === "render") {
  rodar3(process.execPath, ["ferramentas/renderizar.mjs", id]);
} else if (etapa === "som") {
  rodar(process.execPath, ["motor/normalizar-som.mjs", join("saida", `${id}.mp4`)]);
} else if (etapa === "medir") {
  if (!existsSync(final)) falha(`falta ${final} (rode a etapa som)`, 1);
  const pasta = join(RAIZ, "testes", "medidas", id);
  rodar(PY, ["ferramentas/medir-ab.py", pasta, `${id}=${id}-14lufs.mp4`]);
  const m = JSON.parse(readFileSync(join(pasta, "medidas.json"), "utf8"))[0], ruins = [];
  if (m.volume_LUFS == null || Math.abs(m.volume_LUFS + 14) > 0.5) ruins.push(`volume ${m.volume_LUFS} LUFS (meta -14 ± 0,5)`);
  if (m.parte_parada_pct >= 20) ruins.push(`câmera parada ${m.parte_parada_pct}% (meta < 20%)`);
  if (m.movimento_medio <= 5) ruins.push(`movimento ${m.movimento_medio} (meta > 5)`);
  if (m.duracao_s < 45 || m.duracao_s > 60) ruins.push(`duração ${m.duracao_s} s (meta 48 a 58 s)`);
  if (ruins.length) falha(ruins.join("; "));
  console.log(`medidas ok: movimento ${m.movimento_medio}, parado ${m.parte_parada_pct}%, ${m.volume_LUFS} LUFS, ${m.duracao_s} s. Mosaico em ${pasta}`);
} else if (etapa === "quadros") {
  const linha = JSON.parse(readFileSync(join(RAIZ, "public", "ep", `${id}.json`), "utf8"));
  const tempos = [];
  for (const c of linha.cenas) { const pl = c.visual.planos ?? [null], pe = c.visual.pesos ?? pl.map(() => 1), tot = pe.reduce((a, b) => a + b, 0); let t = c.inicio; pl.forEach((_, k) => { const d = (pe[k] / tot) * (c.fim - c.inicio); tempos.push((t + d / 2).toFixed(2)); t += d; }); }
  rodar3(process.execPath, ["ferramentas/quadros.mjs", id, ...tempos]);
  const pasta = join(RAIZ, "testes", "quadros"), folha = join(pasta, `${id}-folha.jpg`);
  const py = `from PIL import Image\nT=${JSON.stringify(tempos)}\nims=[Image.open(r'${pasta}'+'/${id}-'+t+'.jpg').resize((216,384)) for t in T]\nC=7;W=Image.new('RGB',(216*C,384*((len(ims)+C-1)//C)))\nfor i,im in enumerate(ims): W.paste(im,((i%C)*216,(i//C)*384))\nW.save(r'${folha}',quality=80)`;
  rodar(PY, ["-c", py]);
  console.log("folha de quadros:", folha);
} else if (etapa === "kit") {
  if (!existsSync(final)) falha(`falta ${final} (rode render e som)`, 1);
  const pub = ep.publicar ?? {}, pasta = join(homedir(), "Desktop", "Origem-Digital", "arquivo-333-envios", `celular-${id}`);
  mkdirSync(pasta, { recursive: true });
  copyFileSync(final, join(pasta, `${id}.mp4`));
  const capa = join(pasta, `${id}-capa.jpg`);
  const r = spawnSync(FF, ["-loglevel", "error", "-y", "-ss", String(pub.capaEm ?? 1), "-i", final, "-frames:v", "1", "-q:v", "2", capa]);
  if (r.status !== 0) falha("não consegui tirar a capa");
  const txt = [`EPISÓDIO: ${ep.serie} · ep. ${ep.episodio} · ${ep.titulo}`, "", "LEGENDA (Instagram e TikTok):", pub.legenda ?? "", "", "COMENTÁRIO DO VOTO (fixar):", pub.comentario ?? "", "", "YOUTUBE · título:", pub.tituloYoutube ?? "", "", "YOUTUBE · descrição:", pub.descricaoYoutube ?? "", "", "Marcar: conteúdo gerado por IA. TikTok: só pelo celular do Vito. Publicar só depois do \"aprovado\" do Vito."].join("\n");
  writeFileSync(join(pasta, "texto-para-copiar.txt"), txt);
  if (!pub.legenda || !pub.comentario) falha(`kit montado em ${pasta}, mas falta legenda ou comentário no bloco "publicar"`);
  console.log("kit pronto:", pasta);
} else falha(`etapa desconhecida: ${etapa}`, 1);
