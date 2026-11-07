// Biblioteca de peças do Hoje Sumiu: tudo que entra no livro a partir do arquivo de dados do dia.
// Cada peça é um objeto { peca: "nome", pos, escala, em, sai, some, ... }. Os tempos já chegam em segundos,
// resolvidos pelo preparar-dia. O catálogo com exemplos está em PECAS.md.
import * as THREE from "three";
import { Fantoche, MundoPapel, caixa, lim, novoPapel, papel, recorte, sCalombos, sCirc, sOval, sRet, sm, sorteio, texto } from "../mundo-papel";

export type Spec = Record<string, any>;
type Ctx = { w: MundoPapel; quadro: ((t: number) => void)[]; R: () => number };

// ---------------------------------------------------------------- poses de gente
const POSES: Record<string, (t: number) => Record<string, any>> = {
  normal: (t) => ({ brE: -0.14 + Math.sin(t * 3) * 0.05, brD: 0.14 - Math.sin(t * 3) * 0.05, boca: "sorriso", cab: Math.sin(t * 2) * 0.04 }),
  feliz: (t) => ({ brE: -0.4 + Math.sin(t * 5) * 0.15, brD: 0.4 + Math.sin(t * 5) * 0.15, boca: "sorriso", pulo: Math.abs(Math.sin(t * 4)) * 0.05, cab: Math.sin(t * 3) * 0.06 }),
  fala: (t) => ({ brE: -0.2 + Math.sin(t * 4) * 0.3, brD: 0.2 + Math.sin(t * 5) * 0.3, boca: Math.sin(t * 9) > 0 ? "aberta" : "sorriso", cab: Math.sin(t * 3) * 0.06 }),
  comemora: (t) => ({ brE: -2.3 + Math.sin(t * 9) * 0.3, brD: 2.3 + Math.sin(t * 9 + 1) * 0.3, boca: "aberta", pulo: Math.abs(Math.sin(t * 7)) * 0.16, cab: Math.sin(t * 5) * 0.06 }),
  susto: (t) => ({ brE: -1.1, brD: 1.1, boca: "aberta", olho: 1.3, sobr: 1, pulo: Math.abs(Math.sin(t * 8)) * 0.03 }),
  azedo: (t) => ({ brE: -0.75, brD: 0.6, boca: "azedo", olho: 0.14, sobr: -1, cab: Math.sin(t * 22) * 0.07 }),
  triste: () => ({ brE: -0.05, brD: 0.05, boca: "azedo", olho: 0.7, sobr: -0.8, olhar: [0, -0.5] }),
  bravo: (t) => ({ brE: -0.1, brD: 0.1, boca: "neutra", olho: 0.8, sobr: -0.9, cab: 0.14 + Math.sin(t) * 0.01 }),
  mostra: (t) => ({ brE: -0.4, brD: 1.45 + Math.sin(t * 11) * 0.09, boca: Math.sin(t * 13) > -0.2 ? "aberta" : "neutra", sobr: 0.8, cab: Math.sin(t * 7) * 0.05 }),
  segura: (t) => ({ brE: -0.15, brD: 0.95, boca: "sorriso", cab: Math.sin(t * 2) * 0.04 }),
  come: () => ({ brE: -0.15, brD: 2.6, boca: "aberta", sobr: 0.7 }),
  surfa: (t) => ({ brE: -1.3, brD: 1.3, boca: "aberta", pulo: Math.sin(t * 2.4) * 0.05, cab: Math.sin(t * 2) * 0.05 }),
  shrug: (t) => ({ brE: -1 - Math.sin(t * 4) * 0.2, brD: 1 + Math.sin(t * 4) * 0.2, boca: "neutra", sobr: 0.8 }),
};
const emPose = (lista: { em?: number; pose: string; olhar?: [number, number] }[], t: number) => { let a = lista[0]; for (const p of lista) if ((p.em ?? -1) <= t) a = p; return a; };

// ---------------------------------------------------------------- comum a toda peça
const V = (v: number[] | undefined, g: any, campo: "position" | "rotation") => { if (v) g[campo].set(v[0] ?? 0, v[1] ?? 0, v[2] ?? 0); };
function assenta(c: Ctx, g: any, s: Spec) {
  V(s.pos, g, "position"); V(s.rot, g, "rotation");
  if (s.escala) { if (Array.isArray(s.escala)) g.scale.set(...s.escala); else g.scale.setScalar(s.escala); }
  if (s.em !== undefined || s.sai !== undefined) c.w.pop(g, s.em ?? -1, s.modo ?? "dobra", s.dur ?? 0.45, s.sai);
  // gira: a peça roda sem parar no próprio plano (voltas por segundo), como a bolinha de carregando
  if (s.gira) { const r0 = g.rotation.z; c.quadro.push((t) => { g.rotation.z = r0 - t * s.gira * Math.PI * 2; }); }
  // balanca: { em, ate, amp }: a peça cambaleia (gente tonta, sem dormir); para sozinha depois de `ate`
  if (s.balanca) { const b = s.balanca, r0 = g.rotation.z; c.quadro.push((t) => { const k = sm((t - (b.em ?? -1)) / 0.4) * (1 - sm((t - (b.ate ?? 1e6)) / 0.4)); g.rotation.z = r0 + Math.sin(t * 3.1) * (b.amp ?? 0.12) * k; }); }
  // movimentos: [{ em, dur, pos }]: a peça anda do lugar atual até o novo
  if (s.move) { const base = g.position.clone(); c.quadro.push((t) => { let a = base.clone(); for (const m of s.move) { const b = new THREE.Vector3(...m.pos); a.lerp(b, sm((t - m.em) / (m.dur ?? 0.5))); } g.position.copy(a); }); }
  return g;
}
/** Quando a peça tem `some`, ela vira do avesso nesse tempo e o verso fica cinza. */
function comVirada(c: Ctx, g: any, s: Spec, mats: any[], cinza?: string) { if (s.some !== undefined && mats.length) c.w.vira(g, mats, s.some, s.eixo ?? "y", cinza ?? undefined); }

// ---------------------------------------------------------------- formas soltas: desenhar um objeto novo só com dados
function geometria(s: Spec, m: any) {
  const prof = s.prof ?? 0.05;
  switch (s.forma) {
    case "caixa": return caixa(s.l ?? 1, s.a ?? 1, s.p ?? 1, m);
    case "circulo": return recorte(sCirc(s.r ?? 1, s.x0 ?? 0, s.y0 ?? 0), m, prof);
    case "oval": return recorte(sOval(s.rx ?? 1, s.ry ?? 0.6, s.x0 ?? 0, s.y0 ?? 0), m, prof);
    case "retangulo": return recorte(sRet(s.l ?? 1, s.a ?? 1, s.canto ?? 0.05, s.y0 ?? 0, s.x0 ?? 0), m, prof);
    case "morro": return recorte(sCalombos(s.l ?? 4, s.a ?? 2, s.calombos ?? 5, s.semente ?? 3), m, prof);
    case "poligono": { const f = new THREE.Shape(); (s.pontos as number[][]).forEach(([x, y], i) => (i ? f.lineTo(x, y) : f.moveTo(x, y))); f.closePath(); return recorte(f, m, prof); }
    default: throw new Error("forma desconhecida: " + s.forma);
  }
}
function forma(c: Ctx, s: Spec, herda?: any[]) {
  const g = new THREE.Group(), viraSo = s.some !== undefined, unica = viraSo || herda;
  const m = unica ? novoPapel(s.cor ?? "#ffffff") : papel(s.cor ?? "#ffffff");
  const dentro = new THREE.Group(); dentro.add(geometria(s, m)); g.add(dentro);
  if (herda && !s.fixa) herda.push(m);
  comVirada(c, dentro, s, [m], s.cinza);
  return assenta(c, g, s);
}
function letreiro(c: Ctx, s: Spec) {
  const g = new THREE.Group(), l = s.l ?? 2, a = s.a ?? 1;
  if (s.fundo !== false) g.add(caixa(l, a, 0.05, papel(s.fundo ?? "#fff6e0")));
  const fonte = (t: string) => `900 ${Math.min(150, Math.floor(620 / Math.max(3, t.length)))}px Arial`;
  const frente = new THREE.Mesh(new THREE.PlaneGeometry(l * 0.92, a * 0.85), texto(s.texto, { cor: s.cor ?? "#27324a", fonte: fonte(s.texto) })); frente.position.z = 0.04; g.add(frente);
  if (s.verso) { const v = new THREE.Mesh(new THREE.PlaneGeometry(l * 0.92, a * 0.85), texto(s.verso, { cor: s.corVerso ?? "#27324a", fonte: fonte(s.verso) })); v.position.z = -0.04; v.rotation.y = Math.PI; g.add(v); c.quadro.push((t) => { g.rotation.y = (s.rot?.[1] ?? 0) + sm((t - (s.vira ?? 1e6)) / 0.35) * Math.PI; }); }
  return assenta(c, g, s);
}

// ---------------------------------------------------------------- gente
const ROUPAS = ["#ffb703", "#3a86ff", "#2ec4b6", "#b794e6", "#ff9f1c", "#45c46b", "#f28aa5", "#5cb8e4"], PELES = ["#e0a97e", "#c98e6a", "#8a5a3c", "#f0c6a0", "#a86f4a"], CABELOS = ["#2b1c14", "#17110c", "#5a2f1c", "#7a7a7a", "#c98a3a"];
function pessoa(c: Ctx, s: Spec) {
  const n = s.semente ?? Math.floor(c.R() * 100);
  const f = new Fantoche({ pele: s.pele ?? PELES[n % 5], roupa: s.roupa ?? ROUPAS[n % 8], calca: s.calca ?? "#334466", cabelo: s.cabelo ?? CABELOS[n % 5], bone: s.bone, oculos: s.oculos, bigode: s.bigode, careca: s.careca, listra: s.listra, sapato: s.sapato });
  const poses: { em?: number; pose: string; olhar?: [number, number] }[] = s.poses ?? [{ pose: s.pose ?? "normal", olhar: s.olhar }];
  for (const p of poses) if (!POSES[p.pose]) throw new Error("pose desconhecida: " + p.pose);
  let item: any = null; if (s.segura) { item = monta(c, s.segura); f.maoD.add(item); }
  let leva: any = null; if (s.leva) { leva = monta(c, s.leva); f.maoE.add(leva); }
  c.quadro.push((t) => { if (!f.raiz.visible) return; const a = emPose(poses, t), arg = POSES[a.pose](t + n); f.posar({ olhar: a.olhar ?? s.olhar ?? [0, 0], ...arg }); if (item) item.rotation.z = -(arg.brD ?? 0); if (leva) leva.rotation.z = -(arg.brE ?? 0); });
  return assenta(c, f.raiz, { escala: 1.5, ...s });
}

// ---------------------------------------------------------------- objetos prontos
function pinguim(c: Ctx, s: Spec) {
  const g = new THREE.Group();
  g.add(recorte(sOval(0.55, 0.8, 0, 0.85), papel("#20293a"), 0.05));
  const b = recorte(sOval(0.36, 0.56, 0, 0.75), papel("#ffffff"), 0.02); b.position.z = 0.05; g.add(b);
  for (const k of [-1, 1]) {
    const o = recorte(sCirc(0.09, k * 0.17, 1.28), papel("#ffffff"), 0.01); o.position.z = 0.05; g.add(o);
    const p = recorte(sCirc(0.045, k * 0.17, 1.28), papel("#111722"), 0.005); p.position.z = 0.06; g.add(p);
    const pe = recorte(sOval(0.2, 0.08, k * 0.22, 0.06), papel("#ffa62b"), 0.02); pe.position.z = 0.03; g.add(pe);
    if (s.oculos) { const ol = recorte(sCirc(0.13, k * 0.17, 1.28), papel("#111722"), 0.005); ol.position.z = 0.07; g.add(ol); }
  }
  const bico = new THREE.Shape(); bico.moveTo(-0.11, 1.17); bico.lineTo(0.11, 1.17); bico.lineTo(0, 1.02); bico.closePath();
  const bc = recorte(bico, papel("#ffa62b"), 0.01); bc.position.z = 0.06; g.add(bc);
  return assenta(c, g, s);
}
function bonecoNeve(c: Ctx, s: Spec) {
  const g = new THREE.Group(), f = new THREE.Group(); g.add(f); const neve = "#f4fbff";
  const mb = [novoPapel(neve), novoPapel(neve), novoPapel(neve), novoPapel(s.cachecol ?? "#19a7e0"), novoPapel("#ff9f1c")];
  f.add(recorte(sCirc(1.75, 0, 1.6), mb[0], 0.1));
  const c2 = recorte(sCirc(1.3, 0, 3.95), mb[1], 0.1); c2.position.z = 0.06; f.add(c2);
  const c3 = recorte(sCirc(1, 0, 5.8), mb[2], 0.1); c3.position.z = 0.12; f.add(c3);
  const ca = recorte(sRet(2.4, 0.42, 0.15, 4.62), mb[3], 0.03); ca.position.z = 0.2; f.add(ca);
  const nz = new THREE.Shape(); nz.moveTo(0, 5.95); nz.lineTo(0, 5.65); nz.lineTo(0.85, 5.72); nz.closePath(); const nr = recorte(nz, mb[4], 0.03); nr.position.z = 0.24; f.add(nr);
  for (const k of [-1, 1]) { const o = recorte(sCirc(0.13, k * 0.36, 6.15), papel("#20293a"), 0.02); o.position.z = 0.24; f.add(o); const br = recorte(sRet(1.5, 0.09, 0.03), papel("#6a4a2d"), 0.03); br.position.set(k * 1.8, 4.15, 0.02); br.rotation.z = k * 0.45; f.add(br); }
  for (let i = 0; i < 3; i++) { const b = recorte(sCirc(0.11, 0, 3.4 + i * 0.5), papel("#20293a"), 0.02); b.position.z = 0.2; f.add(b); }
  const ch = recorte(sRet(1.3, 1.05, 0.05, 6.55), papel("#27324a"), 0.04); ch.position.z = 0.16; f.add(ch); const ab = recorte(sRet(2, 0.16, 0.04, 6.5), papel("#27324a"), 0.04); ab.position.z = 0.18; f.add(ab);
  comVirada(c, f, s, mb);
  return assenta(c, g, s);
}
/** Boleto: folha com faixa, valor e código de barras. O `some` vira a folha inteira. */
function boleto(c: Ctx, s: Spec) {
  const g = new THREE.Group(), f = new THREE.Group(); g.add(f); const l = s.l ?? 5.6, a = s.a ?? 7.6, mats: any[] = [];
  const m = (cor: string) => { const x = novoPapel(cor); mats.push(x); return x; };
  const parte = (o: any, z: number) => { o.position.z = z; f.add(o); return o; };
  f.add(recorte(sRet(l, a, 0.12), m("#fffdf6"), 0.07));
  parte(recorte(sRet(l * 0.9, a * 0.17, 0.06, a * 0.78), m("#ffc400"), 0.02), 0.07);
  const linha = (t: string, y: number, h: number, cor: string) => { const p = parte(new THREE.Mesh(new THREE.PlaneGeometry(l * 0.86, a * h), texto(t, { cor, fonte: `900 ${Math.min(150, Math.floor(620 / Math.max(3, t.length)))}px Arial` })), 0.11); p.position.y = a * y; };
  linha("BOLETO", 0.865, 0.15, "#27324a"); linha(s.vence ?? "VENCE HOJE", 0.63, 0.15, "#27324a"); linha(s.valor ?? "R$ 89,90", 0.44, 0.15, "#19a7e0");
  const R = sorteio(77); let x = -l * 0.42; while (x < l * 0.4) { const b = 0.04 + R() * 0.13; const q = parte(recorte(sRet(b * (l / 5.6), a * 0.22, 0, a * 0.08, x + b / 2), m("#27324a"), 0.01), 0.08); q.castShadow = false; x += b + 0.05 + R() * 0.09; }
  comVirada(c, f, s, mats);
  return assenta(c, g, s);
}
/** Galinha de papel. A crista é cinza porque o vermelho sumiu no Dia 1. */
function galinha(c: Ctx, s: Spec) {
  const g = new THREE.Group(), corpo = s.cor ?? "#fffdf6";
  g.add(recorte(sOval(0.62, 0.48, 0, 0.72), papel(corpo), 0.05));
  const rabo = new THREE.Shape(); rabo.moveTo(-0.45, 0.8); rabo.lineTo(-0.98, 1.22); rabo.lineTo(-0.5, 0.42); rabo.closePath(); g.add(recorte(rabo, papel(corpo), 0.04));
  const cab = recorte(sCirc(0.27, 0.48, 1.26), papel(corpo), 0.04); cab.position.z = 0.03; g.add(cab);
  const crista = recorte(sCalombos(0.42, 0.2, 3, 5), papel("#a2a5ab"), 0.02); crista.position.set(0.48, 1.47, 0.03); g.add(crista);
  const olho = recorte(sCirc(0.05, 0.55, 1.3), papel("#20293a"), 0.01); olho.position.z = 0.08; g.add(olho);
  const bico = new THREE.Shape(); bico.moveTo(0.72, 1.3); bico.lineTo(0.98, 1.22); bico.lineTo(0.72, 1.14); bico.closePath(); const bc = recorte(bico, papel("#ffa62b"), 0.02); bc.position.z = 0.05; g.add(bc);
  for (const k of [-0.16, 0.16]) { const p = recorte(sRet(0.06, 0.34, 0, 0, k), papel("#ffa62b"), 0.02); g.add(p); }
  const bate = s.semente ?? 0; c.quadro.push((t) => { g.rotation.z = Math.sin(t * 9 + bate) * 0.05; });
  return assenta(c, g, s);
}
/** Derrete: achata a peça de dentro e deixa uma poça cinza no chão. */
function derrete(c: Ctx, s: Spec) {
  const g = new THREE.Group(), filho = monta(c, s.filho); g.add(filho); const em = s.derrete ?? 1e6, dur = s.duracao ?? 1.7;
  const poca = recorte(sOval(s.poca ?? 2.8, (s.poca ?? 2.8) * 0.54), novoPapel("#a2a5ab"), 0.02); poca.rotation.x = -Math.PI / 2; poca.position.set(0, 0.1, 0.2); g.add(poca);
  c.quadro.push((t) => { const d = sm((t - em) / dur); filho.scale.y = Math.max(0.02, 1 - d); filho.scale.x = 1 + d * 0.45; filho.visible = d < 1; poca.visible = d > 0.02; poca.scale.setScalar(0.2 + 0.8 * d); });
  return assenta(c, g, s);
}
/** Geladeira com porta que abre, prateleiras e gelo que vira no congelador. */
function geladeira(c: Ctx, s: Spec) {
  const g = new THREE.Group();
  const corpo = caixa(2.8, 5.4, 1.8, papel(s.cor ?? "#dfeaf1")); corpo.position.y = 2.7; g.add(corpo);
  const dentro = caixa(2.45, 5, 0.04, papel(s.corDentro ?? "#ffd98f")); dentro.position.set(0, 2.72, 0.91); g.add(dentro);
  for (const y of [1.3, 2.5, 3.7]) { const pr = caixa(2.4, 0.06, 0.1, papel("#ffffff")); pr.position.set(0, y, 0.94); g.add(pr); }
  for (let i = 0; i < 8; i++) { const mt = novoPapel(s.corGelo ?? "#a9e6fb"), b = new THREE.Group(); b.position.set(-0.84 + (i % 4) * 0.56, 4.15 + Math.floor(i / 4) * 0.52, 0.98); g.add(b); b.add(caixa(0.44, 0.42, 0.1, mt)); if (s.some !== undefined) c.w.vira(b, [mt], s.some + i * 0.06); }
  for (const [x, y, l, a, cor] of [[-0.6, 1.72, 0.5, 0.72, "#c9f2c7"], [0.5, 1.6, 0.7, 0.5, "#ffc98a"], [-0.2, 2.82, 0.8, 0.55, "#c7b3e6"]] as const) { const it = caixa(l, a, 0.12, papel(cor)); it.position.set(x, y, 0.98); g.add(it); }
  const porta = new THREE.Group(); porta.position.set(-1.4, 0, 0.92); g.add(porta);
  const pg = caixa(2.8, 5.35, 0.18, papel("#f1f7fa")); pg.position.set(1.4, 2.72, 0.05); porta.add(pg); const pu = caixa(0.14, 1.3, 0.1, papel("#8c98a6")); pu.position.set(2.45, 2.9, 0.18); porta.add(pu);
  c.quadro.push((t) => { porta.rotation.y = -sm((t - (s.abre ?? 1e6)) / 0.45) * 1.95; });
  return assenta(c, g, s);
}
/** Banca com toldo listrado e balcão. Serve para feira, sorveteria, loja. Use `filhos` para o que fica em cima. */
function banca(c: Ctx, s: Spec) {
  const g = new THREE.Group(), cor = s.cor ?? "#5cb8e4";
  const b = caixa(7.4, 1.35, 1.9, papel(s.corBalcao ?? "#8fd5e6")); b.position.y = 0.68; g.add(b);
  for (const x of [-3.5, 3.5]) { const p = caixa(0.14, 4.7, 0.14, papel("#fff6e0")); p.position.set(x, 2.35, -0.8); g.add(p); }
  const tol = new THREE.Group(); tol.position.set(0, 4.65, -0.1); g.add(tol); for (let i = 0; i < 9; i++) { const f = caixa(8.2 / 9, 0.08, 2.6, papel(i % 2 ? "#ffffff" : cor)); f.position.set(-3.65 + i * (8.2 / 9), 0, 0); f.rotation.x = 0.3; tol.add(f); }
  for (const k of s.filhos ?? []) g.add(monta(c, k));
  return assenta(c, g, { modo: "cresce", ...s });
}
/** Mesa comprida com toalha. Use `filhos` para gente (atrás, z < 0) e o que fica em cima. */
function mesa(c: Ctx, s: Spec) {
  const g = new THREE.Group();
  for (const k of (s.filhos ?? []).filter((x: Spec) => (x.pos?.[2] ?? 0) < 0)) g.add(monta(c, k));
  const l = s.l ?? 9, tp = caixa(l, 0.14, 2, papel("#fbf6e7")); tp.position.set(0, 1.42, 0.6); g.add(tp);
  const n = Math.round(l / 0.75); for (let i = 0; i < n; i++) { const t = caixa(0.75, 1.42, 0.03, papel(i % 2 ? "#ffffff" : s.cor ?? "#5cb8e4")); t.position.set(-l / 2 + 0.375 + i * 0.75, 0.71, 1.61); g.add(t); }
  for (const k of (s.filhos ?? []).filter((x: Spec) => (x.pos?.[2] ?? 0) >= 0)) g.add(monta(c, k));
  return assenta(c, g, { modo: "cresce", ...s });
}
/** Chão de um lugar: cozinha, sala, quadra. `listras` alterna duas cores. */
function piso(c: Ctx, s: Spec) {
  const g = new THREE.Group(), l = s.l ?? 13, p = s.p ?? 9, n = s.listras ?? 8, cores = s.cores ?? ["#d7e8ee", "#f6efe2"];
  for (let i = 0; i < n; i++) { const f = caixa(l / n, 0.06, p, papel(cores[i % 2])); f.position.set(-l / 2 + (i + 0.5) * (l / n), 0.03, 0); g.add(f); }
  if (s.parede) { const w = recorte(sRet(l, s.altura ?? 6.4, 0.08), papel(s.parede), 0.06); w.position.set(0, 0, -p / 2 + 0.7); g.add(w); }
  for (const k of s.filhos ?? []) g.add(monta(c, k));
  return assenta(c, g, { modo: "cresce", ...s });
}
/** Fachada com porta, para colocar gente na frente. */
function fachada(c: Ctx, s: Spec) {
  const g = new THREE.Group();
  const w = recorte(sRet(s.l ?? 10, s.a ?? 6.2, 0.1), papel(s.cor ?? "#ffe0a8"), 0.06); w.position.z = -2.2; g.add(w);
  const po = recorte(sRet(1.9, 3.6, 0.1), papel(s.corPorta ?? "#7a5236"), 0.03); po.position.z = -2.13; g.add(po);
  for (const k of s.filhos ?? []) g.add(monta(c, k));
  return assenta(c, g, { modo: "cresce", ...s });
}
/** Vapor, ar quente, fumaça, cheiro: tiras de papel que sobem sem parar. */
function vapor(c: Ctx, s: Spec) {
  const g = new THREE.Group(), n = s.qtd ?? 5, sobe = s.sobe ?? 3, em = s.ativo ?? -1, ate = s.ate ?? 1e6;
  const it: any[] = []; for (let i = 0; i < n; i++) { const a = recorte(sOval(s.rx ?? 0.09, s.ry ?? 0.38), papel(s.cor ?? (i % 2 ? "#ffb24d" : "#ffd27a")), 0.02); g.add(a); it.push(a); }
  c.quadro.push((t) => it.forEach((a, i) => { const q = ((t + i * 0.25) * 0.85) % 1; a.visible = t > em && t < ate; a.position.set((i - (n - 1) / 2) * (s.abre ?? 0.4) + Math.sin(t * 5 + i) * 0.12, q * sobe, 0); a.scale.setScalar(0.7 + q * 0.8); }));
  return assenta(c, g, s);
}
/** O mar (ou enchente, ou areia): sobe por cima da página, com ondas. Use `filhos` para o que boia nele. */
function mar(c: Ctx, s: Spec) {
  const g = new THREE.Group(); c.w.cena.add(g); g.add(caixa(50.6, 0.1, 45.4, papel(s.cor ?? "#2ab5e6")));
  const ondas: { g: any; x: number; fase: number }[] = [];
  const onda = (x: number, z: number, i: number, w0: number) => { const o = recorte(sCalombos(w0 + c.R() * 2.4, 0.3 + c.R() * 0.3, 4, 700 + i), papel(i % 3 ? s.corOnda ?? "#7bd6f2" : "#ffffff"), 0.02); o.position.set(x, 0.05, z); g.add(o); ondas.push({ g: o, x, fase: c.R() * 6 }); };
  for (let i = 0; i < 46; i++) onda(-24 + c.R() * 48, -20 + c.R() * 42, i, 2);
  for (let i = 0; i < 16; i++) onda(-6 + c.R() * 12, 13 + c.R() * 8, 100 + i, 2.6);
  const boia = new THREE.Group(); boia.position.y = 0.05; g.add(boia); for (const k of s.filhos ?? []) boia.add(monta(c, k));
  const em = s.sobe ?? 1e6, ate = s.desce ?? 1e6, nivel = s.nivel ?? 1.05;
  c.quadro.push((t) => { const n = sm((t - em) / 1.2) * (1 - sm((t - ate) / 0.5)); g.visible = n > 0.005; g.position.y = 0.12 + nivel * n; for (const o of ondas) { o.g.position.x = o.x + Math.sin(t * 0.8 + o.fase) * 0.8; o.g.position.y = 0.05 + Math.sin(t * 2.4 + o.fase) * 0.05; } boia.position.y = 0.05 + Math.sin(t * 2.4) * 0.04; });
  return g;
}
/** Muita coisa pequena pela cidade: flocos, folhas, bilhetes. Viram em onda e somem (`dura` depois da onda). */
function espalha(c: Ctx, s: Spec) {
  const g = new THREE.Group(), [x0, x1, y0, y1, z0, z1] = s.zona ?? [-24, 24, 4, 24, -16, 18], e0 = s.tam ?? 0.7;
  for (let i = 0; i < (s.qtd ?? 20); i++) {
    const x = x0 + c.R() * (x1 - x0), y = y0 + c.R() * (y1 - y0), z = z0 + c.R() * (z1 - z0), e = e0 + c.R() * e0, h = new THREE.Group(); h.position.set(x, y, z); g.add(h); const f = new THREE.Group(); h.add(f); const mt = novoPapel(s.cor ?? "#a9e6fb");
    if ((s.forma ?? "floco") === "floco") for (let k = 0; k < 3; k++) { const b = caixa(1.7 * e, 0.16 * e, 0.05, mt); b.rotation.z = (k * Math.PI) / 3; f.add(b); }
    else if (s.forma === "folha") f.add(recorte(sOval(0.6 * e, 0.3 * e), mt, 0.02));
    else f.add(recorte(sRet(0.9 * e, 0.6 * e, 0.04, -0.3 * e), mt, 0.02));
    h.traverse((o: any) => { o.castShadow = false; });
    const tv = c.w.ondaT(x, z) + (s.atraso ?? 0); c.w.vira(f, [mt], tv); c.w.pop(h, -1, "cresce", 0.2, s.dura === null ? undefined : tv + (s.dura ?? 1.3));
  }
  return assenta(c, g, { ...s, em: undefined, sai: undefined });
}
/** Uma camada de cor em cima de todos os prédios (neve, poeira, musgo), que vira na onda. */
function telhados(c: Ctx, s: Spec) {
  const g = new THREE.Group();
  for (const t of c.w.tetos) {
    if (Math.abs(t.z - 7.3) < 0.1) continue;
    const h = new THREE.Group(); h.position.y = t.h + 0.52; t.g.add(h); const f = new THREE.Group(); h.add(f); const mt = novoPapel(s.cor ?? "#f4fbff");
    f.add(caixa(t.w + 0.75, 0.34, t.d + 0.75, mt));
    const tv = c.w.ondaT(t.x, t.z); c.w.vira(f, [mt], tv); c.w.pop(h, -1, "cresce", 0.2, s.dura === null ? undefined : tv + (s.dura ?? 1.4));
  }
  return g;
}

// ---------------------------------------------------------------- peças do Dia 8 em diante
/** Cama de papel com travesseiro e coberta. `filhos` deitam ou sentam em cima (y ~ 1.3). */
function cama(c: Ctx, s: Spec) {
  const g = new THREE.Group(), l = s.l ?? 5;
  const base = caixa(l, 0.9, 2.6, papel(s.corBase ?? "#b07a4f")); base.position.y = 0.45; g.add(base);
  const cab = recorte(sRet(0.3, 2.6, 0.1), papel(s.corBase ?? "#b07a4f"), 2.6); cab.position.set(-l / 2 + 0.15, 0, -1.3); g.add(cab);
  const col = caixa(l - 0.2, 0.35, 2.5, papel("#fffdf6")); col.position.set(0, 1.08, 0); g.add(col);
  const tr = caixa(1.1, 0.4, 1.8, papel("#ffffff")); tr.position.set(-l / 2 + 0.9, 1.45, 0); g.add(tr);
  const cob = caixa(l * 0.62, 0.22, 2.62, papel(s.cor ?? "#5c7cfa")); cob.position.set(l * 0.17, 1.32, 0); g.add(cob);
  for (const k of s.filhos ?? []) g.add(monta(c, k));
  return assenta(c, g, { modo: "cresce", ...s });
}
/** Fila de dominós que cai em sequência a partir de `cai`, um a cada `passo` s. `qtd`, `vao`, `l`, `a`, `cores`. */
function dominos(c: Ctx, s: Spec) {
  const g = new THREE.Group(), n = s.qtd ?? 10, vao = s.vao ?? 1.1, l = s.l ?? 0.9, a = s.a ?? 2.2, cai = s.cai ?? 1e6, passo = s.passo ?? 0.12, cores = s.cores ?? ["#fffdf6", "#ffd23f"];
  for (let i = 0; i < n; i++) {
    const p = new THREE.Group(); p.position.set(i * vao, 0, 0); g.add(p);
    const peca = caixa(0.32, a, l, papel(cores[i % cores.length])); peca.position.y = a / 2; p.add(peca);
    for (const y of [a * 0.3, a * 0.7]) { const pt = caixa(0.34, 0.08, l * 0.5, papel("#27324a")); pt.position.y = y; p.add(pt); }
    // gente: uma pessoa de papel colada na frente de cada peça, que cai junto (gente caindo como dominó)
    if (s.gente) p.add(monta(c, { peca: "pessoa", pos: [0, 0, l / 2 + 0.25], escala: s.gente, semente: 30 + i, poses: [{ pose: "normal" }, { em: cai + i * passo * 0.8 - 0.4, pose: "susto" }] }));
    const t0 = cai + i * passo * (s.acelera ? Math.pow(0.93, i) : 1);
    c.quadro.push((t) => { p.rotation.z = -sm((t - t0) / 0.28) * 1.35; });
  }
  return assenta(c, g, { modo: "cresce", ...s });
}
/** Gráfico de barras de papel. As barras caem de `de` para `para` (alturas) em sequência a partir de `cai`. */
function grafico(c: Ctx, s: Spec) {
  const g = new THREE.Group(), de: number[] = s.de ?? [3, 4, 4.5, 5, 5.6], para: number[] = s.para ?? [2.6, 2, 1.3, 0.8, 0.3], cai = s.cai ?? 1e6;
  const fundo = recorte(sRet(de.length * 1.3 + 1, 7, 0.2), papel("#fffdf6"), 0.06); fundo.position.z = -0.4; g.add(fundo);
  de.forEach((h0, i) => {
    const b = new THREE.Group(); b.position.set(-((de.length - 1) * 1.3) / 2 + i * 1.3, 0.5, 0); g.add(b);
    const m = novoPapel(s.cor ?? "#2fd46b"); const bar = caixa(0.9, 1, 0.4, m); bar.position.y = 0.5; b.add(bar);
    c.quadro.push((t) => { const k = sm((t - cai - i * (s.passo ?? 0.25)) / (s.dur ?? 0.7)), h = h0 + (para[i] - h0) * k; b.scale.y = Math.max(0.05, h); m.color.set(k > 0.5 ? s.corDepois ?? "#ef5a5a" : s.cor ?? "#2fd46b"); });
  });
  return assenta(c, g, { modo: "cresce", ...s });
}
/** Relógio de papel. Os ponteiros giram rápido entre `corre` e `para` (o tempo passando). */
function relogio(c: Ctx, s: Spec) {
  const g = new THREE.Group(), r = s.r ?? 2;
  g.add(recorte(sCirc(r + 0.25, 0, r + 0.25), papel(s.cor ?? "#3ec1a8"), 0.12));
  const face = recorte(sCirc(r, 0, r + 0.25), papel("#fffdf6"), 0.04); face.position.z = 0.12; g.add(face);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, mk = caixa(0.12, 0.35, 0.03, papel("#27324a")); mk.position.set(Math.sin(a) * r * 0.82, r + 0.25 + Math.cos(a) * r * 0.82, 0.18); mk.rotation.z = -a; g.add(mk); }
  const mh = (len: number, w: number) => { const h = new THREE.Group(); h.position.set(0, r + 0.25, 0.2); const b = caixa(w, len, 0.04, papel("#27324a")); b.position.y = len / 2; h.add(b); g.add(h); return h; };
  const horas = mh(r * 0.5, 0.18), min = mh(r * 0.78, 0.12), a0 = s.hora ?? 3;
  const corre = s.corre ?? 1e6, para = s.para ?? 1e6, voltas = s.voltas ?? 6;
  c.quadro.push((t) => { const k = sm((t - corre) / Math.max(0.2, para - corre)), v = k * voltas; min.rotation.z = -v * Math.PI * 2; horas.rotation.z = -((a0 + v) / 12) * Math.PI * 2; });
  return assenta(c, g, s);
}
/** Lua crescente de papel que pode subir no céu (`move`). */
function lua(c: Ctx, s: Spec) {
  const g = new THREE.Group(), r = s.r ?? 2, f = new THREE.Shape(); f.absarc(0, 0, r, 0, Math.PI * 2, false); const furo = new THREE.Path(); furo.absarc(r * 0.45, r * 0.25, r * 0.85, 0, Math.PI * 2, true); f.holes.push(furo);
  g.add(recorte(f, papel(s.cor ?? "#ffe9a8"), 0.1));
  return assenta(c, g, s);
}

// ---------------------------------------------------------------- catálogo
const CATALOGO: Record<string, (c: Ctx, s: Spec) => any> = { pessoa, letreiro, pinguim, "boneco-neve": bonecoNeve, boleto, galinha, derrete, geladeira, banca, mesa, piso, fachada, vapor, mar, espalha, telhados, cama, dominos, grafico, relogio, lua };
export function monta(c: Ctx, s: Spec): any {
  if (s.peca === "grupo") {
    const g = new THREE.Group(), f = new THREE.Group(); g.add(f); const mats: any[] = [];
    for (const k of s.filhos ?? []) f.add(k.forma && !k.peca ? forma(c, k, mats) : monta(c, k));
    comVirada(c, f, s, mats, s.cinza);
    return assenta(c, g, s);
  }
  if (!s.peca && s.forma) return forma(c, s);
  const fab = CATALOGO[s.peca]; if (!fab) throw new Error("peça desconhecida: " + s.peca);
  return fab(c, s);
}
/** Monta todas as peças do dia no livro. */
export function montaCena(w: MundoPapel, pecas: Spec[]) {
  const c: Ctx = { w, quadro: [], R: sorteio(303) };
  for (const s of pecas) { const g = monta(c, s); if (!g.parent) w.cena.add(g); }
  // o sol cresce devagar quando o dia pede calor, e o resto de cada peça anima aqui
  w.extra = (t) => { for (const q of c.quadro) q(t); };
}
export { lim };
