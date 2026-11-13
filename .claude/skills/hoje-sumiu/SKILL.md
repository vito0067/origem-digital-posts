---
name: hoje-sumiu
description: Produz os episódios do perfil "Hoje Sumiu": todo dia uma coisa desaparece do mundo para sempre, num livro pop-up de papel em 3D feito em código, com narrador, Seu Nilo e o público decidindo nos comentários o que some amanhã. Use sempre que o assunto for o Hoje Sumiu, o Seu Nilo, um dia novo da série, o livro pop-up, o que os comentários escolheram, ou como fazer esse perfil crescer.
---

# Hoje Sumiu

Todo dia uma coisa some do mundo para sempre. As consequências são reais e se acumulam. Ninguém estranha: só o Seu Nilo lembra, e anota. **O comentário mais curtido decide o que some amanhã.**

O Vito aprovou esta direção em 30/10/2026, juntando o que mais gostou dos templates 1 (cidade 3D) e 3 (papel recortado). Trabalhe com autonomia: ele quer resultado sem precisar explicar de novo. Decisões de gosto já estão aqui.

## Comece por aqui
Leia `hoje-sumiu/ESTADO.md`: dia atual, links, próximo passo, pendências, contas e números. Atualize esse arquivo ao fim de cada dia.

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
- **Duração:** de 55 a 65 s (decisão de 03/11/2026: o Dia 3, com 80 s, teve só 27% de retenção no YouTube; o Dia 4 ficou em 64,7 s). Mais de 1 minuto conta para a monetização do TikTok, então prefira 60 a 65 s. Para caber, use 13 falas curtas e uma cena nova por fala.
- **Primeiro quadro:** a coisa do dia em destaque, com o cabeçalho e o letreiro "HOJE SUMIU + COISA". Na fala 1, o título e a coisa viram do avesso.
- **Mudanças aprovadas pelo Vito em 03/11/2026 (valem do Dia 4 em diante):** (1) 55 a 65 s, porque as views caem junto com a duração: Dias 1 a 3 tiveram 69, 73 e 80 s e 2.403, 1.859 e 1.416 views no Instagram; (2) abrir no momento do sumiço, com a coisa virando do avesso nos primeiros 2 s (fala 1 curtíssima: "Hoje sumiu X."), e só depois o contexto; (3) cada dia com um cenário diferente dos anteriores, usando as peças da biblioteca; (4) capa e título no estilo "HOJE SUMIU O BOLETO" (capa = quadro de 0,5 s do vídeo, com o letreiro); (5) divulgação do guia obrigatória no meio (40% a 60%) e **com menos de 4 s**: use "Feito só com inteligência artificial, sem câmera. O guia está no línque da bio." (o Dia 4 saiu com 7 s); (6) a pergunta final falada e escrita, sempre, porque o voto do dia seguinte depende dela.
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
- **Fim:** "O QUE SOME AMANHÃ?" com as 5 opções de voto legíveis (ver a seção "Voto com 5 opções" abaixo), "Ficção criada com IA" e "COMENTA AQUI ⬇".

## Coerência do mundo (erro do Dia 7, apontado pelo Vito em 07/11/2026)
O que sumiu NÃO pode aparecer em nenhum quadro depois da onda, nem no fundo. O livro tem coisas fixas (trânsito com carros, semáforo, placa PARE, gente, nuvens, sol): antes de renderizar, confira se a coisa do dia está entre elas e tire-a. Para veículos, use `"somemCarros": "@onda"` na `cena`. Ao revisar os quadros, olhe o FUNDO inteiro, não só a cena da frente.

## Como o tema do dia é escolhido (regra de 06/11/2026, depois do erro do Dia 6)
Decide o comentário **mais curtido** do Reel do dia anterior, **sem reinterpretar a categoria** (no Dia 6 o mais curtido era "Veículos" e o Wi-Fi foi escolhido por engano como "tecnologia"). Releia a lista inteira antes de escolher e, na dúvida, pergunte ao Vito. Se errar, o vídeo seguinte assume o erro em uma fala curta ("Ontem eu errei... Hoje eu conserto") e dá o crédito certo. **"Comente GUIA" está liberado desde 06/11/2026** (resposta pública e mensagem no Direct testadas): fala "Quer saber como é feito? Comente guia.", cartão `COMENTE GUIA` e a mesma frase na legenda; sem promessa de dinheiro.

## Análise dos Dias 1 a 6 (06/11/2026; views do Instagram e do YouTube)
- Instagram: D1 2.472 (69 s), D2 1.939 (73 s), D3 1.501 (80 s), D4 1.276 (65 s), D5 1.567 (61 s), D6 1.596 (61 s, 20 h). Cai com a duração e volta ao cortar para 55 a 65 s com abertura no sumiço.
- YouTube: D3 (80 s) 447 views contra 1.2 a 1.4 mil dos demais; D6 960 em 20 h.
- Comentários: o Reel do Dia 6 teve 15; quase todos de uma palavra, texto livre ("Veículos", "Futebol"). Ninguém usou o número da opção: o público prefere escrever. Por isso o final agora diz "um número OU escreva a sua ideia".
- O que um comentário simples ("VEÍCULOSSSS") mostra: temas do dia a dia e de coisas que andam, comida e jogo rendem comentário; tecnologia abstrata rendeu pouco.
- Aplicar: sumiço nos 3 primeiros segundos, 55 a 62 s, uma cena nova a cada fala, divulgação no meio, final que pede comentário. Retenção e salvamentos por Reel não foram lidos (precisa abrir "Ver insights" de cada Reel).

## Lições do Dia 6 (reprovado pelo Vito em 05/11/2026; valem sempre)
- **Legenda sincronizada com a voz, palavra por palavra.** Gere a voz FALA POR FALA (`generate_audio_batch`, uma fala por pedido; se der limite de taxa, reenvie as que falharam), junte com `ffmpeg` (concat com 1 s de silêncio entre as falas) em `public/<id>.mp3` e tire os `cortes` dos trechos de voz separados por pausas de 0,8 s. O `preparar-dia.mjs` agora distribui as palavras só pelo tempo de voz, casando frases com trechos. Confira que cada fala fica entre 3,5 e 5,5 sílabas/s.
- **Nunca esqueça a divulgação do guia/e-book Sem Câmera:** é um dos motivos dos vídeos. Enquanto "Comente GUIA" estiver travado, use "Feito sem câmera. O guia está no línque da bio." (3,6 s, entre 38% e 60%) e a linha "Guia para fazer vídeos assim: link na bio." na legenda e na descrição.
- **A voz fala "Um," sozinho como ruído.** Escreva "Comente um para a chuva, dois para ..." em frase corrida, e peça que o Vito ouça.
- **Animação:** nada parado. Pessoas entram andando (`move`), a bolinha de carregando gira (`gira`), peças sobem em sequência. Enquadre as pessoas nos ±2,5 m do centro do terreno (a tela vertical enxerga só ±3 m).
- **Pergunte ao Vito durante a produção** e confira o saldo de créditos (`balance`) antes de gerar voz.

## Voto com 5 opções (pedido do Vito, 05/11/2026, vale do próximo vídeo)
- **Pergunta final:** o narrador fala "Comente 1 para X, 2 para Y, 3 para Z, 4 para W ou 5 para K" e o cartão final mostra as 5 opções, legíveis, com número em destaque.
- **Escolha as 5 opções antes de publicar.** Temas bem abrangentes, para o público se envolver: algo do cotidiano, da natureza, da tecnologia, da comida e da memória/afeto. Nada de governo, pessoa, marca, religião, doença ou criança (as mesmas regras de "Proibido").
- **Contagem:** a opção mais comentada vence. Conte os comentários que escolhem cada número (não as curtidas do comentário). Se um número não pega, conte pela palavra-chave da opção. Comentário que vota em mais de uma opção não conta. Mostre a contagem ao Vito antes de produzir o dia seguinte.
- **Aprovação antes de publicar:** mostre o vídeo pronto no chat do Vito e espere o "aprovado". Sem aprovação, não publica.
- **Abertura:** o sumiço tem que aparecer nos primeiros 3 segundos. Vídeos mais curtos (o alvo continua 55 a 65 s, mas corte o que não ajuda a história).

## Voz (a primeira queixa do Vito foi aqui)
- **Modelo:** `elevenlabs_v4`, voz Mark `27c04473-84a9-4b60-a41f-c8e8458bd4f1` (`voice_type: "preset"`), estabilidade 0.5, similaridade 0.75, um turno por fala, e `"velocidade": 1` no episódio: sem aceleração. O Vito escolheu essa voz em 01/11/2026 por ser natural e tranquila. A Gideon, do Dia 1, parecia demais com o Arquivo 3:33: não volte a usar.
- **Frase curta:** vírgula sai corrida. Prefira ponto entre as frases.
- **Confira os cortes:** o corte automático pode jogar uma frase na fala errada. Compare os trechos de voz com o roteiro e, se errar, use `"cortes": [[de, ate], ...]` no episódio. Ritmo fora da faixa em uma fala e na vizinha é sinal de corte errado.
- **Eu não ouço áudio.** Só consigo medir. Por isso:
  - palavra estrangeira, sigla ou nome raro fica fora do roteiro. A ElevenLabs errou "ketchup" feio;
  - se for indispensável, escreva na `fala` como se pronuncia, com acento na sílaba forte, e mantenha a grafia certa na `legenda`;
  - números sempre por extenso na `fala`;
  - confira o ritmo que o `preparar-dia` imprime: de 4 a 6 sílabas por segundo em toda fala;
  - em voz nova, avise que precisa ser ouvida por ele.

## Crédito de quem escolheu (pedido do Vito, 01/11/2026)
Depois de "Do mundo inteiro. Para sempre.", um cartão mostra o @ de quem escreveu, o comentário e as curtidas, conferidas no dia. A voz diz que foi o mais curtido. Se houve veto, diga "o mais curtido que valia", porque outro comentário teve mais curtidas. O @ fica só na tela e na legenda, nunca na voz: nome de conta é pronúncia arriscada.

## "Comente GUIA" (mudança aprovada pelo Vito em 04/11/2026; **AINDA NÃO USAR**, ver a trava de 05/11/2026)
**Trava de 05/11/2026:** o aviso de comentários do Instagram estava desligado na Meta. O chat Origem Digital ligou e vai testar com o Vito. Até a mensagem "liberado" vir do chat Origem Digital: **nada de "Comente GUIA" e nada de "link na bio"** na fala, no cartão, na legenda nem na descrição. Não há divulgação do guia nos vídeos até lá, salvo se o Vito disser o contrário. Quando o aviso chegar, volte a esta seção.

A divulgação do meio do vídeo troca "link na bio" por **"Comente GUIA"** (quando liberado). Fala (menos de 4 s, Mark): "Feito sem câmera. Comente GUIA e eu te mando." Cartão (`divulgacao`): `titulo` "SEM CÂMERA", `sub` "COMENTE GUIA", sem `chamada` de link. Legenda e descrição: "Quer saber como é feito? Comente GUIA." e, como apoio, "link na bio" (o link fica no perfil). A pergunta final de voto continua em todos os vídeos e é a chamada principal: são duas chamadas diferentes, a de votar e a de comentar GUIA. O Dia 4 já está no ar com "link na bio" e não muda.
**Trava:** o chat Origem Digital está montando o fluxo que responde os comentários "GUIA" no Instagram (resposta pública e mensagem privada com o link da lista de espera). **Não publique nenhum vídeo com "Comente GUIA" antes de o chat Origem Digital avisar que o fluxo está ligado**, senão quem comentar fica sem resposta. Também não prometa nada a quem comentar até lá.

## Divulgação do guia "Sem Câmera" (pedido do Vito, 02/11/2026; o texto "link na bio" vale até o Dia 4)
Todo dia entra de 3 a 6 s de divulgação **no meio** do vídeo, entre 40% e 60% da duração, num corte natural (uma fala só dela, sem quebrar a história). A voz é a do Mark: "Este vídeo foi feito só com inteligência artificial, sem câmera. Quer aprender? O guia está no línque da bio." (escreva "línque" na `fala` e "link" na `legenda`). Na tela, o cartão de papel do bloco `divulgacao` (SEM CÂMERA · GUIA EM PDF · LINK NA BIO). Depois da fala, uma frase curta puxa a história de volta ("Voltando."). **Sem promessa de dinheiro.** Legenda e descrição levam "Guia para fazer vídeos assim: link na bio." O Dia 3 foi o primeiro com isso; no Dia 4 a divulgação ocupou 27 s a 34 s de 64,7 s (42% a 53%): confira a posição depois de `preparar-dia` e, se cair fora de 40% a 60%, troque a ordem das falas e regrave a voz. A fala sai com 6 a 7 s. O link do guia (https://semcamera.vercel.app/?de=hojesumiu) fica na bio do Instagram; o vídeo só diz "link na bio".

## Rotina diária (aprendida em 03/11/2026: o Dia 4 atrasou um dia)
Todo dia, de manhã (antes das 12h), este chat precisa ser chamado: ler os votos do Reel do dia anterior, produzir e postar. **Não existe aviso automático** (o agendador foi negado em 02/11). O Vito, ou o chat Origem Digital, chama de manhã. No Instagram logado, abra o post em `/p/<código>/` (o `/reel/` rola o feed) e clique em "Ver comentários ocultos".

## Som
Música em código (108 BPM, pizzicato) que se reduz a quase nada na virada estranha e volta no chamado. Efeitos de papel: folha virando em onda, dobra, buzina, apito, mordida, lápis.

## Como fazer um dia novo
1. **Ler os votos, só leitura (sem comentar nem curtir):** abra o Reel do dia anterior no navegador do app, que funciona sem login. Feche o aviso de cadastro, role os comentários até o número bater com o total da página, salve o texto da página num arquivo e rode `node ferramentas/votos.mjs arquivo.txt`. Confira o resultado com os olhos: a lista de veto não pega tudo. Fora de `Proibido`, o mais curtido vale. Mostre o tema ao Vito antes de produzir.
2. **Roteiro** em `episodios/diaNN.json`. Atualizar a linha do mural e o contador.
3. **Voz:** gerar e salvar em `public/<id>.mp3`. Depois `node ferramentas/preparar-dia.mjs episodios/diaNN.json`.
4. **Cena:** o bloco `cena` no próprio `episodios/diaNN.json`, com as peças da biblioteca: leia `hoje-sumiu/PECAS.md` e copie de `episodios/exemplo-dados.json`. Não crie `DiaN.tsx` nem código novo por dia; se faltar uma peça, acrescente em `src/pecas/objetos.ts`. O que sumiu antes continua sumido: o vermelho já nasce cinza e o mural ganha uma nota "DIA N" sozinho. Dias 1 e 2 têm código próprio: não mexa. O Dia 3 provou a biblioteca de ponta a ponta (roteiro, voz, cena, render e kit). Se `render.mjs` der erro de rede ao carregar fonte, rode de novo.
5. **Testar:** `EP=<id> ESCALA=0.33 node ferramentas/render.mjs Dia fotos 0.4 5 10 ...`, montar folha com `ferramentas/folha.ps1` e OLHAR antes do vídeo inteiro.
6. **Render:** `EP=<id> CONC=4 node ferramentas/render.mjs Dia`, cerca de 2 min. Depois conferir quadros do vídeo pronto: teste com foto solta já escondeu defeito.
7. **Revisar** com a lista abaixo. **Aprovação:** mostrar o vídeo pronto ao Vito no chat dele e esperar o "aprovado" (vale até para o Dia 5). **Publicar** no YouTube e no Instagram, com o rótulo de IA ligado. **Instagram NÃO por robô:** publicar pelo Chrome do Vito, como o Arquivo 3:33 faz; o fluxo do n8n derruba o alcance e não é usado para o Hoje Sumiu. **TikTok: nunca publique nem agende pelo computador.** O Vito notou que os vídeos enviados assim chegam a poucas pessoas e posta pelo celular. Para ele, rode `node ferramentas/kit-celular.mjs N` e diga onde está a pasta. Responder comentários nas primeiras horas.

## Lista de revisão
- O 1º quadro para o dedo?
- Nada tampa o assunto (árvore, poste, telhado)? Quadro todo de uma cor só = câmera dentro de algo.
- A cabeça do personagem está acima da legenda?
- A pancada (careta, virada) dura o bastante antes de a câmera sair? Se não, aumente `segura` da fala.
- A etiqueta aparece com o objeto certo e não cobre o cabeçalho?
- Toda fala entre 4 e 6 sílabas por segundo?
- Duração acima de 62 s?

## Proibido
- Sumir pessoa real, marca, governo, religião, doença, ou qualquer coisa que humilhe alguém: se o comentário mais curtido for assim, use o seguinte. Diga no vídeo a regra do Seu Nilo: "aqui não some governo nem pessoa".
- Violência, sangue e criança em perigo. O humor é de bairro, não maldoso.
- Parecer notícia verdadeira. Sempre "Ficção criada com IA" no fim e rótulo de IA ligado.
- Senha, chave ou token em qualquer arquivo (o repositório é público).

## Limites das contas pelo navegador (31/10/2026)
- **Antes de postar:** confira a conta em cada rede, nos dois perfis do Chrome. Em 01/11/2026 o Arquivo 3:33 estava logado no perfil em uso e por pouco o vídeo não saiu lá. Sinais de conta certa: "Editar perfil" na página @hojesumiu e, no YouTube Studio, o canal Hoje Sumiu.
- **YouTube:** espere a verificação terminar antes de publicar. Publicar antes dispara um aviso de risco de advertência.
- **Instagram:** na tela de corte, escolha "Original" (9:16), porque o padrão é QUADRADO. A capa com o título entra em "Selecionar do computador".
- **ERRO REPETIDO (07/11/2026), vale para os 3 perfis:** o Hoje Sumiu e o Arquivo 3:33 publicaram reels em QUADRADO (corte padrão), e o Vito teve de corrigir na hora e republicar. Antes de clicar em "Compartilhar", confira: (1) a pré-visualização ocupa a tela inteira na vertical; (2) o ícone de corte está em "Original"; (3) depois de publicar, abra o reel e veja se o player é vertical. Se saiu quadrado, avise o Vito na hora (não apague sozinho).
- **TikTok:** só o Vito publica, pelo celular. Na seção `Legenda TikTok` de `publicacao/diaNN.md`, escreva o nome sem @ e diga "no Instagram", porque o @ marcaria a conta de lá, que pode ser outra pessoa.
- **TikTok (conta nova):** foto, bio e comentário não salvaram pelo navegador, sem mensagem de erro. Ao salvar o perfil, confirme o aviso de apelido na hora: ele trava a troca por 7 dias. Peça ao Vito para fazer isso pelo celular.
- **Instagram:** a versão web não oferece fixar comentário nem editar o nome. Só pelo app.
- **YouTube:** fixar comentário pede uma verificação única no Studio, que é o Vito quem faz.
- **Envio:** a ferramenta aceita até 10 MB. Use uma cópia leve em `Desktop\Origem-Digital\hoje-sumiu-envios`.

## Salto de qualidade do Dia 8 (07/11/2026, pedido do Vito)
- **Efeito dominó:** 5 a 6 consequências em ordem crescente de gravidade e com prazo ("primeira noite", "em três dias", "em uma semana", "em um mês", "no fim"), cada uma com cenário e animação próprios. Estimativa nunca vira número inventado.
- **Edição:** 2 câmeras por fala (corte seco com `dur: 0.01` ou voo), transições à mão (`luz`, `pisca`, `flash`), `tremores` e `flash` no clímax. Remotion fica em 4.0.300.
- **Abertura e música:** cada dia usa um tipo de `abertura` e uma receita de `trilha` diferentes do dia anterior (bancos em PECAS.md e `ferramentas/trilhas.mjs`). Dia 8: alarme + noturna.
- **Roteiro do Dia 8 em diante:** gerado por script (falas, cortes e cena); a voz sai fala por fala e é unida com 1 s de silêncio; os cortes vêm da energia de cada janela. 14 falas ≈ 3,5 créditos.
- **Divulgação 40% a 60%:** se cair antes, troque a ordem das falas (reordene `falas` e `cortes` juntos, sem regravar).
- **Conferir com /watch antes de mostrar:** `WATCH_GEMINI_MODEL=gemini-2.5-flash` (o padrão travou). Dia 8: 8,0 → 8,5 → 9,0. Ele reclamou de "casas caindo" no dominó: gente precisa aparecer na metáfora (`dominos` com `gente`).

## Salto de qualidade do Dia 9 (08/11/2026, pedido do Vito)
- **Animação sem travada:** o Vito notou trechos parados no v1. Meça com `ferramentas/travadas.py video.mp4 pasta-temp` (diferença quadro a quadro, precisa do Pillow); meta: nenhum plano de câmera parado por mais de ~1,5 s. Use 2 câmeras por fala (voo ou corte), `deriva` em toda câmera e `balanca` em toda `pessoa`. Troque a transição `pisca` (corte no escuro, parece defeito) por `luz`.
- **Confira os quadros do vídeo pronto** para letreiros e etiquetas cortados pela borda do enquadramento (o Gemini não pega isso). Posições x das etiquetas precisam cair dentro da câmera da fala.
- **Prédios:** `somemPredios: "@onda"` na `cena` faz os prédios do fundo dobrarem e sumirem em onda (use quando o tema são prédios, casas ou apartamentos), como o `somemCarros` faz com os carros.
- **Crédito sem @ fixo** (vários comentários decidiram): `credito` com `rotulo` "VOCÊS DECIDIRAM", `conta`, `texto` e `curtidas: null` (a linha de curtidas some). A voz diz "Vocês decidiram que fosse X".
- **Mais consequências no mesmo tempo:** pausa de 0,6 s entre falas (em vez de 1 s) e falas de 2 a 3 s; o corte de cada fala vem da duração do clipe. 16 falas couberam em 56,5 s.
- **Upload leve:** 720p abaixo de 10 MB (`-crf 29 -maxrate 1300k`); a capa é o quadro de 0,5 s do vídeo.

## Dia 10 (09/11/2026): regras novas do Vito e melhorias do motor
- **Coerência do mundo (regra do Vito, 09/11/2026):** o que já sumiu nunca aparece, e o tema novo tem que fazer sentido no mundo que sobrou. As janelas venceram a votação do Dia 9, mas sem apartamentos e casas não faziam sentido: o vídeo explicou ("foi erro meu dar essa opção") e usou o segundo mais votado (chuveiro quente). Confira o mural (`sumiram`) antes de escrever o roteiro; nada de luz, carro, casa, janela, sono, Wi-Fi, placa, boleto, frio ou vermelho nas cenas e nas consequências.
- **Do Dia 11 em diante não há opções nossas no fim:** a pergunta é aberta ("comente o que some amanhã, o mais curtido decide"). Sem `opcoes` no `cena`, o cartão final mostra 3 `exemplos` (use exemplos que ainda existam no mundo). Se o mais curtido não fizer sentido, use o seguinte e explique.
- **Nenhum prédio desde o 1º quadro** depois do Dia 9: `somemPredios: -10` (número negativo = já sumiu antes do vídeo).
- **Melhorias novas:** abertura `carimbo` (carimbo azul bate com tremida e clarão; `linhas` pode ficar vazio), sombra de contato automática em toda `pessoa` (`sombra: false` desliga; `sombra: { rx, rz, op, pos }` em qualquer peça), peça `agua` (gotas caindo entre `ativo` e `ate`, para chuveiro e fonte), `cena.lufs: -14` normaliza a mixagem final (o Dia 10 saiu em -14,3 LUFS), e clipes de voz iguais de dias anteriores podem ser reaproveitados (economiza crédito).
- **Câmera:** 2 a 3 planos por fala, cada um com fov (zoom) diferente; mede-se com `travadas.py`. Dia 10: nenhum trecho parado acima de 2 s, exceto o cartão final.
- **Divulgação do guia:** "Feito sem câmera. Comente GUIA." e cartão com "LINK NA BIO"; sem preço dentro do vídeo.

## Enquadramento do Dia 10 (09/11/2026, correções do Vito): nada de texto cortado
- **Letreiros e etiquetas colocados NO MUNDO cortam fácil** (a tela vertical mostra só uns 3,5 m na horizontal e cada plano de câmera muda isso): "CHUVEIRO QUENTE", "FILA NA FONTE", "ENFEITE" e "CABELO?" saíram cortados ou atrás do cabeçalho. Para texto que precisa ser lido, use `selos` no `cena` (cartões de papel FIXOS na tela: `{ txt, em, ate, topo, tam, cor, fundo, borda, r }`; `topo` 380 acima da cabeça, 900 embaixo do cartão dos votos). Deixe `etiquetas` só para NINGUÉM RECLAMA e SEU NILO, que já têm posição testada.
- **Antes de renderizar o vídeo inteiro, tire fotos nos planos de cada fala** (`render.mjs Dia fotos t1 t2 ...`) e olhe cada letreiro, peça e cabeça no enquadramento real, não só o plano geral. Peças pequenas (patos, sabonete) pedem câmera mais longe do que parece (para 3 patos de 1,2 m de largura use ~11 m de distância).
- **Seu Nilo:** nada pode ficar na frente dele nem na mesma profundidade (a multidão da fala "ninguém reclama" tem que sair antes: `sai: "@13:inicio-0.25"`), e a fala dele precisa de `segura: 1.4` para o caderno terminar de escrever. As linhas `sumiram` precisam ser curtas ("Dia 9: apartamentos") para não quebrar.
- **Publicação pelo computador a pedido do Vito:** no Dia 10 ele pediu que o TikTok também fosse pelo Chrome (TikTok Studio: carregar, legenda, "Exibir mais", ligar "Conteúdo gerado por IA", Publicar). Sem esse pedido explícito, TikTok continua só pelo celular dele.

## Padrão de qualidade aprovado pelo Vito (09/11/2026, vale para todos os perfis)
Fonte: `4-midia\referencias\PADRAO-DE-QUALIDADE-VIDEOS.md`. Cada perfil mantém o estilo; no Hoje Sumiu (papel pop-up) as 3 melhorias são:
1. **Câmera sempre em movimento, algo novo a cada 2 a 3 s.** Meta medida: movimento médio acima de 5 e menos de 20% do tempo quase parado. No papel: 2 a 3 planos por fala (voo ou corte), `deriva` em toda câmera, `balanca` em toda pessoa, uma peça que sobe, selo ou personagem entrando por fala; uma cena puxa a outra (voo entre planos, não cena parada).
2. **Entrada rápida:** gancho forte no 1º quadro e primeiro corte em até 2 s. A abertura (`carimbo`, `iris` etc.) tem que acabar em até ~1,9 s (`ate: "@0:fim-0.2"` ou menos); no Dia 10 o primeiro corte saiu em 2,27 s, então encurte.
3. **Som:** silêncio curto antes do momento forte (a trilha já deixa 1,1 s antes do `climax`), efeito no quadro exato (`sons` com tempo `@N:palavra`) e **-14 LUFS** (`cena.lufs: -14`; variação de volume menor que 4 LU).
- **Medir antes de mostrar ao Vito (sem custo):** `python ferramentas\medir-dias.py dia10` (ffmpeg do pip imageio-ffmpeg; gera `saida\medicao\medidas.csv` e mosaico de 60 quadros) e `ferramentas\travadas.py` (quadros parados). Dia 10 (09/11): movimento 9,06 e 12,8% parado (o melhor dos 10 dias; Dia 8 7,2 e 19,8%; Dia 9 7,3 e 23,7%; Dia 1 a 7 entre 5,1 e 8,3 e 5% a 23%), -14,3 LUFS (Dias 1 a 9 entre -12,0 e -14,1), primeiro corte em 2,27 s. Compare com o episódio anterior, não com um número mágico.

## Dia 11 (10/11/2026): votos pelo mais curtido e novidades
- **Contar os votos:** ler os comentários do episódio anterior nas 3 redes (YouTube pelo Chrome clicando no ícone de comentários do Short; TikTok pelo perfil, abrindo o vídeo mais recente; Instagram pelo Chrome logado, porque sem login só aparecem alguns). "Guia" é pedido do guia, não voto. Vale o MAIS CURTIDO; some as curtidas da mesma ideia nas redes só como desempate e para o relatório. Personagem da série (Seu Nilo) não some.
- **Crédito:** `credito: { rotulo: "O MAIS CURTIDO", conta: "@autor", texto, curtidas }` (o @ só na tela; na legenda diga "de uma pessoa no YouTube", porque o @ marcaria outra conta no Instagram).
- **Pessoa colorida:** `pele` aceita qualquer cor (maquiagem "arte moderna" com pele rosa, azul e verde). Espelho, cadeira, dente e pavão são montados só com `forma` (ver `ferramentas/dias/gerar-dia11.mjs`); `sons: [{ em, tipo, volume }]` põe efeito no quadro exato (carimbo, nhac, pop, virada, subida, glitch).
- **Entrada rápida:** `abertura.ate` em `@0:fim-0.6` e primeiro corte seco de câmera em `@1:inicio-0.5` (primeiro corte medido: 1,87 s). O título do 1º quadro vem de `cena.titulo` (legível no quadro 0).
- **Repasse de autorização:** quando o Vito autoriza publicar sem o "aprovado" através de outro chat, produza tudo e deixe pronto, mas peça a confirmação neste chat antes de publicar.

## Câmera calma e visual "livro" (10/11/2026, o Vito rejeitou a câmera agitada)
- **A regra de câmera do padrão de qualidade NÃO vale para o Hoje Sumiu.** O Vito disse que a câmera trocando a cada 2 a 3 s "não combina" com o perfil e que não gostava do design. Use UM voo suave por fala (`dur` 1,3 a 1,8, sem `dur: 0.01`, sem segunda câmera no meio da fala), câmera a z ~31 a 33 para as cenas na praça (a ~28 as pessoas enchem a tela), `balanca` com `amp` 0.04.
- **`visual: "livro"` no `cena`:** cores mais vivas e quentes (saturação 1,28), luz de sol na diagonal e bordas escurecidas. A novidade na tela vem das peças que sobem e dos `selos`, não da câmera.
- Continuam valendo: entrada rápida, som no quadro, -14 LUFS, selos fixos, coerência do mundo. Dia 11 publicado assim: movimento 6,82 e 11,6% parado.
- Ele publicou sem ver a reformulação: antes do dia seguinte, pergunte o que achou e ofereça mostruário de visual se ainda não gostar.

## Motor do Hoje Sumiu (11/11/2026): pasta `hoje-sumiu\motor`
Decisão do Vito em 11/11/2026: um motor por perfil. Ele disse que o motor 3D v2 "não combinou nada com o Hoje Sumiu". A pasta `posts-automaticos\motor-v2` é só base congelada; o motor daqui é independente dela (câmera, ritmo, luz, som e normalização copiados; nada de chicote, mergulho, giro nem piso de movimento).
- Liga com `cena.motor: "livro"` no episódio. A ideia central é o LIVRO, não a câmera:
  - Câmera de leitor (`motor/camera-calma.mjs`): um enquadramento firme por fala, com aproximação contínua na metade da velocidade antiga. Sem voo entre planos.
  - Troca de cena = VIRAR A PÁGINA: uma folha atravessa a tela em 0,56 s e esconde a troca (componente `Pagina` em `DiaDados.tsx`). Não usar `transicoes` de clarão no livro.
  - Peças em stop motion: o mundo anda de dois em dois quadros; câmera e textos continuam lisos.
  - Legenda em tira de papel na zona segura, palavra por palavra, com marca-texto amarelo na palavra-chave (`*palavra*`) (`Legenda papel` em `Dia.tsx`).
  - Luz do motor ("papel-quente"): `cena.luzMotor: true`. Voto do Vito em 11/11/2026: usar do Dia 12 em diante. Deixa o livro mais escuro e contrastado.
  - Silêncio de 0,5 s na trilha antes do sumiço: `cena.impactos: [{ em: "@onda", silencio: 0.5, volta: 0.4 }, { em: "@N:palavra", silencio: 0.5 }]`. O conferidor avisa "fala invade o silêncio": é esperado, só a música cala.
  - Cartão final: os comentários de exemplo entram a cada 1,3 s, para não ficar mais de 4 s sem novidade.
- Ritmo: medido pelo que entra na tela (peça, selo, página) a cada 4 s no máximo, não pela câmera. `node ferramentas/conferir-ritmo.mjs hoje-sumiu-diaNN` antes de renderizar.
- Ainda NÃO feito no motor (ideias da direção que ficaram para depois): sumiço deixando o buraco com a silhueta; mola nova nas peças (elas já sobem com o "volta" antigo).
- Fábrica de episódios: `hoje-sumiuabrica.json` + `ferramentas/etapa.mjs` (roteiro, voz, ritmo, render, som, medir, kit). `node ../fabrica/fabrica.mjs hoje-sumiu dia12 --simular`. O episódio se chama `diaNN`. A etapa `voz` NÃO gera voz (crédito só com o Vito sabendo): confere o mp3 e roda o preparar-dia. A etapa `medir` já tira a folha de 60 quadros. Não há comando de publicar: publicação é manual, com o "aprovado" do Vito no chat.
- Teste: `episodios/dia11-livro.json` (Dia 11 refeito, não publicado). O dia sai no jeito atual até o Vito aprovar o teste.
- A pasta `motor-v2` e este motor ainda não estão no GitHub. Renderizar com outro perfil renderizando dá "Timed out": a etapa render tenta 5 vezes.
- Fila da fábrica (11/11/2026): dois perfis renderizando juntos derrubam o navegador do Remotion. Renderizar SEMPRE pela fábrica (`node ../fabrica/fabrica.mjs hoje-sumiu diaNN`), que espera a vez sozinha (até 3 h; `--sem-fila` fura). Render direto pelo `render.mjs` não entra na fila.

## Dia 12 (11/11/2026): a cor azul, primeiro dia no motor "livro"
- O Vito aprovou o visual do teste ("o dia 12 sai com o visual novo igual ao do teste") e autorizou publicar nas TRÊS redes pelo Chrome nesse dia. Sem pedido igual, TikTok volta a ser pelo celular e publicar exige o "aprovado".
- **`semAzul`** no `cena`: filtro na tela inteira que troca por cinza tudo o que é azul (céu, água, roupa, letreiro). `"@onda"` no dia do sumiço; **`-10` do Dia 13 em diante**. Roxo, rosa e verde não mudam. Não use azul como cor de destaque (selos, roupas) nos próximos dias: vira cinza.
- Gerador: `ferramentas/dias/gerar-dia12.mjs` (balão, pipa, guarda-sol, guarda-chuva, mar com areia, caneta, tela e baldes do pintor, arara no poleiro, tudo com `forma`). `calca` muda a cor da calça da pessoa.
- Enquadramento no motor livro: a tira da legenda fica em ~63% da altura e cobre o que estiver no chão perto da câmera. Para mostrar pernas ou objetos no chão, câmera longe e olhando baixo (`pos [0, 2.2, 37.5]`, `alvo [0, 0.5, 19.8]`); objeto pequeno vai em cima de uma mesa (`caixa` de 1,5 de altura).
- Sem `abertura`, o quadro 0 sai sem o letreiro (ele entra em ~0,2 s). Para capa use o quadro de 1,0 s; no próximo dia, garanta o título no quadro 0.
- Navegador: o Chrome do Hoje Sumiu é o "Browser 3" (`list_connected_browsers` + `select_browser`); o "Browser 2" estava no canal de outro perfil. A seleção pode voltar sozinha: confira o canal antes de enviar. No Instagram, o campo de arquivo certo é o ÚLTIMO da lista (o do meio troca a foto do perfil).
- Voz: o serviço recusa mais de 2 pedidos por vez (429): mande de 2 em 2.
- Números lidos em 11/11: todo Short fica em 1,1 a 1,4 mil views (95,9% do feed); retenção alta (Dias 5 e 8, ~88%) não trouxe mais views. O Instagram é onde o público comenta (22 comentários no Dia 11); TikTok, quase nada.

## Dia 13 (12/11/2026): o sol, primeiro teste do "segundo zero"
- O Vito autorizou neste chat produzir e publicar nas TRÊS redes pelo Chrome sem pedir aprovação, e arrumar bio, comentários e legendas para alcançar mais gente e vender o e-book.
- **Teste do dia (raio-x do YouTube, uma mudança por episódio):** `cena.onda: 0.7` faz a coisa virar do avesso no segundo zero, antes de a voz dizer o nome; no motor livro o título já está inteiro no quadro 0 (sem a animação de entrada). `heroi.ate` (tempo) diz quando sai o plano do herói (antes saía em `onda + 0,2`). Comparar "continuaram assistindo" com os Dias 11 (53,2%) e 12 (52,5%). Os testes 2 (primeira frase com consequência) e 3 (guia no fim) continuam na fila; o 3 só com o ok do Vito, porque a regra dele é sempre divulgar o guia.
- **Novas opções no `cena`:** `semSol` (o sol de papel do céu encolhe e não volta; negativo = já sumiu), `semPlacas: true` (esconde a placa PARE: as placas sumiram no Dia 5; ela ainda aparecia até o Dia 12) e, no visual livro, `noite: [{ em, ate, forca }]` agora escurece só o mundo 3D (filtro de brilho), deixando cabeçalho, selos e legenda claros. Use `forca` ~0,85.
- **Do Dia 14 em diante:** `semSol: -10`, `semAzul: -10`, `semPlacas: true`, e o mundo é NOITE desde o 1º quadro (sem sol a luz não volta). O que ainda ilumina: fogo, estrelas. A lua apagou junto.
- **Silêncio antes do sumiço** agora vale no livro (`preparar-dia.mjs` aceitava só o motor "v2" e importava de um caminho errado).
- Voz: o `generate_audio_batch` do `elevenlabs_v4` quer `dialogue: [{ text, voice_type: "preset", voice_id }]`, `stability` e `similarity_boost` (não `voice_id`/`similarity` soltos).
- Navegador: o Chrome do Hoje Sumiu agora se chama "Browser 2" (mesmo deviceId `241d2700…`). A seleção volta sozinha para o "Browser 1" a cada poucas ações (outra conversa usando o Chrome): chame `select_browser` antes de cada lote e confira a conta.
- Bios atualizadas em 12/11: Instagram ("🎬 Ficção com IA, sem câmera. Aprenda no link ⬇") e descrição do canal no YouTube (termos "E se o sol sumisse?", "curiosidades", convite para inscrever e link do guia).
