import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {
  STITCHER_WARD_ITEMS,stitcherItemActions,stitcherWardSuppliesVisible
} from '../apps/web/src/lib/stitcher-ward-items.ts';
import {stitcherSceneEnvironment} from '../apps/web/src/lib/stitcher-scene-environment.ts';

const allowed=['prep_cut','prep_ready','trim_end','discard_end','record_linen'];
const itemsFor=(phase:string)=>stitcherItemActions(2,phase,allowed);
const source=(relative:string)=>readFileSync(
  fileURLToPath(new URL(relative,import.meta.url)),'utf8');

test('the same four named owner assets remain visible at every ward step in Stages I–III',()=>{
  assert.deepEqual(STITCHER_WARD_ITEMS.map(({key,label})=>[key,label]),[
    ['shears','Linen Shears'],['basin','Wash Basin'],
    ['dressings','Clean Dressings'],['register','Ward Register']
  ]);
  assert.equal(new Set(STITCHER_WARD_ITEMS.map(x=>x.key)).size,4);
  for(const stage of [1,2,3]){
    for(const phase of ['intro','briefing','inspect','order','prepare','care','linen_check',
      'linen_fix','verify','record','report','close','discovery','claudia','choose']){
      // Visibility depends on the scene, NOT on phase, permitted actions,
      // or whether Claudia's optional dialogue is open.
      assert.equal(stitcherWardSuppliesVisible(stage,
        stitcherSceneEnvironment(stage,null)),true,stage+' '+phase);
    }
  }
});

test('ward supplies are hidden outside the Clinic or after Stage III',()=>{
  for(const stage of [0,4,5,6]){
    assert.equal(stitcherWardSuppliesVisible(stage,'ward'),false);
  }
  for(const environment of ['corridor','records']){
    for(const stage of [1,2,3]){
      assert.equal(stitcherWardSuppliesVisible(stage,environment),false);
    }
  }
  assert.equal(stitcherWardSuppliesVisible(4,stitcherSceneEnvironment(4,'consent')),false);
});

test('phase-specific tool actions are unchanged and require API permission',()=>{
  assert.deepEqual(itemsFor('prepare'),[
    {key:'shears',action:'prep_cut'},{key:'dressings',action:'prep_ready'}
  ]);
  assert.deepEqual(itemsFor('linen_fix'),[
    {key:'shears',action:'trim_end'},{key:'dressings',action:'discard_end'}
  ]);
  assert.deepEqual(itemsFor('record'),[{key:'register',action:'record_linen'}]);
  assert.deepEqual(stitcherItemActions(1,'prepare',allowed),[]);
  assert.deepEqual(stitcherItemActions(3,'record',allowed),[]);
  assert.deepEqual(stitcherItemActions(2,'report',allowed),[]);
  assert.deepEqual(stitcherItemActions(2,'prepare',['prep_ready']),[
    {key:'dressings',action:'prep_ready'}
  ]);
  assert.deepEqual(stitcherItemActions(2,'linen_fix',[]),[]);
  assert.equal(itemsFor('prepare').some(x=>x.key==='basin'),false);
});

test('all four prop images are real bundled WebP files',()=>{
  for(const item of STITCHER_WARD_ITEMS){
    const bytes=readFileSync(fileURLToPath(
      new URL('../apps/web/static'+item.image,import.meta.url)));
    assert.equal(bytes.toString('ascii',0,4),'RIFF',item.image);
    assert.equal(bytes.toString('ascii',8,12),'WEBP',item.image);
  }
});

test('Stitcher reuses Bellrunner four-card Inspect affordances beneath dialogue',()=>{
  const scene=source('../apps/web/src/lib/StitcherWardScene.svelte');
  const tray=source('../apps/web/src/lib/StitcherWardItemTray.svelte');
  const bell=source('../apps/web/src/lib/BellrunnerDocumentTray.svelte');
  assert.ok(scene.indexOf('{#snippet supplement()}')>scene.indexOf('{#snippet panel()}'));
  assert.match(scene,/\{#snippet supplement\(\)\}[\s\S]*?\{#if showWardSupplies\}/);
  assert.match(scene,/<StitcherWardItemTray items=\{STITCHER_WARD_ITEMS\}/);
  assert.doesNotMatch(scene,/\{#if itemChoices\.length&&!claudiaTalkOpen\}/);
  assert.match(scene,/showWardSupplies=\$derived\(stitcherWardSuppliesVisible/);
  assert.match(scene,/const action=itemChoices\.find\(item=>item\.key===key\)\?\.action/);
  assert.match(scene,/if\(action&&!claudiaTalkOpen\)/);
  assert.match(scene,/inspectedItem=selectedWardItem\?\.key===key\?null/);
  assert.match(scene,/ward-inspection/);
  assert.match(scene,/Use the indicated item\./);
  assert.match(scene,/!itemChoices\.some\(item=>item\.action===action\)/);
  for(const token of ['round-documents','documents-title','document-grid','document-card',
    'document-image','workshop-object-label document-label','document-action']){
    assert.ok(tray.includes(token),'Missing Bellrunner card structure: '+token);
    assert.ok(bell.includes(token),'Missing Bellrunner reference: '+token);
  }
  assert.match(tray,/<div class="document-grid">/);
  assert.match(tray,/\{#each items as item \(item\.key\)\}/);
  assert.match(tray,/aria-label=\{'Inspect '\+item\.label\}/);
  assert.match(tray,/\bInspect\s*<\/span>/);
  assert.doesNotMatch(tray,/\bUse\s*<\/span>/);
  assert.match(tray,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(tray,/@container round-documents \(max-width:540px\)/);
  assert.match(tray,/@container round-documents \(max-width:400px\)/);
  assert.match(tray, /@container round-documents \(max-width:540px\)\{[\s\S]*?\.document-card\{padding:4px\}/);
  assert.match(tray, /@container round-documents \(max-width:400px\)\{[\s\S]*?grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(tray,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
