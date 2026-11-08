# Hoje Sumiu · Dia 9: os apartamentos (roteiro, para aprovação; nada renderizado)

**Tema:** os apartamentos (decidido pelas 5 opções do Dia 8: 6 comentários para apartamentos, 4 para fotos antigas).
**Abertura:** círculo que fecha (`iris`), escolhida pelo Vito no mostruário. Texto: "Hoje sumiram os apartamentos".
**Trilha:** `misterio` (tons inteiros, 76 BPM). O Dia 8 usou `noturna`, então o Dia 9 muda. Alternativa: `marcha`.
**Duração estimada:** 60 a 62 s, 14 falas (o Dia 8 tinha 14 falas e 57 s).
**Voz:** Mark, `elevenlabs_v4`, estabilidade 0.5, similaridade 0.75, sem aceleração.

## Efeito dominó (consequências em cadeia, sem número inventado)
1. Primeira noite: ninguém tem onde dormir.
2. Pelo menos o barulho do vizinho de cima também sumiu. Ninguém sente falta (piada do dia a dia).
3. Em uma semana: as praças viram acampamento.
4. Em um mês: ninguém sabe a quem pagar aluguel, porque os contratos sumiram junto.
5. Em três meses: a construção para, porque não há onde construir.
6. No fim: a cidade vira um descampado, só sobra céu.

Cada passo cria o próximo problema. Nenhum prazo tem número, só "uma noite", "uma semana", "um mês", "três meses".

## Roteiro (falas, na ordem)
| # | Fala (Mark) | Legenda na tela | Cena |
|---|---|---|---|
| 1 | Hoje sumiu os apartamentos. | Hoje sumiu os apartamentos | Abertura círculo; prédios ainda inteiros |
| 2 | Do mundo inteiro. Para sempre. | Do mundo inteiro. Para sempre. | Cartão de crédito aparece |
| 3 | O mais curtido foi "apartamento". | O mais curtido foi "apartamento" | Cartão com @ e comentário (ver decisão 3) |
| 4 | Primeira noite: ninguém tem onde dormir. | Primeira noite | Pessoas na rua com travesseiro |
| 5 | Pelo menos o barulho do vizinho de cima também sumiu. Ninguém sente falta. | Ninguém sente falta | Prédios viram do avesso (começo da onda) |
| 6 | Em uma semana, as praças viram acampamento. Barraca em cada canto. | Em uma semana | Praça cheia de barracas (adultos e famílias, sem criança em perigo) |
| 7 | Em um mês, ninguém sabe a quem pagar aluguel. Os contratos sumiram junto. | Em um mês | Papéis de contrato espalhados; letreiro "CONTRATO" vira |
| 8 | Feito sem câmera. Comente GUIA e eu te mando. | SEM CÂMERA · COMENTE GUIA | Cartão de divulgação (entre 40% e 60%) |
| 9 | Em três meses, a construção para. Não tem onde construir. | Em três meses | Guindaste e pedreiros parados |
| 10 | No fim, a cidade vira um descampado, e só sobra céu. | No fim | Clímax: último prédio vira; `flash` e `tremores` |
| 11 | Mas ninguém reclama. Para todo mundo, aquelas casas nunca existiram. | Mas ninguém reclama | Tela silenciosa, gente sorrindo, sem reação |
| 12 | Só o Seu Nilo lembra. E ele anotou: dia nove, os apartamentos. | Seu Nilo anotou | Seu Nilo no caderno; mural ganha nota "DIA 9" |
| 13 | Amanhã, outra coisa vai sumir. | O QUE SOME AMANHÃ? | Voo de câmera para o cartão final |
| 14 | Comente um para o chuveiro quente, dois para os cachorros, três para a praia, quatro para os aniversários, ou cinco para as janelas. | 1 chuveiro · 2 cachorros · 3 praia · 4 aniversários · 5 janelas | Cartão final com as 5 opções |

## Decisões que preciso do Vito antes de renderizar
1. **Como os prédios somem (sentido com o fundo):**
   - **A (recomendado):** os prédios inteiros viram do avesso, como a folha. A cidade fica sem prédio, então o que sumiu aparece de verdade no fundo.
   - **B:** só janelas e portas somem, e o prédio fica vazio. Mais estranho, mas mais trabalho e pode não ser lido.
   - Hoje o código não tem isso. Vou criar um flag `somemPredios`, no mesmo jeito do `somemCarros`, em `mundo-papel.ts` (função `predio`).
2. **Trilha:** `misterio` (proposta) ou `marcha`.
3. **Crédito (cartão @):** o comentário mais curtido sobre apartamento foi do TikTok, com 2 curtidas, e eu não tenho o @ dele. No Instagram, os três comentários sobre apartamento têm 1 curtida cada: @slaislenigomesda, @lolyfofinha1 e @maria.alice6742. Para usar o de 2 curtidas, preciso do nome da conta no TikTok. Se não tiver, o cartão usa um dos três do Instagram e a fala diz "o mais curtido que valia" se houver empate.
4. **As 5 opções do Dia 10:** chuveiro quente, cachorros, praia, aniversários e janelas. Você pode trocar qualquer uma.

## Checagens antes de render (quando aprovar)
- Nenhum prédio com apartamento sobra no fundo depois da onda (`somemPredios` cobre todos os `predio`).
- Nenhum veículo (regra do Dia 8, `semCarros`).
- Nenhuma criança em perigo; as famílias aparecem sem risco.
- Divulgação do GUIA entre 40% e 60% do vídeo.
- Voz gerada fala por fala e conferida; `/watch` antes de mostrar; aprovação do Vito antes de publicar.

## Custo
Voz: cerca de 3,5 créditos para 14 falas. Saldo atual: 478,16 créditos. Nada foi gerado ainda.
