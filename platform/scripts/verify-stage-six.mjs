import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const engine=read('packages/game-core/vendor/combat-v0.5.1/combat.mjs');
// Trial balance has been explicitly changed by the owner; guard its formulas
// rather than enforcing the hash of the previous, now obsolete prototype.
for(const expected of [
  'strikeCost: 10','guardCost: 15','moveCost: 5','recoverGain: 20',
  'exhaustedRecoverGain:10','exhaustedFatigueRecovery:30',
  'highFatigueRecoverThreshold:50',
  'limbs: -0.15','head: -0.30',
  'dodgeChance:{side:.25,cover:.40,back:.50,close:0}',
  'unarmedDamage:{torso:[4,8],limbs:[3,6],head:[8,13]}',
  'unarmedTechnique:{torso:[8,12],limbs:[6,10],head:[12,18]}',
  's.dodgeAttempt={attempted:true,success,chance}',
  'guardReduction:{min:.30,max:.60}'
])assert.ok(engine.includes(expected),'Stage 6 owner trial balance changed unexpectedly: '+expected);
const api=read('apps/api/src/millhand-combat-routes.ts');
const opening=read('apps/api/src/millhand-combat-opening.ts');
const characterRoutes=read('apps/api/src/character-routes.ts');
const pgTest=read('scripts/verify-stage6-postgres.integration.test.ts');
const view=read('apps/api/src/millhand-combat-view.ts');
const scene=read('apps/web/src/lib/MillhandCombatScene.svelte');
const page=read('apps/web/src/routes/characters/[id]/millhand/combat/+page.svelte');
const five=read('apps/web/src/routes/characters/[id]/millhand/wage-claim/+page.svelte');
const claim=read('apps/api/src/millhand-wage-claim-routes.ts');
const home=read('apps/web/src/lib/CharacterHome.svelte');
const shell=read('apps/web/src/lib/TutorialShell.svelte');
const mig=read('db/migrations/0007_millhand_flint_combat.sql');
const boot=read('apps/api/src/index.ts');
const charactersSql=read('db/migrations/0002_characters.sql');
const rewind=read('apps/api/src/millhand-stage-rewind-routes.ts');
const sceneShell=read('apps/web/src/lib/TutorialShell.svelte');
assert.ok(boot.includes('registerMillhandCombatRoutes(api)'));
assert.ok(opening.includes("newEncounter('flint'") &&
  api.includes('initializeFlintCombat(req.params.id,ch,stance,seed())') &&
  api.includes('state=step(record.state,command.action') &&
  api.includes('FOR UPDATE') &&
  api.includes('account_id=$2') &&
  api.includes('randomBytes(4)') &&
  api.includes('player_character_flint_combat_receipts') &&
  api.includes('current_health=$2') &&
  api.includes('unexpected_encounter_outcome'),
  'Server must own both combat and character Health');
for(const stance of ['brace','moving','cart'])assert.ok(opening.includes("stance==='"+stance+"'"));
assert.ok(opening.includes("state.intent={") &&
  opening.includes("type:'move',to:'close',speed:5") &&
  opening.includes("state.distance='near'") &&
  opening.includes("state.distance='far'") &&
  opening.includes('state.player.readiness+=2'),
  'The three opening stances must produce real existing-engine tactical differences');
assert.ok(characterRoutes.includes("'player_character_flint_combat_receipts','player_character_flint_combat'") &&
  characterRoutes.includes("'player_character_wage_claim_receipts','player_character_wage_claim'") &&
  characterRoutes.includes("'DELETE FROM '+table+' WHERE character_id=$1'"),
  'Account-owned deletion must remove Stage 5 and 6 child rows and receipts');
assert.ok(pgTest.includes("registerMillhandCombatRoutes(app,{pool:db,resolveSession,seed:()=>5})") &&
  pgTest.includes('Two concurrent browser tabs') &&
  pgTest.includes('A victory saves its actual Health') &&
  pgTest.includes('A defeat at zero Health') &&
  pgTest.includes('Account-owned deletion removes Stage 5/6 records'),
  'PostgreSQL adapter integration coverage must include races, both outcomes and deletion');
assert.ok(claim.includes('combat_already_started'),'Stance cannot be rewound after combat begins');
assert.ok(page.includes("kind:'start'") &&
  page.includes("kind:'turn'") &&
  page.includes('retrySignature=signature') &&
  page.includes('MillhandCombatScene'),
  'No extra pre-fight choice and round retries must be idempotent');
assert.ok(five.includes('/millhand/combat'));
assert.ok(home.includes('/millhand/combat')&&shell.includes('/millhand/combat'));
assert.ok(scene.includes('snapshot.enemyIntent') &&
  scene.includes('snapshot.events') &&
  scene.includes('snapshot.rules') &&
  scene.includes('snapshot.player.wounds.some') &&
  scene.includes('snapshot.outcome') &&
  scene.includes('Continue to medical care') &&
  scene.includes('/millhand/clinic'),
  'UI must use real combat state and avoid fake clinic');
assert.ok(view.includes('TEST_CONFIG')&&view.includes('testAttackCost'));
assert.ok(mig.includes('player_character_flint_combat_receipts')&&mig.includes('history JSONB'));
assert.ok(!api.includes('UPDATE player_characters SET coins') &&
  !api.includes('tutorial_stage=7') &&
  !api.includes('ordinary_xp') &&
  !api.includes('arms_xp'),
  'Combat must not introduce payouts, healing or an unfinished clinic transition');

// Stage 6 display refinement: the six supplied actions are files, never
// reimplementations of the authoritative engine's turn handling.
const assets={
  'strike.webp':'attack',
  'guard.webp':'guard',
  'reposition.webp':'move',
  'recover.webp':'recover',
  'press-advantage.webp':'technique'
};
for(const [asset,action] of Object.entries(assets)){
  const file=readFileSync(resolve(root,'apps/web/static/ui-kit/combat-actions',asset));
  assert.equal(file.toString('ascii',0,4),'RIFF',asset+' must be a WebP image');
  assert.equal(file.toString('ascii',8,12),'WEBP',asset+' must be a WebP image');
  assert.ok(file.length>1000&&file.length<30000,asset+' must be an optimized standalone asset');
  assert.ok(scene.includes("id:'"+action+"'")&&scene.includes("asset:'"+asset+"'"),
    'The '+action+' button must display the supplied '+asset);
}
const confirm=readFileSync(resolve(root,'apps/web/static/ui-kit/combat-actions/confirm-action.webp'));
assert.equal(confirm.toString('ascii',8,12),'WEBP','Confirm action icon missing');
assert.ok(scene.includes("iconBase + 'confirm-action.webp'")&&
  scene.includes('aria-pressed={visibleSelection === choice.id}')&&
  scene.includes('aria-label={`Select ${choice.label} action`}')&&
  scene.includes('class="action-name"')&&
  scene.includes('opacity:.76')&&
  scene.includes('snapshot.events.slice(-6)')&&
  scene.includes('class="enemy-status"') && scene.includes('class="player-status"'),
  'The UI must keep icon-first action choices, accessible labels and a compact Chronicle');


// The screenshot's visual hierarchy is implemented in one scene: action
// choices and details over the alley, followed by a three-column status row.
// Lower priority stats remain available inside expandable fighter details.
assert.ok(scene.includes('class="action-zone"') &&
  scene.includes('class="actions-row"') &&
  scene.includes('class="confirm-holder"') &&
  scene.includes('class="action-details"') &&
  scene.includes('class="enemy-status"') && scene.includes('class="player-status"') &&
  scene.includes('class="chronicle"') &&
  scene.includes('class="secondary-stats"') &&
  scene.includes('class="resources"') &&
  scene.includes('grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)') &&
  scene.includes('@media(max-width:640px)') &&
  !scene.includes('class="decision-row"'),
  'Combat layout must present one battlefield action bar, compact fighter comparison and adjacent Chronicle');


// Compact roleplaying action-card layout must show all owner-authored
// numerical options and use live server facts, not hardcoded UI guesses.
const model=read('apps/web/src/lib/millhand-combat-model.ts');
const chronicle=read('apps/web/src/lib/millhand-combat-chronicle.ts');
const unarmedIcon=readFileSync(resolve(root,'apps/web/static/ui-kit/combat-actions/unarmed-fists.webp'));
assert.equal(unarmedIcon.toString('ascii',0,4),'RIFF','Owner unarmed icon must be WebP');
assert.equal(unarmedIcon.toString('ascii',8,12),'WEBP','Owner unarmed icon is not a valid WebP');
assert.ok(unarmedIcon.length>1000&&unarmedIcon.length<30000,'Owner unarmed icon must remain optimized');
assert.ok(view.includes('strikeByZone:zoneRanges(false)')&&
  view.includes('techniqueByZone:zoneRanges(true)')&&
  view.includes('dodgeChance:{side:Math.round(100*TEST_CONFIG.dodgeChance.side)')&&
  view.includes("guardMitigationPercent:Math.round(100*guardMin)+'–'+Math.round(100*guardMax)")&&
  scene.includes('snapshot.rules.strikeByZone[target]')&&
  scene.includes('snapshot.rules.techniqueByZone[target]')&&
  scene.includes('snapshot.rules.accuracy[target]')&&
  scene.includes('snapshot.rules.dodgeChance.side')&&
  scene.includes('snapshot.rules.guardCost')&&
  scene.includes('snapshot.rules.recoverStamina')&&
  scene.includes('Target:')&&scene.includes('Accuracy:')&&
  scene.includes('Damage:')&&scene.includes('Cost:')&&
  scene.includes('Damage Reduction:')&&
  scene.includes('Dodge Chance:')&&
  scene.includes('Press Advantage')&&
  scene.includes('unarmed-fists.webp')&&
  scene.includes('rifle.webp')&&
  scene.includes('class="target-list"')&&
  scene.includes('class:selected-target={zone===target}')&&
  scene.includes('disabled={pending || !available(visibleSelection)}')&&
  model.includes('strikeByZone:')&&model.includes('dodgeChance:')&&
  chronicle.includes("event.actor==='enemy'"),
  'Combat action card needs real owner balance, three selectable zones and supplied weapon artwork');

assert.ok(scene.includes('snapshot.events.slice(-6)')&&
  scene.includes('Latest 6 of {snapshot.events.length} entries.')&&
  scene.includes('combatActionLabel(event)')&&
  scene.includes('class:enemy-action={isEnemyCombatAction(event)}')&&
  scene.includes('.event-action.enemy-action{color:#ff7468'),
  'Chronicle must show six latest entries, exact action labels and red enemy actions');
assert.ok(api.includes('describeCommittedTurn')&&
  api.includes('state.events=describeCommittedTurn(state.events,command.action,record.state.intent)')&&
  api.includes('actionType:type,actionDetail:detail,actionName:name'),
  'Save action types in the authoritative event history without changing combat turns');
const {combatActionLabel,isEnemyCombatAction}=
  await import('../apps/web/src/lib/millhand-combat-chronicle.ts');
assert.equal(combatActionLabel({kind:'damage',actor:'enemy',actionType:'attack',
  actionDetail:'torso',text:'Flint hits',round:3}),'Attack-Torso');
assert.equal(combatActionLabel({kind:'miss',actor:'enemy',actionType:'technique',
  actionDetail:'limbs',actionName:'Hook and Draw',text:'Flint misses',round:3}),
  'Hook and Draw-Limbs');
assert.equal(combatActionLabel({kind:'damage',actor:'player',actionType:'technique',
  actionDetail:'head',text:'Your hit',round:3}),'Press Advantage-Head');
assert.equal(combatActionLabel({kind:'move',actor:'player',actionType:'move',
  actionDetail:'cover',text:'You move',round:3}),'Reposition-Cover');
assert.equal(combatActionLabel({kind:'recovery',actor:'player',actionType:'recover',
  actionDetail:'breath',text:'You recover',round:3}),'Recover-Stamina');
assert.equal(combatActionLabel({kind:'tactical',actor:'player',actionType:'guard',
  text:'Guard checks attack',round:3}),'Guard');
assert.equal(combatActionLabel({kind:'intent',actor:'enemy',text:'Flint readies club',round:3}),'Intent');
assert.equal(isEnemyCombatAction({kind:'intent',actor:'enemy',text:'Flint waits',round:3}),false);
assert.equal(isEnemyCombatAction({kind:'damage',actor:'enemy',actionType:'attack',
  text:'Flint hits',round:3}),true);
assert.equal(isEnemyCombatAction({kind:'guard',actor:'player',actionType:'guard',
  text:'You guard',round:3}),false);

// An enhanced strike must always reveal exactly where extra damage came from.
// The target inspector distinguishes base range from an active conditional bonus.
assert.ok(engine.includes('const openingDamageBonus=exploited?(edge.damageBonus??5):0') &&
  engine.includes('baseDamage:rolled,openingDamageBonus') &&
  engine.includes('base damage + ${openingDamageBonus} Opening bonus') &&
  engine.includes('${damageBreakdown}${guardText}') &&
  scene.includes('<b>Base Damage:</b>') &&
  scene.includes('class="opening-stat"') &&
  scene.includes('<b>Opening:</b> +{openingBonus}') &&
  scene.includes('class="potential-stat"') &&
  scene.includes('<b>Total:</b>') &&
  scene.includes('Base Damage is before an Opening bonus') &&
  scene.includes('base damage, bonus and total separately'),
  'Opening math must be visible before the action and preserved in exact combat history');
// The owner-approved Fatigue system must remain symmetric: only the actual
// engine owns changes, while the API projects the same accuracy and legal turns.
for(const expected of [
  'fatigueLowGain:3','fatigueExhaustedDefenseGain:5',
  'fatigueExhaustedAttackGain:10','fatigueRecovery:15',
  'exhaustedFatigueRecovery:30','highFatigueRecoverThreshold:50',
  'fatigueCap:100','fatigueAttackLock:70',
  'fatigueAccuracyStep:10','fatigueAccuracyPenaltyPerStep:.03',
  'export function canActAtFatigue','export function fatigueAccuracyPenalty',
  'const oldFatigue=clamp(a.fatigue??0,0,TEST_CONFIG.fatigueCap)',
  'if(before===0)','actionType===\'attack\'||actionType===\'technique\'',
  "if(!canActAtFatigue(s.player,a.type))",
  'fatigueAccuracyPenalty({fatigue:fatigueAtCommit})',
  'if(e.fatigue>=TEST_CONFIG.fatigueAttackLock)',
  'const foe=canActAtFatigue(s.enemy,s.intent?.type)?s.intent:makeIntent(s)',
  'x.fatigue=Math.max(0,formerFatigue-plannedFatigueRecovery)',
  'const highFatigue=formerFatigue>=TEST_CONFIG.highFatigueRecoverThreshold',
  "const recoveryAmount=highFatigue",
])assert.ok(engine.includes(expected),'Missing real Fatigue rule: '+expected);
assert.ok(view.includes('.filter(action=>canActAtFatigue(state.player,action))') &&
  view.includes('fatigueAccuracyPenalty(state.player)') &&
  view.includes('currentAccuracyLoss:') &&
  scene.includes('snapshot.rules.fatigue.currentAccuracyLoss') &&
  scene.includes('At 100 Fatigue, only Recover is possible.') &&
  scene.includes('up to {snapshot.rules.fatigue.recovery} Fatigue') &&
  scene.includes('Unprotected while recovering.') &&
  scene.includes('full, unguarded damage') &&
  scene.includes('snapshot.rules.fatigue.recoveryFrom50') &&
  scene.includes('snapshot.rules.recoverStaminaFrom50') &&
  view.includes('highFatigueRecovery') &&
  view.includes('recoverStamina:recoveryStamina') &&
  view.includes('recovery:recoveryFatigue') &&
  scene.includes("key:'fatigue',label:'Fatigue'"),
  'Real Fatigue effects, action locks, and recovery must agree in UI and engine');

// PostgreSQL's character-status CHECK uses COMPLETED, not COMPLETE.
// That mismatch formerly rolled back the final Flint turn with HTTP 500.
assert.ok(charactersSql.includes("'NOT_STARTED','IN_PROGRESS','COMPLETED'") &&
  api.includes("state.status==='finished'?'COMPLETED':'IN_PROGRESS'") &&
  !api.includes("state.status==='finished'?'COMPLETE':'IN_PROGRESS'"),
  'A completed Flint encounter must commit under the actual database status constraint');

// Developer-only Stage 6 → 5 rewind: exact starting Health is recovered
// from the revision-zero start receipt, not guessed from maximum Health.
assert.ok(rewind.includes("process.env.NODE_ENV==='production'||!loopback") &&
  rewind.includes('stage>=2&&stage<=7') &&
  rewind.includes('expectedStage===6') &&
  rewind.includes('previousWageClaim(claim.rows[0].state)') &&
  rewind.includes("response->>'revision'='0'") &&
  rewind.includes('unsafe_combat_initial_health') &&
  rewind.includes('unsafe_combat_health_state') &&
  rewind.includes('DELETE FROM player_character_flint_combat_receipts') &&
  rewind.includes('DELETE FROM player_character_flint_combat') &&
  rewind.includes('tutorial_stage=5') &&
  sceneShell.includes("fromStage===6") &&
  sceneShell.includes('Back to Stage '),
  'A safe loopback-only Stage 6 rewind must preserve earlier progress and restore Health');

// Match the approved Stage 5 nine-slice frame, not the older oversized
// untrimmed dialogue-frame.png with an opaque secondary parchment surface.
assert.ok(scene.includes("dialogue-frame-trim.png") &&
  scene.includes('class="cart-marker scene-label"') &&
  scene.includes('class="scene-label flint-label"') &&
  scene.includes('border-image-slice:145 190 125 190 fill') &&
  scene.includes('min-height:69px') &&
  !scene.includes('        <p class="kicker">THE PASSAGE · STAGE 6</p>'),
  'The combat parchment, compact action tiles and NPC labels must use the trimmed frame');


// Owner HUD: Flint beside his stats; Chronicle on the left, player on the right.
const enemyPosition=scene.indexOf('<section class="enemy-status"');
const actionPosition=scene.indexOf('<section class="action-zone"');
const chroniclePosition=scene.indexOf('<section class="chronicle"');
const playerPosition=scene.indexOf('<section class="player-status"');
assert.ok(enemyPosition>0 && enemyPosition<actionPosition &&
  actionPosition<chroniclePosition && chroniclePosition<playerPosition &&
  scene.includes("{@render combatant(snapshot.enemy, 'Flint', true)}") &&
  scene.includes("{@render combatant(snapshot.player, 'You', false)}") &&
  scene.includes('.enemy-status{position:absolute') &&
  scene.includes('.combat-console{display:grid') &&
  scene.includes('@media(max-width:920px)') &&
  scene.includes('.enemy-status{position:relative'),
  'Flint condition near him, Chronicle left of player; narrow screens remain usable');
assert.ok(scene.includes('/characters/flint/flint-defeated.webp') &&
  scene.includes("snapshot.outcome === 'player_victory'") &&
  scene.includes('/characters/flint/flint-standing.webp'),
  'Flint defeated art must replace the standing cutout after a saved victory');

// Twelve owner cues. Verify the binary files, shared mixer and server truth.
const audio=read('apps/web/src/lib/pall-audio.ts');
const soundMap=read('apps/web/src/lib/millhand-combat-sound.ts');
const soundNames=[
  'guard.mp3','reposition.mp3','fight-finished.mp3','male-low-stamina.mp3',
  ...[1,2,3,4].map(n=>'hit-0'+n+'.mp3'),
  ...[1,2,3,4].map(n=>'male-grunt-0'+n+'.mp3')
];
for(const name of soundNames){
  const buffer=readFileSync(resolve(root,'apps/web/static/audio/the-pall/combat',name));
  assert.equal(buffer.toString('ascii',0,3),'ID3',name+' must be a valid MP3');
  assert.ok(buffer.length>3000 && buffer.length<35000,name+' must be a compact sound');
  assert.ok(audio.includes('combat/'+name),'Audio source missing '+name);
}
assert.ok(audio.includes('claimCombatSfx') &&
  audio.includes('playCombatSfx') &&
  audio.includes('combatSfxOwners') &&
  audio.includes('settings.sfxVolume') &&
  audio.includes('prepareSoundEffects(combatSfxFiles)') &&
  audio.includes('sfxFiles.every(filename=>sfxBuffers.has(filename))'),
  'Combat cues must share player SFX settings and preload only in combat');
assert.ok(page.includes('claimCombatSfx()') &&
  page.includes('soundSavedCombatTurn(previous,result,action,character?.sex)') &&
  soundMap.includes('event.round === previous.round') &&
  soundMap.includes("e.kind === 'damage'") &&
  soundMap.includes("e.kind === 'guard'") &&
  soundMap.includes("e.kind === 'move'") &&
  soundMap.includes("next.status === 'finished'") &&
  soundMap.includes("playerSex === 'Male'") &&
  scene.includes('data-pall-sfx="none"'),
  'Audio must follow successful turns, not pending actions or old Chronicle history');


// Stage 6 reads the actual combat snapshot's Stamina in the shared header.
// Earlier stages retain their existing saved-resource or provisional behavior.
const combatModel=read('apps/web/src/lib/millhand-combat-model.ts');
const journalReference=read('apps/web/src/lib/MillhandWageClaimScene.svelte');
assert.ok(page.includes('combatStamina={{current:battle.player.stamina,maximum:COMBAT_RESOURCE_SCALE}}') &&
  page.includes("import {COMBAT_RESOURCE_SCALE} from '$lib/millhand-combat-model'") &&
  combatModel.includes('export const COMBAT_RESOURCE_SCALE=100') &&
  shell.includes('combatStamina?:{current:number;maximum:number}') &&
  shell.includes('const staminaShown=$derived(isMeasured(combatStamina)') &&
  shell.indexOf('?combatStamina') < shell.indexOf(':isMeasured(character.stamina)') &&
  shell.includes("!isMeasured(combatStamina)&&!isMeasured(character.stamina)"),
  'The header must prefer the current saved Stage 6 Stamina over provisional 100/100');

// Both fighter panels use one resource template with real numbers and small
// visual meters. Fatigue is not capped in the v0.5.1 state, so only bar fill
// is clamped; the true numeric amount remains visible.
assert.ok(scene.includes("displayedResources=[") &&
  scene.includes("{key:'stamina',label:'Stamina'}") &&
  scene.includes("{key:'fatigue',label:'Fatigue'}") &&
  scene.includes("{key:'momentum',label:'Momentum'}") &&
  scene.includes('style:width={resourceWidth(actor[resource.key])}') &&
  scene.includes('<dd>{actor[resource.key]}</dd>') &&
  scene.includes('Math.min(100,scaled/COMBAT_RESOURCE_SCALE*100)') &&
  scene.includes('class={\'mini-fill \'+resource.key}') &&
  scene.includes("{@render combatant(snapshot.enemy, 'Flint', true)}") &&
  scene.includes("{@render combatant(snapshot.player, 'You', false)}"),
  'Both combatants must display all three real resource values and compact bars');

// The post-fight Journal uses the same parchment, reading width, title
// hierarchy and paper/ink contrast already established in Stage 5.
assert.ok(scene.includes('class="aftermath"') &&
  scene.includes('<small>PERSONAL JOURNAL</small>') &&
  scene.includes('<h2>The Fight with Flint</h2>') &&
  scene.includes('class="journal-entries"') &&
  scene.includes('.aftermath{grid-column:1/-1;background:#e6d5b5;color:#24160e;') &&
  scene.includes('max-width:960px') &&
  scene.includes('.journal-entries p{margin:0 0 10px;font:600 16px/1.55') &&
  journalReference.includes('.journal{background:#e6d5b5;color:#25180d;') &&
  journalReference.includes('.journal-head'),
  'Finished combat must show the established parchment Personal Journal');


// The combat engine resets state.events at every step. Use the fresh,
// authoritative turnEvents rather than comparing a growing Chronicle.
// Repeated successful turns must each display their own result.
assert.ok(view.includes('turnEvents:state.events') &&
  combatModel.includes('turnEvents:CombatEventView[]') &&
  soundMap.includes('next.turnEvents.filter(event => event.round === previous.round)'),
  'The server must expose per-turn events to both floating text and combat SFX');
const {newSavedCombatEvents,floatingFeedbackForSavedTurn}=
  await import('../apps/web/src/lib/millhand-combat-feedback.ts');
const intent={round:4,kind:'intent',text:'Flint prepares his club'};
const hit={round:4,kind:'damage',actor:'player',target:'enemy',damage:11,text:'Flint loses 11 Health'};
const miss={round:4,kind:'miss',actor:'enemy',damage:0,text:'Flint misses'};
const zero={round:4,kind:'damage',actor:'enemy',target:'player',damage:0,text:'Guard blocks'};
const before={revision:4,round:4,events:[intent],turnEvents:[],status:'active'};
const after={revision:5,round:5,events:[intent,hit,miss,zero],
  turnEvents:[intent,hit,miss,zero],status:'active'};
const summarize=items=>items.map(({target,label,kind})=>({target,label,kind}));
assert.deepEqual(summarize(floatingFeedbackForSavedTurn(before,after)),[
  {target:'enemy',label:'−11',kind:'hit'},
  {target:'player',label:'Miss',kind:'miss'}
]);
assert.deepEqual(newSavedCombatEvents(before,after),[intent,hit,miss,zero]);
assert.deepEqual(floatingFeedbackForSavedTurn(after,after),[],
  'Same revision must not replay');
assert.deepEqual(floatingFeedbackForSavedTurn(before,{...after,revision:7}),[],
  'Skipped revisions must not replay unknown events');
assert.deepEqual(summarize(floatingFeedbackForSavedTurn(before,{
  ...after,turnEvents:[{...miss,actor:'player'}]
})),[{target:'enemy',kind:'miss',label:'Miss'}],
  'A player miss must float over Flint');
assert.deepEqual(summarize(floatingFeedbackForSavedTurn(before,{
  ...after,turnEvents:[{...hit,actor:'enemy',target:'player',damage:14}]
})),[{target:'player',kind:'hit',label:'−14'}],
  'An enemy hit must float over the player');
assert.deepEqual(floatingFeedbackForSavedTurn(before,{
  ...after,turnEvents:[zero]
}),[],'Blocked zero-damage attacks must not show fictitious damage');

// Regression: this failed after the first feedback when array comparison
// drifted. Each consecutive round must work even when the visible Chronicle
// has rolled its 120-event limit.
let previous=after;
for(let round=5;round<25;round++){
  const target=round%2===0?'enemy':'player';
  const newEvent=round%3===0
    ?{round,kind:'miss',actor:target==='enemy'?'player':'enemy',damage:0,
        text:'The strike misses'}
    :{round,kind:'damage',actor:target==='enemy'?'player':'enemy',target,
        damage:round,text:'The blow lands'};
  const next={
    ...previous,
    revision:previous.revision+1,
    round:round+1,
    // Simulate compacted/rotating history to ensure it is never used as
    // the source for this turn's floating feedback.
    events:Array.from({length:120},(_,i)=>({
      round:i,kind:'intent',text:'Old Chronicle entry '+i
    })),
    turnEvents:[{round,kind:'intent',text:'Flint shifts'},newEvent]
  };
  const output=floatingFeedbackForSavedTurn(previous,next);
  assert.equal(output.length,1,'Missing floating feedback on round '+round);
  assert.equal(output[0].target,target,'Wrong target on round '+round);
  assert.equal(output[0].label,newEvent.kind==='miss'?'Miss':'−'+round);
  assert.ok(output[0].id.startsWith(String(next.revision)+':'),
    'Every successful turn must have a new DOM animation key');
  previous=next;
}
assert.deepEqual(floatingFeedbackForSavedTurn(before,{
  ...after,turnEvents:[],events:[hit,miss,zero]
}),[],'Old Chronicle entries must not animate without a new turn event');
assert.ok(page.includes('feedback=previous?floatingFeedbackForSavedTurn(previous,result):[]') &&
  page.includes('feedback=[];') &&
  page.includes('<MillhandCombatScene snapshot={battle} characterId={id} {feedback}') &&
  scene.includes("feedback.filter(item => item.target === 'enemy')") &&
  scene.includes("feedback.filter(item => item.target === 'player')") &&
  scene.includes('class:impact={event.kind === \'damage\'}') &&
  scene.includes('class:evaded={event.kind === \'miss\'}') &&
  scene.includes('animation:combat-feedback-float 1100ms') &&
  scene.includes('@media(prefers-reduced-motion:reduce)'),
  'The short-lived floating feedback must restart every turn without replaying old events');


// Regression for the non-clickable Stage 6 -> clinic CTA. The scenery
// deliberately ignores pointer input, so its outcome parchment MUST
// opt back in; otherwise the native link displays but cannot be clicked.
const framedStyles=read('apps/web/src/lib/pall-owner-ui.css');
const wageScene=read('apps/web/src/lib/MillhandWageClaimScene.svelte');
assert.ok(
  scene.includes('.stage-scenery{position:absolute;inset:0;pointer-events:none}') &&
  scene.includes('pointer-events:auto;filter:drop-shadow(0 6px 10px #0008)') &&
  scene.includes('<a class="pall-framed-button clinic-link" href=') &&
  scene.includes('.clinic-link{position:relative;z-index:1;') &&
  wageScene.includes('<a class="pall-framed-button combat-link" href=') &&
  framedStyles.includes('.pall-framed-button {') &&
  framedStyles.includes("url('/ui-kit/buttons/button-normal-trim.png')") &&
  framedStyles.includes("url('/ui-kit/buttons/button-hover-trim.png')") &&
  framedStyles.includes("url('/ui-kit/buttons/button-pressed-trim.png')") &&
  framedStyles.includes('border-image-slice:50 180 45 180 fill;'),
  'The battle progression CTA must actually receive pointer events and share the approved frame'
);

console.log('PASS: original v0.5.1 checksum, combat handoff, authenticated atomic turns, real Chronicle and Stage 7 clinic link.');
