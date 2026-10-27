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
console.log('PASS: Stage4 approved dialogue, three jobs, persistent/owned API, navigation and rewind boundaries.');
