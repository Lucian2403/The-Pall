import {strict as assert} from 'node:assert';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {resolve} from 'node:path';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

// Actual Chromium/SvelteKit integration: exercises the *same* Sound UI,
// TutorialShell scene ownership, browser media players and cached Web Audio
// sources that players use. No API or saved characters are required.
const root=resolve(import.meta.dirname,'..');
const chrome=['google-chrome','chromium','chromium-browser'].find(bin=>
  spawnSync('which',[bin],{stdio:'ignore'}).status===0);
if(!chrome)throw new Error('Chromium or Google Chrome is required for browser audio QA.');
const profile=mkdtempSync(join(tmpdir(),'pall-audio-qa-'));
let phase='initializing';
const watchdog=setTimeout(()=>{
  console.error('BROWSER QA DEADLINE: '+phase+'; Vite: '+output.slice(-1800));
  close();
  process.exit(124);
},90000);
watchdog.unref();
const web=spawn('npm',['run','dev:web'],{cwd:root,stdio:['ignore','pipe','pipe']});
let output='';
for(const stream of [web.stdout,web.stderr])stream.on('data',chunk=>{
  output+=String(chunk);if(output.length>30000)output=output.slice(-30000);
});
let browser;
let ws;
const close=()=>{
  try{ws?.close();}catch{}
  try{browser?.kill('SIGKILL');}catch{}
  try{web.kill('SIGTERM');}catch{}
  try{rmSync(profile,{recursive:true,force:true});}catch{}
};
process.on('SIGINT',()=>{close();process.exit(130);});
async function waitUntil(fn,ms=25000,label='condition'){
  const until=Date.now()+ms;
  let last;
  while(Date.now()<until){
    try{const result=await fn();if(result)return result;}
    catch(e){last=e;}
    await delay(200);
  }
  throw new Error('Timed out waiting for '+label+(last?': '+last.message:'')+'; Vite output: '+output.slice(-2000));
}
try{
  const site='http://127.0.0.1:5173/__audio-qa';
  await waitUntil(async()=>{
    const res=await fetch(site);
    return res.ok;
  },45000,'Vite audio QA fixture');
  browser=spawn(chrome,[
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--no-first-run','--no-default-browser-check',
    '--autoplay-policy=user-gesture-required',
    '--remote-allow-origins=*',
    '--remote-debugging-port=9229','--user-data-dir='+profile,'about:blank'
  ],{stdio:'ignore'});
  const target=await waitUntil(async()=>{
    const res=await fetch('http://127.0.0.1:9229/json');
    const tabs=await res.json();
    return tabs.find(tab=>tab.type==='page'&&tab.webSocketDebuggerUrl);
  },20000,'Chromium DevTools target');
  phase='DevTools WebSocket handshake';
  console.log('BROWSER QA: DevTools target available; connecting WebSocket');
  ws=new WebSocket(target.webSocketDebuggerUrl);
  await Promise.race([
    new Promise((yes,no)=>{
      ws.addEventListener('open',yes,{once:true});
      ws.addEventListener('error',no,{once:true});
    }),
    delay(10000).then(()=>{throw new Error('DevTools WebSocket handshake timed out');})
  ]);
  let nextId=1;const pending=new Map();
  ws.addEventListener('close',()=>{
    for(const [id,callback] of pending){
      callback.reject(new Error('DevTools WebSocket closed while awaiting id '+id));
    }
    pending.clear();
  });
  ws.addEventListener('message',e=>{
    let msg;try{msg=JSON.parse(e.data);}catch{return;}
    if(msg.method==='Runtime.exceptionThrown'){
      console.error('BROWSER UNCAUGHT ERROR:',JSON.stringify(msg.params?.exceptionDetails??{}).slice(0,1600));
    }
    if(msg.method==='Log.entryAdded'&&msg.params?.entry?.level==='error'){
      console.error('BROWSER CONSOLE ERROR:',msg.params.entry.text?.slice(0,800));
    }
    if(!msg.id)return;
    const callback=pending.get(msg.id);if(!callback)return;
    pending.delete(msg.id);
    if(msg.error)callback.reject(new Error(JSON.stringify(msg.error)));
    else callback.resolve(msg.result??{});
  });
  function cmd(method,params={}){
    const id=nextId++;
    return new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>{
        pending.delete(id);
        reject(new Error('DevTools command timed out: '+method));
      },12000);
      pending.set(id,{
        resolve(value){clearTimeout(timeout);resolve(value);},
        reject(error){clearTimeout(timeout);reject(error);}
      });
      ws.send(JSON.stringify({id,method,params}));
    });
  }
  async function evalJS(expression){
    const answer=await cmd('Runtime.evaluate',{
      expression,returnByValue:true,awaitPromise:true
    });
    if(answer.exceptionDetails)throw new Error('Browser JS exception: '+JSON.stringify(answer.exceptionDetails));
    return answer.result?.value;
  }
  async function rect(query){
    return evalJS(`(()=>{
      const el=Array.from(document.querySelectorAll('button,input')).find(
        e=>e.matches(${JSON.stringify(query)})||
        e.textContent?.trim()===${JSON.stringify(query)}
      );
      if(!el)return null;
      // Tests must click the real interactive surface even when the scene
      // button sits below the initial headless Chromium viewport.
      el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
      const r=el.getBoundingClientRect();
      return {x:r.left+r.width/2,y:r.top+r.height/2,left:r.left,width:r.width,
        value:el.value??null,disabled:el.disabled||false};
    })()`);
  }
  async function mouse(x,y,type='mousePressed'){
    return cmd('Input.dispatchMouseEvent',{
      type,x,y,button:'left',clickCount:1,buttons:type==='mousePressed'?1:0
    });
  }
  async function click(query){
    const r=await rect(query);
    assert.ok(r,'Browser cannot find '+query);
    assert.equal(r.disabled,false,'Unexpectedly disabled '+query);
    await mouse(r.x,r.y);await mouse(r.x,r.y,'mouseReleased');
  }
  async function moveRange(query,ratio){
    const r=await rect(query);
    assert.ok(r,'Missing slider '+query);
    const x=r.left+Math.max(9,Math.min(r.width-9,r.width*ratio));
    await mouse(r.x,r.y);
    await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x,y:r.y,
      button:'left',buttons:1});
    await mouse(x,r.y,'mouseReleased');
  }
  const monitor=`(()=>{
    const qa=window.__pallAudioQA={media:new Map(),starts:0,attempts:0};
    const origPlay=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(...args){
      qa.media.set(this.src,this);qa.attempts++;return origPlay.apply(this,args);
    };
    const origLoad=HTMLMediaElement.prototype.load;
    HTMLMediaElement.prototype.load=function(...args){
      qa.media.set(this.src,this);return origLoad.apply(this,args);
    };
    if(window.AudioBufferSourceNode){
      const origStart=AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start=function(...args){
        qa.starts++;return origStart.apply(this,args);
      };
    }
  })();`;
  await cmd('Page.enable');
  await cmd('Runtime.enable');
  await cmd('Log.enable');
  await cmd('Page.addScriptToEvaluateOnNewDocument',{source:monitor});
  phase='navigating to fixture';
  console.log('BROWSER QA: navigating to mounted real HUD fixture');
  await cmd('Page.navigate',{url:site});
  await waitUntil(()=>rect('.audio-trigger'),20000,'mounted game Sound controls');
  phase='waiting for Svelte hydration';
  console.log('BROWSER QA: SSR Sound button visible; awaiting hydration');
  // DOM markup is server-rendered before client handlers exist. Wait for an
  // explicit Svelte onMount marker rather than guessing a time to click.
  await waitUntil(()=>evalJS(`document.querySelector('[data-pall-audio-control]')?.dataset.hydrated==='true'`),
    25000,'Svelte Sound control hydration');
  phase='clicking the Sound button';
  console.log('BROWSER QA: Svelte hydrated; clicking Sound');
  await click('.audio-trigger');
  let menuOpen=await waitUntil(async()=>{
    const open=await evalJS(`document.querySelector('#pall-sound-settings')!==null`);
    return open?'open':false;
  },7000,'hydrated Sound menu').catch(()=>null);
  if(!menuOpen){
    const diagnostics=await evalJS(`({
      url:location.href,
      trigger:document.querySelector('.audio-trigger')?.outerHTML,
      body:document.body.innerText.slice(0,1600),
      viteOverlay:document.querySelector('vite-error-overlay')?.shadowRoot?.innerText??null
    })`);
    throw new Error('Actual browser click did not open Sound settings: '+JSON.stringify(diagnostics));
  }
  phase='waiting for media playback';
  console.log('BROWSER QA: menu opened; inspecting real media playback');
  const status=()=>evalJS(`({
    texts:[...document.querySelectorAll('.playback-state')].map(e=>e.textContent.trim()),
    sliders:[...document.querySelectorAll('input[type=range]')].map(e=>({name:e.ariaLabel,value:e.value})),
    media:[...window.__pallAudioQA.media].map(([key,el])=>({
      file:key.split('/').pop(),paused:el.paused,volume:el.volume,currentTime:el.currentTime,
      readyState:el.readyState,error:el.error?.code??0
    })),
    starts:window.__pallAudioQA.starts,
    attempts:window.__pallAudioQA.attempts
  })`);
  await waitUntil(async()=>{
    const s=await status();
    return s.texts.includes('Playing')&&s.texts.includes('Ready');
  },20000,'in-game music/forge/SFX ready');
  let result=await status();
  assert.ok(result.media.some(m=>m.file==='smithing-workshop-ambience.mp3'&&!m.paused),
    'Forge recording did not actually play after clicking Sound. '+JSON.stringify(result));
  phase='dragging Ambience slider';
  await moveRange('[aria-label="Environmental ambience volume"]',.8);
  await waitUntil(async()=>{
    const a=await status();return a.media.some(m=>
      m.file==='smithing-workshop-ambience.mp3'&&m.volume>.65);
  },8000,'Ambience slider updating the real player');
  phase='dragging Music slider';
  await moveRange('[aria-label="Background music volume"]',.84);
  await click('Play theme');
  await waitUntil(async()=>{
    const a=await status();return a.media.some(m=>m.file==='music-theme.mp3'&&!m.paused&&m.volume>.25);
  },12000,'Music preview playback at adjusted gain');
  await moveRange('[aria-label="Sound effects volume"]',.9);
  const before=(await status()).starts;
  phase='testing Web Audio click';
  await click('Test click');
  await waitUntil(async()=>(await status()).starts>before,8000,'actual Web Audio SFX start');
  const after=await status();
  assert.ok(after.sliders.length===3,'All three volume sliders must be present.');

  // Force the exact SvelteKit lifecycle seen on entering a new workshop
  // stage: destroy the old shell and mount a fresh one with the same forge
  // backdrop. The original audio element must not be reconstructed/rewound.
  const forge=items=>items.media.find(m=>m.file==='smithing-workshop-ambience.mp3');
  const positionBefore=forge(after).currentTime;
  phase='remounting the next smithing stage';
  await click('Next forge stage');
  await waitUntil(()=>evalJS(`document.querySelector('.audio-qa-scene h1')?.textContent.includes('Stage 2')`),
    12000,'Stage 2 artwork');
  await waitUntil(async()=>!(forge(await status())?.paused),7000,'continuous forge after remount');
  const subsequent=await status();
  assert.ok(forge(subsequent).currentTime>=positionBefore-0.2,
    'The forge loop restarted during a workshop-to-workshop transition: '+
    JSON.stringify({before:positionBefore,after:forge(subsequent)}));
  // The same live 115s recording must stop as soon as the painted background
  // switches to the depot, without relying on a route or grace-period timer.
  phase='switching backdrop from forge to depot';
  await click('Switch to depot');
  await waitUntil(async()=>forge(await status())?.paused===true,8000,'forge stop at depot');
  const depot=await status();
  assert.ok(forge(depot).currentTime<0.1,
    'Forge must reset only on a confirmed non-forge backdrop: '+JSON.stringify(depot));
  console.log('PASS: real Chromium Sound sliders, 115s forge loop, next-stage continuity, immediate depot silence, and Web Audio click.',JSON.stringify({after,subsequent,depot}));
}finally{close();}
// Vite starts subprocesses and Chromium opens a DevTools WebSocket; those
// handles can linger after the checks pass. The fixture is disposable and
// every assertion has completed, so terminate the QA runner explicitly.
process.exit(0);
