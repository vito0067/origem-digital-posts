// Trilha original de cada Reel, composta em código no tempo exato das cenas (música + efeitos).
import { linhaDoTempo, tempoMensagens } from "../src/post/tempos.ts";
import { Faixa, SFX, salvarWav, TAXA } from "./sintetizador.mjs";
import { secao, acordeFinal } from "./mixagem.mjs";

const palavras = (t = "") => t.replace(/\*/g, "").split(/\s+/).filter(Boolean).length;

const Fmaj7 = { notas: [53, 57, 60, 64], baixo: 41 };
const CE = { notas: [52, 55, 60, 62], baixo: 40 };
const G6 = { notas: [55, 59, 62, 64], baixo: 43 };
const Am7 = { notas: [57, 60, 64, 67], baixo: 45 };

/** Gera o .wav da trilha de um post (formato reel) em `saida`. */
export function gerarTrilha(post, saida) {
  const lt = linhaDoTempo(post.cenas);
  const D = lt.total;
  const animado = (post.musica?.clima ?? "animado") === "animado";
  const bpm = animado ? 108 : 90;
  const prog = animado ? [Fmaj7, CE, G6, Am7] : [Am7, Fmaj7, CE, G6];
  const abertura = lt.itens[0]?.dur ?? 2;

  // ---------- música: abertura só com harmonia, depois a batida entra, e o acorde final no cartão
  const musica = new Faixa(D + 1);
  musica.somaEstereo(secao({ ini: 0, fim: abertura, bpm, acordes: prog, pad: { vol: 0.5, brilho: 1400, ataque: 0.3 }, baixo: "longo", bumbo: "nada", arpejo: { vol: 0.14, brilho: 0.5 }, fadeIn: 0.4, fadeOut: 0.2 }), 0);
  musica.somaEstereo(secao({ ini: abertura, fim: lt.final, bpm, acordes: prog, pad: { vol: 0.42, brilho: animado ? 2300 : 1600, ataque: 0.15 },
    baixo: animado ? "oito" : "pulso", bumbo: animado ? "quatro" : "meio", palma: animado, chimbal: animado ? "dezesseis" : "oito",
    arpejo: { vol: 0.17, brilho: 0.55 }, fadeIn: 0.1, fadeOut: 0.3 }), abertura);
  musica.somaEstereo(acordeFinal([55, 60, 64, 67, 72], 36, D - lt.final + 0.3), lt.final);

  // ---------- efeitos, nos mesmos tempos das animações (src/post/cenas.tsx)
  const ef = new Faixa(D + 1);
  lt.itens.forEach((it, i) => {
    const c = post.cenas[i];
    if (i > 0) ef.soma(SFX.whoosh(0.5), it.ini - 0.25, 0.35);
    if (c.tipo === "conversa") tempoMensagens(c.mensagens).forEach((m, k) => {
      if (m.digitaDe !== null) ef.soma(SFX.pop(), it.ini + m.digitaDe, 0.2, -0.3);
      if (c.mensagens[k].de === "cliente") ef.soma(SFX.enviar(), it.ini + m.aparece - 0.28, 0.6, 0.4);
      else { ef.soma(SFX.pop(), it.ini + m.aparece, 0.7, -0.3); ef.soma(SFX.sucesso(), it.ini + m.aparece + 0.08, 0.35, -0.3); }
    });
    if (c.tipo === "lista") c.itens.forEach((_, k) => ef.soma(SFX.pop(), it.ini + 0.6 + palavras(c.titulo) * 0.07 + k * 1.0, 0.45, -0.4 + k * 0.2));
    if (c.tipo === "numero") for (let t = 0.25; t < 1.4; t += 0.09) ef.soma(SFX.tique(), it.ini + t, 0.22, 0.2);
  });
  ef.soma(SFX.whoosh(0.6), lt.final - 0.3, 0.4);
  ef.soma(SFX.brilho(), lt.final + 1.0, 0.55);
  ef.soma(SFX.pop(), lt.final + 1.6, 0.55);

  // ---------- mix: música um pouco abaixo dos efeitos e saída suave no fim
  const m = new Faixa(D);
  for (let i = 0; i < m.L.length; i++) {
    const t = i / TAXA, fim = t > D - 0.5 ? Math.max(0, (D - t) / 0.5) : 1;
    m.L[i] = ((musica.L[i] ?? 0) * 0.55 + (ef.L[i] ?? 0) * 0.6) * fim;
    m.R[i] = ((musica.R[i] ?? 0) * 0.55 + (ef.R[i] ?? 0) * 0.6) * fim;
  }
  salvarWav(saida, m, -1.5);
}
