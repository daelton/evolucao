const {JSDOM}=require('jsdom');const fs=require('fs');
const HTML=fs.readFileSync(process.env.APP||require('path').join(__dirname,'../index.html'),'utf8');
const R=[];let cur='';
function sec(n){cur=n}
function ok(name,cond,detail){R.push({sec:cur,name,pass:!!cond,detail:cond?'':String(detail??'')})}
function mk(ls,opt={}){const errs=[];const dom=new JSDOM(HTML,{runScripts:'dangerously',url:'https://daelton.github.io/evolucao/',pretendToBeVisual:true,beforeParse(w){if(ls)w.localStorage.setItem('evolucao-v8',ls);w.scrollTo=()=>{};w.confirm=()=>true;w.prompt=()=>null;w.alert=()=>{};w.addEventListener('error',e=>errs.push(e.message+' @'+((e.error&&e.error.stack||'').split('\n')[1]||'')));if(opt.fetch)w.fetch=opt.fetch}});
  const w=dom.window,d=w.document,E=s=>w.eval(s),q=s=>d.querySelector(s),c=s=>{const e=q(s);if(!e)throw new Error('faltou '+s);e.click()},dm=()=>{let n=0;while(q('#modal.on')&&n++<40)c('#mOk')},cs=()=>{if(q('#sheet.on'))E('closeSheet()')};
  const at=(dt,h)=>{E(`S.offset=new Date("${dt}T${h}:00").getTime()-Date.now();loop();render()`);dm()};
  return{dom,w,d,E,q,c,dm,cs,at,errs}}
function onboard(env,areas,o={}){const{E,q,c,d,dm,cs}=env;E(`S.offset=new Date("${o.date||'2026-10-05'}T${o.time||'09:00'}:00").getTime()-Date.now();S.today=newDay(vdate());render()`);
  c('[data-do=wznext]');q('#wName').value=o.name||'Teste';c('[data-do=wznext]');for(const a of areas)c(`[data-do=wzarea][data-v=${a}]`);c('[data-do=wznext]');let g=0;
  while(g++<14&&E('!!wz')){const st=E('wz.steps[wz.i]');if(st==='horas'&&o.sleep){q('#wWake').value=o.sleep[1];q('#wSleep').value=o.sleep[0]}
    if(st==='estudo')q('#wStudyN').value=o.study||'Inglês';if(st==='treino'&&o.gymKind)c(`[data-do=wzset][data-k=gymKind][data-v=${o.gymKind}]`);
    if(st==='movimento'&&o.moveMode==='min')c('[data-do=wzset][data-k=moveMode][data-v=min]');
    if(st==='habitos')for(const h of (o.habits||['Meditar 5 min','Sem doce']))c(`[data-do=wzidea][data-v="${h}"]`);c('[data-do=wznext]')}
  dm();cs();E('S.today.rv=true')}
function report(){const by={};for(const r of R){(by[r.sec]=by[r.sec]||[]).push(r)}let tot=0,fail=0;for(const s in by){const f=by[s].filter(r=>!r.pass);tot+=by[s].length;fail+=f.length;console.log(`${f.length?'✗':'✓'} ${s}: ${by[s].length-f.length}/${by[s].length}`);for(const x of f)console.log('    FALHOU:',x.name,'→',x.detail.slice(0,220))}console.log(`TOTAL ${tot-fail}/${tot}`);setTimeout(()=>process.exit(fail?1:0),50)}
module.exports={mk,onboard,ok,sec,report,R};
