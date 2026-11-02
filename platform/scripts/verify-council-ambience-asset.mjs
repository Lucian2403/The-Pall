import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';

const file=resolve(import.meta.dirname,'../apps/web/static/audio/the-pall/contracts-scholarship-ambience.mp3');
assert.ok(existsSync(file),
  'Missing Contracts/Scholarship recording. Extract ThePall_Contracts_Scholarship_Ambience_Asset.zip into repository root and commit platform/apps/web/static/audio/the-pall/contracts-scholarship-ambience.mp3.');
const bytes=readFileSync(file);
assert.equal(bytes.length,1772972,'Council ambience browser MP3 size changed');
assert.equal(createHash('sha256').update(bytes).digest('hex'),
  '14c45b7fe9f054023d57d304488b113845898fe55166a3adcd504d3761d16437',
  'Council ambience MP3 does not match the owner recording');
assert.ok(bytes.toString('ascii',0,3)==='ID3'||bytes[0]===0xff,'Invalid MP3 header');
console.log('PASS: owner Contracts/Scholarship ambience asset installed correctly.');
