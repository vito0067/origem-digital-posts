// Dia 2: o frio. O livro abre no inverno; tudo que é gelo vira do avesso, e o vermelho do Dia 1 continua sumido.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Fantoche, MundoPapel, CINZA as CINZA_PAPEL, caixa, novoPapel, papel, recorte, sCalombos, sCirc, sOval, sRet, sm, sorteio, texto } from "./mundo-papel";
import { AMAR, AZUL, CAVEAT, CENARIOS, CINZA, Cena3D, Comentario, Contador, Etiqueta, LILITA, Legenda, LinhaDia, NAVY, Tomada, V, adesivo, camBase, lim, sai, volta } from "./Dia";

const GELO = "#19a7e0";

// ---------------------------------------------------------------- cenário
function pinguim() {
  const g = new THREE.Group();
  g.add(recorte(sOval(0.55, 0.8, 0, 0.85), papel("#20293a"), 0.05));
  const b = recorte(sOval(0.36, 0.56, 0, 0.75), papel("#ffffff"), 0.02); b.position.z = 0.05; g.add(b);
  for (const s of [-1, 1]) {
    const o = recorte(sCirc(0.09, s * 0.17, 1.28), papel("#ffffff"), 0.01); o.position.z = 0.05; g.add(o);
    const p = recorte(sCirc(0.045, s * 0.17, 1.28), papel("#111722"), 0.005); p.position.z = 0.06; g.add(p);
    const pe = recorte(sOval(0.2, 0.08, s * 0.22, 0.06), papel("#ffa62b"), 0.02); pe.position.z = 0.03; g.add(pe);
  }
  const bico = new THREE.Shape(); bico.moveTo(-0.11, 1.17); bico.lineTo(0.11, 1.17); bico.lineTo(0, 1.02); bico.closePath();
  const bc = recorte(bico, papel("#ffa62b"), 0.01); bc.position.z = 0.06; g.add(bc);
  return g;
}

function montaDia2(w: MundoPapel) {
  const m = w.m, c = w.cena, R = sorteio(202);
  const nevePura = "#f4fbff", gelo = "#a9e6fb";

  // --- o boneco de neve: a coisa do dia, em destaque no primeiro quadro
  const boneco = new THREE.Group(); boneco.position.set(0, 0.2, 16); c.add(boneco);
  const fb = new THREE.Group(); boneco.add(fb);
  const mb = [novoPapel(nevePura), novoPapel(nevePura), novoPapel(nevePura), novoPapel(GELO), novoPapel("#ff9f1c")];
  const c1 = recorte(sCirc(1.75, 0, 1.6), mb[0], 0.1); fb.add(c1);
  const c2 = recorte(sCirc(1.3, 0, 3.95), mb[1], 0.1); c2.position.z = 0.06; fb.add(c2);
  const c3 = recorte(sCirc(1, 0, 5.8), mb[2], 0.1); c3.position.z = 0.12; fb.add(c3);
  const cach = recorte(sRet(2.4, 0.42, 0.15, 4.62), mb[3], 0.03); cach.position.z = 0.2; fb.add(cach);
  const nariz = new THREE.Shape(); nariz.moveTo(0, 5.95); nariz.lineTo(0, 5.65); nariz.lineTo(0.85, 5.72); nariz.closePath();
  const nr = recorte(nariz, mb[4], 0.03); nr.position.z = 0.24; fb.add(nr);
  for (const s of [-1, 1]) { const o = recorte(sCirc(0.13, s * 0.36, 6.15), papel("#20293a"), 0.02); o.position.z = 0.24; fb.add(o); const br = recorte(sRet(1.5, 0.09, 0.03), papel("#6a4a2d"), 0.03); br.position.set(s * 1.8, 4.15, 0.02); br.rotation.z = s * 0.45; fb.add(br); }
  for (let i = 0; i < 3; i++) { const b = recorte(sCirc(0.11, 0, 3.4 + i * 0.5), papel("#20293a"), 0.02); b.position.z = 0.2; fb.add(b); }
  const ch = recorte(sRet(1.3, 1.05, 0.05, 6.55), papel("#27324a"), 0.04); ch.position.z = 0.16; fb.add(ch); const ab = recorte(sRet(2, 0.16, 0.04, 6.5), papel("#27324a"), 0.04); ab.position.z = 0.18; fb.add(ab);
  w.vira(fb, mb, m.onda);
  const poca = recorte(sOval(2.8, 1.5), novoPapel(CINZA_PAPEL), 0.02); poca.rotation.x = -Math.PI / 2; poca.position.set(0, 0.3, 16.2); c.add(poca);

  // --- flocos e neve no chão e nos telhados: tudo vira e some na onda
  const floco = (x: number, y: number, z: number, e: number) => {
    const g = new THREE.Group(); g.position.set(x, y, z); c.add(g); const f = new THREE.Group(); g.add(f); const mt = novoPapel(gelo);
    for (let k = 0; k < 3; k++) { const b = caixa(1.7 * e, 0.16 * e, 0.05, mt); b.rotation.z = (k * Math.PI) / 3; f.add(b); for (const s of [-1, 1]) { const r = caixa(0.42 * e, 0.11 * e, 0.05, mt); r.position.set(Math.cos((k * Math.PI) / 3) * s * 0.55 * e, Math.sin((k * Math.PI) / 3) * s * 0.55 * e, 0); r.rotation.z = (k * Math.PI) / 3 + 1; f.add(r); } }
    g.traverse((o: any) => { o.castShadow = false; });
    const tv = w.ondaT(x, z); w.vira(f, [mt], tv); w.pop(g, -1, "cresce", 0.2, tv + 1.3);
  };
  for (let i = 0; i < 14; i++) floco(-7 + R() * 14, 1 + R() * 8.5, 11 + R() * 10, 0.42 + R() * 0.3);
  for (let i = 0; i < 26; i++) floco(-24 + R() * 48, 4 + R() * 20, -16 + R() * 34, 0.7 + R() * 0.8);
  for (let i = 0; i < 18; i++) {
    const x = -23 + R() * 46, z = -19 + R() * 41, g = new THREE.Group(); g.position.set(x, 0.24, z); c.add(g); const f = new THREE.Group(); g.add(f); const mt = novoPapel(nevePura);
    const s = recorte(sCalombos(5 + R() * 6, 1.6 + R() * 1.5, 5, 500 + i), mt, 0.02); s.rotation.x = -Math.PI / 2; f.add(s);
    const tv = w.ondaT(x, z); w.vira(f, [mt], tv, "x"); w.pop(g, -1, "cresce", 0.2, tv + 1.4);
  }
  for (const t of w.tetos) {
    if (Math.abs(t.z - 7.3) < 0.1) continue; // casinhas de duas águas: a neve ficaria flutuando
    const g = new THREE.Group(); g.position.y = t.h + 0.52; t.g.add(g); const f = new THREE.Group(); g.add(f); const mt = novoPapel(nevePura);
    f.add(caixa(t.w + 0.75, 0.34, t.d + 0.75, mt));
    const tv = w.ondaT(t.x, t.z); w.vira(f, [mt], tv); w.pop(g, -1, "cresce", 0.2, tv + 1.4);
  }

  // --- você comemora ao lado do boneco derretendo
  const voce = new Fantoche({ pele: "#d9a07a", roupa: "#ffd166", calca: "#335c9e", cabelo: "#2b1c14" }); voce.raiz.position.set(2.8, 0.2, 18.2); voce.raiz.scale.setScalar(1.6); c.add(voce.raiz); w.pop(voce.raiz, m.otimo - 0.75, "dobra", 0.4, m.geladeira + 0.3);

  // --- a cozinha
  const coz = new THREE.Group(); coz.position.set(-14, 0.13, 14.6); c.add(coz); w.pop(coz, m.geladeira, "cresce", 0.45, m.sorveteria + 0.35);
  for (let i = 0; i < 8; i++) { const fx = caixa(13 / 8, 0.06, 9, papel(i % 2 ? "#f6efe2" : "#d7e8ee")); fx.position.set(-6.5 + (i + 0.5) * (13 / 8), 0.03, 0); coz.add(fx); }
  const par = recorte(sRet(13, 6.4, 0.08), papel("#ffe9b8"), 0.06); par.position.set(0, 0, -3.8); coz.add(par);
  const armario = caixa(4.6, 1.7, 0.7, papel("#8ccfc0")); armario.position.set(3.6, 4.2, -3.4); coz.add(armario);
  const bancada = caixa(4.6, 1.8, 1, papel("#8ccfc0")); bancada.position.set(3.6, 0.9, -3.2); coz.add(bancada);
  const gel = new THREE.Group(); gel.position.set(-1.8, 0, -1.8); coz.add(gel);
  const corpoG = caixa(2.8, 5.4, 1.8, papel("#dfeaf1")); corpoG.position.y = 2.7; gel.add(corpoG);
  const dentro = caixa(2.45, 5, 0.04, papel("#ffd98f")); dentro.position.set(0, 2.72, 0.91); gel.add(dentro);
  for (const y of [1.3, 2.5, 3.7]) { const pr = caixa(2.4, 0.06, 0.1, papel("#ffffff")); pr.position.set(0, y, 0.94); gel.add(pr); }
  for (let i = 0; i < 8; i++) { const mt = novoPapel(gelo), g = new THREE.Group(); g.position.set(-0.84 + (i % 4) * 0.56, 4.15 + Math.floor(i / 4) * 0.52, 0.98); gel.add(g); g.add(caixa(0.44, 0.42, 0.1, mt)); w.vira(g, [mt], m.porta + 0.12 + i * 0.06); }
  const mt1 = caixa(0.5, 0.72, 0.12, papel("#c9f2c7")); mt1.position.set(-0.6, 1.72, 0.98); gel.add(mt1); const mt2 = caixa(0.7, 0.5, 0.12, papel("#ffc98a")); mt2.position.set(0.5, 1.6, 0.98); gel.add(mt2); const mt3 = caixa(0.8, 0.55, 0.12, papel("#c7b3e6")); mt3.position.set(-0.2, 2.82, 0.98); gel.add(mt3);
  const portaG = new THREE.Group(); portaG.position.set(-1.4, 0, 0.92); gel.add(portaG);
  const pg = caixa(2.8, 5.35, 0.18, papel("#f1f7fa")); pg.position.set(1.4, 2.72, 0.05); portaG.add(pg); const puxa = caixa(0.14, 1.3, 0.1, papel("#8c98a6")); puxa.position.set(2.45, 2.9, 0.18); portaG.add(puxa);
  const ar: any[] = []; for (let i = 0; i < 6; i++) { const a = recorte(sOval(0.09, 0.38), papel(i % 2 ? "#ffb24d" : "#ffd27a"), 0.02); a.position.set(-1 + i * 0.4, 2, 1.4); gel.add(a); ar.push(a); }
  const pessoa = new Fantoche({ pele: "#c98e6a", roupa: "#7bcf6a", calca: "#334466", cabelo: "#17110c" }); pessoa.raiz.position.set(1.6, 0, 1.2); pessoa.raiz.scale.setScalar(1.75); coz.add(pessoa.raiz);
  const leite = new THREE.Group(); const lc = caixa(0.42, 0.72, 0.1, papel("#ffffff")); leite.add(lc); const lt = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.21), texto("LEITE", { cor: "#2765c9", fonte: "900 110px Arial" })); lt.position.z = 0.06; leite.add(lt); pessoa.corpo.add(leite);

  // --- a sorveteria
  const sv = new THREE.Group(); sv.position.set(12, 0.13, 13); c.add(sv); w.pop(sv, m.sorveteria, "cresce", 0.45, m.churrasco + 0.35);
  const balc = caixa(7.4, 1.35, 1.9, papel("#8fd5e6")); balc.position.y = 0.68; sv.add(balc);
  for (const x of [-3.5, 3.5]) { const p = caixa(0.14, 4.7, 0.14, papel("#fff6e0")); p.position.set(x, 2.35, -0.8); sv.add(p); }
  const tol = new THREE.Group(); tol.position.set(0, 4.65, -0.1); sv.add(tol); for (let i = 0; i < 9; i++) { const f = caixa(8.2 / 9, 0.08, 2.6, papel(i % 2 ? "#ffffff" : "#5cb8e4")); f.position.set(-3.65 + i * (8.2 / 9), 0, 0); f.rotation.x = 0.3; tol.add(f); }
  const quadro = new THREE.Group(); quadro.position.set(1.65, 2.75, 0.5); sv.add(quadro);
  const ql = caixa(2.5, 1, 0.05, papel("#fff6e0")); quadro.add(ql);
  const tA = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.85), texto("ABERTO", { cor: "#1f8f4c", fonte: "900 110px Arial" })); tA.position.z = 0.04; quadro.add(tA);
  const tF = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.85), texto("FECHADO", { cor: "#27324a", fonte: "900 100px Arial" })); tF.position.z = -0.04; tF.rotation.y = Math.PI; quadro.add(tF);
  ["#ffc4d8", "#b8f0d0", "#ffe58a", "#f6e5c8"].forEach((cor, i) => { const mt = novoPapel(cor), g = new THREE.Group(); g.position.set(-2.4 + i * 1.3, 1.36, 0.4); sv.add(g); const pote = caixa(1, 0.3, 0.8, papel("#ffffff")); pote.position.y = 0.15; g.add(pote); const f = new THREE.Group(); f.position.y = 0.32; g.add(f); const bo = recorte(sOval(0.46, 0.32), mt, 0.2); bo.position.z = -0.1; f.add(bo); w.vira(f, [mt], m.derrete + i * 0.08); });
  const sorveteiro = new Fantoche({ pele: "#e0a97e", roupa: "#ffffff", calca: "#27364f", cabelo: "#2b1c14", bone: "#5cb8e4" }); sorveteiro.raiz.position.set(-0.2, 1.0, -0.82); sorveteiro.raiz.scale.setScalar(1.3); sv.add(sorveteiro.raiz);
  const cliente = new Fantoche({ pele: "#f0c6a0", roupa: "#b794e6", calca: "#335c9e", cabelo: "#5a2f1c" }); cliente.raiz.position.set(-1.7, 0, 3); cliente.raiz.scale.setScalar(1.55); sv.add(cliente.raiz);
  const casq = new THREE.Group(); cliente.corpo.add(casq); const cn = new THREE.Shape(); cn.moveTo(-0.17, 0); cn.lineTo(0.17, 0); cn.lineTo(0, -0.52); cn.closePath(); casq.add(recorte(cn, papel("#d9a056"), 0.02));
  const bolas = ["#ffc4d8", "#b8f0d0", "#ffe58a"].map((cor, i) => { const mt = novoPapel(cor), g = new THREE.Group(); const f = new THREE.Group(); g.add(f); f.add(recorte(sCirc(0.21), mt, 0.05)); cliente.corpo.add(g); w.vira(f, [mt], m.derrete + i * 0.1); return g; });
  const manchas = [0, 1, 2].map((i) => { const ma = recorte(sOval(0.35, 0.16), novoPapel(CINZA_PAPEL), 0.01); ma.rotation.x = -Math.PI / 2; ma.position.set(0.5 + i * 0.1, 0.03, 0.42 - i * 0.07); cliente.corpo.add(ma); return ma; });

  // --- o churrasco de domingo
  const ch2 = new THREE.Group(); ch2.position.set(0, 0.2, 18); c.add(ch2); w.pop(ch2, m.churrasco, "cresce", 0.45, m.polo + 0.2);
  const familia = [["#ffb703", "#2b1c14", "#e0a97e"], ["#3a86ff", "#7a7a7a", "#c98e6a"], ["#45c46b", "#c98a3a", "#f0c6a0"], ["#f28aa5", "#17110c", "#8a5a3c"], ["#b794e6", "#5a2f1c", "#a86f4a"]].map(([roupa, cabelo, pele], i) => { const f = new Fantoche({ pele, roupa, calca: "#334466", cabelo }); f.raiz.position.set(-3.2 + i * 1.6, 0, -0.7); f.raiz.scale.setScalar(1.45); ch2.add(f.raiz); return f; });
  const mesa = caixa(9, 0.14, 2, papel("#fbf6e7")); mesa.position.set(0, 1.42, 0.6); ch2.add(mesa);
  for (let i = 0; i < 12; i++) { const t = caixa(0.75, 1.42, 0.03, papel(i % 2 ? "#ffffff" : "#5cb8e4")); t.position.set(-4.125 + i * 0.75, 0.71, 1.61); ch2.add(t); }
  const garrafa = new THREE.Group(); garrafa.position.set(0.8, 1.49, 0.85); ch2.add(garrafa); garrafa.add(recorte(sRet(0.42, 1.1, 0.09), papel("#6a3d22"), 0.1)); const pesc = recorte(sRet(0.16, 0.4, 0.03, 1.08), papel("#6a3d22"), 0.1); garrafa.add(pesc); const rot = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.21), texto("REFRI", { cor: "#ffffff", fonte: "900 120px Arial" })); rot.position.set(0, 0.55, 0.12); garrafa.add(rot);
  for (const x of [-2.2, -1, 1.1, 2.3]) { const cp = recorte(sRet(0.3, 0.42, 0.03), papel("#c6ecfb"), 0.08); cp.position.set(x, 1.49, 0.75); ch2.add(cp); const li = recorte(sRet(0.26, 0.26, 0.02), papel("#8a5230"), 0.01); li.position.set(x, 1.5, 0.84); ch2.add(li); }
  const vapor: any[] = []; for (let i = 0; i < 4; i++) { const a = recorte(sOval(0.07, 0.2), papel("#ffffff"), 0.01); a.position.set(0.6 + i * 0.13, 2.9, 0.9); ch2.add(a); vapor.push(a); }
  const grelha = new THREE.Group(); grelha.position.set(6, 0, 0.2); ch2.add(grelha); const gr = caixa(2.2, 1.5, 1.2, papel("#3d4656")); gr.position.y = 0.75; grelha.add(gr); for (let i = 0; i < 4; i++) { const sp = caixa(0.45, 0.14, 0.14, papel("#8a4b2a")); sp.position.set(-0.75 + i * 0.5, 1.58, 0.1); grelha.add(sp); }

  // --- o polo, no alto do céu
  const pol = new THREE.Group(); pol.position.set(0, 24, -14); c.add(pol); w.pop(pol, m.polo, "dobra", 0.5, m.mar + 0.1);
  const agua = recorte(sCalombos(17, 1.1, 10, 601), papel("#2ab5e6"), 0.06); agua.position.set(0, -0.6, 0.12); pol.add(agua);
  const iceWrap = new THREE.Group(); pol.add(iceWrap); const iceMats = [novoPapel("#55c4ee"), novoPapel("#f2fdff")];
  const iceS = new THREE.Shape(); iceS.moveTo(-5.5, 0); iceS.lineTo(-3.6, 3.2); iceS.lineTo(-1.8, 2.6); iceS.lineTo(0, 5.8); iceS.lineTo(2, 3.6); iceS.lineTo(3.6, 4.2); iceS.lineTo(5.5, 0); iceS.closePath();
  const fIce = new THREE.Group(); iceWrap.add(fIce); fIce.add(recorte(iceS, iceMats[0], 0.08)); const pico = new THREE.Shape(); pico.moveTo(-1.3, 3.3); pico.lineTo(0, 5.8); pico.lineTo(1.4, 4.1); pico.lineTo(0.3, 3.7); pico.closePath(); const pc = recorte(pico, iceMats[1], 0.02); pc.position.z = 0.08; fIce.add(pc);
  w.vira(fIce, iceMats, m.gelo);
  const pingu = pinguim(); pingu.scale.setScalar(1.25); pol.add(pingu);

  // --- o mar que sobe, com a praia na rua
  const mar = new THREE.Group(); c.add(mar);
  const lamina = caixa(50.6, 0.1, 45.4, papel("#2ab5e6")); mar.add(lamina);
  const ondas: { g: any; x: number; fase: number }[] = [];
  for (let i = 0; i < 46; i++) { const x = -24 + R() * 48, z = -20 + R() * 42; const g = recorte(sCalombos(2 + R() * 2.4, 0.3 + R() * 0.24, 4, 700 + i), papel(i % 3 ? "#7bd6f2" : "#ffffff"), 0.02); g.position.set(x, 0.05, z); mar.add(g); ondas.push({ g, x, fase: R() * 6 }); }
  for (let i = 0; i < 16; i++) { const x = -6 + R() * 12, z = 13 + R() * 8; const g = recorte(sCalombos(2.6 + R() * 2.4, 0.3 + R() * 0.3, 4, 800 + i), papel(i % 2 ? "#7bd6f2" : "#ffffff"), 0.02); g.position.set(x, 0.05, z); mar.add(g); ondas.push({ g, x, fase: R() * 6 }); }
  const praia = new THREE.Group(); praia.position.y = 0.05; mar.add(praia);
  const prancha = recorte(sOval(1.9, 0.26), papel("#ffd23f"), 0.03); prancha.position.set(-1.15, 0.03, 11); prancha.rotation.y = 0.1; praia.add(prancha);
  const surf = new Fantoche({ pele: "#a86f4a", roupa: "#ff9f1c", calca: "#2ec4b6", cabelo: "#c98a3a" }); surf.raiz.position.set(-1.15, 0.2, 11.1); surf.raiz.scale.setScalar(1.1); praia.add(surf.raiz);
  const guarda = new THREE.Group(); guarda.position.set(1.55, 0, 11.4); praia.add(guarda);
  guarda.add(recorte(sRet(0.1, 3), papel("#fff6e0"), 0.03)); const gs = new THREE.Shape(); gs.absarc(0, 2.7, 1.6, 0, Math.PI, false); gs.closePath(); const gsr = recorte(gs, papel("#ffd23f"), 0.03); guarda.add(gsr); const gs2 = new THREE.Shape(); gs2.absarc(0, 2.7, 0.75, 0, Math.PI, false); gs2.closePath(); const gsr2 = recorte(gs2, papel("#3a86ff"), 0.01); gsr2.position.z = 0.03; guarda.add(gsr2);
  const pgPraia = pinguim(); pgPraia.position.set(-0.55, 0.02, 0.3); guarda.add(pgPraia);
  for (const s of [-1, 1]) { const ol = recorte(sCirc(0.13, s * 0.17, 1.28), papel("#111722"), 0.005); ol.position.z = 0.07; pgPraia.add(ol); }
  w.pop(praia, m.praia - 0.3, "cresce", 0.4, m.mae);

  // --- a mãe
  const mae = new THREE.Group(); mae.position.set(0, 0.2, 18); c.add(mae); w.pop(mae, m.mae + 0.1, "cresce", 0.45, m.silencio - 0.05);
  const casa = recorte(sRet(10, 6.2, 0.1), papel("#ffe0a8"), 0.06); casa.position.z = -2.2; mae.add(casa);
  const portaC = recorte(sRet(1.9, 3.6, 0.1), papel("#7a5236"), 0.03); portaC.position.z = -2.13; mae.add(portaC);
  const dona = new Fantoche({ pele: "#e0a97e", roupa: "#d77fbb", calca: "#55406f", cabelo: "#5a2f1c" }); dona.raiz.position.set(-1.7, 0, 0); dona.raiz.scale.setScalar(1.85); mae.add(dona.raiz);
  const casaco = new THREE.Group(); const cs = recorte(sRet(0.86, 1.05, 0.08, -1.05), papel("#6c7fa3"), 0.03); casaco.add(cs); for (const s of [-1, 1]) { const bc = recorte(sRet(0.2, 0.8, 0.05, -0.85), papel("#5c6f93"), 0.02); bc.position.set(s * 0.53, 0, 0.01); bc.rotation.z = s * 0.14; casaco.add(bc); } casaco.scale.setScalar(0.72); dona.corpo.add(casaco);
  const filho = new Fantoche({ pele: "#d9a07a", roupa: "#ffd166", calca: "#335c9e", cabelo: "#2b1c14" }); filho.raiz.position.set(1.8, 0, 0.2); filho.raiz.scale.setScalar(1.85); mae.add(filho.raiz);
  const suor = [0, 1, 2].map((i) => { const go = recorte(sOval(0.05, 0.09), papel("#7bd6f2"), 0.01); go.position.set(-0.42 + i * 0.42, 1.75, 0.2); filho.corpo.add(go); return go; });

  w.extra = (t: number) => {
    // o sol cresce: sem frio, o livro esquenta
    w.sol.scale.setScalar(1 + 0.45 * sm((t - m.onda - 0.5) / 5));
    // boneco derrete depois de virar
    const dt = sm((t - (m.otimo - 0.85)) / 1.7);
    boneco.scale.y = Math.max(0.02, 1 - dt); boneco.scale.x = 1 + dt * 0.45; boneco.visible = dt < 1;
    poca.visible = dt > 0.02 && t < m.geladeira + 0.4; poca.scale.setScalar(0.2 + 0.8 * dt);
    if (voce.raiz.visible) voce.posar({ brE: -2.3 + Math.sin(t * 9) * 0.3, brD: 2.3 + Math.sin(t * 9 + 1) * 0.3, pulo: Math.abs(Math.sin(t * 7)) * 0.16, boca: "aberta", cab: Math.sin(t * 5) * 0.06, olhar: [-0.5, 0] });
    // geladeira
    const abre = sm((t - m.porta) / 0.45); portaG.rotation.y = -abre * 1.95;
    ar.forEach((a, i) => { const q = (t - m.arQuente + i * 0.1) % 1.1; a.visible = t > m.arQuente - 0.05 && t < m.sorveteria + 0.3; a.position.y = 1.3 + Math.max(0, q) * 4.2; a.position.x = -1 + i * 0.4 + Math.sin(t * 5 + i) * 0.12; a.scale.setScalar(0.7 + Math.max(0, q) * 0.8); });
    const azedo = t > m.azedou, sobe = sm((t - (m.azedou - 0.7)) / 0.5), aB = 0.5 + 2.1 * sobe - (azedo ? sm((t - m.azedou - 0.5) / 0.3) * 1 : 0), hxP = 0.37 + 0.68 * Math.sin(aB), hyP = 1.24 - 0.68 * Math.cos(aB);
    pessoa.posar({ brD: aB, brE: t > m.porta ? -0.5 : -0.15, boca: azedo ? "azedo" : t > m.arQuente ? "aberta" : "neutra", olho: azedo ? 0.14 : 1.1, sobr: azedo ? -1 : t > m.arQuente ? 0.8 : 0, cab: azedo ? Math.sin(t * 22) * 0.07 : 0, olhar: [-0.7, 0.1] });
    leite.position.set(hxP, hyP + 0.12, 0.24); leite.visible = t > m.porta + 0.2;
    // sorveteria
    quadro.rotation.y = sm((t - m.fecha) / 0.35) * Math.PI;
    sorveteiro.posar({ boca: t > m.fecha ? "neutra" : "sorriso", brE: t > m.fecha ? -1 : -0.15, brD: t > m.fecha ? 1 : 0.15, sobr: t > m.fecha ? 0.8 : 0 });
    const caiu = t > m.derrete + 0.4;
    cliente.posar({ brD: 0.95, brE: -0.15, boca: caiu ? "aberta" : "sorriso", olhar: [0.8, caiu ? -0.8 : 0.3], sobr: caiu ? 1 : 0, olho: caiu ? 1.25 : 1 });
    const hx = 0.37 + 0.68 * Math.sin(0.95), hy = 1.24 - 0.68 * Math.cos(0.95); casq.position.set(hx + 0.03, hy + 0.12, 0.2);
    bolas.forEach((b, i) => { const q = lim((t - (m.derrete + 0.35 + (2 - i) * 0.16)) / 0.34), yy = hy + 0.26 + i * 0.27; b.position.set(hx + 0.03, yy + (0.03 - yy) * q * q, 0.2); b.visible = q < 1; manchas[i].visible = q >= 1; });
    // churrasco: de repente, ninguém se fala
    const briga = t > m.briga;
    familia.forEach((f, i) => { const fala = Math.sin(t * 8 + i * 2) > 0; f.posar(briga ? { brE: -0.1, brD: 0.1, boca: i === 2 ? "azedo" : "neutra", sobr: -0.9, olhar: [i < 2 ? -1 : 1, 0.2], cab: i < 2 ? 0.16 : i > 2 ? -0.16 : 0, olho: 0.8 } : { brE: -0.2 + Math.sin(t * 4 + i) * 0.3, brD: 0.2 + Math.sin(t * 5 + i) * 0.3, boca: t > m.refri && i === 2 ? "azedo" : fala ? "aberta" : "sorriso", cab: Math.sin(t * 3 + i) * 0.06, olhar: [i < 2 ? 0.7 : -0.7, 0] }); });
    vapor.forEach((a, i) => { const q = ((t + i * 0.3) * 0.8) % 1; a.visible = t > m.refri - 0.1; a.position.y = 2.75 + q * 1.3; a.scale.setScalar(0.6 + q); });
    // polo: o gelo encolhe e o pinguim desce com ele
    const enc = 1 - 0.86 * sm((t - m.gelo - 0.25) / 1.5); iceWrap.scale.y = enc; pingu.position.set(0, -0.08 + 5.65 * enc, 0.1); pingu.rotation.z = Math.sin(t * 6) * 0.05 * (1 - enc) * 4;
    // mar
    const sobeMar = sm((t - m.mar) / 1.2) * (1 - sm((t - m.mae - 0.15) / 0.5));
    mar.visible = sobeMar > 0.005; mar.position.y = 0.12 + 1.05 * sobeMar;
    for (const o of ondas) { o.g.position.x = o.x + Math.sin(t * 0.8 + o.fase) * 0.8; o.g.position.y = 0.05 + Math.sin(t * 2.4 + o.fase) * 0.05; }
    surf.posar({ brE: -1.3, brD: 1.3, boca: "aberta", pulo: Math.sin(t * 2.4) * 0.05, cab: Math.sin(t * 2) * 0.05, olhar: [0.5, 0.2] }); prancha.position.y = 0.03 + Math.sin(t * 2.4) * 0.04;
    pgPraia.rotation.z = Math.sin(t * 3) * 0.04;
    // mãe e o casaco
    const mostra = sm((t - m.casaco + 0.45) / 0.35), sacode = t > m.casaco ? Math.sin(t * 11) * 0.09 : 0, aM = 0.2 + mostra * 1.25 + sacode;
    dona.posar({ brD: aM, brE: -0.4 - Math.abs(Math.sin(t * 4)) * 0.2, boca: t > m.casaco && Math.sin(t * 13) > -0.2 ? "aberta" : "neutra", sobr: 0.8, olhar: [0.9, 0.15], cab: Math.sin(t * 7) * 0.05 });
    casaco.position.set(0.37 + 0.68 * Math.sin(aM), 1.24 - 0.68 * Math.cos(aM) + 0.05, 0.25); casaco.rotation.z = sacode * 0.6;
    filho.posar({ brE: -0.05, brD: 0.05, boca: "azedo", olhar: [-0.9, 0.1], sobr: -0.8, olho: 0.7, incl: Math.sin(t * 2) * 0.02 });
    suor.forEach((g, i) => { const q = (t * 0.9 + i * 0.37) % 1; g.position.y = 1.85 - q * 0.75; g.visible = q < 0.9; });
  };
}
CENARIOS[2] = montaDia2;

// ---------------------------------------------------------------- câmera: um voo só
function tomadas(l: LinhaDia): Tomada[] {
  const c = l.cenas, m = l.marcas;
  return [
    { t: 0, dur: 0.01, pos: [0.5, 3.4, 29], alvo: [0, 7.2, 16], fov: 44, deriva: [0.1, 0.02, -0.5], foco: 0.45 },
    { t: m.onda + 0.2, dur: 2.05, pos: [10, 34, 88], alvo: [0, 12, -6], fov: 44, deriva: [-0.4, 0.1, -0.7], foco: 0.15 },
    { t: c[3].inicio - 0.35, dur: 1.25, pos: [1.2, 3.5, 31.5], alvo: [1.2, 3, 17], fov: 44, deriva: [0, 0, -0.45], arco: 6, foco: 0.5 },
    { t: m.geladeira, dur: 1.1, pos: [-13.6, 4.4, 31.5], alvo: [-14.1, 3.2, 13.5], fov: 44, deriva: [0, -0.06, -0.35], arco: 3, foco: 0.6 },
    { t: m.azedou - 0.5, dur: 0.6, pos: [-12.4, 3.3, 27], alvo: [-12.8, 3, 15.5], fov: 40, deriva: [0, 0, -0.35], foco: 0.75 },
    { t: m.sorveteria, dur: 1.1, pos: [13.2, 4.6, 27], alvo: [11.6, 2.3, 13.5], fov: 44, deriva: [-0.1, -0.08, -0.7], arco: 3, foco: 0.6 },
    { t: m.derrete - 0.45, dur: 0.6, pos: [12, 3, 27.4], alvo: [11.9, 2.2, 16], fov: 42, deriva: [0, 0, -0.3], foco: 0.75 },
    { t: m.churrasco, dur: 1.1, pos: [0, 4, 35.5], alvo: [0, 3, 17.6], fov: 46, deriva: [0, 0, -0.45], arco: 3, foco: 0.55 },
    { t: m.polo, dur: 1.2, pos: [0, 24.5, 19], alvo: [0, 26.6, -14], fov: 34, deriva: [0, 0.05, -0.5], arco: 3, foco: 0.3 },
    { t: m.mar - 0.3, dur: 1.1, pos: [0.3, 2.4, 22.5], alvo: [0.3, 2, 9], fov: 46, deriva: [0, 0, -0.45], foco: 0.3 },
    { t: m.mae, dur: 1, pos: [0.1, 3.4, 33.5], alvo: [0.1, 3.1, 17.5], fov: 44, deriva: [0, 0, -0.35], foco: 0.6 },
    { t: c[10].inicio - 0.15, dur: 1.6, pos: [0, 4.2, 31], alvo: [0, 4.2, -2], fov: 50, deriva: [0, 0.12, 0.25], arco: 3, foco: 0.35 },
    { t: m.nilo, dur: 0.85, pos: [0.7, 3.3, 31.2], alvo: [0.05, 2.7, 18], fov: 44, deriva: [-0.1, 0, -0.3], foco: 0.5 },
    { t: c[12].inicio - 0.25, dur: 1.9, pos: [0, 30, 90], alvo: [0, 16, -8], fov: 44, deriva: [0, -0.05, -0.8], foco: 0.1 },
    { t: m.comenta - 0.2, dur: 1.2, pos: [0, 26, 74], alvo: [0, 18, -8], fov: 44, deriva: [0, 0, -0.3], foco: 0.05 },
  ];
}
function camEm(T: Tomada[], t: number, m: Record<string, number>) {
  const r = camBase(T, t);
  for (const [e, a] of [[m.onda, 0.12], [m.mar + 0.35, 0.1], [m.briga, 0.05], [m.regra, 0.06], [m.interrogacao, 0.14]] as const) { const d = t - e; if (d > 0 && d < 0.55) { const A = a * Math.exp(-d * 8); r.pos[0] += Math.sin(t * 71) * A; r.pos[1] += Math.cos(t * 63) * A; r.fov -= A * 16; } }
  return r;
}

// ---------------------------------------------------------------- edição
/** Cartão com quem escreveu o comentário vencedor. */
const Credito: React.FC<{ t: number; em: number; ate: number }> = ({ t, em, ate }) => {
  if (t < em || t > ate + 0.2) return null;
  const e = volta((t - em) / 0.3) * (t > ate ? 1 - sai((t - ate) / 0.2) : 1);
  return <div style={{ position: "absolute", top: 470, left: 56, right: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, transform: `rotate(-1.5deg) scale(${e})` }}>
    <div style={{ background: NAVY, color: AMAR, fontFamily: LILITA, fontSize: 56, lineHeight: 1, padding: "16px 30px 11px", borderRadius: 16, border: "6px solid #fffdf6" }}>O MAIS CURTIDO QUE VALIA</div>
    <div style={{ width: "100%", boxSizing: "border-box", background: "#fffdf6", borderRadius: 30, padding: "30px 34px 24px", fontFamily: LILITA, color: NAVY, boxShadow: "0 12px 0 rgba(22,35,63,.3)" }}>
      <div style={{ fontSize: 55, lineHeight: 1.05, color: AZUL }}>@formulaperderpeso</div>
      <div style={{ fontSize: 150, lineHeight: 1.1 }}>Frio</div>
      <div style={{ fontSize: 58, lineHeight: 1 }}>♥ 7 curtidas</div>
    </div>
  </div>;
};

export const Dia2: React.FC<{ linha: LinhaDia }> = ({ linha: l }) => {
  const f = useCurrentFrame(), t = f / 30, m = l.marcas, c = l.cenas;
  const T = useMemo(() => tomadas(l), [l]);
  const cam = camEm(T, t, m);
  const P = (v: V) => { const k = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.1, 900); k.position.set(...cam.pos); k.lookAt(...cam.alvo); k.updateMatrixWorld(); k.updateProjectionMatrix(); const q = new THREE.Vector3(...v).project(k); return { x: (q.x + 1) * 540, y: (1 - q.y) * 960 }; };
  const et = (txt: string, v: V, em: number, ate: number, cor?: string, r?: number) => { if (t < em || t > ate + 0.2) return null; const p = P(v); return <Etiqueta key={txt + em} txt={txt} x={p.x} y={p.y} t={t} em={em} ate={ate} cor={cor} r={r} />; };
  const virou = t >= m.onda + 0.15;
  const abertura = t < m.onda + 0.55;
  const gancho = abertura ? (t < m.onda + 0.3 ? 1 : 1 - sai((t - m.onda - 0.3) / 0.25)) : 0;
  const flipV = sm((t - m.onda) / 0.3);
  const calor = 0.16 * sm((t - m.onda - 0.5) / 5) * (t > c[10].inicio ? 0.6 : 1);
  const cad = sai((t - m.anotou + 0.15) / 0.3) * (t > c[12].inicio ? 1 - sai((t - c[12].inicio) / 0.2) : 1);
  const linhaCaderno = "Dia 2: o frio", nCad = Math.floor(lim((t - m.anotou) / 1.2) * linhaCaderno.length + 0.001);
  const fimCard = t >= m.comenta - 0.05;
  return (
    <AbsoluteFill style={{ background: "#f5e3c8", overflow: "hidden" }}>
      <Cena3D t={t} c={cam} m={m} k={f} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 520, backdropFilter: "blur(7px)", WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent)", maskImage: "linear-gradient(to bottom, black 20%, transparent)", opacity: cam.foco }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 520, backdropFilter: "blur(7px)", WebkitMaskImage: "linear-gradient(to top, black 20%, transparent)", maskImage: "linear-gradient(to top, black 20%, transparent)", opacity: cam.foco }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, transparent 58%, rgba(70,40,10,.2) 100%)" }} />
      {/* o calor: o livro inteiro vai esquentando */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 10%, rgba(255,150,40,.9), rgba(255,130,30,.45) 70%)", opacity: calor }} />
      <div style={{ position: "absolute", top: 138, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: LILITA }}>
        <div style={{ background: AMAR, color: NAVY, fontSize: 84, lineHeight: 1, padding: "12px 42px 6px", borderRadius: 12, transform: "rotate(-2deg)", boxShadow: "0 8px 0 rgba(22,35,63,.3)", border: "7px solid #fffdf6" }}>DIA {l.dia}</div>
        <div style={{ background: "#fffdf6", color: NAVY, fontSize: 38, lineHeight: 1, padding: "11px 24px 8px", borderRadius: 10, transform: "rotate(1deg)", boxShadow: "0 6px 0 rgba(22,35,63,.25)" }}>{virou ? "2 COISAS SUMIRAM · SÓ 1 PESSOA LEMBRA" : "1 COISA SUMIU · SÓ 1 PESSOA LEMBRA"}</div>
      </div>
      {gancho > 0 && <div style={{ position: "absolute", top: 440, width: "100%", textAlign: "center", fontFamily: LILITA, opacity: gancho, transform: `scale(${volta(t / 0.3)})` }}>
        <div style={{ fontSize: 118, color: NAVY, lineHeight: 1, ...adesivo(20, 10), transform: "rotate(-3deg)" }}>HOJE SUMIU</div>
        <div style={{ fontSize: 190, lineHeight: 1.04, color: t < m.onda + 0.15 ? GELO : CINZA, ...adesivo(26, 12), transform: `rotate(2deg) perspective(900px) rotateX(${flipV * 360}deg)` }}>O FRIO</div>
      </div>}
      <Credito t={t} em={m.credito - 0.05} ate={c[2].fim - 0.1} />
      {et("QUE ÓTIMO!", [2.8, 5.7, 18.2], m.otimo, c[3].fim - 0.3, AZUL, -2)}
      {et("AR QUENTE", [-15.8, 5.2, 13.8], m.arQuente, m.azedou - 0.6, "#ff9f1c", -2)}
      {et("AZEDOU!", [-12.4, 5.2, 15.8], m.azedou + 0.1, c[4].fim, "#2fd46b", 3)}
      {et("FECHOU", [13.65, 3.9, 13.5], m.fecha + 0.25, m.derrete - 0.5, CINZA, -2)}
      {et("DERRETEU", [10.1, 4.4, 16], m.derrete + 0.55, c[5].fim, CINZA, 2)}
      {et("QUENTE!", [0.8, 4.2, 18.8], m.refri, m.briga - 0.1, "#ff9f1c", -2)}
      {et("NINGUÉM FALA", [0.6, 4.8, 18], m.briga + 0.3, c[6].fim, CINZA, 2)}
      {et("POLO", [-3.4, 28, -14], m.polo + 0.6, m.gelo + 0.1, GELO, -2)}
      {et("DERRETENDO", [0, 26.6, -14], m.gelo + 0.5, c[7].fim - 0.2, CINZA, 2)}
      {et("PRAIA NA SUA RUA", [0.5, 5.2, 11], m.praia + 0.2, c[8].fim, "#ffc400", -2)}
      {et("LEVA CASACO!", [-1.7, 5.3, 18.2], m.casaco, c[9].fim - 0.1, "#d77fbb", -3)}
      {et("NINGUÉM RECLAMA", [0, 4.9, 18], m.reclama, c[10].fim - 0.1, AZUL, -2)}
      {et("SEU NILO", [-0.9, 4.25, 18.5], m.nilo + 0.7, m.regra - 0.4, AMAR, -2)}
      <Contador rot="O MAR SUBIU" num="+3 METROS" t={t} em={m.mar + 0.5} ate={m.praia + 0.1} />
      {/* a regra do Seu Nilo */}
      {t >= m.regra - 0.1 && t < m.anotou - 0.1 && <div style={{ position: "absolute", top: 400, width: "100%", display: "flex", justifyContent: "center" }}><div style={{ background: "#fffdf6", color: NAVY, fontFamily: LILITA, textAlign: "center", padding: "24px 44px 16px", borderRadius: 18, border: `9px solid ${NAVY}`, transform: `rotate(-3deg) scale(${volta((t - m.regra + 0.1) / 0.22)})`, boxShadow: "0 11px 0 rgba(22,35,63,.28)" }}><div style={{ fontSize: 48, color: AZUL, lineHeight: 1.1 }}>REGRA DO SEU NILO</div><div style={{ fontSize: 80, lineHeight: 1.08 }}>NÃO SOME GOVERNO<br />NEM PESSOA</div></div></div>}
      {cad > 0 && <div style={{ position: "absolute", left: 90, right: 90, top: 400, transform: `translateY(${(1 - cad) * -620}px) rotate(-2deg)`, background: "#fffdf6", borderRadius: 14, padding: "30px 34px 34px 92px", boxShadow: "0 16px 0 rgba(22,35,63,.28)", backgroundImage: "repeating-linear-gradient(transparent 0 84px, #bcd8f2 84px 88px)", backgroundPositionY: "22px", minHeight: 250 }}>
        <div style={{ position: "absolute", left: 56, top: 0, bottom: 0, width: 5, background: "#f2b8c6" }} />
        {[...Array(5)].map((_, i) => <div key={i} style={{ position: "absolute", left: 16, top: 26 + i * 50, width: 26, height: 26, borderRadius: 26, background: "#d9d3c2", boxShadow: "inset 0 3px 3px rgba(0,0,0,.25)" }} />)}
        <div style={{ fontFamily: CAVEAT, fontSize: 104, lineHeight: "88px", color: "#6b7079" }}>Dia 1: a cor vermelha</div>
        <div style={{ fontFamily: CAVEAT, fontSize: 104, lineHeight: "88px", color: "#23304f" }}>{linhaCaderno.slice(0, nCad)}<span style={{ opacity: nCad < linhaCaderno.length ? 1 : 0, color: "#7a7f8a" }}>|</span></div>
      </div>}
      {t >= m.interrogacao - 0.1 && !fimCard && <div style={{ position: "absolute", top: 390, width: "100%", textAlign: "center", fontFamily: LILITA, fontSize: 118, lineHeight: 1.02, color: NAVY, ...adesivo(20, 10), transform: `rotate(-2deg) scale(${volta((t - m.interrogacao + 0.1) / 0.3)})` }}>AMANHÃ SOME<br />OUTRA COISA</div>}
      {fimCard && <div style={{ position: "absolute", top: 360, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ textAlign: "center", fontFamily: LILITA, fontSize: 124, lineHeight: 1, color: NAVY, ...adesivo(20, 10), transform: `rotate(-2deg) scale(${volta((t - m.comenta) / 0.28)})` }}>O QUE SOME<br /><span style={{ color: AZUL }}>AMANHÃ?</span></div>
        <div style={{ height: 8 }} />
        <Comentario txt="o boleto" t={t} em={m.comenta + 0.55} r={-2} />
        <Comentario txt="as chaves" t={t} em={m.comenta + 1} r={1.5} />
        <Comentario txt="o despertador" t={t} em={m.comenta + 1.45} r={-1} />
        <div style={{ alignSelf: "center", fontFamily: LILITA, fontSize: 30, color: "#fff", background: "rgba(22,35,63,.82)", padding: "7px 18px 5px", borderRadius: 10, opacity: lim((t - m.comenta - 1.6) * 4) }}>COMENTÁRIOS DE EXEMPLO · FICÇÃO CRIADA COM IA</div>
      </div>}
      {fimCard && t > c[13].vozEm + c[13].vozDur - 0.1 && <div style={{ position: "absolute", top: 1085, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: LILITA, fontSize: 96, color: NAVY, transform: `scale(${volta((t - (c[13].vozEm + c[13].vozDur) + 0.1) / 0.25)})` }}>
        <div style={{ ...adesivo(18, 8) }}>COMENTA AQUI</div>
        <svg width={170} height={170} viewBox="0 0 100 100" style={{ marginTop: 4, transform: `translateY(${Math.sin(t * 7) * 16}px)`, filter: "drop-shadow(0 7px 0 rgba(22,35,63,.4))" }}><path d="M36 8 H64 V50 H86 L50 94 L14 50 H36 Z" fill={AZUL} stroke="#fff" strokeWidth={7} strokeLinejoin="round" /></svg>
      </div>}
      <Legenda l={l} t={t} onda={m.onda} escondida={t < c[1].inicio || t > c[13].vozEm + c[13].vozDur - 0.1} corAntes={GELO} />
      <Audio src={staticFile(`${l.id}.wav`)} />
    </AbsoluteFill>
  );
};
