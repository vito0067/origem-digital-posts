// Monta a pasta que o Vito usa para postar no TikTok pelo celular: vídeo, capa e um texto para copiar e colar.
// Uso: node ferramentas/kit-celular.mjs 3
// Lê publicacao/diaNN.md. A seção "Legenda TikTok" tem prioridade sobre "Legenda (Instagram e TikTok)";
// a seção "Aviso para o celular", se houver, vem primeiro no texto.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const nn = String(process.argv[2] ?? "").padStart(2, "0");
if (nn === "00" || nn === "") throw new Error("diga o número do dia: node ferramentas/kit-celular.mjs 3");
const md = readFileSync(join(RAIZ, "publicacao", `dia${nn}.md`), "utf8");
const secao = (titulo) => md.match(new RegExp(`^## ${titulo.replace(/[()]/g, "\\$&")}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"))?.[1].trim();
const legenda = secao("Legenda TikTok") ?? secao("Legenda (Instagram e TikTok)");
const comentario = secao("Comentário para fixar");
if (!legenda || !comentario) throw new Error(`faltam a legenda ou o comentário em publicacao/dia${nn}.md`);

const destino = join(homedir(), "Desktop", "Origem-Digital", "hoje-sumiu-envios", `celular-dia${nn}`);
mkdirSync(destino, { recursive: true });
for (const arq of [`hoje-sumiu-dia${nn}.mp4`, `hoje-sumiu-dia${nn}-capa.jpg`]) copyFileSync(join(RAIZ, "saida", "enviar", arq), join(destino, arq));
const aviso = secao("Aviso para o celular");
writeFileSync(join(destino, "texto-para-copiar.txt"), [
  ...(aviso ? [aviso, ""] : []),
  "LEGENDA (copie e cole)", "", legenda, "",
  "COMENTÁRIO (poste e fixe depois de publicar)", "", comentario, "",
  "ANTES DE PUBLICAR", "", "Ligue o rótulo de conteúdo gerado por IA.", "",
].join("\r\n"), "utf8");
console.log("kit pronto em", destino);
