/** Safe replay of archival from verified, still-present task state.
 * This is run by an explicit maintenance command, never by a journal GET.
 * Every lookup is anchored to the locked character ID. */
import type pg from 'pg';
import type {PlateworkState,MissingStampState,SecondJobState} from '@the-pall/game-core';
import type {CombatState} from '@the-pall/game-core/combat-v0.5.1';
import type {StitcherState} from './stitcher-work.js';
import type {StageFourState} from './bellrunner-second-job-work.js';
import type {DispatchState} from './bellrunner-dispatch-work.js';
import type {BellState} from './bellrunner-wrong-bell-work.js';
import {archiveJournalTask} from './personal-journal-store.js';
import {stitcherTask,plateworkTask,missingStampTask,millhandSecondJobTask,
  bellrunnerSecondJobTask,combatTask,clinicTask,homeTask,
  bellrunnerDispatchTask,bellrunnerWrongBellTask} from './personal-journal-tasks.js';
import type {ClinicState} from './millhand-clinic-state.js';
import type {State as HomeState} from './shared-home-state.js';

async function savedState<T>(client:pg.PoolClient,table:string,id:string):Promise<T|null>{
 // The table is a fixed internal name, never a user-supplied identifier.
 const result=await client.query<{state:T}>(
  'SELECT state FROM '+table+' WHERE character_id=$1',[id]);
 return result.rows[0]?.state??null;
}
export async function backfillCharacterJournal(
 client:pg.PoolClient,character:{id:string;origin:string;tutorial_stage:number}
):Promise<void>{
 const id=character.id;
 if(character.origin==='Stitcher'){
  const ward=await savedState<StitcherState>(client,'player_character_stitcher_ward',id);
  if(ward){
   for(const stage of [1,2,3,4] as const){
    if(ward.stage>stage)await archiveJournalTask(client,stitcherTask(id,ward,stage));
   }
   if(character.tutorial_stage>=6&&ward.stage===5&&ward.phase==='fight_ready'&&
      ward.stage5Witnessed===true&&ward.stage5Hold===true&&ward.stage5Preparation)
    await archiveJournalTask(client,stitcherTask(id,ward,5));
  }
  const owler=await savedState<CombatState>(client,'player_character_owler_combat',id);
  if(owler?.status==='finished')await archiveJournalTask(client,combatTask(id,'owler',owler));
 }else if(character.origin==='Millhand'){
  const plate=await savedState<PlateworkState>(client,'player_character_platework',id);
  if(plate?.phase==='COMPLETE')await archiveJournalTask(client,plateworkTask(id,plate));
  const stamp=await savedState<MissingStampState>(client,'player_character_missing_stamp',id);
  if(stamp?.phase==='SELECTED'&&stamp.branch)
    await archiveJournalTask(client,missingStampTask(id,stamp));
  const job=await savedState<SecondJobState>(client,'player_character_second_job',id);
  if(job?.phase==='EXITED')await archiveJournalTask(client,millhandSecondJobTask(id,job));
  const flint=await savedState<CombatState>(client,'player_character_flint_combat',id);
  if(flint?.status==='finished')await archiveJournalTask(client,combatTask(id,'flint',flint));
 }else if(character.origin==='Bellrunner'){
  const dispatch=await client.query<{work_state:DispatchState}>(
   'SELECT work_state FROM player_character_bellrunner_dispatch WHERE character_id=$1',[id]);
  const route=dispatch.rows[0]?.work_state;
  if(route?.phase==='final_notice_taken')
   await archiveJournalTask(client,bellrunnerDispatchTask(id,route));
  const bell=await savedState<BellState>(client,'player_character_bellrunner_wrong_bell',id);
  if(bell?.phase==='committed'&&bell.branch)
   await archiveJournalTask(client,bellrunnerWrongBellTask(id,bell));
  const job=await savedState<StageFourState>(client,'player_character_bellrunner_second_job',id);
  if(job?.phase==='exited')await archiveJournalTask(client,bellrunnerSecondJobTask(id,job));
  const dogman=await savedState<CombatState>(client,'player_character_dogman_combat',id);
  if(dogman?.status==='finished')await archiveJournalTask(client,combatTask(id,'dogman',dogman));
 }
 if(character.origin==='Millhand'||character.origin==='Bellrunner'){
  const clinic=await savedState<ClinicState>(client,'player_character_clinic',id);
  if(clinic?.phase==='LEFT'&&clinic.paid)
   await archiveJournalTask(client,clinicTask(id,character.origin,clinic));
  const home=await savedState<HomeState>(client,'player_character_tutorial_home',id);
  if(home?.phase==='COMPLETE')
   await archiveJournalTask(client,homeTask(id,home));
 }
}
