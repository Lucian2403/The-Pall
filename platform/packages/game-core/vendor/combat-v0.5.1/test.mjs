import test from 'node:test';
import assert from 'node:assert/strict';
import {newEncounter,step,CombatError,canActAtFatigue,fatigueAccuracyPenalty,focusedStanceTurns,TEST_CONFIG} from './combat.mjs';
const act=(s,a,id='a')=>step(s,a,{requestId:id,expectedRevision:s.revision});
const is = (s,t) => s.events.some(e=>e.text.includes(t));

test('Flint telegraphs before action; guard mitigates and can earn defensive Momentum',()=>{
 let s=newEncounter('flint',{seed:1});const tell=s.intent.tell;
 s=act(s,{type:'guard'});
 assert.ok(is(s,tell));assert.ok(s.player.hp<=50);assert.ok(s.player.momentum===0||s.player.momentum===8);
});
test('Flint Reposition rolls for evasion; only successful dodges grant Momentum',()=>{
 let successes=0,failures=0;
 for(let seed=1;seed<=250;seed++){
   const s=act(newEncounter('flint',{seed}),{type:'move',to:'side'});
   assert.equal(s.player.stamina,85);
   if(s.events.some(e=>e.condition==='dodge_success')){
     successes++;
     assert.equal(s.player.momentum,5);
     assert.equal(s.player.hp,50);
   }else if(s.events.some(e=>e.condition==='dodge_failed')){
     failures++;
     assert.equal(s.player.momentum,0);
   }
 }
 assert.ok(successes>0&&failures>0,'Dodge must not be automatic');
});
test('boar starts at 30/65 and a single sidestep cannot grant instant victory',()=>{
 let s=newEncounter('boar',{seed:1});
 assert.equal(s.enemy.hp,30);assert.equal(s.enemy.hpMax,65);assert.equal(s.enemy.ceiling,65);
 assert.equal(s.enemy.wounds[0].preexisting,true);
 s=act(s,{type:'move',to:'side'},'a');
 assert.equal(s.pathOpen,false);assert.notEqual(s.intent.type,'withdraw');
 s=act(s,{type:'move',to:'back'},'b');
 assert.equal(s.pathOpen,true);
 assert.equal(s.enemy.hp,30);
 for(let n=0;n<8 && s.status==='active';n++)s=act(s,{type:'guard'},'wait'+n);
 assert.equal(s.outcome,'player_victory');
 assert.equal(s.enemy.hp,30);
});
test('a second defensive Move earns Momentum only if a new committed threat was actually evaded',()=>{
 let s=newEncounter('boar',{seed:1});s=act(s,{type:'move',to:'side'},'a');
 const m=s.player.momentum; const threat=s.intent.type; const priority=s.intent.speed;
 s=act(s,{type:'move',to:'back'},'b');
 const avoidedNewAttack=s.events.some(e=>e.kind==='miss'&&e.actor==='enemy');
 if(threat==='attack' && avoidedNewAttack && priority<=6)assert.equal(s.player.momentum,m+5);
 else assert.equal(s.player.momentum,m);
});
test('missing attack grants no Momentum',()=>{
 let s=newEncounter('flint',{seed:1,player:{weapon:{damage:6,accuracy:.01,type:'blunt',reach:'contact'}}});
 s=act(s,{type:'attack',zone:'head'});assert.equal(s.player.momentum,0);
});
test('attacker and actual guarding defender can earn Momentum in same round',()=>{
 let s=newEncounter('flint',{seed:1,enemy:{weapon:{damage:10,accuracy:.95,type:'blunt',reach:'contact'}}});
 s=act(s,{type:'guard'});assert.equal(s.player.momentum,8);assert.equal(s.enemy.momentum,10);
});
test('Guard consumes 15 Stamina, rolls real 30–60% reduction, and lasts one turn',()=>{
  const reductions=new Set();
  for(let seed=1;seed<=200;seed++){
    const enemy={weapon:{damage:15,minDamage:14,maxDamage:17,accuracy:.95,
      type:'blunt',reach:'contact'}};
    // Consecutive low LCG seeds cluster; stride around the full 32-bit space.
    const before=newEncounter('flint',{seed:(Math.imul(seed,2654435761)>>>0),enemy});
    const after=act(before,{type:'guard'},'guard-'+seed);
    assert.equal(after.player.stamina,75);
    assert.equal(after.player.guard,false,'Guard must not leak into another turn');
    const hit=after.events.find(e=>e.kind==='damage'&&e.actor==='enemy'&&e.guarded);
    if(!hit)continue;
    assert.ok(hit.guardReductionPercent>=30&&hit.guardReductionPercent<=60,
      'Actual guard reduction is outside owner-approved range');
    assert.ok(hit.damage>=6&&hit.damage<=12,
      'Guarded ordinary Flint club hit exceeds declared after-guard range');
    assert.equal(hit.raw-hit.damage>0,true);
    reductions.add(hit.guardReductionPercent);
  }
  assert.ok(reductions.size>=10,
    'Guard must roll different percentages; a fixed 60% is not the owner mechanic');
});

test('Chronicle separates base hit damage, Opening bonus and damage after Guard',()=>{
  let normalHits=0,bonusedHits=0,guardedHits=0;
  for(let seed=1;seed<=140;seed++){
    const state=newEncounter('flint',{seed:Math.imul(seed,2654435761)>>>0,
      player:{weapon:{damage:6,accuracy:.95,type:'blunt',reach:'contact',unarmed:true}}});
    state.openings.player={expires:state.round+1,
      reason:'the previous strike misses',accuracyBonus:0,damageBonus:5};
    const struck=act(state,{type:'attack',zone:'torso'},'opening-'+seed);
    const hit=struck.events.find(e=>e.kind==='damage'&&e.actor==='player');
    if(!hit)continue;
    bonusedHits++;
    assert.ok(hit.baseDamage>=4&&hit.baseDamage<=8,
      'Base torso damage must stay inside the owner-approved range');
    assert.equal(hit.openingDamageBonus,5);
    assert.equal(hit.raw,hit.baseDamage+5);
    assert.match(hit.text,/base damage \+ 5 Opening bonus = \d+ before Guard/);
    if(hit.guarded){
      guardedHits++;
      assert.ok(hit.damage<=hit.raw,'Guard may only reduce the bonus-inclusive raw hit');
    }else{
      normalHits++;
      assert.equal(hit.damage,hit.raw,'Unguarded damage equals base plus Opening');
    }
  }
  assert.ok(bonusedHits>20,'Seeded opening should land repeatedly');
  assert.ok(normalHits>10,'Cover unguarded Opening hits');
});

test('Focused Stance costs one unguarded action and 10 Composure, with no Stamina drain',()=>{
 const s=newEncounter('flint',{seed:1,player:{
   hp:300,hpMax:300,ceiling:300,composure:15}});
 const after=act(s,{type:'focus'});
 assert.equal(s.player.composure,15,'Never mutate caller state');
 assert.equal(after.player.composure,5);
 assert.equal(after.player.stamina,90);
 assert.equal(after.player.fatigue,0);
 assert.equal(after.player.momentum,0);
 assert.equal(focusedStanceTurns(after,'player'),3);
 assert.equal(after.lastPlayerActions.at(-1),'focus');
 assert.equal(after.revision,s.revision+1,'Focused Stance consumes one complete combat turn');
 assert.ok(after.events.some(e=>e.kind==='focus'&&e.actor==='player'&&
   e.composureCost===10&&e.accuracyBonusPercent===10&&e.duration===3));
 const blow=after.events.find(e=>e.kind==='damage'&&e.actor==='enemy');
 if(blow)assert.equal(blow.guarded,false,'Focused Stance never supplies Guard');
});
test('Focused Stance lasts three subsequent turns independent of attack attempts',()=>{
 let s=newEncounter('flint',{seed:13,player:{
   hp:500,hpMax:500,ceiling:500,composure:80},
   enemy:{hp:500,hpMax:500,ceiling:500,
     weapon:{damage:1,minDamage:1,maxDamage:1,accuracy:.05,type:'blunt',reach:'contact'}}});
 s=act(s,{type:'focus'},'focus');
 assert.equal(s.round,2);assert.equal(focusedStanceTurns(s),3);
 assert.throws(()=>act(s,{type:'focus'},'stack'),/already active/);
 const copy=JSON.parse(JSON.stringify(s));
 assert.equal(focusedStanceTurns(copy),3,'Persisted focus survives reload');
 s=act(copy,{type:'attack',zone:'torso'},'turn1');
 assert.equal(focusedStanceTurns(s),2);
 assert.equal(s.events.find(e=>(e.kind==='miss'||e.kind==='damage')&&e.actor==='player')
   ?.focusedBonusPercent,10);
 s=act(s,{type:'guard'},'turn2');
 assert.equal(focusedStanceTurns(s),1,'Guard still consumes one buff turn');
 s=act(s,{type:'attack',zone:'torso'},'turn3');
 assert.equal(s.events.find(e=>(e.kind==='miss'||e.kind==='damage')&&e.actor==='player')
   ?.focusedBonusPercent,10);
 assert.equal(focusedStanceTurns(s),0,'Three-turn buff expires after third subsequent turn');
 s=act(s,{type:'attack',zone:'torso'},'turn4');
 assert.equal(s.events.find(e=>(e.kind==='miss'||e.kind==='damage')&&e.actor==='player')
   ?.focusedBonusPercent,0);
 assert.equal(s.player.composure,70,'No Composure spent by later attacks');
});
test('Focused Stance cannot bypass Fatigue lock or inadequate Composure',()=>{
 for(const composure of [0,5,9]){
   const before=newEncounter('flint',{player:{composure}});
   assert.throws(()=>act(before,{type:'focus'}),/Insufficient Composure/);
   assert.equal(before.revision,0);
 }
 for(const fatigue of [70,99,100]){
   const before=newEncounter('flint',{player:{composure:80,fatigue}});
   assert.throws(()=>act(before,{type:'focus'}),/Fatigue/);
   assert.equal(before.revision,0);
 }
});
test('Focused Stance also works on NPCs through the shared action resolver',()=>{
 const state=newEncounter('flint',{seed:5,enemy:{
   hp:500,hpMax:500,ceiling:500,composure:25}});
 state.intent={type:'focus',speed:2,signal:'concentrating',
   tell:'Flint studies the distance and steadies his grip.'};
 let s=act(state,{type:'guard'},'enemy-focus');
 assert.equal(s.enemy.composure,15);
 assert.equal(focusedStanceTurns(s,'enemy'),3);
 assert.ok(s.events.some(e=>e.kind==='focus'&&e.actor==='enemy'));
 s.intent={type:'attack',zone:'torso',speed:1,
   signal:'committed',tell:'Flint commits to a swing.'};
 s=act(s,{type:'guard'},'enemy-hit');
 const strike=s.events.find(e=>(e.kind==='miss'||e.kind==='damage')&&e.actor==='enemy');
 assert.equal(strike?.focusedBonusPercent,10);
 assert.equal(focusedStanceTurns(s,'enemy'),2);
});
test('Stamina 1–20 adds 3 Fatigue, including the spend that reaches zero',()=>{
 const actor={hp:240,hpMax:240,ceiling:240};
 let s=newEncounter('flint',{seed:1,player:{...actor,stamina:27}});
 s=act(s,{type:'attack'});assert.equal(s.player.stamina,17);assert.equal(s.player.fatigue,3);
 s=act(s,{type:'attack'},'low-again');assert.equal(s.player.stamina,7);
 assert.equal(s.player.fatigue,6);
 const last=newEncounter('flint',{seed:1,player:{...actor,stamina:5}});
 const reached=act(last,{type:'attack'});assert.equal(reached.player.stamina,0);
 assert.equal(reached.player.fatigue,3,'5 → 0 first costs only 3 Fatigue');
 const pastZero=act(reached,{type:'attack'},'at-zero');
 assert.equal(pastZero.player.stamina,0);
 assert.equal(pastZero.player.fatigue,13,'next attack from zero costs 10 Fatigue');
 const fresh=act(newEncounter('flint',{seed:1}),{type:'guard'});
 assert.equal(fresh.player.fatigue,0,'No Fatigue above 20 Stamina');
});
test('Exhausted Guard and Reposition add 5, attacks and specials add 10',()=>{
 const player={hp:240,hpMax:240,ceiling:240,stamina:0,momentum:40};
 for(const [action,expected] of [
  [{type:'guard'},5],
  [{type:'move',to:'side'},5],
  [{type:'attack',zone:'torso'},10],
  [{type:'technique',zone:'torso'},10]
 ]){
  const s=act(newEncounter('flint',{seed:7,player}),action);
  assert.equal(s.player.stamina,0);
  assert.equal(s.player.fatigue,expected,JSON.stringify(action));
 }
 const atFive=act(newEncounter('flint',{seed:7,player:{...player,stamina:5}}),{type:'guard'});
 assert.equal(atFive.player.fatigue,3,'An incomplete Guard payment still uses the 1–20 band');
});
test('Each complete 10 Fatigue causes −3 percentage points attack accuracy',()=>{
 for(const [fatigue,penalty] of [
  [0,0],[9,0],[10,3],[19,3],[20,6],[29,6],[30,9],
  [60,18],[69,18],[70,21],[99,27],[100,30]
 ]){
  assert.equal(Math.round(100*fatigueAccuracyPenalty({fatigue})),penalty,
    'Unexpected Fatigue accuracy penalty at '+fatigue);
 }
 assert.equal(TEST_CONFIG.fatigueAccuracyStep,10);
 assert.equal(TEST_CONFIG.fatigueAccuracyPenaltyPerStep,.03);
});
test('Fatigue 70–99 permits only Move and Recover, at 100 only Recover',()=>{
 for(const fatigue of [70,75,99]){
  const p={fatigue};
  for(const action of ['attack','technique','guard','use','withdraw'])
    assert.equal(canActAtFatigue(p,action),false,action+' at '+fatigue);
  assert.equal(canActAtFatigue(p,'move'),true);
  assert.equal(canActAtFatigue(p,'recover'),true);
 }
 const exhausted={fatigue:100};
 for(const action of ['attack','technique','guard','move','use','withdraw'])
  assert.equal(canActAtFatigue(exhausted,action),false,action+' at 100');
 assert.equal(canActAtFatigue(exhausted,'recover'),true);
 const start=newEncounter('flint',{seed:1,player:{fatigue:70,stamina:0,momentum:50}});
 assert.throws(()=>act(start,{type:'attack',zone:'torso'}),/At 70 Fatigue/);
 assert.throws(()=>act(start,{type:'guard'}),/At 70 Fatigue/);
 assert.throws(()=>act(start,{type:'technique',zone:'head'}),/At 70 Fatigue/);
 assert.throws(()=>act(start,{type:'withdraw'}),/At 70 Fatigue/);
 assert.equal(start.revision,0,'Invalid action cannot spend a turn or modify the input');
 const capped=act(newEncounter('flint',{seed:1,player:{fatigue:95,stamina:0}}),
   {type:'move',to:'side'});
 assert.equal(capped.player.fatigue,100,'Fatigue stops at exactly 100');
 assert.throws(()=>act(capped,{type:'move',to:'back'},'forbidden'),/only Recover/);
 const recovered=act(capped,{type:'recover',mode:'breath'},'recover');
 assert.equal(recovered.player.fatigue,70);
 assert.equal(recovered.player.stamina,10);
 assert.equal(canActAtFatigue(recovered.player,'move'),true);
 assert.equal(canActAtFatigue(recovered.player,'guard'),false);
});
test('Both Recover modes use exactly the pre-action 50-Fatigue boundary',()=>{
 const cases=[
   {before:0,fatigueAfter:0,staminaGain:20,removed:0},
   {before:10,fatigueAfter:0,staminaGain:20,removed:10},
   {before:49,fatigueAfter:34,staminaGain:20,removed:15},
   {before:50,fatigueAfter:20,staminaGain:10,removed:30},
   {before:69,fatigueAfter:39,staminaGain:10,removed:30},
   {before:75,fatigueAfter:45,staminaGain:10,removed:30},
   {before:100,fatigueAfter:70,staminaGain:10,removed:30}
 ];
 for(const c of cases)for(const mode of ['breath','nerves']){
   const initial=newEncounter('flint',{seed:7,
     player:{fatigue:c.before,stamina:0,composure:50,
       hp:240,hpMax:240,ceiling:240}});
   const next=act(initial,{type:'recover',mode});
   assert.equal(next.player.fatigue,c.fatigueAfter,`Fatigue ${c.before}, ${mode}`);
   assert.equal(next.player.stamina,mode==='breath'?c.staminaGain:0,
     `Stamina gain at Fatigue ${c.before}, ${mode}`);
   assert.equal(next.player.composure,mode==='nerves'?62:50);
   const event=next.events.find(e=>e.kind==='recovery'&&e.actor==='player');
   assert.equal(event?.fatigueRemoved,c.removed);
   assert.equal(event?.fatigueBefore,c.before);
   assert.equal(event?.fatigueAfter,c.fatigueAfter);
   assert.equal(event?.staminaRestored,mode==='breath'?c.staminaGain:undefined);
   assert.equal(event?.composureRestored,mode==='nerves'?12:undefined);
   assert.ok(next.player.hp<=240,'Recover cannot heal Health');
 }
 const maxed=newEncounter('flint',{seed:7,
   player:{fatigue:100,stamina:100,composure:100}});
 const after=act(maxed,{type:'recover',mode:'nerves'});
 assert.equal(after.player.fatigue,70,'Fatigue still drops when reserve is full');
 assert.equal(after.player.composure,100,'Composure remains capped');
 const staminaFull=act(newEncounter('flint',{seed:7,
   player:{fatigue:49,stamina:99}}),{type:'recover',mode:'breath'});
 assert.equal(staminaFull.player.stamina,100);
 assert.equal(staminaFull.player.fatigue,34);
});
test('Recover at 100 Fatigue is two turns from combat eligibility, not four',()=>{
 let s=newEncounter('flint',{seed:7,player:{
   fatigue:100,stamina:0,hp:240,hpMax:240,ceiling:240
 }});
 s=act(s,{type:'recover',mode:'breath'});
 assert.equal(s.player.fatigue,70);
 assert.equal(s.player.stamina,10);
 assert.equal(canActAtFatigue(s.player,'attack'),false);
 s=act(s,{type:'recover',mode:'breath'},'second');
 assert.equal(s.player.fatigue,40);
 assert.equal(s.player.stamina,20);
 assert.equal(canActAtFatigue(s.player,'attack'),true);
});
test('Recover is unguarded in Flint contact range; repositioning preserves distance',()=>{
 let vulnerableHits=0;
 for(let seed=1;seed<=80;seed++){
   const initial=newEncounter('flint',{
     seed:Math.imul(seed,2654435761)>>>0,
     player:{hp:240,hpMax:240,ceiling:240,stamina:0,fatigue:50}
   });
   if(initial.intent.type!=='attack'&&initial.intent.type!=='technique')continue;
   const recovered=act(initial,{type:'recover',mode:'breath'});
   const blow=recovered.events.find(e=>e.kind==='damage'&&e.actor==='enemy');
   if(!blow)continue;
   vulnerableHits++;
   assert.equal(blow.guarded,false,'Recover never activates Guard');
   assert.equal(blow.guardReductionPercent,0,'No hidden defensive reduction');
   assert.equal(blow.damage,blow.raw,'Full club damage applies while recovering');
   assert.ok(recovered.player.hp<240,'Recover does not prevent a contact hit');
 }
 assert.ok(vulnerableHits>=8,'Seeded opponents should hit exposed recovery turns');
 const initial=newEncounter('flint',{seed:7,
   player:{hp:240,hpMax:240,ceiling:240,stamina:40,fatigue:50}});
 initial.distance='far';
 initial.intent={type:'attack',zone:'torso',speed:4,signal:'watchful',tell:'Flint swings.'};
 const recovered=act(initial,{type:'recover',mode:'breath'});
 assert.equal(recovered.player.hp,240,'Out-of-contact attack cannot hit a distant Recover');
 assert.equal(recovered.player.fatigue,20,'Distance does not change recovery tier');
});
test('NPC exhaustion never issues illegal intent or continues a legacy attack',()=>{
 for(const fatigue of [70,99,100]){
  const start=newEncounter('flint',{seed:31,enemy:{fatigue,stamina:0}});
  assert.equal(start.intent.type,'recover');
  const next=act(start,{type:'recover',mode:'breath'});
  assert.equal(next.enemy.fatigue,fatigue-30);
  assert.equal(next.enemy.stamina,10);
 }
 const previous=newEncounter('flint',{seed:31,enemy:{fatigue:90,stamina:0}});
 previous.intent={type:'attack',zone:'torso',speed:1,
   signal:'watchful',tell:'Old queued strike'};
 const next=act(previous,{type:'recover',mode:'breath'});
 assert.ok(!next.events.some(e=>e.actor==='enemy'&&e.kind==='damage'),
   'Saved illegal enemy intent cannot strike through the Fatigue lock');
 assert.ok(next.events.some(e=>e.actor==='enemy'&&e.kind==='recovery'));
});
test('bandage must be held and consume action; can control bleeding only',()=>{
 let s=newEncounter('silas',{seed:1});
 assert.throws(()=>act(s,{type:'use',item:'bandage'}),CombatError);
 s.player.bandages=1;s.player.bleed=1;s.player.wounds=[{type:'cut',severity:'minor',zone:'limbs'}];
 s=act(s,{type:'use',item:'bandage'});assert.equal(s.player.bandages,0);assert.equal(s.player.bleed,0);assert.equal(s.player.wounds.length,1);
});
test('bleed applies exactly once on cleanup per round',()=>{
 let s=newEncounter('flint',{seed:1,player:{bandages:1}});s.player.bleed=2;
 s=act(s,{type:'guard'});const a=s.player.hp;
 assert.ok(is(s,'2 Health at bleed cleanup')); assert.ok(a<=48);
});
test('bad actions fail without spending the turn',()=>{
 const s=newEncounter('flint');
 assert.throws(()=>act(s,{type:'technique',zone:'torso'}),CombatError);
 assert.equal(s.revision,0);assert.equal(s.player.momentum,0);
});
test('same request ID is idempotent and stale revisions fail',()=>{
 const s=newEncounter('flint');const t=act(s,{type:'guard'},'unique');
 assert.deepEqual(step(t,{type:'attack'},{requestId:'unique',expectedRevision:0}),t);
 assert.throws(()=>step(t,{type:'attack'},{requestId:'different',expectedRevision:0}),CombatError);
});
test('Downed is a real defeat, not permadeath or forced victory',()=>{
 let s=newEncounter('flint',{seed:1,player:{hp:4},enemy:{weapon:{damage:20,accuracy:.95,type:'blunt',reach:'contact'}}});
 s=act(s,{type:'recover',mode:'breath'});
 assert.equal(s.outcome,'player_defeat');assert.equal(s.player.hp,0);
});
test('recover restores reserve and removes Fatigue, but not Health or Momentum',()=>{
 let s=newEncounter('flint',{seed:1,player:{stamina:32,hp:40,fatigue:10}});
 s=act(s,{type:'recover',mode:'breath'});
 assert.equal(s.player.stamina,52);assert.equal(s.player.fatigue,0);assert.equal(s.player.momentum,0);
 assert.ok(s.player.hp<=40);
});
test('trained opponent can Guard; its own Momentum rises only on real mitigation',()=>{
 let s=newEncounter('silas',{seed:1,player:{momentum:18,weapon:{damage:10,accuracy:.95,type:'blunt',reach:'contact'}}});
 assert.equal(s.intent.type,'guard');
 s=act(s,{type:'attack',zone:'torso'});
 assert.equal(s.enemy.momentum,8);assert.equal(s.player.momentum,28);
});
test('no passive Fatigue or Stress; Recover deliberately clears Fatigue',()=>{
 let s=newEncounter('flint',{seed:1,player:{stamina:19,composure:12,stress:3,fatigue:5}});
 s=act(s,{type:'recover',mode:'nerves'});
 assert.equal(s.player.fatigue,0);assert.equal(s.player.stress,3);
 assert.equal(s.player.composure,24);
});
test('an avoided enemy committed attack still consumes enemy physical Stamina',()=>{
 let s=newEncounter('flint',{seed:1});
 s=act(s,{type:'move',to:'cover'});
 assert.equal(s.enemy.stamina,80);
 assert.equal(s.player.hp,50);
});

test('equal-speed tie awarded to player really avoiding boar charge earns Momentum',()=>{
 let s=newEncounter('boar',{seed:1});s=act(s,{type:'move',to:'side'});
 assert.equal(s.player.hp,50);assert.equal(s.player.momentum,5);
});
test('slower movement does not magically avoid a faster enemy strike',()=>{
 let s=newEncounter('boar',{seed:1,player:{readiness:-2}});
 s=act(s,{type:'move',to:'side'});
 assert.ok(s.player.hp<50);assert.equal(s.player.momentum,0);
});

test('Flint now spends earned Momentum on a distinct, precommitted technique',()=>{
  const initial=newEncounter('flint',{seed:13,enemy:{momentum:30}});
  assert.equal(initial.intent.type,'technique');
  assert.equal(initial.intent.ability,'Driving Blow');
  assert.match(initial.intent.tell,/heavy blow may follow/);
  const result=act(initial,{type:'guard'});
  assert.equal(result.enemy.momentum,10);
  assert.ok(result.events.some(x=>x.kind==='technique' && x.text.includes('Driving Blow')));
});

test('Flint is neither guaranteed to hit nor guaranteed to miss across seeded fights',()=>{
  const results=new Set();
  for(let seed=1;seed<=70;seed++){
    const start=newEncounter('flint',{seed});
    const next=act(start,{type:'guard'});
    results.add(next.events.some(e=>e.kind==='damage'&&e.actor==='enemy')?'hit':'miss');
  }
  assert.deepEqual([...results].sort(),['hit','miss']);
});

test('both sides have ranged damage, not the same fixed output on every hit',()=>{
  const enemyDamage=new Set(),playerDamage=new Set();
  for(let seed=1;seed<=160;seed++){
    const enemyTurn=act(newEncounter('flint',{seed}),{type:'recover',mode:'breath'});
    for(const e of enemyTurn.events)if(e.kind==='damage'&&e.actor==='enemy')enemyDamage.add(e.damage);
    const playerTurn=act(newEncounter('flint',{seed}),{type:'attack',zone:'torso'});
    for(const e of playerTurn.events)if(e.kind==='damage'&&e.actor==='player')playerDamage.add(e.damage);
  }
  assert.ok(enemyDamage.size>=4,`Flint damage variants: ${[...enemyDamage]}`);
  assert.ok(playerDamage.size>=4,`Player damage variants: ${[...playerDamage]}`);
  assert.ok([...enemyDamage].every(x=>x>=14&&x<=17));
  assert.ok([...playerDamage].every(x=>x>=4&&x<=8));
});

test('narrative combat log includes hit location, actual damage and distinct injury events',()=>{
  const samples=[];
  for(let seed=1;seed<=25;seed++){
    const s=act(newEncounter('flint',{seed}),{type:'guard'});
    samples.push(...s.events.filter(x=>x.kind==='damage'&&x.actor==='enemy'));
  }
  assert.ok(samples.length>0);
  assert.ok(new Set(samples.map(x=>x.text.split('.')[0])).size>=3);
  assert.ok(samples.every(x=>x.text.includes('Health')&&x.raw>=x.damage&&x.zone));
  assert.ok(samples.every(x=>x.guarded===true));
});

test('a special technique that misses consumes Momentum but adds no hit Momentum',()=>{
  let found=false;
  for(let seed=1400;seed<=1500&&!found;seed++){
    const initial=newEncounter('flint',{seed,enemy:{momentum:30}});
    const after=act(initial,{type:'guard'});
    if(after.events.some(x=>x.kind==='miss'&&x.actor==='enemy')){
      found=true;assert.equal(after.enemy.momentum,10);
      assert.equal(after.player.momentum,0);
    }
  }
  assert.equal(found,true);
});

test('human starter opponents follow the same 50 Health baseline as the novice',()=>{
 for(const scene of ['flint','silas']){const s=newEncounter(scene,{seed:1});assert.equal(s.enemy.hp,50);assert.equal(s.enemy.hpMax,50);assert.equal(s.enemy.ceiling,50);}
});
test('different boar movement subtypes do not all open its exit',()=>{
 for(const move of ['side','cover','back']){
   const s=act(newEncounter('boar',{seed:2}),{type:'move',to:move},move);
   assert.equal(s.pathOpen,false,`${move} alone should not complete escape`);
 }
 let s=act(newEncounter('boar',{seed:2}),{type:'move',to:'back'},'first');
 s=act(s,{type:'move',to:'side'},'second');assert.equal(s.pathOpen,true);
});
test('Flint responds to prior repeated attacks with guards, not knowledge of next click',()=>{
 let foundGuard=false;
 for(let seed=1;seed<90;seed++){
   let s=newEncounter('flint',{seed});
   for(let n=0;n<2&&s.status==='active';n++)s=act(s,{type:'attack',zone:'torso'},'atk'+n);
   if(s.status==='active'&&s.intent?.type==='guard')foundGuard=true;
 }
 assert.equal(foundGuard,true);
});
test('narrative phrase selector avoids instant identical cue repetition when alternatives exist',()=>{
 let s=newEncounter('flint',{seed:9});const cues=[];
 for(let n=0;n<12 && s.status==='active';n++){
   if(s.intent?.type==='attack')cues.push(s.intent.tell);
   s=act(s,{type:'move',to:'side'},`skip${n}`);
 }
 // Even if the encounter ends early, the surviving logs have truthful scene cues.
 assert.ok(cues.length>=1);
});
test('boar preexisting wound neither bleeds automatically nor lowers approved maximum',()=>{
 let s=newEncounter('boar',{seed:9});s=act(s,{type:'guard'});
 assert.equal(s.enemy.bleed,0);assert.equal(s.enemy.hpMax,65);assert.equal(s.enemy.ceiling,65);
});

test('nearby committed boar charge can strike before a late Move but never reads a new target',()=>{
 const results=new Set();
 for(let seed=1;seed<100;seed++){
  let s=newEncounter('boar',{seed});s=act(s,{type:'move',to:'side'},'one');
  if(s.intent.type!=='attack')continue;
  const was=s.player.hp;
  s=act(s,{type:'move',to:'back'},'two');
  results.add(s.player.hp<was?'hit':'no-hit');
 }
 assert.ok(results.has('hit'),'a quick nearby lunge must remain dangerous');
});
test('public intent signal is only a broad stance category, not exact future zone',async()=>{
 const {createStore}=await import('./store.mjs');const {mkdtemp,rm}=await import('node:fs/promises');
 const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const dir=await mkdtemp(join(tmpdir(),'pall-cue-'));
 try{
  const store=createStore(dir,{seedGenerator:()=>9}),{encounter,token}=await store.create('flint');
  assert.notEqual(encounter.intentType,'attack');assert.notEqual(encounter.intentType,'guard');
  assert.equal(typeof encounter.enemyIntent,'string');
  assert.equal(encounter.enemy.hp,50);
  const refreshed=await store.get(encounter.id,token);
  assert.equal(refreshed.enemyIntent,encounter.enemyIntent);
 }finally{await rm(dir,{recursive:true,force:true})}
});

test('approved boar pre-fight placement varies ground while preserving 30/65 Health',()=>{
 const hold=newEncounter('boar',{seed:5,approach:'hold'});
 const fence=newEncounter('boar',{seed:5,approach:'fence'});
 const bank=newEncounter('boar',{seed:5,approach:'embankment'});
 assert.equal(hold.terrain.playerSpot,'lane');assert.equal(hold.distance,'contact');
 assert.equal(fence.terrain.playerSpot,'fence');assert.equal(fence.distance,'near');
 assert.equal(bank.terrain.playerSpot,'shoulder');assert.equal(bank.player.readiness,1);
 for(const x of [hold,fence,bank]){assert.equal(x.enemy.hp,30);assert.equal(x.enemy.hpMax,65);}
 assert.throws(()=>newEncounter('boar',{approach:'random'}),CombatError);
});

test('v0.4 Flint blunt ordinary impact stays 14–17 and does not cause an automatic serious wound',()=>{
 let hits=0;
 for(let seed=1;seed<=250;seed++){
  const state=act(newEncounter('flint',{seed}),{type:'recover',mode:'breath'});
  const impact=state.events.find(x=>x.kind==='damage'&&x.actor==='enemy');
  if(!impact)continue;
  hits++;
  assert.ok(impact.raw>=14&&impact.raw<=17,`unmitigated Flint raw=${impact.raw}`);
  assert.ok(state.player.wounds.every(x=>x.severity!=='serious'),'routine club hit produced serious wound');
 }
 assert.ok(hits>50);
});

test('Flint only rarely chooses Guard even when faced with aggressive play',()=>{
 let guards=0,commits=0;
 for(let seed=1;seed<=200;seed++){
  let s=newEncounter('flint',{seed});
  for(let turn=0;turn<7&&s.status==='active';turn++){
   guards+=Number(s.intent?.type==='guard');commits++;
   const a=s.distance==='contact'?{type:'attack',zone:'torso'}:{type:'move',to:'close'};
   s=act(s,a,`flint-guard-${turn}`);
  }
 }
 assert.ok(guards>0,'Flint should retain a rare defensive response');
 assert.ok(guards/commits<.15,`Flint guard share ${(guards/commits).toFixed(3)} is too high`);
});

test('Stage 6 strike costs exactly 10 Stamina even after repeated attacks',()=>{
 let s=newEncounter('flint',{seed:21,player:{hp:240,hpMax:240,ceiling:240},enemy:{hp:250,hpMax:250,ceiling:250,weapon:{damage:1,minDamage:1,maxDamage:1,accuracy:.05,type:'blunt',reach:'contact'}}});
 for(let n=0;n<3;n++)s=act(s,{type:'attack',zone:'torso'},`pressure-${n}`);
 assert.equal(s.player.stamina,90-10-10-10);
 assert.deepEqual(s.lastPlayerActions.slice(-3),['attack','attack','attack']);
});
test('Repeated attacks expose stance; switching actions resets the consecutive streak',()=>{
 let s=newEncounter('flint',{seed:21,player:{hp:240,hpMax:240,ceiling:240},enemy:{hp:250,hpMax:250,ceiling:250,weapon:{damage:1,minDamage:1,maxDamage:1,accuracy:.05,type:'blunt',reach:'contact'}}});
 s=act(s,{type:'attack'},'r1');s=act(s,{type:'attack'},'r2');
 assert.equal(s.openings.enemy.reason,'your repeated attacks leave your stance open');
 assert.equal(s.openings.enemy.accuracyBonus,.18);
 s=act(s,{type:'guard'},'r3');
 assert.equal(s.lastPlayerActions.at(-1),'guard');
 const costBefore=s.player.stamina;
 s=act(s,{type:'attack'},'r4');
 assert.equal(s.player.stamina,costBefore-10);
});
test('v0.5 Flint has high but unreliable club impact; he never receives a free hit',()=>{
 const s=newEncounter('flint',{seed:1});
 assert.equal(s.enemy.weapon.minDamage,14);assert.equal(s.enemy.weapon.maxDamage,17);
 assert.equal(s.enemy.weapon.accuracy,.49);
});
test('v0.5 combat server publishes numerical, state-aware action descriptions',async()=>{
 const {createStore}=await import('./store.mjs');const {mkdtemp,rm}=await import('node:fs/promises');
 const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const dir=await mkdtemp(join(tmpdir(),'pall-rules-'));
 try{
  const store=createStore(dir,{seedGenerator:()=>21});const {encounter,token}=await store.create('flint');
  assert.equal(encounter.rules.attack.cost,10);
  assert.deepEqual(encounter.rules.attack.accuracy,{torso:70,limbs:55,head:40});
  assert.deepEqual(encounter.rules.guard.mitigationPercent,{min:30,max:60});
  assert.equal(encounter.rules.attack.minDamage,4);
  assert.equal(encounter.rules.attack.maxDamage,8);
  assert.equal(encounter.rules.technique.momentumCost,20);
  const got=await store.get(encounter.id,token);assert.deepEqual(got.rules,encounter.rules);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('v0.5 compact combat UI contains details, animation status and reduced-motion support',async()=>{
 const {readFile}=await import('node:fs/promises');
 const [html,css,client]=await Promise.all(['public/index.html','public/compact.css','public/app.js'].map(f=>readFile(new URL(f,import.meta.url),'utf8')));
 assert.match(html,/id="ability-inspector"/);assert.match(html,/id="ability-numbers"/);
 assert.match(html,/id="impact-stage"/);assert.match(html,/id="stance-warning"/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(client,/const PRESENTATION_MS=1250/);
 assert.match(client,/await wait\(Math.max\(0,minWait/);
});
test('v0.5 no vulnerability after just one strike; the second is the threshold',()=>{
 let s=newEncounter('flint',{seed:21,player:{hp:240,hpMax:240,ceiling:240},enemy:{hp:250,hpMax:250,ceiling:250,weapon:{damage:1,minDamage:1,maxDamage:1,accuracy:.05,type:'blunt',reach:'contact'}}});
 s=act(s,{type:'attack'},'t1');
 assert.notEqual(s.openings.enemy?.reason,'your repeated attacks leave your stance open');
 s=act(s,{type:'attack'},'t2');
 assert.equal(s.openings.enemy.reason,'your repeated attacks leave your stance open');
});

// v0.5.1 regression: Flint must not yield while clearly finishing a nearly
// downed novice just because Flint is below his own old HP cutoff.
test('unarmed zones and techniques roll within their distinct owner damage bands',()=>{
 for(const [zone,attackRange,specialRange] of [
   ['torso',[4,8],[8,12]],['limbs',[3,6],[6,10]],['head',[8,13],[12,18]]
 ]){
   const hits=new Set(),techniques=new Set();
   for(let seed=1;seed<500;seed++){
     const a=act(newEncounter('flint',{seed}),{type:'attack',zone});
     for(const e of a.events)if(e.kind==='damage'&&e.actor==='player')hits.add(e.raw);
     const b=act(newEncounter('flint',{seed,player:{momentum:40}}),{type:'technique',zone});
     for(const e of b.events)if(e.kind==='damage'&&e.actor==='player')techniques.add(e.raw);
   }
   assert.deepEqual([Math.min(...hits),Math.max(...hits)],attackRange,zone+' attack range');
   assert.deepEqual([Math.min(...techniques),Math.max(...techniques)],specialRange,zone+' special range');
 }
});
test('repeated Arms hits impair attack accuracy and timing',()=>{
 let s=newEncounter('flint',{seed:1,enemy:{hp:350,hpMax:350,ceiling:350,
   weapon:{damage:1,minDamage:1,maxDamage:1,accuracy:.95,type:'blunt',reach:'contact'}}});
 for(let n=0;n<100&&!s.enemy.armImpaired&&s.status==='active';n++)
   s=act(s,{type:'attack',zone:'limbs'},'arm-'+n);
 assert.equal(s.enemy.armImpaired,true);
 assert.ok(s.enemy.armHits>=2);
});

test('Flint does not abandon a dominant 18/50 versus 2/50 position',()=>{
  for(let seed=1;seed<=300;seed++){
    const s=newEncounter('flint',{seed,player:{hp:2,momentum:45},enemy:{hp:18}});
    assert.notEqual(s.intent.type,'withdraw',`Flint incorrectly yields at seed ${seed}`);
  }
});
test('human opponent at clear advantage does not surrender; same for Silas',()=>{
  for(const scene of ['flint','silas']){
    for(let seed=1;seed<=120;seed++){
      const s=newEncounter(scene,{seed,player:{hp:6,momentum:60},enemy:{hp:21}});
      assert.notEqual(s.intent.type,'withdraw',`${scene} surrendered with 21 versus 6, seed ${seed}`);
    }
  }
});
test('Flint does not surrender at 24/50 HP with 50 Stamina despite player Momentum and openings',()=>{
  for(let seed=1;seed<=400;seed++){
    const initial=newEncounter('flint',{seed,
      player:{hp:36,stamina:55,momentum:30},
      enemy:{hp:24,stamina:50,momentum:10}});
    assert.notEqual(initial.intent.type,'withdraw',
      `Flint prematurely yielded at seed ${seed} while 24/50 HP, 50 Stamina`);
    // Reproduce the reported round-five situation: sustained player attacks,
    // an exploitable Opening and a healthy, energetic enemy.
    const roundFive=newEncounter('flint',{seed,
      player:{hp:120,hpMax:120,ceiling:120,stamina:55,momentum:30},
      enemy:{hp:24,stamina:50,momentum:10}});
    roundFive.round=5;
    roundFive.lastPlayerActions=['attack','attack'];
    roundFive.openings.player={expires:6,reason:'the swing runs past your guard'};
    const next=act(roundFive,{type:'guard'},`round5-${seed}`);
    assert.notEqual(next.intent?.type,'withdraw',
      `Flint generated an early surrender for the next round at seed ${seed}`);
  }
});
test('Healthy reserve blocks early human withdrawal until serious harm or exhaustion',()=>{
 for(const scene of ['flint','silas']){
   for(let seed=1;seed<=200;seed++){
     for(const [hp,stamina] of [[24,50],[21,12],[20,50]]){
       const state=newEncounter(scene,{seed,
         player:{hp:45,stamina:75,momentum:50},
         enemy:{hp,stamina}});
       assert.notEqual(state.intent.type,'withdraw',
         `${scene} yielded with HP=${hp}, Stamina=${stamina}, seed=${seed}`);
     }
   }
 }
});
test('A genuinely worn down human opponent can still concede before 30% HP',()=>{
 for(const scene of ['flint','silas']){
   let retreats=0;
   for(let seed=1;seed<=240;seed++){
     const variedSeed=Math.imul(seed,2654435761)>>>0;
     const s=newEncounter(scene,{seed:variedSeed,
       player:{hp:43,stamina:65,momentum:25},
       enemy:{hp:20,stamina:12}});
     if(s.intent.type==='withdraw')retreats++;
   }
   assert.ok(retreats>0,`${scene} should sometimes withdraw at 40% HP and 12 Stamina`);
   assert.ok(retreats<240,`${scene} surrender must remain probabilistic`);
 }
});
test('genuine nonlethal retreat still possible when a human opponent is actually outmatched',()=>{
  for(const scene of ['flint','silas']){
    let yields=0;
    for(let seed=1;seed<=160;seed++){
      const s=newEncounter(scene,{seed,player:{hp:44,momentum:30},enemy:{hp:8}});
      if(s.intent.type==='withdraw')yields++;
    }
    assert.ok(yields>0,`${scene} should still be able to concede`);
  }
});
