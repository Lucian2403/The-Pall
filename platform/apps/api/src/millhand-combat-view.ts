/** Public projection of the preserved v0.5.1 engine. No private enemy action is exposed. */
import {TEST_CONFIG,testAttackCost,isUnarmedWeapon} from '@the-pall/game-core/combat-v0.5.1';
import type {CombatState,CombatEvent} from '@the-pall/game-core/combat-v0.5.1';

export type StageSixStance='brace'|'moving'|'cart';

export function combatView(state:CombatState,history:CombatEvent[],stance:StageSixStance){
  const visibleActor=(a:CombatState['player'])=>({
    name:a.name,hp:a.hp,hpMax:a.hpMax,ceiling:a.ceiling,
    stamina:a.stamina,composure:a.composure,fatigue:a.fatigue,
    stress:a.stress,momentum:a.momentum,bleed:a.bleed,wounds:a.wounds,
    bandages:a.bandages,armHits:a.armHits??0,armImpaired:a.armImpaired??false
  });
  const contact=state.distance==='contact';
  const legalActions=state.status==='active'
    ? [...(contact?['attack']:[]),'guard','move','recover',
        ...(contact&&state.player.momentum>=20?['technique']:[])]
    : [];
  // The action panel mirrors the existing prototype formulas, including the
  // equipped weapon's actual profile. In Stage 6 the player fights barehanded.
  const range=(weapon:CombatState['player']['weapon'])=>({
    min:Math.max(1,weapon.minDamage??Math.floor(weapon.damage*.72)),
    max:Math.max(1,weapon.minDamage??Math.floor(weapon.damage*.72),
      weapon.maxDamage??Math.ceil(weapon.damage*1.3))
  });
  const unarmed=isUnarmedWeapon(state.player.weapon);
  const unarmedDamage=range(state.player.weapon);
  const zoneRanges=(special:boolean)=>Object.fromEntries(
    (['torso','limbs','head'] as const).map(zone=>{
      const profile=unarmed
        ?(special?TEST_CONFIG.unarmedTechnique:TEST_CONFIG.unarmedDamage)[zone]
        :null;
      return [zone,profile?{min:profile[0],max:profile[1]}:
        {min:unarmedDamage.min+(special?4:0),max:unarmedDamage.max+(special?4:0)}];
    })
  ) as Record<'torso'|'limbs'|'head',{min:number;max:number}>;
  const clubDamage=range(state.enemy.weapon);
  const mitigation=state.enemy.weapon.guardMitigation??.5;
  const opportunity=state.openings.player;
  const opening=opportunity&&opportunity.expires>=state.round?opportunity:null;
  const accuracy=(zone:'head'|'torso'|'limbs')=>Math.round(100*Math.min(.95,Math.max(.05,
    state.player.weapon.accuracy+TEST_CONFIG.aim[zone]+(opening?.accuracyBonus??0)-
      (state.player.armImpaired?.10:0)
  )));
  return {
    stage:6,stance,status:state.status,outcome:state.outcome,
    revision:state.revision,round:state.round,distance:state.distance,
    enemyIntent:state.intent?.tell??null,intentType:state.intent?.signal??null,
    player:visibleActor(state.player),enemy:visibleActor(state.enemy),
    legalActions,
    // Historical Chronicle is capped for the UI. The engine separately
    // retains the exact events of its most recently resolved turn.
    // Never reconstruct one turn's feedback by diffing a rolling history.
    events:history.slice(-120),
    turnEvents:state.events,
    rules:{
      strikeCost:testAttackCost(state,'player'),guardCost:TEST_CONFIG.guardCost,
      moveCost:TEST_CONFIG.moveCost,recoverStamina:TEST_CONFIG.recoverGain,
      recoverComposure:TEST_CONFIG.mentalRecoverGain,techniqueMomentum:20,
      accuracy:{head:accuracy('head'),torso:accuracy('torso'),limbs:accuracy('limbs')},
      repeatedStrikeSurcharge:TEST_CONFIG.repeatedStrikeSurcharge,
      guardMitigationPercent:Math.round(100*mitigation),
      unarmed,weaponLabel:unarmed?'Unarmed — fists':'Equipped weapon',
      strikeDamage:zoneRanges(false).torso,
      techniqueDamage:zoneRanges(true).torso,
      strikeByZone:zoneRanges(false),techniqueByZone:zoneRanges(true),
      openingDamageBonus:opening?(opening.damageBonus??5):0,
      openingReason:opening?.reason??null,
      enemyStrikeDamage:clubDamage,
      guardedEnemyStrikeDamage:{
        min:Math.round(clubDamage.min*(1-mitigation)),
        max:Math.round(clubDamage.max*(1-mitigation))
      },
      dodgeChance:{side:Math.round(100*TEST_CONFIG.dodgeChance.side),
        cover:Math.round(100*TEST_CONFIG.dodgeChance.cover),
        back:Math.round(100*TEST_CONFIG.dodgeChance.back),close:0},
      repositionUsesDistance:true,
      prototype:true
    },
    // State is saved on every authenticated command; no monetary/XP changes.
    tutorialPayout:{coins:0,ordinaryXp:0,armsXp:0,items:0}
  };
}

export type CombatSnapshot=ReturnType<typeof combatView>;
