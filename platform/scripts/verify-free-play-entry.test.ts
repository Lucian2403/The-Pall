/** Structural contracts complement the real PostgreSQL end-to-end gate test.
 * This PR deliberately adds no ordinary gameplay or announcement modal. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const source=(path:string)=>readFileSync(resolve(root,path),'utf8');

test('One Free Play gate checks the actual Stage VIII saved ending',()=>{
 const api=source('apps/api/src/free-play-routes.ts');
 const boot=source('apps/api/src/index.ts');
 const home=source('apps/api/src/tutorial-home-routes.ts');
 assert.ok(boot.includes("registerFreePlayRoutes(api)"));
 for(const element of [
  "tutorial_stage===8","tutorial_status==='COMPLETED'",
  "home_phase==='COMPLETE'","home_id===HOME_ID",
  "home_origin===row.origin","isPlayableCharacterOrigin",
  "WHERE c.id=$1 AND c.account_id=$2",
  "reply.code(409).send({error:'free_play_not_unlocked'})",
  "reply.code(404).send({error:'not_found'})",
  "reply.code(401).send({error:'unauthorized'})",
  "reply.header('Cache-Control','no-store')"
 ]) assert.ok(api.includes(element),'Missing Free Play access rule: '+element);
 assert.ok(!api.includes("coins=coins+"));
 assert.ok(!api.includes("ordinaryXp"));
 assert.ok(!api.includes("UPDATE player_character_tutorial_home"),
  'The gate must never rewrite the approved ending');
 assert.ok(home.includes("state.phase==='COMPLETE'&&old.phase!=='COMPLETE'"));
 assert.ok(home.includes("UPDATE player_characters SET tutorial_status='COMPLETED'"));
});

test('Acknowledgement is additive, idempotent and intentionally unconnected to UI for now',()=>{
 const api=source('apps/api/src/free-play-routes.ts');
 const schema=source('db/migrations/0024_free_play_entry.sql');
 const migrate=source('scripts/free-play-migrate.mjs');
 const packageJson=source('package.json');
 const view=source('apps/web/src/routes/characters/[id]/overview/+page.svelte');
 assert.ok(schema.includes('ADD COLUMN IF NOT EXISTS free_play_intro_seen_at TIMESTAMPTZ'));
 assert.ok(schema.includes('ALTER TABLE player_characters'));
 assert.ok(api.includes('FOR UPDATE OF c'));
 assert.ok(api.includes('COALESCE(free_play_intro_seen_at,NOW())'));
 assert.ok(api.includes("base+'/announcement'"));
 assert.ok(api.includes("Object.keys(req.body).length!==0"));
 assert.ok(api.includes("req.headers.origin"));
 assert.ok(migrate.includes('BEGIN')&&migrate.includes('COMMIT')&&migrate.includes('ROLLBACK'));
 assert.ok(packageJson.includes('"free-play:migrate"'));
 assert.ok(!view.includes("'/announcement'"),
  'The approved one-time announcement itself belongs in Step 2');
});

test('Completed characters enter a new overview without changing the physical rented room',()=>{
 const overview=source('apps/web/src/routes/characters/[id]/overview/+page.svelte');
 const stage8=source('apps/web/src/routes/characters/[id]/home/+page.svelte');
 const shell=source('apps/web/src/lib/TutorialShell.svelte');
 const roster=source('apps/web/src/routes/characters/+page.svelte');
 const sheet=source('apps/web/src/routes/characters/[id]/+page.svelte');
 const profile=source('apps/web/src/lib/CharacterHome.svelte');
 assert.ok(overview.includes("fetch(base+'/free-play',{cache:'no-store'})"));
 assert.ok(overview.includes('status=\'locked\''));
 assert.ok(overview.includes('activePage="overview"'));
 assert.ok(overview.includes("href={href+'/home'}"));
 assert.ok(overview.includes('paid jobs and timed activities are not yet available'));
 assert.ok(!overview.includes('requestId:'));
 assert.ok(!overview.includes("coins=coins+"));
 assert.ok(stage8.includes("home.phase==='COMPLETE'"));
 assert.ok(stage8.includes('Continue to Free Play'));
 assert.ok(stage8.includes("perform('finish')"));
 assert.ok(stage8.includes("home.noticeText")&&stage8.includes("home.closingSpeech"));
 assert.ok(shell.includes("href={detail+'/overview'}"));
 assert.ok(shell.includes("character.tutorial.stage === 8"));
 assert.ok(shell.includes("'/home'"));
 assert.ok(roster.includes("finished(character)?'/overview':''"));
 assert.ok(roster.includes("finished(character)?'Enter Free Play':'Select character'"));
 assert.ok(profile.includes("href:base+'/overview'"));
 assert.ok(profile.includes("href:base+'/home'"));
 assert.ok(sheet.includes('<CharacterHome {character}/>'));
});
