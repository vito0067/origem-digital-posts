// Tipografia animada (usada nas versões verticais): frases que sobem palavra por palavra de trás
// de uma máscara, palavra de destaque na serifa itálica, etiquetas com traço, brilho que passa.
import React from "react";
import { useCurrentFrame } from "remotion";
import { COR, MONO, SANS, SERIFA } from "./marca";
import { entre, mola, q } from "./tempo";

/**
 * Frase cinética. Escreva *assim* a palavra que vai na serifa itálica; "\n" quebra a linha.
 * Cada palavra sobe de trás de uma máscara, uma depois da outra (`passo` segundos entre elas).
 */
export const Frase: React.FC<{
  texto: string; inicio: number; tamanho: number; passo?: number; peso?: number; cor?: string; corAcento?: string;
  alinhar?: "left" | "center"; entrelinha?: number; sai?: number; style?: React.CSSProperties; acentoMaior?: number;
}> = ({ texto, inicio, tamanho, passo = 0.07, peso = 600, cor = COR.tinta, corAcento = COR.noite, alinhar = "center", entrelinha = 1.02, sai, style, acentoMaior = 1.12 }) => {
  const f = useCurrentFrame();
  const fim = sai !== undefined ? entre(f, sai, sai + 0.35) : 0;
  let n = 0;
  let dentro = false; // dentro de um destaque *...* que pode ter várias palavras
  const linhas = texto.split("\n");
  return (
    <div style={{ textAlign: alinhar, opacity: 1 - fim, filter: fim ? `blur(${fim * 10}px)` : undefined, ...style }}>
      {linhas.map((linha, li) => (
        <div key={li} style={{ lineHeight: entrelinha, whiteSpace: "nowrap" }}>
          {linha.split(" ").map((bruta, wi, arr) => {
            const abre = bruta.startsWith("*");
            const fecha = /\*[.,!?:]?$/.test(bruta) && (bruta.length > 1 || !abre);
            const acento = dentro || abre;
            dentro = acento && !fecha;
            const palavra = bruta.replace(/\*/g, "");
            const i = n++;
            const m = mola(f, inicio + i * passo, { stiffness: 140, damping: 17, mass: 0.9 });
            const visivel = f >= q(inicio + i * passo);
            return (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: tamanho * 0.14, marginBottom: -tamanho * 0.14, paddingRight: acento ? tamanho * 0.06 : 0 }}>
                <span style={{
                  display: "inline-block",
                  transform: visivel ? `translateY(${(1 - m) * 108}%) rotate(${(1 - m) * 5}deg)` : "translateY(110%)",
                  transformOrigin: "left bottom",
                  fontFamily: acento ? SERIFA : SANS, fontStyle: acento ? "italic" : "normal", fontWeight: acento ? 400 : peso,
                  fontSize: acento ? tamanho * acentoMaior : tamanho, letterSpacing: acento ? "-0.02em" : "-0.035em",
                  color: acento ? corAcento : cor,
                }}>{palavra}</span>
                {wi < arr.length - 1 ? <span style={{ display: "inline-block", width: tamanho * 0.26 }} /> : null}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Etiqueta em DM Mono com um traço que se desenha antes do texto. */
export const Etiqueta: React.FC<{ texto: string; inicio: number; cor?: string; tamanho?: number; style?: React.CSSProperties; centro?: boolean }> = ({ texto, inicio, cor = COR.azul, tamanho = 26, style, centro }) => {
  const f = useCurrentFrame();
  const traco = entre(f, inicio, inicio + 0.35);
  const letras = entre(f, inicio + 0.15, inicio + 0.15 + texto.length * 0.018);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: centro ? "center" : "flex-start", gap: tamanho * 0.6, fontFamily: MONO, fontSize: tamanho, letterSpacing: tamanho * 0.22, color: cor, ...style }}>
      <span style={{ width: tamanho * 2.2 * traco, height: 2, background: cor, opacity: 0.9 }} />
      <span style={{ clipPath: `inset(0 ${100 - letras * 100}% 0 0)`, whiteSpace: "nowrap" }}>{texto}</span>
      {centro && <span style={{ width: tamanho * 2.2 * traco, height: 2, background: cor, opacity: 0.9 }} />}
    </div>
  );
};

/** Faixa de luz que atravessa o texto uma vez (máscara). Envolva o elemento. */
export const Brilho: React.FC<{ inicio: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ inicio, dur = 0.9, children, style }) => {
  const f = useCurrentFrame();
  const x = entre(f, inicio, inicio + dur, -40, 140);
  const ativo = f >= q(inicio) && f <= q(inicio + dur);
  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      {children}
      {ativo && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "soft-light",
          background: `linear-gradient(100deg, rgba(255,255,255,0) ${x - 18}%, rgba(255,255,255,.95) ${x}%, rgba(255,255,255,0) ${x + 18}%)` }} />
      )}
    </div>
  );
};

/** Número que "rola" até o valor (dígitos subindo, como um contador mecânico). */
export const Rolagem: React.FC<{ valor: number; tamanho: number; cor?: string; fonte?: string; peso?: number }> = ({ valor, tamanho, cor = COR.tinta, fonte = SANS, peso = 700 }) => {
  const txt = String(Math.floor(valor));
  const frac = valor - Math.floor(valor);
  return (
    <span style={{ display: "inline-flex", fontFamily: fonte, fontWeight: peso, fontSize: tamanho, color: cor, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
      {txt.split("").map((d, i) => {
        const ultimo = i === txt.length - 1;
        const prox = (Number(d) + 1) % 10;
        return (
          <span key={i} style={{ display: "inline-block", height: tamanho, overflow: "hidden", position: "relative" }}>
            <span style={{ display: "flex", flexDirection: "column", transform: `translateY(${ultimo ? -frac * tamanho : 0}px)` }}>
              <span style={{ height: tamanho }}>{d}</span>
              {ultimo && <span style={{ height: tamanho }}>{prox}</span>}
            </span>
          </span>
        );
      })}
    </span>
  );
};
