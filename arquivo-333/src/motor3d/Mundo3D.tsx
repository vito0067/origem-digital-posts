// Mostra um plano 3D no quadro atual. O mundo (renderizador + cenários) é montado uma vez por aba do navegador
// e reaproveitado: cada quadro só arruma as poses, as luzes e a câmera e desenha.
import React, { useLayoutEffect, useRef } from "react";
import { continueRender, delayRender } from "remotion";
import * as THREE from "three";
import { Cidade, Quarto } from "./cenario";
import { Portaria } from "./portaria";
import { Corredor } from "./corredor";
import { Sala1201 } from "./sala1201";
import { Vagao, Estudio, Locadora } from "./pilotos";
import { PLANOS, type Mundo } from "./planos";
// @ts-ignore  motor do Arquivo (arquivo-333/motor, cópia própria da base motor-v2): câmera com emendas, luz de cinema, pulso de luz
import { sequencia, prepararRenderizador, montarLuz, CLIMAS } from "../../motor/index.mjs";
// @ts-ignore
import { CAM_V2, variar } from "../../motor/camv2.mjs";
let LUZ_V2: any = null;
// piso de movimento do Arquivo: 1,8x o da base (com 1 o ep. 3 mediu 4,88 de movimento; a meta é acima de 5)
const PISO_ARQUIVO = 1.8;
// "noite-fria" ajustada para este perfil (11/11/2026): o vagão é fechado (a lua não entra pelo teto), então sem sombra,
// luz principal fraca e o recorte quente de trás; fundo e neblina continuam os do vagão. Sombra também deixava o quadro 5x mais lento.
const NOITE_FRIA_VAGAO = { ...CLIMAS["noite-fria"], fundo: null, neblina: null, semSombra: true,
  principal: ["#9db7ff", 0.4, [-6, 9, 4]], preenche: ["#1a2440", 0.2], recorte: ["#ffb070", 0.35, [3, 4, -6]] };
// (recorte quente forte deixava a cabine verde bege: aqui a luz do motor serve quase só para o pulso no susto)

type Estado = Mundo & { renderer: any; camera: any };
let ESTADO: Estado | null = null;
const W = 1080, H = 1920;

function mundo(): Estado {
  if (ESTADO) return ESTADO;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%";
  ESTADO = { renderer, camera: new THREE.PerspectiveCamera(40, W / H, 0.03, 900), cidade: new Cidade(), quarto: new Quarto(), portaria: new Portaria(), corredor: new Corredor(), sala1201: new Sala1201(), vagao: new Vagao(), estudio: new Estudio(), locadora: new Locadora() };
  return ESTADO;
}

export const Mundo3D: React.FC<{ plano: string; s: number; dur: number }> = ({ plano, s, dur }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const h = delayRender(`plano ${plano}`);
    try {
      const m = mundo();
      if (ref.current && m.renderer.domElement.parentElement !== ref.current) ref.current.appendChild(m.renderer.domElement);
      const v2 = CAM_V2[plano] as any;
      const fn = PLANOS[v2 ? v2.base : plano];
      if (!fn) throw new Error(`plano desconhecido: ${plano}`);
      m.cidade.padrao(); m.quarto.padrao(); m.portaria.padrao(); m.corredor.padrao(); m.sala1201.padrao(); m.vagao.padrao(); m.estudio.padrao(); m.locadora.padrao();
      // motor v2: o plano antigo arruma o cenário no tempo da cena inteira; a câmera e a luz vêm do motor v2
      const dCena = v2 ? dur / (v2.b - v2.a) : dur, sCena = v2 ? v2.a * dCena + s : s;
      const t = fn(sCena, dCena, m);
      const cam = m.camera;
      if (v2) {
        if (!LUZ_V2) { prepararRenderizador(THREE, m.renderer, 1.1, true); LUZ_V2 = montarLuz(THREE, m.vagao.cena, NOITE_FRIA_VAGAO, { alvo: [0, 1, -3] }); }
        const desde = ((v2.pulsos ? v2.pulsos(dCena) : []) as number[]).map((tk) => sCena - tk).filter((x) => x >= 0);
        LUZ_V2.pulso(desde.length ? Math.min(...desde) : -1, v2.forca ?? 1);
        const plano = (u: number, d: number) => variar(t, v2.var, u / d);
        const c = sequencia([{ inicio: 0, fim: dur, plano, entrada: v2.entrada, tremor: v2.tremor, piso: v2.piso ?? PISO_ARQUIVO }])(s);
        cam.fov = c.fov; cam.position.set(...(c.pos as [number, number, number])); cam.up.set(0, 1, 0); cam.lookAt(...(c.alvo as [number, number, number]));
        if (c.rolar) cam.rotateZ(c.rolar);
      } else {
        cam.fov = t.fov ?? 60; cam.position.set(...t.pos); cam.up.set(0, 1, 0); cam.lookAt(...t.alvo);
        if (t.rolar) cam.rotateZ(t.rolar);
      }
      cam.updateProjectionMatrix();
      m.renderer.render(m[t.cena].cena, cam);
    } finally {
      continueRender(h);
    }
  }, [plano, s, dur]);
  return <div ref={ref} style={{ position: "absolute", inset: 0, filter: "contrast(1.06) saturate(1.08)" }} />;
};

/** Um quadro parado de um plano (para fotos, capas e testes). */
export const Plano3D: React.FC<{ plano: string; s?: number; dur?: number }> = ({ plano, s = 1, dur = 3 }) => <Mundo3D plano={plano} s={s} dur={dur} />;
