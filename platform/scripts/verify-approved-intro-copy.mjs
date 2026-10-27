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

