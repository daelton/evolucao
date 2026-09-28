const {JSDOM}=require('jsdom');const fs=require('fs'),path=require('path');const {ok,sec,report}=require('./lib');
const HTML=fs.readFileSync(process.env.APP||path.join(__dirname,'../index.html'),'utf8');
function mkNative(boot){const msgs=[];const dom=new JSDOM(HTML,{runScripts:'dangerously',url:'https://evolucao.app/',pretendToBeVisual:true,beforeParse(w){w.ReactNativeWebView={postMessage:m=>msgs.push(JSON.parse(m))};if(boot)w.__EVO_BOOT=boot;w.scrollTo=()=>{};w.confirm=()=>true;w.fetch=()=>{msgs.push({t:'FETCH'});return Promise.reject()}}});return{dom,w:dom.window,d:dom.window.document,E:s=>dom.window.eval(s),msgs}}
sec('Dentro do app nativo');
{const n=mkNative();ok('detecta o app nativo',n.E('NATIVE')===true);n.d.querySelector('[data-do=wznext]').click();n.d.querySelector('#wName').value='Nativo';n.d.querySelector('[data-do=wznext]').click();n.d.querySelector('[data-do=wzarea][data-v=agua]').click();n.d.querySelector('[data-do=wznext]').click();let g=0;while(g++<8&&n.E('!!wz'))n.d.querySelector('[data-do=wznext]').click();
  n.E('while(Q.length)Q.shift();showing=false;closeSheet();addWater(.5)');return new Promise(r=>setTimeout(r,450)).then(()=>{const sv=n.msgs.filter(m=>m.t==='save');ok('salva no armazenamento do iPhone',sv.length>=1&&JSON.parse(sv[sv.length-1].data).name==='Nativo');
    ok('vibração ao marcar',n.msgs.some(m=>m.t==='haptic'));ok('sem aviso de Safari',!n.d.querySelector('#view').textContent.includes('Safari'));ok('não procura atualização pelo site',!n.msgs.some(m=>m.t==='FETCH'));
    n.E('A.export()');ok('backup vira compartilhamento nativo',n.msgs.some(m=>m.t==='share'&&/backup/.test(m.name)&&JSON.parse(m.data).name==='Nativo'));
    n.E('A.importb()');ok('importar pede o seletor de arquivos do iPhone',n.msgs.some(m=>m.t==='import'));
    const bk=JSON.parse(n.msgs.filter(m=>m.t==='save').pop().data);bk.name='Importado';n.E(`__evoImport(${JSON.stringify(JSON.stringify(bk))})`);ok('importar aplica o backup',n.E('S.name')==='Importado');
    const n2=mkNative(JSON.stringify(bk));ok('abre com os dados salvos no iPhone',n2.E('S.name')==='Importado'&&n2.E('S.onboarded'));
    n.E('tab="ajustes";render()');ok('Ajustes explica atualização automática',n.d.querySelector('#view').textContent.includes('chegam sozinhas'));report()})}
