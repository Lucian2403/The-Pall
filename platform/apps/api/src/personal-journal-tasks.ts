/** Canonical task identity + diary copy used for live archival and legacy
 * reconstruction. No stage transitions, grants or independent completion logic. */
import type {PlateworkState,MissingStampState,SecondJobState} from '@the-pall/game-core';
import type {CombatState} from '@the-pall/game-core/combat-v0.5.1';
import {combatJournal,combatOpening,type DiaryEncounter} from '../../web/src/lib/combat-journal-copy.js';
import {AUTHORED_MISSING_STAMP_EVIDENCE,validateMissingStampEvidence} from '@the-pall/game-core';
import type {StitcherState} from './stitcher-work.js';
import type {StageFourState} from './bellrunner-second-job-work.js';
import type {CompletedJournalTask} from './personal-journal-store.js';
import {stitcherStageJournal} from '../../web/src/lib/stitcher-journal.js';
import {STITCHER_STAGE_TITLES,STITCHER_ROUTE_UI} from '../../web/src/lib/stitcher-ward-copy.js';
import {stageTwoJournal} from '../../web/src/lib/millhand-work-copy.js';
import {missingStampJournal} from '../../web/src/lib/approved-stage-three.js';
import {STAGE_FOUR_ROUTES,secondJobJournal} from '../../web/src/lib/approved-stage-four.js';
import {bellrunnerStageFourJournal} from '../../web/src/lib/bellrunner-stage4-journal.js';
import {BELLRUNNER_STAGE_FOUR} from '../../web/src/lib/bellrunner-stage4-copy.js';

const identity=(characterId:string,stage:number)=>({
 characterId,taskInstanceId:'tutorial:stage:'+stage,stage
});

export function stitcherTask(
 characterId:string,s:StitcherState,stage:1|2|3|4|5
):CompletedJournalTask{
 const title=stage===4&&s.branch?STITCHER_ROUTE_UI[s.branch].title:
   STITCHER_STAGE_TITLES[stage];
 return {...identity(characterId,stage),taskId:'stitcher.stage.'+stage,title,
  paragraphs:stitcherStageJournal(s,stage),
  choices:s.branch?{route:STITCHER_ROUTE_UI[s.branch].title}:{}
 };
}
export function plateworkTask(characterId:string,s:PlateworkState):CompletedJournalTask{
 return {...identity(characterId,2),taskId:'millhand.marking-plates',
  title:'Marking the Plates',paragraphs:stageTwoJournal(s)};
}
export function missingStampTask(characterId:string,s:MissingStampState):CompletedJournalTask{
 const authored=AUTHORED_MISSING_STAMP_EVIDENCE;
 const evidence=authored&&validateMissingStampEvidence(authored)?authored:null;
 const slip=s.slipRead?{
  workerNumber:evidence?.workerNumber??null,
  recordedDeathDate:evidence?.recordedDeathDate??null
 }:null;
 const plate=s.plateRead?{
  workerNumber:evidence?.workerNumber??null,
  inspectionDate:evidence?.inspectionDate??null
 }:null;
 return {...identity(characterId,3),taskId:'millhand.missing-stamp',
  title:'The Missing Stamp',
  paragraphs:missingStampJournal(s,s.slipRead&&s.plateRead?evidence:null,slip,plate),
  choices:s.branch?{route:s.branch}:{}};
}
export function millhandSecondJobTask(characterId:string,s:SecondJobState):CompletedJournalTask{
 return {...identity(characterId,4),taskId:'millhand.second-job',
  title:STAGE_FOUR_ROUTES[s.branch].name,
  paragraphs:secondJobJournal(s),choices:{route:s.branch}};
}
export function bellrunnerSecondJobTask(characterId:string,s:StageFourState):CompletedJournalTask{
 return {...identity(characterId,4),taskId:'bellrunner.second-job',
  title:BELLRUNNER_STAGE_FOUR[s.branch].title,
  paragraphs:bellrunnerStageFourJournal(s),choices:{route:s.branch}};
}

export function combatTask(
 characterId:string,encounter:DiaryEncounter,s:CombatState
):CompletedJournalTask{
 if(s.status!=='finished'||(s.outcome!=='player_victory'&&s.outcome!=='player_defeat'))
  throw new Error('journal_requires_committed_combat_outcome');
 const tough=s.player.hp<=s.player.hpMax/2||
  s.player.wounds.some(wound=>wound.severity==='serious');
 const title=encounter==='owler'?'The Fight with Owler'
  :encounter==='dogman'?'The Fight with Dogman':'The Fight with Flint';
 return {...identity(characterId,6),taskId:encounter+'.combat',
  title,paragraphs:[combatOpening(encounter),combatJournal(encounter,s.outcome,tough)],
  outcome:s.outcome};
}
