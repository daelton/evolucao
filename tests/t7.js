const {mk,onboard,ok,sec,report}=require('./lib');
sec('Treino ao vivo');
{const env=mk();onboard(env,['treino']);const {E,q,c}=env;
  env.E('S.program.splits[0].ex[0].weight=60;S.program.splits[0].ex[0].best=76.6;S.program.splits[0].ex[0].hist=[{d:"2026-10-01",w:57.5,r:[10,10,9],sets:[{w:57.5,r:10},{w:57.5,r:10},{w:55,r:9}]}]');
  env.c('.rbtn[data-do=fui]');env.E('openTrain()');env.c('[data-do=session]');
  E('closeSheet()');E('openSession()');ok('abre o treino ao vivo',E('sheetId')==='__live'&&!!q('.lx-row .lx-ok'),E('sheetId'));
  ok('mostra a coluna Anterior',q('.lx-prev').textContent.includes('57,5×10'),q('.lx-prev').textContent);
  const n=E('liveOf().ex[0].sets.length');ok('séries do programa',n===E('S.program.splits[0].ex[0].sets'));
  // copiar anterior na 3ª série
  c('[data-do=lvprev][data-e="0"][data-s="2"]');ok('toque em Anterior copia',E('liveOf().ex[0].sets[2].w')===55&&E('liveOf().ex[0].sets[2].r')===9);
  // digitar e marcar
  const i0=q('#lw0_0');i0.value='62,5';i0.dispatchEvent(new env.w.Event('input',{bubbles:true}));q('#lr0_0').value='12';q('#lr0_0').dispatchEvent(new env.w.Event('input',{bubbles:true}));
  c('[data-do=lvdone][data-e="0"][data-s="0"]');ok('série marcada com o que foi digitado',E('JSON.stringify(liveOf().ex[0].sets[0])')==='{"w":62.5,"r":12,"done":true,"wu":false}',E('JSON.stringify(liveOf().ex[0].sets[0])'));
  ok('descanso começou sozinho',E('restEnd>Date.now()')&&!!q('[data-do=restskip]'));c('[data-do=restadj][data-v="15"]');ok('+15 s',E('Math.round((restEnd-Date.now())/1000)')>=130);c('[data-do=restskip]');ok('pular descanso',E('restEnd')===0);
  // aquecimento
  c('[data-do=lvadd][data-e="0"]');ok('+ série',E('liveOf().ex[0].sets.length')===n+1);c(`[data-do=lvwu][data-e="0"][data-s="${n}"]`);ok('marca aquecimento',E(`liveOf().ex[0].sets[${n}].wu`)===true&&q(`.lx-row.wu`)!==null);
  // salvo mesmo fechando o app
  const saved=env.w.localStorage.getItem('evolucao-v8');const env2=mk(saved);ok('treino em andamento sobrevive a fechar o app',env2.E('!!liveOf()')&&env2.E('liveOf().ex[0].sets[0].done'));env2.E('render()');ok('aviso "Treino em andamento" na Hoje',!!env2.q('.banner[data-do=live]'));
  // marcar tudo (menos o aquecimento) e concluir
  E(`liveOf().ex.forEach((e,ei)=>e.sets.forEach((z,si)=>{if(!z.wu){z.done=true;z.w=z.w||40;z.r=12}}));save();openLive()`);
  const x0=E('S.program.splits[0].ex[0].weight'),sess0=E('S.program.sessions.length');c('[data-do=lvfinish]');env.dm();
  ok('concluir salva a sessão',E('S.program.sessions.length')===sess0+1&&E('!S.live'));const ss=E('JSON.stringify(S.program.sessions.slice(-1)[0])');ok('guarda duração, volume e séries',/"dur":\d+/.test(ss)&&/"vol":\d+/.test(ss)&&/"sets":\d+/.test(ss),ss);
  ok('aquecimento não entra no histórico',E('S.program.splits[0].ex[0].hist.slice(-1)[0].sets.length')===n,E('JSON.stringify(S.program.splits[0].ex[0].hist.slice(-1)[0])'));
  ok('bateu o máximo em todas: carga sobe',E('S.program.splits[0].ex[0].weight')>62.5,E('S.program.splits[0].ex[0].weight'));
  ok('recorde detectado',E('S.program.sessions.slice(-1)[0].prs')>=1);ok('treino do dia marcado e registrado',E('ent(H("treino")).done&&ent(H("treino")).logged'));
  E('tab="treino";render()');c('button.exl[data-do=exhist]');ok('histórico do exercício abre com gráfico/lista',E('sheetId')==='__exh'&&q('#sheetBody').textContent.includes('Últimos treinos'));
  ok('sem erro',!env.errs.length,env.errs[0])}
{const env=mk();onboard(env,['treino']);env.E('openSession()');env.c('[data-do=lvfinish]');ok('concluir sem nenhuma série marcada é bloqueado',env.E('!!S.live'));env.c('[data-do=lvdiscard]');ok('descartar',env.E('!S.live')&&!env.E('sheetOpen'))}
{const env=mk();onboard(env,['treino']);env.E('S.program.splits[0].ex[0].sets=3;openSession()');const r=env.E('liveOf().ex[0].sets.length');env.E('closeSheet();A.fui()');env.E('openSession()');ok('"Fui" e depois registrar usam o mesmo treino',env.E('liveOf().k')===env.E('ent(H("treino")).splitIdx'))}
report();
