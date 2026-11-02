import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';

const file=resolve(import.meta.dirname,'../apps/web/static/audio/the-pall/depot-ambience.mp3');
assert.ok(existsSync(file),'Owner Depot ambience MP3 is not yet committed.');
const bytes=readFileSync(file);
assert.equal(bytes.length,2261529,'Depot ambience MP3 size changed.');
assert.equal(createHash('sha256').update(bytes).digest('hex'),
  '14dda4b9d8272a7cf4d1ac01be5a8806786655b7cb82d8e3d438824e13bc3e11',
  'Depot recording must match owner WAV converted at 96kbps stereo with a 2s end fade.');
assert.ok(bytes.toString('ascii',0,3)==='ID3'||bytes[0]===0xff,'Invalid MP3 header.');
console.log('PASS: original owner Depot ambience converted, 188.4s, 48 kHz stereo.');
