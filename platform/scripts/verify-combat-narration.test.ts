import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newEncounter,step} from '../packages/game-core/vendor/combat-v0.5.1/combat.mjs';
import {narrateCommittedTurn} from '../apps/api/src/combat-narration.ts';
import type {CombatAction,CombatEvent,CombatState}
  from '@the-pall/game-core/combat-v0.5.1';

const flint=()=>newEncounter('flint',{seed:17}) as CombatState;
const dogman=()=>newEncounter('dogman',{seed:17}) as CombatState;
const boar=()=>newEncounter('boar',{seed:17}) as CombatState;
const silas=()=>newEncounter('silas',{seed:17}) as CombatState;
const action:CombatAction={type:'attack',zone:'torso'};
function write(state:CombatState,events:CombatEvent[],
  chosen:CombatAction=action,history:CombatEvent[]=[]){
  return narrateCommittedTurn(events,chosen,state.intent,state,history);
}
const event=(kind:string,extra:Partial<CombatEvent>={}):CombatEvent=>({
 round:2,text:'An attack occurs.',kind,...extra
});
const line=(e:CombatEvent)=>e.story?.line??e.text;
const detail=(e:CombatEvent)=>e.story?.detail??'';

test('Momentum and Fatigue appear once beneath the action that caused them',()=>{
 const s=flint();
 const events=write(s,[
  event('intent',{actor:'enemy',text:'Flint is ready to swing.'}),
  event('fatigue',{actor:'player',amount:3,fatigue:3,text:'Player gains 3 Fatigue.'}),
  event('guard',{actor:'player',text:'You raise your guard.'}),
  event('damage',{actor:'enemy',target:'player',zone:'torso',damage:6,raw:15,
    guarded:true,text:"Flint's club hits your ribs."}),
  event('momentum',{actor:'enemy',amount:10,text:'Flint gains 10 Momentum.'}),
  event('momentum',{actor:'player',amount:8,text:'Player gains 8 Momentum.'})
 ],{type:'guard'});
 assert.equal(events[1].story?.hidden,true);
 assert.equal(events[4].story?.hidden,true);
 assert.equal(events[5].story?.hidden,true);
 assert.equal(detail(events[2]),'Guard active · +3 Fatigue · 3/100 total');
 assert.equal(detail(events[3]),
  '−6 Health · 9 blocked · +10 Momentum (Flint) · +8 Momentum (You)');
 assert.equal(events[4].amount,10);
 assert.equal(events[5].amount,8);
 assert.equal(events.filter(e=>!e.story?.hidden).length,3);
});

test('normal hit uses the actual attacker, target, named enemy and body part',()=>{
 const s=flint();
 const [hit]=write(s,[event('damage',{
  actor:'player',target:'enemy',zone:'torso',damage:11,raw:11,
  text:"Your fist catches Flint across the ribs."})]);
 assert.match(line(hit),/^You /);
 assert.match(line(hit),/Flint/);
 assert.match(line(hit),/ribs/);
 assert.equal(detail(hit),'11 damage');
 assert.equal(hit.damage,11);
 assert.equal(hit.text,"Your fist catches Flint across the ribs.");
});

test('normal miss does not invent a dodge, wound or block',()=>{
 const s=flint();
 for(const who of ['player','enemy'] as const){
  const [miss]=write(s,[event('miss',{actor:who,zone:'torso',damage:0,text:'Attack misses'})]);
  assert.match(line(miss),/miss/i);
  assert.doesNotMatch(line(miss),/dodg|bleed|wound|block|fall/i);
 }
});

test('Guard damage shows the exact Health loss and blocked amount once',()=>{
 const s=flint();
 const events=write(s,[event('damage',{
  actor:'enemy',target:'player',zone:'limbs',damage:6,raw:15,guarded:true,
  text:"Flint's club hits your shoulder."})]);
 assert.match(line(events[0]),/shoulder/);
 assert.match(line(events[0]),/guard/);
 assert.equal(detail(events[0]),'−6 Health · 9 blocked');
 assert.doesNotMatch(line(events[0]),/9|15|6/);
});

test('successful dodge and a real opening connect without claiming an extra hit',()=>{
 const s=dogman();
 const events=write(s,[
  event('tactical',{actor:'player',condition:'dodge_success',chance:.4,
    text:"You dodge Dogman's committed swing."}),
  event('miss',{actor:'enemy',reason:'out_of_reach',damage:0,
    text:"Dogman's committed strike falls short. The target is no longer within reach."}),
  event('tactical',{actor:'player',
    text:'You notice an opening: the swing runs past your guard.'})
 ]);
 assert.match(line(events[0]),/dodge Dogman/);
 assert.match(line(events[1]),/out of reach/);
 assert.match(line(events[2]),/opening/i);
 assert.ok(events.every(x=>!/damage|Health|bleed/i.test(detail(x))));
});

test('failed dodge is NOT automatically called a successful hit',()=>{
 const s=dogman();
 const entries=write(s,[
  event('tactical',{actor:'player',condition:'dodge_failed',
    text:'Your reposition does not evade the committed swing.'}),
  event('miss',{actor:'enemy',zone:'torso',damage:0,text:'Dogman misses.'})
 ]);
 assert.match(line(entries[0]),/do not get clear/);
 assert.match(line(entries[1]),/miss/i);
 assert.doesNotMatch(entries.map(line).join(' '),/hits you|takes .*Health/);
});

test('two consecutive strikes only describe the recorded exposed stance',()=>{
 const [exposed]=write(flint(),[event('tactical',{
  actor:'player',condition:'overcommitted',
  text:'You have pressed forward with consecutive strikes. Your guard is left open.'})]);
 assert.match(line(exposed),/leaves you open/i);
 assert.doesNotMatch(line(exposed),/stagger|stun|wound|panic/);
});

test('special attack uses recorded Momentum and Opening bonus',()=>{
 const s=flint();
 const events=write(s,[
  event('technique',{actor:'player',amount:-20,
    text:'Player commits 20 Momentum to Press Advantage.'}),
  event('damage',{actor:'player',target:'enemy',zone:'head',
    text:"Your fist catches Flint across the temple.",damage:15,raw:20,openingDamageBonus:5})
 ],{type:'technique',zone:'head'});
 assert.match(line(events[1]),/opening/i);
 assert.match(line(events[1]),/temple/);
 assert.equal(detail(events[0]),'−20 Momentum');
 assert.equal(detail(events[1]),'15 damage · +5 Opening bonus');
});

test('Stamina and Composure recover from exact committed amounts',()=>{
 const s=flint();
 const [breath]=write(s,[event('recovery',{actor:'player',mode:'breath',
  staminaRestored:20,fatigueRemoved:15,text:'You recover.'})],
  {type:'recover',mode:'breath'});
 const [nerves]=write(s,[event('recovery',{actor:'player',mode:'nerves',
  composureRestored:12,fatigueRemoved:30,text:'You recover.'})],
  {type:'recover',mode:'nerves'});
 assert.match(line(breath),/catch your breath/);
 assert.equal(detail(breath),'+20 Stamina · −15 Fatigue');
 assert.equal(detail(nerves),'+12 Composure · −30 Fatigue');
});

test('Fatigue reports only actual measured increases',()=>{
 const [e]=write(dogman(),[event('fatigue',{actor:'enemy',amount:10,fatigue:80,
  text:'Dogman gains 10 Fatigue from exhausted exertion.'})]);
 assert.equal(detail(e),'+10 Fatigue · 80/100 total');
 assert.match(line(e),/Dogman/);
});

test('bleeding, serious impact and impaired arm are kept separate',()=>{
 const s=silas();
 const entries=write(s,[
  event('wound',{actor:'player',text:'A shallow cut opens. Light bleeding begins.'}),
  event('bleed',{actor:'player',target:'player',damage:1,text:'Blood seeps from your injury.'}),
  event('wound',{actor:'enemy',text:'Silas Pumpard suffers a severe impact. Their effective Health ceiling is reduced.'}),
  event('wound',{actor:'player',zone:'limbs',condition:'arm_impaired',
    text:'Player has taken repeated arm strikes. Attack accuracy is reduced.'})
 ]);
 assert.match(line(entries[0]),/start bleeding/);
 assert.equal(detail(entries[1]),'−1 Health');
 assert.match(line(entries[2]),/serious injury/);
 assert.match(line(entries[3]),/arm is hurt/);
});

test('movement and obstacle descriptions use actual committed movement',()=>{
 const s=dogman();
 const [side]=write(s,[event('move',{actor:'player',text:'You move sideways.'})],
  {type:'move',to:'side'});
 assert.match(line(side),/sideways|side/);
 const [cover]=write(s,[event('move',{actor:'player',text:'You duck behind the obstruction.'})],
  {type:'move',to:'cover'});
 assert.match(line(cover),/cover/);
 const [near]=write(s,[event('move',{actor:'enemy',text:'Dogman steps around the obstruction.'})]);
 assert.match(line(near),/closer/);
});

test('a retreat, surrender, win, and loss never become an invented kill',()=>{
 const s=flint();
 s.outcome='player_victory';
 let [e]=write(s,[event('outcome',{text:'The fight ends. Flint lowers his club and backs away from the passage.'})]);
 assert.match(line(e),/backs away.*You win/);
 assert.doesNotMatch(line(e),/kill|dead/);
 s.outcome='player_defeat';
 [e]=write(s,[event('outcome',{text:'You are defeated. You fall, unable to carry on.'})]);
 assert.match(line(e),/You lose/);
 assert.doesNotMatch(line(e),/win/);
 s.outcome='player_escaped';
 [e]=write(s,[event('outcome',{text:'You get away. You leave the passage.'})]);
 assert.match(line(e),/get away/);
});

test('boar leaves through the actual opening; Silas stays by the coal box',()=>{
 const b=boar();b.outcome='player_victory';
 const [be]=write(b,[event('outcome',{
  text:'The fight ends. The wounded boar limps through the opening and disappears beyond the fence.'})]);
 assert.match(line(be),/limps through the opening/);
 assert.doesNotMatch(line(be),/backs away|falls|dies/);
 const s=silas();s.outcome='player_victory';
 const [se]=write(s,[event('outcome',{
  text:'The fight ends. Silas gives ground and ends the assault, remaining by the locked coal box.'})]);
 assert.match(line(se),/stops attacking/);
 assert.doesNotMatch(line(se),/leaves|runs away/);
});

test('Silas uses his iron hook, boar does not invent a weapon, Owler needs a real weapon flag',()=>{
 const hook=write(silas(),[event('damage',{actor:'enemy',target:'player',
  zone:'limbs',text:"Silas's iron hook clips your forearm.",damage:5,raw:5})])[0];
 assert.match(line(hook),/iron hook/);
 const pig=write(boar(),[event('damage',{actor:'enemy',target:'player',
  zone:'torso',text:'The animal strikes your ribs.',damage:6,raw:6})])[0];
 assert.match(line(pig),/boar/);
 assert.doesNotMatch(line(pig),/club|hook|punch/);
 const future=flint();
 future.enemy.name='Owler';
 future.enemy.weapon.unarmed=true;
 const owler=write(future,[event('damage',{actor:'enemy',target:'player',
  zone:'torso',text:'Owler strikes your side.',damage:4,raw:4})])[0];
 assert.match(line(owler),/Owler/);
 assert.doesNotMatch(line(owler),/club|hook|shov/);
});

test('older saved logs without a story are still readable',()=>{
 const old=event('damage',{text:'Original Flint hit. You lose 9 Health.',damage:9});
 assert.equal(old.story,undefined);
 assert.equal(line(old),old.text);
});

test('narrating a resolved turn does not change game state, RNG, damage or event fields',()=>{
 const s=newEncounter('flint',{seed:913}) as CombatState;
 const next=step(s,{type:'guard'},{requestId:'round-1',expectedRevision:s.revision}) as CombatState;
 const before=structuredClone(next);
 const result=write(next,next.events,{type:'guard'},[]);
 const copy=structuredClone(next);
 assert.deepEqual(copy,before,'Narration may not mutate the engine state');
 for(let i=0;i<next.events.length;i++){
  const {story,actionType,actionDetail,actionName,...rest}=result[i];
  assert.deepEqual(rest,next.events[i],'Original event must remain intact');
  if(story)assert.equal(story.version,1);
 }
 assert.equal(result.length,next.events.length);
});

test('save and reload produce the same chronicle with no new rolls',()=>{
 const initial=newEncounter('dogman',{seed:71}) as CombatState;
 const next=step(initial,{type:'guard'},{requestId:'round-1',expectedRevision:0}) as CombatState;
 const events=write(next,next.events,{type:'guard'},[]);
 const saved=JSON.stringify({state:{...next,events},history:events});
 const reloaded=JSON.parse(saved);
 const exactJSON=JSON.parse(JSON.stringify(events));
 assert.deepEqual(reloaded.history,exactJSON);
 assert.deepEqual(reloaded.state.events,exactJSON);
 const replay=write(next,next.events,{type:'guard'},[]);
 assert.deepEqual(JSON.parse(JSON.stringify(replay)),exactJSON);
});

test('a full real multi-round history reads in order with deterministic varied sentences',()=>{
 let s=newEncounter('flint',{seed:142}) as CombatState;
 let history:CombatEvent[]=[];
 for(let i=0;i<14&&s.status==='active';i++){
  const chosen:CombatAction=s.player.fatigue>=70
    ?{type:'recover',mode:'breath'}
    :s.distance!=='contact'?{type:'move',to:'close'}
    :i%3===0?{type:'guard'}:{type:'attack',zone:'torso'};
  const intent=s.intent;
  const next=step(s,chosen,{requestId:'round-'+String(i),expectedRevision:s.revision}) as CombatState;
  const rendered=narrateCommittedTurn(next.events,chosen,intent,next,history);
  history=[...history,...rendered];
  s=next;
 }
 assert.ok(history.length>20,'Expected multiple connected action events');
 assert.ok(history.every((e,i)=>i===0||history[i-1].round<=e.round));
 assert.ok(history.some(e=>e.kind==='damage'||e.kind==='miss'));
 assert.ok(history.some(e=>e.story?.detail));
 assert.ok(new Set(history.filter(e=>e.kind==='damage').map(e=>e.story?.line)).size>=2,
  'Consecutive strikes must not all reuse one sentence');
 assert.ok(!history.some(e=>e.story?.line.includes('Enemy NPC')));
});
