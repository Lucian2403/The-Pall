import test from 'node:test';
import assert from 'node:assert/strict';
import {INITIAL_PLATEWORK,advancePlatework,availableActions,WORK_ACTION_OBJECT} from '../dist/index.js';

const steps = {
  straighten: ['read_paper','set_stamps','look_at_bent_plate','straighten','stamp_number','check_number','finish_checking','return_paper'],
  replace: ['read_paper','set_stamps','look_at_bent_plate','replace','stamp_number','check_number','finish_checking','return_paper'],
  stamp_as_is_fix: ['read_paper','set_stamps','look_at_bent_plate','stamp_as_is','stamp_number','check_number','fix_mark','finish_checking','return_paper'],
  stamp_as_is_replace: ['read_paper','set_stamps','look_at_bent_plate','stamp_as_is','stamp_number','check_number','replace_marked_plate','finish_checking','return_paper']
};

for (const [label,actions] of Object.entries(steps)) {
  test('Millhand platework '+label+' finishes exactly once with correct branch state',()=>{
    let state={...INITIAL_PLATEWORK};
    for (const action of actions) {
      assert.ok(availableActions(state).includes(action), `available: ${state.phase} ${action}`);
      const before=state;
      state=advancePlatework(state,action);
      assert.equal(state.revision,before.revision+1);
      assert.notEqual(state,before);
      assert.ok(WORK_ACTION_OBJECT[action]);
    }
    assert.equal(state.phase,'COMPLETE');
    assert.deepEqual(availableActions(state),[]);
    assert.throws(()=>advancePlatework(state,'return_paper'),/wrong_work_phase/);
    assert.equal(state.handling,label.startsWith('stamp_as_is')?'stamp_as_is':label);
    if(label.startsWith('stamp_as_is')) {
      assert.equal(state.markQuality,'CLEAR');
      assert.equal(state.correction,label==='stamp_as_is_fix'?'fix_mark':'replace_marked_plate');
    } else assert.equal(state.correction,null);
    assert.equal('coins' in state,false);
    assert.equal('xp' in state,false);
    assert.equal('inventory' in state,false);
  });
}
test('Bending plate is mandatory and cannot be decided before examination',()=>{
  let state=advancePlatework(INITIAL_PLATEWORK,'read_paper');
  state=advancePlatework(state,'set_stamps');
  assert.deepEqual(availableActions(state),['look_at_bent_plate']);
  assert.throws(()=>advancePlatework(state,'straighten'),/wrong_work_phase/);
});
test('Poor stamp cannot skip inspection or correction',()=>{
  let state={...INITIAL_PLATEWORK};
  for (const a of ['read_paper','set_stamps','look_at_bent_plate','stamp_as_is','stamp_number']) state=advancePlatework(state,a);
  assert.throws(()=>advancePlatework(state,'finish_checking'),/wrong_work_phase/);
  state=advancePlatework(state,'check_number');
  assert.equal(state.phase,'CORRECT');
  assert.equal(state.markQuality,'POOR');
  assert.deepEqual(availableActions(state),['fix_mark','replace_marked_plate']);
  assert.throws(()=>advancePlatework(state,'finish_checking'),/wrong_work_phase/);
});
test('Wrong-object and out-of-order commands never mutate initial state',()=>{
  assert.throws(()=>advancePlatework(INITIAL_PLATEWORK,'stamp_number'),/wrong_work_phase/);
  assert.deepEqual(INITIAL_PLATEWORK,{
    phase:'READ_PAPER',revision:0,handling:null,bentPlateExamined:false,
    correction:null,markQuality:'UNMARKED',lastAction:null
  });
});
