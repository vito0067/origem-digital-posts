// As cenas dos posts. Cada uma serve para o Reel (1080x1920, animada) e para o carrossel
// (1080x1350, `foto` = tudo já no lugar). O tempo é local: 0 = começo da cena, sempre na grade de 120 BPM.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { DEGRADE, MONO, SANS, SERIFA } from "../comum/marca";
import { entre, mola, q } from "../comum/tempo";
import { Rolagem } from "../comum/tipo";
import { Simbolo } from "../comum/pecas";
import type { Cena } from "./tipos";
import { preenchido, useTema } from "./tema";
import { Apoio, Reflexo, Rotulo, Texto, Vidro } from "./pecas";
import { BATIDA, letrasPorLinha, quebrar, tamanhoFrase, tempoDigitar, tempoItens, tempoMensagens, tempoPalavras } from "./tempos";

const palavras = (t = "") => t.replace(/\*/g, "").split(/\s+/).filter(Boolean).length;
type P<T extends Cena["tipo"]> = { c: Extract<Cena, { tipo: T }>; dur: number; foto: boolean; altura: number };

/** Área útil (centraliza o conteúdo entre o topo e a base livres). */
export const Area: React.FC<{ topo: number; base: number; children: React.ReactNode }> = ({ topo, base, children }) => (
  <AbsoluteFill style={{ top: topo, bottom: base, height: "auto", padding: "0 70px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    {children}
  </AbsoluteFill>
);

const Grande: React.FC<{ texto: string; inicio: number; escala?: number }> = ({ texto, inicio, escala = 1 }) => {
  const tam = tamanhoFrase(texto, escala);
  return <Texto texto={quebrar(texto, letrasPorLinha(tam))} inicio={inicio} tamanho={tam} />;
};

/** Ícone redondo: ✓ (degradê) ou ✕ (apagado). */
const Icone: React.FC<{ tipo: "sim" | "nao"; tamanho?: number }> = ({ tipo, tamanho = 54 }) => {
  const t = useTema();
  return (
    <div style={{ width: tamanho, height: tamanho, borderRadius: tamanho / 2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
      background: tipo === "sim" ? DEGRADE : "transparent", border: tipo === "nao" ? `2.5px solid ${t.apagado}` : undefined,
      boxShadow: tipo === "sim" ? "0 10px 24px -10px rgba(79,70,229,.8)" : undefined }}>
      <svg width={tamanho * 0.5} height={tamanho * 0.5} viewBox="0 0 24 24">
        {tipo === "sim"
          ? <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M6 6l12 12M18 6L6 18" fill="none" stroke={t.apagado} strokeWidth="3" strokeLinecap="round" />}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------- frase
const CenaFrase: React.FC<P<"frase">> = ({ c }) => (
  <>
    <Rotulo texto={c.etiqueta} />
    <Grande texto={c.texto} inicio={0.05} />
    {c.apoio && <Apoio texto={c.apoio} inicio={0.35 + palavras(c.texto) * 0.08} style={{ marginTop: 48 }} />}
  </>
);

// ---------------------------------------------------------------- palavras (uma por batida)
const CenaPalavras: React.FC<P<"palavras">> = ({ c, dur, foto }) => {
  const f = useCurrentFrame();
  const t = useTema();
  const ts = tempoPalavras(c.palavras.length);
  const tam = (p: string) => Math.min(190, Math.floor(940 / (Math.max(4, p.replace(/\*/g, "").length) * 0.56)));
  const Palavra: React.FC<{ p: string; tamanho: number }> = ({ p, tamanho }) => {
    const destaque = p.startsWith("*");
    const limpa = p.replace(/\*/g, "");
    const ponto = /[.!?]$/.test(limpa) ? limpa.slice(-1) : "";
    const corpo = ponto ? limpa.slice(0, -1) : limpa;
    return (
      <span style={{ whiteSpace: "nowrap", fontFamily: destaque ? SERIFA : SANS, fontStyle: destaque ? "italic" : "normal", fontWeight: destaque ? 400 : 700, fontSize: destaque ? tamanho * 1.12 : tamanho, letterSpacing: destaque ? "-0.01em" : "-0.045em", lineHeight: 1 }}>
        <span style={destaque ? preenchido(t) : { color: t.texto }}>{corpo}</span>
        <span style={{ ...preenchido(t), fontFamily: SERIFA }}>{ponto}</span>
      </span>
    );
  };
  if (foto) {
    return (
      <>
        {c.titulo && <div style={{ marginBottom: 40 }}><Texto texto={c.titulo} inicio={-5} tamanho={60} /></div>}
        {c.palavras.map((p, k) => <div key={k} style={{ opacity: k === c.palavras.length - 1 ? 1 : 0.35, marginBottom: 6 }}><Palavra p={p} tamanho={Math.min(150, tam(p))} /></div>)}
      </>
    );
  }
  const pilulas = Math.round(dur / BATIDA);
  return (
    <>
      {c.titulo && <div style={{ marginBottom: 70 }}><Texto texto={c.titulo} inicio={0.05} tamanho={64} /></div>}
      <div style={{ position: "relative", width: 940, height: 240 }}>
        {c.palavras.map((p, k) => {
          const entra = mola(f, ts[k], { stiffness: 260, damping: 20, mass: 0.7 });
          const sai = k < ts.length - 1 ? entre(f, ts[k + 1], ts[k + 1] + 0.16) : 0;
          if (f < q(ts[k]) || sai >= 1) return null;
          return (
            <div key={k} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              opacity: Math.min(1, entra * 1.5) * (1 - sai), filter: `blur(${(1 - entra) * 10 + sai * 12}px)`,
              transform: `translateY(${(1 - entra) * 70 - sai * 60}px) scale(${0.9 + 0.1 * entra})` }}>
              <Palavra p={p} tamanho={tam(p)} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 70 }}>
        {Array.from({ length: pilulas }, (_, k) => {
          const aceso = f >= q(k * BATIDA);
          const m = mola(f, k * BATIDA, { stiffness: 300, damping: 14 });
          return <div key={k} style={{ width: 20, height: 34 + (aceso ? 10 * m : 0), borderRadius: 10, background: aceso ? DEGRADE : t.apagado, opacity: aceso ? 1 : 0.25 }} />;
        })}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- digitando
const CenaDigitando: React.FC<P<"digitando">> = ({ c, foto }) => {
  const f = useCurrentFrame();
  const t = useTema();
  const ini = 0.6, td = tempoDigitar(c.texto);
  const n = foto ? c.texto.length : Math.round(c.texto.length * entre(f, ini, ini + td, 0, 1, (x) => x));
  const escrevendo = !foto && f < q(ini + td);
  const cursor = !foto && (escrevendo || Math.floor(f / 15) % 2 === 0);
  const tam = c.texto.length <= 40 ? 66 : c.texto.length <= 80 ? 56 : 48;
  const surge = foto ? 1 : mola(f, 0.05, { damping: 18 });
  const estilo: React.CSSProperties = { fontFamily: SANS, fontSize: tam, lineHeight: 1.28, fontWeight: 500, letterSpacing: "-0.02em", textAlign: "left" };
  return (
    <>
      <Rotulo texto={c.etiqueta} />
      <Vidro raio={44} style={{ width: 940, padding: "40px 48px 52px", opacity: surge, transform: `translateY(${(1 - surge) * 40}px) scale(${0.96 + 0.04 * surge})` }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 30, position: "relative" }}>
          {[0, 1, 2].map((i) => <span key={i} style={{ width: 16, height: 16, borderRadius: 8, background: t.apagado, opacity: 0.45 }} />)}
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ ...estilo, color: "transparent" }}>{c.texto}</div>
          <div style={{ ...estilo, color: t.texto, position: "absolute", inset: 0 }}>
            {c.texto.slice(0, n)}
            <span style={{ display: "inline-block", width: 6, height: tam * 1.02, marginLeft: 6, verticalAlign: "text-bottom", borderRadius: 3, background: DEGRADE, opacity: cursor ? 1 : 0 }} />
          </div>
        </div>
      </Vidro>
    </>
  );
};

// ---------------------------------------------------------------- conversa (celular em 3D)
const Bolha: React.FC<{ de: "cliente" | "aurora"; aparece: number; foto: boolean; children: React.ReactNode }> = ({ de, aparece, foto, children }) => {
  const f = useCurrentFrame();
  const m = foto ? 1 : mola(f, aparece, { stiffness: 190, damping: 16 });
  if (!foto && f < q(aparece)) return null;
  const eu = de === "cliente";
  return (
    <div style={{ display: "flex", justifyContent: eu ? "flex-end" : "flex-start", marginBottom: 16, opacity: Math.min(1, m * 1.4), transform: `translateY(${(1 - m) * 30}px) scale(${0.88 + 0.12 * m})`, transformOrigin: eu ? "right bottom" : "left bottom" }}>
      <div style={{ maxWidth: "84%", padding: "16px 20px 12px", borderRadius: 26, borderBottomRightRadius: eu ? 8 : 26, borderBottomLeftRadius: eu ? 26 : 8,
        background: eu ? "#D9FDD3" : "#FFFFFF", color: "#111B21", fontFamily: SANS, fontSize: 27, lineHeight: 1.32, boxShadow: "0 1px 1.5px rgba(11,20,26,.13)" }}>
        {!eu && <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 1.5, color: "#4F46E5", marginBottom: 6 }}>AURORA · ATENDENTE DE IA</div>}
        {children}
        {eu && <div style={{ textAlign: "right", fontSize: 16, color: "#53BDEB", fontWeight: 700, letterSpacing: -2, marginTop: 2 }}>✓✓</div>}
      </div>
    </div>
  );
};

const Digitando: React.FC<{ de: number; ate: number }> = ({ de, ate }) => {
  const f = useCurrentFrame();
  if (f < q(de) || f >= q(ate)) return null;
  const m = mola(f, de, { stiffness: 220 });
  return (
    <div style={{ display: "flex", gap: 9, background: "#fff", padding: "20px 22px", borderRadius: 24, borderBottomLeftRadius: 8, width: 104, marginBottom: 16, transform: `scale(${m})`, transformOrigin: "left bottom", boxShadow: "0 1px 1.5px rgba(11,20,26,.13)" }}>
      {[0, 1, 2].map((i) => <span key={i} style={{ width: 14, height: 14, borderRadius: 7, background: "#818CF8", opacity: 0.3 + 0.7 * Math.abs(Math.sin((f / 30) * 6 - i * 0.75)) }} />)}
    </div>
  );
};

const Chip: React.FC<{ texto: string; aparece: number; foto: boolean; style: React.CSSProperties }> = ({ texto, aparece, foto, style }) => {
  const f = useCurrentFrame();
  const t = useTema();
  const m = foto ? 1 : mola(f, aparece, { stiffness: 230, damping: 15 });
  if (!foto && f < q(aparece)) return null;
  return (
    <div style={{ position: "absolute", ...style, transform: `scale(${0.6 + 0.4 * m})`, opacity: Math.min(1, m * 1.5) }}>
      <Vidro raio={999} style={{ padding: "16px 26px", display: "flex", alignItems: "center", gap: 12, background: t.nome === "noite" ? "rgba(23,21,66,.94)" : "rgba(255,255,255,.95)" }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: DEGRADE, position: "relative" }} />
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: t.texto, whiteSpace: "nowrap", position: "relative" }}>{texto}</span>
      </Vidro>
    </div>
  );
};

const CenaConversa: React.FC<P<"conversa">> = ({ c, dur, foto, altura }) => {
  const f = useCurrentFrame();
  const t = useTema();
  const ts = tempoMensagens(c.mensagens);
  const H = Math.min(altura - 90, 1060), W = Math.round(H * 0.5);
  const entra = foto ? 1 : mola(f, 0, { stiffness: 80, damping: 17, mass: 1 });
  const giro = foto ? -14 : interpolate(f, [0, q(dur)], [-26, -8], { extrapolateRight: "clamp" });
  const primeiraAurora = ts[c.mensagens.findIndex((m) => m.de === "aurora")]?.aparece ?? 2;
  return (
    <>
      <Rotulo texto="Conversa de exemplo" style={{ marginBottom: 26 }} />
      <div style={{ position: "relative", width: 940, height: H, display: "flex", justifyContent: "center", perspective: 2400 }}>
        <div style={{ width: W, height: H, transformStyle: "preserve-3d", opacity: Math.min(1, entra * 1.3),
          transform: `translateY(${(1 - entra) * 260}px) rotateY(${giro - (1 - entra) * 35}deg) rotateX(${7 - (1 - entra) * 10}deg) rotateZ(${-1.5 * (1 - entra)}deg)` }}>
          <div style={{ width: "100%", height: "100%", borderRadius: W * 0.16, padding: 14, background: "linear-gradient(145deg, #2A2760, #0B0A24 40%, #1E1B4B)",
            boxShadow: t.nome === "noite" ? "inset 0 0 0 2px rgba(165,180,252,.35), 0 0 140px rgba(79,70,229,.45), 0 80px 120px -40px rgba(0,0,0,.9)" : "inset 0 0 0 2px rgba(255,255,255,.18), 0 90px 130px -50px rgba(30,27,75,.65)" }}>
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: W * 0.13, overflow: "hidden", background: "#EFEAE2", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "absolute", top: 14, left: "50%", width: 120, height: 34, marginLeft: -60, borderRadius: 17, background: "#0B0A24", zIndex: 2 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "64px 22px 18px", background: "#fff", borderBottom: "1px solid #E2E8F0" }}>
                <div style={{ width: 60, height: 60, borderRadius: 30, background: "linear-gradient(135deg, #BAE6FD, #818CF8)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: "#111B21", lineHeight: 1.1 }}>{c.nome ?? "Seu negócio"}</div>
                  <div style={{ fontFamily: SANS, fontSize: 20, color: "#16A34A" }}>online</div>
                </div>
              </div>
              <div style={{ flex: 1, padding: "18px 18px 10px", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
                {c.mensagens.map((m, i) => (
                  <React.Fragment key={i}>
                    {!foto && ts[i].digitaDe !== null && <Digitando de={ts[i].digitaDe!} ate={ts[i].aparece} />}
                    <Bolha de={m.de} aparece={ts[i].aparece} foto={foto}>{m.texto}</Bolha>
                  </React.Fragment>
                ))}
              </div>
              <div style={{ height: 70, background: "#F0F2F5", display: "flex", alignItems: "center", padding: "0 18px" }}>
                <div style={{ flex: 1, height: 44, borderRadius: 22, background: "#fff" }} />
              </div>
            </div>
          </div>
        </div>
        <Chip texto="Atendente de IA" aparece={primeiraAurora + 0.5} foto={foto} style={{ left: 0, top: H * 0.13 }} />
        <Chip texto="Responde em segundos" aparece={primeiraAurora + 1.0} foto={foto} style={{ right: -10, top: H * 0.3 }} />
        <Chip texto="24 h por dia" aparece={primeiraAurora + 1.5} foto={foto} style={{ left: 10, top: H * 0.885 }} />
      </div>
    </>
  );
};

// ---------------------------------------------------------------- número dentro do anel
const CenaNumero: React.FC<P<"numero">> = ({ c, foto }) => {
  const f = useCurrentFrame();
  const t = useTema();
  const prog = foto ? 1 : entre(f, 0.2, 1.7);
  const frac = Math.min(1, c.valor / (c.de ?? c.valor)) * prog;
  const surge = foto ? 1 : mola(f, 0.05, { damping: 17 });
  const curto = (c.sufixo ?? "").trim().length <= 3;
  const extra: React.CSSProperties = { ...preenchido(t), fontFamily: SERIFA, fontStyle: "italic", lineHeight: 1, whiteSpace: "nowrap" };
  const R = 250, L = 600;
  return (
    <>
      <Rotulo texto={c.etiqueta} />
      <div style={{ position: "relative", width: L, height: L, transform: `scale(${0.85 + 0.15 * surge})`, opacity: surge }}>
        <svg width={L} height={L} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id="anel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={t.nome === "noite" ? "#7DD3FC" : "#38BDF8"} /><stop offset="0.5" stopColor="#818CF8" /><stop offset="1" stopColor={t.nome === "noite" ? "#E0E7FF" : "#312E81"} />
            </linearGradient>
          </defs>
          <circle cx={L / 2} cy={L / 2} r={R} fill="none" stroke={t.apagado} strokeOpacity={0.22} strokeWidth={22} />
          <circle cx={L / 2} cy={L / 2} r={R} fill="none" stroke="url(#anel)" strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - frac}
            transform={`rotate(-90 ${L / 2} ${L / 2})`} style={{ filter: t.nome === "noite" ? "drop-shadow(0 0 18px rgba(129,140,248,.7))" : "drop-shadow(0 10px 18px rgba(79,70,229,.35))" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            {c.prefixo && <span style={{ ...extra, fontSize: 110 }}>{c.prefixo}</span>}
            <Rolagem valor={Math.min(c.valor, c.valor * prog)} tamanho={210} cor={t.texto} />
            {c.sufixo && curto && <span style={{ ...extra, fontSize: 130 }}>{c.sufixo}</span>}
          </div>
          {c.sufixo && !curto && <span style={{ ...extra, fontSize: 64, marginTop: 6 }}>{c.sufixo.trim()}</span>}
        </div>
      </div>
      <div style={{ marginTop: 34 }}><Grande texto={c.texto} inicio={foto ? -5 : 1.0} escala={0.66} /></div>
    </>
  );
};

// ---------------------------------------------------------------- lista
const CenaLista: React.FC<P<"lista">> = ({ c, foto }) => {
  const f = useCurrentFrame();
  const t = useTema();
  const ts = tempoItens(c.itens.length);
  return (
    <>
      <Rotulo texto={c.etiqueta} />
      <Grande texto={c.titulo} inicio={0.05} escala={0.8} />
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 54, width: 940 }}>
        {c.itens.map((item, k) => {
          const m = foto ? 1 : mola(f, ts[k], { damping: 17 });
          const risco = c.riscar ? (foto ? 1 : entre(f, ts[k] + 0.5, ts[k] + 0.85)) : 0;
          return (
            <div key={k} style={{ opacity: !foto && f < q(ts[k]) ? 0 : m, transform: `translateX(${(1 - m) * -70}px)` }}>
              <Vidro raio={30} style={{ display: "flex", alignItems: "center", gap: 26, padding: "26px 32px" }}>
                <div style={{ position: "relative" }}><Icone tipo={c.riscar ? "nao" : "sim"} /></div>
                <div style={{ position: "relative", fontFamily: SANS, fontSize: 42, fontWeight: 500, color: c.riscar ? (risco > 0.5 ? t.apagado : t.texto) : t.texto, lineHeight: 1.25 }}>
                  {item}
                  {c.riscar && <span style={{ position: "absolute", left: -6, right: -6, top: "54%", height: 5, borderRadius: 3, background: DEGRADE, transform: `scaleX(${risco})`, transformOrigin: "left center" }} />}
                </div>
                {!foto && !c.riscar && <Reflexo inicio={ts[k] + 0.2} raio={30} />}
              </Vidro>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- comparar (antes x depois)
const CenaComparar: React.FC<P<"comparar">> = ({ c, foto }) => {
  const f = useCurrentFrame();
  const t = useTema();
  const linhas = Math.max(c.esquerda.itens.length, c.direita.itens.length);
  const Celula: React.FC<{ texto?: string; lado: "e" | "d"; em: number }> = ({ texto, lado, em }) => {
    const m = foto ? 1 : mola(f, em, { damping: 16 });
    if (!texto || (!foto && f < q(em))) return <div style={{ flex: 1 }} />;
    return (
      <div style={{ flex: 1, opacity: m, transform: `translateY(${(1 - m) * 30}px) scale(${0.94 + 0.06 * m})` }}>
        <Vidro raio={26} style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 22px", minHeight: 118, opacity: lado === "e" ? 0.8 : 1 }}>
          <div style={{ position: "relative" }}><Icone tipo={lado === "e" ? "nao" : "sim"} tamanho={44} /></div>
          <div style={{ position: "relative", fontFamily: SANS, fontSize: 32, fontWeight: lado === "d" ? 600 : 500, lineHeight: 1.22, color: lado === "e" ? t.suave : t.texto }}>{texto}</div>
          {!foto && lado === "d" && <Reflexo inicio={em + 0.2} raio={26} />}
        </Vidro>
      </div>
    );
  };
  const cab = foto ? 1 : mola(f, 0.1, { damping: 18 });
  return (
    <>
      <Rotulo texto={c.etiqueta} />
      <div style={{ display: "flex", gap: 24, width: 940, marginBottom: 22, opacity: cab, transform: `translateY(${(1 - cab) * 30}px)` }}>
        <div style={{ flex: 1, textAlign: "center", padding: "20px 10px", borderRadius: 999, border: `2px solid ${t.apagado}`, fontFamily: SANS, fontWeight: 600, fontSize: 34, color: t.suave }}>{c.esquerda.titulo}</div>
        <div style={{ flex: 1, textAlign: "center", padding: "20px 10px", borderRadius: 999, background: DEGRADE, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: "#fff", boxShadow: "0 18px 40px -18px rgba(79,70,229,.9)" }}>{c.direita.titulo}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 940 }}>
        {Array.from({ length: linhas }, (_, k) => (
          <div key={k} style={{ display: "flex", gap: 24 }}>
            <Celula texto={c.esquerda.itens[k]} lado="e" em={1.0 + k * 2} />
            <Celula texto={c.direita.itens[k]} lado="d" em={1.5 + k * 2} />
          </div>
        ))}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- imagem
const CenaImagem: React.FC<P<"imagem">> = ({ c, dur, foto, altura }) => {
  const f = useCurrentFrame();
  const m = foto ? 1 : mola(f, 0.05, { damping: 20 });
  const zoom = foto ? 1.06 : 1.04 + 0.08 * entre(f, 0, dur, 0, 1, (x) => x);
  const src = /^https?:/.test(c.imagem) ? c.imagem : staticFile(c.imagem);
  return (
    <>
      <Rotulo texto={c.etiqueta} />
      <Vidro raio={48} style={{ padding: 14, opacity: m, transform: `translateY(${(1 - m) * 40}px)` }}>
        <div style={{ position: "relative", width: 912, height: c.texto ? altura * 0.58 : altura * 0.86, borderRadius: 36, overflow: "hidden" }}>
          <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
        </div>
      </Vidro>
      {c.texto && <div style={{ marginTop: 46 }}><Grande texto={c.texto} inicio={foto ? -5 : 0.5} escala={0.7} /></div>}
    </>
  );
};

/** Escolhe a cena pelo tipo. */
export const CenaQualquer: React.FC<{ c: Cena; dur: number; foto?: boolean; altura: number }> = ({ c, dur, foto = false, altura }) => {
  const p = { dur, foto, altura } as const;
  switch (c.tipo) {
    case "frase": return <CenaFrase c={c} {...p} />;
    case "palavras": return <CenaPalavras c={c} {...p} />;
    case "digitando": return <CenaDigitando c={c} {...p} />;
    case "conversa": return <CenaConversa c={c} {...p} />;
    case "numero": return <CenaNumero c={c} {...p} />;
    case "lista": return <CenaLista c={c} {...p} />;
    case "comparar": return <CenaComparar c={c} {...p} />;
    case "imagem": return <CenaImagem c={c} {...p} />;
  }
};

/** Cartão final: símbolo que se desenha, diagnóstico gratuito, WhatsApp e site. */
export const Final: React.FC<{ foto?: boolean }> = ({ foto = false }) => {
  const f = useCurrentFrame();
  const t = useTema();
  const cartao = foto ? 1 : mola(f, 0.05, { damping: 18 });
  const botao = foto ? 1 : mola(f, 1.6, { damping: 13 });
  const rodape = foto ? 1 : entre(f, 2.0, 2.6);
  const luz = foto ? 0 : entre(f, 0.1, 1.4);
  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
      {!foto && <div style={{ position: "absolute", left: "50%", top: "40%", width: 1400, height: 1400, marginLeft: -700, marginTop: -700, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(129,140,248,.45), rgba(129,140,248,0) 60%)", opacity: Math.sin(luz * Math.PI) * 0.9, transform: `scale(${0.4 + luz * 0.8})` }} />}
      <Vidro raio={60} style={{ width: 940, padding: "76px 50px 64px", display: "flex", flexDirection: "column", alignItems: "center", opacity: cartao, transform: `translateY(${(1 - cartao) * 60}px) scale(${0.94 + 0.06 * cartao})` }}>
        <div style={{ position: "relative" }}><Simbolo progresso={foto ? 1 : entre(f, 0.15, 1.4)} largura={240} id="fim" claro={t.claro} /></div>
        <div style={{ position: "relative", marginTop: 50 }}><Texto texto={"Diagnóstico *gratuito*\npara o seu negócio"} inicio={foto ? -5 : 0.6} tamanho={84} /></div>
        <div style={{ position: "relative", marginTop: 54, display: "flex", alignItems: "center", gap: 18, padding: "26px 48px", borderRadius: 999, background: DEGRADE, color: "#fff", fontFamily: SANS, fontWeight: 650, fontSize: 46,
          opacity: !foto && f < q(1.6) ? 0 : botao, transform: `scale(${0.8 + 0.2 * botao})`, boxShadow: "0 30px 60px -26px rgba(79,70,229,.95)", overflow: "hidden" }}>
          <svg width="44" height="44" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z" /></svg>
          (11) 93929-9209
          {!foto && <Reflexo inicio={2.3} raio={999} />}
        </div>
        <div style={{ position: "relative", marginTop: 34, fontFamily: MONO, fontSize: 27, color: t.etiqueta, textAlign: "center", lineHeight: 1.7, opacity: rodape }}>
          origemdigitalsite.com.br · @origem__digital
        </div>
      </Vidro>
    </div>
  );
};
