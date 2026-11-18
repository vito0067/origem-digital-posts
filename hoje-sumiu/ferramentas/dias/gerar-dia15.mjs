// Gera hoje-sumiu/episodios/dia15.json e a voz unida (public/hoje-sumiu-dia15.mp3): os tênis. ÚLTIMO EPISÓDIO DA FASE.
// Motor "livro". Fecha a fase: o narrador diz que já sumiu quase tudo e o Seu Nilo pega a borracha (corte seco para o cartão final).
// NÃO revela a próxima fase. A pergunta final é um gancho de suspense ("o que você acha que acontece?"), não "o que some amanhã".
// Mundo: sem azul, sem sol, sem nuvens, sem placas, sem energia (semáforo e postes apagados) e, hoje, sem tênis (todo mundo descalço).
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const RAIZ = "C:/Users/User/Documents/Origem Digital/4-midia/posts-automaticos/hoje-sumiu/";
const BIN = "C:/Users/User/Documents/hoje-sumiu/node_modules/@remotion/compositor-win32-x64-msvc/";
const FF = BIN + "ffmpeg.exe", FP = BIN + "ffprobe.exe";
const VOZ = process.env.VOZ ?? "C:/Users/User/AppData/Local/Temp/claude/bc88afa6adac9a0f/bf3c00df-bf9e-4837-b039-126c1536f033/scratchpad/voz15/";
const GAP = 0.6;

// clipes 08 (guia) e 13 (Seu Nilo) são os mesmos do Dia 14 (mesmo texto, mesma voz Mark)
const FALAS = [
  "Todo mundo vai ficar descalço.",
  "Hoje sumiram os tênis. Do mundo inteiro. Para sempre.",
  "O comentário mais curtido foi tênis.",
  "Primeira noite: ninguém sabe onde pisar.",
  "Em uma semana, a corrida de domingo vira caminhada.",
  "O colecionador fica só com as caixas.",
  "Em duas semanas, toda pedrinha vira um perigo.",
  "Em um mês, o pé cria uma casca grossa.",
  "Feito sem câmera. Comente GUIA.",
  "Em três meses, ninguém mais lembra a palavra cadarço.",
  "A loja de esportes só vende bola.",
  "No fim, todo mundo tem os pés no chão. De verdade.",
  "Mas ninguém reclama. Para todo mundo, tênis nunca existiu.",
  "Só o Seu Nilo lembra. Ele anotou.",
  "Mas o caderno já está cheio. Quase não sobra o que sumir.",
  "Amanhã começa uma coisa nova. Comente: o que você acha que acontece?",
];
const LEG = [
  "Todo mundo vai ficar *descalço.*",
  "Hoje sumiram os *tênis.* Do mundo inteiro. Para *sempre.*",
  "O comentário mais *curtido* foi *tênis.*",
  "Primeira noite: ninguém sabe onde *pisar.*",
  "Em uma semana, a *corrida* de domingo vira *caminhada.*",
  "O *colecionador* fica só com as *caixas.*",
  "Em duas semanas, toda *pedrinha* vira um *perigo.*",
  "Em um mês, o *pé* cria uma *casca* grossa.",
  "*Feito* sem *câmera.* Comente *GUIA.*",
  "Em três meses, ninguém mais lembra a palavra *cadarço.*",
  "A *loja* de esportes só vende *bola.*",
  "No fim, todo mundo tem os *pés* no *chão.* De *verdade.*",
  "Mas ninguém reclama. Para todo mundo, tênis *nunca existiu.*",
  "Só o *Seu Nilo* lembra. Ele *anotou.*",
  "Mas o *caderno* já está *cheio.* Quase não sobra o que *sumir.*",
  "*Amanhã* começa uma coisa *nova.* Comente: o que você acha que *acontece?*",
];
if (LEG.length !== FALAS.length) throw new Error("legendas e falas não batem");
LEG.forEach((l, i) => { const a = l.split(/\s+/).length, b = FALAS[i].split(/\s+/).length; if (a !== b) throw new Error(`fala ${i}: legenda ${a} palavras, fala ${b}`); });

// 1. voz unida com pausas de 0,6 s; os cortes vêm da duração de cada clipe
const clipes = FALAS.map((_, i) => VOZ + String(i).padStart(2, "0") + ".mp3");
const DUR = clipes.map((f) => Number(execFileSync(FP, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim()));
const sil = VOZ + "sil.wav";
execFileSync(FF, ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", String(GAP), sil]);
const args = ["-y", "-loglevel", "error"], ordem = [];
clipes.forEach((f, i) => { ordem.push(f); if (i < clipes.length - 1) ordem.push(sil); });
ordem.forEach((f) => args.push("-i", f));
const filtro = ordem.map((_, i) => `[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo[a${i}]`).join(";") + ";" + ordem.map((_, i) => `[a${i}]`).join("") + `concat=n=${ordem.length}:v=0:a=1[out]`;
args.push("-filter_complex", filtro, "-map", "[out]", "-c:a", "libmp3lame", "-q:a", "2", RAIZ + "public/hoje-sumiu-dia15.mp3");
execFileSync(FF, args);
let ini = 0;
const cortes = DUR.map((d) => { const c = [Math.round(ini * 100) / 100, Math.round((ini + d + 0.05) * 100) / 100]; ini += d + GAP; return c; });

// ---------- cena ----------
const pessoa = (x, z, roupa, sem, pose, extra = {}) => ({ peca: "pessoa", pos: [x, 0, z], escala: 1.6, roupa, semente: sem, poses: [{ pose: "normal" }, { em: pose.em, pose: pose.pose }], balanca: { em: pose.em, amp: pose.amp ?? 0.04 }, ...extra });
const ROUPAS = ["#ffb703", "#f28aa5", "#45c46b", "#ff9f1c", "#ffd23f", "#b794e6"];
const PELE = "#f2c9a0";

// tênis de papel (nada de azul nem vermelho: já sumiram): sola branca, cabedal colorido, biqueira branca, cadarço e listra
const tenis = (cor, pos, extra = {}) => ({ peca: "grupo", pos, ...extra, filhos: [
  { forma: "retangulo", l: 3.0, a: 0.4, cor: "#f5f5f0", canto: 0.18, pos: [0, 0, 0] },
  { forma: "poligono", pontos: [[-1.45, 0], [1.5, 0], [1.5, 0.45], [0.9, 0.75], [0.25, 0.95], [-0.1, 1.55], [-0.65, 1.55], [-0.9, 1.1], [-1.45, 1.0]], cor, pos: [0, 0.38, 0.02] },
  { forma: "oval", rx: 0.65, ry: 0.4, cor: "#ffffff", pos: [1.0, 0.62, 0.05], sombra: false },
  { forma: "poligono", pontos: [[-0.7, 0.3], [0.4, 0.62], [0.4, 0.78], [-0.7, 0.48]], cor: "#fffdf6", pos: [0, 0.4, 0.07] },
  ...[0, 1, 2].map((i) => ({ forma: "caixa", l: 0.5, a: 0.07, p: 0.05, cor: "#ffffff", rot: [0, 0, -0.5], pos: [0.0 + i * 0.25, 1.35 - i * 0.2, 0.08] })),
] });

// herói do 1º quadro: um par de tênis gigantes no alto (um virado para cada lado) sobre dois descalços; viram do avesso no segundo zero
const heroi = { peca: { peca: "grupo", pos: [0, 0.2, 15.5], em: -1, sai: "@1:fim-0.2", modo: "cresce", filhos: [
  tenis("#ff9f1c", [-0.95, 2.1, -0.5], { some: "@onda", sai: "@onda+1.1", rot: [0, 0, 0.1], escala: 0.6 }),
  tenis("#45c46b", [0.95, 2.1, -0.5], { some: "@onda", sai: "@onda+1.1", escala: [-0.6, 0.6, 0.6], rot: [0, 0, -0.1] }),
  pessoa(-2.4, 0.9, "#ffd23f", 21, { em: "@onda", pose: "susto" }, { poses: [{ pose: "feliz" }, { em: "@onda", pose: "susto" }], escala: 1.35 }),
  pessoa(2.4, 0.9, "#f28aa5", 22, { em: "@onda", pose: "susto" }, { poses: [{ pose: "feliz" }, { em: "@onda", pose: "susto" }], escala: 1.35 }),
] }, camera: [0, 3.4, 31], alvo: [0, 3.1, 15.5], ate: "@1:inicio-0.3" };

// 3: ninguém sabe onde pisar (descalços na ponta dos pés entre pedrinhas)
const pedra = (x, z, r = 0.3) => ({ forma: "oval", rx: r, ry: r * 0.55, cor: "#8d99ae", pos: [x, 0.08, z], sombra: false });
const p3 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@3:inicio-0.35", sai: "@4:inicio", filhos: [
  pedra(-3.4, 3.6), pedra(-1.2, 4.0, 0.36), pedra(0.9, 3.8), pedra(2.9, 4.1, 0.34), pedra(-2.2, 1.0, 0.28), pedra(1.8, 0.9, 0.3), pedra(3.6, 2.2, 0.26),
  pessoa(-2.3, 2.5, ROUPAS[0], 31, { em: "@3:pisar", pose: "susto", amp: 0.07 }), pessoa(0, 2.0, ROUPAS[1], 32, { em: "@3:pisar", pose: "susto", amp: 0.07 }), pessoa(2.3, 2.5, ROUPAS[2], 33, { em: "@3:onde", pose: "susto", amp: 0.07 }),
] };
// 4: a corrida de domingo vira caminhada (placa da corrida e três pessoas andando devagar)
const anda = (x0, x1, sem, roupa) => pessoa(x0, 2.3, roupa, sem, { em: "@4:caminhada", pose: "feliz" }, { poses: [{ pose: "feliz" }, { em: "@4:caminhada", pose: "azedo" }], move: [{ em: "@4:corrida", dur: 3.2, pos: [x1, 0, 2.3] }] });
const p4 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@4:inicio-0.35", sai: "@5:inicio", filhos: [
  { forma: "caixa", l: 0.14, a: 3.7, p: 0.14, cor: "#59616f", pos: [-2.6, 1.85, -0.9] }, { forma: "caixa", l: 0.14, a: 3.7, p: 0.14, cor: "#59616f", pos: [2.6, 1.85, -0.9] },
  { peca: "letreiro", texto: "CORRIDA DE RUA", l: 5.6, a: 1.2, fundo: "#fff6e0", cor: "#27324a", pos: [0, 3.9, -0.8] },
  anda(-3.6, 0.3, 41, ROUPAS[3]), anda(-2.4, 1.5, 42, ROUPAS[2]), anda(-1.2, 2.7, 43, ROUPAS[5]),
] };
// 5: o colecionador fica só com as caixas (pilhas de caixa de tênis, todas vazias)
const cx = (x, y, cor) => ({ peca: "grupo", pos: [x, y, 0.4], filhos: [
  { forma: "caixa", l: 1.5, a: 0.7, p: 0.9, cor, pos: [0, 0.35, 0], sombra: y === 0 ? { rx: 0.9, rz: 0.4, pos: [0, -0.33, 0.1] } : undefined }, { forma: "caixa", l: 1.58, a: 0.14, p: 0.96, cor: "#fffdf6", pos: [0, 0.77, 0] },
] });
const pilha = (x, cores) => ({ peca: "grupo", pos: [x, 0, 0], filhos: cores.map((c, i) => cx(0, i * 0.92, c)) });
const p5 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@5:inicio-0.35", sai: "@6:inicio", filhos: [
  pilha(0.9, ["#ffd23f", "#f28aa5", "#45c46b", "#ff9f1c"]), pilha(2.6, ["#45c46b", "#ffd23f", "#b794e6"]), pilha(-0.8, ["#f28aa5", "#ff9f1c"]),
  pessoa(-3.0, 1.6, ROUPAS[4], 51, { em: "@5:caixas", pose: "azedo" }, { oculos: true }),
] };
// 6: toda pedrinha vira um perigo (pedra grande, placa de cuidado e gente se afastando)
const p6 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@6:inicio-0.35", sai: "@7:inicio", filhos: [
  { forma: "oval", rx: 1.2, ry: 0.78, cor: "#8d99ae", pos: [0.3, 0.7, 1.4] }, { forma: "oval", rx: 0.8, ry: 0.5, cor: "#a3aebf", pos: [-0.6, 0.45, 1.9] },
  { forma: "caixa", l: 0.12, a: 2.6, p: 0.12, cor: "#59616f", pos: [1.9, 1.3, 0.8] },
  { peca: "letreiro", texto: "CUIDADO: PEDRA", l: 2.9, a: 1.0, fundo: "#ffd23f", cor: "#27324a", pos: [1.9, 2.9, 0.9] },
  pessoa(-2.6, 2.4, ROUPAS[0], 61, { em: "@6:perigo", pose: "susto", amp: 0.08 }), pessoa(3.3, 2.6, ROUPAS[1], 62, { em: "@6:perigo", pose: "susto", amp: 0.08 }),
] };
// 7: o pé cria casca (duas pernas grandes; a sola ganha uma camada marrom grossa)
const pe = (x, sem) => ({ peca: "grupo", pos: [x, 0, 1.0], filhos: [
  { forma: "caixa", l: 0.7, a: 2.6, p: 0.5, cor: PELE, pos: [0, 1.65, 0] },
  { forma: "oval", rx: 1.15, ry: 0.42, cor: PELE, pos: [0.3, 0.5, 0.1] },
  ...[0, 1, 2, 3, 4].map((i) => ({ forma: "circulo", r: 0.17 - i * 0.01, cor: "#ffe3c9", pos: [1.1 + i * 0.1, 0.38 + i * 0.07, 0.14] })),
  { peca: "grupo", pos: [0.3, 0.16, 0.1], em: "@7:casca", modo: "cresce", filhos: [{ forma: "oval", rx: 1.25, ry: 0.3, cor: "#5a3a22", pos: [0, 0, 0] }, { forma: "oval", rx: 1.0, ry: 0.18, cor: "#6b4423", pos: [0, 0.05, 0.04] }] },
] });
const p7 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@7:inicio-0.35", sai: "@8:inicio", filhos: [pe(-1.9, 71), pe(1.2, 72)] };
// 9: ninguém mais lembra a palavra cadarço (a placa vira de CADARÇO para ???)
const p9 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@9:inicio-0.35", sai: "@10:inicio", filhos: [
  { forma: "caixa", l: 0.14, a: 4.5, p: 0.14, cor: "#59616f", pos: [-1.9, 2.25, -0.5] }, { forma: "caixa", l: 0.14, a: 4.5, p: 0.14, cor: "#59616f", pos: [1.9, 2.25, -0.5] },
  { peca: "letreiro", texto: "CADARÇO", verso: "???", vira: "@9:lembra", l: 4.4, a: 1.4, fundo: "#fff6e0", cor: "#27324a", corVerso: "#5a6170", pos: [0, 4.9, -0.4] },
  pessoa(-2.3, 2.5, ROUPAS[5], 91, { em: "@9:lembra", pose: "shrug" }), pessoa(0, 2.0, ROUPAS[4], 92, { em: "@9:lembra", pose: "shrug" }), pessoa(2.3, 2.5, ROUPAS[3], 93, { em: "@9:lembra", pose: "shrug" }),
] };
// 10: a loja de esportes só vende bola (barraca de toldo com uma bola em cima do balcão)
const p10 = { peca: "grupo", pos: [0, 0.2, 17.0], em: "@10:inicio-0.35", sai: "@11:inicio", filhos: [
  { peca: "banca", cor: "#ffd23f", corBalcao: "#b98a57", escala: 0.8, pos: [0, 0, 0], filhos: [
    { peca: "letreiro", texto: "ESPORTES", l: 4.4, a: 0.95, fundo: "#fffdf6", cor: "#27324a", pos: [0, 0.68, 1.0] },
    { forma: "circulo", r: 0.55, cor: "#ff9f1c", pos: [0, 2.0, 0.3] }, { forma: "caixa", l: 1.1, a: 0.06, p: 0.1, cor: "#59462f", pos: [0, 2.0, 0.33] }, { forma: "caixa", l: 0.06, a: 1.1, p: 0.1, cor: "#59462f", pos: [0, 2.0, 0.33] },
    pessoa(2.1, -0.4, ROUPAS[2], 101, { em: "@10:bola", pose: "feliz" }, { escala: 1.4 }),
  ] },
  pessoa(-3.4, 3.2, ROUPAS[1], 102, { em: "@10:bola", pose: "azedo" }), pessoa(3.8, 3.4, ROUPAS[0], 103, { em: "@10:bola", pose: "azedo" }),
] };
// 11: no fim, todo mundo tem os pés no chão (a multidão descalça, de frente)
const p11 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@11:inicio-0.35", sai: "@12:inicio", filhos: [
  ...[-4, -2, 0, 2, 4].map((x, i) => pessoa(x, 2.4 - (i % 2) * 0.5, ROUPAS[i % 6], 110 + i, { em: "@11:chão", pose: "feliz" }, { escala: 1.5 })),
] };
// 12: ninguém reclama
const p12 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@12:inicio-0.35", sai: "@13:inicio-0.25", modo: "cresce", filhos: [
  pessoa(-3.2, 0, ROUPAS[0], 12, { em: "@12:reclama", pose: "feliz" }), pessoa(-1.1, 0, ROUPAS[2], 13, { em: "@12:reclama", pose: "feliz" }),
  pessoa(1.1, 0, ROUPAS[3], 14, { em: "@12:reclama", pose: "feliz" }), pessoa(3.2, 0, ROUPAS[1], 15, { em: "@12:reclama", pose: "feliz" }),
] };
// estrelas no céu escuro, do começo ao fim
const estrelas = { peca: "grupo", pos: [0, 0, -8], em: -1, filhos: Array.from({ length: 34 }, (_, i) => {
  const x = ((i * 37) % 64) - 32, y = 20 + ((i * 53) % 24), r = 0.25 + ((i * 7) % 4) * 0.12;
  return { forma: "poligono", pontos: [[0, r * 2.2], [r * 0.5, r * 0.5], [r * 2.2, 0], [r * 0.5, -r * 0.5], [0, -r * 2.2], [-r * 0.5, -r * 0.5], [-r * 2.2, 0], [-r * 0.5, r * 0.5]], cor: "#fff6c8", pos: [x, y, 0], sombra: false };
}) };

const cena = {
  cor: "#6f7f8e",
  titulo: "os tênis",
  onda: 0.9,
  motor: "livro",
  luzMotor: true,
  visual: "livro",
  semAzul: -10,
  semSol: -10,
  semNuvens: -10,
  semCarros: true,
  semPlacas: true,
  semEnergia: true,
  descalco: true,
  somemPredios: -10,
  lufs: -14,
  noite: [{ em: -1, ate: 999, forca: 0.75 }],
  sumiram: ["Dia 1: a cor vermelha", "Dia 2: o frio", "Dia 3: o boleto", "Dia 4: a energia", "Dia 5: as placas", "Dia 6: o Wi-Fi", "Dia 7: os veículos", "Dia 8: o sono", "Dia 9: os apartamentos", "Dia 10: o chuveiro", "Dia 11: os espelhos", "Dia 12: a cor azul", "Dia 13: o sol", "Dia 14: as nuvens"],
  cadernoFica: true,
  cadernoLinhas: 5,
  semVooChamado: true,
  semInterrogacao: true,
  borracha: { em: "@14:sobra-0.2", ate: "@14:fim" },
  fimTitulo: ["O QUE ACONTECE", "AMANHÃ?"],
  trilha: { nome: "noturna", constroi: ["@3:voz", "@5:voz", "@7:voz", "@9:voz", "@11:voz"], climax: "@12:inicio" },
  impactos: [{ em: "@onda", silencio: 0.5, volta: 0.4 }, { em: "@11:verdade", silencio: 0.5, volta: 0.5 }],
  credito: { rotulo: "O MAIS CURTIDO", conta: "UMA PESSOA NO YOUTUBE", texto: "Tênis", curtidas: 11 },
  divulgacao: { em: "@8:voz-0.05", ate: "@8:fim-0.05", titulo: "SEM CÂMERA", sub: "COMENTE GUIA", chamada: "LINK NA BIO" },
  exemplos: ["uma surpresa", "o fim do mundo", "o Seu Nilo some"],
  heroi,
  cameras: [
    { em: "@1:inicio-0.3", lugar: "cidade", perto: true },
    { em: "@2:inicio-0.3", lugar: "praca" },
    { em: "@3:inicio-0.3", pos: [0, 3.6, 33.5], alvo: [0, 3.0, 18.4], fov: 41, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@4:inicio-0.3", pos: [0, 3.9, 36], alvo: [0, 2.8, 18.5], fov: 42, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@5:inicio-0.3", pos: [0.2, 4.8, 35], alvo: [0.3, 1.3, 18.6], fov: 42, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@6:inicio-0.3", pos: [0, 4.8, 35], alvo: [0, 1.4, 18.6], fov: 42, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@7:inicio-0.3", pos: [0, 3.0, 33.5], alvo: [0, 1.7, 19], fov: 42, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@8:inicio-0.3", lugar: "cidade", perto: true },
    { em: "@9:inicio-0.3", pos: [0, 3.8, 35], alvo: [0, 3.3, 18.4], fov: 42, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@10:inicio-0.3", pos: [0, 4.0, 35.5], alvo: [0, 2.4, 18.4], fov: 42, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@11:inicio-0.3", pos: [0, 3.0, 36], alvo: [0, 1.6, 19.7], fov: 42, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@12:inicio-0.35", lugar: "praca" },
  ],
  pecas: [estrelas, p3, p4, p5, p6, p7, p9, p10, p11, p12],
  selos: [
    { txt: "SEM TÊNIS", em: "@0:descalço-0.1", ate: "@1:mundo-0.1", cor: "#3a2a1a", fundo: "#e8e8e8", r: -2 },
    { txt: "DO MUNDO INTEIRO", em: "@1:mundo-0.05", ate: "@1:para-0.1", cor: "#3a2a1a", fundo: "#ffe9b3", r: 2 },
    { txt: "PARA SEMPRE", em: "@1:sempre-0.1", ate: "@2:inicio-0.1", cor: "#ffffff", fundo: "#3a3e47", borda: "#fffdf6", r: -2 },
    { txt: "ONDE PISAR?", em: "@3:pisar-0.1", ate: "@4:inicio", cor: "#3a2a1a", fundo: "#ffd23f", r: 2 },
    { txt: "CORRIDA VIROU CAMINHADA", em: "@4:caminhada-0.2", ate: "@5:inicio", tam: 74, cor: "#3a2a1a", fundo: "#d6f5e0", r: -2 },
    { txt: "SÓ AS CAIXAS", em: "@5:caixas-0.1", ate: "@6:inicio", cor: "#3a2a1a", fundo: "#ffd1e0", r: 2 },
    { txt: "PEDRINHA PERIGOSA", em: "@6:perigo-0.1", ate: "@7:inicio", tam: 84, cor: "#3a2a1a", fundo: "#ffe9b3", r: -2 },
    { txt: "PÉ DE CASCA", em: "@7:casca-0.1", ate: "@8:inicio", cor: "#3a2a1a", fundo: "#ffd8a8", r: 2 },
    { txt: "ADEUS, CADARÇO", em: "@9:lembra-0.1", ate: "@10:inicio", cor: "#3a2a1a", fundo: "#fff6d8", r: -2 },
    { txt: "SÓ BOLA", em: "@10:bola-0.1", ate: "@11:inicio", cor: "#3a2a1a", fundo: "#d6f5e0", r: 2 },
    { txt: "PÉS NO CHÃO", em: "@11:chão-0.1", ate: "@12:inicio", cor: "#ffffff", fundo: "#3a3e47", borda: "#fffdf6", r: -2 },
  ],
  etiquetas: [
    { txt: "NINGUÉM RECLAMA", pos: [0, 4.9, 18], em: "@reclama", ate: "@13:inicio-0.3" },
    { txt: "SEU NILO", pos: [-0.9, 4.25, 18.5], em: "@nilo+0.7", ate: "@13:anotou-0.2", cor: "ouro" },
  ],
  sons: [
    { em: "@2:inicio", tipo: "carimbo", volume: 0.9 },
    { em: "@3:pisar", tipo: "pop", volume: 0.7 },
    { em: "@4:caminhada", tipo: "virada", volume: 0.8 },
    { em: "@5:caixas", tipo: "pop", volume: 0.8 },
    { em: "@6:perigo", tipo: "impacto", volume: 0.6 },
    { em: "@7:casca", tipo: "nhac", volume: 0.7 },
    { em: "@9:lembra", tipo: "virada", volume: 0.8 },
    { em: "@10:bola", tipo: "pop", volume: 0.8 },
    { em: "@11:verdade", tipo: "glitch", volume: 0.9 },
    { em: "@14:sobra", tipo: "lapis", volume: 0.8 },
  ],
  transicoes: [],
  tremores: ["@11:verdade"],
};

const ep = { id: "hoje-sumiu-dia15", dia: 15, coisa: "os tênis", velocidade: 1, falas: FALAS.map((fala, i) => ({ fala, legenda: LEG[i], ...(i === 13 ? { segura: 1.4 } : {}) })), cortes, cena };
writeFileSync(RAIZ + "episodios/dia15.json", JSON.stringify(ep, null, 1));
console.log("ok: episodios/dia15.json e public/hoje-sumiu-dia15.mp3, voz unida", Math.round(ini * 100) / 100, "s");
