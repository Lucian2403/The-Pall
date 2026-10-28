/**
 * Initial character creation. Attributes and resources remain server-owned.
 * User-supplied portrait IDs are visual-only, origin-independent selections.
 */
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CHARACTER_NAME=/^\p{L}\p{M}*(?:\p{L}\p{M}*|[ '\u2019-]\p{L}\p{M}*)*$/u;
export const INITIAL_CHARACTER_SLOT_LIMIT=6;
export const CHARACTER_ORIGINS=['Millhand','Bellrunner','Squatter','Stitcher','Scrapper','Inkbound'] as const;
export type CharacterOrigin=(typeof CHARACTER_ORIGINS)[number];
export type CharacterSex='Male'|'Female';
export type CreateCharacterCommand=Readonly<{
  requestId:string;
  expectedRevision:number;
  name:string;
  nameKey:string;
  sex:CharacterSex;
  origin:CharacterOrigin;
  avatarId:string|null;
}>;
export function normalizeCharacterName(raw:unknown):{name:string;nameKey:string}{
  if(typeof raw!=='string')throw Error('invalid_name');
  const name=raw.trim().normalize('NFKC');
  const length=[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(name)].length;
  if(length<3||length>24||!CHARACTER_NAME.test(name))throw Error('invalid_name');
  return {name,nameKey:name.toLowerCase()};
}
export function parseCreateCharacterCommand(value:unknown):CreateCharacterCommand{
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('invalid_body');
  const v=value as Record<string,unknown>;
  const keys=Object.keys(v).sort().join(',');
  if(keys!=='avatarId,expectedRevision,name,origin,requestId,sex' &&
     keys!=='expectedRevision,name,origin,requestId,sex')throw Error('invalid_fields');
  if(typeof v.requestId!=='string'||!UUID.test(v.requestId))throw Error('invalid_request_id');
  if(!Number.isSafeInteger(v.expectedRevision)||(v.expectedRevision as number)<0)throw Error('invalid_revision');
  if(v.sex!=='Male'&&v.sex!=='Female')throw Error('invalid_sex');
  if(typeof v.origin!=='string'||!CHARACTER_ORIGINS.some(o=>o===v.origin))throw Error('invalid_origin');
  const avatarId=v.avatarId??null;
  if(avatarId!==null &&
     (typeof avatarId!=='string' ||
      !(v.sex==='Male'?/^male-0[1-8]$/:/^female-0[1-8]$/).test(avatarId)))
    throw Error('invalid_avatar');
  return {
    requestId:v.requestId,
    expectedRevision:v.expectedRevision as number,
    ...normalizeCharacterName(v.name),
    sex:v.sex,
    origin:v.origin as CharacterOrigin,
    avatarId:avatarId as string|null
  };
}
