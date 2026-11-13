/** Chromium Dogman battle acceptance: actual Stage VI Svelte HUD, owner art,
 * running actions and server-shaped victory/defeat fixtures. HTTP is stubbed;
 * real PostgreSQL gameplay is tested by verify-stage6-postgres.integration.
 */
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {resolve,join} from 'node:path';
import {mkdtempSync,rmSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {initializeDogmanCombat} from '../apps/api/src/bellrunner-dogman-combat-opening.ts';
import {combatView} from '../apps/api/src/millhand-combat-view.ts';

const state=initializeDogmanCombat('00000000-0000-4000-8000-000000000001',
  {current_health:50,max_health:50},'cart',7);
const active=combatView(state,[],'cart');
const win=structuredClone(state);win.status='finished';win.outcome='player_victory';
win.enemy.hp=0;win.intent=null;win.round=8;
const victory=combatView(win,[], 'cart');
const lost=structuredClone(state);lost.status='finished';lost.outcome='player_defeat';
lost.player.hp=0;lost.intent=null;lost.round=6;
const defeat=combatView(lost,[], 'cart');
const fixtures={active,victory,defeat};
const root=resolve(import.meta.dirname,'..');
const isWindows=process.platform==='win32';
const candidates=[process.env.CHROME_PATH,...(isWindows?[
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
]:['google-chrome','chromium','chromium-browser'])].filter(Boolean);
const chrome=candidates.find(x=>/[\\/]/.test(x)?existsSync(x):
  spawnSync('which',[x],{stdio:'ignore'}).status===0);
if(!chrome)throw Error('Chromium required for Bellrunner Dogman Stage VI browser QA.');
const profile=mkdtempSync(join(tmpdir(),'pall-dogman-stage6-'));
const port=5187,cdpPort=9255;
const server=isWindows
  ?spawn('npm run dev -w @the-pall/web -- --port '+port+' --strictPort',
    {cwd:root,stdio:['ignore','pipe','pipe'],shell:true})
  :spawn('npm',['run','dev','-w','@the-pall/web','--','--port',String(port),'--strictPort'],
    {cwd:root,stdio:['ignore','pipe','pipe'],detached:true});
let output='';
for(const stream of [server.stdout,server.stderr])stream.on('data',x=>{
  output+=String(x);if(output.length>20000)output=output.slice(-20000);
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
  console.error('Dogman Stage VI browser QA timed out: '+output.slice(-2600));
  close();process.exit(124);
},180000);
watchdog.unref();
async function until(fn,ms=18000,label='condition'){
  const end=Date.now()+ms;let error;
  while(Date.now()<end){
    try{const x=await fn();if(x)return x;}catch(e){error=e;}
    await delay(170);
  }
  throw Error('Timed out waiting for '+label+(error?': '+error.message:'')+
    '. Vite: '+output.slice(-2000));
}
try{
  const origin='http://127.0.0.1:'+port;
  await until(async()=>(await fetch(origin+'/characters/qa-dogman-stage6/bellrunner/combat')).ok,
    60000,'live SvelteKit Stage VI route');
  browser=spawn(chrome,[
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--no-first-run','--remote-allow-origins=*','--remote-debugging-port='+cdpPort,
    '--user-data-dir='+profile,'about:blank'
  ],{stdio:'ignore'});
  const tab=await until(async()=>{
    const pages=await (await fetch('http://127.0.0.1:'+cdpPort+'/json')).json();
    return pages.find(p=>p.type==='page'&&p.webSocketDebuggerUrl);
  },18000,'Chromium CDP tab');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{
    ws.addEventListener('open',resolve,{once:true});
    ws.addEventListener('error',reject,{once:true});
  });
  let seq=0;const pending=new Map();
  ws.addEventListener('message',event=>{
    let msg;try{msg=JSON.parse(event.data);}catch{return;}
    if(!msg.id)return;
    const request=pending.get(msg.id);if(!request)return;
    pending.delete(msg.id);
    if(msg.error)request.reject(Error(JSON.stringify(msg.error)));
    else request.resolve(msg.result??{});
  });
  const cmd=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++seq;
    const deadline=setTimeout(()=>{pending.delete(id);reject(Error('CDP '+method+' timed out'));},12000);
    pending.set(id,{
      resolve(value){clearTimeout(deadline);resolve(value);},
      reject(error){clearTimeout(deadline);reject(error);}
    });
    ws.send(JSON.stringify({id,method,params}));
  });
  const evalJS=async expression=>{
    const response=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(response.exceptionDetails)throw Error(JSON.stringify(response.exceptionDetails));
    return response.result?.value;
  };
  await cmd('Page.enable');await cmd('Runtime.enable');
  const stub='(()=>{' +
    'const fixtures='+JSON.stringify(fixtures)+';'+
    'const original=window.fetch.bind(window);'+
    'const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{"content-type":"application/json"}});'+
    'window.__dogmanCombatPosts=[];'+
    'window.fetch=(input,options)=>{' +
      'const url=new URL(typeof input==="string"?input:input.url,location.href);'+
      'if(!url.pathname.startsWith("/api/characters/qa-dogman-stage6"))return original(input,options);'+
      'const outcome=new URLSearchParams(location.search).get("outcome")||"active";'+
      'if(url.pathname==="/api/characters/qa-dogman-stage6")return Promise.resolve(json({character:{'+
        'id:"qa-dogman-stage6",name:"QA Bellrunner",origin:"Bellrunner",sex:"Male",coins:20,'+
        'welcomeSeen:true,startingLocation:"Dispatch House",health:{current:50,maximum:50},'+
        'tutorial:{stage:6,status:outcome==="active"?"IN_PROGRESS":"COMPLETED"}}}));'+
      'if(url.pathname.endsWith("/dev/rewind-stage"))return Promise.resolve(json({enabled:true,canRewind:false,stage:6,targetStage:null}));'+
      'if(url.pathname.endsWith("/bellrunner/combat")){' +
        'if(options?.method==="POST"){window.__dogmanCombatPosts.push(JSON.parse(options.body||"{}"));'+
          'return Promise.resolve(json({error:"qa_read_only"},503));}'+
        'return Promise.resolve(json(fixtures[outcome]));}' +
      'return Promise.resolve(json({error:"unavailable"},404));'+
    '};' +
  '})();';
  await cmd('Page.addScriptToEvaluateOnNewDocument',{source:stub});
  const folder=resolve(root,'test-artifacts','bellrunner-stage6-visuals');
  mkdirSync(folder,{recursive:true});
  async function screenshot(name){
    const shot=await cmd('Page.captureScreenshot',{
      format:'png',fromSurface:true,captureBeyondViewport:false});
    writeFileSync(join(folder,name+'.png'),Buffer.from(shot.data,'base64'));
  }
  async function navigate(outcome,width,height){
    await cmd('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await cmd('Page.navigate',{url:origin+'/characters/qa-dogman-stage6/bellrunner/combat?outcome='+outcome});
    await until(()=>evalJS('(()=>{const art=document.querySelector(".battle .dogman img");'+
      'return !!art&&art.complete&&art.naturalWidth>0&&'+
      '!!document.querySelector(".battle .parchment");})()'),
      26000,outcome+' rendered at '+width+'px');
    await evalJS('document.fonts.ready.then(()=>true)');
    await delay(200);
    assert.equal(await evalJS('!!document.querySelector("vite-error-overlay")'),false);
  }
  for(const width of [1280,390]){
    for(const outcome of ['active','victory','defeat']){
      await navigate(outcome,width,width===390?844:900);
      const data=await evalJS('(()=>{const sprite=document.querySelector(".battle .dogman img");'+
        'const arena=document.querySelector(".battle .alley");'+
        'const visible=document.querySelector(".battle .parchment");'+
        'return {viewport:document.documentElement.clientWidth,bodyWidth:document.documentElement.scrollWidth,'+
        'sprite:new URL(sprite.currentSrc).pathname,spriteWidth:sprite.naturalWidth,'+
        'background:getComputedStyle(arena).backgroundImage,body:visible?.innerText,'+
        'actionTiles:document.querySelectorAll(".battle .action-tile").length,'+
        'notice:document.querySelector(".battle [role=status]")?.innerText};})()');
      assert.ok(data.bodyWidth<=data.viewport,'Horizontal overflow '+outcome+' '+width);
      assert.ok(data.spriteWidth>=450,'Dogman owner sprite did not load');
      assert.ok(data.background.includes('industrial-alley.webp'),'Wrong battle location');
      if(outcome==='active'){
        assert.equal(data.actionTiles,6,'Shared six-action combat HUD');
        assert.match(data.body,/Dogman/i);
      }else{
        assert.equal(data.actionTiles,0,'Finished fight has no combat controls');
        assert.match(data.body,/Stage VII/);
        assert.equal(data.sprite,'/characters/dogman/'+
          (outcome==='victory'?'dogman-defeated.webp':'dogman-standing.webp'));
      }
      if(outcome==='victory'||outcome==='defeat')assert.ok(!data.body.includes('Continue to medical care'));
      if(width===1280)await screenshot('dogman-'+outcome+'-'+width);
    }
  }
  await navigate('active',1280,900);
  await evalJS('document.querySelector(".battle .commit").click()');
  await until(()=>evalJS('window.__dogmanCombatPosts.length>0'),
    4500,'real saved combat action POST');
  const posted=await evalJS('window.__dogmanCombatPosts[0]');
  assert.equal(posted.kind,'turn');
  assert.equal(posted.action.type,'guard');
  console.log('PASS: Dogman real battle HUD, input, and owner victory/defeat sprites at phone/desktop widths.');
}finally{
  clearTimeout(watchdog);close();
}
