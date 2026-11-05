import type {CombatEventView} from './millhand-combat-model';

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
      ['damage','miss','guard','move','technique','recovery'].includes(event.kind));
}
