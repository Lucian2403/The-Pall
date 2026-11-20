/** Stage V witnessed refusal -> shared Stage VI Owler combat.
 * This only establishes the saved physical doorway arrangement. Every later
 * attack, Guard, dodge, wound and outcome uses the v0.5.1 engine.
 */
import {newEncounter} from '@the-pall/game-core/combat-v0.5.1';
import type {CombatState} from '@the-pall/game-core/combat-v0.5.1';
export type OwlerPreparation='reason'|'cart'|'brace';
type StartingHealth={current_health:number;max_health:number};
export function initializeOwlerCombat(
  characterId:string,character:StartingHealth,preparation:OwlerPreparation,seed:number
):CombatState{
  if(!Number.isSafeInteger(character.current_health)||character.current_health<=0||
     !Number.isSafeInteger(character.max_health)||character.max_health<=0||
     character.current_health>character.max_health)throw Error('invalid_initial_health');
  const s=newEncounter('owler',{
    id:'owler-'+characterId,seed,
    player:{hp:character.current_health,hpMax:character.max_health,
      ceiling:character.max_health}
  });
  if(preparation==='brace'){
    // Same existing readiness effect as Flint's brace, not free Guard.
    s.player.readiness+=2;
  }else if(preparation==='cart'){
    // The empty ward cart is a real obstacle, NOT the patient's trolley.
    // Owler must spend a legal Move to close before he can strike.
    s.distance='far';s.side=true;
    s.intent={type:'move',to:'close',speed:5,signal:'repositioning',
      tell:'Owler looks for a way round the empty ward cart.'};
  }else if(preparation!=='reason')throw Error('invalid_owler_preparation');
  // Reasoning creates no barrier or secret defensive bonus: contact range.
  return s;
}
