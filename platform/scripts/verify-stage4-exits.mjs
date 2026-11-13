import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const core=read('packages/game-core/src/millhand-second-job.ts');
const api=read('apps/api/src/millhand-second-job-routes.ts');
const confrontationApi=read('apps/api/src/millhand-wage-claim-routes.ts');
const page=read('apps/web/src/routes/characters/[id]/millhand/second-job/+page.svelte');
const next=read('apps/web/src/lib/StageFourNextStep.svelte');
const copy=read('apps/web/src/lib/approved-stage-four.ts');
const canon=read('../docs/05-gameplay/onboarding/millhand/stage-4-approved-script.md');
assert.ok(core.includes("case 'DONE':return ['leave_location']") &&
  core.includes("case 'leave_location':phase='EXITED'") &&
  core.includes("case 'EXITED':return []"),
  'Every job must explicitly save a location exit exactly once');
assert.ok(api.includes("if(next.phase==='EXITED')") &&
  api.includes('nextCharacter.tutorial_stage=5') &&
  api.includes("ch.tutorial_stage===4?availableSecondJobActions(state):[]"),
  'Stage must advance on exit, not just completion; old saves cannot repeat exit');
assert.ok(confrontationApi.includes("job.state.phase==='EXITED'") &&
  confrontationApi.includes("stage>=5&&job.state.phase==='DONE'") &&
  confrontationApi.includes('if(c.rows[0].tutorial_stage>6)'),
  'New exits and old Stage 5/6 DONE saves must both enter the existing Stage5 API');
assert.ok(page.includes("action==='leave_location'") &&
  page.includes('/millhand/wage-claim'),
  'Browser must navigate after confirmed saved exit');
for(const [branch,sceneName,label] of [
  ['restamp','MillhandDepotScene.svelte','Leave the depot'],
  ['contracts','MillhandContractsScene.svelte','Leave the Contracts office'],
  ['records','MillhandRecordsScene.svelte','Leave the records room']
]){
  const scene=read('apps/web/src/lib/'+sceneName);
  assert.ok(scene.includes('StageFourNextStep {snapshot} {pending} {perform}'),
    'Missing shared exit component in '+sceneName);
  assert.ok(next.includes(label),'Missing route-specific exit label for '+branch);
  assert.ok(scene.includes("availableActions.filter(action=>action!=='leave_location')") &&
    scene.includes('workActions as action'),
    'The normal action list must not render a second generic leave button: '+branch);
}
const fallback=read('apps/web/src/lib/MillhandSecondJobScene.svelte');
assert.ok(fallback.includes("availableActions.filter(action=>action!=='leave_location')"),
  'Generic fallback must also render only the contextual exit');
assert.ok(next.includes("snapshot.stage>=5") &&
  next.includes("snapshot.state.phase==='DONE'||snapshot.state.phase==='EXITED'") &&
  next.includes("void perform('leave_location')") &&
  next.includes('class="stage-next-step-link primary-choice" {href}'),
  'Legacy Stage 5/6 must see navigation without a forbidden server write');
assert.doesNotMatch(next,/NEXT STEP|Continue to The Wage Claim|face Flint/i,
  'Never spoil the encounter in the completion screen');
assert.ok(!copy.includes('You leave the Contracts office, pissed off'),
  'Completion must not declare that the player has already left');
assert.ok(canon.includes('Owner-approved Stage 4 → Stage 5 exit handoff — 2026-11-02'));
console.log('PASS: All three visible exits, one saved exit trigger, Stage 5/6 legacy-safe navigation and no spoiler.');
