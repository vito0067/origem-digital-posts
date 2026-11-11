// Etapas do Hoje Sumiu para a fábrica de episódios (posts-automaticos\fabrica). Cada uma sai com código 0 se passou.
// Uso: node ferramentas/etapa.mjs <roteiro|voz|ritmo|render|som|medir|kit> dia12
// O episódio é sempre "diaNN" (ou "diaNN-algo" para testes): episodios/<ep>.json, id hoje-sumiu-<ep>, vídeo saida/hoje-sumiu-<ep>.mp4.
import { existsSync, readFileSync, renameSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const [, , etapa, ep] = process.argv;
if (!etapa || !ep) { console.error("Uso: node ferramentas/etapa.mjs <etapa> diaNN"); process.exit(1); }
const id = "hoje-sumiu-" + ep, video = join(RAIZ, "saida", id + ".mp4"), arqEp = join(RAIZ, "episodios", ep + ".json");
const FF = join(RAIZ, "..", "node_modules", "@remotion", "compositor-win32-x64-msvc", "ffmpeg.exe");
const PY = "C:/Users/User/AppData/Local/Programs/Python/Python312/python.exe";
const falhar = (m) => { console.error("FALHOU: " + m); process.exit(1); };
const rodar = (cmd, args, env = {}) => { const r = spawnSync(cmd, args, { cwd: RAIZ, stdio: "inherit", env: { ...process.env, ...env } }); return r.status === 0; };
const lerEp = () => { if (!existsSync(arqEp)) falhar("não existe " + arqEp); return JSON.parse(readFileSync(arqEp, "utf8")); };
// o que já sumiu do mundo (coerência): estas palavras não podem aparecer como coisa que existe
const SUMIU = ["vermelh", "boleto", "placa", "wi-fi", "wifi", "carro", "ônibus", "moto ", "caminhão", "apartamento", "prédio", "casa ", "janela", "chuveiro", "espelho"];

const ETAPAS = {
  roteiro() {
    const e = lerEp(), av = [], f = e.falas ?? [];
    if (e.id !== id) av.push(`id "${e.id}" devia ser "${id}"`);
    if (f.length < 10 || f.length > 18) av.push(`${f.length} falas (o padrão é de 10 a 18)`);
    f.forEach((x, i) => { const a = x.fala.trim().split(/\s+/).length, b = x.legenda.trim().split(/\s+/).length; if (a !== b) av.push(`fala ${i}: ${a} palavras na fala e ${b} na legenda`); });
    if (!/hoje sumi/i.test(f[0]?.fala ?? "")) av.push('a primeira fala tem que ser o gancho "Hoje sumiu/sumiram..."');
    if (!/comente/i.test(f.at(-1)?.fala ?? "")) av.push("a última fala tem que ser a pergunta falada (comente...)");
    const c = e.cena ?? {};
    if (c.motor !== "livro") av.push('falta cena.motor: "livro"');
    if (!c.credito) av.push("falta cena.credito (quem pediu o tema)");
    if (!c.divulgacao) av.push("falta cena.divulgacao (o guia Sem Câmera)");
    if (!(c.sumiram ?? []).length) av.push("falta cena.sumiram (caderno do Seu Nilo)");
    if (!(c.impactos ?? []).length) av.push("falta cena.impactos (silêncio antes do sumiço)");
    const tema = String(e.coisa ?? "").toLowerCase();
    f.slice(3).forEach((x, i) => { for (const p of SUMIU) if (x.fala.toLowerCase().includes(p) && !tema.includes(p.trim())) av.push(`fala ${i + 3} cita "${p.trim()}", que já sumiu do mundo: confira a coerência`); });
    av.forEach((a) => console.log("AVISO  " + a));
    console.log(av.length ? "ROTEIRO COM AVISOS" : `ROTEIRO OK: ${f.length} falas, tema "${e.coisa}".`);
    process.exit(av.length ? 1 : 0);
  },
  voz() { // não gera voz (crédito só com o Vito sabendo): confere que a narração existe e prepara a linha do tempo e a mixagem
    lerEp(); const mp3 = join(RAIZ, "public", id + ".mp3");
    if (!existsSync(mp3)) falhar(`falta a narração ${mp3}. Gere a voz (Mark, Higgsfield) e junte as falas antes.`);
    if (!rodar("node", ["ferramentas/preparar-dia.mjs", `episodios/${ep}.json`])) falhar("preparar-dia.mjs não terminou");
  },
  ritmo() { if (!rodar("node", ["ferramentas/conferir-ritmo.mjs", id])) process.exit(1); },
  render() { // o navegador às vezes não abre quando outro perfil está renderizando: tenta até 5 vezes
    for (let n = 1; n <= 5; n++) {
      if (rodar("node", ["ferramentas/render.mjs", "Dia"], { EP: id, CONC: process.env.CONC ?? "3" })) { renameSync(join(RAIZ, "saida", "hoje-sumiu-Dia.mp4"), video); console.log("vídeo: " + video); return; }
      console.log(`render: tentativa ${n} falhou; esperando 40 s`); spawnSync(process.execPath, ["-e", "setTimeout(()=>{},40000)"]);
    }
    falhar("o render falhou 5 vezes");
  },
  som() {
    if (!existsSync(video)) falhar("não existe " + video);
    if (!rodar("node", ["motor/normalizar-som.mjs", video], { FFMPEG: FF })) falhar("normalizar-som.mjs falhou");
    renameSync(video.replace(/\.mp4$/, "-14lufs.mp4"), video);
  },
  medir() { // mede e tira a folha de 60 quadros (saida\medicao-motor\mosaico-<id>.png)
    if (!rodar(PY, ["ferramentas/medir-motor.py", id + ".mp4"])) falhar("a medição falhou");
    const m = JSON.parse(readFileSync(join(RAIZ, "saida", "medicao-motor", "medidas.json"), "utf8")).at(-1);
    if (Math.abs(m.volume_LUFS + 14) > 1) falhar(`volume ${m.volume_LUFS} LUFS (a meta é -14, com 1 de folga)`);
    if (statSync(video).size < 1e6) falhar("vídeo pequeno demais");
  },
  kit() { const n = ep.match(/\d+/)?.[0]; if (!n) falhar("episódio sem número"); if (!rodar("node", ["ferramentas/kit-celular.mjs", n])) falhar("kit-celular.mjs falhou (existe publicacao/diaNN.md e a cópia de envio?)"); },
};
if (!ETAPAS[etapa]) falhar("etapa desconhecida: " + etapa);
ETAPAS[etapa]();
