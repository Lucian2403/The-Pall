import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {newEncounter} from '@the-pall/game-core/combat-v0.5.1';
import {
  CLINIC_FEE,ClinicInvalidAction,advanceClinic,classifyCondition,
  clinicView,initialClinic,defaultTutorialDischarge
} from '../apps/api/src/millhand-clinic-state.ts';
import type {CombatState} from '@the-pall/game-core/combat-v0.5.1';

const root=resolve(import.meta.dirname,'..');
const source=(name:string)=>readFileSync(resolve(root,name),'utf8');
function finished(hp=50,wounds:CombatState['player']['wounds']=[]){
  const state=newEncounter('flint',{seed:1});
  state.status='finished';state.outcome=hp===0?'player_defeat':'player_victory';
  state.player.hp=hp;state.player.wounds=wounds;state.player.fatigue=47;
  state.player.stamina=15;state.player.stress=11;state.player.momentum=27;
  return state;
}

test('Every clinical action is sequenced and every accepted action increments revision once',()=>{
  const original=finished(20);
  let state=initialClinic(original);
  assert.equal(state.revision,0);
  assert.equal(state.fee,10);
  assert.equal(state.phase,'ARRIVAL');
  assert.equal(state.paid,false);
  assert.throws(()=>advanceClinic(state,'pay'),ClinicInvalidAction);
  assert.throws(()=>advanceClinic(state,'leave'),ClinicInvalidAction);
  for(const [action,phase] of [
    ['examine','EXAMINED'],['speak','SPOKEN'],['review_price','PRICED'],
    ['pay','PAID'],['leave','LEFT']
  ] as const){
    state=advanceClinic(state,action);
    assert.equal(state.phase,phase);
  }
  assert.equal(state.revision,5);
  assert.equal(state.paid,true);
  assert.equal(state.after?.hp,50);
  assert.throws(()=>advanceClinic(state,'pay'),ClinicInvalidAction);
  assert.throws(()=>advanceClinic(state,'leave'),ClinicInvalidAction);
  assert.equal(clinicView(state,10).nextStage,8);
  assert.equal(original.player.hp,20,'Original fight is immutable');
});

test('Unhurt character receives no fictitious injury or Health restoration',()=>{
  const combat=finished();
  const before=initialClinic(combat);
  assert.equal(classifyCondition(before.before),'unhurt');
  const after=defaultTutorialDischarge(before.before);
  assert.equal(after.hp,50);
  assert.deepEqual(after.wounds,[]);
  assert.equal(after.bleed,0);
  assert.deepEqual(combat.player.wounds,[]);
  assert.equal(combat.player.hp,50);
});

test('Only a real recorded cut warrants dressing dialogue',()=>{
  const cut=finished(37,[{type:'cut',zone:'limbs',severity:'minor'}]);
  assert.equal(classifyCondition(initialClinic(cut).before),'cut');
  const impact=finished(37,[{type:'impact',zone:'torso',severity:'serious'}]);
  assert.equal(classifyCondition(initialClinic(impact).before),'other');
  const lostHealth=finished(37);
  assert.equal(classifyCondition(initialClinic(lostHealth).before),'other');
  const defeat=finished(0);
  assert.equal(classifyCondition(initialClinic(defeat).before),'other');
});

test('Paid discharge uses actual fixture defaults and retains fight history',()=>{
  const combat=finished(0,[{type:'cut',zone:'head',severity:'minor'}]);
  const state=initialClinic(combat);
  const paid=['examine','speak','review_price','pay'].reduce(
    (current,action)=>advanceClinic(current,action as 'examine'|'speak'|'review_price'|'pay'),
    state
  );
  assert.equal(paid.before.hp,0);
  assert.equal(paid.after?.hp,50);
  assert.equal(paid.after?.stamina,90);
  assert.equal(paid.after?.composure,80);
  assert.equal(paid.after?.fatigue,0);
  assert.equal(paid.after?.stress,0);
  assert.equal(paid.after?.momentum,0);
  assert.deepEqual(paid.after?.wounds,[]);
  assert.equal(combat.player.hp,0);
  assert.equal(combat.player.wounds.length,1);
  assert.equal(paid.outcome,'player_defeat');
});

test('Web and API wire the clinic without altering original combat rules',()=>{
  const api=source('apps/api/src/millhand-clinic-routes.ts');
  const web=source('apps/web/src/routes/characters/[id]/millhand/clinic/+page.svelte');
  const battle=source('apps/web/src/lib/MillhandCombatScene.svelte');
  const migration=source('db/migrations/0008_millhand_clinic.sql');
  const boot=source('apps/api/src/index.ts');
  assert.ok(boot.includes('registerMillhandClinicRoutes(api)'));
  assert.ok(api.includes('FOR UPDATE'));
  assert.ok(api.includes('coin'+'s=coins-$2,current_health=max_health'));
  assert.ok(api.includes('player_character_clinic_receipts'));
  assert.ok(api.includes('tutorial_stage=8'));
  assert.ok(!api.includes('UPDATE player_character_flint_combat'));
  assert.ok(!api.includes('ordinary_xp'));
  assert.ok(web.includes("clinic.conditionType==='cut'"));
  assert.ok(web.includes('Examine condition'));
  assert.ok(web.includes('Review the price'));
  assert.ok(web.includes('Pay 10 coins'));
  assert.ok(web.includes('No injuries found. No treatment needed.'));
  assert.ok(battle.includes('Continue to medical care'));
  const shared=source('apps/web/src/lib/pall-owner-ui.css');
  const wage=source('apps/web/src/lib/MillhandWageClaimScene.svelte');
  assert.ok(web.includes('class="pall-framed-button advance"'));
  assert.ok(web.includes('class="pall-framed-button" type="button" onclick={refresh}'));
  assert.ok(wage.includes('class="pall-framed-button combat-link"'));
  assert.ok(shared.includes('border-image-slice:50 180 45 180 fill'));
  assert.ok(shared.includes('pointer-events:auto;'));
  assert.ok(!web.includes('background:#735236;border:1px solid #d4ad78'),
    'The old flat clinic action button styling must stay retired');
  assert.ok(migration.includes('REFERENCES player_characters(id) ON DELETE RESTRICT'));
  assert.equal(CLINIC_FEE,10);
});
