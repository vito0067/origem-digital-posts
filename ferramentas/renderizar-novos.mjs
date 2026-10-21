// Usado pelo GitHub Actions: renderiza os posts da fila que são novos ou mudaram, e apaga as mídias
// de posts com mais de 30 dias (o Instagram já guardou a cópia dele). Escreve "novos=id1,id2" para o passo seguinte.
import { appendFileSync, existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { RAIZ, atualizarIndice, hashPost, renderizar } from "./renderizar.mjs";

const fila = join(RAIZ, "fila"), docs = join(RAIZ, "docs");
const pendentes = existsSync(fila) ? readdirSync(fila).filter((id) => existsSync(join(fila, id, "post.json"))).filter((id) => {
  const pub = join(docs, id, "post.json");
  return !existsSync(pub) || JSON.parse(readFileSync(pub, "utf8")).hash !== hashPost(readFileSync(join(fila, id, "post.json"), "utf8"));
}) : [];

const limite = Date.now() - 30 * 86400e3;
if (existsSync(docs)) for (const id of readdirSync(docs)) {
  const pub = join(docs, id, "post.json");
  if (existsSync(pub) && Date.parse(JSON.parse(readFileSync(pub, "utf8")).publicar_em) < limite) { rmSync(join(docs, id), { recursive: true, force: true }); console.log("mídia antiga apagada:", id); }
}

// Um post com erro não impede os outros.
const feitos = [], erros = [];
for (const id of pendentes) {
  try { feitos.push(...(await renderizar([join(fila, id, "post.json")]))); }
  catch (e) { erros.push(`${id}: ${e.message ?? e}`); console.error(e.message ?? e); }
}
atualizarIndice();
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `novos=${feitos.join(",")}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `erros=${erros.length ? Buffer.from(erros.join("\n")).toString("base64") : ""}\n`);
}
console.log(`renderizados: ${feitos.length} · com erro: ${erros.length}`);
