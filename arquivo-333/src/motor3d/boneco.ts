// Personagem 3D estilo desenho: cabeça grande e redonda, corpo de cápsulas, rosto simples (olhos, sobrancelhas, boca).
// Tudo tem "juntas" (grupos) para posar: pescoço, ombros, cotovelos, quadris e joelhos.
import * as THREE from "three";

export type Aparencia = {
  pele: string; cabelo: string; roupa: string; calca: string; tenis: string;
  penteado?: "chanel" | "curto" | "careca" | "coque"; capuz?: boolean; altura?: number;
  bone?: string;      // cor do boné (porteiro); sem isso, sem boné
  bigode?: boolean;   // Seu Álvaro
  oculos?: boolean;
};
export type Pose = {
  cabeca?: [number, number, number];        // rotação x (cima/baixo), y (lados), z (inclinar), em graus
  tronco?: [number, number, number];
  bracoE?: [number, number, number]; bracoD?: [number, number, number]; // ombro (x frente/trás, y, z abre)
  cotoveloE?: number; cotoveloD?: number;
  pernaE?: [number, number, number]; pernaD?: [number, number, number];
  joelhoE?: number; joelhoD?: number;
  olhos?: number;        // 1 = normal, 1.4 = arregalados, 0.2 = quase fechados
  boca?: "neutra" | "aberta" | "medo" | "triste";
  sobrancelha?: number;  // -1 brava, 0 neutra, 1 preocupada
  respira?: number;      // tempo, para o peito subir e descer
};

const mat = (cor: string, extra: Record<string, unknown> = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.75, metalness: 0, ...extra });
const capsula = (r: number, comp: number, m: any) => { const g = new THREE.CapsuleGeometry(r, comp, 8, 16); const me = new THREE.Mesh(g, m); me.castShadow = true; me.receiveShadow = true; return me; };
const esfera = (r: number, m: any, seg = 32) => { const me = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), m); me.castShadow = true; me.receiveShadow = true; return me; };
const rad = (g: number) => (g * Math.PI) / 180;

export class Boneco {
  raiz: any; quadril: any; tronco: any; pescoco: any; cabeca: any;
  ombroE: any; ombroD: any; cotE: any; cotD: any; maoE: any; maoD: any;
  pernaE: any; pernaD: any; joelhoE: any; joelhoD: any;
  olhoE: any; olhoD: any; brilhoE: any; brilhoD: any; sobE: any; sobD: any; boca: any; bocaAberta: any;
  celular: any; telaCelular: any;

  constructor(a: Aparencia) {
    const pele = mat(a.pele), roupa = mat(a.roupa, { roughness: 0.9 }), calca = mat(a.calca, { roughness: 0.9 }), tenis = mat(a.tenis), cabelo = mat(a.cabelo, { roughness: 0.6 });
    const escuro = mat("#15161c", { roughness: 0.3 }), branco = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const s = a.altura ?? 1;
    this.raiz = new THREE.Group();
    this.raiz.scale.setScalar(s);

    // quadril e pernas
    this.quadril = new THREE.Group(); this.quadril.position.y = 0.66; this.raiz.add(this.quadril);
    const bacia = capsula(0.17, 0.16, calca); bacia.rotation.z = Math.PI / 2; this.quadril.add(bacia);
    const perna = (lado: number) => {
      const p = new THREE.Group(); p.position.set(0.1 * lado, -0.02, 0); this.quadril.add(p);
      const coxa = capsula(0.085, 0.2, calca); coxa.position.y = -0.16; p.add(coxa);
      const j = new THREE.Group(); j.position.y = -0.32; p.add(j);
      const canela = capsula(0.075, 0.18, calca); canela.position.y = -0.14; j.add(canela);
      const pe = capsula(0.07, 0.1, tenis); pe.rotation.x = Math.PI / 2; pe.position.set(0, -0.3, 0.05); j.add(pe);
      return [p, j];
    };
    [this.pernaE, this.joelhoE] = perna(1); [this.pernaD, this.joelhoD] = perna(-1);

    // tronco (moletom)
    this.tronco = new THREE.Group(); this.tronco.position.y = 0.06; this.quadril.add(this.tronco);
    const peito = capsula(0.2, 0.26, roupa); peito.position.y = 0.24; peito.scale.set(1.08, 1, 0.85); this.tronco.add(peito);
    if (a.capuz !== false) { const capuz = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.05, 12, 24), roupa); capuz.position.set(0, 0.52, -0.05); capuz.rotation.x = Math.PI / 2.4; capuz.castShadow = true; this.tronco.add(capuz); }

    // braços
    const braco = (lado: number) => {
      const o = new THREE.Group(); o.position.set(0.25 * lado, 0.44, 0); this.tronco.add(o);
      const sup = capsula(0.065, 0.16, roupa); sup.position.y = -0.12; o.add(sup);
      const c = new THREE.Group(); c.position.y = -0.25; o.add(c);
      const ante = capsula(0.058, 0.14, roupa); ante.position.y = -0.1; c.add(ante);
      const mao = esfera(0.058, pele, 20); mao.position.y = -0.22; c.add(mao);
      return [o, c, mao];
    };
    [this.ombroE, this.cotE, this.maoE] = braco(1); [this.ombroD, this.cotD, this.maoD] = braco(-1);

    // cabeça
    this.pescoco = new THREE.Group(); this.pescoco.position.y = 0.56; this.tronco.add(this.pescoco);
    const pesc = capsula(0.06, 0.06, pele); pesc.position.y = 0.03; this.pescoco.add(pesc);
    this.cabeca = new THREE.Group(); this.cabeca.position.y = 0.33; this.pescoco.add(this.cabeca);
    const cranio = esfera(0.3, pele, 48); cranio.scale.set(1, 1.02, 0.96); this.cabeca.add(cranio);
    const orelha = (lado: number) => { const o = esfera(0.06, pele, 16); o.scale.set(0.5, 1, 0.8); o.position.set(0.29 * lado, -0.02, 0); this.cabeca.add(o); };
    orelha(1); orelha(-1);
    const nariz = esfera(0.035, pele, 16); nariz.position.set(0, -0.04, 0.29); this.cabeca.add(nariz);
    const olho = (lado: number) => {
      const o = esfera(0.05, escuro, 20); o.scale.set(0.85, 1.15, 0.5); o.position.set(0.105 * lado, 0.03, 0.278); this.cabeca.add(o);
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), branco); b.position.set(0.105 * lado + 0.014, 0.06, 0.3); this.cabeca.add(b);
      const sob = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.06, 4, 8), mat(a.cabelo)); sob.rotation.z = Math.PI / 2; sob.position.set(0.105 * lado, 0.13, 0.272); this.cabeca.add(sob);
      return [o, b, sob];
    };
    [this.olhoE, this.brilhoE, this.sobE] = olho(1); [this.olhoD, this.brilhoD, this.sobD] = olho(-1);
    this.boca = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.009, 8, 24, Math.PI), escuro); this.boca.position.set(0, -0.12, 0.282); this.boca.rotation.z = Math.PI; this.cabeca.add(this.boca);
    this.bocaAberta = esfera(0.035, mat("#3a1418"), 20); this.bocaAberta.scale.set(0.9, 1.2, 0.4); this.bocaAberta.position.set(0, -0.13, 0.28); this.bocaAberta.visible = false; this.cabeca.add(this.bocaAberta);

    // cabelo
    const pent = a.penteado ?? "chanel";
    if (pent !== "careca") {
      const topo = new THREE.Mesh(new THREE.SphereGeometry(0.318, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.42), cabelo); topo.rotation.x = -0.38; topo.castShadow = true; this.cabeca.add(topo);
      if (pent === "chanel") {
        const lado = (l: number) => { const p = esfera(0.16, cabelo, 24); p.scale.set(0.55, 1.3, 1.05); p.position.set(0.24 * l, -0.06, -0.04); this.cabeca.add(p); };
        lado(1); lado(-1);
        const nuca = esfera(0.26, cabelo, 32); nuca.scale.set(1.12, 1.05, 0.7); nuca.position.set(0, -0.06, -0.14); this.cabeca.add(nuca);
        for (let k = 0; k < 7; k++) { const c = esfera(0.075, cabelo, 16); const ang = -1.2 + k * 0.4; c.position.set(Math.sin(ang) * 0.29, -0.2 - (k % 2) * 0.03, Math.cos(ang) * -0.12 - 0.05); this.cabeca.add(c); }
        const franja = esfera(0.16, cabelo, 24); franja.scale.set(1.25, 0.42, 0.7); franja.position.set(0.06, 0.25, 0.16); franja.rotation.z = -0.25; this.cabeca.add(franja);
      }
      if (pent === "coque") {
        const c = esfera(0.11, cabelo, 20); c.position.set(0, 0.3, -0.12); this.cabeca.add(c);
        // a parte de trás da cabeça também tem cabelo (aparece quando a personagem está de costas)
        const nuca = esfera(0.27, cabelo, 32); nuca.scale.set(1.12, 1.02, 0.78); nuca.position.set(0, -0.01, -0.12); this.cabeca.add(nuca);
      }
    }
    if (a.bone) {
      const mb = mat(a.bone, { roughness: 0.7 });
      const copa = new THREE.Mesh(new THREE.SphereGeometry(0.325, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.45), mb); copa.rotation.x = -0.12; copa.castShadow = true; this.cabeca.add(copa);
      const aba = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32, 1, false, -Math.PI / 2, Math.PI), mb); aba.position.set(0, 0.17, 0.21); aba.rotation.x = -0.22; aba.scale.set(1, 1, 1.1); aba.castShadow = true; this.cabeca.add(aba);
    }
    if (a.bigode) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.1, 6, 12), mat(a.cabelo)); b.rotation.z = Math.PI / 2; b.position.set(0, -0.085, 0.29); this.cabeca.add(b); }
    if (a.oculos) {
      const mo = mat("#1b1b1f", { roughness: 0.4 });
      for (const l of [1, -1]) { const aro = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.009, 8, 24), mo); aro.position.set(0.105 * l, 0.035, 0.3); this.cabeca.add(aro); }
      const ponte = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.08, 6), mo); ponte.rotation.z = Math.PI / 2; ponte.position.set(0, 0.045, 0.305); this.cabeca.add(ponte);
    }

    // celular (fica na mão direita; aparece só quando a pose pede)
    this.celular = new THREE.Group();
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.15, 0.012), mat("#0f1116", { roughness: 0.25 })); corpo.castShadow = true; this.celular.add(corpo);
    this.telaCelular = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.138), new THREE.MeshBasicMaterial({ color: "#9cc8ff" }));
    this.telaCelular.position.z = 0.0065; this.celular.add(this.telaCelular);
    this.celular.visible = false;
    this.raiz.add(this.celular);
  }

  posar(p: Pose) {
    const set = (g: any, r?: [number, number, number]) => { const v = r ?? [0, 0, 0]; g.rotation.set(rad(v[0]), rad(v[1]), rad(v[2])); };
    set(this.cabeca, p.cabeca); set(this.tronco, p.tronco);
    set(this.ombroE, p.bracoE ?? [0, 0, 8]); set(this.ombroD, p.bracoD ?? [0, 0, -8]);
    this.cotE.rotation.set(rad(-(p.cotoveloE ?? 10)), 0, 0); this.cotD.rotation.set(rad(-(p.cotoveloD ?? 10)), 0, 0);
    set(this.pernaE, p.pernaE); set(this.pernaD, p.pernaD);
    this.joelhoE.rotation.set(rad(p.joelhoE ?? 0), 0, 0); this.joelhoD.rotation.set(rad(p.joelhoD ?? 0), 0, 0);
    const o = p.olhos ?? 1;
    for (const olho of [this.olhoE, this.olhoD]) olho.scale.set(0.85 * (0.85 + 0.15 * o), 1.15 * o, 0.5);
    for (const b of [this.brilhoE, this.brilhoD]) b.scale.setScalar(Math.min(1.3, o));
    const sb = p.sobrancelha ?? 0;
    this.sobE.rotation.z = Math.PI / 2 + sb * 0.35; this.sobD.rotation.z = Math.PI / 2 - sb * 0.35;
    this.sobE.position.y = this.sobD.position.y = 0.13 + Math.max(0, sb) * 0.02 + (o > 1.1 ? 0.02 : 0);
    const b = p.boca ?? "neutra";
    this.boca.visible = b === "neutra" || b === "triste";
    this.boca.rotation.z = 0; this.boca.scale.set(1, b === "neutra" ? 0.25 : 1, 1);
    this.boca.position.y = b === "triste" ? -0.15 : -0.12;
    this.bocaAberta.visible = b === "aberta" || b === "medo";
    this.bocaAberta.scale.set(b === "medo" ? 0.8 : 0.9, b === "medo" ? 1.6 : 1.1, 0.4);
    const r = p.respira ?? 0;
    this.tronco.scale.set(1, 1 + Math.sin(r * 2.2) * 0.012, 1);
  }

  /** Põe o celular na mão direita (coordenadas do mundo) com a tela virada para o rosto. */
  segurarCelular(visivel: boolean) {
    this.celular.visible = visivel;
    if (!visivel) return;
    this.raiz.updateMatrixWorld(true);
    const m = new THREE.Vector3(); this.maoD.getWorldPosition(m);
    const inv = new THREE.Matrix4().copy(this.raiz.matrixWorld).invert();
    m.applyMatrix4(inv);
    this.celular.position.set(m.x - 0.02, m.y + 0.08, m.z + 0.04);
    this.celular.rotation.set(-0.55, 0.15, 0);
  }
}

export const APARENCIAS: Record<string, Aparencia> = {
  marina: { pele: "#c98e6a", cabelo: "#6a4029", roupa: "#9aa3ad", calca: "#1f2a44", tenis: "#e8e8e8", penteado: "chanel" },
  // Rafa, o porteiro da noite: jaqueta azul-marinho do uniforme e boné
  rafa: { pele: "#8a5a3c", cabelo: "#16100c", roupa: "#24344f", calca: "#1d2027", tenis: "#121214", penteado: "curto", capuz: false, bone: "#1c2638" },
  // Bia, do 1102: estudante, moletom vinho, coque
  bia: { pele: "#e2b48e", cabelo: "#6b2f1a", roupa: "#7a2e3a", calca: "#2b2f3a", tenis: "#f0f0f0", penteado: "coque" },
  // Seu Álvaro, do 1201: aposentado, cabelo e bigode brancos, óculos, cardigã marrom
  alvaro: { pele: "#d9a98a", cabelo: "#d6d6d6", roupa: "#6b5843", calca: "#3d3a36", tenis: "#4a3b2c", penteado: "curto", capuz: false, bigode: true, oculos: true, altura: 0.96 },
  // Dona Cida, a síndica: coque grisalho, blusa verde-escura
  cida: { pele: "#b8805f", cabelo: "#8d8580", roupa: "#2f5f5a", calca: "#2a2a30", tenis: "#3a3030", penteado: "coque", capuz: false, oculos: true, altura: 0.94 },
};

// Poses prontas
export const POSES: Record<string, (t: number) => Pose> = {
  em_pe: (t) => ({ respira: t, bracoE: [0, 0, 6], bracoD: [0, 0, -6] }),
  sentada_celular: (t) => ({ respira: t, cabeca: [18, 0, 0], tronco: [8, 0, 0], pernaE: [-88, 0, 4], pernaD: [-88, 0, -4], joelhoE: 88, joelhoD: 88,
    bracoE: [-48, 0, -14], bracoD: [-52, 0, 18], cotoveloE: 70, cotoveloD: 72 }),
  // em pé fechando a cortina: braços abertos para a frente, segurando os panos
  fechando_cortina: (t) => ({ respira: t, cabeca: [4, 0, 0], bracoE: [-82, 0, 38], bracoD: [-82, 0, -38], cotoveloE: 18, cotoveloD: 18 }),
  // em pé puxando a porta com as duas mãos, corpo para trás
  puxando_porta: (t) => ({ respira: t, tronco: [-10, 0, 0], cabeca: [6, 0, 0], bracoE: [-78, 0, -6], bracoD: [-78, 0, 6], cotoveloE: 12, cotoveloD: 12,
    pernaE: [18, 0, 0], pernaD: [-14, 0, 0], joelhoE: 10, joelhoD: 4, olhos: 1.3, sobrancelha: 1 }),
  // sentado gravando áudio: celular perto da boca
  gravando_audio: (t) => ({ respira: t, cabeca: [6, 0, 0], tronco: [4, 0, 0], pernaE: [-88, 0, 4], pernaD: [-88, 0, -4], joelhoE: 88, joelhoD: 88,
    bracoE: [-30, 0, -8], bracoD: [-112, 0, 22], cotoveloE: 50, cotoveloD: 118, olhos: 1.15, sobrancelha: 0.8, boca: "aberta" }),
  // andando (pernas e braços alternam; use a posição da raiz para avançar)
  andando: (t) => { const a = Math.sin(t * 6.5); return { respira: t, cabeca: [4, 0, 0], pernaE: [a * 24, 0, 0], pernaD: [-a * 24, 0, 0], joelhoE: Math.max(0, -a) * 32, joelhoD: Math.max(0, a) * 32,
    bracoE: [-a * 22, 0, 6], bracoD: [a * 22, 0, -6], cotoveloE: 15, cotoveloD: 15 }; },
  // batendo na porta com a mão direita
  batendo_porta: (t) => ({ respira: t, cabeca: [2, 0, 0], bracoD: [-92, 0, -12], cotoveloD: 68 + Math.max(0, Math.sin(t * 13)) * 38, bracoE: [0, 0, 6] }),
  sentada_olhando_cima: (t) => ({ respira: t, cabeca: [-10, 0, 0], tronco: [0, 0, 0], pernaE: [-88, 0, 4], pernaD: [-88, 0, -4], joelhoE: 88, joelhoD: 88,
    bracoE: [-30, 0, -10], bracoD: [-34, 0, 12], cotoveloE: 60, cotoveloD: 62, olhos: 1.3 }),
};
