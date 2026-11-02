import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialWageClaim,availableWageClaimActions,advanceWageClaim,WageClaimInvalidAction
} from '../dist/index.js';

const apply=(s,action)=>{
  assert.ok(availableWageClaimActions(s).includes(action),s.phase+' must offer '+action);
  return advanceWageClaim(s,action);
};
const beats=(s,n)=>{for(let i=0;i<n;i++)s=apply(s,'continue_dialogue');return s;};

for(const branch of ['restamp','contracts','records']){
  for(const approach of ['read_demand','challenge_authority']){
    for(const stance of ['brace_and_defend','keep_moving','use_cart_as_cover']){
      test('Stage 5 '+branch+' / '+approach+' / '+stance+' reaches real fight boundary',()=>{
        let s=initialWageClaim(branch);
        assert.equal(s.revision,0);
        assert.equal(s.phase,'OPENING');
        assert.equal(s.dialogueIndex,0);
        assert.throws(()=>advanceWageClaim(s,'brace_and_defend'),WageClaimInvalidAction);
        s=beats(s,5);
        assert.equal(s.phase,'CHOOSE_APPROACH');
        s=apply(s,approach);
        assert.equal(s.approach,approach==='read_demand'?'read':'challenge');
        s=beats(s,3);
        assert.equal(s.phase,'COMMON_EXCHANGE');
        s=beats(s,6);
        assert.equal(s.phase,'CHOOSE_EVIDENCE');
        assert.deepEqual(availableWageClaimActions(s),['share_route_evidence']);
        s=apply(s,'share_route_evidence');
        s=beats(s,3);
        assert.equal(s.phase,'LEAVING');
        s=apply(s,'say_going_home');
        s=beats(s,8);
        assert.equal(s.phase,'CHOOSE_STANCE');
        assert.deepEqual(availableWageClaimActions(s),
          ['brace_and_defend','keep_moving','use_cart_as_cover']);
        s=apply(s,stance);
        assert.equal(s.phase,'DONE');
        assert.equal(s.stance,stance==='brace_and_defend'?'brace'
          :stance==='keep_moving'?'moving':'cart');
        assert.equal(s.branch,branch);
        assert.deepEqual(availableWageClaimActions(s),[]);
        assert.equal('coins' in s,false);
        assert.equal('xp' in s,false);
        assert.equal('health' in s,false);
        const saved=JSON.parse(JSON.stringify(s));
        assert.deepEqual(saved,s);
        assert.throws(()=>advanceWageClaim(saved,'continue_dialogue'),WageClaimInvalidAction);
      });
    }
  }
}
test('Each spoken beat advances only on a committed action and survives reload',()=>{
 let s=initialWageClaim('records');
 s=apply(s,'continue_dialogue');
 assert.equal(s.dialogueIndex,1);
 const saved=JSON.parse(JSON.stringify(s));
 assert.deepEqual(availableWageClaimActions(saved),['continue_dialogue']);
 assert.equal(saved.dialogueIndex,1);
 assert.equal(apply(saved,'continue_dialogue').dialogueIndex,2);
 assert.throws(()=>advanceWageClaim({...s,dialogueIndex:99},'continue_dialogue'),
   WageClaimInvalidAction);
 assert.throws(()=>advanceWageClaim({...s,revision:-1},'continue_dialogue'),
   WageClaimInvalidAction);
});
test('Invalid or unapproved branch cannot create a Stage 5 state',()=>{
 assert.throws(()=>initialWageClaim('depot'),WageClaimInvalidAction);
});
