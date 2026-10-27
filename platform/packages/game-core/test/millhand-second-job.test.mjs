import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialSecondJob,availableSecondJobActions,advanceSecondJob,SecondJobInvalidAction
} from '../dist/index.js';

function apply(s,action){
  assert.ok(availableSecondJobActions(s).includes(action),s.phase+' does not allow '+action);
  return advanceSecondJob(s,action);
}
function enterConversation(s,action,count){
  s=apply(s,action);
  for(let i=0;i<count;i++)s=apply(s,'continue_dialogue');
  return s;
}

test('Industry: one previously stamped number, inspect load, choose secure transport, truthfully record plates',()=>{
  let s=initialSecondJob('restamp');
  assert.equal(s.phase,'CHECK_LOAD');
  assert.equal(s.revision,0);
  assert.deepEqual(availableSecondJobActions(s),['check_load']);
  s=apply(s,'check_load');
  assert.deepEqual(availableSecondJobActions(s),['secure_plates','carry_smaller_loads']);
  s=apply(s,'secure_plates');
  assert.equal(s.transport,'secured');
  s=apply(s,'compare_delivery_list');
  s=enterConversation(s,'speak_to_depot_clerk',5);
  assert.equal(s.phase,'CHOOSE_RECEIPT');
  s=apply(s,'record_goods_as_plates');
  assert.equal(s.receipt,'recorded_plates');
  s=apply(s,'complete_delivery');
  assert.equal(s.phase,'DONE');
  assert.deepEqual(availableSecondJobActions(s),[]);
  assert.equal('ordinaryXp' in s,false);
  assert.equal('coins' in s,false);
  assert.throws(()=>advanceSecondJob(s,'complete_delivery'),SecondJobInvalidAction);
});

test('Industry alternative: carry smaller loads and request correction before delivery',()=>{
  let s=initialSecondJob('restamp');
  for(const a of ['check_load','carry_smaller_loads','compare_delivery_list','speak_to_depot_clerk']){
    s=apply(s,a);
  }
  for(let i=0;i<5;i++)s=apply(s,'continue_dialogue');
  s=apply(s,'request_delivery_correction');
  assert.equal(s.transport,'smaller_loads');
  assert.equal(s.receipt,'requested_correction');
  s=apply(s,'complete_delivery');
  assert.equal(s.phase,'DONE');
});

for(const [challenge,choice] of [
  ['request_seal_check','seal_check'],
  ['mark_conflicting_entries','written_complaint']
]){
  test('Commerce: compare sealed entries and submit only chosen '+challenge,()=>{
    let s=initialSecondJob('contracts');
    assert.throws(()=>advanceSecondJob(s,'submit_dispute'),SecondJobInvalidAction);
    s=apply(s,'examine_work_paper');
    s=apply(s,'compare_official_records');
    s=enterConversation(s,'speak_to_contracts_clerk',7);
    assert.equal(s.phase,'CHOOSE_CHALLENGE');
    s=apply(s,challenge);
    assert.equal(s.challenge,choice);
    s=apply(s,'submit_dispute');
    assert.equal(s.phase,'DONE');
    assert.deepEqual(availableSecondJobActions(s),[]);
  });
}
for(const [action,comparison] of [
  ['compare_neighbouring_entries','neighbouring_entries'],
  ['compare_shift_book','shift_book']
]){
  test('Scholarship: death register, later wage record, altered line, source '+comparison,()=>{
    let s=initialSecondJob('records');
    assert.deepEqual(availableSecondJobActions(s),['read_death_register']);
    assert.throws(()=>advanceSecondJob(s,'check_wage_record'),SecondJobInvalidAction);
    s=apply(s,'read_death_register');
    s=apply(s,'check_wage_record');
    s=apply(s,'examine_scraped_entry');
    s=enterConversation(s,'speak_to_archive_assistant',4);
    assert.equal(s.phase,'CHOOSE_SOURCE');
    s=apply(s,action);
    assert.equal(s.source,comparison);
    s=apply(s,'record_finding');
    assert.equal(s.phase,'DONE');
    assert.deepEqual(availableSecondJobActions(s),[]);
  });
}
test('Saved state survives JSON round-trip and never autoplays through NPC speech',()=>{
  let s=initialSecondJob('records');
  s=apply(s,'read_death_register');
  s=apply(s,'check_wage_record');
  s=apply(s,'examine_scraped_entry');
  s=apply(s,'speak_to_archive_assistant');
  const saved=JSON.parse(JSON.stringify(s));
  assert.equal(saved.dialogueIndex,0);
  assert.equal(saved.phase,'ARCHIVE_DIALOGUE');
  assert.deepEqual(availableSecondJobActions(saved),['continue_dialogue']);
  const next=apply(saved,'continue_dialogue');
  assert.equal(next.dialogueIndex,1);
  assert.equal(next.revision,saved.revision+1);
});
