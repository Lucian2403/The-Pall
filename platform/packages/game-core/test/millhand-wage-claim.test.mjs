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
        s=beats(s,7);
        assert.equal(s.phase,'CHOOSE_EVIDENCE');
        assert.deepEqual(availableWageClaimActions(s),['share_route_evidence','previous_dialogue']);
        s=apply(s,'share_route_evidence');
        s=beats(s,3);
        assert.equal(s.phase,'LEAVING');
        s=apply(s,'say_going_home');
        s=beats(s,8);
        assert.equal(s.phase,'CHOOSE_STANCE');
        assert.deepEqual(availableWageClaimActions(s),
          ['brace_and_defend','keep_moving','use_cart_as_cover','previous_dialogue']);
        s=apply(s,stance);
        assert.equal(s.phase,'DONE');
        assert.equal(s.stance,stance==='brace_and_defend'?'brace'
          :stance==='keep_moving'?'moving':'cart');
        assert.equal(s.branch,branch);
        assert.deepEqual(availableWageClaimActions(s),['previous_dialogue']);
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
 assert.deepEqual(availableWageClaimActions(saved),['continue_dialogue','previous_dialogue']);
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

test('Previous dialogue walks backwards across every phase with saved state intact',()=>{
 let s=initialWageClaim('contracts');
 assert.equal(availableWageClaimActions(s).includes('previous_dialogue'),false);
 s=beats(s,5);
 s=apply(s,'read_demand');
 s=beats(s,3);
 s=beats(s,7);
 s=apply(s,'share_route_evidence');
 s=beats(s,3);
 s=apply(s,'say_going_home');
 s=beats(s,8);
 s=apply(s,'use_cart_as_cover');
 const revision=s.revision;
 const phases=[
  ['CHOOSE_STANCE',0,'cart'], // the saved cart stance is cleared
  ['CORNERED_EXCHANGE',7],['CORNERED_EXCHANGE',6],
  ['CORNERED_EXCHANGE',5],['CORNERED_EXCHANGE',4],
  ['CORNERED_EXCHANGE',3],['CORNERED_EXCHANGE',2],
  ['CORNERED_EXCHANGE',1],['CORNERED_EXCHANGE',0],
  ['LEAVING',0],
  ['EVIDENCE_EXCHANGE',2],['EVIDENCE_EXCHANGE',1],['EVIDENCE_EXCHANGE',0],
  ['CHOOSE_EVIDENCE',0],
  ['COMMON_EXCHANGE',6],['COMMON_EXCHANGE',5],['COMMON_EXCHANGE',4],['COMMON_EXCHANGE',3],
  ['COMMON_EXCHANGE',2],['COMMON_EXCHANGE',1],['COMMON_EXCHANGE',0],
  ['APPROACH_EXCHANGE',2],['APPROACH_EXCHANGE',1],['APPROACH_EXCHANGE',0],
  ['CHOOSE_APPROACH',0],
  ['OPENING',4],['OPENING',3],['OPENING',2],['OPENING',1],['OPENING',0]
 ];
 for(const [phase,index] of phases){
   s=apply(s,'previous_dialogue');
   assert.equal(s.phase,phase);
   assert.equal(s.dialogueIndex,index);
   assert.equal(s.stance,null);
   assert.equal(s.branch,'contracts');
 }
 assert.equal(s.approach,null);
 assert.equal(s.revision,revision+phases.length);
 assert.equal(availableWageClaimActions(s).includes('previous_dialogue'),false);
 assert.throws(()=>advanceWageClaim(s,'previous_dialogue'),WageClaimInvalidAction);
 const repeated=apply(s,'continue_dialogue');
 assert.equal(repeated.dialogueIndex,1);
 assert.equal(apply(repeated,'previous_dialogue').dialogueIndex,0);
});
test('Stage 6 pre-combat boundary returns to Stage 5 stance selection',()=>{
 let s=initialWageClaim('restamp');
 s=beats(s,5);s=apply(s,'challenge_authority');s=beats(s,3);
 s=beats(s,7);s=apply(s,'share_route_evidence');s=beats(s,3);
 s=apply(s,'say_going_home');s=beats(s,8);
 s=apply(s,'brace_and_defend');
 const saved=JSON.parse(JSON.stringify(s));
 const rewound=apply(saved,'previous_dialogue');
 assert.equal(rewound.phase,'CHOOSE_STANCE');
 assert.equal(rewound.stance,null);
 assert.equal(rewound.revision,s.revision+1);
 const changed=apply(rewound,'use_cart_as_cover');
 assert.equal(changed.phase,'DONE');
 assert.equal(changed.stance,'cart');
});


for(const branch of ['restamp','contracts','records']){
 for(const originalApproach of ['read_demand','challenge_authority']){
  test('Previous dialogue stops at every selected choice for '+branch+' / '+originalApproach,()=>{
   let s=beats(initialWageClaim(branch),5);
   assert.equal(s.phase,'CHOOSE_APPROACH');
   s=apply(s,originalApproach);
   assert.equal(s.phase,'APPROACH_EXCHANGE');
   s=apply(s,'previous_dialogue');
   assert.equal(s.phase,'CHOOSE_APPROACH','Previously selected demand choice must reappear');
   assert.equal(s.approach,null);
   assert.ok(!availableWageClaimActions(s).includes('continue_dialogue'),
     'The choice must not auto-advance');
   s=apply(s,originalApproach);
   s=beats(s,3);
   s=beats(s,7);
   assert.equal(s.phase,'CHOOSE_EVIDENCE');
   s=apply(s,'share_route_evidence');
   s=apply(s,'previous_dialogue');
   assert.equal(s.phase,'CHOOSE_EVIDENCE','Return to evidence choice');
   assert.deepEqual(availableWageClaimActions(s),['share_route_evidence','previous_dialogue']);
   s=apply(s,'share_route_evidence');
   s=beats(s,3);
   assert.equal(s.phase,'LEAVING');
   s=apply(s,'say_going_home');
   s=apply(s,'previous_dialogue');
   assert.equal(s.phase,'LEAVING','Return to the decision to leave');
   assert.ok(availableWageClaimActions(s).includes('say_going_home'));
   assert.ok(!availableWageClaimActions(s).includes('continue_dialogue'));
   s=apply(s,'say_going_home');
   s=beats(s,8);
   assert.equal(s.phase,'CHOOSE_STANCE');
   s=apply(s,'brace_and_defend');
   const rewind=apply(s,'previous_dialogue');
   assert.equal(rewind.phase,'CHOOSE_STANCE','Stage 6 return must stop at stance choice');
   assert.equal(rewind.stance,null);
   assert.ok(!availableWageClaimActions(rewind).includes('continue_dialogue'));
   assert.equal(rewind.branch,branch,'The saved Stage 4 route must not change');
   assert.equal(apply(rewind,'keep_moving').stance,'moving');
  });
 }
}

test('Owner R03: Flint gesture is its own saved beat and Previous stops on it',()=>{
 let s=initialWageClaim('records');
 const forward=(action)=>{s=advanceWageClaim(s,action);};
 for(let i=0;i<5;i++)forward('continue_dialogue');
 forward('read_demand');
 for(let i=0;i<3;i++)forward('continue_dialogue');
 assert.equal(s.phase,'COMMON_EXCHANGE');
 for(let i=0;i<5;i++)forward('continue_dialogue');
 assert.equal(s.dialogueIndex,5,'Gesture precedes final Flint reply');
 forward('continue_dialogue');
 assert.equal(s.dialogueIndex,6,'Last reply remains its own beat');
 forward('previous_dialogue');
 assert.equal(s.dialogueIndex,5,'Previous returns to Flint chin scratch');
 forward('continue_dialogue');
 assert.equal(s.dialogueIndex,6);
 forward('continue_dialogue');
 assert.equal(s.phase,'CHOOSE_EVIDENCE','Only seventh common beat transitions to evidence choice');
 assert.deepEqual(availableWageClaimActions(s),['share_route_evidence','previous_dialogue']);
});
