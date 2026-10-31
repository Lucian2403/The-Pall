import {strict as assert} from 'node:assert';
import {existsSync,readFileSync} from 'node:fs';
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
  'avatarId={character.avatarId??null}','character.startingLocation'
]) assert.ok(markup.includes(field),'Missing saved character value: '+field);
for(const field of [
  'formatted(character.health)','formatted(character.stamina)',
  'formatted(character.fatigue)','formatted(character.focus)',
  'String(character.coins)',"character.tutorial.stage+' / 8'"
]) assert.ok(markup.includes(field),'Missing saved or explicitly untracked resource: '+field);

// Four full names and descriptions from the approved character system.
const descriptions={
  STR:['Strength','Physical potential, carrying, heavy jobs/equipment, melee and heavy-tool training.'],
  DEX:['Dexterity','Coordination, firearms, movement, locks and delicate technical work.'],
  INT:['Intellect','Learning and reasoning, research, medicine, chemistry, engineering and investigation.'],
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

// Major Skills use 0–100 and show an owner-approved provisional 1/100 UI
// baseline if no grant was recorded. Roman I–IV specializations, including
// Smithing I, remain separate from Major Skill progression.
assert.ok(canon.includes('Major Skills use a long 0–100 progression') &&
  canon.includes('Specializations use a smaller tier structure') &&
  canon.includes('**1 / 100** instead of a dash') &&
  canon.includes('not a persisted level or an award of XP') &&
  canon.includes('Roman numerals **I, II, III, IV**') &&
  canon.includes('starting specialization preview') &&
  canon.includes('grants **+3 levels** to the chosen background Major Skill'),
  'Canonical progression rule changed: revisit UI treatment before merging');
assert.ok(panelMarkup.includes("majorSkillBonuses[major]") &&
  panelMarkup.includes("grant+' / 100'") &&
  panelMarkup.includes("'1 / 100'") &&
  panelMarkup.includes("The API stores")===false &&
  panelMarkup.includes('provisional display baseline') &&
  panelMarkup.includes("'I · starting'") &&
  panelMarkup.includes("origin==='Millhand'") &&
  panelMarkup.includes("(majorSkillBonuses.Craftsmanship??0)>=3") &&
  panelMarkup.includes("major==='Craftsmanship'&&skill==='Smithing'") &&
  panelMarkup.includes('starting preview, not a saved rank') &&
  !panelMarkup.includes("'— / 100'") &&
  !panelMarkup.includes('— / TBD'),
  'Roman tier presentation must preserve provisional 1/100 baseline without inventing saved levels');

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
// The first welcome paragraph must not repeat the task, and there is no second
// competing heading. The primary game action should be legible and prominent.
assert.ok(!markup.includes('<h3>Another shift begins.</h3>') &&
  markup.includes("At Guther Anvil's workshop, a new council plate lot awaits.") &&
  markup.includes('Report to Guther Anvil at the bench to begin your first shift.') &&
  !markup.includes('A council plate lot waits on Guther Anvil'),
  'Opening notice and current-work copy should not repeat the same sentence');
assert.ok(css.includes('min-height:60px;max-width:100%') &&
  css.includes('font:600 17px/1.25 var(--pall-font-reading,Georgia,serif)') &&
  css.includes('border-width:15px 32px 14px;border-image-width:15px 32px 14px;'),
  'Primary work button must be larger without losing owner frame proportions');
assert.ok(markup.includes('class="arrival-layout"') &&
  markup.includes('class="personal-notices"') &&
  markup.includes('<h2>Personal notices</h2>') &&
  markup.includes('class="notice-work work-order"') &&
  markup.includes('{#if newArrival}') &&
  markup.includes('{#if !newArrival}') &&
  markup.includes('showArrival') &&
  markup.includes('localStorage.setItem(arrivalKey') &&
  markup.includes('localStorage.removeItem(arrivalKey)') &&
  markup.includes('onclick={toggleArrival}') &&
  markup.includes("'Hide notice':'Show notice'") &&
  markup.includes('aria-expanded={showArrival}'),
  'Welcome notice must be reversible without hiding the workshop action');
assert.ok(markup.indexOf('class="notice-work work-order"')<markup.indexOf('{:else}\n          <p>No new personal notices.'),
  'Stage 1 CTA must be nested in the notice');

// The Stage 1 action is a single prominent Work Order in Personal notices.
// Its dynamic title/description/route are still derived from the saved stage.
assert.ok(markup.includes('<section class="notice-work work-order" aria-label="Current work order">') &&
  markup.includes('<span class="work-order-kicker">Current work order</span>') &&
  markup.includes('<span class="work-order-stage">Stage I</span>') &&
  markup.includes('<a class="framed-action work-order-action" href={work.href}>{work.label}</a>') &&
  markup.includes('<h3>{work.title}</h3>') &&
  markup.includes('<p>{work.description}</p>'),
  'The first available work must be a real linked, accessible assignment');
const workStyles=css.slice(css.indexOf('  .notice-work{'),css.indexOf('  .quiet-action{'));
assert.ok(workStyles.includes('width:100%') &&
  workStyles.includes("border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png')") &&
  workStyles.includes('border-image-slice:145 190 125 190 fill') &&
  workStyles.includes('.personal-notices .work-order h3{') &&
  workStyles.includes('.personal-notices .work-order p{') &&
  workStyles.includes('width:min(100%,310px)') &&
  workStyles.includes('min-height:64px') &&
  css.includes('.work-order-action{width:100%;font-size:16px}'),
  'Work Order requires one full-width parchment, readable ink, large main action and mobile sizing');

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
const noticeStyles=css.slice(css.indexOf('  .personal-notices{'),css.indexOf('  .personal-notices h2{'));
assert.ok(noticeStyles.includes('border:0') &&
  noticeStyles.includes('background:none') &&
  noticeStyles.includes('box-shadow:none') &&
  css.includes('linear-gradient(270deg,#120e0bdd'),
  'Notice text should appear directly over darkened chosen-origin art, without a panel');
assert.ok(markup.includes('class="attribute-code"') &&
  markup.includes('class="record-ornament"') &&
  css.includes('.attribute-row dd{') &&
  css.includes('background:linear-gradient(110deg,#f1dfc2') && 
  css.includes('font:700 15px/1.5 var(--pall-font-reading,Georgia,serif)') &&
  css.includes('color:#24160d;text-shadow:none'),
  'Character record must use the approved stat-ledger visual treatment');
assert.ok(markup.includes('origin={character.origin}') &&
  panelCss.includes('var(--pall-font-reading,Georgia,serif)') &&
  css.includes('var(--pall-font-reading,Georgia,serif)'),
  'Character UI must consume installed New Standard font tokens');
assert.ok(css.includes('/ui-kit/frames/dialogue-frame-trim.png') &&
  css.includes('@media(max-width:900px)') &&
  panelCss.includes('.window-top'),
  'Preserve frame art and responsive behavior');
// This pass widens the notice and uses the owner's original dialogue-frame art
// for each expandable Major Skill. The text remains dark on parchment.
assert.ok(css.includes('grid-template-columns:minmax(0,.72fr) minmax(0,1.28fr)') &&
  css.includes('width:100%;box-sizing:border-box') &&
  css.includes('@media(max-width:1250px)') &&
  css.includes('@media(max-width:900px)'),
  'Personal Notices should span the unused right-hand origin illustration');
assert.ok(panelCss.includes('.skill-category{') &&
  panelCss.includes("border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png')") &&
  panelCss.includes('border-image-slice:145 190 125 190 fill') &&
  panelCss.includes('.subskills li{border-bottom:1px solid #bca17c;color:#352316}') &&
  panelCss.includes('.window-skill li{border-bottom:1px solid #594735;color:#e1cfb7}') &&
  !panelCss.includes('var(--pall-font-reading,var('),
  'Skill dropdowns need readable nine-slice parchment without corrupting modal styles');

// Each icon is original transparent SVG line art that may be reused elsewhere.
for(const name of ['health','stamina','fatigue','focus','coins','stage']){
  const file='apps/web/static/ui-kit/icons/character-'+name+'.svg';
  assert.ok(existsSync(resolve(root,file)), 'Missing resource icon: '+file);
  const svg=read(file);
  assert.ok(svg.includes('viewBox="0 0 48 48"') &&
    svg.includes('<svg ') && svg.includes('</svg>') &&
    svg.includes('stroke="#b58b57"'),
    'Malformed original brass icon: '+name);
  assert.ok(markup.includes("id:'"+name+"'"),
    'Missing original health/stamina/fatigue/focus/coins/stage resource: '+name);
}
assert.ok(markup.includes("isMeasured(value:Measured|undefined)") &&
  markup.includes('resource.known?resource.label:\'Not tracked yet\'') &&
  markup.includes("value:formatted(character.stamina)") &&
  markup.includes("value:formatted(character.focus)") &&
  markup.includes('class:untracked={!resource.known}') &&
  markup.includes('class="resource-grid"') &&
  !markup.includes('character.stamina??0') &&
  !markup.includes('character.focus??0'),
  'Untracked resources must show a dash, never fictitious measured numbers');
console.log('PASS: Wide unframed notice, readable parchment attributes, framed skill dropdowns, six original resource icons with honest API state and existing game contracts.');

