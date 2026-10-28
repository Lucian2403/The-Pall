import {strict as assert} from 'node:assert';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../apps/web/static/ui-kit/avatars');
let missing=0;
for(const sex of ['male','female'])for(let n=1;n<=8;n++){
 const name=sex+'-'+String(n).padStart(2,'0')+'.webp';
 const path=resolve(root,name);
 if(!existsSync(path)){console.error('Missing owner avatar:',name);missing++;continue;}
 const bytes=readFileSync(path);
 assert.ok(statSync(path).size>10000,'Incomplete avatar '+name);
 assert.equal(bytes.toString('ascii',0,4),'RIFF','Invalid avatar: '+name);
 assert.equal(bytes.toString('ascii',8,12),'WEBP','Invalid avatar: '+name);
}
if(missing){
 console.error('Extract The_Pall_Avatars_16_Patch.zip from the The-Pall/platform directory.');
 process.exitCode=1;
}else console.log('PASS: 8 male and 8 female owner avatars installed in universal portrait library.');
