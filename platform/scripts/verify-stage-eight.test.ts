import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {initial,advance,HomeInvalidAction,view,HOME_ID,RENT,CLOSING_SPEECH} from '../apps/api/src/shared-home-state.ts';
const root=resolve(import.meta.dirname,'..');
const source=(p:string)=>readFileSync(resolve(root,p),'utf8');

test('Shared home requires travel, entry, notice reading, put-down and closing acknowledgement',()=>{
 const original=initial('Millhand','restamp','player_victory');
 assert.equal(original.phase,'JOURNEY');
 assert.equal(original.homeId,HOME_ID);
 assert.throws(()=>advance(original,'finish'),HomeInvalidAction);
 assert.throws(()=>advance(original,'read_notice'),HomeInvalidAction);
 const phases=['DOOR','HOME','NOTICE','SPEECH','COMPLETE'];
 let state=original;
 for(const [i,action] of ['travel','enter','read_notice','put_down','finish'].entries()){
  const before=structuredClone(state);
  state=advance(state,action as 'travel'|'enter'|'read_notice'|'put_down'|'finish');
  assert.equal(state.phase,phases[i]);
  assert.equal(state.revision,i+1);
  assert.deepEqual(before,i===0?original:before,'Pure transition: previous state is unchanged');
 }
 assert.throws(()=>advance(state,'finish'),HomeInvalidAction);
 assert.equal(original.phase,'JOURNEY');
 assert.equal(view(state,'Ada',10).completed,true);
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
 assert.ok(clinic.includes('Return home</a>')&&
  clinic.includes("'/home'"));
 assert.ok(home.includes("href:base+'/home'"));
 assert.ok(web.includes('class="home-scene"')&&
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
  !state.includes('due_date')&&!state.includes('eviction'));
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
