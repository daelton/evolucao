# Evolução · integração com o app Saúde

Tudo o que o app precisa para ler do Saúde já está pronto e testado. Falta só ligar no app nativo.

## Como está montado

| Arquivo | O que faz | Onde roda |
|---|---|---|
| `index.html` → `ingest(...)` | Porta de entrada única dos dados de fora (passos, sono, treino, peso, água). Aplica as regras do app. | site hoje, app nativo depois |
| `health-sync.js` | Decide **o que** ler e **para qual dia**: junta o sono da noite, classifica treinos, não duplica. | Node (testes) e app nativo |
| `healthkit-gateway.js` | Conversa com o HealthKit. É o único arquivo que só funciona no iPhone. | só no app nativo |
| `health-sync.test.js` | 22 testes: a lógica sozinha e ligada ao app de verdade. | `node native/health/health-sync.test.js` (precisa de `npm i jsdom`) |

## O que vem do Saúde e o que acontece

- **Passos:** o total do dia vira os passos do dia (vale o maior entre o digitado e o do Saúde). Os passos de ontem resolvem a pendência com crédito parcial.
- **Sono:** junta os trechos da noite (acordou no meio conta) e registra dormiu e acordou. Cochilo é ignorado.
- **Treinos:** força, funcional, core, HIIT e cross marcam o treino do dia ("Fui"). Caminhada, corrida, bike, natação, futebol, vôlei e dança viram minutos de movimento (se o movimento estiver em minutos).
- **Peso:** a pesagem mais recente dos últimos 7 dias vira a pesagem da semana.
- **Água:** o que for registrado no Saúde soma na água do dia (desligado por padrão).

Cada tipo pode ser ligado ou desligado em **Ajustes → Integrações**. Sincronizar várias vezes não duplica nada.

## Para ligar no app nativo (Expo)

1. `npx expo install @kingstinct/react-native-healthkit`
2. No `app.json`, adicionar o plugin com os textos de permissão:
   ```json
   ["@kingstinct/react-native-healthkit", {
     "NSHealthShareUsageDescription": "O Evolução lê seus passos, sono, treinos, peso e água para marcar sua rotina sozinho.",
     "NSHealthUpdateUsageDescription": false,
     "background": false
   }]
   ```
3. Não funciona no Expo Go: gerar um build próprio com `eas build`.
4. Conferir as 5 funções de `healthkit-gateway.js` com a versão instalada da biblioteca.
5. Chamar ao abrir o app e ao voltar para ele:
   ```js
   await gateway.authorize();
   await syncHealth({ gateway, ingest, cutoffMin: cutoff(), settings: integ() });
   ```

## Roteiro de teste no iPhone (TestFlight)

1. Primeira abertura: aparece o pedido de permissão do Saúde com o texto do Evolução.
2. Negar tudo: o app funciona normal, sem erro, e os itens continuam manuais.
3. Permitir: passos de hoje aparecem na linha "Passos" com "· Saúde".
4. Dormir com o iPhone ou o Watch: de manhã, o sono aparece registrado.
5. Treino de força no Watch: o treino do dia fica marcado como "Fui".
6. Caminhada no Watch (com movimento em minutos): os minutos entram na semana.
7. Pesar numa balança que grava no Saúde: vira a pesagem da semana.
8. Fechar e abrir o app várias vezes: nada duplica.
9. Desligar "Treinos" em Ajustes → Integrações: treinos novos não entram mais.
