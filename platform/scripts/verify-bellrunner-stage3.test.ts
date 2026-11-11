import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {
  INITIAL_WRONG_BELL,advanceWrongBell,availableBellActions,
  InvalidBellAction,BELL_BRANCH_SKILL,WATCHMAN_LINE_COUNT
} from '../apps/api/src/bellrunner-wrong-bell-work.ts';

test('two evidence inspections in either order; no early conversation',()=>{
  for(const order of [['read_closure','inspect_slip'],['inspect_slip','read_closure']] as const){
    let s={...INITIAL_WRONG_BELL};
    assert.ok(!availableBellActions(s).includes('talk_watchman'));
    for(const a of order)s=advanceWrongBell(s,a);
    assert.ok(s.closureRead&&s.slipRead);
    assert.ok(availableBellActions(s).includes('talk_watchman'));
    assert.throws(()=>advanceWrongBell(s,'choose_machinery'),InvalidBellAction);
  }
});
test('watchman dialogue must be completed before any irreversible branch',()=>{
  let s=advanceWrongBell(advanceWrongBell(INITIAL_WRONG_BELL,'read_closure'),'inspect_slip');
  s=advanceWrongBell(s,'talk_watchman');
  assert.equal(s.watchmanLine,0);
  for(let i=0;i<WATCHMAN_LINE_COUNT;i++)s=advanceWrongBell(s,'continue_watchman');
  assert.equal(s.phase,'choice');
  assert.equal(s.watchmanLine,WATCHMAN_LINE_COUNT-1);
  assert.deepEqual(availableBellActions(s).filter(a=>a.startsWith('choose_')),
    ['choose_contracts','choose_trauma','choose_machinery']);
  const done=advanceWrongBell(s,'choose_trauma');
  assert.equal(done.branch,'trauma');
  assert.equal(done.phase,'committed');
  assert.deepEqual(availableBellActions(done),[]);
  assert.throws(()=>advanceWrongBell(done,'choose_contracts'),InvalidBellAction);
});
test('branch skills match the approved different Major Skill',()=>{
  assert.deepEqual(BELL_BRANCH_SKILL,{contracts:'Commerce',trauma:'Medicine',machinery:'Mechanics'});
});
