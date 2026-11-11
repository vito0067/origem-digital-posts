// Motor 3D v2 · LUZ
// Um jogo de luz de cinema (principal, preenchimento e recorte) com sombra suave, pronto para os três perfis.
// Recebe o THREE do próprio projeto (cada perfil tem a sua cópia do three.js).

export const CLIMAS = {
  // Arquivo 3:33: noite fria, lua de lado, recorte quente vindo de trás.
  'noite-fria': { fundo: '#05070d', neblina: ['#070a12', 0.028], principal: ['#9db7ff', 2.2, [-6, 9, 4]], preenche: ['#1a2440', 0.55], recorte: ['#ffb070', 5.5, [3, 4, -6]], exposicao: 1.1 },
  // Hoje Sumiu: papel sob luz de abajur, sombra longa e macia.
  'papel-quente': { fundo: '#efe2c8', neblina: ['#efe2c8', 0.006], principal: ['#fff1d6', 3.0, [7, 12, 6]], preenche: ['#cfd8ff', 0.8], recorte: ['#ffd9a8', 1.6, [-6, 5, -7]], exposicao: 1.0 },
  // Ilha Zero: holograma não usa sombra; só neblina e um preenchimento leve para as peças sólidas.
  'holograma': { fundo: '#02060c', neblina: ['#02060c', 0.018], principal: ['#2fe6ff', 0.6, [0, 12, 4]], preenche: ['#0f5d70', 0.5], recorte: ['#ffb43c', 0.8, [-4, 3, -6]], exposicao: 1.0, semSombra: true },
};

/** Liga sombra suave, tom de cinema e cor correta no renderizador. */
export function prepararRenderizador(THREE, renderer, exposicao = 1.1, sombra = true) {
  renderer.shadowMap.enabled = sombra; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = exposicao;
  renderer.outputColorSpace = THREE.SRGBColorSpace; return renderer;
}

/**
 * Monta as luzes num cenário. alcance = metade do tamanho da área que precisa de sombra (em unidades do cenário).
 * Devolve { principal, preenche, recorte, grupo, mirar(alvo), pulso(t, forca) }.
 */
export function montarLuz(THREE, cena, clima = 'noite-fria', { alcance = 14, alvo = [0, 0, 0], mapa = 2048 } = {}) {
  const c = typeof clima === 'string' ? CLIMAS[clima] : clima; if (!c) throw new Error('clima de luz desconhecido: ' + clima);
  const grupo = new THREE.Group(); grupo.name = 'luz-v2';
  if (c.fundo) cena.background = new THREE.Color(c.fundo);
  if (c.neblina) cena.fog = new THREE.FogExp2(c.neblina[0], c.neblina[1]);
  const principal = new THREE.DirectionalLight(c.principal[0], c.principal[1]); principal.position.set(...c.principal[2]);
  if (!c.semSombra) {
    principal.castShadow = true; principal.shadow.mapSize.set(mapa, mapa);
    const k = principal.shadow.camera; k.left = -alcance; k.right = alcance; k.top = alcance; k.bottom = -alcance; k.near = 0.5; k.far = alcance * 6;
    principal.shadow.bias = -0.0004; principal.shadow.normalBias = 0.02; principal.shadow.radius = 4;
  }
  const preenche = new THREE.HemisphereLight(c.preenche[0], '#000000', c.preenche[1]);
  const recorte = new THREE.DirectionalLight(c.recorte[0], c.recorte[1]); recorte.position.set(...c.recorte[2]);
  grupo.add(principal, principal.target, preenche, recorte, recorte.target); cena.add(grupo);
  const base = { p: c.principal[1], r: c.recorte[1] };
  const mirar = (a) => { principal.target.position.set(a[0], a[1], a[2]); recorte.target.position.set(a[0], a[1], a[2]); principal.position.set(a[0] + c.principal[2][0], a[1] + c.principal[2][1], a[2] + c.principal[2][2]); recorte.position.set(a[0] + c.recorte[2][0], a[1] + c.recorte[2][1], a[2] + c.recorte[2][2]); };
  mirar(alvo);
  /** Pulso de luz no momento forte (relâmpago, susto, revelação): forca 0..1, some sozinho em ~0,4 s. */
  const pulso = (segDesdeImpacto, forca = 1) => { const p = segDesdeImpacto < 0 ? 0 : Math.exp(-segDesdeImpacto * 7) * forca; principal.intensity = base.p * (1 + 2.4 * p); recorte.intensity = base.r * (1 + 1.2 * p); };
  return { principal, preenche, recorte, grupo, mirar, pulso };
}

/** Marca todas as malhas de um objeto para fazer e receber sombra. */
export function comSombra(obj, faz = true, recebe = true) { obj.traverse((o) => { if (o.isMesh) { o.castShadow = faz; o.receiveShadow = recebe; } }); return obj; }
