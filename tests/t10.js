const {mk,onboard,ok,sec,report}=require('./lib');
sec('Lembrete de água');
{const env=mk();onboard(env,['agua','sono'],{time:'07:00',sleep:['23:00','07:00']});const {E,q,c}=env;
  E('openWater()');ok('painel da água tem "Lembrete de água"',!!q('#sheetBody [data-do=waterrem]'));c('#sheetBody [data-do=waterrem]');ok('abre a configuração',E('sheetId')==='__wr');
  const sw=q('input[data-wr="water"]');sw.checked=true;sw.dispatchEvent(new env.w.Event('change',{bubbles:true}));ok('liga',E('notif().water')===true);
  ok('padrão: a cada 1 h, das 07:30 às 22:00, só se atrasado',E('notif().waterEvery')===60&&E('waterWin(S.today.date).from')==='07:30'&&E('waterWin(S.today.date).to')==='22:00'&&E('notif().waterMode')==='atraso');
  const nA=E('waterPlan(0,S.today.date).length');ok(`sem beber nada: lembra o dia todo (${nA})`,nA>=12,nA);
  E('addWater(1.5)');const nB=E('waterPlan(0,S.today.date).length');ok(`adiantado (1,5 L às 7h): lembra só quando ficar para trás (${nB})`,nB<nA&&nB>0,nB);
  E('addWater(1.2)');ok('bateu a meta: nenhum lembrete hoje',E('waterPlan(0,S.today.date).length')===0);ok('amanhã volta a lembrar',E('waterPlan(1,addDays(S.today.date,1)).length')>0);
  c('#sheetBody [data-do=wrmode][data-v=sempre]');E('delWater(1);delWater(0)');const nC=E('waterPlan(0,S.today.date).length');ok(`modo "em todo intervalo" (${nC})`,nC>=nA-1,nC);
  c('#sheetBody [data-do=wrevery][data-v="120"]');ok('a cada 2 h diminui',E('waterPlan(0,S.today.date).length')<nC);
  const f=q('#wrFrom');f.value='09:00';f.dispatchEvent(new env.w.Event('change',{bubbles:true}));ok('janela "das 09:00" respeitada',E('waterPlan(0,S.today.date).every(x=>new Date(x.at).getHours()>=9)'));
  ok('nunca de madrugada',E('waterPlan(1,addDays(S.today.date,1)).every(x=>{const h=new Date(x.at).getHours();return h>=7&&h<=22})'));
  E('notif().on=true;notif().perm="granted"');ok('entra na lista de avisos com a categoria da água',E('planList().some(x=>x.cat==="agua")'));
  const x0=E('ent(H("agua")).value||0');E('__evoWaterAction("drink","evo-agua-teste:1")');ok('botão "+ copo" do aviso registra',Math.abs(E('ent(H("agua")).value')-x0-.25)<.001);E('__evoWaterAction("drink","evo-agua-teste:1")');ok('o mesmo aviso não registra duas vezes',Math.abs(E('ent(H("agua")).value')-x0-.25)<.001);
  E('closeSheet();__evoOpen("agua")');ok('tocar no aviso abre a água',E('sheetId')==='agua');
  E('tab="ajustes";render()');ok('Ajustes → Avisos tem o atalho',!!q('#view [data-do=waterrem]'));ok('sem erro',!env.errs.length,env.errs[0])}
report();
