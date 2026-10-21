// Páginas de prévia (GitHub Pages): uma por post e um índice. Feitas para abrir no celular.
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const NOME = { reel: "Reels", carrossel: "Carrossel", imagem: "Foto" };
export const quando = (iso) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const CSS = `
:root{--fundo:#F8FAFC;--cartao:#fff;--tinta:#1E1B4B;--cinza:#64748B;--linha:#E2E8F0;--azul:#4F46E5}
@media (prefers-color-scheme:dark){:root{--fundo:#0B0A24;--cartao:#16143A;--tinta:#EEF2FF;--cinza:#A5B4FC;--linha:#2A2760;--azul:#A5B4FC}}
*{box-sizing:border-box}body{margin:0;background:var(--fundo);color:var(--tinta);font:16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}
main{max-width:560px;margin:0 auto;padding:20px 16px 48px}h1{font-size:22px;margin:4px 0 2px}.sub{color:var(--cinza);font-size:14px}
.midia{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;margin:16px 0}.midia>*{scroll-snap-align:start;flex:0 0 100%;width:100%;border-radius:16px;border:1px solid var(--linha);background:#000}
.legenda{white-space:pre-wrap;background:var(--cartao);border:1px solid var(--linha);border-radius:16px;padding:16px;font-size:15px}
a{color:var(--azul)}.item{display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--linha);text-decoration:none;color:inherit}
.item img{width:72px;height:90px;object-fit:cover;border-radius:10px;border:1px solid var(--linha)}`;

const pagina = (titulo, corpo) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(titulo)}</title><style>${CSS}</style></head><body><main>${corpo}</main></body></html>`;

export const paginaPost = (p) => pagina(`Prévia · ${p.id}`, `
<a href="../">← todos os posts</a>
<h1>${esc(NOME[p.formato])} · ${esc(quando(p.publicar_em))}</h1>
<div class="sub">Prévia do post da Origem Digital. Ele só sai no Instagram depois de aprovado pelo link do WhatsApp.</div>
<div class="midia">${p.formato === "reel"
  ? `<video src="reel.mp4" poster="capa.jpg" controls playsinline preload="metadata"></video>`
  : p.midias.map((m, i) => `<img src="slide-${i + 1}.jpg" alt="Foto ${i + 1}">`).join("")}</div>
${p.formato === "carrossel" ? `<div class="sub">Arraste para o lado para ver as ${p.midias.length} fotos.</div>` : ""}
<h1 style="font-size:17px;margin-top:20px">Legenda</h1>
<div class="legenda">${esc(p.legenda)}</div>`);

export const paginaIndice = (lista) => pagina("Posts · Origem Digital", `
<h1>Posts da Origem Digital</h1><div class="sub">Feitos pela fábrica de posts. Os mais novos em cima.</div>
${lista.map((p) => `<a class="item" href="${esc(p.id)}/"><img src="${esc(p.id)}/${p.formato === "reel" ? "capa.jpg" : "slide-1.jpg"}" alt=""><div><b>${esc(NOME[p.formato])}</b><div class="sub">${esc(quando(p.publicar_em))}</div></div></a>`).join("") || "<p>Nenhum post ainda.</p>"}`);
