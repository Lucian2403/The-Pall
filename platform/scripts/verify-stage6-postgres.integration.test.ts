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
import {registerBellrunnerDispatchRoutes} from '../apps/api/src/bellrunner-dispatch-routes.ts';
import {registerBellrunnerWrongBellRoutes} from '../apps/api/src/bellrunner-wrong-bell-routes.ts';
import {registerBellrunnerSecondJobRoutes} from '../apps/api/src/bellrunner-second-job-routes.ts';
import {registerBellrunnerDogmanRoutes} from '../apps/api/src/bellrunner-dogman-routes.ts';
import {registerBellrunnerDogmanCombatRoutes} from '../apps/api/src/bellrunner-dogman-combat-routes.ts';
import {
  DOGMAN_PAPERS_LENGTH,DOGMAN_REPLY_LENGTH,DOGMAN_DEMAND_LENGTH,DOGMAN_GATE_LENGTH
} from '../apps/api/src/bellrunner-dogman-work.ts';
import {INITIAL_WRONG_BELL} from '../apps/api/src/bellrunner-wrong-bell-work.ts';
import {STAGE_FOUR_FACT,STAGE_FOUR_OPENING_LENGTH,STAGE_FOUR_REVELATION_LENGTH} from '../apps/api/src/bellrunner-second-job-work.ts';
import {registerMillhandClinicRoutes} from '../apps/api/src/millhand-clinic-routes.ts';
import {registerTutorialHomeRoutes} from '../apps/api/src/tutorial-home-routes.ts';
import {registerInventoryRoutes} from '../apps/api/src/inventory-routes.ts';
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
  '0009_character_welcome.sql','0010_tutorial_home.sql',
  '0011_inventory_foundation.sql','0012_equipment_slots.sql',
  '0013_equipment_stats_and_clothing.sql','0014_bellrunner_stage1.sql',
  '0015_bellrunner_dispatch_work.sql',
  '0016_bellrunner_wrong_bell.sql','0017_bellrunner_second_job.sql',
  '0018_bellrunner_dogman.sql','0019_bellrunner_dogman_combat.sql'
];
let legacyInventoryId='';
const resolveSession=async(headers:import('node:http').IncomingHttpHeaders)=>{
  // This resolver is injected only via register*Routes options in this
  // in-process test; production uses Better Auth, not x-test-principal.
  const principal=headers['x-test-principal'];
  if(principal!==owner&&principal!==stranger)return null;
  return {user:{id:principal,emailVerified:true}};
};
const app=Fastify({logger:false});
registerCharacterRoutes(app,{pool:db,resolveSession});
registerBellrunnerDispatchRoutes(app,{pool:db,resolveSession});
registerBellrunnerWrongBellRoutes(app,{pool:db,resolveSession});
registerBellrunnerSecondJobRoutes(app,{pool:db,resolveSession});
registerBellrunnerDogmanRoutes(app,{pool:db,resolveSession});
registerBellrunnerDogmanCombatRoutes(app,{pool:db,resolveSession,seed:()=>7});
registerMillhandCombatRoutes(app,{pool:db,resolveSession,seed:()=>5});
registerMillhandClinicRoutes(app,{pool:db,resolveSession});
registerTutorialHomeRoutes(app,{pool:db,resolveSession});
registerInventoryRoutes(app,{pool:db,resolveSession});
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
  action:(state:Record<string,any>)=>Record<string,unknown>,
  initialEnemyHealth?:number
){
  const c=await character();
  let state=await start(c);
  if(initialEnemyHealth!==undefined){
    // This test proves victory persistence, not that early surrender makes
    // repeated novice torso attacks a guaranteed win against Flint's club.
    await db.query(
      "UPDATE player_character_flint_combat SET state=jsonb_set(state,'{enemy,hp}',$2::jsonb) WHERE character_id=$1",
      [c.id,JSON.stringify(initialEnemyHealth)]
    );
    state=(await request('GET',c.path)).body!;
  }
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
    if(filename==='0011_inventory_foundation.sql'){
      // Simulate an account created before inventory tables existed.
      legacyInventoryId=randomUUID();
      await db.query(
        "INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location) VALUES($1,$2,'Legacy Owner',$3,'Male','Millhand','{}'::jsonb,'[{\"name\":\"Basic Clothes\",\"quantity\":1},{\"name\":\"Crude Small Bag\",\"quantity\":1}]'::jsonb,'Smithing workshop')",
        [legacyInventoryId,owner,'legacy-'+legacyInventoryId]
      );
    }
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

test('Bellrunner Stage 1 acceptance is owned, persistent, atomic, and awards no equipment or wages',async()=>{
 const id=randomUUID(),name='Bellrunner '+id.slice(0,8);
 await db.query(
  "INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location,tutorial_stage,tutorial_status) VALUES($1,$2,$3,$4,'Male','Bellrunner',$5::jsonb,'[]'::jsonb,'Dispatch House',1,'NOT_STARTED')",
  [id,owner,name,'bellrunner-'+id,JSON.stringify({Industry:3})]
 );
 const path=base+id+'/bellrunner/dispatch';
 assert.equal((await request('GET',path,null)).status,401);
 assert.equal((await request('GET',path,stranger)).status,404);
 const untouched=await request('GET',path);
 assert.equal(untouched.status,200);
 assert.equal(untouched.body?.accepted,false);
 assert.equal(untouched.body?.stage,1);
 assert.equal((await request('POST',path,owner,{
  action:'invent_stage_three',requestId:randomUUID(),expectedRevision:0
 })).status,400);
 const invalid=await request('POST',path,owner,{
  action:'take_round',requestId:randomUUID(),expectedRevision:1
 });
 assert.equal(invalid.status,400);
 const attack=await request('POST',path,stranger,{
  action:'take_round',requestId:randomUUID(),expectedRevision:0
 });
 assert.equal(attack.status,404);
 const requestId=randomUUID();
 const accepted=await request('POST',path,owner,{action:'take_round',requestId,expectedRevision:0});
 assert.equal(accepted.status,200,JSON.stringify(accepted.body));
 assert.deepEqual(accepted.body?.tutorialPayout,{coins:0,ordinaryXp:0,items:0});
 assert.equal(accepted.body?.stage,2);
 assert.equal(accepted.body?.accepted,true);
 assert.equal(accepted.body?.payment,'Not yet cleared');
 const duplicate=await request('POST',path,owner,{action:'take_round',requestId,expectedRevision:0});
 assert.equal(duplicate.status,200);
 assert.deepEqual(duplicate.body,accepted.body,'A retry with the same ID returns the saved result');
 const rejected=await request('POST',path,owner,{
  action:'take_round',requestId:randomUUID(),expectedRevision:0
 });
 assert.equal(rejected.status,409,'A new request must not issue the same work twice');
 const stored=await db.query(
  'SELECT tutorial_stage,tutorial_status,coins,major_skill_bonuses FROM player_characters WHERE id=$1',[id]);
 assert.equal(stored.rows[0].tutorial_stage,2);
 assert.equal(stored.rows[0].tutorial_status,'IN_PROGRESS');
 assert.equal(Number(stored.rows[0].coins),20);
 assert.deepEqual(stored.rows[0].major_skill_bonuses,{Industry:3});
 assert.equal((await request('GET',path)).body?.accepted,true);
 const grants=await db.query(
  "SELECT item_code,quantity FROM player_character_item_instances WHERE character_id=$1 ORDER BY item_code",[id]);
 assert.deepEqual(grants.rows.map(x=>[x.item_code,x.quantity]),[
  ['basic_clothes',1],['crude_small_bag',1]
 ]);
 assert.equal(Number((await db.query(
  'SELECT count(*) AS n FROM player_character_bellrunner_dispatch_receipts WHERE character_id=$1',[id]
 )).rows[0].n),1);
});

test('Bellrunner Back to Stage 1 is loopback-only, owner-scoped and preserves belongings',async()=>{
 const id=randomUUID(),name='QA Replay '+id.slice(0,8);
 await db.query(
  "INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location,tutorial_stage,tutorial_status) VALUES($1,$2,$3,$4,'Female','Bellrunner',$5::jsonb,'[]'::jsonb,'Dispatch House',1,'NOT_STARTED')",
  [id,owner,name,'replay-'+id,JSON.stringify({Industry:3})]);
 const path=base+id+'/bellrunner/dispatch';
 const rewind=base+id+'/dev/rewind-stage';
 const before=await request('GET',rewind);
 assert.equal(before.status,200,JSON.stringify(before.body));
 assert.equal(before.body?.canRewind,false);
 assert.equal((await request('GET',rewind,null)).status,401);
 assert.equal((await request('GET',rewind,stranger)).status,404);
 assert.equal((await request('POST',rewind,stranger,{expectedStage:2})).status,404);
 const taken=await request('POST',path,owner,{
  action:'take_round',requestId:randomUUID(),expectedRevision:0});
 assert.equal(taken.status,200,JSON.stringify(taken.body));
 for(const [action,revision] of [['check_round',0],['take_quieter_road',1],['deliver_notices',2]] as const){
  const progressed=await request('POST',path+'/work',owner,{
   action,requestId:randomUUID(),expectedRevision:revision});
  assert.equal(progressed.status,200,action+': '+JSON.stringify(progressed.body));
 }
 assert.equal((await request('GET',path)).body?.workState?.phase,'receiving_arrival');
 const button=await request('GET',rewind);
 assert.equal(button.status,200,JSON.stringify(button.body));
 assert.deepEqual(button.body,{
  enabled:true,canRewind:true,stage:2,targetStage:1});
 const invalid=await request('POST',rewind,owner,{expectedStage:3});
 assert.equal(invalid.status,409,'Wrong stage cannot rewind');
 const returned=await request('POST',rewind,owner,{expectedStage:2});
 assert.equal(returned.status,200,JSON.stringify(returned.body));
 assert.equal(returned.body?.stage,1);
 assert.equal(returned.body?.route,'/characters/'+id+'/opening');
 assert.equal(returned.body?.coinDelta,0);
 assert.equal((await request('GET',path)).body?.accepted,false);
 assert.equal((await request('GET',rewind)).body?.canRewind,false);
 assert.equal((await request('POST',rewind,owner,{expectedStage:2})).status,409,
  'Repeat rewind must never delete or recreate a round');
 const saved=await db.query(
  'SELECT tutorial_stage,tutorial_status,coins,major_skill_bonuses FROM player_characters WHERE id=$1',[id]);
 assert.equal(saved.rows[0].tutorial_stage,1);
 assert.equal(saved.rows[0].tutorial_status,'NOT_STARTED');
 assert.equal(Number(saved.rows[0].coins),20);
 assert.deepEqual(saved.rows[0].major_skill_bonuses,{Industry:3});
 const items=await db.query(
  'SELECT item_code,quantity,equipment_slot FROM player_character_item_instances WHERE character_id=$1 ORDER BY item_code',[id]);
 assert.deepEqual(items.rows.map(x=>[x.item_code,x.quantity,x.equipment_slot]),[
  ['basic_clothes',1,'torso'],['crude_small_bag',1,'back']]);
 const receipts=await db.query(
  'SELECT count(*)::int AS n FROM player_character_bellrunner_dispatch_receipts WHERE character_id=$1',[id]);
 assert.equal(receipts.rows[0].n,0,'No stale receipt may falsely accept the round again');
 const workReceipts=await db.query(
  'SELECT count(*)::int AS n FROM player_character_bellrunner_dispatch_work_receipts WHERE character_id=$1',[id]);
 assert.equal(workReceipts.rows[0].n,0,'Rewind must erase Stage 2 work receipts too');
 const replay=await request('POST',path,owner,{
  action:'take_round',requestId:randomUUID(),expectedRevision:0});
 assert.equal(replay.status,200,'The re-played opening can accept a fresh round exactly once');
 assert.equal(replay.body?.stage,2);
 assert.equal(replay.body?.workState?.phase,'issued',
  'Replay starts a fresh work round, not a stale spoiled receipt');
 assert.equal(replay.body?.revision,0);
});

test('Bellrunner Stage 2 records the route and two receiver RP beats without rewards',async()=>{
 const id=randomUUID(),name='Courier '+id.slice(0,8);
 await db.query(
  "INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location,tutorial_stage,tutorial_status) VALUES($1,$2,$3,$4,'Male','Bellrunner',$5::jsonb,'[]'::jsonb,'Dispatch House',1,'NOT_STARTED')",
  [id,owner,name,'courier-'+id,JSON.stringify({Industry:3})]);
 const path=base+id+'/bellrunner/dispatch';
 const work=path+'/work';
 assert.equal((await request('GET',work,stranger)).status,404,
  'GET work is not exposed as a separate read route');
 assert.equal((await request('POST',work,null,{action:'take_direct_road',expectedRevision:0,requestId:randomUUID()})).status,401);
 assert.equal((await request('POST',work,stranger,{action:'take_direct_road',expectedRevision:0,requestId:randomUUID()})).status,404);
 assert.equal((await request('POST',work,owner,{action:'take_direct_road',expectedRevision:0,requestId:randomUUID()})).status,409,
  'Cannot begin work before receiving Hector\'s task');
 const accepted=await request('POST',path,owner,{action:'take_round',requestId:randomUUID(),expectedRevision:0});
 assert.equal(accepted.status,200,JSON.stringify(accepted.body));
 assert.equal(accepted.body?.workState?.phase,'issued');
 assert.equal(accepted.body?.revision,0);
 assert.equal((await request('GET',path)).body?.workState?.phase,'issued');
 assert.equal((await request('POST',work,owner,{
  action:'take_final_notice',expectedRevision:0,requestId:randomUUID()})).status,409);
 assert.equal((await request('POST',work,owner,{
  action:'secret_delivery',expectedRevision:0,requestId:randomUUID()})).status,400);
 async function command(action:string,expectedRevision:number,requestId=randomUUID()){
  return request('POST',work,owner,{action,expectedRevision,requestId});
 }
 const requestId=randomUUID();
 const chosen=await command('take_direct_road',0,requestId);
 assert.equal(chosen.status,200,JSON.stringify(chosen.body));
 assert.equal(chosen.body?.revision,1);
 assert.equal(chosen.body?.workState?.phase,'road_chosen');
 assert.equal(chosen.body?.workState?.route,'direct');
 assert.deepEqual((await command('take_direct_road',0,requestId)).body,chosen.body);
 assert.equal((await command('take_quieter_road',0,requestId)).status,409,
  'A request ID cannot be reused for a different road');
 assert.equal((await command('deliver_notices',0)).status,409,
  'A stale tab cannot skip the narrated journey');
 let state=(await command('deliver_notices',1)).body!;
 assert.equal(state.workState.phase,'receiving_arrival');
 assert.equal((await command('check_receiving_book',2)).status,409,
  'Receiver choices must be unavailable before the arrival Continue');
 state=(await command('continue_to_receiver',2)).body!;
 assert.equal(state.workState.phase,'spoiled_mark');
 assert.equal((await command('finish_round',3)).status,409);
 state=(await command('check_receiving_book',3)).body!;
 assert.equal(state.workState.phase,'receiver_reply');
 assert.equal(state.workState.receipt,'book_confirmed');
 assert.equal((await command('finish_round',4)).status,409,
  'The receiver conversation cannot be skipped');
 state=(await command('continue_receiver_dialogue',4)).body!;
 assert.equal(state.workState.phase,'receiver_result');
 assert.equal((await command('finish_round',5)).status,409,
  'The final notice cannot be reached before the receiver answer');
 state=(await command('continue_to_final_notice',5)).body!;
 assert.equal(state.workState.phase,'final_notice');
 state=(await command('take_final_notice',6)).body!;
 assert.equal(state.workState.phase,'final_notice_taken');
 assert.equal(state.revision,7);
 assert.equal(state.stage,3,'Taking the final notice advances to the implemented Stage 3');
 assert.equal((await command('take_final_notice',7)).status,409);
 const latest=(await request('GET',path)).body!;
 assert.deepEqual(latest.workState,state.workState);
 assert.deepEqual(latest.tutorialPayout,{coins:0,ordinaryXp:0,items:0});
 const stored=(await db.query(
  'SELECT tutorial_stage,coins,major_skill_bonuses FROM player_characters WHERE id=$1',[id])).rows[0];
 assert.equal(stored.tutorial_stage,3);
 assert.equal(Number(stored.coins),20);
 assert.deepEqual(stored.major_skill_bonuses,{Industry:3});
 const grants=(await db.query(
  'SELECT item_code,quantity,equipment_slot FROM player_character_item_instances WHERE character_id=$1 ORDER BY item_code',[id])).rows;
 assert.deepEqual(grants.map(x=>[x.item_code,x.quantity,x.equipment_slot]),[
  ['basic_clothes',1,'torso'],['crude_small_bag',1,'back']]);
 const receipts=await db.query<{n:number}>(
  'SELECT count(*)::int AS n FROM player_character_bellrunner_dispatch_work_receipts WHERE character_id=$1',[id]);
 assert.equal(receipts.rows[0].n,7);
});

test('Both roads and the other receipt choices preserve the complete RP sequence',async()=>{
 for(const [road,remedy,receipt] of [
  ['take_quieter_road','note_spoiled_mark','noted_unclear'],
  ['take_direct_road','ask_fresh_mark','clear']
 ] as const){
  const id=randomUUID();
  await db.query(
   "INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location,tutorial_stage,tutorial_status) VALUES($1,$2,$3,$4,'Female','Bellrunner',$5::jsonb,'[]'::jsonb,'Dispatch House',1,'NOT_STARTED')",
   [id,owner,'Route '+id.slice(0,8),'route-'+id,JSON.stringify({Industry:3})]);
  const path=base+id+'/bellrunner/dispatch';
  assert.equal((await request('POST',path,owner,{
   action:'take_round',requestId:randomUUID(),expectedRevision:0})).status,200);
  let revision=0;
  const transitions=[
   [road,'road_chosen'],['deliver_notices','receiving_arrival'],
   ['continue_to_receiver','spoiled_mark'],[remedy,'receiver_reply'],
   ['continue_receiver_dialogue','receiver_result'],
   ['continue_to_final_notice','final_notice'],
   ['take_final_notice','final_notice_taken']
  ] as const;
  for(const [action,phase] of transitions){
   const result=await request('POST',path+'/work',owner,{
    action,requestId:randomUUID(),expectedRevision:revision});
   assert.equal(result.status,200,action+': '+JSON.stringify(result.body));
   assert.equal(result.body?.revision,++revision);
   assert.equal(result.body?.workState?.phase,phase);
  }
  const result=(await request('GET',path)).body!;
  assert.equal(result.workState.route,road==='take_quieter_road'?'quieter':'direct');
  assert.equal(result.workState.receipt,receipt);
  assert.equal(result.workState.noticesOrdered,false,'No compulsory sorting on new routes');
  assert.equal(result.workState.phase,'final_notice_taken');
 }
});

test('Bellrunner Stage 4: all branch methods persist, replay safely and preserve the one-time skill',async()=>{
 const jobs=[
  {branch:'contracts' as const,skill:'Commerce',
    actions:['compare_shift_records','inspect_absence_category','enter_written_objection',
      'submit_certificate'] as const},
  {branch:'trauma' as const,skill:'Medicine',
    actions:['prioritize_mobile_worker','continue_triage','continue_triage',
      'continue_detail','continue_detail','continue_detail',
      'take_observations','continue_register','continue_register',
      'continue_register','continue_register','continue_register',
      'ask_about_classification','finish_handover'] as const},
  {branch:'machinery' as const,skill:'Mechanics',
    actions:['inspect_safety_linkage','trace_bell_rod','show_mechanic_link',
      'mark_pin_position'] as const}
 ];
 for(const job of jobs){
  const id=randomUUID();
  const name='BR Stage4 '+id.slice(0,8);
  const bonuses={Industry:3,[job.skill]:1};
  await db.query(
   "INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location,tutorial_stage,tutorial_status) VALUES($1,$2,$3,$4,'Male','Bellrunner',$5::jsonb,'[]'::jsonb,'Dispatch House',4,'NOT_STARTED')",
   [id,owner,name,'br-job-'+id,JSON.stringify(bonuses)]);
  const predecessor={...INITIAL_WRONG_BELL,phase:'committed',branch:job.branch,revision:18};
  await db.query(
   'INSERT INTO player_character_bellrunner_wrong_bell(character_id,revision,state) VALUES($1,$2,$3::jsonb)',
   [id,18,JSON.stringify(predecessor)]);
  const path=base+id+'/bellrunner/second-job';
  assert.equal((await request('GET',path,stranger)).status,404,'Stage 4 is owner scoped');
  assert.equal((await request('POST',path,null,
    {action:'continue_opening',expectedRevision:0,requestId:randomUUID()})).status,401);
  let loaded=await request('GET',path,owner);
  assert.equal(loaded.status,200,JSON.stringify(loaded.body));
  assert.equal(loaded.body?.state?.branch,job.branch);
  assert.equal(loaded.body?.state?.revision,0);
  assert.equal((await request('POST',path,owner,{
   action:'finish_handover',expectedRevision:0,requestId:randomUUID()
  })).status,409,'Wrong branch/work phase rejected');
  let revision=0;
  async function command(action:string,requestId=randomUUID()){
   const response=await request('POST',path,owner,{action,expectedRevision:revision,requestId});
   assert.equal(response.status,200,action+': '+JSON.stringify(response.body));
   assert.equal(response.body?.state?.revision,revision+1);
   revision++;
   return response;
  }
  for(let k=0;k<STAGE_FOUR_OPENING_LENGTH[job.branch]-(job.branch==='trauma'?1:0);k++)
   await command('continue_opening');
  const first=job.actions[0];
  const firstRequest=randomUUID();
  const committed=await command(first,firstRequest);
  const replay=await request('POST',path,owner,{
   action:first,expectedRevision:revision-1,requestId:firstRequest});
  assert.equal(replay.status,200,JSON.stringify(replay.body));
  assert.deepEqual(replay.body,committed.body,'Same request must not advance twice');
  assert.equal((await request('POST',path,owner,{
   action:'leave_for_gate',expectedRevision:revision,requestId:firstRequest
  })).status,409,'Reusing request ID for different action is forbidden');
  assert.equal((await request('POST',path,owner,{
   action:first,expectedRevision:revision-1,requestId:randomUUID()
  })).status,409,'Stale revision cannot re-run a work command');
  // Machinery finalizes on the gate action directly after its handover.
  // The other jobs still have their own completion action and 'done' phase.
  const laterActions=job.branch==='machinery'?job.actions.slice(1):job.actions.slice(1,-1);
  for(const action of laterActions)await command(action);
  for(let k=0;k<STAGE_FOUR_REVELATION_LENGTH[job.branch]-(job.branch==='trauma'?1:0);k++)
   await command('continue_revelation');
  if(job.branch!=='machinery')await command(job.actions[job.actions.length-1]);
  loaded=await request('GET',path,owner);
  assert.equal(loaded.body?.state?.phase,job.branch==='machinery'?'finish':'done');
  assert.equal(loaded.body?.state?.journalFact,STAGE_FOUR_FACT[job.branch]);
  assert.deepEqual(loaded.body?.availableActions,['leave_for_gate'],
    'Only the gate action remains after finishing the job');
  const gateRequest=randomUUID();
  const exited=await command('leave_for_gate',gateRequest);
  assert.equal(exited.body?.stage,5);
  assert.equal(exited.body?.state?.phase,'exited');
  assert.equal((await request('POST',path,owner,{
   action:'leave_for_gate',expectedRevision:revision,requestId:randomUUID()
  })).status,409,'Finished Stage 4 cannot be submitted again');
  const gateReplay=await request('POST',path,owner,{
   action:'leave_for_gate',expectedRevision:revision-1,requestId:gateRequest});
  assert.equal(gateReplay.status,200);
  assert.deepEqual(gateReplay.body,exited.body,'Stage 5 replay must not change rewards');
  const saved=(await db.query(
   'SELECT tutorial_stage,tutorial_status,coins,major_skill_bonuses FROM player_characters WHERE id=$1',
   [id])).rows[0];
  assert.equal(saved.tutorial_stage,5);
  assert.equal(saved.tutorial_status,'NOT_STARTED');
  assert.equal(Number(saved.coins),20);
  assert.deepEqual(saved.major_skill_bonuses,bonuses,
   'Stage 4 must never grant another +1 skill or alter coins');
  const receipts=(await db.query<{n:number}>(
   'SELECT count(*)::int AS n FROM player_character_bellrunner_second_job_receipts WHERE character_id=$1',
   [id])).rows[0].n;
  assert.equal(receipts,revision,'No duplicate request receipts');
 }
});

test('Bellrunner Dogman Stage VI: authenticated start, saved stance, replay-safe turns and rewind lock',async()=>{
 for(const stance of ['defend','street','cart'] as const){
  const id=randomUUID();
  const bonuses={Industry:3,Mechanics:1};
  await db.query(
    "INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location,tutorial_stage,tutorial_status) VALUES($1,$2,$3,$4,'Male','Bellrunner',$5::jsonb,'[]'::jsonb,'Dispatch House',6,'NOT_STARTED')",
    [id,owner,'Combat '+id.slice(0,8),'dogfight-'+id,JSON.stringify(bonuses)]);
  await db.query(
    'INSERT INTO player_character_bellrunner_dogman(character_id,revision,state) VALUES($1,11,$2::jsonb)',
    [id,JSON.stringify({revision:11,branch:'machinery',phase:'done',line:0,
      reply:'tell_him',stance})]);
  const path=base+id+'/bellrunner/combat';
  assert.equal((await request('GET',path,null)).status,401);
  assert.equal((await request('GET',path,stranger)).status,404);
  assert.equal((await request('POST',path,stranger,{kind:'start',requestId:randomUUID()})).status,404);
  const notStarted=await request('GET',path);
  assert.equal(notStarted.status,200);
  assert.equal(notStarted.body?.needsStart,true);
  const firstId=randomUUID();
  const start=await request('POST',path,owner,{kind:'start',requestId:firstId});
  assert.equal(start.status,200,JSON.stringify(start.body));
  assert.equal(start.body?.stage,6);
  assert.equal(start.body?.status,'active');
  assert.equal(start.body?.enemy?.name,'Dogman');
  assert.deepEqual(start.body?.rules?.enemyStrikeDamage,{min:12,max:15});
  assert.equal(start.body?.stance,stance==='defend'?'brace':stance==='street'?'moving':'cart');
  assert.equal(start.body?.distance,stance==='defend'?'contact':stance==='street'?'near':'far');
  assert.equal(start.body?.revision,0);
  const repeat=await request('POST',path,owner,{kind:'start',requestId:firstId});
  assert.deepEqual(repeat.body,start.body,'Repeated start does not reset encounter');
  const fresh=await request('POST',path,owner,{kind:'start',requestId:randomUUID()});
  assert.equal(fresh.body?.revision,0,'Another start does not reroll existing encounter');
  const move=stance==='cart'||stance==='street'?{type:'move',to:'close'}:{type:'guard'};
  const cmd={kind:'turn',expectedRevision:0,action:move,requestId:randomUUID()};
  const turn=await request('POST',path,owner,cmd);
  assert.equal(turn.status,200,JSON.stringify(turn.body));
  assert.equal(turn.body?.revision,1);
  assert.equal((await request('POST',path,owner,{...cmd,requestId:randomUUID()})).status,409);
  assert.deepEqual((await request('POST',path,owner,cmd)).body,turn.body);
  assert.equal((await request('POST',path,owner,{...cmd,action:{type:'attack',zone:'not_real'},requestId:randomUUID()})).status,400);
  const record=await db.query<{state:Record<string,any>;history:any[];stance:string}>(
    'SELECT state,history,stance FROM player_character_dogman_combat WHERE character_id=$1',[id]);
  assert.equal(record.rows[0].state.revision,1);
  assert.equal(record.rows[0].stance,stance);
  assert.ok(record.rows[0].history.length>0,'Committed battle events persisted');
  assert.equal((await request('GET',base+id+'/dev/rewind-stage')).body?.canRewind,false,
    'Stage V stance cannot be changed after battle started');
  const after=await db.query<{major_skill_bonuses:Record<string,number>;coins:number}>(
    'SELECT major_skill_bonuses,coins FROM player_characters WHERE id=$1',[id]);
  assert.deepEqual(after.rows[0].major_skill_bonuses,bonuses);
  assert.equal(Number(after.rows[0].coins),20);
 }
});
test('Dogman victory and genuine defeat are saved separately without confiscating quest items',async()=>{
 for(const outcome of ['player_victory','player_defeat'] as const){
  const id=randomUUID();
  await db.query(
    "INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location,tutorial_stage,tutorial_status) VALUES($1,$2,$3,$4,'Female','Bellrunner',$5::jsonb,'[]'::jsonb,'Dispatch House',6,'NOT_STARTED')",
    [id,owner,'Outcome '+id.slice(0,8),'dog-outcome-'+id,JSON.stringify({Industry:3,Medicine:1})]);
  await db.query(
    'INSERT INTO player_character_bellrunner_dogman(character_id,revision,state) VALUES($1,4,$2::jsonb)',
    [id,JSON.stringify({revision:4,branch:'trauma',phase:'done',line:0,reply:'ask_orders',stance:'defend'})]);
  const path=base+id+'/bellrunner/combat';
  const opened=await request('POST',path,owner,{kind:'start',requestId:randomUUID()});
  assert.equal(opened.status,200);
  // Exactly one engine-determined terminal transition; only the fixture's
  // combatant HP is altered. No outcome flag is fabricated in storage.
  const key=outcome==='player_victory'?'enemy':'player';
  await db.query(
    'UPDATE player_character_dogman_combat SET state=jsonb_set(state,$2::text[],$3::jsonb) WHERE character_id=$1',
    [id,[''+key,'hp'],JSON.stringify(0)]);
  const ended=await request('POST',path,owner,{
    kind:'turn',expectedRevision:0,requestId:randomUUID(),action:{type:'guard'}
  });
  assert.equal(ended.status,200,JSON.stringify(ended.body));
  assert.equal(ended.body?.status,'finished');
  assert.equal(ended.body?.outcome,outcome);
  const persisted=await db.query<{outcome:string;state:{outcome:string};history:any[]}>(
    'SELECT outcome,state,history FROM player_character_dogman_combat WHERE character_id=$1',[id]);
  assert.equal(persisted.rows[0].outcome,outcome);
  assert.equal(persisted.rows[0].state.outcome,outcome);
  assert.ok(persisted.rows[0].history.some(x=>x.kind==='outcome'));
  const person=await db.query<{tutorial_stage:number;tutorial_status:string;current_health:number}>(
    'SELECT tutorial_stage,tutorial_status,current_health FROM player_characters WHERE id=$1',[id]);
  assert.equal(person.rows[0].tutorial_stage,6);
  assert.equal(person.rows[0].tutorial_status,'COMPLETED');
  assert.equal(person.rows[0].current_health,ended.body?.player?.hp);
  assert.equal((await request('POST',path,owner,{
    kind:'turn',expectedRevision:1,requestId:randomUUID(),action:{type:'guard'}
  })).status,422,'A saved finished encounter cannot be replayed for more damage');
 }
});

test('Bellrunner Stage V: all branches keep Dogman dialogue and stance in one saved encounter',async()=>{
 for(const branch of ['contracts','trauma','machinery'] as const){
  for(const reply of ['ask_orders','keep_sheet','tell_him'] as const){
   const id=randomUUID(),name='Dogman QA '+id.slice(0,8);
   const bonuses={Industry:3,[branch==='contracts'?'Commerce':branch==='trauma'?'Medicine':'Mechanics']:1};
   await db.query(
    "INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location,tutorial_stage,tutorial_status) VALUES($1,$2,$3,$4,'Male','Bellrunner',$5::jsonb,'[]'::jsonb,'Dispatch House',5,'NOT_STARTED')",
    [id,owner,name,'dogman-'+id,JSON.stringify(bonuses)]);
   const prev={revision:10,branch,phase:'exited',openingLine:2,revelationLine:3,
    method:'trace_bell_rod',observation:'mark_pin_position',priority:null,
    journalFact:'The Stage IV finding remains intact.'};
   await db.query(
    'INSERT INTO player_character_bellrunner_second_job(character_id,revision,state) VALUES($1,$2,$3::jsonb)',
    [id,10,JSON.stringify(prev)]);
   const path=base+id+'/bellrunner/dogman';
   assert.equal((await request('GET',path,stranger)).status,404);
   assert.equal((await request('POST',path,null,
    {action:'continue',requestId:randomUUID(),expectedRevision:0})).status,401);
   let loaded=await request('GET',path,owner);
   assert.equal(loaded.status,200,JSON.stringify(loaded.body));
   assert.equal(loaded.body?.state?.branch,branch);
   assert.deepEqual(loaded.body?.availableActions,['continue']);
   let revision=0;
   async function command(action:string,requestId=randomUUID()){
    const response=await request('POST',path,owner,{
      action,expectedRevision:revision,requestId
    });
    assert.equal(response.status,200,action+': '+JSON.stringify(response.body));
    revision++;
    assert.equal(response.body?.state?.revision,revision);
    return response;
   }
   let first=await command('continue');
   const requestId=randomUUID();
   first=await command('continue',requestId);
   const replay=await request('POST',path,owner,{
    action:'continue',expectedRevision:revision-1,requestId
   });
   assert.deepEqual(replay.body,first.body);
   assert.equal((await request('POST',path,owner,{
    action:'use_cart',expectedRevision:revision-1,requestId
   })).status,409,'Request IDs cannot be reused for other actions');
   assert.equal((await request('POST',path,owner,{
    action:'continue',expectedRevision:revision-1,requestId:randomUUID()
   })).status,409,'Stale revisions cannot add dialogue beats');
   for(let i=1;i<DOGMAN_PAPERS_LENGTH-1;i++)await command('continue');
   loaded=await request('GET',path,owner);
   assert.deepEqual(loaded.body?.availableActions,['ask_orders','keep_sheet','tell_him']);
   assert.equal((await request('POST',path,owner,{
    action:'protect_bag',expectedRevision:revision,requestId:randomUUID()
   })).status,409,'Cannot skip the paperwork choice and start fighting');
   await command(reply);
   for(let i=0;i<DOGMAN_REPLY_LENGTH[reply];i++)await command('continue');
   for(let i=0;i<DOGMAN_DEMAND_LENGTH;i++)await command('continue');
   for(let i=0;i<DOGMAN_GATE_LENGTH-1;i++)await command('continue');
   loaded=await request('GET',path,owner);
   assert.deepEqual(loaded.body?.availableActions,['step_street','use_cart','protect_bag']);
   const endId=randomUUID();
   const exited=await command('use_cart',endId);
   assert.equal(exited.body?.stage,6);
   assert.equal(exited.body?.state?.phase,'done');
   assert.equal(exited.body?.state?.stance,'cart');
   assert.equal(exited.body?.state?.reply,reply);
   assert.equal(exited.body?.state?.branch,branch);
   assert.deepEqual(exited.body?.availableActions,[]);
   const endReplay=await request('POST',path,owner,{
    action:'use_cart',expectedRevision:revision-1,requestId:endId});
   assert.equal(endReplay.status,200);
   assert.deepEqual(endReplay.body,exited.body);
   assert.equal((await request('POST',path,owner,{
    action:'use_cart',expectedRevision:revision,requestId:randomUUID()
   })).status,409);
   const ch=(await db.query(
     'SELECT tutorial_stage,tutorial_status,coins,major_skill_bonuses FROM player_characters WHERE id=$1',[id])).rows[0];
   assert.equal(ch.tutorial_stage,6);
   assert.equal(ch.tutorial_status,'NOT_STARTED');
   assert.equal(Number(ch.coins),20);
   assert.deepEqual(ch.major_skill_bonuses,bonuses,'No second skill reward');
   const evidence=(await db.query('SELECT state FROM player_character_bellrunner_second_job WHERE character_id=$1',[id])).rows[0].state;
   assert.deepEqual(evidence,prev,'Stage IV findings remain untouched');
   const receipts=(await db.query<{n:number}>(
    'SELECT count(*)::int AS n FROM player_character_bellrunner_dogman_receipts WHERE character_id=$1',[id])).rows[0].n;
   assert.equal(receipts,revision,'Each accepted action stores one durable receipt');
  }
 }
});

test('Bellrunner Back to Stage 3 is always available across Stage 4 and never duplicates the skill',async()=>{
 const cases=[
  {branch:'contracts' as const,skill:'Commerce',point:'entry' as const},
  {branch:'trauma' as const,skill:'Medicine',point:'dialogue' as const},
  {branch:'machinery' as const,skill:'Mechanics',point:'inspection' as const},
  {branch:'contracts' as const,skill:'Commerce',point:'done' as const}
 ];
 for(const item of cases){
  const id=randomUUID(),name='BR Rewind '+id.slice(0,8);
  await db.query(
   "INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location,tutorial_stage,tutorial_status) VALUES($1,$2,$3,$4,'Male','Bellrunner',$5::jsonb,'[]'::jsonb,'Dispatch House',4,'NOT_STARTED')",
   [id,owner,name,'br-rewind-'+id,JSON.stringify({Industry:3,[item.skill]:1})]);
  await db.query(
   'INSERT INTO player_character_bellrunner_dispatch(character_id,revision,work_state) VALUES($1,17,$2::jsonb)',
   [id,JSON.stringify({phase:'final_notice_taken',route:'direct',noticesOrdered:true,receipt:'clear'})]);
  await db.query(
   'INSERT INTO player_character_bellrunner_wrong_bell(character_id,revision,state) VALUES($1,18,$2::jsonb)',
   [id,JSON.stringify({...INITIAL_WRONG_BELL,revision:18,phase:'committed',branch:item.branch})]);
  const endpoint=base+id+'/dev/rewind-stage';
  const jobUrl=base+id+'/bellrunner/second-job';
  let progress=0;
  async function work(action:string){
   const result=await request('POST',jobUrl,owner,{action,expectedRevision:progress,requestId:randomUUID()});
   assert.equal(result.status,200,item.branch+' '+item.point+' '+action+' '+JSON.stringify(result.body));
   progress++;
   return result;
  }
  const first=await request('GET',endpoint);
  assert.deepEqual(first.body,{enabled:true,canRewind:true,stage:4,targetStage:3},
   'The Stage 4 rewind button must appear before the first action');
  if(item.point!=='entry')await work('continue_opening');
  if(item.point==='inspection'){
   for(let n=1;n<STAGE_FOUR_OPENING_LENGTH.machinery;n++)await work('continue_opening');
   await work('inspect_safety_linkage');
  }
  if(item.point==='done'){
   for(let n=1;n<STAGE_FOUR_OPENING_LENGTH.contracts;n++)await work('continue_opening');
   await work('compare_shift_records');
   await work('inspect_absence_category');
   await work('enter_written_objection');
   for(let n=0;n<STAGE_FOUR_REVELATION_LENGTH.contracts;n++)await work('continue_revelation');
   await work('submit_certificate');
   assert.equal((await request('GET',jobUrl)).body?.state?.phase,'done');
  }
  if(item.point!=='entry'){
   const snapshot=await request('GET',endpoint);
   assert.deepEqual(snapshot.body,{enabled:true,canRewind:true,stage:4,targetStage:3},
    'The Back to Stage 3 button must remain available after saved Stage 4 commands');
  }
  assert.equal((await request('GET',endpoint,stranger)).status,404,
   'Stage rewind availability must be account scoped');
  assert.equal((await request('POST',endpoint,stranger,{expectedStage:4})).status,404,
   'Other accounts must never rewind the selected route');
  assert.equal((await request('POST',endpoint,owner,{expectedStage:3})).status,409,
   'Wrong-stage rewind must not run');
  const result=await request('POST',endpoint,owner,{expectedStage:4});
  assert.equal(result.status,200,JSON.stringify(result.body));
  assert.equal(result.body?.stage,3);
  assert.equal(result.body?.tutorialStatus,'IN_PROGRESS');
  assert.equal(result.body?.route,'/characters/'+id+'/bellrunner/wrong-bell');
  assert.equal(result.body?.coinDelta,0);
  const after=(await db.query<{
   tutorial_stage:number;tutorial_status:string;coins:number;
   major_skill_bonuses:Record<string,number>
  }>(
   'SELECT tutorial_stage,tutorial_status,coins,major_skill_bonuses FROM player_characters WHERE id=$1',
   [id])).rows[0];
  assert.equal(after.tutorial_stage,3);
  assert.equal(after.tutorial_status,'IN_PROGRESS');
  assert.equal(Number(after.coins),20);
  assert.equal(after.major_skill_bonuses[item.skill],0,
   'The original Stage 3 award is removed exactly once');
  assert.equal(after.major_skill_bonuses.Industry,3,'Other skills remain untouched');
  const predecessor=(await db.query<{state:{
   phase:string;branch:string|null;revision:number
  } }>(
   'SELECT state FROM player_character_bellrunner_wrong_bell WHERE character_id=$1',[id])).rows[0].state;
  assert.equal(predecessor.phase,'choice');
  assert.equal(predecessor.branch,null);
  assert.equal(predecessor.revision,19);
  const jobRow=await db.query(
   'SELECT character_id FROM player_character_bellrunner_second_job WHERE character_id=$1',[id]);
  assert.equal(jobRow.rowCount,0,'A rewound job cannot retain mid-stage state');
  const receipts=await db.query<{n:number}>(
   'SELECT count(*)::int AS n FROM player_character_bellrunner_second_job_receipts WHERE character_id=$1',[id]);
  assert.equal(receipts.rows[0].n,0,'Every stale Stage 4 replay receipt must be cleared');
  assert.equal((await request('POST',endpoint,owner,{expectedStage:4})).status,409,
   'Repeating rewind cannot deduct the skill again');
  assert.equal((await request('GET',endpoint)).body?.targetStage,2,
   'The Stage 3 rewind capability resumes for the previous worksite scene');
  const replay=await request('POST',base+id+'/bellrunner/wrong-bell',owner,{
   action:'choose_'+item.branch,expectedRevision:19,requestId:randomUUID()});
  assert.equal(replay.status,200,JSON.stringify(replay.body));
  assert.equal(replay.body?.state?.branch,item.branch);
  const skillAfter=(await db.query<{major_skill_bonuses:Record<string,number>}>(
   'SELECT major_skill_bonuses FROM player_characters WHERE id=$1',[id])).rows[0];
  assert.equal(skillAfter.major_skill_bonuses[item.skill],1,
   'Re-selecting the route awards +1 once, not two or zero');
  assert.equal((await request('GET',endpoint)).body?.targetStage,3,
   'After replaying the branch, Stage 4 again exposes Back to Stage 3');
 }
});

test('Equipment migration backfills existing starter items without duplicating or losing coins',async()=>{
 const rows=await db.query<{item_code:string;quantity:number;location:string;equipment_slot:string}>(
  'SELECT item_code,quantity,location,equipment_slot FROM player_character_item_instances WHERE character_id=$1 ORDER BY item_code',
  [legacyInventoryId]);
 assert.deepEqual(rows.rows.map(x=>[x.item_code,x.quantity,x.location,x.equipment_slot]),[
  ['basic_clothes',1,'equipped','torso'],['crude_small_bag',1,'equipped','back']
 ]);
 const original=(await db.query(
  'SELECT revision FROM player_character_inventory_state WHERE character_id=$1',
  [legacyInventoryId])).rows[0].revision;
 assert.equal(Number(original),1,'Migrating equipped items invalidates stale inventory tabs');
 await db.query('SELECT pall_seed_character_inventory($1)',[legacyInventoryId]);
 await db.query('SELECT pall_seed_character_inventory($1)',[legacyInventoryId]);
 for(const name of ['0012_equipment_slots.sql','0013_equipment_stats_and_clothing.sql']){
   const sql=readFileSync(resolve(root,'db/migrations',name),'utf8');
   await db.query(sql);
 }
 const again=await db.query(
  'SELECT revision FROM player_character_inventory_state WHERE character_id=$1',
  [legacyInventoryId]);
 assert.equal(Number(again.rows[0].revision),1,'Rerun must not rewrite equip history');
 const count=await db.query('SELECT count(*)::int AS count FROM player_character_item_instances WHERE character_id=$1',[legacyInventoryId]);
 assert.equal(count.rows[0].count,2);
 const ch=await db.query<{coins:string;starter_item_requirements:{name:string;quantity:number}[]}>(
  'SELECT coins,starter_item_requirements FROM player_characters WHERE id=$1',[legacyInventoryId]);
 assert.equal(Number(ch.rows[0].coins),20);
 assert.deepEqual(ch.rows[0].starter_item_requirements,[
  {name:'Daily Worker Clothes',quantity:1},{name:'Simple Bag',quantity:1}]);
});
test('Six origins start with exactly one equipped outfit and one equipped six-slot bag',async()=>{
 for(const origin of ['Millhand','Bellrunner','Squatter','Stitcher','Scrapper','Inkbound']){
  const id=randomUUID();
  await db.query(
   'INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9)',
   [id,owner,'Equipment '+origin,'equipment-'+id,'Female',origin,
    JSON.stringify({}),JSON.stringify([{name:'Daily Worker Clothes',quantity:1},
      {name:'Simple Bag',quantity:1}]),'Origin tutorial']
  );
  const owned=await db.query(
   'SELECT i.item_code,i.quantity,i.location,i.equipment_slot FROM player_character_item_instances i WHERE i.character_id=$1 ORDER BY i.item_code',[id]);
  assert.deepEqual(owned.rows.map(x=>[x.item_code,x.quantity,x.location,x.equipment_slot]),[
   ['basic_clothes',1,'equipped','torso'],['crude_small_bag',1,'equipped','back']
  ]);
  const state=await db.query(
   'SELECT revision FROM player_character_inventory_state WHERE character_id=$1',[id]);
  assert.equal(Number(state.rows[0].revision),0);
  await db.query('DELETE FROM player_characters WHERE id=$1',[id]);
  assert.equal((await db.query(
   'SELECT 1 FROM player_character_item_instances WHERE character_id=$1',[id])).rowCount,0);
 }
});
test('Inventory API shows separate equipment, 4+6 pack and authenticated locked chest',async()=>{
 const c=await character();
 const path=base+c.id+'/inventory';
 const response=await request('GET',path);
 assert.equal(response.status,200,JSON.stringify(response.body));
 const state=response.body!;
 assert.equal(state.revision,0);
 assert.equal(state.storageEnabled,false);
 assert.equal(state.pack.items.length,0);
 assert.equal(state.pack.slotsUsed,0);
 assert.equal(state.pack.maxSlots,10,'Four base + six from equipped Simple Bag');
 assert.equal(state.pack.maxVolumeL,17);
 assert.equal(state.pack.weightKg,2,'Outfit and equipped bag still count as carried weight');
 assert.equal(state.chest.maxSlots,24);
 assert.equal(state.chest.items.length,0);
 assert.equal(state.equipment.items.length,2);
 const outfit=state.equipment.items.find((x:any)=>x.code==='basic_clothes');
 const bag=state.equipment.items.find((x:any)=>x.code==='crude_small_bag');
 assert.equal(outfit.equipmentSlot,'torso');
 assert.equal(outfit.armour,0);
 assert.equal(outfit.name,'Daily Worker Clothes');
 assert.equal(outfit.description,
  "A sweat-stained shirt, rough trousers and boots worn thin at the soles. The cloth's stiff with old grime, the seams barely holding. They've seen too many long shifts and too few washes. Won't stop a blade or a club, but they'll keep the cold off. Mostly.");
 assert.equal(bag.equipmentSlot,'back');
 assert.equal(bag.carrySlotsBonus,6);
 assert.equal(bag.name,'Simple Bag');
 assert.equal(bag.description,
  "A battered canvas bag with a cracked leather strap and stitching that's coming apart. Smells of damp cloth, dust and old sweat. Holds a few tools, scraps or whatever else you've managed to get your hands on. Just don't trust it with anything too heavy.");
 assert.equal((await request('GET',path,stranger)).status,404);
 assert.equal((await request('GET',path,null)).status,401);
 assert.equal((await request('POST',path,stranger,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:0,
  itemInstanceId:bag.id,quantity:1,to:'home_chest'
 })).status,404);
 assert.equal((await request('POST',path,owner,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:0,
  itemInstanceId:bag.id,quantity:1,to:'home_chest'
 })).body!.error,'storage_not_unlocked');
 assert.equal((await request('POST',path,owner,{
  kind:'equip',requestId:randomUUID(),expectedRevision:0,
  itemInstanceId:bag.id,slot:'back'
 })).body!.error,'storage_not_unlocked');
 assert.equal((await request('GET',path)).body!.revision,0);
});
test('Chest/equipment transfers preserve identity, receipts, revisions and capacity',async()=>{
 const c=await character();
 const path=base+c.id+'/inventory';
 await db.query(
  "UPDATE player_characters SET tutorial_stage=8,tutorial_status='IN_PROGRESS' WHERE id=$1",[c.id]);
 await db.query(
  'INSERT INTO player_character_tutorial_home(character_id,revision,state) VALUES($1,0,$2::jsonb)',
  [c.id,JSON.stringify({phase:'HOME',revision:0})]);
 const original=(await request('GET',path)).body!;
 const bag=original.equipment.items.find((x:any)=>x.code==='crude_small_bag');
 const key=randomUUID();
 const cmd={kind:'transfer',requestId:key,expectedRevision:0,
  itemInstanceId:bag.id,quantity:1,to:'home_chest'};
 const moved=await request('POST',path,owner,cmd);
 assert.equal(moved.status,200,JSON.stringify(moved.body));
 assert.equal(moved.body!.revision,1);
 assert.equal(moved.body!.pack.maxSlots,4);
 assert.equal(moved.body!.pack.maxVolumeL,5);
 assert.equal(moved.body!.chest.items[0].id,bag.id);
 assert.equal(moved.body!.equipment.items.length,1);
 assert.deepEqual((await request('POST',path,owner,cmd)).body,moved.body);
 assert.equal((await request('GET',path)).body!.chest.items.length,1);
 assert.equal((await request('POST',path,owner,{
  ...cmd,to:'pack'
 })).body!.error,'idempotency_key_reuse');
 assert.equal((await request('POST',path,owner,{
  ...cmd,requestId:randomUUID()
 })).body!.error,'stale_revision');
 assert.equal((await request('POST',path,owner,{
  ...cmd,requestId:randomUUID(),expectedRevision:1,qualityTier:5
 })).status,400);
 assert.equal((await request('POST',path,owner,{
  kind:'equip',requestId:randomUUID(),expectedRevision:1,
  itemInstanceId:bag.id,slot:'torso'
 })).body!.error,'slot_incompatible');
 const reequipped=await request('POST',path,owner,{
  kind:'equip',requestId:randomUUID(),expectedRevision:1,
  itemInstanceId:bag.id,slot:'back'
 });
 assert.equal(reequipped.status,200,JSON.stringify(reequipped.body));
 assert.equal(reequipped.body!.revision,2);
 assert.equal(reequipped.body!.pack.maxSlots,10);
 assert.equal(reequipped.body!.equipment.items.find((x:any)=>x.code==='crude_small_bag').id,bag.id);
 assert.equal(reequipped.body!.chest.items.length,0);
 const same=await request('POST',path,owner,{
  kind:'equip',requestId:randomUUID(),expectedRevision:2,
  itemInstanceId:bag.id,slot:'back'
 });
 assert.equal(same.body!.error,'already_equipped');
 const concurrent=(await Promise.all([randomUUID(),randomUUID()].map(requestId=>
  request('POST',path,owner,{...cmd,requestId,expectedRevision:2})
 ))).sort((a,b)=>a.status-b.status);
 assert.deepEqual(concurrent.map(x=>x.status),[200,409]);
 const after=(await request('GET',path)).body!;
 assert.equal(after.revision,3);
 assert.equal(after.pack.maxSlots,4);
 assert.equal(after.chest.items.length,1);
 const coins=await db.query('SELECT coins FROM player_characters WHERE id=$1',[c.id]);
 assert.equal(Number(coins.rows[0].coins),20);
});
test('PostgreSQL enforces 10 equipped-bag slots, 4 bare slots and full chest',async()=>{
 const c=await character();
 const path=base+c.id+'/inventory';
 await db.query(
  "UPDATE player_characters SET tutorial_stage=8,tutorial_status='COMPLETED' WHERE id=$1",[c.id]);
 await db.query(
  'INSERT INTO player_character_tutorial_home(character_id,revision,state) VALUES($1,3,$2::jsonb)',
  [c.id,JSON.stringify({phase:'COMPLETE',revision:3})]);
 await db.query(
  "INSERT INTO pall_item_definitions(code,name,category,stackable,max_stack,weight_kg,volume_l,quality_min,quality_max) VALUES('test_needle','Test Needle','component',FALSE,1,.001,.001,1,1) ON CONFLICT DO NOTHING");
 for(let i=0;i<10;i++)
  await db.query(
   "INSERT INTO player_character_item_instances(character_id,item_code,location) VALUES($1,'test_needle','pack')",[c.id]);
 const waiting=randomUUID();
 await db.query(
  "INSERT INTO player_character_item_instances(id,character_id,item_code,location) VALUES($1,$2,'test_needle','home_chest')",
  [waiting,c.id]);
 const state=(await request('GET',path)).body!;
 assert.equal(state.pack.slotsUsed,10);
 assert.equal(state.pack.maxSlots,10);
 const denied=await request('POST',path,owner,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:0,
  itemInstanceId:waiting,quantity:1,to:'pack'
 });
 assert.equal(denied.body!.error,'pack_slots_exceeded');
 const bag=state.equipment.items.find((x:any)=>x.code==='crude_small_bag');
 assert.equal((await request('POST',path,owner,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:0,
  itemInstanceId:bag.id,quantity:1,to:'home_chest'
 })).body!.error,'pack_slots_exceeded');
 const chestFull=await db.query(
  "INSERT INTO player_character_item_instances(character_id,item_code,location) SELECT $1,'test_needle','home_chest' FROM generate_series(1,23)",
  [c.id]);
 assert.equal(chestFull.rowCount,23);
 const outfit=state.equipment.items.find((x:any)=>x.code==='basic_clothes');
 const blocked=await request('POST',path,owner,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:0,
  itemInstanceId:outfit.id,quantity:1,to:'home_chest'
 });
 assert.equal(blocked.body!.error,'chest_slots_exceeded');
 assert.equal((await request('GET',path)).body!.revision,0);
});
test('Stacking still splits and merges without duplication under equipment scheme',async()=>{
 const c=await character();
 const path=base+c.id+'/inventory';
 await db.query(
  "UPDATE player_characters SET tutorial_stage=8,tutorial_status='COMPLETED' WHERE id=$1",[c.id]);
 await db.query(
  'INSERT INTO player_character_tutorial_home(character_id,revision,state) VALUES($1,3,$2::jsonb)',
  [c.id,JSON.stringify({phase:'COMPLETE',revision:3})]);
 await db.query(
  "INSERT INTO pall_item_definitions(code,name,category,stackable,max_stack,weight_kg,volume_l,quality_min,quality_max) VALUES('test_rivet','Test Rivet','component',TRUE,10,.100,.020,1,1) ON CONFLICT DO NOTHING");
 const itemId=randomUUID();
 await db.query(
  "INSERT INTO player_character_item_instances(id,character_id,item_code,location,quantity) VALUES($1,$2,'test_rivet','home_chest',8)",
  [itemId,c.id]);
 const part=await request('POST',path,owner,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:0,
  itemInstanceId:itemId,quantity:3,to:'pack'
 });
 assert.equal(part.status,200,JSON.stringify(part.body));
 assert.equal(part.body!.chest.items.find((x:any)=>x.id===itemId).quantity,5);
 assert.equal(part.body!.pack.items.find((x:any)=>x.code==='test_rivet').quantity,3);
 const second=await request('POST',path,owner,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:1,
  itemInstanceId:itemId,quantity:5,to:'pack'
 });
 assert.equal(second.status,200,JSON.stringify(second.body));
 assert.equal(second.body!.pack.items.find((x:any)=>x.code==='test_rivet').quantity,8);
 assert.equal((await db.query(
  "SELECT sum(quantity)::int AS total FROM player_character_item_instances WHERE character_id=$1 AND item_code='test_rivet'",
  [c.id])).rows[0].total,8);
 await db.query(
  "INSERT INTO pall_item_definitions(code,name,category,stackable,max_stack,weight_kg,volume_l,quality_min,quality_max) VALUES('test_anvil','Test Anvil','component',FALSE,1,25,1,1,1) ON CONFLICT DO NOTHING");
 const heavyId=randomUUID();
 await db.query(
  "INSERT INTO player_character_item_instances(id,character_id,item_code,location) VALUES($1,$2,'test_anvil','home_chest')",
  [heavyId,c.id]);
 const heavy=await request('POST',path,owner,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:2,
  itemInstanceId:heavyId,quantity:1,to:'pack'
 });
 assert.equal(heavy.body!.error,'pack_capacity_exceeded');
 assert.equal((await request('GET',path)).body!.revision,2);
});

test('Equipment protection, weapon damage and maximum weight derive from equipped records',async()=>{
 const c=await character();
 const path=base+c.id+'/inventory';
 await db.query(
  "UPDATE player_characters SET tutorial_stage=8,tutorial_status='IN_PROGRESS' WHERE id=$1",[c.id]);
 await db.query(
  'INSERT INTO player_character_tutorial_home(character_id,revision,state) VALUES($1,0,$2::jsonb)',
  [c.id,JSON.stringify({phase:'HOME',revision:0})]);
 const first=(await request('GET',path)).body!;
 assert.deepEqual(first.bonuses,{
  armour:0,weaponDamage:null,pallProtection:0,ashProtection:0,
  maxWeightKg:20,inventorySlots:10,maxVolumeL:17
 });
 await db.query(
  `INSERT INTO pall_item_definitions(code,name,category,equip_slot,stackable,max_stack,
      weight_kg,volume_l,armour_rating,damage_rating,pall_protection,ash_protection,
      carry_weight_bonus_kg)
   VALUES('test_protective_mask','Protective Mask','equipment','face',FALSE,1,
      .4,.2,2,0,4,3,2) ON CONFLICT DO NOTHING`);
 await db.query(
  `INSERT INTO pall_item_definitions(code,name,category,equip_slot,stackable,max_stack,
      weight_kg,volume_l,damage_rating)
   VALUES('test_short_blade','Short Blade','weapon','primary_weapon',FALSE,1,
      .5,.2,9) ON CONFLICT DO NOTHING`);
 const mask=randomUUID(),weapon=randomUUID();
 await db.query(
  "INSERT INTO player_character_item_instances(id,character_id,item_code,location) VALUES($1,$3,'test_protective_mask','home_chest'),($2,$3,'test_short_blade','home_chest')",
  [mask,weapon,c.id]);
 const worn=await request('POST',path,owner,{
  kind:'equip',requestId:randomUUID(),expectedRevision:0,
  itemInstanceId:mask,slot:'face'
 });
 assert.equal(worn.status,200,JSON.stringify(worn.body));
 assert.deepEqual(worn.body!.bonuses,{
  armour:2,weaponDamage:null,pallProtection:4,ashProtection:3,
  maxWeightKg:22,inventorySlots:10,maxVolumeL:17
 });
 const armed=await request('POST',path,owner,{
  kind:'equip',requestId:randomUUID(),expectedRevision:1,
  itemInstanceId:weapon,slot:'primary_weapon'
 });
 assert.equal(armed.status,200,JSON.stringify(armed.body));
 assert.equal(armed.body!.bonuses.weaponDamage,9);
 assert.equal((await request('GET',path)).body!.bonuses.weaponDamage,9);
 const removed=await request('POST',path,owner,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:2,
  itemInstanceId:mask,quantity:1,to:'home_chest'
 });
 assert.equal(removed.status,200,JSON.stringify(removed.body));
 assert.deepEqual(removed.body!.bonuses,{
  armour:0,weaponDamage:9,pallProtection:0,ashProtection:0,
  maxWeightKg:20,inventorySlots:10,maxVolumeL:17
 });
 const refused=await request('POST',path,owner,{
  kind:'equip',requestId:randomUUID(),expectedRevision:3,
  itemInstanceId:mask,slot:'pants'
 });
 assert.equal(refused.status,400,'Composite clothing no longer exposes separate pants slot');
});
test('Stage 8 shared home: six Millhand route/outcome combinations complete once with no rewards',async()=>{
 for(const branch of ['restamp','contracts','records']){
  for(const outcome of ['player_victory','player_defeat']){
   const c=await character();
   const route=base+c.id+'/tutorial/home';
   await db.query(
     "UPDATE player_characters SET tutorial_stage=8,tutorial_status='NOT_STARTED',coins=10,current_health=50 WHERE id=$1",
     [c.id]
   );
   await db.query(
     'INSERT INTO player_character_missing_stamp(character_id,revision,state) VALUES($1,1,$2::jsonb)',
     [c.id,JSON.stringify({phase:'SELECTED',branch})]
   );
   await db.query(
     'INSERT INTO player_character_clinic(character_id,revision,state) VALUES($1,5,$2::jsonb)',
     [c.id,JSON.stringify({phase:'LEFT',revision:5,paid:true,outcome})]
   );
   const first=await request('GET',route);
   assert.equal(first.status,200,JSON.stringify(first.body));
   assert.equal(first.body!.needsStart,true);
   const startId=randomUUID();
   const startBody={kind:'start',requestId:startId};
   const opened=await request('POST',route,owner,startBody);
   assert.equal(opened.status,200,JSON.stringify(opened.body));
   assert.equal(opened.body!.phase,'HOME');
   assert.equal(opened.body!.branch,branch);
   assert.equal(opened.body!.outcome,outcome);
   assert.equal(opened.body!.homeId,'starter-rented-room');
   assert.equal(opened.body!.coins,10);
   assert.equal(opened.body!.rent,150);
   assert.equal(opened.body!.shortfall,140);
   assert.equal(opened.body!.noticeText,c.name+', you have to pay 150 coins in rent, or you are out. No discussion.');
   assert.equal((await request('POST',route,owner,startBody)).body!.revision,0,
     'Duplicate start returns exact prior receipt');
   assert.equal((await request('GET',route,stranger)).status,404);
   assert.equal((await request('GET',route,null)).status,401);
   const spoof=await request('POST',route,owner,{
     kind:'action',requestId:randomUUID(),expectedRevision:0,
     action:'finish',rent:0
   });
   assert.equal(spoof.status,400,'No client-defined rent or action shortcut');
   assert.equal((await request('POST',route,owner,{
     kind:'action',requestId:randomUUID(),expectedRevision:0,action:'finish'
   })).status,409,'Cannot skip straight to completion');
   let state=opened.body!;
   for(const retired of ['travel','enter']){
     assert.equal((await request('POST',route,owner,{
       kind:'action',requestId:randomUUID(),expectedRevision:0,action:retired
     })).status,400,'Removed city/door actions cannot be invoked by clients');
   }
   for(const [action,phase] of [
     ['read_notice','NOTICE'],['put_down','SPEECH'],['finish','COMPLETE']
   ]){
     const requestId=randomUUID();
     const body={kind:'action',requestId,expectedRevision:state.revision,action};
     const advanced=await request('POST',route,owner,body);
     assert.equal(advanced.status,200,JSON.stringify(advanced.body));
     state=advanced.body!;
     assert.equal(state.phase,phase);
     assert.equal((await request('POST',route,owner,body)).body!.revision,state.revision,
       'Same request does not advance twice');
     assert.equal((await request('GET',route)).body!.phase,phase,
       'Phase must survive server reload');
     assert.equal((await request('POST',route,owner,{
       kind:'action',requestId:randomUUID(),expectedRevision:state.revision-1,action
     })).status,409,'Stale revision cannot advance');
   }
   assert.equal(state.completed,true);
   assert.equal(state.revision,3);
   assert.equal((await request('POST',route,owner,{
     kind:'action',requestId:randomUUID(),expectedRevision:state.revision,action:'finish'
   })).status,409,'Cannot complete again');
   const finalChar=await db.query<{
     tutorial_stage:number;tutorial_status:string;coins:string|number;
     major_skill_bonuses:Record<string,number>;current_health:number
   }>('SELECT tutorial_stage,tutorial_status,coins,major_skill_bonuses,current_health FROM player_characters WHERE id=$1',[c.id]);
   assert.equal(finalChar.rows[0].tutorial_stage,8);
   assert.equal(finalChar.rows[0].tutorial_status,'COMPLETED');
   assert.equal(Number(finalChar.rows[0].coins),10,'Home makes no coin transaction');
   assert.deepEqual(finalChar.rows[0].major_skill_bonuses,{Craftsmanship:3,Industry:1});
   assert.equal(finalChar.rows[0].current_health,50,'No second healing');
   const savedClinic=await db.query<{state:Record<string,any>}>(
     'SELECT state FROM player_character_clinic WHERE character_id=$1',[c.id]);
   assert.equal(savedClinic.rows[0].state.outcome,outcome,'Clinic history is untouched');
  }
 }
});

test('Stage 8 bed Rest is persistent, replay-safe, and available after tutorial completion',async()=>{
 const c=await character();
 const route=base+c.id+'/tutorial/home';
 const discharge={hp:43,hpMax:50,stamina:12,composure:7,fatigue:94,
   stress:68,momentum:5,bleed:2,wounds:[{type:'cut',zone:'limbs'}]};
 await db.query(
   "UPDATE player_characters SET tutorial_stage=8,tutorial_status='NOT_STARTED',coins=10,current_health=43 WHERE id=$1",
   [c.id]
 );
 await db.query(
   'INSERT INTO player_character_missing_stamp(character_id,revision,state) VALUES($1,1,$2::jsonb)',
   [c.id,JSON.stringify({phase:'SELECTED',branch:'restamp'})]
 );
 await db.query(
   'INSERT INTO player_character_clinic(character_id,revision,state) VALUES($1,5,$2::jsonb)',
   [c.id,JSON.stringify({phase:'LEFT',revision:5,paid:true,
     outcome:'player_victory',after:discharge})]
 );
 const started=await request('POST',route,owner,{kind:'start',requestId:randomUUID()});
 assert.equal(started.status,200,JSON.stringify(started.body));
 assert.equal(started.body!.phase,'HOME');
 assert.deepEqual(started.body!.condition,
   {stamina:12,composure:7,fatigue:94,stress:68},
   'Real clinic discharge, not a fabricated reset, starts home resources');
 const spoof=await request('POST',route,owner,{
   kind:'action',requestId:randomUUID(),action:'rest',expectedRevision:0,
   stamina:999,health:999
 });
 assert.equal(spoof.status,400,'Client cannot set resource amounts');
 const key=randomUUID();
 const command={kind:'action',requestId:key,action:'rest',expectedRevision:0};
 const rested=await request('POST',route,owner,command);
 assert.equal(rested.status,200,JSON.stringify(rested.body));
 assert.deepEqual(rested.body!.condition,
   {stamina:100,composure:100,fatigue:0,stress:0});
 assert.equal(rested.body!.phase,'HOME');
 assert.equal(rested.body!.revision,1);
 assert.equal((await request('POST',route,owner,command)).body!.revision,1,
   'A replay of the same Rest request must not create an extra turn');
 assert.equal((await request('POST',route,owner,{
   ...command,requestId:randomUUID()
 })).status,409,'A stale request must never mutate saved Rest');
 assert.deepEqual((await request('GET',route)).body!.condition,
   {stamina:100,composure:100,fatigue:0,stress:0},
   'Rest must survive reload from PostgreSQL');
 assert.equal((await request('POST',route,stranger,{
   kind:'action',requestId:randomUUID(),expectedRevision:1,action:'rest'
 })).status,404,'Another account cannot rest this character');
 let rev=1;
 for(const action of ['read_notice','put_down','finish']){
   const reply=await request('POST',route,owner,{
     kind:'action',requestId:randomUUID(),action,expectedRevision:rev
   });
   assert.equal(reply.status,200,JSON.stringify(reply.body));
   rev=reply.body!.revision;
 }
 assert.equal(rev,4);
 assert.equal((await request('GET',route)).body!.completed,true);
 const afterComplete=await request('POST',route,owner,{
   kind:'action',requestId:randomUUID(),expectedRevision:rev,action:'rest'
 });
 assert.equal(afterComplete.status,200,JSON.stringify(afterComplete.body));
 assert.equal(afterComplete.body!.phase,'COMPLETE');
 assert.equal(afterComplete.body!.completed,true);
 assert.equal(afterComplete.body!.revision,5);
 assert.deepEqual(afterComplete.body!.condition,
   {stamina:100,composure:100,fatigue:0,stress:0});
 assert.equal((await request('POST',route,owner,{
   kind:'action',requestId:randomUUID(),expectedRevision:5,action:'finish'
 })).status,409,'Bed rest never reopens an already completed tutorial');
 const char=await db.query<{current_health:number;coins:string|number;
   tutorial_status:string;tutorial_stage:number}>(
   'SELECT current_health,coins,tutorial_status,tutorial_stage FROM player_characters WHERE id=$1',
   [c.id]
 );
 assert.equal(char.rows[0].current_health,43,'Rest is not Health healing');
 assert.equal(Number(char.rows[0].coins),10,'Rest has no coin side effect');
 assert.equal(char.rows[0].tutorial_status,'COMPLETED');
 assert.equal(char.rows[0].tutorial_stage,8);
 const clinic=await db.query<{state:{after:typeof discharge}}>(
   'SELECT state FROM player_character_clinic WHERE character_id=$1',[c.id]
 );
 assert.deepEqual(clinic.rows[0].state.after,discharge,
   'Rest cannot alter injuries or Stage 7 clinic history');
});

test('Stage 8 refuses entry without completed clinic or earlier tutorial state',async()=>{
 const c=await character();
 const route=base+c.id+'/tutorial/home';
 assert.equal((await request('GET',route)).status,409);
 await db.query(
   "UPDATE player_characters SET tutorial_stage=8,tutorial_status='NOT_STARTED' WHERE id=$1",[c.id]);
 assert.equal((await request('POST',route,owner,{kind:'start',requestId:randomUUID()})).status,409);
 assert.equal((await request('GET',route)).status,409);
});

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

test('Combat rules report exact unarmed ranges and saved Chronicle action identities',async()=>{
  const c=await character(owner,'brace');
  const initial=await start(c);
  assert.equal(initial.rules.weaponLabel,'Unarmed — fists');
  assert.equal(initial.rules.unarmed,true);
  assert.deepEqual(initial.rules.strikeDamage,{min:4,max:8});
  assert.deepEqual(initial.rules.techniqueDamage,{min:8,max:12});
  assert.deepEqual(initial.rules.accuracy,{head:40,torso:70,limbs:55});
  assert.equal(initial.rules.openingDamageBonus,0);
  assert.equal(initial.rules.guardMitigationPercent,'30–60');
  assert.equal(initial.rules.guardReductionMinPercent,30);
  assert.equal(initial.rules.guardReductionMaxPercent,60);
  assert.deepEqual(initial.rules.enemyStrikeDamage,{min:14,max:17});
  assert.deepEqual(initial.rules.guardedEnemyStrikeDamage,{min:6,max:12});
  assert.equal(initial.rules.repositionUsesDistance,true);
  const guarded=await turn(c,initial,{type:'guard'});
  assert.equal(guarded.status,200,JSON.stringify(guarded.body));
  const playerGuard=guarded.body!.turnEvents.find((e:any)=>
    e.kind==='guard'&&e.actor==='player');
  assert.equal(playerGuard?.actionType,'guard');
  const foeAction=guarded.body!.turnEvents.find((e:any)=>
    e.actor==='enemy'&&['damage','miss','guard','move','technique'].includes(e.kind));
  if(foeAction){
    assert.ok(['attack','technique','guard','move'].includes(foeAction.actionType),
      'Enemy actions need their genuine saved type, not guessed labels');
    if(foeAction.kind==='damage'||foeAction.kind==='miss')
      assert.ok(['torso','head','limbs'].includes(foeAction.actionDetail),
        'An actual enemy strike must identify its target');
  }
  const persisted=await request('GET',c.path);
  assert.equal(persisted.status,200);
  assert.deepEqual(persisted.body!.events,guarded.body!.events,
    'Action metadata remains part of saved combat history across reloads');
  const recovered=await turn(c,guarded.body!,{type:'recover',mode:'breath'});
  assert.equal(recovered.status,200,JSON.stringify(recovered.body));
  assert.ok(recovered.body!.turnEvents.some((e:any)=>
    e.kind==='recovery'&&e.actor==='player'&&
    e.actionType==='recover'&&e.actionDetail==='breath'),
    'Recovery must carry its actual actor and option, not an inferred generic tag');
});

test('Focused Stance is an authenticated, replay-safe action with visible three-turn accuracy',async()=>{
  const c=await character(owner,'brace');
  let initial=await start(c);
  assert.equal(initial.rules.focus.cost,10);
  assert.equal(initial.rules.focus.duration,3);
  assert.equal(initial.rules.focus.accuracyBonusPercent,10);
  assert.equal(initial.rules.focus.remaining,0);
  assert.ok(initial.legalActions.includes('focus'));
  const malformed=await turn(c,initial,{type:'focus',accuracyBonusPercent:99});
  assert.equal(malformed.status,400,'No client-controlled focus duration or accuracy');
  assert.equal((await request('GET',c.path)).body!.revision,initial.revision);
  // A guarding enemy produces no attack-triggered Opening during activation.
  await db.query(
    "UPDATE player_character_flint_combat SET state=jsonb_set(state,'{intent}',$2::jsonb) WHERE character_id=$1",
    [c.id,JSON.stringify({type:'guard',speed:10,signal:'watchful',
      tell:'Flint holds his guard while watching you.'})]
  );
  initial=(await request('GET',c.path)).body!;
  const activated=await turn(c,initial,{type:'focus'});
  assert.equal(activated.status,200,JSON.stringify(activated.body));
  const focused=activated.body!;
  assert.equal(focused.player.composure,initial.player.composure-10);
  assert.equal(focused.player.stamina,initial.player.stamina);
  assert.equal(focused.rules.focus.remaining,3);
  assert.equal(focused.player.focusedTurnsRemaining,3);
  assert.equal(focused.rules.accuracy.torso,80);
  assert.ok(!focused.legalActions.includes('focus'),'Cannot restack Focused Stance');
  assert.ok(focused.turnEvents.some((e:any)=>
    e.kind==='focus'&&e.actor==='player'&&e.actionType==='focus'&&
    e.actionName===undefined),'Chronicle stores the truthful focus action type');
  assert.equal((await request('GET',c.path)).body!.rules.focus.remaining,3);
  const blocked=await turn(c,focused,{type:'focus'});
  assert.equal(blocked.status,422);
  assert.equal((await request('GET',c.path)).body!.revision,focused.revision);
  const guarded=await turn(c,focused,{type:'guard'});
  assert.equal(guarded.status,200,JSON.stringify(guarded.body));
  assert.equal(guarded.body!.rules.focus.remaining,2);
  assert.equal(guarded.body!.player.composure,focused.player.composure);
});

test('Fatigue legal actions and server accuracy match committed saves at 70, 100 and zero Stamina',async()=>{
  const c=await character(owner,'brace');
  await start(c);
  await db.query(
    "UPDATE player_character_flint_combat SET state=jsonb_set(state,'{player,fatigue}','70'::jsonb) WHERE character_id=$1",
    [c.id]
  );
  let snapshot=(await request('GET',c.path)).body!;
  assert.deepEqual(snapshot.legalActions,['move','recover'],
    'At 70 the API must not advertise Attack, Guard or Press Advantage');
  assert.equal(snapshot.rules.fatigue.currentAccuracyLoss,21);
  assert.equal(snapshot.rules.accuracy.torso,49,'70 Fatigue changes actual accuracy');
  const invalid=await turn(c,snapshot,{type:'attack',zone:'torso'});
  assert.equal(invalid.status,422);
  assert.equal((await request('GET',c.path)).body!.revision,snapshot.revision,
    'A forbidden action must not change the saved round');
  let recovered=await turn(c,snapshot,{type:'recover',mode:'breath'});
  assert.equal(recovered.status,200,JSON.stringify(recovered.body));
  assert.equal(recovered.body!.player.fatigue,40);
  assert.equal(recovered.body!.player.stamina,Math.min(100,snapshot.player.stamina+10));
  assert.equal(recovered.body!.rules.fatigue.recovery,15,
    'Below 50 Fatigue, the next recovery uses the lower-Fatigue tier');
  assert.ok(recovered.body!.legalActions.includes('guard'));
  assert.ok(recovered.body!.legalActions.includes('attack'));
  await db.query(
    "UPDATE player_character_flint_combat SET state=jsonb_set(state,'{player,fatigue}','100'::jsonb) WHERE character_id=$1",
    [c.id]
  );
  snapshot=(await request('GET',c.path)).body!;
  assert.deepEqual(snapshot.legalActions,['recover']);
  assert.equal((await turn(c,snapshot,{type:'move',to:'side'})).status,422);
  recovered=await turn(c,snapshot,{type:'recover',mode:'nerves'});
  assert.equal(recovered.status,200,JSON.stringify(recovered.body));
  assert.equal(recovered.body!.player.fatigue,70);
  assert.deepEqual(recovered.body!.legalActions,['move','recover']);

  // Old stored intent from before the lock must not execute for a tired NPC.
  await db.query(
    "UPDATE player_character_flint_combat SET state=jsonb_set(state,'{enemy,fatigue}','100'::jsonb) WHERE character_id=$1",
    [c.id]
  );
  snapshot=(await request('GET',c.path)).body!;
  assert.equal(snapshot.intentType,'exhausted');
  assert.match(snapshot.enemyIntent,/breathes hard/);
  const enemyRest=await turn(c,snapshot,{type:'recover',mode:'breath'});
  assert.equal(enemyRest.status,200,JSON.stringify(enemyRest.body));
  assert.equal(enemyRest.body!.enemy.fatigue,70);
  assert.ok(!enemyRest.body!.turnEvents.some((e:any)=>
    e.actor==='enemy'&&e.kind==='damage'),
    'An old NPC attack cannot bypass exhausted-state restrictions');

  const other=await character(owner,'brace');
  await start(other);
  await db.query(
    "UPDATE player_character_flint_combat SET state=jsonb_set(jsonb_set(state,'{player,stamina}','0'::jsonb),'{player,fatigue}','69'::jsonb) WHERE character_id=$1",
    [other.id]
  );
  snapshot=(await request('GET',other.path)).body!;
  assert.equal(snapshot.rules.fatigue.currentAccuracyLoss,18);
  const overdraft=await turn(other,snapshot,{type:'attack',zone:'torso'});
  assert.equal(overdraft.status,200,JSON.stringify(overdraft.body));
  assert.equal(overdraft.body!.player.stamina,0);
  assert.equal(overdraft.body!.player.fatigue,79,
    'Starting at zero Stamina adds 10 Fatigue to an Attack');
  assert.deepEqual(overdraft.body!.legalActions,['move','recover']);
});

test('Server projection uses the same Recover tier shown in the browser, including 49/50 boundary',async()=>{
  const c=await character(owner,'brace');
  await start(c);
  for(const [before,removed,restored] of [
    [49,15,20],[50,30,10],[100,30,10]
  ]){
    await db.query(
      "UPDATE player_character_flint_combat SET state=jsonb_set(jsonb_set(state,'{player,fatigue}',$2::jsonb),'{player,stamina}','0'::jsonb) WHERE character_id=$1",
      [c.id,JSON.stringify(before)]
    );
    const prior=(await request('GET',c.path)).body!;
    assert.equal(prior.rules.recoverStamina,restored);
    assert.equal(prior.rules.fatigue.recovery,removed);
    assert.equal(prior.rules.fatigue.recoveryThreshold,50);
    const result=await turn(c,prior,{type:'recover',mode:'breath'});
    assert.equal(result.status,200,JSON.stringify(result.body));
    assert.equal(result.body!.player.fatigue,Math.max(0,before-removed));
    assert.equal(result.body!.player.stamina,restored);
    const recovery=result.body!.turnEvents.find((e:any)=>e.kind==='recovery'&&e.actor==='player');
    assert.equal(recovery?.fatigueRemoved,removed);
    assert.equal(recovery?.staminaRestored,restored);
    assert.equal(recovery?.fatigueBefore,before);
  }
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
  const {state}=await outcomeWith(()=>({type:'attack',zone:'torso'}),1);
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


async function seedStageThreeRouteForHome(c:{id:string}){
  // The generic Stage 6 combat fixture starts at combat and has no genuine
  // Stage 3 investigation; the home API correctly requires a saved choice.
  await db.query(
    'INSERT INTO player_character_missing_stamp(character_id,revision,state) VALUES($1,1,$2::jsonb)',
    [c.id,JSON.stringify({phase:'SELECTED',branch:'restamp'})]
  );
}

test('Back to Stage 7 preserves the 10-coin clinic fee and Flint fight',async()=>{
  const {c}=await outcomeWith(()=>({type:'guard'}));
  const priced=await completeExamination(c);
  const paid=await clinicAdvance(c,priced,'pay');
  const left=await clinicAdvance(c,paid,'leave');
  assert.equal(left.phase,'LEFT');
  const endpoint=base+c.id+'/dev/rewind-stage';
  const options=await request('GET',endpoint);
  assert.equal(options.status,200);
  assert.deepEqual(options.body,{
    enabled:true,canRewind:true,stage:8,targetStage:7
  });
  assert.equal((await devRewind(c,7)).status,409,
    'An outdated Stage 7 request cannot bypass the completed clinic boundary');
  const rewind=await devRewind(c,8);
  assert.equal(rewind.status,200,JSON.stringify(rewind.body));
  assert.equal(rewind.body!.stage,7);
  assert.equal(rewind.body!.route,'/characters/'+c.id+'/millhand/clinic');
  assert.equal(rewind.body!.coinDelta,0,'A paid clinic must not be refunded');
  assert.equal((await devRewind(c,8)).status,409,'Rewinding cannot happen twice');
  const char=await db.query<{coins:string;current_health:number;tutorial_status:string;tutorial_stage:number}>(
    'SELECT coins,current_health,tutorial_status,tutorial_stage FROM player_characters WHERE id=$1',[c.id]
  );
  assert.equal(Number(char.rows[0].coins),10);
  assert.equal(char.rows[0].current_health,50);
  assert.equal(char.rows[0].tutorial_status,'IN_PROGRESS');
  assert.equal(char.rows[0].tutorial_stage,7);
  assert.equal((await request('GET',c.path)).body!.status,'finished',
    'Flint combat remains immutable');
  const clinic=await request('GET',base+c.id+'/millhand/clinic');
  assert.equal(clinic.status,200);
  assert.equal(clinic.body!.phase,'PAID','Travel Home must be available again');
  assert.equal(clinic.body!.paid,true);
  assert.equal(clinic.body!.coins,10);
  const travel=await clinicAdvance(c,clinic.body!,'leave');
  assert.equal(travel.phase,'LEFT');
  await seedStageThreeRouteForHome(c);
  const home=await request('POST',base+c.id+'/tutorial/home',owner,{
    kind:'start',requestId:randomUUID()
  });
  assert.equal(home.status,200,JSON.stringify(home.body));
  assert.equal(home.body!.phase,'HOME','Home always opens directly in the room');
});

test('Stage 8 rewind blocks mismatched progress or clinic records without changing coins',async()=>{
  const {c}=await outcomeWith(()=>({type:'guard'}));
  const priced=await completeExamination(c);
  const paid=await clinicAdvance(c,priced,'pay');
  await clinicAdvance(c,paid,'leave');
  const endpoint=base+c.id+'/dev/rewind-stage';
  // Missing Stage 8 state cannot be presented as an in-progress scene.
  await db.query(
    "UPDATE player_characters SET tutorial_status='IN_PROGRESS' WHERE id=$1",[c.id]
  );
  assert.equal((await request('GET',endpoint)).body!.canRewind,true,
    'Capability is visible but actual saved-state consistency is checked under the transaction lock');
  const invalid=await devRewind(c,8);
  assert.equal(invalid.status,409);
  assert.equal(invalid.body?.error,'unsafe_home_state');
  await db.query(
    "UPDATE player_characters SET tutorial_status='NOT_STARTED' WHERE id=$1",[c.id]
  );
  await db.query(
    "UPDATE player_character_clinic SET state=jsonb_set(state,'{phase}','\"PAID\"'::jsonb) WHERE character_id=$1",
    [c.id]
  );
  assert.equal((await request('GET',endpoint)).body!.canRewind,false);
  const blocked=await devRewind(c,8);
  assert.equal(blocked.status,409);
  assert.equal(blocked.body?.error,'unsafe_clinic_state');
  assert.equal((await request('GET',c.path)).body!.status,'finished');
  assert.equal((await request('GET',base+c.id+'/millhand/clinic')).body!.coins,10);
});

test('Stage 8 Back to Stage 7 works during notice reading and after completion',async()=>{
 for(const complete of [false,true]){
   const {c}=await outcomeWith(()=>({type:'guard'}));
   const priced=await completeExamination(c);
   const paid=await clinicAdvance(c,priced,'pay');
   await clinicAdvance(c,paid,'leave');
   const route=base+c.id+'/tutorial/home';
   await seedStageThreeRouteForHome(c);
   const initial=await request('POST',route,owner,{kind:'start',requestId:randomUUID()});
   assert.equal(initial.status,200);
   const noticed=await request('POST',route,owner,{
     kind:'action',requestId:randomUUID(),expectedRevision:0,action:'read_notice'
   });
   assert.equal(noticed.body!.phase,'NOTICE');
   if(complete){
     const spoken=await request('POST',route,owner,{
       kind:'action',requestId:randomUUID(),expectedRevision:1,action:'put_down'
     });
     assert.equal(spoken.body!.phase,'SPEECH');
     const finished=await request('POST',route,owner,{
       kind:'action',requestId:randomUUID(),expectedRevision:2,action:'finish'
     });
     assert.equal(finished.body!.phase,'COMPLETE');
   }
   const cap=await request('GET',base+c.id+'/dev/rewind-stage');
   assert.equal(cap.body!.targetStage,7);
   assert.equal(cap.body!.canRewind,true);
   const res=await devRewind(c,8);
   assert.equal(res.status,200,JSON.stringify(res.body));
   assert.equal(res.body!.stage,7);
   const char=await db.query<{coins:string;tutorial_status:string}>(
     'SELECT coins,tutorial_status FROM player_characters WHERE id=$1',[c.id]
   );
   assert.equal(Number(char.rows[0].coins),10);
   assert.equal(char.rows[0].tutorial_status,'IN_PROGRESS');
   assert.equal((await request('GET',c.path)).body!.status,'finished');
   const fromClinic=await request('GET',base+c.id+'/millhand/clinic');
   assert.equal(fromClinic.body!.phase,'PAID');
   assert.equal((await request('GET',route)).status,409,
     'Old completed Stage 8 is erased and inaccessible until clinic departure');
 }
});
