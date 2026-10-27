/**
 * Millhand Stage 3 - owner-approved Missing Stamp mechanics.
 * Canon: docs/05-gameplay/onboarding/millhand/stage-3-approved-script.md
 * Stampwork is a reusable physical interaction, not a number-matching puzzle.
 * The date contradiction is narrative evidence: exact digits and dates can
 * be authored later in the popup, but they never block Stage 3 progression.
 * UI dialogue text stays in approved-stage-three.ts; this is only state.
 */
export type MissingStampBranch = 'restamp' | 'contracts' | 'records';
export type MissingStampPhase = 'INSPECT' | 'READY_TO_SPEAK' | 'CONFRONT' | 'DECISION' | 'RESTAMP' | 'SELECTED';
export type MissingStampAction =
  | 'read_cancellation_slip' | 'turn_returned_plate'
  | 'show_guther' | 'continue_dialogue' | 'skip_confrontation'
  | 'choose_restamp' | 'choose_contracts' | 'choose_records'
  | 'restamp_worker_number';

export type MissingStampEvidence = Readonly<{
  workerNumber: string;
  recordedDeathDate: string;
  inspectionDate: string;
}>;

// Optional display-only record detail. No player-supplied number or date;
// exact values are not required for the already-approved narrative finding.
// If later authored, use the same value on both records and Stage 2 display.
export const AUTHORED_MISSING_STAMP_EVIDENCE: MissingStampEvidence | null = null;

export function validateMissingStampEvidence(e: MissingStampEvidence): boolean {
  if (!/^[A-Za-z0-9][A-Za-z0-9 /.-]{0,31}$/.test(e.workerNumber)) return false;
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso.test(e.recordedDeathDate) || !iso.test(e.inspectionDate)) return false;
  function validDate(s: string) {
    const dt = new Date(s + 'T00:00:00Z');
    return !Number.isNaN(dt.getTime()) && dt.toISOString().slice(0, 10) === s;
  }
  return validDate(e.recordedDeathDate) && validDate(e.inspectionDate)
    && e.inspectionDate > e.recordedDeathDate;
}

export const STAGE_THREE_DIALOGUE_BEAT_COUNT = 9 as const;
export type MissingStampState = Readonly<{
  revision: number;
  phase: MissingStampPhase;
  slipRead: boolean;
  plateRead: boolean;
  dialogueIndex: number;
  branch: MissingStampBranch | null;
  lastAction: MissingStampAction | null;
}>;

export const INITIAL_MISSING_STAMP: MissingStampState = {
  revision: 0, phase: 'INSPECT', slipRead: false, plateRead: false,
  dialogueIndex: 0, branch: null, lastAction: null
};

export const MISSING_STAMP_ACTIONS = [
  'read_cancellation_slip', 'turn_returned_plate',
  'show_guther', 'continue_dialogue', 'skip_confrontation',
  'choose_restamp', 'choose_contracts', 'choose_records',
  'restamp_worker_number'
] as const satisfies readonly MissingStampAction[];

export function availableMissingStampActions(
  s: MissingStampState, evidence: MissingStampEvidence | null
): readonly MissingStampAction[] {
  switch (s.phase) {
    case 'INSPECT': {
      const actions: MissingStampAction[] = [];
      if (!s.slipRead) actions.push('read_cancellation_slip');
      if (!s.plateRead) actions.push('turn_returned_plate');
      return actions;
    }
    case 'READY_TO_SPEAK': return ['show_guther'];
    case 'CONFRONT': return ['continue_dialogue','skip_confrontation'];
    case 'DECISION': return ['choose_restamp', 'choose_contracts', 'choose_records'];
    case 'RESTAMP': return ['restamp_worker_number'];
    case 'SELECTED': return [];
  }
}
export class MissingStampInvalidAction extends Error {
  constructor() { super('wrong_stage_three_phase'); }
}

export function advanceMissingStamp(
  s: MissingStampState, action: MissingStampAction,
  evidence: MissingStampEvidence | null
): MissingStampState {
  if (!Number.isSafeInteger(s.revision) || s.revision < 0 || s.revision >= Number.MAX_SAFE_INTEGER
      || !availableMissingStampActions(s, evidence).includes(action)) throw new MissingStampInvalidAction();
  let {phase,slipRead,plateRead,dialogueIndex,branch} = s;
  switch (action) {
    case 'read_cancellation_slip': slipRead = true; break;
    case 'turn_returned_plate': plateRead = true; break;
    case 'show_guther': phase = 'CONFRONT'; dialogueIndex = 0; break;
    case 'skip_confrontation': phase = 'DECISION'; break;
    case 'continue_dialogue':
      if (dialogueIndex < STAGE_THREE_DIALOGUE_BEAT_COUNT - 1) dialogueIndex += 1;
      else phase = 'DECISION';
      break;
    case 'choose_restamp': branch = 'restamp'; phase = 'RESTAMP'; break;
    case 'choose_contracts': branch = 'contracts'; phase = 'SELECTED'; break;
    case 'choose_records': branch = 'records'; phase = 'SELECTED'; break;
    case 'restamp_worker_number': phase = 'SELECTED'; break;
  }
  if (phase === 'INSPECT' && slipRead && plateRead) phase = 'READY_TO_SPEAK';
  return {revision:s.revision+1,phase,slipRead,plateRead,dialogueIndex,branch,lastAction:action};
}

export const MISSING_STAMP_ROUTE_SKILL: Readonly<Record<MissingStampBranch,string>> = {
  restamp: 'Industry', contracts: 'Commerce', records: 'Scholarship'
};
