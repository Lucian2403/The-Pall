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
  return a!==null&&a.weapon.unarmed!==true&&str(a.weapon.label)
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
/** Read recent, resolved combat facts. Never infer past actions from prose. */
type RecentCombat={
  hits:Map<string,number>;misses:Map<string,number>;
  openingsUsed:Map<string,number>;guards:Map<string,number>;
};
function recentCombat(events:readonly CombatEvent[],round:number):RecentCombat{
  const hits=new Map<string,number>(),misses=new Map<string,number>();
  const openingsUsed=new Map<string,number>(),guards=new Map<string,number>();
  const recent=new Map<number,CombatEvent[]>();
  for(const e of events){
    if(e.round>=round||e.round<round-8)continue;
    const group=recent.get(e.round)||[];
    group.push(e);recent.set(e.round,group);
  }
  const actors=new Set<string>();
  for(const group of recent.values())
    for(const e of group)if(str(e.actor))actors.add(actorId(e));
  for(const who of actors){
    let canHit=true,canMiss=true,canOpen=true,canGuard=true;
    for(let r=round-1;r>=Math.max(1,round-8);r--){
      const group=recent.get(r)||[];
      const attacks=group.filter(e=>actorId(e)===who&&
        (e.kind==='damage'||e.kind==='miss'));
      const last=attacks.at(-1);
      const used=attacks.some(e=>facts(e).openingUsed===true||
        (num(e.openingDamageBonus)??0)>0);
      if(canHit&&last?.kind==='damage')hits.set(who,(hits.get(who)||0)+1);
      else canHit=false;
      if(canMiss&&last?.kind==='miss')misses.set(who,(misses.get(who)||0)+1);
      else canMiss=false;
      if(canOpen&&used)openingsUsed.set(who,(openingsUsed.get(who)||0)+1);
      else canOpen=false;
      if(canGuard&&group.some(e=>actorId(e)===who&&e.kind==='guard'))
        guards.set(who,(guards.get(who)||0)+1);
      else canGuard=false;
      if(!canHit&&!canMiss&&!canOpen&&!canGuard)break;
    }
  }
  return {hits,misses,openingsUsed,guards};
}
function repeatCount(history:readonly CombatRoundStory[],e:CombatEvent):number{
 const who=actorId(e),name=ability(e);
 return history.filter(r=>r.actions.some(a=>a.actorId===who&&a.kind===e.kind)&&
   (!name||r.line.includes(name))).length;
}
function hitLine(s:CombatState,e:CombatEvent,previous?:CombatRoundStory,
  history:readonly CombatRoundStory[]=[],recent?:RecentCombat):string{
 const who=actorId(e),from=label(s,e,who),to=object(s,e,destination(e));
 const verb=facts(e).action?.verb;
 const base=str(verb?.base)||'hit';
 const active=str(who==='player'?verb?.base:verb?.thirdPerson)||
   (who==='player'?'hit':'hits');
 const source=weapon(s,e),loc=part(e),namedAbility=ability(e);
 const count=recent?.hits.get(who)??0;
 // Reusing an ability is a real past fact, even when other moves broke
 // the hit streak. Only consecutive hits can be described as 'again'.
 const abilityUses=repeatCount(history,e);
 let line:string;
 if(namedAbility){
   if(abilityUses%3===1)
     line=from+' '+active+' '+to+loc+source+' using '+namedAbility;
   else if(abilityUses%3===2)
     line=from+(who==='player'?' use ':' uses ')+namedAbility+' to '+base+' '+to+loc+source;
   else line=from+(who==='player'?' use ':' uses ')+namedAbility+
     ' and '+active+' '+to+loc+source;
 }else if(count>0&&!verb){
   if(count%3===1)line=from+(who==='player'?' hit ':' hits ')+to+
     ' again'+loc+source;
   else if(count%3===2)line=from+(who==='player'?' land ':' lands ')+
     'another hit on '+to+loc+source;
   else line=from+(who==='player'?' strike ':' strikes ')+to+
     ' again'+loc+source;
 }else line=from+' '+active+' '+to+loc+source;
 const used=facts(e).openingUsed===true||(num(e.openingDamageBonus)??0)>0;
 if(used&&(recent?.openingsUsed.get(who)??0)===0){
   line=from+(who==='player'?' take the opening and ':' takes the opening and ')+
     (namedAbility?(who==='player'?'use ':'uses ')+namedAbility+' to '+base:active)+
     ' '+to+loc+source;
 }
 if(e.guarded===true&&(num(e.raw)??0)>(num(e.damage)??0)){
   const blocker=destination(e)==='player'?'you':object(s,e,destination(e));
   line+=blocker==='you'?', but you block part of the blow':
     ', but '+blocker+' blocks part of the blow';
 }
 return period(line);
}
function missLine(s:CombatState,e:CombatEvent,
  history:readonly CombatRoundStory[]=[],recent?:RecentCombat):string{
 const who=actorId(e),from=label(s,e,who),to=object(s,e,destination(e));
 const spell=ability(e),count=recent?.misses.get(who)??0;
 const abilityTries=repeatCount(history,e);
 if(e.reason==='out_of_reach')return period(spell
   ?abilityTries%2===1
     ?from+(who==='player'?' try ':' tries ')+spell+', but '+to+' is out of reach'
     :from+(who==='player'?' use ':' uses ')+spell+', but cannot reach '+to
   :from+' cannot reach '+to+(count?' again':''));
 if(e.reason==='old_position')return period(from+' attacks the place '+to+
   (to==='you'?' were':' was')+', but misses');
 if(spell)return period(from+(who==='player'?' use ':' uses ')+spell+
   ' but misses '+to+(count?' again':''));
 if(count>0){
   if(who==='player')return period(count%3===1?'You miss '+to+' again':
     count%3===2?'Your attack misses '+to+' again':
       'You still cannot hit '+to);
   return period(count%3===1?from+' misses '+to+' again':
     count%3===2?from+' tries to hit '+to+' again, but misses':
       from+' still cannot hit '+to);
 }
 return period(who==='player'?'You attack '+to+' but miss':
   from+' attacks '+to+' but misses');
}
function moveLine(s:CombatState,e:CombatEvent,
  history:readonly CombatRoundStory[]=[]):string|undefined{
 const n=facts(e),mode=str(n.movement?.kind)||str(e.actionDetail);
 const from=label(s,e,actorId(e)),repeat=repeatCount(history,e);
 if(mode==='side')
   return period(from+(repeat%2===0?(from==='You'?' step':' steps')+' aside':
     (from==='You'?' move':' moves')+' to the side'));
 if(mode==='back')return period(from+(from==='You'?' step':' steps')+' back');
 if(mode==='close')return period(from+(from==='You'?' move':' moves')+' closer');
 if(mode==='cover')return period(from+(from==='You'?' move':' moves')+' behind cover');
 if(mode==='leave')return period(from+(from==='You'?' leave':' leaves')+' the fight');
 if(mode||n.movement)return period(from+(from==='You'?' move':' moves'));
}
function actionLine(s:CombatState,e:CombatEvent,prior?:CombatRoundStory,
  history:readonly CombatRoundStory[]=[],recent?:RecentCombat):string|undefined{
  const from=label(s,e,actorId(e));
  switch(e.kind){
    case 'damage':return hitLine(s,e,prior,history,recent);
    case 'miss':return missLine(s,e,history,recent);
    case 'guard':return period(from+(from==='You'?' guard':' guards')+
      ((recent?.guards.get(actorId(e))??0)>0?' again':''));
    case 'move':return moveLine(s,e,history);
    case 'focus':return period(from+(from==='You'?' focus':' focuses')+' on the next attack');
    case 'recovery':
      if(e.mode==='breath'){
        const repeated=repeatCount(history,e)%2!==0;
        return period(from==='You'
          ?(repeated?'You rest for a moment':'You catch your breath')
          :(repeated?from+' rests for a moment':from+' catches a breath'));
      }
      return period(from==='You'?'You steady yourself':from+' steadies up');
    case 'ability':case 'effect':case 'status':
      if(!ability(e))return;
      return period(from+(from==='You'?' use ':' uses ')+ability(e));
    case 'warning':
      // Failed committed actions can matter. Intent is never treated as one.
      return str(e.text)?period(e.text):undefined;
    case 'outcome':
      if(s.outcome==='player_victory'){
        if(e.condition==='withdraw')return period(s.enemy.name+
          ' stops fighting')+' You win.';
        if(s.enemy.hp<=0)return period(s.enemy.name+
          ' cannot continue')+' You win.';
        return 'You win the fight.';
      }
      if(s.outcome==='player_defeat')
        return s.player.hp<=0?'You cannot continue. You lose.':'You lose the fight.';
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
  // Repeated bleed ticks stay in numerical details. Only the start of
  // bleeding or a serious wound needs an extra sentence.
  if(e.kind==='bleed')return undefined;
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
  if(e.kind==='move'&&str(facts(e).movement?.place))
    entries.push('Position: '+facts(e).movement!.place);
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
    const value=num(effect.amount),unit=str(effect.unit);
    const quantity=value===undefined?'':': '+(value<0?'−':'')+Math.abs(value)+(unit?' '+unit:'');
    entries.push(name+quantity+(duration?' ('+duration+' rounds)':''));
  }
  return entries;
}
function tactical(e:CombatEvent,s:CombatState):string|undefined{
  const from=label(s,e,actorId(e));
  if((e.kind==='miss'||e.kind==='damage')&&
    (facts(e).openingUsed===true||(num(e.openingDamageBonus)??0)>0))
    return 'Opening used ('+from+')';
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
  const memory=prior.flatMap(e=>{const r=(e as RoundStoryEvent).roundStory;
    return r?.version===3?[r]:[];});
  let previous=memory.at(-1);
  for(const [round,ids] of groups){
    const recent=recentCombat(prior,round);
    const last=result[ids[ids.length-1]];
    if(last.roundStory){previous=last.roundStory;memory.push(last.roundStory);continue;}
    // Every item refers to its original LOCAL event index. Do not infer an
    // action from the pre-turn telegraph; the engine has already resolved it.
    const pieces:Array<{
      text:string;kind:string;actor:string;index:number;priority:number
    }>=[];
    const statuses:string[]=[],details:string[]=[];
    const actions:CombatRoundStory['actions']=[];
    const actionKinds=new Set([
      'damage','miss','guard','move','focus','recovery',
      'ability','effect','status','outcome'
    ]);
    for(let k=0;k<ids.length;k++){
      const e=result[ids[k]];
      if(e.kind==='intent')continue; // Already visible before the choice.
      let phrase=actionLine(state,e,previous,memory,recent)||statusLine(state,e);
      if(e.kind==='warning'&&str(e.text))phrase=period(e.text);
      // A committed special attack is named on its hit/miss. If no hit/miss
      // followed it, keep the ability announcement rather than inventing one.
      if(e.kind==='technique'&&str(ability(e))&&
        !ids.slice(k+1).some(id=>{
          const next=result[id];
          return next.actor===e.actor&&
            (next.kind==='damage'||next.kind==='miss')&&
            ability(next)===ability(e);
        })){
        const name=label(state,e,actorId(e));
        phrase=period(name+(name==='You'?' use ':' uses ')+ability(e));
      }
      if(phrase){
        const priority=e.kind==='outcome'?5:
          e.kind==='damage'?4:
          e.kind==='wound'&&
            ['bleed_started','serious_wound','arm_impaired'].includes(String(e.condition))?4:
          ['miss','warning'].includes(e.kind)?3:
          ['move','guard','recovery','focus','ability','effect','status','technique'].includes(e.kind)?2:1;
        pieces.push({text:phrase,kind:e.kind,actor:actorId(e),index:k,priority});
      }
      const flag=tactical(e,state);
      if(flag&&!statuses.includes(flag))statuses.push(flag);
      // Damage and repeated effects may have the same value. Do not dedupe
      // those occurrences: each is a separate authoritative result.
      details.push(...extras(e,state));
      if(actionKinds.has(e.kind))
        actions.push({actorId:actorId(e),
          ...(targetId(e)?{targetId:targetId(e)}:{}),
          kind:e.kind,eventRef:k,
          ...(str(facts(e).actionId)?{actionId:facts(e).actionId}:{})});
    }
    // Preserve initiative order. Wounds and the outcome deserve room even
    // if movement or Guard happened earlier in the same exchange.
    const meaningful=pieces.filter(p=>p.priority>=2);
    const essential=meaningful.filter(p=>p.priority>=4);
    let selected:typeof pieces;
    if(essential.length>=3)
      selected=essential.length===3?essential:[essential[0],...essential.slice(-2)];
    else if(essential.length===2)selected=[...essential];
    else if(essential.length===1){
      const other=meaningful.find(p=>p.index!==essential[0].index);
      selected=other?[other,essential[0]]:[essential[0]];
    }else selected=meaningful.slice(0,2);
    selected.sort((a,b)=>a.index-b.index);
    // A move + a later out-of-range miss can form one connected sentence,
    // but a failed dodge MUST NOT be turned into a successful dodge.
    const combined:string[]=[];
    for(let i=0;i<selected.length;i++){
      const current=selected[i],next=selected[i+1];
      if(next&&current.actor!==next.actor&&
        current.kind==='miss'&&next.kind==='miss'&&
        !ability(result[ids[current.index]])&&!ability(result[ids[next.index]])&&
        result[ids[current.index]].reason==='attack_roll'&&
        result[ids[next.index]].reason==='attack_roll'){
        const a=label(state,result[ids[current.index]],current.actor);
        const b=label(state,result[ids[next.index]],next.actor);
        const repeated=(recent.misses.get(current.actor)||0)>0&&
          (recent.misses.get(next.actor)||0)>0;
        combined.push(a+(a==='You'?' and ':' and ')+
          (b==='You'?'you':b)+(repeated?' both miss again.':' both miss.'));
        i++;continue;
      }
      if(next&&current.kind==='recovery'&&next.kind==='move'&&
        current.actor!==next.actor){
        const after=next.text.replace(/\.$/,'');
        combined.push(current.text.replace(/\.$/,'')+' while '+
          (after.startsWith('You ')?'you '+after.slice(4):after)+'.');
        i++;continue;
      }
      if(next&&current.kind==='guard'&&next.kind==='outcome'&&
        result[ids[next.index]].condition==='withdraw'){
        const after=next.text.replace(/^You /,'you ');
        combined.push(current.text.replace(/\.$/,'')+', but '+after);
        i++;continue;
      }
      if(next&&current.kind==='damage'&&next.kind==='damage'&&
        current.actor!==next.actor){
        const later=result[ids[next.index]];
        const name=label(state,later,next.actor);
        const nextText=(name==='You'&&next.text.startsWith('You hit '))
          ?next.text.replace(/^You hit /,'You also hit ')
          :next.text.startsWith(name+' hits ')
            ?next.text.replace(name+' hits ',name+' also hits ')
            :next.text;
        combined.push(current.text+' '+nextText);
        i++;continue;
      }
      if(next&&current.kind==='miss'&&next.kind==='damage'&&
        current.actor!==next.actor){
        const after=next.text.replace(/^You /,'you ');
        combined.push(current.text+' Then '+after);
        // The period on the generated second sentence is already present.
        i++;continue;
      }
      if(next&&current.kind==='move'&&next.kind==='miss'&&
        current.actor!==next.actor&&
        ['out_of_reach','old_position'].includes(String(result[ids[next.index]].reason))&&
        ['side','back','cover'].includes(String(facts(result[ids[current.index]]).movement?.kind||
          result[ids[current.index]].actionDetail))){
        const failed=ids.slice(current.index+1,next.index)
          .some(id=>result[id].condition==='dodge_failed');
        const first=current.text.replace(/\.$/,'');
        const second=next.text.replace(/\.$/,'');
        if(failed){
          const subject=label(state,result[ids[next.index]],next.actor);
          combined.push(current.text+' Your dodge fails, but '+
            (subject==='You'?'you':subject)+' still '+(subject==='You'?'miss':'misses')+'.');
        }else if(next.actor==='player'){
          const reason=result[ids[next.index]].reason;
          combined.push(first+', and '+(reason==='out_of_reach'
            ?'your attack falls short':'your attack misses')+'.');
        }else combined.push(first+', and '+second+'.');
        i++;continue;
      }
      combined.push(current.text);
    }
    let sentence=combined.join(' ')||'The round ends.';
    // Short numbers: first show real harm/blocking, then actual applied
    // conditions. All remaining values stay under each round's Details.
    const isHarm=(v:string)=>/damage to|blocked|Opening bonus/.test(v);
    const importantEffects=ids.flatMap(id=>(facts(result[id]).effects||[])
      .filter(effect=>effect.applied===true&&effect.kind!=='damage')
      .map(effect=>str(effect.label)||str(effect.kind)||'Effect'));
    const injury=(v:string)=>importantEffects.some(name=>v.startsWith(name));
    const prominent=details.filter(v=>isHarm(v));
    const effects=details.filter(v=>!isHarm(v)&&injury(v));
    const rest=details.filter(v=>!isHarm(v)&&!injury(v));
    const ordered=[...prominent,...effects,...rest];
    const compact=ordered.slice(0,3);
    // The expandable Details section is always present. Do not fill the
    // short Chronicle with a repeated "More details" warning.
    const summary:CombatRoundStory={
      version:3,round,encounterId:state.id,line:sentence,
      ...(compact.length?{detail:compact.join(' · ')}:{}),
      eventRefs:ids.map((_,i)=>i),tactical:statuses,actions
    };
    // Versioned summary lives only on the last new event. The raw events
    // (including intent, repeated resource notices, and all exact amounts)
    // remain in their original order and keep their own v1/v2 narration.
    last.roundStory=summary;
    previous=summary;memory.push(summary);
  }
  return result;
}
