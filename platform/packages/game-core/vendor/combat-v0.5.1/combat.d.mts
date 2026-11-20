/** Types for the Stage 6 owner-tuned v0.5.1 combat prototype. Values remain trial balance. */
export type CombatOutcome = 'player_victory' | 'player_defeat' | 'player_escaped' | null;
export type CombatZone = 'head' | 'torso' | 'limbs';
export type HitPartPreposition='in'|'on'|'across';
export type AnatomyPart=string|{name:string;preposition?:HitPartPreposition};
export type AnatomyProfile={
  kind:string;
  zones:Partial<Record<CombatZone,readonly AnatomyPart[]>>;
};
export type SelectedHitLocation={name:string;preposition:HitPartPreposition};
export declare const HUMAN_HIT_LOCATIONS:Readonly<Record<CombatZone,readonly string[]>>;
export declare const HUMAN_ANATOMY:Readonly<AnatomyProfile>;
export declare const BOAR_ANATOMY:Readonly<AnatomyProfile>;
export declare function hitLocationPhrase(part?:string|null,preposition?:HitPartPreposition):string;
export declare function selectHitLocation(state:CombatState,
  target:'player'|'enemy',zone:CombatZone,eventIdentity?:string):SelectedHitLocation|null;
export type CombatAction =
  | {type:'attack'|'technique';zone:CombatZone}
  | {type:'guard'|'focus'}
  | {type:'move';to:'side'|'close'|'cover'|'back'}
  | {type:'recover';mode:'breath'|'nerves'}
  | {type:'use';item:'bandage'}
  | {type:'withdraw'};
export type CombatEvent = {
  round:number; text:string; kind:string; actor?:'player'|'enemy';
  target?:'player'|'enemy';zone?:CombatZone;hitPart?:string;
  hitPartPreposition?:HitPartPreposition;damage?:number;raw?:number;
  guarded?:boolean;reason?:string;amount?:number;ability?:string|null;
  [extra:string]:unknown;
};
export type CombatActor = {
  name:string; hp:number;hpMax:number;ceiling:number;stamina:number;
  composure:number;fatigue:number;stress:number;momentum:number;
  focusedUntilRound?:number;
  wounds:Array<{type:string;zone?:CombatZone;severity:string;[key:string]:unknown}>;
  bleed:number;bandages:number;guard:boolean;readiness:number;
  /** Optional anatomy. Null/absent means no assumed human hit location. */
  anatomy?:AnatomyProfile|null;
  armHits?:number;armImpaired?:boolean;reloadSlowdownPercent?:number;
  weapon:{damage:number;accuracy:number;type:string;reach:string;
    minDamage?:number;maxDamage?:number;guardMitigation?:number;unarmed?:boolean;
    /** Display-only equipment name. Combat resolution never reads this field. */
    label?:string};
};
export type CombatState = {
  id:string;scene:'flint'|'boar'|'silas'|'dogman'|'owler';round:number;revision:number;rng:number;
  status:'active'|'finished';outcome:CombatOutcome;distance:'contact'|'near'|'far';
  side:boolean;approach:string|null;player:CombatActor;enemy:CombatActor;
  locationSeed?:string|number;
  hitLocationRecent?:Array<{target:'player'|'enemy';zone:CombatZone;name:string}>;
  intent:({type:string;speed:number;signal:string;tell:string;[key:string]:unknown})|null;
  openings:Record<string,({expires:number;reason:string;accuracyBonus?:number;damageBonus?:number})|null>;
  events:CombatEvent[];receipts:string[];
  lastPlayerActions:string[];lastEnemyActions:string[];
  [extra:string]:unknown;
};
export declare function isUnarmedWeapon(weapon:CombatActor['weapon']):boolean;
export declare function canActAtFatigue(actor:Pick<CombatActor,'fatigue'>,actionType?:string):boolean;
export declare function fatigueAccuracyPenalty(actor:Pick<CombatActor,'fatigue'>):number;
export declare function focusedStanceTurns(input:CombatState,who?:'player'|'enemy'):number;
export declare const TEST_CONFIG:Readonly<{
  strikeCost:number;repeatedStrikeSurcharge:number;guardCost:number;moveCost:number;
  recoverGain:number;exhaustedRecoverGain:number;
  mentalRecoverGain:number;lowReserve:number;
  fatigueLowGain:number;fatigueExhaustedDefenseGain:number;fatigueExhaustedAttackGain:number;
  fatigueRecovery:number;exhaustedFatigueRecovery:number;
  highFatigueRecoverThreshold:number;fatigueCap:number;fatigueAttackLock:number;
  fatigueAccuracyStep:number;fatigueAccuracyPenaltyPerStep:number;
  focusedStanceComposureCost:number;focusedStanceAccuracyBonus:number;focusedStanceDuration:number;
  aim:Record<CombatZone,number>;
  strikeMomentum:number;guardMomentum:number;moveMomentum:number;
  guardReduction:Readonly<{min:number;max:number}>;
  dodgeChance:Readonly<{side:number;cover:number;back:number;close:number}>;
  unarmedDamage:Readonly<Record<CombatZone,readonly [number,number]>>;
  unarmedTechnique:Readonly<Record<CombatZone,readonly [number,number]>>;
}>;
export declare class CombatError extends Error {}
export declare function newEncounter(scene:'flint'|'boar'|'silas'|'dogman'|'owler',opts?:{
  id?:string;seed?:number;approach?:string;locationSeed?:string|number;
  player?:Partial<CombatActor>;enemy?:Partial<CombatActor>;
}):CombatState;
export declare function step(input:CombatState,chosen:CombatAction,options:{requestId:string;expectedRevision:number}):CombatState;
export declare function testAttackCost(input:CombatState,who?:'player'|'enemy'):number;
