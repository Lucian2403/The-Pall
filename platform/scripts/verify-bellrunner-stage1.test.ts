import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {APPROVED_STAGE_ONE} from '../apps/web/src/lib/approved-stage-one.ts';

const root=resolve(import.meta.dirname,'..');
const source=(path:string)=>readFileSync(resolve(root,path),'utf8');

test('All five owner Bellrunner Stage 1 assets are committed in the correct format',()=>{
 for(const [path,size,hash] of [
  ['apps/web/static/characters/hector/hector-d-smoke.webp',147836,
   'fa487147016228c83e9bc56f1814dd30d9d0ede28dc579640bcee14aaef30472'],
  ['apps/web/static/locations/bellrunner/council-work.webp',123536,
   '380ec6217b88b9e332becd149202d5d3405e232538da748a215cec651faa600b'],
  ['apps/web/static/locations/bellrunner/sealed-order.webp',165508,
   '11da258832dcc720c788b0d974886463c9426c66804d8255eaf9fe65775059e9'],
  ['apps/web/static/locations/bellrunner/route-sheet.webp',161938,
   'e236c5cc07dd4125ea59dbe3149ea34bc06112b6533f42d0e2125472ae13efb2']
 ] as const){
  const file=resolve(root,path),data=readFileSync(file);
  assert.equal(statSync(file).size,size,path);
  assert.equal(data.toString('ascii',0,4),'RIFF',path);
  assert.equal(data.toString('ascii',8,12),'WEBP',path);
  assert.equal(createHash('sha256').update(data).digest('hex'),hash,path);
 }
 const file=resolve(root,'apps/web/static/audio/bellrunner/duty-bell.mp3');
 const audio=readFileSync(file);
 assert.equal(audio.byteLength,353607);
 assert.ok(audio.toString('ascii',0,3)==='ID3'||
   (audio[0]===0xff&&(audio[1]&0xe0)===0xe0));
 assert.equal(createHash('sha256').update(audio).digest('hex'),
   '542de89f165f46417023664b91d17a5eb2e535aaf48941b582d4e0984cd355e6');
});

test('Bellrunner uses the approved Stage 1 exchange without inventing mystery or optional NPC copy',()=>{
 const scene=APPROVED_STAGE_ONE.Bellrunner;
 assert.equal(scene.location,'Dispatch House');
 assert.equal(scene.npc,'Hector D. Smoke');
 assert.equal(scene.start,'setting');
 assert.equal(scene.nodes.setting.text,
  'Hector takes a bundle of council shift notices from the sorting shelf. A duty bell sounds across the hall.');
 assert.equal(scene.nodes.opening.text,
  "Council notices. That round should've gone with the last runners.");
 assert.deepEqual(scene.nodes.objection.choices?.map(x=>x.label),[
  "So they'll say I'm late.",'Continue'
 ]);
 assert.equal(scene.nodes.hectorReply.text,
  'I wrote down when you got them. They can come here if they want to argue.');
 assert.equal(scene.nodes.instructions.text,
  'Take the route sheet. Bring back the marks from whoever takes them.');
 assert.equal(scene.nodes.take.text,'Take the round');
 const sourceText=source('apps/web/src/lib/BellrunnerOpeningScene.svelte');
 assert.ok(sourceText.includes("new Audio('/audio/bellrunner/duty-bell.mp3')"));
 assert.ok(sourceText.includes('if(entered)return;'));
 assert.ok(sourceText.includes('onDestroy(()=>'));
 assert.ok(sourceText.includes('bell.pause()'));
 assert.ok(sourceText.includes('scene-action" onclick={begin}'));
 assert.ok(sourceText.includes('data-pall-sfx="paper"'));
 assert.ok(sourceText.includes('WorkshopItemPopover')&&
  sourceText.includes("import '$lib/workshop-object-labels.css'"));
 assert.ok(sourceText.includes('class="workshop bellrunner"')&&
  sourceText.includes('class="work-card dispatch-dialogue"')&&
  sourceText.includes('workshop-object-label')&&
  sourceText.includes('workshop-npc-label'));
 assert.ok(sourceText.includes('depot-foreground')&&
  sourceText.includes('clip-path:inset(70% 0 0 0)'),
  'Hector must be occluded by the original environment, like Guther');
 assert.ok(!sourceText.includes('paper-inspection')&&
  !sourceText.includes('object-label">'),
  'Bellrunner must not introduce its own popup or simple label style');
 for(const item of ['hector-d-smoke.webp','council-work.webp','sealed-order.webp','route-sheet.webp'])
  assert.ok(sourceText.includes(item));
 assert.ok(!sourceText.includes('NpcConversation')&&!sourceText.includes('Stage 3'));
 assert.ok(!sourceText.includes('unsafe-fume')&&!sourceText.includes('condemned'));
});

test('Stage 1 accept action is server-owned and Stage 2 is not silently simulated',()=>{
 const opening=source('apps/web/src/routes/characters/[id]/opening/+page.svelte');
 const stageTwo=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 const api=source('apps/api/src/bellrunner-dispatch-routes.ts');
 const registration=source('apps/api/src/index.ts');
 const home=source('apps/web/src/lib/CharacterHome.svelte');
 const shell=source('apps/web/src/lib/TutorialShell.svelte');
 const migration=source('db/migrations/0014_bellrunner_stage1.sql');
 const migrationScript=source('scripts/bellrunner-migrate.mjs');
 const pkg=source('package.json');
 assert.ok(opening.includes('<BellrunnerOpeningScene')&&
  opening.includes('takeRound={takeBellrunnerRound}'));
 assert.ok(opening.includes("depotBackdrop={character.origin==='Bellrunner'}"),
  'Dispatch House uses existing Depot ambience');
 assert.ok(stageTwo.includes('sceneLocation="Dispatch House" depotBackdrop'),
  'The accepted round keeps the same soundscape');
 assert.ok(stageTwo.includes('WorkshopItemPopover')&&
  stageTwo.includes('workshop-object-label')&&
  stageTwo.includes('class="work-card docket"'),
  'Stage 2 handoff must not invent another UI presentation');
 assert.ok(opening.includes("action:'take_round',expectedRevision:0"));
 assert.ok(opening.includes('pendingTakeRequestId??=crypto.randomUUID()'));
 assert.ok(api.includes('FOR UPDATE')&&
  api.includes('player_character_bellrunner_dispatch_receipts')&&
  api.includes("tutorial_stage=2,tutorial_status='IN_PROGRESS'"));
 assert.ok(api.includes("if(!session?.user.emailVerified)")&&
  api.includes("ch.rows[0].origin!=='Bellrunner'")&&
  api.includes("const hash=createHash('sha256')"));
 assert.ok(api.includes("return reply.code(409).send({error:'wrong_work_phase'})"));
 assert.ok(registration.includes('registerBellrunnerDispatchRoutes(api);'));
 assert.ok(migration.includes('CREATE TABLE IF NOT EXISTS player_character_bellrunner_dispatch'));
 assert.ok(migration.includes('PRIMARY KEY (character_id,request_id)'));
 assert.ok(migrationScript.includes('0014_bellrunner_stage1.sql'));
 assert.ok(pkg.includes('"bellrunner:migrate"'));
 assert.ok(home.includes("href:base+'/bellrunner/dispatch'"));
 assert.ok(shell.includes("'/bellrunner/dispatch'"));
 assert.ok(shell.includes("character.origin!=='Millhand'&&character.origin!=='Bellrunner'"));
 assert.ok(shell.includes('Back to Stage '));
 const rewind=source('apps/api/src/millhand-stage-rewind-routes.ts');
 assert.ok(rewind.includes("result.rows[0].origin==='Bellrunner'"));
 assert.ok(rewind.includes("if(bellrunner){"));
 assert.ok(rewind.includes('DELETE FROM player_character_bellrunner_dispatch_receipts'));
 assert.ok(rewind.includes("tutorial_stage=1,tutorial_status='NOT_STARTED'"));
 assert.ok(rewind.includes("route:'/characters/'+req.params.id+'/opening'"));
 assert.ok(stageTwo.includes('round.stage!==2||!round.accepted'));
 assert.ok(stageTwo.includes('are not implemented in this pass'));
 assert.ok(stageTwo.includes('No money, XP or equipment has been awarded.'));
 assert.ok(!stageTwo.includes('kind:\'finish\''));
});
