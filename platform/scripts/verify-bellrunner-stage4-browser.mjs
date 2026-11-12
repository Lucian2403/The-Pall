/** Real SvelteKit Bellrunner Stage 4 scenes at 1920, 1280 and 390px.
 * No simulated art/UI. Only the authenticated character API is stubbed.
 * Stage progression itself is covered by the PostgreSQL integration suite.
 */
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {resolve,join} from 'node:path';
import {mkdtempSync,rmSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {
  initialBellrunnerSecondJob,advanceBellrunnerSecondJob,
  availableStageFourActions,STAGE_FOUR_OPENING_LENGTH
} from '../apps/api/src/bellrunner-second-job-work.ts';

const root=resolve(import.meta.dirname,'..');
const isWindows=process.platform==='win32';
const chromeCandidates=[process.env.CHROME_PATH,...(isWindows?[
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA&&join(process.env.LOCALAPPDATA,'Google','Chrome','Application','chrome.exe')
]:['google-chrome','chromium','chromium-browser'])].filter(Boolean);
const chrome=chromeCandidates.find(x=>/[\\/]/.test(x)?existsSync(x):
  spawnSync('which',[x],{stdio:'ignore'}).status===0);
if(!chrome)throw Error('Chromium required for Bellrunner Stage 4 browser QA (set CHROME_PATH).');

const fixtures={};
for(const branch of ['contracts','trauma','machinery']){
  let state=initialBellrunnerSecondJob(branch);
  for(let i=0;i<STAGE_FOUR_OPENING_LENGTH[branch];i++)
    state=advanceBellrunnerSecondJob(state,'continue_opening');
  fixtures[branch]={stage:4,tutorialStatus:'IN_PROGRESS',state,
    availableActions:availableStageFourActions(state),
    tutorialPayout:{coins:0,ordinaryXp:0,items:0}};
}
const port=5185,cdpPort=9253;
const profile=mkdtempSync(join(tmpdir(),'pall-bellrunner-stage4-'));
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
  console.error('Stage 4 browser QA timed out. Vite: '+output.slice(-2300));
  close();process.exit(124);
},240000);
watchdog.unref();
async function until(fn,ms=18000,label='condition'){
  const end=Date.now()+ms;let error;
  while(Date.now()<end){
    try{const x=await fn();if(x)return x;}catch(e){error=e;}
    await delay(170);
  }
  throw Error('Timed out waiting for '+label+(error?': '+error.message:'')+
    ' Vite: '+output.slice(-2500));
}
try{
  const origin='http://127.0.0.1:'+port;
  await until(async()=>(await fetch(origin+'/characters/qa-stage4-bellrunner/bellrunner/second-job')).ok,
    60000,'SvelteKit server');
  browser=spawn(chrome,[
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--no-first-run','--remote-allow-origins=*','--remote-debugging-port='+cdpPort,
    '--user-data-dir='+profile,'about:blank'
  ],{stdio:'ignore'});
  const tab=await until(async()=>{
    const tabs=await (await fetch('http://127.0.0.1:'+cdpPort+'/json')).json();
    return tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
  },18000,'Chromium CDP tab');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((ok,bad)=>{
    ws.addEventListener('open',ok,{once:true});
    ws.addEventListener('error',bad,{once:true});
  });
  let seq=0;const pending=new Map();
  ws.addEventListener('message',event=>{
    let m;try{m=JSON.parse(event.data);}catch{return;}
    if(!m.id)return;
    const call=pending.get(m.id);if(!call)return;
    pending.delete(m.id);
    if(m.error)call.reject(Error(JSON.stringify(m.error)));
    else call.resolve(m.result??{});
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
    if(r.exceptionDetails)throw Error('Browser JS exception: '+JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  };
  await cmd('Page.enable');await cmd('Runtime.enable');
  const stub=String.raw`(()=>{
    const fx=${JSON.stringify(fixtures)};
    const original=window.fetch.bind(window);
    const json=(v,status=200)=>new Response(JSON.stringify(v),
      {status,headers:{'content-type':'application/json'}});
    window.__stage4Posts=[];
    window.fetch=(input,options)=>{
      const route=new URL(typeof input==='string'?input:input.url,location.href).pathname;
      if(!route.startsWith('/api/characters/qa-stage4-bellrunner'))
        return original(input,options);
      const branch=new URLSearchParams(location.search).get('branch')||'contracts';
      const item=fx[branch];
      if(route==='/api/characters/qa-stage4-bellrunner')
        return Promise.resolve(json({character:{
          id:'qa-stage4-bellrunner',name:'QA Bellrunner',origin:'Bellrunner',
          sex:'Male',coins:20,welcomeSeen:true,startingLocation:'Dispatch House',
          health:{current:50,maximum:50},stamina:{current:100,maximum:100},
          tutorial:{stage:4,status:'IN_PROGRESS'}
        }}));
      if(route.endsWith('/dev/rewind-stage'))
        return Promise.resolve(json({enabled:false,canRewind:false,stage:4,targetStage:null}));
      if(route.endsWith('/bellrunner/second-job')){
        if(options?.method==='POST'){
          window.__stage4Posts.push(JSON.parse(options.body||'{}'));
          return Promise.resolve(json({error:'qa_stub_no_write'},503));
        }
        return Promise.resolve(json(item));
      }
      return Promise.resolve(json({error:'unavailable'},404));
    };
  })();`;
  await cmd('Page.addScriptToEvaluateOnNewDocument',{source:stub});
  const folder=resolve(root,'test-artifacts','bellrunner-stage4-visuals');
  mkdirSync(folder,{recursive:true});
  async function screenshot(name){
    const shot=await cmd('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
    writeFileSync(join(folder,name+'.png'),Buffer.from(shot.data,'base64'));
  }
  async function navigate(branch,width,height){
    await cmd('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await evalJS('window.__pallLeaving=true').catch(()=>{});
    await cmd('Page.navigate',{url:origin+'/characters/qa-stage4-bellrunner/bellrunner/second-job?branch='+branch});
    await until(()=>evalJS(`(()=>{
      if(window.__pallLeaving)return false;
      const scene=document.querySelector('.bellrunner-second-job .work-card');
      const img=document.querySelector('.bellrunner-second-job .stage-art img');
      return !!scene&&!!img&&img.complete&&img.naturalWidth>0;
    })()`),26000,branch+' scene at '+width+'x'+height);
    await evalJS('document.fonts.ready.then(()=>true)');
    await delay(200);
    assert.equal(await evalJS("!!document.querySelector('vite-error-overlay')"),false,
      branch+' should compile');
  }
  async function dimensions(){
    return evalJS(`(()=>{
      const rect=selector=>{
        const x=document.querySelector(selector);if(!x)return null;
        const r=x.getBoundingClientRect();
        return {x:r.left,y:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
      };
      const stage=rect('.bellrunner-second-job .activity-stage');
      const panel=rect('.bellrunner-second-job .activity-panel');
      const img=document.querySelector('.bellrunner-second-job .stage-art img');
      return {
        stage,panel,art:rect('.bellrunner-second-job .stage-art'),
        scrollWidth:document.documentElement.scrollWidth,
        clientWidth:document.documentElement.clientWidth,
        imageWidth:img.naturalWidth,imageHeight:img.naturalHeight,
        imagePath:new URL(img.currentSrc).pathname,
        mode:document.querySelector('.bellrunner-second-job .activity-layout')?.dataset.activityMode,
        text:document.querySelector('.bellrunner-second-job .work-card')?.innerText,
        actionCount:document.querySelectorAll('.bellrunner-second-job .actions button').length
      };
    })()`);
  }
  const scenes=[
    ['contracts','/locations/contracts/contracts-office.webp'],
    ['trauma','/locations/clinic/clinic-workshop-cold.webp'],
    ['machinery','/locations/industrial/industrial-courtyard.webp']
  ];
  for(const [branch,path] of scenes){
    for(const [width,height] of [[1920,1080],[1280,720],[390,844]]){
      await navigate(branch,width,height);
      const d=await dimensions();
      assert.equal(d.mode,'scene','Shared ActivityLayout scene mode: '+branch);
      assert.equal(d.imagePath,path,'Uses the owner-approved existing asset: '+branch);
      assert.ok(d.imageWidth>0&&d.imageHeight>0,'Painting loads: '+branch);
      assert.ok(d.scrollWidth<=d.clientWidth,
        'No horizontal overflow at '+width+' '+branch+': '+JSON.stringify(d));
      assert.ok(d.actionCount>0,'At least one valid work action available: '+branch);
      const sideBySide=d.panel.x>=d.stage.right-1&&Math.abs(d.panel.y-d.stage.y)<=2;
      const stacked=d.panel.y>=d.stage.bottom-1;
      if(width>=1280)assert.ok(sideBySide,'Panel beside scene: '+branch+' '+width);
      else assert.ok(stacked,'Panel below scene: '+branch+' '+width);
      if(width===1280||width===390)await screenshot('stage4-'+branch+'-'+width+'x'+height);
      console.log('PASS: '+branch+' scene layout, real owner art and choice at '+width+'×'+height);
    }
    await navigate(branch,1280,720);
    await until(()=>evalJS("document.querySelector('[data-pall-audio-control]')?.dataset.hydrated==='true'"),
      12000,'Svelte shell hydration');
    const action=fixtures[branch].availableActions[0];
    await evalJS("document.querySelector('.bellrunner-second-job .actions button').click();true");
    await until(()=>evalJS("window.__stage4Posts.length>0"),3000,branch+' work POST');
    const posts=await evalJS('window.__stage4Posts');
    assert.equal(posts[0].action,action,'Action goes through the real Stage 4 handler: '+branch);
    const button=await evalJS("document.querySelector('.scene-journal-button')?.outerHTML");
    assert.ok(button,'Persistent journal control should be available: '+branch);
    await evalJS("document.querySelector('.scene-journal-button').click();true");
    await until(()=>evalJS("!!document.querySelector('#bellrunner-second-job-journal')"),
      4000,branch+' journal');
    console.log('PASS: '+branch+' work action and shared journal control');
  }
  console.log('PASS: nine real Stage 4 background/layout combinations plus branch actions and journals');
}catch(error){
  console.error(error);
  process.exitCode=1;
}finally{
  clearTimeout(watchdog);
  close();
  await delay(140);
  process.exit(process.exitCode??0);
}
