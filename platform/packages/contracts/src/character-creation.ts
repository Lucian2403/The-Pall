/**
 * M1.2 character-create request validation.
 * Implements owner-accepted initial six-slot / naming policy, never grants resources.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CHARACTER_NAME = /^\p{L}\p{M}*(?:\p{L}\p{M}*|[ '\u2019-]\p{L}\p{M}*)*$/u;
export const INITIAL_CHARACTER_SLOT_LIMIT = 6;
export const CHARACTER_ORIGINS = ['Millhand', 'Bellrunner', 'Squatter', 'Stitcher', 'Scrapper', 'Inkbound'] as const;
export type CharacterOrigin = (typeof CHARACTER_ORIGINS)[number];
export type CharacterSex = 'Male' | 'Female';
export type CreateCharacterCommand = Readonly<{
  requestId: string;
  expectedRevision: number;
  name: string;
  nameKey: string;
  sex: CharacterSex;
  origin: CharacterOrigin;
}>;

export function normalizeCharacterName(raw: unknown): {name: string; nameKey: string} {
  if (typeof raw !== 'string') throw new Error('invalid_name');
  const name = raw.trim().normalize('NFKC');
  const visibleLength = [...new Intl.Segmenter(undefined, {granularity: 'grapheme'}).segment(name)].length;
  if (visibleLength < 3 || visibleLength > 24 || !CHARACTER_NAME.test(name)) throw new Error('invalid_name');
  // NFKC and lowercase reduce full-width and case-only duplicates.
  // A full name-moderation/confusables policy remains a later launch gate.
  return {name, nameKey: name.toLowerCase()};
}

export function parseCreateCharacterCommand(value: unknown): CreateCharacterCommand {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid_body');
  const v = value as Record<string, unknown>;
  if (Object.keys(v).sort().join(',') !== 'expectedRevision,name,origin,requestId,sex') throw new Error('invalid_fields');
  if (typeof v.requestId !== 'string' || !UUID.test(v.requestId)) throw new Error('invalid_request_id');
  if (!Number.isSafeInteger(v.expectedRevision) || (v.expectedRevision as number) < 0) throw new Error('invalid_revision');
  if (v.sex !== 'Male' && v.sex !== 'Female') throw new Error('invalid_sex');
  if (typeof v.origin !== 'string' || !CHARACTER_ORIGINS.some(o => o === v.origin)) throw new Error('invalid_origin');
  return {
    requestId: v.requestId,
    expectedRevision: v.expectedRevision as number,
    ...normalizeCharacterName(v.name),
    sex: v.sex,
    origin: v.origin as CharacterOrigin
  };
}
