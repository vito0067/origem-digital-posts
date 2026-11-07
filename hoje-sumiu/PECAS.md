# Biblioteca de peças

Do Dia 3 em diante, um dia novo é só `episodios/diaNN.json`. Os Dias 1 e 2 continuam com código próprio (`Dia.tsx`, `Dia2.tsx`) e não precisam mudar.
Exemplo completo: `episodios/exemplo-dados.json` (o frio remontado só com dados).

```bash
node ferramentas/preparar-dia.mjs episodios/dia03.json
EP=hoje-sumiu-dia03 ESCALA=0.33 node ferramentas/render.mjs Dia fotos 0.4 5 10
EP=hoje-sumiu-dia03 CONC=4 node ferramentas/render.mjs Dia
```

## Tempos
Em qualquer campo de tempo, use uma referência em vez de segundos:
- `@4:porta+0.2`: palavra "porta" da fala 4, mais 0,2 s. A palavra precisa estar na `legenda`.
- `@4:inicio`, `@4:voz`, `@4:fim`: começo do trecho, começo da voz, fim do trecho.
- `@onda`, `@nilo`, `@regra`, `@reclama`, `@comenta`: marcas da série.

**A ordem do roteiro importa:** a fala 2 é o crédito, e as 4 últimas são virada estranha, Seu Nilo, amanhã e comenta. A fala do Seu Nilo precisa ter a palavra "anotou", e a regra aparece se ela tiver "governo".

## O arquivo do dia
Além de `id`, `dia`, `coisa`, `velocidade: 1`, `falas` e `cortes` (se precisar), vem o bloco `cena`:

| Campo | O que faz |
|---|---|
| `cor` | Cor da coisa antes de virar: `azul`, `gelo`, `verde`, `amarelo`, `laranja`, `rosa` ou um código de cor |
| `titulo` | Texto do letreiro do primeiro quadro; sem ele, usa `coisa` |
| `calor` | `true` faz o sol crescer e o livro esquentar |
| `sumiram` | Linhas antigas do caderno do Seu Nilo; aparecem as 2 últimas |
| `exemplos` | Os 3 comentários de exemplo da tela final |
| `credito` | `{ rotulo, conta, texto, curtidas }`: o cartão de quem comentou. Se houve veto, `rotulo` = "O MAIS CURTIDO QUE VALIA" |
| `heroi` | `{ peca, camera, alvo }`: o objeto do primeiro quadro, na praça |
| `cameras` | `{ em, lugar, perto }`; pode trocar `pos`, `alvo`, `fov`, `dur`, `arco`, `deriva`, `foco` |
| `pecas` | O que entra no livro (abaixo) |
| `etiquetas` | `{ txt, pos, em, ate, cor, r }`: `pos` é um ponto do mundo |
| `divulgacao` | `{ em, ate, titulo, sub, chamada }`: cartão de papel no meio do vídeo (o Dia 3 usa "SEM CÂMERA", "GUIA EM PDF", "LINK NA BIO"). A fala de divulgação vai no roteiro, entre 40% e 60% do vídeo, no Mark. Escreva "línque" na `fala`, para a voz falar "link", e "link" na `legenda` |
| `opcoes` | `[{ n, txt, icone, em }]`: cartão final com várias opções de voto (Dia 6 em diante: 5). Ícones: `chuva`, `queijo`, `despertador`, `fotos`, `sombra` (outros: acrescente em `ICONES` de `DiaDados.tsx`). `em` = `@N:palavra-0.1` da palavra de cada opção na última fala. Substitui `exemplos`; o rodapé vira "COMENTE O NÚMERO" |
| `contador` / `contadores` | `{ rot, num, em, ate }`; com `de`, `para`, `suf`, `conta` o número corre (ex.: estoque 100% → 0%) |
| `abertura` | `{ tipo, linhas, ate }`: gancho do 1º segundo. Banco: `manchete` (jornal "edição extra"), `alarme` (alerta piscando, Dia 8), `contagem` (3, 2, 1), `pergunta` (caderno escrevendo), `iris` (círculo fechando). **Não repita o tipo do dia anterior.** |
| `trilha` | `{ nome, constroi: [tempos], climax }`: música em `ferramentas/trilhas.mjs`. Receitas: `noturna` (ré menor, 84 BPM, Dia 8), `marcha` (lá menor, 128 BPM), `misterio` (tons inteiros, 76 BPM). Ganha uma camada em cada `constroi`, silêncio de 1,1 s antes do `climax`, impacto no clímax. Alterne a receita todo dia. Sem `trilha`, toca o pizzicato antigo |
| `noite` | `[{ em, ate, forca }]`: escurece a tela (cenas de noite) |
| `transicoes` | `[{ em, tipo, dur }]`: `luz` (vazamento de luz à mão), `pisca` (corte no escuro), `flash` (clarão do clímax) |
| `tremores` | Tempos em que a câmera treme |
| `sons` | `{ em, tipo, volume, lado }`: `virada`, `dobra`, `nhac`, `apito`, `buzina`, `pop`, `carimbo`, `clique`, `impacto`, `glitch`, `whoosh`, `subida`, `lapis` |

**Som e música já vêm prontos:** abertura, onda, voos da câmera, dobra de cada peça que sobe, crédito, Seu Nilo e final. Em `sons`, marque só o que for especial do dia.

## Lugares da câmera
`praca`, `esquerda`, `direita`, `ceu`, `rua`, `semaforo`, `transito`, `cidade`. Cada um tem plano geral e `perto: true`.

Terrenos livres para montar cenário: `esquerda` em `[-14, 0.13, 14.6]`, `direita` em `[12, 0.13, 13]`, `praca` em `[0, 0.2, 18]`, `ceu` em `[0, 24, -14]`. Na praça, a peça precisa sair antes de `@10:voz`, porque a multidão e o Seu Nilo entram ali.

## Campos de toda peça
`pos`, `rot`, `escala`, `em` (sobe da página), `sai` (dobra de volta), `modo` (`dobra`, `sobe`, `cresce`), `dur`, `some` (vira do avesso e fica cinza) e `move` (`[{ em, dur, pos }]`).

## Catálogo
| Peça | Para que serve | Campos próprios |
|---|---|---|
| forma solta | Desenhar qualquer objeto. Use `forma` sem `peca`: `caixa`, `circulo`, `oval`, `retangulo`, `morro`, `poligono` | `cor`, `prof`, `l`, `a`, `p`, `r`, `rx`, `ry`, `x0`, `y0`, `canto`, `calombos`, `pontos`; `fixa` não vira com o grupo |
| `grupo` | Juntar formas em um objeto. O `some` do grupo vira todas | `filhos` |
| `pessoa` | Gente de papel | `roupa`, `pele`, `calca`, `cabelo`, `bone`, `oculos`, `bigode`, `careca`, `listra`, `semente`, `olhar`, `pose` ou `poses` (`[{ em, pose }]`), `segura`, `leva` |
| `letreiro` | Placa de texto; pode virar | `texto`, `cor`, `l`, `a`, `fundo`, `verso`, `corVerso`, `vira` |
| `derrete` | Achata a peça de dentro e deixa poça cinza | `filho`, `derrete`, `duracao`, `poca` |
| `espalha` | Muitas coisas pequenas que viram em onda | `forma` (`floco`, `folha`, `papel`), `qtd`, `zona`, `tam`, `cor`, `atraso`, `dura` (`null` = fica) |
| `telhados` | Camada em cima dos prédios, que vira em onda | `cor`, `dura` |
| `piso` | Chão de um lugar, com parede | `l`, `p`, `listras`, `cores`, `parede`, `altura`, `filhos` |
| `fachada` | Parede com porta | `l`, `a`, `cor`, `corPorta`, `filhos` |
| `banca` | Barraca com toldo: feira, loja | `cor`, `corBalcao`, `filhos` |
| `mesa` | Mesa com toalha. Gente com z < 0 fica atrás | `l`, `cor`, `filhos` |
| `geladeira` | Porta que abre e gelo que vira | `abre`, `some`, `cor`, `corDentro`, `corGelo` |
| `vapor` | Vapor, ar quente, cheiro | `ativo`, `ate`, `cor`, `qtd`, `rx`, `ry`, `abre`, `sobe` |
| `mar` | Água que sobe pela página | `sobe`, `desce`, `nivel`, `cor`, `corOnda`, `filhos` |
| `boneco-neve` | Boneco de neve | `some`, `cachecol` |
| `pinguim` | Pinguim | `oculos` |
| `boleto` | Folha grande com faixa, valor e código de barras; vira na onda com `some` | `l`, `a`, `vence`, `valor`, `some` |
| `galinha` | Galinha de papel, com a crista cinza (o vermelho sumiu no Dia 1) | `cor`, `semente` |
| `cama` | Cama com travesseiro e coberta; `filhos` em cima (y ~1,3) | `l`, `cor`, `corBase`, `filhos` |
| `dominos` | Fila que cai em sequência (o efeito dominó, clímax do Dia 8). `gente: escala` cola uma pessoa em cada peça | `qtd`, `vao`, `l`, `a`, `cai`, `passo`, `acelera`, `cores`, `gente` |
| `grafico` | Barras que caem de `de` para `para` e ficam vermelhas (economia, estoque) | `de`, `para`, `cai`, `passo`, `dur`, `cor`, `corDepois` |
| `relogio` | Relógio de parede; ponteiros correm entre `corre` e `para` | `r`, `hora`, `cor`, `corre`, `para`, `voltas` |
| `lua` | Lua crescente | `r`, `cor` |

Todo campo de peça aceita também `balanca: { em, ate, amp }` (cambaleia, gente tonta).

**Efeito dominó (Dia 8 em diante):** 5 a 6 consequências em gravidade crescente e com prazo ("primeira noite", "em três dias", "em uma semana", "em um mês", "no fim"), cada uma com seu cenário e animação própria, 2 câmeras por fala (corte seco `dur: 0.01` ou voo), e o clímax grande com `tremores`, `flash` e o `climax` da trilha. Estimativa nunca vira número inventado.

**Poses:** `normal`, `feliz`, `fala`, `comemora`, `susto`, `azedo`, `triste`, `bravo`, `mostra`, `segura`, `come`, `surfa`, `shrug`.

## Peça nova
Se uma coisa não der para desenhar com `forma` e `grupo`, crie a função em `src/pecas/objetos.ts` e registre em `CATALOGO`. Ela fica disponível para todos os dias seguintes.

**Cada dia precisa ser de fato diferente:** troque cenários, objetos e piadas. Não repita a mesma sequência de lugares, porque conteúdo repetitivo pode barrar a monetização no YouTube.
