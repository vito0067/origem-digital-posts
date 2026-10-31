---
name: atualizar-skills
description: Revisa e atualiza todas as skills do Vito para ficarem iguais à realidade: junta o que foi aprendido e combinado na conversa, confere cada regra contra o código, os arquivos e as contas de verdade, corrige o que estiver velho e registra as lições novas. Use sempre que o Vito pedir para atualizar, melhorar, arrumar ou conferir as skills, ou disser "guarda isso na skill" ou "deixa tudo atualizado". Use também ao terminar um trabalho longo em que uma regra, um preço, um processo ou uma lição mudou.
---

# Atualizar as skills

O objetivo é simples: a próxima sessão, aqui ou na nuvem, não pode repetir um erro já corrigido nem seguir uma regra velha. Responda ao Vito em português simples.

## Onde ficam
Descubra na hora, porque podem aparecer novas:
- **Repositório de posts:** `Documents\Origem Digital\4-midia\posts-automaticos\.claude\skills\` (`arquivo-333`, `revisao-arquivo-333`, `hoje-sumiu`, `atualizar-skills`). São as que a nuvem também lê. Em `~\.claude\skills\` ficam só os atalhos para elas.
- **Pessoais:** `~\.claude\skills\`.
- **Tarefas agendadas do PC:** `~\.claude\scheduled-tasks\*\SKILL.md`. Também são instruções e também envelhecem.
- **Skills `anthropic-skills:*`:** vêm prontas e não são editadas aqui. A `origem-digital` está desatualizada (e-mail e arquivos de preço): se o assunto tocar nela, avise e confie no código.
- **Outros manuais que precisam concordar com as skills:** `arquivo-333/series/*.md`, `arquivo-333/PLANO.md`, `arquivo-333/ROTINA-DIARIA.md`, o `CLAUDE.md` e a memória em `~\.claude\projects\*\memory\`.

## Como fazer
1. **Junte o que mudou:** leia a conversa atual, o `git log` recente do repositório e `0-cerebro/memoria/pendencias.md`. Liste as decisões do Vito, os erros corrigidos e o que passou a funcionar diferente.
2. **Leia a skill inteira antes de mexer.** Nunca atualize só pelo título.
3. **Confira cada regra contra a fonte real:**
   - caminho de arquivo, nome de plano, comando: existe mesmo? (`ls`, `grep`);
   - número, preço, prazo: bate com o contrato e com `lib/precos.ts`?
   - passo a passo de site: foi o que funcionou na última vez?
4. **Corrija no lugar certo:**
   - Regra que vale sempre vai para a skill. O que muda toda semana (números, status) fica em `publicacao/` ou no cérebro.
   - Troque a regra velha pela nova, não acrescente uma que a contradiga. Procure a mesma regra nos outros arquivos com `grep` e corrija todos.
   - Escreva o porquê quando ele evita erro futuro ("o triplo clique às vezes não pega e fica 00:00").
   - Mantenha a skill curta: o que é muito detalhado vai para `referencia/`.
   - A `description` precisa dizer quando usar, com as palavras que o Vito usaria.
5. **Não invente:** só registre o que foi visto funcionando ou o que o Vito decidiu. Hipótese fica marcada como hipótese.
6. **Segurança:** nunca escreva senha, chave, token, CPF ou endereço. O repositório de posts é público.
7. **Salve:** skill nova também ganha atalho em `~\.claude\skills\` (junção, igual às outras), e faça commit e push no repositório, para a nuvem receber. O push vale só para esse repositório de posts e o do cérebro; o site da Origem continua seguindo a regra dele.
8. **Skill nova ou só atualizar?** Crie uma nova apenas quando o assunto se repete e não cabe em nenhuma das que existem.

## Entrega
Diga em poucas linhas: o que estava velho e foi corrigido, o que foi acrescentado, e o que ficou em dúvida para o Vito decidir. Se nada mudou, diga que está tudo em dia.
