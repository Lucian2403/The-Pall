/** Shared rented-home finale and the initial Free Play rent payment. No recurring rent or eviction. */
export const HOME_ID='starter-rented-room';
export const RENT=150;
export const CLOSING_SPEECH="Ah, hell. Need a place of my own. First I've got this rent to pay. More jobs... or I could make something to sell.";
// JOURNEY and DOOR exist only to read already-persisted pre-refinement saves.
export type Phase='JOURNEY'|'DOOR'|'HOME'|'NOTICE'|'SPEECH'|'COMPLETE';
export type Action='read_notice'|'put_down'|'finish'|'rest';
export type HomeCondition={
  stamina:number;composure:number;fatigue:number;stress:number
};
// Stage 7 currently discharges with 90/80 stamina/composure; a legacy
// Stage 8 save may predate this optional condition snapshot.
export const DEFAULT_HOME_CONDITION:HomeCondition={
  stamina:90,composure:80,fatigue:0,stress:0
};
const safeResource=(value:unknown,fallback:number)=>
  typeof value==='number'&&Number.isFinite(value)
    ?Math.max(0,Math.min(100,value)):fallback;
export function homeCondition(from?:Partial<HomeCondition>|null):HomeCondition{
  return {
    stamina:safeResource(from?.stamina,DEFAULT_HOME_CONDITION.stamina),
    composure:safeResource(from?.composure,DEFAULT_HOME_CONDITION.composure),
    fatigue:safeResource(from?.fatigue,DEFAULT_HOME_CONDITION.fatigue),
    stress:safeResource(from?.stress,DEFAULT_HOME_CONDITION.stress)
  };
}
export type MillhandBranch='restamp'|'contracts'|'records';
export type BellrunnerBranch='contracts'|'trauma'|'machinery';
import type {StitcherBranch} from './stitcher-work.js';
export type Branch=MillhandBranch|BellrunnerBranch|StitcherBranch;
export type Outcome='player_victory'|'player_defeat';
export type State={revision:number;phase:Phase;homeId:string;origin:string;
  branch:Branch;outcome:Outcome;condition?:HomeCondition};
export class HomeInvalidAction extends Error {}
export const initial=(origin:string,branch:Branch,outcome:Outcome,
  condition?:Partial<HomeCondition>|null):State=>({
  revision:0,phase:'HOME',homeId:HOME_ID,origin,branch,outcome,
  condition:homeCondition(condition)
});
const actions:Record<Phase,Action|null>={
  JOURNEY:'read_notice',DOOR:'read_notice',HOME:'read_notice',
  NOTICE:'put_down',SPEECH:'finish',COMPLETE:null
};
const next:Record<Exclude<Action,'rest'>,Phase>={
  read_notice:'NOTICE',put_down:'SPEECH',finish:'COMPLETE'
};
export function advance(s:State,action:Action):State{
  if(action==='rest'){
    // Bed rest is a saved home interaction, usable even after onboarding.
    // It restores no Health, never changes wounds, coins, skill points or
    // the completed combat and clinic records.
    return {...s,revision:s.revision+1,condition:{
      stamina:100,composure:100,fatigue:0,stress:0
    }};
  }
  if(actions[s.phase]!==action)throw new HomeInvalidAction('wrong_home_phase');
  return {...s,revision:s.revision+1,phase:next[action]};
}
/** Payment is only available after the first notice and closing speech are complete. */
export function payStarterRent(s:State,coins:number,paidAt:string|null){
  if(s.phase!=='COMPLETE')throw new HomeInvalidAction('rent_not_ready');
  if(paidAt!==null)throw new HomeInvalidAction('rent_already_paid');
  if(!Number.isFinite(coins)||coins<RENT)throw new HomeInvalidAction('insufficient_coins');
  return {state:{...s,revision:s.revision+1},coins:coins-RENT};
}
export function view(s:State,name:string,coins:number,paidAt:string|null=null){
  // Older Stage 8 snapshots may still be on the removed city/door steps.
  // Show them directly inside the room, without rewriting a GET request.
  const phase=s.phase==='JOURNEY'||s.phase==='DOOR'?'HOME':s.phase;
  return {stage:8,revision:s.revision,phase,
    homeId:s.homeId,origin:s.origin,branch:s.branch,outcome:s.outcome,
    characterName:name,coins,rent:RENT,rentPaid:paidAt!==null,rentPaidAt:paidAt,
    rentDue:paidAt!==null?0:RENT,shortfall:paidAt!==null?0:Math.max(0,RENT-coins),
    condition:homeCondition(s.condition),
    noticeTitle:paidAt!==null&&s.phase==='COMPLETE'?'RENT PAID':'FINAL NOTICE',
    noticeText:paidAt!==null&&s.phase==='COMPLETE'?'The rent has been paid in full.':name+', you have to pay '+RENT+' coins in rent, or you are out. No discussion.',
    closingSpeech:CLOSING_SPEECH,completed:s.phase==='COMPLETE'};
}
