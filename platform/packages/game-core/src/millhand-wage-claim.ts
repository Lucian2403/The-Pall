/**
 * Stage 5: The Wage Claim / Cornered.
 * Canon: docs/05-gameplay/onboarding/millhand/stage-5-approved-script.md.
 * A saved Stage 4 exit is the only new entrance. This module never
 * fabricates a fight, deducts coins, adds XP, or changes Health.
 */
import type {MissingStampBranch} from './millhand-missing-stamp.js';

export type WageClaimPhase =
  | 'OPENING' | 'DEMAND_CHOICE' | 'DEMAND_RESPONSE' | 'COMMON_EXCHANGE'
  | 'SHARE_EVIDENCE' | 'GOING_HOME' | 'CORNERED' | 'CHOOSE_POSITION'
  | 'FIGHT_PENDING';
export type WageClaimAction =
  | 'continue_dialogue' | 'read_demand' | 'ask_who_sent'
  | 'share_route_evidence' | 'tell_going_home'
  | 'brace_and_defend' | 'keep_moving' | 'use_cart_cover';
export type WageClaimStance='brace'|'moving'|'cart';
export type WageClaimState=Readonly<{
  revision:number;
  branch:MissingStampBranch;
  phase:WageClaimPhase;
  dialogueIndex:number;
  demandChoice:'read'|'challenge'|null;
  evidenceShared:boolean;
  stance:WageClaimStance|null;
  lastAction:WageClaimAction|null;
}>;
export const WAGE_CLAIM_ACTIONS:readonly WageClaimAction[]=[
  'continue_dialogue','read_demand','ask_who_sent','share_route_evidence',
  'tell_going_home','brace_and_defend','keep_moving','use_cart_cover'
];
const BEATS:Partial<Record<WageClaimPhase,number>>={
  OPENING:7,DEMAND_RESPONSE:3,COMMON_EXCHANGE:6,CORNERED:7
};
export function initialWageClaim(branch:MissingStampBranch):WageClaimState{
  if(!['restamp','contracts','records'].includes(branch))throw Error('invalid_stage_four_branch');
  return {
    revision:0,branch,phase:'OPENING',dialogueIndex:0,
    demandChoice:null,evidenceShared:false,stance:null,lastAction:null
  };
}
export function availableWageClaimActions(s:WageClaimState):readonly WageClaimAction[]{
  switch(s.phase){
    case 'OPENING':case 'DEMAND_RESPONSE':case 'COMMON_EXCHANGE':case 'CORNERED':
      return ['continue_dialogue'];
    case 'DEMAND_CHOICE':return ['read_demand','ask_who_sent'];
    case 'SHARE_EVIDENCE':return ['share_route_evidence'];
    case 'GOING_HOME':return ['tell_going_home'];
    case 'CHOOSE_POSITION':return ['brace_and_defend','keep_moving','use_cart_cover'];
    case 'FIGHT_PENDING':return [];
  }
}
export class WageClaimInvalidAction extends Error{
  constructor(){super('wrong_wage_claim_phase');}
}
export function advanceWageClaim(s:WageClaimState,action:WageClaimAction):WageClaimState{
  if(!Number.isSafeInteger(s.revision)||s.revision<0||
    s.revision>=Number.MAX_SAFE_INTEGER||
    !availableWageClaimActions(s).includes(action))throw new WageClaimInvalidAction();
  let {phase,dialogueIndex,demandChoice,evidenceShared,stance}=s;
  if(action==='continue_dialogue'){
    const beats=BEATS[phase];
    if(!beats)throw new WageClaimInvalidAction();
    if(dialogueIndex<beats-1)dialogueIndex+=1;
    else{
      dialogueIndex=0;
      phase=phase==='OPENING'?'DEMAND_CHOICE'
        :phase==='DEMAND_RESPONSE'?'COMMON_EXCHANGE'
        :phase==='COMMON_EXCHANGE'?'SHARE_EVIDENCE':'CHOOSE_POSITION';
    }
  }else switch(action){
    case 'read_demand':demandChoice='read';phase='DEMAND_RESPONSE';break;
    case 'ask_who_sent':demandChoice='challenge';phase='DEMAND_RESPONSE';break;
    case 'share_route_evidence':evidenceShared=true;phase='GOING_HOME';break;
    case 'tell_going_home':phase='CORNERED';break;
    case 'brace_and_defend':stance='brace';phase='FIGHT_PENDING';break;
    case 'keep_moving':stance='moving';phase='FIGHT_PENDING';break;
    case 'use_cart_cover':stance='cart';phase='FIGHT_PENDING';break;
  }
  return {...s,revision:s.revision+1,phase,dialogueIndex,demandChoice,
    evidenceShared,stance,lastAction:action};
}
