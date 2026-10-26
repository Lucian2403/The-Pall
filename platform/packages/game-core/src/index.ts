/** Deterministic *technical fixture*; it does not grant coins/XP/items. */
export type FixtureState = Readonly<{revision: number; value: number}>;
export function advanceFixture(state: FixtureState): FixtureState {
  if (!Number.isSafeInteger(state.revision) || !Number.isSafeInteger(state.value)) throw new Error('invalid_fixture_state');
  if (state.revision < 0 || state.value < 0 || state.revision >= Number.MAX_SAFE_INTEGER || state.value >= Number.MAX_SAFE_INTEGER) throw new Error('invalid_fixture_state');
  return {revision: state.revision + 1, value: state.value + 1};
}
