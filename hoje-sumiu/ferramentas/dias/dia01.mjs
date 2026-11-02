// Dia 1: a cor vermelha. Momentos da história e efeitos de papel deste episódio.
export const marcas = ({ cenas, tp }) => ({
  onda: tp(0, "vermelha") + 0.55,          // o vermelho começa a virar do avesso
  entao: tp(3, "Então"),
  sobrou: tp(3, "Sobrou"),
  placaSobe: tp(4, "placa", 0) - 0.5,      // a placa de pare sobe vermelha...
  placaVira: tp(4, "Agora"),               // ...e vira cinza
  trava: cenas[5].vozEm,                   // o trânsito para
  caminhao: cenas[6].vozEm,
  mercado: cenas[7].inicio - 0.35,
  moranguinhos: tp(7, "morango") + 0.2,
  maduro: tp(7, "maduro"),
  mordida: tp(7, "mordida"),
  azedo: tp(7, "mordida") + 0.42,
  campo: cenas[8].inicio - 0.35,
  apito: tp(8, "juiz"),
  cartao: tp(8, "cartão"),
  cartaoVira: tp(8, "Só", 0),
  papel: tp(8, "papel"),
  ombros: tp(8, "olha"),
  silencio: cenas[9].vozEm,
  reclama: tp(9, "reclama"),
  nilo: cenas[10].inicio - 0.3,
  anotou: tp(10, "anotou"),
  amanha: cenas[11].vozEm,
  interrogacao: tp(11, "sumir"),
  comenta: cenas[12].vozEm,
  curtido: tp(12, "curtido"),
  fim: cenas[12].fim,
});
export function efeitos({ fx, marcas, cenas, rnd, SFX, sino, virada, dobra, buzina, apito, nhac, lapis }) {
// a virada de todos os vermelhos: dezenas de folhas em onda
for (let k = 0; k < 46; k++) fx.soma(virada(), marcas.onda + Math.pow(k / 46, 0.8) * 2.6 + rnd() * 0.05, 0.3 + rnd() * 0.25, rnd() * 1.4 - 0.7);
fx.soma(SFX.impacto(), marcas.onda - 0.02, 0.35); fx.soma(SFX.glitch(), marcas.onda - 0.04, 0.12);
// abertura: o livro se levanta
for (let k = 0; k < 12; k++) fx.soma(dobra(), 0.02 + k * 0.1 + rnd() * 0.03, 0.22 + rnd() * 0.2, rnd() - 0.5);
fx.soma(sino(84, 1.1), 0.02, 0.35);
// voos da câmera entre os lugares
cenas.forEach((c, i) => { if (i >= 2 && i !== 3 && i !== 10) fx.soma(SFX.whoosh(0.7, true), c.inicio - 0.55, 0.26, i % 2 ? 0.25 : -0.25); });
fx.soma(SFX.whoosh(1.6, true), cenas[1].inicio - 0.1, 0.25);
// semáforo: a luz apaga
fx.soma(SFX.clique(), cenas[3].vozEm + 0.75, 0.9); fx.soma(virada(), cenas[3].vozEm + 0.8, 0.5);
// placa
fx.soma(dobra(), marcas.placaSobe + 0.25, 0.75); fx.soma(virada(), marcas.placaVira, 0.8); fx.soma(SFX.carimbo(), marcas.placaVira + 0.08, 0.3);
// trânsito travado
fx.soma(SFX.carimbo(), marcas.trava + 0.05, 0.4);
[0.15, 0.55, 0.95, 1.3, 1.8, 2.15, 2.7].forEach((d, k) => fx.soma(buzina(360 + (k % 3) * 70, 0.22 + (k % 2) * 0.1), marcas.trava + d, 0.24 + (k % 3) * 0.05, k % 2 ? 0.5 : -0.5));
[0.2, 1.1, 1.8].forEach((d) => fx.soma(buzina(330, 0.45), marcas.caminhao + d, 0.14, 0.2));
// mercado
for (let k = 0; k < 5; k++) fx.soma(dobra(), marcas.mercado + 0.1 + k * 0.1, 0.4, 0.2);
for (let k = 0; k < 8; k++) fx.soma(virada(), marcas.moranguinhos + k * 0.07, 0.35, 0.2);
fx.soma(nhac(), marcas.mordida + 0.05, 0.85); fx.soma(SFX.pop(), marcas.azedo + 0.05, 0.5);
// futebol
for (let k = 0; k < 6; k++) fx.soma(dobra(), marcas.campo + 0.1 + k * 0.09, 0.4, -0.2);
fx.soma(apito(), marcas.apito - 0.1, 0.42); fx.soma(virada(), marcas.cartaoVira, 0.75);
// Seu Nilo
for (let k = 0; k < 4; k++) fx.soma(dobra(), marcas.nilo + 0.08 + k * 0.1, 0.35);
fx.soma(lapis(1.5), marcas.anotou + 0.1, 0.4);
// final
fx.soma(SFX.subida(1.2), marcas.interrogacao - 0.8, 0.22); fx.soma(dobra(), marcas.interrogacao + 0.1, 0.9); fx.soma(SFX.carimbo(), marcas.comenta + 0.05, 0.4);
[0.6, 1.05, 1.5].forEach((d) => fx.soma(SFX.pop(), marcas.comenta + d, 0.55));
fx.soma(SFX.sucesso(), marcas.fim - 1.5, 0.3);
}
