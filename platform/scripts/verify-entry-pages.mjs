import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=(p)=>readFileSync(resolve(root,p),'utf8');
const intro=read('apps/web/src/routes/introduction/+page.svelte');
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
for(const page of [intro,roster,backgrounds]){
  assert.ok(page.includes('pall-entry-pages.css') &&
    page.includes('/ui-kit/branding/logo-compact.png'),
    'Every entry page must retain the owner logo and shared typography');
}
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
console.log('PASS: Intro, roster, backgrounds, owner avatar selection, guarded character deletion and compact scenes.');
