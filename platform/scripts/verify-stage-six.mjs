import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const engine=read('packages/game-core/vendor/combat-v0.5.1/combat.mjs');
const engineHash=createHash('sha256').update(engine).digest('hex');
assert.equal(engineHash,'4d7b2c958611c8b564113a9c8825b7346461516e02d237b09fce331ba3e5ef89',
  'The approved v0.5.1 engine must remain byte-for-byte unchanged');
const api=read('apps/api/src/millhand-combat-routes.ts');
const view=read('apps/api/src/millhand-combat-view.ts');
const scene=read('apps/web/src/lib/MillhandCombatScene.svelte');
const page=read('apps/web/src/routes/characters/[id]/millhand/combat/+page.svelte');
const five=read('apps/web/src/routes/characters/[id]/millhand/wage-claim/+page.svelte');
const claim=read('apps/api/src/millhand-wage-claim-routes.ts');
const home=read('apps/web/src/lib/CharacterHome.svelte');
const shell=read('apps/web/src/lib/TutorialShell.svelte');
const mig=read('db/migrations/0007_millhand_flint_combat.sql');
const boot=read('apps/api/src/index.ts');
assert.ok(boot.includes('registerMillhandCombatRoutes(api)'));
assert.ok(api.includes('newEncounter(\'flint\'') &&
  api.includes('state=step(record.state,command.action') &&
  api.includes('FOR UPDATE') &&
  api.includes('account_id=$2') &&
  api.includes('randomBytes(4)') &&
  api.includes('player_character_flint_combat_receipts') &&
  api.includes('current_health=$2') &&
  api.includes('unexpected_encounter_outcome'),
  'Server must own both combat and character Health');
for(const stance of ['brace','moving','cart'])assert.ok(api.includes("stance==='"+stance+"'"));
assert.ok(claim.includes('combat_already_started'),'Stance cannot be rewound after combat begins');
assert.ok(page.includes("kind:'start'") &&
  page.includes("kind:'turn'") &&
  page.includes('retrySignature=signature') &&
  page.includes('MillhandCombatScene'),
  'No extra pre-fight choice and round retries must be idempotent');
assert.ok(five.includes('/millhand/combat'));
assert.ok(home.includes('/millhand/combat')&&shell.includes('/millhand/combat'));
assert.ok(scene.includes('snapshot.enemyIntent') &&
  scene.includes('snapshot.events') &&
  scene.includes('snapshot.rules') &&
  scene.includes('snapshot.player.wounds.some') &&
  scene.includes('snapshot.outcome') &&
  scene.includes('Stage 7 is not yet connected'),
  'UI must use real combat state and avoid fake clinic');
assert.ok(view.includes('TEST_CONFIG')&&view.includes('testAttackCost'));
assert.ok(mig.includes('player_character_flint_combat_receipts')&&mig.includes('history JSONB'));
assert.ok(!api.includes('UPDATE player_characters SET coins') &&
  !api.includes('tutorial_stage=7') &&
  !api.includes('ordinary_xp') &&
  !api.includes('arms_xp'),
  'Combat must not introduce payouts, healing or an unfinished clinic transition');

// Stage 6 display refinement: the six supplied actions are files, never
// reimplementations of the authoritative engine's turn handling.
const assets={
  'strike.webp':'attack',
  'guard.webp':'guard',
  'reposition.webp':'move',
  'recover.webp':'recover',
  'press-advantage.webp':'technique'
};
for(const [asset,action] of Object.entries(assets)){
  const file=readFileSync(resolve(root,'apps/web/static/ui-kit/combat-actions',asset));
  assert.equal(file.toString('ascii',0,4),'RIFF',asset+' must be a WebP image');
  assert.equal(file.toString('ascii',8,12),'WEBP',asset+' must be a WebP image');
  assert.ok(file.length>1000&&file.length<30000,asset+' must be an optimized standalone asset');
  assert.ok(scene.includes("id:'"+action+"'")&&scene.includes("asset:'"+asset+"'"),
    'The '+action+' button must display the supplied '+asset);
}
const confirm=readFileSync(resolve(root,'apps/web/static/ui-kit/combat-actions/confirm-action.webp'));
assert.equal(confirm.toString('ascii',8,12),'WEBP','Confirm action icon missing');
assert.ok(scene.includes("iconBase+'confirm-action.webp'")&&
  scene.includes('aria-pressed={visibleSelection===choice.id}')&&
  scene.includes('aria-label={`Select ${choice.label} action`}')&&
  scene.includes('class="action-name"')&&
  scene.includes('opacity:.76')&&
  scene.includes('snapshot.events.slice(-6)')&&
  scene.includes('class="duel-board"'),
  'The UI must keep icon-first action choices, accessible labels and a compact Chronicle');

console.log('PASS: original v0.5.1 checksum, stage handoff, authenticated atomic turns, real Chronicle and no invented Stage 7.');
