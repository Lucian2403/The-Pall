import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {
  initialBellrunnerSecondJob,advanceBellrunnerSecondJob,availableStageFourActions,
  InvalidStageFourAction,STAGE_FOUR_FACT,
  STAGE_FOUR_OPENING_LENGTH,STAGE_FOUR_REVELATION_LENGTH,
  STAGE_FOUR_TRAUMA_TRIAGE_LENGTH,STAGE_FOUR_TRAUMA_ASSISTANCE_LENGTH,
  STAGE_FOUR_TRAUMA_REGISTER_LENGTH
} from '../apps/api/src/bellrunner-second-job-work.ts';
import type {StageFourBranch,StageFourState,StageFourAction} from '../apps/api/src/bellrunner-second-job-work.ts';
import {BELLRUNNER_STAGE_FOUR} from '../apps/web/src/lib/bellrunner-stage4-copy.ts';

function opening(branch:StageFourBranch):StageFourState{
  let s=initialBellrunnerSecondJob(branch);
  for(let i=0;i<STAGE_FOUR_OPENING_LENGTH[branch]-(branch==='trauma'?1:0);i++)
    s=advanceBellrunnerSecondJob(s,'continue_opening');
  assert.equal(s.phase,branch==='trauma'?'opening':'inspect');
  assert.equal(s.openingLine,STAGE_FOUR_OPENING_LENGTH[branch]-1);
  return s;
}
function revelation(s:StageFourState):StageFourState{
  assert.equal(s.phase,'revelation');
  for(let i=0;i<STAGE_FOUR_REVELATION_LENGTH[s.branch]-(s.branch==='trauma'?1:0);i++)
    s=advanceBellrunnerSecondJob(s,'continue_revelation');
  assert.equal(s.phase,s.branch==='trauma'?'revelation':'finish');
  return s;
}
function finished(s:StageFourState,action:StageFourAction){
  const saved=advanceBellrunnerSecondJob(s,action);
  assert.equal(saved.phase,'done');
  assert.ok(saved.journalFact,'The route must produce one specific journal fact');
  assert.equal(saved.journalFact,STAGE_FOUR_FACT[saved.branch]);
  const exited=advanceBellrunnerSecondJob(saved,'leave_for_gate');
  assert.equal(exited.phase,'exited');
  assert.deepEqual(availableStageFourActions(exited),[]);
  assert.throws(()=>advanceBellrunnerSecondJob(exited,'leave_for_gate'),InvalidStageFourAction);
  return exited;
}

test('Contracts reconciles two records, lets the player challenge an unfair attendance category',()=>{
  for(const method of ['request_attendance_basis','enter_written_objection'] as const){
    let s=opening('contracts');
    assert.deepEqual(availableStageFourActions(s),['compare_shift_records']);
    s=advanceBellrunnerSecondJob(s,'compare_shift_records');
    assert.equal(s.observation,'matching_closed_work_block');
    s=advanceBellrunnerSecondJob(s,'inspect_absence_category');
    assert.equal(s.phase,'choose');
    assert.deepEqual(availableStageFourActions(s),['request_attendance_basis','enter_written_objection']);
    s=advanceBellrunnerSecondJob(s,method);
    assert.equal(s.method,method);
    s=revelation(s);
    finished(s,'submit_certificate');
  }
});
test('Trauma follows owner-revised patient choice, two different responses, assistance, register and exchange',()=>{
  const copy=BELLRUNNER_STAGE_FOUR.trauma;
  assert.equal(copy.opening[0].text,'Two workers have been brought to the first-aid point.');
  assert.equal(copy.opening[2].speaker,'Attendant');
  assert.equal(copy.assistance.length,STAGE_FOUR_TRAUMA_ASSISTANCE_LENGTH);
  assert.equal(copy.register.observations.length,STAGE_FOUR_TRAUMA_REGISTER_LENGTH);
  assert.equal(copy.register.escort.length,STAGE_FOUR_TRAUMA_REGISTER_LENGTH);
  assert.equal(copy.revelation.length,STAGE_FOUR_REVELATION_LENGTH.trauma);
  assert.match(copy.revelation[2].text,/why the hell/);
  assert.match(copy.revelation[5].text,/unless someone with the authority changes it/);
  for(const first of ['prioritize_urgent_worker','prioritize_mobile_worker'] as const){
    for(const assist of ['take_observations','bring_next_worker'] as const){
      let s=opening('trauma');
      assert.deepEqual(availableStageFourActions(s),[
        'prioritize_urgent_worker','prioritize_mobile_worker'
      ],'Triage choices appear on the last attendant beat, not on a separate report screen');
      assert.throws(()=>advanceBellrunnerSecondJob(s,'continue_opening'),InvalidStageFourAction);
      s=advanceBellrunnerSecondJob(s,first);
      const priority=first==='prioritize_mobile_worker'?'corrected':'urgent';
      assert.equal(s.priority,priority);
      assert.equal(s.phase,'triage_response');
      assert.equal(s.triageLine,0);
      assert.equal(copy.triageResponse[priority].length,STAGE_FOUR_TRAUMA_TRIAGE_LENGTH[priority]);
      assert.equal(copy.triageResponse[priority][0].speaker,
        priority==='urgent'?'Player':'Attendant');
      for(let i=0;i<STAGE_FOUR_TRAUMA_TRIAGE_LENGTH[priority];i++){
        assert.deepEqual(availableStageFourActions(s),['continue_triage']);
        s=advanceBellrunnerSecondJob(s,'continue_triage');
      }
      assert.equal(s.phase,'detail');
      for(let i=0;i<STAGE_FOUR_TRAUMA_ASSISTANCE_LENGTH-1;i++){
        assert.deepEqual(availableStageFourActions(s),['continue_detail']);
        s=advanceBellrunnerSecondJob(s,'continue_detail');
      }
      assert.deepEqual(availableStageFourActions(s),[
        'take_observations','bring_next_worker'
      ],'Assistance choices appear under the Attendant speaking about both methods');
      s=advanceBellrunnerSecondJob(s,assist);
      assert.equal(s.method,assist);
      assert.equal(s.phase,'confirm');
      assert.equal(s.registerLine,0);
      for(let i=0;i<STAGE_FOUR_TRAUMA_REGISTER_LENGTH-1;i++){
        assert.deepEqual(availableStageFourActions(s),['continue_register']);
        s=advanceBellrunnerSecondJob(s,'continue_register');
      }
      assert.deepEqual(availableStageFourActions(s),['ask_about_classification'],
        'Single player action after finding the non-work classification');
      s=advanceBellrunnerSecondJob(s,'ask_about_classification');
      assert.equal(s.observation,'ask_about_classification');
      assert.equal(s.journalFact,STAGE_FOUR_FACT.trauma);
      s=revelation(s);
      assert.equal(s.revelationLine,8);
      assert.deepEqual(availableStageFourActions(s),['finish_handover'],
        'Finish the handover must accompany the final narration, not another summary screen');
      finished(s,'finish_handover');
    }
  }
});
test('Trauma in-flight older saves can still reach the revised story without losing their branch',()=>{
  let s={...opening('trauma'),phase:'inspect' as const};
  s=advanceBellrunnerSecondJob(s,'prioritize_urgent_worker');
  assert.equal(s.phase,'triage_response');
  // Before the revision, existing scenes could be saved in detail,
  // confirm, choose or finish without the new per-conversation counters.
  const detail={...s,phase:'detail' as const,detailLine:undefined};
  assert.deepEqual(availableStageFourActions(detail),['continue_detail']);
  const confirm={...s,phase:'confirm' as const,registerLine:undefined};
  assert.deepEqual(availableStageFourActions(confirm),['continue_register']);
  const choose={...s,phase:'choose' as const};
  assert.deepEqual(availableStageFourActions(choose),['ask_about_classification']);
  const finish={...s,phase:'finish' as const};
  assert.deepEqual(availableStageFourActions(finish),['finish_handover']);
});
test('Machinery records a pinned bypass without authorising repairs or site entry',()=>{
  for(const check of ['trace_bell_rod','compare_linkage_marks'] as const){
    for(const method of ['mark_pin_position','request_second_check'] as const){
      let s=opening('machinery');
      s=advanceBellrunnerSecondJob(s,'inspect_safety_linkage');
      assert.equal(s.observation,'shutoff_engaged_bell_moving');
      s=advanceBellrunnerSecondJob(s,check);
      assert.equal(s.method,check);
      s=advanceBellrunnerSecondJob(s,'show_mechanic_link');
      s=advanceBellrunnerSecondJob(s,method);
      assert.equal(s.observation,method);
      s=revelation(s);
      finished(s,'record_inspection');
    }
  }
});
test('branch ownership, ordered actions and revision monotonicity',()=>{
  for(const branch of ['contracts','trauma','machinery'] as const){
    const s=initialBellrunnerSecondJob(branch);
    assert.deepEqual(availableStageFourActions(s),['continue_opening']);
    assert.throws(()=>advanceBellrunnerSecondJob(s,'submit_certificate'),InvalidStageFourAction);
    assert.throws(()=>advanceBellrunnerSecondJob(s,'prioritize_mobile_worker'),InvalidStageFourAction);
    assert.throws(()=>advanceBellrunnerSecondJob(s,'trace_bell_rod'),InvalidStageFourAction);
    assert.deepEqual(s,initialBellrunnerSecondJob(branch),'Reducer may not mutate the saved state');
    const next=advanceBellrunnerSecondJob(s,'continue_opening');
    assert.equal(next.revision,1);
    assert.equal(s.revision,0);
  }
});
test('approved NPC lines and existing, reusable artwork are the only scene dependencies',()=>{
  assert.deepEqual(Object.values(BELLRUNNER_STAGE_FOUR).map(s=>s.opening.length),[5,3,3]);
  assert.deepEqual(Object.values(BELLRUNNER_STAGE_FOUR).map(s=>s.revelation.length),[4,9,4]);
  assert.deepEqual(Object.values(BELLRUNNER_STAGE_FOUR).map(s=>s.image),[
    '/locations/contracts/contracts-office.webp',
    '/locations/clinic/clinic-workshop-cold.webp',
    '/locations/industrial/industrial-courtyard.webp'
  ]);
  const scene=readFileSync(new URL('../apps/web/src/lib/BellrunnerSecondJobScene.svelte',
    import.meta.url),'utf8');
  assert.ok(scene.includes('mode="scene"')&&scene.includes('dialogueSpeakerLabel(currentLine.speaker)'));
  assert.ok(scene.includes('SCENE_JOURNAL_CONTEXT')&&scene.includes('journalFact'));
  assert.ok(scene.includes("First Aid Line — Helping the Attendant")&&
    scene.includes("First Aid Line — The Medical Register")&&
    scene.includes("state.phase==='triage_response'"));
  assert.ok(!scene.includes('WORKER A</small>')&&!scene.includes('REGISTER CLASSIFICATION</small>'),
    'No documentary triage cards may displace the revised character dialogue');
  assert.ok(scene.includes('snapshot.availableActions'));
  const api=readFileSync(new URL('../apps/api/src/bellrunner-second-job-routes.ts',
    import.meta.url),'utf8');
  assert.ok(api.includes("state:{phase:string;branch:BellBranch|null}")&&
    api.includes("state?.phase!=='committed'"));
  assert.ok(!api.includes('major_skill_bonuses')&&!api.includes('coins=')&&!api.includes('ordinary_xp='),
    'Stage 4 must not pay or award a second skill level');
  assert.ok(api.includes('FOR UPDATE')&&api.includes('request_hash'));
});
