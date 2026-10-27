// Põe no GitHub Pages (pasta docs/arquivo, sem guardar no git) os vídeos e capas dos episódios que saem de ontem até
// daqui a 10 dias, baixando dos releases. Assim o n8n tem um link direto (sem redirecionamento) para publicar no Instagram.
// Roda nas duas GitHub Actions (posts.yml e arquivo-333.yml) logo antes de publicar o Pages; nunca derruba a Action.
// Uso (na raiz do repositório): node arquivo-333/ferramentas/pages.mjs
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const DOCS = join(RAIZ, "..", "docs", "arquivo");
const agendaArq = join(RAIZ, "publicacao", "render", "agenda.json");

try {
  mkdirSync(DOCS, { recursive: true });
  const agenda = existsSync(agendaArq) ? JSON.parse(readFileSync(agendaArq, "utf8")) : [];
  const hoje = new Date(Date.now() - 3 * 3600e3); // horário de Brasília
  const dia = (d) => new Date(hoje.getTime() + d * 86400e3).toISOString().slice(0, 10);
  const proximos = agenda.filter((e) => e.data >= dia(-1) && e.data <= dia(10));
  const saida = [];
  for (const e of proximos) {
    const item = { ...e };
    for (const [campo, nome] of [["video", `${e.id}.mp4`], ["capa", `${e.id}-capa.jpg`]]) {
      if (!e[campo]) continue;
      const r = await fetch(e[campo]);
      if (!r.ok) { console.log(`pages: não baixei ${campo} de ${e.id} (HTTP ${r.status})`); item[campo] = null; continue; }
      writeFileSync(join(DOCS, nome), Buffer.from(await r.arrayBuffer()));
      item[campo] = `https://vito0067.github.io/origem-digital-posts/arquivo/${nome}`;
    }
    saida.push(item);
  }
  writeFileSync(join(DOCS, "agenda.json"), JSON.stringify(saida, null, 2) + "\n");
  console.log(`pages: ${saida.length} episódio(s) do Arquivo 3:33 no Pages`);
} catch (e) {
  console.log("pages: falhou, segue sem os vídeos do Arquivo:", e.message);
}
