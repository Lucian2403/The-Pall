/** Reject a playable Stage 3 build without the author's actual image and bell audio.
 * Never substitute stock assets, remote images or generated placeholders.
 */
import {readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';

const assets=[
  {name:'Industrial Courtyard',path:'apps/web/static/locations/industrial/industrial-courtyard.webp',kind:'webp'},
  {name:'Night shift bell',path:'apps/web/static/audio/bellrunner/night-shift-bell.mp3',kind:'mp3'}
];
let failures=0;
for(const asset of assets){
  const absolute=resolve(import.meta.dirname,'..',asset.path);
  try{
    const size=statSync(absolute).size;
    const header=readFileSync(absolute).subarray(0,16);
    const valid=asset.kind==='webp'
      ?header.toString('ascii',0,4)==='RIFF'&&header.toString('ascii',8,12)==='WEBP'
      :header.toString('ascii',0,3)==='ID3'||(header[0]===0xff&&(header[1]&0xe0)===0xe0);
    if(!valid||size<1024)throw Error('invalid or empty '+asset.kind+' file');
    console.log('PASS: '+asset.name+' ('+size+' bytes)');
  }catch(error){
    failures++;
    console.error('MISSING/INVALID: '+asset.path+' — '+String(error.message));
  }
}
if(failures){
  console.error('Install the original owner-supplied Stage 3 asset ZIP into the repository root.');
  process.exitCode=1;
}
