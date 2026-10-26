import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFixtureAction} from '../dist/index.js';

const valid = () => ({
  action: 'advance_fixture',
  requestId: '547bce11-9aa7-4ceb-8d09-caa26a985f21',
  expectedRevision: 0
});

test('accepts an exact technical-fixture command without client-specified state changes', () => {
  assert.deepEqual(parseFixtureAction(valid()), valid());
});

test('rejects malformed and missing command data', () => {
  for (const input of [null, [], {}, 'advance_fixture', {...valid(), action: 'add_coins'},
    {...valid(), expectedRevision: -1}, {...valid(), expectedRevision: 1.5},
    {...valid(), expectedRevision: '0'}, {...valid(), requestId: 'not-a-uuid'}]) {
    assert.throws(() => parseFixtureAction(input));
  }
});

test('rejects arbitrary client input such as balance, rewards and actor id', () => {
  for (const added of [{coins: 1000}, {actorId: 'someone-else'}, {xp: 99}, {outcome: 'victory'}]) {
    assert.throws(() => parseFixtureAction({...valid(), ...added}));
  }
});

test('does not mutate incoming commands', () => {
  const cmd = valid();
  const result = parseFixtureAction(cmd);
  assert.deepEqual(cmd, valid());
  assert.notEqual(result, cmd);
});
