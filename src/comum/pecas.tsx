// Peças visuais reaproveitadas pelos vídeos: celular, bolhas de conversa, filmagem com tratamento
// de cor, granulação, símbolo OD (desenhado e em partículas), cursor e selos.
import React, { useMemo } from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, interpolateColors, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { COR, MONO, SANS } from "./marca";
import { FPS, entre, mola, q, sorteio } from "./tempo";

// ---------------------------------------------------------------- filmagem
/**
 * Um trecho filmado (do Higgsfield) com zoom lento, tratamento de cor e, se pedido, tocado ao contrário.
 * `inicio` = segundo do vídeo em que o trecho começa; `de` = de onde do arquivo começa a tocar.
 */
export const Filmagem: React.FC<{
  src: string; inicio: number; fim: number; de?: number; velocidade?: number; reverso?: boolean;
  zoom?: [number, number]; origem?: string; filtro?: string; tinta?: string; style?: React.CSSProperties;
  /** Ponto do quadro que fica à vista quando o formato corta a imagem (ex.: "30% 50%" na vertical). */
  posicao?: string;
}> = ({ src, inicio, fim, de = 0, velocidade = 1, reverso = false, zoom = [1.04, 1.12], origem = "50% 50%", filtro, tinta, style, posicao = "50% 50%" }) => {
  const f = useCurrentFrame();
  const escala = entre(f, inicio, fim, zoom[0], zoom[1], (x) => x);
  const dur = fim - inicio;
  // Quadro do arquivo (24 fps no arquivo, mas o Remotion trata em quadros do vídeo final)
  const local = Math.max(0, f - q(inicio));
  const quadroArquivo = reverso ? Math.max(0, q(de + dur * velocidade) - Math.round(local * velocidade)) : null;
  const video = <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: posicao }} playbackRate={reverso ? 1 : velocidade} startFrom={reverso ? 0 : q(de)} />;
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <AbsoluteFill style={{ transform: `scale(${escala})`, transformOrigin: origem, filter: filtro }}>
        {reverso ? <Freeze frame={quadroArquivo ?? 0}>{video}</Freeze> : <Sequence from={q(inicio)} durationInFrames={q(dur) + 2} layout="none">{video}</Sequence>}
      </AbsoluteFill>
      {tinta && <AbsoluteFill style={{ background: tinta, mixBlendMode: "multiply" }} />}
    </AbsoluteFill>
  );
};

export const Vinheta: React.FC<{ forca?: number }> = ({ forca = 0.55 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 45%, rgba(5,4,20,${forca}) 100%)`, pointerEvents: "none" }} />
);

/** Granulação de filme bem leve — muda a cada quadro, dá textura de câmera. */
export const Grao: React.FC<{ opacidade?: number }> = ({ opacidade = 0.07 }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ opacity: opacidade, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width={W} height={H}>
        <filter id={`grao${f % 6}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 6} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter={`url(#grao${f % 6})`} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- celular e conversa
export const Celular: React.FC<{
  tema: "noite" | "dia"; hora: string; nome: string; status: string; statusCor?: string; largura?: number; altura?: number;
  style?: React.CSSProperties; children?: React.ReactNode; fundoConversa?: string; cabecalho?: boolean;
}> = ({ tema, hora, nome, status, statusCor, largura = 410, altura = 830, style, children, fundoConversa, cabecalho = true }) => {
  const noite = tema === "noite";
  return (
    <div style={{ width: largura, height: altura, borderRadius: 58, padding: 13, background: noite ? "#17153A" : "#fff",
      boxShadow: noite ? "0 0 0 1.5px rgba(129,140,248,.35), 0 50px 100px -30px rgba(0,0,0,.85)" : "0 0 0 1.5px rgba(30,27,75,.07), 0 50px 100px -35px rgba(49,46,129,.5)", ...style }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 46, overflow: "hidden", background: fundoConversa ?? (noite ? "#EEF1F8" : COR.gelo), display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 30px 8px", fontFamily: SANS, fontWeight: 600, fontSize: 21, color: COR.tinta }}>
          <span>{hora}</span><span style={{ letterSpacing: 3, fontSize: 14 }}>● ● ●</span>
        </div>
        {cabecalho && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 22px 16px", borderBottom: `1px solid ${COR.linha}`, background: "#fff" }}>
            <div style={{ width: 54, height: 54, borderRadius: 27, background: `linear-gradient(135deg, ${COR.ceu}, ${COR.violeta})`, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 23, color: COR.tinta }}>{nome}</div>
              <div style={{ fontFamily: SANS, fontSize: 17, color: statusCor ?? COR.cinza }}>{status}</div>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export const Bolha: React.FC<{ lado: "eu" | "outro"; aparece: number; children: React.ReactNode; apagada?: number; vistos?: "cinza" | "azul" | null; hora?: string; tamanho?: number; style?: React.CSSProperties }> = ({ lado, aparece, children, apagada = 0, vistos = null, hora, tamanho = 22, style }) => {
  const f = useCurrentFrame();
  const m = mola(f, aparece, { stiffness: 170, damping: 14 });
  if (f < q(aparece)) return null;
  const eu = lado === "eu";
  return (
    <div style={{ display: "flex", justifyContent: eu ? "flex-end" : "flex-start", marginBottom: 14, opacity: Math.min(1, m * 1.4) * (1 - 0.5 * apagada), transform: `translateY(${(1 - m) * 26}px) scale(${0.86 + 0.14 * m})`, transformOrigin: eu ? "right bottom" : "left bottom", ...style }}>
      <div style={{ maxWidth: "84%", padding: "13px 17px 9px", borderRadius: 22, fontFamily: SANS, fontSize: tamanho, lineHeight: 1.32, background: eu ? "#DCF7E6" : "#fff", color: COR.tinta,
        borderBottomRightRadius: eu ? 6 : 22, borderBottomLeftRadius: eu ? 22 : 6, boxShadow: "0 1px 2px rgba(30,27,75,.06), 0 12px 26px -16px rgba(49,46,129,.35)" }}>
        {children}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 4, fontFamily: SANS, fontSize: 13, color: COR.cinza }}>
          {hora && <span>{hora}</span>}
          {vistos && <span style={{ color: vistos === "azul" ? "#3B82F6" : "#94A3B8", fontWeight: 700, letterSpacing: -2 }}>✓✓</span>}
        </div>
      </div>
    </div>
  );
};

export const Digitando: React.FC<{ de: number; ate: number }> = ({ de, ate }) => {
  const f = useCurrentFrame();
  if (f < q(de) || f >= q(ate)) return null;
  const m = mola(f, de, { stiffness: 200 });
  return (
    <div style={{ display: "flex", gap: 8, background: "#fff", padding: "17px 20px", borderRadius: 22, borderBottomLeftRadius: 6, width: 92, marginBottom: 14, transform: `scale(${m})`, transformOrigin: "left bottom", boxShadow: "0 12px 26px -16px rgba(49,46,129,.35)" }}>
      {[0, 1, 2].map((i) => <span key={i} style={{ width: 12, height: 12, borderRadius: 6, background: COR.violeta, opacity: 0.3 + 0.7 * Math.abs(Math.sin((f / FPS) * 6 - i * 0.75)) }} />)}
    </div>
  );
};

export const ChipIA: React.FC<{ texto?: string; escuro?: boolean; style?: React.CSSProperties }> = ({ texto = "AURORA · ATENDENTE DE IA", escuro, style }) => (
  <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: 1.5, color: escuro ? COR.ceu : COR.azul, marginBottom: 6, ...style }}>{texto}</div>
);

// ---------------------------------------------------------------- símbolo OD
const CAMINHO_PRINCIPAL = "M42 53.5A21.5 21.5 0 1 1 58.94 18.76L86.09 53.5H98A21.5 21.5 0 0 0 98 10.5H92";
const ARCO_INTERNO = "M63.42 30.13A21.5 21.5 0 0 1 38.27 53.17";
const QUADRADOS: [number, number, number][] = [[9, 23, 5], [2.5, 30, 4], [10, 35, 4.5], [4, 41.5, 3.5]];
const corDoX = (x: number) => interpolateColors(x, [4, 63, 122], [COR.celeste, COR.violeta, COR.noite]);

export const Simbolo: React.FC<{ progresso?: number; largura: number; id?: string; claro?: boolean }> = ({ progresso = 1, largura, id = "s", claro = false }) => {
  const g = `${id}-g`, d = `${id}-d`, o = `${id}-o`;
  const pontas = claro ? ["#7DD3FC", "#A5B4FC", "#E0E7FF"] : [COR.celeste, COR.violeta, COR.noite];
  return (
    <svg viewBox="0 4 128 56" width={largura} height={(largura * 56) / 128} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={g} gradientUnits="userSpaceOnUse" x1="4" y1="14" x2="122" y2="52"><stop offset="0" stopColor={pontas[0]} /><stop offset="0.5" stopColor={pontas[1]} /><stop offset="1" stopColor={pontas[2]} /></linearGradient>
        <clipPath id={d} clipPathUnits="userSpaceOnUse"><polygon points="40.61,-17.69 89.87,45.35 168.7,-16.2 119.4,-79.3" /></clipPath>
        <clipPath id={o} clipPathUnits="userSpaceOnUse"><polygon points="28.01,-7.83 77.27,55.21 -1.53,116.8 -50.79,53.74" /></clipPath>
      </defs>
      <g fill="none" stroke={`url(#${g})`} strokeWidth={9}>
        <path pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progresso} d={CAMINHO_PRINCIPAL} />
        <path pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.max(0, (progresso - 0.55) / 0.45)} d="M98 10.5H44" clipPath={`url(#${d})`} />
        <path pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.max(0, (progresso - 0.3) / 0.7)} d={ARCO_INTERNO} clipPath={`url(#${o})`} />
      </g>
      <g fill={`url(#${g})`}>
        {QUADRADOS.map(([x, y, t], i) => { const p = Math.min(1, Math.max(0, (progresso - 0.6 - i * 0.08) / 0.25)); return <rect key={i} x={x - (1 - p) * 14} y={y} width={t} height={t} rx={0.8} opacity={p} />; })}
      </g>
    </svg>
  );
};

/** Pontos (no desenho de 128x56) por onde passa o símbolo — destino das partículas. */
const pontosDoSimbolo = (() => {
  const pts: [number, number][] = [];
  const amostra = (d: string, n: number, filtroPt?: (x: number, y: number) => boolean) => {
    const L = getLength(d);
    for (let i = 0; i < n; i++) { const p = getPointAtLength(d, (L * i) / (n - 1)); if (!filtroPt || filtroPt(p.x, p.y)) pts.push([p.x, p.y]); }
  };
  amostra(CAMINHO_PRINCIPAL, 230);
  amostra("M98 10.5H62.6", 40);
  amostra(ARCO_INTERNO, 34, (x) => x < 60);
  for (const [x, y, t] of QUADRADOS) for (let k = 0; k < 4; k++) pts.push([x + t / 2, y + t / 2]);
  return pts;
})();

/**
 * Partículas espalhadas que voam e se juntam formando o símbolo; no fim, o símbolo nítido aparece por cima.
 * Centro em (cx, cy) em pixels; `largura` = largura final do símbolo.
 */
export const SimboloParticulas: React.FC<{ inicio: number; dur?: number; cx: number; cy: number; largura: number; claro?: boolean; id?: string }> = ({ inicio, dur = 1.0, cx, cy, largura, claro = false, id = "sp" }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const esc = largura / 124;
  const parts = useMemo(() => {
    const r = sorteio(77);
    return pontosDoSimbolo.flatMap(([x, y], i) => [0, 1].map((k) => {
      const ang = r() * Math.PI * 2, dist = 500 + r() * 900;
      return { x, y, sx: Math.cos(ang) * dist, sy: Math.sin(ang) * dist * 0.6, atraso: r() * 0.35, tam: 2 + r() * 4.5, k, i };
    }));
  }, []);
  if (f < q(inicio)) return null;
  const nitido = entre(f, inicio + dur * 0.85, inicio + dur + 0.25);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 1 - nitido }}>
        {parts.map((p, n) => {
          const t = entre(f, inicio + p.atraso * dur, inicio + dur * (0.62 + p.atraso * 0.38), 0, 1);
          const tx = cx + (p.x - 64) * esc + (p.k ? 2 : -2), ty = cy + (p.y - 32) * esc + (p.k ? 2 : -2);
          const x = tx + p.sx * (1 - t), y = ty + p.sy * (1 - t);
          const cor = claro ? interpolateColors(p.x, [4, 122], ["#BAE6FD", "#E0E7FF"]) : corDoX(p.x);
          return <rect key={n} x={x - p.tam / 2} y={y - p.tam / 2} width={p.tam} height={p.tam} rx={1} fill={cor} opacity={0.25 + 0.75 * t} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: cx - 64 * esc, top: cy - 28 * esc, opacity: nitido, transform: `scale(${0.96 + 0.04 * nitido})` }}>
        <Simbolo largura={largura * (128 / 124)} id={id} claro={claro} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- cursor e selos
export const Cursor: React.FC<{ chega: number; clique: number; de: [number, number]; para: [number, number] }> = ({ chega, clique, de, para }) => {
  const f = useCurrentFrame();
  if (f < q(chega - 0.6)) return null;
  const p = entre(f, chega - 0.6, chega);
  const aperta = f >= q(clique) && f < q(clique + 0.15) ? 0.85 : 1;
  const onda = entre(f, clique, clique + 0.6);
  const x = de[0] + (para[0] - de[0]) * p, y = de[1] + (para[1] - de[1]) * p;
  return (
    <>
      {f >= q(clique) && <div style={{ position: "absolute", left: para[0] - 60 * onda, top: para[1] - 60 * onda, width: 120 * onda, height: 120 * onda, borderRadius: "50%", border: `3px solid ${COR.violeta}`, opacity: 1 - onda }} />}
      <svg width="46" height="54" viewBox="0 0 23 27" style={{ position: "absolute", left: x, top: y, transform: `scale(${aperta})`, transformOrigin: "top left", filter: "drop-shadow(0 6px 10px rgba(30,27,75,.35))" }}>
        <path d="M2 1 L2 21 L7.5 16 L11 24.5 L14.5 23 L11 15 L18.5 15 Z" fill="#fff" stroke={COR.tinta} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </>
  );
};

/** Notificação estilo celular (cartão que cai do topo ou surge num ponto). */
export const Notificacao: React.FC<{ aparece: number; some?: number; titulo: string; texto: string; x: number; y: number; largura?: number; cinza?: number; sai?: number; style?: React.CSSProperties }> = ({ aparece, some, titulo, texto, x, y, largura = 470, cinza = 0, sai = 0, style }) => {
  const f = useCurrentFrame();
  if (f < q(aparece)) return null;
  const m = mola(f, aparece, { stiffness: 190, damping: 13 });
  const fim = some ? entre(f, some, some + 0.25) : 0;
  return (
    <div style={{ position: "absolute", left: x + sai * 1400, top: y, width: largura, transform: `scale(${0.6 + 0.4 * m}) translateY(${(1 - m) * 30}px)`, transformOrigin: "left bottom", opacity: Math.min(1, m * 1.5) * (1 - fim) * (1 - Math.min(1, sai * 1.3)),
      background: `rgba(255,255,255,${0.93 - 0.2 * cinza})`, borderRadius: 24, padding: "16px 20px", display: "flex", gap: 14, alignItems: "center", filter: `grayscale(${cinza})`,
      boxShadow: "0 20px 50px -18px rgba(0,0,0,.55)", backdropFilter: "blur(14px)", ...style }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: cinza > 0.5 ? "#94A3B8" : "#22C55E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="26" height="26" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z" /></svg>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 19, color: COR.tinta }}>{titulo}</div>
        <div style={{ fontFamily: SANS, fontSize: 21, color: COR.grafite, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{texto}</div>
      </div>
    </div>
  );
};
