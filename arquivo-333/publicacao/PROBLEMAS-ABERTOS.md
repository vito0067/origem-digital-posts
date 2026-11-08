# Problemas abertos de publicação (Arquivo 3:33)

## 1. Instagram está mostrando o vídeo na horizontal, não como Reels (anotado 07/11/2026, URGENTE)
- **O que o Vito viu:** os vídeos do Arquivo estão saindo no Instagram em formato horizontal, não no formato Reels (vertical, tela cheia).
- **O arquivo está certo:** `saida/proxima-estacao-ep01.mp4` tem 1080x1920 (9:16), h264, 30 fps. O problema não nasce na renderização.
- **Hipótese principal:** no fluxo do Chrome (publicar pelo computador), a tela de corte do Instagram pode estar ficando em "horizontal" ou o vídeo foi enviado como **Publicação** em vez de **Reel**. Não confirmado: a conferir olhando a publicação pronta.
- **O que fazer:**
  1. Abrir o perfil @arquivo333.0 e ver se o último vídeo está na aba **Reels** e como aparece na grade (corte 3:4 na grade é normal; horizontal não).
  2. No fluxo de publicação pelo Chrome, escolher **Criar > Reel** (não "Publicação") e na etapa de corte escolher **9:16/Original**, nunca 16:9 nem 1:1.
  3. Se a publicação já saiu errada, **apagar e republicar** como Reel correto (o Instagram não deixa mudar o formato depois de postar). Só com a ordem do Vito, porque perde curtidas e comentários.
  4. Escrever na skill arquivo-333 (passo de publicar pelo Chrome) e no `ESTADO.md` o passo certo e conferir **antes** de clicar em Compartilhar: pré-visualização vertical em tela cheia.
- **Por que importa:** vídeo horizontal no Instagram perde a tela cheia, a retenção cai e o algoritmo não o trata como Reel. Isso pode explicar parte da queda de visualizações que o Vito atribuía ao "robô" ou ao navegador.
- **Não avisar o Hoje Sumiu ainda** (ele está produzindo; o Vito decide quando falar com ele). Se o Hoje Sumiu usou o mesmo fluxo, o mesmo erro pode ter ocorrido lá: o Vito decide depois.

## 2. Queda de visualização quando se publica pelo navegador ou por robô
- Ver conversa de 07/11/2026 (Origem Digital): a causa mais provável não é "robô", e sim formato errado (item 1), publicação sem Reel e falta de engajamento nos primeiros minutos. Mais abaixo, o plano de automação (a escrever).


### Verificação em 07/11/2026 (Arquivo): CONFIRMADO
Os reels `DfYKX33oHPE` (ep. 11), `DfcWkv6I-2a` (ep. 12) e `DfdL6AOoXP0` (Caso 02 ep. 1) aparecem com player 600x600 (quadrado, topo e laterais cortados). O reel `DfTAweGiFSc` (n8n) aparece vertical. Causa: no fluxo do Chrome usei Criar > Postar e avancei a etapa de corte sem escolher 9:16/Original (o padrão é quadrado). Nada foi apagado. Passo certo anotado na skill e no ESTADO. Decisão pendente do Vito: apagar e republicar os três (perde curtidas e comentários).
