import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const copy=read('apps/web/src/lib/approved-stage-four.ts');
const depot=read('apps/web/src/lib/MillhandDepotScene.svelte');
const contracts=read('apps/web/src/lib/MillhandContractsScene.svelte');
const records=read('apps/web/src/lib/MillhandRecordsScene.svelte');
const stage3=read('apps/web/src/lib/MillhandMissingStampScene.svelte');
const label=read('apps/web/src/lib/workshop-object-labels.css');
const core=read('packages/game-core/src/millhand-second-job.ts');
const canon=read('../docs/05-gameplay/onboarding/millhand/second-task-branches.md');
const script=read('../docs/05-gameplay/onboarding/millhand/stage-4-approved-script.md');

for(const [scene,items] of [
  [depot,['Numbered plates','Council work paper']],
  [contracts,['Death register','Wage record']],
  [records,['Death register','Wage record']]
]){
  assert.ok(scene.includes("import '$lib/workshop-object-labels.css'"),
    'Every Stage 4 tabletop scene must import the same owner frame.');
  assert.equal((scene.match(/class="workshop-object-label"/g)??[]).length,2,
    'Both tabletop items must have the shared framed label, no more or less.');
  for(const item of items){
    assert.ok(scene.includes('<span class="workshop-object-label">'+item+'</span>'),
      'Missing Stage 4 framed label: '+item);
  }
  assert.ok(!scene.includes('.table-prop span{')&&!scene.includes('.record-prop span{'),
    'Legacy unframed black rectangular caption CSS must not override owner art.');
  assert.ok(scene.includes('aria-pressed=')&&scene.includes('onclick={() => inspect('),
    'Preserve full-art hitboxes and accessible selected state.');
}
assert.ok(label.includes('.workshop-object-label{') &&
  label.includes("border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png')") &&
  label.includes('border-image-slice:145 190 125 190 fill') &&
  label.includes('.record-prop') &&
  label.includes('.table-prop'),
  'Stage 1–4 labels must use the single owner-provided nine-slice frame.');
assert.ok(stage3.includes('height:clamp(108px,8vw,140px)') &&
  stage3.includes('.evidence-art{height:clamp(88px,24vw,138px)}') &&
  stage3.includes('<span class="workshop-object-label">Returned plate</span>') &&
  stage3.includes('<span class="workshop-object-label">Cancellation slip</span>'),
  'Stage 3 evidence must be enlarged and retain the same label art.');

assert.ok(core.includes("transport: 'secured'|'smaller_loads'|null") &&
  core.includes("case 'secure_plates':transport='secured';phase='COMPARE_DELIVERY';break;") &&
  core.includes("case 'carry_smaller_loads':transport='smaller_loads';phase='COMPARE_DELIVERY';break;") &&
  core.includes("case 'compare_delivery_list':phase='SPEAK_DEPOT';break;"),
  'Keep the original persisted choice and identical mandatory evidence path.');
assert.ok(copy.includes('export const STAGE_FOUR_TRANSPORT_PRESENTATION=') &&
  copy.includes("as const satisfies Record<NonNullable<SecondJobState['transport']>") &&
  copy.includes("tradeoff:'Fewer trips. A heavier load that must be kept steady.'") &&
  copy.includes("tradeoff:'More trips. Less weight to manage each time.'") &&
  copy.includes('Before the clerk takes it, you check that the plates have remained properly aligned.') &&
  copy.includes('You count the plates again to make sure the entire lot has arrived.'),
  'The two handling methods must have different visible trade-offs and depot checks.');
assert.ok(depot.includes('STAGE_FOUR_TRANSPORT_PRESENTATION,') &&
  depot.includes('const transportCheck=$derived(state.transport') &&
  depot.includes('STAGE_FOUR_TRANSPORT_PRESENTATION[state.transport].depotCheck') &&
  depot.includes("state.phase==='COMPARE_DELIVERY' && transportCheck") &&
  depot.includes('<p class="transport-check">{transportCheck}</p>') &&
  depot.includes("state.phase==='CHOOSE_TRANSPORT'") &&
  depot.includes('class:handling-choice=') &&
  depot.includes('STAGE_FOUR_TRANSPORT_PRESENTATION.secured.tradeoff') &&
  depot.includes('STAGE_FOUR_TRANSPORT_PRESENTATION.smaller_loads.tradeoff'),
  'Use saved transport to show both choice hints and the correct depot inspection.');
assert.ok(copy.includes("if(s.transport==='secured')result.push('I secured the plates together") &&
  copy.includes("if(s.transport==='smaller_loads')result.push('I carried the plates in smaller groups") &&
  depot.includes('secondJobJournal(state)') &&
  depot.includes('snapshot.availableActions') &&
  depot.includes('void perform(action)'),
  'Branch-specific first-person journal lines must retain the server-backed action flow.');
assert.ok(canon.includes('less handling, risk of misalignment/damage') &&
  script.includes('Both choices complete the move to the municipal depot.') &&
  script.includes('no numbers, random outcome or guaranteed damage'),
  'Risk/duration are an approved future contract, not fabricated mechanics now.');
assert.ok(!copy.includes('transportSeconds')&&!copy.includes('damageChance') &&
  !depot.includes('Math.random')&&!depot.includes('fatigueCost') &&
  !core.includes('transportDurationSeconds'),
  'Do not invent duration, damage, fatigue, rewards or chance formulas in the tutorial.');

console.log('PASS: all Stage 1–4 tabletop frames, larger Stage 3 evidence, saved transport choice, distinct depot checks and journals, untouched gameplay.');
