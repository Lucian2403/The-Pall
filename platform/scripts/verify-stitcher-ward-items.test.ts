import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {stitcherItemActions} from '../apps/web/src/lib/stitcher-ward-items.ts';

const all=['prep_cut','prep_ready','trim_end','discard_end','record_linen'];
const items=(phase:string)=>stitcherItemActions(2,phase,all);

test('Stitcher Stage II maps each approved choice to the correct owner prop',()=>{
  assert.deepEqual(items('prepare').map(x=>[x.action,x.image]),[
    ['prep_cut','/locations/stitcher/linen-shears.webp'],
    ['prep_ready','/locations/stitcher/clean-dressings.webp']]);
  assert.deepEqual(items('linen_fix').map(x=>[x.action,x.image]),[
    ['trim_end','/locations/stitcher/linen-shears.webp'],
    ['discard_end','/locations/stitcher/clean-dressings.webp']]);
  assert.deepEqual(items('record').map(x=>[x.action,x.image]),[
    ['record_linen','/locations/stitcher/ward-register.webp']]);
});

test('prop actions require server permission and never appear in other stages or phases',()=>{
  assert.deepEqual(stitcherItemActions(1,'prepare',all),[]);
  assert.deepEqual(stitcherItemActions(3,'record',all),[]);
  assert.deepEqual(stitcherItemActions(2,'report',all),[]);
  assert.deepEqual(stitcherItemActions(2,'prepare',['prep_ready']),[
    {action:'prep_ready',image:'/locations/stitcher/clean-dressings.webp'}]);
  assert.deepEqual(stitcherItemActions(2,'linen_fix',[]),[]);
});

test('each illustrated prop is a real bundled WebP, not a remote placeholder',()=>{
  for(const item of [...items('prepare'),...items('linen_fix'),...items('record')]){
    const bytes=readFileSync(fileURLToPath(new URL('../apps/web/static'+item.image,import.meta.url)));
    assert.equal(bytes.toString('ascii',0,4),'RIFF',item.image);
    assert.equal(bytes.toString('ascii',8,12),'WEBP',item.image);
  }
});

test('icon choices render below the dialogue and never show the original text buttons',()=>{
  const scene=readFileSync(fileURLToPath(new URL('../apps/web/src/lib/StitcherWardScene.svelte',import.meta.url)),'utf8');
  assert.match(scene,/class="stitcher-reading-column"/);
  assert.match(scene,/class="stitcher-item-tray"/);
  assert.match(scene,/Use the indicated item\./);
  assert.match(scene,/!itemChoices\.some\(item=>item\.action===action\)/);
  assert.match(scene,/aria-label=\{STITCHER_ACTION_LABEL\[item\.action\]\}/);
  assert.match(scene,/onclick=\{\(\)=>act\(item\.action\)\}/);
  assert.ok(scene.indexOf('class="stitcher-item-tray"')>scene.indexOf('</section>\n      {#if itemChoices.length'));
});
