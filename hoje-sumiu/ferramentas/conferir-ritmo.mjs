// Confere um dia ANTES de renderizar (motor 3D v2, perfil calmo). Leva menos de 1 segundo e não gasta nada.
// Uso: node ferramentas/conferir-ritmo.mjs hoje-sumiu-dia12      (depois do preparar-dia.mjs)
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { conferirDia } from "../motor/camera-calma.mjs";
const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const l = JSON.parse(readFileSync(join(RAIZ, "public", process.argv[2] + ".json"), "utf8"));
const r = conferirDia(l);
console.log(`Duração ${l.duracao.toFixed(1)} s · ${r.eventos.length} novidades na tela · câmera parada em ${r.medidas.paradoPct}% (no perfil calmo pode) · maior passo de câmera ${(r.salto * 100).toFixed(1)}% em ${r.saltoEm} s`);
if (r.medidas.trechosParados.length) console.log("Câmera parada em: " + r.medidas.trechosParados.map((x) => `${x.de}–${x.ate} s`).join(", "));
for (const a of r.avisos) console.log("AVISO  " + a);
for (const a of r.avisosSom) console.log("SOM    " + a);
console.log(r.ok ? "RITMO OK: pode renderizar." : "RITMO COM AVISOS: arrume antes de renderizar.");
process.exit(r.ok ? 0 : 1);
