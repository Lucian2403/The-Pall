/** Universal presentation adapter for resolved combat events.
 * The combat engine owns actions and results. Nothing here rolls, resolves or
 * edits a fighter. The complete story is saved on each committed event.
 *
 * A future combat resolver may put 'narration' facts on an event. All fields
 * describe RESOLVED actions. Metadata describing a possible ability is not
 * proof that an effect happened: effects require applied:true.
 */
import {hitLocationPhrase} from '@the-pall/game-core/combat-v0.5.1';
import type {CombatAction,CombatEvent,CombatState,HitPartPreposition}
  from '@the-pall/game-core/combat-v0.5.1';

type Side='player'|'enemy';
export type ResolvedEffect={
  kind:string; label?:string; applied:boolean; target?:Side;
  amount?:number; unit?:string; durationRounds?:number;
  /** Optional plain-English result supplied by the resolver, not the narrator. */
  text?:string;
};
export type AttackFacts={
  /** Both verb forms are supplied by the resolver/ability data.
   * This also allows verbs the narrator has never seen before. */
  verb?:{base:string;thirdPerson:string};
  /** No anatomy is inferred from weapon type or creature name. */
  instrument?:{name:string;kind:'weapon'|'body_part'|'other';phrase?:string};
  /** The actual struck part, not the intended aim zone. */
  hitPart?:string;hitPartPreposition?:HitPartPreposition;
};
export type NarrationFacts={
  actionId?:string;
  action?:AttackFacts;
  ability?:{id?:string;name:string;category?:string};
  /** Movement that actually happened, not a possible destination. */
  movement?:{kind:'side'|'close'|'back'|'cover'|'leave'|'other';place?:string};
  /** Explicitly consumed opening, including accuracy-only openings. */
  openingUsed?:boolean;
  /** Only effects with applied:true are described as outcomes. */
  effects?:ResolvedEffect[];
  /** Only an observed ending, not a guessed motive. */
  outcome?:'withdraw'|'surrender'|'downed'|'escaped'|'stopped';
};
export type CombatStory={version:2;line:string;detail?:string;hidden?:boolean};
export type StoryCombatEvent=CombatEvent&{
  narration?:NarrationFacts;
  story?:CombatStory|{version:1;line:string;detail?:string;hidden?:boolean};
};

const finite=(x:unknown):number|null=>
  typeof x==='number'&&Number.isFinite(x)?x:null;
const side=(x:unknown):x is Side=>x==='player'||x==='enemy';
const safe=(x:unknown):string|undefined=>
  typeof x==='string'&&x.trim().length>0?x.trim():undefined;
const word=(x:unknown):string|undefined=>{
  const s=safe(x);
  return s&&s.length<=90?s:undefined;
};
const caps=(text:string):string=>text[0].toUpperCase()+text.slice(1);
const number=(n:number,label:string,sign=''):string=>sign+String(n)+' '+label;
const nameOf=(state:CombatState,who:Side):string=>
  who==='player'?'You':state.enemy.name;
function targetSide(who:Side,target:unknown):Side{
  // The prototype duel can infer the other side when old events lack a target.
  // New resolvers should always send target, especially for self-affecting abilities.
  return side(target)?target:who==='player'?'enemy':'player';
}
function targetOf(state:CombatState,who:Side,target:unknown):string{
  const resolved=targetSide(who,target);
  if(resolved===who)return who==='player'?'yourself':state.enemy.name;
  return resolved==='player'?'you':state.enemy.name;
}
function facts(event:CombatEvent):NarrationFacts{
  const raw=event.narration;
  return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as NarrationFacts:{};
}
function pick(lines:string[],index:number,last?:string):string{
  let i=((index%lines.length)+lines.length)%lines.length;
  if(lines.length>1&&lines[i]===last)i=(i+1)%lines.length;
  return lines[i];
}
function actorVerb(verb:AttackFacts['verb']|undefined,who:Side):string|undefined{
  return who==='player'?word(verb?.base):word(verb?.thirdPerson);
}
function weaponUsed(event:CombatEvent,state:CombatState,who:Side):string|undefined{
  const attack=facts(event).action;
  if(attack){
    const i=attack.instrument;
    if(!i)return;
    if(safe(i.phrase))return i.phrase!.trim();
    if(i.kind==='weapon'&&word(i.name))
      return who==='player'?'with your '+i.name:'with a '+i.name;
    // A body part may be a tail, jaw, wing or tentacle. Never guess its owner.
    return;
  }
  // Only this existing prototype's committed weapon attack can use its fitted
  // weapon label. Old saved weapons without labels fall back to a plain hit.
  const weapon=state[who].weapon as CombatState['player']['weapon']&{label?:string};
  if(word(weapon.label)&&weapon.unarmed!==true)
    return who==='player'?'with your '+weapon.label:'with a '+weapon.label;
}
function detailEffects(event:CombatEvent):{parts:string[];text?:string}{
  const found=facts(event).effects;
  if(!Array.isArray(found))return {parts:[]};
  const parts:string[]=[];
  let sentence: string|undefined;
  for(const e of found){
    if(!e||e.applied!==true)continue;
    // Existing damage is shown once, from the authoritative damage field.
    if(e.kind==='damage'&&finite(event.damage)!==null)continue;
    const label=word(e.label)||word(e.kind)||'Effect';
    const amount=finite(e.amount);
    const unit=word(e.unit);
    const duration=finite(e.durationRounds);
    // Keep a custom effect's meaning beside its number: "+2 steps" alone
    // would hide whether the target was pushed, pulled or moved sideways.
    let part:string;
    if(amount===null)part=label;
    else if(unit&&label.toLowerCase()!==unit.toLowerCase())
      part=label+': '+(amount<0?'−':'')+Math.abs(amount)+' '+unit;
    else part=(amount>0?'+':amount<0?'−':'')+Math.abs(amount)+' '+(unit||label);
    if(duration!==null&&duration>0)part+=' ('+duration+' rounds)';
    if(!parts.includes(part))parts.push(part);
    if(!sentence&&safe(e.text))sentence=e.text!.trim();
  }
  return {parts,text:sentence};
}
function story(line:string,parts:string[]=[],extra?:string):CombatStory{
  const clean=line.replace(/\s+/g,' ').trim();
  const result=extra?clean+' '+extra.trim():clean;
  return {version:2,line:result, ...(parts.length?{detail:parts.join(' · ')}:{})};
}
function hit(event:CombatEvent,state:CombatState,index:number,last?:string):CombatStory|undefined{
  if(!side(event.actor))return;
  const who=event.actor,them=targetOf(state,who,event.target);
  const dmg=finite(event.damage);
  if(dmg===null)return;
  const n=facts(event),part=word(n.action?.hitPart)||word(event.hitPart);
  // The resolved hitPart is factual. The selected zone never supplies anatomy.
  const location=hitLocationPhrase(part,
    n.action?.hitPartPreposition??event.hitPartPreposition);
  const verb=actorVerb(n.action?.verb,who);
  const byWeapon=weaponUsed(event,state,who);
  const withSource=byWeapon?' '+byWeapon:'';
  const subject=nameOf(state,who);
  const usedAbility=word(n.ability?.name)||word(event.ability);
  let lines:string[];
  if(verb){
    lines=[subject+' '+verb+' '+them+location+withSource+'.',
      subject+' '+verb+' '+them+location+withSource+'.'];
  }else if(who==='player'){
    lines=['You hit '+them+location+withSource+'.',
      'Your attack hits '+them+location+withSource+'.',
      'You strike '+them+location+withSource+'.'];
  }else{
    lines=[subject+' hits '+them+location+withSource+'.',
      subject+' attacks '+them+location+withSource+'.',
      subject+' strikes '+them+location+withSource+'.'];
  }
  let line=pick(lines,index,last);
  const opening=n.openingUsed===true||((finite(event.openingDamageBonus)??0)>0);
  if(opening)line=(who==='player'?'You use the opening. ':subject+' uses the opening. ')+line;
  if(usedAbility)line=(who==='player'?'You use ':subject+' uses ')+usedAbility+'. '+line;
  const details=[targetSide(who,event.target)==='player'
    ?number(dmg,'Health','−'):number(dmg,'damage')];
  if(event.guarded===true){
    const raw=finite(event.raw);
    if(raw!==null&&raw>dmg){
      details.push(number(raw-dmg,'blocked'));
      line=line.replace(/\.$/,'')+(targetSide(who,event.target)==='player'
        ?', but your guard blocks part of the hit.':', but part of the blow is blocked.');
    }
  }
  const bonus=finite(event.openingDamageBonus);
  if(bonus!==null&&bonus>0)details.push(number(bonus,'Opening bonus','+'));
  const effects=detailEffects(event);
  return story(line,[...details,...effects.parts],effects.text);
}
function miss(event:CombatEvent,state:CombatState,index:number,last?:string):CombatStory|undefined{
  if(!side(event.actor))return;
  const who=event.actor,subject=nameOf(state,who),them=targetOf(state,who,event.target);
  const n=facts(event),verb=actorVerb(n.action?.verb,who);
  const ability=word(n.ability?.name)||word(event.ability);
  let result:string;
  if(event.reason==='old_position')
    result=subject+' attacks the place '+(who==='player'?them+' was':'you were')+'. The attack misses.';
  else if(event.reason==='out_of_reach')
    result=subject+' attacks, but '+them+' is out of reach.';
  else if(verb&&word(n.action?.verb?.base))
    result=subject+' tries to '+n.action!.verb!.base+' '+them+', but misses.';
  else result=pick(who==='player'?[
    'You attack '+them+' but miss.','Your attack misses '+them+'.',
    'You try to hit '+them+' but miss.'
  ]:[
    subject+' attacks but misses.',subject+' tries to hit you but misses.',
    subject+' misses you.'
  ],index,last);
  if(ability)result=subject+' uses '+ability+'. '+result;
  const effects=detailEffects(event);
  return story(result,effects.parts,effects.text);
}
function move(event:CombatEvent,state:CombatState,index:number,last?:string):CombatStory|undefined{
  if(!side(event.actor))return;
  const who=event.actor,n=facts(event);
  const direction=n.movement?.kind||word(event.actionDetail);
  const actor=nameOf(state,who);
  const place=word(n.movement?.place);
  const lines:Record<string,[string,string]>={
    side:[actor+' moves to the side.',actor+' shifts to the side.'],
    back:[actor+' steps back.',actor+' moves back.'],
    close:[actor+' moves closer.',actor+' closes the distance.'],
    cover:[actor+' moves behind cover.',actor+' takes cover.'],
    leave:[actor+' leaves the fight.',actor+' moves away from the fight.']
  };
  if(!direction)return; // Keep the authoritative event text, not a guessed move.
  const variants=lines[direction];
  const line=variants?pick(variants,index,last):actor+' moves.';
  return story(line,place?['Position: '+place]:[]);
}
function display(event:CombatEvent,state:CombatState,index:number,last?:string):CombatStory|undefined{
  const who=event.actor,n=facts(event),named=side(who)?nameOf(state,who):'';
  if(event.kind==='damage')return hit(event,state,index,last);
  if(event.kind==='miss')return miss(event,state,index,last);
  if(event.kind==='move')return move(event,state,index,last);
  if(event.kind==='guard'&&side(who))
    return story(who==='player'?'You guard.':named+' guards.',['Guard active']);
  if(event.kind==='tactical'){
    if(who==='player'&&event.condition==='dodge_success')
      return story('You dodge '+state.enemy.name+"'s attack.",['Dodge successful']);
    if(who==='player'&&event.condition==='dodge_failed')
      return story('You try to dodge but do not get clear.',['Dodge failed']);
    if(event.condition==='overcommitted')
      return story(who==='player'?'You attack again. This leaves you open.':
        named+' attacks again and is left open.',['Opening given']);
    if(event.condition==='opening_gained'&&side(who))
      return story(who==='player'?'You see an opening.':named+' sees an opening.',['Opening gained']);
    return; // Unknown tactical claims retain original event wording.
  }
  if(event.kind==='recovery'&&side(who)){
    const mode=event.mode;
    const line=mode==='breath'?(who==='player'?'You catch your breath.':named+' catches a breath.'):
      mode==='nerves'?(who==='player'?'You steady yourself.':named+' steadies up.'):
      (who==='player'?'You recover.':named+' recovers.');
    const parts:string[]=[];
    const gains:[unknown,string][]=[
      [event.staminaRestored,'Stamina'],[event.composureRestored,'Composure']];
    for(const [amount,label] of gains){const v=finite(amount);if(v!==null&&v>0)parts.push(number(v,label,'+'));}
    const fatigue=finite(event.fatigueRemoved);
    if(fatigue!==null&&fatigue>0)parts.push(number(fatigue,'Fatigue','−'));
    return story(line,parts);
  }
  if(event.kind==='technique'&&side(who)){
    const ability=word(n.ability?.name)||word(event.ability)||word(event.actionName);
    const amount=finite(event.amount);
    const effect=detailEffects(event);
    const parts=amount!==null?[number(Math.abs(amount),'Momentum',amount<0?'−':'+')]:[];
    return story(ability?(who==='player'?'You use ':named+' uses ')+ability+'.':
      (who==='player'?'You use a special attack.':named+' uses a special attack.'),
      [...parts,...effect.parts],effect.text);
  }
  if((event.kind==='ability'||event.kind==='effect'||event.kind==='status')&&side(who)){
    const ability=word(n.ability?.name)||word(event.ability);
    const effect=detailEffects(event);
    if(effect.parts.length===0&&!effect.text&&!ability)return;
    const line=(who==='player'?'You use ':named+' uses ')+(ability||'an ability')+'.';
    return story(line,effect.parts,effect.text);
  }
  if(event.kind==='momentum'&&side(who)){
    const value=finite(event.amount);if(value===null)return;
    return story(who==='player'?'You gain Momentum.':named+' gains Momentum.',
      [number(Math.abs(value),'Momentum',value<0?'−':'+')]);
  }
  if(event.kind==='fatigue'&&side(who)){
    const value=finite(event.amount);if(value===null)return;
    const total=finite(event.fatigue);
    return story(who==='player'?'You become more tired.':named+' becomes more tired.',
      [number(value,'Fatigue','+')+(total!==null?' · '+String(total)+'/100 total':'')]);
  }
  if(event.kind==='focus'&&side(who)){
    const parts:string[]=[];
    const cost=finite(event.composureCost);
    const bonus=finite(event.accuracyBonusPercent);
    const duration=finite(event.duration);
    if(cost!==null)parts.push(number(cost,'Composure','−'));
    if(bonus!==null)parts.push('+'+bonus+'% accuracy');
    if(duration!==null)parts.push(duration+' rounds');
    return story(who==='player'?'You focus on your attacks.':named+' focuses on the next attacks.',parts);
  }
  if(event.kind==='wound'){
    if(!side(who))return;
    if(event.condition==='bleed_started')
      return story(who==='player'?'You start bleeding.':named+' starts bleeding.',['Bleeding started']);
    if(event.condition==='serious_wound')
      return story(who==='player'?'You suffer a serious injury.':named+' suffers a serious injury.',
        ['Health limit reduced']);
    if(event.condition==='arm_impaired')
      return story(who==='player'?'Your arm is injured.':named+"'s arm is injured.",['Arm impaired']);
    const applied=detailEffects(event);
    if(applied.parts.length)return story(who==='player'?'You are injured.':named+' is injured.',
      applied.parts,applied.text);
    return;
  }
  if(event.kind==='bleed'&&side(who)){
    const amount=finite(event.damage);
    return story(who==='player'?'Your wound keeps bleeding.':named+' continues to bleed.',
      amount!==null?[number(amount,'Health','−')]:[]);
  }
  if(event.kind==='outcome'){
    if(state.outcome==='player_defeat')return story('You lose the fight.');
    if(state.outcome==='player_escaped')return story('You get away from the fight.');
    if(state.outcome==='player_victory'){
      const ending=n.outcome||event.condition;
      const fact=ending==='withdraw'?' stops fighting.':
        ending==='surrender'?' gives up.':
        ending==='downed'?' cannot continue.':null;
      return story(fact?state.enemy.name+fact+' You win.':'You win the fight.');
    }
  }
  return;
}
/** Only merge causes and results that belong to the same resolved action.
 * The engine still keeps every event (and every number) in saved history.
 */
function fold(events:StoryCombatEvent[],state:CombatState):void{
  const direct=new Set(['damage','miss','guard','move','recovery','focus','ability','effect','status']);
  for(let i=0;i<events.length;i++){
    const e=events[i],who=e.actor;
    if(!side(who)||!e.story||e.story.version!==2||e.story.hidden)continue;
    if(!['momentum','fatigue','technique'].includes(e.kind))continue;
    const id=word(facts(e).actionId);
    let found=-1;
    if(e.kind==='fatigue'){
      for(let j=i+1;j<events.length;j++){
        const t=events[j];
        if(t.round!==e.round)break;
        if(t.actor!==who||!direct.has(t.kind))continue;
        if(id&&facts(t).actionId!==id)continue;
        found=j;break;
      }
    }else if(e.kind==='technique'){
      for(let j=i+1;j<events.length;j++){
        const t=events[j];
        if(t.round!==e.round)break;
        if(t.actor!==who||!(t.kind==='damage'||t.kind==='miss'))continue;
        if(id&&facts(t).actionId!==id)continue;
        // The committed ability must also be named on the result before
        // hiding this separate technique event.
        if(!word(facts(t).ability?.name)&&!word(t.ability))continue;
        found=j;break;
      }
    }else{
      for(let j=i-1;j>=0;j--){
        const t=events[j];
        if(t.round!==e.round)break;
        if(id&&facts(t).actionId!==id)continue;
        if(t.kind==='damage'&&t.target===who&&t.guarded===true){found=j;break;}
        if(t.actor===who&&direct.has(t.kind)){found=j;break;}
      }
    }
    if(found<0)continue;
    const target=events[found],from=e.story,to=target.story;
    if(!to||to.version!==2||to.hidden)continue;
    // Keep resource owners clear when folded beneath another fighter's hit.
    const tag=e.kind==='momentum'&&target.actor!==who
      ?' ('+(who==='player'?'You':state.enemy.name)+')':'';
    const piece=from.detail;
    if(!piece)continue;
    target.story={...to,detail:(to.detail?to.detail+' · ':'')+piece+tag};
    e.story={...from,hidden:true};
  }
}
/** Do not change already-versioned entries. Save only newly committed facts.
 * History controls deterministic variation; no random call is made.
 */
export function narrateCommittedTurn(
  events:readonly CombatEvent[],chosen:CombatAction,
  enemyIntent:CombatState['intent'],state:CombatState,
  previousHistory:readonly CombatEvent[]=[]
):StoryCombatEvent[]{
  const all=events.map((event):StoryCombatEvent=>{
    const current={...event} as StoryCombatEvent;
    if(current.story)return current;
    if(!side(current.actor))return current;
    const action=current.actor==='player'?chosen:enemyIntent;
    if(!action)return current;
    const direct=['damage','miss','guard','move','recovery','technique','focus'].includes(current.kind);
    const defensiveOpening=current.kind==='tactical'&&current.actor==='player'&&
      chosen.type==='guard'&&current.condition==='opening_gained';
    if(!direct&&!defensiveOpening)return current;
    const type=action.type;
    if(!['attack','technique','guard','move','recover','focus'].includes(type))return current;
    const part=('zone' in action&&typeof action.zone==='string')?action.zone:
      ('to' in action&&typeof action.to==='string')?action.to:
      ('mode' in action&&typeof action.mode==='string')?action.mode:undefined;
    const actionName=type==='technique'&&'ability' in action&&typeof action.ability==='string'
      ?action.ability:undefined;
    return {...current,actionType:type,
      ...(part?{actionDetail:part}:{}),...(actionName?{actionName}:{})};
  });
  const lines=previousHistory.slice(-12).map(e=>(e as StoryCombatEvent).story?.line).filter(
    (x):x is string=>typeof x==='string');
  let previous=lines.at(-1)||'';
  let index=previousHistory.length;
  for(const event of all){
    if(!event.story){
      const item=display(event,state,index+event.round,previous);
      if(item){event.story=item;previous=item.line;}
    }
    index++;
  }
  fold(all,state);
  return all;
}
