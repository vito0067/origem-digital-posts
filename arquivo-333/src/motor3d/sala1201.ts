// A sala do Seu Álvaro (apto 1201), vazia: a janela aberta com a cortina batendo e a chuva entrando, sete espelhos
// cobertos com lençol, a poltrona virada para a janela e, na parede, em vermelho: "ELES SÓ VEEM QUEM OLHA".
import * as THREE from "three";
import { caixa, mat, sorteio, Chuva } from "./cenario";

export class Sala1201 {
  cena: any; chuva: Chuva; cortinaE: any; cortinaD: any; luzAbajur: any; luaLuz: any; frase: any;
  static W = 5; static D = 5; static H = 2.8;
  /** Onde ficam os sete espelhos: [x, z, rotação y]. */
  static ESPELHOS: [number, number, number][] = [[2.44, -1.7, -Math.PI / 2], [2.44, -0.5, -Math.PI / 2], [2.44, 0.7, -Math.PI / 2], [2.44, 1.9, -Math.PI / 2], [-1.5, 2.44, Math.PI], [0, 2.44, Math.PI], [1.5, 2.44, Math.PI]];

  constructor() {
    const cena = new THREE.Scene(); this.cena = cena;
    cena.background = new THREE.Color("#04050a");
    const { W, D, H } = Sala1201;
    cena.add(new THREE.HemisphereLight("#8c95b8", "#2a221c", 0.75));
    const piso = caixa(W, 0.1, D, mat("#5a4030", { roughness: 0.6 })); piso.position.y = -0.05; cena.add(piso);
    const teto = caixa(W, 0.08, D, mat("#cfc6b4")); teto.position.y = H; cena.add(teto);
    const parede = mat("#8f8673");
    for (const x of [-W / 2, W / 2]) { const p = caixa(0.12, H, D, parede); p.position.set(x, H / 2, 0); cena.add(p); }
    const fundo = caixa(W, H, 0.12, parede); fundo.position.set(0, H / 2, D / 2); cena.add(fundo);
    // parede da janela (vão de x -1 a 1, y 0,9 a 2,4) com a janela ABERTA
    const pj = (x0: number, x1: number, y0: number, y1: number) => { const b = caixa(x1 - x0, y1 - y0, 0.12, parede); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, -D / 2); cena.add(b); };
    pj(-W / 2, -1, 0, H); pj(1, W / 2, 0, H); pj(-1, 1, 0, 0.9); pj(-1, 1, 2.4, H);
    const caixilho = mat("#e3e1da");
    for (const lado of [-1, 1]) { const folha = new THREE.Group(); folha.position.set(lado * 1, 1.65, -D / 2 - 0.02); folha.rotation.y = lado * -1.9; cena.add(folha);
      const f = caixa(0.04, 1.5, 0.04, caixilho); f.position.set(lado * -0.98, 0, 0); folha.add(f); const g2 = caixa(1.0, 0.04, 0.04, caixilho); g2.position.set(lado * -0.5, 0.73, 0); folha.add(g2); const g3 = g2.clone(); g3.position.y = -0.73; folha.add(g3); }
    const fora = new THREE.Mesh(new THREE.PlaneGeometry(40, 22), new THREE.MeshBasicMaterial({ map: this.texturaFora() })); fora.position.set(0, 3, -D / 2 - 14); cena.add(fora);
    this.chuva = new Chuva(900, 6, 6); cena.add(this.chuva.linhas);
    // cortinas batendo com o vento
    const cortina = (x: number) => {
      const g = new THREE.PlaneGeometry(0.9, 2.2, 20, 12); const m = new THREE.Mesh(g, mat("#8b3b3b", { side: THREE.DoubleSide, roughness: 1 }));
      m.position.set(x, 1.55, -D / 2 + 0.18); m.castShadow = true; cena.add(m); (m as any).base = Float32Array.from(g.attributes.position.array); return m;
    };
    this.cortinaE = cortina(-0.85); this.cortinaD = cortina(0.85);
    // os sete espelhos cobertos
    const moldura = mat("#3b2a1e", { roughness: 0.5 }), lencol = mat("#d8d4ca", { side: THREE.DoubleSide, roughness: 1 });
    const r = sorteio(21);
    for (const [x, z, ry] of Sala1201.ESPELHOS) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; cena.add(g);
      const m = caixa(0.8, 1.8, 0.06, moldura); m.position.set(0, 1.25, 0.03); g.add(m);
      const geo = new THREE.PlaneGeometry(1.0, 1.95, 12, 16); const pos = geo.attributes.position; const fase = r() * 6;
      for (let i = 0; i < pos.count; i++) { const px = pos.getX(i), py = pos.getY(i); pos.setZ(i, 0.045 * Math.sin(px * 6 + fase) * (0.6 - py * 0.25) + Math.max(0, -py - 0.6) * 0.12); }
      geo.computeVertexNormals();
      const l = new THREE.Mesh(geo, lencol); l.position.set(0, 1.2, 0.1); g.add(l);
    }
    // a frase na parede da esquerda
    this.frase = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.15), new THREE.MeshStandardMaterial({ map: this.texturaFrase(), transparent: true, roughness: 0.9 }));
    this.frase.position.set(-W / 2 + 0.07, 1.5, 0.2); this.frase.rotation.y = Math.PI / 2; cena.add(this.frase);
    // móveis: sofá, mesinha, poltrona virada para a janela e o abajur aceso
    const tecido = mat("#4b5a4a", { roughness: 1 });
    const sofa = caixa(2.0, 0.45, 0.8, tecido, 0.08); sofa.position.set(-0.4, 0.3, 1.4); cena.add(sofa);
    const encosto = caixa(2.0, 0.55, 0.2, tecido, 0.08); encosto.position.set(-0.4, 0.75, 1.75); cena.add(encosto);
    const mesa = caixa(1.0, 0.08, 0.55, mat("#6a4a32", { roughness: 0.4 })); mesa.position.set(-0.4, 0.42, 0.5); cena.add(mesa);
    const poltrona = caixa(0.8, 0.45, 0.75, mat("#7a5c3e", { roughness: 0.9 }), 0.08); poltrona.position.set(0.3, 0.3, -1.3); cena.add(poltrona);
    const encP = caixa(0.8, 0.6, 0.18, mat("#7a5c3e", { roughness: 0.9 }), 0.08); encP.position.set(0.3, 0.75, -0.98); cena.add(encP);
    const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8), mat("#2b2b2b")); haste.position.set(-1.9, 0.75, -1.6); cena.add(haste);
    const cupula = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.3, 20, 1, true), new THREE.MeshStandardMaterial({ color: "#f3dfb8", emissive: "#ffcf8a", emissiveIntensity: 0.8, side: THREE.DoubleSide })); cupula.position.set(-1.9, 1.6, -1.6); cena.add(cupula);
    this.luzAbajur = new THREE.PointLight("#ffc07a", 9, 8, 1.4); this.luzAbajur.position.set(-1.9, 1.5, -1.6); this.luzAbajur.castShadow = true; cena.add(this.luzAbajur);
    this.luaLuz = new THREE.SpotLight("#9fb6ff", 14, 12, 0.7, 0.6, 1.2); this.luaLuz.position.set(0.5, 3.5, -D / 2 - 3); this.luaLuz.target.position.set(0, 0, 0.5); cena.add(this.luaLuz); cena.add(this.luaLuz.target);
  }

  padrao() { this.luaLuz.intensity = 14; this.luzAbajur.intensity = 9; }

  atualizar(t: number, flash = 0) {
    this.chuva.atualizar(t, [0, 2, -Sala1201.D / 2 - 2.5]);
    for (const [c, f] of [[this.cortinaE, 0], [this.cortinaD, 1.7]] as const) {
      const pos = c.geometry.attributes.position, b = c.base as Float32Array;
      for (let i = 0; i < pos.count; i++) { const x = b[i * 3], y = b[i * 3 + 1]; const solto = (1.1 - y) / 2.2; pos.setZ(i, solto * (0.35 + 0.25 * Math.sin(t * 3.1 + f)) + 0.06 * Math.sin(x * 10 + t * 6 + f)); }
      pos.needsUpdate = true; c.geometry.computeVertexNormals();
    }
    this.luaLuz.intensity = 14 + flash * 300;
  }

  private texturaFora() {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 560; const g = c.getContext("2d")!; const r = sorteio(8);
    const gr = g.createLinearGradient(0, 0, 0, 560); gr.addColorStop(0, "#050a16"); gr.addColorStop(1, "#18203d"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 560);
    let x = -10; while (x < 1030) { const w = 60 + r() * 100, h = 120 + r() * 300; g.fillStyle = "#0d1222"; g.fillRect(x, 560 - h, w, h); for (let yy = 560 - h + 10; yy < 550; yy += 17) for (let xx = x + 6; xx < x + w - 8; xx += 13) if (r() < 0.14) { g.fillStyle = "#ffcf7a"; g.fillRect(xx, yy, 6, 8); } x += w + 6; }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  /** A frase escrita à mão, em vermelho, escorrendo. */
  private texturaFrase() {
    const c = document.createElement("canvas"); c.width = 810; c.height = 1024; const g = c.getContext("2d")!; const r = sorteio(3);
    g.clearRect(0, 0, 810, 1024);
    g.fillStyle = "#9e1414"; g.strokeStyle = "#9e1414"; g.lineCap = "round"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "bold 170px Impact, Arial Black, Arial";
    const linhas = [["ELES SÓ", 150], ["VEEM", 380], ["QUEM", 610], ["OLHA", 840]] as const;
    for (const [txt, y] of linhas) { g.save(); g.translate(405, y); g.rotate((r() - 0.5) * 0.07); g.fillText(txt, 0, 0); g.restore(); }
    for (let k = 0; k < 30; k++) { const x = 120 + r() * 570, y0 = linhas[k % 4][1] + 70, len = 20 + r() * 120; g.lineWidth = 5 + r() * 7; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (r() - 0.5) * 4, y0 + len); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
}
