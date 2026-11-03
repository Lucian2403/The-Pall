/**
 * Stage 5 stance -> Stage 6 opening state.
 *
 * All subsequent turns are resolved by the unchanged v0.5.1 combat engine.
 * Its factory creates a contact-range Flint intent; for the cart start,
 * that would be an impossible club attack from across the obstruction.
 * Stage only that initial AI decision to a legal existing engine Move.
 *
 * No damage bonus, cover-mitigation formula, scripted miss, automatic
 * victory or custom combat action is introduced.
 */
import {newEncounter} from '@the-pall/game-core/combat-v0.5.1';
import type {CombatState} from '@the-pall/game-core/combat-v0.5.1';
import type {StageSixStance} from './millhand-combat-view.js';

type StartingHealth={current_health:number;max_health:number};

export function initializeFlintCombat(
  characterId:string,character:StartingHealth,stance:StageSixStance,seed:number
):CombatState {
  if(!Number.isSafeInteger(character.current_health)||
     character.current_health<=0||
     !Number.isSafeInteger(character.max_health)||
     character.max_health<=0||
     character.current_health>character.max_health)
    throw new Error('invalid_initial_health');

  const state=newEncounter('flint',{
    id:'flint-'+characterId,
    seed,
    player:{
      hp:character.current_health,
      hpMax:character.max_health,
      ceiling:character.max_health
    }
  });

  if(stance==='brace'){
    // Existing readiness statistic and original contact-range Flint AI.
    state.player.readiness+=2;
  }else if(stance==='moving'){
    // Flint's committed club strike can reach the player only if the
    // player chooses to close distance before it resolves.
    state.distance='near';
    state.side=true;
  }else if(stance==='cart'){
    state.distance='far';
    state.side=true;
    // The cart physically separates the combatants. Commit Flint to the
    // original engine's Move behavior rather than an out-of-range strike.
    // The original engine generates all later intents normally.
    state.intent={
      type:'move',to:'close',speed:5,signal:'repositioning',
      tell:'Flint looks for a way round the obstruction.'
    };
  }else{
    throw new Error('invalid_stage_six_stance');
  }
  return state;
}
