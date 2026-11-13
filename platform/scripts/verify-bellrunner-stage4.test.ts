import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {
  initialBellrunnerSecondJob,advanceBellrunnerSecondJob,availableStageFourActions,
  InvalidStageFourAction,STAGE_FOUR_FACT,
  STAGE_FOUR_OPENING_LENGTH,STAGE_FOUR_REVELATION_LENGTH,
  STAGE_FOUR_TRAUMA_TRIAGE_LENGTH,STAGE_FOUR_TRAUMA_ASSISTANCE_LENGTH,
  STAGE_FOUR_TRAUMA_REGISTER_LENGTH
} from '../apps/api/src/bellrunner-second-job-work.ts';
import type {StageFourBranch,StageFourState,StageFourAction} from '../apps/api/src/bellrunner-second-job-work.ts';
import {BELLRUNNER_STAGE_FOUR,STAGE_FOUR_ACTION_LABELS} from '../apps/web/src/lib/bellrunner-stage4-copy.ts';
import {bellrunnerStageFourJournal} from '../apps/web/src/lib/bellrunner-stage4-journal.ts';

function opening(branch:StageFourBranch):StageFourState{
  let s=initialBellrunnerSecondJob(branch);
  for(let i=0;i<STAGE_FOUR_OPENING_LENGTH[branch]-(branch==='trauma'?1:0);i++)
    s=advanceBellrunnerSecondJob(s,'continue_opening');
  assert.equal(s.phase,branch==='trauma'?'opening':'inspect');
  assert.equal(s.openingLine,STAGE_FOUR_OPENING_LENGTH[branch]-1);
  return s;
}
function revelation(s:StageFourState):StageFourState{
  assert.equal(s.phase,'revelation');
  for(let i=0;i<STAGE_FOUR_REVELATION_LENGTH[s.branch]-(s.branch==='trauma'?1:0);i++)
    s=advanceBellrunnerSecondJob(s,'continue_revelation');
  assert.equal(s.phase,s.branch==='trauma'?'revelation':'finish');
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
test('Trauma follows owner-revised patient choice, two different responses, assistance, register and exchange',()=>{
  const copy=BELLRUNNER_STAGE_FOUR.trauma;
  assert.equal(copy.opening[0].text,'Two workers have been brought to the first-aid point.');
  assert.equal(copy.opening[2].speaker,'Attendant');
  assert.equal(copy.assistance.length,STAGE_FOUR_TRAUMA_ASSISTANCE_LENGTH);
  assert.equal(copy.register.observations.length,STAGE_FOUR_TRAUMA_REGISTER_LENGTH);
  assert.equal(copy.register.escort.length,STAGE_FOUR_TRAUMA_REGISTER_LENGTH);
  assert.equal(copy.revelation.length,STAGE_FOUR_REVELATION_LENGTH.trauma);
  assert.match(copy.revelation[2].text,/why the hell/);
  assert.match(copy.revelation[5].text,/unless someone with the authority changes it/);
  for(const first of ['prioritize_urgent_worker','prioritize_mobile_worker'] as const){
    for(const assist of ['take_observations','bring_next_worker'] as const){
      let s=opening('trauma');
      assert.deepEqual(availableStageFourActions(s),[
        'prioritize_urgent_worker','prioritize_mobile_worker'
      ],'Triage choices appear on the last attendant beat, not on a separate report screen');
      assert.throws(()=>advanceBellrunnerSecondJob(s,'continue_opening'),InvalidStageFourAction);
      s=advanceBellrunnerSecondJob(s,first);
      const priority=first==='prioritize_mobile_worker'?'corrected':'urgent';
      assert.equal(s.priority,priority);
      assert.equal(s.phase,'triage_response');
      assert.equal(s.triageLine,0);
      assert.equal(copy.triageResponse[priority].length,STAGE_FOUR_TRAUMA_TRIAGE_LENGTH[priority]);
      assert.equal(copy.triageResponse[priority][0].speaker,
        priority==='urgent'?'Player':'Attendant');
      for(let i=0;i<STAGE_FOUR_TRAUMA_TRIAGE_LENGTH[priority];i++){
        assert.deepEqual(availableStageFourActions(s),['continue_triage']);
        s=advanceBellrunnerSecondJob(s,'continue_triage');
      }
      assert.equal(s.phase,'detail');
      for(let i=0;i<STAGE_FOUR_TRAUMA_ASSISTANCE_LENGTH-1;i++){
        assert.deepEqual(availableStageFourActions(s),['continue_detail']);
        s=advanceBellrunnerSecondJob(s,'continue_detail');
      }
      assert.deepEqual(availableStageFourActions(s),[
        'take_observations','bring_next_worker'
      ],'Assistance choices appear under the Attendant speaking about both methods');
      s=advanceBellrunnerSecondJob(s,assist);
      assert.equal(s.method,assist);
      assert.equal(s.phase,'confirm');
      assert.equal(s.registerLine,0);
      for(let i=0;i<STAGE_FOUR_TRAUMA_REGISTER_LENGTH-1;i++){
        assert.deepEqual(availableStageFourActions(s),['continue_register']);
        s=advanceBellrunnerSecondJob(s,'continue_register');
      }
      assert.deepEqual(availableStageFourActions(s),['ask_about_classification'],
        'Single player action after finding the non-work classification');
      s=advanceBellrunnerSecondJob(s,'ask_about_classification');
      assert.equal(s.observation,'ask_about_classification');
      assert.equal(s.journalFact,STAGE_FOUR_FACT.trauma);
      s=revelation(s);
      assert.equal(s.revelationLine,8);
      assert.deepEqual(availableStageFourActions(s),['finish_handover'],
        'Finish the handover must accompany the final narration, not another summary screen');
      finished(s,'finish_handover');
    }
  }
});
test('Trauma in-flight older saves can still reach the revised story without losing their branch',()=>{
  let s:StageFourState={...opening('trauma'),phase:'inspect'};
  s=advanceBellrunnerSecondJob(s,'prioritize_urgent_worker');
  assert.equal(s.phase,'triage_response');
  // Before the revision, existing scenes could be saved in detail,
  // confirm, choose or finish without the new per-conversation counters.
  const detail={...s,phase:'detail' as const,detailLine:undefined};
  assert.deepEqual(availableStageFourActions(detail),['continue_detail']);
  const confirm={...s,phase:'confirm' as const,registerLine:undefined};
  assert.deepEqual(availableStageFourActions(confirm),['continue_register']);
  const choose={...s,phase:'choose' as const};
  assert.deepEqual(availableStageFourActions(choose),['ask_about_classification']);
  const finish={...s,phase:'finish' as const};
  assert.deepEqual(availableStageFourActions(finish),['finish_handover']);
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
test('Machinery pin confirmation renders approved dialogue and unchanged actions',()=>{
  const pin=BELLRUNNER_STAGE_FOUR.machinery.pinCheck;
  assert.equal(pin.narration,'The mechanic takes a closer look at the pin.');
  assert.equal(pin.spoken,"Aye, someone's moved it. Leave it alone. We need to write down exactly how we found it.");
  assert.equal(STAGE_FOUR_ACTION_LABELS.mark_pin_position,'Mark the pin on the sketch');
  assert.equal(STAGE_FOUR_ACTION_LABELS.request_second_check,'Ask the mechanic to check again');
  const scene=readFileSync(new URL('../apps/web/src/lib/BellrunnerSecondJobScene.svelte',
    import.meta.url),'utf8');
  assert.ok(scene.includes("state.branch==='machinery'&&state.phase==='choose'"));
  assert.ok(scene.includes('BELLRUNNER_STAGE_FOUR.machinery.pinCheck.narration'));
  assert.ok(scene.includes('BELLRUNNER_STAGE_FOUR.machinery.pinCheck.spoken'));
  let s=opening('machinery');
  s=advanceBellrunnerSecondJob(s,'inspect_safety_linkage');
  s=advanceBellrunnerSecondJob(s,'trace_bell_rod');
  s=advanceBellrunnerSecondJob(s,'show_mechanic_link');
  assert.deepEqual(availableStageFourActions(s),['mark_pin_position','request_second_check']);
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
  assert.deepEqual(Object.values(BELLRUNNER_STAGE_FOUR).map(s=>s.revelation.length),[4,9,4]);
  assert.deepEqual(Object.values(BELLRUNNER_STAGE_FOUR).map(s=>s.image),[
    '/locations/contracts/contracts-office.webp',
    '/locations/clinic/clinic-workshop-cold.webp',
    '/locations/industrial/industrial-courtyard.webp'
  ]);
  const scene=readFileSync(new URL('../apps/web/src/lib/BellrunnerSecondJobScene.svelte',
    import.meta.url),'utf8');
  assert.ok(scene.includes('mode="scene"')&&scene.includes('dialogueSpeakerLabel(currentLine.speaker)'));
  assert.ok(scene.includes('SCENE_JOURNAL_CONTEXT')&&
    scene.includes('bellrunnerStageFourJournal(state)'));
  assert.ok(scene.includes("'Helping the Attendant'")&&
    scene.includes("'The Medical Register'")&&
    scene.includes("state.phase==='triage_response'"));
  for(const obsolete of [
    'work-evidence','mechanical-readout',
    'WORKSITE NOTICE</small>','SHIFT BOOK</small>',
    'ATTENDANCE CATEGORY</small>','WAGE COLUMN</small>',
    'VENTILATION SAFETY SHUTOFF</small>','SHIFT BELL LINKAGE</small>',
    'RETAINING PIN</small>','WORKER A</small>','REGISTER CLASSIFICATION</small>',
    'Either method records the conflict without changing',
    'Observation only. The City-Works Mechanic supervises'
  ]){
    assert.ok(!scene.includes(obsolete),
      'Do not reproduce a document/status ledger inside Bellrunner dialogue: '+obsolete);
  }
  assert.ok(scene.includes('{instruction}')&&
    scene.includes('STAGE_FOUR_TASK_TEXT')&&
    scene.includes('{copy.done}')&&scene.includes('bellrunnerStageFourJournal(state)'),
    'Information must remain available through narrative and the personal journal');
  for(const branch of ['contracts','machinery'] as const){
    assert.ok(BELLRUNNER_STAGE_FOUR[branch].revelation.length>=4,
      'Do not remove the character dialogue while removing duplicate cards: '+branch);
  }
  assert.ok(scene.includes('snapshot.availableActions'));
  const api=readFileSync(new URL('../apps/api/src/bellrunner-second-job-routes.ts',
    import.meta.url),'utf8');
  assert.ok(api.includes("state:{phase:string;branch:BellBranch|null}")&&
    api.includes("state?.phase!=='committed'"));
  assert.ok(!api.includes('major_skill_bonuses')&&!api.includes('coins=')&&!api.includes('ordinary_xp='),
    'Stage 4 must not pay or award a second skill level');
  assert.ok(api.includes('FOR UPDATE')&&api.includes('request_hash'));
});

test('Bellrunner Stage 4 journal matches canonical Millhand diary, not a status worksheet',()=>{
  const scene=readFileSync(new URL('../apps/web/src/lib/BellrunnerSecondJobScene.svelte',
    import.meta.url),'utf8');
  const millhand=readFileSync(new URL('../apps/web/src/lib/MillhandMissingStampScene.svelte',
    import.meta.url),'utf8');
  const owner=readFileSync(new URL('../apps/web/src/lib/pall-owner-ui.css',
    import.meta.url),'utf8');
  for(const expected of [
    'class="journal-panel"','class="journal-heading"','class="journal-kicker"',
    'class="journal-entries"','class="journal-toggle"'
  ]){
    assert.ok(scene.includes(expected),'Bellrunner must reuse Millhand journal structure: '+expected);
    assert.ok(millhand.includes(expected),
      'Journal structure must come from original Millhand, not new UI: '+expected);
  }
  assert.match(scene,/\{#each journal as entry,\s*i \(i\)\}/);
  assert.match(millhand,/\{#each journal as entry,\s*i \(i\)\}/);
  assert.ok(scene.includes('PERSONAL JOURNAL')&&scene.includes('data-pall-sfx="paper"'),
    'Keep the existing Stage 4 Journal label and paper sound');
  assert.ok(owner.includes('font:600 16px/1.55 var(--pall-font-reading,Georgia,serif)')&&
    owner.includes('font:600 24px/1.25 var(--pall-font-reading,Georgia,serif)')&&
    owner.includes('font:700 14px/1.25 var(--pall-font-label'),
    'Keep canonical font sizes, weight and New Standard/Bebas roles in owner CSS');
  assert.ok(!scene.includes('class="job-journal"')&&!scene.includes('class="journal-top"'),
    'Do not return to Bellrunner-only journal frame or dark square close button');
  const rendered=scene.split('</script>')[1]?.split('<style>')[0]??'';
  for(const forbidden of ['Work:','Location:','Status:','Method:','Recorded check:',
    'Local finding:','PERSONAL JOURNAL · STAGE IV']){
    assert.ok(!rendered.includes(forbidden),
      'No technical field labels in rendered story journal: '+forbidden);
  }
});
test('Bellrunner journal records actual discoveries and choices as first-person entries',()=>{
  for(const branch of ['contracts','trauma','machinery'] as const){
    const state=initialBellrunnerSecondJob(branch);
    const entries=bellrunnerStageFourJournal(state);
    assert.equal(entries.length,1,branch+' begins with one witnessed fact');
    assert.ok(entries[0].includes('I ')||entries[0].includes("I've"),
      'The journal has a personal first-person voice');
    for(const line of entries){
      assert.doesNotMatch(line,/^(Work|Location|Status|Method|Local finding|Recorded check):/);
    }
  }
  let contracts=initialBellrunnerSecondJob('contracts');
  assert.ok(!bellrunnerStageFourJournal(contracts).join(' ').includes('Absent by choice'));
  for(let i=0;i<STAGE_FOUR_OPENING_LENGTH.contracts;i++)
    contracts=advanceBellrunnerSecondJob(contracts,'continue_opening');
  contracts=advanceBellrunnerSecondJob(contracts,'compare_shift_records');
  assert.match(bellrunnerStageFourJournal(contracts).join(' '),/night crew/);
  assert.ok(!bellrunnerStageFourJournal(contracts).join(' ').includes('Absent by choice'),
    'Do not expose the absence category before the player inspects it');
  contracts=advanceBellrunnerSecondJob(contracts,'inspect_absence_category');
  assert.match(bellrunnerStageFourJournal(contracts).join(' '),/Absent by choice/);
  contracts=advanceBellrunnerSecondJob(contracts,'enter_written_objection');
  assert.match(bellrunnerStageFourJournal(contracts).join(' '),/objection in writing/);
  assert.doesNotMatch(bellrunnerStageFourJournal(contracts).join(' '),/I asked the clerk what gives/);
  for(let i=0;i<STAGE_FOUR_REVELATION_LENGTH.contracts;i++)
    contracts=advanceBellrunnerSecondJob(contracts,'continue_revelation');
  contracts=advanceBellrunnerSecondJob(contracts,'submit_certificate');
  assert.match(bellrunnerStageFourJournal(contracts).at(-1)??'',/certificate as disputed/);

  let trauma=initialBellrunnerSecondJob('trauma');
  for(let i=0;i<STAGE_FOUR_OPENING_LENGTH.trauma-1;i++)
    trauma=advanceBellrunnerSecondJob(trauma,'continue_opening');
  trauma=advanceBellrunnerSecondJob(trauma,'prioritize_mobile_worker');
  assert.match(bellrunnerStageFourJournal(trauma).join(' '),/attendant stopped me/);
  for(let i=0;i<STAGE_FOUR_TRAUMA_TRIAGE_LENGTH.corrected;i++)
    trauma=advanceBellrunnerSecondJob(trauma,'continue_triage');
  for(let i=0;i<STAGE_FOUR_TRAUMA_ASSISTANCE_LENGTH-1;i++)
    trauma=advanceBellrunnerSecondJob(trauma,'continue_detail');
  trauma=advanceBellrunnerSecondJob(trauma,'bring_next_worker');
  assert.match(bellrunnerStageFourJournal(trauma).join(' '),/She asked him/);
  assert.doesNotMatch(bellrunnerStageFourJournal(trauma).join(' '),/I asked the other worker/);
  assert.doesNotMatch(bellrunnerStageFourJournal(trauma).join(' '),/Non-work illness/);
  for(let i=0;i<3;i++)trauma=advanceBellrunnerSecondJob(trauma,'continue_register');
  assert.match(bellrunnerStageFourJournal(trauma).join(' '),/Non-work illness/);
  assert.doesNotMatch(bellrunnerStageFourJournal(trauma).join(' '),/left the men paying/);
  for(let i=3;i<STAGE_FOUR_TRAUMA_REGISTER_LENGTH-1;i++)
    trauma=advanceBellrunnerSecondJob(trauma,'continue_register');
  trauma=advanceBellrunnerSecondJob(trauma,'ask_about_classification');
  assert.match(bellrunnerStageFourJournal(trauma).join(' '),/paying for treatment/);

  let machinery=initialBellrunnerSecondJob('machinery');
  assert.doesNotMatch(bellrunnerStageFourJournal(machinery).join(' '),/retaining pin/);
  for(let i=0;i<STAGE_FOUR_OPENING_LENGTH.machinery;i++)
    machinery=advanceBellrunnerSecondJob(machinery,'continue_opening');
  machinery=advanceBellrunnerSecondJob(machinery,'inspect_safety_linkage');
  assert.match(bellrunnerStageFourJournal(machinery).join(' '),/shutoff/);
  assert.doesNotMatch(bellrunnerStageFourJournal(machinery).join(' '),/retaining pin/);
  machinery=advanceBellrunnerSecondJob(machinery,'trace_bell_rod');
  assert.match(bellrunnerStageFourJournal(machinery).join(' '),/retaining pin/);
  machinery=advanceBellrunnerSecondJob(machinery,'show_mechanic_link');
  machinery=advanceBellrunnerSecondJob(machinery,'request_second_check');
  const content=bellrunnerStageFourJournal(machinery).join(' ');
  assert.match(content,/asked the mechanic to check it again/);
  assert.doesNotMatch(content,/marked where the pin sat/);
});
