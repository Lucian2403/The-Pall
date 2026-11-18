/** Stitcher Stages I–IV: original supervised ward work and three selected
 * second jobs. No generic healing numbers, stock counts, wages or XP invented.
 * Story actions are persistent; hovering/looking at already-inspected props
 * is read-only at the scene layer. */
export type StitcherBranch='trolley'|'consent'|'notes';
export type StitcherStage5Choice='papers'|'claudia'|'evidence';
export type StitcherStage5Preparation='reason'|'cart'|'brace';
export type StitcherPhase='intro'|'briefing'|'inspect'|'order'|'prepare'|'care'|
  'linen_check'|'linen_fix'|'verify'|'record'|'report'|'close'|
  'discovery'|'claudia'|'choose'|'opening'|'work'|'dialogue'|'finish'|'exited'|'attendant'|'investigate'|'witness'|
 'hold'|'door'|'prepare_door'|'door_reply'|'fight_ready';
export type StitcherAction=
 'start'|'ask_linen'|'continue_intro'|'check_ward'|'begin_round'|
 'inspect_a'|'inspect_b'|'order_bleeding'|'order_dirty'|
 'prep_cut'|'prep_ready'|'dress_a'|'dress_b'|'check_linen'|
 'discard_end'|'trim_end'|'inspect_finished'|'record_linen'|'report_claudia'|'continue_report'|
 'close_round'|'observe_bed'|'read_chart'|'ask_patient'|'ask_again'|
 'continue_patient'|'confront_claudia'|'continue_claudia'|
 'choose_trolley'|'choose_consent'|'choose_notes'|'continue_opening'|
 'check_load'|'balance_load'|'route_short'|'route_wide'|'check_receiver'|
 'match_consent'|'check_medicine'|'attach_record'|'bring_witness'|
 'mark_disputed'|'compare_admission'|'match_schedule'|
 'copy_pages'|'cross_reference'|'record_difference'|
 'continue_dialogue'|'finish_job'|'ask_attendant'|'continue_attendant'|
 'check_transfer'|'fetch_claudia'|'use_finding'|'continue_witness'|
 'continue_hold'|'continue_owler'|'reason_owler'|'move_cart'|
 'brace_door'|'continue_door';
export type StitcherState={
 revision:number;stage:1|2|3|4|5;phase:StitcherPhase;
 introLine:number;inspectedA:boolean;inspectedB:boolean;
 first:'a'|'b'|null;prepared:'cut'|'ready'|null;
 treatedA:boolean;treatedB:boolean;correction:'discard'|'trim'|null;
 reportLine:number;bedObserved:boolean;chartRead:boolean;patientHeard:boolean;
 patientLine:number;focus:'bed'|'chart'|'patient'|null;
 claudiaLine:number;branch:StitcherBranch|null;taskStep:number;
 routeMethod:string|null;openingLine:number;dialogueLine:number;
 /** Optional for older persisted Stage IV/V snapshots. */
 stage5Line?:number;stage5Choice?:StitcherStage5Choice|null;
 stage5Witnessed?:boolean;stage5Hold?:boolean;
 stage5Preparation?:StitcherStage5Preparation|null;
};
export const INITIAL_STITCHER:StitcherState={
 revision:0,stage:1,phase:'intro',introLine:0,
 inspectedA:false,inspectedB:false,first:null,prepared:null,
 treatedA:false,treatedB:false,correction:null,
 reportLine:0,bedObserved:false,chartRead:false,patientHeard:false,patientLine:0,
 focus:null,claudiaLine:0,branch:null,taskStep:0,routeMethod:null,
 openingLine:0,dialogueLine:0,
 stage5Line:0,stage5Choice:null,stage5Witnessed:false,
 stage5Hold:false,stage5Preparation:null
};
export const STITCHER_ACTIONS:readonly StitcherAction[]=[
 'start','ask_linen','continue_intro','check_ward','begin_round',
 'inspect_a','inspect_b','order_bleeding','order_dirty',
 'prep_cut','prep_ready','dress_a','dress_b','check_linen',
 'discard_end','trim_end','inspect_finished','record_linen','report_claudia','continue_report',
 'close_round','observe_bed','read_chart','ask_patient','ask_again',
 'continue_patient','confront_claudia','continue_claudia',
 'choose_trolley','choose_consent','choose_notes','continue_opening',
 'check_load','balance_load','route_short','route_wide','check_receiver',
 'match_consent','check_medicine','attach_record','bring_witness',
 'mark_disputed','compare_admission','match_schedule','copy_pages',
 'cross_reference','record_difference','continue_dialogue','finish_job',
 'ask_attendant','continue_attendant','check_transfer','fetch_claudia','use_finding',
 'continue_witness','continue_hold','continue_owler','reason_owler','move_cart',
 'brace_door','continue_door'
];
export const STITCHER_MAJOR:Readonly<Record<StitcherBranch,string>>={
 trolley:'Industry',consent:'Commerce',notes:'Scholarship'
};
export const STITCHER_DISCIPLINE:Readonly<Record<StitcherBranch,string>>={
 trolley:'Hauling',consent:'Contracts',notes:'Investigation'
};
export const STITCHER_JOB:Readonly<Record<StitcherBranch,string>>={
 trolley:'The Night Trolley',consent:'The Signed Consent',notes:'Notes for the Living'
};
export const STITCHER_LINES:Readonly<Record<StitcherBranch,readonly {speaker:string;text:string}[]>>={
 trolley:[
  {speaker:'RECEIVER',text:'Contract number?'},
  {speaker:'YOU',text:"There's a man on this trolley. Haven't you got his name?"},
  {speaker:'RECEIVER',text:'I need the number.'},
  {speaker:'YOU',text:"I'm not signing him over."},
  {speaker:'RECEIVER',text:'Then take him back to the ward.'}
 ],
 consent:[
  {speaker:'CLERK',text:"His thumbprint's right here."},
  {speaker:'YOU',text:'He says they took it while he was asleep.'},
  {speaker:'CLERK',text:"Then we'd better check the medicine book."},
  {speaker:'YOU',text:'They gave him the draught before they took his print.'},
  {speaker:'CLERK',text:"I'll mark the transfer disputed."},
  {speaker:'CLAUDIA',text:"You couldn't come to me first?"},
  {speaker:'YOU',text:'Would you have changed anything?'},
  {speaker:'CLAUDIA',text:"Now the school won't pay until this is settled."}
 ],
 notes:[
  {speaker:'COPYIST',text:'What do you need?'},
  {speaker:'YOU',text:'His treatment notes. And the teaching list for tomorrow.'},
  {speaker:'YOU',text:"I can't find anything saying he needs another operation."},
  {speaker:'COPYIST',text:"He's down for a demonstration."},
  {speaker:'YOU',text:"So it's not to treat his wound?"},
  {speaker:'COPYIST',text:'Not according to these notes.'}
 ]
};
export const STITCHER_CLAUDIA_LINES:readonly {speaker:string;text:string}[]=[
 {speaker:'YOU',text:"What's this demonstration? He says he never agreed to it."},
 {speaker:'CLAUDIA',text:"The school's paying us. He got his treatment."},
 {speaker:'YOU',text:'So now they get to operate on him for a lesson?'},
 {speaker:'CLAUDIA',text:"Who's paying for the fever ward's coal if I turn them away? You?"},
 {speaker:'YOU',text:"He's strapped to the bed, Claudia."},
 {speaker:'CLAUDIA',text:"And I've got a ward full of patients waiting. Get on with your work."}
];
export const STITCHER_BRANCH_RESPONSE:Readonly<Record<StitcherBranch,string>>={
 trolley:"I'll go with the trolley. I want to see where they take him.",
 consent:'Then show me his consent paper.',
 notes:"Let me see the surgeon's notes."
};
export class StitcherInvalidAction extends Error{
 constructor(){super('invalid_work_phase');this.name='StitcherInvalidAction';}
}
export function stitcherActions(state:StitcherState):StitcherAction[]{
 const s=state;
 switch(s.stage){
 case 1:
  if(s.phase==='intro')return s.introLine===0?['ask_linen','continue_intro']:
   s.introLine===1||s.introLine===2?['continue_intro']:['check_ward'];
  return s.phase==='briefing'?['begin_round']:[];
 case 2:
  switch(s.phase){
   case 'inspect':return [...(!s.inspectedA?['inspect_a' as const]:[]),
     ...(!s.inspectedB?['inspect_b' as const]:[])];
   case 'order':return ['order_bleeding','order_dirty'];
   case 'prepare':return ['prep_cut','prep_ready'];
   case 'care':return s.first==='a'
     ?(s.treatedA?['dress_b']:['dress_a'])
     :(s.treatedB?['dress_a']:['dress_b']);
   case 'linen_check':return ['check_linen'];
   case 'linen_fix':return ['discard_end','trim_end'];
   case 'verify':return ['inspect_finished'];
   case 'record':return ['record_linen'];
   case 'report':return s.reportLine===0?['report_claudia']:['continue_report'];
   case 'close':return ['close_round'];
  }
  return [];
 case 3:
  if(s.phase==='discovery')return [
    ...(!s.bedObserved?['observe_bed' as const]:[]),
    ...(!s.chartRead?['read_chart' as const]:[]),
    ...(s.bedObserved&&!s.patientHeard?['ask_patient' as const]:[]),
    ...(s.patientHeard&&s.patientLine===0?['ask_again' as const]:[]),
    ...(s.patientHeard&&s.patientLine===1?['continue_patient' as const]:[]),
    ...(s.bedObserved&&s.chartRead&&s.patientHeard?['confront_claudia' as const]:[])
   ];
  if(s.phase==='claudia')return ['continue_claudia'];
  if(s.phase==='choose')return ['choose_trolley','choose_consent','choose_notes'];
  return [];
 case 4:
  if(!s.branch)return [];
  if(s.phase==='opening')return ['continue_opening'];
  if(s.phase==='dialogue')return ['continue_dialogue'];
  if(s.phase==='finish')return ['finish_job'];
  if(s.phase!=='work')return [];
  if(s.branch==='trolley')return s.taskStep===0?['check_load']:
   s.taskStep===1?['balance_load']:
   s.taskStep===2?['route_short','route_wide']:
   s.taskStep===3?['check_receiver']:[];
  if(s.branch==='consent')return s.taskStep===0?['match_consent']:
   s.taskStep===1?['check_medicine']:
   s.taskStep===2?['attach_record','bring_witness']:
   s.taskStep===3?['mark_disputed']:[];
  return s.taskStep===0?['compare_admission']:
   s.taskStep===1?['match_schedule']:
   s.taskStep===2?['copy_pages','cross_reference']:
   s.taskStep===3?['record_difference']:[];
 case 5:
  switch(s.phase){
   case 'exited':return ['ask_attendant'];
   case 'attendant':return ['continue_attendant'];
   case 'investigate':return ['check_transfer','fetch_claudia','use_finding'];
   case 'witness':return ['continue_witness'];
   case 'hold':return ['continue_hold'];
   case 'door':return ['continue_owler'];
   case 'prepare_door':return ['reason_owler','move_cart','brace_door'];
   case 'door_reply':return ['continue_door'];
   case 'fight_ready':return []; // Stage VI combat is not implemented here.
  }
  return [];
 }
 return [];
}
export function applyStitcherAction(state:StitcherState,action:StitcherAction):StitcherState{
 if(!stitcherActions(state).includes(action))throw new StitcherInvalidAction();
 const s:StitcherState={...state,revision:state.revision+1};
 switch(action){
  case 'ask_linen':s.introLine=1;return s;
  case 'continue_intro':s.introLine=s.introLine===0?3:s.introLine+1;return s;
  case 'check_ward':s.phase='briefing';return s;
  case 'begin_round':s.stage=2;s.phase='inspect';return s;
  case 'inspect_a':s.inspectedA=true;if(s.inspectedB)s.phase='order';return s;
  case 'inspect_b':s.inspectedB=true;if(s.inspectedA)s.phase='order';return s;
  case 'order_bleeding':case 'order_dirty':
   s.first=action==='order_bleeding'?'a':'b';s.phase='prepare';return s;
  case 'prep_cut':case 'prep_ready':
   s.prepared=action==='prep_cut'?'cut':'ready';s.phase='care';return s;
  case 'dress_a':
  case 'dress_b':
   if(action==='dress_a')s.treatedA=true;else s.treatedB=true;
   s.phase=s.treatedA&&s.treatedB?'verify':s.correction?'care':'linen_check';
   return s;
  case 'check_linen':s.phase='linen_fix';return s;
  case 'discard_end':case 'trim_end':
   s.correction=action==='discard_end'?'discard':'trim';s.phase='care';return s;
  case 'inspect_finished':s.phase='record';return s;
  case 'record_linen':s.phase='report';return s;
  case 'report_claudia':s.reportLine=1;return s;
  case 'continue_report':if(s.reportLine===1)s.reportLine=2;else s.phase='close';return s;
  case 'close_round':s.stage=3;s.phase='discovery';return s;
  case 'observe_bed':s.bedObserved=true;s.focus='bed';return s;
  case 'read_chart':s.chartRead=true;s.focus='chart';return s;
  case 'ask_patient':s.patientHeard=true;s.patientLine=0;s.focus='patient';return s;
  case 'ask_again':s.patientLine=1;s.focus='patient';return s;
  case 'continue_patient':s.patientLine=2;s.focus='patient';return s;
  case 'confront_claudia':s.phase='claudia';s.claudiaLine=0;return s;
  case 'continue_claudia':
   if(s.claudiaLine<STITCHER_CLAUDIA_LINES.length-1)s.claudiaLine++;
   else s.phase='choose';
   return s;
  case 'choose_trolley':case 'choose_consent':case 'choose_notes':
   s.branch=action==='choose_trolley'?'trolley':
    action==='choose_consent'?'consent':'notes';
   s.stage=4;s.phase='opening';s.openingLine=0;return s;
  case 'continue_opening':if(s.openingLine===0)s.openingLine=1;else s.phase='work';return s;
  case 'check_load':case 'balance_load':case 'match_consent':
  case 'check_medicine':case 'compare_admission':case 'match_schedule':
   s.taskStep++;return s;
  case 'route_short':case 'route_wide':case 'attach_record':case 'bring_witness':
  case 'copy_pages':case 'cross_reference':
   s.routeMethod=action;s.taskStep++;return s;
  case 'check_receiver':case 'mark_disputed':case 'record_difference':
   s.phase='dialogue';s.dialogueLine=0;return s;
  case 'continue_dialogue':
   if(s.dialogueLine<(STITCHER_LINES[s.branch!].length-1))s.dialogueLine++;
   else s.phase='finish';
   return s;
  case 'finish_job':
   s.stage=5;s.phase='exited';s.stage5Line=0;s.stage5Choice=null;
   s.stage5Witnessed=false;s.stage5Hold=false;s.stage5Preparation=null;return s;
  case 'ask_attendant':s.phase='attendant';s.stage5Line=0;return s;
  case 'continue_attendant':
   if((s.stage5Line??0)===0)s.stage5Line=1;
   else{s.phase='investigate';s.stage5Line=0;}
   return s;
  case 'check_transfer':case 'fetch_claudia':case 'use_finding':
   if(!s.branch)throw new StitcherInvalidAction();
   s.stage5Choice=action==='check_transfer'?'papers':
     action==='fetch_claudia'?'claudia':'evidence';
   s.phase='witness';s.stage5Line=0;return s;
  case 'continue_witness':
   if((s.stage5Line??0)===0)s.stage5Line=1;
   else{s.stage5Witnessed=true;s.phase='hold';s.stage5Line=0;}
   return s;
  case 'continue_hold':
   if(!s.stage5Witnessed)throw new StitcherInvalidAction();
   s.stage5Hold=true;s.phase='door';s.stage5Line=0;return s;
  case 'continue_owler':
   if(!s.stage5Hold)throw new StitcherInvalidAction();
   if((s.stage5Line??0)<2)s.stage5Line=(s.stage5Line??0)+1;
   else{s.phase='prepare_door';s.stage5Line=0;}
   return s;
  case 'reason_owler':case 'move_cart':case 'brace_door':
   if(!s.stage5Hold)throw new StitcherInvalidAction();
   s.stage5Preparation=action==='reason_owler'?'reason':
     action==='move_cart'?'cart':'brace';
   s.phase='door_reply';s.stage5Line=0;return s;
  case 'continue_door':
   if(!s.stage5Preparation)throw new StitcherInvalidAction();
   if(s.stage5Preparation==='reason'&&(s.stage5Line??0)===0)s.stage5Line=1;
   else{s.phase='fight_ready';s.stage5Line=0;}
   return s;
  default:throw new StitcherInvalidAction();
 }
}
