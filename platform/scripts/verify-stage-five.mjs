import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const canon=read('../docs/05-gameplay/onboarding/millhand/stage-5-approved-script.md');
const copy=read('apps/web/src/lib/approved-stage-five.ts');
const core=read('packages/game-core/src/millhand-wage-claim.ts');
const api=read('apps/api/src/millhand-wage-claim-routes.ts');
const scene=read('apps/web/src/lib/MillhandWageClaimScene.svelte');
const route=read('apps/web/src/routes/characters/[id]/millhand/wage-claim/+page.svelte');
const shell=read('apps/web/src/lib/TutorialShell.svelte');
const home=read('apps/web/src/lib/CharacterHome.svelte');
const last=read('apps/web/src/routes/characters/[id]/millhand/second-job/+page.svelte');
const migration=read('db/migrations/0006_millhand_wage_claim.sql');
const dev=read('apps/api/src/millhand-stage-rewind-routes.ts');
const packageJSON=JSON.parse(read('package.json'));

for(const phrase of [
  "Flint steps into your way and shoves a folded paper towards you.",
  "You worked on Anvil's plates?",
  "Yeah. What of it?",
  "Lot's been stopped. Boss wants his money. Says you're paying.",
  "Paying for what? I ain't even got my wages!",
  "Don't care. I came to collect.",
  "You snatch the paper and unfold it. There's the plate lot number.",
  "And that worker number again. The same one the council had marked as cancelled.",
  "You read further. They've put a charge against your name for the delay.",
  "But your wages? Not a word about those.",
  "Bloody hell. They haven't paid you a penny, and now they want money from you.",
  'Who gave you the right to take money from me? The council?',
  "Don't know. They don't tell men like us.",
  "And you still want me to pay?",
  "I've got the receipt.",
  "Nobody told me.",
  "Then go and tell them. I don't keep the books.",
  "Not till I've got the money.",
  'I heard you.',
  "No."
]){
  assert.ok(canon.includes(phrase),'Missing canonical Stage 5 speech: '+phrase);
  assert.ok(copy.includes(phrase),'Stage 5 player-facing copy drifts from canon: '+phrase);
}
assert.ok(!copy.includes('You did the plate work for Anvil?') &&
  !copy.includes("I wasn't sent to pay you.") &&
  !scene.includes('Flint holds out the folded paper.'),
  'Outdated Stage 5 opening or duplicate paper narration must not return');
assert.ok(scene.includes("white-space:pre-line") &&
  scene.includes("beat.speaker==='Player'?'You':'Flint'"),
  'Demand narration keeps all three owner-authored paragraphs and Flint nameplate');
for(const branch of ['restamp','contracts','records']){
  assert.match(copy,new RegExp(branch+':\\['),'Missing branch-only evidence: '+branch);
}
assert.match(core,/initialWageClaim/);
assert.match(core,/availableWageClaimActions/);
assert.match(core,/advanceWageClaim/);
assert.match(core,/WAGE_CLAIM_DIALOGUE_COUNTS/);
assert.match(core,/phase='DONE'/);
assert.match(api,/session\?\.user\.emailVerified/);
assert.match(api,/account_id=\$2 FOR UPDATE/);
assert.match(api,/request_hash,result/);
assert.match(api,/stale_revision/);
assert.match(api,/branch_mismatch/);
assert.match(api,/stage_five_not_ready/);
assert.match(api,/second_job_not_complete/);
assert.match(api,/tutorial_stage:next\.phase==='DONE'\?6:5/);
assert.match(api,/tutorialPayout:\{coins:0,ordinaryXp:0,items:0\}/);
assert.match(migration,/player_character_wage_claim_receipts/);
assert.match(migration,/PRIMARY KEY\(character_id,request_id\)/);
assert.match(scene,/alley-background\.webp/);
assert.match(scene,/flint-standing\.webp/);
assert.match(scene,/class="work-dialogue"/);
assert.match(scene,/class="workshop-object-label"/);
assert.match(scene,/data-pall-sfx="paper"/);
assert.match(scene,/Review journal/);
assert.match(scene,/Stage 6 combat is not yet integrated/);
assert.match(scene,/previous_dialogue/);
assert.match(scene,/Back to Stage 5/);
assert.match(scene,/Previous dialogue/);
assert.match(scene,/flintImageMissing/);
assert.match(scene,/onerror=/);
assert.doesNotMatch(scene,/class="object club"/);
assert.match(scene,/Inspect Flint and his club/);
assert.match(core,/previousWageClaim/);
assert.match(core,/revision:s\.revision\+1/);
assert.match(api,/returningFromBoundary/);
assert.match(api,/current\.phase!=='DONE'/);
assert.match(route,/backToStageFive=\{/);
assert.match(shell,/backToStageFive/);

assert.ok(!scene.includes('flint-defeated.webp'),'No false injury depiction before combat');
assert.match(route,/crypto\.randomUUID\(\)/);
assert.match(route,/expectedRevision:revision/);
assert.match(route,/sceneLocation="Industrial service passage"/);
assert.match(shell,/millhand\/wage-claim/);
assert.match(home,/Continue the confrontation/);
const nextStep=read('apps/web/src/lib/StageFourNextStep.svelte');
assert.match(nextStep,/NEXT STEP/);
assert.match(nextStep,/Continue to The Wage Claim/);
assert.match(nextStep,/millhand\/wage-claim/);
assert.match(nextStep,/button-normal-trim\.png/);
for(const name of [
  'MillhandDepotScene.svelte',
  'MillhandContractsScene.svelte',
  'MillhandRecordsScene.svelte',
  'MillhandSecondJobScene.svelte'
]){
  const scene=read('apps/web/src/lib/'+name);
  assert.match(scene,/StageFourNextStep/,
    'All Stage 4 outcomes must show the next-chapter action inside their dialogue: '+name);
  assert.match(scene,/class="work-dialogue"/);
  assert.match(scene,/STAGE_FOUR_FINAL/);
}
assert.doesNotMatch(last,/class="follow-up"|Continue to The Wage Claim/,
  'No duplicate Stage 5 link is allowed in the bottom status strip');
assert.match(dev,/DELETE FROM player_character_wage_claim_receipts/);
assert.match(dev,/DELETE FROM player_character_wage_claim WHERE/);
assert.ok(packageJSON.scripts['wage-claim:migrate']);
assert.ok(packageJSON.scripts['verify:stage-five-assets']);
console.log('PASS: Stage 4→5 handoff, approved Flint dialogue, durable route evidence, stance and combat boundary.');
