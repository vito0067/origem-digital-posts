// As duas caras da marca nos posts: "gelo" (claro, a base do feed) e "noite" (escuro, para peças de impacto).
import React, { createContext, useContext } from "react";

export type Tema = {
  nome: "gelo" | "noite";
  fundo: string;
  texto: string;
  suave: string;
  etiqueta: string;
  /** Degradê da palavra de destaque. */
  destaque: string;
  /** Cor sólida que acompanha o destaque (anéis, ícones). */
  acento: string;
  vidro: string;
  vidroBorda: string;
  vidroSombra: string;
  vidroBrilho: string;
  /** Três manchas de luz do fundo. */
  luzes: [string, string, string];
  pontos: string;
  apagado: string;
  claro: boolean;
};

export const TEMAS: Record<Tema["nome"], Tema> = {
  gelo: {
    nome: "gelo", claro: false,
    fundo: "#F8FAFC", texto: "#1E1B4B", suave: "#475569", etiqueta: "#4F46E5",
    destaque: "linear-gradient(100deg, #38BDF8 0%, #818CF8 48%, #312E81 100%)", acento: "#4F46E5",
    vidro: "linear-gradient(160deg, rgba(255,255,255,.86), rgba(255,255,255,.58))",
    vidroBorda: "rgba(255,255,255,.95)",
    vidroSombra: "0 1px 2px rgba(30,27,75,.06), 0 30px 70px -30px rgba(49,46,129,.42)",
    vidroBrilho: "linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,0) 40%)",
    luzes: ["rgba(125,211,252,.55)", "rgba(165,180,252,.55)", "rgba(224,231,255,.9)"],
    pontos: "rgba(49,46,129,.10)", apagado: "#94A3B8",
  },
  noite: {
    nome: "noite", claro: true,
    fundo: "#0B0A24", texto: "#EEF2FF", suave: "rgba(199,210,254,.78)", etiqueta: "#A5B4FC",
    destaque: "linear-gradient(100deg, #7DD3FC 0%, #A5B4FC 50%, #E0E7FF 100%)", acento: "#A5B4FC",
    vidro: "linear-gradient(160deg, rgba(255,255,255,.10), rgba(255,255,255,.03))",
    vidroBorda: "rgba(165,180,252,.30)",
    vidroSombra: "0 0 0 1px rgba(129,140,248,.10), 0 40px 90px -30px rgba(0,0,0,.85)",
    vidroBrilho: "linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,0) 35%)",
    luzes: ["rgba(79,70,229,.60)", "rgba(56,189,248,.30)", "rgba(129,140,248,.40)"],
    pontos: "rgba(165,180,252,.10)", apagado: "rgba(165,180,252,.45)",
  },
};

const Ctx = createContext<Tema>(TEMAS.gelo);
export const useTema = () => useContext(Ctx);
export const ComTema: React.FC<{ nome?: Tema["nome"]; children: React.ReactNode }> = ({ nome = "gelo", children }) => (
  <Ctx.Provider value={TEMAS[nome] ?? TEMAS.gelo}>{children}</Ctx.Provider>
);

/** Estilo de texto preenchido com o degradê de destaque. */
export const preenchido = (t: Tema): React.CSSProperties => ({
  backgroundImage: t.destaque, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent",
});
