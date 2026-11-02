# Publicar e agendar o Arquivo 3:33

**Quem publica onde:**
- **YouTube:** agendado pelo Chrome, porque um robô só publica como privado até a plataforma auditar o aplicativo. O agendador do YouTube publica sozinho às 20h, mesmo com o computador desligado.
- **Instagram:** automático pelo n8n desde 02/11/2026 (veja a seção Instagram abaixo). Não publique pelo Chrome sem antes conferir que o fluxo falhou.
- **TikTok:** só o Vito, pelo celular. Em `agendados.json`, o status é "com o Vito, pelo celular".

## Antes de tudo
- **Navegador certo:** o perfil Origem do Chrome, deviceId `241d2700-ec5d-4a9d-af45-bb1a9b3718bf` em `select_browser`, logado no Arquivo 3:33 nas 3 redes desde 01/11/2026. Os nomes "Browser 1" e "Browser 2" em `list_connected_browsers` mudam a cada conexão, então não escolha pelo nome. O deviceId `117dcc99-…` é o perfil Trabalho, com o @origem__digital.
- **Conta certa:** antes de agendar ou publicar, confira se a conta ativa é a arquivo333.0 (no YouTube, o canal Arquivo 3:33). Se for outra, não publique nada: registre e avise o Vito.
- **NUNCA** publique no @origem__digital nem no @hojesumiu.
- **Abas:** crie uma aba sua (`tabs_create_mcp`) e não mexa nas abas que o Vito estiver usando.
- **Arquivos:** copie a cópia leve (`<id>-upload.mp4`, menos de 10 MB) e a capa (`<id>-capa.jpg`) para `C:\Users\User\Desktop\Origem-Digital\arquivo-333-envios\`.
  - Se o episódio foi feito na nuvem, baixe do Pages: `https://vito0067.github.io/origem-digital-posts/arquivo/<id>.mp4` e `-capa.jpg`.
  - Ou baixe do release `https://github.com/vito0067/origem-digital-posts/releases/download/arquivo-<id>/<id>-upload.mp4`.
- **Antes de confirmar:** veja o nome da conta na tela.
- **Folga:** agende tudo o que já estiver renderizado até 10 dias à frente. Quanto mais folga, menos o computador precisa estar ligado.

## TikTok (tiktok.com/tiktokstudio/upload)
**Regra do Vito (01/11/2026): NÃO publique nem agende por aqui.** Ele posta pelo celular, com o kit de `node ferramentas/kit-celular.mjs N`. Os passos abaixo ficam só como referência.

1. Ache o input de arquivo com `find` e faça `file_upload` do mp4.
2. Feche o aviso "Veja a prévia…" (Entendi).
3. **Descrição:**
   1. clique no campo, ctrl+a, Delete;
   2. digite a legenda sem as hashtags;
   3. digite cada hashtag seguida de espaço, uma por vez.
4. **Capa:** "Editar capa" → `find` "Upload cover image" (input) → `file_upload` da capa → "Salvar".
5. **Agendar:**
   1. "Quando publicar" → Programar → "Permitir";
   2. data: clique no dia;
   3. hora: clique em 20 e role a coluna dos minutos até 00.
6. "Exibir mais" → ligue "Conteúdo gerado por IA" (o botão fica azul).
7. Clique em "Agendar". Confira em "Publicações": aparece "27 de out, 20:00", por exemplo.
- **Limites:**
  - agendar vai só até uns 10 dias;
  - o nome do perfil só muda a cada 7 dias (o próximo a partir de 2/11/2026);
  - conta nova pode ficar "em análise" algumas horas.
- **Agendado não pode ser editado:** só excluir. Para trocar um vídeo agendado, publique o novo e peça ao Vito para excluir o antigo; depois de publicado, dá para deixar em "Somente eu".
- **ATENÇÃO (29/10/2026): a conta estava sem distribuição; em 30/10 voltou a dar sinal** (0% de "Para você", 1 a 2 visualizações por vídeo). Continue agendando para manter a série em dia, mas leia "TikTok travado" em `viral.md`: o conserto depende do Vito no celular.

## YouTube (studio.youtube.com, canal UCp1qPtKzd1zkQr04_J4xIHw)
1. Vá em `…/videos/upload?d=ud`, ache o input de arquivo e faça `file_upload`.
2. **Título:** triplo clique no título e digite. **Não use ctrl+a**: ele seleciona a página inteira.
3. **Descrição:** clique e digite. Se abrir a lista de hashtags, clique no título "Detalhes" para fechar. Esc fecha o envio inteiro.
4. **Miniatura:** "Enviar arquivo" não funciona sem verificar o canal por telefone. Use "Selecionar no vídeo" e escolha o quadro mais forte.
5. **Playlist:** "O Sinal · Temporada 1 (em ordem)".
6. **Público:** "Não é conteúdo para crianças". Depois "Mostrar mais" → Uso de IA = **Sim**.
7. Clique em "Avançar" 3 vezes.
8. **Agendar:**
   1. "Programar";
   2. clique uma vez na hora (abre a lista), ctrl+a, digite 20:00 e Enter. **Olhe se ficou 20:00 antes de clicar em Programar**: o triplo clique às vezes não pega e fica 00:00;
   3. confira a data;
   4. Fuso horário = (GMT-0300) Horário local.
9. Clique em "Programar". Confira em Conteúdo → Shorts ("Programado").
- **Depois que o episódio sair:**
  - em Editar → "Vídeo relacionado", ligue o episódio NOVO ao anterior e o anterior ao novo, para quem chega maratonar;
  - fixe um comentário que puxa resposta: "Quem você acha que é o remetente? 👀 Episódio N+1 sai amanhã às 20h, e a série completa está na playlist." Comentário conta muito no algoritmo, e pergunta gera comentário.

## Instagram (instagram.com, conta de CRIADOR desde 26/10/2026)
- **Automático (desde 02/11/2026):** o fluxo do n8n "Arquivo 3:33 - Publicar Instagram" (U5ZEYtmvwySTwvAj) está LIGADO e publica todo dia às 20h o episódio do `agenda.json`, com a credencial "Instagram — token arquivo333".
  - **Onde lê:** `https://vito0067.github.io/origem-digital-posts/arquivo/agenda.json` e o vídeo e a capa do Pages (`o-sinal-epNN.mp4`). Antes das 20h, confira que o mp4 do Pages é a versão certa (compare o tamanho com a cópia leve do release).
  - **Não publique pelo Chrome**, para o episódio não sair duas vezes. A tarefa das 19h50 já checa se o fluxo está ativo.
  - **Conferir depois das 20h10:** a tabela `public.arquivo_instagram` (status `publicado`, com o link) e o `agendados.json`. Se falhar, o fluxo avisa o Vito no WhatsApp; só então vale publicar pelo Chrome, depois de conferir no perfil que o episódio não saiu.
  - **Rótulo de IA:** a API do Instagram não tem o botão. O aviso fica na legenda e no cartão final do vídeo: todo episódio precisa dos dois.
  - **Chave:** vence em cerca de 60 dias (renovar até ~01/01/2027). Quando vencer, o fluxo falha e avisa o Vito.
- **Pelo navegador (plano B; o site não agenda):**
  1. "Criar" → Post → input de arquivo → `file_upload` do mp4 → OK no aviso de reels.
  2. Recorte "Original" (9:16) → Avançar.
  3. "Capa" → "Selecionar do computador" → a capa → Avançar.
  4. Cole a legenda.
  5. "Configurações avançadas" → ligue "Adicionar rótulo de IA".
  6. Clique em "Compartilhar".
- **Fixar o ep. 1 no perfil:** só pelo app do celular. Peça ao Vito se ainda não estiver fixado.

## Depois de publicar ou agendar
Anote em `publicacao/agendados.json` (rede, "agendado DD/MM HHhMM" ou "publicado …" com link) e em `publicacao/epNN.md`. Depois commit e push.
