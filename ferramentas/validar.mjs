// Confere um post antes de renderizar: formato, limites do Instagram e as regras da marca.
// Devolve a lista de problemas (vazia = pode seguir).

// Preços oficiais (lib/precos.ts do site). Qualquer outro "R$" no post é barrado.
const PRECOS = ["987", "1.647", "657", "1.097", "1.447", "2.415", "43", "54", "217", "327", "260", "381"];
const PROIBIDO = [
  [/oferta do m[eê]s/i, "não existe \"oferta do mês\" (o desconto de 12% do pacote é permanente)"],
  [/promo[cç][aã]o rel[aâ]mpago|[uú]ltimas vagas|s[oó] hoje/i, "nada de urgência falsa"],
  [/conversas? ilimitadas?|limite de conversas/i, "o site não fala de limite de conversas"],
  [/depoimento|cliente nosso disse|nossos clientes dizem/i, "nada de depoimento inventado"],
];
const SE_APRESENTA_IA = /\b(IA|intelig[eê]ncia artificial|atendente virtual|assistente virtual)\b/i;

const textos = (post) => [post.legenda, ...post.cenas.flatMap((c) =>
  [c.texto, c.apoio, c.titulo, c.etiqueta, c.prefixo, c.sufixo, ...(c.itens ?? []), ...(c.mensagens ?? []).map((m) => m.texto)].filter(Boolean))];

export function validar(post, pasta) {
  const p = [];
  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]{1,60}$/.test(post.id ?? "")) p.push("id inválido (use AAAA-MM-DD-palavras-com-hifen)");
  if (pasta && pasta !== post.id) p.push(`a pasta (${pasta}) e o id (${post.id}) precisam ser iguais`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?-03:00$/.test(post.publicar_em ?? "") || isNaN(Date.parse(post.publicar_em))) p.push("publicar_em inválido (ex.: 2026-10-28T19:30:00-03:00)");
  if (!["reel", "carrossel", "imagem"].includes(post.formato)) p.push("formato deve ser reel, carrossel ou imagem");
  if (!Array.isArray(post.cenas) || post.cenas.length < 1) p.push("precisa de pelo menos 1 cena");
  else {
    if (post.formato === "carrossel" && (post.cenas.length < 2 || post.cenas.length > 9)) p.push("carrossel: de 2 a 9 cenas (o cartão final entra sozinho)");
    if (post.formato === "reel" && post.cenas.length > 7) p.push("reel: no máximo 7 cenas");
    post.cenas.forEach((c, i) => {
      const n = `cena ${i + 1}`;
      if (!["frase", "conversa", "numero", "lista", "imagem"].includes(c.tipo)) p.push(`${n}: tipo desconhecido`);
      if (c.tipo === "frase" && !c.texto) p.push(`${n}: frase sem texto`);
      if (c.tipo === "frase" && c.texto.replace(/\*/g, "").length > 140) p.push(`${n}: frase longa demais (máx. 140 letras)`);
      if (c.tipo === "numero" && (typeof c.valor !== "number" || !c.texto)) p.push(`${n}: número precisa de valor e texto`);
      if (c.tipo === "lista" && (!c.titulo || !Array.isArray(c.itens) || c.itens.length < 2 || c.itens.length > 5)) p.push(`${n}: lista precisa de título e 2 a 5 itens`);
      if (c.tipo === "lista" && c.itens?.some((x) => x.length > 48)) p.push(`${n}: item de lista longo demais (máx. 48 letras)`);
      if (c.tipo === "imagem" && !c.imagem) p.push(`${n}: imagem sem endereço`);
      if (c.tipo === "conversa") {
        if (!Array.isArray(c.mensagens) || c.mensagens.length < 2 || c.mensagens.length > 5) p.push(`${n}: conversa de 2 a 5 mensagens`);
        const primeira = (c.mensagens ?? []).find((m) => m.de === "aurora");
        if (!primeira) p.push(`${n}: a conversa precisa de uma resposta da Aurora`);
        else if (!SE_APRESENTA_IA.test(primeira.texto)) p.push(`${n}: a Aurora precisa se apresentar como IA na primeira resposta`);
        if ((c.mensagens ?? []).some((m) => m.texto.length > 160)) p.push(`${n}: mensagem longa demais (máx. 160 letras)`);
      }
    });
    if (post.cenas.some((c) => c.tipo === "conversa") && !/exemplo/i.test(post.legenda ?? "")) p.push("a legenda precisa dizer que a conversa é um exemplo");
  }
  if (!post.legenda || post.legenda.length > 2200) p.push("legenda vazia ou maior que 2.200 letras");
  if ((post.legenda?.match(/#[\p{L}\d_]+/gu) ?? []).length > 8) p.push("no máximo 8 hashtags");
  for (const t of textos(post)) {
    for (const [re, msg] of PROIBIDO) if (re.test(t)) p.push(msg);
    for (const m of t.matchAll(/R\$\s?([\d.]+)/g)) if (!PRECOS.includes(m[1].replace(/\.$/, ""))) p.push(`preço fora da tabela: R$ ${m[1]}`);
  }
  return [...new Set(p)];
}
