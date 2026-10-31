import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const route=read('apps/web/src/routes/characters/[id]/+page.svelte');
const home=read('apps/web/src/lib/CharacterHome.svelte');
const skillPanel=read('apps/web/src/lib/CharacterSkills.svelte');
const skills=read('apps/web/src/lib/character-skills.ts');
const canon=read('../docs/01-player/skills-progression.md');
const charDoc=read('../docs/01-player/character-system.md');
const shell=read('apps/web/src/lib/TutorialShell.svelte');
const markup=home.slice(0,home.indexOf('<style>'));
const css=home.slice(home.indexOf('<style>'));
const panelMarkup=skillPanel.slice(0,skillPanel.indexOf('<style>'));
const panelCss=skillPanel.slice(skillPanel.indexOf('<style>'));

// Keep account ownership boundaries, owner HUD and all real chapter routes.
for(const fragment of [
  "fetch('/api/characters/' + encodeURIComponent(page.params.id), {cache: 'no-store'})",
  'response.status === 401','response.status === 404',
  '<TutorialShell {character} activePage="character">',
  '<CharacterHome {character}/>',
  'avatarId?: string | null;',
  'href="/characters"','href="/account"'
]) assert.ok(route.includes(fragment),'Lost route contract: '+fragment);
assert.ok(shell.includes('class="resource-strip"') &&
  shell.includes('class="city-banner"') &&
  shell.includes('lockedSections'),
  'Keep resource meters, city masthead and original onboarding navigation');
for(const target of ['/opening','/millhand/work','/millhand/missing-stamp','/millhand/second-job']){
  assert.ok(markup.includes("href:base+'"+target+"'"),
    'Missing existing stage route '+target);
}
assert.ok(markup.includes("character.tutorial.stage===5") &&
  markup.includes("character.tutorial.status==='NOT_STARTED'") &&
  markup.includes("character.origin==='Millhand'"),
  'Stage routing must follow saved character data');

// Real saved character identity and origin illustration, not mock data.
for(const field of [
  'originVisual(character.origin)','artwork.src','character.name',
  'avatarId={character.avatarId??null}','character.startingLocation',
  'character.health.current','character.coins'
]) assert.ok(markup.includes(field),'Missing saved character value: '+field);

// Four full names and descriptions from the approved character system.
const descriptions={
  STR:['Strength','Physical potential, carrying, heavy jobs, melee and heavy-tool training.'],
  DEX:['Dexterity','Coordination, firearms, movement, locks and delicate technical work.'],
  INT:['Intellect','Learning, reasoning, research, medicine, engineering and investigation.'],
  RES:['Resolve','Endurance under strain, mental resilience and difficult training.']
};
for(const [key,[name,description]] of Object.entries(descriptions)){
  assert.ok(charDoc.includes('**'+key+' — '+name+':') &&
    markup.includes("key:'"+key+"',name:'"+name+"'") &&
    markup.includes(description) &&
    markup.includes('attribute.description'),
    'Missing approved attribute name or description for '+key);
}

// Cross-check all Major Skills and subskills against canonical documentation.
const entries=[...canon.matchAll(/^\| \*\*(.+?)\*\* \| (.+?) \|$/gm)];
const names=[...skills.matchAll(/\{major:'([^']+)', subskills:\[([^\]]+)\]\}/g)];
assert.equal(entries.length,8,'Canon must list exactly eight majors');
assert.equal(names.length,8,'UI must list exactly eight majors');
let subCount=0;
for(let i=0;i<8;i++){
  assert.equal(names[i][1],entries[i][1],'Major Skill name/order differs from canon');
  const parts=names[i][2].match(/'([^']+)'/g)?.map(x=>x.slice(1,-1))??[];
  assert.deepEqual(parts,entries[i][2].split(', '),'Incorrect specialization list');
  subCount+=parts.length;
}
assert.equal(subCount,32,'All canonical 32 subskills must be represented');

// 100 is agreed for Major Skills, NOT for specialization tiers. Do not
// fabricate an unpersisted 1/100 baseline or a 3/100 subskill grant.
assert.ok(canon.includes('Major Skills use a long 0–100 progression') &&
  canon.includes('Specializations use a smaller tier structure') &&
  canon.includes('grants **+3 levels** to the chosen background Major Skill'),
  'Canonical progression rule changed: revisit UI treatment before merging');
assert.ok(panelMarkup.includes("majorSkillBonuses[major]") &&
  panelMarkup.includes("grant+' / 100'") &&
  panelMarkup.includes("'— / 100'") &&
  panelMarkup.includes('— / TBD') &&
  panelMarkup.includes('not a complete progression record') &&
  !panelMarkup.includes('1 / 100'),
  'Only server-stored major grants may appear as numbers; tiers remain undetermined');

// Dropdowns must expand a vertical list, not a concatenated row.
for(const frag of [
  '<details class="skill-category">','<summary>',
  '<ul class="subskills">','<li><span>{skill}</span>',
  'CHARACTER_SKILLS as group',
  'View all the skills',
  '<dialog bind:this={windowElement}',
  'role=', // see additional role-agnostic native dialogue check below
]){
  if(frag==='role=')continue;
  assert.ok(panelMarkup.includes(frag),'Missing interactive skills UI: '+frag);
}
assert.ok(panelMarkup.includes('onpointerdown={dragBegin}') &&
  panelMarkup.includes('onpointermove={dragMove}') &&
  panelMarkup.includes('onpointerup={dragEnd}') &&
  panelMarkup.includes('onpointercancel={dragEnd}') &&
  panelMarkup.includes('onkeydown={moveKeyboard}') &&
  panelMarkup.includes('showModal()') &&
  panelMarkup.includes('windowElement?.close()') &&
  panelMarkup.includes('aria-labelledby="all-skills-title"') &&
  panelMarkup.includes('aria-label="Close skills window"'),
  'Skills window must be draggable and keyboard accessible');
assert.ok(panelCss.includes('.skills-window::backdrop') &&
  panelCss.includes('.window-list{display:grid;grid-template-columns:repeat(2') &&
  panelCss.includes('@media(max-width:700px)'),
  'Skills popup must include backdrop, desktop columns and mobile layout');

// Stage 1 has ONE combined personal notice + work module, high in the hero.
assert.ok(markup.includes('class="arrival-layout"') &&
  markup.includes('class="personal-notices"') &&
  markup.includes('<h2>Personal notices</h2>') &&
  markup.includes('class="notice-work"') &&
  markup.includes('{#if newArrival}') &&
  markup.includes('{#if !newArrival}') &&
  markup.includes('showArrival') &&
  markup.includes('localStorage.setItem(arrivalKey') &&
  markup.includes('onclick={dismissArrival}'),
  'Welcome and first job must be one prominent, dismissible but nonblocking panel');
assert.ok(markup.indexOf('class="notice-work"')<markup.indexOf('{:else}\n          <p>No new personal notices.'),
  'Stage 1 CTA must be nested in the notice');

// Remove all owner-struck labels and inventory from this screen.
for(const removed of [
  'GRAND CYLINDER CITY · {character.origin.toUpperCase()}',
  'YOUR CHARACTER','YOUR RECORD',
  '8 MAJOR SKILLS',
  'The attributes and skill disciplines of your chosen character.',
  'All agreed disciplines are listed below.',
  'Starting equipment','starterItemRequirements.map'
]) assert.ok(!markup.includes(removed),'Owner removed text still visible: '+removed);
assert.ok(!markup.includes('group.subskills.join'),'Subskills must render as lists');

// Owner-approved game buttons, not generic modern controls.
for(const state of ['normal','hover','pressed']){
  const sprite='/ui-kit/buttons/button-'+state+'-trim.png';
  assert.ok(css.includes(sprite) && panelCss.includes(sprite),'Lost '+state+' sprite');
}
assert.ok(css.includes('/ui-kit/frames/dialogue-frame-trim.png') &&
  css.includes('@media(max-width:750px)') &&
  panelCss.includes('.window-top'),
  'Preserve frame art and responsive behavior');
console.log('PASS: First-arrival notice and action, canonical attributes, all eight major skills and 32 specializations, interactive skill window, saved origin and current routes.');
