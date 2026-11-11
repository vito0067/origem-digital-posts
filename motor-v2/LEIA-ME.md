# Motor 3D v2 (10/11/2026)

Base única para os vídeos do Arquivo 3:33, do Hoje Sumiu e da Ilha Zero. Não substitui os cenários de cada perfil: entrega o que os três precisam igual, já dentro do padrão de qualidade aprovado em 09/11/2026 (`4-midia\referencias\PADRAO-DE-QUALIDADE-VIDEOS.md`).

| Arquivo | O que faz |
|---|---|
| `camera.mjs` | Trilhos em curva, órbita, aproximação, emenda entre planos (`continua`, `chicote`, `mergulho`, `giro`), respiro, tremor e o **piso de movimento** (nenhum plano fica parado). |
| `ritmo.mjs` | Confere ANTES de renderizar: primeiro corte em até 2 s, algo novo a cada 3 s no máximo, câmera parada em menos de 20% do tempo. Diz os segundos exatos do problema. |
| `luz.mjs` | Luz de cinema (principal, preenchimento e recorte) com sombra suave. Climas prontos: `noite-fria` (Arquivo), `papel-quente` (Hoje Sumiu), `holograma` (Ilha Zero). Pulso de luz no momento forte. |
| `som.mjs` | Trilha que silencia sozinha antes do impacto e volta depois; confere impactos colados e fala invadindo o silêncio. |
| `normalizar-som.mjs` | Deixa o vídeo final em -14 LUFS. |
| `teste.mjs` | `node teste.mjs` confere tudo em 1 segundo. |

## Como usar num perfil (cada chat do perfil faz a sua ligação)

```ts
import * as THREE from "three";
import { sequencia, orbita, aproxima, trilho, aplicar, conferirRitmo, montarLuz, prepararRenderizador, volumeTrilha } from "../../motor-v2/index.mjs";

// 1) câmera do episódio: uma lista de planos
const cenas = [
  { inicio: 0,   fim: 1.8, plano: aproxima({ de: [0, 30, 20], ate: [0, 6, 9], alvo: [0, 1, 0] }) },            // gancho
  { inicio: 1.8, fim: 4.4, plano: orbita({ centro: [0, 1, 0], raio: 9, altura: 3, de: -0.4, ate: 0.5 }), entrada: "chicote" },
  { inicio: 4.4, fim: 7.0, plano: trilho([...]), entrada: "continua" },
];
const camera = sequencia(cenas);

// 2) antes de renderizar
const r = conferirRitmo({ cenas, camera, dur: 28, eventos: [3.1, 5.6] });
if (!r.ok) console.warn(r.avisos.join("\n"));

// 3) a cada quadro
aplicar(cam3, camera(frame / fps));

// 4) luz, uma vez por cenário
prepararRenderizador(THREE, renderer);
const luz = montarLuz(THREE, cena, "noite-fria", { alcance: 14 });
luz.pulso(t - 7.0);   // relâmpago ou susto aos 7 s

// 5) trilha que respira
<Audio src={trilha} volume={(f) => volumeTrilha([{ em: 7.0 }])(f / fps)} />
```

Depois de renderizar: `node ../motor-v2/normalizar-som.mjs saida/video.mp4` e a medida final com `4-midia\referencias\ferramentas\medir-episodios.py`.

## Dois jeitos de câmera (11/11/2026)

| Perfil | Quem usa | O que muda |
|---|---|---|
| `padrao` | Arquivo 3:33 e Ilha Zero | Câmera nunca para (piso de movimento), corte seco ou emendas fortes, primeiro corte em até 2 s. |
| `calmo` | **Hoje Sumiu** | A câmera PODE ficar parada. Sem piso de movimento, um plano por fala, troca de plano em voo suave (sem corte seco). O conferidor não cobra corte nem movimento: cobra só que algo novo entre na tela (peça, selo) a cada 4,5 s no máximo. |

```ts
const camera = sequencia(cenas, { perfil: "calmo" });
conferirRitmo({ cenas, camera, dur, eventos, perfil: "calmo" });
```

O Vito pediu em 11/11/2026: no Hoje Sumiu ele NÃO quer a câmera contínua. Luz, som e normalização valem igual para os três.

## Estado
- Testado: as funções de câmera, ritmo e som (`node teste.mjs`).
- Ainda NÃO testado num episódio de verdade: a luz (`luz.mjs`) e a ligação com cada perfil. A primeira ligação deve ser feita num episódio de teste, comparando com o episódio anterior.
- O previsor de "câmera parada" é uma estimativa pela câmera; quem manda é a medida do vídeo pronto.
