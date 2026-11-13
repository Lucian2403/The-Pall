/** Live Chromium visual QA for owner-provided Stage V industrial alley and Dogman.
 * API responses are in-page fixtures. Real server/PostgreSQL behavior has
 * separate tests in verify-stage6-postgres.integration.test.ts.
 */
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {resolve,join} from 'node:path';
import {mkdtempSync,rmSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {
  initialDogman,advanceDogman,availableDogmanActions,
  DOGMAN_PAPERS_LENGTH,DOGMAN_REPLY_LENGTH,DOGMAN_DEMAND_LENGTH,DOGMAN_GATE_LENGTH
} from '../apps/api/src/bellrunner-dogman-work.ts';

const root=resolve(import.meta.dirname,'..');
const isWindows=process.platform==='win32';
const chromeCandidates=[process.env.CHROME_PATH,...(isWindows?[
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA&&join(process.env.LOCALAPPDATA,'Google','Chrome','Application','chrome.exe')
]:['google-chrome','chromium','chromium-browser'])].filter(Boolean);
const chrome=chromeCandidates.find(x=>/[\\/]/.test(x)?existsSync(x):
  spawnSync('which',[x],{stdio:'ignore'}).status===0);
if(!chrome)throw Error('Chromium required for Bellrunner Stage V browser QA.');
const fixtures={};
for(const branch of ['contracts','trauma','machinery']){
  let state=initialDogman(branch);
  fixtures[branch]={arrival:{stage:5,tutorialStatus:'NOT_STARTED',state,
    availableActions:availableDogmanActions(state),tutorialPayout:{coins:0,ordinaryXp:0,items:0}}};
  state=advanceDogman(state,'continue');
  for(let i=0;i<DOGMAN_PAPERS_LENGTH-1;i++)state=advanceDogman(state,'continue');
  state=advanceDogman(state,'tell_him');
  fixtures[branch].tell={stage:5,tutorialStatus:'IN_PROGRESS',state,
    availableActions:availableDogmanActions(state),tutorialPayout:{coins:0,ordinaryXp:0,items:0}};
  for(let i=0;i<DOGMAN_REPLY_LENGTH.tell_him;i++)state=advanceDogman(state,'continue');
  for(let i=0;i<DOGMAN_DEMAND_LENGTH;i++)state=advanceDogman(state,'continue');
  for(let i=0;i<DOGMAN_GATE_LENGTH-1;i++)state=advanceDogman(state,'continue');
  fixtures[branch].gate={stage:5,tutorialStatus:'IN_PROGRESS',state,
    availableActions:availableDogmanActions(state),tutorialPayout:{coins:0,ordinaryXp:0,items:0}};
}
const port=5186,cdpPort=9254;
const profile=mkdtempSync(join(tmpdir(),'pall-bellrunner-stage5-'));
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
  try{if(isWindows)killTree(server);
    else if(server.pid)process.kill(-server.pid,'SIGTERM');
  }catch{try{server.kill('SIGTERM');}catch{}}
  try{rmSync(profile,{recursive:true,force:true});}catch{}
};
const watchdog=setTimeout(()=>{
  console.error('Stage V Chromium timed out: '+output.slice(-2500));
  close();process.exit(124);
},210000);
watchdog.unref();
async function until(fn,ms=18000,label='condition'){
  const end=Date.now()+ms;let error;
  while(Date.now()<end){
    try{const x=await fn();if(x)return x;}catch(e){error=e;}
    await delay(160);
  }
  throw Error('Timed out waiting for '+label+(error?': '+error.message:'')+
    ' Vite: '+output.slice(-2500));
}
try{
  const origin='http://127.0.0.1:'+port;
  await until(async()=>(await fetch(origin+'/characters/qa-stage5-bellrunner/bellrunner/dogman')).ok,
    65000,'SvelteKit Stage V development server');
  browser=spawn(chrome,[
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--no-first-run','--remote-allow-origins=*','--remote-debugging-port='+cdpPort,
    '--user-data-dir='+profile,'about:blank'
  ],{stdio:'ignore'});
  const tab=await until(async()=>{
    const pages=await (await fetch('http://127.0.0.1:'+cdpPort+'/json')).json();
    return pages.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
  },18000,'Chromium CDP');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((ok,bad)=>{
    ws.addEventListener('open',ok,{once:true});
    ws.addEventListener('error',bad,{once:true});
  });
  let seq=0;const pending=new Map();
  ws.addEventListener('message',event=>{
    let m;try{m=JSON.parse(event.data);}catch{return;}
    if(!m.id)return;
    const req=pending.get(m.id);if(!req)return;
    pending.delete(m.id);
    if(m.error)req.reject(Error(JSON.stringify(m.error)));
    else req.resolve(m.result??{});
  });
  const cmd=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++seq;
    const timeout=setTimeout(()=>{pending.delete(id);reject(Error('CDP deadline: '+method));},13000);
    pending.set(id,{
      resolve(v){clearTimeout(timeout);resolve(v);},
      reject(e){clearTimeout(timeout);reject(e);}
    });
    ws.send(JSON.stringify({id,method,params}));
  });
  const evalJS=async expression=>{
    const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  };
  await cmd('Page.enable');await cmd('Runtime.enable');
  const stub='(()=>{' +
    'const fixtures='+JSON.stringify(fixtures)+';'+
    'const original=window.fetch.bind(window);'+
    'const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{"content-type":"application/json"}});'+
    'window.__dogmanPosts=[];'+
    'window.fetch=(input,options)=>{' +
      'const url=new URL(typeof input==="string"?input:input.url,location.href);'+
      'if(!url.pathname.startsWith("/api/characters/qa-stage5-bellrunner"))return original(input,options);'+
      'const branch=url.searchParams.get("branch")||new URLSearchParams(location.search).get("branch")||"contracts";'+
      'const mode=new URLSearchParams(location.search).get("mode")||"arrival";'+
      'if(url.pathname==="/api/characters/qa-stage5-bellrunner")return Promise.resolve(json({character:{'+
        'id:"qa-stage5-bellrunner",name:"QA Bellrunner",origin:"Bellrunner",sex:"Male",coins:20,'+
        'welcomeSeen:true,startingLocation:"Dispatch House",'+
        'health:{current:50,maximum:50},stamina:{current:100,maximum:100},tutorial:{stage:5,status:"IN_PROGRESS"}}}));'+
      'if(url.pathname.endsWith("/dev/rewind-stage"))return Promise.resolve(json({enabled:true,canRewind:true,stage:5,targetStage:4}));'+
      'if(url.pathname.endsWith("/bellrunner/dogman")){' +
        'if(options?.method==="POST"){window.__dogmanPosts.push(JSON.parse(options.body||"{}"));'+
          'return Promise.resolve(json({error:"qa_stub_no_write"},503));}'+
        'return Promise.resolve(json(fixtures[branch][mode]));}' +
      'return Promise.resolve(json({error:"unavailable"},404));'+
    '};' +
  '})();';
  await cmd('Page.addScriptToEvaluateOnNewDocument',{source:stub});
  const folder=resolve(root,'test-artifacts','bellrunner-stage5-visuals');
  mkdirSync(folder,{recursive:true});
  async function screenshot(name){
    const shot=await cmd('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
    writeFileSync(join(folder,name+'.png'),Buffer.from(shot.data,'base64'));
  }
  async function navigate(branch,mode,width,height){
    await cmd('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await cmd('Page.navigate',{url:origin+'/characters/qa-stage5-bellrunner/bellrunner/dogman?branch='+branch+'&mode='+mode});
    await until(()=>evalJS('(()=>{const art=document.querySelector(".bellrunner-dogman .scene-background");'+
      'const dog=document.querySelector(".bellrunner-dogman .dogman-standing");'+
      'const panel=document.querySelector(".bellrunner-dogman .work-card");'+
      'return !!art&&!!dog&&!!panel&&art.complete&&dog.complete&&art.naturalWidth>0&&dog.naturalWidth>0;})()'),
      26000,branch+'/'+mode+' '+width+'px');
    await evalJS('document.fonts.ready.then(()=>true)');
    await delay(180);
    assert.equal(await evalJS('!!document.querySelector("vite-error-overlay")'),false);
  }
  for(const width of [1280,390]){
    for(const branch of ['contracts','trauma','machinery']){
      for(const mode of ['arrival','tell','gate']){
        await navigate(branch,mode,width,width===390?844:900);
        const d=await evalJS('(()=>{const rect=x=>{const e=document.querySelector(x);'+
          'if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left,y:r.top,width:r.width,height:r.height};};'+
          'const art=document.querySelector(".bellrunner-dogman .scene-background");'+
          'const dog=document.querySelector(".bellrunner-dogman .dogman-standing");'+
          'return {bodyWidth:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,'+
          'artSrc:new URL(art.currentSrc).pathname,artWidth:art.naturalWidth,dogSrc:new URL(dog.currentSrc).pathname,dogWidth:dog.naturalWidth,'+
          'stage:rect(".bellrunner-dogman .activity-stage"),panel:rect(".bellrunner-dogman .activity-panel"),'+
          'scene:rect(".bellrunner-dogman .dogman-stage"),'+
          'mode:document.querySelector(".bellrunner-dogman .activity-layout")?.dataset.activityMode,'+
          'actions:[...document.querySelectorAll(".bellrunner-dogman .actions button")].map(b=>b.textContent.trim()),'+
          'copy:document.querySelector(".bellrunner-dogman .work-card")?.innerText};})()');
        assert.equal(d.artSrc,'/locations/bellrunner/industrial-alley.webp');
        assert.equal(d.dogSrc,'/characters/dogman/dogman-standing.webp');
        assert.ok(d.artWidth>=1300&&d.dogWidth>=700);
        assert.ok(d.bodyWidth<=d.viewport,'No page overflow: '+branch+'/'+mode+'/'+width);
        assert.equal(d.mode,'scene');
        assert.ok(d.stage&&d.panel&&d.scene);
        if(width===1280)assert.ok(d.stage.x+d.stage.width<=d.panel.x+5,'Side by side dialogue');
        else assert.ok(d.panel.y>=d.stage.y+d.stage.height-5,'Stacked below art');
        if(mode==='gate')assert.equal(d.actions.length,3,'Three real defensive choices');
        if(mode==='arrival')assert.match(d.copy,/Dogman steps away from the service gate/);
        if(mode==='tell'){
          const fact=branch==='contracts'?'marking men absent':
            branch==='trauma'?'standing there coughing':'safety shutoff was down';
          assert.ok(d.copy.includes(fact),'Only chosen branch-specific speech displayed: '+branch);
        }
        if(width===1280&&mode==='gate')await screenshot('dogman-'+branch+'-'+width);
        if(width===390&&mode==='arrival')await screenshot('dogman-'+branch+'-'+width);
      }
    }
  }
  await navigate('contracts','gate',1280,900);
  await evalJS('document.querySelector(".bellrunner-dogman .actions button").click()');
  const posts=await evalJS('window.__dogmanPosts');
  assert.equal(posts[0]?.action,'step_street','Real action handler receives the selected stance');
  await evalJS('document.querySelector(".scene-journal-bar button").click()');
  await until(()=>evalJS('!!document.querySelector("#bellrunner-dogman-journal .journal-entries p")'),
    8000,'personal journal');
  console.log('PASS: Dogman artwork, three branch callbacks, three stances, journal, and responsive UI.');
}finally{
  clearTimeout(watchdog);
  close();
}
