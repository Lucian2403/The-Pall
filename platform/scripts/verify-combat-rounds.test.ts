import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newEncounter,step} from '../packages/game-core/vendor/combat-v0.5.1/combat.mjs';
import {narrateCommittedTurn} from '../apps/api/src/combat-narration.ts';
import {narrateCommittedRounds,type RoundStoryEvent}
  from '../apps/api/src/combat-round-narration.ts';
import {groupCombatRounds,combatEventText,combatEventNumbers}
  from '../apps/web/src/lib/millhand-combat-chronicle.ts';
import type {CombatAction,CombatEvent,CombatState} from '@the-pall/game-core/combat-v0.5.1';

const state=(name='Named Rival')=>{
 const s=newEncounter('flint',{seed:31}) as CombatState;
 s.enemy.name=name;return s;
};
const event=(kind:string,extra:Partial<CombatEvent>={}):CombatEvent=>({
 kind,text:'Engine source event.',round:1,...extra
});
const summary=(events:readonly CombatEvent[],s=state(),prior:CombatEvent[]=[])=>{
 const written=narrateCommittedRounds(events,s,prior);
 const end=written.at(-1)?.roundStory;
 assert.ok(end,'Each resolved round needs one saved story');
 assert.equal(end.version,3);
 assert.deepEqual(end.eventRefs,events.map((_,i)=>i));
 assert.deepEqual(written.map(({roundStory,...e})=>e),events);
 return end;
};
function makeRound(s:CombatState,events:CombatEvent[],history:CombatEvent[]=[]){
 const old=JSON.parse(JSON.stringify(s));
 const annotated=narrateCommittedTurn(events,{type:'attack',zone:'torso'},
   s.intent,s,history);
 const saved=narrateCommittedRounds(annotated,s,history);
 assert.deepEqual(JSON.parse(JSON.stringify(s)),old,'Narration cannot change engine state');
 return saved;
}
const sample=(round:number,records:CombatEvent[])=>records.map(x=>({...x,round}));
const n=(events:CombatEvent[])=>groupCombatRounds(events);

test('two actual hits become one round card in the true event order',()=>{
 const s=state('Gutter Wolf');
 const events=[event('intent',{actor:'enemy',text:'A future warning, not a hit.'}),
   event('damage',{actor:'player',target:'enemy',damage:5,raw:5}),
   event('damage',{actor:'enemy',target:'player',damage:12,raw:12})];
 const result=summary(events,s);
 assert.match(result.line,/You hit Gutter Wolf.*Gutter Wolf also hits you/);
 assert.doesNotMatch(result.line,/future warning/);
 assert.match(result.detail||'',/5 damage to Gutter Wolf · 12 damage to you/);
 assert.deepEqual(result.actions.map(x=>x.eventRef),[1,2]);
});

test('two misses do not turn into a dodge or injury',()=>{
 const result=summary([
   event('miss',{actor:'enemy',target:'player',reason:'attack_roll'}),
   event('miss',{actor:'player',target:'enemy',reason:'attack_roll'})
 ],state('Ridge Lantern'));
 assert.equal(result.line,'You and Ridge Lantern both miss.');
 assert.doesNotMatch(result.line,/dodge|bleed|block|wound/);
});

test('enemy Guard is before the strike and its block is quantified',()=>{
 const result=summary([
   event('guard',{actor:'enemy'}),
   event('damage',{actor:'player',target:'enemy',damage:8,raw:16,guarded:true})
 ],state('Bridge Hound'));
 assert.match(result.line,/Bridge Hound guards.*You hit Bridge Hound.*blocks part of the blow/);
 assert.match(result.detail||'',/8 damage to Bridge Hound · 8 blocked/);
});

test('player Guard reduces damage but does not dodge',()=>{
 const result=summary([
  event('guard',{actor:'player'}),
  event('damage',{actor:'enemy',target:'player',damage:6,raw:15,guarded:true})
 ],state('Hammer Warden'));
 assert.match(result.line,/You guard.*Hammer Warden hits you.*you block/);
 assert.match(result.detail||'',/6 damage to you · 9 blocked/);
 assert.doesNotMatch(result.line,/dodge/);
});

test('movement before a successful dodge and enemy miss is connected',()=>{
 const result=summary([
  event('move',{actor:'player',actionDetail:'side'}),
  event('tactical',{actor:'player',condition:'dodge_success'}),
  event('miss',{actor:'enemy',target:'player',reason:'out_of_reach'}),
  event('tactical',{actor:'player',condition:'opening_gained'})
 ],state('Dogman'));
 assert.match(result.line,/You step aside, and Dogman cannot reach you/);
 assert.ok(result.tactical.includes('Dodge successful (You)'));
 assert.ok(result.tactical.includes('Opening gained (You)'));
 assert.equal((result.line.match(/\./g)||[]).length,1);
});

test('failed dodge and later miss remain separate truthful facts',()=>{
 const result=summary([
  event('move',{actor:'player',actionDetail:'side'}),
  event('tactical',{actor:'player',condition:'dodge_failed'}),
  event('miss',{actor:'enemy',target:'player',reason:'attack_roll'})
 ],state('Machine Walker'));
 assert.match(result.line,/You step aside\. Machine Walker attacks you but misses\./);
 assert.ok(result.tactical.includes('Dodge failed (You)'));
 assert.doesNotMatch(result.line,/You dodge/);
});

test('an Opening that was gained last round changes the next hit description only if used',()=>{
 const s=state('Flint');
 const previous=narrateCommittedRounds([
   event('miss',{actor:'enemy',target:'player'}),
   event('tactical',{actor:'player',condition:'opening_gained'})
 ],s);
 const next=summary(sample(2,[
   event('damage',{actor:'player',target:'enemy',damage:9,raw:9,
     narration:{openingUsed:true}})
 ]),s,previous);
 assert.match(next.line,/You take the opening and hit Flint/);
 const plain=summary(sample(2,[
   event('damage',{actor:'player',target:'enemy',damage:9,raw:9})
 ]),s,previous);
 assert.doesNotMatch(plain.line,/opening/);
});

test('exposed stance stays in the tactical status without a second paragraph',()=>{
 const result=summary([
   event('damage',{actor:'player',target:'enemy',damage:3}),
   event('tactical',{actor:'player',condition:'overcommitted'})
 ],state('Dune Rider'));
 assert.match(result.line,/You hit Dune Rider/);
 assert.equal(result.tactical.filter(x=>x.includes('Exposed')).length,1);
 assert.doesNotMatch(result.line,/open|exposed/);
});

test('a new ability that hits Guard shows name, actual effect and damage once',()=>{
 const result=summary([
   event('guard',{actor:'enemy'}),
   event('technique',{actor:'player',amount:-20,ability:'Anchor Beam'}),
   event('damage',{actor:'player',target:'enemy',damage:4,raw:12,guarded:true,
     ability:'Anchor Beam',narration:{
       ability:{name:'Anchor Beam'},action:{verb:{base:'push',thirdPerson:'pushes'}},
       effects:[{kind:'slow',label:'Slow',applied:true,durationRounds:2},
         {kind:'bleed',label:'Bleed',applied:false}]
     }})
 ],state('Cinder Gate'));
 assert.match(result.line,/Anchor Beam/);
 assert.match(result.line,/blocks part of the blow/);
 assert.match(result.detail||'',/4 damage to Cinder Gate · 8 blocked/);
 assert.ok(result.detail?.includes('Slow (2 rounds)'));
 assert.doesNotMatch((result.detail||'')+result.line,/Bleed/);
});

test('moving out of range before an attack is not rewritten as an actual hit',()=>{
 const result=summary([
   event('move',{actor:'player',actionDetail:'back'}),
   event('miss',{actor:'enemy',target:'player',reason:'out_of_reach'})
 ],state('Wind Clock'));
 assert.match(result.line,/You step back.*Wind Clock cannot reach you/);
 assert.doesNotMatch(result.detail||'',/damage/);
});

test('recovery and Fatigue values remain in the compact details and originals',()=>{
 const s=state('Forest Bell');
 const raw=[
  event('recovery',{actor:'player',mode:'breath',staminaRestored:20,fatigueRemoved:15}),
  event('fatigue',{actor:'enemy',amount:8,fatigue:75})
 ];
 const written=narrateCommittedRounds(raw,s);
 const result=written.at(-1)?.roundStory;
 assert.ok(result?.detail?.includes('+20 Stamina (You)'));
 assert.ok(result?.detail?.includes('−15 Fatigue (You)'));
 assert.ok(result?.detail?.includes('+8 Fatigue (Forest Bell)'));
 assert.equal(written[1].amount,8);
});

test('serious wounds and bleeding require resolved wound flags',()=>{
 const result=summary([
   event('damage',{actor:'enemy',target:'player',damage:10}),
   event('wound',{actor:'player',condition:'bleed_started'}),
   event('wound',{actor:'player',condition:'serious_wound'}),
   event('bleed',{actor:'player',target:'player',damage:2})
 ],state('Mire Cutter'));
 assert.match(result.line,/Mire Cutter hits you.*You start bleeding.*You suffer a serious injury/);
 assert.ok(result.tactical.includes('Bleeding (You)'));
 assert.ok(result.tactical.includes('Serious injury (You)'));
 assert.match(result.detail||'',/2 bleeding damage to you/);
});

test('the final outcome and a serious wound stay visible after several actions',()=>{
 const s=state('Grit Lantern');s.outcome='player_defeat';
 const round=summary([
  event('guard',{actor:'player'}),
  event('move',{actor:'enemy',actionDetail:'close'}),
  event('damage',{actor:'enemy',target:'player',damage:18,raw:18}),
  event('wound',{actor:'player',condition:'serious_wound'}),
  event('outcome',{actor:'enemy',text:'You cannot continue.'})
 ],s);
 assert.match(round.line,/Grit Lantern hits you/);
 assert.match(round.line,/You suffer a serious injury/);
 assert.match(round.line,/You lose the fight\./);
 assert.ok(round.line.indexOf('hits you')<round.line.indexOf('serious injury'));
 assert.ok(round.line.indexOf('serious injury')<round.line.indexOf('lose the fight'));
});

test('opponent Opening grammar and linked player misses stay natural',()=>{
 const enemy=state('Dogman');
 const used=summary([event('damage',{actor:'enemy',target:'player',
   damage:8,openingDamageBonus:0,narration:{openingUsed:true}})],enemy);
 assert.match(used.line,/Dogman takes the opening and hits you/);
 assert.doesNotMatch(used.line,/Dogman use |and hit you/);
 const sidestep=summary([
   event('move',{actor:'enemy',actionDetail:'side'}),
   event('miss',{actor:'player',target:'enemy',reason:'out_of_reach'})
 ],enemy);
 assert.match(sidestep.line,/Dogman steps aside, and your attack falls short\./);
 assert.doesNotMatch(sidestep.line,/and You|You moves/);
});

test('the real outcome, not a guessed death, ends the Chronicle',()=>{
 for(const [outcome,expected] of [
  ['player_victory','You win the fight.'],
  ['player_defeat','You lose the fight.'],
  ['player_escaped','You get away.']
 ] as const){
  const s=state('Furnace Bird');s.outcome=outcome;
  const round=summary([event('outcome',{actor:'enemy'})],s);
  assert.equal(round.line,expected);
  assert.doesNotMatch(round.line,/killed|dead|fear|run away/i);
 }
});

test('generated creature with an unknown ability and nonhuman anatomy needs no special case',()=>{
 const s=state('Glass-Silt Weaver');s.enemy.weapon.unarmed=true;
 const result=summary([
  event('damage',{actor:'enemy',target:'player',damage:7,raw:7,
    narration:{ability:{name:'Bindwater Reach'},
      action:{verb:{base:'wrap',thirdPerson:'wraps'},hitPart:'ankle',
        instrument:{name:'filament',kind:'body_part',phrase:'with its filament'}},
      effects:[{kind:'tether',label:'Held',applied:true,durationRounds:2}]}})
 ],s);
 assert.match(result.line,/Glass-Silt Weaver.*Bindwater Reach.*wraps you.*filament/);
 assert.ok(result.detail?.includes('Held (2 rounds)'));
 assert.doesNotMatch(result.line,/fist|punch|club|raise an arm/);
});

test('nonhuman and self-targeting effects keep the real target',()=>{
 const s=state('Cave Moth');
 const result=summary([
  event('damage',{actor:'enemy',target:'enemy',damage:3,
    narration:{ability:{name:'Split Shell'}}}),
  event('effect',{actor:'enemy',target:'player',
    narration:{ability:{name:'Cold Mist'},
      effects:[{kind:'blind',label:'Blurred sight',applied:true,durationRounds:1}]}})
 ],s);
 assert.match(result.line,/Cave Moth/);
 assert.doesNotMatch(result.line,/Cave Moth hits you/);
 assert.ok(result.detail?.includes('3 damage to Cave Moth'));
});

test('new actor IDs work with supplied names and stable references',()=>{
 const s=state();
 const result=summary([
  event('damage',{actor:'third-party' as 'enemy',actorName:'Ward Machine',
    target:'player',damage:4}),
  event('move',{actor:'fourth-party' as 'enemy',actorName:'Gate Spirit',
    narration:{movement:{kind:'back'}}})
 ],s);
 assert.match(result.line,/Ward Machine hits you.*Gate Spirit steps back/);
 assert.deepEqual(result.actions.map(x=>x.actorId),['third-party','fourth-party']);
});

test('the summary includes real source references and preserves every original event',()=>{
 const s=state();
 const raw=[
  event('intent',{actor:'enemy',text:'A telegraph.'}),
  event('fatigue',{actor:'player',amount:3}),
  event('damage',{actor:'enemy',target:'player',damage:6}),
  event('momentum',{actor:'enemy',amount:10}),
  event('warning',{actor:'player',text:'You try to retreat but cannot.'})
 ];
 const written=narrateCommittedRounds(raw,s);
 const saved=JSON.parse(JSON.stringify(written));
 const round=n(saved);
 assert.equal(round.length,1);
 assert.equal(round[0].events.length,5);
 assert.deepEqual(round[0].roundStory?.eventRefs,[0,1,2,3,4]);
 assert.deepEqual(saved.slice(0,-1),raw.slice(0,-1));
 assert.match(round[0].main,/You try to retreat but cannot/);
});

test('old v1, v2, and plain events remain exactly as saved',()=>{
 const older=[
  event('intent',{text:'Old intent.'}),
  event('damage',{actor:'enemy',story:{version:1,line:'Older Flint attack.'},
   text:'Original source 1.'}),
  event('miss',{actor:'player',story:{version:2,line:'Your attack misses.'},
   text:'Original source 2.'})
 ];
 const snapshot=JSON.stringify(older);
 const cards=n(older);
 assert.equal(cards.length,1);
 assert.ok(cards[0].isLegacy);
 assert.match(cards[0].main,/Older Flint attack.*Your attack misses/);
 assert.equal(JSON.stringify(older),snapshot);
});

test('round grouping shows complete last 3 rounds, never a half-round',()=>{
 const s=state();
 const hist:CombatEvent[]=[];
 for(let i=1;i<=10;i++){
  const raw=sample(i,[
   event('intent',{actor:'enemy'}),
   event('move',{actor:'player',actionDetail:'side'}),
   event('miss',{actor:'enemy',target:'player'})
  ]);
  hist.push(...narrateCommittedRounds(raw,s,hist));
 }
 const cards=n(hist);
 assert.equal(cards.length,10);
 assert.equal(cards.slice(-3).length,3);
 assert.deepEqual(cards.slice(-3).map(x=>x.round),[8,9,10]);
 assert.ok(cards.slice(-3).every(x=>x.events.length===3));
});

test('a saved summary is immutable on replay and refresh',()=>{
 const s=state();
 const input=[
  event('damage',{actor:'enemy',target:'player',damage:6,raw:12,guarded:true}),
  event('momentum',{actor:'player',amount:10})
 ];
 const first=narrateCommittedRounds(input,s);
 const bytes=JSON.stringify(first);
 const second=narrateCommittedRounds(JSON.parse(bytes),s);
 assert.equal(JSON.stringify(second),bytes);
 assert.equal(n(second)[0].main,n(first)[0].main);
});

test('three consecutive misses grow into an accurate, varied account',()=>{
 const rival=state('Glass Guardian'),history:CombatEvent[]=[];
 const lines:string[]=[];
 for(let round=1;round<=4;round++){
   const raw=sample(round,[event('miss',{actor:'enemy',target:'player',
      reason:'attack_roll'})]);
   const saved=narrateCommittedRounds(raw,rival,history);
   history.push(...saved);
   lines.push(saved.at(-1)!.roundStory!.line);
 }
 assert.match(lines[1],/misses you again/);
 assert.match(lines[2],/tries to hit you again, but misses/);
 assert.match(lines[3],/still cannot hit you/);
 assert.equal(new Set(lines).size,4);
 assert.ok(lines.every(x=>!/(dodge|bleed|injur|falls)/i.test(x)));
});

test('multiple real hits use "again" only while the streak continues',()=>{
 const rival=state('Marsh Clock'),history:CombatEvent[]=[];
 const lines:string[]=[];
 for(let round=1;round<=4;round++){
   const kind=round===3?'miss':'damage';
   const raw=sample(round,[event(kind,{actor:'player',target:'enemy',
     ...(kind==='damage'?{damage:6,raw:6}:{reason:'attack_roll'})})]);
   const saved=narrateCommittedRounds(raw,rival,history);
   history.push(...saved);lines.push(saved.at(-1)!.roundStory!.line);
 }
 assert.match(lines[1],/again/);
 assert.doesNotMatch(lines[3],/again|another/);
 assert.match(lines[3],/You hit Marsh Clock/);
});

test('used Openings are distinct from gained and accuracy-only Openings',()=>{
 const rival=state('Stilt Beetle'),history:CombatEvent[]=[];
 function turn(round:number,values:CombatEvent[]){
   const saved=narrateCommittedRounds(sample(round,values),rival,history);
   history.push(...saved);return saved.at(-1)!.roundStory!;
 }
 const start=turn(1,[event('tactical',{actor:'player',
   condition:'opening_gained'})]);
 assert.ok(start.tactical.includes('Opening gained (You)'));
 const plain=turn(2,[event('damage',{actor:'player',target:'enemy',
   damage:4,raw:4})]);
 assert.doesNotMatch(plain.line,/opening/i);
 assert.ok(!plain.tactical.some(x=>/Opening used/.test(x)));
 const accuracy=turn(3,[event('damage',{actor:'player',target:'enemy',
   damage:5,raw:5,openingDamageBonus:0,narration:{openingUsed:true}})]);
 assert.match(accuracy.line,/take the opening/);
 assert.ok(accuracy.tactical.includes('Opening used (You)'));
 assert.doesNotMatch(accuracy.detail||'',/Opening bonus/);
 const bonus=turn(4,[event('damage',{actor:'player',target:'enemy',
   damage:8,raw:8,openingDamageBonus:3,narration:{openingUsed:true}})]);
 assert.ok(bonus.tactical.includes('Opening used (You)'));
 assert.match(bonus.detail||'',/Opening bonus \+3/);
 assert.doesNotMatch(bonus.line,/take the opening/);
});

test('recent enemy misses and player hits remain connected in order',()=>{
 const rival=state('Ash Porter'),history:CombatEvent[]=[];
 for(let round=1;round<=2;round++)
   history.push(...narrateCommittedRounds(sample(round,[
     event('miss',{actor:'enemy',target:'player',reason:'attack_roll'})
   ]),rival,history));
 const both=narrateCommittedRounds(sample(3,[
  event('damage',{actor:'player',target:'enemy',damage:7,raw:7,hitPart:'ribs'}),
  event('miss',{actor:'enemy',target:'player',reason:'attack_roll'})
 ]),rival,history).at(-1)!.roundStory!;
 assert.ok(both.line.indexOf('You hit')<both.line.indexOf('Ash Porter'));
 assert.match(both.line,/again/);
 assert.match(both.detail||'',/7 damage/);
});

test('a guarded hit and repeated overcommitment preserve tactical results',()=>{
 const rival=state(),history:CombatEvent[]=[];
 history.push(...narrateCommittedRounds([event('tactical',{
   actor:'player',condition:'overcommitted'})],rival,history));
 const round=narrateCommittedRounds(sample(2,[
  event('guard',{actor:'enemy'}),
  event('damage',{actor:'player',target:'enemy',damage:5,raw:12,guarded:true}),
  event('tactical',{actor:'player',condition:'overcommitted'})
 ]),rival,history).at(-1)!.roundStory!;
 assert.match(round.line,/guards.*blocks part/);
 assert.match(round.detail||'',/7 blocked/);
 assert.ok(round.tactical.includes('Exposed (You)'));
});

test('a recorded withdrawal ends the exchange without an invented death',()=>{
 const rival=state('Gate Watcher');rival.outcome='player_victory';
 const story=summary([
  event('guard',{actor:'player'}),
  event('outcome',{actor:'enemy',condition:'withdraw'})
 ],rival);
 assert.equal(story.line,'You guard, but Gate Watcher stops fighting. You win.');
 assert.doesNotMatch(story.line,/dies|falls|runs/);
});

test('defeat after the actual final hit reports inability to continue',()=>{
 const rival=state('Tin Giant');
 rival.outcome='player_defeat';rival.player.hp=0;
 const story=summary([
  event('miss',{actor:'player',target:'enemy',reason:'attack_roll'}),
  event('damage',{actor:'enemy',target:'player',damage:16,raw:16}),
  event('outcome',{actor:'enemy'})
 ],rival);
 assert.match(story.line,/Tin Giant hits you.*You cannot continue\. You lose\./);
 assert.ok(story.line.indexOf('Tin Giant hits')<story.line.indexOf('You cannot'));
});

test('details show clean sentences, separate numbers and the saved raw text',()=>{
 const raw=event('damage',{actor:'enemy',target:'player',
   text:'Named Rival loses 5 Health.5 damage',
   story:{version:2,line:'Named Rival hits you.',detail:'−5 Health'}});
 assert.equal(combatEventText(raw),'Named Rival hits you.');
 assert.equal(combatEventNumbers(raw),'−5 Health');
 assert.equal(raw.text,'Named Rival loses 5 Health.5 damage');
 const old=event('momentum',{actor:'player',
   text:'Player gains 10 Momentum. The change is saved\\.'});
 assert.equal(combatEventText(old),'You gain 10 Momentum. The change is saved.');
 assert.equal(old.text,'Player gains 10 Momentum. The change is saved\\.');
 const folded=event('momentum',{actor:'player',text:'Player gains 10 Momentum.',
   story:{version:2,line:'You gain Momentum.',detail:'+10 Momentum',hidden:true}});
 assert.equal(combatEventNumbers(folded),undefined);
});

test('Fatigue rises across rounds with exact owner and amount, not invented illness',()=>{
 const rival=state('Copper Sentinel'),history:CombatEvent[]=[];
 for(let round=1;round<=4;round++){
   const amount=round*3;
   const events=sample(round,[
     event('guard',{actor:'player'}),
     event('fatigue',{actor:'player',amount,fatigue:amount})
   ]);
   const saved=narrateCommittedRounds(events,rival,history);
   history.push(...saved);
   const data=saved.at(-1)!.roundStory!;
   assert.match(data.detail||'',new RegExp('\\+'+amount+' Fatigue \\(You\\)'));
   assert.doesNotMatch(data.line,/collapse|panic|limp|suffer|dizzy/);
 }
 assert.equal(history.length,8);
 assert.equal(groupCombatRounds(history).length,4);
});

test('wound then later bleeding tick is recorded without a second invented cut',()=>{
 const rival=state('Bone Clock'),history:CombatEvent[]=[];
 const first=narrateCommittedRounds([
  event('damage',{actor:'enemy',target:'player',damage:8}),
  event('wound',{actor:'player',condition:'bleed_started'})
 ],rival,history);
 history.push(...first);
 const second=narrateCommittedRounds(sample(2,[
  event('guard',{actor:'player'}),
  event('bleed',{actor:'player',target:'player',damage:1})
 ]),rival,history).at(-1)!.roundStory!;
 assert.match(first.at(-1)!.roundStory!.line,/start bleeding/);
 assert.doesNotMatch(second.line,/start bleeding|new cut|another wound/);
 assert.match(second.detail||'',/1 bleeding damage to you/);
});

test('repeated generated abilities are counted by saved IDs and events, not names in prose',()=>{
 const rival=state('Stone Eel'),history:CombatEvent[]=[];
 const first=narrateCommittedRounds([
  event('damage',{actor:'enemy',target:'player',damage:2,
    narration:{ability:{id:'effect-A',name:'Stone Thread'},action:{
       verb:{base:'bind',thirdPerson:'binds'}}}})
 ],rival,history);
 history.push(...first);
 // The earlier enemy name and story contain similar words, but this is a
 // different generated ability ID. It must be narrated as a first use.
 const second=narrateCommittedRounds(sample(2,[
  event('damage',{actor:'enemy',target:'player',damage:3,
    narration:{ability:{id:'effect-B',name:'Stone Thread'},action:{
       verb:{base:'bind',thirdPerson:'binds'}}}})
 ]),rival,history).at(-1)!.roundStory!;
 assert.match(second.line,/uses Stone Thread and binds you/);
 assert.doesNotMatch(second.line,/using Stone Thread|to bind you/);
});

test('narrating multiple fresh rounds at once uses the preceding raw round facts',()=>{
 const rival=state('Loom Beast');
 const batched=narrateCommittedRounds([
  ...sample(1,[event('miss',{actor:'enemy',target:'player',reason:'attack_roll'})]),
  ...sample(2,[event('miss',{actor:'enemy',target:'player',reason:'attack_roll'})])
 ],rival);
 const rounds=groupCombatRounds(batched);
 assert.equal(rounds.length,2);
 assert.match(rounds[1].main,/misses you again/);
 assert.equal(batched.length,2);
});

test('ten real resolved Flint and Dogman rounds produce readable saved Chronicle examples',()=>{
 for(const kind of ['flint','dogman'] as const){
  let s=newEncounter(kind,{seed:199,player:{hp:2000,hpMax:2000,ceiling:2000,
      stamina:95,composure:100},enemy:{hp:2000,hpMax:2000,ceiling:2000}}) as CombatState;
  let history:CombatEvent[]=[];
  for(let i=0;i<12&&s.status==='active';i++){
   const chosen:CombatAction=s.player.fatigue>75?{type:'recover',mode:'breath'}:
     s.distance!=='contact'?{type:'move',to:'close'}:
     i%3===0?{type:'guard'}:{type:'attack',zone:'torso'};
   const foe=s.intent;
   const next=step(s,chosen,{requestId:kind+'-round-'+i,expectedRevision:s.revision}) as CombatState;
   const exact=JSON.parse(JSON.stringify(next));
   const eventHistory=narrateCommittedTurn(next.events,chosen,foe,next,history);
   history=[...history,...narrateCommittedRounds(eventHistory,next,history)];
   assert.deepEqual(JSON.parse(JSON.stringify(next)),exact);
   s=next;
  }
  const cards=n(history);
  assert.ok(cards.length>=10,kind+' must have ten complete rounds');
  assert.ok(cards.every(x=>x.roundStory?.version===3));
  assert.ok(cards.every(x=>x.roundStory?.eventRefs.length===x.events.length));
  assert.ok(cards.every(x=>x.main.length>5&&!x.main.includes('Enemy NPC')));
  console.log('=== '+kind.toUpperCase()+' 12-ROUND SAVED CHRONICLE ===\n'+
    cards.map(x=>'Round '+x.round+': '+x.main+
      (x.detail?'\n'+x.detail:'')+(x.tactical.length?'\n'+x.tactical.join(' · '):'')).join('\n'));
 }
});

test('twelve generated-creature rounds read clearly without an enemy-specific narrator',()=>{
 const s=state('Glass-Silt Weaver');s.id='generated-creature-001';s.enemy.weapon.unarmed=true;
 const history:CombatEvent[]=[];
 for(let r=1;r<=12;r++){
   const raw=sample(r,r%3===1?[
     event('damage',{actor:'enemy',target:'player',damage:r+2,raw:r+2,
       narration:{ability:{id:'ability-881',name:'Bindwater Reach'},
        action:{verb:{base:'wrap',thirdPerson:'wraps'},
           instrument:{kind:'body_part',name:'filament',phrase:'with its filament'}},
        effects:[{kind:'held',label:'Held',applied:r===1,durationRounds:2}]}})
   ]:r%3===2?[
     event('move',{actor:'player',actionDetail:'side'}),
     event('miss',{actor:'enemy',target:'player',reason:'out_of_reach',
       ability:'Bindwater Reach'})
   ]:[
     event('recovery',{actor:'player',mode:'breath',staminaRestored:9,fatigueRemoved:4}),
     event('guard',{actor:'enemy'})
   ]);
   history.push(...narrateCommittedRounds(raw,s,history));
 }
 const cards=n(history);
 assert.equal(cards.length,12);
 assert.ok(new Set(cards.map(x=>x.main)).size>=6,
   'Repeated generated actions need several faithful patterns, not one fixed line');
 assert.match(cards[0].main,/Glass-Silt Weaver/);
 assert.match(cards[0].main,/Bindwater Reach/);
 assert.ok(cards[0].detail?.includes('Held (2 rounds)'));
 assert.doesNotMatch(cards[3].detail??'',/Held/);
 assert.ok(cards.every(x=>x.roundStory?.encounterId==='generated-creature-001'));
 console.log('=== GENERATED CREATURE 12-ROUND SAVED CHRONICLE ===\n'+
  cards.map(x=>'Round '+x.round+': '+x.main+
    (x.detail?'\n'+x.detail:'')).join('\n'));
});
