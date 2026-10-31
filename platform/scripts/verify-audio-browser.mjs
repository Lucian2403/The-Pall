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
  ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((yes,no)=>{
    ws.addEventListener('open',yes,{once:true});
    ws.addEventListener('error',no,{once:true});
  });
  let nextId=1;const pending=new Map();
  ws.addEventListener('message',e=>{
    let msg;try{msg=JSON.parse(e.data);}catch{return;}
    if(!msg.id)return;
    const callback=pending.get(msg.id);if(!callback)return;
    pending.delete(msg.id);
    if(msg.error)callback.reject(new Error(JSON.stringify(msg.error)));
    else callback.resolve(msg.result??{});
  });
  function cmd(method,params={}){
    const id=nextId++;
    return new Promise((resolve,reject)=>{
      pending.set(id,{resolve,reject});
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
  await cmd('Page.addScriptToEvaluateOnNewDocument',{source:monitor});
  await cmd('Page.navigate',{url:site});
  await waitUntil(()=>rect('.audio-trigger'),20000,'mounted game Sound controls');
  // The HTML appears in SSR before SvelteKit has hydrated. Wait for the
  // browser's initial JS modules to settle before dispatching the first real
  // pointer gesture, otherwise an unhydrated button simply ignores it.
  await delay(3500);
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
  const status=()=>evalJS(`({
    texts:[...document.querySelectorAll('.playback-state')].map(e=>e.textContent.trim()),
    sliders:[...document.querySelectorAll('input[type=range]')].map(e=>({name:e.ariaLabel,value:e.value})),
    media:[...window.__pallAudioQA.media].map(([key,el])=>({
      file:key.split('/').pop(),paused:el.paused,volume:el.volume,readyState:el.readyState,error:el.error?.code??0
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
  await moveRange('[aria-label="Workshop ambience volume"]',.8);
  await waitUntil(async()=>{
    const a=await status();return a.media.some(m=>
      m.file==='smithing-workshop-ambience.mp3'&&m.volume>.65);
  },8000,'Ambience slider updating the real player');
  await moveRange('[aria-label="Background music volume"]',.84);
  await click('Play theme');
  await waitUntil(async()=>{
    const a=await status();return a.media.some(m=>m.file==='music-theme.mp3'&&!m.paused&&m.volume>.25);
  },12000,'Music preview playback at adjusted gain');
  await moveRange('[aria-label="Sound effects volume"]',.9);
  const before=(await status()).starts;
  await click('Test click');
  await waitUntil(async()=>(await status()).starts>before,8000,'actual Web Audio SFX start');
  const after=await status();
  assert.ok(after.sliders.length===3,'All three volume sliders must be present.');
  console.log('PASS: Chromium Sound menu, forge looping playback, active Music/Ambience sliders, and real low-latency Test click.',JSON.stringify(after));
}finally{close();}
