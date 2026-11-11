import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {resolve,join} from 'node:path';
import {mkdtempSync,rmSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';

/* The shared game shell and its activity layouts, in REAL Svelte pages.
 * Uses only development fixtures and a browser-side stub of
 * /api/characters/qa-shell-millhand (no API, database or login):
 *   - workspace mode: the real MillhandCombatScene (/__combat-cta-qa) puts its
 *     Chronicle/condition console BESIDE the battlefield only when the
 *     battlefield keeps >=1000px, otherwise BELOW it;
 *   - management mode: the Character page's attribute sheet sits beside the
 *     skills ledger on wide containers and stacks first on narrow ones;
 *   - the reserved dock (/__shell-qa?dock=1) takes its own column and reflows
 *     the activity instead of covering it; phones never render it;
 *   - the City header is a locked map gateway until a real map route exists;
 *   - Notifications and Chat are honest "not available yet" entries whose
 *     status popovers sit in the browser top layer and close on Escape.
 */
const root=resolve(import.meta.dirname,'..');
const isWindows=process.platform==='win32';
const chromeCandidates=[process.env.CHROME_PATH,...(isWindows?[
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA&&join(process.env.LOCALAPPDATA,'Google','Chrome','Application','chrome.exe'),
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
]:['google-chrome','chromium','chromium-browser'])].filter(Boolean);
const chrome=chromeCandidates.find(x=>/[\\/]/.test(x)?existsSync(x):
  spawnSync('which',[x],{stdio:'ignore'}).status===0);
if(!chrome)throw Error('Chromium required for game-shell geometry (set CHROME_PATH).');
const profile=mkdtempSync(join(tmpdir(),'pall-game-shell-'));
const port=5188,cdpPort=9249;
const server=isWindows
  ?spawn('npm run dev -w @the-pall/web -- --port '+port+' --strictPort',
    {cwd:root,stdio:['ignore','pipe','pipe'],shell:true})
  :spawn('npm',['run','dev','-w','@the-pall/web','--','--port',String(port),'--strictPort'],
    {cwd:root,stdio:['ignore','pipe','pipe'],detached:true});
let output='';
for(const stream of [server.stdout,server.stderr])stream.on('data',x=>{
  output+=String(x);if(output.length>25000)output=output.slice(-25000);
});
let browser,ws;
const killTree=child=>{
  if(!child?.pid)return;
  if(isWindows)spawnSync('taskkill',['/pid',String(child.pid),'/T','/F'],{stdio:'ignore'});
  else child.kill('SIGKILL');
};
const close=()=>{
  try{ws?.close();}catch{}
  try{killTree(browser);}catch{}
  try{
    if(isWindows)killTree(server);
    else if(server.pid)process.kill(-server.pid,'SIGTERM');
  }catch{try{server.kill('SIGTERM');}catch{}}
  try{rmSync(profile,{recursive:true,force:true});}catch{}
};
const timeout=setTimeout(()=>{
  console.error('Game-shell browser QA timed out: '+output.slice(-2000));
  close();process.exit(124);
},240000);
timeout.unref();
async function until(fn,ms=18000,label='condition'){
  const deadline=Date.now()+ms;let last;
  while(Date.now()<deadline){
    try{const result=await fn();if(result)return result;}catch(e){last=e;}
    await delay(175);
  }
  throw Error('Timed out waiting for '+label+(last?': '+last.message:'')+' Vite: '+output.slice(-2500));
}
try{
  const origin='http://127.0.0.1:'+port;
  await until(async()=>(await fetch(origin+'/__shell-qa')).ok,60000,'SvelteKit web server');
  browser=spawn(chrome,[
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--no-first-run','--remote-allow-origins=*',
    '--remote-debugging-port='+cdpPort,'--user-data-dir='+profile,'about:blank'
  ],{stdio:'ignore'});
  const tab=await until(async()=>{
    const tabs=await (await fetch('http://127.0.0.1:'+cdpPort+'/json')).json();
    return tabs.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
  },18000,'Chromium tab');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((ok,bad)=>{ws.addEventListener('open',ok,{once:true});ws.addEventListener('error',bad,{once:true});});
  let id=0;const pending=new Map();
  ws.addEventListener('message',e=>{
    let msg;try{msg=JSON.parse(e.data);}catch{return;}
    const call=msg.id&&pending.get(msg.id);if(!call)return;
    pending.delete(msg.id);
    if(msg.error)call.reject(Error(JSON.stringify(msg.error)));else call.resolve(msg.result??{});
  });
  const cmd=(method,params={})=>new Promise((resolve,reject)=>{
    const callId=++id;
    const timer=setTimeout(()=>{pending.delete(callId);reject(Error('CDP deadline: '+method));},13000);
    pending.set(callId,{resolve(v){clearTimeout(timer);resolve(v);},reject(e){clearTimeout(timer);reject(e);}});
    ws.send(JSON.stringify({id:callId,method,params}));
  });
  const evalJS=async expression=>{
    const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(r.exceptionDetails)throw Error('Browser exception: '+JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  };
  await cmd('Page.enable');await cmd('Runtime.enable');
  await cmd('Page.addScriptToEvaluateOnNewDocument',{source:String.raw`(()=>{
    const original=window.fetch.bind(window);
    const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'content-type':'application/json'}});
    window.fetch=(input,options)=>{
      const route=new URL(typeof input==='string'?input:input.url,location.href).pathname;
      if(!route.startsWith('/api/characters/qa-shell-millhand'))return original(input,options);
      if(route==='/api/characters/qa-shell-millhand')return Promise.resolve(json({character:{
        id:'qa-shell-millhand',name:'QA Millhand',origin:'Millhand',sex:'Female',coins:20,avatarId:null,
        welcomeSeen:true,startingLocation:'Smithing Workshop',health:{current:50,maximum:50},
        attributes:{STR:6,DEX:5,INT:5,RES:6},majorSkillBonuses:{},starterItemRequirements:[],
        tutorial:{stage:6,status:'IN_PROGRESS'}}}));
      if(route.endsWith('/dev/rewind-stage'))return Promise.resolve(json({enabled:false,canRewind:false,stage:6,targetStage:null}));
      return Promise.resolve(json({error:'unavailable'},404));
    };
  })();`});
  const folder=resolve(root,'test-artifacts','game-shell-visuals');
  mkdirSync(folder,{recursive:true});
  async function open(path,width,height,ready){
    await cmd('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    // Tag the outgoing document: consecutive visits reuse the same URL, so the
    // readiness probe must not succeed on the page that is being replaced.
    await evalJS('window.__pallLeaving=true').catch(()=>{});
    await cmd('Page.navigate',{url:origin+path});
    await until(()=>evalJS('!window.__pallLeaving&&!!document.querySelector('+JSON.stringify(ready)+')&&[...document.images].every(i=>i.complete)'),
      24000,path+' at '+width+'x'+height);
    // Measure after web fonts swap in: in-flow text (e.g. the phone combat
    // parchment) reflows when they arrive and would otherwise race the boxes.
    await evalJS('document.fonts.ready.then(()=>true)');
    await delay(300);
    assert.equal(await evalJS("!!document.querySelector('vite-error-overlay')"),false,'No compile overlay on '+path);
    const sw=await evalJS('[document.documentElement.scrollWidth,document.documentElement.clientWidth]');
    assert.ok(sw[0]<=sw[1],'No horizontal scrolling on '+path+' at '+width+'x'+height+': '+sw);
  }
  async function shot(name){
    const s=await cmd('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
    writeFileSync(join(folder,name+'.png'),Buffer.from(s.data,'base64'));
  }
  const box=selector=>evalJS('(()=>{const e=document.querySelector('+JSON.stringify(selector)+
    ');if(!e)return null;const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};})()');

  // WORKSPACE: real combat component, finished-fight fixture.
  // null = either arrangement is valid at this width (it depends on whether the
  // browser's scrollbar takes layout width); the invariant is still asserted.
  for(const [width,height,beside] of [[1920,1080,true],[2048,1171,true],[1600,900,null],[1280,720,false],[390,844,false]]){
    await open('/__combat-cta-qa?outcome=victory',width,height,'.battle .alley');
    const alley=await box('.alley'),console_=await box('.combat-console'),host=await box('.activity-host');
    const tag=width+'x'+height+' '+JSON.stringify({alley,console:console_,host});
    assert.equal(await evalJS("document.querySelector('.battle .activity-layout')?.dataset.activityMode"),'workspace',
      'Combat uses the shared workspace layout: '+tag);
    const isBeside=console_.left>=alley.right-1&&Math.abs(console_.top-alley.top)<=1;
    if(beside!==null)assert.equal(isBeside,beside,'Console sits '+(beside?'BESIDE':'BELOW')+' the battlefield: '+tag);
    if(isBeside)assert.ok(alley.width>=1000,'Battlefield keeps its tuned width when tools are beside it: '+tag);
    else assert.ok(console_.top>=alley.bottom-1,'Otherwise the console sits BELOW the battlefield: '+tag);
    assert.ok(await evalJS("!!document.querySelector('.clinic-link')"),'Combat outcome action remains present: '+tag);
    if(width===1920||width===1280)await shot('combat-'+width+'x'+height);
    console.log('PASS: workspace (combat) '+width+'×'+height+' console '+(isBeside?'BESIDE':'BELOW')+' battlefield');
  }

  // MANAGEMENT: Character page attribute sheet + skills ledger.
  for(const [width,height,beside] of [[1440,900,true],[1024,768,true],[768,1024,false],[390,844,false]]){
    await open('/characters/qa-shell-millhand',width,height,'.character-record .activity-layout');
    const panel=await box('.character-record .activity-panel'),stage=await box('.character-record .activity-stage');
    const tag=width+'x'+height+' '+JSON.stringify({panel,stage});
    assert.equal(await evalJS("document.querySelector('.character-record .activity-layout').dataset.activityMode"),'management',
      'Character record uses the shared management layout: '+tag);
    if(beside)assert.ok(stage.left>=panel.right-1&&stage.width>panel.width,'Details panel beside a dominant ledger: '+tag);
    else assert.ok(stage.top>=panel.bottom-1,'Details panel stacks before the ledger: '+tag);
    console.log('PASS: management (character) '+width+'×'+height+' panel '+(beside?'BESIDE':'ABOVE')+' ledger');
  }

  // SHELL: dock reflow, map gateway, service entries, sound/status top layer.
  for(const [width,height] of [[1920,1080],[1280,720],[390,844]]){
    await open('/__shell-qa?dock=1',width,height,'.pall-story-landscape img');
    const dock=await evalJS("(()=>{const d=document.querySelector('.shell-dock');if(!d||getComputedStyle(d).display==='none')return null;const r=d.getBoundingClientRect();return {left:r.left,width:r.width};})()");
    const host=await box('.activity-host'),art=await box('.pall-story-landscape'),panel=await box('.pall-story-dialogue-section');
    const tag=width+'x'+height+' '+JSON.stringify({dock,host,art,panel});
    if(width>760){
      assert.ok(dock&&host.right<=dock.left+1,'The dock takes its own column; the activity never sits under it: '+tag);
      assert.ok(host.width>=880?panel.left>=art.right-2:panel.top>=art.bottom-2,
        'The activity re-decides its columns from the narrower container: '+tag);
    }else{
      assert.equal(dock,null,'Phones never render a side dock over the scene: '+tag);
    }
    const gateway=await evalJS("(()=>{const g=document.querySelector('.city-map-gateway');return {tag:g.tagName,disabled:g.getAttribute('aria-disabled'),href:g.getAttribute('href'),state:g.closest('.city-banner').dataset.mapState,status:document.getElementById(g.getAttribute('aria-describedby'))?.textContent};})()");
    assert.deepEqual(gateway,{tag:'BUTTON',disabled:'true',href:null,state:'introduction',status:'Opens after the introduction'},
      'Locked map gateway during the introduction: '+tag);
    for(const kind of ['notifications','chat']){
      // SSR markup has no handlers until Svelte hydrates the shell.
      await until(()=>evalJS("document.querySelector('[data-pall-audio-control]')?.dataset.hydrated==='true'"),12000,'shell hydration');
      await evalJS("document.querySelector('[data-shell-service=\""+kind+"\"] button').click();true");
      const status=await until(()=>evalJS("(()=>{const p=document.querySelector('#pall-"+kind+"-status');if(!p||!p.matches(':popover-open'))return null;"+
        "const r=p.getBoundingClientRect();const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);"+
        "return {text:p.textContent,onTop:!!e?.closest('#pall-"+kind+"-status'),inside:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth};})()"),4000,kind+' status');
      assert.ok(status.text.includes('not available yet')&&status.onTop&&status.inside,kind+' status is honest, on top and on screen: '+tag+' '+JSON.stringify(status));
      if(kind==='chat'&&width===1280)await shot('chat-status-1280x720');
      await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      await cmd('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      await until(()=>evalJS("!document.querySelector('#pall-"+kind+"-status')"),3000,kind+' closes on Escape');
    }
    if(width!==390)await shot('dock-'+width+'x'+height);
    console.log('PASS: shell dock/gateway/services '+width+'×'+height);
  }
  await open('/__shell-qa?complete=1',1440,900,'.city-map-gateway');
  assert.deepEqual(await evalJS("(()=>{const g=document.querySelector('.city-map-gateway');return [g.tagName,g.closest('.city-banner').dataset.mapState,document.getElementById('city-map-status').textContent];})()"),
    ['BUTTON','unavailable','Not available yet'],
    'After the introduction, without a real map route, the gateway stays disabled and says so');
  console.log('PASS: completed introduction without a map route keeps an honest disabled gateway');
  console.log('PASS: game shell — workspace, management, dock, map gateway and service entries verified in real pages');
}catch(error){
  console.error(error);
  process.exitCode=1;
}finally{
  clearTimeout(timeout);
  close();
  await delay(140);
  process.exit(process.exitCode??0);
}
