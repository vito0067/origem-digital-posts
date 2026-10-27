// Biblioteca de planos (tomadas de câmera) da série. Cada plano recebe o tempo local (s), a duração e o mundo,
// arruma o cenário (poses, janelas, chuva, relâmpago) e devolve qual cena renderizar e onde fica a câmera.
import * as THREE from "three";
import { Cidade, Quarto, texturaTexto } from "./cenario";
import { Portaria } from "./portaria";
import { Corredor } from "./corredor";
import { Sala1201 } from "./sala1201";
import { POSES } from "./boneco";

export type Mundo = { cidade: Cidade; quarto: Quarto; portaria: Portaria; corredor: Corredor; sala1201: Sala1201 };
type V3 = [number, number, number];
export type Tomada = { cena: "cidade" | "quarto" | "portaria" | "corredor" | "sala1201"; pos: V3; alvo: V3; fov?: number; rolar?: number };
export type Plano = (s: number, dur: number, m: Mundo) => Tomada;

const lim = (x: number) => Math.max(0, Math.min(1, x));
const suave = (x: number) => { const t = lim(x); return t * t * (3 - 2 * t); };
/** Movimento que já começa andando e freia no fim (dá energia ao corte, como no vídeo-modelo). */
const arranca = (x: number) => 1 - Math.pow(1 - lim(x), 2.4);
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
let telaMensagem: any = null, telaNome: any = null, telaGrupo: any = null;
function marinaNoQuarto(m: Mundo, s: number, pose: keyof typeof POSES, extra: Record<string, unknown> = {}, celular = true) {
  const q = m.quarto;
  q.marina.raiz.position.set(0.2, -0.1, -1.4); q.marina.raiz.rotation.set(0, Math.PI, 0);
  q.marina.posar({ ...POSES[pose](s), ...extra });
  q.marina.segurarCelular(celular);
  q.celularCama.visible = !celular;
}
/** Onde está a cabeça da Marina no quarto (para mirar a câmera no rosto). */
function cabeca(m: Mundo): V3 { const v = new THREE.Vector3(); m.quarto.marina.cabeca.getWorldPosition(v); return [v.x, v.y, v.z]; }
function desenhaGrupo() {
  const c = document.createElement("canvas"); c.width = 256; c.height = 512; const g = c.getContext("2d")!;
  g.fillStyle = "#0b141a"; g.fillRect(0, 0, 256, 512); g.fillStyle = "#1f2c34"; g.fillRect(0, 0, 256, 64);
  g.fillStyle = "#e9edef"; g.font = "bold 19px Arial"; g.fillText("Ed. Mirante", 16, 30); g.fillStyle = "#8696a0"; g.font = "15px Arial"; g.fillText("Moradores · 40 novas", 16, 52);
  ["1102", "804", "1201", "503", "1401", "702", "301"].forEach((n, k) => {
    const y = 80 + k * 62, dir = k % 3 === 1;
    g.fillStyle = dir ? "#005c4b" : "#1f2c34"; g.fillRect(dir ? 70 : 12, y, 174, 52);
    g.fillStyle = "#53bdeb"; g.font = "bold 13px Arial"; g.fillText("Ap " + n, dir ? 80 : 22, y + 17);
    g.fillStyle = "#3b4a54"; g.fillRect(dir ? 80 : 22, y + 24, 34, 22); g.fillStyle = "#e9edef"; g.font = "14px Arial"; g.fillText("Foto", dir ? 122 : 64, y + 41);
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function telaCom(m: Mundo, qual: "mensagem" | "nome" | "luz" | "grupo") {
  if (qual === "grupo") { telaGrupo ??= desenhaGrupo(); const mt = m.quarto.marina.telaCelular.material; mt.map = telaGrupo; mt.color.set("#ffffff"); mt.needsUpdate = true; return; }
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
    const p = arranca(s / dur);
    cidadeDormindo(m, lim(s / dur) * 0.55);
    m.cidade.atualizar(s, [10, 40, 20]);
    return { cena: "cidade", pos: mix([70, 105, 120], [45, 78, 88], p), alvo: mix([0, 14, -20], [0, 20, -6], p), fov: 65 };
  },
  fachadas_celulares: (s, dur, m) => {
    const p = arranca(s / dur);
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
    return { cena: "cidade", pos: mix([-14, 1.7, 19.5], [-11, 2.6, 18.5], arranca(p)), alvo: [-2, 20, -4], fov: 78 };
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

  // ---------------- cidade: a foto e o fotógrafo no ar (ep. 2)
  /** O zoom da foto: a câmera sai do ponto do fotógrafo e se aproxima da janela dela. */
  foto_zoom: (s, dur, m) => {
    const p = arranca(s / dur);
    cidadeEscura(m);
    m.cidade.atualizar(s + 3, [JX, ANDAR12, 16]);
    const F = Cidade.FOTOGRAFO;
    return { cena: "cidade", pos: mix([F[0], F[1] + 0.2, F[2]], [JX + 0.15, ANDAR12 + 0.05, 11], p), alvo: [JX, ANDAR12 - 0.1, ZF], fov: 34 - 8 * p };
  },
  /** Da janela dela para fora: na frente só tem o parque escuro e a chuva. */
  parque_vazio: (s, dur, m) => {
    const p = suave(s / dur);
    cidadeEscura(m);
    m.cidade.atualizar(s, [JX, ANDAR12 - 4, 16]);
    m.cidade.ceuLuz.intensity = 1.7; m.cidade.lua.intensity = 2.6;
    return { cena: "cidade", pos: mix([JX, ANDAR12 + 0.1, ZF + 0.5], [JX, ANDAR12 + 0.2, ZF + 2.2], arranca(s / dur)), alvo: mix([JX - 2, ANDAR12 - 16, 40], [JX + 1, ANDAR12 - 3, 62], p), fov: 66 };
  },
  /** O clarão da foto no ar, e a câmera recua até mostrar que ali não tem nada: 36 m acima do parque. */
  ponto_no_ar: (s, dur, m) => {
    const p = suave((s - 0.35) / (dur - 0.35));
    cidadeEscura(m);
    m.cidade.atualizar(s, [JX + 6, 22, 34]);
    const fl = s < 0.12 ? s / 0.12 : Math.exp(-(s - 0.12) * 6);
    m.cidade.clarao(fl);
    m.cidade.mira.visible = s > dur * 0.45;
    const F = Cidade.FOTOGRAFO;
    return { cena: "cidade", pos: mix([F[0] + 1.6, F[1] + 0.8, F[2] + 4], [JX + 10, 17, 64], p), alvo: mix([JX, ANDAR12, ZF], [JX, ANDAR12 - 4, 16], p), fov: 62 };
  },
  /** A fachada da torre vista do parque: as janelas acendem e cada uma ganha a moldura vermelha de "fotografada". */
  fachada_fotos: (s, dur, m) => {
    const p = lim(s / (dur * 0.85));
    m.cidade.pintarJanelas((j) => j.predio === 0 ? { luz: lim((p * 1.25 - j.ordem * 0.9) * 6), celular: 1 } : { luz: j.ordem > 0.95 ? 1 : 0, celular: j.ordem < 0.4 ? 1 : 0 });
    m.cidade.fotos.count = Math.floor(56 * lim(p * 1.1));
    m.cidade.atualizar(s, [0, 20, 30]);
    return { cena: "cidade", pos: mix([-3, 20, 50], [-1.5, 22.5, 37], arranca(s / dur)), alvo: [0, 22, 0], fov: 60 };
  },

  // ---------------- quarto
  /** O rosto dela iluminado pelo grupo do prédio: cada mensagem nova pisca a luz da tela. */
  quarto_grupo: (s, dur, m) => {
    const p = arranca(s / dur);
    marinaNoQuarto(m, s, "sentada_celular", { olhos: 1.2, sobrancelha: 0.9, cabeca: [16, -4 * p, 0] }); telaCom(m, "grupo");
    m.quarto.atualizar(s);
    m.quarto.luzCelular.intensity = 0.45 + 0.5 * Math.pow(Math.max(0, Math.sin(s * 11)), 8);
    const c = cabeca(m); return { cena: "quarto", pos: mix([c[0] + 0.48, c[1] - 0.32, c[2] - 1.18], [c[0] + 0.34, c[1] - 0.28, c[2] - 1.02], p), alvo: [c[0], c[1] - 0.12, c[2]], fov: 56 };
  },
  /** Ela fecha a cortina (vista de trás); o quarto escurece. */
  cortina_fecha: (s, dur, m) => {
    const q = m.quarto, p = suave(s / (dur * 0.75));
    q.marina.raiz.position.set(0, 0, -1.85); q.marina.raiz.rotation.set(0, Math.PI, 0);
    q.marina.posar({ ...POSES.fechando_cortina(s), bracoE: [-82, 0, 38 - 30 * p], bracoD: [-82, 0, -38 + 30 * p] });
    q.marina.segurarCelular(false);
    q.cortinas(p);
    q.atualizar(s);
    q.luaLuz.intensity *= 1 - 0.8 * p;
    return { cena: "quarto", pos: mix([1.2, 1.7, 0.4], [0.75, 1.62, -0.35], arranca(s / dur)), alvo: [0, 1.45, -2.5], fov: 64 };
  },

  // ---------------- portaria
  /** O Rafa no balcão, gravando o áudio no celular. */
  portaria_rafa: (s, dur, m) => {
    const pt = m.portaria, p = arranca(s / dur);
    pt.rafa.posar(POSES.gravando_audio(s)); pt.rafa.segurarCelular(true);
    pt.atualizar(s);
    const c = new THREE.Vector3(); pt.rafa.cabeca.getWorldPosition(c);
    return { cena: "portaria", pos: mix([1.25, 2.0, 0.3], [0.55, 1.85, -0.75], p), alvo: [c.x, c.y - 0.12, c.z], fov: 56 };
  },
  /** A trava das portas: o LED passa de verde para vermelho (com um tranco na câmera). */
  porta_trava: (s, dur, m) => {
    const pt = m.portaria, trava = s > dur * 0.7;
    pt.travar(trava ? 1 : 0); pt.atualizar(s);
    pt.rafa.posar(POSES.em_pe(s)); pt.rafa.raiz.position.set(-1.2, 0, 1.6); pt.rafa.raiz.rotation.set(0, 0.9, 0);
    const tranco: V3 = trava && s < dur * 0.7 + 0.3 ? tremor(s, 0.035) : [0, 0, 0];
    return { cena: "portaria", pos: soma(mix([0.75, 1.85, 1.7], [0.42, 2.12, 2.55], arranca(s / dur)), tranco), alvo: [0.12, 2.3, 3.45], fov: 56 };
  },
  /** O Rafa puxa a porta trancada, que não se mexe. */
  rafa_puxa_porta: (s, dur, m) => {
    const pt = m.portaria;
    pt.travar(1); pt.atualizar(s);
    const puxa = Math.max(0, Math.sin(s * 9)) * 0.05;
    pt.rafa.posar(POSES.puxando_porta(s)); pt.rafa.raiz.position.set(0.5, 0, 2.62 - puxa); pt.rafa.raiz.rotation.set(0, 0, 0);
    return { cena: "portaria", pos: soma(mix([-1.9, 1.45, 1.0], [-1.45, 1.4, 1.5], arranca(s / dur)), tremor(s, 0.01)), alvo: [0.4, 1.3, 3.0], fov: 60 };
  },

  // ---------- cidade: a janela do vizinho (1201), ao lado da dela (ep. 3)
  /** De fora, as duas janelas do 12º: a do 1201 acende no meio do plano. */
  janela_vizinho: (s, dur, m) => {
    cidadeEscura(m);
    m.cidade.atualizar(s, [0, ANDAR12, 12]);
    m.cidade.vizinho.visible = true;
    m.cidade.janela1201(lim((s - dur * 0.6) / 0.3), 0);
    m.cidade.rotulo1201.visible = s > dur * 0.68;
    return { cena: "cidade", pos: mix([0.6, ANDAR12 + 0.9, 21], [0.2, ANDAR12 + 0.5, 17.5], arranca(s / dur)), alvo: [0, ANDAR12 + 0.3, ZF], fov: 55 };
  },
  /** Perto da janela do 1201: a cortina abre devagar, sozinha, e não tem ninguém. */
  janela_vizinho_abre: (s, dur, m) => {
    cidadeEscura(m);
    m.cidade.atualizar(s, [-1.5, ANDAR12, 10]);
    m.cidade.vizinho.visible = true;
    m.cidade.janela1201(1, suave(s / (dur * 0.85)));
    const pos = soma(mix([-1.1, ANDAR12 + 0.15, 9.6], [-1.4, ANDAR12 + 0.05, 8.0], suave(s / dur)), tremor(s, 0.012));
    return { cena: "cidade", pos, alvo: [-1.5, ANDAR12, ZF], fov: 48 };
  },

  // ---------- portaria: o elevador (ep. 3)
  /** O elevador chega ao térreo, abre vazio e fecha de novo. */
  elevador_abre_vazio: (s, dur, m) => {
    const pt = m.portaria, p = s / dur;
    pt.mostrarAndar(0);
    pt.elevador(p < 0.15 ? 0 : p < 0.4 ? (p - 0.15) / 0.25 : p < 0.75 ? 1 : 1 - (p - 0.75) / 0.25);
    pt.atualizar(s);
    return { cena: "portaria", pos: mix([-1.2, 1.55, 0.9], [-1.9, 1.5, 0.5], arranca(p)), alvo: [-4.2, 1.2, 0.27], fov: 60 };
  },
  /** Close no mostrador do elevador subindo sozinho: T, 1, 2... até 12. */
  elevador_sobe: (s, dur, m) => {
    const pt = m.portaria;
    pt.mostrarAndar(Math.min(12, Math.floor((1 - Math.pow(1 - lim(s / (dur * 0.85)), 3)) * 12.99))); // mesma curva do contador (dado)
    pt.atualizar(s);
    return { cena: "portaria", pos: mix([-2.9, 2.35, 0.6], [-3.2, 2.5, 0.42], arranca(s / dur)), alvo: [-3.87, 2.68, 0.27], fov: 50 };
  },

  // ---------- corredor do 12º andar (ep. 4 em diante)
  /** A Bia sobe pela escada e anda até o 1201, que está entreaberto (câmera atrás dela). */
  corredor_bia: (s, dur, m) => {
    const c = m.corredor, p = s / dur;
    c.abrir1201(0.35); c.atualizar(s);
    c.bia.raiz.visible = true; c.bia.posar(POSES.andando(s)); c.bia.raiz.position.set(-0.25, 0, 4.6 - 4.2 * p); c.bia.raiz.rotation.set(0, Math.PI, 0);
    const b = c.bia.raiz.position;
    return { cena: "corredor", pos: [0.45, 1.25, b.z + 1.9], alvo: [-0.5, 1.1, b.z - 3], fov: 66 };
  },
  /** A porta do 1201 entreaberta, com a luz da sala vazando (a câmera se aproxima). */
  corredor_1201_aberta: (s, dur, m) => {
    const c = m.corredor;
    c.abrir1201(0.55 + 0.15 * suave(s / dur)); c.atualizar(s);
    return { cena: "corredor", pos: mix([1.0, 1.55, -0.6], [0.85, 1.5, -1.8], arranca(s / dur)), alvo: [-1.6, 1.15, -3.1], fov: 62 };
  },
  /** A "foto" da porta da Marina (1203), tirada do corredor, agora. Câmera quase parada, grande-angular. */
  corredor_porta_1203: (s, dur, m) => {
    const c = m.corredor;
    c.atualizar(s);
    return { cena: "corredor", pos: soma([-0.95, 1.4, -0.9], tremor(s, 0.004)), alvo: [1.2, 1.25, -3], fov: 74 };
  },
  /** A Bia na frente da porta da Marina, batendo (ep. 5). */
  bia_bate_porta: (s, dur, m) => {
    const c = m.corredor;
    c.atualizar(s);
    c.bia.raiz.visible = true; c.bia.posar(POSES.batendo_porta(s)); c.bia.raiz.position.set(0.55, 0, -3); c.bia.raiz.rotation.set(0, Math.PI / 2, 0);
    return { cena: "corredor", pos: mix([-0.8, 1.5, -0.7], [-0.7, 1.45, -1.4], arranca(s / dur)), alvo: [0.9, 1.3, -3], fov: 62 };
  },

  // ---------- sala do 1201 (ep. 4)
  /** Entrando na sala: sofá, espelhos cobertos e a janela aberta com a cortina batendo. */
  sala_entrada: (s, dur, m) => {
    m.sala1201.atualizar(s);
    return { cena: "sala1201", pos: mix([1.7, 1.6, 2.2], [1.2, 1.55, 1.2], arranca(s / dur)), alvo: [-0.3, 1.3, -2.5], fov: 68 };
  },
  /** Passando pelos espelhos cobertos com lençol. */
  sala_espelhos: (s, dur, m) => {
    m.sala1201.atualizar(s);
    const z = 1.9 - 3.0 * arranca(s / dur);
    return { cena: "sala1201", pos: [0.9, 1.45, z + 0.6], alvo: [2.44, 1.25, z - 0.6], fov: 62 };
  },
  /** A frase vermelha na parede ("ELES SÓ VEEM QUEM OLHA"). */
  parede_frase: (s, dur, m) => {
    m.sala1201.atualizar(s);
    return { cena: "sala1201", pos: mix([1.9, 1.55, 0.8], [0.6, 1.6, 0.3], arranca(s / dur)), alvo: [-2.5, 1.55, 0.2], fov: 62 };
  },
  /** De frente para a janela aberta do 1201: a cortina bate e a chuva entra. */
  sala_janela_aberta: (s, dur, m) => {
    const flash = s > dur - 0.6 ? Math.max(0, 1 - (s - (dur - 0.6)) * 4) : 0;
    m.sala1201.atualizar(s * 1.3, flash);
    return { cena: "sala1201", pos: mix([0.4, 1.5, 1.4], [0.15, 1.55, 0.1], arranca(s / dur)), alvo: [0, 1.6, -2.5], fov: 66 };
  },

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
    const c = cabeca(m); return { cena: "quarto", pos: mix([c[0] + 0.5, c[1] - 0.1, c[2] - 1.25], [c[0] + 0.36, c[1] - 0.08, c[2] - 1.08], p), alvo: [c[0], c[1] - 0.18, c[2]], fov: 56 };
  },
  rosto_mensagem: (s, dur, m) => {
    const p = suave(s / dur);
    marinaNoQuarto(m, s, "sentada_celular", { olhos: 1.1, sobrancelha: 0.9, cabeca: [14, 0, -6 * p] }); telaCom(m, "mensagem");
    m.quarto.atualizar(s);
    const c = cabeca(m); return { cena: "quarto", pos: mix([c[0] - 0.38, c[1] - 0.12, c[2] - 1.25], [c[0] - 0.26, c[1] - 0.1, c[2] - 1.08], p), alvo: [c[0], c[1] - 0.22, c[2]], fov: 56 };
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
    const c = cabeca(m); return { cena: "quarto", pos: mix([c[0] + 0.1, c[1] - 0.05, c[2] - 1.2], [c[0] + 0.05, c[1] - 0.04, c[2] - 0.95], suave(s / dur)), alvo: [c[0], c[1] - 0.1, c[2]], fov: 54 };
  },
};
