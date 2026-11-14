/** Saved Stage V stance -> native v0.5.1 Dogman battle opening.
 * The work cart blocks movement; there are no scripted dodge rolls,
 * extra weapons, forced damage, hidden buffs or origin-only actions.
 */
import {newEncounter} from '@the-pall/game-core/combat-v0.5.1';
import type {CombatState} from '@the-pall/game-core/combat-v0.5.1';
export type DogmanStance='street'|'cart'|'defend';
type StartingHealth={current_health:number;max_health:number};
export function initializeDogmanCombat(
  characterId:string,character:StartingHealth,stance:DogmanStance,seed:number
):CombatState{
  if(!Number.isSafeInteger(character.current_health)||character.current_health<=0||
    !Number.isSafeInteger(character.max_health)||character.max_health<=0||
    character.current_health>character.max_health)throw Error('invalid_initial_health');
  const s=newEncounter('dogman',{
    id:'dogman-'+characterId,seed,
    player:{hp:character.current_health,hpMax:character.max_health,
      ceiling:character.max_health}
  });
  if(stance==='defend'){
    // Normal readiness statistic, not invulnerability or free Guard.
    s.player.readiness+=2;
  }else if(stance==='street'){
    // One interval of space between courier and Dogman.
    s.distance='near';s.side=true;
  }else if(stance==='cart'){
    s.distance='far';s.side=true;
    // Stage V establishes the wooden cart as a real obstacle. An attack
    // against a far target would be illegal, so the opponent moves around it.
    s.intent={
      type:'move',to:'close',speed:5,signal:'repositioning',
      tell:'Dogman looks for a way round the work cart.'
    };
  }else throw Error('invalid_dogman_stance');
  return s;
}
