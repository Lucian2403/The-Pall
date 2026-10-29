import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=(p)=>readFileSync(resolve(root,p),'utf8');
const page=read('apps/web/src/routes/introduction/+page.svelte');
const approved=read('apps/web/src/lib/approved-introductions.ts');
const markup=page.slice(0,page.indexOf('<style>'));
const css=page.slice(page.indexOf('<style>'));

// The introduction is public and the approved story remains data-driven.
for(const required of [
  'APPROVED_WORLD_INTRO.heading',
  'APPROVED_WORLD_INTRO.paragraphs as paragraph,i',
  'paragraph as segment',
  "segment.style==='strong'",
  "segment.style==='em'",
  'segment.text',
  "signedIn=response.ok",
  "href=\"/characters\"",
  "href=\"/backgrounds\"",
  "href=\"/account?mode=register\"",
  "href=\"/account\""
]){
  assert.ok(markup.includes(required),'Missing canonical intro or navigation: '+required);
}
assert.ok(approved.includes('export const APPROVED_WORLD_INTRO') &&
  !markup.includes('A CITY ENDURES'),
  'Reuse the owner-approved source and logo without the obsolete motto');

// Header and hero share the city artwork and a continuous overlay.
assert.ok(markup.includes('class="introduction-masthead"') &&
  markup.includes('class="entry-nav"') &&
  markup.includes('class="entry-hero"') &&
  markup.includes('class="intro-manuscript"') &&
  markup.includes('class="continue"'),
  'Preserve the introductory page hierarchy');
const masthead=css.slice(css.indexOf('  .introduction-masthead{'),css.indexOf('  .introduction-page .entry-nav{'));
assert.ok(masthead.includes("url('/ui-kit/resources/TheCityVista.png')") &&
  masthead.includes('linear-gradient(90deg,#15120fec') &&
  masthead.includes('linear-gradient(180deg,#100e0cbd'),
  'Navigation and heading must have one image/gradient');
assert.equal((css.match(/TheCityVista\.png/g)||[]).length,1,
  'Do not duplicate city imagery behind navigation and hero');

for(const asset of [
  '/ui-kit/frames/dialogue-frame-trim.png',
  '/ui-kit/buttons/button-normal-trim.png',
  '/ui-kit/buttons/button-hover-trim.png',
  '/ui-kit/buttons/button-pressed-trim.png'
]){
  assert.ok(css.includes(asset),'Missing owner frame asset: '+asset);
}
assert.ok(css.includes('border-image-slice:145 190 125 190 fill') &&
  css.includes('border-image-slice:50 180 45 180 fill') &&
  css.includes('.introduction-page .lore p.ending{') &&
  css.includes('.introduction-page .entry-links a:focus-visible') &&
  css.includes('.introduction-page .continue a:focus-visible') &&
  css.includes('@media(max-width:750px)') &&
  css.includes('@media(max-width:420px)') &&
  css.includes('flex:1 1 100%'),
  'Parchment reader, buttons, keyboard focus and responsive navigation are required');
assert.ok(markup.includes('<article class="intro-manuscript"') &&
  markup.includes('</article>') &&
  markup.includes('aria-label="Continue introduction"') &&
  markup.includes('/ui-kit/branding/logo-compact.png'),
  'The approved story must remain a single manuscript with navigable next actions');
console.log('PASS: Canonical world introduction, continuous masthead, parchment reader, three-state buttons and narrow-screen controls.');
