import {strict as assert} from 'node:assert';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const page=readFileSync(resolve(root,'apps/web/src/routes/characters/+page.svelte'),'utf8');
const markup=page.slice(0,page.indexOf('<style>'));
const css=page.slice(page.indexOf('<style>'));
const greyMarchesAsset=resolve(root,'apps/web/static/locations/characters/GreyMarches_background01.png');
assert.ok(css.includes("url('/locations/characters/GreyMarches_background01.png')"),
  'Roster background must use the uploaded Grey Marches illustration');
assert.ok(existsSync(greyMarchesAsset),
  'The Grey Marches PNG is not installed: extract The_Pall_Grey_Marches_Roster_Asset.zip into platform/ before verifying and merging');

// This is a visual pass: all existing roster/auth endpoints and safety
// confirmations must remain implemented, not replaced with mock interactions.
for(const required of [
  "fetch('/api/characters',{cache:'no-store'})",
  "res.status===401",
  "state='unavailable'",
  "method:'PATCH'",
  "method:'DELETE'",
  "deletionName!==character.name",
  "expectedRevision:roster.revision",
  "confirmedName:deletionName",
  "b.error==='stale_revision'",
  "processingId=character.id",
  "onMount(()=>{void refresh();})",
  "{#each roster.characters as character (character.id)}",
  "originVisual(character.origin).src",
  "<CharacterAvatar",
  "<PortraitCarousel",
  'onSelect={(id)=>{draftAvatarId=id;}}',
  'if(draftAvatarId)void changePortrait(character,draftAvatarId);',
  'disabled={!draftAvatarId||draftAvatarId===character.avatarId||processingId!==null}',
  'draftAvatarId=opening?(character.avatarId??null):null;',
  'disabled={deletionName!==character.name||processingId!==null}',
  'role="alert"',
  'role="status"'
]){
  assert.ok(markup.includes(required),'Missing existing roster interaction or safety contract: '+required);
}
for(const route of [
  'href="/introduction"',
  'href="/account"',
  'href="/backgrounds"',
  "href={'/characters/'+encodeURIComponent(character.id)}"
]){
  assert.ok(markup.includes(route),'Lost character roster navigation: '+route);
}
assert.ok(markup.includes('class="characters-masthead"') &&
  markup.includes('class="entry-hero"') &&
  markup.includes('class="entry-content characters-content"') &&
  markup.includes('class="roster-head"') &&
  markup.includes('class="roster"') &&
  markup.includes('class="character-card"') &&
  markup.includes('class="card-image"') &&
  markup.includes('class="card-details"') &&
  markup.includes('class="card-editor"') &&
  !markup.includes('A CITY ENDURES'),
  'Preserve the roster structure and match the approved entry masthead');

const masthead=css.slice(css.indexOf('  .characters-masthead{'),css.indexOf('  .characters-page .entry-nav{'));
assert.ok(masthead.includes("url('/ui-kit/resources/TheCityVista.png')") &&
  masthead.includes('linear-gradient(90deg,#15120fec') &&
  masthead.includes('linear-gradient(180deg,#100e0cbd'),
  'Navigation and title must share one city panorama and gradient');
assert.equal((css.match(/TheCityVista\.png/g)||[]).length,1,'One panorama, not two separately cropped images');
for(const asset of [
  '/ui-kit/frames/dialogue-frame-trim.png',
  '/ui-kit/buttons/button-normal-trim.png',
  '/ui-kit/buttons/button-hover-trim.png',
  '/ui-kit/buttons/button-pressed-trim.png'
]){
  assert.ok(css.includes(asset),'Missing approved owner UI asset: '+asset);
}
assert.ok(css.includes('border-image-slice:145 190 125 190 fill') &&
  css.includes('border-image-slice:50 180 45 180 fill') &&
  css.includes('grid-template-columns:repeat(3,minmax(0,1fr))') &&
  css.includes('grid-template-columns:repeat(2,minmax(0,1fr))') &&
  css.includes('grid-template-columns:1fr') &&
  css.includes('.characters-page .danger-link{') &&
  css.includes('.characters-page .card-editor input:focus-visible') &&
  css.includes('.characters-page .entry-links a:focus-visible'),
  'Character cards must have readable parchment, framed controls and responsive focus rules');
assert.ok(!markup.includes('<AvatarPicker') &&
  markup.includes("import PortraitCarousel from '$lib/PortraitCarousel.svelte'") &&
  markup.includes("onclick={()=>{if(draftAvatarId)void changePortrait(character,draftAvatarId);}}"),
  'Changing portraits must use an explicitly confirmed draft, not save on every arrow click');
console.log('PASS: Character roster appearance, arrow-driven portrait drafts, save and deletion safeguards, city masthead and responsive cards.');
