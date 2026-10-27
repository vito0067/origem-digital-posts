// Portaria (térreo do prédio da Marina), à noite: portas de vidro na frente (com a rua e a chuva lá fora),
// balcão do porteiro com o monitor das câmeras, elevador na parede da esquerda (com o número do andar),
// caixas de correio na direita e lâmpadas frias no teto (uma pisca).
import * as THREE from "three";
import { Boneco, APARENCIAS } from "./boneco";
import { Chuva, caixa, mat, sorteio } from "./cenario";

export class Portaria {
  cena: any; rafa: Boneco; chuva: Chuva; ledTrava: any; luzTrava: any; ledTeclado: any; lampadas: any[] = []; luzesTeto: any[] = [];
  indicador: any; telaIndicador: any; telaCameras: any; portaE: any; portaD: any;
  static W = 8; static D = 7; static H = 3.2;

  constructor() {
    const cena = new THREE.Scene(); this.cena = cena;
    cena.background = new THREE.Color("#04060b");
    const { W, D, H } = Portaria;
    cena.add(new THREE.HemisphereLight("#9fb2d8", "#1c1a22", 0.6));
    // piso de pedra polida, paredes, teto
    const piso = caixa(W, 0.1, D, mat("#2c313c", { roughness: 0.32, metalness: 0.1 })); piso.position.y = -0.05; cena.add(piso);
    const tapete = caixa(2.2, 0.02, 3, mat("#5a2a2a", { roughness: 1 })); tapete.position.set(0, 0.01, 1.6); cena.add(tapete);
    const parede = mat("#59606f"), madeira = mat("#6a472f", { roughness: 0.6 });
    const fundo = caixa(W, H, 0.15, madeira); fundo.position.set(0, H / 2, -D / 2); cena.add(fundo);
    for (const x of [-W / 2, W / 2]) { const p = caixa(0.15, H, D, parede); p.position.set(x, H / 2, 0); cena.add(p); }
    const teto = caixa(W, 0.1, D, mat("#2a2e38")); teto.position.y = H; cena.add(teto);
    // parede da frente com o vão das portas (x de -1,4 a 1,4; 2,6 m de altura)
    const frente = (x0: number, x1: number, y0: number, y1: number) => { const b = caixa(x1 - x0, y1 - y0, 0.15, parede); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, D / 2); cena.add(b); };
    frente(-W / 2, -1.4, 0, H); frente(1.4, W / 2, 0, H); frente(-1.4, 1.4, 2.6, H);
    // portas de vidro (duas folhas), batentes de metal, puxadores
    const metal = mat("#1d2026", { roughness: 0.35, metalness: 0.6 });
    const vidroM = new THREE.MeshStandardMaterial({ color: "#9fc3e6", transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.2 });
    const folha = (x: number) => {
      const g = new THREE.Group(); g.position.set(x, 0, D / 2 - 0.02); cena.add(g);
      const v = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 2.5), vidroM); v.position.y = 1.3; g.add(v);
      for (const [w, h, px, py] of [[1.4, 0.07, 0, 0.05], [1.4, 0.07, 0, 2.56], [0.07, 2.6, -0.67, 1.3], [0.07, 2.6, 0.67, 1.3]] as const) { const b = caixa(w, h, 0.08, metal); b.position.set(px, py, 0); g.add(b); }
      const puxador = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 10), mat("#c9ccd2", { metalness: 0.9, roughness: 0.2 }));
      puxador.position.set(x < 0 ? 0.55 : -0.55, 1.15, -0.08); g.add(puxador);
      return g;
    };
    this.portaE = folha(-0.7); this.portaD = folha(0.7);
    // trava magnética em cima das portas, com LED, e o teclado ao lado
    const trava = caixa(0.6, 0.12, 0.14, metal); trava.position.set(0, 2.5, D / 2 - 0.12); cena.add(trava);
    this.ledTrava = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), new THREE.MeshBasicMaterial({ color: "#2bff6a", toneMapped: false }));
    this.ledTrava.position.set(0.22, 2.5, D / 2 - 0.2); cena.add(this.ledTrava);
    this.luzTrava = new THREE.PointLight("#2bff6a", 1.2, 2.2, 2); this.luzTrava.position.set(0.22, 2.42, D / 2 - 0.35); cena.add(this.luzTrava);
    const teclado = caixa(0.18, 0.26, 0.04, mat("#15171c")); teclado.position.set(1.75, 1.35, D / 2 - 0.1); cena.add(teclado);
    this.ledTeclado = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.03), new THREE.MeshBasicMaterial({ color: "#2bff6a", toneMapped: false }));
    this.ledTeclado.position.set(1.75, 1.44, D / 2 - 0.125); this.ledTeclado.rotation.y = Math.PI; cena.add(this.ledTeclado);
    // lá fora: a rua molhada e a chuva
    const rua = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.MeshBasicMaterial({ map: this.texturaRua() })); rua.position.set(0, 4, D / 2 + 12); rua.rotation.y = Math.PI; cena.add(rua);
    this.chuva = new Chuva(1400, 14, 10); cena.add(this.chuva.linhas);
    const poste = new THREE.PointLight("#ffbf6b", 6, 14, 1.4); poste.position.set(-3, 4, D / 2 + 5); cena.add(poste);
    // balcão do porteiro, monitor das câmeras e o Rafa
    const balcao = caixa(3.2, 1.1, 0.7, madeira, 0.04); balcao.position.set(-0.6, 0.55, -1.7); cena.add(balcao);
    const tampo = caixa(3.3, 0.06, 0.8, mat("#1e2128", { roughness: 0.25 })); tampo.position.set(-0.6, 1.13, -1.7); cena.add(tampo);
    const monitor = caixa(0.68, 0.44, 0.05, mat("#101216")); monitor.position.set(0.55, 1.42, -1.85); monitor.rotation.y = -0.35; cena.add(monitor);
    this.telaCameras = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.38), new THREE.MeshBasicMaterial({ map: this.texturaCameras(), toneMapped: false }));
    this.telaCameras.position.set(0.55 + Math.sin(-0.35) * 0.03, 1.42, -1.85 + Math.cos(-0.35) * 0.03); this.telaCameras.rotation.y = -0.35; cena.add(this.telaCameras);
    const brilhoMon = new THREE.PointLight("#8fb4ff", 3.2, 3.2, 2); brilhoMon.position.set(0.1, 1.75, -1.6); cena.add(brilhoMon);
    const cadeira = caixa(0.55, 0.08, 0.55, mat("#202329")); cadeira.position.set(-0.6, 0.86, -2.45); cena.add(cadeira);
    this.rafa = new Boneco(APARENCIAS.rafa); cena.add(this.rafa.raiz);
    // elevador na parede da esquerda, com o mostrador do andar
    const portaElev = (z: number) => { const p = caixa(0.06, 2.3, 0.62, mat("#8e949e", { metalness: 0.75, roughness: 0.28 })); p.position.set(-W / 2 + 0.1, 1.15, z); cena.add(p); };
    portaElev(-0.05); portaElev(0.59);
    const molduraElev = caixa(0.08, 2.5, 1.5, metal); molduraElev.position.set(-W / 2 + 0.07, 1.25, 0.27); cena.add(molduraElev);
    this.telaIndicador = document.createElement("canvas"); this.telaIndicador.width = 256; this.telaIndicador.height = 128;
    const texInd = new THREE.CanvasTexture(this.telaIndicador); texInd.colorSpace = THREE.SRGBColorSpace;
    this.indicador = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.21), new THREE.MeshBasicMaterial({ map: texInd, toneMapped: false }));
    this.indicador.position.set(-W / 2 + 0.13, 2.68, 0.27); this.indicador.rotation.y = Math.PI / 2; cena.add(this.indicador);
    // caixas de correio na parede da direita e um vaso
    const correio = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.3), new THREE.MeshStandardMaterial({ map: this.texturaCorreio(), roughness: 0.5, metalness: 0.4 }));
    correio.position.set(W / 2 - 0.09, 1.45, -0.6); correio.rotation.y = -Math.PI / 2; cena.add(correio);
    const vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.6, 16), mat("#2f2a26")); vaso.position.set(2.6, 0.3, 2.7); cena.add(vaso);
    const folhas = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), mat("#2c5a40", { flatShading: true })); folhas.position.set(2.6, 1.05, 2.7); folhas.scale.set(1, 1.4, 1); cena.add(folhas);
    // lâmpadas frias no teto (a da frente, à direita, pisca)
    for (const [x, z] of [[-1.8, -1], [1.8, -1], [-1.8, 1.8], [1.8, 1.8]] as const) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.3), new THREE.MeshBasicMaterial({ color: "#eaf2ff", toneMapped: false })); l.position.set(x, H - 0.06, z); cena.add(l); this.lampadas.push(l);
      const p = new THREE.PointLight("#dfe9ff", 5, 6.5, 1.6); p.position.set(x, H - 0.3, z); cena.add(p); this.luzesTeto.push(p);
    }
    this.padrao();
  }

  mostrarAndar(n: number) {
    const g = this.telaIndicador.getContext("2d")!;
    g.fillStyle = "#07080b"; g.fillRect(0, 0, 256, 128);
    g.font = "bold 96px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ff3b3b"; g.shadowColor = "#ff3b3b"; g.shadowBlur = 18;
    g.fillText(n === 0 ? "T" : String(n), 128, 70); this.indicador.material.map.needsUpdate = true;
  }

  /** Trava das portas: abaixo de 0,5 aberta (LED verde); acima, trancada (LED vermelho). */
  travar(p: number) {
    const cor = p > 0.5 ? "#ff2b2b" : "#2bff6a";
    this.ledTrava.material.color.set(cor); this.luzTrava.color.set(cor); this.ledTeclado.material.color.set(cor);
    this.luzTrava.intensity = p > 0.5 ? 2.4 : 1.2;
  }

  padrao() {
    this.travar(0); this.mostrarAndar(0); this.rafa.segurarCelular(false);
    this.rafa.raiz.position.set(-0.6, 0.3, -2.45); this.rafa.raiz.rotation.set(0, 0, 0);
  }

  atualizar(t: number) {
    this.chuva.atualizar(t, [0, 2.5, Portaria.D / 2 + 4]);
    const pisca = Math.sin(t * 23) > 0.6 && Math.sin(t * 3.1) > 0.2 ? 0.15 : 1;
    this.luzesTeto[3].intensity = 5 * pisca; this.lampadas[3].material.color.set(pisca < 1 ? "#5a606b" : "#eaf2ff");
  }

  private texturaRua() {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 420; const g = c.getContext("2d")!; const r = sorteio(12);
    const gr = g.createLinearGradient(0, 0, 0, 420); gr.addColorStop(0, "#070b16"); gr.addColorStop(0.62, "#141b30"); gr.addColorStop(0.63, "#20232c"); gr.addColorStop(1, "#0d0f14");
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 420);
    let x = -10;
    while (x < 1030) {
      const w = 60 + r() * 110, h = 90 + r() * 150; g.fillStyle = "#0b1020"; g.fillRect(x, 262 - h, w, h);
      for (let yy = 262 - h + 10; yy < 255; yy += 16) for (let xx = x + 6; xx < x + w - 8; xx += 13) if (r() < 0.12) { g.fillStyle = "#ffcf7a"; g.fillRect(xx, yy, 6, 8); }
      x += w + 8;
    }
    // poste e o brilho dele no chão molhado
    const halo = g.createRadialGradient(250, 150, 0, 250, 150, 140); halo.addColorStop(0, "rgba(255,200,120,0.75)"); halo.addColorStop(1, "rgba(255,200,120,0)"); g.fillStyle = halo; g.fillRect(100, 10, 300, 280);
    g.fillStyle = "#1b1d22"; g.fillRect(246, 150, 8, 115);
    const refl = g.createLinearGradient(0, 270, 0, 420); refl.addColorStop(0, "rgba(255,190,110,0.28)"); refl.addColorStop(1, "rgba(255,190,110,0)"); g.fillStyle = refl; g.fillRect(205, 270, 90, 150);
    // carro estacionado (silhueta)
    g.fillStyle = "#0a0c11"; g.fillRect(560, 300, 260, 60); g.fillRect(610, 262, 150, 50);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  private texturaCameras() {
    const c = document.createElement("canvas"); c.width = 512; c.height = 320; const g = c.getContext("2d")!; const r = sorteio(4);
    g.fillStyle = "#05070a"; g.fillRect(0, 0, 512, 320);
    ["CAM 01 · PORTARIA", "CAM 02 · GARAGEM", "CAM 03 · 12º ANDAR", "CAM 04 · ESCADA"].forEach((n, k) => {
      const x = (k % 2) * 256 + 4, y = Math.floor(k / 2) * 160 + 4;
      const gr = g.createLinearGradient(0, y, 0, y + 152); gr.addColorStop(0, "#1a2a33"); gr.addColorStop(1, "#0c1418"); g.fillStyle = gr; g.fillRect(x, y, 248, 152);
      g.fillStyle = "#24363f"; g.fillRect(x + 30, y + 40, 60 + r() * 80, 100); g.fillRect(x + 150, y + 60, 70, 80);
      for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(200,230,255,${r() * 0.12})`; g.fillRect(x + r() * 248, y + r() * 152, 2, 2); }
      g.fillStyle = "#cfe3ff"; g.font = "bold 15px monospace"; g.fillText(n, x + 8, y + 18); g.fillStyle = "#ff3b3b"; g.fillText("● 03:34", x + 175, y + 144);
    });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  private texturaCorreio() {
    const c = document.createElement("canvas"); c.width = 768; c.height = 416; const g = c.getContext("2d")!;
    g.fillStyle = "#3c4048"; g.fillRect(0, 0, 768, 416);
    for (let row = 0; row < 7; row++) for (let col = 0; col < 8; col++) {
      const x = 10 + col * 94, y = 10 + row * 57;
      g.fillStyle = "#7d828c"; g.fillRect(x, y, 88, 51); g.fillStyle = "#5c616a"; g.fillRect(x + 6, y + 30, 76, 6);
      const andar = 14 - row * 2 - (col >= 4 ? 1 : 0), ap = (col % 4) + 1;
      g.fillStyle = "#1c1e22"; g.font = "bold 16px Arial"; g.fillText(`${andar}0${ap}`, x + 8, y + 22);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
}
