// Gera hoje-sumiu/episodios/dia10.json e a voz unida (public/hoje-sumiu-dia10.mp3): o chuveiro quente.
// Abertura "carimbo", trilha "misterio", sombra de contato, câmera com 2 planos por fala, -14 LUFS, pergunta aberta no fim.
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { FALAS } from "./falas10.mjs";
const RAIZ = "C:/Users/User/Documents/Origem Digital/4-midia/posts-automaticos/hoje-sumiu/";
const FF = "C:/Users/User/Documents/Origem Digital/4-midia/posts-automaticos/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe";
const VOZ = "C:/Users/User/AppData/Local/Temp/claude/bc88afa6adac9a0f/bf3c00df-bf9e-4837-b039-126c1536f033/scratchpad/voz10/";
const GAP = 0.6;
const DUR = [2.12, 2.77, 5.25, 4.36, 3.4, 1.88, 2.04, 2.59, 2.93, 3.63, 3.16, 3.79, 4.68, 2.77, 2.43, 5.33];

const LEG = [
  "Hoje sumiu o ~chuveiro~ ~quente.~",
  "Do mundo inteiro. Para *sempre.*",
  "Vocês votaram nas *janelas.* Mas sem *casas,* janela não faz sentido.",
  "Foi *erro* meu dar essa opção. Então vale o *segundo* mais votado.",
  "Primeira manhã: o *banho* vira *fila* na fonte.",
  "Ninguém *canta* mais no *banho.*",
  "O *sabonete* vira *enfeite.*",
  "*Feito* sem *câmera.* Comente *GUIA.*",
  "Em uma semana, o *cabelo* vira o assunto.",
  "Em um mês, os *patos* da fonte reclamam da fila.",
  "Em três meses, todo mundo inventa um *chapéu.*",
  "No fim, o *rio* vira o chuveiro da cidade inteira.",
  "Mas ninguém reclama. Para todo mundo, o chuveiro quente *nunca existiu.*",
  "Só o *Seu Nilo* lembra. Ele *anotou.*",
  "Amanhã, outra coisa vai *sumir.*",
  "Quem escolhe é *você.* Comente o que some amanhã. O mais *curtido* decide.",
];
if (LEG.length !== FALAS.length) throw new Error("legendas e falas não batem");
LEG.forEach((l, i) => { const a = l.split(/\s+/).length, b = FALAS[i].split(/\s+/).length; if (a !== b) console.log(`AVISO fala ${i}: legenda ${a} palavras, fala ${b}`); });

// 1. voz unida com pausas de 0,6 s
const sil = VOZ + "sil.wav";
execFileSync(FF, ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", String(GAP), sil]);
const args = ["-y", "-loglevel", "error"], ordem = [];
FALAS.forEach((_, i) => { ordem.push(VOZ + String(i).padStart(2, "0") + ".mp3"); if (i < FALAS.length - 1) ordem.push(sil); });
ordem.forEach((f) => args.push("-i", f));
const filtro = ordem.map((_, i) => `[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo[a${i}]`).join(";") + ";" + ordem.map((_, i) => `[a${i}]`).join("") + `concat=n=${ordem.length}:v=0:a=1[out]`;
args.push("-filter_complex", filtro, "-map", "[out]", "-c:a", "libmp3lame", "-q:a", "2", RAIZ + "public/hoje-sumiu-dia10.mp3");
execFileSync(FF, args);
let ini = 0;
const cortes = DUR.map((d) => { const c = [Math.round(ini * 100) / 100, Math.round((ini + d + 0.05) * 100) / 100]; ini += d + GAP; return c; });

// ---------- cena ----------
const AZ = "#5cb8e4", ROS = "#f28aa5";
const pessoa = (x, z, roupa, sem, pose, extra = {}) => ({ peca: "pessoa", pos: [x, 0, z], escala: 1.6, roupa, semente: sem, poses: [{ pose: "normal" }, { em: pose.em, pose: pose.pose }], balanca: { em: pose.em, amp: pose.amp ?? 0.08 }, ...extra });

// chuveiro de praça: poste, braço, cabeça, água caindo e vapor, parando quando o chuveiro quente some (`ate`)
const chuveiro = (x, ate, sem, roupa) => ({ peca: "grupo", pos: [x, 0, 0], filhos: [
  { forma: "caixa", l: 0.14, a: 3.6, p: 0.14, cor: "#8d99ae", pos: [0, 1.8, 0], sombra: { rx: 0.5, rz: 0.2 } },
  { forma: "caixa", l: 1.0, a: 0.12, p: 0.12, cor: "#8d99ae", pos: [0.5, 3.6, 0] },
  { forma: "oval", rx: 0.42, ry: 0.13, cor: "#c8d3e0", pos: [1.0, 3.45, 0] },
  { peca: "agua", pos: [1.0, 3.35, 0], queda: 3.3, ativo: -1, ate },
  { peca: "vapor", pos: [1.0, 0.1, 0], sobe: 2.6, qtd: 4, rx: 0.08, ry: 0.32, cor: "#ffffff", abre: 0.22, ate },
  pessoa(1.0, 0.2, roupa, sem, { em: ate, pose: "azedo" }, { poses: [{ pose: "feliz" }, { em: ate, pose: "azedo" }] }),
] });

const heroi = { peca: { peca: "grupo", pos: [0, 0.2, 15.5], em: -1, sai: "@1:fim-0.2", modo: "cresce", some: "@onda", filhos: [
  chuveiro(-3.6, "@onda", 21, "#ffb703"), chuveiro(-0.3, "@onda", 22, "#2ec4b6"), chuveiro(3.0, "@onda", 23, "#b794e6"),
] }, camera: [0.4, 4.4, 28], alvo: [0, 2.6, 15.5] };

const patoForma = (x, z, sem) => ({ peca: "grupo", pos: [x, 0.1, z], balanca: { em: "@9:patos", amp: 0.12 }, filhos: [
  { forma: "oval", rx: 0.55, ry: 0.36, cor: "#ffd23f", pos: [0, 0.4, 0], sombra: { rx: 0.55, rz: 0.22 } },
  { forma: "circulo", r: 0.24, cor: "#ffd23f", pos: [0.5, 0.85, 0.02] },
  { forma: "poligono", pontos: [[0, 0.1], [0.34, 0], [0, -0.1]], cor: "#ff9f1c", pos: [0.72, 0.83, 0.04] },
  { forma: "circulo", r: 0.05, cor: "#27324a", pos: [0.56, 0.9, 0.05] },
] });

const BASE = [0, 0.2, 17.5];
const pecas = [
  // 3: o erro: JANELAS vira cinza (SEM CASAS) e CHUVEIRO QUENTE sobe como segundo mais votado
  { peca: "grupo", pos: BASE, em: "@3:inicio-0.35", sai: "@4:inicio", filhos: [
    { peca: "letreiro", pos: [0, 5.2, 0], l: 4.4, a: 1.1, texto: "JANELAS", verso: "SEM CASAS", corVerso: "#27324a", cor: "#1f6fd1", vira: "@3:erro" },
    { peca: "letreiro", pos: [0, 3.4, 0.2], l: 6.2, a: 1.3, texto: "CHUVEIRO QUENTE", cor: "#27324a", fundo: "#fff6e0", em: "@3:segundo-0.15", modo: "sobe" },
  ] },
  // 4 a 9: a fonte, o único chuveiro que sobrou; a fila anda até ela
  { peca: "grupo", pos: BASE, em: "@4:inicio-0.35", sai: "@10:inicio", filhos: [
    { forma: "caixa", l: 4.2, a: 0.5, p: 4.2, cor: "#b8c4d4", pos: [0, 0.25, 0], sombra: { rx: 2.5, rz: 1.6, pos: [0.2, -0.2, 0.2] } },
    { forma: "caixa", l: 3.7, a: 0.12, p: 3.7, cor: "#7fd3ff", pos: [0, 0.52, 0] },
    { forma: "caixa", l: 0.5, a: 1.7, p: 0.5, cor: "#b8c4d4", pos: [0, 0.9, 0] },
    { peca: "agua", pos: [0, 2.2, 0], queda: 1.6, abre: 0.2, qtd: 9 },
  ] },
  // 4: a fila de gente anda até a fonte (sai antes do sabonete, para não tampar a cena dele)
  { peca: "grupo", pos: BASE, em: "@4:inicio-0.35", sai: "@6:inicio-0.1", filhos: [
    ...[0, 1, 2, 3, 4].map((i) => pessoa(-9.5 - i * 1.5, 3.6, ["#ffb703", "#3a86ff", "#2ec4b6", "#f28aa5", "#45c46b"][i], 30 + i, { em: "@5:inicio", pose: "azedo" }, {
      poses: [{ pose: "normal" }, { em: "@5:inicio", pose: "azedo" }], move: [{ em: "@4:inicio", dur: 2.6 + i * 0.15, pos: [-3.2 - i * 1.35, 0, 3.6] }] })),
  ] },
  // 5: ninguém canta mais no banho
  { peca: "grupo", pos: BASE, em: "@5:inicio-0.35", sai: "@6:inicio", filhos: [
    pessoa(3.4, 3.4, "#b794e6", 40, { em: "@5:mais", pose: "triste" }, { poses: [{ pose: "fala" }, { em: "@5:mais", pose: "triste" }] }),
    { peca: "letreiro", pos: [3.4, 4.4, 3.4], l: 1.4, a: 1.4, texto: "\u266a", verso: "\u2715", cor: "#1f6fd1", corVerso: "#27324a", fundo: false, vira: "@5:mais" },
  ] },
  // 6: o sabonete vira enfeite (num pedestal)
  { peca: "grupo", pos: [-3.4, 0.2, 18.5], em: "@6:inicio-0.35", sai: "@7:inicio", filhos: [
    { forma: "caixa", l: 1.3, a: 1.6, p: 1.3, cor: "#e8e1d4", pos: [0, 0.8, 0], sombra: { rx: 1.0, rz: 0.6 } },
    { forma: "caixa", l: 0.9, a: 0.5, p: 0.6, cor: "#ffb3d1", pos: [0, 1.85, 0] },
    { peca: "letreiro", pos: [0, 3.2, 0], l: 3.2, a: 0.9, texto: "ENFEITE", cor: "#27324a", fundo: "#fff6e0", em: "@6:enfeite-0.2", modo: "sobe" },
  ] },
  // 8: o cabelo vira o assunto
  { peca: "grupo", pos: BASE, em: "@8:inicio-0.35", sai: "@9:inicio", filhos: [
    pessoa(-2.6, 2.6, "#ffb703", 50, { em: "@8:cabelo", pose: "mostra" }, { poses: [{ pose: "normal" }, { em: "@8:cabelo", pose: "mostra" }], cabelo: "#7a4a1c" }),
    pessoa(0, 2.2, "#3a86ff", 51, { em: "@8:cabelo", pose: "shrug" }, { poses: [{ pose: "normal" }, { em: "@8:cabelo", pose: "shrug" }], cabelo: "#c9a27e" }),
    pessoa(2.6, 2.6, "#2ec4b6", 52, { em: "@8:cabelo", pose: "mostra" }, { poses: [{ pose: "normal" }, { em: "@8:cabelo", pose: "mostra" }], cabelo: "#17110c" }),
    { peca: "letreiro", pos: [0, 4.6, 2.2], l: 2.6, a: 0.8, texto: "CABELO?", cor: "#27324a", fundo: "#fff6e0", em: "@8:cabelo-0.15", modo: "sobe" },
  ] },
  // 9: os patos da fonte reclamam da fila
  { peca: "grupo", pos: BASE, em: "@9:inicio-0.3", sai: "@10:inicio", filhos: [
    patoForma(-1.0, 3.2, 1), patoForma(1.1, 3.4, 2), patoForma(0.1, 4.4, 3),
    { peca: "letreiro", pos: [0, 3.9, 3.6], l: 2.6, a: 0.9, texto: "QU\u00c1!", cor: "#27324a", fundo: "#fff6e0", em: "@9:patos-0.1", modo: "sobe" },
  ] },
  // 10: todo mundo inventa um chapéu
  { peca: "grupo", pos: BASE, em: "@10:inicio-0.35", sai: "@11:inicio", filhos: [
    ...[-4.4, -2.2, 0, 2.2, 4.4].map((x, i) => pessoa(x, 2.4, ["#ffb703", "#3a86ff", "#2ec4b6", "#f28aa5", "#45c46b"][i], 60 + i, { em: "@10:chapéu", pose: "mostra" }, {
      bone: ["#ff9f1c", "#b794e6", "#ffd23f", "#45c46b", "#3a86ff"][i], poses: [{ pose: "normal" }, { em: "@10:chapéu", pose: i % 2 ? "feliz" : "mostra" }] })),
  ] },
  // 11: o rio vira o chuveiro da cidade inteira (multidão na água)
  { peca: "grupo", pos: [0, 0.2, 18.5], em: "@11:inicio-0.35", sai: "@12:inicio", filhos: [
    { forma: "retangulo", l: 24, a: 4.2, cor: "#5cb8e4", rot: [-Math.PI / 2, 0, 0], pos: [0, 0.06, 1.6], canto: 0.3 },
    ...Array.from({ length: 12 }, (_, i) => pessoa(-9 + i * 1.65, 1.2 + (i % 3) * 0.9, ["#ffb703", "#3a86ff", "#2ec4b6", "#f28aa5", "#45c46b", "#b794e6"][i % 6], 70 + i, { em: "@11:inicio", pose: i % 2 ? "comemora" : "feliz", amp: 0.1 }, {
      escala: 1.45, poses: [{ pose: "normal" }, { em: "@11:inicio", pose: i % 2 ? "comemora" : "feliz" }], move: [{ em: "@11:inicio", dur: 1.4 + (i % 4) * 0.2, pos: [-9 + i * 1.65, 0, 1.2 + (i % 3) * 0.9] }] })),
  ] },
  // 12: ninguém reclama, todo mundo sorrindo na praça
  { peca: "grupo", pos: BASE, em: "@12:inicio-0.35", sai: "@14:inicio", modo: "cresce", filhos: [
    pessoa(-3.2, 0, "#ffb703", 12, { em: "@12:reclama", pose: "feliz" }),
    pessoa(-1.1, 0, "#2ec4b6", 13, { em: "@12:reclama", pose: "feliz" }),
    pessoa(1.1, 0, "#f28aa5", 14, { em: "@12:reclama", pose: "feliz" }),
    pessoa(3.2, 0, "#3a86ff", 15, { em: "@12:reclama", pose: "feliz" }),
  ] },
];

const cena = {
  cor: AZ,
  titulo: "o chuveiro quente",
  semCarros: true,
  somemPredios: -10, // os apartamentos já sumiram no Dia 9: nenhum prédio desde o primeiro quadro
  lufs: -14,
  sumiram: ["Dia 7: os veículos", "Dia 8: o sono", "Dia 9: os apartamentos"],
  abertura: { tipo: "carimbo", linhas: [], ate: "@1:inicio-0.05" },
  trilha: { nome: "misterio", constroi: ["@3:voz", "@5:voz", "@8:voz", "@9:voz", "@10:voz"], climax: "@11:inicio" },
  credito: { rotulo: "VOCÊS VOTARAM", conta: "OS VOTOS DE VOCÊS", texto: "Janelas" },
  divulgacao: { em: "@7:voz-0.05", ate: "@7:fim-0.05", titulo: "SEM CÂMERA", sub: "COMENTE GUIA", chamada: "LINK NA BIO" },
  exemplos: ["as nuvens", "os espelhos", "a cor azul"],
  heroi,
  // duas câmeras por fala, voos que atravessam de um plano ao outro e números de zoom (fov) diferentes em cada plano
  cameras: [
    { em: "@1:inicio-0.2", lugar: "cidade", perto: true, dur: 0.9 },
    { em: "@1:sempre-0.3", lugar: "ceu", dur: 0.01 },
    { em: "@2:inicio-0.2", lugar: "praca", dur: 0.7 },
    { em: "@2:janelas-0.3", lugar: "direita", dur: 0.7 },
    { em: "@2:casas-0.3", lugar: "praca", perto: true, dur: 0.8 },
    { em: "@2:sentido-0.3", pos: [-3, 3.4, 27], alvo: [0, 3, 18], fov: 36, deriva: [0.6, 0, -0.4], foco: 0.7, dur: 0.7 },
    { em: "@3:inicio-0.2", pos: [0, 5.5, 31], alvo: [0, 4.6, 17.5], fov: 42, deriva: [0.5, 0, -0.5], foco: 0.6, dur: 0.8 },
    { em: "@3:segundo-0.3", pos: [2.5, 3.2, 26], alvo: [0, 3.2, 17.5], fov: 36, deriva: [-0.4, 0, -0.4], foco: 0.7, dur: 0.7 },
    { em: "@4:inicio-0.3", lugar: "praca", dur: 0.9 },
    { em: "@4:fila-0.4", pos: [-9, 2.4, 28], alvo: [-2, 2.2, 18], fov: 44, deriva: [0.8, 0, -0.3], foco: 0.6, dur: 1.0 },
    { em: "@5:inicio-0.3", lugar: "praca", perto: true, dur: 0.8 },
    { em: "@5:mais-0.4", pos: [3.6, 2.6, 27], alvo: [3.4, 2.6, 20.9], fov: 36, deriva: [0, 0, -0.3], foco: 0.7, dur: 0.5 },
    { em: "@6:inicio-0.3", pos: [-5.2, 3.2, 28], alvo: [-3.4, 2.0, 18.5], fov: 40, deriva: [0.3, 0, -0.4], foco: 0.7, dur: 0.8 },
    { em: "@6:enfeite-0.3", pos: [-3.4, 2.6, 24], alvo: [-3.4, 2.2, 18.5], fov: 34, deriva: [0, 0, -0.3], foco: 0.8, dur: 0.6 },
    { em: "@7:inicio-0.3", lugar: "cidade", perto: true, dur: 1.0 },
    { em: "@7:comente-0.3", lugar: "rua", perto: true, dur: 0.01 },
    { em: "@8:inicio-0.3", lugar: "praca", dur: 0.9 },
    { em: "@8:cabelo-0.4", pos: [0, 4.6, 27], alvo: [0, 3, 19.5], fov: 38, deriva: [0.4, 0, -0.4], foco: 0.7, dur: 0.7 },
    { em: "@9:inicio-0.3", pos: [4, 4, 29], alvo: [0, 2.5, 19], fov: 42, deriva: [-0.5, 0, -0.4], foco: 0.6, dur: 0.8 },
    { em: "@9:patos-0.3", pos: [0.5, 2.4, 25.5], alvo: [0, 2.2, 20.5], fov: 34, deriva: [0, 0, -0.3], foco: 0.8, dur: 0.6 },
    { em: "@9:fila-0.3", lugar: "praca", perto: true, dur: 0.7 },
    { em: "@10:inicio-0.3", lugar: "praca", dur: 0.8 },
    { em: "@10:chapéu-0.4", pos: [-2, 3.4, 26], alvo: [0, 3.4, 20], fov: 38, deriva: [0.6, 0, -0.3], foco: 0.7, dur: 0.7 },
    { em: "@11:inicio-0.3", pos: [0, 15, 38], alvo: [0, 1, 19], fov: 44, deriva: [0, 0, -0.4], foco: 0.6, dur: 1.6, arco: 2 },
    { em: "@11:fim-0.5", lugar: "ceu", dur: 0.8 },
    { em: "@12:inicio-0.35", lugar: "praca" },
    { em: "@12:todo-0.2", lugar: "praca", perto: true, dur: 0.8 },
    { em: "@14:inicio-0.35", lugar: "cidade", dur: 1.0 },
  ],
  pecas,
  etiquetas: [
    { txt: "SEM CASAS = SEM JANELAS", pos: [0, 7.6, 18], em: "@3:erro-0.1", ate: "@3:segundo", cor: "rosa", r: -2 },
    { txt: "FILA NA FONTE", pos: [-6, 5.2, 19], em: "@4:fila-0.2", ate: "@5:inicio", cor: "amarelo", r: -2 },
    { txt: "SEM MÚSICA", pos: [3.4, 6, 21], em: "@5:mais-0.3", ate: "@6:inicio", cor: "rosa", r: 2 },
    { txt: "CABELO EM ALERTA", pos: [0, 7, 20], em: "@8:cabelo", ate: "@9:inicio", cor: "ouro", r: -2 },
    { txt: "QUÁ!", pos: [0, 5.4, 22], em: "@9:patos", ate: "@10:inicio-0.2", cor: "amarelo", r: 2 },
    { txt: "NINGUÉM RECLAMA", pos: [0, 4.9, 18], em: "@reclama", ate: "@13:inicio-0.1" },
    { txt: "SEU NILO", pos: [-0.9, 4.25, 18.5], em: "@nilo+0.7", ate: "@13:anotou-0.2", cor: "ouro" },
  ],
  transicoes: [{ em: "@3:inicio-0.2", tipo: "luz", dur: 0.6 }, { em: "@9:inicio-0.2", tipo: "luz", dur: 0.6 }, { em: "@11:inicio-0.2", tipo: "flash", dur: 0.6 }],
  tremores: ["@11:inicio"],
};

const ep = { id: "hoje-sumiu-dia10", dia: 10, coisa: "o chuveiro quente", velocidade: 1, falas: FALAS.map((fala, i) => ({ fala, legenda: LEG[i] })), cortes, cena };
writeFileSync(RAIZ + "episodios/dia10.json", JSON.stringify(ep, null, 1));
console.log("ok: episodios/dia10.json e public/hoje-sumiu-dia10.mp3, voz unida", Math.round(ini * 100) / 100, "s com pausas de 0,6 s");
