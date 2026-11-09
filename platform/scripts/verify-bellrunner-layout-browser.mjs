import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {resolve,join} from 'node:path';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';

/* REAL Svelte pages, not duplicated mock UI. Stub only the API response so
 * protected character pages can be rendered in isolated Chromium QA.
 * Checks the precise failure seen at 2048px: a full-width image and a
 * parchment frame must occupy different vertical sections.
 */
const root=resolve(import.meta.dirname,'..');
const chrome=['google-chrome','chromium','chromium-browser'].find(x=>
  spawnSync('which',[x],{stdio:'ignore'}).status===0);
if(!chrome)throw Error('Chromium required for Bellrunner scene geometry.');
const profile=mkdtempSync(join(tmpdir(),'pall-bellrunner-layout-'));
// Start the npm/Vite process tree in its own group, so cleanup can
// terminate Vite itself rather than only its npm parent.
// The existing combat-browser check can leave Vite on 5173 behind.
 // Use a dedicated strict port so the Bellrunner test always exercises
 // THIS checkout and never a stale server from another fixture.
const server=spawn('npm',[
  'run','dev','-w','@the-pall/web','--','--port','5187','--strictPort'
],{
  cwd:root,stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'
});
let output='';
for(const stream of [server.stdout,server.stderr])stream.on('data',x=>{
  output+=String(x);if(output.length>25000)output=output.slice(-25000);
});
let browser,ws;
const close=()=>{
  try{ws?.close();}catch{}
  try{browser?.kill('SIGKILL');}catch{}
  try{
    if(process.platform!=='win32'&&server.pid)process.kill(-server.pid,'SIGTERM');
    else server.kill('SIGTERM');
  }catch{try{server.kill('SIGTERM');}catch{}}
  try{rmSync(profile,{recursive:true,force:true});}catch{}
};
const timeout=setTimeout(()=>{
  console.error('Bellrunner browser QA timed out: '+output.slice(-2000));
  close();process.exit(124);
},110000);
timeout.unref();
async function until(fn,ms=18000,label='condition'){
  const deadline=Date.now()+ms;let last;
  while(Date.now()<deadline){
    try{const result=await fn();if(result)return result;}catch(e){last=e;}
    await delay(175);
  }
  throw Error('Timed out waiting for '+label+
    (last?': '+last.message:'')+' Vite: '+output.slice(-2500));
}
try{
  const origin='http://127.0.0.1:5187';
  await until(async()=>{
    const r=await fetch(origin+'/characters/qa-bellrunner/opening');
    return r.ok;
  },40000,'SvelteKit web server');
  browser=spawn(chrome,[
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--no-first-run','--remote-allow-origins=*',
    '--remote-debugging-port=9248','--user-data-dir='+profile,'about:blank'
  ],{stdio:'ignore'});
  const tab=await until(async()=>{
    const r=await fetch('http://127.0.0.1:9248/json');
    const tabs=await r.json();
    return tabs.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
  },18000,'Chromium tab');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await Promise.race([
    new Promise((ok,bad)=>{
      ws.addEventListener('open',ok,{once:true});
      ws.addEventListener('error',bad,{once:true});
    }),
    delay(9000).then(()=>{throw Error('CDP handshake timeout');})
  ]);
  let id=0;const pending=new Map();
  ws.addEventListener('message',e=>{
    let msg;try{msg=JSON.parse(e.data);}catch{return;}
    if(!msg.id)return;
    const call=pending.get(msg.id);if(!call)return;
    pending.delete(msg.id);
    if(msg.error)call.reject(Error(JSON.stringify(msg.error)));
    else call.resolve(msg.result??{});
  });
  ws.addEventListener('close',()=>{
    for(const call of pending.values())call.reject(Error('CDP closed'));
    pending.clear();
  });
  function cmd(method,params={}){
    const callId=++id;
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{
        pending.delete(callId);reject(Error('CDP command deadline: '+method));
      },13000);
      pending.set(callId,{
        resolve(v){clearTimeout(timer);resolve(v);},
        reject(e){clearTimeout(timer);reject(e);}
      });
      ws.send(JSON.stringify({id:callId,method,params}));
    });
  }
  async function evalJS(expression){
    const r=await cmd('Runtime.evaluate',{
      expression,returnByValue:true,awaitPromise:true
    });
    if(r.exceptionDetails)throw Error('Browser exception: '+JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  }
  await cmd('Page.enable');
  await cmd('Runtime.enable');
  // Intercept browser API calls only; the page, component markup, CSS,
  // scene artwork and audio components are the actual app code.
  const inject=String.raw`(()=>{
    const original=window.fetch.bind(window);
    function json(value,status=200){
      return new Response(JSON.stringify(value),{
        status,headers:{'content-type':'application/json'}
      });
    }
    window.fetch=(input,options)=>{
      const url=new URL(typeof input==='string'?input:input.url,location.href);
      const route=url.pathname;
      if(!route.startsWith('/api/characters/qa-bellrunner'))return original(input,options);
      const opening=location.pathname.endsWith('/opening');
      const ch={
        id:'qa-bellrunner',name:'QA Bellrunner',origin:'Bellrunner',
        sex:'Male',coins:20,startingLocation:'Dispatch House',
        avatarId:null,welcomeSeen:true,
        health:{current:50,maximum:50},
        stamina:{current:100,maximum:100},
        tutorial:{stage:opening?1:2,status:opening?'NOT_STARTED':'IN_PROGRESS'}
      };
      if(route==='/api/characters/qa-bellrunner')return Promise.resolve(json({character:ch}));
      if(route.endsWith('/bellrunner/dispatch')){
        const key=new URLSearchParams(location.search).get('scene')||'short';
        const phase=key==='depot'?'issued':key==='receiving'?'spoiled_mark':'road_chosen';
        const road=key==='depot'?null:key==='long'?'quieter':'direct';
        return Promise.resolve(json({
          accepted:true,stage:2,tutorialStatus:'IN_PROGRESS',
          revision:0,workState:{phase,route:road,noticesOrdered:false,receipt:null},
          work:'Deliver council notices',skill:'Industry / Hauling',
          payment:'Not yet cleared',tutorialPayout:{coins:0,ordinaryXp:0,items:0}
        }));
      }
      if(route.endsWith('/dev/rewind-stage'))return Promise.resolve(json({
        enabled:false,canRewind:false,stage:ch.tutorial.stage,targetStage:null
      }));
      return Promise.resolve(json({error:'unavailable'},404));
    };
  })();`;
  await cmd('Page.addScriptToEvaluateOnNewDocument',{source:inject});
  function sceneMetrics(){
    return evalJS(String.raw`(()=>{
      const stack=document.querySelector('.pall-story-sections');
      const art=stack?.querySelector(':scope > .pall-story-landscape');
      const dialogue=stack?.querySelector(':scope > .pall-story-dialogue-section');
      const frame=dialogue?.querySelector('.work-card');
      const image=art?.querySelector('img.depot, img.environment');
      if(!stack||!art||!dialogue||!frame||!image)return null;
      const rect=x=>{
        const r=x.getBoundingClientRect();
        return {x:r.x,y:r.y,w:r.width,h:r.height,top:r.top,bottom:r.bottom,
          left:r.left,right:r.right};
      };
      return {art:rect(art),dialogue:rect(dialogue),frame:rect(frame),
        stack:rect(stack),img:rect(image),fit:getComputedStyle(image).objectFit,
        artAspect:getComputedStyle(art).aspectRatio,
        frameOverflow:getComputedStyle(frame).overflowY,
        loaded:image.complete&&image.naturalWidth>100,
        scrollHeight:document.documentElement.scrollHeight,
        viewport:window.innerHeight,top:window.scrollY,
        text:frame.textContent.slice(0,160),width:window.innerWidth};
    })()`);
  }
  for(const [width,height] of [
    [1920,1080],[2048,821],[3440,1440],[390,844]
  ]){
    await cmd('Emulation.setDeviceMetricsOverride',{
      width,height,deviceScaleFactor:1,mobile:false
    });
    for(const [route,scene] of [
      ['opening','stage1'],
      ['bellrunner/dispatch?scene=depot','stage2-depot'],
      ['bellrunner/dispatch?scene=short','short-route'],
      ['bellrunner/dispatch?scene=long','long-route'],
      ['bellrunner/dispatch?scene=receiving','receiving-desk']
    ]){
      await cmd('Page.navigate',{url:origin+'/characters/qa-bellrunner/'+route});
      const m=await until(async()=>{
        const val=await sceneMetrics();
        return val?.loaded&&val.frame.w>100?val:false;
      },24000,scene+' at '+width+'x'+height);
      const suffix=scene+' '+width+'×'+height+' '+JSON.stringify(m);
      assert.ok(Math.abs(m.art.h-m.art.w*941/1672)<2.5,
        'Full original aspect: '+suffix);
      assert.ok(m.dialogue.top>=m.art.bottom-2,
        'Dialogue is visibly BELOW the image, never on top: '+suffix);
      assert.ok(m.frame.top>=m.dialogue.top-1 &&
        m.frame.bottom<=m.dialogue.bottom+2,
        'Parchment fits inside dialogue section: '+suffix);
      assert.ok(m.frame.left>=m.dialogue.left-2 &&
        m.frame.right<=m.dialogue.right+2,
        'Frame is horizontally inside its section: '+suffix);
      assert.ok(m.frame.w<=982,
        'Readable parchment cannot span an ultrawide monitor: '+suffix);
      assert.equal(m.fit,'contain','Full image must not be cover-cropped: '+suffix);
      assert.equal(m.frameOverflow,'visible','No internal frame scrollbar: '+suffix);
      assert.ok(m.art.h>0&&m.dialogue.h>90&&m.stack.bottom>=m.frame.bottom-2,
        'All two-section content must be in page flow: '+suffix);
      await evalJS("document.querySelector('.pall-story-dialogue-section')?.scrollIntoView({block:'start',behavior:'instant'});true");
      const scrolled=await sceneMetrics();
      assert.ok(scrolled.top>=0&&scrolled.frame.w>100,'Dialogue must be reachable: '+suffix);
      console.log('PASS: '+scene+' '+width+'×'+height+
        ' artwork '+Math.round(m.art.w)+'×'+Math.round(m.art.h)+
        ' dialogue below at '+Math.round(m.dialogue.top));
    }
  }
  // Real pointer interactions: the artwork itself only hosts the NPC and
  // paper assets, while the response/inspection text appears in Section 2.
  await cmd('Emulation.setDeviceMetricsOverride',{
    width:1920,height:1080,deviceScaleFactor:1,mobile:false
  });
  async function clickArtwork(selector){
    const pos=await evalJS('(()=>{const b=document.querySelector('+
      JSON.stringify(selector)+');if(!b)return null;'+
      'b.scrollIntoView({block:"center",behavior:"instant"});'+
      'const r=b.getBoundingClientRect();'+
      'return {x:r.x+r.width/2,y:r.y+r.height/2};})()');
    assert.ok(pos,'Artwork target must exist: '+selector);
    await cmd('Input.dispatchMouseEvent',{type:'mousePressed',
      x:pos.x,y:pos.y,button:'left',clickCount:1});
    await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',
      x:pos.x,y:pos.y,button:'left',clickCount:1});
  }
  await cmd('Page.navigate',{url:origin+'/characters/qa-bellrunner/opening'});
  await until(async()=>(await sceneMetrics())?.loaded,12000,'Stage 1 paper targets');
  await clickArtwork('button.npc-hotspot');
  await until(async()=>{
    const m=await sceneMetrics();
    return m?.text.includes('Ask Hector something')?m:false;
  },8000,'Hector text in the lower section');
  assert.equal(await evalJS("document.querySelector('.scene-illustration .work-card, .scene-illustration .workshop-inspection')===null"),true);
  await clickArtwork('button.paper-target.notices');
  await until(async()=>{
    const m=await sceneMetrics();
    return m?.text.includes('Council notices')?m:false;
  },8000,'Paper inspection text in the lower section');
  assert.equal(await evalJS("document.querySelector('.scene-illustration .workshop-inspection')===null"),true);
  console.log('PASS: clicking Stage 1 NPC and paper reveals text BELOW the image');

  await cmd('Page.navigate',{url:origin+'/characters/qa-bellrunner/bellrunner/dispatch?scene=depot'});
  await until(async()=>(await sceneMetrics())?.loaded,12000,'Stage 2 Depot paper targets');
  await clickArtwork('button.paper-target.notices');
  await until(async()=>{
    const m=await sceneMetrics();
    return m?.text.includes('Council notices')?m:false;
  },8000,'Stage 2 Depot paper inspection below art');
  assert.equal(await evalJS("document.querySelector('.illustration .workshop-inspection')===null"),true);
  console.log('PASS: clicking Stage 2 Depot paper reveals the lower dialogue section');
  console.log('PASS: 20 real Bellrunner page/viewport combinations render as separate sections');
}catch(error){
  console.error(error);
  process.exitCode=1;
}finally{
  clearTimeout(timeout);
  close();
  // npm/Vite can keep inherited pipes open after the parent exits.
  // All assertions have already completed; return a definitive test
  // result instead of relying on the process tree to end by itself.
  await delay(140);
  process.exit(process.exitCode??0);
}
