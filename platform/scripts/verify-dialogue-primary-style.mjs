/** One owner-approved primary skin across every narrative origin/stage.
 * The Millhand nine-slice PNG (normal/hover/pressed) is the single
 * implementation; Bellrunner must not carry its own CSS-only approximation.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const stylesheet=read('apps/web/src/lib/pall-story-landscape.css');

for(const file of ['button-normal-trim.png','button-hover-trim.png','button-pressed-trim.png']){
  assert.ok(existsSync(resolve(root,'apps/web/static/ui-kit/buttons',file)),
    'Missing owner-provided primary button asset: '+file);
  assert.ok(stylesheet.includes("url('/ui-kit/buttons/"+file+"')"),
    'Shared stylesheet must own all three primary button states: '+file);
}
assert.ok(stylesheet.includes('border-image-slice:50 180 45 180 fill')&&
  stylesheet.includes('border-image-width:9px 17px 9px')&&
  stylesheet.includes('.primary-choice:is(:hover,:focus-visible)'),
  'Use the true Millhand framed action art, with correct slices and hover states');
assert.ok(stylesheet.includes('.pall-story-dialogue-section')&&
  stylesheet.includes('.clinic-dialogue,.home-dialogue'),
  'One primary rule must include workshop, clinic, home, and both origins');

const files={
  'apps/web/src/lib/BellrunnerSecondJobScene.svelte':[
    "'primary-choice':'secondary-choice'"],
  'apps/web/src/routes/characters/[id]/bellrunner/wrong-bell/+page.svelte':[
    'class="primary-choice continue-choice"'],
  'apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte':[
    'class="primary-choice"'],
  'apps/web/src/lib/BellrunnerOpeningScene.svelte':[
    'class="primary-choice"'],
  'apps/web/src/lib/BellrunnerHectorConversation.svelte':[
    'class="primary-choice"'],
  'apps/web/src/lib/MillhandMissingStampScene.svelte':[
    'class="primary-choice"','class="secondary-choice leave"'],
  'apps/web/src/lib/MillhandWorkScene.svelte':[
    "class={contextualActions.length===1?'primary-choice':'secondary-choice'}"],
  'apps/web/src/lib/MillhandContractsScene.svelte':[
    "class={workActions.length===1?'primary-choice':'secondary-choice'}"],
  'apps/web/src/lib/MillhandRecordsScene.svelte':[
    "class={workActions.length===1?'primary-choice':'secondary-choice'}"],
  'apps/web/src/lib/MillhandDepotScene.svelte':[
    'class="primary-choice"',
    "class={workActions.length===1?'primary-choice':'secondary-choice'}"],
  'apps/web/src/lib/MillhandSecondJobScene.svelte':[
    "class={actions.length===1?'primary-choice':'secondary-choice'}"],
  'apps/web/src/lib/MillhandWageClaimScene.svelte':[
    "class={forwardActions.length===1?'primary-choice':'secondary-choice'}"],
  'apps/web/src/lib/StageFourNextStep.svelte':[
    'class="stage-next-step-link primary-choice"'],
  'apps/web/src/lib/WorkshopScene.svelte':[
    'class="primary-choice"'],
  'apps/web/src/lib/NpcConversation.svelte':[
    'class="primary-choice"'],
  'apps/web/src/routes/characters/[id]/millhand/clinic/+page.svelte':[
    'class="pall-framed-button advance primary-choice"'],
  'apps/web/src/routes/characters/[id]/home/+page.svelte':[
    'class="pall-framed-button primary-choice"']
};
for(const [path,patterns] of Object.entries(files)){
  const text=read(path);
  for(const pattern of patterns)
    assert.ok(text.includes(pattern),'Missing canonical button semantic in '+path+': '+pattern);
}
// Prevent copying old local colors/borders back into the scene components.
// Secondary-choice remains the intentionally lighter alternative.
for(const path of [
  'apps/web/src/lib/BellrunnerSecondJobScene.svelte',
  'apps/web/src/lib/BellrunnerOpeningScene.svelte',
  'apps/web/src/lib/BellrunnerHectorConversation.svelte',
  'apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte',
  'apps/web/src/routes/characters/[id]/bellrunner/wrong-bell/+page.svelte',
  'apps/web/src/lib/MillhandContractsScene.svelte',
  'apps/web/src/lib/MillhandRecordsScene.svelte',
  'apps/web/src/lib/MillhandDepotScene.svelte',
  'apps/web/src/lib/MillhandMissingStampScene.svelte',
  'apps/web/src/lib/MillhandWageClaimScene.svelte',
  'apps/web/src/lib/MillhandWorkScene.svelte'
]){
  const css=read(path).split('<style>')[1]??'';
  assert.ok(!/\.(?:actions|responses|choices)\s*>?\s*button\s*\{[^}]*\b(?:background|border-image-source)\s*:/s.test(css),
    'Scene-level button art overrides global Millhand primary: '+path);
}
console.log('PASS: one real Millhand primary PNG skin across '+Object.keys(files).length+
  ' dialogue scenes; no local action-art overrides');
