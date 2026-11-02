import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialWageClaim,availableWageClaimActions,advanceWageClaim,WageClaimInvalidAction
} from '../dist/index.js';

function perform(state,action){
  assert.ok(availableWageClaimActions(state).includes(action),
    state.phase+' does not allow '+action);
  return advanceWageClaim(state,action);
}
function advanceAll(state,count){
  for(let i=0;i<count;i++)state=perform(state,'continue_dialogue');
  return state;
}
test('Three routes and both demand choices reach one real saved stance without an invented fight',()=>{
  for(const branch of ['restamp','contracts','records']){
    for(const choice of ['read_demand','ask_who_sent']){
      for(const [stance,expected] of [
        ['brace_and_defend','brace'],['keep_moving','moving'],['use_cart_cover','cart']
      ]){
        let s=initialWageClaim(branch);
        assert.equal(s.phase,'OPENING');
        assert.equal(s.revision,0);
        assert.equal(s.branch,branch);
        assert.throws(()=>advanceWageClaim(s,'read_demand'),WageClaimInvalidAction);
        s=advanceAll(s,7);
        assert.equal(s.phase,'DEMAND_CHOICE');
        assert.deepEqual(availableWageClaimActions(s),['read_demand','ask_who_sent']);
        s=perform(s,choice);
        assert.equal(s.demandChoice,choice==='read_demand'?'read':'challenge');
        s=advanceAll(s,3);
        assert.equal(s.phase,'COMMON_EXCHANGE');
        s=advanceAll(s,6);
        assert.equal(s.phase,'SHARE_EVIDENCE');
        assert.equal(s.evidenceShared,false);
        s=perform(s,'share_route_evidence');
        assert.equal(s.phase,'GOING_HOME');
        assert.equal(s.evidenceShared,true);
        s=perform(s,'tell_going_home');
        s=advanceAll(s,7);
        assert.equal(s.phase,'CHOOSE_POSITION');
        assert.deepEqual(availableWageClaimActions(s),[
          'brace_and_defend','keep_moving','use_cart_cover']);
        s=perform(s,stance);
        assert.equal(s.stance,expected);
        assert.equal(s.phase,'FIGHT_PENDING');
        assert.deepEqual(availableWageClaimActions(s),[]);
        assert.throws(()=>advanceWageClaim(s,stance),WageClaimInvalidAction);
        assert.equal(s.branch,branch);
        assert.equal('coins' in s,false);
        assert.equal('health' in s,false);
        assert.equal('ordinaryXp' in s,false);
      }
    }
  }
});
test('Neither a wrong-route action nor a duplicate choice advances the confrontation',()=>{
  let s=advanceAll(initialWageClaim('records'),7);
  s=perform(s,'read_demand');
  assert.throws(()=>advanceWageClaim(s,'ask_who_sent'),WageClaimInvalidAction);
  assert.throws(()=>advanceWageClaim({...s,revision:-1},'continue_dialogue'),WageClaimInvalidAction);
});
