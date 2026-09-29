const {mk,onboard}=require('./lib');
let seed=42;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
const env=mk();const {E,q,c,dm}=env;
onboard(env,['agua','treino','movimento','sono','leitura','habitos'],{date:'2026-10-05',time:'07:00',sleep:['23:00','06:30'],habits:['Sem doce','Meditar 5 min']});
E('S.profile.we={wake:"09:00",sleep:"00:30"};H("treino").time="17:00";H("treino").freq.days=[1,2,4,5];H("treino").freq.times=4;H("leitura").time="21:30";H("leitura").cue="antes de dormir";S.habits.find(h=>h.name==="Meditar 5 min").time="07:15";notif().on=true;notif().perm="granted";save()');
const out=[];let shields=0,pendAsk=0,taps=0,liveW=0,fuiW=0,levelDrops=0,prevLvl=1,skipOpen=new Set([15,16]);
for(let d=0;d<28;d++){
  const date=E(`addDays("2026-10-05",${d})`),dw=E(`dow("${date}")`),we=[0,6].includes(dw);
  if(skipOpen.has(d)){E(`S.offset=new Date("${E(`addDays("${date}",1)`)}T07:00:00").getTime()-Date.now();`);out.push({d,date,skipped:1});continue}
  E(`S.offset=new Date("${date}T07:30:00").getTime()-Date.now();loop();render()`);dm();
  const pend=E('S.pending.length');pendAsk+=pend;
  // Bom dia: confirma 70% do que ficou sem marcar (o resto some em 48 h)
  E(`S.today.rv=true;while(S.pending.length){const p=S.pending[0];resolvePending(p,${rnd()<.7})}`);E('closeSheet()');taps+=pend;
  const P=we?.6:.85;
  // sono
  const t=E(`JSON.stringify(sleepTargets("${date}"))`);const tg=JSON.parse(t);const late=rnd()<.25?50:rnd()<.15?100:0;
  E(`logSleep((toMin("${tg.bed}")+${late})%1440,(toMin("${tg.wake}")+${late>0?20:0})%1440)`);taps+=3;
  const notifs=E(`planList().filter(x=>new Date(x.at).toISOString().slice(0,10)==="${date}"||x.id.endsWith("${date}")).length`);
  if(rnd()<P){E('addWater(waterTarget()*(0.8+Math.random()*.4))');taps+=6}else if(rnd()<.6){E('addWater(waterTarget()*0.6)');taps+=4}
  if(rnd()<P){E('addQty(H("leitura"),10+Math.round(Math.random()*8))');taps+=2}else if(rnd()<.4){E('addQty(H("leitura"),5)');taps+=2}
  if(rnd()<P+.05){E('ent(H("movimento")).value=6000+Math.round(Math.random()*4000);if(ent(H("movimento")).value>=H("movimento").target&&!ent(H("movimento")).done)complete(H("movimento"),H("movimento").xp)');taps+=3}
  const med=E('S.habits.find(h=>h.name==="Meditar 5 min").id');if(rnd()<P-.1){E(`complete(H("${med}"),10)`);taps+=1}
  if(rnd()<.12){E(`ent(S.habits.find(h=>h.name==="Sem doce")).broken=true`);taps+=1}
  // treino nos dias certos
  if(E(`H("treino").freq.days.includes(${dw})`)&&rnd()<.8){if(rnd()<.5){E('openSession();liveOf().ex.forEach(e=>e.sets.forEach(z=>{z.done=true;z.w=z.w||40;z.r=Math.random()<.5?12:9}));saveLive()');dm();liveW++;taps+=15}else{E('A.fui()');fuiW++;taps+=1}}
  E(`S.offset=new Date("${date}T22:30:00").getTime()-Date.now();loop();commit()`);dm();E('closeSheet()');
  const lv=E('S.level');if(lv<prevLvl)levelDrops++;prevLvl=lv;
  out.push({d,date,dw,ovr:E('ovr()'),tier:E('cardTheme().l'),lvl:lv,xp:E('S.xp'),streak:E('S.streak'),pend,notifs,full:E('!!S.today.full')});
}
E(`S.offset=new Date("2026-11-02T07:30:00").getTime()-Date.now();loop()`);dm();
const byW=[0,1,2,3].map(w=>out.filter(x=>!x.skipped&&Math.floor(x.d/7)===w));
console.log('Semana | nota média | cor no fim | nível | seq. máx | Bom dia (perguntas/dia) | avisos/dia | dias completos');
byW.forEach((L,w)=>{const avg=k=>(L.reduce((s,x)=>s+x[k],0)/L.length);console.log(`S${w+1} | ${avg('ovr').toFixed(0)} | ${L[L.length-1].tier} | ${L[L.length-1].lvl} | ${Math.max(...L.map(x=>x.streak))} | ${avg('pend').toFixed(1)} | ${avg('notifs').toFixed(1)} | ${L.filter(x=>x.full).length}`)});
console.log('Primeira Prata no dia:',(out.find(x=>x.tier==="Prata")||{}).d,'| Primeiro Ouro:',(out.find(x=>x.tier==="Ouro")||{}).d);
console.log('Treinos: ao vivo',liveW,'· só "Fui"',fuiW,'| quedas de nível:',levelDrops,'| escudos usados:',E('S.history.filter(x=>x.sh).length'),'| recorde de sequência:',E('S.best'));
console.log('Toques estimados por dia:',(taps/26).toFixed(0),'| erros JS:',env.errs.length,env.errs[0]||'');
console.log('Depois dos 2 dias sem abrir (dias 15-16): nível',out[17]&&out[17].lvl,'seq',out[17]&&out[17].streak,'| pendências no dia 17:',out[17]&&out[17].pend);
console.log('Sugestões da semana:',E('JSON.stringify((S._sg=weekSuggestions((S.weekLog||[]).slice(-1)[0]||{q:{},s:{},m:{}})).map(x=>x.t))'));
process.exit(0)
