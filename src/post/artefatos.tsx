// Artefatos: objetos 3D da biblioteca (recortados, sem fundo) que entram voando e flutuam,
// e a cena "site" (um notebook com um site de onde os painéis saem voando em 3D).
import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { DEGRADE, SANS } from "../comum/marca";
import { entre, mola, q } from "../comum/tempo";
import type { Cena } from "./tipos";
import { useTema } from "./tema";
import { Apoio, Rotulo, Texto, Vidro } from "./pecas";
import { letrasPorLinha, quebrar, tamanhoFrase } from "./tempos";

const fonte = (src: string) => (/^https?:/.test(src) ? src : staticFile(src));
const palavras = (t = "") => t.replace(/\*/g, "").split(/\s+/).filter(Boolean).length;

/** Um objeto 3D que entra voando (de baixo, girando) e depois flutua de leve. */
export const Objeto: React.FC<{ src: string; tamanho: number; inicio: number; foto: boolean; semente?: number }> = ({ src, tamanho, inicio, foto, semente = 0 }) => {
  const f = useCurrentFrame();
  const t = useTema();
  const m = foto ? 1 : mola(f, inicio, { stiffness: 70, damping: 12, mass: 1 });
  const s = (f - q(inicio)) / 30;
  const flutua = foto ? 0 : Math.sin(s * 1.3 + semente) * tamanho * 0.025;
  const gira = foto ? -8 : -8 + Math.sin(s * 0.9 + semente) * 6;
  if (!foto && f < q(inicio)) return null;
  return (
    <div style={{ position: "relative", width: tamanho, height: tamanho, perspective: 1600 }}>
      <div style={{ position: "absolute", inset: "12%", borderRadius: "50%", background: t.nome === "noite" ? "radial-gradient(circle, rgba(129,140,248,.55), rgba(129,140,248,0) 70%)" : "radial-gradient(circle, rgba(165,180,252,.55), rgba(165,180,252,0) 70%)", opacity: m, transform: `scale(${0.6 + 0.6 * m})` }} />
      <Img src={fonte(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain",
        opacity: Math.min(1, m * 1.6),
        transform: `translateY(${(1 - m) * tamanho * 0.9 + flutua}px) rotateY(${gira - (1 - m) * 70}deg) rotateZ(${(1 - m) * -25}deg) scale(${0.35 + 0.65 * m})`,
        filter: t.nome === "noite" ? "drop-shadow(0 0 50px rgba(129,140,248,.45)) drop-shadow(0 30px 40px rgba(0,0,0,.55))" : "drop-shadow(0 40px 50px rgba(49,46,129,.30))" }} />
    </div>
  );
};

/** Cena "objeto": o artefato grande no centro e a frase embaixo. */
export const CenaObjeto: React.FC<{ c: Extract<Cena, { tipo: "objeto" }>; foto: boolean; altura: number }> = ({ c, foto, altura }) => {
  const tam = Math.min(620, altura * 0.5);
  const t2 = tamanhoFrase(c.texto, 0.82);
  return (
    <>
      <Rotulo texto={c.etiqueta} />
      <Objeto src={c.objeto} tamanho={tam} inicio={0.05} foto={foto} />
      <div style={{ marginTop: 20 }}><Texto texto={quebrar(c.texto, letrasPorLinha(t2))} inicio={foto ? -5 : 0.55} tamanho={t2} /></div>
      {c.apoio && <Apoio texto={c.apoio} inicio={foto ? -5 : 0.9 + palavras(c.texto) * 0.08} style={{ marginTop: 36 }} />}
    </>
  );
};

/** Até 3 artefatos pequenos flutuando nas bordas de qualquer cena (atrás do conteúdo). */
export const Artefatos: React.FC<{ lista: string[]; foto: boolean; topo: number; altura: number }> = ({ lista, foto, topo, altura }) => {
  const lugares = [{ left: 30, top: topo + altura * 0.02, tam: 230 }, { right: 20, top: topo + altura * 0.42, tam: 210 }, { left: 50, top: topo + altura * 0.74, tam: 190 }];
  return (
    <>
      {lista.slice(0, 3).map((src, i) => {
        const { tam, ...pos } = lugares[i];
        return <div key={i} style={{ position: "absolute", ...pos, opacity: 0.97 }}><Objeto src={src} tamanho={tam} inicio={0.4 + i * 0.5} foto={foto} semente={i * 2.1} /></div>;
      })}
    </>
  );
};

// ---------------------------------------------------------------- cena "site"
/** Um site de mentira (só blocos, sem texto) na tela do notebook. */
const SiteFalso: React.FC<{ rolagem: number }> = ({ rolagem }) => (
  <div style={{ position: "absolute", inset: 0, background: "#F8FAFC", overflow: "hidden" }}>
    <div style={{ transform: `translateY(${-rolagem}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 26px" }}>
        <div style={{ width: 34, height: 18, borderRadius: 9, background: DEGRADE }} />
        <div style={{ flex: 1 }} />
        {[60, 50, 70].map((w, i) => <div key={i} style={{ width: w, height: 10, borderRadius: 5, background: "#CBD5E1" }} />)}
        <div style={{ width: 90, height: 28, borderRadius: 14, background: "#312E81" }} />
      </div>
      <div style={{ padding: "34px 40px 0", display: "flex", gap: 30 }}>
        <div style={{ flex: 1.2 }}>
          <div style={{ width: "92%", height: 30, borderRadius: 8, background: "#1E1B4B" }} />
          <div style={{ width: "70%", height: 30, borderRadius: 8, background: DEGRADE, marginTop: 12 }} />
          {[96, 88, 60].map((w, i) => <div key={i} style={{ width: `${w}%`, height: 10, borderRadius: 5, background: "#CBD5E1", marginTop: i ? 9 : 22 }} />)}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <div style={{ width: 150, height: 40, borderRadius: 20, background: "#22C55E" }} />
            <div style={{ width: 110, height: 40, borderRadius: 20, border: "2px solid #312E81" }} />
          </div>
        </div>
        <div style={{ flex: 1, height: 220, borderRadius: 18, background: "linear-gradient(140deg, #BAE6FD, #818CF8 60%, #312E81)" }} />
      </div>
      <div style={{ display: "flex", gap: 18, padding: "40px 40px 0" }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ flex: 1, height: 150, borderRadius: 16, background: "#fff", boxShadow: "0 10px 30px -14px rgba(49,46,129,.35)" }} />)}
      </div>
      <div style={{ display: "flex", gap: 18, padding: "30px 40px 0" }}>
        {[0, 1].map((i) => <div key={i} style={{ flex: 1, height: 190, borderRadius: 16, background: i ? "#EEF2FF" : "#E0F2FE" }} />)}
      </div>
    </div>
  </div>
);

const ICONES = ["M5 12.5l4.2 4.2L19 7", "M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z", "M13 2L4 14h7l-1 8 9-12h-7z"];

export const CenaSite: React.FC<{ c: Extract<Cena, { tipo: "site" }>; foto: boolean }> = ({ c, foto }) => {
  const f = useCurrentFrame();
  const t = useTema();
  const sobe = foto ? 1 : mola(f, 0.05, { stiffness: 70, damping: 16 });
  const rolagem = foto ? 120 : entre(f, 0.8, 3.2, 0, 160);
  const paineis = (c.paineis ?? []).slice(0, 3);
  // de onde os painéis saem (o meio da tela) e para onde voam
  const ORIGEM = { x: 470, y: 250 };
  const DESTINOS = [{ x: 270, y: 70 }, { x: 680, y: 250 }, { x: 290, y: 520 }];
  const t2 = tamanhoFrase(c.texto, 0.78);
  return (
    <>
      <Rotulo texto={c.etiqueta} />
      <div style={{ position: "relative", width: 940, height: 660, perspective: 1800 }}>
        {/* notebook */}
        <div style={{ position: "absolute", left: 90, top: 60, width: 760, transformStyle: "preserve-3d", opacity: Math.min(1, sobe * 1.4),
          transform: `translateY(${(1 - sobe) * 260}px) rotateX(${10 + (1 - sobe) * 25}deg) rotateY(${-12 + (1 - sobe) * -20}deg)` }}>
          <div style={{ position: "relative", height: 470, borderRadius: 26, padding: 16, background: "linear-gradient(150deg, #2A2760, #0B0A24 50%, #1E1B4B)",
            boxShadow: t.nome === "noite" ? "inset 0 0 0 2px rgba(165,180,252,.35), 0 0 120px rgba(79,70,229,.45)" : "inset 0 0 0 2px rgba(255,255,255,.15), 0 70px 110px -50px rgba(30,27,75,.6)" }}>
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 14, overflow: "hidden" }}><SiteFalso rolagem={rolagem} /></div>
          </div>
          <div style={{ height: 26, margin: "0 -60px", borderRadius: "0 0 30px 30px", background: "linear-gradient(180deg, #CBD5E1, #94A3B8)", boxShadow: "0 30px 40px -20px rgba(30,27,75,.5)" }} />
        </div>
        {/* painéis que saem voando da tela */}
        {paineis.map((texto, i) => {
          const em = 1.4 + i * 0.6;
          const m = foto ? 1 : mola(f, em, { stiffness: 90, damping: 14 });
          if (!foto && f < q(em)) return null;
          const d = DESTINOS[i];
          const x = ORIGEM.x + (d.x - ORIGEM.x) * m, y = ORIGEM.y + (d.y - ORIGEM.y) * m;
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) translateZ(${m * 220}px) scale(${0.3 + 0.7 * m}) rotateY(${(1 - m) * -40}deg)`, opacity: Math.min(1, m * 2) }}>
              <Vidro raio={26} style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 26px", background: t.nome === "noite" ? "rgba(23,21,66,.94)" : "rgba(255,255,255,.96)" }}>
                <div style={{ position: "relative", width: 48, height: 48, borderRadius: 24, background: DEGRADE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24"><path d={ICONES[i]} fill={i ? "#fff" : "none"} stroke="#fff" strokeWidth={i ? 0 : 3} strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span style={{ position: "relative", fontFamily: SANS, fontWeight: 600, fontSize: 32, color: t.texto, whiteSpace: "nowrap" }}>{texto}</span>
              </Vidro>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10 }}><Texto texto={quebrar(c.texto, letrasPorLinha(t2))} inicio={foto ? -5 : 0.5} tamanho={t2} /></div>
    </>
  );
};
