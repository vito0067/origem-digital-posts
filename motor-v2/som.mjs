// Motor 3D v2 · SOM
// Regra aprovada: silêncio curto antes do momento forte, efeito no quadro exato e volume final em -14 LUFS.

/**
 * Volume da trilha ao longo do tempo, abaixando sozinho antes de cada impacto.
 * impactos: [{ em: segundos, silencio?: 0.35, volta?: 0.5 }]
 * Devolve volume(t) entre 0 e base. Use no <Audio volume={(f) => volume(f / fps)} /> do Remotion.
 */
export function volumeTrilha(impactos, base = 0.26) {
  const I = impactos.map((i) => ({ silencio: 0.35, volta: 0.5, ...i }));
  return (t) => {
    let v = 1;
    for (const i of I) {
      const antes = i.em - t;                       // segundos até o impacto
      if (antes > 0 && antes < i.silencio + 0.12) v = Math.min(v, Math.max(0, (antes - i.silencio) / 0.12)); // desce em 0,12 s e fica mudo
      else if (antes <= 0 && -antes < i.volta) v = Math.min(v, Math.pow(-antes / i.volta, 1.5));              // volta crescendo
    }
    return base * v;
  };
}

/** Confere se cada impacto tem silêncio antes e se dois impactos não estão colados. Devolve avisos. */
export function conferirSom(impactos, falas = []) {
  const avisos = []; const I = [...impactos].sort((a, b) => a.em - b.em);
  for (let k = 1; k < I.length; k++) if (I[k].em - I[k - 1].em < 1.2) avisos.push(`Impactos em ${I[k - 1].em} s e ${I[k].em} s estão colados (menos de 1,2 s): o segundo perde força.`);
  for (const i of I) for (const f of falas) if (f.de < i.em && f.ate > i.em - (i.silencio ?? 0.35)) avisos.push(`A fala de ${f.de}–${f.ate} s invade o silêncio antes do impacto de ${i.em} s.`);
  return avisos;
}

/** Converte um tempo em segundos para o quadro exato (para disparar o efeito sonoro no quadro certo). */
export const quadro = (seg, fps = 30) => Math.round(seg * fps);
