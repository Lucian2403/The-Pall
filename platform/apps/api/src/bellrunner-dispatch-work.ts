/** Reusable courier activity core for the Bellrunner's normal Dispatch round.
 * No invented travel minutes, wages, destinations, incidents or XP.
 * The tutorial's one spoiled receipt is an approved, deterministic teaching case.
 */
export type DispatchRoute='direct'|'quieter';
export type ReceiptProof='clear'|'book_confirmed'|'noted_unclear';
export type DispatchPhase=
  'issued'|'checked'|'road_chosen'|'spoiled_mark'|'book_checked'|
  'round_report'|'final_notice'|'final_notice_taken';
export type DispatchState={
  phase:DispatchPhase;
  route:DispatchRoute|null;
  noticesOrdered:boolean;
  receipt:ReceiptProof|null;
};
export type DispatchWorkAction=
  'check_round'|'sort_notices'|'take_direct_road'|'take_quieter_road'|
  'deliver_notices'|'ask_fresh_mark'|'check_receiving_book'|
  'confirm_book'|'note_spoiled_mark'|'finish_round'|'take_final_notice';
export const DISPATCH_ACTIONS:ReadonlyArray<DispatchWorkAction>=[
  'check_round','sort_notices','take_direct_road','take_quieter_road',
  'deliver_notices','ask_fresh_mark','check_receiving_book','confirm_book',
  'note_spoiled_mark','finish_round','take_final_notice'
];
export const INITIAL_DISPATCH_STATE:DispatchState={
  phase:'issued',route:null,noticesOrdered:false,receipt:null
};
export class InvalidDispatchAction extends Error{
  constructor(){super('invalid_work_phase');this.name='InvalidDispatchAction';}
}
export function applyDispatchAction(
 state:DispatchState,action:DispatchWorkAction
):DispatchState{
 const reject=():never=>{throw new InvalidDispatchAction();};
 switch(action){
  case 'check_round':
   if(state.phase!=='issued')return reject();
   return {...state,phase:'checked'};
  case 'sort_notices':
   if(state.phase!=='checked'||state.noticesOrdered)return reject();
   return {...state,noticesOrdered:true};
  case 'take_direct_road':
  case 'take_quieter_road':
   if(state.phase!=='checked')return reject();
   return {...state,phase:'road_chosen',
     route:action==='take_direct_road'?'direct':'quieter'};
  case 'deliver_notices':
   if(state.phase!=='road_chosen'||!state.route)return reject();
   return {...state,phase:'spoiled_mark'};
  case 'check_receiving_book':
   if(state.phase!=='spoiled_mark')return reject();
   return {...state,phase:'book_checked'};
  case 'ask_fresh_mark':
   if(state.phase!=='spoiled_mark'&&state.phase!=='book_checked')return reject();
   return {...state,phase:'round_report',receipt:'clear'};
  case 'confirm_book':
   if(state.phase!=='book_checked')return reject();
   return {...state,phase:'round_report',receipt:'book_confirmed'};
  case 'note_spoiled_mark':
   if(state.phase!=='spoiled_mark'&&state.phase!=='book_checked')return reject();
   return {...state,phase:'round_report',receipt:'noted_unclear'};
  case 'finish_round':
   if(state.phase!=='round_report'||!state.receipt)return reject();
   return {...state,phase:'final_notice'};
  case 'take_final_notice':
   if(state.phase!=='final_notice')return reject();
   // Deliberately do NOT advance tutorial_stage: Stage 3 is not implemented.
   // The sealed task paper remains a job prop, never an inventory grant.
   return {...state,phase:'final_notice_taken'};
  default:
   return reject();
 }
}
