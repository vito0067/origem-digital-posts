// Som e marcas de qualquer dia feito a partir de dados (do Dia 3 em diante).
// O roteiro segue a ordem da série: as 4 últimas falas são virada estranha, Seu Nilo, amanhã e comenta.
const NUNCA = 1e6;
export const marcas = ({ cenas, tp, ep }) => {
  const n = cenas.length, iVirada = n - 4, iNilo = n - 3, iChamado = n - 2, iComenta = n - 1, iCredito = ep.cena.credito ? 2 : -1;
  const ultima = cenas[0].palavras.at(-1).w.replace(/[*~.,!?:]/g, "");
  const tem = (i, p) => cenas[i].palavras.some((x) => x.w.replace(/[*~.,!?:]/g, "").toLowerCase() === p);
  return {
    iVirada, iNilo, iChamado, iComenta, iCredito,
    onda: tp(0, ultima) + 0.5,
    placaSobe: -1, placaVira: -99, trava: NUNCA, // a placa cinza e o sinal sem vermelho já vêm do Dia 1
    credito: iCredito >= 0 ? cenas[iCredito].vozEm : NUNCA,
    silencio: cenas[iVirada].vozEm,
    reclama: tem(iVirada, "reclama") ? tp(iVirada, "reclama") : cenas[iVirada].vozEm + 1.5,
    nilo: cenas[iNilo].inicio - 0.3,
    regra: tem(iNilo, "governo") ? tp(iNilo, "governo") : NUNCA,
    anotou: tp(iNilo, "anotou"),
    amanha: cenas[iChamado].vozEm,
    interrogacao: tem(iChamado, "sumir") ? tp(iChamado, "sumir") : cenas[iChamado].vozEm + 1,
    comenta: cenas[iComenta].vozEm,
    fim: cenas[iComenta].fim,
  };
};
export function efeitos({ fx, marcas, cenas, rnd, SFX, sino, virada, dobra, buzina, apito, nhac, lapis, ep }) {
  const cena = ep.cena;
  // a virada de tudo que sumiu: dezenas de folhas em onda
  for (let k = 0; k < 40; k++) fx.soma(virada(), marcas.onda + Math.pow(k / 40, 0.8) * 2.2 + rnd() * 0.05, 0.3 + rnd() * 0.25, rnd() * 1.4 - 0.7);
  fx.soma(SFX.impacto(), marcas.onda - 0.02, 0.35); fx.soma(SFX.glitch(), marcas.onda - 0.04, 0.12);
  // abertura: o livro se levanta
  for (let k = 0; k < 12; k++) fx.soma(dobra(), 0.02 + k * 0.1 + rnd() * 0.03, 0.22 + rnd() * 0.2, rnd() - 0.5);
  fx.soma(sino(84, 1.1), 0.02, 0.35);
  // cada voo da câmera faz vento, cada peça que sobe faz barulho de dobra
  cenas.forEach((c, i) => { if (i >= 2 && i !== marcas.iNilo) fx.soma(SFX.whoosh(0.7, true), c.inicio - 0.55, 0.26, i % 2 ? 0.25 : -0.25); });
  fx.soma(SFX.whoosh(1.6, true), cenas[1].inicio - 0.1, 0.25);
  for (const p of cena.pecas ?? []) if (typeof p.em === "number" && p.em > 0) for (let k = 0; k < 4; k++) fx.soma(dobra(), p.em + 0.05 + k * 0.09, 0.3, (p.pos?.[0] ?? 0) > 0 ? 0.2 : -0.2);
  // efeitos marcados no arquivo do dia: { em, tipo, volume }
  const TIPOS = { virada, dobra, nhac, apito, buzina: () => buzina(), pop: SFX.pop, carimbo: SFX.carimbo, clique: SFX.clique, impacto: SFX.impacto, glitch: SFX.glitch, whoosh: () => SFX.whoosh(0.8, false), subida: () => SFX.subida(1.2), lapis: () => lapis(1.2) };
  for (const s of cena.sons ?? []) { if (!TIPOS[s.tipo]) throw new Error("som desconhecido: " + s.tipo); fx.soma(TIPOS[s.tipo](), s.em, s.volume ?? 0.5, s.lado ?? 0); }
  // crédito
  if (marcas.iCredito >= 0) { fx.soma(SFX.pop(), marcas.credito, 0.6); fx.soma(SFX.sucesso(), marcas.credito + 0.5, 0.25); }
  // Seu Nilo: o carimbo da regra e o lápis
  for (let k = 0; k < 4; k++) fx.soma(dobra(), marcas.nilo + 0.08 + k * 0.1, 0.35);
  if (marcas.regra < NUNCA) fx.soma(SFX.carimbo(), marcas.regra + 0.05, 0.6);
  fx.soma(lapis(1.5), marcas.anotou + 0.1, 0.4);
  // final
  fx.soma(SFX.subida(1.2), marcas.interrogacao - 0.8, 0.22); fx.soma(dobra(), marcas.interrogacao + 0.1, 0.9); fx.soma(SFX.carimbo(), marcas.comenta + 0.05, 0.4);
  if (cena.opcoes) cena.opcoes.forEach((o) => fx.soma(SFX.pop(), o.em, 0.5)); // cada opção de voto entra com um pop
  else [0.6, 1.05, 1.5].forEach((d) => fx.soma(SFX.pop(), marcas.comenta + d, 0.55));
  fx.soma(SFX.sucesso(), marcas.fim - 1.5, 0.3);
}
