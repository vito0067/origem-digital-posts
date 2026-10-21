# Fábrica de posts da Origem Digital

Transforma um arquivo de texto (`fila/<id>/post.json`) em um post pronto para o Instagram: Reels (vídeo 1080x1920 com trilha composta em código) ou carrossel/foto (1080x1350). Tudo na marca Gelo.

## O caminho de um post
1. A rotina na nuvem "Cérebro · Social media" escreve `fila/<id>/post.json` e dá push (segunda e quinta, 9h).
2. O GitHub Actions (`.github/workflows/posts.yml`) renderiza, guarda em `docs/<id>/` e publica a prévia no GitHub Pages:
   `https://vito0067.github.io/origem-digital-posts/<id>/`
3. Avisa o n8n, que manda a prévia e os links ✅ Aprovar / ❌ Recusar no WhatsApp do Vito.
4. O n8n publica no Instagram no dia e hora de `publicar_em` (só os aprovados) e avisa com o link.

As mídias com mais de 30 dias são apagadas daqui (o Instagram guarda a cópia dele).

## Formato do post
Veja `src/post/tipos.ts` (os tipos de cena) e `src/post/exemplo.ts` (um exemplo completo).
Antes de dar push: `node ferramentas/validar-fila.mjs` (confere preços, aviso de exemplo, Aurora como IA, limites do Instagram).

## No computador
- Ver e mexer nos modelos: `npm run previa` (abre o estúdio do Remotion).
- Renderizar um post: `node ferramentas/renderizar.mjs fila/<id>/post.json` (sai em `docs/<id>/`).
- Fotos de um Reels para conferir: `node ferramentas/fotos.mjs fila/<id>/post.json <pasta> 2 5 10`.

O Remotion é grátis para empresas de até 3 pessoas.
