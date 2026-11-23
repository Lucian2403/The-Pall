import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newEncounter,step} from '../packages/game-core/vendor/combat-v0.5.1/combat.mjs';
import {initializeOwlerCombat} from '../apps/api/src/stitcher-owler-combat-opening.ts';
import {narrateCommittedTurn} from '../apps/api/src/combat-narration.ts';
import {narrateCommittedRounds} from '../apps/api/src/combat-round-narration.ts';
import {groupCombatRounds} from '../apps/web/src/lib/millhand-combat-chronicle.ts';
import {stitcherActions,INITIAL_STITCHER,type StitcherState}
  from '../apps/api/src/stitcher-work.ts';
import type {CombatState,CombatEvent,CombatAction}
  from '@the-pall/game-core/combat-v0.5.1';
const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const health={current_health:50,max_health:50};
const ready=(preparation:'reason'|'cart'|'brace'):StitcherState=>({
 ...INITIAL_STITCHER,stage:5,phase:'fight_ready',revision:28,
 branch:'trolley',stage5Witnessed:true,stage5Hold:true,
 stage5Preparation:preparation
});
const act=(s:CombatState,action:CombatAction,id:string)=>step(s,action,
 {requestId:id,expectedRevision:s.revision}) as CombatState;

test('Stage V cannot fake a win and saves exactly one physical preparation',()=>{
 for(const stance of ['reason','cart','brace'] as const){
  const s=ready(stance);
  assert.deepEqual(stitcherActions(s),[]);
  assert.equal(s.stage,5);
  assert.equal(s.stage5Witnessed,true);
  assert.equal(s.stage5Hold,true);
  assert.equal(s.stage5Preparation,stance);
 }
});

test('reason, cart and brace use real range/readiness, not invented damage or items',()=>{
 const base=initializeOwlerCombat('one',health,'reason',123);
 const brace=initializeOwlerCombat('one',health,'brace',123);
 const cart=initializeOwlerCombat('one',health,'cart',123);
 assert.equal(base.scene,'owler');
 assert.equal(base.enemy.name,'Owler');
 assert.equal(base.distance,'contact');
 assert.equal(brace.distance,'contact');
 assert.equal(brace.player.readiness-base.player.readiness,2);
 assert.equal(cart.distance,'far');
 assert.equal(cart.intent?.type,'move');
 assert.match(cart.intent?.tell||'',/empty ward cart/);
 assert.deepEqual(base.player.weapon,brace.player.weapon);
 assert.deepEqual(base.player.weapon,cart.player.weapon);
 assert.equal(base.enemy.weapon.unarmed,true);
 assert.equal(base.enemy.weapon.damage,newEncounter('flint',{seed:123}).enemy.weapon.damage);
 assert.equal(base.player.bandages,0);
 assert.equal(base.player.hp,health.current_health);
 assert.deepEqual(base.receipts,[]);
 assert.throws(()=>initializeOwlerCombat('one',health,'invalid' as never,123));
 assert.throws(()=>initializeOwlerCombat('one',{current_health:0,max_health:50},'reason',123));
});

test('Owler has real defensive Guard and still obeys existing engine mechanics',()=>{
 let guarded=0,exhausted=0;
 for(let seed=1;seed<=140;seed++){
  const before=initializeOwlerCombat('defense',health,'reason',seed);
  const after=act(before,{type:'guard'},'turn-'+seed);
  if(after.intent?.type==='guard')guarded++;
  if(after.enemy.fatigue>0)exhausted++;
  assert.ok(after.enemy.hp>=0);
  assert.equal(after.player.hp<=50,true);
 }
 assert.ok(guarded>25);
 assert.ok(exhausted>=0);
});

test('shared compact Chronicle uses authoritative combat and does not mutate state',()=>{
 let s=initializeOwlerCombat('chronicle',health,'reason',9);
 const history:CombatEvent[]=[];
 for(let index=0;index<8&&s.status==='active';index++){
  const chosen:CombatAction=s.distance==='contact'&&index%3===0
   ?{type:'attack',zone:index%2===0?'head':'torso'}
   :index%2===0?{type:'guard'}:{type:'recover',mode:'breath'};
  const next=act(s,chosen,'round-'+index);
  const unmodified=JSON.stringify(next);
  const turn=narrateCommittedRounds(narrateCommittedTurn(next.events,chosen,
   s.intent,next,history),next,history);
  history.push(...turn);
  assert.equal(JSON.stringify(next),unmodified);
  assert.ok(turn.at(-1)?.roundStory?.version===3);
  s=next;
 }
 const displayed=groupCombatRounds(history);
 assert.ok(displayed.length>=3);
 for(const r of displayed){
  assert.ok(r.main.length>0);
  assert.equal(r.roundStory?.eventRefs.length,r.events.length);
 }
 assert.deepEqual(groupCombatRounds(JSON.parse(JSON.stringify(history))),displayed);
});

test('Stitcher Stage VI reuses Flint combat HUD and has correct outcome artwork',()=>{
 const ward=read('apps/web/src/lib/StitcherWardScene.svelte');
 const route=read('apps/web/src/routes/characters/[id]/stitcher/combat/+page.svelte');
 const shell=read('apps/web/src/lib/TutorialShell.svelte');
 const shared=read('apps/web/src/lib/MillhandCombatScene.svelte');
 const engine=read('packages/game-core/vendor/combat-v0.5.1/combat.mjs');
 const api=read('apps/api/src/stitcher-owler-combat-routes.ts');
 assert.match(ward,/Confront Owler/);
 assert.match(route,/encounter="owler"/);
 assert.match(route,/MillhandCombatScene/);
 assert.doesNotMatch(route,/backToStageFive/,
   'Stage 6 must use actual developer rewind, not read-only Stage V navigation');
 assert.match(route,/stage:6,status:battle.status==='finished'/,
   'Combat start must immediately update the shell stage so Back to Stage 5 can appear');
 assert.match(route,/tutorial:\{stage:6,status:result.status==='finished'/);
 assert.match(shell,/canRewind && rewindFromStage!==null && rewindTargetStage!==null/);
 assert.match(shell,/This discards Owler combat and the saved Chronicle/);
 const rewind=read('apps/api/src/millhand-stage-rewind-routes.ts');
 assert.match(rewind,/if\(expectedStage===6\)\{/);
 assert.match(rewind,/DELETE FROM player_character_owler_combat_receipts/);
 assert.match(rewind,/DELETE FROM player_character_owler_combat WHERE/);
 assert.match(rewind,/phase:'prepare_door',stage5Line:0,stage5Preparation:null/);
 assert.match(rewind,/current_health=\$2/);
 assert.match(shell,/class="scene-journal-button"/);
 const journal=read('apps/web/src/lib/PersonalJournal.svelte');
 assert.ok(shared.includes('registerSceneJournal?.({title:isOwler')&&
   shared.includes('entries:ended?[combatOpening')&&
   journal.includes('id="personal-journal"')&&
   journal.includes('class="reading-area journal-reading"'),
   'Current fight text must be displayed beneath the shared Current tab');
 assert.doesNotMatch(shared,/id="combat-personal-journal"|journalOpen|class="journal-entries"/);
 assert.doesNotMatch(ward,/id="stitcher-ward-journal"|journalOpen|class="journal-entries"/);
 assert.match(shared,/locations\/stitcher\/service-corridor.webp/);
 assert.match(shared,/locations\/stitcher\/owler-defeated.webp/);
 assert.match(shared,/locations\/stitcher\/owler.webp/);
 assert.match(shared,/<CombatRoundChronicle/);
 assert.match(shared,/The patient stays in ordinary care/);
 assert.match(shared,/I'm cancelling the transfer/);
 assert.doesNotMatch(shared,/<details class="round-expanded">/);
 assert.match(engine,/scene==='owler'&&state.round>1/);
 assert.match(api,/player_character_stitcher_ward/);
 assert.match(api,/stage5Witnessed!==true/);
 assert.match(api,/stage5Hold!==true/);
 assert.match(api,/combat_preparation_mismatch/);
 assert.match(api,/patient_safe=\$6,transfer_cancelled=\$7/);
 assert.doesNotMatch(api,/coins=coins\+|ordinaryXp|items=items\+/);
});

test('schema records true win or loss separately from the patient rescue',()=>{
 const sql=read('db/migrations/0021_stitcher_owler_combat.sql');
 const registration=read('apps/api/src/index.ts');
 const script=read('scripts/stitcher-migrate.mjs');
 assert.match(sql,/outcome TEXT CHECK/);
 assert.match(sql,/patient_safe BOOLEAN NOT NULL DEFAULT FALSE/);
 assert.match(sql,/transfer_cancelled BOOLEAN NOT NULL DEFAULT FALSE/);
 assert.match(sql,/player_character_owler_combat_receipts/);
 assert.match(registration,/registerStitcherOwlerCombatRoutes\(api\)/);
 assert.match(script,/0021_stitcher_owler_combat.sql/);
});
