/** Shared rented-home onboarding finale. No payment, eviction or gameplay release. */
export const HOME_ID='starter-rented-room';
export const RENT=150;
export const CLOSING_SPEECH="Ah, hell. Need a place of my own. First I've got this rent to pay. More jobs... or I could make something to sell.";
export type Phase='JOURNEY'|'DOOR'|'HOME'|'NOTICE'|'SPEECH'|'COMPLETE';
export type Action='travel'|'enter'|'read_notice'|'put_down'|'finish';
export type Branch='restamp'|'contracts'|'records';
export type Outcome='player_victory'|'player_defeat';
export type State={revision:number;phase:Phase;homeId:string;origin:string;branch:Branch;outcome:Outcome};
export class HomeInvalidAction extends Error {}
export const initial=(origin:string,branch:Branch,outcome:Outcome):State=>({
  revision:0,phase:'JOURNEY',homeId:HOME_ID,origin,branch,outcome
});
const actions:Record<Phase,Action|null>={
  JOURNEY:'travel',DOOR:'enter',HOME:'read_notice',
  NOTICE:'put_down',SPEECH:'finish',COMPLETE:null
};
const next:Record<Action,Phase>={
  travel:'DOOR',enter:'HOME',read_notice:'NOTICE',put_down:'SPEECH',finish:'COMPLETE'
};
export function advance(s:State,action:Action):State{
  if(actions[s.phase]!==action)throw new HomeInvalidAction('wrong_home_phase');
  return {...s,revision:s.revision+1,phase:next[action]};
}
export function view(s:State,name:string,coins:number){
  return {stage:8,revision:s.revision,phase:s.phase,
    homeId:s.homeId,origin:s.origin,branch:s.branch,outcome:s.outcome,
    characterName:name,coins,rent:RENT,shortfall:Math.max(0,RENT-coins),
    noticeTitle:'FINAL NOTICE',
    noticeText:name+', you have to pay '+RENT+' coins in rent, or you are out. No discussion.',
    closingSpeech:CLOSING_SPEECH,completed:s.phase==='COMPLETE'};
}
