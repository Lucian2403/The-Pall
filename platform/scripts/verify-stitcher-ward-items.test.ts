import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {stitcherItemActions} from '../apps/web/src/lib/stitcher-ward-items.ts';

const all=['prep_cut','prep_ready','trim_end','discard_end','record_linen'];
const items=(phase:string)=>stitcherItemActions(2,phase,all);
const source=(relative:string)=>readFileSync(
  fileURLToPath(new URL(relative,import.meta.url)),'utf8');

test('Stage II item cards match the correct owner prop and show its name',()=>{
  assert.deepEqual(items('prepare').map(({action,image,label})=>[action,image,label]),[
    ['prep_cut','/locations/stitcher/linen-shears.webp','Linen Shears'],
    ['prep_ready','/locations/stitcher/clean-dressings.webp','Clean Dressings']]);
  assert.deepEqual(items('linen_fix').map(({action,image,label})=>[action,image,label]),[
    ['trim_end','/locations/stitcher/linen-shears.webp','Linen Shears'],
    ['discard_end','/locations/stitcher/clean-dressings.webp','Clean Dressings']]);
  assert.deepEqual(items('record').map(({action,image,label})=>[action,image,label]),[
    ['record_linen','/locations/stitcher/ward-register.webp','Ward Register']]);
});

test('permission filtering and stage boundaries preserve the saved gameplay logic',()=>{
  assert.deepEqual(stitcherItemActions(1,'prepare',all),[]);
  assert.deepEqual(stitcherItemActions(3,'record',all),[]);
  assert.deepEqual(stitcherItemActions(2,'report',all),[]);
  assert.deepEqual(stitcherItemActions(2,'prepare',['prep_ready']),[
    {action:'prep_ready',image:'/locations/stitcher/clean-dressings.webp',label:'Clean Dressings'}]);
  assert.deepEqual(stitcherItemActions(2,'linen_fix',[]),[]);
});

test('each card points to an actual WebP asset in the ward static directory',()=>{
  for(const item of [...items('prepare'),...items('linen_fix'),...items('record')]){
    const bytes=readFileSync(fileURLToPath(
      new URL('../apps/web/static'+item.image,import.meta.url)));
    assert.equal(bytes.toString('ascii',0,4),'RIFF',item.image);
    assert.equal(bytes.toString('ascii',8,12),'WEBP',item.image);
  }
});

test('Stitcher inherits Bellrunner framed-card pattern beneath dialogue',()=>{
  const scene=source('../apps/web/src/lib/StitcherWardScene.svelte');
  const tray=source('../apps/web/src/lib/StitcherWardItemTray.svelte');
  const bell=source('../apps/web/src/lib/BellrunnerDocumentTray.svelte');
  assert.ok(scene.indexOf('{#snippet supplement()}')>scene.indexOf('{#snippet panel()}'));
  assert.match(scene,/\{#snippet supplement\(\)\}[\s\S]*?<StitcherWardItemTray/);
  assert.doesNotMatch(scene,/stitcher-item-tray|stitcher-item-button|stitcher-reading-column/);
  assert.match(scene,/Use the indicated item\./);
  assert.match(scene,/!itemChoices\.some\(item=>item\.action===action\)/);
  for(const token of ['round-documents','documents-title','document-grid','document-card',
    'document-image','workshop-object-label document-label','document-action']){
    assert.ok(tray.includes(token),'Missing Bellrunner card structure: '+token);
    assert.ok(bell.includes(token),'Missing reference: '+token);
  }
  for(const token of ['border:1px solid #674731','border-image','document-label',
    'background:linear-gradient(180deg,#201a16 0%,#110f0d 100%)']){
    if(token==='border-image')assert.ok(tray.includes('workshop-object-label document-label'));
    else assert.ok(tray.includes(token),'Missing Bellrunner material: '+token);
  }
  assert.match(tray,/Ward Supplies/);
  assert.match(tray,/class:single=\{items\.length===1\}/);
  assert.match(tray,/onclick=\{\(\)=>onChoose\(item\.action\)\}/);
  assert.match(tray,/aria-label=\{STITCHER_ACTION_LABEL\[item\.action\]/);
  assert.match(tray,/\bUse\s*<\/span>/);
  assert.match(tray,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
