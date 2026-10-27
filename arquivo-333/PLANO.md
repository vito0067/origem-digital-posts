# Arquivo 3:33: perfil de séries de suspense (criado em 25/10/2026, formato novo em 26/10/2026)

## A ideia
- **O que é:** séries de suspense em episódios de 40 a 55 segundos. Um narrador ("o Arquivista") conta cada caso em terceira pessoa, com cenas em 3D, legenda grande e um gancho no fim. Quem quer saber o resto segue o perfil, e é isso que faz o perfil crescer.
- **A 1ª série é "O Sinal" (Caso 01):** às 3h33 da manhã, todos os celulares do Brasil recebem a mesma mensagem: "Não olhe pela janela". A protagonista é a Marina, do 12º andar. O roteiro está em `series/o-sinal.md`.
- **A história é nossa.** Os exemplos que o Vito mandou mostraram o formato (série com gancho, visual 3D), mas não copiamos personagem, título nem roteiro de ninguém.
- **Separado da Origem:** voz, visual e edição próprios. Nada da identidade da Origem Digital: nem a voz Elena, nem as cenas em código da Origem, nem as cores dela.

## Perfis (criados pelo Vito em 26/10/2026, no e-mail da Origem)
- **Instagram:** @arquivo333.0
- **TikTok:** @arquivo333.0
- **YouTube:** @arquivo333-0
- **Nome:** Arquivo 3:33
- **Bio:** "Casos de suspense em episódios 📼 · Episódio novo todo dia às 20h · Ficção criada com IA"
- **Foto:** `saida/avatar.png` ("ARQUIVO" datilografado e o "3:33" vermelho).

## Formato e receita (aprovado pelo Vito em 26/10/2026, a partir do vídeo-modelo youtu.be/5HwmrSwNY-Y)
- **O que é:** animação 3D estilo desenho, feita inteira em código pelo motor do projeto (`src/motor3d/`, three.js): personagens de cabeça grande, cidade de brinquedo à noite, câmera em terceira pessoa, cortes rápidos e "medidas na tela" (contadores). Ele gostou da voz (Gideon), da legenda e da edição; o visual com imagens de IA (Higgsfield) foi reprovado.
- **Passo a passo:** na skill `arquivo-333` (`.claude/skills/arquivo-333/` no repositório). O resumo do dia a dia está em `ROTINA-DIARIA.md`.
- **Peças do motor:** `boneco.ts` (personagens e poses), `cenario.ts` (cidade com a torre e o quarto do 12º andar; quarto por dentro), `portaria.ts` (térreo com o Rafa), `planos.ts` (as tomadas de câmera) e `Mundo3D.tsx`. Para testar um plano: `node ferramentas/planos.mjs nome:segundo:duracao`.
- **Onde fica (desde 26/10/2026):** `4-midia/posts-automaticos/arquivo-333`, dentro do repositório público `vito0067/origem-digital-posts`, para a nuvem conseguir trabalhar sozinha. A pasta antiga `4-midia/canal-viral` virou esta.
- **Custo:** só a voz, de 0,5 a 2 créditos por episódio. Renderizar leva cerca de 1,5 min.

## Ritmo
- **Episódio novo:** 1 por dia, às 20h.
- **Temporada:** cada série tem de 10 a 12 episódios. Ideias para as próximas: "O Último Ônibus", "O Elevador do 7º", "Ilha sem Sinal".

## Regras (para não ter problema com as plataformas)
- **Ficção sempre avisada:** "Ficção · criada com inteligência artificial" no fim de cada vídeo e na bio. O rótulo de conteúdo com IA fica ligado no Instagram, no TikTok e no YouTube.
- **Nada que pareça notícia de verdade:** nada de órgão do governo, marca real, pessoa real ou "alerta oficial" com nome de instituição.
- **Música e imagens só nossas:** trilha composta em código, imagens e vídeos gerados para o perfil.
- **Público:** adulto ou geral, nunca "conteúdo para crianças".

## Publicação (desde 26/10/2026)
- **TikTok e YouTube:** agendados pelo Chrome (perfil do e-mail da Origem), com o agendador das plataformas, até 10 dias antes. As APIs só deixam robô publicar como privado.
- **Instagram:** n8n "Arquivo 3:33 - Publicar Instagram" às 20h, quando a chave da conta estiver no n8n. Até lá, pelo Chrome às 20h.
- **Tudo:** skill `arquivo-333`, arquivo `referencia/nuvem.md`.
