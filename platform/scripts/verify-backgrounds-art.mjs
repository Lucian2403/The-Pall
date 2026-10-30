import {strict as assert} from 'node:assert';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const page=readFileSync(resolve(root,'apps/web/src/routes/backgrounds/+page.svelte'),'utf8');
const copy=readFileSync(resolve(root,'apps/web/src/lib/approved-introductions.ts'),'utf8');
const markup=page.slice(0,page.indexOf('<style>'));
const css=page.slice(page.indexOf('<style>'));

// The six canonical backgrounds remain data-driven, not new CSS-driven lore.
for(const fragment of [
  'APPROVED_BACKGROUND_SELECTION.heading',
  'APPROVED_BACKGROUND_SELECTION.introduction',
  'APPROVED_BACKGROUND_SELECTION.origins as origin (origin.origin)',
  'APPROVED_BACKGROUND_SELECTION.closing as paragraph',
  '{origin.heading}',
  '{origin.description}',
  '{origin.advantage}',
  'aria-pressed={selectedOrigin===origin.origin}',
  "selectedOrigin=origin.origin;creationMessage='';",
  'originVisual(origin.origin).src',
  'originMajorSkillBonusLevels',
  'catalogue.startingFacts.attributes',
  'catalogue.startingFacts.startingCoins',
  'catalogue.startingFacts.starterItemDisplayNames',
  'selectedSex=\'Male\';selectedAvatarId=null',
  'selectedSex=\'Female\';selectedAvatarId=null',
  '<AvatarPicker',
  'onSelect={(id)=>{selectedAvatarId=id;}}',
  'onsubmit={(event)=>{event.preventDefault();void createCharacter();}}',
  'disabled={busy||!selectedAvatarId||roster.slots.used>=roster.slots.limit}',
  "pendingRequestId = crypto.randomUUID()",
  "expectedRevision: roster.revision",
  "await goto('/characters')",
  "href=\"/characters\"",
  "href=\"/introduction\"",
  "href=\"/account\"",
  "loading==='login'",
  "loading==='unavailable'",
  'role="alert"'
]){
  assert.ok(markup.includes(fragment),'Background selection lost existing contract: '+fragment);
}
assert.ok(copy.includes('export const APPROVED_BACKGROUND_SELECTION') &&
  markup.includes('class="backgrounds-masthead"') &&
  markup.includes('class="entry-content backgrounds-content"') &&
  markup.includes('class="origin-layout"') &&
  markup.includes('class="origin-grid"') &&
  markup.includes('class="character-preview"') &&
  markup.includes('class="approved-ending"') &&
  !markup.includes('A CITY ENDURES'),
  'Do not replace canonical copy, hierarchy, or the owner logo');
assert.equal((markup.match(/<form /g)||[]).length,1,'Keep a single authenticated creation form');

const masthead=css.slice(css.indexOf('  .backgrounds-masthead{'),css.indexOf('  .backgrounds-page .entry-nav{'));
assert.ok(masthead.includes("url('/ui-kit/resources/TheCityVista.png')") &&
  masthead.includes('linear-gradient(90deg,#15120fec') &&
  masthead.includes('linear-gradient(180deg,#100e0cbd'),
  'Navigation and title need one continuous owner panorama');
assert.equal((css.match(/TheCityVista\.png/g)||[]).length,1,
  'Do not repeat differently cropped skyline images');
for(const art of [
  '/ui-kit/frames/dialogue-frame-trim.png',
  '/ui-kit/buttons/button-normal-trim.png',
  '/ui-kit/buttons/button-hover-trim.png',
  '/ui-kit/buttons/button-pressed-trim.png'
]){
  assert.ok(css.includes(art),'Missing approved owner art: '+art);
}
assert.ok(css.includes("url('/locations/characters/GreyMarches_background01.png')") &&
  existsSync(resolve(root,'apps/web/static/locations/characters/GreyMarches_background01.png')),
  'Grey Marches approved backdrop must exist in the static asset library');
assert.ok(css.includes('border-image-slice:145 190 125 190 fill') &&
  css.includes('border-image-slice:50 180 45 180 fill') &&
  css.includes('.backgrounds-page .origin-card.active{') &&
  css.includes('.backgrounds-page .sex-selector button.active{') &&
  css.includes('.backgrounds-page .origin-card:focus-visible{') &&
  css.includes('.backgrounds-page .creation input:focus-visible{') &&
  css.includes('grid-template-columns:repeat(2,minmax(0,1fr))') &&
  css.includes('grid-template-columns:1fr') &&
  css.includes('@media(max-width:920px)') &&
  css.includes('@media(max-width:540px)'),
  'Framed selection controls must retain selected/focus states and responsive cards');
console.log('PASS: Six approved origins, live creation flow, owner frames, city masthead, Grey Marches background and responsive layout.');
