# Motor do Arquivo 3:33 (desde 11/11/2026)

Cópia própria da base `posts-automaticos\motor-v2` (que ficou congelada: cada perfil tem o seu motor, decisão do Vito em 11/11/2026).
Mude aqui à vontade; não precisa voltar para a base.

| Arquivo | O que faz |
|---|---|
| `camera.mjs`, `ritmo.mjs`, `luz.mjs`, `som.mjs`, `index.mjs` | Copiados da base em 11/11/2026 (câmera com emendas e piso de movimento, conferidor de ritmo, luz, trilha que silencia). |
| `normalizar-som.mjs` | Deixa o vídeo em -14 LUFS (`node motor/normalizar-som.mjs saida/<id>.mp4` → `<id>-14lufs.mp4`). |
| `camv2.mjs` | Os planos de câmera do perfil (`v2/...`): partem do enquadramento do plano antigo de `src/motor3d/pilotos.ts` e variam. |

Quem usa: `src/motor3d/Mundo3D.tsx` (câmera, luz, pulso), `ferramentas/preparar-caso.mjs` (trilha), `ferramentas/conferir-ritmo-v2.mjs`.
Mudanças só do Arquivo: ver a seção "Motor do Arquivo" da skill `arquivo-333`.
