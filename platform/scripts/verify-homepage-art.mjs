// Owner-supplied public landing-page art. This command validates the local
// companion ZIP installation without requiring or redistributing proprietary
// images through the source-code repository.
import {strict as assert} from 'node:assert';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../apps/web/static');
const assets=[
  ['locations/homepage/pall-zone.webp','The Pall zone image for No fixed classes'],
  ['locations/homepage/crafting-items.webp','Crafting components for Every material has a purpose'],
  ['locations/homepage/grey-marches.webp','Grey Marches image for Beyond the city'],
  ['locations/records/records-room.webp','Approved records room for Stories & Choices'],
  ['workshop/environment.webp','Approved workshop for Crafting'],
  ['ui-kit/resources/TheCityVista.png','Approved skyline for Hero and Grand Cylinder City']
];
let errors=0;
for(const [relative,label] of assets){
  const path=resolve(root,relative);
  if(!existsSync(path)){console.error('MISSING: '+relative+' — '+label);errors++;continue;}
  const bytes=readFileSync(path);
  try{
    assert.ok(statSync(path).size>1000,'Asset is empty or incomplete');
    if(relative.endsWith('.webp')){
      assert.equal(bytes.toString('ascii',0,4),'RIFF');
      assert.equal(bytes.toString('ascii',8,12),'WEBP');
    }else assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');
    console.log('PASS: '+relative);
  }catch(e){console.error('INVALID: '+relative+' — '+String(e));errors++;}
}
if(errors){
  console.error('Install The_Pall_Homepage_Landscape_Assets_Patch.zip into The-Pall/platform, preserving apps/web/static/locations/homepage/.');
  process.exitCode=1;
}else console.log('PASS: All six homepage illustrations available locally.');
