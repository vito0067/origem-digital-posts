# Rotina diária do Arquivo 3:33 (para a tarefa agendada e para qualquer sessão do Claude)

Objetivo: um episódio novo no ar todo dia às 20h (Brasília), no Instagram @arquivo333.0, no TikTok @arquivo333.0 e no YouTube @arquivo333-0. O Vito deu liberdade total: não pedir aprovação para roteiro, cenas nem publicação.

## O FORMATO (o que o Vito aprovou em 26/10/2026, tirado do vídeo-modelo dele, youtu.be/5HwmrSwNY-Y)
- **O que é:** animação 3D estilo desenho, feita INTEIRA em código pelo motor 3D do projeto (`src/motor3d/`, three.js). Personagens de cabeça grande e redonda, cidade de brinquedo à noite, câmera em terceira pessoa passeando, cortes rápidos e uma "medida na tela" (contador ou dado) nos momentos-chave.
- **Imagens geradas por IA (Higgsfield):** NÃO são o visual do episódio. O Vito não gostou: "não ficou do jeito que eu esperava". Só usar a Higgsfield para a VOZ e, no máximo, para algo que o motor não consiga fazer.
- **Mantido da versão anterior (ele gostou):** a voz (Gideon, narrador em terceira pessoa), a legenda (Anton 90 px, amarelo na palavra falada, vermelho no medo) e a edição (cortes, etiqueta datilografada, cartão final).

## 0. Antes de tudo
- Ler `PLANO.md` e `series/o-sinal.md` (bíblia e arco dos 12 episódios). Ver em `episodios/` o último feito e em `publicacao/` o último publicado. O de hoje é o próximo número.
- Se o de hoje já estiver renderizado e só faltar publicar, pular para o passo 5.

## 1. Roteiro
- **Tamanho:** de 9 a 11 falas, em terceira pessoa, de 40 a 55 s.
- **Ganchos:** a 1ª fala resume o "até agora" e já é o gancho; a penúltima termina em gancho.
- **Fala final:** sempre "Episódio N, amanhã. Siga o Arquivo três e trinta e três."
- **Números:** por extenso na fala e em algarismo na legenda.
- **Medo:** palavras de medo entre *asteriscos*.
- **Proibido:** alerta oficial, órgão do governo, marca real, pessoa real, violência explícita, conteúdo infantil.

## 2. Voz
- `generate_audio`, modelo `elevenlabs_v4`, `stability` 0.4 e `similarity_boost` 0.8, uma fala por turno, voz `1ad38ba4-9cc4-4f2f-9fde-b0fefdf67ae5` (Gideon, preset). Custa uns 0,5 a 2 créditos. Salvar em `public/narracao/epNN.mp3`.

## 3. Cenas (motor 3D)
- **Planos:** cada fala usa 1 a 3 planos da biblioteca `src/motor3d/planos.ts`; cortes a cada 1,5 a 3 s. Faltando um plano para a história do dia, CRIAR um novo plano ali, no mesmo estilo:
  - câmera em terceira pessoa;
  - a Marina é o `Boneco` com `APARENCIAS.marina`;
  - cenários `Cidade` (torre da Marina com o quarto dela no 12º andar, rua, parque, prédios) e `Quarto`;
  - personagens novos (Seu Álvaro, Dona Cida, Rafa, Bia) com `new Boneco({...})` e aparência própria.
- **Cenários novos:** corredor, elevador, portaria. Vão em `cenario.ts`, como classes iguais ao `Quarto`.
- **Medida na tela:** pelo menos um extra `dado` por episódio (contador com rótulo, como "CELULARES VIBRANDO" ou "ALTURA DA JANELA 36 m").
- **Conferir cada plano novo:** `node ferramentas/planos.mjs nome:segundo:duracao` e olhar a foto em `testes/planos/`.
- **Câmera e luz:**
  - a câmera NÃO pode atravessar parede, janela ou cabeça;
  - nada de luz estourando no rosto;
  - em close de rosto, distância da câmera até a cabeça de 0,8 a 1,0 m, com fov de 55 a 62.
- **Foto parada (como a "foto recebida"):** `node ferramentas/planos.mjs --grande nome:segundo` salva em `public/cenas/3d/nome.png`.

## 4. Montar e renderizar
- Escrever `episodios/epNN.json` no mesmo formato do `ep01.json`:
  - **Visual:** `{ "tipo": "3d", "planos": [...], "pesos": [...] }`, `fotoRecebida` ou `final`.
  - **Extras:** `dado`, `cartao`, `textao` e `relampago`.
  - **Efeitos de som:** vibrar, notificacao2, impacto, glitch, trovao, obturador, subida, grave, sino, carimbo, whoosh e coracao.
- `node ferramentas/preparar-caso.mjs episodios/epNN.json`
- `node ferramentas/quadros.mjs o-sinal-epNN <6 a 10 tempos>`: olhar os quadros e corrigir antes de seguir.
- `CONC=3 node ferramentas/renderizar.mjs o-sinal-epNN` (cerca de 1,5 min).
- Fazer a cópia leve, com menos de 10 MB:
  `node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe -y -i saida/o-sinal-epNN.mp4 -c:v libx264 -preset slow -b:v 1450k -maxrate 2200k -bufsize 4000k -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart saida/o-sinal-epNN-upload.mp4`
- Copiar a cópia leve e uma capa (`ffmpeg -ss <segundo do quadro mais forte> -frames:v 1 capa-epNN.jpg`) para `C:\Users\User\Desktop\Origem-Digital\arquivo-333-envios\`. Só dessa pasta o Chrome consegue subir arquivos.
- Escrever `publicacao/epNN.md` (legenda, título do YouTube e hashtags).

## 5. Publicar (20h)
- **Navegador:** usar o Chrome do perfil do e-mail da Origem (em `list_connected_browsers`, o navegador onde o TikTok abre em @arquivo333.0). Antes de publicar, CONFERIR a conta ativa: TikTok @arquivo333.0, YouTube no canal do arquivo333 e Instagram arquivo333.0. NUNCA publicar no @origem__digital.
- **TikTok:** tiktok.com/tiktokstudio/upload.
  - Subir a cópia leve, colar a legenda, escolher a capa ("Editar capa" e arrastar até o quadro forte).
  - Em "Exibir mais", ligar "Conteúdo gerado por IA" e confirmar "Ativar".
  - Para agendar: "Quando publicar" → Programar → hoje às 20h. Ou publicar às 20h.
- **YouTube:** studio.youtube.com, Criar → Enviar vídeos.
  - Título e descrição do `publicacao/epNN.md`, e "Não é conteúdo para crianças".
  - Em "Mostrar mais", "Uso de IA" = "Sim, a IA foi usada".
  - Avançar 3 vezes, depois Público e Publicar, ou Programar para as 20h.
- **Instagram:** instagram.com, Criar.
  - Subir a cópia leve, dar OK no aviso de reels e escolher o recorte "Original".
  - Na capa, usar "Selecionar do computador" com a capa-epNN.jpg.
  - Colar a legenda e, em Configurações avançadas, ligar "Adicionar rótulo de IA". Depois, Compartilhar.
- **Sem o Chrome do Arquivo conectado:** não publicar em outro lugar. Deixar pronto e registrar a pendência.

## 6. Registrar
- **Publicação:** anotar em `publicacao/epNN.md` o que saiu, onde, a que horas e o link.
- **Bíblia:** atualizar a seção de episódios em `series/o-sinal.md`.
- **Fim da série:** depois do ep. 12, começar a bíblia da próxima série em `series/`.
