import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const intro=read('apps/web/src/lib/WorkshopScene.svelte');
const platework=read('apps/web/src/lib/MillhandWorkScene.svelte');
const panel=read('apps/web/src/lib/WorkshopItemPopover.svelte');
const labels=read('apps/web/src/lib/workshop-object-labels.css');
const ui=read('apps/web/src/lib/pall-owner-ui.css');

// This is one reusable CRPG inspection component, not duplicated Stage 1
// and Stage 2 overlay CSS that will diverge when future workshops are added.
for(const src of [intro,platework]){
  assert.ok(src.includes("import WorkshopItemPopover from '$lib/WorkshopItemPopover.svelte'") &&
    src.includes("import '$lib/workshop-object-labels.css'"),
    'Both workshops must use the reusable inspection and nameplate treatment');
  assert.ok(src.includes('data-workshop-object') &&
    src.includes('aria-pressed=') && src.includes('aria-label=') &&
    src.includes('<span class="workshop-object-label">'),
    'Keep keyboard-operable full-art hitboxes and all four framed object labels');
  assert.ok(src.includes('{#if selected && !talkingToGuther}') &&
    src.includes('<WorkshopItemPopover itemKey={selected}') &&
    src.includes('onClose={() => {selected=null;}}>'),
    'Selected item must open nearby, and optional Guther dialogue must hide it');
  assert.ok(!src.includes('<div class="inspection"') &&
    !src.includes('class="tag"') && !src.includes('class="label"'),
    'Remove old below-art description strip and plain dark labels');
  assert.ok(src.includes('height:clamp(535px,62vh,640px)') &&
    src.includes('bench-foreground') &&
    src.includes('clip-path:inset(70% 0 0 0)') &&
    src.includes('height:37%') && src.includes('height:44%') &&
    src.includes('scale(1.018)'),
    'Must retain original workshop composition, tabletop hitboxes and hover art');
}
assert.ok(intro.includes('description={workshopObjects[selected].observation}') &&
  intro.includes('Stage 2 work commands are not enabled in this read-only integration.') &&
  intro.includes("skipToWork={() => {talkingToGuther=false;selected=null;skipToWork();}}") &&
  intro.includes('data-pall-sfx={key===\'paper\'?\'paper\':\'click\'}'),
  'Stage 1 remains read-only and keeps its approved work handoff and SFX');
assert.ok(platework.includes('description={observation??\'\'}') &&
  platework.includes('const observation = $derived(selected ? observeObject(selected,work) : null)') &&
  platework.includes('const contextualActions = $derived(selected ? available.filter') &&
  platework.includes('{#each contextualActions as action}') &&
  platework.includes('disabled={pending}') &&
  platework.includes('onclick={() => {void commitAction(action);}}') &&
  platework.includes('await perform(action);') &&
  platework.includes('selected = null;') &&
  platework.includes("action==='stamp_number'||action==='straighten'||action==='fix_mark'"),
  'Stage 2 must keep server-backed contextual commands, disabled pending state and smithing sound mapping');
assert.equal((platework.match(/<div class="actions">/g)??[]).length,1,
  'Stage 2 commands should appear once, beside selected object only');

for(const phrase of [
  "document.addEventListener('pointerdown',outside,true)",
  "document.removeEventListener('pointerdown',outside,true)",
  "document.addEventListener('keydown',keydown)",
  "document.removeEventListener('keydown',keydown)",
  "panel?.contains(target)",
  "target.closest('[data-workshop-object]')",
  "event.key!=='Escape'",
  "event.stopPropagation()",
  "role=\"region\"",
  "aria-live=\"polite\"",
  "class=\"workshop-inspection {itemKey}\"",
  "aria-label={'Close '+title+' inspection'}",
  "overflow-y:auto",
  "bottom:40%",
  "@media(max-width:700px)",
  "dialogue-frame-trim.png"
]){
  assert.ok(panel.includes(phrase),'Workshop inspection popup contract lost: '+phrase);
}
for(const position of ['stamps{left:2%}','plates{left:25%}','paper{right:13%}','hammer{right:2%}']){
  assert.ok(panel.includes(position),'Item popup no longer anchored near '+position);
}
assert.ok(labels.includes('.workshop .workshop-object-label{') &&
  labels.includes("border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png')") &&
  labels.includes('border-image-slice:145 190 125 190 fill') &&
  labels.includes('width:min(100%,240px)') &&
  labels.includes('@media(max-width:700px)') &&
  labels.includes('color:#2e1d11'),
  'Labels must use approved parchment nine-slice art, readable dark ink and mobile sizing');
assert.ok(ui.includes("border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png')") &&
  ui.includes("button-normal-trim.png"),
  'Shared owner dialogue and button artwork must remain intact');
console.log('PASS: Stage 1 and 2 near-object popovers, outside-click/Escape close, original dialogue labels, real work actions and responsive workshop art.');
