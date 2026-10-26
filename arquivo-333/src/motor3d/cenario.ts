// Os cenários da série "O Sinal" em 3D estilo desenho: a cidade à noite (com a torre da Marina na frente do parque)
// e o quarto dela. Cada cenário é uma cena do three.js montada uma vez só e reaproveitada em todos os quadros.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Boneco, APARENCIAS, POSES } from "./boneco";

const mat = (cor: string, extra: Record<string, unknown> = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.85, metalness: 0, ...extra });
const caixa = (w: number, h: number, d: number, m: any, arred = 0) => {
  const g = arred > 0 ? new RoundedBoxGeometry(w, h, d, 3, arred) : new THREE.BoxGeometry(w, h, d);
  const me = new THREE.Mesh(g, m); me.castShadow = true; me.receiveShadow = true; return me;
};
/** Gerador fixo de números (o vídeo sai igual em toda renderização). */
export const sorteio = (semente: number) => () => { semente = (semente * 1664525 + 1013904223) % 4294967296; return semente / 4294967296; };

function texturaCeu() {
  const c = document.createElement("canvas"); c.width = 16; c.height = 512;
  const g = c.getContext("2d")!; const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, "#050914"); gr.addColorStop(0.55, "#0f1d3a"); gr.addColorStop(0.85, "#24305a"); gr.addColorStop(1, "#3a3560");
  g.fillStyle = gr; g.fillRect(0, 0, 16, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** Texto desenhado num canvas, para placas, relógios e rótulos no mundo. */
export function texturaTexto(texto: string, { cor = "#ff3b3b", fundo = "rgba(0,0,0,0)", fonte = "bold 160px Arial", w = 512, h = 256, borda = "" } = {}) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = fundo; g.fillRect(0, 0, w, h);
  if (borda) { g.strokeStyle = borda; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20); }
  g.font = fonte; g.fillStyle = cor; g.textAlign = "center"; g.textBaseline = "middle";
  g.shadowColor = cor; g.shadowBlur = 24; g.fillText(texto, w / 2, h / 2 + 6);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------------------------------------------------------------- chuva
export class Chuva {
  linhas: any; n: number; base: Float32Array;
  constructor(n = 2500, area = 40, altura = 30) {
    this.n = n; const r = sorteio(9);
    this.base = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) { this.base[i * 4] = (r() - 0.5) * area; this.base[i * 4 + 1] = r() * altura; this.base[i * 4 + 2] = (r() - 0.5) * area; this.base[i * 4 + 3] = 18 + r() * 8; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 6), 3));
    this.linhas = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: "#a9c4f0", transparent: true, opacity: 0.35 }));
    this.linhas.frustumCulled = false;
    (this as any).altura = altura;
  }
  atualizar(t: number, centro: [number, number, number]) {
    const p = this.linhas.geometry.attributes.position.array as Float32Array, h = (this as any).altura;
    for (let i = 0; i < this.n; i++) {
      const x = this.base[i * 4] + centro[0], z = this.base[i * 4 + 2] + centro[2], v = this.base[i * 4 + 3];
      const y = centro[1] - h / 2 + ((this.base[i * 4 + 1] - t * v) % h + h) % h;
      p[i * 6] = x; p[i * 6 + 1] = y; p[i * 6 + 2] = z; p[i * 6 + 3] = x + 0.04; p[i * 6 + 4] = y + 0.55; p[i * 6 + 5] = z;
    }
    this.linhas.geometry.attributes.position.needsUpdate = true;
  }
}

// ---------------------------------------------------------------- cidade
export type JanelaInfo = { predio: number; andar: number; x: number; y: number; z: number; ordem: number; marina: boolean };

export class Cidade {
  cena: any; janelas: any; info: JanelaInfo[] = []; cores: Float32Array; chuva: Chuva;
  lua: any; ceuLuz: any; luzQuarto: any; luzCelular: any; marina: Boneco; rotulo12: any; flash = 0;
  static ANDAR = 3; static TORRE = { w: 12, d: 10, andares: 14 }; static JANELA_MARINA = { andar: 12, x: 1.5 };

  constructor() {
    const cena = new THREE.Scene(); this.cena = cena;
    cena.background = texturaCeu();
    cena.fog = new THREE.FogExp2("#1b2650", 0.0055);
    this.ceuLuz = new THREE.HemisphereLight("#8fa6e8", "#2a2638", 0.95); cena.add(this.ceuLuz);
    this.lua = new THREE.DirectionalLight("#c4d2ff", 1.7); this.lua.position.set(-40, 80, 50); this.lua.castShadow = true;
    Object.assign(this.lua.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 10, far: 220 });
    this.lua.shadow.mapSize.set(2048, 2048); this.lua.shadow.bias = -0.0005; cena.add(this.lua);
    const r = sorteio(33);

    // chão: asfalto, calçadas, parque
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), mat("#1d2232")); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);
    const rua = new THREE.Mesh(new THREE.PlaneGeometry(400, 9), mat("#252a36", { roughness: 0.55 })); rua.rotation.x = -Math.PI / 2; rua.position.set(0, 0.02, 12.5); rua.receiveShadow = true; cena.add(rua);
    for (let x = -190; x < 190; x += 6) { const f = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.22), new THREE.MeshBasicMaterial({ color: "#e0b43c" })); f.rotation.x = -Math.PI / 2; f.position.set(x, 0.03, 12.5); cena.add(f); }
    for (const z of [7.4, 17.6]) { const c = caixa(400, 0.18, 1.6, mat("#3b4152")); c.position.set(0, 0.09, z); cena.add(c); }
    const parque = new THREE.Mesh(new THREE.PlaneGeometry(130, 90), mat("#1d3a33")); parque.rotation.x = -Math.PI / 2; parque.position.set(0, 0.025, 64); parque.receiveShadow = true; cena.add(parque);
    const trilha = new THREE.Mesh(new THREE.PlaneGeometry(3, 90), mat("#4a4a52")); trilha.rotation.x = -Math.PI / 2; trilha.position.set(1.5, 0.04, 64); cena.add(trilha);
    // árvores do parque (copa arredondada, estilo brinquedo)
    const tronco = new THREE.CylinderGeometry(0.25, 0.35, 2.4, 10), copa = new THREE.IcosahedronGeometry(2.2, 1);
    const mT = mat("#4a3426"), mC = mat("#2f6b4f", { flatShading: true });
    for (let i = 0; i < 70; i++) {
      const x = (r() - 0.5) * 120, z = 22 + r() * 80; if (Math.abs(x - 1.5) < 4) continue;
      const tr = new THREE.Mesh(tronco, mT); tr.position.set(x, 1.2, z); tr.castShadow = true; cena.add(tr);
      const cp = new THREE.Mesh(copa, mC); const s = 0.8 + r() * 0.7; cp.scale.set(s, s * 1.1, s); cp.position.set(x, 3.4 + s, z); cp.castShadow = true; cena.add(cp);
    }
    // postes de luz na calçada
    for (let x = -60; x <= 60; x += 15) for (const z of [7.4, 17.6]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 5, 8), mat("#2b2f3a")); p.position.set(x, 2.5, z); cena.add(p);
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), new THREE.MeshBasicMaterial({ color: "#ffd38a" })); l.position.set(x, 5.1, z); cena.add(l);
    }
    for (const x of [-15, 15]) { const pl = new THREE.PointLight("#ffbf6b", 30, 26, 1.6); pl.position.set(x, 5, 9); cena.add(pl); }

    // prédios: a torre da Marina no centro, os outros atrás e dos lados (nunca na frente: ali é o parque)
    const cores = ["#b7b0a6", "#a7b4c4", "#c4a98f", "#9fb3a4", "#b9a3a8", "#c9c2b2", "#8f9fb8"];
    const predios: { x: number; z: number; w: number; d: number; andares: number }[] = [];
    for (let i = 0; i < 46; i++) {
      const x = (r() - 0.5) * 220, z = -14 - r() * 110;
      predios.push({ x, z, w: 9 + r() * 7, d: 9 + r() * 6, andares: 6 + Math.floor(r() * 12) });
    }
    for (const lado of [-1, 1]) for (let k = 0; k < 6; k++) predios.push({ x: lado * (17 + k * 15 + r() * 4), z: -2 + r() * 2, w: 10 + r() * 4, d: 9 + r() * 3, andares: 5 + Math.floor(r() * 10) });

    const janelas: any[] = []; const quad = new THREE.PlaneGeometry(1.5, 1.25);
    const addJanelas = (pi: number, cx: number, cz: number, w: number, d: number, andares: number, pular?: (f: number, x: number) => boolean) => {
      const colsX = Math.max(2, Math.floor(w / 3)), colsZ = Math.max(2, Math.floor(d / 3));
      for (let a = 0; a < andares; a++) {
        const y = a * Cidade.ANDAR + 1.7;
        for (let c = 0; c < colsX; c++) {
          const x = cx - w / 2 + (c + 0.5) * (w / colsX);
          if (!(pular && pular(a + 1, x))) janelas.push({ pi, a: a + 1, x, y, z: cz + d / 2 + 0.03, ry: 0 });
          janelas.push({ pi, a: a + 1, x, y, z: cz - d / 2 - 0.03, ry: Math.PI });
        }
        for (let c = 0; c < colsZ; c++) {
          const z = cz - d / 2 + (c + 0.5) * (d / colsZ);
          janelas.push({ pi, a: a + 1, x: cx + w / 2 + 0.03, y, z, ry: Math.PI / 2 });
          janelas.push({ pi, a: a + 1, x: cx - w / 2 - 0.03, y, z, ry: -Math.PI / 2 });
        }
      }
    };
    predios.forEach((p, i) => {
      const b = caixa(p.w, p.andares * Cidade.ANDAR, p.d, mat(cores[i % cores.length]), 0.35); b.position.set(p.x, (p.andares * Cidade.ANDAR) / 2, p.z); cena.add(b);
      addJanelas(i + 1, p.x, p.z, p.w, p.d, p.andares);
    });
    this.torreDaMarina(cena);
    const T = Cidade.TORRE, JM = Cidade.JANELA_MARINA;
    addJanelas(0, 0, 0, T.w, T.d, T.andares, (f, x) => f === JM.andar && Math.abs(x - JM.x) < 0.1);

    this.janelas = new THREE.InstancedMesh(quad, new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false, fog: false }), janelas.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(1, 1, 1);
    janelas.forEach((j, i) => {
      e.set(0, j.ry, 0); q.setFromEuler(e); m.compose(new THREE.Vector3(j.x, j.y, j.z), q, s); this.janelas.setMatrixAt(i, m);
      // ordem de acender: os mais perto da torre primeiro, com um pouco de acaso
      const dist = Math.hypot(j.x, j.z) / 120;
      this.info.push({ predio: j.pi, andar: j.a, x: j.x, y: j.y, z: j.z, ordem: Math.min(1, dist * 0.7 + r() * 0.45), marina: false });
    });
    this.cores = new Float32Array(janelas.length * 3);
    this.janelas.instanceColor = new THREE.InstancedBufferAttribute(this.cores, 3);
    cena.add(this.janelas);

    this.chuva = new Chuva(3000, 46, 34); cena.add(this.chuva.linhas);

    // rótulo "12º ANDAR" que aparece ao lado da janela dela
    const tex = texturaTexto("12º ANDAR", { cor: "#ffffff", fundo: "rgba(10,12,20,0.75)", borda: "#ff3b3b", fonte: "bold 110px Arial", w: 640, h: 200 });
    this.rotulo12 = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    this.rotulo12.scale.set(5.2, 1.62, 1); this.rotulo12.position.set(JM.x, (JM.andar - 1) * Cidade.ANDAR + 1.7 + 2.6, Cidade.TORRE.d / 2 + 1.2); this.rotulo12.visible = false;
    cena.add(this.rotulo12);
  }

  /** Torre da Marina: maciça, com um "buraco" no 12º andar onde fica o quarto dela, visto de fora. */
  private torreDaMarina(cena: any) {
    const T = Cidade.TORRE, A = Cidade.ANDAR, JM = Cidade.JANELA_MARINA;
    const m = mat("#a9a49a"), y0 = (JM.andar - 1) * A, y1 = y0 + A, h = T.andares * A, zf = T.d / 2;
    const bloco = (x0: number, x1: number, ya: number, yb: number, za: number, zb: number) => { const b = caixa(x1 - x0, yb - ya, zb - za, m); b.position.set((x0 + x1) / 2, (ya + yb) / 2, (za + zb) / 2); cena.add(b); };
    bloco(-T.w / 2, T.w / 2, 0, y0, -zf, zf);                    // embaixo do 12º
    bloco(-T.w / 2, T.w / 2, y1, h, -zf, zf);                    // em cima
    bloco(-T.w / 2, T.w / 2, y0, y1, -zf, 1.8);                  // fundo do andar
    bloco(-T.w / 2, -0.6, y0, y1, 1.8, zf); bloco(3.6, T.w / 2, y0, y1, 1.8, zf); // lados do quarto
    const wx0 = JM.x - 0.8, wx1 = JM.x + 0.8, wy0 = y0 + 1.05, wy1 = y0 + 2.35;
    bloco(-0.6, wx0, y0, y1, zf - 0.3, zf); bloco(wx1, 3.6, y0, y1, zf - 0.3, zf);
    bloco(wx0, wx1, y0, wy0, zf - 0.3, zf); bloco(wx0, wx1, wy1, y1, zf - 0.3, zf);
    // laje do telhado e caixa d'água (detalhe de prédio paulistano)
    const cx = caixa(4, 2.2, 3, mat("#8d877c"), 0.2); cx.position.set(-2.5, h + 1.1, -1); cena.add(cx);
    // o quarto por dentro (paredes viradas para dentro)
    const quarto = new THREE.Mesh(new THREE.BoxGeometry(4.2, A - 0.02, 2.9), new THREE.MeshStandardMaterial({ color: "#d9b98f", side: THREE.BackSide, roughness: 0.9 }));
    quarto.position.set(1.5, y0 + A / 2, 1.8 + 1.45); quarto.receiveShadow = true; cena.add(quarto);
    const cama = caixa(1.9, 0.6, 1.3, mat("#e8e2d6"), 0.12); cama.position.set(1.6, y0 + 0.3, 3.2); cena.add(cama);
    const vidro = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.3), new THREE.MeshStandardMaterial({ color: "#ffe6b0", transparent: true, opacity: 0.12, roughness: 0.1 }));
    vidro.position.set(JM.x, (wy0 + wy1) / 2, zf + 0.01); cena.add(vidro);
    const moldura = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.3, 0.08), mat("#3a3a40")); moldura.position.set(JM.x, (wy0 + wy1) / 2, zf + 0.02); cena.add(moldura);
    this.luzQuarto = new THREE.PointLight("#ffc98a", 14, 7, 1.5); this.luzQuarto.position.set(1.5, y0 + 2.6, 3.4); cena.add(this.luzQuarto);
    this.marina = new Boneco(APARENCIAS.marina);
    this.marina.raiz.position.set(1.5, y0 + 0.12, 3.15); this.marina.raiz.rotation.y = 0.45;
    this.marina.posar(POSES.sentada_celular(0)); this.marina.segurarCelular(true);
    cena.add(this.marina.raiz);
    this.luzCelular = new THREE.PointLight("#8fbfff", 2.5, 1.8, 2); cena.add(this.luzCelular);
  }

  /** Estado das janelas: luz (0 a 1), celular aceso (0 a 1). */
  pintarJanelas(fn: (j: JanelaInfo) => { luz: number; celular: number }) {
    const escuro = [0.012, 0.016, 0.03], quente = [1.0, 0.72, 0.32], cel = [0.25, 0.55, 1.0];
    this.info.forEach((j, i) => {
      const { luz, celular } = fn(j);
      for (let k = 0; k < 3; k++) this.cores[i * 3 + k] = escuro[k] + (quente[k] - escuro[k]) * luz + cel[k] * celular * 0.07 * (1 - luz);
    });
    this.janelas.instanceColor.needsUpdate = true;
  }

  atualizar(t: number, centroChuva: [number, number, number], flash = 0) {
    this.chuva.atualizar(t, centroChuva);
    this.ceuLuz.intensity = 0.95 + flash * 5;
    this.lua.intensity = 1.7 + flash * 4;
    this.marina.posar({ ...POSES.sentada_celular(t), cabeca: [22, 0, Math.sin(t * 0.8) * 3] });
    this.marina.segurarCelular(true);
    const p = new THREE.Vector3(); this.marina.celular.getWorldPosition(p); this.luzCelular.position.copy(p).add(new THREE.Vector3(0.1, 0.1, 0));
  }
}

// ---------------------------------------------------------------- quarto da Marina (cenário de dentro)
export class Quarto {
  cena: any; marina: Boneco; luzCelular: any; luaLuz: any; chuva: Chuva; relogio: any; celularCama: any; telaCama: any; cortinaE: any; cortinaD: any; ceuLuz: any;
  constructor() {
    const cena = new THREE.Scene(); this.cena = cena;
    cena.background = new THREE.Color("#05070d");
    this.ceuLuz = new THREE.HemisphereLight("#6b7fc0", "#1a1620", 0.4); cena.add(this.ceuLuz);
    const W = 4.6, H = 3, D = 5;
    const piso = caixa(W, 0.1, D, mat("#5b4636", { roughness: 0.6 })); piso.position.set(0, -0.05, 0); cena.add(piso);
    const parede = mat("#3b4766");
    const pFundo = (x0: number, x1: number, y0: number, y1: number) => { const b = caixa(x1 - x0, y1 - y0, 0.15, parede); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, -D / 2); cena.add(b); };
    // parede da janela (com o vão de 2,4 x 1,7 m)
    pFundo(-W / 2, -1.2, 0, H); pFundo(1.2, W / 2, 0, H); pFundo(-1.2, 1.2, 0, 0.8); pFundo(-1.2, 1.2, 2.5, H);
    for (const x of [-W / 2, W / 2]) { const b = caixa(0.15, H, D, parede); b.position.set(x, H / 2, 0); cena.add(b); }
    const teto = caixa(W, 0.1, D, mat("#2a3350")); teto.position.set(0, H, 0); cena.add(teto);
    const traseira = caixa(W, H, 0.15, parede); traseira.position.set(0, H / 2, D / 2); cena.add(traseira);
    // janela: moldura, vidro e a cidade lá fora
    const mold = mat("#d8dde6");
    for (const [w, h, x, y] of [[2.5, 0.08, 0, 0.8], [2.5, 0.08, 0, 2.5], [0.08, 1.7, -1.2, 1.65], [0.08, 1.7, 1.2, 1.65], [0.06, 1.7, 0, 1.65]] as const) { const b = caixa(w, h, 0.12, mold); b.position.set(x, y, -D / 2 + 0.05); cena.add(b); }
    const fora = new THREE.Mesh(new THREE.PlaneGeometry(60, 34), new THREE.MeshBasicMaterial({ map: this.texturaCidadeLaFora() }));
    fora.position.set(0, 6, -D / 2 - 18); cena.add(fora);
    this.chuva = new Chuva(900, 8, 8); cena.add(this.chuva.linhas);
    // cortinas
    const cortina = (x: number) => {
      const g = new THREE.PlaneGeometry(0.9, 2.3, 24, 1); const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 18) * 0.04);
      g.computeVertexNormals();
      const c = new THREE.Mesh(g, mat("#7d8fb0", { side: THREE.DoubleSide, roughness: 1 })); c.position.set(x, 1.7, -D / 2 + 0.25); c.castShadow = true; cena.add(c); return c;
    };
    this.cortinaE = cortina(-1.45); this.cortinaD = cortina(1.45);
    // cama, criado-mudo e relógio 3:33
    const estrado = caixa(1.7, 0.25, 2.2, mat("#4b3a30"), 0.05); estrado.position.set(0.2, 0.12, -0.4); cena.add(estrado);
    const colchao = caixa(1.6, 0.18, 2.1, mat("#e9e4dc"), 0.08); colchao.position.set(0.2, 0.33, -0.4); cena.add(colchao);
    const cobertor = caixa(1.65, 0.12, 1.3, mat("#3f5a8c"), 0.06); cobertor.position.set(0.2, 0.45, 0.05); cena.add(cobertor);
    const trav = caixa(0.6, 0.16, 0.4, mat("#f4f1ea"), 0.07); trav.position.set(0.2, 0.5, 0.45); cena.add(trav);
    const criado = caixa(0.55, 0.6, 0.45, mat("#5a4434"), 0.04); criado.position.set(-1.3, 0.3, -1.6); cena.add(criado);
    this.relogio = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.14), new THREE.MeshBasicMaterial({ map: texturaTexto("3:33", { cor: "#ff3b3b", fundo: "#0b0b0e", fonte: "bold 170px Arial" }) }));
    const caixaRel = caixa(0.36, 0.17, 0.1, mat("#1a1a1f"), 0.02); caixaRel.position.set(-1.3, 0.69, -1.55); cena.add(caixaRel);
    this.relogio.position.set(-1.3, 0.69, -1.497); cena.add(this.relogio);
    const luzRel = new THREE.PointLight("#ff4040", 0.6, 1.2, 2); luzRel.position.set(-1.3, 0.75, -1.3); cena.add(luzRel);
    // luar entrando pela janela
    this.luaLuz = new THREE.SpotLight("#9fb6ff", 22, 14, 0.6, 0.6, 1.2); this.luaLuz.position.set(1.5, 4.5, -D / 2 - 3); this.luaLuz.target.position.set(0, 0, 0.5);
    this.luaLuz.castShadow = true; this.luaLuz.shadow.mapSize.set(1024, 1024); cena.add(this.luaLuz); cena.add(this.luaLuz.target);
    // a Marina
    this.marina = new Boneco(APARENCIAS.marina); cena.add(this.marina.raiz);
    this.luzCelular = new THREE.PointLight("#7fb0ff", 0.45, 2.2, 2); cena.add(this.luzCelular);
    // celular deitado na cama (para a cena da vibração)
    this.celularCama = new THREE.Group();
    const corpo = caixa(0.16, 0.02, 0.32, mat("#0f1116", { roughness: 0.25 }), 0.008); this.celularCama.add(corpo);
    this.telaCama = new THREE.Mesh(new THREE.PlaneGeometry(0.145, 0.3), new THREE.MeshBasicMaterial({ color: "#a8ccff" })); this.telaCama.rotation.x = -Math.PI / 2; this.telaCama.position.y = 0.011; this.celularCama.add(this.telaCama);
    this.celularCama.position.set(0.6, 0.43, -1.05); this.celularCama.rotation.y = 0.4; cena.add(this.celularCama);
  }

  private texturaCidadeLaFora() {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 600; const g = c.getContext("2d")!; const r = sorteio(5);
    const gr = g.createLinearGradient(0, 0, 0, 600); gr.addColorStop(0, "#060b18"); gr.addColorStop(1, "#1c2547"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 600);
    let x = -20;
    while (x < 1040) {
      const w = 50 + r() * 90, h = 160 + r() * 330; g.fillStyle = `rgb(${18 + r() * 10},${22 + r() * 10},${38 + r() * 14})`; g.fillRect(x, 600 - h, w, h);
      for (let yy = 600 - h + 12; yy < 590; yy += 18) for (let xx = x + 8; xx < x + w - 10; xx += 14) if (r() < 0.22) { g.fillStyle = r() < 0.75 ? "#ffcf7a" : "#7fb2ff"; g.fillRect(xx, yy, 7, 9); }
      x += w + 6;
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  atualizar(t: number, flash = 0) {
    this.chuva.atualizar(t, [0, 3, -2.5 - 4]);
    this.ceuLuz.intensity = 0.45 + flash * 3; this.luaLuz.intensity = 9 + flash * 300;
    const ondula = Math.sin(t * 1.3) * 0.03; this.cortinaE.rotation.y = ondula; this.cortinaD.rotation.y = -ondula;
    if (this.marina.celular.visible) { const p = new THREE.Vector3(); this.marina.celular.getWorldPosition(p); this.luzCelular.position.copy(p).add(new THREE.Vector3(0, 0.12, 0.18)); }
  }
}
