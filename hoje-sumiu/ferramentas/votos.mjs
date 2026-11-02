// Conta os votos do dia a partir do texto da página do Reel (só leitura: não comenta, não curte, não posta).
// Uso: node ferramentas/votos.mjs texto-do-reel.txt
// O vencedor é o comentário com mais curtidas. Comentários iguais somam só como desempate.
// A lista de veto pega os casos óbvios; quem decide se o tema vale é sempre quem lê o resultado.
import { readFileSync } from "node:fs";

const VETO = /\b(lula|bolsonaro|trump|presidentes?|governos?|pol[ií]ticos?|prefeitos?|deputados?|senador(es)?|ministros?|stf|pt|deus|jesus|igreja|igrejas|religi[aã]o|c[aâ]ncer|aids|doen[çc]as?|negros?|gays?|mulher(es)?|crian[çc]as?|voc[eê]|eu|minha?|meu)\b/i;
const CONTA = "hojesumiu";

const linhas = readFileSync(process.argv[2], "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const eTempo = (l) => /^\d+\s*(s|min|h|d|sem)$/.test(l);
const votos = [];
for (let i = 0; i < linhas.length; i++) {
  if (!eTempo(linhas[i + 1] ?? "") || i + 2 >= linhas.length) continue;
  const conta = linhas[i], partes = [];
  let j = i + 2, curtidas = 0;
  for (; j < linhas.length; j++) {
    const m = linhas[j].match(/^(\d[\d.]*)\s+curtidas?$/);
    if (m) { curtidas = Number(m[1].replace(/\./g, "")); j++; break; }
    if (linhas[j] === "Curtir") { j++; break; }
    if (linhas[j] === "Responder") break;
    if (eTempo(linhas[j + 1] ?? "")) { j--; break; }
    partes.push(linhas[j]);
  }
  i = j;
  if (conta !== CONTA) votos.push({ conta, texto: partes.join(" "), curtidas });
}
if (!votos.length) throw new Error("nenhum comentário encontrado: confira se o texto veio da página do Reel");

// "o boleto" e "boleto", "bactéria" e "bactérias" contam como o mesmo tema
const chave = (t) => t.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[^\p{L}\p{N} ]/gu, "").trim().replace(/^(o|a|os|as|sem) /, "").replace(/s$/, "");
const iguais = {}; for (const v of votos) { const k = chave(v.texto); iguais[k] = iguais[k] ?? { comentarios: 0, curtidas: 0 }; iguais[k].comentarios++; iguais[k].curtidas += v.curtidas; }
const peso = (v) => iguais[chave(v.texto)].curtidas;
votos.sort((a, b) => b.curtidas - a.curtidas || peso(b) - peso(a)); // empate: ganha o tema com mais curtidas somadas

const vetado = (v) => VETO.test(chave(v.texto));
console.log(`${votos.length} comentários lidos, sem contar os de @${CONTA}.\n`);
votos.slice(0, 15).forEach((v, i) => { const g = iguais[chave(v.texto)]; console.log(`${String(i + 1).padStart(2)}. ${String(v.curtidas).padStart(4)} curtidas  "${v.texto}"  @${v.conta}${g.comentarios > 1 ? `  (${g.comentarios} iguais, ${g.curtidas} curtidas somadas)` : ""}${vetado(v) ? "  << VETO?" : ""}`); });
const certo = votos.find((v) => !vetado(v)), topo = votos[0];
console.log(`\nVencedor provisório: "${certo?.texto}", de @${certo?.conta}, com ${certo?.curtidas} curtidas.`);
const empate = votos.filter((v) => !vetado(v) && v !== certo && v.curtidas === certo?.curtidas);
if (empate.length) console.log(`Empate em curtidas com ${empate.map((v) => `"${v.texto}", de @${v.conta}`).join(" e ")}. Desempatei pelas curtidas somadas do tema.`);
console.log(certo === topo ? 'Rótulo do cartão: "O MAIS CURTIDO".' : `Rótulo do cartão: "O MAIS CURTIDO QUE VALIA" ("${topo.texto}" teve mais curtidas e parece vetado).`);
console.log("Confira com os olhos: a lista de veto não reconhece todo nome de pessoa, marca ou tema que humilhe alguém.");
