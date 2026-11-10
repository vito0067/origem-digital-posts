# Mede os dias do Hoje Sumiu com o ffmpeg (sem custo): duração, cortes, movimento, brilho, cor e volume.
# Adaptado de 4-midia/referencias/ferramentas/medir-episodios.py (padrão de qualidade aprovado em 09/11/2026).
# Uso: python medir-dias.py [dia01 dia09 dia10 ...]   (gera medidas.json, medidas.csv e mosaico-<dia>.png em saida/medicao)
import csv, json, os, re, subprocess, sys

FF = "C:/Users/User/AppData/Roaming/Python/Python312/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v9.0.2.exe"
BASE = r"C:\Users\User\Desktop\Origem-Digital\hoje-sumiu-envios"  # cópias de 720p de cada dia
OUT = r"C:\Users\User\Documents\Origem Digital\4-midia\posts-automaticos\hoje-sumiu\saida\medicao"
os.makedirs(OUT, exist_ok=True)

# dia -> (arquivo, views no Instagram em 09/11/2026 quando conhecidas)
VIEWS = {1: 2537, 2: 2000, 3: 1501, 4: 1276, 5: 1567, 6: 1596}
ARQ = {1: "hoje-sumiu-dia01-upload.mp4", 2: "hoje-sumiu-dia02-upload.mp4", 3: "hoje-sumiu-dia03-upload.mp4", 4: "hoje-sumiu-dia04-leve.mp4",
       5: "hoje-sumiu-dia05-leve.mp4", 6: "hoje-sumiu-dia06-upload.mp4", 7: "hoje-sumiu-dia07-upload.mp4", 8: "hoje-sumiu-dia08-upload.mp4",
       9: "hoje-sumiu-dia09-upload.mp4", 10: "hoje-sumiu-dia10-upload.mp4", 11: "hoje-sumiu-dia11-upload.mp4"}
EPS = {f"dia{n:02d}": (a, VIEWS.get(n)) for n, a in ARQ.items()}

def rodar(args):
    return subprocess.run([FF, "-hide_banner", "-nostats"] + args, capture_output=True, text=True, encoding="utf-8", errors="replace")

def duracao(p):
    r = rodar(["-i", p])
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r.stderr)
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])

def medir(nome, arq, views):
    p = os.path.join(BASE, arq)
    d = duracao(p)
    r = rodar(["-i", p, "-vf", "fps=15,scale=270:480,signalstats,metadata=print:file=-", "-an", "-f", "null", "-"])
    txt = r.stdout + r.stderr
    ydif = [float(x) for x in re.findall(r"lavfi\.signalstats\.YDIF=([\d.]+)", txt)]
    yavg = [float(x) for x in re.findall(r"lavfi\.signalstats\.YAVG=([\d.]+)", txt)]
    sat = [float(x) for x in re.findall(r"lavfi\.signalstats\.SATAVG=([\d.]+)", txt)]
    r2 = rodar(["-i", p, "-vf", "fps=15,scale=270:480,select='gt(scene,0.25)',showinfo", "-an", "-f", "null", "-"])
    cortes = [float(x) for x in re.findall(r"pts_time:([\d.]+)", r2.stderr)]
    r3 = rodar(["-i", p, "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"])
    lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", r3.stderr)
    lra = re.findall(r"LRA:\s+([\d.]+) LU", r3.stderr)
    n = max(len(ydif), 1)
    parados = sum(1 for y in ydif if y < 0.6) / n
    return {
        "nome": nome, "views_instagram": views, "duracao_s": round(d, 1),
        "cortes": len(cortes), "cortes_por_10s": round(len(cortes) / d * 10, 1),
        "maior_trecho_sem_corte_s": round(max(b - a for a, b in zip([0] + cortes, cortes + [d])), 1),
        "movimento_medio": round(sum(ydif) / n, 2), "parte_parada_pct": round(parados * 100, 1),
        "brilho_medio": round(sum(yavg) / max(len(yavg), 1), 1), "saturacao_media": round(sum(sat) / max(len(sat), 1), 1),
        "volume_LUFS": float(lufs[-1]) if lufs else None, "variacao_LRA": float(lra[-1]) if lra else None,
        "primeiro_corte_s": round(cortes[0], 2) if cortes else None,
    }

def mosaico(nome, arq):
    p = os.path.join(BASE, arq)
    d = duracao(p)
    rodar(["-y", "-i", p, "-vf", f"fps=60/{d:.2f},scale=160:-1,tile=10x6:padding=2:color=black", "-frames:v", "1", os.path.join(OUT, f"mosaico-{nome}.png")])

if __name__ == "__main__":
    alvos = sys.argv[1:] or list(EPS)
    todas = []
    for nome in alvos:
        arq, v = EPS[nome]
        try:
            m = medir(nome, arq, v)
            print(json.dumps(m, ensure_ascii=False))
            todas.append(m)
        except Exception as e:
            print("ERRO", nome, e)
    json.dump(todas, open(os.path.join(OUT, "medidas.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    with open(os.path.join(OUT, "medidas.csv"), "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(todas[0].keys()), delimiter=";")
        w.writeheader()
        w.writerows(todas)
    for nome in ("dia01", "dia10", "dia11"):
        if nome in alvos:
            mosaico(nome, EPS[nome][0])
    print("FIM")
