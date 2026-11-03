import type {CombatSnapshot,CombatEventView} from './millhand-combat-model';

/** Short, cosmetic reaction to newly persisted combat events. */
export type CombatFloatingFeedback={
  id:string;
  target:'player'|'enemy';
  kind:'hit'|'miss';
  label:string;
};

/** Only a newly committed turn may produce floating text.
 *
 * The authoritative engine clears state.events before each resolution and
 * fills it with that turn's events. combatView forwards those verbatim in
 * turnEvents. Unlike the rolling 120-line Chronicle, this always identifies
 * the turn correctly and does not depend on historical array overlaps.
 */
export function newSavedCombatEvents(
  previous:Pick<CombatSnapshot,'revision'|'round'>,
  next:Pick<CombatSnapshot,'revision'|'turnEvents'>
):CombatEventView[] {
  if(next.revision!==previous.revision+1)return [];
  return next.turnEvents.filter(event=>event.round===previous.round);
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
