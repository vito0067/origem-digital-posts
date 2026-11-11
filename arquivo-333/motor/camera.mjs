// Motor 3D v2 · CÂMERA
// A câmera é sempre uma função do tempo que devolve { pos, alvo, fov, rolar }.
// Aqui ficam as peças que os três perfis usam igual: trilhos suaves, emenda entre planos sem parar,
// transições (chicote, mergulho, giro), respiro e o "piso de movimento" que impede cena parada.

/** @typedef {[number,number,number]} V3 */
/** @typedef {{pos:V3, alvo:V3, fov:number, rolar?:number}} Cam */
/** @typedef {(u:number, d:number) => Cam} Plano  u = segundos desde o começo do plano, d = duração */

export const lim = (x) => Math.max(0, Math.min(1, x));
export const suave = (x) => { const t = lim(x); return t * t * (3 - 2 * t); };
/** Já começa andando e freia no fim: dá energia ao corte. */
export const arranca = (x) => 1 - Math.pow(1 - lim(x), 2.4);
/** Começa devagar e acelera: bom para sair de um plano. */
export const acelera = (x) => Math.pow(lim(x), 2.2);
export const mix = (a, b, p) => a + (b - a) * p;
/** @returns {V3} */
export const mix3 = (a, b, p) => [mix(a[0], b[0], p), mix(a[1], b[1], p), mix(a[2], b[2], p)];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
/** Ruído suave e repetível (sem Math.random: o mesmo quadro sai sempre igual). */
export const ruido = (t, s = 0) => Math.sin(t * 1.7 + s * 12.9) * 0.5 + Math.sin(t * 2.9 + s * 4.1) * 0.3 + Math.sin(t * 5.3 + s * 7.7) * 0.2;

const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
const cr3 = (a, b, c, d, t) => [cr(a[0], b[0], c[0], d[0], t), cr(a[1], b[1], c[1], d[1], t), cr(a[2], b[2], c[2], d[2], t)];

/**
 * Trilho: a câmera passa por vários pontos numa curva só, sem "quinas".
 * pontos: [{ em: 0..1, pos, alvo, fov? }]  (em = fração da duração do plano)
 * @returns {Plano}
 */
export function trilho(pontos, curva = arranca) {
  const P = [...pontos].sort((a, b) => a.em - b.em);
  return (u, d) => {
    const x = curva(u / d);
    let i = P.findIndex((p) => x < p.em); if (i < 0) i = P.length; i = Math.max(1, Math.min(P.length - 1, i));
    const a = P[i - 1], b = P[i], t = lim((x - a.em) / Math.max(1e-6, b.em - a.em));
    const p0 = P[Math.max(0, i - 2)], p3 = P[Math.min(P.length - 1, i + 1)];
    return { pos: cr3(p0.pos, a.pos, b.pos, p3.pos, t), alvo: cr3(p0.alvo, a.alvo, b.alvo, p3.alvo, t), fov: mix(a.fov ?? 40, b.fov ?? 40, suave(t)) };
  };
}
/** Órbita em volta de um ponto. ang em radianos. @returns {Plano} */
export const orbita = ({ centro = [0, 0, 0], raio = 8, altura = 3, de = 0, ate = 0.6, fov = 40, curva = arranca }) => (u, d) => {
  const a = mix(de, ate, curva(u / d)); return { pos: [centro[0] + Math.sin(a) * raio, centro[1] + altura, centro[2] + Math.cos(a) * raio], alvo: centro, fov };
};
/** Aproxima (ou afasta) em linha, olhando para o alvo. @returns {Plano} */
export const aproxima = ({ de, ate, alvo, fovDe = 40, fovAte = 40, curva = arranca }) => (u, d) => { const p = curva(u / d); return { pos: mix3(de, ate, p), alvo, fov: mix(fovDe, fovAte, p) }; };

/**
 * Piso de movimento: se o plano ficar quase parado, soma um avanço lento e uma leve órbita.
 * É o que garante "câmera sempre em movimento" sem mudar o enquadramento.
 * forca 1 = padrão; 0 desliga.
 */
export function comPiso(plano, forca = 1) {
  return (u, d) => {
    const c = plano(u, d); if (!forca) return c;
    const dx = c.alvo[0] - c.pos[0], dy = c.alvo[1] - c.pos[1], dz = c.alvo[2] - c.pos[2], L = Math.hypot(dx, dy, dz) || 1;
    const avanco = 0.022 * L * forca * u;                                // chega 2,2% mais perto por segundo
    const lado = 0.03 * L * forca * Math.sin((u / Math.max(d, 0.1)) * Math.PI * 0.9); // desliza de lado e volta
    const lx = -dz / L, lz = dx / L;
    return { ...c, pos: [c.pos[0] + (dx / L) * avanco + lx * lado, c.pos[1] + (dy / L) * avanco, c.pos[2] + (dz / L) * avanco + lz * lado] };
  };
}
/** Respiro (câmera na mão, bem leve) e tremor (impacto, crise). */
export function comRespiro(c, t, respiro = 1, tremor = 0) {
  const L = dist(c.pos, c.alvo) || 1, r = 0.004 * L * respiro, k = tremor * 0.02 * L;
  return { ...c, pos: [c.pos[0] + ruido(t * 0.9, 1) * r + ruido(t * 9, 4) * k, c.pos[1] + ruido(t * 1.1, 2) * r + ruido(t * 8, 5) * k, c.pos[2] + ruido(t * 0.7, 3) * r + ruido(t * 7, 6) * k] };
}

/**
 * Perfis de câmera.
 *  - padrao (Arquivo 3:33 e Ilha Zero): câmera nunca para (piso de movimento ligado), troca seca entre planos.
 *  - calmo (Hoje Sumiu, pedido do Vito em 10 e 11/11/2026): a câmera PODE ficar parada. Sem piso de movimento,
 *    respiro bem leve e, entre um plano e outro, um voo suave no lugar do corte seco. Um plano por fala.
 */
export const PERFIS = {
  padrao: { piso: 1, respiro: 1, entrada: 'corte' },
  calmo: { piso: 0, respiro: 0.3, entrada: 'continua' },
};

/**
 * Sequência: junta os planos de um episódio numa câmera só.
 * Opções: { perfil: 'padrao' | 'calmo', respiro }.
 * cenas: [{ inicio, fim, plano: Plano, entrada?: 'corte'|'continua'|'chicote'|'mergulho'|'giro', tremor?: number, piso?: number }]
 *  - corte: troca seca (padrão).
 *  - continua: emenda de 0,8 s vindo do plano anterior (voo contínuo, mesmo cenário).
 *  - chicote: virada rápida de 0,35 s com o campo de visão abrindo (parece um "whip pan").
 *  - mergulho: o plano anterior acelera para frente nos últimos 0,3 s e o novo já chega freando.
 *  - giro: entra rolando a câmera de 12 graus até 0.
 * Devolve camera(t) -> Cam.
 */
export function sequencia(cenas, { respiro, perfil = 'padrao' } = {}) {
  const P = PERFIS[perfil] ?? PERFIS.padrao; respiro = respiro ?? P.respiro;
  const C = [...cenas].sort((a, b) => a.inicio - b.inicio).map((c) => ({ ...c, entrada: c.entrada ?? P.entrada, fn: comPiso(c.plano, c.piso ?? P.piso) }));
  const um = (k, t) => { const c = C[k], d = Math.max(0.3, c.fim - c.inicio); return c.fn(lim((t - c.inicio) / d) * d, d); };
  return (t) => {
    let i = C.findIndex((c) => t < c.fim); if (i < 0) i = C.length - 1;
    const c = C[i], u = t - c.inicio; let cam = um(i, t);
    const ent = c.entrada ?? 'corte';
    if (i > 0 && ent === 'continua') { const p = suave(u / 0.8); if (p < 1) { const a = um(i - 1, c.inicio); cam = { pos: mix3(a.pos, cam.pos, p), alvo: mix3(a.alvo, cam.alvo, p), fov: mix(a.fov, cam.fov, p) }; } }
    if (i > 0 && ent === 'chicote') { const p = arranca(u / 0.35); if (p < 1) { const a = um(i - 1, c.inicio); cam = { pos: mix3(a.pos, cam.pos, p), alvo: mix3(a.alvo, cam.alvo, p), fov: mix(a.fov, cam.fov, p) + Math.sin(p * Math.PI) * 14 }; } }
    if (ent === 'giro') { const p = arranca(u / 0.6); cam = { ...cam, rolar: (1 - p) * 0.21 }; }
    if (ent === 'mergulho') { const p = arranca(u / 0.45); const L = dist(cam.pos, cam.alvo); const k = (1 - p) * 0.35 * L; const dx = (cam.pos[0] - cam.alvo[0]) / (L || 1), dy = (cam.pos[1] - cam.alvo[1]) / (L || 1), dz = (cam.pos[2] - cam.alvo[2]) / (L || 1); cam = { ...cam, pos: [cam.pos[0] + dx * k, cam.pos[1] + dy * k, cam.pos[2] + dz * k], fov: cam.fov + (1 - p) * 8 }; }
    // saída acelerada quando o PRÓXIMO plano entra em mergulho
    const prox = C[i + 1];
    if (prox && (prox.entrada === 'mergulho') && c.fim - t < 0.3) { const p = acelera(1 - (c.fim - t) / 0.3); const L = dist(cam.pos, cam.alvo); cam = { ...cam, pos: mix3(cam.pos, cam.alvo, p * 0.3), fov: cam.fov - p * 5 * Math.min(1, L) }; }
    return comRespiro(cam, t, respiro, c.tremor ?? 0);
  };
}

/** Aplica uma Cam numa PerspectiveCamera do three.js. */
export function aplicar(cam3, c) {
  cam3.fov = c.fov; cam3.position.set(c.pos[0], c.pos[1], c.pos[2]); cam3.up.set(0, 1, 0); cam3.lookAt(c.alvo[0], c.alvo[1], c.alvo[2]);
  if (c.rolar) cam3.rotateZ(c.rolar); cam3.updateProjectionMatrix(); cam3.updateMatrixWorld(); return cam3;
}
