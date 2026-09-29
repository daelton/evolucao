const {JSDOM}=require('jsdom');const fs=require('fs'),path=require('path');const {ok,sec,report,mk,onboard}=require('./lib');
const HTML=fs.readFileSync(process.env.APP||path.join(__dirname,'../index.html'),'utf8');
function mkN(){const msgs=[];const dom=new JSDOM(HTML,{runScripts:'dangerously',url:'https://evolucao.app/',pretendToBeVisual:true,beforeParse(w){w.ReactNativeWebView={postMessage:m=>msgs.push(JSON.parse(m))};w.scrollTo=()=>{};w.confirm=()=>true;w.fetch=()=>Promise.reject()}});
  const w=dom.window,d=w.document,E=s=>w.eval(s),q=s=>d.querySelector(s),c=s=>{const e=q(s);if(!e)throw new Error('faltou '+s);e.click()};return{w,d,E,q,c,msgs,dm:()=>{let n=0;while(q('#modal.on')&&n++<30)c('#mOk')},errs:[]}}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
sec('Agenda: "Quando?" e replanejar');
{const env=mk();onboard(env,['treino','leitura','habitos'],{habits:['Meditar 5 min','Sem doce'],time:'09:00'});const {E,q,c}=env;
  E('openItem("leitura")');ok('painel mostra "Quando você vai fazer?"',!!q('#sheetBody .whenrow'));c('#sheetBody .whenrow');ok('abre o editor de horário',E('sheetId')==='__when');
  c('[data-do=whent][data-v="07:00"]');c('[data-do=whenc][data-v="depois do café"]');ok('salva horário e gancho',E('H("leitura").time')==='07:00'&&E('H("leitura").cue')==='depois do café');
  c('[data-do=whenback]');ok('volta para o item mostrando o horário',q('#sheetBody .whenrow b').textContent.includes('07:00 · depois do café'));E('closeSheet();render()');
  ok('linha da Hoje mostra o horário',q('.row-main[data-v=leitura]').textContent.includes('07:00'));
  ok('passou do horário: oferece mover',(E('openItem("leitura")'),!!q('#sheetBody [data-do=move]')));c('#sheetBody [data-do=move]');ok('movido só hoje',E('!!S.today.move.leitura')&&E('H("leitura").time')==='07:00'&&q('.row-main[data-v=leitura]').textContent.includes(E('S.today.move.leitura')));
  env.at('2026-10-06','09:00');ok('no dia seguinte volta ao horário de sempre',!E('S.today.move||null')||!E('(S.today.move||{}).leitura'));ok('sem erro',!env.errs.length,env.errs[0])}
sec('Avisos no iPhone');
{const n=mkN();const {E,q,c}=n;E('S.offset=new Date("2026-10-05T08:00:00").getTime()-Date.now();S.today=newDay(vdate());render()');c('[data-do=wznext]');q('#wName').value='D';c('[data-do=wznext]');for(const a of ['treino','leitura','habitos','sono','agua'])c(`[data-do=wzarea][data-v=${a}]`);c('[data-do=wznext]');let g=0;
  while(g++<14&&E('!!wz')){const st=E('wz.steps[wz.i]');if(st==='treino'){q('#wGymT').value='17:00'}if(st==='habitos')c('[data-do=wzidea][data-v="Meditar 5 min"]');c('[data-do=wznext]')}n.dm();E('closeSheet();S.today.rv=true');
  E('H("leitura").time="21:30";H("leitura").cue="antes de dormir";S.habits.find(h=>h.name==="Meditar 5 min").time="00:30";save()');await wait(1400);
  ok('sem permissão não agenda nada',!n.msgs.some(m=>m.t==='schedule'&&m.list.length));
  E('A.avisoson()');ok('pede permissão ao iPhone',n.msgs.some(m=>m.t==='notifperm'));E('__evoNotifPerm("granted")');await wait(100);
  const sch=n.msgs.filter(m=>m.t==='schedule').pop();ok('agendou avisos',sch&&sch.list.length>0,JSON.stringify(n.msgs.map(m=>m.t)));
  const L=sch.list,f=(id)=>L.filter(x=>x.id.startsWith('evo-'+id));const dt=ms=>{const d=new Date(ms);return d.toISOString().slice(0,10)+' '+d.toTimeString().slice(0,5)};
  ok('leitura 21:30 hoje, amanhã e depois',f('leitura').length===3&&dt(f('leitura')[0].at).endsWith('21:30'),f('leitura').map(x=>dt(x.at)).join());
  ok('texto do aviso usa o gancho',f('leitura')[0].body.startsWith('antes de dormir'),f('leitura')[0].body);
  const md=L.find(x=>x.title==='Meditar 5 min');ok('00:30 cai na madrugada do dia seguinte (o dia vira no meio do sono)',md&&dt(md.at).startsWith('2026-10-06 00:30'),md&&dt(md.at));
  ok('treino só nos dias de treino',f('treino').every(x=>[1,3,5].includes(new Date(x.at).getDay())),f('treino').map(x=>dt(x.at)).join());
  ok('Bom dia amanhã depois de acordar',L.some(x=>x.id.startsWith('evo-bomdia-2026-10-06')&&dt(x.at).endsWith('07:10')),L.filter(x=>x.id.includes('bomdia')).map(x=>dt(x.at)).join());
  const fim=L.find(x=>x.id==='evo-fim-2026-10-05');ok('Fechar o dia com o que falta',fim&&/Faltam \d+ itens/.test(fim.body),fim&&fim.body);
  ok('no máximo 60 avisos',L.length<=60);
  E('addQty(H("leitura"),10);save()');await wait(1400);const sch2=n.msgs.filter(m=>m.t==='schedule').pop();ok('item feito sai dos avisos de hoje',!sch2.list.some(x=>x.id==='evo-leitura-2026-10-05'),sch2.list.filter(x=>x.id.includes('leitura')).map(x=>x.id).join());
  E('tab="ajustes";render()');ok('Ajustes mostra "Avisos" e os próximos',q('#view').textContent.includes('Próximos avisos'));
  const sw=q('input[data-notif="evening"]');sw.checked=false;sw.dispatchEvent(new n.w.Event('change',{bubbles:true}));await wait(50);const sch3=n.msgs.filter(m=>m.t==='schedule').pop();ok('desligar "Fechar o dia"',!sch3.list.some(x=>x.id.startsWith('evo-fim')));
  E('A.avisosoff()');await wait(50);const sch4=n.msgs.filter(m=>m.t==='schedule').pop();ok('desligar tudo limpa os avisos',sch4.list.length===0)}
{const env=mk();onboard(env,['leitura']);env.E('H("leitura").time="07:00";save()');ok('no site não tenta agendar',!env.E('NATIVE'));env.E('tab="ajustes";render()');ok('site explica que avisos são no app',env.q('#view').textContent.includes('funcionam no app do iPhone'))}
report()})();
