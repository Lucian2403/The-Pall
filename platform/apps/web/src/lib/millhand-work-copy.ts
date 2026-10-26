/**
 * Stage 2 R03 player-facing copy. Canon:
 * docs/05-gameplay/onboarding/millhand/stage-2-approved-script.md
 * No invented serial number, timestamps or material quantities.
 */
import type {PlateworkAction, PlateworkState, WorkPhase} from '@the-pall/game-core';
export type ObjectKey = 'paper' | 'stamps' | 'plates' | 'hammer';

export const PHASE_INSTRUCTION: Readonly<Record<WorkPhase, string>> = {
  READ_PAPER: 'First, find out which number belongs on the plates.',
  SET_STAMPS: 'Set the number stamps to match the paper.',
  HANDLE_BENT_PLATE: 'One corner is bent. Decide whether to straighten the plate, take another or stamp it as it is.',
  STAMP: 'You have set the number stamps. Use the hammer to mark the plate.',
  INSPECT: 'Look at the number on the plate. Can you read it clearly?',
  CORRECT: 'The plate moved under the stamps. Part of the number is too faint to read. You need to correct it before handing the plate in.',
  REVIEW: 'Check that the plates are ready to be sent for approval.',
  RETURN_PAPER: 'Take the work paper back to Guther.',
  COMPLETE: 'The work paper has been returned. Stage 3 is now ready for integration.'
};

export const ACTION_LABEL: Readonly<Record<PlateworkAction, string>> = {
  read_paper: 'Read the work paper.',
  set_stamps: 'Set the number stamps.',
  look_at_bent_plate: 'Look at the bent plate.',
  straighten: 'Straighten the corner.',
  replace: 'Put it aside. Take another.',
  stamp_as_is: 'Stamp it anyway.',
  stamp_number: 'Stamp the number.',
  check_number: 'Check the stamped number.',
  fix_mark: 'Fix the mark.',
  replace_marked_plate: 'Put the bad plate aside. Use another.',
  finish_checking: 'Finish checking the plates.',
  return_paper: 'Return the work paper.'
};

export function resultCopy(s: PlateworkState): string {
  switch (s.lastAction) {
    case 'read_paper': return 'You find the required worker number on the work paper. You will need to set the number stamps to match it.';
    case 'set_stamps': return 'The number is set. You pull a plate from the pile. One corner is bent, and the plate rocks when you press it against the bench.';
    case 'look_at_bent_plate': return 'One corner is out of shape. The plate rocks on the bench.';
    case 'straighten': return 'You work the corner flat against the bench. The plate sits steady now.';
    case 'replace': return 'You put the bent plate with the rejected pieces and take another from the workshop pile.';
    case 'stamp_as_is': return 'You leave the plate bent. One corner is still raised above the bench.';
    case 'stamp_number': return 'You strike the number stamps with the hammer. Their edges leave a number in the plate. You put the hammer down.';
    case 'check_number': return s.markQuality === 'POOR'
      ? 'The plate moved under the stamps. Part of the number is too faint to read. You need to correct it before handing the plate in.'
      : 'The number is clear. It matches the work paper.';
    case 'fix_mark': return 'You set the plate steady and stamp the weak part again. The number is clear enough now.';
    case 'replace_marked_plate': return 'You leave the bad plate with the rejected pieces and mark another from the workshop pile. This one is clear.';
    case 'finish_checking': return 'The plates are marked. The numbers can be read. The council has not approved the work yet.';
    case 'return_paper': return 'You hand the work paper back to Guther.';
    default: return 'The work paper lies open beside a pile of unmarked metal plates. Number stamps stand in a small rack. The hammer is beside them. The council has asked for a number on each plate.';
  }
}

export function observeObject(object: ObjectKey, state: PlateworkState): string {
  switch (object) {
    case 'paper':
      if (state.phase === 'HANDLE_BENT_PLATE') return 'You have already checked the number. One corner of the plate is bent.';
      if (state.phase === 'CORRECT') return 'The work paper contains the required number. You need to correct the mark on this plate.';
      return "The council's work order, with the number to stamp on each plate written on it.";
    case 'stamps': return 'Small metal tools with numbers cut into their ends. Workers arrange them and strike them with a hammer to stamp metal.';
    case 'plates':
      if (state.phase === 'HANDLE_BENT_PLATE') return 'One corner is out of shape. The plate rocks on the bench.';
      if (state.phase === 'CORRECT') return 'Part of the number is hard to read.';
      if (state.phase === 'REVIEW' || state.phase === 'RETURN_PAPER' || state.phase === 'COMPLETE') return 'The number is clear and matches the paper.';
      return 'Plain pieces of metal, ready for stamping.';
    case 'hammer':
      if (state.phase === 'READ_PAPER') return 'You have not checked which number the council ordered.';
      if (state.phase === 'SET_STAMPS') return 'You have not arranged the number stamps to match the work paper.';
      if (state.phase === 'HANDLE_BENT_PLATE') return 'You have not decided whether to straighten the bent plate, replace it or stamp it as it is.';
      if (state.phase === 'INSPECT') return 'You have stamped the number. Check the mark before striking again.';
      if (state.phase === 'RETURN_PAPER') return 'No further stamping is needed for this lot.';
      return 'A heavy hammer used to strike the number stamps against a metal plate.';
  }
}
