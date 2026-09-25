# Evolução

App pessoal de rotina inspirado no Sistema de Solo Leveling: nível, rank, missões de rotina com horário, missões relâmpago e trilha de desafios.

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

## Estrutura
- `index.html` — app completo (camadas: agenda → regras → motor → efeitos → telas → ações)
- `sw.js` — funcionamento offline
- `manifest.webmanifest` + `icons/` — instalação na Tela de Início

Dados ficam salvos no próprio aparelho (use Ajustes → Exportar backup).
