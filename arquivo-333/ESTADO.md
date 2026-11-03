# Arquivo 3:33: estado atual

Atualizado em 02/11/2026, às 09h. Leia antes de mexer e atualize a cada rodada. O repositório é público: nada de dados pessoais, senhas ou tokens.

## Agora
- **Série:** O Sinal, temporada 1. O ep. 7 saiu hoje; o ep. 8 sai em 02/11.
- **Próximo passo:** eps. 11 (05/11) e 12 (06/11) escritos e com voz em 03/11 (a Action renderiza); agendar e decidir o que vem depois de 06/11. Ainda não há série seguinte escrita.

## Situação por rede
| Rede | Como sai | No ar até | Agendado | Falta |
|---|---|---|---|---|
| YouTube | agendado pelo Chrome | ep. 7 | eps. 8, 9 e 10 (versões com a aposta; ep. 9 com a voz refeita; as antigas ficaram privadas) | vídeos relacionados e comentários fixados |
| Instagram | **n8n, sozinho às 20h (ligado em 02/11)**; Chrome só se falhar | ep. 7 | o fluxo lê o `agenda.json` do Pages | provar a 1ª publicação real (ep. 8, 02/11 às 20h) na tabela `public.arquivo_instagram` |
| TikTok | **o Vito, pelo celular** | ep. 7 | ep. 8 (agendado antes da regra) | postar os eps. 9 e 10 com os kits |

## Quando O Sinal acabar (ep. 12, 06/11)
- **Recomendação, ainda sem a decisão do Vito:** continuar neste mesmo perfil, com uma série nova e curta, "Caso 02", de 8 a 12 episódios, começando em 07/11, sem dia vazio.
- **Por quê:** o nome "Arquivo" já comporta vários casos, e um perfil novo perderia os seguidores conquistados.
- **Ligação:** o ep. 12 fecha a história e anuncia o Caso 02.
- **Filme:** o filme de O Sinal sai no YouTube depois da temporada fechada, durante o Caso 02, se o Vito confirmar o formato.
- **Prazo:** o tema do Caso 02 precisa estar decidido até 04/11, para dar tempo de escrever a bíblia e fazer os cenários.

## Conta certa
- **Chrome:** perfil Origem, `select_browser` com o deviceId `241d2700-ec5d-4a9d-af45-bb1a9b3718bf`. Não escolha pelo nome: "Browser 1" e "Browser 2" mudam.
- **Contas:** Instagram e TikTok @arquivo333.0; YouTube no canal Arquivo 3:33.
- **Risco real:** o Hoje Sumiu usa o mesmo perfil do Chrome, e o login troca durante o dia. Em 01/11, às 21h25, o Instagram e o TikTok estavam no Hoje Sumiu. Olhe a conta na tela antes de confirmar. Se for outra, não publique: registre e avise o Vito.

## Regras novas
- **TikTok (Vito, 01/11/2026):** nunca publique nem agende pelo computador. Para cada episódio, rode `node ferramentas/kit-celular.mjs N` e diga onde está a pasta. No TikTok, só leia os números.
- **Divulgação do guia "Sem Câmera" (02/11/2026):** os eps. 8 a 10 ganharam um cartão falado de ~7 s no meio (cena `avulsa`, voz do Gideon, título SEM CÂMERA / GUIA EM PDF / LINK NA BIO) e a frase "Guia para fazer vídeos assim: link na bio." nas legendas. Os vídeos passaram de 61 s. Regra na skill. No YouTube: ep. 8 (02/11) e ep. 9 (03/11) já estão com a versão nova programada e as antigas privadas; **ep. 10 ainda não** (o YouTube barrou o upload por limite diário em 02/11): em 03/11 subir a versão nova (`saida/o-sinal-ep10-upload.mp4` ou o release `arquivo-o-sinal-ep10`), programar 04/11 20h00 e deixar o `AXzqVed_Tiw` e o rascunho antigo privados.
- **Aposta:** todo episódio tem uma pergunta ligada à cena. Do ep. 8 em diante, ela está na legenda, no comentário fixado e no cartão final (extra `aposta`). Em 02/11, os eps. 8 a 10 foram renderizados de novo com a aposta; no YouTube, a versão nova entra programada e a antiga fica privada, sem excluir. Só opinião: não muda a história.

## Riscos
- **Chrome trocando de perfil:** em 02/11, a conexão do Chrome mudou várias vezes para o perfil Trabalho (`117dcc99…`) no meio de um envio. As ferramentas recusam agir fora do grupo de abas, mas refaça `select_browser` com o deviceId da Origem e confira a conta antes de cada passo; use passos curtos.
- **Tarefas paradas:** as tarefas do PC podem parar pedindo permissão. Em 01/11, as duas ficaram paradas das 19h15 às 20h20 e o ep. 7 só saiu no Instagram pela conversa principal. Encerrar uma rodada parada pode iniciar outra na hora: antes de publicar à mão, confira se há rodada aberta, para o episódio não sair duas vezes.
- **Instagram automático (02/11/2026):** o fluxo U5ZEYtmvwySTwvAj foi ligado e a chave lê a conta certa, mas a publicação real só será provada às 20h do ep. 8. O aviso de erro no WhatsApp pode não chegar (o chip `demo-aurora2` está com "Connection Closed" desde pelo menos 01/11): depois das 20h10, **confira sempre a tabela `public.arquivo_instagram`**. Se falhar, vale o Chrome, depois de conferir no perfil que o episódio não saiu antes. A API não tem o rótulo de IA: o aviso fica na legenda e no cartão final. **A chave vence em ~60 dias: renovar até ~01/01/2027.**

## Pendências
- **Do Vito:** excluir o ep. 8 agendado no TikTok até 02/11 às 20h e postar pelo celular; escolher o tema do Caso 02; postar os eps. 9 e 10 pelo celular; renovar a chave do Instagram até ~01/01/2027; verificação em 2 etapas no Google; separar o Hoje Sumiu em outro perfil do Chrome.
- **Do Claude:** vídeos relacionados e comentários fixados no YouTube; ler a retenção no YouTube Studio e registrar em `publicacao/numeros.md`; eps. 11 e 12; planejar o filme de O Sinal (só plano, sem gastar créditos até o Vito confirmar o formato).

## Números de 01/11/2026
- **Seguidores:** Instagram 86, YouTube 57, TikTok 2.
- **O que funciona:** o ep. 2 fez 10,3 mil no Instagram, contra 556 a 1.562 dos outros. A diferença é a primeira tela: imagem forte, número e mistério.
- **Histórico:** `publicacao/numeros.md`.

## Mapa
Manual: skill `arquivo-333` (`.claude/skills/arquivo-333/`). Registro por episódio: `publicacao/agendados.json` e `publicacao/epNN.md`. História: `series/o-sinal.md`.
