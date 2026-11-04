import {strict as assert} from 'node:assert';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {resolve,join} from 'node:path';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';

// Real headless Chromium clicks the *production* combat scene component
// mounted in a development-only fixture. This detects inherited
// pointer-events:none, overlays, invalid hit regions and broken navigation.
const root=resolve(import.meta.dirname,'..');
const chrome=['google-chrome','chromium','chromium-browser'].find(bin=>
  spawnSync('which',[bin],{stdio:'ignore'}).status===0);
if(!chrome)throw Error('Chromium is required for combat CTA browser validation.');
const profile=mkdtempSync(join(tmpdir(),'pall-combat-cta-'));
const web=spawn('npm',['run','dev:web'],{
  cwd:root,stdio:['ignore','pipe','pipe']
});
let output='';
for(const stream of [web.stdout,web.stderr])stream.on('data',chunk=>{
  output+=String(chunk);
  if(output.length>12000)output=output.slice(-12000);
});
let chromeProcess,ws;
const close=()=>{
  try{ws?.close();}catch{}
  try{chromeProcess?.kill('SIGKILL');}catch{}
  try{web.kill('SIGTERM');}catch{}
  try{rmSync(profile,{recursive:true,force:true});}catch{}
};
const watchdog=setTimeout(()=>{
  console.error('Browser CTA test timed out; Vite output: '+output.slice(-2200));
  close();process.exit(124);
},95000);
watchdog.unref();
async function until(fn,timeout=25000,label='condition'){
  const deadline=Date.now()+timeout;
  let lastError;
  while(Date.now()<deadline){
    try{
      const value=await fn();
      if(value)return value;
    }catch(e){lastError=e;}
    await delay(180);
  }
  throw Error('Timed out waiting for '+label+
    (lastError?': '+lastError.message:'')+'; Vite: '+output.slice(-1500));
}
try{
  const site='http://127.0.0.1:5173/__combat-cta-qa';
  await until(async()=>{
    const response=await fetch(site);
    return response.ok;
  },45000,'Vite combat scene fixture');
  // Regression for Stage 7: verify that Vite serves the owner-supplied
  // background as an actual WebP, not a missing static asset.
  const clinicArt=await fetch('http://127.0.0.1:5173/locations/clinic/clinic-workshop-cold.webp');
  assert.equal(clinicArt.status,200,'The Stage 7 backdrop must be publicly served by Vite');
  assert.ok(clinicArt.headers.get('content-type')?.includes('image/webp'),
    'The clinic background must have a WebP content type');
  const bytes=new Uint8Array(await clinicArt.arrayBuffer());
  assert.ok(bytes.byteLength>40000,'The clinic image body is empty or truncated');
  assert.equal(Buffer.from(bytes.subarray(0,4)).toString('ascii'),'RIFF');
  assert.equal(Buffer.from(bytes.subarray(8,12)).toString('ascii'),'WEBP');
  console.log('PASS: the supplied clinic background is served as a real WebP by Vite');
  chromeProcess=spawn(chrome,[
    '--headless=new','--no-sandbox','--disable-gpu',
    '--disable-dev-shm-usage','--no-first-run',
    '--remote-allow-origins=*','--remote-debugging-port=9239',
    '--user-data-dir='+profile,'about:blank'
  ],{stdio:'ignore'});
  const tab=await until(async()=>{
    const response=await fetch('http://127.0.0.1:9239/json');
    const pages=await response.json();
    return pages.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
  },20000,'Chromium DevTools tab');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await Promise.race([
    new Promise((ok,bad)=>{
      ws.addEventListener('open',ok,{once:true});
      ws.addEventListener('error',bad,{once:true});
    }),
    delay(10000).then(()=>{throw Error('Chromium WebSocket connection timed out');})
  ]);
  let nextId=1;
  const pending=new Map();
  ws.addEventListener('close',()=>{
    for(const call of pending.values())call.reject(Error('CDP closed'));
    pending.clear();
  });
  ws.addEventListener('message',event=>{
    let msg;
    try{msg=JSON.parse(event.data);}catch{return;}
    if(!msg.id)return;
    const call=pending.get(msg.id);
    if(!call)return;
    pending.delete(msg.id);
    if(msg.error)call.reject(Error(JSON.stringify(msg.error)));
    else call.resolve(msg.result??{});
  });
  function command(method,params={}){
    const id=nextId++;
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{
        pending.delete(id);reject(Error('CDP command timeout: '+method));
      },12000);
      pending.set(id,{
        resolve(result){clearTimeout(timer);resolve(result);},
        reject(error){clearTimeout(timer);reject(error);}
      });
      ws.send(JSON.stringify({id,method,params}));
    });
  }
  async function evaluate(expression){
    const reply=await command('Runtime.evaluate',{
      expression,returnByValue:true,awaitPromise:true
    });
    if(reply.exceptionDetails)throw Error('Browser JS error '+JSON.stringify(reply.exceptionDetails));
    return reply.result?.value;
  }
  async function position(){
    return evaluate(`(()=>{
      const link=document.querySelector('a.clinic-link');
      if(!link)return null;
      link.scrollIntoView({block:'center',inline:'center',behavior:'instant'});
      const r=link.getBoundingClientRect();
      const x=r.left+r.width/2,y=r.top+r.height/2;
      const target=document.elementFromPoint(x,y);
      const parchment=link.closest('.parchment');
      return {
        x,y,width:r.width,height:r.height,
        url:link.getAttribute('href'),
        topElement:target?.tagName??null,
        hit:target===link||link.contains(target),
        linkPointer:getComputedStyle(link).pointerEvents,
        parchmentPointer:getComputedStyle(parchment).pointerEvents,
        sceneryPointer:getComputedStyle(link.closest('.stage-scenery')).pointerEvents,
        borderImage:getComputedStyle(link).borderImageSource
      };
    })()`);
  }
  async function navigate(outcome){
    await command('Page.navigate',{url:site+'?outcome='+outcome});
    await until(async()=>{
      const info=await position();
      return info?.url?.endsWith('/millhand/clinic')?info:false;
    },25000,outcome+' outcome link');
  }
  await command('Page.enable');
  await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride',{
    width:1440,height:900,deviceScaleFactor:1,mobile:false
  });
  for(const outcome of ['defeat','victory']){
    await navigate(outcome);
    const info=await position();
    assert.ok(info.width>180&&info.height>=40,
      outcome+' framed CTA has insufficient click area: '+JSON.stringify(info));
    assert.equal(info.sceneryPointer,'none');
    assert.equal(info.parchmentPointer,'auto',
      outcome+' parchment must opt back into pointer interactions');
    assert.equal(info.linkPointer,'auto');
    assert.ok(info.hit,
      outcome+' CTA is covered or not pointer-clickable: '+JSON.stringify(info));
    assert.ok(info.borderImage.includes('button-normal-trim.png'),
      outcome+' CTA must use the approved button frame: '+info.borderImage);
    await command('Input.dispatchMouseEvent',{
      type:'mouseMoved',x:info.x,y:info.y
    });
    await until(async()=>{
      const hover=await evaluate(
        "getComputedStyle(document.querySelector('a.clinic-link')).borderImageSource"
      );
      return hover?.includes('button-hover-trim.png');
    },3000,outcome+' hover frame');

    if(outcome==='defeat'){
      await command('Input.dispatchMouseEvent',{
        type:'mousePressed',x:info.x,y:info.y,button:'left',clickCount:1,buttons:1
      });
      await command('Input.dispatchMouseEvent',{
        type:'mouseReleased',x:info.x,y:info.y,button:'left',clickCount:1,buttons:0
      });
    }else{
      // The same native link must remain keyboard navigable.
      await evaluate("document.querySelector('a.clinic-link').focus()");
      await command('Input.dispatchKeyEvent',{
        type:'keyDown',key:'Enter',code:'Enter',
        windowsVirtualKeyCode:13,nativeVirtualKeyCode:13
      });
      await command('Input.dispatchKeyEvent',{
        type:'keyUp',key:'Enter',code:'Enter',
        windowsVirtualKeyCode:13,nativeVirtualKeyCode:13
      });
    }
    const destination='/characters/11111111-1111-4111-8111-111111111111/millhand/clinic';
    await until(async()=>{
      const path=await evaluate('location.pathname');
      return path===destination;
    },12000,outcome+' clinic navigation');
    console.log('PASS: '+outcome+' CTA framed, hit-testable and navigates via '+
      (outcome==='defeat'?'mouse':'keyboard'));
  }
}finally{
  clearTimeout(watchdog);
  close();
}
// npm run dev:web may leave Vite subprocess handles attached even after its
// parent exits. The preceding browser assertions finished successfully.
process.exit(0);
