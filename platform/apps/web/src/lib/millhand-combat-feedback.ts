import type {CombatSnapshot,CombatEventView} from './millhand-combat-model';

/** Short, cosmetic reaction to newly persisted combat events. */
export type CombatFloatingFeedback={
  id:string;
  target:'player'|'enemy';
  kind:'hit'|'miss';
  label:string;
};

/** Returns only events appended in a successful turn, even if the Chronicle
 * is rolling over its server-side history limit. Unknown history is ignored
 * rather than risking replay of old impacts on refresh or stale requests. */
export function newSavedCombatEvents(
  previous:Pick<CombatSnapshot,'events'|'revision'>,
  next:Pick<CombatSnapshot,'events'|'revision'>
):CombatEventView[] {
  if(next.revision!==previous.revision+1)return [];
  const before=previous.events;
  const after=next.events;
  if(before.length===0)return after;
  const maxOverlap=Math.min(before.length,after.length);
  for(let length=maxOverlap;length>0;length--){
    const start=before.length-length;
    const matches=before.slice(start).every((event,index)=>
      JSON.stringify(event)===JSON.stringify(after[index])
    );
    if(matches)return after.slice(length);
  }
  return [];
}

/** Hit damage is the actual damage from the server event, not a calculation
 * in the browser. A miss floats over the *target*, not the attacker. */
export function floatingFeedbackForSavedTurn(
  previous:CombatSnapshot,next:CombatSnapshot
):CombatFloatingFeedback[]{
  const events=newSavedCombatEvents(previous,next);
  const latest=new Map<'player'|'enemy',CombatFloatingFeedback>();
  for(const [index,event] of events.entries()){
    let target:'player'|'enemy'|undefined;
    let kind:'hit'|'miss';
    let label:string;
    if(event.kind==='damage' && (event.target==='player'||event.target==='enemy') &&
       typeof event.damage==='number' && Number.isFinite(event.damage) && event.damage>0){
      target=event.target;kind='hit';label='−'+String(event.damage);
    }else if(event.kind==='miss' && (event.actor==='player'||event.actor==='enemy')){
      target=event.actor==='player'?'enemy':'player';
      kind='miss';label='Miss';
    }else continue;
    latest.set(target,{
      id:String(next.revision)+':'+String(index)+':'+target,
      target,kind,label
    });
  }
  return [...latest.values()];
}
