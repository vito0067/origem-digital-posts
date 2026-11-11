// Deixa o som do vídeo em -14 LUFS (padrão das redes), em duas passadas, sem mexer na imagem.
// Uso: node normalizar-som.mjs caminho/do/video.mp4   → cria video-14lufs.mp4 ao lado.
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
const entrada = process.argv[2];
if (!entrada) { console.error('Faltou o vídeo. Exemplo: node normalizar-som.mjs saida/dia11.mp4'); process.exit(1); }
let ffmpeg = process.env.FFMPEG;
if (!ffmpeg) { try { ffmpeg = execFileSync('python', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'], { encoding: 'utf8' }).trim(); } catch { ffmpeg = 'ffmpeg'; } }
const alvo = 'loudnorm=I=-14:TP=-1.5:LRA=11';
const p1 = spawnSync(ffmpeg, ['-hide_banner', '-i', entrada, '-af', alvo + ':print_format=json', '-vn', '-f', 'null', '-'], { encoding: 'utf8' });
const m = (p1.stderr || '').match(/\{[\s\S]*?"input_i"[\s\S]*?\}/);
if (!m) { console.error('Não consegui medir o som. Saída do ffmpeg:\n' + (p1.stderr || '').slice(-600)); process.exit(1); }
const j = JSON.parse(m[0]);
const saida = path.join(path.dirname(entrada), path.basename(entrada, path.extname(entrada)) + '-14lufs' + path.extname(entrada));
const filtro = `${alvo}:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
const p2 = spawnSync(ffmpeg, ['-hide_banner', '-y', '-i', entrada, '-c:v', 'copy', '-af', filtro, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', saida], { encoding: 'utf8' });
if (p2.status !== 0) { console.error('Falhou ao gravar:\n' + (p2.stderr || '').slice(-600)); process.exit(1); }
console.log(`Antes: ${j.input_i} LUFS. Gravado em -14 LUFS: ${saida}`);
