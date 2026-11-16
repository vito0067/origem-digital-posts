// Gera hoje-sumiu/episodios/dia14.json e a voz unida (public/hoje-sumiu-dia14.mp3): as nuvens.
// Motor "livro". Teste do dia (uma mudança por episódio, números do YouTube de 12/11/2026): a PRIMEIRA FALA é a
// consequência ("Sem nuvens, nunca mais cai uma gota de chuva"), não o anúncio; o anúncio vem na fala 1.
// Continua valendo o teste do Dia 13: as nuvens já viram do avesso no segundo zero (`cena.onda`) e o título está no quadro 0.
// O mundo já está sem azul, sem sol e sem placas: o céu é NOITE desde o 1º quadro.
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const RAIZ = "C:/Users/User/Documents/Origem Digital/4-midia/posts-automaticos/hoje-sumiu/";
const BIN = "C:/Users/User/Documents/hoje-sumiu/node_modules/@remotion/compositor-win32-x64-msvc/";
const FF = BIN + "ffmpeg.exe", FP = BIN + "ffprobe.exe";
const VOZ = process.env.VOZ ?? "C:/Users/User/AppData/Local/Temp/claude/bc88afa6adac9a0f/bf3c00df-bf9e-4837-b039-126c1536f033/scratchpad/voz14/";
const GAP = 0.6;

// clipes 08 (guia), 13, 14 e 15 são os mesmos do Dia 13 (mesmo texto, mesma voz Mark)
const FALAS = [
  "Sem nuvens, nunca mais cai uma gota de chuva.",
  "Hoje sumiram as nuvens. Do mundo inteiro. Para sempre.",
  "O comentário mais curtido foi as nuvens.",
  "Ninguém repara. Já era tudo escuro.",
  "Em uma semana, o homem do tempo fica sem assunto.",
  "Os guarda-chuvas viram bengalas.",
  "Em duas semanas, os rios começam a secar.",
  "Em um mês, o chão racha como biscoito.",
  "Feito sem câmera. Comente GUIA.",
  "Em três meses, ninguém mais vê coelho no céu.",
  "O cheiro de terra molhada some junto.",
  "No fim, ninguém mais diz que está com a cabeça nas nuvens.",
  "Mas ninguém reclama. Para todo mundo, as nuvens nunca existiram.",
  "Só o Seu Nilo lembra. Ele anotou.",
  "Amanhã, outra coisa vai sumir.",
  "Quem escolhe é você. Comente o que some amanhã. O mais curtido decide.",
];
const LEG = [
  "Sem *nuvens,* nunca mais cai uma gota de *chuva.*",
  "Hoje sumiram as *nuvens.* Do mundo inteiro. Para *sempre.*",
  "O comentário mais *curtido* foi as *nuvens.*",
  "Ninguém *repara.* Já era tudo *escuro.*",
  "Em uma semana, o *homem* do tempo fica sem *assunto.*",
  "Os *guarda-chuvas* viram *bengalas.*",
  "Em duas semanas, os *rios* começam a *secar.*",
  "Em um mês, o *chão* racha como *biscoito.*",
  "*Feito* sem *câmera.* Comente *GUIA.*",
  "Em três meses, ninguém mais vê *coelho* no *céu.*",
  "O *cheiro* de terra molhada some *junto.*",
  "No fim, ninguém mais diz que está com a *cabeça* nas *nuvens.*",
  "Mas ninguém reclama. Para todo mundo, as nuvens *nunca existiram.*",
  "Só o *Seu Nilo* lembra. Ele *anotou.*",
  "Amanhã, outra coisa vai *sumir.*",
  "Quem escolhe é *você.* Comente o que some amanhã. O mais *curtido* decide.",
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
args.push("-filter_complex", filtro, "-map", "[out]", "-c:a", "libmp3lame", "-q:a", "2", RAIZ + "public/hoje-sumiu-dia14.mp3");
execFileSync(FF, args);
let ini = 0;
const cortes = DUR.map((d) => { const c = [Math.round(ini * 100) / 100, Math.round((ini + d + 0.05) * 100) / 100]; ini += d + GAP; return c; });

// ---------- cena ----------
// sem azul, sem sol, sem placas: o céu é noite desde o 1º quadro; as nuvens são a única coisa branca que sobrou
const pessoa = (x, z, roupa, sem, pose, extra = {}) => ({ peca: "pessoa", pos: [x, 0, z], escala: 1.6, roupa, semente: sem, poses: [{ pose: "normal" }, { em: pose.em, pose: pose.pose }], balanca: { em: pose.em, amp: pose.amp ?? 0.04 }, ...extra });
const ROUPAS = ["#ffb703", "#f28aa5", "#45c46b", "#ff9f1c", "#ffd23f", "#b794e6"];
const CIN = "#b9c7d1"; // gota de chuva (cinza: o azul sumiu)

// nuvem de papel: 3 bolas brancas e uma barriga cinza-claro
const nuvem = (r, pos, extra = {}) => ({ peca: "grupo", pos, ...extra, filhos: [
  { forma: "oval", rx: r * 1.5, ry: r * 0.5, cor: "#dfe6ec", pos: [0, -r * 0.42, -0.02] },
  { forma: "oval", rx: r * 1.15, ry: r * 0.8, cor: "#ffffff", pos: [0, 0, 0], sombra: false },
  { forma: "oval", rx: r * 0.85, ry: r * 0.72, cor: "#ffffff", pos: [-r * 1.05, -r * 0.18, 0.02], sombra: false },
  { forma: "oval", rx: r * 0.95, ry: r * 0.76, cor: "#ffffff", pos: [r * 1.1, -r * 0.12, 0.02], sombra: false },
  { forma: "oval", rx: r * 0.7, ry: r * 0.55, cor: "#f4f7f9", pos: [r * 0.1, r * 0.55, 0.03], sombra: false },
] });

// guarda-chuva aberto (herói) e fechado (bengala)
const aberto = (cor) => [
  { forma: "poligono", pontos: [[-1.05, 0], [-0.8, 0.5], [-0.32, 0.8], [0, 0.86], [0.32, 0.8], [0.8, 0.5], [1.05, 0]], cor, pos: [0.25, 3.3, 0.2] },
  { forma: "caixa", l: 0.07, a: 1.6, p: 0.07, cor: "#59616f", pos: [0.25, 2.55, 0.18] },
];
const bengala = (x) => [
  { forma: "caixa", l: 0.08, a: 2.3, p: 0.08, cor: "#59616f", pos: [x, 1.15, 0.25] },
  { forma: "oval", rx: 0.22, ry: 0.16, cor: "#59616f", pos: [x - 0.1, 2.38, 0.25] },
];

// herói do 1º quadro: nuvem grande de chuva sobre a praça, duas pessoas de guarda-chuva e a chuva caindo; tudo vira do avesso no segundo zero
const dono = (x, sem, roupa, cor) => ({ peca: "grupo", pos: [x, 0, 0.9], filhos: [...aberto(cor), pessoa(0, 0, roupa, sem, { em: "@onda", pose: "susto" }, { poses: [{ pose: "feliz" }, { em: "@onda", pose: "susto" }], escala: 1.35 })] });
const heroi = { peca: { peca: "grupo", pos: [0, 0.2, 15.5], em: -1, sai: "@1:fim-0.2", modo: "cresce", filhos: [
  nuvem(1.45, [0, 5.2, -1.4], { some: "@onda", sai: "@onda+1.1" }),
  nuvem(0.9, [-3.0, 4.7, -1.2], { some: "@onda", sai: "@onda+1.1" }),
  nuvem(0.95, [3.1, 4.8, -1.2], { some: "@onda", sai: "@onda+1.1" }),
  { peca: "agua", pos: [-1.2, 4.3, -0.4], ativo: -1, ate: "@onda", qtd: 8, queda: 4.1, abre: 0.5, cor: CIN },
  { peca: "agua", pos: [1.6, 4.3, -0.4], ativo: -1, ate: "@onda", qtd: 8, queda: 4.1, abre: 0.5, cor: CIN },
  dono(-2.4, 21, "#ff9f1c", "#ffd23f"), dono(2.4, 22, "#45c46b", "#f28aa5"),
] }, camera: [0, 3.9, 31], alvo: [0, 4.2, 15.5], ate: "@1:inicio-0.3" };

// 3: ninguém repara (já era tudo escuro)
const p3 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@3:inicio-0.35", sai: "@4:inicio", filhos: [
  pessoa(-2.3, 2.5, ROUPAS[0], 31, { em: "@3:repara", pose: "shrug" }), pessoa(0, 2.0, ROUPAS[1], 32, { em: "@3:escuro", pose: "mostra" }), pessoa(2.3, 2.5, ROUPAS[2], 33, { em: "@3:repara", pose: "shrug" }),
] };
// 4: o homem do tempo sem assunto (televisão com "???")
const p4 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@4:inicio-0.35", sai: "@5:inicio", filhos: [
  { forma: "caixa", l: 3.3, a: 2.3, p: 0.35, cor: "#3a3e47", pos: [-1.5, 2.4, 0], sombra: { rx: 1.7, rz: 0.4, pos: [0, -2.35, 0.2] } },
  { forma: "caixa", l: 0.35, a: 1.3, p: 0.3, cor: "#59616f", pos: [-1.5, 0.65, 0] },
  { forma: "retangulo", l: 2.9, a: 1.9, cor: "#e6ecf0", canto: 0.08, pos: [-1.5, 1.45, 0.2] }, // o retângulo nasce pela base
  { peca: "letreiro", texto: "TEMPO: ???", l: 2.7, a: 1.1, fundo: false, cor: "#27324a", pos: [-1.5, 2.4, 0.26] },
  pessoa(1.5, 0.9, ROUPAS[4], 41, { em: "@4:assunto", pose: "shrug" }, { oculos: true }),
] };
// 5: os guarda-chuvas viram bengalas (cada um com o seu, fechado)
const p5 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@5:inicio-0.35", sai: "@6:inicio", filhos: [
  { peca: "grupo", pos: [-2.5, 0, 2.3], filhos: [pessoa(0, 0, ROUPAS[3], 51, { em: "@5:viram", pose: "feliz" }), ...bengala(0.7)] },
  { peca: "grupo", pos: [0, 0, 2.0], filhos: [pessoa(0, 0, ROUPAS[1], 52, { em: "@5:viram", pose: "feliz" }), ...bengala(0.7)] },
  { peca: "grupo", pos: [2.5, 0, 2.3], filhos: [pessoa(0, 0, ROUPAS[2], 53, { em: "@5:viram", pose: "feliz" }), ...bengala(0.7)] },
] };
// 6: os rios começam a secar (rio cinza entre dois barrancos; a lama cresce por cima e o barco fica encalhado)
const p6 = { peca: "grupo", pos: [0, 0.2, 18.5], em: "@6:inicio-0.35", sai: "@7:inicio", filhos: [
  { forma: "retangulo", l: 26, a: 1.2, cor: "#8a5a3c", rot: [-Math.PI / 2, 0, 0], pos: [0, 0.05, -0.2], canto: 0.2 },
  { forma: "retangulo", l: 26, a: 3.0, cor: "#8fd6ff", rot: [-Math.PI / 2, 0, 0], pos: [0, 0.06, 2.0], canto: 0.2 },
  { forma: "retangulo", l: 26, a: 1.4, cor: "#8a5a3c", rot: [-Math.PI / 2, 0, 0], pos: [0, 0.07, 4.2], canto: 0.2 },
  { peca: "grupo", pos: [0, 0, 2.0], em: "@6:secar-0.4", modo: "cresce", filhos: [
    { forma: "retangulo", l: 26, a: 3.0, cor: "#a8703f", rot: [-Math.PI / 2, 0, 0], pos: [0, 0.1, 0], canto: 0.2 },
    ...[-9, -5, -1, 3, 7].map((x, i) => ({ forma: "caixa", l: 1.7, a: 0.04, p: 0.1, cor: "#5a3b24", rot: [0, 0.5 - (i % 3) * 0.5, 0], pos: [x, 0.13, (i % 2) - 0.5] })),
  ] },
  { peca: "grupo", pos: [-1.0, 0.25, 2.0], balanca: { em: "@6:secar", amp: 0.05 }, filhos: [
    { forma: "poligono", pontos: [[-1.1, 0.5], [1.1, 0.5], [0.7, 0], [-0.7, 0]], cor: "#b98a57", pos: [0, 0, 0] },
    { forma: "poligono", pontos: [[0, 0], [0, 1.6], [0.95, 0.15]], cor: "#fffdf6", pos: [0, 0.5, 0.02] },
  ] },
  pessoa(-4.5, 5.0, ROUPAS[0], 61, { em: "@6:secar", pose: "azedo" }, { escala: 1.4 }), pessoa(4.5, 5.0, ROUPAS[5], 62, { em: "@6:secar", pose: "azedo" }, { escala: 1.4 }),
] };
// 7: o chão racha como biscoito (terra seca rachada e um biscoito gigante de olho no assunto)
const p7 = { peca: "grupo", pos: [0, 0.2, 18.0], em: "@7:inicio-0.35", sai: "@8:inicio", filhos: [
  { forma: "retangulo", l: 18, a: 7, cor: "#a8703f", rot: [-Math.PI / 2, 0, 0], pos: [0, 0.05, 2.2], canto: 0.4 },
  ...[-6.5, -4, -1.8, 0.4, 2.6, 5, 7].map((x, i) => ({ forma: "caixa", l: 2.4, a: 0.05, p: 0.11, cor: "#4a2f1c", rot: [0, 0.8 - (i % 4) * 0.5, 0], pos: [x, 0.1, (i * 1.3) % 4 + 0.6], ...(i % 2 ? {} : { em: "@7:racha" }) })),
  { peca: "grupo", pos: [2.0, 1.35, 1.2], filhos: [
    { forma: "circulo", r: 1.25, cor: "#d9a65a", pos: [0, 0, 0] }, { forma: "circulo", r: 1.05, cor: "#e6b86c", pos: [0, 0, 0.03] },
    ...[[-0.4, 0.4], [0.5, 0.3], [0.1, -0.5], [-0.6, -0.3], [0.6, -0.5]].map(([x, y]) => ({ forma: "circulo", r: 0.14, cor: "#5a3a22", pos: [x, y, 0.06] })),
    { forma: "caixa", l: 1.5, a: 0.06, p: 0.1, cor: "#4a2f1c", rot: [0, 0, 0.9], pos: [0.2, 0.1, 0.08] },
  ] },
  pessoa(-3.0, 1.2, ROUPAS[3], 71, { em: "@7:racha", pose: "susto" }),
] };
// 9: ninguém mais vê coelho no céu (uma nuvem em forma de coelho vira cinza e some)
const coelho = { peca: "grupo", pos: [0, 4.9, -0.6], some: "@9:mais", filhos: [
  { forma: "oval", rx: 1.3, ry: 0.75, cor: "#ffffff", pos: [-0.2, 0, 0] }, { forma: "circulo", r: 0.58, cor: "#ffffff", pos: [1.25, 0.55, 0.02] },
  { forma: "oval", rx: 0.17, ry: 0.7, cor: "#ffffff", rot: [0, 0, 0.18], pos: [1.1, 1.6, 0] }, { forma: "oval", rx: 0.17, ry: 0.7, cor: "#ffffff", rot: [0, 0, -0.1], pos: [1.5, 1.55, 0] },
  { forma: "circulo", r: 0.3, cor: "#f4f7f9", pos: [-1.55, 0.15, 0.02] }, { forma: "oval", rx: 0.8, ry: 0.3, cor: "#dfe6ec", pos: [-0.2, -0.55, -0.02] },
] };
const p9 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@9:inicio-0.35", sai: "@10:inicio", filhos: [
  coelho,
  pessoa(-2.3, 2.5, ROUPAS[5], 91, { em: "@9:mais", pose: "azedo" }), pessoa(0, 2.0, ROUPAS[1], 92, { em: "@9:coelho", pose: "mostra" }), pessoa(2.3, 2.5, ROUPAS[4], 93, { em: "@9:mais", pose: "azedo" }),
] };
// 10: o cheiro de terra molhada some junto (terra escura com vapor subindo; a pessoa fareja e desanima)
const p10 = { peca: "grupo", pos: [0, 0.2, 18.0], em: "@10:inicio-0.35", sai: "@11:inicio", filhos: [
  { forma: "retangulo", l: 9, a: 4, cor: "#4f3420", rot: [-Math.PI / 2, 0, 0], pos: [0, 0.05, 2.0], canto: 0.4 },
  { peca: "vapor", pos: [0, 0.3, 2.0], ativo: -1, ate: "@10:some", cor: "#efe3cc", qtd: 7, rx: 0.24, ry: 0.8, abre: 0.6, sobe: 3.2 },
  pessoa(-2.4, 2.4, ROUPAS[2], 101, { em: "@10:some", pose: "azedo" }, { poses: [{ pose: "feliz" }, { em: "@10:some", pose: "azedo" }] }),
  pessoa(2.4, 2.4, ROUPAS[3], 102, { em: "@10:some", pose: "azedo" }, { poses: [{ pose: "feliz" }, { em: "@10:some", pose: "azedo" }] }),
] };
// 11: ninguém mais diz "cabeça nas nuvens" (cada um com uma nuvenzinha sobre a cabeça; ela vira cinza e some)
const mini = (x, sem, roupa) => ({ peca: "grupo", pos: [x, 0, 2.2], filhos: [
  pessoa(0, 0, roupa, sem, { em: "@11:nuvens", pose: "azedo" }, { poses: [{ pose: "feliz" }, { em: "@11:nuvens", pose: "azedo" }] }),
  nuvem(0.5, [0, 3.7, 0.1], { some: "@11:nuvens" }),
] });
const p11 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@11:inicio-0.35", sai: "@12:inicio", filhos: [mini(-2.6, 111, ROUPAS[0]), mini(-0.9, 112, ROUPAS[1]), mini(0.9, 113, ROUPAS[4]), mini(2.6, 114, ROUPAS[2])] };
// 12: ninguém reclama, todo mundo sorrindo na praça escura
const p12 = { peca: "grupo", pos: [0, 0.2, 17.5], em: "@12:inicio-0.35", sai: "@13:inicio-0.25", modo: "cresce", filhos: [
  pessoa(-3.2, 0, ROUPAS[0], 12, { em: "@12:reclama", pose: "feliz" }), pessoa(-1.1, 0, ROUPAS[2], 13, { em: "@12:reclama", pose: "feliz" }),
  pessoa(1.1, 0, ROUPAS[3], 14, { em: "@12:reclama", pose: "feliz" }), pessoa(3.2, 0, ROUPAS[1], 15, { em: "@12:reclama", pose: "feliz" }),
] };
// estrelas no céu escuro, do começo ao fim (são os outros sóis: continuam lá)
const estrelas = { peca: "grupo", pos: [0, 0, -8], em: -1, filhos: Array.from({ length: 34 }, (_, i) => {
  const x = ((i * 37) % 64) - 32, y = 20 + ((i * 53) % 24), r = 0.25 + ((i * 7) % 4) * 0.12;
  return { forma: "poligono", pontos: [[0, r * 2.2], [r * 0.5, r * 0.5], [r * 2.2, 0], [r * 0.5, -r * 0.5], [0, -r * 2.2], [-r * 0.5, -r * 0.5], [-r * 2.2, 0], [-r * 0.5, r * 0.5]], cor: "#fff6c8", pos: [x, y, 0], sombra: false };
}) };

const PRACA = { pos: [0, 3.9, 33.5], alvo: [0, 2.9, 18.6], fov: 40, deriva: [0, 0, -0.5], foco: 0.5 };
const cena = {
  cor: "#6f7f8e", // título legível sobre o adesivo branco (o céu das nuvens é claro demais)
  titulo: "as nuvens",
  onda: 0.8,
  motor: "livro",
  luzMotor: true,
  visual: "livro",
  semAzul: -10,
  semSol: -10,
  semNuvens: "@onda",
  semCarros: true,
  semPlacas: true,
  somemPredios: -10,
  lufs: -14,
  noite: [{ em: -1, ate: 999, forca: 0.8 }],
  sumiram: ["Dia 12: a cor azul", "Dia 13: o sol"],
  trilha: { nome: "misterio", constroi: ["@3:voz", "@5:voz", "@7:voz", "@9:voz", "@11:voz"], climax: "@12:inicio" },
  impactos: [{ em: "@onda", silencio: 0.5, volta: 0.4 }, { em: "@11:nuvens", silencio: 0.5, volta: 0.5 }],
  credito: { rotulo: "O MAIS CURTIDO", conta: "@luisambandoni", texto: "As nuvens", curtidas: 7 },
  divulgacao: { em: "@8:voz-0.05", ate: "@8:fim-0.05", titulo: "SEM CÂMERA", sub: "COMENTE GUIA", chamada: "LINK NA BIO" },
  exemplos: ["o celular", "o mosquito", "o chocolate"],
  heroi,
  cameras: [
    { em: "@1:inicio-0.3", lugar: "cidade", perto: true },
    { em: "@2:inicio-0.3", lugar: "praca" },
    { em: "@3:inicio-0.3", pos: [0, 3.6, 33.5], alvo: [0, 3.0, 18.4], fov: 41, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@4:inicio-0.3", pos: [0.3, 3.8, 33], alvo: [-0.2, 3.0, 18], fov: 42, deriva: [-0.2, 0, -0.5], foco: 0.5 },
    { em: "@5:inicio-0.3", pos: [0, 3.6, 37], alvo: [0, 2.3, 18.6], fov: 42, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@6:inicio-0.3", pos: [0, 6.5, 35], alvo: [0, 0.9, 20], fov: 42, deriva: [0, -0.1, -0.5], foco: 0.4 },
    { em: "@7:inicio-0.3", pos: [0, 8.0, 36], alvo: [0, 0.6, 19.6], fov: 44, deriva: [0, -0.1, -0.5], foco: 0.4 },
    { em: "@8:inicio-0.3", lugar: "cidade", perto: true },
    { em: "@9:inicio-0.3", pos: [0, 3.4, 34.5], alvo: [0, 4.0, 18], fov: 44, deriva: [0, 0.1, -0.4], foco: 0.3 },
    { em: "@10:inicio-0.3", pos: [0, 4.6, 34.5], alvo: [0, 1.8, 19.4], fov: 42, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@11:inicio-0.3", pos: [0, 3.6, 33], alvo: [0, 3.0, 19.7], fov: 42, deriva: [0, 0, -0.5], foco: 0.5 },
    { em: "@12:inicio-0.35", lugar: "praca" },
    { em: "@14:inicio-0.35", lugar: "cidade" },
  ],
  pecas: [estrelas, p3, p4, p5, p6, p7, p9, p10, p11, p12],
  selos: [
    { txt: "SEM CHUVA", em: "@0:chuva-0.1", ate: "@1:mundo-0.1", cor: "#3a2a1a", fundo: "#e8e8e8", r: -2 },
    { txt: "DO MUNDO INTEIRO", em: "@1:mundo-0.05", ate: "@1:para-0.1", cor: "#3a2a1a", fundo: "#ffe9b3", r: 2 },
    { txt: "PARA SEMPRE", em: "@1:sempre-0.1", ate: "@2:inicio-0.1", cor: "#ffffff", fundo: "#3a3e47", borda: "#fffdf6", r: -2 },
    { txt: "NINGUÉM REPARA", em: "@3:repara-0.1", ate: "@4:inicio", cor: "#3a2a1a", fundo: "#e8e8e8", r: -2 },
    { txt: "SEM PREVISÃO", em: "@4:homem-0.1", ate: "@5:inicio", cor: "#3a2a1a", fundo: "#ffd23f", r: 2 },
    { txt: "GUARDA-CHUVA VIROU BENGALA", em: "@5:viram-0.1", ate: "@6:inicio", tam: 74, cor: "#3a2a1a", fundo: "#ffd1e0", r: -2 },
    { txt: "RIO SECANDO", em: "@6:rios-0.1", ate: "@7:inicio", cor: "#3a2a1a", fundo: "#ffe9b3", r: 2 },
    { txt: "CHÃO RACHADO", em: "@7:chão-0.1", ate: "@8:inicio", cor: "#3a2a1a", fundo: "#ffd8a8", r: -2 },
    { txt: "SEM COELHO NO CÉU", em: "@9:coelho-0.1", ate: "@10:inicio", tam: 84, cor: "#3a2a1a", fundo: "#fff6d8", r: 2 },
    { txt: "SEM CHEIRO DE CHUVA", em: "@10:cheiro-0.1", ate: "@11:inicio", tam: 84, cor: "#3a2a1a", fundo: "#d6f5e0", r: -2 },
    { txt: "CABEÇA NAS NUVENS?", em: "@11:cabeça-0.1", ate: "@12:inicio", tam: 90, cor: "#ffffff", fundo: "#3a3e47", borda: "#fffdf6", r: 2 },
  ],
  etiquetas: [
    { txt: "NINGUÉM RECLAMA", pos: [0, 4.9, 18], em: "@reclama", ate: "@13:inicio-0.3" },
    { txt: "SEU NILO", pos: [-0.9, 4.25, 18.5], em: "@nilo+0.7", ate: "@13:anotou-0.2", cor: "ouro" },
  ],
  sons: [
    { em: "@2:inicio", tipo: "carimbo", volume: 0.9 },
    { em: "@3:repara", tipo: "pop", volume: 0.7 },
    { em: "@4:homem", tipo: "pop", volume: 0.8 },
    { em: "@5:viram", tipo: "virada", volume: 0.8 },
    { em: "@6:secar", tipo: "nhac", volume: 0.7 },
    { em: "@7:racha", tipo: "impacto", volume: 0.7 },
    { em: "@9:mais", tipo: "virada", volume: 0.8 },
    { em: "@10:some", tipo: "pop", volume: 0.8 },
    { em: "@11:nuvens", tipo: "glitch", volume: 0.9 },
  ],
  transicoes: [],
  tremores: ["@7:racha", "@11:nuvens"],
};

const ep = { id: "hoje-sumiu-dia14", dia: 14, coisa: "as nuvens", velocidade: 1, falas: FALAS.map((fala, i) => ({ fala, legenda: LEG[i], ...(i === 13 ? { segura: 1.4 } : {}) })), cortes, cena };
writeFileSync(RAIZ + "episodios/dia14.json", JSON.stringify(ep, null, 1));
console.log("ok: episodios/dia14.json e public/hoje-sumiu-dia14.mp3, voz unida", Math.round(ini * 100) / 100, "s");
