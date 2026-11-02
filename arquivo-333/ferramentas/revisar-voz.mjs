// Procura, nas falas de um episódio, palavras de pronúncia arriscada para a voz (ElevenLabs erra a sílaba tônica).
// Uso: node ferramentas/revisar-voz.mjs episodios/ep09.json [...]    (a lista de palavras está em referencia/voz.md)
// Sai com código 1 se achar palavra PROIBIDA, para a rotina não gerar a voz com ela.
import { readFileSync } from "node:fs";

// Troque a palavra proibida na `fala` (e na `legenda`) antes de gerar a voz.
const PROIBIDAS = {
  celular: "telefone (a voz já pôs a tônica no C: 'CElular')",
  celulares: "telefones",
};
// Oxítonas e outras que costumam sair erradas: se der, troque; se ficar, avise o Vito para ouvir.
const VIGIADAS = ["jornal", "apagão", "moletom", "elevador", "síndica", "degraus", "papel", "hotel", "lençol", "sinal", "portal", "cartão", "porão", "porteiro"];

const norm = (s) => s.toLowerCase().normalize("NFC");
let proibida = false;
for (const arq of process.argv.slice(2)) {
  const ep = JSON.parse(readFileSync(arq, "utf8"));
  console.log(`\n${arq}`);
  ep.cenas.forEach((c, i) => {
    const fala = c.fala ?? "";
    if (!fala) return;
    const palavras = norm(fala).match(/[\p{L}\p{N}º°]+/gu) ?? [];
    const avisos = [];
    for (const w of palavras) {
      if (PROIBIDAS[w]) { avisos.push(`PROIBIDA "${w}" → ${PROIBIDAS[w]}`); proibida = true; }
      else if (VIGIADAS.includes(w)) avisos.push(`vigiar "${w}"`);
      else if (/\d/.test(w) || /[º°]/.test(w)) avisos.push(`número ou ordinal na fala "${w}": escreva por extenso`);
    }
    if (/\b[A-Z]{2,}\b/.test(fala)) avisos.push("sigla na fala: evite ou escreva como se lê");
    if (fala.split(",").length > 3) avisos.push("muitas vírgulas: a voz sai corrida, prefira ponto");
    if (avisos.length) console.log(`  fala ${i}: ${fala}\n    - ${[...new Set(avisos)].join("\n    - ")}`);
  });
}
if (proibida) { console.log("\nHá palavra PROIBIDA. Troque antes de gerar a voz."); process.exit(1); }
console.log("\nSem palavra proibida. Depois de gerar, diga ao Vito quais palavras vigiadas ficaram e peça para ele ouvir.");
