import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root = resolve(import.meta.dirname, '..');
const docs = resolve(root, '..', 'docs', '05-gameplay', 'onboarding');
const ts = readFileSync(resolve(root, 'apps/web/src/lib/approved-introductions.ts'), 'utf8');

function readConstant(name) {
  const start = `export const ${name} = `;
  const i = ts.indexOf(start);
  assert.ok(i >= 0, `Missing ${name}`);
  const rest = ts.slice(i + start.length);
  const stop = rest.indexOf(' as const;');
  assert.ok(stop >= 0, `Invalid ${name} delimiter`);
  return JSON.parse(rest.slice(0, stop));
}
function renderSegments(segments) {
  return segments.map(({text, style}) => {
    if (style === 'strong') return `**${text}**`;
    if (style === 'em') return `*${text}*`;
    assert.equal(style, 'normal', 'Unknown text style');
    return text;
  }).join('');
}
function canonical(name) {
  return readFileSync(resolve(docs, name), 'utf8').replace(/^<!--[\s\S]*?-->\s*/, '').trim();
}

const world = readConstant('APPROVED_WORLD_INTRO');
const worldText = ['# ' + world.heading, ...world.paragraphs.map(renderSegments)].join('\n\n');
assert.equal(worldText, canonical('world-introduction.md'), 'World introduction differs from approved Markdown');

const background = readConstant('APPROVED_BACKGROUND_SELECTION');
const blocks = ['# ' + background.heading, background.introduction];
for (const item of background.origins) {
  blocks.push(`**${item.heading}**`, item.description, `*Advantage:* ${item.advantage}`);
}
blocks.push('---', ...background.closing.map(renderSegments));
assert.equal(blocks.join('\n\n'), canonical('background-selection-introduction.md'), 'Background copy differs from approved Markdown');
assert.equal(background.origins.length, 6, 'Expected exactly six origins');
assert.deepEqual(background.origins.map(x => x.origin), ['Millhand', 'Bellrunner', 'Squatter', 'Stitcher', 'Scrapper', 'Inkbound']);
console.log('PASS: Approved world introduction matches canonical Markdown word for word.');
console.log('PASS: All six background descriptions and closing copy match canonical Markdown word for word.');


// M1.3: static scripted dialogue must keep the exact approved spoken/scene
// wording. Runtime UI labels ("Continue") are controls, not quoted canon.
// This also catches missing nodes, unintended cycles and unreachable handoffs.
const scriptSource = readFileSync(resolve(root, 'apps/web/src/lib/approved-stage-one.ts'), 'utf8');
const stageMarker = 'export const APPROVED_STAGE_ONE: Readonly<Record<string, StageOneScene>> = ';
const stageStart = scriptSource.indexOf(stageMarker);
assert.ok(stageStart >= 0, 'Missing canonical Stage 1 dialogue catalogue');
const jsonAfter = scriptSource.slice(stageStart + stageMarker.length);
const stageEnd = jsonAfter.lastIndexOf(';');
assert.ok(stageEnd >= 0, 'Invalid Stage 1 dialogue catalogue');
const scenes = JSON.parse(jsonAfter.slice(0, stageEnd));

assert.deepEqual(Object.keys(scenes), ['Millhand','Bellrunner','Squatter','Stitcher','Scrapper','Inkbound']);
for (const [origin, scene] of Object.entries(scenes)) {
  const approved = readFileSync(resolve(docs, scene.source, 'opening-dialogue.md'), 'utf8');
  assert.ok(scene.nodes[scene.start], `${origin} has no initial scene node`);
  const visiting = new Set(), done = new Set();
  let handoffs = 0;

  function visit(nodeId) {
    assert.ok(scene.nodes[nodeId], `${origin}: missing dialogue node ${nodeId}`);
    assert.ok(!visiting.has(nodeId), `${origin}: cyclic auto-dialogue ${nodeId}`);
    if (done.has(nodeId)) return;
    visiting.add(nodeId);
    const node = scene.nodes[nodeId];
    if (node.kind !== 'choice') {
      assert.ok(approved.includes(node.text), `${origin}: Stage 1 canonical copy drift at ${nodeId}: ${node.text}`);
    }
    const next = [];
    if (node.next) next.push(node.next);
    for (const choice of node.choices ?? []) {
      if (!choice.ui) assert.ok(approved.includes(choice.label), `${origin}: unapproved option ${choice.label}`);
      next.push(choice.next);
    }
    if (node.kind === 'handoff') {
      handoffs++;
      assert.equal(next.length, 0, `${origin}: work handoff must not execute Stage 2`);
    } else {
      assert.ok(next.length > 0, `${origin}: stranded dialogue node ${nodeId}`);
    }
    for (const target of next) visit(target);
    visiting.delete(nodeId);
    done.add(nodeId);
  }
  visit(scene.start);
  assert.equal(done.size, Object.keys(scene.nodes).length, `${origin}: unreachable dialogue nodes`);
  assert.equal(handoffs, 1, `${origin}: requires exactly one Stage 2 handoff`);
  console.log(`PASS: ${origin} Stage 1 retains approved dialogue and optional routes (${done.size} nodes)`);
}


// DRAFT NPC conversations: keep review copy and the in-game proposal in sync.
// This does not approve any of these lines as canon.
const proposedFile = readFileSync(resolve(root,'apps/web/src/lib/proposed-npc-dialogue.ts'),'utf8');
const proposedMarker = 'export const PROPOSED_NPC_DIALOGUE: Readonly<Record<string,NpcDialogue>> = ';
const proposedStart = proposedFile.indexOf(proposedMarker);
assert.ok(proposedStart >= 0,'NPC draft catalogue missing');
const proposedJson = proposedFile.slice(proposedStart + proposedMarker.length);
const proposedEnd = proposedJson.lastIndexOf(';');
assert.ok(proposedEnd >= 0,'NPC draft catalogue delimiter missing');
const proposed = JSON.parse(proposedJson.slice(0,proposedEnd));
const dialogueGuide = readFileSync(resolve(docs,'..','interactions','dialogue-style-guide.md'),'utf8');
assert.ok(dialogueGuide.includes('## OPTIONAL RECURRING NPC CONVERSATIONS — DRAFT FOR OWNER REVIEW'));
assert.deepEqual(Object.keys(proposed),Object.keys(scenes).filter(origin=>origin!=='Millhand'));
for (const [origin, npc] of Object.entries(proposed)) {
  assert.equal(npc.topics.length,3,origin+' must have exactly three optional topics');
  assert.deepEqual(npc.topics.map(x=>x.id),['work','city','lore']);
  for (const topic of npc.topics) {
    assert.ok(dialogueGuide.includes('“'+topic.prompt+'”'),origin+' missing draft player choice');
    assert.ok(dialogueGuide.includes('“'+topic.reply+'”'),origin+' draft NPC answer drifted');
  }
}
console.log('PASS: Five non-Millhand draft NPC conversation sets match existing dialogue review document (NOT CANON).');

// Every displayed player response selectable in the existing Stage 1 graph must
// lead to its answer without a second player-speech screen.
const stageFile = readFileSync(resolve(root,'apps/web/src/lib/approved-stage-one.ts'),'utf8');
assert.ok(stageFile.includes('export function resolveStageOneChoice'));
for (const [origin,scene] of Object.entries(scenes)) {
  for (const [id,node] of Object.entries(scene.nodes)) {
    if (node.kind !== 'choice') continue;
    for (const choice of node.choices) {
      const target = scene.nodes[choice.next];
      assert.ok(target,origin+' missing choice target '+id);
      if (target.kind==='speech' && target.speaker==='Player') {
        assert.ok(target.next && scene.nodes[target.next],origin+' missing NPC consequence for '+id);
        assert.notEqual(scene.nodes[target.next].speaker,'Player',origin+' would still repeat the player choice');
      }
    }
  }
}
console.log('PASS: Choice-to-answer paths contain no duplicated player speech beats.');

// Millhand has owner-approved optional dialogue, separate from the five unapproved
// previews. Verify that all spoken lines stay in sync with the approved file,
// and that dialogue-skipping never bypasses the Stage 1 work-paper handoff.
const gutherSource = readFileSync(resolve(root,'apps/web/src/lib/approved-guther-optional.ts'),'utf8');
const gutherDoc = readFileSync(resolve(docs,'millhand/guther-optional-conversation.md'),'utf8');
const spoken = [...gutherSource.matchAll(/^\s*(prompt|reply|followUp):\s*(['"])(.*?)\2\s*,?\s*$/gm)];
assert.equal(spoken.length,22,'Guther must keep all 11 player and 11 NPC lines');
for (const [,role,,utterance] of spoken) {
  assert.ok(gutherDoc.includes('“'+utterance+'”'),'Guther dialogue drift: '+role+' '+utterance);
}
assert.ok(gutherSource.includes('export const GUTHER_WORK_SKIP_LINE = "Enough talk. Let\'s work."'));
assert.ok(gutherDoc.includes('“Enough talk. Let\'s work.”'));

const npcUi = readFileSync(resolve(root,'apps/web/src/lib/NpcConversation.svelte'),'utf8');
const workshopUi = readFileSync(resolve(root,'apps/web/src/lib/WorkshopScene.svelte'),'utf8');
const workUi = readFileSync(resolve(root,'apps/web/src/lib/MillhandWorkScene.svelte'),'utf8');
const openingRoute = readFileSync(resolve(root,'apps/web/src/routes/characters/[id]/opening/+page.svelte'),'utf8');

assert.ok(npcUi.includes('{GUTHER_WORK_SKIP_LINE}'));
assert.ok(npcUi.includes('skipToWork ?? close'), 'Optional NPC skip must close the conversation when no Stage 1 skip is supplied');
assert.equal((npcUi.match(/class="work-skip"/g)??[]).length,2,'Guther skip must be available in topic menu and each reply');
assert.ok(npcUi.includes('gutherExchange.followUp'),'Guther follow-up branches missing');
assert.ok(workshopUi.includes('beat.kind !== \'handoff\''),'Skip action must disappear at the Stage 1 work handoff');
assert.ok(workshopUi.includes('skipToWork();'),'Stage 1 skip must use the supplied parent callback');
assert.ok(workshopUi.includes('skipToWork={() => {talkingToGuther=false;selected=null;skipToWork();}}'),
  'Skipping from optional talk must also skip Stage 1 introduction');
assert.ok(openingRoute.includes("nodeId = 'take'"),'Stage 1 skip must target the existing handoff');
assert.ok(openingRoute.includes("scene?.nodes.take?.kind !== 'handoff'"),'Stage 1 skip must validate the target');
assert.ok(openingRoute.includes('visited = []'),'Skip must clear old dialogue rewind history');
assert.ok(openingRoute.includes("action:'take_work_paper'"),'Work-paper handoff must still use the server POST');
assert.ok(workUi.includes('close={() => {talkingToGuther=false;}}'),'Stage 2 NPC skip must return to the unchanged work view');
assert.ok(workUi.includes('const contextualActions = $derived(selected ? available.filter'),
  'Stage 2 must restore selected work-object actions after optional talk');
assert.ok(!npcUi.includes('fetch('),'Optional dialogue must remain read-only');
console.log('PASS: Guther approved optional dialogue and universal Millhand skip remain consistent and non-mutating.');


// Stage 3 workshop layout: visual props must sit outside the small dialogue
// card, and the journal must never expand the card or the illustration region.
// The owner's transparent evidence cutouts are real items, not square UI cards.
const stage3SceneSource = readFileSync(resolve(root,'apps/web/src/lib/MillhandMissingStampScene.svelte'),'utf8');
const stage3DialogueEnd = stage3SceneSource.indexOf('</aside>');
const stage3SceneEnd = stage3SceneSource.indexOf('  </div>\n  <p class="footnote">',stage3DialogueEnd);
const journalPanelStart = stage3SceneSource.indexOf('<section id="stage-three-journal"');
assert.ok(stage3DialogueEnd>=0 && stage3SceneEnd>stage3DialogueEnd,'Missing Stamp scene shape changed');
assert.ok(stage3SceneSource.indexOf('<div class="evidence"')>stage3DialogueEnd,
  'Evidence must be a separate scene-grid sibling, not overlaying dialogue from inside the illustration');
assert.ok(stage3SceneSource.indexOf('<div class="evidence"')<stage3SceneEnd,
  'Evidence must remain part of the workshop scene');
assert.ok(journalPanelStart>stage3SceneEnd,
  'Stage3 journal entries must be outside the workshop scene and NPC popup');
assert.ok(stage3SceneSource.includes('grid-template-rows:minmax(0,1fr) 178px') &&
  stage3SceneSource.includes('height:clamp(700px,76vh,810px)'),
  'Stage3 scene must have a fixed desktop composition independent of dialogue content');
assert.ok(stage3SceneSource.includes('.evidence{grid-column:1;grid-row:1;'),
  'Mobile evidence must remain over the illustration, above the dialogue');
for(const name of ['returned-reference-plate.webp','cancellation-slip.webp']) {
  assert.ok(stage3SceneSource.includes('/workshop/'+name),'Missing supplied Stage3 art '+name);
}
for(const name of ['returned-reference-plate-record.webp','cancellation-slip-record.webp']) {
  assert.ok(stage3SceneSource.includes('/workshop/'+name),
    'Owner supplied record image must be shown on the second inspection page: '+name);
}
assert.ok(stage3SceneSource.includes('class="record-illustration"') &&
  stage3SceneSource.includes('max-height:240px'),
  'Printed evidence should remain compact inside the dialogue frame, without growing the scene');
assert.ok(stage3SceneSource.includes('class:record-view=') &&
  stage3SceneSource.includes('.dialogue.record-view{max-height:none;overflow:visible}') &&
  stage3SceneSource.includes('class="scene-footer"') &&
  !stage3SceneSource.includes('class="journal-trigger"'),
  'Evidence reading should not introduce a scroll bar or add a journal action inside the popup');
assert.ok(stage3SceneSource.includes('snapshot.slip.workerNumber || snapshot.slip.recordedDeathDate') &&
  stage3SceneSource.includes('snapshot.plate.workerNumber || snapshot.plate.inspectionDate'),
  'When real worker IDs or dates exist, render live values rather than conflicting baked-in image text');

assert.ok(!stage3SceneSource.includes('<div class="journal-entries" aria-label'),
  'Stage3 journal must not be nested inside the NPC dialogue box');
assert.ok(stage3SceneSource.includes('scrollIntoView') &&
  stage3SceneSource.includes("import {tick} from 'svelte';"),
  'Opening the separate journal should expose it using page scrolling');
assert.ok(stage3SceneSource.includes('let evidencePage=$state(0)') &&
  stage3SceneSource.includes("inspectedView=which;\n    evidencePage=0;"),
  'Each item inspection must restart its authored local reading sequence');
assert.ok(stage3SceneSource.includes("evidencePage===0") &&
  stage3SceneSource.includes("evidencePage===1") &&
  stage3SceneSource.includes("evidencePage=2;"),
  'Stage3 must show observation, record and contradiction on separate Continue pages');
const firstPart=stage3SceneSource.indexOf("evidencePage===0");
const recordPart=stage3SceneSource.indexOf("evidencePage===1",firstPart);
const findingPart=stage3SceneSource.indexOf("<!-- Part 3:",recordPart);
const firstServerAction=stage3SceneSource.indexOf("perform('show_guther')",firstPart);
assert.ok(firstPart>=0&&recordPart>firstPart&&findingPart>recordPart&&firstServerAction>findingPart,
  'Show Guther action is gated to the final evidence page');
assert.ok(stage3SceneSource.includes('evidencePage=1;') &&
  stage3SceneSource.includes('evidencePage=2;') &&
  !stage3SceneSource.includes("perform('continue_dialogue');}}\n                Continue"),
  'Local evidence page changes must not mutate the server or dialogue revision');
assert.ok(stage3SceneSource.includes('class="environment bench-foreground"') &&
  stage3SceneSource.includes('clip-path:inset(70% 0 0 0)') &&
  !stage3SceneSource.includes('.guther{position:absolute;top:6%;left:11%;height:112%;width:auto;max-width:none;object-fit:contain;clip-path:'),
  'Stage 3 must occlude Guther with the matching foreground workshop table, not cut his apron with a horizontal mask');
assert.ok(stage3SceneSource.includes("background:#49301d") &&
  stage3SceneSource.includes("color:#fff1d7"),
  'Stage3 route labels must remain high contrast on the supplied button art');
for(const component of ['WorkshopScene.svelte','MillhandWorkScene.svelte']){
  const scene=readFileSync(resolve(root,'apps/web/src/lib/'+component),'utf8');
  assert.ok(scene.includes('height:clamp(700px,76vh,810px)') &&
    scene.includes('bench-foreground') &&
    scene.includes('clip-path:inset(70% 0 0 0)'),
    component+' must keep a fixed composition and use the real foreground workbench to occlude Guther');
  assert.ok(scene.includes('max-height:calc(100% - 48px)'),
    component+' must keep abnormally long dialogue from resizing the workshop');
}
// Real tabletop hitboxes must cover the image, not only the text label.
for(const component of ['WorkshopScene.svelte','MillhandWorkScene.svelte']){
  const source=readFileSync(resolve(root,'apps/web/src/lib/'+component),'utf8');
  assert.ok(source.includes('height:37%')&&source.includes('height:44%'),
    component+' must provide large transparent object hit areas, including the hammer');
  assert.ok(source.includes('scale(1.018)')&&source.includes('160ms ease-out'),
    component+' must use a restrained non-layout-shifting hover enlargement');
  assert.ok(!source.includes('<WorkshopObjectIcon')&&!source.includes('class="pin"'),
    component+' tabletop object labels should contain names only, without miniature icons or pins');
  assert.ok(source.includes('aria-label=')&&source.includes('aria-pressed='),
    component+' object interactions must remain keyboard and screen-reader accessible');
}
assert.ok(stage3SceneSource.includes('.evidence button:is(:hover,:focus-visible):not(:disabled) .evidence-art{transform:scale(1.018)}'),
  'Stage3 inspection art must have the same subtle hover response');
const ownerSkin=readFileSync(resolve(root,'apps/web/src/lib/pall-owner-ui.css'),'utf8');
assert.ok(stage3SceneSource.includes('margin:0 0 clamp(89px,10vh,112px)') &&
  stage3SceneSource.includes('margin:0 0 clamp(32px,7vw,54px)'),
  'Stage3 evidence artwork and click targets must sit on the bench at desktop and mobile widths');
assert.ok(ownerSkin.includes('color:#21150e') &&
  ownerSkin.includes('font-weight:600') &&
  ownerSkin.includes('font:600 15px/1.35 var(--pall-font-reading'),
  'CRPG dialogue and choice text must use dark ink and a readable weight with owner typography');
assert.ok(ownerSkin.includes('.choices > button .route') &&
  ownerSkin.includes('color:#fff1d7'),
  'Secondary route plaques must retain their light-on-dark contrast');
console.log('PASS: Stage3 authored evidence pages, high-contrast routes and stable Guther/workbench composition.');

console.log('PASS: Stage3 tabletop evidence and independent journal preserve the compact CRPG dialogue layout.');


// Owner-directed seamless Millhand onboarding: the saved Stage2 return_paper
// action enters Stage3 automatically, and the first speech is Guther's,
// without the old out-of-character chapter/footer card.
const stage1Opening = scenes.Millhand.nodes.opening;
const stage1Doc = readFileSync(resolve(docs,'millhand/opening-dialogue.md'),'utf8');
assert.equal(stage1Opening.speaker,'Guther');
assert.ok(stage1Opening.text.startsWith('Hey, [player name]. I see you standing idle.'),
  'Guther should greet the new Millhand before discussing the work');
assert.ok(stage1Doc.includes('“'+stage1Opening.text+'”'),
  'The owner-approved Guther greeting must match Stage1 source');
assert.ok(workshopUi.includes("beat.text.replaceAll('[player name]', characterName)"),
  'Stage1 greeting must substitute the saved character name');

const workRouteUI=readFileSync(
  resolve(root,'apps/web/src/routes/characters/[id]/millhand/work/+page.svelte'),'utf8');
assert.ok(workRouteUI.includes("if(action==='return_paper' && result.work?.phase==='COMPLETE' && result.stage===3)"),
  'Stage2 must transition only after a successful server-owned return_paper');
assert.ok(workRouteUI.includes("snapshot.stage>=3 && snapshot.work?.phase==='COMPLETE'"),
  'Returning Stage3/4 characters should not be stranded on completed Stage2');
assert.ok(workRouteUI.includes("await goto('/characters/'+encodeURIComponent(character.id)+'/millhand/missing-stamp'"),
  'Stage2 handoff must immediately enter Stage3');
assert.ok(!workRouteUI.includes('class="work-complete"'),
  'Stage2 must not hide the Stage3 transition in a footer link');
assert.ok(!workUi.includes('can now be examined in The Missing Stamp'),
  'Stage2 must not display out-of-character chapter prompts');

const stage3Copy=readFileSync(resolve(root,'apps/web/src/lib/approved-stage-three.ts'),'utf8');
const stage3Canon=readFileSync(resolve(docs,'millhand/stage-3-approved-script.md'),'utf8');
const stage3OpeningLine="All finished, are you? Good. Leave the work paper here. There's a returned plate and a folded slip in with this lot. Have a look at them before I send anything off.";
assert.ok(stage3Copy.includes(stage3OpeningLine));
assert.ok(stage3Canon.includes('**GUTHER:** “'+stage3OpeningLine+'”'),
  'Stage3 transition speech must match approved owner revision');
assert.ok(stage3SceneSource.includes('“{MISSING_STAMP_HANDOFF}”'),
  'After returning the work paper Guther must speak inside the CRPG popup');
console.log('PASS: Seamless Stage2 → Stage3 and owner-directed Guther greeting preserve canonical copy.');
