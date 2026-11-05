import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const modal=read('apps/web/src/lib/WelcomeToThePall.svelte');
const shell=read('apps/web/src/lib/TutorialShell.svelte');
const backgrounds=read('apps/web/src/routes/backgrounds/+page.svelte');
const api=read('apps/api/src/character-routes.ts');
const migration=read('db/migrations/0009_character_welcome.sql');
const migrator=read('scripts/characters-migrate.mjs');
const postgres=read('scripts/verify-stage6-postgres.integration.test.ts');

// Owner wording is authoritative; no alternate paraphrases or new promises.
for(const line of [
  'WELCOME TO THE PALL',
  'YOUR STORY BEGINS HERE',
  "You've created your character and chosen your background. This decides where your journey begins, the people you'll meet, and the kind of work you'll face first. It gives you an advantage in a specific skill, but it won't decide who you'll become.",
  "Your first steps won't be easy. You'll meet people, face trouble, and make choices that can develop other skills and shape your path.",
  "First, you must complete your background's <strong>story stages</strong>. The rest of the game remains locked until you've finished them.",
  "Once you've completed the introduction, the wider world of The Pall opens up. What you do next is up to you.",
  'Begin Your Story'
]){
  assert.ok(modal.includes(line),'Welcome copy has drifted: '+line.slice(0,55));
}
// Owner visual correction: all letterpress copy is bold, and the existing
// nine-slice image provides the parchment fill without pale corner rectangles.
assert.ok(modal.includes('color:#302015;background:transparent;') &&
  !modal.includes('background:#e5d0aa;') &&
  modal.includes('border-image-slice:145 190 125 190 fill;') &&
  modal.includes('welcome-copy p{margin:0 0 13px;font:700') &&
  modal.includes('welcome-error{font:700') &&
  modal.includes('welcome-inner h1{font:700') &&
  modal.includes('welcome-inner h2{font:700') &&
  modal.includes('font:700 17px/1.25'),
  'The framed Welcome must have transparent corners and bold copy on every line');

assert.ok(modal.includes('<dialog')&&modal.includes('dialog.showModal()')&&
  modal.includes('oncancel={(event)=>event.preventDefault()}')&&
  modal.includes('dialog.open)dialog.close()')&&
  !modal.includes('method="dialog"')&&!modal.includes('localStorage')&&
  modal.includes('aria-labelledby="welcome-title"')&&
  modal.includes('aria-describedby="welcome-subtitle"'),
  'Use real, accessible, uncancellable modal semantics; no bypass or local storage');
assert.ok(modal.includes("if(!response.ok||result.welcomeSeen!==true)")&&
  modal.includes('await onStarted()')&&
  modal.includes('disabled={pending}')&&
  modal.includes("role=\"alert\"")&&
  modal.includes("body:'{}'"),
  'Only a successful server acknowledgement may dismiss the welcome; errors leave it up');
assert.ok(shell.includes('welcomeSeen?:boolean')&&
  shell.includes('character.welcomeSeen===false&&!welcomedThisMount')&&
  shell.includes('<WelcomeToThePall characterId={character.id} onStarted={beginWelcomeStory}/>')&&
  shell.includes("'/characters/'+encodeURIComponent(character.id)+'/opening'"),
  'Any saved character at first entry must be blocked until Begin, then start Stage 1');
assert.ok(backgrounds.includes("await goto('/characters/'+encodeURIComponent(body.character.id)+'/opening')")&&
  !backgrounds.includes("await goto('/characters');"),
  'New characters must enter their own Stage 1, not go back to the roster');
assert.ok(api.includes('welcome_seen_at')&&
  api.includes('welcomeSeen:row.welcome_seen_at!==null')&&
  api.includes("'/api/characters/:id/welcome'")&&
  api.includes("COALESCE(welcome_seen_at,NOW())")&&
  api.includes('id=$1 AND account_id=$2')&&
  api.includes("'/api/characters/:id/dev/reset-welcome'")&&
  api.includes("process.env.NODE_ENV!=='production'")&&
  api.includes("SET welcome_seen_at=NULL"),
  'A character-owned, idempotent acknowledgement and explicit dev-only reset are required');
assert.ok(migration.includes('ADD COLUMN welcome_seen_at TIMESTAMPTZ')&&
  migration.includes('IF NOT EXISTS (')&&
  migration.includes('SET welcome_seen_at=created_at')&&
  migration.includes('information_schema.columns')&&
  migrator.includes('0009_character_welcome.sql')&&
  postgres.includes('0009_character_welcome.sql'),
  'One-time backfill must protect old characters without auto-acknowledging new ones on migration re-run');
console.log('PASS: Exact welcome text, blocking dialog, server-owned per-character idempotent state, dev reset, handoff and backfill.');
