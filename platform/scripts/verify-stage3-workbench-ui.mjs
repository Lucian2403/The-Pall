import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const stages=[
  read('apps/web/src/lib/WorkshopScene.svelte'),
  read('apps/web/src/lib/MillhandWorkScene.svelte'),
  read('apps/web/src/lib/MillhandMissingStampScene.svelte')
];
const stage3=stages[2];
const nameplates=read('apps/web/src/lib/workshop-object-labels.css');

for(const [i,stage] of stages.entries()){
  assert.ok(stage.includes("import '$lib/workshop-object-labels.css'"),
    'Stage '+(i+1)+' must import the common nameplate artwork');
  assert.ok(stage.includes('<span class="workshop-npc-label">Guther Anvil</span>'),
    'Stage '+(i+1)+' must display the same framed Guther Anvil nameplate');
  assert.ok(stage.includes('class="npc-hotspot"') &&
    (stage.includes('aria-label="Talk to Guther Anvil"') ||
     stage.includes('aria-label="Speak to Guther Anvil"')),
    'Stage '+(i+1)+' must retain the accessible original Guther hitbox');
  assert.ok(!stage.includes('class="npc-label"') &&
    !stage.includes(' .npc-label{') &&
    !stage.includes(' .npc-label {'),
    'Stage '+(i+1)+' must not restore an independent dark nameplate');
}
for(const style of [
  '.workshop-object-label{',
  '.workshop-npc-label{',
  "border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png')",
  'border-image-slice:145 190 125 190 fill',
  'border-image-width:10px 15px 9px',
  'color:#2e1d11',
  'font:700 clamp(12px,1.15vw,15px)/1.15',
  ':is(.prop-marker,.target,.evidence button)',
  '@media(max-width:700px)'
]){
  assert.ok(nameplates.includes(style),'Missing matching workshop nameplate styling: '+style);
}
assert.equal(nameplates.split("border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png')").length-1,2,
  'Guther and tabletop objects should both use the same owner-provided parchment frame');

for(const [art,label] of [
  ['returned-reference-plate.webp','Returned plate'],
  ['cancellation-slip.webp','Cancellation slip']
]){
  assert.ok(stage3.includes('src="/workshop/'+art+'"') &&
    stage3.includes('<span class="workshop-object-label">'+label+'</span>'),
    'Stage 3 must retain the original evidence cutout and use the Stage 2 caption frame: '+label);
}
assert.equal((stage3.match(/data-workshop-object/g)??[]).length,2,
  'Both evidence props must remain independently clickable across the full hitbox');
assert.ok(stage3.includes("aria-pressed={inspectedView==='plate'}") &&
  stage3.includes("aria-pressed={inspectedView==='slip'}") &&
  stage3.includes("class:seen={state.plateRead}") &&
  stage3.includes("class:seen={state.slipRead}") &&
  stage3.includes("data-pall-sfx=\"click\"") &&
  stage3.includes("data-pall-sfx=\"paper\""),
  'Keep keyboard-selected evidence feedback and physical sound assignments');
assert.ok(stage3.includes("onclick={() => {void inspect('plate');}}") &&
  stage3.includes("onclick={() => {void inspect('slip');}}") &&
  stage3.includes("if(canAct(act))await perform(act)") &&
  stage3.includes("state.phase==='CONFRONT'||state.phase==='DECISION'||state.phase==='RESTAMP'"),
  'Do not alter server-backed inspection and disabled phases');
assert.ok(stage3.includes('class="evidence"') &&
  stage3.includes('.evidence{position:absolute;z-index:4;left:29%;bottom:3%;width:42%;') &&
  stage3.includes('height:clamp(108px,8vw,140px)') &&
  stage3.includes('.evidence-art{height:clamp(88px,24vw,138px)}') &&
  stage3.includes('transform:scale(1.018)') &&
  stage3.includes('.evidence{position:relative;left:auto;bottom:auto;grid-column:1;grid-row:1;'),
  'Keep the original evidence positions, art sizing, hover behavior and mobile layout');
assert.ok(!stage3.includes('class="evidence-label"') &&
  !stage3.includes('class="scene-footer"') &&
  !stage3.includes('Council-owned evidence. No wages, ordinary XP or items are awarded during this scene.') &&
  !stage3.includes('.footnote{'),
  'Remove the obsolete dark evidence nameplates and development disclaimer band');

const dialogueEnd=stage3.indexOf('</aside>');
const journalTrigger=stage3.indexOf('class="journal-toggle journal-outside"');
const sceneEnd=stage3.indexOf('  </div>\n  {#if journalOpen}',dialogueEnd);
const journalPanel=stage3.indexOf('<section id="stage-three-journal"');
assert.ok(dialogueEnd>0 && journalTrigger>dialogueEnd && sceneEnd>journalTrigger &&
  journalPanel>sceneEnd,
  'Journal control must float outside the CRPG dialogue; journal content remains below the scene');
assert.ok(stage3.includes("onclick={() => {void toggleJournal();}}") &&
  stage3.includes('aria-controls="stage-three-journal"') &&
  stage3.includes('aria-expanded={journalOpen}') &&
  stage3.includes('scrollIntoView({block:') &&
  stage3.includes('.journal-outside{') &&
  stage3.includes('position:absolute;z-index:7;top:10px;') &&
  stage3.includes("border-image-source:url('/ui-kit/buttons/button-normal-trim.png')") &&
  stage3.includes('class="journal-panel"'),
  'Journal must remain accessible, independently scrollable, and framed without a footer');
assert.ok(stage3.includes("MISSING_STAMP_HANDOFF") &&
  stage3.includes('evidencePage===1') &&
  stage3.includes('snapshot.finding') &&
  stage3.includes("canAct('show_guther')") &&
  stage3.includes("canAct('continue_dialogue')") &&
  stage3.includes('decisionStep=1;') &&
  stage3.includes('continueToJob'),
  'Keep the authored three-page evidence and server-backed story/route actions');

console.log('PASS: Stage 1–3 Guther nameplates share original dialogue art; Stage 3 evidence frames, journal access, layout and gameplay intact; obsolete footer removed.');
