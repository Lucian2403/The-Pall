/** Authoritative task milestones, shared immutable diary copy.
 * These helpers are called only AFTER the saved reducer confirms completion,
 * inside the character row's existing transaction. No browser archive writes. */
import type {PlateworkState,MissingStampState,SecondJobState,Stage5JournalInput} from '@the-pall/game-core';
import {AUTHORED_MISSING_STAMP_EVIDENCE,stageTwoJournal,missingStampJournal,
 secondJobJournal,stitcherWardJournal,stage5JournalEntries,
 STITCHER_STAGE_FINDINGS,bellrunnerStageFourJournal,
 wageClaimJournal,dogmanJournal,flintOwlerCombatJournal,dogmanCombatJournal,
 clinicJournal,homeJournal} from '@the-pall/game-core';
import type {StitcherState} from './stitcher-work.js';
import {STITCHER_JOB} from './stitcher-work.js';
import type {JournalWriter} from './personal-journal-store.js';
import {archiveJournalTask} from './personal-journal-store.js';

const intro=(origin:string,name:string)=>'intro/'+origin+'/'+name;

export async function archiveStitcherMilestones(db:JournalWriter,id:string,
 before:StitcherState,next:StitcherState):Promise<void>{
 if(before.stage===next.stage)return;
 // Reconstruct each stage using only facts possible during that stage,
 // even when backfilling a saved character who has reached later chapters.
 const firstStage={...next,stage:1,branch:null,first:null,prepared:null,
   correction:null,chartRead:false,patientHeard:false};
 const firstEntries=stitcherWardJournal(firstStage);
 const secondEntries=stitcherWardJournal({...next,stage:2,branch:null,
   chartRead:false,patientHeard:false});
 if(before.stage===1&&next.stage===2){
  await archiveJournalTask(db,id,{taskId:'stitcher-opening',taskInstanceId:intro('stitcher','opening'),
   stage:1,title:'Claudia Cyka',paragraphs:firstEntries});
 }
 if(before.stage===2&&next.stage===3){
  const complete=secondEntries;
  await archiveJournalTask(db,id,{taskId:'morning-dressings',
   taskInstanceId:intro('stitcher','morning-dressings'),stage:2,title:'Morning Dressings',
   paragraphs:complete.slice(firstEntries.length),
   choices:{patientOrder:next.first??'',linen:next.prepared??'',correction:next.correction??''}});
 }
 if(before.stage===3&&next.stage===4){
  const complete=stitcherWardJournal({...next,stage:3,phase:'choose'});
  await archiveJournalTask(db,id,{taskId:'teaching-bed',
   taskInstanceId:intro('stitcher','teaching-bed'),stage:3,title:'The Teaching Bed',
   paragraphs:complete.slice(secondEntries.length),choices:{route:next.branch??''}});
 }
 if(before.stage===4&&next.stage===5&&next.branch){
  await archiveJournalTask(db,id,{taskId:'second-job',
   taskInstanceId:intro('stitcher','second-job'),stage:4,title:STITCHER_JOB[next.branch],
   paragraphs:[STITCHER_STAGE_FINDINGS[next.branch]],
   choices:{route:next.branch,method:next.routeMethod??''}});
 }
}
export async function archiveStitcherDoor(db:JournalWriter,id:string,
 state:Stage5JournalInput):Promise<void>{
 if(state.stage!==5||state.phase!=='fight_ready'||!state.stage5Hold||
   !state.stage5Witnessed||!state.stage5Preparation)return;
 await archiveJournalTask(db,id,{taskId:'night-door',
  taskInstanceId:intro('stitcher','night-door'),stage:5,
  title:'The Empty Sheet / The Night Door',
  paragraphs:stage5JournalEntries(state),
  choices:{route:state.branch??'',preparation:state.stage5Preparation,
    evidence:state.stage5Choice??''}});
}
export async function archiveMillhandWork(db:JournalWriter,id:string,
 state:PlateworkState):Promise<void>{
 if(state.phase!=='COMPLETE')return;
 await archiveJournalTask(db,id,{taskId:'marking-plates',
  taskInstanceId:intro('millhand','marking-plates'),stage:2,title:'Marking the Plates',
  paragraphs:stageTwoJournal(state),
  choices:{handling:state.handling??'',correction:state.correction??''}});
}
export async function archiveMillhandMissingStamp(db:JournalWriter,id:string,
 state:MissingStampState):Promise<void>{
 if(state.phase!=='SELECTED'||!state.branch)return;
 const e=AUTHORED_MISSING_STAMP_EVIDENCE;
 const partial=state.slipRead?{
   workerNumber:e?.workerNumber??null,recordedDeathDate:e?.recordedDeathDate??null}:null;
 const plate=state.plateRead?{
   workerNumber:e?.workerNumber??null,inspectionDate:e?.inspectionDate??null}:null;
 const evidence=state.slipRead&&state.plateRead?{
   workerNumber:e?.workerNumber??null,recordedDeathDate:e?.recordedDeathDate??null,
   inspectionDate:e?.inspectionDate??null}:null;
 await archiveJournalTask(db,id,{taskId:'missing-stamp',
  taskInstanceId:intro('millhand','missing-stamp'),stage:3,title:'The Missing Stamp',
  paragraphs:missingStampJournal(state,evidence,partial,plate),
  choices:{route:state.branch}});
}
export async function archiveMillhandSecondJob(db:JournalWriter,id:string,
 state:SecondJobState):Promise<void>{
 if(state.phase!=='DONE'&&state.phase!=='EXITED')return;
 const title={restamp:'Depot Intake Run',contracts:'The Contracts Office',
  records:'Council Records'}[state.branch];
 await archiveJournalTask(db,id,{taskId:'second-job',
  taskInstanceId:intro('millhand','second-job'),stage:4,title,
  paragraphs:secondJobJournal(state),
  choices:{route:state.branch,transport:state.transport??'',receipt:state.receipt??'',
   challenge:state.challenge??'',source:state.source??''}});
}
export async function archiveBellrunnerSecondJob(db:JournalWriter,id:string,
 state:Parameters<typeof bellrunnerStageFourJournal>[0]):Promise<void>{
 if(state.phase!=='done'&&state.phase!=='exited')return;
 const title={contracts:'Attendance Dispute',trauma:'The First-Aid Point',
  machinery:'Industrial Machinery'}[state.branch];
 await archiveJournalTask(db,id,{taskId:'second-job',
  taskInstanceId:intro('bellrunner','second-job'),stage:4,title,
  paragraphs:bellrunnerStageFourJournal(state),
  choices:{route:state.branch,method:state.method??''}});
}

/** Server-confirmed confrontation, not merely advancing a stage number. */
export async function archiveMillhandConfrontation(db:JournalWriter,id:string,
 state:Parameters<typeof wageClaimJournal>[0]):Promise<void>{
 if(state.phase!=='DONE'||!state.stance)return;
 await archiveJournalTask(db,id,{taskId:'confrontation',
  taskInstanceId:intro('millhand','confrontation'),stage:5,title:'The Wage Claim',
  paragraphs:wageClaimJournal(state),
  choices:{route:state.branch,stance:state.stance,approach:state.approach??''}});
}
export async function archiveBellrunnerConfrontation(db:JournalWriter,id:string,
 state:Parameters<typeof dogmanJournal>[0]):Promise<void>{
 if(state.phase!=='done'||!state.stance)return;
 await archiveJournalTask(db,id,{taskId:'confrontation',
  taskInstanceId:intro('bellrunner','confrontation'),stage:5,title:'Show Your Papers',
  paragraphs:dogmanJournal(state),
  choices:{route:state.branch,stance:state.stance,reply:state.reply??''}});
}
type CombatJournalState=Parameters<typeof flintOwlerCombatJournal>[0] & {status:string};
export async function archiveFinishedCombat(db:JournalWriter,id:string,
 origin:'Millhand'|'Bellrunner'|'Stitcher',state:CombatJournalState):Promise<void>{
 if(state.status!=='finished'||!
   (state.outcome==='player_victory'||state.outcome==='player_defeat'))return;
 const title=origin==='Millhand'?'The Fight with Flint':
  origin==='Bellrunner'?'The Fight with Dogman':'The Fight with Owler';
 const introLine=origin==='Millhand'
  ?"Flint blocked the way home with his club. I told him to move. He wouldn't. So we fought."
  :origin==='Bellrunner'
   ?"Dogman blocked the service gate. He wouldn't let me past, and we fought."
   :"Owler tried to force the patient through the night door. I stood in his way, and we fought.";
 const body=origin==='Bellrunner'?dogmanCombatJournal(state):
  flintOwlerCombatJournal(state,origin==='Stitcher');
 await archiveJournalTask(db,id,{taskId:'combat',
  taskInstanceId:intro(origin.toLowerCase(),'combat'),stage:6,title,
  paragraphs:[introLine,body],choices:{opponent:title},
  outcome:state.outcome});
}
type ClinicSave={phase:string;paid:boolean;outcome:'player_victory'|'player_defeat';
 before:{hp:number;hpMax:number;bleed:number;wounds:readonly {type:string}[]}};
export async function archiveCompletedClinic(db:JournalWriter,id:string,
 origin:'Millhand'|'Bellrunner',state:ClinicSave):Promise<void>{
 if(state.phase!=='LEFT'||!state.paid)return;
 const conditionType=state.before.hp===state.before.hpMax&&
  state.before.bleed===0&&state.before.wounds.length===0?'unhurt':
  state.before.wounds.some(w=>w.type==='cut')?'cut':'other';
 await archiveJournalTask(db,id,{taskId:'clinic',
  taskInstanceId:intro(origin.toLowerCase(),'clinic'),stage:7,title:'The Clinic',
  paragraphs:[clinicJournal(origin,{paid:true,conditionType,outcome:state.outcome})],
  choices:{care:conditionType,paid:'10 coins'},outcome:state.outcome});
}
export async function archiveCompletedHome(db:JournalWriter,id:string,
 state:Parameters<typeof homeJournal>[0] & {phase:string}):Promise<void>{
 if(!state||state.phase!=='COMPLETE'||
   (state.origin!=='Millhand'&&state.origin!=='Bellrunner'))return;
 const origin=state.origin.toLowerCase();
 const diary=homeJournal(state);
 await archiveJournalTask(db,id,{taskId:'rented-home',
  taskInstanceId:intro(origin,'home'),stage:8,title:'The Rented Home',
  paragraphs:[diary.homeJournalIntro,...[diary.routeEntry,diary.combatEntry].filter(
    (entry):entry is string=>typeof entry==='string')],
  choices:{route:state.branch},outcome:state.outcome});
}
