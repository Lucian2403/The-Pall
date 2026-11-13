import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newEncounter,step} from '@the-pall/game-core/combat-v0.5.1';
import type {CombatState} from '@the-pall/game-core/combat-v0.5.1';
import {initializeDogmanCombat} from '../apps/api/src/bellrunner-dogman-combat-opening.ts';
import {combatView} from '../apps/api/src/millhand-combat-view.ts';

const health={current_health:50,max_health:50};
const id='00000000-0000-4000-8000-000000000001';
const turn=(state:CombatState,type:'guard'|'attack',number:number)=>step(state,
  type==='guard'?{type:'guard'}:{type:'attack',zone:'torso'},
  {expectedRevision:state.revision,requestId:'00000000-0000-4000-8000-'+String(number).padStart(12,'0')});

test('shared engine retains Flint baseline; Dogman carries a lighter club',()=>{
  const flint=newEncounter('flint',{seed:10});
  const dogman=newEncounter('dogman',{seed:10});
  assert.equal(flint.enemy.name,'Flint');
  assert.deepEqual([flint.enemy.weapon.minDamage,flint.enemy.weapon.maxDamage],[14,17]);
  assert.deepEqual([dogman.enemy.weapon.minDamage,dogman.enemy.weapon.maxDamage],[12,15]);
  assert.equal(dogman.enemy.weapon.accuracy,flint.enemy.weapon.accuracy);
  assert.equal(dogman.enemy.weapon.type,'blunt');
  assert.equal(dogman.enemy.hp,flint.enemy.hp,'No invented Health inflation');
  assert.equal(dogman.player.weapon.unarmed,true,'Player remains unarmed');
  assert.equal(dogman.player.bandages,0);
});
test('all three Stage V stances produce distinct engine starts',()=>{
  const stand=initializeDogmanCombat(id,health,'defend',4);
  const street=initializeDogmanCombat(id,health,'street',4);
  const cart=initializeDogmanCombat(id,health,'cart',4);
  assert.deepEqual([stand.distance,stand.player.readiness],['contact',2]);
  assert.deepEqual([street.distance,street.side],['near',true]);
  assert.deepEqual([cart.distance,cart.side,cart.intent?.type],['far',true,'move']);
  assert.match(cart.intent?.tell??'',/work cart/);
  assert.ok(!combatView(cart,[],'cart').legalActions.includes('attack'));
  assert.ok(combatView(stand,[],'brace').legalActions.includes('attack'));
  assert.throws(()=>initializeDogmanCombat(id,health,'invalid' as 'street',4));
  assert.throws(()=>initializeDogmanCombat(id,{current_health:0,max_health:50},'cart',4));
});
test('Dogman Dodge is a telegraphed sidestep using shared reach',()=>{
  let s=newEncounter('dogman',{seed:7});
  s.intent={type:'move',to:'side',speed:7,signal:'repositioning',tell:'Dogman prepares to sidestep.'};
  const beforeHp=s.enemy.hp;
  s=turn(s,'attack',1);
  assert.equal(s.distance,'near');
  assert.equal(s.enemy.hp,beforeHp,'Fast sidestep changes range before the fist arrives');
  assert.ok(s.events.some(e=>e.kind==='move'&&e.actor==='enemy'&&e.text.includes('sideways')));
  assert.ok(s.events.some(e=>e.kind==='miss'&&e.actor==='player'));
  assert.equal(turn(s,'guard',2).revision,2);
});
test('Dogman uses slightly more defense than Flint without endlessly guarding',()=>{
  let flintGuards=0,dogmanGuards=0,dogmanSides=0;
  const sample=500;
  for(let seed=1;seed<=sample;seed++){
    const d=newEncounter('dogman',{seed,player:{momentum:12}});
    const f=newEncounter('flint',{seed,player:{momentum:12}});
    const a=turn(d,'guard',1);
    const b=turn(f,'guard',1);
    if(a.intent?.type==='guard')dogmanGuards++;
    if(a.intent?.type==='move'&&a.intent.to==='side')dogmanSides++;
    if(b.intent?.type==='guard')flintGuards++;
  }
  assert.ok(dogmanGuards>flintGuards,'Dogman Guard '+dogmanGuards+' should exceed Flint '+flintGuards);
  assert.ok(dogmanSides>0&&dogmanSides<sample*.20,
    'Dogman occasional sidestep: '+dogmanSides+'/'+sample);
  assert.ok(dogmanGuards<sample*.25,'Dogman must not spend most turns guarding');
});
test('Dogman combat persistence, route and no premature care',()=>{
  const root=new URL('../',import.meta.url);
  const read=(p:string)=>readFileSync(new URL(p,root),'utf8');
  const api=read('apps/api/src/bellrunner-dogman-combat-routes.ts');
  const page=read('apps/web/src/routes/characters/[id]/bellrunner/combat/+page.svelte');
  const scene=read('apps/web/src/lib/BellrunnerDogmanCombatScene.svelte');
  const rewind=read('apps/api/src/millhand-stage-rewind-routes.ts');
  for(const t of ['registerBellrunnerDogmanCombatRoutes','state,history,stance',
    'id=$1 AND account_id=$2 FOR UPDATE','expectedRevision','stale_revision',
    'combat_stance_mismatch','initializeDogmanCombat','player_character_dogman_combat_receipts'])
    assert.ok(api.includes(t),'Missing persistence contract: '+t);
  assert.ok(api.includes('player_character_bellrunner_dogman'));
  assert.ok(api.includes("claim?.state.phase!=='done'"));
  assert.ok(api.includes("'COMPLETED':'IN_PROGRESS'"));
  assert.ok(!api.includes('coins=$')&&!api.includes('major_skill_bonuses='));
  assert.match(rewind,/SELECT 1 FROM player_character_dogman_combat WHERE character_id=/);
  assert.match(rewind,/SELECT response FROM player_character_dogman_combat_receipts/);
  assert.match(rewind,/restoredHealth=first.player.hp/);
  assert.match(rewind,/DELETE FROM player_character_dogman_combat_receipts/);
  assert.ok(page.includes('BellrunnerDogmanCombatScene'));
  assert.ok(page.includes('claimCombatSfx'));
  assert.ok(page.includes('soundSavedCombatTurn'));
  assert.ok(scene.includes("'/characters/dogman/dogman-defeated.webp'"));
  assert.ok(scene.includes("'/locations/bellrunner/industrial-alley.webp'"));
  assert.ok(scene.includes('Dogman defeated you. Witnesses interrupted him.'));
  assert.ok(scene.includes('Your papers remain yours'));
  assert.ok(!scene.includes('/millhand/clinic'));
  assert.ok(!scene.includes('Your battle outcome and actual Health are saved.'));
  assert.ok(!scene.includes('Stage VII is not implemented'));
  assert.ok(scene.includes('class="journal-dialog"'));
  assert.ok(scene.includes('journalDialog.showModal()'));
  assert.ok(scene.includes('left:1.5%'));
  const shell=read('apps/web/src/lib/TutorialShell.svelte');
  assert.ok(shell.includes("character.origin==='Bellrunner') && character.tutorial.stage===6"));
  assert.ok(page.includes('backToStageFive'));
  assert.ok(page.includes("'/bellrunner/dogman'"));
});
