/** The M0 fixture contract has no economic or game effects. */
export type FixtureAction = {
  action: 'advance_fixture';
  requestId: string;
  expectedRevision: number;
};
export type FixtureSnapshot = {revision: number; value: number};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function parseFixtureAction(value: unknown): FixtureAction {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('invalid_body');
  const v = value as Record<string, unknown>;
  if (Object.keys(v).sort().join(',') !== 'action,expectedRevision,requestId') throw new Error('invalid_fields');
  if (v.action !== 'advance_fixture' || typeof v.requestId !== 'string' || !UUID.test(v.requestId)) throw new Error('invalid_action');
  if (!Number.isSafeInteger(v.expectedRevision) || (v.expectedRevision as number) < 0) throw new Error('invalid_revision');
  return {action: 'advance_fixture', requestId: v.requestId, expectedRevision: v.expectedRevision as number};
}

export {INITIAL_CHARACTER_SLOT_LIMIT, CHARACTER_ORIGINS, normalizeCharacterName, parseCreateCharacterCommand} from './character-creation.js';
export type {CharacterOrigin, CharacterSex, CreateCharacterCommand} from './character-creation.js';
