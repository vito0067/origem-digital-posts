// Biblioteca de planos (tomadas de câmera) da série. Cada plano recebe o tempo local (s), a duração e o mundo,
// arruma o cenário (poses, janelas, chuva, relâmpago) e devolve qual cena renderizar e onde fica a câmera.
import * as THREE from "three";
import { Cidade, Quarto, texturaTexto } from "./cenario";
import { POSES } from "./boneco";

export type Mundo = { cidade: Cidade; quarto: Quarto };
type V3 = [number, number, number];
export type Tomada = { cena: "cidade" | "quarto"; pos: V3; alvo: V3; fov?: number; rolar?: number };
export type Plano = (s: number, dur: number, m: Mundo) => Tomada;

const lim = (x: number) => Math.max(0, Math.min(1, x));
const suave = (x: number) => { const t = lim(x); return t * t * (3 - 2 * t); };
const mix = (a: V3, b: V3, p: number): V3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
const tremor = (s: number, f: number): V3 => [Math.sin(s * 13.1) * f, Math.sin(s * 9.7 + 1) * f * 0.7, Math.sin(s * 11.3 + 2) * f * 0.5];
const soma = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const ANDAR12 = (Cidade.JANELA_MARINA.andar - 1) * Cidade.ANDAR + 1.7;
const JX = Cidade.JANELA_MARINA.x, ZF = Cidade.TORRE.d / 2;

// estados da cidade
const cidadeDormindo = (m: Mundo, celulares: number) => m.cidade.pintarJanelas((j) => ({
  luz: j.ordem > 0.97 ? 1 : 0,
  celular: j.ordem < celulares ? 1 : 0,
}));
const cidadeEscura = (m: Mundo) => m.cidade.pintarJanelas((j) => ({ luz: j.ordem > 0.985 ? 1 : 0, celular: j.ordem < 0.5 ? 1 : 0 }));
const cidadeAcendendo = (m: Mundo, p: number) => m.cidade.pintarJanelas((j) => ({ luz: lim((p * 1.15 - j.ordem) * 8), celular: 1 }));

// quarto: a Marina sentada na beira da cama, de frente para a janela
let telaMensagem: any = null, telaNome: any = null;
function marinaNoQuarto(m: Mundo, s: number, pose: keyof typeof POSES, extra: Record<string, unknown> = {}, celular = true) {
  const q = m.quarto;
  q.marina.raiz.position.set(0.2, -0.1, -1.4); q.marina.raiz.rotation.set(0, Math.PI, 0);
  q.marina.posar({ ...POSES[pose](s), ...extra });
  q.marina.segurarCelular(celular);
  q.celularCama.visible = !celular;
}
/** Onde está a cabeça da Marina no quarto (para mirar a câmera no rosto). */
function cabeca(m: Mundo): V3 { const v = new THREE.Vector3(); m.quarto.marina.cabeca.getWorldPosition(v); return [v.x, v.y, v.z]; }
function telaCom(m: Mundo, qual: "mensagem" | "nome" | "luz") {
  if (!telaMensagem) {
    const desenha = (linha2: string) => {
      const c = document.createElement("canvas"); c.width = 256; c.height = 512; const g = c.getContext("2d")!;
      g.fillStyle = "#0e1424"; g.fillRect(0, 0, 256, 512);
      g.fillStyle = "#2b3352"; g.beginPath(); g.arc(128, 90, 34, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#c9d3ea"; g.font = "bold 44px Arial"; g.textAlign = "center"; g.fillText("?", 128, 106);
      g.fillStyle = "#f2f5ff"; g.font = "bold 20px Arial"; g.fillText("Remetente", 128, 160); g.fillText("desconhecido", 128, 184);
      g.fillStyle = "#26304f"; g.fillRect(24, 230, 208, 96); g.fillStyle = "#ffffff"; g.font = "bold 22px Arial"; g.textAlign = "left";
      linha2.split("|").forEach((l, k) => g.fillText(l, 38, 268 + k * 30));
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    };
    telaMensagem = desenha("Não olhe pela|janela.");
    telaNome = desenha("Marina.");
  }
  const mat = m.quarto.marina.telaCelular.material;
  mat.map = qual === "mensagem" ? telaMensagem : qual === "nome" ? telaNome : null; mat.color.set(qual === "luz" ? "#9cc8ff" : "#ffffff"); mat.needsUpdate = true;
}

export const PLANOS: Record<string, Plano> = {
  // ---------------- cidade
  cidade_aerea: (s, dur, m) => {
    const p = suave(s / dur);
    cidadeDormindo(m, lim(s / dur) * 0.55);
    m.cidade.atualizar(s, [10, 40, 20]);
    return { cena: "cidade", pos: mix([70, 105, 120], [45, 78, 88], p), alvo: mix([0, 14, -20], [0, 20, -6], p), fov: 65 };
  },
  fachadas_celulares: (s, dur, m) => {
    const p = suave(s / dur);
    cidadeDormindo(m, 0.15 + lim(s / dur) * 0.85);
    m.cidade.atualizar(s, [-30, 20, 20]);
    return { cena: "cidade", pos: mix([-78, 22, 62], [-48, 22, 56], p), alvo: mix([-52, 15, -2], [-24, 17, -2], p), fov: 55 };
  },
  torre_aproxima: (s, dur, m) => {
    const p = suave(s / dur);
    cidadeDormindo(m, 1);
    m.cidade.atualizar(s, [3, 30, 14]);
    return { cena: "cidade", pos: mix([14, 18, 46], [3.5, 33.5, 13], p), alvo: mix([1, 26, 0], [JX, ANDAR12, ZF], p), fov: 59 };
  },
  rua_luzes: (s, dur, m) => {
    const p = s / dur;
    cidadeAcendendo(m, p);
    m.cidade.atualizar(s, [-6, 10, 22]);
    return { cena: "cidade", pos: mix([-14, 1.7, 28], [-11, 2.4, 25], suave(p)), alvo: [-2, 20, -4], fov: 78 };
  },
  aerea_luzes: (s, dur, m) => {
    const p = s / dur;
    cidadeAcendendo(m, 0.35 + p * 0.65);
    m.cidade.atualizar(s, [0, 60, 0]);
    return { cena: "cidade", pos: mix([8, 150, 60], [4, 130, 45], suave(p)), alvo: [0, 0, -25], fov: 70 };
  },
  foto_janela: (s, _d, m) => {
    cidadeEscura(m);
    m.cidade.atualizar(s + 3, [JX, ANDAR12, 12]);
    m.cidade.rotulo12.visible = false;
    return { cena: "cidade", pos: [JX + 0.4, ANDAR12 + 0.2, 13.5], alvo: [JX, ANDAR12 - 0.1, ZF], fov: 56 };
  },
  recuo_12: (s, dur, m) => {
    const p = suave(s / dur);
    cidadeEscura(m);
    m.cidade.atualizar(s, [JX, ANDAR12 - 6, 20]);
    m.cidade.rotulo12.visible = s > 1.3;
    const pos = soma(mix([JX, ANDAR12 + 0.1, 11], [JX + 10, ANDAR12 - 2, 62], p), tremor(s, 0.05));
    return { cena: "cidade", pos, alvo: mix([JX, ANDAR12, ZF], [JX, 20, 0], p), fov: 62 };
  },

  // ---------------- quarto
  quarto_lado: (s, dur, m) => {
    const p = suave(s / dur);
    marinaNoQuarto(m, s, "sentada_celular", { olhos: 1, sobrancelha: 0.4 }); telaCom(m, "luz");
    m.quarto.atualizar(s);
    return { cena: "quarto", pos: mix([2.15, 1.5, -0.55], [1.85, 1.42, -0.8], p), alvo: [0.2, 1.05, -1.7], fov: 62 };
  },
  quarto_rosto: (s, dur, m) => {
    const p = suave(s / dur);
    marinaNoQuarto(m, s, "sentada_celular", { olhos: 0.9, sobrancelha: 0.8, cabeca: [16, 0, 8 * p] }); telaCom(m, "luz");
    m.quarto.atualizar(s);
    const c = cabeca(m); return { cena: "quarto", pos: mix([c[0] + 0.4, c[1] - 0.12, c[2] - 1.0], [c[0] + 0.28, c[1] - 0.1, c[2] - 0.85], p), alvo: [c[0], c[1] - 0.2, c[2]], fov: 62 };
  },
  rosto_mensagem: (s, dur, m) => {
    const p = suave(s / dur);
    marinaNoQuarto(m, s, "sentada_celular", { olhos: 1.1, sobrancelha: 0.9, cabeca: [14, 0, -6 * p] }); telaCom(m, "mensagem");
    m.quarto.atualizar(s);
    const c = cabeca(m); return { cena: "quarto", pos: mix([c[0] - 0.3, c[1] - 0.15, c[2] - 1.0], [c[0] - 0.2, c[1] - 0.12, c[2] - 0.85], p), alvo: [c[0], c[1] - 0.25, c[2]], fov: 62 };
  },
  ombro_celular: (s, dur, m) => {
    const p = suave(s / dur);
    marinaNoQuarto(m, s, "sentada_celular", { olhos: 1.1, sobrancelha: 0.6 }); telaCom(m, "mensagem");
    m.quarto.atualizar(s);
    const cel = new THREE.Vector3(); m.quarto.marina.celular.getWorldPosition(cel); const c = cabeca(m);
    return { cena: "quarto", pos: mix([c[0] + 0.62, c[1] + 0.3, c[2] + 0.5], [c[0] + 0.5, c[1] + 0.22, c[2] + 0.38], p), alvo: [cel.x, cel.y, cel.z], fov: 55 };
  },
  janela_costas: (s, dur, m) => {
    const p = suave(s / dur);
    marinaNoQuarto(m, s, "sentada_olhando_cima", { cabeca: [-6 - 8 * p, 0, 0] }); telaCom(m, "luz");
    const flash = s > dur - 0.75 ? Math.max(0, 1 - (s - (dur - 0.75)) * 4) : 0;
    m.quarto.atualizar(s, flash);
    return { cena: "quarto", pos: mix([0.2, 1.5, 0.9], [0.2, 1.45, 0.35], p), alvo: [0.1, 1.45, -2.5], fov: 74 };
  },
  celular_vibra: (s, _d, m) => {
    marinaNoQuarto(m, s, "sentada_olhando_cima", { olhos: 1.2 }, false);
    const vib = Math.floor(s * 18) % 2 ? 0.006 : -0.006;
    m.quarto.celularCama.position.set(0.6 + vib, 0.43, -1.05); m.quarto.celularCama.rotation.y = 0.4 + vib * 6;
    telaCom(m, "nome"); m.quarto.telaCama.material.map = m.quarto.marina.telaCelular.material.map; m.quarto.telaCama.material.needsUpdate = true;
    m.quarto.atualizar(s);
    return { cena: "quarto", pos: [0.75, 1.2, -0.7], alvo: [0.6, 0.43, -1.05], fov: 62, rolar: Math.sin(s * 40) * 0.004 };
  },
  rosto_medo: (s, dur, m) => {
    const p = suave(s / (dur * 0.6));
    marinaNoQuarto(m, s, "sentada_celular", { olhos: 1 + 0.55 * p, sobrancelha: 1, boca: p > 0.5 ? "medo" : "neutra", cabeca: [12, 0, 0] }); telaCom(m, "nome");
    m.quarto.atualizar(s);
    const c = cabeca(m); return { cena: "quarto", pos: mix([c[0] + 0.08, c[1] - 0.06, c[2] - 1.0], [c[0] + 0.04, c[1] - 0.04, c[2] - 0.8], suave(s / dur)), alvo: [c[0], c[1] - 0.1, c[2]], fov: 58 };
  },
};
