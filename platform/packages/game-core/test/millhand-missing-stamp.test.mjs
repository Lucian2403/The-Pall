import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_MISSING_STAMP,availableMissingStampActions,advanceMissingStamp,
  validateMissingStampEvidence,MISSING_STAMP_ROUTE_SKILL,STAGE_THREE_DIALOGUE_BEAT_COUNT
} from '../dist/index.js';

// Test-only values. These MUST NOT appear in the user-facing game or become canon.
const mock = {workerNumber:'TEST-NUMBER',recordedDeathDate:'1901-02-03',inspectionDate:'1901-02-04'};

test('Stage 3 starts without a fabricated worker number or dates',()=>{
  assert.deepEqual(availableMissingStampActions(INITIAL_MISSING_STAMP,null),[
    'read_cancellation_slip','turn_returned_plate'
  ]);
  assert.throws(()=>advanceMissingStamp(INITIAL_MISSING_STAMP,'show_guther',null),/wrong_stage_three_phase/);
});

for(const order of [['read_cancellation_slip','turn_returned_plate'],['turn_returned_plate','read_cancellation_slip']]) {
  test('Stage 3 evidence inspection is independent of order: '+order.join(', '),()=>{
    let s=INITIAL_MISSING_STAMP;
    for(const a of order){
      s=advanceMissingStamp(s,a,null);
      assert.equal(s.lastAction,a);
    }
    assert.equal(s.phase,'READY_TO_SPEAK');
    assert.equal(s.slipRead,true);
    assert.equal(s.plateRead,true);
    assert.deepEqual(availableMissingStampActions(s,null),['show_guther']);
    assert.deepEqual(availableMissingStampActions(s,mock),['show_guther']);
    assert.equal(advanceMissingStamp(s,'show_guther',null).phase,'CONFRONT');
    assert.throws(()=>advanceMissingStamp(s,order[0],mock),/wrong_stage_three_phase/);
  });
}

for(const action of ['choose_restamp','choose_contracts','choose_records']) {
  test('Branch '+action+' follows the full dialogue once and preserves skill choice',()=>{
    let s=advanceMissingStamp(INITIAL_MISSING_STAMP,'read_cancellation_slip',mock);
    s=advanceMissingStamp(s,'turn_returned_plate',mock);
    s=advanceMissingStamp(s,'show_guther',mock);
    assert.equal(s.phase,'CONFRONT');
    assert.throws(()=>advanceMissingStamp(s,action,mock),/wrong_stage_three_phase/);
    for(let i=0;i<STAGE_THREE_DIALOGUE_BEAT_COUNT;i++){
      s=advanceMissingStamp(s,'continue_dialogue',mock);
    }
    assert.equal(s.phase,'DECISION');
    assert.deepEqual(availableMissingStampActions(s,mock),['choose_restamp','choose_contracts','choose_records']);
    s=advanceMissingStamp(s,action,mock);
    assert.equal(s.branch,action.replace('choose_',''));
    assert.equal(typeof MISSING_STAMP_ROUTE_SKILL[s.branch],'string');
    assert.throws(()=>advanceMissingStamp(s,action,mock),/wrong_stage_three_phase/);
    if(s.branch==='restamp'){
      assert.equal(s.phase,'RESTAMP');
      s=advanceMissingStamp(s,'restamp_worker_number',mock);
    }
    assert.equal(s.phase,'SELECTED');
    assert.deepEqual(availableMissingStampActions(s,mock),[]);
    assert.equal('coins' in s,false);
    assert.equal('xp' in s,false);
  });
}

test('Optional future display dates are validated but never block narrative progression',()=>{
  assert.ok(validateMissingStampEvidence(mock));
  for(const bad of [
    {...mock,inspectionDate:mock.recordedDeathDate},
    {...mock,inspectionDate:'1900-12-31'},
    {...mock,recordedDeathDate:'1901-02-31'},
    {...mock,workerNumber:''}
  ]) {
    assert.equal(validateMissingStampEvidence(bad),false);
    const s=advanceMissingStamp(advanceMissingStamp(INITIAL_MISSING_STAMP,'read_cancellation_slip',bad),'turn_returned_plate',bad);
    assert.deepEqual(availableMissingStampActions(s,bad),['show_guther']);
    assert.equal(advanceMissingStamp(s,'show_guther',null).phase,'CONFRONT');
  }
});

test('Enough talk skips confrontation but never skips choosing one of three routes',()=>{
  let s=advanceMissingStamp(INITIAL_MISSING_STAMP,'turn_returned_plate',mock);
  s=advanceMissingStamp(s,'read_cancellation_slip',mock);
  s=advanceMissingStamp(s,'show_guther',mock);
  assert.deepEqual(availableMissingStampActions(s,mock),['continue_dialogue','skip_confrontation']);
  s=advanceMissingStamp(s,'skip_confrontation',mock);
  assert.equal(s.phase,'DECISION');
  assert.equal(s.branch,null);
  assert.deepEqual(availableMissingStampActions(s,mock),['choose_restamp','choose_contracts','choose_records']);
  assert.throws(()=>advanceMissingStamp(s,'skip_confrontation',mock),/wrong_stage_three_phase/);
});

test('A returning player already at READY_TO_SPEAK can resume without resetting inspected evidence',()=>{
  let saved=advanceMissingStamp(INITIAL_MISSING_STAMP,'read_cancellation_slip',null);
  saved=advanceMissingStamp(saved,'turn_returned_plate',null);
  const restored=JSON.parse(JSON.stringify(saved));
  assert.deepEqual(availableMissingStampActions(restored,null),['show_guther']);
  assert.equal(advanceMissingStamp(restored,'show_guther',null).phase,'CONFRONT');
  assert.equal(saved.revision,2);
});
