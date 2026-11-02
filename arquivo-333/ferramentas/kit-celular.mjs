// Monta a pasta que o Vito usa para postar um episódio no TikTok pelo celular (vídeo, capa e texto para copiar).
// Uso: node ferramentas/kit-celular.mjs 9   (a "Pergunta para fixar" vem de publicacao/ep09.md)
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const nn = String(process.argv[2] ?? "").padStart(2, "0");
const ep = JSON.parse(readFileSync(join(RAIZ, "episodios", `ep${nn}.json`), "utf8"));
const notas = readFileSync(join(RAIZ, "publicacao", `ep${nn}.md`), "utf8");
const pergunta = notas.match(/## Pergunta para fixar\s+(.+)/)?.[1]?.trim();
if (!pergunta) throw new Error(`falta "## Pergunta para fixar" em publicacao/ep${nn}.md`);

const envios = join(homedir(), "Desktop", "Origem-Digital", "arquivo-333-envios"), pasta = join(envios, `celular-ep${nn}`);
mkdirSync(pasta, { recursive: true });
for (const nome of [`${ep.id}-upload.mp4`, `${ep.id}-capa.jpg`]) {
  const origem = join(envios, nome);
  if (!existsSync(origem)) throw new Error(`falta ${origem}: baixe do release arquivo-${ep.id}`);
  copyFileSync(origem, join(pasta, nome.replace("-upload", "")));
}
const [a, m, d] = ep.publicar.data.split("-");
writeFileSync(join(pasta, "texto-para-copiar.txt"), `POSTE EM ${d}/${m}/${a}, ÀS ${ep.publicar.hora}, NA CONTA @arquivo333.0

LEGENDA (copie e cole)

${ep.publicar.legenda}

COMENTÁRIO (poste e fixe depois de publicar)

${pergunta}

ANTES DE PUBLICAR

Use a capa desta pasta e ligue o rótulo de conteúdo gerado por IA.
`);
console.log("kit pronto em", pasta);
