/** Authoritative task milestones, shared immutable diary copy.
 * These helpers are called only AFTER the saved reducer confirms completion,
 * inside the character row's existing transaction. No browser archive writes. */
import type {PlateworkState,MissingStampState,SecondJobState,Stage5JournalInput} from '@the-pall/game-core';
import {AUTHORED_MISSING_STAMP_EVIDENCE,stageTwoJournal,missingStampJournal,
 secondJobJournal,stitcherWardJournal,stage5JournalEntries,
 STITCHER_STAGE_FINDINGS,bellrunnerStageFourJournal} from '@the-pall/game-core';
import type {StitcherState} from './stitcher-work.js';
import {STITCHER_JOB} from './stitcher-work.js';
import type {JournalWriter} from './personal-journal-store.js';
import {archiveJournalTask} from './personal-journal-store.js';

const intro=(origin:string,name:string)=>'intro/'+origin+'/'+name;

export async function archiveStitcherMilestones(db:JournalWriter,id:string,
 before:StitcherState,next:StitcherState):Promise<void>{
 if(before.stage===next.stage)return;
 if(before.stage===1&&next.stage===2){
  await archiveJournalTask(db,id,{taskId:'stitcher-opening',taskInstanceId:intro('stitcher','opening'),
   stage:1,title:'Claudia Cyka',paragraphs:stitcherWardJournal({...next,stage:1,branch:null})});
 }
 if(before.stage===2&&next.stage===3){
  const earlier=stitcherWardJournal({...next,stage:1,branch:null});
  const complete=stitcherWardJournal({...next,stage:2,branch:null});
  await archiveJournalTask(db,id,{taskId:'morning-dressings',
   taskInstanceId:intro('stitcher','morning-dressings'),stage:2,title:'Morning Dressings',
   paragraphs:complete.slice(earlier.length),
   choices:{patientOrder:next.first??'',linen:next.prepared??'',correction:next.correction??''}});
 }
 if(before.stage===3&&next.stage===4){
  const earlier=stitcherWardJournal({...next,stage:2,branch:null});
  const complete=stitcherWardJournal({...next,stage:3,phase:'choose'});
  await archiveJournalTask(db,id,{taskId:'teaching-bed',
   taskInstanceId:intro('stitcher','teaching-bed'),stage:3,title:'The Teaching Bed',
   paragraphs:complete.slice(earlier.length),choices:{route:next.branch??''}});
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
