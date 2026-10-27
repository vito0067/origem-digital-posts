# Motor 3D do Arquivo 3:33 (three.js 0.170 + Remotion 4.0.300)

## Como o motor funciona
- **Renderizador:** `Mundo3D.tsx` monta UM renderizador 1080×1920 e os cenários uma vez por aba.
- **A cada quadro:**
  1. chama `padrao()` em todos os cenários, para desligar o que é passageiro (rótulos, molduras, cortinas, trava, clarão);
  2. roda a função do plano, que arruma poses, luzes e câmera e devolve `{ cena, pos, alvo, fov, rolar }`.
- **three.js:** vem de `vendor/three` (o empacotador aponta `three` para lá). Não instale nada no node_modules.
- **Testar um plano:**
  - `node ferramentas/planos.mjs nome:segundo:duracao [...]` gera fotos em `testes/planos/`.
  - Com `--grande`, gera o PNG 1080×1920 em `public/cenas/3d/` (é a foto usada no visual `fotoRecebida`).
- **Numa cena 3D do episódio:** `"visual": { "tipo": "3d", "planos": ["a", "b"], "pesos": [1.2, 1] }`. A duração da cena é dividida pelos pesos, e cada plano recebe o tempo local `s` e a sua duração `dur`.

## Cenários
### `cidade` (cenario.ts → Cidade)
- **O que tem:**
  - noite com chuva, céu em degradê, névoa e lua com sombra;
  - a rua (z = 12,5) com calçadas e postes;
  - o parque na frente (z de 22 a 109), com árvores, trilha em x = 1,5 e postes na trilha;
  - prédios atrás e dos lados, NUNCA na frente.
- **A torre da Marina:**
  - 12 m de largura e 14 andares de 3 m, com a frente em z = 5;
  - o quarto dela é um buraco no 12º andar, com a janela em x = 1,5 e y ≈ 34,7 (`ANDAR12`), e a mini-Marina dentro.
- **Janelas:** `pintarJanelas(fn)` decide a cor de cada uma, de `{ luz 0..1, celular 0..1 }`. Prontos: `cidadeDormindo`, `cidadeEscura` e `cidadeAcendendo`.
- **Extras do cenário:**
  - `rotulo12`: placa "12º ANDAR";
  - `fotos.count`: molduras vermelhas de "fotografada" nas 56 janelas da frente;
  - `clarao(i)`: flash no ar;
  - `mira`: alvo vermelho no ponto `Cidade.FOTOGRAFO`, no ar a 36 m, em cima do parque;
  - `ceuLuz` e `lua`: as luzes, para clarear um plano escuro.
- **Atualizar:** `atualizar(t, centroDaChuva, flash)`.

### `quarto` (cenario.ts → Quarto)
- **Dimensões:** 4,6 × 3 × 5 m. A janela fica na parede z = -2,5 (vão de x -1,2 a 1,2 e de y 0,8 a 2,5), com o batente do meio em x = 0 e a cidade pintada lá fora.
- **Móveis e Marina:**
  - cama e criado-mudo com o relógio "3:33";
  - a Marina sentada na beira da cama, em (0,2; -0,1; -1,4), de frente para a janela (`marinaNoQuarto`).
- **Luzes:** luar (`luaLuz`), luz quente da porta atrás dela (`recorte`, desenha o contorno), luz da tela (`luzCelular`) e o relógio.
- **Cortinas e celular:** `cortinas(p)` vai de 0 (aberta) a 1 (fechada). `celularCama` é o celular deitado na cama. A tela do celular na mão sai de `telaCom(m, "mensagem" | "nome" | "luz" | "grupo")`.

### `portaria` (portaria.ts → Portaria)
- **Planta:** térreo de 8 × 7 × 3,2 m.
  - **Frente (z = 3,5):** portas de vidro com trava magnética, LED (`travar(p)`: verde abaixo de 0,5, vermelho acima), teclado com LED, a rua molhada e a chuva lá fora.
  - **Fundo:** balcão de madeira com o monitor das câmeras ("CAM 03 · 12º ANDAR") e o **Rafa** sentado num banco alto em (-0,6; 0,3; -2,45).
  - **Esquerda:** elevador com o mostrador do andar (`mostrarAndar(n)`, "T" = térreo).
  - **Direita:** caixas de correio e um vaso.
- **Luz:** lâmpadas frias no teto; a da frente à direita pisca.

## Personagens (boneco.ts → `new Boneco(APARENCIAS.x)`)
- **Fixos:**
  - `marina`: moletom cinza, calça azul-marinho, cabelo chanel castanho;
  - `rafa`: porteiro, jaqueta azul do uniforme, boné;
  - `bia`: do 1102, moletom vinho, coque;
  - `alvaro`: do 1201, cabelo e bigode brancos, óculos, cardigã;
  - `cida`: a síndica, coque grisalho, óculos, blusa verde.
- **Personagem novo:** junte uma aparência em `APARENCIAS`. Opções:
  - `penteado`: chanel, curto, careca ou coque;
  - `capuz`, `bone` (cor), `bigode`, `oculos`, `altura`.
- **Poses** (`POSES`, funções do tempo para respirar):
  - `em_pe`, `sentada_celular`, `sentada_olhando_cima`;
  - `fechando_cortina`, `puxando_porta`, `gravando_audio`.
- **Pose solta:** `posar({ cabeca:[x,y,z], tronco, bracoE/D:[x,y,z], cotoveloE/D, pernaE/D, joelhoE/D, olhos 0.2..1.6, boca "neutra|aberta|medo|triste", sobrancelha -1..1 })`.
- **Celular:** `segurarCelular(true)` põe o celular na mão direita.

## Planos prontos (planos.ts)
### Cidade
- `cidade_aerea`: sobrevoo com celulares acendendo.
- `fachadas_celulares`: fachadas com telas azuis.
- `torre_aproxima`: voa até a janela dela.
- `rua_luzes`: da calçada para cima, janelas acendendo.
- `aerea_luzes`: de cima, a cidade acendendo.
- `foto_janela`: a janela dela de fora, parada (vira a "foto").
- `recuo_12`: sai da janela e mostra a altura, com a placa 12º.
- `foto_zoom`: do ponto do fotógrafo até a janela, com zoom.
- `parque_vazio`: da janela para fora, o parque escuro e vazio.
- `ponto_no_ar`: clarão no ar e recuo que mostra a mira a 36 m em cima do parque.
- `fachada_fotos`: a torre vista do parque, janelas acendendo com moldura vermelha.

### Quarto
- `quarto_lado`: ela na cama, de lado.
- `quarto_rosto`: close, com a tela iluminando.
- `rosto_mensagem`: close do outro lado.
- `ombro_celular`: EVITAR, o celular fica pequeno.
- `quarto_grupo`: close de baixo, com o grupo do prédio na tela.
- `janela_costas`: de costas para a janela, com relâmpago no fim.
- `celular_vibra`: o celular vibrando na cama.
- `rosto_medo`: os olhos arregalam.
- `cortina_fecha`: ela fecha a cortina e o quarto escurece.

### Portaria
- `portaria_rafa`: o Rafa no balcão gravando áudio.
- `porta_trava`: o LED passa de verde a vermelho, com tranco aos 70% do plano.
- `rafa_puxa_porta`: o Rafa puxa a porta trancada.

## Regras para criar um plano
- **Modelo:**
  ```ts
  nome_do_plano: (s, dur, m) => {
    const p = arranca(s / dur);            // começa andando e freia (use suave() só para olhar/pan)
    // arrumar o cenário: poses, janelas, travas... (o padrao() já zerou o resto)
    m.<cenario>.atualizar(s);
    return { cena: "cidade" | "quarto" | "portaria", pos: mix(A, B, p), alvo: [...], fov: 55..70 };
  },
  ```
- **Câmera:**
  - nunca dentro de parede, cabeça ou cabelo, nem passando por eles;
  - close de rosto a 0,9–1,25 m da cabeça (use `cabeca(m)`), com fov de 54 a 62.
- **Formato vertical:** para 9:16, o fov é o VERTICAL, então use de 55 a 78 (abaixo de 40 fica um "tubo").
- **Testar:** confira sempre com `planos.mjs` em 2 ou 3 tempos (início, meio e fim) e olhe a folha.
- **Cena escura:** suba `ceuLuz`, `lua` ou `recorte` só naquele plano, e não no cenário inteiro.
- **Cenário novo** (corredor do 12º, elevador por dentro, escada, 13º andar, quarto igual ao dela):
  - crie uma classe como a `Portaria`, num arquivo próprio, com `padrao()` e `atualizar(t)`;
  - registre no `Mundo3D.tsx` e no tipo `Mundo`/`Tomada` do `planos.ts`.

## Extras da edição (Caso.tsx), `em`/`ate` em segundos desde o início da cena
- **`dado`:** `{ rotulo, de, ate, em, fim, sufixo?, y? }`, contador em formato brasileiro.
- **`visor`:** `{ em, ate?, texto? }`, visor de câmera com REC, cantos, foco e hora.
- **`cartao`:** `{ titulo, texto, em, y? }`, notificação do "Remetente desconhecido" (ícone "?").
- **`grupo`:** `{ nome, sub?, em, intervalo?, mensagens:[{ de, texto, foto?, eu? }] }`, conversa do prédio (mostra no máximo 3 de cada vez).
- **`audio`:** `{ de, em, dur, y? }`, bolha de áudio do WhatsApp tocando.
- **`textao`:** `{ texto, em, ate }`, a mensagem grande letra por letra.
- **`relampago`:** `{ em }`.
- **Visuais especiais:**
  - `fotoRecebida` (`arquivo: "cenas/3d/<plano>.png"`, que a nuvem gera sozinha, e `legendaFoto`);
  - `final`, o cartão final.
- **Entradas:** `entrada`: `corte` (padrão), `flash`, `glitch` ou `preto`. O `preto` não pode ser usado no 1º plano.
- **Sons** (`["nome", quando, volume, pan]`):
  - **Lista:** vibrar, notificacao2, impacto, glitch, trovao, obturador, subida, grave, sino, carimbo, whoosh, coracao, tranca, audio, mais os da lista SFX do `sintetizador.mjs`.
  - **`quando`:** segundos desde o início da cena, ou "voz±x", "fimvoz±x", "fim±x".
