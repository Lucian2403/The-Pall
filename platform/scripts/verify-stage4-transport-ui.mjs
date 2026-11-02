import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),read=p=>readFileSync(resolve(root,p),'utf8');
const labels=read('apps/web/src/lib/workshop-object-labels.css');
for(const name of ['MillhandDepotScene.svelte','MillhandContractsScene.svelte','MillhandRecordsScene.svelte']){
 const s=read('apps/web/src/lib/'+name);
 assert.match(s,/workshop-object-labels\.css/);
 assert.equal((s.match(/class="workshop-object-label"/g)||[]).length,2,name);
 assert.match(s,/aria-pressed=/);
}
assert.match(labels,/\.table-prop/);
assert.match(labels,/\.record-prop/);
const copy=read('apps/web/src/lib/approved-stage-four.ts');
const scene=read('apps/web/src/lib/MillhandDepotScene.svelte');
const core=read('packages/game-core/src/millhand-second-job.ts');
for(const term of ['STAGE_FOUR_TRANSPORT_HINTS','STAGE_FOUR_TRANSPORT_VERIFICATION','Fewer trips. A heavier load','More trips. Less weight','plates have remained properly aligned','count the plates again','I secured the plates together and carried them to the depot as one load','I carried the plates in smaller groups']){
 assert.ok(copy.includes(term),'Missing '+term);
}
assert.match(scene,/STAGE_FOUR_TRANSPORT_HINTS\[action\]/);
assert.match(scene,/STAGE_FOUR_TRANSPORT_VERIFICATION\[state\.transport\]/);
assert.match(scene,/Continue to the depot/);
assert.match(scene,/travelConfirmed/);
assert.match(scene,/secondJobJournal\(state\)/);
assert.match(core,/case 'secure_plates':transport='secured';phase='COMPARE_DELIVERY'/);
assert.match(core,/case 'carry_smaller_loads':transport='smaller_loads';phase='COMPARE_DELIVERY'/);
assert.doesNotMatch(scene,/Math\.random|damageChance|fatigueCost/);
console.log('PASS: Stage4 labels and persisted transport differences remain intact.');
