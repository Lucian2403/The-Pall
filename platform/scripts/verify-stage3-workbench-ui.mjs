import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const stages=['WorkshopScene.svelte','MillhandWorkScene.svelte','MillhandMissingStampScene.svelte']
 .map(n=>read('apps/web/src/lib/'+n));
for(const [i,s] of stages.entries()){
 assert.match(s,/workshop-object-labels\.css/);
 assert.match(s,/class="workshop-npc-label">Guther Anvil<\/span>/,'Stage '+(i+1));
 assert.match(s,/class="npc-hotspot"/);
 assert.doesNotMatch(s,/class="npc-label"/);
}
const css=read('apps/web/src/lib/workshop-object-labels.css');
assert.match(css,/dialogue-frame-trim\.png/);
assert.match(css,/\.workshop-npc-label/);
const s=stages[2];
assert.match(s,/returned-reference-plate\.webp/);
assert.match(s,/cancellation-slip\.webp/);
assert.equal((s.match(/data-workshop-object/g)||[]).length,2);
assert.match(s,/aria-pressed=\{inspectedView === "plate"\}/);
assert.match(s,/aria-pressed=\{inspectedView === "slip"\}/);
assert.match(s,/class:seen=\{sceneState\.plateRead\}/);
assert.match(s,/class:seen=\{sceneState\.slipRead\}/);
// Evidence props scale with the scene stage (container units), not the window.
assert.match(s,/clamp\(64px, 13cqi, 180px\)/);
assert.doesNotMatch(s,/scene-footer|Council-owned evidence\. No wages/);
assert.ok(s.includes("registerSceneJournal?.({title:'The Missing Stamp',entries:journal});"));
assert.doesNotMatch(s,/journalOpen|toggleJournal|id="stage-three-journal"|class="journal-entries"/,
  'Stage 3 supplies diary text but must never create a second Journal panel');
const shared=read('apps/web/src/lib/PersonalJournal.svelte');
assert.ok(shared.includes('id="personal-journal"')&&shared.includes('class="reading-area journal-reading"'),
  'One shared Journal renders live and completed diary text');
assert.match(s,/continueToJob/);
assert.match(s,/snapshot\.availableActions/);
console.log('PASS: Guther, Stage3 evidence and in-scene journal retain their interactions.');
