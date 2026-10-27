/** Deterministic *technical fixture*; it does not grant coins/XP/items. */
export type FixtureState = Readonly<{revision: number; value: number}>;
export function advanceFixture(state: FixtureState): FixtureState {
  if (!Number.isSafeInteger(state.revision) || !Number.isSafeInteger(state.value)) throw new Error('invalid_fixture_state');
  if (state.revision < 0 || state.value < 0 || state.revision >= Number.MAX_SAFE_INTEGER || state.value >= Number.MAX_SAFE_INTEGER) throw new Error('invalid_fixture_state');
  return {revision: state.revision + 1, value: state.value + 1};
}

export {ORIGIN_CATALOGUE, APPROVED_STARTING_FACTS, previewCharacterStart} from './character-creation.js';
export type {Origin, CharacterSex} from './character-creation.js';

export {INITIAL_PLATEWORK, WORK_ACTIONS, WORK_ACTION_OBJECT, availableActions, advancePlatework, PlateworkInvalidAction} from './millhand-platework.js';
export type {PlateworkState, PlateworkAction, WorkPhase, Handling, Correction} from './millhand-platework.js';

export {AUTHORED_MISSING_STAMP_EVIDENCE,INITIAL_MISSING_STAMP,MISSING_STAMP_ACTIONS,MISSING_STAMP_ROUTE_SKILL,STAGE_THREE_DIALOGUE_BEAT_COUNT,availableMissingStampActions,advanceMissingStamp,validateMissingStampEvidence,MissingStampInvalidAction} from './millhand-missing-stamp.js';
export type {MissingStampState,MissingStampPhase,MissingStampAction,MissingStampBranch,MissingStampEvidence} from './millhand-missing-stamp.js';
