// Câmeras do motor v2 (motor-v2/camera.mjs) para o Arquivo 3:33. Cada entrada é UM plano de câmera.
// base = plano antigo que arruma o cenário E dá o enquadramento já aprovado; a, b = que fatia da cena do plano antigo este plano mostra
// (assim o cenário anda no tempo certo quando uma cena é partida em vários planos de câmera).
// var = variação do enquadramento antigo ao longo do plano: gira (rad, em volta do alvo), dist (multiplica a distância), sobe (m), fov (graus a somar).
// O motor v2 soma o piso de movimento, o respiro, a emenda (entrada) e o tremor; pulsos = segundos (na cena inteira) do pulso de luz.
// Ritmo-alvo (padrão de qualidade 09/11): primeiro corte em até 2 s, algo novo a cada 3 s no máximo, câmera nunca parada.
// Ajuste deste perfil (11/11/2026): câmeras partem do enquadramento antigo (as absolutas entravam na cabeça da Lia e atrás da porta da cabine).
import { arranca, mix } from "../../../motor-v2/index.mjs";

const faixa = (f, p, d0) => (f ? mix(f[0], f[1], p) : d0);
/** Transforma a câmera do plano antigo segundo a variação, no ponto p (0..1) do plano. */
export function variar(c, v = {}, p = 0) {
  const q = arranca(p), g = faixa(v.gira, q, 0), k = faixa(v.dist, q, 1), s = faixa(v.sobe, q, 0), df = faixa(v.fov, q, 0);
  const a = c.alvo; let dx = c.pos[0] - a[0], dy = c.pos[1] - a[1], dz = c.pos[2] - a[2];
  const cx = Math.cos(g), sx = Math.sin(g); [dx, dz] = [dx * cx + dz * sx, -dx * sx + dz * cx];
  return { pos: [a[0] + dx * k, a[1] + dy * k + s, a[2] + dz * k], alvo: a, fov: (c.fov ?? 60) + df, rolar: c.rolar };
}

export const CAM_V2 = {
  // ---- cena 0: gancho (4,4 s) em 3 planos: 1,8 + 1,5 + 1,1 s
  "v2/hook_a": { base: "p2_hook", a: 0, b: 0.4, var: { dist: [1.3, 1.0], fov: [6, 0] }, pulsos: () => [0.02] },
  "v2/hook_b": { base: "p2_hook", a: 0.4, b: 0.75, var: { gira: [0.22, 0.14], sobe: [-0.15, -0.1] } },
  "v2/hook_c": { base: "p2_hook", a: 0.75, b: 1, var: { dist: [1.05, 1.0], sobe: [-0.3, -0.25], fov: [10, 8] }, entrada: "giro" },
  // ---- cena 1: corre (6,3 s): lado 0,6 + 0,4 e atrás 0,55 + 0,55
  "v2/lado_a": { base: "p2_corre_lado", a: 0, b: 0.6, var: { dist: [1.0, 0.9], fov: [0, 4] } },
  "v2/lado_b": { base: "p2_corre_lado", a: 0.6, b: 1, var: { sobe: [-0.25, -0.1], fov: [4, 0] } },
  "v2/tras_a": { base: "p2_corre_tras", a: 0, b: 0.5, var: { sobe: [0.2, 0.1], dist: [1.08, 1.0] } },
  "v2/tras_b": { base: "p2_corre_tras", a: 0.5, b: 1, var: { gira: [-0.06, -0.02], dist: [0.95, 0.9] } },
  // ---- cena 2: a plataforma entra no vagão (5,5 s, silêncio): 0,4 + 0,35 + 0,25
  "v2/entra_a": { base: "p2_entra", a: 0, b: 0.4, var: { sobe: [-0.2, -0.12], dist: [1.08, 1.0] } },
  "v2/entra_b": { base: "p2_entra", a: 0.4, b: 0.75, var: { gira: [0.1, 0.16] } },
  "v2/entra_c": { base: "p2_entra", a: 0.75, b: 1, var: { sobe: [0.6, 0.55], fov: [4, 0] }, entrada: "mergulho" },
  // ---- cena 3: painel "Embarque autorizado" (2 s)
  "v2/painel": { base: "p2_painel", a: 0, b: 1, var: { dist: [1.15, 0.95] }, pulsos: () => [0.05] },
  // ---- cena 5: caminho até a porta da cabine (5,1 s): 0,5 + 0,5
  "v2/porta_a": { base: "p2_porta_cab", a: 0, b: 0.5, var: { dist: [1.1, 1.0] } },
  "v2/porta_b": { base: "p2_porta_cab", a: 0.5, b: 1, var: { gira: [0.08, 0.04], sobe: [-0.2, -0.1] } },
  // ---- cena 6: dentro da cabine (8,3 s): vidro 0,5 + 0,5 e Lia 0,5 + 0,5
  "v2/vidro_a": { base: "p2_cabine_vidro", a: 0, b: 0.5, var: { dist: [1.05, 0.95] } },
  "v2/vidro_b": { base: "p2_cabine_vidro", a: 0.5, b: 1, var: { dist: [0.8, 0.7], fov: [-4, -6] } },
  "v2/cab_lia_a": { base: "p2_cabine_lia", a: 0, b: 0.5, var: { gira: [0.1, 0.0] } },
  "v2/cab_lia_b": { base: "p2_cabine_lia", a: 0.5, b: 1, var: { dist: [0.95, 0.85] }, pulsos: () => [0.0] },
  // ---- cena 7: as batidas (7,4 s, silêncio): 0,3 + 0,3 + 0,4; batidas em (duração - 2,3), (-1,7), (-1,1)
  "v2/bate_a": { base: "p2_bate", a: 0, b: 0.3, var: { sobe: [0.1, 0.0] } },
  "v2/bate_b": { base: "p2_bate", a: 0.3, b: 0.6, var: { sobe: [-1.15, -1.2], dist: [0.75, 0.7] } },
  "v2/bate_c": { base: "p2_bate", a: 0.6, b: 1, var: { dist: [1.05, 0.85] }, tremor: 1.0, pulsos: (d) => [d - 2.3, d - 1.7, d - 1.1] },
  // ---- cena 8: final (7,2 s): painel 0,35 + Lia 0,325 + 0,325
  "v2/final_painel": { base: "p2_final_painel", a: 0, b: 1, var: { dist: [1.1, 0.95] }, pulsos: () => [0.1] },
  "v2/final_lia_a": { base: "p2_final_lia", a: 0, b: 0.5, var: { gira: [-0.1, 0.0] } },
  "v2/final_lia_b": { base: "p2_final_lia", a: 0.5, b: 1, var: { dist: [0.97, 0.92], sobe: [0.05, 0.0] } },
};
