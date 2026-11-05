/** Types for the Stage 6 owner-tuned v0.5.1 combat prototype. Values remain trial balance. */
export type CombatOutcome = 'player_victory' | 'player_defeat' | 'player_escaped' | null;
export type CombatZone = 'head' | 'torso' | 'limbs';
export type CombatAction =
  | {type:'attack'|'technique';zone:CombatZone}
  | {type:'guard'}
  | {type:'move';to:'side'|'close'|'cover'|'back'}
  | {type:'recover';mode:'breath'|'nerves'}
  | {type:'use';item:'bandage'}
  | {type:'withdraw'};
export type CombatEvent = {
  round:number; text:string; kind:string; actor?:'player'|'enemy';
  target?:'player'|'enemy';zone?:CombatZone; damage?:number;raw?:number;
  guarded?:boolean;reason?:string;amount?:number;ability?:string|null;
  [extra:string]:unknown;
};
export type CombatActor = {
  name:string; hp:number;hpMax:number;ceiling:number;stamina:number;
  composure:number;fatigue:number;stress:number;momentum:number;
  wounds:Array<{type:string;zone?:CombatZone;severity:string;[key:string]:unknown}>;
  bleed:number;bandages:number;guard:boolean;readiness:number;
  armHits?:number;armImpaired?:boolean;
  weapon:{damage:number;accuracy:number;type:string;reach:string;
    minDamage?:number;maxDamage?:number;guardMitigation?:number;unarmed?:boolean};
};
export type CombatState = {
  id:string;scene:'flint'|'boar'|'silas';round:number;revision:number;rng:number;
  status:'active'|'finished';outcome:CombatOutcome;distance:'contact'|'near'|'far';
  side:boolean;approach:string|null;player:CombatActor;enemy:CombatActor;
  intent:({type:string;speed:number;signal:string;tell:string;[key:string]:unknown})|null;
  openings:Record<string,({expires:number;reason:string;accuracyBonus?:number;damageBonus?:number})|null>;
  events:CombatEvent[];receipts:string[];
  lastPlayerActions:string[];lastEnemyActions:string[];
  [extra:string]:unknown;
};
export declare function isUnarmedWeapon(weapon:CombatActor['weapon']):boolean;
export declare const TEST_CONFIG:Readonly<{
  strikeCost:number;repeatedStrikeSurcharge:number;guardCost:number;moveCost:number;
  recoverGain:number;mentalRecoverGain:number;aim:Record<CombatZone,number>;
  strikeMomentum:number;guardMomentum:number;moveMomentum:number;
  dodgeChance:Readonly<{side:number;cover:number;back:number;close:number}>;
  unarmedDamage:Readonly<Record<CombatZone,readonly [number,number]>>;
  unarmedTechnique:Readonly<Record<CombatZone,readonly [number,number]>>;
}>;
export declare class CombatError extends Error {}
export declare function newEncounter(scene:'flint'|'boar'|'silas',opts?:{
  id?:string;seed?:number;approach?:string;
  player?:Partial<CombatActor>;enemy?:Partial<CombatActor>;
}):CombatState;
export declare function step(input:CombatState,chosen:CombatAction,options:{requestId:string;expectedRevision:number}):CombatState;
export declare function testAttackCost(input:CombatState,who?:'player'|'enemy'):number;
