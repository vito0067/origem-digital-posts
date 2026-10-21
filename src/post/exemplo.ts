// Post de exemplo (aparece na prévia do estúdio e serve de modelo para a rotina).
import type { Post } from "./tipos";

export const EXEMPLO: Post = {
  id: "2026-10-28-exemplo",
  publicar_em: "2026-10-28T19:30:00-03:00",
  formato: "reel",
  legenda: "Exemplo de legenda.",
  musica: { clima: "animado" },
  cenas: [
    { tipo: "frase", etiqueta: "Atendimento", texto: "Quanto custa um cliente *sem resposta*?" },
    { tipo: "numero", valor: 24, sufixo: "h", texto: "por dia a Aurora responde, até no *domingo*." },
    { tipo: "conversa", nome: "Clínica Exemplo", mensagens: [
      { de: "cliente", texto: "Oi! Vocês atendem sábado?" },
      { de: "aurora", texto: "Oi! Sou a Aurora, atendente de IA da clínica. Atendemos sim, das 8h às 12h. Quer que eu passe seu pedido para a equipe?" },
    ] },
    { tipo: "lista", titulo: "O que ela *faz*", itens: ["Responde em segundos", "Se apresenta como IA", "Passa para você quem quer fechar"] },
  ],
};
