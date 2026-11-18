import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {join,resolve} from 'node:path';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {
  INITIAL_STITCHER,applyStitcherAction,stitcherActions
} from '../apps/api/src/stitcher-work.ts';
import {
  APPROVED_CLAUDIA_OPTIONAL_DIALOGUE,CLAUDIA_WORK_SKIP_LINE
} from '../apps/web/src/lib/approved-claudia-optional.ts';

const root=resolve(import.meta.dirname,'..');
const stage1=structuredClone(INITIAL_STITCHER);
const stage2=['continue_intro','check_ward','begin_round']
  .reduce((state,action)=>applyStitcherAction(state,action),stage1);
const stage2Mid=['inspect_a','inspect_b','order_bleeding','prep_cut']
  .reduce((state,action)=>applyStitcherAction(state,action),stage2);
const stage2Report=['dress_a','check_linen','trim_end','dress_b','inspect_finished','record_linen']
  .reduce((state,action)=>applyStitcherAction(state,action),stage2Mid);
const stage3={...stage2,stage:3,phase:'discovery'};
const fixture=state=>({stage:state.stage,tutorialStatus:'IN_PROGRESS',
  state,started:true,availableActions:stitcherActions(state)});
const fixtures={
  one:fixture(stage1),two:fixture(stage2),
  twoMid:fixture(stage2Mid),twoReport:fixture(stage2Report),
  three:fixture(stage3)
};
const stub=[
  '(()=>{',
  'const fixtures='+JSON.stringify(fixtures)+';',
  'const original=window.fetch.bind(window);',
  "const key=new URLSearchParams(location.search).get('qa')||'one';",
  "const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});",
  'window.__claudiaExpectedSnapshot=structuredClone(fixtures[key]);',
  'window.__claudiaPosts=[];',
  'window.__claudiaLeaving=false;',
  'window.fetch=(input,options)=>{',
  " const route=new URL(typeof input==='string'?input:input.url,location.href).pathname;",
  " if(!route.startsWith('/api/characters/qa-claudia'))return original(input,options);",
  " const method=(options?.method||'GET').toUpperCase();",
  " if(method!=='GET'){window.__claudiaPosts.push(JSON.parse(options?.body||'{}'));return Promise.resolve(json({error:'no_optional_writes'},503));}",
  " if(route==='/api/characters/qa-claudia')return Promise.resolve(json({character:{",
  "  id:'qa-claudia',name:'QA Stitcher',origin:'Stitcher',sex:'Female',coins:20,",
  "  startingLocation:'Cinder Row Infirmary',health:{current:50,maximum:50},",
  "  tutorial:{stage:fixtures[key].stage,status:'IN_PROGRESS'}}}));",
  " if(route.endsWith('/stitcher/ward'))return Promise.resolve(json(fixtures[key]));",
  " if(route.endsWith('/dev/rewind-stage'))return Promise.resolve(json({enabled:false,canRewind:false,stage:fixtures[key].stage,targetStage:null}));",
  " return Promise.resolve(json({error:'not_needed'},404));",
  '};',
  '})();'
].join('\n');
const windows=process.platform==='win32';
const chromeNames=[process.env.CHROME_PATH,...(windows?[
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
]:['google-chrome','chromium','chromium-browser'])].filter(Boolean);
const chrome=chromeNames.find(x=>/[\\/]/.test(x)?existsSync(x):
  spawnSync('which',[x],{stdio:'ignore'}).status===0);
if(!chrome)throw Error('Chromium is required (set CHROME_PATH).');
const userData=mkdtempSync(join(tmpdir(),'pall-stitcher-claudia-'));
const port=5189,cdpPort=9263;
const server=windows
  ?spawn('npm run dev -w @the-pall/web -- --port '+port+' --strictPort',{
    cwd:root,stdio:['ignore','pipe','pipe'],shell:true
  })
  :spawn('npm',['run','dev','-w','@the-pall/web','--','--port',String(port),'--strictPort'],{
    cwd:root,stdio:['ignore','pipe','pipe'],detached:true
  });
let output='',browser,ws;
for(const pipe of [server.stdout,server.stderr])pipe.on('data',x=>{
  output+=String(x);if(output.length>16000)output=output.slice(-16000);
});
const kill=child=>{
  if(!child?.pid)return;
  if(windows)spawnSync('taskkill',['/pid',String(child.pid),'/T','/F'],{stdio:'ignore'});
  else child.kill('SIGKILL');
};
const close=()=>{
  try{ws?.close();}catch{}
  try{kill(browser);}catch{}
  try{
    if(windows)kill(server);else if(server.pid)process.kill(-server.pid,'SIGTERM');
  }catch{try{server.kill('SIGTERM');}catch{}}
  rmSync(userData,{recursive:true,force:true});
};
const timer=setTimeout(()=>{
  console.error('Claudia browser test timed out: '+output.slice(-2400));
  close();process.exit(124);
},180000);
timer.unref();
async function until(fn,ms=15000,name='condition'){
  const cutoff=Date.now()+ms;let last;
  while(Date.now()<cutoff){
    try{const result=await fn();if(result)return result;}catch(e){last=e;}
    await delay(120);
  }
  throw Error('Timeout waiting for '+name+(last?' '+last.message:'')+
    ' / server: '+output.slice(-2400));
}
try{
  const origin='http://127.0.0.1:'+port;
  await until(async()=> (await fetch(origin+'/__shell-qa')).ok,
    60000,'dev server');
  browser=spawn(chrome,[
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--no-first-run','--remote-allow-origins=*',
    '--remote-debugging-port='+cdpPort,'--user-data-dir='+userData,'about:blank'
  ],{stdio:'ignore'});
  const tab=await until(async()=>{
    const tabs=await (await fetch('http://127.0.0.1:'+cdpPort+'/json')).json();
    return tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
  },18000,'Chromium tab');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((ok,bad)=>{
    ws.addEventListener('open',ok,{once:true});
    ws.addEventListener('error',bad,{once:true});
  });
  let id=0;
  const pending=new Map(),exceptions=[];
  ws.addEventListener('message',e=>{
    let result;try{result=JSON.parse(e.data);}catch{return;}
    if(result.method==='Runtime.exceptionThrown')
      exceptions.push(result.params?.exceptionDetails?.exception?.description||'exception');
    const call=result.id&&pending.get(result.id);
    if(!call)return;
    pending.delete(result.id);
    if(result.error)call.reject(Error(JSON.stringify(result.error)));
    else call.resolve(result.result??{});
  });
  const cmd=(method,params={})=>new Promise((ok,bad)=>{
    const callId=++id;
    const t=setTimeout(()=>{pending.delete(callId);bad(Error('CDP deadline '+method));},15000);
    pending.set(callId,{
      resolve(x){clearTimeout(t);ok(x);},
      reject(e){clearTimeout(t);bad(e);}
    });
    ws.send(JSON.stringify({id:callId,method,params}));
  });
  const evalJS=async exp=>{
    const result=await cmd('Runtime.evaluate',{
      expression:exp,returnByValue:true,awaitPromise:true
    });
    if(result.exceptionDetails)
      throw Error('Browser exception '+JSON.stringify(result.exceptionDetails));
    return result.result?.value;
  };
  await cmd('Page.enable');await cmd('Runtime.enable');
  await cmd('Page.addScriptToEvaluateOnNewDocument',{source:stub});
  async function open(key){
    await cmd('Emulation.setDeviceMetricsOverride',{
      width:1280,height:800,deviceScaleFactor:1,mobile:false
    });
    await evalJS('window.__claudiaLeaving=true').catch(()=>{});
    await cmd('Page.navigate',{url:origin+'/characters/qa-claudia/stitcher/ward?qa='+key});
    await until(()=>evalJS("!window.__claudiaLeaving&&location.search==='?qa="+key+"'&&"+
      "!!document.querySelector('.stitcher-ward .work-card')"),
      24000,'Stitcher '+key+' ward UI');
    assert.equal(await evalJS("!!document.querySelector('vite-error-overlay')"),false);
  }
  const displayedText=()=>evalJS(
    "document.querySelector('.stitcher-ward .work-card')?.innerText");
  const conversationSpeech=()=>evalJS(
    "document.querySelector('.stitcher-ward .conversation .speech')?.textContent?.trim()");
  const choose=async label=>{
    const script="(()=>{const label="+JSON.stringify(label)+";"+
      "const buttons=[...document.querySelectorAll('.stitcher-ward .conversation .choices button')];"+
      "const button=buttons.find(b=>b.textContent?.trim()===label);"+
      "if(!button)return false;button.click();return true;})()";
    assert.equal(await until(()=>evalJS(script),4000,'Clicked choice '+label),true);
  };
  const enter=async()=>{
    assert.equal(await evalJS("!!document.querySelector('.claudia-hotspot')"),true);
    assert.equal(await evalJS(
      "document.querySelector('.claudia-hotspot')?.getAttribute('aria-label')"),
      'Talk to Claudia Cyka');
    await evalJS("document.querySelector('.claudia-hotspot').click()");
    await until(()=>evalJS("!!document.querySelector('.conversation .choices')"),
      3500,'Claudia topic menu');
  };
  const enterTopic=async(topic,step)=>{
    await enter();
    await choose(topic.prompt);
    for(let i=0;i<step;i++)await choose(topic.exchanges[i].followUp);
    await until(async()=>{
      const speech=await conversationSpeech();
      return speech==='“'+topic.exchanges[step].reply+'”';
    },4000,'Exact Claudia speech '+topic.id+' '+step);
  };
  for(const key of ['one','two']){
    await open(key);
    const starting=await displayedText();
    const persisted=await evalJS("JSON.stringify(window.__claudiaExpectedSnapshot)");
    const initialActor=await evalJS("!!document.querySelector('.stitcher-ward img.claudia')");
    assert.equal(initialActor,key==='one',
      'Claudia absent during independent Stage II bed inspection');
    let exits=0;
    for(const topic of APPROVED_CLAUDIA_OPTIONAL_DIALOGUE){
      for(const step of topic.exchanges.keys()){
        await enterTopic(topic,step);
        assert.equal(await evalJS("!!document.querySelector('.stitcher-ward img.claudia')"),true,
          'Claudia enters when spoken to');
        const speech=await conversationSpeech();
        assert.equal(speech,'“'+topic.exchanges[step].reply+'”');
        assert.ok(!speech.includes(topic.prompt),'No repeated player question');
        const labels=await evalJS(
          "[...document.querySelectorAll('.conversation .choices button')].map(b=>b.textContent.trim())");
        assert.ok(labels.includes('Ask something else'));
        assert.ok(labels.includes(CLAUDIA_WORK_SKIP_LINE));
        if(step<topic.exchanges.length-1)
          assert.ok(labels.includes(topic.exchanges[step].followUp));
        else assert.equal(labels.length,2,'End of topic has exactly two exits');
        await choose(CLAUDIA_WORK_SKIP_LINE);
        await until(()=>evalJS("!document.querySelector('.conversation')"),
          3000,'Return to ward');
        assert.equal(await displayedText(),starting,'Original work panel must be restored verbatim');
        assert.equal(await evalJS("JSON.stringify(window.__claudiaExpectedSnapshot)"),persisted);
        assert.deepEqual(await evalJS('window.__claudiaPosts'),[]);
        assert.equal(await evalJS("!!document.querySelector('.stitcher-ward img.claudia')"),
          initialActor,'Claudia must leave again when solo work resumes');
        exits++;
      }
      await enterTopic(topic,topic.exchanges.length-1);
      await choose('Ask something else');
      await until(()=>evalJS(
        "[...document.querySelectorAll('.conversation .choices button')].some(b=>b.textContent?.trim()==="+
        JSON.stringify(APPROVED_CLAUDIA_OPTIONAL_DIALOGUE[0].prompt)+")"),
        4000,'Claudia five-topic menu after Ask something else');
      const menu=await evalJS(
        "[...document.querySelectorAll('.conversation .choices button')].map(b=>b.textContent.trim())");
      for(const t of APPROVED_CLAUDIA_OPTIONAL_DIALOGUE)
        assert.ok(menu.includes(t.prompt),'Five topics remain after returning to menu');
      await choose(APPROVED_CLAUDIA_OPTIONAL_DIALOGUE[0].prompt);
      await until(async()=> (await conversationSpeech())===
        '“'+APPROVED_CLAUDIA_OPTIONAL_DIALOGUE[0].exchanges[0].reply+'”',
        4000,'Topic switch resets to first answer');
      await choose(CLAUDIA_WORK_SKIP_LINE);
      await until(()=>evalJS("!document.querySelector('.conversation')"),
        3000,'Return after topic change');
      assert.equal(await displayedText(),starting);
      assert.deepEqual(await evalJS('window.__claudiaPosts'),[]);
    }
    assert.equal(exits,14);
    console.log('PASS Stage '+(key==='one'?'I':'II')+
      ': 5 topics, 14 answers and early exit after every answer; zero server writes');
  }
  // More than the initial saved Stage II state: opening optional speech while
  // a dressing is underway, or while Claudia is delivering a required report,
  // must restore the exact current phase and available work actions.
  for(const key of ['twoMid','twoReport']){
    await open(key);
    const previous=await displayedText();
    const previousSprite=await evalJS("!!document.querySelector('.stitcher-ward img.claudia')");
    const snapshot=await evalJS('JSON.stringify(window.__claudiaExpectedSnapshot)');
    await enterTopic(APPROVED_CLAUDIA_OPTIONAL_DIALOGUE[3],1);
    await choose(CLAUDIA_WORK_SKIP_LINE);
    await until(()=>evalJS("!document.querySelector('.conversation')"),
      3000,'Return to interrupted Stage II work');
    assert.equal(await displayedText(),previous,'An interrupted ward phase must reappear unchanged');
    assert.equal(await evalJS('JSON.stringify(window.__claudiaExpectedSnapshot)'),snapshot);
    assert.deepEqual(await evalJS('window.__claudiaPosts'),[]);
    assert.equal(await evalJS("!!document.querySelector('.stitcher-ward img.claudia')"),
      previousSprite,'Claudia resumes precisely the previous staged presence');
    console.log('PASS Stage II '+key+' interrupted work unchanged by optional conversation');
  }
  await open('three');
  assert.equal(await evalJS("!!document.querySelector('.claudia-hotspot')"),false,
    'Optional topics must not be available in Stage III');
  assert.deepEqual(await evalJS('window.__claudiaPosts'),[]);
  assert.deepEqual(exceptions,[],'No browser runtime exceptions');
  console.log('PASS Stage III lockout, zero spoilers or saved progress changes');
}finally{
  clearTimeout(timer);
  close();
}
