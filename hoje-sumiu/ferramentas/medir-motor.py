# Mede dois vídeos do Hoje Sumiu lado a lado com o medidor comum (4-midia\referencias\ferramentas\medir-episodios.py).
# Uso: python ferramentas/medir-motor.py hoje-sumiu-dia11.mp4 hoje-sumiu-dia11-motor-14lufs.mp4
# Sai em saida\medicao-motor: medidas.json e mosaico-<nome>.png (60 quadros de cada vídeo).
import json, os, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "..", "..", "..", "referencias", "ferramentas"))
import importlib
me = importlib.import_module("medir-episodios")
me.BASE = os.path.join(AQUI, "..", "saida")
me.OUT = os.path.join(me.BASE, "medicao-motor")
os.makedirs(me.OUT, exist_ok=True)
todas = []
for arq in sys.argv[1:]:
    nome = os.path.splitext(arq)[0]
    m = me.medir(nome, arq, None)
    me.mosaico(nome, arq)
    todas.append(m)
    print(json.dumps(m, ensure_ascii=False))
json.dump(todas, open(os.path.join(me.OUT, "medidas.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
