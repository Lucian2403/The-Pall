import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const stageFourCore=read('packages/game-core/src/millhand-second-job.ts');
const stageFourApi=read('apps/api/src/millhand-second-job-routes.ts');
const stageFourPage=read('apps/web/src/routes/characters/[id]/millhand/second-job/+page.svelte');
const stageFourCopy=read('apps/web/src/lib/approved-stage-four.ts');
const core=read('packages/game-core/src/millhand-wage-claim.ts');
const api=read('apps/api/src/millhand-wage-claim-routes.ts');
const page=read('apps/web/src/routes/characters/[id]/millhand/wage-claim/+page.svelte');
const scene=read('apps/web/src/lib/MillhandWageClaimScene.svelte');
const copy=read('apps/web/src/lib/approved-stage-five.ts');
const journal=read('../docs/05-gameplay/onboarding/millhand/stage-5-approved-script.md');
const shell=read('apps/web/src/lib/TutorialShell.svelte');
const home=read('apps/web/src/lib/CharacterHome.svelte');

assert.ok(stageFourCore.includes("case 'DONE':return ['leave_location']") &&
  stageFourCore.includes("case 'leave_location':phase='EXITED';") &&
  stageFourApi.includes("if(next.phase==='EXITED')") &&
  stageFourPage.includes("action==='leave_location'") &&
  !stageFourPage.includes('The Wage Claim with Flint is the next chapter'),
  'Stage4 job completion must not reveal or trigger the encounter');
for(const label of [
  'Leave the depot','Leave the Contracts office','Leave the records room'
]){
  assert.ok(stageFourCopy.includes(label),'Missing exit choice: '+label);
}
for(const sceneName of [
  'MillhandDepotScene.svelte','MillhandContractsScene.svelte','MillhandRecordsScene.svelte'
]){
  assert.ok(read('apps/web/src/lib/'+sceneName).includes('STAGE_FOUR_EXIT_LABELS[state.branch]'),
    sceneName+' does not use the contextual exit');
}
assert.ok(home.includes("href:base+'/millhand/wage-claim'") &&
  shell.includes("character.tutorial.stage >= 5") &&
  page.includes('<MillhandWageClaimScene'),
  'Saved Stage 5 must open the actual confrontation, not a placeholder');
assert.ok(api.includes('stage_four_exit_required') &&
  api.includes('FOR UPDATE') &&
  api.includes('player_character_wage_claim_receipts') &&
  api.includes("SELECT state FROM player_character_second_job"),
  'Stage5 requires saved exit, account ownership, row locking and deduplication');
for(const key of ['restamp','contracts','records']){
  assert.ok(copy.includes(key+':'), 'Stage5 must preserve route-specific evidence for '+key);
}
for(const phrase of [
  'You did the plate work for Anvil?',
  'The contractor sent me. I work for him.',
  "They've written ‘workers’ on mine.",
  'Nobody told me.',
  "Then go and tell them. I don't keep the books.",
  'Move.','No.'
]){
  assert.ok(copy.includes(phrase) && journal.includes(phrase),
    'Stage5 approved dialogue missing: '+phrase);
}
assert.ok(core.includes("case 'FIGHT_PENDING':return []") &&
  core.includes("case 'CHOOSE_POSITION':return ['brace_and_defend','keep_moving','use_cart_cover']") &&
  !api.includes("tutorial_stage=6") &&
  !api.includes("UPDATE player_characters SET coins"),
  'Scene must stop before combat; no scripted win, fee or loot');
assert.ok(scene.includes('onclick={inspectPaper}') &&
  scene.includes('onclick={inspectClub}') &&
  scene.includes('onclick={inspectCart}') &&
  scene.includes('snapshot.availableActions'),
  'Read-only objects and committed speech must remain separate');
console.log('PASS: Three saved spoiler-free exits, all Stage5 dialogue paths, persistence and engine boundary.');
