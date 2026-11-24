import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {INITIAL_STITCHER,applyStitcherAction,stitcherActions,STITCHER_MAJOR,
 STITCHER_LINES,STITCHER_CLAUDIA_LINES,StitcherInvalidAction} from '../apps/api/src/stitcher-work.ts';
import {shouldShowClaudia} from '../apps/web/src/lib/stitcher-claudia-presence.ts';
import {stitcherUsesServiceCorridor,stitcherSceneEnvironment,STITCHER_SCENE_ART} from '../apps/web/src/lib/stitcher-scene-environment.ts';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const progress=(s:typeof INITIAL_STITCHER,actions:string[])=>
 actions.reduce((state,a)=>applyStitcherAction(state,a as Parameters<typeof applyStitcherAction>[1]),s);
function completedRound(){
 let s=progress(INITIAL_STITCHER,[
  'continue_intro','check_ward','begin_round',
  'inspect_a','inspect_b','order_bleeding','prep_cut',
  'dress_a','check_linen','trim_end','dress_b','inspect_finished',
  'record_linen','report_claudia','continue_report','continue_report',
  'close_round']);
 assert.equal(s.stage,3);
 return s;
}
test('Stage I Claudia approved optional linen exchange converges and Ward work accepts once',()=>{
 let start=INITIAL_STITCHER;
 assert.deepEqual(stitcherActions(start),['ask_linen','continue_intro']);
 let optional=progress(start,['ask_linen']);
 assert.equal(optional.introLine,1);
 optional=applyStitcherAction(optional,'continue_intro');
 assert.equal(optional.introLine,2);
 optional=applyStitcherAction(optional,'continue_intro');
 assert.equal(optional.introLine,3);
 assert.deepEqual(stitcherActions(optional),['check_ward']);
 const direct=applyStitcherAction(start,'continue_intro');
 assert.equal(direct.introLine,3);
 assert.equal(progress(direct,['check_ward','begin_round']).stage,2);
 assert.throws(()=>applyStitcherAction(start,'begin_round'),StitcherInvalidAction);
});
test('Both charity beds inspect, safe triage, dressing methods and correction preserve patient care',()=>{
 for(const first of ['order_bleeding','order_dirty'] as const)
 for(const prep of ['prep_cut','prep_ready'] as const)
 for(const fix of ['discard_end','trim_end'] as const){
  let s=progress(INITIAL_STITCHER,['continue_intro','check_ward','begin_round','inspect_b','inspect_a',
   first,prep,first==='order_bleeding'?'dress_a':'dress_b','check_linen',fix,
   first==='order_bleeding'?'dress_b':'dress_a','inspect_finished','record_linen',
   'report_claudia','continue_report','continue_report','close_round']);
  assert.equal(s.stage,3);
  assert.equal(s.treatedA,true);
  assert.equal(s.treatedB,true);
  assert.ok(['discard','trim'].includes(s.correction!));
  assert.equal(s.first,first==='order_bleeding'?'a':'b');
  assert.equal(s.prepared,prep==='prep_cut'?'cut':'ready');
  assert.deepEqual(stitcherActions(s),['observe_bed','read_chart']);
  assert.throws(()=>applyStitcherAction(s,'dress_a'),StitcherInvalidAction);
 }
});
test('Stage III bed hotspot, chart and testimony precede Claudia confrontation and exactly one branch',()=>{
 for(const branch of ['choose_trolley','choose_consent','choose_notes'] as const){
  let s=completedRound();
  s=progress(s,['observe_bed','ask_patient','ask_again','continue_patient','read_chart','confront_claudia']);
  assert.equal(s.stage,3);
  assert.equal(s.phase,'claudia');
  for(let i=0;i<STITCHER_CLAUDIA_LINES.length;i++)s=applyStitcherAction(s,'continue_claudia');
  assert.equal(s.phase,'choose');
  const after=applyStitcherAction(s,branch);
  assert.equal(after.stage,4);
  assert.equal(after.branch,branch==='choose_trolley'?'trolley':branch==='choose_consent'?'consent':'notes');
  assert.ok(STITCHER_MAJOR[after.branch!]&&STITCHER_LINES[after.branch!].length>=5);
  assert.throws(()=>applyStitcherAction(after,branch),StitcherInvalidAction,
   'A second Major Skill award cannot be triggered by replaying the choice');
 }
});
test('Stage IV three ordinary routes reach pending handoff without wages or early patient rescue',()=>{
 const routes=[
  ['choose_trolley',['check_load','balance_load','route_short','check_receiver']],
  ['choose_consent',['match_consent','check_medicine','bring_witness','mark_disputed']],
  ['choose_notes',['compare_admission','match_schedule','copy_pages','record_difference']]
 ] as const;
 for(const [chosen,steps] of routes){
  let s=progress(completedRound(),['observe_bed','read_chart','ask_patient','confront_claudia']);
  for(let i=0;i<STITCHER_CLAUDIA_LINES.length;i++)s=applyStitcherAction(s,'continue_claudia');
  s=applyStitcherAction(s,chosen);
  s=progress(s,['continue_opening','continue_opening',...steps]);
  assert.equal(s.phase,'dialogue');
  for(let i=0;i<STITCHER_LINES[s.branch!].length;i++)s=applyStitcherAction(s,'continue_dialogue');
  assert.equal(s.phase,'finish');
  s=applyStitcherAction(s,'finish_job');
  assert.equal(s.stage,5);assert.equal(s.phase,'exited');
  assert.deepEqual(stitcherActions(s),['ask_attendant']);
 }
});
test('Claudia appears only during her live exchanges in Stages I–IV',()=>{
 const sample=(stage:number,phase:string,dialogueLine=0,branch:string|null=null,started=true)=>
   shouldShowClaudia({stage,phase,branch,dialogueLine},started);
 assert.equal(sample(1,'intro'),true);
 assert.equal(sample(1,'intro',0,null,false),false);
 assert.equal(sample(1,'briefing'),false);
 // The Stage II linen report is a three-line *conversation*, not three
 // independent sprite appearances; she stays while YOU answer.
 for(const line of [0,1,2])assert.equal(sample(2,'report',line),true);
 for(const phase of ['inspect','order','prepare','care','linen_check','linen_fix',
   'verify','record','close'])assert.equal(sample(2,phase),false);
 // Claudia enters when called in Stage III, remains for the player's lines,
 // and delivers the final instruction before branch choice.
 for(const line of [0,1,2,3,4,5])assert.equal(sample(3,'claudia',line),true);
 assert.equal(sample(3,'choose'),true);
 assert.equal(sample(3,'discovery'),false);
 // If the selected Stage IV consent route reaches Claudia, show her for
 // both of her lines and the player's intervening response only.
 for(const line of [5,6,7])assert.equal(sample(4,'dialogue',line,'consent'),true);
 for(const line of [0,1,2,3,4,8])assert.equal(sample(4,'dialogue',line,'consent'),false);
 for(const branch of ['trolley','notes']){
   for(const line of [0,5,6,7])assert.equal(sample(4,'dialogue',line,branch),false);
 }
 assert.equal(sample(4,'work',6,'consent'),false);
 assert.equal(sample(5,'exited'),false);
 const scene=read('apps/web/src/lib/StitcherWardScene.svelte');
 assert.ok(scene.includes('shouldShowClaudia(s,snapshot.started)'));
 assert.ok(scene.includes('{#if claudiaVisible&&!claudiaArtMissing}'));
 assert.ok(!scene.includes('{#if s.stage===1&&!claudiaArtMissing&&snapshot.started}'));
});
test('Stitcher paints the owner-provided records room for Stage IV Commerce and Investigation',()=>{
 for(const [key,minBytes] of [['service-corridor.webp',40000],['notes-for-the-living-room.webp',100000]] as const){
   const image=readFileSync(new URL('../apps/web/static/locations/stitcher/'+key,import.meta.url));
   assert.ok(image.length>minBytes,'Require the supplied painting, not a placeholder: '+key);
   assert.equal(image.toString('ascii',0,4),'RIFF');
   assert.equal(image.toString('ascii',8,12),'WEBP');
 }
 for(const stage of [1,2,3])for(const branch of [null,'trolley','consent','notes'])
   assert.equal(stitcherSceneEnvironment(stage,branch),'ward');
 assert.equal(stitcherSceneEnvironment(4,null),'ward');
 assert.equal(stitcherSceneEnvironment(4,'trolley'),'corridor');
 assert.equal(stitcherSceneEnvironment(4,'consent'),'records');
 assert.equal(stitcherSceneEnvironment(4,'notes'),'records');
 for(const branch of [null,'trolley','consent','notes']){
   assert.equal(stitcherSceneEnvironment(5,branch),'corridor',
     'All Stage V branches rejoin at the Night Door corridor');
   assert.equal(stitcherUsesServiceCorridor(4,branch),branch==='trolley');
   assert.equal(stitcherUsesServiceCorridor(5,branch),true);
 }
 assert.equal(STITCHER_SCENE_ART.ward.image,'/locations/clinic/clinic-workshop-cold.webp');
 assert.equal(STITCHER_SCENE_ART.corridor.image,'/locations/stitcher/service-corridor.webp');
 assert.equal(STITCHER_SCENE_ART.records.image,'/locations/stitcher/notes-for-the-living-room.webp');
 assert.equal(STITCHER_SCENE_ART.records.place,'Infirmary records room');
 const scene=read('apps/web/src/lib/StitcherWardScene.svelte');
 const page=read('apps/web/src/routes/characters/[id]/stitcher/ward/+page.svelte');
 assert.ok(scene.includes('STITCHER_SCENE_ART[environment]'));
 assert.ok(scene.includes('stitcherSceneEnvironment(s.stage,s.branch,s.phase)'));
 assert.equal(stitcherSceneEnvironment(5,'consent','exited'),'ward');
 assert.equal(stitcherSceneEnvironment(5,'consent','hold'),'ward');
 assert.equal(stitcherSceneEnvironment(5,'consent','door'),'corridor');
 assert.equal(stitcherSceneEnvironment(4,'consent'),stitcherSceneEnvironment(4,'notes'),
   'Signed Consent and Notes for the Living must share the supplied records-office painting');
 assert.ok(scene.includes('src={sceneArt.image} alt={sceneArt.alt}'));
 assert.ok(scene.includes('{sceneArt.place}'));
 assert.ok(page.includes('STITCHER_SCENE_ART[stitcherSceneEnvironment(snapshot.state.stage,snapshot.state.branch,snapshot.state.phase)]'));
 assert.ok(page.includes('sceneLocation={sceneArt.place}'));
 assert.ok(page.includes('clinicBackdrop compactCityVista travelLocked'),
   'All three environments must retain the existing medical-clinic ambience');
 assert.ok(!page.includes('nightAlleyBackdrop'),
   'No alley ambience is to be introduced into Stage IV');
});
test('UI uses the exact existing frames, accessible background-bed hotspots and owner dialogue',()=>{
 const scene=read('apps/web/src/lib/StitcherWardScene.svelte');
 const page=read('apps/web/src/routes/characters/[id]/stitcher/ward/+page.svelte');
 const owner=read('apps/web/src/lib/pall-owner-ui.css');
 const shell=read('apps/web/src/lib/TutorialShell.svelte');
 const routes=read('apps/api/src/stitcher-ward-routes.ts');
 const rewind=read('apps/api/src/millhand-stage-rewind-routes.ts');
 const home=read('apps/web/src/lib/CharacterHome.svelte');
 const copy=read('apps/web/src/lib/stitcher-ward-copy.ts');
 assert.ok(page.includes('TutorialShell')&&page.includes('ActivityLayout')===false);
 assert.ok(scene.includes('<ActivityLayout mode="scene"'));
 assert.ok(scene.includes('class="ward-art pall-story-landscape"'));
 assert.ok(scene.includes('src={sceneArt.image} alt={sceneArt.alt}'));
 assert.ok(scene.includes('class="bed-hotspot bed-a"'));
 assert.ok(scene.includes('class="bed-hotspot bed-b"'));
 assert.ok(scene.includes('class="bed-hotspot teaching-bed"'));
 for(const label of ['Bed A','Bed B','Narrow Bed']){
  assert.ok(scene.includes('<span class="bed-label">'+label+'</span>'),
    'Visible hotspot label must remain: '+label);
 }
 assert.equal((scene.match(/class="bed-poi"/g)??[]).length,3,
   'All three bed targets must show one small POI');
 assert.ok(scene.includes('aria-hidden="true"></span><span class="bed-label"'),
   'The decorative POI must be hidden from screen readers');
 assert.ok(scene.includes('.bed-hotspot{position:absolute;display:flex;align-items:flex-end;justify-content:center;'));
 assert.ok(scene.includes('padding:0;border:0;border-radius:0;background:transparent;'));
 assert.ok(scene.includes('.bed-hotspot:focus-visible:not(:disabled) .bed-label'),
   'Keyboard focus must highlight the visible label, not outline the large hit area');
 assert.ok(!scene.includes('border:2px dashed'));
 assert.ok(!scene.includes('background:#f4d09842'));
 for(const hitbox of [
  '.bed-a{left:31%;top:42%;width:25%;height:22%}',
  '.bed-b{left:53%;top:38%;width:14%;height:20%}',
  '.teaching-bed{left:31%;top:42%;width:25%;height:22%}'
 ])assert.ok(scene.includes(hitbox),'Keep the original generous clickable bed hit zone');
 assert.ok(scene.includes('onclick={()=>act(allowed.includes('));
 assert.ok(scene.includes('title="Look at the Narrow Bed"'));
 assert.ok(scene.includes('aria-label="Examine the Narrow Bed'));
 assert.ok(scene.includes('SecondJobChoices'));
 assert.ok(scene.includes("SCENE_JOURNAL_CONTEXT"));
 assert.ok(scene.includes("CLAUDIA")&&scene.includes('I was asleep when they took my thumbprint.'));
 assert.ok(scene.includes('CHARITY ACCOUNT SETTLED — TEACHING DEMONSTRATION, DAWN.'));
 assert.ok(scene.includes("Who's paying for the fever ward's coal if I turn them away? You?"));
 assert.ok(owner.includes("url('/ui-kit/frames/dialogue-frame-trim.png')"));
 assert.ok(owner.includes("url('/ui-kit/buttons/button-normal-trim.png')"));
 assert.ok(page.includes('clinicBackdrop'));
 assert.ok(routes.includes('STITCHER_MAJOR[next.branch]'));
 assert.ok(routes.includes('player_character_stitcher_ward_receipts'));
 assert.ok(routes.includes("ch.tutorial_status==='IN_PROGRESS'"));
 assert.ok(routes.includes("saved.state.stage===5&&saved.state.phase==='exited'"),
   'Only legacy paused Stage V saves may resume from NOT_STARTED');
 assert.ok(routes.includes('FOR UPDATE'));
 assert.ok(rewind.includes("if(result.rows[0].origin==='Stitcher')"));
 assert.ok(rewind.includes("if(c.rows[0].origin==='Stitcher'&&expectedStage!==8)"));
 assert.ok(rewind.includes('DELETE FROM player_character_stitcher_ward_receipts'));
 assert.ok(shell.includes("character.origin!=='Stitcher'"));
 assert.ok(home.includes("character.origin==='Stitcher'"));
 assert.ok(copy.includes('The Night Trolley')&&copy.includes('The Signed Consent')&&copy.includes('Notes for the Living'));
 assert.ok(!scene.includes('/locations/stitcher/teaching-bed-patient'));
});
