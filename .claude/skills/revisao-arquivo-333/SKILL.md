---
name: revisao-arquivo-333
description: Revisão completa do perfil Arquivo 3:33 e dos episódios já prontos ou agendados: lê os números reais do Instagram, YouTube e TikTok, compara com o que funcionou, confere gancho, história, voz, edição e visual (Marina, prédio, parque, elevador, corredor) contra o vídeo-modelo, e corrige o que falhar. Use sempre que o Vito pedir para revisar, analisar, conferir ou melhorar o Arquivo 3:33, um episódio ou os próximos agendados, ou perguntar por que um vídeo não viralizou. Rode também antes de agendar um lote novo.
---

# Revisão do Arquivo 3:33

O objetivo não é elogiar: é achar o que está impedindo o vídeo de viralizar e consertar. Responda ao Vito em português simples, com número real e sem jargão. Não invente dado: se uma página não abrir, diga que faltou.

Manual de produção: skill `arquivo-333`. Faça a revisão nesta ordem.

## 1. Números (sempre os de hoje)
Pelo Chrome da conta do Arquivo (confira que a conta é arquivo333.0, nunca @origem__digital). Abra uma aba sua e feche no fim.
- **YouTube:** `studio.youtube.com/channel/UCp1qPtKzd1zkQr04_J4xIHw/videos/short`: visualizações e duração de cada Short. No Analytics do Short: "Exibido x Deslizado" (a página geral de Analytics às vezes dá erro; tente a do vídeo).
- **Instagram:** `instagram.com/arquivo333.0/reels/` para as visualizações. No Reel, "Ver insights": % de não seguidores, curtidas, salvamentos, compartilhamentos e visitas ao perfil.
- **TikTok:** `tiktok.com/tiktokstudio/content`. Se seguir com 0 a 2 visualizações, a conta continua sem distribuição (ver `viral.md`).
- **Anote** em `arquivo-333/publicacao/numeros.md` e compare com a leitura anterior.

**Como ler:**
| Sinal | O que significa | O que fazer |
|---|---|---|
| Mais de 40% desliza no YouTube | abertura fraca | mudar 1º quadro e 1ª fala do próximo |
| Mais de 90% de não seguidores e muita visualização | o Instagram está testando com desconhecidos | publicar um "parte 2" enquanto dura |
| Muita visualização e poucas visitas ao perfil | quem vê não quer saber mais | perfil, fixados e gancho final |
| Salvamentos e compartilhamentos altos | história forte | repetir o tipo de gancho |
| 0% de "Para você" no TikTok | problema da conta, não do vídeo | passos do celular em `viral.md` |

## 2. Os episódios que ainda vão sair
Para cada `episodios/epNN.json` com data futura, confira a lista. Se falhar, **refaça** (roteiro, voz e render), mesmo que já esteja agendado: nunca deixe sair no formato velho.
- **Duração:** de 48 a 58 s.
- **1ª fala:** funciona para quem nunca viu a série, tem até 12 palavras e não é recapitulação. Teste: um desconhecido entende e fica curioso?
- **1º quadro:** imagem forte + `textao` de 3 a 6 palavras do segundo 0 até no máximo 2,5 s. Nada de preto, cidade parada ou rosto escuro.
- **Última fala:** só "Episódio N, amanhã.", com `segura` de até 0,6 s no cartão final.
- **Gancho final:** mais forte que o do episódio anterior.
- **Coerência:** segue as regras de `series/o-sinal.md`; a imagem mostra o que a voz está dizendo (falou da planta, a planta aparece).
- **Variedade:** o mesmo plano não aparece mais de 2 vezes no episódio, e os episódios não abrem com a mesma imagem (o YouTube não paga "conteúdo inautêntico").

## 3. Visual, contra o vídeo-modelo
**Referência:** youtu.be/5HwmrSwNY-Y ("Criei 60 Animações Virais no Claude"), os exemplos de animação 3D nos primeiros 30 s. O que define o estilo: luz suave e legível, personagem inteiro em quadro, cena com detalhes e legenda grande amarela.

Veja `publicacao/render/epNN-revisao.jpg` (ou gere quadros com `ferramentas/quadros.mjs`) e olhe de verdade. Confira:
- **Marina e rostos:** cabeça inteira, cabelo visível, rosto sem estourar de luz nem sumir no escuro (nos closes, chame `luzClose(m)`).
- **Prédio e cidade:** janelas visíveis, a torre se destaca do fundo, chuva presente.
- **Parque:** não vira uma mancha preta; dá para ver árvores ou trilha.
- **Elevador e corredor:** mostrador legível, luz coerente e nada tampando a tela.
- **Costas dos personagens:** cabelo cobrindo a nuca.
- **Sobreposições:** grupo e cartões não tampam o rosto do personagem nem a legenda.
- **Câmera:** não atravessa parede, janela ou cabeça. Quadro preto ou faixa de cor chapada = câmera dentro de algo.

Abra também o Short do vídeo-modelo e compare um quadro nosso com um deles. Se algo estiver pior que a referência, corrija no motor (`src/motor3d/`) e teste com `ferramentas/planos.mjs` antes de renderizar.

## 4. Voz e som
- Ouça ou confira os tempos do `preparar-caso`: entre 4 e 6 sílabas por segundo em cada fala.
- Efeitos no momento certo (batida, trava, vibração) e nenhum silêncio morto de mais de 1 s fora do clímax.

## 5. Perfis
- **Instagram:** ep. mais visto e ep. 1 fixados (só pelo celular; peça ao Vito). A bio promete o que existe?
- **YouTube:** playlist em ordem, "Vídeo relacionado" ligando os episódios e comentário fixado com pergunta.
- **TikTok:** ver `viral.md`.

## 6. Entrega
Termine com, nesta ordem:
1. os números de hoje em uma tabela;
2. o que descobri (o porquê, com o número ao lado);
3. o que já corrigi;
4. o que só o Vito pode fazer, com passo a passo;
5. a próxima coisa a testar e como saberemos se funcionou.

Registre as lições novas nesta skill ou na `arquivo-333`, para a rotina da nuvem também aprender.

## Lições já aprendidas
- **29/10:** recapitular na abertura faz metade do YouTube deslizar. O ep. 2, com visor e contador "56" na primeira tela, fez 10 mil no Instagram.
- **30/10:** o ep. 4 (a parede "ELES SÓ VEEM QUEM OLHA" na 1ª tela) fez mais em 19 h que o ep. 3 em 2 dias. O ep. 2 teve só 62 visitas ao perfil em 10 mil visualizações: visualização não vira seguidor sozinha.
- **30/10:** os closes estavam com o rosto estourado e o cabelo invisível; a planta do ep. 7 era citada e nunca aparecia na tela.
