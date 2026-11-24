import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {resolve,join} from 'node:path';
import {mkdtempSync,rmSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import * as core from '@the-pall/game-core';
import {step} from '@the-pall/game-core/combat-v0.5.1';
import {initializeFlintCombat} from '../apps/api/src/millhand-combat-opening.ts';
import {initializeDogmanCombat} from '../apps/api/src/bellrunner-dogman-combat-opening.ts';
import * as clinicState from '../apps/api/src/millhand-clinic-state.ts';
import * as homeState from '../apps/api/src/shared-home-state.ts';

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
const dogmanFight=initializeDogmanCombat('qa-scenes-bellrunner',
  {current_health:50,max_health:50},'defend',17);
const dogmanVictory=structuredClone(dogmanFight);
dogmanVictory.status='finished';dogmanVictory.outcome='player_victory';
dogmanVictory.player.hp=50;
const dogmanDefeat=structuredClone(dogmanFight);
dogmanDefeat.status='finished';dogmanDefeat.outcome='player_defeat';
dogmanDefeat.player.hp=0;
let bellClinicLeft=clinicState.initialClinic(dogmanVictory);
for(const action of ['examine','speak','review_price','pay','leave'])
  bellClinicLeft=clinicState.advanceClinic(bellClinicLeft,action);
assert.equal(bellClinicLeft.phase,'LEFT','Bellrunner browser fixture must be a completed clinic');
let clinic=clinicState.initialClinic(fight);
for(const action of ['examine','speak'])clinic=clinicState.advanceClinic(clinic,action);
const bellHomeStart=homeState.initial('Bellrunner','machinery','player_victory');
let bellHomeDone=bellHomeStart;
for(const action of ['read_notice','put_down','finish'])
  bellHomeDone=homeState.advance(bellHomeDone,action);
const completedHome=(origin,branch)=>{
  let state=homeState.initial(origin,branch,'player_victory');
  for(const action of ['read_notice','put_down','finish'])state=homeState.advance(state,action);
  return homeState.view(state,'QA '+origin,10);
};
const fixtures={
  bellHome:homeState.view(bellHomeStart,'QA Bellrunner',10),
  bellHomeDone:homeState.view(bellHomeDone,'QA Bellrunner',10),
  millHomeDone:completedHome('Millhand','restamp'),
  stitcherHomeDone:completedHome('Stitcher','notes'),
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
  clinic:clinicState.clinicView(clinic,20),
  bellClinicDefeat:clinicState.clinicView(clinicState.initialClinic(dogmanDefeat),20),
  bellClinicVictory:clinicState.clinicView(clinicState.initialClinic(dogmanVictory),20),
  bellClinicLeft:clinicState.clinicView(bellClinicLeft,10),
  stitcherClinicVictory:clinicState.clinicView(clinicState.initialClinic(dogmanVictory),20),
  stitcherClinicDefeat:clinicState.clinicView(clinicState.initialClinic(dogmanDefeat),20)
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
  ['Bellrunner Stage 7 defeat','/characters/qa-scenes-bellrunner/bellrunner/clinic?qa=bellClinicDefeat',7,'.clinic-dialogue','.clinic-scene',A],
  ['Bellrunner Stage 7 victory','/characters/qa-scenes-bellrunner/bellrunner/clinic?qa=bellClinicVictory',7,'.clinic-dialogue','.clinic-scene',A],
  ['Bellrunner Stage 7 completed','/characters/qa-scenes-bellrunner/bellrunner/clinic?qa=bellClinicLeft',7,'.clinic-dialogue','.clinic-scene',A],
  ['Stitcher Stage 7 victory','/characters/qa-scenes-stitcher/stitcher/clinic?qa=stitcherClinicVictory',7,'.clinic-dialogue','.clinic-scene',A],
  ['Stitcher Stage 7 defeat','/characters/qa-scenes-stitcher/stitcher/clinic?qa=stitcherClinicDefeat',7,'.clinic-dialogue','.clinic-scene',A],
  ['Stage 8 home','/characters/qa-scenes-millhand/home',8,'.home-artwork','.home-scene',A],
  ['Bellrunner Stage 8 shared home','/characters/qa-scenes-bellrunner/home?qa=bellHome',8,'.home-artwork','.home-scene',A],
  ['Bellrunner Stage 8 complete','/characters/qa-scenes-bellrunner/home?qa=bellHomeDone',8,'.home-artwork','.home-scene',A],
  ['Millhand Stage 8 complete','/characters/qa-scenes-millhand/home?qa=millHomeDone',8,'.home-artwork','.home-scene',A],
  ['Stitcher Stage 8 complete','/characters/qa-scenes-stitcher/home?qa=stitcherHomeDone',8,'.home-artwork','.home-scene',A]
];
const sizes=[[1920,1080],[1280,720],[1024,768],[390,844]];

const stub=String.raw`(()=>{
  const fx=${JSON.stringify(fixtures)};
  const original=window.fetch.bind(window);
  const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'content-type':'application/json'}});
  const path=location.pathname;
  const stage=path.endsWith('/opening')?1:path.endsWith('/millhand/work')?2:path.endsWith('/millhand/missing-stamp')?3
    :path.endsWith('/millhand/second-job')?4:path.endsWith('/millhand/wage-claim')?5
    :path.endsWith('/millhand/clinic')||path.endsWith('/bellrunner/clinic')||path.endsWith('/stitcher/clinic')?7:path.endsWith('/home')?8:6;
  const key=new URLSearchParams(location.search).get('qa');
  window.fetch=(input,options)=>{
    const route=new URL(typeof input==='string'?input:input.url,location.href).pathname;
    if(!route.startsWith('/api/characters/qa-scenes-millhand')&&
       !route.startsWith('/api/characters/qa-scenes-bellrunner')&&
       !route.startsWith('/api/characters/qa-scenes-stitcher'))return original(input,options);
    const method=options?.method||'GET';
    if(route==='/api/characters/qa-scenes-millhand')return Promise.resolve(json({character:{
      id:'qa-scenes-millhand',name:'QA Millhand',origin:'Millhand',sex:'Female',coins:20,avatarId:null,
      welcomeSeen:true,startingLocation:'Smithing Workshop',health:{current:50,maximum:50},
      stamina:{current:100,maximum:100},attributes:{STR:6,DEX:5,INT:5,RES:6},
      majorSkillBonuses:{'Industry / Smithing':1},starterItemRequirements:[],
      tutorial:{stage,status:stage===1?'NOT_STARTED':'IN_PROGRESS'}}}));
    if(route==='/api/characters/qa-scenes-bellrunner')return Promise.resolve(json({character:{
      id:'qa-scenes-bellrunner',name:'QA Bellrunner',origin:'Bellrunner',sex:'Female',coins:20,
      welcomeSeen:true,startingLocation:'Dispatch House',health:{current:0,maximum:50},
      tutorial:{stage:stage===8?8:7,status:key==='bellHomeDone'?'COMPLETED':'IN_PROGRESS'}}}));
    if(route==='/api/characters/qa-scenes-stitcher')return Promise.resolve(json({character:{
      id:'qa-scenes-stitcher',name:'QA Stitcher',origin:'Stitcher',sex:'Female',coins:20,
      welcomeSeen:true,startingLocation:'Cinder Row Infirmary',health:{current:0,maximum:50},
      tutorial:{stage,status:stage===8?'COMPLETED':'IN_PROGRESS'}}}));
    if(route.endsWith('/journal')){
      const bellrunner=route.includes('qa-scenes-bellrunner');
      return Promise.resolve(json({
        characterId:bellrunner?'qa-scenes-bellrunner':'qa-scenes-millhand',
        completed:bellrunner?[
         {taskInstanceId:'tutorial:stage:3',taskId:'bellrunner.wrong-bell',stage:3,
          title:'The Wrong Bell',paragraphs:['I checked the bell linkage. The retaining pin had been moved.'],
          choices:{route:'machinery'},outcome:null,contentVersion:1,completedAt:'2026-11-20'},
         {taskInstanceId:'tutorial:stage:6',taskId:'dogman.combat',stage:6,
          title:'The Fight with Dogman',paragraphs:['Dogman tried to take my papers, but I got past him.'],
          choices:{},outcome:'player_victory',contentVersion:1,completedAt:'2026-11-20'}
        ]:[
         {taskInstanceId:'tutorial:stage:2',taskId:'millhand.marking-plates',stage:2,
          title:'Marking the Plates',paragraphs:['I worked on the council plates. They had to be stamped properly.'],
          choices:{},outcome:null,contentVersion:1,completedAt:'2026-11-20'}
        ],nextCursor:null
      }));
    }
    if(route.endsWith('/dev/rewind-stage'))return Promise.resolve(
      json(route.includes('qa-scenes-bellrunner')
        ?{enabled:true,canRewind:true,stage:key?.startsWith('bellHome')?8:key==='bellClinicLeft'?8:7,
           targetStage:key?.startsWith('bellHome')?7:6}
        :{enabled:false,canRewind:false,stage,targetStage:null}));
    if(method==='POST'&&!route.endsWith('/inventory')&&
      !route.endsWith('/inventory/storage-context')){
      window.__pallPosts=(window.__pallPosts||[]).concat([JSON.parse(options.body||'{}')]);
      return Promise.resolve(json({error:'qa_stub_no_write'},503));
    }
    if(route.endsWith('/tutorial/home')){
      if(key?.startsWith('bellHome')||key==='millHomeDone'||key==='stitcherHomeDone')
        return Promise.resolve(json(fx[key]));
      return Promise.resolve(json({stage:8,revision:0,phase:'HOME',
       homeId:'qa-home',origin:'Millhand',branch:'restamp',outcome:'player_victory',characterName:'QA Millhand',
       coins:10,rent:150,shortfall:140,noticeTitle:'Notice',noticeText:'Rent is due.',closingSpeech:'Right.',
       completed:false,condition:{stamina:100,composure:100,fatigue:0,stress:0}}));
    }
    if(route.endsWith('/inventory/storage-context')){
      const data=JSON.parse(options?.body||'{}');
      if(data.action==='close'){
        if(data.token===window.__qaRoomToken)window.__qaRoomToken=null;
        return Promise.resolve(json({closed:true}));
      }
      if(!path.endsWith('/home'))return Promise.resolve(json({error:'storage_not_unlocked'},409));
      window.__qaRoomToken='b'.repeat(64);
      window.__qaContextOpens=(window.__qaContextOpens||0)+1;
      return Promise.resolve(json({token:window.__qaRoomToken,expiresInSeconds:600}));
    }
    if(route.endsWith('/inventory')){
      const makeItem=(id,code,name,quantity,slot=null)=>({
        id,code,name,description:'An ordinary possession from Grand Cylinder City.',
        category:slot==='back'?'bag':slot==='torso'?'clothing':'component',
        rarity:'Common',armour:0,carrySlotsBonus:slot==='back'?6:0,
        equipSlot:slot,equipmentSlot:slot,quantity,
        stackable:quantity>1,maxStack:10,qualityTier:1,weightKg:.1,volumeL:.1,
        carryVolumeBonusL:slot==='back'?12:0,currentDurability:100,maxDurability:100,
        designStatus:'PROVISIONAL'
      });
      window.__qaInventory??={
        revision:0,storageEnabled:false,
        pack:{slotsUsed:1,maxSlots:10,weightKg:.5,volumeL:.5,maxWeightKg:20,
          maxVolumeL:17,overCapacity:false,
          items:[makeItem('qa-rivets','test_rivet','Steel Rivets',5)]},
        chest:{slotsUsed:1,maxSlots:24,weightKg:.2,volumeL:.2,maxWeightKg:120,
          maxVolumeL:200,overCapacity:false,
          items:[makeItem('qa-needles','test_needle','Spare Needles',2)]},
        equipment:{items:[
          makeItem('qa-clothes','basic_clothes','Daily Worker Clothes',1,'torso'),
          makeItem('qa-bag','crude_small_bag','Simple Bag',1,'back')]},
        bonuses:{armour:0,weaponDamage:null,pallProtection:0,ashProtection:0,
          maxWeightKg:20,inventorySlots:10,maxVolumeL:17}
      };
      const state=window.__qaInventory;
      const token=options?.headers?.['x-pall-storage-context'];
      const available=!!token&&token===window.__qaRoomToken;
      const view=()=>({...state,storageEnabled:available,
        chest:available?state.chest:{...state.chest,items:[]}});
      if(method==='GET')return Promise.resolve(json(view()));
      const command=JSON.parse(options.body||'{}');
      window.__qaInventoryPosts=(window.__qaInventoryPosts||[]).concat([command]);
      if(command.expectedRevision!==state.revision)
        return Promise.resolve(json({error:'stale_revision'},409));
      const places=['equipment','pack','chest'];
      const source=places.find(place=>state[place].items.some(x=>x.id===command.itemInstanceId));
      const item=source?state[source].items.find(x=>x.id===command.itemInstanceId):null;
      if(!item)return Promise.resolve(json({error:'item_not_owned'},409));
      if((source==='chest'||command.to==='home_chest')&&!available)
        return Promise.resolve(json({error:'storage_context_required'},409));
      if(command.kind==='equip'){
        state[source].items=state[source].items.filter(x=>x.id!==item.id);
        state.equipment.items.push({...item,equipmentSlot:command.slot});
      }else{
        const dest=command.to==='home_chest'?'chest':'pack';
        const count=command.quantity;
        if(count===item.quantity)state[source].items=state[source].items.filter(x=>x.id!==item.id);
        else item.quantity-=count;
        state[dest].items.push({...item,quantity:count,equipmentSlot:null});
      }
      state.pack.slotsUsed=state.pack.items.length;
      state.chest.slotsUsed=state.chest.items.length;
      state.revision++;
      return Promise.resolve(json(view()));
    }
    if(key&&fx[key]&&(/\/millhand\/(work|missing-stamp|second-job|wage-claim|clinic)$/.test(route)
      ||/\/bellrunner\/clinic$/.test(route)||/\/stitcher\/clinic$/.test(route)))
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
  const inventoryOnly=process.argv.includes('--inventory-only');
  if(!inventoryOnly){
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

  // Shared home must be the same image while the Bellrunner journal shows
  // only the saved machinery finding and Dogman victory. The chapter header
  // must expose its proper previous stage (VII), even after completion.
  for(const key of ['bellHome','bellHomeDone']){
    await open('/characters/qa-scenes-bellrunner/home?qa='+key,
      1280,720,'.home-dialogue');
    await until(()=>evalJS(
      "[...document.querySelectorAll('.chapter-bar .rewind-button')].some(b=>b.textContent.includes('Back to Stage 7'))"),
      5000,'Bellrunner Stage VIII Back to Stage 7');
    const text=await evalJS("document.querySelector('.home-dialogue')?.innerText");
    assert.ok(key==='bellHomeDone'?text.includes('Bellrunner opening complete'):
      text.includes('You return to your rented home'),text);
    assert.ok(!text.includes('Millhand opening complete'),text);
    await evalJS("document.querySelector('.scene-journal-button').click()");
    await until(()=>evalJS("!!document.querySelector('#personal-journal')"),
      5000,'Bellrunner shared character Journal');
    await evalJS("document.querySelectorAll('#personal-journal .journal-tabs button')[1].click()");
    await until(()=>evalJS("document.querySelectorAll('#personal-journal .task-list button').length===2"),
      5000,'Bellrunner archived tasks');
    await evalJS("document.querySelector('#personal-journal .task-list button').click()");
    const journal=await evalJS("document.querySelector('#personal-journal')?.innerText");
    assert.match(journal,/retaining pin|bell linkage/);
    assert.match(journal,/Dogman/);
    assert.ok(!journal.includes('Flint')&&!journal.includes('dead worker number')&&
      !journal.includes('non-work illness'),journal);
    await shot('bellrunner-'+key+'-back-to-stage-7');
  }
  console.log('PASS: Bellrunner Stage VIII uses same rented room with Back to Stage VII and one chosen journal finding.');
  
  // The final frame is one common component, with origin-specific endings.
  const completeCases=[
    {key:'millHomeDone',id:'qa-scenes-millhand',origin:'Millhand',
      expected:'The council has not paid for the plate lot.'},
    {key:'bellHomeDone',id:'qa-scenes-bellrunner',origin:'Bellrunner',
      expected:'The condemned worksite remains closed'},
    {key:'stitcherHomeDone',id:'qa-scenes-stitcher',origin:'Stitcher',
      expected:'You stopped Owler from taking him'}
  ];
  for(const chosen of completeCases){
    await open('/characters/'+chosen.id+'/home?qa='+chosen.key,
      1280,720,'.home-dialogue.completion');
    const copy=await evalJS("document.querySelector('.home-dialogue.completion')?.innerText");
    assert.ok(copy.includes(chosen.origin+' opening complete.'),copy);
    assert.ok(copy.includes(chosen.expected),copy);
    for(const other of completeCases){
      if(other.origin!==chosen.origin)assert.ok(!copy.includes(other.expected),
        chosen.origin+' displayed '+other.origin+' ending: '+copy);
    }
    assert.match(copy,/10 coins remaining. Rent notice: 150 coins./);
  }
  console.log('PASS: Stage VIII shows the correct ending for Millhand, Bellrunner and Stitcher.');

  // Stitcher's arrival is two panels. Continue is local; only Examine posts.
  for(const outcome of ['Victory','Defeat']){
    await open('/characters/qa-scenes-stitcher/stitcher/clinic?qa=stitcherClinic'+outcome,
      1280,720,'.clinic-dialogue');
    const first=await evalJS("document.querySelector('.clinic-dialogue')?.innerText");
    assert.match(first,outcome==='Victory'
      ?/You return to the infirmary after the fight with Owler/
      :/An unnamed ward worker helps you into the ordinary treatment area/);
    assert.match(first,/A clinician sees you come in and points to an examination chair/);
    assert.doesNotMatch(first,/Come on, sit down|Owler tried to take one of the patients away/);
    assert.match(await evalJS("document.querySelector('.clinic-dialogue .actions button')?.textContent"),/Continue/);
    assert.equal(await evalJS("window.__pallPosts?.length??0"),0);
    await evalJS("document.querySelector('.clinic-dialogue .actions button').click()");
    await until(()=>evalJS(
      "document.querySelector('.clinic-dialogue')?.innerText.includes('Owler tried to take one of the patients away')"),
      4500,'Stitcher clinician conversation after Continue');
    const second=await evalJS("document.querySelector('.clinic-dialogue')?.innerText");
    assert.match(second,/Come on, sit down. What happened out there/);
    assert.match(second,/Owler tried to take one of the patients away. I stood in his way/);
    assert.match(second,/I see. Well, let's have a look at you/);
    assert.doesNotMatch(second,/A clinician sees you come in and points to an examination chair/);
    assert.match(await evalJS("document.querySelector('.clinic-dialogue .actions button')?.textContent"),/Examine condition/);
    assert.equal(await evalJS("window.__pallPosts?.length??0"),0,
      'Continue must not mutate persisted clinic state');
    await evalJS("document.querySelector('.clinic-dialogue .actions button').click()");
    const posts=await until(()=>evalJS("window.__pallPosts"),4000,'Stitcher examination command');
    assert.equal(posts.length,1);
    assert.equal(posts[0].action,'examine');
    await shot('stitcher-clinic-dialogue-step-2-'+outcome.toLowerCase());
  }
  console.log('PASS: Stitcher Stage VII separates arrival and clinician dialogue, preserving one saved examination.');

  // The Bellrunner arrival is real Svelte dialogue, not a static screenshot.
  // Both outcomes must begin AT the clinic, not repeat Dogman's escape.
  await open('/characters/qa-scenes-bellrunner/bellrunner/clinic?qa=bellClinicDefeat',
    1280,720,'.clinic-dialogue');
  let opening=await evalJS("document.querySelector('.clinic-dialogue')?.innerText");
  assert.match(opening,/The passerby helps you through the city clinic door/);
  assert.ok(!opening.includes('through the streets'));
  assert.ok(!opening.includes('Flint'));
  await until(()=>evalJS(
    "[...document.querySelectorAll('.chapter-bar .rewind-button')].some(b=>b.textContent.includes('Back to Stage 6'))"),
    4500,'Bellrunner Stage VII Back to Stage 6 control');
  for(const expected of [
    'The clinician looks up as you approach.',
    'What happened?',
    'A man tried to take my bag. He came at me with a club.',
    "Sit down. I'll have a look."
  ]){
    await evalJS("document.querySelector('.clinic-dialogue .actions button').click()");
    await until(()=>evalJS(
      "document.querySelector('.clinic-dialogue')?.innerText.includes("+JSON.stringify(expected)+")"),
      4500,'Bellrunner approved clinic opening: '+expected);
  }
  assert.match(await evalJS("document.querySelector('.clinic-dialogue .actions button')?.textContent"),
    /Examine condition/);
  await evalJS("document.querySelector('.clinic-dialogue .actions button').click()");
  const bellPosts=await until(()=>evalJS('window.__pallPosts'),4000,'Bellrunner clinical examination command');
  assert.equal(bellPosts[0]?.action,'examine');
  await open('/characters/qa-scenes-bellrunner/bellrunner/clinic?qa=bellClinicVictory',
    1280,720,'.clinic-dialogue');
  const healthyOpening=await evalJS("document.querySelector('.clinic-dialogue')?.innerText");
  assert.match(healthyOpening,/You arrive at the city clinic on your own/);
  assert.ok(!healthyOpening.includes('Dogman lowers his club'));
  await until(()=>evalJS(
    "[...document.querySelectorAll('.chapter-bar .rewind-button')].some(b=>b.textContent.includes('Back to Stage 6'))"),
    4500,'Bellrunner Stage VII victory Back to Stage 6 control');
  await open('/characters/qa-scenes-bellrunner/bellrunner/clinic?qa=bellClinicLeft',
    1280,720,'.clinic-dialogue');
  const completedText=await evalJS("document.querySelector('.clinic-dialogue')?.innerText");
  assert.match(completedText,/Travel Home/);
  assert.match(completedText,/Coins remaining: 10/);
  assert.equal(await evalJS(
    "document.querySelector('.chapter-meta')?.innerText.includes('Stage 7')"),true,
    'Completed clinic must still be visually labelled Stage 7');
  await until(()=>evalJS(
    "[...document.querySelectorAll('.chapter-bar .rewind-button')].some(b=>b.textContent.includes('Back to Stage 6'))"),
    5000,'Back to Stage 6 must survive the saved LEFT / tutorial_stage=8 state');
  await shot('bellrunner-completed-clinic-back-to-stage-6');
  console.log('PASS: Bellrunner Stage VII completed screen still exposes Back to Stage 6 after leaving.');

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
    sharedPrimary.slice.includes('50 180 45'),
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
  await until(()=>evalJS("!!document.querySelector('#personal-journal')"),4000,'shared Journal');
  await evalJS("document.querySelectorAll('#personal-journal .journal-tabs button')[1].click()");
  await until(()=>evalJS("!!document.querySelector('#personal-journal .task-list button')"),4000,'Millhand archived work');
  await evalJS("document.querySelector('#personal-journal .task-list button').click()");
  const millhandDiary=await evalJS("document.querySelector('#personal-journal')?.innerText");
  assert.match(millhandDiary,/Marking the Plates|council plates/);
  assert.ok(!millhandDiary.includes('Dogman')&&!millhandDiary.includes('bell linkage'));
  console.log('PASS: Stage VIII — one Journal interface reads only the selected character');
  }

  // New independent windows use the same real Svelte TutorialShell and Home page.
  // Snapshot fixtures do not replace the PostgreSQL ownership/transaction tests.
  await open('/characters/qa-scenes-millhand/home',1280,720,'.home-artwork');
  await evalJS("document.querySelector('[data-open-inventory]').click()");
  try{
    await until(()=>evalJS("!!document.querySelector('[data-game-window=\"inventory\"] .inventory-window')"),
      7000,'independent Inventory window');
  }catch(error){
    const info=await evalJS("(()=>({nav:document.querySelector('[data-open-inventory]')?.getAttribute('aria-expanded'),"+
      "windows:[...document.querySelectorAll('[data-game-window]')].map(e=>({name:e.getAttribute('data-game-window'),text:e.innerText.slice(0,250)})),"+
      "hasFixture:!!window.__qaInventory,pathname:location.pathname,alerts:[...document.querySelectorAll('[role=alert]')].map(e=>e.textContent),"+
      "bodyEnd:document.body.innerText.slice(-500)}))()");
    console.error('Inventory browser diagnostics:',JSON.stringify(info),JSON.stringify(exceptions.slice(-5)));
    throw error;
  }
  assert.equal(await evalJS("!!document.querySelector('[data-game-window=\"storage:home_chest\"]')"),false);
  assert.equal(await evalJS("window.__qaContextOpens||0"),0);
  assert.equal(await evalJS("window.__qaInventoryPosts?.length||0"),0);
  await shot('independent-inventory-desktop');
  await evalJS("document.querySelector('[data-game-window=\"inventory\"] .inventory-companion-button').click()");
  await until(()=>evalJS("!!document.querySelector('[data-game-window=\"storage:home_chest\"] .storage-window')"),
    9000,'simultaneous Home Chest');
  assert.equal(await evalJS("window.__qaContextOpens"),1);
  await shot('inventory-home-chest-desktop');
  assert.equal(await evalJS("window.__qaInventoryPosts?.length||0"),0,
    'Window movements and opening do not submit inventory commands');
  const fronts=await evalJS("(()=>{const a=document.querySelector('[data-game-window=\"inventory\"]');"+
    "const b=document.querySelector('[data-game-window=\"storage:home_chest\"]');"+
    "return {a:Number(a.style.zIndex),b:Number(b.style.zIndex)};})()");
  assert.ok(fronts.b>fronts.a,'Last-opened storage window is in front');
  await evalJS("document.querySelector('[data-game-window=\"inventory\"] .window-grip').click()");
  await until(()=>evalJS(
    "Number(document.querySelector('[data-game-window=\"inventory\"]').style.zIndex)>"+
    "Number(document.querySelector('[data-game-window=\"storage:home_chest\"]').style.zIndex)"),
    4000,'Inventory brought forward on focus');
  // A real desktop pointer gesture moves the window instead of changing items.
  const before=await evalJS("(()=>{const a=document.querySelector('[data-game-window=\"inventory\"]').getBoundingClientRect();"+
    "const h=document.querySelector('[data-game-window=\"inventory\"] .game-window-title').getBoundingClientRect();"+
    "return {x:a.x,y:a.y,hx:Math.round(h.x+90),hy:Math.round(h.y+20)};})()");
  await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:before.hx,y:before.hy});
  await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x:before.hx,y:before.hy,button:'left',clickCount:1});
  await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:before.hx+20,y:before.hy+15,buttons:1});
  await delay(60);
  await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:before.hx+55,y:before.hy+36,buttons:1});
  await delay(60);
  await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x:before.hx+55,y:before.hy+36,button:'left',clickCount:1});
  try{
    await until(()=>evalJS("document.querySelector('[data-game-window=\"inventory\"]').getBoundingClientRect().x>"+(before.x+10)),
      4000,'desktop header drag reposition');
  }catch(error){
    const details=await evalJS("(()=>{const e=document.querySelector('[data-game-window=\"inventory\"]');"+
      "return {left:e.style.left,rect:e.getBoundingClientRect().x,active:document.activeElement?.className};})()");
    console.error('Drag diagnostics:',JSON.stringify({before,details,exceptions:exceptions.slice(-4)}));
    throw error;
  }
  // Cross-window drag: the destination drop triggers exactly one authoritative command.
  await evalJS("(()=>{const item=document.querySelector('[data-game-window=\"inventory\"] .pack-card .item-slot.occupied');"+
    "const target=document.querySelector('[data-game-window=\"storage:home_chest\"] .slot-target');"+
    "const data=new DataTransfer();"+
    "item.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:data}));"+
    "target.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:data}));"+
    "target.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}));})()");
  await until(()=>evalJS("window.__qaInventoryPosts?.length===1"),5500,'drag transfer command');
  assert.equal(await evalJS("window.__qaInventoryPosts[0].to"),'home_chest');
  await until(()=>evalJS("document.querySelectorAll('[data-game-window=\"storage:home_chest\"] .item-slot.occupied').length===2"),
    5000,'shared inventory refresh');
  await evalJS("(()=>{const buttons=[...document.querySelectorAll('[data-game-window=\"storage:home_chest\"] .item-slot.occupied')];"+
    "const item=buttons.find(b=>b.textContent.includes('Steel Rivets'));"+
    "item.dispatchEvent(new MouseEvent('click',{shiftKey:true,bubbles:true}));})()");
  await until(()=>evalJS("window.__qaInventoryPosts?.length===2"),5000,'Shift-click transfer');
  assert.equal(await evalJS("window.__qaInventoryPosts[1].to"),'pack');
  await evalJS("document.querySelector('[data-game-window=\"inventory\"] .close-window').click()");
  assert.equal(await evalJS("!!document.querySelector('[data-game-window=\"inventory\"]')"),false);
  assert.equal(await evalJS("!!document.querySelector('[data-game-window=\"storage:home_chest\"]')"),true);
  await evalJS("document.querySelector('[data-game-window=\"storage:home_chest\"] .inventory-companion-button').click()");
  await until(()=>evalJS("!!document.querySelector('[data-game-window=\"inventory\"]')"),
    4000,'restore Inventory while storage remains open');
  await evalJS("document.querySelector('[data-game-window=\"storage:home_chest\"] .close-window').click()");
  await until(()=>evalJS("!document.querySelector('[data-game-window=\"storage:home_chest\"]')"),
    4500,'independent storage close');
  assert.equal(await evalJS("!!document.querySelector('[data-game-window=\"inventory\"]')"),true,
    'Closing Home Chest leaves Inventory available');
  await until(()=>evalJS("window.__qaRoomToken===null"),4000,'storage context revocation');
  console.log('PASS: Independent desktop windows, drag positioning, focus, transfers, Shift-click and revocation.');

  await open('/characters/qa-scenes-millhand/home',390,844,'.home-artwork');
  await evalJS("document.querySelector('[data-open-home-chest]').click()");
  await until(()=>evalJS("!!document.querySelector('[data-game-window=\"storage:home_chest\"] .storage-window')"),
    9000,'mobile Home Chest');
  await evalJS("document.querySelector('[data-game-window=\"storage:home_chest\"] .inventory-companion-button').click()");
  await until(()=>evalJS("!!document.querySelector('[data-game-window=\"inventory\"] .inventory-window')"),
    9000,'mobile Inventory');
  assert.equal(await evalJS("getComputedStyle(document.querySelector('[data-game-window=\"storage:home_chest\"]')).display"),
    'none','Mobile has one visible panel while both remain open');
  await shot('inventory-mobile-switcher');
  await evalJS("([...document.querySelectorAll('.game-window-tabs button')].find(b=>b.textContent.includes('Home Chest'))).click()");
  assert.notEqual(await evalJS("getComputedStyle(document.querySelector('[data-game-window=\"storage:home_chest\"]')).display"),
    'none');
  await shot('home-chest-mobile');
  assert.equal(await evalJS("window.__qaInventoryPosts?.length||0"),0);
  console.log('PASS: Mobile Inventory and Home Chest switch without overlapping miniature windows.');

  assert.deepEqual(exceptions,[],'No uncaught page exceptions');
  if(!inventoryOnly)console.log('PASS: Millhand scenes — '+checks+' scene/size layouts and in-scene interactions verified in real pages');
}finally{
  clearTimeout(timeout);
  close();
}
