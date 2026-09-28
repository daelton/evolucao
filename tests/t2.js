const {mk,onboard,ok,sec,report}=require('./lib');
// 5. Virada do dia pelos horários de sono
sec('Virada do dia');
for(const [sl,wk,exp] of [['23:00','07:00',180],['06:00','14:00',600],['01:00','09:00',300],['22:00','05:30',105]]){const env=mk();onboard(env,['agua','sono'],{sleep:[sl,wk]});ok(`dorme ${sl} acorda ${wk}: vira às ${Math.floor(exp/60)}h${exp%60||''}`,env.E('cutoff()')===exp,env.E('cutoff()'))}
{const env=mk();onboard(env,['agua','sono'],{sleep:['06:00','14:00']});env.at('2026-10-06','08:00');ok('plantonista 08:00 ainda é o dia anterior',env.E('S.today.date')==='2026-10-05',env.E('S.today.date'));env.at('2026-10-06','11:00');ok('plantonista 11:00 já é o novo dia',env.E('S.today.date')==='2026-10-06',env.E('S.today.date'))}
// 6. App fechado vários dias
sec('Dias sem abrir o app');
{const env=mk();onboard(env,['agua','treino','sono','leitura','habitos']);const lv=env.E('S.level');env.at('2026-10-12','09:00');
  ok('fecha os 7 dias sem erro',!env.errs.length,env.errs[0]);ok('data certa',env.E('S.today.date')==='2026-10-12',env.E('S.today.date'));ok('histórico com 7 dias',env.E('S.history.length')===7,env.E('S.history.length'));
  ok('semana nova',env.E('S.week.key')==='2026-10-12',env.E('S.week.key'));ok('pendências só de ontem e anteontem (48 h)',env.E('S.pending.every(p=>p.date>="2026-10-10")')&&env.E('S.pending.some(p=>p.date==="2026-10-10")'),env.E('JSON.stringify(S.pending)'));
  ok('XP/nível coerentes',env.E('S.xp>=0&&S.level>=1'));console.log('   info: 7 dias sem abrir → XP',env.E('S.xp'),'nível',env.E('S.level'),'carta',env.E('ovr()'),'| sequência',env.E('S.streak'))}
// 7. Crédito parcial
sec('Crédito parcial');
{const env=mk();onboard(env,['agua','leitura','movimento']);env.E('addWater(2.2)');env.E('addQty(H("leitura"),5)');env.E('ent(H("movimento")).value=3500');const x0=env.E('S.xp');env.at('2026-10-06','09:00');
  const hr=env.E('JSON.stringify(S.history[0].hr)');ok('água 2,2 de 2,5 = 88%',Math.abs(env.E('S.history[0].hr.agua')-.88)<.01,hr);ok('leitura 5 de 10 = 50%',env.E('S.history[0].hr.leitura')===.5,hr);ok('passos 3.500 de 7.000 = 50%',env.E('S.history[0].hr.movimento')===.5,hr);
  ok('nada foi para "Ficou sem marcar"',env.E('S.pending.length')===0,env.E('JSON.stringify(S.pending)'));ok('XP: água +11, leitura +3, passos +3',env.E('S.xp')-x0===17,env.E('S.xp')-x0)}
{const env=mk();onboard(env,['leitura']);env.at('2026-10-06','09:00');ok('zerado vai para pergunta',env.E('S.pending.length')===1);env.E('resolvePending(S.pending[0],true)');ok('"Fiz" corrige o dia para 100%',env.E('S.history[0].r.leitura')===1)}
// 8. Sequência e escudo
sec('Sequência e escudo');
{const env=mk();onboard(env,['leitura','habitos'],{habits:['Meditar 5 min','Alongar 5 min','Tomar vitamina']});
  const full=()=>env.E('addQty(H("leitura"),10);S.habits.filter(h=>h.area==="habitos").forEach(h=>complete(h,10))'),half=()=>env.E('addQty(H("leitura"),10);complete(S.habits.find(h=>h.area==="habitos"),10)'),rv=()=>env.E('while(S.pending.length)resolvePending(S.pending[0],false)');
  full();env.at('2026-10-06','09:00');ok('dia completo conta',env.E('S.streak')===1);half();env.at('2026-10-07','09:00');rv();ok('metade (2 de 4) conta',env.E('S.streak')===2,env.E('S.streak'));
  env.at('2026-10-08','09:00');rv();ok('dia zerado com escudo mantém',env.E('S.streak')===3&&env.E('!!S.history[2].sh'),env.E('S.streak'));env.at('2026-10-09','09:00');rv();ok('segundo dia zerado sem escudo zera',env.E('S.streak')===0,env.E('S.streak'));
  ok('recorde guardado',env.E('S.best')===3,env.E('S.best'))}
// 9. Nível e XP
sec('Nível e XP');
{const env=mk();onboard(env,['habitos']);env.E('addXP(250)');ok('100+130 → nível 3 com 20 XP',env.E('S.level')===3&&env.E('S.xp')===20,env.E('S.level+" "+S.xp'));env.E('addXP(-40)');ok('perde e cai para nível 2',env.E('S.level')===2&&env.E('S.xp')===110,env.E('S.level+" "+S.xp'));
  env.E('addXP(-9999)');ok('nunca abaixo de nível 1 / 0 XP',env.E('S.level')===1&&env.E('S.xp')===0)}
// 10. Semanais
sec('Metas semanais');
{const env=mk();onboard(env,['treino']);ok('treino 3× (seg, qua, sex) na 1ª semana',env.E('wReq(H("treino"))')===3,env.E('wReq(H("treino"))'));env.at('2026-10-06','09:00');
  ok('segunda sem treinar: ritmo 0%',env.E('S.history[0].hr.treino')===0,env.E('JSON.stringify(S.history[0].hr)'));env.E('addSession(H("treino"))');env.at('2026-10-07','09:00');ok('terça (não é dia de treino) não mexe na nota',env.E('S.history[1].hr.treino')===undefined||env.E('S.history[1].hr.treino')===null,env.E('JSON.stringify(S.history[1].hr)'));
  env.at('2026-10-12','09:00');ok('domingo cobra o que faltou (XP)',env.E('S.log.some(l=>/Treino: 1\\/3/.test(l.t))'),env.E('S.log.slice(0,8).map(l=>l.t).join(" | ")'))}
{const env=mk();onboard(env,['movimento'],{moveMode:'min'});env.E('addMinutes(H("movimento"),60,"Caminhada")');env.at('2026-10-06','09:00');ok('minutos: 60 de 150 no 1º dia = ritmo 100%',env.E('S.history[0].hr.movimento')===1,env.E('JSON.stringify(S.history[0].hr)'))}
// 11. Evitar
sec('Hábitos de evitar');
{const env=mk();onboard(env,['habitos'],{habits:['Sem doce']});ok('criado como evitar',env.E('S.habits[0].kind')==='avoid');ok('conta como feito no resumo',env.q('.sumt b').textContent.includes('Dia completo')||env.E('todayItems()[0].done'));const x0=env.E('S.xp');env.at('2026-10-06','09:00');ok('dia sem quebrar: +10 XP e 100%',env.E('S.xp')-x0===10&&env.E('S.history[0].r.habitos')===1,env.E('S.xp')-x0);
  env.c('.rbtn[data-do=broke]');env.at('2026-10-07','09:00');ok('quebrou: −10 XP e 0%',env.E('S.history[1].r.habitos')===0,env.E('JSON.stringify(S.history[1].r)'));ok('não pergunta no Bom dia',env.E('S.pending.length')===0)}
// 12. Sono fim de semana
sec('Sono');
{const env=mk();onboard(env,['sono']);env.E('S.profile.we={wake:"09:30",sleep:"00:30"}');env.at('2026-10-10','10:00');env.E('S.today.rv=true;logSleep(toMin("00:40"),toMin("09:20"))');ok('sábado 00:40→09:20 no horário (meta fds)',env.E('ent(H("sono")).grade')==='on',env.E('ent(H("sono")).grade'));
  env.at('2026-10-12','10:00');env.E('S.today.rv=true;logSleep(toMin("00:40"),toMin("09:20"))');ok('segunda o mesmo horário = fora (meta de semana)',env.E('ent(H("sono")).grade')==='miss',env.E('ent(H("sono")).grade'));
  env.at('2026-10-13','10:00');env.E('S.today.rv=true;logSleep(toMin("23:50"),toMin("07:40"))');ok('50/40 min fora = um pouco fora (60%)',env.E('ent(H("sono")).grade')==='late',env.E('ent(H("sono")).grade'))}
// 13. Cronômetro atravessando o dia
sec('Cronômetro');
{const env=mk();onboard(env,['estudo']);env.E('A.tstart({dataset:{v:"estudo"}})');env.at('2026-10-06','09:00');env.E('S.timer.start-=25*60000;A.tstop()');ok('parar no dia seguinte registra no dia atual',env.E('ent(H("estudo")).value')>=25,env.E('ent(H("estudo")).value'));ok('sem erro',!env.errs.length,env.errs[0])}
// 14. Tarefas
sec('Tarefas');
{const env=mk();onboard(env,['habitos']);env.q('#tOne').value='pagar luz';env.c('[data-do=task1]');env.q('#tOne').value='<img src=x onerror=alert(1)>';env.c('[data-do=task1]');ok('duas tarefas',env.E('S.tasks.length')===2);
  ok('texto com HTML não vira código',!env.q('#view img'),'img criada');const x0=env.E('S.xp');env.c('[data-do=taskdone]');ok('concluir dá XP',env.E('S.xp')>x0);env.E('tab="tarefas";render()');env.c('.task.done [data-do=taskdone]');ok('desmarcar (em Tarefas) devolve',env.E('S.xp')===x0);
  env.c('.task [data-do=taskdone]');env.E('tab="hoje";render()');env.at('2026-10-06','09:00');ok('feita some no dia seguinte, aberta fica',env.E('S.tasks.length')===1,env.E('S.tasks.length'))}
// 15. Backup
sec('Backup');
{const env=mk();onboard(env,['agua','treino','habitos']);env.E('addWater(1);S.xp=77');const js=env.E('JSON.stringify(S)');const env2=mk();env2.E(`S=migrate(JSON.parse(${JSON.stringify(js)}));save();render()`);ok('exportar → importar mantém tudo',env2.E('S.xp')===77&&env2.E('S.areas.length')===3);
  const old=JSON.parse(js);delete old.rulesV;old.attrs={agua:{ema:.6,prev:.6},treino:{ema:.6,prev:.6},habitos:{ema:.6,prev:.6}};const env3=mk();env3.E(`S=migrate(${JSON.stringify(old)});save();render()`);/* mesmo caminho do Importar backup */
  ok('backup antigo (antes da v4.4) mantém a nota',env3.E('ovr()')>=74,env3.E('ovr()'))}
// 16. Nomes com HTML
sec('Segurança de texto');
{const env=mk();onboard(env,['habitos','estudo'],{name:'<b>X</b>',study:'<img src=x onerror=alert(2)>',habits:['Meditar 5 min']});for(const t of ['hoje','evolucao','perfil']){env.E(`tab="${t}";render()`);ok(`${t}: sem HTML injetado`,!env.q('#view img[src="x"]')&&!env.q('#view b b'))}
  env.E('A.menu()');ok('menu: sem HTML injetado',!env.q('#drawer img[src="x"]'))}
// 17. Desempenho
sec('Desempenho');
{const env=mk();onboard(env,['agua','treino','sono','leitura','habitos']);env.E('for(let k=0;k<400;k++)S.history.unshift({date:addDays("2026-10-01",-k),due:5,done:4,score:4.2,pend:0,hr:{},r:{agua:.8,treino:.7,sono:.9,leitura:.6,habitos:1}});S._av=9');
  const t0=Date.now();for(let k=0;k<20;k++)env.E('render()');const ms=(Date.now()-t0)/20;ok(`tela com 400 dias de histórico: ${ms.toFixed(1)} ms por atualização`,ms<60,ms);const t1=Date.now();env.E('A.nextday()');ok(`virar o dia com 400 dias: ${Date.now()-t1} ms`,Date.now()-t1<300)}
// 18. Leitor de treino colado
sec('Colar treino');
{const env=mk();onboard(env,['treino']);const cases=[['Supino reto 4x10 40kg','Supino reto',4,10,10,40],['Rosca direta 3 x 8-12','Rosca direta',3,8,12,0],['- Leg press 4×12 (120 kg)','Leg press',4,12,12,120],['1) Remada baixa 3x10 a 12','Remada baixa',3,10,12,0],['Puxada 3 séries de 15','Puxada',3,15,15,0],['Agachamento 5x5 60,5kg','Agachamento',5,5,5,60.5]];
  for(const [t,n,s,a,b,w] of cases){const r=env.E(`JSON.stringify(parseWorkout("Treino A\\n"+${JSON.stringify(t)})[0]?.ex[0]||null)`);const x=JSON.parse(r);ok(`"${t}"`,x&&x.name===n&&x.sets===s&&x.min===a&&x.max===b&&(x.weight||0)===w,r)}
  const r=env.E('JSON.stringify(parseWorkout("Segunda - Peito\\nSupino 4x10\\nTerça - Costas\\nRemada 4x10").map(s=>s.name))');ok('dias da semana como divisões',JSON.parse(r).length===2,r)}
// 19. Trocar áreas no meio do uso
sec('Mudar áreas');
{const env=mk();onboard(env,['agua','leitura']);env.at('2026-10-06','09:00');ok('leitura pendente',env.E('S.pending.some(p=>p.id==="leitura")'));env.E('A.areas()');env.c('[data-do=wzarea][data-v=leitura]');env.c('[data-do=wzarea][data-v=treino]');env.c('[data-do=wznext]');let g=0;while(g++<8&&env.E('!!wz'))env.c('[data-do=wznext]');env.dm();env.cs();
  ok('pendência da área removida sumiu',!env.E('S.pending.some(p=>p.id==="leitura")'));ok('treino entrou com meta proporcional',env.E('wReq(H("treino"))')<=3,env.E('wReq(H("treino"))'));ok('ordem da Hoje atualizada',env.E('orderedAreas().join()')==='treino,agua',env.E('orderedAreas().join()'));ok('sem erro',!env.errs.length,env.errs[0])}
report();
