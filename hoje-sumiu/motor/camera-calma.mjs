// Câmera do motor do Hoje Sumiu (11/11/2026). `cena.motor: "livro"` = a câmera é um LEITOR: enquadramento firme, uma aproximação
// bem lenta por fala e a troca de cena é VIRAR A PÁGINA. (`cena.motor: "v2"` = o teste anterior, com voo suave entre planos.)
// Fica em .mjs para servir aos dois lados: o vídeo (DiaDados.tsx) e o conferidor (ferramentas/conferir-ritmo.mjs).
// Perfil "calmo" (pedido do Vito): um plano por fala, troca em voo suave, a câmera pode parar.
import { sequencia, aproxima, mix, mix3, suave, lim } from "./camera.mjs";
import { conferirRitmo } from "./ritmo.mjs";
import { conferirSom } from "./som.mjs";

// lugares do livro e de onde a câmera olha para eles
export const LUGARES = {
  praca: { geral: { pos: [0.1, 3.6, 33], alvo: [0.1, 3, 17.5], fov: 44, deriva: [0, 0, -0.4], foco: 0.55 }, perto: { pos: [0.1, 3.2, 27], alvo: [0.1, 2.9, 17.5], fov: 42, deriva: [0, 0, -0.3], foco: 0.7 } },
  esquerda: { geral: { pos: [-13.6, 4.4, 31.5], alvo: [-14.1, 3.2, 13.5], fov: 44, deriva: [0, -0.06, -0.35], foco: 0.6 }, perto: { pos: [-12.4, 3.3, 27], alvo: [-12.8, 3, 15.5], fov: 40, deriva: [0, 0, -0.35], foco: 0.75 } },
  direita: { geral: { pos: [13.2, 4.6, 27], alvo: [11.6, 2.3, 13.5], fov: 44, deriva: [-0.1, -0.08, -0.7], foco: 0.6 }, perto: { pos: [12, 3, 27.4], alvo: [11.9, 2.2, 16], fov: 42, deriva: [0, 0, -0.3], foco: 0.75 } },
  ceu: { geral: { pos: [0, 24.5, 19], alvo: [0, 26.6, -14], fov: 34, deriva: [0, 0.05, -0.5], foco: 0.3 }, perto: { pos: [0, 25, 12], alvo: [0, 26.6, -14], fov: 34, deriva: [0, 0, -0.3], foco: 0.3 } },
  rua: { geral: { pos: [0.3, 2.4, 22.5], alvo: [0.3, 2, 9], fov: 46, deriva: [0, 0, -0.45], foco: 0.3 }, perto: { pos: [0.3, 2.2, 17], alvo: [0.3, 1.8, 9], fov: 44, deriva: [0, 0, -0.3], foco: 0.4 } },
  semaforo: { geral: { pos: [1.25, 1.5, 23], alvo: [3, 5.2, 5.4], fov: 46, deriva: [0.1, 0.12, -1], foco: 0.55 }, perto: { pos: [5.4, 5.5, 16], alvo: [3.5, 5.3, 5.4], fov: 36, deriva: [0, 0, -0.35], foco: 0.75 } },
  transito: { geral: { pos: [11, 31, 26], alvo: [0, 0, 1.5], fov: 50, deriva: [-0.5, 0.35, -0.2], foco: 0.75 }, perto: { pos: [9.5, 7.5, 17], alvo: [0.4, 1, 2], fov: 50, deriva: [-0.5, 0, -0.3], foco: 0.5 } },
  cidade: { geral: { pos: [10, 34, 88], alvo: [0, 12, -6], fov: 44, deriva: [-0.4, 0.1, -0.7], foco: 0.15 }, perto: { pos: [0, 16, 48], alvo: [0, 8, -4], fov: 46, deriva: [0, 0, -0.4], foco: 0.15 } },
};

/** As tomadas do dia (as fixas da série mais as de `cena.cameras`), em ordem de tempo. */
export function tomadas(l) {
  const c = l.cenas, m = l.marcas, h = l.cena.heroi ?? {};
  const T = [
    { t: 0, dur: 0.01, pos: h.camera ?? [0.5, 3.4, 29], alvo: h.alvo ?? [0, 7.2, 16], fov: 44, deriva: [0.1, 0.02, -0.5], foco: 0.45 },
    { t: m.onda + 0.2, dur: 2.05, pos: [10, 34, 88], alvo: [0, 12, -6], fov: 44, deriva: [-0.4, 0.1, -0.7], foco: 0.15 },
  ];
  for (const k of l.cena.cameras ?? []) { const lg = LUGARES[k.lugar]; if (k.lugar && !lg) throw new Error("lugar desconhecido: " + k.lugar); const b = lg ? (k.perto ? lg.perto : lg.geral) : {}; T.push({ dur: k.perto ? 0.6 : 1.1, arco: k.perto ? 0 : 3, ...b, ...k, t: k.em }); }
  T.push(
    { t: c[m.iVirada].inicio - 0.15, dur: 1.6, pos: [0, 4.2, 31], alvo: [0, 4.2, -2], fov: 50, deriva: [0, 0.12, 0.25], arco: 3, foco: 0.35 },
    { t: m.nilo, dur: 0.85, pos: [0.7, 3.3, 31.2], alvo: [0.05, 2.7, 18], fov: 44, deriva: [-0.1, 0, -0.3], foco: 0.5 },
    { t: c[m.iChamado].inicio - 0.25, dur: 1.9, pos: [0, 30, 90], alvo: [0, 16, -8], fov: 44, deriva: [0, -0.05, -0.8], foco: 0.1 },
    { t: m.comenta - 0.2, dur: 1.2, pos: [0, 26, 74], alvo: [0, 18, -8], fov: 44, deriva: [0, 0, -0.3], foco: 0.05 },
  );
  return T.sort((a, b) => a.t - b.t);
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * A câmera do dia pelo motor v2, perfil calmo. Devolve { cenas, camera(t), foco(t) }.
 * Cada tomada vira um plano que desliza devagar e freia (pode parar). A troca de plano:
 *  - perto (até 12 unidades): a emenda do motor ("continua", 0,8 s);
 *  - longe (da praça para a cidade inteira, por exemplo) ou depois de um plano curto: 0,8 s seria um tranco,
 *    então o próprio plano faz o voo no tempo da tomada (`dur`), saindo de onde a câmera estava. Ajuste só deste perfil.
 */
export function cameraV2(l) {
  // perfil calmo: tomada que duraria menos de 0,6 s (outra entra logo em seguida) não vira plano; fica só a seguinte
  const livro = l.cena.motor === "livro", LENTO = livro ? 0.5 : 1; // no livro a aproximação é a metade da velocidade
  const T0 = tomadas(l).map((s) => ({ ...s, deriva: (s.deriva ?? [0, 0, 0]).map((x) => x * LENTO) })), T = T0.filter((s, k) => k === 0 || k === T0.length - 1 || T0[k + 1].t - s.t >= 0.6), dur = l.duracao, cenas = [];
  T.forEach((s, k) => {
    const inicio = k === 0 ? 0 : s.t, fim = k + 1 < T.length ? T[k + 1].t : dur, d = Math.max(0.3, fim - inicio), dv = s.deriva ?? [0, 0, 0];
    const base = aproxima({ de: s.pos, ate: [s.pos[0] + dv[0] * d, s.pos[1] + dv[1] * d, s.pos[2] + dv[2] * d], alvo: s.alvo, fovDe: s.fov, fovAte: s.fov, ...(livro ? { curva: lim } : {}) }); // no livro a aproximação é contínua e lenta até o fim da fala
    if (k === 0) { cenas.push({ inicio, fim, plano: base, foco: s.foco ?? 0, voo: 0 }); return; }
    // motor "livro": não existe voo. O plano novo já começa no lugar e a folha que vira esconde a troca (ver `viradas`).
    if (livro) { cenas.push({ inicio, fim, plano: base, entrada: "corte", foco: s.foco ?? 0, voo: 0, vira: true }); return; }
    const ant = cenas[k - 1], antes = sequencia(cenas, { perfil: "calmo", respiro: 0 })(ant.fim); // onde a câmera está de verdade no fim do plano anterior
    const longe = dist(antes.pos, s.pos) > 12 || ant.fim - ant.inicio < Math.max(0.85, ant.voo + 0.05);
    if (!longe) { cenas.push({ inicio, fim, plano: base, entrada: "continua", foco: s.foco ?? 0, voo: 0.8 }); return; }
    const voo = Math.min(Math.max(s.dur ?? 1.2, 1.2), d);
    const plano = (u, dd) => { const b = base(u, dd), p = suave(u / voo), pos = mix3(antes.pos, b.pos, p); pos[1] += (s.arco ?? 0) * 0.5 * Math.sin(Math.PI * p); return { pos, alvo: mix3(antes.alvo, b.alvo, p), fov: mix(antes.fov, b.fov, p) }; };
    cenas.push({ inicio, fim, plano, entrada: "corte", foco: s.foco ?? 0, voo });
  });
  const camera = sequencia(cenas, { perfil: "calmo" });
  const viradas = cenas.filter((c) => c.vira).map((c) => c.inicio);
  const foco = (t) => { let i = cenas.findIndex((c) => t < c.fim); if (i < 0) i = cenas.length - 1; const c = cenas[i]; return i === 0 ? c.foco : (c.vira ? c.foco : mix(cenas[i - 1].foco, c.foco, suave((t - c.inicio) / Math.max(0.8, c.voo)))); };
  return { cenas, camera, foco, viradas };
}

/** Intervalo entre os comentários de exemplo do cartão final: no livro eles entram espaçados, para o cartão não ficar parado. */
export const PASSO_EXEMPLO = (l) => (l.cena.motor === "livro" ? 1.3 : 0.45);
/** Tempos em que algo novo entra na tela (peças, selos, etiquetas, cartões e marcas da história). */
export function eventosDoDia(l) {
  const E = new Set();
  const anda = (x) => { if (Array.isArray(x)) x.forEach(anda); else if (x && typeof x === "object") { for (const [k, v] of Object.entries(x)) { if ((k === "em" || k === "some") && typeof v === "number" && v > 0) E.add(+v.toFixed(2)); else anda(v); } } };
  anda(l.cena);
  (l.cena.exemplos ?? [0, 1, 2]).forEach((_, i) => E.add(+(l.marcas.comenta + 0.55 + i * PASSO_EXEMPLO(l)).toFixed(2)));
  if (l.cena.motor === "livro") for (const v of cameraV2(l).viradas) E.add(+v.toFixed(2)); // página virando é novidade na tela E.add(+(l.marcas.comenta + 1.6).toFixed(2)); // comentários de exemplo e o aviso do cartão final
  for (const k of ["onda", "credito", "reclama", "nilo", "anotou", "amanha", "interrogacao", "comenta"]) { const v = l.marcas[k]; if (typeof v === "number" && v > 0 && v < l.duracao) E.add(+v.toFixed(2)); }
  return [...E].filter((x) => x < l.duracao).sort((a, b) => a - b);
}

/** Confere o dia ANTES de renderizar. Devolve { ok, avisos, medidas, salto }. */
export function conferirDia(l) {
  const { cenas, camera, viradas } = cameraV2(l), eventos = eventosDoDia(l);
  const r = conferirRitmo({ cenas, camera, dur: l.duracao, eventos, perfil: "calmo" });
  // tranco: nenhum quadro pode andar mais de 6% da distância até o alvo (voo suave, sem corte seco)
  let salto = 0, onde = 0, a = camera(0);
  for (let i = 1; i <= Math.round(l.duracao * 30); i++) { const b = camera(i / 30), s = dist(a.pos, b.pos) / (dist(b.pos, b.alvo) || 1), naVirada = viradas.some((v) => Math.abs(v - i / 30) < 0.05); if (!naVirada && s > salto) { salto = s; onde = i / 30; } a = b; }
  if (salto > 0.06) r.avisos.push(`Tranco de câmera em ${onde.toFixed(2)} s (${(salto * 100).toFixed(1)}% num quadro). A troca de plano tem que ser em voo suave.`);
  const falas = l.cenas.map((c) => ({ de: +c.vozEm.toFixed(2), ate: +(c.vozEm + c.vozDur).toFixed(2) }));
  const som = conferirSom(l.cena.impactos ?? [], falas);
  return { ...r, ok: r.avisos.length === 0, salto: +salto.toFixed(4), saltoEm: +onde.toFixed(2), eventos, avisosSom: som };
}
export { lim };
