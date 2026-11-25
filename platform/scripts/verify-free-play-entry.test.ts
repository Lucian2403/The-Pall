/** Structural contracts complement the real PostgreSQL end-to-end gate test.
 * Free Play entry and announcement must not enable ordinary gameplay. */
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

test('Acknowledgement is additive, idempotent and connected to the one-time UI',()=>{
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
 const modal=source('apps/web/src/lib/FreePlayAnnouncement.svelte');
 assert.ok(view.includes('access.announcementSeen===false'));
 assert.ok(view.includes('{#key character.id}'));
 assert.ok(view.includes('access={...access,announcementSeen:true}'));
 assert.ok(modal.includes("+'/free-play/announcement'"));
 assert.ok(modal.includes("method:'POST',headers:{'content-type':'application/json'},body:'{}'"));
 assert.ok(modal.includes('!response.ok||result.unlocked!==true||result.announcementSeen!==true'));
 assert.ok(modal.indexOf('result.announcementSeen!==true')<modal.indexOf('await onAcknowledged()'));
 assert.ok(modal.includes('dialog.showModal()'));
 assert.ok(modal.includes('oncancel={(event)=>event.preventDefault()}'));
 assert.ok(modal.includes('disabled={pending}'));
 for(const line of [
   "You're on your own now.",
   "Your introduction to Grand Cylinder City is over. You've finished your first jobs, dealt with your share of trouble, and finally have some control over what happens next.",
   "You have a place to sleep, but the rent is due. You'll need money, and nobody is going to hand it to you.",
   "There's paid work to find. You can develop your skills, learn trades, craft equipment, repair what you own, and take on more dangerous jobs when you're ready.",
   "Almost every action takes real time. Your equipment has limits. Poor preparation and bad decisions can cost you money, supplies, or your life.",
   "You decide what work to accept, where to go, and how much risk you're willing to take.",
   "Grand Cylinder City is open to you.",
   "Enter the City"
 ]){
  assert.ok(modal.includes(line),'Missing approved announcement copy: '+line);
 }
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
 assert.ok(shell.includes("character.tutorial.stage===1&&character.welcomeSeen===false"),
  'Stage I welcome cannot reappear over Free Play for older migrated saves');
 assert.ok(shell.includes("character.tutorial.stage === 8"));
 assert.ok(shell.includes("'/home'"));
 assert.ok(roster.includes("finished(character)?'/overview':''"));
 assert.ok(roster.includes("finished(character)?'Enter Free Play':'Select character'"));
 assert.ok(profile.includes("href:base+'/overview'"));
 assert.ok(profile.includes("href:base+'/home'"));
 assert.ok(sheet.includes('<CharacterHome {character}/>'));
});
