// Trilhas do Hoje Sumiu compostas em código (Dia 8 em diante). Cada dia escolhe uma em `cena.trilha`:
// { nome, constroi: [tempos], climax: tempo }. A música começa mínima, ganha uma camada a cada tempo de
// `constroi` (as consequências), fica em silêncio 1,1 s antes do `climax`, bate no clímax, fica triste na
// virada (marcas.silencio até marcas.amanha) e volta leve no final. Alterne as receitas de um dia para o outro.
import { SFX, pad, pluck, bumbo, chimbal, palma, sino, baixo, filtro, decai } from "../../arquivo-333/ferramentas/sintetizador.mjs";

export const RECEITAS = {
  // noturna: caixinha de música em ré menor, 84 BPM, sobe para batida suave. Boa para temas de noite, casa, corpo.
  noturna: { bpm: 84, acordes: [[62, 65, 69], [58, 62, 65], [65, 69, 72], [60, 64, 67]], baixos: [38, 34, 41, 36], arpejo: [0, 2, 1, 2, 0, 2, 1, 2], oitava: 24, timbre: "sino", brilho: 900 },
  // marcha: ostinato em lá menor, 128 BPM, staccato e bumbo reto. Boa para cidade, trabalho, pressa, dinheiro.
  marcha: { bpm: 128, acordes: [[57, 60, 64], [57, 60, 64], [53, 57, 60], [55, 59, 62]], baixos: [33, 33, 29, 31], arpejo: [0, 0, 2, 0, 1, 0, 2, 1], oitava: 12, timbre: "pluck", brilho: 1500 },
  // misterio: tons inteiros em mi, 76 BPM, sinos soltos e baixo pedal. Boa para natureza, céu, coisas estranhas.
  misterio: { bpm: 76, acordes: [[64, 68, 70], [62, 66, 70], [64, 68, 72], [60, 64, 68]], baixos: [40, 40, 38, 36], arpejo: [0, 2, 1, 2, 2, 1, 0, 1], oitava: 24, timbre: "sino", brilho: 700 },
};

export function compor(m, { nome, duracao, marcas, constroi = [], climax }) {
  const R = RECEITAS[nome]; if (!R) throw new Error("trilha desconhecida: " + nome);
  const b = 60 / R.bpm, cp = 4 * b, silIni = climax !== undefined ? climax - 1.1 : 1e6;
  const nivel = (x) => constroi.filter((c) => c <= x + 0.01).length + (climax !== undefined && x >= climax ? 2 : 0);
  const toca = (x) => !(x >= silIni && x < climax) && !(x >= marcas.silencio - 0.1 && x < marcas.amanha - 0.1);
  const nota = (n, seg) => (R.timbre === "pluck" ? decai(filtro(pluck(n, seg, 0.8), "passa-alta", 160), seg * 0.35, 0.001) : sino(n, seg, 0.5));
  for (let c = 0; c * cp < duracao + 1; c++) {
    const ini = c * cp, a = R.acordes[c % 4], bx = R.baixos[c % 4];
    const triste = ini >= marcas.silencio - 0.1 && ini < marcas.amanha - 0.1;
    if (triste) { m.soma(pad(a.map((n) => n - 12), cp + 0.4, { brilho: 600, ataque: 0.6 }), ini, 0.28); m.soma(sino(a[0] + 12, 1.6, 0.4), ini, 0.3, -0.2); continue; }
    for (let k = 0; k < 8; k++) {
      const x = ini + k * (b / 2); if (!toca(x)) continue; const L = nivel(x);
      if (k % 2 === 0 || L >= 3) m.soma(nota(a[R.arpejo[k] % 3] + R.oitava, 0.6), x, L >= 3 ? 0.34 : 0.28, k % 2 ? 0.3 : -0.3);
      if (L >= 1 && k % 2 === 0) m.soma(baixo(bx + 12, b * 0.9), x, 0.32);
      if (L >= 2) { m.soma(chimbal(), x + b / 4, 0.12); if (k % 4 === 0) m.soma(bumbo(0.6), x, 0.5); }
      if (L >= 4 && k % 4 === 2) m.soma(palma(), x, 0.22);
    }
    if (toca(ini)) m.soma(pad(a, cp + 0.3, { brilho: R.brilho + 250 * nivel(ini), ataque: 0.4 }), ini, 0.08 + 0.025 * Math.min(4, nivel(ini)));
  }
  if (climax !== undefined) { m.soma(SFX.subida(1.0), silIni - 1.0, 0.25); m.soma(SFX.impacto(), climax - 0.02, 0.7); }
}
