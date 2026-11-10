---
name: arquivo-333
description: Produz, revisa e publica os episódios do perfil "Arquivo 3:33" (séries de terror em animação 3D estilo desenho feita EM CÓDIGO, com three.js + Remotion, narrador Gideon). Use sempre que o assunto for o Arquivo 3:33, a série "O Sinal" (Marina, 12º andar, 3h33), um episódio novo, uma cena ou plano 3D do motor3d, a rotina diária na nuvem, o agendamento no TikTok/YouTube/Instagram @arquivo333.0, ou como fazer esse perfil crescer.
---

# Arquivo 3:33: fábrica de episódios em 3D feito em código

Perfil de **séries de terror em episódios**: um episódio novo **todo dia às 20h (Brasília)** no TikTok @arquivo333.0, no YouTube @arquivo333-0 e no Instagram @arquivo333.0.
O Vito (dono) deu **liberdade total**: não peça aprovação de roteiro, cena nem publicação. Ele aprovou este formato em 26/10/2026 e disse que o vídeo-modelo (youtu.be/5HwmrSwNY-Y) "é ouro".

**Comece por `arquivo-333/ESTADO.md`:** episódio atual, o que está agendado em cada rede, conta certa, pendências e riscos. Atualize esse arquivo a cada rodada.

**DECISÕES DO VITO DE 05/11/2026 (valem sobre qualquer trecho abaixo que diga outra coisa):**
1. **APROVAÇÃO ANTES DE PUBLICAR, TODO DIA.** Antes de publicar ou agendar qualquer episódio, mande o vídeo pronto no chat do Vito (SendUserFile) e espere ele aprovar o design. **Sem aprovação, não publica.** Quando ele aprovar, registre `true` em `publicacao/aprovados.json` (id do episódio). As tarefas agendadas só publicam o que está lá como `true`. Motivo: o Dia 5 do Hoje Sumiu saiu fraco e ele só viu depois.
2. **O Instagram NÃO sai mais pelo n8n.** O fluxo "Arquivo 3:33 - Publicar Instagram" (U5ZEYtmvwySTwvAj) foi DESLIGADO em 05/11 (o Vito acha que o post por robô derruba o alcance: IG ~1.500 → 450 → 150 → 140). O Instagram sai **pelo Chrome**, às 20h, conferindo a conta na tela (arquivo333.0), com o rótulo de IA ligado e depois da aprovação do item 1. O deviceId certo do Chrome está abaixo; se o canal/conta for outro (ex.: Hoje Sumiu), não publique e avise.
3. **"Comente GUIA" no lugar de "link na bio"**, desde os eps. 11 e 12 (só a legenda) e em todos os vídeos novos (fala curta no meio + cartão "SEM CÂMERA · COMENTE GUIA"). Legenda: "Quer saber como é feito? Comente GUIA." Um fluxo no Instagram responde os comentários.
4. **Hoje Sumiu fica de fora:** nada disto vale para lá até a sessão da Origem avisar.

**PRÓXIMA SÉRIE ESCOLHIDA PELO VITO (05/11/2026): "Próxima estação" (o metrô; a Lia, o último trem da linha cinza).** Base: o piloto de 04/11 (`arquivo-333/pilotos/estacao.json`). Correções pedidas, valem também para os episódios futuros do Arquivo:
- **Closes mais afastados e expressões variadas:** nada de close apertado com a cara de surpresa (boca aberta) sempre igual. Câmera em meio corpo, cabeça inteira com folga. A expressão muda com a fala: medo, desconfiança, alívio, choro contido, determinação.
- **Mapa da linha:** close no mapa, sem as argolas na frente, com a estação 13 (que não existe) bem legível.
- **Plataforma vista da janela:** pessoas com os **bonecos 3D do nosso estilo** (os do motor, com expressões), não silhuetas; **sem a coluna do vagão no meio da janela**: a janela mostra a plataforma limpa.
- **Gancho forte no 1º segundo:** imagem estranha + número em destaque; nunca abrir em vagão vazio e escuro.
- **Pergunta final com voto, falada e escrita:** "Comente 1 se ela desce, ou 2 se ela fica." **O voto decide o próximo episódio** (como o Hoje Sumiu): cada episódio é escrito DEPOIS de ler os votos do anterior, com uns 2 caminhos possíveis no arco da bíblia (`series/proxima-estacao.md`).
- **Mantém:** legenda estilo painel (2 palavras, medo em vermelho e maior), contador de estação, segunda voz do anúncio (Vera; o Vito vai ouvir e confirmar).
- **Antes de começar a série:** o Vito aprova um piloto refeito de ~30 s com essas correções.

**TikTok (regra do Vito, 01/11/2026):** nunca publique nem agende pelo computador; ele posta pelo celular. Rode `node ferramentas/kit-celular.mjs N` e diga onde está a pasta. Registre em `publicacao/epNN.md` a seção "Pergunta para fixar". Onde este manual ainda falar em agendar no TikTok, vale esta regra.

**Aposta para o público comentar (pedido do Vito, 01/11/2026):** todo episódio termina com uma pergunta sobre o que vai acontecer, ligada à cena ("ela abre a porta ou não?"). É só opinião: o voto não muda a história já escrita.
- **Onde vai:** logo depois da 1ª linha da legenda (no bloco `publicar`), na seção "Pergunta para fixar" de `publicacao/epNN.md` e, do ep. 8 em diante, no cartão final, com o extra `aposta` na cena `final`.
- **O NARRADOR FALA A PERGUNTA (pedido do Vito, 02/11/2026):** "o que mais pega as pessoas é a voz, não só a legenda". Do ep. 8 em diante, a pergunta é falada no cartão final, antes de "Episódio N, amanhã", e também escrita no cartão (extra `aposta`, com `em: 0.2`). Pergunta curta, sim ou não, ligada à cena, com palavras sem risco de acento (veja `referencia/voz.md`).
  - **Episódio novo:** a fala da cena `final` é um turno só: `"A Marina abre a porta ou não? Episódio onze, amanhã."`, com `semLegenda: true`. O texto do extra `aposta` é igual à pergunta falada.
  - **Episódio já gravado:** gere só a pergunta (barato, uns 0,3 de crédito por frase) e use `vozAntes` na cena `final`: `{ arquivo, url, textos, indice, pausa }`. O `preparar-caso` encaixa a pergunta antes da fala da cena, sem regerar a narração aprovada (foi assim nos eps. 8 a 10).
  - **Duração do cartão:** com a pergunta falada, o cartão final dura uns 5 a 6 s (antes, uns 3 s). Mantenha `segura` de no máximo 0,45 s e o episódio abaixo de 58 s.

**Divulgação do guia "Sem Câmera" no meio do vídeo (pedido do Vito, 02/11/2026; desde 03/11 ela é CURTA e OBRIGATÓRIA em todo episódio):** o Vito vende um guia em PDF (https://semcamera.vercel.app/?de=arquivo). A divulgação tem de ter **menos de 4 s** e não pode pausar a história. Os eps. 8 e 9 saíram com a versão longa (7 s) e não se refazem.
- **Como é:** cena `avulsa` entre os cortes, a 40%-60% do vídeo, nunca em cima de uma revelação. O narrador (Gideon, gravado à parte, arquivo `narracao/divulgacao-curta.mp3`, 0,3 crédito) diz: "Feito sem câmera. Guia no link da bio." (cena de 3,3 s). A versão longa de 02/11 (`divulgacao-guia.mp3`, 7 s) não se usa mais. Na tela, `visual: { tipo: "divulgacao", titulo: "SEM CÂMERA", linhas: ["GUIA EM PDF", "LINK NA BIO"] }`. Sem promessa de dinheiro.
- **No JSON:** a cena leva `"avulsa": { "arquivo", "url" }`, `"semLegenda": true`, `"entrada": "preto"`, `"sons": []`, e a `fala` é o texto da frase. O `preparar-caso` tira essa cena do corte da narração principal e mixa a voz dela à parte. O `nuvem.mjs` baixa o arquivo pela `url` se faltar.
- **Legendas:** a legenda do Instagram/TikTok e a descrição do YouTube ganham "Guia para fazer vídeos assim: link na bio." antes de "Ficção criada com inteligência artificial.".
- **Custo e tempo:** a frase curta serve para todos os episódios (já gravada). A cena dura uns 3,3 s; o episódio todo fica de **48 a 58 s** (regra de 03/11: o ep. 8 com 63 s perdeu views). Vale enquanto o Vito pedir.
- **Conferir:** olhe a folha de revisão (o título não pode encostar nas bordas: 168 px) e, no Pages, o tamanho do mp4 contra o local.
- **Se o envio do render falhar no PC:** o `fetch` do Node às vezes não conecta em `uploads.github.com`. O `nuvem.mjs` agora tenta o `curl`; se ainda assim falhar, rode `SO_ENVIO=1 TODOS=1 FORCAR=epNN node ferramentas/nuvem.mjs` (só refaz o envio e o registro, sem renderizar de novo). Cuidado: o envio apaga o arquivo antigo do release antes de subir o novo; confira que `o-sinal-epNN-upload.mp4` está lá no fim.

**Divulgação "Comente GUIA" (aprovada pelo Vito em 04/11/2026; vale só para os vídeos da NOVA série, depois do ep. 12):** os eps. 10, 11 e 12, já renderizados, ficam com "link na bio".
- **Fala e cartão no meio (menos de 4 s):** "Feito sem câmera. Comente GUIA e eu te mando." Cartão: "SEM CÂMERA · COMENTE GUIA". Grave um mp3 novo (`narracao/divulgacao-comente-guia.mp3`, mesma voz Gideon, uns 0,3 a 0,4 crédito, uma vez para todos os vídeos) e troque `avulsa.arquivo/url`, a `fala`, a `legenda` e o `visual.titulo`/`linhas` do cartão (hoje o `Divulgacao` mostra título + selos; ajuste para "SEM CÂMERA" + "COMENTE GUIA").
- **Legenda e descrição:** "Quer saber como é feito? Comente GUIA." O link do guia continua no perfil como apoio.
- **A pergunta final continua em todo vídeo**, como a chamada principal.
- **NÃO publique o primeiro vídeo com "Comente GUIA" até a sessão "Origem Digital" avisar** que o fluxo que responde os comentários do Instagram está no ar; senão alguém comenta e fica sem resposta.

**Decisões do Vito de 03/11/2026 (valem para os próximos episódios):**
1. **Descrição do canal e de cada vídeo no YouTube:** o canal Arquivo 3:33 ganha na descrição "Guia para fazer vídeos assim, sem câmera: https://semcamera.vercel.app/?de=arquivo" (mantendo o resto). Em todo vídeo novo, a descrição também leva a frase e o link. Confira na tela que o canal é o Arquivo 3:33 antes de salvar: o Chrome às vezes volta no perfil do Hoje Sumiu.
2. **Abertura como a do ep. 2 (10 mil views):** o 1º quadro tem imagem estranha, um número em destaque e uma palavra em amarelo ou vermelho, antes de qualquer explicação.
3. **Sempre a pergunta final** para o público, falada e escrita.
4. **Duração de 48 a 58 s.**
5. **Teste de legenda (só na próxima série, um episódio de cada vez):** 2 palavras por vez, a palavra de medo em vermelho e maior. Compare com o formato atual e registre em `publicacao/numeros.md`.
6. **(Substituído em 05/11: o n8n foi desligado, veja as decisões do topo.) Instagram pela API (n8n) x à mão:** o ep. 8 fez 559 views em 1 dia no Instagram, contra 1,4 a 1,6 mil dos eps. 4 a 7 (no YouTube, 1 mil, igual); o ep. 9 começou com 3 views. Pode ser a divulgação, os 63 s ou a publicação pelo n8n. Teste: o ep. 10 sai à mão, pelo celular do Vito (`"publicar": { "instagram": "manual" }` no JSON tira o episódio do `agenda.json` e o n8n não publica). Compare as views do ep. 10 com as do ep. 9 e registre.
7. **Ep. 1 no Instagram** não está fixado (a bio diz que está): só dá pelo celular; avise o Vito.
8. **A próxima história (Caso 02) ainda não foi decidida:** não comece sem o Vito.

## Onde fica cada coisa
O código está no repositório `vito0067/origem-digital-posts`, pasta `arquivo-333/` (no PC: `Documents\Origem Digital\4-midia\posts-automaticos\arquivo-333`).
- `episodios/epNN.json`: o episódio, com falas, cenas, sons e o bloco `publicar`. É a fonte de tudo.
- `series/<serie>.md`: a bíblia da série, com regras do mundo, personagens e o arco dos episódios. Leia antes de escrever.
- `src/motor3d/`: o motor 3D (detalhes em [referencia/motor3d.md](referencia/motor3d.md)).
  - `boneco.ts`: personagens e poses.
  - `cenario.ts`: a cidade com a torre e o quarto.
  - `portaria.ts`: o térreo do prédio.
  - `planos.ts`: as tomadas de câmera.
- `src/caso/Caso.tsx`: a edição (legenda, extras, cortes, cartão final).
- `ferramentas/`:
  - `preparar-caso.mjs`: corta a voz, monta os tempos e mixa o som.
  - `renderizar.mjs`, `quadros.mjs`, `planos.mjs`: renderizam o episódio, quadros soltos e planos soltos.
  - `nuvem.mjs`: renderização no GitHub.
  - `pages.mjs`: põe os vídeos no Pages.
- `publicacao/`:
  - `epNN.md`: o que saiu, onde e com qual link.
  - `agendados.json`: o que já foi agendado em cada rede.
  - `render/`: o que a nuvem já renderizou, mais `agenda.json` e as folhas de revisão `epNN-revisao.jpg`.
- Vídeos prontos: release `arquivo-<id>` no GitHub. No Pages, `https://vito0067.github.io/origem-digital-posts/arquivo/<id>.mp4`.

## O formato (não mude sem o Vito pedir)
1. **Visual:**
   - **Estilo:** 3D estilo desenho, bonecos de cabeça grande e redonda, cidade de brinquedo à noite e chuva.
   - **Cores:** azul-noite com janelas quentes, vermelho só para perigo (LED, molduras, mira, número). Tudo feito no motor 3D, sem imagem de IA: o Vito reprovou as imagens da Higgsfield.
2. **Câmera em terceira pessoa:**
   - **Ritmo:** cada fala tem de 1 a 3 planos, com corte a cada 1,5 a 3 s.
   - **Movimento:** começa andando e freia no fim (`arranca`). Entre os planos, corte em chicote (já é automático).
3. **Medida na tela:** pelo menos uma por episódio. O extra `dado` é um contador com rótulo ("ALTITUDE 36 m", "JANELAS FOTOGRAFADAS 56"). É a marca do vídeo-modelo.
4. **Voz:**
   - **Narrador:** o Gideon narra em terceira pessoa (nunca "eu").
   - **Personagens:** quando um personagem manda áudio, usa outra voz, com `"vozTelefone": true` na cena e o extra `audio`.
5. **Legenda:** Anton 90 px, até 3 palavras por vez, palavra falada em amarelo e palavras de medo em `*vermelho*`.
6. **Etiqueta e final:** etiqueta "ARQUIVO 3:33 · SÉRIE · EP. N" no topo. Cartão final datilografado: "Episódio N+1 amanhã, 20h" + "SIGA PARA NÃO PERDER" + "Ficção · criada com inteligência artificial".
7. **O gancho do primeiro segundo é o mais importante (regras revisadas com os números de 29/10/2026, ver `publicacao/numeros.md`):**
   - O 1º quadro já mostra a imagem mais forte do episódio: o visor mirando a janela, o rosto com medo, o LED vermelho, de preferência com um `dado` (contador) já na tela. O ep. 2, que abriu no visor com "56", fez 10 mil no Instagram.
   - Nada de abrir no preto nem em cidade parada.
   - **A 1ª fala é um gancho que funciona para quem NUNCA viu a série**, com até 12 palavras e menos de 3 s: uma ameaça ou um fato impossível, concreto ("Alguém bateu na porta dela dizendo ser a vizinha. A vizinha estava no andar de baixo."). Nada de começar com "A Marina recebeu..." ou com recapitulação: no YouTube, metade das pessoas desliza no 1º segundo quando a abertura é recap (ep. 2: 50% ficaram; ep. 1, com o letreiro "NÃO OLHE PELA JANELA": 60%).
   - Junto da 1ª fala, um `textao` de 3 a 6 palavras com a frase-gancho (ex.: "ELA NÃO ESTAVA SOZINHA"), do segundo 0 até ~2,5 s.
   - O "até agora" vira **uma frase curta na 2ª fala**, no máximo.
8. **Duração:** de **48 a 58 s**, entre 9 e 10 falas. O YouTube e o Instagram premiam quem assiste até o fim, e hoje o TikTok está travado (0% de "Para você"), então a regra dos 61 s do TikTok fica suspensa. Volte para 61 a 70 s quando o TikTok voltar a distribuir e passar de 8 mil seguidores.
9. **Fim curto (eps. 5 em diante):** a última fala da história termina no gancho. A fala final passa a ser só "**Episódio N, amanhã.**" (uns 1,5 s), com o cartão `final` e `segura` de no máximo 0,6 s. O "Siga" fica escrito no cartão. Antes, a chamada falada + o cartão somavam uns 4 s parados no fim, e isso derrubava o "assistiu até o fim".

10. **Luz e personagem (revisão de 30/10/2026, contra o vídeo-modelo):**
   - **Closes:** cabeça inteira em quadro, cabelo visível e rosto sem estourar. Os planos de close chamam `luzClose(m)`. Ao criar um close novo, use a mesma função, câmera a 1 m ou mais da cabeça e fov entre 70 e 74.
   - **Mostre o que a voz fala:** se a fala cita um objeto ou um lugar (planta, olho mágico, foto), ele aparece na tela. Falta o objeto? Crie o extra ou o plano, não troque por um rosto genérico.
   - **Variedade:** no máximo 2 vezes o mesmo plano por episódio, e nenhum episódio abre com a mesma imagem do anterior.

## Regras da história e das plataformas (sempre)
- **Rótulo de IA:** ligado nas 3 redes. "Ficção criada com IA" na legenda e no cartão final.
- **Proibido:**
  - órgão do governo, "alerta oficial", marca real ou pessoa real;
  - violência explícita, sangue, criança em perigo;
  - conteúdo para crianças (o público é adulto ou geral).
- **Mistério:** o remetente nunca aparece; ninguém descobre quem é antes do último episódio da série.
- **Números:** por extenso na fala e em algarismo na legenda.
- **Fala final:** do ep. 5 em diante, "Episódio N, amanhã." (ver o item 9 do formato); do ep. 8 em diante, vem depois da pergunta falada ("A Bia entra ou não? Episódio nove, amanhã."). Até o ep. 4 era "Episódio N, amanhã. Siga o Arquivo três e trinta e três."
- **Segredos:** nunca escreva senha, chave ou token em arquivo nenhum.

## Como fazer um episódio
1. **Ler:** `series/<serie>.md` (o arco), o último `episodios/epNN.json` e `publicacao/agendados.json`. O próximo episódio é o número seguinte, com data = último + 1 dia.
2. **Roteiro:**
   - 9 a 11 falas e um gancho por episódio, seguindo o arco da bíblia.
   - Quebras de clima: um personagem novo, uma prova visual, um número.
   - Termine num gancho mais forte que o do episódio anterior.
3. **Voz (Higgsfield, cerca de 3 créditos):**
   - **Antes de gerar, leia [referencia/voz.md](referencia/voz.md) e rode `node ferramentas/revisar-voz.mjs episodios/epNN.json`** (palavra proibida: "celular" e as que o Vito apontar). Depois de gerar, diga ao Vito quais palavras de risco ficaram e peça para ele ouvir.
   - `generate_audio` com `model: "elevenlabs_v4"`, `stability: 0.4`, `similarity_boost: 0.8`.
   - `dialogue`: um turno por fala, com `voice_id` `1ad38ba4-9cc4-4f2f-9fde-b0fefdf67ae5` (Gideon, `voice_type: "preset"`).
   - Áudio de personagem: Andre `f1e8226e-2248-4d5f-b43c-0a79e9949dbf` para homem jovem. Para outras vozes, `list_voices`.
   - Espere com `jobs_wait`. A URL do mp3 vai em `narracaoUrl` e o caminho em `narracao: "narracao/epNN.mp3"`.
4. **Cenas:**
   - Escolha os planos em [referencia/motor3d.md](referencia/motor3d.md).
   - Faltou um plano? Crie no `planos.ts` seguindo as regras de câmera de lá. Se precisar, crie cenário ou personagem novo.
   - Coloque pelo menos um `dado` e use os extras (`visor`, `cartao`, `grupo`, `audio`, `textao`, `relampago`) e os `sons`.
5. **`publicar`:**
   - `data` (AAAA-MM-DD) e `hora: "20:00"`;
   - `capaEm` (segundo do quadro mais forte);
   - `legenda` (gancho de 1 linha + "O Sinal, episódio N" + chamada + aviso de IA + 6 hashtags);
   - `tituloYoutube` (curiosidade + " | O Sinal, Ep. N #shorts");
   - `descricaoYoutube`.
   - Modelos em [referencia/viral.md](referencia/viral.md).
6. **Renderizar:**
   - **No PC:**
     1. `node ferramentas/preparar-caso.mjs episodios/epNN.json`.
     2. `node ferramentas/quadros.mjs <id> <10 a 14 tempos>`: monte uma folha e OLHE antes de seguir.
     3. `CONC=3 node ferramentas/renderizar.mjs <id>`, cerca de 1,5 min.
     4. Cópia leve com o ffmpeg do Remotion (`../node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe`, comando no `nuvem.mjs`; a taxa acompanha a duração para ficar abaixo de 10 MB) e a capa. Mais simples: `TODOS=1 FORCAR=epNN node ferramentas/nuvem.mjs` faz tudo isso e ainda sobe o release.
   - **Na nuvem:** só dê push no `episodios/epNN.json`. A Action "Arquivo 3:33 · renderizar episódios" renderiza sem placa de vídeo, então demora. Detalhes em [referencia/nuvem.md](referencia/nuvem.md).
7. **Revisar** (a folha de quadros), contra a lista abaixo e a skill `revisao-arquivo-333`. Corrija e refaça o que falhar.
8. **Publicar ou agendar:** [referencia/publicar.md](referencia/publicar.md).
9. **Registrar:** `publicacao/epNN.md`, `publicacao/agendados.json` e a lista de episódios da bíblia. Depois commit e push.

## Padrão de qualidade (aprovado pelo Vito em 09/11/2026; vale para todo episódio)
Fonte: `4-midia\referencias\PADRAO-DE-QUALIDADE-VIDEOS.md`. Medir antes de mostrar ao Vito com `4-midia\referencias\ferramentas\medir-episodios.py`.
1. **Câmera sempre em movimento, algo novo a cada 2 a 3 s** (cena puxa a cena; meta: movimento médio acima de 5 e menos de 20% do tempo quase parado; A cabine: 6,5 e 18%).
2. **Entrada rápida:** gancho forte no 1º quadro e **primeiro corte em até 2 s** (A cabine cortou em 4,4 s: encurtar a 1ª cena nos próximos).
3. **Som:** silêncio curto antes do momento forte (campo `silencio: true` da cena), efeito no quadro exato (`sons` com tempo `voz+x`/`fim-x`), **volume final -14 LUFS** (campo `lufs: -14` no JSON do episódio; o preparar-caso normaliza com loudnorm; A cabine mediu -14,7: conferir de novo no medidor).
Também valem: sombra de contato nos bonecos (já no motor), e para recursos de episódio no vagão/cabine ver `src/motor3d/pilotos.ts` (planos `p2_*`, `pe_*`).

## Lista de revisão (todo episódio)
- **Abertura:** o 1º quadro prende (imagem forte e legenda já na tela)? Nada de preto, cidade parada ou rosto escuro.
- **Câmera:**
  - não atravessa parede, janela, cabeça ou cabelo (quadro preto = câmera dentro de algo);
  - nenhum objeto escuro tampa a tela (árvore, batente).
- **Legenda:** não fica em cima de cartão, grupo ou dado. Eles vão no alto (300 a 1100 px) e a legenda, de 1250 px para baixo.
- **Rostos:** aparecem inteiros nos closes, e a luz não estoura.
- **Voz:** nenhuma palavra proibida de `referencia/voz.md` na `fala`, e o Vito avisado das palavras vigiadas.
- **Som:** o corte da narração bate com as falas (de 4 a 6 sílabas por segundo, `preparar-caso` mostra) e os efeitos caem no momento certo (ex.: a trava no "trancaram").
- **Final:** o gancho aparece e o cartão final dura menos de 2 s parado.
- **Tamanho:** a cópia leve tem menos de 10 MB.

## Dicas que já custaram tempo
- **Tomada por cima do ombro com o celular:** não funciona com esse boneco, porque o celular fica minúsculo. Use o close do rosto com a tela virada para a câmera (`quarto_grupo`) mais o extra `grupo`.
- **Câmera no quarto:**
  - a parede da janela fica em z = -2,5 e o batente do meio em x = 0;
  - no lado da janela, mantenha a câmera com x ≥ 0,3 ou x ≤ -0,3 longe do batente, ou dentro do quarto (z > -2,38).
- **Ordem do Pages:** a fábrica de posts da Origem usa o mesmo Pages. Os dois fluxos rodam `pages.mjs` antes de publicar, para um não apagar os vídeos do outro.
- **Narração cortada errado:** o `preparar-caso` mostra o tempo de cada fala. Calcule sílabas por segundo; o normal é de 4 a 6. Se uma fala sair com menos de 3,8 e a seguinte com mais de 7, o corte errou. Junte as duas falas numa cena só (ou grave de novo com pausas maiores).
- **Renderizar no PC e publicar como a nuvem:**
  - Comando (na pasta `arquivo-333`): `GH_TOKEN=$(printf "protocol=https
host=github.com

" | git credential fill | sed -n 's/^password=//p') TODOS=1 FORCAR=epNN node ferramentas/nuvem.mjs`.
  - Leva cerca de 2 min por episódio e sobe o release.
  - Depois faça commit de `publicacao/render/` e push. A Action vê que já está feito e não refaz.
- **Upload pelo Chrome:**
  - só aceita arquivos das pastas da sessão (use `Desktop\Origem-Digital\arquivo-333-envios\`);
  - até 10 MB por arquivo.
