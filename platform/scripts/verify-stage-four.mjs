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
const wageClaimPage=read('apps/web/src/routes/characters/[id]/millhand/wage-claim/+page.svelte');
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
assert.ok(api.includes("if(next.phase==='EXITED')") &&
  api.includes("nextCharacter.tutorial_stage=5") &&
  core.includes("case 'DONE':return ['leave_location']") &&
  core.includes("case 'leave_location':phase='EXITED';"),
  'Only the deliberate location exit may trigger Stage5');
assert.ok(!api.includes('MISSING_STAMP_ROUTE_SKILL'), 'Do not grant a second major skill award');
assert.ok(!api.includes('major_skill_bonuses=$2'), 'No skill mutation from Stage4');

assert.ok(route.includes('/millhand/wage-claim') &&
  route.includes("action==='leave_location'") &&
  !route.includes("The Wage Claim with Flint is the next chapter"),
  'Stage4 must hide Flint until the explicit location exit');
assert.ok(wageClaimPage.includes('MillhandWageClaimScene'),
  'Stage5 destination must be a real playable confrontation route');
assert.ok(ui.includes('secondJobJournal')&&ui.includes("STAGE_FOUR_DIALOGUE"),
  'Stage4 route-specific copy and journal missing');
assert.ok(stage3Ui.includes('continueToJob'), 'Guther must offer chosen next job after finishing Stage3');
assert.ok(stage3Route.includes("/millhand/second-job"), 'Stage3 seamless route navigation missing');
assert.ok(shell.includes("character.tutorial.stage === 4") &&
  shell.includes("character.tutorial.stage >= 5"),
  'Shared navigation must distinguish Stage4 work from Stage5 encounter');
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
  "Commerce UI must not borrow Investigation\'s work actions or introduce extra physical props");
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
  "Scholarship must display the owner's records-room background with the existing death/wage books");
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


/* Transport presentation: different saved choices must remain visible after
 * travel without a second personality flag or invented numeric damage rolls. */
const labels=read('apps/web/src/lib/workshop-object-labels.css');
assert.ok(labels.includes("dialogue-frame-trim.png")&&
  labels.includes(":is(.workshop,.second-job)")&&
  labels.includes(".table-prop")&&labels.includes(".record-prop"),
  'All tabletop cutouts must reuse the workshop nine-slice caption');
for(const name of [
  'WorkshopScene.svelte','MillhandWorkScene.svelte',
  'MillhandMissingStampScene.svelte','MillhandDepotScene.svelte',
  'MillhandContractsScene.svelte','MillhandRecordsScene.svelte'
]){
  const scene=read('apps/web/src/lib/'+name);
  assert.ok(scene.includes("import '$lib/workshop-object-labels.css'") &&
    scene.includes('workshop-object-label'),
    name+' must use the one framed tabletop label component');
}
assert.ok(stage3Ui.includes('height:clamp(132px,13vw,180px)') &&
  stage3Ui.includes('left:24%;bottom:3%;width:52%'),
  'Stage3 evidence must be enlarged without changing its centred bench arrangement');
assert.ok(copy.includes('STAGE_FOUR_TRANSPORT_HINTS') &&
  copy.includes('STAGE_FOUR_TRANSPORT_VERIFICATION') &&
  copy.includes('You set the bundle on the receiving counter.') &&
  copy.includes('You bring the last group to the receiving counter') &&
  copy.includes('I secured the plates together and carried them to the depot as one load.') &&
  copy.includes('I carried the plates in smaller groups. It took more trips'),
  'Both transport choices must change the immediate/depot/journal copy');
assert.ok(depotUi.includes("state.phase==='COMPARE_DELIVERY' && state.transport && travelConfirmed") &&
  depotUi.includes('STAGE_FOUR_TRANSPORT_VERIFICATION[state.transport]') &&
  depotUi.includes('STAGE_FOUR_TRANSPORT_HINTS[action]') &&
  depotUi.includes('Continue to the depot') &&
  depotUi.includes("state.phase==='COMPARE_DELIVERY'&&!travelConfirmed"),
  'Saved transport must drive depot verification and pre-choice trade-off text');
assert.ok(core.includes("case 'secure_plates':transport='secured';phase='COMPARE_DELIVERY';") &&
  core.includes("case 'carry_smaller_loads':transport='smaller_loads';phase='COMPARE_DELIVERY';"),
  'Both methods must keep the same mandatory delivery-list progression');
assert.ok(canon.includes('Owner-approved refinement — Transport handling, 2026-11-01'),
  'Canonical Stage4 transport refinement must be recorded');
console.log('PASS: Distinct transport narration/journal; shared table labels; no new state machine branch.');

console.log('PASS: Owner depot art, real objects, post-transport location and Stage2 duplicate-text guard.');

const sharedJournalCss=read('apps/web/src/lib/pall-owner-ui.css');
assert.ok(sharedJournalCss.includes("font:600 16px/1.55 var(--pall-font-reading") &&
  sharedJournalCss.includes("font:600 15px/1.3 var(--pall-font-reading") &&
  sharedJournalCss.includes("color:#24160e"),
  "Journal body and controls must use the owner's reading face with strong dark-ink contrast");
for(const name of [
  'MillhandDepotScene.svelte','MillhandContractsScene.svelte','MillhandRecordsScene.svelte'
]){
  const scene=read('apps/web/src/lib/'+name);
  assert.ok(scene.includes('font:600 15px/1.3 var(--pall-font-reading') &&
    scene.includes('font:600 16px/1.55 var(--pall-font-reading') &&
    scene.includes('color:#24160e'),
    name+' must style journal buttons and prose with New Standard and high contrast');
  assert.ok(scene.includes("journalOpen?'Close journal':'Review journal'"),
    name+' must preserve the existing journal toggle interaction');
}
const missingStampJournal=read('apps/web/src/lib/MillhandMissingStampScene.svelte');
assert.ok(missingStampJournal.includes('font:600 15px/1.3 var(--pall-font-reading') &&
  missingStampJournal.includes('font:600 16px/1.55 var(--pall-font-reading') &&
  missingStampJournal.includes('color:#24160e'),
  'Stage3 journal must match the Stage4 text and button typography');
console.log('PASS: Stage3 and all Stage4 journals share dark readable text and owner-typeface controls.');

console.log('PASS: Stage4 approved dialogue, three jobs, persistent/owned API, navigation and rewind boundaries.');
