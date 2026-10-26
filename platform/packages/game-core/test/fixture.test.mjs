import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceFixture} from '../dist/index.js';
test('fixture advances exactly one revision per validated call', () => {
  const original = {revision: 0, value: 0};
  assert.deepEqual(advanceFixture(original), {revision: 1, value: 1});
  assert.deepEqual(original, {revision: 0, value: 0});
});
test('fixture rejects negative and noninteger values', () => {
  assert.throws(() => advanceFixture({revision: -1, value: 0}));
  assert.throws(() => advanceFixture({revision: 0.5, value: 0}));
});
