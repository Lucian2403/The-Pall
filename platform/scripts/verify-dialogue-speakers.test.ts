/** Shared UI contract: the protagonist speaks under the label YOU.
 * Keep the original scripted speaker IDs and dialogue lines unchanged.
 * This test scans all web scene sources so future iterations cannot quietly
 * reintroduce character names, PLAYER, or mixed-case You as speech headers.
 */
import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readdirSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PLAYER_SPEAKER_LABEL,dialogueSpeakerLabel} from '../apps/web/src/lib/dialogue-speaker.ts';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
function svelteFiles(folder:string):string[]{
  const files:string[]=[];
  for(const entry of readdirSync(folder,{withFileTypes:true})){
    const path=join(folder,entry.name);
    if(entry.isDirectory())files.push(...svelteFiles(path));
    else if(entry.isFile()&&entry.name.endsWith('.svelte'))files.push(path);
  }
  return files;
}

test('canonical player speaker is uppercase YOU, without changing other speakers',()=>{
  assert.equal(PLAYER_SPEAKER_LABEL,'YOU');
  for(const id of ['Player','player','PLAYER','YOU','You',' you ','  player  '])
    assert.equal(dialogueSpeakerLabel(id),'YOU',id);
  for(const npc of ['Hector D. Smoke','WATCHMAN','Guther','Flint','CLINICIAN','Narration'])
    assert.equal(dialogueSpeakerLabel(npc),npc,npc);
  assert.equal(dialogueSpeakerLabel(undefined),'');
  assert.equal(dialogueSpeakerLabel(null),'');
});

test('all rendered speaker captions use the shared formatter or constant',()=>{
  const locations=[join(root,'apps/web/src/lib'),join(root,'apps/web/src/routes')];
  const errors:string[]=[];
  let scanned=0;
  const label=/<(?:p|h[1-6]|span)\b[^>]*\bclass="([^"]*)"[^>]*>([\s\S]*?)<\/(?:p|h[1-6]|span)>/g;
  for(const file of locations.flatMap(svelteFiles)){
    scanned++;
    const source=readFileSync(file,'utf8');
    const display=source.split('</script>')[1]??source;
    // Only speech captions and their small label variants are subject to
    // this rule; narrator prose, HUD/character names and buttons are not.
    for(const match of display.matchAll(label)){
      const classes=match[1].split(/\s+/);
      if(!classes.some(c=>['speaker','speaker-heading','eyebrow'].includes(c)))continue;
      const content=match[2].replace(/<[^>]*>/g,'').trim();
      const place=file.substring(root.length+1);
      if(/^(?:You|YOU|Player|PLAYER)$/.test(content))
        errors.push(place+': raw player label; use PLAYER_SPEAKER_LABEL');
      if(/\b(?:character\.name|characterName)(?:\b|\.)/.test(content))
        errors.push(place+': character name in dialogue speaker heading');
      if(/\{[^}]*\.speaker[^}]*\}/.test(content)&&
         !content.includes('dialogueSpeakerLabel('))
        errors.push(place+': raw speaker ID in heading; use dialogueSpeakerLabel()');
    }
    // Catch legacy ternaries even when nested inside a different caption.
    if(/\.speaker\s*===?\s*['"]Player['"]\s*\?\s*(?:['"](?:You|YOU)['"]|characterName|character\.name)/.test(display))
      errors.push(file.substring(root.length+1)+': legacy direct player name ternary');
  }
  assert.ok(scanned>=20,'The web scene source scan did not run');
  assert.deepEqual(errors,[],errors.join('\n'));
});

test('existing narrative scene components adopt the shared speaker convention',()=>{
  const components=[
    'apps/web/src/lib/BellrunnerOpeningScene.svelte',
    'apps/web/src/lib/BellrunnerHectorConversation.svelte',
    'apps/web/src/lib/WorkshopScene.svelte',
    'apps/web/src/lib/MillhandMissingStampScene.svelte',
    'apps/web/src/lib/MillhandDepotScene.svelte',
    'apps/web/src/lib/MillhandContractsScene.svelte',
    'apps/web/src/lib/MillhandRecordsScene.svelte',
    'apps/web/src/lib/MillhandSecondJobScene.svelte',
    'apps/web/src/lib/MillhandWageClaimScene.svelte',
    'apps/web/src/routes/characters/[id]/opening/+page.svelte',
    'apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte',
    'apps/web/src/routes/characters/[id]/bellrunner/wrong-bell/+page.svelte',
    'apps/web/src/routes/characters/[id]/millhand/clinic/+page.svelte',
    'apps/web/src/routes/characters/[id]/home/+page.svelte'
  ];
  for(const file of components){
    const source=readFileSync(join(root,file),'utf8');
    assert.match(source,/\$lib\/dialogue-speaker/,file);
    assert.ok(source.includes('dialogueSpeakerLabel(')||
      source.includes('PLAYER_SPEAKER_LABEL}'),file);
  }
});
