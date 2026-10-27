import test from 'node:test';
import assert from 'node:assert/strict';
import {planMillhandRewind,MillhandRewindInvalid,INITIAL_PLATEWORK} from '../dist/index.js';

const base={Craftsmanship:3};
function plan(stage,branch=null,phase=null,plate='COMPLETE',bonuses=base,job=null){
  return planMillhandRewind(stage,bonuses,branch,plate,phase,job);
}

test('Stage 2 -> Stage 1 preserves character starting bonus and removes only Stage 2 data',()=>{
  const rewind=plan(2,null,null,'STAMP');
  assert.equal(rewind.toStage,1);
  assert.deepEqual(rewind.nextBonuses,base);
  assert.equal(rewind.removePlatework,true);
  assert.equal(rewind.removeMissingStamp,false);
  assert.equal(rewind.resetPlatework,false);
});

test('Stage 3 -> Stage 2 restores Stage 2 work from the beginning',()=>{
  const rewind=plan(3,null,'READY_TO_SPEAK');
  assert.equal(rewind.toStage,2);
  assert.equal(rewind.resetPlatework,true);
  assert.equal(rewind.removeMissingStamp,true);
  assert.equal(rewind.removePlatework,false);
  assert.equal(INITIAL_PLATEWORK.phase,'READ_PAPER');
  assert.equal(INITIAL_PLATEWORK.revision,0);
});

for(const [branch,skill] of [['restamp','Industry'],['contracts','Commerce'],['records','Scholarship']]){
  test('Stage 4 -> Stage 3 rolls back precisely one '+skill+' award for '+branch,()=>{
    const rewind=plan(4,branch,'SELECTED','COMPLETE',{Craftsmanship:3,[skill]:1});
    assert.equal(rewind.toStage,3);
    assert.deepEqual(rewind.nextBonuses,base);
    assert.equal(rewind.removeMissingStamp,true);
    assert.equal(rewind.resetPlatework,false);
    assert.equal(rewind.removePlatework,false);
  });
}

test('Stage 3 incomplete restamp rolls back awarded +1 when returning to Stage 2',()=>{
  const rewind=plan(3,'restamp','RESTAMP','COMPLETE',{Craftsmanship:3,Industry:1});
  assert.equal(rewind.toStage,2);
  assert.deepEqual(rewind.nextBonuses,base);
});

test('Rejects attempting to rewind from Stage 1 or beyond unimplemented Stage 4',()=>{
  for(const stage of [0,1,6,8,99]){
    assert.throws(()=>plan(stage),MillhandRewindInvalid);
  }
});
test('Rejects stale or corrupt dependent stage states instead of modifying character',()=>{
  assert.throws(()=>plan(4,null,'SELECTED'),/unsafe_stage_three_state/);
  assert.throws(()=>plan(4,'records','CONFRONT','COMPLETE',{Craftsmanship:3,Scholarship:1}),/unsafe_stage_three_state/);
  assert.throws(()=>plan(3,'records','SELECTED','COMPLETE',{Craftsmanship:3,Scholarship:1}),/unsafe_stage_three_state/);
  assert.throws(()=>plan(3,null,'INSPECT','STAMP'),/unsafe_work_state/);
  assert.throws(()=>plan(2,null,null,'COMPLETE'),/unsafe_work_state/);
});
test('Fail closed on any unexpected acquired skill or mismatch',()=>{
  assert.throws(()=>plan(4,'contracts','SELECTED','COMPLETE',{Craftsmanship:3,Commerce:2}),/unsafe_skill_state/);
  assert.throws(()=>plan(3,null,'INSPECT','COMPLETE',{Craftsmanship:3,Scholarship:1}),/unsafe_skill_state/);
  assert.throws(()=>plan(2,null,null,'READ_PAPER',{Craftsmanship:2}),/unsafe_skill_state/);
  assert.throws(()=>plan(4,'__proto__','SELECTED','COMPLETE',{Craftsmanship:3}),/unsafe_stage_three_state/);
});

test('Stage 5 -> Stage 4 replays the chosen job and preserves Stage3 awarded skill',()=>{
  for(const [branch,skill] of [['restamp','Industry'],['contracts','Commerce'],['records','Scholarship']]){
    const rewind=plan(5,branch,'SELECTED','COMPLETE',{Craftsmanship:3,[skill]:1},'DONE');
    assert.equal(rewind.toStage,4);
    assert.deepEqual(rewind.nextBonuses,{Craftsmanship:3,[skill]:1});
    assert.equal(rewind.removeSecondJob,true);
    assert.equal(rewind.removeMissingStamp,false);
    assert.equal(rewind.resetPlatework,false);
  }
});
test('Stage 4 -> Stage 3 clears unfinished Stage4 and resets chosen Stage3 route',()=>{
  const rewind=plan(4,'records','SELECTED','COMPLETE',{Craftsmanship:3,Scholarship:1},'READ_WAGE_RECORD');
  assert.equal(rewind.toStage,3);
  assert.equal(rewind.removeSecondJob,true);
  assert.equal(rewind.removeMissingStamp,true);
  assert.deepEqual(rewind.nextBonuses,base);
});
test('Unknown or unfinished Stage4 data blocks unsafe Stage5 rewinds',()=>{
  assert.throws(()=>plan(5,'records','SELECTED','COMPLETE',{Craftsmanship:3,Scholarship:1},null),/unsafe_second_job_state/);
  assert.throws(()=>plan(5,'contracts','SELECTED','COMPLETE',{Craftsmanship:3,Commerce:1},'COMPARE_RECORDS'),/unsafe_second_job_state/);
  assert.throws(()=>plan(3,null,'INSPECT','COMPLETE',base,'CHECK_LOAD'),/unsafe_second_job_state/);
});
