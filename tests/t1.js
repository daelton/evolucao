const {mk,onboard,ok,sec,report}=require('./lib');
const AREAS=['agua','treino','movimento','sono','leitura','estudo','corpo','habitos'];
// 1. Cadastro: cada área sozinha, todas juntas, nenhuma
sec('Cadastro inicial');
for(const a of AREAS){const env=mk();try{onboard(env,[a]);ok(`só ${a}: concluiu`,env.E('S.onboarded&&S.areas.join()')===a,env.E('S.areas.join()'));ok(`só ${a}: sem erro JS`,!env.errs.length,env.errs[0])}catch(e){ok(`só ${a}`,false,e.message)}}
{const env=mk();onboard(env,AREAS);ok('todas as áreas: 8 atributos',env.E('S.areas.length')===8);ok('todas: sem erro',!env.errs.length,env.errs[0])}
{const env=mk();env.c('[data-do=wznext]');env.q('#wName').value='X';env.c('[data-do=wznext]');env.c('[data-do=wznext]');ok('nenhuma área: bloqueia com mensagem',env.q('#wzErr').textContent.length>0)}
{const env=mk();env.c('[data-do=wznext]');env.q('#wName').value='';env.c('[data-do=wznext]');ok('nome vazio: bloqueia',env.q('#wzErr').textContent.includes('chamado'))}
{const env=mk();onboard(env,['treino'],{gymKind:'programa'});ok('"já tenho treino": abre cadastro do treino',env.q('#sheetBody')&&/Cadastrar meu treino/.test(env.q('#sheetBody').textContent)||env.E('!S.program.splits.some(x=>x.ex.length)'))}
{const env=mk();onboard(env,['movimento'],{moveMode:'min'});ok('movimento por minutos',env.E('H("movimento").kind')==='minutes')}
{const env=mk();onboard(env,['movimento']);ok('movimento padrão = passos',env.E('H("movimento").kind')==='steps')}
// 2. Páginas renderizam
sec('Páginas');
for(const set of [AREAS,['agua'],['habitos'],['treino'],['sono','leitura']]){const env=mk();onboard(env,set);for(const t of ['hoje','tarefas','treino','evolucao','historia','perfil','ajustes']){env.E(`tab="${t}";render()`);const txt=env.q('#view').textContent.trim();ok(`${set.length===8?'todas':set.join('+')} · ${t}`,txt.length>20&&!env.errs.length,env.errs[0]||'vazio')}}
// 3. Folhas de registro abrem
sec('Folhas de registro');
{const env=mk();onboard(env,AREAS);const ids=env.E('todayItems().map(x=>x.id).concat(weekItems().map(x=>x.id))');for(const id of [...new Set(ids)]){env.E(`openItem("${id}")`);ok(`abre ${id}`,env.E('sheetOpen')&&!env.errs.length,env.errs[0]);env.cs()}
  for(const f of ['openReview()','openProg()','openImport()','openTrainSetup()','openSession()','openWeigh()','openHabitEdit(null)','openLoreAdd()','openExEdit(0,0)','openSteps()']){try{if(f==='openExEdit(0,0)')env.E('pdraft=clone(program())');env.E(f);ok(f,env.E('sheetOpen')&&!env.errs.length,env.errs[0])}catch(e){ok(f,false,e.message)}env.cs()}
  env.E('A.menu()');ok('menu lateral abre',env.q('#drawer').classList.contains('on'))}
// 4. Clique em todos os botões de todas as telas (menos os que saem do app)
sec('Todos os botões');
{const env=mk();onboard(env,AREAS);const skip=new Set(['reset','export','ics','icsopen','update','importb','photo','photo2','copy','checkupd','photodel']);let clicks=0;
  for(const t of ['hoje','tarefas','treino','evolucao','historia','perfil','ajustes']){for(let pass=0;pass<2;pass++){env.E(`tab="${t}";render()`);const bs=[...env.d.querySelectorAll('#view [data-do]')].map((b,i)=>i);
    for(const i of bs){env.E(`tab="${t}";render()`);const b=[...env.d.querySelectorAll('#view [data-do]')][i];if(!b||skip.has(b.dataset.do))continue;try{b.click();clicks++}catch(e){env.errs.push(e.message)}env.dm();
      const sb=[...env.d.querySelectorAll('#sheetBody [data-do]')];for(const x of sb.slice(0,12)){if(skip.has(x.dataset.do)||!x.isConnected)continue;try{x.click();clicks++}catch(e){env.errs.push(e.message)}env.dm()}env.cs();if(env.E('!!wz'))env.E('wz=null;render()')}}}
  ok(`${clicks} cliques sem erro`,!env.errs.length,env.errs.slice(0,3).join(' | '))}
report();
