/** Bellrunner Stage 3 — The Wrong Bell.
 * Pure deterministic progress; narrative text stays in approved dialogue copy.
 * No coins, ordinary XP, loot, forged receipt, hidden skill checks or world-time guesses.
 */
export type BellBranch='contracts'|'trauma'|'machinery';
export type BellPhase='evidence'|'watchman'|'choice'|'committed';
export type BellAction='read_closure'|'inspect_slip'|'compare_orders'|'talk_watchman'|
  'continue_watchman'|'choose_contracts'|'choose_trauma'|'choose_machinery';
export type BellState={
  revision:number;phase:BellPhase;closureRead:boolean;slipRead:boolean;
  compared:boolean;watchmanLine:number;branch:BellBranch|null;
};
export const INITIAL_WRONG_BELL:BellState={
  revision:0,phase:'evidence',closureRead:false,slipRead:false,
  compared:false,watchmanLine:-1,branch:null
};
export const WATCHMAN_LINE_COUNT=11;
export const BELL_ACTIONS:readonly BellAction[]=[
  'read_closure','inspect_slip','compare_orders','talk_watchman',
  'continue_watchman','choose_contracts','choose_trauma','choose_machinery'
];
export const BELL_BRANCH_SKILL:Record<BellBranch,'Commerce'|'Medicine'|'Mechanics'>={
  contracts:'Commerce',trauma:'Medicine',machinery:'Mechanics'
};
export class InvalidBellAction extends Error{
  constructor(){super('invalid_stage_three_action');this.name='InvalidBellAction';}
}
export function availableBellActions(s:BellState):BellAction[]{
  if(s.phase==='committed')return [];
  if(s.phase==='watchman')return ['continue_watchman'];
  const actions:BellAction[]=[];
  if(s.phase==='evidence'){
    if(!s.closureRead)actions.push('read_closure');
    if(!s.slipRead)actions.push('inspect_slip');
    if(s.closureRead&&s.slipRead)actions.push('talk_watchman');
  }
  if(s.closureRead&&s.slipRead)actions.push('compare_orders');
  if(s.phase==='choice')actions.push('choose_contracts','choose_trauma','choose_machinery');
  return actions;
}
export function advanceWrongBell(s:BellState,action:BellAction):BellState{
  if(!BELL_ACTIONS.includes(action)||!availableBellActions(s).includes(action))
    throw new InvalidBellAction();
  const next:BellState={...s,revision:s.revision+1};
  switch(action){
    case 'read_closure':next.closureRead=true;break;
    case 'inspect_slip':next.slipRead=true;break;
    case 'compare_orders':next.compared=true;break;
    case 'talk_watchman':next.phase='watchman';next.watchmanLine=0;break;
    case 'continue_watchman':
      if(s.watchmanLine<WATCHMAN_LINE_COUNT-1)next.watchmanLine+=1;
      else next.phase='choice';
      break;
    case 'choose_contracts':next.phase='committed';next.branch='contracts';break;
    case 'choose_trauma':next.phase='committed';next.branch='trauma';break;
    case 'choose_machinery':next.phase='committed';next.branch='machinery';break;
  }
  return next;
}
