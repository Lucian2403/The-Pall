import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const canon=read('../docs/05-gameplay/onboarding/millhand/stage-4-approved-script.md');
const copy=read('apps/web/src/lib/approved-stage-four.ts');
const core=read('packages/game-core/src/millhand-second-job.ts');
const api=read('apps/api/src/millhand-second-job-routes.ts');
const route=read('apps/web/src/routes/characters/[id]/millhand/second-job/+page.svelte');
const ui=read('apps/web/src/lib/MillhandSecondJobScene.svelte');
const stage3Ui=read('apps/web/src/lib/MillhandMissingStampScene.svelte');
const stage3Route=read('apps/web/src/routes/characters/[id]/millhand/missing-stamp/+page.svelte');
const shell=read('apps/web/src/lib/TutorialShell.svelte');
const dev=read('apps/api/src/millhand-stage-rewind-routes.ts');
const planner=read('packages/game-core/src/millhand-rewind.ts');

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
  assert.ok(canon.includes('“'+line+'”'),'Stage4 canonical script missing: '+line);
  assert.ok(copy.includes(line),'Stage4 executable copy drift: '+line);
}
assert.equal(approved.length,16);
assert.ok(core.includes('DIALOGUE_BEATS={restamp:5,contracts:7,records:4}'),
  'Stage4 must display all 16 approved spoken lines before the decision');

for(const branch of ['restamp','contracts','records']){
  assert.ok(core.includes("branch==='"+branch+"'")||core.includes(branch+':'),
    'Missing mechanics for route '+branch);
  assert.ok(copy.includes(branch+':'), 'Missing authored copy for route '+branch);
}
assert.ok(core.includes('initialSecondJob')&&core.includes('availableSecondJobActions')
  &&core.includes('advanceSecondJob'),'Stage4 state machine missing');
assert.ok(api.includes('SELECT state FROM player_character_missing_stamp WHERE character_id=$1'),
  'Chosen Stage4 branch must be loaded from saved Stage3 state');
assert.ok(api.includes("value.phase!=='SELECTED'"),
  'Cannot advance uncompleted Stage3');
assert.ok(api.includes("char.rows[0].tutorial_stage!==4"),
  'Stage4 actions must be restricted to Stage4');
assert.ok(api.includes('AND account_id=$2 FOR UPDATE'), 'Account-owned server row lock needed');
assert.ok(api.includes('player_character_second_job_receipts'),'Stage4 needs idempotent receipts');
assert.ok(api.includes("nextCharacter.tutorial_stage=5"), 'Stage4 must lead to Stage5 only on completion');
assert.ok(!api.includes('MISSING_STAMP_ROUTE_SKILL'), 'Do not grant a second major skill award');
assert.ok(!api.includes('major_skill_bonuses=$2'), 'No skill mutation from Stage4');

assert.ok(route.includes('/millhand/second-job'), 'Stage4 saved work route missing');
assert.ok(ui.includes('secondJobJournal')&&ui.includes("STAGE_FOUR_DIALOGUE"),
  'Stage4 route-specific copy and journal missing');
assert.ok(stage3Ui.includes('continueToJob'), 'Guther must offer chosen next job after finishing Stage3');
assert.ok(stage3Route.includes("/millhand/second-job"), 'Stage3 seamless route navigation missing');
assert.ok(shell.includes("character.tutorial.stage >= 4"), 'Shared navigation must select Stage4');
assert.ok(planner.includes('removeSecondJob:stage>=4'),'Developer rewind must discard later Stage4 work safely');
assert.ok(dev.includes('player_character_second_job_receipts'),'Developer rewind must clear Stage4 receipts');

const depotUi=read('apps/web/src/lib/MillhandDepotScene.svelte');
const stage2Ui=read('apps/web/src/lib/MillhandWorkScene.svelte');
assert.ok(ui.includes("import MillhandDepotScene from '$lib/MillhandDepotScene.svelte'") &&
  ui.includes("<MillhandDepotScene {snapshot} {pending} {errorMessage} {perform}/>"),
  'Industry branch must render the depot scene, leaving Contracts and Scholarship intact');
assert.ok(depotUi.includes("/locations/depot/depot-background-cold.webp") &&
  depotUi.includes("background-image:url('/workshop/environment.webp')"),
  'Route A must prepare the plates at the workshop before switching to the owner supplied depot backdrop');
assert.ok(depotUi.includes("state.phase==='CHECK_LOAD'||state.phase==='CHOOSE_TRANSPORT'"),
  'Travel to the depot must follow the saved transport choice, not precede it');
assert.ok(depotUi.includes('/workshop/metal-plates.webp') &&
  depotUi.includes('/workshop/council-work.webp') &&
  depotUi.includes('onclick={() => inspect(\'plates\')}') &&
  depotUi.includes('onclick={() => inspect(\'paper\')}'),
  'Real reusable plate and council paper art must be clickable, not schematic rectangles');
assert.ok(!depotUi.includes('class="work-surface"') &&
  !depotUi.includes('class="symbol"'),
  'Do not show schematic tile placeholders in the depot');
assert.ok(depotUi.includes('STAGE_FOUR_DIALOGUE.restamp') &&
  depotUi.includes('snapshot.availableActions') &&
  depotUi.includes('secondJobJournal(state)'),
  'Depot script, server actions and journal must keep their existing saved behavior');
assert.ok(depotUi.includes('scale(1.018)'),'Depot props must have restrained micro-hover');
assert.ok(stage2Ui.includes('{#if instruction !== result}') &&
  stage2Ui.includes('<p class="story">{result}</p>'),
  'Repeated text must be hidden in the UI without modifying owner-authored Stage2 copy');
const contractsUi=read('apps/web/src/lib/MillhandContractsScene.svelte');
assert.ok(ui.includes("import MillhandContractsScene from '$lib/MillhandContractsScene.svelte'") &&
  ui.includes("<MillhandContractsScene {snapshot} {pending} {errorMessage} {perform}/>"),
  'Approved Commerce branch must render its own office instead of schematic tiles');
assert.ok(contractsUi.includes('/locations/contracts/contracts-office.webp') &&
  contractsUi.includes('/locations/contracts/death-register.webp') &&
  contractsUi.includes('/locations/contracts/wage-record.webp'),
  'Commerce scene needs the owner-approved office and the exact two supplied book illustrations');
assert.ok(contractsUi.includes("onclick={() => inspect('death')}") &&
  contractsUi.includes("onclick={() => inspect('wage')}"),
  'Both illustrated books must be clickable');
assert.ok(contractsUi.includes("which==='death' && snapshot.availableActions.includes('examine_work_paper')") &&
  contractsUi.includes("void perform('examine_work_paper')") &&
  contractsUi.includes("which==='wage' && snapshot.availableActions.includes('compare_official_records')") &&
  contractsUi.includes("void perform('compare_official_records')"),
  'Commerce must require separate owner book selections for the two existing saved evidence steps');
assert.ok(contractsUi.includes("state.phase==='EXAMINE_PAPER'||state.phase==='COMPARE_RECORDS'") &&
  contractsUi.includes("{:else if snapshot.availableActions.length>0}"),
  'Remove evidence action buttons from dialogue while retaining later Clerk and dispute actions');
assert.ok(!contractsUi.includes("perform('read_death_register')") &&
  !contractsUi.includes("perform('check_wage_record')") &&
  !contractsUi.includes('class="work-surface"') &&
  !contractsUi.includes('/workshop/council-work.webp'),
  'Commerce UI must not borrow Investigation's work actions or introduce extra physical props');
assert.ok(contractsUi.includes('STAGE_FOUR_DIALOGUE.contracts') &&
  contractsUi.includes('STAGE_FOUR_FINAL.contracts') &&
  contractsUi.includes('snapshot.availableActions') &&
  contractsUi.includes('secondJobJournal(state)'),
  'The previously approved Contracts Clerk script, both dispute choices and journal must remain');
assert.ok(contractsUi.includes('scale(1.018)') &&
  contractsUi.includes('class="scene-footer"'),
  'Book hover must be subtle, and journal should stay outside the CRPG popup');
console.log('PASS: Contracts requires both book clicks in sequence with no shortcut buttons; Disputed Docket script preserved.');

const recordsUi=read('apps/web/src/lib/MillhandRecordsScene.svelte');
assert.ok(ui.includes("import MillhandRecordsScene from '$lib/MillhandRecordsScene.svelte'") &&
  ui.includes("state.branch==='records'") &&
  ui.includes("<MillhandRecordsScene {snapshot} {pending} {errorMessage} {perform}/>"),
  'Scholarship route must render the owner-approved records room, not schematic tiles');
assert.ok(recordsUi.includes('/locations/records/records-room.webp') &&
  recordsUi.includes('/locations/contracts/death-register.webp') &&
  recordsUi.includes('/locations/contracts/wage-record.webp'),
  'Scholarship must display the owner's records-room background with the existing death/wage books');
for(const [phase,which,action] of [
  ['READ_DEATH_REGISTER','death','read_death_register'],
  ['READ_WAGE_RECORD','wage','check_wage_record'],
  ['EXAMINE_SCRAPED_ENTRY','wage','examine_scraped_entry']
]){
  assert.ok(recordsUi.includes("state.phase==='"+phase+"'") &&
    recordsUi.includes("which==='"+which+"' && snapshot.availableActions.includes('"+action+"')") &&
    recordsUi.includes("void perform('"+action+"')"),
    'Scholarship must require the correct physical book for '+phase);
}
assert.ok(recordsUi.includes('{#if readingPhase}') &&
  recordsUi.includes('{:else if snapshot.availableActions.length>0}') &&
  recordsUi.includes('if(pending)return'),
  'Book inspection must not be automated via dialogue buttons, and duplicates must be blocked');
assert.ok(recordsUi.includes('STAGE_FOUR_DIALOGUE.records') &&
  recordsUi.includes('STAGE_FOUR_FINAL.records') &&
  recordsUi.includes('secondJobJournal(state)') &&
  recordsUi.includes('snapshot.availableActions'),
  'Scholarship must retain approved archive dialogue, both source choices and saved journal');
assert.ok(recordsUi.includes('scale(1.018)') &&
  !recordsUi.includes('class="work-surface"'),
  'Scholarship book hover must be subtle, with no schematic placeholder tiles');
console.log('PASS: Scholarship records room and three deliberate inspections retain approved reconciliation route.');

console.log('PASS: Owner depot art, real objects, post-transport location and Stage2 duplicate-text guard.');

console.log('PASS: Stage4 approved dialogue, three jobs, persistent/owned API, navigation and rewind boundaries.');
