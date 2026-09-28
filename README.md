# Evolução

App pessoal de rotina inspirado no Sistema de Solo Leveling: nível, rank, missões de rotina com horário, missões relâmpago (a qualquer hora acordado) e trilha de desafios.

**Abrir:** https://daelton.github.io/evolucao

## Instalar no iPhone
Safari → abrir o link → Compartilhar → Adicionar à Tela de Início.

## Links para o app Atalhos
| Ação | Link |
|---|---|
| Acordei | `https://daelton.github.io/evolucao/?acao=acordei` |
| Cheguei na academia | `https://daelton.github.io/evolucao/?acao=academia` |
| +250 ml de água | `https://daelton.github.io/evolucao/?acao=agua` |
| Ler N páginas | `https://daelton.github.io/evolucao/?acao=ler&v=10` |
| Indo dormir | `https://daelton.github.io/evolucao/?acao=dormir` |

## Como as missões funcionam (v0.6)
- **No horário** (acordar, dormir): no horário = bônus; atrasado = XP normal; muito atrasado = não cumprida. Dá para registrar depois com a hora real.
- **Do dia** (ler, água): qualquer hora do dia; no momento sugerido (ex.: ônibus) = bônus. O que ficar sem marcar é confirmado no **Bom dia** da manhã seguinte.
- **Da semana** (academia, vôlei): N vezes por semana, em qualquer dia. Cobrança no domingo, por sessão que faltou. "Não teve" não conta.
- Não cumprida tira XP e zera a sequência. Escudo, pausa e desfazer continuam valendo.

## Integrações (grátis)
- **Calendário do iPhone**: Rotina → Integrações → gera eventos recorrentes com alerta nativo e link que marca a missão.
- **E-mail**: resumo da semana pronto no app Mail.
- **Localização**: salve o local da academia; com o app aberto, a presença é marcada sozinha.
- **Atalhos**: links `?acao=` para automações (alarme, chegar a um local, Modo Sono).
- **Google Agenda (beta)**: lê os compromissos do dia (precisa de um Client ID gratuito do Google).
- **Pausa**: férias ou doença sem perder pontos nem sequência.

## Estrutura
- `index.html` — app completo (camadas: agenda → regras → motor → efeitos → telas → ações)
- `sw.js` — funcionamento offline
- `manifest.webmanifest` + `icons/` — instalação na Tela de Início

Dados ficam salvos no próprio aparelho (use Ajustes → Exportar backup).
