// Confere todos os posts da fila sem renderizar (a rotina roda isto antes do push).
// Uso: node ferramentas/validar-fila.mjs   → sai com erro se algum post tiver problema.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { validar } from "./validar.mjs";

const fila = fileURLToPath(new URL("../fila/", import.meta.url));
let ruins = 0;
for (const id of readdirSync(fila)) {
  const caminho = join(fila, id, "post.json");
  if (!existsSync(caminho)) continue;
  let problemas;
  try { problemas = validar(JSON.parse(readFileSync(caminho, "utf8")), id); }
  catch (e) { problemas = [`JSON inválido: ${e.message}`]; }
  if (problemas.length) { ruins++; console.log(`✗ ${id}\n  - ${problemas.join("\n  - ")}`); }
  else console.log(`✓ ${id}`);
}
if (ruins) { console.log(`\n${ruins} post(s) com problema. Corrija antes do push.`); process.exit(1); }
console.log("\nTudo certo.");
