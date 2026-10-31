// Um episódio do Hoje Sumiu: a câmera voa sem cortes pelo livro pop-up e a edição (cabeçalho, etiquetas presas nos objetos,
// legenda-adesivo) acompanha a voz. A arte é só nossa: papel, avesso cinza e o caderno do Seu Nilo.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { loadFont as lilita } from "@remotion/google-fonts/LilitaOne";
import { loadFont as caveat } from "@remotion/google-fonts/Caveat";
import * as THREE from "three";
import { MundoPapel } from "./mundo-papel";

const LILITA = lilita("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const CAVEAT = caveat("normal", { weights: ["700"], subsets: ["latin"] }).fontFamily;
const NAVY = "#16233f", AZUL = "#0a6cff", AMAR = "#ffd23f", VERM = "#e5202b", CINZA = "#8b8f96";
type V = [number, number, number];
type Palavra = { w: string; em: number };
export type LinhaDia = { id: string; dia: number; coisa: string; duracao: number; marcas: Record<string, number>; cenas: { i: number; fala: string; inicio: number; vozEm: number; vozDur: number; fim: number; palavras: Palavra[] }[] };
const lim = (x: number) => Math.max(0, Math.min(1, x));
const sm = (x: number) => { const t = lim(x); return t * t * (3 - 2 * t); };
const voo = (x: number) => { const t = lim(x); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const sai = (x: number) => 1 - Math.pow(1 - lim(x), 3);
const volta = (x: number) => { const t = lim(x), c = 2.2; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const mix = (a: V, b: V, p: number): V => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];

// ---------------------------------------------------------------- roteiro de câmera: um voo só, do começo ao fim
type Tomada = { t: number; dur: number; pos: V; alvo: V; fov: number; arco?: number; deriva?: V; foco?: number };
function tomadas(l: LinhaDia): Tomada[] {
  const c = l.cenas, m = l.marcas;
  return [
    { t: 0, dur: 0.01, pos: [1.7, 1.7, 13.4], alvo: [3.2, 7.1, 5.4], fov: 44, deriva: [0.1, 0.02, -0.5], foco: 0.45 },
    { t: m.onda + 0.2, dur: 2.05, pos: [10, 34, 88], alvo: [0, 12, -6], fov: 44, deriva: [-0.4, 0.1, -1.4], foco: 0.15 },
    { t: c[2].inicio - 0.35, dur: 1.35, pos: [1.25, 1.5, 23], alvo: [3, 5.2, 5.4], fov: 46, deriva: [0.1, 0.12, -2.2], arco: 6, foco: 0.55 },
    { t: c[3].inicio - 0.05, dur: 0.75, pos: [5.4, 5.5, 16], alvo: [3.5, 5.3, 5.4], fov: 36, deriva: [0, 0, -0.35], foco: 0.75 },
    { t: m.entao - 0.25, dur: 0.85, pos: [9.5, 7.5, 17], alvo: [0.4, 1, 2], fov: 50, deriva: [-0.5, 0, -0.3], foco: 0.5 },
    { t: c[4].inicio - 0.25, dur: 0.85, pos: [-7.6, 2.6, 16.5], alvo: [-3.5, 2.8, 7.2], fov: 42, deriva: [0.28, 0, -0.42], foco: 0.7 },
    { t: c[5].inicio - 0.25, dur: 1, pos: [11, 31, 26], alvo: [0, 0, 1.5], fov: 50, deriva: [-0.5, 0.35, -0.2], foco: 0.75 },
    { t: c[6].inicio - 0.3, dur: 1, pos: [-6.5, 5.2, 19], alvo: [-1.25, 1.1, 8], fov: 42, deriva: [0.25, -0.05, -0.55], foco: 0.7 },
    { t: m.mercado, dur: 1, pos: [13.2, 4.6, 27], alvo: [11.2, 2.15, 13.5], fov: 44, deriva: [-0.1, -0.08, -1], arco: 3, foco: 0.6 },
    { t: m.mordida - 0.95, dur: 0.6, pos: [10.9, 3.1, 23.6], alvo: [10.5, 1.95, 16], fov: 42, deriva: [0, 0, -0.45], foco: 0.75 },
    { t: m.campo, dur: 1.15, pos: [-13.6, 5.2, 31], alvo: [-14, 2, 14.6], fov: 44, deriva: [0, -0.1, -0.8], arco: 6, foco: 0.55 },
    { t: m.cartao - 0.3, dur: 0.55, pos: [-10.2, 2.7, 26.4], alvo: [-11.3, 1.95, 17], fov: 40, deriva: [0, 0, -0.45], foco: 0.75 },
    { t: m.ombros - 0.25, dur: 0.55, pos: [-14.8, 2.7, 26.8], alvo: [-15.3, 1.95, 17.4], fov: 42, deriva: [-1, 0, -0.1], foco: 0.7 },
    { t: c[9].inicio - 0.15, dur: 1.6, pos: [0, 4.2, 31], alvo: [0, 4.2, -2], fov: 50, deriva: [0, 0.12, 0.25], arco: 3, foco: 0.35 },
    { t: m.nilo, dur: 0.85, pos: [0.7, 3.3, 31.2], alvo: [0.05, 2.7, 18], fov: 44, deriva: [-0.1, 0, -0.65], foco: 0.5 },
    { t: c[11].inicio - 0.25, dur: 1.9, pos: [0, 30, 90], alvo: [0, 16, -8], fov: 44, deriva: [0, -0.05, -0.8], foco: 0.1 },
    { t: m.comenta - 0.2, dur: 1.2, pos: [0, 26, 74], alvo: [0, 18, -8], fov: 44, deriva: [0, 0, -0.3], foco: 0.05 },
  ];
}
function camEm(T: Tomada[], t: number, m: Record<string, number>) {
  const r = camBase(T, t);
  for (const [e, a] of [[m.onda, 0.12], [m.placaVira, 0.05], [m.trava, 0.16], [m.mordida, 0.07], [m.cartaoVira, 0.05], [m.interrogacao, 0.14]] as const) { const d = t - e; if (d > 0 && d < 0.55) { const A = a * Math.exp(-d * 8); r.pos[0] += Math.sin(t * 71) * A; r.pos[1] += Math.cos(t * 63) * A; r.fov -= A * 16; } }
  return r;
}
function camBase(T: Tomada[], t: number) {
  let k = 0; for (let i = 0; i < T.length; i++) if (t >= T[i].t) k = i;
  const s = T[k]; if (k === 0) { const d = t; return { pos: mix(s.pos, [s.pos[0] + (s.deriva?.[0] ?? 0), s.pos[1] + (s.deriva?.[1] ?? 0), s.pos[2] + (s.deriva?.[2] ?? 0)], d) as V, alvo: s.alvo, fov: s.fov, foco: s.foco ?? 0, arrasto: 0 }; }
  const a = T[k - 1], dA = s.t - a.t, ini: V = [a.pos[0] + (a.deriva?.[0] ?? 0) * dA, a.pos[1] + (a.deriva?.[1] ?? 0) * dA, a.pos[2] + (a.deriva?.[2] ?? 0) * dA];
  const p = voo((t - s.t) / s.dur), d = Math.max(0, t - s.t);
  const pos = mix(ini, [s.pos[0] + (s.deriva?.[0] ?? 0) * d, s.pos[1] + (s.deriva?.[1] ?? 0) * d, s.pos[2] + (s.deriva?.[2] ?? 0) * d], p);
  pos[1] += (s.arco ?? 0) * Math.sin(Math.PI * p);
  const flut = 0.03; pos[0] += Math.sin(t * 0.9) * flut; pos[1] += Math.sin(t * 1.3 + 1) * flut;
  return { pos, alvo: mix(a.alvo, s.alvo, p), fov: a.fov + (s.fov - a.fov) * p, foco: (a.foco ?? 0) + ((s.foco ?? 0) - (a.foco ?? 0)) * p, arrasto: Math.sin(Math.PI * lim((t - s.t) / s.dur)) };
}

// ---------------------------------------------------------------- 3D
let W: any = null;
function mundo(m: Record<string, number>) {
  if (W) return W;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(1080, 1920, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02; renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%";
  W = { renderer, m: new MundoPapel(m), cam: new THREE.PerspectiveCamera(45, 1080 / 1920, 0.1, 900) };
  return W;
}
const Cena3D: React.FC<{ t: number; c: any; m: Record<string, number>; k: number }> = ({ t, c, m, k }) => {
  const borrao = (c.arrasto ?? 0) * 2.6;
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const h = delayRender("livro " + k);
    try {
      const w = mundo(m);
      if (ref.current && w.renderer.domElement.parentElement !== ref.current) ref.current.appendChild(w.renderer.domElement);
      w.m.atualizar(t); w.cam.fov = c.fov; w.cam.position.set(...c.pos); w.cam.lookAt(...c.alvo); w.cam.updateProjectionMatrix(); w.renderer.render(w.m.cena, w.cam);
    } finally { continueRender(h); }
  }, [k]);
  return <div ref={ref} style={{ position: "absolute", inset: 0, filter: `saturate(1.16) contrast(1.04) brightness(1.02)${borrao > 0.2 ? ` blur(${borrao.toFixed(2)}px)` : ""}` }} />;
};

// ---------------------------------------------------------------- edição
const adesivo = (borda = 16, sombra = 8): React.CSSProperties => ({ WebkitTextStroke: `${borda}px #fff`, paintOrder: "stroke fill", filter: `drop-shadow(0 ${sombra}px 0 rgba(22,35,63,.42))` });
/** Etiqueta de papel presa num ponto do mundo: acompanha o objeto enquanto a câmera voa. */
const Etiqueta: React.FC<{ txt: string; x: number; y: number; t: number; em: number; ate: number; cor?: string; r?: number }> = ({ txt, x, y, t, em, ate, cor = AZUL, r = -2 }) => {
  if (t < em || t > ate + 0.18) return null;
  const e = volta((t - em) / 0.26) * (t > ate ? 1 - sai((t - ate) / 0.18) : 1), X = Math.max(190, Math.min(890, x)), Y = Math.max(440, Math.min(1130, y));
  return <div style={{ position: "absolute", left: X, top: Y, transform: `translate(-50%,-100%) rotate(${r}deg) scale(${e})`, transformOrigin: "50% 100%" }}>
    <div style={{ background: "#fffdf6", color: NAVY, fontFamily: LILITA, fontSize: 54, lineHeight: 1, padding: "16px 28px 14px", borderRadius: 14, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 9px 0 rgba(22,35,63,.28), 0 2px 0 #e6dfca" }}>
      <span style={{ width: 24, height: 24, borderRadius: 24, background: cor, boxShadow: "inset 0 0 0 4px rgba(255,255,255,.35)" }} />{txt}
    </div>
    <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "17px solid transparent", borderRight: "17px solid transparent", borderTop: "22px solid #fffdf6" }} />
  </div>;
};
const Contador: React.FC<{ rot: string; num: string; t: number; em: number; ate: number }> = ({ rot, num, t, em, ate }) => {
  if (t < em || t > ate + 0.15) return null;
  const e = volta((t - em) / 0.28) * (t > ate ? 1 - sai((t - ate) / 0.15) : 1);
  return <div style={{ position: "absolute", top: 365, width: "100%", display: "flex", justifyContent: "center" }}><div style={{ background: NAVY, color: "#fff", fontFamily: LILITA, textAlign: "center", padding: "16px 46px 12px", borderRadius: 22, transform: `rotate(1.5deg) scale(${e})`, boxShadow: "0 10px 0 rgba(22,35,63,.3)", border: "7px solid #fffdf6" }}><div style={{ fontSize: 40, opacity: 0.86, letterSpacing: 1 }}>{rot}</div><div style={{ fontSize: 112, lineHeight: 1, color: AMAR }}>{num}</div></div></div>;
};
function blocos(p: Palavra[]) { const b: Palavra[][] = []; let a: Palavra[] = []; p.forEach((x, k) => { a.push(x); const fim = /[.!?,:]\W*$/.test(x.w.replace(/[*~]/g, "")); if (a.length >= 3 || fim || k === p.length - 1) { b.push(a); a = []; } }); return b; }
const Legenda: React.FC<{ l: LinhaDia; t: number; onda: number; escondida: boolean }> = ({ l, t, onda, escondida }) => {
  const c = l.cenas.find((x) => t >= x.inicio && t < x.fim); if (!c || escondida) return null;
  const bl = blocos(c.palavras); let at = bl[0]; for (const b of bl) if (t >= b[0].em) at = b;
  return <div style={{ position: "absolute", left: 30, right: 30, top: 1205, textAlign: "center", fontFamily: LILITA, fontSize: 104, lineHeight: 1.08, color: NAVY, textTransform: "uppercase" }}>
    {at.map((x, i) => {
      const dita = t >= x.em, e = dita ? volta((t - x.em) / 0.16) : 0, w = x.w.replace(/[*~]/g, ""), esp = x.w.includes("~"), forte = x.w.includes("*");
      if (!dita) return null;
      return <span key={i + w} style={{ display: "inline-block", margin: "0 13px", transform: `scale(${e}) rotate(${(i % 2 ? 1 : -1) * 1.1}deg)`, color: esp ? (t < onda + 0.1 ? VERM : CINZA) : forte ? AZUL : NAVY, ...adesivo(18, 9) }}>{w}</span>;
    })}
  </div>;
};
const Comentario: React.FC<{ txt: string; t: number; em: number; r: number }> = ({ txt, t, em, r }) => {
  const e = volta((t - em) / 0.28); if (t < em) return null;
  return <div style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: 18, background: "#fffdf6", borderRadius: 26, padding: "16px 30px 12px", fontFamily: LILITA, fontSize: 62, color: NAVY, transform: `rotate(${r}deg) scale(${e})`, boxShadow: "0 9px 0 rgba(22,35,63,.28)" }}><span style={{ width: 54, height: 54, borderRadius: 54, background: AMAR, display: "inline-block", border: `5px solid ${NAVY}` }} />{txt}</div>;
};

export const Dia: React.FC<{ linha: LinhaDia }> = ({ linha: l }) => {
  const f = useCurrentFrame(), t = f / 30, m = l.marcas, c = l.cenas;
  const T = useMemo(() => tomadas(l), [l]);
  const cam = camEm(T, t, m);
  // projeta um ponto do mundo na tela, para a etiqueta ficar presa no objeto
  const P = (v: V) => { const k = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.1, 900); k.position.set(...cam.pos); k.lookAt(...cam.alvo); k.updateMatrixWorld(); k.updateProjectionMatrix(); const q = new THREE.Vector3(...v).project(k); return { x: (q.x + 1) * 540, y: (1 - q.y) * 960 }; };
  const et = (txt: string, v: V, em: number, ate: number, cor?: string, r?: number) => { if (t < em || t > ate + 0.2) return null; const p = P(v); return <Etiqueta key={txt + em} txt={txt} x={p.x} y={p.y} t={t} em={em} ate={ate} cor={cor} r={r} />; };
  const virou = t >= m.onda + 0.15;
  const abertura = t < m.onda + 0.55;
  const gancho = abertura ? (t < m.onda + 0.3 ? 1 : 1 - sai((t - m.onda - 0.3) / 0.25)) : 0;
  const carros = Math.round(48312 * sai((t - m.trava - 0.1) / 2));
  const flipV = sm((t - m.onda) / 0.3);
  // caderno do Seu Nilo
  const cad = sai((t - m.anotou + 0.15) / 0.3) * (t > c[11].inicio ? 1 - sai((t - c[11].inicio) / 0.2) : 1);
  const linhaCaderno = "Dia 1: a cor vermelha", nCad = Math.floor(lim((t - m.anotou) / 1.5) * linhaCaderno.length + 0.001);
  const fimCard = t >= m.comenta - 0.05;
  return (
    <AbsoluteFill style={{ background: "#f5e3c8", overflow: "hidden" }}>
      <Cena3D t={t} c={cam} m={m} k={f} />
      {/* miniatura: desfoque suave em cima e embaixo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 520, backdropFilter: "blur(7px)", WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent)", maskImage: "linear-gradient(to bottom, black 20%, transparent)", opacity: cam.foco }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 520, backdropFilter: "blur(7px)", WebkitMaskImage: "linear-gradient(to top, black 20%, transparent)", maskImage: "linear-gradient(to top, black 20%, transparent)", opacity: cam.foco }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, transparent 58%, rgba(70,40,10,.2) 100%)" }} />
      {/* cabeçalho: dia e a pergunta que fica na cabeça o vídeo inteiro */}
      <div style={{ position: "absolute", top: 138, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: LILITA }}>
        <div style={{ background: AMAR, color: NAVY, fontSize: 84, lineHeight: 1, padding: "12px 42px 6px", borderRadius: 12, transform: "rotate(-2deg)", boxShadow: "0 8px 0 rgba(22,35,63,.3)", border: "7px solid #fffdf6" }}>DIA {l.dia}</div>
        <div style={{ background: "#fffdf6", color: NAVY, fontSize: 38, lineHeight: 1, padding: "11px 24px 8px", borderRadius: 10, transform: "rotate(1deg)", boxShadow: "0 6px 0 rgba(22,35,63,.25)" }}>{virou ? "1 COISA SUMIU · SÓ 1 PESSOA LEMBRA" : "0 COISAS SUMIRAM · POR ENQUANTO"}</div>
      </div>
      {/* gancho do primeiro segundo */}
      {gancho > 0 && <div style={{ position: "absolute", top: 470, width: "100%", textAlign: "center", fontFamily: LILITA, opacity: gancho, transform: `scale(${volta(t / 0.3)})` }}>
        <div style={{ fontSize: 118, color: NAVY, lineHeight: 1, ...adesivo(20, 10), transform: "rotate(-3deg)" }}>HOJE SUMIU</div>
        <div style={{ fontSize: 190, lineHeight: 1.04, color: t < m.onda + 0.15 ? VERM : CINZA, ...adesivo(26, 12), transform: `rotate(2deg) perspective(900px) rotateX(${flipV * 360}deg)` }}>VERMELHO</div>
      </div>}
      {/* etiquetas presas nos objetos */}
      {et("SEMÁFORO", [3.6, 7.9, 5.4], c[2].vozEm + 1.6, c[2].fim)}
      {et("SUMIU", [3.6, 7.25, 5.8], c[3].vozEm + 0.5, m.sobrou, CINZA, -3)}
      {et("AMARELO", [2.75, 5.95, 5.8], m.sobrou + 0.35, m.entao - 0.3, "#ffc400", -2)}
      {et("VERDE", [2.75, 5, 5.8], m.sobrou + 0.75, m.entao - 0.3, "#2fd46b", 2)}
      {et("PARA OU VAI?", [0.2, 2.5, 2], m.entao + 0.35, c[3].fim, "#ffc400", 2)}
      {et("PLACA DE PARE", [-3.7, 4.5, 7.2], m.placaSobe + 0.35, m.placaVira + 0.2, VERM, -2)}
      {et("PLACA CINZA", [-3.7, 4.5, 7.2], m.placaVira + 0.55, c[4].fim, CINZA, 2)}
      {et("BOMBEIROS?", [-1.25, 3.3, 7], m.caminhao + 0.2, c[6].fim - 0.1, CINZA, -2)}
      {et("MADURO?", [10.5, 3.6, 16], m.maduro - 0.5, m.mordida - 0.35, "#ffc400", -2)}
      {et("AZEDO!", [10.1, 3.5, 16], m.azedo, c[7].fim, "#2fd46b", 3)}
      {et("CARTÃO DE QUÊ?", [-11.4, 5.2, 17], m.papel, m.ombros - 0.15, CINZA, -2)}
      {et("NEM LIGOU", [-15.6, 3.6, 17.5], m.ombros + 0.25, c[8].fim, AZUL, 2)}
      {et("NINGUÉM RECLAMA", [0, 4.9, 18], m.reclama, c[9].fim - 0.1, AZUL, -2)}
      {et("SEU NILO", [-0.9, 4.25, 18.5], m.nilo + 0.7, m.anotou - 0.2, AMAR, -2)}
      <Contador rot="CARROS PARADOS" num={Math.max(0, carros).toLocaleString("pt-BR")} t={t} em={m.trava + 0.05} ate={c[5].fim - 0.1} />
      {/* relógio das 8h */}
      {t > c[5].vozEm && t < c[5].fim && <div style={{ position: "absolute", left: 90, top: 700, fontFamily: LILITA, fontSize: 92, color: NAVY, background: "#fffdf6", padding: "12px 30px 6px", borderRadius: 18, transform: `rotate(-5deg) scale(${volta((t - c[5].vozEm) / 0.25)})`, boxShadow: "0 9px 0 rgba(22,35,63,.28)" }}>8:00</div>}
      {/* buzinas em balões de papel */}
      {t > m.trava + 0.2 && t < c[6].fim && [[120, 880, 0.2, -6], [690, 660, 0.7, 5], [640, 1020, 1.25, -3], [150, 1060, 1.8, 4]].map(([x, y, d, r], i) => { const q = t - m.trava - d; if (q < 0 || q > 1.1) return null; return <div key={i} style={{ position: "absolute", left: x, top: y, fontFamily: LILITA, fontSize: 70, color: NAVY, background: "#fffdf6", padding: "9px 26px 5px", borderRadius: 40, transform: `rotate(${r}deg) scale(${volta(q / 0.2) * (q > 0.9 ? 1 - (q - 0.9) / 0.2 : 1)})`, boxShadow: "0 7px 0 rgba(22,35,63,.25)" }}>BIIIP!</div>; })}
      {/* mordida */}
      {t > m.mordida && t < m.azedo + 0.5 && <div style={{ position: "absolute", left: 650, top: 560, fontFamily: LILITA, fontSize: 118, color: NAVY, ...adesivo(18, 9), transform: `rotate(8deg) scale(${volta((t - m.mordida) / 0.18)})` }}>NHAC!</div>}
      {/* caderno do Seu Nilo */}
      {cad > 0 && <div style={{ position: "absolute", left: 90, right: 90, top: 400, transform: `translateY(${(1 - cad) * -620}px) rotate(-2deg)`, background: "#fffdf6", borderRadius: 14, padding: "30px 34px 34px 92px", boxShadow: "0 16px 0 rgba(22,35,63,.28)", backgroundImage: "repeating-linear-gradient(transparent 0 84px, #bcd8f2 84px 88px)", backgroundPositionY: "22px", minHeight: 250 }}>
        <div style={{ position: "absolute", left: 56, top: 0, bottom: 0, width: 5, background: "#f2b8c6" }} />
        {[...Array(5)].map((_, i) => <div key={i} style={{ position: "absolute", left: 16, top: 26 + i * 50, width: 26, height: 26, borderRadius: 26, background: "#d9d3c2", boxShadow: "inset 0 3px 3px rgba(0,0,0,.25)" }} />)}
        <div style={{ fontFamily: CAVEAT, fontSize: 104, lineHeight: "88px", color: "#23304f" }}>{linhaCaderno.slice(0, nCad)}<span style={{ opacity: nCad < linhaCaderno.length ? 1 : 0, color: "#7a7f8a" }}>|</span></div>
        <div style={{ fontFamily: CAVEAT, fontSize: 66, lineHeight: "88px", color: "#7a7f8a", opacity: lim((t - m.anotou - 1.7) / 0.3) }}>ninguém mais lembra...</div>
      </div>}
      {/* a chamada do fim: o público decide */}
      {t >= m.interrogacao - 0.1 && !fimCard && <div style={{ position: "absolute", top: 390, width: "100%", textAlign: "center", fontFamily: LILITA, fontSize: 118, lineHeight: 1.02, color: NAVY, ...adesivo(20, 10), transform: `rotate(-2deg) scale(${volta((t - m.interrogacao + 0.1) / 0.3)})` }}>AMANHÃ SOME<br />OUTRA COISA</div>}
      {fimCard && <div style={{ position: "absolute", top: 360, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ textAlign: "center", fontFamily: LILITA, fontSize: 124, lineHeight: 1, color: NAVY, ...adesivo(20, 10), transform: `rotate(-2deg) scale(${volta((t - m.comenta) / 0.28)})` }}>O QUE SOME<br /><span style={{ color: AZUL }}>AMANHÃ?</span></div>
        <div style={{ height: 8 }} />
        <Comentario txt="a segunda-feira" t={t} em={m.comenta + 0.55} r={-2} />
        <Comentario txt="o boleto" t={t} em={m.comenta + 1} r={1.5} />
        <Comentario txt="o despertador" t={t} em={m.comenta + 1.45} r={-1} />
        <div style={{ alignSelf: "center", fontFamily: LILITA, fontSize: 30, color: "#fff", background: "rgba(22,35,63,.82)", padding: "7px 18px 5px", borderRadius: 10, opacity: lim((t - m.comenta - 1.6) * 4) }}>COMENTÁRIOS DE EXEMPLO · FICÇÃO CRIADA COM IA</div>
      </div>}
      {fimCard && t > c[12].vozEm + c[12].vozDur - 0.1 && <div style={{ position: "absolute", top: 1085, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: LILITA, fontSize: 96, color: NAVY, transform: `scale(${volta((t - (c[12].vozEm + c[12].vozDur) + 0.1) / 0.25)})` }}>
        <div style={{ ...adesivo(18, 8) }}>COMENTA AQUI</div>
        <svg width={170} height={170} viewBox="0 0 100 100" style={{ marginTop: 4, transform: `translateY(${Math.sin(t * 7) * 16}px)`, filter: "drop-shadow(0 7px 0 rgba(22,35,63,.4))" }}><path d="M36 8 H64 V50 H86 L50 94 L14 50 H36 Z" fill={AZUL} stroke="#fff" strokeWidth={7} strokeLinejoin="round" /></svg>
      </div>}
      <Legenda l={l} t={t} onda={m.onda} escondida={t < c[1].inicio || t > c[12].vozEm + c[12].vozDur - 0.1} />
      <Audio src={staticFile(`${l.id}.wav`)} />
    </AbsoluteFill>
  );
};
