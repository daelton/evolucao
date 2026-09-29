const {mk,onboard,ok,sec,report}=require('./lib');
sec('Antes do teste real');
{const env=mk();env.E('S.offset=new Date("2026-10-05T20:36:00").getTime()-Date.now();S.today=newDay(vdate());render()');ok('primeira tela tem "importar backup"',!!env.q('[data-do=importb]'));
  onboard(env,['sono','agua'],{date:'2026-10-05',time:'20:36'});env.E('S.today.rv=false;maybeReview()');ok('no primeiro dia, à noite, o Bom dia não abre sozinho',!env.E('sheetOpen'));env.E('render()');ok('banner diz "Registrar a noite" fora da manhã',!env.q('[data-do=review]')||env.q('[data-do=review]').textContent.includes('Registrar a noite'),env.q('[data-do=review]')&&env.q('[data-do=review]').textContent);
  env.at('2026-10-06','06:40');env.E('S.today.rv=false;closeSheet();maybeReview()');ok('na manhã seguinte abre',env.E('sheetOpen'));
  env.E('closeSheet();S.today.rv=false');env.at('2026-10-06','21:00');env.E('while(S.pending.length)resolvePending(S.pending[0],true);S.today.rv=false;closeSheet();maybeReview()');ok('à noite sem pendências não abre sozinho',!env.E('sheetOpen'))}
{const env=mk();onboard(env,['agua','leitura']);env.E('addWater(.5)');const bk=env.E('JSON.stringify(S)');const env2=mk();env2.E('S.offset=new Date("2026-10-05T09:00:00").getTime()-Date.now();S.today=newDay(vdate());render()');env2.E(`importText(${JSON.stringify(bk)})`);
  ok('importar na primeira tela leva direto para a Hoje',env2.E('S.onboarded&&!wz')&&!!env2.q('.sum'),env2.E('!!wz'))}
{const env=mk();onboard(env,['agua']);env.E('tab="ajustes";render()');env.c('[data-do=report]');ok('Relatar um problema abre',env.E('sheetId')==='__rep');const t=env.E('reportText("teste")');ok('relatório tem versão, tela e sem dados pessoais',/versão 4\.9\.1/.test(t)&&!/Daelton|Teste/.test(t.split('O que aconteceu')[0]),t.slice(0,160))}
report();
