# Compara episódios lado a lado com a mesma régua do medir-episodios.py (movimento, tempo parado, 1º corte, LUFS) + mosaico de 60 quadros.
# Uso: python ferramentas/medir-ab.py pasta-de-saida nome=arquivo.mp4 nome2=arquivo2.mp4 ...   (arquivos dentro de arquivo-333/saida)
import importlib.util, json, os, sys
REGUA = r"C:\Users\User\Documents\Origem Digital\4-midia\referencias\ferramentas\medir-episodios.py"
spec = importlib.util.spec_from_file_location("regua", REGUA); me = importlib.util.module_from_spec(spec); spec.loader.exec_module(me)
me.OUT = os.path.abspath(sys.argv[1]); os.makedirs(me.OUT, exist_ok=True)
todas = []
for par in sys.argv[2:]:
    nome, arq = par.split("=", 1)
    m = me.medir(nome, arq, None); todas.append(m); me.mosaico(nome, arq)
    print(json.dumps(m, ensure_ascii=False))
json.dump(todas, open(os.path.join(me.OUT, "medidas.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
