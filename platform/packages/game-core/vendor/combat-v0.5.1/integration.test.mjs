import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from './server.mjs';

async function listen(app){await new Promise(ok=>app.listen(0,'127.0.0.1',ok));return `http://127.0.0.1:${app.address().port}`}
async function close(app){await new Promise((ok,no)=>app.close(e=>e?no(e):ok()))}
async function send(url,{method='GET',body,token,origin}={}){
  const headers={};if(body!==undefined)headers['content-type']='application/json';if(token)headers['x-session-token']=token;if(origin)headers.origin=origin;
  const res=await fetch(url,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  return {status:res.status,data:await (res.headers.get('content-type')?.includes('json')?res.json():res.text())};
}
const action=(revision,type='guard',id='req1',extra={})=>({requestId:id,expectedRevision:revision,action:{type,...extra}});

test('HTTP server serves functional browser assets with local-only prototype health marker',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'pall-int-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  const app=createApp({dataDir:dir});const base=await listen(app);t.after(()=>close(app));
  const page=await send(base+'/');assert.equal(page.status,200);assert.match(page.data,/Three fights. Three kinds of trouble./);
  const script=await send(base+'/app.js');assert.equal(script.status,200);assert.match(script.data,/sendAction/);
  const css=await send(base+'/styles.css');assert.equal(css.status,200);assert.match(css.data,/combatant/);
  const compact=await send(base+'/compact.css');assert.equal(compact.status,200);assert.match(compact.data,/compact first/);
  assert.match(page.data,/compact\.css/);
  assert.doesNotMatch(page.data,/READ THE OPPONENT|One action\. Make it count|The record follows each impact|What happened|Turn resolved and saved/);
  const h=await send(base+'/api/health');assert.equal(h.status,200);assert.equal(h.data.productionReady,false);
});

test('server creates sessions, rejects missing and forged tokens, and persists round state',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'pall-auth-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  let app=createApp({dataDir:dir,seedGenerator:()=>1}),base=await listen(app);
  t.after(async()=>{if(app.listening)await close(app)});
  const c=await send(base+'/api/encounters',{method:'POST',body:{scene:'flint'}});
  assert.equal(c.status,201);assert.equal(c.data.encounter.player.stamina,90);
  const id=c.data.encounter.id,token=c.data.token;
  assert.equal((await send(base+'/api/encounters/'+id)).status,401);
  assert.equal((await send(base+'/api/encounters/'+id,{token:'a'.repeat(64)})).status,401);
  const state=await send(base+'/api/encounters/'+id,{token});assert.equal(state.data.revision,0);assert.equal(state.data.enemy.hp,50);assert.ok(state.data.enemyIntent.length>10);assert.notEqual(state.data.intentType,'attack');
  const a=await send(base+`/api/encounters/${id}/actions`,{method:'POST',token,body:action(0)});
  assert.equal(a.status,200);assert.equal(a.data.revision,1);
  assert.equal(a.data.player.stamina,75);
  assert.ok(a.data.events.length>0);
  await close(app);
  app=createApp({dataDir:dir,seedGenerator:()=>999});base=await listen(app);
  const persisted=await send(base+'/api/encounters/'+id,{token});
  assert.equal(persisted.data.revision,1);assert.equal(persisted.data.player.stamina,75);
  assert.equal(persisted.data.events.length,a.data.events.length);
});

test('duplicate action never runs twice; stale, conflicting and invalid requests preserve revision',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'pall-idem-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  const app=createApp({dataDir:dir,seedGenerator:()=>1});const base=await listen(app);t.after(()=>close(app));
  const c=await send(base+'/api/encounters',{method:'POST',body:{scene:'silas'}});
  const id=c.data.encounter.id,token=c.data.token,path=`${base}/api/encounters/${id}/actions`;
  const same=action(0,'guard','same');
  const [first,second]=await Promise.all([send(path,{method:'POST',token,body:same}),send(path,{method:'POST',token,body:same})]);
  assert.equal(first.status,200);assert.equal(second.status,200);assert.deepEqual(first.data,second.data);
  assert.equal((await send(path,{method:'POST',token,body:action(0,'attack','same',{zone:'head'})})).status,409);
  assert.equal((await send(path,{method:'POST',token,body:action(0,'attack','other',{zone:'torso'})})).status,409);
  const invalid=await send(path,{method:'POST',token,body:action(1,'use','invalid',{item:'bandage'})});
  assert.equal(invalid.status,422);
  const cheat=await send(path,{method:'POST',token,body:action(1,'attack','forged-speed',{zone:'torso',speed:100000})});
  assert.equal(cheat.status,422);
  const cheat2=await send(path,{method:'POST',token,body:action(1,'guard','forged-momentum',{momentum:100})});
  assert.equal(cheat2.status,422);
  const final=await send(base+`/api/encounters/${id}`,{token});assert.equal(final.data.revision,1);
});

test('boar requires actual escape geometry and preserves 30/65 through withdrawal',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'pall-boar-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  const app=createApp({dataDir:dir,seedGenerator:()=>1});const base=await listen(app);t.after(()=>close(app));
  const c=await send(base+'/api/encounters',{method:'POST',body:{scene:'boar'}});
  const id=c.data.encounter.id,token=c.data.token,path=`${base}/api/encounters/${id}/actions`;
  assert.equal(c.data.encounter.enemy.hp,30);assert.equal(c.data.encounter.enemy.hpMax,65);
  const a=await send(path,{method:'POST',token,body:action(0,'move','side',{to:'side'})});
  assert.equal(a.status,200);assert.equal(a.data.player.momentum,5);assert.equal(a.data.player.hp,50);
  assert.equal(a.data.pathOpen,false);assert.notEqual(a.data.intentType,'withdraw');
  let b=await send(path,{method:'POST',token,body:action(1,'move','back',{to:'back'})});
  assert.equal(b.status,200);assert.equal(b.data.pathOpen,true);
  for(let n=0;n<9 && b.data.status==='active';n++)b=await send(path,{method:'POST',token,body:action(b.data.revision,'guard',`wait${n}`)});
  assert.equal(b.data.outcome,'player_victory');assert.equal(b.data.enemy.hp,30);assert.equal(b.data.enemy.hpMax,65);
  assert.equal((await send(path,{method:'POST',token,body:action(b.data.revision,'guard','again')})).status,422);
});

test('origin-based protection: accepted origin, no stray unknown fixture or cross-origin request',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'pall-origin-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  const app=createApp({dataDir:dir});const base=await listen(app);t.after(()=>close(app));
  assert.equal((await send(base+'/api/encounters',{method:'POST',body:{scene:'dragon'}})).status,422);
  assert.equal((await send(base+'/api/encounters',{method:'POST',body:{scene:'flint'},origin:'http://evil.example'})).status,403);
});

test('server retains selectable, validated Squatter staging choice',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'pall-stage-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const app=createApp({dataDir:dir,seedGenerator:()=>7});const base=await listen(app);t.after(()=>close(app));
 const a=await send(base+'/api/encounters',{method:'POST',body:{scene:'boar',approach:'fence'}});
 assert.equal(a.status,201);assert.equal(a.data.encounter.approach,'fence');assert.equal(a.data.encounter.distance,'near');
 assert.equal(a.data.encounter.enemy.hp,30);assert.equal(a.data.encounter.enemy.hpMax,65);
 const b=await send(base+'/api/encounters',{method:'POST',body:{scene:'boar',approach:'unknown'}});
 assert.equal(b.status,422);
});


test('finished encounter returns structured battle breakdown and idempotent snapshot', async t=>{
  const dir=await mkdtemp(join(tmpdir(),'pall-summary-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  const app=createApp({dataDir:dir,seedGenerator:()=>1});const base=await listen(app);t.after(()=>close(app));
  const c=await send(base+'/api/encounters',{method:'POST',body:{scene:'boar'}});
  const id=c.data.encounter.id,token=c.data.token,path=`${base}/api/encounters/${id}/actions`;
  let state=c.data.encounter;
  assert.equal(state.breakdown,null);
  for(const to of ['side','back']){
    const r=await send(path,{method:'POST',token,body:action(state.revision,'move',`moving-${to}`,{to})});assert.equal(r.status,200);state=r.data;
  }
  for(let n=0;n<9&&state.status==='active';n++){
    const r=await send(path,{method:'POST',token,body:action(state.revision,'guard',`wait-${n}`)});assert.equal(r.status,200);state=r.data;
  }
  assert.equal(state.status,'finished');
  assert.ok(state.breakdown.rounds>=2);
  assert.ok(state.breakdown.player.dealt>=0);
  assert.ok(Number.isInteger(state.breakdown.player.blocked));
  assert.ok(Number.isInteger(state.breakdown.enemy.momentumSpent));
  const reloaded=await send(base+`/api/encounters/${id}`,{token});assert.deepEqual(reloaded.data.breakdown,state.breakdown);
});
