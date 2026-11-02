// Um dia inteiro a partir do arquivo de dados: câmera, peças, etiquetas e a edição da série.
// Do Dia 3 em diante, um dia novo é só episodios/diaNN.json. O formato está em PECAS.md.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { sm } from "../mundo-papel";
import { AMAR, AZUL, CAVEAT, CENARIOS, CINZA, Cena3D, Comentario, Contador, Etiqueta, LILITA, Legenda, LinhaDia, NAVY, Tomada, V, adesivo, camBase, lim, sai, volta } from "../Dia";
import { Spec, montaCena } from "./objetos";

const CORES: Record<string, string> = { azul: AZUL, cinza: CINZA, amarelo: "#ffc400", verde: "#2fd46b", laranja: "#ff9f1c", gelo: "#19a7e0", rosa: "#d77fbb", ouro: AMAR };
const cor = (c?: string) => (c ? CORES[c] ?? c : undefined);
export type LinhaDados = LinhaDia & { cena: Spec };

// lugares do livro e de onde a câmera olha para eles
const LUGARES: Record<string, { geral: Partial<Tomada>; perto: Partial<Tomada> }> = {
  praca: { geral: { pos: [0.1, 3.6, 33], alvo: [0.1, 3, 17.5], fov: 44, deriva: [0, 0, -0.4], foco: 0.55 }, perto: { pos: [0.1, 3.2, 27], alvo: [0.1, 2.9, 17.5], fov: 42, deriva: [0, 0, -0.3], foco: 0.7 } },
  esquerda: { geral: { pos: [-13.6, 4.4, 31.5], alvo: [-14.1, 3.2, 13.5], fov: 44, deriva: [0, -0.06, -0.35], foco: 0.6 }, perto: { pos: [-12.4, 3.3, 27], alvo: [-12.8, 3, 15.5], fov: 40, deriva: [0, 0, -0.35], foco: 0.75 } },
  direita: { geral: { pos: [13.2, 4.6, 27], alvo: [11.6, 2.3, 13.5], fov: 44, deriva: [-0.1, -0.08, -0.7], foco: 0.6 }, perto: { pos: [12, 3, 27.4], alvo: [11.9, 2.2, 16], fov: 42, deriva: [0, 0, -0.3], foco: 0.75 } },
  ceu: { geral: { pos: [0, 24.5, 19], alvo: [0, 26.6, -14], fov: 34, deriva: [0, 0.05, -0.5], foco: 0.3 }, perto: { pos: [0, 25, 12], alvo: [0, 26.6, -14], fov: 34, deriva: [0, 0, -0.3], foco: 0.3 } },
  rua: { geral: { pos: [0.3, 2.4, 22.5], alvo: [0.3, 2, 9], fov: 46, deriva: [0, 0, -0.45], foco: 0.3 }, perto: { pos: [0.3, 2.2, 17], alvo: [0.3, 1.8, 9], fov: 44, deriva: [0, 0, -0.3], foco: 0.4 } },
  semaforo: { geral: { pos: [1.25, 1.5, 23], alvo: [3, 5.2, 5.4], fov: 46, deriva: [0.1, 0.12, -1], foco: 0.55 }, perto: { pos: [5.4, 5.5, 16], alvo: [3.5, 5.3, 5.4], fov: 36, deriva: [0, 0, -0.35], foco: 0.75 } },
  transito: { geral: { pos: [11, 31, 26], alvo: [0, 0, 1.5], fov: 50, deriva: [-0.5, 0.35, -0.2], foco: 0.75 }, perto: { pos: [9.5, 7.5, 17], alvo: [0.4, 1, 2], fov: 50, deriva: [-0.5, 0, -0.3], foco: 0.5 } },
  cidade: { geral: { pos: [10, 34, 88], alvo: [0, 12, -6], fov: 44, deriva: [-0.4, 0.1, -0.7], foco: 0.15 }, perto: { pos: [0, 16, 48], alvo: [0, 8, -4], fov: 46, deriva: [0, 0, -0.4], foco: 0.15 } },
};
function tomadas(l: LinhaDados): Tomada[] {
  const c = l.cenas, m = l.marcas, h = l.cena.heroi ?? {};
  const T: Tomada[] = [
    { t: 0, dur: 0.01, pos: h.camera ?? [0.5, 3.4, 29], alvo: h.alvo ?? [0, 7.2, 16], fov: 44, deriva: [0.1, 0.02, -0.5], foco: 0.45 },
    { t: m.onda + 0.2, dur: 2.05, pos: [10, 34, 88], alvo: [0, 12, -6], fov: 44, deriva: [-0.4, 0.1, -0.7], foco: 0.15 },
  ];
  for (const k of l.cena.cameras ?? []) { const lg = LUGARES[k.lugar]; if (k.lugar && !lg) throw new Error("lugar desconhecido: " + k.lugar); const b = lg ? (k.perto ? lg.perto : lg.geral) : {}; T.push({ dur: k.perto ? 0.6 : 1.1, arco: k.perto ? 0 : 3, ...b, ...k, t: k.em } as Tomada); }
  T.push(
    { t: c[m.iVirada].inicio - 0.15, dur: 1.6, pos: [0, 4.2, 31], alvo: [0, 4.2, -2], fov: 50, deriva: [0, 0.12, 0.25], arco: 3, foco: 0.35 },
    { t: m.nilo, dur: 0.85, pos: [0.7, 3.3, 31.2], alvo: [0.05, 2.7, 18], fov: 44, deriva: [-0.1, 0, -0.3], foco: 0.5 },
    { t: c[m.iChamado].inicio - 0.25, dur: 1.9, pos: [0, 30, 90], alvo: [0, 16, -8], fov: 44, deriva: [0, -0.05, -0.8], foco: 0.1 },
    { t: m.comenta - 0.2, dur: 1.2, pos: [0, 26, 74], alvo: [0, 18, -8], fov: 44, deriva: [0, 0, -0.3], foco: 0.05 },
  );
  return T.sort((a, b) => a.t - b.t);
}

// ---------------------------------------------------------------- pedaços da edição
const Credito: React.FC<{ t: number; em: number; ate: number; d: Spec }> = ({ t, em, ate, d }) => {
  if (t < em || t > ate + 0.2) return null;
  const e = volta((t - em) / 0.3) * (t > ate ? 1 - sai((t - ate) / 0.2) : 1);
  return <div style={{ position: "absolute", top: 470, left: 56, right: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, transform: `rotate(-1.5deg) scale(${e})` }}>
    <div style={{ background: NAVY, color: AMAR, fontFamily: LILITA, fontSize: 56, lineHeight: 1, padding: "16px 30px 11px", borderRadius: 16, border: "6px solid #fffdf6" }}>{d.rotulo ?? "O MAIS CURTIDO"}</div>
    <div style={{ width: "100%", boxSizing: "border-box", background: "#fffdf6", borderRadius: 30, padding: "30px 34px 24px", fontFamily: LILITA, color: NAVY, boxShadow: "0 12px 0 rgba(22,35,63,.3)" }}>
      <div style={{ fontSize: 55, lineHeight: 1.05, color: AZUL }}>{d.conta}</div>
      <div style={{ fontSize: d.texto.length > 12 ? 96 : 150, lineHeight: 1.1 }}>{d.texto}</div>
      <div style={{ fontSize: 58, lineHeight: 1 }}>♥ {d.curtidas} curtidas</div>
    </div>
  </div>;
};
const Regra: React.FC<{ t: number; em: number; ate: number; linhas: string[] }> = ({ t, em, ate, linhas }) => t < em || t >= ate ? null : <div style={{ position: "absolute", top: 400, width: "100%", display: "flex", justifyContent: "center" }}><div style={{ background: "#fffdf6", color: NAVY, fontFamily: LILITA, textAlign: "center", padding: "24px 44px 16px", borderRadius: 18, border: `9px solid ${NAVY}`, transform: `rotate(-3deg) scale(${volta((t - em) / 0.22)})`, boxShadow: "0 11px 0 rgba(22,35,63,.28)" }}><div style={{ fontSize: 48, color: AZUL, lineHeight: 1.1 }}>REGRA DO SEU NILO</div><div style={{ fontSize: 80, lineHeight: 1.08 }}>{linhas.map((x) => <div key={x}>{x}</div>)}</div></div></div>;

// cartão de divulgação no meio do vídeo: { em, ate, titulo, sub, chamada }. A regra está em PECAS.md.
const Divulgacao: React.FC<{ t: number; d: Spec }> = ({ t, d }) => {
  if (t < d.em || t > d.ate + 0.2) return null;
  const e = volta((t - d.em) / 0.3) * (t > d.ate ? 1 - sai((t - d.ate) / 0.2) : 1);
  return <div style={{ position: "absolute", top: 420, left: 70, right: 70, display: "flex", flexDirection: "column", alignItems: "center", transform: `rotate(-2deg) scale(${e})` }}>
    <div style={{ width: "100%", boxSizing: "border-box", background: "#fffdf6", borderRadius: 30, border: `9px solid ${NAVY}`, padding: "44px 30px 34px", fontFamily: LILITA, textAlign: "center", color: NAVY, boxShadow: "0 14px 0 rgba(22,35,63,.3)" }}>
      <div style={{ fontSize: 132, lineHeight: 1, color: AZUL }}>{d.titulo}</div>
      <div style={{ fontSize: 88, lineHeight: 1.1, marginTop: 14 }}>{d.sub}</div>
    </div>
    <div style={{ marginTop: -22, background: AMAR, color: NAVY, fontFamily: LILITA, fontSize: 80, lineHeight: 1, padding: "16px 36px 9px", borderRadius: 14, border: "7px solid #fffdf6", transform: "rotate(3deg)", boxShadow: "0 9px 0 rgba(22,35,63,.3)" }}>{d.chamada}</div>
  </div>;
};

export const DiaDados: React.FC<{ linha: LinhaDados }> = ({ linha: l }) => {
  const f = useCurrentFrame(), t = f / 30, m = l.marcas, c = l.cenas, d = l.cena, final = c[c.length - 1];
  CENARIOS[l.dia] = (w) => { montaCena(w, [...(d.heroi?.peca ? [d.heroi.peca] : []), ...(d.pecas ?? [])]); const fim = w.extra; w.extra = (q) => { fim?.(q); if (d.calor) w.sol.scale.setScalar(1 + 0.45 * sm((q - m.onda - 0.5) / 5)); }; };
  const T = useMemo(() => tomadas(l), [l]);
  const cam = camBase(T, t);
  for (const [e, a] of [[m.onda, 0.12], [m.regra, 0.06], [m.interrogacao, 0.14], ...(d.tremores ?? []).map((x: number) => [x, 0.1])] as [number, number][]) { const q = t - e; if (q > 0 && q < 0.55) { const A = a * Math.exp(-q * 8); cam.pos[0] += Math.sin(t * 71) * A; cam.pos[1] += Math.cos(t * 63) * A; cam.fov -= A * 16; } }
  const P = (v: V) => { const k = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.1, 900); k.position.set(...cam.pos); k.lookAt(...cam.alvo); k.updateMatrixWorld(); k.updateProjectionMatrix(); const q = new THREE.Vector3(...v).project(k); return { x: (q.x + 1) * 540, y: (1 - q.y) * 960 }; };
  const virou = t >= m.onda + 0.15, gancho = t < m.onda + 0.55 ? (t < m.onda + 0.3 ? 1 : 1 - sai((t - m.onda - 0.3) / 0.25)) : 0, flipV = sm((t - m.onda) / 0.3);
  const corDia = cor(d.cor) ?? AZUL, calor = d.calor ? 0.16 * sm((t - m.onda - 0.5) / 5) * (t > c[m.iVirada].inicio ? 0.6 : 1) : 0;
  const cad = sai((t - m.anotou + 0.15) / 0.3) * (t > c[m.iChamado].inicio ? 1 - sai((t - c[m.iChamado].inicio) / 0.2) : 1);
  const atual = `Dia ${l.dia}: ${l.coisa}`, nCad = Math.floor(lim((t - m.anotou) / 1.2) * atual.length + 0.001), antes: string[] = (d.sumiram ?? []).slice(-2);
  const fimCard = t >= m.comenta - 0.05, ate = final.vozEm + final.vozDur;
  const coisas = (n: number) => `${n} COISA${n === 1 ? "" : "S"} SUMI${n === 1 ? "U" : "RAM"} · SÓ 1 PESSOA LEMBRA`;
  return (
    <AbsoluteFill style={{ background: "#f5e3c8", overflow: "hidden" }}>
      <Cena3D t={t} c={cam} m={m} k={f} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 520, backdropFilter: "blur(7px)", WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent)", maskImage: "linear-gradient(to bottom, black 20%, transparent)", opacity: cam.foco }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 520, backdropFilter: "blur(7px)", WebkitMaskImage: "linear-gradient(to top, black 20%, transparent)", maskImage: "linear-gradient(to top, black 20%, transparent)", opacity: cam.foco }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, transparent 58%, rgba(70,40,10,.2) 100%)" }} />
      {calor > 0 && <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 10%, rgba(255,150,40,.9), rgba(255,130,30,.45) 70%)", opacity: calor }} />}
      <div style={{ position: "absolute", top: 138, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: LILITA }}>
        <div style={{ background: AMAR, color: NAVY, fontSize: 84, lineHeight: 1, padding: "12px 42px 6px", borderRadius: 12, transform: "rotate(-2deg)", boxShadow: "0 8px 0 rgba(22,35,63,.3)", border: "7px solid #fffdf6" }}>DIA {l.dia}</div>
        <div style={{ background: "#fffdf6", color: NAVY, fontSize: 38, lineHeight: 1, padding: "11px 24px 8px", borderRadius: 10, transform: "rotate(1deg)", boxShadow: "0 6px 0 rgba(22,35,63,.25)" }}>{coisas(virou ? l.dia : l.dia - 1)}</div>
      </div>
      {gancho > 0 && <div style={{ position: "absolute", top: 440, width: "100%", textAlign: "center", fontFamily: LILITA, opacity: gancho, transform: `scale(${volta(t / 0.3)})` }}>
        <div style={{ fontSize: 118, color: NAVY, lineHeight: 1, ...adesivo(20, 10), transform: "rotate(-3deg)" }}>HOJE SUMIU</div>
        <div style={{ fontSize: (d.titulo ?? l.coisa).length > 9 ? 130 : 190, lineHeight: 1.04, color: t < m.onda + 0.15 ? corDia : CINZA, ...adesivo(26, 12), transform: `rotate(2deg) perspective(900px) rotateX(${flipV * 360}deg)` }}>{(d.titulo ?? l.coisa).toUpperCase()}</div>
      </div>}
      {d.credito && <Credito t={t} em={m.credito - 0.05} ate={c[m.iCredito].fim - 0.1} d={d.credito} />}
      {(d.etiquetas ?? []).map((e: Spec) => { if (t < e.em || t > e.ate + 0.2) return null; const p = P(e.pos); return <Etiqueta key={e.txt + e.em} txt={e.txt} x={p.x} y={p.y} t={t} em={e.em} ate={e.ate} cor={cor(e.cor) ?? AZUL} r={e.r ?? -2} />; })}
      {d.divulgacao && <Divulgacao t={t} d={d.divulgacao} />}
      {d.contador && <Contador rot={d.contador.rot} num={d.contador.num} t={t} em={d.contador.em} ate={d.contador.ate} />}
      {m.regra < 1e5 && <Regra t={t} em={m.regra - 0.1} ate={m.anotou - 0.1} linhas={d.regra ?? ["NÃO SOME GOVERNO", "NEM PESSOA"]} />}
      {cad > 0 && <div style={{ position: "absolute", left: 90, right: 90, top: 400, transform: `translateY(${(1 - cad) * -620}px) rotate(-2deg)`, background: "#fffdf6", borderRadius: 14, padding: "30px 34px 34px 92px", boxShadow: "0 16px 0 rgba(22,35,63,.28)", backgroundImage: "repeating-linear-gradient(transparent 0 84px, #bcd8f2 84px 88px)", backgroundPositionY: "22px", minHeight: 250 }}>
        <div style={{ position: "absolute", left: 56, top: 0, bottom: 0, width: 5, background: "#f2b8c6" }} />
        {[...Array(5)].map((_, i) => <div key={i} style={{ position: "absolute", left: 16, top: 26 + i * 50, width: 26, height: 26, borderRadius: 26, background: "#d9d3c2", boxShadow: "inset 0 3px 3px rgba(0,0,0,.25)" }} />)}
        {antes.map((x) => <div key={x} style={{ fontFamily: CAVEAT, fontSize: 104, lineHeight: "88px", color: "#6b7079" }}>{x}</div>)}
        <div style={{ fontFamily: CAVEAT, fontSize: 104, lineHeight: "88px", color: "#23304f" }}>{atual.slice(0, nCad)}<span style={{ opacity: nCad < atual.length ? 1 : 0, color: "#7a7f8a" }}>|</span></div>
      </div>}
      {t >= m.interrogacao - 0.1 && !fimCard && <div style={{ position: "absolute", top: 390, width: "100%", textAlign: "center", fontFamily: LILITA, fontSize: 118, lineHeight: 1.02, color: NAVY, ...adesivo(20, 10), transform: `rotate(-2deg) scale(${volta((t - m.interrogacao + 0.1) / 0.3)})` }}>AMANHÃ SOME<br />OUTRA COISA</div>}
      {fimCard && <div style={{ position: "absolute", top: 360, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ textAlign: "center", fontFamily: LILITA, fontSize: 124, lineHeight: 1, color: NAVY, ...adesivo(20, 10), transform: `rotate(-2deg) scale(${volta((t - m.comenta) / 0.28)})` }}>O QUE SOME<br /><span style={{ color: AZUL }}>AMANHÃ?</span></div>
        <div style={{ height: 8 }} />
        {((d.exemplos ?? ["o boleto", "as chaves", "o despertador"]) as string[]).map((x, i) => <Comentario key={x} txt={x} t={t} em={m.comenta + 0.55 + i * 0.45} r={[-2, 1.5, -1][i % 3]} />)}
        <div style={{ alignSelf: "center", fontFamily: LILITA, fontSize: 30, color: "#fff", background: "rgba(22,35,63,.82)", padding: "7px 18px 5px", borderRadius: 10, opacity: lim((t - m.comenta - 1.6) * 4) }}>COMENTÁRIOS DE EXEMPLO · FICÇÃO CRIADA COM IA</div>
      </div>}
      {fimCard && t > ate - 0.1 && <div style={{ position: "absolute", top: 1085, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: LILITA, fontSize: 96, color: NAVY, transform: `scale(${volta((t - ate + 0.1) / 0.25)})` }}>
        <div style={{ ...adesivo(18, 8) }}>COMENTA AQUI</div>
        <svg width={170} height={170} viewBox="0 0 100 100" style={{ marginTop: 4, transform: `translateY(${Math.sin(t * 7) * 16}px)`, filter: "drop-shadow(0 7px 0 rgba(22,35,63,.4))" }}><path d="M36 8 H64 V50 H86 L50 94 L14 50 H36 Z" fill={AZUL} stroke="#fff" strokeWidth={7} strokeLinejoin="round" /></svg>
      </div>}
      <Legenda l={l} t={t} onda={m.onda} escondida={t < c[1].inicio || t > ate - 0.1} corAntes={corDia} />
      <Audio src={staticFile(`${l.id}.wav`)} />
    </AbsoluteFill>
  );
};
