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
  '0011_inventory_foundation.sql'
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
        "INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location) VALUES($1,$2,'Legacy Owner',$3,'Male','Millhand','{}'::jsonb,'[]'::jsonb,'Smithing workshop')",
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

test('Inventory migration backfills existing characters and never duplicates universal grants',async()=>{
 const rows=await db.query<{item_code:string;quantity:number;location:string}>(
  'SELECT item_code,quantity,location FROM player_character_item_instances WHERE character_id=$1 ORDER BY item_code',
  [legacyInventoryId]);
 assert.deepEqual(rows.rows.map(x=>[x.item_code,x.quantity,x.location]),[
  ['basic_clothes',1,'pack'],['crude_small_bag',1,'pack']
 ]);
 await db.query('SELECT pall_seed_character_inventory($1)',[legacyInventoryId]);
 await db.query('SELECT pall_seed_character_inventory($1)',[legacyInventoryId]);
 const repeated=await db.query(
  'SELECT count(*)::int AS count FROM player_character_item_instances WHERE character_id=$1',
  [legacyInventoryId]);
 assert.equal(repeated.rows[0].count,2);
 const char=await db.query('SELECT coins FROM player_characters WHERE id=$1',[legacyInventoryId]);
 assert.equal(Number(char.rows[0].coins),20,'Migration must preserve coins');
});
test('New characters of all six origins receive exactly the same owned starter kit',async()=>{
 for(const origin of ['Millhand','Bellrunner','Squatter','Stitcher','Scrapper','Inkbound']){
  const id=randomUUID();
  await db.query(
   'INSERT INTO player_characters(id,account_id,name,name_key,sex,origin,major_skill_bonuses,starter_item_requirements,starting_location) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9)',
   [id,owner,'Inventory '+origin,'inventory-'+id,'Female',origin,
    JSON.stringify({}),JSON.stringify([{name:'Basic Clothes',quantity:1},
     {name:'Crude Small Bag',quantity:1}]),'Origin tutorial']
  );
  const grants=await db.query<{item_code:string;quantity:number}>(
   'SELECT item_code,quantity FROM player_character_item_instances WHERE character_id=$1 ORDER BY item_code',[id]);
  assert.deepEqual(grants.rows.map(x=>[x.item_code,x.quantity]),[
   ['basic_clothes',1],['crude_small_bag',1]
  ]);
  const state=await db.query('SELECT revision FROM player_character_inventory_state WHERE character_id=$1',[id]);
  assert.equal(Number(state.rows[0].revision),0);
  await db.query('DELETE FROM player_characters WHERE id=$1',[id]);
  assert.equal((await db.query(
    'SELECT 1 FROM player_character_item_instances WHERE character_id=$1',[id])).rowCount,0,
    'Deleting a character deletes their owned items, not other accounts');
 }
});
test('Inventory API restricts ownership and keeps chest closed before shared home',async()=>{
 const c=await character();
 const path=base+c.id+'/inventory';
 const response=await request('GET',path);
 assert.equal(response.status,200,JSON.stringify(response.body));
 assert.equal(response.body!.revision,0);
 assert.equal(response.body!.storageEnabled,false);
 assert.equal(response.body!.pack.items.length,2);
 assert.equal(response.body!.pack.maxWeightKg,20);
 assert.equal(response.body!.pack.maxVolumeL,17);
 assert.equal(response.body!.chest.items.length,0);
 assert.equal((await request('GET',path,stranger)).status,404);
 assert.equal((await request('GET',path,null)).status,401);
 const item=response.body!.pack.items[0];
 assert.equal((await request('POST',path,stranger,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:0,
  itemInstanceId:item.id,quantity:1,to:'home_chest'
 })).status,404);
 assert.equal((await request('POST',path,owner,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:0,
  itemInstanceId:item.id,quantity:1,to:'home_chest'
 })).body!.error,'storage_not_unlocked');
 assert.equal((await request('GET',path)).body!.revision,0);
});
test('Home chest saves real transfers and blocks double-clicks, capacity, spoofing and stale revisions',async()=>{
 const c=await character();
 const path=base+c.id+'/inventory';
 await db.query(
  "UPDATE player_characters SET tutorial_stage=8,tutorial_status='IN_PROGRESS' WHERE id=$1",
  [c.id]);
 await db.query(
  "INSERT INTO player_character_tutorial_home(character_id,revision,state) VALUES($1,0,$2::jsonb)",
  [c.id,JSON.stringify({phase:'HOME',revision:0})]);
 let snapshot=(await request('GET',path)).body!;
 assert.equal(snapshot.storageEnabled,true);
 const bag=snapshot.pack.items.find((x:any)=>x.code==='crude_small_bag');
 const key=randomUUID();
 const cmd={kind:'transfer',requestId:key,expectedRevision:0,
   itemInstanceId:bag.id,quantity:1,to:'home_chest'};
 const moved=await request('POST',path,owner,cmd);
 assert.equal(moved.status,200,JSON.stringify(moved.body));
 assert.equal(moved.body!.revision,1);
 assert.equal(moved.body!.pack.maxVolumeL,5);
 assert.equal(moved.body!.chest.items[0].id,bag.id);
 assert.deepEqual((await request('POST',path,owner,cmd)).body,moved.body,
  'Idempotent request must replay original receipt without a second transfer');
 assert.equal((await request('GET',path)).body!.chest.items.length,1,
  'Stored items survive API reload');
 assert.equal((await request('POST',path,owner,{
  ...cmd,requestId:key,to:'pack'
 })).body!.error,'idempotency_key_reuse');
 assert.equal((await request('POST',path,owner,{
  ...cmd,requestId:randomUUID()
 })).body!.error,'stale_revision');
 assert.equal((await request('POST',path,owner,{
  ...cmd,requestId:randomUUID(),expectedRevision:1,qualityTier:5
 })).status,400,'Client cannot forge item quality or grant new items');
 assert.equal((await request('POST',path,owner,{
  ...cmd,requestId:randomUUID(),expectedRevision:1,quantity:10,to:'pack'
 })).body!.error,'insufficient_quantity');
 const taken=await request('POST',path,owner,{
  ...cmd,requestId:randomUUID(),expectedRevision:1,to:'pack'
 });
 assert.equal(taken.status,200,JSON.stringify(taken.body));
 assert.equal(taken.body!.revision,2);
 assert.equal(taken.body!.pack.maxVolumeL,17);
 assert.equal(taken.body!.pack.items.length,2);
 assert.equal(taken.body!.chest.items.length,0);
 // Two independent tabs submit the same revision with distinct IDs.
 const concurrent=(await Promise.all([randomUUID(),randomUUID()].map(requestId=>
   request('POST',path,owner,{
     ...cmd,requestId,expectedRevision:2,to:'home_chest'
   })
 ))).sort((a,b)=>a.status-b.status);
 assert.deepEqual(concurrent.map(x=>x.status),[200,409],
   'Only one simultaneous transfer may commit');
 const afterRace=(await request('GET',path)).body!;
 assert.equal(afterRace.revision,3);
 assert.equal(afterRace.chest.items.length,1);
 assert.equal(afterRace.pack.items.length,1);
 const storedCoins=await db.query('SELECT coins FROM player_characters WHERE id=$1',[c.id]);
 assert.equal(Number(storedCoins.rows[0].coins),20,'No money changed through storage');
});
test('Stacked generic items split and merge without minting quantities or bypassing capacity',async()=>{
 const c=await character();
 const path=base+c.id+'/inventory';
 await db.query(
  "UPDATE player_characters SET tutorial_stage=8,tutorial_status='COMPLETED' WHERE id=$1",
  [c.id]);
 await db.query(
  'INSERT INTO player_character_tutorial_home(character_id,revision,state) VALUES($1,3,$2::jsonb)',
  [c.id,JSON.stringify({phase:'COMPLETE',revision:3})]);
 await db.query(
  "INSERT INTO pall_item_definitions(code,name,category,stackable,max_stack,weight_kg,volume_l,quality_min,quality_max) VALUES('test_rivet','Test Rivet','component',TRUE,10,.100,.020,1,1) ON CONFLICT DO NOTHING");
 const itemId=randomUUID();
 await db.query(
  "INSERT INTO player_character_item_instances(id,character_id,item_code,location,quantity) VALUES($1,$2,'test_rivet','home_chest',8)",
  [itemId,c.id]);
 let state=(await request('GET',path)).body!;
 assert.equal(state.chest.items.find((x:any)=>x.id===itemId).quantity,8);
 const part=await request('POST',path,owner,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:0,
  itemInstanceId:itemId,quantity:3,to:'pack'
 });
 assert.equal(part.status,200,JSON.stringify(part.body));
 assert.equal(part.body!.revision,1);
 assert.equal(part.body!.chest.items.find((x:any)=>x.id===itemId).quantity,5);
 let carry=part.body!.pack.items.find((x:any)=>x.code==='test_rivet');
 assert.equal(carry.quantity,3);
 const second=await request('POST',path,owner,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:1,
  itemInstanceId:itemId,quantity:5,to:'pack'
 });
 assert.equal(second.status,200,JSON.stringify(second.body));
 assert.equal(second.body!.pack.items.find((x:any)=>x.code==='test_rivet').quantity,8);
 assert.equal(second.body!.chest.items.filter((x:any)=>x.code==='test_rivet').length,0);
 assert.equal((await db.query(
  "SELECT sum(quantity)::int AS total FROM player_character_item_instances WHERE character_id=$1 AND item_code='test_rivet'",
  [c.id])).rows[0].total,8);
 await db.query(
  "INSERT INTO pall_item_definitions(code,name,category,stackable,max_stack,weight_kg,volume_l,quality_min,quality_max) VALUES('test_anvil','Test Anvil','component',FALSE,1,25,1,1,1) ON CONFLICT DO NOTHING");
 const heavyId=randomUUID();
 await db.query(
  "INSERT INTO player_character_item_instances(id,character_id,item_code,location,quantity) VALUES($1,$2,'test_anvil','home_chest',1)",
  [heavyId,c.id]);
 const blocked=await request('POST',path,owner,{
  kind:'transfer',requestId:randomUUID(),expectedRevision:2,
  itemInstanceId:heavyId,quantity:1,to:'pack'
 });
 assert.equal(blocked.status,409);
 assert.equal(blocked.body!.error,'pack_capacity_exceeded');
 assert.equal((await request('GET',path)).body!.revision,2);
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
