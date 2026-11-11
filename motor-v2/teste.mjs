// Teste do motor v2:  node teste.mjs   (não precisa instalar nada)
import { trilho, orbita, aproxima, sequencia, medirCamera, conferirRitmo, volumeTrilha, conferirSom, comPiso } from './index.mjs';
let falhas = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FALHA') + ' ' + m); if (!c) falhas++; };

// 1) um plano totalmente parado deve ser acusado; com o piso de movimento, deve passar
const parado = () => ({ pos: [0, 2, 8], alvo: [0, 1, 0], fov: 40 });
const m0 = medirCamera((t) => parado(t, 5), 5);
ok(m0.paradoPct > 95, `plano parado é acusado (${m0.paradoPct}% parado)`);
const comMov = comPiso(parado, 1); const m1 = medirCamera((t) => comMov(t, 5), 5);
ok(m1.paradoPct < 20, `piso de movimento resolve (${m1.paradoPct}% parado, movimento ${m1.movimentoMedio})`);

// 2) uma sequência de episódio de 12 s com todas as entradas
const cenas = [
  { inicio: 0, fim: 1.8, plano: aproxima({ de: [0, 30, 20], ate: [0, 6, 9], alvo: [0, 1, 0], fovDe: 30, fovAte: 44 }) },
  { inicio: 1.8, fim: 4.4, plano: orbita({ centro: [0, 1, 0], raio: 9, altura: 3, de: -0.4, ate: 0.5 }), entrada: 'chicote' },
  { inicio: 4.4, fim: 7.0, plano: trilho([{ em: 0, pos: [6, 2, 6], alvo: [0, 1, 0] }, { em: 0.5, pos: [2, 1.6, 4], alvo: [0, 1.2, 0], fov: 36 }, { em: 1, pos: [-3, 2.4, 5], alvo: [0, 1, 0], fov: 42 }]), entrada: 'continua' },
  { inicio: 7.0, fim: 9.6, plano: parado, entrada: 'mergulho', tremor: 0.6 },
  { inicio: 9.6, fim: 12, plano: orbita({ centro: [0, 2, 0], raio: 14, altura: 8, de: 0.2, ate: -0.1 }), entrada: 'giro' },
];
const cam = sequencia(cenas);
let finito = true; for (let t = 0; t <= 12; t += 1 / 30) { const c = cam(t); if (![...c.pos, ...c.alvo, c.fov].every(Number.isFinite)) finito = false; }
ok(finito, 'a câmera devolve números válidos em todos os quadros');
const a = cam(5), b = cam(5); ok(JSON.stringify(a) === JSON.stringify(b), 'o mesmo tempo dá sempre a mesma câmera (render repetível)');
const r = conferirRitmo({ cenas, camera: cam, dur: 12 });
ok(r.ok, `ritmo aprovado (parado ${r.medidas.paradoPct}%, movimento ${r.medidas.movimentoMedio}) ${r.avisos.join(' | ')}`);

// 3) o conferidor acusa primeiro corte tardio e trecho longo sem novidade
const ruim = conferirRitmo({ cenas: [{ inicio: 0, fim: 4.4 }, { inicio: 4.4, fim: 12 }], dur: 12 });
ok(!ruim.ok && ruim.avisos.length >= 2, `roteiro ruim é barrado (${ruim.avisos.length} avisos)`);

// 4) som: a trilha some antes do impacto e volta depois
const vol = volumeTrilha([{ em: 7 }]);
ok(vol(5) > 0.25 && vol(6.8) === 0 && vol(7.6) > 0.2, `trilha: ${vol(5).toFixed(2)} antes, ${vol(6.8).toFixed(2)} no silêncio, ${vol(7.6).toFixed(2)} depois`);
ok(conferirSom([{ em: 7 }, { em: 7.5 }], [{ de: 6.5, ate: 6.9 }]).length === 2, 'conferidor de som acusa impactos colados e fala no silêncio');

// 5) perfil calmo (Hoje Sumiu): a câmera pode parar, não há corte seco e o conferidor não reclama disso
const calmas = [
  { inicio: 0, fim: 4, plano: parado },
  { inicio: 4, fim: 8, plano: () => ({ pos: [3, 2, 7], alvo: [0, 1, 0], fov: 40 }) },
];
const camCalma = sequencia(calmas, { perfil: 'calmo' });
const mc = medirCamera(camCalma, 8);
ok(mc.paradoPct > 60, `perfil calmo deixa a câmera parar (${mc.paradoPct}% parado)`);
const salto = Math.hypot(...camCalma(4.03).pos.map((v, k) => v - camCalma(3.97).pos[k]));
ok(salto < 0.2, `perfil calmo troca de plano voando, sem corte seco (salto ${salto.toFixed(3)})`);
const rc = conferirRitmo({ cenas: calmas, camera: camCalma, dur: 8, eventos: [2, 5.5], perfil: 'calmo' });
ok(rc.ok, `conferidor aceita câmera parada no perfil calmo ${rc.avisos.join(' | ')}`);
const rp = conferirRitmo({ cenas: calmas, camera: sequencia(calmas), dur: 8, eventos: [2, 5.5] });
ok(!rp.ok, 'no perfil padrão o mesmo roteiro continua barrado');

console.log(falhas ?`\n${falhas} teste(s) falharam.` : '\nTodos os testes passaram.'); process.exit(falhas ? 1 : 0);
