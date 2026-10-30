// Corredor do 12º andar do Ed. Mirante: piso de ladrilho, portas 1201 e 1202 à esquerda, 1203 (a da Marina) e 1204 à direita,
// o elevador no fundo (com o mostrador do andar) e a porta da escada na outra ponta, com a placa verde de saída.
// A porta do 1201 pode ficar entreaberta, com a luz quente da sala vazando para o corredor.
import * as THREE from "three";
import { Boneco, APARENCIAS } from "./boneco";
import { caixa, mat, texturaTexto } from "./cenario";

export class Corredor {
  cena: any; bia: Boneco; bia2: Boneco; marina: Boneco; porta1201: any; luz1201: any; lampadas: any[] = []; luzesTeto: any[] = []; telaIndicador: any; indicador: any; placas: any[] = []; luzVerde: any;
  static W = 2.4; static L = 12; static H = 2.7;
  /** Centro das portas (x da parede, z do meio da porta). */
  static PORTAS = { "1201": [-1.2, -3], "1202": [-1.2, 1.5], "1203": [1.2, -3], "1204": [1.2, 1.5] } as Record<string, [number, number]>;

  constructor() {
    const cena = new THREE.Scene(); this.cena = cena;
    cena.background = new THREE.Color("#05060a");
    const { W, L, H } = Corredor;
    cena.add(new THREE.HemisphereLight("#c9c2b0", "#2a2420", 0.45));
    // piso de ladrilho (xadrez discreto), teto e rodapé
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(W, L), new THREE.MeshStandardMaterial({ map: this.texturaPiso(), roughness: 0.45 }));
    piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; cena.add(piso);
    const teto = caixa(W, 0.08, L, mat("#d9d4c6")); teto.position.y = H; cena.add(teto);
    const parede = mat("#b9ae98"), rodape = mat("#5a4636");
    // parede direita inteira (as portas ficam encostadas nela)
    const pd = caixa(0.12, H, L, parede); pd.position.set(W / 2 + 0.06, H / 2, 0); cena.add(pd);
    // parede esquerda com o vão do 1201 (de z -3,475 a -2,525, até 2,1 m) para a luz da sala vazar
    const pe = (z0: number, z1: number, y0: number, y1: number) => { const b = caixa(0.12, y1 - y0, z1 - z0, parede); b.position.set(-W / 2 - 0.06, (y0 + y1) / 2, (z0 + z1) / 2); cena.add(b); };
    pe(-L / 2, -3.475, 0, H); pe(-2.525, L / 2, 0, H); pe(-3.475, -2.525, 2.1, H);
    for (const x of [-W / 2 + 0.02, W / 2 - 0.02]) { const r = caixa(0.04, 0.12, L, rodape); r.position.set(x, 0.06, 0); cena.add(r); }
    // sala do 1201 atrás do vão (só o que aparece pela fresta): uma caixa clara com luz de abajur
    const sala = new THREE.Mesh(new THREE.BoxGeometry(2.4, H, 3), new THREE.MeshStandardMaterial({ color: "#8a7a62", side: THREE.BackSide, roughness: 0.9 }));
    sala.position.set(-W / 2 - 1.3, H / 2, -3); cena.add(sala);
    this.luz1201 = new THREE.PointLight("#ffbf7a", 0, 5, 1.4); this.luz1201.position.set(-W / 2 - 1.2, 1.8, -3); cena.add(this.luz1201);
    // portas
    const madeira = mat("#5e4130", { roughness: 0.55 }), batente = mat("#3d2c22"), metal = mat("#c8b27a", { metalness: 0.8, roughness: 0.3 });
    for (const [num, [x, z]] of Object.entries(Corredor.PORTAS)) {
      const lado = x < 0 ? 1 : -1; // para dentro do corredor
      // batente: só a moldura (em cima e dos lados), para a fresta da porta aberta mostrar a sala
      for (const [h, d, y, dz] of [[0.1, 1.1, 2.15, 0], [2.2, 0.07, 1.1, -0.51], [2.2, 0.07, 1.1, 0.51]] as const) { const b = caixa(0.07, h, d, batente); b.position.set(x + lado * 0.02, y, z + dz); cena.add(b); }
      const piv = new THREE.Group(); piv.position.set(x + lado * 0.05, 0, z - 0.475); cena.add(piv); // dobradiça
      const folha = caixa(0.05, 2.08, 0.95, madeira); folha.position.set(0, 1.04, 0.475); piv.add(folha);
      const placa = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.11), new THREE.MeshStandardMaterial({ map: texturaTexto(num, { cor: "#2a2116", fundo: "#c9a96a", fonte: "bold 150px Arial", w: 512, h: 220 }), metalness: 0.6, roughness: 0.35 }));
      placa.position.set(lado * 0.03, 1.62, 0.475); placa.rotation.y = lado * Math.PI / 2; piv.add(placa); this.placas.push(placa);
      const olho = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 12), metal); olho.rotation.z = Math.PI / 2; olho.position.set(lado * 0.03, 1.5, 0.475); piv.add(olho);
      const mac = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), metal); mac.position.set(lado * 0.05, 1.0, 0.85); piv.add(mac);
      const tapete = caixa(0.5, 0.015, 0.8, mat(num === "1203" ? "#6b2a2a" : "#3b3f4a", { roughness: 1 })); tapete.position.set(x + lado * 0.3, 0.008, z); cena.add(tapete);
      if (num === "1201") this.porta1201 = piv;
    }
    // elevador no fundo (z = -L/2) com o mostrador
    const portaElev = (x: number) => { const p = caixa(0.6, 2.2, 0.05, mat("#9aa0aa", { metalness: 0.8, roughness: 0.25 })); p.position.set(x, 1.1, -L / 2 + 0.06); cena.add(p); };
    portaElev(-0.31); portaElev(0.31);
    const molduraE = caixa(1.4, 2.4, 0.04, mat("#2a2d33", { metalness: 0.5 })); molduraE.position.set(0, 1.2, -L / 2 + 0.03); cena.add(molduraE);
    this.telaIndicador = document.createElement("canvas"); this.telaIndicador.width = 256; this.telaIndicador.height = 128;
    const texInd = new THREE.CanvasTexture(this.telaIndicador); texInd.colorSpace = THREE.SRGBColorSpace;
    this.indicador = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.18), new THREE.MeshBasicMaterial({ map: texInd, toneMapped: false }));
    this.indicador.position.set(0, 2.52, -L / 2 + 0.07); cena.add(this.indicador);
    this.mostrarAndar(12);
    // escada na outra ponta, com a placa verde de saída
    const portaEsc = caixa(1.0, 2.1, 0.05, mat("#6d6f73", { metalness: 0.4 })); portaEsc.position.set(0, 1.05, L / 2 - 0.05); cena.add(portaEsc);
    const saida = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.16), new THREE.MeshBasicMaterial({ map: texturaTexto("ESCADA", { cor: "#ffffff", fundo: "#0f8a3c", fonte: "bold 120px Arial", w: 512, h: 160 }), toneMapped: false }));
    saida.position.set(0, 2.35, L / 2 - 0.08); saida.rotation.y = Math.PI; cena.add(saida);
    const verde = new THREE.PointLight("#2bd16a", 1.2, 3, 2); verde.position.set(0, 2.2, L / 2 - 0.4); cena.add(verde); this.luzVerde = verde;
    // extintor (o vermelho do corredor)
    const ext = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16), mat("#c0261f", { roughness: 0.4 })); ext.position.set(W / 2 - 0.12, 0.6, 3.6); ext.castShadow = true; cena.add(ext);
    // luzes do teto (a do meio pisca)
    for (const z of [-4, 0, 4]) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.6), new THREE.MeshBasicMaterial({ color: "#fff3dc", toneMapped: false })); l.position.set(0, H - 0.03, z); cena.add(l); this.lampadas.push(l);
      const p = new THREE.PointLight("#ffe9c9", 4, 6, 1.5); p.position.set(0, H - 0.25, z); cena.add(p); this.luzesTeto.push(p);
    }
    // personagens
    this.bia = new Boneco(APARENCIAS.bia); cena.add(this.bia.raiz);
    this.bia2 = new Boneco(APARENCIAS.bia); cena.add(this.bia2.raiz);
    this.marina = new Boneco(APARENCIAS.marina); cena.add(this.marina.raiz);
    this.padrao();
  }

  mostrarAndar(n: number) {
    const g = this.telaIndicador.getContext("2d")!;
    g.fillStyle = "#07080b"; g.fillRect(0, 0, 256, 128);
    g.font = "bold 96px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ff3b3b"; g.shadowColor = "#ff3b3b"; g.shadowBlur = 18;
    g.fillText(n === 0 ? "T" : String(n), 128, 70); this.indicador.material.map.needsUpdate = true;
  }

  /** Porta do 1201: 0 fechada, 1 escancarada (a luz da sala aumenta junto). */
  abrir1201(p: number) { this.porta1201.rotation.y = -p * 1.2; this.luz1201.intensity = 7 * Math.min(1, p * 2.5); }

  /** O 13º andar (ep. 8): o mesmo corredor, mas sem número nas portas, luz fria e fraca e o elevador marcando 13. */
  andar13(sim: boolean) {
    this.modo13 = sim;
    for (const p of this.placas) p.visible = !sim;
    for (const p of this.luzesTeto) { p.intensity = sim ? 1.3 : 4; p.color.set(sim ? "#b9c8ff" : "#ffe9c9"); }
    this.luz1201.color.set(sim ? "#9fb6ff" : "#ffbf7a");
    this.mostrarAndar(sim ? 13 : 12);
  }
  modo13 = false;

  padrao() {
    this.abrir1201(0); this.andar13(false);
    this.bia.raiz.visible = false; this.bia2.raiz.visible = false; this.marina.raiz.visible = false;
    for (const p of this.luzesTeto) p.intensity = 4;
  }

  atualizar(t: number) {
    const pisca = Math.sin(t * 19) > 0.55 && Math.sin(t * 2.3) > 0 ? 0.12 : 1;
    const base = this.modo13 ? 1.3 : 4;
    this.luzesTeto[1].intensity = base * pisca; this.lampadas[1].material.color.set(pisca < 1 ? "#4a4740" : this.modo13 ? "#c9d4ff" : "#fff3dc");
    for (const i of [0, 2]) this.lampadas[i].material.color.set(this.modo13 ? "#c9d4ff" : "#fff3dc");
  }

  private texturaPiso() {
    const c = document.createElement("canvas"); c.width = 256; c.height = 1280; const g = c.getContext("2d")!;
    for (let y = 0; y < 20; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? "#8f8778" : "#a39b8b"; g.fillRect(x * 64, y * 64, 64, 64); }
    g.strokeStyle = "rgba(40,30,20,0.35)"; g.lineWidth = 2;
    for (let y = 0; y <= 20; y++) { g.beginPath(); g.moveTo(0, y * 64); g.lineTo(256, y * 64); g.stroke(); }
    for (let x = 0; x <= 4; x++) { g.beginPath(); g.moveTo(x * 64, 0); g.lineTo(x * 64, 1280); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
}
