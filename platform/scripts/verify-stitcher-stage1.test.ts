import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {APPROVED_STAGE_ONE,resolveStageOneChoice} from '../apps/web/src/lib/approved-stage-one.ts';

const root=resolve(import.meta.dirname,'..');
const source=(p:string)=>readFileSync(resolve(root,p),'utf8');

test('Owner-provided Claudia portrait is present as WebP and mounted on the actual opening scene',()=>{
  const portrait=readFileSync(resolve(root,'apps/web/static/characters/claudia/claudia-front.webp'));
  assert.ok(portrait.length>8000,'Claudia portrait must not be an empty placeholder');
  assert.equal(portrait.toString('ascii',0,4),'RIFF');
  assert.equal(portrait.toString('ascii',8,12),'WEBP');
  const scene=source('apps/web/src/lib/StitcherOpeningScene.svelte');
  const route=source('apps/web/src/routes/characters/[id]/opening/+page.svelte');
  assert.ok(scene.includes('src="/characters/claudia/claudia-front.webp"'));
  assert.ok(scene.includes('src="/locations/clinic/clinic-workshop-cold.webp"'));
  assert.ok(scene.includes('class="claudia"'));
  assert.ok(scene.includes('aria-label="Inspect Claudia Cyka"'));
  assert.ok(scene.includes('class="npc-hotspot"'));
  assert.ok(scene.includes('<ActivityLayout mode="scene"'));
  assert.ok(scene.includes('stageAspect={1672/941}'));
  assert.ok(scene.includes("import '$lib/pall-story-landscape.css'"));
  assert.ok(scene.includes('class="primary-choice"'));
  assert.ok(!scene.includes('onclick={takeRound}'));
  assert.ok(route.includes("character.origin === 'Stitcher'"));
  assert.ok(route.includes('<StitcherOpeningScene'));
});
test('Stitcher Stage I follows the owner-approved November Claudia lines',()=>{
  const scene=APPROVED_STAGE_ONE.Stitcher;
  assert.equal(scene.npc,'Claudia Cyka');
  assert.equal(scene.start,'setting');
  assert.equal(scene.nodes.opening.text,'Those two by the door need fresh dressings. Get on with it.');
  assert.equal(scene.nodes.remark.choices?.[0].label,"There's hardly any clean linen left.");
  assert.equal(scene.nodes.remarkAnswer.text,'I know. Use what they need. No more.');
  assert.equal(scene.nodes.instructions.text,"Look at the wounds first. If either one's worse than expected, come and get me. Don't guess.");
  assert.equal(scene.nodes.take.kind,'handoff');
  assert.equal(resolveStageOneChoice(scene,'remarkPlayer'),'remarkAnswer');
  assert.equal(scene.nodes.take.text,'Check the ward round');
});
test('Stage I does not pretend a Stage II handoff or permanent rewards have shipped',()=>{
  const scene=source('apps/web/src/lib/StitcherOpeningScene.svelte');
  assert.ok(scene.includes('The Stage II handoff is not connected yet.'));
  assert.ok(!scene.includes('major_skill_bonuses='));
  assert.ok(scene.includes('Previous line'));
});
