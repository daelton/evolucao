const {mk,onboard,ok,sec,report}=require('./lib');
sec('Integração (simulador)');
{const env=mk();onboard(env,['treino','movimento','sono','corpo','agua'],{time:'06:00'});env.E('S.test=true;tab="ajustes";render()');
  ok('seção Integrações aparece',env.q('#view').textContent.includes('Integrações'));ok('simulador aparece no Modo teste',!!env.q('[data-do=simsteps]'));
  env.at('2026-10-05','07:10');env.E('S.today.rv=true;tab="ajustes";render()');
  env.E('integ().water=true');for(const a of ['simsteps','simsleep','simforca','simwalk','simweight','simwater']){env.E('tab="ajustes";render()');env.c(`[data-do=${a}]`);env.dm();env.cs()}
  ok('passos entraram',env.E('ent(H("movimento")).value')===8200,env.E('JSON.stringify(ent(H("movimento")))'));ok('sono registrado',env.E('ent(H("sono")).done||ent(H("sono")).failed'),env.E('JSON.stringify(ent(H("sono")))'));
  ok('treino marcado',env.E('ent(H("treino")).done'));ok('peso registrado',env.E('wCount(H("corpo"))')===1);ok('água somou',env.E('ent(H("agua")).value')>=.5,env.E('ent(H("agua")).value'));
  ok('linha Passos mostra origem',env.E('tab="hoje";render(),document.querySelector("#view").textContent.includes("Saúde")'));
  env.E('tab="ajustes";render()');const sw=env.q('input[data-integ="steps"]');sw.checked=false;sw.dispatchEvent(new env.w.Event('change',{bubbles:true}));ok('desligar passos em Ajustes',env.E('integ().steps')===false);
  ok('sem erro',!env.errs.length,env.errs[0])}
report();
