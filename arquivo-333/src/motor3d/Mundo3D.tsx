// Mostra um plano 3D no quadro atual. O mundo (renderizador + cenários) é montado uma vez por aba do navegador
// e reaproveitado: cada quadro só arruma as poses, as luzes e a câmera e desenha.
import React, { useLayoutEffect, useRef } from "react";
import { continueRender, delayRender } from "remotion";
import * as THREE from "three";
import { Cidade, Quarto } from "./cenario";
import { Portaria } from "./portaria";
import { PLANOS, type Mundo } from "./planos";

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
  ESTADO = { renderer, camera: new THREE.PerspectiveCamera(40, W / H, 0.03, 900), cidade: new Cidade(), quarto: new Quarto(), portaria: new Portaria() };
  return ESTADO;
}

export const Mundo3D: React.FC<{ plano: string; s: number; dur: number }> = ({ plano, s, dur }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const h = delayRender(`plano ${plano}`);
    try {
      const m = mundo();
      if (ref.current && m.renderer.domElement.parentElement !== ref.current) ref.current.appendChild(m.renderer.domElement);
      const fn = PLANOS[plano];
      if (!fn) throw new Error(`plano desconhecido: ${plano}`);
      m.cidade.padrao(); m.quarto.padrao(); m.portaria.padrao();
      const t = fn(s, dur, m);
      const cam = m.camera;
      cam.fov = t.fov ?? 60; cam.position.set(...t.pos); cam.up.set(0, 1, 0); cam.lookAt(...t.alvo);
      if (t.rolar) cam.rotateZ(t.rolar);
      cam.updateProjectionMatrix();
      m.renderer.render(t.cena === "cidade" ? m.cidade.cena : t.cena === "portaria" ? m.portaria.cena : m.quarto.cena, cam);
    } finally {
      continueRender(h);
    }
  }, [plano, s, dur]);
  return <div ref={ref} style={{ position: "absolute", inset: 0, filter: "contrast(1.06) saturate(1.08)" }} />;
};

/** Um quadro parado de um plano (para fotos, capas e testes). */
export const Plano3D: React.FC<{ plano: string; s?: number; dur?: number }> = ({ plano, s = 1, dur = 3 }) => <Mundo3D plano={plano} s={s} dur={dur} />;
