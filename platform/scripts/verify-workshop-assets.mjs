// One-time verification after installing the owner's static workshop art.
// Read-only; never downloads or regenerates any asset.
import {readFileSync, statSync} from 'node:fs';
import {resolve} from 'node:path';
import {strict as assert} from 'node:assert';
const root = resolve(import.meta.dirname, '../apps/web/static/workshop');
const required = ['environment.webp','guther-front.webp','guther-back.webp','number-stamps.webp','metal-plates.webp','council-work.webp','hammer.webp'];
try {
  for (const name of required) {
    const filepath = resolve(root, name);
    const stat = statSync(filepath);
    assert.ok(stat.size > 1000, `${name} has no valid image data`);
    const bytes = readFileSync(filepath);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `${name} is not RIFF/WebP`);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `${name} is not WebP`);
    console.log(`PASS: ${name}`);
  }
  console.log('Workshop static images installed. No hover/alternate-art assets required.');
} catch (err) {
  console.error('Workshop art not yet installed:', err instanceof Error ? err.message : String(err));
  console.error('Extract the supplied browser-sized workshop ZIP into apps/web/static so its workshop/ folder contains all seven .webp files.');
  process.exitCode = 1;
}
