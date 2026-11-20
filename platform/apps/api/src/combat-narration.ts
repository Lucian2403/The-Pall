/** Combat log presentation v1. The engine remains the source of every fact.
 * Runs inside the same transaction as the combat turn, before history is saved.
 * The existing 'text' is retained for old clients and old saved battles.
 * No random calls, changes to combat state, or guessed injuries.
 */
import type {CombatAction,CombatState,CombatEvent}
  from '@the-pall/game-core/combat-v0.5.1';

export type CombatStory={version:1;line:string;detail?:string;hidden?:boolean};
export type StoryCombatEvent=CombatEvent&{story?:CombatStory};

const partPattern=/\b(ribs|chest|side|temple|forearm|leg|shoulder)\b/i;
function bodyPart(event:CombatEvent):string{
  const found=event.text.match(partPattern)?.[1]?.toLowerCase();
  if(found)return 'in the '+found;
  if(event.zone==='head')return 'in the head';
  if(event.zone==='torso')return 'in the body';
  if(event.zone==='limbs')return 'in the limbs';
  return '';
}
function isUnarmed(weapon:CombatState['player']['weapon']):boolean{
  return weapon.unarmed===true||
    (weapon.unarmed===undefined&&weapon.damage===6&&
     weapon.accuracy===.70&&weapon.type==='blunt');
}
function attackWeapon(state:CombatState,who:'player'|'enemy'):string|null{
  const weapon=state[who].weapon;
  if(isUnarmed(weapon))return 'fist';
  if(weapon.type==='blunt'&&state.scene==='flint'&&who==='enemy')return 'club';
  if(weapon.type==='blunt'&&state.scene==='dogman'&&who==='enemy')return 'light club';
  if(weapon.type==='sharp'&&state.scene==='silas'&&who==='enemy')return 'iron hook';
  // A generic future enemy is not assumed to carry a club or hook.
  return null;
}
function actorName(state:CombatState,actor:'player'|'enemy'):string{
  return actor==='player'?'You':state.enemy.name;
}
function term(value:number,unit:string,sign=''):string{
  return sign+String(value)+' '+unit;
}
function shown(value:unknown):number|null{
  return typeof value==='number'&&Number.isFinite(value)?value:null;
}
function variant(lines:string[],slot:number,last?:string):string{
  let selection=((slot%lines.length)+lines.length)%lines.length;
  if(lines.length>1&&lines[selection]===last)
    selection=(selection+1)%lines.length;
  return lines[selection];
}
function hit(event:CombatEvent,state:CombatState,slot:number,last?:string):CombatStory|undefined{
  if(event.actor!=='player'&&event.actor!=='enemy')return;
  const dmg=shown(event.damage);
  if(dmg===null)return;
  const enemy=state.enemy.name;
  const loc=bodyPart(event);
  const suffix=loc?' '+loc:'';
  const weapon=attackWeapon(state,event.actor);
  const isPlayer=event.actor==='player';
  let possibilities:string[];
  if(isPlayer){
    if(weapon==='fist'){
      possibilities=[
        'You punch '+enemy+suffix+'.',
        'Your punch hits '+enemy+(loc?' '+loc:'')+'.',
        'You hit '+enemy+suffix+' with your fist.'
      ];
    }else{
      const equipped=weapon?' with your '+weapon:'';
      possibilities=[
        'You hit '+enemy+suffix+equipped+'.',
        'Your attack hits '+enemy+suffix+'.',
        'You strike '+enemy+suffix+equipped+'.'
      ];
    }
  }else if(state.scene==='boar'){
    possibilities=[
      'The boar hits you'+suffix+'.',
      'The injured boar strikes you'+suffix+'.'
    ];
  }else if(weapon==='fist'){
    possibilities=[
      enemy+' punches you'+suffix+'.',
      enemy+' hits you'+suffix+' with a fist.',
      enemy+' lands a punch'+(loc?' '+loc:'')+'.'
    ];
  }else{
    const withWeapon=weapon?' with a '+weapon:'';
    possibilities=[
      enemy+' hits you'+suffix+withWeapon+'.',
      enemy+' strikes you'+suffix+withWeapon+'.',
      weapon?enemy+'\'s '+weapon+' hits you'+suffix+'.':enemy+' lands a hit'+suffix+'.'
    ];
  }
  let line=variant(possibilities,slot,last);
  const opening=shown(event.openingDamageBonus);
  if(opening!==null&&opening>0){
    // This bonus is the proof the Opening was actually used.
    // Keep it in the same sentence, even when Guard also blocked damage.
    const withWeapon=weapon?(isPlayer?' with your ':' with a ')+weapon:'';
    line=isPlayer?'You take the opening and hit '+enemy+suffix+withWeapon+'.':
      enemy+' takes the opening and hits you'+suffix+withWeapon+'.';
  }
  const parts=[isPlayer?term(dmg,'damage'):term(dmg,'Health','−')];
  if(event.guarded===true){
    const raw=shown(event.raw);
    const blocked=raw===null?null:Math.max(0,raw-dmg);
    if(blocked!==null&&blocked>0){
      line+=' '+(isPlayer?enemy+' blocks part of the blow.':'Your guard takes part of the blow.');
      parts.push(term(blocked,'blocked'));
    }
  }
  if(opening!==null&&opening>0)parts.push(term(opening,'Opening bonus','+'));
  return {version:1,line,detail:parts.join(' · ')};
}
function miss(event:CombatEvent,state:CombatState,slot:number,last?:string):CombatStory|undefined{
  if(event.actor!=='player'&&event.actor!=='enemy')return;
  const who=event.actor;
  const enemy=state.enemy.name;
  const weapon=attackWeapon(state,who);
  if(event.reason==='old_position'&&state.scene==='boar')
    return {version:1,line:'The boar charges at where you were standing. It misses.'};
  if(event.text.includes('no longer within reach')||event.text.includes('falls short')){
    return {version:1,line:who==='player'
      ?'You strike, but '+enemy+' is out of reach.'
      :enemy+' tries to strike, but you are out of reach.'};
  }
  const sentences=who==='player'
    ?['You swing and miss '+enemy+'.','Your attack misses '+enemy+'.',
      'You try to hit '+enemy+', but miss.']
    :state.scene==='boar'
      ?['The boar rushes past you.','The boar attacks and misses.']
      :[enemy+' swings and misses.',enemy+' tries to hit you but misses.',
         weapon===null?enemy+' attacks but misses.':enemy+' misses with the '+weapon+'.'];
  return {version:1,line:variant(sentences,slot,last)};
}
function display(event:CombatEvent,state:CombatState,slot:number,last?:string):CombatStory|undefined{
  const who=event.actor;
  const name=who==='player'?'You':state.enemy.name;
  const his=who==='player'?'Your':state.enemy.name+'\'s';
  if(event.kind==='damage')return hit(event,state,slot,last);
  if(event.kind==='miss')return miss(event,state,slot,last);
  if(event.kind==='guard'&&(who==='player'||who==='enemy'))
    return {version:1,line:who==='player'?'You raise your guard.':name+' raises a guard.',
      detail:'Guard active'};
  if(event.kind==='move'&&(who==='player'||who==='enemy')){
    const to=event.actionDetail;
    const lines=to==='side'?['You step to the side.','You move sideways.']:
      to==='cover'?['You move behind cover.','You step behind cover.']:
      to==='back'?['You step back.','You move away.']:
      to==='close'?['You move closer.','You step closer.']:null;
    if(who==='player'&&lines)return {version:1,line:variant(lines,slot,last)};
    if(who==='enemy'){
      return {version:1,line:to==='side'?name+' steps to the side.':
        name+' moves closer.'};
    }
  }
  if(event.kind==='tactical'){
    if(who==='player'&&event.condition==='dodge_success')
      return {version:1,line:'You dodge '+state.enemy.name+'\'s attack.',
        detail:'Dodge successful'};
    if(who==='player'&&event.condition==='dodge_failed')
      return {version:1,line:'You try to dodge but do not get clear.',
        detail:'Dodge failed'};
    if(event.condition==='overcommitted')
      return {version:1,line:'You attack again without changing your stance. This leaves you open.',
        detail:'Opening given to '+state.enemy.name};
    if(event.text.includes('an opening:')&&(who==='player'||who==='enemy'))
      return {version:1,
        line:who==='player'?'You see an opening in '+state.enemy.name+'\'s guard.':
          state.enemy.name+' sees an opening in your guard.',
        detail:'Opening gained'};
    return; // Unknown tactical events keep the exact original explanation.
  }
  if(event.kind==='recovery'&&(who==='player'||who==='enemy')){
    const mode=event.mode;
    const line=mode==='breath'
      ?(who==='player'?'You catch your breath.':name+' stops to catch a breath.')
      :(who==='player'?'You steady yourself.':name+' takes a moment to steady up.');
    const changes:string[]=[];
    const stamina=shown(event.staminaRestored);
    const composure=shown(event.composureRestored);
    const fatigue=shown(event.fatigueRemoved);
    if(stamina!==null&&stamina>0)changes.push(term(stamina,'Stamina','+'));
    if(composure!==null&&composure>0)changes.push(term(composure,'Composure','+'));
    if(fatigue!==null&&fatigue>0)changes.push(term(fatigue,'Fatigue','−'));
    return {version:1,line,detail:changes.join(' · ')||undefined};
  }
  if(event.kind==='momentum'&&(who==='player'||who==='enemy')){
    const amount=shown(event.amount);
    return {version:1,line:his+' Momentum rises.',
      detail:amount===null?undefined:term(Math.abs(amount),'Momentum',amount>=0?'+':'−')};
  }
  if(event.kind==='fatigue'&&(who==='player'||who==='enemy')){
    const added=shown(event.amount);
    const total=shown(event.fatigue);
    return {version:1,line:who==='player'?'You are getting more tired.':name+' is getting more tired.',
      detail:added===null?undefined:term(added,'Fatigue','+')+
        (total!==null?' · '+String(total)+'/100 total':'')};
  }
  if(event.kind==='focus'&&(who==='player'||who==='enemy')){
    const cost=shown(event.composureCost);
    const duration=shown(event.duration);
    const bonus=shown(event.accuracyBonusPercent);
    const parts=[];
    if(cost!==null)parts.push(term(cost,'Composure','−'));
    if(bonus!==null)parts.push(term(bonus,'% accuracy','+'));
    if(duration!==null)parts.push(String(duration)+' rounds');
    return {version:1,line:who==='player'?'You focus on your next attacks.':
      name+' focuses on the next attacks.',detail:parts.join(' · ')};
  }
  if(event.kind==='technique'&&(who==='player'||who==='enemy')){
    const value=shown(event.amount);
    const label=(event.actionName||event.ability);
    const line=who==='player'?'You put more force into your next attack.':
      name+' prepares a stronger attack.';
    return {version:1,line:label?line+' '+label+'.':line,
      detail:value===null?undefined:term(Math.abs(value),'Momentum',value<0?'−':'+')};
  }
  if(event.kind==='wound'){
    if(event.condition==='arm_impaired')
      return {version:1,line:who==='player'
        ?'Your arm is hurt. Your attacks are less accurate.'
        :name+' has an injured arm. Attacks are less accurate.',
        detail:'Arm impaired'};
    if(event.text.includes('Light bleeding begins'))
      return {version:1,line:who==='player'?'You start bleeding.':name+' starts bleeding.',
        detail:'Bleeding started'};
    if(event.text.includes('severe impact'))
      return {version:1,line:who==='player'?'You suffer a serious injury.':
        name+' suffers a serious injury.',detail:'Health limit reduced'};
    // Bandages and unknown wound results keep their real engine wording.
  }
  if(event.kind==='bleed'){
    const damage=shown(event.damage);
    return {version:1,line:who==='player'?'Your wound keeps bleeding.':
      name+' continues to bleed.',
      detail:damage===null?undefined:term(damage,'Health','−')};
  }
  if(event.kind==='outcome'){
    const outcome=state.outcome;
    if(outcome==='player_defeat')
      return {version:1,line:'You fall and cannot go on. You lose.'};
    if(outcome==='player_escaped')
      return {version:1,line:'You get away from the fight.'};
    if(outcome==='player_victory'){
      const leaving=/backs away|gets out of|disappears|gives ground|ends the assault/i.test(event.text);
      return {version:1,line:leaving
        ?state.enemy.name+' backs away. You win.'
        :state.enemy.name+' can no longer fight. You win.'};
    }
  }
  return; // Leave opaque and legacy-compatible events untouched.
}

/** Fold simple resource notices into the related action in the same round.
 * The source events stay in history with all of their exact values, but only
 * one number line is shown for each change.
 */
function foldResourceDetails(events:StoryCombatEvent[],state:CombatState):void{
  const useful=new Set(['damage','miss','guard','move','recovery','technique','focus']);
  for(let i=0;i<events.length;i++){
    const ev=events[i];
    if((ev.kind!=='momentum'&&ev.kind!=='fatigue')||
      !ev.story?.detail||(ev.actor!=='player'&&ev.actor!=='enemy'))continue;
    let found=-1;
    if(ev.kind==='momentum'){
      // A defender earns Momentum by checking a specific hit with Guard.
      for(let j=i-1;j>=0;j--){
        const prev=events[j];
        if(prev.round!==ev.round)break;
        if(prev.kind==='damage'&&prev.target===ev.actor&&prev.guarded===true){
          found=j;break;
        }
        if(useful.has(prev.kind)&&prev.actor===ev.actor){
          found=j;break;
        }
      }
    }else{
      // Fatigue is recorded before the action that spent the Stamina.
      for(let j=i+1;j<events.length;j++){
        const next=events[j];
        if(next.round!==ev.round)break;
        if(useful.has(next.kind)&&next.actor===ev.actor){found=j;break;}
      }
    }
    if(found<0||!events[found].story)continue;
    const target=events[found];
    const suffix=ev.kind==='momentum'
      ?' ('+(ev.actor==='player'?'You':state.enemy.name)+')':'';
    const effect=ev.story.detail+suffix;
    const before=target.story!.detail;
    target.story={...target.story!,detail:before?before+' · '+effect:effect};
    ev.story={...ev.story,hidden:true};
  }
}

/** Add action identity and a saved versioned story to ONLY this committed turn.
 * It is idempotent, and deliberately leaves all numeric engine fields alone.
 */
export function narrateCommittedTurn(
  events:readonly CombatEvent[],chosen:CombatAction,
  enemyIntent:CombatState['intent'],state:CombatState,
  previousHistory:readonly CombatEvent[]=[]
):StoryCombatEvent[]{
  const all=events.map((event):StoryCombatEvent=>{
    let who=event.actor;
    if(event.kind==='recovery'&&!who){
      if(event.text.startsWith('You '))who='player';
      else if(event.text.startsWith(state.enemy.name+' '))who='enemy';
    }
    if(who!=='player'&&who!=='enemy')return {...event};
    const action=who==='player'?chosen:enemyIntent;
    if(!action)return {...event,actor:who};
    const direct=['damage','miss','guard','move','recovery','technique','focus'].includes(event.kind);
    const defensiveOpening=event.kind==='tactical'&&who==='player'&&
      chosen.type==='guard'&&event.text.includes('firm guard');
    if(!direct&&!defensiveOpening)return {...event,actor:who};
    const type=action.type;
    if(!['attack','technique','guard','move','recover','focus'].includes(type))
      return {...event,actor:who};
    const detail=('zone' in action&&typeof action.zone==='string')?action.zone:
      ('to' in action&&typeof action.to==='string')?action.to:
        ('mode' in action&&typeof action.mode==='string')?action.mode:undefined;
    const actionName=type==='technique'
      ?('ability' in action&&typeof action.ability==='string'
        ?action.ability:'Press Advantage'):undefined;
    return {...event,actor:who,actionType:type,
      ...(detail?{actionDetail:detail}:{}),
      ...(actionName?{actionName}: {})};
  });
  let previous='';
  let slot=previousHistory.length;
  for(const event of all){
    // Event metadata and saved history, not RNG, determine the variation.
    const story=display(event,state,slot,previous);
    if(story){
      event.story=story;
      previous=story.line;
    }
    slot++;
  }
  foldResourceDetails(all,state);
  return all;
}
