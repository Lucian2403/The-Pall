/**
 * Scholarship artwork is installed locally from the owner's uploaded panorama.
 * Both book cutouts are reused from the previously installed Commerce pack;
 * do not require another copy of either source or fabricate other document art.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const paths=[
  'apps/web/static/locations/records/records-room.webp',
  'apps/web/static/locations/contracts/death-register.webp',
  'apps/web/static/locations/contracts/wage-record.webp'
];
let missing=false;
for(const p of paths){
  const file=resolve(root,p);
  if(!existsSync(file)){
    console.error('Missing Scholarship scene image: '+p);
    missing=true;
    continue;
  }
  const bytes=readFileSync(file);
  assert.ok(statSync(file).size>50000,'Truncated scene image: '+p);
  assert.equal(bytes.toString('ascii',0,4),'RIFF','Not a RIFF image: '+p);
  assert.equal(bytes.toString('ascii',8,12),'WEBP','Not a WebP image: '+p);
}
const s=readFileSync(resolve(root,'apps/web/src/lib/MillhandRecordsScene.svelte'),'utf8');
const wrapper=readFileSync(resolve(root,'apps/web/src/lib/MillhandSecondJobScene.svelte'),'utf8');
assert.ok(s.includes("url('/locations/records/records-room.webp')"),
  'The owner scholarship room background must be used');
for(const name of ['death-register.webp','wage-record.webp']){
  assert.ok(s.includes('/locations/contracts/'+name),'Expected existing book prop: '+name);
}
assert.ok(wrapper.includes("state.branch==='records'") &&
  wrapper.includes('<MillhandRecordsScene {snapshot} {pending} {errorMessage} {perform}/>'),
  'Scholarship must display its own fully playable records-room scene');
for(const [phase,which,action] of [
  ['READ_DEATH_REGISTER','death','read_death_register'],
  ['READ_WAGE_RECORD','wage','check_wage_record'],
  ['EXAMINE_SCRAPED_ENTRY','wage','examine_scraped_entry']
]){
  assert.ok(s.includes("state.phase==='"+phase+"'") &&
    s.includes("which==='"+which+"' && snapshot.availableActions.includes('"+action+"')") &&
    s.includes("void perform('"+action+"')"),
    'Each approved inspection must require a separate correct book click: '+phase);
}
assert.ok(s.includes("if(pending)return") &&
  s.includes('inspectionNote=') &&
  s.includes('Select the relevant book on the counter to examine it.'),
  'Wrong inspection choices should give feedback without server progress');
assert.ok(s.includes('{#if readingPhase}') &&
  s.includes('{:else if snapshot.availableActions.length>0}'),
  'Do not duplicate physical inspection actions as dialogue buttons');
assert.ok(s.includes('STAGE_FOUR_DIALOGUE.records') &&
  s.includes('secondJobJournal(state)') &&
  s.includes('STAGE_FOUR_FINAL.records') &&
  s.includes('snapshot.availableActions'),
  'Owner-approved dialogue, alternate-source choices and journal must remain intact');
assert.ok(s.includes('scale(1.018)'),'Object hover should remain minimal');
assert.ok(!s.includes('class="work-surface"')&&!s.includes('class="symbol"'),
  'No schematic placeholders may appear in the records room');
if(missing){
  console.error('Extract The_Pall_Stage4_Scholarship_Asset_Patch.zip into The-Pall\\platform.');
  console.error('Death Register and Wage Record come from the already installed Commerce asset pack.');
  process.exitCode=1;
}else{
  console.log('PASS: Owner Scholarship background, two book props and saved inspection sequence.');
}
