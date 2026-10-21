// Peças das versões verticais (1080x1920): conversa de WhatsApp em tamanho de tela de celular,
// chip de IA legível e área segura do Reels (o topo e a base são cobertos pela interface do app).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COR, MONO, SANS } from "./marca";
import { mola } from "./tempo";

/** Faixas que o Instagram/TikTok cobrem: evite texto importante fora de [TOPO, BASE]. */
export const SEGURO = { topo: 210, base: 1480, lado: 70 };

/** Conversa grande: cabeçalho (avatar, nome, status) + mensagens + campo de digitar opcional. */
export const ConversaGrande: React.FC<{
  nome: string; status: string; statusCor?: string; tema?: "dia" | "noite"; altura: number; children: React.ReactNode;
  campo?: React.ReactNode; avatar?: React.ReactNode; style?: React.CSSProperties;
}> = ({ nome, status, statusCor, tema = "dia", altura, children, campo, avatar, style }) => {
  const noite = tema === "noite";
  return (
    <div style={{ width: 940, height: altura, borderRadius: 48, overflow: "hidden", display: "flex", flexDirection: "column", background: noite ? "#E9ECF6" : COR.gelo,
      boxShadow: noite ? "0 0 0 2px rgba(129,140,248,.35), 0 60px 120px -40px rgba(0,0,0,.85)" : "0 0 0 2px rgba(30,27,75,.06), 0 60px 120px -45px rgba(49,46,129,.55)", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "26px 34px", background: "#fff", borderBottom: `2px solid ${COR.linha}` }}>
        {avatar ?? <div style={{ width: 84, height: 84, borderRadius: 42, background: `linear-gradient(135deg, ${COR.ceu}, ${COR.violeta})`, flexShrink: 0 }} />}
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 40, color: COR.tinta, lineHeight: 1.1 }}>{nome}</div>
          <div style={{ fontFamily: SANS, fontSize: 28, color: statusCor ?? COR.cinza, marginTop: 4 }}>{status}</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: "28px 30px 10px", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>{children}</div>
      {campo}
    </div>
  );
};

/** Bolha grande (texto ~38 px), com hora e vistos. */
export const BolhaGrande: React.FC<{ lado: "eu" | "outro"; aparece: number; children: React.ReactNode; hora?: string; vistos?: "cinza" | "azul" | null; apagada?: number; tamanho?: number }> = ({ lado, aparece, children, hora, vistos = null, apagada = 0, tamanho = 38 }) => {
  const f = useCurrentFrame();
  const m = mola(f, aparece, { stiffness: 170, damping: 15 });
  if (f < Math.round(aparece * 30)) return null;
  const eu = lado === "eu";
  return (
    <div style={{ display: "flex", justifyContent: eu ? "flex-end" : "flex-start", marginBottom: 22, opacity: Math.min(1, m * 1.4) * (1 - 0.5 * apagada), transform: `translateY(${(1 - m) * 40}px) scale(${0.86 + 0.14 * m})`, transformOrigin: eu ? "right bottom" : "left bottom" }}>
      <div style={{ maxWidth: "86%", padding: "22px 28px 14px", borderRadius: 36, fontFamily: SANS, fontSize: tamanho, lineHeight: 1.3, background: eu ? "#DCF7E6" : "#fff", color: COR.tinta,
        borderBottomRightRadius: eu ? 10 : 36, borderBottomLeftRadius: eu ? 36 : 10, boxShadow: "0 2px 3px rgba(30,27,75,.06), 0 18px 34px -20px rgba(49,46,129,.4)" }}>
        {children}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6, fontFamily: SANS, fontSize: 22, color: COR.cinza }}>
          {hora && <span>{hora}</span>}
          {vistos && <span style={{ color: vistos === "azul" ? "#3B82F6" : "#94A3B8", fontWeight: 700, letterSpacing: -3 }}>✓✓</span>}
        </div>
      </div>
    </div>
  );
};

export const DigitandoGrande: React.FC<{ de: number; ate: number }> = ({ de, ate }) => {
  const f = useCurrentFrame();
  if (f < Math.round(de * 30) || f >= Math.round(ate * 30)) return null;
  const m = mola(f, de, { stiffness: 200 });
  return (
    <div style={{ display: "flex", gap: 14, background: "#fff", padding: "28px 32px", borderRadius: 36, borderBottomLeftRadius: 10, width: 150, marginBottom: 22, transform: `scale(${m})`, transformOrigin: "left bottom", boxShadow: "0 18px 34px -20px rgba(49,46,129,.4)" }}>
      {[0, 1, 2].map((i) => <span key={i} style={{ width: 20, height: 20, borderRadius: 10, background: COR.violeta, opacity: 0.3 + 0.7 * Math.abs(Math.sin((f / 30) * 6 - i * 0.75)) }} />)}
    </div>
  );
};

export const ChipIAGrande: React.FC<{ texto?: string }> = ({ texto = "AURORA · ATENDENTE DE IA" }) => (
  <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: COR.azul, marginBottom: 8 }}>{texto}</div>
);

/** Fundo claro da marca, com duas manchas de luz que derivam devagar. */
export const FundoGelo: React.FC<{ foco?: string; opacidade?: number }> = ({ foco = "50% 25%", opacidade = 1 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: opacidade }}>
      <AbsoluteFill style={{ background: `radial-gradient(90% 60% at ${foco}, ${COR.ceuClaro} 0%, ${COR.gelo} 55%, ${COR.violetaSuave} 100%)` }} />
      <div style={{ position: "absolute", left: -200 + Math.sin(f / 50) * 60, top: 200, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(186,230,253,.55), rgba(186,230,253,0) 70%)" }} />
      <div style={{ position: "absolute", left: 400, top: 1100 + Math.cos(f / 44) * 50, width: 1000, height: 1000, borderRadius: "50%", background: "radial-gradient(circle, rgba(199,210,254,.5), rgba(199,210,254,0) 70%)" }} />
    </AbsoluteFill>
  );
};
