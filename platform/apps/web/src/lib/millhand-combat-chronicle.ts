import type {CombatEventView,CombatRoundStoryView} from './millhand-combat-model';

const title=(value?:string)=>value?value[0].toUpperCase()+value.slice(1):'';

/** Chronicle labels describe a *committed* action or a non-action event.
 * Older saved logs without action metadata remain marked generically instead
 * of inventing a specific technique or retreat they might not have used.
 */
export function combatActionLabel(event:CombatEventView):string {
  const part=event.actionDetail||event.zone;
  const suffix=part?'-'+title(part):'';
  if(event.actionType==='attack')return 'Attack'+suffix;
  if(event.actionType==='guard')return 'Guard';
  if(event.actionType==='focus')return 'Focused Stance';
  if(event.actionType==='move')return 'Reposition'+suffix;
  if(event.actionType==='recover'){
    return 'Recover-'+(event.actionDetail==='breath'?'Stamina':
      event.actionDetail==='nerves'?'Composure':title(event.actionDetail)||'Reserve');
  }
  if(event.actionType==='technique')
    return (event.actionName??(event.actor==='enemy'?'Technique':'Press Advantage'))+suffix;
  switch(event.kind){
    case 'intent':return 'Intent';
    case 'damage':case 'miss':
      return (event.ability??'Strike')+suffix;
    case 'guard':return 'Guard';
    case 'move':return 'Reposition';
    case 'recovery':return 'Recover';
    case 'technique':return 'Technique';
    case 'tactical':return 'Opening';
    case 'momentum':return 'Momentum';
    case 'fatigue':return 'Fatigue';
    case 'focus':return 'Focused Stance';
    case 'bleed':return 'Bleeding';
    case 'wound':return 'Wound';
    case 'outcome':return 'Result';
    case 'warning':return 'Warning';
    default:return 'Event';
  }
}

/** Only completed enemy combat actions get the red action label.
 * A telegraphed threat is not treated as an attack that already happened. */
export function isEnemyCombatAction(event:CombatEventView):boolean{
  return event.actor==='enemy'&&
    (event.actionType!==undefined||
      ['damage','miss','guard','move','technique','recovery','focus'].includes(event.kind));
}

/** Keep every raw event under its saved round. The summary is attached to
 * the last committed event. Earlier saves never acquire a synthetic v3 story.
 */
export type CombatChronicleRound={
 key:string;round:number;main:string;detail?:string;tactical:string[];
 events:CombatEventView[];isLegacy:boolean;roundStory?:CombatRoundStoryView
};
/** Event presentation is separate from the saved engine record.
 * New logs show their versioned sentence, not raw text with numbers glued on.
 * Legacy logs have a minimal display-only cleanup; the original is retained.
 */
export function combatEventText(event:CombatEventView):string{
  if(event.story?.line)return event.story.line;
  const clean=event.text.replace(/\\\./g,'.');
  if(event.actor!=='player')return clean;
  return clean.replace(/^Player gains /,'You gain ')
    .replace(/^Player loses /,'You lose ')
    .replace(/^Player takes /,'You take ');
}
export function combatEventNumbers(event:CombatEventView):string|undefined{
  return event.story?.hidden?undefined:event.story?.detail;
}
/** Failed effects are facts too, but must never be shown as applied effects. */
export function combatEventFailedEffects(event:CombatEventView):string[]{
  return (event.narration?.effects||[])
    .filter(effect=>effect.applied===false)
    .map(effect=>(effect.label?.trim()||effect.kind||'Effect')+' did not apply.');
}

export function groupCombatRounds(events:readonly CombatEventView[]):CombatChronicleRound[]{
 const result:CombatChronicleRound[]=[];
 for(const event of events){
   let current=result.at(-1);
   if(!current||current.round!==event.round){
     current={round:event.round,key:String(event.round)+'-'+result.length,
       main:'',tactical:[],events:[],isLegacy:true};
     result.push(current);
   }
   current.events.push(event);
   if(event.roundStory?.version===3){
     current.main=event.roundStory.line;
     current.detail=event.roundStory.detail;
     current.tactical=event.roundStory.tactical;
     current.roundStory=event.roundStory;
     current.isLegacy=false;
   }
 }
 for(const round of result){
   if(round.roundStory)continue;
   // Existing v1/v2 and unversioned logs are shown EXACTLY as saved.
   // Legacy concatenation is a compatibility display, never new narration.
   round.main=round.events.filter(e=>!e.story?.hidden)
     .map(e=>e.story?.line??e.text).join(' ');
   if(!round.main)round.main='Earlier combat record.';
   round.detail=undefined;
 }
 return result;
}
