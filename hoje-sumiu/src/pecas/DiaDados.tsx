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
      {d.curtidas != null && <div style={{ fontSize: 58, lineHeight: 1 }}>♥ {d.curtidas} curtidas</div>}
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

// ícones de papel das opções de voto (viewBox 100x100)
const ICONES: Record<string, React.ReactNode> = {
  chuva: <g><circle cx="34" cy="44" r="19" fill="#a9bdd6" /><circle cx="56" cy="36" r="24" fill="#b9cbe2" /><circle cx="76" cy="48" r="16" fill="#a9bdd6" /><rect x="22" y="46" width="66" height="18" rx="9" fill="#a9bdd6" /><path d="M34 70 q8 11 0 17 q-8 -6 0 -17z" fill="#3f86ee" /><path d="M54 74 q8 11 0 17 q-8 -6 0 -17z" fill="#3f86ee" /><path d="M74 70 q8 11 0 17 q-8 -6 0 -17z" fill="#3f86ee" /></g>,
  queijo: <g><circle cx="44" cy="56" r="30" fill="#e8a53a" /><circle cx="44" cy="56" r="25" fill="#f4bf55" /><circle cx="33" cy="48" r="4" fill="#e29a2c" /><circle cx="52" cy="62" r="5" fill="#e29a2c" /><circle cx="46" cy="44" r="3" fill="#e29a2c" /><circle cx="64" cy="34" r="18" fill="#e8a53a" /><circle cx="64" cy="34" r="14" fill="#f4bf55" /><circle cx="60" cy="31" r="3" fill="#e29a2c" /></g>,
  despertador: <g><circle cx="26" cy="22" r="12" fill="#ffd23f" /><circle cx="74" cy="22" r="12" fill="#ffd23f" /><circle cx="50" cy="56" r="34" fill="#3ec1a8" /><circle cx="50" cy="56" r="26" fill="#fffdf6" /><path d="M50 56 V38 M50 56 L62 64" stroke="#16233f" strokeWidth="6" strokeLinecap="round" fill="none" /><path d="M32 90 l-6 8 M68 90 l6 8" stroke="#16233f" strokeWidth="6" strokeLinecap="round" /></g>,
  fotos: <g transform="rotate(-8 50 50)"><rect x="12" y="20" width="76" height="62" rx="5" fill="#fffdf6" stroke="#cdbf9c" strokeWidth="4" /><rect x="20" y="28" width="60" height="42" fill="#dcc08f" /><circle cx="64" cy="40" r="7" fill="#f3e3bd" /><path d="M20 70 L38 46 L52 62 L62 52 L80 70 Z" fill="#9b7b4a" /></g>,
  aviao: <g transform="rotate(-20 50 50)"><path d="M10 52 Q50 44 90 50 Q50 58 10 52z" fill="#fffdf6" stroke="#8c98a6" strokeWidth="3" /><path d="M44 50 L28 22 L40 22 L62 50z" fill="#3f86ee" /><path d="M44 52 L28 80 L40 80 L62 52z" fill="#3f86ee" /><path d="M14 51 L8 38 L16 38 L24 50z" fill="#3f86ee" /></g>,
  mala: <g><path d="M38 28 V20 H62 V28" stroke="#16233f" strokeWidth="6" fill="none" /><rect x="18" y="28" width="64" height="52" rx="8" fill="#e8553a" /><rect x="18" y="46" width="64" height="7" fill="#b93d27" /><rect x="44" y="42" width="12" height="16" rx="2" fill="#ffd23f" /><circle cx="32" cy="86" r="5" fill="#16233f" /><circle cx="68" cy="86" r="5" fill="#16233f" /></g>,
  predio: <g><rect x="18" y="20" width="36" height="72" rx="3" fill="#f4bf55" /><rect x="50" y="38" width="32" height="54" rx="3" fill="#5cb8e4" />{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x="25" y={28 + i * 12} width="8" height="7" fill="#fffdf6" /><rect x="39" y={28 + i * 12} width="8" height="7" fill="#fffdf6" /></g>)}{[0, 1, 2].map((i) => <rect key={i} x="57" y={46 + i * 13} width="18" height="7" fill="#fffdf6" />)}</g>,
  sombra: <g><ellipse cx="50" cy="90" rx="38" ry="7" fill="rgba(22,35,63,.28)" /><rect x="44" y="58" width="12" height="32" rx="3" fill="#7a5230" /><circle cx="50" cy="36" r="26" fill="#4cae5c" /><circle cx="30" cy="52" r="17" fill="#3f9a4f" /><circle cx="70" cy="52" r="17" fill="#3f9a4f" /></g>,
};
// cartão final com várias opções de voto: { opcoes: [{ n, txt, icone, em }] }. O narrador fala "Comente o número" e cada linha entra na palavra dela.
const Opcoes: React.FC<{ t: number; d: Spec; em: number }> = ({ t, d, em }) => {
  const R = [-1.6, 1.2, -1, 1.5, -1.3];
  return <div style={{ position: "absolute", top: 342, left: 56, right: 56, display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ textAlign: "center", fontFamily: LILITA, fontSize: 108, lineHeight: 0.98, color: NAVY, ...adesivo(18, 9), transform: `rotate(-2deg) scale(${volta((t - em) / 0.28)})`, marginBottom: 10 }}>O QUE SOME <span style={{ color: AZUL }}>AMANHÃ?</span></div>
    {(d.opcoes as Spec[]).map((o, i) => {
      if (t < o.em) return null;
      const e = volta((t - o.em) / 0.28);
      return <div key={o.n} style={{ display: "flex", alignItems: "center", gap: 20, height: 106, boxSizing: "border-box", background: "#fffdf6", borderRadius: 30, padding: "0 26px 0 12px", fontFamily: LILITA, color: NAVY, boxShadow: "0 9px 0 rgba(22,35,63,.28)", transform: `rotate(${R[i % 5]}deg) scale(${e})` }}>
        <span style={{ width: 82, height: 82, borderRadius: 82, background: AMAR, border: `6px solid ${NAVY}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 58, paddingTop: 5 }}>{o.n}</span>
        <span style={{ flex: 1, fontSize: 64, lineHeight: 1, paddingTop: 5 }}>{String(o.txt).toUpperCase()}</span>
        <svg width={90} height={90} viewBox="0 0 100 100">{ICONES[o.icone]}</svg>
      </div>;
    })}
  </div>;
};

// ---------------------------------------------------------------- aberturas (Dia 8 em diante)
// `abertura: { tipo, linhas: [..], ate }`: o gancho do primeiro segundo, antes da onda. Cada dia usa um tipo
// diferente do dia anterior. Banco: manchete, alarme, contagem, pergunta, iris (o catálogo está em PECAS.md).
const Abertura: React.FC<{ t: number; d: Spec; ate: number }> = ({ t, d, ate }) => {
  if (t > ate + 0.25) return null;
  const sai2 = t > ate ? 1 - sai((t - ate) / 0.25) : 1, L: string[] = d.linhas ?? [], k = volta(t / 0.22);
  if (d.tipo === "manchete") return <div style={{ position: "absolute", top: 400, left: 50, right: 50, opacity: sai2, transform: `rotate(${-4 + 4 * k}deg) scale(${0.4 + 0.6 * k})`, background: "#f6f1e4", border: `8px solid ${NAVY}`, borderRadius: 10, padding: "18px 30px 26px", fontFamily: LILITA, color: NAVY, textAlign: "center", boxShadow: "0 16px 0 rgba(22,35,63,.3)" }}>
    <div style={{ fontSize: 46, borderBottom: `6px double ${NAVY}`, paddingBottom: 8, letterSpacing: 4 }}>EDIÇÃO EXTRA · DIA {d.dia}</div>
    {L.map((x, i) => <div key={i} style={{ fontSize: i ? 66 : 120, lineHeight: 1.02, marginTop: 12, color: i ? "#5a6170" : NAVY, opacity: lim((t - 0.25 - i * 0.35) * 5) }}>{x}</div>)}
  </div>;
  if (d.tipo === "alarme") { const pisca = Math.floor(t * 6) % 2; return <>
    <AbsoluteFill style={{ boxShadow: `inset 0 0 ${pisca ? 160 : 90}px rgba(255,90,40,${0.55 * sai2})` }} />
    <div style={{ position: "absolute", top: 1170, left: 60, right: 60, opacity: sai2, transform: `scale(${k})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, fontFamily: LILITA }}>
      <div style={{ background: pisca ? "#ff5a3c" : AMAR, color: NAVY, fontSize: 64, padding: "12px 34px 6px", borderRadius: 14, border: "7px solid #fffdf6", transform: "rotate(-2deg)" }}>⚠ ALERTA</div>
      {L.map((x, i) => <div key={i} style={{ fontSize: i ? 72 : 104, lineHeight: 1.02, color: NAVY, textAlign: "center", ...adesivo(18, 9), opacity: lim((t - 0.2 - i * 0.4) * 5), transform: `scale(${volta((t - 0.2 - i * 0.4) / 0.2)})` }}>{x}</div>)}
    </div></>; }
  if (d.tipo === "contagem") { const n = Math.max(1, 3 - Math.floor(t / (ate / 3))); return <div style={{ position: "absolute", top: 380, width: "100%", textAlign: "center", fontFamily: LILITA, opacity: sai2, color: NAVY }}>
    <div style={{ fontSize: 330, lineHeight: 1, ...adesivo(24, 12), transform: `scale(${volta(((t % (ate / 3)) / (ate / 3)) * 3)})` }}>{n}</div>
    {L.map((x, i) => <div key={i} style={{ fontSize: 70, ...adesivo(16, 8) }}>{x}</div>)}
  </div>; }
  if (d.tipo === "pergunta") { const txt = L.join(" "), n = Math.floor(lim(t / (ate * 0.8)) * txt.length); return <div style={{ position: "absolute", top: 430, left: 80, right: 80, opacity: sai2, transform: "rotate(-2deg)", background: "#fffdf6", borderRadius: 14, padding: "30px 36px", fontFamily: CAVEAT, fontSize: 96, lineHeight: 1.05, color: "#23304f", boxShadow: "0 14px 0 rgba(22,35,63,.28)" }}>{txt.slice(0, n)}<span style={{ opacity: Math.floor(t * 4) % 2 }}>|</span></div>; }
  // carimbo (Dia 10): um carimbo azul bate na tela com tremida e clarão, e embaixo vem a coisa que sumiu
  if (d.tipo === "carimbo") {
    const k = lim(t / 0.16), pancada = t > 0.16 && t < 0.6 ? Math.sin((t - 0.16) * 70) * (1 - (t - 0.16) / 0.44) * 16 : 0;
    const esc = t < 0.16 ? 2.8 - 1.8 * k : 1 + Math.max(0, 0.06 - (t - 0.16) * 0.3), flash = t > 0.14 && t < 0.36 ? 0.7 * (1 - (t - 0.14) / 0.22) : 0;
    return <>
      <AbsoluteFill style={{ background: "#fffdf6", opacity: flash * sai2 }} />
      <div style={{ position: "absolute", top: 380 + pancada, left: 50, right: 50, opacity: sai2 * lim(t * 12), transform: `translateX(${pancada * 0.6}px) rotate(-7deg) scale(${esc})`, textAlign: "center", fontFamily: LILITA }}>
        <div style={{ display: "inline-block", color: "#fff", background: AZUL, border: "14px solid #fffdf6", borderRadius: 18, padding: "6px 54px 0", fontSize: 250, lineHeight: 1.05, boxShadow: "0 18px 0 rgba(22,35,63,.35)" }}>SUMIU</div>
        {L.map((x, i) => <div key={i} style={{ fontSize: 88, lineHeight: 1.05, marginTop: 26, color: NAVY, ...adesivo(16, 8), opacity: lim((t - 0.35 - i * 0.25) * 6) }}>{x}</div>)}
      </div></>;
  }
  if (d.tipo === "iris") { const r = 1500 * (1 - sm(t / ate)) + 330; return <><AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, transparent ${r}px, ${NAVY} ${r + 4}px)`, opacity: sai2 }} />
    <div style={{ position: "absolute", top: 1380, width: "100%", textAlign: "center", fontFamily: LILITA, fontSize: 80, color: "#fff", opacity: sai2 * lim((t - 0.3) * 4) }}>{L[0]}</div></>; }
  return null;
};
// transições à mão (o Remotion 4.0.300 não tem light-leaks): { em, tipo: "flash" | "luz" | "pisca", dur }
const Transicoes: React.FC<{ t: number; lista: Spec[] }> = ({ t, lista }) => <>{lista.map((x, i) => {
  const q = (t - x.em) / (x.dur ?? 0.5); if (q < 0 || q > 1) return null;
  if (x.tipo === "flash") return <AbsoluteFill key={i} style={{ background: "#fffdf6", opacity: Math.pow(1 - q, 2) }} />;
  if (x.tipo === "pisca") return <AbsoluteFill key={i} style={{ background: NAVY, opacity: q < 0.5 ? 1 : 2 - 2 * q }} />;
  return <AbsoluteFill key={i} style={{ background: `linear-gradient(${110 + q * 40}deg, transparent ${q * 120 - 40}%, rgba(255,200,110,.75) ${q * 120 - 15}%, rgba(255,240,200,.85) ${q * 120}%, transparent ${q * 120 + 25}%)`, mixBlendMode: "screen", opacity: Math.sin(q * Math.PI) }} />;
})}</>;

export const DiaDados: React.FC<{ linha: LinhaDados }> = ({ linha: l }) => {
  const f = useCurrentFrame(), t = f / 30, m = l.marcas, c = l.cenas, d = l.cena, final = c[c.length - 1];
  CENARIOS[l.dia] = (w) => { montaCena(w, [...(d.heroi?.peca ? [d.heroi.peca] : []), ...(d.pecas ?? [])]); const fim = w.extra; w.extra = (q) => { fim?.(q); if (d.calor) w.sol.scale.setScalar(1 + 0.45 * sm((q - m.onda - 0.5) / 5));
    // `somemCarros`: os carros do trânsito do fundo encolhem em onda nesse tempo e não voltam (dia em que os veículos somem)
    // `semCarros`: os veículos já sumiram em um dia anterior (Dia 7): nenhum carro, caminhão ou giroflex aparece em lugar nenhum
    if (d.semCarros) { w.carros.forEach((c: any) => { c.raiz.visible = false; }); if (w.caminhao) w.caminhao.visible = false; if (w.giroflex) w.giroflex.visible = false; }
    // `somemPredios`: os prédios do fundo (os apartamentos) dobram como papel em onda e somem; ordem: do centro para as bordas
    if (d.somemPredios !== undefined) w.tetos.forEach((p: any) => { const dt = d.somemPredios + Math.hypot(p.x, p.z + 6) * 0.05, k = 1 - sm((q - dt) / 0.5); p.g.scale.y = k >= 1 ? 1 : Math.max(0.02, Math.cos((1 - k) * Math.PI / 2)); p.g.visible = k > 0.02; });
    if (d.somemCarros !== undefined) w.carros.forEach((c: any, i: number) => { const k = 1 - sm((q - d.somemCarros - (i % 13) * 0.08) / 0.35); if (k < 1) { c.raiz.scale.multiplyScalar(Math.max(0.002, k)); c.raiz.visible = c.raiz.visible && k > 0.01; } }); }; };
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
      {(d.noite ?? []).map((n: Spec, i: number) => { const k = sm((t - n.em) / 0.5) * (1 - sm((t - n.ate) / 0.5)); return k > 0 ? <AbsoluteFill key={"n" + i} style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(30,40,110,.35), rgba(12,18,60,.78))", opacity: k * (n.forca ?? 0.8) }} /> : null; })}
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
      {([] as Spec[]).concat(d.contador ?? [], d.contadores ?? []).map((k: Spec, i: number) => <Contador key={"c" + i} rot={k.rot} num={k.de !== undefined ? Math.round(k.de + (k.para - k.de) * sm((t - k.em - 0.2) / (k.conta ?? 1.5))).toLocaleString("pt-BR") + (k.suf ?? "") : k.num} t={t} em={k.em} ate={k.ate} />)}
      {d.abertura && <Abertura t={t} d={{ dia: l.dia, ...d.abertura }} ate={d.abertura.ate ?? m.onda - 0.1} />}
      <Transicoes t={t} lista={d.transicoes ?? []} />
      {m.regra < 1e5 && <Regra t={t} em={m.regra - 0.1} ate={m.anotou - 0.1} linhas={d.regra ?? ["NÃO SOME GOVERNO", "NEM PESSOA"]} />}
      {cad > 0 && <div style={{ position: "absolute", left: 90, right: 90, top: 400, transform: `translateY(${(1 - cad) * -620}px) rotate(-2deg)`, background: "#fffdf6", borderRadius: 14, padding: "30px 34px 34px 92px", boxShadow: "0 16px 0 rgba(22,35,63,.28)", backgroundImage: "repeating-linear-gradient(transparent 0 84px, #bcd8f2 84px 88px)", backgroundPositionY: "22px", minHeight: 250 }}>
        <div style={{ position: "absolute", left: 56, top: 0, bottom: 0, width: 5, background: "#f2b8c6" }} />
        {[...Array(5)].map((_, i) => <div key={i} style={{ position: "absolute", left: 16, top: 26 + i * 50, width: 26, height: 26, borderRadius: 26, background: "#d9d3c2", boxShadow: "inset 0 3px 3px rgba(0,0,0,.25)" }} />)}
        {antes.map((x) => <div key={x} style={{ fontFamily: CAVEAT, fontSize: 104, lineHeight: "88px", color: "#6b7079" }}>{x}</div>)}
        <div style={{ fontFamily: CAVEAT, fontSize: 104, lineHeight: "88px", color: "#23304f" }}>{atual.slice(0, nCad)}<span style={{ opacity: nCad < atual.length ? 1 : 0, color: "#7a7f8a" }}>|</span></div>
      </div>}
      {t >= m.interrogacao - 0.1 && !fimCard && <div style={{ position: "absolute", top: 390, width: "100%", textAlign: "center", fontFamily: LILITA, fontSize: 118, lineHeight: 1.02, color: NAVY, ...adesivo(20, 10), transform: `rotate(-2deg) scale(${volta((t - m.interrogacao + 0.1) / 0.3)})` }}>AMANHÃ SOME<br />OUTRA COISA</div>}
      {fimCard && d.opcoes && <Opcoes t={t} d={d} em={m.comenta} />}
      {fimCard && !d.opcoes && <div style={{ position: "absolute", top: 360, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ textAlign: "center", fontFamily: LILITA, fontSize: 124, lineHeight: 1, color: NAVY, ...adesivo(20, 10), transform: `rotate(-2deg) scale(${volta((t - m.comenta) / 0.28)})` }}>O QUE SOME<br /><span style={{ color: AZUL }}>AMANHÃ?</span></div>
        <div style={{ height: 8 }} />
        {((d.exemplos ?? ["o boleto", "as chaves", "o despertador"]) as string[]).map((x, i) => <Comentario key={x} txt={x} t={t} em={m.comenta + 0.55 + i * 0.45} r={[-2, 1.5, -1][i % 3]} />)}
        <div style={{ alignSelf: "center", fontFamily: LILITA, fontSize: 30, color: "#fff", background: "rgba(22,35,63,.82)", padding: "7px 18px 5px", borderRadius: 10, opacity: lim((t - m.comenta - 1.6) * 4) }}>COMENTÁRIOS DE EXEMPLO · FICÇÃO CRIADA COM IA</div>
      </div>}
      {fimCard && t > ate - 0.1 && <div style={{ position: "absolute", top: d.opcoes ? 1205 : 1085, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: LILITA, fontSize: d.opcoes ? 84 : 96, color: NAVY, transform: `scale(${volta((t - ate + 0.1) / 0.25)})` }}>
        <div style={{ ...adesivo(18, 8) }}>{d.opcoes ? "COMENTE O NÚMERO" : "COMENTA AQUI"}</div>
        <svg width={d.opcoes ? 120 : 170} height={d.opcoes ? 120 : 170} viewBox="0 0 100 100" style={{ marginTop: 4, transform: `translateY(${Math.sin(t * 7) * 16}px)`, filter: "drop-shadow(0 7px 0 rgba(22,35,63,.4))" }}><path d="M36 8 H64 V50 H86 L50 94 L14 50 H36 Z" fill={AZUL} stroke="#fff" strokeWidth={7} strokeLinejoin="round" /></svg>
      </div>}
      <Legenda l={l} t={t} onda={m.onda} escondida={t < c[1].inicio || t > ate - 0.1} corAntes={corDia} />
      <Audio src={staticFile(`${l.id}.wav`)} />
    </AbsoluteFill>
  );
};
