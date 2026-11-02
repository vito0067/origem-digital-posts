# O Arquivo 3:33 rodando sozinho (nuvem + agendadores)

## Quem faz o quê
1. **Rotina na nuvem "Arquivo 3:33 · Produção"** (claude.ai, todo dia às 10h de Brasília, sem precisar do computador):
   - revisa o que a nuvem renderizou desde a última vez (`publicacao/render/epNN-revisao.jpg`) e corrige;
   - escreve o próximo episódio e grava a voz (Higgsfield);
   - dá push no `episodios/epNN.json`.
   - Mantém **de 3 a 5 dias de folga**: no máximo 2 episódios novos por rodada, até a data do último ficar ≥ hoje + 3.
2. **GitHub Action "Arquivo 3:33 · renderizar episódios"** (`.github/workflows/arquivo-333.yml`):
   - roda a cada push em `arquivo-333/episodios/` e chama `ferramentas/nuvem.mjs`;
   - renderiza com WebGL por software (`GL=swangle`, sem placa de vídeo). É lento: uns 40 min ou mais por episódio.
   - Sobe para o release `arquivo-<id>`: cópia leve, capa, folha de revisão e narração.
   - Anota em `publicacao/render/` (`epNN.json`, `epNN-revisao.jpg`, `agenda.json`, e `epNN-erro.txt` se falhar).
   - Põe no Pages os vídeos de ontem até daqui a 10 dias (`ferramentas/pages.mjs` → `docs/arquivo/`).
3. **Tarefa do computador "Arquivo 3:33 · agendar nas redes"** (app do Claude aberto):
   - baixa do Pages ou do release o que já foi renderizado e ainda não foi agendado;
   - agenda no YouTube para as 20h da data (veja `publicar.md`);
   - monta o kit do TikTok para o Vito postar pelo celular (`ferramentas/kit-celular.mjs N`); nunca publica nem agenda no TikTok;
   - anota em `publicacao/agendados.json`.
   - Com a folga, o computador pode ficar dias desligado sem perder post.
4. **Instagram:**
   - **n8n "Arquivo 3:33 - Publicar Instagram":** todo dia às 20h lê `https://vito0067.github.io/origem-digital-posts/arquivo/agenda.json` e publica o Reel do dia, com rótulo de IA e legenda.
   - Precisa da credencial "Instagram — token arquivo333". Até ela existir, a tarefa das 19h50 publica pelo Chrome.

## Voz da rotina
Antes de gravar a voz, leia `referencia/voz.md` e confira as falas com a lista de palavras proibidas (a rotina roda no GitHub, sem ouvir áudio). Se o terminal permitir, rode `node arquivo-333/ferramentas/revisar-voz.mjs arquivo-333/episodios/epNN.json`. No resultado da rodada, liste as palavras vigiadas de cada episódio para o Vito ouvir.

## Limites da nuvem (aprendidos)
- **Rede da rotina:** o terminal só alcança o GitHub, então não dá para baixar o mp3 nem renderizar ali.
  - A rotina só escreve o JSON e a Action faz o resto.
  - A revisão do vídeo fica para a rodada seguinte (por isso a folga de 3 dias).
- **Push na rotina:** pode cair em "HEAD detached". Use `git push origin HEAD:main` (faça `git pull --rebase` antes).
- **Planos novos sem ver a imagem:** se a rotina criar um plano novo, ela só vê o resultado na folha de revisão do dia seguinte.
  - Prefira os planos prontos.
  - Planos novos devem ficar perto dos que já funcionam (mesmas distâncias e fov).
- **Renderizar de novo:** mude qualquer coisa no `epNN.json` (pode ser `"versao": 2`) e dê push. A Action só refaz os que mudaram (compara um hash).
- **Só trocar a legenda, sem renderizar:** no mesmo commit, atualize o `hash` e a legenda em `publicacao/render/epNN.json` e a legenda em `render/agenda.json`. O hash são os 12 primeiros caracteres do SHA-1 do `epNN.json`.
- **Rascunho:** `"rascunho": true` no `epNN.json` faz a Action pular o episódio.

## Conferir se está tudo andando
- **Renderização:** `publicacao/render/agenda.json` deve ter episódios até hoje + 3.
- **Agendamento:** `publicacao/agendados.json` deve ter o YouTube agendado até onde houver vídeo e o TikTok como "com o Vito, pelo celular".
- **Se a Action falhou:** leia `publicacao/render/epNN-erro.txt`, corrija o JSON ou o código e dê push.
