/** Bellrunner Stage 4: three different ordinary-work teaching activities.
 * Contract: approved docs/05-gameplay/onboarding/bellrunner/second-task-branches.md.
 * No wages, ordinary XP, loot, new skills, invented timers or unsafe tasks.
 */
import type {BellBranch} from './bellrunner-wrong-bell-work.js';
export type StageFourBranch=BellBranch;
export type StageFourPhase=
  'opening'|'inspect'|'detail'|'confirm'|'choose'|'revelation'|'finish'|'done'|'exited';
export type StageFourAction=
  'continue_opening'|'compare_shift_records'|'inspect_absence_category'|
  'request_attendance_basis'|'enter_written_objection'|'submit_certificate'|
  'prioritize_urgent_worker'|'prioritize_mobile_worker'|'take_observations'|
  'bring_next_worker'|'compare_medical_register'|
  'ask_for_worksite_note'|'ask_about_charge'|'finish_handover'|
  'inspect_safety_linkage'|'trace_bell_rod'|'compare_linkage_marks'|
  'show_mechanic_link'|'mark_pin_position'|'request_second_check'|
  'record_inspection'|'continue_revelation'|'leave_for_gate';
export type StageFourState={
  revision:number;branch:StageFourBranch;phase:StageFourPhase;
  openingLine:number;revelationLine:number;
  method:string|null;observation:string|null;
  priority:'urgent'|'corrected'|null;
  journalFact:string|null;
};
export const STAGE_FOUR_OPENING_LENGTH:Record<StageFourBranch,number>={
  contracts:5,trauma:3,machinery:3
};
export const STAGE_FOUR_REVELATION_LENGTH:Record<StageFourBranch,number>={
  contracts:4,trauma:4,machinery:4
};
export const STAGE_FOUR_FACT:Record<StageFourBranch,string>={
  contracts:'Refusal to enter the closed site is classified as voluntary absence; the worker\'s wages are forfeited.',
  trauma:'The medical register classifies complaints as non-work illness, charging the affected workers.',
  machinery:'The safety shutoff is engaged, but a repositioned retaining pin keeps the bell linkage connected.'
};
export const STAGE_FOUR_ACTIONS:readonly StageFourAction[]=[
  'continue_opening','compare_shift_records','inspect_absence_category',
  'request_attendance_basis','enter_written_objection','submit_certificate',
  'prioritize_urgent_worker','prioritize_mobile_worker','take_observations',
  'bring_next_worker','compare_medical_register','ask_for_worksite_note',
  'ask_about_charge','finish_handover','inspect_safety_linkage',
  'trace_bell_rod','compare_linkage_marks','show_mechanic_link',
  'mark_pin_position','request_second_check','record_inspection',
  'continue_revelation','leave_for_gate'
];
export function initialBellrunnerSecondJob(branch:StageFourBranch):StageFourState{
  return {revision:0,branch,phase:'opening',openingLine:0,
    revelationLine:0,method:null,observation:null,priority:null,journalFact:null};
}
export class InvalidStageFourAction extends Error{
  constructor(){super('invalid_bellrunner_second_job_action');this.name='InvalidStageFourAction';}
}
export function availableStageFourActions(s:StageFourState):StageFourAction[]{
  switch(s.phase){
    case 'opening':return ['continue_opening'];
    case 'inspect':
      return s.branch==='contracts'?['compare_shift_records']
        :s.branch==='trauma'?['prioritize_urgent_worker','prioritize_mobile_worker']
        :['inspect_safety_linkage'];
    case 'detail':
      return s.branch==='contracts'?['inspect_absence_category']
        :s.branch==='trauma'?['take_observations','bring_next_worker']
        :['trace_bell_rod','compare_linkage_marks'];
    case 'confirm':
      return s.branch==='trauma'?['compare_medical_register']
        :s.branch==='machinery'?['show_mechanic_link']:[];
    case 'choose':
      return s.branch==='contracts'?['request_attendance_basis','enter_written_objection']
        :s.branch==='trauma'?['ask_for_worksite_note','ask_about_charge']
        :['mark_pin_position','request_second_check'];
    case 'revelation':return ['continue_revelation'];
    case 'finish':
      return s.branch==='contracts'?['submit_certificate']
        :s.branch==='trauma'?['finish_handover']:['record_inspection'];
    case 'done':return ['leave_for_gate'];
    case 'exited':return [];
  }
}
export function advanceBellrunnerSecondJob(s:StageFourState,action:StageFourAction):StageFourState{
  if(!STAGE_FOUR_ACTIONS.includes(action)||!availableStageFourActions(s).includes(action))
    throw new InvalidStageFourAction();
  const next:StageFourState={...s,revision:s.revision+1};
  switch(action){
    case 'continue_opening':
      if(s.openingLine<STAGE_FOUR_OPENING_LENGTH[s.branch]-1)next.openingLine+=1;
      else next.phase='inspect';
      break;
    case 'compare_shift_records':next.phase='detail';next.observation='matching_closed_work_block';break;
    case 'inspect_absence_category':
      next.phase='choose';next.journalFact=STAGE_FOUR_FACT.contracts;break;
    case 'request_attendance_basis':case 'enter_written_objection':
      next.method=action;next.phase='revelation';break;
    case 'prioritize_urgent_worker':case 'prioritize_mobile_worker':
      next.priority=action==='prioritize_urgent_worker'?'urgent':'corrected';
      next.phase='detail';break;
    case 'take_observations':case 'bring_next_worker':
      next.method=action;next.phase='confirm';break;
    case 'compare_medical_register':
      next.journalFact=STAGE_FOUR_FACT.trauma;next.phase='choose';break;
    case 'ask_for_worksite_note':case 'ask_about_charge':
      next.observation=action;next.phase='revelation';break;
    case 'inspect_safety_linkage':
      next.observation='shutoff_engaged_bell_moving';next.phase='detail';break;
    case 'trace_bell_rod':case 'compare_linkage_marks':
      next.method=action;next.journalFact=STAGE_FOUR_FACT.machinery;next.phase='confirm';break;
    case 'show_mechanic_link':next.phase='choose';break;
    case 'mark_pin_position':case 'request_second_check':
      next.observation=action;next.phase='revelation';break;
    case 'continue_revelation':
      if(s.revelationLine<STAGE_FOUR_REVELATION_LENGTH[s.branch]-1)next.revelationLine+=1;
      else next.phase='finish';
      break;
    case 'submit_certificate':case 'finish_handover':case 'record_inspection':
      next.phase='done';break;
    case 'leave_for_gate':next.phase='exited';break;
  }
  return next;
}
