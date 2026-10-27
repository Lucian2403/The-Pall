/**
 * Millhand Stage 4: three owner-approved second jobs.
 * Canon: docs/05-gameplay/onboarding/millhand/stage-4-approved-script.md
 * Generic mechanics only. No new times, random damage, money, inventory, IDs
 * or skill awards. A Stage 3 route already supplies the +1 skill exactly once.
 */
import type {MissingStampBranch} from './millhand-missing-stamp.js';

export type SecondJobPhase =
  | 'CHECK_LOAD' | 'CHOOSE_TRANSPORT' | 'COMPARE_DELIVERY' | 'SPEAK_DEPOT' | 'DEPOT_DIALOGUE'
  | 'CHOOSE_RECEIPT' | 'COMPLETE_DELIVERY'
  | 'EXAMINE_PAPER' | 'COMPARE_RECORDS' | 'SPEAK_CONTRACTS' | 'CONTRACTS_DIALOGUE'
  | 'CHOOSE_CHALLENGE' | 'SUBMIT_DISPUTE'
  | 'READ_DEATH_REGISTER' | 'READ_WAGE_RECORD' | 'EXAMINE_SCRAPED_ENTRY'
  | 'SPEAK_ARCHIVE' | 'ARCHIVE_DIALOGUE' | 'CHOOSE_SOURCE' | 'RECORD_FINDING'
  | 'DONE';

export type SecondJobAction =
  | 'check_load' | 'secure_plates' | 'carry_smaller_loads'
  | 'compare_delivery_list' | 'speak_to_depot_clerk'
  | 'record_goods_as_plates' | 'request_delivery_correction' | 'complete_delivery'
  | 'examine_work_paper' | 'compare_official_records' | 'speak_to_contracts_clerk'
  | 'request_seal_check' | 'mark_conflicting_entries' | 'submit_dispute'
  | 'read_death_register' | 'check_wage_record' | 'examine_scraped_entry'
  | 'speak_to_archive_assistant' | 'compare_neighbouring_entries'
  | 'compare_shift_book' | 'record_finding'
  | 'continue_dialogue';

export type SecondJobChoice =
  | 'secured' | 'smaller_loads'
  | 'recorded_plates' | 'requested_correction'
  | 'seal_check' | 'written_complaint'
  | 'neighbouring_entries' | 'shift_book';

export type SecondJobState = Readonly<{
  revision:number;
  branch:MissingStampBranch;
  phase:SecondJobPhase;
  dialogueIndex:number;
  transport: 'secured'|'smaller_loads'|null;
  receipt: 'recorded_plates'|'requested_correction'|null;
  challenge:'seal_check'|'written_complaint'|null;
  source:'neighbouring_entries'|'shift_book'|null;
  lastAction:SecondJobAction|null;
}>;

export const SECOND_JOB_ACTIONS:readonly SecondJobAction[]=[
  'check_load','secure_plates','carry_smaller_loads','compare_delivery_list',
  'speak_to_depot_clerk','record_goods_as_plates','request_delivery_correction',
  'complete_delivery','examine_work_paper','compare_official_records',
  'speak_to_contracts_clerk','request_seal_check','mark_conflicting_entries',
  'submit_dispute','read_death_register','check_wage_record',
  'examine_scraped_entry','speak_to_archive_assistant',
  'compare_neighbouring_entries','compare_shift_book','record_finding',
  'continue_dialogue'
];
const DIALOGUE_BEATS={restamp:5,contracts:7,records:4} as const;

export function initialSecondJob(branch:MissingStampBranch):SecondJobState {
  const phase:SecondJobPhase=branch==='restamp'?'CHECK_LOAD'
    :branch==='contracts'?'EXAMINE_PAPER':'READ_DEATH_REGISTER';
  return {revision:0,branch,phase,dialogueIndex:0,
    transport:null,receipt:null,challenge:null,source:null,lastAction:null};
}

export function availableSecondJobActions(s:SecondJobState):readonly SecondJobAction[]{
  switch(s.phase){
    case 'CHECK_LOAD':return ['check_load'];
    case 'CHOOSE_TRANSPORT':return ['secure_plates','carry_smaller_loads'];
    case 'COMPARE_DELIVERY':return ['compare_delivery_list'];
    case 'SPEAK_DEPOT':return ['speak_to_depot_clerk'];
    case 'DEPOT_DIALOGUE':return ['continue_dialogue'];
    case 'CHOOSE_RECEIPT':return ['record_goods_as_plates','request_delivery_correction'];
    case 'COMPLETE_DELIVERY':return ['complete_delivery'];
    case 'EXAMINE_PAPER':return ['examine_work_paper'];
    case 'COMPARE_RECORDS':return ['compare_official_records'];
    case 'SPEAK_CONTRACTS':return ['speak_to_contracts_clerk'];
    case 'CONTRACTS_DIALOGUE':return ['continue_dialogue'];
    case 'CHOOSE_CHALLENGE':return ['request_seal_check','mark_conflicting_entries'];
    case 'SUBMIT_DISPUTE':return ['submit_dispute'];
    case 'READ_DEATH_REGISTER':return ['read_death_register'];
    case 'READ_WAGE_RECORD':return ['check_wage_record'];
    case 'EXAMINE_SCRAPED_ENTRY':return ['examine_scraped_entry'];
    case 'SPEAK_ARCHIVE':return ['speak_to_archive_assistant'];
    case 'ARCHIVE_DIALOGUE':return ['continue_dialogue'];
    case 'CHOOSE_SOURCE':return ['compare_neighbouring_entries','compare_shift_book'];
    case 'RECORD_FINDING':return ['record_finding'];
    case 'DONE':return [];
  }
}

export class SecondJobInvalidAction extends Error {
  constructor(){super('wrong_second_job_phase');}
}
export function advanceSecondJob(s:SecondJobState,action:SecondJobAction):SecondJobState {
  if(!Number.isSafeInteger(s.revision)||s.revision<0||s.revision>=Number.MAX_SAFE_INTEGER
    ||!availableSecondJobActions(s).includes(action))throw new SecondJobInvalidAction();
  let {phase,dialogueIndex,transport,receipt,challenge,source}=s;
  switch(action){
    case 'check_load':phase='CHOOSE_TRANSPORT';break;
    case 'secure_plates':transport='secured';phase='COMPARE_DELIVERY';break;
    case 'carry_smaller_loads':transport='smaller_loads';phase='COMPARE_DELIVERY';break;
    case 'compare_delivery_list':phase='SPEAK_DEPOT';break;
    case 'speak_to_depot_clerk':phase='DEPOT_DIALOGUE';dialogueIndex=0;break;
    case 'record_goods_as_plates':receipt='recorded_plates';phase='COMPLETE_DELIVERY';break;
    case 'request_delivery_correction':receipt='requested_correction';phase='COMPLETE_DELIVERY';break;
    case 'complete_delivery':phase='DONE';break;
    case 'examine_work_paper':phase='COMPARE_RECORDS';break;
    case 'compare_official_records':phase='SPEAK_CONTRACTS';break;
    case 'speak_to_contracts_clerk':phase='CONTRACTS_DIALOGUE';dialogueIndex=0;break;
    case 'request_seal_check':challenge='seal_check';phase='SUBMIT_DISPUTE';break;
    case 'mark_conflicting_entries':challenge='written_complaint';phase='SUBMIT_DISPUTE';break;
    case 'submit_dispute':phase='DONE';break;
    case 'read_death_register':phase='READ_WAGE_RECORD';break;
    case 'check_wage_record':phase='EXAMINE_SCRAPED_ENTRY';break;
    case 'examine_scraped_entry':phase='SPEAK_ARCHIVE';break;
    case 'speak_to_archive_assistant':phase='ARCHIVE_DIALOGUE';dialogueIndex=0;break;
    case 'compare_neighbouring_entries':source='neighbouring_entries';phase='RECORD_FINDING';break;
    case 'compare_shift_book':source='shift_book';phase='RECORD_FINDING';break;
    case 'record_finding':phase='DONE';break;
    case 'continue_dialogue':{
      const count=DIALOGUE_BEATS[s.branch];
      if(dialogueIndex<count-1)dialogueIndex++;
      else {
        dialogueIndex=0;
        phase=s.branch==='restamp'?'CHOOSE_RECEIPT'
          :s.branch==='contracts'?'CHOOSE_CHALLENGE':'CHOOSE_SOURCE';
      }
      break;
    }
  }
  return {...s,revision:s.revision+1,phase,dialogueIndex,transport,receipt,challenge,source,lastAction:action};
}
