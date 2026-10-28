import {readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {strict as assert} from 'node:assert';

const path=resolve(import.meta.dirname,
  '../apps/web/static/locations/depot/depot-background.webp');
try {
  const bytes=readFileSync(path);
  assert.ok(statSync(path).size>50000,'Depot background appears incomplete');
  assert.equal(bytes.toString('ascii',0,4),'RIFF','Expected RIFF/WebP');
  assert.equal(bytes.toString('ascii',8,12),'WEBP','Expected WebP artwork');
  console.log('PASS: Original owner depot artwork installed for Millhand Stage 4.');
}catch(error){
  console.error('Depot artwork not installed at:',path);
  console.error('Extract The_Pall_Stage4_Depot_Asset_Patch.zip into The-Pall\\platform (not into apps/web).');
  console.error(error instanceof Error?error.message:String(error));
  process.exitCode=1;
}
