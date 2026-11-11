// Confere o ritmo de um episódio ANTES de renderizar (motor v2): primeiro corte, novidade a cada 3 s e câmera parada.
// Uso: node ferramentas/conferir-ritmo-v2.mjs proxima-estacao-ep02-v2teste
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { sequencia, conferirRitmo } from "../../motor-v2/index.mjs";
import { CAM_V2 } from "../src/motor3d/camv2.mjs";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const id = process.argv[2];
const ep = JSON.parse(readFileSync(join(RAIZ, "public", "ep", `${id}.json`), "utf8"));
const planosCam = [], cenas = [], eventos = [];
for (const c of ep.cenas) {
  if (c.visual.tipo === "3d") {
    const pl = c.visual.planos, pe = c.visual.pesos ?? pl.map(() => 1), tot = pe.reduce((a, b) => a + b, 0); let t = c.inicio;
    pl.forEach((nome, k) => {
      const d = (pe[k] / tot) * (c.fim - c.inicio), v = CAM_V2[nome];
      cenas.push({ inicio: t, fim: t + d }); if (v && v.cam) planosCam.push({ inicio: t, fim: t + d, plano: v.cam, entrada: v.entrada, tremor: v.tremor }); t += d;
    });
  } else cenas.push({ inicio: c.inicio, fim: c.fim });   // cartão de divulgação etc.: uma imagem nova inteira
  for (const e of c.extras ?? []) if (e.em !== undefined) eventos.push(+(c.inicio + e.em).toFixed(2));
}
if (planosCam.length) { /* só os trechos em 3D entram na medida de câmera */ }
const camera = planosCam.length === cenas.length ? sequencia(planosCam) : undefined;
const r = conferirRitmo({ cenas, camera, dur: ep.duracao, eventos });
console.log(`${id}: ${cenas.length} planos, cortes em`, r.cortes.map((x) => x.toFixed(1)).join(", "));
console.log("primeiro corte:", r.cortes[0]?.toFixed(2), "s");
if (r.medidas) console.log("câmera: parada em", r.medidas.paradoPct + "%", "movimento médio", r.medidas.movimentoMedio);
console.log(r.ok ? "RITMO OK" : "AVISOS:\n - " + r.avisos.join("\n - "));
