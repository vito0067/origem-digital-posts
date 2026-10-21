// Trilha original de cada Reel, composta em código na mesma grade do vídeo (120 BPM): a batida entra
// no 1º corte, cada corte cai num tempo forte e cada animação tem o seu som (palavra, tecla, mensagem...).
import { linhaDoTempo, tempoMensagens, tempoPalavras, tempoItens, tempoDigitar, BPM, VOZ_ATRASO } from "../src/post/tempos.ts";
import { Faixa, SFX, salvarWav, TAXA } from "./sintetizador.mjs";
import { secao, acordeFinal, mixFinal } from "./mixagem.mjs";

const Fmaj7 = { notas: [53, 57, 60, 64], baixo: 41 };
const CE = { notas: [52, 55, 60, 62], baixo: 40 };
const G6 = { notas: [55, 59, 62, 64], baixo: 43 };
const Am7 = { notas: [57, 60, 64, 67], baixo: 45 };
const Dm9 = { notas: [50, 53, 57, 60, 64], baixo: 38 };
const palavras = (t = "") => t.replace(/\*/g, "").split(/\s+/).filter(Boolean).length;

/**
 * Gera o .wav da trilha de um post (formato reel) em `saida`.
 * `narracao` (opcional) = { faixa, pecas: [{de, ate}], slots: [índice da cena | -1 = cartão final] }.
 */
export function gerarTrilha(post, saida, narracao = null) {
  const lt = linhaDoTempo(post.cenas, post.vozFinalDur);
  const D = lt.total;
  const animado = (post.musica?.clima ?? "animado") === "animado";
  const noite = post.tema === "noite";
  const prog = noite ? [Am7, Fmaj7, Dm9, G6] : animado ? [Fmaj7, CE, G6, Am7] : [Am7, Fmaj7, CE, G6];
  const abertura = lt.itens[0]?.dur ?? 2;

  // ---------- música
  const musica = new Faixa(D + 1);
  musica.somaEstereo(secao({ ini: 0, fim: abertura, bpm: BPM, acordes: prog, pad: { vol: 0.5, brilho: noite ? 1100 : 1500, ataque: 0.2 }, baixo: "longo", bumbo: "nada",
    chimbal: animado ? "oito" : "nada", arpejo: { vol: 0.15, brilho: 0.5 }, fadeIn: 0.15, fadeOut: 0.05 }), 0);
  musica.somaEstereo(secao({ ini: abertura, fim: lt.final, bpm: BPM, acordes: prog, pad: { vol: 0.42, brilho: animado ? 2300 : 1600, ataque: 0.1 },
    baixo: animado ? "oito" : "pulso", bumbo: animado ? "quatro" : "meio", forcaBumbo: 1, palma: true, chimbal: animado ? "dezesseis" : "oito",
    arpejo: { vol: 0.17, brilho: 0.55 }, fadeIn: 0.02, fadeOut: 0.12 }), abertura);
  musica.somaEstereo(acordeFinal([55, 60, 64, 67, 72], 36, D - lt.final + 0.3), lt.final);

  // ---------- efeitos (nos mesmos tempos de src/post/cenas.tsx)
  const ef = new Faixa(D + 1);
  const E = (som, em, vol = 1, pan = 0) => ef.soma(som, em, vol, pan);
  E(SFX.impacto(), 0.02, 0.35);
  lt.itens.forEach((it, i) => {
    const c = post.cenas[i], t0 = it.ini;
    if (i > 0) E(SFX.whoosh(0.6), t0 - 0.32, 0.4, i % 2 ? 0.3 : -0.3);
    switch (c.tipo) {
      case "frase":
        if (/\*/.test(c.texto)) E(SFX.brilho(), t0 + 0.35 + palavras(c.texto.split("*")[0]) * 0.08, 0.3);
        break;
      case "palavras":
        tempoPalavras(c.palavras.length).forEach((t, k) => { E(SFX.toc(), t0 + t, 0.55, k % 2 ? 0.25 : -0.25); E(SFX.pop(), t0 + t, 0.3); });
        break;
      case "digitando": {
        const td = tempoDigitar(c.texto);
        for (let t = 0.6; t < 0.6 + td; t += 0.075) E(SFX.tecla(), t0 + t, 0.45, 0.2);
        break;
      }
      case "conversa": {
        const ts = tempoMensagens(c.mensagens);
        ts.forEach((m, k) => {
          if (m.digitaDe !== null) E(SFX.pop(), t0 + m.digitaDe, 0.2, -0.3);
          if (c.mensagens[k].de === "cliente") E(SFX.enviar(), t0 + m.aparece - 0.28, 0.6, 0.35);
          else { E(SFX.pop(), t0 + m.aparece, 0.7, -0.3); E(SFX.sucesso(), t0 + m.aparece + 0.08, 0.3, -0.3); }
        });
        const pa = ts[c.mensagens.findIndex((m) => m.de === "aurora")]?.aparece ?? 2;
        [0.5, 1.0, 1.5].forEach((d, k) => E(SFX.pop(), t0 + pa + d, 0.35, k % 2 ? 0.5 : -0.5));
        break;
      }
      case "numero":
        for (let t = 0.2; t < 1.7; t += 0.08) E(SFX.tique(), t0 + t, 0.2, 0.2);
        E(SFX.sucesso(), t0 + 1.7, 0.45);
        break;
      case "lista":
        tempoItens(c.itens.length).forEach((t, k) => { E(SFX.pop(), t0 + t, 0.45, -0.4 + k * 0.2); if (c.riscar) E(SFX.whoosh(0.35, false), t0 + t + 0.5, 0.3); });
        break;
      case "comparar": {
        const n = Math.max(c.esquerda.itens.length, c.direita.itens.length);
        for (let k = 0; k < n; k++) { E(SFX.toc(), t0 + 1.0 + k * 2, 0.35, -0.4); E(SFX.pop(), t0 + 1.5 + k * 2, 0.5, 0.4); }
        break;
      }
      case "imagem":
        E(SFX.whoosh(0.5), t0, 0.25);
        break;
    }
  });
  E(SFX.subida(1.2), lt.final - 1.2, 0.45);
  E(SFX.whoosh(0.6), lt.final - 0.32, 0.45);
  E(SFX.impacto(), lt.final, 0.5);
  E(SFX.brilho(), lt.final + 0.3, 0.5);
  E(SFX.pop(), lt.final + 1.6, 0.55);
  E(SFX.sucesso(), lt.final + 1.65, 0.35);

  // ---------- com narração: cada pedaço da gravação entra no começo da sua cena e a música abaixa sob a voz
  if (narracao) {
    const voz = new Faixa(D), fala = [], fade = Math.round(0.012 * TAXA);
    let pico = 0;
    for (let i = 0; i < narracao.faixa.L.length; i++) pico = Math.max(pico, Math.abs(narracao.faixa.L[i]), Math.abs(narracao.faixa.R[i]));
    const g = 0.85 / (pico || 1);
    narracao.pecas.forEach((p, k) => {
      const slot = narracao.slots[k];
      const em = (slot === -1 ? lt.final : lt.itens[slot].ini) + VOZ_ATRASO;
      const a = Math.round(p.de * TAXA), b = Math.min(narracao.faixa.L.length, Math.round(p.ate * TAXA)), d0 = Math.round(em * TAXA);
      for (let j = a; j < b; j++) {
        const i = d0 + (j - a); if (i >= voz.L.length) break;
        const env = Math.min(1, (j - a) / fade, (b - j) / fade);
        voz.L[i] += narracao.faixa.L[j] * g * env; voz.R[i] += narracao.faixa.R[j] * g * env;
      }
      fala.push([em, em + (p.ate - p.de)]);
    });
    mixFinal({ duracao: D, voz, musica, efeitos: ef, fala, saida, musicaDb: -7, ganhoEfeitos: 0.55 });
    return;
  }

  // ---------- mix: música um pouco abaixo dos efeitos e saída suave no fim
  const m = new Faixa(D);
  for (let i = 0; i < m.L.length; i++) {
    const t = i / TAXA, fim = t > D - 0.6 ? Math.max(0, (D - t) / 0.6) : 1;
    m.L[i] = ((musica.L[i] ?? 0) * 0.55 + (ef.L[i] ?? 0) * 0.6) * fim;
    m.R[i] = ((musica.R[i] ?? 0) * 0.55 + (ef.R[i] ?? 0) * 0.6) * fim;
  }
  salvarWav(saida, m, -1.5);
}
