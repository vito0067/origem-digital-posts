// Dia 2: o frio. Momentos da história e efeitos de papel deste episódio.
const NUNCA = 1e6; // o trânsito deste dia não trava
export const marcas = ({ cenas, tp }) => ({
  onda: tp(0, "frio") + 0.5,               // tudo que é frio vira do avesso
  placaSobe: -1, placaVira: -99, trava: NUNCA, // a placa cinza e o sinal sem vermelho já vêm do Dia 1
  credito: cenas[2].vozEm,                 // o cartão de quem comentou
  otimo: tp(3, "ótimo"),
  geladeira: cenas[4].inicio - 0.35,
  porta: tp(4, "porta"),
  arQuente: tp(4, "quente"),
  azedou: tp(4, "azedou"),
  sorveteria: cenas[5].inicio - 0.35,
  fecha: tp(5, "fecha"),
  derrete: tp(5, "derrete"),
  churrasco: cenas[6].inicio - 0.35,
  refri: tp(6, "quente"),
  briga: tp(6, "família"),
  polo: cenas[7].inicio - 0.3,
  gelo: tp(7, "derrete"),
  mar: cenas[8].vozEm,
  praia: tp(8, "praia"),
  mae: cenas[9].inicio - 0.3,
  casaco: tp(9, "mandando"),
  silencio: cenas[10].vozEm,
  reclama: tp(10, "reclama"),
  nilo: cenas[11].inicio - 0.3,
  regra: tp(11, "governo"),
  anotou: tp(11, "anotou"),
  amanha: cenas[12].vozEm,
  interrogacao: tp(12, "sumir"),
  comenta: cenas[13].vozEm,
  curtido: tp(13, "curtido"),
  fim: cenas[13].fim,
});
export function efeitos({ fx, marcas, cenas, rnd, SFX, sino, virada, dobra, lapis }) {
  // a virada de tudo que é frio: dezenas de folhas em onda
  for (let k = 0; k < 40; k++) fx.soma(virada(), marcas.onda + Math.pow(k / 40, 0.8) * 2.2 + rnd() * 0.05, 0.3 + rnd() * 0.25, rnd() * 1.4 - 0.7);
  fx.soma(SFX.impacto(), marcas.onda - 0.02, 0.35); fx.soma(SFX.glitch(), marcas.onda - 0.04, 0.12);
  // abertura: o livro se levanta
  for (let k = 0; k < 12; k++) fx.soma(dobra(), 0.02 + k * 0.1 + rnd() * 0.03, 0.22 + rnd() * 0.2, rnd() - 0.5);
  fx.soma(sino(84, 1.1), 0.02, 0.35);
  // o cartão de quem comentou
  fx.soma(SFX.pop(), marcas.credito, 0.6); fx.soma(SFX.sucesso(), marcas.credito + 0.5, 0.25);
  // voos da câmera entre os lugares
  cenas.forEach((c, i) => { if (i >= 2 && i !== 11) fx.soma(SFX.whoosh(0.7, true), c.inicio - 0.55, 0.26, i % 2 ? 0.25 : -0.25); });
  fx.soma(SFX.whoosh(1.6, true), cenas[1].inicio - 0.1, 0.25);
  // geladeira: a porta abre e o gelo do congelador vira
  for (let k = 0; k < 5; k++) fx.soma(dobra(), marcas.geladeira + 0.1 + k * 0.1, 0.4, -0.2);
  fx.soma(SFX.clique(), marcas.porta, 0.9); fx.soma(SFX.whoosh(0.8, false), marcas.arQuente - 0.1, 0.4);
  for (let k = 0; k < 6; k++) fx.soma(virada(), marcas.porta + 0.1 + k * 0.08, 0.45, -0.2);
  fx.soma(SFX.pop(), marcas.azedou + 0.1, 0.6);
  // sorveteria: a placa fecha e as bolas caem
  for (let k = 0; k < 5; k++) fx.soma(dobra(), marcas.sorveteria + 0.1 + k * 0.1, 0.4, 0.2);
  fx.soma(virada(), marcas.fecha, 0.8); fx.soma(SFX.carimbo(), marcas.fecha + 0.08, 0.3);
  for (let k = 0; k < 3; k++) { fx.soma(virada(), marcas.derrete + k * 0.1, 0.5, 0.2); fx.soma(SFX.pop(), marcas.derrete + 0.45 + k * 0.17, 0.45, 0.2); }
  // churrasco: a conversa corta de repente
  for (let k = 0; k < 6; k++) fx.soma(dobra(), marcas.churrasco + 0.1 + k * 0.08, 0.35);
  fx.soma(SFX.glitch(), marcas.briga, 0.3); fx.soma(SFX.carimbo(), marcas.briga + 0.1, 0.3);
  // polo: o iceberg vira e encolhe
  for (let k = 0; k < 6; k++) fx.soma(virada(), marcas.gelo + k * 0.06, 0.5);
  // o mar sobe
  fx.soma(SFX.subida(1.2), marcas.mar - 0.5, 0.25); fx.soma(SFX.whoosh(1.8, false), marcas.mar, 0.5); fx.soma(SFX.impacto(), marcas.mar + 0.35, 0.2);
  for (let k = 0; k < 4; k++) fx.soma(dobra(), marcas.praia + k * 0.12, 0.35);
  // a mãe
  for (let k = 0; k < 4; k++) fx.soma(dobra(), marcas.mae + 0.1 + k * 0.1, 0.35);
  fx.soma(SFX.pop(), marcas.casaco, 0.6);
  // Seu Nilo: o carimbo da regra e o lápis
  for (let k = 0; k < 4; k++) fx.soma(dobra(), marcas.nilo + 0.08 + k * 0.1, 0.35);
  fx.soma(SFX.carimbo(), marcas.regra + 0.05, 0.6);
  fx.soma(lapis(1.5), marcas.anotou + 0.1, 0.4);
  // final
  fx.soma(SFX.subida(1.2), marcas.interrogacao - 0.8, 0.22); fx.soma(dobra(), marcas.interrogacao + 0.1, 0.9); fx.soma(SFX.carimbo(), marcas.comenta + 0.05, 0.4);
  [0.6, 1.05, 1.5].forEach((d) => fx.soma(SFX.pop(), marcas.comenta + d, 0.55));
  fx.soma(SFX.sucesso(), marcas.fim - 1.5, 0.3);
}
