import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {resolve,join} from 'node:path';
import {mkdtempSync,rmSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';

/* Real city component browser smoke test; fixtures are never production POIs. */
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
const port=5189,cdpPort=9250;
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
    const root='/api/characters/qa-city';
    const points=[{id:'starter-rented-room',name:'Home',description:'Room',symbol:'⌂',icon:'',position:{x:.2,y:.6},displayOrder:1,availability:'available',destination:'home'},
     {id:'job-board',name:'Job Board',description:'Find paid work',symbol:'▤',icon:'',position:{x:.7,y:.3},displayOrder:2,availability:'available',destination:'qa-only'},
     {id:'clinic',name:'Clinic',description:'Medical services',symbol:'✚',icon:'',position:{x:.4,y:.3},displayOrder:3,availability:'unavailable',destination:null}];
    let journey=null;window.cityStarts=0;
    const snapshot=()=>({cityId:'grand-cylinder-city',name:'Grand Cylinder City',config:{width:1400,height:1000,distanceScale:.02,walkingSpeed:1.4,minimumSeconds:2,roundingSeconds:1},pointsOfInterest:points,currentLocationId:'starter-rented-room',revision:journey?1:0,journey,serverNow:new Date().toISOString(),arrived:false});
    window.fetch=(input,options)=>{
      const route=new URL(typeof input==='string'?input:input.url,location.href).pathname;
      if(!route.startsWith(root))return original(input,options);
      if(route===root)return Promise.resolve(json({character:{id:'qa-city',name:'QA City',origin:'Millhand',sex:'Male',coins:10,avatarId:null,welcomeSeen:true,startingLocation:'Home',health:{current:50,maximum:50},tutorial:{stage:8,status:'COMPLETED'}}}));
      if(route===root+'/free-play')return Promise.resolve(json({unlocked:true,announcementSeen:true}));
      if(route===root+'/free-play/city/travel'){
        window.cityStarts++;journey={originId:'starter-rented-room',destinationId:'job-board',startedAt:new Date().toISOString(),arrivesAt:new Date(Date.now()+60000).toISOString()};
        return Promise.resolve(json(snapshot()));
      }
      if(route===root+'/free-play/city')return Promise.resolve(json(snapshot()));
      if(route.endsWith('/dev/rewind-stage'))return Promise.resolve(json({enabled:false,canRewind:false,stage:8,targetStage:null}));
      return Promise.resolve(json({error:'unavailable'},404));
    };
  })();`});
  for(const width of [1600,1440,1024,390,320]){
    await cmd('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await evalJS('window.__pallLeaving=true').catch(()=>{});
    await cmd('Page.navigate',{url:origin+'/characters/qa-city/overview'});
    await until(()=>evalJS("!window.__pallLeaving&&document.querySelectorAll('.marker').length===3"),30000,'City map at '+width);
    await evalJS('document.fonts.ready.then(()=>true)');
    assert.equal(await evalJS("!!document.querySelector('vite-error-overlay')"),false);
    assert.equal(await evalJS("document.documentElement.scrollWidth<=document.documentElement.clientWidth"),true,'No page overflow at '+width);
    const geometry=await evalJS("(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};return {directory:box('.directory'),map:box('.map-frame'),details:box('.details'),workspace:box('.workspace'),toggle:getComputedStyle(document.querySelector('.directory-toggle')).display,frame:getComputedStyle(document.querySelector('.map-frame')).borderImageSource,background:getComputedStyle(document.querySelector('.city-workspace')).backgroundImage}})()");
    assert.ok(geometry.frame.includes('engraved-frame.svg')&&geometry.background.includes('parchment-grain.svg'),'Local city ornament and texture applied');
    if(width>=1440){
      assert.ok(Math.abs(geometry.directory.y-geometry.map.y)<2&&Math.abs(geometry.details.y-geometry.map.y)<2,'Three aligned desktop columns');
      assert.ok(Math.abs(geometry.directory.h-geometry.map.h)<2&&Math.abs(geometry.details.h-geometry.map.h)<2,'Equal-height desktop panels');
      assert.ok(geometry.map.w>geometry.directory.w*1.8&&geometry.map.w>geometry.details.w*1.8,'Map remains dominant');
    }else if(width===1024){
      assert.ok(geometry.details.y>=geometry.map.y+geometry.map.h-1,'Tablet details below map');
    }
    if(geometry.toggle!=='none')await evalJS("document.querySelector('.directory-toggle').click()");
    assert.equal(await evalJS("document.querySelector('.directory-item').getAttribute('aria-pressed')"),'true');
    await evalJS("document.querySelectorAll('.directory-item')[1].click()");
    assert.equal(await evalJS("document.querySelector('.details h2').textContent.includes('Job Board')"),true);
    assert.equal(await evalJS("window.cityStarts"),0);
    const before=await evalJS("document.querySelector('.walking-time').textContent");
    await evalJS("document.querySelector('[aria-label=\"Zoom in\"]').click()");
    assert.equal(await evalJS("document.querySelector('.walking-time').textContent"),before);
    assert.equal(await evalJS("document.querySelector('.marker.selected').getAttribute('aria-label')"),'Job Board');
    await evalJS("document.querySelector('.marker[aria-label^=\"Clinic\"]').click()");
    assert.equal(await evalJS("document.querySelector('.walk').disabled"),true);
    await evalJS("document.querySelectorAll('.directory-item')[1].click()");
    await until(()=>evalJS("!document.querySelector('.walk').disabled"),5000,'Travel enabled');
    await evalJS("document.querySelector('.walk').click()");
    await until(()=>evalJS("!!document.querySelector('.journey progress')"),5000,'Travel progress');
    assert.equal(await evalJS("window.cityStarts"),1);
    const shot=await cmd('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
    const folder=resolve(root,'test-artifacts','city-map');
    mkdirSync(folder,{recursive:true});writeFileSync(join(folder,'city-map-'+width+'.png'),Buffer.from(shot.data,'base64'));
    console.log('PASS: city map, parchment layout, synchronized selection, zoom-independent time, disabled POI, explicit travel at '+width+'px');
  }
}catch(error){
  console.error(error);
  process.exitCode=1;
}finally{
  clearTimeout(timeout);
  close();
  await delay(140);
  process.exit(process.exitCode??0);
}
