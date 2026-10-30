// TEMPLATE 1: "Cidade de Brinquedo". Maquete 3D clara feita em código (three.js), dia de sol, câmera andando e legenda redonda.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Baloo2";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Boneco, APARENCIAS, POSES } from "../../arquivo-333/src/motor3d/boneco";
import { blocoEm, cenaEm, COMENTARIOS, limpa, forte, lim, LISTA, sai, suave, volta, type Linha } from "./comum";
const FONTE = loadFont("normal", { weights: ["800"], subsets: ["latin"] }).fontFamily;
type V = [number, number, number];
const mix = (a: V, b: V, p: number): V => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
const VERM = "#e8262c";
function sort(s: number) { return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
const M = (c: string, r = 0.55) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
const box = (w: number, h: number, d: number, m: any, r = 0.06) => { const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, Math.min(w, h, d) * 0.45)), m); b.castShadow = true; b.receiveShadow = true; return b; };
type Mundo = any;
let W: Mundo = null;
function mundo(): Mundo {
  if (W) return W;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(1080, 1920, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%";
  const cena = new THREE.Scene(); cena.background = new THREE.Color("#a9dcff"); cena.fog = new THREE.Fog("#c4e7ff", 70, 190);
  cena.add(new THREE.HemisphereLight("#ffffff", "#b9d8a0", 1.0));
  const sol = new THREE.DirectionalLight("#fff1d6", 2.5); sol.position.set(30, 50, 26); sol.castShadow = true; sol.shadow.mapSize.set(4096, 4096); const sc = sol.shadow.camera; sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70; sc.far = 180; sol.shadow.bias = -0.0005; sol.shadow.normalBias = 0.03; cena.add(sol);
  const verms: { m: any; x: number; z: number; orig: any; feira?: boolean }[] = [];
  const vm = (x: number, z: number, c = VERM, r = 0.45, feira = false) => { const m = M(c, r); verms.push({ m, x, z, orig: new THREE.Color(c), feira }); return m; };
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), M("#9ed47a", 1)); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);
  const asf = M("#5c6470", 0.9), calc = M("#e7e0d2", 0.9), fx = M("#ffffff", 0.7);
  const rua = (w: number, d: number, x: number, z: number) => { const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), asf); r.position.set(x, 0.05, z); r.receiveShadow = true; cena.add(r); };
  const R = sort(7);
  for (const k of [-36, 0, 36]) {
    rua(9, 400, k, 0); rua(400, 9, 0, k);
    for (let a = -180; a < 180; a += 7) { const f1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 3), fx); f1.position.set(k, 0.11, a); cena.add(f1); const f2 = new THREE.Mesh(new THREE.BoxGeometry(3, 0.02, 0.28), fx); f2.position.set(a, 0.11, k); cena.add(f2); }
  }
  const pastel = ["#ffc233", "#4fb3e8", "#f17fa0", "#8fd14f", "#ffd84d", "#a97fd6", "#ff9f1c", "#3fc4e8", "#f7945a", "#3fd0a0"];
  const vid = M("#bfe8ff", 0.2), jan = M("#ffffff", 0.5);
  const addPredio = (x: number, z: number, w: number, d: number, h: number) => {
    const cor = pastel[Math.floor(R() * pastel.length)]; const p = box(w, h, d, M(cor), 0.3); p.position.set(x, h / 2, z); cena.add(p);
    for (let y = 2; y < h - 1; y += 2.6) for (const s of [-1, 1]) for (let i = -Math.floor((w / 2 - 0.9) / 2.2); i <= Math.floor((w / 2 - 0.9) / 2.2); i++) { const v = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.08), vid); v.position.set(x + i * 2.2, y, z + s * (d / 2 + 0.03)); cena.add(v); const j = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.14, 0.14), jan); j.position.set(x + i * 2.2, y - 0.8, z + s * (d / 2 + 0.05)); cena.add(j); }
    const t = box(w + 0.6, 0.7, d + 0.6, R() < 0.55 ? vm(x, z) : M("#f6f1e6"), 0.2); t.position.set(x, h + 0.3, z); cena.add(t);
    if (R() < 0.5) { const tol = box(w * 0.98, 0.25, 1.6, vm(x, z), 0.05); tol.position.set(x, 2.6, z + d / 2 + 0.7); tol.rotation.x = 0.25; cena.add(tol); }
  };
  for (const cx of [-54, -18, 18, 54]) for (const cz of [-54, -18, 18, 54]) {
    for (const [dx, dz] of [[-7, -7], [7, -7], [-7, 7], [7, 7]]) { if (cx === 18 && cz === 18 && dx === -7 && dz === -7) continue; addPredio(cx + dx, cz + dz, 10 + R() * 2, 10 + R() * 2, 7 + R() * (Math.abs(cx) + Math.abs(cz) < 40 ? 16 : 8)); }
    const cal = new THREE.Mesh(new THREE.BoxGeometry(27, 0.22, 27), calc); cal.position.set(cx, 0.11, cz); cal.receiveShadow = true; cena.add(cal);
  }
  const tronco = M("#8a5a3a"), folhas = ["#6cc24a", "#57b35a", "#84cc4f"].map((c) => M(c, 0.9));
  for (let i = 0; i < 110; i++) {
    const a = R() < 0.5; const x = a ? [-36, 0, 36][Math.floor(R() * 3)] + (R() < 0.5 ? -6 : 6) : -70 + R() * 140; const z = a ? -70 + R() * 140 : [-36, 0, 36][Math.floor(R() * 3)] + (R() < 0.5 ? -6 : 6);
    if (Math.abs(x) < 16 && Math.abs(z) < 22) continue;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.2, 8), tronco); t.position.set(x, 0.8, z); t.castShadow = true; cena.add(t); const f = new THREE.Mesh(new THREE.SphereGeometry(0.9 + R() * 0.4, 14, 12), folhas[i % 3]); f.position.set(x, 2, z); f.castShadow = true; cena.add(f);
  }
  // carros
  const pneu = M("#2a2a30"), vidro = M("#cdefff", 0.15);
  const carros: any[] = [];
  const cores = ["#ffd23f", "#3a86ff", "#ffffff", "#2ec4b6", VERM, "#ff9f1c", VERM, "#8338ec"];
  for (let i = 0; i < 220; i++) {
    const g = new THREE.Group(); const c = cores[i % cores.length]; const m = c === VERM ? vm(0, 0) : M(c, 0.3); const b = box(3.2, 0.9, 1.6, m, 0.3); b.position.y = 0.75; g.add(b); const t = box(1.7, 0.7, 1.4, vidro, 0.25); t.position.set(-0.1, 1.45, 0); g.add(t);
    for (const [x, z] of [[1, 0.8], [-1, 0.8], [1, -0.8], [-1, -0.8]]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 14), pneu); r.rotation.x = Math.PI / 2; r.position.set(x, 0.36, z); r.castShadow = true; g.add(r); }
    cena.add(g); carros.push(g);
  }
  // semáforo de brinquedo na esquina
  const sem = new THREE.Group(); sem.position.set(6.6, 0, 6.6); const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 5, 12), M("#39404a", 0.4)); poste.position.y = 2.5; poste.castShadow = true; sem.add(poste);
  const cx = box(1, 2.8, 0.8, M("#20242b", 0.4), 0.18); cx.position.y = 6; sem.add(cx);
  const lamp = (y: number, c: string) => { const m = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.3, roughness: 0.3 }); const l = new THREE.Mesh(new THREE.SphereGeometry(0.33, 20, 16), m); l.position.set(0, y, 0.33); sem.add(l); return m; };
  const lV = lamp(6.85, "#ff1f2d"), lA = lamp(6, "#6a5a2a"), lG = lamp(5.15, "#1f5a33"); lA.emissiveIntensity = 0.15; lG.emissiveIntensity = 0.15; cena.add(sem);
  // barraca da feira
  const feira = new THREE.Group(); feira.position.set(11, 0.22, 11); cena.add(feira);
  const mesa = box(5, 0.9, 2.2, M("#c98f58"), 0.08); mesa.position.y = 0.7; feira.add(mesa);
  for (const x of [-2.3, 2.3]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 8), M("#f4f1e8")); p.position.set(x, 2, -0.8); feira.add(p); }
  for (let i = 0; i < 8; i++) { const f = box(5.6 / 8, 0.1, 2.6, i % 2 ? M("#ffffff") : vm(11, 11, VERM, 0.45, true), 0.03); f.position.set(-2.8 + (i + 0.5) * 5.6 / 8, 3.3, -0.2); f.rotation.x = 0.2; feira.add(f); }
  const mv = vm(11, 11, "#ee1c25", 0.35, true), fol = M("#3fa34d");
  for (let c = 0; c < 3; c++) {
    const cai = box(1.4, 0.3, 1.5, M("#f0d9a8"), 0.05); cai.position.set(-1.6 + c * 1.6, 1.3, 0.1); feira.add(cai);
    for (let i = 0; i < 12; i++) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 14), mv); b.scale.set(1, 1.2, 1); b.castShadow = true; g.add(b); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.03, 0.05, 6), fol); t.position.y = 0.24; g.add(t); g.position.set(-1.6 + c * 1.6 - 0.48 + (i % 4) * 0.32, 1.66 + (i % 2) * 0.04, 0.1 - 0.42 + Math.floor(i / 4) * 0.42); g.rotation.x = 0.5; feira.add(g); }
  }
  const ket = new THREE.Group(); const kb = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 1, 18), vm(11, 11, "#d81e1e", 0.2, true)); kb.castShadow = true; ket.add(kb); const kt = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 16), M("#f7f7f7")); kt.position.y = 0.7; ket.add(kt); ket.position.set(2.05, 2.05, 0.75); ket.scale.setScalar(1.45); feira.add(ket);
  const feirante = new Boneco({ pele: "#d9a07a", cabelo: "#2b1c14", roupa: "#2a9d8f", calca: "#27364f", tenis: "#eeeeee", penteado: "curto" } as any); feirante.raiz.position.set(-0.4, 0.75, -1.5); feirante.raiz.scale.setScalar(1.25); feira.add(feirante.raiz);
  // a sala do Seu Nilo (com a parede da lista)
  const sala = new THREE.Group(); sala.position.set(200, 0, 0); cena.add(sala);
  const psala = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 0.2), M("#f6e3bd")); psala.position.set(0, 4, -3); psala.receiveShadow = true; sala.add(psala);
  const pis = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 10), M("#c28f5c")); pis.position.set(0, 0, 1.5); pis.receiveShadow = true; sala.add(pis);
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 1280; const g = cv.getContext("2d")!; g.fillStyle = "#fffbe8"; g.fillRect(0, 0, 1024, 1280); g.textBaseline = "middle"; g.font = "bold 78px 'Comic Sans MS', 'Segoe Print', cursive"; g.fillStyle = "#2b2b2b"; g.fillText("O QUE JÁ SUMIU", 60, 80);
  LISTA.forEach((t, i) => { const y = 180 + i * 88; g.font = "56px 'Comic Sans MS', 'Segoe Print', cursive"; g.fillStyle = i === 11 ? "#8a8a8a" : "#26324a"; g.fillText(`${i + 1}. ${t}`, 60, y); g.strokeStyle = "#7a7a7a"; g.lineWidth = 6; const w = g.measureText(`${i + 1}. ${t}`).width; g.beginPath(); g.moveTo(54, y + 4); g.lineTo(66 + w, y - 3); g.stroke(); });
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
  const papel = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 5.5), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.9 })); papel.position.set(-1, 4, -2.88); sala.add(papel);
  const R2 = sort(19);
  for (let i = 0; i < 26; i++) { const n = new THREE.Mesh(new THREE.PlaneGeometry(0.7 + R2() * 0.5, 0.55 + R2() * 0.4), M(["#ffe066", "#a5d8ff", "#ffc9de", "#b2f2bb"][i % 4])); const x = R2() * 12.5 - 6.2, y = R2() * 6.6 + 0.8; if (Math.abs(x + 1) < 2.7) continue; n.position.set(x, y, -2.87); n.rotation.z = (R2() - 0.5) * 0.3; sala.add(n); }
  const nilo = new Boneco(APARENCIAS.alvaro); nilo.raiz.position.set(1.6, 0.05, -0.8); nilo.raiz.scale.setScalar(1.25); sala.add(nilo.raiz);
  const abaj = new THREE.PointLight("#ffe2b8", 30, 16, 1.4); abaj.position.set(3, 4.4, 2); sala.add(abaj);
  W = { renderer, cena, verms, carros, lV, feirante, nilo, cam: new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 500) };
  return W;
}
const CINZA = (c: any) => { const y = c.r * 0.3 + c.g * 0.59 + c.b * 0.11; return new THREE.Color(y * 0.9 + 0.08, y * 0.9 + 0.08, y * 0.92 + 0.09); };
function vermelho(w: Mundo, p: number, onda: boolean) {
  for (const v of w.verms) { const d = onda ? Math.hypot(v.x, v.z) / 90 : 0; const q = suave((p * 1.5 - d) / 0.5); v.m.color.copy(v.orig).lerp(CINZA(v.orig), q); }
  const q = suave(p * 1.4 - 0.05); w.lV.color.set("#ff1f2d").lerp(new THREE.Color("#585b60"), q); w.lV.emissive.set("#ff1f2d").lerp(new THREE.Color("#1a1b1d"), q); w.lV.emissiveIntensity = 1.5 * (1 - q) + 0.2;
}
function posCarros(w: Mundo, t: number, travado: number) {
  const cont: Record<number, number> = {};
  w.carros.forEach((g: any, i: number) => {
    const eixo = i % 2, pista = [-36, 0, 36][i % 3], lado = i % 4 < 2 ? 1 : -1, off = lado * 2.1, base = -120 + ((i * 11.3) % 240);
    const anda = base + t * 9 * (1 - travado) * lado; let pos = ((anda + 120 + 2400) % 240) - 120;
    if (travado > 0) { const faixa = eixo * 100 + pista * 10 + lado; cont[faixa] = (cont[faixa] ?? 0) + 1; const alvo = (cont[faixa] - 9) * 4.6; pos = pos + (alvo - pos) * travado; }
    if (eixo === 0) { g.position.set(pista + off, 0.1, pos); g.rotation.y = lado > 0 ? -Math.PI / 2 : Math.PI / 2; } else { g.position.set(pos, 0.1, pista + off); g.rotation.y = lado > 0 ? 0 : Math.PI; }
    if (travado > 0.5) g.rotation.y += Math.sin(i * 3.1) * 0.35 * travado;
  });
}
const Cena3D: React.FC<{ fn: (w: Mundo) => { pos: V; alvo: V; fov: number }; k: string }> = ({ fn, k }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { const h = delayRender("t1"); try { const w = mundo(); if (ref.current && w.renderer.domElement.parentElement !== ref.current) ref.current.appendChild(w.renderer.domElement); const t = fn(w); w.cam.fov = t.fov; w.cam.position.set(...t.pos); w.cam.lookAt(...t.alvo); w.cam.updateProjectionMatrix(); w.renderer.render(w.cena, w.cam); } finally { continueRender(h); } }, [k]);
  return <div ref={ref} style={{ position: "absolute", inset: 0, filter: "saturate(1.3) contrast(1.06)" }} />;
};
const Conta: React.FC<{ rot: string; de: number; ate: number; p: number }> = ({ rot, de, ate, p }) => (
  <div style={{ position: "absolute", top: 240, left: 0, right: 0, display: "flex", justifyContent: "center" }}><div style={{ background: "#1d2a44", color: "#fff", borderRadius: 30, padding: "16px 44px", textAlign: "center" }}><div style={{ fontSize: 34, opacity: 0.85 }}>{rot}</div><div style={{ fontSize: 96, lineHeight: 1, color: "#ffd400" }}>{Math.round(de + (ate - de) * p).toLocaleString("pt-BR")}</div></div></div>
);
export const T1: React.FC<{ linha: Linha }> = ({ linha }) => {
  const f = useCurrentFrame(), t = f / 30, c = cenaEm(linha, t); if (!c) return null;
  const s = t - c.inicio, d = c.fim - c.inicio, p = s / d, a = sai(p);
  const cam = (w: Mundo) => {
    posCarros(w, t, c.i === 3 ? suave(s / 1.2) : c.i > 3 ? 1 : c.i === 2 ? 0.25 * p : 0);
    w.feirante.posar(c.i === 4 ? { ...POSES.em_pe(t), olhos: 1.35, boca: "aberta", sobrancelha: 1, cabeca: [12, 0, 0] } : POSES.em_pe(t));
    w.nilo.posar({ ...POSES.em_pe(t), olhos: 1.2, sobrancelha: 1, cabeca: [2, c.i === 5 ? -8 : -30, 0] });
    if (c.i === 0) { vermelho(w, 0, false); return { pos: mix([12.5, 3.4, 15.5], [11, 3.6, 13.6], a), alvo: [6.6, 7.2, 6.6] as V, fov: 44 }; }
    if (c.i === 1) { vermelho(w, suave((s - 0.7) / 2.8), true); return { pos: mix([26, 30, 42], [12, 42, 26], a), alvo: [0, 2, 0] as V, fov: 58 }; }
    vermelho(w, 1, false);
    if (c.i === 2) return { pos: mix([2.2, 2.6, 14.5], [3.6, 3.6, 12.4], a), alvo: [6.6, 6.2, 6.6] as V, fov: 46 };
    if (c.i === 3) return { pos: mix([4, 12, 14], [7, 34, 13], a), alvo: [0, 0, 0] as V, fov: 58 };
    if (c.i === 4) { const pp = suave((s - 0.3) / 1.2); for (const v of w.verms) if (v.feira) v.m.color.copy(v.orig).lerp(CINZA(v.orig), pp); return { pos: mix([11.2, 4, 18.6], [11.6, 3.7, 16.2], a), alvo: [11.5, 1.4, 11] as V, fov: 50 }; }
    if (c.i === 5) return { pos: mix([202.6, 1.9, 4.4], [202.2, 1.8, 3], a), alvo: [201.5, 0.9, -0.8] as V, fov: 58 };
    if (c.i === 6) return { pos: mix([199, 3, 7.6], [199, 3, 6.2], a), alvo: [199, 4.6, -2.9] as V, fov: 56 };
    return { pos: [24 * Math.cos(t * 0.25), 34, 24 * Math.sin(t * 0.25)] as V, alvo: [0, 0, 0] as V, fov: 58 };
  };
  const b = blocoEm(c, t, 3), fx = lim(s / 0.14);
  return (
    <AbsoluteFill style={{ background: "#a9dcff", fontFamily: FONTE }}>
      <Cena3D fn={cam} k={String(f)} />
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center" }}><div style={{ background: "#fff", color: "#1d2a44", padding: "10px 34px", borderRadius: 50, fontSize: 44, boxShadow: "0 8px 0 rgba(29,42,68,.25)" }}>HOJE SUMIU · DIA 12</div></div>
      {c.i === 0 && <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 760 }}><div style={{ textAlign: "center", fontSize: 138, lineHeight: 0.98, color: "#fff", WebkitTextStroke: "6px #1d2a44", paintOrder: "stroke", transform: `scale(${volta(s / 0.35)})` }}>A COR<br /><span style={{ color: VERM }}>VERMELHA</span></div></AbsoluteFill>}
      {c.i === 3 && <Conta rot="CARROS PARADOS" de={0} ate={48312} p={sai(s / 2.2)} />}
      {c.i === 6 && <Conta rot="COISAS QUE SUMIRAM" de={1} ate={12} p={sai(s / 1.6)} />}
      {c.i === 7 && <div style={{ position: "absolute", top: 480, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 26 }}>{COMENTARIOS.map((x, i) => { const q = volta((s - 0.5 - i * 0.45) / 0.3); return <div key={x} style={{ background: "#fff", borderRadius: 34, padding: "22px 34px", fontSize: 58, color: "#1d2a44", transform: `translateX(${(1 - q) * 300}px) scale(${q})`, opacity: lim(q), boxShadow: "0 10px 0 rgba(29,42,68,.2)" }}>💬 {x}</div>; })}<div style={{ textAlign: "center", color: "#fff", fontSize: 30, WebkitTextStroke: "2px #1d2a44", paintOrder: "stroke" }}>comentários de exemplo</div></div>}
      {b && <div style={{ position: "absolute", left: 50, right: 50, top: 1310, textAlign: "center", fontSize: 92, lineHeight: 1.04, transform: `scale(${0.9 + 0.1 * sai((t - b.desde) / 0.1)})` }}>{b.palavras.map((x, i) => <span key={i} style={{ color: forte(x.w) ? "#ffd400" : "#fff", opacity: t >= x.em ? 1 : 0.55, WebkitTextStroke: "12px #1d2a44", paintOrder: "stroke", marginRight: 22, display: "inline-block" }}>{limpa(x.w)}</span>)}</div>}
      <AbsoluteFill style={{ background: "#fff", opacity: (1 - fx) * 0.5 * (c.i ? 1 : 0) }} />
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};
