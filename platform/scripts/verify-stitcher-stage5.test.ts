import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {INITIAL_STITCHER,applyStitcherAction,stitcherActions,StitcherInvalidAction,
  type StitcherState,type StitcherAction} from '../apps/api/src/stitcher-work.ts';
import {stage5JournalEntries} from '../apps/web/src/lib/stitcher-stage5-journal.ts';
import {stitcherSceneEnvironment} from '../apps/web/src/lib/stitcher-scene-environment.ts';

function run(s:StitcherState,...actions:StitcherAction[]){
 return actions.reduce((state,action)=>applyStitcherAction(state,action),s);
}
function fromJob(branch:'trolley'|'consent'|'notes'){
 // Stage IV's already-proved branch finding exists before the first Stage V click.
 return run({...INITIAL_STITCHER,stage:4,phase:'finish',branch,revision:39},'finish_job');
}
const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('all Stage IV findings reach an empty side-ward bed before the corridor',()=>{
 for(const branch of ['trolley','consent','notes'] as const){
  const s=fromJob(branch);
  assert.equal(s.stage,5);
  assert.equal(s.phase,'exited');
  assert.equal(s.stage5Witnessed,false);
  assert.equal(s.stage5Preparation,null);
  assert.deepEqual(stitcherActions(s),['ask_attendant']);
  assert.equal(stitcherSceneEnvironment(s.stage,s.branch,s.phase),'ward');
  assert.deepEqual(stage5JournalEntries(s),[
   "I came back to the side ward, and the man's bed was empty. The sheets were still warm."
  ]);
  assert.throws(()=>applyStitcherAction(s,'continue_hold'),StitcherInvalidAction);
 }
});

test('one investigation, witnessed refusal and Matron hold precede any encounter',()=>{
 for(const branch of ['trolley','consent','notes'] as const){
  for(const [choice,record] of [
   ['check_transfer','papers'],['fetch_claudia','claudia'],['use_finding','evidence']
  ] as const){
   let s=run(fromJob(branch),'ask_attendant','continue_attendant','continue_attendant');
   assert.equal(s.phase,'investigate');
   assert.equal(stitcherSceneEnvironment(5,branch,s.phase),'ward');
   s=run(s,choice);
   assert.equal(s.stage5Choice,record);
   assert.equal(s.phase,'witness');
   assert.equal(s.stage5Witnessed,false);
   assert.throws(()=>applyStitcherAction(s,'continue_hold'),StitcherInvalidAction);
   s=run(s,'continue_witness','continue_witness');
   assert.equal(s.phase,'hold');
   assert.equal(s.stage5Witnessed,true);
   assert.equal(s.stage5Hold,false);
   assert.equal(stitcherSceneEnvironment(5,branch,s.phase),'ward');
   const journal=stage5JournalEntries(s).join('\n');
   assert.match(journal,/He promised not to let anyone move the trolley/);
   assert.match(journal,/At least someone else is standing up for him now/);
   if(record==='evidence')assert.ok(journal.includes(
    branch==='trolley'?'contract number':branch==='consent'?'disputed consent form':'surgeon\'s notes'
   ));
   else assert.ok(journal.includes(record==='papers'?'Nobody had signed':'She wasn\'t happy'));
   s=run(s,'continue_hold');
   assert.equal(s.stage5Hold,true);
   assert.equal(s.phase,'door');
   assert.equal(stitcherSceneEnvironment(5,branch,s.phase),'corridor');
   assert.throws(()=>applyStitcherAction(s,'fetch_claudia'),StitcherInvalidAction);
  }
 }
});

test('each of three doorway preparations persists without simulating Stage VI combat',()=>{
 for(const branch of ['trolley','consent','notes'] as const)
 for(const [choice,preparation] of [
  ['reason_owler','reason'],['move_cart','cart'],['brace_door','brace']
 ] as const){
  let s=run(fromJob(branch),'ask_attendant','continue_attendant','continue_attendant',
   'use_finding','continue_witness','continue_witness','continue_hold',
   'continue_owler','continue_owler','continue_owler');
  assert.equal(s.phase,'prepare_door');
  assert.deepEqual(stitcherActions(s),['reason_owler','move_cart','brace_door']);
  s=run(s,choice);
  assert.equal(s.stage5Preparation,preparation);
  assert.equal(s.phase,'door_reply');
  s=run(s,'continue_door');
  if(preparation==='reason')s=run(s,'continue_door');
  assert.equal(s.phase,'fight_ready');
  assert.equal(s.stage,5);
  assert.equal(s.stage5Witnessed,true);
  assert.equal(s.stage5Hold,true);
  assert.deepEqual(stitcherActions(s),[],'Stage VI cannot be faked by Stage V');
  assert.throws(()=>applyStitcherAction(s,'continue_door'),StitcherInvalidAction);
  const entries=stage5JournalEntries(s);
  assert.equal(entries.filter(x=>x.startsWith('I tried explaining')||
    x.startsWith('I pushed an empty')||x.startsWith('I stood in')).length,1);
 }
});

test('the UI uses the two correct paintings and approved standing Owler artwork',()=>{
 const scene=read('apps/web/src/lib/StitcherWardScene.svelte');
 const page=read('apps/web/src/routes/characters/[id]/stitcher/ward/+page.svelte');
 const env=read('apps/web/src/lib/stitcher-scene-environment.ts');
 const routes=read('apps/api/src/stitcher-ward-routes.ts');
 assert.ok(scene.includes("stitcherSceneEnvironment(s.stage,s.branch,s.phase)"));
 assert.ok(page.includes('snapshot.state.branch,snapshot.state.phase'));
 assert.ok(scene.includes('src="/locations/stitcher/owler.webp"'));
 assert.ok(scene.includes("['door','prepare_door','door_reply','fight_ready'].includes(s.phase)"));
 assert.ok(scene.includes('Stage VI is the turn-based encounter'));
 assert.ok(env.includes("'exited','attendant','investigate','witness','hold'"));
 assert.ok(env.includes("if(stage===4&&(branch==='consent'||branch==='notes'))return 'records'"));
 assert.ok(routes.includes("const nextStatus='IN_PROGRESS'"));
 for(const image of ['owler.webp','owler-defeated.webp','service-corridor.webp']){
  const bytes=readFileSync(new URL('../apps/web/static/locations/stitcher/'+image,import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF',image);
  assert.equal(bytes.toString('ascii',8,12),'WEBP',image);
 }
 assert.ok(!scene.includes('src="/locations/stitcher/owler-defeated.webp"'),
  'Defeated art belongs to the Stage VI outcome, not a guaranteed Stage V result');
});
