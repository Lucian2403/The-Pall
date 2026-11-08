import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {APPROVED_STAGE_ONE} from '../apps/web/src/lib/approved-stage-one.ts';
import {APPROVED_HECTOR_TOPICS} from '../apps/web/src/lib/approved-bellrunner-hector.ts';
import {INITIAL_DISPATCH_STATE,applyDispatchAction,InvalidDispatchAction,
  type DispatchState,type DispatchWorkAction} from '../apps/api/src/bellrunner-dispatch-work.ts';

const root=resolve(import.meta.dirname,'..');
const source=(path:string)=>readFileSync(resolve(root,path),'utf8');

test('Original owner artwork and duty-bell binary remain unchanged',()=>{
 for(const [path,size,hash] of [
  ['apps/web/static/characters/hector/hector-d-smoke.webp',147836,
   'fa487147016228c83e9bc56f1814dd30d9d0ede28dc579640bcee14aaef30472'],
  ['apps/web/static/locations/bellrunner/council-work.webp',123536,
   '380ec6217b88b9e332becd149202d5d3405e232538da748a215cec651faa600b'],
  ['apps/web/static/locations/bellrunner/sealed-order.webp',165508,
   '11da258832dcc720c788b0d974886463c9426c66804d8255eaf9fe65775059e9'],
  ['apps/web/static/locations/bellrunner/route-sheet.webp',161938,
   'e236c5cc07dd4125ea59dbe3149ea34bc06112b6533f42d0e2125472ae13efb2']
 ] as const){
  const data=readFileSync(resolve(root,path));
  assert.equal(statSync(resolve(root,path)).size,size,path);
  assert.equal(data.toString('ascii',0,4),'RIFF',path);
  assert.equal(data.toString('ascii',8,12),'WEBP',path);
  assert.equal(createHash('sha256').update(data).digest('hex'),hash,path);
 }
 const audio=readFileSync(resolve(root,'apps/web/static/audio/bellrunner/duty-bell.mp3'));
 assert.equal(audio.byteLength,353607);
 assert.ok(audio.toString('ascii',0,3)==='ID3'||(audio[0]===0xff&&(audio[1]&0xe0)===0xe0));
 assert.equal(createHash('sha256').update(audio).digest('hex'),
  '542de89f165f46417023664b91d17a5eb2e535aaf48941b582d4e0984cd355e6');
});

test('The exact owner-replaced opening is sequential and canon-matched',()=>{
 const scene=APPROVED_STAGE_ONE.Bellrunner;
 const doc=source('../docs/05-gameplay/onboarding/bellrunner/opening-dialogue.md');
 assert.equal(scene.location,'Dispatch House');
 assert.equal(scene.npc,'Hector D. Smoke');
 assert.equal(scene.start,'setting');
 const path=['setting','opening','playerObjection','hectorReply','routeNarration','instructions','take'];
 for(let i=0;i<path.length;i++){
  const node=scene.nodes[path[i]];
  assert.ok(node, 'Missing '+path[i]);
  assert.ok(doc.includes(node.text), 'Canon mismatch in '+path[i]);
  assert.equal(node.next,path[i+1]);
 }
 assert.equal(scene.nodes.opening.text,
  "There you are. Got another round for you. Council notices. Should've gone out with the last lot, but here they are.");
 assert.equal(scene.nodes.playerObjection.text,"So they'll say I'm late, then.");
 assert.equal(scene.nodes.playerObjection.speaker,'Player');
 assert.equal(scene.nodes.hectorReply.text,
  "Let 'em. I've written down when I gave you the bloody things. They want to complain, they know where to find me.");
 assert.equal(scene.nodes.instructions.text,
  "Here's your route. Get a mark from whoever takes each notice. And don't lose the sheet. I need it back.");
 assert.equal(scene.nodes.take.kind,'handoff');
 assert.equal(scene.nodes.take.text,'Take the round');
 assert.ok(!scene.nodes.objection,'Old optional objection is superseded by the new script');
});

test('All six optional topics preserve every spoken turn and never grant rewards',()=>{
 const doc=source('../docs/05-gameplay/onboarding/bellrunner/opening-dialogue.md');
 assert.deepEqual(APPROVED_HECTOR_TOPICS.map(x=>x.label),[
  'About the work','About the receiving marks','About the routes',
  'About the payment','About Grand Cylinder City','About the Plume and the Pall'
 ]);
 assert.deepEqual(APPROVED_HECTOR_TOPICS.map(x=>x.lines.length),[4,4,4,4,6,8]);
 for(const topic of APPROVED_HECTOR_TOPICS){
  assert.ok(doc.includes(topic.label));
  for(const [i,line] of topic.lines.entries()){
    assert.equal(line.speaker,i%2===0?'Player':'Hector');
    assert.ok(doc.includes(line.text),topic.id+' missing exact line '+i);
    assert.ok(line.text.length>8);
  }
 }
 const scene=source('apps/web/src/lib/BellrunnerOpeningScene.svelte');
 assert.ok(scene.includes("talking='topics'"));
 assert.ok(scene.includes("talking='lines'"));
 assert.ok(scene.includes('currentTopic?.lines[lineIndex]'));
 assert.ok(scene.includes('onclick={()=>{lineIndex+=1;}}'));
 assert.ok(scene.includes('lineIndex<currentTopic.lines.length-1'));
 assert.ok(scene.includes('Ask something else'));
 assert.ok(scene.includes('Return to the round'));
 assert.ok(scene.includes('onclick={askHector}'));
 assert.ok(scene.includes('onclick={returnToRound}'));
 assert.ok(scene.includes('“{currentLine.text}”'));
 assert.equal((scene.match(/“\{currentLine.text\}”/g)??[]).length,1,
  'Every selected topic turn is rendered once, not duplicated or skipped');
 assert.ok(!scene.includes("skipToWork")&&!scene.includes('rewardXp('));
});

test('Hector framing, inspection and audio reuse owner-approved workshop UI',()=>{
 const scene=source('apps/web/src/lib/BellrunnerOpeningScene.svelte');
 const stage2=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 const opening=source('apps/web/src/routes/characters/[id]/opening/+page.svelte');
 const shell=source('apps/web/src/lib/TutorialShell.svelte');
 assert.ok(scene.includes("new Audio('/audio/bellrunner/duty-bell.mp3')"));
 assert.ok(scene.includes('if(entered)return;')&&scene.includes('bell.pause()'));
 assert.ok(scene.includes('class="workshop bellrunner"'));
 assert.ok(scene.includes('class="work-card dispatch-dialogue"'));
 assert.ok(scene.includes('WorkshopItemPopover')&&
  scene.includes("import '$lib/workshop-object-labels.css'"));
 assert.ok(scene.includes('workshop-object-label')&&scene.includes('workshop-npc-label'));
 assert.ok(scene.includes('clip-path:inset(93% 0 0 0)')&&
  !scene.includes('clip-path:inset(70% 0 0 0)'),
  'The foreground must cover only Hector\'s boots, not cut him across the waist');
 assert.ok(stage2.includes('clip-path:inset(93% 0 0 0)'));
 assert.ok(stage2.includes('WorkshopItemPopover')&&stage2.includes('class="work-card"'));
 assert.ok(opening.includes("depotBackdrop={character.origin==='Bellrunner'}"));
 assert.ok(stage2.includes('sceneLocation="Dispatch House" depotBackdrop'));
 assert.ok(shell.includes("character.origin!=='Millhand'&&character.origin!=='Bellrunner'"));
 assert.ok(shell.includes('Back to Stage '));
 for(const item of ['hector-d-smoke.webp','council-work.webp','sealed-order.webp','route-sheet.webp'])
  assert.ok(scene.includes(item));
 assert.ok(!scene.includes('class="paper-inspection"'));
});

test('Approved Stage 2 is actual saved courier work, without made-up reward values',()=>{
 const stage2=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 const route=source('apps/api/src/bellrunner-dispatch-routes.ts');
 const schema=source('db/migrations/0015_bellrunner_dispatch_work.sql');
 const migrate=source('scripts/bellrunner-migrate.mjs');
 const rewind=source('apps/api/src/millhand-stage-rewind-routes.ts');
 for(const label of ['Inspect route and notices','Put the notices in route order',
   'Take the direct road','Take the quieter road','Make deliveries and record marks',
   'Ask for a fresh mark','Check their receiving book',
   'Note the spoiled mark and go on','Finish the ordinary circuit','Take the final notice']){
  assert.ok(stage2.includes(label),label);
 }
 assert.ok(stage2.includes('round.workState')&&stage2.includes('expectedRevision:round.revision'));
 assert.ok(route.includes("app.post<{Params:Params}>('/api/characters/:id/bellrunner/dispatch/work'"));
 assert.ok(route.includes('FOR UPDATE')&&route.includes('idempotency_key_reuse'));
 assert.ok(route.includes("ch.rows[0].origin!=='Bellrunner'"));
 assert.ok(route.includes('InvalidDispatchAction'));
 assert.ok(schema.includes('player_character_bellrunner_dispatch_work_receipts'));
 assert.ok(migrate.includes('0015_bellrunner_dispatch_work.sql'));
 assert.ok(rewind.includes('DELETE FROM player_character_bellrunner_dispatch_work_receipts'));
 assert.ok(!stage2.includes('not implemented in this pass'));
 assert.ok(!stage2.includes('No money, XP or equipment has been awarded.'));
 assert.ok(!stage2.includes('coins+'));
});

test('Courier actions retain every approved route and receiving-mark resolution',()=>{
 function apply(actions:DispatchWorkAction[]):DispatchState{
  return actions.reduce<DispatchState>((s,a)=>applyDispatchAction(s,a),INITIAL_DISPATCH_STATE);
 }
 assert.throws(()=>applyDispatchAction(INITIAL_DISPATCH_STATE,'take_direct_road'),
  InvalidDispatchAction);
 assert.throws(()=>applyDispatchAction(INITIAL_DISPATCH_STATE,'take_final_notice'),
  InvalidDispatchAction);
 const checked=apply(['check_round']);
 assert.equal(checked.phase,'checked');
 assert.equal(checked.noticesOrdered,false);
 assert.equal(apply(['check_round','sort_notices']).noticesOrdered,true);
 for(const road of ['take_direct_road','take_quieter_road'] as const){
  const basic=['check_round',road,'deliver_notices'] as DispatchWorkAction[];
  for(const remedy of ['ask_fresh_mark','note_spoiled_mark'] as const){
    const ended=apply([...basic,remedy,'finish_round','take_final_notice']);
    assert.equal(ended.phase,'final_notice_taken');
    assert.equal(ended.route,road==='take_direct_road'?'direct':'quieter');
    assert.equal(ended.receipt,remedy==='ask_fresh_mark'?'clear':'noted_unclear');
  }
  const confirmed=apply([...basic,'check_receiving_book','confirm_book','finish_round']);
  assert.equal(confirmed.receipt,'book_confirmed');
  assert.equal(confirmed.phase,'final_notice');
  assert.throws(()=>applyDispatchAction(confirmed,'confirm_book'),InvalidDispatchAction);
 }
});

test('Stage 1 still accepts the round exactly once, without mutating starter items',()=>{
 const opening=source('apps/web/src/routes/characters/[id]/opening/+page.svelte');
 const api=source('apps/api/src/bellrunner-dispatch-routes.ts');
 const registration=source('apps/api/src/index.ts');
 const migration=source('db/migrations/0014_bellrunner_stage1.sql');
 assert.ok(opening.includes('<BellrunnerOpeningScene')&&
  opening.includes('takeRound={takeBellrunnerRound}'));
 assert.ok(opening.includes("action:'take_round',expectedRevision:0"));
 assert.ok(opening.includes('pendingTakeRequestId??=crypto.randomUUID()'));
 assert.ok(api.includes('player_character_bellrunner_dispatch_receipts'));
 assert.ok(api.includes("tutorial_stage=2,tutorial_status='IN_PROGRESS'"));
 assert.ok(registration.includes('registerBellrunnerDispatchRoutes(api);'));
 assert.ok(migration.includes('PRIMARY KEY (character_id,request_id)'));
 assert.ok(source('platform/scripts/bellrunner-migrate.mjs'.replace('platform/','')).includes('0014_bellrunner_stage1.sql'));
});
