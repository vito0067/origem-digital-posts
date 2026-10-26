// Corta a narração em falas e mostra os tempos (para montar o episódio).
import { lerAudio } from "./mixagem.mjs";
import { cortarNarracao, trechosDeFala } from "./narracao.mjs";
import { readFileSync } from "node:fs";
const [, , mp3, json] = process.argv;
const ep = JSON.parse(readFileSync(json, "utf8"));
const f = lerAudio(mp3);
const falas = ep.cenas.map((c) => c.fala);
const cortes = cortarNarracao(f, falas);
console.log("duração total", (f.L.length / 44100).toFixed(2), "trechos", trechosDeFala(f).length);
cortes.forEach((c, i) => console.log(i, c.de.toFixed(2), c.ate.toFixed(2), (c.ate - c.de).toFixed(2), falas[i]));
