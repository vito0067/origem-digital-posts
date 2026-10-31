---
name: hoje-sumiu
description: Produz os episódios do perfil "Hoje Sumiu": todo dia uma coisa desaparece do mundo para sempre, num livro pop-up de papel em 3D feito em código, com narrador, Seu Nilo e o público decidindo nos comentários o que some amanhã. Use sempre que o assunto for o Hoje Sumiu, o Seu Nilo, um dia novo da série, o livro pop-up, o que os comentários escolheram, ou como fazer esse perfil crescer.
---

# Hoje Sumiu

Todo dia uma coisa some do mundo para sempre. As consequências são reais e se acumulam. Ninguém estranha: só o Seu Nilo lembra, e anota. **O comentário mais curtido decide o que some amanhã.**

O Vito aprovou esta direção em 30/10/2026, juntando o que mais gostou dos templates 1 (cidade 3D) e 3 (papel recortado). Trabalhe com autonomia: ele quer resultado sem precisar explicar de novo. Decisões de gosto já estão aqui.

## Onde fica
Pasta `Documents\Origem Digital\4-midia\posts-automaticos\hoje-sumiu` (Remotion + three.js; usa as ferramentas de `arquivo-333`).
- `episodios/diaNN.json`: falas, legendas e pausas. É a fonte do episódio.
- `src/mundo-papel.ts`: o livro, a cidade e os personagens. `src/Dia.tsx`: câmera, cabeçalho, etiquetas e legenda.
- `ferramentas/preparar-dia.mjs`: voz, marcas de tempo, música e efeitos. `ferramentas/render.mjs`: quadros e vídeo.
- `public/` e `saida/` ficam fora do Git (arquivos pesados).

## A arte (é o que faz alguém reconhecer o perfil)
1. **O mundo é um livro pop-up de papel, aberto numa mesa.** A página de baixo é a cidade; a de trás é o céu. Tudo é recorte: borda branca, grão de papel, sombra entre camadas. Nada de realista.
2. **O que some vira do avesso como uma folha, e o verso é cinza.** A virada corre em onda pelo mundo. Nunca troque isso por um simples sumiço.
3. **Tudo novo sobe dobrando da página** na hora em que a voz fala dele.
4. **Dia claro e colorido**, com muita luz: o contraste com o tema estranho é a graça.
5. **Seu Nilo** (bigode branco, óculos redondos, cardigã bege) tem o mural e o caderno. Quando o dia avança, o mural ganha notas.

## As referências e o que pegamos delas
- **Desmontando o Mundo (YouTube):** um mundo só que vai mudando; cadeia de problema ("mas… então…"); "você" na narração; etiquetas presas nos objetos; legenda palavra por palavra.
- **Do Terrão à Seleção (Instagram):** 28,5 mil seguidores com 21 posts; o público decide o próximo episódio; cabeçalho "DIA N" com contador; um reel com 5.694 comentários, todos respondendo a uma pergunta.
- **Nunca copie a arte, os personagens ou o texto deles.** Pegamos o método de edição, não a aparência.

## Formato de cada episódio
- **Duração:** de 62 a 75 s. Mais de 1 minuto conta para a monetização do TikTok.
- **Primeiro quadro:** a coisa do dia em destaque, com o cabeçalho e o letreiro "HOJE SUMIU + COISA". Na fala 1, o título e a coisa viram do avesso.
- **Roteiro de 12 a 14 falas, nesta ordem:**
  1. "Hoje sumiu X." Depois "Do mundo inteiro. Para sempre."
  2. Consequência real e concreta, em cadeia: cada fala cria o próximo problema ("você pensa que… mas…").
  3. Uma piada brasileira do dia a dia (o cartão de futebol, a placa que ninguém respeita).
  4. A virada estranha: ninguém reclama, para todo mundo aquilo nunca existiu.
  5. Seu Nilo lembra e anota.
  6. O chamado: "Amanhã, outra coisa vai sumir. E quem escolhe é você. Comenta aqui embaixo."
- **Consequências de verdade:** pesquise quando precisar. O que é inventado fica claro por ser absurdo.
- **Câmera:** um voo só, sem corte seco. A cada 2 a 4 s, algo muda. Em todo plano com personagem, a cabeça fica por volta de y = 750 px, acima da legenda.
- **Cabeçalho fixo:** "DIA N" + "N COISAS SUMIRAM · SÓ 1 PESSOA LEMBRA".
- **Legenda-adesivo:** até 3 palavras, palavra entra quando é dita, em y ≈ 1205 (fora da área dos botões das redes). Azul nas palavras fortes; a coisa que sumiu fica cinza depois da virada.
- **Fim:** "O QUE SOME AMANHÃ?" com 3 comentários de exemplo (avisar que são exemplo), "Ficção criada com IA" e "COMENTA AQUI ⬇".

## Voz (a primeira queixa do Vito foi aqui)
- **Modelo:** `elevenlabs_v4`, voz Gideon `1ad38ba4-9cc4-4f2f-9fde-b0fefdf67ae5`, estabilidade 0.42, um turno por fala. O preparo acelera 5%, o que deixa mais viva.
- **Eu não ouço áudio.** Só consigo medir. Por isso:
  - palavra estrangeira, sigla ou nome raro fica fora do roteiro. A ElevenLabs errou "ketchup" feio;
  - se for indispensável, escreva na `fala` como se pronuncia, com acento na sílaba forte, e mantenha a grafia certa na `legenda`;
  - números sempre por extenso na `fala`;
  - confira o ritmo que o `preparar-dia` imprime: de 4 a 6 sílabas por segundo em toda fala;
  - em voz nova, avise que precisa ser ouvida por ele.

## Som
Música em código (108 BPM, pizzicato) que se reduz a quase nada na virada estranha e volta no chamado. Efeitos de papel: folha virando em onda, dobra, buzina, apito, mordida, lápis.

## Como fazer um dia novo
1. **Ler:** o que os comentários do dia anterior escolheram (pelo Chrome, nos comentários do Reel mais curtido). Fora de `Proibido`, o mais curtido vale.
2. **Roteiro** em `episodios/diaNN.json`. Atualizar a linha do mural e o contador.
3. **Voz:** gerar e salvar em `public/<id>.mp3`. Depois `node ferramentas/preparar-dia.mjs episodios/diaNN.json`.
4. **Cena:** em `mundo-papel.ts`, criar os objetos do dia e o que vira do avesso. Reaproveite cidade, gente e campo.
5. **Testar:** `EP=<id> ESCALA=0.33 node ferramentas/render.mjs Dia fotos 0.4 5 10 ...`, montar folha com `ferramentas/folha.ps1` e OLHAR antes do vídeo inteiro.
6. **Render:** `EP=<id> CONC=4 node ferramentas/render.mjs Dia`, cerca de 2 min. Depois conferir quadros do vídeo pronto: teste com foto solta já escondeu defeito.
7. **Revisar** com a lista abaixo. **Publicar** com o rótulo de IA ligado, nas 3 redes. Responder comentários nas primeiras horas.

## Lista de revisão
- O 1º quadro para o dedo?
- Nada tampa o assunto (árvore, poste, telhado)? Quadro todo de uma cor só = câmera dentro de algo.
- A cabeça do personagem está acima da legenda?
- A pancada (careta, virada) dura o bastante antes de a câmera sair? Se não, aumente `segura` da fala.
- A etiqueta aparece com o objeto certo e não cobre o cabeçalho?
- Toda fala entre 4 e 6 sílabas por segundo?
- Duração acima de 62 s?

## Proibido
- Sumir pessoa real, marca, governo, religião, doença, ou qualquer coisa que humilhe alguém: se o comentário mais curtido for assim, use o seguinte e diga no vídeo que "o Seu Nilo vetou".
- Violência, sangue e criança em perigo. O humor é de bairro, não maldoso.
- Parecer notícia verdadeira. Sempre "Ficção criada com IA" no fim e rótulo de IA ligado.
- Senha, chave ou token em qualquer arquivo (o repositório é público).
