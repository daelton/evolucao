const {mk,onboard,ok,sec,report}=require('./lib');
sec('Pausa');
{const env=mk();onboard(env,['agua','leitura']);env.E('A.pause({dataset:{v:"3"}})');const x0=env.E('S.xp'),st=env.E('S.streak');env.at('2026-10-08','09:00');
  ok('3 dias pausados sem perder XP',env.E('S.xp')===x0,env.E('S.xp')+' vs '+x0);ok('sem pendências',env.E('S.pending.length')===0);ok('pausa encerra sozinha',env.E('S.paused')===null,env.E('JSON.stringify(S.paused)'));ok('nota congelada',env.E('ovr()')===50,env.E('ovr()'))}
sec('Configurar cada área');
{const env=mk();onboard(env,['agua','treino','movimento','sono','leitura','estudo','corpo','habitos']);for(const a of ['agua','treino','movimento','sono','leitura','estudo','corpo']){env.E(`A.areacfg({dataset:{v:"${a}"}})`);let g=0;while(g++<6&&env.E('!!wz'))env.c('[data-do=wznext]');env.dm();env.cs();ok(`editar ${a} e salvar`,!env.errs.length&&env.E('!wz'),env.errs[0])}
  env.E('A.me()');let g=0;while(g++<6&&env.E('!!wz'))env.c('[data-do=wznext]');env.dm();ok('editar perfil e salvar',!env.errs.length&&env.E('tab')==='evolucao',env.errs[0])}
sec('Desfazer e apagar');
{const env=mk();onboard(env,['agua','leitura','movimento','habitos']);env.E('addWater(2.5)');ok('água completa',env.E('ent(H("agua")).done'));env.E('delWater(0)');ok('apagar volta para não feita e tira XP',!env.E('ent(H("agua")).done'),'');
  env.E('addQty(H("leitura"),10)');env.E('delQty(H("leitura"),0)');ok('leitura: apagar desfaz',!env.E('ent(H("leitura")).done'));
  env.E('openSteps()');env.q('#stIn').value='8000';env.c('[data-do=stepsave]');ok('passos 8.000 feito',env.E('ent(H("movimento")).done'));env.E('openSteps()');env.q('#stIn').value='5000';env.c('[data-do=stepsave]');ok('corrigir para 5.000 desfaz',!env.E('ent(H("movimento")).done'));
  const h=env.E('S.habits.find(h=>h.kind==="check").id');env.E(`complete(H("${h}"),10)`);env.E(`A.hundo({dataset:{v:"${h}"}})`);ok('hábito: desfazer',!env.E(`ent(H("${h}")).done`));
  try{env.E('A.hundo({dataset:{v:"naoexiste"}})');ok('desfazer item inexistente não quebra',!env.errs.length,env.errs[0])}catch(e){ok('desfazer item inexistente não quebra',false,e.message)}
  env.E('closeSheet()');try{env.E('A.qdel({dataset:{v:"0"}})');ok('apagar registro com painel fechado não quebra',!env.errs.length,env.errs[0])}catch(e){ok('apagar registro com painel fechado não quebra',false,e.message)}}
sec('Livro e pesagem');
{const env=mk();onboard(env,['leitura','corpo']);env.E('H("leitura").book={title:"Duna",total:30,cur:25,done:false}');env.E('openQty("leitura")');env.q('#pgIn').value='30';env.c('[data-do=pgset]');env.dm();ok('página 30 de 30 termina o livro',env.E('H("leitura").book.done')&&env.E('S.stats.books')===1);
  env.E('openWeigh()');env.q('#kg').value='71,4';env.c('[data-do=weighsave]');ok('pesagem com vírgula',env.E('S.profile.weight')===71.4,env.E('S.profile.weight'))}
sec('Resumo da semana');
{const env=mk();onboard(env,['agua','leitura','treino']);for(let k=0;k<7;k++){env.E('addWater(.5)');env.E('A.nextday()');env.dm();env.cs();env.E('while(S.pending.length)resolvePending(S.pending[0],false)')}
  ok('semana registrada',env.E('(S.weekLog||[]).length')>=1);env.E('render()');ok('aviso "Sua semana" aparece',!!env.q('[data-do=weekrev]'));env.c('[data-do=weekrev]');ok('abre com sugestões',env.E('S._sg.length')>=1,env.E('JSON.stringify(S._sg)'));ok('sem erro',!env.errs.length,env.errs[0])}
sec('Lembretes (Calendário)');
{const env=mk();onboard(env,['agua','treino','sono','corpo']);const ics=env.E('buildICS()');const b=(ics.match(/BEGIN:VEVENT/g)||[]).length,e=(ics.match(/END:VEVENT/g)||[]).length;ok(`${b} eventos, estrutura fechada`,b>0&&b===e);ok('linhas no padrão do Calendário (CRLF)',ics.includes('\r\n'));ok('sem link que abre no Safari',!/URL:/.test(ics))}
sec('Importar arquivo inválido');
{const env=mk();onboard(env,['agua']);ok('migrate rejeita lixo',env.E('migrate({a:1})')===null);ok('migrate rejeita texto',env.E('migrate("x")')===null)}
sec('Bom dia no fim de semana');
{const env=mk();onboard(env,['sono']);env.E('S.profile.we={wake:"10:00",sleep:"01:00"}');env.at('2026-10-10','07:30');ok('sábado 07:30 (acorda 10:00) ainda não pede o Bom dia',!env.E('needReview()'),env.E('needReview()'))}
report();
