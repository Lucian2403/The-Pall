/**
 * The Pall — standalone deterministic combat SPIKE (not production MMO code).
 * All costs, damages, percentages and yields are NON-CANONICAL test fixtures.
 * Stage 6 owner-approved trial balance: zone damage, guard and probabilistic dodge.
 * Pure state transitions: callers must persist state with a transaction/CAS.
 */

export const TEST_CONFIG = Object.freeze({
  strikeCost: 10, repeatedStrikeSurcharge: 0, guardCost: 15, moveCost: 5, useCost: 2,
  recoverGain: 25, mentalRecoverGain: 12, lowReserve: 20,
  guardReduction:{min:.30,max:.60},
  // Owner-approved threshold model: the cost of already being completely spent
  // differs from the last paid Stamina spend that reached zero.
  fatigueLowGain:3,fatigueExhaustedDefenseGain:5,fatigueExhaustedAttackGain:10,
  fatigueRecovery:10,fatigueCap:100,fatigueAttackLock:70,
  fatigueAccuracyStep:10,fatigueAccuracyPenaltyPerStep:.03,
  strikeMomentum: 10, guardMomentum: 8, moveMomentum: 5,
  bleedDamage: { 0: 0, 1: 1, 2: 2, 3: 3 },
  aim: { torso: 0, limbs: -0.15, head: -0.30 },
  dodgeChance:{side:.25,cover:.40,back:.50,close:0},
  unarmedDamage:{torso:[4,8],limbs:[3,6],head:[8,13]},
  unarmedTechnique:{torso:[8,12],limbs:[6,10],head:[12,18]},
});

export class CombatError extends Error {}
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
// Earlier persisted Flint fights precede the explicit unarmed marker.
export const isUnarmedWeapon=w=>w.unarmed===true ||
  (w.unarmed===undefined&&w.damage===6&&w.accuracy===.70&&w.type==='blunt');
const copy = x => structuredClone(x);
const actor = (name, opts = {}) => ({
  name, hp: opts.hp ?? 50, hpMax: opts.hpMax ?? 50, ceiling: opts.ceiling ?? 50,
  stamina: opts.stamina ?? 90, composure: opts.composure ?? 80,
  fatigue: clamp(opts.fatigue ?? 0,0,TEST_CONFIG.fatigueCap),
  stress: opts.stress ?? 0, momentum: opts.momentum ?? 0,
  wounds: [], bleed: 0, bandages: opts.bandages ?? 0, guard: false,
  armHits:opts.armHits??0,armImpaired:opts.armImpaired??false,
  reloadSlowdownPercent:opts.reloadSlowdownPercent??0,
  readiness: opts.readiness ?? 0, weapon: opts.weapon ?? {damage: 6,accuracy: .70,type: 'blunt',reach: 'contact',unarmed:true},
});
function rng(state) {
  // Deterministic LCG. Not secure; replaced by server-owned RNG in production.
  state.rng = (Math.imul(1664525, state.rng) + 1013904223) >>> 0;
  return state.rng / 2 ** 32;
}
function log(state, text, kind='narrative', extra={}) {
  state.events.push({round:state.round, text, kind, ...extra});
}
function choose(state, lines) { return lines[Math.floor(rng(state) * lines.length)]; }
// Narrative wording is deterministic and saved with the encounter, but avoids
// repeating any of the last four matching phrases when there are alternatives.
function freshPhrase(s, key, alternatives) {
  const recent=s.narrativeRecent??(s.narrativeRecent=[]);
  const available=alternatives.filter(x=>!recent.some(y=>y.key===key && y.line===x));
  const line=choose(s,available.length?available:alternatives);
  recent.push({key,line});if(recent.length>16)recent.shift();
  return line;
}
function opening(s, who, reason) {
  s.openings[who]={expires:s.round+1,reason};
  log(s,`${s[who].name==='Player'?'You notice':s[who].name+' notices'} an opening: ${reason}.`,'tactical',{actor:who});
}
function hasOpening(s,who) {return (s.openings?.[who]?.expires??0)>=s.round;}
function repeatedStrikes(s,who) { const actions=who==='player'?s.lastPlayerActions:s.lastEnemyActions;return (actions??[]).slice(-2).length===2 && actions.slice(-2).every(x=>x==='attack'); }
export function testAttackCost(s,who='player') { return TEST_CONFIG.strikeCost + (repeatedStrikes(s,who)?TEST_CONFIG.repeatedStrikeSurcharge:0); }
function hasClearBoarExit(s) {
  if(s.scene!=='boar')return false;
  const t=s.terrain;
  // Leaving a charge lane is not enough: the narrow opening must also be clear.
  return !!(t && t.laneClear && t.mouthClear && !t.fenceBlocked);
}
function setBoarPosition(s,to){
  if(s.scene!=='boar')return;
  const t=s.terrain;
  if(to==='close'){t.playerSpot='lane';t.laneClear=false;t.mouthClear=false;}
  if(to==='side'){
    // Moving laterally clears the charge lane, but the fence throat is still narrow.
    const wasBack=t.playerSpot==='back';
    t.playerSpot='shoulder';t.laneClear=true;
    if(wasBack)t.mouthClear=true;
  }
  if(to==='back'){
    const wasSide=t.playerSpot==='shoulder'||t.playerSpot==='fence';
    t.playerSpot='back';t.mouthClear=wasSide;
    t.laneClear=wasSide; // from the lane, backing straight up keeps blocking the animal
  }
  if(to==='cover'){
    t.playerSpot='fence';t.laneClear=true;t.mouthClear=false;
  }
  // A preexisting fence obstruction may need a distinct later contextual action.
  s.pathOpen=hasClearBoarExit(s); // compatibility only; never set directly on any Move
}

function woundName(s, who, zone) {
  if (zone === 'head') return 'temple';
  if (zone === 'limbs') return choose(s, ['forearm', 'leg', 'shoulder']);
  return choose(s, ['ribs', 'chest', 'side']);
}
/** The shared action legality contract is used by player validation, enemy AI,
 * and the public view. 70–99 permits Move or Recover; 100 permits Recover only.
 * This deliberately includes hidden bandage/withdraw actions: no bypass via API.
 */
export function canActAtFatigue(actor,actionType){
  const fatigue=clamp(actor.fatigue??0,0,TEST_CONFIG.fatigueCap);
  if(fatigue>=TEST_CONFIG.fatigueCap)return actionType==='recover';
  if(fatigue>=TEST_CONFIG.fatigueAttackLock)
    return actionType==='move'||actionType==='recover';
  return true;
}
export function fatigueAccuracyPenalty(actor){
  const fatigue=clamp(actor.fatigue??0,0,TEST_CONFIG.fatigueCap);
  return Math.floor(fatigue/TEST_CONFIG.fatigueAccuracyStep)*
    TEST_CONFIG.fatigueAccuracyPenaltyPerStep;
}
function cost(state, who, amount, actionType='use') {
  const a = state[who];
  const before = Math.max(0,a.stamina);
  a.stamina = Math.max(0,before-amount);
  if(amount<=0)return;
  let fatigueGain=0;
  if(before===0){
    fatigueGain=(actionType==='attack'||actionType==='technique')
      ?TEST_CONFIG.fatigueExhaustedAttackGain
      :TEST_CONFIG.fatigueExhaustedDefenseGain;
  }else if(a.stamina<=TEST_CONFIG.lowReserve){
    fatigueGain=TEST_CONFIG.fatigueLowGain;
  }
  const oldFatigue=clamp(a.fatigue??0,0,TEST_CONFIG.fatigueCap);
  a.fatigue=clamp(oldFatigue+fatigueGain,0,TEST_CONFIG.fatigueCap);
  const added=a.fatigue-oldFatigue;
  if(added>0){
    const reason=before===0?'exhausted exertion':'low Stamina';
    log(state,`${a.name} gains ${added} Fatigue from ${reason}. `+
      `Total Fatigue: ${a.fatigue}/100.`,'fatigue',
      {actor:who,amount:added,fatigue:a.fatigue,reason,actionType});
  }
}
function grant(state, who, amount) {
  const a = state[who];
  a.momentum = Math.min(100, a.momentum + amount);
  log(state, `${a.name} gains ${amount} Momentum.`,'momentum',{actor:who,amount});
}
function result(state, outcome, explanation) {
  state.status = 'finished'; state.outcome = outcome; state.intent = null;
  const label=({player_victory:'The fight ends',player_defeat:'You are defeated',player_escaped:'You get away'})[outcome]??'Encounter ends';
  log(state, `${label}. ${explanation}`,'outcome');
}
function downed(state) {
  if (state.player.hp <= 0) { result(state, 'player_defeat', 'You fall, unable to carry on. The encounter is lost.'); return true; }
  if (state.enemy.hp <= 0) { result(state, 'player_victory', `${state.enemy.name} can no longer continue the fight.`); return true; }
  return false;
}
function shouldHumanYield(s) {
  if(s.scene==='boar')return false;
  const e=s.enemy,p=s.player;
  const enemyCondition=e.hp/Math.max(1,e.ceiling);
  const playerCondition=p.hp/Math.max(1,p.ceiling);
  if(enemyCondition>.55) return false;

  // Having been struck a few times is not enough to justify giving up when the
  // opponent is collapsing. This was the v0.5 bug: Flint withdrew with 18/50
  // Health despite having reduced the unarmed player to 2/50. These gates are
  // illustrative AI weights, NOT a final universal morale or surrender formula.
  const playerAboutToFall=playerCondition<=.25;
  const enemyClearlyHealthier=(enemyCondition-playerCondition)>=.08 && e.hp>p.hp;
  const enemyCanKeepPressing=e.stamina>=10;
  if(playerAboutToFall&&enemyClearlyHealthier&&enemyCanKeepPressing) return false;

  // Retreat still depends on visible pressure and the actor's actual objectives;
  // nonlethal victory remains possible without taking every enemy to zero.
  const outmatched=enemyCondition<=.30;
  const pressured=p.momentum>=15 || (e.wounds?.length??0)>0 || hasOpening(s,'player')
    || s.distance!=='contact' || (s.lastPlayerActions??[]).filter(x=>x==='attack'||x==='technique').length>=2;
  if(!pressured&&!outmatched)return false;
  // Preserve the existing nonlethal outcomes and opponent-specific probabilities
  // except where the actor is clearly winning against a near-downed player.
  // All probabilities remain prototype values, not locked character statistics.
  const odds=outmatched?.72:s.scene==='silas'?.26:.34;
  return rng(s)<odds;
}
function makeIntent(state) {
  if(state.status!=='active')return null;
  const {enemy:e,scene,distance}=state;
  // Exhausted NPCs use the same restrictions as the player. Recovery removes
  // Fatigue, so they will never loop permanently at 70 or 100.
  if(e.fatigue>=TEST_CONFIG.fatigueAttackLock){
    return {type:'recover',mode:e.composure<40?'nerves':'breath',speed:2,
      signal:'exhausted',tell:`${e.name} breathes hard and struggles to steady their stance.`};
  }
  // The committed action is stored, but the public cue is deliberately coarse.
  if(scene==='boar' && hasClearBoarExit(state)){
    if(rng(state)<.77) return {type:'withdraw',speed:8,signal:'restless',
      tell:'The boar tests the ground beyond the fence. It seems ready to move, but keeps an eye on you.'};
    return {type:'guard',speed:10,signal:'restless',
      tell:'The boar hesitates, shifting its weight off the injured leg while watching the opening.'};
  }
  if(scene!=='boar' && shouldHumanYield(state))
    return {type:'withdraw',speed:8,signal:'uncertain',
      tell:scene==='flint'?'Flint draws a slow breath and glances past the cart. His grip loosens.':'Silas turns towards the coal box, uncertain whether to press the quarrel.'};
  if(distance!=='contact' && !(scene==='boar' && distance==='near')){
    return {type:'move',to:'close',speed:5,signal:'repositioning',tell:scene==='boar'
      ?'The boar paws at the ground and shifts towards the narrow way.'
      :freshPhrase(state,'approach',[`${e.name} looks for a way round the obstruction.`,`${e.name} tests the distance, unwilling to let you slip away.`,`${e.name} changes footing to keep you within reach.`])};
  }
  // Evaluate prior actions only. The AI NEVER sees the user's uncommitted choice.
  const history=state.lastPlayerActions??[];
  const repeatedAttack=history.length>=2&&history.slice(-2).every(x=>x==='attack'||x==='technique');
  if(e.momentum>=20 && scene!=='boar' && (e.momentum>=30 || rng(state)<.70)){
    return scene==='flint'
      ? {type:'technique',zone:'torso',speed:2,momentumCost:20,ability:'Driving Blow',tracking:false,signal:'heavy threat',
          tell:'Flint sets both hands on his club and puts his weight behind the next movement. A heavy blow may follow.'}
      : {type:'technique',zone:'limbs',speed:3,momentumCost:20,ability:'Hook and Draw',tracking:false,signal:'heavy threat',
          tell:'Silas sets the curved iron low and braces his stance. He looks capable of a hard, wrenching move.'};
  }
  if(scene==='silas' && state.player.momentum>=15 && state.round===1) return {type:'guard',speed:10,signal:'watchful',tell:'Silas shifts the hook across his chest, studying your movements.'};
  const defensiveChance=scene==='silas'?.24:scene==='flint'?.04:0; // Flint mostly presses; rarely guards
  if(scene!=='boar' && state.round>1 && ((repeatedAttack && rng(state)<(scene==='flint'?.10:.72)) ||
        (state.player.momentum>=10 && rng(state)<defensiveChance))) {
    return {type:'guard',speed:10,signal:'watchful',
      tell:scene==='flint'?'Flint squares his shoulders, club held across him. He watches for your commitment.'
        :'Silas plants his boots, turning the hook slightly as he watches your hands.'};
  }
  // Charge can reach NEAR, but is committed to the visible player's *old* spot.
  // It never changes target after reading the next Move.
  if(scene==='boar' && distance==='near' && rng(state)<.28){
    return {type:'move',to:'close',speed:5,signal:'repositioning',
      tell:'The boar limps along the fence, testing the gap again.'};
  }
  const zone=(scene==='boar'||rng(state)<.75)?'torso':'limbs';
  return {type:'attack',zone,targetSpot:scene==='boar'?state.terrain.playerSpot:null,tracking:false,speed:scene==='flint'?1:scene==='boar'?(distance==='near'?7:5):4,
    signal:scene==='boar'?'threatening':'watchful',
    tell:scene==='flint'?freshPhrase(state,'flint-cue',[
      'Flint adjusts his grip on the club and leans into the passage.',
      'Flint watches your feet before shifting his own.',
      'Flint lowers the club a little. His shoulders stay tight.',
      'The enforcer plants a boot by the cart, weighing up the gap.'])
      :scene==='boar'?freshPhrase(state,'boar-cue',[
       'The injured boar lowers its head, tense beside the broken fence.',
       'The boar scrapes the ground with its sound foreleg. It has not settled.',
       'A sharp snort; the boar shifts and looks for space.'])
      :freshPhrase(state,'silas-cue',[
        'Silas shifts the iron hook across his body, eyes flicking between you and the box.',
        'Silas edges forward a fraction, keeping the hook ready.',
        'The watchman turns his wrist, testing the weight of the iron.'])};
}

export function newEncounter(scene, opts = {}) {
  if (!['flint','boar','silas'].includes(scene)) throw new CombatError('Unknown fixture');
  const approach=opts.approach??'hold';
  if(scene==='boar'&&!['hold','fence','embankment'].includes(approach))throw new CombatError('Unknown boar staging');
  const enemies = {
    flint: {name:'Flint', hp:50, hpMax:50, ceiling:50,readiness:0,
      weapon:{damage:15,minDamage:14,maxDamage:17,accuracy:.49,guardMitigation:.60,type:'blunt',reach:'contact'}},
    boar: {name:'Young Injured Wild Boar', hp:30,hpMax:65,ceiling:65, readiness:1,
      weapon:{damage:12,accuracy:.70,guardMitigation:.30,type:'blunt',reach:'contact'}},
    silas: {name:'Silas Pumpard', hp:50,hpMax:50,ceiling:50,readiness:0,
      weapon:{damage:8,accuracy:.68,guardMitigation:.50,type:'sharp',reach:'contact'}},
  };
  const state = {
    id:opts.id ?? `test-${scene}`, scene, round:1, revision:0, rng:opts.seed ?? 123,
    status:'active', outcome:null, distance:scene==='boar'&&approach!=='hold'?'near':'contact', pathOpen:false, side:false,
    approach:scene==='boar'?approach:null,
    terrain:scene==='boar'?{playerSpot:approach==='fence'?'fence':approach==='embankment'?'shoulder':'lane',laneClear:approach!=='hold',mouthClear:false,fenceBlocked:false}:null,
    openings:{player:null,enemy:null},lastPlayerActions:[],lastEnemyActions:[],narrativeRecent:[],
    player:actor('Player', opts.player), enemy:actor(enemies[scene].name, {...enemies[scene], ...opts.enemy}),
    intent:null, events:[], receipts:[],
  };
  if(scene==='boar'){
    state.enemy.wounds=[{type:'existing_leg_injury',zone:'limbs',limb:'leg',severity:'serious',preexisting:true}];
    if(approach==='embankment')state.player.readiness+=1; // trial firm-footing effect
  }
  state.intent = makeIntent(state);
  return state;
}
function verifyAction(s,a) {
  if (!a || !['attack','guard','move','use','recover','withdraw','technique'].includes(a.type)) throw new CombatError('Unknown action');
  if(!canActAtFatigue(s.player,a.type))
    throw new CombatError(s.player.fatigue>=TEST_CONFIG.fatigueCap
      ?'At 100 Fatigue only Recover is available'
      :'At 70 Fatigue or more only Reposition and Recover are available');
  if(a.type==='attack'||a.type==='technique') {
    if (s.distance !== 'contact') throw new CombatError('Target out of contact reach');
    if (!['head','torso','limbs'].includes(a.zone ?? 'torso')) throw new CombatError('Invalid aim zone');
    if (a.type==='technique' && s.player.momentum<20) throw new CombatError('Insufficient Momentum');
  }
  if(a.type==='move' && !['side','close','cover','back'].includes(a.to)) throw new CombatError('No such reachable destination');
  if(a.type==='use' && (a.item !== 'bandage'||s.player.bandages<1||s.player.bleed<1)) throw new CombatError('No applicable bandage/bleeding');
  if(a.type==='recover' && !['breath','nerves'].includes(a.mode)) throw new CombatError('Select a recovery mode');
}
function actionSpeed(who, a, s) {
  const speed = a.speed ?? ({attack:4,guard:10,move:6,use:3,recover:2,withdraw:5,technique:3}[a.type]);
  // Repeated arm hits slow committed attacks, not only their accuracy.
  const impaired=s[who].armImpaired&&(a.type==='attack'||a.type==='technique');
  return speed + s[who].readiness-(impaired?1:0);
}
function tryAttack(s, who, a) {
  const src=s[who],targetWho=who==='player'?'enemy':'player',dst=s[targetWho];
  const zone=a.zone??'torso';
  const special=a.type==='technique';
  const ability=a.ability??(who==='player'?'Press Advantage':'Technique');
  if (special) {
    const spend=a.momentumCost??20;
    if(src.momentum<spend) { log(s,`${src.name} cannot muster the Momentum for ${ability}.`,'warning');return; }
    src.momentum-=spend;
    log(s,`${src.name} commits ${spend} Momentum to ${ability}.`,'technique',{actor:who,amount:-spend});
  }
  // The chance advertised before confirming an action uses the fighter's
  // starting Fatigue. The action's new exertion applies on the next attack,
  // avoiding a hidden penalty at the moment of confirmation.
  const fatigueAtCommit=src.fatigue??0;
  cost(s,who,special?15:testAttackCost(s,who),special?'technique':'attack');
  // A failed committed dodge lets this specific club swing catch the mover
  // despite new spacing. A successful dodge uses the ordinary reach/miss path.
  const caughtDodging=who==='enemy'&&s.scene==='flint'&&
    s.dodgeAttempt?.attempted===true&&!s.dodgeAttempt.success;
  if(!caughtDodging&&(s.distance==='far' ||
    (s.distance==='near' && !(s.scene==='boar' && who==='enemy')))){
    log(s,`${src.name}'s committed ${special?'maneuver':'strike'} falls short. The target is no longer within reach.`,'miss',{actor:who});
    return;
  }
  if(s.scene==='boar'&&who==='enemy'&&a.targetSpot&&s.terrain.playerSpot!==a.targetSpot){
    log(s,'The boar drives at the place you occupied, missing as you clear its charge line.','miss',
      {actor:'enemy',zone,damage:0,reason:'old_position'});
    return;
  }
  const exploited=hasOpening(s,who);
  const edge=exploited?s.openings[who]:null;
  if(exploited)s.openings[who]=null;
  const impairment=src.armImpaired?.10:0;
  const fatiguePenalty=fatigueAccuracyPenalty({fatigue:fatigueAtCommit});
  const chance=clamp(src.weapon.accuracy+TEST_CONFIG.aim[zone]-
    (special&&who==='enemy'?.07:0)+(exploited?(edge.accuracyBonus??.20):0)-
    impairment-fatiguePenalty,.05,.95);
  if (rng(s)>=chance) {
    const actions=who==='player'
      ? ["Your blow passes wide. You find nothing but air.","You commit to the strike, but the opponent slips outside its path.","You reach for an opening that closes too quickly."]
      :s.scene==='flint'
       ? ["Flint's club whistles past you and cracks against empty cobbles.","Flint overreaches. The heavy club misses you entirely.","The club cuts the air beside your shoulder, missing by a hand's breadth."]
       :s.scene==='boar'
        ? ["The boar rushes past, hooves scraping at the ground.","Its head drives through the gap you have already left behind."]
        :["The coal hook catches nothing but air.","Silas lunges, but the curved iron passes clear of you."];
    log(s,freshPhrase(s,`miss-${who}-${s.scene}`,actions),'miss',{actor:who,zone,damage:0});
    if(targetWho==='player' && (s.scene==='flint'||special))opening(s,'player',special?'the committed heavy swing goes wide':'the swing runs past your guard');
    return;
  }
  const base=src.weapon.damage;
  // TRIAL ONLY: ±roughly 30% damage spread. Never change final equipment stats from this spike.
  const lo=Math.max(1,src.weapon.minDamage??Math.floor(base*.72));
  const hi=Math.max(lo,src.weapon.maxDamage??Math.ceil(base*1.3));
  const profile=who==='player'&&isUnarmedWeapon(src.weapon)
    ?(special?TEST_CONFIG.unarmedTechnique:TEST_CONFIG.unarmedDamage)[zone]:null;
  const damageLo=profile?.[0]??(lo+(special?4:0));
  const damageHi=profile?.[1]??(hi+(special?4:0));
  const rolled=damageLo+Math.floor(rng(s)*(damageHi-damageLo+1));
  const openingDamageBonus=exploited?(edge.damageBonus??5):0;
  const raw=rolled+openingDamageBonus;
  // A Guard cuts 30–60% of a landed strike. The single deterministic roll
  // is part of the committed combat state, so replay and reload are identical.
  const reduction=dst.guard?
    TEST_CONFIG.guardReduction.min+rng(s)*(TEST_CONFIG.guardReduction.max-
      TEST_CONFIG.guardReduction.min):0;
  const damage=Math.max(0,Math.round(raw*(1-reduction)));
  dst.hp=Math.max(0,dst.hp-damage);
  const part=woundName(s,who,zone);
  let narrative;
  if (who==='player') narrative=freshPhrase(s,`hit-${who}-${s.scene}`,[
    `Your fist catches ${dst.name} across the ${part}.`,
    `You catch ${dst.name} off balance with a blow to the ${part}.`,
    `Your strike connects with ${dst.name}'s ${part}.`]);
  else if (s.scene==='flint') narrative=freshPhrase(s,'hit-flint',[
    `Flint's club slams into your ${part}.`,
    `The cudgel catches your ${part} with a dull thud.`,
    `Flint steps through the swing. The heavy wood strikes your ${part}.`]);
  else if (s.scene==='boar') narrative=freshPhrase(s,'hit-boar',[
    `The boar's weight catches you hard across the ${part}.`,
    `The animal's charge collides with your ${part}.`]);
  else narrative=freshPhrase(s,'hit-silas',[
    `Silas's iron hook clips your ${part}.`,
    `The curved work iron strikes along your ${part}.`,
    `Silas catches you with the hook as he steps inside your reach.`]);
  if(exploited)narrative=`${src.name==='Player'?'You take the opening.':src.name+' exploits the opening.'} ${narrative}`;
  // Explain exceptional damage within the same persisted event. The roll and
  // opening bonus are distinct; Guard may still reduce the resulting total.
  const damageBreakdown=openingDamageBonus>0
    ?` ${rolled} base damage + ${openingDamageBonus} Opening bonus = ${raw} before Guard.`:'';
  // Truthful, situation-driven detail, never invented injuries or scenery.
  const prior=s.lastPlayerActions?.at(-1);
  const contextual=who==='player' && prior==='guard'?' You have just come out of a defensive stance.'
    :who==='enemy'&&s.scene==='flint'&&s.player.hp<25?' The narrow passage gives you little space to absorb another hit.'
    :who==='enemy'&&s.scene==='boar'&&s.terrain.playerSpot==='fence'?' The broken fence offers little room for the animal to turn.'
    :who==='player'&&s.enemy.hp<s.enemy.hpMax/2?' The opponent is plainly struggling now.':'';
  const guardText=dst.guard?` ${dst.name==='Player'?'Your guard':'Their guard'} absorbs ${raw-damage} of the impact.`:'';
  log(s,`${narrative}${damageBreakdown}${guardText} ${dst.name==='Player'?'You lose':dst.name+' loses'} ${damage} Health.${contextual}`,
      'damage',{actor:who,target:targetWho,zone,raw,damage,
        baseDamage:rolled,openingDamageBonus,guarded:dst.guard,
        guardReductionPercent:dst.guard?Math.round(reduction*100):0,
        ability:special?ability:null});
  if(src.weapon.type==='sharp' && damage>=6 && dst.bleed===0) {
    dst.bleed=1;dst.wounds.push({type:'cut',zone,severity:'minor'});
    log(s,`${dst.name==='Player'?'A shallow cut opens.':'A shallow cut opens on '+dst.name+'.'} Light bleeding begins.`,'wound',{actor:targetWho});
  }
  // The stronger ordinary Flint hit isn't automatically a serious wound.
  // Trial serious thresholds reflect impact type; still NOT final injury balance.
  if(damage >= (src.weapon.type==='blunt'?19:15)){
    dst.ceiling=Math.max(1,dst.hpMax-8);dst.hp=Math.min(dst.hp,dst.ceiling);
    if(!dst.wounds.some(w=>w.severity==='serious'))dst.wounds.push({type:'impact',zone,severity:'serious'});
    log(s,`${dst.name} suffers a severe impact. Their effective Health ceiling is reduced.`,'wound',{actor:targetWho});
  }
  if(damage>0&&zone==='limbs'){
    dst.armHits=(dst.armHits??0)+1;
    if(dst.armHits===2){
      dst.armImpaired=true;
      // An armed reload action is not present in Stage 6, but the persisted
      // impairment modifier can be consumed by one when weapon reload exists.
      dst.reloadSlowdownPercent=25;
      log(s,`${dst.name} has taken repeated arm strikes. Attack accuracy is reduced by 10 percentage points.`,
        'wound',{actor:targetWho,zone:'limbs',condition:'arm_impaired'});
    }
  }
  if(!special&&damage>0)grant(s,who,TEST_CONFIG.strikeMomentum);
  if(dst.guard&&damage>0&&raw>damage){grant(s,targetWho,TEST_CONFIG.guardMomentum);opening(s,targetWho,'the blow is checked by a firm guard');}
}
function perform(s,who,a) {
  if(s.status !== 'active') return;
  const x=s[who];
  switch(a.type) {
    case 'attack':case 'technique':tryAttack(s,who,a);break;
    case 'guard': cost(s,who,TEST_CONFIG.guardCost,'guard');log(s,x.name==='Player'?'You brace for the incoming blow, letting your chance to strike pass.':`${x.name} raises a deliberate guard and waits for your attack.`, 'guard', {actor:who});break;
    case 'move':
      cost(s,who,TEST_CONFIG.moveCost,'move');
      if(who==='enemy') {s.distance='contact'; s.side=false; log(s,`${x.name} steps around the obstruction and closes the gap.`, 'move',{actor:who});}
      else if(a.to==='close'){s.distance='contact';s.side=false;setBoarPosition(s,'close');log(s,'You step forward, close enough to trade blows.','move',{actor:who});}
      else {s.distance=a.to==='back'?'far':'near';s.side=true;
        const previousSpot=s.terrain?.playerSpot;setBoarPosition(s,a.to);
        const text=s.scene==='boar' ? ({
          side:previousSpot==='back'?'You step off the retreat line, leaving the firm gap clear.':'You sidestep the charge lane, but the narrow exit still needs room.',
          cover:"You get behind the broken fence; it shelters you, but still crowds the animal's escape.",
          back:previousSpot==='shoulder'||previousSpot==='fence'?'You retreat out of the narrow mouth, leaving a clear passage onto firm ground.':'You retreat straight down the narrow path. The boar still faces you in its way.'
        })[a.to] : ({side:'You slip sideways, changing the line of attack.',cover:'You duck behind the obstruction.',back:'You give ground, putting distance between you.'})[a.to];
        log(s,text,'move',{actor:who,position:s.terrain?.playerSpot,exitClear:hasClearBoarExit(s)});
      }
      break;
    case 'recover': {
      const formerFatigue=clamp(x.fatigue??0,0,TEST_CONFIG.fatigueCap);
      x.fatigue=Math.max(0,formerFatigue-TEST_CONFIG.fatigueRecovery);
      const fatigueRemoved=formerFatigue-x.fatigue;
      const fatigueText=fatigueRemoved>0?` −${fatigueRemoved} Fatigue.`:'';
      if(a.mode==='breath'){
        const gain=Math.min(TEST_CONFIG.recoverGain,100-x.stamina);
        x.stamina+=gain;
        log(s,`${x.name==='Player'?'You draw a slow breath and steady your weight.':x.name+' pauses to recover.'} +${gain} Stamina.${fatigueText}`,
          'recovery',{actor:who,mode:'breath',staminaRestored:gain,fatigueRemoved});
      }else{
        const gain=Math.min(TEST_CONFIG.mentalRecoverGain,100-x.composure);
        x.composure+=gain;
        log(s,`${x.name==='Player'?'You force your breathing back under control.':x.name+' steadies themself.'} +${gain} Composure.${fatigueText}`,
          'recovery',{actor:who,mode:'nerves',composureRestored:gain,fatigueRemoved});
      }
      break;
    }
    case 'use':
      cost(s,who,TEST_CONFIG.useCost,'use');x.bandages--;x.bleed=0;
      log(s,`${x.name==='Player'?'You bind the wound firmly.':x.name+' binds a wound.'} Bleeding is controlled, but the injury remains.`,'wound');break;
    case 'withdraw':
      if(who==='enemy') result(s,'player_victory',s.scene==='boar'?'The wounded boar limps through the opening and disappears beyond the fence.':s.scene==='flint'?'Flint lowers his club and backs away from the passage.':'Silas gives ground and ends the assault, remaining by the locked coal box.');
      else if(s.distance==='far') result(s,'player_escaped','You put enough distance between yourself and the threat to leave the fight.');
      else log(s,'You try to break away, but your opponent is still close enough to bar the route.','warning');break;
    default: throw new CombatError('Unsupported resolved action');
  }
}
/** Call ONCE within a server transaction/CAS. Duplicate IDs return unchanged state. */
export function step(input, chosen, {requestId,expectedRevision}={}) {
  if(!requestId)throw new CombatError('Idempotency requestId is required');
  if(input.receipts.includes(requestId))return input;
  if(expectedRevision!==input.revision)throw new CombatError('Stale encounter revision');
  if(input.status!=='active')throw new CombatError('Encounter is over');
  verifyAction(input,chosen);
  const s=copy(input);s.events=[];
  s.player.fatigue=clamp(s.player.fatigue??0,0,TEST_CONFIG.fatigueCap);
  s.enemy.fatigue=clamp(s.enemy.fatigue??0,0,TEST_CONFIG.fatigueCap);
  s.dodgeAttempt=null;
  // Handle legacy saved intents committed before Fatigue had action locks.
  // Otherwise an exhausted NPC might execute an obsolete attack after reload.
  const foe=canActAtFatigue(s.enemy,s.intent?.type)?s.intent:makeIntent(s);
  log(s,foe.tell,'intent',{actor:'enemy'});
  if(chosen.type==='technique' && s.player.momentum<20)throw new CombatError('No Momentum');
  s.player.guard=chosen.type==='guard';s.enemy.guard=foe.type==='guard';
  const turns=[{who:'player',a:chosen},{who:'enemy',a:foe}]
    .sort((x,y)=>actionSpeed(y.who,y.a,s)-actionSpeed(x.who,x.a,s) || (x.who==='player'?-1:1));
  let movedSuccessfullyAvoiding=false;
  for(const t of turns){
    if(s.status!=='active')break;
    if(s[t.who].hp<=0)continue;
    const before=s.distance;
    perform(s,t.who,t.a);
    if(t.who==='player'&&t.a.type==='move'&&foe.type==='attack'&&
      actionSpeed('player',t.a,s)>=actionSpeed('enemy',foe,s)){
      const outOfReach=(before==='contact'&&s.distance!=='contact'&&s.scene!=='boar') ||
        (s.scene==='boar'&&foe.targetSpot&&s.terrain.playerSpot!==foe.targetSpot);
      if(outOfReach&&s.scene==='flint'){
        const chance=TEST_CONFIG.dodgeChance[t.a.to]??0;
        const success=rng(s)<chance;
        s.dodgeAttempt={attempted:true,success,chance};
        if(success){
          movedSuccessfullyAvoiding=true;
          log(s,`You dodge Flint's committed swing (${Math.round(chance*100)}% chance).`,
            'tactical',{actor:'player',condition:'dodge_success',chance});
        }else{
          log(s,`Your reposition does not evade the committed club swing (${Math.round(chance*100)}% dodge chance).`,
            'tactical',{actor:'player',condition:'dodge_failed',chance});
        }
      }else if(outOfReach)movedSuccessfullyAvoiding=true;
    }
    if(downed(s))break;
  }
  if(s.status==='active'&&movedSuccessfullyAvoiding) {grant(s,'player',TEST_CONFIG.moveMomentum);opening(s,'player','your opponent strikes the space you just left');}
  if(s.status==='active'){
    for (const who of ['player','enemy']) {
      const a=s[who];if (a.bleed>0) {const tick=TEST_CONFIG.bleedDamage[a.bleed];a.hp=Math.max(0,a.hp-tick);log(s,`${a.name==='Player'?'Blood seeps from your injury. You lose':a.name+' continues to bleed and loses'} ${tick} Health at bleed cleanup.`,'bleed',{actor:who,target:who,damage:tick});}
    }
    downed(s);
  }
  s.player.guard=false;s.enemy.guard=false;
  s.dodgeAttempt=null;
  s.lastPlayerActions.push(chosen.type);if(s.lastPlayerActions.length>4)s.lastPlayerActions.shift();
  s.lastEnemyActions.push(foe.type);if(s.lastEnemyActions.length>4)s.lastEnemyActions.shift();
  // An observable vulnerability, not a hidden accuracy penalty: only after two
  // genuine successive ordinary Strikes. Applies symmetrically to NPCs.
  if(s.status==='active' && s.lastPlayerActions.length>=2 && s.lastPlayerActions.slice(-2).every(x=>x==='attack')){
    s.openings.enemy={expires:s.round+1,reason:'your repeated attacks leave your stance open',accuracyBonus:.18,damageBonus:0};
    log(s,'You have pressed forward with consecutive strikes. Your guard is left open; a change of action can recover control.','tactical',{actor:'player',condition:'overcommitted'});
  }
  if(s.status==='active' && s.lastEnemyActions.length>=2 && s.lastEnemyActions.slice(-2).every(x=>x==='attack')){
    s.openings.player={expires:s.round+1,reason:'the opponent repeats the same committed attack',accuracyBonus:.12,damageBonus:0};
  }
  s.receipts.push(requestId);s.revision++;s.round++;
  if(s.status==='active')s.intent=makeIntent(s);
  return s;
}
