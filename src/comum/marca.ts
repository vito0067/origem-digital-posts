// Cores e letras da marca "Gelo" (as mesmas do site e do Manual da Marca).
import { loadFont as carregarSans } from "@remotion/google-fonts/InstrumentSans";
import { loadFont as carregarSerifa } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as carregarMono } from "@remotion/google-fonts/DMMono";

export const SANS = carregarSans("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] }).fontFamily;
export const SERIFA = carregarSerifa("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const MONO = carregarMono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;

export const COR = {
  gelo: "#F8FAFC", papel: "#FFFFFF", ceu: "#BAE6FD", ceuClaro: "#E0F2FE", violeta: "#818CF8", violetaSuave: "#EEF2FF",
  noite: "#312E81", tinta: "#1E1B4B", grafite: "#475569", cinza: "#64748B", linha: "#E2E8F0", azul: "#4F46E5",
  madrugada: "#0B0A24", celeste: "#38BDF8", sucesso: "#16A34A",
};

export const DEGRADE = `linear-gradient(110deg, ${COR.celeste} 0%, ${COR.violeta} 50%, ${COR.noite} 100%)`;
