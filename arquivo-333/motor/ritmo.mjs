// Motor 3D v2 · RITMO
// Confere o episódio ANTES de renderizar (leva milissegundos, não gasta crédito nem horas de máquina).
// Regras do padrão de qualidade aprovado em 09/11/2026:
//  1) câmera sempre em movimento e algo novo a cada 2 a 3 segundos;
//  2) primeiro corte em até 2 segundos;
//  3) som: silêncio curto antes do momento forte (ver som.mjs).

const ang = (c) => { const dx = c.alvo[0] - c.pos[0], dy = c.alvo[1] - c.pos[1], dz = c.alvo[2] - c.pos[2], L = Math.hypot(dx, dy, dz) || 1; return [dx / L, dy / L, dz / L, L]; };

/**
 * Mede o movimento da câmera ao longo do tempo.
 * camera: (t) => Cam   dur: segundos   fps: quadros por segundo
 * Devolve: { paradoPct, movimentoMedio, trechosParados: [{de, ate}] }
 * "Parado" = a imagem se desloca menos de ~0,05% da largura por quadro (soma de giro, avanço e zoom).
 * É uma previsão pela câmera; a medida final continua sendo a do vídeo pronto (medir-episodios.py).
 */
export function medirCamera(camera, dur, fps = 30) {
  const n = Math.max(2, Math.round(dur * fps)); let parados = 0, soma = 0; const trechos = []; let ini = null;
  let ant = camera(0);
  for (let i = 1; i <= n; i++) {
    const t = i / fps, c = camera(t), a = ang(ant), b = ang(c);
    const giro = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));           // radianos
    const desloc = Math.hypot(c.pos[0] - ant.pos[0], c.pos[1] - ant.pos[1], c.pos[2] - ant.pos[2]) / (b[3] || 1); // paralaxe relativa
    const zoom = Math.abs(c.fov - ant.fov) / (c.fov || 40);
    const fovRad = (c.fov * Math.PI) / 180;
    const mov = (giro / fovRad + desloc * 0.9 + zoom * 0.5) * 100;   // % da tela por quadro, aproximado
    soma += mov;
    if (mov < 0.05) { parados++; if (ini === null) ini = (i - 1) / fps; }
    else if (ini !== null) { if (t - ini >= 0.5) trechos.push({ de: +ini.toFixed(2), ate: +t.toFixed(2) }); ini = null; }
    ant = c;
  }
  if (ini !== null && dur - ini >= 0.5) trechos.push({ de: +ini.toFixed(2), ate: +dur.toFixed(2) });
  return { paradoPct: +(100 * parados / n).toFixed(1), movimentoMedio: +(soma / n).toFixed(3), trechosParados: trechos };
}

/**
 * Confere o roteiro de cenas e a câmera. Devolve { ok, avisos: [texto], medidas }.
 * cenas: [{ inicio, fim, novidade?: string }]   (novidade = o que aparece de novo na tela nesse plano)
 * eventos: tempos (s) em que algo novo entra na tela além dos cortes (texto, objeto, efeito)
 */
export const METAS = {
  padrao: { primeiroCorte: 2.0, maxSemNovidade: 3.0, paradoPct: 20 },
  // Hoje Sumiu: a câmera pode parar e não precisa cortar. A novidade vem das peças e dos selos (eventos), com mais folga.
  calmo: { primeiroCorte: null, maxSemNovidade: 4.5, paradoPct: null },
};
export function conferirRitmo({ cenas, camera, dur, eventos = [], fps = 30, metas = {}, perfil = 'padrao' }) {
  const M = { ...(METAS[perfil] ?? METAS.padrao), ...metas };
  const C = [...cenas].sort((a, b) => a.inicio - b.inicio); const avisos = [];
  const cortes = C.slice(1).map((c) => c.inicio);
  if (M.primeiroCorte != null && (!cortes.length || cortes[0] > M.primeiroCorte + 1e-6)) avisos.push(`Primeiro corte em ${cortes.length ? cortes[0].toFixed(2) : '?'} s. A meta é até ${M.primeiroCorte} s.`);
  // no perfil calmo, trocar de plano não conta como novidade: só o que entra na tela (eventos)
  const marcos = [0, ...(perfil === 'calmo' ? [] : cortes), ...eventos, dur].sort((a, b) => a - b);
  for (let i = 1; i < marcos.length; i++) { const v = marcos[i] - marcos[i - 1]; if (v > M.maxSemNovidade + 1e-6) avisos.push(`De ${marcos[i - 1].toFixed(1)} s a ${marcos[i].toFixed(1)} s (${v.toFixed(1)} s) nada novo entra na tela. Corte o plano ou coloque um evento.`); }
  let medidas = null;
  if (camera) { medidas = medirCamera(camera, dur, fps); if (M.paradoPct != null && medidas.paradoPct > M.paradoPct) avisos.push(`Câmera quase parada em ${medidas.paradoPct}% do tempo (meta: menos de ${M.paradoPct}%). Trechos: ${medidas.trechosParados.map((x) => x.de + '–' + x.ate + ' s').join(', ') || 'espalhados'}.`); }
  return { ok: avisos.length === 0, avisos, medidas, cortes };
}
