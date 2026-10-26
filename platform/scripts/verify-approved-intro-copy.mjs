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
