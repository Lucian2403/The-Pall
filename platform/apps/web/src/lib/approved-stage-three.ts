/**
 * Millhand Stage 3 approved spoken text and observable narration.
 * Canon: docs/05-gameplay/onboarding/millhand/stage-3-approved-script.md
 * No unapproved dates/number are ever interpolated into this source.
 */
import type {MissingStampBranch} from '@the-pall/game-core';

/** Spoken immediately after the saved Return the work paper action, before
 * either evidence item is inspected. No mystery revelation yet.
 */
export const MISSING_STAMP_HANDOFF =
  "All finished, are you? Good. Leave the work paper here. There's a returned plate and a folded slip in with this lot. Have a look at them before I send anything off.";

export const MISSING_STAMP_OPENING =
  'Guther sets your finished work paper beside the council bundle. A returned metal plate and a folded slip lie among the papers. The plate is not one of the new plates you have just stamped.';

export const CANCELLATION_NARRATION =
  'You unfold the small paper. A worker number has been cancelled. The council recorded the worker as dead after a workshop fire in which the doors were locked.';
export const PLATE_NARRATION =
  "You turn the metal plate over. A worker number has been pressed into the metal. Near it is a separate mark made by a council inspector. A date is stamped beside that mark.";

/** Relative date evidence is readable without requiring a calendar minigame.
 * Once canonical dates exist, they appear in the popup; the art never requires them.
 */
export type ReadableMissingStampEvidence = Readonly<{
  workerNumber:string|null;
  recordedDeathDate:string|null;
  inspectionDate:string|null;
}>;
export function stageThreeFinding(e:ReadableMissingStampEvidence) {
  const comparison = e.recordedDeathDate && e.inspectionDate
    ? 'The death was recorded on ' + e.recordedDeathDate +
      ". The inspector's mark is dated " + e.inspectionDate + ', after the recorded death.'
    : "The death record carries an earlier date than the inspector's mark on the plate.";
  return 'You place the slip beside the returned plate. The number on both is the same as one of the numbers you stamped today. ' + comparison;
}

export const MISSING_STAMP_CONFRONTATION = [
  {speaker:'Player',text:"Guther, the council says this worker died in the fire. It's the same number we stamped."},
  {speaker:'Guther',text:'Let me see.'},
  {speaker:'The workshop',text:'Guther reads the slip and turns the returned plate to check the number and date.',kind:'narration'},
  {speaker:'Player',text:"Look at the inspector's date. It's after the man's death."},
  {speaker:'Guther',text:'Aye. Same number, and that date is later.'},
  {speaker:'Player',text:'Then why were we told to stamp his number?'},
  {speaker:'Guther',text:"I don't know. And I can't sign this lot, not after seeing those dates. The council won't pay us till they settle it."},
  {speaker:'Player',text:"So that's all we're going to do?"},
  {speaker:'Guther',text:"I didn't write those records. What do you want me to do?"}
] as const;

export const MISSING_STAMP_ROUTES: Readonly<Record<MissingStampBranch, {
  choice:string; response:string; consequence:string; label:string
}>> = {
  restamp: {
    label:'Industry / Hauling',
    choice:"I'll stamp the worker number again. Then I'll take the plates to the depot.",
    response:"Only the worker number. Leave the inspector's mark alone. Take the lot to the depot when you're done. I won't sign to say the lot is approved.",
    consequence:'You return to the bench for one more worker-number mark before taking the lot to the depot.'
  },
  contracts: {
    label:'Commerce / Contracts',
    choice:"Then I want to know why they sent us a dead man's number.",
    response:"Go to the council's Contracts office. They sent the work paper. Ask them.",
    consequence:"You take the disputed work paper to the council's Contracts office."
  },
  records: {
    label:'Scholarship / Investigation',
    choice:"I'll write down the number and check the records myself.",
    response:"All right. I've got no other records here.",
    consequence:"You keep a note of the worker number and prepare to look through the council's records."
  }
};

/**
 * Approved factual first-person journal, derived from persisted inspections.
 * Never substitute example dates or unapproved bracket placeholders in-game.
 */
export function missingStampJournal(
  state:{slipRead:boolean;plateRead:boolean;phase:string;branch:string|null},
  evidence:ReadableMissingStampEvidence|null,
  slip:{workerNumber:string|null;recordedDeathDate:string|null}|null,
  plate:{workerNumber:string|null;inspectionDate:string|null}|null
):readonly string[] {
  const entries:string[] = [
    'I returned the finished work paper to Guther. A returned plate and a folded cancellation slip were with the council\'s papers.'
  ];
  if(slip && state.slipRead)
    entries.push('I read the cancellation slip. The council recorded a worker as dead after a fire in a locked workshop.'+
      (slip.workerNumber ? ' The worker number was '+slip.workerNumber+'.' : '')+
      (slip.recordedDeathDate ? ' The recorded death date was '+slip.recordedDeathDate+'.' : ''));
  if(plate && state.plateRead)
    entries.push("I examined a returned plate with a council inspector's mark."+
      (plate.workerNumber ? ' The worker number was '+plate.workerNumber+'.' : '')+
      (plate.inspectionDate ? ' The mark was dated '+plate.inspectionDate+'.' : ''));
  if(evidence && state.slipRead && state.plateRead)
    entries.push('Both records carry the same worker number as a plate I stamped. The inspection date is later than the recorded death.');
  if(state.phase==='DECISION'||state.branch!==null)
    entries.push('I showed Guther the records. He could not explain the dates. He would not approve the disputed lot, and the council had not paid us.');
  if(state.branch==='restamp')
    entries.push('I chose to stamp the worker number again and deliver the lot to the depot. The inspector\'s mark is not part of my work.');
  if(state.branch==='contracts')
    entries.push('I chose to take the disputed work paper to the council\'s Contracts office.');
  if(state.branch==='records')
    entries.push('I wrote down the worker number and chose to check the council\'s records.');
  return entries;
}
