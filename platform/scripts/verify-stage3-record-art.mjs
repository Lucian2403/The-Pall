/**
 * Owner-supplied Stage 3 record illustrations, extracted locally from
 * The_Pall_Stage3_Record_Art_Patch.zip. Never trust ZIP names alone.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const scene=readFileSync(resolve(root,'apps/web/src/lib/MillhandMissingStampScene.svelte'),'utf8');
// The component is Prettier-formatted; compare its CSS/markup without whitespace.
const flat=scene.replace(/\s+/g,'');
const files=['cancellation-slip-record.webp','returned-reference-plate-record.webp'];
let missing=false;
for(const name of files){
  const full=resolve(root,'apps/web/static/workshop',name);
  assert.ok(scene.includes('/workshop/'+name),'Missing Stage3 in-dialogue image reference: '+name);
  if(!existsSync(full)){
    console.error('Missing owner artwork: '+full);
    missing=true;
    continue;
  }
  const bytes=readFileSync(full);
  assert.ok(statSync(full).size>50000,'Empty or truncated Stage3 record image: '+name);
  assert.equal(bytes.toString('ascii',0,4),'RIFF','Not a WebP: '+name);
  assert.equal(bytes.toString('ascii',8,12),'WEBP','Invalid WebP header: '+name);
}
assert.ok(flat.includes('evidencePage===1') &&
  scene.includes('class="record-illustration"') &&
  flat.includes('max-height:240px'),
  'Owner record images must appear only in the compact second inspection page');
// Shared scene layout: the dialogue is a content-height reading column beside
// the workbench, and the journal stays outside the scene in page flow.
assert.ok(flat.replace(/;\}/g,'}').includes('.dialogue.record-view{max-height:none;overflow:visible}') &&
  flat.includes('max-height:none;overflow:visible;') &&
  !flat.includes('overflow-y:auto') &&
  scene.includes('<ActivityLayout mode="scene" stageAspect={2}') &&
  scene.indexOf('id="stage-three-journal"')>scene.indexOf('</ActivityLayout>'),
  'All Stage3 dialogue beats must be scrollbar-free; the journal remains outside the scene');
const stageStart=scene.indexOf('{#snippet stage()}'),stageEnd=scene.indexOf('{/snippet}',stageStart);
assert.ok(flat.includes('.evidence{position:absolute;z-index:4;left:24%;bottom:3%;width:52%;') &&
  scene.indexOf('class="evidence"')>stageStart && scene.indexOf('class="evidence"')<stageEnd &&
  flat.includes('height:clamp(64px,13cqi,180px)') &&
  flat.includes('decisionStep=1') &&
  scene.includes('class:route-choice='),
  'Evidence props must remain on the painted table and the three-route choice must have a compact separate beat');
assert.ok(scene.includes('snapshot.slip.workerNumber || snapshot.slip.recordedDeathDate') &&
  scene.includes('snapshot.plate.workerNumber || snapshot.plate.inspectionDate'),
  'If real numbers or dates are authored, use live data instead of stale printed placeholders');
if(missing){
  console.error('Extract The_Pall_Stage3_Record_Art_Patch.zip into your platform directory.');
  process.exitCode=1;
}else{
  console.log('PASS: Both supplied Stage3 record illustrations installed and wired into compact dialogue.');
}
