// Gera hoje-sumiu/episodios/dia11.json e a voz unida (public/hoje-sumiu-dia11.mp3): os espelhos.
// Padrão de qualidade (09/11): câmera sempre em movimento, 1º corte em até 2 s, silêncio antes do clímax, -14 LUFS.
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { FALAS } from "./falas11.mjs";
const RAIZ = "C:/Users/User/Documents/Origem Digital/4-midia/posts-automaticos/hoje-sumiu/";
const FF = "C:/Users/User/Documents/Origem Digital/4-midia/posts-automaticos/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe";
const VOZ = "C:/Users/User/AppData/Local/Temp/claude/bc88afa6adac9a0f/bf3c00df-bf9e-4837-b039-126c1536f033/scratchpad/voz11/";
const GAP = 0.6;
const DUR = [2.19, 2.77, 2.93, 3.32, 1.96, 2.43, 3.4, 3.63, 2.59, 3.16, 3.71, 3.16, 4.44, 2.77, 2.43, 5.33];

const LEG = [
  "Hoje sumiram os ~espelhos.~",
  "Do mundo inteiro. Para *sempre.*",
  "O comentário mais *curtido* foi os *espelhos.*",
  "Primeira manhã: ninguém sabe como está o *rosto.*",
  "O *barbeiro* corta no *escuro.*",
  "O *dentista* trata o dente *errado.*",
  "Em uma semana, a *maquiagem* vira *arte* moderna.",
  "Em duas semanas, o *pavão* do parque perde a *graça.*",
  "*Feito* sem *câmera.* Comente *GUIA.*",
  "Em um mês, um *amigo* vira o *espelho* do outro.",
  "Em três meses, o *rio* vira o *espelho* da cidade.",
  "No fim, até o *reflexo* na água *some.*",
  "Mas ninguém reclama. Para todo mundo, espelho *nunca existiu.*",
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
args.push("-filter_complex", filtro, "-map", "[out]", "-c:a", "libmp3lame", "-q:a", "2", RAIZ + "public/hoje-sumiu-dia11.mp3");
execFileSync(FF, args);
let ini = 0;
const cortes = DUR.map((d) => { const c = [Math.round(ini * 100) / 100, Math.round((ini + d + 0.05) * 100) / 100]; ini += d + GAP; return c; });

// ---------- cena ----------
const AZ = "#5cb8e4";
const pessoa = (x, z, roupa, sem, pose, extra = {}) => ({ peca: "pessoa", pos: [x, 0, z], escala: 1.6, roupa, semente: sem, poses: [{ pose: "normal" }, { em: pose.em, pose: pose.pose }], balanca: { em: pose.em, amp: pose.amp ?? 0.08 }, ...extra });
const ROUPAS = ["#ffb703", "#3a86ff", "#2ec4b6", "#f28aa5", "#45c46b", "#b794e6"];

// espelho de pé: moldura dourada, vidro azul-claro com brilho, base cinza e sombra de contato; a pessoa se olha nele
const espelho = (x, ate, sem, roupa) => ({ peca: "grupo", pos: [x, 0, 0], filhos: [
  { forma: "oval", rx: 0.95, ry: 1.45, cor: "#d9a441", pos: [0, 2.1, 0], sombra: { rx: 0.9, rz: 0.3, pos: [0, -2.06, 0.15] } },
  { forma: "oval", rx: 0.8, ry: 1.3, cor: "#bfeaff", pos: [0, 2.1, 0.06] },
  { forma: "poligono", pontos: [[-0.08, -0.6], [0.1, -0.6], [0.35, 0.6], [0.17, 0.6]], cor: "#ffffff", pos: [-0.3, 2.2, 0.1] },
  { forma: "caixa", l: 0.16, a: 0.7, p: 0.16, cor: "#8d99ae", pos: [0, 0.35, 0] },
  pessoa(1.45, 0.7, roupa, sem, { em: ate, pose: "triste" }, { poses: [{ pose: "feliz" }, { em: ate, pose: "triste" }], escala: 1.4 }), // ao lado do espelho, para o espelho aparecer no 1º quadro
] });
const heroi = { peca: { peca: "grupo", pos: [0, 0.2, 15.5], em: -1, sai: "@1:fim-0.2", modo: "cresce", some: "@onda", filhos: [
  espelho(-3.9, "@onda", 21, "#ffb703"), espelho(-0.6, "@onda", 22, "#2ec4b6"), espelho(2.7, "@onda", 23, "#b794e6"),
] }, camera: [0.4, 4.0, 28], alvo: [0, 2.6, 15.5] };

const cadeira = (cor) => [
  { forma: "caixa", l: 1.5, a: 0.5, p: 1.3, cor, pos: [0, 0.75, 0], sombra: { rx: 1.1, rz: 0.6, pos: [0, -0.7, 0.1] } },
  { forma: "caixa", l: 1.5, a: 1.3, p: 0.2, cor, pos: [0, 1.7, -0.55] },
  { forma: "caixa", l: 0.3, a: 0.5, p: 0.3, cor: "#8d99ae", pos: [0, 0.25, 0] },
];
// pavão: leque aberto (olhos dourados) e, na hora certa, a cauda fecha e perde a graça
const leque = (aberto) => Array.from({ length: 7 }, (_, i) => { const k = i - 3, a = aberto ? k * 0.42 : k * 0.05; return [
  { forma: "oval", rx: aberto ? 0.17 : 0.12, ry: 0.95, cor: aberto ? "#1f9d8b" : "#7d8a96", rot: [0, 0, a], pos: [-Math.sin(a) * 0.9, 0.9 + Math.cos(a) * 0.9 - (aberto ? 0 : 0.45), -0.01 * Math.abs(k)] },
  ...(aberto ? [{ forma: "circulo", r: 0.09, cor: "#ffd23f", pos: [-Math.sin(a) * 1.7, 0.9 + Math.cos(a) * 1.7, 0.03] }] : []),
]; }).flat();
const pavao = { peca: "grupo", pos: [0, 0.2, 19.8], em: "@7:inicio-0.35", sai: "@8:inicio", filhos: [
  { peca: "grupo", sai: "@7:graça", filhos: leque(true) },
  { peca: "grupo", em: "@7:graça", filhos: leque(false) },
  { forma: "oval", rx: 0.38, ry: 0.55, cor: "#2b6cb0", pos: [0, 0.9, 0.1], sombra: { rx: 0.7, rz: 0.3, pos: [0, -0.86, 0.2] } },
  { forma: "circulo", r: 0.2, cor: "#2b6cb0", pos: [0.22, 1.65, 0.12] },
  { forma: "poligono", pontos: [[0, 0.07], [0.22, 0], [0, -0.07]], cor: "#ff9f1c", pos: [0.4, 1.62, 0.14] },
  { forma: "circulo", r: 0.04, cor: "#27324a", pos: [0.28, 1.7, 0.16] },
] };

const BASE = [0, 0.2, 17.5];
const pecas = [
  // 3: primeira manhã, ninguém sabe como está o rosto
  { peca: "grupo", pos: BASE, em: "@3:inicio-0.35", sai: "@4:inicio", filhos: [
    pessoa(-2.2, 2.6, ROUPAS[0], 31, { em: "@3:rosto", pose: "shrug" }),
    pessoa(0, 2.2, ROUPAS[1], 32, { em: "@3:rosto", pose: "azedo" }),
    pessoa(2.2, 2.6, ROUPAS[2], 33, { em: "@3:rosto", pose: "shrug" }),
  ] },
  // 4: o barbeiro corta no escuro (cadeira azul; cliente assustado)
  { peca: "grupo", pos: BASE, em: "@4:inicio-0.35", sai: "@5:inicio", filhos: [
    ...cadeira("#3a6ea5"),
    pessoa(0, 0.05, ROUPAS[3], 41, { em: "@4:escuro", pose: "susto" }, { pos: [0, 0.95, 0.05], poses: [{ pose: "normal" }, { em: "@4:escuro", pose: "susto" }], cabelo: "#5a2f1c" }),
    pessoa(1.9, 0.9, "#ffffff", 42, { em: "@4:barbeiro", pose: "mostra" }),
  ] },
  // 5: o dentista trata o dente errado (um dente gigante ao lado)
  { peca: "grupo", pos: BASE, em: "@5:inicio-0.35", sai: "@6:inicio", filhos: [
    ...cadeira("#2ec4b6"),
    pessoa(0, 0.05, ROUPAS[4], 51, { em: "@5:dente", pose: "susto" }, { pos: [0, 0.95, 0.05], poses: [{ pose: "normal" }, { em: "@5:dente", pose: "susto" }] }),
    pessoa(1.9, 0.9, "#ffffff", 52, { em: "@5:dente", pose: "shrug" }),
    { forma: "oval", rx: 0.6, ry: 0.8, cor: "#ffffff", pos: [-2.4, 1.2, 0.4], sombra: { rx: 0.6, rz: 0.25, pos: [0, -1.16, 0.1] } },
    { forma: "circulo", r: 0.14, cor: "#9aa5b1", pos: [-2.25, 1.35, 0.46] },
  ] },
  // 6: a maquiagem vira arte moderna (pele de cor nenhuma que exista)
  { peca: "grupo", pos: BASE, em: "@6:inicio-0.35", sai: "@7:inicio", filhos: [
    pessoa(-2.2, 2.6, ROUPAS[5], 61, { em: "@6:arte", pose: "mostra" }, { pele: "#ffb3d1" }),
    pessoa(0, 2.2, ROUPAS[2], 62, { em: "@6:arte", pose: "feliz" }, { pele: "#bfe3ff" }),
    pessoa(2.2, 2.6, ROUPAS[0], 63, { em: "@6:arte", pose: "mostra" }, { pele: "#c9f0a8" }),
  ] },
  // 7: o pavão do parque perde a graça
  pavao,
  // 9: um amigo vira o espelho do outro (duplas se arrumando)
  { peca: "grupo", pos: BASE, em: "@9:inicio-0.35", sai: "@10:inicio", filhos: [
    pessoa(-2.1, 2.4, ROUPAS[0], 91, { em: "@9:amigo", pose: "mostra" }), pessoa(-0.8, 2.4, ROUPAS[1], 92, { em: "@9:amigo", pose: "feliz" }),
    pessoa(0.9, 2.4, ROUPAS[3], 93, { em: "@9:amigo", pose: "feliz" }), pessoa(2.2, 2.4, ROUPAS[4], 94, { em: "@9:amigo", pose: "mostra" }),
  ] },
  // 10 e 11: o rio vira o espelho da cidade; no fim o reflexo some (o rio vira do avesso, cinza)
  { peca: "grupo", pos: [0, 0.2, 18.5], em: "@10:inicio-0.35", sai: "@12:inicio", filhos: [
    { forma: "retangulo", l: 24, a: 4.2, cor: "#9bd8f5", rot: [-Math.PI / 2, 0, 0], pos: [0, 0.06, 1.6], canto: 0.3, some: "@11:some", eixo: "x" },
    ...[-7, -3.5, 0, 3.5, 7].map((x, i) => ({ forma: "poligono", pontos: [[-0.1, -0.35], [0.1, -0.35], [0.45, 0.35], [0.25, 0.35]], cor: "#ffffff", rot: [-Math.PI / 2, 0, 0], pos: [x, 0.09, 1.2 + (i % 2) * 1.0] })),
    ...Array.from({ length: 8 }, (_, i) => pessoa(-7.5 + i * 2.1, 0.2 + (i % 2) * 0.5, ROUPAS[i % 6], 100 + i, { em: "@10:espelho", pose: "feliz", amp: 0.1 }, {
      escala: 1.45, poses: [{ pose: "normal" }, { em: "@10:espelho", pose: "feliz" }, { em: "@11:some", pose: "azedo" }] })),
  ] },
  // 12: ninguém reclama, todo mundo sorrindo na praça
  { peca: "grupo", pos: BASE, em: "@12:inicio-0.35", sai: "@13:inicio-0.25", modo: "cresce", filhos: [
    pessoa(-3.2, 0, ROUPAS[0], 12, { em: "@12:reclama", pose: "feliz" }), pessoa(-1.1, 0, ROUPAS[2], 13, { em: "@12:reclama", pose: "feliz" }),
    pessoa(1.1, 0, ROUPAS[3], 14, { em: "@12:reclama", pose: "feliz" }), pessoa(3.2, 0, ROUPAS[1], 15, { em: "@12:reclama", pose: "feliz" }),
  ] },
];

const cena = {
  cor: AZ,
  titulo: "os espelhos",
  semCarros: true,
  somemPredios: -10, // os apartamentos já sumiram no Dia 9: nenhum prédio desde o primeiro quadro
  lufs: -14,
  sumiram: ["Dia 8: o sono", "Dia 9: apartamentos", "Dia 10: o chuveiro"], // curtas: no caderno a linha não quebra
  abertura: { tipo: "iris", linhas: ["Hoje sumiram os espelhos"], ate: "@0:fim-0.6" },
  trilha: { nome: "noturna", constroi: ["@3:voz", "@5:voz", "@7:voz", "@9:voz", "@10:voz"], climax: "@11:inicio" },
  credito: { rotulo: "O MAIS CURTIDO", conta: "@daviddossantos6463", texto: "Os espelhos", curtidas: 2 },
  divulgacao: { em: "@8:voz-0.05", ate: "@8:fim-0.05", titulo: "SEM CÂMERA", sub: "COMENTE GUIA", chamada: "LINK NA BIO" },
  exemplos: ["a cor azul", "o sol", "as nuvens"],
  heroi,
  // 2 a 3 planos por fala; o 1º corte seco é em ~2 s (@1:inicio-0.35); zoom (fov) diferente em cada plano
  cameras: [
    { em: "@1:inicio-0.5", lugar: "cidade", perto: true, dur: 0.01 },
    { em: "@1:sempre-0.3", lugar: "ceu", dur: 0.7 },
    { em: "@2:inicio-0.2", lugar: "praca", dur: 0.7 },
    { em: "@2:curtido-0.3", pos: [-1.5, 3.2, 28], alvo: [0, 3, 17.5], fov: 38, deriva: [0.5, 0, -0.4], foco: 0.7, dur: 0.7 },
    { em: "@2:espelhos-0.3", lugar: "praca", perto: true, dur: 0.8 },
    { em: "@3:inicio-0.3", pos: [0, 4.6, 31], alvo: [0, 3.2, 17.5], fov: 42, deriva: [0.5, 0, -0.5], foco: 0.6, dur: 0.8 },
    { em: "@3:como-0.3", pos: [-2.2, 3.0, 26], alvo: [0, 2.9, 18], fov: 36, deriva: [0.4, 0, -0.4], foco: 0.7, dur: 0.7 },
    { em: "@4:inicio-0.3", pos: [3, 3.0, 29], alvo: [0, 1.8, 18], fov: 42, deriva: [-0.5, 0, -0.4], foco: 0.6, dur: 0.7 },
    { em: "@4:escuro-0.4", pos: [-0.6, 2.2, 25], alvo: [0, 1.8, 18], fov: 36, deriva: [0, 0, -0.3], foco: 0.8, dur: 0.6 },
    { em: "@5:inicio-0.3", pos: [-3, 3.0, 29], alvo: [0, 2.0, 18], fov: 42, deriva: [0.5, 0, -0.4], foco: 0.6, dur: 0.7 },
    { em: "@5:dente-0.4", pos: [0.4, 2.2, 25], alvo: [-1, 1.8, 18.2], fov: 36, deriva: [0, 0, -0.3], foco: 0.8, dur: 0.6 },
    { em: "@6:inicio-0.3", lugar: "praca", dur: 0.8 },
    { em: "@6:maquiagem-0.3", pos: [2, 3.0, 27], alvo: [0, 2.8, 19.7], fov: 38, deriva: [-0.5, 0, -0.4], foco: 0.7, dur: 0.7 },
    { em: "@6:arte-0.3", lugar: "praca", perto: true, dur: 0.7 },
    { em: "@7:inicio-0.3", pos: [2.5, 3.4, 29], alvo: [0, 1.8, 19.5], fov: 42, deriva: [-0.4, 0, -0.4], foco: 0.6, dur: 0.8 },
    { em: "@7:graça-0.4", pos: [0.3, 2.0, 25.5], alvo: [0, 1.7, 19.8], fov: 38, deriva: [0, 0, -0.3], foco: 0.8, dur: 0.6 },
    { em: "@8:inicio-0.3", lugar: "cidade", perto: true, dur: 1.0 },
    { em: "@8:comente-0.3", lugar: "rua", perto: true, dur: 0.01 },
    { em: "@9:inicio-0.3", lugar: "praca", dur: 0.8 },
    { em: "@9:espelho-0.4", lugar: "praca", perto: true, dur: 0.7 },
    { em: "@10:inicio-0.3", pos: [0, 12, 36], alvo: [0, 1, 19], fov: 46, deriva: [0, 0, -0.4], foco: 0.6, dur: 0.9 },
    { em: "@10:espelho-0.4", pos: [1, 2.6, 28], alvo: [0, 1, 19.5], fov: 40, deriva: [-0.4, 0, -0.3], foco: 0.8, dur: 0.7 },
    { em: "@10:cidade-0.3", lugar: "cidade", perto: true, dur: 0.9 },
    { em: "@11:inicio-0.3", pos: [0, 15, 38], alvo: [0, 1, 19], fov: 44, deriva: [0, 0, -0.4], foco: 0.6, dur: 1.6, arco: 2 },
    { em: "@11:some-0.5", lugar: "ceu", dur: 0.8 },
    { em: "@12:inicio-0.35", lugar: "praca" },
    { em: "@12:todo-0.2", lugar: "praca", perto: true, dur: 0.8 },
    { em: "@14:inicio-0.35", lugar: "cidade", dur: 1.0 },
  ],
  pecas,
  // selos fixos na tela (nunca cortam)
  selos: [
    { txt: "COMO ESTOU?", em: "@3:rosto-0.1", ate: "@4:inicio", cor: "#27324a", fundo: "#ffe9b3", r: -2 },
    { txt: "CORTE NO ESCURO", em: "@4:escuro-0.2", ate: "@5:inicio", cor: "#27324a", fundo: "#ffd23f", r: 2 },
    { txt: "DENTE ERRADO", em: "@5:errado-0.2", ate: "@6:inicio", cor: "#27324a", fundo: "#d6f5e0", r: -2 },
    { txt: "ARTE MODERNA", em: "@6:arte-0.1", ate: "@7:inicio", cor: "#27324a", fundo: "#ffd1e0", r: 2 },
    { txt: "SEM GRAÇA", em: "@7:graça-0.1", ate: "@8:inicio", cor: "#27324a", fundo: "#ffe9b3", r: -2 },
    { txt: "AMIGO = ESPELHO", em: "@9:amigo-0.1", ate: "@10:inicio", cor: "#27324a", fundo: "#ffd23f", r: 2 },
    { txt: "RIO = ESPELHO", em: "@10:rio-0.1", ate: "@11:inicio", cor: "#27324a", fundo: "#bfeaff", r: -2 },
    { txt: "SEM REFLEXO", em: "@11:reflexo-0.1", ate: "@12:inicio", cor: "#ffffff", fundo: "#27324a", borda: "#fffdf6", r: 2 },
  ],
  etiquetas: [
    { txt: "NINGUÉM RECLAMA", pos: [0, 4.9, 18], em: "@reclama", ate: "@13:inicio-0.3" },
    { txt: "SEU NILO", pos: [-0.9, 4.25, 18.5], em: "@nilo+0.7", ate: "@13:anotou-0.2", cor: "ouro" },
  ],
  // efeitos no quadro exato
  sons: [
    { em: "@2:inicio", tipo: "carimbo", volume: 0.9 },
    { em: "@4:escuro", tipo: "nhac", volume: 0.8 },
    { em: "@5:errado", tipo: "pop", volume: 0.8 },
    { em: "@6:arte", tipo: "pop", volume: 0.8 },
    { em: "@7:graça", tipo: "virada", volume: 0.8 },
    { em: "@10:espelho", tipo: "subida", volume: 0.7 },
    { em: "@11:some", tipo: "glitch", volume: 0.9 },
  ],
  transicoes: [{ em: "@3:inicio-0.2", tipo: "luz", dur: 0.6 }, { em: "@9:inicio-0.2", tipo: "luz", dur: 0.6 }, { em: "@11:inicio-0.2", tipo: "flash", dur: 0.6 }],
  tremores: ["@11:some"],
};

const ep = { id: "hoje-sumiu-dia11", dia: 11, coisa: "os espelhos", velocidade: 1, falas: FALAS.map((fala, i) => ({ fala, legenda: LEG[i], ...(i === 13 ? { segura: 1.4 } : {}) })), cortes, cena };
writeFileSync(RAIZ + "episodios/dia11.json", JSON.stringify(ep, null, 1));
console.log("ok: episodios/dia11.json e public/hoje-sumiu-dia11.mp3, voz unida", Math.round(ini * 100) / 100, "s com pausas de 0,6 s");
