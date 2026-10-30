// Formato do Arquivo 3:33 (desde 26/10/2026): cenas 3D em terceira pessoa feitas em código (motor3d), cortes em
// "chicote" entre os planos, legenda palavra por palavra, medidas na tela, etiqueta de "arquivo" e cartão final datilografado.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as carregarElite } from "@remotion/google-fonts/SpecialElite";
import { loadFont as carregarAnton } from "@remotion/google-fonts/Anton";
import { loadFont as carregarInter } from "@remotion/google-fonts/Inter";
import { FPS, q } from "../serie/tempo";
import { Mundo3D } from "../motor3d/Mundo3D";

export const ELITE = carregarElite("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const ANTON = carregarAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const INTER = carregarInter("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;
const UI = `${INTER}, Arial, sans-serif`;
const COR = { vermelho: "#FF3B3B", amarelo: "#FFD23F", texto: "#F5F7FA", papel: "#E9E2D0" };

const lim = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const suave = (x: number) => { const t = lim(x); return t * t * (3 - 2 * t); };
const saida = (x: number) => 1 - Math.pow(1 - lim(x), 3);

// ---------------------------------------------------------------- tipos
export type Visual = {
  tipo: "video" | "foto" | "fotoRecebida" | "final" | "3d";
  planos?: string[]; pesos?: number[]; // tipo "3d": tomadas do motor 3D, em sequência (cortes secos)
  arquivo?: string; inicio?: number; velocidade?: number; durClipe?: number;
  zoom?: [number, number]; foco?: [number, number]; mover?: [number, number]; tremer?: number; legendaFoto?: string;
};
export type Extra =
  | { tipo: "cartao"; titulo: string; texto: string; em: number; ate?: number; y?: number }
  | { tipo: "textao"; texto: string; em: number; ate: number }
  | { tipo: "remendo"; x: number; y: number; w: number; h: number; texto: string }
  | { tipo: "marcador"; x: number; y: number; texto: string; sub?: string; em: number }
  | { tipo: "relampago"; em: number }
  | { tipo: "dado"; rotulo: string; de: number; ate: number; em: number; fim?: number; sufixo?: string; y?: number }
  | { tipo: "visor"; em: number; ate?: number; texto?: string }
  | { tipo: "grupo"; nome: string; sub?: string; em: number; intervalo?: number; mensagens: { de: string; texto: string; foto?: boolean; eu?: boolean }[] }
  | { tipo: "audio"; de: string; em: number; dur: number; y?: number }
  | { tipo: "olhoMagico"; em: number; ate?: number; texto?: string }
  | { tipo: "planta"; em: number; ate?: number; contaEm?: number; contaFim?: number; destacaEm?: number };
export type Palavra = { w: string; em: number };
export type Bloco = { palavras: Palavra[]; de: number; ate: number };
export type CenaT = { visual: Visual; extras?: Extra[]; entrada?: "corte" | "flash" | "glitch" | "preto"; semLegenda?: boolean;
  indice: number; inicio: number; fim: number; vozEm: number; vozDur: number; legenda: string; blocos: Bloco[] };
export type LinhaCaso = { id: string; serie: string; episodio: number; titulo: string; duracao: number; audio: string; cenas: CenaT[] };

// ---------------------------------------------------------------- câmera
/** Quadro que move a "câmera" sobre a imagem ou o vídeo: zoom lento, deslocamento e tremor opcional. */
const Camera: React.FC<{ v: Visual; s: number; dur: number; children: React.ReactNode }> = ({ v, s, dur, children }) => {
  const p = suave(s / Math.max(0.1, dur));
  const [z0, z1] = v.zoom ?? [1.04, 1.12];
  const [fx, fy] = v.foco ?? [50, 50];
  const [mx, my] = v.mover ?? [0, 0];
  const tr = v.tremer ?? 0;
  const tx = mx * p + (tr ? Math.sin(s * 71) * tr + Math.sin(s * 43) * tr * 0.6 : 0);
  const ty = my * p + (tr ? Math.cos(s * 67) * tr * 0.7 : 0);
  return (
    <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${z0 + (z1 - z0) * p})`, transformOrigin: `${fx}% ${fy}%` }}>
      {children}
    </AbsoluteFill>
  );
};

const GRADE = "contrast(1.08) saturate(0.88) brightness(0.96)";
const Midia: React.FC<{ v: Visual; dur: number }> = ({ v, dur }) => {
  if (!v.arquivo) return null;
  const estilo: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", filter: GRADE };
  if (v.tipo === "video") {
    const ini = v.inicio ?? 0, clipe = v.durClipe ?? 5;
    // se a cena for mais longa que o clipe, desacelera para não acabar antes
    const vel = Math.min(v.velocidade ?? 1, (clipe - ini - 0.05) / dur);
    return <OffthreadVideo src={staticFile(v.arquivo)} startFrom={q(ini)} playbackRate={vel} muted style={estilo} />;
  }
  return <Img src={staticFile(v.arquivo)} style={estilo} />;
};

// ---------------------------------------------------------------- extras
/** Notificação flutuando no ar, em perspectiva (nada de tela de celular em primeira pessoa). */
const Cartao: React.FC<{ e: Extract<Extra, { tipo: "cartao" }>; s: number }> = ({ e, s }) => {
  const f = Math.round((s - e.em) * FPS);
  if (f < 0 || (e.ate !== undefined && s > e.ate + 0.25)) return null;
  const some = e.ate !== undefined ? lim(1 - (s - e.ate) / 0.25) : 1; // "ate": sai antes de outro extra entrar
  const m = spring({ frame: f, fps: FPS, config: { damping: 16, stiffness: 120, mass: 0.9 } }) * some;
  const boia = Math.sin(s * 1.6) * 8;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: e.y ?? 560, display: "flex", justifyContent: "center", perspective: 1400 }}>
      <div style={{ width: 760, padding: "30px 34px", borderRadius: 34, background: "rgba(16,20,32,0.72)", border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(120,170,255,0.18)", backdropFilter: "blur(14px)",
        transform: `translateY(${(1 - m) * 90 + boia}px) rotateX(${8 - 4 * m}deg) rotateY(${-16 + 6 * m}deg) scale(${0.85 + 0.15 * m})`, opacity: lim(m * 1.4),
        display: "flex", gap: 26, alignItems: "center" }}>
        <div style={{ width: 92, height: 92, borderRadius: 26, background: "#2B3247", color: "#C9D3EA", fontFamily: UI, fontWeight: 700, fontSize: 52, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
            <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 38, color: "#F2F5FF" }}>{e.titulo}</span>
            <span style={{ fontFamily: UI, fontSize: 30, color: "#8E9AB8" }}>3:33</span>
          </div>
          <span style={{ fontFamily: UI, fontSize: 36, color: "#C9D3EA" }}>{e.texto}</span>
        </div>
      </div>
    </div>
  );
};

/** Frase grande que aparece letra por letra (a mensagem do remetente). */
const Textao: React.FC<{ e: Extract<Extra, { tipo: "textao" }>; s: number }> = ({ e, s }) => {
  if (s < e.em) return null;
  const n = Math.floor(lim((s - e.em) / Math.max(0.1, e.ate - e.em)) * e.texto.length + 0.999);
  const tremor = s - e.em < 0.25 ? Math.sin(s * 120) * 10 : 0;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 80px", transform: `translateX(${tremor}px)` }}>
      <div style={{ fontFamily: ANTON, fontSize: 150, lineHeight: 1.02, textAlign: "center", color: COR.texto, textTransform: "uppercase",
        textShadow: "0 0 30px rgba(255,59,59,0.85), 0 0 90px rgba(255,59,59,0.45), 0 10px 0 rgba(0,0,0,0.6)" }}>
        {e.texto.slice(0, n)}<span style={{ opacity: Math.floor(s * 4) % 2 ? 0 : 1, color: COR.vermelho }}>{n < e.texto.length ? "▌" : ""}</span>
      </div>
    </AbsoluteFill>
  );
};

/** Anotação de "arquivo": linha fina até um ponto da imagem e uma etiqueta datilografada. */
const Marcador: React.FC<{ e: Extract<Extra, { tipo: "marcador" }>; s: number }> = ({ e, s }) => {
  if (s < e.em) return null;
  const p = saida((s - e.em) / 0.5), pl = saida((s - e.em - 0.35) / 0.4);
  const xEt = 700, yEt = e.y - 250;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={e.x} cy={e.y} r={70 * p} fill="none" stroke={COR.vermelho} strokeWidth={5} opacity={0.95} />
        <line x1={e.x + 50} y1={e.y - 50} x2={e.x + 50 + (xEt - e.x - 50) * p} y2={e.y - 50 + (yEt + 40 - e.y + 50) * p} stroke={COR.vermelho} strokeWidth={4} />
      </svg>
      <div style={{ position: "absolute", left: xEt - 40, top: yEt - 70, opacity: pl, transform: `translateY(${(1 - pl) * 20}px)` }}>
        <div style={{ fontFamily: ELITE, fontSize: 64, color: COR.texto, background: "rgba(0,0,0,0.55)", padding: "6px 18px", border: `3px solid ${COR.vermelho}` }}>{e.texto}</div>
        {e.sub && <div style={{ fontFamily: ELITE, fontSize: 36, color: "#D8DEEA", marginTop: 10, paddingLeft: 6 }}>{e.sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** Medida na tela (estilo infográfico): um rótulo e um número que conta até o valor final. */
const Dado: React.FC<{ e: Extract<Extra, { tipo: "dado" }>; s: number }> = ({ e, s }) => {
  if (s < e.em) return null;
  const fim = e.fim ?? e.em + 1.6, p = 1 - Math.pow(1 - lim((s - e.em) / Math.max(0.1, fim - e.em)), 3);
  const entra = saida((s - e.em) / 0.3);
  const n = Math.round(e.de + (e.ate - e.de) * p).toLocaleString("pt-BR");
  return (
    <div style={{ position: "absolute", top: e.y ?? 250, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: entra, transform: `translateY(${(1 - entra) * -20}px)` }}>
      <div style={{ padding: "14px 34px 18px", background: "rgba(6,9,18,0.72)", border: "2px solid rgba(255,255,255,0.18)", borderRadius: 18, textAlign: "center", minWidth: 520 }}>
        <div style={{ fontFamily: ELITE, fontSize: 32, color: "#AFC0DD", letterSpacing: 4 }}>{e.rotulo}</div>
        <div style={{ fontFamily: ANTON, fontSize: 104, lineHeight: 1.05, color: COR.texto }}>{n}<span style={{ color: COR.vermelho }}>{e.sufixo ?? ""}</span></div>
      </div>
    </div>
  );
};

/** Visor de câmera fotográfica: cantos, mira, REC piscando, hora e zoom (para "a foto foi tirada daqui"). */
/** Visão pelo olho mágico: tudo preto, com um círculo de vidro no meio. */
const OlhoMagico: React.FC<{ e: Extract<Extra, { tipo: "olhoMagico" }>; s: number }> = ({ e, s }) => {
  if (s < e.em || (e.ate !== undefined && s > e.ate)) return null;
  const cx = 540, cy = 830, r = 490;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="om" gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={r}>
            <stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="0.86" stopColor="#000" stopOpacity="0.55" /><stop offset="1" stopColor="#000" stopOpacity="1" />
          </radialGradient>
          <mask id="omBuraco"><rect width={1080} height={1920} fill="#fff" /><circle cx={cx} cy={cy} r={r} fill="#000" /></mask>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="url(#om)" />
        <rect width={1080} height={1920} fill="#020203" mask="url(#omBuraco)" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2d33" strokeWidth={14} />
        <ellipse cx={cx - 190} cy={cy - 270} rx={70} ry={26} fill="#fff" opacity={0.1} transform={`rotate(-35 ${cx - 190} ${cy - 270})`} />
      </svg>
      {e.texto && <div style={{ position: "absolute", left: 0, right: 0, top: 268, textAlign: "center", fontFamily: ELITE, fontSize: 38, color: "#d8deea", letterSpacing: 4 }}>{e.texto}</div>}
    </AbsoluteFill>
  );
};

/** A planta original do prédio (azul de engenharia): os andares vão sendo contados e o 13º fica em vermelho. */
const Planta: React.FC<{ e: Extract<Extra, { tipo: "planta" }>; s: number }> = ({ e, s }) => {
  if (s < e.em || (e.ate !== undefined && s > e.ate + 0.2)) return null;
  const some = e.ate !== undefined ? lim(1 - (s - e.ate) / 0.2) : 1;
  const m = spring({ frame: Math.round((s - e.em) * FPS), fps: FPS, config: { damping: 16, stiffness: 120, mass: 0.9 } }) * some;
  const c0 = e.contaEm ?? e.em, c1 = e.contaFim ?? c0;
  const contados = c1 > c0 ? Math.floor(lim((s - c0) / (c1 - c0)) * 13 + 0.001) : 13;
  const destaca = e.destacaEm !== undefined && s >= e.destacaEm;
  const W = 820, H = 880, n = 13, ah = 54, bx = 250, bw = 320, by0 = 800;
  return (
    <div style={{ position: "absolute", left: (1080 - W) / 2, top: 235, width: W, height: H, opacity: lim(m * 1.4), transform: `translateY(${(1 - m) * 70}px) rotate(${-1.5 + Math.sin(s * 1.1) * 0.25}deg) scale(${0.9 + 0.1 * m})`, boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}>
      <svg width={W} height={H}>
        <defs><pattern id="grade" width={40} height={40} patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5f8fd6" strokeWidth={1} opacity={0.3} /></pattern></defs>
        <rect width={W} height={H} fill="#12316e" /><rect width={W} height={H} fill="url(#grade)" />
        <rect x={14} y={14} width={W - 28} height={H - 28} fill="none" stroke="#cfe0ff" strokeWidth={3} />
        <text x={W / 2} y={62} textAnchor="middle" fontFamily={ELITE} fontSize={34} fill="#e6efff">ED. MIRANTE · PLANTA ORIGINAL · 1983</text>
        {Array.from({ length: n }, (_, i) => {
          const y = by0 - (i + 1) * ah, vermelho = i === 12 && destaca, marcado = i < contados;
          const cor = vermelho ? "#ff3b3b" : "#cfe0ff";
          return <g key={i} opacity={i === 12 && !marcado ? 0.55 : 1}>
            <rect x={bx} y={y} width={bw} height={ah} fill={vermelho ? "rgba(255,59,59,0.28)" : marcado ? "rgba(207,224,255,0.16)" : "none"} stroke={cor} strokeWidth={vermelho ? 5 : 2.5} />
            {[0, 1, 2, 3].map((k) => <rect key={k} x={bx + 28 + k * 70} y={y + 14} width={40} height={26} fill="none" stroke={cor} strokeWidth={1.5} opacity={0.7} />)}
            <text x={bx - 22} y={y + 38} textAnchor="end" fontFamily={ELITE} fontSize={32} fill={cor} fontWeight={vermelho ? 700 : 400}>{i + 1}º</text>
          </g>;
        })}
        <line x1={bx - 70} y1={by0} x2={bx + bw + 70} y2={by0} stroke="#cfe0ff" strokeWidth={4} />
        {destaca && <text x={bx + bw + 24} y={by0 - 13 * ah + 38} fontFamily={ELITE} fontSize={34} fill="#ff3b3b">???</text>}
      </svg>
    </div>
  );
};

const Visor: React.FC<{ e: Extract<Extra, { tipo: "visor" }>; s: number }> = ({ e, s }) => {
  if (s < e.em || (e.ate !== undefined && s > e.ate)) return null;
  const d = s - e.em, entra = saida(d / 0.25), foco = 1 - saida(d / 0.6);
  const seg = 7 + Math.floor(d), hora = `03:34:${String(seg).padStart(2, "0")}`;
  const canto = (x: number, y: number, dx: number, dy: number) => <path d={`M ${x + dx * 90} ${y} L ${x} ${y} L ${x} ${y + dy * 90}`} stroke="#fff" strokeWidth={7} fill="none" />;
  return (
    <AbsoluteFill style={{ opacity: entra }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {canto(90, 330, 1, 1)}{canto(990, 330, -1, 1)}{canto(90, 1560, 1, -1)}{canto(990, 1560, -1, -1)}
        <rect x={540 - 120 - 120 * foco} y={945 - 90 - 90 * foco} width={240 + 240 * foco} height={180 + 180 * foco} stroke={foco < 0.05 ? "#4cff7a" : "#fff"} strokeWidth={5} fill="none" />
        <line x1={540} y1={905} x2={540} y2={985} stroke="#fff" strokeWidth={3} opacity={0.7} /><line x1={500} y1={945} x2={580} y2={945} stroke="#fff" strokeWidth={3} opacity={0.7} />
        {Math.floor(s * 2) % 2 === 0 && <circle cx={150} cy={400} r={16} fill={COR.vermelho} />}
      </svg>
      <div style={{ position: "absolute", left: 180, top: 380, fontFamily: ELITE, fontSize: 40, color: "#fff" }}>REC</div>
      <div style={{ position: "absolute", right: 120, top: 380, fontFamily: ELITE, fontSize: 40, color: "#fff" }}>{hora}</div>
      {e.texto && <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: ELITE, fontSize: 44, color: "#fff", letterSpacing: 4, textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>{e.texto}</div>}
    </AbsoluteFill>
  );
};

/** O grupo do prédio: um cartão de conversa em perspectiva, com as mensagens chegando uma a uma. */
const Grupo: React.FC<{ e: Extract<Extra, { tipo: "grupo" }>; s: number }> = ({ e, s }) => {
  const f = Math.round((s - e.em) * FPS);
  if (f < 0) return null;
  const m = spring({ frame: f, fps: FPS, config: { damping: 16, stiffness: 120, mass: 0.9 } });
  const passo = e.intervalo ?? 0.32, n = Math.min(e.mensagens.length, Math.floor((s - e.em - 0.25) / passo) + 1);
  const visiveis = e.mensagens.slice(0, Math.max(0, n)).slice(-3);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", perspective: 1600 }}>
      <div style={{ width: 800, borderRadius: 36, overflow: "hidden", background: "rgba(11,20,26,0.93)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
        transform: `translateY(${(1 - m) * 120}px) rotateX(${6 - 3 * m}deg) rotateY(${-12 + 5 * m}deg) scale(${0.86 + 0.14 * m})`, opacity: lim(m * 1.4) }}>
        <div style={{ padding: "24px 30px", background: "#1f2c34", display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, background: "#3b4a54", color: "#cfd8dc", fontFamily: UI, fontWeight: 700, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>ED</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 38, color: "#e9edef" }}>{e.nome}</span>
            {e.sub && <span style={{ fontFamily: UI, fontSize: 28, color: "#8696a0" }}>{e.sub}</span>}
          </div>
        </div>
        <div style={{ padding: "18px 24px 26px", display: "flex", flexDirection: "column", gap: 14, height: e.mensagens.length > 2 ? 600 : undefined, overflow: "hidden", justifyContent: "flex-end" }}>
          {visiveis.map((msg, i) => {
            const k = e.mensagens.indexOf(msg), chega = saida((s - e.em - 0.25 - k * passo) / 0.18);
            return (
              <div key={k} style={{ alignSelf: msg.eu ? "flex-end" : "flex-start", maxWidth: 600, background: msg.eu ? "#005c4b" : "#202c33", borderRadius: 18, padding: "12px 20px",
                transform: `translateY(${(1 - chega) * 30}px) scale(${0.9 + 0.1 * chega})`, opacity: chega }}>
                <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 27, color: "#53bdeb", marginBottom: 4 }}>{msg.de}</div>
                {msg.foto && <div style={{ width: 260, height: 110, borderRadius: 10, marginBottom: 8, background: "linear-gradient(160deg, #2b3a55, #0e1422)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 105, top: 30, width: 50, height: 42, background: "#ffcf7a", boxShadow: "0 0 20px rgba(255,200,120,0.6)" }} />
                  <div style={{ position: "absolute", inset: 0, border: "4px solid rgba(255,59,59,0.8)", borderRadius: 10 }} /></div>}
                <div style={{ fontFamily: UI, fontSize: 33, color: "#e9edef" }}>{msg.texto}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** Áudio de WhatsApp tocando: bolha com play, ondinha que vai sendo "ouvida" e o tempo. */
const AudioMsg: React.FC<{ e: Extract<Extra, { tipo: "audio" }>; s: number }> = ({ e, s }) => {
  const f = Math.round((s - e.em) * FPS);
  if (f < 0) return null;
  const m = spring({ frame: f, fps: FPS, config: { damping: 15, stiffness: 140 } });
  const prog = lim((s - e.em - 0.2) / e.dur), barras = 34;
  const alt = (k: number) => 14 + 46 * Math.abs(Math.sin(k * 1.7) * Math.cos(k * 0.6 + 1));
  const seg = Math.floor(prog * e.dur);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: e.y ?? 380, display: "flex", justifyContent: "center", perspective: 1400 }}>
      <div style={{ width: 820, padding: "26px 30px", borderRadius: 30, background: "rgba(32,44,51,0.95)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        transform: `translateY(${(1 - m) * 80}px) rotateY(${-10 + 4 * m}deg) scale(${0.88 + 0.12 * m})`, opacity: lim(m * 1.4) }}>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, color: "#53bdeb", marginBottom: 14 }}>{e.de}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 0, height: 0, borderTop: "26px solid transparent", borderBottom: "26px solid transparent", borderLeft: "40px solid #d1d7db", marginLeft: 8 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 7, height: 70, flex: 1 }}>
            {Array.from({ length: barras }, (_, k) => {
              const tocando = k / barras < prog, viva = tocando && k / barras > prog - 0.12;
              return <div key={k} style={{ width: 10, borderRadius: 5, height: alt(k) * (viva ? 1 + 0.25 * Math.sin(s * 30 + k) : 1), background: tocando ? "#53bdeb" : "#8696a0" }} />;
            })}
          </div>
          <div style={{ fontFamily: UI, fontSize: 28, color: "#8696a0", width: 70 }}>0:{String(seg).padStart(2, "0")}</div>
        </div>
      </div>
    </div>
  );
};

const Relampago: React.FC<{ e: Extract<Extra, { tipo: "relampago" }>; s: number }> = ({ e, s }) => {
  const d = s - e.em;
  if (d < 0 || d > 0.6) return null;
  const a = d < 0.06 ? 0.75 : d < 0.12 ? 0.15 : d < 0.18 ? 0.55 : 0.55 * Math.exp(-(d - 0.18) * 9);
  return <AbsoluteFill style={{ background: "rgba(200,220,255,1)", opacity: a, mixBlendMode: "screen" }} />;
};

// ---------------------------------------------------------------- visuais especiais
/** A foto que o remetente mandou: chega como uma foto impressa, girada, e cresce até ocupar a tela. */
const FotoRecebida: React.FC<{ v: Visual; s: number; dur: number }> = ({ v, s, dur }) => {
  const m = spring({ frame: Math.round(s * FPS), fps: FPS, config: { damping: 18, stiffness: 90, mass: 1 } });
  const cresce = suave((s - dur * 0.55) / (dur * 0.45));
  const escala = 0.62 + 0.14 * m + 0.3 * cresce, giro = -7 * (1 - m) + 2 * (1 - cresce) * m;
  return (
    <AbsoluteFill style={{ background: "#05070C" }}>
      <AbsoluteFill style={{ opacity: 0.35 }}><Img src={staticFile(v.arquivo!)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(28px) brightness(0.5)" }} /></AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 1080, height: 1920, transform: `scale(${escala}) rotate(${giro}deg)`, boxShadow: "0 40px 120px rgba(0,0,0,0.85)", border: `${18 * (1 - cresce)}px solid #EDEDED`, position: "relative", overflow: "hidden" }}>
          <Img src={staticFile(v.arquivo!)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: GRADE }} />
        </div>
      </AbsoluteFill>
      {v.legendaFoto && (
        <div style={{ position: "absolute", top: 1722, left: 0, right: 0, textAlign: "center", fontFamily: ELITE, fontSize: 44, color: COR.texto, opacity: lim(m * 1.5) * (1 - cresce), letterSpacing: 2 }}>{v.legendaFoto}</div>
      )}
    </AbsoluteFill>
  );
};

/** Cartão final datilografado: chamada para o próximo episódio + aviso de ficção. */
const Final: React.FC<{ s: number; episodio: number }> = ({ s, episodio }) => {
  const tipo = (txt: string, em: number, vel = 22) => txt.slice(0, Math.max(0, Math.floor((s - em) * vel)));
  const piscar = Math.floor(s * 3) % 2 === 0;
  const selo = spring({ frame: Math.round((s - 0.9) * FPS), fps: FPS, config: { damping: 9, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #121826 0%, #05070C 70%)", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ fontFamily: ELITE, fontSize: 40, color: "#9AA6BF", letterSpacing: 10, marginBottom: 18 }}>{tipo("CASO 01 · O SINAL", 0, 60)}</div>
      <div style={{ fontFamily: ANTON, fontSize: 176, lineHeight: 1, color: COR.texto, letterSpacing: 2 }}>
        ARQUIVO <span style={{ color: COR.vermelho, textShadow: "0 0 40px rgba(255,59,59,0.8)" }}>3:33</span>
      </div>
      <div style={{ marginTop: 60, fontFamily: ELITE, fontSize: 58, color: COR.papel, minHeight: 70 }}>
        {tipo(`Episódio ${episodio + 1} amanhã, 20h`, 0.25, 40)}<span style={{ opacity: piscar ? 1 : 0 }}>▌</span>
      </div>
      <div style={{ marginTop: 70, transform: `scale(${0.6 + 0.4 * selo}) rotate(-4deg)`, opacity: lim(selo * 2), border: `5px solid ${COR.vermelho}`, padding: "10px 34px", fontFamily: ANTON, fontSize: 64, color: COR.vermelho, letterSpacing: 6 }}>
        SIGA PARA NÃO PERDER
      </div>
      <div style={{ position: "absolute", bottom: 300, fontFamily: ELITE, fontSize: 32, color: "#7F8AA3" }}>Ficção · criada com inteligência artificial</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- legenda, etiqueta, entradas
/** Legenda: blocos de até 3 palavras; a falada agora fica amarela, as de medo ficam vermelhas. */
const Legenda: React.FC<{ linha: LinhaCaso }> = ({ linha }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const destaques = useMemo(() => linha.cenas.map((c) => {
    let dentro = false;
    return c.blocos.map((b) => b.palavras.map((p) => {
      if (p.w.startsWith("*")) dentro = true;
      const d = dentro;
      if (/\*[.,!?]?$/.test(p.w)) dentro = false;
      return d;
    }));
  }), [linha]);
  for (const c of linha.cenas) {
    if (c.semLegenda) continue;
    const k = c.blocos.findIndex((b) => t >= b.de && t < b.ate);
    if (k < 0) continue;
    const b = c.blocos[k];
    const pop = spring({ frame: f - q(b.de), fps: FPS, config: { damping: 14, stiffness: 220, mass: 0.6 } });
    return (
      <div style={{ position: "absolute", left: 80, right: 80, top: 1250, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 22px", transform: `scale(${0.85 + 0.15 * pop})`, opacity: lim(pop * 1.5) }}>
        {b.palavras.map((p, i) => {
          const falando = t >= p.em && (i === b.palavras.length - 1 || t < b.palavras[i + 1].em);
          const cor = destaques[c.indice][k][i] ? COR.vermelho : falando ? COR.amarelo : COR.texto;
          return (
            <span key={i} style={{ fontFamily: ANTON, fontSize: 90, lineHeight: 1.08, color: cor, textTransform: "uppercase", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: "0 7px 0 rgba(0,0,0,0.55)" }}>
              {p.w.replace(/\*/g, "")}
            </span>
          );
        })}
      </div>
    );
  }
  return null;
};

/** Etiqueta de arquivo no alto da tela. */
const Etiqueta: React.FC<{ linha: LinhaCaso }> = ({ linha }) => {
  const f = useCurrentFrame();
  const ultima = linha.cenas[linha.cenas.length - 1];
  if (f / FPS >= ultima.inicio) return null;
  const entra = saida(f / 12);
  return (
    <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: entra }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 24px", background: "rgba(5,7,12,0.55)", borderLeft: `6px solid ${COR.vermelho}` }}>
        <span style={{ fontFamily: ELITE, fontSize: 34, color: COR.texto, letterSpacing: 3 }}>ARQUIVO 3:33</span>
        <span style={{ fontFamily: ELITE, fontSize: 30, color: "#9AA6BF", letterSpacing: 2 }}>· {linha.serie.toUpperCase()} · EP. {linha.episodio}</span>
      </div>
    </div>
  );
};

const Entrada: React.FC<{ tipo?: CenaT["entrada"]; s: number }> = ({ tipo, s }) => {
  if (!tipo || tipo === "corte") return null;
  if (tipo === "flash") return <AbsoluteFill style={{ background: "#fff", opacity: lim(0.85 - s * 5) }} />;
  if (tipo === "preto") return <AbsoluteFill style={{ background: "#000", opacity: lim(1 - s * 3.5) }} />;
  // glitch: faixas deslocadas nos primeiros quadros
  if (s > 0.2) return null;
  return (
    <AbsoluteFill>
      {[0, 1, 2, 3, 4].map((k) => (
        <div key={k} style={{ position: "absolute", left: 0, right: 0, top: ((k * 397 + Math.round(s * 300)) % 1800), height: 40 + k * 18, background: k % 2 ? "rgba(255,59,59,0.35)" : "rgba(120,200,255,0.3)", transform: `translateX(${(k % 2 ? -1 : 1) * 60}px)`, mixBlendMode: "screen" }} />
      ))}
    </AbsoluteFill>
  );
};

/** Grão de filme + vinheta + leve tom frio, por cima de tudo. */
const Acabamento: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id="graoCaso"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 10} stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#graoCaso)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 14%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- cena e episódio
const Cena: React.FC<{ c: CenaT; episodio: number }> = ({ c, episodio }) => {
  const f = useCurrentFrame();
  const s = f / FPS, dur = c.fim - c.inicio, v = c.visual;
  const ext = c.extras ?? [];
  let fundo: React.ReactNode;
  if (v.tipo === "final") fundo = <Final s={s} episodio={episodio} />;
  else if (v.tipo === "fotoRecebida") fundo = <FotoRecebida v={v} s={s} dur={dur} />;
  else if (v.tipo === "3d") {
    const planos = v.planos ?? [], pesos = v.pesos ?? planos.map(() => 1), total = pesos.reduce((a, b) => a + b, 0);
    let ini = 0, k = 0;
    while (k < planos.length - 1 && s >= ini + (pesos[k] / total) * dur) { ini += (pesos[k] / total) * dur; k++; }
    const local = s - ini, chicote = k > 0 ? 1 - saida(local / 0.2) : 0, lado = k % 2 ? -1 : 1;
    fundo = (
      <AbsoluteFill style={{ transform: `translateX(${lado * 160 * chicote}px) scale(${1 + 0.08 * chicote})`, filter: chicote > 0.01 ? `blur(${18 * chicote}px)` : undefined }}>
        <Mundo3D plano={planos[k]} s={local} dur={(pesos[k] / total) * dur} />
      </AbsoluteFill>
    );
  }
  else fundo = (
    <Camera v={v} s={s} dur={dur}>
      <Midia v={v} dur={dur} />
      {ext.filter((e) => e.tipo === "remendo").map((e, i) => {
        const r = e as Extract<Extra, { tipo: "remendo" }>;
        return <div key={i} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, background: "#0B1216", color: "#BFD4E6", fontFamily: UI, fontWeight: 600, fontSize: r.h * 0.62, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, textShadow: "0 0 8px rgba(160,200,255,0.7)" }}>{r.texto}</div>;
      })}
    </Camera>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {fundo}
      {ext.map((e, i) =>
        e.tipo === "cartao" ? <Cartao key={i} e={e} s={s} /> :
        e.tipo === "textao" ? <Textao key={i} e={e} s={s} /> :
        e.tipo === "marcador" ? <Marcador key={i} e={e} s={s} /> :
        e.tipo === "relampago" ? <Relampago key={i} e={e} s={s} /> :
        e.tipo === "dado" ? <Dado key={i} e={e} s={s} /> :
        e.tipo === "visor" ? <Visor key={i} e={e} s={s} /> :
        e.tipo === "olhoMagico" ? <OlhoMagico key={i} e={e} s={s} /> :
        e.tipo === "planta" ? <Planta key={i} e={e} s={s} /> :
        e.tipo === "grupo" ? <Grupo key={i} e={e} s={s} /> :
        e.tipo === "audio" ? <AudioMsg key={i} e={e} s={s} /> : null)}
      <Entrada tipo={c.entrada} s={s} />
    </AbsoluteFill>
  );
};

export const Caso: React.FC<{ linha: LinhaCaso }> = ({ linha }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {linha.cenas.map((c) => (
      <Sequence key={c.indice} from={q(c.inicio)} durationInFrames={Math.max(1, q(c.fim) - q(c.inicio))}>
        <Cena c={c} episodio={linha.episodio} />
      </Sequence>
    ))}
    <Acabamento />
    <Legenda linha={linha} />
    <Etiqueta linha={linha} />
    <Audio src={staticFile(linha.audio)} />
  </AbsoluteFill>
);
