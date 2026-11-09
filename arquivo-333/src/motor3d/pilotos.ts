// Cenários dos pilotos da próxima série (04/11/2026): o vagão de metrô ("Próxima estação"), o estúdio de rádio
// ("Rádio Madrugada") e a locadora de fitas ("A Locadora de Amanhã"). Mesmo motor, mesmos bonecos; cada cenário é
// montado uma vez e reaproveitado em todos os quadros. Os planos (tomadas de câmera) ficam no fim do arquivo.
import * as THREE from "three";
import { Boneco, APARENCIAS, POSES, type Pose } from "./boneco";
import { caixa, mat, sorteio } from "./cenario";
import type { Mundo, Plano } from "./planos";

type V3 = [number, number, number];
const lim = (x: number) => Math.max(0, Math.min(1, x));
const suave = (x: number) => { const t = lim(x); return t * t * (3 - 2 * t); };
const mix = (a: V3, b: V3, p: number): V3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
const rad = (g: number) => (g * Math.PI) / 180;

const tela = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
const textura = (c: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
const emissivo = (map: any) => new THREE.MeshBasicMaterial({ map, toneMapped: false });
const cilindro = (r: number, h: number, m: any, seg = 14) => { const me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); me.castShadow = true; return me; };
/** Cilindro fino entre dois pontos (braços de microfone, canos). */
function barra(a: V3, b: V3, r: number, m: any) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), d = vb.clone().sub(va);
  const me = cilindro(r, d.length(), m, 10);
  me.position.copy(va.clone().add(vb).multiplyScalar(0.5));
  me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return me;
}
const cromo = () => mat("#c4c9d0", { metalness: 0.9, roughness: 0.25 });

// ================================================================ vagão de metrô
export class Vagao {
  cena: any; lia: Boneco; segmentos: any[] = []; luzes: any[] = []; argolas: any[] = [];
  lampadasExt: { m: any; z0: number; lado: number }[] = []; tunelDireito: any; plat: any; postes: any[] = []; gente: { b: Boneco; x0: number; k: number; tilt: number }[] = [];
  estPass: { g: any; c: HTMLCanvasElement; placa: any }[] = []; estNum = 0; luzPlat2: any; tubosPlat: { m: any; k: number }[] = [];
  telaPainel: HTMLCanvasElement; texPainel: any; telaMapa: HTMLCanvasElement; texMapa: any;
  portas: any[] = []; fundoPorta: any; luzPorta: any; luzPlat: any;
  luzLia: any; perto!: Boneco; apagadas = 0; retos = 0; ponteiroSeg: any;
  fila: Boneco[] = []; cabine!: any; luzCabine: any; vidroTela!: HTMLCanvasElement; vidroTex: any; painelCab!: HTMLCanvasElement; painelCabTex: any; frestaPorta: any; pesFresta: any[] = []; leds: any[] = []; placaCab: any; mesaCab: any[] = [];
  static W = 2.7; static L = 12; static H = 2.35;

  constructor() {
    const cena = new THREE.Scene(); this.cena = cena; cena.background = new THREE.Color("#030508"); cena.fog = new THREE.FogExp2("#04070a", 0.014);
    const { W, L, H } = Vagao;
    cena.add(new THREE.HemisphereLight("#7f93ad", "#14171c", 0.2));
    const piso = caixa(W, 0.06, L, mat("#2f333b", { roughness: 0.5 })); piso.position.y = -0.03; cena.add(piso);
    for (const x of [-0.62, 0.62]) { const f = caixa(0.05, 0.01, L, mat("#d9b53a")); f.position.set(x, 0.005, 0); cena.add(f); }
    const teto = caixa(W, 0.08, L, mat("#d4d8dd")); teto.position.y = H; cena.add(teto);
    // luzes frias do teto (5 trechos por lado) e um ponto de luz por trecho
    for (let k = 0; k < 5; k++) {
      const z = -4.8 + k * 2.4;
      for (const x of [-0.45, 0.45]) {
        const m = new THREE.MeshBasicMaterial({ color: "#aebdd0", toneMapped: false });
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 1.7), m); l.position.set(x, H - 0.05, z); cena.add(l); this.segmentos.push({ m, k });
      }
      const p = new THREE.PointLight("#bcd4ee", 1.5, 6, 1.4); p.position.set(0, H - 0.3, z); cena.add(p); this.luzes.push(p);
    }
    // paredes: base, faixa de cima e pilares entre as janelas (os vãos mostram a plataforma ou o túnel)
    const parede = mat("#aeb4bb"), banco = mat("#52627a"), baseBanco = mat("#1b1f27");
    for (const lado of [-1, 1]) {
      const x = lado * (W / 2 + 0.05);
      const b = caixa(0.1, 0.95, L, parede); b.position.set(x, 0.475, 0); cena.add(b);
      const t = caixa(0.1, 0.27, L, parede); t.position.set(x, H - 0.135, 0); cena.add(t);
      for (const z of [-5.9, 5.9]) { const pl = caixa(0.1, 1.13, z === 5.9 || z === -5.9 ? 0.2 : 0.3, parede); pl.position.set(x, 1.515, z); cena.add(pl); }
      for (const z of [-4, 0, 4]) {
        const s = caixa(0.5, 0.08, 3.2, banco, 0.02); s.position.set(lado * (W / 2 - 0.26), 0.46, z); cena.add(s);
        const bs = caixa(0.46, 0.4, 3.2, baseBanco); bs.position.set(lado * (W / 2 - 0.26), 0.2, z); cena.add(bs);
        const enc = caixa(0.06, 0.42, 3.2, banco, 0.02); enc.position.set(lado * (W / 2 - 0.05), 0.83, z); cena.add(enc);
      }
      // barra de cima e argolas
      const barraTeto = barra([lado * 0.55, H - 0.18, -L / 2 + 0.3], [lado * 0.55, H - 0.18, L / 2 - 0.3], 0.02, cromo()); cena.add(barraTeto); this.postes.push(barraTeto);
      for (let k = 0; k < 12; k++) {
        const g = new THREE.Group(); g.position.set(lado * 0.55, H - 0.18, -5.2 + k * 0.95); cena.add(g);
        const a = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.013, 8, 20), mat("#d9d9d9", { metalness: 0.4, roughness: 0.5 })); a.position.y = -0.2; g.add(a);
        const fio = cilindro(0.008, 0.14, mat("#d9d9d9")); fio.position.y = -0.07; g.add(fio); this.argolas.push(g);
      }
      for (const z of [-4, -2, 0, 2, 4]) { const p = cilindro(0.025, H, cromo()); p.position.set(lado * 0.55, H / 2, z); cena.add(p); this.postes.push(p); }
    }
    // fundo do vagão: porta de passagem, painel de destino e mapa da linha
    const fundo = caixa(W, H, 0.1, mat("#9aa1aa")); fundo.position.set(0, H / 2, -L / 2 - 0.05); cena.add(fundo);
    this.fundoPorta = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.9), new THREE.MeshBasicMaterial({ color: "#0b0d12", toneMapped: false })); this.fundoPorta.position.set(0, 0.95, -L / 2 + 0.01); cena.add(this.fundoPorta);
    for (const lado of [-1, 1]) { const p = caixa(0.55, 1.9, 0.05, mat("#6c747e", { metalness: 0.3 })); p.position.set(lado * 0.275, 0.95, -L / 2 + 0.04); cena.add(p); this.portas.push(p); }
    this.luzPorta = new THREE.PointLight("#dff0ff", 0, 7, 1.2); this.luzPorta.position.set(0, 1.2, -L / 2 + 0.5); cena.add(this.luzPorta);
    this.telaPainel = tela(512, 128); this.texPainel = textura(this.telaPainel);
    const mp = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), emissivo(this.texPainel)); mp.position.set(0.62, 2.05, -L / 2 + 0.07); cena.add(mp);
    const fp = caixa(1.26, 0.34, 0.04, mat("#101216")); fp.position.set(0.62, 2.05, -L / 2 + 0.03); cena.add(fp);
    this.telaMapa = tela(256, 560); this.texMapa = textura(this.telaMapa);
    const mm = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.5), emissivo(this.texMapa)); mm.position.set(-0.98, 1.1, -L / 2 + 0.07); cena.add(mm);
    const fm = caixa(0.76, 1.56, 0.04, mat("#101216")); fm.position.set(-0.98, 1.1, -L / 2 + 0.03); cena.add(fm);
    this.painelTexto("PRÓXIMA ESTAÇÃO", "12"); this.mapaTexto(0);
    // lá fora: túnel com lampadas passando e, quando o trem para, a plataforma da estação 13 com as silhuetas
    const tunel = (lado: number) => { const t = caixa(0.2, 4, 44, mat("#06080c")); t.position.set(lado * (W / 2 + 2.6), 1.5, 0); cena.add(t); return t; };
    tunel(-1); this.tunelDireito = tunel(1);
    for (const lado of [-1, 1]) for (let k = 0; k < 10; k++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.55), new THREE.MeshBasicMaterial({ color: "#ffe9b0", toneMapped: false }));
      m.position.set(lado * (W / 2 + 2.4), 2.0, 0); cena.add(m); this.lampadasExt.push({ m, z0: -7 + k * 1.4 + (lado > 0 ? 0.5 : 0), lado });
    }
    this.estPass = [-1, 1].map((lado) => {
      const g = new THREE.Group(), c = tela(512, 200);
      const luz = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.7, 9), new THREE.MeshBasicMaterial({ color: "#e6f6ff", toneMapped: false })); luz.position.set(lado * (W / 2 + 2.2), 1.0, 0); g.add(luz);
      const placa = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.59), emissivo(textura(c))); placa.position.set(lado * (W / 2 + 2.05), 2.0, 0); placa.rotation.y = lado > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(placa);
      g.visible = false; cena.add(g); return { g, c, placa };
    });
    this.plat = new THREE.Group(); cena.add(this.plat);
    const px = W / 2;
    const chao = caixa(3.0, 0.5, 44, mat("#4d5054")); chao.position.set(px + 1.8, -0.26, 0); this.plat.add(chao);
    const borda = caixa(0.14, 0.012, 44, mat("#b9961f")); borda.position.set(px + 0.42, 0.006, 0); this.plat.add(borda);
    for (let k = 0; k < 40; k++) { const t = caixa(0.14, 0.01, 0.6, mat("#7a6216")); t.position.set(px + 0.42, 0.012, -21 + k * 1.1); this.plat.add(t); }
    const azulejo = caixa(0.1, 3.4, 44, new THREE.MeshStandardMaterial({ map: this.texturaAzulejo(), roughness: 0.55 })); azulejo.position.set(px + 3.4, 1.6, 0); this.plat.add(azulejo);
    const tetoP = caixa(3.6, 0.1, 44, mat("#101214")); tetoP.position.set(px + 1.8, 3.25, 0); this.plat.add(tetoP);
    this.luzPlat = new THREE.PointLight("#a8e8c8", 9, 11, 1.3); this.luzPlat.position.set(px + 1.6, 2.6, 0.5); this.plat.add(this.luzPlat);
    this.luzPlat2 = new THREE.PointLight("#ff2a2a", 2.2, 7, 1.6); this.luzPlat2.position.set(px + 2.6, 1.2, -4.5); this.plat.add(this.luzPlat2);
    for (let k = 0; k < 6; k++) { const m = new THREE.MeshBasicMaterial({ color: "#bfe9d6", toneMapped: false }); const t = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 1.5), m); t.position.set(px + 1.8, 3.15, -9 + k * 3.6); this.plat.add(t); this.tubosPlat.push({ m, k }); }
    // colunas, bancos, relógio parado em 3:33, cartazes e as placas vermelhas da estação 13
    for (const z of [-7.5, -2.4, 3.2, 8]) { const c = caixa(0.42, 3.2, 0.42, mat("#2f3438")); c.position.set(px + 2.55, 1.6, z); this.plat.add(c); }
    for (const z of [-5, 5.6]) {
      const bk = caixa(0.5, 0.07, 1.7, mat("#2b2d30")); bk.position.set(px + 3.05, 0.45, z); this.plat.add(bk);
      for (const dz of [-0.7, 0.7]) { const pe = caixa(0.4, 0.4, 0.08, mat("#1b1c1e")); pe.position.set(px + 3.05, 0.2, z + dz); this.plat.add(pe); }
    }
    const rc = tela(256, 256), gr = rc.getContext("2d")!; gr.fillStyle = "#e9e6dd"; gr.beginPath(); gr.arc(128, 128, 124, 0, Math.PI * 2); gr.fill(); gr.strokeStyle = "#111"; gr.lineWidth = 8; gr.stroke();
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; gr.beginPath(); gr.moveTo(128 + Math.sin(a) * 104, 128 - Math.cos(a) * 104); gr.lineTo(128 + Math.sin(a) * 118, 128 - Math.cos(a) * 118); gr.lineWidth = 5; gr.stroke(); }
    gr.lineCap = "round"; gr.lineWidth = 9; gr.beginPath(); gr.moveTo(128, 128); gr.lineTo(128 + Math.sin(Math.PI * 0.592) * 60, 128 - Math.cos(Math.PI * 0.592) * 60); gr.stroke(); // hora (3h33)
    gr.lineWidth = 6; gr.beginPath(); gr.moveTo(128, 128); gr.lineTo(128 + Math.sin(Math.PI * 1.1) * 92, 128 - Math.cos(Math.PI * 1.1) * 92); gr.stroke();
    const relogio = new THREE.Mesh(new THREE.CircleGeometry(0.34, 40), emissivo(textura(rc))); relogio.position.set(px + 2.33, 2.4, -2.4); relogio.rotation.y = -Math.PI / 2; this.plat.add(relogio);
    // ponteiro dos segundos (vermelho, 3D, gira no eixo x da parede)
    this.ponteiroSeg = new THREE.Group(); this.ponteiroSeg.position.set(px + 2.31, 2.4, -2.4); this.plat.add(this.ponteiroSeg);
    const ps = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.3, 0.012), new THREE.MeshBasicMaterial({ color: "#d1201a", toneMapped: false })); ps.position.y = 0.11; this.ponteiroSeg.add(ps);
    ["NÃO DESÇA", "ELES ESPERAM", "VOCÊ JÁ ESTEVE AQUI"].forEach((txt, k) => {
      const c = tela(256, 400), g = c.getContext("2d")!; g.fillStyle = "#17110f"; g.fillRect(0, 0, 256, 400);
      g.fillStyle = "#2a1c18"; g.beginPath(); g.ellipse(128, 130, 46, 56, 0, 0, Math.PI * 2); g.fill(); g.fillRect(70, 180, 116, 120);
      g.fillStyle = "#b8281e"; g.font = "bold 34px Arial"; g.textAlign = "center"; txt.split(" ").forEach((w, i, a) => g.fillText(w, 128, 330 + (i - (a.length - 1) / 2) * 40));
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.25), emissivo(textura(c))); p.position.set(px + 3.33, 1.5, [-6.2, -0.9, 4.4][k]); p.rotation.y = -Math.PI / 2; this.plat.add(p);
    });
    for (const z of [-4.2, 0.2, 4.4]) {
      const c = tela(512, 200), g = c.getContext("2d")!; g.fillStyle = "#1a0c0c"; g.fillRect(0, 0, 512, 200);
      g.fillStyle = "#ff4a3a"; g.shadowColor = "#ff3b2b"; g.shadowBlur = 30; g.textAlign = "center"; g.font = "bold 38px Arial"; g.fillText("ESTAÇÃO", 256, 50); g.font = "bold 130px Arial"; g.fillText("13", 256, 168);
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.59), emissivo(textura(c))); sg.position.set(px + 3.33, 2.2, z); sg.rotation.y = -Math.PI / 2; this.plat.add(sg);
    }
    // a gente da plataforma: pálida, parada, olhando o trem, cabeça torta; alguns sorriem demais, um é alto demais
    const pal = (pele: string, roupa: string, cabelo: string, extra: Record<string, unknown> = {}) => ({ pele, cabelo, roupa, calca: "#16181c", tenis: "#0e0e10", penteado: "curto" as const, capuz: false, ...extra });
    const elenco = [pal("#c4cbd0", "#2c3138", "#15110e"), pal("#adb5ba", "#3a2f33", "#0f0f10", { penteado: "chanel" }), pal("#d1d6da", "#26303a", "#2a2a2a", { oculos: true }), pal("#b5bcc1", "#33392f", "#1a1411", { penteado: "coque" }), pal("#c9cfd3", "#40343a", "#0d0d0d"),
      pal("#a9b1b6", "#2a2f35", "#2f2f2f", { altura: 1.38 }), pal("#bfc6ca", "#352c30", "#111111", { penteado: "chanel" }), pal("#cdd2d6", "#2d3338", "#1b1b1b", { oculos: true }), pal("#b0b8bd", "#38343a", "#0e0e0e"), pal("#c1c8cc", "#2b3036", "#141010", { penteado: "coque" })];
    elenco.forEach((ap, k) => {
      const bn = new Boneco(ap as any), x0 = px + 0.95 + (k % 3) * 0.55, z = -4.6 + k * 1.0 + (k % 2 ? 0.2 : -0.1), tilt = (k % 2 ? 1 : -1) * (5 + (k % 4) * 3);
      bn.raiz.position.set(x0, 0, z); bn.raiz.rotation.set(0, -Math.PI / 2, 0);
      bn.posar({ ...POSES.em_pe(k), olhos: 1.25, vazio: true, sobrancelha: [-0.2, 0.3, -0.5][k % 3], boca: "neutra", cabeca: [0, 0, tilt] });
      this.plat.add(bn.raiz); this.gente.push({ b: bn, x0, k, tilt });
    });
    // o rosto colado na janela (gancho do ep. 1): um deles bem perto do vidro, cabeça torta
    this.perto = new Boneco(pal("#c9d0d4", "#23282e", "#0d0d0d", { penteado: "chanel" }) as any);
    this.perto.raiz.position.set(px + 0.42, 0, 0.9); this.perto.raiz.rotation.set(0, -Math.PI / 2, 0); this.perto.raiz.visible = false; this.plat.add(this.perto.raiz);
    this.lia = new Boneco(APARENCIAS.lia); cena.add(this.lia.raiz);
    this.montaCabine(cena, pal);
    // luz fraca e quente só para o rosto da Lia não sumir quando as luzes do teto apagam
    this.luzLia = new THREE.PointLight("#ffd9b0", 0, 3.2, 1.6); cena.add(this.luzLia);
    this.padrao();
  }

  /** Fila de gente pálida que entra no vagão pelo fundo (ep. 2) e a cabine do maquinista, atrás da parede do fundo. */
  private montaCabine(cena: any, pal: (p: string, r: string, c: string, e?: Record<string, unknown>) => any) {
    const { L } = Vagao;
    const cores = ["#c4cbd0", "#adb5ba", "#d1d6da", "#b5bcc1", "#c9cfd3", "#a9b1b6", "#bfc6ca", "#cdd2d6"];
    for (let k = 0; k < 8; k++) {
      const b = new Boneco(pal(cores[k], ["#2c3138", "#3a2f33", "#26303a", "#33392f"][k % 4], "#121212", { penteado: (["curto", "chanel", "coque", "curto"] as const)[k % 4], oculos: k === 2 || k === 5, altura: k === 5 ? 1.32 : 1 }) as any);
      b.raiz.visible = false; cena.add(b.raiz); this.fila.push(b); this.sombraPe(b);
    }
    this.sombraPe(this.lia); this.sombraPe(this.perto); for (const g of this.gente) this.sombraPe(g.b);
    const z0 = -L / 2 - 0.12, z1 = z0 - 3.0, g = new THREE.Group(); this.cabine = g; g.visible = false; cena.add(g);
    const parede = mat("#2a2f36", { roughness: 0.7 }), cw = 1.5;
    const chao = caixa(2 * cw, 0.06, 3.0, mat("#1b1e24", { roughness: 0.4 })); chao.position.set(0, -0.03, (z0 + z1) / 2); g.add(chao);
    const teto = caixa(2 * cw, 0.08, 3.0, mat("#15181d")); teto.position.set(0, 2.3, (z0 + z1) / 2); g.add(teto);
    for (const x of [-cw, cw]) { const p = caixa(0.08, 2.3, 3.0, parede); p.position.set(x, 1.15, (z0 + z1) / 2); g.add(p); }
    const porta = caixa(1.1, 2.0, 0.06, mat("#7a8591", { metalness: 0.1, roughness: 0.55 })); porta.position.set(0, 1.0, z0 - 0.02); g.add(porta);
    this.frestaPorta = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.1), new THREE.MeshBasicMaterial({ color: "#dff0ff", toneMapped: false, side: THREE.DoubleSide })); this.frestaPorta.position.set(0, 0.05, z0 - 0.2); g.add(this.frestaPorta);
    for (const dx of [-0.25, 0.25]) { const pe = caixa(0.2, 0.1, 0.02, new THREE.MeshBasicMaterial({ color: "#000" })); pe.position.set(dx, 0.05, z0 - 0.19); g.add(pe); this.pesFresta.push(pe); }
    this.vidroTela = tela(1024, 512); this.vidroTex = textura(this.vidroTela); this.desenhaVidro(0);
    const vidro = new THREE.Mesh(new THREE.PlaneGeometry(2 * cw - 0.1, 1.45), emissivo(this.vidroTex)); vidro.position.set(0, 1.35, z1 + 0.04); g.add(vidro);
    const moldura = caixa(2 * cw, 2.3, 0.08, mat("#101216")); moldura.position.set(0, 1.15, z1 - 0.03); g.add(moldura);
    const mesa = caixa(2.2, 0.62, 0.7, mat("#23272e", { roughness: 0.5 })); mesa.position.set(0, 0.32, z1 + 0.5); g.add(mesa); this.mesaCab.push(mesa);
    const inc = caixa(2.2, 0.06, 0.5, mat("#2d323a")); inc.position.set(0, 0.7, z1 + 0.5); inc.rotation.x = -0.32; g.add(inc); this.mesaCab.push(inc);
    const cores2 = ["#27e07a", "#ffb000", "#ff3b3b", "#27e07a", "#4aa8ff", "#ffb000", "#27e07a", "#ff3b3b"];
    for (let k = 0; k < 16; k++) { const led = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.02, 0.07), new THREE.MeshBasicMaterial({ color: cores2[k % 8], toneMapped: false })); led.position.set(-0.9 + (k % 8) * 0.26, 0.74 + Math.floor(k / 8) * 0.06, z1 + 0.62 + Math.floor(k / 8) * 0.12); led.rotation.x = -0.32; g.add(led); this.leds.push(led); this.mesaCab.push(led); }
    this.painelCab = tela(512, 160); this.painelCabTex = textura(this.painelCab); this.painelCabinePainel("MAQUINISTA", "AUSENTE");
    const pn = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.28), emissivo(this.painelCabTex)); pn.position.set(0, 1.22, z1 + 0.25); pn.rotation.x = -0.18; g.add(pn);
    const alav = cilindro(0.025, 0.28, mat("#c4c9d0", { metalness: 0.8, roughness: 0.3 })); alav.position.set(0.55, 0.88, z1 + 0.7); alav.rotation.z = -0.5; g.add(alav);
    const bola = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), new THREE.MeshBasicMaterial({ color: "#d1201a", toneMapped: false })); bola.position.set(0.62, 1.01, z1 + 0.7); g.add(bola);
    const banco = caixa(0.55, 0.12, 0.5, mat("#3a3128")); banco.position.set(1.0, 0.5, z1 + 1.35); g.add(banco);
    const enc = caixa(0.55, 0.7, 0.1, mat("#3a3128")); enc.position.set(1.0, 0.9, z1 + 1.6); g.add(enc);
    this.luzCabine = new THREE.PointLight("#8fffd0", 0, 4.5, 1.5); this.luzCabine.position.set(0, 1.9, (z0 + z1) / 2); g.add(this.luzCabine);
    const pc = tela(256, 64), gg = pc.getContext("2d")!; gg.fillStyle = "#c7cbd1"; gg.fillRect(0, 0, 256, 64); gg.fillStyle = "#16181c"; gg.font = "bold 30px Arial"; gg.textAlign = "center"; gg.textBaseline = "middle"; gg.fillText("MAQUINISTA", 128, 34);
    this.placaCab = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.155), emissivo(textura(pc))); this.placaCab.position.set(0, 2.12, -L / 2 + 0.02); cena.add(this.placaCab);
  }
  /** Mancha de sombra de contato sob um boneco (círculo suave no chão). */
  private sombraPe(b: Boneco) {
    const c = tela(128, 128), g = c.getContext("2d")!, gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, "rgba(0,0,0,0.75)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.85), new THREE.MeshBasicMaterial({ map: textura(c), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.014; b.raiz.add(m);
  }
  desenhaVidro(n: number) {
    const g = this.vidroTela.getContext("2d")!, r = sorteio(7);
    g.fillStyle = "#04080b"; g.fillRect(0, 0, 1024, 512);
    const gl = g.createRadialGradient(512, 250, 6, 512, 250, 300); gl.addColorStop(0, "rgba(120,170,160,0.35)"); gl.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gl; g.fillRect(0, 0, 1024, 512);
    g.strokeStyle = "rgba(60,80,80,0.5)"; g.lineWidth = 3; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(512 + (k - 3.5) * 30, 250); g.lineTo(512 + (k - 3.5) * 190, 512); g.stroke(); }
    const mao = (x: number, y: number, a: number, e: number) => {
      g.save(); g.translate(x, y); g.rotate(a); g.scale(e, e); g.fillStyle = "rgba(225,232,236,0.62)";
      g.beginPath(); g.ellipse(0, 0, 26, 32, 0, 0, Math.PI * 2); g.fill();
      for (const [dx, ang, len] of [[-20, -0.35, 44], [-8, -0.12, 54], [6, 0.05, 56], [19, 0.22, 48], [32, 0.95, 32]] as const) { g.save(); g.translate(dx, -22); g.rotate(ang); g.beginPath(); g.ellipse(0, -len / 2, 6.5, len / 2, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
      g.fillRect(-9, 26, 18, 20); g.fillStyle = "rgba(225,232,236,0.22)"; g.fillRect(-4, 40, 8, 60 + 40 * r()); g.restore();
    };
    const q = Math.max(0, Math.min(26, Math.round(n)));
    for (let k = 0; k < q; k++) mao(60 + r() * 900, 70 + r() * 360, (r() - 0.5) * 0.7, 0.8 + r() * 0.7);
    this.vidroTex.needsUpdate = true;
  }
  painelCabinePainel(l1: string, l2: string, cor = "#ff3b3b") {
    const g = this.painelCab.getContext("2d")!; g.fillStyle = "#0b0505"; g.fillRect(0, 0, 512, 160); g.strokeStyle = cor + "aa"; g.lineWidth = 4; g.strokeRect(5, 5, 502, 150);
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = cor; g.shadowColor = cor; g.shadowBlur = 14; g.font = "bold 40px 'Courier New', monospace"; g.fillText(l1, 256, 50); g.font = "bold 62px 'Courier New', monospace"; g.fillText(l2, 256, 112); this.painelCabTex.needsUpdate = true;
  }
  /** A fila entra pelo fundo do vagão e vem pelo corredor (p de 0 a 1; z0 = onde a primeira pessoa começa). */
  filaAnda(p: number, t: number, z0 = 8.2, alcance = 9) {
    this.fila.forEach((b, k) => {
      const z = z0 - p * alcance + k * 1.05, andando = p > 0 && p < 1;
      b.raiz.visible = z < 9.5 && z > -5.6; b.raiz.position.set(((k % 2) ? 0.42 : -0.42) + Math.sin(t * 1.1 + k) * 0.02, 0, z); b.raiz.rotation.set(0, Math.PI + (k % 2 ? 0.04 : -0.04), 0);
      const w = Math.sin(t * 3.6 + k * 0.9) * (andando ? 14 : 0);
      b.posar({ respira: t, olhos: 1.3, vazio: true, sobrancelha: [-0.2, 0.4, -0.5][k % 3], boca: "neutra", cabeca: [0, 0, (k % 2 ? 1 : -1) * (6 + (k % 3) * 3)], pernaE: [w, 0, 0], pernaD: [-w, 0, 0], joelhoE: Math.max(0, -w) * 1.2, joelhoD: Math.max(0, w) * 1.2, bracoE: [-w * 0.4, 0, 6], bracoD: [w * 0.4, 0, -6] });
    });
  }
  private texturaAzulejo() {
    const c = tela(256, 512), g = c.getContext("2d")!, r = sorteio(21);
    g.fillStyle = "#46544f"; g.fillRect(0, 0, 256, 512);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) { const v = 78 + Math.floor(r() * 26); g.fillStyle = `rgb(${v - 10},${v + 8},${v})`; g.fillRect(x * 32 + 1, y * 32 + 1, 30, 30); }
    for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(10,8,6,${0.08 + r() * 0.2})`; g.fillRect(r() * 256, r() * 300, 4 + r() * 10, 40 + r() * 200); }
    g.fillStyle = "rgba(90,20,16,0.5)"; for (let k = 0; k < 6; k++) { g.fillRect(40 + r() * 170, 100 + r() * 200, 3, 30 + r() * 90); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 2); return t;
  }
  private desenhaEst(c: HTMLCanvasElement, placa: any, n: number) {
    const g = c.getContext("2d")!; g.fillStyle = "#3a4048"; g.fillRect(0, 0, 512, 200); g.fillStyle = "#fff"; g.textAlign = "center"; g.font = "bold 36px Arial"; g.fillText("ESTAÇÃO", 256, 48); g.font = "bold 130px Arial"; g.fillText(String(n), 256, 168);
    placa.material.map.needsUpdate = true;
  }
  painelTexto(linha1: string, linha2: string, cor = "#ffb000") {
    const g = this.telaPainel.getContext("2d")!;
    g.fillStyle = "#120a02"; g.fillRect(0, 0, 512, 128); g.strokeStyle = cor + "99"; g.lineWidth = 4; g.strokeRect(5, 5, 502, 118);
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = cor; g.shadowColor = cor; g.shadowBlur = 14;
    g.font = "bold 34px 'Courier New', monospace"; g.fillText(linha1, 256, 28);
    g.font = "bold 78px 'Courier New', monospace"; g.fillText(linha2, 256, 86);
    this.texPainel.needsUpdate = true;
  }
  /** Mapa vertical da linha cinza: 12 estações. `extra` (0 a 1) acende a 13ª, que não está no mapa. */
  mapaTexto(extra: number) {
    const g = this.telaMapa.getContext("2d")!;
    g.fillStyle = "#14171c"; g.fillRect(0, 0, 256, 560);
    g.fillStyle = "#9aa3ad"; g.font = "bold 26px Arial"; g.textAlign = "center"; g.fillText("LINHA CINZA", 128, 42);
    g.strokeStyle = "#9aa3ad"; g.lineWidth = 10; g.beginPath(); g.moveTo(80, 84); g.lineTo(80, 420); g.stroke();
    for (let k = 0; k < 12; k++) {
      const y = 84 + k * (336 / 11); g.fillStyle = "#14171c"; g.beginPath(); g.arc(80, y, 13, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#e8edf2"; g.lineWidth = 5; g.stroke();
      g.fillStyle = "#cfd6de"; g.font = "bold 22px Arial"; g.textAlign = "left"; g.fillText(String(k + 1), 112, y + 8);
    }
    if (extra > 0) {
      g.strokeStyle = `rgba(255,59,59,${extra})`; g.setLineDash([10, 10]); g.lineWidth = 8; g.beginPath(); g.moveTo(80, 432); g.lineTo(80, 486); g.stroke(); g.setLineDash([]);
      g.fillStyle = `rgba(255,59,59,${extra})`; g.shadowColor = "#ff3b3b"; g.shadowBlur = 26 * extra; g.beginPath(); g.arc(80, 510, 28, 0, Math.PI * 2); g.fill();
      g.fillStyle = `rgba(255,255,255,${extra})`; g.shadowBlur = 0; g.font = "bold 30px Arial"; g.textAlign = "center"; g.fillText("13", 80, 521);
      g.fillStyle = `rgba(255,120,120,${extra})`; g.font = "bold 20px Arial"; g.textAlign = "left"; g.fillText("fora do mapa", 118, 516);
    }
    this.texMapa.needsUpdate = true;
  }
  /** Mostra ou esconde barras, postes e argolas (para os closes sem nada na frente). */
  limpa(visivel: boolean) { for (const o of [...this.postes, ...this.argolas]) o.visible = visivel; }
  /** A gente da plataforma dá um passo em direção ao trem (p de 0 a 1). */
  passo(p: number) { for (const { b, x0 } of this.gente) b.raiz.position.x = x0 - 0.6 * p; }
  /** `offset`: quanto o trem andou (metros); `plat`: 0 = túnel, 1 = parado na plataforma. */
  mover(offset: number, plat: number, est = 0) {
    const ativa = est > 0 && plat <= 0.001;
    for (const e of this.estPass) { e.g.visible = ativa; if (ativa) { e.g.position.z = offset - 25; if (this.estNum !== est) this.desenhaEst(e.c, e.placa, est); } }
    if (ativa) this.estNum = est;
    for (const { m, z0, lado } of this.lampadasExt) {
      m.position.z = (((z0 - offset) % 14) + 14) % 14 - 7;
      m.visible = !(lado > 0 && plat > 0.001);
    }
    this.tunelDireito.visible = plat <= 0.001;
    this.plat.visible = plat > 0.001; this.plat.position.z = -(1 - suave(plat)) * 16;
  }
  porta(p: number) {
    this.portas[0].position.x = -0.275 - 0.55 * p; this.portas[1].position.x = 0.275 + 0.55 * p;
    this.fundoPorta.material.color.set(p > 0.02 ? "#dff0ff" : "#0b0d12"); this.luzPorta.intensity = 9 * p;
  }
  /** Luzes do teto: `queda` 0 normal, 1 apagadas; o pisca é uma função do tempo. */
  atualizar(t: number, pisca = 0.5) {
    const baixo = Math.sin(t * 23) > 0.3 && Math.sin(t * 3.1 + 1) > 1 - 2 * pisca;
    for (let k = 0; k < 5; k++) {
      const apaga = k < this.apagadas || (k === 2 && baixo) || (k === 3 && Math.sin(t * 17 + 2) > 0.7 && pisca > 0.3) || (k === 1 && Math.sin(t * 13 + 4) > 0.88);
      this.luzes[k].intensity = apaga ? 0.08 : 1.5;
      for (const s of this.segmentos.filter((x) => x.k === k)) s.m.color.set(apaga ? "#3a3f48" : "#aebdd0");
    }
    for (const g of this.gente) { g.b.raiz.rotation.y = -Math.PI / 2 + Math.sin(t * 0.6 + g.k) * 0.06; g.b.cabeca.rotation.z = (((g.tilt + Math.sin(t * 0.8 + g.k * 1.7) * 3) * (1 - this.retos)) * Math.PI) / 180; if (this.retos > 0) g.b.raiz.rotation.y = -Math.PI / 2; }
    const piscaP = Math.sin(t * 19 + 1) > 0.6 && Math.sin(t * 2.3) > 0.2;
    this.luzPlat.intensity = piscaP ? 2 : 9;
    for (const x of this.tubosPlat) x.m.color.set(x.k === 2 && piscaP ? "#26302c" : "#bfe9d6");
    this.argolas.forEach((g, i) => { g.rotation.z = Math.sin(t * 1.6 + i) * 0.04; g.rotation.x = Math.sin(t * 1.2 + i * 0.7) * 0.03; });
  }
  padrao() {
    this.lia.raiz.visible = false; this.perto.raiz.visible = false; this.apagadas = 0; this.retos = 0; this.luzLia.intensity = 0; this.ponteiroSeg.rotation.x = 0; this.fila.forEach((b) => (b.raiz.visible = false)); this.cabine.visible = false; this.luzCabine.intensity = 0; for (const o of this.mesaCab) o.visible = true; this.placaCab.visible = false; this.luzPlat2.intensity = 2.2; this.luzPlat2.position.set(Vagao.W / 2 + 2.6, 1.2, -4.5); this.limpa(true); this.passo(0); this.mover(0, 0); this.porta(0); this.painelTexto("PRÓXIMA ESTAÇÃO", "12"); this.mapaTexto(0);
  }
}

// poses da Lia no banco
const LIA_BANCO = (t: number, extra: Pose = {}): Pose => ({ respira: t, cabeca: [14, 0, 0], tronco: [6, 0, 0], pernaE: [-88, 0, 4], pernaD: [-88, 0, -4], joelhoE: 88, joelhoD: 88,
  bracoE: [-30, 0, -6], bracoD: [-30, 0, 6], cotoveloE: 75, cotoveloD: 75, ...extra });
function liaSenta(m: Mundo, pose: Pose) {
  const l = m.vagao.lia; l.raiz.visible = true; l.raiz.position.set(-1.12, -0.03, 0.5); l.raiz.rotation.set(0, Math.PI / 2 - 0.5, 0); l.posar(pose);
}
function cab(b: Boneco): V3 { const v = new THREE.Vector3(); b.cabeca.getWorldPosition(v); return [v.x, v.y, v.z]; }
/** Luz quente no rosto da Lia (para não sumir no escuro). frente: 1 = lado da janela (sentada), -1 = olhando o fundo do vagão. */
function luzRosto(m: Mundo, i: number, frente = 1) { const c = cab(m.vagao.lia), L = m.vagao.luzLia; L.intensity = i; L.position.set(c[0] + (frente > 0 ? 0.7 : 0.2), c[1] + 0.35, c[2] + (frente > 0 ? 0.5 : -0.8)); }
/** Dentro da cabine: apaga as luzes do vagão (a parede não as bloqueia) e acende a luz verde do painel. */
function cabineLuz(m: Mundo, i: number) { for (const l of m.vagao.luzes) l.intensity = 0; m.vagao.luzCabine.intensity = i; m.vagao.luzLia.intensity = 0; }
/** Lia sentada em meio corpo: câmera a ~3,4 m, cabeça inteira com folga em cima, nada cortado na borda. */
function liaMeio(m: Mundo, p: number, desce = 0): { cena: "vagao"; pos: V3; alvo: V3; fov: number } {
  luzRosto(m, Math.max(m.vagao.luzLia.intensity, 0.8));
  const c = cab(m.vagao.lia), x = Math.min(1.15, c[0] + 2.25 - 0.15 * p);
  return { cena: "vagao", pos: [x, c[1] + 0.12 - desce * 0.3, c[2] + 2.6 - 0.2 * p], alvo: [c[0] + 0.05, c[1] - 0.3, c[2]], fov: 46 };
}

// ================================================================ estúdio de rádio
export class Estudio {
  cena: any; locutor: Boneco; visitante: Boneco; luzes: any[] = []; hemi: any; luzNoAr: any; matNoAr: any; telaOndas: HTMLCanvasElement; texOndas: any;
  telaRelogio: HTMLCanvasElement; texRelogio: any; ledsTel: any[] = []; vidro: any; luzFora: any;
  static W = 3.8; static D = 3.4; static H = 2.6;

  constructor() {
    const cena = new THREE.Scene(); this.cena = cena; cena.background = new THREE.Color("#050507");
    const { W, D, H } = Estudio;
    this.hemi = new THREE.HemisphereLight("#6c7790", "#1b1410", 0.55); cena.add(this.hemi);
    const piso = caixa(W, 0.05, D, mat("#2b2520", { roughness: 1 })); piso.position.y = -0.025; cena.add(piso);
    const teto = caixa(W, 0.06, D, mat("#15171c")); teto.position.y = H; cena.add(teto);
    const paredeE = caixa(0.1, H, D, mat("#1a1d23")); paredeE.position.set(-W / 2 - 0.05, H / 2, 0); cena.add(paredeE);
    const xd = W / 2 + 0.05, pd = (h: number, y: number, d: number, z: number) => { const b = caixa(0.1, h, d, mat("#1a1d23")); b.position.set(xd, y, z); cena.add(b); };
    pd(0.8, 0.4, D, 0); pd(H - 1.9, (H + 1.9) / 2, D, 0); pd(1.1, 1.35, D / 2 - 0.85, -D / 2 + (D / 2 - 0.85) / 2); pd(1.1, 1.35, D / 2 - 0.65, 0.65 + (D / 2 - 0.65) / 2);
    const fundo = caixa(W, H, 0.1, mat("#14161b")); fundo.position.set(0, H / 2, -D / 2 - 0.05); cena.add(fundo);
    // espuma acústica no fundo
    const r = sorteio(3);
    for (let i = 0; i < 12; i++) for (let j = 0; j < 7; j++) {
      const e = caixa(0.3, 0.3, 0.05 + r() * 0.06, mat((i + j) % 2 ? "#1d2027" : "#262a34", { roughness: 1 })); e.position.set(-W / 2 + 0.2 + i * 0.31, 0.2 + j * 0.31, -D / 2 + 0.04); cena.add(e);
    }
    // letreiro NO AR + relógio 3:33
    this.matNoAr = new THREE.MeshBasicMaterial({ map: textura(this.desenhaNoAr()), toneMapped: false });
    const plNoAr = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.46), this.matNoAr); plNoAr.position.set(0, 2.15, -D / 2 + 0.1); cena.add(plNoAr);
    const moldura = caixa(1.4, 0.54, 0.06, mat("#220808")); moldura.position.set(0, 2.15, -D / 2 + 0.06); cena.add(moldura);
    this.luzNoAr = new THREE.PointLight("#ff2a2a", 3, 6, 1.5); this.luzNoAr.position.set(0, 1.95, -D / 2 + 0.6); cena.add(this.luzNoAr);
    this.telaRelogio = tela(256, 96); this.texRelogio = textura(this.telaRelogio);
    const rel = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), emissivo(this.texRelogio)); rel.position.set(-1.15, 2.15, -D / 2 + 0.1); cena.add(rel);
    this.relogio("3:33");
    // mesa, cadeira, mesa de som, microfone, monitor com a onda de áudio, telefone
    const mesa = caixa(2.2, 0.06, 0.9, mat("#4a3426")); mesa.position.set(0, 0.74, -0.1); cena.add(mesa);
    const corpo = caixa(2.1, 0.72, 0.8, mat("#2f2219")); corpo.position.set(0, 0.36, -0.1); cena.add(corpo);
    const cadeira = caixa(0.5, 0.06, 0.5, mat("#22252b")); cadeira.position.set(0, 0.44, -0.82); cena.add(cadeira);
    const encosto = caixa(0.5, 0.6, 0.06, mat("#22252b")); encosto.position.set(0, 0.78, -1.08); cena.add(encosto);
    const mesaSom = caixa(0.9, 0.05, 0.42, mat("#15171c")); mesaSom.position.set(-0.45, 0.805, 0.1); mesaSom.rotation.x = -0.12; cena.add(mesaSom);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) {
      const b = cilindro(0.016, 0.03, mat(["#e8e8e8", "#e23b3b", "#e7c13a"][(i + j) % 3], { roughness: 0.4 }), 10); b.position.set(-0.82 + i * 0.105, 0.845, 0.0 + j * 0.1); b.rotation.x = -0.12; cena.add(b);
    }
    const preto = mat("#0c0d10", { roughness: 0.4 });
    cena.add(barra([0.62, 0.78, -0.1], [0.17, 1.37, -0.4], 0.012, cromo()));
    const mic = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.1, 6, 14), preto); mic.position.set(0.17, 1.38, -0.4); mic.rotation.x = Math.PI / 2; mic.castShadow = true; cena.add(mic);
    const pop = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.004, 8, 28), preto); pop.position.set(0.17, 1.38, -0.3); cena.add(pop);
    const popDisco = new THREE.Mesh(new THREE.CircleGeometry(0.075, 28), new THREE.MeshBasicMaterial({ color: "#0b0b0d", transparent: true, opacity: 0.35 })); popDisco.position.set(0.17, 1.38, -0.3); cena.add(popDisco);
    this.telaOndas = tela(256, 128); this.texOndas = textura(this.telaOndas);
    const monit = caixa(0.62, 0.4, 0.05, mat("#101216")); monit.position.set(0.9, 1.05, 0.05); monit.rotation.y = -0.4; cena.add(monit);
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.34), emissivo(this.texOndas)); sc.position.set(0.9 - 0.012, 1.05, 0.05 + 0.03); sc.rotation.y = -0.4; cena.add(sc);
    this.ondas(0, 0.3);
    const tel1 = caixa(0.3, 0.09, 0.24, mat("#1b1b20")); tel1.position.set(-1.0, 0.8, -0.38); cena.add(tel1);
    for (let k = 0; k < 4; k++) { const led = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), new THREE.MeshBasicMaterial({ color: "#28d96a", toneMapped: false })); led.position.set(-1.1 + k * 0.07, 0.855, -0.3); cena.add(led); this.ledsTel.push(led); }
    // luzes: abajur quente + luz fria de recorte
    const luzTel = new THREE.PointLight("#ffcf8a", 1.6, 2.5, 1.6); luzTel.position.set(-1.0, 1.15, -0.1); cena.add(luzTel);
    const quente = new THREE.PointLight("#ffb25e", 8, 6, 1.6); quente.position.set(0.9, 1.9, 0.3); cena.add(quente); this.luzes.push(quente);
    const fria = new THREE.PointLight("#8fb2ff", 5, 7, 1.6); fria.position.set(-1.4, 2.2, 1.2); cena.add(fria); this.luzes.push(fria);
    const frente = new THREE.PointLight("#ffd9a8", 4, 5, 1.6); frente.position.set(0, 1.9, 1.2); cena.add(frente); this.luzes.push(frente);
    // vidro da cabine na parede direita (o visitante bate nele do corredor)
    this.vidro = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), new THREE.MeshStandardMaterial({ color: "#7fb0c8", transparent: true, opacity: 0.16, roughness: 0.1, metalness: 0.2 }));
    this.vidro.position.set(W / 2 - 0.01, 1.35, -0.1); this.vidro.rotation.y = -Math.PI / 2; cena.add(this.vidro);
    const fundoCorr = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.3), new THREE.MeshBasicMaterial({ color: "#243c52", toneMapped: false })); fundoCorr.position.set(W / 2 + 0.7, 1.35, -0.1); fundoCorr.rotation.y = -Math.PI / 2; cena.add(fundoCorr);
    this.luzFora = new THREE.PointLight("#6f9cc2", 2.5, 4, 1.5); this.luzFora.position.set(W / 2 + 0.4, 1.8, -0.1); cena.add(this.luzFora);
    // personagens: o locutor (com fones) e a sombra de quem bate no vidro
    this.locutor = new Boneco(APARENCIAS.locutor); cena.add(this.locutor.raiz);
    const fone = mat("#14151a", { roughness: 0.4 });
    const arco = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.022, 8, 32, Math.PI), fone); this.locutor.cabeca.add(arco);
    for (const l of [-1, 1]) { const copo = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), fone); copo.scale.set(0.55, 1, 1); copo.position.set(0.325 * l, -0.02, 0); this.locutor.cabeca.add(copo); }
    this.visitante = new Boneco(APARENCIAS.sombra); cena.add(this.visitante.raiz);
    this.padrao();
  }
  private desenhaNoAr() {
    const c = tela(512, 180), g = c.getContext("2d")!; g.fillStyle = "#1b0505"; g.fillRect(0, 0, 512, 180);
    g.fillStyle = "#ff3030"; g.shadowColor = "#ff2a2a"; g.shadowBlur = 36; g.font = "bold 130px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("NO AR", 256, 98);
    g.strokeStyle = "#ff3030"; g.lineWidth = 8; g.strokeRect(14, 14, 484, 152); return c;
  }
  relogio(txt: string) {
    const g = this.telaRelogio.getContext("2d")!; g.fillStyle = "#0a0505"; g.fillRect(0, 0, 256, 96);
    g.fillStyle = "#ff3b3b"; g.shadowColor = "#ff3b3b"; g.shadowBlur = 16; g.font = "bold 84px 'Courier New', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 128, 52);
    this.texRelogio.needsUpdate = true;
  }
  /** Onda de áudio na tela do monitor: `amp` de 0 a 1. */
  ondas(t: number, amp: number) {
    const g = this.telaOndas.getContext("2d")!; g.fillStyle = "#04120a"; g.fillRect(0, 0, 256, 128);
    g.strokeStyle = "#1b4d32"; g.lineWidth = 1; for (let y = 16; y < 128; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
    g.strokeStyle = "#39ff88"; g.shadowColor = "#39ff88"; g.shadowBlur = 8; g.lineWidth = 3; g.beginPath();
    for (let x = 0; x <= 256; x += 3) { const env = Math.sin(x / 256 * Math.PI); const y = 64 + Math.sin(x * 0.21 + t * 9) * 34 * amp * env + Math.sin(x * 0.57 - t * 13) * 14 * amp * env; if (x === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.stroke(); this.texOndas.needsUpdate = true;
  }
  /** Quanto o estúdio apaga: 0 normal, 1 só o NO AR (que também falha). */
  apagar(p: number, t: number) {
    const k = 1 - p;
    this.luzes[0].intensity = 8 * k; this.luzes[1].intensity = 5 * k; this.luzes[2].intensity = 4 * k; this.hemi.intensity = 0.55 * k + 0.06;
    const pisca = p > 0.3 && Math.sin(t * 25) > 0.4 ? 0.25 : 1; this.luzNoAr.intensity = 3 * pisca * (p > 0.9 ? 0.5 : 1);
  }
  padrao() {
    this.locutor.raiz.visible = false; this.visitante.raiz.visible = false; this.apagar(0, 0); this.relogio("3:33"); this.ondas(0, 0.3);
    for (const l of this.ledsTel) l.material.color.set("#28d96a");
  }
}
const LOCUTOR_MESA = (t: number, extra: Pose = {}): Pose => ({ respira: t, cabeca: [4, 0, 0], tronco: [6, 0, 0], pernaE: [-88, 0, 4], pernaD: [-88, 0, -4], joelhoE: 88, joelhoD: 88,
  bracoE: [-62, 0, 14], bracoD: [-62, 0, -14], cotoveloE: 52, cotoveloD: 52, ...extra });
function locutorSenta(m: Mundo, pose: Pose) {
  const l = m.estudio.locutor; l.raiz.visible = true; l.raiz.position.set(0, -0.03, -0.8); l.raiz.rotation.set(0, 0, 0); l.posar(pose);
}

// ================================================================ locadora de fitas
export class Locadora {
  cena: any; caio: Boneco; neon: any; luzesTeto: any[] = []; tubos: any[] = []; telaTv: HTMLCanvasElement; texTv: any; fita: any; telaFita: HTMLCanvasElement; texFita: any; luzTv: any;
  static W = 4.4; static D = 7; static H = 2.7;

  constructor() {
    const cena = new THREE.Scene(); this.cena = cena; cena.background = new THREE.Color("#040307");
    const { W, D, H } = Locadora;
    cena.add(new THREE.HemisphereLight("#8a7fb0", "#201618", 0.5));
    const piso = caixa(W, 0.05, D, mat("#3b342f", { roughness: 0.6 })); piso.position.y = -0.025; cena.add(piso);
    const teto = caixa(W, 0.06, D, mat("#cbc7bf")); teto.position.y = H; cena.add(teto);
    const fundo = caixa(W, H, 0.1, mat("#2b2330")); fundo.position.set(0, H / 2, -D / 2 - 0.05); cena.add(fundo);
    for (const lado of [-1, 1]) { const p = caixa(0.1, H, D, mat("#241f2b")); p.position.set(lado * (W / 2 + 0.05), H / 2, 0); cena.add(p); }
    // fluorescentes (um pisca)
    for (const z of [-2, 0.4, 2.6]) {
      const m = new THREE.MeshBasicMaterial({ color: "#f1f6ff", toneMapped: false }); const t = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.12), m); t.position.set(0, H - 0.06, z); cena.add(t); this.tubos.push(m);
      const l = new THREE.PointLight("#dfe8ff", 3.2, 6.5, 1.4); l.position.set(0, H - 0.3, z); cena.add(l); this.luzesTeto.push(l);
    }
    // estantes cheias de fitas (uma malha instanciada só)
    const r = sorteio(11), niveis = [0.2, 0.75, 1.3, 1.85], porNivel = 130, total = 2 * niveis.length * porNivel;
    const fitas = new THREE.InstancedMesh(new THREE.BoxGeometry(0.105, 0.19, 0.034), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6 }), total);
    const paleta = ["#1b1b1f", "#222831", "#a32323", "#244a8a", "#e1b12c", "#2f7d4a", "#6b2f8a", "#cfcfcf", "#d9692a", "#101010"];
    const d = new THREE.Object3D(), cor = new THREE.Color(); let n = 0;
    for (const lado of [-1, 1]) for (const y of niveis) {
      const tabua = caixa(0.3, 0.04, 6.3, mat("#5b4330")); tabua.position.set(lado * (W / 2 - 0.15), y, 0); cena.add(tabua);
      for (let i = 0; i < porNivel; i++) {
        d.position.set(lado * (W / 2 - 0.17), y + 0.115 + (r() - 0.5) * 0.01, -3.0 + i * 0.0465); d.rotation.set(0, 0, (r() - 0.5) * 0.04); d.updateMatrix();
        fitas.setMatrixAt(n, d.matrix); fitas.setColorAt(n, cor.set(paleta[Math.floor(r() * paleta.length)])); n++;
      }
    }
    fitas.castShadow = false; cena.add(fitas);
    // neon e cartazes no fundo
    const cn = tela(1024, 240), g = cn.getContext("2d")!; g.fillStyle = "#0a0610"; g.fillRect(0, 0, 1024, 240);
    g.textAlign = "center"; g.textBaseline = "middle"; g.font = "bold 150px Arial"; g.fillStyle = "#ff4fb0"; g.shadowColor = "#ff2e9a"; g.shadowBlur = 40; g.fillText("LOCADORA", 512, 105);
    g.font = "bold 46px Arial"; g.fillStyle = "#58e1ff"; g.shadowColor = "#2ec9ff"; g.shadowBlur = 24; g.fillText("ABERTO ATÉ 3:33", 512, 205);
    this.neon = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.61), emissivo(textura(cn))); this.neon.position.set(0, 2.05, -D / 2 + 0.08); cena.add(this.neon);
    const lm = new THREE.PointLight("#ff3fa4", 4, 5, 1.5); lm.position.set(-0.6, 2.0, -D / 2 + 0.7); cena.add(lm);
    const lc = new THREE.PointLight("#38d5ff", 3, 5, 1.5); lc.position.set(0.8, 2.0, -D / 2 + 0.7); cena.add(lc);
    for (const [x, cc] of [[-1.5, "#7a1f1f"], [1.5, "#1f3a7a"]] as const) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0), new THREE.MeshStandardMaterial({ color: cc, roughness: 0.9 })); p.position.set(x, 1.4, -D / 2 + 0.06); cena.add(p); }
    // balcão, tevê de tubo, videocassete e a fita
    const balcao = caixa(2.0, 1.0, 0.7, mat("#4a3322")); balcao.position.set(0, 0.5, -2.4); cena.add(balcao);
    const tampo = caixa(2.1, 0.05, 0.8, mat("#6b4a30")); tampo.position.set(0, 1.025, -2.4); cena.add(tampo);
    const tv = caixa(0.62, 0.52, 0.5, mat("#1b1b1f"), 0.03); tv.position.set(0.35, 1.32, -2.4); cena.add(tv);
    this.telaTv = tela(256, 192); this.texTv = textura(this.telaTv);
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.345), emissivo(this.texTv)); sc.position.set(0.35, 1.34, -2.4 + 0.256); cena.add(sc);
    this.luzTv = new THREE.PointLight("#bcd4ff", 1.6, 3.5, 1.6); this.luzTv.position.set(0.35, 1.34, -2.0); cena.add(this.luzTv);
    const vcr = caixa(0.55, 0.09, 0.4, mat("#0d0d10")); vcr.position.set(-0.5, 1.1, -2.45); cena.add(vcr);
    this.fita = new THREE.Group(); const corpoFita = caixa(0.19, 0.03, 0.105, mat("#0c0c0e")); this.fita.add(corpoFita);
    this.telaFita = tela(256, 140); this.texFita = textura(this.telaFita);
    const rot = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.09), new THREE.MeshStandardMaterial({ map: this.texFita, roughness: 0.8 })); rot.rotation.x = -Math.PI / 2; rot.position.y = 0.0162; this.fita.add(rot);
    cena.add(this.fita);
    this.etiquetaFita("AMANHÃ", "05/11 · 03:33");
    this.caio = new Boneco(APARENCIAS.caio); cena.add(this.caio.raiz);
    this.padrao();
  }
  etiquetaFita(l1: string, l2: string) {
    const g = this.telaFita.getContext("2d")!; g.fillStyle = "#f2f0e6"; g.fillRect(0, 0, 256, 140);
    g.fillStyle = "#b11a1a"; g.fillRect(0, 0, 256, 18); g.fillStyle = "#111"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "bold 50px Arial"; g.fillText(l1, 128, 66); g.font = "bold 26px 'Courier New', monospace"; g.fillText(l2, 128, 108);
    this.texFita.needsUpdate = true;
  }
  /** Tela da tevê. modo: "chiado" | "caio" | "virado". `sombra` 0..1 faz aparecer o vulto atrás dele; `t` anima o ruído. */
  tv(modo: "chiado" | "caio" | "virado", t: number, sombra = 0) {
    const g = this.telaTv.getContext("2d")!;
    if (modo === "chiado") {
      const im = g.createImageData(64, 48), rn = sorteio(Math.floor(t * 24) + 5);
      for (let i = 0; i < 64 * 48; i++) { const v = 40 + rn() * 190; im.data[i * 4] = v; im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v * 1.04; im.data[i * 4 + 3] = 255; }
      const c = tela(64, 48); c.getContext("2d")!.putImageData(im, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, 256, 192);
    } else {
      g.fillStyle = "#3c3a3f"; g.fillRect(0, 0, 256, 192); g.fillStyle = "#2a2830"; g.fillRect(0, 150, 256, 42);
      g.fillStyle = "#5a4430"; g.fillRect(0, 128, 256, 30); // o balcão visto pela fita
      if (sombra > 0) { g.fillStyle = `rgba(6,6,8,${0.55 + 0.45 * sombra})`; g.beginPath(); g.ellipse(196, 80, 30, 36, 0, 0, Math.PI * 2); g.fill(); g.fillRect(168, 112, 56, 90);
        g.fillStyle = `rgba(255,255,255,${sombra})`; g.fillRect(186, 74, 6, 5); g.fillRect(200, 74, 6, 5); }
      const x = 100, y = 98, vir = modo === "virado";
      g.fillStyle = "#b5651d"; g.beginPath(); g.ellipse(x, 170, 52, 52, 0, Math.PI, 0); g.fill();            // blusa
      g.fillStyle = "#e0b08c"; g.beginPath(); g.arc(x, y, 38, 0, Math.PI * 2); g.fill();                     // cabeça
      g.fillStyle = "#2d2118"; g.beginPath(); g.arc(x, y - 8, 38, Math.PI, 0); g.fill();                       // cabelo
      g.fillStyle = "#111"; const olho = vir ? 8 : 5; g.beginPath(); g.ellipse(x - 14, y + 2, olho, olho * 1.3, 0, 0, Math.PI * 2); g.ellipse(x + 14, y + 2, olho, olho * 1.3, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#111"; g.lineWidth = 3; g.beginPath(); if (vir) g.ellipse(x, y + 22, 7, 10, 0, 0, Math.PI * 2); else g.arc(x, y + 20, 8, 0.1, Math.PI - 0.1); g.stroke();
    }
    // linhas da fita e brilho
    g.fillStyle = "rgba(0,0,0,0.18)"; for (let y = 0; y < 192; y += 4) g.fillRect(0, y, 256, 1.5);
    g.fillStyle = "rgba(255,255,255,0.10)"; g.fillRect(0, (t * 90) % 220 - 20, 256, 14);
    this.texTv.needsUpdate = true;
  }
  /** Põe a fita na mão do Caio (coordenadas do mundo) ou de volta no balcão. */
  fitaNoBalcao() { this.fita.position.set(-0.55, 1.06, -2.15); this.fita.rotation.set(0, 0.2, 0); }
  fitaNaMao() {
    this.caio.raiz.updateMatrixWorld(true); const v = new THREE.Vector3(); this.caio.maoD.getWorldPosition(v);
    this.fita.position.set(v.x, v.y + 0.02, v.z - 0.02); this.fita.rotation.set(0.9, 0.2, 0);
  }
  atualizar(t: number) {
    const baixo = Math.sin(t * 21) > 0.7 && Math.sin(t * 2.7) > 0.2;
    this.luzesTeto[1].intensity = baixo ? 0.6 : 3.2; this.tubos[1].color.set(baixo ? "#4a4f5c" : "#f1f6ff");
  }
  padrao() { this.caio.raiz.visible = false; this.fitaNoBalcao(); this.tv("chiado", 0); this.etiquetaFita("AMANHÃ", "05/11 · 03:33"); }
}
const CAIO_PE = (t: number, extra: Pose = {}): Pose => ({ ...POSES.em_pe(t), ...extra });
function caioEm(m: Mundo, x: number, z: number, olharPara: number, pose: Pose) {
  const c = m.locadora.caio; c.raiz.visible = true; c.raiz.position.set(x, 0, z); c.raiz.rotation.set(0, olharPara, 0); c.posar(pose);
}

// ================================================================ planos dos pilotos
const ANDA = (s: number) => 4.5 * s; // o trem anda ~4,5 m/s antes de parar

export const PLANOS_PILOTOS: Record<string, Plano> = {
  // ---------------- piloto 1: Próxima estação
  vagao_plataforma: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao;
    v.mover(0, 1); v.limpa(true); v.passo(0); v.painelTexto("ESTAÇÃO", "13", "#ff3b3b"); v.atualizar(s, 0.5);
    return { cena: "vagao", pos: mix([-1.05, 1.25, 1.0], [-0.8, 1.3, 1.0], p), alvo: [2.8, 1.45, 0.9], fov: 74, rolar: 0.05 - 0.03 * p };
  },
  vagao_lia: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao;
    liaSenta(m, LIA_BANCO(s, { cabeca: [20 - 20 * p, 10 - 10 * p, 5 - 5 * p], olhos: 0.25 + 0.6 * p, sobrancelha: -0.7 * p, boca: "neutra" }));
    v.mover(ANDA(s) * 2.2, 0, 11); v.limpa(true); v.atualizar(s, 0.5);
    const c = cab(v.lia);
    return { cena: "vagao", pos: mix([c[0] + 1.4, c[1] + 0.1, c[2] + 2.6], [c[0] + 1.2, c[1] + 0.05, c[2] + 2.25], p), alvo: [c[0] - 0.05, c[1] - 0.15, c[2]], fov: 38 };
  },
  vagao_painel: (s, dur, m) => {
    const v = m.vagao; v.mover(ANDA(s) * 2.2, 0, 12); v.limpa(false);
    v.painelTexto("PRÓXIMA ESTAÇÃO", s > dur * 0.35 ? "13" : "12", s > dur * 0.35 ? "#ff3b3b" : "#ffb000"); v.atualizar(s, 0.8);
    return { cena: "vagao", pos: mix([0.6, 1.75, -3.9], [0.62, 1.85, -4.3], suave(s / dur)), alvo: [0.62, 2.05, -6], fov: 58 };
  },
  vagao_mapa: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao;
    v.mapaTexto(suave((s - dur * 0.5) / 0.8)); v.mover(ANDA(s) * 2.2, 0); v.limpa(false); v.atualizar(s, 0.8);
    return { cena: "vagao", pos: [-0.95, 1.3 - 0.5 * p, -4.3], alvo: [-0.98, 1.55 - 0.85 * p, -6], fov: 44 };
  },
  vagao_lia_choro: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao;
    liaSenta(m, LIA_BANCO(s, { cabeca: [24 + 4 * p, -6, -3], olhos: 0.75, sobrancelha: 1, boca: "triste" }));
    v.mover(ANDA(s) * 2.2, 0); v.limpa(true); v.atualizar(s, 0.6);
    const c = cab(v.lia);
    return { cena: "vagao", pos: mix([c[0] + 1.5, c[1] + 0.1, c[2] + 2.5], [c[0] + 1.3, c[1] + 0.05, c[2] + 2.2], p), alvo: [c[0] - 0.05, c[1] - 0.2, c[2]], fov: 38 };
  },
  vagao_janela: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao;
    v.mover(0, 1); v.limpa(true); v.passo(0); v.painelTexto("ESTAÇÃO", "13", "#ff3b3b"); v.atualizar(s, 0.9);
    return { cena: "vagao", pos: mix([-0.2, 1.05, 1.0], [0.25, 1.15, 1.0], p), alvo: [2.9, 1.65, 1.1], fov: 42, rolar: -0.04 };
  },
  vagao_porta: (s, dur, m) => {
    const p = suave(s / (dur * 0.7)), v = m.vagao, l = v.lia;
    l.raiz.visible = true; l.raiz.position.set(0, 0, -1.2); l.raiz.rotation.set(0, Math.PI, 0); l.posar({ ...POSES.em_pe(s), cabeca: [0, 0, 0] });
    v.mover(0, 1); v.limpa(true); v.porta(p); v.passo(suave(s / dur)); v.painelTexto("PORTAS ABERTAS", "13", "#ff3b3b"); v.atualizar(s, 0.9);
    return { cena: "vagao", pos: mix([0.3, 1.2, 3.8], [0.1, 1.25, 2.1], suave(s / dur)), alvo: [0, 1.1, -6], fov: 58 };
  },
  vagao_lia_det: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao, l = v.lia;
    l.raiz.visible = true; l.raiz.position.set(0, 0, -1.6); l.raiz.rotation.set(0, Math.PI, 0);
    l.posar({ ...POSES.em_pe(s), olhos: 1.0, sobrancelha: -1, boca: "neutra", cabeca: [-6, 0, 0] });
    v.mover(0, 1); v.limpa(true); v.porta(1); v.passo(1); v.atualizar(s, 0.9);
    return { cena: "vagao", pos: mix([0.0, 1.25, -4.4], [0.0, 1.2, -3.9], p), alvo: [0, 1.05, -1.6], fov: 40 };
  },

  // ---------------- Próxima estação, ep. 1 (07/11/2026): gancho no rosto, closes de meio corpo, luzes apagando, o passo
  pe_gancho: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao, f = v.perto, snap = lim((s - (dur - 0.85)) / 0.12);
    v.mover(0, 1); v.limpa(true); v.passo(0); v.painelTexto("ESTAÇÃO", "13", "#ff3b3b"); v.atualizar(s, 0.7);
    f.raiz.visible = true; f.raiz.position.x = Vagao.W / 2 + 0.42 - 0.08 * snap;
    f.posar({ ...POSES.em_pe(s), olhos: 1.3, vazio: true, sobrancelha: 0, boca: "neutra", cabeca: [4 * snap, 0, -16 - 6 * p + 16 * snap] });
    v.luzLia.intensity = 2.2; v.luzLia.position.set(Vagao.W / 2 - 0.2, 2.0, 1.1);
    return { cena: "vagao", pos: mix([-1.25, 1.05, 0.95], [-0.2, 1.12, 0.92], p), alvo: [Vagao.W / 2 + 0.42, 1.68, 0.9], fov: 58 - 6 * p, rolar: 0.03 * (1 - p) };
  },
  pe_lia: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao;
    const pisc = Math.abs(s - dur * 0.45) < 0.08 ? 0.1 : 1, olha = s > dur * 0.5 ? Math.sin((s - dur * 0.5) * 4.2) * 28 * suave((s - dur * 0.5) / 0.4) : 0;
    liaSenta(m, LIA_BANCO(s, { cabeca: [22 - 26 * p, 12 - 12 * p + olha, 6 - 6 * p], olhos: (0.2 + 1.1 * p) * pisc, sobrancelha: 0.9 * p, boca: p > 0.75 ? "aberta" : "neutra" }));
    v.mover(ANDA(s) * 2.2, 0, 11); v.limpa(true); v.atualizar(s, 0.3); luzRosto(m, 1.5);
    return liaMeio(m, p);
  },
  pe_lia_desconfia: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao;
    liaSenta(m, LIA_BANCO(s, { cabeca: [-6 - 6 * p, 22 * p, 0], tronco: [2 - 6 * p, 0, 0], olhos: 0.85 + 0.5 * p, sobrancelha: -0.6 + 1.5 * p, boca: p > 0.6 ? "triste" : "neutra" }));
    v.mover(ANDA(s) * 2.2, 0); v.limpa(true); v.atualizar(s, 0.6);
    return liaMeio(m, p);
  },
  pe_parou: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao, chega = suave(s / (dur * 0.4));
    liaSenta(m, { ...POSES.sentada_olhando_cima(s), olhos: 1.35, sobrancelha: 1, boca: "neutra" });
    v.mover(ANDA(s) * 2.2 * (1 - chega), chega); v.limpa(true); v.passo(0);
    v.apagadas = s < dur * 0.4 ? 0 : Math.min(4, 1 + Math.floor((s - dur * 0.4) / (dur * 0.12)));
    v.atualizar(s, 0.2); v.painelTexto("ESTAÇÃO", "13", "#ff3b3b");
    luzRosto(m, 0.9);
    return { cena: "vagao", pos: mix([0.35, 1.75, 5.5], [0.3, 1.7, 5.0], p), alvo: [-0.3, 1.0, -3], fov: 58 };
  },
  pe_janela: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao;
    v.mover(0, 1); v.limpa(true); v.passo(0); v.apagadas = 3; v.painelTexto("ESTAÇÃO", "13", "#ff3b3b"); v.atualizar(s, 0.9);
    return { cena: "vagao", pos: mix([-1.3, 1.2, 1.6], [-0.9, 1.25, 1.4], p), alvo: [2.9, 1.55, 0.2], fov: 64, rolar: -0.03 };
  },
  pe_lia_medo: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao;
    liaSenta(m, LIA_BANCO(s, { cabeca: [-2, -14 - 8 * p, 3], tronco: [-4, 0, 0], olhos: 1.05 + 0.45 * p, sobrancelha: 0.4 + 0.6 * p, boca: p > 0.7 ? "medo" : p > 0.35 ? "aberta" : "neutra" }));
    v.mover(0, 1); v.limpa(true); v.apagadas = 3; v.atualizar(s, 0.9); luzRosto(m, 1.2);
    return liaMeio(m, p, 0.2);
  },
  pe_relogio: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao;
    v.mover(0, 1); v.limpa(false); v.passo(0); v.apagadas = 3; v.atualizar(s, 0.9);
    // dois tiques e trava: o ponteiro tenta passar do 33 e treme no mesmo lugar
    const tiq = s < 0.1 ? 0 : s < 1.1 ? 1 : 2, trava = s > 1.1 ? Math.sin(s * 47) * 0.035 * Math.max(0, Math.sin(s * 2.3)) : 0;
    v.ponteiroSeg.rotation.x = -(tiq * 6 * Math.PI) / 180 - trava;
    return { cena: "vagao", pos: mix([0.75, 1.8, -2.3], [1.05, 1.88, -2.38], p), alvo: [Vagao.W / 2 + 2.33, 2.42, -2.4], fov: 26 };
  },
  pe_porta: (s, dur, m) => {
    const p = suave(s / (dur * 0.6)), v = m.vagao, l = v.lia;
    l.raiz.visible = true; l.raiz.position.set(0, 0, -1.2); l.raiz.rotation.set(0, Math.PI, 0); l.posar({ ...POSES.em_pe(s), cabeca: [0, 0, 0] });
    v.mover(0, 1); v.limpa(true); v.porta(p); v.passo(0); v.apagadas = 2; v.painelTexto("PORTAS ABERTAS", "13", "#ff3b3b"); v.atualizar(s, 0.9);
    return { cena: "vagao", pos: mix([0.3, 1.25, 3.8], [0.15, 1.25, 2.4], suave(s / dur)), alvo: [0, 1.1, -6], fov: 58 };
  },
  pe_passo: (s, dur, m) => {
    const v = m.vagao, t0 = dur - 1.55, k = suave((s - t0) / 0.22), treme = s > t0 && s < t0 + 0.5 ? Math.sin(s * 60) * 0.025 * (1 - (s - t0) / 0.5) : 0;
    v.mover(0, 1); v.limpa(true); v.apagadas = 3; v.retos = k; v.passo(k); v.atualizar(s, 0.9);
    v.luzPlat2.position.set(Vagao.W / 2 + 0.7, 2.3, 0.6); v.luzPlat2.intensity = 3 + 14 * k;
    return { cena: "vagao", pos: mix([-0.9, 1.0, 1.3], [-0.55, 1.02, 1.2], suave(s / dur)), alvo: [2.9, 1.75 + treme, 0.6], fov: 56, rolar: treme };
  },
  pe_lia_det: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao, l = v.lia;
    l.raiz.visible = true; l.raiz.position.set(0, 0, -1.6); l.raiz.rotation.set(0, Math.PI, 0);
    l.posar({ ...POSES.em_pe(s), olhos: 1.05, sobrancelha: -0.7 + 0.4 * p, boca: "neutra", cabeca: [-5, 8 * p, 0] });
    v.mover(0, 1); v.limpa(true); v.porta(1); v.passo(1); v.retos = 1; v.apagadas = 3; v.atualizar(s, 0.9); luzRosto(m, 1.3, -1);
    return { cena: "vagao", pos: mix([0.15, 1.3, -4.7], [0.1, 1.3, -4.3], p), alvo: [0, 1.28, -1.6], fov: 50 };
  },
  pe_final: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao;
    v.mover(0, 1); v.limpa(true); v.passo(1); v.retos = 1; v.apagadas = 4; v.atualizar(s, 0.9); v.luzPlat2.position.set(Vagao.W / 2 + 0.7, 2.3, 0.6); v.luzPlat2.intensity = 12;
    return { cena: "vagao", pos: mix([-0.9, 1.0, 1.0], [-0.3, 1.05, 0.8], p), alvo: [2.6, 1.78, 0.6], fov: 54 };
  },

  // ---------------- Próxima estação, ep. 2 (09/11/2026): "A cabine" (caminho alternativo depois do empate)
  p2_hook: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao, l = v.lia;
    v.mover(0, 0); v.limpa(true); v.apagadas = 1; v.atualizar(s, 0.8); v.filaAnda(0.56 + 0.16 * p, s);
    l.raiz.visible = true; l.raiz.position.set(0.0, 0, 0.1 - 1.4 * p); l.raiz.rotation.set(0, Math.PI, 0);
    l.posar({ ...POSES.andando(s * 2.1), tronco: [10, 0, 0], cabeca: [2, 0, 0], olhos: 1.5, sobrancelha: 1, boca: "medo" });
    v.luzLia.intensity = 1.5; v.luzLia.position.set(0.3, 2.0, l.raiz.position.z - 1.0);
    return { cena: "vagao", pos: mix([0.0, 1.15, -3.0], [0.05, 1.3, -3.5], p), alvo: [0, 1.35, 2.0], fov: 58 - 6 * p, rolar: 0.05 * (1 - p) };
  },
  p2_corre_lado: (s, dur, m) => {
    const p = s / dur, v = m.vagao, l = v.lia, z = 3.0 - 5.2 * p;
    v.mover(0, 1); v.limpa(false); v.passo(0); v.apagadas = 1; v.atualizar(s, 0.8);
    l.raiz.visible = true; l.raiz.position.set(0.6, 0, z); l.raiz.rotation.set(0, Math.PI, 0);
    l.posar({ ...POSES.andando(s * 2.4), tronco: [12, 0, 0], olhos: 1.4, sobrancelha: 1, boca: "medo" });
    v.luzLia.intensity = 1.6; v.luzLia.position.set(-0.5, 1.9, z + 0.5);
    return { cena: "vagao", pos: [-1.18, 1.0, z + 0.7], alvo: [0.55, 1.0, z - 0.2], fov: 66 };
  },
  p2_corre_tras: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao, l = v.lia, z = 1.5 - 5.9 * p;
    v.mover(0, 0); v.limpa(true); v.apagadas = 2; v.atualizar(s, 0.9); v.placaCab.visible = true; v.filaAnda(0.45 + 0.15 * p, s); v.luzPorta.intensity = 7;
    l.raiz.visible = true; l.raiz.position.set(0.05, 0, z); l.raiz.rotation.set(0, Math.PI, 0);
    l.posar({ ...POSES.andando(s * 2.4), tronco: [12, 0, 0] }); v.luzLia.intensity = 1.6; v.luzLia.position.set(0, 2.1, z + 1.6);
    return { cena: "vagao", pos: [0.0, 1.55 - 0.2 * p, z + 2.6 - 0.5 * p], alvo: [0, 1.15, -6.0], fov: 62 - 6 * p, rolar: -0.03 + 0.06 * p };
  },
  p2_entra: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao;
    v.mover(0, 1); v.limpa(true); v.apagadas = 2; v.atualizar(s, 0.9); v.filaAnda(0.32 + 0.62 * p, s, 8.2, 9);
    return { cena: "vagao", pos: [0.0, 1.15, -3.4 - 0.8 * p], alvo: [0, 1.5, 3.0], fov: 52 - 4 * p, rolar: 0.02 };
  },
  p2_painel: (s, dur, m) => {
    const v = m.vagao; v.mover(0, 1); v.limpa(false); v.apagadas = 3; v.atualizar(s, 0.9);
    v.painelTexto("EMBARQUE", s > dur * 0.3 ? "LIVRE" : "----", "#ff3b3b");
    return { cena: "vagao", pos: mix([0.58, 1.8, -3.5], [0.62, 1.9, -4.5], suave(s / dur)), alvo: [0.62, 2.05, -6], fov: 56 };
  },
  p2_porta_cab: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao, l = v.lia, z = -0.6 - 4.2 * p;
    v.mover(0, 0); v.limpa(true); v.apagadas = 1; v.atualizar(s, 0.9); v.placaCab.visible = true; v.luzPorta.intensity = 8; v.luzLia.intensity = 1.6; v.luzLia.position.set(0, 2.1, z + 1.6);
    l.raiz.visible = true; l.raiz.position.set(0.05, 0, z); l.raiz.rotation.set(0, Math.PI, 0); l.posar({ ...POSES.andando(s * 1.8), cabeca: [0, -10 * Math.sin(s * 1.2), 0] });
    return { cena: "vagao", pos: mix([0.2, 1.6, 2.2], [0.05, 1.45, -2.2], p), alvo: [0, 1.5, -6.0], fov: 54 - 8 * p };
  },
  p2_cabine_vidro: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao, l = v.lia;
    cabineLuz(m, 3.5); v.cabine.visible = true; v.desenhaVidro(Math.floor(4 + 22 * p));
    l.raiz.visible = true; l.raiz.position.set(-0.7, 0, -7.7); l.raiz.rotation.set(0, Math.PI, 0); l.posar({ ...POSES.em_pe(s), olhos: 1.2, cabeca: [-4, 6 * Math.sin(s), 0] });
    return { cena: "vagao", pos: mix([0.15, 1.45, -6.35], [0.0, 1.4, -7.05], p), alvo: [0, 1.4, -9.2], fov: 50 - 6 * p };
  },
  p2_cabine_lia: (s, dur, m) => {
    const p = suave(s / dur), v = m.vagao, l = v.lia;
    cabineLuz(m, 3.0); v.cabine.visible = true; v.desenhaVidro(26);
    const olha = Math.sin(s * 1.4) * 0.5;
    l.raiz.visible = true; l.raiz.position.set(0.05, 0, -6.55); l.raiz.rotation.set(0, Math.PI + olha * 0.25, 0);
    l.posar({ ...POSES.em_pe(s), cabeca: [-2, olha * 12, 0], olhos: 1.35 + 0.15 * p, sobrancelha: 1, boca: p > 0.5 ? "medo" : "neutra" });
    v.luzLia.intensity = 2.4; v.luzLia.position.set(-0.4, 2.0, -8.3);
    return { cena: "vagao", pos: mix([-0.1, 1.38, -9.02], [0.0, 1.4, -8.8], p), alvo: [0.05, 1.3, -6.55], fov: 54 - 4 * p };
  },
  p2_bate: (s, dur, m) => {
    const v = m.vagao, l = v.lia, t0 = dur - 2.3;
    let k = 0; for (const t of [t0, t0 + 0.6, t0 + 1.2]) if (s > t) k += Math.exp(-(s - t) * 9); const bat = Math.min(1.2, k);
    cabineLuz(m, 2.6 - 1.6 * bat); v.cabine.visible = true; v.desenhaVidro(26);
    v.frestaPorta.visible = true; for (const pe of v.pesFresta) pe.visible = s > 0.8; for (const o of v.mesaCab) o.visible = false;
    l.raiz.visible = true; l.raiz.position.set(-0.85, 0, -7.15); l.raiz.rotation.set(0, 0, 0);
    l.posar({ ...POSES.em_pe(s), tronco: [-4 * bat, 0, 0], cabeca: [-3, 0, 0], olhos: 1.45, sobrancelha: 1, boca: "medo", bracoE: [-20, 0, 12], bracoD: [-20, 0, -12] });
    v.luzLia.intensity = 1.4; v.luzLia.position.set(0.3, 1.9, -8.8);
    const sh = (Math.sin(s * 71) * 0.02 + Math.sin(s * 53) * 0.015) * bat;
    return { cena: "vagao", pos: mix([0.0, 1.7, -8.9], [0.0, 1.6, -8.5], suave(s / dur)), alvo: [0.0 + sh, 0.95 + sh, -6.15], fov: 66, rolar: sh * 1.4 };
  },
  p2_final_painel: (s, dur, m) => {
    const v = m.vagao, p = suave(s / dur);
    cabineLuz(m, 3.2); v.cabine.visible = true; v.desenhaVidro(26);
    v.painelCabinePainel("MAQUINISTA", Math.sin(s * 9) > 0.7 ? "" : "AUSENTE");
    return { cena: "vagao", pos: mix([0.25, 1.4, -7.4], [0.02, 1.3, -7.9], p), alvo: [0, 1.2, -8.85], fov: 40 };
  },
  p2_final_lia: (s, dur, m) => {
    const v = m.vagao, l = v.lia, p = suave(s / dur);
    cabineLuz(m, 3.0); v.cabine.visible = true; v.desenhaVidro(26); v.frestaPorta.visible = true; for (const pe of v.pesFresta) pe.visible = true;
    v.painelCabinePainel("MAQUINISTA", "AUSENTE");
    l.raiz.visible = true; l.raiz.position.set(-0.05, 0, -8.35); l.raiz.rotation.set(0, Math.PI - 0.3, 0);
    l.posar({ ...POSES.em_pe(s), cabeca: [4, -12 + 10 * p, 0], olhos: 1.25, sobrancelha: 0.5 - 1.2 * p, boca: "neutra", bracoE: [-70 - 15 * p, 0, 18], cotoveloE: 20 });
    v.luzLia.intensity = 2.2; v.luzLia.position.set(-0.6, 1.9, -7.2);
    return { cena: "vagao", pos: mix([-1.0, 1.8, -6.25], [-0.7, 1.75, -6.45], p), alvo: [0.1, 1.2, -8.6], fov: 56 };
  },

  // ---------------- piloto 2: Rádio Madrugada
  radio_hook: (s, dur, m) => {
    const e = m.estudio; locutorSenta(m, LOCUTOR_MESA(s));
    e.apagar(0, s); e.ondas(s, 0.5); e.relogio("3:33");
    return { cena: "estudio", pos: mix([-0.4, 1.85, 1.7], [-0.4, 1.95, 1.35], suave(s / dur)), alvo: [-0.4, 2.1, -1.62], fov: 74 };
  },
  radio_locutor: (s, dur, m) => {
    const e = m.estudio; const fala = Math.sin(s * 11) > 0;
    locutorSenta(m, LOCUTOR_MESA(s, { boca: fala ? "aberta" : "neutra", olhos: 1.1 })); e.apagar(0, s); e.ondas(s, 0.7);
    return { cena: "estudio", pos: mix([0.08, 1.56, 0.85], [0.06, 1.55, 0.55], suave(s / dur)), alvo: [0, 1.55, -0.8], fov: 34 };
  },
  radio_ouve: (s, dur, m) => {
    const e = m.estudio, p = suave(s / dur);
    locutorSenta(m, LOCUTOR_MESA(s, { boca: "neutra", olhos: 1.15 + 0.35 * p, sobrancelha: 1, cabeca: [3, -8 * p, 3 * p] })); e.apagar(0, s); e.ondas(s, 0.35);
    return { cena: "estudio", pos: mix([0.12, 1.57, 0.95], [0.1, 1.56, 0.62], p), alvo: [0, 1.55, -0.8], fov: 34 };
  },
  radio_ondas: (s, dur, m) => {
    const e = m.estudio; locutorSenta(m, LOCUTOR_MESA(s, { boca: "neutra", olhos: 1.2, sobrancelha: 1 })); e.apagar(0, s); e.ondas(s, 0.5 + 0.5 * suave(s / dur));
    for (let k = 0; k < e.ledsTel.length; k++) e.ledsTel[k].material.color.set(Math.floor(s * 6 + k) % 2 ? "#ff3b3b" : "#28d96a");
    return { cena: "estudio", pos: mix([0.2, 1.15, 1.1], [0.45, 1.08, 0.7], suave(s / dur)), alvo: [0.88, 1.05, 0.05], fov: 40 };
  },
  radio_telefone: (s, dur, m) => {
    const e = m.estudio; locutorSenta(m, LOCUTOR_MESA(s, { boca: "neutra", olhos: 1.2 })); e.apagar(0, s); e.ondas(s, 0.8);
    for (let k = 0; k < e.ledsTel.length; k++) e.ledsTel[k].material.color.set(Math.floor(s * 9 + k * 2) % 2 ? "#ff3b3b" : "#3a0a0a");
    return { cena: "estudio", pos: mix([-0.8, 1.2, 0.35], [-0.95, 1.0, 0.1], suave(s / dur)), alvo: [-1.0, 0.8, -0.38], fov: 38 };
  },
  radio_apagao: (s, dur, m) => {
    const e = m.estudio, p = suave((s - 0.3) / (dur * 0.5)), bate = lim((s - dur * 0.55) / 0.4);
    locutorSenta(m, LOCUTOR_MESA(s, { boca: p > 0.5 ? "medo" : "neutra", olhos: 1.1 + 0.5 * p, sobrancelha: 1, cabeca: [2, p > 0.6 ? 70 * lim((s - dur * 0.5) / 0.5) : 0, 0] }));
    e.apagar(p, s); e.relogio(p > 0.5 ? "3:34" : "3:33"); e.ondas(s, 0.2 * (1 - p));
    const v = e.visitante; v.raiz.visible = bate > 0; v.raiz.position.set(2.45, -0.03, -0.1); v.raiz.rotation.set(0, -Math.PI / 2, 0);
    v.posar({ ...POSES.em_pe(s), bracoD: [-92, 0, -12], cotoveloD: 60 + Math.max(0, Math.sin(s * 14)) * 40 });
    return { cena: "estudio", pos: mix([-1.3, 1.5, 1.6], [-1.0, 1.45, 1.3], suave(s / dur)), alvo: [1.2, 1.3, -0.3], fov: 66 };
  },
  radio_final: (s, dur, m) => {
    const e = m.estudio; locutorSenta(m, LOCUTOR_MESA(s, { boca: "neutra", olhos: 1.4, sobrancelha: 1, cabeca: [4, 18, 0] }));
    e.apagar(0.9, s); e.relogio("3:34");
    return { cena: "estudio", pos: mix([0.1, 1.5, 1.2], [0.05, 1.5, 0.75], suave(s / dur)), alvo: [0, 1.5, -0.8], fov: 38 };
  },

  // ---------------- piloto 3: A Locadora de Amanhã
  loc_hook: (s, dur, m) => {
    const l = m.locadora; l.atualizar(s); l.tv("chiado", s);
    return { cena: "locadora", pos: mix([-0.1, 1.7, -0.5], [-0.1, 1.55, -0.8], suave(s / dur)), alvo: [-0.1, 1.25, -2.3], fov: 66 };
  },
  loc_caio: (s, dur, m) => {
    const l = m.locadora; l.atualizar(s); caioEm(m, -0.3, -0.6, Math.PI, CAIO_PE(s, { bracoD: [-70, 0, -10], cotoveloD: 70, cabeca: [8, 0, 0] })); l.fitaNaMao(); l.tv("chiado", s);
    return { cena: "locadora", pos: mix([0.05, 1.5, -2.0], [0.0, 1.5, -1.9], suave(s / dur)), alvo: [-0.3, 1.45, -0.6], fov: 46 };
  },
  loc_costas: (s, dur, m) => {
    const l = m.locadora; l.atualizar(s); caioEm(m, -0.1, -1.1, Math.PI, CAIO_PE(s, { bracoD: [-88, 0, -6], cotoveloD: 30, cabeca: [4, 0, 0] })); l.fitaNoBalcao();
    l.fita.position.set(-0.5, 1.1, -2.42); l.fita.rotation.set(0, 0, 0); l.tv("chiado", s);
    return { cena: "locadora", pos: mix([-0.95, 1.65, 0.4], [-0.8, 1.6, 0.1], suave(s / dur)), alvo: [0.25, 1.3, -2.4], fov: 56 };
  },
  loc_tv_chiado: (s, dur, m) => {
    const l = m.locadora; l.atualizar(s); l.tv("chiado", s);
    return { cena: "locadora", pos: mix([0.3, 1.4, -0.7], [0.33, 1.36, -0.95], suave(s / dur)), alvo: [0.35, 1.34, -2.4], fov: 34 };
  },
  loc_tv_caio: (s, dur, m) => {
    const l = m.locadora; l.atualizar(s); l.tv("caio", s, lim((s - dur * 0.3) / (dur * 0.6)));
    return { cena: "locadora", pos: mix([0.3, 1.4, -0.7], [0.33, 1.36, -0.95], suave(s / dur)), alvo: [0.35, 1.34, -2.4], fov: 34 };
  },
  loc_tv_virado: (s, dur, m) => {
    const l = m.locadora; l.atualizar(s); l.tv("virado", s, 1);
    return { cena: "locadora", pos: mix([0.33, 1.36, -1.0], [0.35, 1.35, -1.25], suave(s / dur)), alvo: [0.35, 1.34, -2.4], fov: 24 };
  },
  loc_final: (s, dur, m) => {
    const l = m.locadora; l.atualizar(s); caioEm(m, -0.2, -0.7, Math.PI, CAIO_PE(s, { olhos: 1.4, sobrancelha: 1, boca: "medo", cabeca: [4, 0, 0] })); l.fitaNoBalcao(); l.tv("virado", s, 1);
    return { cena: "locadora", pos: mix([0.0, 1.5, -2.05], [0.0, 1.52, -1.95], suave(s / dur)), alvo: [-0.2, 1.5, -0.7], fov: 42 };
  },
};
