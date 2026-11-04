/** Millhand Stage 7 clinic. Pure, owner-approved state transitions only.
 * No timed illness progression, fabricated wound, or ordinary healing system.
 * Payment and the tutorial-discharge reset are committed by the API.
 */
import {newEncounter} from '@the-pall/game-core/combat-v0.5.1';
import type {CombatState} from '@the-pall/game-core/combat-v0.5.1';

export const CLINIC_FEE=10 as const;
export type ClinicPhase='ARRIVAL'|'EXAMINED'|'SPOKEN'|'PRICED'|'PAID'|'LEFT';
export type ClinicAction='examine'|'speak'|'review_price'|'pay'|'leave';
export type ClinicCondition={
  hp:number;hpMax:number;stamina:number;composure:number;fatigue:number;
  stress:number;momentum:number;bleed:number;
  wounds:CombatState['player']['wounds'];
};
export type ClinicState={
  revision:number;phase:ClinicPhase;outcome:'player_victory'|'player_defeat';
  before:ClinicCondition;after:ClinicCondition|null;
  paid:boolean;fee:number;
};
export class ClinicInvalidAction extends Error {}
export function conditionFromCombat(combat:CombatState):ClinicCondition{
  const p=combat.player;
  return {
    hp:p.hp,hpMax:p.hpMax,stamina:p.stamina,composure:p.composure,
    fatigue:p.fatigue,stress:p.stress,momentum:p.momentum,bleed:p.bleed,
    wounds:structuredClone(p.wounds)
  };
}
export function classifyCondition(c:ClinicCondition):'unhurt'|'cut'|'other'{
  if(c.hp===c.hpMax&&c.wounds.length===0&&c.bleed===0)return 'unhurt';
  // Dress only a genuinely recorded cut; not an impact wound, low Health
  // alone or an unknown injury type.
  if(c.wounds.some(w=>w.type==='cut'))return 'cut';
  return 'other';
}
export function initialClinic(combat:CombatState):ClinicState{
  if(combat.status!=='finished'||
    (combat.outcome!=='player_victory'&&combat.outcome!=='player_defeat'))
    throw new ClinicInvalidAction('combat_not_finished');
  return {
    revision:0,phase:'ARRIVAL',outcome:combat.outcome,
    before:conditionFromCombat(combat),
    after:null,paid:false,fee:CLINIC_FEE
  };
}
export function defaultTutorialDischarge(before:ClinicCondition):ClinicCondition{
  // Use the v0.5.1 starting actor defaults as the temporary tutorial
  // condition baseline, not arbitrary reserves or a fake medical diagnosis.
  const base=newEncounter('flint',{seed:0}).player;
  return {
    hp:before.hpMax,hpMax:before.hpMax,
    stamina:base.stamina,composure:base.composure,
    fatigue:base.fatigue,stress:base.stress,momentum:base.momentum,
    bleed:base.bleed,wounds:[]
  };
}
const allowed:Record<ClinicPhase,ClinicAction|null>={
  ARRIVAL:'examine',EXAMINED:'speak',SPOKEN:'review_price',
  PRICED:'pay',PAID:'leave',LEFT:null
};
export function advanceClinic(current:ClinicState,action:ClinicAction):ClinicState{
  if(allowed[current.phase]!==action)throw new ClinicInvalidAction('wrong_clinic_phase');
  const phase:Record<ClinicAction,ClinicPhase>={
    examine:'EXAMINED',speak:'SPOKEN',review_price:'PRICED',
    pay:'PAID',leave:'LEFT'
  };
  return {
    ...current,phase:phase[action],revision:current.revision+1,
    paid:current.paid||action==='pay',
    after:action==='pay'?defaultTutorialDischarge(current.before):current.after
  };
}
export function clinicView(state:ClinicState,coins:number){
  return {
    stage:7,revision:state.revision,phase:state.phase,
    outcome:state.outcome,before:state.before,after:state.after,
    conditionType:classifyCondition(state.before),
    fee:state.fee,coins,paid:state.paid,
    completed:state.phase==='LEFT',
    nextStage:state.phase==='LEFT'?8:null
  };
}
