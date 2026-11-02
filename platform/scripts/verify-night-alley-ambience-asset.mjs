import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';

const filename='apps/web/static/audio/the-pall/night-alley-ambience.mp3';
const file=resolve(import.meta.dirname,'..',filename);
assert.ok(existsSync(file),'Night Alley ambience MP3 must be committed to the Flint scene.');
const bytes=readFileSync(file);
assert.equal(bytes.length,1895769,'Unexpected Night Alley MP3 byte length.');
assert.equal(createHash('sha256').update(bytes).digest('hex'),
  '7b1d1f07962cdb1d1adedb5ad0f73ab3ae4ce1ff9d0817f1f60b3b0fec8485f0',
  'Night Alley ambience must match the owner WAV transcoded to browser MP3.');
assert.ok(bytes.toString('ascii',0,3)==='ID3'||bytes[0]===0xff,'Invalid MP3 header.');
console.log('PASS: Original NightAlley ambience transferred intact (48 kHz stereo, 96 kb/s, 157.92 s).');
