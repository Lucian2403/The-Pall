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
