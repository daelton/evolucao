import asyncio,sys,json
from playwright.async_api import async_playwright
FILE=sys.argv[1];OLD=len(sys.argv)>2
SHEETS=['openWater()','openTrain()','openQty("leitura")','openMove()','openReview()','openSession()','openProg()','openImport()','openWeigh()','openHabitEdit(null)','openLoreAdd()','openTrainSetup()']
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome",args=["--no-sandbox"])
        ctx=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto("file://"+FILE);ev=pg.evaluate;c=pg.click;cdp=await ctx.new_cdp_session(pg)
        async def touch(pts):
            await cdp.send("Input.dispatchTouchEvent",{"type":"touchStart","touchPoints":[{"x":pts[0][0],"y":pts[0][1]}]})
            for x,y in pts[1:]:
                await cdp.send("Input.dispatchTouchEvent",{"type":"touchMove","touchPoints":[{"x":x,"y":y}]});await pg.wait_for_timeout(16)
            await cdp.send("Input.dispatchTouchEvent",{"type":"touchEnd","touchPoints":[]});await pg.wait_for_timeout(350)
        line=lambda x,y0,y1,n=12:[(x,y0+(y1-y0)*k/n) for k in range(n+1)]
        await ev('S.offset=new Date("2026-10-05T10:00:00").getTime()-Date.now();S.today=newDay(vdate());render()')
        await c('[data-do=wznext]');await pg.fill('#wName','Daelton');await c('[data-do=wznext]')
        for a in ['agua','treino','movimento','sono','leitura','corpo','habitos']: await c(f'[data-do=wzarea][data-v={a}]')
        await c('[data-do=wznext]')
        for i in range(12):
            if not await ev('!!wz'): break
            if await ev('wz.steps[wz.i]')=='habitos': await c('[data-do=wzidea][data-v="Meditar 5 min"]')
            await c('[data-do=wznext]')
        await ev('while(Q.length)Q.shift();showing=false;$("#modal").classList.remove("on");closeSheet();S.today.rv=true;render()')
        if OLD: await ev('document.head.insertAdjacentHTML("beforeend","<style>.sheet{padding-bottom:34px!important}</style>")')
        else: await ev('document.documentElement.style.setProperty("--sab","34px")')
        res={}
        for f in SHEETS:
            r={}
            await ev('closeSheet();window.scrollTo(0,300)');await pg.wait_for_timeout(100)
            y0=await ev('window.scrollY');vt0=await ev('document.querySelector("#view").getBoundingClientRect().top')
            await ev(f);await pg.wait_for_timeout(400)
            r['sem vazar embaixo']=await ev('(()=>{const e=document.elementFromPoint(195,836);return !!(e&&e.closest("#sheet"))})()')
            top=await ev('document.querySelector("#sheet").getBoundingClientRect().top')
            # arrastar em cima do escurecido e no meio do painel não pode mexer o fundo
            await touch(line(195,max(60,top-80),max(60,top-80)+150,8));await touch(line(195,min(800,top+300),min(800,top+300)-250,8))
            vt1=await ev('document.querySelector("#view").getBoundingClientRect().top')
            r['fundo parado']=abs(vt1-vt0)<2
            open1=await ev('sheetOpen')
            # arrastar pouco não fecha
            await ev('document.querySelector("#sheet").scrollTop=0');top=await ev('document.querySelector("#sheet").getBoundingClientRect().top')
            await touch(line(195,top+14,top+54,4));r['arrasto curto não fecha']=await ev('sheetOpen')
            # arrastar para baixo pela alça fecha
            await touch(line(195,top+14,top+260,12));r['arrastar para baixo fecha']=not await ev('sheetOpen')
            await pg.wait_for_timeout(300);r['volta onde estava']=abs(await ev('window.scrollY')-y0)<2
            res[f]=r
        # painel longo rolado: arrastar para baixo rola o conteúdo em vez de fechar
        await ev('openSession()');await pg.wait_for_timeout(400);await ev('document.querySelector("#sheet").scrollTop=400')
        await touch(line(195,420,620,8));res['treino rolado']={'rolar para cima não fecha':await ev('sheetOpen')};await ev('closeSheet()')
        # menu lateral: arrastar para a esquerda fecha
        await ev('A.menu()');await pg.wait_for_timeout(350);await touch([(250-k*18,400) for k in range(12)])
        res['menu']={'arrastar para a esquerda fecha':not await ev('document.querySelector("#drawer").classList.contains("on")')}
        tot=0;bad=0
        for k,v in res.items():
            for n,ok in v.items():
                tot+=1
                if not ok: bad+=1;print('  ✗',k,'·',n)
        print(f"{'ANTES' if OLD else 'DEPOIS'}: {tot-bad}/{tot} ok · erros JS: {len(errs)} {errs[:1]}")
        await b.close()
asyncio.run(main())
