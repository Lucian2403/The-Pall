import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newEncounter,step} from '../packages/game-core/vendor/combat-v0.5.1/combat.mjs';
import {narrateCommittedTurn,type StoryCombatEvent}
  from '../apps/api/src/combat-narration.ts';
import type {CombatAction,CombatEvent,CombatState}
  from '@the-pall/game-core/combat-v0.5.1';

const fresh=(scene:'flint'|'dogman'|'silas'|'boar'='flint')=>
  newEncounter(scene,{seed:45}) as CombatState;
const act:CombatAction={type:'attack',zone:'torso'};
const e=(kind:string,props:Partial<CombatEvent>={}):CombatEvent=>({
  kind,round:1,text:'Resolved action.',...props
});
const render=(state:CombatState,events:CombatEvent[],
  chosen:CombatAction=act,previous:CombatEvent[]=[]) =>
  narrateCommittedTurn(events,chosen,state.intent,state,previous);
const line=(event:StoryCombatEvent)=>event.story?.line??event.text;
const info=(event:StoryCombatEvent)=>event.story?.detail??'';
const json=<T>(a:T):T=>JSON.parse(JSON.stringify(a));

test('the narrator has no enemy, scene, weapon, creature or ability name switch',()=>{
 const s=readFileSync(new URL('../apps/api/src/combat-narration.ts',import.meta.url),'utf8');
 for(const word of ['Flint','Dogman','Silas','boar','Owler','iron hook','heavy club',
   "state.scene===","weapon.type==='",'woundName(']){
  assert.ok(!s.includes(word),'Narrator cannot know a fixture name or its equipment: '+word);
 }
 assert.ok(s.includes('narration?:NarrationFacts'));
});

test('a named enemy and named weapon come from state and recorded attack data',()=>{
 const s=fresh();
 s.enemy.name='Gutter Sentinel 318';
 s.enemy.weapon.label='copper staff';
 const [hit]=render(s,[e('damage',{actor:'enemy',target:'player',damage:9,raw:9,
   hitPart:'back',text:'Engine records a hit.'})]);
 assert.match(line(hit),/Gutter Sentinel 318/);
 assert.match(line(hit),/copper staff/);
 assert.match(line(hit),/back/);
 assert.equal(info(hit),'−9 Health');
 assert.equal(hit.damage,9);
 assert.equal(hit.text,'Engine records a hit.');
});

test('recorded hit part is used; an unrecorded part is never guessed from aim zone',()=>{
 const s=fresh();
 const [a,b]=render(s,[
  e('damage',{actor:'player',target:'enemy',zone:'head',damage:11,text:'A hit.'}),
  e('damage',{actor:'player',target:'enemy',zone:'limbs',damage:6,hitPart:'left wing',
   text:'A hit to the left wing.'})
 ]);
 assert.doesNotMatch(line(a),/head|temple|arm|wing|ribs/);
 assert.match(line(b),/left wing/);
});

test('animals, machines and new body types never inherit fists, arms or clubs',()=>{
 const s=fresh();
 s.enemy.name='Seven-Legged Bell';
 s.enemy.weapon.unarmed=true;
 const [hit,guard]=render(s,[
  e('damage',{actor:'enemy',target:'player',damage:4,text:'Hit.'}),
  e('guard',{actor:'enemy',text:'Guarded.'})
 ]);
 assert.match(line(hit),/Seven-Legged Bell/);
 assert.doesNotMatch(line(hit)+' '+line(guard),/fist|punch|raise|\\barm\\b|club|jaw/);
 assert.match(line(guard),/guards/);
});

test('new natural attack method uses exact verb forms and supplied body-part phrase',()=>{
 const s=fresh();s.enemy.name='Mire Bloom';s.enemy.weapon.unarmed=true;
 const [hit]=render(s,[e('damage',{actor:'enemy',target:'player',damage:8,raw:8,
  narration:{action:{verb:{base:'lash',thirdPerson:'lashes'},
    instrument:{kind:'body_part',name:'stem',phrase:'with its stem'},hitPart:'side'}},
  text:'Hit from new attack.'})]);
 assert.match(line(hit),/Mire Bloom lashes you on the side with its stem/);
 assert.doesNotMatch(line(hit),/punch|club|kick/);
});

test('an unfamiliar future attack verb requires no new narrator case',()=>{
 const s=fresh();s.enemy.name='Clockwork Grain';
 const [hit]=render(s,[e('damage',{actor:'enemy',target:'player',damage:3,
  narration:{action:{verb:{base:'tangle',thirdPerson:'tangles'}}},
  text:'Flicker resolves.'})]);
 assert.match(line(hit),/Clockwork Grain tangles you/);
 assert.equal(info(hit),'−3 Health');
});

test('an unknown or incomplete action method falls back to a plain hit',()=>{
 const s=fresh();s.enemy.name='Slag Frame';
 const [hit]=render(s,[e('damage',{actor:'enemy',target:'player',damage:5,
  narration:{action:{verb:{base:'crush',thirdPerson:''}}},text:'Unspecified hit.'})]);
 assert.match(line(hit),/Slag Frame (hits|attacks|strikes) you/);
 assert.doesNotMatch(line(hit),/crush|punch|club/);
});

test('an attack that misses never claims a dodge or wound',()=>{
 const s=fresh();s.enemy.name='Ridge Moth';
 const [miss]=render(s,[e('miss',{actor:'enemy',target:'player',
  damage:0,reason:'attack_roll',text:'Attack misses.'})]);
 assert.match(line(miss),/miss/);
 assert.doesNotMatch(line(miss),/dodg|bleed|\\bhits\\b|injur|wound|guard/);
});

test('a successful dodge and real Opening connect without inventing a hit',()=>{
 const s=fresh();s.enemy.name='Bridge Hound';
 const events=render(s,[
  e('tactical',{actor:'player',condition:'dodge_success'}),
  e('miss',{actor:'enemy',reason:'out_of_reach',damage:0}),
  e('tactical',{actor:'player',condition:'opening_gained',
    reason:'the enemy misses after you move'})
 ]);
 assert.match(line(events[0]),/dodge Bridge Hound/);
 assert.match(line(events[1]),/out of reach/);
 assert.match(line(events[2]),/opening/);
 assert.ok(events.every(x=>!info(x).includes('Health')));
});

test('a failed dodge followed by a miss is still a miss',()=>{
 const s=fresh();
 const [fail,miss]=render(s,[
  e('tactical',{actor:'player',condition:'dodge_failed'}),
  e('miss',{actor:'enemy',damage:0,reason:'attack_roll'})
 ]);
 assert.match(line(fail),/do not get clear/);
 assert.match(line(miss),/miss/);
 assert.doesNotMatch(line(miss),/hit you|punch/);
});

test('damage, Guard and an accuracy-only Opening remain exact',()=>{
 const s=fresh();s.enemy.name='North Loom';
 const [hit]=render(s,[e('damage',{actor:'player',target:'enemy',
  damage:6,raw:15,guarded:true,openingDamageBonus:0,
  narration:{openingUsed:true,action:{hitPart:'hull'}},
  text:'Strike landed with guard.'})]);
 assert.match(line(hit),/use the opening/);
 assert.match(line(hit),/hull/);
 assert.match(line(hit),/part of the blow is blocked/);
 assert.equal(info(hit),'6 damage · 9 blocked');
});

test('an unrecorded Opening never appears just because a hit dealt damage',()=>{
 const s=fresh();
 const [hit]=render(s,[e('damage',{actor:'player',target:'enemy',damage:11,
  raw:11,text:'Hit.'})]);
 assert.doesNotMatch(line(hit),/opening/);
});

test('ability title, strike method, damage and applied status appear together',()=>{
 const s=fresh();s.enemy.name='Mire Wanderer';
 const [hit]=render(s,[e('damage',{actor:'enemy',target:'player',damage:7,raw:7,
  narration:{
   actionId:'a-203',
   ability:{id:'generated-729',name:'Silt Latch',category:'close attack'},
   action:{verb:{base:'bind',thirdPerson:'binds'},
      instrument:{kind:'body_part',name:'vine',phrase:'with its vine'},hitPart:'ankle'},
   effects:[{kind:'status',label:'Slowed',applied:true,target:'player',durationRounds:2},
            {kind:'damage',label:'Health',amount:7,applied:true,target:'player'}]
  },text:'Generated engine hit.'})]);
 assert.match(line(hit),/Mire Wanderer uses Silt Latch/);
 assert.match(line(hit),/binds you on the ankle with its vine/);
 assert.equal(info(hit),'−7 Health · Slowed (2 rounds)');
 assert.equal(hit.damage,7);
});

test('unapplied effects are never narrated as injuries or conditions',()=>{
 const s=fresh();s.enemy.name='River Spur';
 const [hit]=render(s,[e('damage',{actor:'enemy',target:'player',damage:4,
  narration:{ability:{name:'Drowned Reach'},effects:[
    {kind:'bleeding',label:'Bleeding',applied:false},
    {kind:'slow',label:'Slow',applied:false}]},text:'Hit without statuses.'})]);
 assert.doesNotMatch(info(hit)+' '+line(hit),/Bleeding|Slow/);
 assert.equal(info(hit),'−4 Health');
});

test('a new ability can apply an unfamiliar effect without causing damage',()=>{
 const s=fresh();s.enemy.name='Tin Drifter';
 const [effect]=render(s,[e('effect',{actor:'enemy',target:'player',
  narration:{ability:{name:'Anchor Thread'},
    effects:[{kind:'tether',label:'Tethered',applied:true,durationRounds:3}]},
  text:'Engine applied tether.'})]);
 assert.match(line(effect),/Tin Drifter uses Anchor Thread/);
 assert.equal(info(effect),'Tethered (3 rounds)');
});

test('new mechanics can report movement and resources with their own labels',()=>{
 const s=fresh();s.enemy.name='Eel Cart';
 const [hit]=render(s,[e('damage',{actor:'enemy',target:'player',damage:4,
  narration:{action:{verb:{base:'push',thirdPerson:'pushes'}},
    effects:[{kind:'forced_move',label:'Pushed back',applied:true,
       amount:2,unit:'steps'},
      {kind:'composure',label:'Composure',applied:true,amount:-5,unit:'Composure'}]},
  text:'Pushed with custom effects.'})]);
 assert.match(line(hit),/Eel Cart pushes you/);
 assert.equal(info(hit),'−4 Health · Pushed back: 2 steps · −5 Composure');
});

test('move around obstacles describes only recorded position changes',()=>{
 const s=fresh();s.enemy.name='Cinder Wind';
 const [close,side,other]=render(s,[
  e('move',{actor:'player',actionDetail:'close',text:'Closer.'}),
  e('move',{actor:'enemy',narration:{movement:{kind:'side',place:'beside the gate'}},
    text:'Side.'}),
  e('move',{actor:'enemy',narration:{movement:{kind:'other',place:'near the wall'}},
    text:'Unknown move.'})
 ],{type:'move',to:'close'});
 assert.match(line(close),/closer|closes the distance/);
 assert.match(line(side),/side/);
 assert.match(info(side),/beside the gate/);
 assert.match(line(other),/moves/);
 assert.doesNotMatch(line(other),/dodges|jump|charge|runs/);
});

test('committed recovery and Fatigue include exact resource values',()=>{
 const s=fresh();
 const [recovery,fatigue]=render(s,[
  e('recovery',{actor:'player',mode:'breath',
    staminaRestored:20,fatigueRemoved:15,text:'Recovered.'}),
  e('fatigue',{actor:'enemy',amount:9,fatigue:72,text:'Fatigue.'})
 ],{type:'recover',mode:'breath'});
 assert.match(line(recovery),/catch your breath/);
 assert.equal(info(recovery),'+20 Stamina · −15 Fatigue');
 assert.equal(info(fatigue),'+9 Fatigue · 72/100 total');
});

test('wounds, bleeding and impaired limbs require explicit resolved conditions',()=>{
 const s=fresh();s.enemy.name='Old Bell';
 const [bleed,serious,limb,tick]=render(s,[
  e('wound',{actor:'enemy',condition:'bleed_started'}),
  e('wound',{actor:'player',condition:'serious_wound'}),
  e('wound',{actor:'player',condition:'arm_impaired'}),
  e('bleed',{actor:'enemy',damage:2})
 ]);
 assert.match(line(bleed),/starts bleeding/);
 assert.match(line(serious),/serious injury/);
 assert.match(line(limb),/arm is injured/);
 assert.equal(info(tick),'−2 Health');
});

test('surrender, withdrawal, defeat and escape do not invent deaths or flight',()=>{
 const s=fresh();s.enemy.name='Sable Beetle';
 s.outcome='player_victory';
 const [surrender,withdraw]=render(s,[
  e('outcome',{actor:'enemy',condition:'surrender'}),
  e('outcome',{actor:'enemy',condition:'withdraw'})
 ]);
 assert.match(line(surrender),/Sable Beetle gives up/);
 assert.match(line(withdraw),/stops fighting/);
 s.outcome='player_defeat';
 const [lose]=render(s,[e('outcome',{text:'Lost.'})]);
 assert.match(line(lose),/You lose/);
 s.outcome='player_escaped';
 const [escape]=render(s,[e('outcome',{text:'Left.'})]);
 assert.match(line(escape),/get away/);
 for(const v of [surrender,withdraw,lose,escape])
  assert.doesNotMatch(line(v),/killed|dead|fear|scream/);
});

test('related Momentum, Fatigue and ability costs appear once under the real attack',()=>{
 const s=fresh();s.enemy.name='Ribbon Guard';
 const done=render(s,[
  e('fatigue',{actor:'player',amount:3,fatigue:5}),
  e('technique',{actor:'player',amount:-20,ability:'Twist Wire'}),
  e('damage',{actor:'player',target:'enemy',damage:12,raw:12,ability:'Twist Wire'}),
  e('momentum',{actor:'player',amount:10})
 ],{type:'technique',zone:'torso'});
 assert.equal(done[0].story?.hidden,true);
 assert.equal(done[1].story?.hidden,true);
 assert.equal(done[3].story?.hidden,true);
 assert.match(line(done[2]),/Twist Wire/);
 assert.equal(info(done[2]),'12 damage · +3 Fatigue · 5/100 total · −20 Momentum · +10 Momentum');
 assert.equal(done.length,4);
});

test('a generated self-targeting ability never changes who took damage',()=>{
 const state=fresh();state.enemy.name='Folding Engine';
 const [selfHit,playerSelfHit]=render(state,[
  e('damage',{actor:'enemy',target:'enemy',damage:5,raw:5,
    narration:{ability:{name:'Broken Return'},action:{}},text:'Self hit.'}),
  e('damage',{actor:'player',target:'player',damage:2,raw:2,
    narration:{ability:{name:'Recoil'},action:{}},text:'Player recoil.'})
 ]);
 assert.doesNotMatch(line(selfHit),/hits you|attacks you|strikes you/);
 assert.match(line(selfHit),/Folding Engine/);
 assert.equal(info(selfHit),'5 damage');
 assert.match(line(playerSelfHit),/yourself/);
 assert.equal(info(playerSelfHit),'−2 Health');
});

test('a new action id stops resource folding across independent attacks',()=>{
 const s=fresh();
 const done=render(s,[
  e('damage',{actor:'player',damage:4,
    narration:{actionId:'first'},text:'First attack.'}),
  e('momentum',{actor:'player',amount:10,
    narration:{actionId:'other'},text:'Different action.'})
 ]);
 assert.equal(done[1].story?.hidden,undefined);
 assert.equal(info(done[0]),'4 damage');
 assert.equal(info(done[1]),'+10 Momentum');
});

test('existing v1 stories and unversioned saved events are never rewritten',()=>{
 const s=fresh();
 const older=e('damage',{actor:'enemy',damage:9,text:'Old Chronicle wording.'});
 const v1=e('damage',{actor:'enemy',damage:8,text:'Saved v1 wording.',
  story:{version:1,line:'Older narration.',detail:'−8 Health'}});
 const [a,b]=render(s,[older,v1]);
 assert.equal(a.text,'Old Chronicle wording.');
 assert.equal(b.story?.version,1);
 assert.equal(line(b),'Older narration.');
 assert.equal(older.story,undefined);
});

test('actual deterministic engine fights change no RNG, damage, AI or stored state',()=>{
 let s=fresh();
 for(let round=0;round<8&&s.status==='active';round++){
  const action:CombatAction=s.player.fatigue>=70?{type:'recover',mode:'breath'}
    :s.distance!=='contact'?{type:'move',to:'close'}
    :round%3===0?{type:'guard'}:{type:'attack',zone:'torso'};
  const next=step(s,action,{requestId:'real-'+round,expectedRevision:s.revision}) as CombatState;
  const copy=json(next);
  const committed=render(next,next.events,action);
  assert.deepEqual(json(next),copy);
  assert.equal(committed.length,next.events.length);
  committed.forEach((x,i)=>{
    const {story,actionType,actionName,actionDetail,...original}=x;
    assert.deepEqual(original,next.events[i]);
    assert.ok(!story||story.version===2);
  });
  s=next;
 }
});

test('new generated enemy and new generated ability stay correct over six rounds',()=>{
 // This deterministic event trace represents a future resolver's committed
 // results. The prototype combat AI cannot generate new abilities, and is not
 // changed or faked here.
 const s=fresh();s.enemy.name='Glass-Silt Weaver';s.enemy.weapon.unarmed=true;
 const history:CombatEvent[]=[];
 const record=(events:CombatEvent[],choice:CombatAction=act)=>{
  const committed=render(s,events,choice,history);
  history.push(...json(committed));return committed;
 };
 const ability={id:'ability.gen.881',name:'Bindwater Reach',category:'control'};
 for(let round=1;round<=6;round++){
  const r=round;
  if(round%3===1){
    record([e('damage',{round:r,actor:'enemy',target:'player',damage:round+2,
      raw:round+2,narration:{ability,action:{verb:{base:'wrap',thirdPerson:'wraps'},
       instrument:{kind:'body_part',name:'filament',phrase:'with its filament'}},
       effects:[{kind:'new_condition',label:'Held',applied:round===1,
          durationRounds:2}]},text:'A real generated hit.'})]);
  }else if(round%3===2){
    record([e('miss',{round:r,actor:'enemy',damage:0,reason:'attack_roll',
      narration:{ability,action:{verb:{base:'wrap',thirdPerson:'wraps'}}},
      text:'A generated attack missed.'})]);
  }else{
    record([e('move',{round:r,actor:'enemy',narration:{
      movement:{kind:'side',place:'along the broken pipe'}},text:'Moved.'})]);
  }
 }
 const saved=json(history), displayed=saved.filter(x=>!x.story?.hidden)
  .map(x=>x.story?.line||x.text).join(' ');
 assert.equal(history.length,6);
 assert.ok(saved.every((e,i)=>e.round===i+1));
 assert.match(displayed,/Glass-Silt Weaver/);
 assert.match(displayed,/Bindwater Reach/);
 assert.match(displayed,/filament/);
 assert.match(saved[0].story?.detail||'',/Held \(2 rounds\)/);
 assert.doesNotMatch(saved[3].story?.detail||'',/Held/);
 assert.doesNotMatch(displayed,/punch|fist|club|fear|arm|injured/);
 assert.ok(new Set(displayed.split('. ').filter(Boolean)).size>=4);
 assert.deepEqual(json(history),saved);
});

test('replaying a committed history produces byte-for-byte stable new descriptions',()=>{
 const s=fresh();
 const events=[
  e('damage',{actor:'enemy',damage:9,raw:9,hitPart:'left flank',
    narration:{action:{hitPart:'left flank'}}}),
  e('momentum',{actor:'enemy',amount:10}),
  e('tactical',{actor:'player',condition:'opening_gained'})
 ];
 const first=render(s,events,act,[]);
 const second=render(s,events,act,[]);
 assert.equal(JSON.stringify(first),JSON.stringify(second));
 const serialized=json(first);
 assert.deepEqual(render(s,serialized,act,[]),serialized);
});
