/** Bellrunner Stage V — approved Dogman confrontation, not the Stage VI fight.
 * Every dialogue beat, volunteered branch fact and opening stance is durable.
 * Only Stage IV's server-owned branch enters this reducer.
 */
import type {BellBranch} from './bellrunner-wrong-bell-work.js';

export type DogmanPhase='arrival'|'papers'|'reply'|'demand'|'gate'|'done';
export type DogmanReply='ask_orders'|'keep_sheet'|'tell_him';
export type DogmanStance='street'|'cart'|'defend';
export type DogmanAction='continue'|DogmanReply|'step_street'|'use_cart'|'protect_bag';
export type DogmanState={
  revision:number;branch:BellBranch;phase:DogmanPhase;
  line:number;reply:DogmanReply|null;stance:DogmanStance|null;
};
export const DOGMAN_ACTIONS:readonly DogmanAction[]=[
  'continue','ask_orders','keep_sheet','tell_him',
  'step_street','use_cart','protect_bag'
];
export const DOGMAN_PAPERS_LENGTH=7;
export const DOGMAN_REPLY_LENGTH:Record<DogmanReply,number>={
  ask_orders:3,keep_sheet:2,tell_him:2
};
export const DOGMAN_DEMAND_LENGTH=2;
export const DOGMAN_GATE_LENGTH=8;
export const DOGMAN_BRANCHES:readonly BellBranch[]=['contracts','trauma','machinery'];
export function initialDogman(branch:BellBranch):DogmanState{
  return {revision:0,branch,phase:'arrival',line:0,reply:null,stance:null};
}
export class InvalidDogmanAction extends Error{
  constructor(){super('invalid_dogman_action');this.name='InvalidDogmanAction';}
}
export function availableDogmanActions(s:DogmanState):DogmanAction[]{
  switch(s.phase){
    case 'arrival':return ['continue'];
    case 'papers':return s.line<DOGMAN_PAPERS_LENGTH-1
      ?['continue']:['ask_orders','keep_sheet','tell_him'];
    case 'reply':return ['continue'];
    case 'demand':return ['continue'];
    case 'gate':return s.line<DOGMAN_GATE_LENGTH-1
      ?['continue']:['step_street','use_cart','protect_bag'];
    case 'done':return [];
  }
}
export function advanceDogman(s:DogmanState,action:DogmanAction):DogmanState{
  if(!DOGMAN_ACTIONS.includes(action)||!availableDogmanActions(s).includes(action))
    throw new InvalidDogmanAction();
  const next:DogmanState={...s,revision:s.revision+1};
  switch(s.phase){
    case 'arrival':
      next.phase='papers';next.line=0;break;
    case 'papers':
      if(action==='continue'){next.line+=1;break;}
      next.reply=action as DogmanReply;
      next.phase='reply';next.line=0;break;
    case 'reply':
      if(s.line<(DOGMAN_REPLY_LENGTH[s.reply??'ask_orders']-1))next.line+=1;
      else{next.phase='demand';next.line=0;}
      break;
    case 'demand':
      if(s.line<DOGMAN_DEMAND_LENGTH-1)next.line+=1;
      else{next.phase='gate';next.line=0;}
      break;
    case 'gate':
      if(action==='continue'){next.line+=1;break;}
      next.stance=action==='step_street'?'street':action==='use_cart'?'cart':'defend';
      next.phase='done';next.line=0;break;
    case 'done':throw new InvalidDogmanAction();
  }
  return next;
}
