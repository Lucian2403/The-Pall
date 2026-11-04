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
import {
  clinicianAssessment,clinicianDischarge,clinicianFatigue
} from '../apps/web/src/lib/millhand-clinic-dialogue.ts';

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

test('Clinician remarks depend on actual wounds, blood loss and Health, not invented treatment',()=>{
  const normal={hp:50,hpMax:50,stamina:90,fatigue:0,bleed:0,wounds:[]};
  assert.equal(clinicianAssessment(normal,'unhurt'),'No injuries found. No treatment needed.');
  assert.equal(clinicianFatigue(normal),null);
  const lowHealth={...normal,hp:19,stamina:29};
  assert.match(clinicianAssessment(lowHealth,'other'),/taken a beating/);
  assert.doesNotMatch(clinicianAssessment(lowHealth,'other'),/cut needs cleaning/i);
  assert.match(clinicianFatigue(lowHealth)??'',/worn yourself out/);
  const cutting={...normal,hp:38,wounds:[{type:'cut',zone:'head',severity:'minor'}]};
  assert.equal(clinicianAssessment(cutting,'cut'),"Needs cleaning. I'll dress it.");
  const impact={...normal,hp:26,wounds:[{type:'impact',zone:'torso',severity:'serious'}]};
  assert.match(clinicianAssessment(impact,'other'),/fight has left you hurt/);
  assert.doesNotMatch(clinicianAssessment(impact,'other'),/dress it/);
  const bleeding={...normal,hp:24,bleed:2};
  assert.match(clinicianAssessment(bleeding,'other'),/still bleeding/);
  assert.match(clinicianDischarge('unhurt'),/No treatment needed/);
  assert.match(clinicianDischarge('other'),/fit to get back on your feet/);
});

test('Clinic dialogue and journal match earlier stage presentation',()=>{
  const web=source('apps/web/src/routes/characters/[id]/millhand/clinic/+page.svelte');
  const frame=web.match(/\\.clinic-dialogue\\{[^}]*\\}/)?.[0]??'';
  assert.ok(frame.includes('background:transparent;'),
    'Transparent frame corners must show the clinic, not a solid pale rectangle');
  assert.ok(frame.includes("border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png')"),
    'Reuse the approved dialogue frame artwork');
  assert.ok(web.includes("color:#21150e;margin:0 0 13px}") &&
    web.includes('font:16px/1.45 var(--pall-font-reading,Georgia,serif)'),
    'Increase dialogue contrast without changing its established font or size');
  assert.ok(web.includes('      </div>\\n\\n      {#if journalOpen}') &&
    web.includes('bind:this={journalElement}') &&
    web.includes('class="journal-entries"') &&
    !web.includes('.journal{position:absolute'),
    'The optional journal belongs below the painted scene, not over the clinic');
  assert.ok(web.includes('background:#e6d5b5;color:#24160e;') &&
    web.includes('border-top:2px solid #94704a') &&
    web.includes('font:600 16px/1.55 var(--pall-font-reading,Georgia,serif)'),
    'The journal uses the established full-width parchment and reading typography');
});

test('Web and API wire the clinic without altering original combat rules',()=>{
  const api=source('apps/api/src/millhand-clinic-routes.ts');
  const web=source('apps/web/src/routes/characters/[id]/millhand/clinic/+page.svelte');
  const clinician=source('apps/web/src/lib/millhand-clinic-dialogue.ts');
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
  assert.ok(clinician.includes('No injuries found. No treatment needed.'));
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
  const clinicArt=readFileSync(resolve(root,'apps/web/static/locations/clinic/clinic-workshop-cold.webp'));
  assert.equal(clinicArt.toString('ascii',0,4),'RIFF','Clinic artwork must be WebP');
  assert.equal(clinicArt.toString('ascii',8,12),'WEBP','Clinic artwork must be WebP');
  assert.ok(clinicArt.length>40000&&clinicArt.length<400000,
    'Use optimized, real owner-supplied illustrated clinic artwork');
  assert.ok(web.includes("url('/locations/clinic/clinic-workshop-cold.webp')") &&
    web.includes('class="clinic-scene"') &&
    web.includes('height:clamp(650px,65vw,820px)') &&
    web.includes('class="clinic-dialogue"') &&
    web.includes('position:absolute;z-index:5;top:3.5%;right:2.4%') &&
    web.includes("url('/ui-kit/frames/dialogue-frame-trim.png')") &&
    web.includes('class="medical-record"') &&
    web.includes('class="journal"') &&
    web.includes('aria-expanded={journalOpen}') &&
    !web.includes('class="clinic-layout"') &&
    !web.includes('class="small-stats"') &&
    !web.includes('class="condition"'),
    'The clinic must remain an immersive scene with a framed dialogue overlay and optional details');
  assert.ok(web.includes('clinicianAssessment(clinic.before,clinic.conditionType)') &&
    web.includes('clinicianFatigue(clinic.before)') &&
    web.includes('clinicianDischarge(clinic.conditionType)') &&
    web.includes('sceneStage={7}') &&
    web.includes('Pay 10 coins'),
    'The clinician must narrate saved facts and keep the existing action sequence');
  const rewind=source('apps/api/src/millhand-stage-rewind-routes.ts');
  const shell=source('apps/web/src/lib/TutorialShell.svelte');
  assert.ok(rewind.includes('if(expectedStage===7||expectedStage===8)') &&
    rewind.includes('unsafe_clinic_health_state') &&
    rewind.includes('DELETE FROM player_character_clinic_receipts') &&
    rewind.includes('DELETE FROM player_character_clinic WHERE character_id') &&
    rewind.includes('wasPaid?10:0') &&
    rewind.includes('tutorial_stage=6,tutorial_status=\'NOT_STARTED\'') &&
    shell.includes('Back to Stage ') &&
    shell.includes('fromStage===7||fromStage===8') &&
    shell.includes('rewindTargetStage') &&
    rewind.includes('if(expectedStage===7||expectedStage===8)') &&
    rewind.includes('completedClinic') &&
    web.includes("character={...character,tutorial:clinic.phase==='LEFT'"),
    'Stage 7 must safely rewind to a replayable Stage 6, reversing only committed clinic payment');
  assert.equal(CLINIC_FEE,10);
});
