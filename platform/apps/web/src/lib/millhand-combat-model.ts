/** Browser-only shape of the authoritative Stage 6 response. */
export type CombatActorView={
  name:string;hp:number;hpMax:number;ceiling:number;stamina:number;
  composure:number;fatigue:number;stress:number;momentum:number;bleed:number;
  wounds:Array<{type:string;zone?:string;severity:string}>;
};
export type CombatEventView={
  round:number;
  text:string;
  kind:string;
  actor?:'player'|'enemy';
  target?:'player'|'enemy';
  damage?:number;
};
export type CombatSnapshot={
  status:'active'|'finished';outcome:string|null;stance:'brace'|'moving'|'cart';
  round:number;revision:number;distance:string;enemyIntent:string|null;intentType:string|null;
  player:CombatActorView;enemy:CombatActorView;legalActions:string[];
  events:CombatEventView[];turnEvents:CombatEventView[];
  rules:{
    strikeCost:number;guardCost:number;moveCost:number;recoverStamina:number;
    recoverComposure:number;techniqueMomentum:number;repeatedStrikeSurcharge:number;
    accuracy:{head:number;torso:number;limbs:number};guardMitigationPercent:number;prototype:boolean
  };
};

/** The v0.5.1 combat recovery action caps Stamina at 100.
 * This also provides a consistent visual reference for the three resource bars.
 * Fatigue can exceed this scale; its numeric value is never clamped.
 */
export const COMBAT_RESOURCE_SCALE=100;
