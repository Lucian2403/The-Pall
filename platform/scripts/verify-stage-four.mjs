import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const canon=read('../docs/05-gameplay/onboarding/millhand/stage-4-approved-script.md');
const copy=read('apps/web/src/lib/approved-stage-four.ts');
const core=read('packages/game-core/src/millhand-second-job.ts');
const api=read('apps/api/src/millhand-second-job-routes.ts');
const page=read('apps/web/src/routes/characters/[id]/millhand/second-job/+page.svelte');
const route=read('apps/web/src/lib/MillhandSecondJobScene.svelte');
const shell=read('apps/web/src/lib/TutorialShell.svelte');
const rewind=read('apps/api/src/millhand-stage-rewind-routes.ts');

const approved=[
  "Put the plates there. I need your mark for the delivery.",
  "They've written ‘workers’ here. I've brought plates.",
  'Aye. I can see that.',
  'Are you going to record it like that?',
  "No. I'll record what you've brought. But I can't change the council's other papers.",
  'Which entry have you come about?',
  "Both. Here they've recorded the man as dead. In this one they're still charging for him.",
  'Both entries were accepted. Both have council seals.',
  'Who checked them?',
  "I can look up how they were entered. I can't change them myself.",
  'Then I want the difference recorded.',
  "You can ask for the seals to be checked, or put your complaint on the work paper. Either way, I can't approve the lot here.",
  'Someone scraped the ink off this line.',
  "Don't rub it. The paper's thin there.",
  'Do you know who changed it?',
  "No. I don't know."
];
for(const line of approved){
  assert.ok(canon.includes('“'+line+'”'),'Missing approved source dialogue: '+line);
  assert.ok(copy.includes(line),'Missing Stage4 executable dialogue: '+line);
}
assert.ok(core.includes('DIALOGUE_BEATS={restamp:5,contracts:7,records:4}'),
  'All 16 approved lines must be in the saved dialogue progression');

for(const [branch,component,art,books] of [
  ['restamp','MillhandDepotScene.svelte','/locations/depot/depot-background-cold.webp',[
    '/workshop/metal-plates.webp','/workshop/council-work.webp']],
  ['contracts','MillhandContractsScene.svelte','/locations/contracts/contracts-office.webp',[
    '/locations/contracts/death-register.webp','/locations/contracts/wage-record.webp']],
  ['records','MillhandRecordsScene.svelte','/locations/records/records-room.webp',[
    '/locations/contracts/death-register.webp','/locations/contracts/wage-record.webp']]
]){
  const ui=read('apps/web/src/lib/'+component);
  assert.ok(copy.includes(branch+':'),'Missing Stage4 branch '+branch);
  assert.ok(route.includes(component),'Stage4 router must render '+component);
  assert.ok(ui.includes(art),'Missing location art for '+branch);
  for(const book of books)assert.ok(ui.includes(book),'Missing interactive object '+book);
  assert.ok(ui.includes('snapshot.availableActions')&&ui.includes('secondJobJournal(state)'),
    branch+' must retain its server-approved actions and private Journal');
  assert.ok(ui.includes('STAGE_FOUR_EXIT_LABELS[state.branch]'),
    branch+' must provide the appropriate deliberate exit');
}
assert.ok(copy.includes('Leave the depot')&&
  copy.includes('Leave the Contracts office')&&
  copy.includes('Leave the records room'),'All three contextual exits required');
assert.ok(core.includes("case 'DONE':return ['leave_location']")&&
  core.includes("case 'EXITED':return []")&&
  core.includes("case 'leave_location':phase='EXITED';"),
  'Job completion must remain distinct from physical location exit');
assert.ok(api.includes('player_character_second_job_receipts')&&
  api.includes('AND account_id=$2 FOR UPDATE')&&
  api.includes("if(next.phase==='EXITED')")&&
  api.includes('nextCharacter.tutorial_stage=5')&&
  api.includes("char.rows[0].tutorial_stage!==4"),
  'Stage4 advance must be server-authoritative, idempotent and exit-triggered');
assert.ok(page.includes("action==='leave_location'")&&
  page.includes('/millhand/wage-claim')&&
  !page.includes('The Wage Claim with Flint is the next chapter'),
  'Do not disclose Stage5 or advance until the player leaves');
assert.ok(shell.includes('character.tutorial.stage === 4')&&
  shell.includes('character.tutorial.stage >= 5')&&
  rewind.includes('player_character_second_job_receipts'),
  'Chapter routing and developer replay must honour the new boundary');
assert.ok(copy.includes('STAGE_FOUR_TRANSPORT_HINTS')&&
  copy.includes('STAGE_FOUR_TRANSPORT_VERIFICATION')&&
  core.includes("case 'secure_plates':transport='secured';phase='COMPARE_DELIVERY';")&&
  core.includes("case 'carry_smaller_loads':transport='smaller_loads';phase='COMPARE_DELIVERY';"),
  'Industry must preserve different transport choices and verification');
assert.ok(canon.includes('Owner-approved refinement — Transport handling, 2026-11-01')&&
  canon.includes('Owner-approved Stage 4 → Stage 5 handoff refinement — 2026-11-02'),
  'Approved transport and exit refinements must remain documented');
console.log('PASS: Stage4 approved lines, all three route scenes, transport, saved exit and no advance spoilers.');
