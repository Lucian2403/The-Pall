/** Browser-only shape of the authoritative Stage 6 response. */
export type CombatActorView={
  name:string;hp:number;hpMax:number;ceiling:number;stamina:number;
  composure:number;fatigue:number;stress:number;momentum:number;bleed:number;
  wounds:Array<{type:string;zone?:string;severity:string}>;
};
export type CombatEventView={round:number;text:string;kind:string};
export type CombatSnapshot={
  status:'active'|'finished';outcome:string|null;stance:'brace'|'moving'|'cart';
  round:number;revision:number;distance:string;enemyIntent:string|null;intentType:string|null;
  player:CombatActorView;enemy:CombatActorView;legalActions:string[];events:CombatEventView[];
  rules:{
    strikeCost:number;guardCost:number;moveCost:number;recoverStamina:number;
    recoverComposure:number;techniqueMomentum:number;repeatedStrikeSurcharge:number;
    accuracy:{head:number;torso:number;limbs:number};guardMitigationPercent:number;prototype:boolean
  };
};
