/**
 * Millhand Stage 3 approved spoken text and observable narration.
 * Canon: docs/05-gameplay/onboarding/millhand/stage-3-approved-script.md
 * No unapproved dates/number are ever interpolated into this source.
 */
import type {MissingStampBranch,MissingStampEvidence} from '@the-pall/game-core';

export const MISSING_STAMP_OPENING =
  'You hand the work paper back to Guther. On the bench, beside the council papers, are a metal plate returned with the paperwork and a folded slip. The plate is not one of the new plates you have just worked on.';

export const CANCELLATION_NARRATION =
  'You unfold the small paper. A worker number has been cancelled. The council recorded the worker as dead after a workshop fire in which the doors were locked.';
export const PLATE_NARRATION =
  "You turn the metal plate over. A worker number has been pressed into the metal. Near it is a separate mark made by a council inspector. A date is stamped beside that mark.";

export function stageThreeFinding(e:MissingStampEvidence) {
  return 'You place the slip beside the returned plate. The worker number on both is the same as one of the numbers you stamped today. The council recorded the worker as dead on ' +
    e.recordedDeathDate + ". The inspector's mark is dated " + e.inspectionDate + ' — after the recorded death.';
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
