// Gera hoje-sumiu/episodios/dia12.json e a voz unida (public/hoje-sumiu-dia12.mp3): a cor azul.
// Motor do Hoje Sumiu ("livro"): câmera de leitor, página virando, legenda em tira de papel, luz do motor, -14 LUFS.
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const RAIZ = "C:/Users/User/Documents/Origem Digital/4-midia/posts-automaticos/hoje-sumiu/";
const FF = "C:/Users/User/Documents/Origem Digital/4-midia/posts-automaticos/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe";
const VOZ = "C:/Users/User/AppData/Local/Temp/claude/bc88afa6adac9a0f/bf3c00df-bf9e-4837-b039-126c1536f033/scratchpad/voz12/";
const GAP = 0.6;
const DUR = [1.96, 2.77, 2.77, 3.08, 1.96, 1.96, 3.47, 4.05, 2.59, 3.47, 3.55, 3.24, 4.36, 2.77, 2.43, 5.33];

// clipes 1, 8, 13, 14 e 15 são os mesmos do Dia 11 (mesmo texto, mesma voz)
const FALAS = [
  "Hoje sumiu a cor azul.",
  "Do mundo inteiro. Para sempre.",
  "O comentário mais curtido foi a cor azul.",
  "Primeira manhã: o céu amanhece cinza.",
  "Ninguém sabe se vai chover.",
  "O mar perde a graça.",
  "Em uma semana, a caneta azul vira só caneta.",
  "Em duas semanas, o pintor não consegue mais fazer verde.",
  "Feito sem câmera. Comente GUIA.",
  "Em um mês, toda calça azul vira calça cinza.",
  "Em três meses, a arara azul vira só arara.",
  "No fim, ninguém mais diz que está tudo azul.",
  "Mas ninguém reclama. Para todo mundo, azul nunca existiu.",
  "Só o Seu Nilo lembra. Ele anotou.",
  "Amanhã, outra coisa vai sumir.",
  "Quem escolhe é você. Comente o que some amanhã. O mais curtido decide.",
];
const LEG = [
  "Hoje sumiu a cor ~azul.~",
  "Do mundo inteiro. Para *sempre.*",
  "O comentário mais *curtido* foi a cor *azul.*",
  "Primeira manhã: o *céu* amanhece *cinza.*",
  "Ninguém sabe se vai *chover.*",
  "O *mar* perde a *graça.*",
  "Em uma semana, a *caneta* azul vira só *caneta.*",
  "Em duas semanas, o *pintor* não consegue mais fazer *verde.*",
  "*Feito* sem *câmera.* Comente *GUIA.*",
  "Em um mês, toda *calça* azul vira calça *cinza.*",
  "Em três meses, a *arara* azul vira só *arara.*",
  "No fim, ninguém mais diz que está *tudo* *azul.*",
  "Mas ninguém reclama. Para todo mundo, azul *nunca existiu.*",
  "Só o *Seu Nilo* lembra. Ele *anotou.*",
  "Amanhã, outra coisa vai *sumir.*",
  "Quem escolhe é *você.* Comente o que some amanhã. O mais *curtido* decide.",
];
if (LEG.length !== FALAS.length) throw new Error("legendas e falas não batem");
LEG.forEach((l, i) => { const a = l.split(/\s+/).length, b = FALAS[i].split(/\s+/).length; if (a !== b) throw new Error(`fala ${i}: legenda ${a} palavras, fala ${b}`); });

// 1. voz unida com pausas de 0,6 s
const sil = VOZ + "sil.wav";
execFileSync(FF, ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", String(GAP), sil]);
const args = ["-y", "-loglevel", "error"], ordem = [];
FALAS.forEach((_, i) => { ordem.push(VOZ + String(i).padStart(2, "0") + ".mp3"); if (i < FALAS.length - 1) ordem.push(sil); });
ordem.forEach((f) => args.push("-i", f));
const filtro = ordem.map((_, i) => `[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo[a${i}]`).join(";") + ";" + ordem.map((_, i) => `[a${i}]`).join("") + `concat=n=${ordem.length}:v=0:a=1[out]`;
args.push("-filter_complex", filtro, "-map", "[out]", "-c:a", "libmp3lame", "-q:a", "2", RAIZ + "public/hoje-sumiu-dia12.mp3");
execFileSync(FF, args);
let ini = 0;
const cortes = DUR.map((d) => { const c = [Math.round(ini * 100) / 100, Math.round((ini + d + 0.05) * 100) / 100]; ini += d + GAP; return c; });

// ---------- cena ----------
const AZ = "#2f7dff", AZC = "#5cb8e4"; // depois da onda o filtro `semAzul` deixa tudo isso cinza, na tela inteira
const pessoa = (x, z, roupa, sem, pose, extra = {}) => ({ peca: "pessoa", pos: [x, 0, z], escala: 1.6, roupa, semente: sem, poses: [{ pose: "normal" }, { em: pose.em, pose: pose.pose }], balanca: { em: pose.em, amp: pose.amp ?? 0.04 }, ...extra });
const ROUPAS = ["#ffb703", "#f28aa5", "#45c46b", "#ff9f1c", "#ffd23f", "#b794e6"]; // sem roupa azul: no mundo sem azul ela seria só mais um cinza

// herói do 1º quadro: três coisas bem azuis na praça (balão, pipa e borboleta), cada uma com o seu dono
const dono = (x, sem, roupa) => pessoa(x, 0.9, roupa, sem, { em: "@onda", pose: "susto" }, { poses: [{ pose: "feliz" }, { em: "@onda", pose: "susto" }], escala: 1.35 });
const heroi = { peca: { peca: "grupo", pos: [0, 0.2, 15.5], em: -1, sai: "@1:fim-0.2", modo: "cresce", filhos: [
  { peca: "grupo", pos: [-2.5, 0, 0], filhos: [ // balão
    { forma: "oval", rx: 0.95, ry: 1.15, cor: AZ, pos: [0, 3.0, 0], sombra: { rx: 0.8, rz: 0.3, pos: [0, -2.96, 0.2] } },
    { forma: "poligono", pontos: [[-0.16, 0], [0.16, 0], [0, 0.22]], cor: AZ, pos: [0, 1.72, 0.02] },
    { forma: "poligono", pontos: [[-0.1, -0.5], [0.06, -0.5], [0.3, 0.45], [0.14, 0.45]], cor: "#ffffff", pos: [-0.35, 3.25, 0.06] },
    { forma: "caixa", l: 0.05, a: 1.3, p: 0.05, cor: "#8d99ae", pos: [0, 1.1, 0] },
    dono(0.2, 21, "#ffb703"),
  ] },
  { peca: "grupo", pos: [0, 0, 0], filhos: [ // pipa
    { forma: "poligono", pontos: [[0, 1.25], [0.9, 0.15], [0, -1.25], [-0.9, 0.15]], cor: AZC, pos: [0, 3.0, 0], sombra: { rx: 0.7, rz: 0.28, pos: [0, -2.96, 0.2] } },
    { forma: "caixa", l: 0.06, a: 2.5, p: 0.03, cor: "#ffffff", pos: [0, 3.0, 0.05] },
    { forma: "caixa", l: 1.8, a: 0.06, p: 0.03, cor: "#ffffff", pos: [0, 3.15, 0.05] },
    { forma: "caixa", l: 0.05, a: 1.5, p: 0.05, cor: "#8d99ae", pos: [0, 1.0, 0] },
    dono(0.0, 22, "#f28aa5"),
  ] },
  { peca: "grupo", pos: [2.5, 0, 0], filhos: [ // guarda-sol azul
    { forma: "poligono", pontos: [[-1.25, 0], [-0.95, 0.55], [-0.4, 0.92], [0, 1.0], [0.4, 0.92], [0.95, 0.55], [1.25, 0]], cor: AZ, pos: [0, 2.9, 0], sombra: { rx: 1.0, rz: 0.32, pos: [0, -2.86, 0.2] } },
    { forma: "caixa", l: 0.09, a: 2.9, p: 0.09, cor: "#8d99ae", pos: [0, 1.45, -0.02] },
    dono(-0.2, 23, "#45c46b"),
  ] },
] }, camera: [0, 3.6, 30.5], alvo: [0, 2.4, 15.5] };

const guardaChuva = (x, cor, sem, roupa) => ({ peca: "grupo", pos: [x, 0, 2.3], filhos: [
  { forma: "poligono", pontos: [[-1.0, 0], [-0.75, 0.45], [-0.3, 0.72], [0, 0.78], [0.3, 0.72], [0.75, 0.45], [1.0, 0]], cor, pos: [0.25, 3.25, 0.2] },
  { forma: "caixa", l: 0.07, a: 1.6, p: 0.07, cor: "#59616f", pos: [0.25, 2.5, 0.18] },
  pessoa(0, 0, roupa, sem, { em: "@4:chover", pose: "shrug" }),
] });
// arara num poleiro: corpo e asa azuis (viram cinza), rosto amarelo, bico escuro
const arara = { peca: "grupo", pos: [0, 0.2, 19.8], em: "@10:inicio-0.35", sai: "@11:inicio", filhos: [
  { forma: "caixa", l: 0.14, a: 1.5, p: 0.14, cor: "#8a5a3c", pos: [0, 0.75, 0], sombra: { rx: 0.9, rz: 0.3, pos: [0, -0.72, 0.15] } },
  { forma: "caixa", l: 2.0, a: 0.14, p: 0.14, cor: "#8a5a3c", pos: [0, 1.5, 0] },
  { forma: "oval", rx: 0.2, ry: 0.95, cor: "#1f5fd0", rot: [0, 0, 0.25], pos: [-0.35, 0.95, 0.04] },
  { forma: "oval", rx: 0.5, ry: 0.82, cor: AZ, pos: [0, 2.25, 0.1] },
  { forma: "oval", rx: 0.3, ry: 0.62, cor: "#1f5fd0", rot: [0, 0, 0.3], pos: [-0.2, 2.15, 0.16] },
  { forma: "circulo", r: 0.42, cor: AZ, pos: [0.12, 3.15, 0.14] },
  { forma: "circulo", r: 0.2, cor: "#ffd23f", pos: [0.26, 3.12, 0.2] },
  { forma: "circulo", r: 0.07, cor: "#27324a", pos: [0.28, 3.16, 0.24] },
  { forma: "poligono", pontos: [[0, 0.2], [0.42, 0.02], [0.12, -0.26], [0, -0.1]], cor: "#3a3e47", pos: [0.45, 3.02, 0.2] },
  { forma: "oval", rx: 0.07, ry: 0.14, cor: "#ffd23f", pos: [-0.14, 1.62, 0.18] }, { forma: "oval", rx: 0.07, ry: 0.14, cor: "#ffd23f", pos: [0.14, 1.62, 0.18] },
] };

const BASE = [0, 0.2, 17.5];
const pecas = [
  // 3: o céu amanhece cinza (todo mundo olhando para cima)
  { peca: "grupo", pos: BASE, em: "@3:inicio-0.35", sai: "@4:inicio", filhos: [
    pessoa(-2.2, 2.6, ROUPAS[0], 31, { em: "@3:cinza", pose: "susto" }),
    pessoa(0, 2.2, ROUPAS[1], 32, { em: "@3:céu", pose: "mostra" }),
    pessoa(2.2, 2.6, ROUPAS[2], 33, { em: "@3:cinza", pose: "shrug" }),
  ] },
  // 4: ninguém sabe se vai chover (guarda-chuva aberto debaixo do sol)
  { peca: "grupo", pos: BASE, em: "@4:inicio-0.35", sai: "@5:inicio", filhos: [
    guardaChuva(-2.3, "#ffd23f", 41, ROUPAS[3]), guardaChuva(0, "#f28aa5", 42, ROUPAS[2]), guardaChuva(2.3, "#45c46b", 43, ROUPAS[0]),
  ] },
  // 5: o mar perde a graça (areia, mar e banhistas desanimados)
  { peca: "grupo", pos: [0, 0.2, 18.5], em: "@5:inicio-0.35", sai: "@6:inicio", filhos: [
    { forma: "retangulo", l: 24, a: 2.4, cor: "#ffe9a8", rot: [-Math.PI / 2, 0, 0], pos: [0, 0.05, -0.4], canto: 0.3 },
    { forma: "retangulo", l: 24, a: 4.2, cor: "#8fd6ff", rot: [-Math.PI / 2, 0, 0], pos: [0, 0.06, 2.6], canto: 0.3 },
    { forma: "retangulo", l: 24, a: 1.6, cor: "#ffe9a8", rot: [-Math.PI / 2, 0, 0], pos: [0, 0.07, 5.4], canto: 0.3 },
    { forma: "circulo", r: 0.45, cor: "#ff9f1c", pos: [-1.6, 0.5, 5.2] }, { forma: "circulo", r: 0.2, cor: "#ffffff", pos: [-1.6, 0.6, 5.25] },
    ...[-6, -4, -2, 0, 2, 4, 6, -5, -1, 3].map((x, i) => ({ forma: "oval", rx: 0.8, ry: 0.13, cor: "#ffffff", rot: [-Math.PI / 2, 0, 0], pos: [x, 0.09, 1.2 + (i % 3) * 1.0] })),
    ...Array.from({ length: 6 }, (_, i) => pessoa(-5.5 + i * 2.2, -0.3 + (i % 2) * 0.4, ROUPAS[i % 6], 50 + i, { em: "@5:graça", pose: "azedo" }, { escala: 1.45 })),
  ] },
  // 6: a caneta azul vira só caneta (caneta gigante de pé)
  { peca: "grupo", pos: BASE, em: "@6:inicio-0.35", sai: "@7:inicio", filhos: [
    { forma: "caixa", l: 0.5, a: 2.9, p: 0.5, cor: AZ, pos: [-0.9, 2.05, 0], rot: [0, 0, -0.1], sombra: { rx: 0.7, rz: 0.3, pos: [0.15, -2.0, 0.2] } },
    { forma: "poligono", pontos: [[-0.25, 0.5], [0.25, 0.5], [0, 0]], cor: "#e8e8e8", pos: [-1.08, 0.12, 0.26] },
    { forma: "caixa", l: 0.56, a: 0.5, p: 0.56, cor: "#1f5fd0", pos: [-0.74, 3.7, 0], rot: [0, 0, -0.1] },
    { forma: "caixa", l: 0.1, a: 1.1, p: 0.1, cor: "#ffffff", pos: [-0.52, 3.0, 0.3], rot: [0, 0, -0.1] },
    pessoa(1.0, 0.9, ROUPAS[4], 61, { em: "@6:só", pose: "shrug" }),
  ] },
  // 7: o pintor não consegue mais fazer verde (tela com as duas tintas, mesa com o balde amarelo e o balde que era azul)
  { peca: "grupo", pos: BASE, em: "@7:inicio-0.35", sai: "@8:inicio", filhos: [
    { forma: "retangulo", l: 1.9, a: 2.2, cor: "#ffffff", pos: [-1.7, 1.6, 0], canto: 0.06, sombra: { rx: 1.0, rz: 0.3, pos: [0, -1.56, 0.2] } },
    { forma: "caixa", l: 0.12, a: 1.6, p: 0.12, cor: "#8a5a3c", pos: [-1.7, 0.8, -0.12] },
    { forma: "circulo", r: 0.45, cor: "#ffd23f", pos: [-2.0, 3.1, 0.07] }, { forma: "circulo", r: 0.45, cor: AZ, pos: [-1.4, 2.5, 0.09] },
    { forma: "caixa", l: 1.9, a: 1.5, p: 0.8, cor: "#b98a57", pos: [0.25, 0.75, 1.0], sombra: { rx: 1.2, rz: 0.4, pos: [0, -0.72, 0.1] } },
    { forma: "caixa", l: 0.6, a: 0.6, p: 0.6, cor: "#ffd23f", pos: [-0.2, 1.8, 1.0] },
    { forma: "caixa", l: 0.6, a: 0.6, p: 0.6, cor: AZ, pos: [0.7, 1.8, 1.0] },
    pessoa(2.0, 0.4, "#ffffff", 71, { em: "@7:verde", pose: "shrug" }, { poses: [{ pose: "mostra" }, { em: "@7:verde", pose: "shrug" }] }),
  ] },
  // 9: toda calça azul vira calça cinza
  { peca: "grupo", pos: BASE, em: "@9:inicio-0.35", sai: "@10:inicio", filhos: [
    pessoa(-2.2, 2.4, ROUPAS[0], 91, { em: "@9:cinza", pose: "azedo" }, { calca: AZ }),
    pessoa(0, 2.0, ROUPAS[1], 92, { em: "@9:cinza", pose: "shrug" }, { calca: "#1f5fd0" }),
    pessoa(2.2, 2.4, ROUPAS[2], 93, { em: "@9:cinza", pose: "azedo" }, { calca: AZ }),
  ] },
  // 10: a arara azul vira só arara
  arara,
  // 11: ninguém mais diz que está tudo azul
  { peca: "grupo", pos: BASE, em: "@11:inicio-0.35", sai: "@12:inicio", filhos: [
    pessoa(-2.6, 2.4, ROUPAS[3], 111, { em: "@11:azul", pose: "shrug" }, { poses: [{ pose: "feliz" }, { em: "@11:azul", pose: "shrug" }] }),
    pessoa(-0.9, 2.2, ROUPAS[1], 112, { em: "@11:azul", pose: "azedo" }, { poses: [{ pose: "mostra" }, { em: "@11:azul", pose: "azedo" }] }),
    pessoa(0.9, 2.2, ROUPAS[4], 113, { em: "@11:azul", pose: "shrug" }, { poses: [{ pose: "feliz" }, { em: "@11:azul", pose: "shrug" }] }),
    pessoa(2.6, 2.4, ROUPAS[2], 114, { em: "@11:azul", pose: "azedo" }, { poses: [{ pose: "mostra" }, { em: "@11:azul", pose: "azedo" }] }),
  ] },
  // 12: ninguém reclama, todo mundo sorrindo na praça
  { peca: "grupo", pos: BASE, em: "@12:inicio-0.35", sai: "@13:inicio-0.25", modo: "cresce", filhos: [
    pessoa(-3.2, 0, ROUPAS[0], 12, { em: "@12:reclama", pose: "feliz" }), pessoa(-1.1, 0, ROUPAS[2], 13, { em: "@12:reclama", pose: "feliz" }),
    pessoa(1.1, 0, ROUPAS[3], 14, { em: "@12:reclama", pose: "feliz" }), pessoa(3.2, 0, ROUPAS[1], 15, { em: "@12:reclama", pose: "feliz" }),
  ] },
];

const PRACA = (dx, y = 3.8) => ({ pos: [dx, y, 33], alvo: [dx * 0.3, 3.0, 18.6], fov: 40, deriva: [-dx * 0.12, 0, -0.5], foco: 0.5 });
const cena = {
  cor: AZ,
  titulo: "a cor azul",
  motor: "livro",
  luzMotor: true,
  visual: "livro",
  semAzul: "@onda",
  semCarros: true,
  somemPredios: -10,
  lufs: -14,
  sumiram: ["Dia 10: o chuveiro", "Dia 11: os espelhos"],
  trilha: { nome: "misterio", constroi: ["@3:voz", "@5:voz", "@7:voz", "@9:voz", "@10:voz"], climax: "@11:inicio" },
  impactos: [{ em: "@onda", silencio: 0.5, volta: 0.4 }, { em: "@11:azul", silencio: 0.5, volta: 0.5 }],
  credito: { rotulo: "O MAIS CURTIDO", conta: "@yhago._cassiano", texto: "A cor azul", curtidas: 10 },
  divulgacao: { em: "@8:voz-0.05", ate: "@8:fim-0.05", titulo: "SEM CÂMERA", sub: "COMENTE GUIA", chamada: "LINK NA BIO" },
  exemplos: ["o sol", "as nuvens", "o mosquito"],
  heroi,
  // câmera de leitor: um enquadramento firme por fala; a troca é a página virando
  cameras: [
    { em: "@1:inicio-0.3", lugar: "cidade", perto: true },
    { em: "@2:inicio-0.3", lugar: "praca" },
    { em: "@3:inicio-0.3", pos: [0, 3.0, 34], alvo: [0, 5.2, 18], fov: 44, deriva: [0, 0.1, -0.4], foco: 0.3 },
    { em: "@4:inicio-0.3", ...PRACA(0.8, 4.2) },
    { em: "@5:inicio-0.3", pos: [0, 9, 36], alvo: [0, 1.2, 20.5], fov: 42, deriva: [0, -0.2, -0.5], foco: 0.4 },
    { em: "@6:inicio-0.3", pos: [0, 3.9, 33.5], alvo: [0, 2.9, 18.6], fov: 40, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@7:inicio-0.3", pos: [0.2, 3.9, 33.5], alvo: [0.2, 2.9, 18.6], fov: 40, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@8:inicio-0.3", lugar: "cidade", perto: true },
    { em: "@9:inicio-0.3", pos: [0, 2.2, 37.5], alvo: [0, 0.5, 19.8], fov: 40, deriva: [0, 0, -0.4], foco: 0.5 },
    { em: "@10:inicio-0.3", pos: [0.4, 3.4, 30.5], alvo: [0, 2.4, 19.8], fov: 40, deriva: [-0.2, 0, -0.4], foco: 0.5 },
    { em: "@11:inicio-0.3", pos: [0, 3.8, 33], alvo: [0, 3.0, 19.8], fov: 40, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@12:inicio-0.35", lugar: "praca" },
    { em: "@14:inicio-0.35", lugar: "cidade" },
  ],
  pecas,
  selos: [
    { txt: "CÉU CINZA", em: "@3:cinza-0.1", ate: "@4:inicio", cor: "#27324a", fundo: "#e8e8e8", r: -2 },
    { txt: "VAI CHOVER?", em: "@4:chover-0.15", ate: "@5:inicio", cor: "#27324a", fundo: "#ffd23f", r: 2 },
    { txt: "MAR SEM GRAÇA", em: "@5:graça-0.15", ate: "@6:inicio", cor: "#27324a", fundo: "#ffe9b3", r: -2 },
    { txt: "SÓ CANETA", em: "@6:só-0.1", ate: "@7:inicio", cor: "#27324a", fundo: "#ffd1e0", r: 2 },
    { txt: "CADÊ O VERDE?", em: "@7:verde-0.15", ate: "@8:inicio", cor: "#27324a", fundo: "#d6f5e0", r: -2 },
    { txt: "CALÇA CINZA", em: "@9:cinza-0.1", ate: "@10:inicio", cor: "#27324a", fundo: "#e8e8e8", r: 2 },
    { txt: "SÓ ARARA", em: "@10:só-0.1", ate: "@11:inicio", cor: "#27324a", fundo: "#ffd23f", r: -2 },
    { txt: "TUDO... CINZA?", em: "@11:azul-0.1", ate: "@12:inicio", cor: "#ffffff", fundo: "#3a3e47", borda: "#fffdf6", r: 2 },
  ],
  etiquetas: [
    { txt: "NINGUÉM RECLAMA", pos: [0, 4.9, 18], em: "@reclama", ate: "@13:inicio-0.3" },
    { txt: "SEU NILO", pos: [-0.9, 4.25, 18.5], em: "@nilo+0.7", ate: "@13:anotou-0.2", cor: "ouro" },
  ],
  sons: [
    { em: "@2:inicio", tipo: "carimbo", volume: 0.9 },
    { em: "@3:cinza", tipo: "virada", volume: 0.8 },
    { em: "@4:chover", tipo: "pop", volume: 0.8 },
    { em: "@5:graça", tipo: "virada", volume: 0.7 },
    { em: "@6:só", tipo: "pop", volume: 0.8 },
    { em: "@7:verde", tipo: "nhac", volume: 0.7 },
    { em: "@9:cinza", tipo: "pop", volume: 0.8 },
    { em: "@10:só", tipo: "virada", volume: 0.8 },
    { em: "@11:azul", tipo: "glitch", volume: 0.9 },
  ],
  transicoes: [],
  tremores: ["@11:azul"],
};

const ep = { id: "hoje-sumiu-dia12", dia: 12, coisa: "a cor azul", velocidade: 1, falas: FALAS.map((fala, i) => ({ fala, legenda: LEG[i], ...(i === 13 ? { segura: 1.4 } : {}) })), cortes, cena };
writeFileSync(RAIZ + "episodios/dia12.json", JSON.stringify(ep, null, 1));
console.log("ok: episodios/dia12.json e public/hoje-sumiu-dia12.mp3, voz unida", Math.round(ini * 100) / 100, "s");
