/** Browser-only shape of the authoritative Stage 6 response. */
export type CombatActorView={
  name:string;hp:number;hpMax:number;ceiling:number;stamina:number;
  composure:number;fatigue:number;stress:number;momentum:number;bleed:number;
  wounds:Array<{type:string;zone?:string;severity:string}>;
  armHits?:number;armImpaired?:boolean;
};
export type CombatEventView={
  round:number;
  text:string;
  kind:string;
  actor?:'player'|'enemy';
  target?:'player'|'enemy';
  damage?:number;
  zone?:'head'|'torso'|'limbs';
  ability?:string|null;
  actionType?:'attack'|'guard'|'move'|'recover'|'technique';
  actionDetail?:string;
  actionName?:string;
};
export type CombatSnapshot={
  status:'active'|'finished';outcome:string|null;stance:'brace'|'moving'|'cart';
  round:number;revision:number;distance:string;enemyIntent:string|null;intentType:string|null;
  player:CombatActorView;enemy:CombatActorView;legalActions:string[];
  events:CombatEventView[];turnEvents:CombatEventView[];
  rules:{
    strikeCost:number;guardCost:number;moveCost:number;recoverStamina:number;
    recoverComposure:number;techniqueMomentum:number;repeatedStrikeSurcharge:number;
    accuracy:{head:number;torso:number;limbs:number};guardMitigationPercent:string;guardReductionMinPercent:number;guardReductionMaxPercent:number;prototype:boolean;
    unarmed:boolean;weaponLabel:string;
    strikeDamage:{min:number;max:number};
    techniqueDamage:{min:number;max:number};
    strikeByZone:Record<'torso'|'limbs'|'head',{min:number;max:number}>;
    techniqueByZone:Record<'torso'|'limbs'|'head',{min:number;max:number}>;
    dodgeChance:{side:number;cover:number;back:number;close:number};
    openingDamageBonus:number;openingReason:string|null;
    enemyStrikeDamage:{min:number;max:number};
    guardedEnemyStrikeDamage:{min:number;max:number};
    repositionUsesDistance:boolean
  };
};

/** The v0.5.1 combat recovery action caps Stamina at 100.
 * This also provides a consistent visual reference for the three resource bars.
 * Fatigue can exceed this scale; its numeric value is never clamped.
 */
export const COMBAT_RESOURCE_SCALE=100;
