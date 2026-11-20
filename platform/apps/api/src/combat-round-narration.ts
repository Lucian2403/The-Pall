/** Round-level Chronicle built only from resolved, ordered combat events.
 * This writes display metadata to a NEW event, never changes a combat result.
 * Source event indexes are local to the saved round and preserve action order.
 */
import type {CombatEvent,CombatState} from '@the-pall/game-core/combat-v0.5.1';
import type {StoryCombatEvent,NarrationFacts} from './combat-narration.js';

export type CombatRoundStory={
  version:3;round:number;encounterId:string;line:string;detail?:string;
  eventRefs:number[];tactical:string[];
  actions:Array<{actorId:string;targetId?:string;kind:string;eventRef:number;actionId?:string}>;
};
export type RoundStoryEvent=StoryCombatEvent&{roundStory?:CombatRoundStory};
const str=(x:unknown)=>typeof x==='string'&&x.trim()?x.trim():undefined;
const num=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)?x:undefined;
const facts=(e:CombatEvent):NarrationFacts=>
  e.narration&&typeof e.narration==='object'?e.narration as NarrationFacts:{};
const period=(s:string)=>/[.!?]$/.test(s.trim())?s.trim():s.trim()+'.';
const actorId=(e:CombatEvent)=>str(e.actor)||'unknown';
const targetId=(e:CombatEvent)=>str(e.target);
const actorNames=(s:CombatState,e:CombatEvent):Record<string,string>=>({
  player:'You',enemy:s.enemy.name,
  ...(e.actorName?{[String(e.actor)]:String(e.actorName)}:{}),
  ...(e.targetName?{[String(e.target)]:String(e.targetName)}:{})
});
const label=(s:CombatState,e:CombatEvent,id:string)=>{
  const names=actorNames(s,e);
  return names[id]||'A fighter';
};
const object=(s:CombatState,e:CombatEvent,id:string)=>{
  if(id==='player')return 'you';
  if(id==='enemy')return s.enemy.name;
  return str(e.targetName)||'the target';
};
function destination(e:CombatEvent):string{
  const explicit=targetId(e);
  return explicit|| (actorId(e)==='player'?'enemy':'player');
}
function possessive(name:string):string{
  return name==='you'?'your':name.endsWith('s')?name+"'":name+"'s";
}
function weapon(state:CombatState,e:CombatEvent):string{
  const i=facts(e).action?.instrument;
  if(i){
    if(str(i.phrase))return ' '+i.phrase;
    if(i.kind==='weapon'&&str(i.name))
      return actorId(e)==='player'?' with your '+i.name:' with a '+i.name;
    return '';
  }
  // Existing prototype has a label for equipped weapons. No assumption about anatomy.
  const a=actorId(e)==='player'?state.player:actorId(e)==='enemy'?state.enemy:null;
  return a?.weapon.unarmed!==true&&str(a?.weapon.label)
    ?actorId(e)==='player'?' with your '+a.weapon.label:' with a '+a.weapon.label:'';
}
function part(e:CombatEvent):string{
  const hit=str(facts(e).action?.hitPart)||str(e.hitPart);
  if(!hit)return '';
  // Known plain words use familiar "in the" wording. Other creature parts
  // use a neutral possessive without assuming human anatomy.
  return /^(ribs|chest|side|stomach|back|head|face|arm|shoulder|leg|neck)$/i.test(hit)
    ?' in the '+hit:' on the '+hit;
}
function ability(e:CombatEvent):string|undefined{
  return str(facts(e).ability?.name)||str(e.ability);
}
function hitLine(s:CombatState,e:CombatEvent,previous?:CombatRoundStory):string{
  const who=actorId(e),from=label(s,e,who),to=object(s,e,destination(e));
  const verb=facts(e).action?.verb;
  const actionWord=str(who==='player'?verb?.base:verb?.thirdPerson);
  const source=weapon(s,e),loc=part(e);
  let line=actionWord?from+' '+actionWord+' '+to+loc+source:
    who==='player'?'You hit '+to+loc+source:from+' hits '+to+loc+source;
  const used=facts(e).openingUsed===true||(num(e.openingDamageBonus)??0)>0;
  if(used){
    const wasOpen=previous?.tactical.some(x=>x.includes('Opening gained')&&
      x.includes(from==='You'?'You':from));
    line=(who==='player'?'You':' '+from).trim()+
      (wasOpen?(who==='player'?' take the opening and ':' takes the opening and '):
       (who==='player'?' use an opening and ':' uses an opening and '))+
      (actionWord?actionWord:'hit')+' '+to+loc+source;
  }
  const namedAbility=ability(e);
  if(namedAbility&&!used)line=(who==='player'?'You use ':from+' uses ')+namedAbility+
      ' and '+(actionWord?actionWord:'hit')+' '+to+loc+source;
  else if(namedAbility&&used)line=(who==='player'?'You':' '+from).trim()+
      (who==='player'?' use ':' uses ')+namedAbility+' with the opening and '+(actionWord?actionWord:'hit')+
      ' '+to+loc+source;
  if(e.guarded===true&&(num(e.raw)??0)>(num(e.damage)??0)){
    const blocker=destination(e)==='player'?'you':object(s,e,destination(e));
    line+=blocker==='you'?', but you block part of the blow':
      ', but '+blocker+' blocks part of the blow';
  }
  return period(line);
}
function missLine(s:CombatState,e:CombatEvent):string{
  const who=actorId(e),from=label(s,e,who),to=object(s,e,destination(e));
  const spell=ability(e);
  const action=spell?from+(who==='player'?' use ':' uses ')+spell+' but ':
    from+(who==='player'?' attack ':' attacks ');
  if(e.reason==='out_of_reach')
    return period(from+(who==='player'?' cannot reach ':' cannot reach ')+to);
  if(e.reason==='old_position')return period(from+' attacks the place '+to+
    (to==='you'?' were':' was')+', but misses');
  if(spell)return period(action+'misses '+to);
  return period(from+(who==='player'?' attack ':' attacks ')+to+' but miss'+(who==='player'?'':'es'));
}
function moveLine(s:CombatState,e:CombatEvent):string|undefined{
  const n=facts(e),mode=str(n.movement?.kind)||str(e.actionDetail);
  const from=label(s,e,actorId(e));
  if(mode==='side')return period(from+(from==='You'?' step':' steps')+' aside');
  if(mode==='back')return period(from+(from==='You'?' step':' steps')+' back');
  if(mode==='close')return period(from+(from==='You'?' move':' moves')+' closer');
  if(mode==='cover')return period(from+(from==='You'?' move':' moves')+' behind cover');
  if(mode==='leave')return period(from+(from==='You'?' leave':' leaves')+' the fight');
  if(mode||n.movement)return period(from+(from==='You'?' move':' moves'));
}
function actionLine(s:CombatState,e:CombatEvent,prior?:CombatRoundStory):string|undefined{
  const from=label(s,e,actorId(e));
  switch(e.kind){
    case 'damage':return hitLine(s,e,prior);
    case 'miss':return missLine(s,e);
    case 'guard':return period(from+(from==='You'?' guard':' guards'));
    case 'move':return moveLine(s,e);
    case 'focus':return period(from+(from==='You'?' focus':' focuses')+' on the next attack');
    case 'recovery':
      if(e.mode==='breath')return period(from==='You'?'You catch your breath':from+' catches a breath');
      return period(from==='You'?'You steady yourself':from+' steadies up');
    case 'ability':case 'effect':case 'status':
      if(!ability(e))return;
      return period(from+(from==='You'?' use ':' uses ')+ability(e));
    case 'warning':
      // A committed warning is the engine's report of a failed action.
      // Unlike the enemy's intent, this can explain an important failure.
      return str(e.text)?period(e.text):undefined;
    case 'outcome':
      if(s.outcome==='player_victory')return 'You win the fight.';
      if(s.outcome==='player_defeat')return 'You lose the fight.';
      if(s.outcome==='player_escaped')return 'You get away.';
  }
}
function statusLine(s:CombatState,e:CombatEvent):string|undefined{
  const who=actorId(e),from=label(s,e,who);
  if(e.kind==='wound'){
    if(e.condition==='bleed_started')return period(from+(from==='You'?' start':' starts')+' bleeding');
    if(e.condition==='serious_wound')return period(from+(from==='You'?' suffer':' suffers')+' a serious injury');
    if(e.condition==='arm_impaired')return period(from+(from==='You'?' have':' has')+' an injured arm');
    const outcomes=facts(e).effects?.filter(x=>x.applied===true);
    if(outcomes?.length)return period(from+' is affected');
  }
  if(e.kind==='bleed')return period(from+(from==='You'?' keep':' keeps')+' bleeding');
}
function extras(e:CombatEvent,s:CombatState):string[]{
  const who=actorId(e),to=destination(e),from=label(s,e,who);
  const entries:string[]=[];
  const amount=num(e.damage),raw=num(e.raw);
  if(e.kind==='damage'&&amount!==undefined){
    entries.push(amount+' damage to '+object(s,e,to));
    if(e.guarded&&raw!==undefined&&raw>amount)entries.push(raw-amount+' blocked');
    const bonus=num(e.openingDamageBonus);if(bonus&&bonus>0)entries.push('Opening bonus +'+bonus);
  }
  if(e.kind==='bleed'&&amount!==undefined)entries.push(amount+' bleeding damage to '+object(s,e,to));
  if(e.kind==='momentum'&&num(e.amount)!==undefined)
    entries.push((Number(e.amount)>=0?'+':'−')+Math.abs(Number(e.amount))+' Momentum ('+from+')');
  if(e.kind==='fatigue'&&num(e.amount)!==undefined)
    entries.push('+'+e.amount+' Fatigue ('+from+')');
  if(e.kind==='technique'&&num(e.amount)!==undefined)
    entries.push('−'+Math.abs(Number(e.amount))+' Momentum ('+from+')');
  if(e.kind==='recovery'){
    if(num(e.staminaRestored))entries.push('+'+e.staminaRestored+' Stamina ('+from+')');
    if(num(e.composureRestored))entries.push('+'+e.composureRestored+' Composure ('+from+')');
    if(num(e.fatigueRemoved))entries.push('−'+e.fatigueRemoved+' Fatigue ('+from+')');
  }
  for(const effect of facts(e).effects||[]){
    if(effect.applied!==true||effect.kind==='damage'&&amount!==undefined)continue;
    const name=str(effect.label)||str(effect.kind)||'Effect';
    const duration=num(effect.durationRounds);
    entries.push(name+(duration?' ('+duration+' rounds)':''));
  }
  return entries;
}
function tactical(e:CombatEvent,s:CombatState):string|undefined{
  const from=label(s,e,actorId(e));
  if(e.kind==='tactical'){
    if(e.condition==='opening_gained')return 'Opening gained ('+from+')';
    if(e.condition==='overcommitted')return 'Exposed ('+from+')';
    if(e.condition==='dodge_success')return 'Dodge successful ('+from+')';
    if(e.condition==='dodge_failed')return 'Dodge failed ('+from+')';
  }
  if(e.kind==='wound'&&e.condition==='bleed_started')return 'Bleeding ('+from+')';
  if(e.kind==='wound'&&e.condition==='serious_wound')return 'Serious injury ('+from+')';
  if(e.kind==='wound'&&e.condition==='arm_impaired')return 'Arm injured ('+from+')';
  return;
}
/** Write one immutable Chronicle summary to the last event of each new round.
 * The original event array remains complete, ordered, and available for details.
 * A pre-existing round story is never recomputed.
 */
export function narrateCommittedRounds(
  events:readonly CombatEvent[],state:CombatState,prior:readonly CombatEvent[]=[]
):RoundStoryEvent[]{
  const result=events.map(e=>({...e} as RoundStoryEvent));
  const groups=new Map<number,number[]>();
  result.forEach((e,i)=>groups.set(e.round,[...(groups.get(e.round)||[]),i]));
  let previous=([...prior].reverse().find(e=>(e as RoundStoryEvent).roundStory) as RoundStoryEvent|undefined)?.roundStory;
  for(const [round,ids] of groups){
    const last=result[ids[ids.length-1]];
    if(last.roundStory){previous=last.roundStory;continue;}
    const pieces:Array<{text:string;kind:string;actor:string;index:number}>=[];
    const statuses:string[]=[],details:string[]=[];
    const actions:CombatRoundStory['actions']=[];
    for(let k=0;k<ids.length;k++){
      const e=result[ids[k]],index=ids[k];
      if(e.kind==='intent')continue; // Telegraph is visible elsewhere before the turn.
      const phrase=actionLine(state,e,previous)||statusLine(state,e);
      if(phrase)pieces.push({text:phrase,kind:e.kind,actor:actorId(e),index:k});
      const flag=tactical(e,state);if(flag&&!statuses.includes(flag))statuses.push(flag);
      for(const value of extras(e,state))if(!details.includes(value))details.push(value);
      if(['damage','miss','guard','move','focus','recovery','ability','effect','status','outcome'].includes(e.kind))
        actions.push({actorId:actorId(e),...(targetId(e)?{targetId:targetId(e)}:{}),
          kind:e.kind,eventRef:k,...(str(facts(e).actionId)?{actionId:facts(e).actionId}:{})});
    }
    // Don't repeat "You use X" from a technique notice if its damage/miss is
    // already recorded. Technique costs stay visible in the detail line.
    // Movement then miss can form one factual exchange in the same order.
    for(let k=0;k<pieces.length-1;k++){
      const left=pieces[k],right=pieces[k+1];
      if(left.kind==='move'&&right.kind==='miss'&&left.actor!==right.actor){
        const enemy=label(state,result[ids[right.index]],right.actor);
        left.text=left.text.replace(/\.$/,'')+', and '+enemy+
          (right.actor==='player'?' miss':' misses')+
          (right.actor==='player'?' '+object(state,result[ids[right.index]],destination(result[ids[right.index]])):
            ' '+object(state,result[ids[right.index]],destination(result[ids[right.index]])))+'.';
        pieces.splice(k+1,1);
      }
    }
    // Minor state changes have a label; serious wounds and outcomes get text.
    // Cap the main narrative at three short sentences; every source event can
    // be inspected and no numerical effect is thrown away.
    const sentence=pieces.slice(0,3).map(x=>x.text).join(' ')||'The round ends.';
    const headline=details.filter(x=>/damage to|blocked|Opening bonus/.test(x));
    const extrasCompact=details.filter(x=>!headline.includes(x));
    const show=[...headline,...extrasCompact].slice(0,4);
    const summary:CombatRoundStory={
      version:3,round,encounterId:state.id,line:sentence,
      ...(show.length?{detail:show.join(' · ')}:{}),
      eventRefs:ids.map((_,i)=>i),tactical:statuses,actions
    };
    // Preserve engine events in order. Only the last fresh event gets the
    // round-level projection. Version 1/2 and unversioned history stay intact.
    last.roundStory=summary;
    previous=summary;
  }
  return result;
}
