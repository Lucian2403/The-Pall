import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {
  WATCHMAN_LINES,WRONG_BELL_AFTER_WATCHMAN,WRONG_BELL_BRANCHES
} from '../apps/web/src/lib/bellrunner-stage3-copy.ts';
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

test('comparison is recorded only once and only while examining evidence',()=>{
  let s=advanceWrongBell(
    advanceWrongBell(INITIAL_WRONG_BELL,'inspect_slip'),'read_closure');
  assert.ok(availableBellActions(s).includes('compare_orders'));
  s=advanceWrongBell(s,'compare_orders');
  assert.equal(s.compared,true);
  assert.ok(!availableBellActions(s).includes('compare_orders'));
  assert.throws(()=>advanceWrongBell(s,'compare_orders'),InvalidBellAction);
  s=advanceWrongBell(s,'talk_watchman');
  assert.ok(!availableBellActions(s).includes('compare_orders'));
  for(let i=0;i<WATCHMAN_LINE_COUNT;i++)s=advanceWrongBell(s,'continue_watchman');
  assert.equal(s.phase,'choice');
  assert.ok(!availableBellActions(s).includes('compare_orders'));
  assert.deepEqual(availableBellActions(s),[
    'choose_contracts','choose_trauma','choose_machinery'
  ],'Job-selection state must expose only the three approved branches');
});

test('each second-job branch commits once without a repeat skill action',()=>{
  for(const [branch,action,skill] of [
    ['contracts','choose_contracts','Commerce'],
    ['trauma','choose_trauma','Medicine'],
    ['machinery','choose_machinery','Mechanics']
  ] as const){
    let s=advanceWrongBell(
      advanceWrongBell(INITIAL_WRONG_BELL,'read_closure'),'inspect_slip');
    s=advanceWrongBell(s,'talk_watchman');
    for(let i=0;i<WATCHMAN_LINE_COUNT;i++)s=advanceWrongBell(s,'continue_watchman');
    const committed=advanceWrongBell(s,action);
    assert.equal(committed.branch,branch);
    assert.equal(committed.phase,'committed');
    assert.equal(BELL_BRANCH_SKILL[branch],skill);
    assert.deepEqual(availableBellActions(committed),[]);
    assert.throws(()=>advanceWrongBell(committed,action),InvalidBellAction);
  }
});

test('the last watchman Continue exposes the approved second bell narration',()=>{
  assert.equal(WATCHMAN_LINES.length,WATCHMAN_LINE_COUNT);
  assert.deepEqual([...WRONG_BELL_AFTER_WATCHMAN],[
    'The coughing worker tries to straighten up but struggles to catch his breath. The others watch him. Nobody moves toward the gate.',
    'The bell rings again.'
  ]);
  assert.deepEqual(Object.keys(WRONG_BELL_BRANCHES),['contracts','trauma','machinery']);
  assert.deepEqual(Object.values(WRONG_BELL_BRANCHES).map(b=>b.skillLabel),[
    'Commerce / Contracts','Medicine / Trauma','Mechanics / Industrial Machinery'
  ]);
});

test('Stage 3 UI lets players re-read evidence without changing server state',()=>{
  const ui=readFileSync(new URL(
    '../apps/web/src/routes/characters/[id]/bellrunner/wrong-bell/+page.svelte',
    import.meta.url),'utf8');
  const compare=ui.slice(ui.indexOf('function compareDocuments()'),
    ui.indexOf('async function refresh()'));
  const read=ui.slice(ui.indexOf('function inspectDocument('),
    ui.indexOf('function compareDocuments()'));
  assert.ok(read.includes("if(snapshot.state.closureRead){detail='closure';return;}"));
  assert.ok(read.includes("if(snapshot.state.slipRead){detail='slip';return;}"));
  assert.ok(compare.includes("if(snapshot.state.compared){detail='comparison';return;}"));
  assert.ok(ui.includes("snapshot.state.closureRead?'Review the closure notice'"));
  assert.ok(ui.includes("snapshot.state.slipRead?'Review the dispatch slip'"));
  assert.ok(ui.includes("snapshot.state.compared?'Review the comparison'"));
  assert.ok(ui.includes("onclick={()=>{inspectDocument('closure');}}"),
    'The location hotspot remains available after the first reading');
  assert.ok(!ui.includes('snapshot.state.watchmanLine===0'),
    'The original location exposition must not repeat at the Watchman');
  assert.ok(ui.includes("snapshot.state.watchmanLine===WATCHMAN_LINES.length-1"),
    'The second shift-bell cue belongs to the final Watchman Continue');
  assert.ok(ui.includes('decisionStep=1;')&&
    ui.includes('<SecondJobChoices choices={secondJobChoices}'),
    'One local Continue precedes the three Millhand-style job selections');
});
