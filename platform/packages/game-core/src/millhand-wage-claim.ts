/**
 * Millhand Stage 5 — The Wage Claim / Cornered.
 * Canon: docs/05-gameplay/onboarding/millhand/stage-5-approved-script.md
 * The engine is intentionally non-combat. Stage 6 owns the actual fight.
 */
import type {MissingStampBranch} from './millhand-missing-stamp.js';

export type WageClaimPhase =
  | 'OPENING' | 'CHOOSE_APPROACH' | 'APPROACH_EXCHANGE'
  | 'COMMON_EXCHANGE' | 'CHOOSE_EVIDENCE' | 'EVIDENCE_EXCHANGE'
  | 'LEAVING' | 'CORNERED_EXCHANGE' | 'CHOOSE_STANCE' | 'DONE';

export type WageClaimAction =
  | 'continue_dialogue' | 'read_demand' | 'challenge_authority'
  | 'share_route_evidence' | 'say_going_home'
  | 'brace_and_defend' | 'keep_moving' | 'use_cart_as_cover';

export type WageClaimApproach='read'|'challenge';
export type WageClaimStance='brace'|'moving'|'cart';
export type WageClaimState=Readonly<{
  revision:number;
  branch:MissingStampBranch;
  phase:WageClaimPhase;
  dialogueIndex:number;
  approach:WageClaimApproach|null;
  stance:WageClaimStance|null;
  lastAction:WageClaimAction|null;
}>;

export const WAGE_CLAIM_ACTIONS:readonly WageClaimAction[]=[
  'continue_dialogue','read_demand','challenge_authority','share_route_evidence',
  'say_going_home','brace_and_defend','keep_moving','use_cart_as_cover'
];
export const WAGE_CLAIM_DIALOGUE_COUNTS={
  OPENING:5,
  APPROACH_EXCHANGE:3,
  COMMON_EXCHANGE:6,
  EVIDENCE_EXCHANGE:3,
  CORNERED_EXCHANGE:8
} as const;

export function initialWageClaim(branch:MissingStampBranch):WageClaimState {
  if(branch!=='restamp'&&branch!=='contracts'&&branch!=='records')
    throw new WageClaimInvalidAction('invalid_wage_claim_branch');
  return {revision:0,branch,phase:'OPENING',dialogueIndex:0,
    approach:null,stance:null,lastAction:null};
}
export function availableWageClaimActions(s:WageClaimState):readonly WageClaimAction[]{
  switch(s.phase){
    case 'OPENING':
    case 'APPROACH_EXCHANGE':
    case 'COMMON_EXCHANGE':
    case 'EVIDENCE_EXCHANGE':
    case 'CORNERED_EXCHANGE':
      return ['continue_dialogue'];
    case 'CHOOSE_APPROACH':return ['read_demand','challenge_authority'];
    case 'CHOOSE_EVIDENCE':return ['share_route_evidence'];
    case 'LEAVING':return ['say_going_home'];
    case 'CHOOSE_STANCE':return ['brace_and_defend','keep_moving','use_cart_as_cover'];
    case 'DONE':return [];
  }
}
export class WageClaimInvalidAction extends Error{
  constructor(message='wrong_wage_claim_phase'){super(message);}
}
export function advanceWageClaim(s:WageClaimState,action:WageClaimAction):WageClaimState{
  if(!Number.isSafeInteger(s.revision)||s.revision<0||s.revision>=Number.MAX_SAFE_INTEGER
    ||!availableWageClaimActions(s).includes(action))
    throw new WageClaimInvalidAction();
  let {phase,dialogueIndex,approach,stance}=s;
  if(action==='continue_dialogue'){
    if(!(phase in WAGE_CLAIM_DIALOGUE_COUNTS))throw new WageClaimInvalidAction();
    const count=WAGE_CLAIM_DIALOGUE_COUNTS[phase as keyof typeof WAGE_CLAIM_DIALOGUE_COUNTS];
    if(!Number.isSafeInteger(dialogueIndex)||dialogueIndex<0||dialogueIndex>=count)
      throw new WageClaimInvalidAction('invalid_dialogue_index');
    if(dialogueIndex<count-1)dialogueIndex++;
    else{
      dialogueIndex=0;
      phase=phase==='OPENING'?'CHOOSE_APPROACH'
        :phase==='APPROACH_EXCHANGE'?'COMMON_EXCHANGE'
        :phase==='COMMON_EXCHANGE'?'CHOOSE_EVIDENCE'
        :phase==='EVIDENCE_EXCHANGE'?'LEAVING':'CHOOSE_STANCE';
    }
  }else{
    switch(action){
      case 'read_demand':
        approach='read';phase='APPROACH_EXCHANGE';break;
      case 'challenge_authority':
        approach='challenge';phase='APPROACH_EXCHANGE';break;
      case 'share_route_evidence':
        phase='EVIDENCE_EXCHANGE';break;
      case 'say_going_home':
        phase='CORNERED_EXCHANGE';break;
      case 'brace_and_defend':
        stance='brace';phase='DONE';break;
      case 'keep_moving':
        stance='moving';phase='DONE';break;
      case 'use_cart_as_cover':
        stance='cart';phase='DONE';break;
      default:throw new WageClaimInvalidAction();
    }
    dialogueIndex=0;
  }
  return {...s,revision:s.revision+1,phase,dialogueIndex,approach,stance,lastAction:action};
}
