"""Mede a diferença entre quadros consecutivos para achar travadas (quadros repetidos) e saltos bruscos.
Uso: python travadas.py video.mp4 pasta_temp
"""
import os, subprocess, sys, glob, statistics
from PIL import Image, ImageChops, ImageStat

FF = r"C:/Users/User/Documents/Origem Digital/4-midia/posts-automaticos/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"
video, pasta = sys.argv[1], sys.argv[2]
os.makedirs(pasta, exist_ok=True)
for f in glob.glob(os.path.join(pasta, "f*.png")):
    os.remove(f)
subprocess.run([FF, "-y", "-loglevel", "error", "-i", video, "-vf", "scale=108:192", os.path.join(pasta, "f%04d.png")], check=True)
arq = sorted(glob.glob(os.path.join(pasta, "f*.png")))
fps = 30
d = []
prev = Image.open(arq[0]).convert("L")
for a in arq[1:]:
    cur = Image.open(a).convert("L")
    d.append(ImageStat.Stat(ImageChops.difference(prev, cur)).mean[0])
    prev = cur
print("quadros:", len(arq))
par, ini = [], -1
for k, x in enumerate(d):
    if x < 0.05:
        if ini < 0:
            ini = k
    else:
        if ini >= 0 and k - ini >= 3:
            par.append((ini, k - ini))
        ini = -1
print("TRECHOS PARADOS (>=3 quadros, dif<0.05):")
for a, n in par:
    print(f"  {a / fps:6.2f}s  {n} quadros ({n / fps:.2f}s)")
dup = [k for k in range(2, len(d) - 2) if d[k] < 0.05 and d[k - 1] > 0.3 and d[k + 1] > 0.3]
print("QUADROS DUPLICADOS ISOLADOS:", len(dup), " ".join(f"{k / fps:.2f}" for k in dup[:60]))
med = statistics.median(d)
lim = max(6, med * 6)
saltos = [(k, x) for k, x in enumerate(d) if x > lim]
print(f"mediana: {med:.2f}  SALTOS BRUSCOS:", " ".join(f"{k / fps:.2f}s({x:.1f})" for k, x in saltos))
seg = []
for s in range(0, len(d) // fps + 1):
    a = d[s * fps:(s + 1) * fps]
    if a:
        seg.append(f"{sum(a) / len(a):.1f}")
print("movimento por segundo:", " ".join(seg))
