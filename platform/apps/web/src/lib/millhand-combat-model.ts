/** Browser-only shape of the authoritative Stage 6 response. */
export type CombatActorView={
  name:string;hp:number;hpMax:number;ceiling:number;stamina:number;
  composure:number;fatigue:number;stress:number;momentum:number;bleed:number;
  focusedTurnsRemaining?:number;
  wounds:Array<{type:string;zone?:string;severity:string}>;
  armHits?:number;armImpaired?:boolean;reloadSlowdownPercent?:number;
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
  actionType?:'attack'|'guard'|'move'|'recover'|'technique'|'focus';
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
    recoverStaminaBelow50:number;recoverStaminaFrom50:number;
    recoverComposure:number;techniqueMomentum:number;repeatedStrikeSurcharge:number;
    focus?:{cost:number;accuracyBonusPercent:number;duration:number;remaining:number};
    fatigue:{
      cap:number;lowStaminaThreshold:number;lowStaminaGain:number;
      exhaustedAttackGain:number;exhaustedDefenseGain:number;
      recovery:number;recoveryBelow50:number;recoveryFrom50:number;
      recoveryThreshold:number;limitedAt:number;recoverOnlyAt:number;
      accuracyLossPerTen:number;currentAccuracyLoss:number;
    };
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

/** The current combat rules cap Stamina, Fatigue and Composure at 100.
 * Their resource bars and numeric labels share this reference scale.
 */
export const COMBAT_RESOURCE_SCALE=100;
