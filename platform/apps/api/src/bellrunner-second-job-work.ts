/** Bellrunner Stage 4: three different ordinary-work teaching activities.
 * Contract: approved docs/05-gameplay/onboarding/bellrunner/second-task-branches.md.
 * No wages, ordinary XP, loot, new skills, invented timers or unsafe tasks.
 */
import type {BellBranch} from './bellrunner-wrong-bell-work.js';
export type StageFourBranch=BellBranch;
export type StageFourPhase=
  'opening'|'inspect'|'triage_response'|'detail'|'confirm'|'choose'|'revelation'|'finish'|'done'|'exited';
export type StageFourAction=
  'continue_opening'|'compare_shift_records'|'inspect_absence_category'|
  'request_attendance_basis'|'enter_written_objection'|'submit_certificate'|
  'prioritize_urgent_worker'|'prioritize_mobile_worker'|'take_observations'|
  'bring_next_worker'|'continue_triage'|'continue_detail'|
  'continue_register'|'ask_about_classification'|'finish_handover'|
  'inspect_safety_linkage'|'trace_bell_rod'|'compare_linkage_marks'|
  'show_mechanic_link'|'mark_pin_position'|'request_second_check'|
  'record_inspection'|'continue_revelation'|'leave_for_gate';
export type StageFourState={
  revision:number;branch:StageFourBranch;phase:StageFourPhase;
  openingLine:number;revelationLine:number;
  // Optional on existing Stage 4 saves created before the narrative revision.
  triageLine?:number;detailLine?:number;registerLine?:number;
  method:string|null;observation:string|null;
  priority:'urgent'|'corrected'|null;
  journalFact:string|null;
};
export const STAGE_FOUR_OPENING_LENGTH:Record<StageFourBranch,number>={
  contracts:5,trauma:3,machinery:3
};
export const STAGE_FOUR_REVELATION_LENGTH:Record<StageFourBranch,number>={
  contracts:4,trauma:9,machinery:4
};
export const STAGE_FOUR_TRAUMA_TRIAGE_LENGTH={urgent:3,corrected:2} as const;
export const STAGE_FOUR_TRAUMA_ASSISTANCE_LENGTH=4;
export const STAGE_FOUR_TRAUMA_REGISTER_LENGTH=6;
export const STAGE_FOUR_FACT:Record<StageFourBranch,string>={
  contracts:'Refusal to enter the closed site is classified as voluntary absence; the worker\'s wages are forfeited.',
  trauma:'The medical register classifies complaints as non-work illness, charging the affected workers.',
  machinery:'The safety shutoff is engaged, but a repositioned retaining pin keeps the bell linkage connected.'
};
export const STAGE_FOUR_ACTIONS:readonly StageFourAction[]=[
  'continue_opening','compare_shift_records','inspect_absence_category',
  'request_attendance_basis','enter_written_objection','submit_certificate',
  'prioritize_urgent_worker','prioritize_mobile_worker','continue_triage',
  'continue_detail','take_observations','bring_next_worker','continue_register',
  'ask_about_classification','finish_handover','inspect_safety_linkage',
  'trace_bell_rod','compare_linkage_marks','show_mechanic_link',
  'mark_pin_position','request_second_check','record_inspection',
  'continue_revelation','leave_for_gate'
];
export function initialBellrunnerSecondJob(branch:StageFourBranch):StageFourState{
  return {revision:0,branch,phase:'opening',openingLine:0,
    revelationLine:0,triageLine:0,detailLine:0,registerLine:0,
    method:null,observation:null,priority:null,journalFact:null};
}
export class InvalidStageFourAction extends Error{
  constructor(){super('invalid_bellrunner_second_job_action');this.name='InvalidStageFourAction';}
}
export function availableStageFourActions(s:StageFourState):StageFourAction[]{
  switch(s.phase){
    case 'opening':
      // The final opening beat contains the Attendant's request and both
      // patient choices. Never send the player through a duplicate summary.
      return s.branch==='trauma'&&
        s.openingLine>=STAGE_FOUR_OPENING_LENGTH.trauma-1
          ?['prioritize_urgent_worker','prioritize_mobile_worker']
          :['continue_opening'];
    case 'inspect':
      return s.branch==='contracts'?['compare_shift_records']
        :s.branch==='trauma'?['prioritize_urgent_worker','prioritize_mobile_worker']
        :['inspect_safety_linkage'];
    case 'triage_response':return ['continue_triage'];
    case 'detail':
      return s.branch==='contracts'?['inspect_absence_category']
        :s.branch==='trauma'
          ?(s.detailLine??0)<STAGE_FOUR_TRAUMA_ASSISTANCE_LENGTH-1
            ?['continue_detail']:['take_observations','bring_next_worker']
        :['trace_bell_rod','compare_linkage_marks'];
    case 'confirm':
      return s.branch==='trauma'
          ?(s.registerLine??0)<STAGE_FOUR_TRAUMA_REGISTER_LENGTH-1
            ?['continue_register']:['ask_about_classification']
        :s.branch==='machinery'?['show_mechanic_link']:[];
    case 'choose':
      return s.branch==='contracts'?['request_attendance_basis','enter_written_objection']
        :s.branch==='trauma'?['ask_about_classification']
        :['mark_pin_position','request_second_check'];
    case 'revelation':
      return s.branch==='trauma'&&
        s.revelationLine>=STAGE_FOUR_REVELATION_LENGTH.trauma-1
          ?['finish_handover']:['continue_revelation'];
    case 'finish':
      // The mechanic has the report at this point; leaving also finalizes
      // the inspection. Do not add a redundant Stage IV completion screen.
      return s.branch==='contracts'?['submit_certificate']
        :s.branch==='trauma'?['finish_handover']:['leave_for_gate'];
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
      next.triageLine=0;next.phase='triage_response';break;
    case 'continue_triage':{
      const length=STAGE_FOUR_TRAUMA_TRIAGE_LENGTH[s.priority??'corrected'];
      if((s.triageLine??0)<length-1)next.triageLine=(s.triageLine??0)+1;
      else {next.phase='detail';next.detailLine=0;}
      break;
    }
    case 'continue_detail':next.detailLine=(s.detailLine??0)+1;break;
    case 'take_observations':case 'bring_next_worker':
      next.method=action;next.registerLine=0;next.phase='confirm';break;
    case 'continue_register':next.registerLine=(s.registerLine??0)+1;break;
    case 'ask_about_classification':
      next.observation=action;next.journalFact=STAGE_FOUR_FACT.trauma;
      next.revelationLine=0;next.phase='revelation';break;
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
    case 'leave_for_gate':
      // Existing saved 'done' sessions also remain eligible to exit.
      // For machinery the 'finish' handover is the final playable beat.
      next.phase='exited';break;
  }
  return next;
}
