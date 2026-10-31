// O mundo do Hoje Sumiu: um livro pop-up de papel em 3D, aberto em cima de uma mesa.
// Tudo é papel recortado (borda branca, grão de papel, sombra entre as camadas) e sobe dobrando da página.
// O que some do mundo vira do avesso, como uma folha, e o verso é cinza. Essa é a marca do perfil.
// Tudo é função do tempo (t): qualquer quadro pode ser desenhado fora de ordem.
import * as THREE from "three";

type M = Record<string, number>;
const lim = (x: number) => Math.max(0, Math.min(1, x));
const sm = (x: number) => { const t = lim(x); return t * t * (3 - 2 * t); };
const volta = (x: number) => { const t = lim(x), c = 2.1; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const sorteio = (s: number) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };

// ---------------------------------------------------------------- papel
function criaGrao() {
  const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d")!;
  const id = g.createImageData(512, 512), r = sorteio(7);
  for (let i = 0; i < id.data.length; i += 4) { const v = 234 + r() * 21; id.data[i] = v; id.data[i + 1] = v; id.data[i + 2] = v - 2; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0); g.globalAlpha = 0.09; g.strokeStyle = "#7d7361"; g.lineWidth = 1;
  for (let i = 0; i < 1100; i++) { const x = r() * 512, y = r() * 512, a = r() * 6.3, l = 6 + r() * 22; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + r() * 4, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
let GRAO: any = null;
const novoPapel = (cor: string, extra: Record<string, unknown> = {}) => { if (!GRAO) GRAO = criaGrao(); return new THREE.MeshStandardMaterial({ color: cor, roughness: 0.93, metalness: 0, map: GRAO, bumpMap: GRAO, bumpScale: 0.35, ...extra }); };
const CACHE = new Map<string, any>();
const papel = (cor: string) => { let m = CACHE.get(cor); if (!m) { m = novoPapel(cor); CACHE.set(cor, m); } return m; };
const borda = () => papel("#fffdf6");
/** Grão com o mesmo tamanho em qualquer peça (caixas não ficam com o papel esticado). */
function uvMundo(geo: any, esc = 0.45) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)); if (ax >= ay && ax >= az) uv.setXY(i, p.getZ(i) * esc, p.getY(i) * esc); else if (ay >= az) uv.setXY(i, p.getX(i) * esc, p.getZ(i) * esc); else uv.setXY(i, p.getX(i) * esc, p.getY(i) * esc); }
  return geo;
}
const caixa = (w: number, h: number, d: number, m: any) => { const b = new THREE.Mesh(uvMundo(new THREE.BoxGeometry(w, h, d)), m); b.castShadow = true; b.receiveShadow = true; return b; };
/** Peça recortada: a cor na frente e a borda branca do papel na lateral. */
const recorte = (s: any, m: any, prof = 0.04, lado: any = null) => { const g = new THREE.ExtrudeGeometry(s, { depth: prof, bevelEnabled: false, curveSegments: 16 }); g.scale(1, 1, 1); const u = g.attributes.uv; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * 0.45, u.getY(i) * 0.45); const r = new THREE.Mesh(g, [m, lado ?? borda()]); r.castShadow = true; r.receiveShadow = true; return r; };
// formas
function sRet(w: number, h: number, r = 0, y0 = 0, x0 = 0) { const s = new THREE.Shape(), x = x0 - w / 2, y = y0; r = Math.min(r, w / 2, h / 2); s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
function sCirc(r: number, cx = 0, cy = 0) { const s = new THREE.Shape(); s.absarc(cx, cy, r, 0, Math.PI * 2, false); return s; }
function sOval(rx: number, ry: number, cx = 0, cy = 0) { const s = new THREE.Shape(); s.absellipse(cx, cy, rx, ry, 0, Math.PI * 2, false, 0); return s; }
/** Morro/nuvem/moita: base reta e o topo cheio de calombos. */
function sCalombos(w: number, h: number, n: number, sem = 3) { const r = sorteio(sem), s = new THREE.Shape(); s.moveTo(-w / 2, 0); let x = -w / 2; const dx = w / n; for (let i = 0; i < n; i++) { const k = Math.sin(((i + 0.5) / n) * Math.PI); const alt = h * (0.45 + 0.75 * k) * (0.8 + r() * 0.4); s.quadraticCurveTo(x + dx / 2, alt * 1.24, x + dx, i === n - 1 ? 0 : alt * 0.84); x += dx; } s.lineTo(-w / 2, 0); return s; }
/** Copa de árvore: círculo de calombos. */
function sCopa(r0: number, n = 8, sem = 5) { const r = sorteio(sem), s = new THREE.Shape(); for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, b = ((i - 0.5) / n) * Math.PI * 2, rr = r0 * (0.9 + r() * 0.15); if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.quadraticCurveTo(Math.cos(b) * r0 * 1.32, Math.sin(b) * r0 * 1.32, Math.cos(a) * rr, Math.sin(a) * rr); } return s; }
function sOct(r: number) { const s = new THREE.Shape(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + (i / 8) * Math.PI * 2, x = Math.cos(a) * r, y = Math.sin(a) * r; if (i) s.lineTo(x, y); else s.moveTo(x, y); } s.closePath(); return s; }
function sMorango(e = 1) { const s = new THREE.Shape(); s.moveTo(0, -0.62 * e); s.bezierCurveTo(-0.72 * e, -0.05 * e, -0.58 * e, 0.5 * e, 0, 0.5 * e); s.bezierCurveTo(0.58 * e, 0.5 * e, 0.72 * e, -0.05 * e, 0, -0.62 * e); return s; }
function texto(txt: string, { cor = "#ffffff", fonte = "900 170px Arial", w = 512, h = 256 } = {}) { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d")!; g.fillStyle = cor; g.font = fonte; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 8); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false }); }

// ---------------------------------------------------------------- fantoche de papel
type Pose = { brE?: number; brD?: number; cab?: number; pulo?: number; anda?: number; olho?: number; boca?: string; olhar?: [number, number]; sobr?: number; incl?: number };
export class Fantoche {
  raiz: any; corpo: any; cabeca: any; brE: any; brD: any; pnE: any; pnD: any; olhos: any[] = []; pup: any[] = []; sob: any[] = []; bocas: Record<string, any> = {}; maoD: any; maoE: any;
  constructor(a: { pele: string; roupa: string; calca: string; cabelo: string; sapato?: string; oculos?: boolean; bigode?: boolean; careca?: boolean; bone?: string; listra?: string }) {
    const p = 0.03, P = (c: string) => papel(c);
    this.raiz = new THREE.Group(); this.corpo = new THREE.Group(); this.raiz.add(this.corpo);
    const perna = (x: number) => { const g = new THREE.Group(); g.position.set(x, 0.62, 0); const c = recorte(sRet(0.19, 0.6, 0.05, -0.6), P(a.calca), p); g.add(c); const s = recorte(sRet(0.27, 0.11, 0.05, -0.65, x > 0 ? 0.03 : -0.03), P(a.sapato ?? "#2b2b33"), p); s.position.z = 0.012; g.add(s); this.corpo.add(g); return g; };
    this.pnE = perna(-0.14); this.pnD = perna(0.14);
    const tr = recorte(sRet(0.68, 0.76, 0.17, 0.56), P(a.roupa), p); tr.position.z = 0.03; this.corpo.add(tr);
    if (a.listra) { const li = recorte(sRet(0.68, 0.14, 0, 0.92), P(a.listra), 0.01); li.position.z = 0.062; this.corpo.add(li); }
    const braco = (x: number) => { const g = new THREE.Group(); g.position.set(x, 1.24, 0.07); const c = recorte(sRet(0.17, 0.58, 0.08, -0.58), P(a.roupa), p); g.add(c); const m = recorte(sCirc(0.1, 0, -0.63), P(a.pele), p); m.position.z = 0.005; g.add(m); const n = new THREE.Group(); n.position.set(0, -0.68, 0.04); g.add(n); this.corpo.add(g); return { g, n }; };
    const bE = braco(-0.37), bD = braco(0.37); this.brE = bE.g; this.brD = bD.g; this.maoE = bE.n; this.maoD = bD.n;
    const cab = new THREE.Group(); cab.position.set(0, 1.3, 0.1); this.corpo.add(cab); this.cabeca = cab;
    const C = 0.42;
    if (!a.careca) { const tr2 = recorte(sCirc(0.47, 0, C + 0.02), P(a.cabelo), p); tr2.position.z = -0.012; cab.add(tr2); }
    const pesc = recorte(sRet(0.17, 0.14, 0, -0.04), P(a.pele), p); pesc.position.z = -0.03; cab.add(pesc);
    cab.add(recorte(sCirc(C, 0, C), P(a.pele), p));
    const orelha = (x: number) => { const o = recorte(sCirc(0.08, x, C), P(a.pele), p); o.position.z = -0.008; cab.add(o); }; orelha(-0.43); orelha(0.43);
    const topo = (raio: number, cor: string, ini = 0.18, fim = Math.PI - 0.18) => { const s = new THREE.Shape(); s.absarc(0, C, raio, ini, fim, false); s.closePath(); const m = recorte(s, P(cor), p * 0.7); m.position.z = p + 0.002; cab.add(m); };
    if (a.careca) { const t1 = recorte(sCirc(0.13, -0.42, C + 0.2), P(a.cabelo), p); t1.position.z = -0.006; cab.add(t1); const t2 = recorte(sCirc(0.13, 0.42, C + 0.2), P(a.cabelo), p); t2.position.z = -0.006; cab.add(t2); }
    else if (!a.bone) topo(0.445, a.cabelo);
    if (a.bone) { topo(0.46, a.bone, 0.3, Math.PI - 0.3); const ab = recorte(sRet(0.62, 0.07, 0.03, C + 0.2, 0.18), P(a.bone), p * 0.7); ab.position.z = p + 0.012; cab.add(ab); }
    const z = p + 0.012;
    for (const s of [-1, 1]) {
      const bo = recorte(sCirc(0.07, s * 0.27, C - 0.13), P("#ffb4a2"), 0.004); bo.position.z = p + 0.002; cab.add(bo);
      const o = recorte(sOval(0.105, 0.12, 0, 0), P("#ffffff"), 0.006, papel("#ffffff")); o.position.set(s * 0.16, C + 0.05, z); cab.add(o); this.olhos.push(o);
      const q = recorte(sCirc(0.055), P("#1b2233"), 0.004, papel("#1b2233")); q.position.set(s * 0.16, C + 0.04, z + 0.008); cab.add(q); this.pup.push(q);
      const b = recorte(sRet(0.17, 0.035, 0.015, -0.017), P(a.careca || a.bigode ? "#e9e7e2" : a.cabelo), 0.004); b.position.set(s * 0.16, C + 0.22, z); cab.add(b); this.sob.push(b);
    }
    if (a.oculos) for (const s of [-1, 1]) { const f = sCirc(0.15, 0, 0); f.holes.push(new THREE.Path().absarc(0, 0, 0.122, 0, Math.PI * 2, true)); const r = recorte(f, P("#27324a"), 0.006, papel("#27324a")); r.position.set(s * 0.16, C + 0.045, z + 0.012); cab.add(r); }
    if (a.oculos) { const pt = recorte(sRet(0.06, 0.022), P("#27324a"), 0.004); pt.position.set(0, C + 0.05, z + 0.012); cab.add(pt); }
    if (a.bigode) for (const s of [-1, 1]) { const b = recorte(sOval(0.11, 0.045, s * 0.09, 0), P("#f1efea"), 0.006); b.position.set(0, C - 0.12, z + 0.003); b.rotation.z = -s * 0.15; cab.add(b); }
    const boca = (nome: string, m: any) => { m.position.z = z; m.visible = false; cab.add(m); this.bocas[nome] = m; };
    const sor = new THREE.Shape(); sor.absarc(0, C - 0.17, 0.13, Math.PI + 0.25, Math.PI * 2 - 0.25, false); sor.closePath(); boca("sorriso", recorte(sor, P("#7a2433"), 0.004));
    boca("neutra", recorte(sRet(0.2, 0.028, 0.012, C - 0.2), P("#5a2a2a"), 0.004));
    boca("aberta", recorte(sOval(0.095, 0.115, 0, C - 0.21), P("#5e1a24"), 0.004));
    const azd = new THREE.Shape(); azd.moveTo(-0.14, C - 0.2); azd.quadraticCurveTo(-0.07, C - 0.13, 0, C - 0.2); azd.quadraticCurveTo(0.07, C - 0.27, 0.14, C - 0.2); azd.lineTo(0.14, C - 0.235); azd.quadraticCurveTo(0.07, C - 0.305, 0, C - 0.235); azd.quadraticCurveTo(-0.07, C - 0.165, -0.14, C - 0.235); azd.closePath(); boca("azedo", recorte(azd, P("#5a2a2a"), 0.004));
    this.posar({});
  }
  posar({ brE = -0.12, brD = 0.12, cab = 0, pulo = 0, anda = 0, olho = 1, boca = "sorriso", olhar = [0, 0], sobr = 0, incl = 0 }: Pose) {
    this.brE.rotation.z = brE; this.brD.rotation.z = brD; this.cabeca.rotation.z = cab; this.corpo.position.y = pulo; this.corpo.rotation.z = incl;
    this.pnE.rotation.z = Math.sin(anda) * 0.42; this.pnD.rotation.z = -Math.sin(anda) * 0.42;
    this.olhos.forEach((o) => o.scale.set(1, Math.max(0.08, olho), 1));
    this.pup.forEach((q, i) => { q.position.x = (i ? 0.16 : -0.16) + olhar[0] * 0.04; q.position.y = 0.42 + 0.04 + olhar[1] * 0.04; q.visible = olho > 0.25; });
    this.sob.forEach((b, i) => { b.rotation.z = (i ? 1 : -1) * sobr * 0.45; b.position.y = 0.42 + 0.22 + Math.abs(sobr) * 0.03; });
    for (const k in this.bocas) this.bocas[k].visible = k === boca;
  }
}

// ---------------------------------------------------------------- o mundo
const CINZA = "#a2a5ab", CINZA2 = "#8d9096";
const VERM = "#e5202b";
export class MundoPapel {
  cena: any; m: M; pops: any[] = []; viras: any[] = []; carros: any[] = []; nuvens: any[] = []; gente: any[] = []; multidao: any[] = [];
  lamp: any; sol: any; cliente: any; moranguinho: any; mordidas: any; feirante: any; juiz: any; jogador: any; outros: any[] = []; bola: any; nilo: any; caminhao: any; giroflex: any;
  constructor(m: M) {
    this.m = m; const c = new THREE.Scene(); this.cena = c;
    c.background = new THREE.Color("#f5e3c8"); c.fog = new THREE.Fog("#f5e3c8", 130, 300);
    c.add(new THREE.HemisphereLight("#ffffff", "#e8dcc0", 1.25));
    const s = new THREE.DirectionalLight("#fff0d8", 2.9); s.position.set(26, 44, 30); s.target.position.set(0, 0, -2); s.castShadow = true; s.shadow.mapSize.set(4096, 4096);
    const k = s.shadow.camera; k.left = -46; k.right = 46; k.top = 50; k.bottom = -46; k.near = 1; k.far = 150; s.shadow.bias = -0.0004; s.shadow.normalBias = 0.02; c.add(s); c.add(s.target);
    const f = new THREE.DirectionalLight("#cfe6ff", 0.5); f.position.set(-30, 18, 26); c.add(f);
    this.livro(); this.chao(); this.ceu(); this.cidade(); this.semaforo(); this.placa(); this.transito(); this.caminhaoBombeiro(); this.mercado(); this.campo(); this.povo(); this.seuNilo(); this.interrogacao();
  }
  // registro de animações
  private pop(g: any, t0: number, modo: "dobra" | "sobe" | "cresce" = "dobra", dur = 0.5, t1?: number) { this.pops.push({ g, t0, modo, dur, t1 }); }
  private vira(g: any, mats: any[], t: number, eixo: "x" | "y" | "z" = "y", cinza = CINZA) { this.viras.push({ g, mats, t, eixo, cinza, cor: mats.map((m) => "#" + m.color.getHexString()), base: g.rotation[eixo] }); }
  private ondaT(x: number, z: number) { return this.m.onda + Math.hypot(x - 3.6, z - 5.4) / 17; }
  private livro() {
    const c = this.cena;
    const mesa = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), novoPapel("#c8975e")); mesa.rotation.x = -Math.PI / 2; mesa.position.y = -1.5; mesa.receiveShadow = true; { const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 1024; const g = cv.getContext("2d")!; g.fillStyle = "#c8975e"; g.fillRect(0, 0, 1024, 1024); const r = sorteio(4); for (let i = 0; i < 12; i++) { g.fillStyle = `rgba(${90 + r() * 40},${55 + r() * 25},${25 + r() * 15},${0.1 + r() * 0.12})`; g.fillRect(i * 86, 0, 84, 1024); g.fillStyle = "rgba(70,40,20,.35)"; g.fillRect(i * 86 + 84, 0, 2, 1024); } g.globalAlpha = 0.08; g.strokeStyle = "#5a3a1c"; for (let i = 0; i < 500; i++) { const x = r() * 1024; g.beginPath(); g.moveTo(x, r() * 1024); g.lineTo(x + r() * 4 - 2, r() * 1024); g.stroke(); } const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; mesa.material = new THREE.MeshStandardMaterial({ map: t, roughness: 0.75 }); } c.add(mesa);
    const parede = new THREE.Mesh(new THREE.PlaneGeometry(700, 300), novoPapel("#f7e6cc")); parede.position.set(0, 140, -120); c.add(parede);
    // página de baixo (a cidade) e página de trás (o céu), mais a capa e o miolo
    const capa = novoPapel("#1e3a5f"), miolo = papel("#fbf6e7");
    const c1 = caixa(56, 0.5, 50.5, capa); c1.position.set(0, -1.25, 1); c.add(c1);
    for (let i = 0; i < 5; i++) { const f = caixa(54 - i * 0.12, 0.2, 48.4 - i * 0.1, i % 2 ? miolo : papel("#efe8d4")); f.position.set(0, -0.92 + i * 0.2, 0.5); c.add(f); }
    const pag = caixa(53.2, 0.14, 47.8, papel("#fbf6e7")); pag.position.set(0, -0.02, 0.2); c.add(pag);
    const c2 = caixa(56, 49, 0.5, capa); c2.position.set(0, 23, -25.4); c.add(c2);
    for (let i = 0; i < 4; i++) { const f = caixa(54 - i * 0.12, 47 - i * 0.1, 0.2, i % 2 ? miolo : papel("#efe8d4")); f.position.set(0, 23, -25 + i * 0.2); c.add(f); }
    const ceuB = caixa(53.2, 45.8, 0.14, papel("#79d0f2")); ceuB.position.set(0, 23, -24.1); c.add(ceuB);
    // fitas do livro
    const lomb = caixa(56, 2, 1.4, capa); lomb.position.set(0, -0.3, -25); c.add(lomb);
  }
  private chao() {
    const c = this.cena;
    const gr = caixa(50.6, 0.1, 45.4, papel("#8ed16a")); gr.position.set(0, 0.07, 0); c.add(gr);
    const R = sorteio(21);
    for (let i = 0; i < 16; i++) { const s = recorte(sCalombos(7 + R() * 9, 2.2 + R() * 2.2, 5, 30 + i), papel(i % 2 ? "#7cc65c" : "#a2dc78"), 0.03); s.rotation.x = -Math.PI / 2; s.position.set(R() * 44 - 22, 0.13, R() * 42 - 20); c.add(s); }
    const asf = papel("#59616f"), calc = papel("#f0e8d4"), fx = papel("#ffffff");
    const faixa = (w: number, d: number, x: number, z: number, y = 0.17, m = asf) => { const b = caixa(w, 0.07, d, m); b.position.set(x, y, z); c.add(b); return b; };
    // rua que sobe (x = 0) e rua que cruza (z = 2); a praça do Seu Nilo fecha a rua na frente
    faixa(5.2, 37.5, 0, -4.8); faixa(50.6, 5.2, 0, 2, 0.175);
    faixa(0.55, 37.5, -2.9, -4.8, 0.2, calc); faixa(0.55, 37.5, 2.9, -4.8, 0.2, calc); faixa(50.6, 0.55, 0, -0.9, 0.205, calc); faixa(50.6, 0.55, 0, 4.9, 0.205, calc);
    faixa(6.4, 0.6, 0, -0.9, 0.215, asf); faixa(6.4, 0.6, 0, 4.9, 0.215, asf); faixa(0.6, 5.2, -2.9, 2, 0.216, asf); faixa(0.6, 5.2, 2.9, 2, 0.216, asf);
    for (let z = -22; z < 14; z += 2.4) { if (Math.abs(z - 2) < 3.6) continue; faixa(0.16, 1.2, 0, z, 0.22, fx); }
    for (let x = -24; x < 25; x += 2.4) { if (Math.abs(x) < 3.6) continue; faixa(1.2, 0.16, x, 2, 0.22, fx); }
    for (const z of [-0.2, 4.2]) for (let k = -4; k <= 4; k++) if (k !== 0 || true) faixa(0.32, 0.8, k * 0.56, z, 0.222, fx);
    for (const x of [-2.6, 2.6]) for (let k = -3; k <= 3; k++) faixa(0.8, 0.32, x, 2 + k * 0.56, 0.222, fx);
    const praca = caixa(14, 0.1, 9.4, papel("#f3e6c7")); praca.position.set(0, 0.17, 18.7); c.add(praca);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) { const q = caixa(2.2, 0.03, 2.2, papel("#e6d5ad")); q.position.set(-5.5 + i * 2.2, 0.23, 15.4 + j * 2.2); c.add(q); }
  }
  private ceu() {
    const c = this.cena, z0 = -23.9, R = sorteio(9);
    // camadas do céu coladas na página de trás
    const faixas = [["#a6e3f7", 40], ["#c4edf9", 24], ["#e3f6fb", 13]] as const;
    faixas.forEach(([cor, h], i) => { const s = recorte(sCalombos(53, h, 9 + i * 3, 40 + i), papel(cor), 0.05); s.position.set(0, 0, z0 + i * 0.09); c.add(s); });
    // sol de papel com raios
    const so = new THREE.Group(); so.position.set(15, 33, z0 + 0.5); c.add(so); this.sol = so;
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, s = new THREE.Shape(); s.moveTo(-0.9, 0); s.lineTo(0.9, 0); s.lineTo(0, 3.4); s.closePath(); const r = recorte(s, papel(i % 2 ? "#ffc53d" : "#ffdf6e"), 0.04); r.rotation.z = a; r.position.set(Math.cos(a + Math.PI / 2) * 4, Math.sin(a + Math.PI / 2) * 4, 0); so.add(r); }
    const dsc = recorte(sCirc(4.5), papel("#ffd23f"), 0.06); dsc.position.z = 0.05; so.add(dsc); const d2 = recorte(sCirc(3.3), papel("#ffe27a"), 0.04); d2.position.z = 0.11; so.add(d2);
    // morros em camadas
    [["#7fb6d8", 19, 12, -22.8], ["#79c7a4", 13, 9, -21.4], ["#69bb7e", 9, 7, -20]].forEach(([cor, h, n, z], i) => { const g = new THREE.Group(); g.position.set(0, 0.1, z as number); c.add(g); const s = recorte(sCalombos(52, h as number, n as number, 70 + i), papel(cor as string), 0.06); g.add(s); this.pop(g, 0.06 + i * 0.1, "dobra", 0.6); });
    // nuvens em palitos, em várias profundidades
    for (let i = 0; i < 9; i++) {
      const g = new THREE.Group(), w = 5 + R() * 6, x = R() * 44 - 22, y = 17 + R() * 21, z = -21 + R() * 14;
      const nv = recorte(sCalombos(w, 1.6 + R() * 1, 5, 90 + i), papel("#ffffff"), 0.06); g.add(nv); const n2 = recorte(sCalombos(w * 0.7, 1 + R() * 0.7, 4, 120 + i), papel("#eef7fb"), 0.05); n2.position.set(R() - 0.5, 0, 0.08); g.add(n2);
      g.position.set(x, y, z); c.add(g); this.nuvens.push({ g, x, y, f: 0.3 + R() * 0.4, fase: R() * 6 });
    }
    // balões vermelhos
    for (const [x, y, z, e] of [[-13, 23, -12, 1.2], [8, 29, -16, 1], [-22, 30, -18, 0.9]] as const) {
      const g = new THREE.Group(); g.position.set(x, y, z); c.add(g); const f = new THREE.Group(); g.add(f); const m = novoPapel(VERM);
      const b = recorte(sOval(1.6 * e, 2 * e), m, 0.06); f.add(b); const fx = recorte(sOval(0.7 * e, 2 * e), papel("#ffffff"), 0.02); fx.position.z = 0.07; f.add(fx);
      const cs = recorte(sRet(0.9 * e, 0.6 * e, 0.1, -3.6 * e), papel("#b98a57"), 0.05); f.add(cs); const fi = recorte(sRet(0.05, 1.2 * e, 0, -3 * e, 0), papel("#6a5436"), 0.01); f.add(fi);
      this.vira(f, [m], this.ondaT(x, z)); this.nuvens.push({ g, x, y, f: 0.5, fase: x });
    }
  }
  private predio(x: number, z: number, w: number, d: number, h: number, cor: string, t0: number, op: { telhado?: "plano" | "duas"; verm?: boolean; toldo?: boolean; porta?: boolean } = {}) {
    const g = new THREE.Group(); g.position.set(x, 0.12, z); this.cena.add(g);
    const corpo = caixa(w, h, d, papel(cor)); corpo.position.y = h / 2; g.add(corpo);
    const vid = papel("#c6ecfb"), mold = papel("#fffaf0");
    const rows = Math.max(1, Math.floor((h - 0.9) / 1.55)), cols = Math.max(1, Math.floor((w - 0.5) / 1.25));
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const wx = (k - (cols - 1) / 2) * ((w - 0.3) / cols), wy = 1.25 + r * 1.55;
      if (op.porta && r === 0 && k === Math.floor(cols / 2)) continue;
      const fr = caixa(0.82, 1.02, 0.04, mold); fr.position.set(wx, wy, d / 2 + 0.02); g.add(fr); const v = caixa(0.64, 0.84, 0.05, vid); v.position.set(wx, wy, d / 2 + 0.03); g.add(v);
    }
    for (let r = 0; r < rows; r++) for (let k = 0; k < Math.max(1, Math.floor((d - 0.5) / 1.5)); k++) for (const s of [-1, 1]) { const zz = (k - (Math.floor((d - 0.5) / 1.5) - 1) / 2) * 1.4; const v = caixa(0.05, 0.9, 0.7, vid); v.position.set(s * (w / 2 + 0.02), 1.25 + r * 1.55, zz); g.add(v); }
    if (op.porta) { const p = caixa(0.9, 1.5, 0.05, papel("#7a5236")); p.position.set(0, 0.75, d / 2 + 0.03); g.add(p); }
    const tg = new THREE.Group(); tg.position.y = h; g.add(tg); const verm = op.verm ?? false, mat = verm ? novoPapel(VERM) : papel("#f4efe2");
    if ((op.telhado ?? "plano") === "duas") { const s = new THREE.Shape(); s.moveTo(-w / 2 - 0.25, 0); s.lineTo(w / 2 + 0.25, 0); s.lineTo(0, Math.min(2.2, w * 0.45)); s.closePath(); const t = recorte(s, mat, d + 0.5, mat); t.position.z = -d / 2 - 0.25; tg.add(t); }
    else { const t = caixa(w + 0.5, 0.42, d + 0.5, mat); t.position.y = 0.2; tg.add(t); }
    const salva = verm ? [mat] : [];
    if (op.toldo) { const tol = new THREE.Group(); tol.position.set(0, 2.25, d / 2 + 0.55); g.add(tol); const n = 6, wT = w * 0.86; for (let i = 0; i < n; i++) { const mm = i % 2 ? papel("#ffffff") : novoPapel(VERM); const f = caixa(wT / n, 0.07, 1.25, mm); f.position.set((i - (n - 1) / 2) * (wT / n), 0, 0); f.rotation.x = 0.42; tol.add(f); if (i % 2 === 0) salva.push(mm); } this.vira(tol, salva.slice(verm ? 1 : 0), this.ondaT(x, z) + 0.06); }
    if (verm) this.vira(tg, [mat], this.ondaT(x, z));
    this.pop(g, t0, "sobe", 0.55);
    return g;
  }
  private arvore(x: number, z: number, e: number, t0: number, i: number) {
    const g = new THREE.Group(); g.position.set(x, 0.12, z); this.cena.add(g);
    const tr = recorte(sRet(0.3 * e, 1.5 * e, 0.05), papel("#8b5e3c"), 0.05); tr.position.z = -0.025; g.add(tr);
    const cores = ["#58b368", "#6cc16b", "#47a35a", "#7bcf6a"];
    const c1 = recorte(sCopa(1.05 * e, 8, 200 + i), papel(cores[i % 4]), 0.05); c1.position.set(0, 2.1 * e, -0.03); g.add(c1);
    const c2 = recorte(sCopa(0.72 * e, 7, 300 + i), papel(cores[(i + 1) % 4]), 0.04); c2.position.set(0.12 * e, 2.25 * e, 0.04); g.add(c2);
    const c3 = recorte(sCopa(1.0 * e, 8, 400 + i), papel(cores[(i + 2) % 4]), 0.05); c3.rotation.y = Math.PI / 2; c3.position.set(0.02, 2.05 * e, 0); g.add(c3);
    this.pop(g, t0, "dobra", 0.5);
  }
  private cidade() {
    const dist = (x: number, z: number) => 0.02 + Math.hypot(x - 3.6, z - 5.4) * 0.028;
    const P = ["#ffc857", "#5cb8e4", "#f28aa5", "#9bd770", "#ffe08a", "#b794e6", "#ff9e57", "#62d0d6", "#f6a57c", "#58d0a4", "#fff0c9", "#8fa7ff"];
    const R = sorteio(13);
    let n = 0;
    for (const [z, hMin, hVar] of [[-5.6, 5, 7], [-11.6, 8, 9], [-17.6, 11, 11]] as const) for (const x of [-22.5, -16.5, -10.5, -5.6, 5.6, 10.5, 16.5, 22.5]) {
      const w = 4.2 + R() * 0.6, h = hMin + R() * hVar;
      this.predio(x, z, w, 4.4, h, P[n++ % P.length], dist(x, z), { verm: R() < 0.5, toldo: z === -5.6 && Math.abs(x) < 17, porta: z === -5.6 });
    }
    for (const x of [-22.5, -17.4, -12.3, -7.2, 7.2, 12.3, 17.4, 22.5]) this.predio(x, 7.3, 4.2, 3.4, 2.6 + R() * 1, P[n++ % P.length], dist(x, 7.3), { telhado: "duas", verm: true, porta: true });
    let i = 0;
    for (const [x, z] of [[-4.2, -2], [4.2, -2.4], [-4.2, -8], [4.2, -8.6], [-4.2, -14], [4.2, -14.6], [-4.2, -20], [4.2, -20], [-8, -2.2], [8.4, -2], [-13.2, -2.1], [13.4, -2.2], [-18.6, -2.3], [19, -2.1], [-24, -2.2], [24.2, -2.1], [23.6, 13], [24, 17.5], [20.5, 19.6], [-23.6, 21], [17.5, 13.2], [20.5, 11]] as const) this.arvore(x, z, 0.85 + R() * 0.55, dist(x, z), i++);
    // detalhes vermelhos soltos: caixas de correio e bandeirinhas
    for (const [x, z] of [[-3.8, 5.8], [8.6, 5.3], [-10, 5.4], [14, 5.4], [-18, 5.5], [4, -3.4], [-4, -6]] as const) {
      const g = new THREE.Group(); g.position.set(x, 0.12, z); this.cena.add(g); const f = new THREE.Group(); g.add(f); const m = novoPapel(VERM);
      const haste = recorte(sRet(0.1, 0.6), papel("#59616f"), 0.03); haste.position.z = -0.015; f.add(haste); const cx = caixa(0.46, 0.5, 0.34, m); cx.position.y = 0.8; f.add(cx);
      this.vira(f, [m], this.ondaT(x, z)); this.pop(g, dist(x, z), "dobra", 0.4);
    }
    // postes
    for (const [x, z] of [[3.3, -5], [-3.3, -11], [12, 5.3], [-14, 5.3]] as const) {
      const g = new THREE.Group(); g.position.set(x, 0.12, z); this.cena.add(g); g.add(recorte(sRet(0.11, 3.1), papel("#3d4656"), 0.04)); const l = recorte(sCirc(0.26, 0, 3.2), papel("#fff2ad"), 0.05); g.add(l); this.pop(g, dist(x, z), "dobra", 0.45);
    }
  }
  private semaforo() {
    const g = new THREE.Group(); g.position.set(3.6, 0.2, 5.4); this.cena.add(g);
    const poste = recorte(sRet(0.26, 4.4, 0.03), papel("#2f3644"), 0.08); poste.position.z = -0.04; g.add(poste);
    const cx = recorte(sRet(1.32, 3.4, 0.3, 4.1), papel("#1f2533"), 0.28, papel("#3a4354")); cx.position.z = -0.14; g.add(cx);
    const pala = (y: number) => { const s = new THREE.Shape(); s.absarc(0, 0, 0.5, 0, Math.PI, false); s.closePath(); const p = recorte(s, papel("#141923"), 0.3, papel("#2b3343")); p.position.set(0, y + 0.1, 0.13); p.rotation.x = -0.55; g.add(p); };
    const lampada = (y: number, cor: string, luz: number) => { const fundo = recorte(sCirc(0.47, 0, 0), papel("#0e121a"), 0.02); fundo.position.set(0, y, 0.14); g.add(fundo); const m = new THREE.MeshBasicMaterial({ color: cor, toneMapped: false }); const l = recorte(sCirc(0.39), m, 0.04, m); const pv = new THREE.Group(); pv.position.set(0, y, 0.17); pv.add(l); g.add(pv); return { m, pv }; };
    const v = lampada(6.72, "#ff1020", 1); lampada(5.77, "#ffc000", 1); lampada(4.82, "#10c85a", 1);
    this.lamp = v; this.vira(v.pv, [v.m], this.m.onda, "y", "#3a3e47");
    this.pop(g, 0, "sobe", 0.2);
  }
  private placa() {
    const g = new THREE.Group(); g.position.set(-3.7, 0.2, 7.2); this.cena.add(g);
    const po = recorte(sRet(0.18, 2.5), papel("#6d7581"), 0.06); po.position.z = -0.03; g.add(po);
    const f = new THREE.Group(); f.position.y = 3; g.add(f); const m = novoPapel(VERM);
    const o = recorte(sOct(1.15), m, 0.08); o.position.z = -0.04; f.add(o); const in2 = recorte(sOct(1.0), m, 0.012); in2.position.z = 0.05; f.add(in2);
    const t = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.9), texto("PARE")); t.position.z = 0.07; f.add(t);
    const t2 = t.clone(); t2.rotation.y = Math.PI; t2.position.z = -0.05; f.add(t2);
    this.vira(f, [m], this.m.placaVira); this.pop(g, this.m.placaSobe, "dobra", 0.5);
  }
  private carro(cor: string, verm: boolean) {
    const g = new THREE.Group(), w = 0.98, mat = verm ? novoPapel(VERM) : papel(cor);
    const s = new THREE.Shape(); s.moveTo(-1.02, 0.2); s.lineTo(1.02, 0.2); s.lineTo(1.05, 0.56); s.quadraticCurveTo(1.02, 0.68, 0.74, 0.7); s.lineTo(0.44, 0.72); s.lineTo(0.2, 1.1); s.lineTo(-0.5, 1.1); s.lineTo(-0.72, 0.72); s.lineTo(-1.0, 0.68); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false, curveSegments: 4 }); geo.translate(0, 0, -w / 2); const u = geo.attributes.uv; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * 0.45, u.getY(i) * 0.45);
    const b = new THREE.Mesh(geo, [mat, mat]); b.castShadow = true; b.receiveShadow = true; g.add(b);
    const jan = new THREE.Shape(); jan.moveTo(-0.58, 0.74); jan.lineTo(0.34, 0.74); jan.lineTo(0.15, 1.03); jan.lineTo(-0.46, 1.03); jan.closePath();
    for (const z of [w / 2 + 0.004, -w / 2 - 0.016]) { const j = recorte(jan, papel("#c6ecfb"), 0.012, papel("#ffffff")); j.position.z = z; g.add(j); }
    const pb = caixa(0.02, 0.42, w * 0.82, papel("#c6ecfb")); pb.position.set(0.335, 0.92, 0); pb.rotation.z = -0.56; g.add(pb);
    for (const x of [-0.62, 0.62]) for (const z of [w / 2 + 0.002, -w / 2 - 0.042]) { const r = recorte(sCirc(0.23, x, 0.23), papel("#23262e"), 0.04, papel("#3a3e47")); r.position.z = z; g.add(r); const c = recorte(sCirc(0.09, x, 0.23), papel("#e8e8e8"), 0.008); c.position.z = z + 0.036; g.add(c); }
    const fa = caixa(0.03, 0.14, 0.22, papel("#ffe27a")); fa.position.set(1.04, 0.5, 0.28); g.add(fa); const fb = fa.clone(); fb.position.z = -0.28; g.add(fb);
    return { g, mat };
  }
  private transito() {
    const cores = ["#ffd23f", "#3a86ff", "#ffffff", "#2ec4b6", VERM, "#ff9f1c", "#8e6cef", VERM, "#ffffff", "#45c46b"];
    const add = (eixo: "x" | "z", linha: number, dir: 1 | -1, jam: number[], ang = 0) => jam.forEach((alvo, k) => {
      const i = this.carros.length, cor = cores[i % cores.length], verm = cor === VERM, { g, mat } = this.carro(cor, verm);
      const raiz = new THREE.Group(); raiz.add(g); this.cena.add(raiz);
      if (verm) this.vira(g, [mat], this.m.onda + 0.2 + (i % 13) * 0.11, "y");
      this.carros.push({ raiz, eixo, linha, dir, alvo, anda: k % 2 === 0, s0: (i * 7.31) % 46, v: 5.5 + (i % 4), ang: (Math.sin(i * 3.1) * 0.2 + ang) });
    });
    add("z", 1.25, -1, [5.6, 8.2, 10.8, 13.2, -2, -4.6, -7.2, -9.8, -12.4, -15, -17.6, -20.2]);
    add("z", -1.25, 1, [12.4, -2, -4.6, -7.2, -9.8, -12.4, -15, -17.6, -20.2]);
    add("x", 0.75, 1, [-4.2, -6.8, -9.4, -12, -14.6, -17.2, -19.8, -22.4, 4.4, 7, 9.6, 12.2, 14.8, 17.4, 20, 22.6]);
    add("x", 3.25, -1, [-4.4, -7, -9.6, -12.2, -14.8, -17.4, -20, -22.6, 4.2, 6.8, 9.4, 12, 14.6, 17.2, 19.8, 22.4]);
    // os três que travaram o cruzamento
    add("x", 1.2, 1, [0.6], 0.72); add("x", 3.0, -1, [-0.8], -0.9); add("z", 0.2, 1, [2.2], 0.5);
  }
  private caminhaoBombeiro() {
    const g = new THREE.Group(); g.position.set(-1.25, 0.2, 6.9); g.rotation.y = -Math.PI / 2; this.cena.add(g); this.caminhao = g;
    const cinz = papel(CINZA), esc = papel("#7e8187"), bco = papel("#ffffff");
    const cab = caixa(1.5, 1.5, 1.45, cinz); cab.position.set(1.65, 1.05, 0); g.add(cab);
    const jan = caixa(0.04, 0.6, 1.1, papel("#c6ecfb")); jan.position.set(2.42, 1.35, 0); g.add(jan); for (const z of [0.74, -0.74]) { const j = caixa(0.8, 0.55, 0.03, papel("#c6ecfb")); j.position.set(1.72, 1.38, z); g.add(j); }
    const baú = caixa(3.2, 1.3, 1.45, cinz); baú.position.set(-0.75, 0.95, 0); g.add(baú);
    for (const z of [0.74, -0.74]) { const f = caixa(3.2, 0.16, 0.02, bco); f.position.set(-0.75, 0.8, z); g.add(f); const f2 = caixa(1.5, 0.16, 0.02, bco); f2.position.set(1.65, 0.62, z); g.add(f2); const tb = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 0.72), texto("BOMBEIROS", { cor: "#ffffff", fonte: "900 92px Arial", w: 640, h: 160 })); tb.position.set(-0.75, 1.27, z + (z > 0 ? 0.02 : -0.02)); if (z < 0) tb.rotation.y = Math.PI; g.add(tb); }
    for (const x of [-1.6, 0.2, 1.8]) for (const z of [0.74, -0.8]) { const r = recorte(sCirc(0.32, x, 0.32), papel("#23262e"), 0.06, papel("#3a3e47")); r.position.z = z; g.add(r); const c = recorte(sCirc(0.13, x, 0.32), papel("#e8e8e8"), 0.008); c.position.z = z + 0.06; g.add(c); }
    // escada em cima
    for (const z of [0.34, -0.34]) { const t = caixa(3.3, 0.07, 0.07, esc); t.position.set(-0.7, 1.82, z); g.add(t); } for (let i = 0; i < 10; i++) { const t = caixa(0.06, 0.05, 0.68, esc); t.position.set(-2.2 + i * 0.33, 1.82, 0); g.add(t); }
    this.giroflex = caixa(0.42, 0.3, 1.1, papel("#c9ccd2")); this.giroflex.position.set(1.65, 1.92, 0); g.add(this.giroflex);
    this.pop(g, this.m.trava - 0.5, "sobe", 0.5);
  }
  private mercado() {
    const g = new THREE.Group(); g.position.set(12, 0.13, 13); this.cena.add(g); const t0 = this.m.mercado;
    const banca = new THREE.Group(); g.add(banca); this.pop(banca, t0 + 0.05, "sobe", 0.5);
    const bal = caixa(7.4, 1.35, 1.9, papel("#c98f58")); bal.position.y = 0.68; banca.add(bal);
    for (let i = 0; i < 7; i++) { const t = caixa(1, 1.1, 0.03, papel(i % 2 ? "#b77d48" : "#d9a56f")); t.position.set(-3 + i, 0.66, 0.97); banca.add(t); }
    for (const x of [-3.5, 3.5]) { const p = caixa(0.14, 4.7, 0.14, papel("#fff6e0")); p.position.set(x, 2.35, -0.8); banca.add(p); }
    const tol = new THREE.Group(); tol.position.set(0, 4.65, -0.1); banca.add(tol); for (let i = 0; i < 9; i++) { const f = caixa(8.2 / 9, 0.08, 2.6, papel(i % 2 ? "#ffffff" : CINZA)); f.position.set(-3.65 + i * (8.2 / 9), 0, 0); f.rotation.x = 0.3; tol.add(f); const ab = recorte(sRet(8.2 / 9, 0.34, 0.14, -0.34, 0), papel(i % 2 ? "#ffffff" : CINZA), 0.03); ab.position.set(-3.65 + i * (8.2 / 9), -0.38, 1.24); tol.add(ab); }
    // caixotes de morangos: vermelhos até a voz dizer "morango"
    const mats: any[] = [];
    for (let c = 0; c < 3; c++) {
      const cg = new THREE.Group(); cg.position.set(-2.35 + c * 2.35, 1.35, 0.25); g.add(cg); this.pop(cg, t0 + 0.2 + c * 0.1, "cresce", 0.4);
      const cai = caixa(2.1, 0.5, 1.2, papel("#e9cf9b")); cai.position.y = 0.25; cg.add(cai);
      for (let i = 0; i < 12; i++) { const m = novoPapel("#ef2432"); mats.push(m); const f = new THREE.Group(); f.position.set(-0.78 + (i % 4) * 0.52, 0.72 + Math.floor(i / 4) * 0.06, 0.3 - Math.floor(i / 4) * 0.34); f.rotation.x = -0.25; const mo = recorte(sMorango(0.42), m, 0.1); mo.position.z = -0.05; f.add(mo); const fo = recorte(sCopa(0.085, 5, i), papel("#3fa34d"), 0.02); fo.position.set(0, 0.205, 0.052); f.add(fo); cg.add(f); this.vira(f, [m], this.m.moranguinhos + c * 0.16 + i * 0.03); }
    }
    this.feirante = new Fantoche({ pele: "#e0a97e", roupa: "#2a9d8f", calca: "#27364f", cabelo: "#2b1c14", bone: "#f4a261", listra: "#ffffff" }); this.feirante.raiz.position.set(-0.2, 1.0, -0.82); this.feirante.raiz.scale.setScalar(1.3); g.add(this.feirante.raiz); this.pop(this.feirante.raiz, t0 + 0.3, "dobra", 0.45);
    // a freguesa com o morango
    this.cliente = new Fantoche({ pele: "#c98e6a", roupa: "#ffb703", calca: "#335c9e", cabelo: "#5a2f1c" }); this.cliente.raiz.position.set(-1.9, 0, 3); this.cliente.raiz.scale.setScalar(1.45); g.add(this.cliente.raiz); this.pop(this.cliente.raiz, t0 + 0.45, "dobra", 0.45);
    const mg = new THREE.Group(); this.moranguinho = mg; const mm = novoPapel(CINZA); const mo = recorte(sMorango(0.46), mm, 0.06); mg.add(mo); const fo = recorte(sCopa(0.1, 5, 3), papel("#3fa34d"), 0.02); fo.position.set(0, 0.235, 0.05); mg.add(fo); this.cliente.corpo.add(mg);
    const mordidas = new THREE.Group(); for (const [x, y, r] of [[0.2, 0.2, 0.11], [0.05, 0.27, 0.1], [0.27, 0.06, 0.09]] as const) { const q = recorte(sCirc(r, x, y), papel("#f6efe2"), 0.004); q.position.z = 0.062; mordidas.add(q); } mg.add(mordidas); this.mordidas = mordidas;
    // balança e placa
    const pl = recorte(sRet(1.5, 0.95, 0.08), papel("#fff6e0"), 0.03); pl.position.set(3.2, 2.05, 0.45); pl.rotation.z = -0.05; banca.add(pl); const tx = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), texto("FEIRA", { cor: "#27324a", fonte: "900 120px Arial" })); tx.position.set(3.2, 2.52, 0.49); tx.rotation.z = -0.05; banca.add(tx);
  }
  private campo() {
    const g = new THREE.Group(); g.position.set(-14, 0.13, 14.6); this.cena.add(g); const t0 = this.m.campo;
    const gr = new THREE.Group(); g.add(gr); this.pop(gr, t0, "cresce", 0.5);
    for (let i = 0; i < 8; i++) { const f = caixa(14 / 8, 0.06, 9.2, papel(i % 2 ? "#6cc465" : "#58b357")); f.position.set(-7 + (i + 0.5) * (14 / 8), 0.03, 0); gr.add(f); }
    const li = papel("#ffffff"), L = (w: number, d: number, x: number, z: number) => { const b = caixa(w, 0.03, d, li); b.position.set(x, 0.075, z); gr.add(b); };
    L(13.4, 0.1, 0, -4.3); L(13.4, 0.1, 0, 4.3); L(0.1, 8.7, -6.7, 0); L(0.1, 8.7, 6.7, 0); L(0.1, 8.7, 0, 0); L(2, 0.1, -5.7, -1.9); L(2, 0.1, -5.7, 1.9); L(0.1, 3.9, -4.7, 0); L(2, 0.1, 5.7, -1.9); L(2, 0.1, 5.7, 1.9); L(0.1, 3.9, 4.7, 0);
    { const a = new THREE.Shape(); a.absarc(0, 0, 1.25, 0, Math.PI * 2, false); a.holes.push(new THREE.Path().absarc(0, 0, 1.15, 0, Math.PI * 2, true)); const c = recorte(a, li, 0.02, li); c.rotation.x = -Math.PI / 2; c.position.y = 0.07; gr.add(c); }
    for (const s of [-1, 1]) { const t = new THREE.Group(); t.position.set(s * 6.8, 0, 0); g.add(t); this.pop(t, t0 + 0.15, "sobe", 0.4); const gl = (w: number, h: number, d: number, x: number, y: number, z: number) => { const b = caixa(w, h, d, li); b.position.set(x, y, z); t.add(b); }; gl(0.1, 1.7, 0.1, 0, 0.85, -1.4); gl(0.1, 1.7, 0.1, 0, 0.85, 1.4); gl(0.1, 0.1, 2.9, 0, 1.7, 0); }
    // arquibancada com torcida
    const ab = new THREE.Group(); ab.position.set(0, 0, -5.1); g.add(ab); this.pop(ab, t0 + 0.2, "dobra", 0.5);
    const R = sorteio(31);
    const fileira = (y: number, z: number, cor: string) => { const b = recorte(sRet(13.4, 0.8, 0.05, y), papel(cor), 0.05); b.position.z = z; ab.add(b); for (let i = 0; i < 18; i++) { const c = ["#ffd166", "#5cb8e4", "#ffffff", "#9bd770", "#b794e6"][Math.floor(R() * 5)]; const t = recorte(sRet(0.42, 0.4, 0.15, y + 0.72, -6.3 + i * 0.74), papel(c), 0.02); t.position.z = z - 0.03; ab.add(t); const h = recorte(sCirc(0.17, -6.3 + i * 0.74, y + 1.25), papel(["#e0a97e", "#c98e6a", "#8a5a3c", "#f0c6a0"][Math.floor(R() * 4)]), 0.02); h.position.z = z - 0.03; ab.add(h); } };
    fileira(1.5, -0.2, "#dfe6ee"); fileira(0.4, 0.2, "#eef2f6");
    // juiz, jogador e os outros
    this.juiz = new Fantoche({ pele: "#d9a07a", roupa: "#20242e", calca: "#20242e", cabelo: "#2b1c14", sapato: "#111" }); this.juiz.raiz.position.set(2.5, 0.05, 2.4); this.juiz.raiz.scale.setScalar(1.5); g.add(this.juiz.raiz); this.pop(this.juiz.raiz, t0 + 0.3, "dobra", 0.45);
    const cm = novoPapel(VERM), cg = new THREE.Group(); cg.position.set(0, 0.2, 0.05); const ca = recorte(sRet(0.42, 0.6, 0.04, -0.3), cm, 0.012); cg.add(ca); this.juiz.maoD.add(cg); this.vira(cg, [cm], this.m.cartaoVira, "y", "#a9acb2");
    this.jogador = new Fantoche({ pele: "#a86f4a", roupa: "#3a86ff", calca: "#ffffff", cabelo: "#17110c", listra: "#ffffff" }); this.jogador.raiz.position.set(-0.6, 0.05, 2.9); this.jogador.raiz.scale.setScalar(1.5); g.add(this.jogador.raiz); this.pop(this.jogador.raiz, t0 + 0.35, "dobra", 0.45);
    for (const [x, z, roupa] of [[-4.2, -1.2, "#3a86ff"], [4.4, -0.8, "#ffb703"], [-1.6, -2.3, "#ffb703"], [1.8, -2.6, "#3a86ff"]] as const) { const o = new Fantoche({ pele: "#d9a07a", roupa, calca: "#ffffff", cabelo: "#2b1c14" }); o.raiz.position.set(x, 0.05, z); o.raiz.scale.setScalar(1.25); g.add(o.raiz); this.outros.push(o); this.pop(o.raiz, t0 + 0.4, "dobra", 0.4); }
    this.bola = new THREE.Group(); const bl = recorte(sCirc(0.24), papel("#ffffff"), 0.05, papel("#d9d9d9")); this.bola.add(bl); const bc = recorte(sCirc(0.08), papel("#22262e"), 0.005); bc.position.z = 0.055; this.bola.add(bc); this.bola.position.set(-2, 0.3, 3.2); g.add(this.bola); this.pop(this.bola, t0 + 0.4, "cresce", 0.3);
  }
  private povo() {
    const R = sorteio(17), roupas = ["#ffb703", "#3a86ff", "#2ec4b6", "#b794e6", "#ff9f1c", "#45c46b", "#f28aa5", "#5cb8e4"], peles = ["#e0a97e", "#c98e6a", "#8a5a3c", "#f0c6a0", "#a86f4a"], cab = ["#2b1c14", "#17110c", "#5a2f1c", "#7a7a7a", "#c98a3a"];
    // quem anda nas calçadas o tempo todo
    for (const [x, z, a] of [[-6, 5.5, 0.6], [6.4, 5.4, -0.5], [9.8, -1.3, 0.4], [-9.8, -1.3, -0.4], [3.1, -7, 0.3], [-3.1, 9, 0], [15.5, 5.5, 0.2], [-15.5, 5.5, -0.2]] as const) {
      const f = new Fantoche({ pele: peles[Math.floor(R() * 5)], roupa: roupas[Math.floor(R() * 8)], calca: "#334466", cabelo: cab[Math.floor(R() * 5)] }); f.raiz.position.set(x, 0.2, z); f.raiz.scale.setScalar(0.9); f.raiz.rotation.y = a; this.cena.add(f.raiz); this.gente.push({ f, fase: R() * 6 }); this.pop(f.raiz, 0.5 + R() * 0.5, "dobra", 0.35);
    }
    // a multidão sorridente de "ninguém reclama"
    for (let i = 0; i < 11; i++) {
      const x = -7.5 + i * 1.5, z = 17.4 + (i % 2) * 1.5, f = new Fantoche({ pele: peles[i % 5], roupa: roupas[i % 8], calca: "#334466", cabelo: cab[i % 5] });
      f.raiz.position.set(x, 0.2, z); f.raiz.scale.setScalar(1.35); this.cena.add(f.raiz); this.multidao.push({ f, fase: i * 1.1 }); this.pop(f.raiz, this.m.silencio + 0.1 + i * 0.05, "dobra", 0.4, this.m.nilo);
    }
  }
  private seuNilo() {
    const g = new THREE.Group(); g.position.set(0, 0.2, 18); this.cena.add(g); const t0 = this.m.nilo;
    // o mural das coisas que sumiram
    const mural = new THREE.Group(); mural.position.z = -2.3; g.add(mural); this.pop(mural, t0 + 0.05, "dobra", 0.55);
    const q = recorte(sRet(10.6, 6.2, 0.12, 0.9), papel("#a9794f"), 0.1); mural.add(q); const q2 = recorte(sRet(10, 5.6, 0.08, 1.2), papel("#d9b382"), 0.02); q2.position.z = 0.1; mural.add(q2);
    for (const x of [-4.6, 4.6]) { const p = recorte(sRet(0.26, 1.2), papel("#7b5536"), 0.08); p.position.set(x, 0, -0.02); mural.add(p); }
    const R = sorteio(47), cores = ["#fff27a", "#a7e3ff", "#ffc9de", "#c3f3b8", "#ffffff", "#ffd59e"];
    const pontos: [number, number][] = [];
    for (let i = 0; i < 17; i++) { const x = -4.4 + (i % 6) * 1.75 + R() * 0.3, y = 1.75 + Math.floor(i / 6) * 1.65 + R() * 0.3; if (Math.abs(x) < 1 && y > 2.6) continue; const n = new THREE.Group(); n.position.set(x, y, 0.13 + i * 0.002); n.rotation.z = (R() - 0.5) * 0.3; mural.add(n); const nt = recorte(sRet(1.28, 1.08, 0.02, -0.54), papel(cores[i % 6]), 0.012); n.add(nt); for (let k = 0; k < 3; k++) { const l = recorte(sRet(0.92 - k * 0.14, 0.05, 0.02, 0.24 - k * 0.24), papel("#6a7388"), 0.002); l.position.z = 0.014; n.add(l); } const pi = recorte(sCirc(0.08, 0, 0.43), papel("#3a86ff"), 0.012); pi.position.z = 0.016; n.add(pi); pontos.push([x, y + 0.43]); }
    for (let i = 0; i + 1 < pontos.length; i += 2) { const [a, b] = [pontos[i], pontos[i + 1]], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); const fio = recorte(sRet(l, 0.025, 0, -0.012, l / 2), papel("#27324a"), 0.002); fio.position.set(a[0], a[1], 0.17); fio.rotation.z = Math.atan2(dy, dx); mural.add(fio); }
    // a nota principal do dia
    const prin = new THREE.Group(); prin.position.set(0, 4.8, 0.2); prin.rotation.z = 0.03; mural.add(prin); prin.add(recorte(sRet(2.3, 1.3, 0.03, -0.65), papel("#ffffff"), 0.015)); const pt = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.05), texto("DIA 1", { cor: "#27324a", fonte: "900 150px Arial" })); pt.position.z = 0.02; prin.add(pt); this.pop(prin, this.m.anotou + 0.4, "cresce", 0.35);
    // mesa, abajur
    const mesa = new THREE.Group(); mesa.position.set(2.1, 0, 0.9); g.add(mesa); this.pop(mesa, t0 + 0.15, "sobe", 0.45);
    const tp = caixa(3.4, 0.18, 1.5, papel("#b98a57")); tp.position.y = 1.35; mesa.add(tp); for (const x of [-1.5, 1.5]) { const p = caixa(0.16, 1.3, 1.2, papel("#9c7144")); p.position.set(x, 0.65, 0); mesa.add(p); }
    const cad = caixa(1.15, 0.05, 0.85, papel("#fffdf6")); cad.position.set(-0.6, 1.47, 0.1); cad.rotation.y = 0.12; mesa.add(cad); const lom = caixa(0.05, 0.06, 0.85, papel("#3a86ff")); lom.position.set(-0.6, 1.48, 0.1); lom.rotation.y = 0.12; mesa.add(lom);
    const ab = new THREE.Group(); ab.position.set(1.1, 1.44, -0.1); mesa.add(ab); ab.add(recorte(sRet(0.1, 1.3), papel("#34405a"), 0.03)); const cu = new THREE.Shape(); cu.moveTo(-0.6, 1.2); cu.lineTo(0.6, 1.2); cu.lineTo(0.3, 1.95); cu.lineTo(-0.3, 1.95); cu.closePath(); ab.add(recorte(cu, papel("#ffd166"), 0.05));
    // Seu Nilo
    this.nilo = new Fantoche({ pele: "#eec39a", roupa: "#c9a772", calca: "#5b4a36", cabelo: "#efeee9", oculos: true, bigode: true, careca: true }); this.nilo.raiz.position.set(-0.9, 0, 0.5); this.nilo.raiz.scale.setScalar(1.75); g.add(this.nilo.raiz); this.pop(this.nilo.raiz, t0 + 0.2, "dobra", 0.5);
    const lp = recorte(sRet(0.07, 0.62, 0.02, -0.1), papel("#ffc233"), 0.02); lp.rotation.z = -0.5; this.nilo.maoD.add(lp);
  }
  private interrogacao() {
    const g = new THREE.Group(); g.position.set(0, 0.2, -3); this.cena.add(g); const c = document.createElement("canvas"); c.width = 512; c.height = 768; const x = c.getContext("2d")!; x.textAlign = "center"; x.textBaseline = "middle"; x.font = "900 700px Arial"; x.lineJoin = "round"; x.strokeStyle = "#ffffff"; x.lineWidth = 46; x.strokeText("?", 256, 410); x.fillStyle = "#ffd23f"; x.fillText("?", 256, 410); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; const m = new THREE.Mesh(new THREE.PlaneGeometry(18, 27), new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.5, roughness: 0.9 })); m.position.y = 13.5; m.castShadow = true; g.add(m); this.pop(g, this.m.interrogacao, "dobra", 0.6);
  }
  // ---------------------------------------------------------------- um quadro
  atualizar(t: number) {
    const m = this.m;
    for (const p of this.pops) {
      const x = (t - p.t0) / p.dur;
      if (x <= 0 || (p.t1 !== undefined && t > p.t1 + 0.25)) { p.g.visible = false; continue; }
      p.g.visible = true; let e = volta(x); if (p.t1 !== undefined && t > p.t1) e *= 1 - sm((t - p.t1) / 0.25);
      if (p.modo === "dobra") p.g.rotation.x = -(1 - e) * Math.PI / 2;
      else if (p.modo === "sobe") { p.g.scale.y = Math.max(0.002, e); const o = 1 + (1 - Math.min(e, 1)) * 0.1; p.g.scale.x = o; p.g.scale.z = o; }
      else p.g.scale.setScalar(Math.max(0.002, e));
    }
    for (const v of this.viras) {
      const x = (t - v.t) / 0.42, trocou = x >= 0.5;
      v.g.rotation[v.eixo] = v.base + (x > 0 && x < 1 ? sm(x) * Math.PI * 2 : 0);
      const s = 1 + 0.24 * Math.sin(Math.PI * lim(x)); v.g.scale.set(s, s, s);
      v.mats.forEach((mat: any, i: number) => { mat.color.set(trocou ? v.cinza : v.cor[i]); });
    }
    for (const n of this.nuvens) { n.g.position.x = n.x + Math.sin(t * n.f * 0.5 + n.fase) * 1.1; n.g.position.y = n.y + Math.sin(t * n.f + n.fase) * 0.3; }
    this.sol.rotation.z = -t * 0.06;
    // trânsito: anda até a hora de travar; aí cada carro vai para a sua vaga na fila
    const trava = sm((t - (m.trava - 1.1)) / 1.5);
    for (const c of this.carros) {
      const L = c.eixo === "z" ? [-22.5, 14] : [-25, 25], faixa = L[1] - L[0];
      const anda = L[0] + (((c.s0 + c.dir * c.v * t) % faixa) + faixa) % faixa;
      const entra = sm((t - (m.trava - 0.9 + (Math.abs(c.alvo) % 5) * 0.06)) / 0.4);
      let s = c.anda ? anda + (c.alvo - anda) * trava : c.alvo, esc = c.anda ? Math.min(1, Math.min(anda - L[0], L[1] - anda) / 1.2 + trava) : entra;
      if (c.eixo === "z") { c.raiz.position.set(c.linha, 0.2, s); c.raiz.rotation.y = c.dir > 0 ? -Math.PI / 2 : Math.PI / 2; } else { c.raiz.position.set(s, 0.2, c.linha); c.raiz.rotation.y = c.dir > 0 ? 0 : Math.PI; }
      c.raiz.rotation.y += c.ang * trava * 0.7;
      c.raiz.scale.setScalar(Math.max(0.002, esc)); c.raiz.visible = esc > 0.01;
      c.raiz.position.y = 0.2 + (trava < 1 ? Math.abs(Math.sin(t * 9 + c.s0)) * 0.025 : 0);
    }
    // gente nas calçadas
    const tristeza = t > m.silencio && t < m.nilo;
    for (const g of this.gente) { const trav = t > m.trava; g.f.posar({ brE: trav ? -0.35 + Math.sin(t * 4 + g.fase) * 0.12 : -0.14 + Math.sin(t * 5 + g.fase) * 0.2, brD: 0.14 - Math.sin(t * 5 + g.fase) * 0.2, anda: t * 6 + g.fase, pulo: Math.abs(Math.sin(t * 6 + g.fase)) * 0.04, cab: Math.sin(t * 1.3 + g.fase) * 0.06, boca: "sorriso", olho: Math.sin(t * 2 + g.fase) > 0.985 ? 0.1 : 1 }); }
    // multidão feliz: ninguém reclama
    for (const g of this.multidao) g.f.posar({ brE: -0.3 - (Math.sin(t * 5 + g.fase) + 1) * 0.5, brD: 0.3 + (Math.sin(t * 5 + g.fase * 1.4) + 1) * 0.5, pulo: Math.abs(Math.sin(t * 4.6 + g.fase)) * 0.09, cab: Math.sin(t * 2.3 + g.fase) * 0.08, boca: "sorriso" });
    // mercado
    const v = sm((t - m.moranguinhos) / 0.3), susto = t > m.moranguinhos;
    this.feirante.posar({ boca: susto ? "aberta" : "sorriso", olho: susto ? 1.3 : 1, sobr: susto ? 1 : 0, brE: susto ? -1.1 : -0.15, brD: susto ? 1.1 : 0.15, pulo: susto ? Math.abs(Math.sin((t - m.moranguinhos) * 8)) * 0.05 * Math.max(0, 1 - (t - m.moranguinhos) / 1.2) : 0, cab: Math.sin(t * 2) * 0.05 });
    const leva = sm((t - (m.mordida - 0.85)) / 0.5), nhac = t > m.mordida, azedo = t > m.azedo;
    const baixa = azedo ? sm((t - m.azedo) / 0.3) : 0, angulo = 0.45 + (2.75 - 0.45) * leva - baixa * 1.6;
    this.cliente.posar({ brD: angulo, brE: azedo ? -0.75 : -0.15 + Math.sin(t * 3) * 0.05, boca: azedo ? "azedo" : nhac ? "aberta" : leva > 0.2 ? "aberta" : "neutra", olho: azedo ? 0.14 : 1 + 0.2 * v, sobr: azedo ? -1 : 0.7, cab: azedo ? Math.sin(t * 22) * 0.07 : -0.05 * leva, olhar: [0.6, leva * 0.6 - 0.4], pulo: azedo ? Math.abs(Math.sin((t - m.azedo) * 10)) * 0.05 * Math.max(0, 1 - (t - m.azedo) / 0.9) : 0 });
    { const hx = 0.37 + 0.68 * Math.sin(angulo), hy = 1.24 - 0.68 * Math.cos(angulo), boca = sm((t - (m.mordida - 0.32)) / 0.28) * (azedo ? 1 - sm((t - m.azedo) / 0.22) : 1); this.moranguinho.position.set(hx + (0.1 - hx) * boca, hy + (1.5 - hy) * boca, 0.2); this.moranguinho.scale.setScalar(1 - 0.1 * boca); this.mordidas.visible = nhac; }
    // futebol
    const levanta = sm((t - (m.apito - 0.1)) / 0.35), passou = t > m.ombros, kick = sm((t - m.ombros - 0.35) / 0.8);
    this.juiz.posar({ brD: 0.2 + levanta * 2.7, brE: -0.15 - levanta * 0.3, boca: levanta > 0.3 && !passou ? "aberta" : passou ? "aberta" : "neutra", sobr: -0.8 * levanta, olhar: [-0.8, 0.1], cab: 0.05 * Math.sin(t * 3), pulo: levanta < 1 ? 0 : 0 });
    const sacode = passou ? Math.max(0, 1 - Math.abs(t - m.ombros - 0.3) * 1.8) : 0;
    this.jogador.posar({ brE: -0.15 - sacode * 1.3, brD: 0.15 + sacode * 1.3, boca: passou ? "sorriso" : "neutra", olhar: [0.9, 0.4], sobr: sacode * 0.9, cab: sacode * 0.15, anda: kick > 0 ? t * 9 : 0, pulo: kick > 0 ? Math.abs(Math.sin(t * 9)) * 0.06 : 0 });
    this.jogador.raiz.position.x = -0.6 - kick * 4.2;
    this.bola.position.x = -2 - kick * 5; this.bola.rotation.z = kick * 16; this.bola.position.y = 0.3 + Math.abs(Math.sin(kick * 9)) * 0.28 * (1 - kick);
    this.outros.forEach((o, i) => o.posar({ anda: t * 7 + i, pulo: Math.abs(Math.sin(t * 7 + i)) * 0.05, brE: -0.2 + Math.sin(t * 7 + i) * 0.25, brD: 0.2 - Math.sin(t * 7 + i) * 0.25, olhar: [i % 2 ? -0.6 : 0.6, 0], boca: "sorriso" }));
    // Seu Nilo: preocupado, escreve quando a voz diz "anotou"
    const esc = t > m.anotou && t < m.anotou + 2.4;
    this.nilo.posar({ brD: esc ? 0.95 + Math.sin(t * 13) * 0.14 : 0.3, brE: -0.15 + (t > m.nilo + 0.7 && !esc ? -0.8 * (0.5 + 0.5 * Math.sin(t * 2.2)) : 0), boca: esc ? "neutra" : "neutra", olho: Math.sin(t * 1.3) > 0.992 ? 0.1 : 1.08, sobr: 0.85, olhar: esc ? [0.7, -0.8] : [0, 0.1], cab: esc ? -0.06 : Math.sin(t * 1.1) * 0.03 });
    if (this.giroflex) this.giroflex.rotation.y = 0;
  }
}
