/**
 * Real PostgreSQL + real Fastify handler tests for the Stage 6 production
 * adapter. Better Auth identity is substituted IN PROCESS so this harness
 * does not need an interactive email-confirmed login. Ownership checks,
 * HTTP validation, locks, receipts and all SQL are the shipping code.
 *
 * Requires a dedicated, disposable database named pall_stage6_test.
 * NEVER point this test at a development or production character database.
 */
import assert from 'node:assert/strict';
import {before,after,test} from 'node:test';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import Fastify from 'fastify';
import pg from 'pg';
import {registerMillhandCombatRoutes} from '../apps/api/src/millhand-combat-routes.ts';
import {registerCharacterRoutes} from '../apps/api/src/character-routes.ts';
import {registerMillhandClinicRoutes} from '../apps/api/src/millhand-clinic-routes.ts';
import {registerMillhandStageRewindRoutes} from '../apps/api/src/millhand-stage-rewind-routes.ts';

const connectionString=process.env.STAGE6_TEST_DATABASE_URL;
if(!connectionString||new URL(connectionString).pathname!=='/pall_stage6_test')
  throw new Error('Use only STAGE6_TEST_DATABASE_URL targeting /pall_stage6_test');
const db=new pg.Pool({connectionString,max:12});
const owner='stage6-test-owner';
const stranger='stage6-test-stranger';
const base='/api/characters/';
const root=resolve(import.meta.dirname,'..');
const schema=[
  '0002_characters.sql','0003_millhand_platework.sql',
  '0004_millhand_missing_stamp.sql','0005_millhand_second_job.sql',
  '0006_character_portraits.sql','0006_millhand_wage_claim.sql',
  '0007_millhand_flint_combat.sql','0008_millhand_clinic.sql',
  '0009_character_welcome.sql'
];
const resolveSession=async(headers:import('node:http').IncomingHttpHeaders)=>{
  // This resolver is injected only via register*Routes options in this
  // in-process test; production uses Better Auth, not x-test-principal.
  const principal=headers['x-test-principal'];
  if(principal!==owner&&principal!==stranger)return null;
  return {user:{id:principal,emailVerified:true}};
};
const app=Fastify({logger:false});
registerCharacterRoutes(app,{pool:db,resolveSession});
registerMillhandCombatRoutes(app,{pool:db,resolveSession,seed:()=>5});
registerMillhandClinicRoutes(app,{pool:db,resolveSession});
registerMillhandStageRewindRoutes(app,{pool:db,resolveSession});

async function request(
  method:'GET'|'POST'|'DELETE',path:string,
  account:string|null=owner,body?:unknown
){
  const response=await app.inject({
    method,url:path,
    headers:{
      ...(account?{'x-test-principal':account}:{}),
      ...(body?{'content-type':'application/json',origin:'http://127.0.0.1:5173'}:{})
    },
    ...(body?{payload:JSON.stringify(body)}:{})
  });
  let value:Record<string,any>|null=null;
  try{value=JSON.parse(response.body);}catch{/* HTTP errors should be JSON */}
  return {status:response.statusCode,body:value};
}
async function character(
  account=owner,stance:'brace'|'moving'|'cart'='brace',health=50
){
  const id=randomUUID();
  const name='QA '+id.slice(0,8);
  await db.query(
    "INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location,tutorial_stage,tutorial_status,current_health) VALUES($1,$2,$3,$4,'Male','Millhand',$5::jsonb,'[]'::jsonb,'Smithing workshop',6,'NOT_STARTED',$6)",
    [id,account,name,'qa-'+id,JSON.stringify({Craftsmanship:3,Industry:1}),health]
  );
  await db.query(
    'INSERT INTO player_character_wage_claim(character_id,revision,state) VALUES($1,1,$2::jsonb)',
    [id,JSON.stringify({phase:'DONE',stance})]
  );
  return {id,name,path:base+id+'/millhand/combat'};
}
async function start(c:Awaited<ReturnType<typeof character>>,requestId=randomUUID()){
  const response=await request('POST',c.path,owner,{kind:'start',requestId});
  assert.equal(response.status,200,JSON.stringify(response.body));
  return response.body!;
}
async function turn(
  c:Awaited<ReturnType<typeof character>>,prior:Record<string,any>,
  action:unknown,requestId=randomUUID(),account=owner
){
  return request('POST',c.path,account,{
    kind:'turn',requestId,expectedRevision:prior.revision,action
  });
}
async function outcomeWith(
  action:(state:Record<string,any>)=>Record<string,unknown>
){
  const c=await character();
  let state=await start(c);
  for(let i=0;state.status==='active'&&i<80;i++){
    const result=await turn(c,state,action(state));
    assert.equal(result.status,200,JSON.stringify(result.body));
    state=result.body!;
  }
  assert.equal(state.status,'finished','Fight must finish in <=80 turns');
  const stored=await db.query<{
    revision:number;state:Record<string,any>;outcome:string;history:any[]
  }>(
    'SELECT revision,state,outcome,history FROM player_character_flint_combat WHERE character_id=$1',
    [c.id]
  );
  const ch=await db.query<{
    current_health:number;coins:string;major_skill_bonuses:Record<string,number>;
    tutorial_status:string;tutorial_stage:number
  }>(
    'SELECT current_health,coins,major_skill_bonuses,tutorial_status,tutorial_stage FROM player_characters WHERE id=$1',
    [c.id]
  );
  assert.equal(Number(stored.rows[0].revision),state.revision);
  assert.equal(stored.rows[0].outcome,state.outcome);
  assert.equal(stored.rows[0].state.player.hp,state.player.hp);
  assert.equal(ch.rows[0].current_health,state.player.hp);
  assert.equal(ch.rows[0].tutorial_status,'COMPLETED');
  assert.equal(ch.rows[0].tutorial_stage,6,'Stage 7 is not yet implemented');
  assert.equal(Number(ch.rows[0].coins),20);
  assert.deepEqual(ch.rows[0].major_skill_bonuses,{Craftsmanship:3,Industry:1});
  assert.ok(stored.rows[0].history.length>0);
  assert.deepEqual(
    stored.rows[0].history.slice(-state.turnEvents.length),
    state.turnEvents,
    'The last turn must persist its events unchanged'
  );
  return {c,state};
}

before(async()=>{
  await db.query('CREATE TABLE "user" (id TEXT PRIMARY KEY)');
  await db.query('INSERT INTO "user"(id) VALUES($1),($2)',[owner,stranger]);
  for(const filename of schema){
    const sql=readFileSync(resolve(root,'db/migrations',filename),'utf8');
    await db.query(sql);
  }
  await db.query(
    'INSERT INTO player_character_account_state(account_id) VALUES($1),($2)',
    [owner,stranger]
  );
  await app.ready();
});
after(async()=>{await app.close();await db.end();});

test('Welcome is persisted per character and never unlocks tutorial gameplay itself',async()=>{
  const first=await character(owner);
  const second=await character(owner);
  const path=base+first.id+'/welcome';
  const initial=await request('GET',base+first.id);
  assert.equal(initial.status,200);
  assert.equal(initial.body!.character.welcomeSeen,false,'New character must require welcome');
  assert.equal((await request('POST',path,null,{})).status,401);
  assert.equal((await request('POST',path,stranger,{})).status,404);
  assert.equal((await request('POST',path,owner,{unexpected:true})).status,400);
  const acknowledge=await request('POST',path,owner,{});
  assert.equal(acknowledge.status,200,JSON.stringify(acknowledge.body));
  assert.equal(acknowledge.body!.welcomeSeen,true);
  assert.equal((await request('POST',path,owner,{})).status,200,
    'Retry must be safe and idempotent');
  const checked=await request('GET',base+first.id);
  assert.equal(checked.body!.character.welcomeSeen,true);
  assert.equal(checked.body!.character.tutorial.stage,6,
    'Welcome may not modify stage or give any gameplay progress');
  const other=await request('GET',base+second.id);
  assert.equal(other.body!.character.welcomeSeen,false,
    'Acknowledging one character must not dismiss another');
  // Re-running the additive migration must not silently mark newly created
  // but still unread characters as already introduced.
  await db.query(readFileSync(resolve(root,'db/migrations','0009_character_welcome.sql'),'utf8'));
  assert.equal((await request('GET',base+second.id)).body!.character.welcomeSeen,false,
    'Migration rerun must preserve an unread welcome on a new character');
  const reset=await request('POST',base+first.id+'/dev/reset-welcome',owner,{});
  assert.equal(reset.status,200,JSON.stringify(reset.body));
  assert.equal(reset.body!.welcomeSeen,false);
  assert.equal((await request('GET',base+first.id)).body!.character.welcomeSeen,false);
  assert.equal((await request('POST',path,owner,{})).body!.welcomeSeen,true,
    'Explicit reset must permit exactly one new acknowledgement');
});

test('Three saved stances give distinct first-round tactical states',async()=>{
  const b=await character(owner,'brace');
  const m=await character(owner,'moving');
  const c=await character(owner,'cart');
  const [brace,moving,cart]=await Promise.all([start(b),start(m),start(c)]);
  assert.equal(brace.distance,'contact');
  assert.equal(moving.distance,'near');
  assert.equal(cart.distance,'far');
  assert.equal(brace.enemyIntent!==null,true);
  assert.equal(brace.intentType,'watchful');
  assert.equal(moving.intentType,'watchful');
  assert.equal(cart.intentType,'repositioning',
    'Flint must first get around the cart, not swing through it');
  const results=await Promise.all([
    turn(b,brace,{type:'guard'}),
    turn(m,moving,{type:'guard'}),
    turn(c,cart,{type:'guard'})
  ]);
  for(const response of results)assert.equal(response.status,200);
  // Moving retains distance if Flint commits to the originally telegraphed
  // attack; with the cart he must approach instead.
  assert.equal(results[1].body!.distance,'near');
  assert.equal(results[2].body!.distance,'contact');
  assert.ok(results[1].body!.turnEvents.some((e:any)=>e.kind==='miss'));
  assert.ok(results[2].body!.turnEvents.some((e:any)=>
    e.kind==='move'&&e.actor==='enemy'));
  assert.equal(results[2].body!.player.hp,50,'A cart opener cannot inflict a club hit');
  assert.equal(results[0].body!.round,2);
});

test('Closing distance does not collapse Moving and Cart into identical first turns',async()=>{
  const moving=await character(owner,'moving');
  const cart=await character(owner,'cart');
  const m=await start(moving);
  const c=await start(cart);
  const [moved,covered]=await Promise.all([
    turn(moving,m,{type:'move',to:'close'}),
    turn(cart,c,{type:'move',to:'close'})
  ]);
  assert.equal(moved.status,200);
  assert.equal(covered.status,200);
  assert.ok(moved.body!.turnEvents.some((event:any)=>
    event.actor==='enemy'&&(event.kind==='damage'||event.kind==='miss')),
    'Flint must resolve the committed swing if a moving player closes');
  assert.ok(covered.body!.turnEvents.some((event:any)=>
    event.actor==='enemy'&&event.kind==='move'),
    'Flint must navigate the cart instead of swinging through it');
  assert.equal(covered.body!.player.hp,50,
    'Crossing the cart does not secretly damage the player');
  assert.notDeepEqual(moved.body!.turnEvents,covered.body!.turnEvents,
    'First-turn events must remain mechanically distinct');
});

test('Unauthorized users cannot view or advance another account fight',async()=>{
  const c=await character();
  assert.equal((await request('GET',c.path,null)).status,401);
  assert.equal((await request('GET',c.path,stranger)).status,404);
  assert.equal((await request('POST',c.path,stranger,{
    kind:'start',requestId:randomUUID()
  })).status,404);
  assert.equal((await request('GET',c.path,owner)).body!.needsStart,true);
  await start(c);
  assert.equal((await request('GET',c.path,stranger)).status,404);
  assert.equal((await turn(c,{revision:0},{type:'guard'},randomUUID(),stranger)).status,404);
});

test('Start and turn receipts are replay-safe; stale and forged actions are rejected',async()=>{
  const c=await character();
  const startId=randomUUID();
  const first=await start(c,startId);
  assert.deepEqual((await request('POST',c.path,owner,{kind:'start',requestId:startId})).body,first);
  const mismatch=await request('POST',c.path,owner,{
    kind:'turn',requestId:startId,expectedRevision:0,action:{type:'guard'}
  });
  assert.equal(mismatch.status,409);
  assert.equal(mismatch.body?.error,'idempotency_key_reuse');

  const invalid=await turn(c,first,{type:'withdraw'});
  assert.equal(invalid.status,400);
  assert.equal((await request('GET',c.path,owner)).body!.revision,0);
  const key=randomUUID();
  const good=await turn(c,first,{type:'guard'},key);
  assert.equal(good.status,200);
  assert.equal(good.body!.revision,1);
  const retry=await turn(c,first,{type:'guard'},key);
  assert.equal(retry.status,200);
  assert.deepEqual(retry.body,good.body);
  const stale=await turn(c,first,{type:'recover',mode:'breath'});
  assert.equal(stale.status,409);
  assert.equal(stale.body!.error,'stale_revision');
  const loaded=await request('GET',c.path);
  assert.equal(loaded.status,200);
  assert.equal(loaded.body!.revision,1);
  assert.deepEqual(loaded.body!.events,good.body!.events);
  const receipts=await db.query<{count:string}>(
    'SELECT COUNT(*)::text AS count FROM player_character_flint_combat_receipts WHERE character_id=$1',[c.id]
  );
  assert.equal(Number(receipts.rows[0].count),2);
});

test('Two concurrent browser tabs cannot both commit the same revision',async()=>{
  const c=await character();
  const current=await start(c);
  const [left,right]=await Promise.all([
    turn(c,current,{type:'guard'}),
    turn(c,current,{type:'recover',mode:'breath'})
  ]);
  assert.deepEqual([left.status,right.status].sort(),[200,409]);
  const chosen=left.status===200?left:right;
  const saved=await request('GET',c.path);
  assert.equal(saved.body!.revision,1);
  assert.deepEqual(saved.body!.events,chosen.body!.events);
  const health=await db.query<{current_health:number}>(
    'SELECT current_health FROM player_characters WHERE id=$1',[c.id]
  );
  assert.equal(health.rows[0].current_health,saved.body!.player.hp);
  const receipts=await db.query<{count:string}>(
    'SELECT COUNT(*)::text AS count FROM player_character_flint_combat_receipts WHERE character_id=$1',[c.id]
  );
  assert.equal(Number(receipts.rows[0].count),2);
});

test('A victory saves its actual Health and never awards coins, XP or Stage 7',async()=>{
  const {state}=await outcomeWith(()=>({type:'attack',zone:'torso'}));
  assert.equal(state.outcome,'player_victory');
});

test('A defeat at zero Health is committed and does not falsely heal the character',async()=>{
  const {state}=await outcomeWith(()=>({type:'guard'}));
  assert.equal(state.outcome,'player_defeat');
  assert.equal(state.player.hp,0);
});

test('Account-owned deletion removes Stage 5/6 records, receipts and old chapters atomically',async()=>{
  const c=await character();
  const other=await character(stranger);
  let fight=await start(c);
  const action=await turn(c,fight,{type:'guard'});
  assert.equal(action.status,200);
  fight=action.body!;
  await db.query(
    'INSERT INTO player_character_wage_claim_receipts(character_id,request_id,request_hash,result) VALUES($1,$2,$3,$4::jsonb)',
    [c.id,randomUUID(),'hash','{}']
  );
  await db.query(
    'INSERT INTO player_character_second_job(character_id,revision,state) VALUES($1,0,$2::jsonb)',
    [c.id,'{"phase":"DONE","branch":"restamp"}']
  );
  await db.query(
    'INSERT INTO player_character_second_job_receipts(character_id,request_id,request_hash,result) VALUES($1,$2,$3,$4::jsonb)',
    [c.id,randomUUID(),'hash','{}']
  );
  await db.query(
    'INSERT INTO player_character_create_receipts(account_id,request_id,request_hash,character_id,result) VALUES($1,$2,$3,$4,$5::jsonb)',
    [owner,randomUUID(),'hash',c.id,'{}']
  );
  const path=base+c.id;
  const body={confirmedName:c.name,expectedRevision:0};
  assert.equal((await request('DELETE',path,stranger,body)).status,404);
  assert.equal((await request('DELETE',path,owner,{
    ...body,confirmedName:'wrong'
  })).status,400);
  assert.equal((await request('DELETE',path,owner,{
    ...body,expectedRevision:5
  })).status,409);
  assert.equal((await request('GET',c.path,owner)).body!.revision,fight.revision);

  const deletion=await request('DELETE',path,owner,body);
  assert.equal(deletion.status,200,JSON.stringify(deletion.body));
  assert.equal(deletion.body?.deleted,true);
  assert.equal(deletion.body?.revision,1);
  assert.equal((await request('GET',path,owner)).status,404);
  assert.equal((await request('GET',other.path,stranger)).body!.needsStart,true);
  for(const table of [
    'player_character_create_receipts',
    'player_character_second_job_receipts','player_character_second_job',
    'player_character_wage_claim_receipts','player_character_wage_claim',
    'player_character_flint_combat_receipts','player_character_flint_combat',
    'player_character_clinic_receipts','player_character_clinic'
  ]){
    const result=await db.query<{count:string}>(
      'SELECT COUNT(*)::text AS count FROM '+table+' WHERE character_id=$1',[c.id]
    );
    assert.equal(Number(result.rows[0].count),0,'Orphaned row in '+table);
  }
  const account=await db.query<{revision:string}>(
    'SELECT revision FROM player_character_account_state WHERE account_id=$1',[owner]
  );
  assert.equal(Number(account.rows[0].revision),1);
});


async function clinicCommand(
  c:Awaited<ReturnType<typeof character>>,
  kind:'start'|'action',action?:string,revision?:number,requestId=randomUUID(),
  account:string|null=owner
){
  return request('POST',base+c.id+'/millhand/clinic',account,
    kind==='start'?{kind,requestId}
      :{kind,action,expectedRevision:revision,requestId});
}
async function clinicAdvance(
  c:Awaited<ReturnType<typeof character>>,
  state:Record<string,any>,action:string,requestId=randomUUID()
){
  const response=await clinicCommand(c,'action',action,state.revision,requestId);
  assert.equal(response.status,200,JSON.stringify(response.body));
  return response.body!;
}
async function completeExamination(c:Awaited<ReturnType<typeof character>>){
  const begin=await clinicCommand(c,'start');
  assert.equal(begin.status,200,JSON.stringify(begin.body));
  let state=begin.body!;
  for(const action of ['examine','speak','review_price'])
    state=await clinicAdvance(c,state,action);
  return state;
}

test('Stage 7 enforces the finished-fight boundary and account ownership',async()=>{
  const c=await character();
  await start(c);
  const route=base+c.id+'/millhand/clinic';
  assert.equal((await request('GET',route,null)).status,401);
  assert.equal((await request('GET',route,stranger)).status,404);
  assert.equal((await clinicCommand(c,'start',undefined,undefined,randomUUID(),stranger)).status,404);
  const early=await clinicCommand(c,'start');
  assert.equal(early.status,409);
  assert.equal(early.body?.error,'combat_not_finished');
  assert.equal((await request('GET',route)).status,409);
});

test('Victory clinic charges once, preserves the battle and advances only after leaving',async()=>{
  const {c,state:fight}=await outcomeWith(()=>({type:'attack',zone:'torso'}));
  const combatBefore=await db.query<{state:any;history:any[]}>(
    'SELECT state,history FROM player_character_flint_combat WHERE character_id=$1',[c.id]
  );
  const price=await completeExamination(c);
  assert.equal(price.conditionType==='unhurt',fight.player.hp===fight.player.hpMax
    &&fight.player.wounds.length===0&&fight.player.bleed===0);
  assert.equal(price.coins,20);
  assert.equal(price.fee,10);
  assert.equal(price.paid,false);
  const earlyLeave=await clinicCommand(c,'action','leave',price.revision);
  assert.equal(earlyLeave.status,409);
  assert.equal(earlyLeave.body?.error,'wrong_clinic_phase');
  const requestId=randomUUID();
  const paid=await clinicAdvance(c,price,'pay',requestId);
  assert.equal(paid.coins,10);
  assert.equal(paid.after.hp,50);
  assert.equal(paid.after.stamina,90);
  assert.equal(paid.after.composure,80);
  assert.equal(paid.after.fatigue,0);
  assert.equal(paid.after.momentum,0);
  assert.equal(paid.after.wounds.length,0);
  assert.equal(paid.after.bleed,0);
  assert.equal(paid.paid,true);
  const retry=await clinicCommand(c,'action','pay',price.revision,requestId);
  assert.equal(retry.status,200);
  assert.deepEqual(retry.body,paid,'Receipt must replay identical payment response');
  const second=await clinicCommand(c,'action','pay',paid.revision);
  assert.equal(second.status,409,'A second fee must never be permitted');
  const readback=await request('GET',base+c.id+'/millhand/clinic');
  assert.equal(readback.status,200);
  assert.deepEqual(readback.body,paid);
  const beforeLeaving=await db.query<{tutorial_stage:number;current_health:number;coins:string}>(
    'SELECT tutorial_stage,current_health,coins FROM player_characters WHERE id=$1',[c.id]
  );
  assert.equal(beforeLeaving.rows[0].tutorial_stage,7);
  assert.equal(Number(beforeLeaving.rows[0].coins),10);
  assert.equal(beforeLeaving.rows[0].current_health,50);
  const left=await clinicAdvance(c,paid,'leave');
  assert.equal(left.completed,true);
  assert.equal(left.nextStage,8);
  const finished=await db.query<{
    tutorial_stage:number;tutorial_status:string;current_health:number;
    coins:string;major_skill_bonuses:Record<string,number>
  }>('SELECT tutorial_stage,tutorial_status,current_health,coins,major_skill_bonuses FROM player_characters WHERE id=$1',[c.id]);
  assert.equal(finished.rows[0].tutorial_stage,8);
  assert.equal(finished.rows[0].tutorial_status,'NOT_STARTED');
  assert.equal(finished.rows[0].current_health,50);
  assert.equal(Number(finished.rows[0].coins),10);
  assert.deepEqual(finished.rows[0].major_skill_bonuses,{Craftsmanship:3,Industry:1});
  const combatAfter=await db.query<{state:any;history:any[]}>(
    'SELECT state,history FROM player_character_flint_combat WHERE character_id=$1',[c.id]
  );
  assert.deepEqual(combatAfter.rows[0],combatBefore.rows[0],
    'Clinic must not rewrite outcome, wound history or original combat state');
  assert.equal((await request('GET',base+c.id+'/millhand/clinic')).body!.completed,true);
  assert.equal((await clinicCommand(c,'action','pay',paid.revision)).status,409);
});

test('Defeat at zero Health still enters clinic and finishes at full starting condition',async()=>{
  const {c,state:fight}=await outcomeWith(()=>({type:'guard'}));
  assert.equal(fight.player.hp,0);
  const price=await completeExamination(c);
  assert.equal(price.outcome,'player_defeat');
  assert.equal(price.before.hp,0);
  assert.equal(price.conditionType==='unhurt',false);
  const paid=await clinicAdvance(c,price,'pay');
  assert.equal(paid.after.hp,50);
  assert.equal(paid.before.hp,0,'The original injury condition is retained');
  const left=await clinicAdvance(c,paid,'leave');
  assert.equal(left.coins,10);
  assert.equal(left.nextStage,8);
});

test('Paid examination is serialized between browser tabs and cannot charge twice',async()=>{
  const {c}=await outcomeWith(()=>({type:'guard'}));
  const price=await completeExamination(c);
  const [a,b]=await Promise.all([
    clinicCommand(c,'action','pay',price.revision),
    clinicCommand(c,'action','pay',price.revision)
  ]);
  assert.deepEqual([a.status,b.status].sort(),[200,409]);
  const row=await db.query<{coins:string;current_health:number}>(
    'SELECT coins,current_health FROM player_characters WHERE id=$1',[c.id]
  );
  assert.equal(Number(row.rows[0].coins),10);
  assert.equal(row.rows[0].current_health,50);
  const receipts=await db.query<{count:string}>(
    'SELECT COUNT(*)::text count FROM player_character_clinic_receipts WHERE character_id=$1',[c.id]
  );
  assert.equal(Number(receipts.rows[0].count),5,
    'Start, Examine, Speak, Review and one successful Pay receipt');
});

test('Unhurt full-Health encounter receives examination without fabricated injury',async()=>{
  const c=await character();
  await start(c);
  const row=await db.query<{state:any}>(
    'SELECT state FROM player_character_flint_combat WHERE character_id=$1',[c.id]
  );
  // Synthetic zero-damage victory fixture tests the clinic gate only.
  const combat={...row.rows[0].state,status:'finished',outcome:'player_victory'};
  combat.player.hp=50;
  combat.player.bleed=0;combat.player.wounds=[];
  await db.query(
    "UPDATE player_character_flint_combat SET state=$2::jsonb,outcome='player_victory' WHERE character_id=$1",
    [c.id,JSON.stringify(combat)]
  );
  await db.query(
    "UPDATE player_characters SET tutorial_status='COMPLETED' WHERE id=$1",[c.id]
  );
  const price=await completeExamination(c);
  assert.equal(price.conditionType,'unhurt');
  assert.equal(price.before.wounds.length,0);
  const paid=await clinicAdvance(c,price,'pay');
  assert.deepEqual(paid.before.wounds,[]);
  assert.deepEqual(paid.after.wounds,[]);
  assert.equal(paid.before.hp,paid.after.hp);
  assert.equal(paid.coins,10);
});

test('Insufficient coins leaves the medical bill unpaid and all records untouched',async()=>{
  const {c}=await outcomeWith(()=>({type:'guard'}));
  const price=await completeExamination(c);
  await db.query('UPDATE player_characters SET coins=9 WHERE id=$1',[c.id]);
  const no=await clinicCommand(c,'action','pay',price.revision);
  assert.equal(no.status,409);
  assert.equal(no.body?.error,'insufficient_coins');
  const state=await request('GET',base+c.id+'/millhand/clinic');
  assert.equal(state.body!.phase,'PRICED');
  assert.equal(state.body!.paid,false);
  assert.equal(state.body!.coins,9);
  const original=await db.query<{current_health:number}>(
    'SELECT current_health FROM player_characters WHERE id=$1',[c.id]
  );
  assert.equal(original.rows[0].current_health,state.body!.before.hp);
});



async function devRewind(c:Awaited<ReturnType<typeof character>>,stage:number,account:string|null=owner){
  return request('POST',base+c.id+'/dev/rewind-stage',account,{expectedStage:stage});
}

test('Unpaid Stage 7 rewind returns to a fresh Flint fight with original Health and no charge',async()=>{
  const {c}=await outcomeWith(()=>({type:'attack',zone:'torso'}));
  const original=await db.query<{response:Record<string,any>}>(
    "SELECT response FROM player_character_flint_combat_receipts WHERE character_id=$1 AND response->>'revision'='0' LIMIT 1",
    [c.id]
  );
  const originalHP=original.rows[0].response.player.hp;
  const opened=await clinicCommand(c,'start');
  assert.equal(opened.status,200);
  await clinicAdvance(c,opened.body!,'examine');
  const endpoint=base+c.id+'/dev/rewind-stage';
  assert.deepEqual((await request('GET',endpoint)).body,{
    enabled:true,canRewind:true,stage:7,targetStage:6
  });
  assert.equal((await devRewind(c,7,stranger)).status,404);
  assert.equal((await devRewind(c,6)).status,409);
  const rewind=await devRewind(c,7);
  assert.equal(rewind.status,200,JSON.stringify(rewind.body));
  assert.equal(rewind.body!.stage,6);
  assert.equal(rewind.body!.route,'/characters/'+c.id+'/millhand/combat');
  assert.equal(rewind.body!.coinDelta,0,'Unpaid rewind must not generate a coin cue');
  const player=await db.query<{tutorial_stage:number;tutorial_status:string;current_health:number;coins:string}>(
    'SELECT tutorial_stage,tutorial_status,current_health,coins FROM player_characters WHERE id=$1',[c.id]
  );
  assert.equal(player.rows[0].tutorial_stage,6);
  assert.equal(player.rows[0].tutorial_status,'NOT_STARTED');
  assert.equal(player.rows[0].current_health,originalHP);
  assert.equal(Number(player.rows[0].coins),20);
  for(const table of [
    'player_character_clinic_receipts','player_character_clinic',
    'player_character_flint_combat_receipts','player_character_flint_combat'
  ]){
    const rows=await db.query<{count:string}>(
      'SELECT count(*)::text count FROM '+table+' WHERE character_id=$1',[c.id]
    );
    assert.equal(Number(rows.rows[0].count),0,table+' must be cleared atomically');
  }
  const replay=await start(c);
  assert.equal(replay.revision,0);
  assert.equal(replay.player.hp,originalHP);
});

test('Paid Stage 7 rewind refunds exactly one fee and does not replay old payment',async()=>{
  const {c}=await outcomeWith(()=>({type:'guard'}));
  const price=await completeExamination(c);
  const paymentKey=randomUUID();
  const paid=await clinicAdvance(c,price,'pay',paymentKey);
  assert.equal(paid.coins,10);
  assert.equal(paid.after.hp,50);
  const rewind=await devRewind(c,7);
  assert.equal(rewind.status,200,JSON.stringify(rewind.body));
  assert.equal(rewind.body!.coinDelta,10,'Paid replay reports exactly one real refund');
  assert.equal((await devRewind(c,7)).status,409,'Cannot refund twice');
  const beforeReplay=await db.query<{coins:string;tutorial_stage:number;current_health:number}>(
    'SELECT coins,tutorial_stage,current_health FROM player_characters WHERE id=$1',[c.id]
  );
  assert.equal(Number(beforeReplay.rows[0].coins),20);
  assert.equal(beforeReplay.rows[0].tutorial_stage,6);
  assert.equal(beforeReplay.rows[0].current_health,50);
  const oldPayment=await clinicCommand(c,'action','pay',price.revision,paymentKey);
  assert.equal(oldPayment.status,409,'Old clinic receipts must never pay again');
  const restarted=await start(c);
  assert.equal(restarted.status,'active');
  assert.equal(restarted.revision,0);
  assert.equal(restarted.player.hp,50);
});

test('Stage 7 rewind blocks inconsistent character Health without partial deletion or refund',async()=>{
  const {c}=await outcomeWith(()=>({type:'guard'}));
  const price=await completeExamination(c);
  await clinicAdvance(c,price,'pay');
  await db.query('UPDATE player_characters SET current_health=49 WHERE id=$1',[c.id]);
  const bad=await devRewind(c,7);
  assert.equal(bad.status,409);
  assert.equal(bad.body?.error,'unsafe_clinic_health_state');
  const state=await request('GET',base+c.id+'/millhand/clinic');
  assert.equal(state.status,200);
  assert.equal(state.body!.paid,true);
  assert.equal(state.body!.coins,10);
  const fight=await request('GET',c.path);
  assert.equal(fight.status,200);
  assert.equal(fight.body!.status,'finished');
});


test('After leaving the clinic, Back to Stage 6 remains available until Stage 8 begins',async()=>{
  const {c}=await outcomeWith(()=>({type:'guard'}));
  const priced=await completeExamination(c);
  const paid=await clinicAdvance(c,priced,'pay');
  const left=await clinicAdvance(c,paid,'leave');
  assert.equal(left.phase,'LEFT');
  const endpoint=base+c.id+'/dev/rewind-stage';
  const options=await request('GET',endpoint);
  assert.equal(options.status,200);
  assert.deepEqual(options.body,{
    enabled:true,canRewind:true,stage:8,targetStage:6
  });
  assert.equal((await devRewind(c,7)).status,409,
    'An outdated Stage 7 request cannot bypass the completed clinic boundary');
  const rewind=await devRewind(c,8);
  assert.equal(rewind.status,200,JSON.stringify(rewind.body));
  assert.equal(rewind.body!.stage,6);
  assert.equal(rewind.body!.route,'/characters/'+c.id+'/millhand/combat');
  assert.equal(rewind.body!.coinDelta,10,'Stage 8 review reports real paid refund');
  assert.equal((await devRewind(c,8)).status,409,'Completed visit cannot refund twice');
  const char=await db.query<{coins:string;current_health:number;tutorial_status:string}>(
    'SELECT coins,current_health,tutorial_status FROM player_characters WHERE id=$1',[c.id]
  );
  assert.equal(Number(char.rows[0].coins),20);
  assert.equal(char.rows[0].current_health,50);
  assert.equal(char.rows[0].tutorial_status,'NOT_STARTED');
  const startAgain=await start(c);
  assert.equal(startAgain.status,'active');
  assert.equal(startAgain.revision,0);
});

test('Completed-clinic rewind is disabled after Stage 8 starts or if clinic state diverges',async()=>{
  const {c}=await outcomeWith(()=>({type:'guard'}));
  let priced=await completeExamination(c);
  let paid=await clinicAdvance(c,priced,'pay');
  await clinicAdvance(c,paid,'leave');
  const endpoint=base+c.id+'/dev/rewind-stage';
  await db.query(
    "UPDATE player_characters SET tutorial_status='IN_PROGRESS' WHERE id=$1",[c.id]
  );
  assert.equal((await request('GET',endpoint)).body!.canRewind,false);
  const playing=await devRewind(c,8);
  assert.equal(playing.status,409);
  assert.equal(playing.body?.error,'unsafe_clinic_state');
  const coins=await db.query<{coins:string}>(
    'SELECT coins FROM player_characters WHERE id=$1',[c.id]
  );
  assert.equal(Number(coins.rows[0].coins),10);
  await db.query(
    "UPDATE player_characters SET tutorial_status='NOT_STARTED' WHERE id=$1",[c.id]
  );
  await db.query(
    "UPDATE player_character_clinic SET state=jsonb_set(state,'{phase}','\"PAID\"'::jsonb) WHERE character_id=$1",
    [c.id]
  );
  assert.equal((await request('GET',endpoint)).body!.canRewind,false);
  const invalid=await devRewind(c,8);
  assert.equal(invalid.status,409);
  assert.equal(invalid.body?.error,'unsafe_clinic_state');
  assert.equal((await request('GET',c.path)).body!.status,'finished');
  assert.equal((await request('GET',base+c.id+'/millhand/clinic')).body!.coins,10);
});
