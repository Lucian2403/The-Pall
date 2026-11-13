import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {APPROVED_STAGE_ONE} from '../apps/web/src/lib/approved-stage-one.ts';
import {APPROVED_HECTOR_TOPICS} from '../apps/web/src/lib/approved-bellrunner-hector.ts';
import {INITIAL_DISPATCH_STATE,applyDispatchAction,InvalidDispatchAction,
  type DispatchState,type DispatchWorkAction} from '../apps/api/src/bellrunner-dispatch-work.ts';
import {BELLRUNNER_ROUTE_NARRATION,BELLRUNNER_RECEIVING_ARRIVAL,
  BELLRUNNER_RECEIVER_OPENING,BELLRUNNER_RECEIVER_RESOLUTIONS}
  from '../apps/web/src/lib/bellrunner-stage2-narrative.ts';

const root=resolve(import.meta.dirname,'..');
const source=(path:string)=>readFileSync(resolve(root,path),'utf8');

test('Original owner artwork and duty-bell binary remain unchanged',()=>{
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
  const data=readFileSync(resolve(root,path));
  assert.equal(statSync(resolve(root,path)).size,size,path);
  assert.equal(data.toString('ascii',0,4),'RIFF',path);
  assert.equal(data.toString('ascii',8,12),'WEBP',path);
  assert.equal(createHash('sha256').update(data).digest('hex'),hash,path);
 }
 const audio=readFileSync(resolve(root,'apps/web/static/audio/bellrunner/duty-bell.mp3'));
 assert.equal(audio.byteLength,353607);
 assert.ok(audio.toString('ascii',0,3)==='ID3'||(audio[0]===0xff&&(audio[1]&0xe0)===0xe0));
 assert.equal(createHash('sha256').update(audio).digest('hex'),
  '542de89f165f46417023664b91d17a5eb2e535aaf48941b582d4e0984cd355e6');
});

test('Owner-provided multi-purpose Hauling scenes keep their source art and use one reusable book hotspot',()=>{
 const scenes=[
  ['apps/web/static/locations/hauling/grand-cylinder-main-street.webp',191450,
   '1a873065050d48188cdac727ce8eb6f0f415ebd22b49ef12215cd261eb6d037d'],
  ['apps/web/static/locations/hauling/freight-yard-backstreet.webp',215132,
   '873aa02b31dc70b3330cae3c81e327e1b11e2ce5e3bd6728cc30581de33ff7a3'],
  ['apps/web/static/locations/hauling/municipal-receiving-desk.webp',184528,
   '0aff66e035e13f39a3787c97ae7739cdc6b3f9267d7d816fd6a07c50cad4ca5d']
 ] as const;
 for(const [path,size,hash] of scenes){
  const bytes=readFileSync(resolve(root,path));
  assert.equal(bytes.length,size,path);
  assert.equal(bytes.toString('ascii',0,4),'RIFF',path);
  assert.equal(bytes.toString('ascii',8,12),'WEBP',path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),hash,path);
 }
 const mapping=source('apps/web/src/lib/hauling-scenes.ts');
 for(const id of ['depot','short_route','long_route','receiving_desk'])
  assert.ok(mapping.includes('  '+id+':{'),id);
 assert.ok(mapping.includes('municipal-receiving-desk.webp'));
 assert.ok(mapping.includes('RECEIVING_BOOK_HOTSPOT'));
 const book=source('apps/web/src/lib/HaulingReceivingBookHotspot.svelte');
 assert.ok(book.includes('RECEIVING_BOOK_HOTSPOT'));
 assert.ok(book.includes('data-workshop-object'));
 assert.ok(book.includes('workshop-object-label'));
 assert.ok(book.includes('onInspect'));
 assert.ok(!book.includes('fetch('),'Book is an interaction prop, not a job-specific API');
 assert.ok(!book.includes('<img'),'The receiving book is already painted into the office');
});

test('Bellrunner scenes use the shared container-driven scene layout: art, dialogue, documents',()=>{
 const first=source('apps/web/src/lib/BellrunnerOpeningScene.svelte');
 const second=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 const shared=source('apps/web/src/lib/pall-story-landscape.css');
 const tray=source('apps/web/src/lib/BellrunnerDocumentTray.svelte');
 const layout=source('apps/web/src/lib/ActivityLayout.svelte');
 for(const component of [first,second]){
  assert.ok(component.includes("import '$lib/pall-story-landscape.css'"));
  assert.ok(component.includes('pall-story-sections'));
  assert.ok(component.includes('pall-story-visuals'));
  assert.ok(component.includes('pall-story-landscape'));
  assert.ok(component.includes('pall-story-dialogue-section'));
  assert.ok(component.includes('BellrunnerDocumentTray'));
  assert.ok(component.includes('<ActivityLayout mode="scene"')&&
   component.includes('stageAspect={1672/941}'),
   'Both Bellrunner stages use the shared scene-mode primitive');
  assert.ok(!component.includes('min-height:100%'),
   'The parchment grows with its content instead of stretching to the art column');
  assert.ok(!component.includes('height:clamp(535px,62vh,640px)'));
  assert.ok(!component.includes('width:max(100cqw,177.7cqh)'));
  assert.ok(!component.includes('WorkshopItemPopover'),
   'Inspection descriptions belong in the right-hand parchment');
 }
 assert.ok(first.includes('class="scene-visuals pall-story-visuals"'));
 assert.ok(first.includes('class="scene-illustration pall-story-landscape"'));
 assert.ok(first.includes('<BellrunnerDocumentTray {papers} onChoose={usePaper}'));
 assert.ok(first.includes('routeReady={beat.kind===\'handoff\'}'));
 assert.ok(second.includes('class="scene-visuals pall-story-visuals"'));
 assert.ok(second.includes('<BellrunnerDocumentTray papers={docs}'));
 assert.ok(second.includes("{#if sceneKey==='depot'}"));
 assert.ok(second.includes("supplement={sceneKey==='depot'?depotPapers:undefined}"),
  'Only the Depot has a document supplement');
 assert.ok(second.includes('class="illustration pall-story-landscape"'));
 // Placement is decided by the activity container's measured width.
 assert.ok(layout.includes('container:activity / inline-size'));
 assert.ok(layout.includes('@container activity (min-width:880px)'));
 assert.ok(layout.includes('grid-template-areas:"stage panel" "stage supplement"'),
  'Wide: art left; dialogue and its documents share the reading column');
 assert.ok(layout.includes('grid-template-areas:"stage" "panel" "supplement"'),
  'Narrow: art, then dialogue, then documents');
 assert.ok(layout.includes('justify-content:center'),
  'Ultrawide leftovers become symmetrical gutters, not a strip on one side');
 assert.ok(shared.includes('.pall-story-visuals{'));
 assert.ok(shared.includes('.pall-story-dialogue-section{'));
 assert.ok(!shared.includes('@media(max-width:1160px)')&&
  !shared.includes('grid-template-columns:minmax(0,52fr) minmax(0,48fr)'),
  'No window-width stacking breakpoint or fixed 52/48 split');
 const shell=source('apps/web/src/lib/TutorialShell.svelte');
 const openingRoute=source('apps/web/src/routes/characters/[id]/opening/+page.svelte');
 assert.ok(shell.includes('compactBanner = false'));
 assert.ok(shell.includes('{#if !compactBanner}'));
 assert.ok(!openingRoute.includes("compactBanner={character.origin==='Bellrunner'}"),
  'Do not hide the Bellrunner City header');
 assert.ok(!second.includes('compactBanner>'),
  'Do not hide the City header at the Receiving Desk');
 assert.ok(openingRoute.includes("compactCityVista={character.origin==='Bellrunner'}"),
  'Stage 1 must preserve a slim City header above the working scene');
 assert.ok(second.includes('compactCityVista>'),
  'Stage 2 must preserve the same slim City header on all locations');
 assert.ok(shell.includes('compactCityVista = false'));
 assert.ok(shell.includes('class:city-banner-workstation={compactCityVista}'));
 assert.ok(shell.includes('.city-banner.city-banner-workstation{'),
  'Reuse the original city skyline at reduced height, not a replacement graphic');

 assert.ok(!shared.includes('grid-template-columns:minmax(0,60%)'));
 assert.ok(shared.includes('--dialogue-text:17px')&&shared.includes('--dialogue-title:21px'),
  'One fixed Bellrunner reading scale');
 const hector=source('apps/web/src/lib/BellrunnerHectorConversation.svelte');
 for(const [name,code] of [['Stage 1',first],['Stage 2',second],['Hector conversation',hector]]){
  const css=code.slice(code.indexOf('<style>'));
  assert.ok(css.includes('var(--dialogue-text,17px)'),name+' dialogue uses the shared reading size');
  assert.ok(!/\.(speech|narration|work-description|story|spoken|inner-voice)[^{]*\{[^}]*clamp\(/.test(css),
   name+' dialogue text must not scale with the window: every line is the same size');
 }
 assert.ok(!shared.includes('flex-direction:column;\n  flex:0 0 auto;\n  width:100%'),
  'The entire desktop work area must not become one tall column');
 assert.ok(tray.includes('Round Documents'));
 assert.ok(tray.includes('document-grid'));
 assert.ok(tray.includes('class="document-card"'));
});

test('Bellrunner secondary parchment buttons follow the reference with icon and accessible text',()=>{
 const css=source('apps/web/src/lib/pall-story-landscape.css');
 const icon=source('apps/web/src/lib/BellrunnerChoiceIcon.svelte');
 const opening=source('apps/web/src/lib/BellrunnerOpeningScene.svelte');
 const hector=source('apps/web/src/lib/BellrunnerHectorConversation.svelte');
 const stage2=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 assert.ok(css.includes(':is(button,a).secondary-choice'));
 assert.ok(css.includes('background:linear-gradient(180deg,#fff1d6'));
 assert.ok(css.includes('border:2px solid #684323'));
 assert.ok(css.includes(':is(button,a).primary-choice'));
 assert.ok(css.includes("border-image-source:url('/ui-kit/buttons/button-normal-trim.png')"));
 assert.ok(css.includes('outline:3px solid #f1c27b'));
 assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
 for(const scene of [opening,stage2,hector]){
  assert.ok(scene.includes('BellrunnerChoiceIcon'));
  assert.ok(scene.includes('class="secondary-choice"'));
  assert.ok(scene.includes('class="primary-choice"'));
 }
 assert.ok(opening.includes('<BellrunnerChoiceIcon kind="chat"/>Ask Hector something'));
 assert.ok(hector.includes("option.id==='routes'?'route'"));
 assert.ok(stage2.includes('<BellrunnerChoiceIcon kind="route"/>Take the Short Route'));
 assert.ok(stage2.includes('<BellrunnerChoiceIcon kind="route"/>Take the Long Route'));
 assert.ok(stage2.includes('<BellrunnerChoiceIcon kind="book"/>Check their receiving book'));
 assert.ok(icon.includes('aria-hidden="true"')&&icon.includes('focusable="false"'));
 assert.ok(!css.includes('pointer-events:none;\n  background:#fff1d6'),
  'Button surface must remain a real interactive element');
});

test('Three owner document assets are complete native click targets, not decorative overlays',()=>{
 const tray=source('apps/web/src/lib/BellrunnerDocumentTray.svelte');
 const opening=source('apps/web/src/lib/BellrunnerOpeningScene.svelte');
 const stage2=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 assert.ok(tray.includes("const keys=['notices','sealed','route']"));
 assert.ok(tray.includes('{#each keys as key (key)}'));
 assert.ok(tray.includes('data-workshop-object data-pall-sfx="paper"'));
 assert.ok(tray.includes('aria-label={routeReady&&key===\'route\''));
 assert.ok(tray.includes('aria-pressed={routeReady&&key===\'route\'?undefined:selected===key}'));
 assert.ok(tray.includes('disabled={busy&&key===\'route\'&&routeReady}'));
 assert.ok(tray.includes('onclick={()=>onChoose(key)}'));
 assert.ok(tray.includes('src={papers[key].src}'));
 assert.ok(tray.includes('workshop-object-label'));
 assert.ok(tray.includes('Take Route Sheet')&&tray.includes('Inspect'));
 for(const sourceCode of [opening,stage2]){
  assert.ok(!sourceCode.includes('paper-art'));
  assert.ok(!sourceCode.includes('paper-target'));
  assert.ok(sourceCode.includes('class="npc-hotspot"'),
   'Hector remains clickable inside the illustrated left panel');
 }
 assert.ok(stage2.includes('<BellrunnerDocumentTray papers={docs}'));
 assert.ok(stage2.includes('onChoose={(key)=>{'));
 assert.ok(!stage2.includes('counter-target')&&!stage2.includes('counter-prop'));
 assert.ok(!stage2.includes('HaulingReceivingBookHotspot'));
});

test('Hector stage has legible dialogue hierarchy, an accessible previous control and no fake rewards',()=>{
 const opening=source('apps/web/src/lib/BellrunnerOpeningScene.svelte');
 const hector=source('apps/web/src/lib/BellrunnerHectorConversation.svelte');
 const shared=source('apps/web/src/lib/pall-story-landscape.css');
 assert.ok(opening.includes('<BellrunnerHectorConversation'));
 assert.ok(opening.includes('{papers[selected].observation}'));
 assert.ok(opening.includes('class="dialogue-body"'));
 assert.ok(opening.includes('class="dialogue-navigation"'));
 assert.ok(opening.includes('Previous line'));
 assert.ok(opening.includes('margin-top:auto'),
  'Previous line belongs at the foot of the parchment, not among the main choices');
 assert.ok(opening.includes('class="primary-choice"'));
 assert.ok(hector.includes('class="primary-choice"'));
 assert.ok(shared.includes(':is(button,a).primary-choice'));
 assert.ok(shared.includes("border-image-source:url('/ui-kit/buttons/button-normal-trim.png')")&&
  shared.includes("border-image-source:url('/ui-kit/buttons/button-hover-trim.png')"),
  'Primary continuation actions must use the same Millhand owner artwork on all origins');
 assert.ok(opening.includes('max-width:980px'));
 assert.ok(opening.includes('max-height:none;overflow:visible'));
 assert.ok(!opening.includes('Payment: Not yet cleared'));
 assert.ok(!hector.includes('rewardXp(')&&!hector.includes('takeRound('));
 assert.ok(hector.includes('“{currentLine.text}”'),
  'Preserve the owner-authored Hector lines verbatim');
});

test('Both road scenes and receiving desk use the same layout without spawning new props or NPCs',()=>{
 const ui=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 const shared=source('apps/web/src/lib/pall-story-landscape.css');
 assert.ok(ui.includes("sceneKey==='depot'"));
 assert.ok(ui.includes('HAULING_SCENES[sceneKey].src'));
 assert.ok(ui.includes('.art-scaled>.environment{object-fit:contain}'));
 assert.ok(ui.includes('class="scene-visuals pall-story-visuals"'));
 assert.ok(ui.includes('class="dialogue-section pall-story-dialogue-section"'));
 assert.ok(ui.includes('max-width:980px'));
 assert.ok(ui.includes('max-height:none;overflow:visible'));
 assert.ok(ui.includes("depotBackdrop={sceneKey==='depot'}"));
 assert.ok(ui.includes("perform('check_receiving_book')"),
  'Receipt book remains a dialogue choice, not a scenery hotspot');
 assert.ok(ui.includes("perform('take_final_notice')"));
 assert.ok(!ui.includes('WorkshopItemPopover'));
 assert.ok(!ui.includes('counter-target'));
 assert.ok(!ui.includes('HaulingReceivingBookHotspot'));
 assert.ok(!ui.includes('src="/characters/receiver'));
 assert.ok(shared.includes('aspect-ratio:1672 / 941'));
});

test('Stage 1 Route Sheet remains the sole authenticated handoff action',()=>{
 const scene=source('apps/web/src/lib/BellrunnerOpeningScene.svelte');
 const tray=source('apps/web/src/lib/BellrunnerDocumentTray.svelte');
 const opening=source('apps/web/src/routes/characters/[id]/opening/+page.svelte');
 assert.ok(scene.includes("item==='route'&&beat.kind==='handoff'"));
 assert.ok(scene.includes('if(!takingRound)void takeRound()'));
 assert.ok(scene.includes('onChoose={usePaper}'));
 assert.ok(scene.includes('routeReady={beat.kind===\'handoff\'}'));
 assert.ok(tray.includes('Take the Route Sheet to begin Shift Dispatch'));
 assert.ok(tray.includes('Take Route Sheet'));
 assert.ok(scene.includes('<h2>Take the Route Sheet</h2>'));
 assert.ok(scene.includes('The Route Sheet is ready with the round documents.'));
 assert.ok(!scene.includes('Click it on the counter'),
  'Guidance must refer to the document tray, not the old floating counter prop');
 assert.ok(opening.includes('takeRound={takeBellrunnerRound}'));
 assert.ok(opening.includes("action:'take_round',expectedRevision:0"));
 assert.ok(!scene.includes('onclick={()=>{void takeRound();}}'));
 assert.ok(!scene.includes('>Take the round</button>'));
 const handoff=scene.slice(scene.indexOf("{:else if beat.kind==='handoff'}"),
   scene.indexOf('</aside>'));
 assert.ok(handoff.includes("beat.kind!=='handoff'"));
 assert.ok(handoff.includes('Previous line'));
 for(const text of [scene,
  source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte')]){
  assert.ok(!text.includes('Payment: Not yet cleared'));
  assert.ok(!text.includes('Payment: {round.payment}'));
  assert.ok(!text.includes('class="payment"'));
 }
});

test('The exact owner-replaced opening is sequential and canon-matched',()=>{
 const scene=APPROVED_STAGE_ONE.Bellrunner;
 const doc=source('../docs/05-gameplay/onboarding/bellrunner/opening-dialogue.md');
 assert.equal(scene.location,'Dispatch House');
 assert.equal(scene.npc,'Hector D. Smoke');
 assert.equal(scene.start,'setting');
 const path=['setting','opening','playerObjection','hectorReply','routeNarration','instructions','take'];
 for(let i=0;i<path.length;i++){
  const node=scene.nodes[path[i]];
  assert.ok(node, 'Missing '+path[i]);
  assert.ok(doc.includes(node.text), 'Canon mismatch in '+path[i]);
  assert.equal(node.next,path[i+1]);
 }
 assert.equal(scene.nodes.opening.text,
  "There you are. Got another round for you. Council notices. Should've gone out with the last lot, but here they are.");
 assert.equal(scene.nodes.playerObjection.text,"So they'll say I'm late, then.");
 assert.equal(scene.nodes.playerObjection.speaker,'Player');
 assert.equal(scene.nodes.hectorReply.text,
  "Let 'em. I've written down when I gave you the bloody things. They want to complain, they know where to find me.");
 assert.equal(scene.nodes.instructions.text,
  "Here's your route. Get a mark from whoever takes each notice. And don't lose the sheet. I need it back.");
 assert.equal(scene.nodes.take.kind,'handoff');
 assert.equal(scene.nodes.take.text,'Take the Route Sheet');
 assert.ok(!scene.nodes.objection,'Old optional objection is superseded by the new script');
});

test('All six optional topics preserve every spoken turn and never grant rewards',()=>{
 const doc=source('../docs/05-gameplay/onboarding/bellrunner/opening-dialogue.md');
 assert.deepEqual(APPROVED_HECTOR_TOPICS.map(x=>x.label),[
  'About the work','About the receiving marks','About the routes',
  'About the payment','About Grand Cylinder City','About the Plume and the Pall'
 ]);
 assert.deepEqual(APPROVED_HECTOR_TOPICS.map(x=>x.lines.length),[4,4,4,4,6,8]);
 for(const topic of APPROVED_HECTOR_TOPICS){
  assert.ok(doc.includes(topic.label));
  for(const [i,line] of topic.lines.entries()){
    assert.equal(line.speaker,i%2===0?'Player':'Hector');
    assert.ok(doc.includes(line.text),topic.id+' missing exact line '+i);
    assert.ok(line.text.length>8);
  }
 }
 const scene=source('apps/web/src/lib/BellrunnerOpeningScene.svelte');
 const conversation=source('apps/web/src/lib/BellrunnerHectorConversation.svelte');
 assert.ok(scene.includes('<BellrunnerHectorConversation'));
 assert.ok(scene.includes('onclick={askHector}'));
 assert.ok(scene.includes('function returnToRound(){talking=false;}'));
 assert.ok(conversation.includes('currentTopic?.lines[lineIndex]'));
 assert.ok(conversation.includes('onclick={()=>{lineIndex+=1;}}'));
 assert.ok(conversation.includes('lineIndex<currentTopic.lines.length-1'));
 assert.ok(conversation.includes('Ask something else'));
 assert.ok(conversation.includes('Return to the round'));
 assert.ok(conversation.includes('onclick={returnToRound}'));
 assert.ok(conversation.includes('“{currentLine.text}”'));
 assert.equal((conversation.match(/“\{currentLine.text\}”/g)??[]).length,1,
  'Every selected topic turn is rendered once, not duplicated or skipped');
 assert.ok(!conversation.includes('takeRound(')&&!conversation.includes('fetch('));
 assert.ok(!scene.includes('skipToWork')&&!conversation.includes('rewardXp('));
});

test('Hector, document cards and original UI/audio remain consistent',()=>{
 const scene=source('apps/web/src/lib/BellrunnerOpeningScene.svelte');
 const stage2=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 const opening=source('apps/web/src/routes/characters/[id]/opening/+page.svelte');
 const shell=source('apps/web/src/lib/TutorialShell.svelte');
 assert.ok(scene.includes("new Audio('/audio/bellrunner/duty-bell.mp3')"));
 assert.ok(scene.includes('if(entered)return;')&&scene.includes('bell.pause()'));
 assert.ok(scene.includes('class="workshop bellrunner"'));
 assert.ok(scene.includes('class="work-card dispatch-dialogue"'));
 assert.ok(!scene.includes('WorkshopItemPopover')&&
  scene.includes("import '$lib/workshop-object-labels.css'"));
 assert.ok(scene.includes('DISPATCH HOUSE · PAPER INSPECTION')&&
  scene.includes('{papers[selected].observation}'));
 assert.ok(scene.includes('<BellrunnerDocumentTray')&&scene.includes('workshop-npc-label'));
 assert.ok(source('apps/web/src/lib/BellrunnerDocumentTray.svelte').includes('workshop-object-label'));
 assert.ok(scene.includes('clip-path:inset(93% 0 0 0)')&&
  !scene.includes('clip-path:inset(70% 0 0 0)'),
  'The foreground must cover only Hector\'s boots, not cut him across the waist');
 assert.ok(stage2.includes('clip-path:inset(93% 0 0 0)'));
 assert.ok(!stage2.includes('WorkshopItemPopover')&&stage2.includes('class="work-card"'));
 assert.ok(stage2.includes('DISPATCH HOUSE · PAPER INSPECTION')&&
  stage2.includes('{docs[selected].description}'));
 assert.ok(stage2.includes('<BellrunnerHectorConversation')&&
  stage2.includes('returnToRound={()=>{talkingToHector=false;}}'),
  'Hector conversation must preserve the Stage 2 return handler');
 assert.ok(!stage2.includes('characterName={character.name}'),
  'The player speaks as YOU; the optional Hector dialogue no longer receives a character-name label');
 assert.ok(stage2.includes('talkingToHector=true'));
 assert.ok(stage2.includes('talkingToHector=false'),
  'Returning to the active dispatch must preserve saved work and its revision');
 assert.ok(opening.includes("depotBackdrop={character.origin==='Bellrunner'}"));
 assert.ok(stage2.includes('sceneLocation={HAULING_SCENES[sceneKey].label}'));
 assert.ok(stage2.includes("depotBackdrop={sceneKey==='depot'}"));
 assert.ok(shell.includes("character.origin!=='Millhand'&&character.origin!=='Bellrunner'"));
 assert.ok(shell.includes('Back to Stage '));
 for(const item of ['hector-d-smoke.webp','council-work.webp','sealed-order.webp','route-sheet.webp'])
  assert.ok(scene.includes(item));
 assert.ok(!scene.includes('class="paper-inspection"'));
});

test('The two player-written route monologues are reproduced verbatim',()=>{
 assert.deepEqual([...BELLRUNNER_ROUTE_NARRATION.direct],[
  "I slip through the back streets behind the freight yards. Saves me a good bit of walking, though these alleys aren't exactly pleasant.",
  "Tight corners, barely room for two men to pass. And there's always some bastard looking for an easy bag to snatch.",
  "Better keep moving. Got enough trouble without losing the council's papers."
 ]);
 assert.deepEqual([...BELLRUNNER_ROUTE_NARRATION.quieter],[
  "I stick to the main roads. Takes longer, sure, but there's people about, carts passing, and enough light to see where I'm going.",
  "Trouble is, half the city's out here. Carts blocking the way, workers crossing everywhere. Hard to get anywhere quickly.",
  "Still, I'd rather lose a little time than have someone make off with my notices."
 ]);
 const ui=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 assert.ok(ui.includes('BELLRUNNER_ROUTE_NARRATION[round.workState.route]'));
 assert.ok(ui.includes('Take the Short Route')&&ui.includes('Take the Long Route'));
 assert.ok(ui.includes('Continue to the delivery'));
 assert.ok(!ui.includes('Inspect route and notices'));
 assert.ok(!ui.includes('Put the notices in route order'));
 assert.ok(!ui.includes('Make deliveries and record marks'));
 assert.ok(!ui.includes('Notice order</dt>'));
});

test('Receiving desk incident and three choices lead to authored, unskipped RP',()=>{
 assert.equal(BELLRUNNER_RECEIVING_ARRIVAL.length,2);
 assert.equal(BELLRUNNER_RECEIVER_OPENING.length,2);
 assert.ok(BELLRUNNER_RECEIVING_ARRIVAL[0].includes('clerk takes the council notice'));
 assert.ok(BELLRUNNER_RECEIVING_ARRIVAL[1].includes('ink smears across two lines'));
 assert.deepEqual(Object.keys(BELLRUNNER_RECEIVER_RESOLUTIONS).sort(),
  ['book_confirmed','clear','noted_unclear']);
 for(const value of Object.values(BELLRUNNER_RECEIVER_RESOLUTIONS)){
  assert.ok(value.player.length>15&&value.receiver.length>15);
  assert.ok(value.outcome.length>25);
 }
 assert.ok(BELLRUNNER_RECEIVER_RESOLUTIONS.clear.receiver.includes('Hold it steady this time.'));
 assert.ok(BELLRUNNER_RECEIVER_RESOLUTIONS.book_confirmed.extraPlayer?.includes('note the book entry'));
 assert.ok(BELLRUNNER_RECEIVER_RESOLUTIONS.noted_unclear.outcome.includes('unclear'));
 const ui=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 assert.ok(ui.includes("phase==='receiving_arrival'"));
 assert.ok(ui.includes("perform('continue_to_receiver')"));
 assert.ok(ui.includes("phase==='spoiled_mark'"));
 const arrival=ui.slice(ui.indexOf("{:else if phase==='receiving_arrival'}"),
  ui.indexOf("{:else if phase==='spoiled_mark'}"));
 assert.ok(arrival.includes('BELLRUNNER_RECEIVING_ARRIVAL'));
 assert.ok(arrival.includes('>Continue</button>'));
 assert.ok(!arrival.includes('BELLRUNNER_RECEIVER_OPENING'));
 assert.ok(!arrival.includes('Ask for a fresh mark'));
 const receiver=ui.slice(ui.indexOf("{:else if phase==='spoiled_mark'}"),
  ui.indexOf("{:else if phase==='book_checked'}"));
 assert.ok(receiver.includes('BELLRUNNER_RECEIVER_OPENING'));
 assert.ok(receiver.includes('Ask for a fresh mark'));
 assert.ok(receiver.includes('Check their receiving book'));
 assert.ok(receiver.includes('Note the spoiled mark and go on'));
 assert.ok(ui.includes("phase==='receiver_reply'&&receiverDialogue"));
 assert.ok(ui.includes("phase==='receiver_result'&&receiverDialogue"));
 assert.ok(ui.includes('“{receiverDialogue.player}”'));
 assert.ok(ui.includes('“{receiverDialogue.receiver}”'));
 assert.ok(ui.includes("perform('continue_receiver_dialogue')"));
 assert.ok(ui.includes("perform('continue_to_final_notice')"));
 assert.ok(!ui.includes('The round report</h1>'),
  'The tutorial no longer forces a summary-only screen');
 assert.ok(ui.includes('The usual deliveries are done, and the receiving marks are recorded.'));
 assert.ok(ui.includes('One sealed council order remains. It still needs to be delivered to the address marked on the route sheet.'));
 assert.ok(!ui.includes('not implemented in this pass'));
});

test('Stage 2 retains owner-checked, retry-safe work and no fabricated payouts',()=>{
 const ui=source('apps/web/src/routes/characters/[id]/bellrunner/dispatch/+page.svelte');
 const route=source('apps/api/src/bellrunner-dispatch-routes.ts');
 const schema=source('db/migrations/0015_bellrunner_dispatch_work.sql');
 const migrate=source('scripts/bellrunner-migrate.mjs');
 const rewind=source('apps/api/src/millhand-stage-rewind-routes.ts');
 assert.ok(ui.includes('round.workState')&&ui.includes('expectedRevision:round.revision'));
 assert.ok(route.includes("app.post<{Params:Params}>('/api/characters/:id/bellrunner/dispatch/work'"));
 assert.ok(route.includes('FOR UPDATE')&&route.includes('idempotency_key_reuse'));
 assert.ok(route.includes("ch.rows[0].origin!=='Bellrunner'"));
 assert.ok(route.includes('InvalidDispatchAction'));
 assert.ok(schema.includes('player_character_bellrunner_dispatch_work_receipts'));
 assert.ok(migrate.includes('0015_bellrunner_dispatch_work.sql'));
 assert.ok(rewind.includes('DELETE FROM player_character_bellrunner_dispatch_work_receipts'));
 assert.ok(!ui.includes('No money, XP or equipment has been awarded.'));
 assert.ok(!ui.includes('coins+'));
});

test('New rounds choose a road immediately; every receipt resolves through two saved RP beats',()=>{
 const apply=(actions:DispatchWorkAction[],initial:DispatchState=INITIAL_DISPATCH_STATE)=>
  actions.reduce<DispatchState>((s,a)=>applyDispatchAction(s,a),initial);
 assert.throws(()=>applyDispatchAction(INITIAL_DISPATCH_STATE,'take_final_notice'),
  InvalidDispatchAction);
 for(const road of ['take_direct_road','take_quieter_road'] as const){
  const chosen=apply([road]);
  assert.equal(chosen.phase,'road_chosen');
  assert.equal(chosen.route,road==='take_direct_road'?'direct':'quieter');
  const arrived=applyDispatchAction(chosen,'deliver_notices');
  assert.equal(arrived.phase,'receiving_arrival');
  assert.throws(()=>applyDispatchAction(arrived,'ask_fresh_mark'),InvalidDispatchAction,
   'Receiver choices remain locked until the arrival Continue');
  const delivered=applyDispatchAction(arrived,'continue_to_receiver');
  assert.equal(delivered.phase,'spoiled_mark');
  for(const [resolution,receipt] of [
    ['ask_fresh_mark','clear'],
    ['check_receiving_book','book_confirmed'],
    ['note_spoiled_mark','noted_unclear']
  ] as const){
   const reply=applyDispatchAction(delivered,resolution);
   assert.equal(reply.phase,'receiver_reply');
   assert.equal(reply.receipt,receipt);
   assert.throws(()=>applyDispatchAction(reply,'finish_round'),InvalidDispatchAction);
   const result=applyDispatchAction(reply,'continue_receiver_dialogue');
   assert.equal(result.phase,'receiver_result');
   assert.throws(()=>applyDispatchAction(result,'take_final_notice'),InvalidDispatchAction);
   const ready=applyDispatchAction(result,'continue_to_final_notice');
   assert.equal(ready.phase,'final_notice');
   const finished=applyDispatchAction(ready,'take_final_notice');
   assert.equal(finished.phase,'final_notice_taken');
   assert.equal(finished.route,chosen.route);
   assert.equal(finished.receipt,receipt);
  }
 }
});

test('Earlier saved dispatch phases and recorded sorting remain playable',()=>{
 const legacyChecked=applyDispatchAction(INITIAL_DISPATCH_STATE,'check_round');
 assert.equal(legacyChecked.phase,'checked');
 const legacySorted=applyDispatchAction(legacyChecked,'sort_notices');
 assert.equal(legacySorted.noticesOrdered,true);
 const road=applyDispatchAction(legacySorted,'take_direct_road');
 assert.equal(road.phase,'road_chosen');
 const arrival=applyDispatchAction(road,'deliver_notices');
 const spoiled=applyDispatchAction(arrival,'continue_to_receiver');
 const legacyBookChecked={...spoiled,phase:'book_checked' as const};
 const bookReply=applyDispatchAction(legacyBookChecked,'confirm_book');
 assert.equal(bookReply.phase,'receiver_reply');
 assert.equal(bookReply.receipt,'book_confirmed');
 const olderReport={...spoiled,phase:'round_report' as const,
  receipt:'noted_unclear' as const};
 assert.equal(applyDispatchAction(olderReport,'finish_round').phase,'final_notice');
 const oldResponse={...spoiled,phase:'receiver_result' as const,receipt:'clear' as const};
 assert.equal(applyDispatchAction(oldResponse,'continue_to_report').phase,'final_notice',
  'Old API command must no longer insert the removed report panel');
});

test('Stage 1 still accepts the round exactly once, without mutating starter items',()=>{
 const opening=source('apps/web/src/routes/characters/[id]/opening/+page.svelte');
 const api=source('apps/api/src/bellrunner-dispatch-routes.ts');
 const registration=source('apps/api/src/index.ts');
 const migration=source('db/migrations/0014_bellrunner_stage1.sql');
 assert.ok(opening.includes('<BellrunnerOpeningScene')&&
  opening.includes('takeRound={takeBellrunnerRound}'));
 assert.ok(opening.includes("action:'take_round',expectedRevision:0"));
 assert.ok(opening.includes('pendingTakeRequestId??=crypto.randomUUID()'));
 assert.ok(api.includes('player_character_bellrunner_dispatch_receipts'));
 assert.ok(api.includes("tutorial_stage=2,tutorial_status='IN_PROGRESS'"));
 assert.ok(registration.includes('registerBellrunnerDispatchRoutes(api);'));
 assert.ok(migration.includes('PRIMARY KEY (character_id,request_id)'));
 assert.ok(source('platform/scripts/bellrunner-migrate.mjs'.replace('platform/','')).includes('0014_bellrunner_stage1.sql'));
});
