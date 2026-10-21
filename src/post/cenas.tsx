// As cenas dos posts. Cada uma serve para o Reel (1080x1920, animada) e para o carrossel
// (1080x1350, foto do último quadro). O tempo é local: 0 = começo da cena.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { COR, DEGRADE, MONO, SANS, SERIFA } from "../comum/marca";
import { entre, mola, q } from "../comum/tempo";
import { Simbolo } from "../comum/pecas";
import { Etiqueta, Frase, Rolagem } from "../comum/tipo";
import { BolhaGrande, ChipIAGrande, ConversaGrande, DigitandoGrande } from "../comum/vertical";
import type { Cena } from "./tipos";
import { SAIDA, letrasPorLinha, quebrar, tamanhoFrase, tempoMensagens } from "./tempos";

const palavras = (t = "") => t.replace(/\*/g, "").split(/\s+/).filter(Boolean).length;

/** Área útil (centraliza o conteúdo entre o topo e a base livres). */
export const Area: React.FC<{ topo: number; base: number; children: React.ReactNode }> = ({ topo, base, children }) => (
  <AbsoluteFill style={{ top: topo, bottom: base, height: "auto", padding: "0 70px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    {children}
  </AbsoluteFill>
);

/** Saída da cena: desfoca e some nos últimos instantes. */
const Sai: React.FC<{ em?: number; children: React.ReactNode }> = ({ em, children }) => {
  const f = useCurrentFrame();
  const k = em !== undefined ? entre(f, em, em + SAIDA) : 0;
  return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", opacity: 1 - k, filter: k ? `blur(${k * 10}px)` : undefined, transform: `translateY(${-k * 30}px)` }}>{children}</div>;
};

/** Texto de apoio (frase menor, sobe e aparece). */
const Apoio: React.FC<{ texto: string; inicio: number; tamanho?: number }> = ({ texto, inicio, tamanho = 42 }) => {
  const f = useCurrentFrame();
  const m = mola(f, inicio, { damping: 20 });
  return (
    <div style={{ fontFamily: SANS, fontSize: tamanho, lineHeight: 1.35, color: COR.grafite, textAlign: "center", maxWidth: 880, marginTop: 44, opacity: f < q(inicio) ? 0 : m, transform: `translateY(${(1 - m) * 24}px)` }}>
      {texto}
    </div>
  );
};

/** Frase grande que quebra sozinha nas linhas. */
const Grande: React.FC<{ texto: string; inicio: number; escala?: number }> = ({ texto, inicio, escala = 1 }) => {
  const tam = tamanhoFrase(texto, escala);
  return <Frase texto={quebrar(texto, letrasPorLinha(tam))} inicio={inicio} tamanho={tam} entrelinha={1.06} />;
};

const Rotulo: React.FC<{ texto?: string }> = ({ texto }) =>
  texto ? <Etiqueta texto={texto.toUpperCase()} inicio={0.05} centro tamanho={26} style={{ marginBottom: 46 }} /> : null;

// ---------------------------------------------------------------- cenas

const CenaFrase: React.FC<{ c: Extract<Cena, { tipo: "frase" }> }> = ({ c }) => (
  <>
    <Rotulo texto={c.etiqueta} />
    <Grande texto={c.texto} inicio={0.2} />
    {c.apoio && <Apoio texto={c.apoio} inicio={0.4 + palavras(c.texto) * 0.07} />}
  </>
);

const CenaNumero: React.FC<{ c: Extract<Cena, { tipo: "numero" }> }> = ({ c }) => {
  const f = useCurrentFrame();
  const v = c.valor * entre(f, 0.25, 1.4);
  const surge = mola(f, 0.15, { damping: 18 });
  const extra = { fontFamily: SERIFA, fontStyle: "italic" as const, color: COR.violeta, fontSize: 170, lineHeight: 1, whiteSpace: "nowrap" as const };
  // sufixo curto ("h", "%") fica ao lado do número; comprido ("dias úteis") vai embaixo
  const ladoALado = (c.sufixo ?? "").trim().length <= 3;
  return (
    <>
      <Rotulo texto={c.etiqueta} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${0.85 + 0.15 * surge})`, opacity: surge }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 12 }}>
          {c.prefixo && <span style={extra}>{c.prefixo}</span>}
          <Rolagem valor={Math.min(c.valor, v)} tamanho={300} cor={COR.noite} />
          {c.sufixo && ladoALado && <span style={extra}>{c.sufixo}</span>}
        </div>
        {c.sufixo && !ladoALado && <span style={{ ...extra, fontSize: 120, marginTop: -10 }}>{c.sufixo.trim()}</span>}
      </div>
      <div style={{ marginTop: 40 }}><Grande texto={c.texto} inicio={1.1} escala={0.72} /></div>
    </>
  );
};

const CenaLista: React.FC<{ c: Extract<Cena, { tipo: "lista" }> }> = ({ c }) => {
  const f = useCurrentFrame();
  const ini = 0.6 + palavras(c.titulo) * 0.07;
  return (
    <>
      <Rotulo texto={c.etiqueta} />
      <Grande texto={c.titulo} inicio={0.15} escala={0.8} />
      <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 56, width: 920 }}>
        {c.itens.map((item, i) => {
          const m = mola(f, ini + i * 1.0, { damping: 17 });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, padding: "26px 32px", borderRadius: 30, background: "#fff", boxShadow: "0 2px 3px rgba(30,27,75,.05), 0 24px 44px -28px rgba(49,46,129,.45)",
              opacity: f < q(ini + i * 1.0) ? 0 : m, transform: `translateX(${(1 - m) * -60}px)` }}>
              <div style={{ width: 54, height: 54, borderRadius: 27, background: DEGRADE, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="28" height="28" viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 42, fontWeight: 500, color: COR.tinta, lineHeight: 1.25 }}>{item}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const CenaImagem: React.FC<{ c: Extract<Cena, { tipo: "imagem" }>; dur: number; altura: number }> = ({ c, dur, altura }) => {
  const f = useCurrentFrame();
  const m = mola(f, 0.05, { damping: 20 });
  const zoom = 1.04 + 0.08 * entre(f, 0, dur, 0, 1, (x) => x);
  const src = /^https?:/.test(c.imagem) ? c.imagem : staticFile(c.imagem);
  return (
    <>
      <Rotulo texto={c.etiqueta} />
      <div style={{ width: 940, height: c.texto ? altura * 0.62 : altura * 0.9, borderRadius: 44, overflow: "hidden", opacity: m, transform: `translateY(${(1 - m) * 40}px)`, boxShadow: "0 50px 100px -50px rgba(49,46,129,.6)" }}>
        <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
      </div>
      {c.texto && <div style={{ marginTop: 50 }}><Grande texto={c.texto} inicio={0.5} escala={0.72} /></div>}
    </>
  );
};

/** Altura aproximada de uma bolha (texto de 36 px, ~32 letras por linha). */
const alturaBolha = (texto: string, aurora: boolean) => 90 + Math.ceil(texto.length / 32) * 47 + (aurora ? 36 : 0);

const CenaConversa: React.FC<{ c: Extract<Cena, { tipo: "conversa" }>; altura: number }> = ({ c, altura }) => {
  const ts = tempoMensagens(c.mensagens);
  // a caixa tem o tamanho das mensagens (sem espaço vazio), até o limite da área
  const caixa = Math.min(altura - 80, Math.max(560, 190 + c.mensagens.reduce((s, m) => s + alturaBolha(m.texto, m.de === "aurora"), 0)));
  return (
    <>
      <Etiqueta texto="CONVERSA DE EXEMPLO" inicio={0.05} centro tamanho={24} style={{ marginBottom: 30 }} />
      <ConversaGrande nome={c.nome ?? "Seu negócio"} status="online" statusCor={COR.sucesso} altura={caixa}>
        {c.mensagens.map((m, i) => (
          <React.Fragment key={i}>
            {ts[i].digitaDe !== null && <DigitandoGrande de={ts[i].digitaDe!} ate={ts[i].aparece} />}
            <BolhaGrande lado={m.de === "cliente" ? "eu" : "outro"} aparece={ts[i].aparece} vistos={m.de === "cliente" ? "azul" : null} tamanho={36}>
              {m.de === "aurora" && <ChipIAGrande />}
              {m.texto}
            </BolhaGrande>
          </React.Fragment>
        ))}
      </ConversaGrande>
    </>
  );
};

/** Escolhe a cena pelo tipo. `sai` = segundo em que começa a saída (vazio = não sai, para fotos). */
export const CenaQualquer: React.FC<{ c: Cena; dur: number; sai?: number; altura: number }> = ({ c, dur, sai, altura }) => (
  <Sai em={sai}>
    {c.tipo === "frase" && <CenaFrase c={c} />}
    {c.tipo === "numero" && <CenaNumero c={c} />}
    {c.tipo === "lista" && <CenaLista c={c} />}
    {c.tipo === "imagem" && <CenaImagem c={c} dur={dur} altura={altura} />}
    {c.tipo === "conversa" && <CenaConversa c={c} altura={altura} />}
  </Sai>
);

/** Cartão final: símbolo, diagnóstico gratuito, WhatsApp e site. */
export const Final: React.FC = () => {
  const f = useCurrentFrame();
  const botao = mola(f, 1.6, { damping: 14 });
  const rodape = entre(f, 2.0, 2.6);
  return (
    <>
      <Simbolo progresso={entre(f, 0.05, 1.3)} largura={260} id="fim" />
      <div style={{ marginTop: 56 }}><Frase texto={"Diagnóstico *gratuito*\npara o seu negócio"} inicio={0.6} tamanho={92} /></div>
      <div style={{ marginTop: 56, display: "flex", alignItems: "center", gap: 18, padding: "26px 46px", borderRadius: 999, background: DEGRADE, color: "#fff", fontFamily: SANS, fontWeight: 600, fontSize: 46,
        opacity: f < q(1.6) ? 0 : botao, transform: `scale(${0.8 + 0.2 * botao})`, boxShadow: "0 30px 60px -30px rgba(79,70,229,.8)" }}>
        <svg width="44" height="44" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z" /></svg>
        (11) 93929-9209
      </div>
      <div style={{ marginTop: 34, fontFamily: MONO, fontSize: 28, color: COR.azul, textAlign: "center", lineHeight: 1.7, opacity: rodape }}>
        origemdigitalsite.com.br · @origem__digital
      </div>
    </>
  );
};

/** Assinatura pequena no topo (símbolo + nome). */
export const Marca: React.FC<{ topo: number }> = ({ topo }) => (
  <div style={{ position: "absolute", top: topo, left: 70, display: "flex", alignItems: "center", gap: 16 }}>
    <Simbolo largura={64} id="marca" />
    <span style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: COR.tinta }}>ORIGEM DIGITAL</span>
  </div>
);
