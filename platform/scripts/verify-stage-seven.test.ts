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
  const frame=web.slice(web.indexOf('  .clinic-dialogue{'),web.indexOf('  .eyebrow,.speaker{'));
  assert.ok(frame.includes('background:transparent;'),
    'Transparent frame corners must show the clinic, not a solid pale rectangle');
  assert.ok(frame.includes("border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png')"),
    'Reuse the approved dialogue frame artwork');
  assert.ok(web.includes("color:#21150e;margin:0 0 13px}") &&
    web.includes('font:var(--dialogue-text,17px)/1.55 var(--pall-font-reading,Georgia,serif)'),
    'Keep the dialogue contrast and use the shared fixed dialogue type scale');
  assert.ok(web.includes('bind:this={journalElement}') &&
    web.includes('class="journal-entries"') &&
    !web.includes('.journal{position:absolute') &&
    web.indexOf('id="clinic-journal"') > web.indexOf('</aside>'),
    'The optional journal belongs below the painted scene, not over the clinic');
  assert.ok(web.includes('background:#e6d5b5;color:#24160e;') &&
    web.includes('border-top:2px solid #94704a') &&
    web.includes('font:600 16px/1.55 var(--pall-font-reading,Georgia,serif)'),
    'The journal uses the established full-width parchment and reading typography');
});

test('Priced clinic conversation advances one owner-approved beat at a time before payment',()=>{
  const web=source('apps/web/src/routes/characters/[id]/millhand/clinic/+page.svelte');
  const script=web.slice(web.indexOf('const PRICED_DIALOGUE_BEATS:'),web.indexOf('  type Character='));
  assert.equal((script.match(/kind:'(?:narration|speech)'/g)??[]).length,9,
    'The price conversation has two stage directions and seven spoken lines');
  for(const line of [
    'The clinician looks you over, then pulls a chair closer.',
    'How much is this gonna cost me?',
    'Ten coins.',
    'Ten? Just for having a look?',
    'For the examination and whatever treatment you need.',
    "Bloody hell. That's half the money I've got left.",
    "Well, you can barely stand straight. I'd say you need looking at.",
    'You glance down at yourself, then back at the clinician.',
    'Yeah... alright. Just get on with it.'
  ])assert.ok(script.includes(line),'Missing approved dialogue: '+line);
  const price=web.slice(web.indexOf("{:else if clinic.phase==='PRICED'}"),
    web.indexOf("{:else if clinic.phase==='PAID'}"));
  assert.ok(price.includes("pricedBeat.kind==='narration'") &&
    price.includes('{pricedBeat.text}') &&
    price.includes('<p class="speaker">{dialogueSpeakerLabel(pricedBeat.speaker)}</p>') &&
    web.includes("from '$lib/dialogue-speaker'") &&
    price.includes('{#if pricedAtEnd}') &&
    price.includes('class="charge-slip"') &&
    price.includes('Clinic charge') && price.includes('{clinic.fee}') &&
    price.includes('{clinic.coins}'),
    'Render one current beat, with price details only after the final line');
  assert.ok(web.includes("clinic.phase==='PRICED' && !pricedAtEnd") &&
    web.includes('onclick={advancePricedDialogue}>Continue</button>') &&
    web.includes("action==='pay'&&!pricedAtEnd") &&
    web.includes('pricedDialogueIndex+=1;') &&
    web.includes("if(clinic?.phase!=='PRICED')pricedDialogueIndex=0;"),
    'Continue is local and payment is guarded until the conversation completes');
  assert.ok(web.includes('class="narration stage-direction"') &&
    web.includes('.stage-direction{font-style:italic}'),
    'Stage directions keep the established reading face and use italics');
});

test('Clinic record is separate from scene dialogue; payment and ambience are confirmed-only',()=>{
  const web=source('apps/web/src/routes/characters/[id]/millhand/clinic/+page.svelte');
  const shell=source('apps/web/src/lib/TutorialShell.svelte');
  const audio=source('apps/web/src/lib/pall-audio.ts');
  const rewind=source('apps/api/src/millhand-stage-rewind-routes.ts');
  const dialogue=web.slice(web.indexOf('<aside class="clinic-dialogue"'),web.indexOf('</aside>'));
  const record=web.indexOf('<section class="medical-record-wrapper"');
  const journal=web.indexOf('{#if journalOpen}');
  assert.ok(record>web.indexOf('</aside>') && record<web.indexOf('id="clinic-journal"'),
    'Optional numerical record belongs below the scene but before the journal');
  assert.ok(!dialogue.includes('medical-record') && !dialogue.includes('Health after the fight:'),
    'Do not repeat the clinician\'s condition inside the speech frame');
  assert.ok(web.includes('<details class="medical-record">') &&
    !web.includes('<details class="medical-record" open'),
    'Examination record stays collapsed by default');
  assert.ok(web.includes('clinicBackdrop={true}') &&
    shell.includes('if(clinicBackdrop)return claimMedicalClinicAmbience()') &&
    audio.includes('claimMedicalClinicAmbience') &&
    audio.includes('medical-clinic-ambience.mp3'),
    'The medical soundscape must only follow the actual illustrated clinic');
  assert.ok(web.includes("action==='pay'&&result.paid===true&&result.coins<clinic.coins") &&
    web.includes('if(paidNow)playCoinTransactionSfx()') &&
    shell.includes("data.coinDelta>0)playCoinTransactionSfx()") &&
    rewind.includes('coinDelta:wasPaid?10:0'),
    'Coin cues follow actual accepted debits/refunds, not button clicks or stale requests');
  assert.ok(audio.includes('ui-coins1.wav') && audio.includes('ui-coins2.wav') &&
    audio.includes('playCoinTransactionSfx') && audio.includes('0.12'),
    'Both owner coin samples are used in one combined transaction cue');
});

test('Owner coin and clinic ambience exports are really present and decodable file types',()=>{
  const dir='apps/web/static/audio/the-pall/';
  for(const name of ['ui-coins1.wav','ui-coins2.wav']){
    const wav=readFileSync(resolve(root,dir+name));
    assert.equal(wav.toString('ascii',0,4),'RIFF',name+' must be a real WAV');
    assert.equal(wav.toString('ascii',8,12),'WAVE',name+' must be PCM audio');
    assert.ok(wav.length>20000&&wav.length<250000,'Coin effect has a plausible short size');
  }
  const clinicAudio=readFileSync(resolve(root,dir+'medical-clinic-ambience.mp3'));
  assert.equal(clinicAudio.toString('ascii',0,3),'ID3','Clinic ambience must be browser MP3');
  assert.ok(clinicAudio.length>500000&&clinicAudio.length<5000000,
    'Clinic ambience must be a practical browser-ready compressed export');
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
  assert.ok(web.includes("clinic?.conditionType==='cut'"));
  assert.ok(web.includes('Examine condition'));
  assert.ok(web.includes('Review the price'));
  assert.ok(web.includes('Pay 10 coins'));
  assert.ok(clinician.includes('No injuries found. No treatment needed.'));
  assert.ok(battle.includes('Continue to medical care'));
  const shared=source('apps/web/src/lib/pall-owner-ui.css');
  const wage=source('apps/web/src/lib/MillhandWageClaimScene.svelte');
  assert.ok(web.includes('class="pall-framed-button advance primary-choice"'));
  assert.ok(web.includes('class="pall-framed-button" type="button" onclick={refresh}'));
  assert.ok(wage.includes('class="pall-framed-button combat-link primary-choice"'));
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
    web.includes('<ActivityLayout mode="scene" stageAspect={1672 / 941}') &&
    web.includes('class="clinic-scene pall-story-landscape"') &&
    web.includes('class="reading-column pall-story-dialogue-section"') &&
    web.includes('class="clinic-dialogue"') &&
    web.includes('.clinic-dialogue{position:relative;') &&
    !/\.clinic-dialogue\{[^}]*overflow-y:auto/.test(web) &&
    web.includes("url('/ui-kit/frames/dialogue-frame-trim.png')") &&
    web.includes('class="medical-record"') &&
    web.includes('class="journal"') &&
    web.includes("registerSceneJournal?.({id:'clinic-journal'") &&
    !web.includes('class="pall-framed-button journal-toggle"') &&
    !web.includes('class="clinic-layout"') &&
    !web.includes('class="small-stats"') &&
    !web.includes('class="condition"'),
    'The clinic must remain a fully visible painted scene with a framed, content-height dialogue beside it and optional details');
  assert.ok(web.includes('clinicianAssessment(clinic.before,clinic.conditionType)') &&
    web.includes('clinicianFatigue(clinic.before)') &&
    web.includes('clinicianDischarge(clinic.conditionType)') &&
    web.includes('sceneStage={7}') &&
    web.includes('Pay 10 coins'),
    'The clinician must narrate saved facts and keep the existing action sequence');
  const rewind=source('apps/api/src/millhand-stage-rewind-routes.ts');
  const shell=source('apps/web/src/lib/TutorialShell.svelte');
  assert.ok(rewind.includes('if(expectedStage===7)') &&
    rewind.includes('unsafe_clinic_health_state') &&
    rewind.includes('DELETE FROM player_character_clinic_receipts') &&
    rewind.includes('DELETE FROM player_character_clinic WHERE character_id') &&
    rewind.includes('wasPaid?10:0') &&
    rewind.includes('tutorial_stage=6,tutorial_status=\'NOT_STARTED\'') &&
    shell.includes('Back to Stage ') &&
    shell.includes('fromStage===7') &&
    shell.includes('fromStage===8') &&
    shell.includes('rewindTargetStage') &&
    rewind.includes('if(expectedStage===7)') &&
    rewind.includes('if(expectedStage===8)') &&
    web.includes("character={...character,tutorial:clinic.phase==='LEFT'"),
    'Stage 7 must safely rewind to a replayable Stage 6, reversing only committed clinic payment');
  assert.equal(CLINIC_FEE,10);
});
