import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newEncounter} from '@the-pall/game-core/combat-v0.5.1';
import {
  initialClinic,advanceClinic,clinicView,CLINIC_FEE,ClinicInvalidAction
} from '../apps/api/src/millhand-clinic-state.ts';
import {clinicianAssessment,clinicianDischarge} from '../apps/web/src/lib/millhand-clinic-dialogue.ts';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const result=(outcome:'player_victory'|'player_defeat',hp:number)=>{
  const state=newEncounter('dogman',{seed:5});
  state.status='finished';state.outcome=outcome;state.player.hp=hp;
  return state;
};
test('Bellrunner shares the existing 10-coin examination and Health policy',()=>{
  assert.equal(CLINIC_FEE,10);
  for(const [outcome,hp] of [['player_victory',50],['player_victory',34],['player_defeat',0]] as const){
    const fight=result(outcome,hp);
    const before=initialClinic(fight);
    assert.equal(before.before.hp,hp);
    assert.equal(before.outcome,outcome);
    assert.equal(before.paid,false);
    assert.equal(clinicView(before,20).conditionType,hp===50?'unhurt':'other');
    let s=before;
    for(const [action,phase] of [
      ['examine','EXAMINED'],['speak','SPOKEN'],['review_price','PRICED'],
      ['pay','PAID'],['leave','LEFT']] as const){
       s=advanceClinic(s,action);
       assert.equal(s.phase,phase);
    }
    assert.equal(s.paid,true);
    assert.equal(s.after?.hp,50);
    assert.equal(s.after?.stamina,90);
    assert.equal(s.after?.composure,80);
    assert.equal(s.after?.fatigue,0);
    assert.equal(s.after?.stress,0);
    assert.equal(s.after?.momentum,0);
    assert.deepEqual(s.after?.wounds,[]);
    assert.equal(s.before.hp,hp);
    assert.equal(clinicView(s,10).nextStage,8);
    assert.throws(()=>advanceClinic(s,'pay'),ClinicInvalidAction);
  }
});
test('Bellrunner approved speech, real findings, and differing Dogman arrivals',()=>{
  const shared=read('apps/web/src/lib/SharedTutorialClinic.svelte');
  const authorized=read('../docs/05-gameplay/onboarding/bellrunner/clinic-treatment.md');
  for(const line of [
    'What happened?','A man tried to take my bag. He came at me with a club.',
    "Sit down. I'll have a look.",'How much will it cost?',
    'Ten coins. That covers the examination and any basic treatment you need.',
    'All right. Go ahead.'
  ]){
    assert.ok(shared.includes(line),'Missing approved Bellrunner dialogue: '+line);
    assert.ok(authorized.includes(line),'Not present in approved script: '+line);
  }
  assert.match(shared,/The passerby helps you through the city clinic door/);
  assert.match(shared,/You arrive at the city clinic on your own/);
  assert.doesNotMatch(shared,/Dogman lowers his club and clears the passage/);
  assert.doesNotMatch(shared,/helps you through the streets to the city clinic/);
  assert.match(shared,/BELLRUNNER_PRICED_BEATS:PRICED_DIALOGUE_BEATS/);
  assert.match(shared,/STITCHER_PRICED_BEATS/);
  assert.match(shared,/arrivalIndex<0/);
  assert.match(shared,/onclick=\{advanceArrival\}/);
  assert.match(shared,/origin==='Millhand'/);
  assert.equal(clinicianAssessment(result('player_victory',50).player,'unhurt'),
    'No injuries found. No treatment needed.');
  assert.equal(clinicianDischarge('unhurt'),
    "The examination's done. No treatment needed. You're free to go.");
});
test('Both origins reuse one clinic API, state table, paid transaction and UI',()=>{
  const api=read('apps/api/src/millhand-clinic-routes.ts');
  const web=read('apps/web/src/lib/SharedTutorialClinic.svelte');
  const combat=read('apps/web/src/lib/BellrunnerDogmanCombatScene.svelte');
  const index=read('apps/api/src/index.ts');
  const home=read('apps/web/src/lib/CharacterHome.svelte');
  const rewind=read('apps/api/src/millhand-stage-rewind-routes.ts');
  assert.ok(api.includes("registerSharedClinicRoutes(app,'Bellrunner'"));
  assert.ok(api.includes("registerSharedClinicRoutes(app,'Millhand'"));
  assert.ok(read('apps/web/src/lib/shared-finale-origins.ts').includes('player_character_dogman_combat'));
  assert.ok(api.includes('UPDATE player_characters SET coins=coins-$2,current_health=max_health'));
  assert.ok(api.includes('player_character_clinic_receipts'));
  assert.ok(api.includes('initialClinic(combat.rows[0].state)'));
  assert.ok(index.includes('registerBellrunnerClinicRoutes(api)'));
  assert.ok(web.includes('FINALE_ORIGINS[origin].clinicPath'));
  assert.ok(web.includes("playCoinTransactionSfx()"));
  assert.ok(web.includes("origin==='Millhand'"));
  assert.ok(combat.includes('<CombatClinicContinuation {characterId} {origin}/>'));
  // The transition inherits the actual Millhand nine-slice primary frame,
  // not a one-off dark CSS rectangle.
  const continuation=read('apps/web/src/lib/CombatClinicContinuation.svelte');
  assert.ok(continuation.includes('class="pall-story-dialogue-section combat-outcome-actions"'));
  assert.ok(continuation.includes('class="pall-framed-button primary-choice clinic-transition"'));
  assert.ok(!combat.includes('background:#3b291a'));
  const nineSlice=read('apps/web/src/lib/pall-story-landscape.css');
  assert.ok(nineSlice.includes("url('/ui-kit/buttons/button-normal-trim.png')"));
  assert.ok(nineSlice.includes("url('/ui-kit/buttons/button-hover-trim.png')"));
  assert.ok(nineSlice.includes("url('/ui-kit/buttons/button-pressed-trim.png')"));
  const shell=read('apps/web/src/lib/TutorialShell.svelte');
  assert.ok(shell.includes("'← Back to Stage '+rewindTargetStage"));
  assert.ok(shell.includes('completed Dogman fight'));
  assert.ok(rewind.includes('if(stage===7||stage===8)'));
  assert.ok(home.includes('clinicHref(character.id,character.origin)'));
  assert.ok(rewind.includes('if(bellrunner&&(expectedStage===7||expectedStage===8))'));
  assert.ok(rewind.includes('if(stage===7||stage===8)'));
  assert.ok(rewind.includes("const left=expectedStage===8"));
  assert.ok(rewind.includes("visit.phase!=='LEFT'"));
  assert.ok(rewind.includes('DELETE FROM player_character_dogman_combat_receipts'));
  const m=read('apps/web/src/routes/characters/[id]/millhand/clinic/+page.svelte');
  const b=read('apps/web/src/routes/characters/[id]/bellrunner/clinic/+page.svelte');
  assert.ok(m.includes('SharedTutorialClinic origin="Millhand"'));
  assert.ok(b.includes('SharedTutorialClinic origin="Bellrunner"'));
});
