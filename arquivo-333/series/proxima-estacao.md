# Série "Próxima estação" (Arquivo 3:33): bíblia com voto do público

Escolhida pelo Vito em 05/11/2026. Base: o piloto de 04/11 (`pilotos/estacao-v2.json`). **Cada episódio termina com um voto ("Comente 1 se ela desce, ou 2 se ela fica."), e o voto decide o próximo episódio.** O episódio seguinte só é escrito DEPOIS de ler os votos do anterior.

> **Roteiros dos eps. 2 a 7 aprovados pelo Vito em 08/11/2026:** `series/proxima-estacao-roteiros.md` (2 roteiros por episódio, escolhidos pelo voto; a bíblia continua mandando). **Lia ganha voz própria só nas falas marcadas "Lia (voz própria)" no ep. 7** (voto 1: ela diz no microfone "Tem alguém aí?"; voto 2: a mesma frase sai do alto-falante sem ela falar); testar 3 vozes femininas baratas (MiniMax ~0,15; ElevenLabs ~0,23) com o /watch e o Vito escolhe de ouvido. **Variar o susto:** o relógio 3h33 não pode aparecer em todo episódio; trocar algumas aparições por outro sinal estranho.

## Regras do mundo (nunca quebrar)
- **A linha cinza** tem 12 estações no mapa. Às 3h33 do último trem, o trem para numa **13ª estação que não está no mapa**.
- **A 13ª estação nunca é a mesma:** o painel diz "13", mas o lugar muda. Cada vez que a Lia desce, vê algo que já viu (ou vai ver) na vida dela.
- **Quem fica olhando o trem** na plataforma são pessoas comuns, paradas, com a mesma expressão. Se a Lia desce, elas dão um passo para trás; se ela fica, dão um passo para a frente.
- **O anúncio** (a voz da Vera, filtro de alto-falante) é seco e mecânico. Ele nunca mente e nunca explica.
- **A Lia:** 27 anos, enfermeira do turno da noite, volta para casa no último trem. Teimosa, cansada, desconfiada. Nunca age por impulso sem antes olhar o relógio (3h33).
- **O narrador** é o Gideon (terceira pessoa, "a Lia...", "ela..."). Nunca "eu".
- **Voto:** só "1" ou "2". Conta-se IG + YouTube + TikTok; vale o que tiver mais votos. Empate: o do Instagram. Sem votos: decide o Vito.

## Formato de cada episódio (30 a 55 s)
- **Abertura:** imagem estranha + número em destaque no 1º segundo (nunca vagão vazio e escuro).
- **Voz:** narrador + o anúncio do trem. Pergunta final com voto, falada (pelo anúncio) e escrita no cartão.
- **Câmera:** closes afastados (meio corpo, cabeça inteira com folga). A expressão muda com a fala: medo, desconfiança, alívio, choro contido, determinação.
- **Legenda:** painel luminoso, 2 palavras, medo em vermelho e maior (confirmar com o Vito depois de alguns episódios).
- **Divulgação:** "Feito sem câmera. Comente GUIA e eu te mando." no meio, menos de 4 s (só depois do aviso de que o fluxo de respostas está no ar).

## Rotina do voto (todo dia)
1. **~18h:** ler os comentários do episódio de ontem no Instagram, YouTube e TikTok e contar "1" e "2".
2. Registrar a contagem em `publicacao/votos.md` (data, ep., 1, 2, total, vencedor).
3. Escrever o episódio de hoje no caminho vencedor, renderizar, **mandar ao Vito e esperar a aprovação** (`publicacao/aprovados.json`).
4. Publicar às 20h (Instagram pelo Chrome, YouTube agendado; TikTok o Vito).

## Arco em losango (para o voto não explodir)
Cada episódio abre 2 caminhos, e os caminhos **se reencontram** no fim de cada bloco de 3 episódios, para a história continuar coerente.

### Bloco 1 (eps. 1 a 3): "A 13ª estação"
- **Ep. 1 (piloto):** a Lia acorda, o trem para na 13ª, a plataforma cheia olha o trem. Voto: **1 desce / 2 fica**.
- **Ep. 2A (desceu):** a plataforma recua. No banco, uma bolsa igual à dela, com a data de amanhã. Voto: **1 abre a bolsa / 2 deixa a bolsa**.
- **Ep. 2B (ficou):** as portas fecham e o trem segue, mas o mapa agora tem a 13ª no meio. Alguém no vagão que não estava ali. Voto: **1 fala com a pessoa / 2 muda de vagão**.
- **Ep. 3 (reencontro):** nos dois caminhos, o anúncio diz "Próxima estação: a sua". A Lia vê o próprio nome no painel. Voto: **1 desce na estação com o nome dela / 2 puxa o freio de emergência**.

### Bloco 2 (eps. 4 a 6): "Quem anuncia"
- A Lia descobre que a voz do anúncio é a gravação de uma passageira que sumiu em 1993 (o último trem de 93). Dois caminhos: seguir a passageira (4A) ou encontrar o maquinista (4B). Reencontro no ep. 6: a cabine do maquinista está vazia e a voz vem do alto-falante, em tempo real.

### Bloco 3 (eps. 7 a 9): "O relógio"
- Todo o 3h33 vira 3h34 quando alguém desce. A Lia percebe que cada descida "apaga" uma pessoa do trem. Dois caminhos: salvar o passageiro da plataforma (7A) ou salvar a si mesma (7B). Reencontro: o último trem volta sem ninguém.

### Bloco 4 (eps. 10 a 12): "A última estação"
- A 13ª estação revela o que é: a linha cinza do futuro da cidade. Final com 2 finais possíveis, decidido pelo voto do ep. 11 (fica no trem para sempre / desce e fecha a linha).

## Episódio 1 (07/11/2026): "A 13ª estação" (`episodios/pe01.json`, id `proxima-estacao-ep01`)
O Vito decidiu em 07/11 que o piloto vira o ep. 1 oficial, refeito para assustar mais (Caso 02). ~52 s.
- Roteiro (Gideon): "Às três e trinta e três, o último trem parou numa estação que não existe." / "A Lia tinha dormido no caminho. Quando acordou, o vagão estava vazio." / (Vera) "Próxima estação: treze." / "Ela procurou no mapa. A linha cinza só tem doze estações." / divulgação GUIA / "Então o trem parou. E o barulho parou junto." / "Pela janela, a plataforma estava cheia. Todos olhavam para ela." / "No relógio da parede, três e trinta e três. O ponteiro não se mexia." / "As portas abriram sozinhas." / "E todos, ao mesmo tempo, deram um passo para a frente." / "A porta não ia ficar aberta para sempre." / (Vera) "Porta aberta. Comente um se ela desce, ou dois se ela fica."
- Fatos que o ep. 2 precisa respeitar: o relógio da plataforma parado em 3h33; as portas abertas; a plataforma deu UM passo para a frente (rostos agora retos, luz vermelha); a Lia está em pé no corredor, olhando a porta; luzes do vagão quase todas apagadas.
- Planos novos no motor (`pilotos.ts`, prefixo `pe_`): gancho no rosto colado na janela (olhos vazios, cabeça que estala no fim), Lia em meio corpo (`liaMeio`), luzes apagando uma a uma, relógio 3h33, o passo com tremor e luz vermelha. Sons novos: freio, passo, portaMetro, respira; `silencio: true` na cena tira o clima.

## Para decidir com o Vito
- Quando começa (data do ep. 1) e se o ep. 1 já é o piloto.
- Se o episódio de cada voto sai no dia seguinte ou com 2 dias de intervalo (mais tempo para ler os votos).
- Duração (30 s ou 48 a 58 s).
