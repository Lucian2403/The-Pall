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
  web.includes('aria-label="Inspect chest"')&&
  web.includes('aria-label="Read journal"')&&
  web.includes('aria-label="Read rent notice"')&&
  web.includes('class="paper-object"')&&
  web.includes('id="home-journal"')&&
  web.includes("if(home.phase==='HOME')void perform('read_notice')")&&
  web.includes("home.phase==='COMPLETE'")&&
  web.includes('Further game systems are not available in this prototype.'));
 assert.ok(state.includes('FINAL NOTICE')&&
  state.includes('No discussion.')&&
  !state.includes('due_date')&&!state.includes('evictionDeadline'));
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
  "font:600 26px/1.25 var(--pall-font-reading,Georgia,serif);color:#2b1b12",
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
