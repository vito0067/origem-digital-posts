// As cenas da série "O Sinal". Cada cena recebe `s` = segundos desde o começo dela e `dur` = duração.
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { loadFont as carregarMono } from "@remotion/google-fonts/SpaceMono";
import { loadFont as carregarAnton } from "@remotion/google-fonts/Anton";
import { COR, Chuva, Janelas, fachada, Silhueta, Celular } from "./pecas";
import { sorteio } from "./tempo";

export const MONO = carregarMono("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;
export const ANTON = carregarAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;

const lim = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const suave = (x: number) => { const t = lim(x); return t * t * (3 - 2 * t); };
const tremor = (s: number, forca: number, semente = 1) => ({
  x: Math.sin(s * 91 + semente) * forca + Math.sin(s * 57 + semente * 3) * forca * 0.6,
  y: Math.cos(s * 83 + semente) * forca * 0.7,
});
export type PropsCena = { s: number; dur: number };

// ---------------------------------------------------------------- 1. relógio + cidade
const CIDADE = (() => {
  const r = sorteio(3);
  const predios: { x: number; w: number; h: number; janelas: { x: number; y: number }[] }[] = [];
  let x = -40;
  while (x < 1120) {
    const w = 110 + r() * 150, h = 380 + r() * 820;
    const janelas: { x: number; y: number }[] = [];
    for (let yy = 40; yy < h - 30; yy += 44) for (let xx = 18; xx < w - 22; xx += 34) if (r() < 0.5) janelas.push({ x: xx, y: yy });
    predios.push({ x, w, h, janelas });
    x += w + 8 + r() * 14;
  }
  return predios;
})();

export const CenaRelogio: React.FC<PropsCena> = ({ s }) => {
  const fase2 = s > 2.6;
  if (!fase2) {
    const vib = s < 0.9 ? tremor(s, 6) : { x: 0, y: 0 };
    const pisca = Math.floor(s * 2) % 2 === 0 ? 1 : 0.25;
    return (
      <AbsoluteFill style={{ background: COR.noite, transform: `scale(${1 + s * 0.025})` }}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,40,40,0.18) 0%, rgba(0,0,0,0) 55%)" }} />
        <div style={{ position: "absolute", top: 560, width: "100%", textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 290, color: "#FF2E2E", letterSpacing: -6, textShadow: "0 0 40px rgba(255,46,46,0.85), 0 0 120px rgba(255,46,46,0.45)" }}>
          03<span style={{ opacity: pisca }}>:</span>33
        </div>
        {/* criado-mudo e celular */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1240, height: 700, background: "linear-gradient(180deg, #0B0F1C, #020308)" }} />
        <div style={{ position: "absolute", left: 360 + vib.x, top: 1290 + vib.y, width: 360, height: 180, borderRadius: 34, background: "#05070C", border: "3px solid #1B2233", transform: "perspective(900px) rotateX(58deg)", boxShadow: s > 0.05 ? "0 0 120px rgba(127,231,255,0.55)" : "none" }}>
          <div style={{ position: "absolute", inset: 12, borderRadius: 24, background: s > 0.05 ? "linear-gradient(160deg, #9FF1FF, #3BA7FF)" : "#05070C", opacity: 0.9 }} />
        </div>
      </AbsoluteFill>
    );
  }
  const t = s - 2.6;
  const r = sorteio(9);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #02040A 0%, #0A1430 70%, #101B3E 100%)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1920, transform: `scale(${1.08 + t * 0.03})`, transformOrigin: "50% 100%" }}>
        {CIDADE.map((p, i) => (
          <div key={i} style={{ position: "absolute", left: p.x, bottom: 0, width: p.w, height: p.h, background: COR.predio, borderTop: "2px solid #111A33" }}>
            {p.janelas.map((j, k) => {
              const aparece = r() * 2.6;
              const on = t > aparece;
              return <div key={k} style={{ position: "absolute", left: j.x, top: j.y, width: 10, height: 14, borderRadius: 3, background: on ? COR.tela : "transparent", boxShadow: on ? "0 0 14px rgba(127,231,255,0.95)" : "none", opacity: on ? 0.55 + 0.45 * Math.sin(t * 12 + k) ** 2 : 0 }} />;
            })}
          </div>
        ))}
      </div>
      <Chuva n={50} opacidade={0.22} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 2. quarto
export const CenaQuarto: React.FC<PropsCena> = ({ s }) => {
  const luz = 0.75 + 0.25 * Math.sin(s * 3.1) * Math.sin(s * 1.7);
  return (
    <AbsoluteFill style={{ background: "#03050B", transform: `scale(${1.04 + s * 0.012})` }}>
      {/* janela com a cidade lá fora */}
      <div style={{ position: "absolute", left: 90, top: 260, width: 420, height: 720, background: "linear-gradient(180deg, #0A1636, #13224C)", border: "14px solid #0A0D16", overflow: "hidden" }}>
        {Array.from({ length: 26 }, (_, i) => {
          const r = sorteio(i + 40);
          return <div key={i} style={{ position: "absolute", left: r() * 400, top: 300 + r() * 420, width: 6 + r() * 10, height: 6 + r() * 10, borderRadius: 10, background: r() > 0.5 ? COR.janela : COR.tela, opacity: 0.35 + r() * 0.4, filter: "blur(1.5px)" }} />;
        })}
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 12, background: "#0A0D16" }} />
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 12, background: "#0A0D16" }} />
      </div>
      {/* cortina */}
      <div style={{ position: "absolute", left: 40, top: 220, width: 130, height: 820, background: "linear-gradient(90deg, #05070D, #0D1220 60%, #05070D)", borderRadius: "0 0 40px 40px" }} />
      {/* cama */}
      <div style={{ position: "absolute", left: -60, right: -60, top: 1330, height: 700, background: "linear-gradient(180deg, #0B1122, #03050A)", borderRadius: "60px 60px 0 0" }} />
      <div style={{ position: "absolute", left: 300, top: 560 }}><Silhueta luz={luz} escala={1.25} /></div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 3. notificação sem remetente
export const CenaNotificacao: React.FC<PropsCena> = ({ s }) => {
  const desce = suave(s / 0.45);
  const tr = s < 0.6 ? tremor(s, 5, 2) : { x: 0, y: 0 };
  return (
    <AbsoluteFill style={{ background: COR.noite, alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `translate(${tr.x}px, ${tr.y + 40}px) scale(${0.92 + s * 0.012})` }}>
        <Celular>
          <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", color: "#E8F1FF", fontFamily: MONO, fontSize: 160, fontWeight: 700, letterSpacing: -4 }}>3:33</div>
          <div style={{ position: "absolute", top: 370, width: "100%", textAlign: "center", color: "#8FA3C8", fontFamily: MONO, fontSize: 34 }}>domingo, 26 de outubro</div>
          <div style={{ position: "absolute", left: 36, right: 36, top: 520 - (1 - desce) * 260, opacity: desce, borderRadius: 44, background: "rgba(30,38,58,0.92)", padding: "34px 36px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div style={{ width: 76, height: 76, borderRadius: 20, background: "#2A3350", color: "#B8C4E0", fontFamily: MONO, fontSize: 46, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#F2F5FF", fontFamily: MONO, fontSize: 34, fontWeight: 700 }}>Remetente desconhecido</div>
                <div style={{ color: "#8FA3C8", fontFamily: MONO, fontSize: 28 }}>agora</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
              {[150, 120, 140, 210].map((w, i) => <div key={i} style={{ width: w, height: 30, borderRadius: 10, background: "#4A5678", filter: "blur(5px)", opacity: 0.9 }} />)}
            </div>
          </div>
        </Celular>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 4. "NÃO OLHE PELA JANELA."
export const CenaMensagem: React.FC<PropsCena> = ({ s }) => {
  const tr = tremor(s, s < 0.5 ? 18 : 3, 4);
  const separa = s < 0.35 ? 14 : 4 + 3 * Math.sin(s * 40);
  const linhas = ["NÃO OLHE", "PELA", "JANELA."];
  const corte = Math.floor(s * 30) % 9 === 0 ? 24 : 0;
  const texto = (cor: string, dx: number) => (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `translate(${tr.x + dx}px, ${tr.y}px)`, mixBlendMode: "screen" }}>
      {linhas.map((l, i) => <div key={i} style={{ fontFamily: ANTON, fontSize: 205, lineHeight: 1.14, color: cor, letterSpacing: 2, transform: `translateX(${i === 1 ? corte : 0}px)` }}>{l}</div>)}
    </div>
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, #3A0508 0%, #0A0203 70%)` }}>
      {texto("#FF0033", -separa)}
      {texto("#00E5FF", separa)}
      {texto("#FFFFFF", 0)}
      {Array.from({ length: 8 }, (_, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: ((i * 263 + Math.floor(s * 30) * 97) % 1920), height: 3 + (i % 3) * 3, background: "rgba(255,255,255,0.08)" }} />)}
      <AbsoluteFill style={{ background: "#FFFFFF", opacity: s < 0.08 ? 0.85 : 0 }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 5. a rua acende
const ESQ = fachada(11, 5, 16, 92, 86, 26, 0.3, 5.0, 0.22);
const DIR = fachada(12, 5, 16, 92, 86, 26, 0.6, 5.2, 0.22);
export const CenaRua: React.FC<PropsCena> = ({ s }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #050A1A, #0B1530)", perspective: 1400, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `translateZ(${s * 60}px)` }}>
      <div style={{ position: "absolute", left: -20, top: 60, width: 760, height: 1960, background: COR.predio, transform: "rotateY(58deg)", transformOrigin: "0% 50%", padding: 40, boxShadow: "inset -80px 0 120px rgba(0,0,0,0.7)" }}>
        <div style={{ position: "relative" }}><Janelas janelas={ESQ} s={s} /></div>
      </div>
      <div style={{ position: "absolute", right: -20, top: 60, width: 760, height: 1960, background: COR.predio, transform: "rotateY(-58deg)", transformOrigin: "100% 50%", padding: 40, boxShadow: "inset 80px 0 120px rgba(0,0,0,0.7)" }}>
        <div style={{ position: "relative" }}><Janelas janelas={DIR} s={s} /></div>
      </div>
      {/* fundo da rua */}
      <div style={{ position: "absolute", left: 380, width: 320, top: 380, height: 900, background: "#0A1124" }}>
        <Janelas janelas={fachada(13, 3, 10, 70, 60, 26, 0.2, 4.6, 0.12)} s={s} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1280, height: 700, background: "linear-gradient(180deg, #0A0F1E, #020308)" }} />
    </div>
    <Chuva n={80} opacidade={0.3} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- 6. vibrou de novo
export const CenaVibra: React.FC<PropsCena> = ({ s }) => {
  const tr = s < 1.0 ? tremor(s, 10, 6) : { x: 0, y: 0 };
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #18213D 0%, #04060D 70%)", alignItems: "center", justifyContent: "center" }}>
      {/* lençol */}
      {Array.from({ length: 7 }, (_, i) => <div key={i} style={{ position: "absolute", left: -200, right: -200, top: 200 + i * 260, height: 140, background: "rgba(255,255,255,0.025)", borderRadius: 200, transform: `rotate(${-8 + i * 2}deg)` }} />)}
      <div style={{ transform: `translate(${tr.x}px, ${tr.y}px) rotate(${-8 + (s < 1 ? Math.sin(s * 70) * 1.5 : 0)}deg) scale(0.62)` }}>
        <Celular brilho={1.4}>
          <div style={{ position: "absolute", top: 600, width: "100%", textAlign: "center", color: "#E8F1FF", fontFamily: MONO, fontSize: 64, fontWeight: 700 }}>1 nova mensagem</div>
          <div style={{ position: "absolute", top: 700, width: "100%", textAlign: "center", color: "#8FA3C8", fontFamily: MONO, fontSize: 40 }}>Remetente desconhecido</div>
        </Celular>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 7. com o meu nome
export const CenaNome: React.FC<PropsCena> = ({ s, dur }) => {
  const nome = "Marina.";
  const comeca = Math.max(0.4, dur - 2.2);
  const letras = Math.floor(lim((s - comeca) / 0.7) * nome.length);
  return (
    <AbsoluteFill style={{ background: COR.noite, alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${1.0 + s * 0.02}) translateY(60px)` }}>
        <Celular>
          <div style={{ position: "absolute", top: 120, left: 0, right: 0, padding: "0 40px", display: "flex", alignItems: "center", gap: 20, borderBottom: "1px solid #1C2540", paddingBottom: 30 }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: "#2A3350", color: "#B8C4E0", fontFamily: MONO, fontSize: 40, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
            <div style={{ color: "#F2F5FF", fontFamily: MONO, fontSize: 32, fontWeight: 700 }}>Remetente desconhecido</div>
          </div>
          <div style={{ position: "absolute", top: 300, left: 40, maxWidth: 560, borderRadius: "36px 36px 36px 8px", background: "#1E2740", padding: "26px 32px", color: "#E8EEFF", fontFamily: MONO, fontSize: 38 }}>NÃO OLHE PELA JANELA.</div>
          {s > 0.15 && (
            <div style={{ position: "absolute", top: 470, left: 40, borderRadius: "36px 36px 36px 8px", background: "#1E2740", padding: "26px 34px", color: "#FFFFFF", fontFamily: MONO, fontSize: 92, fontWeight: 700, minWidth: 120 }}>
              {letras > 0 ? nome.slice(0, letras) : <span style={{ letterSpacing: 10, opacity: 0.6 }}>{"•".repeat(1 + (Math.floor(s * 4) % 3))}</span>}
            </div>
          )}
        </Celular>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 8. a foto da janela
const Fachada12: React.FC<{ s: number; apagar?: number }> = ({ s, apagar = 99 }) => {
  const r = sorteio(21);
  const andares = 14;
  return (
    <div style={{ position: "relative", width: 760, height: andares * 150 + 80, background: "#080C18", borderTop: "4px solid #121A30" }}>
      {Array.from({ length: andares }, (_, a) => Array.from({ length: 4 }, (_, c) => {
        const andar = andares - a; // de cima para baixo
        const dela = andar === 12 && c === 2;
        const acesa = dela ? s < apagar : r() < 0.12;
        return (
          <div key={`${a}-${c}`} style={{ position: "absolute", left: 50 + c * 175, top: 40 + a * 150, width: 130, height: 100, background: acesa ? (dela ? "#FFC56B" : "#C9A15A") : "#0D1324", boxShadow: acesa && dela ? "0 0 60px rgba(255,197,107,0.8)" : "none", opacity: acesa && !dela ? 0.5 : 1, overflow: "hidden" }}>
            {dela && acesa && (
              <svg viewBox="0 0 130 100" width="130" height="100">
                <ellipse cx="62" cy="44" rx="13" ry="16" fill="#120C05" />
                <path d="M34 100 Q36 66 62 60 Q88 66 92 100 Z" fill="#120C05" />
                <rect x="80" y="58" width="9" height="16" rx="2" fill={COR.tela} opacity="0.9" />
              </svg>
            )}
          </div>
        );
      }))}
    </div>
  );
};

export const CenaFoto: React.FC<PropsCena> = ({ s }) => {
  const zoom = interpolate(s, [0.3, 4.6], [1, 2.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const aparece = suave(s / 0.35);
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 900, height: 1500, overflow: "hidden", borderRadius: 30, border: "6px solid #E8E8E8", opacity: aparece, transform: `scale(${0.9 + 0.1 * aparece}) rotate(${(1 - aparece) * -4}deg)`, filter: "contrast(1.1) saturate(0.7)" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #050914, #0D162F)" }} />
        <div style={{ position: "absolute", left: -15, top: 330, transform: `scale(${zoom})`, transformOrigin: "465px 390px" }}>
          <Fachada12 s={s} />
        </div>
        <div style={{ position: "absolute", left: 30, top: 26, color: "#FFFFFF", fontFamily: MONO, fontSize: 30, opacity: 0.85 }}>03:34 · IMG_0333</div>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)" }} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 9. décimo segundo andar
export const CenaPredio: React.FC<PropsCena> = ({ s, dur }) => {
  const sobe = interpolate(s, [0, dur - 1.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });
  const apagaEm = dur - 1.45;
  const andar = Math.max(1, Math.round(1 + sobe * 11));
  const escuro = s > apagaEm;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #02040A, #0B1430)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 160, top: 0, transform: `translateY(${-260 + sobe * 630}px)`, opacity: escuro ? 0.0 : 1 }}>
        <Fachada12 s={s} apagar={apagaEm} />
      </div>
      <div style={{ position: "absolute", right: 60, top: 860, fontFamily: ANTON, fontSize: 150, color: "#FFFFFF", opacity: escuro ? 0 : 0.92, textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>{andar}º</div>
      <AbsoluteFill style={{ background: "#000", opacity: escuro ? 1 : 0 }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 10. cartão final
export const CenaFinal: React.FC<PropsCena & { episodio: number }> = ({ s, episodio }) => {
  const g = s < 0.6 ? Math.sin(s * 90) * 10 : 0;
  const entra = (d: number) => suave((s - d) / 0.45);
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ fontFamily: MONO, fontSize: 36, color: "#8FA3C8", letterSpacing: 10, opacity: entra(0.1) }}>ARQUIVO 3:33 APRESENTA</div>
      <div style={{ position: "relative", marginTop: 30 }}>
        <div style={{ position: "absolute", inset: 0, fontFamily: ANTON, fontSize: 250, color: "#FF0033", transform: `translateX(${-6 - g}px)`, mixBlendMode: "screen", opacity: entra(0) }}>O SINAL</div>
        <div style={{ position: "absolute", inset: 0, fontFamily: ANTON, fontSize: 250, color: "#00E5FF", transform: `translateX(${6 + g}px)`, mixBlendMode: "screen", opacity: entra(0) }}>O SINAL</div>
        <div style={{ position: "relative", fontFamily: ANTON, fontSize: 250, color: "#FFFFFF", opacity: entra(0) }}>O SINAL</div>
      </div>
      <div style={{ marginTop: 40, fontFamily: ANTON, fontSize: 84, color: COR.amarelo, opacity: entra(0.5), letterSpacing: 2 }}>EPISÓDIO {episodio + 1} · AMANHÃ</div>
      <div style={{ marginTop: 50, padding: "22px 46px", borderRadius: 60, border: "3px solid #FFFFFF", fontFamily: MONO, fontSize: 44, color: "#FFFFFF", fontWeight: 700, opacity: entra(0.9), transform: `scale(${0.9 + 0.1 * entra(0.9)})` }}>SIGA PARA NÃO PERDER</div>
      <div style={{ position: "absolute", bottom: 380, fontFamily: MONO, fontSize: 26, color: "#5B6A8A", opacity: entra(1.2) }}>Ficção · criada com inteligência artificial</div>
    </AbsoluteFill>
  );
};

export const CENAS: Record<string, React.FC<any>> = {
  relogio: CenaRelogio, quarto: CenaQuarto, notificacao: CenaNotificacao, mensagem: CenaMensagem, rua: CenaRua,
  vibra: CenaVibra, nome: CenaNome, foto: CenaFoto, predio: CenaPredio, final: CenaFinal,
};
