/**
 * Approved Millhand Stage 2 platework work sequence.
 * Canon: docs/05-gameplay/onboarding/millhand/stage-2-approved-script.md
 * Mechanics: docs/05-gameplay/onboarding/millhand/platework-interaction.md
 *
 * No serial number, elapsed time, material count, coins, XP, item mint or
 * outcome probability is invented here. The authored required number remains
 * an explicit data gate; the player matches the stamps conceptually to the
 * work paper until authoritative mark data exists.
 */
export type WorkPhase =
  | 'READ_PAPER' | 'SET_STAMPS' | 'HANDLE_BENT_PLATE' | 'STAMP'
  | 'INSPECT' | 'CORRECT' | 'REVIEW' | 'RETURN_PAPER' | 'COMPLETE';

export type Handling = 'straighten' | 'replace' | 'stamp_as_is';
export type Correction = 'fix_mark' | 'replace_marked_plate';
export type PlateworkAction =
  | 'read_paper' | 'set_stamps' | 'look_at_bent_plate'
  | 'straighten' | 'replace' | 'stamp_as_is'
  | 'stamp_number' | 'check_number'
  | 'fix_mark' | 'replace_marked_plate'
  | 'finish_checking' | 'return_paper';

export type PlateworkState = Readonly<{
  phase: WorkPhase;
  revision: number;
  handling: Handling | null;
  bentPlateExamined: boolean;
  correction: Correction | null;
  markQuality: 'UNMARKED' | 'CLEAR' | 'POOR';
  lastAction: PlateworkAction | null;
}>;

export const INITIAL_PLATEWORK: PlateworkState = {
  phase: 'READ_PAPER', revision: 0, handling: null,
  bentPlateExamined: false, correction: null,
  markQuality: 'UNMARKED', lastAction: null
};

export const WORK_ACTIONS = [
  'read_paper', 'set_stamps', 'look_at_bent_plate',
  'straighten', 'replace', 'stamp_as_is', 'stamp_number',
  'check_number', 'fix_mark', 'replace_marked_plate',
  'finish_checking', 'return_paper'
] as const satisfies readonly PlateworkAction[];

export const WORK_ACTION_OBJECT: Readonly<Record<PlateworkAction, 'paper' | 'stamps' | 'plates' | 'hammer'>> = {
  read_paper: 'paper',
  set_stamps: 'stamps',
  look_at_bent_plate: 'plates',
  straighten: 'plates',
  replace: 'plates',
  stamp_as_is: 'plates',
  stamp_number: 'hammer',
  check_number: 'plates',
  fix_mark: 'plates',
  replace_marked_plate: 'plates',
  finish_checking: 'paper',
  return_paper: 'paper'
};

export function availableActions(s: PlateworkState): readonly PlateworkAction[] {
  switch (s.phase) {
    case 'READ_PAPER': return ['read_paper'];
    case 'SET_STAMPS': return ['set_stamps'];
    case 'HANDLE_BENT_PLATE':
      return s.bentPlateExamined
        ? ['straighten', 'replace', 'stamp_as_is']
        : ['look_at_bent_plate'];
    case 'STAMP': return ['stamp_number'];
    case 'INSPECT': return ['check_number'];
    case 'CORRECT': return ['fix_mark', 'replace_marked_plate'];
    case 'REVIEW': return ['finish_checking'];
    case 'RETURN_PAPER': return ['return_paper'];
    case 'COMPLETE': return [];
  }
}

export class PlateworkInvalidAction extends Error {
  constructor() {super('wrong_work_phase');}
}

/** Server must store the returned state in one transaction with the receipt. */
export function advancePlatework(s: PlateworkState, action: PlateworkAction): PlateworkState {
  if (!Number.isSafeInteger(s.revision) || s.revision < 0 || s.revision >= Number.MAX_SAFE_INTEGER
    || !availableActions(s).includes(action)) throw new PlateworkInvalidAction();

  let phase: WorkPhase = s.phase;
  let handling = s.handling;
  let bentPlateExamined = s.bentPlateExamined;
  let correction = s.correction;
  let markQuality = s.markQuality;

  switch (action) {
    case 'read_paper': phase = 'SET_STAMPS'; break;
    case 'set_stamps': phase = 'HANDLE_BENT_PLATE'; break;
    case 'look_at_bent_plate': bentPlateExamined = true; break;
    case 'straighten':
    case 'replace':
    case 'stamp_as_is':
      handling = action;
      phase = 'STAMP';
      break;
    case 'stamp_number': phase = 'INSPECT'; break;
    case 'check_number':
      markQuality = handling === 'stamp_as_is' ? 'POOR' : 'CLEAR';
      phase = markQuality === 'POOR' ? 'CORRECT' : 'REVIEW';
      break;
    case 'fix_mark':
    case 'replace_marked_plate':
      correction = action;
      markQuality = 'CLEAR';
      phase = 'REVIEW';
      break;
    case 'finish_checking': phase = 'RETURN_PAPER'; break;
    case 'return_paper': phase = 'COMPLETE'; break;
  }

  return {
    phase, revision: s.revision + 1,
    handling, bentPlateExamined, correction, markQuality, lastAction: action
  };
}
