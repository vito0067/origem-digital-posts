# Voz do narrador: acentuação e pausas

Pedido do Vito (02/11/2026): a voz tem de ter a sílaba tônica certa e as falas bem separadas, sempre. Ele ouviu "celular" com a tônica no C. **Nós não ouvimos áudio**: só dá para prevenir antes de gerar e pedir ao Vito que ouça os trechos de risco depois.

## Antes de gerar a voz (obrigatório)
1. Rode `node ferramentas/revisar-voz.mjs episodios/epNN.json`. Se achar palavra PROIBIDA, troque na `fala` e na `legenda`.
2. Leia cada fala procurando o que a voz costuma errar:
   - **oxítonas** (tônica na última sílaba): celular, jornal, apagão, moletom, elevador, papel, hotel, lençol;
   - **nomes e siglas**: prefira não falar. Só nomes já testados: Marina, Bia, Rafa, Álvaro, Cida;
   - **números e ordinais** por extenso ("décimo terceiro", "três e trinta e três"), nunca "13º" ou "3h33" na `fala`;
   - **palavra estrangeira**: fica fora.
3. Uma fala por turno, frase curta, ponto em vez de vírgula quando der. A tag `<break>` não funciona: a pausa vem de separar em turnos e do `segura` da cena.
4. Se a palavra de risco é indispensável, a ordem é: (a) trocar por outra; (b) mudar a frase para a palavra não ficar no começo nem no fim da fala; (c) só então deixar e avisar o Vito.

## Depois de gerar
Diga ao Vito, em uma lista curta, **quais palavras vigiadas ficaram em cada episódio e em que fala**, e peça que ele ouça esses trechos. Só ele confirma. Se ele apontar um erro, troque a palavra, gere de novo só aquele episódio e acrescente a palavra à lista abaixo.

## Palavras proibidas ou com troca (aumentar a cada erro)
| Palavra | Problema | Use |
|---|---|---|
| celular | a voz põe a tônica no C ("CElular"), reclamação do Vito em 02/11/2026 | telefone (ou "o aparelho"). Na tela, nas mensagens e no `dado`, "celular" continua valendo: só a voz muda |

## Vigiadas (sem erro confirmado ainda)
jornal, apagão, moletom, elevador, síndica, degraus. Se o Vito confirmar um erro, passe para a tabela de cima.

## Onde isso vale
- Rotina da nuvem "Produção": leia este arquivo antes de gravar a voz e inclua no resultado da rodada as palavras vigiadas de cada episódio, para o Vito ouvir.
- Hoje Sumiu: a skill dele tem regra parecida; a lista de palavras proibidas é compartilhada.
