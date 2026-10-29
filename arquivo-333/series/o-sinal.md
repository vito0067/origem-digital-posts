# Série "O Sinal" (Arquivo 3:33): roteiro mestre

## Regras do mundo (nunca quebrar)
- **O horário:** as mensagens chegam sempre num minuto que termina em 33 (3h33, 4h33…) e vêm de um "Remetente desconhecido".
- **Quem olha é visto:** quem olha pela janela à noite passa a ser fotografado de fora, do alto, onde não existe prédio nem drone.
- **O remetente sabe o nome de todo mundo.** Ninguém descobre quem é antes do último episódio.
- **A Marina é a protagonista:** 28 anos, mora sozinha no apto 1203, 12º andar, do **Ed. Mirante**, de frente para um parque, na Zona Oeste de São Paulo. Aparece sempre igual (moletom cinza, calça azul-marinho, cabelo castanho chanel). No motor 3D ela é `APARENCIAS.marina`.
- **Quem narra é o Arquivista (desde 26/10/2026):** voz masculina grave (Gideon, Eleven v4), em terceira pessoa ("A Marina...", "ela..."). Nunca "eu".
- **Personagens fixos:**
  - Seu Álvaro, do 1201: aposentado e curioso.
  - Dona Cida, a síndica: manda áudio no grupo do prédio.
  - Rafa, o porteiro da noite.
  - Bia, do 1102: estudante e a mais corajosa.
- **Cenas em 3D feitas em código** (motor3d, desde 26/10/2026; nada de imagem de IA). Cenários prontos: a cidade com a torre e o parque, o quarto dela e a portaria (com o Rafa, o elevador e as portas de vidro). Personagens prontos: Marina, Rafa, Bia, Seu Álvaro e Dona Cida. O remetente nunca aparece. Os próximos cenários do arco: o corredor do 12º (portas 1201 a 1204, elevador), a escada, o 13º andar e o quarto igual ao dela.
- **Como fazer:** skill `arquivo-333` (`.claude/skills/arquivo-333/` no repositório).

## Formato de cada episódio
- **Tamanho:** de 9 a 11 falas e de 40 a 55 segundos.
- **Abertura:** a 1ª fala é o gancho e conta o "até agora" em uma frase, a partir do episódio 2.
- **Última fala da história:** termina num gancho. Depois vem sempre "Episódio N amanhã. Siga o Arquivo três e trinta e três."
- **Números na fala por extenso** ("três e trinta e três"). Na legenda, em algarismo ("3h33").
- **Na legenda:** destaque em *asteriscos* nas palavras de medo, uma ou duas por fala.

## Arco da temporada 1 (12 episódios)
1. **3h33.** A mensagem "Não olhe pela janela". A segunda mensagem traz o nome dela e uma foto da janela, tirada de fora. Ela mora no 12º andar. ✅ feito
2. **Quem tirou a foto.** A foto foi tirada do ar, de frente para o 12º andar, onde só tem o parque. No grupo do prédio, todo mundo recebeu foto da própria janela. Gancho: o porteiro manda um áudio: "As portas do prédio trancaram sozinhas."
3. **Portas.** Ninguém sai. O elevador para no 12º. O sinal do celular some, menos o do remetente. Nova mensagem: "Amanhã, às 3h33, um de vocês vai olhar." Gancho: a luz do 1201, do Seu Álvaro, acende e a cortina se abre.
4. **1201.** O Seu Álvaro sumiu. A porta está aberta, os espelhos tapados, e na parede está escrito "ELES SÓ VEEM QUEM OLHA". Gancho: chega uma foto da porta da Marina, tirada do corredor, agora.
5. **O corredor.** Ela não abre a porta. A Bia, do 1102, bate e diz "sou eu". Gancho: chega uma mensagem do remetente: "A Bia está no 11º andar com você?"
6. **Duas Bias.** Uma fala pela porta e a outra manda mensagem do 11º. Uma delas não existe. Gancho: as duas mandam a mesma frase ao mesmo tempo.
7. **A síndica.** O áudio da Dona Cida conta que o prédio foi construído em 1983, depois de um apagão que durou 3h33. Gancho: a planta do prédio tem um 13º andar que ninguém conhece.
8. **13º.** A escada termina numa porta sem número. Gancho: atrás dela tem um quarto igual ao da Marina, com a janela aberta.
9. **A janela aberta.** No quarto, um celular recebe todas as mensagens do prédio. Gancho: no histórico, as mensagens de hoje foram enviadas há 40 anos.
10. **1983.** O jornal velho guardado no quarto fala do apagão e de "fotos tiradas do céu". Gancho: uma das fotos de 1983 mostra a Marina.
11. **Remetente.** O remetente pede uma coisa em troca de abrir as portas: "Olhe pela janela." Gancho: ela olha.
12. **3h34.** O que ela vê fecha a temporada e abre a 2ª, já anunciando a próxima série.

## Episódios feitos
- **Ep. 1 · 3h33** (26/10/2026): ver `episodios/ep01.json`.
- **Ep. 2 · Quem tirou a foto** (agendado para 27/10/2026): a foto foi tirada do ar, a 36 m em cima do parque; o grupo do Ed. Mirante tem 40 mensagens e todo mundo recebeu foto da própria janela; a Dona Cida pede para ninguém abrir a cortina; o Rafa manda áudio: "as portas do prédio trancaram sozinhas. Ninguém sai." Ver `episodios/ep02.json`.
- **Ep. 3 · Portas** (28/10/2026): ninguém sai; o elevador desce vazio e para no 12º; sem sinal, menos o do remetente; "Amanhã, às 3h33, um de vocês vai olhar."; a luz do 1201 acende e a cortina do Seu Álvaro abre sozinha. Ver `episodios/ep03.json`.
- **Ep. 4 · 1201** (29/10/2026): o Seu Álvaro sumiu; a Bia acha a porta aberta, sete espelhos tapados e "ELES SÓ VEEM QUEM OLHA" na parede; gancho: foto da porta da Marina, tirada de dentro do corredor, agora. Ver `episodios/ep04.json`.
- **Ep. 5 · O corredor** (30/10/2026): alguém bate na porta da Marina dizendo ser a Bia, mas no grupo a Bia está na escada; pelo olho mágico há alguém de costas; gancho: o remetente pergunta "A Bia está no 11º andar com você?" e as batidas param ("eu ouvi"). Ver `episodios/ep05.json`.
- **Ep. 6 · Duas Bias** (31/10/2026): a Bia na porta e a Bia no 11º; a Marina testa as duas com uma pergunta; gancho: as duas respondem ao mesmo tempo "Não abre. A outra não sou eu." Ver `episodios/ep06.json`.
- **Ep. 7 · A síndica** (01/11/2026): a Dona Cida manda áudio: o prédio foi construído em 1983 depois de um apagão de 3h33; a planta original (que ela guardava na gaveta) tem um 13º andar, mas o último botão do elevador é o 12. Ver `episodios/ep07.json`.
- **Próximo: Ep. 8 · 13º** (02/11/2026): seguir o arco acima.

## (Histórico) Roteiro original do episódio 2, antes da versão final
Falas, cada uma separada por três quebras de linha na gravação:
1. Às três e trinta e três, todo mundo recebeu a mesma mensagem. Mas a Marina recebeu uma foto da própria janela.
2. Ela ampliou a foto. Tinha sido tirada de frente pro décimo segundo andar.
3. Só que na frente do prédio dela não existe prédio nenhum. Só o parque.
4. Quem tirou aquela foto... estava no ar.
5. Ela abriu o grupo do prédio. Quarenta mensagens.
6. Todos os moradores tinham recebido uma foto da própria janela.
7. A síndica pediu pra ninguém abrir as cortinas.
8. Aí o Rafa, o porteiro da noite, mandou um áudio.
9. As portas do prédio trancaram sozinhas.
10. Episódio três, amanhã. Siga o Arquivo três e trinta e três.

Cenas: foto ampliada (s8 com grade de zoom) · NOVA: torre com o parque escuro na frente · v8 de novo com "ALTITUDE 36 m" · quarto (s2) com mensagens do grupo flutuando · mosaico de janelas (recortes de s5) · NOVA: mão fechando a cortina · NOVA: portaria vazia à noite + onda do áudio · NOVO vídeo: portas de vidro trancando sozinhas · cartão final. Custo previsto: ~18 créditos.
