/**
 * Static safety smoke checks for the local-only Millhand stage-replay control.
 * Real transaction/ownership tests require a signed-in test character and DB.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const api=readFileSync(resolve(root,'apps/api/src/millhand-stage-rewind-routes.ts'),'utf8');
const core=readFileSync(resolve(root,'packages/game-core/src/millhand-rewind.ts'),'utf8');
const ui=readFileSync(resolve(root,'apps/web/src/lib/TutorialShell.svelte'),'utf8');
const index=readFileSync(resolve(root,'apps/api/src/index.ts'),'utf8');

assert.ok(index.includes('registerMillhandStageRewindRoutes(api)'), 'API registration missing');
assert.ok(api.includes("process.env.NODE_ENV==='production'||!loopback"), 'Developer endpoint must be unavailable in production and on public API hosts');
assert.ok(api.includes("app.get<{Params:Params}>('/api/characters/:id/dev/rewind-stage'"),'Capability GET must exist');
assert.ok(api.includes("app.post<{Params:Params}>('/api/characters/:id/dev/rewind-stage'"),'Protected rewind POST must exist');
assert.ok(api.includes('session?.user.emailVerified'),'Rewind requires verified login');
assert.ok(api.includes('id=$1 AND account_id=$2 FOR UPDATE'),'Rewind must lock an account-owned character');
assert.ok(api.includes('c.rows[0].tutorial_stage!==expectedStage'),'Only one stage may be rewound per request');
assert.ok(api.includes("return reply.code(409).send({error:'stale_stage'"),'Stale requests must fail');
assert.ok(api.includes('DELETE FROM player_character_missing_stamp_receipts'),'Stage3 receipts must clear');
assert.ok(api.includes('DELETE FROM player_character_work_receipts'),'Stage2 receipts must clear');
assert.ok(api.includes("JSON.stringify(INITIAL_PLATEWORK)"),'Stage2 restarts clean');
assert.ok(core.includes('if(sorted({...bonuses})!==sorted(expected))'),'Unexpected skill bonuses must block destructive rewind');
assert.ok(core.includes('Craftsmanship:APPROVED_STARTING_FACTS.originMajorSkillBonusLevels'),'Starting bonuses must remain intact');
assert.ok(ui.includes('dev/rewind-stage'),'Control must query the server capability');
assert.ok(ui.includes('window.confirm('),'Rewind must require player confirmation');
assert.ok(ui.includes("'← Back to Stage '+rewindTargetStage"),'Button must use verified server-provided target stage');
assert.ok(api.includes('targetStage:canReturnToClinic?7') && api.includes("if(expectedStage===8)"),
  'Stage 8 must rewind to Stage 7 instead of resetting combat and clinic fee');
assert.ok(ui.includes('await goto(data.route,{replaceState:true,invalidateAll:true})'),'Reload target scene from server after saved rewind');
assert.ok(api.includes('if(stage===3||stage===4)')&&
  api.includes("targetStage:canRewind?3:null"),
  'Bellrunner Stage 4 must advertise Back to Stage 3 after entering the work');
assert.ok(api.includes("['NOT_STARTED','IN_PROGRESS'].includes(result.rows[0].tutorial_status)")&&
  api.includes("['NOT_STARTED','IN_PROGRESS'].includes(c.rows[0].tutorial_status)"),
  'Bellrunner Stage 4 rewind must work before AND after the first action');
assert.ok(api.includes("if(bellrunner&&expectedStage===4)")&&
  api.includes('DELETE FROM player_character_bellrunner_second_job_receipts')&&
  api.includes('DELETE FROM player_character_bellrunner_second_job WHERE')&&
  api.includes("major_skill_bonuses=$2::jsonb"),
  'Rewind must atomically clear Stage 4 and undo the one-time selected skill');
assert.ok(!api.includes("started.rows[0].state.revision!==0"),
  'Do not reintroduce the old cannot-rewind-after-start gate');
const secondJobPage=readFileSync(
  resolve(root,'apps/web/src/routes/characters/[id]/bellrunner/second-job/+page.svelte'),'utf8');
assert.ok(secondJobPage.includes('TutorialShell')&&
  secondJobPage.includes('<TutorialShell {character}'),
  'Every new Bellrunner stage must mount the common shell that owns Back to Stage N');
assert.ok(ui.includes("'← Back to Stage '+rewindTargetStage"),
  'The button label must remain consistent across every origin and stage');

console.log('PASS: Local-only stage rewind, Bellrunner Stage 4 mid-job replay, shared UI and skill/receipt safeguards.');
