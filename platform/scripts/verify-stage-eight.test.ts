import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {initial,advance,HomeInvalidAction,view,HOME_ID,RENT,CLOSING_SPEECH} from '../apps/api/src/shared-home-state.ts';
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
 const clinic=source('apps/web/src/routes/characters/[id]/millhand/clinic/+page.svelte');
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
  !api.includes('coins=coins+')&&!api.includes('coins=coins-')&&
  !api.includes('UPDATE player_character_flint_combat'));
 assert.ok(migration.includes('REFERENCES player_characters(id) ON DELETE RESTRICT')&&
  migration.includes('PRIMARY KEY(character_id,request_id)'));
 assert.ok(character.includes("'player_character_tutorial_home_receipts','player_character_tutorial_home'"));
 assert.ok(shell.includes("character.tutorial.stage === 8")&&
  shell.includes("'/home'"));
 assert.ok(clinic.includes('Travel Home</a>')&&
  clinic.includes("'/home'")&&
  clinic.includes("next==='leave'?'Travel Home'")&&
  clinic.includes("if(action==='leave'&&result.phase==='LEFT')")&&
  clinic.includes("await goto('/characters/'+encodeURIComponent(id)+'/home')")&&
  !clinic.includes("'Leave the clinic'"),
  'Travel Home must save the clinic departure then navigate directly to the room');
 assert.ok(home.includes("href:base+'/home'"));
 assert.ok(web.includes('class="home-scene"')&&
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
  web.includes('id="home-journal"')&&
  web.includes("if(home.phase==='HOME')void perform('read_notice')")&&
  web.includes("home.phase==='COMPLETE'")&&
  web.includes('Further game systems are not available in this prototype.'));
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
  api.includes("cmd.action==='rest'&&c.tutorial_status==='COMPLETED'")&&
  api.includes('clinic.rows[0].state.after')&&
  !api.includes('UPDATE player_character_flint_combat'));
});

test('Stage 8 dialogue frame and typography match the approved Stage 7 clinic',()=>{
 const clinic=source('apps/web/src/routes/characters/[id]/millhand/clinic/+page.svelte');
 const home=source('apps/web/src/routes/characters/[id]/home/+page.svelte');
 const styles=[
  "background:transparent;color:#2b1c11;",
  "border:solid transparent;border-width:21px 25px 20px;",
  "border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');",
  'border-image-slice:145 190 125 190 fill;',
  'border-image-width:21px 25px 20px;border-image-repeat:stretch;',
  'margin:0;padding:10px 15px 12px;filter:drop-shadow(0 6px 8px #0008)',
  "font:600 14px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);",
  "font:600 26px/1.25 var(--pall-font-reading,Georgia,serif);",
  'font:16px/1.45 var(--pall-font-reading,Georgia,serif);',
  '.home-dialogue .stage-direction{font-style:italic}',
  '.home-dialogue .speech{font-weight:600}'
 ];
 for(const css of styles){
  assert.ok(home.includes(css),'Stage 8 must use the same dialogue style: '+css);
  if(!css.includes('.home-dialogue'))
   assert.ok(clinic.includes(css),'Reference clinic dialogue must still use: '+css);
 }
 assert.ok(home.includes('class="pall-framed-button"') &&
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
   api.includes("route:'/characters/'+req.params.id+'/millhand/clinic'") &&
   api.includes('coinDelta:0'),
   'Stage 8 back button should return to the paid clinic, not replay Flint');
 assert.ok(shell.includes("'← Back to Stage '+rewindTargetStage") &&
   shell.includes("fromStage===8"));
 assert.ok(shell.includes('The clinic fee, your saved fight, Health, coins, skills and earlier choices are preserved.'));
});
test('Branch-aware personal Journal never displays facts from unchosen investigation paths',()=>{
 const web=source('apps/web/src/routes/characters/[id]/home/+page.svelte');
 assert.ok(web.includes("home?.branch==='restamp'")&&
  web.includes("home?.branch==='contracts'")&&
  web.includes("home?.branch==='records'")&&
  web.includes("home?.outcome==='player_victory'")&&
  web.includes("home?.outcome==='player_defeat'"));
 assert.ok(web.includes('Home at last. Ten coins left after the clinic,')&&
  web.includes('The council has not paid for the plate lot.'));
});


test('Rented-room chest and Journal open over the environment, not below it',()=>{
 const web=source('apps/web/src/routes/characters/[id]/home/+page.svelte');
 assert.ok(web.includes("let overlayKind=$state<'storage'|'journal'|null>(null);"));
 assert.ok(web.includes('overlayDialog?.showModal()'));
 assert.ok(web.includes('overlayDialog?.close()'));
 assert.ok(web.includes('onclose={()=>overlayKind=null}'));
 assert.ok(web.includes("onclick={()=>{void openRoomOverlay('storage');}}"));
 assert.ok(web.includes("openRoomOverlay('journal')"));
 assert.ok(web.includes('class="room-overlay"'));
 assert.ok(web.includes('<InventoryPanel characterId={id} onClose={closeRoomOverlay}/>'));
 assert.ok(web.includes('class="journal" aria-label="Personal Journal"'));
 assert.ok(web.includes('.room-overlay::backdrop'));
 assert.ok(web.includes('max-height:90dvh'));
 assert.ok(!web.includes('<InventoryPanel characterId={id} onClose={()=>storageOpen=false}/>'));
 assert.ok(!web.includes('bind:this={journalElement}'),
   'Journal should remain in the modal rather than scrolling below the room');
});

test('Storage uses the owner chest sounds and the home background stays room-sized',()=>{
 const web=source('apps/web/src/routes/characters/[id]/home/+page.svelte');
 for(const name of ['PersonalChest_Open1.mp3','PersonalChest_Open2.mp3','PersonalChest_Close.mp3']){
  assert.ok(web.includes('/audio/chest/'+name),'Missing chest SFX hookup: '+name);
  const bytes=readFileSync(resolve(import.meta.dirname,'../apps/web/static/audio/chest',name));
  assert.ok(bytes.byteLength>1500,'Chest audio missing or truncated: '+name);
  assert.ok(bytes.subarray(0,3).toString()==='ID3'||
    (bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0),'Chest sound must be an MP3: '+name);
 }
 assert.ok(web.includes("if(overlayKind==='storage')playChestSound('close')"));
 assert.ok(web.includes("onclose={handleRoomOverlayClose}"));
 assert.ok(web.includes('max-width:1320px;margin-inline:auto;aspect-ratio:1672/941'),
  'The Stage 8 room must not expand to the full ultrawide screen');
});
