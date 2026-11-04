/**
 * Millhand Stage 5 — The Wage Claim / Cornered.
 * Canon: docs/05-gameplay/onboarding/millhand/stage-5-approved-script.md
 * The engine is intentionally non-combat. Stage 6 owns the actual fight.
 */
import type {MissingStampBranch} from './millhand-missing-stamp.js';

export type WageClaimPhase =
  | 'APPROACHING' | 'OPENING' | 'CHOOSE_APPROACH' | 'APPROACH_EXCHANGE'
  | 'COMMON_EXCHANGE' | 'CHOOSE_EVIDENCE' | 'EVIDENCE_EXCHANGE'
  | 'LEAVING' | 'CORNERED_EXCHANGE' | 'CHOOSE_STANCE' | 'DONE';

export type WageClaimAction =
  | 'continue_dialogue' | 'read_demand' | 'challenge_authority'
  | 'share_route_evidence' | 'say_going_home'
  | 'brace_and_defend' | 'keep_moving' | 'use_cart_as_cover'
  | 'previous_dialogue';

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
  'say_going_home','brace_and_defend','keep_moving','use_cart_as_cover',
  'previous_dialogue'
];
export const WAGE_CLAIM_DIALOGUE_COUNTS={
  OPENING:5,
  APPROACH_EXCHANGE:3,
  COMMON_EXCHANGE:7,
  EVIDENCE_EXCHANGE:3,
  CORNERED_EXCHANGE:8
} as const;

export function initialWageClaim(branch:MissingStampBranch):WageClaimState {
  if(branch!=='restamp'&&branch!=='contracts'&&branch!=='records')
    throw new WageClaimInvalidAction('invalid_wage_claim_branch');
  return {revision:0,branch,phase:'APPROACHING',dialogueIndex:0,
    approach:null,stance:null,lastAction:null};
}
/** Previous moves one *saved* beat backward. Once combat is connected,
 * the API must reject it after a Stage 6 encounter has started. */
export function availableWageClaimActions(s:WageClaimState):readonly WageClaimAction[]{
  const back:WageClaimAction[]=
    s.phase==='APPROACHING'?[]:['previous_dialogue'];
  switch(s.phase){
    case 'APPROACHING':
    case 'OPENING':
    case 'APPROACH_EXCHANGE':
    case 'COMMON_EXCHANGE':
    case 'EVIDENCE_EXCHANGE':
    case 'CORNERED_EXCHANGE':
      return ['continue_dialogue',...back];
    case 'CHOOSE_APPROACH':return ['read_demand','challenge_authority',...back];
    case 'CHOOSE_EVIDENCE':return ['share_route_evidence',...back];
    case 'LEAVING':return ['say_going_home',...back];
    case 'CHOOSE_STANCE':return ['brace_and_defend','keep_moving','use_cart_as_cover',...back];
    case 'DONE':return back;
  }
}
/** Reverse the last dialog beat or choice without rewinding Stage 4,
 * decrementing XP, or depending on ephemeral client-side history.
 * Revision remains strictly monotone, even while navigating backwards. */
export function previousWageClaim(s:WageClaimState):WageClaimState{
  if(!availableWageClaimActions(s).includes('previous_dialogue'))
    throw new WageClaimInvalidAction('previous_dialogue_not_available');
  let {phase,dialogueIndex,approach,stance}=s;
  if(phase==='OPENING'&&dialogueIndex===0){
    phase='APPROACHING';
  }else if(phase==='DONE'){
    phase='CHOOSE_STANCE';dialogueIndex=0;stance=null;
  }else if(phase==='CHOOSE_APPROACH'){
    phase='OPENING';dialogueIndex=WAGE_CLAIM_DIALOGUE_COUNTS.OPENING-1;
  }else if(phase==='CHOOSE_EVIDENCE'){
    phase='COMMON_EXCHANGE';dialogueIndex=WAGE_CLAIM_DIALOGUE_COUNTS.COMMON_EXCHANGE-1;
  }else if(phase==='LEAVING'){
    phase='EVIDENCE_EXCHANGE';dialogueIndex=WAGE_CLAIM_DIALOGUE_COUNTS.EVIDENCE_EXCHANGE-1;
  }else if(phase==='CHOOSE_STANCE'){
    phase='CORNERED_EXCHANGE';dialogueIndex=WAGE_CLAIM_DIALOGUE_COUNTS.CORNERED_EXCHANGE-1;
  }else if(phase==='APPROACH_EXCHANGE'&&dialogueIndex===0){
    phase='CHOOSE_APPROACH';approach=null;
  }else if(phase==='COMMON_EXCHANGE'&&dialogueIndex===0){
    phase='APPROACH_EXCHANGE';dialogueIndex=WAGE_CLAIM_DIALOGUE_COUNTS.APPROACH_EXCHANGE-1;
  }else if(phase==='EVIDENCE_EXCHANGE'&&dialogueIndex===0){
    phase='CHOOSE_EVIDENCE';
  }else if(phase==='CORNERED_EXCHANGE'&&dialogueIndex<=1){
    // This was a single LEAVING step, irrespective of old/new saved beat.
    phase='LEAVING';dialogueIndex=0;
  }else if(dialogueIndex>0){
    dialogueIndex--;
  }else{
    throw new WageClaimInvalidAction('invalid_previous_dialogue');
  }
  return {...s,revision:s.revision+1,phase,dialogueIndex,approach,stance,lastAction:'previous_dialogue'};
}
export class WageClaimInvalidAction extends Error{
  constructor(message='wrong_wage_claim_phase'){super(message);}
}
export function advanceWageClaim(s:WageClaimState,action:WageClaimAction):WageClaimState{
  if(!Number.isSafeInteger(s.revision)||s.revision<0||s.revision>=Number.MAX_SAFE_INTEGER
    ||!availableWageClaimActions(s).includes(action))
    throw new WageClaimInvalidAction();
  if(action==='previous_dialogue')return previousWageClaim(s);
  let {phase,dialogueIndex,approach,stance}=s;
  if(action==='continue_dialogue'){
    if(phase==='APPROACHING'){
      if(dialogueIndex!==0)throw new WageClaimInvalidAction('invalid_dialogue_index');
      // Reveal Flint only after this server-authoritative Continue action.
      phase='OPENING';dialogueIndex=0;
    }else{
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
    // The LEAVING screen already displayed "I'm going home." as the
    // player's automatic remark. Do not repeat it as another saved beat.
    // Legacy CORNERED_EXCHANGE index 0 saves still remain valid.
    dialogueIndex=action==='say_going_home'?1:0;
  }
  return {...s,revision:s.revision+1,phase,dialogueIndex,approach,stance,lastAction:action};
}
