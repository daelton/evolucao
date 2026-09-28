/*
 * Testes da sincronização com o Saúde. Rodar: node native/health/health-sync.test.js
 * Parte 1: só a lógica (sem dependências).
 * Parte 2: a lógica ligada ao app de verdade (precisa de "npm i jsdom").
 */
const path = require("path");
const { syncHealth, mergeSleep, classifyWorkout, logicalDate, dayWindow } = require("./health-sync.js");
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) pass++; else { fail++; console.log("  FALHOU:", name, extra !== undefined ? JSON.stringify(extra) : ""); } };
const T = (s) => new Date(s).getTime();

(async () => {
  console.log("Parte 1 · lógica");
  const CUT = 180; // dorme 23:00, acorda 07:00 → o dia vira às 03:00
  ok("02:30 ainda é o dia anterior", logicalDate(T("2026-10-06T02:30:00"), CUT) === "2026-10-05");
  ok("03:30 já é o dia novo", logicalDate(T("2026-10-06T03:30:00"), CUT) === "2026-10-06");
  const w = dayWindow("2026-10-06", CUT);
  ok("janela do dia começa 03:00", new Date(w.from).getHours() === 3 && w.to - w.from === 86400000);

  const noite = [
    { value: 0, startDate: "2026-10-05T22:40:00", endDate: "2026-10-06T07:05:00" },     // na cama (não conta)
    { value: 3, startDate: "2026-10-05T23:05:00", endDate: "2026-10-06T02:10:00" },     // sono leve
    { value: 2, startDate: "2026-10-06T02:10:00", endDate: "2026-10-06T02:40:00" },     // acordou 30 min
    { value: 4, startDate: "2026-10-06T02:40:00", endDate: "2026-10-06T05:00:00" },     // profundo
    { value: 5, startDate: "2026-10-06T05:00:00", endDate: "2026-10-06T06:50:00" },     // REM
    { value: 3, startDate: "2026-10-06T14:00:00", endDate: "2026-10-06T14:30:00" },     // cochilo
  ];
  const m = mergeSleep(noite);
  ok("junta a noite e ignora o cochilo", new Date(m.a).getHours() === 23 && new Date(m.b).getHours() === 6 && new Date(m.b).getMinutes() === 50, m && [new Date(m.a).toTimeString(), new Date(m.b).toTimeString()]);
  ok("força marca treino", classifyWorkout({ workoutActivityType: 50 }).kind === "forca");
  ok("vôlei vira atividade", classifyWorkout({ workoutActivityType: 51 }).act === "Vôlei");
  ok("tipo desconhecido vira Outro", classifyWorkout({ workoutActivityType: 999 }).act === "Outro");

  const calls = [];
  const fakeIngest = (...a) => { calls.push(a); return { ok: true }; };
  const gw = {
    available: async () => true,
    stepsBetween: async (a, b) => (new Date(a).getDate() === 6 ? 8123.4 : 5000),
    sleepSamples: async () => noite,
    workouts: async () => [{ uuid: "w1", workoutActivityType: 50, startDate: "2026-10-06T17:00:00", endDate: "2026-10-06T17:55:00" }, { uuid: "w2", workoutActivityType: 52, startDate: "2026-10-06T19:00:00", endDate: "2026-10-06T19:35:00" }],
    latestWeight: async () => ({ kg: 70.4, date: "2026-10-06T07:20:00", uuid: "p1" }),
    waterSamples: async () => { throw new Error("permissão negada"); },
  };
  const r = await syncHealth({ gateway: gw, ingest: fakeIngest, cutoffMin: CUT, now: T("2026-10-06T20:00:00"), settings: { water: true } });
  ok("passos de hoje arredondados", r.steps === 8123);
  ok("passos de ontem também enviados (confirma pendência)", calls.some((c) => c[0] === "steps" && c[1] === "2026-10-05"));
  ok("sono enviado", calls.some((c) => c[0] === "sleep"));
  ok("2 treinos enviados", calls.filter((c) => c[0] === "workout").length === 2);
  ok("peso enviado", calls.some((c) => c[0] === "weight" && c[1] === 70.4));
  ok("erro na água não para o resto", r.errors.length === 1 && /água/.test(r.errors[0]), r.errors);
  const r2 = await syncHealth({ gateway: { ...gw, available: async () => false }, ingest: fakeIngest, cutoffMin: CUT });
  ok("aparelho sem Saúde: não quebra", r2.unavailable === true);
  const n0 = calls.length;
  await syncHealth({ gateway: gw, ingest: fakeIngest, cutoffMin: CUT, now: T("2026-10-06T20:00:00"), settings: { steps: false, sleep: false, workouts: false, weight: false } });
  ok("tudo desligado: não envia nada", calls.length === n0);

  let JSDOM;
  try { ({ JSDOM } = require("jsdom")); } catch (e) { console.log("Parte 2 pulada (instale jsdom)"); return end(); }
  console.log("Parte 2 · ligada ao app");
  const html = require("fs").readFileSync(path.join(__dirname, "../../index.html"), "utf8");
  const dom = new JSDOM(html, { runScripts: "dangerously", url: "https://daelton.github.io/evolucao/", pretendToBeVisual: true, beforeParse(win) { win.scrollTo = () => {}; win.confirm = () => true; } });
  const W = dom.window, E = (s) => W.eval(s), q = (s) => W.document.querySelector(s), c = (s) => q(s).click();
  E('S.offset=new Date("2026-10-05T09:00:00").getTime()-Date.now();S.today=newDay(vdate());render()');
  c("[data-do=wznext]"); q("#wName").value = "Teste"; c("[data-do=wznext]");
  for (const a of ["treino", "movimento", "sono", "corpo"]) c(`[data-do=wzarea][data-v=${a}]`);
  c("[data-do=wznext]"); let g = 0; while (g++ < 12 && E("!!wz")) c("[data-do=wznext]");
  E('while(Q.length)Q.shift();showing=false;closeSheet();S.today.rv=true');
  E('S.offset=new Date("2026-10-06T20:00:00").getTime()-Date.now();loop()'); E('while(Q.length)Q.shift();showing=false;closeSheet();S.today.rv=true');
  const now = E("vnow().getTime()");
  const gw2 = { ...gw, stepsBetween: async (a) => (new Date(a).getDate() === 6 ? 8123 : 5200), waterSamples: async () => [] };
  const res = await syncHealth({ gateway: gw2, ingest: W.EvolucaoIngest, cutoffMin: E("cutoff()"), now, settings: E("JSON.stringify(integ())") && JSON.parse(E("JSON.stringify(integ())")) });
  ok("passos de hoje entram no app", E('ent(H("movimento")).value') === 8123 && E('ent(H("movimento")).done'), E('JSON.stringify(ent(H("movimento")))'));
  ok("passos de ontem resolvem a pendência (74%)", !E('S.pending.some(p=>p.id==="movimento")') && Math.abs(E('S.history[0].hr.movimento') - 0.743) < 0.01, E('JSON.stringify(S.history[0].hr)'));
  ok("sono registrado no horário", E('ent(H("sono")).grade') === "on", E('JSON.stringify(ent(H("sono")))'));
  ok('treino de força marca "Fui"', E('ent(H("treino")).done') && E('ent(H("treino")).src') === "Saúde");
  ok("peso vira a pesagem da semana", E("S.profile.weight") === 70.4 && E('wCount(H("corpo"))') === 1);
  const xp = E("S.level*10000+S.xp");
  await syncHealth({ gateway: gw2, ingest: W.EvolucaoIngest, cutoffMin: E("cutoff()"), now });
  ok("sincronizar de novo não duplica nada", E("S.level*10000+S.xp") === xp && E('wCount(H("treino"))') === 1);
  E('integ().workouts=false');
  const rr = W.EvolucaoIngest("workout", { uuid: "novo", kind: "forca", start: now - 3600000, end: now });
  ok("tipo desligado em Ajustes é ignorado", rr.why === "desligado em Ajustes");
  end();
})();
function end() { console.log(fail ? `✗ ${pass} ok, ${fail} falharam` : `✓ ${pass}/${pass} passaram`); process.exit(fail ? 1 : 0); }
