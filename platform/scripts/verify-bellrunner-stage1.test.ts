import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {APPROVED_STAGE_ONE} from '../apps/web/src/lib/approved-stage-one.ts';
import {APPROVED_HECTOR_TOPICS} from '../apps/web/src/lib/approved-bellrunner-hector.ts';
import {INITIAL_DISPATCH_STATE,applyDispatchAction,InvalidDispatchAction,
  type DispatchState,type DispatchWorkAction} from '../apps/api/src/bellrunner-dispatch-work.ts';
import {BELLRUNNER_ROUTE_NARRATION,BELLRUNNER_RECEIVING_ARRIVAL,
  BELLRUNNER_RECEIVER_OPENING,BELLRUNNER_RECEIVER_RESOLUTIONS}
  from '../apps/web/src/lib/bellrunner-stage2-narrative.ts';

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
 const conversation=source('apps/web/src/lib/BellrunnerHectorConversation.svelte');
 assert.ok(scene.includes('<BellrunnerHectorConversation'));
 assert.ok(scene.includes('onclick={askHector}'));
 assert.ok(scene.includes('function returnToRound(){talking=false;}'));
 assert.ok(conversation.includes('currentTopic?.lines[lineIndex]'));
 assert.ok(conversation.includes('onclick={()=>{lineIndex+=1;}}'));
 assert.ok(conversation.includes('lineIndex<currentTopic.lines.length-1'));
 assert.ok(conversation.includes('Ask something else'));
 assert.ok(conversation.includes('Return to the round'));
 assert.ok(conversation.includes('onclick={returnToRound}'));
 assert.ok(conversation.includes('“{currentLine.text}”'));
 assert.equal((conversation.match(/“\{currentLine.text\}”/g)??[]).length,1,
  'Every selected topic turn is rendered once, not duplicated or skipped');
 assert.ok(!conversation.includes('takeRound(')&&!conversation.includes('fetch('));
 assert.ok(!scene.includes('skipToWork')&&!conversation.includes('rewardXp('));
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
 assert.ok(stage2.includes('<BellrunnerHectorConversation characterName={character.name}'));
 assert.ok(stage2.includes('talkingToHector=true'));
 assert.ok(stage2.includes('talkingToHector=false'),
  'Returning to the active dispatch must preserve saved work and its revision');
 assert.ok(opening.includes("depotBackdrop={character.origin==='Bellrunner'}"));
 assert.ok(stage2.includes('sceneLocation="Dispatch House" depotBackdrop'));
 assert.ok(shell.includes("character.origin!=='Millhand'&&character.origin!=='Bellrunner'"));
 assert.ok(shell.includes('Back to Stage '));
 for(const item of ['hector-d-smoke.webp','council-work.webp','sealed-order.webp','route-sheet.webp'])
  assert.ok(scene.includes(item));
 assert.ok(!scene.includes('class="paper-inspection"'));
});

test('The two player-written route monologues are reproduced verbatim',()=>{
 assert.deepEqual([...BELLRUNNER_ROUTE_NARRATION.direct],[
  "I slip through the back streets behind the freight yards. Saves me a good bit of walking, though these alleys aren't exactly pleasant.",
  "Tight corners, barely room for two men to pass. And there's always some bastard looking for an easy bag to snatch.",
  "Better keep moving. Got enough trouble without losing the council's papers."
 ]);
 assert.deepEqual([...BELLRUNNER_ROUTE_NARRATION.quieter],[
  "I stick to the main roads. Takes longer, sure, but there's people about, carts passing, and enough light to see where I'm going.",
  "Trouble is, half the city's out here. Carts blocking the way, workers crossing everywhere. Hard to get anywhere quickly.",
  "Still, I'd rather lose a little time than have someone make off with my notices."
 ]);
 const ui=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 assert.ok(ui.includes('BELLRUNNER_ROUTE_NARRATION[round.workState.route]'));
 assert.ok(ui.includes('Take the Short Route')&&ui.includes('Take the Long Route'));
 assert.ok(ui.includes('Continue to the delivery'));
 assert.ok(!ui.includes('Inspect route and notices'));
 assert.ok(!ui.includes('Put the notices in route order'));
 assert.ok(!ui.includes('Make deliveries and record marks'));
 assert.ok(!ui.includes('Notice order</dt>'));
});

test('Receiving desk incident and three choices lead to authored, unskipped RP',()=>{
 assert.equal(BELLRUNNER_RECEIVING_ARRIVAL.length,2);
 assert.equal(BELLRUNNER_RECEIVER_OPENING.length,2);
 assert.ok(BELLRUNNER_RECEIVING_ARRIVAL[0].includes('clerk takes the council notice'));
 assert.ok(BELLRUNNER_RECEIVING_ARRIVAL[1].includes('ink smears across two lines'));
 assert.deepEqual(Object.keys(BELLRUNNER_RECEIVER_RESOLUTIONS).sort(),
  ['book_confirmed','clear','noted_unclear']);
 for(const value of Object.values(BELLRUNNER_RECEIVER_RESOLUTIONS)){
  assert.ok(value.player.length>15&&value.receiver.length>15);
  assert.ok(value.outcome.length>25);
 }
 assert.ok(BELLRUNNER_RECEIVER_RESOLUTIONS.clear.receiver.includes('Hold it steady this time.'));
 assert.ok(BELLRUNNER_RECEIVER_RESOLUTIONS.book_confirmed.extraPlayer?.includes('note the book entry'));
 assert.ok(BELLRUNNER_RECEIVER_RESOLUTIONS.noted_unclear.outcome.includes('unclear'));
 const ui=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 assert.ok(ui.includes("phase==='receiving_arrival'"));
 assert.ok(ui.includes("perform('continue_to_receiver')"));
 assert.ok(ui.includes("phase==='spoiled_mark'"));
 const arrival=ui.slice(ui.indexOf("phase==='receiving_arrival'"),ui.indexOf("phase==='spoiled_mark'"));
 assert.ok(arrival.includes('BELLRUNNER_RECEIVING_ARRIVAL'));
 assert.ok(arrival.includes('>Continue</button>'));
 assert.ok(!arrival.includes('BELLRUNNER_RECEIVER_OPENING'));
 assert.ok(!arrival.includes('Ask for a fresh mark'));
 const receiver=ui.slice(ui.indexOf("phase==='spoiled_mark'"),ui.indexOf("phase==='book_checked'"));
 assert.ok(receiver.includes('BELLRUNNER_RECEIVER_OPENING'));
 assert.ok(receiver.includes('Ask for a fresh mark'));
 assert.ok(receiver.includes('Check their receiving book'));
 assert.ok(receiver.includes('Note the spoiled mark and go on'));
 assert.ok(ui.includes("phase==='receiver_reply'&&receiverDialogue"));
 assert.ok(ui.includes("phase==='receiver_result'&&receiverDialogue"));
 assert.ok(ui.includes('“{receiverDialogue.player}”'));
 assert.ok(ui.includes('“{receiverDialogue.receiver}”'));
 assert.ok(ui.includes("perform('continue_receiver_dialogue')"));
 assert.ok(ui.includes("perform('continue_to_final_notice')"));
 assert.ok(!ui.includes('The round report</h1>'),
  'The tutorial no longer forces a summary-only screen');
 assert.ok(ui.includes('The usual deliveries are done, and the receiving marks are recorded.'));
 assert.ok(ui.includes('One sealed council order remains. It still needs to be delivered to the address marked on the route sheet.'));
 assert.ok(!ui.includes('not implemented in this pass'));
});

test('Stage 2 retains owner-checked, retry-safe work and no fabricated payouts',()=>{
 const ui=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 const route=source('apps/api/src/bellrunner-dispatch-routes.ts');
 const schema=source('db/migrations/0015_bellrunner_dispatch_work.sql');
 const migrate=source('scripts/bellrunner-migrate.mjs');
 const rewind=source('apps/api/src/millhand-stage-rewind-routes.ts');
 assert.ok(ui.includes('round.workState')&&ui.includes('expectedRevision:round.revision'));
 assert.ok(route.includes("app.post<{Params:Params}>('/api/characters/:id/bellrunner/dispatch/work'"));
 assert.ok(route.includes('FOR UPDATE')&&route.includes('idempotency_key_reuse'));
 assert.ok(route.includes("ch.rows[0].origin!=='Bellrunner'"));
 assert.ok(route.includes('InvalidDispatchAction'));
 assert.ok(schema.includes('player_character_bellrunner_dispatch_work_receipts'));
 assert.ok(migrate.includes('0015_bellrunner_dispatch_work.sql'));
 assert.ok(rewind.includes('DELETE FROM player_character_bellrunner_dispatch_work_receipts'));
 assert.ok(!ui.includes('No money, XP or equipment has been awarded.'));
 assert.ok(!ui.includes('coins+'));
});

test('New rounds choose a road immediately; every receipt resolves through two saved RP beats',()=>{
 const apply=(actions:DispatchWorkAction[],initial:DispatchState=INITIAL_DISPATCH_STATE)=>
  actions.reduce<DispatchState>((s,a)=>applyDispatchAction(s,a),initial);
 assert.throws(()=>applyDispatchAction(INITIAL_DISPATCH_STATE,'take_final_notice'),
  InvalidDispatchAction);
 for(const road of ['take_direct_road','take_quieter_road'] as const){
  const chosen=apply([road]);
  assert.equal(chosen.phase,'road_chosen');
  assert.equal(chosen.route,road==='take_direct_road'?'direct':'quieter');
  const arrived=applyDispatchAction(chosen,'deliver_notices');
  assert.equal(arrived.phase,'receiving_arrival');
  assert.throws(()=>applyDispatchAction(arrived,'ask_fresh_mark'),InvalidDispatchAction,
   'Receiver choices remain locked until the arrival Continue');
  const delivered=applyDispatchAction(arrived,'continue_to_receiver');
  assert.equal(delivered.phase,'spoiled_mark');
  for(const [resolution,receipt] of [
    ['ask_fresh_mark','clear'],
    ['check_receiving_book','book_confirmed'],
    ['note_spoiled_mark','noted_unclear']
  ] as const){
   const reply=applyDispatchAction(delivered,resolution);
   assert.equal(reply.phase,'receiver_reply');
   assert.equal(reply.receipt,receipt);
   assert.throws(()=>applyDispatchAction(reply,'finish_round'),InvalidDispatchAction);
   const result=applyDispatchAction(reply,'continue_receiver_dialogue');
   assert.equal(result.phase,'receiver_result');
   assert.throws(()=>applyDispatchAction(result,'take_final_notice'),InvalidDispatchAction);
   const ready=applyDispatchAction(result,'continue_to_final_notice');
   assert.equal(ready.phase,'final_notice');
   const finished=applyDispatchAction(ready,'take_final_notice');
   assert.equal(finished.phase,'final_notice_taken');
   assert.equal(finished.route,chosen.route);
   assert.equal(finished.receipt,receipt);
  }
 }
});

test('Earlier saved dispatch phases and recorded sorting remain playable',()=>{
 const legacyChecked=applyDispatchAction(INITIAL_DISPATCH_STATE,'check_round');
 assert.equal(legacyChecked.phase,'checked');
 const legacySorted=applyDispatchAction(legacyChecked,'sort_notices');
 assert.equal(legacySorted.noticesOrdered,true);
 const road=applyDispatchAction(legacySorted,'take_direct_road');
 assert.equal(road.phase,'road_chosen');
 const arrival=applyDispatchAction(road,'deliver_notices');
 const spoiled=applyDispatchAction(arrival,'continue_to_receiver');
 const legacyBookChecked={...spoiled,phase:'book_checked' as const};
 const bookReply=applyDispatchAction(legacyBookChecked,'confirm_book');
 assert.equal(bookReply.phase,'receiver_reply');
 assert.equal(bookReply.receipt,'book_confirmed');
 const olderReport={...spoiled,phase:'round_report' as const,
  receipt:'noted_unclear' as const};
 assert.equal(applyDispatchAction(olderReport,'finish_round').phase,'final_notice');
 const oldResponse={...spoiled,phase:'receiver_result' as const,receipt:'clear' as const};
 assert.equal(applyDispatchAction(oldResponse,'continue_to_report').phase,'final_notice',
  'Old API command must no longer insert the removed report panel');
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
