import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {initial,advance,payStarterRent,HomeInvalidAction,view,HOME_ID,RENT,CLOSING_SPEECH} from '../apps/api/src/shared-home-state.ts';
import {homeJournalEntries,homeCompletionSummary} from '../apps/web/src/lib/home-journal-copy.ts';
import {homeTask} from '../apps/api/src/personal-journal-tasks.ts';
import {activityCanFinish,activityRunning,activityRemainingSeconds,activityProgress,type ActivityRun} from '@the-pall/game-core';
const root=resolve(import.meta.dirname,'..');
const source=(p:string)=>readFileSync(resolve(root,p),'utf8');

test('Shared home opens directly inside the room; notice and speech are saved actions',()=>{
 const original=initial('Millhand','restamp','player_victory');
 assert.equal(original.phase,'HOME','No city or door intermediate step');
 assert.equal(original.homeId,HOME_ID);
 assert.throws(()=>advance(original,'finish'),HomeInvalidAction);
 assert.throws(()=>advance(original,'put_down'),HomeInvalidAction);
 const phases=['NOTICE','SPEECH','COMPLETE'];
 let state=original;
 for(const [i,action] of ['read_notice','put_down','finish'].entries()){
  const before=structuredClone(state);
  state=advance(state,action as 'read_notice'|'put_down'|'finish');
  assert.equal(state.phase,phases[i]);
  assert.equal(state.revision,i+1);
  assert.deepEqual(before,i===0?original:before,'Pure transition: caller state unchanged');
 }
 assert.throws(()=>advance(state,'finish'),HomeInvalidAction);
 assert.equal(original.phase,'HOME');
 assert.equal(view(state,'Ada',10).completed,true);
});

test('Older saved journey/door snapshots resume at the rent notice without a city stop',()=>{
 for(const phase of ['JOURNEY','DOOR'] as const){
  const saved={...initial('Millhand','restamp','player_victory'),
    phase,revision:2};
  assert.equal(view(saved,'Ada',10).phase,'HOME');
  const next=advance(saved,'read_notice');
  assert.equal(next.phase,'NOTICE');
  assert.equal(next.revision,3);
  assert.equal(saved.phase,phase,'Existing saves stay immutable until a confirmed command');
 }
});
test('Six origin endings may use the same home identifier, amount, notice and approved speech',()=>{
 for(const origin of ['Millhand','Bellrunner','Squatter','Stitcher','Scrapper','Inkbound']){
  const state=initial(origin,'restamp','player_defeat');
  const result=view(state,'Ada',10);
  assert.equal(result.homeId,'starter-rented-room');
  assert.equal(result.rent,150);
  assert.equal(result.shortfall,140);
  assert.equal(result.noticeTitle,'FINAL NOTICE');
  assert.equal(result.noticeText,'Ada, you have to pay 150 coins in rent, or you are out. No discussion.');
  assert.equal(result.closingSpeech,CLOSING_SPEECH);
  assert.equal(result.completed,false);
 }
 assert.equal(RENT,150);
 assert.equal(view(initial('Millhand','restamp','player_victory'),'Bo',145).shortfall,5);
 assert.equal(view(initial('Millhand','restamp','player_victory'),'Bo',200).shortfall,0);
});

test('User supplied rented-room background is the exact optimized real artwork',()=>{
 const art=readFileSync(resolve(root,'apps/web/static/locations/home/rented-room.webp'));
 assert.equal(art.toString('ascii',0,4),'RIFF');
 assert.equal(art.toString('ascii',8,12),'WEBP');
 assert.equal(art.length,63940);
 assert.equal(createHash('sha256').update(art).digest('hex'),
  'e0d81172f86b9172fb26875a144f78918e8946873cfc2c3dc24304b20dc859cc');
});

test('Stage 8 uses authenticated persisted API, owner-directed text and preserves game boundary',()=>{
 const api=source('apps/api/src/tutorial-home-routes.ts');
 const web=source('apps/web/src/routes/characters/[id]/home/+page.svelte');
 const shell=source('apps/web/src/lib/TutorialShell.svelte');
 const clinic=source('apps/web/src/lib/SharedTutorialClinic.svelte');
 const home=source('apps/web/src/lib/CharacterHome.svelte');
 const migration=source('db/migrations/0010_tutorial_home.sql');
 const state=source('apps/api/src/shared-home-state.ts');
 const boot=source('apps/api/src/index.ts');
 const character=source('apps/api/src/character-routes.ts');
 assert.ok(boot.includes('registerTutorialHomeRoutes(api)'));
 assert.ok(api.includes('resolveSession(req.headers)')&&api.includes('FOR UPDATE')&&
  api.includes("state.phase==='COMPLETE'")&&api.includes("tutorial_status='COMPLETED'")&&
  api.includes('player_character_tutorial_home_receipts')&&
  api.includes('hash=createHash')&&api.includes('stale_revision')&&
  api.includes('clinic_not_left')&&api.includes("phase!=='SELECTED'")&&
  !api.includes('coins=coins+')&&api.includes('coins=coins-$2,starter_rent_paid_at=NOW()')&&
  !api.includes('UPDATE player_character_flint_combat'));
 assert.ok(migration.includes('REFERENCES player_characters(id) ON DELETE RESTRICT')&&
  migration.includes('PRIMARY KEY(character_id,request_id)'));
 assert.ok(character.includes("fk.confrelid='player_characters'::regclass") &&
    character.includes("'DELETE FROM '+row.table_name+' WHERE character_id=$1'"),
    'The account-owned deletion path discovers completed home states and receipts via foreign keys');
 assert.ok(shell.includes("character.tutorial.stage === 8")&&
  shell.includes("'/home'"));
 assert.ok(clinic.includes('Travel Home</a>')&&
  clinic.includes("'/home'")&&
  clinic.includes("origin==='Stitcher'?'Leave the infirmary'")&&
  clinic.includes("if(action==='leave'&&result.phase==='LEFT')")&&
  clinic.includes("await goto('/characters/'+encodeURIComponent(id)+'/home')")&&
  clinic.includes("origin==='Millhand'"),
  'Travel Home must save the clinic departure then navigate directly to the room');
 assert.ok(home.includes("href:base+'/home'"));
 assert.ok(web.includes('class="home-scene pall-story-landscape"')&&
  web.includes('class="home-dialogue"')&&
  web.includes('class="home-dialogue notice"')&&
  web.includes('class="home-dialogue speech-panel"')&&
  !web.includes('class="parchment journey"')&&
  !web.includes("home.phase==='JOURNEY'")&&
  !web.includes("home.phase==='DOOR'")&&
  !web.includes("perform('travel')")&&
  !web.includes("perform('enter')")&&
  web.includes("url('/locations/home/rented-room.webp')")&&
  web.includes('aria-label="Storage"')&&
  web.includes('aria-label="Read journal"')&&
  web.includes('aria-label="Read notice"')&&
  web.includes('class="hotspot notice-object"')&&
  web.includes('src="/locations/home/notice.webp"')&&
  web.includes('class="hotspot bed"')&&
  web.includes("perform('rest')")&&
  !web.includes('class="rent-status"')&&
  !web.includes('class="paper-object"')&&
  !web.includes('background:#f5d18b24')&&
  web.includes("journalController={{open:journalOpen")&&
  !web.includes('id="home-journal"')&&
  web.includes("if(home.phase==='HOME')void perform('read_notice')")&&
  web.includes("home.phase==='COMPLETE'")&&
  web.includes('The room is yours to use. Rest, inspect the kitchen or review the rent notice.'));
 assert.ok(state.includes('FINAL NOTICE')&&
  state.includes('No discussion.')&&
  !state.includes('due_date')&&!state.includes('evictionDeadline'));
});

test('User-supplied Notice art is installed as a transparent WebP with a fixed hash',()=>{
 const art=readFileSync(resolve(root,'apps/web/static/locations/home/notice.webp'));
 assert.equal(art.toString('ascii',0,4),'RIFF');
 assert.equal(art.toString('ascii',8,12),'WEBP');
 assert.equal(art.length,121714);
 assert.equal(createHash('sha256').update(art).digest('hex'),
  'a51cfeeaa5c6cd91e8884f475b4bf7f3f4403db79cf6ad476f5405a2b79ae3ce');
});
test('Bed rest restores resources, is saved, and never touches the narrative phase',()=>{
 const initialState=initial('Millhand','restamp','player_victory',{
  stamina:14,composure:8,fatigue:94,stress:67
 });
 assert.deepEqual(view(initialState,'Ada',10).condition,{
  stamina:14,composure:8,fatigue:94,stress:67
 });
 const rested=advance(initialState,'rest');
 assert.equal(rested.phase,'HOME');
 assert.equal(rested.revision,1);
 assert.deepEqual(rested.condition,{stamina:100,composure:100,fatigue:0,stress:0});
 assert.deepEqual(initialState.condition,
  {stamina:14,composure:8,fatigue:94,stress:67},'Immutable caller state');
 let s=advance(rested,'read_notice');
 assert.equal(s.phase,'NOTICE');
 s=advance(s,'rest');
 assert.equal(s.phase,'NOTICE','Rest does not dismiss the notice');
 s=advance(s,'put_down');
 s=advance(s,'finish');
 assert.equal(s.phase,'COMPLETE');
 assert.equal(view(s,'Ada',10).completed,true);
 const again=advance(s,'rest');
 assert.equal(again.phase,'COMPLETE');
 assert.equal(again.revision,s.revision+1);
 assert.deepEqual(view(again,'Ada',10).condition,
  {stamina:100,composure:100,fatigue:0,stress:0});
 assert.equal(view(again,'Ada',10).completed,true);
 assert.equal(view(again,'Ada',10).coins,10);
});
test('Old Stage 8 saves without condition can be rested safely',()=>{
 const {condition:ignored,...older}=initial('Millhand','restamp','player_defeat');
 assert.equal(view(older,'Ada',10).condition.stamina,90);
 assert.equal(view(older,'Ada',10).condition.composure,80);
 assert.deepEqual(advance(older,'rest').condition,
  {stamina:100,composure:100,fatigue:0,stress:0});
});
test('Stage 8 hotspots never paint a rectangular debug hover and bed is clickable',()=>{
 const web=source('apps/web/src/routes/characters/[id]/home/+page.svelte');
 assert.ok(!web.includes('class="rent-status"')&&
  !web.includes('rent-status{')&&
  !web.includes('Rent cannot be paid during this tutorial.')&&
  !web.includes('Read rent notice')&&
  !web.includes('Rent notice</span>')&&
  !web.includes('RENT NOTICE · STAGE VIII')&&
  web.includes('class="hotspot chest"')&&web.includes('>Storage</span>')&&
  web.includes('class="hotspot book"')&&web.includes('>Journal</span>')&&
  web.includes('class="hotspot bed"')&&web.includes('Rest in bed')&&
  web.includes('class="hotspot notice-object"')&&
  web.includes('>Notice</span>')&&
  web.includes('restAnimating=true')&&
  web.includes("perform('rest')")&&
  web.includes('await fade')&&
  web.includes('if(saved)restMessage=')&&
  web.includes('class="rest-fade"')&&
  web.includes('class="home-dialogue rest-dialogue"')&&
  web.includes('BED · REST')&&
  web.includes('@keyframes rest-room-fade')&&
  web.includes("home.completed&&action!=='rest'")&&
  web.includes('.hotspot:not(.notice-object)::after')&&
  !web.includes('background:#f5d18b24')&&
  !web.includes('outline:2px solid #eccc85'));
 const api=source('apps/api/src/tutorial-home-routes.ts');
 assert.ok(api.includes("'read_notice','put_down','finish','rest'")&&
  api.includes("(cmd.action==='rest'||cmd.action==='pay_rent')&&c.tutorial_status==='COMPLETED'")&&
  api.includes('clinic.rows[0].state.after')&&
  !api.includes('UPDATE player_character_flint_combat'));
});

test('Stage 8 dialogue frame and typography match the approved Stage 7 clinic',()=>{
 const clinic=source('apps/web/src/lib/SharedTutorialClinic.svelte');
 const home=source('apps/web/src/routes/characters/[id]/home/+page.svelte');
 const styles=[
  "background:transparent;color:#2b1c11;",
  "border:solid transparent;border-width:21px 25px 20px;",
  "border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');",
  'border-image-slice:145 190 125 190 fill;',
  'border-image-width:21px 25px 20px;border-image-repeat:stretch;',
  'margin:0;padding:10px 15px 12px;filter:drop-shadow(0 6px 8px #0008)',
  "font:600 var(--dialogue-label,15px)/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);",
  "font:600 var(--dialogue-title,21px)/1.3 var(--pall-font-reading,Georgia,serif);",
  'font:var(--dialogue-text,17px)/1.55 var(--pall-font-reading,Georgia,serif);',
  '.home-dialogue .stage-direction{font-style:italic}',
  '.home-dialogue .speech{font-weight:600}'
 ];
 for(const css of styles){
  assert.ok(home.includes(css),'Stage 8 must use the same dialogue style: '+css);
  if(!css.includes('.home-dialogue'))
   assert.ok(clinic.includes(css),'Reference clinic dialogue must still use: '+css);
 }
 assert.ok(home.includes('class="pall-framed-button primary-choice"') &&
  !home.includes('background:#e9d7b9;border:solid transparent') &&
  home.includes('RETURN HOME · STAGE VIII'));
});

test('Back to Stage 7 reopens the paid clinic without touching combat, coins or skills',()=>{
 const api=source('apps/api/src/millhand-stage-rewind-routes.ts');
 const shell=source('apps/web/src/lib/TutorialShell.svelte');
 assert.ok(api.includes('targetStage:canReturnToClinic?7') &&
   api.includes("if(expectedStage===8)") &&
   api.includes("phase:'PAID',revision:visit.revision+1") &&
   api.includes('DELETE FROM player_character_tutorial_home_receipts') &&
   api.includes('DELETE FROM player_character_tutorial_home WHERE character_id') &&
   api.includes("tutorial_stage=7,tutorial_status='IN_PROGRESS'") &&
   api.includes("clinicHref(req.params.id,isFinaleOrigin(c.rows[0].origin)") &&
   api.includes('coinDelta:0'),
   'Stage 8 back button should return to the paid clinic, not replay Flint');
 assert.ok(shell.includes("'← Back to Stage '+rewindTargetStage") &&
   shell.includes("fromStage===8"));
 assert.ok(shell.includes('The clinic fee, your saved fight, Health, coins, skills and earlier choices are preserved.'));
});
test('Saved Home journal is the selected character\'s shared reader',()=>{
 const web=source('apps/web/src/routes/characters/[id]/home/+page.svelte');
 const shell=source('apps/web/src/lib/TutorialShell.svelte');
 const reader=source('apps/web/src/lib/PersonalJournal.svelte');
 assert.ok(web.includes("title:'Rented Home',entries:home.completed?[]:currentJournalEntries"));
 assert.ok(shell.includes('<PersonalJournal characterId={character.id}'));
 assert.ok(reader.includes("encodeURIComponent(id)+'/journal"));
 assert.ok(!web.includes('id="home-journal"'));
});

test('Rented-room chest is contextual while Inventory and Journal remain independent',()=>{
 const web=source('apps/web/src/routes/characters/[id]/home/+page.svelte');
 const shell=source('apps/web/src/lib/TutorialShell.svelte');
 const workspace=source('apps/web/src/lib/InventoryWorkspace.svelte');
 const windows=source('apps/web/src/lib/game-window-state.ts');
 assert.ok(web.includes("openGameWindow(id,'storage')"));
 assert.ok(web.includes('data-open-home-chest'));
 assert.ok(web.includes("onStorageClosed={()=>playChestSound('close')}"));
 assert.ok(web.includes("onStorageOpened={()=>playChestSound('open')}"));
 assert.ok(shell.includes('<InventoryWorkspace characterId={character.id}'));
 assert.ok(shell.includes("openGameWindow(character.id,'inventory')"));
 assert.ok(workspace.includes("storage-context"));
 assert.ok(workspace.includes("x-pall-storage-context"));
 assert.ok(windows.includes("closeContextWindows"));
 assert.ok(!web.includes('overlayDialog?.showModal()'));
 assert.ok(!web.includes('<InventoryPanel'));
 assert.ok(web.includes("onclick={()=>{void toggleJournal();}}"));
 assert.ok(web.includes("journalController={{open:journalOpen"));
 assert.ok(shell.includes('<PersonalJournal characterId={character.id}'));
 assert.ok(!web.includes('class="journal" aria-label="Personal Journal"'));
});

test('Every implemented origin archives the same Stage VIII diary shown while playing',()=>{
 for(const [origin,branch] of [
   ['Millhand','restamp'],['Bellrunner','trauma'],['Stitcher','notes']
 ] as const){
   let state=initial(origin,branch,'player_victory');
   const live=()=>homeJournalEntries(origin,state.phase,RENT);
   assert.equal(live().length,1,'No rent detail leaks before reading the notice');
   assert.ok(!live().join(' ').includes('150'));
   state=advance(state,'read_notice');
   assert.ok(live().join(' ').includes('150'));
   state=advance(state,'put_down');
   assert.ok(live().join(' ').includes('Home at last'));
   state=advance(state,'finish');
   const saved=homeTask('character-'+origin,state);
   assert.equal(saved.taskId,'shared.rented-home');
   assert.equal(saved.taskInstanceId,'tutorial:stage:8');
   assert.deepEqual(saved.paragraphs,live());
   assert.ok(origin!=='Stitcher'||saved.paragraphs.join(' ').includes('Owler'));
   assert.equal(view(state,'Ada',10).closingSpeech,CLOSING_SPEECH);
 }
});

test('Each supported finale uses its own Stage VIII completion prose',()=>{
 const expected={
  Millhand:'The council has not paid for the plate lot. The dispute over the worker number remains unresolved.',
  Bellrunner:'The condemned worksite remains closed, and your local findings have not been resolved.',
  Stitcher:'The patient remains in the ward under the staff’s care. You stopped Owler from taking him, but the school may still demand an explanation.'
 } as const;
 const endings=Object.entries(expected);
 for(const [origin,prose] of endings){
  assert.equal(homeCompletionSummary(origin as keyof typeof expected),prose);
  for(const [other,otherText] of endings){
   if(other!==origin)assert.notEqual(prose,otherText,origin+' must not reuse '+other+' history');
  }
 }
 const home=source('apps/web/src/routes/characters/[id]/home/+page.svelte');
 const copy=source('apps/web/src/lib/home-journal-copy.ts');
 assert.ok(home.includes('homeCompletionSummary(home.origin)'),
  'The shared completion screen reads its own persisted origin');
 assert.ok(!home.includes('plate lot')&&!home.includes('condemned worksite')&&
   !home.includes('Owler'), 'Story-dependent ending text belongs in a shared copy module');
 assert.match(copy,/COMPLETION_SUMMARIES:Record<FinaleOrigin,string>/,
  'Require an exhaustive map for every finale origin');
});

test('Initial rent payment is a single full debit after the shared closing sequence',()=>{
 const before=initial('Millhand','restamp','player_victory');
 assert.throws(()=>payStarterRent(before,150,null),/rent_not_ready/);
 const complete=advance(advance(advance(before,'read_notice'),'put_down'),'finish');
 assert.throws(()=>payStarterRent(complete,149,null),/insufficient_coins/);
 const paid=payStarterRent(complete,200,null);
 assert.equal(paid.coins,50);
 assert.equal(paid.state.phase,'COMPLETE');
 assert.equal(paid.state.revision,complete.revision+1);
 const stamp='2026-11-28T12:00:00Z';
 assert.throws(()=>payStarterRent(paid.state,500,stamp),/rent_already_paid/);
 const snapshot=view(paid.state,'Ada',paid.coins,stamp);
 assert.equal(snapshot.rentPaid,true);assert.equal(snapshot.rentDue,0);assert.equal(snapshot.shortfall,0);
 assert.equal(snapshot.noticeTitle,'RENT PAID');
 assert.equal(view(complete,'Ada',10).rentDue,150);
 assert.equal(view(before,'Ada',10,stamp).noticeTitle,'FINAL NOTICE','Developer replay retains original copy');
 const ui=source('apps/web/src/routes/characters/[id]/home/+page.svelte');
 assert.ok(ui.includes("perform('pay_rent')")&&ui.includes('disabled={pending||home.shortfall>0}'));
 assert.ok(ui.includes('class="hotspot kitchen"')&&ui.includes('Cooking is not yet available.'));
 assert.ok(ui.includes('coins:result.coins'));
 const schema=source('db/migrations/0026_starter_rent.sql');
 assert.ok(schema.includes('ADD COLUMN IF NOT EXISTS starter_rent_paid_at'));
});

test('Universal activity timing uses elapsed time and waits for unresolved required interactions',()=>{
 const run:ActivityRun={id:'fixture',key:'fixture',label:'Fixture',startedAt:'2026-11-28T12:00:00.000Z',endsAt:'2026-11-28T12:00:30.000Z',completedAt:null};
 const half=new Date('2026-11-28T12:00:15.000Z'),end=new Date(run.endsAt);
 assert.equal(activityRunning(run),true);
 assert.equal(activityRemainingSeconds(run,half.getTime()),15);
 assert.equal(activityProgress(run,half.getTime()),50);
 assert.equal(activityCanFinish(run,new Date(end.getTime()-1)),false);
 assert.equal(activityCanFinish(run,end,true),false);
 assert.equal(activityCanFinish(run,end),true);
 assert.equal(activityRemainingSeconds(run,end.getTime()+10000),0);
 assert.equal(activityCanFinish({...run,completedAt:run.endsAt},end),false);
 const engine=source('apps/api/src/activity-engine.ts');
 const definition=source('apps/api/src/activity-definitions.ts');
 const api=source('apps/api/src/tutorial-home-routes.ts');
 assert.ok(engine.includes('activityDefinition(activity.key).complete'));
 assert.ok(definition.includes("advance(await savedHome(db, id), 'rest')"));
 assert.ok(api.includes("startActivity(db,c.id,'home.rest',cmd.requestId,activity)"));
 assert.ok(source('apps/api/src/free-play-routes.ts').includes("error:'activity_in_progress'"));
});

test('Long activity confirmation is explicit and countdowns do not poll the Home every second',()=>{
 const home=source('apps/web/src/routes/characters/[id]/home/+page.svelte');
 const modal=source('apps/web/src/lib/ActivityConfirmation.svelte');
 const progress=source('apps/web/src/lib/ActivityProgress.svelte');
 const sync=source('apps/web/src/lib/activity-sync.ts');
 assert.ok(home.includes('requiresActivityConfirmation(home.restOffer.durationSeconds)'));
 assert.ok(home.includes('onCancel={()=>restConfirmation=null}'));
 assert.ok(home.includes("await perform('rest')"));
 assert.ok(home.includes('result.revision===home.revision&&result.coins===home.coins'));
 assert.ok(modal.includes('dialog.showModal()')&&modal.includes('cancelButton.focus()'));
 assert.ok(progress.includes('setInterval')&&!progress.includes('fetch('));
 assert.ok(sync.includes('deadline-performance.now()')&&!sync.includes('setInterval'));
 assert.ok(!home.includes('lastPoll')&&!home.includes('pollHome'));
});
