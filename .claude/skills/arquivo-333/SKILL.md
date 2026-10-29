---
name: arquivo-333
description: Produz, revisa e publica os episódios do perfil "Arquivo 3:33" (séries de terror em animação 3D estilo desenho feita EM CÓDIGO, com three.js + Remotion, narrador Gideon). Use sempre que o assunto for o Arquivo 3:33, a série "O Sinal" (Marina, 12º andar, 3h33), um episódio novo, uma cena ou plano 3D do motor3d, a rotina diária na nuvem, o agendamento no TikTok/YouTube/Instagram @arquivo333.0, ou como fazer esse perfil crescer.
---

# Arquivo 3:33: fábrica de episódios em 3D feito em código

Perfil de **séries de terror em episódios**: um episódio novo **todo dia às 20h (Brasília)** no TikTok @arquivo333.0, no YouTube @arquivo333-0 e no Instagram @arquivo333.0.
O Vito (dono) deu **liberdade total**: não peça aprovação de roteiro, cena nem publicação. Ele aprovou este formato em 26/10/2026 e disse que o vídeo-modelo (youtu.be/5HwmrSwNY-Y) "é ouro".

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
9. **Fim curto (a partir do ep. 8):** a última fala da história termina no gancho. A fala final passa a ser só "**Episódio N, amanhã.**" (uns 1,5 s), com o cartão `final` e `segura` de no máximo 0,6 s. O "Siga" fica escrito no cartão. Antes, a chamada falada + o cartão somavam uns 4 s parados no fim, e isso derrubava o "assistiu até o fim".

## Regras da história e das plataformas (sempre)
- **Rótulo de IA:** ligado nas 3 redes. "Ficção criada com IA" na legenda e no cartão final.
- **Proibido:**
  - órgão do governo, "alerta oficial", marca real ou pessoa real;
  - violência explícita, sangue, criança em perigo;
  - conteúdo para crianças (o público é adulto ou geral).
- **Mistério:** o remetente nunca aparece; ninguém descobre quem é antes do último episódio da série.
- **Números:** por extenso na fala e em algarismo na legenda.
- **Fala final:** a partir do ep. 8, só "Episódio N, amanhã." (ver o item 9 do formato). Até o ep. 7 era "Episódio N, amanhã. Siga o Arquivo três e trinta e três."
- **Segredos:** nunca escreva senha, chave ou token em arquivo nenhum.

## Como fazer um episódio
1. **Ler:** `series/<serie>.md` (o arco), o último `episodios/epNN.json` e `publicacao/agendados.json`. O próximo episódio é o número seguinte, com data = último + 1 dia.
2. **Roteiro:**
   - 9 a 11 falas e um gancho por episódio, seguindo o arco da bíblia.
   - Quebras de clima: um personagem novo, uma prova visual, um número.
   - Termine num gancho mais forte que o do episódio anterior.
3. **Voz (Higgsfield, cerca de 1 crédito):**
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
7. **Revisar** (a folha de quadros), contra a lista abaixo. Corrija e refaça o que falhar.
8. **Publicar ou agendar:** [referencia/publicar.md](referencia/publicar.md).
9. **Registrar:** `publicacao/epNN.md`, `publicacao/agendados.json` e a lista de episódios da bíblia. Depois commit e push.

## Lista de revisão (todo episódio)
- **Abertura:** o 1º quadro prende (imagem forte e legenda já na tela)? Nada de preto, cidade parada ou rosto escuro.
- **Câmera:**
  - não atravessa parede, janela, cabeça ou cabelo (quadro preto = câmera dentro de algo);
  - nenhum objeto escuro tampa a tela (árvore, batente).
- **Legenda:** não fica em cima de cartão, grupo ou dado. Eles vão no alto (300 a 1100 px) e a legenda, de 1250 px para baixo.
- **Rostos:** aparecem inteiros nos closes, e a luz não estoura.
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
