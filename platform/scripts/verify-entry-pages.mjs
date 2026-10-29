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
const htmlText=home.replace(/<\\/?(?:em|strong)>/g,'').replaceAll('&amp;','&');
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
  'class="story-section"','class="craft-section','class="economy-section',
  'class="exploration-section','class="principles-section','class="development-section'
]){
  assert.ok(home.includes(section),'Revised owner copy must be distributed by subject: '+section);
}
assert.ok(home.includes('github.com/Lucian2403/The-Pall/commits/main/') &&
  home.includes('/introduction') &&
  home.includes('In active development'),
  'Keep real development updates, public lore and unfinished-status notice');
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
console.log('PASS: Complete revised owner homepage copy across thematic sections, public lore, signup, roster, avatars and compact scenes.');
