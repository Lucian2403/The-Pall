/**
 * Verifies the owner's exact three Commerce scene image assets after extraction.
 * Assets are bundled separately to preserve owner-provided art without placing
 * large binary files or fonts into GitHub's text-only source workflow.
 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const files=[
  'contracts-office.webp',
  'death-register.webp',
  'wage-record.webp'
];
let missing=false;
for(const name of files){
  const file=resolve(root,'apps/web/static/locations/contracts',name);
  if(!existsSync(file)){
    console.error('Commerce artwork missing: '+file);
    missing=true;
    continue;
  }
  const bytes=readFileSync(file);
  assert.ok(statSync(file).size>50000,'Empty/incomplete Commerce asset: '+name);
  assert.equal(bytes.toString('ascii',0,4),'RIFF','Expected RIFF/WebP: '+name);
  assert.equal(bytes.toString('ascii',8,12),'WEBP','Invalid WebP: '+name);
}
const scene=readFileSync(resolve(root,'apps/web/src/lib/MillhandContractsScene.svelte'),'utf8');
const route=readFileSync(resolve(root,'apps/web/src/lib/MillhandSecondJobScene.svelte'),'utf8');
for(const name of files) assert.ok(scene.includes('/locations/contracts/'+name),
  'Commerce scene does not reference '+name);
assert.ok(scene.includes("onclick={() => inspect('death')}")&&
  scene.includes("onclick={() => inspect('wage')}"),
  'Both owner register images must be directly clickable');
assert.ok(scene.includes("state.phase==='EXAMINE_PAPER'") &&
  scene.includes("which==='death' && snapshot.availableActions.includes('examine_work_paper')") &&
  scene.includes("void perform('examine_work_paper')"),
  'First evidence step must be completed by choosing the Death Register itself');
assert.ok(scene.includes("state.phase==='COMPARE_RECORDS'") &&
  scene.includes("which==='wage' && snapshot.availableActions.includes('compare_official_records')") &&
  scene.includes("void perform('compare_official_records')"),
  'Second evidence step must require a separate click on the Wage Record');
assert.ok(scene.includes("state.phase==='EXAMINE_PAPER'||state.phase==='COMPARE_RECORDS'") &&
  scene.includes('Select a book on the counter to examine it.') &&
  scene.includes("{:else if snapshot.availableActions.length>0}"),
  'Do not expose dialogue action buttons for either record-inspection step');
assert.ok(scene.includes("if(pending)return") &&
  scene.includes("inspectionNote='This is the later record.") &&
  scene.includes("inspectionNote='You have already examined this book."),
  'Wrong or repeated book clicks must give feedback without committing server actions');
assert.ok(scene.includes('scale(1.018)'),'Commerce books should share the subtle hover effect');
assert.ok(!scene.includes('/workshop/council-work.webp') &&
  !scene.includes('class="work-surface"') &&
  !scene.includes('class="symbol"'),
  'Do not display third-party, recycled, or schematic physical props in Contracts');
assert.ok(route.includes("state.branch==='contracts'")&&
  route.includes('<MillhandContractsScene {snapshot} {pending} {errorMessage} {perform}/>'),
  'Contracts must render its own approved office scene');
assert.ok(scene.includes('STAGE_FOUR_DIALOGUE.contracts') &&
  scene.includes('snapshot.availableActions') &&
  scene.includes('secondJobJournal(state)'),
  'The saved Contracts dialogue, choices and journal must remain intact');
if(missing){
  console.error('Extract The_Pall_Stage4_Commerce_Asset_Patch.zip from the platform directory.');
  process.exitCode=1;
}else{
  console.log('PASS: Commerce uses two physical book choices, correct ordering and no evidence-action buttons.');
}
