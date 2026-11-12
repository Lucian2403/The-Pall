import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {resolve,join} from 'node:path';
import {mkdtempSync,rmSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import * as core from '@the-pall/game-core';
import {step} from '@the-pall/game-core/combat-v0.5.1';
import {initializeFlintCombat} from '../apps/api/src/millhand-combat-opening.ts';
import * as clinicState from '../apps/api/src/millhand-clinic-state.ts';

/* Millhand tutorial scenes in the shared ActivityLayout scene mode, in REAL
 * Svelte pages (run with: node --import tsx). Snapshots are produced by the
 * unchanged game-core state machines and the API's clinic state, then served
 * by a browser-side stub of /api/characters/qa-scenes-millhand (no API,
 * database or login). Every scene, at desktop/laptop/tablet/phone sizes:
 *   - uses scene mode: art stage + reading column, beside on wide screens
 *     and stacked (art first) on phones; the dialogue never covers the art;
 *   - shows the painting at its native ratio when the stage is wider than
 *     the 600px narrow-stage threshold (so hotspots stay registered);
 *   - keeps every stage hotspot inside the stage;
 *   - has no horizontal overflow and no internal dialogue scrollbars.
 * Classic scrollbars stay enabled, so 1280 includes the ~15px page scrollbar.
 */
const root=resolve(import.meta.dirname,'..');

// ---------- Real snapshots ----------
const payout={coins:0,ordinaryXp:0,items:0};
const walk=(state,actionsOf,advance,until,max=40)=>{
  for(let i=0;i<max&&!until(state);i++){
    const actions=actionsOf(state).filter(a=>a!=='previous_dialogue');
    if(!actions.length)break;
    state=advance(state,actions[0]);
  }
  return state;
};
const work=core.INITIAL_PLATEWORK;
const evidence=core.AUTHORED_MISSING_STAMP_EVIDENCE&&
  core.validateMissingStampEvidence(core.AUTHORED_MISSING_STAMP_EVIDENCE)?core.AUTHORED_MISSING_STAMP_EVIDENCE:null;
const stamp=core.INITIAL_MISSING_STAMP;
const depot=walk(core.initialSecondJob('restamp'),core.availableSecondJobActions,core.advanceSecondJob,
  s=>s.phase==='DEPOT_DIALOGUE');
const wage=walk(core.initialWageClaim('restamp'),core.availableWageClaimActions,core.advanceWageClaim,
  s=>s.phase==='CHOOSE_STANCE');
let fight=initializeFlintCombat('qa-scenes-millhand',{current_health:50,max_health:50},'brace',4242);
for(let i=0;i<60&&fight.status==='active';i++){
  const meta=k=>({expectedRevision:fight.revision,requestId:'qa-'+k+'-'+i});
  try{fight=step(fight,{type:'attack',zone:'torso'},meta('a'));}
  catch{try{fight=step(fight,{type:'move',to:'contact'},meta('m'));}catch{fight=step(fight,{type:'recover'},meta('r'));}}
}
let clinic=clinicState.initialClinic(fight);
for(const action of ['examine','speak'])clinic=clinicState.advanceClinic(clinic,action);
const fixtures={
  work:{stage:2,tutorialStatus:'IN_PROGRESS',work,availableActions:[...core.availableActions(work)],tutorialPayout:payout},
  stamp:{stage:3,tutorialStatus:'IN_PROGRESS',majorSkillBonuses:{},state:stamp,
    availableActions:[...core.availableMissingStampActions(stamp,evidence)],contentReady:true,
    detailsAuthored:Boolean(evidence),slip:null,plate:null,finding:null,tutorialPayout:payout},
  depot:{stage:4,tutorialStatus:'IN_PROGRESS',state:depot,availableActions:[...core.availableSecondJobActions(depot)],tutorialPayout:payout},
  contracts:{stage:4,tutorialStatus:'IN_PROGRESS',state:core.initialSecondJob('contracts'),
    availableActions:[...core.availableSecondJobActions(core.initialSecondJob('contracts'))],tutorialPayout:payout},
  records:{stage:4,tutorialStatus:'IN_PROGRESS',state:core.initialSecondJob('records'),
    availableActions:[...core.availableSecondJobActions(core.initialSecondJob('records'))],tutorialPayout:payout},
  wage:{stage:5,tutorialStatus:'IN_PROGRESS',state:wage,availableActions:[...core.availableWageClaimActions(wage)],tutorialPayout:payout},
  clinic:clinicState.clinicView(clinic,20)
};
assert.equal(depot.phase,'DEPOT_DIALOGUE','Depot fixture reaches the receiving counter');
assert.equal(wage.phase,'CHOOSE_STANCE','Wage-claim fixture reaches the stance choice');

// [name, path, tutorial stage, ready selector, art selector, native art ratio]
const W=2,A=1672/941;
const scenes=[
  ['Stage 1 workshop','/characters/qa-scenes-millhand/opening',1,'.workshop .illustration','.illustration',W],
  ['Stage 2 platework','/characters/qa-scenes-millhand/millhand/work?qa=work',2,'.workshop .illustration','.illustration',W],
  ['Stage 3 missing stamp','/characters/qa-scenes-millhand/millhand/missing-stamp?qa=stamp',3,'.workshop .illustration','.illustration',W],
  ['Stage 4 depot','/characters/qa-scenes-millhand/millhand/second-job?qa=depot',4,'.depot-stage','.depot-stage',W],
  ['Stage 4 contracts','/characters/qa-scenes-millhand/millhand/second-job?qa=contracts',4,'.room-stage','.room-stage',W],
  ['Stage 4 records','/characters/qa-scenes-millhand/millhand/second-job?qa=records',4,'.room-stage','.room-stage',W],
  ['Stage 5 wage claim','/characters/qa-scenes-millhand/millhand/wage-claim?qa=wage',5,'.alley-scene .flint-figure','.alley-scene',A],
  ['Stage 7 clinic','/characters/qa-scenes-millhand/millhand/clinic?qa=clinic',7,'.clinic-dialogue','.clinic-scene',A],
  ['Stage 8 home','/characters/qa-scenes-millhand/home',8,'.home-artwork','.home-scene',A]
];
const sizes=[[1920,1080],[1280,720],[1024,768],[390,844]];

const stub=String.raw`(()=>{
  const fx=${JSON.stringify(fixtures)};
  const original=window.fetch.bind(window);
  const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'content-type':'application/json'}});
  const path=location.pathname;
  const stage=path.endsWith('/opening')?1:path.endsWith('/millhand/work')?2:path.endsWith('/millhand/missing-stamp')?3
    :path.endsWith('/millhand/second-job')?4:path.endsWith('/millhand/wage-claim')?5
    :path.endsWith('/millhand/clinic')?7:path.endsWith('/home')?8:6;
  const key=new URLSearchParams(location.search).get('qa');
  window.fetch=(input,options)=>{
    const route=new URL(typeof input==='string'?input:input.url,location.href).pathname;
    if(!route.startsWith('/api/characters/qa-scenes-millhand'))return original(input,options);
    const method=options?.method||'GET';
    if(route==='/api/characters/qa-scenes-millhand')return Promise.resolve(json({character:{
      id:'qa-scenes-millhand',name:'QA Millhand',origin:'Millhand',sex:'Female',coins:20,avatarId:null,
      welcomeSeen:true,startingLocation:'Smithing Workshop',health:{current:50,maximum:50},
      stamina:{current:100,maximum:100},attributes:{STR:6,DEX:5,INT:5,RES:6},
      majorSkillBonuses:{'Industry / Smithing':1},starterItemRequirements:[],
      tutorial:{stage,status:stage===1?'NOT_STARTED':'IN_PROGRESS'}}}));
    if(route.endsWith('/dev/rewind-stage'))return Promise.resolve(json({enabled:false,canRewind:false,stage,targetStage:null}));
    if(method==='POST'){
      window.__pallPosts=(window.__pallPosts||[]).concat([JSON.parse(options.body||'{}')]);
      return Promise.resolve(json({error:'qa_stub_no_write'},503));
    }
    if(route.endsWith('/tutorial/home'))return Promise.resolve(json({stage:8,revision:0,phase:'HOME',
      homeId:'qa-home',origin:'Millhand',branch:'restamp',outcome:'player_victory',characterName:'QA Millhand',
      coins:10,rent:150,shortfall:140,noticeTitle:'Notice',noticeText:'Rent is due.',closingSpeech:'Right.',
      completed:false,condition:{stamina:100,composure:100,fatigue:0,stress:0}}));
    if(route.endsWith('/inventory')){
      const empty={slotsUsed:0,maxSlots:12,weightKg:0,volumeL:0,maxWeightKg:20,maxVolumeL:30,overCapacity:false,items:[]};
      return Promise.resolve(json({revision:0,storageEnabled:true,pack:empty,chest:{...empty,maxSlots:24},
        equipment:{items:[]},bonuses:{armour:0,weaponDamage:null,pallProtection:0,ashProtection:0,
          maxWeightKg:20,inventorySlots:12,maxVolumeL:30}}));
    }
    if(key&&fx[key]&&/\/millhand\/(work|missing-stamp|second-job|wage-claim|clinic)$/.test(route))
      return Promise.resolve(json(fx[key]));
    return Promise.resolve(json({error:'unavailable'},404));
  };
})();`;

// ---------- Browser + dev server (same approach as verify-game-shell-browser) ----------
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
if(!chrome)throw Error('Chromium required for Millhand scene geometry (set CHROME_PATH).');
const profile=mkdtempSync(join(tmpdir(),'pall-millhand-scenes-'));
const port=5186,cdpPort=9251;
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
  console.error('Millhand scene browser QA timed out: '+output.slice(-2000));
  close();process.exit(124);
},300000);
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
  let id=0;const pending=new Map();const exceptions=[];
  ws.addEventListener('message',e=>{
    let msg;try{msg=JSON.parse(e.data);}catch{return;}
    if(msg.method==='Runtime.exceptionThrown')exceptions.push(msg.params?.exceptionDetails?.exception?.description??'exception');
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
  await cmd('Page.addScriptToEvaluateOnNewDocument',{source:stub});
  const folder=resolve(root,'test-artifacts','millhand-scenes');
  mkdirSync(folder,{recursive:true});
  async function open(path,width,height,ready){
    await cmd('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await evalJS('window.__pallLeaving=true').catch(()=>{});
    await cmd('Page.navigate',{url:origin+path});
    await until(()=>evalJS('!window.__pallLeaving&&!!document.querySelector('+JSON.stringify(ready)+')&&[...document.images].every(i=>i.complete)'),
      24000,path+' at '+width+'x'+height);
    await evalJS('document.fonts.ready.then(()=>true)');
    await delay(350);
    assert.equal(await evalJS("!!document.querySelector('vite-error-overlay')"),false,'No compile overlay on '+path);
  }
  async function shot(name){
    const s=await cmd('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
    writeFileSync(join(folder,name+'.png'),Buffer.from(s.data,'base64'));
  }
  const measure=art=>evalJS(`(()=>{
    const box=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
    const layout=document.querySelector('.chapter-content .activity-layout');
    const stage=document.querySelector('.chapter-content .activity-stage');
    const panel=document.querySelector('.chapter-content .activity-panel');
    const artEl=document.querySelector(${JSON.stringify(art)});
    const cs=getComputedStyle(stage);
    const stageContent=stage.getBoundingClientRect().width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    const s=box(stage);
    const outside=[...stage.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>[b,box(b)])
      .filter(([,r])=>r.width>0&&(r.left<s.left-1||r.right>s.right+1||r.top<s.top-1||r.bottom>s.bottom+1))
      .map(([b])=>b.getAttribute('aria-label')||b.className);
    const scrollers=[...document.querySelectorAll('.chapter-content *')].filter(e=>{const st=getComputedStyle(e);
      return /(auto|scroll)/.test(st.overflowY)&&e.scrollHeight>e.clientHeight+2&&e.clientHeight>0;})
      .map(e=>e.className.toString().split(' ')[0]);
    const reading=panel?.querySelector('.reading-column');
    return {mode:layout?.dataset.activityMode??null,stage:s,panel:panel?box(panel):null,stageContent,
      art:artEl?box(artEl):null,outside,scrollers,
      readingText:(reading?.textContent??'').trim().length,
      sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth};
  })()`);

  let checks=0;
  for(const [name,path,,ready,art,ratio] of scenes){
    for(const [width,height] of sizes){
      await open(path,width,height,ready);
      const g=await measure(art);
      const tag=name+' '+width+'x'+height+' '+JSON.stringify({stage:g.stage,panel:g.panel,art:g.art,stageContent:g.stageContent});
      assert.equal(g.mode,'scene','Uses the shared scene layout: '+tag);
      assert.ok(g.sw<=g.cw,'No horizontal overflow: '+tag);
      assert.ok(g.panel&&g.readingText>0,'Dialogue lives in the reading column: '+tag);
      const beside=g.panel.left>=g.stage.right-1&&Math.abs(g.panel.top-g.stage.top)<=1;
      const below=g.panel.top>=g.stage.bottom-1;
      if(width>=1024)assert.ok(beside,'Reading column sits BESIDE the art on wide screens: '+tag);
      else assert.ok(below,'Reading column follows BELOW the art on phones: '+tag);
      assert.deepEqual(g.scrollers,[],'No internal scrollbars in the scene: '+tag);
      assert.deepEqual(g.outside,[],'Every stage hotspot stays inside the stage: '+tag);
      if(g.stageContent>600){
        const actual=g.art.width/g.art.height;
        assert.ok(Math.abs(actual-ratio)/ratio<0.02,'Painting keeps its native ratio ('+ratio.toFixed(3)+'): '+actual.toFixed(3)+' '+tag);
      }
      if(width===1280||width===390)await shot(name.replace(/\W+/g,'-').toLowerCase()+'-'+width+'x'+height);
      checks++;
    }
    console.log('PASS: '+name+' — scene layout at '+sizes.map(s=>s.join('x')).join(', '));
  }

  // Confirm the owner-approved Millhand normal/hover skin is computed
  // from the SAME global primary-choice rule used by Bellrunner Stage 4.
  let sharedPrimary=null;
  for(const [url,ready] of [
    ['/characters/qa-scenes-millhand/opening','.workshop .illustration'],
    ['/characters/qa-scenes-millhand/millhand/second-job?qa=depot','.depot-stage'],
    ['/characters/qa-scenes-millhand/millhand/clinic?qa=clinic','.clinic-dialogue']
  ]){
    await open(url,1280,720,ready);
    sharedPrimary=await evalJS(`(()=>{
      const button=document.querySelector('.chapter-content .pall-story-dialogue-section .primary-choice');
      if(!button)return null;
      button.scrollIntoView({block:'center'});
      const cs=getComputedStyle(button);
      const r=button.getBoundingClientRect();
      return {source:cs.borderImageSource,slice:cs.borderImageSlice,
        x:r.left+r.width/2,y:r.top+r.height/2};
    })()`);
    if(sharedPrimary)break;
  }
  assert.ok(sharedPrimary,'At least one Millhand forward action must use the canonical primary');
  assert.ok(sharedPrimary.source.includes('button-normal-trim.png')&&
    sharedPrimary.slice.includes('50 180 45 180'),
    'Millhand primary and Bellrunner must use the exact same owner image and slice: '+JSON.stringify(sharedPrimary));
  await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:sharedPrimary.x,y:sharedPrimary.y});
  await delay(80);
  const hoverArt=await evalJS(`(()=>{
    const b=document.querySelector('.chapter-content .pall-story-dialogue-section .primary-choice');
    return getComputedStyle(b).borderImageSource;
  })()`);
  assert.ok(hoverArt.includes('button-hover-trim.png'),
    'Millhand primary hover must use the same image as Bellrunner hover');
  console.log('PASS: Millhand actual primary button matches the Bellrunner normal/hover nine-slice skin');

  // Interactions still reach their real handlers through the new layout.
  await open('/characters/qa-scenes-millhand/millhand/wage-claim?qa=wage',1280,720,'.alley-scene .flint-figure');
  await evalJS("document.querySelector('.flint-figure').click()");
  await until(()=>evalJS("!!document.querySelector('.activity-panel .inspection')"),4000,'Flint inspection');
  await evalJS("document.querySelector('.activity-panel .actions button').click()");
  const posts=await until(()=>evalJS('window.__pallPosts'),4000,'stance POST');
  assert.equal(posts[0]?.action,fixtures.wage.availableActions.find(a=>a!=='previous_dialogue'),
    'A stance choice posts the first saved Stage 5 action');
  console.log('PASS: Stage 5 — Flint inspection opens in the reading column; stance choice posts '+posts[0].action);
  await open('/characters/qa-scenes-millhand/home',1280,720,'.home-artwork');
  await evalJS("document.querySelector('.hotspot.book').click()");
  await until(()=>evalJS("document.querySelector('dialog.room-overlay')?.open===true"),4000,'journal modal');
  console.log('PASS: Stage 8 — the journal hotspot opens the room modal above the scene');

  assert.deepEqual(exceptions,[],'No uncaught page exceptions');
  console.log('PASS: Millhand scenes — '+checks+' scene/size layouts and in-scene interactions verified in real pages');
}finally{
  clearTimeout(timeout);
  close();
}
