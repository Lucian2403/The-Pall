import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCreateCharacterCommand, normalizeCharacterName, CHARACTER_ORIGINS, INITIAL_CHARACTER_SLOT_LIMIT} from '../dist/index.js';

const requestId = 'b3bc8b6f-b9c3-4f37-94eb-47b455c9a394';
const input = (extra = {}) => ({requestId, expectedRevision: 0, name: 'Evelyn Soot', sex: 'Female', origin: 'Millhand', ...extra});

test('M1.2 policy exposes exactly six starting origins and six slots', () => {
  assert.deepEqual(CHARACTER_ORIGINS, ['Millhand','Bellrunner','Squatter','Stitcher','Scrapper','Inkbound']);
  assert.equal(INITIAL_CHARACTER_SLOT_LIMIT, 6);
});
test('accepts valid origin/sex combinations and strips surrounding spaces', () => {
  for (const origin of CHARACTER_ORIGINS) for (const sex of ['Male', 'Female']) {
    const cmd = parseCreateCharacterCommand(input({origin, sex, name: '  Éloïse-Mary  '}));
    assert.equal(cmd.name, 'Éloïse-Mary');
    assert.equal(cmd.nameKey, 'éloïse-mary');
  }
});
test('NFKC and case normalize matching names', () => {
  assert.equal(normalizeCharacterName('  Ｅｖｅｌｙｎ  ').nameKey, normalizeCharacterName('evelyn').nameKey);
  assert.equal(normalizeCharacterName('O\u2019Brien').nameKey, 'o\u2019brien');
});
test('rejects invalid or unapproved character names', () => {
  for (const name of ['', 'Ab', 'X'.repeat(25), 'A  B', ' Al', 'A1b', '<script>', 'A_B', '   ']) {
    assert.throws(() => normalizeCharacterName(name), /invalid_name/, name);
  }
});
test('rejects client-injected grants and unexpected request fields', () => {
  for (const injected of [{coins: 10000}, {majorSkillBonuses: {Industry:999}}, {accountId: 'another-user'}]) {
    assert.throws(() => parseCreateCharacterCommand(input(injected)), /invalid_fields/);
  }
});
test('rejects missing, malformed, negative and fractional revisions', () => {
  assert.throws(() => parseCreateCharacterCommand(input({expectedRevision: -1})), /invalid_revision/);
  assert.throws(() => parseCreateCharacterCommand(input({expectedRevision: 1.5})), /invalid_revision/);
  assert.throws(() => parseCreateCharacterCommand(input({requestId: 'not-uuid'})), /invalid_request_id/);
  assert.throws(() => parseCreateCharacterCommand(input({origin: 'Invented'})), /invalid_origin/);
  assert.throws(() => parseCreateCharacterCommand(input({sex: 'Other'})), /invalid_sex/);
});

test('all six origins can select any one of eight shared portraits per sex',()=>{
  for(const origin of CHARACTER_ORIGINS)for(const sex of ['Male','Female'])
    for(let i=1;i<=8;i++){
      const avatarId=sex.toLowerCase()+'-'+String(i).padStart(2,'0');
      assert.equal(parseCreateCharacterCommand(input({origin,sex,avatarId})).avatarId,avatarId);
    }
});
test('rejects cross-sex, out-of-library and injected avatar IDs',()=>{
  for(const avatarId of ['male-00','female-09','../../bad','male-01.png','female-1','unapproved'])
    assert.throws(()=>parseCreateCharacterCommand(input({avatarId})),/invalid_avatar/);
  assert.throws(()=>parseCreateCharacterCommand(input({sex:'Male',avatarId:'female-01'})),/invalid_avatar/);
  assert.equal(parseCreateCharacterCommand(input()).avatarId,null);
});
