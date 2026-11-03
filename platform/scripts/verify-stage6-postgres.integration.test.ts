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
  '0007_millhand_flint_combat.sql'
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
    'player_character_flint_combat_receipts','player_character_flint_combat'
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
