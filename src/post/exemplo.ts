// Post de exemplo (aparece na prévia do estúdio e serve de modelo para a rotina): mostra os tipos de cena.
import type { Post } from "./tipos";

export const EXEMPLO: Post = {
  id: "2026-10-28-exemplo",
  publicar_em: "2026-10-28T19:30:00-03:00",
  formato: "reel",
  tema: "noite",
  legenda: "Exemplo de legenda. A conversa do vídeo é um exemplo.",
  musica: { clima: "animado" },
  cenas: [
    { tipo: "frase", etiqueta: "23h47", texto: "Um cliente chamou. *Quem respondeu?*" },
    { tipo: "digitando", etiqueta: "Mensagem nova", texto: "Oi! Vocês atendem sábado de manhã?" },
    { tipo: "conversa", nome: "Clínica Exemplo", mensagens: [
      { de: "cliente", texto: "Oi! Vocês atendem sábado?" },
      { de: "aurora", texto: "Oi! Sou a Aurora, atendente de IA da clínica. Atendemos sim, das 8h às 12h. Quer que eu passe seu pedido para a equipe?" },
    ] },
    { tipo: "palavras", titulo: "A Aurora", palavras: ["Responde.", "Explica.", "*Encaminha.*"] },
    { tipo: "numero", valor: 24, de: 24, sufixo: "h", texto: "por dia, até no *domingo*." },
    { tipo: "comparar", esquerda: { titulo: "Sem a Aurora", itens: ["Resposta só de manhã"] }, direita: { titulo: "Com a Aurora", itens: ["Resposta em segundos"] } },
    { tipo: "lista", titulo: "O que *acaba*", riscar: true, itens: ["Cliente esperando", "Mensagem esquecida"] },
  ],
};
