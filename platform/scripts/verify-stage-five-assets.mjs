import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../apps/web/static');
const assets=[
  ['locations/alley/alley-background.webp',292288,'862be6117069e7fb4541d77874bbaebc13ccfce47cd4144da9a114e9e7964390'],
  ['characters/flint/flint-standing.webp',296116,'5c3464a707773d04f1ed1bb46b227ce4f187016d7c2194cc21c8be0e35f866e0'],
  ['characters/flint/flint-defeated.webp',316884,'43102832ef36696e337d1f03645244ac3f28a0adf524b44096bf13791410fb59']
];
for(const [path,size,digest] of assets){
  const full=resolve(root,path);
  assert.ok(existsSync(full),'Missing '+path+'. Extract The_Pall_Millhand_Stage5_Assets.zip into The-Pall repository root, commit its three WebP assets.');
  const buffer=readFileSync(full);
  assert.equal(buffer.length,size,'Unexpected size '+path);
  assert.equal(createHash('sha256').update(buffer).digest('hex'),digest,
    'Incorrect or altered owner-provided asset '+path);
  assert.equal(buffer.subarray(0,4).toString('ascii'),'RIFF','Invalid WebP '+path);
}
console.log('PASS: approved Alley Background and two cleaned Flint cutouts installed correctly.');
