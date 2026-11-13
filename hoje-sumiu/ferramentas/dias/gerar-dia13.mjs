// Gera hoje-sumiu/episodios/dia13.json e a voz unida (public/hoje-sumiu-dia13.mp3): o sol.
// Motor "livro". Teste do dia (uma mudança por episódio, números do YouTube de 12/11/2026): o sol já vira do avesso
// no segundo zero (`cena.onda: 0.7`), antes de a voz dizer o nome. O título está inteiro no quadro 0.
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const RAIZ = "C:/Users/User/Documents/Origem Digital/4-midia/posts-automaticos/hoje-sumiu/";
const BIN = "C:/Users/User/Documents/hoje-sumiu/node_modules/@remotion/compositor-win32-x64-msvc/";
const FF = BIN + "ffmpeg.exe", FP = BIN + "ffprobe.exe";
const VOZ = process.env.VOZ ?? "C:/Users/User/AppData/Local/Temp/claude/bc88afa6adac9a0f/bf3c00df-bf9e-4837-b039-126c1536f033/scratchpad/voz13/";
const GAP = 0.6;

// clipes 01, 08, 13, 14 e 15 vêm do Dia 12 (mesmo texto, mesma voz Mark)
const FALAS = [
  "Hoje sumiu o sol.",
  "Do mundo inteiro. Para sempre.",
  "O comentário mais curtido foi o sol.",
  "Por oito minutos, ninguém percebe.",
  "É o tempo que a luz do sol leva para chegar.",
  "Aí o céu apaga.",
  "A lua apaga junto. Ela só brilhava com a luz do sol.",
  "Em uma semana, as flores param de abrir.",
  "Feito sem câmera. Comente GUIA.",
  "E nem dá para acender a luz. A energia sumiu no dia quatro.",
  "Pelo menos ninguém sente frio. O frio sumiu no dia dois.",
  "No fim, o mundo vira uma noite que não acaba.",
  "Mas ninguém reclama. Para todo mundo, o sol nunca existiu.",
  "Só o Seu Nilo lembra. Ele anotou.",
  "Amanhã, outra coisa vai sumir.",
  "Quem escolhe é você. Comente o que some amanhã. O mais curtido decide.",
];
const ARQ = ["00", "01", "02", "03", "04", "05", "06", "08", "07", "09", "10", "11", "12", "13", "14", "15"]; // o clipe 07 é o do guia
const LEG = [
  "Hoje sumiu o ~sol.~",
  "Do mundo inteiro. Para *sempre.*",
  "O comentário mais *curtido* foi o *sol.*",
  "Por *8* minutos, ninguém *percebe.*",
  "É o tempo que a *luz* do sol leva para *chegar.*",
  "Aí o céu *apaga.*",
  "A *lua* apaga junto. Ela só brilhava com a luz do *sol.*",
  "Em uma semana, as *flores* param de *abrir.*",
  "*Feito* sem *câmera.* Comente *GUIA.*",
  "E nem dá para acender a *luz.* A *energia* sumiu no Dia *4.*",
  "Pelo menos ninguém sente *frio.* O frio sumiu no Dia *2.*",
  "No fim, o mundo vira uma *noite* que não *acaba.*",
  "Mas ninguém reclama. Para todo mundo, o sol *nunca existiu.*",
  "Só o *Seu Nilo* lembra. Ele *anotou.*",
  "Amanhã, outra coisa vai *sumir.*",
  "Quem escolhe é *você.* Comente o que some amanhã. O mais *curtido* decide.",
];
if (LEG.length !== FALAS.length) throw new Error("legendas e falas não batem");
LEG.forEach((l, i) => { const a = l.split(/\s+/).length, b = FALAS[i].split(/\s+/).length; if (a !== b) throw new Error(`fala ${i}: legenda ${a} palavras, fala ${b}`); });

// 1. voz unida com pausas de 0,6 s; os cortes vêm da duração de cada clipe
const clipes = ARQ.map((a) => VOZ + a + ".mp3");
const DUR = clipes.map((f) => Number(execFileSync(FP, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim()));
const sil = VOZ + "sil.wav";
execFileSync(FF, ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", String(GAP), sil]);
const args = ["-y", "-loglevel", "error"], ordem = [];
clipes.forEach((f, i) => { ordem.push(f); if (i < clipes.length - 1) ordem.push(sil); });
ordem.forEach((f) => args.push("-i", f));
const filtro = ordem.map((_, i) => `[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo[a${i}]`).join(";") + ";" + ordem.map((_, i) => `[a${i}]`).join("") + `concat=n=${ordem.length}:v=0:a=1[out]`;
args.push("-filter_complex", filtro, "-map", "[out]", "-c:a", "libmp3lame", "-q:a", "2", RAIZ + "public/hoje-sumiu-dia13.mp3");
execFileSync(FF, args);
let ini = 0;
const cortes = DUR.map((d) => { const c = [Math.round(ini * 100) / 100, Math.round((ini + d + 0.05) * 100) / 100]; ini += d + GAP; return c; });

// ---------- cena ----------
// O azul já sumiu (Dia 12): `semAzul: -10` deixa cinza tudo o que é azul. Nada de azul como destaque.
const SOL = "#ffc21a", SOLC = "#ff9f1c";
const pessoa = (x, z, roupa, sem, pose, extra = {}) => ({ peca: "pessoa", pos: [x, 0, z], escala: 1.6, roupa, semente: sem, poses: [{ pose: "normal" }, { em: pose.em, pose: pose.pose }], balanca: { em: pose.em, amp: pose.amp ?? 0.04 }, ...extra });
const ROUPAS = ["#ffb703", "#f28aa5", "#45c46b", "#ff9f1c", "#ffd23f", "#b794e6"];
const raios = (n, r0, r1, larg, cor) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
  return { forma: "poligono", pontos: [[c * r0 + px * larg, s * r0 + py * larg], [c * r1, s * r1], [c * r0 - px * larg, s * r0 - py * larg]], cor, pos: [0, 0, -0.02] }; });
// sol de papel grande: disco, miolo, rosto simples e 12 raios
const solGrande = (r) => [
  ...raios(12, r * 0.95, r * 1.6, r * 0.22, SOLC),
  { forma: "circulo", r, cor: SOL, pos: [0, 0, 0] },
  { forma: "circulo", r: r * 0.78, cor: "#ffd84d", pos: [0, 0, 0.02] },
  { forma: "circulo", r: r * 0.09, cor: "#3a2a1a", pos: [-r * 0.3, r * 0.15, 0.04] }, { forma: "circulo", r: r * 0.09, cor: "#3a2a1a", pos: [r * 0.3, r * 0.15, 0.04] },
  { forma: "oval", rx: r * 0.3, ry: r * 0.12, cor: "#e2683c", pos: [0, -r * 0.25, 0.04] },
];

// herói do 1º quadro: o sol enorme sobre a praça, com dois banhistas de óculos escuros. Ele vira do avesso (cinza) no segundo zero e dobra de volta para a página.
const banhista = (x, sem, roupa) => pessoa(x, 1.4, roupa, sem, { em: "@onda", pose: "susto" }, { poses: [{ pose: "feliz" }, { em: "@onda", pose: "susto" }], escala: 1.35 });
const heroi = { peca: { peca: "grupo", pos: [0, 0.2, 15.5], em: -1, sai: "@1:fim-0.2", modo: "cresce", filhos: [
  { peca: "grupo", pos: [0, 2.55, -1.2], some: "@onda", sai: "@onda+1.1", filhos: solGrande(1.5) },
  { forma: "retangulo", l: 2.2, a: 1.0, cor: "#ff7a7a", rot: [-Math.PI / 2, 0, 0], pos: [-2.4, 0.04, 1.6], canto: 0.1 },
  { forma: "retangulo", l: 2.2, a: 1.0, cor: "#ffd23f", rot: [-Math.PI / 2, 0, 0], pos: [2.4, 0.04, 1.6], canto: 0.1 },
  banhista(-2.4, 21, "#ff9f1c"), banhista(2.4, 22, "#45c46b"),
] }, camera: [0, 3.4, 31], alvo: [0, 3.2, 15.5], ate: "@1:inicio-0.3" };

// relógio de papel (8 minutos): ponteiro grande no 8
const relogio = { peca: "grupo", pos: [0, 3.3, -0.6], filhos: [
  { forma: "circulo", r: 1.15, cor: "#fffdf6", pos: [0, 0, 0], sombra: false },
  { forma: "circulo", r: 1.15, cor: "#e2683c", pos: [0, 0, -0.03] },
  { forma: "circulo", r: 1.02, cor: "#fffdf6", pos: [0, 0, 0.01] },
  ...Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return { forma: "circulo", r: 0.06, cor: "#3a3e47", pos: [Math.sin(a) * 0.85, Math.cos(a) * 0.85, 0.03] }; }),
  { forma: "caixa", l: 0.09, a: 0.75, p: 0.04, cor: "#3a3e47", rot: [0, 0, (2 * Math.PI) / 3], pos: [-0.32, -0.185, 0.05] }, // ponteiro das horas no 8
  { forma: "caixa", l: 0.12, a: 0.5, p: 0.04, cor: "#e2683c", pos: [0, 0.25, 0.06] },
  { forma: "circulo", r: 0.1, cor: "#3a3e47", pos: [0, 0, 0.07] },
] };
// a luz chegando: três faixas amarelas andando da esquerda até a praça
const faixaLuz = (y, atraso) => ({ peca: "grupo", pos: [-7, y, 0.4], em: `@4:inicio+${atraso}`, filhos: [
  { forma: "oval", rx: 1.1, ry: 0.16, cor: "#fff1a8", pos: [0, 0, 0] }, { forma: "oval", rx: 0.5, ry: 0.1, cor: "#ffffff", pos: [0.4, 0, 0.02] },
], move: [{ em: `@4:inicio+${atraso}`, dur: 2.2, pos: [3.5, y, 0.4] }] });
// lua de papel: disco claro com crateras; vira do avesso (cinza) quando a voz diz "junto"
const lua = { peca: "grupo", pos: [0, 4.0, -0.5], some: "@6:junto", filhos: [
  { forma: "circulo", r: 1.5, cor: "#fff6d8", pos: [0, 0, 0] },
  { forma: "circulo", r: 0.32, cor: "#efe2b8", pos: [-0.5, 0.4, 0.02] }, { forma: "circulo", r: 0.22, cor: "#efe2b8", pos: [0.55, -0.2, 0.02] }, { forma: "circulo", r: 0.16, cor: "#efe2b8", pos: [0.05, -0.75, 0.02] },
] };
// vaso de flor: caule, folhas e pétalas que viram cinza ("fecham") em sequência
const flor = (x, cor, sem, k) => ({ peca: "grupo", pos: [x, 0, 1.2], filhos: [
  { forma: "caixa", l: 0.9, a: 0.8, p: 0.9, cor: "#c8693a", pos: [0, 0.4, 0], sombra: { rx: 0.6, rz: 0.25, pos: [0, -0.38, 0.1] } },
  { forma: "caixa", l: 0.1, a: 1.7, p: 0.1, cor: "#3f9a4f", pos: [0, 1.6, 0] },
  { forma: "oval", rx: 0.35, ry: 0.14, cor: "#4cae5c", rot: [0, 0, 0.5], pos: [0.3, 1.4, 0.02] },
  { peca: "grupo", pos: [0, 2.6, 0.05], some: `@7:abrir+${(k * 0.15).toFixed(2)}`, filhos: [
    ...Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return { forma: "circulo", r: 0.32, cor, pos: [Math.cos(a) * 0.38, Math.sin(a) * 0.38, 0] }; }),
    { forma: "circulo", r: 0.26, cor: "#ffd23f", pos: [0, 0, 0.03] },
  ] },
] });
// interruptor e lâmpada apagada
const luzApagada = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@9:inicio-0.35", sai: "@10:inicio", filhos: [
  { forma: "caixa", l: 0.1, a: 3.4, p: 0.1, cor: "#59616f", pos: [-1.6, 1.7, 0] },
  { forma: "caixa", l: 1.6, a: 0.1, p: 0.1, cor: "#59616f", pos: [-0.85, 3.4, 0] },
  { forma: "oval", rx: 0.42, ry: 0.55, cor: "#d9d6cc", pos: [-0.1, 2.8, 0.05] },
  { forma: "caixa", l: 0.36, a: 0.3, p: 0.3, cor: "#8d99ae", pos: [-0.1, 3.3, 0.05] },
  { forma: "caixa", l: 0.8, a: 1.1, p: 0.12, cor: "#fffdf6", pos: [1.3, 2.4, 0.2], sombra: false },
  { forma: "caixa", l: 0.22, a: 0.4, p: 0.12, cor: "#c9c4b8", pos: [1.3, 2.5, 0.3] },
  pessoa(2.2, -0.6, ROUPAS[1], 91, { em: "@9:energia", pose: "shrug" }, { poses: [{ pose: "mostra" }, { em: "@9:energia", pose: "shrug" }] }),
] };
// fogueira (o fogo continua existindo): toras e chamas em camadas
const fogueira = [
  { forma: "caixa", l: 1.6, a: 0.22, p: 0.22, cor: "#7a5230", rot: [0, 0.5, 0], pos: [0, 0.15, 0] }, { forma: "caixa", l: 1.6, a: 0.22, p: 0.22, cor: "#6a4528", rot: [0, -0.5, 0], pos: [0, 0.2, 0] },
  { forma: "poligono", pontos: [[-0.6, 0], [0.6, 0], [0.15, 1.6], [0, 0.9], [-0.2, 1.4]], cor: "#ff7a1a", pos: [0, 0.3, 0.1] },
  { forma: "poligono", pontos: [[-0.35, 0], [0.35, 0], [0.05, 1.1]], cor: "#ffd23f", pos: [0, 0.3, 0.15] },
];
// estrelas no céu da noite sem fim (as estrelas são outros sóis: continuam lá)
const estrelas = { peca: "grupo", pos: [0, 0, -8], em: "@11:inicio-0.35", sai: "@12:inicio", filhos: Array.from({ length: 34 }, (_, i) => {
  const x = ((i * 37) % 64) - 32, y = 20 + ((i * 53) % 24), r = 0.25 + ((i * 7) % 4) * 0.12;
  return { forma: "poligono", pontos: [[0, r * 2.2], [r * 0.5, r * 0.5], [r * 2.2, 0], [r * 0.5, -r * 0.5], [0, -r * 2.2], [-r * 0.5, -r * 0.5], [-r * 2.2, 0], [-r * 0.5, r * 0.5]], cor: "#fff6c8", pos: [x, y, 0], sombra: false };
}) };

const BASE = [0, 0.2, 17.5];
const pecas = [
  // 3: por oito minutos ninguém percebe (praia na praça, todo mundo tomando sol, relógio no 8)
  { peca: "grupo", pos: BASE, em: "@3:inicio-0.35", sai: "@4:inicio", filhos: [
    relogio,
    pessoa(-2.4, 2.4, ROUPAS[0], 31, { em: "@3:percebe", pose: "feliz" }),
    pessoa(0, 2.0, ROUPAS[1], 32, { em: "@3:minutos", pose: "feliz" }),
    pessoa(2.4, 2.4, ROUPAS[2], 33, { em: "@3:percebe", pose: "feliz" }),
  ] },
  // 4: a luz ainda está chegando (faixas de luz andando até a praça)
  { peca: "grupo", pos: BASE, em: "@4:inicio-0.35", sai: "@5:inicio", filhos: [
    faixaLuz(3.6, 0.0), faixaLuz(2.6, 0.35), faixaLuz(4.6, 0.7),
    pessoa(2.4, 2.2, ROUPAS[4], 41, { em: "@4:chegar", pose: "mostra" }),
  ] },
  // 5: o céu apaga (todo mundo olha para cima, assustado)
  { peca: "grupo", pos: BASE, em: "@5:inicio-0.35", sai: "@6:inicio", filhos: [
    pessoa(-2.2, 2.6, ROUPAS[0], 51, { em: "@5:apaga", pose: "susto" }),
    pessoa(0, 2.2, ROUPAS[3], 52, { em: "@5:céu", pose: "mostra" }),
    pessoa(2.2, 2.6, ROUPAS[2], 53, { em: "@5:apaga", pose: "susto" }),
  ] },
  // 6: a lua apaga junto
  { peca: "grupo", pos: BASE, em: "@6:inicio-0.35", sai: "@7:inicio", filhos: [
    lua,
    pessoa(-2.3, 2.4, ROUPAS[5], 61, { em: "@6:junto", pose: "susto" }),
    pessoa(2.3, 2.4, ROUPAS[4], 62, { em: "@6:junto", pose: "shrug" }),
  ] },
  // 7: as flores param de abrir (três vasos; as pétalas viram cinza uma depois da outra)
  { peca: "grupo", pos: BASE, em: "@7:inicio-0.35", sai: "@8:inicio", filhos: [
    flor(-2.2, "#f28aa5", 71, 0), flor(0, "#ff9f1c", 72, 1), flor(2.2, "#b794e6", 73, 2),
  ] },
  // 9: nem dá para acender a luz
  luzApagada,
  // 10: pelo menos ninguém sente frio (roda de bermuda em volta da fogueira)
  { peca: "grupo", pos: BASE, em: "@10:inicio-0.35", sai: "@11:inicio", filhos: [
    { peca: "grupo", pos: [0, 0, 1.4], filhos: fogueira },
    pessoa(-2.4, 1.6, ROUPAS[3], 101, { em: "@10:frio", pose: "feliz" }),
    pessoa(2.4, 1.6, ROUPAS[1], 102, { em: "@10:frio", pose: "feliz" }),
  ] },
  // 11: a noite que não acaba
  estrelas,
  // 12: ninguém reclama, todo mundo sorrindo na praça escura
  { peca: "grupo", pos: BASE, em: "@12:inicio-0.35", sai: "@13:inicio-0.25", modo: "cresce", filhos: [
    pessoa(-3.2, 0, ROUPAS[0], 12, { em: "@12:reclama", pose: "feliz" }), pessoa(-1.1, 0, ROUPAS[2], 13, { em: "@12:reclama", pose: "feliz" }),
    pessoa(1.1, 0, ROUPAS[3], 14, { em: "@12:reclama", pose: "feliz" }), pessoa(3.2, 0, ROUPAS[1], 15, { em: "@12:reclama", pose: "feliz" }),
  ] },
];

const PRACA = { pos: [0, 3.9, 33.5], alvo: [0, 2.9, 18.6], fov: 40, deriva: [0, 0, -0.5], foco: 0.5 };
const cena = {
  cor: SOL,
  titulo: "o sol",
  onda: 0.7,
  motor: "livro",
  luzMotor: true,
  visual: "livro",
  semAzul: -10,
  semSol: "@onda",
  semCarros: true,
  semPlacas: true,
  somemPredios: -10,
  lufs: -14,
  noite: [{ em: "@5:apaga-0.2", ate: 999, forca: 0.85 }],
  sumiram: ["Dia 11: os espelhos", "Dia 12: a cor azul"],
  trilha: { nome: "noturna", constroi: ["@3:voz", "@5:voz", "@7:voz", "@9:voz", "@11:voz"], climax: "@12:inicio" },
  impactos: [{ em: "@onda", silencio: 0.5, volta: 0.4 }, { em: "@5:apaga", silencio: 0.5, volta: 0.5 }],
  credito: { rotulo: "O MAIS CURTIDO", conta: "@yhago._cassiano", texto: "O sol", curtidas: 14 },
  divulgacao: { em: "@8:voz-0.05", ate: "@8:fim-0.05", titulo: "SEM CÂMERA", sub: "COMENTE GUIA", chamada: "LINK NA BIO" },
  exemplos: ["as nuvens", "o mosquito", "o chocolate"],
  heroi,
  cameras: [
    { em: "@1:inicio-0.3", lugar: "cidade", perto: true },
    { em: "@2:inicio-0.3", lugar: "praca" },
    { em: "@3:inicio-0.3", pos: [0, 3.6, 33.5], alvo: [0, 3.0, 18.4], fov: 41, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@4:inicio-0.3", pos: [0.4, 3.8, 33], alvo: [0.2, 3.2, 18], fov: 42, deriva: [-0.2, 0, -0.5], foco: 0.5 },
    { em: "@5:inicio-0.3", pos: [0, 3.0, 34], alvo: [0, 5.2, 18], fov: 44, deriva: [0, 0.1, -0.4], foco: 0.3 },
    { em: "@6:inicio-0.3", pos: [0, 3.6, 32.5], alvo: [0, 3.2, 18], fov: 42, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@7:inicio-0.3", pos: [0, 3.0, 30.5], alvo: [0, 1.9, 18.6], fov: 40, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@8:inicio-0.3", lugar: "cidade", perto: true },
    { em: "@9:inicio-0.3", pos: [0.3, 3.3, 33], alvo: [0.3, 2.6, 17.5], fov: 40, deriva: [0, 0, -0.4], foco: 0.5 },
    { em: "@10:inicio-0.3", pos: [0, 3.0, 34], alvo: [0, 1.6, 18.6], fov: 40, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@11:inicio-0.3", lugar: "cidade" },
    { em: "@12:inicio-0.35", lugar: "praca" },
    { em: "@14:inicio-0.35", lugar: "cidade" },
  ],
  pecas,
  selos: [
    { txt: "8 MINUTOS", em: "@3:minutos-0.1", ate: "@4:inicio", cor: "#3a2a1a", fundo: "#ffd23f", r: -2 },
    { txt: "A LUZ AINDA ESTÁ VINDO", em: "@4:luz-0.1", ate: "@5:inicio", tam: 84, cor: "#3a2a1a", fundo: "#fff1a8", r: 2 },
    { txt: "APAGOU", em: "@5:apaga-0.05", ate: "@6:inicio", cor: "#ffffff", fundo: "#3a3e47", borda: "#fffdf6", r: -2 },
    { txt: "LUA APAGADA", em: "@6:junto-0.1", ate: "@7:inicio", cor: "#3a2a1a", fundo: "#fff6d8", r: 2 },
    { txt: "FLORES FECHADAS", em: "@7:flores-0.1", ate: "@8:inicio", cor: "#3a2a1a", fundo: "#ffd1e0", r: -2 },
    { txt: "SEM ENERGIA DESDE O DIA 4", em: "@9:energia-0.1", ate: "@10:inicio", tam: 80, cor: "#3a2a1a", fundo: "#ffe9b3", r: 2 },
    { txt: "SEM FRIO DESDE O DIA 2", em: "@10:frio-0.1", ate: "@11:inicio", tam: 84, cor: "#3a2a1a", fundo: "#ffd8a8", r: -2 },
    { txt: "NOITE SEM FIM", em: "@11:noite-0.1", ate: "@12:inicio", cor: "#ffffff", fundo: "#3a3e47", borda: "#fffdf6", r: 2 },
  ],
  etiquetas: [
    { txt: "NINGUÉM RECLAMA", pos: [0, 4.9, 18], em: "@reclama", ate: "@13:inicio-0.3" },
    { txt: "SEU NILO", pos: [-0.9, 4.25, 18.5], em: "@nilo+0.7", ate: "@13:anotou-0.2", cor: "ouro" },
  ],
  sons: [
    { em: "@2:inicio", tipo: "carimbo", volume: 0.9 },
    { em: "@3:minutos", tipo: "clique", volume: 0.8 },
    { em: "@4:luz", tipo: "whoosh", volume: 0.6 },
    { em: "@5:apaga", tipo: "impacto", volume: 0.9 },
    { em: "@6:junto", tipo: "virada", volume: 0.8 },
    { em: "@7:abrir", tipo: "virada", volume: 0.7 },
    { em: "@9:luz", tipo: "clique", volume: 0.9 },
    { em: "@10:frio", tipo: "pop", volume: 0.8 },
    { em: "@11:noite", tipo: "subida", volume: 0.6 },
  ],
  transicoes: [],
  tremores: ["@5:apaga"],
};

const ep = { id: "hoje-sumiu-dia13", dia: 13, coisa: "o sol", velocidade: 1, falas: FALAS.map((fala, i) => ({ fala, legenda: LEG[i], ...(i === 13 ? { segura: 1.4 } : {}) })), cortes, cena };
writeFileSync(RAIZ + "episodios/dia13.json", JSON.stringify(ep, null, 1));
console.log("ok: episodios/dia13.json e public/hoje-sumiu-dia13.mp3, voz unida", Math.round(ini * 100) / 100, "s");
