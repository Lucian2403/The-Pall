import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {
  initialBellrunnerSecondJob,advanceBellrunnerSecondJob,availableStageFourActions,
  InvalidStageFourAction,STAGE_FOUR_FACT,
  STAGE_FOUR_OPENING_LENGTH,STAGE_FOUR_REVELATION_LENGTH
} from '../apps/api/src/bellrunner-second-job-work.ts';
import type {StageFourBranch,StageFourState,StageFourAction} from '../apps/api/src/bellrunner-second-job-work.ts';
import {BELLRUNNER_STAGE_FOUR} from '../apps/web/src/lib/bellrunner-stage4-copy.ts';

function opening(branch:StageFourBranch):StageFourState{
  let s=initialBellrunnerSecondJob(branch);
  for(let i=0;i<STAGE_FOUR_OPENING_LENGTH[branch];i++)
    s=advanceBellrunnerSecondJob(s,'continue_opening');
  assert.equal(s.phase,'inspect');
  assert.equal(s.openingLine,STAGE_FOUR_OPENING_LENGTH[branch]-1);
  return s;
}
function revelation(s:StageFourState):StageFourState{
  assert.equal(s.phase,'revelation');
  for(let i=0;i<STAGE_FOUR_REVELATION_LENGTH[s.branch];i++)
    s=advanceBellrunnerSecondJob(s,'continue_revelation');
  assert.equal(s.phase,'finish');
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
test('Trauma prioritises urgent assessment, corrects the wrong click, and records who pays',()=>{
  for(const first of ['prioritize_urgent_worker','prioritize_mobile_worker'] as const){
    for(const assist of ['take_observations','bring_next_worker'] as const){
      for(const question of ['ask_for_worksite_note','ask_about_charge'] as const){
        let s=opening('trauma');
        s=advanceBellrunnerSecondJob(s,first);
        assert.equal(s.priority,first==='prioritize_mobile_worker'?'corrected':'urgent');
        s=advanceBellrunnerSecondJob(s,assist);
        assert.equal(s.method,assist);
        s=advanceBellrunnerSecondJob(s,'compare_medical_register');
        assert.equal(s.journalFact,STAGE_FOUR_FACT.trauma);
        s=advanceBellrunnerSecondJob(s,question);
        assert.equal(s.observation,question);
        s=revelation(s);
        finished(s,'finish_handover');
      }
    }
  }
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
  assert.deepEqual(Object.values(BELLRUNNER_STAGE_FOUR).map(s=>s.revelation.length),[4,4,4]);
  assert.deepEqual(Object.values(BELLRUNNER_STAGE_FOUR).map(s=>s.image),[
    '/locations/contracts/contracts-office.webp',
    '/locations/clinic/clinic-workshop-cold.webp',
    '/locations/industrial/industrial-courtyard.webp'
  ]);
  const scene=readFileSync(new URL('../apps/web/src/lib/BellrunnerSecondJobScene.svelte',
    import.meta.url),'utf8');
  assert.ok(scene.includes('mode="scene"')&&scene.includes('dialogueSpeakerLabel(currentLine.speaker)'));
  assert.ok(scene.includes('SCENE_JOURNAL_CONTEXT')&&scene.includes('journalFact'));
  assert.ok(scene.includes('snapshot.availableActions'));
  const api=readFileSync(new URL('../apps/api/src/bellrunner-second-job-routes.ts',
    import.meta.url),'utf8');
  assert.ok(api.includes("state:{phase:string;branch:BellBranch|null}")&&
    api.includes("state?.phase!=='committed'"));
  assert.ok(!api.includes('major_skill_bonuses')&&!api.includes('coins=')&&!api.includes('ordinary_xp='),
    'Stage 4 must not pay or award a second skill level');
  assert.ok(api.includes('FOR UPDATE')&&api.includes('request_hash'));
});
