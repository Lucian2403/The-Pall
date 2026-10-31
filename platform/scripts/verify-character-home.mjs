import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const route=read('apps/web/src/routes/characters/[id]/+page.svelte');
const home=read('apps/web/src/lib/CharacterHome.svelte');
const skills=read('apps/web/src/lib/character-skills.ts');
const canon=read('../docs/01-player/skills-progression.md');
const characterSystem=read('../docs/01-player/character-system.md');
const shell=read('apps/web/src/lib/TutorialShell.svelte');
const beforeStyle=home.slice(0,home.indexOf('<style>'));
const styles=home.slice(home.indexOf('<style>'));

// Keep session/ownership checks and original tutorial shell untouched.
for(const required of [
  "fetch('/api/characters/' + encodeURIComponent(page.params.id), {cache: 'no-store'})",
  'response.status === 401',
  'response.status === 404',
  '<TutorialShell {character} activePage="character">',
  '<CharacterHome {character}/>',
  'avatarId?: string | null;',
  'href="/characters"',
  'href="/account"'
]) assert.ok(route.includes(required),'Character route lost existing contract: '+required);
assert.ok(shell.includes('class="resource-strip"') &&
  shell.includes("character.tutorial.stage") &&
  shell.includes('class="city-banner"') &&
  shell.includes("lockedSections"),
  'Keep existing resource HUD, city artwork and tutorial navigation');

// No fake skill values. All canonical names, exactly, in canonical order.
const entries=[...canon.matchAll(/^\| \*\*(.+?)\*\* \| (.+?) \|$/gm)];
assert.equal(entries.length,8,'Canonical skills document must contain eight Major Skills');
const names=[...skills.matchAll(/\{major:'([^']+)', subskills:\[([^\]]+)\]\}/g)];
assert.equal(names.length,8,'The new skill list must include every Major Skill once');
let count=0;
for(let i=0;i<8;i++){
  assert.equal(names[i][1],entries[i][1],'Incorrect major skill at position '+i);
  const subskills=names[i][2].match(/'([^']+)'/g)?.map(x=>x.slice(1,-1))??[];
  assert.deepEqual(subskills,entries[i][2].split(', '),'Incorrect subskills for '+names[i][1]);
  count+=subskills.length;
}
assert.equal(count,32,'All 32 canonical subskills must be present');
assert.ok(beforeStyle.includes('CHARACTER_SKILLS as group') &&
  beforeStyle.includes('group.subskills.join') &&
  beforeStyle.includes("character.majorSkillBonuses[group.major]") &&
  beforeStyle.includes('not yet tracked here'),
  'Skill list must show all names and only the recorded bonus values');

// Core attributes are spelled out using the canonical terms.
for(const [key,name] of Object.entries({
  STR:'Strength',DEX:'Dexterity',INT:'Intellect',RES:'Resolve'
})){
  assert.ok(characterSystem.includes('**'+key+' — '+name+':') &&
    beforeStyle.includes("key:'"+key+"',name:'"+name+"'"),
    'Character attribute name must match canon: '+key);
}
assert.ok(beforeStyle.includes('character.attributes[attribute.key]') &&
  beforeStyle.includes('character.health.current') &&
  beforeStyle.includes('character.coins') &&
  beforeStyle.includes('character.starterItemRequirements'),
  'Identity, attributes, health, currency and starting kit must remain server-owned');

// The origin scene/portrait must follow the SAVED character, not a demo user.
assert.ok(beforeStyle.includes('originVisual(character.origin)') &&
  beforeStyle.includes('artwork.src') &&
  beforeStyle.includes('avatarId={character.avatarId??null}') &&
  beforeStyle.includes('character.name') &&
  beforeStyle.includes('character.startingLocation'),
  'Use actual saved portrait, origin artwork, name and location');

// Preserve all originally available gameplay routes/availability boundaries.
for(const target of ['/opening','/millhand/work','/millhand/missing-stamp','/millhand/second-job']){
  assert.ok(beforeStyle.includes("href:base+'"+target+"'"),
    'Missing original chapter action: '+target);
}
assert.ok(beforeStyle.includes("character.tutorial.stage===5") &&
  beforeStyle.includes("character.tutorial.status==='NOT_STARTED'") &&
  beforeStyle.includes("character.origin==='Millhand'"),
  'Work action must follow saved stage and origin');

assert.ok(beforeStyle.includes('showArrival') &&
  beforeStyle.includes('localStorage.setItem') &&
  beforeStyle.includes('newArrival&&') &&
  beforeStyle.includes('onclick={dismissArrival}'),
  'Arrival notice must be dismissible and not interrupt subsequent logins');
for(const state of ['normal','hover','pressed']){
  assert.ok(styles.includes('/ui-kit/buttons/button-'+state+'-trim.png'),
    'Missing approved '+state+' dialogue button frame');
}
assert.ok(styles.includes('/ui-kit/frames/dialogue-frame-trim.png') &&
  styles.includes('@media(max-width:700px)') &&
  styles.includes('@media(max-width:460px)') &&
  beforeStyle.includes('PERSONAL NOTICES'),
  'Character home must use restrained parchment and be responsive');
console.log('PASS: Character arrival, saved origin, full canonical 8/32 skills, named attributes, chapter routes, notices and owner UI frames.');
