import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=(p)=>readFileSync(resolve(root,p),'utf8');
const home=read('apps/web/src/routes/+page.svelte');
const intro=read('apps/web/src/routes/introduction/+page.svelte');
const account=read('apps/web/src/routes/account/+page.svelte');
const approvedHomeCopy=read('../docs/00-vision/public-homepage-copy.md');
const roster=read('apps/web/src/routes/characters/+page.svelte');
const backgrounds=read('apps/web/src/routes/backgrounds/+page.svelte');
const shell=read('apps/web/src/lib/TutorialShell.svelte');
const avatar=read('apps/web/src/lib/AvatarPicker.svelte');
const characterApi=read('apps/api/src/character-routes.ts');
const contract=read('packages/contracts/src/character-creation.ts');
const visuals=read('apps/web/src/lib/origin-visuals.ts');
const migration=read('db/migrations/0006_character_portraits.sql');
assert.ok(intro.includes('APPROVED_WORLD_INTRO.paragraphs') &&
  backgrounds.includes('APPROVED_BACKGROUND_SELECTION.origins') &&
  backgrounds.includes('APPROVED_BACKGROUND_SELECTION.closing'),
  'Approved lore and origin copy must remain verbatim in canonical sources');
for(const page of [home,intro,account,roster,backgrounds]){
  assert.ok(page.includes('pall-entry-pages.css') &&
    page.includes('/ui-kit/branding/logo-compact.png'),
    'Every entry page must retain the owner logo and shared typography');
}
assert.ok(home.includes("class=\"landing-hero\"") &&
  home.includes('/ui-kit/resources/TheCityVista.png') &&
  home.includes('/account?mode=register') &&
  home.includes('/account') && home.includes('/introduction') &&
  home.includes('signedIn?\'/characters\''),
  'Public homepage must show approved city artwork, account actions, and a signed-in player path');
// The owner revised the entire homepage copy. Test the real text after stripping
// only intentional inline emphasis, rather than allowing older promotional prose.
const htmlText=home.replace(/<\/?(?:em|strong)>/g,'').replace(/<br\s*\/?>/g,' ').replaceAll('&amp;','&');
const canonText=approvedHomeCopy.replaceAll('**','').replaceAll('*','');
for(const paragraph of [
  'Make a living. Find your own way.',
  'The Pall is a free-to-play, persistent browser MMORPG set in a harsh, industrial world. Your character, skills, possessions and progress remain between sessions.',
  'Nearly a century ago, a catastrophe called The Plume poisoned much of the world. Nobody knows what caused it. Now, most survivors live behind the enormous walls of Grand Cylinder City, where factories run day and night and thousands struggle to earn their keep. Beyond the walls lie dangerous, largely uncharted territories. And farther still, the Pall, where few dare venture.',
  "You're just another person trying to get by.",
  'Learn a trade, take jobs, build a business, explore or fight your way through trouble. There are no fixed classes. How you develop your skills, earn your coin and spend your days is entirely up to you.',
  "But there's more to life here than making money.",
  "Mature, story-driven quests explore corruption, exploitation, poverty, survival and the darker side of human nature. You'll meet people with their own troubles and motives, face uncomfortable choices and uncover stories that don't always have a clear right or wrong. Sometimes, doing the decent thing comes at a price.",
  "Crafting is a profession in its own right. Gather resources, refine materials, manufacture components and assemble equipment. Your skills, tools, workshop, materials and decisions affect the quality of what you produce. There's genuine depth to mastering a trade.",
  "And unlike many MMORPGs, early-game materials don't become useless at higher levels. Coal, iron, leather, cloth and basic components remain part of advanced production, maintenance and repairs. Even the best equipment needs ordinary materials and the craftsmen who produce them. A newcomer supplying basic goods can still have a place in the endgame economy.",
  "Beyond the city, procedurally generated territories offer new places to explore, resources to uncover and dangers to face. Discover something valuable? Sell the information to other players, or keep it for yourself. Just make sure you're prepared. Equipment, supplies and decisions matter, especially when trouble turns into tactical, turn-based combat.",
  "Be a craftsman, merchant, explorer, fighter, or a little of everything. You don't have to chase the same goals as everyone else.",
  'No pay-to-win. No forced PvP. No fixed classes.',
  'The Pall is in active development, with new locations, quests, professions and gameplay systems being introduced as the world takes shape.'
]){
  assert.ok(canonText.includes(paragraph) && htmlText.includes(paragraph),
    'Revised owner homepage text is missing, altered or replaced: '+paragraph.slice(0,85));
}
assert.ok(!home.includes('Technical connection test') &&
  !home.includes('/api/fixture') &&
  !home.includes('A world shaped by what you do.') &&
  !home.includes('Built in public, one system at a time.') &&
  !home.includes('More than a single profession.'),
  'Do not bring back the old technical fixture or rejected marketing copy');
for(const section of [
  'class="landing-hero"','class="world-section','class="freedom-section',
  'class="story-section','class="craft-section','class="economy-section',
  'class="exploration-section','class="principles-section','class="development-section'
]){
  assert.ok(home.includes(section),'Revised owner copy must be distributed by subject: '+section);
}
assert.ok(!/github\.com|Lucian2403\/The-Pall|Design documents|Development updates/.test(home) &&
  home.includes('/introduction') &&
  home.includes('In active development'),
  'The private development repository must never be linked or mentioned in the public homepage');
// Navigation and hero must share exactly one city panorama without a
// separate hero image or contrasting opaque band between them.
assert.ok(home.includes('<header class="landing-masthead">') &&
  home.includes('</header>\n\n    <main>') &&
  home.includes('.landing-masthead{') &&
  home.includes("background:#24201b url('/ui-kit/resources/TheCityVista.png') center 31%/cover no-repeat") &&
  home.includes('.landing-masthead::before{') &&
  home.includes('.landing .entry-nav{') &&
  home.includes('background:transparent;') &&
  home.includes('.landing-hero{') &&
  home.includes('border:0;') &&
  !home.includes('class="hero-art"') &&
  !home.includes('.hero-art{'),
  'Navigation and hero must use one uninterrupted city background, not two differently cropped images');
assert.ok(home.includes('.landing-hero::after{') &&
  home.includes('.hero-content{') &&
  home.includes('z-index:1;') &&
  home.includes('.landing .entry-links a{'),
  'Masthead needs translucent overlays plus readable heading and navigation text');
// Six illustrated sections alternate between art and copy; images are
// explicitly mapped to the owner-supplied location/resource illustrations.
const alternate=[
  {section:'world-section',art:'world-media',first:'image'},
  {section:'freedom-section',art:'pall-media',first:'text'},
  {section:'story-section',art:'story-media',first:'image'},
  {section:'craft-section',art:'craft-media',first:'text'},
  {section:'economy-section',art:'economy-media',first:'image'},
  {section:'exploration-section',art:'marches-media',first:'text'}
];
const layoutOrder=alternate.map(({section,art,first})=>{
  const begin=home.indexOf('<section class="'+section+' landing-split');
  assert.ok(begin!==-1,'Missing alternating landing section: '+section);
  const end=home.indexOf('</section>',begin);
  assert.ok(end>begin,'Unclosed landing section: '+section);
  const snippet=home.slice(begin,end);
  const imagePosition=snippet.indexOf('class="landing-media '+art+'"');
  const textPosition=snippet.indexOf('class="landing-copy"');
  assert.ok(imagePosition!==-1 && textPosition!==-1,
    'Image and copy must both appear in section '+section);
  assert.equal(imagePosition<textPosition?'image':'text',first,
    'Left/right ordering must alternate for '+section);
  return begin;
});
assert.ok(layoutOrder.every((position,i)=>i===0||position>layoutOrder[i-1]),
  'Alternating sections must remain in the approved narrative order');
for(const asset of [
  '/locations/homepage/pall-zone.webp',
  '/locations/homepage/crafting-items.webp',
  '/locations/homepage/grey-marches.webp',
  '/ui-kit/resources/TheCityVista.png',
  '/locations/records/records-room.webp',
  '/workshop/environment.webp'
])assert.ok(home.includes(asset),'Missing appropriate owner art: '+asset);
assert.ok(home.includes('.world-media{') &&
  home.includes('background-position:center top'),
  'Grand Cylinder City section must crop to the upper skyline and Cylinder peak');
assert.ok(home.includes('width:clamp(188px,16.5vw,248px)') &&
  home.includes('.landing .entry-nav .brand img{width:clamp(162px,35vw,205px)') &&
  !home.includes('A CITY ENDURES'),
  'Top-left logo must be visibly larger on desktop and sized for mobile; keep old motto removed');
assert.ok(home.includes('.landing-split .landing-copy{width:100%}') &&
  home.includes('.landing-split .landing-media{background-position:center}') &&
  home.includes('background:linear-gradient(0deg,#15110dfb'),
  'Mobile sections must preserve the full-bleed image behind a readable bottom-aligned text panel');
// Art is behind the entire section, not a separately bordered illustration
// with text in an adjacent column. Text alignment alternates left and right.
assert.ok(home.includes('.landing-split{') &&
  home.includes('position:relative;') &&
  home.includes('isolation:isolate;') &&
  home.includes('display:flex;') &&
  home.includes('min-height:clamp(350px,32vw,490px)') &&
  home.includes('.landing-split .landing-media{') &&
  home.includes('position:absolute;') &&
  home.includes('inset:0;') &&
  home.includes('z-index:-2;') &&
  home.includes('.landing-split::before{') &&
  home.includes('.landing-split .landing-copy{'),
  'Six owner illustrations must be section-wide backgrounds under layered text');
assert.ok(home.includes('.world-section,.story-section,.economy-section{justify-content:flex-end}') &&
  home.includes('.freedom-section,.craft-section,.exploration-section{justify-content:flex-start}') &&
  home.includes('.world-section::before,.story-section::before,.economy-section::before{'),
  'The layered reading panels must alternate sides with matching contrast gradients');
assert.ok((home.match(/src="\/ui-kit\/branding\/logo-full\.png"/g)||[]).length===2 &&
  home.includes('class="landing-logo-break section-width"') &&
  home.includes('class="footer-brand" aria-label="The Pall — home"') &&
  home.includes('width:clamp(245px,31vw,395px)') &&
  home.includes('width:clamp(160px,15vw,208px)'),
  'The full owner logo must appear in both indicated spaces: centred divider and footer');
// Public entry uses the exact same supplied nine-slice sprites as the
// owner-approved in-scene dialogue. Headings retain their original typeface;
// only descriptive paragraphs swap to a more legible Georgia reading face.
const uiKit=read('apps/web/src/lib/pall-owner-ui.css');
for(const asset of [
  '/ui-kit/frames/dialogue-frame-trim.png',
  '/ui-kit/buttons/button-normal-trim.png',
  '/ui-kit/buttons/button-hover-trim.png',
  '/ui-kit/buttons/button-pressed-trim.png'
]){
  assert.ok(uiKit.includes(asset) && home.includes(asset),
    'Homepage must reuse an approved owner UI asset: '+asset);
}
assert.ok(home.includes('border-image-slice:145 190 125 190 fill') &&
  home.includes('border-image-slice:50 180 45 180 fill') &&
  home.includes('border-image-repeat:stretch'),
  'Public homepage must match the game dialogue and button frame slices');
assert.ok((home.match(/class="section-prose landing-parchment"/g)||[]).length===4 &&
  (home.match(/class="landing-parchment"/g)||[]).length===3,
  'Seven explanatory text areas must be framed, while their headings stay outside');
assert.ok(home.includes(".landing .landing-parchment p{") &&
  home.includes("font:400 clamp(17px,1.38vw,19px)/1.65 Georgia") &&
  home.includes("font:400 clamp(18px,1.5vw,20px)/1.6 Georgia") &&
  home.includes('color:#27190f') &&
  home.includes('.landing .landing-parchment strong{'),
  'Landing body paragraphs should use high-contrast Georgia for readability');
assert.ok(!home.includes('.landing .landing-parchment h2') &&
  home.includes('font:600 clamp(37px,4vw,60px)/1.12 var(--pall-font-reading') &&
  home.includes('font:600 clamp(25px,2.5vw,36px)/1.2 var(--pall-font-reading'),
  'Homepage heading typography and hierarchy must be unchanged');
assert.ok(home.includes('.landing a.entry-button:hover') &&
  home.includes('.landing a.entry-button:active') &&
  home.includes('.landing a.entry-button:focus-visible') &&
  home.includes('font:600 15px/1.35 var(--pall-font-reading'),
  'Button hover/pressed/keyboard states and approved button font must be retained');
assert.ok(intro.includes('APPROVED_WORLD_INTRO.paragraphs') &&
  !intro.includes("status==='login'") &&
  !intro.includes('Account required') &&
  intro.includes('/account?mode=register'),
  'Canonical lore must be publicly accessible without changing its text or bypassing gameplay auth');
assert.ok(account.includes("requested==='register'") &&
  account.includes("new URLSearchParams(window.location.search)") &&
  account.includes("authClient.signUp.email") &&
  account.includes("authClient.signIn.email"),
  'Create-account hero button must open the live registration form, not a mock link');
assert.ok(intro.includes('/characters')&&intro.includes('entry-hero') &&
  roster.includes('entry-hero')&&backgrounds.includes('entry-hero'),
  'All three entry routes should show the city overview and work as real navigation');
assert.ok(roster.includes('originVisual(character.origin).src') &&
  visuals.includes('Millhand:')&&visuals.includes('Inkbound:'),
  'Character cards use grounded origin scene artwork');
assert.ok(avatar.includes('length:8')&&avatar.includes('onSelect(id)') &&
  avatar.includes('/ui-kit/avatars/'),
  'All eight portraits for each sex must be selectable from a common library');
assert.ok(backgrounds.includes('selectedAvatarId') &&
  backgrounds.includes('avatarId: selectedAvatarId') &&
  backgrounds.includes('<AvatarPicker sex={selectedSex}'),
  'Creation must require and save the explicitly chosen portrait');
assert.ok(roster.includes("method:'PATCH'") &&
  roster.includes("method:'DELETE'") &&
  roster.includes('deletionName!==character.name'),
  'Character roster must support owned portrait changes and typed deletion confirmation');
assert.ok(characterApi.includes("app.delete<{Params:{id:string}}>('/api/characters/:id'") &&
  characterApi.includes("app.patch<{Params:{id:string}}>('/api/characters/:id/avatar'") &&
  characterApi.includes('account_id=$2 FOR UPDATE') &&
  characterApi.includes("DELETE FROM '+table+' WHERE"),
  'Character deletion requires authentication, account ownership and child-record cleanup');
assert.ok(characterApi.includes('avatar_id')&&contract.includes('invalid_avatar') &&
  migration.includes('ADD COLUMN IF NOT EXISTS avatar_id'),
  'Saved portraits must have a validated persistence layer');
assert.ok(shell.includes('min-height:clamp(160px,17vw,225px)'),
  'The common city banner must be compact');
for(const [file,expected] of [
  ['WorkshopScene.svelte','height:clamp(535px,62vh,640px)'],
  ['MillhandWorkScene.svelte','height:clamp(535px,62vh,640px)'],
  ['MillhandMissingStampScene.svelte','height:clamp(610px,68vh,690px)'],
  ['MillhandDepotScene.svelte','height:clamp(565px,65vh,680px)'],
  ['MillhandContractsScene.svelte','height:clamp(565px,65vh,680px)'],
  ['MillhandRecordsScene.svelte','height:clamp(565px,65vh,680px)']
]){
  assert.ok(read('apps/web/src/lib/'+file).includes(expected),
    'Compact onboarding image height missing: '+file);
}
console.log('PASS: Continuous city masthead, larger responsive logo, owner copy, six full-bleed section backgrounds, logo placements, source privacy and entry checks.');
